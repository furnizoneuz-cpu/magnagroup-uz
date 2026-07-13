import { NextResponse } from "next/server";
import { authenticate, sessionCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const user = await authenticate(email, password);
    if (!user) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    const r = NextResponse.json({ ok: true, user });
    r.headers.set("Set-Cookie", sessionCookie(user));
    return r;
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
