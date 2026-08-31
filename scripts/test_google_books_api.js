const https = require("https");
const fs = require("fs");
const path = require("path");

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on("error", reject);
  });
}

async function testGoogleBooks() {
  const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
  const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

  console.log(`=== GOOGLE BOOKS API İLE 116 KİTAP TARAMA TESTİ BAŞLIYOR ===\n`);

  let foundCount = 0;
  const results = [];

  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    
    // 1. Try ISBN query
    let query = `isbn:${b.isbn}`;
    let data = await get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    
    // 2. If not found by ISBN, try Title + Publisher
    if (!data || !data.items || data.items.length === 0) {
      query = `intitle:${b.kitap_adi}+inpublisher:İthaki`;
      data = await get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    }

    if (data && data.items && data.items.length > 0) {
      // Find best match with İthaki
      const best = data.items.find(item => {
        const p = item.volumeInfo?.publisher || "";
        return p.toLowerCase().includes("ithaki") || p.toLowerCase().includes("i̇thaki");
      }) || data.items[0];

      const info = best.volumeInfo || {};
      foundCount++;
      
      const itemRes = {
        sira_no: b.sira_no,
        kitap_adi: b.kitap_adi,
        found_title: info.title,
        authors: (info.authors || []).join(", "),
        pageCount: info.pageCount,
        publishedDate: info.publishedDate,
        descriptionLength: (info.description || "").length,
        hasDescription: Boolean(info.description && info.description.length > 20),
        industryIdentifiers: info.industryIdentifiers,
      };
      
      results.push(itemRes);
      console.log(`[#${b.sira_no} ✓] ${b.kitap_adi} -> Sayfa: ${info.pageCount || "Yok"} | Açıklama: ${itemRes.hasDescription ? "Var (" + itemRes.descriptionLength + " harf)" : "Yok"}`);
    } else {
      console.log(`[#${b.sira_no} ✗] ${b.kitap_adi} -> Google Books'ta bulunamadı.`);
    }

    // small delay to respect Google Books rate limit
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n==============================================`);
  console.log(`Google Books Test Sonucu:`);
  console.log(`Toplam Kitap: ${books.length}`);
  console.log(`Bulunan Kitap Sayısı: ${foundCount} / ${books.length} (%${Math.round((foundCount / books.length) * 100)})`);
  console.log(`==============================================`);
}

testGoogleBooks().catch(console.error);
