/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Pas de lune » (niveau 2, face B) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Pas de lune
   Rôle :               niveau 2 : on apprend le SCRATCH ; couper = le synthé lead, taper = la caisse claire
   Émotion et énergie : nuit en ville, sourire en coin, 6/10 → 9/10
   Style de référence : pop funk du début des années 80 (couleurs : synthés analogiques sur une guitare funk, basse
                        claquée, batterie sèche) ; pas d'électro moderne
   Tempo / métrique :   116 BPM, 4/4, swing léger des doubles croches (54 %)
   Tonalité / mode :    si bémol majeur ; le final monte d'un demi-ton (si majeur), à la manière des tubes pop
   Harmonie :           couplet Bbmaj7 · Eb9 (vamp) puis Gm7 · Cm7 · F7sus4 · F7 ; refrain Ebmaj7 · F · Dm7 · Gm7 ·
                        Ebmaj7 · F · Cm7 · F7
   Instruments :        synthé lead (le joueur), basse claquée, guitare funk étouffée, cuivres synthé, kick, caisse
                        claire (le joueur), charley ; transe : claps, supersaw, toms
   Interdits :          talkbox (c'est le niveau 1), 808, kick sur chaque temps
   Signature :          au couplet, le synthé lance un petit riff, la basse claquée lui répond ; au refrain, les
                        scratchs tombent dans les silences du hook
   Contrainte de jeu :  section « Scratch ! » (4 mesures) où la musique laisse toute la place au geste ; charley en
                        doubles croches partout ; décompte au charley ; fin sur Bb6/9
   Forme :              décompte · intro 4 · couplet 8 · Scratch ! 4 · refrain 8 · pause 4 · couplet 8 · refrain 8 ·
                        final 8 (+1 demi-ton) · fin 2
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.lune = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const COUPLET = ['Bb:maj7', 'Eb:9', 'Bb:maj7', 'Eb:9', 'G:m7', 'C:m7', 'F:7sus4', 'F:7'];
    const REFRAIN = ['Eb:maj7', 'F:maj', 'D:m7', 'G:m7', 'Eb:maj7', 'F:maj', 'C:m7', 'F:7'];
    const H = {decompte: [A('Bb:maj7')], intro: ['Bb:maj7', 'Eb:9', 'Bb:maj7', 'F:7'].map(n => A(n)), apprend: ['G:m7', 'G:m7', 'C:m7', 'F:7'].map(n => A(n)),
      pause: ['Eb:maj7', 'D:m7', 'C:m7', 'F:7sus4'].map(n => A(n)), fin: [A('Bb:69'), A('Bb:69')]};

    // ─── batterie sèche : kick syncopé, caisse claire sur 2 et 4 (au joueur), charley en doubles croches ───
    const batterie = (sec, m, tags, o) => { o = o || {};
      [...(o.dense ? 'x..x..x...x..x..' : 'x.....x...x.....')].forEach((c, p) => { if(c === 'x') add(sec, ['kick', m, p, 36, 2, p ? .8 : 1]); });
      add(sec, ['cs', m, 4, 0, 2, .95, tags[0]], ['cs', m, 12, 0, 2, .95, tags[1]], ['cs', m, 7, 0, 1, .15], ['cs', m, 15, 0, 1, .18]);
      M.charley(add, sec, m, 'hh', {ouvert: o.ouvert ? 14 : 0});
      if(o.fill) [[12, 64], [13, 60], [14, 55], [15, 50]].forEach(([p, n], i) => add(sec, ['tom', m, p, n, 1.5, .6 + i*.1]));
    };
    // ─── basse claquée : le pouce sur les temps, l'octave claquée, et ses réponses en doubles croches ───
    const basse = (sec, m, c, cn, repond) => { const r = M.ton(c, 0, 34);
      add(sec, ['bs', m, 0, r, 1.5, 1], ['bs', m, 3, r + 12, .5, .75], ['bs', m, 6, r, 1, .8]);
      if(repond) [[8, r + 12, .5, .8], [9, r + 10, .5, .6], [10, r + 7, .5, .7], [11, r + 12, .5, .85], [12, r + 7, .5, .6], [13, r + 12, .5, .8]].forEach(([p, n, d, v]) => add(sec, ['bs', m, p, n, d, v]));
      else add(sec, ['bs', m, 8, r, 1, .85], ['bs', m, 11, r + 12, .5, .7]);
      const nx = M.ton(cn, 0, 34); add(sec, ['bs', m, 14, nx === r ? r + 10 : nx > r ? nx - 1 : nx + 1, 1, .75]);
    };
    let vGt = null, vSc = null;
    const guitare = (sec, m, c, motif) => { vGt = M.voix(vGt, c, [1, 2, 3], 62, 74);
      [...motif].forEach((ch, p) => { if(ch === 'x') vGt.forEach((n, k) => add(sec, ['gt', m, p + k*.03, n, .5, .55])); if(ch === 'g') add(sec, ['gt', m, p, vGt[1], .2, .2]); }); };
    const stabs = (sec, m, c, pas) => { vSc = M.voix(vSc, c, [1, 2, 3], 62, 76); pas.forEach(([p, d]) => vSc.forEach(n => add(sec, ['sc', m, p, n, d, .7]))); };
    // le scratch : une marque silencieuse dans la partition (le son, c'est le disque du jeu)
    const scratch = (sec, m, p, d, lv) => add(sec, ['scr', m, p, 60, d, .5, 'S' + lv]);

    // ─── refrain (inventé) : [mesure, pas, midi, durée, niveau] en si bémol ───
    const HOOK = [
      [0, 0, 70, 2, 1], [0, 2, 74, 1, 3], [0, 4, 75, 2, 2], [0, 8, 79, 3, 1], [0, 12, 74, 2, 2],
      [1, 0, 72, 2, 1], [1, 3, 77, 1, 3], [1, 4, 81, 2, 2], [1, 8, 77, 4, 1],
      [2, 0, 74, 2, 1], [2, 2, 77, 1, 3], [2, 4, 81, 2, 2], [2, 8, 77, 3, 1], [2, 12, 74, 2, 2],
      [3, 0, 79, 3, 1], [3, 4, 74, 2, 2], [3, 6, 77, 2, 3], [3, 8, 70, 6, 1],
      [4, 0, 70, 2, 1], [4, 2, 74, 1, 3], [4, 4, 75, 2, 2], [4, 8, 82, 3, 1], [4, 12, 79, 2, 2],
      [5, 0, 81, 2, 1], [5, 4, 84, 2, 2], [5, 8, 81, 4, 1],
      [6, 0, 82, 2, 1], [6, 2, 79, 1, 3], [6, 4, 75, 2, 2], [6, 8, 72, 3, 1], [6, 12, 75, 2, 2],
      [7, 0, 77, 2, 1], [7, 4, 81, 2, 2], [7, 8, 75, 2, 1], [7, 12, 72, 2, 2],
    ];
    // ─── riffs du couplet : le synthé appelle (notes de l'accord), la basse répond la mesure suivante ───
    const RIFFS = [[[0, 1, 1, 'C1'], [2, 2, 1, 'C3'], [3, 1, .8, 'C3'], [4, 3, 2, 'C2']], [[0, 2, 1.5, 'C1'], [3, 3, .8, 'C3'], [4, 4, 2, 'C2']]];

    // DÉCOMPTE : le charley compte
    [0, 4, 8, 12].forEach((p, k) => add('decompte', ['hho', 0, p, 0, 2, k ? .6 : .8]));

    // INTRO : batterie et guitare, la basse entre, deux coups de cuivres synthé
    H.intro.forEach((c, m) => { batterie('intro', m, [m % 2 ? 'J1' : 'J2', 'J2'], {fill: m === 3}); guitare('intro', m, c, 'g.x.gxg.g.x.gxgx'); if(m >= 2) basse('intro', m, c, H.intro[(m + 1) % 4], m === 3); });
    stabs('intro', 3, H.intro[3], [[10, .6], [12, 2]]);

    const couplet = (sec, k) => { const harm = COUPLET.map(n => A(n, k)); H[sec] = harm;
      harm.forEach((c, m) => { const cn = harm[(m + 1) % 8]; batterie(sec, m, ['J1', 'J2'], {fill: m === 7, ouvert: m % 2});
        if(m % 2 === 0){ basse(sec, m, c, cn, false); RIFFS[(m >> 1) % 2].forEach(([p, i, d, tag]) => add(sec, ['ld', m, p, M.ton(c, i, 65), d, .9, tag])); guitare(sec, m, c, '........g.x.gxgx'); }
        else { basse(sec, m, c, cn, true); guitare(sec, m, c, 'g.x.gxg.........'); }
        add(sec, ['clap', m, 4, 0, 1, .6], ['clap', m, 12, 0, 1, .6]);
      }); };
    // SCRATCH ! : la musique tient le groove (batterie, basse, guitare), le synthé se tait, le disque est à toi
    H.apprend.forEach((c, m) => { batterie('apprend', m, [null, 'J2']); basse('apprend', m, c, H.apprend[(m + 1) % 4], false); guitare('apprend', m, c, 'g.x.gxg.........');
      scratch('apprend', m, 8, 6, 1); });
    const refrain = (sec, k, octave) => { const harm = REFRAIN.map(n => A(n, k)); H[sec] = harm;
      harm.forEach((c, m) => { const cn = harm[(m + 1) % 8]; batterie(sec, m, ['J1', 'J1'], {dense: true, fill: m === 7, ouvert: m % 2});
        basse(sec, m, c, cn, m === 3 || m === 7); guitare(sec, m, c, '..x...x...x...x.');
        if(m === 1 || m === 5) scratch(sec, m, 12, 4, 1); else if(m === 3) scratch(sec, m, 14, 2, 2);
        if(m % 2 === 0) stabs(sec, m, c, [[14, 1.5]]);
        add(sec, ['clap', m, 4, 0, 1, .7], ['clap', m, 12, 0, 1, .7]);
        M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ss', m, 0, n, 16, .5]));
      });
      HOOK.forEach(([m, p, n, d, lv]) => { add(sec, ['ld', m, p, n + k, d, lv === 1 ? 1 : .86, 'C' + lv]); if(octave) add(sec, ['ld8', m, p, n + k + 12, d, .55]); });
      add(sec, ['cr', 0, 0, 0, 16, .7], ['cr', 4, 0, 0, 16, .55]);
    };

    couplet('A', 0);
    refrain('B', 0, false);

    // PAUSE : la guitare et la basse seules, le synthé lâche une note par mesure
    H.pause.forEach((c, m) => { guitare('pause', m, c, 'x.......x.......'); add('pause', ['bs', m, 0, M.ton(c, 0, 34), 6, .8], ['ld', m, 0, M.ton(c, 1, 65), 4, .8, 'C1']);
      M.charley(add, 'pause', m, 'hh', {pas: 2, vol: .7}); if(m === 3) batterie('pause', m, [null, null], {fill: true}); });

    refrain('final', 1, true);

    // FIN (en si, comme le final) : dernier coup Bb6/9 + 1 = B6/9
    H.fin = [A('B:69'), A('B:69')];
    add('fin', ['kick', 0, 0, 36, 2, 1], ['cs', 0, 4, 0, 2, 1, 'J1'], ['cr', 0, 0, 0, 16, .8], ['bs', 0, 0, 35, 4, 1], ['ld', 0, 8, 75, 2, .9, 'C2'], ['ld', 0, 10, 78, 2, .9, 'C2'], ['ld', 0, 12, 80, 4, 1, 'C1']);
    stabs('fin', 0, H.fin[0], [[0, 2]]); stabs('fin', 1, H.fin[1], [[0, 6]]);
    add('fin', ['kick', 1, 0, 36, 2, 1], ['bs', 1, 0, 35, 6, 1], ['cr', 1, 0, 0, 16, 1], ['ld', 1, 0, 83, 6, 1, 'C1']);

    return {
      bpm: 116, sig: [4, 4], swing: .54, humain: 5, graine: 17, pistes: true,
      salle: {taille: .45, amorti: .55, niveau: .45, predelai: .01},
      instruments: {
        kick: {type: 'kick', vol: .55, groupe: 'base'}, cs: {type: 'caisse', vol: .32, retard: 5, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: .14, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .14, groupe: 'base'},
        tom: {type: 'tom', vol: .26, groupe: 'base'}, cr: {type: 'crash', vol: .07, groupe: 'base'},
        bs: {type: 'basse', vol: .44, brillance: 1.6, wah: .05, q: 2, drive: 2, groupe: 'base'},
        gt: {type: 'guitare', vol: .15, pan: -.35, etouffe: .8, groupe: 'base'},
        ld: {type: 'synth_lead', vol: .24, joueur: true, groupe: 'base'},
        sc: {type: 'synth_cuivres', vol: .14, pan: .3, groupe: 'base'},
        scr: {type: 'rim', vol: .001, joueur: true, groupe: 'base'},
        clap: {type: 'clap', vol: .16, groupe: 'transe'},
        ss: {type: 'supersaw', vol: .07, groupe: 'transe'},
        ld8: {type: 'synth_lead', vol: .1, pan: .3, groupe: 'transe'},
      },
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A}, apprend: {mesures: 4, notes: N.apprend},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: 8, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'apprend', 'B', 'pause', 'A', 'B', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0, 'CJ'], A: ['Couplet', 1, 'CJ'], apprend: ['Scratch !', 0, 'SJ'], B: ['Refrain', 2, 'CJS'], pause: ['Pause', 'rest', 'C'], final: ['Final', 3, 'CJS'], fin: ['Fin', 'rest', 'CJ']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: M.gamme('Bb', 'ionien'), gammes: {final: M.gamme('B', 'ionien'), fin: M.gamme('B', 'ionien')},
    };
  };
})();
