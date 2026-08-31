const fs = require("fs");
const path = require("path");

const sourceDir = "c:\\Users\\alper\\Desktop\\Projeler\\yazıicerk";
const targetDir = "c:\\Users\\alper\\Desktop\\Projeler\\bkk\\public\\covers";

const mapping = [
  {
    src: "yenilmez.webp",
    targetWebp: "28-28-yenilmez.webp",
    targetJpg: "28-28-yenilmez.jpg",
    no: 28,
  },
  {
    src: "yuzyilin-en-iyi-bilimkurgu-otküleri.jpg",
    targetWebp: "30-30-yuzyilin-en-iyi-bilimkurgu-oykuleri.webp",
    targetJpg: "30-30-yuzyilin-en-iyi-bilimkurgu-oykuleri.jpg",
    no: 30,
  },
  {
    src: "yaban-diyarlarda-yabanci.webp",
    targetWebp: "40-40-yaban-diyarlardaki-yabanci.webp",
    targetJpg: "40-40-yaban-diyarlardaki-yabanci.jpg",
    no: 40,
  },
];

for (const m of mapping) {
  const srcPath = path.join(sourceDir, m.src);
  if (fs.existsSync(srcPath)) {
    const destPathWebp = path.join(targetDir, m.targetWebp);
    const destPathJpg = path.join(targetDir, m.targetJpg);
    fs.copyFileSync(srcPath, destPathWebp);
    fs.copyFileSync(srcPath, destPathJpg);
    console.log(`✓ Copied ${m.src} -> ${m.targetWebp}`);
  } else {
    console.warn(`✗ Not found: ${srcPath}`);
  }
}

// Update fallback json paths
const fallbackPath = "c:\\Users\\alper\\Desktop\\Projeler\\bkk\\data\\books_fallback.json";
const books = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

books.forEach((b) => {
  if (b.sira_no == 28) b.kapak_gorseli = "/covers/28-28-yenilmez.webp";
  if (b.sira_no == 30) b.kapak_gorseli = "/covers/30-30-yuzyilin-en-iyi-bilimkurgu-oykuleri.webp";
  if (b.sira_no == 40) b.kapak_gorseli = "/covers/40-40-yaban-diyarlardaki-yabanci.webp";
});

fs.writeFileSync(fallbackPath, JSON.stringify(books, null, 2), "utf8");
console.log("books_fallback.json updated successfully.");
