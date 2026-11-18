/* Beat Splash · aide d'écriture commune aux partitions Pupitre (js/musique/*.js).
   Accords nommés, harmonie mesure par mesure (lue par le jeu pour accorder les voix), voicings conduits, batterie. */
(function(){
  const ROOT = {C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11};
  // intervalles depuis la fondamentale, dans l'ordre fond., tierce, quinte, septième, extensions
  const Q = {maj: [0, 4, 7], min: [0, 3, 7], m: [0, 3, 7], 5: [0, 7], sus2: [0, 2, 7], sus4: [0, 5, 7], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9],
    69: [0, 4, 7, 9, 14], add9: [0, 4, 7, 14], madd9: [0, 3, 7, 14], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], 7: [0, 4, 7, 10],
    maj9: [0, 4, 7, 11, 14], m9: [0, 3, 7, 10, 14], 9: [0, 4, 7, 10, 14], 13: [0, 4, 7, 10, 14, 21], m11: [0, 3, 7, 10, 14, 17],
    '7s9': [0, 4, 7, 10, 15], '7b9': [0, 4, 7, 10, 13], m7b5: [0, 3, 6, 10], dim: [0, 3, 6], dim7: [0, 3, 6, 9], aug: [0, 4, 8], '7sus4': [0, 5, 7, 10]};
  // 'E:m9' → {fond: 4, pcs: [4, 7, 11, 2, 6], iv: [0, 3, 7, 10, 14]}
  function acc(nom, k){
    const [r, q] = nom.split(':'), f = (ROOT[r] + (k || 0)) % 12, iv = Q[q || 'maj'];
    if(f == null || isNaN(f) || !iv) throw new Error('Accord inconnu : ' + nom);
    return {nom, fond: f, iv, pcs: iv.map(x => (f + x) % 12)};
  }
  const MODES = {ionien: [0, 2, 4, 5, 7, 9, 11], dorien: [0, 2, 3, 5, 7, 9, 10], phrygien: [0, 1, 3, 5, 7, 8, 10], lydien: [0, 2, 4, 6, 7, 9, 11],
    mixolydien: [0, 2, 4, 5, 7, 9, 10], eolien: [0, 2, 3, 5, 7, 8, 10], harmonique: [0, 2, 3, 5, 7, 8, 11], penta: [0, 2, 4, 7, 9]};
  const gamme = (tonique, mode) => MODES[mode].map(x => (ROOT[tonique] + x) % 12);

  // un cahier de notes par section
  function cahier(){ const N = {}; const add = (sec, ...ns) => { for(const n of ns) (N[sec] = N[sec] || []).push(n); }; return {N, add}; }
  // la note de classe de hauteur pc la plus proche de 'pres', entre lo et hi
  function proche(pc, pres, lo, hi){ let best = null; for(let m = lo; m <= hi; m++) if(((m - pc) % 12 + 12) % 12 === 0 && (best == null || Math.abs(m - pres) < Math.abs(best - pres))) best = m; return best; }
  // la k-ième note de l'accord au-dessus de 'base' (k = 0 fondamentale, 1 tierce, 2 quinte, 3 septième ; au-delà, octave)
  function ton(c, k, base){ const n = c.iv.length >= 4 ? 4 : c.iv.length, o = Math.floor(k/n), i = ((k % n) + n) % n; let m = base + ((c.fond - base) % 12 + 12) % 12; return m + c.iv[i] + 12*o; }
  // voicing conduit : place les notes choisies de l'accord au plus près du voicing précédent
  function voix(prec, c, choix, lo, hi){ const pcs = choix.map(k => (c.fond + c.iv[k]) % 12); return window.PupitreEcriture.conduire(prec, pcs, lo, hi); }
  // rythme en texte → notes : X accent, x normal, g fantôme, o ouvert
  function motif(add, sec, instr, m, txt, midi, vels, tags){ [...txt].forEach((ch, p) => { const v = (vels || {X: 1, x: .72, g: .2, o: .75})[ch]; if(v != null) add(sec, [instr, m, p, midi, ch === 'o' ? 2 : 1, v, tags && tags[p]]); }); }
  // charley en doubles croches avec accents naturels (fort sur le temps, moyen sur le « et », doux entre)
  function charley(add, sec, m, instr, o){ o = o || {}; for(let p = 0; p < 16; p += o.pas || 1){ if(o.ouvert && p === o.ouvert){ add(sec, [o.instrOuvert || 'hho', m, p, 0, 2, .7]); continue; }
    add(sec, [instr || 'hh', m, p, 0, 1, (p % 4 === 0 ? .7 : p % 2 === 0 ? .5 : .28)*(o.vol || 1)]); } }
  // harmonie pour le jeu : liste d'accords par mesure → [[fond, pcs], …]
  const harmonie = liste => liste.map(c => [c.fond, c.pcs]);

  window.K7M = {ROOT, acc, gamme, cahier, proche, ton, voix, motif, charley, harmonie, MODES};
  window.K7PARTITIONS = window.K7PARTITIONS || {};
})();
