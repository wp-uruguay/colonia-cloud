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

async function getSessionCookies() {
  const res = await fetch("https://www.instagram.com/", {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  const cookies = (res.headers.get("set-cookie") ?? "").split(",")
    .map(c => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
  const csrf = cookies.match(/csrftoken=([^;]+)/)?.[1] ?? "";
  return { cookies, csrf };
}

export default {
  async fetch(request) {
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
      const { cookies, csrf } = await getSessionCookies();

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
      if (!igRes.ok) return json({ error: igRes.status }, igRes.status);

      const data = await igRes.json();
      return json(data);
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
