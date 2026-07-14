#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Magna mebel PDF katalogidan HAR MAHSULOTNING real fotosini ajratadi.
Har sahifa 2x2 to'rt mahsulot: (foto chapda) + (nomi/o'lcham/artikul o'ngda).
 1) sahifani yuqori DPI da render qiladi
 2) OCR bilan artikul kodlarini (MG...) va ularning joylashuvini topadi
 3) har kodning kvadranti bo'yicha foto sohasini kesadi
 4) rembg bilan fonni tozalab, toza oq fonga qo'yadi
 5) /products/catalog/<artikul>.png ga saqlaydi
Faqat products.json da MAVJUD kodlar qabul qilinadi (soxta/dublikat oldini olish).
"""
import os, re, sys, json, io
import fitz
from PIL import Image
from rembg import remove, new_session
from rapidocr_onnxruntime import RapidOCR

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "Katalog", "Rasmli malumotlar", "Magna mebel catalog.pdf")
OUTDIR = os.path.join(ROOT, "public", "products", "catalog")
os.makedirs(OUTDIR, exist_ok=True)
DPI = 220
CODE_RE = re.compile(r"\bMG[A-Z]?\d{2,4}(?:-[A-Z0-9]+)?\b", re.I)

ocr = RapidOCR()
session = new_session("isnet-general-use")

VALID = set()
def load_valid():
    doc = json.load(open(os.path.join(ROOT, "data", "products.json"), encoding="utf-8"))
    for p in doc["products"]:
        VALID.add(p["article"].strip().upper())

def clean_product(crop):
    """OQ-FON-TRIM (rembgsiz): PDF katalog fotolari allaqachon oq fonda, shuning
    uchun mahsulotni oq fondan ajratib qirqamiz — TESHIK/YIRTIQ bo'lmaydi.
    Mebel ichidagi oq joylar (javon oralig'i, shisha) saqlanadi."""
    import numpy as np
    from scipy import ndimage
    rgb = np.asarray(crop.convert("RGB"), dtype=np.int16)
    nonwhite = (rgb.min(axis=2) < 238)
    # eng katta bog'langan qism = mahsulot; alohida matn/ikonka bloklari tashlanadi.
    # Kichik teshiklarni yopib komponentni yaxlit qilamiz (bbox uchun).
    filled = ndimage.binary_closing(nonwhite, iterations=3)
    lbl, n = ndimage.label(filled)
    if n == 0:
        return None
    sizes = ndimage.sum(filled, lbl, range(1, n + 1))
    keep = int(np.argmax(sizes)) + 1
    ys, xs = np.where(lbl == keep)
    if len(ys) < 50:
        return None
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    # asl rasmni kesamiz — mebel ICHIDAGI oq joylar (javon/shisha) saqlanadi
    prod = crop.crop((int(x0), int(y0), int(x1) + 1, int(y1) + 1))
    w, h = prod.size
    if w < 40 or h < 40:
        return None
    side = int(max(w, h) * 1.12)
    canvas = Image.new("RGB", (side, side), (255, 255, 255))
    canvas.paste(prod, ((side - w) // 2, (side - h) // 2))
    return canvas

def ocr_code(region):
    """Kichik sohada OCR: MG-kod + kodning kvadrant ichidagi markazi (cx,cy fraksiya)."""
    import numpy as np
    W, H = region.size
    arr = np.array(region.convert("RGB"))
    try:
        res, _ = ocr(arr)
    except Exception:
        return None
    if not res:
        return None
    for box, text, conf in res:
        m = CODE_RE.search(text.replace(" ", "").replace("О", "0"))
        if m and m.group(0).upper() in VALID:
            xs = [pt[0] for pt in box]; ys = [pt[1] for pt in box]
            return (m.group(0).upper(), sum(xs) / 4 / W, sum(ys) / 4 / H)
    return None

def process_page(page, pageno, found):
    pix = page.get_pixmap(dpi=DPI)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    W, H = img.size
    # 2x2 kvadrant: har birida foto(chap ~55%) + matn(o'ng). Kodni butun
    # kvadrantdan OCR qilamiz (kichik rasm -> onnxruntime ishonchli), fotoni
    # kvadrantning chap qismidan kesamiz.
    quads = [
        ("TL", 0.00, 0.50, 0.03, 0.50),
        ("TR", 0.50, 1.00, 0.03, 0.50),
        ("BL", 0.00, 0.50, 0.50, 0.97),
        ("BR", 0.50, 1.00, 0.50, 0.97),
    ]
    for name, qx0, qx1, qy0, qy1 in quads:
        qbox = (int(qx0 * W), int(qy0 * H), int(qx1 * W), int(qy1 * H))
        quad = img.crop(qbox)
        r = ocr_code(quad)
        if not r:
            continue
        code, cx, cy = r
        if code in found:
            continue
        qw, qh = quad.size
        # Layout-aware: kod pastda bo'lsa (matn pastda) -> foto to'liq eni, tepa qismi;
        # kod o'ngda bo'lsa (matn o'ngda) -> foto chap qismida, to'liq balandligi.
        if cy > 0.70:                       # matn pastda
            photo = quad.crop((int(0.04 * qw), int(0.02 * qh), int(0.96 * qw), int(cy * qh) - int(0.03 * qh)))
        else:                               # matn o'ngda
            rx = min(max(cx - 0.06, 0.45), 0.62)
            photo = quad.crop((int(0.03 * qw), int(0.02 * qh), int(rx * qw), int(0.97 * qh)))
        out = clean_product(photo)
        if out is None:
            continue
        out.save(os.path.join(OUTDIR, f"{code}.png"))
        found[code] = pageno + 1
        print(f"  p{pageno+1} {name} {code} OK", flush=True)

def main():
    load_valid()
    doc = fitz.open(PDF)
    pages = range(doc.page_count)
    if len(sys.argv) > 1:  # test: sahifa oralig'i "15-25"
        a, b = sys.argv[1].split("-")
        pages = range(int(a) - 1, int(b))
    found = {}
    for pi in pages:
        process_page(doc[pi], pi, found)
    print(f"TAYYOR: {len(found)} ta real foto ajratildi -> {OUTDIR}", flush=True)
    json.dump(found, open(os.path.join(ROOT, "data", "catalog_photos.json"), "w"), indent=2)

if __name__ == "__main__":
    main()
