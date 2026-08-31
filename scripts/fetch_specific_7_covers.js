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

async function findKitapyurduCover(query) {
  const searchUrl = `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encodeURIComponent(query + " İthaki Yayınları")}`;
  console.log(`Searching Kitapyurdu for: ${query}...`);
  const html = await get(searchUrl);
  
  // Find product img from kitapyurdu search
  const imgRegex = /https:\/\/img\.kitapyurdu\.com\/v1\/getImage\/fn:\d+\/wh:true\/wi:\d+/g;
  const matches = html.match(imgRegex);
  if (matches && matches.length > 0) {
    // Replace wi:xxx with wi:500 for high resolution
    const highRes = matches[0].replace(/wi:\d+/, "wi:600");
    console.log(`  -> Found Kitapyurdu HD image: ${highRes}`);
    return highRes;
  }
  return null;
}

async function run() {
  const coversDir = path.join(__dirname, "..", "public", "covers");

  const targetBooks = [
    { no: "06", slug: "06-06-dr-moreau-nun-adasi", query: "Doktor Moreau'nun Adası İthaki" },
    { no: "28", slug: "28-28-yenilmez", query: "Yenilmez Stanislaw Lem İthaki" },
    { no: "30", slug: "30-30-yuzyilin-en-iyi-bilimkurgu-oykuleri", query: "Yüzyılın En İyi Bilimkurgu Öyküleri İthaki" },
    { no: "40", slug: "40-40-yaban-diyarlardaki-yabanci", query: "Yaban Diyarlardaki Yabancı İthaki" },
    { no: "48", slug: "48-48-phlebas-i-hatirla", query: "Phlebas'ı Hatırla İthaki" },
    { no: "50", slug: "50-50-iskencecinin-golgesi", query: "İşkencecinin Gölgesi İthaki" },
    { no: "52", slug: "52-52-uzlastiricinin-pencesi", query: "Uzlaştırıcının Pençesi İthaki" },
  ];

  for (const b of targetBooks) {
    const imgUrl = await findKitapyurduCover(b.query);
    if (imgUrl) {
      // Save as webp or jpg
      const destJpg = path.join(coversDir, `${b.slug}.jpg`);
      const destWebp = path.join(coversDir, `${b.slug}.webp`);
      await downloadImage(imgUrl, destJpg);
      await downloadImage(imgUrl, destWebp);
      console.log(`  ✓ Saved for #${b.no}`);
    } else {
      console.warn(`  ✗ Could not find for #${b.no}`);
    }
  }
}

run().catch(console.error);
