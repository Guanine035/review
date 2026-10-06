"""Generate the PWA icons once. Run: python tools/make_icons.py"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "icons"
OUT.mkdir(exist_ok=True)

BG = (15, 118, 110)
INK = (255, 255, 255)


def font(size):
    for name in ("arialbd.ttf", "segoeuib.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def make(size, name, pad_ratio=0.0, text="M"):
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=BG)
    inner = int(size * (1 - pad_ratio * 2))
    f = font(int(inner * 0.5))
    box = draw.textbbox((0, 0), text, font=f)
    w, h = box[2] - box[0], box[3] - box[1]
    draw.text(((size - w) / 2 - box[0], (size - h) / 2 - box[1]), text, font=f, fill=INK)
    img.save(OUT / name)
    print("wrote", OUT / name)


make(192, "icon-192.png")
make(512, "icon-512.png", pad_ratio=0.12)
make(180, "apple-touch-icon.png", pad_ratio=0.12)
