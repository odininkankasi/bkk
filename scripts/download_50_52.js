const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

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

  console.log("Downloading #50 İşkencecinin Gölgesi...");
  await downloadImage(
    "https://i.dr.com.tr/cache/600x600-0/originals/0001846258001-1.jpg",
    path.join(coversDir, "50-50-iskencecinin-golgesi.webp")
  );
  console.log("  ✓ Saved #50");

  console.log("Downloading #52 Uzlaştırıcının Pençesi...");
  await downloadImage(
    "https://i.dr.com.tr/cache/600x600-0/originals/0001869209001-1.jpg",
    path.join(coversDir, "52-52-uzlastiricinin-pencesi.webp")
  );
  console.log("  ✓ Saved #52");
}

run().catch(console.error);
