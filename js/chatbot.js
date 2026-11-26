/* Chatbot de preguntas frecuentes - Zacahuil Huasteco (sin servidor ni claves de API) */
(function () {
  const WA = "https://wa.me/527716841329?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20el%20zacahuil.";
  const norm = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const price = (n, d) => (typeof CATALOG !== "undefined" && CATALOG[n]) ? CATALOG[n].price : d;

  // Base de conocimiento: palabras clave -> respuesta (y enlace opcional)
  const KB = [
    { k: ["hola", "buenas", "buenos dias", "buenas tardes"], a: "¡Hola! Soy el asistente de Zacahuil Huasteco. Pregúntame por productos, precios, horarios, pedidos o pagos." },
    { k: ["horario", "hora", "abren", "cierran", "abierto"], a: "Atendemos de lunes a viernes de 7:00 a.m. a 2:00 p.m., sábados de 7:00 a.m. a 3:00 p.m. y domingos de 9:00 a.m. a 2:00 p.m.", l: ["Ver contacto", "contacto.html"] },
    { k: ["donde", "ubicacion", "direccion", "huejutla", "mapa"], a: "Estamos en Huejutla de Reyes, Hidalgo.", l: ["Ver contacto", "contacto.html"] },
    { k: ["telefono", "numero", "llamar", "whatsapp", "contacto"], a: "Puedes llamarnos o escribirnos por WhatsApp al 7716841329.", l: ["Abrir WhatsApp", WA] },
    { k: ["precio", "cuesta", "costo", "cuanto", "producto", "catalogo", "menu"],
      a: () => "Nuestros precios: Zacahuil Tradicional $" + price("Zacahuil Tradicional", 1800) + ", Familiar $" + price("Zacahuil Familiar", 1000) + ", Para Eventos $" + price("Zacahuil Para Eventos", 2000) + " y Porción Individual $" + price("Porción Individual", 60) + " MXN.", l: ["Ver productos", "productos.html"] },
    { k: ["promocion", "oferta", "descuento", "paquete"], a: "Tenemos el Zacahuil Familiar en promoción de $350 MXN y el Paquete para compartir (2 porciones individuales) por $110 MXN.", l: ["Ver promociones", "promociones.html"] },
    { k: ["pedido", "pedir", "comprar", "carrito", "ordenar"], a: "Agrega tus productos al carrito y confirma tu pedido en la página de Pedidos. Recibirás un folio y podrás enviarlo por WhatsApp.", l: ["Ir al carrito", "carrito.html"] },
    { k: ["pago", "pagar", "tarjeta", "transferencia", "efectivo"], a: "Puedes elegir tarjeta (simulada en esta versión académica), transferencia bancaria o efectivo contra entrega. No se piden datos de tarjeta.", l: ["Hacer un pedido", "pedidos.html"] },
    { k: ["evento", "fiesta", "boda", "cotizacion", "cotizar"], a: "Para eventos hacemos pedidos especiales con cotización. Respondemos en un máximo de 24 horas.", l: ["Solicitar", "pedidos.html"] },
    { k: ["que es", "zacahuil", "tradicion", "historia", "ingredientes", "huasteca"], a: "El zacahuil es un tamal de gran tamaño de la Huasteca, hecho con masa de maíz, carne y chile, y pensado para compartir.", l: ["Conocer la tradición", "historia.html"] },
    { k: ["ayuda", "problema", "falla", "error", "ticket", "soporte", "queja", "incidente"], a: "Lamento el problema. Puedes registrar un ticket en la mesa de ayuda y le damos seguimiento.", l: ["Mesa de ayuda", "ayuda.html"] },
    { k: ["blog", "articulo"], a: "En el blog encontrarás historias y costumbres del zacahuil.", l: ["Ir al blog", "blog.html"] },
    { k: ["gracias", "adios", "hasta luego"], a: "¡Con gusto! Que disfrutes tu zacahuil." }
  ];
  const QUICK = ["Precios", "Horarios", "Cómo pedir", "Promociones", "Formas de pago"];

  const css = document.createElement("style");
  css.textContent = "#zhChatBtn{position:fixed;left:20px;bottom:20px;width:56px;height:56px;border-radius:50%;border:0;background:#d59a3a;color:#28170f;font-size:26px;cursor:pointer;box-shadow:0 5px 15px #0004;z-index:999}" +
    "#zhChat{position:fixed;left:20px;bottom:90px;width:320px;max-width:calc(100vw - 40px);height:420px;max-height:70vh;background:#fff;border-radius:12px;box-shadow:0 10px 30px #0004;display:none;flex-direction:column;overflow:hidden;z-index:999;font:14px/1.5 Arial,sans-serif}" +
    "#zhChat.open{display:flex}#zhHead{background:#28170f;color:#fff;padding:12px 14px;font-weight:bold;display:flex;justify-content:space-between}#zhHead button{background:none;border:0;color:#fff;font-size:18px;cursor:pointer}" +
    "#zhMsgs{flex:1;overflow-y:auto;padding:12px;background:#fff8ec}.zhm{max-width:85%;padding:8px 12px;border-radius:12px;margin:6px 0;word-wrap:break-word}.zhb{background:#fff;border:1px solid #eadcc6;color:#40342d}.zhu{background:#6b3e26;color:#fff;margin-left:auto}" +
    ".zhq{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.zhq button,.zhl{background:#f2e5d2;color:#6b3e26;border:0;border-radius:16px;padding:5px 11px;cursor:pointer;font-size:13px;text-decoration:none;display:inline-block}" +
    "#zhForm{display:flex;border-top:1px solid #eee}#zhIn{flex:1;border:0;padding:12px;font:inherit;outline:0}#zhForm button{border:0;background:#d59a3a;color:#28170f;padding:0 16px;font-weight:bold;cursor:pointer}";
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.id = "zhChatBtn"; btn.type = "button"; btn.textContent = "🤖"; btn.setAttribute("aria-label", "Abrir asistente virtual"); btn.title = "Asistente virtual";
  const box = document.createElement("div");
  box.id = "zhChat"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Asistente virtual de Zacahuil Huasteco");
  box.innerHTML = '<div id="zhHead"><span>Asistente Zacahuil</span><button type="button" aria-label="Cerrar">✕</button></div><div id="zhMsgs" aria-live="polite"></div><form id="zhForm"><input id="zhIn" placeholder="Escribe tu pregunta..." aria-label="Escribe tu pregunta" autocomplete="off"><button type="submit">Enviar</button></form>';
  document.body.append(btn, box);

  const msgs = box.querySelector("#zhMsgs"), input = box.querySelector("#zhIn");
  let started = false;

  function add(text, who, link) {
    const d = document.createElement("div");
    d.className = "zhm " + (who === "u" ? "zhu" : "zhb");
    d.textContent = text;
    if (link) { d.appendChild(document.createElement("br")); const a = document.createElement("a"); a.className = "zhl"; a.textContent = link[0]; a.href = link[1]; if (link[1].startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; } d.appendChild(a); }
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  }
  function quick() {
    const q = document.createElement("div"); q.className = "zhq";
    QUICK.forEach(t => { const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.onclick = () => ask(t); q.appendChild(b); });
    msgs.appendChild(q); msgs.scrollTop = msgs.scrollHeight;
  }
  function answer(text) {
    const t = norm(text);
    const hit = KB.map(e => ({ e, n: e.k.filter(w => t.includes(norm(w))).length })).filter(x => x.n).sort((a, b) => b.n - a.n)[0];
    if (hit) return { a: typeof hit.e.a === "function" ? hit.e.a() : hit.e.a, l: hit.e.l };
    return { a: "No estoy seguro de cómo responder eso. Puedes escribirnos por WhatsApp o registrar un ticket en la mesa de ayuda.", l: ["Abrir WhatsApp", WA] };
  }
  function ask(text) {
    if (!text.trim()) return;
    add(text, "u");
    const r = answer(text);
    setTimeout(() => add(r.a, "b", r.l), 300);
    if (typeof gtag === "function") gtag("event", "chatbot_pregunta", { event_category: "chatbot" });
  }
  function toggle(open) {
    box.classList.toggle("open", open);
    if (open) { if (!started) { started = true; add("¡Hola! Soy el asistente de Zacahuil Huasteco. ¿En qué te ayudo?", "b"); quick(); if (typeof gtag === "function") gtag("event", "chatbot_abierto"); } input.focus(); }
  }
  btn.onclick = () => toggle(!box.classList.contains("open"));
  box.querySelector("#zhHead button").onclick = () => toggle(false);
  box.querySelector("#zhForm").addEventListener("submit", e => { e.preventDefault(); ask(input.value); input.value = ""; });
})();
