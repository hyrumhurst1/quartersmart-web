"""Key out magenta on the Codex pixel3/pixel4 sheets, split sheets into frames
where useful, and save native-resolution PNGs into site/assets/px/.
Sheets keep their exact cell grid (no crop) so CSS steps() animation lines up."""
import os
import sys
from PIL import Image

W = 'C:/Users/hyrum/Desktop/quartersmart-rebrand/work/'
DST = 'C:/Users/hyrum/Desktop/quartersmart-rebrand/site/assets/px/'


def key(im):
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if (r - g) > 45 and (b - g) > 45 and abs(r - b) < 80:
                px[x, y] = (0, 0, 0, 0)
    return im


def save(im, name, crop=False):
    if crop:
        bb = im.getbbox()
        if bb:
            im = im.crop(bb)
    im.save(DST + name, optimize=True)
    print(name, im.size)


def pixel3():
    s = key(Image.open(W + 'pixel3/powerups-sheet.png'))
    for i, n in enumerate(['radar', 'map', 'setup', 'token', 'robot']):
        save(s.crop((i * 32, 0, i * 32 + 32, 32)), f'pu-{n}.png')
    save(key(Image.open(W + 'pixel3/avatar-idle-sheet.png')), 'avatar-idle.png')
    save(key(Image.open(W + 'pixel3/cabinet-row.png')), 'cabinet-row.png', crop=True)
    save(key(Image.open(W + 'pixel3/desk-hacker.png')), 'desk-hacker.png', crop=True)


def pixel4():
    for f, n in [('player-at-cabinet', 'player-at-cabinet'), ('joystick-sheet', 'joystick'), ('button-sheet', 'arcade-button'), ('coin-sheet', 'coin-spin'), ('coin-slot', 'coin-slot')]:
        p = W + 'pixel4/' + f + '.png'
        if os.path.exists(p):
            save(key(Image.open(p)), n + '.png')


if __name__ == '__main__':
    (pixel4 if 'pixel4' in sys.argv else pixel3)()
