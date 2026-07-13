import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export async function GET(req) {
  const s = currentUser(req);
  return NextResponse.json({ user: s ? { email: s.email, name: s.name, role: s.role } : null });
}
