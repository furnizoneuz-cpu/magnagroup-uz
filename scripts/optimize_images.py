#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Barcha mahsulot rasmlarini web uchun optimallashtiradi:
 max 1600px, JPG (sifat 88). PNG -> JPG (oq fon, shaffoflik yo'q).
 products.json yo'llarini yangilaydi, eski PNG'ni o'chiradi, thumb qayta yasaydi."""
import os, json
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS = os.path.join(ROOT, "data", "products.json")
DIRS = ["real", "catalog", "tg"]
MAX = 1600
THUMB = 480

def optimize(path):
    """Rasmni max MAX px JPG qiladi. Yangi yo'lni (public'dan nisbiy) qaytaradi."""
    im = Image.open(path).convert("RGB")
    if max(im.size) > MAX:
        im.thumbnail((MAX, MAX), Image.LANCZOS)
    base, ext = os.path.splitext(path)
    jpg = base + ".jpg"
    im.save(jpg, "JPEG", quality=88, optimize=True)
    if ext.lower() != ".jpg" and os.path.exists(path) and path != jpg:
        os.remove(path)
    return jpg

def main():
    remap = {}   # eski /products/... -> yangi
    for d in DIRS:
        imgdir = os.path.join(ROOT, "public", "products", d)
        if not os.path.isdir(imgdir):
            continue
        td = os.path.join(imgdir, "thumbs")
        os.makedirs(td, exist_ok=True)
        for f in sorted(os.listdir(imgdir)):
            p = os.path.join(imgdir, f)
            if not os.path.isfile(p) or not f.lower().endswith((".png", ".jpg", ".jpeg")):
                continue
            jpg = optimize(p)
            newrel = "/products/" + d + "/" + os.path.basename(jpg)
            oldrel = "/products/" + d + "/" + f
            remap[oldrel] = newrel
            # thumb
            base = os.path.splitext(os.path.basename(jpg))[0]
            im = Image.open(jpg).convert("RGB"); im.thumbnail((THUMB, THUMB), Image.LANCZOS)
            im.save(os.path.join(td, base + ".webp"), "WEBP", quality=82, method=6)

    doc = json.load(open(PRODUCTS, encoding="utf-8"))
    n = 0
    for prod in doc["products"]:
        img = prod.get("image")
        if img in remap:
            prod["image"] = remap[img]
            base = os.path.splitext(os.path.basename(remap[img]))[0]
            d = remap[img].split("/")[2]
            prod["thumb"] = f"/products/{d}/thumbs/{base}.webp"
            n += 1
    tmp = PRODUCTS + ".tmp"
    json.dump(doc, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    os.replace(tmp, PRODUCTS)
    print(f"Optimallashtirildi. products.json yangilandi: {n} ta.")

if __name__ == "__main__":
    main()
