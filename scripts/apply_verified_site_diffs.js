const fs = require("fs");
const path = require("path");

const reportPath = "c:\\Users\\alper\\Desktop\\Projeler\\kunye_dogrulama_raporu.csv";
const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const csvPath = "c:\\Users\\alper\\Desktop\\Projeler\\bkk_kunye_duzenleme_tablosu.csv";

const reportContent = fs.readFileSync(reportPath, "utf8");
const reportLines = reportContent.trim().split("\n");

const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

let updatedCount = 0;

for (let i = 1; i < reportLines.length; i++) {
  const line = reportLines[i].trim();
  if (!line) continue;

  const parts = line.split(";");
  const siraNo = parts[0];
  const durum = parts[2];
  const diffStr = (parts[3] || "").replace(/^"|"$/g, "");

  const book = books.find((b) => String(b.sira_no) === String(siraNo));
  if (!book) continue;

  if (diffStr) {
    const diffs = diffStr.split(" | ");
    diffs.forEach((d) => {
      // Çevirmen: CSV="X" / Site="Y"
      if (d.startsWith("Çevirmen:")) {
        const match = d.match(/Site="([^"]+)"/);
        if (match && match[1]) {
          book.cevirmen = match[1].trim();
          updatedCount++;
        }
      }
      // ISBN: CSV="X" / Site="Y"
      if (d.startsWith("ISBN:")) {
        const match = d.match(/Site="([^"]+)"/);
        if (match && match[1]) {
          book.isbn = match[1].trim();
          updatedCount++;
        }
      }
      // Sayfa: CSV="X" / Site="Y"
      if (d.startsWith("Sayfa:")) {
        const match = d.match(/Site="([^"]+)"/);
        if (match && match[1]) {
          book.sayfa_sayisi = match[1].trim();
          updatedCount++;
        }
      }
    });
  }
}

// Save updated fallback json
fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

// Save updated CSV
const csvHeaders = [
  "Sıra No",
  "Kitap Adı",
  "Yazar Adı",
  "Özgün Adı",
  "Çevirmen",
  "Sayfa Sayısı",
  "ISBN",
  "Tanıtım Bülteni / Arka Kapak",
];

const csvRows = books.map((b) => [
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
fs.writeFileSync(csvPath, csvContent, "utf8");
fs.writeFileSync(path.join(__dirname, "..", "bkk_kunye_duzenleme_tablosu.csv"), csvContent, "utf8");

console.log(`✓ Gerçek site verileriyle ${updatedCount} alan otomatik olarak düzeltildi ve güncellendi!`);
