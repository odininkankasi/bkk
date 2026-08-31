const fs = require("fs");
const path = require("path");

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

const aytozu = books.find((b) => b.kitap_adi && b.kitap_adi.toLowerCase().includes("aytozu"));
if (aytozu) {
  aytozu.tanitim_yazisi = ""; // Boş bırakıldı, resmi yazı çıktığında kullanıcıdan alınacak
  aytozu.ozgun_adi = "";
}

fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

// CSV & MD Güncelleme
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

console.log("✓ Aytozu Faciası tanıtım yazısı temizlendi. Sadece gerçek bilinen bilgiler kaldı.");
