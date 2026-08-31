const fs = require("fs");

const htmlPath = "C:\\Users\\alper\\.gemini\\antigravity-ide\\brain\\36279c8c-15d8-4ae9-aa87-424a18b2ef29\\.system_generated\\steps\\1529\\content.md";
const html = fs.readFileSync(htmlPath, "utf8");

const tableMatch = html.match(/<table[^>]*class="wikitable[^>]*>([\s\S]*?)<\/table>/i);
const trs = tableMatch[1].match(/<tr[\s\S]*?<\/tr>/gi);

console.log("Headers:", trs[0].replace(/<[^>]+>/g, " | ").replace(/\s+/g, " "));
console.log("Book 1:", trs[1].replace(/<[^>]+>/g, " | ").replace(/\s+/g, " "));
