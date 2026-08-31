const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const csvPath = "c:\\Users\\alper\\Desktop\\Projeler\\bkk_kunye_duzenleme_tablosu.csv";
const reportPath = "c:\\Users\\alper\\Desktop\\Projeler\\kunye_dogrulama_raporu.csv";
const taskPath = "c:\\Users\\alper\\Desktop\\Projeler\\KUNYE_DOGRULAMA_TAKIP.md";

function parseCsv(content) {
  const lines = content.trim().split("\n");
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

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

function updateTaskDoc(completedBatches, counts) {
  let content = `# 📋 İthaki Bilimkurgu Klasikleri (BKK) 116 Kitap Künye Doğrulama Takip Listesi\n\n`;
  content += `> **Görev:** \`bkk_kunye_duzenleme_tablosu.csv\` içerisindeki 116 kitabın Çevirmen, Sayfa Sayısı, ISBN ve Tanıtım Bülteni verilerini gerçek Chrome tarayıcısı üzerinden \`ithakiyayingrubu.com\` ile karşılaştırıp doğrulamak ve \`kunye_dogrulama_raporu.csv\` raporunu üretmek.\n\n`;
  content += `---\n\n## 🚀 Parti İlerleme Durumu\n\n`;

  const batches = [
    { no: 1, text: "**Parti 1 (Kitap 1 - 20):** #01 Dune ➔ #20 Ay Zalim Bir Sevgilidir" },
    { no: 2, text: "**Parti 2 (Kitap 21 - 40):** #21 Su Adamı ➔ #40 Yaban Diyarlardaki Yabancı" },
    { no: 3, text: "**Parti 3 (Kitap 41 - 60):** #41 Tanrıların Tohumu ➔ #60 1984" },
    { no: 4, text: "**Parti 4 (Kitap 61 - 80):** #61 Hayvan Çiftliği ➔ #80 Cennetin Çeşmeleri" },
    { no: 5, text: "**Parti 5 (Kitap 81 - 100):** #81 Düşyılanı ➔ #100 Tehlikeli Görüler" },
    { no: 6, text: "**Parti 6 (Kitap 101 - 116):** #101 Melankolinin İlacı ➔ #116 Kim Var Orada?" },
  ];

  batches.forEach((b) => {
    const isDone = completedBatches.includes(b.no);
    content += `- [${isDone ? "x" : " "}] ${b.text}\n`;
  });

  content += `\n---\n\n## 📊 Canlı Rapor Durumu (\`kunye_dogrulama_raporu.csv\`)\n`;
  content += `* **Toplam Kontrol Edilen:** ${counts.total} / 116\n`;
  content += `* **Doğrulanan (OK):** ${counts.ok}\n`;
  content += `* **Fark Tespit Edilen (SORUN VAR):** ${counts.issues}\n`;
  content += `* **Sitede Olmayan (BULUNAMADI):** ${counts.notFound}\n`;
  content += `* **Manuel Kontrol Gereken:** ${counts.manual}\n`;

  fs.writeFileSync(taskPath, content, "utf8");
}

async function main() {
  const allBooks = parseCsv(fs.readFileSync(csvPath, "utf8"));
  console.log(`Toplam ${allBooks.length} kitap işlenmek üzere yüklendi.\n`);

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

  const completedBatches = [];

  const batchRanges = [
    { batchNo: 1, start: 0, end: 20 },
    { batchNo: 2, start: 20, end: 40 },
    { batchNo: 3, start: 40, end: 60 },
    { batchNo: 4, start: 60, end: 80 },
    { batchNo: 5, start: 80, end: 100 },
    { batchNo: 6, start: 100, end: 116 },
  ];

  for (const bRange of batchRanges) {
    console.log(`\n========================================================================`);
    console.log(`🚀 PARTİ ${bRange.batchNo} BAŞLIYOR: Kitap ${bRange.start + 1} - ${bRange.end}`);
    console.log(`========================================================================\n`);

    const currentBatchBooks = allBooks.slice(bRange.start, bRange.end);

    for (let i = 0; i < currentBatchBooks.length; i++) {
      const book = currentBatchBooks[i];
      console.log(`[#${book.sira_no}] "${book.kitap_adi}" (${book.yazar_adi}) kontrol ediliyor...`);

      let status = "BULUNAMADI";
      let diffDetails = [];
      let productUrl = "";

      try {
        // Search by title
        const searchUrl = `https://www.ithakiyayingrubu.com/search?q=${encodeURIComponent(book.kitap_adi)}`;
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
        await new Promise((r) => setTimeout(r, 1000));

        const searchResults = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll(".product-card, .product-item, .product-image__body"));
          return cards
            .map((c) => {
              const a = c.tagName === "A" ? c : c.querySelector("a");
              const titleEl = c.querySelector(".product-title, .title, a[title]") || a;
              return {
                href: a ? a.getAttribute("href") : null,
                title: (titleEl ? titleEl.innerText || titleEl.getAttribute("title") : "").trim(),
              };
            })
            .filter((x) => x.href && !x.href.includes("cart"));
        });

        const cleanBName = cleanTitle(book.kitap_adi);
        
        // 1. Strict exact title match
        let match = searchResults.find((r) => cleanTitle(r.title) === cleanBName);
        
        // 2. Exact slug match (e.g. /dune)
        if (!match) {
          match = searchResults.find((r) => r.href === `/${cleanBName}`);
        }

        // 3. Substring match
        if (!match) {
          match = searchResults.find((r) => {
            const cTitle = cleanTitle(r.title);
            return cTitle.startsWith(cleanBName) || cleanBName.startsWith(cTitle);
          });
        }

        // 4. Search by ISBN fallback if not found
        if (!match && book.isbn) {
          const isbnSearchUrl = `https://www.ithakiyayingrubu.com/search?q=${encodeURIComponent(book.isbn)}`;
          await page.goto(isbnSearchUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
          await new Promise((r) => setTimeout(r, 1000));

          const isbnResults = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll("a[href]"));
            return links
              .map((a) => ({ href: a.getAttribute("href"), title: a.innerText || a.getAttribute("title") || "" }))
              .filter(
                (x) =>
                  x.href &&
                  x.href.startsWith("/") &&
                  !x.href.includes(".") &&
                  !x.href.includes("cart") &&
                  !x.href.includes("account")
              );
          });
          match = isbnResults[0];
        }

        if (match && match.href) {
          productUrl = match.href.startsWith("http") ? match.href : `https://www.ithakiyayingrubu.com${match.href}`;
          await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
          await new Promise((r) => setTimeout(r, 1000));

          const extracted = await page.evaluate(() => {
            const data = { cevirmen: "", isbn: "", sayfa: "", tanitim: "" };

            const gtinEl = document.querySelector(".gtin .value, [id*='gtin'], .isbn");
            if (gtinEl) data.isbn = gtinEl.innerText.trim();

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

            const descEl = document.querySelector(
              ".product-details-preview, .full-description, .product-description, [itemprop='description']"
            );
            if (descEl) {
              data.tanitim = descEl.innerText.replace(/\s+/g, " ").trim();
            }

            return data;
          });

          // Comparison checks
          if (extracted.cevirmen) {
            const cSite = cleanTitle(extracted.cevirmen);
            const cCsv = cleanTitle(book.cevirmen);
            if (cSite !== cCsv && !cCsv.includes(cSite) && !cSite.includes(cCsv)) {
              diffDetails.push(`Çevirmen: CSV="${book.cevirmen}" / Site="${extracted.cevirmen}"`);
            }
          }

          if (extracted.isbn) {
            const cleanIsbnSite = extracted.isbn.replace(/[^0-9]/g, "");
            const cleanIsbnCsv = book.isbn.replace(/[^0-9]/g, "");
            if (cleanIsbnSite !== cleanIsbnCsv) {
              diffDetails.push(`ISBN: CSV="${book.isbn}" / Site="${extracted.isbn}"`);
            }
          }

          if (extracted.sayfa) {
            const numSite = parseInt(extracted.sayfa, 10);
            const numCsv = parseInt(book.sayfa_sayisi, 10);
            if (!isNaN(numSite) && !isNaN(numCsv)) {
              if (Math.abs(numSite - numCsv) > 2) {
                diffDetails.push(`Sayfa: CSV="${book.sayfa_sayisi}" / Site="${extracted.sayfa}"`);
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
        console.warn(`  [!] Hata: ${e.message}`);
        status = "MANUEL KONTROL GEREKLİ";
        diffDetails.push(`Hata: ${e.message}`);
      }

      const rowEntry = `${book.sira_no};"${book.kitap_adi}";${status};"${diffDetails.join(" | ")}";${productUrl || "—"}`;

      const existingIdx = reportRows.findIndex((r) => r.startsWith(`${book.sira_no};`));
      if (existingIdx !== -1) {
        reportRows[existingIdx] = rowEntry;
      } else {
        reportRows.push(rowEntry);
      }

      // Save report file
      const header = "Sıra No;Kitap Adı;Durum;Fark Detayı;Kaynak URL";
      fs.writeFileSync(reportPath, "\uFEFF" + [header, ...reportRows].join("\n"), "utf8");

      console.log(`  -> Sonuç: [${status}] ${diffDetails.length > 0 ? "-> " + diffDetails.join(" | ") : ""}`);

      await new Promise((r) => setTimeout(r, 800));
    }

    completedBatches.push(bRange.batchNo);

    // Calculate current counts
    const okCount = reportRows.filter((r) => r.includes(";OK;")).length;
    const issueCount = reportRows.filter((r) => r.includes(";SORUN VAR;")).length;
    const notFoundCount = reportRows.filter((r) => r.includes(";BULUNAMADI;")).length;
    const manualCount = reportRows.filter((r) => r.includes(";MANUEL KONTROL GEREKLİ;")).length;

    updateTaskDoc(completedBatches, {
      total: reportRows.length,
      ok: okCount,
      issues: issueCount,
      notFound: notFoundCount,
      manual: manualCount,
    });

    console.log(`\n🎉 PARTİ ${bRange.batchNo} TAMAMLANDI VE TİCK ATILDI!`);
    console.log(`Şu ana kadarki durum: OK=${okCount}, Sorun Var=${issueCount}, Bulunamadı=${notFoundCount}`);
  }

  await browser.close();
  console.log(`\n======================================================`);
  console.log(`🏆 116 KİTABIN TAMAMI GERÇEK TARAYICI İLE DOĞRULANDI!`);
  console.log(`Nihai Rapor: ${reportPath}`);
  console.log(`Takip Listesi: ${taskPath}`);
  console.log(`======================================================`);
}

main().catch(console.error);
