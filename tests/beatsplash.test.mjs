// Les morceaux de Beat Splash (exemples/beatsplash/*.js, recopiés dans le jeu) : chaque section se fabrique,
// le pic reste sous 1, et la beatmap a des notes à jouer à chaque niveau.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { NOYAU, Ecriture } from '../src/pupitre.js';

const K = NOYAU(), dir = new URL('../exemples/beatsplash/', import.meta.url);
const bac = { window: {}, PupitreEcriture: Ecriture }; bac.window.PupitreEcriture = Ecriture; vm.createContext(bac);
for (const f of readdirSync(dir).filter(f => f.endsWith('.js')).sort((a, b) => (a === 'aide.js' ? -1 : b === 'aide.js' ? 1 : a.localeCompare(b)))) vm.runInContext(readFileSync(new URL(f, dir), 'utf8'), bac, { filename: f });
const PARTS = bac.window.K7PARTITIONS || {};

for (const [id, fn] of Object.entries(PARTS)) {
  test(`Beat Splash · ${id} : sections fabriquées, pic sous 1`, () => {
    const P = fn(), I = K.resoudre(P), groupes = P.pistes ? [...new Set(Object.values(I).map(x => x.groupe))] : ['tout'];
    for (const nom of Object.keys(P.sections)) {
      // le pic se juge sur le mélange complet (toutes les couches allumées)
      const R = groupes.map(g => K.rendre(P, nom, g, 22050)), n = Math.max(...R.map(r => r.L.length));
      let pic = 0; for (let i = 0; i < n; i++) { let l = 0, r = 0; for (const x of R) { l += x.L[i] || 0; r += x.R[i] || 0; } pic = Math.max(pic, Math.abs(l), Math.abs(r)); }
      assert.ok(pic < 1, `${nom} : pic ${pic.toFixed(2)}`);
      assert.ok(pic > 0.05 || nom === 'decompte', `${nom} : presque silencieux (${pic.toFixed(3)})`);
    }
  });
  test(`Beat Splash · ${id} : beatmap par niveau`, () => {
    const P = fn(), I = K.resoudre(P);
    if (P.boucle) return;   // musique de menu : pas de notes à jouer
    for (let lv = 1; lv <= 4; lv++) {
      let n = 0; for (const nom of P.forme) n += K.evenements(P, I, nom).evts.filter(e => /^[CJ]\d$/.test(e.tag || '') && +e.tag[1] <= lv).length;
      assert.ok(n > 40, `niveau ${lv} : seulement ${n} notes`);
    }
  });
  test(`Beat Splash · ${id} : harmonie (pas de note tenue hors de l'accord)`, () => {
    const P = fn(), I = K.resoudre(P), PERC = /kick|caisse|charley|crash|ride|clap|shaker|tom|rim|timbales|grosse_caisse|caisse_militaire/;
    if (!P.harmonie) return;
    const fautes = [];
    for (const nom of Object.keys(P.sections)) {
      const Hs = P.harmonie[nom]; if (!Hs) continue; const G = new Set((P.gammes && P.gammes[nom]) || P.gamme || []);
      for (const n of P.sections[nom].notes) {
        const [instr, m, pas, midi, dur = 1, , tag] = n, ins = I[instr]; if (!ins || PERC.test(ins.type) || (tag && String(tag).includes('!'))) continue;
        const pc = ((midi % 12) + 12) % 12, ici = Hs[Math.min(m, Hs.length - 1)], apres = Hs[Math.min(m + 1, Hs.length - 1)];
        const dans = h => h[1].includes(pc), fort = pas % 4 === 0;
        const coeur = ici[1].slice(0, 4), b9 = coeur.some(c => ((pc - c) % 12 + 12) % 12 === 1);
        if (dur >= 2 && !dans(ici) && !(pas >= 12 && dans(apres))) fautes.push(`${nom} m${m} p${pas} ${instr} ${midi} (tenue hors accord)`);
        else if (fort && dur >= 1 && !dans(ici) && (!G.has(pc) || b9)) fautes.push(`${nom} m${m} p${pas} ${instr} ${midi} (temps fort ${b9 ? 'demi-ton au-dessus de l accord' : 'hors mode'})`);
      }
    }
    assert.equal(fautes.length, 0, fautes.slice(0, 12).join(' | '));
  });
}
