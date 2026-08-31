const fs = require("fs");
const path = require("path");

function cleanHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&hellip;/g, "...");
}

const extractedBooks = {};

for (let p = 1; p <= 8; p++) {
  const filePath = path.join(__dirname, `bkk_kulubu_page_${p}.html`);
  if (!fs.existsSync(filePath)) continue;

  const raw = fs.readFileSync(filePath, "utf8");
  const html = cleanHtml(raw);

  // Extract post content body
  const postMatch = html.match(/<div class="entry-content[^"]*">([\s\S]*?)<\/div>/i) ||
                    html.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
  
  const content = postMatch ? postMatch[1] : html;

  // Pattern: <p><strong>1- Dune ...</strong></p> or <h3>1- Dune...</h3> or 1- Dune (Dune) / Frank Herbert
  // Let's split by paragraphs or headers
  const pMatches = content.match(/<p[\s\S]*?<\/p>/gi) || [];
  
  let currentNo = null;
  let currentTitle = "";
  let currentOrig = "";
  let currentAuthor = "";
  let currentDescParts = [];

  const flushBook = () => {
    if (currentNo && currentDescParts.length > 0) {
      const fullDesc = currentDescParts
        .map((p) => p.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
        .filter((p) => p && !p.startsWith("→") && !p.includes("İncelemesini Oku") && !p.includes("Satın Al") && !p.includes("Etiketler") && !p.includes("Yazar:"))
        .join("\n\n")
        .trim();

      if (!extractedBooks[currentNo] || fullDesc.length > (extractedBooks[currentNo].tanitim || "").length) {
        extractedBooks[currentNo] = {
          sira_no: String(currentNo),
          kitap_adi: currentTitle,
          ozgun_adi: currentOrig,
          yazar_adi: currentAuthor,
          tanitim: fullDesc,
        };
      }
    }
    currentDescParts = [];
  };

  pMatches.forEach((p) => {
    const text = p.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    // Check if it's a book title line like: "1- Dune (Dune) / Frank Herbert" or "102- Hyperion (Hyperion) / Dan Simmons"
    const headerMatch = text.match(/^(\d{1,3})\s*[-–—.]\s*([^\n\r(/]+?)(?:\s*\(([^)]+)\))?\s*\/\s*([^\n\r]+)$/i) ||
                        text.match(/^(\d{1,3})\s*[-–—.]\s*([^\n\r(/]+)$/i);

    if (headerMatch) {
      flushBook();
      currentNo = parseInt(headerMatch[1], 10);
      currentTitle = headerMatch[2] ? headerMatch[2].trim() : "";
      currentOrig = headerMatch[3] ? headerMatch[3].trim() : "";
      currentAuthor = headerMatch[4] ? headerMatch[4].trim() : "";
    } else if (currentNo) {
      currentDescParts.push(p);
    }
  });

  flushBook();
}

console.log(`✓ Bilimkurgu Kulübü'nden toplam ${Object.keys(extractedBooks).length} kitabın tanıtım metni ve özgün adı çıkarıldı!\n`);

console.log("#1 Dune:");
console.log(extractedBooks[1]);

console.log("\n#34 Yakma Zevki:");
console.log(extractedBooks[34]);

console.log("\n#102 Hyperion:");
console.log(extractedBooks[102]);

fs.writeFileSync(
  path.join(__dirname, "bkk_kulubu_extracted.json"),
  JSON.stringify(extractedBooks, null, 2),
  "utf8"
);
