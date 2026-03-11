import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;

function parseIgNumber(raw: string): number {
  const s = raw.replace(/,/g, "").trim();
  const m = s.match(/^([\d.]+)\s*([KMB]?)$/i);
  if (!m) return parseInt(s) || 0;
  const n = parseFloat(m[1]);
  const mult: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 };
  return Math.round(n * (mult[m[2].toLowerCase()] ?? 1));
}

function parseMeta(html: string, property: string): string {
  // Try property= before content= and vice versa, both quote styles
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"'<>]+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"'<>]+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  }
  return "";
}

function extractFromJson(html: string, key: string): string {
  // Matches "key":"value" or "key":123 or "key":true
  const m = html.match(new RegExp(`"${key}"\\s*:\\s*([^,}\\]]+)`));
  if (!m) return "";
  return m[1].trim().replace(/^"(.*)"$/, "$1");
}

function buildResult(username: string, followers: number, following: number, posts: number, opts: {
  fullName?: string; profilePic?: string | null; bio?: string; isVerified?: boolean;
}) {
  const { fullName = username, profilePic = null, bio = "", isVerified = false } = opts;
  const engRate =
    followers < 1000 ? 8.0
    : followers < 10000 ? 5.6
    : followers < 50000 ? 2.4
    : followers < 100000 ? 1.8
    : followers < 500000 ? 1.3
    : 0.9;
  const avgLikes = Math.round((followers * engRate) / 100 * 0.92);
  const avgComments = Math.round((followers * engRate) / 100 * 0.08);
  const benchmark = followers < 10000 ? 3.5 : followers < 50000 ? 2.4 : followers < 100000 ? 1.8 : 1.2;
  return {
    ok: true,
    data: {
      username,
      profile: { followers, following, posts, isVerified, accountType: "personal" as const, bio, fullName, profilePic },
      engagement: { rate: engRate, avgLikes, avgComments, benchmark, status: engRate >= benchmark ? "above" : "below", estimated: true },
      shadowban: { status: "unknown", score: null, hashtagReach: "unknown", reelsReach: "unknown", exploreReach: "unknown", note: "La detección de shadowban no está disponible a través de datos públicos." },
      posting: { frequency: posts > 0 ? Math.max(1, Math.round(posts / 52)) : 0, bestDays: null, bestHours: null },
      ratios: { followerFollowing: following > 0 ? parseFloat((followers / following).toFixed(1)) : followers, engagementPerPost: avgLikes + avgComments },
      demo: false,
    },
  };
}

async function scrapeProfile(username: string) {
  // Try multiple User-Agents — facebookexternalhit explicitly requests OG tags
  // and Instagram must serve them to support Facebook link previews.
  const UAs = [
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
    "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  ];

  for (const ua of UAs) {
    const res = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
      headers: {
        "User-Agent": ua,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });

    const finalUrl = res.url;
    console.log(`[ig] ${username} UA="${ua.slice(0, 30)}" → ${res.status} final=${finalUrl}`);

    if (res.status === 404) return { notFound: true };

    // Redirected to login
    if (finalUrl.includes("/accounts/login") || finalUrl.includes("/challenge/")) {
      console.warn(`[ig] login wall for ${username} with UA=${ua.slice(0, 30)}`);
      continue;
    }

    if (!res.ok) continue;

    const html = await res.text();

    // Debug: log start of HTML to see what we're getting
    console.log(`[ig] html[:300]="${html.slice(0, 300).replace(/\s+/g, " ")}"`);

    // ── Strategy 1: OpenGraph meta tags ──────────────────────────────────────
    const desc = parseMeta(html, "og:description");
    console.log(`[ig] og:description="${desc.slice(0, 120)}"`);

    const ogMatch = desc.match(
      /([\d.,]+\s*[KMBkmb]?)\s+Followers?,\s+([\d.,]+\s*[KMBkmb]?)\s+Following,\s+([\d.,]+\s*[KMBkmb]?)\s+Posts?/i
    );
    if (ogMatch) {
      const followers = parseIgNumber(ogMatch[1]);
      const following = parseIgNumber(ogMatch[2]);
      const posts = parseIgNumber(ogMatch[3]);
      const title = parseMeta(html, "og:title");
      const fullName = title.replace(/\s*[•|].*$/, "").replace(/\s*\(@[^)]+\)/, "").trim() || username;
      const profilePic = parseMeta(html, "og:image") || null;
      const bioMatch = desc.match(/Posts?\s*[-–]\s*(.+?)(?:\s*on Instagram)?\.?\s*$/i);
      const bio = bioMatch?.[1]?.trim() ?? "";
      const isVerified = html.includes('"is_verified":true');
      console.log(`[ig] OG success: ${followers} followers`);
      return buildResult(username, followers, following, posts, { fullName, profilePic, bio, isVerified });
    }

    // ── Strategy 2: Embedded JSON in script tags ──────────────────────────────
    // Instagram embeds profile data as JSON in <script> tags
    const followerRaw = extractFromJson(html, "follower_count") || extractFromJson(html, "edge_followed_by");
    const followingRaw = extractFromJson(html, "following_count") || extractFromJson(html, "edge_follow");
    const postsRaw = extractFromJson(html, "media_count") || extractFromJson(html, "edge_owner_to_timeline_media");

    // edge_followed_by returns {"count":N} — extract count
    const followers2 = parseInt(followerRaw.replace(/\D/g, "")) || 0;
    const following2 = parseInt(followingRaw.replace(/\D/g, "")) || 0;
    const posts2 = parseInt(postsRaw.replace(/\D/g, "")) || 0;

    if (followers2 > 0) {
      const fullName2 = extractFromJson(html, "full_name") || username;
      const profilePic2 = extractFromJson(html, "profile_pic_url_hd") || extractFromJson(html, "profile_pic_url") || null;
      const bio2 = extractFromJson(html, "biography") || "";
      const isVerified2 = html.includes('"is_verified":true');
      console.log(`[ig] JSON success: ${followers2} followers`);
      return buildResult(username, followers2, following2, posts2, { fullName: fullName2, profilePic: profilePic2, bio: bio2, isVerified: isVerified2 });
    }

    // ── Strategy 3: Look for count patterns in raw HTML ───────────────────────
    // Sometimes data appears as plain text: "80,200 followers"
    const rawMatch = html.match(/([\d,]+)\s+[Ff]ollowers?/);
    if (rawMatch) {
      const followers3 = parseInt(rawMatch[1].replace(/,/g, ""));
      console.log(`[ig] raw text success: ${followers3} followers`);
      return buildResult(username, followers3, 0, 0, {});
    }

    console.warn(`[ig] no data found in HTML with UA=${ua.slice(0, 30)}, trying next UA`);
  }

  // All UAs exhausted
  return { notFound: true };
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

  if (!username) return NextResponse.json({ error: "Username requerido" }, { status: 400 });
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) return NextResponse.json({ error: "Nombre de usuario inválido" }, { status: 400 });

  const cached = cache.get(username);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return NextResponse.json(cached.data);

  try {
    const result = await scrapeProfile(username);

    if ("notFound" in result) {
      return NextResponse.json({ error: "Cuenta no encontrada o es privada" }, { status: 404 });
    }

    if ("ok" in result && result.data) {
      cache.set(username, { data: result.data, ts: Date.now() });
      return NextResponse.json(result.data);
    }

    return NextResponse.json(demoData(username));
  } catch (err) {
    console.error("[ig] error:", err instanceof Error ? err.message : err);
    return NextResponse.json(demoData(username));
  }
}
