# Night Arcade: the QuarterSmart UI style guide

A reusable guide for building other apps and websites in the QuarterSmart look. Short version:
**retro video games as if a tasteful minimalist studio made them.** An arcade studio, not a hacker
cliché: video-game nerd meets the 80s and 90s hacker movies, redone with modern restraint. It is a
retro *site* (real pixel craft, real games), not a retro *theme* (textures pasted on a template).

Everything in this folder is copied from the live build. `README.md` lists the files; run
`python tools/kit.py` from the `quartersmart-rebrand` folder to refresh the kit after changes.

---

## 1. Principles (the taste rules)

1. **Night everywhere.** Every page sits under a faint pixel night sky. Hero worlds are night scenes.
   Daylight only exists in the Paper theme.
2. **Strong brand, low clutter.** One big idea per screen. Motion and art are accents around clear copy.
   If a screen has two wordmarks or two competing animations, remove one.
3. **Real pixel craft.** One pixel grid per scene, integer scaling only, `image-rendering: pixelated`,
   no anti-aliasing, no blur, no gradients inside sprites. Sprites stay small next to type.
4. **Alive, not busy.** Things move with purpose: characters play, stars breathe slowly, and nothing
   loops so fast it pulls the eye off the copy. Motion freezes while the user scrolls when it could disorient.
5. **Games interact with the brand.** Characters eat, hop on, knock over and rebuild the wordmark. The
   wordmark always reads clearly first; play comes second.
6. **Terminal as a hidden feature.** Terminal windows frame things (titles in the border, like btop),
   but a real command line is an easter egg (press backtick), never corner text or fake logs.
7. **Hidden, game-like navigation.** No classic nav bar. A pixel joystick labelled MENU opens a SELECT
   STAGE screen; hovering the top edge spawns it too.
8. **Subtle gamification.** Scores, lives, a coin that goes in the slot, a parade of characters who
   already played. Never a gimmick that blocks a task.
9. **Plain, short copy.** Big pixel headline, one plain sentence, one clear action. Fewer words wins.
10. **Accessible by default.** Real text in the DOM, canvases `aria-hidden` or labelled, keyboard paths,
    visible focus, `prefers-reduced-motion` gets still frames.

Banned: news tickers, decrypt or typewriter text effects, ASCII/ANSI art on pages, fake terminal
"corner text", floppy disks, stock-looking textured "retro" images, em dashes and en dashes in copy.

---

## 2. Colour (theme: Evergreen, the default)

Evergreen is a hybrid of Forest and Obsidian: obsidian blacks lifted toward forest, warm cream ink,
muted pastel voices. Defined as CSS custom properties on `:root` (see `css/qs-tokens.css`).

| Token | Hex | Use |
|---|---|---|
| `--bg-0` | `#121814` | page / night |
| `--bg-1` / `--bg-2` / `--bg-3` | `#18201b` / `#1f2822` / `#28332c` | surfaces, raised, hover |
| `--block` | `#2d3a36` | occasional forest-slate colour block |
| `--line` / `--line-2` | `#2c3730` / `#4a5a4f` | rules, window borders |
| `--fg-0` / `--fg-1` / `--fg-2` | `#ece4cc` / `#cbc3ab` / `#a1a99d` | cream ink, body, muted |
| `--accent` | `#a9d99f` | sage mint: brand, primary buttons, the light quarter |
| brand greens | `#2a9a70` `#1d7a58` `#16664a` | the dark quarters of the mark |
| `--warn` | `#dfc07f` | butter: coins, highlights, comets |
| `--event` | `#d99bb8` | rose (UFO lights, invaders) |
| `--info` | `#86c3ba` | teal |
| `--rose` | `#ebbcba` | a touch of Rose-theme pink: selection, kickers, window dots |
| `--ember` | `#eba66f` | a teeny bit of orange: rare accents only |

Rules: sage is the brand voice; rose and ember are seasoning (a few touches per page). Text on `--bg-0`
must stay above 4.5:1 contrast. Other themes (Midnight, Obsidian, Forest, Rose, Paper) swap the same
tokens; never hard-code a hex in a component when a token exists.

Sprite palette (for image generation and canvas art): `#121814 #1f2822 #2c3730 #4a5a4f #ece4cc #cbc3ab
#a9d99f #2a9a70 #1d7a58 #dfc07f #d99bb8 #86c3ba`.

---

## 3. Type

- **Display / UI:** Departure Mono (`--pixel`, OFL, `fonts/departure-mono.woff2`). A pixel font: set it
  only at multiples of 11px (11, 22, 27.5, 33, 44, 55, 110...) so its pixels land on whole device pixels.
- **Body:** IBM Plex Sans (`--sans`), 17px/1.62. **Code / small data:** JetBrains Mono (`--mono`).
- Headlines: big, few words, `text-wrap: balance`. Labels: pixel 11px, uppercase, letter-spaced.

**Echo text** (`.echo`, `.echo--chase`, `.echo--sm`): the signature "popping out of the screen" look.
Stacked copies of the text step straight down in rose, butter, sage, teal, green, then dark, like an 80s
arcade marquee; `--chase` rotates the layer colours with `steps(1)`. Use on 1 to 3 display lines per page
(big numbers, "now booking" signs), never on body copy. The hero wordmark uses the canvas version: an
extrusion drawn only below each letter's lowest pixels so counters stay clean.

---

## 4. Pixel art rules

- One grid per scene. Choose the art-pixel size from the layout (e.g. the hero picks the integer scale
  that makes the wordmark about 86% of the width), then draw everything on that grid.
- Integer upscale only; canvas `imageSmoothingEnabled = false`; CSS `image-rendering: pixelated`.
- Sprites: 5 to 12 art pixels tall for characters in a scene; items 32x32; avatar busts 64x64.
- Flat colours from the palette, a 1px darker outline or none, one highlight cluster, no dithering noise.
- Generated art (Codex / GPT image) is produced on flat `#ff00ff`, then keyed out and saved at native
  resolution (`tools/px3_process.py`). Prompts that worked are in `prompts/`.
- Stars (see `engine/night.js`): dots, plus signs, 4-point and 8-point sparkles, diamonds and dotted
  twinkles in cream, butter, sage, teal, a little rose and ember. Most hold still; a few breathe slowly
  through their sizes. Site sky: 3 css px per sky pixel, 50% opacity, patchy density, frozen while scrolling.

---

## 5. Motion

- Stepped where it should feel like hardware (`steps()` for blinks, bobs, menus, coin drops), smooth
  where it should feel alive (morphs, flight paths). Never both on the same element.
- **The morph** (hero): between scenes every lit pixel flies to a pixel of the next scene. Pair pixels by
  a sorted spatial key so neighbours stay neighbours, give paths a smooth shared field (not per-pixel
  random), cycle styles (arc, swirl, rain, burst). Draw the morph's first frame before the next blit, or
  you get a one-frame flash.
- Scenes: 5 to 7 seconds, varied rhythm, first frame reads cleanly, the loop opens on a clean title frame,
  then a freshly shuffled run of games; a level counter keeps rising.
- Scroll-triggered stories play at their own pace once in view (don't scrub long sequences by scroll);
  keep an idle afterlife (a tiny UFO drifting, pellets hopping) and a replay control.
- Reduced motion: final or title frame, no loops.

---

## 6. Components (files in `css/` and `engine/`)

| Component | What it is | Files |
|---|---|---|
| Terminal window | 2px `--line-2` border, title and status embedded in the top border (btop style), faint scanlines, deep-night fill | `home.css` (`.h4__win`, `.win__t`, `.win__r`, `.win__b`), `term.css` (`.qs-win`) |
| Attract-mode hero | Full-screen pixel world, wordmark re-laid per game (line, stack, wave, arc, vertical; band, bright, bricks, bunker, gold, multi, neon styles), 20+ games plus packs, ribbon morphs, parade of past characters on the ground, sky with stars, crescent moon, comets, UFO | `engine/attract.js`, `engine/attract-pack-*.js` |
| Scene pack API | `window.QSAttractPacks.push(A => ({ id: { name, dur, word, parade, init, update, draw } }))` with a live world object `A` (word cells, letters, bounds, palette, drawing kit) | see the header of `attract.js` and any pack file |
| Night sky | Fixed low-res star canvas behind all pages plus the `QSSky` drawing kit | `engine/night.js`, `term.css` (`.nightsky`) |
| Scroll story | Timed pixel story in a terminal window with score and quarter "lives" | `engine/quarter.js`, `term.css` |
| Select stage menu | Joystick "MENU" trigger, top-edge hover, pixel spawn-in, stage tiles with power-up sprites, 1P cursor, BANG bubble, insert-coin CTA, hidden player-at-cabinet | `engine/select.js`, `css/select.css`, `_partials/nav.html` |
| Coin drop | Coin falls into the button, then navigates | `engine/select.js` |
| Arcade button | Accent fill with a 5px bottom edge that presses | `css/arcade.css` (`.btn--arcade`) |
| Power-up shelf | Five 32px items, the active one lit and bobbing | `home.css` (`.pu-shelf`) |
| Footer coin arena | Characters brawling over a hovering coin | `engine/arena.js`, `engine/quest.js` |
| Hidden terminal | Backtick opens a real little shell (`help`, `signals`, `play`...) | `engine/tty.js`, `engine/term.js`, `term.css` |
| Idle screen | After inactivity, an attract-style screensaver | `engine/idle.js`, `term.css` |
| Scrollbar | Slim sage thumb on the night track | `term.css` |

---

## 7. Copy voice

Plain English, short lines, specific verbs. Headline pattern: a promise in 6 to 8 words ("Use new AI
while it's still an advantage."). One sentence of how. One primary action per screen ("Book a
20-minute call"), one secondary ("Read today's Signals"). No hype words, no fabricated numbers, no em
or en dashes. Arcade language is flavour on labels and micro-copy (select stage, insert coin, player one,
continue?), never in the core promise.

---

## 8. Starting a new project in this style

1. Copy `css/qs-tokens.css` (tokens, fonts) and `fonts/`.
2. Add `engine/night.js` for the sky and `css/term.css` for windows, echo text and the scrollbar.
3. Frame the hero in a terminal window; put your wordmark in the attract engine (swap `TEXT` and the
   `GLYPH` table in `attract.js`) or a still pixel title with an echo.
4. Generate sprites with the prompt style in `prompts/` on flat magenta, key them out, keep native size.
5. Replace the nav with the select-stage menu.
6. Check every screen at 1440 and 390 wide, in reduced motion, and with the keyboard.
