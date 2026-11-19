/* BEAT SPLASH · Labo — musiques électroniques, suite (partitions Pupitre, gabarit K7M.club).

   « Tremblement » — DUBSTEP, 140 BPM joué en demi-tempo (ressenti 70), fa mineur.
     Émotion : sombre et lourd, 4/10 puis 9/10 au drop. Signature : la basse qui ondule, et dont l'ondulation change de vitesse
     à chaque note (noire, croche, triolet, double croche) : question et réponse entre deux vitesses.
     Kick sur le 1, caisse claire sur le 3, sous-basse en sinus, intro en arpèges avec écho. Tu joues le lead et la caisse claire.

   « Grand huit » — HAPPY HARDCORE, 170 BPM, mi majeur, final un ton plus haut.
     Émotion : joie à toute vitesse, 10/10. Signature : le piano à contretemps et le riff aigu en croches.
     Kick saturé sur chaque temps, basse à contretemps, I · V · vi · IV (E · B · C#m7 · A). Tu joues le riff et le clap.

   « Brume » — CHILL-OUT / ELECTRONICA, 92 BPM, mi bémol majeur, swing 58 %.
     Émotion : doux, flottant, 3/10 à 5/10. Signature : les cloches qui tiennent leurs notes (notes tenues à garder sous le doigt)
     et leur réponse en écho. Batterie cassée et légère, Rhodes, basse ronde. Tu joues les cloches et le rim. */
(function(){
  const M = window.K7M, T = M.ton;
  const V = (c, lo) => M.voix(null, c, [1, 2, 3, 4], lo, lo + 12);
  const plaque = (add, sec, ins, m, p, c, lo, d, v, o) => V(c, lo).forEach(n => add(sec, [ins, m, p, n, d, v, undefined, o]));

  /* ───────────────────────────── DUBSTEP ───────────────────────────── */
  window.K7PARTITIONS.lab_dubstep = function(){
    const boucle = ['F:m9', 'F:m9', 'Db:maj7', 'Db:maj7', 'Bb:m9', 'Bb:m9', 'C:7sus4', 'C:7'];
    // vitesses d'ondulation calées sur le tempo (140 BPM) : une par noire, croche, croche de triolet, double croche
    const noire = 140/60, W = {n: noire, c: noire*2, t: noire*3, d: noire*4};
    return M.club({
      bpm: 140, graine: 140, cle: ['F', 'eolien'], roule: 'cs', grave: 'sub', salle: {taille: .7, amorti: .5, niveau: .55, predelai: .03},
      prog: {intro: boucle, A: boucle, montee: ['Db:maj7', 'Db:maj7', 'C:7sus4', 'C:7'], B: ['F:m7', 'F:m7', 'Db:maj7', 'C:7', 'F:m7', 'F:m7', 'Bb:m7', 'C:7'],
        pause: ['Db:maj7', 'Eb:9', 'F:m9', 'F:m9', 'Db:maj7', 'Eb:9', 'C:7sus4', 'C:7'], fin: ['F:m9', 'F:m9']},
      groove: (add, sec, m, c, cn, n, o) => {
        // demi-tempo : la caisse claire tombe sur le 3e temps, tout paraît deux fois plus lent et deux fois plus lourd
        M.batt(add, sec, m, {kick: n >= 2 ? (m % 2 ? 'X.....x...x..x..' : 'X......x..x.....') : n >= 1 ? 'X.........x.....' : n >= 0 ? 'X...............' : '', cs: n >= .5 && !o.montee ? '........X.......' : '',
          clap: n >= 2 ? '........x.......' : '', hh: n >= 1 ? 'x.x.x.x.x.x.x...' : n >= 0 ? 'x...x...x...x...' : '', rim: n < 0 ? '........x.......' : ''}, {cs: {8: 'J1'}});
        // fin de mesure : charley en triolet (le roulement du genre)
        if(n >= 1) [12, 12 + 4/3, 12 + 8/3, 14.5].forEach((p, i) => add(sec, ['hh', m, p, 0, .6, i === 3 ? .35 : .55 - i*.1]));
        const r = T(c, 0, 29);
        if(n >= .5 || n < 0) add(sec, ['sub', m, 0, r, 7, .9], ['sub', m, 10, r, 5, .75]);
        if(n >= 2){ const w = T(c, 0, 41), q = T(c, 2, 41), f = n >= 3;
          // question (ondulation lente puis rapide) et réponse (triolet, puis une longue note qui grogne en glissant)
          (m % 2 === 0 ? [[0, w, 7, W.c], [8, w, 2, W.d], [10, f ? q : w, 2, W.d], [12, w, 4, W.t]] : [[0, w, 3, W.d], [4, f ? q : w, 4, W.c], [10, w, 6, W.n, {de: w + 12, glisse: .25}]])
            .forEach(([p, x, d, hz, g]) => add(sec, ['wob', m, p, x, d, .9, undefined, Object.assign({ondule: hz}, g)]));
        }
      },
      harmo: (add, sec, m, c, cn, n, cl) => {
        if(n >= 2){ plaque(add, sec, 'stab', m, 0, c, 60, 2, .8); plaque(add, sec, 'stab', m, 6, c, 60, 1, .55); return; }
        plaque(add, sec, 'pad', m, 0, c, 53, 16, n < 0 ? .7 : .5);
        // arpège en croches qui revient en écho : l'intro qui inquiète
        [0, 2, 1, 3].forEach((i, q) => { const no = ['pl', m, q*4, T(c, i, 65), 2, .6, undefined, {clarte: .25 + .75*cl}]; add(sec, no); M.echo(add, sec, no, 2, 3, .45); });
      },
      lead: 'ld', leadBase: 65, leadOctave: 'ss',
      motifs: {
        intro: [[], [], [], [], [[8, 6, 2, 'C1']], [[8, 6, 3, 'C1']], [[8, 6, 2, 'C1']], [[4, 3, 1, 'C1'], [8, 6, 2, 'C1']]],
        A: [[[0, 4, 2, 'C1'], [6, 2, 3, 'C2'], [10, 4, 2, 'C1'], [14, 2, 1, 'C3']], [[0, 6, 4, 'C1'], [10, 2, 3, 'C2'], [12, 4, 2, 'C1']]],
        B: [[[0, 2, 0, 'C1'], [4, 2, 2, 'C2'], [10, 2, 0, 'C1'], [12, 2, 2, 'C3'], [14, 2, 3, 'C2']], [[0, 3, 0, 'C1'], [4, 4, 2, 'C2'], [10, 6, 4, 'C1']]],
        pause: [[[0, 8, 2, 'C1'], [10, 6, 3, 'C1']], [[0, 14, 1, 'C1']]]},
      instruments: {kick: {type: 'kick_electro', vol: .5, f0: 160, f1: 42, tenue: .32, drive: 3, groupe: 'base'}, cs: {type: 'caisse', vol: .32, verb: .3, joueur: true, groupe: 'base'},
        clap: {type: 'clap', vol: .16, verb: .35, groupe: 'base'}, hh: {type: 'charley', vol: .1, groupe: 'base'}, rim: {type: 'rim', vol: .13, groupe: 'base'},
        sub: {type: 'synth_basse', onde: 'sinus', sub: 0, filtre: 500, filtreBas: 500, drive: 1.3, chute: 2, soutien: 1, vol: .24, verb: 0, groupe: 'base'},
        wob: {type: 'synth_basse', vol: .3, voix: 2, desaccord: 18, sub: .3, filtre: 3200, filtreBas: 3200, q: 2.2, drive: 2.5, chute: 3, soutien: 1, relache: .04, ondule: noire*2, onduleProf: .85, verb: .08, groupe: 'base'},
        pad: {type: 'nappe', vol: .1, groupe: 'base'}, pl: {type: 'synth_pluck', vol: .14, pan: .25, verb: .4, groupe: 'base'}, stab: {type: 'synth_cuivres', vol: .14, verb: .35, groupe: 'base'},
        ld: {type: 'synth_lead', vol: .24, filtre: 3800, joueur: true, groupe: 'base'}, ss: {type: 'supersaw', vol: .05, groupe: 'transe'}},
    });
  };

  /* ───────────────────────────── HAPPY HARDCORE ───────────────────────────── */
  window.K7PARTITIONS.lab_hardcore = function(){
    // le riff : huit mesures de croches aiguës, deux phrases (la seconde part du haut), inventé pour le jeu
    const riff = [[80, 83, 88, 83, 80, 83], [78, 83, 87, 83, 78, 83], [80, 85, 88, 85, 83, 80], [81, 85, 88, 87, 85, 83],
      [88, 83, 80, 83, 88, 83], [87, 83, 78, 83, 87, 90], [88, 85, 81, 85, 88, 85], [87, 83, 87, 83, null, null]];
    const RY = [[0, 2, 'C1'], [2, 2, 'C3'], [4, 3, 'C1'], [8, 2, 'C2'], [10, 2, 'C3'], [12, 3, 'C2']];
    const B = riff.map((mes, i) => mes.map((n, j) => n == null ? null : [RY[j][0], i === 3 && j === 3 ? 1.5 : i === 7 && j === 3 ? 8 : RY[j][1], {n}, RY[j][2]]).filter(Boolean));
    return M.club({
      bpm: 170, graine: 170, cle: ['E', 'ionien'], final: 2, pompage: {profondeur: .6, duree: .14}, salle: {taille: .55, amorti: .5, niveau: .5, predelai: .02},
      prog: {intro: ['E:maj', 'E:maj', 'B:maj', 'B:maj', 'C#:m7', 'C#:m7', 'A:add9', 'B:sus4'], A: ['E:maj', 'B:maj', 'C#:m7', 'A:add9', 'E:maj', 'B:maj', 'C#:m7', 'A:add9'],
        montee: ['A:add9', 'A:add9', 'B:sus4', 'B:maj'], B: ['E:maj', 'B:maj', 'C#:m7', 'A:add9', 'E:maj', 'B:maj', 'A:add9', 'B:maj'],
        pause: ['C#:m7', 'A:add9', 'E:maj', 'B:maj', 'C#:m7', 'A:add9', 'B:sus4', 'B:maj'], fin: ['E:maj', 'E:maj']},
      groove: (add, sec, m, c, cn, n) => {
        M.batt(add, sec, m, {kick: n >= 0 ? 'X...X...X...X...' : '', clap: n >= 1 ? '....x.......x...' : '', hho: n >= .5 ? '..x...x...x...x.' : '', hh: n >= 2 ? 'x.gxx.gxx.gxx.gx' : n < 0 ? 'x...x...x...x...' : '',
          cs: n >= 2 ? '......g..g....g.' : ''}, {clap: {4: n >= 2 ? 'J1' : 'J2', 12: 'J1'}});
        // basse à contretemps, courte : elle répond à chaque kick
        if(n >= .5) [2, 6, 10, 14].forEach(p => add(sec, ['basse', m, p, T(c, 0, 40) + (p === 14 && n >= 2 ? 12 : 0), 1.2, .9]));
        if(n < 0) add(sec, ['basse', m, 0, T(c, 0, 40), 14, .6]);
      },
      harmo: (add, sec, m, c, cn, n, cl) => {
        if(n < 0 || sec === 'pause'){ plaque(add, sec, 'pad', m, 0, c, 57, 16, .7); plaque(add, sec, 'pno', m, 0, c, 60, 7, .6); plaque(add, sec, 'pno', m, 8, c, 60, 6, .45); return; }
        // le piano à contretemps : le rythme qui fait sourire
        if(n >= .5) [[0, .75], [3, .55], [6, .65], [8, .7], [11, .55], [14, .6]].forEach(([p, v]) => plaque(add, sec, 'pno', m, p, c, 60, 1.5, v));
        if(n >= 2 || n === 0) plaque(add, sec, 'gate', m, 0, c, 57, 16, n === 0 ? .35 + .3*cl : .5, {clarte: .2 + .8*cl});
      },
      lead: 'ld', leadBase: 76, leadOctave: 'ss',
      motifs: {
        intro: [[], [], [], [], [[8, 6, 2, 'C1']], [[8, 6, 4, 'C1']], [[8, 6, 2, 'C1']], [[4, 3, 2, 'C1'], [8, 6, 1, 'C1']]],
        A: [[[0, 2, 2, 'C1'], [4, 3, 4, 'C1'], [8, 2, 2, 'C2'], [12, 3, 1, 'C2']], [[0, 3, 4, 'C1'], [6, 2, 2, 'C3'], [8, 6, 1, 'C1']]],
        B,
        pause: [[[0, 6, 2, 'C1'], [8, 6, 1, 'C1']], [[0, 12, 4, 'C1']]]},
      instruments: {kick: {type: 'kick_electro', vol: .36, f0: 220, f1: 50, chute: .05, tenue: .16, drive: 5, clic: .5, groupe: 'base'}, clap: {type: 'clap', vol: .22, joueur: true, groupe: 'base'},
        cs: {type: 'caisse', vol: .14, groupe: 'base'}, hh: {type: 'charley', vol: .09, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .15, groupe: 'base'},
        basse: {type: 'synth_basse', vol: .24, filtre: 1500, chute: .15, soutien: .3, relache: .03, pompe: true, groupe: 'base'}, pno: {type: 'piano', vol: .19, pompe: true, groupe: 'base'},
        gate: {type: 'supersaw', vol: .07, pompe: true, groupe: 'base'}, pad: {type: 'nappe', vol: .09, groupe: 'base'},
        ld: {type: 'synth_lead', voix: 3, desaccord: 16, filtre: 6500, vibrato: 0, vol: .24, joueur: true, groupe: 'base'}, ss: {type: 'supersaw', vol: .06, pompe: true, groupe: 'transe'}},
    });
  };

  /* ───────────────────────────── CHILL-OUT ───────────────────────────── */
  window.K7PARTITIONS.lab_brume = function(){
    return M.club({
      bpm: 92, swing: .58, graine: 92, humain: 6, cle: ['Eb', 'ionien'], roule: 'rim', gestes: 'CJH', salle: {taille: .8, amorti: .45, niveau: .7, predelai: .03},
      prog: {intro: ['Eb:maj9', 'C:m9', 'Ab:maj9', 'Bb:add9'], A: ['Eb:maj9', 'C:m9', 'Ab:maj9', 'Bb:add9', 'Eb:maj9', 'G:m7', 'Ab:maj9', 'Bb:7sus4'],
        montee: ['Ab:maj9', 'Ab:maj9', 'Bb:7sus4', 'Bb:7sus4'], B: ['Ab:maj9', 'Bb:add9', 'G:m7', 'C:m9', 'Ab:maj9', 'Bb:add9', 'Eb:maj9', 'Eb:maj9'],
        pause: ['C:m9', 'Ab:maj9', 'Eb:maj9', 'Bb:7sus4'], fin: ['Eb:maj9', 'Eb:maj9']},
      groove: (add, sec, m, c, cn, n, o) => {
        // batterie cassée et légère : le kick ne tombe jamais deux fois au même endroit d'une mesure à l'autre
        M.batt(add, sec, m, {kick: n >= 1 ? (m % 2 ? 'X......x..x..x..' : 'X......x..x.....') : n >= 0 ? 'X.........x.....' : '', rim: o.montee != null ? '' : n >= 0 ? '....x.......x...' : '............x...',
          clap: n >= 2 ? '....g.......x...' : '', hh: n >= 1 ? 'x.gxx.gxx.gxx.gx' : n >= 0 ? 'x...x...x...x...' : '', shk: n >= 2 || n < 0 ? 'g.x.g.x.g.x.g.x.' : ''}, {rim: {4: n >= 2 ? 'J1' : 'J2', 12: 'J1'}});
        const r = T(c, 0, 36);
        if(n >= .5) add(sec, ['basse', m, 0, r, 5, .9], ['basse', m, 7, T(c, 2, 36), 1, .55], ['basse', m, 10, r, 3, .8], ['basse', m, 14, T(cn, 0, 36) - 2, 1.5, .6]);
        else if(n < 0) add(sec, ['basse', m, 0, r, 12, .7]);
      },
      harmo: (add, sec, m, c, cn, n) => {
        // le Rhodes pose l'accord, puis le rejoue juste avant le 3e temps (il devance, il ne plaque pas)
        plaque(add, sec, 'rh', m, 0, c, 58, 7, .6); if(n >= 0) plaque(add, sec, 'rh', m, 10, c, 58, 5, .42);
        if(n >= 1 || n < 0) plaque(add, sec, 'pad', m, 0, c, 55, 16, .5);
      },
      // au drop, une petite phrase répond aux cloches et s'éloigne en écho
      extra: (add, sec, m, c, cn, n) => { if(n >= 2) [[2, 4], [5, 2]].forEach(([p, i]) => { const no = ['gl', m, p, T(c, i, 77), 1, .55]; add(sec, no); M.echo(add, sec, no, 2, 3, .5); }); },
      lead: 'bell', leadBase: 72, leadOctave: 'bell8',
      motifs: {
        intro: [[], [], [[8, 6, 2, 'C1']], [[8, 6, 3, 'C1']]],
        A: [[[0, 3, 2, 'C1'], [3, 3, 3, 'C2'], [8, 6, 4, 'H1']], [[2, 2, 3, 'C2'], [5, 3, 2, 'C1'], [10, 6, 1, 'H1']]],
        B: [[[0, 2, 4, 'C1'], [3, 2, 3, 'C2'], [6, 2, 2, 'C1'], [10, 6, 3, 'H1']], [[0, 3, 2, 'C1'], [4, 2, 3, 'C3'], [8, 8, 4, 'H1']],
          [[0, 2, 2, 'C1'], [3, 2, 3, 'C2'], [6, 2, 4, 'C1'], [10, 6, 3, 'H2']], [[0, 10, 2, 'H1'], [12, 3, 1, 'C2']]],
        pause: [[[0, 8, 2, 'H1'], [10, 4, 3, 'C1']], [[0, 12, 4, 'H1']]]},
      instruments: {kick: {type: 'kick', vol: .5, f0: 100, f1: 45, tenue: .3, groupe: 'base'}, rim: {type: 'rim', vol: .2, joueur: true, groupe: 'base'}, clap: {type: 'clap', vol: .1, verb: .4, groupe: 'base'},
        hh: {type: 'charley', vol: .09, groupe: 'base'}, shk: {type: 'shaker', vol: .09, groupe: 'base'}, basse: {type: 'basse', vol: .42, groupe: 'base'},
        rh: {type: 'rhodes', vol: .22, groupe: 'base'}, pad: {type: 'nappe', vol: .1, groupe: 'base'}, gl: {type: 'synth_pluck', vol: .1, pan: .3, verb: .5, groupe: 'base'},
        bell: {type: 'celesta', vol: .3, verb: .4, joueur: true, groupe: 'base'}, bell8: {type: 'glockenspiel', vol: .08, groupe: 'transe'},
        mt: {type: 'montee', vol: .05, groupe: 'base'}, rt: {type: 'retombee', vol: .06, groupe: 'base'}, crash: {type: 'crash', vol: .07, groupe: 'base'}},
    });
  };
})();
