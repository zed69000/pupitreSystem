/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · musique du menu — partition Pupitre (en boucle)

   IDENTITÉ MUSICALE — Beat Splash / Menu
   Rôle :               accueil, choix des cassettes ; on y reste longtemps : la boucle doit vivre (32 mesures, 4 visages)
   Émotion et énergie : cool, sûr de lui, donne envie de jouer, 6/10 constant avec des vagues
   Style de référence : électro française façon robots casqués de la fin des années 90 / début 2000 (couleurs :
                        talkbox, boucles filtrées, basse en octaves), avec un passage rock (guitares saturées) et un
                        passage jazz (Rhodes, contrebasse qui marche, ride en swing)
   Tempo / métrique :   118 BPM (le tempo sur lequel dansent les cassettes de l'accueil), 4/4 ; la partie jazz swingue
   Tonalité / mode :    fa mineur (dorien au début, couleurs jazz au milieu)
   Harmonie :           électro Fm9 · Bb13 · Dbmaj7 · C7sus4 ; rock Db · Eb · Fm ; jazz Fm9 · Bb13 · Ebmaj9 · Abmaj7 ·
                        Dbmaj7 · Gm7b5 · C7
   Instruments :        talkbox, basse synthé, Rhodes, kick, claps, charley, shaker ; rock : guitares saturées et
                        étouffées, caisse claire, supersaw ; jazz : basse ronde qui marche, ride, balais
   Interdits :          dubstep, 808 qui glisse, tout ce qui couvre une annonce vocale
   Signature :          « BEAT — SPLASH ! » : le talkbox chante le nom du jeu en deux coups (le 1, puis le « et »
                        du 2, accentué), comme l'annonce du jeu ; il revient dans chaque visage du morceau
   Forme :              électro 8 · rock 8 · jazz 8 · électro final 8 → en boucle
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.menu = function(){
    const {N, add} = M.cahier(), A = M.acc;
    const ELECTRO = ['F:m9', 'F:m9', 'Bb:13', 'Bb:13', 'F:m9', 'F:m9', 'Db:maj7', 'C:7sus4'];
    const ROCK = ['Db:maj', 'Eb:maj', 'F:m', 'F:m', 'Db:maj', 'Eb:maj', 'C:7sus4', 'C:7'];
    const JAZZ = ['F:m9', 'Bb:13', 'Eb:maj9', 'Ab:maj7', 'Db:maj7', 'G:m7b5', 'C:7', 'C:7'];
    const H = {};

    // ─── l'annonce : « BEAT — SPLASH ! » (sur le 1, puis le « et » du 2) ───
    const annonce = (sec, m, c, aigu) => { const a = M.ton(c, 2, 67), b = M.ton(c, 0, 72); add(sec, ['tb', m, 0, a, 3, .95], ['tb', m, 6, b, 2.5, 1]); if(aigu) add(sec, ['ss', m, 6, b + 12, 2.5, .5]); };
    // ─── machines ───
    const quatre = (sec, m, o) => { o = o || {};
      [0, 4, 8, 12].forEach(p => add(sec, ['kick', m, p, 36, 2, p ? .88 : 1]));
      add(sec, ['clap', m, 4, 0, 1, .8], ['clap', m, 12, 0, 1, .8]); [2, 6, 10, 14].forEach(p => add(sec, ['hho', m, p, 0, 2, .55]));
      for(let p = 0; p < 16; p++) add(sec, ['shk', m, p, 0, 1, p % 4 === 2 ? .55 : .28]);
      if(o.fill) [12, 13, 14, 15].forEach((p, i) => add(sec, ['cs', m, p, 0, 1, .4 + i*.15]));
    };
    const basseOct = (sec, m, c, cn) => { const r = M.ton(c, 0, 36);
      [[0, r, 1.5, 1], [3, r + 12, .8, .7], [6, r, 1, .85], [8, r + 12, 1, .75], [10, r, 1, .85], [11, r + 12, .6, .55]].forEach(([p, n, d, v]) => add(sec, ['bs', m, p, n, d, v]));
      const nx = M.ton(cn, 0, 36); add(sec, ['bs', m, 14, nx === r ? r + 7 : nx, 1.6, .8]); };
    let vRh = null;
    const rhodes = (sec, m, c, motif, vol) => { vRh = M.voix(vRh, c, [1, 2, 3, c.iv.length > 4 ? 4 : 0], 57, 72);
      [...motif].forEach((ch, p) => { if(ch === 'x' || ch === 'X') vRh.forEach((n, k) => add(sec, ['rh', m, p + k*.025, n, ch === 'X' ? 3 : .9, (ch === 'X' ? .65 : .5)*(vol || 1)])); }); };

    // ÉLECTRO : la boucle filtrée, l'annonce toutes les deux mesures, le talkbox répond
    const electro = (sec, final) => { const harm = ELECTRO.map(n => A(n)); H[sec] = harm;
      harm.forEach((c, m) => { quatre(sec, m, {fill: m === 7}); basseOct(sec, m, c, harm[(m + 1) % 8]);
        if(m % 2 === 0){ annonce(sec, m, c, final); rhodes(sec, m, c, '..........x..x..', .8); }
        else { rhodes(sec, m, c, '..x..x....', .9); [[8, 2, 1], [10, 0, 1], [12, 1, 2]].forEach(([p, i, d]) => add(sec, ['tb', m, p, M.ton(c, i, 66), d, .8])); }
        if(final){ M.voix(null, c, [1, 2], 64, 76).forEach(n => [0, 3, 6, 10].forEach(p => add(sec, ['gt', m, p, n, .5, .5]))); [0, 1, 2, 3, 2, 1, 2, 3].forEach((i, q) => add(sec, ['arp', m, q*2, M.ton(c, i, 72), 1.2, q % 2 ? .4 : .55])); }
      }); };
    // ROCK : guitares saturées en croches, batterie qui frappe, le talkbox chante plus haut
    const ROCKMEL = [
      [0, 0, 77, 2], [0, 2, 80, 2], [0, 4, 77, 2], [0, 8, 73, 4],
      [1, 0, 79, 2], [1, 2, 82, 2], [1, 4, 79, 2], [1, 8, 75, 4],
      [2, 0, 80, 3], [2, 4, 77, 2], [2, 6, 72, 2], [2, 8, 77, 6],
      [4, 0, 77, 2], [4, 2, 80, 2], [4, 4, 77, 2], [4, 8, 73, 4],
      [5, 0, 79, 2], [5, 2, 82, 2], [5, 4, 79, 2], [5, 8, 75, 4],
      [6, 0, 77, 2], [6, 2, 79, 2], [6, 4, 82, 2], [6, 8, 84, 4],
      [7, 0, 76, 2], [7, 4, 79, 2], [7, 8, 72, 4],
    ];
    const rock = (sec) => { const harm = ROCK.map(n => A(n)); H[sec] = harm;
      harm.forEach((c, m) => { const r = M.ton(c, 0, 40);
        [[0, 1], [6, .85], [8, .95]].forEach(([p, v]) => add(sec, ['kickR', m, p, 36, 2, v])); add(sec, ['cs', m, 4, 0, 2, .95], ['cs', m, 12, 0, 2, .95]);
        for(let p = 0; p < 16; p += 2) add(sec, ['hh', m, p, 0, 1, p % 4 ? .45 : .7]);
        for(let p = 0; p < 16; p += 2){ const ouvert = p === 0 || p === 8; [r, r + 7, r + 12].forEach(n => add(sec, [ouvert ? 'gs' : 'ge', m, p, n, ouvert ? 2 : 1, ouvert ? .9 : .7])); }
        add(sec, ['bs', m, 0, M.ton(c, 0, 36), 2, 1], ['bs', m, 8, M.ton(c, 0, 36), 2, .9], ['bs', m, 6, M.ton(c, 0, 36) + 12, 1, .7]);
        M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ss', m, 0, n, 16, .5]));
        if(m === 3){ [[0, 65, 1.5], [2, 68, 1.5], [4, 70, 1], [6, 72, 3], [10, 68, 1], [12, 65, 3]].forEach(([p, n, d]) => add(sec, ['gs', m, p, n, d, .85])); }
        if(m === 0 || m === 4) add(sec, ['cr', m, 0, 0, 16, .6]);
      });
      ROCKMEL.forEach(([m, p, n, d]) => add(sec, ['tb', m, p, n, d, p === 0 ? 1 : .85]));
      annonce(sec, 7, harm[7], true);
    };
    // JAZZ : la contrebasse marche, le Rhodes comp en Charleston, ride en swing, l'annonce en douceur
    const jazz = (sec) => { const harm = JAZZ.map(n => A(n)); H[sec] = harm;
      harm.forEach((c, m) => { const cn = harm[(m + 1) % 8], r = M.ton(c, 0, 36), nx = M.ton(cn, 0, 36);
        [[0, r], [4, M.ton(c, 1, 36)], [8, M.ton(c, 2, 36)]].forEach(([p, n]) => add(sec, ['wb', m, p, n, 3.6, p ? .8 : .95]));
        add(sec, ['wb', m, 12, nx === r ? r + 2 : nx + (nx > r ? -1 : 1), 3.6, .8, '!']);   // l'approche chromatique, assumée
        ['x', null, null, null, 'x', null, 'x', null, 'x', null, null, null, 'x', null, 'x', null].forEach((x, p) => { if(x) add(sec, ['ride', m, p, 0, 2, p % 4 ? .45 : .7]); });
        add(sec, ['cs', m, 4, 0, 1, .3], ['cs', m, 12, 0, 1, .3], ['kickJ', m, 0, 36, 2, .5], ['kickJ', m, 8, 36, 2, .4]);
        rhodes(sec, m, c, 'X.....x.........', 1);
        if(m % 4 === 0) annonce(sec, m, c, false);
        else if(m % 4 === 2) [[8, 1, 1], [10, 2, 1], [12, 3, 3]].forEach(([p, i, d]) => add(sec, ['tb', m, p, M.ton(c, i, 66), d, .7]));
      }); };

    electro('A', false); rock('B'); jazz('C'); electro('D', true);

    return {
      bpm: 118, sig: [4, 4], swing: .5, humain: 4, graine: 7, boucle: true,
      salle: {taille: .5, amorti: .5, niveau: .45, predelai: .015},
      instruments: {
        kick: {type: 'kick', vol: .5, f0: 125, f1: 48}, kickR: {type: 'kick', vol: .5}, kickJ: {type: 'kick', vol: .35, f0: 90, tenue: .6},
        clap: {type: 'clap', vol: .24}, cs: {type: 'caisse', vol: .3, retard: 6},
        hh: {type: 'charley', vol: .17}, hho: {type: 'charley_ouvert', vol: .2}, shk: {type: 'shaker', vol: .08, pan: .35},
        ride: {type: 'ride', vol: .14}, cr: {type: 'crash', vol: .07},
        bs: {type: 'synth_basse', vol: .4}, wb: {type: 'basse', vol: .42, brillance: .4, wah: .2, drive: 1.2},
        rh: {type: 'rhodes', vol: .2, pan: -.2, verb: .25, humain: false},
        tb: {type: 'talkbox', vol: .26},
        gs: {type: 'guitare_sat', vol: .12, pan: -.35}, ge: {type: 'guitare_etouffee', vol: .12, pan: .35},
        gt: {type: 'guitare', vol: .1, pan: .35, etouffe: .8},
        ss: {type: 'supersaw', vol: .07}, arp: {type: 'synth_pluck', vol: .08, pan: -.35},
      },
      sections: {A: {mesures: 8, notes: N.A}, B: {mesures: 8, notes: N.B}, C: {mesures: 8, notes: N.C, swing: .62, swingSur: 8}, D: {mesures: 8, notes: N.D}},
      forme: ['A', 'B', 'C', 'D'],
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: M.gamme('F', 'dorien'),
    };
  };
})();
