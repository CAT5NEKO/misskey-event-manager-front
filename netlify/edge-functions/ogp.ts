import type { Context } from "@netlify/edge-functions";

export const config = { path: "/events/*" };

const UUID = /^\/events\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

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

  const backend = Deno.env.get("BACKEND_PUBLIC_URL");
  if (!match) return taggedNext("not-uuid");
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
