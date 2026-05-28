#!/usr/bin/env python3
"""Generate a custom 1200x630 OG image for the 643/11 article.

High-contrast, social-feed-optimized. The number contrast (643 vs 11)
is the visual hook. Saved to public/og-643-articles.png.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "public" / "og-643-articles.png"

W, H = 1200, 630

BG = (15, 23, 42)        # slate-900
WHITE = (248, 250, 252)
RED = (248, 113, 113)    # red-400
GREEN = (74, 222, 128)   # not used much
MUTED = (148, 163, 184)  # slate-400
ACCENT = (96, 165, 250)  # blue-400

ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
HELV = "/System/Library/Fonts/Helvetica.ttc"


def f(path, size, index=0):
    try:
        return ImageFont.truetype(path, size=size, index=index)
    except OSError:
        return ImageFont.load_default()


def measure(d, t, font):
    b = d.textbbox((0, 0), t, font=font)
    return b[2] - b[0], b[3] - b[1]


def main():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Subtle top accent bar
    d.rectangle([0, 0, W, 8], fill=RED)

    f_label = f(ARIAL_BOLD, 28)
    f_huge = f(ARIAL_BOLD, 150)
    f_mid = f(ARIAL_BOLD, 56)
    f_sub = f(HELV, 34)
    f_url = f(ARIAL_BOLD, 32)

    # Top label
    label = "A 4-MONTH AI SEO EXPERIMENT"
    d.text((70, 70), label, font=f_label, fill=MUTED)

    # Main number-contrast line
    # "643 articles  →  11 clicks"
    y = 150
    # "643" big white
    d.text((70, y), "643", font=f_huge, fill=WHITE)
    w643, _ = measure(d, "643", f_huge)
    # "articles" small below-right of 643
    d.text((70 + w643 + 24, y + 70), "articles", font=f_mid, fill=MUTED)

    # arrow
    arrow_y = y + 60
    d.text((70, y + 175), "Google gave me", font=f_sub, fill=MUTED)

    # "11" big RED
    eleven_x = 70 + 380
    d.text((eleven_x, y + 150), "11", font=f_huge, fill=RED)
    w11, _ = measure(d, "11", f_huge)
    d.text((eleven_x + w11 + 24, y + 220), "clicks", font=f_mid, fill=RED)

    # Bottom strip: extra punch + URL
    f_stats = f(HELV, 28)
    d.line([(70, 535), (W - 70, 535)], fill=(51, 65, 85), width=2)
    stats = "0 subs  ·  $0 revenue  ·  rejected by AdSense"
    d.text((70, 565), stats, font=f_stats, fill=MUTED)

    url = "tools.toolrouteai.com"
    uw, _ = measure(d, url, f_url)
    sw, _ = measure(d, stats, f_stats)
    # Ensure no overlap; if it would collide, push url to far right anyway
    d.text((W - 70 - uw, 562), url, font=f_url, fill=ACCENT)

    img.save(OUT)
    print(f"Saved {OUT} ({W}x{H})")


if __name__ == "__main__":
    main()
