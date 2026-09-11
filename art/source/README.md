# Bottleography scene art

All game artwork is drawn on Aseprite's native pixel grid in `scenes.lua`.
It expands the approved olive-glass bottle into a coordinated palette of deep
forest shadows, green enamel, brass, amber, and warm paper.

The editable `scenes.aseprite` contains named room, bar, stranger, foreground,
desk, rain, and smoke layers. The desk and effect sheets are hidden in the
master's default bar composition. Each export also has its own `.aseprite`
source; open the individual 1920 × 240 sheets to edit all four effect frames.

| Export | Contents |
| --- | --- |
| `room.png` | Brickwork, paneling, curtain, window, rooftops, wall print |
| `bar.png` | Mirrored bottle shelves, cabinets, pendant, leather booth |
| `stranger-puff-sheet.png` | Nine poses: resting, raising the cigarette, drawing, lowering and exhaling; editable timed animation in `stranger-puff.aseprite` |
| `stranger.png` | Shadowed sitter, coat, relaxed hand on the table edge |
| `foreground.png` | Wood table, approved bottle, tumbler, ashtray, matchbox, notebook, pen |
| `desk.png` | Writing room, books, botanical print, lamp, typewriter, manuscript, coffee, the same journal and pen, loose notes |
| `rain-sheet.png`, `smoke-sheet.png` | Four horizontal 480 × 240 frames, 220 ms each |
| `bar-flicker.png` | Localized dimming of the bulb and its light pool |
| `parcel-closed.png`, `parcel-open.png` | Opening parcel and revealed diary/letter |
| `paper.png`, `grain.png` | Repeating journal and dark surface textures |
| `seal.png` | Wax bottle seal for the invitation and ending |
| `evidence-*.png` | Fire, chapel key, river illustrations |

`assets/` holds browser-ready PNGs. `scenery.js` preloads all scene images and
composites them with nearest-neighbor scaling. Reduced motion freezes the
rain/smoke, cigarette puffs and lamp flicker and makes the stranger's reveal immediate.
Images use relative URLs, including under a GitHub Pages subdirectory.
The build includes every exported PNG in both `dist/` and the itch ZIP.

## Regenerate

Regeneration overwrites exports and generated Aseprite sources. Keep manual
edits in a separate file, or incorporate them into the drawing script first.

Through the Aseprite MCP `run_lua_script` tool:

```lua
dofile('/home/junho/projects/bottleography/art/source/scenes.lua')
```

Or directly from the project root:

```bash
~/.local/bin/aseprite --batch --script-param root="$PWD" --script art/source/scenes.lua
npm run build
```

This art uses the original bottle in `art/experiments/bottle/bottle.png` as an
input. Aseprite and the MCP are development tools; players only download PNGs.

The lamps now determine material brightness: low ambient light, a narrow
pendant cone, a warm bar-table pool, and a localized desk-lamp pool. Shelf
bottles are drawn with six distinct silhouettes from a shared physical baseline.
The same journal drawing is reused on both tables. The typewriter's detailed
redesign remains a later art pass.
