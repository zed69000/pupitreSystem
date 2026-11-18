/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Coup de cuivres » (labo) — partition Pupitre

   IDENTITÉ MUSICALE — Beat Splash / Coup de cuivres
   Rôle :               morceau du labo, pilote du moteur Pupitre ; gestes couper (cuivres) et taper (caisse claire)
   Émotion et énergie : solaire, sûr de lui, 6/10 → 9/10 ; on respire au break, on explose au final
   Style de référence : funk de section de cuivres fin 70 (couleurs : Tower of Power, The JB's, Earth Wind & Fire
                        période cuivres) ; pas d'électro
   Tempo / métrique :   106 BPM, 4/4, swing des doubles croches 56 %
   Tonalité / mode :    mi dorien ; le final monte d'un ton (fa# dorien)
   Harmonie :           couplet = vamp Em9 · A13 puis Cmaj7 · B7#9 ; refrain = Cmaj9 · D6/9 · Bm7 · Em9, relance B7#9
   Instruments :        batterie acoustique (ghosts), basse aux doigts avec wah, guitare cocotte, Rhodes, trompettes,
                        trombones, stabs de section ; couche transe : shaker, congas, cordes, trompette à l'octave, claps
   Interdits :          supersaw, kick électro, nappe de synthé, basse 808
   Signature :          le « pa-PAH » des cuivres qui répond à la basse au couplet, et le refrain en question/réponse
                        qui grimpe jusqu'au mi aigu
   Contrainte de jeu :  charley en doubles croches du début à la fin (même au break) ; décompte d'une mesure au rim ;
                        fin nette sur un coup de section
   Forme :              décompte · intro 4 · couplet 8 · refrain 8 · break 4 · couplet 8 · refrain 8 · final 8 · fin 2

   Beatmap : chaque note à jouer est une vraie note de la partition, étiquetée « geste + niveau ».
   C = couper (une attaque de cuivres), J = taper (la caisse claire) ; niveau 1 = Apprenti … 4 = Roi.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const PARTS = window.K7PARTITIONS = window.K7PARTITIONS || {};

  PARTS.lab_funk = function(){
    const N = {}; const add = (sec, ...ns) => (N[sec] = N[sec] || []).push(...ns);
    // accords : fondamentale (classe de hauteur) + classes de hauteur du voicing
    const CH = {
      Em9: [4, [4, 7, 11, 2, 6]], A13: [9, [9, 1, 7, 11, 6]], Cmaj7: [0, [0, 4, 7, 11]], B7s9: [11, [11, 3, 9, 2]],
      Cmaj9: [0, [0, 4, 7, 11, 2]], D69: [2, [2, 6, 9, 11, 4]], Bm7: [11, [11, 2, 6, 9]], E9: [4, [4, 8, 11, 2, 6]], E7s9: [4, [4, 8, 2, 7]],
    };
    const tr = (c, k) => [(c[0] + k) % 12, c[1].map(p => (p + k) % 12)];
    const COUPLET = ['Em9', 'Em9', 'A13', 'A13', 'Em9', 'Em9', 'Cmaj7', 'B7s9'];
    const REFRAIN = ['Cmaj9', 'D69', 'Bm7', 'Em9', 'Cmaj9', 'D69', 'B7s9', 'B7s9'];
    // la fondamentale de basse : entre ré2 et do#3, pour que le haut-parleur d'un téléphone l'entende
    const racine = pc => { let m = 38 + ((pc - 38) % 12 + 12) % 12; return m; };
    const sept = c => c[1].includes((c[0] + 11) % 12) ? 11 : 10;

    // ─── batterie ───
    const HH = (sec, m, ouvert) => { for (let p = 0; p < 16; p++) { if (ouvert && p === 14) { add(sec, ['hho', m, p, 0, 2, 0.7]); continue; } add(sec, ['hh', m, p, 0, 1, p % 4 === 0 ? 0.7 : p % 2 === 0 ? 0.5 : 0.28]); } };
    const KICK = { a: 'x.....x.x..x....', b: 'x..x..x.x..x..x.' };
    const kick = (sec, m, k) => [...KICK[k]].forEach((c, p) => { if (c === 'x') add(sec, ['kick', m, p, 36, 2, p === 0 ? 1 : 0.8]); });
    // caisse claire : 2 et 4 (à taper), ghosts entre les deux
    const caisse = (sec, m, tags, fill) => {
      add(sec, ['caisse', m, 4, 0, 2, 0.95, tags[0]], ['caisse', m, 12, 0, 2, 0.95, tags[1]]);
      [7, 9, 15].forEach(p => add(sec, ['caisse', m, p, 0, 1, 0.18]));
      if (fill) [[13, 0.45], [14, 0.6], [15, 0.8]].forEach(([p, v]) => add(sec, ['caisse', m, p, 0, 1, v]));
    };
    const fillToms = (sec, m) => [[8, 64], [10, 60], [12, 55], [13, 52], [14, 48], [15, 45]].forEach(([p, n], i) => add(sec, ['tom', m, p, n, 2, 0.55 + i * 0.07]));

    // ─── basse : le « un » appuyé, l'octave qui claque, notes mortes, approche de l'accord suivant ───
    const basse = (sec, m, c, cn, varie) => {
      const r = racine(c[0]), s7 = sept(c), nx = racine(cn[0]), app = nx === r ? r - 2 : (nx > r ? nx - 1 : nx + 1);
      const L = varie
        ? [[0, 0, 2, 1], [3, 12, 0.5, 0.6], [4, s7, 1, 0.75], [6, 7, 1, 0.6], [8, 0, 0.5, 0.9], [9, 0, 0.4, 0.45], [10, 7, 0.5, 0.7], [11, s7, 0.5, 0.7], [12, 12, 0.5, 0.8], [13, s7, 0.5, 0.6]]
        : [[0, 0, 2, 1], [3, 12, 0.5, 0.6], [4, s7, 1, 0.75], [6, 7, 1, 0.6], [7, 12, 0.4, 0.3], [8, 0, 1.2, 0.95], [10, 7, 1, 0.6], [11, s7, 0.5, 0.5], [12, 12, 1, 0.72]];
      L.forEach(([p, i, d, v]) => add(sec, ['basse', m, p, r + i, d, v]));
      add(sec, ['basse', m, 14, app, 1.2, 0.7]);
    };

    // ─── harmonie : voix conduites ───
    let vRh = null, vGt = null;
    const rhodes = (sec, m, c, cn) => {
      vRh = PupitreEcriture.conduire(vRh, c[1].filter(p => p !== c[0]).slice(0, 4), 55, 72);
      [[3, 0.55, 1.2], [6, 0.48, 0.8], [10, 0.62, 1.6]].forEach(([p, v, d]) => vRh.forEach((n, k) => add(sec, ['rh', m, p + k * 0.06, n, d, v])));
      if (cn !== c) { const nv = PupitreEcriture.conduire(vRh, cn[1].filter(p => p !== cn[0]).slice(0, 4), 55, 72); nv.forEach((n, k) => add(sec, ['rh', m, 14 + k * 0.06, n, 4, 0.72])); }
    };
    const cocotte = (sec, m, c) => {
      vGt = PupitreEcriture.conduire(vGt, c[1].slice(-3), 64, 77);
      [...'g.x.gxg.g.x.gxgx'].forEach((ch, p) => {
        if (ch === 'x') vGt.forEach((n, k) => add(sec, ['gt', m, p + k * 0.04, n, 0.6, 0.6]));
        if (ch === 'g') add(sec, ['gt', m, p, vGt[1], 0.2, 0.2]);
      });
    };
    // stabs de section (accord serré dans le médium)
    let vSt = null;
    const stab = (sec, m, p, c, d, v, tag) => { vSt = PupitreEcriture.conduire(vSt, c[1].slice(1, 4), 62, 76); vSt.forEach((n, k) => add(sec, ['stab', m, p, n, d, v, k === vSt.length - 1 ? tag : undefined])); };

    // ─── le hook du refrain (inventé) : question sur 2 mesures, réponse qui monte au mi aigu ───
    // [mesure, pas, midi, durée, niveau]
    const HOOK = [
      [0, 0, 67, 1.5, 1], [0, 3, 69, 1, 3], [0, 6, 71, 2, 2], [0, 10, 74, 1, 3], [0, 12, 71, 3, 2],
      [1, 2, 69, 1, 3], [1, 4, 66, 1, 2], [1, 6, 69, 1, 3], [1, 8, 71, 4, 1],
      [2, 0, 74, 1.5, 1], [2, 3, 73, 1, 3], [2, 6, 71, 2, 2], [2, 10, 69, 1, 3], [2, 12, 66, 3, 2],
      [3, 2, 67, 1, 3], [3, 4, 69, 1, 2], [3, 6, 71, 1, 3], [3, 8, 76, 5, 1],
    ];
    // deuxième passage : même début, la fin relance vers le B7#9 (ré# qui tire vers mi)
    const HOOK2 = HOOK.slice(0, 9).concat([
      [2, 0, 74, 1.5, 1], [2, 3, 76, 1, 3], [2, 6, 78, 2, 2], [2, 10, 76, 1, 3], [2, 12, 75, 3, 2],
      [3, 0, 75, 0.75, 1], [3, 3, 75, 0.75, 3], [3, 6, 78, 3, 2],
    ]);
    const hook = (sec, m0, H, k, octave) => H.forEach(([m, p, n, d, lv]) => {
      add(sec, ['tp', m0 + m, p, n + k, d, lv === 1 ? 1 : 0.85, 'C' + lv], ['tb', m0 + m, p, n + k - 12, d, 0.75]);
      if (octave) add(sec, ['tp8', m0 + m, p, n + k + 12, d, 0.7]);
    });

    // ─── couche transe (s'ajoute avec le combo) ───
    const transe = (sec, m, c, cordes) => {
      for (let p = 0; p < 16; p++) add(sec, ['shk', m, p, 0, 1, p % 2 ? 0.35 : 0.6]);
      [[2, 62, 0.6], [3, 62, 0.4], [6, 57, 0.7], [10, 62, 0.6], [11, 64, 0.45], [14, 57, 0.7]].forEach(([p, n, v]) => add(sec, ['conga', m, p, n, 1, v]));
      add(sec, ['clap', m, 4, 0, 1, 0.6], ['clap', m, 12, 0, 1, 0.6]);
      if (cordes) PupitreEcriture.conduire(null, c[1].slice(1, 4), 72, 86).forEach(n => add(sec, ['vn', m, 0, n + 0, 16, 0.55]));
    };

    // DÉCOMPTE : 4 coups de rim, la guitare prend son élan
    [0, 4, 8, 12].forEach((p, k) => add('decompte', ['rim', 0, p, 0, 1, k === 0 ? 1 : 0.75]));

    // INTRO : batterie et cocotte, puis basse et Rhodes ; les cuivres annoncent le couplet
    for (let m = 0; m < 4; m++) {
      const c = CH.Em9; kick('intro', m, 'a'); caisse('intro', m, [m % 2 ? 'J1' : 'J2', 'J2'], m === 3); HH('intro', m, m % 2 === 1); cocotte('intro', m, c);
      if (m >= 2) { basse('intro', m, c, c, m === 3); rhodes('intro', m, c, c); }
    }
    stab('intro', 3, 12, CH.Em9, 0.6, 0.8, 'C2'); stab('intro', 3, 14, CH.Em9, 1.5, 1, 'C1');

    // COUPLET : basse + cocotte + Rhodes, et le « pa-PAH » des cuivres toutes les deux mesures
    const couplet = (sec, k) => COUPLET.forEach((nom, m) => {
      const c = tr(CH[nom], k), cn = tr(CH[COUPLET[(m + 1) % 8]], k);
      kick(sec, m, 'a'); caisse(sec, m, ['J1', 'J2'], m === 7); HH(sec, m, m % 2 === 1); if (m === 7) fillToms(sec, m);
      basse(sec, m, c, cn, m % 4 === 3); cocotte(sec, m, c); rhodes(sec, m, c, cn);
      if (m % 2 === 1 && m < 7) { stab(sec, m, 10, c, 0.6, 0.78, 'C2'); stab(sec, m, 12, c, 2, 1, 'C1'); }
      if (m === 7) { stab(sec, m, 0, c, 1.2, 1, 'C1'); stab(sec, m, 3, c, 0.6, 0.8, 'C3'); stab(sec, m, 6, c, 1.5, 0.95, 'C2'); }
      transe(sec, m, c, false);
    });
    couplet('A', 0);

    // REFRAIN : le hook aux trompettes et trombones, batterie plus dense, crash en tête
    const refrain = (sec, k, octave) => {
      REFRAIN.forEach((nom, m) => {
        const c = tr(CH[nom], k), cn = tr(CH[REFRAIN[(m + 1) % 8]], k);
        kick(sec, m, 'b'); caisse(sec, m, ['J1', 'J1'], m === 7); HH(sec, m, m % 2 === 1); if (m === 7) fillToms(sec, m);
        basse(sec, m, c, cn, m % 2 === 1); rhodes(sec, m, c, cn); if (m % 2 === 0) cocotte(sec, m, c);
        transe(sec, m, c, true);
      });
      add(sec, ['crash', 0, 0, 0, 16, 0.85], ['crash', 4, 0, 0, 16, 0.7]);
      hook(sec, 0, HOOK, k, octave); hook(sec, 4, HOOK2, k, octave);
    };
    refrain('B', 0, false);

    // BREAK : stop-time, toute la section frappe ensemble sur 1 et sur le « et » de 2 ; le charley ne lâche jamais
    for (let m = 0; m < 4; m++) {
      const c = CH.Em9, hits = m === 3 ? [0, 3, 6, 10, 12, 14] : [0, 6];
      for (let p = 0; p < 16; p += 2) add('pause', ['hh', m, p, 0, 1, p % 4 === 0 ? 0.6 : 0.35]);
      add('pause', ['rim', m, 4, 0, 1, 0.6], ['rim', m, 12, 0, 1, 0.6]);
      hits.forEach((p, i) => {
        add('pause', ['kick', m, p, 36, 2, 1], ['basse', m, p, 40, p === 0 ? 3 : 1.5, 1]);
        stab('pause', m, p, c, p === 0 ? 2.5 : 1.2, 1, p === 0 ? 'C1' : 'C' + (2 + (i % 2)));
      });
      if (m === 3) [[12, 0.5], [13, 0.6], [14, 0.75], [15, 0.9]].forEach(([p, v]) => add('pause', ['caisse', m, p, 0, 1, v]));
    }
    add('pause', ['crash', 0, 0, 0, 16, 0.6]);

    // FINAL : le refrain monte d'un ton, trompette à l'octave dans la couche transe
    refrain('final', 2, true);

    // FIN : coup de section en mi 9, roulement, puis le dernier coup sec
    add('fin', ['kick', 0, 0, 36, 2, 1], ['crash', 0, 0, 0, 16, 1], ['basse', 0, 0, 40, 6, 1]);
    stab('fin', 0, 0, CH.E9, 6, 1, 'C1');
    for (let p = 8; p < 16; p++) add('fin', ['caisse', 0, p, 0, 1, 0.35 + (p - 8) * 0.08]); fillToms('fin', 0);
    add('fin', ['kick', 1, 0, 36, 2, 1], ['crash', 1, 0, 0, 16, 1], ['basse', 1, 0, 40, 2, 1], ['caisse', 1, 0, 0, 2, 1, 'J1']);
    stab('fin', 1, 0, CH.E7s9, 2, 1, 'C1');
    [76, 71, 64].forEach(n => add('fin', ['tp', 1, 0, n, 2, 1]));

    return {
      bpm: 106, sig: [4, 4], swing: 0.56, humain: 5, graine: 11, pistes: true,
      salle: { taille: 0.45, amorti: 0.55, niveau: 0.5, predelai: 0.012 },
      instruments: {
        kick: { type: 'kick', vol: 0.508, groupe: 'base' },
        caisse: { type: 'caisse', vol: 0.295, retard: 8, groupe: 'base' },
        hh: { type: 'charley', vol: 0.107, pan: 0.2, choke: 'hh', groupe: 'base' }, hho: { type: 'charley_ouvert', vol: 0.09, pan: 0.2, choke: 'hh', groupe: 'base' },
        rim: { type: 'rim', vol: 0.369, humain: false, groupe: 'base' },
        tom: { type: 'tom', vol: 0.246, groupe: 'base' }, crash: { type: 'crash', vol: 0.09, groupe: 'base' },
        basse: { type: 'basse', vol: 0.41, wah: 0.6, drive: 0.25, groupe: 'base' },
        gt: { type: 'guitare', vol: 0.164, pan: -0.35, etouffe: 0.8, groupe: 'base' },
        rh: { type: 'rhodes', vol: 0.197, pan: 0.25, verb: 0.2, humain: false, groupe: 'base' },
        stab: { type: 'cuivres_stab', vol: 0.23, etale: 0.3, groupe: 'base' },
        tp: { type: 'trompettes', vol: 0.246, pan: 0.15, groupe: 'base' },
        tb: { type: 'trombones', vol: 0.213, pan: -0.15, groupe: 'base' },
        tp8: { type: 'trompettes', vol: 0.131, pan: 0.3, groupe: 'transe' },
        shk: { type: 'shaker', vol: 0.066, pan: 0.45, groupe: 'transe' },
        conga: { type: 'tom', vol: 0.131, pan: -0.4, groupe: 'transe' },
        clap: { type: 'clap', vol: 0.131, groupe: 'transe' },
        vn: { type: 'violons', vol: 0.074, pan: -0.2, groupe: 'transe' },
      },
      sections: {
        decompte: { mesures: 1, notes: N.decompte }, intro: { mesures: 4, notes: N.intro }, A: { mesures: 8, notes: N.A },
        B: { mesures: 8, notes: N.B }, pause: { mesures: 4, notes: N.pause }, final: { mesures: 8, notes: N.final }, fin: { mesures: 2, notes: N.fin },
      },
      forme: ['decompte', 'intro', 'A', 'B', 'pause', 'A', 'B', 'final', 'fin'],
      // pour le jeu : nom et intensité de chaque section
      jeu: { decompte: null, intro: ['Intro', 0], A: ['Couplet', 1], B: ['Refrain', 2], pause: ['Pause', 'rest'], final: ['Final', 3], fin: ['Fin', 'rest'] },
    };
  };
})();
