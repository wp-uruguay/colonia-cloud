import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;

// ── Cloudflare Worker proxy ────────────────────────────────────────────────────
// Set INSTAGRAM_PROXY_URL in Vercel env vars to enable real data.
// See cloudflare-worker/ for the worker code and deploy instructions.
async function fetchViaWorker(username: string) {
  const proxyUrl = process.env.INSTAGRAM_PROXY_URL;
  if (!proxyUrl) return null;

  try {
    const res = await fetch(`${proxyUrl}?username=${encodeURIComponent(username)}`, {
      signal: AbortSignal.timeout(12000),
    });

    if (res.status === 404) return { notFound: true };
    if (!res.ok) return null;

    const json = await res.json() as { data?: { user?: Record<string, unknown> }; notFound?: boolean };
    if (json.notFound) return { notFound: true };

    const user = json?.data?.user;
    if (!user) return null;

    const followers = (user.follower_count ?? (user.edge_followed_by as { count?: number })?.count ?? 0) as number;
    const following = (user.following_count ?? (user.edge_follow as { count?: number })?.count ?? 0) as number;
    const posts = (user.media_count ?? (user.edge_owner_to_timeline_media as { count?: number })?.count ?? 0) as number;
    const edges = ((user.edge_owner_to_timeline_media as { edges?: Array<{ node: { edge_liked_by?: { count: number }; edge_media_to_comment?: { count: number }; like_count?: number; comment_count?: number } }> })?.edges ?? []).slice(0, 12);

    let avgLikes = 0, avgComments = 0;
    if (edges.length > 0) {
      avgLikes = Math.round(edges.reduce((s, e) => s + (e.node.edge_liked_by?.count ?? e.node.like_count ?? 0), 0) / edges.length);
      avgComments = Math.round(edges.reduce((s, e) => s + (e.node.edge_media_to_comment?.count ?? e.node.comment_count ?? 0), 0) / edges.length);
    }
    const engRate = followers > 0 ? parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2)) : 0;
    const benchmark = followers < 10000 ? 3.5 : followers < 50000 ? 2.4 : followers < 100000 ? 1.8 : 1.2;

    console.log(`[ig-worker] ${username} → ${followers} followers`);
    return {
      ok: true,
      data: {
        username: (user.username as string) ?? username,
        profile: {
          followers, following, posts,
          isVerified: (user.is_verified as boolean) ?? false,
          accountType: (user.is_business_account || user.is_business) ? "business" : user.account_type === 2 ? "creator" : "personal",
          bio: (user.biography as string) ?? "",
          fullName: (user.full_name as string) ?? username,
          profilePic: (user.profile_pic_url_hd ?? user.profile_pic_url ?? null) as string | null,
        },
        engagement: { rate: engRate, avgLikes, avgComments, benchmark, status: engRate >= benchmark ? "above" : "below", estimated: edges.length === 0 },
        shadowban: { status: "unknown", score: null, hashtagReach: "unknown", reelsReach: "unknown", exploreReach: "unknown", note: "La detección de shadowban no está disponible a través de datos públicos." },
        posting: { frequency: posts > 0 ? Math.max(1, Math.round(posts / 52)) : 0, bestDays: null, bestHours: null },
        ratios: { followerFollowing: following > 0 ? parseFloat((followers / following).toFixed(1)) : followers, engagementPerPost: avgLikes + avgComments },
        demo: false,
      },
    };
  } catch (err) {
    console.error("[ig-worker] error:", err instanceof Error ? err.message : err);
    return null;
  }
}

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

  // All UAs hit login wall — account likely exists but Instagram blocks DC IPs
  return { loginWall: true };
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

// ── Claude AI analysis ────────────────────────────────────────────────────────
// Generates a human-readable AI analysis of the Instagram profile metrics.
// Requires ANTHROPIC_API_KEY env var. Skipped gracefully if not set.
async function generateAiAnalysis(data: {
  username: string;
  profile: { followers: number; following: number; posts: number; bio: string; accountType: string; isVerified: boolean };
  engagement: { rate: number; avgLikes: number; avgComments: number; benchmark: number; status: string; estimated: boolean };
  posting: { frequency: number };
  ratios: { followerFollowing: number };
  demo: boolean;
}): Promise<{ summary: string; strengths: string[]; improvements: string[]; recommendation: string } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new Anthropic({ apiKey });

    const prompt = `Sos un experto en marketing digital y redes sociales. Analizá las siguientes métricas de una cuenta de Instagram y generá un análisis conciso y accionable en español rioplatense.

Cuenta: @${data.username}
Seguidores: ${data.profile.followers.toLocaleString("es")}
Siguiendo: ${data.profile.following.toLocaleString("es")}
Publicaciones: ${data.profile.posts}
Bio: ${data.profile.bio || "(sin bio)"}
Tipo de cuenta: ${data.profile.accountType}
Verificada: ${data.profile.isVerified ? "sí" : "no"}
Engagement rate: ${data.engagement.rate}% (benchmark del sector: ${data.engagement.benchmark}%)
Engagement vs benchmark: ${data.engagement.status === "above" ? "por encima" : "por debajo"}
Likes promedio: ${data.engagement.avgLikes}
Comentarios promedio: ${data.engagement.avgComments}
Posts por semana: ${data.posting.frequency}
Ratio seguidores/siguiendo: ${data.ratios.followerFollowing}x
${data.engagement.estimated ? "Nota: los datos de engagement son estimados (no tenemos acceso a posts individuales)." : ""}

Respondé ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin explicaciones):
{
  "summary": "Resumen de 2-3 oraciones sobre el estado general de la cuenta",
  "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "improvements": ["área de mejora 1", "área de mejora 2", "área de mejora 3"],
  "recommendation": "Una recomendación principal concreta y accionable de 1-2 oraciones"
}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    // Strip possible markdown code fences
    const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("[ai] error:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.replace("@", "").trim();

  if (!username) return NextResponse.json({ error: "Username requerido" }, { status: 400 });
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) return NextResponse.json({ error: "Nombre de usuario inválido" }, { status: 400 });

  const cached = cache.get(username);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return NextResponse.json(cached.data);

  try {
    let profileData: ReturnType<typeof demoData> | null = null;

    // 1. Try Cloudflare Worker proxy (real data, different IPs)
    const workerResult = await fetchViaWorker(username);
    if (workerResult) {
      if ("notFound" in workerResult) {
        return NextResponse.json({ error: "Cuenta no encontrada o es privada" }, { status: 404 });
      }
      if ("ok" in workerResult && workerResult.data) {
        profileData = workerResult.data as ReturnType<typeof demoData>;
      }
    }

    // 2. Try direct scraping if worker didn't return data
    if (!profileData) {
      const result = await scrapeProfile(username);

      if ("notFound" in result) {
        return NextResponse.json({ error: "Cuenta no encontrada o es privada" }, { status: 404 });
      }

      if ("ok" in result && result.data) {
        profileData = result.data as ReturnType<typeof demoData>;
      }
    }

    // 3. Fallback to demo data
    if (!profileData) {
      profileData = demoData(username);
    }

    // Generate AI analysis (only when ANTHROPIC_API_KEY is set)
    const aiAnalysis = profileData.demo
      ? null
      : await generateAiAnalysis(profileData);

    const response = { ...profileData, aiAnalysis };
    cache.set(username, { data: response, ts: Date.now() });
    return NextResponse.json(response);
  } catch (err) {
    console.error("[ig] error:", err instanceof Error ? err.message : err);
    const fallback = { ...demoData(username), aiAnalysis: null };
    return NextResponse.json(fallback);
  }
}
