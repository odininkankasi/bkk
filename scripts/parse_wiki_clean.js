const fs = require("fs");
const path = require("path");

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
const trMatches = tableMatch[1].match(/<tr[\s\S]*?<\/tr>/gi) || [];

const wikiBooks = [];

trMatches.forEach((tr, i) => {
  const cells = tr.match(/<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi) || [];
  if (cells.length >= 4) {
    const cleaned = cells.map(cleanText);
    const num = parseInt(cleaned[0], 10);
    if (!isNaN(num)) {
      wikiBooks.push({
        sira_no: String(num),
        kitap_adi: cleaned[1] || "",
        yazar_adi: cleaned[2] || "",
        cevirmen: cleaned[3] || "",
        yayin_yili: cleaned[4] || "",
      });
    }
  }
});

console.log(`✓ Toplam ${wikiBooks.length} kitap Wikipedia tablosundan başarıyla çekildi!\n`);

// Save json
fs.writeFileSync("c:\\Users\\alper\\Desktop\\Projeler\\bkk\\scripts\\wiki_books_clean.json", JSON.stringify(wikiBooks, null, 2), "utf8");

// Print sample books
console.log("#1 Dune:", wikiBooks.find((b) => b.sira_no === "1"));
console.log("#2 Kıyamete Bir Milyar Yıl:", wikiBooks.find((b) => b.sira_no === "2"));
console.log("#34 Yakma Zevki:", wikiBooks.find((b) => b.sira_no === "34"));
console.log("#102 Hyperion:", wikiBooks.find((b) => b.sira_no === "102"));
console.log("#116 Kim Var Orada?:", wikiBooks.find((b) => b.sira_no === "116"));
