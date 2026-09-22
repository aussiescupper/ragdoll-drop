"""Ragdoll Drop app icons: a blocky noob head, mid-fall, on the game's ink-blue
tile. Run from the repo root: python3 icons/make-icons.py"""
from PIL import Image, ImageDraw
import os

HERE = os.path.dirname(os.path.abspath(__file__))
INK = (21, 26, 38, 255)          # --ink
INK_DEEP = (8, 11, 18, 255)      # --ink-deep
SKIN = (245, 205, 48, 255)       # the classic noob yellow (--coin-ish)
SKIN_DARK = (198, 160, 26, 255)  # the shaded side of the head
TORSO = (17, 96, 196, 255)       # --sky blue torso
FACE = (26, 22, 8, 255)


def make(size, maskable=False, opaque=False):
    # draw at 4x and downsample, so the blocky edges stay clean
    S = size * 4
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # background tile
    d.rectangle([0, 0, S - 1, S - 1], fill=INK)
    # a soft floor so the head reads as falling towards something
    d.rectangle([0, int(S * 0.80), S - 1, S - 1], fill=INK_DEEP)

    # maskable icons must keep their subject inside the safe circle
    pad = S * 0.28 if maskable else S * 0.17

    # --- the head: a cube drawn as a front face plus one shaded side ---
    hx0, hy0 = pad, pad
    hx1, hy1 = S - pad, S - pad * 1.28
    depth = (hx1 - hx0) * 0.17

    # shaded right side and top, drawn first so the front face sits over them
    d.polygon([(hx1, hy0), (hx1 + depth, hy0 - depth),
               (hx1 + depth, hy1 - depth), (hx1, hy1)], fill=SKIN_DARK)
    d.polygon([(hx0, hy0), (hx0 + depth, hy0 - depth),
               (hx1 + depth, hy0 - depth), (hx1, hy0)], fill=SKIN_DARK)
    d.rectangle([hx0, hy0, hx1, hy1], fill=SKIN)

    # --- the face: two eyes and the noob's flat smile ---
    w, h = hx1 - hx0, hy1 - hy0
    ew, eh = w * 0.135, h * 0.215
    ey = hy0 + h * 0.30
    d.rectangle([hx0 + w * 0.22, ey, hx0 + w * 0.22 + ew, ey + eh], fill=FACE)
    d.rectangle([hx1 - w * 0.22 - ew, ey, hx1 - w * 0.22, ey + eh], fill=FACE)

    # smile: a flat bar with a short tick turning up at each end
    my = hy0 + h * 0.66
    bar = h * 0.075
    d.rectangle([hx0 + w * 0.30, my, hx1 - w * 0.30, my + bar], fill=FACE)
    d.rectangle([hx0 + w * 0.235, my - bar * 1.5, hx0 + w * 0.30, my + bar], fill=FACE)
    d.rectangle([hx1 - w * 0.30, my - bar * 1.5, hx1 - w * 0.235, my + bar], fill=FACE)

    # --- a sliver of torso below, so it is a noob and not just a box ---
    tw = w * 0.46
    d.rectangle([(S - tw) / 2, hy1, (S + tw) / 2, hy1 + h * 0.17], fill=TORSO)

    if not (maskable or opaque):
        # rounded corners, cut with a mask
        r = int(S * 0.22)
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=r, fill=255)
        img.putalpha(mask)

    return img.resize((size, size), Image.LANCZOS)


def save(img, name):
    p = os.path.join(HERE, name)
    img.save(p)
    print(name, os.path.getsize(p), "bytes")


# iOS masks the home-screen icon itself and paints any transparency black,
# so the apple-touch-icon is opaque with square corners.
save(make(180, opaque=True), "icon-180.png")
save(make(192), "icon-192.png")
save(make(512), "icon-512.png")
save(make(512, maskable=True), "icon-maskable-512.png")
