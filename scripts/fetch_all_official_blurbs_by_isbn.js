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

function cleanDesc(str) {
  if (!str) return "";
  return str
    .replace(/<br\s*[\/]?>/gi, " ")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^Bilimkurgu Klasikleri\s*[-–]\s*\d+\s*/i, "")
    .trim();
}

async function run() {
  const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
  const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

  console.log(`=== 116 KİTABIN RESMİ TANITIM BÜLTENLERİ ISBN İLE ÇEKİLİYOR ===`);

  let fetched = 0;

  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    if (!b.isbn) {
      console.warn(`[#${b.sira_no}] ISBN yok!`);
      continue;
    }

    try {
      const searchUrl = `https://www.ithakiyayingrubu.com/search?q=${b.isbn}`;
      const sHtml = await get(searchUrl);

      // Find product card link
      const cardMatch = sHtml.match(/class="product-card[\s\S]*?href="?([^\s">]+)"?/i);
      let blurb = "";

      if (cardMatch && cardMatch[1]) {
        let rawHref = cardMatch[1].replace(/["']/g, "");
        let pUrl = rawHref.startsWith("http") ? rawHref : `https://www.ithakiyayingrubu.com${rawHref}`;
        const pHtml = await get(pUrl);

        const descMatch =
          pHtml.match(/<div class="product-details-preview"[^>]*>([\s\S]*?)<\/div>/i) ||
          pHtml.match(/<div class="full-description"[^>]*>([\s\S]*?)<\/div>/i);

        if (descMatch) {
          blurb = cleanDesc(descMatch[1]);
        }
      }

      // If not on İthaki search, check DR / Kitapyurdu by ISBN
      if (!blurb || blurb.length < 30) {
        try {
          const kyUrl = `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${b.isbn}`;
          const kyHtml = await get(kyUrl);
          const pLinkMatch = kyHtml.match(/href="(https:\/\/www\.kitapyurdu\.com\/kitap\/[a-z0-9\-]+\/\d+\.html)"/i);
          if (pLinkMatch && pLinkMatch[1]) {
            const kyProdHtml = await get(pLinkMatch[1]);
            const kyDesc = kyProdHtml.match(/<span[^>]*id="info__text"[^>]*>([\s\S]*?)<\/span>/i) ||
                           kyProdHtml.match(/<div[^>]*class="info__text"[^>]*>([\s\S]*?)<\/div>/i);
            if (kyDesc) blurb = cleanDesc(kyDesc[1]);
          }
        } catch (e) {}
      }

      if (blurb && blurb.length > 20) {
        b.tanitim_yazisi = blurb;
        fetched++;
        console.log(`[#${b.sira_no} ✓] ${b.kitap_adi} (${b.isbn}): ${blurb.slice(0, 100)}...`);
      } else {
        console.warn(`[#${b.sira_no} ⚠] ${b.kitap_adi} (${b.isbn}): Tanıtım metni bulunamadı.`);
      }
    } catch (err) {
      console.error(`[#${b.sira_no} ✗] ${b.kitap_adi} Hata:`, err.message);
    }
  }

  // Save updated fallback json
  fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

  // Save updated CSV for Excel / Google Sheets
  const csvHeaders = [
    "Sıra No",
    "Kitap Adı",
    "Yazar Adı",
    "Özgün Adı",
    "Çevirmen",
    "Sayfa Sayısı",
    "ISBN",
    "Kapak Görseli",
    "Tanıtım Yazısı / Arka Kapak",
  ];

  const csvRows = books.map((b) => [
    b.sira_no || "",
    `"${(b.kitap_adi || "").replace(/"/g, '""')}"`,
    `"${(b.yazar_adi || "").replace(/"/g, '""')}"`,
    `"${(b.ozgun_adi || "").replace(/"/g, '""')}"`,
    `"${(b.cevirmen || "").replace(/"/g, '""')}"`,
    b.sayfa_sayisi || "",
    b.isbn || "",
    b.kapak_gorseli || "",
    `"${(b.tanitim_yazisi || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "\uFEFF" + [csvHeaders.join(";"), ...csvRows.map((r) => r.join(";"))].join("\n");
  fs.writeFileSync(path.join(__dirname, "..", "bkk_tam_kunye_ve_tanitim_listesi.csv"), csvContent, "utf8");

  console.log(`\n🎉 İŞLEM BİTTİ! Toplam ${fetched} / ${books.length} kitabın tanıtım yazısı başarıyla eklendi.`);
}

run().catch(console.error);
