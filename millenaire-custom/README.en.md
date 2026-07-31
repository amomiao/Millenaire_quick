# Welcome to `millenaire-custom/`

This folder is **YOURS**. Millénaire never overwrites or deletes anything you put
here, even when the mod is updated. Use it to add new buildings, villagers,
cultures, languages, quests, or any other piece of content.

The sibling folder `millenaire/` is owned by the mod and redeployed on every
version change. Read it for reference; do not edit it directly.

## Sub-mod model

Custom content is shipped as **sub-mods**: every direct sub-directory of
`millenaire-custom/` is one sub-mod, with its own `cultures/`, `languages/`,
`gathering_type/` and/or `quests/` subtree. Multiple sub-mods can coexist;
their contributions overlay deterministically (first sub-mod alphabetically
wins for REPLACE files, others contribute additively).

Sub-mod directory names must match `[A-Za-z0-9_-]+`. The names `cultures`,
`languages`, `gathering_type`, `quests` and `exports` are reserved at the
top level — do **not** drop content directly under
`millenaire-custom/cultures/...`. The mod will refuse to load such files
and log a startup WARN.

## Quickstart 1 — Add a building to the Norman culture

```
millenaire-custom/
└── my-norman-tweaks/             # any name [A-Za-z0-9_-]+ — your sub-mod
    └── cultures/
        └── norman/
            └── buildings/
                └── houses/
                    ├── my_house.json    # plan metadata (copy from _templates/)
                    └── my_house.nbt     # structure template (export from in-game)
```

The `.nbt` is produced in-game with the **Import Table** block. The `.json` is
copied from `millenaire/_templates/_template_building.json` and edited.

## Quickstart 2 — Create a brand-new culture

```
millenaire-custom/
└── viking-pack/                          # your sub-mod
    ├── cultures/
    │   └── viking/                       # the culture id (must match [a-z0-9]+)
    │       ├── culture.json              # required: name, language, biomes
    │       ├── namelists/
    │       │   ├── men_names.txt         # required: at least one namelist
    │       │   ├── women_names.txt
    │       │   └── family_names.txt
    │       ├── villagers/
    │       │   └── leaders/
    │       │       └── leader.json       # required: at least one villager type
    │       ├── villages/
    │       │   └── basic_village.json    # required: at least one village type
    │       ├── buildings/
    │       │   └── townhalls/
    │       │       ├── townhall.json     # required: at least one townhall
    │       │       └── townhall_a_0.nbt
    │       └── shops/
    │           └── townhall.json         # required: shop for the townhall
    └── languages/
        └── en_us/
            └── viking_sentences.txt      # mandatory, at least en_us
```

## No hot reload

Content is loaded once, at server start. After editing any file under
`millenaire-custom/`, **restart the server** for changes to take effect.

## Importing a Millénaire 1.12 addon

Drop the legacy pack as a sub-folder of `millenaire-custom/` (e.g.
`millenaire-custom/MyOldPack/`). At next boot Millénaire converts it
automatically into `MyOldPack_converted/`. The `_converted/` sibling becomes
the runtime sub-mod; the original is preserved as the source.

## Pointers

- **Full guide**: `millenaire/_docs/content-guide.en.md` (deployed on every
  mod boot)
- **Templates** (skeletons to copy): `millenaire/_templates/`
- **Reference catalogs** (goal IDs, special points, ...): `millenaire/_reference/`
- **GitHub repo**: <https://github.com/Kinniken/Millenaire>
