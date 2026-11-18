# Pupitre

Moteur de musique des jeux de Seb : la musique est **écrite en code** (une partition), puis **fabriquée sur l’appareil du joueur**, à l’avance, dans des fils de calcul séparés du jeu. Aucun fichier audio dans la build, aucune compression, et une beatmap toujours synchro pour les jeux de rythme.

Pupitre est né d’un problème de Beat Splash : jouée en direct, la musique craquait sur certains appareils. Le pré-bake qui avait remplacé le direct alourdissait la build et dégradait la qualité.

## Comment ça marche

```
  partition (données JS, quelques Ko)
       │
       ├──► 1 à 3 Web Workers  ─────────────────────────────┐
       │      synthèse en JS pur, section par section,      │  fil séparé :
       │      à l'avance, sur l'appareil du joueur          │  le jeu ne ralentit pas
       │            │  sons stéréo bruts, jamais compressés  ┘
       │            ▼
       │      tampons en mémoire (1 par section UNIQUE)
       │            │
       │            ▼
       │      fil audio : chaque section posée à l'échantillon près sur ctx.currentTime
       │      → couches (musique adaptative) → limiteur → sortie
       │
       └──► beatmap() / grille() : même partition, mêmes temps
              → notes à taper, pulsation, jugement des taps
```

Déroulé d’un chargement :

```
 temps ─►  0 s           0,3 s              ~0,5 s                 ~2 s
           │ sonde de     │ 1re section      │ charger() rend        │ tout est
           │ vitesse      │ fabriquée        │ la main : la suite    │ fabriqué
           │ (1 seule     │                  │ sera prête à temps    │
           │ fois par     │                  │ (marge ×1,5)          │
           │ appareil)    │                  ▼                       │
           │              │                jouer() ──── lecture ─────┴──────►
```

## Pourquoi ces choix

| Choix | Raison |
|---|---|
| Synthèse dans des **Web Workers** | Le fil principal du jeu reste libre : pas de saccade d’image, pas de retard d’input. Les workers existent partout (iOS, Android, WebView Capacitor, PC). |
| **Aucun nœud Web Audio par note** | C’est ce qui faisait craquer les téléphones : des milliers d’objets créés à la volée et le ramasse-miettes en pleine partie. Ici le fil audio ne lit que des tampons, le travail le moins cher qui soit. |
| **Fabrication sur l’appareil**, pas dans la build | La build ne porte que le code (environ 50 Ko) et la partition. Le son n’est jamais compressé, donc la qualité d’origine est conservée. |
| **Section par section**, une section répétée fabriquée une fois | Démarrage en une fraction de seconde, mémoire limitée à la musique réellement différente. |
| **Vitesse mesurée sur l’appareil** | `charger()` ne rend la main que quand chaque section sera finie 0,4 s avant d’être entendue, avec une marge ×1,5 pour les appareils qui chauffent. Sur un appareil trop lent, le rendu passe à 32 kHz. |
| **Swing et humanisation déterministes** (tirés d’une graine) | La beatmap et le son sortent du même calcul : la note à taper tombe exactement sur la note jouée (moins de 2 ms, vérifié par test). |
| **Horloge = son entendu** (`getOutputTimestamp`, latence de sortie, calibrage) | Le joueur est jugé sur ce qu’il entend, pas sur ce que l’ordinateur croit jouer. Les taps sont datés par l’événement (`ev.timeStamp`), pas par l’image affichée. |
| **Rattrapage sans glissement** | Si une section arrive en retard, elle démarre en cours de route au bon endroit : l’horloge du morceau, et donc la beatmap, ne décale jamais. |
| **Limiteur en sortie** | Filet de sécurité : rien ne sature, même si une partition est mal dosée. |
| **Couches** (`pistes: true`) | Chaque groupe d’instruments a sa piste : le jeu ajoute ou retire les cuivres en fondu selon l’action. Coût : plus de mémoire, signalé par les stats. |

## Utilisation dans un jeu

```js
import { Pupitre } from './pupitre.js';

const ctx = new AudioContext({ latencyHint: 'interactive' });   // un seul contexte pour tout le jeu
const pupitre = new Pupitre(ctx);                                // option : { volume, sortie, workers }

await pupitre.charger(partition, { onProgres: s => barre(s.faites / s.total) });
const notes = pupitre.beatmap(n => n.instr === 'caisse');        // [{ t, instr, midi, vel, mesure, pas, section, tag, duree }]
const temps = pupitre.grille();                                   // [{ t, mesure, temps, section }]

boutonJouer.onclick = () => pupitre.jouer();                     // le son démarre sur un geste (mobile)
pupitre.surFin = () => finDuNiveau();

// à chaque image
const t = pupitre.position();                    // secondes du morceau, telles qu'entendues
// à chaque tap
const tTap = pupitre.tempsA(ev.timeStamp);       // même échelle que la beatmap
pupitre.calibrage = 220;                         // ms, casque Bluetooth (réglage du joueur)

pupitre.groupe('heroique', 0, 1.5);              // couche coupée en 1,5 s
pupitre.arreter(0.3);                            // fondu de sortie
```

Mettre le jeu en pause : `ctx.suspend()` (l’horloge s’arrête avec le son), puis `ctx.resume()`.

Le fichier marche aussi sans module (`<script src="pupitre.js">`, en retirant la dernière ligne `export`) : il expose alors `window.Pupitre` et `window.PupitreEcriture`.

## Écrire une partition

Voir [docs/partition.md](docs/partition.md). En bref :

```js
{
  bpm: 104, sig: [4, 4], swing: 0.56, humain: 5, graine: 3,
  salle: { taille: 0.55, amorti: 0.5, niveau: 0.6 },
  instruments: { rh: { type: 'rhodes', vol: 0.32 }, kick: { type: 'kick' } },
  sections: { A: { mesures: 8, notes: [['kick', 0, 0, 36, 2, 1], ['rh', 0, 14, 62, 7, 0.85]] } },
  forme: ['A', 'A'],
}
```

Une note : `[instrument, mesure, pas, midi, durée en pas, vélocité, tag?]`. Un pas est une double croche (16 par mesure en 4/4), les fractions sont permises.

## Structure

```
src/pupitre.js                    le moteur (un seul fichier, sans dépendance)
exemples/partitions.js            « Serment » (orchestral, 55 voix) et « Poche soul » (jeu de rythme)
exemples/banc-essai.modele.html   page de test : charge, couches, mini jeu de rythme, mesures enregistrées
scripts/construire-banc.mjs       npm run banc → dist/banc-essai.html (page autonome en un fichier)
tests/                            npm test → 47 tests (instruments, morceaux, synchro)
docs/partition.md                 format des partitions et liste des instruments
```

## Mesures de référence

Serveur à 2 cœurs, un seul fil de calcul, morceau « Serment » (1 min 09, 4 sections uniques) :

| | Valeur |
|---|---|
| Prêt à jouer | 0,5 s |
| Tout fabriqué | 2,1 s |
| Vitesse | 16 à 60 fois plus vite que la lecture selon la densité |
| Voix simultanées max | 55 |
| Mémoire | 19 Mo (35 Mo en couches) |
| Décrochages | 0 |

Les mesures sur téléphone se font avec le banc d’essai (`npm run banc`, ou la page publiée « Moteur Pupitre »).

## Limites connues

- Les timbres sont **synthétisés**, sans échantillons : l’orchestre sonne comme un orchestre de synthèse soigné, pas comme de vraies cordes enregistrées. Ils s’amélioreront avec le défi musique.
- La mémoire grandit avec la musique **unique** : environ 0,35 Mo par seconde en stéréo 44,1 kHz, multipliée par le nombre de couches.
- Changer la partition **pendant** la lecture demande un nouveau `charger()` : le moteur n’est pas fait pour une musique générée note à note en temps réel (pour ça, il faudrait un mode AudioWorklet, prévu mais pas fait).
