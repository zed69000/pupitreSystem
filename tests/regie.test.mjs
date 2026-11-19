// Console de mixage : câblage, muet/solo, profils, sauvegarde, profil automatique (faux contexte audio : le vrai son est essayé par tests/navigateur).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NOYAU } from '../src/pupitre.js';
import { Regie, profilAuto, PROFILS, FAMILLES } from '../src/pupitre-console.js';

// Faux contexte : chaque nœud note vers quoi il est branché ; tout paramètre demandé existe.
function fauxCtx() {
  const param = () => ({ value: 0, setTargetAtTime(v) { this.value = v; }, setValueAtTime(v) { this.value = v; } });
  const noeud = genre => new Proxy({ genre, vers: [], connect(n) { this.vers.push(n); return n; }, disconnect() { this.vers.length = 0; }, start() {}, stop() {} },
    { get(t, k) { if (!(k in t) && typeof k === 'string') t[k] = param(); return t[k]; } });
  return new Proxy({ currentTime: 0, sampleRate: 8000, createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) },
    { get(t, k) { if (k in t) return t[k]; if (typeof k === 'string' && k.startsWith('create')) return () => noeud(k.slice(6)); return undefined; } });
}
const magasin = () => { const m = {}; globalThis.localStorage = { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; return m; };
const faux = () => { const ctx = fauxCtx(), maitre = ctx.createGain(); return { ctx, maitre, limiteur: { reduction: -3 } }; };
// le son d'une tranche arrive-t-il à la sortie ? (parcours des branchements)
const atteint = (de, vers, vus = new Set()) => de === vers || (!vus.has(de) && (vus.add(de), de.vers.some(n => atteint(n, vers, vus))));
const genres = (de, vus = new Set()) => { if (!vus.has(de)) { vus.add(de); de.vers.forEach(n => genres(n, vus)); } return [...vus].map(n => n.genre); };      // tous les nœuds que le son traverse
const chemin = (de, vers, vus = new Set(), acc = []) => { if (de === vers) return acc; if (vus.has(de)) return null; vus.add(de); for (const n of de.vers) { const c = chemin(n, vers, vus, [...acc, n.genre]); if (c) return c; } return null; };

test('une tranche sans aucun effet est branchée droit vers la sortie', () => {
  magasin(); const p = faux(), R = new Regie(p), e = R.entree('batterie');
  assert.ok(atteint(e, p.maitre), 'le son passe'); assert.equal(p.regie, R);
  assert.deepEqual(chemin(e, R.G.somme), ['StereoPanner', 'Gain', 'Gain'], 'ni égaliseur ni effet dans le chemin : rien à payer');
});

test('un effet réglé entre dans le chemin, remis à zéro il en sort', () => {
  magasin(); const p = faux(), R = new Regie(p), e = R.entree('guitares');
  R.regler('guitares', 'disto', 0.3); R.regler('guitares', 'aigu', 2); R.regler('guitares', 'chorus', 0.2);
  assert.equal(R.T.guitares.chaine, 'disto,eq,chorus'); assert.ok(atteint(e, p.maitre));
  assert.ok(genres(e).includes('WaveShaper'));
  R.regler('guitares', 'disto', 0); R.regler('guitares', 'aigu', 0); R.regler('guitares', 'chorus', 0);
  assert.equal(R.T.guitares.chaine, ''); assert.deepEqual(chemin(e, R.G.somme), ['StereoPanner', 'Gain', 'Gain']);
  R.regler('guitares', 'delay', 0.2); R.regler('guitares', 'effets', false); assert.equal(R.T.guitares.chaine, '', 'traitement coupé : chemin direct'); assert.ok(atteint(e, p.maitre));
});

test('muet, solo, volume, balance', () => {
  magasin(); const p = faux(), R = new Regie(p); for (const f of ['batterie', 'basse', 'cordes']) R.entree(f);
  const v = f => R.T[f].vol.gain.value;
  R.regler('batterie', 'vol', 0.7); assert.equal(v('batterie'), 0.7);
  R.regler('batterie', 'muet', true); assert.equal(v('batterie'), 0); R.regler('batterie', 'muet', false);
  R.regler('basse', 'solo', true); assert.deepEqual([v('batterie'), v('basse'), v('cordes')], [0, 1, 0]);
  R.regler('cordes', 'solo', true); assert.deepEqual([v('batterie'), v('basse'), v('cordes')], [0, 1, 1]);
  R.regler('basse', 'solo', false); R.regler('cordes', 'solo', false); assert.deepEqual([v('batterie'), v('basse'), v('cordes')], [0.7, 1, 1]);
  R.regler('cordes', 'pan', -0.4); assert.equal(R.T.cordes.pan.pan.value, -0.4);
  R.regler('cordes', 'vol', 99); assert.equal(R.etat.tranches.cordes.vol, 1.5, 'valeur ramenée dans les bornes');
  assert.throws(() => R.regler('cordes', 'inconnu', 1), /inconnu/);
  assert.equal(R.entree('famille-inconnue'), R.entree('autres'), 'une famille inconnue va dans « Autres »');
});

test('général : compresseur câblé seulement s\'il sert, et son retard est déclaré', () => {
  magasin(); const p = faux(), R = new Regie(p); R.entree('pianos');
  assert.equal(R.latence, 0); assert.deepEqual(chemin(R.G.somme, p.maitre).filter(g => g === 'DynamicsCompressor'), []);
  R.reglerGeneral('comp', 0.5); assert.equal(R.latence, 0.006); assert.ok(chemin(R.G.somme, p.maitre).includes('DynamicsCompressor')); assert.ok(atteint(R.T.pianos.e, p.maitre));
  R.reglerGeneral('largeur', 1.3); assert.ok(atteint(R.T.pianos.e, p.maitre));
  R.reglerGeneral('comp', 0); R.reglerGeneral('largeur', 1); assert.equal(R.latence, 0); assert.ok(atteint(R.T.pianos.e, p.maitre));
  R.reglerGeneral('vol', 0.5); assert.equal(p.maitre.gain.value, 0.5);
  assert.equal(R.limiteur, 3, 'réduction du limiteur lue pour l\'indicateur');
});

test('profils : mesurés, et les réglages faits à la main (volume, balance, muet) sont gardés', () => {
  magasin(); const p = faux(), R = new Regie(p); R.entree('guitares'); R.regler('guitares', 'vol', 0.8); R.regler('guitares', 'muet', true);
  R.profil('rock'); const g = R.etat.tranches.guitares;
  assert.ok(g.disto > 0 && g.vol === 0.8 && g.muet === true); assert.ok(R.etat.general.comp > 0);
  R.profil('orchestre'); assert.equal(R.etat.tranches.guitares.disto, 0, 'changer de profil ne laisse pas de reste du précédent'); assert.ok(R.etat.tranches.cordes.reverbe > 0.2);
  for (const [nom, P] of Object.entries(PROFILS)) for (const T of [P.general, ...Object.values(P.tranches)]) for (const [k, v] of Object.entries(T))
    if (['grave', 'medium', 'aigu'].includes(k)) assert.ok(Math.abs(v) <= 3, `${nom} : ${k} ${v} dB, trop marqué`); else if (['disto', 'chorus', 'flanger', 'phaser', 'delay', 'reverbe'].includes(k)) assert.ok(v <= 0.35, `${nom} : ${k} ${v}`);
  assert.throws(() => R.profil('zouk'), /inconnu/);
});

test('profil automatique : choisi d\'après les instruments du morceau', () => {
  const K = NOYAU(), ins = types => K.resoudre({ instruments: Object.fromEntries(types.map((t, i) => ['i' + i, { type: t }])) });
  assert.equal(profilAuto(ins(['kick', 'caisse', 'basse', 'guitare_sat'])).profil, 'rock');
  assert.equal(profilAuto(ins(['violons', 'violoncelles', 'cors', 'timbales', 'flute'])).profil, 'orchestre');
  assert.equal(profilAuto(ins(['kick_electro', 'synth_basse', 'supersaw', 'synth_lead', 'clap'])).profil, 'electro');
  assert.equal(profilAuto(ins(['guitare', 'contrebasse_pizz', 'piano'])).profil, 'acoustique');
  assert.equal(profilAuto(ins(['kick', 'caisse', 'basse', 'rhodes', 'trompettes'])).profil, 'pop');
  assert.equal(profilAuto(ins(['kick', 'caisse', 'charley', 'basse', 'guitare', 'piano', 'violons', 'altos', 'cuivres_stab', 'choeur'])).profil, 'pop', 'disco avec cordes : un groupe, pas un orchestre');
  assert.equal(profilAuto(ins(['kick', 'clap', 'charley', 'rim', 'ride', 'synth_basse', 'nappe', 'synth_pluck'])).profil, 'electro', 'la batterie ne compte pas comme instrument acoustique');
  assert.equal(profilAuto(ins(['tom', 'rim', 'shaker', 'basse', 'piano', 'trompettes', 'trombones', 'choeur'])).profil, 'acoustique', 'salsa : pas un orchestre');
  assert.equal(profilAuto(ins(['violons', 'cors', 'timbales']), { profil: 'rock' }).profil, 'rock', 'la partition peut choisir');
  magasin(); const p = faux(), R = new Regie(p, { profil: 'auto' });
  R.surMorceau({ bpm: 90 }, ins(['kick', 'basse', 'guitare_sat']));
  assert.equal(R.etat.choisi, 'rock'); assert.equal(R.tempo, 90); assert.deepEqual(R.presentes, ['batterie', 'basse', 'guitares']);
  R.regler('guitares', 'delay', 0.2); assert.ok(genres(R.T.guitares.e).includes('Delay'));
  assert.ok(Math.abs(R.T.guitares.fx.delay.e.vers.find(n => n.genre === 'Delay').delayTime.value - 0.75 * 60 / 90) < 1e-9, 'le delay suit le tempo du morceau (croche pointée)');
});

test('sauvegarde : réglages relus à la création suivante, profils personnels, valeurs abîmées corrigées', () => {
  const m = magasin(); let p = faux(), R = new Regie(p); R.entree('basse');
  R.profil('pop'); R.regler('basse', 'vol', 0.6); R.regler('basse', 'solo', true); R.reglerGeneral('aigu', 2); assert.ok(R.sauver()); assert.ok(R.sauver('mon mix'));
  p = faux(); R = new Regie(p); assert.equal(R.etat.profil, 'pop'); assert.equal(R.etat.tranches.basse.vol, 0.6); assert.equal(R.etat.tranches.basse.solo, true); assert.equal(R.etat.general.aigu, 2);
  assert.deepEqual(R.profilsPerso(), ['mon mix']); R.reinitialiser(); assert.equal(R.etat.tranches.basse, undefined); assert.ok(R.relire('mon mix')); assert.equal(R.etat.tranches.basse.vol, 0.6);
  m['pupitre.regie'] = JSON.stringify({ courant: { general: { vol: 'x', comp: 9 }, tranches: { basse: { vol: -4, grave: 1e9 } } } });
  R = new Regie(faux()); assert.equal(R.etat.general.vol, 0.85); assert.equal(R.etat.general.comp, 1); assert.equal(R.etat.tranches.basse.vol, 0); assert.equal(R.etat.tranches.basse.grave, 12);
  m['pupitre.regie'] = '{cassé'; R = new Regie(faux()); assert.equal(R.etat.profil, 'neutre', 'sauvegarde illisible : réglages neutres, pas de plantage');
  const S = new Regie(faux(), { sauvegarde: false }); assert.equal(S.sauver(), false);
  assert.deepEqual(FAMILLES, ['batterie', 'basse', 'guitares', 'pianos', 'cordes', 'cuivres', 'synthes', 'autres']);
});
