import { NextResponse } from "next/server";
import { upsertOAuthUser, sessionCookie } from "@/lib/auth";

// Step 2: Google redirects back with ?code — exchange for tokens, read the
// profile, then create/login the user and set the session cookie.
export async function GET(req) {
  const url = new URL(req.url);
  const origin = process.env.PUBLIC_ORIGIN || url.origin;
  let lang = "uz";
  try {
    const state = url.searchParams.get("state");
    if (state) lang = JSON.parse(Buffer.from(state, "base64url").toString()).lang || "uz";
  } catch {}

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const code = url.searchParams.get("code");
  if (!clientId || !clientSecret || !code) {
    return NextResponse.redirect(`${origin}/${lang}/login?g=error`);
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const tok = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: redirectUri, grant_type: "authorization_code",
      }),
    }).then((r) => r.json());
    if (!tok.access_token) throw new Error("no_token");

    const me = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tok.access_token}` },
    }).then((r) => r.json());
    const email = me.email || `g_${me.id}@google.local`;
    const user = await upsertOAuthUser({ email, name: me.name, provider: "google" });
    if (!user) throw new Error("no_user");

    const r = NextResponse.redirect(`${origin}/${lang}`);
    r.headers.set("Set-Cookie", sessionCookie(user));
    return r;
  } catch {
    return NextResponse.redirect(`${origin}/${lang}/login?g=error`);
  }
}
