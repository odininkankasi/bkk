const fs = require("fs");

const html = fs.readFileSync("scripts/single_product.html", "utf8");

// Search for keywords
const terms = ["ISBN", "Sayfa", "Çevirmen", "Özgün", "Orijinal", "Baskı", "Yayınevi"];

for (const term of terms) {
  let idx = 0;
  console.log(`=== Term: ${term} ===`);
  while ((idx = html.indexOf(term, idx)) !== -1) {
    console.log(html.slice(Math.max(0, idx - 40), Math.min(html.length, idx + 120)).replace(/\n/g, " "));
    idx += term.length;
    if (idx > 50000) break; // only first few
  }
}
