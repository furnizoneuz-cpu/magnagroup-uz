import { NextResponse } from "next/server";
import { hasRole, listUsers, setUserRole, ROLES } from "@/lib/auth";

// Admin-only: list users and change roles (e.g. promote a customer to seller).
export async function GET(req) {
  if (!hasRole(req, "admin")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ users: await listUsers() });
}

export async function PUT(req) {
  if (!hasRole(req, "admin")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { email, role } = await req.json();
  if (!email || !ROLES.includes(role)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const user = await setUserRole(email, role);
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, user });
}
