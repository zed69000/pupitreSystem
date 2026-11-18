/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Velours » (niveau 8, face H) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Velours
   Rôle :               niveau 8 : notes tenues + DEUX DOIGTS ; couper / tenir = le lead feutré, taper = la caisse claire
   Émotion et énergie : chaleur, soirée tardive, tête qui hoche lentement, 4/10 → 7/10
   Style de référence : néo-soul (couleurs : Rhodes aux accords de neuvième, basse ronde qui traîne, batterie en arrière
                        du temps, chœurs doux) ; tout en douceur, rien d'agressif
   Tempo / métrique :   72 BPM, 4/4, doubles croches swinguées (60 %), caisse claire très en arrière du temps
   Tonalité / mode :    ré bémol majeur ; le final monte d'un demi-ton (ré majeur)
   Harmonie :           couplet Dbmaj9 · Cm7 · Bbm9 · Ab13 · Gbmaj7 · Fm7 · Ebm9 · Ab13 ; refrain Gbmaj7 · Ab13 · Fm7 ·
                        Bbm9 · Gbmaj7 · Ab13 · Dbmaj9
   Instruments :        lead feutré (le joueur), caisse claire (le joueur), Rhodes, basse ronde, kick doux, charley,
                        shaker ; transe : chœur « ou », Rhodes aigu, cordes
   Interdits :          tout ce qui crie : distorsion, supersaw, batterie serrée
   Signature :          les accords de Rhodes qui glissent d'une neuvième à l'autre, et le lead qui tient ses notes
                        comme une voix
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  window.K7PARTITIONS.velours = function(){
    const beat = (add, sec, m, o) => { o = o || {};
      add(sec, ['kick', m, 0, 36, 2, 1], ['kick', m, 7, 36, 2, .7], ['kick', m, 10, 36, 2, .8]);
      add(sec, ['cs', m, 4, 0, 2, .9, o.tags ? o.tags[0] : undefined], ['cs', m, 12, 0, 2, .9, o.tags ? o.tags[1] : undefined]);
      for(let p = 0; p < 16; p += 2) add(sec, ['hh', m, p, 0, 1, p % 4 ? .35 : .55]); add(sec, ['hh', m, 15, 0, 1, .25]);
      for(let p = 0; p < 16; p++) add(sec, ['shk', m, p, 0, 1, p % 2 ? .25 : .4]);
    };
    const basse = (add, sec, m, c, cn) => { const r = M.ton(c, 0, 37), nx = M.ton(cn, 0, 37);
      add(sec, ['bs', m, 0, r, 5, 1], ['bs', m, 6, r + 7 <= 50 ? r + 7 : r - 5, 2, .7], ['bs', m, 10, r, 3, .85], ['bs', m, 14, nx === r ? r + 10 : nx, 2, .7, '!']); };
    let vRh = null;
    const rhodes = (add, sec, m, c, vol) => { vRh = M.voix(vRh, c, [1, 2, 3, c.iv.length > 4 ? 4 : 0], 56, 72);
      [[0, 6, .6], [7, 1.5, .45], [10, 5, .5]].forEach(([p, d, v]) => vRh.forEach((n, k) => add(sec, ['rh', m, p + k*.05, n, d, v*(vol || 1)]))); };
    const transe = (add, sec, m, c) => { M.voix(null, c, [0, 1, 2], 60, 72).forEach(n => add(sec, ['ch', m, 0, n, 16, .5])); M.voix(null, c, [1, 2, 3], 72, 84).forEach(n => add(sec, ['vn', m, 0, n, 16, .45]));
      [0, 1, 2, 3].forEach((i, q) => add(sec, ['rh2', m, 8 + q*2, M.ton(c, i, 75), 2, .4])); };
    return M.chanson({
      bpm: 72, swing: .6, humain: 8, graine: 72, cle: ['Db', 'ionien'], final: 1, finalMesures: 4,
      salle: {taille: .55, amorti: .6, niveau: .55, predelai: .02},
      intro: ['Db:maj9', 'C:m7', 'Bb:m9', 'Ab:13'], couplet: ['Db:maj9', 'C:m7', 'Bb:m9', 'Ab:13', 'Gb:maj7', 'F:m7', 'Eb:m9', 'Ab:13'],
      refrain: ['Gb:maj7', 'Ab:13', 'F:m7', 'Bb:m9', 'Gb:maj7', 'Ab:13', 'Db:maj9', 'Db:maj9'], pause: ['Gb:maj7', 'F:m7', 'Eb:m9', 'Ab:13'], fin: ['Db:maj9', 'Db:maj9'],
      decompte: add => [0, 4, 8, 12].forEach((p, k) => add('decompte', ['hh', 0, p, 0, 1, k ? .5 : .7])),
      introM: (add, sec, m, c, cn) => { rhodes(add, sec, m, c, 1.2); if(m >= 2){ beat(add, sec, m, {tags: ['J2', 'J1']}); basse(add, sec, m, c, cn); } },
      coupletM: (add, sec, m, c, cn) => { beat(add, sec, m, {tags: ['J1', 'J2']}); basse(add, sec, m, c, cn); rhodes(add, sec, m, c, .9);
        if(m % 2 === 0) [[0, 1, 2, 'C1'], [2, 2, 2, 'C3'], [4, 3, 6, 'H2']].forEach(([p, i, d, tag]) => add(sec, ['ld', m, p, M.ton(c, i, 68), d, .9, tag])); },
      apprend: {nom: 'À deux doigts !', gestes: 'CD', accords: ['Db:maj9', 'C:m7', 'Bb:m9', 'Ab:13'], mesure: (add, sec, m, c, cn) => {
        beat(add, sec, m, {tags: ['J1', 'J1']}); basse(add, sec, m, c, cn); rhodes(add, sec, m, c, .8); add(sec, ['ld', m, 8, M.ton(c, 2, 68), 3, .85, 'C2']); } },
      refrainM: (add, sec, m, c, cn) => { beat(add, sec, m, {tags: ['J1', 'J1']}); basse(add, sec, m, c, cn); rhodes(add, sec, m, c, .75); transe(add, sec, m, c); },
      pauseM: (add, sec, m, c) => { rhodes(add, sec, m, c, 1.2); add(sec, ['bs', m, 0, M.ton(c, 0, 37), 8, .8], ['ld', m, 4, M.ton(c, 1, 68), 8, .85, 'C1']); for(let p = 0; p < 16; p += 4) add(sec, ['hh', m, p, 0, 1, .3]); },
      finM: (add, F) => { rhodes(add, 'fin', 0, F[0], 1.1); add('fin', ['kick', 0, 0, 36, 2, 1], ['cs', 0, 4, 0, 2, 1, 'J1'], ['bs', 0, 0, 38, 8, 1], ['ld', 0, 8, 78, 8, .9, 'H1']);
        M.voix(null, F[1], [0, 1, 2, 3, 4], 56, 76).forEach((n, k) => add('fin', ['rh', 1, k*.08, n, 12, .6], ['ch', 1, 0, n, 12, .4])); add('fin', ['bs', 1, 0, 38, 10, .9]); },
      lead: 'ld', leadOctave: 'ld8',
      hook: [
        [0, 0, 70, 2, 'C1'], [0, 2, 73, 2, 'C3'], [0, 4, 77, 8, 'H1'], [0, 12, 73, 2, 'C2'],
        [1, 0, 72, 2, 'C1'], [1, 2, 75, 2, 'C3'], [1, 4, 78, 6, 'H2'], [1, 10, 77, 2, 'C3'], [1, 12, 72, 2, 'C2'],
        [2, 0, 80, 6, 'H1'], [2, 8, 77, 2, 'C2'], [2, 10, 75, 2, 'C3'], [2, 12, 72, 3, 'C2'],
        [3, 0, 73, 2, 'C1'], [3, 4, 77, 2, 'C2'], [3, 8, 82, 6, 'H1'],
        [4, 0, 70, 2, 'C1'], [4, 2, 73, 2, 'C3'], [4, 4, 77, 8, 'H1'], [4, 12, 77, 2, 'C2'],
        [5, 0, 84, 6, 'H1'], [5, 8, 80, 2, 'C2'], [5, 12, 75, 3, 'C2'],
        [6, 0, 77, 2, 'C1'], [6, 2, 80, 2, 'C3'], [6, 4, 84, 8, 'H1'],
        [7, 0, 75, 2, 'C1'], [7, 4, 73, 6, 'H2'],
      ],
      gestes: {A: 'CJ', B: 'CJHD', final: 'CJHD'},
      instruments: {
        kick: {type: 'kick', vol: .5, f0: 100, f1: 45, tenue: .8, groupe: 'base'}, cs: {type: 'caisse', vol: .3, retard: 18, joueur: true, groupe: 'base'},
        hh: {type: 'charley', vol: .15, retard: 6, groupe: 'base'}, shk: {type: 'shaker', vol: .06, pan: .35, groupe: 'base'},
        bs: {type: 'basse', vol: .46, brillance: .3, sub: 1.1, wah: .35, drive: 1.1, groupe: 'base'},
        rh: {type: 'rhodes', vol: .2, pan: -.15, verb: .25, humain: false, groupe: 'base'},
        ld: {type: 'synth_lead', vol: .24, filtre: 2200, filtreBas: 900, vibrato: .1, attaque: .02, joueur: true, groupe: 'base'},
        ch: {type: 'choeur', voyelle: 'ou', vol: .06, groupe: 'transe'}, vn: {type: 'violons', vol: .06, groupe: 'transe'},
        rh2: {type: 'rhodes', vol: .1, pan: .35, groupe: 'transe'}, ld8: {type: 'synth_lead', vol: .08, filtre: 2200, pan: .3, groupe: 'transe'},
      },
      frappe: {C: {instr: {type: 'rim', vol: .22, verb: .3}}, J: {instr: {type: 'kick', vol: .26, f0: 80, f1: 45, tenue: .5}}},
    });
  };
})();
