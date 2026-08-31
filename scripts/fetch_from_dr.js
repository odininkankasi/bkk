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

async function run() {
  const coversDir = path.join(__dirname, "..", "public", "covers");

  // 1. #28 Yenilmez direct İthaki URL
  console.log("Downloading #28 Yenilmez...");
  await downloadImage(
    "https://wwwithakiyayingrubucom.sm.mncdn.com/wwwithakiyayingrubucom-pictures/b32a7a64-1353-44bd-8a31-a4e5a09bcca6_yenlmez.webp",
    path.join(coversDir, "28-28-yenilmez.webp")
  );

  // 2. Direct verified CDN image URLs for BKK titles
  const verifiedCovers = [
    {
      no: "30",
      file: "30-30-yuzyilin-en-iyi-bilimkurgu-oykuleri.webp",
      url: "https://i.dr.com.tr/cache/600x600-0/originals/0001748232001-1.jpg",
    },
    {
      no: "40",
      file: "40-40-yaban-diyarlardaki-yabanci.webp",
      url: "https://i.dr.com.tr/cache/600x600-0/originals/0001790938001-1.jpg",
    },
    {
      no: "50",
      file: "50-50-iskencecinin-golgesi.webp",
      url: "https://i.dr.com.tr/cache/600x600-0/originals/0001844976001-1.jpg",
    },
    {
      no: "52",
      file: "52-52-uzlastiricinin-pencesi.webp",
      url: "https://i.dr.com.tr/cache/600x600-0/originals/0001867160001-1.jpg",
    },
  ];

  for (const item of verifiedCovers) {
    console.log(`Downloading #${item.no} from ${item.url}...`);
    try {
      await downloadImage(item.url, path.join(coversDir, item.file));
      console.log(`  ✓ Saved #${item.no}`);
    } catch (e) {
      console.error(`  ✗ Failed #${item.no}:`, e.message);
    }
  }
}

run().catch(console.error);
