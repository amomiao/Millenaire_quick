# Bienvenue dans `millenaire-custom/`

Ce dossier est **À VOUS**. Millénaire n'écrase ni ne supprime jamais ce que
vous y placez, même lors d'une mise à jour du mod. Utilisez-le pour ajouter
des bâtiments, villageois, cultures, langues, quêtes, ou tout autre contenu.

Le dossier voisin `millenaire/` est géré par le mod et redéployé à chaque
changement de version. Consultez-le comme référence ; ne l'éditez pas.

## Modèle sub-mod

Le contenu personnalisé est livré sous forme de **sub-mods** : chaque
sous-dossier direct de `millenaire-custom/` est un sub-mod, avec son propre
arbre `cultures/`, `languages/`, `gathering_type/` et/ou `quests/`. Plusieurs
sub-mods peuvent cohabiter ; leurs contributions s'overlay de façon
déterministe (le premier sub-mod alphabétiquement gagne pour les fichiers
REPLACE, les autres contribuent additivement).

Les noms de répertoire sub-mod doivent matcher `[A-Za-z0-9_-]+`. Les noms
`cultures`, `languages`, `gathering_type`, `quests` et `exports` sont
réservés au niveau racine — **ne posez pas** de contenu directement sous
`millenaire-custom/cultures/...`. Le mod refusera de charger ces fichiers
et émettra un WARN au démarrage.

## Démarrage rapide 1 — Ajouter un bâtiment à la culture normande

```
millenaire-custom/
└── mes-tweaks-normands/          # tout nom [A-Za-z0-9_-]+ — votre sub-mod
    └── cultures/
        └── norman/
            └── buildings/
                └── houses/
                    ├── my_house.json    # métadonnées du plan (copié depuis _templates/)
                    └── my_house.nbt     # template de structure (exporté en jeu)
```

Le `.nbt` est produit en jeu avec le bloc **Import Table**. Le `.json` est
copié depuis `millenaire/_templates/_template_building.json` puis édité.

## Démarrage rapide 2 — Créer une culture entièrement nouvelle

```
millenaire-custom/
└── viking-pack/                          # votre sub-mod
    ├── cultures/
    │   └── viking/                       # l'id de culture (doit matcher [a-z0-9]+)
    │       ├── culture.json              # requis : nom, langue, biomes
    │       ├── namelists/
    │       │   ├── men_names.txt         # requis : au moins une liste de noms
    │       │   ├── women_names.txt
    │       │   └── family_names.txt
    │       ├── villagers/
    │       │   └── leaders/
    │       │       └── leader.json       # requis : au moins un type de villageois
    │       ├── villages/
    │       │   └── basic_village.json    # requis : au moins un type de village
    │       ├── buildings/
    │       │   └── townhalls/
    │       │       ├── townhall.json     # requis : au moins un townhall
    │       │       └── townhall_a_0.nbt
    │       └── shops/
    │           └── townhall.json         # requis : shop pour le townhall
    └── languages/
        └── en_us/
            └── viking_sentences.txt      # obligatoire, au moins en_us
```

## Pas de rechargement à chaud

Le contenu est chargé une seule fois, au démarrage du serveur. Après toute
modification dans `millenaire-custom/`, **redémarrez le serveur** pour que
les changements soient pris en compte.

## Importer un addon Millénaire 1.12

Posez le pack legacy dans un sous-dossier de `millenaire-custom/` (ex.
`millenaire-custom/MyOldPack/`). Au prochain démarrage, le mod le convertit
automatiquement en `MyOldPack_converted/` ; l'original reste intact.

## Pointeurs

- **Guide complet** : `millenaire/_docs/content-guide.fr.md` (redéployé à
  chaque démarrage du mod)
- **Templates** (squelettes à copier) : `millenaire/_templates/`
- **Catalogues de référence** (IDs goals, points spéciaux) : `millenaire/_reference/`
- **Dépôt GitHub** : <https://github.com/Kinniken/Millenaire>
