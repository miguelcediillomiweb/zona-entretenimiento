(function(){
"use strict";
var SHEET_ID="1Rh9oyXSsYypBgPXSAzwW0kYdvugEtHG6FiDKrfxRK8s";
var BOT="Contenedorpelisseries_bot";
var TIPO=(document.body.getAttribute("data-tipo")||"").trim().toLowerCase();
var cont=document.getElementById("catalogo");
var URL_HOJA="https://docs.google.com/spreadsheets/d/"+SHEET_ID+"/gviz/tq?tqx=out:csv&gid=0";
var grupos={},nombres=[];
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function botLink(cod){return "https://t.me/"+BOT+"?start="+encodeURIComponent(cod)}
function num(v){var n=parseInt(v,10);return isNaN(n)?0:n}
function norm(v){return (v||"").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function parseCSV(t){
 var rows=[],row=[],field="",quoted=false;
 for(var i=0;i<t.length;i++){var ch=t[i];
  if(quoted){if(ch==='"'){if(t[i+1]==='"'){field+='"';i++}else quoted=false}else field+=ch}
  else if(ch==='"')quoted=true;
  else if(ch===","){row.push(field);field=""}
  else if(ch==="\n"){row.push(field);rows.push(row);row=[];field=""}
  else if(ch!=="\r")field+=ch;
 }
 if(field!==""||row.length){row.push(field);rows.push(row)}
 return rows.filter(function(r){return r.some(function(v){return v.trim()!==""})})
}
function mostrarLista(){
 cont.innerHTML="";window.scrollTo(0,0);
 if(!nombres.length){cont.appendChild(el("p","vacio","Aún no hay títulos aquí. ¡Pronto habrá más!"));return}
 var grid=el("div","grid");
 nombres.forEach(function(n){
  var lista=grupos[n],card=el("button","card"),cover=el("div","cover");
  cover.appendChild(el("span","cover-title",n));
  var p=lista.find(function(o){return o.portada});
  if(p){
   var img=el("img");img.alt=n;img.loading="lazy";img.src=/^https?:\/\//i.test(p.portada)?p.portada:"portadas/"+encodeURIComponent(p.portada).replace(/%2F/gi,"/");
   img.onerror=function(){img.remove()};cover.appendChild(img);
  }
  card.appendChild(cover);card.appendChild(el("span","nombre",n));
  card.addEventListener("click",function(){
   if(TIPO==="pelicula"&&lista.length===1){window.open(botLink(lista[0].codigo),"_blank","noopener,noreferrer")}
   else mostrarDetalle(n);
  });
  grid.appendChild(card);
 });
 cont.appendChild(grid);
}
function mostrarDetalle(n){
 cont.innerHTML="";window.scrollTo(0,0);
 var lista=grupos[n].slice();
 if(TIPO==="serie")lista.sort(function(a,b){return num(a.temporada)-num(b.temporada)||num(a.episodio)-num(b.episodio)});
 else lista.sort(function(a,b){return num(a.orden)-num(b.orden)});
 var volver=el("button","btn alt","← Volver al catálogo");volver.style.marginTop="0";volver.addEventListener("click",mostrarLista);cont.appendChild(volver);
 cont.appendChild(el("h2","titulo",n));
 var temp=null;
 lista.forEach(function(o){
  if(TIPO==="serie"&&o.temporada!==temp){temp=o.temporada||"Sin número";cont.appendChild(el("p","sub","📺 Temporada "+temp))}
  var etiqueta=TIPO==="serie"?"▶ "+(o.episodio?"Episodio "+o.episodio+": ":"")+o.titulo:"🎬 "+o.titulo;
  var a=el("a","btn item",etiqueta);a.href=botLink(o.codigo);a.target="_blank";a.rel="noopener noreferrer";cont.appendChild(a);
 });
}
if(!cont)return;
cont.innerHTML="";cont.appendChild(el("p","vacio","⏳ Cargando catálogo..."));
fetch(URL_HOJA,{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("No se pudo leer la hoja");return r.text()}).then(function(t){
 var rows=parseCSV(t);if(!rows.length)throw new Error("La hoja está vacía");
 var h=rows.shift().map(function(s){return norm(s).replace(/\s+/g,"_")});
 rows.map(function(r){var o={};h.forEach(function(k,i){o[k]=(r[i]||"").trim()});return o})
  .filter(function(o){return o.codigo&&norm(o.tipo)===norm(TIPO)})
  .forEach(function(o){var g=o.saga_o_serie||o.titulo;if(!g)return;if(!grupos[g]){grupos[g]=[];nombres.push(g)}grupos[g].push(o)});
 mostrarLista();
}).catch(function(err){cont.innerHTML="";cont.appendChild(el("p","vacio","No se pudo cargar el catálogo. Comprueba que la hoja esté compartida como lector y vuelve a intentarlo."));console.error(err)});
})();