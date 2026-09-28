"""Render every raster icon from site/favicon.svg's pixel grid: transparent background,
whole-pixel scaling (no smoothing). The SVG is a 16x16 grid of 1-unit rects (viewBox -1 -1 16 16).
The apple-touch icon stays opaque on the night colour, because iOS fills transparency with black.
Run: python tools/favicons.py"""
import re
from PIL import Image

SITE = 'C:/Users/hyrum/Desktop/quartersmart-rebrand/site/'
NIGHT = (18, 24, 20, 255)

svg = open(SITE + 'favicon.svg', encoding='utf-8').read()
vb = [int(v) for v in re.search(r'viewBox="([-\d ]+)"', svg).group(1).split()]
ox, oy, gw, gh = vb
grid = Image.new('RGBA', (gw, gh), (0, 0, 0, 0))
for fill, d in re.findall(r'<path fill="#([0-9a-fA-F]{6})" d="([^"]+)"', svg):
    col = tuple(int(fill[i:i + 2], 16) for i in (0, 2, 4)) + (255,)
    for x, y, w, h in re.findall(r'M(-?\d+) (-?\d+)h(\d+)v(\d+)h-\d+z', d):
        for yy in range(int(y), int(y) + int(h)):
            for xx in range(int(x), int(x) + int(w)):
                grid.putpixel((xx - ox, yy - oy), col)


def scaled(size, bg=None):
    """The grid scaled by a whole number and centred in a size x size square."""
    k = max(1, size // gw)
    im = grid.resize((gw * k, gh * k), Image.NEAREST)
    out = Image.new('RGBA', (size, size), bg or (0, 0, 0, 0))
    out.alpha_composite(im, ((size - im.width) // 2, (size - im.height) // 2))
    return out


for name, size in [('favicon-16.png', 16), ('favicon-32.png', 32), ('icon-48.png', 48), ('icon-96.png', 96),
                   ('icon-192.png', 192), ('icon-512.png', 512)]:
    scaled(size).save(SITE + name, optimize=True)
scaled(512).save(SITE + 'assets/icon-512.png', optimize=True)
# apple-touch: opaque night square with the mark inset (iOS shows transparency as black)
touch = Image.new('RGBA', (180, 180), NIGHT)
mark = grid.resize((gw * 9, gh * 9), Image.NEAREST)
touch.alpha_composite(mark, ((180 - mark.width) // 2, (180 - mark.height) // 2))
touch.convert('RGB').save(SITE + 'apple-touch-icon.png', optimize=True)
touch.convert('RGB').save(SITE + 'assets/apple-touch-icon.png', optimize=True)
# favicon.ico: 16, 32 and 48, all transparent
scaled(48).save(SITE + 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[scaled(16), scaled(32)])
print('icons written: grid', gw, 'x', gh)
