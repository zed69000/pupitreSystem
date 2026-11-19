/* BEAT SPLASH · Labo — les grandes familles de la musique électronique (partitions Pupitre), une par morceau.
   Toutes suivent la forme des musiques de club (gabarit K7M.club) : intro qui s'installe · couplet · montée · drop · pause · montée · final.
   Les outils du genre viennent du moteur : pompe sur le kick (pompage), filtre qui s'ouvre (clarte), basse qui ondule, glissés, souffles.

   « Piscine de nuit » — HOUSE filtrée (French touch), 124 BPM, do mineur, swing 54 %.
     Émotion : chaud et dansant, 7/10. Signature : la boucle d'accords dont le filtre s'ouvre pendant l'intro, puis le piano house au drop.
     Kick sur chaque temps, charley ouvert à contretemps, basse qui rebondit à l'octave, tout pompe sur le kick.
     Harmonie Cm9 · Cm9 · Abmaj7 · Bb9 ; drop Abmaj7 · Bb9 · Gm7 · Cm9. Tu joues le piano et le clap.

   « Tunnel » — TECHNO mélodique, 130 BPM, ré mineur, droit.
     Émotion : hypnotique, qui avance, 6/10 puis 8/10. Signature : l'arpège de 6 notes qui tourne sur une mesure de 16 (il se décale
     et ne retombe sur ses pieds que toutes les 3 mesures), et l'accord qui revient en écho.
     Basse qui roule entre les kicks, peu d'accords (Dm9 longtemps, puis Bbmaj7 · C9).
     Les briques font partie de la musique : tu joues le riff (un synthé pincé, dans le médium grave, sous l'arpège) et le clap
     du morceau. Aucun bruit de frappe n'est ajouté : si tu ne joues pas, il manque le riff et le clap, c'est tout.

   « Lever de soleil » — TRANCE, 138 BPM, fa dièse mineur, final un ton plus haut.
     Émotion : euphorique, bras levés, 9/10 au drop. Signature : l'hymne en 3-3-2 au-dessus de la nappe hachée, et la pause au piano.
     Basse à contretemps, nappe hachée en doubles croches, i · VI · III · VII (F#m · D · A · E). Tu joues l'hymne et le clap.

   « Robot funk » — ELECTRO-FUNK, 112 BPM, sol dorien, swing 56 %.
     Émotion : malin, qui roule des épaules, 7/10. Signature : la voix de robot (talkbox) qui répond à la basse.
     Boîte à rythmes syncopée, basse de synthé qui saute à l'octave, cuivres de synthé en ponctuation, Gm9 · C9. Tu joues la voix et le clap. */
(function(){
  const M = window.K7M, T = M.ton;
  const V = (c, lo) => M.voix(null, c, [1, 2, 3, 4], lo, lo + 12);                    // accord serré, sans la fondamentale (elle est à la basse)
  const plaque = (add, sec, ins, m, p, c, lo, d, v, o) => V(c, lo).forEach(n => add(sec, [ins, m, p, n, d, v, undefined, o]));
  const C6 = ['C1', 'C2', 'C3', 'C1', 'C2', 'C3'];

  /* ───────────────────────────── HOUSE ───────────────────────────── */
  window.K7PARTITIONS.lab_house = function(){
    const boucle = ['C:m9', 'C:m9', 'Ab:maj7', 'Bb:9', 'C:m9', 'C:m9', 'Ab:maj7', 'Bb:9'];
    return M.club({
      bpm: 124, swing: .54, graine: 124, cle: ['C', 'eolien'], pompage: {profondeur: .6, duree: .22}, salle: {taille: .5, amorti: .55, niveau: .45, predelai: .02},
      prog: {intro: boucle, A: boucle, montee: ['Ab:maj7', 'Ab:maj7', 'Bb:9', 'G:7s9'], B: ['Ab:maj7', 'Bb:9', 'G:m7', 'C:m9', 'Ab:maj7', 'Bb:9', 'C:m9', 'C:m9'],
        pause: ['F:m9', 'F:m9', 'Eb:maj9', 'Eb:maj9', 'Ab:maj7', 'Ab:maj7', 'G:7sus4', 'G:7'], fin: ['C:m9', 'C:m9']},
      groove: (add, sec, m, c, cn, n) => {
        M.batt(add, sec, m, {kick: n >= 0 ? 'X...x...x...x...' : '', clap: n >= .5 ? '....x.......x...' : '', rim: n < 0 ? '....x.......x..x' : '',
          hho: n >= .5 ? '..x...x...x...x.' : n === 0 ? '..g...g...g...g.' : '', hh: n >= 2 ? 'x.xgx.xgx.xgx.xg' : n >= 1 ? '....x.g.....x.g.' : '', shk: n >= 2 ? 'g.x.g.x.g.x.g.x.' : ''},
          {clap: {4: n >= 2 ? 'J1' : 'J2', 12: 'J1'}});
        const r = T(c, 0, 36);
        // la basse rebondit entre les kicks : fondamentale, octave, et une note d'approche vers l'accord suivant
        if(n >= .5) [[2, r, 1.5, .95], [5, r + 12, 1, .6], [7, r, 1, .75], [10, r, 1.5, .9], [13, r + 12, 1, .6], [14, T(cn, 0, 36) - 1, 1, .7]].forEach(([p, x, d, v]) => add(sec, ['basse', m, p, x, d, v]));
        else if(n < 0) add(sec, ['basse', m, 0, r, 14, .7]);
      },
      // la boucle d'accords du disco filtré : le même rythme du début à la fin, c'est le filtre qui raconte l'histoire
      harmo: (add, sec, m, c, cn, n, cl) => {
        if(n < 0){ plaque(add, sec, 'stab', m, 0, c, 55, 6, .6, {clarte: .2 + .5*cl}); plaque(add, sec, 'pad', m, 0, c, 55, 16, .6); return; }
        [[0, .85], [3, .6], [6, .7], [10, .85], [13, .6]].forEach(([p, v]) => plaque(add, sec, 'stab', m, p, c, 55, 1.5, v, {clarte: .12 + .88*cl}));
        if(n >= 1) plaque(add, sec, 'pad', m, 0, c, 55, 16, .5);
      },
      // au drop, le piano plaque ses accords sous la mélodie (le son de la house de Chicago)
      extra: (add, sec, m, c, cn, n) => { if(n >= 2) [[0, .6], [3, .45], [6, .5], [10, .55]].forEach(([p, v]) => plaque(add, sec, 'pnc', m, p, c, 60, 2, v)); },
      lead: 'pn', leadBase: 72, leadOctave: 'ss',
      motifs: {
        intro: [[], [], [], [], [[8, 4, 2, 'C1']], [[8, 4, 3, 'C1']], [[8, 4, 2, 'C1']], [[4, 2, 3, 'C1'], [8, 4, 4, 'C1']]],
        A: [[[0, 2, 2, 'C1'], [3, 2, 3, 'C2'], [6, 4, 4, 'C1']], [[2, 2, 3, 'C2'], [6, 2, 2, 'C3'], [10, 4, 1, 'C1']]],
        B: [[[0, 2, 4, 'C1'], [3, 2, 3, 'C2'], [6, 2, 2, 'C1'], [10, 3, 3, 'C2'], [13, 2, 4, 'C3']], [[0, 2, 4, 'C1'], [3, 2, 3, 'C3'], [6, 4, 2, 'C1'], [12, 3, 1, 'C2']],
          [[0, 2, 2, 'C1'], [3, 2, 3, 'C2'], [6, 2, 4, 'C1'], [10, 3, 3, 'C2'], [13, 2, 2, 'C3']], [[0, 6, 4, 'C1'], [8, 2, 3, 'C2'], [11, 2, 2, 'C3'], [14, 2, 1, 'C2']]],
        pause: [[[0, 6, 2, 'C1'], [8, 4, 3, 'C1'], [12, 4, 2, 'C1']], [[0, 10, 1, 'C1']]]},
      instruments: {kick: {type: 'kick_electro', vol: .5, f0: 140, f1: 48, tenue: .26, groupe: 'base'}, clap: {type: 'clap', vol: .26, joueur: true, groupe: 'base'}, rim: {type: 'rim', vol: .14, groupe: 'base'},
        hh: {type: 'charley', vol: .12, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .16, groupe: 'base'}, shk: {type: 'shaker', vol: .1, groupe: 'base'},
        basse: {type: 'synth_basse', vol: .34, filtre: 1300, pompe: true, groupe: 'base'},
        stab: {type: 'synth_cuivres', vol: .19, filtre: 4200, filtreBas: 350, balayage: .12, q: 1.7, relache: .1, pan: -.15, pompe: true, groupe: 'base'},
        pad: {type: 'nappe', vol: .09, pompe: true, groupe: 'base'}, pn: {type: 'piano', vol: .3, joueur: true, groupe: 'base'}, pnc: {type: 'piano', vol: .13, pan: .2, groupe: 'base'},
        ss: {type: 'supersaw', vol: .06, pompe: true, groupe: 'transe'}},
    });
  };

  /* ───────────────────────────── TECHNO ───────────────────────────── */
  window.K7PARTITIONS.lab_tunnel = function(){
    const boucle = ['D:m9', 'D:m9', 'D:m9', 'D:m9', 'Bb:maj7', 'Bb:maj7', 'G:m9', 'A:m7'], tour = [0, 2, 3, 1, 2, 4];
    return M.club({
      bpm: 130, graine: 130, integre: true, cle: ['D', 'eolien'], pompage: {profondeur: .7, duree: .2}, salle: {taille: .7, amorti: .45, niveau: .55, predelai: .03},
      prog: {intro: boucle, A: boucle, montee: ['Bb:maj7', 'Bb:maj7', 'C:9', 'A:7sus4'], B: ['D:m9', 'D:m9', 'Bb:maj7', 'C:9', 'D:m9', 'D:m9', 'G:m9', 'A:m7'],
        pause: ['Bb:maj7', 'Bb:maj7', 'F:maj9', 'F:maj9', 'G:m9', 'G:m9', 'A:7sus4', 'A:7sus4'], fin: ['D:m9', 'D:m9']},
      groove: (add, sec, m, c, cn, n) => {
        M.batt(add, sec, m, {kick: n >= 0 ? 'X...x...x...x...' : '', clap: n >= 1 ? '....x.......x...' : '', hho: n >= .5 ? '..x...x...x...x.' : '', hh: n >= 2 ? 'x.gxx.gxx.gxx.gx' : '',
          ride: n >= 3 ? 'x...x...x...x...' : '', rim: n >= 1 ? '..x..x....x..x.x' : n < 0 ? '....x.......x...' : ''}, {clap: {4: n >= 2 ? 'J1' : 'J2', 12: 'J1'}});
        // la basse roule dans les trois doubles croches entre deux kicks : c'est elle qui fait avancer le morceau
        if(n >= .5) for(let p = 0; p < 16; p++) if(p % 4) add(sec, ['basse', m, p, T(c, 0, 26), .8, p % 4 === 2 ? .8 : .5]);
        if(n < 0) add(sec, ['basse', m, 0, T(c, 0, 26), 14, .6]);
      },
      harmo: (add, sec, m, c, cn, n, cl) => {
        plaque(add, sec, 'pad', m, 0, c, 53, 16, n < 0 ? .7 : .45);
        // l'accord qui claque puis revient deux fois, de plus en plus loin (l'écho de la techno dub)
        if(n >= 1 || n < 0) for(const p of n >= 2 ? [3, 11] : [3]) V(c, 60).forEach(x => { const no = ['stab', m, p, x, 1, .7, undefined, {clarte: .3 + .7*cl}]; add(sec, no); M.echo(add, sec, no, 2, 3, .5); });
      },
      // l'arpège de 6 notes sur une mesure de 16 : il glisse contre le temps, son filtre s'ouvre à l'intro et dans les montées
      extra: (add, sec, m, c, cn, n) => { const cl = sec === 'intro' ? .15 + .85*m/7 : sec === 'montee' ? .3 + .7*m/3 : n < 0 ? .35 : n === 0 ? .6 : 1;
        for(let p = 0; p < 16; p++){ const i = (m*16 + p) % 6; add(sec, ['arp', m, p, T(c, tour[i], 62), .8, (i % 3 === 0 ? .65 : .38)*(n < 0 ? .7 : 1), undefined, {clarte: cl}]); } },
      lead: 'ld', leadBase: 45, leadOctave: 'ss',
      motifs: {
        intro: [[], [], [], [], [[12, 4, 2, 'C1']], [[12, 4, 3, 'C1']], [[12, 4, 2, 'C1']], [[6, 3, 3, 'C1'], [12, 4, 4, 'C1']]],
        A: [[[0, 3, 2, 'C1'], [6, 3, 3, 'C2'], [12, 3, 2, 'C2']], [[3, 3, 1, 'C1'], [9, 3, 2, 'C3'], [12, 4, 0, 'C1']]],
        B: [[[0, 3, 4, 'C1'], [3, 3, 3, 'C2'], [6, 2, 2, 'C1'], [9, 3, 3, 'C3'], [12, 4, 2, 'C2']], [[0, 3, 4, 'C1'], [3, 3, 2, 'C2'], [6, 6, 1, 'C1'], [14, 2, 2, 'C3']],
          [[0, 3, 2, 'C1'], [3, 3, 3, 'C2'], [6, 2, 4, 'C1'], [9, 3, 3, 'C3'], [12, 4, 2, 'C2']], [[0, 8, 4, 'C1'], [10, 2, 3, 'C2'], [13, 3, 2, 'C3']]],
        pause: [[[0, 8, 2, 'C1'], [8, 8, 3, 'C1']], [[0, 14, 4, 'C1']]]},
      instruments: {kick: {type: 'kick_electro', vol: .46, f0: 120, f1: 44, tenue: .3, drive: 2.5, groupe: 'base'}, clap: {type: 'clap', vol: .22, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: .1, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .15, groupe: 'base'}, ride: {type: 'ride', vol: .07, groupe: 'transe'}, rim: {type: 'rim', vol: .12, pan: .3, groupe: 'base'},
        basse: {type: 'synth_basse', vol: .2, filtre: 700, filtreBas: 160, chute: .12, soutien: .2, relache: .03, pompe: true, groupe: 'base'},
        pad: {type: 'nappe', vol: .13, pompe: true, groupe: 'base'}, stab: {type: 'synth_cuivres', vol: .15, relache: .2, verb: .5, pompe: true, groupe: 'base'},
        arp: {type: 'synth_pluck', vol: .15, pan: .25, verb: .35, pompe: true, groupe: 'base'}, ld: {type: 'synth_lead', voix: 2, desaccord: 9, vol: .3, filtre: 2300, filtreBas: 450, balayage: .2, q: 1.5, relache: .14, vibrato: 0, verb: .3, joueur: true, groupe: 'base'},
        ss: {type: 'supersaw', vol: .05, pompe: true, groupe: 'transe'}},
    });
  };

  /* ───────────────────────────── TRANCE ───────────────────────────── */
  window.K7PARTITIONS.lab_trance = function(){
    const boucle = ['F#:m', 'F#:m', 'D:maj7', 'D:maj7', 'A:add9', 'A:add9', 'E:sus4', 'E:maj'];
    // l'hymne : huit mesures en 3-3-2, deux phrases (la seconde monte), inventé pour le jeu
    const hymne = [[73, 78, 76, 73, 69, 73], [74, 78, 76, 74, 73, 69], [76, 81, 80, 76, 73, 76], [76, 80, 78, 76, null, 71],
      [78, 81, 80, 78, 73, 78], [78, 81, 83, 81, 78, 74], [76, 81, 83, 85, 81, 76], [83, 80, 78, 76, null, null]];
    const RY = [[0, 3], [3, 3], [6, 1.5], [8, 3], [11, 3], [14, 2]];
    const B = hymne.map((mes, i) => mes.map((n, j) => n == null ? null : [RY[j][0], i === 1 && j === 3 ? 4 : i === 1 && j === 4 ? 1.5 : i === 3 && j === 3 ? 6 : i === 3 && j === 5 ? 1.5 : i === 7 && j === 3 ? 8 : RY[j][1], {n}, C6[j]]).filter(Boolean));
    B[1][4][0] = 12;      // mesure 2 : la note de passage tombe sur le 4e temps
    return M.club({
      bpm: 138, graine: 138, cle: ['F#', 'eolien'], final: 2, pompage: {profondeur: .65, duree: .2}, salle: {taille: .75, amorti: .4, niveau: .65, predelai: .03},
      prog: {intro: boucle, A: boucle, montee: ['D:maj7', 'D:maj7', 'E:maj', 'E:maj'], B: ['F#:m', 'D:maj7', 'A:add9', 'E:maj', 'F#:m', 'D:maj7', 'A:add9', 'E:maj'],
        pause: ['D:maj7', 'E:maj', 'C#:m7', 'F#:m7', 'D:maj7', 'E:maj', 'F#:m', 'F#:m'], fin: ['F#:m', 'F#:m']},
      groove: (add, sec, m, c, cn, n) => {
        M.batt(add, sec, m, {kick: n >= 0 ? 'X...x...x...x...' : '', clap: n >= 1 ? '....x.......x...' : '', hho: n >= .5 ? '..x...x...x...x.' : '', hh: n >= 2 ? 'x.gxx.gxx.gxx.gx' : n < 0 ? 'x...x...x...x...' : ''},
          {clap: {4: n >= 2 ? 'J1' : 'J2', 12: 'J1'}});
        // basse à contretemps ; au drop elle galope (deux doubles croches après chaque kick)
        if(n >= .5) for(const p of n >= 2 ? [2, 3, 6, 7, 10, 11, 14, 15] : [2, 6, 10, 14]) add(sec, ['basse', m, p, T(c, 0, 30), 1, p % 2 ? .6 : .9]);
        if(n < 0) add(sec, ['basse', m, 0, T(c, 0, 30), 15, .6]);
      },
      harmo: (add, sec, m, c, cn, n, cl) => {
        if(n < 0 || sec === 'pause'){      // la pause : piano en arpège et nappe, plus rien d'autre
          plaque(add, sec, 'pad', m, 0, c, 57, 16, .7); [0, 2, 1, 2, 3, 2, 1, 2].forEach((i, q) => add(sec, ['pno', m, q*2, T(c, i, 57), 3, q % 4 ? .45 : .65])); return; }
        // nappe hachée : le même accord en doubles croches, avec des trous (la signature de la trance)
        [...'x.xxx.xxx.xxx.xx'].forEach((ch, p) => { if(ch === 'x') plaque(add, sec, 'gate', m, p, c, 57, .8, p % 4 === 0 ? .6 : .42, {clarte: .15 + .85*cl}); });
        if(n >= 2) plaque(add, sec, 'pad', m, 0, c, 57, 16, .5);
      },
      lead: 'ld', leadBase: 73, leadOctave: 'ss',
      motifs: {
        intro: [[], [], [], [], [[8, 6, 2, 'C1']], [[8, 6, 1, 'C1']], [[8, 6, 2, 'C1']], [[8, 3, 2, 'C1'], [11, 3, 1, 'C1']]],
        A: [[[0, 3, 2, 'C1'], [3, 3, 4, 'C2'], [8, 3, 2, 'C1'], [11, 3, 1, 'C2']], [[0, 3, 2, 'C1'], [3, 3, 3, 'C2'], [8, 6, 2, 'C1']]],
        B,
        pause: [[[0, 12, {n: 73}, 'C1']], [[0, 12, {n: 71}, 'C1']], [[0, 12, {n: 76}, 'C1']], [[0, 12, {n: 73}, 'C1']], [[0, 12, {n: 78}, 'C1']], [[0, 12, {n: 76}, 'C1']], [[0, 14, {n: 73}, 'C1']], [[0, 14, {n: 78}, 'C1']]]},
      instruments: {kick: {type: 'kick_electro', vol: .46, f0: 150, f1: 46, tenue: .24, groupe: 'base'}, clap: {type: 'clap', vol: .24, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: .1, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .16, groupe: 'base'},
        basse: {type: 'synth_basse', vol: .24, filtre: 1100, pompe: true, groupe: 'base'}, gate: {type: 'supersaw', vol: .14, attaque: .003, relache: .05, pompe: true, groupe: 'base'},
        pad: {type: 'nappe', vol: .1, pompe: true, groupe: 'base'}, pno: {type: 'piano', vol: .16, verb: .4, groupe: 'base'},
        ld: {type: 'synth_lead', voix: 3, desaccord: 14, vol: .27, verb: .35, joueur: true, groupe: 'base'}, ss: {type: 'supersaw', vol: .06, pompe: true, groupe: 'transe'}},
    });
  };

  /* ───────────────────────────── ELECTRO-FUNK ───────────────────────────── */
  window.K7PARTITIONS.lab_robotfunk = function(){
    const vamp = ['G:m9', 'G:m9', 'C:9', 'C:9'];
    return M.club({
      bpm: 112, swing: .56, graine: 112, humain: 5, cle: ['G', 'dorien'], salle: {taille: .4, amorti: .6, niveau: .4, predelai: .015},
      prog: {intro: vamp.concat(vamp), A: ['G:m9', 'G:m9', 'C:9', 'C:9', 'G:m9', 'G:m9', 'Eb:maj7', 'D:7s9'], montee: ['Eb:maj7', 'Eb:maj7', 'D:7sus4', 'D:7s9'],
        B: ['Eb:maj7', 'F:9', 'G:m9', 'G:m9', 'Eb:maj7', 'F:9', 'D:m7', 'D:7s9'], pause: ['C:m9', 'C:m9', 'G:m9', 'G:m9', 'Eb:maj7', 'Eb:maj7', 'D:7sus4', 'D:7'], fin: ['G:m9', 'G:m9']},
      groove: (add, sec, m, c, cn, n) => {
        // boîte à rythmes de l'électro des années 80 : kick syncopé, jamais sur tous les temps
        M.batt(add, sec, m, {kick: n >= 2 ? 'X..x..x...x..x..' : n >= .5 ? 'X.....x...x.....' : n === 0 ? 'X.........x.....' : '', clap: n >= .5 ? '....x.......x...' : '',
          rim: n >= 1 ? '..x..x.x..x.x...' : n < 0 ? '....x..x....x...' : '', hho: n >= 1 ? '..............o.' : ''}, {clap: {4: n >= 2 ? 'J1' : 'J2', 12: 'J1'}});
        if(n >= 1) M.charley(add, sec, m, 'hh', {vol: n >= 2 ? 1 : .8}); else if(n >= 0) M.charley(add, sec, m, 'hh', {pas: 2, vol: .8});
        const r = T(c, 0, 36), s7 = T(c, 3, 36);
        // la basse parle sur le « un », saute à l'octave, et glisse vers l'accord suivant
        if(n >= .5) [[0, r, 2, .95], [3, r, 1, .55], [6, r + 12, 1, .75], [7, s7, 1, .6], [10, r, 1.5, .9], [13, r + 12, 1, .7], [14, T(cn, 0, 36) - 1, 1.5, .7, {de: r + 12, glisse: .05}]]
          .forEach(([p, x, d, v, o]) => add(sec, ['basse', m, p, x, d, v, undefined, o]));
        else if(n < 0) add(sec, ['basse', m, 0, r, 6, .8], ['basse', m, 10, r, 4, .6]);
      },
      harmo: (add, sec, m, c, cn, n, cl) => {
        if(n >= 1 || n < 0) plaque(add, sec, 'rh', m, 0, c, 55, n < 0 ? 14 : 7, .5);
        if(n >= 0) for(const [p, d] of n >= 2 ? [[0, 1], [3, 1], [7, 1], [10, 2], [13, 1]] : [[0, 1], [7, 1], [10, 2]]) plaque(add, sec, 'stab', m, p, c, 62, d, p === 10 ? .8 : .6, {clarte: .2 + .8*cl});
      },
      lead: 'tb', leadBase: 67, leadOctave: 'tb8',
      motifs: {
        intro: [[], [], [], [], [[10, 4, 2, 'C1']], [[10, 4, 1, 'C1']], [[10, 4, 2, 'C1']], [[6, 2, 1, 'C1'], [10, 4, 3, 'C1']]],
        A: [[[0, 2, 2, 'C1'], [3, 1, 3, 'C3'], [4, 2, 2, 'C2'], [7, 3, 1, 'C1']], [[2, 2, 1, 'C2'], [6, 2, 2, 'C1'], [10, 4, 3, 'C1']]],
        B: [[[0, 2, 4, 'C1'], [2, 2, 3, 'C3'], [4, 2, 2, 'C2'], [7, 3, 3, 'C1'], [11, 2, 2, 'C2'], [14, 2, 1, 'C3']], [[0, 3, 2, 'C1'], [4, 2, 3, 'C2'], [7, 5, 4, 'C1']],
          [[0, 2, 4, 'C1'], [2, 2, 3, 'C3'], [4, 2, 2, 'C2'], [7, 3, 1, 'C1'], [11, 2, 2, 'C2'], [14, 2, 3, 'C3']], [[0, 6, 2, 'C1'], [8, 2, 1, 'C2'], [10, 2, 2, 'C3'], [12, 3, 4, 'C1']]],
        pause: [[[0, 6, 2, 'C1'], [8, 6, 1, 'C1']], [[0, 12, 3, 'C1']]]},
      instruments: {kick: {type: 'kick_electro', vol: .48, f0: 130, f1: 42, tenue: .4, groupe: 'base'}, clap: {type: 'clap', vol: .26, joueur: true, groupe: 'base'}, rim: {type: 'rim', vol: .13, pan: -.25, groupe: 'base'},
        hh: {type: 'charley', vol: .12, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .15, groupe: 'base'},
        basse: {type: 'synth_basse', vol: .32, filtre: 1800, q: 2, balayage: .1, drive: 2, groupe: 'base'}, stab: {type: 'synth_cuivres', vol: .15, pan: .2, groupe: 'base'}, rh: {type: 'rhodes', vol: .14, pan: -.2, groupe: 'base'},
        tb: {type: 'talkbox', vol: .3, voyelle: 'o', joueur: true, groupe: 'base'}, tb8: {type: 'talkbox', vol: .08, voyelle: 'a', groupe: 'transe'}},
    });
  };
})();
