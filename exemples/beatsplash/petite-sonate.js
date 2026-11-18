/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Petite sonate » (labo, classique) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Petite sonate
   Rôle :               morceau du labo, classique ; couper = le piano, taper = les timbales
   Émotion et énergie : élégant et pétillant, 5/10 → 9/10 ; un passage plus sombre (si mineur) au milieu
   Style de référence : allegro de l'époque classique (couleurs : sérénades pour cordes, concertos pour piano de
                        la fin du XVIIIe) ; formes nettes, cadences claires
   Tempo / métrique :   126 BPM, 4/4 droit (pas de swing : c'est la précision qui fait le style)
   Tonalité / mode :    ré majeur ; le développement passe en si mineur ; le final monte en mi majeur
   Harmonie :           exposition D · G · A · D · Bm · Em · A7 · D ; thème G · A · F#m · Bm · Em7 · A7 · D · D ;
                        développement Bm · F#7 (dominante secondaire) · Bm · A7 ; cadence parfaite pour finir
   Instruments :        piano (le joueur), violons, cordes en staccato (altos), violoncelles, contrebasse pizz,
                        harpe, flûte, cors, timbales (le joueur) ; transe : hautbois, violons à l'octave, chœur « a »
   Interdits :          batterie, basse électrique, tout son de synthé
   Signature :          les violons posent la phrase, le piano la termine ; au thème, le piano chante et la flûte
                        répond dans chaque respiration
   Contrainte de jeu :  les cordes en croches marquent le temps sans interruption ; décompte aux timbales ;
                        fin sur une cadence parfaite (la7 → ré) avec un dernier coup de timbales
   Forme :              décompte · intro 4 · exposition 8 · thème 8 · développement 4 · exposition 8 · thème 8 ·
                        final 8 · fin 2
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.lab_classique = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const EXPO = ['D:maj', 'G:maj', 'A:maj', 'D:maj', 'B:m', 'E:m', 'A:7', 'D:maj'];
    const THEME = ['G:maj', 'A:maj', 'F#:m', 'B:m', 'E:m7', 'A:7', 'D:maj', 'D:maj'];
    const H = {decompte: [A('D:maj')], intro: ['D:maj', 'D:maj', 'A:7', 'D:maj'].map(n => A(n)), pause: ['B:m', 'F#:7', 'B:m', 'A:7'].map(n => A(n)), fin: [A('A:7'), A('D:maj')]};
    const G0 = M.gamme('D', 'ionien');
    // pas diatonique dans une gamme (pour les gammes et broderies des violons)
    const pas = (g, midi, n) => { const sc = []; for(let m = 24; m < 108; m++) if(g.includes(m % 12)) sc.push(m); let i = sc.indexOf(midi); if(i < 0) i = sc.findIndex(x => x > midi); return sc[Math.max(0, Math.min(sc.length - 1, i + n))]; };

    // ─── l'orchestre qui porte : cordes en croches, basses, harpe ───
    const cordes = (sec, m, c, dense) => {
      const a = M.ton(c, 1, 57), b = M.ton(c, 2, 57);
      for(let p = 0; p < 16; p += 2) add(sec, ['alt', m, p, p % 4 ? b : a, 1.2, p % 8 === 0 ? .7 : .5]);
      add(sec, ['vc', m, 0, M.ton(c, 0, 38), dense ? 3 : 6, .8], ['vc', m, 8, M.ton(c, dense ? 2 : 0, 38), 3, .65]);
      add(sec, ['cbp', m, 0, M.ton(c, 0, 33), 2, .75], ['cbp', m, 8, M.ton(c, 0, 33), 2, .6]);
    };
    const harpe = (sec, m, c, vol) => [0, 1, 2, 4, 2, 1, 0, 1].forEach((i, q) => add(sec, ['hp', m, q*2, M.ton(c, i, 62), 2, (q % 4 ? .45 : .6)*(vol || 1)]));
    const timbales = (sec, m, c, tags) => { const r = M.ton(c, 0, 38), q = M.ton(c, 2, 33); add(sec, ['tim', m, 0, r > 45 ? r - 12 : r, 3, .85, tags[0]]); if(tags[1] !== null) add(sec, ['tim', m, 8, q, 3, .7, tags[1]]); };

    // ─── exposition : les violons posent la phrase (début de mesure), le piano la termine (fin de mesure) ───
    // phrases des violons : [pas, départ (note de l'accord), pas diatoniques, durée] ; ils finissent toujours sur une note de l'accord
    const PHRASES = [
      [[0, 0, 0, 1], [1, 0, 1, 1], [2, 0, 2, 1], [3, 0, 3, 1], [4, 2, 0, 3]],           // gamme qui monte à la quinte
      [[0, 2, 0, 2], [2, 1, 0, 2], [4, 0, 0, 2], [6, 1, 0, 2]],                         // arpège qui redescend
      [[0, 2, 0, 2], [2, 2, 1, 1], [3, 2, 0, 1], [4, 1, 0, 3]],                         // broderie
      [[0, 4, 0, 2], [2, 4, -1, 1], [3, 4, -2, 1], [4, 2, 0, 3]],                       // descente vers la quinte
    ];
    const FINS = [[[10, 1, 1, 'C2'], [12, 0, 2, 'C1']], [[10, 2, 1, 'C3'], [11, 1, 1, 'C3'], [12, 0, 2, 'C1']], [[12, 2, 2, 'C1']], [[10, 0, 1, 'C2'], [12, 1, 2, 'C1']]];
    const exposition = (sec, k) => { const harm = EXPO.map(n => A(n, k)); H[sec] = harm; const g = G0.map(x => (x + k) % 12);
      harm.forEach((c, m) => {
        cordes(sec, m, c, false); timbales(sec, m, c, ['J1', m % 2 ? 'J2' : null]);
        PHRASES[m % 4].forEach(([p, i, st, d]) => add(sec, ['vn', m, p, pas(g, M.ton(c, i, 72), st), d, .66]));
        FINS[(m + (m >> 2)) % 4].forEach(([p, i, d, tag]) => add(sec, ['pno', m, p, M.ton(c, i, 72), d, .85, tag]));
      }); };

    // ─── thème (inventé) : le piano chante, la flûte répond dans les respirations, les cors tiennent ───
    // [mesure, pas, midi, durée, niveau] en ré majeur
    const THEMA = [
      [0, 0, 74, 2, 1], [0, 2, 71, 2, 3], [0, 4, 74, 2, 2], [0, 6, 79, 2, 3], [0, 8, 79, 3, 1], [0, 12, 74, 2, 2],
      [1, 0, 76, 2, 1], [1, 2, 73, 2, 3], [1, 4, 76, 2, 2], [1, 6, 81, 2, 3], [1, 8, 76, 3, 1], [1, 12, 73, 2, 2],
      [2, 0, 78, 2, 1], [2, 2, 73, 2, 3], [2, 4, 78, 2, 2], [2, 6, 81, 2, 3], [2, 8, 78, 4, 1],
      [3, 0, 74, 3, 1], [3, 4, 71, 2, 2], [3, 6, 73, 1, 3], [3, 8, 74, 2, 2], [3, 10, 78, 2, 3], [3, 12, 71, 4, 1],
      [4, 0, 79, 2, 1], [4, 2, 78, 1, 3], [4, 3, 76, 1, 3], [4, 4, 74, 2, 2], [4, 6, 71, 2, 3], [4, 8, 79, 2, 1], [4, 12, 76, 2, 2],
      [5, 0, 76, 2, 1], [5, 2, 73, 2, 3], [5, 4, 69, 2, 2], [5, 6, 73, 2, 3], [5, 8, 79, 2, 1], [5, 10, 76, 2, 3], [5, 12, 73, 2, 2],
      [6, 0, 74, 2, 1], [6, 2, 78, 2, 3], [6, 4, 81, 4, 1], [6, 8, 78, 2, 2], [6, 10, 74, 2, 3], [6, 12, 69, 2, 2],
      [7, 0, 74, 6, 1],
    ];
    const REPONSES_FL = {2: [[12, 2, 1], [13, 1, 1], [14, 0, 2]], 3: [], 7: [[8, 0, 1], [9, 1, 1], [10, 2, 1], [12, 3, 4]]};
    const theme = (sec, k, octave) => { const harm = THEME.map(n => A(n, k)); H[sec] = harm; const g = G0.map(x => (x + k) % 12);
      harm.forEach((c, m) => {
        cordes(sec, m, c, true); timbales(sec, m, c, ['J1', 'J1']); harpe(sec, m, c, .7);
        M.voix(null, c, [1, 2], 53, 65).forEach(n => add(sec, ['cor', m, 0, n, 15, .5]));
        (REPONSES_FL[m] || []).forEach(([p, st, d]) => add(sec, ['fl', m, p, pas(g, M.ton(c, 2, 67), st), d, .6]));
        // transe : hautbois en tenues, chœur « a », violons qui doublent le thème à l'octave
        add(sec, ['hb', m, 0, M.ton(c, 1, 69), 7.5, .5], ['hb', m, 8, M.ton(c, 2, 69), 7.5, .45]);
        M.voix(null, c, [0, 1, 2], 57, 69).forEach(n => add(sec, ['ch', m, 0, n, 16, .42]));
      });
      THEMA.forEach(([m, p, n, d, lv]) => { add(sec, ['pno', m, p, n + k, d, lv === 1 ? 1 : .84, 'C' + lv]); add(sec, ['vn8', m, p, n + k + 12, d, .5]); });
      add(sec, ['cym', 0, 0, 0, 16, .35]);
    };

    // DÉCOMPTE : timbales ré-la-ré-la
    [[0, 38], [4, 33], [8, 38], [12, 33]].forEach(([p, n], k) => add('decompte', ['tim', 0, p, n, 2, k ? .6 : .8]));

    // INTRO : accords de tout l'orchestre sur le premier temps, puis la harpe et les cordes lancent la machine
    H.intro.forEach((c, m) => {
      cordes('intro', m, c, false); harpe('intro', m, c, m < 2 ? .8 : 1);
      if(m % 2 === 0) M.voix(null, c, [0, 1, 2], 62, 74).forEach(n => add('intro', ['vn', m, 0, n, 3, .8]));
      timbales('intro', m, c, [m === 3 ? 'J1' : 'J2', null]);
    });
    add('intro', ['pno', 3, 8, 66, 1, .8, 'C2'], ['pno', 3, 10, 69, 1, .85, 'C2'], ['pno', 3, 12, 74, 2, 1, 'C1']);

    exposition('A', 0);
    theme('B', 0, false);

    // DÉVELOPPEMENT : si mineur, la harpe seule avec les cordes ; la flûte et le piano se répondent
    H.pause.forEach((c, m) => {
      harpe('pause', m, c, 1);
      add('pause', ['vc', m, 0, M.ton(c, 0, 38), 8, .7], ['cbp', m, 0, M.ton(c, 0, 33), 2, .6]);
      add('pause', ['fl', m, 0, M.ton(c, 2, 76), 3, .6], ['fl', m, 4, M.ton(c, 1, 76), 3, .55]);
      add('pause', ['pno', m, 8, M.ton(c, 1, 72), 2, .85, 'C1'], ['pno', m, 10, M.ton(c, 0, 72), 2, .75, 'C3'], ['pno', m, 12, M.ton(c, 2, 72), 3, .7, 'C3']);
    });

    // FINAL : le thème en mi majeur, avec les violons à l'octave
    theme('final', 2, true);

    // FIN : cadence parfaite la7 → ré, dernier coup de timbales
    const F0 = H.fin[0], F1 = H.fin[1];
    M.voix(null, F0, [0, 1, 2, 3], 57, 72).forEach(n => add('fin', ['vn', 0, 0, n + 12, 6, .8], ['alt', 0, 0, n, 6, .7]));
    add('fin', ['vc', 0, 0, 45, 6, .9], ['cbp', 0, 0, 33, 2, .8], ['tim', 0, 0, 33, 3, .9, 'J1'], ['pno', 0, 8, 73, 2, .9, 'C1'], ['pno', 0, 10, 76, 2, .85, 'C2'], ['pno', 0, 12, 79, 2, .85, 'C2']);
    for(let p = 8; p < 16; p += .5) add('fin', ['tim', 0, p, 33, .5, .3 + (p - 8)*.06]);
    M.voix(null, F1, [0, 1, 2], 62, 78).forEach(n => add('fin', ['vn', 1, 0, n, 4, 1], ['cor', 1, 0, n - 12, 4, .8]));
    add('fin', ['pno', 1, 0, 74, 4, 1, 'C1'], ['vc', 1, 0, 38, 4, 1], ['cbp', 1, 0, 26, 2, 1], ['tim', 1, 0, 38, 3, 1, 'J1'], ['cym', 1, 0, 0, 16, .5]);
    // le final est en mi : la fin aussi (ré → mi)
    N.fin = N.fin.map(n => ['vn', 'alt', 'vc', 'cbp', 'pno', 'cor'].includes(n[0]) ? [n[0], n[1], n[2], n[3] + 2, n[4], n[5], n[6]] : n);
    H.fin = [A('B:7'), A('E:maj')];

    return M.frappes({
      bpm: 126, sig: [4, 4], swing: .5, humain: 6, graine: 5, pistes: true,
      salle: {taille: .7, amorti: .45, niveau: .75, predelai: .02},
      instruments: {
        vn: {type: 'violons', vol: 0.246, pan: -.35, groupe: 'base'},
        alt: {type: 'cordes_stacc', vol: 0.197, pan: .15, clarte: 4, groupe: 'base'},
        vc: {type: 'violoncelles', vol: 0.246, pan: .3, groupe: 'base'},
        cbp: {type: 'contrebasse_pizz', vol: 0.394, pan: .35, groupe: 'base'},
        hp: {type: 'harpe', vol: 0.209, pan: -.15, groupe: 'base'},
        pno: {type: 'piano', vol: 0.444, joueur: true, groupe: 'base'},
        fl: {type: 'flute', vol: 0.234, pan: .25, groupe: 'base'},
        cor: {type: 'cors', vol: 0.136, pan: -.2, groupe: 'base'},
        tim: {type: 'timbales', vol: 0.32, joueur: true, groupe: 'base'},
        cym: {type: 'crash', vol: 0.049, groupe: 'base'},
        hb: {type: 'hautbois', vol: 0.123, pan: .3, groupe: 'transe'},
        vn8: {type: 'violons', vol: 0.099, pan: -.45, groupe: 'transe'},
        ch: {type: 'choeur', voyelle: 'a', vol: 0.074, groupe: 'transe'},
      },
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: 8, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'B', 'pause', 'A', 'B', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0], A: ['Exposition', 1], B: ['Thème', 2], pause: ['Développement', 'rest'], final: ['Final', 3], fin: ['Fin', 'rest']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: G0, gammes: {pause: M.gamme('B', 'harmonique'), final: M.gamme('E', 'ionien'), fin: M.gamme('E', 'ionien')},
    }, {C: {instr: {type: 'charley', tenue: .6, bruit: .05, base: 2600, hp: 2000, vol: .12, verb: .45}}, J: {instr: {type: 'grosse_caisse', vol: .28}}});
  };
})();
