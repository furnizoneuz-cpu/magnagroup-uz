import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { hasRole } from "@/lib/auth";

const onNetlify = () => !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 4 * 1024 * 1024; // 4MB

export async function POST(req) {
  // admin paroli YOKI sotuv bo'limi boshlig'i (seller) sessiyasi
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_PASSWORD && !hasRole(req, "seller")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  const article = String(form.get("article") || "img").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  if (file.type && !ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "bad_type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 400 });
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const buf = Buffer.from(await file.arrayBuffer());

  if (onNetlify()) {
    // Deployed filesystem is read-only: keep the image bytes in Netlify Blobs
    // and serve them through /api/img/[article].
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "images", consistency: "strong" });
    const type = file.type || (ext === "png" ? "image/png" : "image/jpeg");
    await store.set(article, buf, { metadata: { contentType: type } });
    return NextResponse.json({ ok: true, path: `/api/img/${article}?v=${Date.now()}` });
  }

  const dir = path.join(process.cwd(), "public", "products");
  fs.mkdirSync(dir, { recursive: true });
  const fname = `${article}.${ext}`;
  fs.writeFileSync(path.join(dir, fname), buf);
  return NextResponse.json({ ok: true, path: `/products/${fname}?v=${Date.now()}` });
}
