import { NextResponse } from "next/server";
import { hasRole } from "@/lib/auth";

// AI suhbat loglari (admin/sotuv bo'limi) — oxirgi 7 kun, eng yangisi birinchi.
export async function GET(req) {
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_PASSWORD && !hasRole(req, "seller")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "ailogs", consistency: "strong" });
    const out = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      const list = (await store.get(day, { type: "json" })) || [];
      out.push(...list);
    }
    out.sort((a, b) => (a.t < b.t ? 1 : -1));
    return NextResponse.json({ logs: out.slice(0, 300) });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}
