import { NextRequest, NextResponse } from "next/server";

// In-memory cache to avoid hitting Instagram repeatedly for the same profile
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Cached csrf token + cookie string (refreshed every 30 min)
let cookieCache: { cookie: string; csrf: string; ts: number } | null = null;
const COOKIE_TTL = 30 * 60 * 1000;

// Instagram's own web app ID — public, used by instagram.com itself
const IG_APP_ID = "936619743392456";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function getSessionCookies(): Promise<{ cookie: string; csrf: string }> {
  if (cookieCache && Date.now() - cookieCache.ts < COOKIE_TTL) {
    return cookieCache;
  }

  const res = await fetch("https://www.instagram.com/", {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(8000),
  });

  const rawCookies = res.headers.getSetCookie?.() ?? [];
  const cookieString = rawCookies.map((c) => c.split(";")[0]).join("; ");
  const csrfMatch = cookieString.match(/csrftoken=([^;]+)/);
  const csrf = csrfMatch?.[1] ?? "missing";

  cookieCache = { cookie: cookieString, csrf, ts: Date.now() };
  return cookieCache;
}

function igHeaders(cookie: string, csrf: string): Record<string, string> {
  return {
    "User-Agent": UA,
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
    "x-ig-app-id": IG_APP_ID,
    "x-csrftoken": csrf,
    Cookie: cookie,
    Referer: "https://www.instagram.com/",
    Origin: "https://www.instagram.com",
  };
}

function calcEngagement(username: string) {
  const seed = username.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = (min: number, max: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    const r = x - Math.floor(x);
    return Math.floor(r * (max - min + 1)) + min;
  };
  const followers = rng(1200, 85000);
  const following = rng(200, 3000);
  const posts = rng(30, 600);
  const avgLikes = Math.round(followers * (rng(15, 80) / 1000));
  const avgComments = Math.round(avgLikes * (rng(3, 12) / 100));
  const engagementRate = parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2));
  const benchmark = followers < 10000 ? 3.5 : followers < 50000 ? 2.4 : followers < 100000 ? 1.8 : 1.2;
  return {
    username,
    profile: {
      followers,
      following,
      posts,
      isVerified: followers > 50000 && rng(0, 1) === 1,
      accountType: rng(0, 2) === 0 ? "personal" : rng(0, 1) === 0 ? "creator" : "business",
      bio: `Cuenta analizada: @${username}`,
      fullName: username,
      profilePic: null,
    },
    engagement: {
      rate: engagementRate,
      avgLikes,
      avgComments,
      benchmark,
      status: engagementRate >= benchmark ? "above" : "below",
    },
    shadowban: {
      status: "unknown",
      score: null,
      hashtagReach: "unknown",
      reelsReach: "unknown",
      exploreReach: "unknown",
      note: "La detección de shadowban no está disponible a través de datos públicos.",
    },
    posting: {
      frequency: rng(2, 14),
      bestDays: null,
      bestHours: null,
    },
    ratios: {
      followerFollowing: parseFloat((followers / following).toFixed(1)),
      engagementPerPost: avgLikes + avgComments,
    },
    demo: true,
  };
}

async function fetchFromInstagram(username: string) {
  const { cookie, csrf } = await getSessionCookies();
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
  const res = await fetch(url, {
    headers: igHeaders(cookie, csrf),
    signal: AbortSignal.timeout(10000),
  });

  console.log(`[ig] ${username} → ${res.status}`);
  if (res.status === 404) return { notFound: true };
  if (!res.ok) return { failed: true, status: res.status };

  const json = await res.json();
  const user = json?.data?.user;
  if (!user) return { notFound: true };

  const followers: number = user.follower_count ?? user.edge_followed_by?.count ?? 0;
  const following: number = user.following_count ?? user.edge_follow?.count ?? 0;
  const posts: number = user.media_count ?? user.edge_owner_to_timeline_media?.count ?? 0;

  // Posts are embedded in the profile response — no second request needed
  const edges: Array<{
    node: {
      edge_liked_by?: { count: number };
      edge_media_to_comment?: { count: number };
      like_count?: number;
      comment_count?: number;
    };
  }> = user.edge_owner_to_timeline_media?.edges ?? [];

  let avgLikes = 0;
  let avgComments = 0;

  if (edges.length > 0) {
    const slice = edges.slice(0, 12);
    const totalLikes = slice.reduce(
      (s, e) => s + (e.node.edge_liked_by?.count ?? e.node.like_count ?? 0),
      0
    );
    const totalComments = slice.reduce(
      (s, e) => s + (e.node.edge_media_to_comment?.count ?? e.node.comment_count ?? 0),
      0
    );
    avgLikes = Math.round(totalLikes / slice.length);
    avgComments = Math.round(totalComments / slice.length);
  }

  const engagementRate =
    followers > 0
      ? parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2))
      : 0;

  const benchmark =
    followers < 10000 ? 3.5 : followers < 50000 ? 2.4 : followers < 100000 ? 1.8 : 1.2;

  return {
    ok: true,
    data: {
      username: user.username ?? username,
      profile: {
        followers,
        following,
        posts,
        isVerified: user.is_verified ?? false,
        accountType:
          user.is_business_account || user.is_business
            ? "business"
            : user.account_type === 2
            ? "creator"
            : "personal",
        bio: user.biography ?? "",
        fullName: user.full_name ?? username,
        profilePic:
          user.profile_pic_url_hd ??
          user.hd_profile_pic_url_info?.url ??
          user.profile_pic_url ??
          null,
      },
      engagement: {
        rate: engagementRate,
        avgLikes,
        avgComments,
        benchmark,
        status: engagementRate >= benchmark ? "above" : "below",
      },
      shadowban: {
        status: "unknown",
        score: null,
        hashtagReach: "unknown",
        reelsReach: "unknown",
        exploreReach: "unknown",
        note: "La detección de shadowban no está disponible a través de datos públicos.",
      },
      posting: {
        frequency: posts > 0 ? Math.max(1, Math.round(posts / 52)) : 0,
        bestDays: null,
        bestHours: null,
      },
      ratios: {
        followerFollowing:
          following > 0 ? parseFloat((followers / following).toFixed(1)) : followers,
        engagementPerPost: avgLikes + avgComments,
      },
      demo: false,
    },
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.replace("@", "").trim();

  if (!username) {
    return NextResponse.json({ error: "Username requerido" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    return NextResponse.json({ error: "Nombre de usuario inválido" }, { status: 400 });
  }

  // Serve from cache if fresh
  const cached = cache.get(username);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const result = await fetchFromInstagram(username);

    if (result.notFound) {
      return NextResponse.json(
        { error: "Cuenta no encontrada o es privada" },
        { status: 404 }
      );
    }

    if (result.ok && result.data) {
      cache.set(username, { data: result.data, ts: Date.now() });
      return NextResponse.json(result.data);
    }

    // Instagram blocked or returned an unexpected status — fall back to demo
    console.warn(`[instagram-analyze] fallback demo for ${username}, status=${result.status}`);
    const demo = calcEngagement(username);
    return NextResponse.json(demo);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[instagram-analyze] error:", message);
    // Always degrade gracefully — never show a raw error to the user
    return NextResponse.json(calcEngagement(username));
  }
}
