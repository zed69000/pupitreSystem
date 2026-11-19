// Essai sur une VRAIE banque SoundFont quand il y en a une sur la machine (sinon les tests sont sautés).
//   BANQUE=/chemin/vers/banque.sf2 npm test     (par défaut : la petite banque TimGM6mb fournie avec Debian/Ubuntu)
// Ce que la banque fabriquée pour les tests ne peut pas montrer : accord réel des enregistrements, niveaux, morceaux entiers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { NOYAU, Ecriture } from '../src/pupitre.js';
import { lireSF2, Banques, GM, besoins } from '../src/pupitre-banques.js';

const chemin = process.env.BANQUE || '/usr/share/sounds/sf2/TimGM6mb.sf2', la = existsSync(chemin), saut = la ? false : 'aucune banque sur cette machine';
const tampon = () => { const o = readFileSync(chemin); return o.buffer.slice(o.byteOffset, o.byteOffset + o.byteLength); };
const moteur = () => { const K = NOYAU(), p = { K, reel: {}, banque: (n, j) => K.poserJeu(n, j), associer(t) { this.reel = t; K.associer(t); } }; return p; };
// hauteur par autocorrélation : la période qui se ressemble le plus à elle-même
const hauteur = (x, a, n, sr, attendu) => { let mieux = 0, per = 0; const p0 = sr / attendu; for (let p = p0 * 0.8; p <= p0 * 1.25; p += 0.02) { let s = 0; const e = Math.floor(p), f = p - e; for (let i = a; i < a + n; i++) s += x[i] * (x[i + e] * (1 - f) + x[i + e + 1] * f); if (s > mieux) { mieux = s; per = p; } } return sr / per; };
const eff = (r, a = 0, b = r.L.length) => { let s = 0; for (let i = a; i < b; i++) s += r.L[i] * r.L[i] + r.R[i] * r.R[i]; return Math.sqrt(s / (b - a)); };
const une = (type, midi, plus = {}) => ({ bpm: 120, humain: 0, salle: { niveau: 0 }, instruments: { x: Object.assign({ type, desaccord: 0, synthe: 0 }, plus) }, sections: { A: { mesures: 1, notes: [['x', 0, 0, midi, 8, 0.8]] } }, forme: ['A'] });

test('vraie banque : tous les instruments associés se lisent, avec des zones et des boucles cohérentes', { skip: saut }, () => {
  const sf = lireSF2(tampon()); let lus = 0;
  for (const g of Object.values(GM)) { const j = sf.jeu(g.b || 0, g.p || 0); if (!j) continue; lus++;
    assert.ok(j.zones.length > 0 && j.gain > 0 && j.gain <= 8 && j.moyenne > 0);
    for (const z of j.zones) { const d = j.ech[z.s]; assert.ok(d && d.length > 8 && z.lo <= z.hi && z.sr >= 4000 && z.sr <= 96000, j.nom); if (z.bB > 0) assert.ok(z.bA >= 0 && z.bB > z.bA && z.bB <= d.length, j.nom + ' : boucle ' + z.bA + '→' + z.bB + ' sur ' + d.length); assert.ok(z.att >= 0 && z.rel > 0 && z.sus >= 0 && z.sus <= 1 && Number.isFinite(z.cents)); } }
  assert.ok(lus >= 10, lus + ' instruments lus');
});

// Tolérance de 1,5 % : c'est l'accord de la banque elle-même. Sur TimGM6mb, FluidSynth (le lecteur de référence) donne les mêmes hauteurs
// au dixième de hertz (piano : 438,3 Hz pour le la, 1032,8 Hz pour le do aigu) : le moteur lit donc la banque comme il faut.
test('vraie banque : les instruments jouent juste (grave, médium, aigu) à 1,5 % près', { skip: saut }, async () => {
  const p = moteur(), B = new Banques(p); await B.ouvrir(tampon(), { nom: 'reelle', cache: false }); const sr = 32000;
  for (const [type, midi] of [['piano', 69], ['piano', 48], ['piano', 84], ['trompettes', 69], ['flute', 81], ['violons', 69], ['cors', 57], ['hautbois', 72]]) {
    const P = une(type, midi); await B.equiper(P, { dureeMin: 0, doublure: 0 });
    if (p.K.resoudre(P).x.classe !== 'Echantillon') continue;
    const r = p.K.rendre(P, 'A', 'tout', sr), f0 = 440 * Math.pow(2, (midi - 69) / 12), f = hauteur(r.L, sr * 0.3, sr * 0.25, sr, f0);
    assert.ok(Math.abs(f / f0 - 1) < 0.015, `${type} ${midi} : ${f.toFixed(1)} Hz au lieu de ${f0.toFixed(1)}`);
  }
});

test('vraie banque : la batterie attaque sur le temps (moins de 3 ms) et chaque instrument est au niveau du synthé qu\'il remplace', { skip: saut }, async () => {
  const p = moteur(), B = new Banques(p); await B.ouvrir(tampon(), { nom: 'reelle', cache: false }); const sr = 48000;
  for (const type of ['kick', 'caisse', 'charley', 'clap']) {
    const P = une(type, 60); await B.equiper(P); const r = p.K.rendre(P, 'A', 'tout', sr); let pic = 0; for (const x of r.L) pic = Math.max(pic, Math.abs(x)); let i = 0; while (Math.abs(r.L[i]) < pic * 0.05) i++;
    assert.equal(p.K.resoudre(P).x.classe, 'Echantillon'); assert.ok(i / sr < 0.003, `${type} : attaque à ${(i / sr * 1000).toFixed(2)} ms`);
  }
  for (const [type, midi] of [['piano', 60], ['trompettes', 67], ['violons', 67], ['flute', 79], ['kick', 36], ['caisse', 38]]) {
    const P = une(type, midi); await B.equiper(P, { doublure: 0 }); if (p.K.resoudre(P).x.classe !== 'Echantillon') continue;
    const a = eff(p.K.rendre(Object.assign({}, P, { reel: false }), 'A', 'tout', 16000), 0, 7200), b = eff(p.K.rendre(P, 'A', 'tout', 16000), 0, 7200);
    assert.ok(b / a > 0.45 && b / a < 1.4, `${type} : vrai instrument ${(b / a).toFixed(2)} fois le niveau du synthé`);      // en dessous de 1 quand le pic plafonne (batterie)
  }
});

test('vraie banque : un jeu trop pauvre reste au synthé, un jeu sourd est doublé par le synthé', { skip: saut }, async () => {
  const p = moteur(), B = new Banques(p); await B.ouvrir(tampon(), { nom: 'reelle', cache: false }); const sf = lireSF2(tampon());
  const P = { bpm: 120, instruments: Object.fromEntries(Object.keys(GM).map(t => [t, { type: t }])), sections: { A: { mesures: 1, notes: [] } }, forme: ['A'] };
  const r = await B.equiper(P), INS = p.K.resoudre(P);
  for (const k of r.pauvres) { const [, b, pr] = k.split(':'); assert.ok(sf.jeu(+b, +pr).moyenne < 0.2); }
  for (const [t, I] of Object.entries(INS)) { const g = GM[t], k = 'gm:' + (g.b || 0) + ':' + (g.p || 0);
    if (r.pauvres.includes(k) || r.manquants.includes(k)) assert.notEqual(I.classe, 'Echantillon', t + ' devrait rester synthétique');
    else { assert.equal(I.classe, 'Echantillon', t); const j = sf.jeu(g.b || 0, g.p || 0); if (j.srMax < 20000) assert.ok(I.doublure, t + ' : jeu sourd, doublure attendue'); } }
  console.log('      vrais : ' + r.instruments.length + ' · laissés au synthé (trop pauvres) : ' + r.pauvres.length + ' · absents : ' + r.manquants.length);
});

test('vraie banque : tous les morceaux de Beat Splash se fabriquent, sans valeur folle, au niveau du synthé, avec la même beatmap', { skip: saut, timeout: 600000 }, async () => {
  const dos = new URL('../exemples/beatsplash/', import.meta.url), bac = { window: { PupitreEcriture: Ecriture }, PupitreEcriture: Ecriture }; vm.createContext(bac);
  for (const f of ['aide.js', ...readdirSync(dos).filter(f => f.endsWith('.js') && f !== 'aide.js').sort()]) vm.runInContext(readFileSync(new URL(f, dos), 'utf8'), bac, { filename: f });
  const p = moteur(), B = new Banques(p); await B.ouvrir(tampon(), { nom: 'reelle', cache: false }); const K0 = NOYAU(), lignes = [];
  for (const [id, fn] of Object.entries(bac.window.K7PARTITIONS)) {
    const P = fn(); for (const I of Object.values(P.instruments)) I.joueur = false;
    const r = await B.equiper(P), noms = Object.keys(P.sections), nom = noms.reduce((m, n) => (P.sections[n].notes.length > P.sections[m].notes.length ? n : m), noms[0]);      // la section la plus chargée
    const a = K0.rendre(P, nom, 'tout', 22050), b = p.K.rendre(P, nom, 'tout', 22050), INS = p.K.resoudre(P), reels = Object.values(INS).filter(I => I.classe === 'Echantillon').length;
    assert.ok(b.L.every(Number.isFinite) && b.R.every(Number.isFinite), id + ' : valeur non finie');
    const ratio = eff(b) / eff(a); assert.ok(ratio > 0.55 && ratio < 1.5, `${id} : niveau ${ratio.toFixed(2)} fois celui du synthé`); assert.ok(b.info.pic < Math.max(1.1, a.info.pic * 1.6), `${id} : pic ${b.info.pic.toFixed(2)}`);
    assert.deepEqual(p.K.evenements(P, INS, nom).evts.map(e => e.t), K0.evenements(P, K0.resoudre(P), nom).evts.map(e => e.t), id + ' : beatmap');
    lignes.push(`${id.padEnd(16)} ${String(reels).padStart(2)}/${String(Object.keys(INS).length).padEnd(2)} vrais · niveau ×${ratio.toFixed(2)} · pic ${b.info.pic.toFixed(2)} (synthé ${a.info.pic.toFixed(2)}) · ${(b.info.ms / b.info.duree).toFixed(0)} ms/s (synthé ${(a.info.ms / a.info.duree).toFixed(0)})`);
  }
  console.log(lignes.map(l => '      ' + l).join('\n'));
});
