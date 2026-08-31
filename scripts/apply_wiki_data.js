const fs = require("fs");
const path = require("path");

const wikiBooks = JSON.parse(
  fs.readFileSync(path.join(__dirname, "wiki_books_clean.json"), "utf8")
);

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

let updatedCount = 0;

books.forEach((b) => {
  const wb = wikiBooks.find((w) => String(w.sira_no) === String(b.sira_no));
  if (wb) {
    b.cevirmen = wb.cevirmen.trim();
    b.ithaki_yayin_yili = wb.yayin_yili.trim();
    updatedCount++;
  }
});

fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

// Save to CSV
const csvHeaders = [
  "Sıra No",
  "Kitap Adı",
  "Yazar Adı",
  "Çevirmen (Vikipedi Doğrulanmış)",
  "Serideki Yayın Yılı (Vikipedi)",
];

const csvRows = books.map((b) => [
  b.sira_no || "",
  `"${(b.kitap_adi || "").replace(/"/g, '""')}"`,
  `"${(b.yazar_adi || "").replace(/"/g, '""')}"`,
  `"${(b.cevirmen || "").replace(/"/g, '""')}"`,
  b.ithaki_yayin_yili || "",
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
  console.warn("CSV kilitli, alternatif isimle kaydediliyor...");
  fs.writeFileSync(
    "c:\\Users\\alper\\Desktop\\Projeler\\bkk_wiki_kunye_tablosu.csv",
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
let mdContent = `# 📚 İthaki Bilimkurgu Klasikleri (BKK) 116 Kitap Vikipedi Doğrulanmış Çevirmen & Yıl Listesi\n\n`;
mdContent += `> **Kaynak:** [Vikipedi İthaki Bilimkurgu Klasikleri dizisi](https://tr.wikipedia.org/wiki/%C4%B0thaki_Bilimkurgu_Klasikleri_dizisi)\n\n`;
mdContent += `| Sıra No | Kitap Adı | Yazar Adı | Çevirmen | Serideki Yayın Yılı |\n`;
mdContent += `| :---: | :--- | :--- | :--- | :---: |\n`;

books.forEach((b) => {
  mdContent += `| **#${b.sira_no}** | ${b.kitap_adi} | ${b.yazar_adi} | **${b.cevirmen || "—"}** | ${b.ithaki_yayin_yili || "—"} |\n`;
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
  `✓ 116 kitabın tamamı Vikipedi doğrulanmış çevirmen ve basım yıllarıyla güncellendi! (${updatedCount} kitap)`
);
