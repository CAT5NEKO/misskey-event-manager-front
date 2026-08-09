import type { Context } from "@netlify/edge-functions";

export const config = { path: "/events/*" };

const UUID = /^\/events\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

/**
 * イベントページ (`/events/{id}`) のみバックエンドの OGP 付き HTML へプロキシし、
 * それ以外 (SPA) は Netlify の静的配信にフォールバックします。
 * バックエンドへは `BACKEND_PUBLIC_URL` (e.g. https://api.example.com) が必要です。
 */
export default async (req: Request, ctx: Context) => {
  const url = new URL(req.url);
  const match = uuidMatch(url.pathname);
  const backend = Deno.env.get("BACKEND_PUBLIC_URL");
  if (!match || !backend) return ctx.next();

  const target = new URL(`/public/events/${match[1]}`, backend);
  const upstream = new Request(target.toString(), {
    method: "GET",
    headers: {
      "X-Forwarded-Proto": "https",
      "X-Forwarded-Host": url.host,
      "Accept": req.headers.get("accept") ?? "*/*",
      "User-Agent": req.headers.get("user-agent") ?? "",
    },
  });

  try {
    const res = await fetch(upstream);
    if (!res.ok) return ctx.next();
    const html = await res.text();
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return ctx.next();
  }
};

function uuidMatch(path: string) {
  const r = path.match(UUID);
  return r;
}