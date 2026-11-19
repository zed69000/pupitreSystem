# Écrire une partition Pupitre

Une partition est un simple objet JS. Le moteur l’utilise deux fois : pour fabriquer le son et pour produire la beatmap. Il n’y a donc qu’une seule vérité.

```
partition
├── réglages globaux   bpm, sig, swing, swingSur, humain, graine, salle, pistes, boucle, queue
├── instruments        nom → { type, vol, pan, verb, groupe, ...réglages du timbre }
├── sections           nom → { mesures, notes, (bpm, sig, swing, humain) }
└── forme              ordre d'écoute des sections : ['intro', 'A', 'B', 'A', 'fin']
```

## Réglages globaux

| Clé | Défaut | Rôle |
|---|---|---|
| `bpm` | 120 | Toujours en noires (un 12/8 à 70 à la noire pointée = `bpm: 105`). |
| `sig` | `[4, 4]` | Métrique. `[6, 8]` donne 12 pas par mesure. |
| `swing` | 0,5 | Part de la première note de chaque paire : 0,5 droit, 0,56 funk, 0,62 boom bap, 0,667 shuffle. |
| `swingSur` | 16 | 16 = swing sur les doubles croches, 8 = sur les croches (jazz, blues). |
| `humain` | 0 | Écart aléatoire maximal en ms (5 à 8 conseillé). Tiré d’une graine : identique à chaque chargement, donc la beatmap reste exacte. Le premier temps des instruments `ancre` (kick) n’est jamais décalé. |
| `graine` | 1 | Change toutes les micro-variations d’un coup. |
| `salle` | voir ci-dessous | Réverbe partagée : `taille` (0 à 1), `amorti` (0 à 1), `niveau` (0 coupe), `predelai` (s), `largeur` (0 à 1). |
| `pistes` | false | true = une piste par `groupe` d’instruments, réglable en jeu avec `pupitre.groupe()`. |
| `boucle` | false | true = la forme tourne sans fin (menus, exploration). |
| `queue` | auto | Secondes ajoutées après chaque section pour laisser sonner (réverbe comprise). |

## Une note

```
[instrument, mesure, pas, midi, durée, vélocité, tag]
   'tp'        3      8    74    6      0.9      'hook'
```

- **mesure** : à partir de 0, dans la section.
- **pas** : double croche (0 à 15 en 4/4). Les fractions donnent les triolets (0, 4/3, 8/3) ou les roulements (pas de 0,5).
- **midi** : 60 = do central. Ignoré par la plupart des percussions, sauf tom et timbales.
- **durée** : en pas. Pour les sons percussifs, elle sert seulement d’étouffoir.
- **vélocité** : 0 à 1. Elle change le volume et le timbre : un cuivre plus brillant, un Rhodes qui grogne, une corde pincée plus claire.
- **tag** : libre. Il ressort dans la beatmap, par exemple pour marquer les notes du hook à taper.

## Réglages communs à tous les instruments

| Clé | Rôle |
|---|---|
| `type` | Le préréglage de départ (liste ci-dessous). |
| `vol`, `pan`, `verb` | Volume, panoramique (−1 à 1), envoi vers la réverbe. |
| `groupe` | Couche (avec `pistes: true`). |
| `retard` | Décalage fixe en ms : caisse claire à +6 à +15 = détendu, charley à −5 = pressé. |
| `humain: false` | Pas d’humanisation pour cet instrument. |
| `etale` | Écarte chaque note dans le panoramique (ensembles, chœur). |
| `poly` | Voix maximum (24 par défaut). Au-delà, la plus ancienne s’éteint en 6 ms. |
| `choke` | Les voix du même nom se coupent entre elles (charley ouvert/fermé). |
| `transpo` | Transposition en demi-tons. |

## Instruments prêts à l’emploi

| Famille | Types | Réglages propres |
|---|---|---|
| Claviers | `rhodes`, `piano` | `tenue`, `tremolo` (Rhodes) |
| Basse | `basse` | `brillance`, `wah`, `q`, `drive`, `sub`, `tenue`, `soutien` |
| Cordes pincées | `pizz`, `harpe`, `guitare`, `contrebasse_pizz` | `clarte`, `tenue`, `etouffe` |
| Cordes frottées | `violons`, `altos`, `violoncelles`, `contrebasses`, `cordes_stacc` | `attaque`, `chute`, `soutien`, `relache`, `clarte`, `desaccord`, `vibrato`, `vibratoApres` |
| Cuivres | `cors`, `trompettes`, `trombones`, `cuivres_stab` | `clarte`, `attaque`, `vibrato`, `desaccord` |
| Bois | `flute`, `clarinette`, `hautbois` | `harmoniques`, `souffle`, `vibrato` |
| Percussions accordées | `glockenspiel`, `celesta`, `marimba`, `xylophone`, `cloches_tubes` | `modes` ([rapport, amplitude, durée]), `tenue`, `etouffe` |
| Voix | `choeur` | `voyelle` (a, o, ou, e, i), `attaque`, `relache` |
| Synthé | `nappe` | `clarte`, `attaque` |
| Batterie | `kick`, `kick_electro`, `caisse`, `rim`, `charley`, `charley_ouvert`, `crash`, `ride`, `clap`, `shaker`, `tom` | `f0`, `f1`, `tenue`, `ton`, `timbre`, `bruit`, `fc`, `hp`, `base` |
| Orchestre | `timbales`, `grosse_caisse`, `caisse_militaire` | `tenue` |

## Vrais instruments

Avec une banque de sons chargée (voir [regie.md](regie.md)), les mêmes types sont joués par des notes enregistrées. Clés propres : `reel: false` (garder le synthé), `synthe: 0.3` (doublure synthétique), `type: 'ech', prog: 40, secours: 'violons'` (programme General MIDI précis), `dynamique`, `desaccord`, `entier`, `largeur`. `famille` range l'instrument dans une autre piste de la console.

## Aides d’écriture

```js
import { Ecriture } from './pupitre.js';

Ecriture.motif('caisse', 0, '....X..g.g..X..g', 0);   // rythme en texte : X accent, x normal, g ghost, . silence
Ecriture.pcs(2, 'm9');                                  // classes de hauteur d'un ré m9
Ecriture.conduire(precedent, Ecriture.pcs(7, '7'), 55, 72);   // voicing au plus près du précédent
```

## Bonnes pratiques

1. **Écrire en sections réutilisées.** La forme `intro · A · B · A · B · fin` ne fabrique que 4 sections. C’est ce qui garde le démarrage court et la mémoire basse.
2. **Faire sonner les notes au-delà de leur section.** Une note qui commence dans une section et déborde sur la suivante est permise : chaque tampon garde sa queue, et les queues se superposent proprement.
3. **Anticiper dans la section d’avant.** Un accord joué une croche avant la barre s’écrit à la fin de la section précédente (voir « Poche soul » : le décompte porte l’anticipation du premier accord).
4. **Viser un pic sous 1** (les tests le vérifient). Le limiteur rattrape le reste, mais un mix dosé sonne mieux qu’un mix écrasé.
5. **Pour un jeu de rythme**, marquer la pulsation en permanence (charley, rim, basse) et choisir la beatmap par instrument et par pas, ou par `tag`.
