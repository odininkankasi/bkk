const fs = require("fs");
const path = require("path");

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

// Clean all unverified metadata fields
books.forEach((b) => {
  delete b.cevirmen;
  delete b.ozgun_adi;
  delete b.sayfa_sayisi;
  delete b.isbn;
  delete b.tanitim_yazisi;
});

// Save cleaned fallback json
fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

// Generate clean CSV template for the user
const csvHeaders = [
  "Sıra No",
  "Kitap Adı",
  "Yazar Adı",
  "Özgün Adı",
  "Çevirmen",
  "Sayfa Sayısı",
  "ISBN",
  "Tanıtım Bülteni",
];

const csvRows = books.map((b) => [
  b.sira_no || "",
  `"${(b.kitap_adi || "").replace(/"/g, '""')}"`,
  `"${(b.yazar_adi || "").replace(/"/g, '""')}"`,
  "", // Özgün Adı boş
  "", // Çevirmen boş
  "", // Sayfa Sayısı boş
  "", // ISBN boş
  "", // Tanıtım Bülteni boş
]);

const csvContent = "\uFEFF" + [csvHeaders.join(";"), ...csvRows.map((r) => r.join(";"))].join("\n");
fs.writeFileSync("c:\\Users\\alper\\Desktop\\Projeler\\bkk_kunye_duzenleme_tablosu.csv", csvContent, "utf8");
fs.writeFileSync(path.join(__dirname, "..", "bkk_kunye_duzenleme_tablosu.csv"), csvContent, "utf8");

// Generate clean Markdown list for the user
let mdContent = `# 📚 İthaki Bilimkurgu Klasikleri (BKK) 116 Kitap Boş Künye Şablonu\n\n`;
mdContent += `> Bu liste sıfırlanmış ve tüm şüpheli/uydurma verilerden temizlenmiştir. Gerçek künye bilgilerini (Özgün Adı, Çevirmen, Sayfa Sayısı, ISBN, Tanıtım Yazısı) bildikçe buraya veya CSV dosyasına ekleyebilirsiniz.\n\n---\n\n`;

books.forEach((b) => {
  mdContent += `### [ #${b.sira_no} ] ${b.kitap_adi}\n`;
  mdContent += `- **Yazar:** ${b.yazar_adi || ""}\n`;
  mdContent += `- **Özgün Adı:** \n`;
  mdContent += `- **Çevirmen:** \n`;
  mdContent += `- **Sayfa Sayısı:** \n`;
  mdContent += `- **ISBN:** \n`;
  mdContent += `- **Tanıtım Yazısı:** \n\n`;
  mdContent += `---\n\n`;
});

fs.writeFileSync("c:\\Users\\alper\\Desktop\\Projeler\\BKK_116_KUNYE_LISTESI.md", mdContent, "utf8");
fs.writeFileSync(path.join(__dirname, "..", "BKK_116_KUNYE_LISTESI.md"), mdContent, "utf8");

console.log("✓ Tüm şüpheli künye verileri temizlendi.");
console.log("✓ Temiz CSV: c:\\Users\\alper\\Desktop\\Projeler\\bkk_kunye_duzenleme_tablosu.csv");
console.log("✓ Temiz Markdown: c:\\Users\\alper\\Desktop\\Projeler\\BKK_116_KUNYE_LISTESI.md");
