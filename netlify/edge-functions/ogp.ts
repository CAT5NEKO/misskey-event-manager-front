export default async function handler(request: Request, context: { params: { id?: string }; next: () => Response }) {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const isCrawler = /bot|crawler|twitter|facebook|discord|slack|telegram|whatsapp|embedly|iframely|ogp/i.test(ua);
  if (!isCrawler) return context.next();

  const eventId = context.params.id;
  if (!eventId) return context.next();

  const baseUrl = Netlify.env.get("VITE_API_URL");
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

export const config = { path: "/events/*" };