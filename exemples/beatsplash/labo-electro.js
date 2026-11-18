/* BEAT SPLASH · Labo — trois morceaux électroniques (partitions Pupitre)

   « Surtension » — electro house, 128 BPM, la mineur. Kick sur chaque temps et pompe, basse à contretemps, accords
     filtrés, supersaw au refrain. Couper = le lead, taper = le clap. Signature : la basse qui saute à contretemps.
     Harmonie Am9 · Fmaj7 · Dm9 · E7sus4 ; refrain F · G · Am7 · Am7 · F · G · E7sus4 · E7.
   « L'usine » — techno, 134 BPM, la phrygien. Hypnotique : un accord qui grince (Bbmaj7 phrygien), basse qui roule,
     stabs. Couper = le stab, taper = le clap. Signature : le stab qui se décale d'une double croche à chaque mesure.
   « Borne d'arcade » — chiptune, 156 BPM, mi majeur. Tout en ondes carrées de console : lead, arpèges éclairs, basse
     triangle, batterie en bruit. Couper = le lead, taper = la caisse. Signature : les arpèges en triples doubles croches. */
(function(){
  const M = window.K7M;
  const arpege = (add, sec, m, c, ins, base, ordre, vol) => ordre.forEach((i, p) => add(sec, [ins, m, p, M.ton(c, i, base), .9, (p % 4 ? .4 : .6)*(vol || 1)]));
  const tenu = (add, sec, m, c, ins, lo, vol) => M.voix(null, c, [0, 1, 2, 3], lo, lo + 14).forEach(n => add(sec, [ins, m, 0, n, 16, .5*(vol || 1)]));

  window.K7PARTITIONS.lab_electro = function(){
    const R = ['F:maj', 'G:maj', 'A:m7', 'A:m7', 'F:maj', 'G:maj', 'E:7sus4', 'E:7'];
    const beat = (add, sec, m, tags, o) => M.batt(add, sec, m, {kick: o && o.sans ? '' : 'X...x...x...x...', clap: '....x.......x...', hho: '..x...x...x...x.', hh: o && o.seize ? 'x.x.x.x.x.x.x.x.' : ''}, {clap: {4: tags[0], 12: tags[1]}});
    const basse = (add, sec, m, c) => [2, 6, 10, 14].forEach(p => add(sec, ['bs', m, p, M.ton(c, 0, 36) + (p === 14 ? 12 : 0), 1.5, .9]));
    return M.chanson({
      bpm: 128, graine: 128, cle: ['A', 'eolien'], final: 2, pompe: true,
      intro: ['A:m9', 'F:maj7', 'D:m9', 'E:7sus4'], couplet: ['A:m9', 'F:maj7', 'D:m9', 'E:7sus4', 'A:m9', 'F:maj7', 'D:m9', 'E:7'], refrain: R, pause: ['F:maj7', 'D:m9', 'A:m9', 'E:7sus4'], fin: ['A:m9', 'A:m9'],
      decompte: add => [0, 4, 8, 12].forEach(p => add('decompte', ['clap', 0, p, 0, 1, .8])),
      introM: (add, sec, m, c) => { beat(add, sec, m, ['J2', 'J1']); arpege(add, sec, m, c, 'pl', 64, [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3], .8); },
      coupletM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J2']); basse(add, sec, m, c); tenu(add, sec, m, c, 'pad', 57, .8);
        if(m % 2 === 0) [[0, 2, 2, 'C1'], [3, 1, 1, 'C3'], [4, 2, 0, 'C2'], [8, 2, 1, 'C2']].forEach(([p, d, i, t]) => add(sec, ['ld', m, p, M.ton(c, i, 67), d, .9, t]));
        else arpege(add, sec, m, c, 'pl', 64, [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 4, 3, 2, 1]); },
      refrainM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J1'], {seize: true}); basse(add, sec, m, c); tenu(add, sec, m, c, 'ss', 60); arpege(add, sec, m, c, 'pl', 64, [0, 1, 2, 4, 2, 1, 0, 1, 0, 1, 2, 4, 2, 1, 0, 1], .6); },
      pauseM: (add, sec, m, c) => { beat(add, sec, m, [null, 'J1'], {sans: true}); tenu(add, sec, m, c, 'pad', 57, 1.2); add(sec, ['ld', m, 0, M.ton(c, 2, 67), 6, .85, 'C1']); },
      finM: (add, F) => { beat(add, 'fin', 0, ['J1', null]); tenu(add, 'fin', 0, F[0], 'ss', 60); tenu(add, 'fin', 1, F[1], 'pad', 57, 1.2); add('fin', ['ld', 1, 0, M.ton(F[1], 0, 69), 8, 1, 'C1'], ['bs', 1, 0, M.ton(F[1], 0, 36), 8, 1]); },
      lead: 'ld', leadOctave: 'ld8',
      hook: M.hookAuto(R, 67, [[[0, 2, 2, 'C1'], [2, 2, 3, 'C3'], [4, 3, 4, 'C2'], [8, 2, 2, 'C1'], [12, 3, 1, 'C2']], [[0, 3, 4, 'C1'], [4, 2, 2, 'C2'], [6, 2, 3, 'C3'], [8, 6, 1, 'C1']]]),
      instruments: {kick: {type: 'kick', vol: .55, f0: 135, f1: 46, groupe: 'base'}, clap: {type: 'clap', vol: .28, joueur: true, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .2, groupe: 'base'}, hh: {type: 'charley', vol: .16, groupe: 'base'},
        bs: {type: 'synth_basse', vol: .44, groupe: 'base'}, pad: {type: 'nappe', vol: .12, groupe: 'base'}, pl: {type: 'synth_pluck', vol: .12, pan: .3, groupe: 'base'},
        ld: {type: 'synth_lead', vol: .26, joueur: true, groupe: 'base'}, ss: {type: 'supersaw', vol: .08, groupe: 'transe'}, ld8: {type: 'supersaw', vol: .06, groupe: 'transe'}},
    });
  };

  window.K7PARTITIONS.lab_techno = function(){
    const R = ['A:m9', 'A:m9', 'Bb:maj7', 'A:m9', 'A:m9', 'A:m9', 'G:m7', 'Bb:maj7'];
    const beat = (add, sec, m, tags, o) => M.batt(add, sec, m, {kick: o && o.sans ? '' : 'X...X...X...X...', clap: '....x.......x...', hho: '..x...x...x...x.', hh: 'xxxxxxxxxxxxxxxx'}, {clap: {4: tags[0], 12: tags[1]}});
    const roule = (add, sec, m, c) => [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15].forEach(p => add(sec, ['bs', m, p, M.ton(c, 0, 33), .8, p % 4 === 2 ? .9 : .6]));
    const stab = (add, sec, m, c, tag) => { const p = (m * 3) % 8 + 2; M.voix(null, c, [1, 2, 3], 60, 72).forEach((n, k, a) => add(sec, ['st', m, p, n, 1.2, .85, k === a.length - 1 ? tag : undefined])); };
    return M.chanson({
      bpm: 134, graine: 134, cle: ['A', 'phrygien'], final: 0, pompe: true,
      intro: ['A:m9', 'A:m9', 'A:m9', 'Bb:maj7'], couplet: ['A:m9', 'A:m9', 'A:m9', 'Bb:maj7', 'A:m9', 'A:m9', 'G:m7', 'Bb:maj7'], refrain: R, pause: ['A:m9', 'Bb:maj7', 'A:m9', 'Bb:maj7'], fin: ['A:m9', 'A:m9'],
      decompte: add => [0, 4, 8, 12].forEach(p => add('decompte', ['kick', 0, p, 36, 2, .9])),
      introM: (add, sec, m, c) => { beat(add, sec, m, ['J2', 'J1']); if(m >= 2) roule(add, sec, m, c); },
      coupletM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J2']); roule(add, sec, m, c); stab(add, sec, m, c, m % 2 ? 'C2' : 'C1'); },
      refrainM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J1']); roule(add, sec, m, c); tenu(add, sec, m, c, 'pad', 57); [0, 2, 1, 3].forEach((i, q) => add(sec, ['pl', m, q*4 + 2, M.ton(c, i, 72), 1, .5])); },
      pauseM: (add, sec, m, c) => { tenu(add, sec, m, c, 'pad', 57, 1.3); stab(add, sec, m, c, 'C1'); M.batt(add, sec, m, {hh: 'x.x.x.x.x.x.x.x.'}); },
      finM: (add, F) => { beat(add, 'fin', 0, ['J1', null]); roule(add, 'fin', 0, F[0]); tenu(add, 'fin', 1, F[1], 'pad', 57, 1.3); stab(add, 'fin', 1, F[1], 'C1'); },
      lead: 'st', leadOctave: 'pl',
      hook: M.hookAuto(R, 64, [[[2, 1, 2, 'C1'], [6, 1, 1, 'C2'], [10, 1, 2, 'C2'], [14, 1, 3, 'C3']], [[0, 1, 4, 'C1'], [3, 1, 2, 'C3'], [6, 2, 1, 'C2'], [11, 1, 2, 'C2']]]),
      instruments: {kick: {type: 'kick', vol: .62, f0: 110, f1: 42, tenue: .6, groupe: 'base'}, clap: {type: 'clap', vol: .26, joueur: true, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .18, groupe: 'base'}, hh: {type: 'charley', vol: .12, groupe: 'base'},
        bs: {type: 'synth_basse', vol: .36, filtre: 700, groupe: 'base'}, pad: {type: 'nappe', vol: .1, groupe: 'base'},
        st: {type: 'synth_pluck', vol: .2, joueur: true, filtre: 3000, groupe: 'base'}, pl: {type: 'synth_pluck', vol: .08, pan: .35, groupe: 'transe'}},
    });
  };

  window.K7PARTITIONS.lab_chip = function(){
    const R = ['A:maj', 'B:maj', 'G#:m', 'C#:m', 'A:maj', 'B:maj', 'E:maj', 'E:maj'];
    const beat = (add, sec, m, tags) => M.batt(add, sec, m, {kick: 'x...x.x.x...x...', cs: '....x.......x...', hh: 'x.x.x.x.x.x.x.x.'}, {cs: {4: tags[0], 12: tags[1]}});
    const tri = (add, sec, m, c) => [0, 4, 8, 12].forEach((p, q) => add(sec, ['tri', m, p, M.ton(c, q % 2 ? 2 : 0, 40), 3, .9]));
    return M.chanson({
      bpm: 156, graine: 156, cle: ['E', 'ionien'], final: 1, humain: 0,
      salle: {taille: .2, amorti: .6, niveau: .15},
      intro: ['E:maj', 'C#:m', 'A:maj', 'B:maj'], couplet: ['E:maj', 'C#:m', 'A:maj', 'B:maj', 'E:maj', 'C#:m', 'F#:m', 'B:maj'], refrain: R, pause: ['A:maj', 'B:maj', 'C#:m', 'B:maj'], fin: ['E:maj', 'E:maj'],
      decompte: add => [0, 4, 8, 12].forEach(p => add('decompte', ['ch2', 0, p, 88, 1, .7])),
      introM: (add, sec, m, c) => { arpege(add, sec, m, c, 'ch2', 76, [0, 1, 2, 4, 0, 1, 2, 4, 0, 1, 2, 4, 0, 1, 2, 4], .7); if(m >= 2){ beat(add, sec, m, ['J2', 'J1']); tri(add, sec, m, c); } },
      coupletM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J2']); tri(add, sec, m, c);
        if(m % 2 === 0) [[0, 2, 0, 'C1'], [2, 2, 1, 'C3'], [4, 2, 2, 'C2'], [6, 2, 4, 'C2']].forEach(([p, d, i, t]) => add(sec, ['ld', m, p, M.ton(c, i, 71), d, .9, t]));
        else arpege(add, sec, m, c, 'ch2', 76, [0, 1, 2, 4, 2, 1, 0, 1, 0, 1, 2, 4, 5, 4, 2, 1]); },
      refrainM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J1']); tri(add, sec, m, c); arpege(add, sec, m, c, 'ch2', 76, [0, 1, 2, 4, 0, 1, 2, 4, 0, 1, 2, 4, 0, 1, 2, 4], .55); },
      pauseM: (add, sec, m, c) => { arpege(add, sec, m, c, 'ch2', 76, [0, 2, 4, 2, 0, 2, 4, 2, 0, 2, 4, 2, 0, 2, 4, 2], 1.7); tri(add, sec, m, c); add(sec, ['ld', m, 0, M.ton(c, 2, 71), 4, .85, 'C1']); },
      finM: (add, F) => { beat(add, 'fin', 0, ['J1', null]); [0, 1, 2, 4, 5, 6].forEach((i, q) => add('fin', ['ld', 0, q*2, M.ton(F[0], i, 71), 2, .9, q === 5 ? 'C1' : 'C3'])); add('fin', ['ld', 1, 0, M.ton(F[1], 0, 76), 8, 1, 'C1'], ['tri', 1, 0, M.ton(F[1], 0, 40), 8, 1]); },
      lead: 'ld', leadOctave: 'ld8',
      hook: M.hookAuto(R, 71, [[[0, 2, 2, 'C1'], [2, 1, 1, 'C3'], [3, 1, 2, 'C3'], [4, 2, 4, 'C2'], [8, 2, 2, 'C1'], [10, 2, 1, 'C3'], [12, 3, 0, 'C2']], [[0, 2, 4, 'C1'], [2, 2, 5, 'C3'], [4, 2, 4, 'C2'], [6, 2, 2, 'C3'], [8, 6, 1, 'C1']]]),
      instruments: {kick: {type: 'kick_electro', vol: .45, groupe: 'base'}, cs: {type: 'caisse', vol: .26, bruit: 1, ton: 400, joueur: true, groupe: 'base'}, hh: {type: 'shaker', vol: .12, groupe: 'base'},
        tri: {type: 'synth_basse', onde: 'triangle', sub: 0, filtre: 12000, filtreBas: 12000, drive: 1, vol: .45, groupe: 'base'},
        ch2: {type: 'chip', largeur: .125, vol: .26, pan: -.3, groupe: 'base'}, ld: {type: 'chip', vol: .38, joueur: true, groupe: 'base'}, ld8: {type: 'chip', largeur: .5, vol: .14, pan: .3, groupe: 'transe'}},
      frappe: {C: {instr: {type: 'caisse', vol: .14, bruit: 1, ton: 900, tenue: .05}}, J: {instr: {type: 'kick_electro', vol: .28, tenue: .15}}},
    });
  };
})();
