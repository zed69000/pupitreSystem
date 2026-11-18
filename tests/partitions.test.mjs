// Les morceaux d'exemple se fabriquent vite, tiennent sous la saturation et ne dépassent pas leur budget de voix.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { K, partitionSerment, partitionSoul } from './aide.mjs';

const cas = [['Serment', partitionSerment(false)], ['Serment en couches', partitionSerment(true)], ['Poche soul', partitionSoul()]];
for (const [nom, P] of cas) {
  test(`${nom} : chaque section se fabrique sans saturer`, () => {
    const groupes = P.pistes ? [...new Set(Object.values(K.resoudre(P)).map(I => I.groupe))] : ['tout'];
    for (const s of Object.keys(P.sections)) for (const g of groupes) {
      const r = K.rendre(P, s, g, 44100);
      assert.ok(r.info.pic < 1.15, `${s}/${g} : pic ${r.info.pic.toFixed(2)}`);
      assert.ok(r.info.voixMax <= 80, `${s}/${g} : ${r.info.voixMax} voix`);
      assert.ok(r.info.duree * 1000 / r.info.ms > 3, `${s}/${g} : trop lent (${(r.info.duree * 1000 / r.info.ms).toFixed(1)}× le temps réel)`);
    }
  });
}

test('la forme réutilise les sections : 4 sections uniques pour 6 passages', () => {
  const c = K.chronologie(partitionSerment(false));
  assert.equal(c.instances.length, 6);
  assert.equal(new Set(c.instances.map(i => i.nom)).size, 4);
});
