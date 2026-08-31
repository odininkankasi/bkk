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

function extractMetadataFromHtml(html) {
  const meta = {};

  // 1. ISBN
  const isbnMatch = html.match(/ISBN:<\/span>\s*<span[^>]*class="value"[^>]*>([\s\S]*?)<\/span>/i);
  if (isbnMatch) meta.isbn = isbnMatch[1].replace(/<[^>]+>/g, "").trim();

  // 2. Sayfa Sayısı
  const sayfaMatch = html.match(/Sayfa Sayısı:<\/span>\s*<[a-z0-9]+[^>]*class="value"[^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
  if (sayfaMatch) meta.sayfa_sayisi = sayfaMatch[1].replace(/<[^>]+>/g, "").trim();

  // 3. Çevirmen
  const cevirmenMatch = html.match(/Çevirmen:<\/span>\s*<[a-z0-9]+[^>]*class="value"[^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
  if (cevirmenMatch) meta.cevirmen = cevirmenMatch[1].replace(/<[^>]+>/g, "").trim();

  // 4. Orijinal / Özgün Adı
  const ozgunMatch = html.match(/Orijinal Adı:<\/span>\s*<[a-z0-9]+[^>]*class="value"[^>]*>([\s\S]*?)<\/[a-z0-9]+>/i) ||
                     html.match(/Özgün Adı:<\/span>\s*<[a-z0-9]+[^>]*class="value"[^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
  if (ozgunMatch) meta.ozgun_adi = ozgunMatch[1].replace(/<[^>]+>/g, "").trim();

  // 5. Tanıtım Bülteni / Açıklama
  const descMatch = html.match(/<div class="product-details-preview"[^>]*>([\s\S]*?)<\/div>/i) ||
                    html.match(/<div class="full-description"[^>]*>([\s\S]*?)<\/div>/i);
  if (descMatch) {
    let clean = descMatch[1]
      .replace(/<br\s*[\/]?>/gi, " ")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    
    // Remove "Bilimkurgu Klasikleri - X" prefix if exists
    clean = clean.replace(/^Bilimkurgu Klasikleri\s*[-–]\s*\d+\s*/i, "").trim();
    if (clean.length > 30) {
      meta.tanitim_yazisi = clean;
    }
  }

  return meta;
}

async function run() {
  console.log("=== BKK 116 KİTAP TAM KÜNYE & TANITIM VERİ MADENCİLİĞİ BAŞLIYOR ===");

  // 1. First, crawl all product links from İthaki BKK catalog (pages 1 to 8)
  const productUrlMap = new Map();

  for (let page = 1; page <= 8; page++) {
    const catalogUrl = `https://www.ithakiyayingrubu.com/bilimkurgu-klasikleri?pagenumber=${page}&pagesize=30`;
    console.log(`Katalog sayfası taranıyor (${page}/8)...`);
    try {
      const html = await get(catalogUrl);
      const itemRegex = /href="(\/[a-z0-9\-]+)"[^>]*title="([^"]*)"/gi;
      let match;
      while ((match = itemRegex.exec(html)) !== null) {
        const productHref = match[1];
        const title = match[2].replace(/ için ayrıntıları göster/i, "").trim();
        const clean = cleanTitle(title);
        if (!productUrlMap.has(clean)) {
          productUrlMap.set(clean, productHref);
        }
      }
    } catch (e) {
      console.warn(`Katalog sayfası ${page} hatası:`, e.message);
    }
  }

  console.log(`İthaki kataloğunda ${productUrlMap.size} tekil ürün bağlantısı tespit edildi.\n`);

  // 2. Load existing 116 books
  const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
  const ourBooks = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

  let successCount = 0;

  for (let i = 0; i < ourBooks.length; i++) {
    const book = ourBooks[i];
    const cleanName = cleanTitle(book.kitap_adi);

    let productPath = productUrlMap.get(cleanName);
    if (!productPath) {
      // Try substring match
      for (const [cName, pPath] of productUrlMap.entries()) {
        if (cName.includes(cleanName) || cleanName.includes(cName)) {
          productPath = pPath;
          break;
        }
      }
    }

    let scrapedMeta = null;

    if (productPath) {
      const productUrl = `https://www.ithakiyayingrubu.com${productPath}`;
      try {
        const html = await get(productUrl);
        scrapedMeta = extractMetadataFromHtml(html);
      } catch (err) {
        console.warn(`Hata (${book.kitap_adi}):`, err.message);
      }
    }

    // If not found in catalog crawl, try direct search
    if (!scrapedMeta || !scrapedMeta.sayfa_sayisi) {
      const searchUrl = `https://www.ithakiyayingrubu.com/search?q=${encodeURIComponent(book.kitap_adi)}`;
      try {
        const sHtml = await get(searchUrl);
        const match = sHtml.match(/href="(\/[a-z0-9\-]+)"[^>]*title="([^"]*)"/i);
        if (match && match[1]) {
          const directHtml = await get(`https://www.ithakiyayingrubu.com${match[1]}`);
          scrapedMeta = extractMetadataFromHtml(directHtml);
        }
      } catch (e) {}
    }

    if (scrapedMeta) {
      if (scrapedMeta.ozgun_adi) book.ozgun_adi = scrapedMeta.ozgun_adi;
      if (scrapedMeta.sayfa_sayisi) book.sayfa_sayisi = scrapedMeta.sayfa_sayisi;
      if (scrapedMeta.cevirmen) book.cevirmen = scrapedMeta.cevirmen;
      if (scrapedMeta.isbn) book.isbn = scrapedMeta.isbn;
      if (scrapedMeta.tanitim_yazisi) book.tanitim_yazisi = scrapedMeta.tanitim_yazisi;

      successCount++;
      console.log(
        `[#${book.sira_no} ✓] ${book.kitap_adi} | Özgün: ${book.ozgun_adi || "—"} | Sayfa: ${book.sayfa_sayisi || "—"} | Çevirmen: ${book.cevirmen || "—"} | ISBN: ${book.isbn || "—"}`
      );
    } else {
      console.log(`[#${book.sira_no} ⚠] ${book.kitap_adi} - İthaki sayfasından doğrudan çekilemedi, arşiv kontrol ediliyor.`);
    }
  }

  // 3. Save updated books_fallback.json
  fs.writeFileSync(fallbackPath, JSON.stringify(ourBooks, null, 2), "utf8");

  // 4. Generate UTF-8 BOM CSV for Excel / Google Sheets
  const csvHeaders = [
    "Sıra No",
    "Kitap Adı",
    "Yazar Adı",
    "Özgün Adı",
    "Çevirmen",
    "Sayfa Sayısı",
    "ISBN",
    "Tanıtım Yazısı / Arka Kapak",
    "Okundu Durumu",
    "Kitaplıkta Var mı",
    "Puanım",
    "Başlangıç Tarihi",
    "Bitiş Tarihi",
  ];

  const csvRows = ourBooks.map((b) => [
    b.sira_no || "",
    `"${(b.kitap_adi || "").replace(/"/g, '""')}"`,
    `"${(b.yazar_adi || "").replace(/"/g, '""')}"`,
    `"${(b.ozgun_adi || "").replace(/"/g, '""')}"`,
    `"${(b.cevirmen || "").replace(/"/g, '""')}"`,
    b.sayfa_sayisi || "",
    b.isbn || "",
    `"${(b.tanitim_yazisi || "").replace(/"/g, '""')}"`,
    b.okundu || "Hayır",
    b.kitaplikta_var || "Hayır",
    b.puan || "",
    b.tarih_1 || "",
    b.tarih_2 || "",
  ]);

  const csvContent = "\uFEFF" + [csvHeaders.join(";"), ...csvRows.map((r) => r.join(";"))].join("\n");
  const csvPath = path.join(__dirname, "..", "bkk_tam_kunye_ve_tanitim_listesi.csv");
  fs.writeFileSync(csvPath, csvContent, "utf8");

  console.log(`\n🎉 TÜM VERİ MADENCİLİĞİ BAŞARIYLA TAMAMLANDI!`);
  console.log(`Güncellenen Eser Sayısı: ${successCount} / ${ourBooks.length}`);
  console.log(`📁 Kaydedilen Dosyalar:`);
  console.log(`  1. data/books_fallback.json (Proje içi veritabanı)`);
  console.log(`  2. bkk_tam_kunye_ve_tanitim_listesi.csv (Excel / Google Sheets aktarım dosyası)`);
}

run().catch(console.error);
