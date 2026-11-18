/* BEAT SPLASH · Labo — guitares et orchestres (partitions Pupitre)

   « Grand chemin » — rock classique, 126 BPM, sol mixolydien (G · F · C · G). Riff de guitare qui roule, orgue qui
     chauffe, batterie franche. Couper = la guitare solo, taper = la caisse claire.
   « Trois accords » — punk, 176 BPM, la majeur. Guitares saturées en croches, batterie qui galope, mélodie à crier.
     Couper = la guitare solo, taper = la caisse claire.
   « Tonnerre » — thrash métal, 168 BPM, mi phrygien. Guitares étouffées qui mitraillent, double grosse caisse, solo.
     Couper = la guitare solo, taper = la caisse claire.
   « Parade des jouets » — fanfare, 116 BPM, si bémol majeur. Tuba (trombone grave) « poum », cuivres « pa », caisse
     claire de défilé (à taper), trompettes (à couper), clarinette et glockenspiel ; le final change de ton comme le
     trio d'une marche (mi bémol).
   « Assaut final » — orchestral épique, 140 BPM, do mineur (i · bVI · bIII · bVII). Cordes en ostinato, cors et
     trompettes au thème (à couper), grosse caisse d'orchestre et timbales (à taper), chœur. */
(function(){
  const M = window.K7M;
  const tenu = (add, sec, m, c, ins, lo, vol) => M.voix(null, c, [0, 1, 2, 3], lo, lo + 14).forEach(n => add(sec, [ins, m, 0, n, 16, .5*(vol || 1)]));
  const power = (add, sec, m, c, pas, ins, d, v) => { const r = M.ton(c, 0, 40); pas.forEach(p => [r, r + 7, r + 12].forEach(n => add(sec, [ins, m, p, n, d, v]))); };
  const guitareBand = (cfg) => (function(){
    const {R, couplet, intro, pause, fin, bpm, cle, final, kick, tags2, galop, hook, base} = cfg;
    const beat = (add, sec, m, tags, o) => { M.batt(add, sec, m, {kick: o && o.double ? 'xxxxxxxxxxxxxxxx' : kick, cs: '....X.......X...', hh: o && o.ride ? '' : 'x.x.x.x.x.x.x.x.', ride: o && o.ride ? 'x.x.x.x.x.x.x.x.' : ''}, {cs: {4: tags[0], 12: tags[1]}});
      if(o && o.fill) [[12, 52], [13, 50], [14, 47], [15, 43]].forEach(([p, n], i) => add(sec, ['tom', m, p, n, 1.5, .65 + i*.08])); };
    const basse = (add, sec, m, c) => { for(let p = 0; p < 16; p += 2) add(sec, ['bs', m, p, M.ton(c, 0, 40), 1.6, p % 4 ? .8 : 1]); };
    const rythme = (add, sec, m, c) => galop ? power(add, sec, m, c, [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15], 'ge', .8, .7) : power(add, sec, m, c, [0, 2, 4, 6, 8, 10, 12, 14], 'ge', 1, .7);
    return M.chanson({
      bpm, graine: bpm, cle, final,
      intro, couplet, refrain: R, pause, fin,
      decompte: add => [0, 4, 8, 12].forEach(p => add('decompte', ['hh', 0, p, 0, 1, .8])),
      introM: (add, sec, m, c) => { power(add, sec, m, c, [0, 8], 'gs', 7, .9); if(m >= 2) beat(add, sec, m, ['J2', 'J1'], {fill: m === 3}); },
      coupletM: (add, sec, m, c) => { beat(add, sec, m, ['J1', 'J2'], {fill: m === 7}); basse(add, sec, m, c); rythme(add, sec, m, c);
        if(m % 2 === 1) [[8, 2, 2, 'C2'], [10, 2, 1, 'C3'], [12, 3, 0, 'C1']].forEach(([p, d, i, t]) => add(sec, ['ld', m, p, M.ton(c, i, base), d, .9, t])); },
      refrainM: (add, sec, m, c) => { beat(add, sec, m, tags2 || ['J1', 'J1'], {double: !!galop, ride: !galop, fill: m === 7}); basse(add, sec, m, c); power(add, sec, m, c, [0, 6, 8], 'gs', 2, .9); if(cfg.orgue) tenu(add, sec, m, c, 'org', 55, .8); tenu(add, sec, m, c, 'ch', 57, .7); if(m % 4 === 0) add(sec, ['cr', m, 0, 0, 16, .7]); },
      pauseM: (add, sec, m, c) => { power(add, sec, m, c, [0], 'gs', 12, .8); add(sec, ['ld', m, 4, M.ton(c, 2, base), 6, .85, 'C1']); if(m === 3) beat(add, sec, m, [null, null], {fill: true}); },
      finM: (add, F) => { beat(add, 'fin', 0, ['J1', null]); power(add, 'fin', 0, F[0], [0, 8], 'gs', 7, 1); add('fin', ['cr', 0, 0, 0, 16, 1], ['cr', 1, 0, 0, 16, 1], ['ld', 1, 0, M.ton(F[1], 0, base + 2), 10, 1, 'C1'], ['kick', 1, 0, 36, 2, 1]); power(add, 'fin', 1, F[1], [0], 'gs', 12, 1); },
      lead: 'ld', leadOctave: 'ld2',
      hook: M.hookAuto(R, base, hook),
      instruments: {kick: {type: 'kick', vol: .5, groupe: 'base'}, cs: {type: 'caisse', vol: .34, joueur: true, groupe: 'base'}, hh: {type: 'charley', vol: .15, groupe: 'base'}, ride: {type: 'ride', vol: .11, groupe: 'base'},
        tom: {type: 'tom', vol: .28, groupe: 'base'}, cr: {type: 'crash', vol: .07, groupe: 'base'}, bs: {type: 'basse', vol: .4, drive: 2.6, brillance: 1.1, groupe: 'base'},
        ge: {type: 'guitare_etouffee', vol: .09, pan: -.4, groupe: 'base'}, gs: {type: 'guitare_sat', vol: .08, pan: .4, groupe: 'base'}, org: {type: 'orgue', vol: .1, pan: -.25, groupe: 'base'},
        ld: {type: 'guitare_sat', vol: .2, joueur: true, groupe: 'base'}, ld2: {type: 'guitare_sat', vol: .07, pan: -.4, groupe: 'transe'}, ch: {type: 'choeur', vol: .05, groupe: 'transe'}},
    });
  })();

  window.K7PARTITIONS.lab_rock = () => guitareBand({bpm: 126, cle: ['G', 'mixolydien'], final: 2, kick: 'x.....x.x.......', base: 64, orgue: true,
    intro: ['G:maj', 'F:maj', 'C:maj', 'G:maj'], couplet: ['G:maj', 'F:maj', 'C:maj', 'G:maj', 'G:maj', 'F:maj', 'C:maj', 'D:maj'],
    R: ['C:maj', 'G:maj', 'D:maj', 'G:maj', 'C:maj', 'G:maj', 'F:maj', 'D:maj'], pause: ['E:m', 'C:maj', 'F:maj', 'D:maj'], fin: ['G:maj', 'G:maj'],
    hook: [[[0, 2, 0, 'C1'], [2, 2, 1, 'C3'], [4, 4, 2, 'C2'], [8, 2, 4, 'C1'], [12, 3, 2, 'C2']], [[0, 6, 1, 'C1'], [8, 2, 2, 'C2'], [10, 2, 1, 'C3'], [12, 3, 0, 'C2']]]});
  window.K7PARTITIONS.lab_punk = () => guitareBand({bpm: 176, cle: ['A', 'ionien'], final: 0, kick: 'x.......x.x.....', base: 64,
    intro: ['A:maj', 'D:maj', 'E:maj', 'D:maj'], couplet: ['A:maj', 'D:maj', 'E:maj', 'D:maj', 'A:maj', 'D:maj', 'E:maj', 'E:maj'],
    R: ['D:maj', 'E:maj', 'A:maj', 'F#:m', 'D:maj', 'E:maj', 'A:maj', 'A:maj'], pause: ['F#:m', 'D:maj', 'A:maj', 'E:maj'], fin: ['A:maj', 'A:maj'],
    hook: [[[0, 4, 1, 'C1'], [4, 4, 1, 'C2'], [8, 4, 2, 'C1'], [12, 4, 1, 'C2']], [[0, 4, 4, 'C1'], [4, 4, 2, 'C2'], [8, 8, 1, 'C1']]]});
  window.K7PARTITIONS.lab_metal = () => guitareBand({bpm: 168, cle: ['E', 'phrygien'], final: 0, kick: 'x.x.x.x.x.x.x.x.', base: 64, galop: true,
    intro: ['E:m', 'F:maj', 'E:m', 'D:maj'], couplet: ['E:m', 'E:m', 'F:maj', 'E:m', 'E:m', 'E:m', 'G:maj', 'F:maj'],
    R: ['C:maj', 'D:maj', 'E:m', 'E:m', 'C:maj', 'D:maj', 'F:maj', 'E:m'], pause: ['C:maj', 'D:maj', 'F:maj', 'E:m'], fin: ['E:m', 'E:m'],
    hook: [[[0, 2, 2, 'C1'], [2, 2, 1, 'C3'], [4, 2, 0, 'C2'], [6, 2, 1, 'C3'], [8, 6, 2, 'C1']], [[0, 2, 4, 'C1'], [2, 2, 2, 'C3'], [4, 4, 1, 'C2'], [10, 4, 0, 'C2']]]});

  window.K7PARTITIONS.lab_fanfare = function(){
    const R = ['Bb:maj', 'Eb:maj', 'F:7', 'Bb:maj', 'G:m', 'C:m7', 'F:7', 'Bb:maj'];
    const marche = (add, sec, m, tags, o) => { M.batt(add, sec, m, {gc: 'x.......x.......', cm: o && o.roule ? 'x.xxx.x.x.xxx.xx' : 'x...x.x.x...x.x.'}, {cm: {4: tags[0], 12: tags[1]}}); if(o && o.cym) add(sec, ['cym', m, 0, 0, 8, .5]); };
    const oompa = (add, sec, m, c) => { [0, 8].forEach(p => add(sec, ['tu', m, p, M.ton(c, p ? 2 : 0, 34), 3, .9])); M.voix(null, c, [0, 1, 2], 60, 70).forEach(n => [4, 12].forEach(p => add(sec, ['pa', m, p, n, 1.5, .7]))); };
    return M.chanson({
      bpm: 116, graine: 116, cle: ['Bb', 'ionien'], final: 5,
      salle: {taille: .55, amorti: .45, niveau: .55},
      intro: ['Bb:maj', 'F:7', 'Bb:maj', 'F:7'], couplet: ['Bb:maj', 'Bb:maj', 'F:7', 'Bb:maj', 'Eb:maj', 'Bb:maj', 'F:7', 'Bb:maj'], refrain: R, pause: ['G:m', 'C:m7', 'F:7', 'F:7'], fin: ['Bb:maj', 'Bb:maj'],
      decompte: add => [0, 4, 8, 12].forEach(p => add('decompte', ['cm', 0, p, 0, 1, .8])),
      introM: (add, sec, m, c) => { marche(add, sec, m, ['J2', 'J1']); oompa(add, sec, m, c); },
      coupletM: (add, sec, m, c) => { marche(add, sec, m, ['J1', 'J2'], {cym: m === 0}); oompa(add, sec, m, c);
        if(m % 2 === 0) [[0, 2, 2, 'C1'], [2, 2, 1, 'C3'], [4, 2, 0, 'C2'], [6, 2, 1, 'C3'], [8, 4, 2, 'C1']].forEach(([p, d, i, t]) => add(sec, ['tp', m, p, M.ton(c, i, 65), d, .9, t]));
        else [[8, 1], [10, 2], [12, 4]].forEach(([p, i]) => add(sec, ['cl', m, p, M.ton(c, i, 65), 2, .6])); },
      refrainM: (add, sec, m, c) => { marche(add, sec, m, ['J1', 'J1'], {roule: m % 4 === 3, cym: m % 4 === 0}); oompa(add, sec, m, c); tenu(add, sec, m, c, 'cl', 58, .6); },
      pauseM: (add, sec, m, c) => { M.batt(add, sec, m, {cm: 'x.x.x.x.x.x.x.x.'}); add(sec, ['tu', m, 0, M.ton(c, 0, 34), 6, .9], ['tp', m, 8, M.ton(c, 1, 65), 4, .85, 'C1']); },
      finM: (add, F) => { marche(add, 'fin', 0, ['J1', null], {roule: true}); oompa(add, 'fin', 0, F[0]); M.voix(null, F[1], [0, 1, 2], 60, 76).forEach(n => add('fin', ['pa', 1, 0, n, 8, 1])); add('fin', ['tp', 1, 0, M.ton(F[1], 0, 70), 8, 1, 'C1'], ['tu', 1, 0, M.ton(F[1], 0, 34), 8, 1], ['gc', 1, 0, 36, 2, 1], ['cym', 1, 0, 0, 16, 1]); },
      lead: 'tp', leadOctave: 'gl',
      hook: M.hookAuto(R, 65, [[[0, 2, 0, 'C1'], [2, 2, 1, 'C3'], [4, 2, 2, 'C2'], [6, 2, 4, 'C3'], [8, 4, 2, 'C1'], [12, 3, 1, 'C2']], [[0, 3, 4, 'C1'], [4, 3, 2, 'C2'], [8, 6, 0, 'C1']]]),
      instruments: {gc: {type: 'grosse_caisse', vol: .3, groupe: 'base'}, cm: {type: 'caisse_militaire', vol: .3, joueur: true, groupe: 'base'}, cym: {type: 'crash', vol: .08, groupe: 'base'},
        tu: {type: 'trombones', clarte: .5, vol: .3, groupe: 'base'}, pa: {type: 'cuivres_stab', vol: .14, groupe: 'base'}, tp: {type: 'trompettes', vol: .3, joueur: true, groupe: 'base'},
        cl: {type: 'clarinette', vol: .16, pan: -.3, groupe: 'base'}, gl: {type: 'glockenspiel', vol: .1, pan: .3, groupe: 'transe'}},
      frappe: {J: {instr: {type: 'grosse_caisse', vol: .22}}},
    });
  };

  window.K7PARTITIONS.lab_epic = function(){
    const R = ['C:m', 'Ab:maj', 'Eb:maj', 'Bb:maj', 'F:m', 'Ab:maj', 'G:maj', 'G:maj'];
    const ostinato = (add, sec, m, c) => [0, 1, 2, 1, 0, 1, 2, 4].forEach((i, q) => [q*2, q*2 + 1].forEach(p => add(sec, ['os', m, p, M.ton(c, i, 52), .9, p % 2 ? .45 : .7])));
    const frappes = (add, sec, m, tags) => { add(sec, ['gc', m, 0, 36, 3, 1, tags[0]], ['gc', m, 8, 36, 3, .9, tags[1]]); [6, 14].forEach(p => add(sec, ['tim', m, p, 43, 2, .7])); };
    return M.chanson({
      bpm: 140, graine: 140, cle: ['C', 'eolien'], final: 2,
      salle: {taille: .85, amorti: .35, niveau: 1, predelai: .025},
      intro: ['C:m', 'C:m', 'Ab:maj', 'G:maj'], couplet: ['C:m', 'Ab:maj', 'Eb:maj', 'Bb:maj', 'C:m', 'Ab:maj', 'Bb:maj', 'G:maj'], refrain: R, pause: ['Ab:maj', 'Bb:maj', 'C:m', 'G:maj'], fin: ['C:m', 'C:m'],
      decompte: add => [0, 4, 8, 12].forEach(p => add('decompte', ['tim', 0, p, 43, 2, .8])),
      introM: (add, sec, m, c) => { ostinato(add, sec, m, c); if(m >= 2) frappes(add, sec, m, ['J2', 'J1']); },
      coupletM: (add, sec, m, c) => { ostinato(add, sec, m, c); frappes(add, sec, m, ['J1', 'J2']); add(sec, ['vc', m, 0, M.ton(c, 0, 36), 16, .7]);
        if(m % 2 === 1) [[8, 2, 2, 'C2'], [10, 2, 1, 'C3'], [12, 4, 0, 'C1']].forEach(([p, d, i, t]) => add(sec, ['tp', m, p, M.ton(c, i, 62), d, .9, t])); },
      refrainM: (add, sec, m, c) => { ostinato(add, sec, m, c); frappes(add, sec, m, ['J1', 'J1']); add(sec, ['vc', m, 0, M.ton(c, 0, 36), 16, .8]); tenu(add, sec, m, c, 'cor', 53, .8); tenu(add, sec, m, c, 'ch', 57, .8); if(m % 4 === 0) add(sec, ['cr', m, 0, 0, 16, .7]); },
      pauseM: (add, sec, m, c) => { tenu(add, sec, m, c, 'ch', 57, 1.2); tenu(add, sec, m, c, 'vn', 64, .8); add(sec, ['tp', m, 4, M.ton(c, 2, 62), 8, .85, 'C1']); },
      finM: (add, F) => { ostinato(add, 'fin', 0, F[0]); frappes(add, 'fin', 0, ['J1', null]); [8, 9, 10, 11, 12, 13, 14, 15].forEach((p, i) => add('fin', ['tim', 0, p, 43, 1, .4 + i*.07]));
        tenu(add, 'fin', 1, F[1], 'cor', 53, 1.2); tenu(add, 'fin', 1, F[1], 'ch', 57, 1.2); add('fin', ['tp', 1, 0, M.ton(F[1], 0, 72), 8, 1, 'C1'], ['gc', 1, 0, 36, 3, 1], ['cr', 1, 0, 0, 16, 1], ['vc', 1, 0, M.ton(F[1], 0, 36), 8, 1]); },
      lead: 'tp', leadOctave: 'vn8',
      hook: M.hookAuto(R, 62, [[[0, 3, 0, 'C1'], [3, 1, 1, 'C3'], [4, 4, 2, 'C2'], [8, 3, 4, 'C1'], [12, 4, 2, 'C2']], [[0, 6, 1, 'C1'], [6, 2, 2, 'C3'], [8, 4, 4, 'C2'], [12, 4, 2, 'C2']]]),
      instruments: {os: {type: 'cordes_stacc', vol: .2, groupe: 'base'}, vc: {type: 'violoncelles', vol: .18, groupe: 'base'}, vn: {type: 'violons', vol: .12, groupe: 'base'},
        gc: {type: 'grosse_caisse', vol: .34, joueur: true, groupe: 'base'}, tim: {type: 'timbales', vol: .22, groupe: 'base'}, cr: {type: 'crash', vol: .07, groupe: 'base'},
        tp: {type: 'trompettes', vol: .3, joueur: true, groupe: 'base'}, cor: {type: 'cors', vol: .13, groupe: 'base'},
        ch: {type: 'choeur', vol: .08, groupe: 'transe'}, vn8: {type: 'violons', vol: .08, groupe: 'transe'}},
      frappe: {J: {instr: {type: 'timbales', vol: .2}, midi: 43}},
    });
  };
})();
