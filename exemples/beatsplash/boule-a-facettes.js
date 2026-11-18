/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Boule à facettes » (niveau 3, face C) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Boule à facettes
   Rôle :               niveau 3 : on apprend la DIAGONALE ; couper = les cordes, taper = les claps
   Émotion et énergie : piste de danse pleine, lumière qui tourne, 7/10 → 10/10
   Style de référence : disco de la fin des années 70 (couleurs : orchestres disco de Philadelphie et de New York,
                        cordes qui s'envolent, basse en octaves) ; tout acoustique sauf rien : c'est un orchestre
   Tempo / métrique :   120 BPM, 4/4, grosse caisse sur chaque temps, charley ouvert sur chaque contretemps
   Tonalité / mode :    ré mineur ; le final monte d'un ton (mi mineur)
   Harmonie :           le cycle des quintes : Dm7 · Gm7 · C9 · Fmaj7 · Bbmaj7 · Em7b5 · A7 ; refrain Bbmaj7 · C · Am7 ·
                        Dm7 · Gm7 · C9 · Fmaj7 · A7
   Instruments :        cordes (le joueur), claps (le joueur), basse en octaves, guitare funk, piano, kick, caisse,
                        charleys, montées de cordes ; transe : cuivres, congas, tambourin, chœur, glockenspiel
   Interdits :          synthés, talkbox, 808
   Signature :          les montées de cordes en doubles croches à la fin de chaque phrase, et le refrain qui
                        retombe sur le la grave avant de repartir
   Contrainte de jeu :  section « En diagonale ! » (4 mesures, toutes les coupes en diagonale) ; kick sur chaque
                        temps partout sauf la pause ; décompte aux claps ; fin sur un accord tenu et une montée de cordes
   Forme :              décompte · intro 4 · couplet 8 · En diagonale ! 4 · refrain 8 · pause 4 · couplet 8 · refrain 8 ·
                        final 8 (+1 ton) · fin 2
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.facettes = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const COUPLET = ['D:m7', 'G:m7', 'C:9', 'F:maj7', 'Bb:maj7', 'E:m7b5', 'A:7', 'A:7'];
    const REFRAIN = ['Bb:maj7', 'C:maj', 'A:m7', 'D:m7', 'G:m7', 'C:9', 'F:maj7', 'A:7'];
    const H = {decompte: [A('D:m7')], intro: ['D:m7', 'G:m7', 'C:9', 'A:7'].map(n => A(n)), apprend: ['D:m7', 'D:m7', 'G:m7', 'A:7'].map(n => A(n)),
      pause: ['Bb:maj7', 'Bb:maj7', 'G:m7', 'A:7sus4'].map(n => A(n)), fin: [A('E:m7'), A('E:m9')]};
    const G0 = M.gamme('D', 'harmonique');
    // montée de cordes : gamme du mode, de la note d'accord vers la suivante (notes courtes, non jouées par le joueur)
    const montee = (sec, m, c, g, depuis, n) => { const sc = []; for(let x = 60; x < 96; x++) if(g.includes(x % 12)) sc.push(x); let i = sc.indexOf(M.ton(c, 0, depuis)); if(i < 0) i = 0;
      for(let q = 0; q < n; q++) add(sec, ['run', m, 16 - n + q, sc[i + q], .9, .45 + q*.08]); };

    // ─── la piste de danse ───
    const disco = (sec, m, tags, o) => { o = o || {};
      if(!o.sansKick) [0, 4, 8, 12].forEach(p => add(sec, ['kick', m, p, 36, 2, p ? .88 : 1]));
      add(sec, ['clap', m, 4, 0, 1, .9, tags[0]], ['clap', m, 12, 0, 1, .9, tags[1]], ['cs', m, 4, 0, 1, .5], ['cs', m, 12, 0, 1, .5]);
      [2, 6, 10, 14].forEach(p => add(sec, ['hho', m, p, 0, 2, .62])); [0, 4, 8, 12].forEach(p => add(sec, ['hh', m, p, 0, 1, .4]));
    };
    const octaves = (sec, m, c) => { const r = M.ton(c, 0, 38); for(let p = 0; p < 16; p += 2) add(sec, ['bs', m, p, p % 4 === 2 ? r + 12 : r, 1.6, p % 4 === 2 ? .75 : .95]); };
    let vGt = null, vPn = null;
    const guitare = (sec, m, c) => { vGt = M.voix(vGt, c, [1, 2, 3], 64, 76); [...'g.x.g.xgg.x.g.xg'].forEach((ch, p) => { if(ch === 'x') vGt.forEach((n, k) => add(sec, ['gt', m, p + k*.03, n, .5, .55])); if(ch === 'g') add(sec, ['gt', m, p, vGt[1], .2, .2]); }); };
    const piano = (sec, m, c) => { vPn = M.voix(vPn, c, [0, 1, 2, 3], 55, 70); [2, 6, 10, 14].forEach(p => vPn.forEach(n => add(sec, ['pn', m, p, n, 1.2, .45]))); };
    const tapis = (sec, m, c) => M.voix(null, c, [1, 2, 3], 62, 76).forEach(n => add(sec, ['pad', m, 0, n, 16, .45]));

    // ─── refrain (inventé) aux cordes : [mesure, pas, midi, durée, niveau] ───
    const HOOK = [
      [0, 0, 74, 2, 1], [0, 2, 77, 2, 3], [0, 4, 81, 3, 2], [0, 8, 77, 2, 1], [0, 10, 74, 2, 3], [0, 12, 70, 3, 2],
      [1, 0, 72, 2, 1], [1, 2, 76, 2, 3], [1, 4, 79, 3, 2], [1, 8, 76, 3, 1], [1, 12, 72, 2, 2],
      [2, 0, 76, 2, 1], [2, 2, 79, 1, 3], [2, 4, 81, 3, 2], [2, 8, 84, 3, 1], [2, 12, 81, 2, 2],
      [3, 0, 77, 3, 1], [3, 4, 74, 2, 2], [3, 6, 72, 2, 3], [3, 8, 69, 6, 1],
      [4, 0, 70, 2, 1], [4, 2, 74, 2, 3], [4, 4, 77, 3, 2], [4, 8, 79, 3, 1], [4, 12, 74, 2, 2],
      [5, 0, 76, 2, 1], [5, 2, 79, 2, 3], [5, 4, 82, 3, 2], [5, 8, 84, 2, 1], [5, 12, 86, 2, 2],
      [6, 0, 84, 2, 1], [6, 2, 81, 2, 3], [6, 4, 77, 3, 2], [6, 8, 76, 3, 1], [6, 12, 72, 2, 2],
      [7, 0, 73, 2, 1], [7, 2, 76, 2, 3], [7, 4, 79, 2, 2], [7, 6, 81, 2, 3], [7, 8, 85, 3, 1],
    ];
    // au couplet, les cordes répondent en fin de mesure (deux notes de l'accord)
    const REPONSE = [[[10, 2, 1, 'C2'], [12, 4, 2, 'C1']], [[10, 1, 1, 'C3'], [11, 2, 1, 'C3'], [12, 3, 2, 'C1']], [[12, 2, 2, 'C1']], [[10, 4, 1, 'C2'], [12, 2, 2, 'C1']]];

    // DÉCOMPTE : les claps
    [0, 4, 8, 12].forEach((p, k) => add('decompte', ['clap', 0, p, 0, 1, k ? .7 : .9]));

    // INTRO : la boule s'allume : kick + charley, la guitare, puis la basse ; une montée de cordes appelle le couplet
    H.intro.forEach((c, m) => { disco('intro', m, ['J2', 'J1']); guitare('intro', m, c); if(m >= 1) octaves('intro', m, c); });
    montee('intro', 3, H.intro[3], G0, 69, 8);

    const couplet = (sec, k) => { const harm = COUPLET.map(n => A(n, k)); H[sec] = harm; const g = G0.map(x => (x + k) % 12);
      harm.forEach((c, m) => { disco(sec, m, ['J1', 'J2']); octaves(sec, m, c); guitare(sec, m, c); piano(sec, m, c);
        if(m === 7) montee(sec, m, c, g, 69, 8);
        else REPONSE[(m + (m >> 2)) % 4].forEach(([p, i, d, tag]) => add(sec, ['vn', m, p, M.ton(c, i, 69), d, .85, tag]));
        add(sec, ['tamb', m, 2, 0, 1, .5], ['tamb', m, 6, 0, 1, .5], ['tamb', m, 10, 0, 1, .5], ['tamb', m, 14, 0, 1, .5]);
      }); };
    // EN DIAGONALE ! : la guitare et la basse tiennent, les cordes jouent des coups francs (toutes les coupes en diagonale)
    H.apprend.forEach((c, m) => { disco('apprend', m, [null, 'J2']); octaves('apprend', m, c); guitare('apprend', m, c);
      add('apprend', ['vn', m, 0, M.ton(c, 1, 69), 2, .9, 'C1'], ['vn', m, 8, M.ton(c, 2, 69), 2, .85, 'C1'], ['vn', m, 12, M.ton(c, 0, 72), 2, .8, 'C2']); });
    const refrain = (sec, k, octave) => { const harm = REFRAIN.map(n => A(n, k)); H[sec] = harm; const g = G0.map(x => (x + k) % 12);
      harm.forEach((c, m) => { disco(sec, m, ['J1', 'J1']); octaves(sec, m, c); guitare(sec, m, c); tapis(sec, m, c);
        if(m === 7) montee(sec, m, c, g, 76, 4);
        // transe : cuivres en coups, congas, chœur, glockenspiel
        M.voix(null, c, [1, 2, 3], 62, 74).forEach(n => add(sec, ['cu', m, 6, n, .8, .7], ['cu', m, 14, n, 1.5, .8]));
        [[2, 62], [3, 62], [6, 55], [10, 62], [11, 64], [14, 55]].forEach(([p, n]) => add(sec, ['cg', m, p, M.ton(c, 0, n), 1, .55]));
        M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ch', m, 0, n, 16, .45]));
        for(let p = 0; p < 16; p++) add(sec, ['tamb', m, p, 0, 1, p % 2 ? .3 : .55]);
      });
      HOOK.forEach(([m, p, n, d, lv]) => { add(sec, ['vn', m, p, n + k, d, lv === 1 ? 1 : .86, 'C' + lv]); if(octave || lv === 1) add(sec, ['gl', m, p, n + k + 12, d, .4]); });
      add(sec, ['cr', 0, 0, 0, 16, .7], ['cr', 4, 0, 0, 16, .55]);
    };

    couplet('A', 0);
    refrain('B', 0, false);

    // PAUSE : le kick s'arrête, les cordes et le piano planent, les claps tiennent ; la basse relance
    H.pause.forEach((c, m) => { disco('pause', m, [null, null], {sansKick: true}); tapis('pause', m, c); piano('pause', m, c);
      add('pause', ['vn', m, 0, M.ton(c, 2, 69), 4, .85, 'C1']); if(m === 3){ octaves('pause', m, c); montee('pause', m, c, G0, 69, 8); } });

    refrain('final', 2, true);

    // FIN (en mi mineur) : coup d'orchestre, montée de cordes, accord tenu
    const F0 = H.fin[0], F1 = H.fin[1];
    add('fin', ['kick', 0, 0, 36, 2, 1], ['clap', 0, 4, 0, 1, .9, 'J1'], ['cr', 0, 0, 0, 16, .8], ['bs', 0, 0, 40, 4, 1]);
    M.voix(null, F0, [1, 2, 3], 62, 74).forEach(n => add('fin', ['cu', 0, 0, n, 2, 1], ['pn', 0, 0, n, 2, .7]));
    montee('fin', 0, F0, M.gamme('E', 'harmonique'), 71, 8);
    add('fin', ['kick', 1, 0, 36, 2, 1], ['cr', 1, 0, 0, 16, 1], ['bs', 1, 0, 40, 6, 1], ['vn', 1, 0, 83, 6, 1, 'C1']);
    M.voix(null, F1, [0, 1, 2, 3, 4], 60, 79).forEach(n => add('fin', ['pad', 1, 0, n, 8, .7], ['cu', 1, 0, n, 4, .8]));

    return {
      bpm: 120, sig: [4, 4], swing: .5, humain: 5, graine: 29, pistes: true,
      salle: {taille: .55, amorti: .45, niveau: .55, predelai: .015},
      instruments: {
        kick: {type: 'kick', vol: .55, groupe: 'base'}, cs: {type: 'caisse', vol: .18, groupe: 'base'}, clap: {type: 'clap', vol: .28, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: .14, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .2, groupe: 'base'}, cr: {type: 'crash', vol: .07, groupe: 'base'},
        bs: {type: 'basse', vol: .42, brillance: 1.1, wah: .08, groupe: 'base'},
        gt: {type: 'guitare', vol: .14, pan: -.4, etouffe: .8, groupe: 'base'},
        pn: {type: 'piano', vol: .14, pan: .3, groupe: 'base'},
        vn: {type: 'violons', vol: .28, attaque: .025, chute: .3, soutien: .7, pan: -.1, joueur: true, groupe: 'base'},
        run: {type: 'violons', vol: .2, attaque: .01, pan: .2, groupe: 'base'},
        pad: {type: 'altos', vol: .1, pan: .25, groupe: 'base'},
        tamb: {type: 'shaker', vol: .08, pan: .4, groupe: 'transe'},
        cu: {type: 'cuivres_stab', vol: .15, groupe: 'transe'},
        cg: {type: 'tom', vol: .13, pan: -.35, groupe: 'transe'},
        ch: {type: 'choeur', vol: .06, groupe: 'transe'},
        gl: {type: 'glockenspiel', vol: .07, pan: .35, groupe: 'transe'},
      },
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A}, apprend: {mesures: 4, notes: N.apprend},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: 8, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'apprend', 'B', 'pause', 'A', 'B', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0, 'CJ'], A: ['Couplet', 1, 'CJ'], apprend: ['En diagonale !', 0, 'GJ'], B: ['Refrain', 2, 'CJG'], pause: ['Pause', 'rest', 'C'], final: ['Final', 3, 'CJG'], fin: ['Fin', 'rest', 'CJ']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: G0, gammes: {final: M.gamme('E', 'harmonique'), fin: M.gamme('E', 'harmonique')},
    };
  };
})();
