/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Robots de minuit » (niveau 1, face A) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Robots de minuit
   Rôle :               PREMIER niveau du jeu : il apprend à couper et à taper, la pulsation doit être évidente
   Émotion et énergie : nocturne et souriant, 5/10 → 8/10 ; le filtre qui s'ouvre fait monter l'envie de danser
   Style de référence : French house de la fin des années 90 (couleurs : boucles disco filtrées, voix robot au
                        talkbox, basse en octaves) ; un peu de disco organique (Rhodes, cordes)
   Tempo / métrique :   122 BPM, 4/4, droit, grosse caisse sur chaque temps, la musique pompe sur le kick
   Tonalité / mode :    do# dorien ; emprunt de La maj7 (bVI) pour la couleur nocturne
   Harmonie :           boucle C#m9 · F#9 · Amaj7 · G#7sus4 (puis G#7 qui ramène à do#)
   Instruments :        robot au talkbox (le joueur), claps (le joueur), basse synthé en octaves, Rhodes en accords
                        hachés, cordes, kick, charley ouvert, shaker ; transe : supersaw, arpège pluck, cuivres synthé
   Interdits :          dubstep, 808 qui glisse, batterie acoustique
   Signature :          le robot qui chante sa petite phrase, et le Rhodes qui lui répond en accords hachés
   Contrainte de jeu :  kick sur chaque temps du début à la fin (sauf la pause, où le charley tient le temps) ;
                        décompte au clap ; fin sur l'accord tenu et un dernier mot du robot
   Forme :              décompte · intro 4 · couplet 8 · refrain 8 · pause 4 · couplet 8 · refrain 8 · final 8 · fin 2
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.robots = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const BOUCLE = ['C#:m9', 'F#:9', 'A:maj7', 'G#:7sus4', 'C#:m9', 'F#:9', 'A:maj7', 'G#:7'];
    const H = {decompte: [A('C#:m9')], intro: ['C#:m9', 'F#:9', 'A:maj7', 'G#:7sus4'].map(n => A(n)), pause: ['A:maj7', 'A:maj7', 'G#:7sus4', 'G#:7'].map(n => A(n)), fin: [A('C#:m9'), A('C#:m9')]};

    // ─── la machine : kick sur chaque temps, clap sur 2 et 4 (au joueur), charley ouvert au contretemps ───
    const beat = (sec, m, tags, o) => { o = o || {};
      if(!o.sansKick) [0, 4, 8, 12].forEach(p => add(sec, ['kick', m, p, 36, 2, p ? .9 : 1]));
      add(sec, ['clap', m, 4, 0, 1, .9, tags[0]], ['clap', m, 12, 0, 1, .9, tags[1]]);
      [2, 6, 10, 14].forEach(p => add(sec, ['hho', m, p, 0, 2, .6]));
      if(o.seize) for(let p = 0; p < 16; p++) if(p % 2) add(sec, ['hh', m, p, 0, 1, .3]);
      if(!o.sansKick) for(let p = 0; p < 16; p++) add(sec, ['shk', m, p, 0, 1, p % 4 === 2 ? .6 : .32]);
    };
    // ─── basse en octaves (disco) ; elle saute à l'octave sur chaque contretemps ───
    const basse = (sec, m, c, cn) => { const r = M.ton(c, 0, 37);
      [[0, r, 1.5, 1], [2, r + 12, 1, .7], [4, r, 1, .85], [6, r + 12, 1, .7], [7, r + 12, .5, .4], [8, r, 1.5, .95], [10, r + 12, 1, .7], [12, r + 7, 1, .8]].forEach(([p, n, d, v]) => add(sec, ['bs', m, p, n, d, v]));
      const nx = M.ton(cn, 0, 37); add(sec, ['bs', m, 14, nx === r ? r + 10 : nx > r ? nx - 1 : nx + 1, 1.5, .78]); };
    // ─── Rhodes « boucle disco » haché ; il répond au robot dans les trous ───
    let vRh = null;
    const hache = (sec, m, c, motif, vol) => { vRh = M.voix(vRh, c, [1, 2, 3, c.iv.length > 4 ? 4 : 0], 57, 72);
      [...motif].forEach((ch, p) => { if(ch === 'x' || ch === 'X') vRh.forEach((n, k) => add(sec, ['rh', m, p + k*.02, n, ch === 'X' ? 1.6 : .8, (ch === 'X' ? .7 : .5)*(vol || 1)])); }); };
    const cordes = (sec, m, c) => M.voix(null, c, [1, 2, 3], 64, 79).forEach(n => add(sec, ['vn', m, 0, n, 16, .5]));

    // ─── le robot chante (inventé) : question en 2 mesures, réponse en 2 mesures ───
    const ROBOT = [
      [0, 0, 68, 2, 1], [0, 3, 71, 1, 3], [0, 4, 73, 2, 2], [0, 8, 75, 3, 1], [0, 12, 73, 2, 2],
      [1, 0, 73, 2, 1], [1, 3, 70, 1, 3], [1, 4, 68, 2, 2], [1, 8, 66, 4, 1],
      [2, 0, 68, 2, 1], [2, 2, 69, 1, 3], [2, 4, 73, 2, 2], [2, 8, 76, 3, 1], [2, 12, 73, 2, 2],
      [3, 0, 75, 2, 1], [3, 4, 73, 2, 2], [3, 8, 66, 3, 1], [3, 12, 68, 2, 2],
      [4, 0, 68, 2, 1], [4, 3, 71, 1, 3], [4, 4, 73, 2, 2], [4, 8, 75, 3, 1], [4, 12, 76, 2, 2],
      [5, 0, 80, 2, 1], [5, 3, 78, 1, 3], [5, 4, 73, 2, 2], [5, 8, 70, 4, 1],
      [6, 0, 76, 2, 1], [6, 2, 75, 1, 3], [6, 4, 73, 2, 2], [6, 8, 68, 3, 1], [6, 12, 69, 1, 3],
      [7, 0, 72, 2, 1], [7, 4, 75, 2, 2], [7, 8, 78, 2, 1], [7, 12, 72, 2, 2],
    ];
    const robot = (sec, octave, avecTagsMax) => ROBOT.forEach(([m, p, n, d, lv]) => { const l = Math.min(4, lv + (avecTagsMax || 0));
      add(sec, ['rob', m, p, n, d, lv === 1 ? 1 : .85, 'C' + l]); if(octave) add(sec, ['ss', m, p, n + 12, d, .5]); });

    // DÉCOMPTE : quatre claps
    [0, 4, 8, 12].forEach((p, k) => add('decompte', ['clap', 0, p, 0, 1, k ? .7 : .9]));

    // INTRO : la boucle filtrée (le jeu ouvre le filtre), le kick dès la 1re mesure pour apprendre le temps
    H.intro.forEach((c, m) => { beat('intro', m, ['J1', 'J1']); hache('intro', m, c, '..x..x....x..x..', .9); if(m >= 2) basse('intro', m, c, H.intro[(m + 1) % 4]); });

    // COUPLET : basse + Rhodes haché ; le robot pose une phrase sur deux, le Rhodes répond à l'autre
    const couplet = (sec) => { const harm = BOUCLE.map(n => A(n)); H[sec] = harm;
      harm.forEach((c, m) => { const cn = harm[(m + 1) % 8]; beat(sec, m, ['J1', 'J2']); basse(sec, m, c, cn);
        if(m % 2 === 0){ hache(sec, m, c, '..x.......x.....', .7); ROBOT.filter(x => x[0] === m % 4 + (m >= 4 ? 4 : 0) && x[1] < 8).forEach(([, p, n, d, lv]) => add(sec, ['rob', m, p, n, d, .9, 'C' + Math.min(3, lv + 1)])); }
        else hache(sec, m, c, '..x..x..X.x..x.x', 1);
        // transe : arpège pluck en doubles croches
        [0, 1, 2, 3, 4, 3, 2, 1].forEach((i, q) => add(sec, ['arp', m, q*2, M.ton(c, i, 64), 1.5, q % 2 ? .45 : .6]));
      }); };
    // REFRAIN : le robot chante tout, Rhodes et cordes tiennent, la machine tourne à fond
    const refrain = (sec, octave) => { const harm = BOUCLE.map(n => A(n)); H[sec] = harm;
      harm.forEach((c, m) => { const cn = harm[(m + 1) % 8]; beat(sec, m, ['J1', 'J1'], {seize: true}); basse(sec, m, c, cn); cordes(sec, m, c); hache(sec, m, c, '..x.......x.....', .55);
        M.voix(null, c, [1, 2, 3], 60, 74).forEach(n => add(sec, ['sc', m, 14, n, 2, .55]));
        [0, 1, 2, 3, 4, 3, 2, 1].forEach((i, q) => add(sec, ['arp', m, q*2, M.ton(c, i, 64), 1.5, q % 2 ? .45 : .6]));
      });
      robot(sec, octave); add(sec, ['cr', 0, 0, 0, 16, .6]);
    };

    couplet('A'); refrain('B', false);

    // PAUSE : le kick s'arrête, les cordes et le Rhodes flottent, le robot dit deux mots ; tout remonte à la fin
    H.pause.forEach((c, m) => { beat('pause', m, [null, 'J2'], {sansKick: true}); cordes('pause', m, c); hache('pause', m, c, 'X.......X.......', .8);
      add('pause', ['rob', m, 8, M.ton(c, 2, 66), 3, .9, 'C1'], ['rob', m, 12, M.ton(c, 1, 66), 3, .8, 'C2']);
      if(m === 3) [8, 10, 12, 13, 14, 15].forEach((p, i) => add('pause', ['kick', m, p, 36, 1, .5 + i*.08])); });

    refrain('final', true);

    // FIN : l'accord tenu, le kick s'arrête, le robot dit son dernier mot
    add('fin', ['kick', 0, 0, 36, 2, 1], ['clap', 0, 4, 0, 1, .9, 'J1'], ['cr', 0, 0, 0, 16, .7], ['bs', 0, 0, 37, 8, 1]);
    cordes('fin', 0, H.fin[0]); hache('fin', 0, H.fin[0], 'X.......', 1);
    add('fin', ['rob', 0, 8, 68, 2, .9, 'C2'], ['rob', 0, 10, 71, 2, .9, 'C2'], ['rob', 0, 12, 73, 2, 1, 'C1'], ['rob', 1, 0, 68, 6, 1, 'C1'], ['bs', 1, 0, 37, 6, 1], ['kick', 1, 0, 36, 2, 1]);

    return M.frappes({
      bpm: 122, sig: [4, 4], swing: .5, humain: 3, graine: 41, pistes: true, pompe: true,
      salle: {taille: .5, amorti: .5, niveau: .45, predelai: .015},
      instruments: {
        kick: {type: 'kick', vol: .6, f0: 130, f1: 48, groupe: 'base'},
        clap: {type: 'clap', vol: .3, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: .22, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .27, groupe: 'base'}, shk: {type: 'shaker', vol: .09, pan: .35, groupe: 'base'},
        cr: {type: 'crash', vol: .07, groupe: 'base'},
        bs: {type: 'synth_basse', vol: .46, groupe: 'base'},
        rh: {type: 'rhodes', vol: .18, pan: -.2, verb: .25, groupe: 'base'},
        vn: {type: 'violons', vol: .08, pan: .25, groupe: 'base'},
        rob: {type: 'talkbox', vol: .3, joueur: true, groupe: 'base'},
        arp: {type: 'synth_pluck', vol: .1, pan: .35, groupe: 'transe'},
        ss: {type: 'supersaw', vol: .1, groupe: 'transe'},
        sc: {type: 'synth_cuivres', vol: .12, pan: -.3, groupe: 'transe'},
      },
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: 8, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'B', 'pause', 'A', 'B', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0], A: ['Couplet', 1], B: ['Refrain', 2], pause: ['Pause', 'rest'], final: ['Final', 3], fin: ['Fin', 'rest']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: M.gamme('C#', 'dorien'),
    }, {C: {instr: {type: 'caisse', vol: .2, verb: .25}}});
  };
})();
