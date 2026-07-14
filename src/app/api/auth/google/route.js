import { NextResponse } from "next/server";

// Step 1 of Google Login: redirect to Google's OAuth consent.
// Requires GOOGLE_CLIENT_ID (+ SECRET on callback). Until set, degrades gracefully.
export async function GET(req) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const url = new URL(req.url);
  const origin = process.env.PUBLIC_ORIGIN || url.origin;
  const lang = url.searchParams.get("lang") || "uz";

  if (!clientId) {
    return NextResponse.redirect(`${origin}/${lang}/login?g=unconfigured`);
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = Buffer.from(JSON.stringify({ lang, t: Date.now() })).toString("base64url");
  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("access_type", "online");
  auth.searchParams.set("prompt", "select_account");
  return NextResponse.redirect(auth.toString());
}
