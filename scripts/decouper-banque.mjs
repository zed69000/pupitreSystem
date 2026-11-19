// Découpe une banque .sf2 en un fichier par instrument, pour que le jeu ne télécharge que ce qu'il joue.
//   node scripts/decouper-banque.mjs banque.sf2 sons/ [--tout]
// Garde tous les instruments associés à un type Pupitre (piano, violons, batterie…).
// Pourquoi : une banque complète pèse 30 Mo ou plus ; un morceau n'en utilise que 3 à 8 instruments (1 à 3 Mo chacun).
// Le dossier produit se charge avec banques.ouvrirDossier('sons/').
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { lireSF2, emballer, GM } from '../src/pupitre-banques.js';

const [, , fichier, dossier] = process.argv;
if (!fichier || !dossier) { console.error('Usage : node scripts/decouper-banque.mjs banque.sf2 dossier/'); process.exit(1); }
const octets = readFileSync(fichier), sf = lireSF2(octets.buffer.slice(octets.byteOffset, octets.byteOffset + octets.byteLength));
const voulus = new Map(); for (const g of Object.values(GM)) voulus.set((g.b || 0) + ':' + (g.p || 0), [g.b || 0, g.p || 0]);
mkdirSync(dossier, { recursive: true }); const presets = []; let total = 0;
for (const [b, p] of voulus.values()) {
  const j = sf.jeu(b, p); if (!j) { console.log('absent  ', b, p); continue; }
  // un jeu trop pauvre (un cycle bouclé) ne sera de toute façon pas utilisé par equiper() : inutile de l'embarquer (--tout pour le garder)
  if (!process.argv.includes('--tout') && b !== 128 && j.moyenne < 0.2) { console.log('pauvre  ', j.nom, '(' + (j.moyenne * 1000).toFixed(0) + ' ms par son) : laissé au synthé'); continue; }
  const nom = 'gm-' + b + '-' + p + '.pjeu', buf = Buffer.from(emballer(j)); writeFileSync(join(dossier, nom), buf); total += buf.length;
  presets.push({ banque: b, programme: p, nom: j.nom, fichier: nom, octets: buf.length });
  console.log((buf.length / 1048576).toFixed(2).padStart(6), 'Mo ', j.nom);
}
writeFileSync(join(dossier, 'index.json'), JSON.stringify({ nom: sf.nom, source: fichier.split('/').pop(), presets }, null, 1));
console.log(presets.length + ' instruments, ' + (total / 1048576).toFixed(1) + ' Mo au total (banque d\'origine : ' + (octets.length / 1048576).toFixed(1) + ' Mo)');
