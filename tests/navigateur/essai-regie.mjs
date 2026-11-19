// Essai dans un vrai navigateur (Chrome sans écran) de ce que Node ne peut pas vérifier :
// fils de calcul, Web Audio réel, cache de la banque, panneau, et la synchro mesurée SUR LE SON SORTI.
//   npm run banc && npm run test:navigateur        (demande le paquet playwright et Chrome)
import http from 'node:http';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { banqueDeTest } from '../fabrique-sf2.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const racine = join(dirname(fileURLToPath(import.meta.url)), '../..'), page0 = readFileSync(join(racine, 'dist/regie.html'));
const serveur = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(page0); }).listen(0);
const url = 'http://localhost:' + serveur.address().port + '/';
const sf2 = join(mkdtempSync(join(tmpdir(), 'pupitre-')), 'banque-test.sf2'); writeFileSync(sf2, Buffer.from(banqueDeTest()));
const nav = await chromium.launch({ executablePath: process.env.CHROME || undefined, channel: process.env.CHROME ? undefined : 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const ctxNav = await nav.newContext(), page = await ctxNav.newPage(), erreurs = [];
page.on('pageerror', e => erreurs.push(String(e))); page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_/.test(m.text())) erreurs.push(m.text()); });
const ok = (nom, detail = '') => console.log('ok   ' + nom + (detail ? '  · ' + detail : ''));
let echecs = 0; const essai = async (nom, f) => { try { const d = await f(); ok(nom, d); } catch (e) { echecs++; console.log('ÉCHEC ' + nom + '\n      ' + String(e.message).split('\n')[0]); } };

await page.goto(url);

await essai('la page se charge sans erreur', async () => { assert.equal(await page.locator('#ec-morceau option').count() >= 10, true); assert.deepEqual(erreurs, []); return (await page.locator('#ec-morceau option').count()) + ' morceaux'; });

await essai('sans banque : lecture en synthétique, console affichée', async () => {
  await page.selectOption('#ec-morceau', { label: 'Poche soul' }); await page.click('#ec-jouer');
  await page.waitForFunction(() => document.querySelector('#ec-txt').textContent === 'Arrêter', null, { timeout: 30000 });
  const etat = await page.textContent('#ec-etat'); assert.match(etat, /tout en synthétique/);
  const pistes = await page.locator('#regie .pup-p > .pup-b').count(); assert.ok(pistes >= 3, pistes + ' pistes');
  const fils = await page.evaluate(() => pupitre.stats.workers); assert.ok(fils >= 1, 'fils de calcul');
  return pistes + ' pistes, ' + fils + ' fil(s) de calcul';
});

await essai('le son sort vraiment, piste par piste (indicateurs d\'activité)', async () => {
  await page.waitForTimeout(1500);
  const n = await page.evaluate(async () => { let g = 0, b = 0; const brut = new Float32Array(512); for (let i = 0; i < 80; i++) { regie.G.mesure.getFloatTimeDomainData(brut); for (const x of brut) g = Math.max(g, Math.abs(x)); b = Math.max(b, regie.niveau('batterie')); await new Promise(r => setTimeout(r, 25)); } return { g, b, profil: regie.etat.choisi }; });
  assert.ok(n.g > 0.02 && n.b > 0.01, JSON.stringify(n)); assert.ok(n.g < 1, 'le mélange du profil ' + n.profil + ' dépasse 1 avant le limiteur : ' + n.g.toFixed(2)); return 'pic du mélange avant limiteur ' + n.g.toFixed(3) + ' (profil ' + n.profil + '), batterie ' + n.b.toFixed(2);
});

await essai('muet, solo et volume agissent sur le son', async () => {
  const mes = () => page.evaluate(async () => { await new Promise(r => setTimeout(r, 250)); let m = 0; for (let i = 0; i < 30; i++) { m = Math.max(m, regie.niveau('batterie')); await new Promise(r => setTimeout(r, 25)); } return m; });
  const avant = await mes(); await page.evaluate(() => regie.regler('batterie', 'muet', true)); const muet = await mes();
  await page.evaluate(() => { regie.regler('batterie', 'muet', false); regie.regler('basse', 'solo', true); }); const solo = await mes();
  await page.evaluate(() => regie.regler('basse', 'solo', false)); const apres = await mes();
  assert.ok(avant > 0.01 && muet < avant * 0.05 && solo < avant * 0.05 && apres > avant * 0.5, JSON.stringify({ avant, muet, solo, apres }));
  return 'batterie ' + avant.toFixed(2) + ' → muet ' + muet.toFixed(3) + ' → solo basse ' + solo.toFixed(3) + ' → ' + apres.toFixed(2);
});

await essai('une banque choisie par fichier : vrais instruments dans les fils de calcul', async () => {
  await page.setInputFiles('#bq-fichier', sf2);
  await page.waitForFunction(() => /vrais instruments sur/.test(document.querySelector('#ec-etat').textContent), null, { timeout: 30000 });
  const r = await page.evaluate(() => ({ etat: document.querySelector('#ec-etat').textContent, banque: document.querySelector('#bq-etat').textContent, hors: pupitre.stats.horsFil, reels: Object.values(pupitre.INS).filter(I => I.classe === 'Echantillon').length, dec: pupitre.stats.decrochages }));
  assert.ok(r.reels >= 2 && !r.hors, JSON.stringify(r)); assert.match(r.banque, /gardée sur l’appareil/);
  return r.reels + ' instruments enregistrés, ' + r.dec + ' décrochage';
});

await essai('profils et réglages : appliqués, gardés, relus après rechargement de la page', async () => {
  await page.selectOption('#regie select', 'rock');
  await page.evaluate(() => { regie.regler('batterie', 'vol', 0.62); regie.reglerGeneral('comp', 0.5); regie.sauver(); });
  await page.reload(); await page.click('#ec-jouer');
  await page.waitForFunction(() => document.querySelector('#ec-txt').textContent === 'Arrêter', null, { timeout: 30000 });
  const r = await page.evaluate(() => ({ profil: regie.etat.profil, vol: regie.etat.tranches.batterie.vol, comp: regie.etat.general.comp, banque: document.querySelector('#bq-etat').textContent, reels: Object.values(pupitre.INS).filter(I => I.classe === 'Echantillon').length }));
  assert.equal(r.profil, 'rock'); assert.equal(r.vol, 0.62); assert.equal(r.comp, 0.5);
  assert.ok(r.reels >= 2, 'la banque est reprise du cache sans la rechoisir : ' + r.banque);
  return 'profil rock, batterie 62 %, banque reprise du cache';
});

// ─── La mesure qui compte pour un jeu de rythme : l'heure réelle de chaque attaque dans le son sorti ───
const mesurer = cfg => page.evaluate(async cfg => {
  const ctx = new AudioContext(); await ctx.resume();
  const code = "registerProcessor('enr',class extends AudioWorkletProcessor{process(i){const c=i[0][0];if(c)this.port.postMessage({f:currentFrame,d:c.slice()});return true;}})";
  await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
  const enr = new AudioWorkletNode(ctx, 'enr'), muet = ctx.createGain(), blocs = []; muet.gain.value = 0; enr.connect(muet); muet.connect(ctx.destination); enr.port.onmessage = e => blocs.push(e.data);
  const p = new Pupitre(ctx, { sortie: enr }), R = cfg.regie ? new PupitreRegie(p, { sauvegarde: false }) : null;
  if (R) { for (const [k, v] of Object.entries(cfg.tranche || {})) R.regler('batterie', k, v); for (const [k, v] of Object.entries(cfg.general || {})) R.reglerGeneral(k, v); }
  const b = new PupitreBanques(p); await b.ouvrir(cfg.sf2, { nom: 'mesure', cache: false });
  const P = { bpm: 120, swing: 0.58, humain: 6, graine: 4, salle: { niveau: 0 }, instruments: { k: { type: 'kick', vol: 0.5 } }, sections: { A: { mesures: 2, notes: [0, 3, 6, 9, 12, 16, 21, 26].map(x => ['k', 0, x, 36, 1, 1]) } }, forme: ['A'] };
  await b.equiper(P); await p.charger(P, { qualite: 'haute' });
  const quand = ctx.currentTime + 0.4; p.jouer({ quand }); await new Promise(r => setTimeout(r, 4800));
  // pour chaque note annoncée : le premier échantillon fort dans une fenêtre de −20 à +30 ms (seuil à 30 % du pic : les échos du delay, plus faibles, ne comptent pas)
  const sr = ctx.sampleRate, attendus = p.beatmap().map(n => quand + n.t), trouves = []; let pic = 0;
  for (const bl of blocs) for (let i = 0; i < bl.d.length; i++) pic = Math.max(pic, Math.abs(bl.d[i]));
  for (const t of attendus) { let vu = NaN; boucle: for (const bl of blocs) { if ((bl.f + bl.d.length) / sr < t - 0.02 || bl.f / sr > t + 0.03) continue; for (let i = 0; i < bl.d.length; i++) { const x = (bl.f + i) / sr; if (x >= t - 0.02 && x <= t + 0.03 && Math.abs(bl.d[i]) > pic * 0.3) { vu = x; break boucle; } } } if (!Number.isNaN(vu)) trouves.push(vu); }
  const lat = R ? R.latence : 0; p.liberer(); await ctx.close();
  return { ecarts: attendus.map((t, i) => (trouves[i] - t) * 1000), n: trouves.length, lat: lat * 1000, horsFil: p.stats.horsFil, pic };
}, Object.assign({ sf2: [...readFileSync(sf2)] }, cfg)).catch(e => { throw e; });

// la page reçoit la banque en tableau d'octets : on la convertit en ArrayBuffer avant ouvrir()
await page.addInitScript(() => {}); await page.evaluate(() => { const o = PupitreBanques.prototype.ouvrir; PupitreBanques.prototype.ouvrir = function (s, a) { return o.call(this, Array.isArray(s) ? new Uint8Array(s).buffer : s, a); }; });
await page.evaluate(() => { jeton++; pupitre.arreter(0); });

const resume = e => { const m = e.reduce((s, x) => s + x, 0) / e.length, d = Math.max(...e.map(x => Math.abs(x - m))); return { m, d }; };
let base = null;
await essai('synchro sans console : 8 attaques mesurées sur le son sorti', async () => {
  const r = await mesurer({}); assert.equal(r.n, 8, r.n + ' attaques trouvées'); base = resume(r.ecarts);
  assert.ok(base.d < 0.5, 'dispersion ' + base.d.toFixed(2) + ' ms'); assert.ok(Math.abs(base.m) < 9, 'retard ' + base.m.toFixed(2) + ' ms');
  return 'retard constant ' + base.m.toFixed(2) + ' ms (limiteur de sécurité, déjà là avant), dispersion ' + base.d.toFixed(2) + ' ms';
});
await essai('console branchée, égaliseur + chorus + phaser + delay + distorsion + largeur : aucun retard ajouté', async () => {
  const r = await mesurer({ regie: true, tranche: { grave: 3, aigu: 2, chorus: 0.3, phaser: 0.3, delay: 0.2, disto: 0.3, largeur: 1.4, reverbe: 0.2, pan: -0.2 } }), x = resume(r.ecarts);
  assert.equal(r.n, 8); assert.equal(r.lat, 0); assert.ok(Math.abs(x.m - base.m) < 0.3 && x.d < 0.5, JSON.stringify(x));
  return 'écart avec la mesure sans console : ' + (x.m - base.m).toFixed(2) + ' ms';
});
await essai('compresseur général : le retard réel est celui que la régie déclare à l\'horloge du jeu', async () => {
  const r = await mesurer({ regie: true, general: { comp: 0.5 } }), x = resume(r.ecarts); if (process.env.DETAIL) console.log(JSON.stringify(r));
  assert.equal(r.n, 8); assert.ok(Math.abs(r.lat - 6) < 1e-6, 'latence déclarée ' + r.lat); assert.ok(Math.abs((x.m - base.m) - r.lat) < 0.7 && x.d < 0.5, JSON.stringify(x));
  return 'retard mesuré ' + (x.m - base.m).toFixed(2) + ' ms, déclaré ' + r.lat.toFixed(0) + ' ms';
});
await essai('aucune erreur dans la page pendant tous les essais', async () => { assert.deepEqual(erreurs, []); });

await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => document.querySelector('#regie').scrollIntoView());
if (process.env.CAPTURE) await page.screenshot({ path: process.env.CAPTURE, fullPage: true });
await nav.close(); serveur.close();
console.log(echecs ? '\n' + echecs + ' échec(s)' : '\nTous les essais navigateur passent.'); process.exit(echecs ? 1 : 0);
