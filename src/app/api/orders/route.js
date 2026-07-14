import { NextResponse } from "next/server";
import { addOrder, readOrders, updateOrderStatus, ORDER_STATUSES } from "@/lib/data";
import { hasRole } from "@/lib/auth";
import { notifyNewOrder, notifyStatus } from "@/lib/notify";

function staff(req) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_PASSWORD || hasRole(req, "seller");
}

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
    notifyNewOrder(order).catch(() => {}); // menejerga Telegram (env bo'lsa)
    return NextResponse.json({ ok: true, number: order.number });
  } catch (e) {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function GET(req) {
  if (!staff(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: (await readOrders()).reverse(), statuses: ORDER_STATUSES });
}

// Buyurtma holatini o'zgartirish (admin/sotuv bo'limi boshlig'i)
export async function PUT(req) {
  if (!staff(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { number, status } = await req.json();
  const updated = await updateOrderStatus(number, status);
  if (!updated) return NextResponse.json({ error: "invalid" }, { status: 400 });
  notifyStatus(updated).catch(() => {}); // mijozga SMS + menejerga TG (env bo'lsa)
  return NextResponse.json({ ok: true, order: updated });
}
