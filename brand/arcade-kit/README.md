# Arcade kit (QuarterSmart "Night Arcade")

Refreshed 2026-09-27 by `tools/kit.py`. Read `STYLE_GUIDE.md` first.

Everything here is a copy of what ships on quartersmart.com, kept together for reuse in other apps and sites.

## sprites/

the flat sprite set (site/assets/px/flat): transparent PNGs at native pixel size, flat palette fills, at most 4 colours each (scale up with integer factors, image-rendering: pixelated); animated sprites are horizontal frame strips.

- `sprites/arcade-button.png`
- `sprites/assistant.png`
- `sprites/cabinet-butter.png`
- `sprites/cabinet-rose.png`
- `sprites/cabinet-row.png`
- `sprites/cabinet-sage.png`
- `sprites/cabinet-tile.png`
- `sprites/coin-slot.png`
- `sprites/coin-spin.png`
- `sprites/desk-crt.png`
- `sprites/joystick.png`
- `sprites/keyboard-manual.png`
- `sprites/keyboard.png`
- `sprites/manual.png`
- `sprites/pu-decode.png`
- `sprites/pu-map.png`
- `sprites/pu-radar.png`
- `sprites/pu-robot.png`
- `sprites/pu-setup.png`
- `sprites/pu-sheet.png`
- `sprites/pu-token.png`
- `sprites/radar-tower.png`

## source/

tools/pxgen.py, the sprite compiler that draws every sprite above from ASCII grids (python pxgen.py rebuilds them), its contact sheet and manifest, and the frame-strip review tool.

- `source/manifest.json`
- `source/pxgen.py`
- `source/sheet.png`
- `source/strip.mjs`

## engine/

the canvas engines and page behaviours (attract hero + scene packs, night sky, story, menu, arena, hidden terminal, idle screen).

- `engine/arena.js`
- `engine/attract-pack-classics.js`
- `engine/attract-pack-floor.js`
- `engine/attract-pack-quest.js`
- `engine/attract.js`
- `engine/home.js`
- `engine/night.js`
- `engine/qs.js`
- `engine/quarter.js`
- `engine/quest.js`
- `engine/radar.js`
- `engine/select.js`
- `engine/term.js`
- `engine/tty.js`

## css/

tokens (qs-tokens.css), the arcade/terminal layer, menu styles, the homepage sheet, the nav partial.

- `css/arcade.css`
- `css/home.css`
- `css/nav.html`
- `css/qs-tokens.css`
- `css/select.css`
- `css/term.css`

## fonts/

Departure Mono (OFL) and the text faces.

- `fonts/departure-mono-OFL.txt`
- `fonts/departure-mono.woff2`
- `fonts/ibm-plex-sans-400.woff2`
- `fonts/ibm-plex-sans-500.woff2`
- `fonts/jetbrains-mono-400.woff2`
- `fonts/jetbrains-mono-500.woff2`
