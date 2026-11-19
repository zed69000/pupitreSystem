# Journal

## 1.5.0 — Vrais instruments, console de mixage
- **Vrais instruments** (`src/pupitre-banques.js`) : une banque SoundFont 2 (.sf2) remplace les timbres synthétiques par des notes enregistrées, avec couches de vélocité, boucles, enveloppes et coupure des charleys. La partition ne change pas ; sans banque, ou pour un instrument absent, le synthé joue. La beatmap est identique dans les deux cas.
- Banque téléchargée une fois (progression suivie), gardée sur l'appareil ; seuls les instruments du morceau sont préparés. `scripts/decouper-banque.mjs` découpe une banque en un fichier par instrument.
- Nouvelles clés d'instrument : `reel`, `synthe` (doublure synthétique), `type: 'ech'` avec `prog`, `dynamique`, `desaccord`, `entier`.
- **Console de mixage** (`src/pupitre-console.js`) : une piste par famille (batterie, basse, guitares, pianos, cordes, cuivres, synthés, autres) avec volume, balance, muet, solo, égaliseur paramétrique, réverbe, chorus, flanger, phaser, delay, distorsion, largeur stéréo ; général avec égaliseur, compresseur, largeur ; profils Rock, Pop, Électro, Orchestre, Acoustique, Automatique ; réglages gardés sur l'appareil ; panneau prêt à poser dans un jeu.
- Le retard du compresseur général (6 ms) est déclaré à l'horloge : `position()` et `tempsA()` restent justes.
- `pupitre.limiteur` exposé (indicateur de réduction). Sans banque ni console, le moteur se comporte comme en 1.4.
- Page d'écoute `dist/regie.html` ; essais dans Chrome (`npm run test:navigateur`) qui mesurent l'heure de chaque attaque sur le son sorti.


## 1.4.0 — Sons de frappe, poignée des notes
- `partition.sons` (instrument, note, durée, vélocité) : fabriqués au chargement, joués tout de suite par `jouerSon(nom)` (le bruit d'un geste).
- `jouerNote()` renvoie une poignée `{ quand, stop(fondu) }` (note tenue lâchée trop tôt) et accepte `{ tout: true }` (au moment du geste).

## 1.3.0 — Synthés, orgue, guitare saturée
- Classe `Synthe` (scie, carré, triangle ; voix désaccordées étalées, sous-oscillateur, filtre à enveloppe, saturation ; option `voyelle` à deux formants) et ses préréglages `synth_basse`, `synth_lead`, `synth_pluck`, `supersaw`, `synth_cuivres`, `chip`, `talkbox`.
- Classe `Orgue` (tirettes, percussion, cabine tournante), préréglage `orgue`.
- Corde pincée saturée (`drive`, `cab`) : `guitare_sat`, `guitare_etouffee`.
- Testés par `tests/instruments.test.mjs` (son, valeurs finies, pic sous 1).

## 1.2.0 — Notes du joueur, harmonie, mémoire
- **Notes du joueur** : un instrument `joueur: true` ne garde dans la musique fabriquée que ses notes sans étiquette ; ses notes étiquetées sont fabriquées une par une (même timbre, même salle, queue courte) et jouées par `pupitre.jouerNote(n)` quand le joueur les réussit : à leur heure exacte si le geste est en avance, tout de suite s'il est en retard. Une note ratée manque à la musique. `beatmap()` indique `joueur` et la clé de la note. Test : `tests/joueur.test.mjs`.
- **Harmonie** : une partition peut donner `harmonie` (accord de chaque mesure) et `gamme` ; le jeu s'en sert pour accorder ses voix. `tests/beatsplash.test.mjs` refuse toute note tenue hors de l'accord, et sur un temps fort toute note hors du mode ou un demi-ton au-dessus de l'accord (sauf étiquette « ! » : dissonance assumée).
- **Mémoire** : une couche vide dans une section n'est plus fabriquée ; vélocités des notes du joueur par paliers de 0,1.
- Beat Splash : « Coup de cuivres » v2, « Les petits pas », « Petite sonate ».

## 1.1.0 — Vitesse de bande, premiers morceaux de Beat Splash
- `pupitre.vitesse(v)` : la bande ralentit ou accélère (la hauteur suit, comme une cassette). Les sections qui jouent changent de vitesse, celles qui n'ont pas commencé sont reposées au bon endroit ; `position()` et `tempsA()` restent justes. Test : `tests/vitesse.test.mjs`.
- `exemples/beatsplash/` : les partitions de Beat Splash (recopiées dans le jeu), testées par `tests/beatsplash.test.mjs` (pic sous 1 sur le mélange complet, notes à jouer à chaque niveau). Premier morceau : « Coup de cuivres ».

## 1.0.0 — 18 novembre 2026

- La musique se fabrique sur l’appareil, pendant le chargement, sans aucun fichier audio : le jeu reste léger et le son garde toute sa qualité.
- Plus de craquements quand la musique est chargée : jusqu’à 55 instruments à la fois sans ralentir le jeu.
- La lecture démarre en une demi-seconde et la suite est toujours prête à temps.
- Les notes à taper tombent pile sur la musique, et un réglage corrige le retard des casques Bluetooth.
- Musique adaptative : le jeu peut ajouter ou retirer des groupes d’instruments en fondu.
- 40 instruments prêts à l’emploi : cordes, cuivres, bois, chœur, percussions d’orchestre, Rhodes, piano, basse, batterie.
