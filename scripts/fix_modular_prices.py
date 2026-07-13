#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""цена.pdf dagi raqamlar DOLLARDA ekan (ming so'm emas) — narxlarni tuzatadi.
UZS ga taxminiy kursda o'giradi (admin keyin aniq kursga moslashi mumkin),
asl USD qiymatini priceUSD maydonida saqlaydi."""
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS = os.path.join(ROOT, "data", "products.json")
RATE = 12700  # taxminiy so'm/$ kursi — admin panelda aniqlashtirilishi mumkin

ROWS = [
    ("GA91", 180), ("GA91", 180), ("GA91", 167), ("GA92", 136), ("GD92", 99),
    ("GE92", 110), ("GA92-2", 157), ("GA92-2", 165), ("GE92-2", 121), ("GB93", 69),
    ("GD93", 52), ("GE93", 59), ("GB93", 70), ("GD93", 55), ("GE93", 61),
    ("GB93-2", 79), ("GD93-2", 60.5), ("GE93-2", 67), ("GA96", 122), ("GB96", 111),
    ("GD96", 85), ("GA96-1", 140), ("GA96-1", 140), ("GB96-1", 130), ("GB96-1", 130),
    ("GD96-1", 93.5), ("GD96-1", 93.5), ("GA98", 116), ("GB98", 107), ("GD98", 88),
    ("GA109", 121), ("GA109-DP", 106), ("GA109-2", 106), ("GA115", 118),
    ("GA115-DP", 108), ("GB115-DP", 96), ("GA115-2-DP", 115), ("GB115-2-DP", 108),
    ("GD107", 51), ("GD107-2", 65), ("GD107-F", 71.5), ("GA198", 580),
    ("A3030-1", 224), ("D3030-1", 129), ("GA18", 217), ("GA18", 217), ("GA19", 217),
    ("GA32", 202), ("GD32", 168), ("GA39", 173), ("GB39", 161), ("GD39", 93.5),
    ("GA69", 338), ("GD69", 206), ("GA83", 304), ("GA86", 205), ("GB86", 186),
    ("GD86", 166), ("A3009", 201),
]
usd_by_key = {}
for art, usd in ROWS:
    slug = art.replace("/", "-")
    key = f"{slug}#{usd}"
    usd_by_key[key] = usd

def main():
    doc = json.load(open(PRODUCTS, encoding="utf-8"))
    fixed = 0
    for p in doc["products"]:
        srckey = p.get("_srckey")
        if not srckey or srckey not in usd_by_key:
            continue
        usd = usd_by_key[srckey]
        p["priceUSD"] = usd
        p["price"] = round(usd * RATE)
        p["priceNote"] = f"Manba: цена.pdf (${usd}), taxminiy kurs 1$ = {RATE} so'm — admin panelda tasdiqlash/tuzatish mumkin"
        fixed += 1

    tmp = PRODUCTS + ".tmp"
    json.dump(doc, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    os.replace(tmp, PRODUCTS)
    print(f"Tuzatildi: {fixed} ta mahsulot narxi (USD -> UZS, kurs {RATE})")

if __name__ == "__main__":
    main()
