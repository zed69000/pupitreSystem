// Notes du joueur : absentes de la musique fabriquée, fabriquées une par une, jouées à leur heure par jouerNote().
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Pupitre, NOYAU } from '../src/pupitre.js';

const K = NOYAU();
const P = () => ({ bpm: 120, salle: { niveau: 0 }, instruments: { tp: { type: 'trompettes', joueur: true }, k: { type: 'kick' } },
  sections: { A: { mesures: 1, notes: [['k', 0, 0, 36, 2, 1], ['tp', 0, 4, 72, 2, 0.9, 'C1'], ['tp', 0, 8, 74, 2, 0.9], ['tp', 0, 12, 72, 2, 0.9, 'C1']] } }, forme: ['A', 'A'] });

test('la section ne contient pas les notes étiquetées du joueur', () => {
  const p = P(), avec = K.rendre(p, 'A', '*', 8000).info.notes, sans = K.rendre(p, 'A', 'tout', 8000).info.notes;
  assert.equal(avec, 4); assert.equal(sans, 2, 'kick + la note de trompette non étiquetée');
});

test('jouerNote : à l heure de la note, ou tout de suite si en retard', async () => {
  const src = [], Pp = () => ({ value: 1, cancelScheduledValues() {}, setValueAtTime(v) { this.value = v; }, linearRampToValueAtTime() {}, setTargetAtTime() {} });
  const nd = x => Object.assign({ connect(n) { return n; }, disconnect() {} }, x);
  const ctx = { currentTime: 0, sampleRate: 8000, state: 'running', destination: nd({}), resume() {}, createGain: () => nd({ gain: Pp() }),
    createDynamicsCompressor: () => nd({ threshold: Pp(), knee: Pp(), ratio: Pp(), attack: Pp(), release: Pp() }),
    createBuffer: (c, n, sr) => ({ duration: n / sr, copyToChannel() {} }),
    createBufferSource() { const s = nd({ playbackRate: Pp(), start(q) { this.q = q; }, stop(t) { this.arret = t; } }); src.push(s); return s; } };
  const p = new Pupitre(ctx, { workers: 0 }); await p.charger(P(), { qualite: 'haute' }); await new Promise(r => setTimeout(r, 50));
  assert.equal(p.notesJ.size, 1, 'les deux notes identiques ne sont fabriquées qu une fois');
  p.jouer({ quand: 1 }); clearInterval(p._minuteur);
  const notes = p.beatmap(n => n.joueur); assert.equal(notes.length, 4, '2 notes × 2 passages');
  ctx.currentTime = 1.2; assert.ok(p.jouerNote(notes[0])); assert.ok(Math.abs(src.at(-1).q - 1.5) < 1e-9, 'en avance : jouée à son heure');
  ctx.currentTime = 2.6; assert.ok(p.jouerNote(notes[1])); assert.ok(Math.abs(src.at(-1).q - 2.605) < 1e-9, 'en retard : tout de suite');
  // note tenue lâchée trop tôt : stop() l'éteint en fondu
  const h = p.jouerNote(notes[2]); assert.ok(h && h.stop); ctx.currentTime = 3; h.stop(0.1); assert.ok(Math.abs(src.at(-1).arret - 3.12) < 1e-9);
  p.arreter(0);
});

test('jouerSon : un son de frappe déclaré dans la partition, joué tout de suite', async () => {
  const src = [], Pp = () => ({ value: 1, cancelScheduledValues() {}, setValueAtTime(v) { this.value = v; }, linearRampToValueAtTime() {}, setTargetAtTime() {} });
  const nd = x => Object.assign({ connect(n) { return n; }, disconnect() {} }, x);
  const ctx = { currentTime: 0, sampleRate: 8000, state: 'running', destination: nd({}), resume() {}, createGain: () => nd({ gain: Pp() }),
    createDynamicsCompressor: () => nd({ threshold: Pp(), knee: Pp(), ratio: Pp(), attack: Pp(), release: Pp() }),
    createBuffer: (c, n, sr) => ({ duration: n / sr, copyToChannel() {} }),
    createBufferSource() { const s = nd({ playbackRate: Pp(), start(q) { this.q = q; }, stop() {} }); src.push(s); return s; } };
  const P0 = P(); P0.sons = { coupe: ['k', 40, 1, 0.8] };
  const p = new Pupitre(ctx, { workers: 0 }); await p.charger(P0, { qualite: 'haute' }); await new Promise(r => setTimeout(r, 50));
  assert.equal(p.sonsJ.size, 1);
  p.jouer({ quand: 1 }); clearInterval(p._minuteur); ctx.currentTime = 1.3;
  assert.ok(p.jouerSon('coupe')); assert.ok(Math.abs(src.at(-1).q - 1.303) < 1e-9, 'tout de suite');
  assert.equal(p.jouerSon('inconnu'), false);
  p.arreter(0);
});
