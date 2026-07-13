#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Telegram kanal fotolari (public/from tg/) — mahsulot kartochkalarini ajratadi:
 1) to'liq OCR bilan artikul kodini o'qiydi (products.json da mavjud bo'lsa)
 2) rembg bilan kresloni fon+matn+logotipdan ajratib, toza oq fonga qo'yadi
 3) /products/tg/<ARTIKUL>.png ga saqlaydi (keyin upscale qilinadi)
Kod topilmagan (showroom ichki foto) rasmlar CHETGA — gallery uchun ko'chiriladi.
Bir kodga bir nechta foto bo'lsa, birinchisi olinadi (log'da qolgani ko'rsatiladi)."""
import os, re, json, shutil
from PIL import Image
from rembg import remove, new_session
from rapidocr_onnxruntime import RapidOCR
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "from tg")
OUT = os.path.join(ROOT, "public", "products", "tg")
GALLERY = os.path.join(ROOT, "public", "showroom")   # kodsiz jonli fotolar
os.makedirs(OUT, exist_ok=True)
os.makedirs(GALLERY, exist_ok=True)

ocr = RapidOCR()
session = new_session("isnet-general-use")
CODE = re.compile(r"\b([A-Z]{1,3}\d{2,4}(?:-[A-Z0-9]+)?)\b")

doc = json.load(open(os.path.join(ROOT, "data", "products.json"), encoding="utf-8"))
VALID = {p["article"].strip().upper() for p in doc["products"]}

def read_code(im):
    W, H = im.size
    work = im if W <= 1100 else im.resize((1100, int(H * 1100 / W)))
    res, _ = ocr(np.array(work.convert("RGB")))
    cands = []
    for _, t, conf in (res or []):
        for m in CODE.finditer(t.replace(" ", "").upper().replace("О", "O")):
            cands.append(m.group(1))
    for c in cands:
        if c in VALID:
            return c
    return None

def isolate(im):
    cut = remove(im.convert("RGBA"), session=session, post_process_mask=True)
    bbox = cut.split()[-1].getbbox()
    if bbox:
        cut = cut.crop(bbox)
    w, h = cut.size
    if w < 60 or h < 60:
        return None
    side = int(max(w, h) * 1.12)
    canvas = Image.new("RGBA", (side, side), (255, 255, 255, 255))
    canvas.paste(cut, ((side - w) // 2, (side - h) // 2), cut)
    return canvas.convert("RGB")

def main():
    files = sorted(f for f in os.listdir(SRC) if f.lower().endswith((".jpg", ".jpeg", ".png")))
    used = {}          # code -> file
    gallery = []
    for i, f in enumerate(files):
        im = Image.open(os.path.join(SRC, f)).convert("RGB")
        code = read_code(im)
        if not code:
            # kodsiz = jonli showroom foto -> gallery
            dst = os.path.join(GALLERY, f"sr_{i:02d}.jpg")
            im.save(dst, quality=90)
            gallery.append(f"/showroom/sr_{i:02d}.jpg")
            print(f"[{i}] {f[:18]} -> GALLERY", flush=True)
            continue
        if code in used:
            print(f"[{i}] {f[:18]} -> {code} (takror, o'tkazildi)", flush=True)
            continue
        out = isolate(im)
        if out is None:
            print(f"[{i}] {f[:18]} -> {code} isolate XATO", flush=True)
            continue
        out.save(os.path.join(OUT, f"{code}.png"))
        used[code] = f
        print(f"[{i}] {f[:18]} -> {code} OK", flush=True)
    json.dump({"assigned": list(used.keys()), "gallery": gallery},
              open(os.path.join(ROOT, "data", "tg_map.json"), "w"), ensure_ascii=False, indent=2)
    print(f"TAYYOR: {len(used)} kreslo-foto, {len(gallery)} gallery-foto", flush=True)

if __name__ == "__main__":
    main()
