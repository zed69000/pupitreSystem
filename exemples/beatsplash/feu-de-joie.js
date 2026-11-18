/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Feu de joie » (labo, salsa) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Feu de joie
   Rôle :               morceau du labo ; couper = les trompettes, taper = la clave (le cœur de la salsa)
   Émotion et énergie : fête de rue, chaleur, 7/10 → 10/10 ; un descarga au milieu (percussions seules)
   Style de référence : salsa dura new-yorkaise des années 70 (couleurs : orchestres de la Fania, sections de
                        trombones) ; tout acoustique
   Tempo / métrique :   100 BPM écrit en doubles croches = 200 ressenti en salsa (une mesure du jeu = un cycle de
                        clave 3-2) ; droit, la syncope vient de la clave et du tumbao
   Tonalité / mode :    sol mineur (harmonique pour le ré7)
   Harmonie :           couplet Gm · Cm · D7 · Gm (le son classique) ; coro/mambo en cycle ii-V : Cm7 · F7 · Bbmaj7 ·
                        Ebmaj7 · Am7b5 · D7 · Gm · D7
   Instruments :        clave (le joueur), piano montuno, basse tumbao, congas accordées, campana, timbales (toms),
                        trompettes (le joueur), trombones en mambo ; transe : chœur (coro), güiro (shaker), trompette aiguë
   Interdits :          batterie rock, synthés, kick sur chaque temps
   Signature :          le montuno du piano qui ne s'arrête jamais, et les trombones qui répondent aux trompettes
   Contrainte de jeu :  la clave et la campana marquent la pulsation partout, même au descarga ; décompte à la clave ;
                        fin sur un « cierre » (coups de toute la section sur la clave)
   Forme :              décompte · intro 4 · couplet 8 · coro 8 · descarga 4 · couplet 8 · coro 8 · mambo final 8 · cierre 2
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.lab_latin = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const COUPLET = ['G:m', 'C:m', 'D:7', 'G:m', 'G:m', 'C:m', 'D:7', 'D:7'];
    const CORO = ['C:m7', 'F:7', 'Bb:maj7', 'Eb:maj7', 'A:m7b5', 'D:7', 'G:m', 'D:7'];
    const H = {decompte: [A('G:m')], intro: ['G:m', 'C:m', 'D:7', 'G:m'].map(n => A(n)), pause: ['G:m', 'G:m', 'D:7', 'D:7'].map(n => A(n)), fin: [A('D:7'), A('G:m6')]};
    const CLAVE = [0, 3, 6, 10, 12];   // 3-2 : trois coups, puis deux

    // ─── la rythmique : clave (au joueur), campana, congas, güiro ───
    const clave = (sec, m, niveaux) => CLAVE.forEach((p, i) => add(sec, ['clv', m, p, 0, 1, i === 0 ? 1 : .85, niveaux ? 'J' + niveaux[i] : undefined]));
    const campana = (sec, m) => [0, 4, 8, 12].forEach(p => add(sec, ['camp', m, p, 82, 1, p % 8 ? .5 : .75, '!'], ['camp', m, p + 2, 82, 1, .32, '!']));
    const congas = (sec, m, c) => { const hi = M.ton(c, 0, 62), lo = M.ton(c, 2, 55);
      [[0, hi, .35], [2, hi, .5], [4, hi, .8], [6, lo, .7], [7, lo, .6], [8, hi, .35], [10, hi, .5], [12, hi, .8], [14, lo, .7], [15, lo, .6]].forEach(([p, n, v]) => add(sec, ['cg', m, p, n, 1, v])); };
    // ─── tumbao : la basse anticipe (le « et » du 2 et le 4 de chaque demi-cycle), jamais sur le 1 ───
    const tumbao = (sec, m, c, cn) => { const r = M.ton(c, 0, 40), q = M.ton(c, 2, 40), nx = M.ton(cn, 0, 40);
      add(sec, ['bs', m, 3, q, 3, .8], ['bs', m, 6, r, 4.5, .9], ['bs', m, 11, q, 3, .78], ['bs', m, 14, nx, 4, .9, '!']); };   // « ! » : elle annonce l'accord suivant, même par-dessus la barre de section
    // ─── montuno : le piano en octaves, sur les contretemps, en boucle ───
    let vPn = null;
    const montuno = (sec, m, c, vol) => { vPn = M.voix(vPn, c, [0, 1, 2], 64, 76);
      const top = vPn[vPn.length - 1], mid = vPn[1], bas = vPn[0];
      [[0, bas], [2, top], [3, mid], [5, top], [6, bas], [8, mid], [10, top], [11, mid], [13, top], [14, bas]].forEach(([p, n], i) =>
        add(sec, ['pn', m, p, n, 1.2, (i % 3 === 0 ? .55 : .42)*(vol || 1)], ['pn', m, p, n - 12, 1.2, (i % 3 === 0 ? .45 : .32)*(vol || 1)])); };

    // ─── coro : les trompettes chantent le pregón (inventé), les trombones répondent en mambo ───
    // [mesure, pas, midi, durée, niveau]
    const PREGON = [
      [0, 0, 72, 2, 1], [0, 3, 75, 1, 3], [0, 6, 79, 2, 2], [0, 10, 75, 1, 3], [0, 12, 70, 2, 2],
      [1, 0, 72, 1.5, 1], [1, 3, 69, 1, 3], [1, 6, 77, 2, 2], [1, 10, 75, 1, 3], [1, 12, 72, 2.5, 2],
      [2, 0, 74, 2, 1], [2, 3, 77, 1, 3], [2, 6, 81, 2, 2], [2, 10, 77, 1, 3], [2, 12, 74, 3, 2],
      [3, 0, 79, 2, 1], [3, 3, 75, 1, 3], [3, 6, 74, 2, 2], [3, 10, 70, 1, 3], [3, 12, 67, 3, 2],
      [4, 0, 72, 2, 1], [4, 3, 75, 1, 3], [4, 6, 79, 2, 2], [4, 10, 81, 1, 3], [4, 12, 79, 2, 2],
      [5, 0, 78, 2, 1], [5, 3, 74, 1, 3], [5, 6, 72, 2, 2], [5, 10, 69, 1, 3], [5, 12, 66, 3, 2],
      [6, 0, 67, 1.5, 1], [6, 3, 70, 1, 3], [6, 6, 74, 2, 2], [6, 8, 79, 4, 1],
      [7, 0, 78, 1, 1], [7, 3, 74, 1, 3], [7, 6, 72, 1, 2], [7, 8, 69, 1, 3], [7, 10, 66, 3, 1],
    ];
    const mambo = (sec, m, c) => { const a = M.ton(c, 1, 55), b = M.ton(c, 2, 55);   // les trombones répondent dans les trous
      add(sec, ['tb', m, 13, b, .8, .8], ['tb', m, 14, a, 1.5, .9], ['tb', m, 13, a - 3 >= 50 ? M.ton(c, 0, 48) : a, .8, .6]); };

    const couplet = (sec) => { const harm = COUPLET.map(n => A(n)); H[sec] = harm;
      harm.forEach((c, m) => { clave(sec, m, [1, 2, 2, 1, 2]); campana(sec, m); congas(sec, m, c); tumbao(sec, m, c, harm[(m + 1) % 8]); montuno(sec, m, c, 1);
        // au couplet, la trompette lance juste deux notes par mesure (le pregón arrive au coro)
        if(m % 2 === 1) add(sec, ['tp', m, 10, M.ton(c, 2, 72), 1, .85, 'C2'], ['tp', m, 12, M.ton(c, 1, 72), 2.5, 1, 'C1']);
        else mambo(sec, m, c);
        for(let p = 0; p < 16; p += 2) add(sec, ['gu', m, p, 0, 1, p % 4 ? .35 : .55]);
      }); };
    const coro = (sec, haut) => { const harm = CORO.map(n => A(n)); H[sec] = harm;
      harm.forEach((c, m) => { clave(sec, m, [1, 2, 1, 1, 2]); campana(sec, m); congas(sec, m, c); tumbao(sec, m, c, harm[(m + 1) % 8]); montuno(sec, m, c, .85); mambo(sec, m, c);
        for(let p = 0; p < 16; p += 2) add(sec, ['gu', m, p, 0, 1, p % 4 ? .35 : .55]);
        // le coro (chœur) répond sur la deuxième moitié, dans la couche transe
        M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ch', m, 8, n, 6, .55]));
      });
      PREGON.forEach(([m, p, n, d, lv]) => { add(sec, ['tp', m, p, n, d, lv === 1 ? 1 : .86, 'C' + lv]); if(haut) add(sec, ['tp8', m, p, n + 12, d, .55]); });
      add(sec, ['tim', 7, 12, 64, 1, .7], ['tim', 7, 13, 60, 1, .75], ['tim', 7, 14, 57, 1, .8], ['tim', 7, 15, 52, 1, .9], ['cym', 0, 0, 0, 16, .5]);
    };

    // DÉCOMPTE : la clave seule
    clave('decompte', 0, null);

    // INTRO : le piano lance le montuno, la basse et les congas le rejoignent, les timbales appellent
    H.intro.forEach((c, m) => { montuno('intro', m, c, 1); clave('intro', m, m < 2 ? null : [2, 2, 2, 1, 2]);
      if(m >= 1) tumbao('intro', m, c, H.intro[(m + 1) % 4]); if(m >= 2){ congas('intro', m, c); campana('intro', m); } });
    add('intro', ['tim', 3, 12, 64, 1, .7], ['tim', 3, 13, 60, 1, .75], ['tim', 3, 14, 57, 1, .8], ['tim', 3, 15, 52, 1, .9]);
    add('intro', ['tp', 3, 12, 74, 1, .9, 'C2'], ['tp', 3, 14, 79, 2, 1, 'C1']);

    couplet('A'); coro('B', false);

    // DESCARGA : percussions et basse seules, le piano lâche des coups, les trompettes ponctuent
    H.pause.forEach((c, m) => { clave('pause', m, null); campana('pause', m); congas('pause', m, c); tumbao('pause', m, c, H.pause[(m + 1) % 4]);
      vPn = M.voix(vPn, c, [0, 1, 2], 64, 76); vPn.forEach(n => add('pause', ['pn', m, 6, n, 2, .6]));
      add('pause', ['tp', m, 0, M.ton(c, 1, 72), 2, 1, 'C1'], ['tim', m, 14, 60, 1, .6], ['tim', m, 15, 55, 1, .7]); });

    // MAMBO FINAL : le coro avec la trompette aiguë
    coro('final', true);

    // CIERRE : toute la section frappe sur la clave, puis l'accord final
    const c0 = H.fin[0]; [0, 3, 6, 10, 12].forEach((p, i) => { add('fin', ['clv', 0, p, 0, 1, 1], ['bs', 0, p, M.ton(c0, 0, 38), 1, 1], ['cg', 0, p, 62, 1, .9]);
      M.voix(null, c0, [1, 2, 3], 62, 74).forEach((n, k) => add('fin', ['tp', 0, p, n + 12 > 84 ? n : n + 12, 1, 1, k === 2 ? (i === 0 || i === 4 ? 'C1' : 'C2') : undefined], ['tb', 0, p, n - 12, 1, .9])); });
    M.voix(null, H.fin[1], [0, 1, 2, 3], 62, 74).forEach((n, k) => add('fin', ['tp', 1, 0, n + 12 > 84 ? n : n + 12, 4, 1, k === 3 ? 'C1' : undefined], ['tb', 1, 0, n - 12, 4, .9], ['pn', 1, 0, n, 4, .7]));
    add('fin', ['bs', 1, 0, 43, 4, 1], ['cym', 1, 0, 0, 16, .8], ['clv', 1, 0, 0, 1, 1, 'J1'], ['tim', 1, 0, 52, 2, 1]);

    return {
      bpm: 100, sig: [4, 4], swing: .5, humain: 5, graine: 31, pistes: true,
      salle: {taille: .45, amorti: .5, niveau: .45, predelai: .01},
      instruments: {
        clv: {type: 'rim', vol: .4, pan: .1, joueur: true, humain: false, groupe: 'base'},
        camp: {type: 'glockenspiel', modes: [[1, 1, .09], [1.51, .55, .06], [2.6, .2, .03]], vol: .07, pan: .35, verb: .1, groupe: 'base'},
        cg: {type: 'tom', vol: .2, pan: -.35, groupe: 'base'},
        tim: {type: 'tom', vol: .24, pan: .25, groupe: 'base'},
        cym: {type: 'crash', vol: .06, groupe: 'base'},
        gu: {type: 'shaker', vol: .07, pan: -.4, groupe: 'transe'},
        bs: {type: 'basse', vol: .44, brillance: .5, groupe: 'base'},
        pn: {type: 'piano', vol: .2, pan: -.15, groupe: 'base'},
        tp: {type: 'trompettes', vol: .25, pan: .15, joueur: true, groupe: 'base'},
        tb: {type: 'trombones', vol: .2, pan: -.2, groupe: 'base'},
        tp8: {type: 'trompettes', vol: .1, pan: .3, groupe: 'transe'},
        ch: {type: 'choeur', voyelle: 'o', vol: .07, groupe: 'transe'},
      },
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: 8, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'B', 'pause', 'A', 'B', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0], A: ['Couplet', 1], B: ['Coro', 2], pause: ['Descarga', 'rest'], final: ['Mambo', 3], fin: ['Cierre', 'rest']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: M.gamme('G', 'harmonique'),
    };
  };
})();
