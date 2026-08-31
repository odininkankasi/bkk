const fs = require("fs");

const html = fs.readFileSync("scripts/sample_ithaki.html", "utf8");

// Check pagination links
const pageLinks = html.match(/href=[\"']([^\"']*bilimkurgu-klasikleri[^\"']*)[\"']/g) || [];
console.log("Unique BKK links found in HTML:", [...new Set(pageLinks)].slice(0, 20));

// Check product / image patterns
const imgTags = html.match(/<img[^>]+>/g) || [];
console.log("Total img tags:", imgTags.length);

const productImgs = imgTags.filter(t => t.includes("/upload/") || t.includes("/urun/") || t.includes("kitap") || t.includes("urun"));
console.log("Product-like img tags sample (first 10):", productImgs.slice(0, 10));

// Check product links or title patterns
const productLinks = html.match(/<a[^>]+class=[\"'][^\"']*product[^\"']*[\"'][^>]*>/g) || [];
console.log("Product links sample:", productLinks.slice(0, 5));
