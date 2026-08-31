const fs = require("fs");
const html = fs.readFileSync("scripts/single_product.html", "utf8");

function extract(html) {
  const meta = {};
  
  // ISBN
  const isbnMatch = html.match(/ISBN:<\/span>\s*<span[^>]*class="value"[^>]*>([\s\S]*?)<\/span>/i);
  if (isbnMatch) meta.isbn = isbnMatch[1].replace(/<[^>]+>/g, "").trim();

  // Sayfa Sayısı
  const sayfaMatch = html.match(/Sayfa Sayısı:<\/span>\s*<[a-z0-9]+[^>]*class="value"[^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
  if (sayfaMatch) meta.sayfa = sayfaMatch[1].replace(/<[^>]+>/g, "").trim();

  // Çevirmen
  const cevirmenMatch = html.match(/Çevirmen:<\/span>\s*<[a-z0-9]+[^>]*class="value"[^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
  if (cevirmenMatch) meta.cevirmen = cevirmenMatch[1].replace(/<[^>]+>/g, "").trim();

  // Orijinal Adı
  const ozgunMatch = html.match(/Orijinal Adı:<\/span>\s*<[a-z0-9]+[^>]*class="value"[^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
  if (ozgunMatch) meta.ozgun = ozgunMatch[1].replace(/<[^>]+>/g, "").trim();

  // Tanıtım
  const descMatch = html.match(/<div class="product-details-preview"[^>]*>([\s\S]*?)<\/div>/i);
  if (descMatch) {
    meta.desc = descMatch[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return meta;
}

console.log(extract(html));
