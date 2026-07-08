import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  const article = String(form.get("article") || "img").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "products");
  fs.mkdirSync(dir, { recursive: true });
  const fname = `${article}.${ext}`;
  fs.writeFileSync(path.join(dir, fname), buf);
  return NextResponse.json({ ok: true, path: `/products/${fname}?v=${Date.now()}` });
}
