import { NextResponse } from "next/server";
import { createUser, sessionCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const res = await createUser({ name, email, password, role: "customer", provider: "email" });
    if (res.error) {
      const status = res.error === "exists" ? 409 : 400;
      return NextResponse.json({ error: res.error }, { status });
    }
    const r = NextResponse.json({ ok: true, user: res.user });
    r.headers.set("Set-Cookie", sessionCookie(res.user));
    return r;
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
