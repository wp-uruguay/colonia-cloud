import { NextRequest, NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Exchanges the OAuth code for an access token and fetches profile data
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    const reason = searchParams.get("error_reason") ?? error ?? "unknown";
    return NextResponse.redirect(
      `${SITE_URL}/herramientas/instagram-analyzer?error=${encodeURIComponent(reason)}`
    );
  }

  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    return NextResponse.redirect(
      `${SITE_URL}/herramientas/instagram-analyzer?error=config`
    );
  }

  // 1. Exchange code for short-lived token
  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${SITE_URL}/herramientas/instagram-analyzer?error=token_exchange`
    );
  }

  const { access_token, user_id } = await tokenRes.json();

  // 2. Exchange short-lived for long-lived token (60 days)
  const longTokenRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${access_token}`
  );

  const finalToken = longTokenRes.ok
    ? (await longTokenRes.json()).access_token
    : access_token;

  // 3. Fetch profile fields
  const profileRes = await fetch(
    `https://graph.instagram.com/${user_id}?fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,account_type,website&access_token=${finalToken}`
  );

  if (!profileRes.ok) {
    return NextResponse.redirect(
      `${SITE_URL}/herramientas/instagram-analyzer?error=profile_fetch`
    );
  }

  const profile = await profileRes.json();

  // 4. Fetch recent media for engagement calculation
  const mediaRes = await fetch(
    `https://graph.instagram.com/${user_id}/media?fields=id,like_count,comments_count,timestamp,media_type&limit=24&access_token=${finalToken}`
  );

  let avgLikes = 0;
  let avgComments = 0;

  if (mediaRes.ok) {
    const { data: media } = await mediaRes.json();
    if (media?.length) {
      const totals = media.reduce(
        (acc: { likes: number; comments: number }, post: { like_count?: number; comments_count?: number }) => ({
          likes: acc.likes + (post.like_count ?? 0),
          comments: acc.comments + (post.comments_count ?? 0),
        }),
        { likes: 0, comments: 0 }
      );
      avgLikes = Math.round(totals.likes / media.length);
      avgComments = Math.round(totals.comments / media.length);
    }
  }

  const followers = profile.followers_count ?? 0;
  const engagementRate =
    followers > 0
      ? parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2))
      : 0;

  const engagementBenchmark =
    followers < 10_000 ? 3.5 : followers < 50_000 ? 2.4 : followers < 100_000 ? 1.8 : 1.2;

  const result = {
    username: profile.username,
    profile: {
      followers,
      following: profile.follows_count ?? 0,
      posts: profile.media_count ?? 0,
      isVerified: false, // Graph API doesn't expose this
      accountType: profile.account_type?.toLowerCase() ?? "personal",
      bio: profile.biography ?? "",
      fullName: profile.name ?? profile.username,
      profilePic: profile.profile_picture_url ?? null,
    },
    engagement: {
      rate: engagementRate,
      avgLikes,
      avgComments,
      benchmark: engagementBenchmark,
      status: engagementRate >= engagementBenchmark ? "above" : "below",
    },
    shadowban: {
      status: "unknown",
      score: null,
      hashtagReach: "unknown",
      reelsReach: "unknown",
      exploreReach: "unknown",
      note: "La deteccion de shadowban no esta disponible via API oficial.",
    },
    posting: {
      frequency: Math.round((profile.media_count ?? 0) / 52),
      bestDays: null,
      bestHours: null,
    },
    ratios: {
      followerFollowing:
        (profile.follows_count ?? 0) > 0
          ? parseFloat((followers / (profile.follows_count ?? 1)).toFixed(1))
          : followers,
      engagementPerPost: avgLikes + avgComments,
    },
    demo: false,
    authenticated: true,
  };

  // Redirect back to analyzer with encoded result in query param
  const encoded = encodeURIComponent(JSON.stringify(result));
  return NextResponse.redirect(
    `${SITE_URL}/herramientas/instagram-analyzer?data=${encoded}`
  );
}
