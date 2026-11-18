/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Vent des collines » (niveau 6, face F) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Vent des collines
   Rôle :               niveau 6 : notes tenues + diagonale ; couper / tenir = la flûte, taper = le bodhrán (tambour)
   Émotion et énergie : grand air, herbe qui ondule, envie de courir, 5/10 → 9/10
   Style de référence : musique de film pastorale et celtique (couleurs : flûte en bois, harpe, cordes larges, cor
                        au loin, tambour sur cadre) ; rythme ternaire qui balance comme une gigue
   Tempo / métrique :   96 BPM, 4/4 en croches ternaires (swing 67 % : la sensation d'un 12/8)
   Tonalité / mode :    la majeur ; le final monte d'un ton (si majeur)
   Harmonie :           couplet A · D · F#m7 · Esus4 · A · D · Bm7 · E7sus4 ; refrain D · E · C#m7 · F#m7 · D · E · A · A
   Instruments :        flûte (le joueur), bodhrán (le joueur), harpe, violons, altos, violoncelles, contrebasse
                        pizz, cor ; transe : chœur « a », glockenspiel, violons à l'octave, timbales
   Interdits :          batterie, synthés, basse électrique
   Signature :          la harpe qui tourne en arpèges ternaires, et la flûte qui s'envole sur une longue note tenue
                        pendant que le cor lui répond en dessous
   Contrainte de jeu :  section « Tiens la note ! » (une note longue de flûte par mesure) ; bodhrán sur 2 et 4 pour le
                        temps ; décompte à la harpe ; fin sur un accord de cordes tenu
   Forme :              décompte · intro 4 · couplet 8 · Tiens la note ! 4 · refrain 8 · pause 4 · couplet 8 · refrain 8 ·
                        final 8 (+1 ton) · fin 2
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.collines = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const COUPLET = ['A:maj', 'D:maj', 'F#:m7', 'E:sus4', 'A:maj', 'D:maj', 'B:m7', 'E:7sus4'];
    const REFRAIN = ['D:maj', 'E:maj', 'C#:m7', 'F#:m7', 'D:maj', 'E:maj', 'A:maj', 'A:maj'];
    const H = {decompte: [A('A:maj')], intro: ['A:maj', 'D:maj', 'A:maj', 'E:sus4'].map(n => A(n)), apprend: ['D:maj', 'A:maj', 'B:m7', 'E:maj'].map(n => A(n)),
      pause: ['F#:m7', 'D:maj', 'B:m7', 'E:sus4'].map(n => A(n)), fin: [A('B:maj'), A('B:add9')]};

    // ─── le balancement ternaire : bodhrán (au joueur sur 2 et 4), harpe en arpèges ───
    const bodhran = (sec, m, c, tags) => { const r = 45;
      add(sec, ['bd', m, 0, r, 2, .85], ['bd', m, 4, r + 7, 2, .9, tags[0]], ['bd', m, 8, r, 2, .8], ['bd', m, 12, r + 7, 2, .9, tags[1]]);
      [2, 6, 10, 14].forEach(p => add(sec, ['bd', m, p + 1, r + 12, 1, .35])); };
    const harpe = (sec, m, c, vol) => [0, 1, 2, 3, 2, 1, 0, 2].forEach((i, q) => add(sec, ['hp', m, q*2, M.ton(c, i, 57), 3, (q % 4 ? .42 : .6)*(vol || 1)]));
    const cordes = (sec, m, c, vol) => { M.voix(null, c, [1, 2, 3], 64, 76).forEach(n => add(sec, ['vn', m, 0, n, 16, .5*(vol || 1)])); M.voix(null, c, [0, 1, 2], 52, 64).forEach(n => add(sec, ['al', m, 0, n, 16, .45*(vol || 1)]));
      add(sec, ['vc', m, 0, M.ton(c, 0, 38), 8, .7], ['vc', m, 8, M.ton(c, 2, 38), 8, .55]); };
    const pizz = (sec, m, c) => add(sec, ['cb', m, 0, M.ton(c, 0, 33), 3, .9], ['cb', m, 8, M.ton(c, 2, 33), 3, .7]);
    const cor = (sec, m, c, k) => add(sec, ['cor', m, 0, M.ton(c, k, 55), 15, .55]);

    // ─── refrain (inventé) : la flûte chante, les notes longues se tiennent ───
    const HOOK = [
      [0, 0, 74, 2, 'C1'], [0, 2, 78, 2, 'C3'], [0, 4, 81, 8, 'H1'], [0, 12, 78, 2, 'C2'],
      [1, 0, 76, 2, 'C1'], [1, 2, 80, 2, 'C3'], [1, 4, 83, 6, 'H2'], [1, 10, 80, 2, 'C3'], [1, 12, 76, 2, 'C2'],
      [2, 0, 80, 6, 'H1'], [2, 8, 76, 2, 'C2'], [2, 10, 73, 2, 'C3'], [2, 12, 76, 3, 'C2'],
      [3, 0, 78, 2, 'C1'], [3, 4, 81, 2, 'C2'], [3, 8, 85, 6, 'H1'],
      [4, 0, 74, 2, 'C1'], [4, 2, 78, 2, 'C3'], [4, 4, 81, 8, 'H1'], [4, 12, 78, 2, 'C2'],
      [5, 0, 83, 8, 'H1'], [5, 8, 80, 2, 'C2'], [5, 12, 76, 3, 'C2'],
      [6, 0, 73, 2, 'C1'], [6, 2, 76, 2, 'C3'], [6, 4, 81, 8, 'H1'],
      [7, 0, 76, 2, 'C1'], [7, 4, 73, 2, 'C2'], [7, 8, 69, 6, 'H2'],
    ];
    // ─── couplet : la flûte lance deux ou trois notes, la harpe et le violon répondent ───
    const APPELS = [[[0, 2, 2, 'C1'], [2, 1, 2, 'C3'], [4, 0, 4, 'C2']], [[0, 1, 2, 'C1'], [2, 2, 2, 'C3'], [4, 4, 4, 'C2']]];

    // DÉCOMPTE : la harpe égrène l'accord
    [0, 4, 8, 12].forEach((p, k) => add('decompte', ['hp', 0, p, [57, 61, 64, 69][k], 4, .7]));

    // INTRO : harpe et cordes, le bodhrán entre, le cor appelle au loin
    H.intro.forEach((c, m) => { harpe('intro', m, c, 1); cordes('intro', m, c, .7); if(m >= 2) bodhran('intro', m, c, ['J2', 'J1']); });
    cor('intro', 0, H.intro[0], 2); cor('intro', 2, H.intro[2], 1);

    const couplet = (sec, k) => { const harm = COUPLET.map(n => A(n, k)); H[sec] = harm;
      harm.forEach((c, m) => { bodhran(sec, m, c, ['J1', 'J2']); harpe(sec, m, c, .9); pizz(sec, m, c);
        if(m % 2 === 0) APPELS[(m >> 1) % 2].forEach(([p, i, d, tag]) => add(sec, ['fl', m, p, M.ton(c, i, 72), d, .9, tag]));
        else [[8, 2], [10, 1], [12, 0]].forEach(([p, i]) => add(sec, ['vn', m, p, M.ton(c, i, 69), 2, .6]));
        M.voix(null, c, [1, 2], 57, 69).forEach(n => add(sec, ['al', m, 0, n, 16, .35]));
      }); };
    // TIENS LA NOTE ! : une longue note de flûte par mesure ; le cor répond en dessous
    H.apprend.forEach((c, m) => { bodhran('apprend', m, c, ['J1', 'J2']); harpe('apprend', m, c, .8); pizz('apprend', m, c);
      add('apprend', ['fl', m, 0, M.ton(c, 2, 72), 10, .9, 'H1'], ['fl', m, 12, M.ton(c, 1, 72), 2, .85, 'C2']); cor('apprend', m, c, 1); });
    const refrain = (sec, k, octave) => { const harm = REFRAIN.map(n => A(n, k)); H[sec] = harm;
      harm.forEach((c, m) => { bodhran(sec, m, c, ['J1', 'J1']); harpe(sec, m, c, 1); cordes(sec, m, c, 1); cor(sec, m, c, m % 2 ? 2 : 1);
        M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ch', m, 0, n, 16, .45]));
        if(m % 4 === 0) add(sec, ['tim', m, 0, M.ton(c, 0, 38) > 45 ? M.ton(c, 0, 38) - 12 : M.ton(c, 0, 38), 3, .7]);
      });
      HOOK.forEach(([m, p, n, d, tag]) => { add(sec, ['fl', m, p, n + k, d, tag[0] === 'H' ? .9 : 1, tag]); if(octave) add(sec, ['vn8', m, p, n + k + 12, d, .5]); if(tag === 'C1' || tag === 'H1') add(sec, ['gl', m, p, n + k + 12, 2, .4]); });
    };

    couplet('A', 0);
    refrain('B', 0, false);

    // PAUSE : la harpe seule et les cordes tenues ; la flûte et le cor se répondent
    H.pause.forEach((c, m) => { harpe('pause', m, c, 1); cordes('pause', m, c, .8); add('pause', ['fl', m, 0, M.ton(c, 2, 72), 6, .85, 'C1']); cor('pause', m, c, 1); });

    refrain('final', 2, true);

    // FIN (en si) : accord de cordes tenu, la flûte sur la quinte, un dernier coup de bodhrán
    const F1 = H.fin[1];
    add('fin', ['bd', 0, 0, 45, 2, .9], ['bd', 0, 4, 52, 2, .9, 'J1'], ['fl', 0, 0, 78, 4, .9, 'C1'], ['fl', 0, 4, 83, 10, .9, 'H1']);
    cordes('fin', 0, H.fin[0], 1); harpe('fin', 0, H.fin[0], 1);
    M.voix(null, F1, [0, 1, 2, 3], 59, 76).forEach(n => add('fin', ['vn', 1, 0, n + 12 > 88 ? n : n + 12, 8, .7], ['al', 1, 0, n, 8, .6]));
    add('fin', ['vc', 1, 0, 47, 8, .8], ['cb', 1, 0, 35, 4, .9], ['bd', 1, 0, 45, 3, 1, 'J1'], ['tim', 1, 0, 35, 3, .8]);

    return M.frappes({
      bpm: 96, sig: [4, 4], swing: .667, swingSur: 8, humain: 7, graine: 71, pistes: true,
      salle: {taille: .75, amorti: .4, niveau: .8, predelai: .025},
      instruments: {
        fl: {type: 'flute', vol: .32, pan: .1, vibrato: .06, joueur: true, groupe: 'base'},
        bd: {type: 'tom', vol: .3, tenue: .25, joueur: true, groupe: 'base'},
        hp: {type: 'harpe', vol: .2, pan: -.25, groupe: 'base'},
        vn: {type: 'violons', vol: .14, pan: -.35, groupe: 'base'}, al: {type: 'altos', vol: .11, pan: .25, groupe: 'base'},
        vc: {type: 'violoncelles', vol: .17, pan: .3, groupe: 'base'}, cb: {type: 'contrebasse_pizz', vol: .36, pan: .35, groupe: 'base'},
        cor: {type: 'cors', vol: .13, pan: -.2, groupe: 'base'},
        ch: {type: 'choeur', vol: .06, groupe: 'transe'}, gl: {type: 'glockenspiel', vol: .08, pan: .35, groupe: 'transe'},
        vn8: {type: 'violons', vol: .08, pan: .4, groupe: 'transe'}, tim: {type: 'timbales', vol: .2, groupe: 'transe'},
      },
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A}, apprend: {mesures: 4, notes: N.apprend},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: 8, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'apprend', 'B', 'pause', 'A', 'B', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0, 'CJ'], A: ['Couplet', 1, 'CJ'], apprend: ['Tiens la note !', 0, 'HCJ'], B: ['Refrain', 2, 'CJHG'], pause: ['Pause', 'rest', 'C'], final: ['Final', 3, 'CJHG'], fin: ['Fin', 'rest', 'HJ']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: M.gamme('A', 'ionien'), gammes: {final: M.gamme('B', 'ionien'), fin: M.gamme('B', 'ionien')},
    }, {C: {instr: {type: 'glockenspiel', modes: [[1, 1, .045], [2.72, .45, .025]], vol: .26, verb: .3}, midi: 85}, J: {instr: {type: 'tom', vol: .24, tenue: .3}, midi: 45}});
  };
})();
