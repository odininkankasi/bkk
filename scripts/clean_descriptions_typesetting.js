const fs = require("fs");
const path = require("path");

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

books.forEach((b) => {
  if (b.tanitim_yazisi) {
    let t = b.tanitim_yazisi;
    // Normalize quotes and dashes
    t = t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    // Ensure clean paragraph breaks
    t = t.replace(/\n{3,}/g, "\n\n");
    // Trim each paragraph
    const paras = t.split("\n\n").map((p) => p.trim()).filter(Boolean);
    b.tanitim_yazisi = paras.join("\n\n");
  }
});

fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

// Save to CSV & Markdown
const csvHeaders = [
  "Sıra No",
  "Kitap Adı",
  "Yazar Adı",
  "Özgün Adı",
  "Çevirmen",
  "Serideki Yayın Yılı",
  "Tanıtım Bülteni",
];

const csvRows = books.map((b) => [
  b.sira_no || "",
  `"${(b.kitap_adi || "").replace(/"/g, '""')}"`,
  `"${(b.yazar_adi || "").replace(/"/g, '""')}"`,
  `"${(b.ozgun_adi || "").replace(/"/g, '""')}"`,
  `"${(b.cevirmen || "").replace(/"/g, '""')}"`,
  b.ithaki_yayin_yili || "",
  `"${(b.tanitim_yazisi || "").replace(/"/g, '""')}"`,
]);

const csvContent =
  "\uFEFF" + [csvHeaders.join(";"), ...csvRows.map((r) => r.join(";"))].join("\n");

try {
  fs.writeFileSync(
    "c:\\Users\\alper\\Desktop\\Projeler\\bkk_kunye_duzenleme_tablosu.csv",
    csvContent,
    "utf8"
  );
} catch (e) {}

fs.writeFileSync(
  path.join(__dirname, "..", "bkk_kunye_duzenleme_tablosu.csv"),
  csvContent,
  "utf8"
);

console.log("✓ Tanıtım metinleri mizanpaj formatına göre temizlendi.");
