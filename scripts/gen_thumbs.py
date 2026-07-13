#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Katalog kartochkalari uchun yengil WebP thumbnail'lar:
public/products/{real,ai}/*.jpg|png -> .../thumbs/<nom>.webp (480px).
products.json dagi mos mahsulotlarga `thumb` maydonini yozadi."""
import os, json
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = ["real", "ai"]
PRODUCTS = os.path.join(ROOT, "data", "products.json")
SIZE = 480

def main():
    made = {}
    for d in DIRS:
        imgdir = os.path.join(ROOT, "public", "products", d)
        if not os.path.isdir(imgdir):
            continue
        thumbdir = os.path.join(imgdir, "thumbs")
        os.makedirs(thumbdir, exist_ok=True)
        for f in sorted(os.listdir(imgdir)):
            p = os.path.join(imgdir, f)
            if not os.path.isfile(p):
                continue
            base = os.path.splitext(f)[0]
            out = os.path.join(thumbdir, base + ".webp")
            im = Image.open(p).convert("RGB")
            im.thumbnail((SIZE, SIZE), Image.LANCZOS)
            im.save(out, "WEBP", quality=82, method=6)
            made[f"/products/{d}/{f}"] = f"/products/{d}/thumbs/{base}.webp"
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
