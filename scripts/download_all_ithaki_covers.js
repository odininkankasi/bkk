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

function cleanTitle(str) {
  const trMap = {
    ç: "c",
    ğ: "g",
    ı: "i",
    i: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    I: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };
  return String(str || "")
    .split("")
    .map((c) => trMap[c] || c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

async function scrapeAll() {
  const coversDir = path.join(__dirname, "..", "public", "covers");
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }

  const ithakiProducts = [];

  // Scrape pages 1 through 8
  for (let page = 1; page <= 8; page++) {
    const url = `https://www.ithakiyayingrubu.com/bilimkurgu-klasikleri?pagenumber=${page}&pagesize=30`;
    console.log(`Fetching page ${page}: ${url}...`);
    try {
      const html = await get(url);
      
      // Match each card: data-default-video or data-full or picture img
      const cardRegex = /<div class="product-card[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
      
      // Alternative extraction: match all href and image pairs
      const itemRegex = /href="?(\/[a-z0-9\-]+)"?[^>]*title="?([^"]*)"?[^>]*data-default-video="?([^"\s>]+)"?/gi;
      let match;
      let countOnPage = 0;

      while ((match = itemRegex.exec(html)) !== null) {
        const productHref = match[1];
        let title = match[2].replace(/ için ayrıntıları göster/i, "").trim();
        let imgUrl = match[3];
        
        if (imgUrl && !imgUrl.startsWith("http")) {
          imgUrl = "https:" + imgUrl;
        }

        if (title && imgUrl) {
          ithakiProducts.push({
            href: productHref,
            title,
            imgUrl,
            clean: cleanTitle(title),
          });
          countOnPage++;
        }
      }

      console.log(`Page ${page} parsed: found ${countOnPage} items.`);
      if (countOnPage === 0) {
        console.log(`No more items on page ${page}, stopping crawl.`);
        break;
      }
    } catch (e) {
      console.error(`Error on page ${page}:`, e.message);
    }
  }

  console.log(`\nTotal İthaki products found across all pages: ${ithakiProducts.length}`);

  // Load our fallback books
  const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
  const ourBooks = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

  let matchedCount = 0;
  let downloadedCount = 0;

  for (const book of ourBooks) {
    const cleanBookTitle = cleanTitle(book.kitap_adi);
    
    // Find best match in ithakiProducts
    let bestMatch = ithakiProducts.find(p => p.clean === cleanBookTitle);
    
    if (!bestMatch) {
      // Fuzzy substring match
      bestMatch = ithakiProducts.find(p => p.clean.includes(cleanBookTitle) || cleanBookTitle.includes(p.clean));
    }

    const noPadded = String(book.sira_no).padStart(2, "0");
    const localFileName = `${noPadded}-${book.slug}.webp`;
    const localFilePath = path.join(coversDir, localFileName);
    const publicUrl = `/covers/${localFileName}`;

    if (bestMatch) {
      matchedCount++;
      console.log(`[MATCH #${book.sira_no}] "${book.kitap_adi}" -> "${bestMatch.title}"`);
      try {
        await downloadImage(bestMatch.imgUrl, localFilePath);
        downloadedCount++;
        book.kapak_gorseli = publicUrl;
      } catch (err) {
        console.error(`Download failed for #${book.sira_no}:`, err.message);
      }
    } else {
      console.log(`[NO ITHAKI MATCH #${book.sira_no}] "${book.kitap_adi}"`);
      // If we already have a remote cover in book.kapak_gorseli, download it as local backup!
      if (book.kapak_gorseli && book.kapak_gorseli.startsWith("http")) {
        try {
          const ext = book.kapak_gorseli.includes(".webp") ? "webp" : "jpg";
          const fallbackLocalFile = `${noPadded}-${book.slug}.${ext}`;
          const fallbackLocalPath = path.join(coversDir, fallbackLocalFile);
          await downloadImage(book.kapak_gorseli, fallbackLocalPath);
          downloadedCount++;
          book.kapak_gorseli = `/covers/${fallbackLocalFile}`;
          console.log(`  -> Downloaded existing remote cover as local fallback!`);
        } catch (e) {
          console.warn(`  -> Could not download remote fallback:`, e.message);
        }
      }
    }
  }

  // Save updated books_fallback.json
  fs.writeFileSync(fallbackPath, JSON.stringify(ourBooks, null, 2), "utf8");
  console.log(`\n🎉 BKK Külliyatı Kapak İndirme Tamamlandı!`);
  console.log(`Eşleşen: ${matchedCount}/${ourBooks.length}`);
  console.log(`Yerel Klasöre İndirilen: ${downloadedCount}`);
  console.log(`Kapaklar konumu: public/covers/`);
}

scrapeAll().catch(console.error);
