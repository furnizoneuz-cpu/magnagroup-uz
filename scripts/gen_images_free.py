#!/usr/bin/env python
"""
Magna Group — BEPUL mahsulot rasmlari (Pollinations.ai / Flux). Kalit KERAK EMAS.

Ishlatish (D:\\magnagroup.uz ichida):
  python scripts/gen_images_free.py                # rasmi yo'q hamma mahsulot
  python scripts/gen_images_free.py --overwrite    # borini ham qayta chizadi
  python scripts/gen_images_free.py --exploded     # + qismlarga ajralgan rasm
  python scripts/gen_images_free.py --category seating --limit 10
"""
import os, sys, json, time, argparse, urllib.request, urllib.parse
from io import BytesIO
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS = os.path.join(ROOT, "data", "products.json")
OUTDIR = os.path.join(ROOT, "public", "products")

STYLE = ("centered on a clean seamless pure white studio background, soft even diffused studio "
         "lighting, subtle soft shadow and faint reflection beneath the product, premium B2B "
         "e-commerce catalog product photography, crisp, photorealistic, ultra detailed, high "
         "resolution, minimalist, no text, no watermark, no people, no props")

DESC = {
    "office": "a modern executive office desk set in dark walnut and matte black, L-shaped desk with cabinet",
    "staff": "a modern staff workstation desk in light oak and graphite with partition",
    "conference": "a long modern conference meeting table in dark wood with black base",
    "storage": "a tall office bookcase cabinet in dark walnut wood with glass doors",
    "tables": "a minimalist office desk in warm wood with metal legs",
    "seating": "a high-back executive leather office chair in black with wooden armrests",
    "medical": "a clean clinical medical cabinet in white and stainless steel",
    "student": "a modern school student desk and chair in light wood and metal",
    "children": "a modern kindergarten furniture piece in warm light wood with soft rounded edges",
}

def build_prompt(p, exploded=False):
    subj = DESC.get(p["category"], "a modern furniture piece")
    en = p["name"].get("en", "")
    if exploded:
        return (f"exploded technical view of {subj} ({en}), its panels, drawers, metal frame, "
                f"legs and hardware separated and floating apart with even gaps, clean assembly "
                f"diagram, {STYLE}")
    return f"professional product photo of {subj} ({en}), {STYLE}"

def fetch(prompt, seed):
    enc = urllib.parse.quote(prompt, safe="")
    url = (f"https://image.pollinations.ai/prompt/{enc}"
           f"?width=1024&height=1024&nologo=true&model=flux&seed={seed}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=180).read()

def save_jpg(raw, path, size=1024):
    im = Image.open(BytesIO(raw)).convert("RGB")
    if max(im.size) > size:
        im.thumbnail((size, size), Image.LANCZOS)
    im.save(path, quality=85, optimize=True)
    return os.path.getsize(path) // 1024

def seed_of(art):
    return abs(hash(art)) % 100000

def save_doc(doc):
    tmp = PRODUCTS + ".tmp"
    json.dump(doc, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    os.replace(tmp, PRODUCTS)  # atomik: yarim-yozilgan holat bo'lmaydi

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--category")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--exploded", action="store_true")
    ap.add_argument("--overwrite", action="store_true")
    ap.add_argument("--sleep", type=float, default=2.0)
    args = ap.parse_args()

    os.makedirs(OUTDIR, exist_ok=True)
    doc = json.load(open(PRODUCTS, encoding="utf-8"))
    prods = doc["products"]
    if args.category:
        prods = [p for p in prods if p["category"] == args.category]
    todo = [p for p in prods if args.overwrite or not p.get("image")]
    if args.limit:
        todo = todo[: args.limit]
    print(f"BEPUL generatsiya (Pollinations): {len(todo)} mahsulot (exploded={args.exploded})", flush=True)

    ok = 0
    for i, p in enumerate(todo, 1):
        art = p["article"].replace("/", "-")
        for attempt in range(3):
            try:
                raw = fetch(build_prompt(p), seed_of(art))
                kb = save_jpg(raw, os.path.join(OUTDIR, f"{art}.jpg"))
                p["image"] = f"/products/{art}.jpg"
                msg = f"[{i}/{len(todo)}] {art} {kb}KB"
                if args.exploded:
                    time.sleep(args.sleep)
                    raw2 = fetch(build_prompt(p, True), seed_of(art) + 1)
                    save_jpg(raw2, os.path.join(OUTDIR, f"{art}_exploded.jpg"))
                    p["imageExploded"] = f"/products/{art}_exploded.jpg"
                    msg += " +exploded"
                print(msg, flush=True)
                ok += 1
                break
            except Exception as e:
                print(f"[{i}] {art} urinish {attempt+1} xato: {str(e)[:80]}", flush=True)
                time.sleep(6)
        if i % 5 == 0:
            save_doc(doc)
        time.sleep(args.sleep)

    json.dump(doc, open(PRODUCTS, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"TAYYOR: {ok}/{len(todo)} rasm. products.json yangilandi.", flush=True)

if __name__ == "__main__":
    main()
