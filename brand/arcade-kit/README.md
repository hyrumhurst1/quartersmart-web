# Arcade kit (QuarterSmart "Night Arcade")

Refreshed 2026-09-27 by `tools/kit.py`. Read `STYLE_GUIDE.md` first.

Everything here is a copy of what ships on quartersmart.com, kept together for reuse in other apps and sites.

## sprites/

processed, transparent PNG sprites at native pixel size (scale up with integer factors, image-rendering: pixelated).

- `sprites/arcade-button.png`
- `sprites/avatar-hyrum.png`
- `sprites/avatar-idle.png`
- `sprites/cabinet-row.png`
- `sprites/coin-slot.png`
- `sprites/coin-spin.png`
- `sprites/desk-hacker.png`
- `sprites/joystick.png`
- `sprites/player-at-cabinet.png`
- `sprites/pu-map.png`
- `sprites/pu-radar.png`
- `sprites/pu-robot.png`
- `sprites/pu-setup.png`
- `sprites/pu-token.png`
- `sprites/scene-desert-dusk.png`
- `sprites/scene-horizon.png`
- `sprites/scene-radar-night.png`
- `sprites/sprite-answering-machine.png`
- `sprites/sprite-arcade.png`
- `sprites/sprite-assistant.png`
- `sprites/sprite-floppies.png`
- `sprites/sprite-keyboard-manual.png`
- `sprites/sprite-radar.png`
- `sprites/sprite-radio.png`
- `sprites/sprite-workstation.png`

## sprites-raw/

the original Codex image-generation outputs on flat #ff00ff, by batch.

- `sprites-raw/pixel/avatar-hyrum-full.png`
- `sprites-raw/pixel/avatar-hyrum.png`
- `sprites-raw/pixel/scene-desert-dusk.png`
- `sprites-raw/pixel/scene-horizon.png`
- `sprites-raw/pixel/scene-radar-night.png`
- `sprites-raw/pixel/sprite-answering-machine.png`
- `sprites-raw/pixel/sprite-arcade.png`
- `sprites-raw/pixel/sprite-assistant.png`
- `sprites-raw/pixel/sprite-cartridges.png`
- `sprites-raw/pixel/sprite-floppies.png`
- `sprites-raw/pixel/sprite-keyboard-manual.png`
- `sprites-raw/pixel/sprite-radar.png`
- `sprites-raw/pixel/sprite-radio.png`
- `sprites-raw/pixel/sprite-workstation.png`
- `sprites-raw/pixel2/avatar-hyrum-full.png`
- `sprites-raw/pixel2/avatar-hyrum.png`
- `sprites-raw/pixel2/ref-hyrum.png`
- `sprites-raw/pixel2/scene-horizon.png`
- `sprites-raw/pixel2/sprite-arcade.png`
- `sprites-raw/pixel2/sprite-assistant.png`
- `sprites-raw/pixel2/sprite-cartridges.png`
- `sprites-raw/pixel2/sprite-keyboard-manual.png`
- `sprites-raw/pixel2/sprite-radar.png`
- `sprites-raw/pixel3/avatar-idle-sheet.png`
- `sprites-raw/pixel3/cabinet-row.png`
- `sprites-raw/pixel3/desk-hacker.png`
- `sprites-raw/pixel3/powerups-sheet.png`
- `sprites-raw/pixel4/button-sheet.png`
- `sprites-raw/pixel4/coin-sheet.png`
- `sprites-raw/pixel4/coin-slot.png`
- `sprites-raw/pixel4/joystick-sheet.png`
- `sprites-raw/pixel4/player-at-cabinet.png`

## engine/

the canvas engines and page behaviours (attract hero + scene packs, night sky, story, menu, arena, hidden terminal, idle screen).

- `engine/arena.js`
- `engine/attract-pack-classics.js`
- `engine/attract-pack-floor.js`
- `engine/attract-pack-quest.js`
- `engine/attract.js`
- `engine/home.js`
- `engine/idle.js`
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

## prompts/

image-generation prompts that produced the art, the magenta key-out script, the frame-strip review tool.

- `prompts/codex-img-prompt.md`
- `prompts/codex-img2-prompt.md`
- `prompts/codex-pixel-prompt.md`
- `prompts/codex-pixel2-prompt.md`
- `prompts/codex-pixel3-prompt.md`
- `prompts/codex-pixel4-prompt.md`
- `prompts/codex-refs-prompt.md`
- `prompts/px3_process.py`
- `prompts/strip.mjs`
