#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""public/products/real dagi HAR BIR rasmni professional darajada tozalaydi:
 rembg bilan fonni olib tashlaydi -> mahsulotni qirqib markazlashtiradi ->
 toza oq fonga qo'yadi. Qora fon / qo'pol chekka / rangli shovqin yo'qoladi.
 Mahsulotning o'zi o'zgarmaydi. Natija: bir xil, toza, sport-katalog uslubi."""
import os, io
from PIL import Image
from rembg import remove, new_session

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMGDIR = os.path.join(ROOT, "public", "products", "real")
PAD = 0.06  # atrofdagi bo'sh joy (mahsulot balandligiga nisbatan)

session = new_session("isnet-general-use")  # yuqori sifatli umumiy model

def process(path):
    im = Image.open(path).convert("RGBA")
    cut = remove(im, session=session, post_process_mask=True)  # RGBA, fon shaffof

    # content bounding box (alfa kanaliga qarab)
    alpha = cut.split()[-1]
    bbox = alpha.getbbox()
    if bbox:
        cut = cut.crop(bbox)

    w, h = cut.size
    side = int(max(w, h) * (1 + PAD * 2))
    canvas = Image.new("RGBA", (side, side), (255, 255, 255, 255))
    canvas.paste(cut, ((side - w) // 2, (side - h) // 2), cut)
    out = canvas.convert("RGB")

    ext = os.path.splitext(path)[1].lower()
    if ext == ".png":
        out.save(path)
    else:
        out.save(path, quality=92, optimize=True)
    return f"{w}x{h} -> {side}x{side}"

def main():
    files = sorted(f for f in os.listdir(IMGDIR)
                   if os.path.isfile(os.path.join(IMGDIR, f)) and f.lower().endswith((".png", ".jpg", ".jpeg")))
    print(f"Tozalanadi: {len(files)} rasm", flush=True)
    ok = 0
    for i, f in enumerate(files, 1):
        p = os.path.join(IMGDIR, f)
        try:
            msg = process(p)
            print(f"[{i}/{len(files)}] {f}: {msg}", flush=True)
            ok += 1
        except Exception as e:
            print(f"[{i}/{len(files)}] {f}: XATO {str(e)[:120]}", flush=True)
    print(f"TAYYOR: {ok}/{len(files)}", flush=True)

if __name__ == "__main__":
    main()
