import type { Context } from "@netlify/edge-functions";

const CRAWLER_PATTERN =
  /bot|crawler|twitterbot|facebookexternalhit|discordbot|slackbot|telegrambot|whatsapp|linkedinbot|googlebot|bingbot|applebot|duckduckbot|baiduspider|yandex|embedly/i;

export default async function handler(request: Request, context: Context) {
  const ua = request.headers.get("user-agent") || "";
  if (!CRAWLER_PATTERN.test(ua)) return context.next();

  const eventId = context.params.id;
  if (!eventId) return context.next();

  const baseUrl =
    Deno.env.get("OGP_BACKEND_URL") || Deno.env.get("VITE_API_URL") || "";
  if (!baseUrl) return context.next();

  try {
    const res = await fetch(`${baseUrl}/api/ogp/events/${eventId}`);
    if (!res.ok) return context.next();
    const html = await res.text();
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch {
    return context.next();
  }
}
