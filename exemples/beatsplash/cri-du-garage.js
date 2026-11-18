/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Cri du garage » (niveau 9, face I) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Cri du garage
   Rôle :               niveau 9 : tous les gestes ; couper / tenir = la guitare lead, taper = la caisse claire
   Émotion et énergie : calme puis fort : couplet qui chuchote (6/10), refrain qui explose (10/10)
   Style de référence : rock alternatif de la fin des années 80 / début 90 (couleurs : couplet en guitare claire et
                        basse, refrain en mur de guitares saturées, batterie qui cogne)
   Tempo / métrique :   138 BPM, 4/4 droit
   Tonalité / mode :    mi mineur ; le final monte d'un ton (fa# mineur)
   Harmonie :           couplet Em · C · G · D ; refrain C · D · Em · Em · C · D · B7 · B7 (le si7 qui tire vers mi)
   Instruments :        guitare lead saturée (le joueur), caisse claire (le joueur), guitare claire en arpèges,
                        guitares saturées et étouffées, basse saturée, kick, charley, ride, crash ; transe : deuxième
                        guitare à l'octave, chœur « a », toms
   Interdits :          synthés, cuivres
   Signature :          le contraste : le couplet presque nu (arpège clair + basse), puis le mur de guitares
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.garage = function(){
    const batterie = (add, sec, m, o) => { o = o || {};
      [...(o.fort ? 'x.x...x.x.x...x.' : 'x.......x.x.....')].forEach((c, p) => { if(c === 'x') add(sec, ['kick', m, p, 36, 2, p ? .85 : 1]); });
      add(sec, ['cs', m, 4, 0, 2, o.fort ? 1 : .8, o.tags ? o.tags[0] : undefined], ['cs', m, 12, 0, 2, o.fort ? 1 : .8, o.tags ? o.tags[1] : undefined]);
      for(let p = 0; p < 16; p += 2) add(sec, [o.fort ? 'ride' : 'hh', m, p, 0, 1, p % 4 ? .45 : .65]);
      if(o.fill) [[12, 52], [13, 50], [14, 47], [15, 43]].forEach(([p, n], i) => add(sec, ['tom', m, p, n, 1.5, .65 + i*.08]));
    };
    const basse = (add, sec, m, c, fort) => { const r = M.ton(c, 0, 40); if(fort) for(let p = 0; p < 16; p += 2) add(sec, ['bs', m, p, r, 1.6, p % 4 ? .8 : 1]); else add(sec, ['bs', m, 0, r, 6, .9], ['bs', m, 8, r, 4, .8], ['bs', m, 12, M.ton(c, 2, 40), 4, .7]); };
    const arpege = (add, sec, m, c) => [0, 1, 2, 4, 2, 1, 0, 2].forEach((i, q) => add(sec, ['gc', m, q*2, M.ton(c, i, 52), 3, q % 4 ? .45 : .6]));
    const mur = (add, sec, m, c) => { const r = M.ton(c, 0, 40); for(let p = 0; p < 16; p += 2){ const ouvert = p === 0 || p === 6 || p === 8; [r, r + 7, r + 12].forEach(n => add(sec, [ouvert ? 'gs' : 'ge', m, p, n, ouvert ? 2 : 1, ouvert ? .9 : .7])); } };
    return M.chanson({
      bpm: 138, swing: .5, humain: 5, graine: 138, cle: ['E', 'eolien'], final: 2,
      salle: {taille: .5, amorti: .5, niveau: .45, predelai: .012},
      intro: ['E:m', 'C:maj', 'G:maj', 'D:maj'], couplet: ['E:m', 'C:maj', 'G:maj', 'D:maj', 'E:m', 'C:maj', 'G:maj', 'D:maj'],
      refrain: ['C:maj', 'D:maj', 'E:m', 'E:m', 'C:maj', 'D:maj', 'B:7', 'B:7'], pause: ['C:maj', 'G:maj', 'D:maj', 'B:7'], fin: ['E:m', 'E:m'],
      decompte: add => [0, 4, 8, 12].forEach((p, k) => add('decompte', ['hh', 0, p, 0, 1, k ? .7 : .9])),
      introM: (add, sec, m, c) => { arpege(add, sec, m, c); if(m >= 2) batterie(add, sec, m, {tags: ['J2', 'J1'], fill: m === 3}); },
      coupletM: (add, sec, m, c) => { batterie(add, sec, m, {tags: ['J1', 'J2'], fill: m === 7}); basse(add, sec, m, c, false); arpege(add, sec, m, c);
        if(m % 2 === 1) [[8, 2, 2, 'C2'], [10, 1, 2, 'C3'], [12, 0, 4, 'H2']].forEach(([p, i, d, tag]) => add(sec, ['ld', m, p, M.ton(c, i, 64), d, .85, tag])); },
      refrainM: (add, sec, m, c, cn, fort) => { batterie(add, sec, m, {tags: ['J1', 'J1'], fort: true, fill: m === 7}); basse(add, sec, m, c, true); mur(add, sec, m, c);
        M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ch', m, 0, n, 16, .45])); if(m % 4 === 0) add(sec, ['cr', m, 0, 0, 16, .7]); },
      pauseM: (add, sec, m, c) => { arpege(add, sec, m, c); add(sec, ['bs', m, 0, M.ton(c, 0, 40), 8, .7], ['ld', m, 8, M.ton(c, 2, 64), 6, .85, 'C1']); if(m === 3) batterie(add, sec, m, {fill: true, fort: true}); },
      finM: (add, F) => { mur(add, 'fin', 0, F[0]); add('fin', ['kick', 0, 0, 36, 2, 1], ['cs', 0, 4, 0, 2, 1, 'J1'], ['cr', 0, 0, 0, 16, 1], ['bs', 0, 0, 42, 8, 1], ['ld', 0, 8, 78, 6, .9, 'H1']);
        const r = M.ton(F[1], 0, 40); [r, r + 7, r + 12, r + 19].forEach(n => add('fin', ['gs', 1, 0, n, 12, 1])); add('fin', ['kick', 1, 0, 36, 2, 1], ['cr', 1, 0, 0, 16, 1], ['bs', 1, 0, r, 10, 1]); },
      lead: 'ld', leadOctave: 'ld8',
      hook: [
        [0, 0, 76, 2, 'C1'], [0, 2, 79, 2, 'C3'], [0, 4, 84, 6, 'H1'], [0, 10, 79, 2, 'C3'], [0, 12, 76, 2, 'C2'],
        [1, 0, 78, 2, 'C1'], [1, 2, 81, 2, 'C3'], [1, 4, 86, 6, 'H2'], [1, 12, 81, 2, 'C2'],
        [2, 0, 83, 6, 'H1'], [2, 8, 79, 2, 'C2'], [2, 10, 76, 2, 'C3'], [2, 12, 79, 3, 'C2'],
        [3, 0, 76, 2, 'C1'], [3, 4, 71, 2, 'C2'],
        [4, 0, 72, 2, 'C1'], [4, 2, 76, 2, 'C3'], [4, 4, 79, 6, 'H1'], [4, 12, 84, 2, 'C2'],
        [5, 0, 86, 2, 'C1'], [5, 4, 81, 2, 'C2'], [5, 8, 78, 6, 'H1'],
        [6, 0, 83, 2, 'C1'], [6, 2, 87, 2, 'C3'], [6, 4, 81, 2, 'C2'], [6, 8, 78, 6, 'H1'],
        [7, 0, 75, 2, 'C1'], [7, 4, 78, 2, 'C2'],
      ],
      gestesRefrain: [[3, 8, 6, 'S1'], [7, 8, 6, 'S1']],
      gestes: {A: 'CJH', B: 'CJSHD', final: 'CJSHD'},
      instruments: {
        kick: {type: 'kick', vol: .55, groupe: 'base'}, cs: {type: 'caisse', vol: .34, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: .16, groupe: 'base'}, ride: {type: 'ride', vol: .12, groupe: 'base'}, cr: {type: 'crash', vol: .08, groupe: 'base'}, tom: {type: 'tom', vol: .3, groupe: 'base'},
        bs: {type: 'basse', vol: .42, drive: 2.4, brillance: 1, groupe: 'base'},
        gc: {type: 'guitare', vol: .2, pan: -.3, clarte: .8, groupe: 'base'},
        gs: {type: 'guitare_sat', vol: .1, pan: -.4, groupe: 'base'}, ge: {type: 'guitare_etouffee', vol: .1, pan: .4, groupe: 'base'},
        ld: {type: 'guitare_sat', vol: .2, joueur: true, groupe: 'base'},
        ld8: {type: 'guitare_sat', vol: .08, pan: .4, groupe: 'transe'}, ch: {type: 'choeur', vol: .05, groupe: 'transe'},
      },
    });
  };
})();
