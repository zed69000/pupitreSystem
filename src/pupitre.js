/*
 * ═══════════════════════════════════════════════════════════════════════════
 *  PUPITRE · moteur de musique des jeux de Seb (Web Audio, sans fichier audio)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   partition (données JS, quelques Ko)
 *        │
 *        ├──► 1 à 3 Web Workers (fils séparés du jeu)
 *        │      synthèse en JS pur, section par section, À L'AVANCE,
 *        │      sur l'appareil du joueur (une section répétée = fabriquée 1 fois)
 *        │            │  sons stéréo bruts, jamais compressés
 *        │            ▼
 *        │      fil audio : chaque section posée à l'échantillon près
 *        │      sur ctx.currentTime → couches → limiteur → sortie
 *        │
 *        └──► beatmap() / grille() : même partition, mêmes temps
 *               (swing et humanisation déterministes) → toujours synchro
 *
 *  POURQUOI CE CHOIX
 *  - Build légère : aucun fichier audio, seulement ce code et la partition.
 *  - Qualité d'origine : rien n'est compressé (le pré-bake en mp3/ogg dégradait le son).
 *  - Le jeu ne ralentit pas : la synthèse tourne hors du fil principal ; le fil
 *    audio ne fait que lire des tampons, le travail le moins cher qui soit.
 *  - Aucun nœud Web Audio par note : 60 voix d'orchestre ne font pas craquer
 *    un vieux téléphone, et pas de ramasse-miettes en pleine partie.
 *  - charger() ne rend la main que quand la lecture peut aller jusqu'au bout
 *    sans attendre : la vitesse est mesurée sur l'appareil, marge ×1,5.
 *  - Si une section arrive quand même en retard, elle démarre en cours de
 *    route au bon endroit : l'horloge du morceau (et donc la beatmap) ne
 *    glisse jamais.
 *
 *  UTILISATION (jeu)
 *    const ctx = new AudioContext({ latencyHint: 'interactive' });
 *    const pupitre = new Pupitre(ctx);
 *    await pupitre.charger(partition, { onProgres: s => ... });   // s = stats
 *    const notes = pupitre.beatmap(n => n.instr === 'caisse');    // [{t, instr, ...}]
 *    pupitre.jouer();                                              // sur un geste du joueur
 *    const t = pupitre.position();          // secondes du morceau, telles qu'ENTENDUES
 *    const tTap = pupitre.tempsA(ev.timeStamp);   // instant d'un tap, même échelle
 *    pupitre.groupe('cuivres', 0, 1.5);    // couches (si partition.pistes = true)
 *
 *  PARTITION
 *    { bpm, sig: [4,4], swing: 0.5, swingSur: 16, humain: 6 (ms), graine: 1,
 *      salle: { taille, amorti, niveau, predelai, largeur },
 *      pistes: false,               // true = une piste par groupe (musique adaptative)
 *      boucle: false,               // true = la forme tourne sans fin
 *      instruments: { nom: { type: 'violons', vol, pan, verb, groupe, ...réglages } },
 *      sections: { A: { mesures: 8, bpm?, sig?, swing?, humain?,
 *                       notes: [[instr, mesure, pas, midi, durée en pas, vélocité, tag?], ...] } },
 *      forme: ['intro', 'A', 'B', 'A', 'fin'] }
 *    pas = double croche (16 par mesure en 4/4) ; fractions permises (triolets).
 *    bpm compte toujours des noires.
 */

function NOYAU() {
  'use strict';
  const TAU = 6.283185307179586, TN = 4096, SIN = new Float32Array(TN + 1);
  for (let i = 0; i <= TN; i++) SIN[i] = Math.sin(TAU * i / TN);
  const sn = p => { const x = p * TN, i = x | 0; return SIN[i] + (SIN[i + 1] - SIN[i]) * (x - i); };   // p dans [0,1)
  const snw = p => sn(p - Math.floor(p));
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const sat = x => x / (1 + Math.abs(x));
  const dec = (t, sr) => Math.exp(-1 / Math.max(1, t * sr));      // coefficient de décroissance (constante de temps t)
  const maintenant = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function blep(t, dt) { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; }

  class Bruit { constructor(s) { this.s = (s | 0) || 0x2545F491; } n() { let x = this.s; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; this.s = x; return (x | 0) / 2147483648; } }

  // Enveloppe ADSR : attaque linéaire, chute et relâche exponentielles (constantes de temps)
  class Env {
    constructor(sr, a, d, s, r, off) { this.v = 0; this.st = 0; this.n = 0; this.ai = 1 / Math.max(1, a * sr); this.dc = dec(d, sr); this.s = s; this.rc = dec(r, sr); this.off = off; }
    next() {
      if (this.n++ >= this.off && this.st < 3) this.st = 3;
      if (this.st === 0) { this.v += this.ai; if (this.v >= 1) { this.v = 1; this.st = 1; } }
      else if (this.st === 1) this.v = this.s + (this.v - this.s) * this.dc;
      else this.v *= this.rc;
      return this.v;
    }
    fini() { return this.v < 2e-4 && (this.st === 3 || (this.st === 1 && this.s === 0)); }
  }

  // Filtre à variables d'état (topologie TPT) : stable même quand la coupure bouge
  class SVF {
    constructor() { this.ic1 = 0; this.ic2 = 0; this.a1 = 1; this.a2 = 0; this.a3 = 0; this.k = 1.4; this.b = 0; }
    set(sr, fc, q) { const g = Math.tan(Math.PI * clamp(fc, 16, sr * 0.45) / sr); this.k = 1 / q; this.a1 = 1 / (1 + g * (g + this.k)); this.a2 = g * this.a1; this.a3 = g * this.a2; return this; }
    lp(x) { const v3 = x - this.ic2, v1 = this.a1 * this.ic1 + this.a2 * v3, v2 = this.ic2 + this.a2 * this.ic1 + this.a3 * v3; this.ic1 = 2 * v1 - this.ic1; this.ic2 = 2 * v2 - this.ic2; this.b = v1; return v2; }
    bp(x) { this.lp(x); return this.b; }
    hp(x) { const l = this.lp(x); return x - this.k * this.b - l; }
  }

  // ─── Voix de base ──────────────────────────────────────────────────────────
  class Voix {
    constructor(I, e, sr, idx) {
      this.sr = sr; this.I = I; this.f = mtof(e.midi + (I.transpo || 0)); this.vel = e.vel;
      this.off = Math.max(1, Math.round(e.dur * sr));
      const pan = clamp((I.pan || 0) + (I.etale ? (((idx * 0.618034) % 1) - 0.5) * I.etale : 0), -1, 1), a = (pan + 1) * Math.PI / 4;
      const g = (I.vol ?? 0.5) * Math.pow(e.vel, I.courbe ?? 1.4);
      this.gl = Math.cos(a) * g * 1.4142; this.gr = Math.sin(a) * g * 1.4142; this.gs = g * (I.verb ?? 0.2);
      this.bz = new Bruit(Math.imul(idx + 1, 2654435761) ^ hashStr(e.instr));
      this.g = 1; this.gd = 1; this.env = null;
    }
    // Coupe la voix en 6 ms (étouffement d'un charley ouvert, vol de voix)
    couper() { if (this.env) { this.env.off = Math.min(this.env.off, this.env.n); this.env.rc = dec(0.006, this.sr); } else this.gd = dec(0.006, this.sr); }
  }

  // Piano électrique type Rhodes : FM 1:1, index qui suit la vélocité, clochette d'attaque, trémolo stéréo
  class Rhodes extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, f = this.f;
      this.env = new Env(sr, 0.002, (I.tenue ?? 2.2) * clamp(1.6 - (e.midi - 48) / 48, 0.5, 1.6), 0, I.relache ?? 0.08, this.off);
      this.pc = 0; this.pm = 0; this.dt = f / sr; this.ix = (0.5 + 1.7 * v) * (e.midi > 70 ? 0.6 : 1); this.ixf = 0.15; this.ixd = dec(0.3, sr);
      this.pt = 0; this.dtt = Math.min(0.45, f * 7 / sr); this.tn = 0.3 * v; this.tnd = dec(0.02, sr);
      this.tdt = 4.6 / sr; this.tp = I.tremolo ?? 0.22;
    }
    render(L, R, S, a, b) {
      const E = this.env, gl = this.gl, gr = this.gr, gs = this.gs, dt = this.dt, dtt = this.dtt, tr = this.tdt, tp = this.tp;
      for (let i = a; i < b; i++) {
        const e = E.next();
        const m = sn(this.pm); this.pm += dt; if (this.pm >= 1) this.pm -= 1;
        const c = snw(this.pc + this.ix * m * 0.159155); this.pc += dt; if (this.pc >= 1) this.pc -= 1;
        this.ix = this.ixf + (this.ix - this.ixf) * this.ixd;
        const t2 = sn(this.pt) * this.tn; this.tn *= this.tnd; this.pt += dtt; if (this.pt >= 1) this.pt -= 1;
        const x = (c + t2) * e * 0.5, t = sn((i * tr) % 1) * tp;
        L[i] += x * gl * (1 + t); R[i] += x * gr * (1 - t); S[i] += x * gs;
      }
      return !E.fini();
    }
  }

  // Piano : 7 partiels légèrement inharmoniques, aigus qui meurent plus vite, double chute, marteau
  class Piano extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, f = this.f;
      this.env = new Env(sr, 0.001, 30, 1, I.relache ?? 0.1, this.off);
      const base = clamp(5 * Math.pow(220 / f, 0.6), 0.5, 9) * (I.tenue ?? 1);
      this.ph = new Float64Array(7); this.dts = new Float64Array(7); this.am = new Float64Array(7); this.dc = new Float64Array(7); let k = 0;
      for (let n = 1; n <= 7; n++) { const fn = n * f * Math.sqrt(1 + 0.00025 * n * n); if (fn > sr * 0.45) break; this.ph[k] = this.bz.n() * 0.5 + 0.5; this.dts[k] = fn / sr; this.am[k] = Math.pow(n, -(1.7 - 0.9 * v)); this.dc[k] = dec(base / (1 + 0.7 * (n - 1)), sr); k++; }
      this.k = k; this.fast = 1; this.fastd = dec(0.25, sr); this.ham = 0.25 * v; this.hamd = dec(0.004, sr); this.hz = 0;
    }
    render(L, R, S, a, b) {
      const E = this.env, k = this.k, ph = this.ph, dts = this.dts, am = this.am, dc = this.dc;
      for (let i = a; i < b; i++) {
        const e = E.next(); let x = 0;
        for (let j = 0; j < k; j++) { x += sn(ph[j]) * am[j]; am[j] *= dc[j]; ph[j] += dts[j]; if (ph[j] >= 1) ph[j] -= 1; }
        this.fast *= this.fastd; x *= 0.55 + 0.45 * this.fast;
        this.hz += 0.3 * (this.bz.n() - this.hz); x += this.hz * this.ham; this.ham *= this.hamd;
        x *= e * 0.45; L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return !(E.fini() || am[0] < 2e-4);
    }
  }

  // Basse ronde ou funky : scie filtrée (le « wah » de chaque note) + sinus, saturation douce
  // pour que les harmoniques la rendent audible sur un haut-parleur de téléphone
  class Basse extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, f = this.f;
      this.env = new Env(sr, 0.003, I.tenue ?? 0.5, I.soutien ?? 0.45, I.relache ?? 0.03, this.off);
      this.p = 0; this.dt = f / sr; this.fl = new SVF();
      this.fc0 = f * 2 + (I.brillance ?? 1) * (300 + 1500 * v); this.fc1 = f * 1.5 + 180; this.ft = I.wah ?? 0.12; this.q = I.q ?? 1.6; this.drive = I.drive ?? 1.8; this.sub = I.sub ?? 0.8;
    }
    render(L, R, S, a, b) {
      const E = this.env, t = E.n / this.sr, dt = this.dt;
      this.fl.set(this.sr, this.fc1 + (this.fc0 - this.fc1) * Math.exp(-t / this.ft), this.q);
      for (let i = a; i < b; i++) {
        const e = E.next(), p = this.p, s = 2 * p - 1 - blep(p, dt);
        this.p = p + dt >= 1 ? p + dt - 1 : p + dt;
        const x = sat((this.fl.lp(s) * 0.6 + sn(this.p) * this.sub) * e * this.drive) * 0.7;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return !E.fini();
    }
  }

  // Corde pincée (Karplus-Strong) : pizzicato, harpe, guitare, contrebasse pizz
  class Corde extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, f = this.f;
      const c = clamp((I.clarte ?? 0.5) * (0.6 + 0.4 * v), 0.05, 0.95); this.c = c;
      let d = sr / f - (1 - c) / c; if (d < 2) d = 2; this.d = d;
      this.N = Math.ceil(d) + 4; this.buf = new Float32Array(this.N); this.z = 0;
      this.loss = Math.pow(0.001, 1 / (f * (I.tenue ?? 1.5)));
      const n0 = Math.ceil(d), lpc = 0.15 + 0.75 * v; let y = 0, m = 0;
      for (let i = 0; i < n0; i++) { y += lpc * (this.bz.n() - y); this.buf[i] = y; m += y; }
      m /= n0; for (let i = 0; i < n0; i++) this.buf[i] -= m;
      this.w = n0 % this.N;
      this.env = new Env(sr, 0.0005, 1e4, 1, I.etouffe ?? 0.06, this.off); this.vie = Math.ceil(sr * (I.tenue ?? 1.5) * 1.1);
    }
    render(L, R, S, a, b) {
      const buf = this.buf, N = this.N, d = this.d, c = this.c, loss = this.loss, E = this.env;
      for (let i = a; i < b; i++) {
        const e = E.next(); let r = this.w - d; if (r < 0) r += N;
        const r0 = r | 0, fr = r - r0, r1 = r0 + 1 === N ? 0 : r0 + 1, y = buf[r0] + (buf[r1] - buf[r0]) * fr;
        this.z += c * (y - this.z); buf[this.w] = this.z * loss; this.w = this.w + 1 === N ? 0 : this.w + 1;
        const x = y * e * 0.9; L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return !(E.fini() || E.n > this.vie);
    }
  }

  // Pupitre de cordes : 3 scies désaccordées (gauche, droite, centre), filtre qui s'ouvre à l'attaque,
  // vibrato qui arrive après l'attaque comme chez un vrai violoniste
  class Cordes extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, f = this.f, R0 = rng(idx * 7919 + 13);
      const att = (I.attaque ?? 0.2) * (1.25 - 0.5 * v); this.att = att;
      this.env = new Env(sr, att, I.chute ?? 0.8, I.soutien ?? 0.8, I.relache ?? 0.25, this.off);
      const det = I.desaccord ?? 8; this.dt = new Float64Array([-1, 1, 0].map(k => f * Math.pow(2, (k * det + (R0() - 0.5) * 4) / 1200) / sr));
      this.p = new Float64Array([R0(), R0(), R0()]);
      this.fl = new SVF(); this.fr = new SVF(); this.fc = clamp(f * (I.clarte ?? 4) + 1500 * v, 500, 9000);
      this.vr = (5.2 + R0() * 0.8) / sr; this.vp = R0(); this.vd = (I.vibrato ?? 0.12) * 0.0578; this.vdel = I.vibratoApres ?? 0.3;
    }
    render(L, R, S, a, b) {
      const sr = this.sr, E = this.env, t = E.n / sr, br = 0.6 + 0.4 * Math.min(1, t / Math.max(this.att, 0.01));
      this.fl.set(sr, this.fc * br, 0.7); this.fr.set(sr, this.fc * br * 1.04, 0.7);
      const va = this.vd * clamp((t - this.vdel) / 0.5, 0, 1), dt = this.dt, p = this.p;
      for (let i = a; i < b; i++) {
        const e = E.next(), vib = 1 + va * sn(this.vp); this.vp += this.vr; if (this.vp >= 1) this.vp -= 1;
        let d = dt[0] * vib, q = p[0]; const s0 = 2 * q - 1 - blep(q, d); p[0] = q + d >= 1 ? q + d - 1 : q + d;
        d = dt[1] * vib; q = p[1]; const s1 = 2 * q - 1 - blep(q, d); p[1] = q + d >= 1 ? q + d - 1 : q + d;
        d = dt[2] * vib; q = p[2]; const s2 = 2 * q - 1 - blep(q, d); p[2] = q + d >= 1 ? q + d - 1 : q + d;
        const xl = this.fl.lp(s0 + 0.6 * s2) * e * 0.3, xr = this.fr.lp(s1 + 0.6 * s2) * e * 0.3;
        L[i] += xl * this.gl; R[i] += xr * this.gr; S[i] += (xl + xr) * 0.5 * this.gs;
      }
      return !E.fini();
    }
  }

  // Cuivres : le filtre s'ouvre avec le souffle (le « blat »), petite montée de hauteur à l'attaque,
  // plus brillant et plus saturé quand on joue fort
  class Cuivres extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, f = this.f, R0 = rng(idx * 104729 + 7);
      this.env = new Env(sr, (I.attaque ?? 0.04) * (1.3 - 0.6 * v), I.chute ?? 0.4, I.soutien ?? 0.75, I.relache ?? 0.08, this.off);
      const det = I.desaccord ?? 5; this.dt = new Float64Array([f * Math.pow(2, -det / 1200) / sr, f * Math.pow(2, det / 1200) / sr]); this.p = new Float64Array([R0(), R0()]);
      this.fl = new SVF(); this.k = (I.clarte ?? 1) * (1.5 + 6 * v * v); this.drive = 1 + 1.5 * v;
      this.vr = (5 + R0()) / sr; this.vp = 0; this.vd = (I.vibrato ?? 0.07) * 0.0578;
    }
    render(L, R, S, a, b) {
      const sr = this.sr, E = this.env, t = E.n / sr;
      const blat = (1 - Math.exp(-t / 0.025)) * (0.6 + 0.4 * Math.exp(-t / 0.3));
      this.fl.set(sr, clamp(this.f * (1.2 + this.k * blat * (0.5 + 0.5 * E.v)), 150, 12000), 0.9);
      const sc = Math.pow(2, -0.4 * Math.exp(-t / 0.035) / 12), va = this.vd * clamp((t - 0.4) / 0.5, 0, 1), dt = this.dt, p = this.p;
      for (let i = a; i < b; i++) {
        const e = E.next(), m = sc * (1 + va * sn(this.vp)); this.vp += this.vr; if (this.vp >= 1) this.vp -= 1;
        let d = dt[0] * m, q = p[0]; const s0 = 2 * q - 1 - blep(q, d); p[0] = q + d >= 1 ? q + d - 1 : q + d;
        d = dt[1] * m; q = p[1]; const s1 = 2 * q - 1 - blep(q, d); p[1] = q + d >= 1 ? q + d - 1 : q + d;
        const x = sat(this.fl.lp(s0 + s1) * this.drive * 0.6) * e * 0.45;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return !E.fini();
    }
  }

  // Bois : harmoniques choisies (flûte, clarinette, hautbois), souffle filtré, petit « chiff » d'attaque
  class Bois extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, f = this.f;
      this.env = new Env(sr, I.attaque ?? 0.05, I.chute ?? 0.6, I.soutien ?? 0.85, I.relache ?? 0.1, this.off);
      this.h = (I.harmoniques || [1, 0.22, 0.07]).filter((x, k) => f * (k + 1) < sr * 0.45); this.p = 0; this.dt = f / sr;
      this.fb = new SVF().set(sr, clamp(f * 2, 300, 6000), 1.5); this.sf = I.souffle ?? 0.05; this.ch = 0.25 * v; this.chd = dec(0.03, sr);
      this.vr = 5 / sr; this.vp = 0; this.vd = (I.vibrato ?? 0.1) * 0.0578;
      let s = 0; for (const x of this.h) s += Math.abs(x); this.norm = 0.55 / s;
    }
    render(L, R, S, a, b) {
      const E = this.env, t = E.n / this.sr, va = this.vd * clamp((t - 0.35) / 0.5, 0, 1), h = this.h, nh = h.length;
      for (let i = a; i < b; i++) {
        const e = E.next(), vib = sn(this.vp); this.vp += this.vr; if (this.vp >= 1) this.vp -= 1;
        this.p += this.dt * (1 + va * vib); if (this.p >= 1) this.p -= 1;
        let x = 0; for (let k = 0; k < nh; k++) if (h[k]) x += h[k] * snw(this.p * (k + 1));
        const nz = this.fb.bp(this.bz.n());
        x = (x * this.norm * (1 + va * 2 * vib) + nz * (this.sf + this.ch)) * e; this.ch *= this.chd;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return !E.fini();
    }
  }

  // Percussions accordées par modes : glockenspiel, célesta, marimba, xylophone, cloches tubulaires
  class Cloche extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, f = this.f, modes = I.modes || [[1, 1, 1.4], [2.76, 0.45, 0.5], [5.4, 0.25, 0.22], [8.93, 0.12, 0.1]];
      const ten = (I.tenue ?? 1) * clamp(Math.pow(880 / f, 0.35), 0.5, 2);
      this.ph = []; this.dts = []; this.am = []; this.dc = [];
      for (const [r, a, d] of modes) { if (r * f > sr * 0.45) continue; this.ph.push(0); this.dts.push(r * f / sr); this.am.push(a * (r === 1 ? 1 : 0.35 + 0.65 * v) * 0.5); this.dc.push(dec(d * ten, sr)); }
      this.k = this.ph.length; this.env = new Env(sr, 0.0005, 1e4, 1, I.etouffe ?? 30, this.off);
    }
    render(L, R, S, a, b) {
      const E = this.env, k = this.k, ph = this.ph, dts = this.dts, am = this.am, dc = this.dc;
      for (let i = a; i < b; i++) {
        const e = E.next(); let x = 0;
        for (let j = 0; j < k; j++) { x += sn(ph[j]) * am[j]; am[j] *= dc[j]; ph[j] += dts[j]; if (ph[j] >= 1) ph[j] -= 1; }
        x *= e; L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      let vivant = false; for (let j = 0; j < k; j++) if (am[j] > 1e-4) { vivant = true; break; }
      return vivant && !E.fini();
    }
  }

  // Chœur : 3 scies désaccordées passées dans les formants d'une voyelle (fixes, comme une vraie voix)
  const VOYELLES = { a: [[700, 1, 8], [1150, 0.5, 10], [2800, 0.12, 14]], o: [[430, 1, 7], [800, 0.35, 9], [2600, 0.08, 14]], ou: [[330, 1, 6], [750, 0.25, 9], [2400, 0.05, 14]], e: [[460, 1, 7], [1650, 0.35, 12], [2500, 0.15, 14]], i: [[300, 1, 6], [2200, 0.25, 14], [3000, 0.15, 16]] };
  class Choeur extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const f = this.f, R0 = rng(idx * 31337 + 3);
      this.env = new Env(sr, I.attaque ?? 0.3, I.chute ?? 1, I.soutien ?? 0.9, I.relache ?? 0.4, this.off);
      const det = I.desaccord ?? 12; this.dt = new Float64Array([-1, 0, 1].map(k => f * Math.pow(2, (k * det + (R0() - 0.5) * 6) / 1200) / sr)); this.p = new Float64Array([R0(), R0(), R0()]);
      this.fo = (VOYELLES[I.voyelle] || VOYELLES.a).map(([fc, g, q]) => ({ f: new SVF().set(sr, fc, q), g }));
      this.vr = (5.3 + R0() * 0.5) / sr; this.vp = R0(); this.vd = (I.vibrato ?? 0.15) * 0.0578;
    }
    render(L, R, S, a, b) {
      const E = this.env, t = E.n / this.sr, va = this.vd * clamp((t - 0.25) / 0.5, 0, 1), dt = this.dt, p = this.p, fo = this.fo;
      for (let i = a; i < b; i++) {
        const e = E.next(), vib = 1 + va * sn(this.vp); this.vp += this.vr; if (this.vp >= 1) this.vp -= 1;
        let s = 0;
        for (let k = 0; k < 3; k++) { const d = dt[k] * vib, q = p[k]; s += 2 * q - 1 - blep(q, d); p[k] = q + d >= 1 ? q + d - 1 : q + d; }
        const x = (fo[0].f.bp(s) * fo[0].g + fo[1].f.bp(s) * fo[1].g + fo[2].f.bp(s) * fo[2].g) * e * 0.13;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return !E.fini();
    }
  }

  // Nappe de synthé (pour les styles non orchestraux) : 2 scies, filtre qui respire lentement
  class Nappe extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const f = this.f, R0 = rng(idx * 6113 + 5);
      this.env = new Env(sr, I.attaque ?? 0.6, I.chute ?? 2, I.soutien ?? 0.8, I.relache ?? 0.8, this.off);
      this.dt = new Float64Array([f * Math.pow(2, -7 / 1200) / sr, f * Math.pow(2, 7 / 1200) / sr]); this.p = new Float64Array([R0(), R0()]);
      this.fl = new SVF(); this.fr = new SVF(); this.fc = clamp(f * (I.clarte ?? 3), 300, 6000); this.lf = R0();
    }
    render(L, R, S, a, b) {
      const sr = this.sr, m = 0.75 + 0.25 * Math.sin(TAU * (this.env.n / sr * 0.15 + this.lf));
      this.fl.set(sr, this.fc * m, 0.9); this.fr.set(sr, this.fc * m * 1.07, 0.9); const E = this.env, dt = this.dt, p = this.p;
      for (let i = a; i < b; i++) {
        const e = E.next();
        let q = p[0]; const s0 = 2 * q - 1 - blep(q, dt[0]); p[0] = q + dt[0] >= 1 ? q + dt[0] - 1 : q + dt[0];
        q = p[1]; const s1 = 2 * q - 1 - blep(q, dt[1]); p[1] = q + dt[1] >= 1 ? q + dt[1] - 1 : q + dt[1];
        const xl = this.fl.lp(s0) * e * 0.3, xr = this.fr.lp(s1) * e * 0.3;
        L[i] += xl * this.gl; R[i] += xr * this.gr; S[i] += (xl + xr) * 0.5 * this.gs;
      }
      return !E.fini();
    }
  }

  // ─── Percussions ───────────────────────────────────────────────────────────
  // Kick : sinus qui chute + clic, saturé pour exister sur téléphone
  class Kick extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); this.p = 0; this.f1 = I.f1 ?? 48; this.df = (I.f0 ?? 120) - this.f1; this.pd = dec(I.chute ?? 0.04, sr);
      this.am = 1; this.ad = dec(I.tenue ?? 0.22, sr); this.ck = I.clic ?? 0.35; this.ckd = dec(0.003, sr); this.drive = I.drive ?? 2; this.at = Math.max(1, 0.001 * sr); this.n = 0;
    }
    render(L, R, S, a, b) {
      const sr = this.sr;
      for (let i = a; i < b; i++) {
        this.p += (this.f1 + this.df) / sr; if (this.p >= 1) this.p -= 1; this.df *= this.pd;
        const at = this.n < this.at ? this.n / this.at : 1; this.n++;
        let x = sat(sn(this.p) * this.am * at * this.drive) * 0.8 + this.bz.n() * this.ck; this.am *= this.ad; this.ck *= this.ckd;
        x *= this.g; this.g *= this.gd;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return this.am > 1e-4 && this.g > 1e-4;
    }
  }

  // Caisse claire : corps à deux modes + timbre (bruit passe-haut) ; la ghost note = vélocité basse
  class Caisse extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, t = I.ton ?? 185;
      this.p1 = 0; this.p2 = 0; this.d1 = t / sr; this.d2 = t * 1.78 / sr; this.a1 = 0.55; this.a2 = 0.3; this.ad1 = dec(0.06, sr); this.ad2 = dec(0.04, sr);
      this.nz = I.bruit ?? 0.7; this.nd = dec((I.timbre ?? 0.14) * (0.6 + 0.4 * v), sr); this.fh = new SVF().set(sr, I.fc ?? 1800, 0.7); this.at = Math.max(1, 0.0005 * sr); this.n = 0;
    }
    render(L, R, S, a, b) {
      for (let i = a; i < b; i++) {
        const at = this.n < this.at ? this.n / this.at : 1; this.n++;
        let x = sn(this.p1) * this.a1 + sn(this.p2) * this.a2 + this.fh.hp(this.bz.n()) * this.nz;
        this.p1 += this.d1; if (this.p1 >= 1) this.p1 -= 1; this.p2 += this.d2; if (this.p2 >= 1) this.p2 -= 1;
        this.a1 *= this.ad1; this.a2 *= this.ad2; this.nz *= this.nd;
        x = sat(x * at * 1.4) * this.g; this.g *= this.gd;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return this.nz > 1e-4 && this.g > 1e-4;
    }
  }

  // Métaux (charley, crash, ride) : 6 carrés inharmoniques + bruit, passe-bande puis passe-haut
  const RATIOS = [2, 3, 4.16, 5.43, 6.79, 8.21];
  class Metal extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, base = I.base ?? 400;
      this.ph = new Float64Array(6); this.dt = new Float64Array(6); RATIOS.forEach((r, k) => { this.dt[k] = r * base / sr; this.ph[k] = (this.bz.n() + 1) / 2; });
      this.fb = new SVF().set(sr, I.fc ?? 10000, 1.2); this.fh = new SVF().set(sr, I.hp ?? 7000, 0.7);
      this.am = 1; this.ad = dec((I.tenue ?? 0.05) * (0.7 + 0.3 * v), sr); this.nz = I.bruit ?? 0.3; this.at = Math.max(1, (I.attaque ?? 0.0005) * sr); this.n = 0;
    }
    render(L, R, S, a, b) {
      const ph = this.ph, dt = this.dt;
      for (let i = a; i < b; i++) {
        let s = 0; for (let k = 0; k < 6; k++) { s += ph[k] < 0.5 ? 1 : -1; ph[k] += dt[k]; if (ph[k] >= 1) ph[k] -= 1; }
        const at = this.n < this.at ? this.n / this.at : 1; this.n++;
        let x = this.fh.hp(this.fb.bp(s * 0.25 + this.bz.n() * this.nz)) * this.am * at * 1.6; this.am *= this.ad;
        x *= this.g; this.g *= this.gd;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return this.am > 1e-4 && this.g > 1e-4;
    }
  }

  // Clap : 3 rafales espacées de 11 ms puis une queue
  class Clap extends Voix {
    constructor(I, e, sr, idx) { super(I, e, sr, idx); this.fb = new SVF().set(sr, I.fc ?? 1200, 1.2); this.n = 0; this.tq = I.tenue ?? 0.12; }
    render(L, R, S, a, b) {
      const sr = this.sr;
      for (let i = a; i < b; i++) {
        const t = this.n++ / sr, k = Math.min(2, Math.floor(t / 0.011)), sp = Math.exp(-(t - k * 0.011) / 0.005), tl = t > 0.022 ? 0.6 * Math.exp(-(t - 0.022) / this.tq) : 0;
        let x = this.fb.bp(this.bz.n()) * Math.max(sp, tl) * 2.2 * this.g; this.g *= this.gd;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return this.n < sr * (0.03 + this.tq * 9) && this.g > 1e-4;
    }
  }

  // Tom : sinus qui descend vers la note + attaque de bruit
  class Tom extends Voix {
    constructor(I, e, sr, idx) { super(I, e, sr, idx); this.p = 0; this.df = this.f * 0.5; this.pd = dec(0.04, sr); this.am = 1; this.ad = dec(I.tenue ?? 0.28, sr); this.nz = 0.3 * e.vel; this.nd = dec(0.008, sr); }
    render(L, R, S, a, b) {
      const sr = this.sr;
      for (let i = a; i < b; i++) {
        this.p += (this.f + this.df) / sr; if (this.p >= 1) this.p -= 1; this.df *= this.pd;
        let x = sat((sn(this.p) * this.am + this.bz.n() * this.nz) * 1.5) * this.g; this.am *= this.ad; this.nz *= this.nd; this.g *= this.gd;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return this.am > 1e-4 && this.g > 1e-4;
    }
  }

  // Timbales : modes d'une timbale accordée (presque harmoniques) + mailloche feutrée
  class Timbale extends Voix {
    constructor(I, e, sr, idx) {
      super(I, e, sr, idx); const v = e.vel, f = this.f, ten = I.tenue ?? 1;
      const M = [[1, 1, 1.4], [1.5, 0.55, 0.9], [1.98, 0.4, 0.7], [2.44, 0.22, 0.45], [2.98, 0.12, 0.3]];
      this.ph = new Float64Array(5); this.dts = new Float64Array(5); this.am = new Float64Array(5); this.dc = new Float64Array(5);
      M.forEach(([r, a, d], k) => { this.dts[k] = r * f / sr; this.am[k] = a * (k ? 0.5 + 0.5 * v : 1); this.dc[k] = dec(d * ten, sr); });
      this.gl2 = 1; this.fn = new SVF().set(sr, 700, 0.7); this.nz = 0.6 * v; this.nd = dec(0.012, sr); this.n = 0;
    }
    render(L, R, S, a, b) {
      const ph = this.ph, dts = this.dts, am = this.am, dc = this.dc, gl = 1 + 0.02 * Math.exp(-this.n / this.sr / 0.05);
      for (let i = a; i < b; i++) {
        let x = 0; for (let k = 0; k < 5; k++) { x += sn(ph[k]) * am[k]; am[k] *= dc[k]; ph[k] += dts[k] * gl; if (ph[k] >= 1) ph[k] -= 1; }
        x = sat((x * 0.6 + this.fn.lp(this.bz.n()) * this.nz) * 1.3) * this.g; this.nz *= this.nd; this.g *= this.gd; this.n++;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return am[0] > 1e-4 && this.g > 1e-4;
    }
  }

  // Grosse caisse d'orchestre : boum grave et long + souffle grave, doublé d'un mode plus haut pour le téléphone
  class GrosseCaisse extends Voix {
    constructor(I, e, sr, idx) { super(I, e, sr, idx); this.p = 0; this.p2 = 0; this.df = 14; this.pd = dec(0.06, sr); this.am = 1; this.ad = dec(I.tenue ?? 0.6, sr); this.a2 = 0.4; this.ad2 = dec(0.15, sr); this.fn = new SVF().set(sr, 180, 0.7); this.nz = 0.7; this.nd = dec(0.08, sr); }
    render(L, R, S, a, b) {
      const sr = this.sr;
      for (let i = a; i < b; i++) {
        const f = 46 + this.df; this.df *= this.pd; this.p += f / sr; if (this.p >= 1) this.p -= 1; this.p2 += f * 1.6 / sr; if (this.p2 >= 1) this.p2 -= 1;
        let x = sat((sn(this.p) * this.am + sn(this.p2) * this.a2 + this.fn.lp(this.bz.n()) * this.nz) * 1.8) * 0.8 * this.g;
        this.am *= this.ad; this.a2 *= this.ad2; this.nz *= this.nd; this.g *= this.gd;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return this.am > 1e-4 && this.g > 1e-4;
    }
  }

  // Shaker : souffle aigu avec une attaque douce
  class Shaker extends Voix {
    constructor(I, e, sr, idx) { super(I, e, sr, idx); this.fh = new SVF().set(sr, 6000, 0.8); this.n = 0; this.at = 0.008 * sr; this.ad = dec(I.tenue ?? 0.05, sr); this.am = 1; }
    render(L, R, S, a, b) {
      for (let i = a; i < b; i++) {
        const at = this.n < this.at ? this.n / this.at : 1; this.n++; if (at >= 1) this.am *= this.ad;
        const x = this.fh.hp(this.bz.n()) * at * this.am * this.g; this.g *= this.gd;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return this.am > 1e-4 && this.g > 1e-4;
    }
  }

  // Rim / bloc de bois : deux modes très courts + clic
  class Rim extends Voix {
    constructor(I, e, sr, idx) { super(I, e, sr, idx); const b = I.ton ?? 1700; this.p1 = 0; this.p2 = 0; this.d1 = b / sr; this.d2 = b * 0.49 / sr; this.am = 1; this.ad = dec(I.tenue ?? 0.014, sr); this.ck = 0.4; this.ckd = dec(0.0015, sr); }
    render(L, R, S, a, b) {
      for (let i = a; i < b; i++) {
        let x = (sn(this.p1) * 0.6 + sn(this.p2) * 0.5) * this.am + this.bz.n() * this.ck;
        this.p1 += this.d1; if (this.p1 >= 1) this.p1 -= 1; this.p2 += this.d2; if (this.p2 >= 1) this.p2 -= 1;
        this.am *= this.ad; this.ck *= this.ckd; x *= this.g; this.g *= this.gd;
        L[i] += x * this.gl; R[i] += x * this.gr; S[i] += x * this.gs;
      }
      return this.am > 1e-4 && this.g > 1e-4;
    }
  }

  const CLASSES = { Rhodes, Piano, Basse, Corde, Cordes, Cuivres, Bois, Cloche, Choeur, Nappe, Kick, Caisse, Metal, Clap, Tom, Timbale, GrosseCaisse, Shaker, Rim };

  // ─── Réverbe (Freeverb) : une par rendu, alimentée par les envois des voix ─────
  function reverbe(S, L, R, n, sr, o) {
    const s = sr / 44100, C = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], A = [556, 441, 341, 225];
    const mk = (len) => ({ b: new Float32Array(Math.max(1, Math.round(len * s))), i: 0, z: 0 });
    const cl = C.map(mk), cr = C.map(c => mk(c + 23)), al = A.map(mk), ar = A.map(x => mk(x + 23));
    const fb = 0.7 + 0.28 * clamp(o.taille, 0, 1), d1 = 0.4 * clamp(o.amorti, 0, 1), d2 = 1 - d1;
    const w1 = (o.largeur / 2 + 0.5) * o.niveau * 3, w2 = ((1 - o.largeur) / 2) * o.niveau * 3, pd = Math.round(o.predelai * sr);
    const hpc = Math.exp(-TAU * 180 / sr); let hx = 0, hy = 0;
    const nc = cl.length, na = al.length;
    for (let i = 0; i < n; i++) {
      const raw = i >= pd ? S[i - pd] : 0; hy = hpc * (hy + raw - hx); hx = raw;    // passe-haut : pas de boue dans le grave
      const x = hy * 0.015; let ol = 0, or = 0;
      for (let k = 0; k < nc; k++) {
        let c = cl[k], o1 = c.b[c.i]; c.z = o1 * d2 + c.z * d1; c.b[c.i] = x + c.z * fb; if (++c.i >= c.b.length) c.i = 0; ol += o1;
        c = cr[k]; o1 = c.b[c.i]; c.z = o1 * d2 + c.z * d1; c.b[c.i] = x + c.z * fb; if (++c.i >= c.b.length) c.i = 0; or += o1;
      }
      for (let k = 0; k < na; k++) {
        let c = al[k], bo = c.b[c.i]; c.b[c.i] = ol + bo * 0.5; if (++c.i >= c.b.length) c.i = 0; ol = bo - ol;
        c = ar[k]; bo = c.b[c.i]; c.b[c.i] = or + bo * 0.5; if (++c.i >= c.b.length) c.i = 0; or = bo - or;
      }
      L[i] += ol * w1 + or * w2; R[i] += or * w1 + ol * w2;
    }
  }

  // ─── Instruments prêts à l'emploi (on peut tout surcharger dans la partition) ──
  const PRESETS = {
    rhodes: { classe: 'Rhodes', vol: 0.5, verb: 0.15 },
    piano: { classe: 'Piano', vol: 0.5, verb: 0.2 },
    basse: { classe: 'Basse', vol: 0.6, verb: 0.02 },
    contrebasse_pizz: { classe: 'Corde', clarte: 0.25, tenue: 0.9, vol: 0.7, verb: 0.15 },
    pizz: { classe: 'Corde', clarte: 0.35, tenue: 0.5, etouffe: 0.05, vol: 0.5, verb: 0.3 },
    harpe: { classe: 'Corde', clarte: 0.55, tenue: 3, etouffe: 2, vol: 0.45, verb: 0.35 },
    guitare: { classe: 'Corde', clarte: 0.65, tenue: 2, vol: 0.4, verb: 0.15 },
    violons: { classe: 'Cordes', attaque: 0.18, clarte: 5, vol: 0.32, verb: 0.35, etale: 0.5 },
    altos: { classe: 'Cordes', attaque: 0.2, clarte: 4, vol: 0.3, verb: 0.35 },
    violoncelles: { classe: 'Cordes', attaque: 0.15, clarte: 4, vol: 0.35, verb: 0.3 },
    contrebasses: { classe: 'Cordes', attaque: 0.08, clarte: 3, vol: 0.45, verb: 0.25, vibrato: 0.06 },
    cordes_stacc: { classe: 'Cordes', attaque: 0.006, chute: 0.09, soutien: 0.35, relache: 0.05, clarte: 6, vibrato: 0, vol: 0.35, verb: 0.3 },
    cors: { classe: 'Cuivres', clarte: 0.6, attaque: 0.06, vol: 0.4, verb: 0.4 },
    trompettes: { classe: 'Cuivres', clarte: 1.2, attaque: 0.035, vol: 0.35, verb: 0.35 },
    trombones: { classe: 'Cuivres', clarte: 0.8, attaque: 0.05, vol: 0.4, verb: 0.35 },
    cuivres_stab: { classe: 'Cuivres', clarte: 1, attaque: 0.015, chute: 0.12, soutien: 0.4, relache: 0.05, vol: 0.35, verb: 0.25 },
    flute: { classe: 'Bois', harmoniques: [1, 0.22, 0.06], souffle: 0.06, vol: 0.35, verb: 0.35 },
    clarinette: { classe: 'Bois', harmoniques: [1, 0, 0.38, 0, 0.16], souffle: 0.025, vol: 0.35, verb: 0.3 },
    hautbois: { classe: 'Bois', harmoniques: [1, 0.75, 0.55, 0.35, 0.2], souffle: 0.03, vol: 0.3, verb: 0.3 },
    glockenspiel: { classe: 'Cloche', vol: 0.3, verb: 0.3 },
    celesta: { classe: 'Cloche', modes: [[1, 1, 0.9], [2, 0.25, 0.4], [3, 0.12, 0.2], [4.1, 0.05, 0.08]], vol: 0.35, verb: 0.3 },
    marimba: { classe: 'Cloche', modes: [[1, 1, 0.5], [3.93, 0.35, 0.12], [9.4, 0.1, 0.04]], vol: 0.45, verb: 0.15 },
    xylophone: { classe: 'Cloche', modes: [[1, 1, 0.25], [3, 0.4, 0.08], [6.1, 0.15, 0.03]], vol: 0.4, verb: 0.2 },
    cloches_tubes: { classe: 'Cloche', modes: [[0.5, 0.5, 3], [1, 1, 2.5], [1.19, 0.4, 1.8], [1.71, 0.35, 1.2], [2, 0.3, 1], [2.74, 0.2, 0.6], [3, 0.15, 0.5]], vol: 0.3, verb: 0.4 },
    choeur: { classe: 'Choeur', voyelle: 'a', vol: 0.4, verb: 0.45, etale: 0.6 },
    nappe: { classe: 'Nappe', vol: 0.3, verb: 0.4 },
    kick: { classe: 'Kick', vol: 0.8, verb: 0.03, ancre: true },
    kick_electro: { classe: 'Kick', f0: 150, f1: 45, tenue: 0.35, vol: 0.8, verb: 0, ancre: true },
    caisse: { classe: 'Caisse', vol: 0.55, verb: 0.15 },
    caisse_militaire: { classe: 'Caisse', ton: 230, bruit: 0.9, timbre: 0.2, fc: 2500, vol: 0.4, verb: 0.35 },
    rim: { classe: 'Rim', vol: 0.4, verb: 0.1 },
    charley: { classe: 'Metal', tenue: 0.04, choke: 'hh', vol: 0.22, verb: 0.05, pan: 0.25 },
    charley_ouvert: { classe: 'Metal', tenue: 0.3, choke: 'hh', vol: 0.2, verb: 0.08, pan: 0.25 },
    crash: { classe: 'Metal', tenue: 1.8, bruit: 0.9, hp: 3500, fc: 8000, attaque: 0.002, vol: 0.2, verb: 0.3, pan: -0.3, poly: 2 },
    ride: { classe: 'Metal', tenue: 1.1, bruit: 0.15, hp: 3000, fc: 7000, base: 520, vol: 0.18, verb: 0.15, pan: 0.35 },
    clap: { classe: 'Clap', vol: 0.45, verb: 0.2 },
    shaker: { classe: 'Shaker', vol: 0.2, verb: 0.05, pan: 0.3 },
    tom: { classe: 'Tom', vol: 0.55, verb: 0.2 },
    timbales: { classe: 'Timbale', vol: 0.55, verb: 0.4, poly: 4 },
    grosse_caisse: { classe: 'GrosseCaisse', vol: 0.8, verb: 0.45, poly: 2 },
  };

  function resoudre(P) {
    const out = {};
    for (const k in P.instruments) {
      const I = P.instruments[k], base = PRESETS[I.type] || PRESETS[k] || {};
      out[k] = Object.assign({ groupe: 'principal' }, base, I);
      if (!CLASSES[out[k].classe]) throw new Error('Instrument inconnu : ' + k + ' (type ' + I.type + ')');
    }
    return out;
  }

  function infoSection(P, nom) {
    const S = P.sections[nom]; if (!S) throw new Error('Section inconnue : ' + nom);
    const bpm = S.bpm || P.bpm || 120, sig = S.sig || P.sig || [4, 4], s16 = 60 / bpm / 4, ppm = sig[0] * 16 / sig[1];
    return { bpm, sig, s16, ppm, mesures: S.mesures, duree: S.mesures * ppm * s16 };
  }

  // Temps réels de chaque note : swing + décalage par instrument + humanisation DÉTERMINISTE
  // (tirée d'une graine) → le moteur audio et la beatmap obtiennent exactement les mêmes temps
  function evenements(P, INS, nom) {
    const S = P.sections[nom], X = infoSection(P, nom), s16 = X.s16;
    const swing = S.swing ?? P.swing ?? 0.5, unit = (S.swingSur || P.swingSur || 16) === 8 ? 2 : 1, hum = (S.humain ?? P.humain ?? 0) / 1000;
    const R = rng(hashStr(nom) ^ (P.graine || 1)), out = [];
    S.notes.forEach((n, i) => {
      const [instr, mes, pas, midi, dur, vel = 0.8, tag] = n, I = INS[instr];
      const r1 = R() - 0.5, r2 = R() - 0.5; if (!I) return;
      let p = mes * X.ppm + pas; const q = p / unit;
      if (Math.abs(q - Math.round(q)) < 1e-6 && Math.round(q) % 2 === 1) p += (swing - 0.5) * 2 * unit;
      let t = p * s16 + (I.retard || 0) / 1000; const h = I.humain === false ? 0 : hum;
      if (h && !(I.ancre && Math.abs(pas % 4) < 1e-6)) t += r1 * 2 * h;
      out.push({ i, instr, t: Math.max(0, t), dur: Math.max(0.005, dur * s16), midi: midi || 60, vel: clamp(vel * (1 + (h ? r2 * 0.16 : 0)), 0.01, 1), mes, pas, tag });
    });
    return { evts: out, duree: X.duree, info: X };
  }

  function chronologie(P) {
    const instances = []; let t = 0;
    for (const nom of P.forme) { const d = infoSection(P, nom).duree; instances.push({ nom, debut: t, duree: d }); t += d; }
    return { instances, duree: t, boucle: !!P.boucle };
  }

  // Fabrique une section (ou une couche d'une section) : renvoie deux Float32Array stéréo
  function rendre(P, nom, groupe, sr) {
    const t0 = maintenant(), INS = resoudre(P), E = evenements(P, INS, nom);
    const evts = E.evts.filter(e => groupe === 'tout' || INS[e.instr].groupe === groupe).sort((x, y) => x.t - y.t || x.i - y.i);
    let fin = E.duree; for (const e of evts) fin = Math.max(fin, e.t + e.dur);
    const salle = Object.assign({ taille: 0.8, amorti: 0.35, niveau: 1, predelai: 0.02, largeur: 1 }, P.salle);
    const N = Math.ceil((fin + (P.queue ?? (1.5 + salle.taille * 3))) * sr);
    const L = new Float32Array(N), R = new Float32Array(N), S = new Float32Array(N);
    const actives = [], parInstr = {}, B = 32; let k = 0, voixMax = 0;
    for (let b = 0; b < N; b += B) {
      const end = Math.min(N, b + B);
      while (k < evts.length) {
        const e = evts[k], s0 = Math.round(e.t * sr); if (s0 >= end) break; k++;
        const I = INS[e.instr], v = new CLASSES[I.classe](I, e, sr, e.i + 1); v.debut = Math.max(b, s0); v.instr = e.instr;
        if (I.choke) for (const o of actives) if (o.I.choke === I.choke) o.couper();
        const l = parInstr[e.instr] || (parInstr[e.instr] = []); l.push(v); if (l.length > (I.poly ?? 24)) l.shift().couper();
        actives.push(v);
      }
      for (let j = actives.length - 1; j >= 0; j--) {
        const v = actives[j];
        if (!v.render(L, R, S, Math.max(b, v.debut), end)) { actives.splice(j, 1); const l = parInstr[v.instr], x = l.indexOf(v); if (x >= 0) l.splice(x, 1); }
      }
      if (actives.length > voixMax) voixMax = actives.length;
      if (k >= evts.length && actives.length === 0 && b > fin * sr) break;
    }
    if (salle.niveau > 0) reverbe(S, L, R, N, sr, salle);
    const min = Math.ceil(E.duree * sr); let last = N - 1;
    while (last > min && Math.abs(L[last]) < 3e-5 && Math.abs(R[last]) < 3e-5) last--;
    const n2 = Math.max(last + 1, min); let pic = 0;
    for (let i = 0; i < n2; i++) { const a = Math.abs(L[i]), c = Math.abs(R[i]); if (a > pic) pic = a; if (c > pic) pic = c; }
    return { L: L.slice(0, n2), R: R.slice(0, n2), info: { ms: maintenant() - t0, duree: E.duree, longueur: n2 / sr, voixMax, pic, notes: evts.length } };
  }

  // Petite partition dense qui sert à mesurer la vitesse de l'appareil
  const SONDE = (() => {
    const notes = [];
    [50, 57, 62, 65, 69, 74].forEach(m => notes.push(['v', 0, 0, m, 16, 0.8]));
    [62, 65, 69].forEach(m => notes.push(['c', 0, 0, m, 12, 0.9]));
    for (let p = 0; p < 16; p++) { notes.push(['s', 0, p, 50 + (p % 4) * 3, 1, 0.8]); notes.push(['h', 0, p, 60, 1, 0.6]); }
    [0, 4, 8, 12].forEach(p => notes.push(['k', 0, p, 38, 2, 1]));
    return { bpm: 120, queue: 0.4, salle: { niveau: 1 }, instruments: { v: { type: 'violons' }, c: { type: 'cors' }, s: { type: 'cordes_stacc' }, h: { type: 'charley' }, k: { type: 'timbales' } }, sections: { s: { mesures: 1, notes } }, forme: ['s'] };
  })();

  return { rendre, evenements, chronologie, infoSection, resoudre, PRESETS, SONDE, mtof };
}

// ═══════════════════════════════════════════════════════════════════════════
//  Côté jeu (fil principal) : file de fabrication, lecture, horloge, beatmap
// ═══════════════════════════════════════════════════════════════════════════
class Pupitre {
  constructor(ctx, o = {}) {
    this.ctx = ctx; this.K = NOYAU(); this.o = o;
    this.maitre = ctx.createGain(); this.maitre.gain.value = o.volume ?? 0.85;
    const lim = ctx.createDynamicsCompressor();                     // filet de sécurité : rien ne sature
    lim.threshold.value = -6; lim.knee.value = 4; lim.ratio.value = 12; lim.attack.value = 0.002; lim.release.value = 0.15;
    this.maitre.connect(lim); lim.connect(o.sortie || ctx.destination);
    this.calibrage = 0;          // ms, décalage audio réglé par le joueur (Bluetooth : 150 à 300)
    this.niveaux = {}; this.lecture = false; this.t0 = null; this.vit = 1; this._sA = 0; this._cA = 0; this._w = []; this._gen = 0; this.surFin = null;
    this.stats = {};
  }

  _pool() {
    if (this._w.length || this._sansWorker) return;
    const n = this.o.workers ?? Math.max(1, Math.min(3, (navigator.hardwareConcurrency || 2) - 1));
    const src = 'const K=(' + NOYAU.toString() + ')();self.onmessage=function(e){var d=e.data;try{var r=K.rendre(d.partition,d.section,d.groupe,d.sr);self.postMessage({id:d.id,gen:d.gen,ok:true,L:r.L,R:r.R,info:r.info},[r.L.buffer,r.R.buffer]);}catch(err){self.postMessage({id:d.id,gen:d.gen,ok:false,err:String(err&&err.stack||err)});}};';
    try {
      this._url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      for (let i = 0; i < n; i++) { const w = new Worker(this._url); w.tache = null; w.onmessage = ev => this._recu(w, ev.data); w.onerror = ev => { ev.preventDefault && ev.preventDefault(); this._panne(w, ev.message || 'erreur du worker'); }; this._w.push(w); }
    } catch (e) { this._w = []; this._sansWorker = true; }
  }

  // Envoie une tâche à un worker, ou la fait sur le fil principal si les workers sont indisponibles
  _envoyer(w, tache, P) {
    const msg = { id: tache.cle, gen: this._gen, partition: P, section: tache.nom, groupe: tache.groupe, sr: tache.sr };
    tache.depart = performance.now();
    if (w) { w.tache = tache; w.postMessage(msg); return; }
    setTimeout(() => { try { const r = this.K.rendre(P, tache.nom, tache.groupe, tache.sr); this._recu(null, { id: tache.cle, gen: msg.gen, ok: true, L: r.L, R: r.R, info: r.info }); } catch (err) { this._recu(null, { id: tache.cle, gen: msg.gen, ok: false, err: String(err) }); } }, 0);
  }

  async _frequence(q) {
    const sr = this.ctx.sampleRate;
    if (q === 'haute') return sr;
    if (q === 'eco') return Math.min(sr, 32000);
    let msParSec = null;
    try { msParSec = JSON.parse(localStorage.getItem('pupitre.msParSec')); } catch (e) {}
    if (!msParSec) {
      msParSec = await new Promise(res => {
        const t = { cle: 'sonde', nom: 's', groupe: 'tout', sr, sonde: res }; this._sonde = t;
        const w = this._w[0]; if (w) w.tache = t; this._envoyer(w || null, t, this.K.SONDE);
      });
      try { localStorage.setItem('pupitre.msParSec', JSON.stringify(msParSec)); } catch (e) {}
    }
    this.stats.sondeMsParSec = Math.round(msParSec);
    const capacite = Math.max(1, this._w.length) * 1000 / msParSec;     // secondes de musique fabriquées par seconde
    return capacite < 2.5 ? Math.min(sr, 32000) : sr;
  }

  /** Prépare un morceau. Résout quand la lecture peut aller jusqu'au bout sans attendre. */
  async charger(P, o = {}) {
    this.arreter(0);
    const gen = ++this._gen; this.P = P; this.INS = this.K.resoudre(P); this.chrono = this.K.chronologie(P);
    this.groupes = P.pistes ? [...new Set(Object.values(this.INS).map(I => I.groupe))] : ['tout'];
    this.buffers = new Map(); this._evtsCache = new Map(); this._mesures = [];
    const t0 = performance.now(); this._pool();
    this.stats = { workers: this._w.length, horsFil: !this._w.length, faites: 0, total: 0, memoire: 0, voixMax: 0, pic: 0, decrochages: 0, pretEn: null, msParSec: null, toutEn: null };
    this.sr = await this._frequence(o.qualite || 'auto'); if (gen !== this._gen) throw new Error('remplacé');
    this.stats.sr = this.sr;
    const vues = new Map(); for (const x of this.chrono.instances) if (!vues.has(x.nom)) vues.set(x.nom, x.debut);
    this._file = []; for (const [nom, besoin] of vues) for (const g of this.groupes) this._file.push({ cle: nom + '|' + g, nom, groupe: g, besoin, duree: this.K.infoSection(P, nom).duree, sr: this.sr });
    this._enCours = new Set(); this.stats.total = this._file.length; this._onProgres = o.onProgres; this._t0 = t0;
    return new Promise((res, rej) => { this._pret = { res, rej, gen }; this._distribuer(); });
  }

  _distribuer() {
    if (!this._file) return;
    const libres = this._w.length ? this._w.filter(w => !w.tache) : (this._enCours.size ? [] : [null]);
    for (const w of libres) { const t = this._file.shift(); if (!t) break; this._enCours.add(t); this._envoyer(w, t, this.P); }
  }

  _recu(w, d) {
    const tache = w ? w.tache : null; if (w) w.tache = null;
    if (d.id === 'sonde' && this._sonde) { const s = this._sonde; this._sonde = null; s.sonde(d.ok ? d.info.ms / d.info.duree * 1000 / 1000 : 400); return; }
    if (d.gen !== this._gen) { this._distribuer(); return; }
    const t = tache || [...this._enCours].find(x => x.cle === d.id); if (t) this._enCours.delete(t);
    if (!d.ok) { this._echec(d.err); return; }
    const b = this.ctx.createBuffer(2, d.L.length, this.sr); b.copyToChannel(d.L, 0); b.copyToChannel(d.R, 1);
    this.buffers.set(d.id, b);
    const s = this.stats; s.faites++; s.memoire += d.L.length * 8 / 1048576; s.voixMax = Math.max(s.voixMax, d.info.voixMax); s.pic = Math.max(s.pic, d.info.pic);
    this._mesures.push({ ms: d.info.ms, duree: d.info.duree }); s.msParSec = Math.round(Math.max(...this._mesures.map(m => m.ms / m.duree)));
    if (s.faites === s.total) s.toutEn = Math.round(performance.now() - this._t0);
    this._verifierPret(); this._distribuer(); if (this.lecture) this._tic();
    this._onProgres && this._onProgres(this.stats);
  }

  _panne(w, msg) { w.terminate(); this._w = this._w.filter(x => x !== w); const t = w.tache; if (t) { this._enCours.delete(t); this._file.unshift(t); } if (!this._w.length) this._sansWorker = true; this._distribuer(); console.warn('Pupitre : worker en panne, relais pris', msg); }
  _echec(err) { console.error('Pupitre :', err); if (this._pret) { this._pret.rej(new Error(err)); this._pret = null; } }

  // Prêt si, à la vitesse mesurée ×1,5, chaque section restante sera finie 0,4 s avant d'être entendue
  _verifierPret() {
    if (!this._pret) return;
    const reste = this._file.length + this._enCours.size;
    if (reste && this._mesures.length) {
      const k = Math.max(...this._mesures.map(m => m.ms / m.duree)) * 1.5, W = Math.max(1, this._w.length), now = performance.now();
      const libres = new Array(W).fill(0); let i = 0;
      for (const t of this._enCours) { const r = Math.max(0, t.duree * k - (now - t.depart)); libres[i++ % W] += r; if (r / 1000 + 0.4 > t.besoin) return; }
      for (const t of this._file) { libres.sort((a, b) => a - b); libres[0] += t.duree * k; if (libres[0] / 1000 + 0.4 > t.besoin) return; }
    } else if (reste) return;
    this.stats.pretEn = Math.round(performance.now() - this._t0);
    const p = this._pret; this._pret = null; p.res(this.stats);
  }

  /** Lance le morceau (à appeler sur un geste du joueur la première fois). */
  jouer(o = {}) {
    if (!this.P) throw new Error('Pupitre : charger() avant jouer()');
    this.arreter(0);
    const ctx = this.ctx; if (ctx.state !== 'running') ctx.resume();
    const depuis = o.depuis || 0, quand = o.quand ?? ctx.currentTime + 0.12;
    this.t0 = quand - depuis; this._depuis = depuis; this._finSignale = false; this.vit = 1; this._sA = 0; this._cA = this.t0;
    const jeu = ctx.createGain(); jeu.connect(this.maitre); this._jeu = jeu; this._bus = {}; this._sources = new Set();
    for (const g of this.groupes) { const n = ctx.createGain(); n.gain.value = this.niveaux[g] ?? 1; n.connect(jeu); this._bus[g] = n; }
    this._k = 0; while (true) { const x = this._instance(this._k); if (!x || x.debut + x.duree + 8 > depuis) break; this._k++; }
    this.lecture = true; this._tic(); this._minuteur = setInterval(() => this._tic(), 40);
  }

  // Temps du morceau ↔ heure audio, avec la vitesse de bande : morceau = sA + (heure − cA) × vitesse
  _morceau(ct) { return this._sA + (ct - this._cA) * this.vit; }
  _heure(s) { return this._cA + (s - this._sA) / this.vit; }

  /** Vitesse de bande (1 = normale, 0,7 = ralenti, la hauteur suit comme sur une cassette). L'horloge et la beatmap restent justes. */
  vitesse(v, fondu = 0) {
    v = Math.max(0.25, Math.min(4, +v || 1)); if (v === this.vit) return;
    const ctx = this.ctx, now = ctx.currentTime;
    if (this.t0 == null) { this.vit = v; return; }
    this._sA = this._morceau(now); this._cA = now; this.vit = v; this.t0 = this._heure(0);
    let k = Infinity;
    for (const s of [...this._sources]) {
      if (s._quand > now) { k = Math.min(k, s._k); try { s.onended = null; s.stop(); s.disconnect(); } catch (e) {} this._sources.delete(s); }   // pas encore entendue : on la reposera
      else { const r = s.playbackRate; r.cancelScheduledValues(now); if (fondu > 0) { r.setValueAtTime(r.value, now); r.linearRampToValueAtTime(v, now + fondu); } else r.setValueAtTime(v, now); }
    }
    if (k < this._k) this._k = k;
    this._tic();
  }

  _instance(k) {
    const I = this.chrono.instances, n = I.length; if (!n || (!this.chrono.boucle && k >= n)) return null;
    const c = Math.floor(k / n), x = I[k % n]; return { nom: x.nom, debut: x.debut + c * this.chrono.duree, duree: x.duree };
  }

  // Pose les sections à l'avance (1,2 s) sur l'horloge audio
  _tic() {
    if (!this.lecture) return;
    const ctx = this.ctx, now = ctx.currentTime;
    for (;;) {
      const x = this._instance(this._k); if (!x) break;
      const debut = this._heure(x.debut); if (debut > now + 1.2) break;
      const bufs = this.groupes.map(g => this.buffers.get(x.nom + '|' + g));
      if (bufs.some(b => !b)) { if (debut < now && !this._enRetard) { this.stats.decrochages++; this._enRetard = true; } break; }
      this._enRetard = false;
      let off = x.debut < this._depuis ? this._depuis - x.debut : 0, quand = this._heure(x.debut + off);
      if (quand < now + 0.01) { const r = now + 0.02 - quand; off += r * this.vit; quand += r; }       // en retard : on entre en cours de route, au bon endroit
      bufs.forEach((b, j) => {
        if (off >= b.duration) return;
        const s = ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = this.vit; s._quand = quand; s._k = this._k; s.connect(this._bus[this.groupes[j]]); s.start(quand, off);
        this._sources.add(s); s.onended = () => { this._sources.delete(s); try { s.disconnect(); } catch (e) {} };
      });
      this._k++;
    }
    if (!this.chrono.boucle && !this._instance(this._k) && !this._finSignale && this._morceau(now) > this.chrono.duree) { this._finSignale = true; this.surFin && this.surFin(); }
  }

  arreter(fondu = 0.05) {
    clearInterval(this._minuteur); this._minuteur = null; this.lecture = false;
    if (this._jeu) {
      const g = this._jeu.gain, t = this.ctx.currentTime, srcs = this._sources, jeu = this._jeu;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + Math.max(0.006, fondu));
      setTimeout(() => { srcs.forEach(s => { try { s.stop(); } catch (e) {} }); try { jeu.disconnect(); } catch (e) {} }, (Math.max(0.006, fondu) + 0.08) * 1000);
    }
    this._jeu = null; this._sources = new Set(); this.t0 = null;
  }

  /** Volume d'une couche (partition.pistes = true), en fondu. */
  groupe(nom, gain, fondu = 0.6) {
    this.niveaux[nom] = gain; const n = this._bus && this._bus[nom];
    if (n) { const t = this.ctx.currentTime; n.gain.cancelScheduledValues(t); n.gain.setValueAtTime(n.gain.value, t); n.gain.setTargetAtTime(gain, t, Math.max(0.01, fondu / 3)); }
  }

  /** Temps du morceau (s) à l'instant performance.now() = perfMs, tel qu'il est ENTENDU. */
  tempsA(perfMs) {
    if (this.t0 == null) return 0;
    const ctx = this.ctx; let ct = null;
    if (ctx.getOutputTimestamp) { const ts = ctx.getOutputTimestamp(); if (ts && ts.contextTime > 0 && ts.performanceTime > 0) ct = ts.contextTime + (perfMs - ts.performanceTime) / 1000; }
    if (ct == null) ct = ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0) + (perfMs - performance.now()) / 1000;
    return this._morceau(ct - this.calibrage / 1000);
  }
  position() { return this.tempsA(performance.now()); }

  _evts(nom) { if (!this._evtsCache.has(nom)) this._evtsCache.set(nom, this.K.evenements(this.P, this.INS, nom)); return this._evtsCache.get(nom); }

  /** Notes à jouer, tirées de la partition. filtre(n) reçoit {t, instr, midi, vel, mesure, pas, section, tag, duree}. */
  beatmap(filtre = () => true, cycles = 1) {
    const out = [], n = this.chrono.instances.length * (this.chrono.boucle ? cycles : 1);
    for (let k = 0; k < n; k++) {
      const x = this._instance(k);
      for (const e of this._evts(x.nom).evts) { const m = { t: x.debut + e.t, instr: e.instr, midi: e.midi, vel: e.vel, mesure: e.mes, pas: e.pas, section: x.nom, tag: e.tag, duree: e.dur }; if (filtre(m)) out.push(m); }
    }
    return out.sort((a, b) => a.t - b.t);
  }

  /** Les temps du morceau (pour faire clignoter la pulsation). */
  grille(cycles = 1) {
    const out = [], n = this.chrono.instances.length * (this.chrono.boucle ? cycles : 1);
    for (let k = 0; k < n; k++) {
      const x = this._instance(k), X = this.K.infoSection(this.P, x.nom), pasTemps = 16 / X.sig[1];
      for (let m = 0; m < X.mesures; m++) for (let b = 0; b < X.sig[0]; b++) out.push({ t: x.debut + (m * X.ppm + b * pasTemps) * X.s16, mesure: m, temps: b, section: x.nom });
    }
    return out;
  }

  get duree() { return this.chrono ? this.chrono.duree : 0; }
  liberer() { this.arreter(0); this._w.forEach(w => w.terminate()); this._w = []; if (this._url) URL.revokeObjectURL(this._url); this.buffers = new Map(); }
}

// ─── Aides d'écriture (pour composer les partitions en code) ─────────────────
const Ecriture = {
  /** Rythme en texte, un caractère par double croche : X accent, x normal, g ghost, o ouvert, . silence. */
  motif(instr, mesure, txt, midi = 60, vels = { X: 1, x: 0.72, g: 0.22, o: 0.75 }, dur = 1) {
    const n = []; [...txt].forEach((c, p) => { if (vels[c] != null) n.push([instr, mesure, p, midi, dur, vels[c]]); }); return n;
  },
  /** Conduite des voix : place chaque note de l'accord (classes de hauteur) au plus près de l'accord précédent. */
  conduire(prec, pcs, lo = 52, hi = 72) {
    return pcs.map(pc => { let best = null; for (let m = lo; m <= hi; m++) if (((m - pc) % 12 + 12) % 12 === 0) { const d = prec ? Math.min(...prec.map(p => Math.abs(p - m))) : Math.abs(m - (lo + hi) / 2); if (!best || d < best.d) best = { m, d }; } return best ? best.m : lo; }).sort((a, b) => a - b);
  },
  ACCORDS: { maj: [0, 4, 7], min: [0, 3, 7], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], 7: [0, 4, 7, 10], m9: [0, 3, 7, 10, 14], maj9: [0, 4, 7, 11, 14], 9: [0, 4, 7, 10, 14], add9: [0, 4, 7, 14], sus2: [0, 2, 7], sus4: [0, 5, 7], m7b5: [0, 3, 6, 10] },
  /** Classes de hauteur d'un accord : pcs(2, 'min') → ré mineur */
  pcs(fond, type) { return Ecriture.ACCORDS[type].map(x => (fond + x) % 12); },
};

if (typeof window !== 'undefined') { window.Pupitre = Pupitre; window.PupitreEcriture = Ecriture; }
export { Pupitre, Ecriture, NOYAU };
