#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Telegram fotolari — TO'LIQ: har bir mahsulot kartochkasini (kod bo'lgan)
ajratadi, kodsizlarni (showroom ichki foto) gallery'ga. Natijalar tg_map2.json.
 - kod = kartochkadagi artikul (GA91, SF-106-8, DL939A, 1802 ...)
 - caption_ru = mahsulot turi (kreslo / divan / reklayner) — yangi mahsulot uchun
 - isolate: rembg -> toza oq fon (fon+matn+logotip ketadi)
Bu bosqich faqat rasm+meta tayyorlaydi; biriktirish assign_tg.py da."""
import os, re, json
from PIL import Image
from rembg import remove, new_session
from rapidocr_onnxruntime import RapidOCR
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "from tg")
OUT = os.path.join(ROOT, "public", "products", "tg")
GALLERY = os.path.join(ROOT, "public", "showroom")
for d in (OUT, GALLERY):
    os.makedirs(d, exist_ok=True)

ocr = RapidOCR()
session = new_session("isnet-general-use")
# kod: kamida bitta harf yoki 3-4 xonali son bilan boshlanadi; ichki -qism(lar) bo'lishi mumkin
CODE = re.compile(r"\b([A-Z]{1,3}-?\d{2,4}(?:-[A-Z0-9]+)*|\d{3,4})\b")

doc = json.load(open(os.path.join(ROOT, "data", "products.json"), encoding="utf-8"))
VALID = {p["article"].strip().upper() for p in doc["products"]}

def canon(c):
    return c.replace(" ", "").upper()

def read(im):
    W, H = im.size
    work = im if W <= 1100 else im.resize((1100, int(H * 1100 / W)))
    res, _ = ocr(np.array(work.convert("RGB")))
    texts = [t for _, t, _ in (res or [])]
    joined = " ".join(texts)
    codes = []
    for t in texts:
        for m in CODE.finditer(canon(t)):
            codes.append(m.group(1))
    # eng ishonchli kod: VALID da bo'lsa o'sha, aks holda birinchi harfli kod
    code = next((c for c in codes if c in VALID), None)
    if not code:
        code = next((c for c in codes if re.match(r"[A-Z]", c)), None)
    if not code:
        code = codes[0] if codes else None
    low = joined.lower()
    if "реклайнер" in low or "reklayner" in low:
        kind = "recliner"
    elif "диван" in low or "divan" in low or "sofa" in low:
        kind = "sofa"
    elif "кресло" in low or "kreslo" in low:
        kind = "chair"
    else:
        kind = None
    return code, kind

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
    records = {}     # code -> {kind, in_valid, file}
    gallery = []
    for i, f in enumerate(files):
        im = Image.open(os.path.join(SRC, f)).convert("RGB")
        code, kind = read(im)
        if not code:
            dst = f"sr_{i:02d}.jpg"
            im.save(os.path.join(GALLERY, dst), quality=90)
            gallery.append(f"/showroom/{dst}")
            print(f"[{i}] GALLERY", flush=True)
            continue
        if code in records:
            print(f"[{i}] {code} takror", flush=True)
            continue
        out = isolate(im)
        if out is None:
            print(f"[{i}] {code} isolate XATO", flush=True)
            continue
        safe = re.sub(r"[^A-Z0-9\-]", "", code)
        out.save(os.path.join(OUT, f"{safe}.png"))
        records[code] = {"kind": kind, "in_valid": code in VALID, "file": f"/products/tg/{safe}.png", "safe": safe}
        print(f"[{i}] {code} {'DB' if code in VALID else 'YANGI'} {kind} OK", flush=True)
    json.dump({"records": records, "gallery": gallery},
              open(os.path.join(ROOT, "data", "tg_map2.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    nv = sum(1 for r in records.values() if r["in_valid"])
    print(f"TAYYOR: {len(records)} kartochka ({nv} DB'da, {len(records)-nv} yangi), {len(gallery)} gallery", flush=True)

if __name__ == "__main__":
    main()
