// Chaque instrument prêt à l'emploi produit du son, sans valeur aberrante ni saturation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { K } from './aide.mjs';

for (const type of Object.keys(K.PRESETS)) {
  test(`instrument ${type}`, () => {
    const P = { bpm: 120, queue: 1, instruments: { a: { type } }, sections: { s: { mesures: 1, notes: [['a', 0, 0, 60, 4, 1], ['a', 0, 8, 67, 4, 0.4]] } }, forme: ['s'] };
    const r = K.rendre(P, 's', 'tout', 44100);
    let rms = 0;
    for (let i = 0; i < r.L.length; i++) { assert.ok(Number.isFinite(r.L[i]) && Number.isFinite(r.R[i]), 'échantillon non fini'); rms += r.L[i] * r.L[i]; }
    assert.ok(Math.sqrt(rms / r.L.length) > 1e-3, 'silence');
    assert.ok(r.info.pic < 1, `pic trop haut : ${r.info.pic.toFixed(2)}`);
  });
}
