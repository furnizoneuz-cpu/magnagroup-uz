#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Rahbar to'plamlari (MG2xx) va premium (MGP/MGL/MGK186) sahifalari —
yarim-sahifa maketi: katta xona-foto + yon matn. Har yarimda OCR bilan kod
o'qiladi, foto esa yarimdagi ENG KATTA rangli blok (xona rasmi) bbox'i bilan
asl holicha kesiladi (white-trim YO'Q — xona foto real ko'rinishda qoladi)."""
import os, re, json
import fitz
import numpy as np
from scipy import ndimage
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "Katalog", "Rasmli malumotlar", "Magna mebel catalog.pdf")
OUTDIR = os.path.join(ROOT, "public", "products", "catalog")
DPI = 200
# faqat shu (buzuq chiqqan) kodlarni qayta ishlaymiz
TARGET = {"MG210","MG215","MG218","MG225","MG227","MG229","MG230","MG233","MG235",
          "MG242","MG245","MG251","MGP015","MGP032","MGP065","MGP077","MGP201",
          "MGP212","MGP214","MGP215","MGP218","MGP220","MGL100","MGK186"}
CODE = re.compile(r"\bMG[A-Z]?\d{2,4}\b")

ocr = RapidOCR()

def half_photo(img):
    """Yarim-sahifadagi eng katta rangli blok (xona-foto) bbox — asl kesim."""
    a = np.asarray(img.convert("RGB"), dtype=np.int16)
    nonwhite = (a.min(axis=2) < 235)
    filled = ndimage.binary_closing(nonwhite, iterations=4)
    lbl, n = ndimage.label(filled)
    if n == 0:
        return None
    sizes = ndimage.sum(filled, lbl, range(1, n + 1))
    keep = int(np.argmax(sizes)) + 1
    ys, xs = np.where(lbl == keep)
    if len(ys) < 5000:  # juda kichik blok — foto emas
        return None
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    w, h = x1 - x0, y1 - y0
    if w < img.width * 0.25 or h < img.height * 0.25:
        return None  # foto emas (matn bloki)
    return img.crop((int(x0), int(y0), int(x1) + 1, int(y1) + 1))

def read_code(img):
    W, H = img.size
    work = img if W <= 1100 else img.resize((1100, int(H * 1100 / W)))
    res, _ = ocr(np.array(work.convert("RGB")))
    for _, t, _ in (res or []):
        m = CODE.search(t.replace(" ", "").upper().replace("О", "O"))
        if m and m.group(0) in TARGET:
            return m.group(0)
    return None

def main():
    doc = fitz.open(PDF)
    done = {}
    for pi in range(doc.page_count):
        pix = doc[pi].get_pixmap(dpi=DPI)
        page = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        W, H = page.size
        # footer (magna mebel) tashlanadi
        page = page.crop((0, 0, W, int(H * 0.94)))
        H = page.height
        for name, box in (("top", (0, 0, W, H // 2)), ("bottom", (0, H // 2, W, H))):
            half = page.crop(box)
            code = read_code(half)
            if not code or code in done:
                continue
            photo = half_photo(half)
            if photo is None:
                continue
            photo.save(os.path.join(OUTDIR, f"{code}.png"))
            done[code] = pi + 1
            print(f"p{pi+1} {name} {code} OK ({photo.width}x{photo.height})", flush=True)
    print(f"TAYYOR: {len(done)}/{len(TARGET)}: {sorted(done)}", flush=True)

if __name__ == "__main__":
    main()
