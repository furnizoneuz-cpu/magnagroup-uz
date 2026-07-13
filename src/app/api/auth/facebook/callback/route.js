import { NextResponse } from "next/server";
import { upsertOAuthUser, sessionCookie } from "@/lib/auth";

// Step 2: Facebook redirects back with ?code — exchange it for a token,
// fetch the profile, then create/login the user and set the session cookie.
export async function GET(req) {
  const url = new URL(req.url);
  const origin = process.env.PUBLIC_ORIGIN || url.origin;
  let lang = "uz";
  try {
    const state = url.searchParams.get("state");
    if (state) lang = JSON.parse(Buffer.from(state, "base64url").toString()).lang || "uz";
  } catch {}

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const code = url.searchParams.get("code");
  if (!appId || !appSecret || !code) {
    return NextResponse.redirect(`${origin}/${lang}/login?fb=error`);
  }

  try {
    const redirectUri = `${origin}/api/auth/facebook/callback`;
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);
    const tok = await fetch(tokenUrl).then((r) => r.json());
    if (!tok.access_token) throw new Error("no_token");

    const me = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${tok.access_token}`
    ).then((r) => r.json());
    const email = me.email || `fb_${me.id}@facebook.local`;
    const user = await upsertOAuthUser({ email, name: me.name, provider: "facebook" });
    if (!user) throw new Error("no_user");

    const r = NextResponse.redirect(`${origin}/${lang}`);
    r.headers.set("Set-Cookie", sessionCookie(user));
    return r;
  } catch {
    return NextResponse.redirect(`${origin}/${lang}/login?fb=error`);
  }
}
