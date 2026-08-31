const fs = require("fs");

const htmlPath = "C:\\Users\\alper\\.gemini\\antigravity-ide\\brain\\36279c8c-15d8-4ae9-aa87-424a18b2ef29\\.system_generated\\steps\\1529\\content.md";
const html = fs.readFileSync(htmlPath, "utf8");

function cleanText(str) {
  return str
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[\d+\]/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const tableMatch = html.match(/<table[^>]*class="wikitable[^>]*>([\s\S]*?)<\/table>/i);
if (!tableMatch) {
  console.error("Wikitable bulunamadı!");
  process.exit(1);
}

const tableHtml = tableMatch[1];
const trMatches = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];

const rows = [];

trMatches.forEach((tr, i) => {
  // Extract cells
  const cells = tr.match(/<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi) || [];
  if (cells.length >= 4) {
    const cleaned = cells.map(cleanText);
    
    // Check if first cell is a number
    const num = parseInt(cleaned[0], 10);
    if (!isNaN(num)) {
      rows.push({
        sira_no: String(num),
        kitap_adi: cleaned[1] || "",
        ozgun_adi: cleaned[2] || "",
        yazar_adi: cleaned[3] || "",
        cevirmen: cleaned[4] || "",
        ithaki_basim_yili: cleaned[5] || "",
        ilk_yayin_tarihi: cleaned[6] || "",
      });
    }
  }
});

console.log(`✓ Toplam ${rows.length} kitap Wikipedia tablosundan başarıyla çekildi!\n`);

console.log("İlk 5 Kitap:");
console.log(JSON.stringify(rows.slice(0, 5), null, 2));

console.log("\n#34 Yakma Zevki:");
console.log(JSON.stringify(rows.find((r) => r.sira_no === "34"), null, 2));

console.log("\n#102 Hyperion:");
console.log(JSON.stringify(rows.find((r) => r.sira_no === "102"), null, 2));

console.log("\n#116 Kim Var Orada:");
console.log(JSON.stringify(rows.find((r) => r.sira_no === "116"), null, 2));

console.log("\nSon 5 Kitap:");
console.log(JSON.stringify(rows.slice(-5), null, 2));

fs.writeFileSync("c:\\Users\\alper\\Desktop\\Projeler\\bkk\\scripts\\wiki_books.json", JSON.stringify(rows, null, 2), "utf8");
