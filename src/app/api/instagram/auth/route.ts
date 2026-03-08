import { NextResponse } from "next/server";

// Initiates Instagram OAuth flow
// Docs: https://developers.facebook.com/docs/instagram-basic-display-api/guides/getting-access-tokens-and-permissions
export function GET() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "Instagram OAuth no configurado. Falta INSTAGRAM_APP_ID o INSTAGRAM_REDIRECT_URI." },
      { status: 503 }
    );
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: "instagram_basic,instagram_manage_insights",
    response_type: "code",
  });

  const authUrl = `https://api.instagram.com/oauth/authorize?${params}`;
  return NextResponse.redirect(authUrl);
}
