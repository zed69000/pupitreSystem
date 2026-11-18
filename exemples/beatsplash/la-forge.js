/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « La Forge » (niveau 10, face J, le grand final) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / La Forge
   Rôle :               niveau 10, le grand final : TOUTES les briques ; couper / tenir = la guitare solo,
                        taper = la caisse claire
   Émotion et énergie : puissance, marteau sur l'enclume, épopée, 8/10 → 10/10
   Style de référence : heavy metal à riffs galopants (couleurs : guitares jumelles, double grosse caisse sur le
                        refrain, chœur épique) ; mode mineur harmonique pour le la majeur qui tire vers ré
   Tempo / métrique :   150 BPM, 4/4, galop (croche + deux doubles) à la guitare étouffée
   Tonalité / mode :    ré mineur (harmonique) ; le final monte d'un ton (mi mineur)
   Harmonie :           couplet Dm · Bb · C · Dm (le riff) ; refrain Bb · C · Dm · Dm · Bb · C · A · A
   Instruments :        guitare solo (le joueur), caisse claire (le joueur), guitares étouffées au galop, guitares
                        saturées, basse saturée, kick (double sur le refrain), crash, toms ; transe : chœur « a »,
                        deuxième guitare solo en tierce, timbales
   Interdits :          synthés, swing
   Signature :          le galop des guitares étouffées et l'enclume (un coup de cloche métallique sur le 1)
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.forge = function(){
    const batterie = (add, sec, m, o) => { o = o || {};
      if(o.double) for(let p = 0; p < 16; p++) add(sec, ['kick', m, p, 36, 1, p % 2 ? .7 : .9]); else [0, 3, 6, 8, 11, 14].forEach(p => add(sec, ['kick', m, p, 36, 1, p ? .85 : 1]));
      add(sec, ['cs', m, 4, 0, 2, 1, o.tags ? o.tags[0] : undefined], ['cs', m, 12, 0, 2, 1, o.tags ? o.tags[1] : undefined]);
      for(let p = 0; p < 16; p += 2) add(sec, ['hh', m, p, 0, 1, p % 4 ? .45 : .65]);
      if(o.fill) [[8, 57], [10, 52], [12, 50], [13, 47], [14, 45], [15, 43]].forEach(([p, n], i) => add(sec, ['tom', m, p, n, 1.5, .65 + i*.06]));
    };
    const galop = (add, sec, m, c) => { const r = M.ton(c, 0, 38); [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15].forEach(p => add(sec, ['ge', m, p, r, .8, p % 4 === 0 ? .9 : .65], ['ge', m, p, r + 7, .8, p % 4 === 0 ? .7 : .5])); add(sec, ['bs', m, 0, r, 6, 1], ['bs', m, 8, r, 6, .9]); };
    const mur = (add, sec, m, c) => { const r = M.ton(c, 0, 38); [0, 8].forEach(p => [r, r + 7, r + 12].forEach(n => add(sec, ['gs', m, p, n, 7, .9]))); for(let p = 0; p < 16; p += 2) add(sec, ['bs', m, p, r, 1.6, .9]); };
    const enclume = (add, sec, m) => add(sec, ['anv', m, 0, 84, 1, .8, '!']);
    return M.chanson({
      bpm: 150, swing: .5, humain: 3, graine: 150, cle: ['D', 'harmonique'], final: 2,
      salle: {taille: .65, amorti: .4, niveau: .5, predelai: .015},
      intro: ['D:m', 'Bb:maj', 'C:maj', 'A:maj'], couplet: ['D:m', 'Bb:maj', 'C:maj', 'D:m', 'D:m', 'Bb:maj', 'C:maj', 'A:maj'],
      refrain: ['Bb:maj', 'C:maj', 'D:m', 'D:m', 'Bb:maj', 'C:maj', 'A:maj', 'A:maj'], pause: ['Bb:maj', 'G:m', 'C:maj', 'A:maj'], fin: ['D:m', 'D:m'],
      decompte: add => [0, 4, 8, 12].forEach((p, k) => add('decompte', ['anv', 0, p, 84, 1, k ? .6 : .9, '!'])),
      introM: (add, sec, m, c) => { mur(add, sec, m, c); enclume(add, sec, m); if(m >= 2) batterie(add, sec, m, {tags: ['J2', 'J1'], fill: m === 3}); },
      coupletM: (add, sec, m, c) => { batterie(add, sec, m, {tags: ['J1', 'J2'], fill: m === 7}); galop(add, sec, m, c); enclume(add, sec, m);
        if(m % 2 === 1) [[8, 2, 2, 'C2'], [10, 1, 2, 'C3'], [12, 0, 4, 'H2']].forEach(([p, i, d, tag]) => add(sec, ['ld', m, p, M.ton(c, i, 64), d, .85, tag])); },
      refrainM: (add, sec, m, c) => { batterie(add, sec, m, {tags: ['J1', 'J1'], double: true, fill: m === 7}); mur(add, sec, m, c); enclume(add, sec, m);
        M.voix(null, c, [0, 1, 2], 57, 69).forEach(n => add(sec, ['ch', m, 0, n, 16, .5])); if(m % 4 === 0) add(sec, ['cr', m, 0, 0, 16, .8], ['tim', m, 0, M.ton(c, 0, 38) > 45 ? M.ton(c, 0, 38) - 12 : M.ton(c, 0, 38), 3, .8]); },
      pauseM: (add, sec, m, c) => { add(sec, ['ch', m, 0, M.ton(c, 1, 60), 16, .5], ['ch', m, 0, M.ton(c, 2, 60), 16, .5], ['ld', m, 0, M.ton(c, 2, 64), 8, .85, 'C1']); enclume(add, sec, m); if(m === 3) batterie(add, sec, m, {fill: true}); },
      finM: (add, F) => { mur(add, 'fin', 0, F[0]); add('fin', ['kick', 0, 0, 36, 2, 1], ['cs', 0, 4, 0, 2, 1, 'J1'], ['cr', 0, 0, 0, 16, 1], ['ld', 0, 8, 76, 6, .9, 'H1']); enclume(add, 'fin', 0);
        const r = M.ton(F[1], 0, 38); [r, r + 7, r + 12].forEach(n => add('fin', ['gs', 1, 0, n, 12, 1])); add('fin', ['kick', 1, 0, 36, 2, 1], ['cr', 1, 0, 0, 16, 1], ['bs', 1, 0, r, 10, 1], ['tim', 1, 0, r, 3, 1]); enclume(add, 'fin', 1); },
      lead: 'ld', leadOctave: 'ld2',
      hook: [
        [0, 0, 74, 2, 'C1'], [0, 2, 77, 2, 'C3'], [0, 4, 82, 6, 'H1'], [0, 10, 77, 2, 'C3'], [0, 12, 74, 2, 'C2'],
        [1, 0, 76, 2, 'C1'], [1, 2, 79, 2, 'C3'], [1, 4, 84, 6, 'H2'], [1, 12, 79, 2, 'C2'],
        [2, 0, 81, 6, 'H1'], [2, 8, 77, 2, 'C2'], [2, 10, 74, 2, 'C3'], [2, 12, 77, 3, 'C2'],
        [3, 0, 86, 2, 'C1'], [3, 4, 81, 2, 'C2'],
        [4, 0, 82, 2, 'C1'], [4, 2, 86, 2, 'C3'], [4, 4, 77, 6, 'H1'], [4, 12, 82, 2, 'C2'],
        [5, 0, 84, 2, 'C1'], [5, 4, 79, 2, 'C2'], [5, 8, 76, 6, 'H1'],
        [6, 0, 81, 2, 'C1'], [6, 2, 85, 2, 'C3'], [6, 4, 76, 2, 'C2'], [6, 8, 73, 6, 'H1'],
        [7, 0, 81, 2, 'C1'], [7, 4, 76, 2, 'C2'],
      ],
      gestesRefrain: [[3, 8, 6, 'S1'], [7, 8, 6, 'S1']],
      gestes: {A: 'CJHG', B: 'CJSHGD', final: 'CJSHGD'},
      instruments: {
        kick: {type: 'kick', vol: 0.425, f0: 120, tenue: .5, groupe: 'base'}, cs: {type: 'caisse', vol: 0.289, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: 0.119, groupe: 'base'}, cr: {type: 'crash', vol: 0.068, groupe: 'base'}, tom: {type: 'tom', vol: 0.255, groupe: 'base'},
        anv: {type: 'glockenspiel', modes: [[1, 1, .5], [2.31, .6, .35], [3.86, .4, .25], [5.1, .25, .15]], vol: 0.051, verb: .4, groupe: 'base'},
        bs: {type: 'basse', vol: 0.34, drive: 3, brillance: 1.2, groupe: 'base'},
        ge: {type: 'guitare_etouffee', vol: 0.085, pan: -.4, groupe: 'base'}, gs: {type: 'guitare_sat', vol: 0.076, pan: .4, groupe: 'base'},
        ld: {type: 'guitare_sat', vol: 0.17, joueur: true, groupe: 'base'},
        ld2: {type: 'guitare_sat', vol: 0.068, pan: -.4, groupe: 'transe'}, ch: {type: 'choeur', vol: 0.051, groupe: 'transe'}, tim: {type: 'timbales', vol: 0.17, groupe: 'transe'},
      },
    });
  };
})();
