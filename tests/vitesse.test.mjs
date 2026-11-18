// Vitesse de bande : l'horloge du morceau suit la vitesse, les sections déjà posées changent de vitesse,
// celles qui n'ont pas encore commencé sont reposées au bon endroit (la beatmap reste juste).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Pupitre } from '../src/pupitre.js';

function faux() {
  const P = () => ({ value: 1, cancelScheduledValues() {}, setValueAtTime(v) { this.value = v; }, linearRampToValueAtTime(v) { this.value = v; }, setTargetAtTime(v) { this.value = v; } });
  const noeud = x => Object.assign({ connect(n) { return n; }, disconnect() {} }, x);
  const ctx = {
    currentTime: 0, sampleRate: 8000, state: 'running', destination: noeud({}), sources: [],
    resume() {}, createGain: () => noeud({ gain: P() }),
    createDynamicsCompressor: () => noeud({ threshold: P(), knee: P(), ratio: P(), attack: P(), release: P() }),
    createBuffer: (c, n, sr) => ({ duration: n / sr, copyToChannel() {} }),
    createBufferSource() { const s = noeud({ playbackRate: P(), start(q, o) { this.q = q; this.off = o; }, stop() { this.stopped = true; } }); ctx.sources.push(s); return s; },
  };
  return ctx;
}
const partition = { bpm: 120, salle: { niveau: 0 }, instruments: { c: { type: 'rim' } },
  sections: { A: { mesures: 1, notes: [['c', 0, 0, 0, 1, 1]] }, B: { mesures: 1, notes: [['c', 0, 0, 0, 1, 1]] } }, forme: ['A', 'B', 'A', 'B'] };

test('vitesse : horloge, sections en cours et sections à venir', async () => {
  const ctx = faux(), p = new Pupitre(ctx, { workers: 0 });
  await p.charger(partition, { qualite: 'haute' });
  await new Promise(r => setTimeout(r, 50));            // toutes les sections fabriquées
  p.jouer({ quand: 1 });
  clearInterval(p._minuteur);
  const pos = ct => { ctx.currentTime = ct; return p._morceau(ct); };
  assert.ok(Math.abs(pos(1.5) - 0.5) < 1e-9);
  // à 1,5 s (morceau 0,5 s), la bande ralentit à 0,5 : la 1re section joue déjà, la 2e (à 2 s du morceau) n'a pas commencé
  const avant = ctx.sources.slice();
  p.vitesse(0.5);
  assert.equal(avant[0].playbackRate.value, 0.5, 'la section en cours ralentit');
  assert.ok(avant.slice(1).every(s => s.stopped), 'les sections à venir sont retirées');
  assert.ok(Math.abs(pos(2.5) - 1) < 1e-9, '1 s plus tard à vitesse 0,5 : 0,5 s de morceau en plus');
  // la section B (morceau 2 s) tombe maintenant à 1,5 + 1,5 / 0,5 = 4,5 s : posée quand on s'en approche
  ctx.currentTime = 3.4; p._tic();
  const B = ctx.sources.find(s => !s.stopped && s !== avant[0]);
  assert.ok(B, 'la section suivante est reposée');
  assert.ok(Math.abs(B.q - 4.5) < 1e-9, `section B à 4,5 s, trouvée à ${B.q}`);
  assert.equal(B.playbackRate.value, 0.5);
  // retour à la vitesse normale à 3,4 s (morceau 1,45 s) : B pas encore entendue, reposée à 3,4 + 0,55 = 3,95 s
  p.vitesse(1);
  const B2 = ctx.sources.filter(s => !s.stopped).at(-1);
  assert.ok(B.stopped && Math.abs(B2.q - 3.95) < 1e-9, `B reposée à ${B2.q}`);
  assert.equal(B2.playbackRate.value, 1);
  // tempsA suit aussi la vitesse et le calibrage
  p.calibrage = 100; ctx.currentTime = 3.5; ctx.outputLatency = 0;
  assert.ok(Math.abs(p.position() - 1.45) < 2e-3, `position ${p.position()}`);   // 3,5 − 0,1 de calibrage = 3,4 s → 1,45 s
  p.arreter(0);
});
