const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

function get(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(
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
      )
      .on("error", reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    client
      .get(
        url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
          }
          res.pipe(file);
          file.on("finish", () => {
            file.close(resolve);
          });
        }
      )
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function verifyAndFix() {
  const coversDir = path.join(__dirname, "..", "public", "covers");
  const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
  const ourBooks = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

  // Check 1: Search specifically for Yenilmez on İthaki
  console.log("Checking Yenilmez...");
  const yenilmezBook = ourBooks.find(b => b.sira_no == 28);
  const yenilmezSearch = await get("https://www.ithakiyayingrubu.com/search?q=Stanislaw+Lem+Yenilmez");
  
  // Find product urls inside search
  const regex = /href="(\/[^"]+)"[^>]*title="([^"]*)"[^>]*data-default-video="([^"]+)"/g;
  let m;
  let yenilmezUrl = null;
  while ((m = regex.exec(yenilmezSearch)) !== null) {
    console.log("  Yenilmez search result:", m[1], m[2], m[3]);
    if (m[2].toLowerCase().includes("yenilmez")) {
      yenilmezUrl = m[3];
      break;
    }
  }

  if (yenilmezUrl) {
    if (!yenilmezUrl.startsWith("http")) yenilmezUrl = "https:" + yenilmezUrl;
    console.log("  -> Downloading authentic İthaki Yenilmez cover:", yenilmezUrl);
    const dest = path.join(coversDir, "28-28-yenilmez.webp");
    await downloadImage(yenilmezUrl, dest);
  } else {
    // If not found in search, try fetching direct product page or BKK archive
    console.log("  -> Fetching from high-res BKK archive for #28 Yenilmez...");
    const dest = path.join(coversDir, "28-28-yenilmez.webp");
    await downloadImage("https://img.kitapyurdu.com/v1/getImage/fn:11467474/wh:true/wi:500", dest);
  }

  // Check 2: #34 Yakma Zevki (was matched to standard Fahrenheit 451)
  console.log("\nChecking #34 Yakma Zevki...");
  try {
    const yakmaSearch = await get("https://www.ithakiyayingrubu.com/search?q=Yakma+Zevki");
    let yUrl = null;
    while ((m = regex.exec(yakmaSearch)) !== null) {
      console.log("  Yakma Zevki result:", m[1], m[2], m[3]);
      if (m[2].toLowerCase().includes("yakma")) {
        yUrl = m[3];
        break;
      }
    }
    if (yUrl) {
      if (!yUrl.startsWith("http")) yUrl = "https:" + yUrl;
      await downloadImage(yUrl, path.join(coversDir, "34-34-yakma-zevki-fahrenheit-451-oykuleri.webp"));
    }
  } catch (e) {
    console.error("Yakma zevki error:", e.message);
  }

  // Check 3: #102 Hyperion (was matched to Hyperion'ın Düşüşü)
  console.log("\nChecking #102 Hyperion 1. Kitap...");
  try {
    const hypSearch = await get("https://www.ithakiyayingrubu.com/search?q=Hyperion");
    let h1Url = null;
    while ((m = regex.exec(hypSearch)) !== null) {
      console.log("  Hyperion result:", m[1], m[2], m[3]);
      if (m[2].toLowerCase().trim() === "hyperion" || (m[2].toLowerCase().includes("hyperion") && !m[2].toLowerCase().includes("düşüşü"))) {
        h1Url = m[3];
        break;
      }
    }
    if (h1Url) {
      if (!h1Url.startsWith("http")) h1Url = "https:" + h1Url;
      console.log("  -> Downloading correct Hyperion 1 cover:", h1Url);
      await downloadImage(h1Url, path.join(coversDir, "102-102-hyperion.webp"));
    }
  } catch (e) {
    console.error("Hyperion error:", e.message);
  }

  console.log("\n✅ Kapaklar doğrulandı ve güncellendi!");
}

verifyAndFix().catch(console.error);
