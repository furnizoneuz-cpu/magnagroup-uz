#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""ASTATKA (real showroom qoldig'i, 13.07.2026) asosida bazani qayta shakllantirish:
 - eski 166 katalog-PDF mahsuloti -> visible:false (yashirin, keyin kerak bo'lsa yoqiladi)
 - avvalgi 54 sintetik 'modulli devor' (aslida kreslolar) -> O'CHIRILADI
 - real mahsulotlar qo'shiladi: partiya1 (52), partiya2 mebel (15), partiya2 kreslo (59->unikal),
   ostatka kreslolar (26), divanlar (partiya2+3), hammasi real foto + qoldiq (stock) bilan.
"""
import os, json, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS = os.path.join(ROOT, "data", "products.json")
ASTATKA = os.path.join(ROOT, "data", "astatka.json")
RATE = 12700  # taxminiy so'm/$ — admin aniqlashtiradi

# ---- partiya1 tavsif tarjimalari (ru -> uz/en) ----
DESC_MAP = {
    "Рабочий стол руководителя": ("Rahbar ish stoli", "Executive desk"),
    "Рабочий стол руководителя слева или справа": ("Rahbar ish stoli (chap/o'ng)", "Executive desk (left/right)"),
    "Рабочий стол руководителя Слева или справа": ("Rahbar ish stoli (chap/o'ng)", "Executive desk (left/right)"),
    "Исполнительный стол": ("Rahbar ish stoli", "Executive desk"),
    "Стол для совещаний": ("Majlislar stoli", "Conference table"),
    "Стол для переговоров": ("Muzokaralar stoli", "Negotiation table"),
    "2-местное рабочее место": ("2 o'rinli ish joyi", "2-seat workstation"),
    "2-местное рабочее место с возможностью расширения": ("2 o'rinli ish joyi (kengaytiriladigan)", "2-seat workstation (expandable)"),
    "4-местное рабочее место без подставки": ("4 o'rinli ish joyi", "4-seat workstation"),
    "Офисный стол": ("Ofis stoli", "Office desk"),
    "Офисный стол длиной 1,8 м": ("Ofis stoli 1.8 m", "Office desk 1.8 m"),
    "Расширение рабочего места на 2 места": ("Ish joyini 2 o'ringa kengaytirish moduli", "2-seat workstation extension"),
    "Кофейный столик": ("Jurnal stoli", "Coffee table"),
    "кофейный столик": ("Jurnal stoli", "Coffee table"),
    "Приставной столик": ("Qo'shimcha stol", "Side table"),
    "Кабельная коробка": ("Kabel qutisi", "Cable box"),
    "Картотечный шкаф": ("Kartoteka shkafi", "Filing cabinet"),
    "Кресло с высокой спинкой": ("Baland suyanchiqli kreslo", "High-back chair"),
    "Рабочее место на два места - Лицом к лицу": ("2 o'rinli ish joyi (yuzma-yuz)", "2-seat workstation (face-to-face)"),
    "Двухместное рабочее место - Лицом к лицу": ("2 o'rinli ish joyi (yuzma-yuz)", "2-seat workstation (face-to-face)"),
    "Двухместное рабочее место с вкладышем": ("2 o'rinli ish joyi (qo'shimcha modulli)", "2-seat workstation (with insert)"),
    "Двухместное рабочее место L- образной формы": ("L-shaklidagi 2 o'rinli ish joyi", "L-shaped 2-seat workstation"),
}

def cat_from_desc(d):
    dl = d.lower()
    if "совещан" in dl or "переговор" in dl: return "conference"
    if "кресло" in dl: return "seating"
    if "шкаф" in dl or "коробка" in dl: return "storage"
    if "кофейн" in dl or "приставн" in dl: return "tables"
    if "руководител" in dl or "исполнительн" in dl: return "office"
    if "рабочее место" in dl or "рабочего места" in dl or "офисный стол" in dl: return "staff"
    return "office"

# ---- partiya2 mebel — rasmlardan qo'lda turkumlangan ----
P2M = {
    "DSN-01D27": ("office", "Rahbar ish stoli (premium)", "Стол руководителя (премиум)", "Executive desk (premium)"),
    "DSN-01H15": ("storage", "Tumba-kredensa", "Тумба-креденца", "Credenza cabinet"),
    "ASY-05D28": ("office", "Rahbar ish stoli 2800 mm", "Стол руководителя 2800 мм", "Executive desk 2800 mm"),
    "ASY-01S34": ("storage", "Devor shkaflar tizimi", "Стеновая система шкафов", "Wall cabinet system"),
    "ASY-01F12": ("tables", "Jurnal stoli", "Кофейный столик", "Coffee table"),
    "ASY-05D20": ("office", "Rahbar ish stoli 2000 mm", "Стол руководителя 2000 мм", "Executive desk 2000 mm"),
    "ASY-01C36": ("conference", "Majlislar stoli", "Стол для совещаний", "Conference table"),
    "DL939A": ("seating", "Mehmon kreslosi", "Кресло для посетителей", "Visitor chair"),
    "DL939B": ("seating", "Mehmon kreslosi", "Кресло для посетителей", "Visitor chair"),
    "DL939C": ("seating", "Mehmon kreslosi", "Кресло для посетителей", "Visitor chair"),
    "JY-008-A": ("seating", "Rahbar kreslosi", "Кресло руководителя", "Executive chair"),
    "JY-008-B": ("seating", "Rahbar kreslosi", "Кресло руководителя", "Executive chair"),
    "DX7106A": ("seating", "Ergonomik ofis kreslosi", "Эргономичное офисное кресло", "Ergonomic office chair"),
    "GB28": ("seating", "Ofis kreslosi", "Офисное кресло", "Office chair"),
}

# ---- G-kodlar narxi (цена.pdf, qator tartibida — sheet bilan bir xil 59 qator) ----
CENA = [180,180,167,136,99,110,157,165,121,69,52,59,70,55,61,79,60.5,67,122,111,85,
        140,140,130,130,93.5,93.5,116,107,88,121,106,106,118,108,96,115,108,51,65,71.5,
        580,224,129,217,217,217,202,168,173,161,93.5,338,206,304,205,186,166,201]

def translit_cyr(s):
    return s.replace("А", "A").replace("В", "B").replace("С", "C").replace("Е", "E")

def main():
    doc = json.load(open(PRODUCTS, encoding="utf-8"))
    ast = json.load(open(ASTATKA, encoding="utf-8"))

    # 1) sintetik 'modulli devor' mahsulotlarini o'chirish
    before = len(doc["products"])
    doc["products"] = [p for p in doc["products"] if not p.get("_pending_real_name")]
    removed = before - len(doc["products"])

    # 2) eski katalog-PDF mahsulotlarini yashirish
    hidden = 0
    for p in doc["products"]:
        if p.get("visible", True):
            p["visible"] = False
            hidden += 1

    new = []

    # 3) partiya1 — to'liq ma'lumotli real mahsulotlar
    for r in ast["partiya1"]:
        d = r["desc_ru"].replace("\n", " ").strip()
        uz, en = DESC_MAP.get(d, (d, d))
        price_usd = r.get("priceUSD")
        new.append({
            "article": r["article"], "category": cat_from_desc(d),
            "name": {"uz": uz, "ru": d, "en": en},
            "description": {
                "uz": (f"Rang: {r['color_ru']}" if r.get("color_ru") else ""),
                "ru": (f"Цвет: {r['color_ru']}" if r.get("color_ru") else ""),
                "en": (f"Color: {r['color_ru']}" if r.get("color_ru") else ""),
            },
            "dimensions": r.get("dimensions") or None,
            "price": round(price_usd * RATE) if price_usd else None,
            "priceUSD": price_usd,
            "stock": int(r.get("stock") or 0),
            "visible": True, "image": r.get("image"),
            "_src": "astatka-p1",
        })

    # 4) partiya2 mebel — artikul bo'yicha birlashtirish (stock yig'indisi)
    merged = {}
    for r in ast["partiya2_mebel"]:
        art = r["article"]
        m = merged.setdefault(art, {"stock": 0, "image": None})
        m["stock"] += int(r.get("stock") or 0)
        if r.get("image") and not m["image"]: m["image"] = r["image"]
    for art, m in merged.items():
        cat, uz, ru, en = P2M.get(art, ("office", art, art, art))
        new.append({
            "article": art, "category": cat,
            "name": {"uz": f"{uz} {art}", "ru": f"{ru} {art}", "en": f"{en} {art}"},
            "description": {"uz": "", "ru": "", "en": ""},
            "price": None, "priceUSD": None,
            "stock": m["stock"], "visible": True, "image": m["image"],
            "_src": "astatka-p2m",
        })

    # 5) partiya2 kreslo (G-kodlar) — artikul bo'yicha birlashtirish, narx цена.pdf dan
    gmerged = {}
    for i, r in enumerate(ast["partiya2_kreslo"]):
        art = r["article"].replace("(FOL\nDING)", "-F").replace("(FOLDING)", "-F").strip()
        art = re.sub(r"\s+", "", art)
        m = gmerged.setdefault(art, {"stock": 0, "image": None, "priceUSD": None})
        m["stock"] += int(r.get("stock") or 0)
        if r.get("image") and not m["image"]: m["image"] = r["image"]
        if i < len(CENA) and m["priceUSD"] is None: m["priceUSD"] = CENA[i]
    for art, m in gmerged.items():
        pu = m["priceUSD"]
        new.append({
            "article": art, "category": "seating",
            "name": {"uz": f"Ofis kreslosi {art}", "ru": f"Офисное кресло {art}", "en": f"Office chair {art}"},
            "description": {"uz": "", "ru": "", "en": ""},
            "price": round(pu * RATE) if pu else None, "priceUSD": pu,
            "stock": m["stock"], "visible": True, "image": m["image"],
            "_src": "astatka-p2k",
        })

    # 6) ostatka kreslolar (rangli variantlar)
    for r in ast["ostatka_kreslo"]:
        nm = r["name_ru"].strip()
        base = translit_cyr(nm.split()[0])
        color_ru = "чёрный" if "кора" in nm else ("коричневый" if "жигар" in nm else "")
        color_uz = "qora" if "кора" in nm else ("jigarrang" if "жигар" in nm else "")
        color_en = "black" if "кора" in nm else ("brown" if "жигар" in nm else "")
        suffix = "-Q" if color_uz == "qora" else ("-J" if color_uz == "jigarrang" else "")
        new.append({
            "article": base + suffix, "category": "seating",
            "name": {
                "uz": f"Kreslo {base}" + (f" ({color_uz})" if color_uz else ""),
                "ru": f"Кресло {base}" + (f" ({color_ru})" if color_ru else ""),
                "en": f"Armchair {base}" + (f" ({color_en})" if color_en else ""),
            },
            "description": {"uz": "", "ru": "", "en": ""},
            "price": None, "priceUSD": None,
            "stock": int(r.get("stock") or 0), "visible": True, "image": r.get("image"),
            "_src": "astatka-ost",
        })

    # 7) divanlar (partiya2 + partiya3, artikul bo'yicha birlashtirish)
    sf = {}
    for r in ast["partiya2_divan"]:
        art = (r.get("article") or "").strip()
        if not art: continue
        m = sf.setdefault(art, {"stock": 0, "image": None, "desc_ru": "", "material_ru": ""})
        m["stock"] += int(r.get("stock") or 0)
        if r.get("image") and not m["image"]: m["image"] = r["image"]
        if r.get("desc_ru") and not m["desc_ru"]: m["desc_ru"] = r["desc_ru"]
        if r.get("material_ru") and not m["material_ru"]: m["material_ru"] = r["material_ru"]
    for r in ast["partiya3_divan"]:
        art = (r.get("article") or "").strip()
        if not art: continue
        m = sf.setdefault(art, {"stock": 0, "image": None, "desc_ru": "", "material_ru": ""})
        m["stock"] += int(r.get("stock") or 0)
        if r.get("image") and not m["image"]: m["image"] = r["image"]
    for art, m in sf.items():
        mat = m["material_ru"].replace("\n", " ")
        new.append({
            "article": art, "category": "seating",
            "name": {"uz": f"Ofis divani {art}", "ru": f"Офисный диван {art}", "en": f"Office sofa {art}"},
            "description": {
                "uz": ("Yog'och, metall, sun'iy teri (PU)" if mat else ""),
                "ru": (mat.capitalize() if mat else ""),
                "en": ("Wood, metal, PU leather" if mat else ""),
            },
            "price": None, "priceUSD": None,
            "stock": m["stock"], "visible": True, "image": m["image"],
            "_src": "astatka-sf",
        })

    # artikul to'qnashuvlarini tekshirish (yangi vs eski yashirin)
    old_arts = {p["article"] for p in doc["products"]}
    for p in new:
        if p["article"] in old_arts:
            p["article"] = p["article"] + "-R"  # real variantga alohida URL
    doc["products"].extend(new)

    doc["_meta"]["astatka"] = "ASTATKA 13.07.2026 — Alfraganus showroom real qoldig'i; eski katalog-PDF mahsulotlari yashirilgan (visible:false)"
    tmp = PRODUCTS + ".tmp"
    json.dump(doc, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    os.replace(tmp, PRODUCTS)
    vis = [p for p in doc["products"] if p.get("visible")]
    total_stock = sum(int(p.get("stock") or 0) for p in vis)
    print(f"O'chirildi (sintetik): {removed}, yashirildi (eski): {hidden}")
    print(f"Yangi real mahsulotlar: {len(new)}, ko'rinadigan jami: {len(vis)}, umumiy qoldiq: {total_stock} dona")
    with_img = sum(1 for p in new if p.get("image"))
    with_price = sum(1 for p in new if p.get("price"))
    print(f"Rasmli: {with_img}/{len(new)}, narxli: {with_price}/{len(new)}")

if __name__ == "__main__":
    main()
