const fs = require("fs");
const html = fs.readFileSync("scripts/sample_ithaki.html", "utf8");

// Split by product-card
const cards = html.split('class="product-card');
console.log("Total product-card blocks in sample_ithaki.html:", cards.length - 1);

const products = [];
for (let i = 1; i < cards.length; i++) {
  const card = cards[i];
  
  // Extract link
  const linkMatch = card.match(/href=([^\s>]+)/i);
  // Extract title
  const titleMatch = card.match(/title="?([^"\s>][^">]*?)(?:"|\s|>)/i) || card.match(/alt="?([^"\s>][^">]*?)(?:"|\s|>)/i);
  
  if (linkMatch && linkMatch[1].startsWith("/")) {
    const rawLink = linkMatch[1].replace(/["']/g, "");
    let title = titleMatch ? titleMatch[1].replace(/ için ayrıntıları göster/i, "").replace(/^Resim /i, "").trim() : rawLink.replace(/\//, "");
    products.push({ link: rawLink, title });
  }
}

console.log("Extracted products sample (first 10):", products.slice(0, 10));
