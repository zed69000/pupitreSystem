# Journal


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
