const fs = require("fs");
const path = require("path");

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

// 1. CSV Format for Excel / Google Sheets
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

// Write CSV to both Projeler root and bkk directory
fs.writeFileSync("c:\\Users\\alper\\Desktop\\Projeler\\bkk_kunye_duzenleme_tablosu.csv", csvContent, "utf8");
fs.writeFileSync(path.join(__dirname, "..", "bkk_kunye_duzenleme_tablosu.csv"), csvContent, "utf8");

// 2. Markdown / Text File for quick editing
let mdContent = `# İthaki Bilimkurgu Klasikleri (BKK) 116 Kitap Künye Düzenleme Listesi\n\n`;
mdContent += `> **Açıklama:** Bu dosyada istediğiniz alanları (Çevirmen, Özgün Adı, Sayfa Sayısı, ISBN, Tanıtım Yazısı) düzenleyebilirsiniz. İşiniz bittiğinde bana "düzenledim" demeniz yeterlidir, otomatik olarak siteye aktarılacaktır.\n\n`;

books.forEach((b) => {
  mdContent += `### [ #${b.sira_no} ] ${b.kitap_adi}\n`;
  mdContent += `- **Yazar:** ${b.yazar_adi || ""}\n`;
  mdContent += `- **Özgün Adı:** ${b.ozgun_adi || ""}\n`;
  mdContent += `- **Çevirmen:** ${b.cevirmen || ""}\n`;
  mdContent += `- **Sayfa Sayısı:** ${b.sayfa_sayisi || ""}\n`;
  mdContent += `- **ISBN:** ${b.isbn || ""}\n`;
  mdContent += `- **Tanıtım Yazısı:** ${b.tanitim_yazisi || ""}\n\n`;
  mdContent += `---\n\n`;
});

fs.writeFileSync("c:\\Users\\alper\\Desktop\\Projeler\\BKK_116_KUNYE_LISTESI.md", mdContent, "utf8");
fs.writeFileSync(path.join(__dirname, "..", "BKK_116_KUNYE_LISTESI.md"), mdContent, "utf8");

console.log("✓ Düzenleme dosyaları başarıyla oluşturuldu:");
console.log("  1. c:\\Users\\alper\\Desktop\\Projeler\\bkk_kunye_duzenleme_tablosu.csv (Excel / Google Sheets için)");
console.log("  2. c:\\Users\\alper\\Desktop\\Projeler\\BKK_116_KUNYE_LISTESI.md (Metin / Markdown düzenleme için)");
