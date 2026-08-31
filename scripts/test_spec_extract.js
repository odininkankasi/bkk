const https = require("https");
const fs = require("fs");

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function run() {
  const html = await get("https://www.ithakiyayingrubu.com/doktor-moreaunun-adasi");
  
  // Find description
  const descMatch = html.match(/<div class="full-description[^>]*>([\s\S]*?)<\/div>/i) || html.match(/<div class="product-description[^>]*>([\s\S]*?)<\/div>/i);
  if (descMatch) {
    const cleanDesc = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    console.log("Tanıtım Yazısı:", cleanDesc.slice(0, 300));
  }

  // Find specifications
  const specs = {};
  const specRegex = /<dt[^>]*class="spec-name[^"]*"[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*class="spec-value[^"]*"[^>]*>([\s\S]*?)<\/dd>/gi;
  let match;
  while ((match = specRegex.exec(html)) !== null) {
    const key = match[1].replace(/<[^>]+>/g, "").trim();
    const val = match[2].replace(/<[^>]+>/g, "").trim();
    specs[key] = val;
  }

  console.log("Künye Özellikleri:", specs);
}

run().catch(console.error);
