/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Trottoir 90 » (niveau 4, face D) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Trottoir 90
   Rôle :               niveau 4 : on apprend les DEUX DOIGTS ; couper = le piano puis la trompette, taper = la caisse claire
   Émotion et énergie : la tête qui hoche, cool et un peu mélancolique, 5/10 → 8/10
   Style de référence : hip-hop boom bap jazzy des années 90 (couleurs : boucles de jazz échantillonnées, Rhodes,
                        trompette en sourdine, contrebasse ronde) ; c'est le groove qui compte, pas la vitesse
   Tempo / métrique :   88 BPM, 4/4, swing marqué des doubles croches (62 %), caisse claire en arrière du temps
   Tonalité / mode :    do mineur (dorien au couplet)
   Harmonie :           couplet Cm9 · Abmaj7 (boucle) puis Fm9 · G7sus4 · G7 ; refrain Abmaj7 · Bb6/9 · Gm7 · Cm9 ·
                        Abmaj7 · Bb6/9 · Fm9 · G7
   Instruments :        piano échantillonné (le joueur au couplet), trompette en sourdine (le joueur au refrain), caisse
                        claire lourde (le joueur), kick sourd, charley swingué, Rhodes, basse ronde ; transe :
                        vibraphone, deuxième trompette, chœur « ou », shaker
   Interdits :          trap (charley en rafales, 808 qui glisse), synthés brillants
   Signature :          la trompette en sourdine qui chante par-dessus la boucle, et le piano qui « hache » ses accords
                        à contretemps comme un échantillon
   Contrainte de jeu :  section « À deux doigts ! » (4 mesures, les coups de caisse claire se jouent à deux doigts) ;
                        décompte au rim ; fin : la boucle s'arrête net sur un dernier accord de Rhodes
   Forme :              décompte · intro 4 · couplet 8 · À deux doigts ! 4 · refrain 8 · pause 4 · couplet 8 · refrain 8 ·
                        final 8 · fin 2
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.trottoir = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const COUPLET = ['C:m9', 'Ab:maj7', 'C:m9', 'Ab:maj7', 'F:m9', 'F:m9', 'G:7sus4', 'G:7'];
    const REFRAIN = ['Ab:maj7', 'Bb:69', 'G:m7', 'C:m9', 'Ab:maj7', 'Bb:69', 'F:m9', 'G:7'];
    const H = {decompte: [A('C:m9')], intro: ['C:m9', 'Ab:maj7', 'C:m9', 'G:7'].map(n => A(n)), apprend: ['C:m9', 'C:m9', 'F:m9', 'G:7'].map(n => A(n)),
      pause: ['F:m9', 'F:m9', 'Ab:maj7', 'G:7sus4'].map(n => A(n)), fin: [A('C:m9'), A('C:m9')]};

    // ─── le beat : kick sourd, caisse claire lourde (au joueur), charley en croches swinguées ───
    const beat = (sec, m, tags, o) => { o = o || {};
      if(!o.sansKick) [...(o.var ? 'x......x..x..x..' : 'x......x..x.....')].forEach((c, p) => { if(c === 'x') add(sec, ['kick', m, p, 36, 2, p ? .85 : 1]); });
      add(sec, ['cs', m, 4, 0, 2, 1, tags[0]], ['cs', m, 12, 0, 2, 1, tags[1]]); if(o.var) add(sec, ['cs', m, 15, 0, 1, .2]);
      for(let p = 0; p < 16; p += 2) add(sec, [o.ouvert && p === 14 ? 'hho' : 'hh', m, p, 0, 1, p % 4 ? .4 : .6]);
    };
    const basse = (sec, m, c, cn) => { const r = M.ton(c, 0, 36), nx = M.ton(cn, 0, 36);
      add(sec, ['bs', m, 0, r, 5, 1], ['bs', m, 7, r, 1.5, .7], ['bs', m, 10, M.ton(c, 2, 36), 2, .8], ['bs', m, 14, nx === r ? r + 7 : nx, 2, .75, nx === r ? undefined : '!']); };
    let vRh = null, vPn = null;
    const rhodes = (sec, m, c, vol) => { vRh = M.voix(vRh, c, [1, 2, 3, c.iv.length > 4 ? 4 : 0], 55, 70); vRh.forEach((n, k) => add(sec, ['rh', m, k*.06, n, 7, .55*(vol || 1)])); };
    // le piano « échantillonné » : accords hachés à contretemps, la note du haut au joueur
    const chop = (sec, m, c, pas) => { vPn = M.voix(vPn, c, [1, 2, 3], 62, 76); pas.forEach(([p, tag]) => vPn.forEach((n, k) => add(sec, ['pn', m, p, n, 1.2, .8, k === vPn.length - 1 ? tag : undefined]))); };

    // ─── la trompette en sourdine (inventée) : [mesure, pas, midi, durée, niveau] ───
    const HOOK = [
      [0, 0, 72, 3, 1], [0, 4, 75, 1.5, 3], [0, 6, 79, 2, 2], [0, 10, 75, 1, 3], [0, 12, 72, 3, 2],
      [1, 0, 74, 2, 1], [1, 3, 77, 1, 3], [1, 4, 79, 3, 2], [1, 8, 74, 4, 1],
      [2, 0, 70, 2, 1], [2, 2, 74, 2, 3], [2, 6, 77, 2, 2], [2, 8, 79, 3, 1], [2, 12, 74, 2, 2],
      [3, 0, 75, 3, 1], [3, 4, 74, 2, 2], [3, 6, 70, 2, 3], [3, 8, 72, 6, 1],
      [4, 0, 79, 2, 1], [4, 2, 75, 1, 3], [4, 4, 72, 2, 2], [4, 8, 80, 3, 1], [4, 12, 79, 2, 2],
      [5, 0, 77, 2, 1], [5, 4, 82, 2, 2], [5, 8, 79, 4, 1],
      [6, 0, 80, 2, 1], [6, 2, 79, 1, 3], [6, 4, 77, 2, 2], [6, 8, 75, 3, 1], [6, 12, 72, 2, 2],
      [7, 0, 71, 2, 1], [7, 4, 74, 2, 2], [7, 8, 77, 3, 1], [7, 12, 79, 2, 2],
    ];

    // DÉCOMPTE : rim, comme des baguettes qui comptent
    [0, 4, 8, 12].forEach((p, k) => add('decompte', ['rim', 0, p, 0, 1, k ? .7 : .9]));

    // INTRO : la boucle de Rhodes seule (comme un disque qu'on pose), puis le beat tombe
    H.intro.forEach((c, m) => { rhodes('intro', m, c, 1.1); if(m >= 2){ beat('intro', m, ['J1', 'J1']); basse('intro', m, c, H.intro[(m + 1) % 4]); } else add('intro', ['cs', m, 12, 0, 2, .9, 'J2']); });

    // COUPLET : la boucle (Rhodes + basse + beat) ; le piano haché répond deux fois par mesure
    const couplet = (sec) => { const harm = COUPLET.map(n => A(n)); H[sec] = harm;
      harm.forEach((c, m) => { beat(sec, m, ['J1', 'J2'], {var: m % 4 === 3, ouvert: m % 2}); basse(sec, m, c, harm[(m + 1) % 8]); rhodes(sec, m, c, .85);
        chop(sec, m, c, m % 2 ? [[6, 'C2'], [11, 'C1']] : [[3, 'C3'], [6, 'C1']]);
        [0, 1, 2, 4, 2, 1].forEach((i, q) => { if(m % 2 === 1) add(sec, ['vib', m, 4 + q*2, M.ton(c, i, 72), 2, .45]); });
        for(let p = 0; p < 16; p += 2) add(sec, ['shk', m, p, 0, 1, .4]);
      }); };
    // À DEUX DOIGTS ! : le beat seul avec la basse ; chaque coup de caisse claire se joue à deux doigts
    H.apprend.forEach((c, m) => { beat('apprend', m, ['J1', 'J1']); basse('apprend', m, c, H.apprend[(m + 1) % 4]); rhodes('apprend', m, c, .6); chop('apprend', m, c, [[8, 'C2']]); });
    // REFRAIN : la trompette chante, le Rhodes tient, le piano se tait (il a parlé au couplet)
    const refrain = (sec, fort) => { const harm = REFRAIN.map(n => A(n)); H[sec] = harm;
      harm.forEach((c, m) => { beat(sec, m, ['J1', 'J1'], {var: m % 4 === 3, ouvert: m % 2}); basse(sec, m, c, harm[(m + 1) % 8]); rhodes(sec, m, c, .7);
        M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ch', m, 0, n, 16, .45]));
        for(let p = 0; p < 16; p += 2) add(sec, ['shk', m, p, 0, 1, .45]);
      });
      HOOK.forEach(([m, p, n, d, lv]) => { add(sec, ['tp', m, p, n, d, lv === 1 ? 1 : .86, 'C' + lv]);
        if(fort){ const c = harm[m]; let b = n - 3; for(let i = 3; i <= 9; i++) if(c.pcs.includes(((n - i) % 12 + 12) % 12)){ b = n - i; break; } add(sec, ['tp2', m, p, b, d, .7]); } });
    };

    couplet('A');
    refrain('B', false);

    // PAUSE : le beat s'arrête, il ne reste que le Rhodes et le vibraphone ; la caisse claire revient à la fin
    H.pause.forEach((c, m) => { rhodes('pause', m, c, 1); [0, 1, 2, 4, 2, 1, 0, 1].forEach((i, q) => add('pause', ['vib', m, q*2, M.ton(c, i, 67), 2, .5]));
      add('pause', ['tp', m, 0, M.ton(c, 2, 70), 4, .85, 'C1']); for(let p = 0; p < 16; p += 4) add('pause', ['hh', m, p, 0, 1, .3]);
      if(m === 3) add('pause', ['cs', m, 12, 0, 2, 1], ['kick', m, 10, 36, 2, .9]); });

    refrain('final', true);

    // FIN : la boucle s'arrête net ; un dernier accord de Rhodes et la trompette
    add('fin', ['kick', 0, 0, 36, 2, 1], ['cs', 0, 4, 0, 2, 1, 'J1'], ['bs', 0, 0, 36, 6, 1], ['tp', 0, 8, 75, 2, .9, 'C2'], ['tp', 0, 10, 74, 2, .9, 'C2'], ['tp', 0, 12, 72, 4, 1, 'C1']);
    rhodes('fin', 0, H.fin[0], 1); rhodes('fin', 1, H.fin[1], 1.1); add('fin', ['bs', 1, 0, 36, 8, .9], ['tp', 1, 0, 79, 6, .9, 'C1']);

    return {
      bpm: 88, sig: [4, 4], swing: .62, humain: 7, graine: 53, pistes: true,
      salle: {taille: .42, amorti: .6, niveau: .4, predelai: .01},
      instruments: {
        kick: {type: 'kick', vol: .62, f0: 110, f1: 44, tenue: .9, groupe: 'base'},
        cs: {type: 'caisse', vol: .38, retard: 14, joueur: true, groupe: 'base'},
        rim: {type: 'rim', vol: .4, humain: false, groupe: 'base'},
        hh: {type: 'charley', vol: .14, retard: 4, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .12, groupe: 'base'},
        bs: {type: 'basse', vol: .46, brillance: .35, sub: 1, wah: .3, drive: 1.3, groupe: 'base'},
        rh: {type: 'rhodes', vol: .22, pan: -.15, verb: .2, humain: false, groupe: 'base'},
        pn: {type: 'piano', vol: .22, pan: .2, joueur: true, groupe: 'base'},
        tp: {type: 'trompettes', vol: .24, clarte: .5, desaccord: 3, joueur: true, groupe: 'base'},
        vib: {type: 'glockenspiel', modes: [[1, 1, 1.4], [4, .25, .35], [10, .05, .1]], vol: .09, pan: .35, groupe: 'transe'},
        tp2: {type: 'trompettes', vol: .13, clarte: .5, pan: -.3, groupe: 'transe'},
        ch: {type: 'choeur', voyelle: 'ou', vol: .05, groupe: 'transe'},
        shk: {type: 'shaker', vol: .06, pan: .35, groupe: 'transe'},
      },
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A}, apprend: {mesures: 4, notes: N.apprend},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: 8, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'apprend', 'B', 'pause', 'A', 'B', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0, 'CJ'], A: ['Couplet', 1, 'CJ'], apprend: ['À deux doigts !', 0, 'CD'], B: ['Refrain', 2, 'CJD'], pause: ['Pause', 'rest', 'C'], final: ['Final', 3, 'CJD'], fin: ['Fin', 'rest', 'CJ']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: M.gamme('C', 'dorien'),
    };
  };
})();
