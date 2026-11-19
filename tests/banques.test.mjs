// Vrais instruments : lecture d'une banque SF2, justesse, couches de vélocité, boucle, synchro, repli sur le synthé.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NOYAU, Pupitre } from '../src/pupitre.js';
import { lireSF2, emballer, deballer, besoins, Banques } from '../src/pupitre-banques.js';
import { banqueDeTest, fabriquerSF2, SR } from './fabrique-sf2.mjs';

const sf = lireSF2(banqueDeTest());
const noyau = () => { const K = NOYAU(); K.poserJeu('gm:0:0', sf.jeu(0, 0)); K.poserJeu('gm:128:0', sf.jeu(128, 0)); K.associer({ piano: { ech: 'gm:0:0' }, kick: { ech: 'gm:128:0', note: 36 }, charley: { ech: 'gm:128:0', note: 42 }, charley_ouvert: { ech: 'gm:128:0', note: 46 } }); return K; };
const P1 = (notes, plus = {}) => Object.assign({ bpm: 120, salle: { niveau: 0 }, instruments: { p: { type: 'piano', desaccord: 0 }, k: { type: 'kick' }, h: { type: 'charley' }, o: { type: 'charley_ouvert' } }, sections: { A: { mesures: 1, notes } }, forme: ['A'] }, plus);
// énergie d'une fréquence (Goertzel) et fréquence par passages à zéro
const energie = (x, a, b, f, sr) => { const w = 2 * Math.PI * f / sr, c = 2 * Math.cos(w); let s1 = 0, s2 = 0; for (let i = a; i < b; i++) { const s0 = x[i] + c * s1 - s2; s2 = s1; s1 = s0; } return Math.sqrt(Math.max(0, s1 * s1 + s2 * s2 - c * s1 * s2)) / (b - a); };
const frequence = (x, a, b, sr) => { let n = 0, d = -1, f = -1; for (let i = a + 1; i < b; i++) if (x[i - 1] < 0 && x[i] >= 0) { const t = i - 1 + x[i - 1] / (x[i - 1] - x[i]); if (d < 0) d = t; f = t; n++; } return (n - 1) * sr / (f - d); };
const eff = (x, a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / (b - a)); };

test('la banque est lue : instruments, zones, étendues', () => {
  assert.deepEqual(sf.presets.map(p => [p.banque, p.programme, p.nom]), [[0, 0, 'Piano de test'], [128, 0, 'Kit de test']]);
  const j = sf.jeu(0, 0); assert.equal(j.zones.length, 2);
  assert.deepEqual(j.zones.map(z => [z.vlo, z.vhi]), [[0, 79], [80, 127]]);
  assert.ok(j.zones.every(z => z.bB > z.bA && z.bA >= 0 && z.root === 60 && z.sr === SR && z.mode === 1));
  assert.ok(Math.abs(j.zones[0].rel - 0.25) < 0.01, 'relâche lue en secondes');
  assert.equal(sf.jeu(128, 0).zones.length, 3); assert.equal(sf.jeu(0, 99), null, 'instrument absent');
});

test('le silence de tête est retiré : le son démarre dans les 4 premiers échantillons', () => {
  for (const [b, p] of [[0, 0], [128, 0]]) for (const e of sf.jeu(b, p).ech.slice(0, 3)) { let i = 0; while (Math.abs(e[i]) < 40) i++; assert.ok(i <= 8, 'silence restant : ' + i); }
});

test('un fichier qui n\'est pas une banque, ou une banque compressée, est refusé clairement', () => {
  assert.throws(() => lireSF2(new ArrayBuffer(64)), /pas une banque/);
  assert.throws(() => lireSF2(fabriquerSF2({ sons: [{ nom: 'a', data: new Int16Array(100), sr: SR }], instruments: [{ nom: 'i', zones: [[[53, 0]]] }], presets: [{ nom: 'p', banque: 0, programme: 0, zones: [[[41, 0]]] }], version: 3 })), /SF3/);
});

test('justesse : un la 440 écrit sonne à 440 Hz, à toutes les fréquences de rendu', () => {
  for (const sr of [32000, 44100, 48000]) {
    const r = noyau().rendre(P1([['p', 0, 0, 69, 8, 0.5]]), 'A', 'tout', sr), f = frequence(r.L, sr * 0.1, sr * 0.6, sr);
    assert.ok(Math.abs(f - 440) < 0.6, `à ${sr} Hz : ${f.toFixed(2)} Hz`);
  }
});

test('la note tenue dure plus longtemps que l\'enregistrement (boucle), puis s\'éteint à la relâche', () => {
  const sr = 32000, r = noyau().rendre(P1([['p', 0, 0, 60, 8, 0.6]]), 'A', 'tout', sr);     // 8 pas = 1 s, enregistrement = 0,25 s
  const a = eff(r.L, sr * 0.1, sr * 0.2), b = eff(r.L, sr * 0.8, sr * 0.9), c = eff(r.L, sr * 1.5, Math.min(r.L.length, sr * 1.6));
  assert.ok(b > a * 0.8, 'le son tient'); assert.ok(c < a * 0.01, 'le son s\'éteint');
  let saut = 0; for (let i = sr * 0.05; i < sr * 0.95; i++) saut = Math.max(saut, Math.abs(r.L[i] - r.L[i - 1])); assert.ok(saut < 0.03, 'pas de clic au bouclage : ' + saut);
});

test('couches de vélocité : jouer fort change le timbre, pas seulement le volume', () => {
  const sr = 32000, K = noyau(), h2 = v => { const r = K.rendre(P1([['p', 0, 0, 60, 8, v, 0]], { instruments: { p: { type: 'piano', dynamique: 0 } } }), 'A', 'tout', sr); return energie(r.L, 3200, 16000, 523.25, sr) / energie(r.L, 3200, 16000, 261.63, sr); };
  assert.ok(h2(0.4) < 0.05, 'couche douce : pas d\'octave'); assert.ok(h2(0.9) > 0.5, 'couche forte : octave présente');
});

test('jeu doux = son plus feutré (filtre qui suit la vélocité), même sur une banque à une seule couche', () => {
  const sr = 32000, K = noyau(), aigu = dyn => { const r = K.rendre(P1([['p', 0, 0, 96, 4, 0.3]], { instruments: { p: { type: 'piano', dynamique: dyn } } }), 'A', 'tout', sr); return eff(r.L, 1600, 8000); };
  assert.ok(aigu(6) < aigu(0) * 0.8);
});

test('synchro : l\'attaque d\'un coup échantillonné est à moins de 2 ms de la beatmap', () => {
  const sr = 48000, K = noyau(), P = P1([['k', 0, 0, 36, 1, 1], ['k', 0, 5, 36, 1, 1], ['k', 0, 11, 36, 1, 0.8]], { swing: 0.6, humain: 6 });
  const r = K.rendre(P, 'A', 'tout', sr), evts = K.evenements(P, K.resoudre(P), 'A').evts;
  for (const e of evts) { const s0 = Math.round(e.t * sr); let i = Math.max(0, s0 - 960); while (Math.abs(r.L[i]) + Math.abs(r.R[i]) < 0.02) i++; assert.ok(Math.abs(i - s0) / sr < 0.002, `attaque à ${((i - s0) / sr * 1000).toFixed(2)} ms`); }
});

test('la beatmap est la même avec ou sans banque (seul le timbre change)', () => {
  const P = P1([['p', 0, 0, 60, 4, 0.8], ['k', 0, 4, 36, 1, 1], ['h', 0, 6, 60, 1, 0.5]], { swing: 0.58, humain: 7 }), K0 = NOYAU(), K1 = noyau();
  const t = K => K.evenements(P, K.resoudre(P), 'A').evts.map(e => [e.t, e.vel, e.instr]);
  assert.deepEqual(t(K0), t(K1));
  assert.equal(K0.resoudre(P).p.classe, 'Piano'); assert.equal(K1.resoudre(P).p.classe, 'Echantillon');
});

test('sans banque, ou avec reel: false, le timbre synthétique joue : le jeu n\'est jamais muet', () => {
  const K = noyau(), P = P1([['p', 0, 0, 60, 4, 0.8]]);
  assert.equal(K.resoudre(Object.assign({}, P, { reel: false })).p.classe, 'Piano');
  assert.equal(K.resoudre(P1([], { instruments: { p: { type: 'piano', reel: false } } })).p.classe, 'Piano');
  const libre = P1([['x', 0, 0, 60, 4, 0.8]], { instruments: { x: { type: 'ech', prog: 40, secours: 'violons' } } });
  assert.equal(K.resoudre(libre).x.classe, 'Cordes', 'programme absent de la banque : instrument de secours');
  assert.ok(K.rendre(libre, 'A', 'tout', 16000).info.pic > 0.01);
  assert.equal(K.resoudre(P1([], { instruments: { x: { type: 'ech', prog: 0 } } })).x.classe, 'Echantillon', 'programme demandé par la partition');
});

test('doublure : le synthé se mélange au vrai instrument', () => {
  const K = noyau(), sans = K.rendre(P1([['p', 0, 0, 60, 4, 0.8]]), 'A', 'tout', 16000).info, avec = K.rendre(P1([['p', 0, 0, 60, 4, 0.8]], { instruments: { p: { type: 'piano', synthe: 0.5 } } }), 'A', 'tout', 16000).info;
  assert.equal(sans.voixMax, 1); assert.equal(avec.voixMax, 2);
});

test('batterie : un coup sonne en entier, et le charley fermé coupe le charley ouvert', () => {
  const sr = 32000, K = noyau();
  const seul = K.rendre(P1([['o', 0, 0, 60, 1, 1]]), 'A', 'tout', sr), coupe = K.rendre(P1([['o', 0, 0, 60, 1, 1], ['h', 0, 2, 60, 1, 0.3]]), 'A', 'tout', sr);
  const a = eff(seul.R, sr * 0.3, sr * 0.4), b = eff(coupe.R, sr * 0.3, sr * 0.4);
  assert.ok(a > 1e-4, 'le charley ouvert sonne au-delà de sa durée écrite (0,06 s)'); assert.ok(b < a * 0.05, 'coupé par le fermé');
  assert.ok(eff(seul.R, 0, 3200) > eff(seul.L, 0, 3200) * 1.3, 'panoramique de la banque respecté');
});

test('toutes les valeurs sont finies et le pic reste sous 1', () => {
  const notes = []; for (let p = 0; p < 16; p++) { notes.push(['p', 0, p, 48 + p * 2, 3, 0.4 + (p % 4) * 0.2], ['h', 0, p, 60, 1, 0.6]); if (p % 4 === 0) notes.push(['k', 0, p, 36, 1, 1]); }
  const r = noyau().rendre(P1(notes, { salle: { niveau: 0.8 }, instruments: { p: { type: 'piano', vol: 0.3 }, k: { type: 'kick', vol: 0.5 }, h: { type: 'charley' } } }), 'A', 'tout', 32000);
  assert.ok(r.L.every(Number.isFinite) && r.R.every(Number.isFinite)); assert.ok(r.info.pic > 0.05 && r.info.pic < 1, 'pic ' + r.info.pic);
});

test('un instrument emballé dans un fichier se relit à l\'identique', () => {
  const j = sf.jeu(0, 0), k = deballer(emballer(j));
  assert.deepEqual(k.zones, j.zones); assert.equal(k.gain, j.gain); assert.deepEqual([...k.ech[1].subarray(0, 500)], [...j.ech[1].subarray(0, 500)]);
  assert.throws(() => deballer(new ArrayBuffer(16)), /pas un instrument/);
});

test('seuls les instruments de la partition sont préparés', async () => {
  const P = P1([], { instruments: { p: { type: 'piano' }, k: { type: 'kick' }, h: { type: 'charley' }, s: { type: 'supersaw' }, f: { type: 'flute' } } });
  assert.deepEqual(Object.keys(besoins(P)).sort(), ['gm:0:0', 'gm:0:73', 'gm:128:0']);
  const poses = [], faux = { reel: {}, banque: (n, j) => poses.push([n, !!j]), associer(t) { this.reel = t; } }, B = new Banques(faux);
  await B.ouvrir(banqueDeTest(), { nom: 'test' });
  const etapes = [], r = await B.equiper(P, { onProgres: p => etapes.push(p.phase + ' ' + p.faits + '/' + p.total) });
  assert.deepEqual(r.instruments.sort(), ['gm:0:0', 'gm:128:0']); assert.deepEqual(r.manquants, ['gm:0:73'], 'la flûte manque dans cette banque : elle restera synthétique');
  assert.deepEqual(Object.keys(faux.reel).sort(), ['charley', 'kick', 'piano']); assert.equal(faux.reel.kick.note, 36);
  assert.equal(etapes.at(-1), 'prete 3/3'); assert.ok(B.etat.memoire > 0);
  await B.equiper(P); assert.equal(poses.length, 2, 'un instrument déjà posé n\'est pas refait');
  B.retirer(); assert.deepEqual(faux.reel, {}); assert.equal(poses.filter(p => !p[1]).length, 2);
});

// ─── côté jeu : pistes par famille pour la console ───
const fauxCtx = () => { const Pp = () => ({ value: 1, cancelScheduledValues() {}, setValueAtTime(v) { this.value = v; }, linearRampToValueAtTime() {}, setTargetAtTime(v) { this.value = v; } });
  const nd = x => Object.assign({ vers: [], connect(n) { this.vers.push(n); return n; }, disconnect() {} }, x);
  return { currentTime: 0, sampleRate: 8000, state: 'running', destination: nd({}), resume() {}, createGain: () => nd({ gain: Pp() }), createDynamicsCompressor: () => nd({ threshold: Pp(), knee: Pp(), ratio: Pp(), attack: Pp(), release: Pp() }),
    createBuffer: (c, n, sr) => ({ duration: n / sr, copyToChannel() {} }), createBufferSource() { return nd({ playbackRate: Pp(), start() {}, stop() {} }); }, nd }; };

test('avec une console, chaque famille a sa piste et va dans sa tranche ; les couches du jeu marchent toujours', async () => {
  const ctx = fauxCtx(), p = new Pupitre(ctx, { workers: 0 }), entrees = {};
  p.regie = { latence: 0.006, entree: f => entrees[f] || (entrees[f] = ctx.nd({ famille: f })) };
  const P = { bpm: 120, pistes: true, salle: { niveau: 0 }, instruments: { k: { type: 'kick', groupe: 'base' }, b: { type: 'basse', groupe: 'base' }, t: { type: 'trompettes', groupe: 'heroique' }, v: { type: 'violons', groupe: 'heroique' } },
    sections: { A: { mesures: 1, notes: [['k', 0, 0, 36, 1, 1], ['b', 0, 0, 40, 4, 0.8], ['t', 0, 4, 72, 4, 0.8], ['v', 0, 0, 67, 8, 0.6]] } }, forme: ['A'] };
  await p.charger(P, { qualite: 'haute' }); await new Promise(r => setTimeout(r, 80));
  assert.deepEqual([...p.groupes].sort(), ['base/basse', 'base/batterie', 'heroique/cordes', 'heroique/cuivres']);
  assert.equal(P.familles, undefined, 'la partition du jeu n\'est pas modifiée');
  p.jouer({ quand: 1 }); clearInterval(p._minuteur);
  assert.deepEqual(Object.keys(entrees).sort(), ['basse', 'batterie', 'cordes', 'cuivres']);
  p.groupe('heroique', 0, 0.1); assert.equal(p._bus['heroique/cuivres'].gain.value, 0); assert.equal(p._bus['heroique/cordes'].gain.value, 0); assert.equal(p._bus['base/basse'].gain.value, 1);
  p.ctx.currentTime = 3; const ecart = (3 - 1) - p.tempsA(performance.now());
  assert.ok(Math.abs(ecart - 0.006) < 0.02, 'l\'horloge tient compte du retard de la console');
  p.arreter(0);
});

test('sans console, rien ne change : une seule piste, mêmes clés qu\'avant', async () => {
  const p = new Pupitre(fauxCtx(), { workers: 0 });
  await p.charger({ bpm: 120, salle: { niveau: 0 }, instruments: { k: { type: 'kick' } }, sections: { A: { mesures: 1, notes: [['k', 0, 0, 36, 1, 1]] } }, forme: ['A'] }, { qualite: 'haute' }); await new Promise(r => setTimeout(r, 50));
  assert.deepEqual(p.groupes, ['tout']); assert.deepEqual([...p.buffers.keys()], ['A|tout']);
});

test('dossier découpé : seul l\'index est lu, puis un fichier par instrument demandé', async () => {
  const fichiers = { 'sons/index.json': JSON.stringify({ nom: 'Test', presets: [{ banque: 0, programme: 0, nom: 'Piano', fichier: 'gm-0-0.pjeu' }, { banque: 128, programme: 0, nom: 'Kit', fichier: 'gm-128-0.pjeu' }] }), 'sons/gm-0-0.pjeu': emballer(sf.jeu(0, 0)), 'sons/gm-128-0.pjeu': emballer(sf.jeu(128, 0)) };
  const lus = [], avant = globalThis.fetch;
  globalThis.fetch = async u => { lus.push(u); const d = fichiers[u]; return { ok: d != null, status: d != null ? 200 : 404, json: async () => JSON.parse(d), arrayBuffer: async () => d, clone() { return this; } }; };
  try {
    const poses = [], B = new Banques({ reel: {}, banque: (n, j) => poses.push([n, j.zones.length]), associer(t) { this.reel = t; } });
    await B.ouvrirDossier('sons'); assert.deepEqual(lus, ['sons/index.json']);
    await B.equiper(P1([], { instruments: { p: { type: 'piano' }, s: { type: 'supersaw' } } }));
    assert.deepEqual(lus, ['sons/index.json', 'sons/gm-0-0.pjeu'], 'la batterie, absente du morceau, n\'est pas téléchargée'); assert.deepEqual(poses, [['gm:0:0', 2]]);
  } finally { globalThis.fetch = avant; }
});
