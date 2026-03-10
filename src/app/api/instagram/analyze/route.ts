import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "instagram-scraper-api2.p.rapidapi.com";

function simulateEngagement(username: string) {
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
  const engagementRate = parseFloat(
    (((avgLikes + avgComments) / followers) * 100).toFixed(2)
  );

  const engagementBenchmark =
    followers < 10000 ? 3.5 : followers < 50000 ? 2.4 : followers < 100000 ? 1.8 : 1.2;

  return {
    username,
    profile: {
      followers,
      following,
      posts,
      isVerified: followers > 50000 && rng(0, 1) === 1,
      accountType: rng(0, 2) === 0 ? "personal" : rng(0, 1) === 0 ? "creator" : "business",
      bio: `Cuenta analizada: @${username}`,
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
      note: "La deteccion de shadowban no esta disponible a traves de datos publicos.",
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.replace("@", "").trim();

  if (!username) {
    return NextResponse.json({ error: "Username requerido" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    return NextResponse.json({ error: "Nombre de usuario invalido" }, { status: 400 });
  }

  if (!RAPIDAPI_KEY) {
    return NextResponse.json(simulateEngagement(username));
  }

  try {
    const headers = {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    };

    const [infoRes, postsRes] = await Promise.all([
      fetch(
        `https://${RAPIDAPI_HOST}/v1/info?username_or_id_or_url=${encodeURIComponent(username)}`,
        { headers, signal: AbortSignal.timeout(8000) }
      ),
      fetch(
        `https://${RAPIDAPI_HOST}/v1/posts?username_or_id_or_url=${encodeURIComponent(username)}`,
        { headers, signal: AbortSignal.timeout(8000) }
      ),
    ]);

    if (infoRes.status === 404) {
      return NextResponse.json(
        { error: "Cuenta no encontrada o es privada" },
        { status: 404 }
      );
    }

    if (!infoRes.ok) {
      throw new Error(`API error: ${infoRes.status}`);
    }

    const infoJson = await infoRes.json();
    const user = infoJson.data;

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const followers = user.follower_count ?? 0;
    const following = user.following_count ?? 0;
    const posts = user.media_count ?? 0;

    let avgLikes = 0;
    let avgComments = 0;

    if (postsRes.ok) {
      const postsJson = await postsRes.json();
      const items: Array<{ like_count?: number; comment_count?: number }> =
        postsJson.data?.items ?? [];
      if (items.length > 0) {
        const slice = items.slice(0, 12);
        const totalLikes = slice.reduce((sum, p) => sum + (p.like_count ?? 0), 0);
        const totalComments = slice.reduce((sum, p) => sum + (p.comment_count ?? 0), 0);
        avgLikes = Math.round(totalLikes / slice.length);
        avgComments = Math.round(totalComments / slice.length);
      }
    }

    const engagementRate =
      followers > 0
        ? parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2))
        : 0;

    const engagementBenchmark =
      followers < 10000 ? 3.5 : followers < 50000 ? 2.4 : followers < 100000 ? 1.8 : 1.2;

    return NextResponse.json({
      username: user.username ?? username,
      profile: {
        followers,
        following,
        posts,
        isVerified: user.is_verified ?? false,
        accountType: user.is_business
          ? "business"
          : user.account_type === 2
          ? "creator"
          : "personal",
        bio: user.biography ?? "",
        fullName: user.full_name ?? username,
        profilePic: user.hd_profile_pic_url_info?.url ?? user.profile_pic_url ?? null,
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
        note: "La deteccion de shadowban no esta disponible a traves de datos publicos.",
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
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[instagram-analyze] error:", message);
    return NextResponse.json(
      { error: `Error al consultar la API: ${message}` },
      { status: 502 }
    );
  }
}
