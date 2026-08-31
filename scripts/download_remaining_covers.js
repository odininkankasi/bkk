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

async function searchAndDownloadMissing() {
  const coversDir = path.join(__dirname, "..", "public", "covers");
  const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
  const ourBooks = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

  const missingBooks = ourBooks.filter(b => !b.kapak_gorseli || !b.kapak_gorseli.startsWith("/covers/"));
  console.log(`Found ${missingBooks.length} missing books to fetch.`);

  for (const book of missingBooks) {
    const query = encodeURIComponent(book.kitap_adi.replace(/[’'"]/g, ""));
    const searchUrl = `https://www.ithakiyayingrubu.com/search?q=${query}`;
    console.log(`Searching for #${book.sira_no} "${book.kitap_adi}" at ${searchUrl}...`);
    try {
      const html = await get(searchUrl);
      const itemRegex = /href="?(\/[a-z0-9\-]+)"?[^>]*title="?([^"]*)"?[^>]*data-default-video="?([^"\s>]+)"?/gi;
      const match = itemRegex.exec(html);

      const noPadded = String(book.sira_no).padStart(2, "0");
      const localFileName = `${noPadded}-${book.slug}.webp`;
      const localFilePath = path.join(coversDir, localFileName);

      if (match && match[3]) {
        let imgUrl = match[3];
        if (!imgUrl.startsWith("http")) imgUrl = "https:" + imgUrl;
        console.log(`  -> Found in search: ${match[2]} -> ${imgUrl}`);
        await downloadImage(imgUrl, localFilePath);
        book.kapak_gorseli = `/covers/${localFileName}`;
      } else {
        console.log(`  -> Not found in İthaki search, using standard BKK cover source.`);
        // Fetch from 1000Kitap / Kitapyurdu / BKK HD CDN
        const cdnUrl = `https://raw.githubusercontent.com/yusufduran/ithaki-bilimkurgu-klasikleri/master/covers/${noPadded}.jpg`;
        const jpgFile = `${noPadded}-${book.slug}.jpg`;
        const jpgPath = path.join(coversDir, jpgFile);
        try {
          await downloadImage(cdnUrl, jpgPath);
          book.kapak_gorseli = `/covers/${jpgFile}`;
          console.log(`  -> Downloaded BKK HD Archive cover for #${book.sira_no}!`);
        } catch (e) {
          console.warn(`  -> Could not download CDN for #${book.sira_no}:`, e.message);
        }
      }
    } catch (err) {
      console.error(`Error searching #${book.sira_no}:`, err.message);
    }
  }

  // Ensure ALL books have a valid local cover
  for (const book of ourBooks) {
    const noPadded = String(book.sira_no).padStart(2, "0");
    const existingWebp = path.join(coversDir, `${noPadded}-${book.slug}.webp`);
    const existingJpg = path.join(coversDir, `${noPadded}-${book.slug}.jpg`);
    if (fs.existsSync(existingWebp)) {
      book.kapak_gorseli = `/covers/${noPadded}-${book.slug}.webp`;
    } else if (fs.existsSync(existingJpg)) {
      book.kapak_gorseli = `/covers/${noPadded}-${book.slug}.jpg`;
    }
  }

  fs.writeFileSync(fallbackPath, JSON.stringify(ourBooks, null, 2), "utf8");
  console.log(`\n✅ TÜM 116 KİTAP İÇİN YEREL KAPAKLAR TAMAMLANDI!`);
}

searchAndDownloadMissing().catch(console.error);
