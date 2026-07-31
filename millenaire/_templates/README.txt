Millénaire custom content — starter templates
=============================================

These files are skeleton JSONs to help you author custom content. They are
NOT loaded by the mod at runtime — treat them as copy-paste starting points.

To create a custom culture:
  1. Pick a lowercase-alphanumeric ID (e.g. "viking"). No underscores, no
     hyphens, no special characters.
  2. Create the directory tree:
       millenaire-custom/cultures/<your_id>/
  3. Copy these templates into the culture directory, rename the files, and
     edit them. Replace every <culture> placeholder with your ID. Remove the
     "_comment" fields once you no longer need them.
  4. Add at least one building plan with its NBT template (author it via the
     Import Table block in-game), one leader villager type, one village type
     referencing the townhall plan, and a traded_goods.json catalog.
  5. Restart the server.

For real, fully-specified examples, consult the deployed built-in cultures
under millenaire-custom/cultures/norman/ (or any other built-in culture).
They are the authoritative format reference.

The _reference/ sibling directory will hold catalogs of valid goals,
gathering handlers, tags, and special points in a future release. For now,
cross-reference the built-in cultures to discover what values are valid.
