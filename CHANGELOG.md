# Journal


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
