#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""public/products/real dagi barcha real fotolarni Real-ESRGAN (lokal, bepul)
bilan ultra-yuqori aniqlikka kattalashtiradi. Kichik rasmlar bir necha bosqich
o'tadi (4x har pass), maqsad: eng kichik tomoni >= TARGET px. Fayl nomi/yo'li
o'zgarmaydi (products.json ga tegilmaydi)."""
import os, subprocess, sys, tempfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# argv[1] bo'lsa o'sha papka (masalan 'catalog'), aks holda 'real'
_sub = sys.argv[1] if len(sys.argv) > 1 else "real"
IMGDIR = os.path.join(ROOT, "public", "products", _sub)
EXE = os.path.join(ROOT, "tools", "realesrgan", "realesrgan-ncnn-vulkan.exe")
TARGET = 1400      # eng kichik tomon shu qiymatdan katta bo'lsin
MAXSIDE = 2800     # yakuniy eng katta tomon cheklovi (fayl hajmi uchun)
MAX_PASSES = 3

def upscale_once(src, dst):
    r = subprocess.run([EXE, "-i", src, "-o", dst, "-n", "realesrgan-x4plus"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError((r.stderr or r.stdout)[:200])

def process(path):
    im = Image.open(path)
    w, h = im.size
    if min(w, h) >= TARGET:
        return f"skip ({w}x{h})"
    tmpdir = tempfile.mkdtemp()
    cur = os.path.join(tmpdir, "in.png")
    im.convert("RGB").save(cur)
    passes = 0
    while passes < MAX_PASSES:
        out = os.path.join(tmpdir, f"up{passes}.png")
        upscale_once(cur, out)
        cur = out
        passes += 1
        with Image.open(cur) as t:
            if min(t.size) >= TARGET:
                break
    im2 = Image.open(cur).convert("RGB")
    if max(im2.size) > MAXSIDE:
        im2.thumbnail((MAXSIDE, MAXSIDE), Image.LANCZOS)
    if path.lower().endswith(".png"):
        im2.save(path, optimize=True)
    else:
        im2.save(path, quality=88, optimize=True)
    return f"{w}x{h} -> {im2.size[0]}x{im2.size[1]} ({passes} pass)"

def main():
    files = sorted(os.listdir(IMGDIR))
    print(f"Jami {len(files)} rasm", flush=True)
    for i, f in enumerate(files, 1):
        p = os.path.join(IMGDIR, f)
        try:
            msg = process(p)
        except Exception as e:
            msg = f"XATO: {str(e)[:120]}"
        print(f"[{i}/{len(files)}] {f}: {msg}", flush=True)
    print("TAYYOR", flush=True)

if __name__ == "__main__":
    main()
