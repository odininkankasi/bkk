const fs = require("fs");
const path = require("path");

const src = "c:\\Users\\alper\\Desktop\\Projeler\\yazıicerk\\yakma-zevkfahtenheit-451-oykykler.webp";
const destWebp = "c:\\Users\\alper\\Desktop\\Projeler\\bkk\\public\\covers\\34-34-yakma-zevki-fahrenheit-451-oykuleri.webp";
const destJpg = "c:\\Users\\alper\\Desktop\\Projeler\\bkk\\public\\covers\\34-34-yakma-zevki-fahrenheit-451-oykuleri.jpg";

if (fs.existsSync(src)) {
  fs.copyFileSync(src, destWebp);
  fs.copyFileSync(src, destJpg);
  console.log("✓ #34 Yakma Zevki kapağı kopyalandı.");
}

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

const b34 = books.find((b) => b.sira_no == 34);
if (b34) {
  b34.cevirmen = "Murat Özbank";
  b34.isbn = "9786053758198";
  b34.sayfa_sayisi = "240";
  b34.kapak_gorseli = "/covers/34-34-yakma-zevki-fahrenheit-451-oykuleri.webp";
  b34.tanitim_yazisi =
    "Fahrenheit 451'in ilk kıvılcımları... Ray Bradbury'nin kült eseri Fahrenheit 451'e giden yolda kaleme aldığı öyküleri, yazarın sansüre, kitap yakmaya ve otoriter rejimlerin düşünce düşmanlığına karşı edebiyatın direncini anlattığı öncü metinleri bir araya getiriyor.";
}

fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

// Update CSV
const csvPath = "c:\\Users\\alper\\Desktop\\Projeler\\bkk_kunye_duzenleme_tablosu.csv";
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

console.log("✓ #34 Yakma Zevki: Murat Özbank olarak güncellendi.");
