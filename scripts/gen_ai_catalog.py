#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Ko'rinadigan (real) mahsulotlar uchun yuqori sifatli AI studio-render
(Pollinations 'sana', bepul). Real atributlardan (nomi, rangi, o'lchami) prompt
tuziladi. Eski real foto _realPhoto maydonida saqlanadi — qaytarish mumkin.
Natija: public/products/ai/<article>.jpg + products.json yangilanadi."""
import os, json, time, re, urllib.request, urllib.parse
from io import BytesIO
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS = os.path.join(ROOT, "data", "products.json")
OUTDIR = os.path.join(ROOT, "public", "products", "ai")
os.makedirs(OUTDIR, exist_ok=True)

STYLE = ("single product only, centered, pure white seamless studio background, soft even "
         "professional studio lighting, subtle floor shadow, photorealistic commercial product "
         "photography, ultra sharp focus, 8k quality, no text, no watermark, no people, no props")

def clean(s):
    return re.sub(r"\s+", " ", str(s or "")).strip()

def build_prompt(p):
    name_en = clean(p["name"].get("en") or p["name"].get("uz"))
    color = ""
    d = p.get("description", {})
    m = re.search(r"(?:Color|Цвет):\s*(.+)", clean(d.get("en", "")) + " | " + clean(d.get("ru", "")))
    if m:
        color = clean(m.group(1).split("|")[0])
    dims = clean(p.get("dimensions") or "")
    bits = [f"Professional product photo of a {name_en}"]
    if color: bits.append(f"finish and colors: {color}")
    if dims: bits.append(f"approximate dimensions {dims} mm")
    bits.append("modern minimalist B2B office furniture design")
    bits.append(STYLE)
    return ", ".join(bits)

def seed_of(art):
    return abs(hash(art)) % 99991

def fetch(prompt, seed):
    url = (f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt, safe='')}"
           f"?model=sana&width=1536&height=1536&nologo=true&seed={seed}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=300).read()

def save_doc(doc):
    tmp = PRODUCTS + ".tmp"
    json.dump(doc, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    os.replace(tmp, PRODUCTS)

def main():
    doc = json.load(open(PRODUCTS, encoding="utf-8"))
    todo = [p for p in doc["products"]
            if not p.get("hidden") and not str(p.get("image") or "").startswith("/products/ai/")]
    print(f"AI render: {len(todo)} ta mahsulot", flush=True)
    ok = 0
    for i, p in enumerate(todo, 1):
        art = re.sub(r"[^\w\-]", "_", p["article"])
        path = os.path.join(OUTDIR, f"{art}.jpg")
        for attempt in range(4):
            try:
                raw = fetch(build_prompt(p), seed_of(p["article"]))
                im = Image.open(BytesIO(raw)).convert("RGB")
                im.save(path, quality=90, optimize=True)
                if p.get("image") and not p.get("_realPhoto"):
                    p["_realPhoto"] = p["image"]
                p["image"] = f"/products/ai/{art}.jpg"
                print(f"[{i}/{len(todo)}] {p['article']} OK {os.path.getsize(path)//1024}KB", flush=True)
                ok += 1
                break
            except Exception as e:
                print(f"[{i}] {p['article']} urinish {attempt+1}: {str(e)[:100]}", flush=True)
                time.sleep(20)
        if i % 5 == 0:
            save_doc(doc)
        time.sleep(4)
    save_doc(doc)
    print(f"TAYYOR: {ok}/{len(todo)}", flush=True)

if __name__ == "__main__":
    main()
