/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Coup de cuivres » (labo) — partition Pupitre, v2

   IDENTITÉ MUSICALE — Beat Splash / Coup de cuivres
   Rôle :               morceau du labo ; couper = les cuivres, taper = la caisse claire
   Émotion et énergie : solaire, sûr de lui, 6/10 → 9/10 ; on respire au break, on explose au final
   Style de référence : funk de section de cuivres fin 70 (couleurs : Tower of Power, The JB's) ; pas d'électro
   Tempo / métrique :   106 BPM, 4/4, swing des doubles croches 56 %
   Tonalité / mode :    mi dorien ; le final monte d'un ton (fa# dorien)
   Harmonie :           couplet Em9 · A13 · Cmaj7 · B7 ; refrain Cmaj9 · D6/9 · Bm7 · Em9, relance B7 (le B7#9 n'arrive
                        qu'à la toute fin du refrain et au break : la dissonance « funk » est assumée là, pas ailleurs)
   Instruments :        batterie acoustique (fantômes), basse aux doigts avec wah, guitare cocotte, Rhodes, trompettes
                        (le joueur), trombones en harmonie, stabs de section ; transe : shaker, congas accordées, claps,
                        cordes, trompette à l'octave
   Interdits :          supersaw, kick électro, nappe de synthé, 808
   Signature :          la conversation : la basse parle, les cuivres répondent « pa-PAH », le Rhodes répond à son tour
   Contrainte de jeu :  charley en doubles croches tout le long, décompte au rim, fin nette sur un coup de section
   Forme :              décompte · intro 4 · couplet 8 · refrain 8 · break 4 · couplet 8 · refrain 8 · final 8 · fin 2

   Le dosage : chaque mesure a UN instrument qui parle à la fois. Basse sur la 1re moitié, réponse (cuivres ou Rhodes)
   sur la 2e. Au refrain, le hook parle : Rhodes tenu, guitare sur les contretemps seulement, la basse simplifie et
   remplit les trous du hook.
   Beatmap : notes étiquetées « geste + niveau » (C = couper, J = taper ; 1 Apprenti … 4 Roi). Les instruments
   « joueur » (trompettes, stabs, caisse claire) ne jouent ces notes que si le joueur les réussit.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.lab_funk = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const COUPLET = ['E:m9', 'E:m9', 'A:13', 'A:13', 'E:m9', 'E:m9', 'C:maj7', 'B:7'];
    const REFRAIN = ['C:maj9', 'D:69', 'B:m7', 'E:m9', 'C:maj9', 'D:69', 'B:7', 'B:7s9'];
    const H = {decompte: [A('E:m9')], intro: Array(4).fill(A('E:m9')), pause: [A('E:m9'), A('E:m9'), A('E:m9'), A('B:7s9')], fin: [A('E:9'), A('E:7s9')]};

    // ─── batterie ───
    const kick = (sec, m, k) => [...(k === 'b' ? 'x..x..x.x..x..x.' : 'x.....x.x..x....')].forEach((c, p) => { if(c === 'x') add(sec, ['kick', m, p, 36, 2, p === 0 ? 1 : .78]); });
    const caisse = (sec, m, tags, fill) => {
      add(sec, ['caisse', m, 4, 0, 2, .95, tags[0]], ['caisse', m, 12, 0, 2, .95, tags[1]]);
      [7, 9, 15].forEach(p => add(sec, ['caisse', m, p, 0, 1, .16]));
      if(fill) [[13, .45], [14, .62], [15, .8]].forEach(([p, v]) => add(sec, ['caisse', m, p, 0, 1, v]));
    };
    const toms = (sec, m) => [[8, 64], [10, 60], [12, 55], [13, 52], [14, 48], [15, 45]].forEach(([p, n], i) => add(sec, ['tom', m, p, n, 2, .55 + i*.07]));

    // ─── basse ───
    const fond = c => M.ton(c, 0, 38);
    const basseParle = (sec, m, c, cn) => {           // 1re moitié : elle parle (le « un », octave, septième, quinte)
      const r = fond(c), s7 = r + (c.iv[3] || 10);
      [[0, r, 2, 1], [3, r + 12, .5, .6], [4, s7, 1, .75], [6, r + 7, 1, .62], [7, r + 12, .4, .3], [8, r, 1, .9]].forEach(([p, n, d, v]) => add(sec, ['basse', m, p, n, d, v]));
      const nx = fond(cn); add(sec, ['basse', m, 14, nx === r ? r - 2 : nx > r ? nx - 1 : nx + 1, 1.2, .7]);   // approche de l'accord suivant
    };
    const basseSimple = (sec, m, c, cn, remplit) => {   // refrain : elle tient la maison, et remplit les trous du hook
      const r = fond(c); add(sec, ['basse', m, 0, r, 3, 1], ['basse', m, 6, r + 12, .6, .6], ['basse', m, 8, r + 7, 1.5, .8]);
      if(remplit) [[11, r + 10, .5, .55], [12, r + 12, .5, .7], [13, r + 10, .5, .5]].forEach(([p, n, d, v]) => add(sec, ['basse', m, p, n, d, v]));
      const nx = fond(cn); add(sec, ['basse', m, 14, nx === r ? r - 2 : nx > r ? nx - 1 : nx + 1, 1.2, .72]);
    };

    // ─── harmonie conduite ───
    let vRh = null, vGt = null, vSt = null;
    const rhTenu = (sec, m, c, v) => { vRh = M.voix(vRh, c, [1, 2, 3, c.iv.length > 4 ? 4 : 0], 55, 71); vRh.forEach((n, k) => add(sec, ['rh', m, k*.05, n, 8, v || .42])); };
    const rhRepond = (sec, m, c) => {                   // le Rhodes répond : deux accords piqués sur la fin de mesure
      vRh = M.voix(vRh, c, [1, 2, 3], 55, 71);
      [[10, .6, .7], [12, .7, 2]].forEach(([p, v, d]) => vRh.forEach((n, k) => add(sec, ['rh', m, p + k*.05, n, d, v])));
    };
    const cocotte = (sec, m, c, motif) => {
      vGt = M.voix(vGt, c, [1, 2, 3], 64, 76);
      [...motif].forEach((ch, p) => { if(ch === 'x') vGt.forEach((n, k) => add(sec, ['gt', m, p + k*.03, n, .5, .55])); if(ch === 'g') add(sec, ['gt', m, p, vGt[1], .2, .18]); });
    };
    const stab = (sec, m, p, c, d, v, tag) => {          // accord de section ; la note du haut est au joueur
      vSt = M.voix(vSt, c, [1, 2, 3], 62, 76);
      vSt.forEach((n, k) => add(sec, ['stab', m, p, n, d, v, k === vSt.length - 1 ? tag : undefined]));
    };

    // ─── le hook du refrain (inventé) : question sur 2 mesures, réponse qui monte au mi aigu ───
    // [mesure, pas, midi, durée, niveau] ; trombones en harmonie (la note de l'accord juste en dessous)
    const HOOK = [
      [0, 0, 67, 1.5, 1], [0, 3, 69, .9, 3], [0, 6, 71, 2, 2], [0, 10, 74, 1, 3], [0, 12, 71, 3, 2],
      [1, 2, 69, 1, 3], [1, 4, 66, 1, 2], [1, 6, 69, 1, 3], [1, 8, 71, 4, 1],
      [2, 0, 74, 1.5, 1], [2, 3, 73, .9, 3], [2, 6, 71, 2, 2], [2, 10, 69, 1, 3], [2, 12, 66, 3, 2],
      [3, 2, 67, 1, 3], [3, 4, 69, .9, 2], [3, 6, 71, 1, 3], [3, 8, 76, 5, 1],
    ];
    const HOOK2 = HOOK.slice(0, 9).concat([
      [2, 0, 75, 1.5, 1], [2, 3, 76, .9, 3], [2, 6, 78, 2, 2], [2, 10, 76, .9, 3], [2, 12, 75, 3, 2],
      [3, 0, 75, .75, 1], [3, 3, 75, .75, 3], [3, 6, 78, 3, 2],
    ]);
    const hook = (sec, m0, Hk, k, harm, octave) => Hk.forEach(([m, p, n, d, lv]) => {
      const c = harm[m0 + m], nn = n + k, pcs = c.pcs; let b = nn - 3; for(let i = 3; i <= 9; i++){ if(pcs.includes(((nn - i) % 12 + 12) % 12)){ b = nn - i; break; } }
      add(sec, ['tp', m0 + m, p, nn, d, lv === 1 ? 1 : .86, 'C' + lv], ['tb', m0 + m, p, b, d, .7]);
      if(octave) add(sec, ['tp8', m0 + m, p, nn + 12, d, .62]);
    });

    // ─── la transe (s'ajoute avec le combo) ───
    const transe = (sec, m, c, cordes) => {
      for(let p = 0; p < 16; p++) add(sec, ['shk', m, p, 0, 1, p % 2 ? .32 : .58]);
      const r = M.ton(c, 0, 55), q = M.ton(c, 2, 55);
      [[2, r + 12, .55], [3, r + 12, .38], [6, q, .66], [10, r + 12, .55], [11, q + 12 > 76 ? q : q + 12, .42], [14, q, .66]].forEach(([p, n, v]) => add(sec, ['conga', m, p, n, 1, v]));
      add(sec, ['clap', m, 4, 0, 1, .55], ['clap', m, 12, 0, 1, .55]);
      if(cordes) M.voix(null, c, [1, 2, 3], 72, 86).forEach(n => add(sec, ['vn', m, 0, n, 16, .5]));
    };

    // DÉCOMPTE : 4 coups de rim
    [0, 4, 8, 12].forEach((p, k) => add('decompte', ['rim', 0, p, 0, 1, k === 0 ? 1 : .75]));

    // INTRO : la batterie et la cocotte posent le groove, la basse entre, les cuivres annoncent
    for(let m = 0; m < 4; m++){
      const c = H.intro[m]; kick('intro', m, 'a'); caisse('intro', m, [m % 2 ? 'J1' : 'J2', 'J2'], m === 3); M.charley(add, 'intro', m, 'hh', {ouvert: m % 2 ? 14 : 0});
      cocotte('intro', m, c, 'g.x.g.x.g.x.g.x.');
      if(m >= 2) basseParle('intro', m, c, c);
    }
    stab('intro', 3, 10, H.intro[3], .6, .78, 'C2'); stab('intro', 3, 12, H.intro[3], 2, 1, 'C1');

    // COUPLET : la basse parle, puis une réponse — cuivres les mesures impaires, Rhodes les paires
    const couplet = (sec, k) => { const harm = COUPLET.map(n => A(n, k)); H[sec] = harm;
      harm.forEach((c, m) => {
        const cn = harm[(m + 1) % 8];
        kick(sec, m, 'a'); caisse(sec, m, ['J1', 'J2'], m === 7); M.charley(add, sec, m, 'hh', {ouvert: m % 2 ? 14 : 0}); if(m === 7) toms(sec, m);
        basseParle(sec, m, c, cn);
        if(m === 7){ stab(sec, m, 0, c, 1.2, 1, 'C1'); stab(sec, m, 3, c, .6, .8, 'C3'); stab(sec, m, 6, c, 1.5, .95, 'C2'); }
        else if(m % 2){ stab(sec, m, 10, c, .6, .78, 'C2'); stab(sec, m, 12, c, 2, 1, 'C1'); cocotte(sec, m, c, 'g.x.g.x.........'); }
        else { rhRepond(sec, m, c); cocotte(sec, m, c, 'g.x.g.x.g.......'); }
        transe(sec, m, c, false);
      }); };
    couplet('A', 0);

    // REFRAIN : le hook parle ; Rhodes tenu, guitare sur les contretemps, la basse remplit les trous du hook
    const refrain = (sec, k, octave) => { const harm = REFRAIN.map(n => A(n, k)); H[sec] = harm;
      harm.forEach((c, m) => {
        const cn = harm[(m + 1) % 8];
        kick(sec, m, 'b'); caisse(sec, m, ['J1', 'J1'], m === 7); M.charley(add, sec, m, 'hh', {ouvert: m % 2 ? 14 : 0}); if(m === 7) toms(sec, m);
        basseSimple(sec, m, c, cn, m % 2 === 1); rhTenu(sec, m, c); cocotte(sec, m, c, '..x...x...x...x.');
        transe(sec, m, c, true);
      });
      add(sec, ['crash', 0, 0, 0, 16, .8], ['crash', 4, 0, 0, 16, .65]);
      hook(sec, 0, HOOK, k, harm, octave); hook(sec, 4, HOOK2, k, harm, octave);
    };
    refrain('B', 0, false);

    // BREAK : toute la section frappe ensemble (sur 1 et le « et » de 2), le charley en croches marque le temps
    for(let m = 0; m < 4; m++){
      const c = H.pause[m], hits = m === 3 ? [0, 3, 6, 10, 12, 14] : [0, 6];
      for(let p = 0; p < 16; p += 2) add('pause', ['hh', m, p, 0, 1, p % 4 === 0 ? .6 : .35]);
      add('pause', ['rim', m, 4, 0, 1, .55], ['rim', m, 12, 0, 1, .55]);
      hits.forEach((p, i) => { add('pause', ['kick', m, p, 36, 2, 1], ['basse', m, p, fond(c), p === 0 ? 3 : 1.5, 1]); stab('pause', m, p, c, p === 0 ? 2.5 : 1.2, 1, p === 0 ? 'C1' : 'C' + (2 + i % 2)); });
      if(m < 3) rhRepond('pause', m, c);
      if(m === 3) [[12, .5], [13, .6], [14, .75], [15, .9]].forEach(([p, v]) => add('pause', ['caisse', m, p, 0, 1, v]));
    }
    add('pause', ['crash', 0, 0, 0, 16, .55]);

    // FINAL : le refrain un ton plus haut, trompette à l'octave dans la couche transe
    refrain('final', 2, true);

    // FIN : coup de section en mi 9, roulement, puis le dernier coup (7#9 assumé : c'est la signature funk)
    add('fin', ['kick', 0, 0, 36, 2, 1], ['crash', 0, 0, 0, 16, 1], ['basse', 0, 0, 40, 6, 1]); stab('fin', 0, 0, H.fin[0], 6, 1, 'C1');
    for(let p = 8; p < 16; p++) add('fin', ['caisse', 0, p, 0, 1, .35 + (p - 8)*.08]); toms('fin', 0);
    add('fin', ['kick', 1, 0, 36, 2, 1], ['crash', 1, 0, 0, 16, 1], ['basse', 1, 0, 40, 2, 1], ['caisse', 1, 0, 0, 2, 1, 'J1']); stab('fin', 1, 0, H.fin[1], 2, 1, 'C1');
    [76, 71, 64].forEach(n => add('fin', ['tb', 1, 0, n - 12, 2, .9]));

    return {
      bpm: 106, sig: [4, 4], swing: .56, humain: 5, graine: 11, pistes: true,
      salle: {taille: .45, amorti: .55, niveau: .5, predelai: .012},
      instruments: {
        kick: {type: 'kick', vol: .5, groupe: 'base'},
        caisse: {type: 'caisse', vol: .3, retard: 8, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: .1, pan: .2, choke: 'hh', groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .09, pan: .2, choke: 'hh', groupe: 'base'},
        rim: {type: 'rim', vol: .37, humain: false, groupe: 'base'},
        tom: {type: 'tom', vol: .25, groupe: 'base'}, crash: {type: 'crash', vol: .09, groupe: 'base'},
        basse: {type: 'basse', vol: .41, wah: .6, drive: .25, groupe: 'base'},
        gt: {type: 'guitare', vol: .16, pan: -.35, etouffe: .8, groupe: 'base'},
        rh: {type: 'rhodes', vol: .2, pan: .25, verb: .2, humain: false, groupe: 'base'},
        stab: {type: 'cuivres_stab', vol: .23, etale: .3, joueur: true, groupe: 'base'},
        tp: {type: 'trompettes', vol: .27, pan: .12, joueur: true, groupe: 'base'},
        tb: {type: 'trombones', vol: .18, pan: -.18, groupe: 'base'},
        tp8: {type: 'trompettes', vol: .12, pan: .3, groupe: 'transe'},
        shk: {type: 'shaker', vol: .065, pan: .45, groupe: 'transe'},
        conga: {type: 'tom', vol: .12, pan: -.4, groupe: 'transe'},
        clap: {type: 'clap', vol: .13, groupe: 'transe'},
        vn: {type: 'violons', vol: .07, pan: -.2, groupe: 'transe'},
      },
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: 8, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'B', 'pause', 'A', 'B', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0], A: ['Couplet', 1], B: ['Refrain', 2], pause: ['Pause', 'rest'], final: ['Final', 3], fin: ['Fin', 'rest']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: M.gamme('E', 'dorien'), gammes: {final: M.gamme('F#', 'dorien')},
    };
  };
})();
