// La beatmap tombe sur le son : les temps sont déterministes (même graine → mêmes temps)
// et chaque attaque fabriquée est à moins de 2 ms du temps annoncé.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { K, partitionSoul } from './aide.mjs';

test('humanisation déterministe', () => {
  const P = partitionSoul(), I = K.resoudre(P);
  const a = K.evenements(P, I, 'A').evts.map(e => e.t), b = K.evenements(P, I, 'A').evts.map(e => e.t);
  assert.deepEqual(a, b);
});

test('swing appliqué aux doubles croches impaires seulement', () => {
  const P = { bpm: 120, swing: 0.6, instruments: { c: { type: 'caisse' } }, sections: { s: { mesures: 1, notes: [['c', 0, 0, 0, 1], ['c', 0, 1, 0, 1], ['c', 0, 2, 0, 1]] } }, forme: ['s'] };
  const [t0, t1, t2] = K.evenements(P, K.resoudre(P), 's').evts.map(e => e.t), s16 = 60 / 120 / 4;
  assert.equal(t0, 0); assert.ok(Math.abs(t1 - 1.2 * s16) < 1e-9); assert.ok(Math.abs(t2 - 2 * s16) < 1e-9);
});

test('les attaques de caisse claire sont à moins de 2 ms de la beatmap', () => {
  const P = partitionSoul(); P.salle.niveau = 0;
  P.sections.A.notes = P.sections.A.notes.filter(n => n[0] === 'caisse');
  const sr = 48000, r = K.rendre(P, 'A', 'tout', sr), evts = K.evenements(P, K.resoudre(P), 'A').evts;
  const E = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += r.L[i] * r.L[i]; return s / (b - a); };
  for (const e of evts) {
    const s0 = Math.round(e.t * sr); let best = 0, bk = 0;
    for (let k = s0 - 480; k <= s0 + 480; k += 4) { const q = E(k, k + 96) / (E(k - 96, k) + 1e-9); if (q > best) { best = q; bk = k; } }
    assert.ok(Math.abs(bk - s0) / sr < 0.002, `attaque décalée de ${((bk - s0) / sr * 1000).toFixed(1)} ms`);
  }
});
