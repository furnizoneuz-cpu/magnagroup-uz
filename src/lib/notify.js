/*
  Xabarnoma qatlami (Uzum-uslub avto-xabar). Ikkala kanal ham env-gated:
  - Telegram: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (menejer guruhi/kanali)
  - SMS: ESKIZ_TOKEN (eskiz.uz) — mijoz telefoniga
  Kalit bo'lmasa jimgina o'tkazib yuboradi (sayt ishlashiga ta'sir qilmaydi).
*/

export async function tgSend(text) {
  const tok = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!tok || !chat) return { skipped: "no_telegram_env" };
  try {
    const r = await fetch(`https://api.telegram.org/bot${tok}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    return { ok: r.ok };
  } catch {
    return { error: true };
  }
}

export async function smsSend(phone, text) {
  const token = process.env.ESKIZ_TOKEN;
  const from = process.env.ESKIZ_FROM || "4546";
  const to = String(phone || "").replace(/\D/g, "");
  if (!token || to.length < 9) return { skipped: "no_sms" };
  try {
    const fd = new URLSearchParams({ mobile_phone: to, message: text, from });
    const r = await fetch("https://notify.eskiz.uz/api/message/sms/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    return { ok: r.ok };
  } catch {
    return { error: true };
  }
}

const STATUS_MSG = {
  new: "qabul qilindi",
  processing: "tayyorlanmoqda",
  delivering: "yetkazilmoqda",
  done: "yetkazildi",
  cancelled: "bekor qilindi",
};

// Yangi buyurtma → menejer Telegram guruhiga
export async function notifyNewOrder(order) {
  const items = (order.items || []).map((i) => `• ${i.article} × ${i.qty}`).join("\n");
  const total = order.total ? order.total.toLocaleString("ru-RU") + " so'm" : "narx so'rovi";
  await tgSend(
    `🛒 <b>Yangi buyurtma ${order.number}</b>\n` +
    `👤 ${order.customer?.name}\n📞 ${order.customer?.phone}\n` +
    (order.customer?.address ? `📍 ${order.customer.address}\n` : "") +
    `💳 ${order.customer?.payment}\n💰 ${total}\n${items}`
  );
}

// Holat o'zgardi → menejerga (TG) + mijozga (SMS)
export async function notifyStatus(order) {
  const st = STATUS_MSG[order.status] || order.status;
  await tgSend(`🔄 <b>${order.number}</b> holati: <b>${st}</b>`);
  await smsSend(order.customer?.phone, `Magna Group: buyurtmangiz ${order.number} — ${st}. Savol: +998 99 142 50 50`);
}
