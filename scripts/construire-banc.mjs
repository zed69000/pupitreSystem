// Fabrique dist/banc-essai.html : la page de test autonome (moteur + partitions intégrés).
// Pourquoi une page en un seul fichier : elle s'ouvre partout (téléphone, artifact Claude,
// WebView Capacitor) sans serveur ni import de module.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const lire = f => readFileSync(join(racine, f), 'utf8');
const moteur = lire('src/pupitre.js').replace(/^export \{[^}]*\};?\s*$/m, '');
const page = lire('exemples/banc-essai.modele.html')
  .replace('/*__PUPITRE__*/', () => moteur)
  .replace('/*__PARTITIONS__*/', () => lire('exemples/partitions.js'));
mkdirSync(join(racine, 'dist'), { recursive: true });
writeFileSync(join(racine, 'dist/banc-essai.html'), page);
console.log('dist/banc-essai.html :', (page.length / 1024).toFixed(0), 'Ko');
