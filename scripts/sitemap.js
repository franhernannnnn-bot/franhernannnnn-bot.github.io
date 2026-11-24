// Genera sitemap.xml automáticamente con todos los .html del proyecto.
// Uso: SITE_URL=https://franhernannnnn-bot.github.io node scripts/sitemap.js
const fs = require("fs");
const path = require("path");
const base = (process.env.SITE_URL || "https://franhernannnnn-bot.github.io/zacahuil-huasteco").replace(/\/$/, "");
const skip = ["carrito.html", "pedidos.html"];
const files = fs.readdirSync(".").filter(f => f.endsWith(".html") && !skip.includes(f));
const urls = files.map(f => {
  const date = fs.statSync(f).mtime.toISOString().slice(0, 10);
  const loc = f === "index.html" ? base + "/" : `${base}/${f}`;
  return `  <url><loc>${loc}</loc><lastmod>${date}</lastmod><priority>${f === "index.html" ? "1.0" : "0.7"}</priority></url>`;
});
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
console.log(`sitemap.xml generado con ${urls.length} URLs`);
