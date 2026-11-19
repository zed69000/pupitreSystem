/*
 * ═══════════════════════════════════════════════════════════════════════════
 *  PUPITRE · régie : console de mixage, rack d'effets et profils musicaux
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   pistes fabriquées (une par famille)                      effets partagés
 *   batterie ─► tranche ─┐                                  ┌─► réverbe (1 seule)
 *   basse    ─► tranche ─┤   tranche = distorsion → égaliseur → chorus → flanger
 *   guitares ─► tranche ─┼─►           → phaser → delay → largeur → balance → volume
 *   …                    │                                  │
 *                        ▼                                  ▼
 *                  général : égaliseur → compresseur → largeur ─► volume ─► limiteur ─► sortie
 *
 *  POURQUOI CE CHOIX
 *  - Le mixage se fait sur des PISTES déjà fabriquées, jamais note par note : une dizaine
 *    de nœuds audio fixes, quel que soit le nombre de notes. C'est ce qui garde le son
 *    sans craquement sur téléphone.
 *  - Un effet à zéro n'est pas câblé du tout : il ne coûte rien.
 *  - Aucun traitement de tranche ne retarde le son (pas de compresseur par piste), donc
 *    les pistes restent alignées entre elles. Seul le compresseur général ajoute 6 ms,
 *    et la régie le déclare (`latence`) pour que l'horloge du jeu en tienne compte.
 *  - Les réglages sont de simples nombres : sauvegarde en une ligne, profils lisibles.
 *
 *  UTILISATION
 *    const regie = new Regie(pupitre);              // à faire AVANT pupitre.charger()
 *    regie.regler('batterie', 'vol', 0.9);          // une tranche
 *    regie.reglerGeneral('comp', 0.4);              // le général
 *    regie.profil('rock');                          // rock, pop, electro, orchestre, acoustique, auto
 *    regie.sauver();                                // sur l'appareil ; relu à la création
 *    regie.panneau(document.querySelector('#audio'));   // l'interface
 */

const FAMILLES = ['batterie', 'basse', 'guitares', 'pianos', 'cordes', 'cuivres', 'synthes', 'autres'];
const NOMS = { batterie: 'Batterie', basse: 'Basse', guitares: 'Guitares', pianos: 'Pianos', cordes: 'Cordes', cuivres: 'Cuivres', synthes: 'Synthés', autres: 'Autres' };

// Réglages d'une tranche : [défaut, min, max, pas, nom, unité]
const TRANCHE = {
  vol: [1, 0, 1.5, 0.01, 'Volume', '%'], pan: [0, -1, 1, 0.02, 'Balance', 'pan'],
  grave: [0, -12, 12, 0.5, 'Graves', 'dB'], graveF: [110, 40, 400, 5, 'Fréquence des graves', 'Hz'],
  medium: [0, -12, 12, 0.5, 'Médiums', 'dB'], mediumF: [1000, 200, 6000, 50, 'Fréquence des médiums', 'Hz'], mediumQ: [1, 0.3, 6, 0.1, 'Largeur des médiums (Q)', ''],
  aigu: [0, -12, 12, 0.5, 'Aigus', 'dB'], aiguF: [6000, 2000, 12000, 100, 'Fréquence des aigus', 'Hz'],
  reverbe: [0, 0, 1, 0.01, 'Réverbération', '%'],
  chorus: [0, 0, 1, 0.01, 'Chorus', '%'], flanger: [0, 0, 1, 0.01, 'Flanger', '%'], phaser: [0, 0, 1, 0.01, 'Phaser', '%'],
  delay: [0, 0, 1, 0.01, 'Delay', '%'], delayTemps: [0.75, 0.25, 2, 0.25, 'Delay : durée', 'temps'], delayRetour: [0.3, 0, 0.75, 0.01, 'Delay : répétitions', '%'],
  disto: [0, 0, 1, 0.01, 'Distorsion', '%'], distoGain: [4, 1, 20, 0.5, 'Distorsion : gain', '×'],
  largeur: [1, 0, 2, 0.02, 'Largeur stéréo', '%'],
};
const GENERAL = {
  vol: [0.85, 0, 1.2, 0.01, 'Volume général', '%'],
  grave: [0, -9, 9, 0.5, 'Graves', 'dB'], graveF: [90, 40, 300, 5, 'Fréquence des graves', 'Hz'],
  medium: [0, -9, 9, 0.5, 'Médiums', 'dB'], mediumF: [1200, 200, 6000, 50, 'Fréquence des médiums', 'Hz'], mediumQ: [0.8, 0.3, 6, 0.1, 'Largeur des médiums (Q)', ''],
  aigu: [0, -9, 9, 0.5, 'Aigus', 'dB'], aiguF: [8000, 2000, 14000, 100, 'Fréquence des aigus', 'Hz'],
  comp: [0, 0, 1, 0.01, 'Compresseur', '%'], largeur: [1, 0, 1.6, 0.02, 'Largeur stéréo', '%'],
  reverbeTaille: [0.6, 0.1, 1, 0.01, 'Réverbe : taille de la salle', '%'], reverbeAmorti: [0.5, 0, 1, 0.01, 'Réverbe : amorti', '%'],
};
const defauts = S => Object.fromEntries(Object.entries(S).map(([k, v]) => [k, v[0]]));
const borne = (S, k, v) => Math.max(S[k][1], Math.min(S[k][2], +v));

// Profils : des écarts par rapport au neutre, volontairement mesurés (quelques dB) pour ne pas dénaturer les instruments
const PROFILS = {
  neutre: { nom: 'Neutre', general: {}, tranches: {} },
  rock: { nom: 'Rock', general: { comp: 0.45, aigu: 1 }, tranches: {
    batterie: { grave: 2, aigu: 1.5, reverbe: 0.08 }, basse: { grave: 1.5, medium: -1.5, mediumF: 400 },
    guitares: { medium: 2, mediumF: 2200, disto: 0.25, largeur: 1.3, reverbe: 0.1 }, pianos: { aigu: 1 }, cuivres: { reverbe: 0.1 } } },
  pop: { nom: 'Pop', general: { comp: 0.35, grave: 1, aigu: 1.5 }, tranches: {
    batterie: { aigu: 2, reverbe: 0.1 }, basse: { grave: 1 }, guitares: { chorus: 0.2, reverbe: 0.12 }, pianos: { aigu: 1.5, reverbe: 0.15 },
    cordes: { reverbe: 0.2 }, cuivres: { reverbe: 0.12 }, synthes: { chorus: 0.25, largeur: 1.3 } } },
  electro: { nom: 'Électro', general: { comp: 0.55, grave: 1.5, aigu: 2, largeur: 1.1 }, tranches: {
    batterie: { grave: 3, aigu: 2 }, basse: { grave: 2, disto: 0.12 }, synthes: { chorus: 0.3, delay: 0.18, largeur: 1.4 }, pianos: { delay: 0.12 }, guitares: { phaser: 0.2 } } },
  orchestre: { nom: 'Orchestre', general: { comp: 0.1, reverbeTaille: 0.85, reverbeAmorti: 0.4 }, tranches: {
    batterie: { reverbe: 0.3 }, basse: { reverbe: 0.15 }, pianos: { reverbe: 0.25 }, cordes: { reverbe: 0.35, largeur: 1.2, aigu: 1 },
    cuivres: { reverbe: 0.3, medium: 1, mediumF: 1800 }, autres: { reverbe: 0.3 }, guitares: { reverbe: 0.25 } } },
  acoustique: { nom: 'Acoustique', general: { comp: 0.2, reverbeTaille: 0.5 }, tranches: {
    batterie: { reverbe: 0.12, aigu: 1 }, basse: { medium: 1, mediumF: 700 }, guitares: { aigu: 1.5, reverbe: 0.18 }, pianos: { reverbe: 0.2 }, cordes: { reverbe: 0.25 }, autres: { reverbe: 0.2 } } },
};

/**
 * Profil automatique : lit les instruments du morceau et choisit le traitement. Renvoie { profil, raison }.
 * La partition peut trancher elle-même avec `profil: 'rock'`. Les règles, dans l'ordre :
 *   guitare saturée → rock ; synthés majoritaires parmi les instruments à notes → électro ;
 *   3 instruments d'orchestre ou plus, sans kick, basse électrique ni guitare → orchestre ;
 *   ni kick ni caisse claire, ni synthé → acoustique ; sinon pop.
 */
function profilAuto(INS, P) {
  if (P && PROFILS[P.profil]) return { profil: P.profil, raison: 'choisi par la partition' };
  const L = Object.values(INS || {}), t = x => L.filter(I => x.test(I.type || '')).length, f = n => L.filter(I => I.famille === n).length;
  const notes = L.length - f('batterie'), synth = f('synthes') + t(/^synth_basse$/), kit = t(/^(kick|kick_electro|caisse)$/);
  const orch = f('cordes') + f('cuivres') + t(/^(flute|clarinette|hautbois|timbales|choeur|grosse_caisse|caisse_militaire)$/);
  if (t(/^guitare_sat$/)) return { profil: 'rock', raison: 'guitare saturée' };
  if (synth >= 2 && synth > notes * 0.6) return { profil: 'electro', raison: synth + ' synthés sur ' + notes + ' instruments à notes' };
  if (orch >= 3 && !t(/^(kick|kick_electro|basse|synth_basse|guitare)/)) return { profil: 'orchestre', raison: orch + ' instruments d\'orchestre' };
  if (!kit && !synth) return { profil: 'acoustique', raison: 'ni batterie ni synthé' };
  return { profil: 'pop', raison: 'groupe mixte' };
}

// ─── Effets (chacun : { e: entrée, s: sortie, regler(mix, etat, tempo) }) ─────
function fxDisto(ctx) {
  const e = ctx.createGain(), s = ctx.createGain(), sec = ctx.createGain(), pre = ctx.createGain(), forme = ctx.createWaveShaper(), hp = ctx.createBiquadFilter(), caisse = ctx.createBiquadFilter(), eff = ctx.createGain();
  const N = 1024, c = new Float32Array(N); for (let i = 0; i < N; i++) c[i] = Math.tanh((i / (N - 1) * 2 - 1) * 2.2); forme.curve = c;
  hp.type = 'highpass'; hp.frequency.value = 90; caisse.type = 'lowpass'; caisse.frequency.value = 4800;      // un ampli ne passe ni l'extrême grave ni l'extrême aigu
  e.connect(sec); sec.connect(s); e.connect(hp); hp.connect(pre); pre.connect(forme); forme.connect(caisse); caisse.connect(eff); eff.connect(s);
  return { e, s, regler(m, E, T, r) { r(sec.gain, 1 - m * 0.85); r(pre.gain, E.distoGain); r(eff.gain, m * 0.9 / Math.sqrt(E.distoGain)); } };
}
function fxModulation(ctx, genre) {
  const e = ctx.createGain(), s = ctx.createGain(), eff = ctx.createGain(), lfo = ctx.createOscillator(), prof = ctx.createGain();
  e.connect(s); lfo.connect(prof); eff.connect(s);
  if (genre === 'phaser') {
    let n = e; lfo.frequency.value = 0.4; prof.gain.value = 500;                                  // 4 filtres passe-tout balayés, ajoutés au son direct : des creux qui voyagent
    for (let i = 0; i < 4; i++) { const a = ctx.createBiquadFilter(); a.type = 'allpass'; a.frequency.value = 700 + i * 350; a.Q.value = 0.7; prof.connect(a.frequency); n.connect(a); n = a; }
    n.connect(eff);
  } else {
    const ch = genre === 'chorus', d1 = ctx.createDelay(0.05), d2 = ctx.createDelay(0.05), fus = ctx.createChannelMerger(2), inv = ctx.createGain();
    d1.delayTime.value = ch ? 0.017 : 0.003; d2.delayTime.value = ch ? 0.023 : 0.0035; lfo.frequency.value = ch ? 0.7 : 0.22; prof.gain.value = ch ? 0.003 : 0.002; inv.gain.value = -1;
    prof.connect(d1.delayTime); prof.connect(inv); inv.connect(d2.delayTime);                                   // les deux côtés bougent en sens opposé : effet large
    e.connect(d1); e.connect(d2); d1.connect(fus, 0, 0); d2.connect(fus, 0, 1); fus.connect(eff);
    if (!ch) { const ret = ctx.createGain(); ret.gain.value = 0.5; d1.connect(ret); ret.connect(d1); }
  }
  lfo.start();
  return { e, s, regler(m, E, T, r) { r(eff.gain, m * (genre === 'chorus' ? 0.7 : 0.8)); } };
}
function fxDelay(ctx) {
  const e = ctx.createGain(), s = ctx.createGain(), d = ctx.createDelay(2.5), ret = ctx.createGain(), filtre = ctx.createBiquadFilter(), eff = ctx.createGain();
  filtre.type = 'lowpass'; filtre.frequency.value = 3800;                                                      // chaque répétition s'assombrit, comme une bande
  e.connect(s); e.connect(d); d.connect(filtre); filtre.connect(eff); eff.connect(s); filtre.connect(ret); ret.connect(d);
  return { e, s, regler(m, E, T, r) { r(eff.gain, m * 0.6); r(ret.gain, E.delayRetour); r(d.delayTime, Math.min(2.4, E.delayTemps * 60 / (T || 120))); } };
}
function fxLargeur(ctx) {
  const e = ctx.createGain(), sep = ctx.createChannelSplitter(2), fus = ctx.createChannelMerger(2), g = [0, 1, 2, 3].map(() => ctx.createGain());
  e.channelCount = 2; e.channelCountMode = 'explicit'; e.connect(sep);
  sep.connect(g[0], 0); g[0].connect(fus, 0, 0); sep.connect(g[1], 1); g[1].connect(fus, 0, 0); sep.connect(g[2], 1); g[2].connect(fus, 0, 1); sep.connect(g[3], 0); g[3].connect(fus, 0, 1);
  return { e, s: fus, regler(w, E, T, r) { r(g[0].gain, (1 + w) / 2); r(g[2].gain, (1 + w) / 2); r(g[1].gain, (1 - w) / 2); r(g[3].gain, (1 - w) / 2); } };
}
function egaliseur(ctx) {
  const b = ['lowshelf', 'peaking', 'highshelf'].map(t => { const f = ctx.createBiquadFilter(); f.type = t; return f; });
  b[0].connect(b[1]); b[1].connect(b[2]);
  return { e: b[0], s: b[2], regler(E, r) { r(b[0].gain, E.grave); r(b[0].frequency, E.graveF); r(b[1].gain, E.medium); r(b[1].frequency, E.mediumF); r(b[1].Q, E.mediumQ); r(b[2].gain, E.aigu); r(b[2].frequency, E.aiguF); } };
}
// Réponse de salle fabriquée en code (bruit qui s'éteint, aigus qui meurent plus vite) : pas de fichier à charger
function salle(ctx, taille, amorti) {
  const sr = ctx.sampleRate, n = Math.round(sr * (0.5 + taille * 3)), buf = ctx.createBuffer(2, n, sr), pre = Math.round(sr * 0.012);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c); let x = 22222 + c * 7919, y = 0;
    for (let i = pre; i < n; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; const t = (i - pre) / (n - pre), k = 0.15 + amorti * 0.8 * Math.min(1, t * 3); y += (1 - k) * ((x / 0x3fffffff - 1) - y); d[i] = y * Math.pow(1 - t, 2) * Math.exp(-3.2 * t) * 0.5; }
  }
  return buf;
}

class Regie {
  constructor(pupitre, o = {}) {
    this.pupitre = pupitre; this.ctx = pupitre.ctx; this.cle = o.sauvegarde === false ? null : o.sauvegarde || 'pupitre.regie'; this.tempo = 120; this.auto = null; this.T = {}; this.surChange = null;
    this.etat = { profil: 'neutre', general: defauts(GENERAL), tranches: {} };
    const ctx = this.ctx, G = this.G = { somme: ctx.createGain(), eq: egaliseur(ctx), comp: ctx.createDynamicsCompressor(), appoint: ctx.createGain(), largeur: null, sortie: ctx.createGain(), conv: ctx.createConvolver(), retour: ctx.createGain(), mesure: ctx.createAnalyser() };
    G.comp.attack.value = 0.012; G.comp.release.value = 0.22; G.comp.knee.value = 8; G.mesure.fftSize = 512;
    G.conv.connect(G.retour); G.retour.connect(G.somme); G.sortie.connect(pupitre.maitre); G.sortie.connect(G.mesure);
    pupitre.regie = this;
    if (o.profil) this.profil(o.profil, false); if (this.cle && o.relire !== false) this.relire();
    this._tout();
  }

  /** Retard ajouté par le traitement (s) : seul le compresseur général anticipe de 6 ms. */
  get latence() { return this.etat.general.comp > 0 ? 0.006 : 0; }
  get familles() { return FAMILLES.filter(f => this.T[f]); }

  _r = (p, v) => { if (!p) return; const t = this.ctx.currentTime; if (p.setTargetAtTime) p.setTargetAtTime(v, t, 0.02); else p.value = v; };
  _et(f) { return this.etat.tranches[f] || (this.etat.tranches[f] = Object.assign({ muet: false, solo: false, effets: true }, defauts(TRANCHE))); }

  /** Entrée de la tranche d'une famille (appelée par Pupitre à chaque lecture). */
  entree(fam) {
    const f = FAMILLES.includes(fam) ? fam : 'autres'; let t = this.T[f];
    if (!t) {
      const ctx = this.ctx; t = this.T[f] = { e: ctx.createGain(), eq: null, fx: {}, pan: ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(), vol: ctx.createGain(), envoi: ctx.createGain(), mesure: ctx.createAnalyser(), chaine: null };
      t.mesure.fftSize = 256; t.pan.connect(t.vol); t.vol.connect(this.G.somme); t.vol.connect(t.envoi); t.envoi.connect(this.G.conv); t.vol.connect(t.mesure);
      this._et(f); this._tranche(f); this.surChange && this.surChange('tranches');
    }
    return t.e;
  }

  // Câble la tranche : seuls les effets utiles sont dans le chemin du son
  _tranche(f) {
    const t = this.T[f]; if (!t) return; const E = this._et(f), ctx = this.ctx, on = E.effets;
    const veut = [on && E.disto > 0 && 'disto', on && (E.grave || E.medium || E.aigu) && 'eq', on && E.chorus > 0 && 'chorus', on && E.flanger > 0 && 'flanger', on && E.phaser > 0 && 'phaser', on && E.delay > 0 && 'delay', on && Math.abs(E.largeur - 1) > 0.01 && 'largeur'].filter(Boolean);
    if (veut.join() !== t.chaine) {
      // on ne débranche que les sorties (entrée de tranche, sortie de chaque effet) : les branchements internes des effets restent en place
      const tous = [t.e, t.eq && t.eq.s, ...Object.values(t.fx).map(x => x.s)].filter(Boolean); for (const n of tous) try { n.disconnect(); } catch (e) {}
      let n = t.e;
      for (const k of veut) {
        let x;
        if (k === 'eq') x = t.eq || (t.eq = egaliseur(ctx));
        else x = t.fx[k] || (t.fx[k] = k === 'disto' ? fxDisto(ctx) : k === 'delay' ? fxDelay(ctx) : k === 'largeur' ? fxLargeur(ctx) : fxModulation(ctx, k));
        n.connect(x.e); n = x.s;
      }
      n.connect(t.pan); t.chaine = veut.join();
    }
    const r = this._r, solo = FAMILLES.some(k => this.etat.tranches[k] && this.etat.tranches[k].solo && this.T[k]);
    if (t.eq) t.eq.regler(E, r);
    for (const k of veut) if (k !== 'eq') t.fx[k].regler(k === 'largeur' ? E.largeur : E[k], E, this.tempo, r);
    if (t.pan.pan) r(t.pan.pan, E.pan);
    r(t.vol.gain, E.muet || (solo && !E.solo) ? 0 : E.vol); r(t.envoi.gain, on ? E.reverbe : 0);
  }
  _general() {
    const G = this.G, E = this.etat.general, r = this._r, veut = (E.comp > 0 ? 'c' : '') + (Math.abs(E.largeur - 1) > 0.01 ? 'l' : '');
    if (veut !== G.chaine) {
      for (const n of [G.somme, G.eq.s, G.appoint, G.largeur && G.largeur.s]) if (n) try { n.disconnect(); } catch (e) {}
      G.somme.connect(G.eq.e); let n = G.eq.s;
      if (E.comp > 0) { n.connect(G.comp); G.comp.connect(G.appoint); n = G.appoint; }
      if (veut.includes('l')) { G.largeur = G.largeur || fxLargeur(this.ctx); n.connect(G.largeur.e); n = G.largeur.s; }
      n.connect(G.sortie); G.chaine = veut;
    }
    G.eq.regler(E, r);
    if (E.comp > 0) { r(G.comp.threshold, -8 - 20 * E.comp); r(G.comp.ratio, 1.5 + 3.5 * E.comp); r(G.appoint.gain, 1 + E.comp * 0.35); }
    if (G.largeur) G.largeur.regler(E.largeur, E, this.tempo, r);
    r(this.pupitre.maitre.gain, E.vol);
    const cle = E.reverbeTaille.toFixed(2) + '|' + E.reverbeAmorti.toFixed(2);
    if (cle !== G.salle) { G.salle = cle; clearTimeout(this._tSalle); const faire = () => { try { G.conv.buffer = salle(this.ctx, E.reverbeTaille, E.reverbeAmorti); } catch (e) {} }; if (G.conv.buffer) this._tSalle = setTimeout(faire, 150); else faire(); }
  }
  _tout() { this._general(); for (const f of FAMILLES) this._tranche(f); }

  /** Règle une tranche : regler('guitares', 'disto', 0.3). Clés : celles de Regie.TRANCHE, plus muet, solo, effets. */
  regler(f, cle, v) {
    const E = this._et(f); if (cle === 'muet' || cle === 'solo' || cle === 'effets') E[cle] = !!v; else if (TRANCHE[cle]) E[cle] = borne(TRANCHE, cle, v); else throw new Error('Réglage inconnu : ' + cle);
    if (cle === 'solo' || cle === 'muet') for (const k of FAMILLES) this._tranche(k); else this._tranche(f);
    this.surChange && this.surChange('reglage', f, cle);
  }
  reglerGeneral(cle, v) { if (!GENERAL[cle]) throw new Error('Réglage inconnu : ' + cle); this.etat.general[cle] = borne(GENERAL, cle, v); this._general(); this.surChange && this.surChange('reglage', 'general', cle); }

  /** Applique un profil. Les volumes, balances, muets et solos choisis à la main sont gardés. */
  profil(nom, notifier = true) {
    let p = nom, raison = null;
    if (nom === 'auto') { const a = this.auto || { profil: 'pop', raison: 'aucun morceau chargé' }; p = a.profil; raison = a.raison; }
    const D = PROFILS[p]; if (!D) throw new Error('Profil inconnu : ' + nom);
    this.etat.profil = nom; this.etat.choisi = p; this.etat.raison = raison;
    this.etat.general = Object.assign(defauts(GENERAL), D.general, { vol: this.etat.general.vol });
    for (const f of FAMILLES) { const a = this._et(f); this.etat.tranches[f] = Object.assign(defauts(TRANCHE), D.tranches[f], { vol: a.vol, pan: a.pan, muet: a.muet, solo: a.solo, effets: a.effets }); }
    if (this.G) this._tout(); if (notifier && this.surChange) this.surChange('profil');
    return p;
  }

  /** Appelé par Pupitre à chaque charger() : tempo du delay et profil automatique. */
  surMorceau(P, INS) {
    this.tempo = P.bpm || 120; this.auto = profilAuto(INS, P);
    this.presentes = FAMILLES.filter(f => Object.values(INS).some(I => (FAMILLES.includes(I.famille) ? I.famille : 'autres') === f)); for (const f of this.presentes) this.entree(f);
    if (this.etat.profil === 'auto') this.profil('auto'); else this._tout();
    this.surChange && this.surChange('tranches');
  }

  sauver(nom) {
    if (!this.cle) return false;
    try { const S = JSON.parse(localStorage.getItem(this.cle) || '{}'); if (nom) (S.profils || (S.profils = {}))[nom] = JSON.parse(JSON.stringify(this.etat)); else S.courant = this.etat; localStorage.setItem(this.cle, JSON.stringify(S)); return true; } catch (e) { return false; }
  }
  /** Relit les réglages gardés sur l'appareil (ou un profil personnel par son nom). Les valeurs hors bornes sont ramenées dans les bornes. */
  relire(nom) {
    let S = null; try { S = JSON.parse(localStorage.getItem(this.cle) || 'null'); } catch (e) {}
    const src = S && (nom ? S.profils && S.profils[nom] : S.courant); if (!src) return false;
    this.appliquer(src); return true;
  }
  profilsPerso() { try { return Object.keys((JSON.parse(localStorage.getItem(this.cle) || '{}').profils) || {}); } catch (e) { return []; } }
  appliquer(src) {
    const g = defauts(GENERAL); for (const k in g) if (src.general && Number.isFinite(+src.general[k])) g[k] = borne(GENERAL, k, src.general[k]);
    this.etat = { profil: src.profil || 'neutre', choisi: src.choisi, raison: src.raison, general: g, tranches: {} };
    for (const f of FAMILLES) { const a = (src.tranches || {})[f] || {}, e = this._et(f); for (const k in TRANCHE) if (Number.isFinite(+a[k])) e[k] = borne(TRANCHE, k, a[k]); e.muet = !!a.muet; e.solo = !!a.solo; e.effets = a.effets !== false; }
    if (this.G) this._tout(); this.surChange && this.surChange('profil');
  }
  reinitialiser() { this.etat = { profil: 'neutre', general: defauts(GENERAL), tranches: {} }; this._tout(); this.surChange && this.surChange('profil'); }

  /** Niveau instantané (0 à 1) d'une tranche, ou du général : pour l'indicateur d'activité. */
  niveau(f) {
    const a = f ? this.T[f] && this.T[f].mesure : this.G.mesure; if (!a || typeof a.getFloatTimeDomainData !== 'function') return 0;
    const b = this._b && this._b.length === a.fftSize ? this._b : (this._b = new Float32Array(a.fftSize)); a.getFloatTimeDomainData(b);
    let p = 0; for (let i = 0; i < b.length; i++) { const x = b[i] < 0 ? -b[i] : b[i]; if (x > p) p = x; } return Math.min(1, p);
  }
  /** Réduction du limiteur de sécurité en dB (0 = il ne travaille pas). */
  get limiteur() { const l = this.pupitre.limiteur; return l && typeof l.reduction === 'number' ? -l.reduction : 0; }

  debrancher() { try { this.G.sortie.disconnect(); } catch (e) {} if (this.pupitre.regie === this) this.pupitre.regie = null; if (this._anim && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this._anim); }
}

// ─── Interface : panneau de contrôle audio ──────────────────────────────────
// Une ligne par famille présente dans le morceau (volume, balance, muet, solo), le détail d'une tranche à la demande,
// le général en tête. Les couleurs suivent celles de la page hôte si elle définit --surface, --encre, --cuivre…
const STYLE = `
.pup{--pf:var(--surface,#171a26);--pc:var(--creux,#20243a);--pt:var(--trait,#2c3046);--pe:var(--encre,#e8e9f1);--pe2:var(--encre-2,#a2a7bf);--pa:var(--cuivre,#e2a24a);--pa2:var(--sur-cuivre,#1b1205);--pok:var(--bon,#4fcf8a);--pko:var(--mauvais,#ff8270);
  color:var(--pe);font:500 15px/1.4 var(--texte,system-ui,-apple-system,"Segoe UI",sans-serif);display:flex;flex-direction:column;gap:14px;min-width:0}
.pup *{box-sizing:border-box}
.pup-b{background:var(--pf);border:1px solid var(--pt);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:12px;min-width:0}
.pup-l{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.pup-t{font:700 16px/1.2 var(--titre,inherit);margin:0;flex:1 1 auto;min-width:0}
.pup-s{font:600 11px/1.2 var(--mono,ui-monospace,Menlo,monospace);letter-spacing:.07em;text-transform:uppercase;color:var(--pe2)}
.pup select,.pup button{font:600 14px/1 inherit;color:var(--pe);background:var(--pc);border:1.5px solid var(--pt);border-radius:999px;padding:0 14px;min-height:40px;cursor:pointer}
.pup button[aria-pressed="true"]{background:var(--pa);border-color:var(--pa);color:var(--pa2)}
.pup button.pup-m[aria-pressed="true"]{background:var(--pko);border-color:var(--pko);color:#1b0b08}
.pup button.pup-r{min-width:44px;padding:0;border-radius:12px}
.pup :is(select,button,input):focus-visible{outline:3px solid var(--pa);outline-offset:2px}
.pup-c{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;align-items:center;min-width:0}
.pup-c span{color:var(--pe2);font-size:13.5px}
.pup-c output{font:600 13px/1 var(--mono,ui-monospace,Menlo,monospace);font-variant-numeric:tabular-nums}
.pup-c input{grid-column:1/-1;width:100%;height:32px;margin:0;accent-color:var(--pa);touch-action:pan-y}
.pup-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px 18px}
.pup-p{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
.pup-vu{height:8px;flex:1 1 60px;min-width:60px;background:var(--pc);border-radius:99px;overflow:hidden}
.pup-vu i{display:block;height:100%;width:100%;transform-origin:0 50%;transform:scaleX(0);background:var(--pok);border-radius:99px}
.pup-vu i.haut{background:var(--pko)}
.pup-n{color:var(--pe2);font-size:13.5px;margin:0}
.pup-nom{flex:1 1 140px;min-width:0;min-height:40px;font:500 15px/1 inherit;color:var(--pe);background:var(--pc);border:1.5px solid var(--pt);border-radius:12px;padding:0 12px}
.pup form[hidden]{display:none}
.pup details>summary{cursor:pointer;font-weight:600;min-height:40px;display:flex;align-items:center;gap:8px}
.pup details>summary::-webkit-details-marker{display:none}
.pup details>summary::before{content:"";width:0;height:0;border-left:7px solid currentColor;border-top:5px solid transparent;border-bottom:5px solid transparent;flex:none}
.pup details[open]>summary::before{transform:rotate(90deg)}
.pup-off{opacity:.55}
@media (prefers-reduced-motion:no-preference){.pup-vu i{transition:transform .08s linear}}
`;
const affiche = (u, v) => u === '%' ? Math.round(v * 100) + ' %' : u === 'dB' ? (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1) + ' dB' : u === 'Hz' ? Math.round(v) + ' Hz' : u === '×' ? '× ' + v
  : u === 'temps' ? ({ 0.25: 'double croche', 0.5: 'croche', 0.75: 'croche pointée', 1: 'noire', 1.5: 'noire pointée', 2: 'blanche' }[v] || v + ' temps') : u === 'pan' ? (Math.abs(v) < 0.02 ? 'centre' : (v < 0 ? 'gauche ' : 'droite ') + Math.round(Math.abs(v) * 100)) : (+v).toFixed(1);

Regie.prototype.panneau = function (hote, o = {}) {
  const R = this, doc = hote.ownerDocument, el = (t, c, txt) => { const n = doc.createElement(t); if (c) n.className = c; if (txt != null) n.textContent = txt; return n; };
  if (!doc.getElementById('pup-style')) { const st = el('style'); st.id = 'pup-style'; st.textContent = STYLE; doc.head.appendChild(st); }
  const racine = el('div', 'pup'); hote.replaceChildren(racine); let ouverte = null; const vus = {};
  const curseur = (S, cle, lire, ecrire) => {
    const [, min, max, pas, nom, u] = S[cle], c = el('label', 'pup-c'), i = el('input'), out = el('output');
    i.type = 'range'; i.min = min; i.max = max; i.step = pas; i.value = lire(); out.textContent = affiche(u, +i.value);
    i.addEventListener('input', () => { ecrire(+i.value); out.textContent = affiche(u, +i.value); }); i.addEventListener('change', () => R.sauver());
    c.append(el('span', '', nom), out, i); return c;
  };
  const bascule = (txt, titre, lire, ecrire, cls) => { const b = el('button', 'pup-r ' + (cls || ''), txt); b.type = 'button'; b.title = titre; b.setAttribute('aria-label', titre); b.setAttribute('aria-pressed', lire()); b.addEventListener('click', () => { ecrire(!lire()); R.sauver(); }); return b; };
  const vu = cle => { const v = el('div', 'pup-vu'), i = el('i'); v.append(i); vus[cle] = i; return v; };

  function dessiner() {
    const E = R.etat; racine.replaceChildren(); for (const k in vus) delete vus[k];
    // ── général ──
    const g = el('div', 'pup-b'), l1 = el('div', 'pup-l'), sel = el('select'), act = el('div', 'pup-l'), lim = el('span', 'pup-s');
    l1.append(el('h3', 'pup-t', 'Général'));
    sel.setAttribute('aria-label', 'Profil musical');
    for (const [k, n] of [['auto', 'Automatique'], ['rock', 'Rock'], ['pop', 'Pop'], ['electro', 'Électro'], ['orchestre', 'Orchestre'], ['acoustique', 'Acoustique'], ['neutre', 'Neutre']]) { const op = el('option', '', n); op.value = k; sel.append(op); }
    for (const n of R.profilsPerso()) { const op = el('option', '', '★ ' + n); op.value = '★' + n; sel.append(op); }
    sel.value = E.profil; sel.addEventListener('change', () => { if (sel.value[0] === '★') R.relire(sel.value.slice(1)); else R.profil(sel.value); R.sauver(); });
    // « Garder » ouvre un champ dans le panneau (pas de boîte de dialogue du navigateur : elles sont bloquées dans une WebView ou une page intégrée)
    const garder = el('button', '', 'Garder…'), nomL = el('form', 'pup-l'), nomI = el('input'), nomOk = el('button', '', 'Enregistrer'); garder.type = 'button'; nomL.hidden = true;
    nomI.type = 'text'; nomI.maxLength = 24; nomI.placeholder = 'Nom de ce réglage'; nomI.setAttribute('aria-label', 'Nom de ce réglage'); nomI.className = 'pup-nom'; nomL.append(nomI, nomOk);
    garder.addEventListener('click', () => { nomL.hidden = !nomL.hidden; if (!nomL.hidden) nomI.focus(); });
    nomL.addEventListener('submit', ev => { ev.preventDefault(); const n = nomI.value.trim(); if (n) { R.sauver(n); dessiner(); } });
    const raz = el('button', '', 'Remettre à zéro'); raz.type = 'button'; raz.addEventListener('click', () => { R.reinitialiser(); R.sauver(); });
    l1.append(sel, garder, raz); g.append(l1, nomL);
    if (E.profil === 'auto' && R.auto) g.append(el('p', 'pup-n', 'Automatique : profil ' + PROFILS[R.auto.profil].nom + ' (' + R.auto.raison + ').'));
    act.append(el('span', 'pup-s', 'Activité'), vu('*'), lim); vus['lim'] = lim; g.append(act);
    g.append(curseur(GENERAL, 'vol', () => E.general.vol, v => R.reglerGeneral('vol', v)));
    const dg = el('details'), gg = el('div', 'pup-g'); dg.append(el('summary', '', 'Égaliseur, compresseur, salle'));
    for (const k of Object.keys(GENERAL)) if (k !== 'vol') gg.append(curseur(GENERAL, k, () => E.general[k], v => R.reglerGeneral(k, v)));
    dg.append(gg, el('p', 'pup-n', 'Le limiteur de sécurité reste toujours en place en sortie.')); dg.open = !!R._ouvertG; dg.addEventListener('toggle', () => { R._ouvertG = dg.open; }); g.append(dg);
    racine.append(g);
    // ── tranches ──
    const fams = (R.presentes || R.familles).filter(f => R.T[f]);
    if (!fams.length) { racine.append(el('p', 'pup-n', 'Les pistes apparaîtront au chargement d\'un morceau.')); return; }
    const grille = el('div', 'pup-p');
    for (const f of fams) {
      const e = R._et(f), b = el('div', 'pup-b' + (e.muet ? ' pup-off' : '')), l = el('div', 'pup-l');
      l.append(el('h3', 'pup-t', NOMS[f]), vu(f),
        bascule('M', 'Couper ' + NOMS[f], () => e.muet, v => R.regler(f, 'muet', v), 'pup-m'), bascule('S', 'Écouter ' + NOMS[f] + ' seul', () => e.solo, v => R.regler(f, 'solo', v)));
      b.append(l, curseur(TRANCHE, 'vol', () => e.vol, v => R.regler(f, 'vol', v)), curseur(TRANCHE, 'pan', () => e.pan, v => R.regler(f, 'pan', v)));
      const d = el('details'), gd = el('div', 'pup-g'), nb = ['disto', 'chorus', 'flanger', 'phaser', 'delay'].filter(k => e[k] > 0).length + (e.reverbe > 0 ? 1 : 0) + (e.grave || e.medium || e.aigu ? 1 : 0);
      d.append(el('summary', '', 'Égalisation et effets' + (nb ? ' · ' + nb + ' actif' + (nb > 1 ? 's' : '') : '')));
      const trait = el('div', 'pup-l'); trait.append(bascule(e.effets ? 'Traitement activé' : 'Traitement coupé', 'Activer ou couper tout le traitement de la piste', () => e.effets, v => R.regler(f, 'effets', v))); trait.firstChild.className = ''; d.append(trait);
      for (const k of Object.keys(TRANCHE)) if (k !== 'vol' && k !== 'pan') gd.append(curseur(TRANCHE, k, () => e[k], v => R.regler(f, k, v)));
      d.append(gd); d.open = ouverte === f; d.addEventListener('toggle', () => { if (d.open) ouverte = f; else if (ouverte === f) ouverte = null; }); b.append(d); grille.append(b);
    }
    racine.append(grille);
  }
  // un curseur qu'on bouge ne redessine pas le panneau (il perdrait le doigt) ; un profil, un muet ou un solo, si
  R.surChange = (quoi, f, cle) => { if (quoi !== 'reglage' || cle === 'muet' || cle === 'solo' || cle === 'effets') dessiner(); o.surChange && o.surChange(quoi, f, cle); };
  dessiner();
  const vue = doc.defaultView, tic = () => {
    if (!racine.isConnected) { R._anim = 0; return; }
    for (const k in vus) if (k === 'lim') { const r = R.limiteur; vus[k].textContent = r > 0.5 ? 'limiteur −' + r.toFixed(1) + ' dB' : ''; }
      else { const n = R.niveau(k === '*' ? null : k), i = vus[k]; i.style.transform = 'scaleX(' + Math.min(1, Math.sqrt(n)).toFixed(3) + ')'; i.classList.toggle('haut', n > 0.89); }
    R._anim = vue.requestAnimationFrame(tic);
  };
  if (vue && vue.requestAnimationFrame) R._anim = vue.requestAnimationFrame(tic);
  return racine;
};
Regie.FAMILLES = FAMILLES; Regie.NOMS = NOMS; Regie.TRANCHE = TRANCHE; Regie.GENERAL = GENERAL; Regie.PROFILS = PROFILS;

if (typeof window !== 'undefined') { window.PupitreRegie = Regie; }
export { Regie, profilAuto, PROFILS, FAMILLES };
