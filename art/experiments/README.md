# Aseprite + MCP art test

A 32 × 48 olive-glass bottle for Bottleography's dim bar, with a worn paper
label and warm lamp reflections. It uses ten opaque colors and transparency,
with separate glass, label, and reflection layers. This is an art experiment;
the game's procedural scenery still renders the playable scene.

`bottle.lua` draws native pixels in Aseprite. `scripts/aseprite-smoke.py` launches
`diivi/aseprite-mcp` over stdio, discovers its tools, creates the canvas, runs
the Lua through the MCP, inspects the sprite, and exports native and 8× PNGs.
It checks output dimensions, transparency, visible pixels, and palette size.
The output directory must be new, protecting any manual edits to previous art.

## Run on this machine

```bash
uv run --project /home/junho/.local/share/aseprite-mcp --frozen --no-dev \
  python scripts/aseprite-smoke.py \
  --server /home/junho/.local/share/aseprite-mcp \
  --aseprite /home/junho/.local/share/aseprite-source/build/bin/aseprite \
  --output /tmp/bottleography-art-test
```

Use a different output directory for each run. Open the resulting
`bottle.aseprite` in Aseprite to edit the layers. `bottle.png` is the transparent
32 × 48 export; `bottle-preview.png` is a nearest-neighbor 256 × 384 preview.
Python and MCP packages are development tools only, outside the game's runtime.

## Local tool sources

- [Aseprite](https://github.com/aseprite/aseprite), commit
  `375989a61c3425cd4e8cdedfcfcca4bdfef7e1d9`, built from source with the Skia GUI backend.
- [Skia binary dependencies](https://github.com/aseprite/skia/releases/tag/m124-08a5439a6b),
  `Skia-Linux-Release-x64.zip`.
- [Aseprite MCP](https://github.com/diivi/aseprite-mcp), commit
  `90d1696a7e41edff89bbd0823ae6a5f86c114bcc`, dependencies installed from `uv.lock`.

The MCP runs Aseprite in batch mode for each operation. It edits saved files;
it does not live-control an already open editor window. Reopen a file to see
changes made after it was opened in the GUI.

## Verified result

The source build reports `Aseprite 1.3.18.5-dev`. The stdio handshake exposed
116 tools, and the end-to-end test passed with three layers, ten opaque colors,
590 opaque pixels, and both expected PNG sizes. See [the preview](bottle/bottle-preview.png)
and [editable source](bottle/bottle.aseprite).

The global Codex MCP server is registered as `aseprite`. Start a new Codex
session to load the newly configured tools. The test above already exercises
the server directly and does not depend on reloading Codex.

The editor launcher is `~/.local/bin/aseprite`. This shell has no desktop display,
so the GUI could not be opened here. From a desktop terminal, run:

```bash
~/.local/bin/aseprite /home/junho/projects/bottleography/art/experiments/bottle/bottle.aseprite
```
