import { NextResponse } from "next/server";
import { clearCookie } from "@/lib/auth";

export async function POST() {
  const r = NextResponse.json({ ok: true });
  r.headers.set("Set-Cookie", clearCookie());
  return r;
}
