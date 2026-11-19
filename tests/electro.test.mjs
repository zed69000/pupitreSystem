// Outils de musique électronique : pompe sur le kick, glissé, clarté par note, filtre qui ondule, souffles, onde sinus.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NOYAU } from '../src/pupitre.js';

const K = NOYAU(), sr = 32000;
const P1 = (instruments, notes, plus = {}) => Object.assign({ bpm: 120, salle: { niveau: 0 }, instruments, sections: { A: { mesures: 1, notes } }, forme: ['A'] }, plus);
const eff = (x, a, b) => { let s = 0; for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) s += x[i] * x[i]; return Math.sqrt(s / Math.round((b - a) * sr)); };
const frequence = (x, a, b) => { let n = 0, d = -1, f = -1; for (let i = Math.round(a * sr) + 1; i < Math.round(b * sr); i++) if (x[i - 1] < 0 && x[i] >= 0) { const t = i - 1 + x[i - 1] / (x[i - 1] - x[i]); if (d < 0) d = t; f = t; n++; } return (n - 1) * sr / (f - d); };
// part d'énergie au-dessus de fc (dérivée : un passe-haut du pauvre, suffisant pour comparer deux sons)
const brillance = (x, a, b) => { let h = 0, t = 0; for (let i = Math.round(a * sr) + 1; i < Math.round(b * sr); i++) { h += (x[i] - x[i - 1]) ** 2; t += x[i] * x[i]; } return h / t; };

test('pompe : la nappe marquée s\'efface sur chaque kick et revient, les autres instruments ne bougent pas', () => {
  const ins = { k: { type: 'kick_electro', vol: 0.001 }, pad: { type: 'synth_lead', pompe: true, vibrato: 0, voix: 1, soutien: 1, chute: 9 }, fixe: { type: 'synth_lead', vibrato: 0, voix: 1, soutien: 1, chute: 9 } };
  const kicks = [0, 4, 8, 12].map(p => ['k', 0, p, 36, 1, 1]);
  const pompee = K.rendre(P1({ k: ins.k, pad: ins.pad }, [...kicks, ['pad', 0, 0, 60, 16, 0.8]], { pompage: { profondeur: 0.8, duree: 0.25 } }), 'A', 'tout', sr).L;
  const libre = K.rendre(P1({ k: ins.k, fixe: ins.fixe }, [...kicks, ['fixe', 0, 0, 60, 16, 0.8]], { pompage: { profondeur: 0.8, duree: 0.25 } }), 'A', 'tout', sr).L;
  for (const t of [0.5, 1.0, 1.5]) {      // un kick tous les 0,5 s
    assert.ok(eff(pompee, t + 0.005, t + 0.03) < eff(libre, t + 0.005, t + 0.03) * 0.35, 'creusée juste après le kick à ' + t + ' s');
    assert.ok(eff(pompee, t + 0.35, t + 0.45) > eff(libre, t + 0.35, t + 0.45) * 0.9, 'revenue avant le kick suivant');
  }
  let saut = 0; for (let i = sr * 0.4; i < sr * 1.6; i++) saut = Math.max(saut, Math.abs(pompee[i] - pompee[i - 1])); assert.ok(saut < 0.08, 'pas de claquement : ' + saut.toFixed(3));
});

test('pompe : sans instrument marqué, le rendu est identique au bit près (les anciens morceaux ne changent pas)', () => {
  const P = P1({ k: { type: 'kick' }, b: { type: 'synth_basse' } }, [['k', 0, 0, 36, 1, 1], ['b', 0, 2, 40, 2, 0.8], ['k', 0, 8, 36, 1, 1]]);
  const a = K.rendre(P, 'A', 'tout', sr), b = K.rendre(Object.assign({}, P, { pompe: true, pompage: { profondeur: 0.9 } }), 'A', 'tout', sr);
  assert.deepEqual(a.L, b.L);
});

test('glissé : la note part de la hauteur donnée et arrive juste', () => {
  const ins = { b: { type: 'synth_basse', onde: 'sinus', sub: 0, filtre: 9000, filtreBas: 9000, soutien: 1, chute: 9, drive: 0.2 } };
  const r = K.rendre(P1(ins, [['b', 0, 0, 57, 12, 0.8, null, { de: 45, glisse: 0.08 }]]), 'A', 'tout', sr).L;
  assert.ok(frequence(r, 0.0, 0.03) < 150, 'départ une octave plus bas'); assert.ok(Math.abs(frequence(r, 0.6, 1.2) - 220) < 0.5, 'arrivée à 220 Hz : ' + frequence(r, 0.6, 1.2).toFixed(2));
  const droit = K.rendre(P1(ins, [['b', 0, 0, 57, 12, 0.8]]), 'A', 'tout', sr).L; assert.ok(Math.abs(frequence(droit, 0.0, 0.1) - 220) < 1, 'sans option : pas de glissé');
});

test('clarté par note : le filtre s\'ouvre sans que le volume écrit change', () => {
  const ins = { p: { type: 'synth_pluck' } }, r = c => K.rendre(P1(ins, [['p', 0, 0, 60, 2, 0.7, null, { clarte: c }]]), 'A', 'tout', sr).L;
  const sombre = r(0.15), clair = r(2);
  assert.ok(brillance(clair, 0, 0.2) > brillance(sombre, 0, 0.2) * 3, 'plus clair');
});

test('ondulation : le filtre s\'ouvre et se referme au rythme demandé (basse wobble)', () => {
  const ins = { w: { type: 'synth_basse', ondule: 4, onduleProf: 0.9, filtre: 3000, filtreBas: 3000, soutien: 1, chute: 9, sub: 0 } };
  const r = K.rendre(P1(ins, [['w', 0, 0, 45, 16, 0.9]]), 'A', 'tout', sr).L;      // 4 Hz : fermé à 0 ; 0,25 ; 0,5 s, ouvert à 0,125 ; 0,375 s
  for (const t of [0.125, 0.375, 0.625]) assert.ok(brillance(r, t - 0.02, t + 0.02) > brillance(r, t + 0.105, t + 0.145) * 4, 'ouvert à ' + t + ' s, fermé un huitième de seconde après');
  const autre = K.rendre(P1(ins, [['w', 0, 0, 45, 16, 0.9, null, { ondule: 8 }]]), 'A', 'tout', sr).L;
  assert.ok(brillance(autre, 0.0425, 0.0825) > brillance(autre, 0.105, 0.145) * 4, 'vitesse changée pour une note');
});

test('souffles : la montée grandit jusqu\'au bout puis se coupe net, la retombée frappe puis s\'éteint', () => {
  const m = K.rendre(P1({ m: { type: 'montee' } }, [['m', 0, 0, 60, 8, 1]]), 'A', 'tout', sr).L;      // 8 pas = 1 s
  assert.ok(eff(m, 0.8, 0.98) > eff(m, 0.1, 0.3) * 5, 'elle grandit'); assert.ok(eff(m, 1.1, 1.3) < eff(m, 0.8, 0.98) * 0.02, 'coupée net');
  assert.ok(brillance(m, 0.8, 0.98) > brillance(m, 0.15, 0.3) * 3, 'le filtre monte');
  const d = K.rendre(P1({ d: { type: 'retombee' } }, [['d', 0, 0, 60, 8, 1]]), 'A', 'tout', sr).L;
  assert.ok(eff(d, 0, 0.1) > eff(d, 0.7, 0.9) * 5, 'elle retombe'); assert.ok(d.every(Number.isFinite));
});

test('la beatmap ignore les options de note : mêmes temps avec ou sans', () => {
  const ins = { b: { type: 'synth_basse' } }, t = n => K.evenements(P1(ins, n, { swing: 0.58, humain: 6 }), K.resoudre(P1(ins, n)), 'A').evts.map(e => e.t);
  assert.deepEqual(t([['b', 0, 3, 45, 2, 0.8, 'C1', { de: 33 }]]), t([['b', 0, 3, 45, 2, 0.8, 'C1']]));
});
