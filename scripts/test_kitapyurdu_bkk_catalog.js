const https = require("https");
const fs = require("fs");

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    ).on("error", reject);
  });
}

async function testKitapyurduCatalog() {
  const url = "https://www.kitapyurdu.com/index.php?route=product/search&filter_name=%C4%B0thaki%20Bilimkurgu%20Klasikleri&filter_in_stock=0&limit=100";
  console.log("Fetching Kitapyurdu BKK search results...");
  const html = await get(url);
  console.log("HTML length:", html.length);
  
  // Find products
  const productRegex = /<div class="product-cr"[\s\S]*?<div class="name"[^>]*><a[^>]*href="([^"]*)"[^>]*><span>([\s\S]*?)<\/span>/gi;
  let match;
  let count = 0;
  while ((match = productRegex.exec(html)) !== null) {
    count++;
    console.log(`[${count}] ${match[2].trim()} -> ${match[1]}`);
  }
  console.log(`Total found on page 1: ${count}`);
}

testKitapyurduCatalog().catch(console.error);
