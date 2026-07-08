#!/usr/bin/env python
"""
Magna Group — Gemini ("Nano Banana") bilan mahsulot rasmlarini generatsiya qilish.

Kalit: bepul https://aistudio.google.com/apikey dan oling, keyin:
  - .env.local ichiga:  GEMINI_API_KEY=...    (yoki muhit o'zgaruvchisi sifatida)

Ishlatish (D:\\magnagroup.uz ichida):
  python scripts/gen_images.py                 # rasmi yo'q hamma mahsulot (assembled)
  python scripts/gen_images.py --exploded      # + "qismlarga ajralgan" (exploded) rasm ham
  python scripts/gen_images.py --category seating
  python scripts/gen_images.py --limit 10
  python scripts/gen_images.py --overwrite     # borini ham qayta chizadi
"""
import os, sys, json, base64, time, urllib.request, urllib.error, argparse
from io import BytesIO
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS = os.path.join(ROOT, "data", "products.json")
OUTDIR = os.path.join(ROOT, "public", "products")
MODEL = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

STYLE = ("floating and centered in a pitch-black obsidian void, single dramatic "
         "top-down spotlight with soft rim light tracing every edge, volumetric smoke "
         "and low-lying mist swirling around the base, deep chiaroscuro shadows, matte "
         "black and charcoal palette with subtle warm gold highlights, glossy reflective "
         "dark floor with faint mirror reflection, luxury editorial advertising campaign, "
         "photorealistic, 8k, studio product photography, elegant, mysterious, minimalist. "
         "No text, no watermark, no people, no bright background.")

DESC = {
    "office": "a modern executive office desk set in dark walnut and matte black, L-shaped desk with side cabinet",
    "staff": "a modern open-plan staff workstation desk in light oak and graphite with partition",
    "conference": "a long modern conference meeting table in dark wood with matte black base",
    "storage": "a tall office bookcase cabinet in dark walnut wood with glass doors",
    "tables": "a minimalist office desk in warm wood with metal legs",
    "seating": "a high-back executive leather office chair in black with wooden armrests",
    "medical": "a clean clinical medical cabinet in white and stainless steel",
    "student": "a modern school student desk and chair set in light wood and metal",
    "children": "a playful modern kindergarten furniture piece in warm light wood with soft rounded edges",
}

def load_key():
    k = os.environ.get("GEMINI_API_KEY")
    if k:
        return k.strip()
    envf = os.path.join(ROOT, ".env.local")
    if os.path.exists(envf):
        for line in open(envf, encoding="utf-8"):
            if line.strip().startswith("GEMINI_API_KEY"):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None

def build_prompt(p, exploded=False):
    base = DESC.get(p["category"], "a piece of modern furniture")
    en = p["name"].get("en", "")
    dims = p.get("dimensions") or ""
    subject = f"{base} ({en}{', ' + dims if dims else ''})"
    if exploded:
        return (f"Exploded technical view of {subject}: its main components — panels, "
                f"drawers, metal frame/legs, hardware and accessories — separated and "
                f"floating apart with clear gaps between each part, deconstructed assembly "
                f"style but photorealistic, {STYLE}")
    return f"Ultra-premium cinematic product photograph of {subject}, {STYLE}"

def gen(key, prompt):
    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }).encode()
    req = urllib.request.Request(
        ENDPOINT + f"?key={key}", data=body,
        headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.load(r)
    for cand in data.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"])
    raise RuntimeError("no image in response: " + json.dumps(data)[:300])

def save_jpg(raw, path, size=1024):
    im = Image.open(BytesIO(raw)).convert("RGB")
    if max(im.size) > size:
        im.thumbnail((size, size), Image.LANCZOS)
    im.save(path, quality=85, optimize=True)
    return os.path.getsize(path)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--category")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--exploded", action="store_true")
    ap.add_argument("--overwrite", action="store_true")
    ap.add_argument("--sleep", type=float, default=3.0)
    args = ap.parse_args()

    key = load_key()
    if not key:
        print("XATO: GEMINI_API_KEY topilmadi. .env.local ga qo'shing yoki muhit o'zgaruvchisi qiling.")
        sys.exit(1)

    os.makedirs(OUTDIR, exist_ok=True)
    doc = json.load(open(PRODUCTS, encoding="utf-8"))
    prods = doc["products"]
    if args.category:
        prods = [p for p in prods if p["category"] == args.category]

    todo = [p for p in prods if args.overwrite or not p.get("image")]
    if args.limit:
        todo = todo[: args.limit]
    print(f"Generatsiya: {len(todo)} mahsulot (exploded={args.exploded})")

    ok = 0
    for i, p in enumerate(todo, 1):
        art = p["article"].replace("/", "-")
        try:
            raw = gen(key, build_prompt(p))
            kb = save_jpg(raw, os.path.join(OUTDIR, f"{art}.jpg")) // 1024
            p["image"] = f"/products/{art}.jpg"
            msg = f"[{i}/{len(todo)}] {art}  {kb}KB"
            if args.exploded:
                time.sleep(args.sleep)
                raw2 = gen(key, build_prompt(p, exploded=True))
                save_jpg(raw2, os.path.join(OUTDIR, f"{art}_exploded.jpg"))
                p["imageExploded"] = f"/products/{art}_exploded.jpg"
                msg += "  +exploded"
            print(msg)
            ok += 1
        except urllib.error.HTTPError as e:
            print(f"[{i}] {art} HTTP {e.code}: {e.read()[:200]}")
            if e.code in (429, 503):
                print("  ... rate limit, 30s kutish"); time.sleep(30)
        except Exception as e:
            print(f"[{i}] {art} XATO: {e}")
        # har 5 tadан keyin saqlash (resume uchun)
        if i % 5 == 0:
            json.dump(doc, open(PRODUCTS, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        time.sleep(args.sleep)

    json.dump(doc, open(PRODUCTS, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Tayyor: {ok}/{len(todo)} rasm. products.json yangilandi.")

if __name__ == "__main__":
    main()
