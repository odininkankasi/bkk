const fs = require("fs");
const path = require("path");

const bkkKulubu = JSON.parse(
  fs.readFileSync(path.join(__dirname, "bkk_kulubu_extracted.json"), "utf8")
);

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

let updatedDescCount = 0;
let updatedOrigCount = 0;

books.forEach((b) => {
  const item = bkkKulubu[b.sira_no];
  if (item) {
    if (item.tanitim && item.tanitim.trim()) {
      b.tanitim_yazisi = item.tanitim.trim();
      updatedDescCount++;
    }
    if (item.ozgun_adi && item.ozgun_adi.trim()) {
      b.ozgun_adi = item.ozgun_adi.trim();
      updatedOrigCount++;
    }
  }
});

fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

// Save to CSV
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
} catch (e) {
  fs.writeFileSync(
    "c:\\Users\\alper\\Desktop\\Projeler\\bkk_kulubu_kunye_tablosu.csv",
    csvContent,
    "utf8"
  );
}

fs.writeFileSync(
  path.join(__dirname, "..", "bkk_kunye_duzenleme_tablosu.csv"),
  csvContent,
  "utf8"
);

// Save to Markdown
let mdContent = `# 📚 İthaki Bilimkurgu Klasikleri (BKK) 116 Kitap Eksiksiz Künye & Tanıtım Tablosu\n\n`;
mdContent += `> **Kaynaklar:** [Vikipedi BKK Dizisi](https://tr.wikipedia.org/wiki/%C4%B0thaki_Bilimkurgu_Klasikleri_dizisi) & [Bilimkurgu Kulübü BKK Arşivi](https://www.bilimkurgukulubu.com/edebiyat/ithaki-bilimkurgu-klasikleri-dizisi/)\n\n---\n\n`;

books.forEach((b) => {
  mdContent += `### [ #${b.sira_no} ] ${b.kitap_adi}\n`;
  mdContent += `- **Yazar:** ${b.yazar_adi || "—"}\n`;
  mdContent += `- **Özgün Adı:** ${b.ozgun_adi || "—"}\n`;
  mdContent += `- **Çevirmen:** ${b.cevirmen || "—"}\n`;
  mdContent += `- **Serideki Basım Yılı:** ${b.ithaki_yayin_yili || "—"}\n`;
  mdContent += `- **Tanıtım Bülteni:**\n\n${b.tanitim_yazisi || "—"}\n\n`;
  mdContent += `---\n\n`;
});

fs.writeFileSync(
  "c:\\Users\\alper\\Desktop\\Projeler\\BKK_116_KUNYE_LISTESI.md",
  mdContent,
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "..", "BKK_116_KUNYE_LISTESI.md"),
  mdContent,
  "utf8"
);

console.log(
  `✓ ${updatedDescCount} kitabın tanıtım bülteni ve ${updatedOrigCount} kitabın özgün adı başarıyla güncellendi!`
);
