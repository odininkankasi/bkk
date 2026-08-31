const fs = require("fs");

const html = fs.readFileSync("scripts/single_product.html", "utf8");

// Search for the word 'Edward Prendick' or story text from Moreau
const storyIdx = html.indexOf("Prendick");
if (storyIdx !== -1) {
  console.log("Found story text at:", storyIdx);
  console.log(html.slice(storyIdx - 200, storyIdx + 500));
} else {
  // Check tab or collapse content
  const tabIdx = html.indexOf("tab-description");
  if (tabIdx !== -1) {
    console.log(html.slice(tabIdx, tabIdx + 600));
  } else {
    // Check itemprop="description"
    const itemProp = html.indexOf("itemprop=\"description\"");
    if (itemProp !== -1) console.log(html.slice(itemProp, itemProp + 600));
  }
}
