#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Real narx ro'yxati (Katalog/цена.pdf) dan 59 ta modulli devor/shkaf tizimi
mahsulotini data/products.json ga qo'shadi. Nomlar hozircha umumiy (kod
asosida) — foydalanuvchi real nomlarni bergach yangilanadi.
"""
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS = os.path.join(ROOT, "data", "products.json")

# (raqam, artikul, narx_ming_som, izoh)
ROWS = [
    (1, "GA91", 180, None), (2, "GA91", 180, None), (3, "GA91", 167, None),
    (4, "GA92", 136, None), (5, "GD92", 99, None), (6, "GE92", 110, None),
    (7, "GA92-2", 157, None), (8, "GA92-2", 165, None), (9, "GE92-2", 121, None),
    (10, "GB93", 69, None), (11, "GD93", 52, None), (12, "GE93", 59, None),
    (13, "GB93", 70, None), (14, "GD93", 55, None), (15, "GE93", 61, None),
    (16, "GB93-2", 79, None), (17, "GD93-2", 60.5, None), (18, "GE93-2", 67, None),
    (19, "GA96", 122, None), (20, "GB96", 111, None), (21, "GD96", 85, None),
    (22, "GA96-1", 140, None), (23, "GA96-1", 140, None), (24, "GB96-1", 130, None),
    (25, "GB96-1", 130, None), (26, "GD96-1", 93.5, None), (27, "GD96-1", 93.5, None),
    (28, "GA98", 116, None), (29, "GB98", 107, None), (30, "GD98", 88, None),
    (31, "GA109", 121, None), (32, "GA109-DP", 106, None), (33, "GA109-2", 106, None),
    (34, "GA115", 118, None), (35, "GA115-DP", 108, None), (36, "GB115-DP", 96, None),
    (37, "GA115-2-DP", 115, None), (38, "GB115-2-DP", 108, None),
    (39, "GD107", 51, "to'rt oyoqli"), (40, "GD107-2", 65, "to'rt oyoqli"),
    (41, "GD107-F", 71.5, "yig'iladigan"),
    (42, "GA198", 580, None), (43, "A3030-1", 224, None), (44, "D3030-1", 129, None),
    (45, "GA18", 217, None), (46, "GA18", 217, None), (47, "GA19", 217, None),
    (48, "GA32", 202, None), (49, "GD32", 168, None), (50, "GA39", 173, None),
    (51, "GB39", 161, None), (52, "GD39", 93.5, None), (53, "GA69", 338, None),
    (54, "GD69", 206, None), (55, "GA83", 304, None), (56, "GA86", 205, None),
    (57, "GB86", 186, None), (58, "GD86", 166, None), (59, "A3009", 201, None),
]

def make_product(no, art, price_k, note):
    slug = art.replace("/", "-")
    label_uz = f"Modulli devor blogi {art}"
    label_ru = f"Модульный блок {art}"
    label_en = f"Modular wall unit {art}"
    desc_uz = "Modulli devor/shkaf tizimi elementi." + (f" ({note})" if note else "")
    desc_ru = "Элемент модульной стеновой/шкафной системы." + (f" ({note})" if note else "")
    desc_en = "Element of the modular wall/cabinet system." + (f" ({note})" if note else "")
    return {
        "article": slug,
        "category": "storage",
        "name": {"uz": label_uz, "ru": label_ru, "en": label_en},
        "description": {"uz": desc_uz, "ru": desc_ru, "en": desc_en},
        "price": round(price_k * 1000),
        "priceNote": "Narx ro'yxatidan (ming so'm deb hisoblangan) — tasdiqlash kerak",
        "visible": True,
        "image": None,
        "_pending_real_name": True,
    }

def main():
    doc = json.load(open(PRODUCTS, encoding="utf-8"))
    existing_articles = {p["article"] for p in doc["products"]}
    added = 0
    for no, art, price_k, note in ROWS:
        slug = art.replace("/", "-")
        # avoid exact duplicate article+price combos already added (dup rows in source PDF)
        key = f"{slug}#{price_k}"
        dup_key_field = "_srckey"
        already = any(p.get(dup_key_field) == key for p in doc["products"])
        if already:
            continue
        prod = make_product(no, art, price_k, note)
        prod["_srckey"] = key
        doc["products"].append(prod)
        existing_articles.add(slug)
        added += 1

    tmp = PRODUCTS + ".tmp"
    json.dump(doc, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    os.replace(tmp, PRODUCTS)
    print(f"Qo'shildi: {added} ta mahsulot. Jami: {len(doc['products'])}")

if __name__ == "__main__":
    main()
