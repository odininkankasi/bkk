const fs = require("fs");

const html = fs.readFileSync("scripts/single_product.html", "utf8");

// Search for product description or content
const descMatch = html.match(/class=[\"'][^\"']*(product-details|description|full-description|product-info|tab-content)[^\"']*[\"']/gi);
console.log("Desc container matches:", descMatch);

const sample = html.indexOf("class=\"full-description\"");
if (sample !== -1) {
  console.log(html.slice(sample, sample + 600));
} else {
  // Find where H.G. Wells or Moreau text appears
  const t = html.indexOf("Moreau");
  console.log(html.slice(t, t + 400));
}
