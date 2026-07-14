import { NextResponse } from "next/server";
import { readCatalog, updateProduct } from "@/lib/data";
import { hasRole } from "@/lib/auth";

// Admin/seller may edit the catalog — via a logged-in session (role ≥ seller)
// or the legacy admin key header (kept for the password-only admin login).
function authed(req) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_PASSWORD || hasRole(req, "seller");
}

export async function GET(req) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const c = readCatalog();
  const { getProducts } = await import("@/lib/data");
  const products = await getProducts(); // override-merged (admin edits included)
  return NextResponse.json({ products, categories: c.categories });
}

export async function PUT(req) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { article, patch } = body || {};
  if (!article || !patch) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const allowed = {};
  if ("price" in patch) {
    const v = patch.price;
    allowed.price = v === null || v === "" ? null : Number(v);
  }
  if ("image" in patch) allowed.image = patch.image || null;
  if ("hidden" in patch) allowed.hidden = !!patch.hidden;
  if ("stock" in patch) {
    const s = patch.stock;
    allowed.stock = s === null || s === "" ? 0 : Math.max(0, Number(s) || 0);
  }
  // To'liq tahrir (sotuv bo'limi boshlig'i/admin): nom, tavsif, o'lcham, kategoriya
  const langs = ["uz", "ru", "en"];
  if (patch.name && typeof patch.name === "object") {
    allowed.name = Object.fromEntries(langs.map((l) => [l, String(patch.name[l] || "").slice(0, 200)]));
  }
  if (patch.description && typeof patch.description === "object") {
    allowed.description = Object.fromEntries(langs.map((l) => [l, String(patch.description[l] || "").slice(0, 1000)]));
  }
  if ("dimensions" in patch) allowed.dimensions = patch.dimensions ? String(patch.dimensions).slice(0, 80) : null;
  if ("category" in patch) {
    const cats = readCatalog().categories.map((c) => c.id);
    if (cats.includes(patch.category)) allowed.category = patch.category;
  }

  const updated = await updateProduct(article, allowed);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, product: updated });
}
