const fs = require("fs");

const html = fs.readFileSync("scripts/sample_ithaki.html", "utf8");

// Print all img tags
const imgRegex = /<img[^>]+>/g;
let match;
while ((match = imgRegex.exec(html)) !== null) {
  console.log(match[0]);
}

// Print product card containers or title tags
console.log("--- Headings / Titles ---");
const hRegex = /<(h[2345]|div|span)[^>]*class=[\"'][^\"']*(title|name|product)[^\"']*[\"'][^>]*>(.*?)<\/\1>/gi;
while ((match = hRegex.exec(html)) !== null) {
  console.log(match[0].slice(0, 150));
}
