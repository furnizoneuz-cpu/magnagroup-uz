#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Ikkala bepul yo'lni sinash (kalit hech qachon chiqarilmaydi):
 1) Gemini API image generation (gemini-2.5-flash-image) — bepul kvota bormi?
 2) Pollinations Flux Kontext img2img — jonli foto URL asosida qayta-render.
Natijalar: scripts/_test_out/ ga yoziladi."""
import os, json, base64, urllib.request, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "scripts", "_test_out")
os.makedirs(OUT, exist_ok=True)

# .env.local dan kalitni o'qish (chop etilmaydi)
key = None
for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8"):
    if line.startswith("GEMINI_API_KEY="):
        key = line.strip().split("=", 1)[1]
if not key:
    print("GEMINI: kalit topilmadi")

PROMPT = ("Professional studio product photograph of this exact black ergonomic office chair, "
          "same design, same materials, same proportions. Pure white seamless background, "
          "soft studio lighting, subtle floor shadow, 8k quality, photorealistic, ultra sharp")
REF_URL = "https://magnagroup-uz.netlify.app/products/real/g_GA91_2.jpg"

# ---- 1) Gemini image gen ----
if key:
    try:
        # referens rasmni yuklab, base64 qilamiz (image+text -> image)
        ref = urllib.request.urlopen(REF_URL, timeout=60).read()
        body = {
            "contents": [{
                "parts": [
                    {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(ref).decode()}},
                    {"text": PROMPT},
                ]
            }],
        }
        req = urllib.request.Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={key}",
            data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
        resp = json.loads(urllib.request.urlopen(req, timeout=180).read())
        saved = False
        for part in resp.get("candidates", [{}])[0].get("content", {}).get("parts", []):
            if "inlineData" in part:
                raw = base64.b64decode(part["inlineData"]["data"])
                open(os.path.join(OUT, "gemini_GA91.png"), "wb").write(raw)
                print(f"GEMINI: OK ({len(raw)//1024} KB) -> _test_out/gemini_GA91.png")
                saved = True
        if not saved:
            print("GEMINI: javobda rasm yo'q:", json.dumps(resp)[:300])
    except Exception as e:
        msg = str(e)
        try:
            msg += " | " + e.read().decode()[:300]
        except Exception:
            pass
        print("GEMINI xato:", msg[:400])

# ---- 2) Pollinations Kontext img2img ----
try:
    enc = urllib.parse.quote(PROMPT, safe="")
    img = urllib.parse.quote(REF_URL, safe="")
    url = (f"https://image.pollinations.ai/prompt/{enc}"
           f"?model=kontext&image={img}&width=1536&height=1536&nologo=true")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    raw = urllib.request.urlopen(req, timeout=300).read()
    open(os.path.join(OUT, "kontext_GA91.jpg"), "wb").write(raw)
    print(f"KONTEXT: OK ({len(raw)//1024} KB) -> _test_out/kontext_GA91.jpg")
except Exception as e:
    print("KONTEXT xato:", str(e)[:300])
