const fs = require("fs");
const path = require("path");

function toTitleCaseTr(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => {
      if (!word) return "";
      const first = word[0].toLocaleUpperCase("tr-TR");
      const rest = word.slice(1).toLocaleLowerCase("tr-TR");
      return first + rest;
    })
    .join(" ");
}

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

books.forEach((b) => {
  if (b.cevirmen && b.cevirmen === b.cevirmen.toUpperCase() && b.cevirmen.length > 3) {
    b.cevirmen = toTitleCaseTr(b.cevirmen);
  }
});

fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

// Save CSV
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
fs.writeFileSync("c:\\Users\\alper\\Desktop\\Projeler\\bkk_kunye_duzenleme_tablosu.csv", csvContent, "utf8");
fs.writeFileSync(path.join(__dirname, "..", "bkk_kunye_duzenleme_tablosu.csv"), csvContent, "utf8");

console.log("Çevirmen isimleri temizlendi ve normalize edildi.");
