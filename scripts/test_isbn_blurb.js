const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (redirectUrl.startsWith("/")) {
            const u = new URL(url);
            redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
          }
          return get(redirectUrl).then(resolve).catch(reject);
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    ).on("error", reject);
  });
}

async function testIsbnBlurb() {
  const isbns = [
    { no: 1, title: "Dune", isbn: "9786053754794" },
    { no: 6, title: "Dr. Moreau'nun Adası", isbn: "9789758607273" },
    { no: 28, title: "Yenilmez", isbn: "9786053757337" },
  ];

  for (const item of isbns) {
    console.log(`Searching ISBN ${item.isbn} for #${item.no} ${item.title}...`);
    const searchUrl = `https://www.ithakiyayingrubu.com/search?q=${item.isbn}`;
    const sHtml = await get(searchUrl);
    
    // Find product card link
    const cardMatch = sHtml.match(/class="product-card[\s\S]*?href="?([^\s">]+)"?/i);
    if (cardMatch && cardMatch[1]) {
      let rawHref = cardMatch[1].replace(/["']/g, "");
      let pUrl = rawHref.startsWith("http") ? rawHref : `https://www.ithakiyayingrubu.com${rawHref}`;
      console.log(`  -> Found product URL: ${pUrl}`);
      const pHtml = await get(pUrl);
      const descMatch = pHtml.match(/<div class="product-details-preview"[^>]*>([\s\S]*?)<\/div>/i) ||
                        pHtml.match(/<div class="full-description"[^>]*>([\s\S]*?)<\/div>/i);
      if (descMatch) {
        const cleanDesc = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        console.log(`  ✓ Blurb: ${cleanDesc.slice(0, 180)}...`);
      }
    } else {
      console.warn(`  ✗ No product URL found for ISBN ${item.isbn}`);
    }
  }
}

testIsbnBlurb().catch(console.error);
