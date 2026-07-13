import { NextResponse } from "next/server";

// Step 1 of Facebook Login: redirect the user to Facebook's OAuth dialog.
// Requires FACEBOOK_APP_ID (+ SECRET on callback). Until those env vars are
// set, this returns a clear "not configured" response so the button degrades
// gracefully instead of erroring.
export async function GET(req) {
  const appId = process.env.FACEBOOK_APP_ID;
  const url = new URL(req.url);
  const origin = process.env.PUBLIC_ORIGIN || url.origin;
  const lang = url.searchParams.get("lang") || "uz";

  if (!appId) {
    return NextResponse.redirect(`${origin}/${lang}/login?fb=unconfigured`);
  }

  const redirectUri = `${origin}/api/auth/facebook/callback`;
  const state = Buffer.from(JSON.stringify({ lang, t: Date.now() })).toString("base64url");
  const auth = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  auth.searchParams.set("client_id", appId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("state", state);
  auth.searchParams.set("scope", "email,public_profile");
  return NextResponse.redirect(auth.toString());
}
