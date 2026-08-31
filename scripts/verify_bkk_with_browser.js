const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function parseCsv(content) {
  const lines = content.trim().split("\n");
  const headers = lines[0].replace("\uFEFF", "").split(";");
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser for quoted fields
    const parts = [];
    let cur = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        if (inQuotes && line[j + 1] === '"') {
          cur += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ";" && !inQuotes) {
        parts.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    parts.push(cur.trim());

    rows.push({
      sira_no: parts[0] || "",
      kitap_adi: (parts[1] || "").replace(/^"|"$/g, ""),
      yazar_adi: (parts[2] || "").replace(/^"|"$/g, ""),
      ozgun_adi: (parts[3] || "").replace(/^"|"$/g, ""),
      cevirmen: (parts[4] || "").replace(/^"|"$/g, ""),
      sayfa_sayisi: (parts[5] || "").replace(/^"|"$/g, ""),
      isbn: (parts[6] || "").replace(/^"|"$/g, ""),
      tanitim: (parts[7] || "").replace(/^"|"$/g, ""),
    });
  }

  return rows;
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

async function runBatch(startIdx, endIdx) {
  const csvPath = "c:\\Users\\alper\\Desktop\\Projeler\\bkk_kunye_duzenleme_tablosu.csv";
  const reportPath = "c:\\Users\\alper\\Desktop\\Projeler\\kunye_dogrulama_raporu.csv";

  const allBooks = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const targetBooks = allBooks.slice(startIdx, endIdx);

  console.log(`\n======================================================`);
  console.log(`🚀 GERÇEK TARAYICI DOĞRULAMA: Kitap ${startIdx + 1} - ${endIdx} (${targetBooks.length} Kitap)`);
  console.log(`======================================================\n`);

  // Load existing report or initialize
  let reportRows = [];
  if (fs.existsSync(reportPath)) {
    const existing = fs.readFileSync(reportPath, "utf8");
    const lines = existing.trim().split("\n");
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) reportRows.push(lines[i].trim());
    }
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--window-size=1280,800",
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1280, height: 800 });

  for (let i = 0; i < targetBooks.length; i++) {
    const book = targetBooks[i];
    console.log(`[#${book.sira_no}] "${book.kitap_adi}" aranıyor...`);

    let status = "BULUNAMADI";
    let diffDetails = [];
    let productUrl = "";

    try {
      // 1. Search by title on İthaki
      const searchUrl = `https://www.ithakiyayingrubu.com/search?q=${encodeURIComponent(book.kitap_adi)}`;
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
      await new Promise((r) => setTimeout(r, 1200));

      // Extract search result links
      const searchResults = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll(".product-card, .product-item, .product-image__body"));
        return cards.map((c) => {
          const a = c.tagName === "A" ? c : c.querySelector("a");
          const titleEl = c.querySelector(".product-title, .title, a[title]") || a;
          return {
            href: a ? a.getAttribute("href") : null,
            title: (titleEl ? titleEl.innerText || titleEl.getAttribute("title") : "").trim(),
          };
        }).filter(x => x.href && !x.href.includes("cart"));
      });

      // Find matching item
      const cleanBName = cleanTitle(book.kitap_adi);
      let match = searchResults.find((r) => {
        const cTitle = cleanTitle(r.title);
        return cTitle === cleanBName || cTitle.includes(cleanBName) || cleanBName.includes(cTitle);
      });

      // If not found by title, try searching by ISBN
      if (!match && book.isbn) {
        const isbnSearchUrl = `https://www.ithakiyayingrubu.com/search?q=${encodeURIComponent(book.isbn)}`;
        await page.goto(isbnSearchUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
        await new Promise((r) => setTimeout(r, 1200));

        const isbnResults = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll("a[href]"));
          return links
            .map((a) => ({ href: a.getAttribute("href"), title: a.innerText || a.getAttribute("title") || "" }))
            .filter((x) => x.href && x.href.startsWith("/") && !x.href.includes(".") && !x.href.includes("cart") && !x.href.includes("account"));
        });
        match = isbnResults[0];
      }

      if (match && match.href) {
        productUrl = match.href.startsWith("http") ? match.href : `https://www.ithakiyayingrubu.com${match.href}`;
        await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
        await new Promise((r) => setTimeout(r, 1200));

        // Extract 4 fields from rendered DOM
        const extracted = await page.evaluate(() => {
          const data = { cevirmen: "", isbn: "", sayfa: "", tanitim: "" };

          // ISBN
          const gtinEl = document.querySelector(".gtin .value, [id*='gtin'], .isbn");
          if (gtinEl) data.isbn = gtinEl.innerText.trim();

          // Specifications
          const listItems = Array.from(document.querySelectorAll("li, dt, dd, .spec-item, .product-attribute"));
          listItems.forEach((li) => {
            const text = li.innerText || "";
            if (text.includes("ISBN") && !data.isbn) {
              const val = text.split("ISBN")[1] || "";
              data.isbn = val.replace(/[:\s]/g, "").trim();
            }
            if (text.includes("Çevirmen") || text.includes("Cevirmen")) {
              const a = li.querySelector("a, .value");
              data.cevirmen = a ? a.innerText.trim() : text.replace(/.*Çevirmen\s*:\s*/i, "").trim();
            }
            if (text.includes("Sayfa Sayısı") || text.includes("Sayfa")) {
              const a = li.querySelector("a, .value");
              data.sayfa = a ? a.innerText.trim() : text.replace(/.*Sayfa\s*(Sayısı)?\s*:\s*/i, "").trim();
            }
          });

          // Tanıtım / Arka Kapak
          const descEl = document.querySelector(".product-details-preview, .full-description, .product-description, [itemprop='description']");
          if (descEl) {
            data.tanitim = descEl.innerText.replace(/\s+/g, " ").trim();
          }

          return data;
        });

        // ── Compare with CSV ──
        // 1. Çevirmen comparison
        if (extracted.cevirmen) {
          const cSite = cleanTitle(extracted.cevirmen);
          const cCsv = cleanTitle(book.cevirmen);
          if (cSite !== cCsv && !cCsv.includes(cSite) && !cSite.includes(cCsv)) {
            diffDetails.push(`Çevirmen: CSV="${book.cevirmen}" / Site="${extracted.cevirmen}"`);
          }
        }

        // 2. ISBN comparison
        if (extracted.isbn) {
          const cleanIsbnSite = extracted.isbn.replace(/[^0-9]/g, "");
          const cleanIsbnCsv = book.isbn.replace(/[^0-9]/g, "");
          if (cleanIsbnSite !== cleanIsbnCsv) {
            diffDetails.push(`ISBN: CSV="${book.isbn}" / Site="${extracted.isbn}"`);
          }
        }

        // 3. Sayfa Sayısı comparison (±2 page tolerance)
        if (extracted.sayfa) {
          const numSite = parseInt(extracted.sayfa, 10);
          const numCsv = parseInt(book.sayfa_sayisi, 10);
          if (!isNaN(numSite) && !isNaN(numCsv)) {
            if (Math.abs(numSite - numCsv) > 2) {
              diffDetails.push(`Sayfa: CSV="${book.sayfa_sayisi}" / Site="${extracted.sayfa}"`);
            }
          }
        }

        // 4. Tanıtım Metni comparison
        if (extracted.tanitim) {
          if (book.tanitim && book.tanitim.length > 30) {
            // Check if there is high divergence
            const sStart = cleanTitle(extracted.tanitim.slice(0, 50));
            const cStart = cleanTitle(book.tanitim.slice(0, 50));
            if (!cleanTitle(extracted.tanitim).includes(cleanTitle(book.kitap_adi)) && !sStart.includes(cStart.slice(0, 20))) {
              diffDetails.push(`Tanıtım Metni: Farklı içerik tespit edildi`);
            }
          }
        }

        if (diffDetails.length === 0) {
          status = "OK";
        } else {
          status = "SORUN VAR";
        }
      } else {
        status = "BULUNAMADI";
      }
    } catch (e) {
      console.warn(`  [!] Hata oluştu: ${e.message}`);
      status = "MANUEL KONTROL GEREKLİ";
      diffDetails.push(`Hata: ${e.message}`);
    }

    const rowEntry = `${book.sira_no};"${book.kitap_adi}";${status};"${diffDetails.join(" | ")}";${productUrl || "—"}`;
    
    // Replace if sira_no exists or push
    const existingIdx = reportRows.findIndex((r) => r.startsWith(`${book.sira_no};`));
    if (existingIdx !== -1) {
      reportRows[existingIdx] = rowEntry;
    } else {
      reportRows.push(rowEntry);
    }

    // Save report after each book
    const header = "Sıra No;Kitap Adı;Durum;Fark Detayı;Kaynak URL";
    const fullReportContent = "\uFEFF" + [header, ...reportRows].join("\n");
    fs.writeFileSync(reportPath, fullReportContent, "utf8");

    console.log(`  -> Sonuç: [${status}] ${diffDetails.length > 0 ? "-> " + diffDetails.join(" | ") : ""}`);
    
    // Polite delay
    await new Promise((r) => setTimeout(r, 1000));
  }

  await browser.close();
  console.log(`\n✓ Parti tamamlandı! Rapor güncellendi: ${reportPath}`);
}

// Run Batch 1: Books 0 to 20
runBatch(0, 20).catch(console.error);
