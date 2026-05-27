#!/usr/bin/env python3
"""Process brand PNGs: transparency, light variant, favicons."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "brand"
PUBLIC = ROOT / "public"

BLACK_THRESHOLD = 42


def is_black(r: int, g: int, b: int, a: int = 255) -> bool:
    return a > 0 and r <= BLACK_THRESHOLD and g <= BLACK_THRESHOLD and b <= BLACK_THRESHOLD


def saturation(r: int, g: int, b: int) -> float:
    mx, mn = max(r, g, b), min(r, g, b)
    if mx == 0:
        return 0.0
    return (mx - mn) / mx


def remove_black_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_black(r, g, b, a):
                px[x, y] = (0, 0, 0, 0)
            elif r < 80 and g < 80 and b < 80:
                # Soft fringe from compression / anti-alias on black
                strength = max(r, g, b) / 80.0
                px[x, y] = (r, g, b, int(a * strength))
    return img


def make_light_text_variant(img: Image.Image) -> Image.Image:
    """Recolor wordmark strokes for light backgrounds; keep gradient icon."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    text_start_x = int(w * 0.3)

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_black(r, g, b, a):
                continue
            if saturation(r, g, b) > 0.24:
                continue
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if x < text_start_x:
                continue
            if lum > 95:
                px[x, y] = (26, 24, 40, 255)
            elif lum > 45:
                px[x, y] = (109, 102, 143, 255)

    return remove_black_background(img)


def trim_transparent(img: Image.Image, padding: int = 8) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    cropped = img.crop((x0, y0, x1, y1))
    out = Image.new("RGBA", (cropped.width + padding * 2, cropped.height + padding * 2), (0, 0, 0, 0))
    out.paste(cropped, (padding, padding))
    return out


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)


def resize_square(img: Image.Image, size: int) -> Image.Image:
    return img.resize((size, size), Image.Resampling.LANCZOS)


def write_ico(icon: Image.Image, path: Path) -> None:
    sizes = [16, 32, 48]
    images = [resize_square(icon, s) for s in sizes]

    def png_bytes(im: Image.Image) -> bytes:
        from io import BytesIO

        buf = BytesIO()
        im.save(buf, format="PNG")
        return buf.getvalue()

    header = struct.pack("<HHH", 0, 1, len(images))
    entries = []
    offset = 6 + 16 * len(images)
    chunks = []
    for im, size in zip(images, sizes):
        data = png_bytes(im)
        entries.append(struct.pack("<BBBBHHII", size, size, 0, 0, 1, 32, len(data), offset))
        chunks.append(data)
        offset += len(data)

    path.write_bytes(header + b"".join(entries) + b"".join(chunks))


def main() -> None:
    logo_src = BRAND / "logo.png"
    text_src = BRAND / "logoTexte.png"

    logo = trim_transparent(remove_black_background(Image.open(logo_src)))
    logo_text = trim_transparent(remove_black_background(Image.open(text_src)))
    logo_text_light = trim_transparent(make_light_text_variant(Image.open(text_src)))

    save_png(logo, PUBLIC / "logo-transparent.png")
    save_png(logo_text, PUBLIC / "logoTexte-transparent.png")
    save_png(logo_text_light, PUBLIC / "logoTexte-light.png")

    favicon_base = trim_transparent(remove_black_background(Image.open(logo_src)), padding=4)

    save_png(resize_square(favicon_base, 16), PUBLIC / "favicon-16x16.png")
    save_png(resize_square(favicon_base, 32), PUBLIC / "favicon-32x32.png")
    save_png(resize_square(favicon_base, 192), PUBLIC / "android-chrome-192x192.png")
    save_png(resize_square(favicon_base, 512), PUBLIC / "android-chrome-512x512.png")
    save_png(resize_square(favicon_base, 180), PUBLIC / "apple-touch-icon.png")
    save_png(resize_square(favicon_base, 32), PUBLIC / "favicon.png")

    write_ico(favicon_base, PUBLIC / "favicon.ico")

    # OG image: light background + wordmark
    og_w, og_h = 1200, 630
    og = Image.new("RGBA", (og_w, og_h), (246, 243, 237, 255))
    mark = logo_text_light.copy()
    max_w = int(og_w * 0.55)
    ratio = max_w / mark.width
    mark = mark.resize((max_w, int(mark.height * ratio)), Image.Resampling.LANCZOS)
    og.paste(mark, ((og_w - mark.width) // 2, (og_h - mark.height) // 2), mark)
    save_png(og, PUBLIC / "og-image.png")

    print("Brand assets written to public/")


if __name__ == "__main__":
    main()
