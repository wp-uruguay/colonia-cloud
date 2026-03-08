import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function simulateEngagement(username: string) {
  // Deterministic seed from username so results are consistent
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

  const shadowbanScore = rng(0, 100);
  let shadowbanStatus: "clean" | "warning" | "shadowbanned";
  if (shadowbanScore > 70) shadowbanStatus = "shadowbanned";
  else if (shadowbanScore > 40) shadowbanStatus = "warning";
  else shadowbanStatus = "clean";

  const postingFreq = rng(2, 14); // posts per week

  const engagementBenchmark =
    followers < 10000
      ? 3.5
      : followers < 50000
      ? 2.4
      : followers < 100000
      ? 1.8
      : 1.2;

  const engagementVsBenchmark =
    engagementRate >= engagementBenchmark ? "above" : "below";

  return {
    username,
    profile: {
      followers,
      following,
      posts,
      isVerified: followers > 50000 && rng(0, 1) === 1,
      accountType:
        rng(0, 2) === 0 ? "personal" : rng(0, 1) === 0 ? "creator" : "business",
      bio: `Cuenta analizada: @${username}`,
    },
    engagement: {
      rate: engagementRate,
      avgLikes,
      avgComments,
      benchmark: engagementBenchmark,
      status: engagementVsBenchmark,
    },
    shadowban: {
      status: shadowbanStatus,
      score: shadowbanScore,
      hashtagReach: shadowbanStatus === "clean" ? "normal" : shadowbanStatus === "warning" ? "reduced" : "blocked",
      reelsReach: shadowbanStatus === "shadowbanned" ? "restricted" : "normal",
      exploreReach: shadowbanStatus === "clean" ? "normal" : "reduced",
    },
    posting: {
      frequency: postingFreq,
      bestDays: ["Martes", "Miércoles", "Jueves"].slice(0, rng(2, 3)),
      bestHours: [`${rng(11, 13)}:00`, `${rng(18, 20)}:00`],
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
    return NextResponse.json(
      { error: "Nombre de usuario invalido" },
      { status: 400 }
    );
  }

  // Attempt to fetch real public data from Instagram
  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.instagram.com/",
      "X-IG-App-ID": "936619743392459",
    };

    const res = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      { headers, signal: AbortSignal.timeout(5000) }
    );

    if (res.ok) {
      const json = await res.json();
      const user = json?.data?.user;
      if (user) {
        const followers = user.edge_followed_by?.count ?? 0;
        const following = user.edge_follow?.count ?? 0;
        const posts = user.edge_owner_to_timeline_media?.count ?? 0;
        const recentMedia = user.edge_owner_to_timeline_media?.edges ?? [];

        let totalLikes = 0;
        let totalComments = 0;
        recentMedia.slice(0, 12).forEach((edge: { node: { edge_liked_by?: { count: number }; edge_media_to_comment?: { count: number } } }) => {
          totalLikes += edge.node.edge_liked_by?.count ?? 0;
          totalComments += edge.node.edge_media_to_comment?.count ?? 0;
        });

        const count = recentMedia.length || 1;
        const avgLikes = Math.round(totalLikes / count);
        const avgComments = Math.round(totalComments / count);
        const engagementRate = followers > 0
          ? parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2))
          : 0;

        const engagementBenchmark =
          followers < 10000 ? 3.5 : followers < 50000 ? 2.4 : followers < 100000 ? 1.8 : 1.2;

        return NextResponse.json({
          username,
          profile: {
            followers,
            following,
            posts,
            isVerified: user.is_verified ?? false,
            accountType: user.is_business_account ? "business" : user.is_professional_account ? "creator" : "personal",
            bio: user.biography ?? "",
            fullName: user.full_name ?? username,
            profilePic: user.profile_pic_url_hd ?? user.profile_pic_url ?? null,
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
            note: "Verificacion de shadowban requiere acceso a la API oficial.",
          },
          posting: {
            frequency: Math.round(posts / 52),
            bestDays: null,
            bestHours: null,
          },
          ratios: {
            followerFollowing: following > 0 ? parseFloat((followers / following).toFixed(1)) : followers,
            engagementPerPost: avgLikes + avgComments,
          },
          demo: false,
        });
      }
    }
  } catch {
    // Fall through to demo data
  }

  // Return simulated data with clear demo flag
  const data = simulateEngagement(username);
  return NextResponse.json(data);
}
