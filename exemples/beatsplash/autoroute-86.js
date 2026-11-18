/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Autoroute 86 » (niveau 7, face G) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Autoroute 86
   Rôle :               niveau 7 : MÉLANGE (scratch + notes tenues + diagonales) ; couper / tenir = le synthé lead,
                        taper = la caisse claire « gated »
   Émotion et énergie : conduite de nuit, néons, nostalgie qui fonce, 6/10 → 9/10
   Style de référence : synthwave (couleurs : bandes originales de films des années 80, basse en croches, arpèges,
                        caisse claire énorme et coupée net, toms électroniques)
   Tempo / métrique :   108 BPM, 4/4 droit
   Tonalité / mode :    si mineur (éolien) ; le final monte d'un ton (do# mineur)
   Harmonie :           i · bVI · bIII · bVII (Bm · G · D · A), refrain G · A · Bm · Bm · G · A · F#7 · F#7
   Instruments :        synthé lead (le joueur), caisse claire gated (le joueur), basse synthé en croches, arpège pluck
                        en doubles croches, nappe, kick, charley, toms ; transe : supersaw, cuivres synthé, clap
   Interdits :          instruments acoustiques, swing
   Signature :          l'arpège qui ne s'arrête jamais, comme les lignes de la route, et le lead qui tient ses notes
                        au-dessus
   Contrainte de jeu :  section « Mélange ! » (notes tenues et scratchs qui alternent) ; décompte aux toms ; fin sur
                        l'accord de nappe et l'arpège qui s'éteint
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.autoroute = function(){
    const beat = (add, sec, m, o) => { o = o || {};
      [0, 8].concat(o.dense ? [6, 10] : []).forEach(p => add(sec, ['kick', m, p, 36, 2, p ? .85 : 1]));
      add(sec, ['cs', m, 4, 0, 2, 1, o.tags ? o.tags[0] : undefined], ['cs', m, 12, 0, 2, 1, o.tags ? o.tags[1] : undefined]);
      for(let p = 0; p < 16; p += 2) add(sec, ['hh', m, p, 0, 1, p % 4 ? .4 : .6]);
      if(o.fill) [[8, 57], [10, 52], [12, 47], [13, 47], [14, 43], [15, 43]].forEach(([p, n], i) => add(sec, ['tom', m, p, n, 1.5, .6 + i*.06]));
    };
    const basse = (add, sec, m, c) => { const r = M.ton(c, 0, 35); for(let p = 0; p < 16; p += 2) add(sec, ['bs', m, p, p === 14 ? r + 12 : r, 1.6, p % 4 ? .75 : .95]); };
    const arp = (add, sec, m, c, vol) => [0, 1, 2, 4, 2, 1, 0, 1, 0, 1, 2, 4, 5, 4, 2, 1].forEach((i, p) => add(sec, ['arp', m, p, M.ton(c, i, 62), .9, (p % 4 ? .4 : .6)*(vol || 1)]));
    const nappe = (add, sec, m, c, vol) => M.voix(null, c, [0, 1, 2], 57, 69).forEach(n => add(sec, ['pad', m, 0, n, 16, .45*(vol || 1)]));
    const transe = (add, sec, m, c) => { M.voix(null, c, [0, 1, 2], 62, 74).forEach(n => add(sec, ['ss', m, 0, n, 16, .45], ['sc', m, 14, n, 1.5, .6])); add(sec, ['clap', m, 4, 0, 1, .6], ['clap', m, 12, 0, 1, .6]); };
    return M.chanson({
      bpm: 108, swing: .5, humain: 3, graine: 86, cle: ['B', 'eolien'], final: 2,
      salle: {taille: .7, amorti: .35, niveau: .6, predelai: .02},
      intro: ['B:m', 'G:maj', 'D:maj', 'A:maj'], couplet: ['B:m', 'G:maj', 'D:maj', 'A:maj', 'B:m', 'G:maj', 'D:maj', 'F#:7'],
      refrain: ['G:maj', 'A:maj', 'B:m', 'B:m', 'G:maj', 'A:maj', 'F#:7', 'F#:7'], pause: ['G:maj', 'D:maj', 'E:m7', 'F#:7'], fin: ['B:m', 'B:m'],
      decompte: add => [[0, 57], [4, 52], [8, 47], [12, 43]].forEach(([p, n]) => add('decompte', ['tom', 0, p, n, 2, .8])),
      introM: (add, sec, m, c) => { arp(add, sec, m, c, m < 2 ? .7 : 1); nappe(add, sec, m, c); if(m >= 2){ beat(add, sec, m, {tags: ['J2', 'J1'], fill: m === 3}); basse(add, sec, m, c); } },
      coupletM: (add, sec, m, c) => { beat(add, sec, m, {tags: ['J1', 'J2'], fill: m === 7}); basse(add, sec, m, c); nappe(add, sec, m, c, .8);
        if(m % 2 === 0) [[0, 2, 2, 'C1'], [2, 1, 2, 'C3'], [4, 4, 6, 'H2'], [12, 2, 2, 'C2']].forEach(([p, i, d, tag]) => add(sec, ['ld', m, p, M.ton(c, i, 66), d, .9, tag]));
        else arp(add, sec, m, c, 1.1); },
      apprend: {nom: 'Mélange !', gestes: 'SHJ', accords: ['B:m', 'G:maj', 'D:maj', 'F#:7'], mesure: (add, sec, m, c) => {
        beat(add, sec, m, {tags: ['J2', 'J1']}); basse(add, sec, m, c); nappe(add, sec, m, c);
        add(sec, ['ld', m, 0, M.ton(c, 2, 66), 8, .9, 'H1'], ['scr', m, 10, 60, 4, .5, 'S1']); } },
      refrainM: (add, sec, m, c, cn, fort) => { beat(add, sec, m, {tags: ['J1', 'J1'], dense: true, fill: m === 7}); basse(add, sec, m, c); arp(add, sec, m, c, .8); nappe(add, sec, m, c); transe(add, sec, m, c); if(m === 0) add(sec, ['cr', 0, 0, 0, 16, .7]); },
      pauseM: (add, sec, m, c) => { nappe(add, sec, m, c, 1.2); arp(add, sec, m, c, .9); add(sec, ['ld', m, 0, M.ton(c, 1, 66), 6, .85, 'C1']); for(let p = 0; p < 16; p += 4) add(sec, ['hh', m, p, 0, 1, .35]); if(m === 3) beat(add, sec, m, {fill: true}); },
      finM: (add, F) => { add('fin', ['kick', 0, 0, 36, 2, 1], ['cs', 0, 4, 0, 2, 1, 'J1'], ['cr', 0, 0, 0, 16, .8], ['bs', 0, 0, 37, 6, 1], ['ld', 0, 8, 80, 8, .9, 'H1']);
        arp(add, 'fin', 0, F[0], 1); nappe(add, 'fin', 0, F[0], 1.2); nappe(add, 'fin', 1, F[1], 1.2); [0, 1, 2, 4, 2, 1, 0].forEach((i, q) => add('fin', ['arp', 1, q*2, M.ton(F[1], i, 64), 2, .55 - q*.06])); },
      lead: 'ld', leadOctave: 'ld8',
      hook: [
        [0, 0, 74, 2, 'C1'], [0, 2, 79, 2, 'C3'], [0, 4, 83, 6, 'H1'], [0, 10, 79, 2, 'C3'], [0, 12, 74, 2, 'C2'],
        [1, 0, 76, 2, 'C1'], [1, 2, 81, 2, 'C3'], [1, 4, 85, 6, 'H2'], [1, 12, 81, 2, 'C2'],
        [2, 0, 78, 6, 'H1'], [2, 8, 74, 2, 'C2'], [2, 10, 71, 2, 'C3'], [2, 12, 74, 3, 'C2'],
        [3, 0, 83, 2, 'C1'], [3, 4, 78, 2, 'C2'], [3, 8, 74, 2, 'C3'],
        [4, 0, 79, 2, 'C1'], [4, 2, 83, 2, 'C3'], [4, 4, 86, 6, 'H1'], [4, 12, 83, 2, 'C2'],
        [5, 0, 85, 2, 'C1'], [5, 4, 81, 2, 'C2'], [5, 8, 76, 6, 'H1'],
        [6, 0, 82, 2, 'C1'], [6, 2, 85, 2, 'C3'], [6, 4, 76, 2, 'C2'], [6, 8, 78, 6, 'H1'],
        [7, 0, 82, 2, 'C1'], [7, 4, 78, 2, 'C2'],
      ],
      gestesRefrain: [[3, 12, 4, 'S1'], [7, 8, 6, 'S1']],
      gestes: {A: 'CJ', B: 'CJSHG', final: 'CJSHG'},
      instruments: {
        kick: {type: 'kick', vol: .55, f0: 130, f1: 46, groupe: 'base'}, cs: {type: 'caisse', vol: .32, verb: .8, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: .18, groupe: 'base'}, tom: {type: 'tom', vol: .3, verb: .5, groupe: 'base'}, cr: {type: 'crash', vol: .07, groupe: 'base'},
        bs: {type: 'synth_basse', vol: .4, groupe: 'base'}, arp: {type: 'synth_pluck', vol: .14, pan: .3, groupe: 'base'},
        pad: {type: 'nappe', vol: .12, groupe: 'base'}, ld: {type: 'synth_lead', vol: .26, joueur: true, groupe: 'base'},
        ss: {type: 'supersaw', vol: .07, groupe: 'transe'}, sc: {type: 'synth_cuivres', vol: .12, pan: -.3, groupe: 'transe'},
        clap: {type: 'clap', vol: .14, groupe: 'transe'}, ld8: {type: 'synth_lead', vol: .1, pan: -.3, groupe: 'transe'},
      },
      frappe: {C: {instr: {type: 'caisse', vol: .16, verb: .4}}},
    });
  };
})();
