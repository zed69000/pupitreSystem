/* BEAT SPLASH · Labo — quatre morceaux de groove (partitions Pupitre)

   « Lève-toi » — gospel, 100 BPM en shuffle, la bémol majeur. Le piano appelle, le chœur répond (c'est toi qui
     coupes le chœur), orgue tenu, claps sur 2 et 4 (à taper). Final un demi-ton plus haut, comme à l'église.
     Harmonie Ab · Db · Ab · Eb7 ; refrain Db · Eb · Cm7 · Fm7 · Db · Eb7 · Ab · Ab7.
   « Gros son » — big beat, 124 BPM, ré mixolydien. Breakbeat lourd, basse saturée, riff de guitare, orgue, voix de
     robot (talkbox) qui lance la mélodie. Couper = le robot, taper = la caisse claire.
   « Boss final » — trap, 140 BPM écrit en demi-tempo (70), do phrygien. Basse 808 énorme, charleston en rafales,
     cloches inquiétantes (à couper), clap-caisse sur le 3 (à taper), chœur sombre.
   « Jungle express » — drum and bass, 172 BPM ressentis (écrit à 86 en doubles croches), fa# mineur. Batterie cassée,
     basse qui gronde, nappe, piano qui plane au-dessus (à couper), caisse claire (à taper). */
(function(){
  const M = window.K7M;
  const tenu = (add, sec, m, c, ins, lo, vol) => M.voix(null, c, [0, 1, 2, 3], lo, lo + 14).forEach(n => add(sec, [ins, m, 0, n, 16, .5*(vol || 1)]));

  window.K7PARTITIONS.lab_gospel = function(){
    const R = ['Db:maj', 'Eb:maj', 'C:m7', 'F:m7', 'Db:maj', 'Eb:7', 'Ab:maj', 'Ab:7'];
    const beat = (add, sec, m, tags) => M.batt(add, sec, m, {kick: 'x.....x.x.......', cs: '....x.......x...', clap: '....x.......x...', hh: 'x.x.x.x.x.x.x.x.'}, {clap: {4: tags[0], 12: tags[1]}});
    let vP = null;
    const piano = (add, sec, m, c, vol) => { vP = M.voix(vP, c, [0, 1, 2, 3], 55, 70); [[0, 2], [6, 1], [8, 2], [11, 1], [14, 2]].forEach(([p, d]) => vP.forEach(n => add(sec, ['pn', m, p, n, d, .5*(vol || 1)]))); };
    const basse = (add, sec, m, c, cn) => { const r = M.ton(c, 0, 40), nx = M.ton(cn, 0, 40); add(sec, ['bs', m, 0, r, 3, 1], ['bs', m, 4, M.ton(c, 1, 40), 3, .8], ['bs', m, 8, M.ton(c, 2, 40), 3, .85], ['bs', m, 12, nx === r ? r + 12 : nx, 3, .8, '!']); };
    // le chœur répond : un accord court, la note du haut est au joueur
    const repond = (add, sec, m, c, pas) => pas.forEach(([p, tag]) => M.voix(null, c, [0, 1, 2], 60, 74).forEach((n, k, a) => add(sec, ['ch', m, p, n, 2, .9, k === a.length - 1 ? tag : undefined])));
    return M.chanson({
      bpm: 100, swing: .64, swingSur: 8, graine: 100, cle: ['Ab', 'ionien'], final: 1, humain: 7,
      intro: ['Ab:maj', 'Db:maj', 'Ab:maj', 'Eb:7'], couplet: ['Ab:maj', 'Db:maj', 'Ab:maj', 'Eb:7', 'Ab:maj', 'Db:maj', 'Ab:maj', 'Eb:7'], refrain: R, pause: ['F:m7', 'Bb:m7', 'Eb:7sus4', 'Eb:7'], fin: ['Ab:maj', 'Ab:maj'],
      decompte: add => [0, 4, 8, 12].forEach(p => add('decompte', ['clap', 0, p, 0, 1, .8])),
      introM: (add, sec, m, c) => { piano(add, sec, m, c, 1.2); tenu(add, sec, m, c, 'org', 55, .7); if(m >= 2) beat(add, sec, m, ['J2', 'J1']); },
      coupletM: (add, sec, m, c, cn) => { beat(add, sec, m, ['J1', 'J2']); basse(add, sec, m, c, cn); tenu(add, sec, m, c, 'org', 55, .6);
        if(m % 2 === 0) piano(add, sec, m, c, 1.1); else repond(add, sec, m, c, [[8, 'C1'], [11, 'C3'], [12, 'C2']]); },
      refrainM: (add, sec, m, c, cn) => { beat(add, sec, m, ['J1', 'J1']); basse(add, sec, m, c, cn); piano(add, sec, m, c, .8); tenu(add, sec, m, c, 'org', 55, .8); tenu(add, sec, m, c, 'ch2', 60, .7); },
      pauseM: (add, sec, m, c) => { tenu(add, sec, m, c, 'org', 55, 1.2); piano(add, sec, m, c, .9); repond(add, sec, m, c, [[8, 'C1']]); },
      finM: (add, F) => { beat(add, 'fin', 0, ['J1', null]); piano(add, 'fin', 0, F[0], 1.2); repond(add, 'fin', 0, F[0], [[8, 'C1'], [12, 'C2']]); tenu(add, 'fin', 1, F[1], 'org', 55, 1.2); repond(add, 'fin', 1, F[1], [[0, 'C1']]); add('fin', ['bs', 1, 0, M.ton(F[1], 0, 40), 8, 1]); },
      lead: 'ch', leadOctave: 'pn2',
      hook: M.hookAuto(R, 67, [[[0, 3, 2, 'C1'], [4, 2, 1, 'C2'], [6, 2, 2, 'C3'], [8, 6, 4, 'C1']], [[0, 2, 4, 'C1'], [2, 2, 2, 'C3'], [4, 4, 1, 'C2'], [10, 2, 0, 'C3'], [12, 3, 1, 'C2']]]),
      instruments: {kick: {type: 'kick', vol: .5, groupe: 'base'}, cs: {type: 'caisse', vol: .26, retard: 8, groupe: 'base'}, clap: {type: 'clap', vol: .28, joueur: true, groupe: 'base'}, hh: {type: 'charley', vol: .14, groupe: 'base'},
        bs: {type: 'basse', vol: .44, brillance: .6, groupe: 'base'}, pn: {type: 'piano', vol: .16, groupe: 'base'}, org: {type: 'orgue', vol: .12, pan: -.3, groupe: 'base'},
        ch: {type: 'choeur', voyelle: 'o', attaque: .02, vol: .3, joueur: true, groupe: 'base'}, ch2: {type: 'choeur', voyelle: 'a', vol: .07, groupe: 'transe'}, pn2: {type: 'piano', vol: .08, pan: .3, groupe: 'transe'}},
      frappe: {C: {instr: {type: 'clap', vol: .18}}, J: {instr: {type: 'shaker', vol: .22, tenue: .12}}},
    });
  };

  window.K7PARTITIONS.lab_bigbeat = function(){
    const R = ['D:maj', 'C:maj', 'G:maj', 'D:maj', 'D:maj', 'C:maj', 'G:maj', 'A:7sus4'];
    const beat = (add, sec, m, tags, o) => M.batt(add, sec, m, {kick: 'X..x..x...x..x..', cs: '....X..g....X..g', hh: o && o.ouvert ? 'x.x.x.x.x.x.x.o.' : 'x.x.x.x.x.x.x.x.'}, {cs: {4: tags[0], 12: tags[1]}});
    const basse = (add, sec, m, c) => [[0, 2], [3, 1], [6, 2], [8, 2], [11, 1], [14, 2]].forEach(([p, d]) => add(sec, ['bs', m, p, M.ton(c, 0, 38), d, p % 8 ? .8 : 1]));
    const riff = (add, sec, m, c) => [[0, 0, 2], [3, 0, 1], [4, 2, 2], [8, 0, 2], [11, 4, 1], [12, 2, 2]].forEach(([p, i, d]) => add(sec, ['gs', m, p, M.ton(c, i, 50), d, .85]));
    return M.chanson({
      bpm: 124, graine: 124, cle: ['D', 'mixolydien'], final: 0,
      intro: ['D:maj', 'D:maj', 'C:maj', 'G:maj'], couplet: ['D:maj', 'D:maj', 'C:maj', 'G:maj', 'D:maj', 'D:maj', 'C:maj', 'A:7sus4'], refrain: R, pause: ['G:maj', 'C:maj', 'D:maj', 'A:7sus4'], fin: ['D:maj', 'D:maj'],
      decompte: add => [0, 4, 8, 12].forEach(p => add('decompte', ['cs', 0, p, 0, 1, .8])),
      introM: (add, sec, m, c) => { riff(add, sec, m, c); if(m >= 2){ beat(add, sec, m, ['J2', 'J1']); basse(add, sec, m, c); } },
      coupletM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J2'], {ouvert: m % 2}); basse(add, sec, m, c); riff(add, sec, m, c);
        if(m % 2 === 1) [[8, 2, 2, 'C1'], [10, 2, 1, 'C3'], [12, 3, 0, 'C2']].forEach(([p, d, i, t]) => add(sec, ['rob', m, p, M.ton(c, i, 64), d, .9, t])); },
      refrainM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J1'], {ouvert: true}); basse(add, sec, m, c); riff(add, sec, m, c); tenu(add, sec, m, c, 'org', 55, .8); },
      pauseM: (add, sec, m, c) => { tenu(add, sec, m, c, 'org', 55, 1.2); add(sec, ['rob', m, 0, M.ton(c, 2, 64), 6, .9, 'C1']); M.batt(add, sec, m, {hh: 'x.x.x.x.x.x.x.x.'}); },
      finM: (add, F) => { beat(add, 'fin', 0, ['J1', null]); riff(add, 'fin', 0, F[0]); add('fin', ['rob', 1, 0, M.ton(F[1], 0, 66), 8, 1, 'C1'], ['bs', 1, 0, M.ton(F[1], 0, 38), 8, 1]); tenu(add, 'fin', 1, F[1], 'org', 55, 1.2); },
      lead: 'rob', leadOctave: 'sc',
      hook: M.hookAuto(R, 64, [[[0, 2, 0, 'C1'], [2, 2, 0, 'C3'], [4, 2, 2, 'C2'], [6, 2, 1, 'C3'], [8, 4, 0, 'C1'], [12, 2, 2, 'C2']], [[0, 3, 4, 'C1'], [4, 3, 2, 'C2'], [8, 3, 1, 'C2'], [12, 3, 0, 'C3']]]),
      instruments: {kick: {type: 'kick', vol: .58, groupe: 'base'}, cs: {type: 'caisse', vol: .36, joueur: true, groupe: 'base'}, hh: {type: 'charley', vol: .16, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .14, groupe: 'base'},
        bs: {type: 'basse', vol: .42, drive: 3, brillance: 1.3, groupe: 'base'}, gs: {type: 'guitare_sat', vol: .12, pan: -.35, groupe: 'base'}, org: {type: 'orgue', vol: .11, pan: .3, groupe: 'base'},
        rob: {type: 'talkbox', voyelle: 'o', vol: .3, joueur: true, groupe: 'base'}, sc: {type: 'synth_cuivres', vol: .1, groupe: 'transe'}},
    });
  };

  window.K7PARTITIONS.lab_trap = function(){
    const R = ['C:m', 'Db:maj', 'C:m', 'Ab:maj', 'C:m', 'Db:maj', 'Bb:m', 'C:m'];
    const beat = (add, sec, m, tag, o) => { M.batt(add, sec, m, {kick: 'X.....x...x..x..', clap: '........X.......', hh: o && o.rafale ? 'x.x.xxx.x.x.xxxx' : 'x.x.x.x.x.x.x.x.'}, {clap: {8: tag}});
      if(o && o.rafale) [13, 13.33, 13.67].forEach(p => add(sec, ['hh', m, p, 0, .3, .4])); };
    const b808 = (add, sec, m, c) => add(sec, ['b8', m, 0, M.ton(c, 0, 36), 6, 1], ['b8', m, 6, M.ton(c, 0, 36), 4, .85], ['b8', m, 10, M.ton(c, 0, 36), 2, .8], ['b8', m, 13, M.ton(c, 0, 36) + 12, 3, .75]);
    return M.chanson({
      bpm: 70, graine: 70, cle: ['C', 'phrygien'], final: 0,
      intro: ['C:m', 'Db:maj', 'C:m', 'Db:maj'], couplet: ['C:m', 'C:m', 'Db:maj', 'C:m', 'C:m', 'C:m', 'Ab:maj', 'Db:maj'], refrain: R, pause: ['Ab:maj', 'Db:maj', 'Bb:m', 'C:m'], fin: ['C:m', 'C:m'],
      decompte: add => [0, 4, 8, 12].forEach(p => add('decompte', ['cl', 0, p, 72, 2, .6])),
      introM: (add, sec, m, c) => { tenu(add, sec, m, c, 'ch', 55, .8); add(sec, ['cl', m, 0, M.ton(c, 2, 72), 4, .6], ['cl', m, 8, M.ton(c, 1, 72), 4, .55]); if(m >= 2){ beat(add, sec, m, 'J1'); b808(add, sec, m, c); } },
      coupletM: (add, sec, m, c) => { beat(add, sec, m, m % 2 ? 'J2' : 'J1', {rafale: m % 4 === 3}); b808(add, sec, m, c); tenu(add, sec, m, c, 'ch', 55, .5);
        if(m % 2 === 0) [[0, 3, 2, 'C1'], [4, 2, 1, 'C2'], [8, 4, 0, 'C2'], [12, 2, 1, 'C3']].forEach(([p, d, i, t]) => add(sec, ['cl', m, p, M.ton(c, i, 72), d, .9, t])); },
      refrainM: (add, sec, m, c) => { beat(add, sec, m, 'J1', {rafale: m % 2 === 1}); b808(add, sec, m, c); tenu(add, sec, m, c, 'ch', 55, .8); tenu(add, sec, m, c, 'pad', 60, .8); },
      pauseM: (add, sec, m, c) => { tenu(add, sec, m, c, 'ch', 55, 1.1); add(sec, ['cl', m, 0, M.ton(c, 2, 72), 6, .85, 'C1']); },
      finM: (add, F) => { beat(add, 'fin', 0, 'J1'); b808(add, 'fin', 0, F[0]); add('fin', ['cl', 1, 0, M.ton(F[1], 0, 72), 8, 1, 'C1'], ['b8', 1, 0, M.ton(F[1], 0, 36), 10, 1]); tenu(add, 'fin', 1, F[1], 'ch', 55, 1); },
      lead: 'cl', leadOctave: 'gl',
      hook: M.hookAuto(R, 72, [[[0, 3, 4, 'C1'], [3, 1, 2, 'C3'], [4, 4, 1, 'C2'], [10, 2, 2, 'C2'], [12, 3, 0, 'C3']], [[0, 2, 2, 'C1'], [2, 2, 1, 'C3'], [6, 2, 0, 'C2'], [8, 6, 1, 'C1']]]),
      instruments: {kick: {type: 'kick', vol: .5, groupe: 'base'}, clap: {type: 'clap', vol: .3, joueur: true, groupe: 'base'}, hh: {type: 'charley', vol: .17, groupe: 'base'},
        b8: {type: 'synth_basse', onde: 'triangle', sub: .8, filtre: 600, filtreBas: 300, drive: 2.2, chute: 1.2, soutien: .5, vol: .5, groupe: 'base'},
        cl: {type: 'cloches_tubes', vol: .22, joueur: true, groupe: 'base'}, ch: {type: 'choeur', voyelle: 'ou', vol: .08, groupe: 'base'},
        pad: {type: 'nappe', vol: .08, groupe: 'transe'}, gl: {type: 'glockenspiel', vol: .07, groupe: 'transe'}},
    });
  };

  window.K7PARTITIONS.lab_dnb = function(){
    const R = ['D:maj7', 'E:maj', 'C#:m7', 'F#:m9', 'D:maj7', 'E:maj', 'B:m9', 'C#:7sus4'];
    // à 86 écrit, une double croche = une croche à 172 : caisse claire sur les « 2 et 4 » de la vraie mesure (pas 4 et 12 du demi-cycle…)
    const beat = (add, sec, m, tags, o) => { M.batt(add, sec, m, {kick: 'X.........x.....', cs: '....X.......X...', hh: 'x.x.x.x.x.x.x.x.'}, {cs: {4: tags[0], 12: tags[1]}});
      if(o && o.casse) [[7, .25], [9, .3], [14.5, .3], [15, .35]].forEach(([p, v]) => add(sec, ['cs', m, p, 0, .5, v])); };
    const reese = (add, sec, m, c) => add(sec, ['bs', m, 0, M.ton(c, 0, 30), 6, 1], ['bs', m, 7, M.ton(c, 0, 30), 3, .8], ['bs', m, 10, M.ton(c, 0, 30) + 12, 2, .7], ['bs', m, 12, M.ton(c, 0, 30), 4, .85]);
    return M.chanson({
      bpm: 86, graine: 172, cle: ['F#', 'eolien'], final: 0,
      intro: ['F#:m9', 'D:maj7', 'B:m9', 'C#:7sus4'], couplet: ['F#:m9', 'F#:m9', 'D:maj7', 'C#:7sus4', 'F#:m9', 'F#:m9', 'B:m9', 'C#:7sus4'], refrain: R, pause: ['D:maj7', 'B:m9', 'F#:m9', 'C#:7sus4'], fin: ['F#:m9', 'F#:m9'],
      decompte: add => [0, 4, 8, 12].forEach(p => add('decompte', ['hh', 0, p, 0, 1, .8])),
      introM: (add, sec, m, c) => { tenu(add, sec, m, c, 'pad', 57, 1); if(m >= 2){ beat(add, sec, m, ['J2', 'J1']); reese(add, sec, m, c); } },
      coupletM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J2'], {casse: m % 2}); reese(add, sec, m, c); tenu(add, sec, m, c, 'pad', 57, .8);
        if(m % 2 === 0) [[0, 4, 4, 'C1'], [6, 2, 2, 'C2'], [10, 4, 1, 'C2']].forEach(([p, d, i, t]) => add(sec, ['pn', m, p, M.ton(c, i, 67), d, .9, t])); },
      refrainM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J1'], {casse: true}); reese(add, sec, m, c); tenu(add, sec, m, c, 'pad', 57); [0, 1, 2, 4].forEach((i, q) => add(sec, ['gl', m, q*4, M.ton(c, i, 79), 3, .45])); },
      pauseM: (add, sec, m, c) => { tenu(add, sec, m, c, 'pad', 57, 1.3); add(sec, ['pn', m, 0, M.ton(c, 2, 67), 8, .85, 'C1']); },
      finM: (add, F) => { beat(add, 'fin', 0, ['J1', null], {casse: true}); reese(add, 'fin', 0, F[0]); tenu(add, 'fin', 1, F[1], 'pad', 57, 1.3); add('fin', ['pn', 1, 0, M.ton(F[1], 0, 69), 10, 1, 'C1']); },
      lead: 'pn', leadOctave: 'gl',
      hook: M.hookAuto(R, 67, [[[0, 4, 4, 'C1'], [4, 2, 2, 'C2'], [6, 2, 1, 'C3'], [8, 6, 2, 'C1']], [[0, 2, 1, 'C1'], [2, 2, 2, 'C3'], [4, 4, 4, 'C2'], [10, 4, 3, 'C2']]]),
      instruments: {kick: {type: 'kick', vol: .55, f0: 140, groupe: 'base'}, cs: {type: 'caisse', vol: .34, joueur: true, groupe: 'base'}, hh: {type: 'charley', vol: .15, groupe: 'base'},
        bs: {type: 'synth_basse', voix: 2, desaccord: 18, sub: .9, filtre: 900, filtreBas: 200, vol: .44, groupe: 'base'}, pad: {type: 'nappe', vol: .12, groupe: 'base'},
        pn: {type: 'piano', vol: .3, joueur: true, groupe: 'base'}, gl: {type: 'glockenspiel', vol: .07, pan: .35, groupe: 'transe'}},
    });
  };
})();
