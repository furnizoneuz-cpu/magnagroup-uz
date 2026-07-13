#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Katalog kartochkalari uchun yengil WebP thumbnail'lar:
public/products/real/*.jpg|png -> public/products/real/thumbs/<nom>.webp (480px).
products.json dagi mos mahsulotlarga `thumb` maydonini yozadi."""
import os, json
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMGDIR = os.path.join(ROOT, "public", "products", "real")
THUMBDIR = os.path.join(IMGDIR, "thumbs")
PRODUCTS = os.path.join(ROOT, "data", "products.json")
SIZE = 480

def main():
    os.makedirs(THUMBDIR, exist_ok=True)
    made = {}
    for f in sorted(os.listdir(IMGDIR)):
        p = os.path.join(IMGDIR, f)
        if not os.path.isfile(p):
            continue
        base = os.path.splitext(f)[0]
        out = os.path.join(THUMBDIR, base + ".webp")
        im = Image.open(p).convert("RGB")
        im.thumbnail((SIZE, SIZE), Image.LANCZOS)
        im.save(out, "WEBP", quality=82, method=6)
        made[f"/products/real/{f}"] = f"/products/real/thumbs/{base}.webp"
    print(f"{len(made)} thumbnail yaratildi")

    doc = json.load(open(PRODUCTS, encoding="utf-8"))
    n = 0
    for prod in doc["products"]:
        img = prod.get("image")
        if img in made:
            prod["thumb"] = made[img]
            n += 1
    tmp = PRODUCTS + ".tmp"
    json.dump(doc, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    os.replace(tmp, PRODUCTS)
    print(f"{n} mahsulotga thumb biriktirildi")

if __name__ == "__main__":
    main()
