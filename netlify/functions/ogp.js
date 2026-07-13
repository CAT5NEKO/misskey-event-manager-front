const fs = require("fs");
const path = require("path");

const CRAWLER =
  /bot|crawler|twitter|facebook|discord|slack|telegram|whatsapp|embedly|iframely|ogp/i;

let INDEX_HTML = "";
[
  path.join(__dirname, "..", "..", "..", "dist", "index.html"),
  path.join(__dirname, "..", "..", "dist", "index.html"),
  path.join(process.cwd(), "dist", "index.html"),
].some((p) => {
  try {
    INDEX_HTML = fs.readFileSync(p, "utf-8");
    return true;
  } catch {
    return false;
  }
});

exports.handler = async (event) => {
  const ua = (event.headers["user-agent"] || "").toLowerCase();
  const isCrawler = CRAWLER.test(ua);

  const eventId = event.path.split("/").pop();
  const baseUrl = process.env.VITE_API_URL;

  if (isCrawler && eventId && baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/api/ogp/events/${eventId}`);
      if (res.ok) {
        const html = await res.text();
        return {
          statusCode: 200,
          body: html,
          headers: { "content-type": "text/html; charset=utf-8" },
        };
      }
    } catch {}
  }

  if (INDEX_HTML) {
    return {
      statusCode: 200,
      body: INDEX_HTML,
      headers: { "content-type": "text/html; charset=utf-8" },
    };
  }

  return {
    statusCode: 200,
    body: `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>miSchedule</title><meta property="og:title" content="miSchedule"><meta property="og:description" content="miScheduleで予定を共有しよう"><meta property="og:type" content="website"><meta property="og:site_name" content="miSchedule"><meta name="twitter:card" content="summary"></head><body class="bg-gray-50 text-gray-900"><div id="root"></div><script>window.location.replace("/")</script></body></html>`,
    headers: { "content-type": "text/html; charset=utf-8" },
  };
};

