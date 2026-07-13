import { NextResponse } from "next/server";
import { addLead, readLeads } from "@/lib/data";
import { hasRole } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, phone, message } = await req.json();
    if (!name || !phone) return NextResponse.json({ error: "invalid" }, { status: 400 });
    await addLead({
      name: String(name).slice(0, 120),
      phone: String(phone).slice(0, 40),
      message: String(message || "").slice(0, 500),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function GET(req) {
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_PASSWORD && !hasRole(req, "seller")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ leads: (await readLeads()).reverse() });
}
