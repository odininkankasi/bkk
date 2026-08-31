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
  fs.writeFileSync("scripts/single_product.html", html, "utf8");
  console.log("Saved scripts/single_product.html. Length:", html.length);
}

run().catch(console.error);
