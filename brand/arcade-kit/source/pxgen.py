#!/usr/bin/env python3
"""pxgen: the QuarterSmart flat sprite compiler.

Every sprite is an ASCII grid plus a palette key, drawn in the same hand as the homepage
hero (assets/js/attract.js): flat fills, chunky square pixels, no anti-aliasing, no
gradients, no dithering, no illustrative shading, front, back or side views only.
At most 4 colours per sprite (plus transparent) and at most one of them a flat shadow
tone. Composites (a row of cabinets, the power-up sheet) are
built by stamping sprites together, and each part keeps to the limit on its own.

    python tools/pxgen.py            build every PNG into site/assets/px/flat/, the contact
                                     sheet shots/flat/sheet.png and shots/flat/manifest.json
    python tools/pxgen.py --check    validate only (row widths, palette keys, colour counts)
    python tools/pxgen.py --preview a,b [scale]
                                     close-up of some sprites in shots/flat/preview.png
    python tools/pxgen.py --ref      re-sample hero captures (see HERO_CROPS) to art pixels

Output is native size: 1 art pixel = 1 image pixel. Scale on the page with integer
factors and image-rendering: pixelated. Animated sprites export as one horizontal strip
(frame i sits at x = i * frame width), so CSS can step background-position.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'site', 'assets', 'px', 'flat')
SHOTS = os.path.join(ROOT, 'shots', 'flat')

# ---------- the palette: the only colours allowed (keys match the hero's own sprite keys) ----------
PAL = {
    '.': None,         # transparent
    'n': '#121814',    # night
    's': '#1f2822',    # surface
    'v': '#2c3730',    # line
    'm': '#4a5a4f',    # dim
    'h': '#ece4cc',    # cream (the hero's "hi")
    'c': '#cbc3ab',    # soft cream
    'q': '#a9d99f',    # sage
    'o': '#2a9a70',    # green
    'd': '#1d7a58',    # deep green
    'b': '#dfc07f',    # butter
    'r': '#d99bb8',    # rose
    't': '#86c3ba',    # teal
}
MAX_COLOURS = 4        # per sprite, plus transparent


def G(src):
    """Parse an indented block of rows into a list of strings."""
    rows = [ln.strip() for ln in src.strip('\n').split('\n')]
    return [r for r in rows if r]


def sub(grid, **keys):
    """Swap palette keys, e.g. sub(cab, X='q')."""
    return [''.join(keys.get(ch, ch) for ch in row) for row in grid]


def blank(w, h):
    return ['.' * w for _ in range(h)]


def stamp(base, part, x, y):
    """Draw part onto base at (x, y); '.' in part stays see-through."""
    out = [list(r) for r in base]
    for j, row in enumerate(part):
        for i, ch in enumerate(row):
            if ch != '.' and 0 <= y + j < len(out) and 0 <= x + i < len(out[0]):
                out[y + j][x + i] = ch
    return [''.join(r) for r in out]


# ---------- registry ----------
SPRITES = {}   # file stem -> dict(frames=[grid...], group=str, note=str, parts=[grid...] or None)


def add(name, frames, group, note='', parts=None):
    """Register a sprite. A composite passes its parts, and the colour limit applies to each part."""
    if isinstance(frames[0], str):
        frames = [frames]
    SPRITES[name] = dict(frames=frames, group=group, note=note, parts=parts)


# =====================================================================================
# POWER-UPS  16x16, one per level, in site order
# =====================================================================================
PU_RADAR = G("""
    ...........qqq..
    ..............q.
    ..........qq...q
    ............q..q
    .............q..
    .........bb..q..
    ..hh.....bb.....
    ..hhh...h.......
    .hhhhh.h........
    .hhhhhh.........
    .hhhhhhh........
    ..hhhhhhh.......
    ..hhhhhhhh......
    ...hhhhhhh......
    .....hhh........
    ....mmmmm.......
""")

PU_MAP = G("""
    ................
    ......cccc......
    .hhhhhcccchhhhh.
    .hhhhhcccchhhhh.
    .hhhhhcccchrhrh.
    .hhhhhcccchhrhh.
    .hhhhhcccchrhrh.
    .hhhhhcccchhhhh.
    .hhhhhccrchhhhh.
    .hhhhhcccchhhhh.
    .hhhhrcccchhhhh.
    .hhhhhcccchhhhh.
    .hhrhhcccchhhhh.
    .hhhhhcccchhhhh.
    .hhhhh....hhhhh.
    ................
""")

PU_SETUP = G("""
    ................
    .......ccc......
    ......cc........
    ......cc..c.....
    ......ccccc.....
    .....ccccc......
    ....ccc....qq...
    ...ccc....qqqq..
    ..ccc.....qqhq..
    .ccc......qqqq..
    .cc........qq...
    ...........hh...
    ...........hh...
    .........mmmmmm.
    ........mmmmmmmm
    ........mmmmmmmm
""")

PU_TOKEN = G("""
    ................
    .....bbbbbb.....
    ...hhbbbbbbbb...
    ..hbbbbbbqqbbb..
    ..bbbbbbbqqqbb..
    .bbbbddbbqqqqbb.
    .bbbdddbbqqqqbb.
    .bbddddbbbbbbbb.
    .bbddddbbbbbbbb.
    .bbddddddddbbbb.
    .bbddddddddbbbb.
    ..bbddddddbbbb..
    ..bbbddddbbbbb..
    ...bbbbbbbbbb...
    .....bbbbbb.....
    ................
""")

PU_ROBOT = G("""
    .......b........
    .......t........
    ....tttttttt....
    ...tttttttttt...
    ...tnnnnnnnnt...
    ...tnqqnnqqnt...
    ...tnnnnnnnnt...
    ...tttttttttt...
    .....tttttt.....
    ..tttttttttttt..
    ..t.ttbbtttt.t..
    ..t.tttttttt.t..
    ....tttttttt....
    ....tt....tt....
    ....tt....tt....
    ...ttt....ttt...
""")

# The method's four steps reuse the power-ups (detect = radar, deploy = setup,
# stay current = token); decode gets its own: a lens with a sage tick on its dark glass.
PU_DECODE = G("""
    ................
    ....ccccc.......
    ...ccccccc......
    ..ccnnnnncc.....
    .ccnnnnnnncc....
    .ccnnnnnqqcc....
    .ccnnnnqqncc....
    .ccqqnqqnncc....
    .ccnqqqnnncc....
    ..ccnnnnncc.....
    ...cccccccbb....
    ....ccccc.bbb...
    ...........bbb..
    ............bbb.
    .............bb.
    ................
""")
add('pu-decode', PU_DECODE, 'method', 'Decode: a lens with a tick in the glass (the method rail)')

PU = [('pu-radar', PU_RADAR, 'Signals: a radar dish'),
      ('pu-map', PU_MAP, 'Head Start: a folded map'),
      ('pu-setup', PU_SETUP, 'Day One Setup: a wrench and a joystick'),
      ('pu-token', PU_TOKEN, 'First Quarter: a token with the quarter-circle emblem'),
      ('pu-robot', PU_ROBOT, 'Build: a little robot')]
for name, grid, note in PU:
    add(name, grid, 'power-ups', note)
add('pu-sheet', [g for _, g, _ in PU], 'power-ups', 'all five power-ups in site order, one 16x16 frame each',
    parts=[g for _, g, _ in PU])


# =====================================================================================
# ARCADE CABINET  16x28, front view. X = the variant colour. The screen is 12x7 at (2, 5).
# =====================================================================================
CAB = G("""
    .mmmmmmmmmmmmmm.
    mXXXXXXXXXXXXXXm
    mXXXXXXXXXXXXXXm
    mXXXXXXXXXXXXXXm
    .mmmmmmmmmmmmmm.
    .mnnnnnnnnnnnnm.
    .mnnnnnnnnnnnnm.
    .mnnnnnnnnnnnnm.
    .mnnnnnnnnnnnnm.
    .mnnnnnnnnnnnnm.
    .mnnnnnnnnnnnnm.
    .mnnnnnnnnnnnnm.
    .mmmmmmmmmmmmmm.
    .mmmXXmmmmmmmmm.
    .mmmmhmmmhmhmmm.
    mmmmmmmmmmmmmmmm
    .nnnnnnnnnnnnnn.
    .mmmmmmmmmmmmmm.
    .mmmmmmmmmmmmmm.
    .mmmmnnnnnnmmmm.
    .mmmmnnXXnnmmmm.
    .mmmmnnXXnnmmmm.
    .mmmmnnXXnnmmmm.
    .mmmmnnnnnnmmmm.
    .mmmmmmmmmmmmmm.
    .mmmmmmmmmmmmmm.
    .nnnnnnnnnnnnnn.
    .mmmmmmmmmmmmmm.
""")
SCREEN_AT = (2, 5)

SCR_SNAKE = G("""
    nnnnnnnnnnnn
    nXXXXXnnnnnn
    nnnnnXnnnhnn
    nnnnnXnnnnnn
    nnnnnXXXXnnn
    nnnnnnnnnnnn
    nnnnnnnnnnnn
""")
SCR_CHOMP = G("""
    nnnnnnnnnnnn
    nnXXXnnnnnnn
    nXXXnnnnnnnn
    nXXnnnhnnhnn
    nXXXnnnnnnnn
    nnXXXnnnnnnn
    nnnnnnnnnnnn
""")
SCR_INVADER = G("""
    nnnnnnnnnnnn
    nnnXnnnXnnnn
    nnnnXXXnnnnn
    nnnXXnXXnnnn
    nnnXnXnXnnnn
    nnnnnnnnnhnn
    nnnnnnnnnnnn
""")


def cabinet(colour, screen):
    return sub(stamp(CAB, screen, *SCREEN_AT), X=colour)


CABS = [('cabinet-sage', 'q', SCR_SNAKE), ('cabinet-butter', 'b', SCR_CHOMP), ('cabinet-rose', 'r', SCR_INVADER)]
for name, col, scr in CABS:
    add(name, cabinet(col, scr), 'cabinets', f'arcade cabinet, {name.split("-")[1]} marquee')

ROW_GAP = 2
row = blank(2 + 3 * 16 + 2 * ROW_GAP + 2, 29)
for i, (name, col, scr) in enumerate(CABS):
    row = stamp(row, cabinet(col, scr), 2 + i * (16 + ROW_GAP), 0)
row[28] = ''.join('v' if x % 2 == 0 else '.' for x in range(len(row[28])))
add('cabinet-row', row, 'cabinets', 'the three cabinets standing together on a floor line',
    parts=[cabinet(col, scr) for _, col, scr in CABS] + [row[28:]])


# =====================================================================================
# MENU JOYSTICK  10x12, frames: left, centre, right
# =====================================================================================
JOY_C = G("""
    ...bbbb...
    ..bhbbbb..
    ..bbbbbb..
    ..bbbbbb..
    ...bbbb...
    ....hh....
    ....hh....
    ...mmmm...
    .mmmmmmmm.
    mmmmmmmmmm
    mmmmmmmmmm
    .vvvvvvvv.
""")
JOY_L = G("""
    ..........
    .bbbb.....
    bhbbbb....
    bbbbbb....
    bbbbbb....
    .bbbbh....
    ....hh....
    ...mmmm...
    .mmmmmmmm.
    mmmmmmmmmm
    mmmmmmmmmm
    .vvvvvvvv.
""")
JOY_R = G("""
    ..........
    .....bbbb.
    ....bhbbbb
    ....bbbbbb
    ....bbbbbb
    ....hbbbb.
    ....hh....
    ...mmmm...
    .mmmmmmmm.
    mmmmmmmmmm
    mmmmmmmmmm
    .vvvvvvvv.
""")
add('joystick', [JOY_L, JOY_C, JOY_R], 'dock', 'menu joystick for the top-right dock: left, centre, right')


# =====================================================================================
# COIN SLOT  8x12, frames: idle, lit.  COIN  6x6, four spin frames
# =====================================================================================
# A coin door, not a ring: the slit in the top half (its top at row 3, where the
# dropped coin vanishes) and a coin-return flap below, so it never reads as a "0".
# Lit, the slit and the flap's lip glow butter.
SLOT_IDLE = G("""
    .mmmmmm.
    mmmmmmmm
    mmmmmmmm
    mmmnnmmm
    mmmnnmmm
    mmmnnmmm
    mmmnnmmm
    mmmmmmmm
    mmmmmmmm
    mnnnnnnm
    mnnnnnnm
    mmmmmmmm
""")
SLOT_LIT = G("""
    .mmmmmm.
    mmmmmmmm
    mmmmmmmm
    mmmbbmmm
    mmmbbmmm
    mmmbbmmm
    mmmbbmmm
    mmmmmmmm
    mmmmmmmm
    mbbbbbbm
    mnnnnnnm
    mmmmmmmm
""")
add('coin-slot', [SLOT_IDLE, SLOT_LIT], 'dock', 'coin slot for the book-a-call dock: idle, lit')

BTN_UP = G("""
    ...qqqq...
    ..qhqqqq..
    ..qqqqqq..
    .mmqqqqmm.
    mmmmmmmmmm
    mmmmmmmmmm
    .vvvvvvvv.
""")
BTN_DOWN = G("""
    ..........
    ...qqqq...
    ..qqqqqq..
    .mmqqqqmm.
    mmmmmmmmmm
    mmmmmmmmmm
    .vvvvvvvv.
""")
add('arcade-button', [BTN_UP, BTN_DOWN], 'dock', 'the select screen button beside the joystick: up, pressed')

COIN = [G("""
    .bbbb.
    bbbhhb
    bbbhhb
    bbbbbb
    bbbbbb
    .bbbb.
"""), G("""
    ..bb..
    .bbhb.
    .bbhb.
    .bbbb.
    .bbbb.
    ..bb..
"""), G("""
    ..hb..
    ..hb..
    ..hb..
    ..hb..
    ..hb..
    ..hb..
"""), G("""
    ..bb..
    .bbbb.
    .bbbb.
    .bbbb.
    .bbbb.
    ..bb..
""")]
add('coin-spin', COIN, 'dock', 'a quarter spinning: face, turn, edge, turn')


# =====================================================================================
# APPROACH ART: keyboard 22x8, open manual 14x10, and the two side by side
# =====================================================================================
KEYBOARD = G("""
    .mmmmmmmmmmmmmmmmmmmm.
    mhhmhhmhhmhhmhhmhhmhhm
    mmmmmmmmmmmmmmmmmmmmmm
    mhmhhmhhmhhmhhmhhmqqqm
    mmmmmmmmmmmmmmmmmmmmmm
    mhhhmhhhhhhhhhhhhmhhhm
    mmmmmmmmmmmmmmmmmmmmmm
    .vvvvvvvvvvvvvvvvvvvv.
""")
MANUAL = G("""
    .hhhhh..hhhhh.
    .hhhhhcchhhhh.
    .hmmmhcchmmmh.
    .hhhhhcchhhhh.
    .hmmhhcchmmmh.
    .hhhhhcchhhhh.
    .hmmmhcchmmhh.
    .hhhhhcchhhhh.
    qhhhhhcchhhhhq
    qqqqqqqqqqqqqq
""")
add('keyboard', KEYBOARD, 'approach', 'a keyboard, top view')
add('manual', MANUAL, 'approach', 'an open manual, top view')
KM = blank(22 + 3 + 14, 10)
KM = stamp(KM, KEYBOARD, 0, 2)
KM = stamp(KM, MANUAL, 25, 0)
add('keyboard-manual', KM, 'approach', 'the keyboard beside the open manual', parts=[KEYBOARD, MANUAL])


# =====================================================================================
# SCENE PROPS: radar tower 20x24, assistant device 16x14, desk with a CRT 28x18
# =====================================================================================
RADAR_TOWER = G("""
    ..............qqq...
    .................q..
    .............qq...q.
    ...............q..q.
    ................q..q
    ............bb..q..q
    ............bb......
    ....hh.....h........
    ....hhh...h.........
    ...hhhhh.h..........
    ...hhhhhh...........
    ...hhhhhhh..........
    ....hhhhhhh.........
    ....hhhhhhhh........
    .....hhhhhhh........
    .......hhh..........
    .......mmm..........
    .......mmm..........
    ......mm.mm.........
    ......m.m.m.........
    .....m.m.m.m........
    .....mm...mm........
    ....m.m...m.m.......
    ...mm.......mm......
""")
add('radar-tower', RADAR_TOWER, 'props', 'a radar tower with its dish')

ASSISTANT = G("""
    .......q........
    .......m........
    ..mmmmmmmmmmmm..
    .mmmmmmmmmmmmmm.
    .mqqqqqqqqmmmmm.
    .mqnqqqqnqmhmhm.
    .mqnqqqqnqmmmmm.
    .mqqqqqqqqmhmhm.
    .mqnqqqqnqmmmmm.
    .mqqnnnnqqmhmhm.
    .mqqqqqqqqmmmmm.
    .mmmmmmmmmmmmmm.
    ..mmmmmmmmmmmm..
    ...mm......mm...
""")
add('assistant', ASSISTANT, 'props', 'a small assistant device with a friendly screen')

DESK = G("""
    ...hhhhhhhhhhhh.............
    ..hhhhhhhhhhhhhh............
    ..hhnnnnnnnnnnhh............
    ..hhnqqnnnnnnnhh............
    ..hhnnqnnnnnnnhh............
    ..hhnqqnqqnnnnhh............
    ..hhnnnnnnnnnnhh............
    ..hhnqqqqnnnnnhh............
    ..hhnnnnnnnnnnhh............
    ..hhhhhhhhhhhqhh............
    ...hhhhhhhhhhhh.......hhh...
    ....hmhmhmhmhmhmh....hhhhh..
    mmmmmmmmmmmmmmmmmmmmmmmmmmmm
    mmmmmmmmmmmmmmmmmmmmmmmmmmmm
    .mm..............mmmmmmmmm..
    .mm..............mmmmhmmmm..
    .mm..............mmmmmmmmm..
    .mm..............mm.....mm..
""")
add('desk-crt', DESK, 'props', 'a desk with a CRT, a keyboard and a mug')


# =====================================================================================
# ABOUT TILE  16x16: the menu's About stage. A small QuarterSmart cabinet whose screen
# shows the mark (deep green, the quarter in sage), drawn on the power-up grid so it
# sits beside them at 4x. The site draws no people: no player, no portrait.
# =====================================================================================
CAB_TILE = G("""
    ..mmmmmmmmmmmm..
    .mqqqqqqqqqqqqm.
    ..mmmmmmmmmmmm..
    ..mnnnnnnnnnnm..
    ..mnnnddqqnnnm..
    ..mnndddqqqnnm..
    ..mnndddqqqnnm..
    ..mnnddddddnnm..
    ..mnnddddddnnm..
    ..mnnnddddnnnm..
    ..mnnnnnnnnnnm..
    .mmmqqmmmmqmqmm.
    ..mmmmnnnnmmmm..
    ..mmmmnqqnmmmm..
    ..mmmmnnnnmmmm..
    ..mmmmmmmmmmmm..
""")
add('cabinet-tile', CAB_TILE, 'cabinets', 'About: a small QuarterSmart cabinet with the mark on its screen (the menu tile)')


# =====================================================================================
# build
# =====================================================================================
def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def check():
    errs, warns = [], []
    for name, sp in SPRITES.items():
        fr = sp['frames']
        w, h = len(fr[0][0]), len(fr[0])
        used = set()
        for k, g in enumerate(fr):
            if len(g) != h:
                errs.append(f'{name}[{k}]: {len(g)} rows, expected {h}')
            for j, r in enumerate(g):
                if len(r) != w:
                    errs.append(f'{name}[{k}] row {j}: width {len(r)}, expected {w}: {r!r}')
                for ch in r:
                    if ch not in PAL:
                        errs.append(f'{name}[{k}] row {j}: unknown key {ch!r}')
                    elif ch != '.':
                        used.add(ch)
        sp['w'], sp['h'], sp['used'] = w, h, ''.join(sorted(used))
        for k, part in enumerate(sp['parts'] or fr):
            cols = set(''.join(part)) - {'.'}
            if len(cols) > MAX_COLOURS:
                warns.append(f'{name} part {k}: {len(cols)} colours ({"".join(sorted(cols))}), limit {MAX_COLOURS}')
    return errs, warns


def render(grid, scale=1):
    from PIL import Image
    h, w = len(grid), len(grid[0])
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    px = im.load()
    for j, r in enumerate(grid):
        for i, ch in enumerate(r):
            c = PAL.get(ch)
            if c:
                px[i, j] = hexrgb(c) + (255,)
    if scale != 1:
        im = im.resize((w * scale, h * scale), Image.NEAREST)
    return im


def strip(frames, scale=1):
    from PIL import Image
    w, h = len(frames[0][0]), len(frames[0])
    im = Image.new('RGBA', (w * len(frames) * scale, h * scale), (0, 0, 0, 0))
    for k, g in enumerate(frames):
        im.paste(render(g, scale), (k * w * scale, 0))
    return im


def build():
    os.makedirs(OUT, exist_ok=True)
    manifest = {}
    for name, sp in SPRITES.items():
        path = os.path.join(OUT, name + '.png')
        strip(sp['frames']).save(path, optimize=True)
        manifest[name] = dict(file=f'/assets/px/flat/{name}.png', frame=[sp['w'], sp['h']],
                              frames=len(sp['frames']), colours=sp['used'], group=sp['group'], note=sp['note'])
    return manifest


# ---------- contact sheet: every sprite at 4x beside crops of the hero at the same art-pixel size ----------
# The hero crops come from shots/flat/ref/hero-<scene>-art.png: the hero canvas sampled back to one
# image pixel per art pixel. To refresh them, capture the canvas at 1440x900, DPR 1, dark scheme, with
# http://localhost:8772/?scene=<scene>&t=<ms>, click the pause button, save canvas.toDataURL() as
# shots/flat/ref/hero-<scene>.png (1392x788 at that size), then run  python tools/pxgen.py --ref.
# At 1392px wide the hero draws one art pixel as 7 canvas pixels, starting one pixel left of the
# edge (attract.js dims(): SC = 7, x offset -1), so the sampler reads the centre of each 7x7 cell.
REF_SCALE, REF_OX = 7, -1
HERO_CROPS = [
    ('hero: swarm', 'classicsGalaga', (24, 2, 128, 50)),
    ('hero: platformer', 'questPlatformer', (118, 2, 194, 52)),
    ('hero: invaders', 'invaders', (18, 2, 112, 40)),
    ('hero: claw', 'floorClaw', (28, 0, 150, 62)),
    ('hero: race', 'race', (112, 36, 174, 52)),
]
GROUPS = ['power-ups', 'method', 'cabinets', 'dock', 'approach', 'props']


def sample_ref(scale=REF_SCALE, ox=REF_OX):
    """hero-<scene>.png (canvas pixels) -> hero-<scene>-art.png (art pixels) for every capture in ref/."""
    from PIL import Image
    ref = os.path.join(SHOTS, 'ref')
    for f in sorted(os.listdir(ref)):
        if not (f.startswith('hero-') and f.endswith('.png')) or f.endswith('-art.png'):
            continue
        im = Image.open(os.path.join(ref, f)).convert('RGBA')
        gw, gh = -(-im.width // scale), -(-im.height // scale)
        out = Image.new('RGBA', (gw, gh), hexrgb(PAL['n']) + (255,))
        src, dst = im.load(), out.load()
        for j in range(gh):
            for i in range(gw):
                x, y = ox + i * scale + scale // 2, j * scale + scale // 2
                if 0 <= x < im.width and 0 <= y < im.height and src[x, y][3]:
                    dst[i, j] = src[x, y]
        out.save(os.path.join(ref, f[:-4] + '-art.png'))
        print('ref', f, '->', gw, 'x', gh)


def sheet(scale=4, path=None, only=None):
    from PIL import Image, ImageDraw, ImageFont
    night = hexrgb(PAL['n']) + (255,)
    font = ImageFont.load_default()
    items = []   # (label, image)
    if not only:
        ref = os.path.join(SHOTS, 'ref')
        for label, scene, box in HERO_CROPS:
            f = os.path.join(ref, f'hero-{scene}-art.png')
            if os.path.exists(f):
                im = Image.open(f).convert('RGBA').crop(box)
                items.append(('H', label, im.resize((im.width * scale, im.height * scale), Image.NEAREST)))
    for g in GROUPS:
        for name, sp in SPRITES.items():
            if sp['group'] != g or (only and name not in only):
                continue
            fr = sp['frames']
            w, h = sp['w'] * scale, sp['h'] * scale
            gap = 2 * scale if len(fr) > 1 else 0
            im = Image.new('RGBA', (len(fr) * w + (len(fr) - 1) * gap, h), (0, 0, 0, 0))
            for k, gr in enumerate(fr):
                im.alpha_composite(render(gr, scale), (k * (w + gap), 0))
            items.append((g, f'{name}  {sp["w"]}x{sp["h"]}' + (f' x{len(fr)}' if len(fr) > 1 else '') + f'  [{sp["used"]}]', im))
    W, pad, lab = 1500, 24, 16
    x = y = pad
    rowh = 0
    place = []
    last = None
    for grp, label, im in items:
        if last is not None and grp != last and x > pad:
            x = pad
            y += rowh + pad
            rowh = 0
        if x + im.width > W - pad and x > pad:
            x = pad
            y += rowh + pad
            rowh = 0
        place.append((label, im, x, y))
        x += max(im.width, len(label) * 6) + pad
        rowh = max(rowh, im.height + lab)
        last = grp
    H = y + rowh + pad
    out = Image.new('RGBA', (W, H), night)
    d = ImageDraw.Draw(out)
    for label, im, x, y in place:
        d.text((x, y), label, fill=hexrgb(PAL['c']) + (255,), font=font)
        out.alpha_composite(im, (x, y + lab))
    out.save(path or os.path.join(SHOTS, 'sheet.png'))
    return out.size


if __name__ == '__main__':
    errs, warns = check()
    for e in errs:
        print('ERROR', e)
    for w in warns:
        print('WARN ', w)
    if errs:
        sys.exit(1)
    if '--check' in sys.argv:
        sys.exit(0)
    if '--ref' in sys.argv:
        sample_ref()
        sys.exit(0)
    if '--preview' in sys.argv:          # --preview name,name [scale]: a quick close-up while drawing
        i = sys.argv.index('--preview')
        names = sys.argv[i + 1].split(',')
        sc = int(sys.argv[i + 2]) if len(sys.argv) > i + 2 else 8
        print(sheet(sc, os.path.join(SHOTS, 'preview.png'), only=names))
        sys.exit(0)
    m = build()
    print('sheet', sheet())
    os.makedirs(SHOTS, exist_ok=True)
    with open(os.path.join(SHOTS, 'manifest.json'), 'w') as f:
        json.dump(m, f, indent=1)
    for k, v in m.items():
        print(f'{k:20s} {v["frame"][0]}x{v["frame"][1]} x{v["frames"]}  [{v["colours"]}]')
