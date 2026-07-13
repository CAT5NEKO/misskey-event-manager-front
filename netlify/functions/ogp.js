const CRAWLER = /bot|crawler|twitter|facebook|discord|slack|telegram|whatsapp|embedly|iframely|ogp/i;

const INDEX_HTML = require("fs").readFileSync(
  require("path").join(__dirname, "..", "..", "dist", "index.html"),
  "utf-8"
);

exports.handler = async (event) => {
  const ua = (event.headers["user-agent"] || "").toLowerCase();
  if (!CRAWLER.test(ua)) {
    return {
      statusCode: 200,
      body: INDEX_HTML,
      headers: { "content-type": "text/html; charset=utf-8" },
    };
  }

  const eventId = event.path.split("/").pop();
  if (!eventId || !process.env.VITE_API_URL) {
    return {
      statusCode: 200,
      body: INDEX_HTML,
      headers: { "content-type": "text/html; charset=utf-8" },
    };
  }

  try {
    const res = await fetch(
      `${process.env.VITE_API_URL}/api/ogp/events/${eventId}`
    );
    if (!res.ok) throw new Error("backend error");
    const html = await res.text();
    return {
      statusCode: 200,
      body: html,
      headers: { "content-type": "text/html; charset=utf-8" },
    };
  } catch {
    return {
      statusCode: 200,
      body: INDEX_HTML,
      headers: { "content-type": "text/html; charset=utf-8" },
    };
  }
};
