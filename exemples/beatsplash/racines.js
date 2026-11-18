/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Racines » (niveau 5, face E) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Racines
   Rôle :               niveau 5 : on apprend les NOTES TENUES ; tenir = les notes longues du mélodica, couper = ses
                        notes courtes, taper = le coup de caisse du « one drop » (sur le 3)
   Émotion et énergie : soleil, chaleur, paix, 4/10 → 7/10 ; jamais pressé
   Style de référence : reggae roots des années 70 (couleurs : mélodica dans l'écho dub, basse ronde et chantante,
                        guitare skank, orgue qui « bulle ») ; rien d'électronique
   Tempo / métrique :   74 BPM, 4/4, « one drop » (kick et caisse sur le 3), croches légèrement swinguées (58 %)
   Tonalité / mode :    sol majeur
   Harmonie :           couplet G · Em7 · C · D (2 fois), refrain C · G · Am7 · D7sus4 · C · G · Em7 · D7
   Instruments :        mélodica (le joueur), caisse claire / rim du one drop (le joueur), basse ronde, guitare
                        skank, orgue (bulle), kick, charley ; transe : trombones, chœur « o », shaker, échos de mélodica
   Interdits :          batterie sur chaque temps, synthés, distorsion
   Signature :          le mélodica qui tient ses notes et que l'écho répète, et la basse qui chante entre les temps
   Contrainte de jeu :  section « Tiens la note ! » (4 mesures : une longue note à tenir par mesure) ; charley en
                        croches partout ; décompte au rim ; fin sur l'accord de sol qui s'éteint dans l'écho
   Forme :              décompte · intro 4 · couplet 8 · Tiens la note ! 4 · refrain 8 · pause 4 · refrain 8 · final 4 · fin 2
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.racines = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const COUPLET = ['G:maj', 'E:m7', 'C:maj', 'D:maj', 'G:maj', 'E:m7', 'C:maj', 'D:7'];
    const REFRAIN = ['C:maj', 'G:maj', 'A:m7', 'D:7sus4', 'C:maj', 'G:maj', 'E:m7', 'D:7'];
    const H = {decompte: [A('G:maj')], intro: ['G:maj', 'E:m7', 'C:maj', 'D:7'].map(n => A(n)), apprend: ['C:maj', 'G:maj', 'A:m7', 'D:7'].map(n => A(n)),
      pause: ['E:m7', 'C:maj', 'A:m7', 'D:7sus4'].map(n => A(n)), final: ['C:maj', 'G:maj', 'E:m7', 'D:7'].map(n => A(n)), fin: [A('G:maj'), A('G:maj')]};

    // ─── le one drop : rien sur le 1, kick et caisse ensemble sur le 3 (le coup de caisse au joueur) ───
    const drop = (sec, m, tag, o) => { o = o || {};
      add(sec, ['kick', m, 8, 36, 2, 1], ['rim', m, 8, 0, 1, 1, tag]);
      for(let p = 0; p < 16; p += 2) add(sec, ['hh', m, p, 0, 1, p % 4 ? .38 : .55]);
      add(sec, ['hho', m, 6, 0, 2, .5], ['hho', m, 14, 0, 2, .5]);
      if(o.fill) [[12, 64], [13, 60], [14, 55], [15, 50]].forEach(([p, n], i) => add(sec, ['tom', m, p, n, 1.5, .55 + i*.1]));
    };
    // ─── la basse chante entre les temps ───
    const basse = (sec, m, c, cn) => { const r = M.ton(c, 0, 38), t = M.ton(c, 1, 38), q = M.ton(c, 2, 38), nx = M.ton(cn, 0, 38);
      [[2, r, 2, .95], [4, r, 1.5, .7], [6, t, 1.5, .8], [10, q, 2, .9], [12, r + 12 > 52 ? r : r + 12, 1.5, .7]].forEach(([p, n, d, v]) => add(sec, ['bs', m, p, n, d, v]));
      add(sec, ['bs', m, 14, nx === r ? q : nx, 2, .8, '!']); };   // « ! » : elle annonce l'accord suivant
    // ─── skank (guitare sur 2 et 4) et bulle d'orgue (les « et ») ───
    let vSk = null, vOr = null;
    const skank = (sec, m, c) => { vSk = M.voix(vSk, c, [0, 1, 2], 62, 74); [4, 12].forEach(p => vSk.forEach((n, k) => add(sec, ['sk', m, p + k*.02, n, .6, .7]))); };
    const bulle = (sec, m, c) => { vOr = M.voix(vOr, c, [0, 1, 2], 55, 67); [2, 3, 6, 7, 10, 11, 14, 15].forEach((p, i) => vOr.forEach(n => add(sec, ['org', m, p, i % 2 ? n : n - 12 >= 48 ? n - 12 : n, .7, i % 2 ? .4 : .55]))); };
    // ─── le mélodica et son écho dub (l'écho est écrit : trois doubles croches plus tard, plus doux, plus court) ───
    const melo = (sec, m, p, n, d, tag, echo) => { add(sec, ['mel', m, p, n, d, tag && tag[0] === 'H' ? .9 : 1, tag]); if(echo){ const p2 = p + 3; if(p2 < 16) add(sec, ['ech', m, p2, n, .9, .4]); } };

    // ─── le refrain (inventé) : [mesure, pas, midi, durée, geste] ; les notes longues se tiennent ───
    const HOOK = [
      [0, 0, 72, 2, 'C1'], [0, 2, 76, 2, 'C3'], [0, 4, 79, 8, 'H1'], [0, 12, 76, 2, 'C2'],
      [1, 0, 74, 2, 'C1'], [1, 2, 71, 2, 'C3'], [1, 4, 67, 8, 'H2'], [1, 12, 71, 2, 'C2'],
      [2, 0, 76, 6, 'H1'], [2, 8, 72, 2, 'C2'], [2, 10, 69, 2, 'C3'], [2, 12, 72, 3, 'C2'],
      [3, 0, 74, 2, 'C1'], [3, 4, 79, 2, 'C2'], [3, 8, 81, 6, 'H1'],
      [4, 0, 72, 2, 'C1'], [4, 2, 76, 2, 'C3'], [4, 4, 79, 8, 'H1'], [4, 12, 76, 2, 'C2'],
      [5, 0, 79, 8, 'H1'], [5, 8, 74, 2, 'C2'], [5, 12, 71, 3, 'C2'],
      [6, 0, 71, 2, 'C1'], [6, 2, 74, 2, 'C3'], [6, 4, 76, 8, 'H1'],
      [7, 0, 78, 2, 'C1'], [7, 4, 81, 2, 'C2'], [7, 8, 72, 6, 'H2'],
    ];

    // DÉCOMPTE : le rim
    [0, 4, 8, 12].forEach((p, k) => add('decompte', ['rim', 0, p, 0, 1, k ? .7 : .9]));

    // INTRO : l'orgue et la guitare posent le skank, la basse entre, le mélodica lance une note tenue
    H.intro.forEach((c, m) => { skank('intro', m, c); bulle('intro', m, c); if(m >= 1) drop('intro', m, m === 3 ? 'J1' : 'J2', {fill: m === 3}); if(m >= 2) basse('intro', m, c, H.intro[(m + 1) % 4]); });
    melo('intro', 3, 0, 74, 2, 'C1', true); melo('intro', 3, 4, 78, 2, 'C2', true);

    // COUPLET : le mélodica appelle (deux notes courtes), la basse lui répond ; l'orgue bulle
    H.A = COUPLET.map(n => A(n));
    H.A.forEach((c, m) => { drop('A', m, 'J1', {fill: m === 7}); basse('A', m, c, H.A[(m + 1) % 8]); skank('A', m, c); bulle('A', m, c);
      if(m % 2 === 0){ melo('A', m, 0, M.ton(c, 2, 67), 2, 'C1', true); melo('A', m, 4, M.ton(c, 1, 69), 3, 'C2', true); }
      for(let p = 0; p < 16; p += 2) add('A', ['shk', m, p, 0, 1, .4]); });
    // TIENS LA NOTE ! : une longue note du mélodica par mesure, à tenir ; le groupe joue doucement en dessous
    H.apprend.forEach((c, m) => { drop('apprend', m, 'J1'); basse('apprend', m, c, H.apprend[(m + 1) % 4]); skank('apprend', m, c);
      melo('apprend', m, 0, M.ton(c, 1, 69), 10, 'H1', false); melo('apprend', m, 12, M.ton(c, 2, 67), 2, 'C2', true); });
    // REFRAIN : le mélodica chante ; trombones et chœur dans la transe
    const refrain = (sec, harm, hook) => { H[sec] = harm;
      harm.forEach((c, m) => { drop(sec, m, 'J1', {fill: m === harm.length - 1}); basse(sec, m, c, harm[(m + 1) % harm.length]); skank(sec, m, c); bulle(sec, m, c);
        M.voix(null, c, [0, 1, 2], 53, 65).forEach(n => add(sec, ['tb', m, 4, n, 1, .6], ['tb', m, 12, n, 1, .6]));
        M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ch', m, 0, n, 16, .45]));
        for(let p = 0; p < 16; p += 2) add(sec, ['shk', m, p, 0, 1, .45]);
      });
      hook.forEach(([m, p, n, d, tag]) => melo(sec, m, p, n, d, tag, tag[0] === 'C'));
      add(sec, ['cr', 0, 0, 0, 16, .5]);
    };
    refrain('B', REFRAIN.map(n => A(n)), HOOK);

    // PAUSE : basse et orgue seuls, le mélodica tient deux notes, l'écho répond
    H.pause.forEach((c, m) => { bulle('pause', m, c); basse('pause', m, c, H.pause[(m + 1) % 4]); for(let p = 0; p < 16; p += 4) add('pause', ['hh', m, p, 0, 1, .35]);
      melo('pause', m, 0, M.ton(c, 1, 69), 6, 'C1', false); add('pause', ['ech', m, 8, M.ton(c, 1, 69), .9, .35], ['ech', m, 11, M.ton(c, 1, 69), .9, .25]); });

    // FINAL : la réponse du refrain, en quatre mesures
    refrain('final', H.final, HOOK.filter(x => x[0] >= 4).map(([m, ...r]) => [m - 4, ...r]));

    // FIN : l'accord de sol qui s'éteint dans l'écho
    skank('fin', 0, H.fin[0]); add('fin', ['kick', 0, 8, 36, 2, 1], ['rim', 0, 8, 0, 1, 1, 'J1'], ['bs', 0, 2, 43, 6, .9]);
    melo('fin', 0, 0, 79, 12, 'H1', false); [0, 3, 6, 9].forEach((p, i) => add('fin', ['ech', 1, p, 79, .9, .4 - i*.08]));
    M.voix(null, H.fin[1], [0, 1, 2], 55, 67).forEach(n => add('fin', ['org', 1, 0, n, 8, .5]));

    return M.frappes({
      bpm: 74, sig: [4, 4], swing: .58, swingSur: 8, humain: 7, graine: 61, pistes: true,
      salle: {taille: .6, amorti: .45, niveau: .55, predelai: .02},
      instruments: {
        kick: {type: 'kick', vol: .6, f0: 105, f1: 45, groupe: 'base'}, rim: {type: 'rim', vol: .42, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: .5, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .18, groupe: 'base'}, tom: {type: 'tom', vol: .25, groupe: 'base'}, cr: {type: 'crash', vol: .05, groupe: 'base'},
        bs: {type: 'basse', vol: .5, brillance: .25, sub: 1.1, wah: .4, drive: 1.2, groupe: 'base'},
        sk: {type: 'guitare', vol: .2, pan: .35, etouffe: .9, clarte: .95, groupe: 'base'},
        org: {type: 'orgue', vol: .11, pan: -.3, percussion: .2, groupe: 'base'},
        mel: {type: 'hautbois', harmoniques: [1, .6, .5, .35, .2, .1], souffle: .02, vol: .26, pan: .05, joueur: true, groupe: 'base'},
        ech: {type: 'hautbois', harmoniques: [1, .6, .5, .35, .2, .1], souffle: .02, vol: .12, pan: -.4, verb: .6, groupe: 'transe'},
        tb: {type: 'trombones', vol: .12, pan: -.2, groupe: 'transe'},
        ch: {type: 'choeur', voyelle: 'o', vol: .05, groupe: 'transe'},
        shk: {type: 'shaker', vol: .09, pan: .35, groupe: 'base'},
      },
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A}, apprend: {mesures: 4, notes: N.apprend},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: 4, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'apprend', 'B', 'pause', 'B', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0, 'CJ'], A: ['Couplet', 1, 'CJ'], apprend: ['Tiens la note !', 0, 'HCJ'], B: ['Refrain', 2, 'CJH'], pause: ['Pause', 'rest', 'C'], final: ['Final', 3, 'CJH'], fin: ['Fin', 'rest', 'HJ']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: M.gamme('G', 'ionien'),
    }, {});
  };
})();
