// Fabrique les pages de test autonomes (moteur + partitions intégrés) :
//   dist/banc-essai.html  charge et synchro du moteur
//   dist/regie.html       vrais instruments (banque .sf2) et console de mixage
// Pourquoi des pages en un seul fichier : elles s'ouvrent partout (téléphone, artifact Claude,
// WebView Capacitor) sans serveur ni import de module.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const lire = f => readFileSync(join(racine, f), 'utf8');
const sansExport = f => lire(f).replace(/^export \{[^}]*\};?\s*$/m, '');
const beatsplash = readdirSync(join(racine, 'exemples/beatsplash')).filter(f => f.endsWith('.js')).sort((a, b) => (a === 'aide.js' ? -1 : b === 'aide.js' ? 1 : a.localeCompare(b)));
mkdirSync(join(racine, 'dist'), { recursive: true });
const ecrire = (nom, page) => { writeFileSync(join(racine, 'dist', nom), page); console.log('dist/' + nom + ' :', (page.length / 1024).toFixed(0), 'Ko'); };

ecrire('banc-essai.html', lire('exemples/banc-essai.modele.html')
  .replace('/*__PUPITRE__*/', () => sansExport('src/pupitre.js'))
  .replace('/*__PARTITIONS__*/', () => lire('exemples/partitions.js')));

ecrire('regie.html', lire('exemples/regie.modele.html')
  .replace('/*__PUPITRE__*/', () => sansExport('src/pupitre.js'))
  .replace('/*__BANQUES__*/', () => '{' + sansExport('src/pupitre-banques.js') + '}')
  .replace('/*__CONSOLE__*/', () => '{' + sansExport('src/pupitre-console.js') + '}')
  .replace('/*__PARTITIONS__*/', () => lire('exemples/partitions.js') + '\n' + beatsplash.map(f => lire('exemples/beatsplash/' + f)).join('\n')));
