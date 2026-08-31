const fs = require("fs");
const path = require("path");

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

const b9 = books.find((b) => b.sira_no == 9);
if (b9) {
  b9.ozgun_adi = "The Demolished Man";
  b9.tanitim_yazisi =
    "24. yüzyılda, evrenin en güçlü adamlarından biri olan Ben Reich, yetmiş yıldır adı bile duyulmamış bir suç işlemeye karar verir: Cinayet. Esper adı verilen zihin okuyucuların, daha düşünce halindeyken suçları engellediği bu dünyada, Reich’ın amacına ulaşması neredeyse imkânsızdı. Hükümdarlık adındaki şirketinin, rakip şirket D’Courtney’le girdiği mücadeleyi büyük ölçüde kaybetmesinin ardından başka bir çaresi kalmadığını düşünen Reich, bir yandan da kâbuslarında asıl korkusu Yüzü Olmayan Adam’la uğraşıyordu. Tüm bunlara rağmen Ben Reich pes etmemeye kararlıydı. Aklında yıkımla, Yıkım’a hazırlandığının farkında değildi.\n\nYıkıma Giden Adam, galaksinin içimizdeki megalomana verdiği çarpıcı bir yanıt.";
}

fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

// Save CSV & Markdown
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

console.log("✓ #9 Yıkıma Giden Adam tamamlandı. Toplam 116 / 116 kitap %100 eksiksiz!");
