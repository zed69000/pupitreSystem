/* ═══════════════════════════════════════════════════════════════════════════
   BEAT SPLASH · « Robots de minuit » — SYNTHWAVE DE NUIT, deux variantes à écouter (page ecoute.html)

   IDENTITÉ MUSICALE — Beat Splash / Robots de minuit
   Rôle :               PREMIER niveau : couper et taper ; pulsation lisible (kick sur chaque temps, caisse sur 2 et 4)
   Émotion et énergie : conduite de nuit SOMBRE qui accélère (Seb : « plus dark ») ; des vagues : ça monte, ça explose, ça retombe, ça remonte plus haut
   Style de référence : synthwave / outrun (nappe de fond large, basse en croches qui pompe, caisse claire réverbérée,
                        lead doux, chœur aérien, montées de caisse claire et de supersaw) — rien de copié
   Tempo / métrique :   112 BPM, 4/4 droit
   Tonalité / mode :    do# mineur ; le final monte en ré# mineur (un ton plus haut) après l'« envol »
   Courbe d'énergie (sur 10) :
     décompte 1 · intro 3 · couplet 4 · MONTÉE 5→8 (trou d'un temps) · REFRAIN 8 · pause 3 (retombée) ·
     couplet dense 5 · MONTÉE 5→8 · REFRAIN 8 · ENVOL 4→9 (tout tombe, une note tenue, la supersaw grimpe, trou) ·
     FINAL 10 (un ton plus haut, tout doublé) · fin
   Harmonie :           couplet  C#m9 ×2 · Amaj7 ×2 · F#m9 ×2 · G#7sus4 ×2 ; montée F#m9 ×2 · G#7sus4 ×2
                        refrain  C#m9 · Amaj7 · F#m9 · G#m7 · C#m9 · Amaj7 · F#m9 · G#7 (i bVI iv v, sensible si# à la fin) ; envol Bmaj7 · A#7sus4 (pivot)
   Interdits (Seb) :    talkbox / trompette, Rhodes, guitare étouffée, claps de décompte (« tap tap »)
   Variantes :
     robots_d1 « Nuit » : lead doux en triangle ; l'arpège entre au couplet dense
     robots_d2 « Néon » : lead carré filtré, arpège dès l'intro, supersaw plus large
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const M = window.K7M;
  const niv = p => p === 0 ? 1 : p % 4 === 0 ? 2 : 3;
  const T = (arr, m) => arr.map(([p, n, d]) => [m, p, n, d]);
  // refrain : un motif rythmé (court-court-long), qui monte par paliers jusqu'au sommet de la mesure 6
  const HOOK = [
    ...T([[0, 68, 3], [3, 71, 1], [4, 73, 2], [6, 71, 2], [8, 68, 4], [12, 64, 4]], 0),                // C#m9 : grave, il tourne
    ...T([[0, 69, 3], [3, 68, 1], [4, 64, 2], [6, 68, 2], [8, 73, 8]], 1),                             // Amaj7
    ...T([[0, 73, 3], [3, 76, 1], [4, 73, 2], [6, 69, 2], [8, 68, 4], [12, 66, 4]], 2),                // F#m9
    ...T([[0, 66, 3], [3, 68, 1], [4, 71, 2], [6, 75, 2], [8, 71, 8]], 3),                             // G#m7
    ...T([[0, 68, 3], [3, 71, 1], [4, 73, 2], [6, 76, 2], [8, 80, 4], [12, 76, 4]], 4),                // C#m9 : il grimpe
    ...T([[0, 81, 3], [3, 80, 1], [4, 76, 2], [6, 80, 2], [8, 81, 8]], 5),                             // Amaj7 : le sommet sur la (6e mineure, sombre)
    ...T([[0, 80, 3], [3, 76, 1], [4, 73, 2], [6, 69, 2], [8, 73, 4], [12, 76, 4]], 6),                // F#m9
    ...T([[0, 75, 8], [8, 72, 4], [12, 68, 4]], 7),                                                    // G#7 : la sensible si#, tension
  ];
  const PHRASE = {0: [68, 71, 73, 76], 2: [69, 73, 76, 80], 4: [66, 69, 73, 76], 6: [68, 73, 78, 75]};
  const MONTEE = [[66, 69, 73, 76], [69, 73, 76, 80], [73, 75, 78, 80]];   // le lead grimpe, une note par temps

  function robots(style){
    const neon = style === 'neon', {N, add} = M.cahier(), A = (n, k) => M.acc(n, k || 0), H = {};
    const tr = (noms, k) => noms.map(n => A(n, k));
    // ─── batterie ───
    const beat = (sec, m, tags, o) => { o = o || {};
      if(!o.sansKick) [0, 4, 8, 12].forEach(p => add(sec, ['kick', m, p, 36, 2, p ? .85 : 1]));
      if(!o.sansCaisse) add(sec, ['sn', m, 4, 0, 1, .95, tags[0]], ['sn', m, 12, 0, 1, .95, tags[1]]);
      if(o.clap) add(sec, ['cl', m, 4, 0, 1, .8], ['cl', m, 12, 0, 1, .8]);
      const hh = o.hats == null ? 2 : o.hats; if(hh) for(let p = 0; p < 16; p += hh) add(sec, ['hh', m, p, 0, 1, p % 4 === 2 ? .5 : p % 2 ? .22 : .32]);
      if(o.ouvert) [2, 6, 10, 14].forEach(p => add(sec, ['hho', m, p, 0, 2, .45]));
      if(o.fill) [12, 13, 14, 15].forEach((p, i) => add(sec, ['tom', m, p, 50 - i*4, 1, .6 + i*.1]));
    };
    const basse = (sec, m, c, oct, jusqua) => { const r = M.ton(c, 0, 37);
      for(let p = 0; p < (jusqua || 16); p += 2) add(sec, ['bs', m, p, oct && p % 4 === 2 ? r + 12 : r, 1.6, p % 4 === 0 ? 1 : .75]); };
    let vP = null;
    const fond = (sec, m, c, vol) => { vP = M.voix(vP, c, [0, 1, 2, 3, c.iv.length > 4 ? 4 : 0], 47, 67); vP.forEach(n => add(sec, ['pad', m, 0, n, 16, (vol || 1)*.7])); };
    const choeur = (sec, m, c, vol) => M.voix(null, c, [1, 2, 3], 55, 71).forEach(n => add(sec, ['ch', m, 0, n, 16, (vol || 1)*.6]));
    const large = (sec, m, c, vol) => M.voix(null, c, [1, 2, 3], 64, 79).forEach(n => add(sec, ['large', m, 0, n, 16, (vol || 1)*.6]));
    const arp = (sec, m, c, pas, vol) => { const S = [0, 1, 2, 4, 2, 1, 2, 3, 0, 1, 2, 4, 5, 4, 2, 1]; pas = pas || 2;
      for(let p = 0; p < 16; p += pas) add(sec, ['arp', m, p, M.ton(c, S[p], 61), pas === 1 ? .9 : 1.5, (p % 4 === 0 ? .65 : .45)*(vol || 1)]); };
    const hook = (sec, k, plus, octave, sauf7) => HOOK.forEach(([m, p, n, d]) => { if(sauf7 && m === 7) return;
      add(sec, ['lead', m, p, n + k, d, p === 0 ? 1 : .86, 'C' + Math.min(4, niv(p) + (plus || 0))]); if(octave) add(sec, ['ldo', m, p, n + k - 12, d, .55]); });

    // DÉCOMPTE : la nappe qui monte (pas de claps)
    H.decompte = [A('C#:m9')]; fond('decompte', 0, H.decompte[0], .6);
    // INTRO : nappe, basse au 2e, batterie au 3e
    H.intro = tr(['C#:m9', 'C#:m9', 'A:maj7', 'A:maj7']);
    H.intro.forEach((c, m) => { fond('intro', m, c); if(m >= 1) basse('intro', m, c); if(m >= 2) beat('intro', m, ['J1', 'J1'], {hats: m < 3 ? 0 : 2, fill: m === 3}); if(neon && m >= 2) arp('intro', m, c, 2, .8); });
    // COUPLET (et couplet dense) : le lead pose sa phrase, le chœur répond
    const couplet = (sec, dense) => { H[sec] = tr(['C#:m9', 'C#:m9', 'A:maj7', 'A:maj7', 'F#:m9', 'F#:m9', 'G#:7sus4', 'G#:7sus4']);
      H[sec].forEach((c, m) => { beat(sec, m, ['J1', 'J2'], {hats: dense ? 1 : 2, ouvert: dense, fill: m === 7}); basse(sec, m, c, dense); fond(sec, m, c, .9);
        if(m === 0) add(sec, ['cr', 0, 0, 0, 16, .5]);
        if(neon || dense) arp(sec, m, c, dense ? 1 : 2, dense ? .8 : 1);
        if(m % 2 === 0) PHRASE[m].forEach((n, i) => add(sec, ['lead', m, [0, 2, 4, 8][i], n, [2, 2, 4, 8][i], i ? .86 : 1, 'C' + Math.min(4, [1, 3, 2, 2][i] + (dense ? 0 : 1))]));
        else { choeur(sec, m, c, .8); add(sec, ['ch', m, 4, M.ton(c, 2, 66), 4, .6], ['ch', m, 8, M.ton(c, 1, 66), 8, .55]); if(dense) large(sec, m, c, .6); } }); };
    couplet('A', false); couplet('A2', true);
    // MONTÉE : la caisse claire se resserre (noires, croches, doubles), le lead grimpe, la supersaw monte ; un temps de silence
    H.montee = tr(['F#:m9', 'F#:m9', 'G#:7sus4', 'G#:7']);
    H.montee.forEach((c, m) => { fond('montee', m, c); large('montee', m, c, .4 + m*.2);
      if(m < 3){ [0, 4, 8, 12].forEach(p => add('montee', ['kick', m, p, 36, 2, p ? .85 : 1])); basse('montee', m, c, m >= 1); }
      else { for(let p = 0; p < 12; p += 2) add('montee', ['kick', m, p, 36, 1, .7 + p*.025]); basse('montee', m, c, true, 12); }
      add('montee', ['sn', m, 4, 0, 1, .95, 'J1']); if(m < 3) add('montee', ['sn', m, 12, 0, 1, .95, 'J2']);
      const pas = [4, 2, 1, 1][m]; for(let p = 0; p < (m === 3 ? 12 : 16); p += pas) if(p !== 4 && p !== 12) add('montee', ['sn', m, p, 0, 1, .25 + m*.12 + p*.012]);
      for(let p = 0; p < (m === 3 ? 12 : 16); p++) add('montee', ['hh', m, p, 0, 1, p % 4 === 0 ? .4 : .22]);
      if(m < 3) MONTEE[m].forEach((n, i) => add('montee', ['lead', m, i*4, n, 4, .9, 'C' + (i ? 2 : 1)]));
      else add('montee', ['lead', m, 0, 80, 10, 1, 'C1']);
      if(m >= 2) for(let p = 0; p < (m === 3 ? 12 : 16); p += 2) add('montee', ['rise', m, p, M.ton(c, Math.floor(((m - 2)*16 + p)/2) % 8, 61), 1.5, .4 + ((m - 2)*16 + p)*.012]); });
    // REFRAIN : tout s'ouvre
    const refrain = (sec, k, fort) => { H[sec] = tr(['C#:m9', 'A:maj7', 'F#:m9', 'G#:m7', 'C#:m9', 'A:maj7', 'F#:m9', 'G#:7'], k);
      H[sec].forEach((c, m) => { beat(sec, m, ['J1', 'J1'], {hats: fort ? 1 : 2, ouvert: true, clap: fort, fill: m === 7 && !fort}); basse(sec, m, c, true); fond(sec, m, c); choeur(sec, m, c); large(sec, m, c, fort ? 1 : .8);
        arp(sec, m, c, fort ? 1 : 2); if(m === 0 || (fort && m === 4)) add(sec, ['cr', m, 0, 0, 16, .65]); });
      hook(sec, k, 0, fort, fort);
      if(fort) [[0, 80, 4], [4, 78, 4], [8, 75, 4], [12, 72, 4]].forEach(([p, n, d], i) => add(sec, ['lead', 7, p, n + k, d, .9, 'C' + (i ? 2 : 1)], ['ldo', 7, p, n + k - 12, d, .55]));
    };
    refrain('B', 0, false);
    // PAUSE (la retombée) : plus de kick ni de basse qui pulse, la nappe et le chœur flottent ; le kick revient à la fin
    H.pause = tr(['A:maj7', 'F#:m9', 'G#:m7', 'G#:7']);
    H.pause.forEach((c, m) => { fond('pause', m, c); choeur('pause', m, c); add('pause', ['bs', m, 0, M.ton(c, 0, 37), 16, .7]);
      add('pause', ['sn', m, 12, 0, 1, .7, 'J2'], ['lead', m, 8, M.ton(c, 2, 66), 3, .9, 'C1'], ['lead', m, 12, M.ton(c, 1, 66), 3, .8, 'C2']);
      if(m >= 2) arp('pause', m, c, 2, .6);
      if(m === 3) [8, 10, 12, 13, 14, 15].forEach((p, i) => add('pause', ['kick', m, p, 36, 1, .5 + i*.08])); });
    // ENVOL : tout tombe, une note tenue, la supersaw grimpe deux octaves, la caisse claire roule, un temps de silence… et on monte d'un ton
    H.envol = tr(['B:maj7', 'A#:7sus4']);
    H.envol.forEach((c, m) => { fond('envol', m, c, 1.1); choeur('envol', m, c, 1.1);
      add('envol', ['kick', m, 0, 36, 2, 1], ['kick', m, 8, 36, 2, .8], ['sn', m, 4, 0, 1, .9, 'J1']);
      for(let p = 0; p < (m ? 12 : 16); p++) add('envol', ['rise', m, p, M.ton(c, Math.floor((m*16 + p)*9/28), 61), 1, .35 + (m*16 + p)*.015]);
      if(m === 1){ for(let p = 0; p < 12; p++) add('envol', ['sn', m, p, 0, 1, .3 + p*.05]); } });
    add('envol', ['lead', 0, 0, 83, 16, 1, 'C1'], ['lead', 1, 0, 82, 10, 1, 'C1']);
    // FINAL : un ton plus haut, tout doublé
    refrain('final', 2, true);
    // FIN : en ré# mineur, la nappe tenue, le lead se pose
    H.fin = tr(['C#:m9', 'C#:m9'], 2); const cf = H.fin[0];
    fond('fin', 0, cf); fond('fin', 1, cf, .7); choeur('fin', 0, cf); large('fin', 0, cf);
    add('fin', ['kick', 0, 0, 36, 2, 1], ['sn', 0, 4, 0, 1, .9, 'J1'], ['cr', 0, 0, 0, 16, .7], ['bs', 0, 0, 39, 16, 1],
      ['lead', 0, 0, 78, 4, .9, 'C1'], ['lead', 0, 4, 77, 4, .86, 'C2'], ['lead', 0, 8, 75, 8, 1, 'C1'], ['lead', 1, 0, 75, 8, .8, 'C2']);

    const ins = {
      kick: {type: 'kick', vol: .5, f0: 115, f1: 45, groupe: 'base'},
      sn: {type: 'caisse', vol: .25, verb: .7, joueur: true, groupe: 'base'},
      cl: {type: 'clap', vol: .14, verb: .5, groupe: 'base'},
      hh: {type: 'charley', vol: .1, pan: .25, groupe: 'base'}, hho: {type: 'charley_ouvert', vol: .11, pan: -.25, groupe: 'base'},
      tom: {type: 'tom', vol: .28, verb: .5, groupe: 'base'},
      cr: {type: 'crash', vol: .06, verb: .5, groupe: 'base'},
      bs: {type: 'synth_basse', filtre: neon ? 800 : 560, sub: .8, vol: .44, groupe: 'base'},
      pad: {type: 'nappe', vol: .13, verb: .55, groupe: 'base'},
      ch: {type: 'choeur', voyelle: 'o', vol: .09, verb: .6, groupe: 'base'},
      large: {type: 'supersaw', filtre: neon ? 2000 : 1400, filtreBas: 1200, vol: neon ? .05 : .04, verb: .5, groupe: 'base'},
      rise: {type: 'synth_pluck', onde: 'scie', voix: 3, desaccord: 14, filtre: 2600, vol: .07, pan: -.2, verb: .5, groupe: 'base'},
      arp: {type: 'synth_pluck', filtre: 2200, vol: .065, pan: .3, verb: .45, groupe: 'base'},
      lead: neon ? {type: 'synth_lead', onde: 'carre', largeur: .4, voix: 2, desaccord: 7, filtre: 1800, filtreBas: 900, balayage: .05, attaque: .02, vibrato: .06, vibratoApres: .3, vol: .19, verb: .5, joueur: true, groupe: 'base'}
                 : {type: 'synth_lead', onde: 'triangle', voix: 2, desaccord: 6, filtre: 2200, filtreBas: 1500, balayage: .02, attaque: .025, vibrato: .07, vibratoApres: .3, vol: .28, verb: .55, joueur: true, groupe: 'base'},
      ldo: {type: 'choeur', voyelle: 'a', vol: .07, verb: .6, groupe: 'base'},
      ss: {type: 'supersaw', vol: .07, verb: .5, groupe: 'transe'},
    };
    // la transe double le lead à l'octave (couches allumées par le combo)
    for(const sec of ['B', 'final']) HOOK.forEach(([m, p, n, d]) => add(sec, ['ss', m, p, n + (sec === 'final' ? 2 : 0) + 12, d, .5]));
    const D = M.gamme('D#', 'eolien');
    return M.frappes({
      bpm: 112, sig: [4, 4], swing: .5, humain: 4, graine: 86, pistes: true, pompe: true,
      salle: {taille: .9, amorti: .6, niveau: .65, predelai: .03}, instruments: ins,
      sections: {
        decompte: {mesures: 1, notes: N.decompte}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A}, montee: {mesures: 4, notes: N.montee},
        B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, A2: {mesures: 8, notes: N.A2}, envol: {mesures: 2, notes: N.envol},
        final: {mesures: 8, notes: N.final}, fin: {mesures: 2, notes: N.fin},
      },
      forme: ['decompte', 'intro', 'A', 'montee', 'B', 'pause', 'A2', 'montee', 'B', 'envol', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0, 'CJ'], A: ['Couplet', 1, 'CJ'], montee: ['Montée', 1, 'CJ'], B: ['Refrain', 2, 'CJ'], pause: ['Pause', 'rest', 'CJ'],
        A2: ['Couplet', 2, 'CJ'], envol: ['Envol', 1, 'CJ'], final: ['Final', 3, 'CJ'], fin: ['Fin', 'rest', 'CJ']},
      harmonie: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, M.harmonie(v)])),
      gamme: M.gamme('C#', 'eolien'), gammes: {envol: D, final: D, fin: D},
    }, {C: {instr: {type: 'caisse', vol: .2, verb: .25}}});
  }
  window.K7PARTITIONS.robots_d1 = () => robots('nuit');
  window.K7PARTITIONS.robots_d2 = () => robots('neon');
})();
