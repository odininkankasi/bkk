const fs = require("fs");
const path = require("path");

const fallbackPath = path.join(__dirname, "..", "data", "books_fallback.json");
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

// Check if Aytozu Faciası already exists
let aytozu = books.find((b) => b.kitap_adi && b.kitap_adi.toLowerCase().includes("aytozu"));

if (!aytozu) {
  aytozu = {
    sira_no: "Yakında",
    kitap_adi: "Aytozu Faciası",
    yazar_adi: "Arthur C. Clarke",
    ozgun_adi: "A Fall of Moondust",
    cevirmen: "Ülkü Tuğba Çayır",
    kapak_gorseli: "/covers/yakinda-aytozu-faciasi.webp",
    ithaki_yayin_yili: "Yakında",
    okundu: "Hayır",
    kitaplikta_var: "Hayır",
    puan: null,
    slug: "yakinda-aytozu-faciasi",
    tanitim_yazisi:
      "21. yüzyılın ortalarında Ay, insanlığın yeni tatil ve keşif rotası haline gelmiştir. Özel olarak tasarlanmış turist gemisi Selene, yolcularını Ay’ın devasa toz denizinde (Mare Ingentii) gezdirmektedir. Ancak beklenmedik bir ay sarsıntısı sonucu Selene, metrelerce derinlikteki sıvı benzeri aytozunun altına gömülür.\n\nİçeride mahsur kalan mürettebat ve yolcular için oksijen hızla tükenirken, yüzeydeki kurtarma ekibi tarihin en karmaşık ve zamana karşı yarışan operasyonunu başlatır.\n\nArthur C. Clarke’ın Hugo Ödülü adayı olan ve gerçekçi bilimsel öngörüleriyle klasikleşen başyapıtı Aytozu Faciası, gerilimin ve insan iradesinin doruğa ulaştığı bir uzay klasiği.",
  };
  books.push(aytozu);
} else {
  aytozu.sira_no = "Yakında";
  aytozu.cevirmen = "Ülkü Tuğba Çayır";
  aytozu.kapak_gorseli = "/covers/yakinda-aytozu-faciasi.webp";
  aytozu.ozgun_adi = "A Fall of Moondust";
}

fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");

console.log("✓ Aytozu Faciası fallbackBooks'a eklendi. Toplam kitap:", books.length);
