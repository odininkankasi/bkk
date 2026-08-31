const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function cleanTitle(str) {
  const trMap = {
    ç: "c",
    ğ: "g",
    ı: "i",
    i: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    I: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };
  return String(str || "")
    .split("")
    .map((c) => trMap[c] || c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

async function run() {
  const html = await get("https://www.ithakiyayingrubu.com/bilimkurgu-klasikleri?pagenumber=1&pagesize=100");
  
  const map = new Map();
  // Regex that matches any <a> tag with href and title in any order
  const aRegex = /<a\s+[^>]*href="(\/[a-z0-9\-]+)"[^>]*title="([^"]*)"[^>]*>/gi;
  const bRegex = /<a\s+[^>]*title="([^"]*)"[^>]*href="(\/[a-z0-9\-]+)"[^>]*>/gi;
  
  let m;
  while ((m = aRegex.exec(html)) !== null) {
    const title = m[2].replace(/ için ayrıntıları göster/i, "").trim();
    if (!title.includes("Sepet") && !title.includes("Hesap")) {
      map.set(cleanTitle(title), { title, href: m[1] });
    }
  }
  while ((m = bRegex.exec(html)) !== null) {
    const title = m[1].replace(/ için ayrıntıları göster/i, "").trim();
    if (!title.includes("Sepet") && !title.includes("Hesap")) {
      map.set(cleanTitle(title), { title, href: m[2] });
    }
  }

  console.log(`Found ${map.size} products on page 1:`);
  console.log(Array.from(map.values()).slice(0, 10));
}

run().catch(console.error);
