import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "leads.json");

function read() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf-8")); } catch { return []; }
}

export async function POST(req) {
  try {
    const { name, phone, message } = await req.json();
    if (!name || !phone) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const leads = read();
    leads.push({
      id: leads.length + 1,
      name: String(name).slice(0, 120),
      phone: String(phone).slice(0, 40),
      message: String(message || "").slice(0, 500),
      createdAt: new Date().toISOString(),
    });
    const tmp = FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(leads, null, 2), "utf-8");
    fs.renameSync(tmp, FILE);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function GET(req) {
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ leads: read().reverse() });
}
