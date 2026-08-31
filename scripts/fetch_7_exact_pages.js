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

async function fix7Covers() {
  const coversDir = path.join(__dirname, "..", "public", "covers");

  const specificPages = [
    {
      no: "06",
      file: "06-06-dr-moreau-nun-adasi.webp",
      url: "https://www.ithakiyayingrubu.com/doktor-moreaunun-adasi",
    },
    {
      no: "28",
      file: "28-28-yenilmez.webp",
      url: "https://www.ithakiyayingrubu.com/yenilmez-28",
    },
    {
      no: "30",
      file: "30-30-yuzyilin-en-iyi-bilimkurgu-oykuleri.webp",
      url: "https://www.ithakiyayingrubu.com/yuzyilin-en-iyi-bilimkurgu-oykuleri",
    },
    {
      no: "40",
      file: "40-40-yaban-diyarlardaki-yabanci.webp",
      url: "https://www.ithakiyayingrubu.com/yaban-diyarlardaki-yabanci",
    },
    {
      no: "48",
      file: "48-48-phlebas-i-hatirla.webp",
      url: "https://www.ithakiyayingrubu.com/phlebasi-hatirla",
    },
    {
      no: "50",
      file: "50-50-iskencecinin-golgesi.webp",
      url: "https://www.ithakiyayingrubu.com/iskencecinin-golgesi-yeni-gunes-kitabi-1",
    },
    {
      no: "52",
      file: "52-52-uzlastiricinin-pencesi.webp",
      url: "https://www.ithakiyayingrubu.com/uzlastiricinin-pencesi-yeni-gunes-kitabi-2",
    },
  ];

  for (const item of specificPages) {
    console.log(`Checking #${item.no} at ${item.url}...`);
    try {
      const html = await get(item.url);
      // Find main product image
      const imgMatch = html.match(/https:\/\/wwwithakiyayingrubucom\.sm\.mncdn\.com\/wwwithakiyayingrubucom-pictures\/[a-z0-9\-_]+\.(webp|jpg|png)/gi);
      if (imgMatch && imgMatch.length > 0) {
        // Pick high res image
        const bestImg = imgMatch.find(u => u.includes("_800") || u.includes("_600")) || imgMatch[0];
        console.log(`  -> Found İthaki CDN image: ${bestImg}`);
        const dest = path.join(coversDir, item.file);
        await downloadImage(bestImg, dest);
        console.log(`  ✓ Saved ${item.file}`);
      } else {
        console.warn(`  ✗ No picture URL found in HTML for #${item.no}`);
      }
    } catch (e) {
      console.error(`  ✗ Error on #${item.no}:`, e.message);
    }
  }
}

fix7Covers().catch(console.error);
