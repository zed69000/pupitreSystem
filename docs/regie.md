# Vrais instruments et console de mixage

Deux modules à côté du moteur, tous deux facultatifs : sans eux, Pupitre se comporte exactement comme avant.

```
                    ┌──────────────────────── pupitre-banques.js ────────────────────────┐
  banque .sf2 ────► │ ouvrir() : suivi du téléchargement, cache sur l'appareil            │
  (ou dossier       │ equiper(partition) : ne prépare que les instruments du morceau      │
   découpé)         └───────────────┬─────────────────────────────────────────────────────┘
                                    │ jeux d'échantillons (zones + sons 16 bits)
                                    ▼
  partition ──► fils de calcul : chaque note jouée par le VRAI instrument si son jeu est là,
  (inchangée)   par le timbre synthétique sinon                       ──► beatmap : inchangée
                                    │ une piste par famille (batterie, basse, guitares…)
                                    ▼
                    ┌──────────────────────── pupitre-console.js ────────────────────────┐
                    │ tranche : distorsion → égaliseur → chorus → flanger → phaser →     │
                    │           delay → largeur → balance → volume ─┬─► réverbe partagée │
                    │ général : égaliseur → compresseur → largeur ◄─┘                    │
                    └───────────────┬─────────────────────────────────────────────────────┘
                                    ▼
                          volume général → limiteur de sécurité → sortie
```

## Pourquoi cette architecture, et pas un lecteur MIDI temps réel

| Choix | Raison |
|---|---|
| **Les échantillons sont joués dans les fils de calcul**, à l'avance | Le jeu garde ce qui fait Pupitre : aucun nœud audio par note, donc pas de craquement sur téléphone. Un synthé SoundFont temps réel (SpessaSynth et consorts) ramènerait le calcul note par note pendant la partie. |
| **La partition ne change pas** | `type: 'piano'` joue le vrai piano si la banque est là. Les temps sortent du même calcul qu'avant : la beatmap est identique avec ou sans banque (test « la beatmap est la même avec ou sans banque »). |
| **Repli sur le synthé** | Banque absente, instrument manquant, stockage refusé : le morceau joue quand même. Un jeu de rythme muet est injouable. |
| **Silence de tête retiré** à la lecture de la banque | Beaucoup d'enregistrements commencent par quelques millisecondes de blanc. L'attaque doit tomber sur le temps annoncé (moins de 2 ms, testé). |
| **Sons gardés en 16 bits** | Moitié moins de mémoire qu'en flottants, sans perte : c'est le format d'origine des banques. |
| **Mixage sur des pistes, pas sur des notes** | Une dizaine de nœuds fixes par famille, quel que soit le nombre de notes. Un effet à zéro n'est pas câblé. |
| **Pas de compresseur par piste** | Un compresseur anticipe de 6 ms : une seule piste compressée serait décalée des autres. Le compresseur est donc général, et son retard est déclaré à l'horloge (`regie.latence`), mesuré dans `tests/navigateur`. |
| **Web Audio natif, sans Tone.js** | Tous les effets demandés existent en nœuds natifs (filtres, retards, mise en forme, convolution). Une bibliothèque de plus pèserait 300 Ko pour le même résultat. |

## Mettre de vrais instruments dans un jeu

```js
import { Pupitre } from './pupitre.js';
import { Banques } from './pupitre-banques.js';

const pupitre = new Pupitre(ctx), banques = new Banques(pupitre);

// 1. au lancement du jeu, sans bloquer : la banque (une seule fois, puis lue depuis le cache)
banques.ouvrir('sons/banque.sf2', { onProgres: p => barre(p.recu / p.total) });
//    ou un dossier découpé par scripts/decouper-banque.mjs : seul l'index est téléchargé
banques.ouvrirDossier('sons/');

// 2. avant chaque morceau : seulement ses instruments
await banques.equiper(partition, { onProgres: p => barre(p.faits / p.total) });
await pupitre.charger(partition);
```

`equiper()` renvoie `{ instruments, manquants, pauvres }`.

### Les garde-fous : une banque modeste n'abîme jamais un morceau

```
pour chaque instrument du morceau
   ├─ absent de la banque ───────────────► synthé
   ├─ trop pauvre (un cycle bouclé) ─────► synthé            (dureeMin : 0,2 s en moyenne par son)
   ├─ sourd (enregistré sous 20 kHz) ────► vrai + 35 % de synthé qui rend les aigus   (doublure)
   ├─ batterie, rythmique électronique ──► synthé            (batterie : 'auto')
   └─ sinon ─────────────────────────────► vrai instrument
puis : niveau calé sur celui du synthé remplacé (4 notes de sa partie, jouées des deux façons)
       └─ encore trop faible une fois le pic plafonné ? le synthé le double pour rendre le corps
```

- **Pourquoi écarter les jeux pauvres** : les petites banques tiennent en quelques Mo en remplaçant l'enregistrement par un seul cycle d'onde bouclé (20 ms). C'est moins bon que le timbre synthétique de Pupitre, qui a ses enveloppes et son filtre.
- **Pourquoi garder la boîte à rythmes** : un morceau à basse de synthé ou à kick électronique est écrit pour elle ; une batterie acoustique enregistrée changerait son style. `equiper(P, { batterie: true })` force la vraie batterie.
- **Pourquoi caler les niveaux** : le mixage est écrit dans la partition (les `vol`). Un vrai instrument plus fort ou plus faible que le synthé qu'il remplace le fausserait. Vérifié sur les 30 partitions de Beat Splash : niveau du mélange entre 0,6 et 1,1 fois celui du synthé, pics comparables.

### Dans la partition

| Clé d'instrument | Rôle |
|---|---|
| (rien) | Le type choisit seul : `piano`, `violons`, `kick`… sont joués par la banque. Les synthés (`nappe`, `supersaw`, `synth_*`, `chip`, `talkbox`, `kick_electro`) restent synthétisés : là, le synthé est l'instrument. |
| `reel: false` | Garde le timbre synthétique pour cet instrument. `partition.reel = false` pour tout le morceau. |
| `synthe: 0.3` | Doublure : le timbre synthétique mélangé au vrai instrument, à 30 % de son volume. |
| `type: 'ech', prog: 40, secours: 'violons'` | Un programme General MIDI précis (40 = violon solo). `secours` joue si la banque ne l'a pas. `banque: 128` pour un kit de batterie. |
| `dynamique` | De combien d'octaves le son s'assombrit quand on joue doux (2,5 par défaut, 0 = aucun effet). |
| `desaccord` | Écart de justesse aléatoire d'une note à l'autre, en cents (3 par défaut). Tiré de la graine : identique à chaque chargement. |
| `attaque`, `chute`, `soutien`, `relache` | Remplacent l'enveloppe de la banque (secondes ; `soutien` de 0 à 1). |
| `entier` | `true` : la note sonne jusqu'au bout de l'enregistrement, la durée écrite ne l'étouffe pas (défaut pour la batterie). |
| `largeur` | Écart stéréo des enregistrements (1 = celui de la banque, 0 = mono). |

Correspondance type → programme General MIDI : table `GM` de `pupitre-banques.js`.

### Choisir une banque

- Format accepté : **SoundFont 2 (.sf2)**. Les banques compressées (.sf3) et les DLS ne sont pas lues ; une banque .sf3 se convertit en .sf2 avec Polyphone.
- **GeneralUser GS** (S. Christian Collins, environ 30 Mo) : licence permissive qui autorise l'usage commercial et l'intégration dans un logiciel. L'auteur précise toutefois qu'il ne peut pas garantir l'origine de chaque échantillon : à relire avant une sortie sur les stores.
- Pour la build d'un jeu, découper la banque : `node scripts/decouper-banque.mjs banque.sf2 sons/`. Le jeu ne télécharge alors que les instruments du morceau (1 à 3 Mo chacun).
- Ce qui n'est pas lu dans une banque : les modulateurs, le vibrato et l'enveloppe de filtre propres à chaque son. Le timbre, les couches de vélocité, les boucles, l'enveloppe de volume, le panoramique et les coupures de charley le sont.

## Console de mixage

```js
import { Regie } from './pupitre-console.js';

const regie = new Regie(pupitre, { profil: 'auto' });   // avant pupitre.charger() ; relit les réglages gardés
regie.panneau(document.querySelector('#audio'));         // l'interface, dans un élément du jeu

regie.regler('batterie', 'vol', 0.9);
regie.regler('guitares', 'disto', 0.25);
regie.regler('cordes', 'solo', true);
regie.reglerGeneral('comp', 0.4);
regie.profil('orchestre');
regie.sauver();            // réglages courants ; regie.sauver('mon mix') = profil personnel
```

Dès qu'une régie est branchée, `charger()` fabrique **une piste par famille** au lieu d'une seule. Les couches du jeu (`pistes: true`, `pupitre.groupe()`) continuent de marcher : les pistes deviennent `couche/famille`.

| Famille | Types |
|---|---|
| `batterie` | kick, caisse, charley, cymbales, clap, shaker, toms, timbales, grosse caisse |
| `basse` | basse, contrebasse pizz, synth_basse |
| `guitares` | guitare, guitare_sat, guitare_etouffee |
| `pianos` | piano, rhodes, orgue |
| `cordes` | violons, altos, violoncelles, contrebasses, cordes_stacc, pizz, harpe |
| `cuivres` | cors, trompettes, trombones, cuivres_stab |
| `synthes` | nappe, supersaw, synth_lead, synth_pluck, synth_cuivres, chip, talkbox |
| `autres` | tout le reste (bois, chœur, percussions accordées). `famille: 'cordes'` sur un instrument le range ailleurs. |

Réglages d'une tranche : `vol`, `pan`, `muet`, `solo`, `effets` (coupe tout le traitement), égaliseur paramétrique (`grave`, `graveF`, `medium`, `mediumF`, `mediumQ`, `aigu`, `aiguF`), `reverbe`, `chorus`, `flanger`, `phaser`, `delay` (`delayTemps` en temps du morceau, `delayRetour`), `disto` (`distoGain`), `largeur`. Bornes et valeurs par défaut : `Regie.TRANCHE` et `Regie.GENERAL`.

Profils : `rock`, `pop`, `electro`, `orchestre`, `acoustique`, `neutre`, et `auto`, qui lit les instruments du morceau (guitare saturée → rock ; synthés majoritaires → électro ; trois instruments d'orchestre sans kick, basse électrique ni guitare → orchestre ; ni batterie ni synthé → acoustique ; sinon pop). Une partition peut trancher elle-même avec `profil: 'rock'`. Les écarts restent mesurés : 3 dB au plus à l'égaliseur, 35 % au plus pour un effet (vérifié par test). Changer de profil garde les volumes, balances, muets et solos réglés à la main.

## Ce que ça coûte

| | Sans console | Avec console |
|---|---|---|
| Mémoire de la musique | 0,35 Mo par seconde de musique unique | la même, **multipliée par le nombre de familles présentes** (3 à 6 en général) |
| Mémoire de la banque | taille des instruments du morceau × (fils de calcul + 1) | idem |
| Retard ajouté | 0 | 0, ou 6 ms si le compresseur général est actif (déclaré à l'horloge) |

Sur un téléphone à court de mémoire, garder la console pour les réglages et livrer le jeu sans elle (`new Pupitre(ctx)` seul) : les vrais instruments restent.

## Vérifier

- `npm test` : 5 tests sur une vraie banque quand la machine en a une (`BANQUE=chemin.sf2`, par défaut TimGM6mb de Debian) : justesse comparée à FluidSynth, attaques, niveaux, et les 30 partitions de Beat Splash fabriquées en vrais instruments. Sautés sinon.
- `npm test` : 25 tests de plus (banque lue, justesse à 440 Hz, boucle, couches de vélocité, synchro à moins de 2 ms, beatmap identique, repli sur le synthé, console, profils, sauvegarde).
- `npm run banc && npm run test:navigateur` : dans Chrome, les fils de calcul, le cache, le panneau, et l'heure réelle de chaque attaque mesurée sur le son sorti.
- `dist/regie.html` : la page d'écoute. Choisir une banque, un morceau, comparer vrais instruments et synthé, régler la console.
