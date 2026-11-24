// Catálogo central: precio y existencias (fuente única de verdad para tienda, carrito y pedidos)
const CATALOG={
 "Zacahuil Tradicional":{price:1800,stock:10},
 "Zacahuil Familiar":{price:1000,stock:15},
 "Zacahuil Para Eventos":{price:2000,stock:5},
 "Porción Individual":{price:60,stock:50}
};
// Nombres sin importar mayúsculas/acentos; productos de promociones se registran solos con el precio del botón
const norm=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const extra=(()=>{try{return JSON.parse(localStorage.getItem("zacahuilExtra")||"{}")}catch(e){return{}}})();
Object.assign(CATALOG,extra);
const findName=x=>Object.keys(CATALOG).find(k=>norm(k)===norm(x));
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||d)}catch(e){return JSON.parse(d)}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let cart=read("zacahuilCart","[]");
function getStock(){const s=read("zacahuilStock","{}");Object.keys(CATALOG).forEach(n=>{if(!(n in s))s[n]=CATALOG[n].stock});return s}
function setStock(s){write("zacahuilStock",s)}
function toast(msg){const t=document.createElement("div");t.textContent=msg;t.setAttribute("role","status");t.style.cssText="position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#28170f;color:#fff;padding:12px 20px;border-radius:8px;z-index:2000;box-shadow:0 5px 15px #0004";document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
function saveCart(){write("zacahuilCart",cart);updateCartCount()}
function addToCart(rawName,price){
 let name=findName(rawName);
 if(!name){
  if(!Number(price)){toast("Producto no disponible");return}
  name=String(rawName).trim();CATALOG[name]={price:Number(price),stock:20};extra[name]=CATALOG[name];write("zacahuilExtra",extra);
 }
 const p=CATALOG[name];
 const item=cart.find(x=>x.name===name),inCart=item?item.qty:0;
 if(inCart>=getStock()[name]){toast("No hay más existencias de "+name);return}
 if(item)item.qty++;else cart.push({name,price:p.price,qty:1});
 saveCart();renderStock();toast("Agregado al carrito: "+name);
 if(typeof gtag==="function")gtag("event","add_to_cart",{currency:"MXN",value:p.price,items:[{item_name:name,price:p.price,quantity:1}]});
}
function updateCartCount(){const n=cart.reduce((s,x)=>s+x.qty,0);document.querySelectorAll("#cartCount").forEach(e=>e.textContent=n);const t=document.getElementById("cartCountText");if(t)t.textContent=n}
function changeQty(i,d){
 if(d>0&&cart[i].qty>=getStock()[cart[i].name]){toast("Sin más existencias");return}
 cart[i].qty+=d;if(cart[i].qty<=0)cart.splice(i,1);saveCart();renderCart()}
function clearCart(){if(cart.length&&confirm("¿Vaciar el carrito?")){cart=[];saveCart();renderCart()}}
function renderCart(){const box=document.getElementById("cartItems");if(!box)return;
 if(!cart.length){box.innerHTML='<div class="empty"><h2>Tu carrito está vacío 🛒</h2><p>Agrega productos desde nuestro catálogo.</p><a class="btn" href="productos.html">Ver productos</a></div>';const t=document.getElementById("cartTotal");if(t)t.textContent="$0 MXN";return}
 let total=0;
 box.innerHTML=cart.map((x,i)=>{x.price=CATALOG[x.name]?CATALOG[x.name].price:x.price;total+=x.price*x.qty;return `<div class="cart-item"><div><h3>${x.name}</h3><p>$${x.price} MXN por unidad</p></div><div class="qty"><button onclick="changeQty(${i},-1)" aria-label="Quitar uno">−</button><b>${x.qty}</b><button onclick="changeQty(${i},1)" aria-label="Agregar uno">+</button><strong>$${x.price*x.qty} MXN</strong></div></div>`}).join("");
 const t=document.getElementById("cartTotal");if(t)t.textContent="$"+total+" MXN"}
// Muestra precio y existencias en productos.html y conecta cada botón con su producto
function renderStock(){const s=getStock();
 document.querySelectorAll(".product").forEach(card=>{
  const name=(card.querySelector("h2")||{}).textContent?.trim(),p=CATALOG[name];if(!p)return;
  const price=card.querySelector(".price");if(price)price.textContent="$"+p.price+" MXN";
  let info=card.querySelector(".stock");
  if(!info){info=document.createElement("small");info.className="stock";info.style.cssText="display:block;margin-bottom:8px";card.querySelector(".product-body").insertBefore(info,card.querySelector("button"))}
  const left=s[name],btn=card.querySelector("button");
  info.textContent=left>0?"Disponibles: "+left:"Agotado";info.style.color=left>0?"#536b3e":"#9c3f2e";
  if(btn){btn.onclick=()=>addToCart(name);btn.disabled=left<=0;btn.style.opacity=left<=0?.5:1}
 })}
document.addEventListener("DOMContentLoaded",()=>{updateCartCount();renderCart();renderStock()});