import type { Context } from "@netlify/edge-functions";

export const config = { path: "/events/*" };

const UUID = /^\/events\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

const BOT_UA =
  /twitterbot|facebookexternalhit|mastodon|misskey|mstdn|line|slackbot|discordbot|telegrambot|whatsapp|skypeuripreview|pinterest|linkedinbot|googlebot|bingbot|duckduckbot|applebot|yandex|baiduspider|preview|bot|crawler|spider|checker/i;

const BROWSER_UA = /mozilla|chrome|safari|firefox|edge|opera|mobile|iphone|android/i;

function isOgpCrawler(req: Request): boolean {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT_UA.test(ua)) return true;
  if (req.headers.has("sec-ch-ua") || req.headers.has("sec-fetch-dest")) return false;
  if (BROWSER_UA.test(ua)) return false;
  return true;
}

export default async (req: Request, ctx: Context) => {
  const url = new URL(req.url);
  const match = url.pathname.match(UUID);

  const taggedNext = async (reason: string) => {
    const res = await ctx.next();
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: {
        ...Object.fromEntries(res.headers),
        "X-OGP-Edge-Function": `fallback:${reason}`,
      },
    });
  };

  if (!match) return taggedNext("not-uuid");
  if (!isOgpCrawler(req)) return taggedNext("browser");

  const backend = Deno.env.get("BACKEND_PUBLIC_URL");
  if (!backend) return taggedNext("no-env");

  const target = new URL(`/public/events/${match[1]}`, backend);
  try {
    const upstream = new Request(target.toString(), {
      method: "GET",
      headers: {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": url.host,
        "Accept": req.headers.get("accept") ?? "*/*",
        "User-Agent": req.headers.get("user-agent") ?? "",
      },
    });
    const res = await fetch(upstream);
    if (!res.ok) return taggedNext(`backend-${res.status}`);
    const html = await res.text();
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-OGP-Edge-Function": "active",
        "X-OGP-Backend": target.host,
      },
    });
  } catch {
    return taggedNext("error");
  }
};
