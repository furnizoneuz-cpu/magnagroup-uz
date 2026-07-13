import { NextResponse } from "next/server";
import { addOrder, readOrders } from "@/lib/data";

export async function POST(req) {
  try {
    const body = await req.json();
    const { customer, items } = body || {};
    if (!customer?.name || !customer?.phone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const clean = items.map((i) => ({
      article: i.article,
      name: i.name,
      qty: Number(i.qty) || 1,
      price: i.price ?? null,
    }));
    const total = clean.reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);
    const order = await addOrder({
      customer: {
        name: String(customer.name).slice(0, 120),
        phone: String(customer.phone).slice(0, 40),
        address: String(customer.address || "").slice(0, 300),
        comment: String(customer.comment || "").slice(0, 500),
        payment: String(customer.payment || "cash").slice(0, 40),
        lang: customer.lang || "uz",
      },
      items: clean,
      total,
    });
    return NextResponse.json({ ok: true, number: order.number });
  } catch (e) {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = req.headers.get("x-admin-key");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ orders: (await readOrders()).reverse() });
}
