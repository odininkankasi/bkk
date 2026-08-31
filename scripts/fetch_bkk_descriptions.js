const fs = require("fs");
const path = require("path");

async function fetchPage(pageNum) {
  const url =
    pageNum === 1
      ? "https://www.bilimkurgukulubu.com/edebiyat/ithaki-bilimkurgu-klasikleri-dizisi/"
      : `https://www.bilimkurgukulubu.com/edebiyat/ithaki-bilimkurgu-klasikleri-dizisi/${pageNum}/`;

  console.log(`Fetching: ${url}`);
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    console.warn(`Sayfa ${pageNum} alınamadı (HTTP ${res.status})`);
    return "";
  }

  return await res.text();
}

function parseBooksFromHtml(html) {
  const books = [];

  // Match items like: 5- Çocukluğun Sonu (Childhood’s End) / Arthur C. Clarke
  // or 1- Dune (Dune) / Frank Herbert
  const regex = /(\d+)\s*[-–—.]\s*([^\n\r<]+?)(?:\s*\(([^)]+)\))?\s*\/\s*([^\n\r<]+)/gi;

  // Let's also split the content into sections by book number headers
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");

  // Find all matches
  let match;
  const matches = [];
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      no: parseInt(match[1], 10),
      rawTitle: match[2].trim(),
      origTitle: match[3] ? match[3].trim() : "",
      author: match[4].trim(),
    });
  }

  return { text, matches };
}

async function main() {
  const allDescriptions = {};

  for (let p = 1; p <= 8; p++) {
    const html = await fetchPage(p);
    if (!html) break;

    fs.writeFileSync(
      path.join(__dirname, `bkk_kulubu_page_${p}.html`),
      html,
      "utf8"
    );
  }

  console.log("✓ Tüm sayfalar indirildi.");
}

main().catch(console.error);
