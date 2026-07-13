#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Bepul (Pollinations/Flux) rasm generatsiyasi — yangi 54 ta modulli devor/shkaf
mahsuloti uchun (_pending_real_name=true bo'lganlar). Yuqori sifat, kattaroq o'lcham."""
import os, json, time, urllib.request, urllib.parse
from io import BytesIO
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS = os.path.join(ROOT, "data", "products.json")
OUTDIR = os.path.join(ROOT, "public", "products")

STYLE = ("centered on a clean seamless pure white studio background, soft even diffused "
         "studio lighting, subtle soft shadow beneath the product, premium B2B e-commerce "
         "catalog product photography, ultra sharp focus, 8k render quality, hyperrealistic, "
         "highly detailed material texture, minimalist, no text, no watermark, no people")

def build_prompt(p):
    art = p["article"]
    note = p["description"]["en"]
    return (f"a modern modular wall-mounted office cabinet shelf unit, panel code {art}, "
            f"melamine wood finish, part of a modular storage wall system, {note}, {STYLE}")

def fetch(prompt, seed):
    enc = urllib.parse.quote(prompt, safe="")
    url = (f"https://image.pollinations.ai/prompt/{enc}"
           f"?width=1280&height=1280&nologo=true&model=flux&seed={seed}&enhance=true")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=180).read()

def save_jpg(raw, path, size=1280):
    im = Image.open(BytesIO(raw)).convert("RGB")
    if max(im.size) > size:
        im.thumbnail((size, size), Image.LANCZOS)
    im.save(path, quality=90, optimize=True)
    return os.path.getsize(path) // 1024

def seed_of(art):
    return abs(hash(art)) % 100000

def save_doc(doc):
    tmp = PRODUCTS + ".tmp"
    json.dump(doc, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    os.replace(tmp, PRODUCTS)

def main():
    os.makedirs(OUTDIR, exist_ok=True)
    doc = json.load(open(PRODUCTS, encoding="utf-8"))
    todo = [p for p in doc["products"] if p.get("_pending_real_name") and not p.get("image")]
    print(f"Generatsiya qilinadi: {len(todo)} ta", flush=True)
    ok = 0
    for i, p in enumerate(todo, 1):
        art = p["article"]
        for attempt in range(3):
            try:
                raw = fetch(build_prompt(p), seed_of(art))
                kb = save_jpg(raw, os.path.join(OUTDIR, f"{art}.jpg"))
                p["image"] = f"/products/{art}.jpg"
                print(f"[{i}/{len(todo)}] {art} {kb}KB", flush=True)
                ok += 1
                break
            except Exception as e:
                print(f"[{i}] {art} urinish {attempt+1} xato: {str(e)[:100]}", flush=True)
                time.sleep(25)
        if i % 5 == 0:
            save_doc(doc)
        time.sleep(6)
    save_doc(doc)
    print(f"TAYYOR: {ok}/{len(todo)}", flush=True)

if __name__ == "__main__":
    main()
