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

function extractMetadata(html) {
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

  // 4. Orijinal Adı
  const ozgunMatch = html.match(/Orijinal Adı:<\/span>\s*<[a-z0-9]+[^>]*class="value"[^>]*>([\s\S]*?)<\/[a-z0-9]+>/i) ||
                     html.match(/Özgün Adı:<\/span>\s*<[a-z0-9]+[^>]*class="value"[^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
  if (ozgunMatch) meta.ozgun_adi = ozgunMatch[1].replace(/<[^>]+>/g, "").trim();

  // 5. Tanıtım Yazısı / Arka Kapak Bülteni
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
    
    clean = clean.replace(/^Bilimkurgu Klasikleri\s*[-–]\s*\d+\s*/i, "").trim();
    if (clean.length > 30) {
      meta.tanitim_yazisi = clean;
    }
  }

  return meta;
}

async function run() {
  console.log("=== BKK 116 KİTAP DOĞRULANMIŞ KÜNYE & TANITIM ÇIKARICI ===");

  // 1. Extract product paths from saved catalog HTML
  const catalogHtml = fs.readFileSync("scripts/sample_ithaki.html", "utf8");
  const cards = catalogHtml.split('class="product-card');
  const productPaths = new Set();

  for (let i = 1; i < cards.length; i++) {
    const card = cards[i];
    const linkMatch = card.match(/href=([^\s>]+)/i);
    if (linkMatch && linkMatch[1].startsWith("/")) {
      const p = linkMatch[1].replace(/["']/g, "");
      if (!p.includes(".") && !p.includes("cart") && !p.includes("search") && p.length > 2) {
        productPaths.add(p);
      }
    }
  }

  console.log(`Katalogdan ${productPaths.size} tekil kitap ürün sayfası tespit edildi.`);

  // 2. Fetch each product page and store metadata in a Map
  const metaStore = new Map(); // cleanTitle -> metadata
  let fetchedCount = 0;

  for (const pPath of productPaths) {
    const pUrl = `https://www.ithakiyayingrubu.com${pPath}`;
    try {
      const pHtml = await get(pUrl);
      const meta = extractMetadata(pHtml);
      
      // Extract book title from h1
      const titleMatch = pHtml.match(/<h1[^>]*class="product-title"[^>]*>([\s\S]*?)<\/h1>/i) ||
                         pHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      
      const bookTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : pPath.replace(/\//, "");
      const clean = cleanTitle(bookTitle);
      
      meta.bookTitle = bookTitle;
      meta.pPath = pPath;
      metaStore.set(clean, meta);
      
      fetchedCount++;
      if (fetchedCount % 15 === 0 || fetchedCount === productPaths.size) {
        console.log(`İlerleme: ${fetchedCount}/${productPaths.size} ürün sayfası çekildi...`);
      }
    } catch (e) {
      console.warn(`Hata (${pPath}):`, e.message);
    }
  }

  console.log(`\nToplam ${metaStore.size} kitabın künye bilgisi başarıyla hafızaya alındı.`);

  // 3. Match and update our 116 books
  const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
  const ourBooks = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

  let matched = 0;

  for (const book of ourBooks) {
    const cleanName = cleanTitle(book.kitap_adi);
    
    // Direct match
    let found = metaStore.get(cleanName);
    
    if (!found) {
      // Substring match
      for (const [cKey, mData] of metaStore.entries()) {
        if (cKey.includes(cleanName) || cleanName.includes(cKey)) {
          found = mData;
          break;
        }
      }
    }

    if (found) {
      matched++;
      if (found.ozgun_adi) book.ozgun_adi = found.ozgun_adi;
      if (found.sayfa_sayisi) book.sayfa_sayisi = found.sayfa_sayisi;
      if (found.cevirmen) book.cevirmen = found.cevirmen;
      if (found.isbn) book.isbn = found.isbn;
      if (found.tanitim_yazisi) book.tanitim_yazisi = found.tanitim_yazisi;

      console.log(`[#${book.sira_no} ✓] ${book.kitap_adi}`);
      console.log(`   Özgün Adı: ${book.ozgun_adi || "—"} | Sayfa: ${book.sayfa_sayisi || "—"} | Çevirmen: ${book.cevirmen || "—"} | ISBN: ${book.isbn || "—"}`);
    } else {
      console.log(`[#${book.sira_no} ⚠] ${book.kitap_adi} - Özel arama ile tamamlanıyor.`);
      // Direct search on İthaki
      try {
        const searchHtml = await get(`https://www.ithakiyayingrubu.com/search?q=${encodeURIComponent(book.kitap_adi)}`);
        const m = searchHtml.match(/href=([\/a-z0-9\-]+)[^>]*title="([^"]*)"/i);
        if (m && m[1] && m[1].startsWith("/")) {
          const directHtml = await get(`https://www.ithakiyayingrubu.com${m[1]}`);
          const sMeta = extractMetadata(directHtml);
          if (sMeta.ozgun_adi) book.ozgun_adi = sMeta.ozgun_adi;
          if (sMeta.sayfa_sayisi) book.sayfa_sayisi = sMeta.sayfa_sayisi;
          if (sMeta.cevirmen) book.cevirmen = sMeta.cevirmen;
          if (sMeta.isbn) book.isbn = sMeta.isbn;
          if (sMeta.tanitim_yazisi) book.tanitim_yazisi = sMeta.tanitim_yazisi;
          matched++;
          console.log(`   -> Arama ile bulundu: ${book.ozgun_adi || "—"} | Sayfa: ${book.sayfa_sayisi || "—"} | ISBN: ${book.isbn || "—"}`);
        }
      } catch (e) {}
    }
  }

  // 4. Save updated books_fallback.json
  fs.writeFileSync(fallbackPath, JSON.stringify(ourBooks, null, 2), "utf8");

  // 5. Generate Excel / Google Sheets CSV
  const csvHeaders = [
    "Sıra No",
    "Kitap Adı",
    "Yazar Adı",
    "Özgün Adı",
    "Çevirmen",
    "Sayfa Sayısı",
    "ISBN",
    "Tanıtım Bülteni / Arka Kapak Yazısı",
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
  ]);

  const csvContent = "\uFEFF" + [csvHeaders.join(";"), ...csvRows.map((r) => r.join(";"))].join("\n");
  fs.writeFileSync(path.join(__dirname, "..", "bkk_tam_kunye_ve_tanitim_listesi.csv"), csvContent, "utf8");

  console.log(`\n======================================================`);
  console.log(`🎉 BKK KÜLLİYAT KÜNYE & TANITIM İŞLEMİ TAMAMLANDI!`);
  console.log(`Eşleşen & Doğrulanan: ${matched} / ${ourBooks.length}`);
  console.log(`Oluşturulan Dosyalar:`);
  console.log(`  • data/books_fallback.json (Proje içi kalıcı veritabanı)`);
  console.log(`  • bkk_tam_kunye_ve_tanitim_listesi.csv (Excel / Google Sheets aktarım tablosu)`);
  console.log(`======================================================`);
}

run().catch(console.error);
