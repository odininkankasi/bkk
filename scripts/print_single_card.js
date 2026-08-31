const fs = require("fs");

const html = fs.readFileSync("scripts/sample_ithaki.html", "utf8");

const cardStart = html.indexOf('class="product-card product-card--hidden-actions real-content"');
if (cardStart !== -1) {
  console.log(html.slice(cardStart, cardStart + 1500));
}
