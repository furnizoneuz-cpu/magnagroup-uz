import { NextResponse } from "next/server";
import { readCatalog, updateProduct } from "@/lib/data";
import { hasRole } from "@/lib/auth";

// Ommaviy import (admin/sotuv bo'limi): [{article, price?, stock?, hidden?}] massiv.
// Faqat mavjud artikullar yangilanadi; noma'lumlar hisobotда qaytadi.
// Ruxsat: admin paroli, seller sessiyasi, YOKI mashina-mashina sinxron tokeni
// (1C/ombor tizimi uchun — STOCK_SYNC_TOKEN env).
function allowed(req) {
  if (req.headers.get("x-admin-key") === process.env.ADMIN_PASSWORD) return true;
  const sync = process.env.STOCK_SYNC_TOKEN;
  if (sync && req.headers.get("x-sync-token") === sync) return true;
  return hasRole(req, "seller");
}

export async function POST(req) {
  if (!allowed(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let rows;
  try { ({ rows } = await req.json()); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }
  if (!Array.isArray(rows) || rows.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (rows.length > 5000) return NextResponse.json({ error: "too_many" }, { status: 400 });

  const known = new Set(readCatalog().products.map((p) => p.article.trim().toUpperCase()));
  const byUpper = new Map(readCatalog().products.map((p) => [p.article.trim().toUpperCase(), p.article]));

  let updated = 0;
  const notFound = [];
  for (const r of rows.slice(0, 5000)) {
    const code = String(r.article || "").trim().toUpperCase();
    if (!code) continue;
    if (!known.has(code)) { notFound.push(r.article); continue; }
    const patch = {};
    if (r.price !== undefined && r.price !== "") patch.price = r.price === null ? null : Number(r.price);
    if (r.stock !== undefined && r.stock !== "") patch.stock = Math.max(0, Number(r.stock) || 0);
    if (r.hidden !== undefined && r.hidden !== "") patch.hidden = r.hidden === true || /^(1|true|ha|yashirin|hidden)$/i.test(String(r.hidden));
    if (Object.keys(patch).length === 0) continue;
    await updateProduct(byUpper.get(code), patch);
    updated += 1;
  }
  return NextResponse.json({ ok: true, updated, notFound: notFound.slice(0, 50), notFoundCount: notFound.length });
}
