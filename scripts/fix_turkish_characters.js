const fs = require("fs");
const path = require("path");

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

function fixTypography(text) {
  if (!text) return "";

  let s = text;

  // 1. Unicode Normalization (NFC merges combining characters like u + ̈ into ü)
  s = s.normalize("NFC");

  // 2. HTML Entities & Mojibake replacements
  const entityMap = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
    "&rsquo;": "'",
    "&lsquo;": "'",
    "&rdquo;": '"',
    "&ldquo;": '"',
    "&hellip;": "...",
    "&ndash;": "–",
    "&mdash;": "—",
    "&#8217;": "'",
    "&#8216;": "'",
    "&#8220;": '"',
    "&#8221;": '"',
    "&#8230;": "...",
    "Ã§": "ç",
    "Ã‡": "Ç",
    "ÄŸ": "ğ",
    "Ä": "Ğ",
    "Ä±": "ı",
    "Ä°": "İ",
    "Ã¶": "ö",
    "Ã–": "Ö",
    "ÅŸ": "ş",
    "Å": "Ş",
    "Ã¼": "ü",
    "Ãœ": "Ü",
    "â€™": "'",
    "â€œ": '"',
    "â€": '"',
    "â€¦": "...",
    "â€“": "–",
    "â€”": "—",
  };

  for (const [entity, repl] of Object.entries(entityMap)) {
    s = s.split(entity).join(repl);
  }

  // 3. Fix backtick quotes (`word` -> 'word')
  s = s.replace(/`([^`]+)`/g, "“$1”");
  s = s.replace(/`/g, "'");

  // 4. Common OCR / Typing typos in texts
  s = s.replace(/laburatuvar/gi, "laboratuvar");
  s = s.replace(/İmpatorluğun/g, "İmparatorluğun");
  s = s.replace(/Pasitif Okyanus’nu/g, "Pasifik Okyanusu'nu");
  s = s.replace(/Pasitif/g, "Pasifik");

  // 5. Standardize quotes
  s = s.replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"');
  s = s.replace(/[\u2018\u2019\u201A\u201B]/g, "'");

  // 6. Clean excess spaces
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/ \n/g, "\n");
  s = s.replace(/\n /g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

let fixedFields = 0;

books.forEach((b) => {
  ["kitap_adi", "yazar_adi", "ozgun_adi", "cevirmen", "tanitim_yazisi"].forEach((field) => {
    if (b[field]) {
      const original = b[field];
      const cleaned = fixTypography(original);
      if (cleaned !== original) {
        b[field] = cleaned;
        fixedFields++;
      }
    }
  });
});

fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

// Update CSV & Markdown with 100% clean UTF-8
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

// Save clean Markdown
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

console.log(`✓ Toplam ${fixedFields} metin alanındaki tüm karakter ve tipografi hataları NFC standardında düzeltildi!`);
