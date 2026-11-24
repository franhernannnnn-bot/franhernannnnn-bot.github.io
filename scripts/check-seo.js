// Prueba básica del pipeline: cada HTML debe tener title, description, un H1 y alt en todas las imágenes.
const fs = require("fs");
let errors = 0;
for (const f of fs.readdirSync(".").filter(f => f.endsWith(".html"))) {
  const h = fs.readFileSync(f, "utf8");
  const fail = msg => { console.error(`❌ ${f}: ${msg}`); errors++; };
  if (!/<title>[^<]{10,}<\/title>/i.test(h)) fail("falta <title>");
  if (!/<meta[^>]+name=["']description["']/i.test(h)) fail("falta meta description");
  if ((h.match(/<h1[\s>]/gi) || []).length !== 1) fail("debe tener exactamente un H1");
  (h.match(/<img\b[^>]*>/gi) || []).forEach(t => { if (!/\balt=["'][^"']+["']/i.test(t)) fail("imagen sin alt: " + t.slice(0, 60)); });
}
if (errors) process.exit(1);
console.log("✅ Pruebas SEO básicas aprobadas");
