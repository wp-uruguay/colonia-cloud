/**
 * Cloudflare Worker — Instagram data proxy
 *
 * Deploy en https://workers.cloudflare.com (gratis, 100k req/día)
 * Una vez deployado, copiá la URL (ej: https://ig-proxy.TU-USER.workers.dev)
 * y agregala como variable de entorno en Vercel:
 *   INSTAGRAM_PROXY_URL=https://ig-proxy.TU-USER.workers.dev
 *
 * Para deployar:
 *   1. npm install -g wrangler
 *   2. wrangler login
 *   3. cd cloudflare-worker && wrangler deploy
 */

const IG_APP_ID = "936619743392456";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function getSessionCookies(env) {
  // Si hay cookies reales configuradas como secret, usarlas directamente
  if (env.IG_COOKIES) {
    const csrf = env.IG_COOKIES.match(/csrftoken=([^;]+)/)?.[1] ?? "";
    return { cookies: env.IG_COOKIES, csrf };
  }
  // Fallback: cookies anónimas desde la homepage
  const res = await fetch("https://www.instagram.com/", {
    headers: { "User-Agent": UA, Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
  });
  const allCookies = res.headers.getAll
    ? res.headers.getAll("set-cookie")
    : [res.headers.get("set-cookie") ?? ""];
  const cookies = allCookies
    .map(c => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
  const csrf = cookies.match(/csrftoken=([^;]+)/)?.[1] ?? "";
  return { cookies, csrf };
}

// Scrape OG tags del perfil público (fallback sin auth)
async function scrapeOgTags(username) {
  const UAs = [
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
    UA,
  ];
  for (const ua of UAs) {
    const res = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
      headers: {
        "User-Agent": ua,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (res.status === 404) return { notFound: true };
    if (!res.ok) continue;
    const finalUrl = res.url;
    if (finalUrl.includes("/accounts/login") || finalUrl.includes("/challenge/")) continue;

    const html = await res.text();
    const getMeta = (prop) => {
      const patterns = [
        new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"'<>]+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+property=["']${prop}["']`, "i"),
      ];
      for (const re of patterns) { const m = html.match(re); if (m?.[1]) return m[1]; }
      return "";
    };
    const desc = getMeta("og:description");
    const m = desc.match(/([\d.,]+\s*[KMBkmb]?)\s+Followers?,\s+([\d.,]+\s*[KMBkmb]?)\s+Following,\s+([\d.,]+\s*[KMBkmb]?)\s+Posts?/i);
    if (m) {
      const parse = (s) => {
        const n = parseFloat(s.replace(/,/g, ""));
        if (/k/i.test(s)) return Math.round(n * 1000);
        if (/m/i.test(s)) return Math.round(n * 1e6);
        return Math.round(n);
      };
      const title = getMeta("og:title");
      const fullName = title.replace(/\s*[•|].*$/, "").replace(/\s*\(@[^)]+\)/, "").trim() || username;
      const profilePic = getMeta("og:image") || null;
      return {
        data: {
          user: {
            username,
            full_name: fullName,
            profile_pic_url_hd: profilePic,
            follower_count: parse(m[1]),
            following_count: parse(m[2]),
            media_count: parse(m[3]),
            is_verified: html.includes('"is_verified":true'),
            biography: "",
          },
        },
      };
    }
  }
  return null; // login wall o sin datos
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
        },
      });
    }

    const username = url.searchParams.get("username");
    if (!username || !/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
      return json({ error: "invalid username" }, 400);
    }

    try {
      // Intento 1: Instagram internal API con cookies de sesión anónima
      const { cookies, csrf } = await getSessionCookies(env);

      const igRes = await fetch(
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
        {
          headers: {
            "User-Agent": UA,
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "x-ig-app-id": IG_APP_ID,
            "x-csrftoken": csrf,
            Cookie: cookies,
            Referer: "https://www.instagram.com/",
          },
        }
      );

      if (igRes.status === 404) return json({ notFound: true }, 404);

      if (igRes.ok) {
        const data = await igRes.json();
        if (data?.data?.user) return json(data);
      }

      // Intento 2: scraping de OG tags (si la API interna falla con 401/403)
      const ogData = await scrapeOgTags(username);
      if (!ogData) return json({ error: "login_wall" }, 503);
      if ("notFound" in ogData) return json({ notFound: true }, 404);
      return json(ogData);

    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
