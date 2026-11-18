// Partitions de test du moteur Pupitre. Tout est inventé (mélodies, voicings, rythmes).

// ─── 1. « Serment » : thème épique orchestral, ré mineur, 132 BPM ─────────────
// Rôle : test de charge (jusqu'à ~50 voix) et vitrine des timbres orchestraux.
// Forme : intro · A (cors) · B (trompettes + chœur) · A · B · fin → A et B ne sont fabriqués qu'une fois.
function partitionSerment(enCouches) {
  const E = PupitreEcriture, notes = { intro: [], A: [], B: [], fin: [] };
  const CH = { Dm: [2, 'min', 38], Bb: [10, 'maj', 34], F: [5, 'maj', 41], C: [0, 'maj', 36], Gm: [7, 'min', 43], A: [9, 'maj', 45] };
  const TIMB = { Dm: 38, Bb: 46, F: 41, C: 48, Gm: 43, A: 45 };
  const grilles = { intro: ['Dm', 'Bb', 'F', 'C'], A: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'C', 'Dm'], B: ['Bb', 'F', 'C', 'Dm', 'Bb', 'F', 'Gm', 'A'] };
  const pcs = c => E.pcs(CH[c][0], CH[c][1]);
  const add = (sec, ...n) => notes[sec].push(...n);

  // Ostinato des violoncelles « dum da-da » : le moteur rythmique de tout le morceau
  function ostinato(sec, m, c, vel = 1) {
    const r = CH[c][2] + 12, q = r + 7 > 62 ? r - 5 : r + 7;
    for (let b = 0; b < 4; b++) { const n = b === 3 ? q : r; add(sec, ['vc', m, b * 4, n, 1.5, (b === 0 ? 1 : 0.8) * vel], ['vc', m, b * 4 + 2, n, 0.8, 0.55 * vel], ['vc', m, b * 4 + 3, n, 0.8, 0.62 * vel]); }
  }
  // Contrebasses : appuis qui poussent vers l'avant
  function basses(sec, m, c, vel = 1) { const r = CH[c][2]; [[0, 3, 1], [3, 1.5, 0.6], [6, 2, 0.75], [8, 3, 0.9], [11, 1.5, 0.6], [14, 2, 0.8]].forEach(([p, d, v]) => add(sec, ['cb', m, p, r, d, v * vel])); }
  // Seconds violons en arpège de doubles croches sur l'accord (montée-descente)
  let prevArp = null;
  function arpege(sec, m, c, vel = 0.8) {
    const v = E.conduire(prevArp, pcs(c), 62, 77); prevArp = v; const ord = [v[0], v[1], v[2], v[1]];
    for (let p = 0; p < 16; p++) add(sec, ['v2', m, p, ord[p % 4], 0.9, (p % 4 === 0 ? 0.9 : 0.6) * vel]);
  }
  function timbales(sec, m, c, motif) { const n = TIMB[c]; motif.forEach(([p, v]) => add(sec, ['timp', m, p, n, 2, v])); }

  // INTRO : ostinato seul, timbales, cors en pédale, glockenspiel qui annonce le motif
  grilles.intro.forEach((c, m) => { ostinato('intro', m, c, 0.75); add('intro', ['cb', m, 0, CH[c][2], 6, 0.7]); timbales('intro', m, c, [[0, 0.8], [12, 0.45]]); });
  add('intro', ['cors', 0, 0, 62, 32, 0.45], ['cors', 0, 0, 57, 32, 0.4], ['cors', 2, 0, 60, 32, 0.45], ['cors', 2, 0, 57, 32, 0.4]);
  add('intro', ['glock', 0, 0, 81, 6, 0.7], ['glock', 0, 6, 86, 2, 0.6], ['glock', 0, 8, 89, 8, 0.75], ['glock', 2, 0, 81, 6, 0.7], ['glock', 2, 6, 84, 2, 0.6], ['glock', 2, 8, 89, 8, 0.75]);
  add('intro', ['gc', 3, 12, 38, 4, 0.5]);
  for (let p = 8; p < 16; p += 0.5) add('intro', ['timp', 3, p, 38, 0.6, 0.25 + (p - 8) / 8 * 0.55]);   // roulement qui monte

  // A : thème aux cors (question 4 mesures / réponse 4 mesures), flûte qui double la réponse
  const themeA = [
    [[0, 69, 6], [6, 74, 2], [8, 77, 8]], [[0, 74, 6], [6, 72, 2], [8, 70, 4], [12, 69, 4]],
    [[0, 69, 6], [6, 72, 2], [8, 77, 6], [14, 76, 2]], [[0, 76, 12], [12, 69, 2], [14, 72, 2]],
    [[0, 74, 6], [6, 77, 2], [8, 81, 8]], [[0, 79, 6], [6, 77, 2], [8, 74, 4], [12, 77, 4]],
    [[0, 76, 6], [6, 79, 2], [8, 76, 4], [12, 72, 4]], [[0, 74, 16]]];
  prevArp = null;
  grilles.A.forEach((c, m) => {
    ostinato('A', m, c); basses('A', m, c); if (m >= 4) arpege('A', m, c, 0.7);
    timbales('A', m, c, m % 4 === 3 ? [[0, 0.9], [8, 0.6], [12, 0.7], [14, 0.8]] : [[0, 0.9], [10, 0.5], [12, 0.65]]);
    themeA[m].forEach(([p, n, d]) => { add('A', ['cors', m, p, n - 12, d, p === 0 ? 0.85 : 0.75]); if (m >= 4) add('A', ['flute', m, p, n, d, 0.7]); });
    if (m < 4) { const v = E.conduire(null, pcs(c), 55, 67); for (let p = 0; p < 16; p += 2) add('A', ['pizz', m, p, v[(p / 2) % v.length], 1, p % 8 === 0 ? 0.8 : 0.55]); }
    E.motif('cm', m, m % 4 === 3 ? 'x.g.x.ggX.gxgxgx' : 'x.g.x.g.x.g.x.gg', 0, { X: 0.8, x: 0.5, g: 0.18 }).forEach(n => add('A', n));
    if (m === 0 || m === 4) add('A', ['gc', m, 0, 38, 4, 0.75]);
  });

  // B : thème aux trompettes (le motif d'A transposé sur le si bémol), contre-chant des cors,
  // violons en tenues aiguës, chœur, cymbales : le sommet d'énergie
  const themeB = [
    [[0, 65, 6], [6, 70, 2], [8, 74, 8]], [[0, 72, 6], [6, 69, 2], [8, 65, 4], [12, 69, 4]],
    [[0, 67, 6], [6, 72, 2], [8, 76, 6], [14, 74, 2]], [[0, 74, 8], [8, 69, 8]],
    [[0, 77, 6], [6, 74, 2], [8, 70, 8]], [[0, 69, 6], [6, 72, 2], [8, 77, 8]],
    [[0, 79, 8], [8, 77, 4], [12, 74, 4]], [[0, 73, 8], [8, 76, 4], [12, 69, 4]]];
  let pv = null, pc = null, ph = null; prevArp = null;
  grilles.B.forEach((c, m) => {
    ostinato('B', m, c); basses('B', m, c, 1); arpege('B', m, c, 0.85);
    timbales('B', m, c, m === 7 ? [[0, 1], [6, 0.6], [8, 0.8], [10, 0.7], [12, 0.85], [13, 0.7], [14, 0.9], [15, 1]] : [[0, 1], [6, 0.55], [8, 0.75], [12, 0.7], [14, 0.6]]);
    themeB[m].forEach(([p, n, d]) => add('B', ['tp', m, p, n, d, p === 0 ? 1 : 0.85]));
    pv = E.conduire(pv, pcs(c), 69, 84); pv.forEach(n => add('B', ['vn', m, 0, n, 16, 0.7]));
    pc = E.conduire(pc, pcs(c), 57, 72); pc.forEach(n => add('B', ['ch', m, 0, n, 16, 0.65]));
    ph = E.conduire(ph, pcs(c).slice(1), 53, 65); ph.forEach(n => add('B', ['cors', m, 0, n, 8, 0.7], ['cors', m, 8, n, 8, 0.6]));
    if (m === 0 || m === 4) add('B', ['crash', m, 0, 0, 16, 0.9]);
    add('B', ['gc', m, 0, 38, 4, m % 4 === 0 ? 0.95 : 0.6]); if (m % 4 === 3) add('B', ['gc', m, 8, 38, 4, 0.7]);
    E.motif('cm', m, m === 7 ? 'X.gxgxgxXxXxXxXx' : 'X.gxg.x.X.gxg.gx', 0, { X: 0.85, x: 0.55, g: 0.2 }).forEach(n => add('B', n));
  });

  // FIN : accord de ré mineur tenu, roulement de timbales qui enfle, puis coup final sec
  ostinato('fin', 0, 'Dm');
  add('fin', ['tp', 0, 0, 74, 12, 1], ['tp', 0, 0, 69, 12, 0.9], ['cors', 0, 0, 62, 12, 0.85], ['cors', 0, 0, 65, 12, 0.8], ['cb', 0, 0, 38, 3, 1], ['crash', 0, 0, 0, 16, 1], ['gc', 0, 0, 38, 4, 1], ['timp', 0, 0, 38, 2, 1]);
  [74, 77, 81, 86].forEach(n => add('fin', ['vn', 0, 0, n, 12, 0.8])); [62, 65, 69, 74].forEach(n => add('fin', ['ch', 0, 0, n, 12, 0.75]));
  for (let p = 8; p < 16; p += 0.5) { add('fin', ['timp', 0, p, 38, 0.6, 0.35 + (p - 8) / 8 * 0.6]); add('fin', ['cm', 0, p, 0, 0.5, 0.25 + (p - 8) / 8 * 0.6]); }
  [74, 69, 62].forEach(n => add('fin', ['tp', 1, 0, n, 1.5, 1])); [62, 57].forEach(n => add('fin', ['cors', 1, 0, n, 1.5, 1]));
  [50, 57, 62, 65, 69, 74].forEach(n => add('fin', ['v2', 1, 0, n, 1, 1]));
  add('fin', ['cb', 1, 0, 38, 1.5, 1], ['vc', 1, 0, 50, 1.5, 1], ['timp', 1, 0, 38, 2, 1], ['gc', 1, 0, 38, 4, 1], ['crash', 1, 0, 0, 16, 1]);

  const g = (base, heroique) => (enCouches ? heroique : base);
  return {
    bpm: 132, sig: [4, 4], humain: 7, graine: 7, pistes: !!enCouches,
    salle: { taille: 0.86, amorti: 0.35, niveau: 1.1, predelai: 0.025 },
    instruments: {
      vn: { type: 'violons', pan: -0.4, vol: 0.2, groupe: g('base', 'heroique') },
      v2: { type: 'cordes_stacc', pan: -0.15, vol: 0.26, clarte: 6, groupe: 'base' },
      vc: { type: 'cordes_stacc', pan: 0.25, vol: 0.36, clarte: 4, groupe: 'base' },
      cb: { type: 'cordes_stacc', pan: 0.35, vol: 0.34, clarte: 2.5, chute: 0.15, soutien: 0.5, groupe: 'base' },
      pizz: { type: 'pizz', pan: 0.1, vol: 0.4, groupe: 'base' },
      cors: { type: 'cors', pan: -0.25, vol: 0.3, groupe: g('base', 'heroique') },
      tp: { type: 'trompettes', pan: 0.2, vol: 0.36, groupe: g('base', 'heroique') },
      ch: { type: 'choeur', vol: 0.14, groupe: g('base', 'heroique') },
      flute: { type: 'flute', pan: -0.3, vol: 0.26, groupe: 'base' },
      glock: { type: 'glockenspiel', pan: 0.3, vol: 0.22, groupe: 'base' },
      timp: { type: 'timbales', vol: 0.2, groupe: 'base' },
      gc: { type: 'grosse_caisse', vol: 0.36, groupe: 'base' },
      cm: { type: 'caisse_militaire', pan: 0.15, vol: 0.22, groupe: 'base' },
      crash: { type: 'crash', vol: 0.12, groupe: 'base' },
    },
    sections: { intro: { mesures: 4, notes: notes.intro }, A: { mesures: 8, notes: notes.A }, B: { mesures: 8, notes: notes.B }, fin: { mesures: 2, notes: notes.fin } },
    forme: ['intro', 'A', 'B', 'A', 'B', 'fin'],
  };
}

// ─── 2. « Poche soul » : la boucle du défi musique (niveau 1) en version jeu de rythme ──
// 104 BPM, si bémol majeur, Rhodes + basse ronde + batterie acoustique. Une mesure de décompte,
// puis la boucle quatre fois. La boucle n'est fabriquée qu'une fois.
function partitionSoul() {
  const E = PupitreEcriture, A = [], D = [];
  const ACC = [[53, 55, 58, 62], [51, 55, 57, 60], [50, 53, 57, 60], [50, 53, 57, 58], [51, 55, 58, 62], [51, 55, 57, 62], [50, 53, 57, 60], [50, 53, 56, 60]];
  const BASSE = [
    [[0, 39, 3, 1], [6, 39, 1.5, .7], [8, 46, 2, .85], [11, 51, 1, .6], [14, 40, 1.8, .75]],
    [[0, 41, 3, 1], [6, 41, 1.5, .7], [8, 48, 2, .85], [12, 45, 1.2, .6], [14, 39, 1.8, .75]],
    [[0, 38, 3, 1], [6, 38, 1.5, .7], [8, 45, 2, .85], [11, 50, 1, .6], [14, 42, 1.8, .75]],
    [[0, 43, 3, 1], [6, 43, 1.5, .7], [8, 50, 1.6, .85], [10, 46, 1.5, .65], [12, 38, 1.6, .7], [14, 37, 1.8, .75]],
    [[0, 36, 3, 1], [6, 36, 1.5, .7], [8, 43, 2, .85], [11, 48, 1, .6], [14, 40, 1.8, .75]],
    [[0, 41, 3, 1], [6, 41, 1.5, .7], [8, 48, 1.6, .85], [10, 45, 1.5, .65], [12, 36, 1.6, .7], [14, 35, 1.8, .75]],
    [[0, 34, 3, 1], [6, 34, 1.5, .7], [8, 41, 2, .85], [11, 46, 1, .6], [14, 43, 1.8, .7]],
    [[0, 34, 3, 1], [6, 38, 1.5, .7], [8, 44, 1.6, .85], [10, 46, 1.5, .65], [12, 41, 1.6, .7], [14, 38, 1.8, .8]]];
  for (let m = 0; m < 8; m++) {
    E.motif('kick', m, 'x.....x.x.......', 36, { x: 1 }).forEach(n => { if (n[2] !== 0) n[5] = 0.8; A.push(n); });
    E.motif('caisse', m, '....X.......X...', 0, { X: 0.95 }).forEach(n => A.push(n));
    const hh = m % 4 === 3 ? 'x.x.x.x.x.x.x.o.' : 'x.x.x.x.x.x.x.x.';
    [...hh].forEach((c, p) => { if (c === 'x') A.push(['hh', m, p, 0, 1, p % 4 === 0 ? 0.8 : 0.45]); if (c === 'o') A.push(['hho', m, p, 0, 2, 0.7]); });
    if (m === 7) [[12, 0.45], [13, 0.3], [14, 0.6], [15, 0.8]].forEach(([p, v]) => A.push(['caisse', m, p, 0, 1, v]));
    BASSE[m].forEach(([p, n, d, v]) => A.push(['basse', m, p, n, d, v]));
    // accords anticipés : relances sur 6 et 10, l'accord suivant arrive une croche avant la barre
    ACC[m].forEach((n, k) => { A.push(['rh', m, 6 + k * 0.08, n, 1.6, 0.55]); A.push(['rh', m, 10 + k * 0.08, n, 1.2, 0.45]); });
    ACC[(m + 1) % 8].forEach((n, k) => A.push(['rh', m, 14 + k * 0.08, n, 7, 0.85]));
  }
  // décompte : 4 coups de rim, et l'anticipation du premier accord
  [0, 4, 8, 12].forEach((p, k) => D.push(['rim', 0, p, 0, 1, k === 0 ? 1 : 0.75]));
  ACC[0].forEach((n, k) => D.push(['rh', 0, 14 + k * 0.08, n, 7, 0.85]));
  D.push(['basse', 0, 14, 40, 1.8, 0.75]);
  return {
    bpm: 104, sig: [4, 4], humain: 5, graine: 3,
    salle: { taille: 0.55, amorti: 0.5, niveau: 0.6, predelai: 0.015 },
    instruments: {
      rh: { type: 'rhodes', vol: 0.32, verb: 0.2, humain: false },
      basse: { type: 'basse', vol: 0.46 },
      kick: { type: 'kick', vol: 0.6 },
      caisse: { type: 'caisse', vol: 0.38, retard: 6 },
      hh: { type: 'charley', vol: 0.16 }, hho: { type: 'charley_ouvert', vol: 0.14 },
      rim: { type: 'rim', vol: 0.5, humain: false },
    },
    sections: { decompte: { mesures: 1, notes: D }, A: { mesures: 8, notes: A } },
    forme: ['decompte', 'A', 'A', 'A', 'A'],
  };
}
