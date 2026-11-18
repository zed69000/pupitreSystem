/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Les petits pas » (labo, comptine) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Les petits pas
   Rôle :               morceau du labo, le plus doux ; couper = le xylophone, taper = les claquements de mains
   Émotion et énergie : malicieux et tendre, 4/10 → 7/10 ; un petit moment d'émotion (si bémol mineur) au refrain
   Style de référence : chanson pour enfants des années 70 (couleurs : génériques de dessins animés, comptines
                        à la flûte et au xylophone) ; aucun son électronique
   Tempo / métrique :   112 BPM, 4/4 sautillant (swing des croches 64 %)
   Tonalité / mode :    fa majeur ; le final monte en sol majeur
   Harmonie :           couplet Fmaj7 · Dm7 · Bbadd9 · C7 ; refrain Bbmaj7 · C7 · Am7 · Dm7, puis l'emprunt Bbm6 (la petite
                        larme) avant de revenir au soleil
   Instruments :        xylophone (le joueur), flûte, clarinette, glockenspiel, ukulélé, contrebasse pizzicato,
                        grosse caisse douce, claps, shaker ; transe : célesta, chœur « ou », glockenspiel à l'octave
   Interdits :          synthés, batterie électronique, basse saturée
   Signature :          la flûte pose une question, le xylophone répond « ding-ding » à chaque mesure
   Contrainte de jeu :  shaker et contrebasse marquent le temps ; décompte au glockenspiel ; fin sur un accord tenu
   Forme :              décompte · intro 4 · couplet 8 · refrain 8 · pause 4 · couplet 8 · refrain 8 · final 8 · fin 2

   Dosage : au couplet, la flûte parle (début de mesure), le xylophone répond (fin de mesure). Au refrain, le
   xylophone chante, la clarinette tient un contre-chant lent, le glockenspiel répond dans les trous du hook.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.lab_comptine = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const COUPLET = ['F:maj7', 'D:m7', 'Bb:add9', 'C:7', 'F:maj7', 'D:m7', 'G:m7', 'C:7'];
    const REFRAIN = ['Bb:maj7', 'C:7', 'A:m7', 'D:m7', 'Bb:maj7', 'Bb:m6', 'F:maj', 'C:7'];
    const H = {decompte: [A('F:maj')], intro: ['F:add9', 'F:add9', 'Bb:maj7', 'C:7'].map(n => A(n)), pause: ['Bb:maj7', 'A:m7', 'G:m7', 'C:7'].map(n => A(n)), fin: [A('F:6'), A('F:add9')]};

    // ─── la base qui sautille ───
    const batterie = (sec, m, tags, doux) => {
      add(sec, ['kick', m, 0, 36, 2, doux ? .5 : .7], ['kick', m, 8, 36, 2, doux ? .4 : .55]);
      add(sec, ['clap', m, 4, 0, 1, .85, tags[0]], ['clap', m, 12, 0, 1, .85, tags[1]]);
      for(let p = 0; p < 16; p += 2) add(sec, ['shk', m, p, 0, 1, p % 4 === 0 ? .55 : .35]);
    };
    const pizz = (sec, m, c, cn, marche) => {
      const r = M.ton(c, 0, 41); add(sec, ['cb', m, 0, r, 3, .9], ['cb', m, 8, M.ton(c, 2, 36) + (M.ton(c, 2, 36) < r ? 12 : 0), 3, .72]);
      if(marche){ const nx = M.ton(cn, 0, 41); add(sec, ['cb', m, 12, M.ton(c, 1, 41), 1.5, .6], ['cb', m, 14, nx > r ? nx - 2 : nx + 2, 1.5, .62]); }
    };
    let vUk = null;
    const uke = (sec, m, c, motif) => { vUk = M.voix(vUk, c, [0, 1, 2, c.iv.length > 3 ? 3 : 0], 60, 72);
      [...motif].forEach((ch, p) => { if(ch !== '.') vUk.forEach((n, k) => add(sec, ['uk', m, p + k*.035, n, 1.5, ch === 'X' ? .6 : .42])); }); };

    // ─── couplet : la flûte demande, le xylophone répond ───
    // phrases de flûte : [pas, note de l'accord (0 fond., 1 tierce, 2 quinte, 3 septième), durée]
    const QUESTIONS = [[[0, 1, 3], [3, 2, 1], [4, 1, 2], [6, 0, 2]], [[0, 2, 2], [2, 3, 1], [4, 2, 2], [6, 1, 2]], [[0, 0, 2], [2, 1, 2], [4, 2, 3]], [[0, 2, 1], [1, 1, 1], [2, 0, 2], [4, 1, 3]]];
    const REPONSES = [[[10, 2, 1, 'C2'], [12, 4, 2, 'C1']], [[10, 1, 1, 'C3'], [11, 2, 1, 'C3'], [12, 4, 2, 'C1']], [[10, 4, 1, 'C2'], [12, 2, 2, 'C1']], [[12, 1, 1.5, 'C1'], [14, 2, 1, 'C3']]];
    const couplet = (sec, k) => { const harm = COUPLET.map(n => A(n, k)); H[sec] = harm;
      harm.forEach((c, m) => {
        batterie(sec, m, ['J2', 'J1'], true); pizz(sec, m, c, harm[(m + 1) % 8], m % 2 === 1); uke(sec, m, c, '..x...x...x...x.');
        QUESTIONS[m % 4].forEach(([p, i, d]) => add(sec, ['fl', m, p, M.ton(c, i, 65), d, .7]));
        REPONSES[(m + (m >> 2)) % 4].forEach(([p, i, d, tag]) => add(sec, ['xy', m, p, M.ton(c, i, 72), d, .85, tag]));
      }); };

    // ─── refrain : le xylophone chante (inventé), la clarinette tient, le glockenspiel répond ───
    // [mesure, pas, midi, durée, niveau] en fa majeur
    const HOOK = [
      [0, 0, 74, 2, 1], [0, 3, 72, 1, 3], [0, 4, 74, 2, 2], [0, 8, 77, 3, 1], [0, 12, 74, 2, 2],
      [1, 0, 72, 2, 1], [1, 4, 76, 2, 2], [1, 8, 79, 3, 1], [1, 12, 76, 2, 3],
      [2, 0, 76, 2, 1], [2, 3, 74, 1, 3], [2, 4, 72, 2, 2], [2, 8, 69, 3, 1], [2, 12, 72, 2, 3],
      [3, 0, 74, 3, 1], [3, 4, 77, 2, 2], [3, 8, 74, 4, 1],
      [4, 0, 74, 2, 1], [4, 3, 72, 1, 3], [4, 4, 74, 2, 2], [4, 8, 77, 3, 1], [4, 12, 74, 2, 2],
      [5, 0, 77, 2, 1], [5, 4, 73, 2, 2], [5, 8, 70, 4, 1],
      [6, 0, 72, 2, 1], [6, 4, 69, 2, 2], [6, 8, 77, 3, 1], [6, 12, 74, 1, 3],
      [7, 0, 76, 2, 1], [7, 4, 79, 2, 2], [7, 8, 82, 2, 1], [7, 12, 79, 2, 2],
    ];
    const refrain = (sec, k, octave) => { const harm = REFRAIN.map(n => A(n, k)); H[sec] = harm;
      harm.forEach((c, m) => {
        batterie(sec, m, ['J1', 'J1'], false); pizz(sec, m, c, harm[(m + 1) % 8], true); uke(sec, m, c, 'X.x...x.X.x...x.');
        add(sec, ['cl', m, 0, M.ton(c, 1, 58), 7.5, .5], ['cl', m, 8, M.ton(c, m % 2 ? 2 : 3, 58), 7.5, .45]);
        if([3, 5].includes(m)) add(sec, ['gl', m, 13, M.ton(c, 2, 84), 1, .55], ['gl', m, 14, M.ton(c, 4, 84), 2, .6]);
        // transe : célesta en arpège, chœur « ou », glockenspiel qui double le hook à l'octave
        [0, 1, 2, 3, 2, 1, 0, 1].forEach((i, q) => add(sec, ['cel', m, q*2, M.ton(c, i, 72), 2, q % 2 ? .4 : .55]));
        M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ch', m, 0, n, 16, .45]));
      });
      HOOK.forEach(([m, p, n, d, lv]) => { add(sec, ['xy', m, p, n + k, d, lv === 1 ? 1 : .85, 'C' + lv]); if(octave || lv === 1) add(sec, ['gl8', m, p, n + k + 12, d, .5]); });
      add(sec, ['cym', 0, 0, 0, 16, .4]);
    };

    // DÉCOMPTE : le glockenspiel compte (fa, la, do, fa), la flûte prend son souffle
    [[0, 89], [4, 93], [8, 96], [12, 101]].forEach(([p, n], k) => add('decompte', ['gl', 0, p, n - 12, 2, k ? .5 : .65]));

    // INTRO : ukulélé et contrebasse, le xylophone frappe trois notes pour dire « on y va »
    H.intro.forEach((c, m) => { pizz('intro', m, c, H.intro[(m + 1) % 4], m === 3); uke('intro', m, c, m < 2 ? 'x...x...x...x...' : '..x...x...x...x.');
      for(let p = 0; p < 16; p += 2) add('intro', ['shk', m, p, 0, 1, p % 4 === 0 ? .5 : .3]);
      if(m >= 2) add('intro', ['clap', m, 12, 0, 1, .8, m === 3 ? 'J1' : 'J2']); });
    add('intro', ['xy', 3, 8, 72, 1, .8, 'C2'], ['xy', 3, 10, 76, 1, .85, 'C2'], ['xy', 3, 12, 79, 2, 1, 'C1']);

    couplet('A', 0);
    refrain('B', 0, false);

    // PAUSE : contrebasse et glockenspiel qui se répondent, les mains claquent seulement sur 4
    H.pause.forEach((c, m) => {
      pizz('pause', m, c, H.pause[(m + 1) % 4], true);
      add('pause', ['clap', m, 12, 0, 1, .6], ['gl', m, 4, M.ton(c, 2, 79), 1.5, .5]);
      add('pause', ['xy', m, 8, M.ton(c, 1, 72), 2, .85, 'C1'], ['xy', m, 10, M.ton(c, 2, 72), 1, .7, 'C3']);
      add('pause', ['fl', m, 12, M.ton(c, 0, 72), 3, .55]);
      for(let p = 0; p < 16; p += 4) add('pause', ['shk', m, p, 0, 1, .4]);
    });

    // FINAL : le refrain en sol majeur, avec le glockenspiel à l'octave
    refrain('final', 2, true);

    // FIN (en sol, comme le final) : arpège du xylophone, puis l'accord tenu de tout le monde
    H.fin = [A('G:6'), A('G:add9')];
    [71, 74, 76, 79].forEach((n, i) => add('fin', ['xy', 0, i*2, n, 2, .8, i === 3 ? 'C1' : 'C3']));
    add('fin', ['cb', 0, 0, 43, 4, .9], ['kick', 0, 0, 36, 2, .6], ['clap', 0, 12, 0, 1, .8, 'J1']);
    add('fin', ['xy', 1, 0, 79, 4, 1, 'C1'], ['gl', 1, 0, 91, 4, .6], ['cb', 1, 0, 43, 6, 1], ['kick', 1, 0, 36, 2, .7], ['cym', 1, 0, 0, 16, .5]);
    M.voix(null, H.fin[1], [0, 1, 2, 3], 60, 74).forEach(n => add('fin', ['uk', 1, 0, n, 6, .6], ['cl', 1, 0, n >= 62 ? n - 12 : n, 8, .45]));

    return {
      bpm: 112, sig: [4, 4], swing: .64, swingSur: 8, humain: 6, graine: 23, pistes: true,
      salle: {taille: .4, amorti: .6, niveau: .45, predelai: .01},
      instruments: {
        kick: {type: 'kick', vol: .38, tenue: .8, groupe: 'base'},
        clap: {type: 'clap', vol: .26, joueur: true, groupe: 'base'},
        shk: {type: 'shaker', vol: .08, pan: .35, groupe: 'base'},
        cym: {type: 'crash', vol: .05, groupe: 'base'},
        cb: {type: 'contrebasse_pizz', vol: .5, groupe: 'base'},
        uk: {type: 'guitare', vol: .16, pan: -.3, clarte: 1.4, groupe: 'base'},
        fl: {type: 'flute', vol: .22, pan: .2, groupe: 'base'},
        cl: {type: 'clarinette', vol: .13, pan: -.25, groupe: 'base'},
        xy: {type: 'xylophone', vol: .34, joueur: true, groupe: 'base'},
        gl: {type: 'glockenspiel', vol: .14, pan: .3, groupe: 'base'},
        gl8: {type: 'glockenspiel', vol: .08, pan: .35, groupe: 'transe'},
        cel: {type: 'celesta', vol: .09, pan: -.35, groupe: 'transe'},
        ch: {type: 'choeur', voyelle: 'ou', vol: .06, groupe: 'transe'},
      },
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: 8, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'B', 'pause', 'A', 'B', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0], A: ['Couplet', 1], B: ['Refrain', 2], pause: ['Pause', 'rest'], final: ['Final', 3], fin: ['Fin', 'rest']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: M.gamme('F', 'ionien'), gammes: {final: M.gamme('G', 'ionien'), fin: M.gamme('G', 'ionien')},
    };
  };
})();
