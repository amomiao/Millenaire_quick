# Millénaire 9 — Content Author Guide (English)

Practical reference for modders adding or modifying Millénaire content
without recompiling the mod.

- Templates to copy from: **`millenaire/_templates/`**
- Auto-generated reference catalogs (goal IDs, gathering handlers, special
  points): **`millenaire/_reference/`**
- This guide is shipped by mod version `9.0.0-dev-preview.5` (the file is
  redeployed on every mod boot — do not edit it in place; your changes will
  be erased).
- Version française : `content-guide.fr.md` (à côté de ce fichier).

---

## §1. Distribution & lifecycle

### 1.1 Server side, client side, both?

Millénaire is at heart a **server-side** content mod. Cultures, building
plans, villager types, gathering goals, quests, sentences — every piece of
data described in this guide is read by the server when the world starts.
A client connecting to a multiplayer server does **not** need to ship the
data files: the server drives behaviour, and the protocol carries enough
metadata for the client to render villagers and dialogues.

The one exception is **resource-pack assets** (textures, models, sounds). A
custom culture will only render correctly on a client that has the
matching resource pack files under
`millenaire-custom/<submod>/cultures/<c>/resourcepack/assets/...`. A
client that lacks them sees default Millénaire skins; the world still
works.

For singleplayer and LAN there is no distinction — the integrated server
and the client share the same JVM and the same `millenaire-custom/` folder.

### 1.2 Distributing a content pack

Ship `millenaire-custom/<your-pack>/` as a zip. Players unzip it directly
under their `millenaire-custom/` folder (server-side and, if textures are
included, on every client too). The mod itself is updated independently;
your pack survives every Millénaire update.

You should **not** ship anything from `millenaire/`. That tree is mod-owned
and regenerated on each update.

### 1.3 No hot reload

There is no `/millenaire reload`. All content is read at `ServerStartedEvent`
and cached for the lifetime of the world. After editing any file under
`millenaire-custom/`, restart the server for changes to take effect. A few
**diagnostic** dev commands exist (see §9) but they do not reload content
files; only the running data structures.

### 1.4 Useful commands

`/millenaire dev …` is the umbrella for developer / debug tools (permission
level 2). Notable subcommands for content authors:

- `/millenaire dev export <…>` — exports cost reports, building NBT roundtrip
  data, etc.
- `/millenaire dev convert-addon <path>` — strict CONVERT mode for legacy
  1.12 packs (see §8).
- `/millenaire dev import-culture <…>` — debug helpers around custom culture
  loading.

The full list comes from `DevCommand.register()`. Use tab-completion in
game.

---

## §2. The 2-directory model

Millénaire stores content in two sibling directories next to your server /
Minecraft instance:

```
<gameDir>/
├── millenaire/            # MOD-OWNED, regenerated on every mod version change
└── millenaire-custom/     # MODDER-OWNED, never touched by the mod
```

### 2.1 `<gameDir>/millenaire/` — owned by the mod

This directory is **nuked and fully redeployed** every time the mod version
changes (upgrade or downgrade). Its purpose is to make every shipped
piece of content visible on disk for inspection and copy-as-template, and to
ship developer-facing material (this guide, templates, reference catalogs).

Practical consequences:

- **Inspect, copy from, but do not edit** anything here. Your edits will be
  erased on the next mod update.
- The `_deployed_version.txt` file at the root records the mod version that
  wrote the tree.
- A warning file is also dropped at the root (`WARNING - changes here
  will be overwritten on update.txt`) so the rule is visible even to a
  player who skips this guide.
- During development (`./gradlew runServer` / `runClient`, i.e.
  `FMLEnvironment.production == false`), the version check is bypassed and
  the tree is redeployed on every boot. Edits to
  `src/main/resources/millenaire/...` therefore land without a version bump.

### 2.2 `<gameDir>/millenaire-custom/` — owned by you

This directory is **never written to by the mod**. No deployer, no
auto-generated file, no versioning machinery touches it. Anything you put
here survives every mod update unchanged.

All custom content is shipped as **sub-mods**: every direct child of
`millenaire-custom/` is one sub-mod, with its own `cultures/`,
`languages/`, `gathering_type/` and/or `quests/` subtree. Pick any
directory name matching `[A-Za-z0-9_-]+` (`my-pack`, `viking_pack`,
`BUILDINGSNORMAN_converted`, …). The names `cultures`, `languages`,
`gathering_type`, `quests` and `exports` are reserved at the top level
and **must not** be used as a sub-mod root — content placed directly
under one of them is rejected with a startup WARN.

That includes:

- New cultures (`millenaire-custom/<submod>/cultures/<your_id>/`).
- Overrides on shipping cultures (`millenaire-custom/<submod>/cultures/norman/...`).
- Custom languages and dialogues.
- Custom quests and gathering types.
- Resource-pack assets for textures.
- Import-Table exports (`millenaire-custom/exports/`, the only top-level
  reserved dir that is *not* a content source — it is the Import Table's
  output sink).
- A `README.{en,fr}.md` placed at the root, deployed once on first boot
  (never overwritten afterwards).

### 2.3 Where to put what

(Pick any sub-mod name `[A-Za-z0-9_-]+`; `<submod>` below is a placeholder.)

| You want to … | Put it under |
|---|---|
| Try a tweak you might throw away | `millenaire-custom/<submod>/` (still — `millenaire/` is unsafe even for trial work) |
| Override a shipping building plan | `millenaire-custom/<submod>/cultures/<c>/buildings/<cat>/<id>.json` |
| Add a new shipping-culture villager type | `millenaire-custom/<submod>/cultures/<c>/villagers/<cat>/<id>.json` |
| Add a brand-new culture | `millenaire-custom/<submod>/cultures/<your_id>/...` |
| Add language strings | `millenaire-custom/<submod>/languages/<lang>/<file>.txt` |
| Add a quest | `millenaire-custom/<submod>/quests/<subdir>/<id>.json` |
| Ship textures | `millenaire-custom/<submod>/cultures/<c>/resourcepack/assets/...` |
| Drop a 1.12 legacy pack | `millenaire-custom/<pack-name>/` (auto-converted, see §8) |

### 2.4 The WARNING file

The mod writes
`millenaire/WARNING - changes here will be overwritten on update.txt`
on every redeploy. Players who poke around `millenaire/` see it
immediately. The file points to `millenaire-custom/` and to this guide for
the authoring workflow. Treat it as a tripwire, not as documentation: the
real reference is here.

---

## §3. The iso-legacy nested layout

A culture's content lives in a single nested tree under
`cultures/<culture>/`, mirroring the legacy 1.12 layout. The same shape is
used by `millenaire/cultures/<c>/` (mod-owned) and by
`millenaire-custom/<submod>/cultures/<c>/` (your overlay inside a sub-mod).

### 3.1 Per-culture hierarchy

```
cultures/<c>/
├── culture.json                  # culture metadata (name, language, biomes, ...)
├── traded_goods.json             # economy catalog (additive merge)
├── reputation.json               # village reputation labels (replace)
├── culture_reputation.json       # player-vs-culture rep ladder (replace)
├── buildings/                    # building plans (JSON + NBT)
│   ├── townhalls/
│   ├── houses/
│   ├── farms/
│   └── ...                       # see §3.2 for the canonical list
├── villagers/                    # villager types
│   ├── leaders/
│   ├── farmers/
│   └── ...                       # see §3.3 for the canonical list
├── villages/                     # village types (layouts)
│   └── *.json
├── shops/                        # shop profiles
│   └── *.json
└── namelists/                    # *.txt name banks
    ├── men_names.txt
    ├── women_names.txt
    └── family_names.txt
```

The same shape is the wire format expected by every loader. There is no
separate "flat" layout: everything is nested.

### 3.2 Canonical building categories

The **category** of a building is encoded in the directory it lives in.
The `category` field inside the JSON must match the directory name.

| Directory | Purpose |
|---|---|
| `townhalls/` | Village core, houses the village leader |
| `houses/` | Residential buildings (each holds a household) |
| `farms/` | Crop / livestock production buildings |
| `crafts/` | Craftsmen buildings (smithy, weaver, ...) |
| `shops/` | Specialised commerce buildings |
| `services/` | Inns, markets, taverns, ... |
| `temples/` | Religious buildings |
| `military/` | Garrisons, watchtowers |
| `wonders/` | One-shot marvel buildings (per culture) |
| `loner_buildings/` | Stand-alone buildings (no village around them) |
| `nature/` | Ruins, natural features generated as content |
| `other/` | Anything that does not fit above |

The full list is fixed by Millénaire's loaders. If you create a directory
under `buildings/` with an unknown name it is ignored.

### 3.3 Canonical villager categories

Same logic for villagers — directory == category.

| Directory | Purpose |
|---|---|
| `leaders/` | Village leader and consort |
| `farmers/` | Field hands, animal handlers |
| `craftsmen/` | Smiths, weavers, woodworkers, ... |
| `merchants/` | Shop owners, foreign merchants |
| `religious/` | Priests, monks |
| `military/` | Guards, soldiers |
| `other/` | Children, generic adults, etc. |

### 3.4 Culture-scope vs global files

Some content is **per-culture** (lives under `cultures/<c>/...`); some is
**global** (lives at the root of the content tree).

| Family | Scope | Path |
|---|---|---|
| Cultures, buildings, villagers, villages, shops, namelists, traded_goods, reputation | Per-culture | `cultures/<c>/...` |
| Gathering types | Global | `gathering_type/*.json` |
| Quests | Global | `quests/<subdir>/*.json` |
| Languages | Global | `languages/<lang>/*.txt` |
| Visit goals | Global | `visit_goal/*.json` |
| Villager config (animation tunables) | Global | `villager_config/*.json` |

A gathering type referenced by a villager type must therefore be visible
from any culture. Custom gathering types you add live at
`millenaire-custom/<submod>/gathering_type/<id>.json`, not under `cultures/...`.

### 3.5 Merge semantics by family

Three merge rules cover every loader:

- **REPLACE_FIRST_ALPHA** — per-file overlay. The first sub-mod
  alphabetically that ships a given basename wins. Subsequent sub-mods
  that ship the same basename emit a one-shot WARN at load time. The
  base layers (mod-shipped `millenaire/` then JAR) are consulted last.
- **APPEND** — additive. Every sub-mod's contribution is merged on top of
  the base. Duplicates are deduplicated by an obvious key (line text, ID,
  ...).
- **DISABLED** — `_disabled.json` lists IDs to skip from both base and
  overlay loading. Multiple sub-mods' lists are unioned.

Per-family table:

| Family | Merge | Notes |
|---|---|---|
| `culture.json` | REPLACE_FIRST_ALPHA | Replaces the whole record. |
| `reputation.json` | REPLACE_FIRST_ALPHA | Replaces the whole record. |
| `culture_reputation.json` | REPLACE_FIRST_ALPHA | Replaces the whole record. |
| `traded_goods.json` | APPEND | Keyed by `id`; an overlay entry with `disabled: true` removes the base entry. |
| `buildings/<cat>/<id>.json` | REPLACE_FIRST_ALPHA | Per-file. The associated `.nbt` follows the same rule. |
| `villagers/<cat>/<id>.json` | REPLACE_FIRST_ALPHA | Per-file. |
| `villages/<id>.json` | REPLACE_FIRST_ALPHA | Per-file. |
| `shops/<id>.json` | REPLACE_FIRST_ALPHA | Per-file. |
| `namelists/<name>.txt` | APPEND | Per-line, dedup. |
| `<c>_sentences.txt` | APPEND | Adds new `role.goalKey=text` lines, dedup by exact text. |
| `<c>_dialogues.txt` | APPEND for new keys only | Existing keys are SKIPPED with WARN to keep `speechRef.lineIdx` deterministic across server / client. |
| `gathering_type/<id>.json` | REPLACE_FIRST_ALPHA | Per-file (global scope). |
| `quests/<subdir>/<id>.json` | REPLACE_FIRST_ALPHA | Per-file (global scope). |
| `_disabled.json` | DISABLED | Per content directory; lists IDs to skip from both base and overlay. |

This matrix is the single source of truth. When in doubt, check the
loader's behaviour against this table.

---

## §4. Sub-mods: layered authoring

All custom content lives in **sub-mods** — independent trees living side
by side under `millenaire-custom/`. There is no flat-root layout: dropping
content directly under `millenaire-custom/cultures/...` is rejected with
a startup WARN.

### 4.1 Sub-mod basics

- A sub-mod is any direct child of `millenaire-custom/` whose root
  contains at least one of `cultures/`, `languages/`, `gathering_type/`
  or `quests/`.
- Sub-mod directory names must match `[A-Za-z0-9_-]+` so they combine
  unambiguously with culture ids in derived strings (e.g. resource-pack
  ids). Names outside that shape are skipped with a one-shot WARN.
- The names `cultures`, `languages`, `gathering_type`, `quests` and
  `exports` are reserved at the top level — never sub-mod names.
- Use sub-mods to:
  - ship a coherent pack you can version and zip on its own,
  - keep multiple unrelated packs side by side without colliding,
  - consume legacy 1.12 packs (each lands as its own
    `<name>_converted/` sub-mod, see §8).

### 4.2 Sub-mod layout

```
millenaire-custom/
├── my-cool-pack/                # ← a sub-mod
│   ├── cultures/
│   │   └── viking/
│   │       └── ...
│   ├── languages/
│   │   └── en_us/
│   │       └── viking_sentences.txt
│   └── gathering_type/
│       └── viking_fishing.json
├── another-pack/                # ← another sub-mod
│   └── cultures/
│       └── norman/
│           └── buildings/
│               └── houses/
│                   └── tweaked_house.json
└── exports/                     # ← Import Table sink (reserved, not a sub-mod)
```

### 4.3 Resolution order

Sub-mods are iterated in **alphabetical order** of their directory name.

For REPLACE_FIRST_ALPHA families, the first sub-mod (alphabetically) that
ships the file wins. For APPEND families, every sub-mod contributes.

### 4.4 Removing shipping content

To suppress a shipping building plan / villager type / village type without
shipping a replacement, drop a `_disabled.json` in the same directory of
your sub-mod:

```json
// millenaire-custom/my-cool-pack/cultures/norman/buildings/houses/_disabled.json
["bourg1", "bourg2"]
```

The IDs listed here are removed from both the base content and any sub-mod
overlay before the loader sees them. Multiple sub-mods' `_disabled.json`
lists are unioned.

`traded_goods.json` entries also accept `"disabled": true` per-row to
suppress a specific shipping good.

### 4.5 REPLACE conflicts WARN

When two sub-mods ship the same
basename in a REPLACE_FIRST_ALPHA family, the loader logs a one-shot WARN
naming the conflicting files. Treat it as a real warning: the second file
is silently ignored. If both sub-mods are yours, rename one. If they're
two unrelated packs, it's the operator's call which to keep.

### 4.6 Anti-masking with `_converted/`

If a direct child `<name>/` and a sibling `<name>_converted/` both exist,
the runtime ignores `<name>/` entirely (it's treated as a legacy source
that the converter will rewrite into `<name>_converted/`). To force a
re-conversion, delete the `_converted/` sibling.

---

## §5. Quickstart

### 5.1 Add one building to an existing culture

Minimum disk layout (pick any sub-mod name `[A-Za-z0-9_-]+`):

```
millenaire-custom/
└── my-norman-tweaks/         # ← your sub-mod
    └── cultures/
        └── norman/
            └── buildings/
                └── houses/
                    ├── my_house.json
                    └── my_house.nbt
```

Both files share a basename. The `.json` describes the plan (a copy of
`millenaire/_templates/_template_building.json`, edited): it must declare
`category == "houses"` (matching the directory) and reference the NBT via
its `template` field. The `.nbt` is captured in-game using the **Import
Table** block (Section §6.1 has the full workflow).

After saving, restart the server. You should see a log line like
`Loaded external building_plan 'norman/my_house'` near boot.

### 5.2 Create a brand-new culture

Minimum disk layout (pick any sub-mod name `[A-Za-z0-9_-]+`):

```
millenaire-custom/
└── viking-pack/                       # ← your sub-mod
    ├── cultures/
    │   └── viking/
    │       ├── culture.json
    │       ├── namelists/
    │       │   └── men_names.txt          # at least one namelist
    │       ├── villagers/
    │       │   └── leaders/
    │       │       └── leader.json        # at least one villager type
    │       ├── villages/
    │       │   └── basic_village.json     # at least one village type, role=centre
    │       ├── buildings/
    │       │   └── townhalls/
    │       │       ├── townhall.json      # at least one townhall plan
    │       │       └── townhall_a_0.nbt
    │       └── shops/
    │           └── townhall.json          # shop for the townhall
    └── languages/
        └── en_us/
            └── viking_sentences.txt       # at least en_us
```

`culture.json` declares the ID (`[a-z0-9]+`), the human-readable name, the
language tag, the spawn-biome tags, and the travel-book categories. Use
`millenaire/_templates/_template_culture.json` as the starting point and
`millenaire/cultures/norman/culture.json` as a real example.

The cap is `MAX_CUSTOM_CULTURES = 50` (alphabetically truncated past that).
Custom culture IDs are validated against `[a-z0-9]+` — no underscores, no
hyphens, no uppercase.

---

## §6. Workflows by use case

### 6.1 Add a building to a shipping culture

1. Capture the structure in-game using the Import Table block (see
   `millenaire/_reference/README.txt` for the full Import Table workflow,
   plus
   [docs/feat/import-table-roundtrip.md](https://github.com/Kinniken/Millenaire/blob/main/docs/feat/import-table-roundtrip.md)
   if you want every detail). The Import Table writes both the JSON and
   the NBT to `millenaire-custom/exports/`.

2. **Where the NBT lives**. Building NBTs are addressed via two paths:

   - **Sidecar mirror** (the one shipped to authors):
     `cultures/<c>/buildings/<cat>/<id>.nbt`, next to the JSON. This is
     where you put your file and what Millénaire deploys when shipping
     content.
   - **Resource-location backing path**:
     `data/<namespace>/structure/<c>/<id>.nbt`. The mod also reads from
     here when a plan references the NBT through its `template` field
     (e.g. `millenaire-custom:viking/townhall_a_0`). The deployer mirrors
     the sidecar copy under this path so both work.

   In practice, **drop your `.nbt` next to the `.json`** under
   `cultures/<c>/buildings/<cat>/`; the loader handles the rest.

3. Edit the generated JSON to fill in `category`, `tags`, `male` /
   `female` / `male_residents` / `female_residents`, `priority_move_in`,
   `footprint`, etc. See
   [docs/feat/custom-content.md](https://github.com/Kinniken/Millenaire/blob/main/docs/feat/custom-content.md)
   §2 and the variant/level shape described in
   [docs/archive/specs-implemented/custom-content-format-v2.md](https://github.com/Kinniken/Millenaire/blob/main/docs/archive/specs-implemented/custom-content-format-v2.md).

4. Move (or copy) the `.json` and `.nbt` from
   `millenaire-custom/exports/` into
   `millenaire-custom/<submod>/cultures/<c>/buildings/<cat>/<id>.{json,nbt}`.

5. If you want the village to actually place the new building, add the
   plan ID to a village-type `layout` entry under
   `cultures/<c>/villages/<id>.json`.

6. Restart the server. The boot log shows
   `Loaded external building_plan '<c>/<id>'`. If the JSON fails to parse,
   look for the matching `Error loading external building_plan` line.

→ **Variation: add a villager type.** Same shape — `cultures/<c>/villagers/
<cat>/<id>.json`, copy from
`millenaire/_templates/_template_villager.json`, drop, restart.

→ **Variation: add a village type.** Same shape —
`cultures/<c>/villages/<id>.json`, copy from
`millenaire/_templates/_template_village_type.json`, drop, restart.

### 6.2 Override a shipping file (REPLACE)

Mirror the path under your sub-mod root. Example: change the Norman
agricultural village layout.

```
millenaire-custom/<submod>/cultures/norman/villages/agricole.json
```

Whatever your file says fully replaces the shipping equivalent (no field
merging). Run the server once, then check that the file you just wrote
took effect (boot log mentions the file under your custom path, not the
shipping path).

→ **Variation: override an NBT.** Same path-mirroring rule — drop your
`<c>/<cat>/<id>.nbt` next to a (new or shipping) `<c>/<cat>/<id>.json`.

### 6.3 Disable a shipping file

Two equivalent options, depending on the family:

**(a) `_disabled.json` (REPLACE families).** Drop one in the directory and
list the IDs:

```json
// millenaire-custom/<submod>/cultures/norman/villagers/farmers/_disabled.json
["lumberman"]
```

The loader removes those IDs from both the base content and the overlay
before assembling the runtime registry.

**(b) `disabled: true` per row (APPEND families).** For
`traded_goods.json`, an overlay entry with the matching `id` and
`disabled: true` removes the base entry. Same pattern for any other
APPEND-with-id family.

### 6.4 Extend an additive list

Examples:

- **Namelists.** Drop
  `millenaire-custom/<submod>/cultures/norman/namelists/men_names.txt`
  containing only the new names you want to add. Lines are appended on
  top of the shipping list, dedup'd by exact text.
- **Traded goods.** Drop
  `millenaire-custom/<submod>/cultures/norman/traded_goods.json` with the
  new entries. Each entry needs a unique `id`. To suppress a base entry,
  ship the same `id` with `disabled: true`.
- **Sentences.** Add lines to
  `millenaire-custom/<submod>/languages/<lang>/<c>_sentences.txt`.
  Format: `role.goalKey=text`. Lines that match an existing key but with
  a new text variant are appended (dedup by exact text). Existing exact
  lines are no-ops.
- **Dialogues.** Same path —
  `millenaire-custom/<submod>/languages/<lang>/<c>_dialogues.txt`.
  **Asymmetric**
  with sentences: only **brand-new keys** are appended. An overlay that
  redefines an existing key is SKIPPED with a WARN; this preserves the
  `speechRef.lineIdx` determinism between server and client. To override
  an existing dialogue, you have to disable it (replace the speech logic
  via the `speechRef` machinery — outside the scope of this guide).

---

## §7. Family catalog

Compact reference per family. **JSON field-by-field documentation lives in
the templates and in
[docs/feat/custom-content.md](https://github.com/Kinniken/Millenaire/blob/main/docs/feat/custom-content.md)**;
the entries below tell you where each family lives, how it merges, and
where to find a full example.

### Cultures

- **Where**: `cultures/<c>/culture.json`
- **What**: Culture identity — name, language tag, spawn biomes, travel-book
  categories, weight.
- **Merge**: REPLACE_FIRST_ALPHA
- **Template**: `_templates/_template_culture.json`
- **Reference**: `millenaire/cultures/norman/culture.json`

### Reputation

- **Where**: `cultures/<c>/reputation.json` (village rep ladder),
  `cultures/<c>/culture_reputation.json` (player-vs-culture rep ladder)
- **What**: Threshold labels and effects displayed in the panel.
- **Merge**: REPLACE_FIRST_ALPHA per file
- **Template**: none — copy the shipping file
- **Reference**: `millenaire/cultures/norman/reputation.json`

### Traded goods

- **Where**: `cultures/<c>/traded_goods.json`
- **What**: Catalog of items the culture's shops trade, with prices, ranks,
  shop-tag association.
- **Merge**: APPEND keyed by `id`; `"disabled": true` removes a base entry
- **Template**: none (compact format)
- **Reference**: `millenaire/cultures/norman/traded_goods.json`

### Shops

- **Where**: `cultures/<c>/shops/<id>.json`
- **What**: Shop profile — which traded-good IDs the shop offers / buys at
  each level.
- **Merge**: REPLACE_FIRST_ALPHA per file
- **Template**: none
- **Reference**: `millenaire/cultures/norman/shops/townhall.json`

### Building plans

- **Where**: `cultures/<c>/buildings/<category>/<id>.json` (+ matching
  `.nbt`)
- **What**: Plan metadata — variants, levels, tags, footprint, household
  attribution. Backed by an NBT structure template.
- **Merge**: REPLACE_FIRST_ALPHA per file (JSON and NBT independently)
- **Template**: `_templates/_template_building.json`
- **Reference**: `millenaire/cultures/norman/buildings/houses/bourg1.json`

### Villager types

- **Where**: `cultures/<c>/villagers/<category>/<id>.json`
- **What**: Villager identity — gender, skin, goals, inventory, hiring cost,
  travel-book display. Goals reference gathering types and visit goals.
- **Merge**: REPLACE_FIRST_ALPHA per file
- **Template**: `_templates/_template_villager.json`
- **Reference**: `millenaire/cultures/norman/villagers/leaders/leader.json`

### Village types

- **Where**: `cultures/<c>/villages/<id>.json`
- **What**: Village layout — list of plan IDs, biome filters, spawn weight,
  starting completion.
- **Merge**: REPLACE_FIRST_ALPHA per file
- **Template**: `_templates/_template_village_type.json`
- **Reference**: `millenaire/cultures/norman/villages/agricole.json`

### Namelists

- **Where**: `cultures/<c>/namelists/<name>.txt`
- **What**: Plain-text name banks (one entry per line). Conventions: at
  least `men_names.txt`, `women_names.txt`, `family_names.txt`.
- **Merge**: APPEND, dedup
- **Template**: none — plain text
- **Reference**: `millenaire/cultures/norman/namelists/men_names.txt`

### Gathering types

- **Where**: `gathering_type/<id>.json` (global, not per-culture)
- **What**: Data-driven crafting / harvesting goal — handler ID, items
  produced/needed, action cooldown, batching, sound effects.
- **Merge**: REPLACE_FIRST_ALPHA per file
- **Template**: none — copy a shipping example
- **Reference**: `millenaire/gathering_type/norman_lumberman.json`

### Visit goals

- **Where**: `visit_goal/<id>.json` (global)
- **What**: Schema-driven NPC behaviour for visiting buildings, observing
  villagers, playing. Three sealed variants: `VisitBuilding`,
  `ObserveVillager`, `Play`.
- **Merge**: REPLACE_FIRST_ALPHA per file
- **Template**: none
- **Reference**: `millenaire/visit_goal/inn_drink.json` (43 instances ship)

### Quests

- **Where**: `quests/<subdir>/<id>.json` (global)
- **What**: Quest definitions, per culture and per type (basic / world /
  marvel).
- **Merge**: REPLACE_FIRST_ALPHA per file
- **Template**: none
- **Reference**: `millenaire/quests/<...>` shipping examples

### Languages

- **Where**: `languages/<lang>/<c>_sentences.txt`,
  `languages/<lang>/<c>_dialogues.txt`, `languages/<lang>/quest_lang.json`
- **What**: Per-locale sentence and dialogue tables (TXT) and quest text
  (JSON).
- **Merge**: APPEND for sentences (dedup); APPEND-new-keys-only for
  dialogues; REPLACE_FIRST_ALPHA for quest_lang.json
- **Template**: none
- **Reference**: `millenaire/languages/en_us/norman_sentences.txt`

---

## §8. Converting a Millénaire 1.12 addon

The legacy 1.12 mod packaged each addon as `BUILDINGSNORMAN/`-style
folders containing PNG building maps and TXT villager / village
definitions. Millénaire 9 ships **two paths** to consume that material;
both produce a sibling `<name>_converted/` tree (the original is never
modified).

### 8.1 Auto-conversion at boot

Drop the legacy pack as a direct child of `millenaire-custom/`:

```
millenaire-custom/
├── BUILDINGSNORMAN/             # source (your legacy pack)
└── BUILDINGSNORMAN_converted/   # written on first boot, kept up-to-date
```

`LegacyAutoConverter` runs on `ServerStartedEvent` (gated by the
`legacyAutoConvert` server config, default true). Skips the deep walk if
`<name>_converted/` already exists. To force a reconvert, delete the
`_converted/` sibling.

### 8.2 Strict CONVERT mode for iterative dev

`/millenaire dev convert-addon <path>` walks a single source tree in
strict CONVERT mode and reports per-file ambiguities. Useful when you're
porting a pack and want to see the converter's complaints rather than its
silent best-effort.

### 8.3 Limitations

- **Custom PNG colours**: the legacy format encoded blocks via colour
  pixels with a hand-maintained legend. Custom colours not in
  Millénaire's mapping table fail with a WARN; you'll need to register
  them in the converter (or rebuild the relevant building manually with
  modern blocks via the Import Table).
- **Disappeared blocks**: 1.12 blocks removed in 1.21 (a few colour-coded
  wools, old brewing items, ...) are mapped to the closest modern
  equivalent or skipped with a WARN.
- **Custom `_manifest.json`**: hand-edited manifests in legacy packs are
  ignored. The converter regenerates the modern equivalent from the
  scanned files.

For full details, see
[docs/archive/plans/legacy-auto-conversion.md](https://github.com/Kinniken/Millenaire/blob/main/docs/archive/plans/legacy-auto-conversion.md).

---

## §9. Diagnostics

### 9.1 Reading the boot log

A few key lines tell you whether your content reached the runtime:

- `Content directories initialised: standard=…, custom=…` — both roots
  found and writable.
- `Discovered N sub-mod(s) under millenaire-custom/` — sub-mod
  enumeration. Look for your pack name.
- `Loaded N cultures` — total culture count after merge. Custom cultures
  appear in the per-culture log lines below.
- `Loaded external building_plan '<c>/<id>'` — your file was parsed.
- `Error loading external …` — your file was rejected. The next log line
  has the parser error.
- `REPLACE conflict on <basename>: ignored '<later sub-mod>'` — two
  sub-mods shipped the same file. The first-alpha one wins.
- `Multi sub-mods ship X — first-wins` — pack-level summary of REPLACE
  conflicts.

### 9.2 `_validation_report.json`

After boot, a report is written under `millenaire-custom/` summarising:

- Each sub-mod's discovered roots and files per family.
- Custom cultures with their owners.
- All REPLACE conflicts and skipped files.

Read it whenever a change "doesn't seem to take" — it's faster than
grepping the log.

### 9.3 "My content does not load"

Checklist:

1. Does the file live at the expected path? Verify against §3 and §7.
2. Is the file's extension correct? `.json` for JSON, `.txt` for plain
   text, `.nbt` for structures.
3. Is the JSON valid? Most failures are syntactic (trailing commas,
   missing quotes). Run it through a JSON linter.
4. Do the loader-required fields exist? Check the matching template.
5. For custom cultures, does the culture ID match `[a-z0-9]+` (lowercase
   alphanumeric, no separators)?
6. Did you restart the server after the edit?
7. Search the boot log for the file's basename. If you don't see it
   loaded **or** rejected, the loader didn't see it at all — likely a
   path mismatch.

### 9.4 Test in-game with the Import Table

The Import Table is the round-trip block: place it in front of a built
structure, dump to NBT + JSON, edit, drop back, watch the building
respawn. Useful to:

- Verify a plan reads correctly (the building places).
- Iterate on `footprint` / `tags` without leaving the game.
- Capture an existing building for editing.

`/millenaire dev export exported-buildings` dumps every shipping
building's JSON + NBT at once for reference.

---

## §10. Limits and trust model

External content is treated as **untrusted filesystem data**. The
deployer and loaders enforce hard limits:

| Limit | Value |
|---|---|
| Max JSON file size | 1,000,000 bytes (~1 MB) |
| Max NBT file size | 10,000,000 bytes (~10 MB) |
| Max TXT file size | 512,000 bytes (~512 KB) |
| Max files per content type | 500 |
| Max custom cultures | 50 |
| Max directory recursion depth | 7 |

Files exceeding a limit are skipped with an ERROR log; the mod continues
booting. There are no per-file caps for JSON content beyond the byte
limit.

Path-traversal protection: every file write under `millenaire/` and every
read under either root is validated against `toRealPath()`; symlinks
whose targets escape are skipped with WARN. The `wipeStandardDir` step
at deploy time refuses to delete anything whose real path is not inside
the captured standard root.

---

## §11. Best practices

- **Naming**: use lowercase `snake_case` for IDs and file names. Custom
  culture IDs MUST match `[a-z0-9]+`.
- **Category vs path**: the `category` field of a building plan / villager
  type **must** match the directory name. The loader validates and
  rejects mismatches.
- **Version your sub-mod**: ship a `version.txt` (or any flag file) and a
  `README.md` at the root of your sub-mod. They are ignored by the
  loaders but help users know what they have.
- **Don't commit `_manifest/`**: any directory whose first segment starts
  with `_` is mod-internal (deployment metadata, manifests). The deployer
  skips them when copying. Don't ship them in your sub-mod.
- **Don't edit `millenaire/`**: even between mod updates, `millenaire/` is
  redeployed in dev environments on every boot. Trust nothing written
  there.
- **Edit one thing at a time**: when learning, change one file, restart,
  verify in-game, then move on. Stacking changes makes debugging hard.

---

## Annex A. Path cheat sheet

| Family | Full path |
|---|---|
| Culture | `cultures/<c>/culture.json` |
| Reputation (village) | `cultures/<c>/reputation.json` |
| Reputation (player) | `cultures/<c>/culture_reputation.json` |
| Traded goods | `cultures/<c>/traded_goods.json` |
| Building plan + NBT | `cultures/<c>/buildings/<cat>/<id>.{json,nbt}` |
| Villager type | `cultures/<c>/villagers/<cat>/<id>.json` |
| Village type | `cultures/<c>/villages/<id>.json` |
| Shop profile | `cultures/<c>/shops/<id>.json` |
| Namelist | `cultures/<c>/namelists/<name>.txt` |
| Disabled IDs | `cultures/<c>/<family>/_disabled.json` |
| Gathering type | `gathering_type/<id>.json` |
| Visit goal | `visit_goal/<id>.json` |
| Quest | `quests/<subdir>/<id>.json` |
| Sentences | `languages/<lang>/<c>_sentences.txt` |
| Dialogues | `languages/<lang>/<c>_dialogues.txt` |
| Quest text | `languages/<lang>/quest_lang.json` |
| Resource pack | `cultures/<c>/resourcepack/assets/...` |

All paths are relative to a sub-mod root — a direct child of
`millenaire-custom/` matching `[A-Za-z0-9_-]+`.

## Annex B. Glossary

- **Sub-mod**: a direct-child directory of `millenaire-custom/` that
  contains its own `cultures/` / `languages/` / `gathering_type/` /
  `quests/` tree. Names match `[A-Za-z0-9_-]+`; the names `cultures`,
  `languages`, `gathering_type`, `quests` and `exports` are reserved at
  the top level.
- **REPLACE_FIRST_ALPHA**: per-file overlay rule — the first sub-mod
  alphabetically that ships a given basename wins. Subsequent duplicates
  are ignored with WARN.
- **APPEND**: additive overlay — every sub-mod's contribution is merged.
- **Plan-set**: the JSON envelope for a building plan, holding all
  variants and their levels.
- **Variant**: one orientation / shape of a building plan (`a`, `b`, ...).
  Selected at placement time.
- **Level**: a stage of construction (1, 2, 3, ...). A village starts a
  building at level 1 and may upgrade to higher levels.
- **Marvel** (a.k.a. wonder): a one-shot top-tier building per culture
  (`buildings/wonders/`), gated behind a quest chain.

## Annex C. Links

- Templates: `millenaire/_templates/`
- Reference catalogs: `millenaire/_reference/`
- GitHub repo: <https://github.com/Kinniken/Millenaire>
- Internal spec (deeper view of the mechanism, for the curious):
  [docs/feat/custom-content.md](https://github.com/Kinniken/Millenaire/blob/main/docs/feat/custom-content.md),
  [docs/archive/specs-implemented/custom-content.md](https://github.com/Kinniken/Millenaire/blob/main/docs/archive/specs-implemented/custom-content.md),
  [docs/archive/specs-implemented/custom-content-format-v2.md](https://github.com/Kinniken/Millenaire/blob/main/docs/archive/specs-implemented/custom-content-format-v2.md),
  [docs/archive/plans/custom-content-submods.md](https://github.com/Kinniken/Millenaire/blob/main/docs/archive/plans/custom-content-submods.md).
