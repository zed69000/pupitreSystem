/* Beat Splash · aide d'écriture commune aux partitions Pupitre (js/musique/*.js).
   Accords nommés, harmonie mesure par mesure (lue par le jeu pour accorder les voix), voicings conduits, batterie. */
(function(){
  const ROOT = {C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11};
  // intervalles depuis la fondamentale, dans l'ordre fond., tierce, quinte, septième, extensions
  const Q = {maj: [0, 4, 7], min: [0, 3, 7], m: [0, 3, 7], 5: [0, 7], sus2: [0, 2, 7], sus4: [0, 5, 7], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9],
    69: [0, 4, 7, 9, 14], add9: [0, 4, 7, 14], madd9: [0, 3, 7, 14], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], 7: [0, 4, 7, 10],
    maj9: [0, 4, 7, 11, 14], m9: [0, 3, 7, 10, 14], 9: [0, 4, 7, 10, 14], 13: [0, 4, 7, 10, 14, 21], m11: [0, 3, 7, 10, 14, 17],
    '7s9': [0, 4, 7, 10, 15], '7b9': [0, 4, 7, 10, 13], m7b5: [0, 3, 6, 10], dim: [0, 3, 6], dim7: [0, 3, 6, 9], aug: [0, 4, 8], '7sus4': [0, 5, 7, 10]};
  // 'E:m9' → {fond: 4, pcs: [4, 7, 11, 2, 6], iv: [0, 3, 7, 10, 14]}
  function acc(nom, k){
    const [r, q] = nom.split(':'), f = (ROOT[r] + (k || 0)) % 12, iv = Q[q || 'maj'];
    if(f == null || isNaN(f) || !iv) throw new Error('Accord inconnu : ' + nom);
    return {nom, fond: f, iv, pcs: iv.map(x => (f + x) % 12)};
  }
  const MODES = {ionien: [0, 2, 4, 5, 7, 9, 11], dorien: [0, 2, 3, 5, 7, 9, 10], phrygien: [0, 1, 3, 5, 7, 8, 10], lydien: [0, 2, 4, 6, 7, 9, 11],
    mixolydien: [0, 2, 4, 5, 7, 9, 10], eolien: [0, 2, 3, 5, 7, 8, 10], harmonique: [0, 2, 3, 5, 7, 8, 11], penta: [0, 2, 4, 7, 9]};
  const gamme = (tonique, mode) => MODES[mode].map(x => (ROOT[tonique] + x) % 12);

  // un cahier de notes par section
  function cahier(){ const N = {}; const add = (sec, ...ns) => { for(const n of ns) (N[sec] = N[sec] || []).push(n); }; return {N, add}; }
  // la note de classe de hauteur pc la plus proche de 'pres', entre lo et hi
  function proche(pc, pres, lo, hi){ let best = null; for(let m = lo; m <= hi; m++) if(((m - pc) % 12 + 12) % 12 === 0 && (best == null || Math.abs(m - pres) < Math.abs(best - pres))) best = m; return best; }
  // la k-ième note de l'accord au-dessus de 'base' (k = 0 fondamentale, 1 tierce, 2 quinte, 3 septième ; au-delà, octave)
  function ton(c, k, base){ const n = c.iv.length >= 4 ? 4 : c.iv.length, o = Math.floor(k/n), i = ((k % n) + n) % n; let m = base + ((c.fond - base) % 12 + 12) % 12; return m + c.iv[i] + 12*o; }
  // voicing conduit : place les notes choisies de l'accord au plus près du voicing précédent
  // (une note demandée que l'accord n'a pas — la septième d'un accord de trois sons — devient la fondamentale)
  function voix(prec, c, choix, lo, hi){ const pcs = [...new Set(choix.map(k => (c.fond + (c.iv[k] == null ? 0 : c.iv[k])) % 12))]; return window.PupitreEcriture.conduire(prec, pcs, lo, hi); }
  // rythme en texte → notes : X accent, x normal, g fantôme, o ouvert
  function motif(add, sec, instr, m, txt, midi, vels, tags){ [...txt].forEach((ch, p) => { const v = (vels || {X: 1, x: .72, g: .2, o: .75})[ch]; if(v != null) add(sec, [instr, m, p, midi, ch === 'o' ? 2 : 1, v, tags && tags[p]]); }); }
  // charley en doubles croches avec accents naturels (fort sur le temps, moyen sur le « et », doux entre)
  function charley(add, sec, m, instr, o){ o = o || {}; for(let p = 0; p < 16; p += o.pas || 1){ if(o.ouvert && p === o.ouvert){ add(sec, [o.instrOuvert || 'hho', m, p, 0, 2, .7]); continue; }
    add(sec, [instr || 'hh', m, p, 0, 1, (p % 4 === 0 ? .7 : p % 2 === 0 ? .5 : .28)*(o.vol || 1)]); } }
  // harmonie pour le jeu : liste d'accords par mesure → [[fond, pcs], …]
  const harmonie = liste => liste.map(c => [c.fond, c.pcs]);

  // sons de frappe : ce que tu entends AU MOMENT de ton geste, en plus de ta note. Chaque brique a sa famille de son,
  // la même dans tous les morceaux (on la reconnaît) ; un morceau peut changer le timbre, pas la famille.
  // C couper = claquement sec · G diagonale = souffle · J cœur = battement grave · D deux doigts = frappe double · H tenue = scintillement.
  // Percussions sans hauteur fixe : elles ne sonnent jamais faux.
  const FRAPPES = {
    C: {instr: {type: 'rim', vol: .3}},
    G: {instr: {type: 'charley_ouvert', vol: .18, tenue: .22}},
    J: {instr: {type: 'kick', vol: .32, f0: 95, f1: 50, tenue: .35}},
    D: {instr: {type: 'clap', vol: .24}},
    H: {instr: {type: 'ride', vol: .12}},
  };
  function frappes(P, def){ P.sons = P.sons || {}; P.frappe = {}; const g = P.pistes ? 'base' : undefined, D = Object.assign({}, FRAPPES, def || {});
    for(const [k, d] of Object.entries(D)){ const nom = 'fr' + k; P.instruments[nom] = Object.assign(g ? {groupe: g} : {}, d.instr); P.sons[nom] = [nom, d.midi || 60, d.dur || 1, d.vel || .9]; P.frappe[k] = nom; }
    return P; }
  /* Gabarit d'un morceau de Beat Splash : la forme commune (décompte · intro 4 · couplet 8 · [apprentissage 4] ·
     refrain 8 · pause 4 · couplet 8 · refrain 8 · final 8 (transposé) · fin 2), l'harmonie, les gestes par section et les
     sons de frappe. Le morceau fournit ce qui le rend unique : accords, groove de chaque mesure, hook, instruments.
     cfg : bpm, swing, swingSur, humain, graine, salle, pompe, cle: ['A', 'ionien'], final (transposition du final),
     intro[4], couplet[8], refrain[8], pause[4], fin[2] (noms d'accords ; la fin est jouée dans la tonalité du final),
     decompte(add), introM / coupletM / refrainM(add, sec, m, c, cn, fort) / pauseM (une mesure chacune), finM(add, H.fin),
     apprend: {nom, gestes, accords[4], mesure(add, sec, m, c, cn)}, lead: instrument du hook, leadOctave (transe),
     hook: [[mesure, pas, midi, durée, 'C1' | 'H2' …]], gestesRefrain: [[mesure, pas, durée, 'S1' …]] (marques silencieuses),
     gestes: {A, B, final} (gestes permis), instruments, frappe (variantes des sons de frappe), finalMesures (8 par défaut) */
  function chanson(cfg){
    const {N, add} = cahier(), H = {}, k = cfg.final || 0, fm = cfg.finalMesures || 8;
    const tr = (noms, kk) => noms.map(n => acc(n, kk || 0));
    H.decompte = [acc(cfg.intro[0])]; cfg.decompte(add);
    H.intro = tr(cfg.intro); H.intro.forEach((c, m) => cfg.introM(add, 'intro', m, c, H.intro[(m + 1) % 4]));
    H.A = tr(cfg.couplet); H.A.forEach((c, m) => cfg.coupletM(add, 'A', m, c, H.A[(m + 1) % 8]));
    if(cfg.apprend){ H.apprend = tr(cfg.apprend.accords); H.apprend.forEach((c, m) => cfg.apprend.mesure(add, 'apprend', m, c, H.apprend[(m + 1) % 4])); }
    const refrain = (sec, kk, fort, n) => { const off = 8 - n, harm = tr(cfg.refrain, kk).slice(off); H[sec] = harm;
      harm.forEach((c, m) => cfg.refrainM(add, sec, m, c, harm[(m + 1) % harm.length], fort));
      // (un final plus court reprend la fin du refrain)
      cfg.hook.forEach(([m, p, nn, d, tag]) => { if(m < off) return; m -= off; add(sec, [cfg.lead, m, p, nn + kk, d, tag[0] === 'H' ? .9 : tag[1] === '1' ? 1 : .86, tag]); if(fort && cfg.leadOctave) add(sec, [cfg.leadOctave, m, p, nn + kk + 12, d, .5]); });
      (cfg.gestesRefrain || []).forEach(([m, p, d, tag]) => { if(m >= off) add(sec, ['scr', m - off, p, 60, d, .5, tag]); });
    };
    refrain('B', 0, false, 8);
    H.pause = tr(cfg.pause); H.pause.forEach((c, m) => cfg.pauseM(add, 'pause', m, c, H.pause[(m + 1) % 4]));
    refrain('final', k, true, fm);
    H.fin = tr(cfg.fin, k); cfg.finM(add, H.fin);
    const g = cfg.gestes || {}, sections = {decompte: {mesures: 1, notes: N.decompte || []}, intro: {mesures: 4, notes: N.intro}, A: {mesures: 8, notes: N.A},
      B: {mesures: 8, notes: N.B}, pause: {mesures: 4, notes: N.pause}, final: {mesures: fm, notes: N.final}, fin: {mesures: 2, notes: N.fin}};
    if(cfg.apprend) sections.apprend = {mesures: 4, notes: N.apprend};
    const forme = ['decompte', 'intro', 'A'].concat(cfg.apprend ? ['apprend'] : [], ['B', 'pause', 'A', 'B', 'final', 'fin']);
    const ins = Object.assign({}, cfg.instruments); if(!ins.scr) ins.scr = {type: 'rim', vol: .001, joueur: true, groupe: 'base'};
    const G0 = gamme(cfg.cle[0], cfg.cle[1]), Gk = G0.map(x => (x + k) % 12);
    const P = {bpm: cfg.bpm, sig: [4, 4], swing: cfg.swing || .5, swingSur: cfg.swingSur || 16, humain: cfg.humain ?? 5, graine: cfg.graine || 1, pistes: true, pompe: !!cfg.pompe,
      salle: cfg.salle || {taille: .5, amorti: .5, niveau: .5, predelai: .015}, instruments: ins, sections, forme,
      jeu: {decompte: null, intro: ['Intro', 0, 'CJ'], A: ['Couplet', 1, g.A || 'CJ'], B: ['Refrain', 2, g.B || 'CJ'], pause: ['Pause', 'rest', 'C'], final: ['Final', 3, g.final || g.B || 'CJ'], fin: ['Fin', 'rest', 'CJ']},
      harmonie: Object.fromEntries(Object.entries(H).map(([kk, v]) => [kk, harmonie(v)])), gamme: G0, gammes: {final: Gk, fin: Gk}};
    if(cfg.apprend) P.jeu.apprend = [cfg.apprend.nom, 0, cfg.apprend.gestes];
    return frappes(P, cfg.frappe);
  }
  // mélodie tirée des notes de l'accord de chaque mesure : motifs = [[pas, durée, note de l'accord (0 fond., 1, 2, 3, 4 = octave…), geste]],
  // un motif par mesure (en boucle) ; elle ne peut pas sonner faux, le rythme et le contour lui donnent son caractère
  function hookAuto(noms, base, motifs){ const out = []; noms.forEach((n, m) => { const c = acc(n); motifs[m % motifs.length].forEach(([p, d, i, tag]) => out.push([m, p, ton(c, i, base), d, tag])); }); return out; }
  // batterie en texte : spec = {instr: 'motif de 16 pas', …} ; X accent, x normal, g fantôme ; tags = {instr: {pas: 'J1'}}
  function batt(add, sec, m, spec, tags){ for(const [ins, txt] of Object.entries(spec)) [...txt].forEach((ch, p) => { const v = {X: 1, x: .75, g: .2, o: .7}[ch]; if(v != null) add(sec, [ins, m, p, ins === 'kick' ? 36 : 0, ch === 'o' ? 2 : 1.5, v, tags && tags[ins] && tags[ins][p]]); }); }
  // écho écrit en notes : la note revient « fois » fois, tous les « pas », de moins en moins fort (le delay des musiques électroniques,
  // sans effet à calculer : il fait partie de la partition, donc il est toujours calé sur le tempo)
  function echo(add, sec, n, fois, pas, att){ const [ins, m, p, midi, d, v, , o] = n; for(let k = 1; k <= (fois || 2); k++){ const q = p + k*(pas || 3); add(sec, [ins, m + Math.floor(q/16), q % 16, midi, Math.min(d, 1.5), v*Math.pow(att || .5, k), undefined, o]); } }      // échos courts : ils ne tiennent pas sur l'accord suivant
  /* Gabarit d'un morceau de club (house, techno, trance, dubstep…) : la forme des musiques électroniques, pas celle d'une chanson.
       décompte 1 · intro (le groove s'installe, le filtre s'ouvre) · couplet · montée 4 (souffle qui grimpe, roulement qui se resserre,
       un temps de silence) · drop · pause (plus de kick : on respire) · montée 4 · final (le drop, renforcé) · fin 2
     Le gabarit s'occupe de ce qui est commun (montée, roulement, impact, silence avant le drop, notes à taper du roulement, harmonie
     pour le jeu). Le morceau fournit ce qui fait son style :
       groove(add, sec, m, c, cn, n, o)   batterie et basse ; n = intensité : -1 pause sans kick, 0 intro, 1 couplet, 2 drop, 3 final
       harmo(add, sec, m, c, cn, n, cl)   accords ; cl = ouverture du filtre de 0 à 1 (à passer en {clarte} aux notes)
       motifs: {intro, A, B, pause, final} une liste de mesures [[pas, durée, note de l'accord ou {n: midi}, geste, options]] jouée par « lead »
       extra(add, sec, m, c, cn, n)       tout le reste (arpèges, effets)
     cfg : bpm, swing, graine, cle, salle, pompage, final (transposition du final), prog: {intro, A, montee, B, pause, fin},
       lead, leadBase, leadOctave, roule (instrument du roulement), grave (instrument de basse de la fin), instruments, gestes, frappe, integre */
  function club(cfg){
    const {N, add} = cahier(), H = {}, k = cfg.final || 0, tr = (noms, kk) => noms.map(n => acc(n, kk || 0));
    const jouer = (sec, m, c, cn, n, cl, kk, liste, fort) => {
      cfg.groove(add, sec, m, c, cn, n, {}); cfg.harmo(add, sec, m, c, cn, n, cl); if(cfg.extra) cfg.extra(add, sec, m, c, cn, n);
      const mo = liste && liste[m % liste.length]; if(mo) for(const [p, d, i, tag, o] of mo){ const midi = typeof i === 'object' ? i.n + kk : ton(c, i, cfg.leadBase || 67);
        add(sec, [cfg.lead, m, p, midi, d, tag && tag[0] === 'H' ? .9 : tag && tag[1] === '1' ? 1 : .86, tag, o]); if(fort && cfg.leadOctave) add(sec, [cfg.leadOctave, m, p, midi + 12, d, .5, undefined, o]); } };
    const Mo = cfg.motifs || {}, r = cfg.roule || 'clap';
    H.decompte = [acc(cfg.prog.intro[0])]; [0, 4, 8, 12].forEach(p => add('decompte', [cfg.decompte || r, 0, p, 0, 1, p ? .7 : .9]));      // décompte bien audible : quatre coups de l'instrument qu'on tapera
    H.intro = tr(cfg.prog.intro); H.intro.forEach((c, m, L) => jouer('intro', m, c, L[(m + 1) % L.length], m < L.length/2 ? 0 : .5, .15 + .85*m/(L.length - 1), 0, Mo.intro));
    H.A = tr(cfg.prog.A); H.A.forEach((c, m, L) => jouer('A', m, c, L[(m + 1) % L.length], 1, 1, 0, Mo.A));
    // la montée : le kick tombe à la dernière mesure, tout se tait sur le dernier temps
    H.montee = tr(cfg.prog.montee); { const brut = N.montee = [], addM = (sec, ...ns) => { for(const n of ns) if(!(n[1] === 3 && (n[0] === 'kick' || n[2] >= 12))) brut.push(n); };
      H.montee.forEach((c, m, L) => { cfg.groove(addM, 'montee', m, c, L[(m + 1) % 4], 1, {montee: m}); cfg.harmo(addM, 'montee', m, c, L[(m + 1) % 4], 1, .3 + .7*m/3); if(cfg.extra) cfg.extra(addM, 'montee', m, c, L[(m + 1) % 4], 1.5);
        // roulement : noires, croches, doubles, de plus en plus fort ; les noires se tapent
        const pas = m === 0 ? 4 : m === 1 ? 2 : 1; for(let p = 0; p < (m === 3 ? 12 : 16); p += pas){ const v = .3 + .6*(m*16 + p)/60; addM('montee', [r, m, p, 0, 1, v, p % 4 === 0 && (m < 2 ? p % 8 === 4 : true) ? (m === 2 ? 'J2' : 'J1') : undefined]); } });
      brut.push(['mt', 0, 0, 60, 60, .9, '!']); }
    const drop = (sec, kk, n, liste, fort) => { H[sec] = tr(cfg.prog.B, kk); H[sec].forEach((c, m, L) => jouer(sec, m, c, L[(m + 1) % L.length], n, 1, kk, liste, fort)); add(sec, ['rt', 0, 0, 60, 12, .9, '!'], ['crash', 0, 0, 0, 8, .8]); };
    drop('B', 0, 2, Mo.B, false);
    H.pause = tr(cfg.prog.pause); H.pause.forEach((c, m, L) => jouer('pause', m, c, L[(m + 1) % L.length], m < L.length/2 ? -1 : 0, 1 - .6*m/(L.length - 1), 0, Mo.pause));
    drop('final', k, 3, Mo.final || Mo.B, true);
    H.fin = tr(cfg.prog.fin, k); { const [c0, c1] = H.fin; cfg.harmo(add, 'fin', 0, c0, c1, 2, 1); add('fin', ['kick', 0, 0, 36, 2, 1], ['crash', 0, 0, 0, 8, .8], ['rt', 0, 0, 60, 14, .8, '!'], [cfg.lead, 0, 0, ton(c0, 0, cfg.leadBase || 67), 12, 1, 'C1'], [cfg.grave || 'basse', 0, 0, ton(c0, 0, cfg.graveBase || 36), 10, .9]); if(cfg.fin) cfg.fin(add, c0, c1); }
    const g = cfg.gestes || 'CJ', sections = {}; for(const s of ['decompte', 'intro', 'A', 'montee', 'B', 'pause', 'final', 'fin']) sections[s] = {mesures: H[s].length, notes: N[s] || []};
    const ins = Object.assign({mt: {type: 'montee', vol: .14, groupe: 'base'}, rt: {type: 'retombee', vol: .16, groupe: 'base'}, crash: {type: 'crash', vol: .16, groupe: 'base'}}, cfg.instruments);
    if(!ins.scr) ins.scr = {type: 'rim', vol: .001, joueur: true, groupe: 'base'};
    const G0 = gamme(cfg.cle[0], cfg.cle[1]), Gk = G0.map(x => (x + k) % 12);
    const P = {bpm: cfg.bpm, sig: [4, 4], swing: cfg.swing || .5, swingSur: 16, humain: cfg.humain ?? 3, graine: cfg.graine || 1, pistes: true, pompage: cfg.pompage,
      salle: cfg.salle || {taille: .55, amorti: .5, niveau: .5, predelai: .02}, instruments: ins, sections, forme: ['decompte', 'intro', 'A', 'montee', 'B', 'pause', 'montee', 'final', 'fin'],
      jeu: {decompte: null, intro: ['Intro', 0, g], A: ['Couplet', 1, g], montee: ['Montée', 1, g], B: ['Drop', 2, g], pause: ['Pause', 'rest', g], final: ['Final', 3, g], fin: ['Fin', 'rest', g]},
      harmonie: Object.fromEntries(Object.entries(H).map(([kk, v]) => [kk, harmonie(v)])), gamme: G0, gammes: {final: Gk, fin: Gk}};
    // integre : aucun bruit de frappe ajouté par-dessus. Chaque brique joue SA note du morceau (retirée de la musique tant qu'on ne la joue pas),
    // avec le son de l'instrument du morceau : ce que fait le joueur est une partie de la musique, pas un bruit à côté.
    if(cfg.integre){ P.frappe = {}; P.integre = true; return P; }
    return frappes(P, cfg.frappe);
  }
  window.K7M = {echo, club, hookAuto, batt, chanson, frappes, ROOT, acc, gamme, cahier, proche, ton, voix, motif, charley, harmonie, MODES};
  window.K7PARTITIONS = window.K7PARTITIONS || {};
})();
