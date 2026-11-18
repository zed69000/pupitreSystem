/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Traîneau turbo » (Noël, face N) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Traîneau turbo
   Rôle :               cassette de Noël : couper = la mélodie de Jingle Bells (domaine public, J. Pierpont, 1857),
                        taper = les claps
   Émotion et énergie : fête, neige, rires, 8/10 → 10/10
   Style de référence : pop de Noël qui fonce (couleurs : grelots, cuivres, glockenspiel, piano, basse en octaves)
   Tempo / métrique :   132 BPM, 4/4 droit
   Tonalité / mode :    sol majeur ; le final monte d'un demi-ton (la bémol), comme les grands disques de Noël
   Harmonie :           couplet Gadd9 · G · Gadd9 · C · Am9 · D · D7 · G ; refrain G · G · G · G · Cmaj7 · G · A9 · D7 (puis
                        la fin du refrain revient sur G)
   Instruments :        trompettes (le joueur, la mélodie), claps (le joueur), grelots, piano, basse en octaves, kick,
                        caisse claire, glockenspiel ; transe : cordes, chœur « a », cloches tubulaires
   Interdits :          synthés, ambiance triste
   Signature :          les grelots qui ne s'arrêtent jamais, et la mélodie que tout le monde connaît, jouée par toi
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.noel = function(){
    const beat = (add, sec, m, o) => { o = o || {};
      [0, 8].concat(o.fort ? [4, 12] : []).forEach(p => add(sec, ['kick', m, p, 36, 2, p ? .85 : 1]));
      add(sec, ['clap', m, 4, 0, 1, .9, o.tags ? o.tags[0] : undefined], ['clap', m, 12, 0, 1, .9, o.tags ? o.tags[1] : undefined], ['cs', m, 4, 0, 1, .6], ['cs', m, 12, 0, 1, .6]);
      for(let p = 0; p < 16; p += 2) add(sec, ['gre', m, p, 0, 1, p % 4 ? .45 : .7]); if(o.fort) for(let p = 1; p < 16; p += 2) add(sec, ['gre', m, p, 0, 1, .3]);
    };
    const basse = (add, sec, m, c) => { const r = M.ton(c, 0, 40); for(let p = 0; p < 16; p += 4) add(sec, ['bs', m, p, r, 1.6, .95], ['bs', m, p + 2, r + 12, 1.4, .7]); };
    let vP = null;
    const piano = (add, sec, m, c) => { vP = M.voix(vP, c, [0, 1, 2, 3], 55, 70); [2, 6, 10, 14].forEach(p => vP.forEach(n => add(sec, ['pn', m, p, n, 1.4, .5]))); };
    // la mélodie (domaine public) : [mesure, pas, midi, durée, geste]
    const COUPLET = [
      [0, 0, 74, 3.5, 'C1'], [0, 4, 71, 3.5, 'C2'], [0, 8, 69, 3.5, 'C2'], [0, 12, 67, 3.5, 'C1'], [1, 0, 74, 11, 'C1'],
      [2, 0, 74, 3.5, 'C1'], [2, 4, 71, 3.5, 'C2'], [2, 8, 69, 3.5, 'C2'], [2, 12, 67, 3.5, 'C1'], [3, 0, 76, 11, 'C1'],
      [4, 0, 76, 3.5, 'C1'], [4, 4, 72, 3.5, 'C2'], [4, 8, 71, 3.5, 'C2'], [4, 12, 69, 3.5, 'C1'], [5, 0, 78, 11, 'C1'],
      [6, 0, 74, 3.5, 'C1'], [6, 4, 74, 3.5, 'C2'], [6, 8, 72, 3.5, 'C2'], [6, 12, 69, 3.5, 'C1'], [7, 0, 71, 11, 'C1'],
    ];
    return M.chanson({
      bpm: 132, swing: .5, humain: 4, graine: 25, cle: ['G', 'ionien'], final: 1,
      salle: {taille: .6, amorti: .45, niveau: .6, predelai: .015},
      intro: ['G:maj', 'C:maj7', 'A:9', 'D:7'], couplet: ['G:add9', 'G:maj', 'G:add9', 'C:maj', 'A:m9', 'D:maj', 'D:7', 'G:maj'],
      refrain: ['G:maj', 'G:maj', 'G:maj', 'G:maj', 'C:maj7', 'C:maj7', 'A:9', 'D:7'], pause: ['C:maj7', 'G:maj', 'A:9', 'D:7'], fin: ['G:maj', 'G:maj'],
      decompte: add => [0, 4, 8, 12].forEach((p, k) => add('decompte', ['gre', 0, p, 0, 1, k ? .7 : .9])),
      introM: (add, sec, m, c) => { piano(add, sec, m, c); beat(add, sec, m, {tags: [m >= 2 ? 'J2' : null, 'J1']}); if(m >= 2) basse(add, sec, m, c); add(sec, ['gl', m, 0, M.ton(c, 2, 79), 2, .6], ['gl', m, 8, M.ton(c, 1, 79), 2, .55]); },
      coupletM: (add, sec, m, c) => { beat(add, sec, m, {tags: ['J1', 'J2']}); basse(add, sec, m, c); piano(add, sec, m, c);
        COUPLET.filter(x => x[0] === m).forEach(([, p, n, d, tag]) => add(sec, ['tp', m, p, n, d, tag === 'C1' ? 1 : .86, tag])); },
      refrainM: (add, sec, m, c, cn, fort) => { beat(add, sec, m, {tags: ['J1', 'J1'], fort: true}); basse(add, sec, m, c); piano(add, sec, m, c);
        M.voix(null, c, [1, 2, 3], 64, 76).forEach(n => add(sec, ['vn', m, 0, n, 16, .5])); M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ch', m, 0, n, 16, .45]));
        if(m % 4 === 0) add(sec, ['cl', m, 0, M.ton(c, 0, 72), 4, .5], ['cr', m, 0, 0, 16, .6]); },
      pauseM: (add, sec, m, c) => { piano(add, sec, m, c); for(let p = 0; p < 16; p += 4) add(sec, ['gre', m, p, 0, 1, .6]); add(sec, ['tp', m, 0, M.ton(c, 1, 69), 6, .9, 'C1'], ['gl', m, 8, M.ton(c, 2, 79), 3, .6]); },
      finM: (add, F) => { beat(add, 'fin', 0, {tags: ['J1', null], fort: true}); add('fin', ['tp', 0, 0, 80, 3.5, 1, 'C1'], ['tp', 0, 4, 80, 3.5, .9, 'C2'], ['tp', 0, 8, 75, 3.5, .9, 'C2'], ['tp', 0, 12, 72, 3.5, .9, 'C2']);
        M.voix(null, F[1], [0, 1, 2], 60, 76).forEach(n => add('fin', ['vn', 1, 0, n, 10, .8], ['pn', 1, 0, n, 8, .7])); add('fin', ['tp', 1, 0, 80, 10, 1, 'C1'], ['bs', 1, 0, 44, 8, 1], ['kick', 1, 0, 36, 2, 1], ['cr', 1, 0, 0, 16, 1], ['cl', 1, 0, 80, 6, .6]); },
      lead: 'tp', leadOctave: 'gl8',
      // le refrain « Jingle bells » (domaine public) ; sa dernière phrase redescend sur sol
      hook: [
        [0, 0, 71, 3.5, 'C1'], [0, 4, 71, 3.5, 'C2'], [0, 8, 71, 7, 'C1'], [1, 0, 71, 3.5, 'C1'], [1, 4, 71, 3.5, 'C2'], [1, 8, 71, 7, 'C1'],
        [2, 0, 71, 3.5, 'C1'], [2, 4, 74, 3.5, 'C2'], [2, 8, 67, 5.5, 'C2'], [2, 14, 69, 1.5, 'C3'], [3, 0, 71, 14, 'C1'],
        [4, 0, 72, 3.5, 'C1'], [4, 4, 72, 3.5, 'C2'], [4, 8, 72, 5.5, 'C2'], [4, 14, 72, 1.5, 'C3'],
        [5, 0, 72, 3.5, 'C1'], [5, 4, 71, 3.5, 'C2'], [5, 8, 71, 3.5, 'C2'], [5, 12, 71, 1.5, 'C3'], [5, 14, 71, 1.5, 'C3'],
        [6, 0, 71, 3.5, 'C1'], [6, 4, 69, 3.5, 'C2'], [6, 8, 69, 3.5, 'C2'], [6, 12, 71, 3.5, 'C2'], [7, 0, 69, 7, 'C1'], [7, 8, 74, 7, 'C1'],
      ],
      gestes: {A: 'CJ', B: 'CJ', final: 'CJ'},
      instruments: {
        kick: {type: 'kick', vol: .5, groupe: 'base'}, cs: {type: 'caisse', vol: .2, groupe: 'base'}, clap: {type: 'clap', vol: .26, joueur: true, groupe: 'base'},
        gre: {type: 'shaker', vol: .14, tenue: .12, pan: .3, groupe: 'base'}, cr: {type: 'crash', vol: .06, groupe: 'base'},
        bs: {type: 'basse', vol: .4, brillance: 1, groupe: 'base'}, pn: {type: 'piano', vol: .15, pan: -.25, groupe: 'base'},
        tp: {type: 'trompettes', vol: .28, joueur: true, groupe: 'base'}, gl: {type: 'glockenspiel', vol: .12, pan: .3, groupe: 'base'},
        gl8: {type: 'glockenspiel', vol: .08, pan: -.3, groupe: 'transe'}, vn: {type: 'violons', vol: .08, groupe: 'transe'}, ch: {type: 'choeur', vol: .05, groupe: 'transe'},
        cl: {type: 'cloches_tubes', vol: .08, groupe: 'transe'},
      },
      frappe: {C: {instr: {type: 'charley', tenue: .6, bruit: .05, base: 2600, hp: 2000, vol: .12, verb: .45}}, J: {instr: {type: 'shaker', vol: .22, tenue: .15}}},
    });
  };
})();
