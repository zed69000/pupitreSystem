/*
 * ═══════════════════════════════════════════════════════════════════════════
 *  PUPITRE · banques de sons : de vrais instruments enregistrés pour le moteur
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   banque .sf2 (un fichier, 10 à 150 Mo)          dossier découpé (1 fichier par instrument)
 *        │  ouvrir() : téléchargement suivi,              │  ouvrirDossier() : seul l'index
 *        │  gardé en cache sur l'appareil                 │  est lu, le reste à la demande
 *        └───────────────┬────────────────────────────────┘
 *                        ▼
 *        equiper(partition) : ne prépare QUE les instruments du morceau
 *                        │   jeu = zones (tessiture, vélocité, boucle, enveloppe) + sons 16 bits
 *                        ▼
 *        pupitre.banque(nom, jeu) + pupitre.associer(table)  →  fils de calcul
 *
 *  POURQUOI CE CHOIX
 *  - La partition ne change pas : `type: 'piano'` joue le vrai piano si la banque est là,
 *    le piano synthétique sinon. Le jeu n'est jamais muet, et la beatmap ne bouge pas.
 *  - Seuls les instruments du morceau sont décodés : une banque de 30 Mo ne coûte en
 *    mémoire que les 3 à 8 instruments utilisés.
 *  - Les sons restent en 16 bits jusqu'au fil de calcul : deux fois moins de mémoire
 *    qu'en nombres flottants, sans perte.
 *  - Le silence au début de chaque son est retiré : l'attaque tombe sur le temps de la
 *    partition (un jeu de rythme ne pardonne pas 20 ms de blanc).
 *
 *  UTILISATION
 *    const banques = new Banques(pupitre);
 *    await banques.ouvrir('sons/GeneralUser-GS.sf2', { onProgres: p => barre(p.recu / p.total) });
 *    await banques.equiper(partition, { onProgres: p => barre(p.faits / p.total) });
 *    await pupitre.charger(partition);          // les vrais instruments sont en place
 *    banques.retirer();                         // retour au tout-synthétique
 */

// Type Pupitre → programme General MIDI (banque 128 = batterie, note = touche du kit).
// Les synthés (nappe, synth_*, supersaw, chip, talkbox, kick_electro) restent synthétisés : là, le synthé EST l'instrument.
// `attaque` plafonne les attaques lentes de certaines banques (0,45 s pour des cordes) : dans un jeu de rythme, la note doit parler sur son temps.
const GM = {
  piano: { p: 0 }, rhodes: { p: 4 }, orgue: { p: 16 },
  guitare: { p: 25 }, guitare_sat: { p: 29 }, guitare_etouffee: { p: 28 },
  basse: { p: 33 }, contrebasse_pizz: { p: 32 },
  violons: { p: 48, attaque: 0.09 }, altos: { p: 48, attaque: 0.09 }, violoncelles: { p: 48, attaque: 0.09 }, contrebasses: { p: 48, attaque: 0.09 }, cordes_stacc: { p: 48, attaque: 0.004, relache: 0.25 },
  pizz: { p: 45 }, harpe: { p: 46 },
  cors: { p: 60, attaque: 0.05 }, trompettes: { p: 56 }, trombones: { p: 57 }, cuivres_stab: { p: 61 },
  flute: { p: 73 }, clarinette: { p: 71 }, hautbois: { p: 68 },
  glockenspiel: { p: 9 }, celesta: { p: 8 }, marimba: { p: 12 }, xylophone: { p: 13 }, cloches_tubes: { p: 14 },
  choeur: { p: 52, attaque: 0.06 }, timbales: { p: 47 },
  kick: { b: 128, note: 36 }, caisse: { b: 128, note: 38 }, caisse_militaire: { b: 128, note: 40 }, rim: { b: 128, note: 37 },
  charley: { b: 128, note: 42 }, charley_ouvert: { b: 128, note: 46 }, crash: { b: 128, note: 49 }, ride: { b: 128, note: 51 },
  clap: { b: 128, note: 39 }, shaker: { b: 128, note: 70 }, tom: { b: 128, note: 'tom' }, grosse_caisse: { b: 128, note: 35 },
};
const nomJeu = (b, p) => 'gm:' + (b || 0) + ':' + (p || 0);

// ─── Lecture d'une banque SoundFont 2 ────────────────────────────────────────
const G = { debut: 0, fin: 1, bDebut: 2, bFin: 3, debutG: 4, fc: 8, finG: 12, pan: 17, att: 34, tenue: 35, dec: 36, sus: 37, rel: 38, instrument: 41, touches: 43, vels: 44,
  bDebutG: 45, touche: 46, atten: 48, bFinG: 50, ton: 51, fin_: 52, son: 53, mode: 54, echelle: 56, excl: 57, root: 58 };
const DEFAUT = { [G.fc]: 13500, [G.att]: -12000, [G.tenue]: -12000, [G.dec]: -12000, [G.rel]: -12000, [G.touche]: -1, [G.echelle]: 100, [G.root]: -1 };
const secondes = tc => (tc <= -12000 ? 0.001 : Math.pow(2, tc / 1200));

function lireSF2(tampon) {
  const dv = new DataView(tampon), txt = (o, n) => { let s = ''; for (let i = 0; i < n; i++) { const c = dv.getUint8(o + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
  if (tampon.byteLength < 12 || txt(0, 4) !== 'RIFF' || txt(8, 4) !== 'sfbk') throw new Error('Ce fichier n\'est pas une banque SoundFont (.sf2)');
  const C = {}; let nom = '', version = 2;
  const parcourir = (o, fin) => {
    while (o + 8 <= fin) {
      const id = txt(o, 4), n = dv.getUint32(o + 4, true);
      if (id === 'LIST') parcourir(o + 12, Math.min(fin, o + 8 + n)); else C[id] = { o: o + 8, n };
      if (id === 'INAM') nom = txt(o + 8, n); if (id === 'ifil') version = dv.getUint16(o + 8, true);
      o += 8 + n + (n & 1);
    }
  };
  parcourir(12, tampon.byteLength);
  for (const k of ['smpl', 'phdr', 'pbag', 'pgen', 'inst', 'ibag', 'igen', 'shdr']) if (!C[k]) throw new Error('Banque incomplète (bloc ' + k + ' manquant)');
  if (version >= 3) throw new Error('Banque compressée (SF3) : la convertir en .sf2 avant de la charger');
  const u16 = o => dv.getUint16(o, true), i16 = o => dv.getInt16(o, true), u32 = o => dv.getUint32(o, true);
  // générateurs d'un sac : { numéro: valeur }, les étendues (touches, vélocités) en [bas, haut]
  const gens = (bloc, sac, i) => {
    const a = u16(C[sac].o + i * 4), b = u16(C[sac].o + (i + 1) * 4), g = {};
    for (let k = a; k < b; k++) { const o = C[bloc].o + k * 4, op = u16(o); g[op] = op === G.touches || op === G.vels ? [dv.getUint8(o + 2), dv.getUint8(o + 3)] : op === G.instrument || op === G.son ? u16(o + 2) : i16(o + 2); }
    return g;
  };
  const nP = C.phdr.n / 38 - 1, presets = [];
  for (let i = 0; i < nP; i++) { const o = C.phdr.o + i * 38; presets.push({ nom: txt(o, 20), programme: u16(o + 20), banque: u16(o + 22), sacs: [u16(o + 24), u16(o + 62)] }); }
  presets.sort((a, b) => a.banque - b.banque || a.programme - b.programme);
  const croise = (a, b) => [Math.max(a ? a[0] : 0, b ? b[0] : 0), Math.min(a ? a[1] : 127, b ? b[1] : 127)];

  // Prépare un instrument : ses zones et ses sons, silence de tête retiré, niveau normalisé
  function jeu(banque, programme) {
    const pr = presets.find(p => p.banque === banque && p.programme === programme) || (banque === 128 ? presets.find(p => p.banque === 128) : presets.find(p => p.banque === 0 && p.programme === programme));
    if (!pr) return null;
    const zones = [], ech = [], vus = new Map(); let pGlobal = {}, picMax = 0;
    for (let ib = pr.sacs[0]; ib < pr.sacs[1]; ib++) {
      const gp = gens('pgen', 'pbag', ib);
      if (gp[G.instrument] == null) { if (ib === pr.sacs[0]) pGlobal = gp; continue; }
      const P = Object.assign({}, pGlobal, gp), oi = C.inst.o + gp[G.instrument] * 22, s0 = u16(oi + 20), s1 = u16(oi + 42); let iGlobal = {};
      for (let k = s0; k < s1; k++) {
        const gi = gens('igen', 'ibag', k);
        if (gi[G.son] == null) { if (k === s0) iGlobal = gi; continue; }
        const Z = Object.assign({}, DEFAUT, iGlobal, gi), v = n => (Z[n] || 0) + (P[n] || 0);
        const [lo, hi] = croise(Z[G.touches], P[G.touches]), [vlo, vhi] = croise(Z[G.vels], P[G.vels]); if (lo > hi || vlo > vhi) continue;
        const os = C.shdr.o + Z[G.son] * 46, type = u16(os + 44); if (type & 0x8000) continue;                 // son en ROM : absent du fichier
        const total = C.smpl.n / 2;
        let d0 = u32(os + 20) + (Z[G.debut] || 0) + (Z[G.debutG] || 0) * 32768, d1 = u32(os + 24) + (Z[G.fin] || 0) + (Z[G.finG] || 0) * 32768;
        let bA = u32(os + 28) + (Z[G.bDebut] || 0) + (Z[G.bDebutG] || 0) * 32768, bB = u32(os + 32) + (Z[G.bFin] || 0) + (Z[G.bFinG] || 0) * 32768;
        d1 = Math.min(d1, total); if (d1 - d0 < 8) continue;
        const mode = (Z[G.mode] || 0) & 3, boucle = (mode & 1) && bB > bA + 4 && bA >= d0 && bB <= d1;
        const cle = d0 + ':' + d1; let e = vus.get(cle);
        if (!e) {
          const o = C.smpl.o + d0 * 2;                                                 // vue directe si l'adresse est paire, copie sinon
          const lu = o % 2 === 0 ? new Int16Array(tampon, o, d1 - d0) : Int16Array.from({ length: d1 - d0 }, (_, i) => i16(o + i * 2));
          let pic = 0; for (let i = 0; i < lu.length; i++) { const a = lu[i] < 0 ? -lu[i] : lu[i]; if (a > pic) pic = a; }
          // silence de tête : on démarre juste avant le premier échantillon audible (jamais au-delà du début de boucle)
          const seuil = Math.max(6, pic * 0.002); let t = 0; while (t < lu.length - 8 && Math.abs(lu[t]) < seuil) t++;
          t = Math.max(0, Math.min(t - 4, boucle ? bA - d0 : t));
          e = { i: ech.length, coupe: t, pic }; ech.push(lu.slice(t)); vus.set(cle, e);
        }
        const root = Z[G.root] >= 0 ? Z[G.root] : (dv.getUint8(os + 40) > 127 ? 60 : dv.getUint8(os + 40));
        const gain = Math.pow(10, -Math.max(0, v(G.atten)) * 0.4 / 200);                                    // atténuation en cB, à 40 % comme les synthés de référence
        picMax = Math.max(picMax, e.pic / 32768 * gain);
        zones.push({ lo, hi, vlo, vhi, root, cents: v(G.ton) * 100 + v(G.fin_) + dv.getInt8(os + 41), echelle: Z[G.echelle], sr: u32(os + 36), s: e.i,
          bA: boucle ? bA - d0 - e.coupe : -1, bB: boucle ? bB - d0 - e.coupe : -1, mode,
          att: secondes(v(G.att)), dec: secondes(v(G.dec)), sus: Math.pow(10, -Math.max(0, Math.min(1000, v(G.sus))) / 200), rel: secondes(v(G.rel)),
          gain, pan: Math.max(-1, Math.min(1, v(G.pan) / 500)), fc: 8.176 * Math.pow(2, Math.max(1500, Math.min(13500, v(G.fc))) / 1200), excl: Z[G.excl] || 0, touche: Z[G.touche] });
      }
    }
    if (!zones.length) return null;
    // deux mesures de la richesse du jeu : durée moyenne d'un son (un cycle bouclé de 20 ms n'est pas un enregistrement) et finesse (fréquence d'origine)
    const srs = ech.map((e, i) => (zones.find(z => z.s === i) || {}).sr || 44100), duree = ech.reduce((t, e, i) => t + e.length / srs[i], 0);
    return { nom: pr.nom, banque: pr.banque, programme: pr.programme, gain: Math.min(8, 0.6 / (picMax || 1)), moyenne: duree / ech.length, srMax: Math.max(...srs), zones, ech };
  }
  return { nom, octets: tampon.byteLength, presets: presets.map(p => ({ nom: p.nom, banque: p.banque, programme: p.programme })), jeu };
}

// ─── Format compact : un instrument = un fichier (en-tête JSON + sons 16 bits) ─
function emballer(jeu) {
  const tete = new TextEncoder().encode(JSON.stringify(Object.assign({}, jeu, { ech: jeu.ech.map(e => e.length) })));
  const pad = (4 - (8 + tete.length) % 4) % 4, total = 8 + tete.length + pad + jeu.ech.reduce((s, e) => s + e.length * 2, 0);
  const buf = new ArrayBuffer(total), dv = new DataView(buf); dv.setUint32(0, 0x554a5550, true); dv.setUint32(4, tete.length, true);     // « PUJU »
  new Uint8Array(buf, 8, tete.length).set(tete); let o = 8 + tete.length + pad;
  for (const e of jeu.ech) { new Int16Array(buf, o, e.length).set(e); o += e.length * 2; }
  return buf;
}
function deballer(buf) {
  const dv = new DataView(buf); if (dv.getUint32(0, true) !== 0x554a5550) throw new Error('Ce fichier n\'est pas un instrument Pupitre');
  const n = dv.getUint32(4, true), jeu = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, n))); let o = 8 + n + (4 - (8 + n) % 4) % 4;
  jeu.ech = jeu.ech.map(l => { const e = new Int16Array(buf.slice(o, o + l * 2)); o += l * 2; return e; });
  return jeu;
}

/** Les jeux qu'une partition demande : { 'gm:0:0': { banque, programme, types: ['piano'] } } */
function besoins(P, o = {}) {
  // Section rythmique électronique (basse de synthé ou kick électronique) : la boîte à rythmes synthétisée EST le bon instrument,
  // une batterie acoustique enregistrée changerait le style du morceau. `batterie: true` ou `false` force le choix.
  const types = Object.entries(P.instruments || {}).map(([k, I]) => I.type || k), electro = types.includes('synth_basse') || types.includes('kick_electro');
  const kit = o.batterie === true || (o.batterie !== false && !electro);
  const out = {}, ajout = (b, p, t) => { const k = nomJeu(b, p); (out[k] || (out[k] = { banque: b, programme: p, types: [] })).types.push(t); };
  for (const [k, I] of Object.entries(P.instruments || {})) {
    if (I.reel === false || P.reel === false) continue;
    if (I.prog != null) { ajout(I.banque || 0, I.prog, k); continue; }
    const t = GM[I.type] ? I.type : GM[k] ? k : null; if (t && (kit || GM[t].b !== 128)) ajout(GM[t].b || 0, GM[t].p || 0, t);
  }
  return out;
}

const CACHE = 'pupitre-banques', ADRESSE = n => 'https://pupitre.local/banque/' + encodeURIComponent(n);
const pause = () => new Promise(r => setTimeout(r, 0));

class Banques {
  constructor(pupitre) { this.pupitre = pupitre; this.source = null; this.etat = { nom: null, octets: 0, jeux: 0, memoire: 0, enCache: false, phase: 'vide' }; this._poses = new Map(); this._ecartes = new Map(); this._niv = {}; }

  /** Les banques déjà gardées sur l'appareil. */
  static async enCache() { try { const c = await caches.open(CACHE); return (await c.keys()).map(r => decodeURIComponent(r.url.split('/').pop())); } catch (e) { return []; } }
  static async oublier(nom) { try { const c = await caches.open(CACHE); return c.delete(ADRESSE(nom)); } catch (e) { return false; } }

  /** Ouvre une banque .sf2 : adresse, fichier choisi par le joueur, ou données. Téléchargée une seule fois, puis lue depuis le cache. */
  async ouvrir(src, o = {}) {
    const nom = o.nom || (typeof src === 'string' ? src.split('/').pop() : src && src.name) || 'banque', prog = (recu, total) => o.onProgres && o.onProgres({ phase: 'telechargement', recu, total, nom });
    this.etat = { nom, octets: 0, jeux: 0, memoire: 0, enCache: false, phase: 'telechargement' };
    let buf = null, cache = null;
    try { cache = await caches.open(CACHE); const r = await cache.match(ADRESSE(nom)); if (r) { buf = await r.arrayBuffer(); this.etat.enCache = true; prog(buf.byteLength, buf.byteLength); } } catch (e) { cache = null; }
    if (!buf) {
      if (src instanceof ArrayBuffer) buf = src;
      else if (typeof src === 'string') {
        const r = await fetch(src); if (!r.ok) throw new Error('Banque introuvable (' + r.status + ') : ' + src);
        const total = +r.headers.get('content-length') || 0;
        if (r.body && r.body.getReader) {                                     // lecture suivie : la barre avance pendant le téléchargement
          const lect = r.body.getReader(), bouts = []; let recu = 0;
          for (;;) { const { done, value } = await lect.read(); if (done) break; bouts.push(value); recu += value.length; prog(recu, total || recu); }
          const tout = new Uint8Array(recu); let p = 0; for (const b of bouts) { tout.set(b, p); p += b.length; } buf = tout.buffer;
        } else buf = await r.arrayBuffer();
      } else if (src && src.arrayBuffer) { buf = await src.arrayBuffer(); prog(buf.byteLength, buf.byteLength); }
      else throw new Error('Aucune banque à ouvrir');
      if (cache && o.cache !== false) try { await cache.put(ADRESSE(nom), new Response(buf.slice(0))); this.etat.enCache = true; } catch (e) {}
    }
    const sf = lireSF2(buf); if (this._poses.size || this._ecartes.size) this.retirer(); this.source = { presets: sf.presets, jeu: async (b, p) => sf.jeu(b, p) };
    Object.assign(this.etat, { titre: sf.nom, octets: buf.byteLength, phase: 'ouverte' });
    try { localStorage.setItem('pupitre.banque', nom); } catch (e) {}
    return sf.presets;
  }

  /** Rouvre la dernière banque utilisée si elle est encore en cache (aucun téléchargement). */
  async reprendre(o = {}) {
    let nom = null; try { nom = localStorage.getItem('pupitre.banque'); } catch (e) {}
    if (!nom || !(await Banques.enCache()).includes(nom)) return null;
    return this.ouvrir(null, Object.assign({}, o, { nom }));
  }

  /** Ouvre un dossier découpé par scripts/decouper-banque.mjs : seul l'index est lu, chaque instrument à la demande. */
  async ouvrirDossier(base, o = {}) {
    base = base.replace(/\/?$/, '/'); const r = await fetch(base + 'index.json'); if (!r.ok) throw new Error('Index de banque introuvable : ' + base);
    const index = await r.json(); if (this._poses.size || this._ecartes.size) this.retirer();
    this.source = { presets: index.presets, jeu: async (b, p) => {
      const e = index.presets.find(x => x.banque === b && x.programme === p) || (b === 128 ? index.presets.find(x => x.banque === 128) : null); if (!e) return null;
      let rep = null, cache = null; try { cache = await caches.open(CACHE); rep = await cache.match(base + e.fichier); } catch (err) {}
      if (!rep) { rep = await fetch(base + e.fichier); if (!rep.ok) return null; if (cache) try { await cache.put(base + e.fichier, rep.clone()); } catch (err) {} }
      return deballer(await rep.arrayBuffer());
    } };
    this.etat = { nom: o.nom || index.nom || base, titre: index.nom, octets: 0, jeux: 0, memoire: 0, enCache: false, phase: 'ouverte' };
    return index.presets;
  }

  /**
   * Prépare les vrais instruments d'une partition (et seulement ceux-là), puis les pose dans le moteur.
   * Trois garde-fous, pour qu'une banque modeste n'abîme jamais un morceau :
   *  - un jeu trop pauvre (sons d'un seul cycle, moins de `dureeMin` s en moyenne) est laissé au synthé, meilleur dans ce cas ;
   *  - un jeu sourd (enregistré sous 20 kHz) est doublé par le synthé (`doublure`, 35 %) qui lui rend ses aigus ;
   *  - chaque instrument est mis au même niveau que le timbre synthétique qu'il remplace : le mixage écrit dans la partition reste valable.
   *    S'il reste trop faible une fois son pic plafonné, le synthé le double pour rendre le corps qui manque.
   */
  async equiper(P, o = {}) {
    if (!this.source) throw new Error('Banques : ouvrir() avant equiper()');
    // la table est refaite pour CE morceau : un instrument associé pour le morceau précédent ne déborde pas sur celui-ci
    const B = besoins(P, o), cles = Object.keys(B), table = {}, manquants = [], pauvres = []; let faits = 0;
    const dureeMin = o.dureeMin ?? 0.2, doublure = o.doublure ?? 0.35;
    this.etat.phase = 'instruments';
    for (const k of cles) {
      o.onProgres && o.onProgres({ phase: 'instruments', faits, total: cles.length, nom: k });
      if (!this._poses.has(k) && !this._ecartes.has(k)) {
        const j = await this.source.jeu(B[k].banque, B[k].programme); await pause();        // on rend la main entre deux instruments : l'écran reste fluide
        if (!j) this._ecartes.set(k, 'absent');
        else if (B[k].banque !== 128 && j.moyenne != null && j.moyenne < dureeMin) this._ecartes.set(k, 'pauvre');
        else { this.pupitre.banque(k, j); this._poses.set(k, { sourd: j.srMax < 20000 }); this.etat.jeux++; this.etat.memoire += j.ech.reduce((s, e) => s + e.length * 2, 0) / 1048576; }
      }
      if (this._ecartes.get(k) === 'absent') manquants.push(k); else if (this._ecartes.has(k)) pauvres.push(k);
      if (this._poses.has(k)) for (const t of B[k].types) if (GM[t]) {
        const { b, p, ...plus } = GM[t];
        table[t] = Object.assign({ ech: k }, plus, this._poses.get(k).sourd && doublure > 0 ? { synthe: doublure } : {});
      }
      faits++;
    }
    this.pupitre.associer(table);
    if (o.niveaux !== false && this.pupitre.K && this.pupitre.K.rendre) { await this._niveaux(P, table, doublure); this.pupitre.associer(table); }
    this.etat.phase = 'prete';
    o.onProgres && o.onProgres({ phase: 'prete', faits, total: cles.length });
    return { instruments: cles.filter(k => this._poses.has(k)), manquants, pauvres };
  }

  // Met chaque vrai instrument au niveau du timbre synthétique qu'il remplace. Quatre notes prises dans la partie écrite pour lui
  // (du grave à l'aigu) sont jouées des deux façons et comparées en énergie, avec un plafond sur le pic : 40 % de plus que le synthé pour la
  // batterie (un vrai coup est plus pointu, et ses pics feraient pomper le limiteur), 80 % pour les instruments à notes.
  // Si, à ce plafond, le vrai instrument reste nettement en dessous (un kick enregistré court face à un kick synthétique qui gronde),
  // le synthé le double pour rendre le corps qui manque : c'est le mélange « vrais instruments + base synthétique ».
  async _niveaux(P, table, doublure) {
    const K = this.pupitre.K, sr = 16000, mes = r => { let s = 0, pic = 0; const n = r.L.length; for (let i = 0; i < n; i++) { s += r.L[i] * r.L[i] + r.R[i] * r.R[i]; const a = Math.max(Math.abs(r.L[i]), Math.abs(r.R[i])); if (a > pic) pic = a; } return { eff: Math.sqrt(s / n), pic }; };
    for (const [k, I] of Object.entries(P.instruments || {})) {
      const t = GM[I.type] ? I.type : GM[k] ? k : null; if (!t || !table[t] || table[t].niveau != null || I.reel === false) continue;
      const toutes = []; for (const S of Object.values(P.sections || {})) for (const e of S.notes || []) if (e[0] === k) toutes.push(e);
      toutes.sort((x, y) => x[3] - y[3]); const choix = toutes.length ? [0, 1, 2, 3].map(i => toutes[Math.round(i * (toutes.length - 1) / 3)]) : [[k, 0, 0, 60, 4, 0.8]];
      const cle = t + '|' + table[t].ech + '|' + choix.map(e => e[3]).join(',') + '|' + JSON.stringify(I);       // même instrument, mêmes réglages, mêmes notes : déjà mesuré
      if (this._niv[cle]) { Object.assign(table[t], this._niv[cle]); continue; }
      const essai = reel => ({ bpm: 120, humain: 0, reel, salle: { niveau: 0 }, instruments: { x: Object.assign({}, I, { groupe: 'principal', joueur: false, pan: 0, synthe: 0, niveau: 1 }) },
        sections: { A: { mesures: 1, notes: choix.map((e, i) => ['x', 0, i * 4, e[3], Math.min(4, e[4] || 1), 0.8]) } }, forme: ['A'] });
      const res = { niveau: 1 };
      try {
        const a = mes(K.rendre(essai(false), 'A', 'tout', sr)), b = mes(K.rendre(essai(true), 'A', 'tout', sr));
        if (a.eff > 1e-6 && b.eff > 1e-6) {
          const plafond = GM[t].b === 128 ? 1.4 : 1.8; let d = table[t].synthe || 0, n = Math.max(0.25, Math.min(4, a.eff / b.eff, plafond * a.pic / b.pic));
          const part = n * b.eff / a.eff; if (part < 0.75 && doublure > 0) d = Math.max(d, Math.min(0.9, Math.sqrt(1 - part * part)));
          if (d > 0) { n = Math.min(n, Math.sqrt(1 - d * d) * a.eff / b.eff, (plafond - d) * a.pic / b.pic); res.synthe = Math.round(d * 100) / 100; }      // vrai + doublure : l'énergie du synthé seul, pics additionnés sous le plafond
          res.niveau = n;
        }
      } catch (e) {}
      Object.assign(table[t], res); this._niv[cle] = res; await pause();                        // la mesure se fait par petits bouts : l'écran de chargement reste fluide
    }
  }

  /** Retire tous les vrais instruments : retour au timbre synthétique. */
  retirer() { for (const k of this._poses.keys()) this.pupitre.banque(k, null); this._poses.clear(); this._ecartes.clear(); this._niv = {}; this.pupitre.associer({}); this.etat.jeux = 0; this.etat.memoire = 0; this.etat.phase = this.source ? 'ouverte' : 'vide'; }
}

if (typeof window !== 'undefined') { window.PupitreBanques = Banques; window.PupitreSF2 = { lireSF2, emballer, deballer, besoins, GM }; }
export { Banques, lireSF2, emballer, deballer, besoins, GM, nomJeu };
