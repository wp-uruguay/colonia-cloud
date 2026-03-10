import { NextRequest, NextResponse } from "next/server";

// In-memory cache (1 hour per username)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;

// Instagram serves full OpenGraph meta tags to search engine crawlers even from cloud IPs,
// because they need Google/Twitter/Facebook to generate link previews.
// og:description → "1.2M Followers, 500 Following, 100 Posts - See Instagram..."
// og:title       → "Full Name (@username) • Instagram photos and videos"
// og:image       → profile picture URL

function parseIgNumber(raw: string): number {
  const s = raw.replace(/,/g, "").trim();
  const m = s.match(/^([\d.]+)\s*([KMB]?)$/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const mult: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 };
  return Math.round(n * (mult[m[2].toLowerCase()] ?? 1));
}

function parseMeta(html: string, property: string): string {
  // handles both property= and name= variants
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  return (html.match(re) ?? html.match(re2))?.[1] ?? "";
}

async function scrapeOpenGraph(username: string) {
  // Googlebot UA: Instagram serves full HTML (including OG tags) to search crawlers
  // even from AWS/Vercel IPs, because blocking them would hurt their SEO.
  const res = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(12000),
    redirect: "follow",
  });

  console.log(`[ig-og] ${username} → ${res.status}`);

  if (res.status === 404) return { notFound: true };
  if (!res.ok) return { failed: true, status: res.status };

  const html = await res.text();

  // og:description → "1.2M Followers, 500 Following, 100 Posts - ..."
  const desc = parseMeta(html, "og:description");
  const descMatch = desc.match(
    /^([\d.,]+\s*[KMBkmb]?)\s+Followers?,\s+([\d.,]+\s*[KMBkmb]?)\s+Following,\s+([\d.,]+\s*[KMBkmb]?)\s+Posts?/i
  );

  if (!descMatch) {
    // No OG data means private account or login wall
    console.warn(`[ig-og] no og:description for ${username}. desc="${desc.slice(0, 80)}"`);
    return { notFound: true };
  }

  const followers = parseIgNumber(descMatch[1]);
  const following = parseIgNumber(descMatch[2]);
  const posts = parseIgNumber(descMatch[3]);

  // og:title → "Full Name (@username) • Instagram photos and videos"
  const title = parseMeta(html, "og:title");
  const fullName = title.replace(/\s*\(@[^)]+\).*$/, "").trim() || username;

  const profilePic = parseMeta(html, "og:image") || null;

  // Bio sometimes appears after the posts count in og:description
  const bioMatch = desc.match(/Posts?\s*[-–]\s*(.+?)(?:\s*on Instagram)?$/i);
  const bio = bioMatch?.[1]?.trim() ?? "";

  const isVerified = html.includes('"is_verified":true') || html.includes("Verified");

  // Engagement: without per-post data we use industry-average rates by follower tier
  // This is transparent — the UI should show these as estimates
  const engRate =
    followers < 1000 ? 8.0
    : followers < 10000 ? 5.6
    : followers < 50000 ? 2.4
    : followers < 100000 ? 1.8
    : followers < 500000 ? 1.3
    : 0.9;

  const avgLikes = Math.round((followers * engRate) / 100 * 0.92);
  const avgComments = Math.round((followers * engRate) / 100 * 0.08);
  const benchmark =
    followers < 10000 ? 3.5 : followers < 50000 ? 2.4 : followers < 100000 ? 1.8 : 1.2;

  return {
    ok: true,
    data: {
      username,
      profile: {
        followers,
        following,
        posts,
        isVerified,
        accountType: "personal" as const,
        bio,
        fullName,
        profilePic,
      },
      engagement: {
        rate: engRate,
        avgLikes,
        avgComments,
        benchmark,
        status: engRate >= benchmark ? "above" : "below",
        estimated: true, // flag so the UI can note these are estimates
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

function demoData(username: string) {
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
    profile: { followers, following, posts, isVerified: false, accountType: "personal", bio: "", fullName: username, profilePic: null },
    engagement: { rate: engagementRate, avgLikes, avgComments, benchmark, status: engagementRate >= benchmark ? "above" : "below" },
    shadowban: { status: "unknown", score: null, hashtagReach: "unknown", reelsReach: "unknown", exploreReach: "unknown", note: "La detección de shadowban no está disponible a través de datos públicos." },
    posting: { frequency: rng(2, 14), bestDays: null, bestHours: null },
    ratios: { followerFollowing: parseFloat((followers / following).toFixed(1)), engagementPerPost: avgLikes + avgComments },
    demo: true,
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

  const cached = cache.get(username);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const result = await scrapeOpenGraph(username);

    if (result.notFound) {
      return NextResponse.json({ error: "Cuenta no encontrada o es privada" }, { status: 404 });
    }

    if (result.ok && result.data) {
      cache.set(username, { data: result.data, ts: Date.now() });
      return NextResponse.json(result.data);
    }

    console.warn(`[ig] fallback demo for ${username}, status=${result.status}`);
    return NextResponse.json(demoData(username));
  } catch (err) {
    console.error("[ig] error:", err instanceof Error ? err.message : err);
    return NextResponse.json(demoData(username));
  }
}
