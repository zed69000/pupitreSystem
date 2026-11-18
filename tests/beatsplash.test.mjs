// Les morceaux de Beat Splash (exemples/beatsplash/*.js, recopiés dans le jeu) : chaque section se fabrique,
// le pic reste sous 1, et la beatmap a des notes à jouer à chaque niveau.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { NOYAU, Ecriture } from '../src/pupitre.js';

const K = NOYAU(), dir = new URL('../exemples/beatsplash/', import.meta.url);
const bac = { window: {}, PupitreEcriture: Ecriture }; bac.window.PupitreEcriture = Ecriture; vm.createContext(bac);
for (const f of readdirSync(dir).filter(f => f.endsWith('.js'))) vm.runInContext(readFileSync(new URL(f, dir), 'utf8'), bac, { filename: f });
const PARTS = bac.window.K7PARTITIONS || {};

for (const [id, fn] of Object.entries(PARTS)) {
  test(`Beat Splash · ${id} : sections fabriquées, pic sous 1`, () => {
    const P = fn(), I = K.resoudre(P), groupes = P.pistes ? [...new Set(Object.values(I).map(x => x.groupe))] : ['tout'];
    for (const nom of Object.keys(P.sections)) {
      // le pic se juge sur le mélange complet (toutes les couches allumées)
      const R = groupes.map(g => K.rendre(P, nom, g, 22050)), n = Math.max(...R.map(r => r.L.length));
      let pic = 0; for (let i = 0; i < n; i++) { let l = 0, r = 0; for (const x of R) { l += x.L[i] || 0; r += x.R[i] || 0; } pic = Math.max(pic, Math.abs(l), Math.abs(r)); }
      assert.ok(pic < 1, `${nom} : pic ${pic.toFixed(2)}`);
      assert.ok(pic > 0.05 || nom === 'decompte', `${nom} : presque silencieux (${pic.toFixed(3)})`);
    }
  });
  test(`Beat Splash · ${id} : beatmap par niveau`, () => {
    const P = fn(), I = K.resoudre(P);
    for (let lv = 1; lv <= 4; lv++) {
      let n = 0; for (const nom of P.forme) n += K.evenements(P, I, nom).evts.filter(e => /^[CJ]\d$/.test(e.tag || '') && +e.tag[1] <= lv).length;
      assert.ok(n > 40, `niveau ${lv} : seulement ${n} notes`);
    }
  });
}
