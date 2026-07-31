# Millénaire 9 — Guide de contenu (français)

Référence pratique pour les modders qui ajoutent ou modifient du contenu
Millénaire sans recompiler le mod.

- Templates à copier : **`millenaire/_templates/`**
- Catalogues de référence auto-générés (IDs de goals, gathering handlers,
  points spéciaux) : **`millenaire/_reference/`**
- Ce guide est livré par la version `9.0.0-dev-preview.5` du mod (le fichier
  est redéployé à chaque démarrage — ne l'éditez pas en place ; vos
  modifications seront effacées).
- English version: `content-guide.en.md` (alongside this file).

---

## §1. Distribution et cycle de vie

### 1.1 Côté serveur, côté client, ou les deux ?

Millénaire est avant tout un mod de **contenu côté serveur**. Cultures,
plans de bâtiments, types de villageois, gathering goals, quêtes,
phrases — toutes les données décrites dans ce guide sont lues par le
serveur au démarrage du monde. Un client se connectant à un serveur
multijoueur n'a **pas** besoin de fournir les fichiers de données : le
serveur conduit les comportements, et le protocole transporte assez de
métadonnées pour que le client affiche villageois et dialogues.

Une exception : les **assets du resource pack** (textures, modèles, sons).
Une culture custom ne s'affichera correctement que sur un client qui a les
fichiers correspondants sous
`millenaire-custom/<submod>/cultures/<c>/resourcepack/assets/...`. Un
client sans ces fichiers voit les skins Millénaire par défaut ; le monde
fonctionne quand même.

En solo et en LAN il n'y a pas de distinction — le serveur intégré et le
client partagent la même JVM et le même dossier `millenaire-custom/`.

### 1.2 Distribuer un pack de contenu

Livrez `millenaire-custom/<votre-pack>/` sous forme de zip. Les joueurs le
décompressent directement sous leur dossier `millenaire-custom/` (côté
serveur, et — si des textures sont incluses — sur chaque client). Le mod
est mis à jour indépendamment ; votre pack survit à toutes les mises à
jour de Millénaire.

Vous ne devez **pas** livrer quoi que ce soit depuis `millenaire/`. Cette
arborescence est gérée par le mod et régénérée à chaque mise à jour.

### 1.3 Pas de rechargement à chaud

Il n'existe pas de `/millenaire reload`. Tout le contenu est lu à
`ServerStartedEvent` et mis en cache pour la durée de vie du monde. Après
toute modification dans `millenaire-custom/`, redémarrez le serveur pour
que les changements prennent effet. Quelques sous-commandes **diagnostic**
existent (cf. §9) mais elles ne rechargent pas les fichiers ; uniquement
les structures de données déjà en mémoire.

### 1.4 Commandes utiles

`/millenaire dev …` est le parapluie des outils de développement / debug
(niveau de permission 2). Sous-commandes utiles aux auteurs de contenu :

- `/millenaire dev export <…>` — exporte rapports de coûts, données de
  round-trip NBT, etc.
- `/millenaire dev convert-addon <path>` — mode strict CONVERT pour les
  packs legacy 1.12 (cf. §8).
- `/millenaire dev import-culture <…>` — outils de debug autour du
  chargement des cultures custom.

La liste exhaustive vient de `DevCommand.register()`. Utilisez la
complétion en jeu.

---

## §2. Le modèle 2-directory

Millénaire stocke le contenu dans deux dossiers voisins, à côté de votre
serveur ou instance Minecraft :

```
<gameDir>/
├── millenaire/            # GÉRÉ PAR LE MOD, regénéré à chaque changement de version
└── millenaire-custom/     # GÉRÉ PAR VOUS, jamais touché par le mod
```

### 2.1 `<gameDir>/millenaire/` — géré par le mod

Ce dossier est **wipé et entièrement redéployé** à chaque changement de
version (montée comme rétrogradation). Son rôle : exposer sur disque tout
le contenu shipping pour inspection et copie-comme-template, et livrer le
matériel destiné aux développeurs (ce guide, templates, catalogues de
référence).

Conséquences pratiques :

- **Inspectez, copiez depuis, mais n'éditez rien** ici. Vos modifications
  seront effacées à la prochaine mise à jour.
- Le fichier `_deployed_version.txt` à la racine indique la version du mod
  qui a écrit l'arborescence.
- Un fichier d'avertissement est aussi déposé à la racine
  (`WARNING - changes here will be overwritten on update.txt`) pour que la
  règle soit visible même par un joueur qui zappe ce guide.
- En développement (`./gradlew runServer` / `runClient`, c.-à-d.
  `FMLEnvironment.production == false`), le contrôle de version est
  bypassé et l'arborescence est redéployée à chaque démarrage. Les
  modifications dans `src/main/resources/millenaire/...` sont donc prises
  en compte sans bumper la version du mod.

### 2.2 `<gameDir>/millenaire-custom/` — géré par vous

Ce dossier n'est **jamais écrit par le mod**. Aucun deployer, aucun
fichier auto-généré, aucune machinerie de versioning n'y touche. Tout ce
que vous y placez survit aux mises à jour, sans modification.

Tout le contenu personnalisé est livré sous forme de **sub-mods** : chaque
enfant direct de `millenaire-custom/` est un sub-mod, avec son propre
arbre `cultures/`, `languages/`, `gathering_type/` et/ou `quests/`. Choisis
n'importe quel nom de répertoire matchant `[A-Za-z0-9_-]+` (`my-pack`,
`viking_pack`, `BUILDINGSNORMAN_converted`, …). Les noms `cultures`,
`languages`, `gathering_type`, `quests` et `exports` sont **réservés** au
niveau racine et **ne doivent pas** être utilisés comme racine de sub-mod
— le contenu posé directement sous l'un d'eux est rejeté avec un WARN au
démarrage.

Cela inclut :

- Les nouvelles cultures (`millenaire-custom/<submod>/cultures/<your_id>/`).
- Les overrides sur cultures shipping
  (`millenaire-custom/<submod>/cultures/norman/...`).
- Les langues et dialogues custom.
- Les quêtes et gathering types custom.
- Les assets resource-pack pour les textures.
- Les exports Import-Table (`millenaire-custom/exports/`, le seul
  répertoire réservé top-level qui n'est *pas* une source de contenu —
  c'est le sink de l'Import Table).
- Un `README.{en,fr}.md` placé à la racine, déployé une seule fois au
  premier démarrage (jamais écrasé ensuite).

### 2.3 Où poser quoi

(Choisissez n'importe quel nom de sub-mod `[A-Za-z0-9_-]+` ; `<submod>`
ci-dessous est un placeholder.)

| Vous voulez … | Posez-le sous |
|---|---|
| Tester un tweak jetable | `millenaire-custom/<submod>/` (quand même — `millenaire/` n'est pas sûr même pour de l'essai) |
| Override un building plan shipping | `millenaire-custom/<submod>/cultures/<c>/buildings/<cat>/<id>.json` |
| Ajouter un villager type à une culture shipping | `millenaire-custom/<submod>/cultures/<c>/villagers/<cat>/<id>.json` |
| Ajouter une nouvelle culture | `millenaire-custom/<submod>/cultures/<your_id>/...` |
| Ajouter des chaînes de langue | `millenaire-custom/<submod>/languages/<lang>/<file>.txt` |
| Ajouter une quête | `millenaire-custom/<submod>/quests/<subdir>/<id>.json` |
| Livrer des textures | `millenaire-custom/<submod>/cultures/<c>/resourcepack/assets/...` |
| Poser un pack legacy 1.12 | `millenaire-custom/<pack-name>/` (auto-converti, cf. §8) |

### 2.4 Le fichier WARNING

Le mod écrit
`millenaire/WARNING - changes here will be overwritten on update.txt`
à chaque redéploiement. Les joueurs qui fouillent dans `millenaire/` le
voient immédiatement. Le fichier renvoie vers `millenaire-custom/` et vers
ce guide pour le workflow d'authoring. C'est un garde-fou, pas la
référence : la vraie doc, c'est ici.

---

## §3. Le layout iso-legacy nested

Le contenu d'une culture vit dans une arborescence imbriquée sous
`cultures/<culture>/`, calquée sur le layout legacy 1.12. La même forme
est utilisée par `millenaire/cultures/<c>/` (mod-owned) et
`millenaire-custom/<submod>/cultures/<c>/` (votre overlay dans un sub-mod).

### 3.1 Hiérarchie par culture

```
cultures/<c>/
├── culture.json                  # métadonnées culture (nom, langue, biomes, ...)
├── traded_goods.json             # catalogue économique (merge additif)
├── reputation.json               # labels de réputation village (replace)
├── culture_reputation.json       # ladder réputation joueur-vs-culture (replace)
├── buildings/                    # plans de bâtiments (JSON + NBT)
│   ├── townhalls/
│   ├── houses/
│   ├── farms/
│   └── ...                       # cf. §3.2 pour la liste canonique
├── villagers/                    # types de villageois
│   ├── leaders/
│   ├── farmers/
│   └── ...                       # cf. §3.3 pour la liste canonique
├── villages/                     # types de villages (layouts)
│   └── *.json
├── shops/                        # profils de shops
│   └── *.json
└── namelists/                    # *.txt banques de noms
    ├── men_names.txt
    ├── women_names.txt
    └── family_names.txt
```

C'est aussi le wire format attendu par tous les loaders. Il n'y a pas de
layout "plat" séparé : tout est imbriqué.

### 3.2 Catégories canoniques de bâtiments

La **catégorie** d'un bâtiment est encodée dans le nom du dossier qui le
contient. Le champ `category` du JSON doit correspondre au nom du dossier.

| Dossier | Rôle |
|---|---|
| `townhalls/` | Cœur du village, accueille le leader |
| `houses/` | Bâtiments résidentiels (un foyer chacun) |
| `farms/` | Production agricole / élevage |
| `crafts/` | Artisans (forge, tisseur, ...) |
| `shops/` | Bâtiments de commerce spécialisés |
| `services/` | Auberges, marchés, tavernes, ... |
| `temples/` | Bâtiments religieux |
| `military/` | Garnisons, tours de guet |
| `wonders/` | Marvels (one-shot par culture) |
| `loner_buildings/` | Bâtiments isolés (sans village) |
| `nature/` | Ruines, structures naturelles générées comme contenu |
| `other/` | Tout ce qui n'entre nulle part ci-dessus |

La liste est figée par les loaders Millénaire. Si vous créez un dossier
sous `buildings/` avec un nom inconnu, il est ignoré.

### 3.3 Catégories canoniques de villageois

Même logique — dossier == catégorie.

| Dossier | Rôle |
|---|---|
| `leaders/` | Leader du village et conjoint |
| `farmers/` | Travailleurs des champs, éleveurs |
| `craftsmen/` | Forgerons, tisserands, charpentiers, ... |
| `merchants/` | Commerçants, marchands étrangers |
| `religious/` | Prêtres, moines |
| `military/` | Gardes, soldats |
| `other/` | Enfants, adultes génériques, etc. |

### 3.4 Fichiers culture-scope vs globaux

Certains contenus sont **par culture** (sous `cultures/<c>/...`) ; d'autres
sont **globaux** (à la racine de l'arborescence).

| Famille | Scope | Chemin |
|---|---|---|
| Cultures, buildings, villagers, villages, shops, namelists, traded_goods, reputation | Par culture | `cultures/<c>/...` |
| Gathering types | Global | `gathering_type/*.json` |
| Quêtes | Global | `quests/<subdir>/*.json` |
| Langues | Global | `languages/<lang>/*.txt` |
| Visit goals | Global | `visit_goal/*.json` |
| Villager config (animation tunables) | Global | `villager_config/*.json` |

Un gathering type référencé par un villager type doit donc être visible
depuis n'importe quelle culture. Vos gathering types custom vivent à
`millenaire-custom/<submod>/gathering_type/<id>.json`, pas sous `cultures/...`.

### 3.5 Sémantique de merge par famille

Trois règles couvrent tous les loaders :

- **REPLACE_FIRST_ALPHA** — overlay par fichier. Le premier sub-mod
  alphabétiquement qui livre un basename donné gagne. Les sub-mods
  suivants qui livrent le même basename émettent un WARN one-shot au
  chargement. Les couches de base (mod-shipped `millenaire/`, puis JAR)
  sont consultées en dernier.
- **APPEND** — additif. Chaque sub-mod contribue par-dessus la base. Les
  doublons sont déduplicés sur une clé évidente (texte de ligne, ID, ...).
- **DISABLED** — `_disabled.json` liste des IDs à ignorer côté base et
  côté overlay. Les listes de plusieurs sub-mods sont unionnées.

Tableau par famille :

| Famille | Merge | Notes |
|---|---|---|
| `culture.json` | REPLACE_FIRST_ALPHA | Remplace tout l'enregistrement. |
| `reputation.json` | REPLACE_FIRST_ALPHA | Remplace tout l'enregistrement. |
| `culture_reputation.json` | REPLACE_FIRST_ALPHA | Remplace tout l'enregistrement. |
| `traded_goods.json` | APPEND | Clé `id` ; un overlay avec `disabled: true` retire l'entrée base. |
| `buildings/<cat>/<id>.json` | REPLACE_FIRST_ALPHA | Par fichier. Le `.nbt` associé suit la même règle. |
| `villagers/<cat>/<id>.json` | REPLACE_FIRST_ALPHA | Par fichier. |
| `villages/<id>.json` | REPLACE_FIRST_ALPHA | Par fichier. |
| `shops/<id>.json` | REPLACE_FIRST_ALPHA | Par fichier. |
| `namelists/<name>.txt` | APPEND | Par ligne, dedup. |
| `<c>_sentences.txt` | APPEND | Ajoute des lignes `role.goalKey=text`, dedup par texte exact. |
| `<c>_dialogues.txt` | APPEND nouvelles clés seulement | Les clés existantes sont SKIPPÉES avec WARN pour préserver le déterminisme `speechRef.lineIdx` entre serveur et client. |
| `gathering_type/<id>.json` | REPLACE_FIRST_ALPHA | Par fichier (scope global). |
| `quests/<subdir>/<id>.json` | REPLACE_FIRST_ALPHA | Par fichier (scope global). |
| `_disabled.json` | DISABLED | Par dossier de contenu ; liste des IDs à ignorer côté base et overlay. |

Cette matrice est la source de vérité. En cas de doute, vérifiez le
comportement du loader contre cette table.

---

## §4. Sub-mods : authoring en couches

Tout le contenu personnalisé vit dans des **sub-mods** — arborescences
indépendantes vivant côte à côte sous `millenaire-custom/`. Il n'y a pas
de layout flat-root : poser du contenu directement sous
`millenaire-custom/cultures/...` est rejeté avec un WARN au démarrage.

### 4.1 Bases d'un sub-mod

- Un sub-mod est tout enfant direct de `millenaire-custom/` dont la
  racine contient au moins un de `cultures/`, `languages/`,
  `gathering_type/` ou `quests/`.
- Les noms de répertoire sub-mod doivent matcher `[A-Za-z0-9_-]+` pour
  se combiner sans ambiguïté avec les ids de culture dans les chaînes
  dérivées (e.g. ids de resource pack). Les noms hors de ce shape sont
  ignorés avec un WARN one-shot.
- Les noms `cultures`, `languages`, `gathering_type`, `quests` et
  `exports` sont réservés au niveau racine — jamais des noms de sub-mod.
- Utilisez les sub-mods pour :
  - livrer un pack cohérent que vous voulez versionner et zipper
    indépendamment,
  - garder plusieurs packs non liés côte à côte sans collision de chemins,
  - consommer des packs legacy 1.12 (chacun atterrit dans son propre
    sub-mod `<name>_converted/`, cf. §8).

### 4.2 Layout d'un sub-mod

```
millenaire-custom/
├── my-cool-pack/                # ← un sub-mod
│   ├── cultures/
│   │   └── viking/
│   │       └── ...
│   ├── languages/
│   │   └── en_us/
│   │       └── viking_sentences.txt
│   └── gathering_type/
│       └── viking_fishing.json
├── another-pack/                # ← un autre sub-mod
│   └── cultures/
│       └── norman/
│           └── buildings/
│               └── houses/
│                   └── tweaked_house.json
└── exports/                     # ← sink Import Table (réservé, pas un sub-mod)
```

### 4.3 Ordre de résolution

Les sub-mods sont itérés en **ordre alphabétique** de leur nom de
répertoire.

Pour les familles REPLACE_FIRST_ALPHA, le premier sub-mod alphabétique
qui livre le fichier gagne. Pour les familles APPEND, chaque sub-mod
contribue.

### 4.4 Retirer du contenu shipping

Pour supprimer un building plan / villager type / village type shipping
sans livrer de remplacement, posez un `_disabled.json` dans le même
dossier de votre sub-mod :

```json
// millenaire-custom/my-cool-pack/cultures/norman/buildings/houses/_disabled.json
["bourg1", "bourg2"]
```

Les IDs listés sont retirés du contenu base et de tout overlay sub-mod
avant que le loader ne les voie. Les listes `_disabled.json` de plusieurs
sub-mods sont unionnées.

Les entrées `traded_goods.json` acceptent aussi `"disabled": true` par
ligne pour supprimer un good shipping spécifique.

### 4.5 WARN sur conflits REPLACE

Quand deux sub-mods livrent le même basename dans une famille
REPLACE_FIRST_ALPHA, le loader émet un WARN one-shot nommant les fichiers
en conflit. Traitez-le comme un vrai warning : le second fichier est
silencieusement ignoré. Si les deux sub-mods sont les vôtres, renommez
l'un. S'ils sont deux packs non liés, c'est à l'opérateur de décider
lequel garder.

### 4.6 Anti-masking avec `_converted/`

Si un enfant direct `<name>/` et un voisin `<name>_converted/` existent
tous les deux, le runtime ignore complètement `<name>/` (il est traité
comme une source legacy que le converter va réécrire en
`<name>_converted/`). Pour forcer une reconversion, supprimez le voisin
`_converted/`.

---

## §5. Démarrage rapide

### 5.1 Ajouter un bâtiment à une culture existante

Layout disque minimum (choisissez n'importe quel nom de sub-mod
`[A-Za-z0-9_-]+`) :

```
millenaire-custom/
└── my-norman-tweaks/         # ← votre sub-mod
    └── cultures/
        └── norman/
            └── buildings/
                └── houses/
                    ├── my_house.json
                    └── my_house.nbt
```

Les deux fichiers partagent le basename. Le `.json` décrit le plan (une
copie de `millenaire/_templates/_template_building.json`, éditée) : il
doit déclarer `category == "houses"` (correspondant au dossier) et
référencer le NBT via son champ `template`. Le `.nbt` est capturé en jeu
avec le bloc **Import Table** (cf. §6.1 pour le workflow complet).

Après sauvegarde, redémarrez le serveur. Vous devriez voir une ligne de
log du genre `Loaded external building_plan 'norman/my_house'` près du
boot.

### 5.2 Créer une culture entièrement nouvelle

Layout disque minimum (choisissez n'importe quel nom de sub-mod
`[A-Za-z0-9_-]+`) :

```
millenaire-custom/
└── viking-pack/                       # ← votre sub-mod
    ├── cultures/
    │   └── viking/
    │       ├── culture.json
    │       ├── namelists/
    │       │   └── men_names.txt          # au moins une namelist
    │       ├── villagers/
    │       │   └── leaders/
    │       │       └── leader.json        # au moins un villager type
    │       ├── villages/
    │       │   └── basic_village.json     # au moins un village type, role=centre
    │       ├── buildings/
    │       │   └── townhalls/
    │       │       ├── townhall.json      # au moins un plan townhall
    │       │       └── townhall_a_0.nbt
    │       └── shops/
    │           └── townhall.json          # shop pour le townhall
    └── languages/
        └── en_us/
            └── viking_sentences.txt       # au moins en_us
```

`culture.json` déclare l'ID (`[a-z0-9]+`), le nom lisible, le tag de
langue, les tags de biomes de spawn, et les catégories travel-book.
Utilisez `millenaire/_templates/_template_culture.json` comme point de
départ et `millenaire/cultures/norman/culture.json` comme exemple réel.

Le cap est `MAX_CUSTOM_CULTURES = 50` (tronqué alphabétiquement au-delà).
Les IDs custom sont validés contre `[a-z0-9]+` — pas d'underscore, pas de
tiret, pas de majuscule.

---

## §6. Workflows par cas d'usage

### 6.1 Ajouter un bâtiment à une culture shipping

1. Capturez la structure en jeu via le bloc Import Table (voir
   `millenaire/_reference/README.txt` pour le workflow Import Table
   complet, plus
   [docs/feat/import-table-roundtrip.md](https://github.com/Kinniken/Millenaire/blob/main/docs/feat/import-table-roundtrip.md)
   pour les détails). L'Import Table écrit le JSON et le NBT dans
   `millenaire-custom/exports/`.

2. **Où vit le NBT.** Les NBT de bâtiments sont adressés via deux chemins :

   - **Mirror sidecar** (celui livré aux auteurs) :
     `cultures/<c>/buildings/<cat>/<id>.nbt`, à côté du JSON. C'est où vous
     posez votre fichier et ce que Millénaire déploie quand il livre du
     contenu.
   - **Chemin de backing resource-location** :
     `data/<namespace>/structure/<c>/<id>.nbt`. Le mod lit aussi depuis
     là quand un plan référence le NBT via son champ `template` (par ex.
     `millenaire-custom:viking/townhall_a_0`). Le deployer mirroir la
     copie sidecar sous ce chemin pour que les deux fonctionnent.

   En pratique, **posez votre `.nbt` à côté du `.json`** sous
   `cultures/<c>/buildings/<cat>/` ; le loader gère le reste.

3. Éditez le JSON généré pour remplir `category`, `tags`, `male` /
   `female` / `male_residents` / `female_residents`, `priority_move_in`,
   `footprint`, etc. Voir
   [docs/feat/custom-content.md](https://github.com/Kinniken/Millenaire/blob/main/docs/feat/custom-content.md)
   §2 et la forme variant/level décrite dans
   [docs/archive/specs-implemented/custom-content-format-v2.md](https://github.com/Kinniken/Millenaire/blob/main/docs/archive/specs-implemented/custom-content-format-v2.md).

4. Déplacez (ou copiez) le `.json` et le `.nbt` depuis
   `millenaire-custom/exports/` vers
   `millenaire-custom/<submod>/cultures/<c>/buildings/<cat>/<id>.{json,nbt}`.

5. Pour que le village place réellement le nouveau bâtiment, ajoutez l'ID
   du plan à une entrée `layout` du village type sous
   `cultures/<c>/villages/<id>.json`.

6. Redémarrez le serveur. Le log de boot affiche
   `Loaded external building_plan '<c>/<id>'`. Si le JSON ne parse pas,
   cherchez la ligne `Error loading external building_plan` correspondante.

→ **Variation : ajouter un villager type.** Même forme —
`cultures/<c>/villagers/<cat>/<id>.json`, copie depuis
`millenaire/_templates/_template_villager.json`, dépose, redémarre.

→ **Variation : ajouter un village type.** Même forme —
`cultures/<c>/villages/<id>.json`, copie depuis
`millenaire/_templates/_template_village_type.json`, dépose, redémarre.

### 6.2 Override un fichier shipping (REPLACE)

Mirroir le chemin sous la racine de votre sub-mod. Exemple : modifier le
layout du village agricole normand.

```
millenaire-custom/<submod>/cultures/norman/villages/agricole.json
```

Quoi que dise votre fichier, il remplace entièrement l'équivalent shipping
(pas de merge des champs). Démarrez le serveur une fois, puis vérifiez
que le fichier que vous venez d'écrire a pris effet (le log de boot
mentionne le fichier sous votre chemin custom, pas sous le chemin
shipping).

→ **Variation : override un NBT.** Même règle de mirror —
posez votre `<c>/<cat>/<id>.nbt` à côté d'un `<c>/<cat>/<id>.json`
(nouveau ou shipping).

### 6.3 Désactiver un fichier shipping

Deux options équivalentes selon la famille :

**(a) `_disabled.json` (familles REPLACE).** Posez-en un dans le dossier et
listez les IDs :

```json
// millenaire-custom/<submod>/cultures/norman/villagers/farmers/_disabled.json
["lumberman"]
```

Le loader retire ces IDs du contenu base et de l'overlay avant
d'assembler le registry runtime.

**(b) `disabled: true` par ligne (familles APPEND).** Pour
`traded_goods.json`, une entrée overlay avec l'`id` correspondant et
`disabled: true` retire l'entrée base. Même pattern pour toute autre
famille APPEND-avec-id.

### 6.4 Étendre une liste additive

Exemples :

- **Namelists.** Posez
  `millenaire-custom/<submod>/cultures/norman/namelists/men_names.txt` ne contenant
  que les nouveaux noms à ajouter. Les lignes sont ajoutées par-dessus la
  liste shipping, dédupliquées par texte exact.
- **Traded goods.** Posez
  `millenaire-custom/<submod>/cultures/norman/traded_goods.json` avec les nouvelles
  entrées. Chaque entrée a besoin d'un `id` unique. Pour supprimer une
  entrée base, livrez le même `id` avec `disabled: true`.
- **Sentences.** Ajoutez des lignes à
  `millenaire-custom/<submod>/languages/<lang>/<c>_sentences.txt`. Format :
  `role.goalKey=text`. Les lignes qui matchent une clé existante mais
  avec un nouveau texte sont appendues (dedup par texte exact). Les
  lignes exactement identiques sont des no-ops.
- **Dialogues.** Même chemin —
  `millenaire-custom/<submod>/languages/<lang>/<c>_dialogues.txt`. **Asymétrique**
  avec les sentences : seules les **nouvelles clés** sont appendues. Un
  overlay qui redéfinit une clé existante est SKIPPÉ avec un WARN ; cela
  préserve le déterminisme `speechRef.lineIdx` entre serveur et client.
  Pour override un dialogue existant, il faut le désactiver (replace via
  la machinerie `speechRef` — hors scope de ce guide).

---

## §7. Catalogue par famille

Référence compacte par famille. **La doc champ-par-champ des JSON vit
dans les templates et dans
[docs/feat/custom-content.md](https://github.com/Kinniken/Millenaire/blob/main/docs/feat/custom-content.md)** ;
les entrées ci-dessous indiquent où chaque famille vit, comment elle merge,
et où trouver un exemple complet.

### Cultures

- **Where** : `cultures/<c>/culture.json`
- **What** : Identité de la culture — nom, tag de langue, biomes de spawn,
  catégories travel-book, weight.
- **Merge** : REPLACE_FIRST_ALPHA
- **Template** : `_templates/_template_culture.json`
- **Reference** : `millenaire/cultures/norman/culture.json`

### Reputation

- **Where** : `cultures/<c>/reputation.json` (ladder rep village),
  `cultures/<c>/culture_reputation.json` (ladder rep joueur-vs-culture)
- **What** : Labels de seuil et effets affichés dans le panneau.
- **Merge** : REPLACE_FIRST_ALPHA par fichier
- **Template** : aucun — copier le fichier shipping
- **Reference** : `millenaire/cultures/norman/reputation.json`

### Traded goods

- **Where** : `cultures/<c>/traded_goods.json`
- **What** : Catalogue des items que les shops de la culture échangent,
  avec prix, ranks, association de tags shop.
- **Merge** : APPEND clé `id` ; `"disabled": true` retire une entrée base
- **Template** : aucun (format compact)
- **Reference** : `millenaire/cultures/norman/traded_goods.json`

### Shops

- **Where** : `cultures/<c>/shops/<id>.json`
- **What** : Profil de shop — quels IDs de traded-goods le shop offre /
  achète à chaque level.
- **Merge** : REPLACE_FIRST_ALPHA par fichier
- **Template** : aucun
- **Reference** : `millenaire/cultures/norman/shops/townhall.json`

### Building plans

- **Where** : `cultures/<c>/buildings/<category>/<id>.json` (+ `.nbt`
  associé)
- **What** : Métadonnées de plan — variants, levels, tags, footprint,
  attribution household. Backé par un template NBT.
- **Merge** : REPLACE_FIRST_ALPHA par fichier (JSON et NBT
  indépendamment)
- **Template** : `_templates/_template_building.json`
- **Reference** : `millenaire/cultures/norman/buildings/houses/bourg1.json`

### Villager types

- **Where** : `cultures/<c>/villagers/<category>/<id>.json`
- **What** : Identité villageois — genre, skin, goals, inventaire, coût
  d'embauche, affichage travel-book. Les goals référencent gathering
  types et visit goals.
- **Merge** : REPLACE_FIRST_ALPHA par fichier
- **Template** : `_templates/_template_villager.json`
- **Reference** : `millenaire/cultures/norman/villagers/leaders/leader.json`

### Village types

- **Where** : `cultures/<c>/villages/<id>.json`
- **What** : Layout du village — liste d'IDs de plans, filtres biomes,
  weight de spawn, completion de départ.
- **Merge** : REPLACE_FIRST_ALPHA par fichier
- **Template** : `_templates/_template_village_type.json`
- **Reference** : `millenaire/cultures/norman/villages/agricole.json`

### Namelists

- **Where** : `cultures/<c>/namelists/<name>.txt`
- **What** : Banques de noms en texte plain (un par ligne). Conventions :
  au moins `men_names.txt`, `women_names.txt`, `family_names.txt`.
- **Merge** : APPEND, dedup
- **Template** : aucun — texte plain
- **Reference** : `millenaire/cultures/norman/namelists/men_names.txt`

### Gathering types

- **Where** : `gathering_type/<id>.json` (global, pas par culture)
- **What** : Goal de crafting / harvest data-driven — handler ID, items
  produits/nécessaires, action cooldown, batching, sons.
- **Merge** : REPLACE_FIRST_ALPHA par fichier
- **Template** : aucun — copier un exemple shipping
- **Reference** : `millenaire/gathering_type/norman_lumberman.json`

### Visit goals

- **Where** : `visit_goal/<id>.json` (global)
- **What** : Comportement NPC schema-driven pour visiter des bâtiments,
  observer des villageois, jouer. Trois variants scellés : `VisitBuilding`,
  `ObserveVillager`, `Play`.
- **Merge** : REPLACE_FIRST_ALPHA par fichier
- **Template** : aucun
- **Reference** : `millenaire/visit_goal/inn_drink.json` (43 instances
  shipping)

### Quêtes

- **Where** : `quests/<subdir>/<id>.json` (global)
- **What** : Définitions de quêtes, par culture et par type (basic /
  world / marvel).
- **Merge** : REPLACE_FIRST_ALPHA par fichier
- **Template** : aucun
- **Reference** : exemples shipping sous `millenaire/quests/<...>`

### Langues

- **Where** : `languages/<lang>/<c>_sentences.txt`,
  `languages/<lang>/<c>_dialogues.txt`,
  `languages/<lang>/quest_lang.json`
- **What** : Tables de sentences et dialogues par locale (TXT) et texte
  des quêtes (JSON).
- **Merge** : APPEND pour sentences (dedup) ; APPEND-nouvelles-clés-only
  pour dialogues ; REPLACE_FIRST_ALPHA pour quest_lang.json
- **Template** : aucun
- **Reference** : `millenaire/languages/en_us/norman_sentences.txt`

---

## §8. Convertir un addon Millénaire 1.12

Le mod legacy 1.12 packageait chaque addon en dossiers du genre
`BUILDINGSNORMAN/` contenant des cartes PNG de bâtiments et des
définitions TXT de villageois / villages. Millénaire 9 livre **deux
chemins** pour consommer ce matériel ; les deux produisent un voisin
`<name>_converted/` (l'original n'est jamais modifié).

### 8.1 Auto-conversion au boot

Posez le pack legacy comme enfant direct de `millenaire-custom/` :

```
millenaire-custom/
├── BUILDINGSNORMAN/             # source (votre pack legacy)
└── BUILDINGSNORMAN_converted/   # écrit au premier démarrage, maintenu à jour
```

`LegacyAutoConverter` tourne au `ServerStartedEvent` (gardé par le config
serveur `legacyAutoConvert`, défaut true). Skip le walk profond si
`<name>_converted/` existe déjà. Pour forcer une reconversion, supprimez
le voisin `_converted/`.

### 8.2 Mode strict CONVERT pour le dev itératif

`/millenaire dev convert-addon <path>` parcourt une seule arborescence
source en mode strict CONVERT et reporte les ambiguïtés par fichier.
Utile quand vous portez un pack et voulez voir les plaintes du converter
plutôt que son best-effort silencieux.

### 8.3 Limitations

- **Couleurs PNG custom** : le format legacy encodait les blocs via des
  pixels colorés avec une légende maintenue à la main. Les couleurs custom
  absentes de la table de mapping Millénaire échouent avec WARN ; il
  faudra les enregistrer dans le converter (ou reconstruire le bâtiment
  concerné manuellement avec des blocs modernes via l'Import Table).
- **Blocs disparus** : les blocs 1.12 retirés en 1.21 (quelques laines à
  code-couleur, anciens items de potion, ...) sont mappés vers
  l'équivalent moderne le plus proche ou skippés avec WARN.
- **`_manifest.json` custom** : les manifests édités à la main dans les
  packs legacy sont ignorés. Le converter régénère l'équivalent moderne
  depuis les fichiers scannés.

Pour les détails complets, voir
[docs/archive/plans/legacy-auto-conversion.md](https://github.com/Kinniken/Millenaire/blob/main/docs/archive/plans/legacy-auto-conversion.md).

---

## §9. Diagnostic

### 9.1 Lire le log de boot

Quelques lignes-clés vous disent si votre contenu a atteint le runtime :

- `Content directories initialised: standard=…, custom=…` — les deux
  racines ont été trouvées et sont écrivables.
- `Discovered N sub-mod(s) under millenaire-custom/` — énumération des
  sub-mods. Cherchez le nom de votre pack.
- `Loaded N cultures` — total de cultures après merge. Les cultures
  custom apparaissent dans les lignes de log par culture en dessous.
- `Loaded external building_plan '<c>/<id>'` — votre fichier a été parsé.
- `Error loading external …` — votre fichier a été rejeté. La ligne
  suivante a l'erreur de parser.
- `REPLACE conflict on <basename>: ignored '<later sub-mod>'` — deux
  sub-mods livraient le même fichier. Le first-alpha gagne.
- `Multi sub-mods ship X — first-wins` — résumé pack-level des conflits
  REPLACE.

### 9.2 `_validation_report.json`

Après le boot, un rapport est écrit sous `millenaire-custom/` résumant :

- Les racines découvertes par sub-mod et les fichiers par famille.
- Les cultures custom avec leurs owners.
- Tous les conflits REPLACE et fichiers skippés.

Lisez-le quand un changement "ne semble pas prendre" — c'est plus rapide
que grepper le log.

### 9.3 « Mon contenu ne charge pas »

Checklist :

1. Le fichier vit-il au chemin attendu ? Vérifier contre §3 et §7.
2. L'extension du fichier est-elle correcte ? `.json` pour JSON, `.txt`
   pour texte plain, `.nbt` pour structures.
3. Le JSON est-il valide ? La plupart des échecs sont syntaxiques
   (virgules trailing, guillemets manquants). Passez-le dans un linter
   JSON.
4. Les champs requis par le loader existent-ils ? Vérifier le template
   correspondant.
5. Pour les cultures custom, l'ID matche-t-il `[a-z0-9]+` (alphanumérique
   minuscule, sans séparateur) ?
6. Avez-vous redémarré le serveur après l'édition ?
7. Cherchez le basename du fichier dans le log de boot. Si vous ne le
   voyez ni chargé ni rejeté, le loader ne l'a pas vu du tout —
   probablement un mismatch de chemin.

### 9.4 Tester en jeu avec l'Import Table

L'Import Table est le bloc round-trip : posez-la devant une structure
construite, dump en NBT + JSON, édite, redépose, regarde le bâtiment
respawner. Utile pour :

- Vérifier qu'un plan se lit correctement (le bâtiment se place).
- Itérer sur `footprint` / `tags` sans quitter le jeu.
- Capturer un bâtiment existant pour édition.

`/millenaire dev export exported-buildings` dump le JSON + NBT de tous
les bâtiments shipping en une fois pour référence.

---

## §10. Limites et trust model

Le contenu externe est traité comme **données filesystem non fiables**.
Le deployer et les loaders imposent des limites dures :

| Limite | Valeur |
|---|---|
| Taille max fichier JSON | 1 000 000 octets (~1 Mo) |
| Taille max fichier NBT | 10 000 000 octets (~10 Mo) |
| Taille max fichier TXT | 512 000 octets (~512 Ko) |
| Max fichiers par type de contenu | 500 |
| Max cultures custom | 50 |
| Profondeur max de récursion répertoire | 7 |

Les fichiers excédant une limite sont skippés avec un log ERROR ; le mod
continue le boot. Il n'y a pas de cap par fichier pour le contenu JSON
au-delà de la limite en octets.

Protection path-traversal : chaque écriture sous `millenaire/` et chaque
lecture sous l'une des deux racines est validée contre `toRealPath()` ;
les symlinks dont la cible s'échappe sont skippés avec WARN. L'étape
`wipeStandardDir` au déploiement refuse de supprimer tout chemin dont le
real path n'est pas dans la racine standard captée.

---

## §11. Bonnes pratiques

- **Naming** : utilisez `snake_case` lowercase pour les IDs et noms de
  fichiers. Les IDs custom de cultures DOIVENT matcher `[a-z0-9]+`.
- **Catégorie vs path** : le champ `category` d'un building plan / villager
  type **doit** correspondre au nom du dossier. Le loader valide et
  rejette les mismatches.
- **Versionnez votre sub-mod** : livrez un `version.txt` (ou tout flag
  file) et un `README.md` à la racine de votre sub-mod. Ils sont ignorés
  par les loaders mais aident les utilisateurs à savoir ce qu'ils ont.
- **Ne committez pas `_manifest/`** : tout dossier dont le premier segment
  commence par `_` est mod-interne (métadonnées de déploiement,
  manifests). Le deployer les skippe à la copie. Ne les livrez pas dans
  votre sub-mod.
- **N'éditez pas `millenaire/`** : même entre mises à jour, `millenaire/`
  est redéployé en environnement dev à chaque démarrage. Ne faites
  confiance à rien d'écrit là-dedans.
- **Modifiez une chose à la fois** : en apprentissage, changez un
  fichier, redémarrez, vérifiez en jeu, puis passez à la suite. Empiler
  les changements rend le debug difficile.

---

## Annexe A. Cheat sheet des chemins

| Famille | Chemin complet |
|---|---|
| Culture | `cultures/<c>/culture.json` |
| Réputation (village) | `cultures/<c>/reputation.json` |
| Réputation (joueur) | `cultures/<c>/culture_reputation.json` |
| Traded goods | `cultures/<c>/traded_goods.json` |
| Building plan + NBT | `cultures/<c>/buildings/<cat>/<id>.{json,nbt}` |
| Villager type | `cultures/<c>/villagers/<cat>/<id>.json` |
| Village type | `cultures/<c>/villages/<id>.json` |
| Shop profile | `cultures/<c>/shops/<id>.json` |
| Namelist | `cultures/<c>/namelists/<name>.txt` |
| IDs disabled | `cultures/<c>/<family>/_disabled.json` |
| Gathering type | `gathering_type/<id>.json` |
| Visit goal | `visit_goal/<id>.json` |
| Quête | `quests/<subdir>/<id>.json` |
| Sentences | `languages/<lang>/<c>_sentences.txt` |
| Dialogues | `languages/<lang>/<c>_dialogues.txt` |
| Texte de quêtes | `languages/<lang>/quest_lang.json` |
| Resource pack | `cultures/<c>/resourcepack/assets/...` |

Tous les chemins sont relatifs à une racine de sub-mod — un enfant
direct de `millenaire-custom/` matchant `[A-Za-z0-9_-]+`.

## Annexe B. Glossaire

- **Sub-mod** : un dossier enfant direct de `millenaire-custom/` qui
  contient sa propre arborescence `cultures/` / `languages/` /
  `gathering_type/` / `quests/`. Les noms matchent `[A-Za-z0-9_-]+` ;
  les noms `cultures`, `languages`, `gathering_type`, `quests` et
  `exports` sont réservés au niveau racine.
- **REPLACE_FIRST_ALPHA** : règle d'overlay par fichier — le premier
  sub-mod alphabétiquement qui livre un basename donné gagne. Les
  doublons suivants sont ignorés avec WARN.
- **APPEND** : overlay additif — chaque sub-mod contribue, fusion.
- **Plan-set** : l'enveloppe JSON d'un building plan, qui contient tous
  les variants et leurs levels.
- **Variant** : une orientation / forme d'un building plan (`a`, `b`,
  ...). Sélectionnée au moment du placement.
- **Level** : une étape de construction (1, 2, 3, ...). Un village démarre
  un bâtiment au level 1 et peut upgrader vers des levels supérieurs.
- **Marvel** (a.k.a. wonder) : un bâtiment one-shot top-tier par culture
  (`buildings/wonders/`), gardé derrière une chaîne de quêtes.

## Annexe C. Liens

- Templates : `millenaire/_templates/`
- Catalogues de référence : `millenaire/_reference/`
- Dépôt GitHub : <https://github.com/Kinniken/Millenaire>
- Spec interne (vue plus profonde du mécanisme, pour les curieux) :
  [docs/feat/custom-content.md](https://github.com/Kinniken/Millenaire/blob/main/docs/feat/custom-content.md),
  [docs/archive/specs-implemented/custom-content.md](https://github.com/Kinniken/Millenaire/blob/main/docs/archive/specs-implemented/custom-content.md),
  [docs/archive/specs-implemented/custom-content-format-v2.md](https://github.com/Kinniken/Millenaire/blob/main/docs/archive/specs-implemented/custom-content-format-v2.md),
  [docs/archive/plans/custom-content-submods.md](https://github.com/Kinniken/Millenaire/blob/main/docs/archive/plans/custom-content-submods.md).
