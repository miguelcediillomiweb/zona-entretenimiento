(function(){
"use strict";
var SHEET_ID="1Rh9oyXSsYypBgPXSAzwW0kYdvugEtHG6FiDKrfxRK8s";
var BOT="Contenedorpelisseries_bot";
var TIPO=(document.body.getAttribute("data-tipo")||"").trim().toLowerCase();
var cont=document.getElementById("catalogo");
var URL_HOJA="https://docs.google.com/spreadsheets/d/"+SHEET_ID+"/gviz/tq?tqx=out:csv&gid=0";
function claveColumna(v){return norm(v).replace(/[\\s-]+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/^_+|_+$/g,"")}
function normalizarEncabezado(v){var k=claveColumna(v);var alias={portada_temporada:"portada_temporada",portada_de_temporada:"portada_temporada",portada_temporadas:"portada_temporada",temporada_portada:"portada_temporada",poster_temporada:"portada_temporada",poster_de_temporada:"portada_temporada",poster_temporada_url:"portada_temporada",url_portada_temporada:"portada_temporada",imagen_temporada:"portada_temporada",imagen_de_temporada:"portada_temporada",imagen_temporadas:"portada_temporada",portada_temp:"portada_temporada",poster_temp:"portada_temporada"};return alias[k]||k}
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
  var p=lista.find(function(o){return /^https?:\/\//i.test(o.portada||"")})||lista.find(function(o){return o.portada});
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
 if(TIPO==="serie"){
  var temporadas={},ordenTemporadas=[];
  lista.forEach(function(o){
   var t=(o.temporada||"").trim()||"Sin número";
   if(!temporadas[t]){temporadas[t]=[];ordenTemporadas.push(t)}
   temporadas[t].push(o);
  });
  ordenTemporadas.forEach(function(t){
   var episodios=temporadas[t],poster="";
   for(var i=0;i<episodios.length;i++){
    var candidate=(episodios[i].portada_temporada||"").trim();
    if(/^https?:\/\//i.test(candidate)){poster=candidate;break}
   }
   var bloque=el("section","season-block");
   var cabecera=el("div","season-heading");
   var cover=el("div","season-cover");
   if(poster){var img=el("img");img.alt=n+" — Temporada "+t;img.loading="lazy";img.src=poster;img.onerror=function(){img.remove()};cover.appendChild(img)}
   else cover.appendChild(el("span","season-placeholder","📺\nTemporada "+t));
   cabecera.appendChild(cover);
   var info=el("div","season-info");
   info.appendChild(el("h3","season-title","Temporada "+t));
   info.appendChild(el("p","season-count",episodios.length+" episodio"+(episodios.length===1?"":"s")));
   cabecera.appendChild(info);bloque.appendChild(cabecera);
   episodios.forEach(function(o){
    var etiqueta="▶ "+(o.episodio?"Episodio "+o.episodio+": ":"")+o.titulo;
    var link=el("a","btn item",etiqueta);link.href=botLink(o.codigo);link.target="_blank";link.rel="noopener noreferrer";bloque.appendChild(link);
   });
   cont.appendChild(bloque);
  });
 }else{
  lista.forEach(function(o){
   var a=el("a","btn item","🎬 "+o.titulo);a.href=botLink(o.codigo);a.target="_blank";a.rel="noopener noreferrer";cont.appendChild(a);
  });
 }
}
if(!cont)return;
cont.innerHTML="";cont.appendChild(el("p","vacio","⏳ Cargando catálogo..."));
fetch(URL_HOJA+"&_="+Date.now(),{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("No se pudo leer la hoja");return r.text()}).then(function(t){
  var rows=parseCSV(t),h=rows.shift().map(normalizarEncabezado);
  rows.map(function(r){var o={};h.forEach(function(k,i){o[k]=(r[i]||"").trim()});return o})
    .filter(function(o){return o.codigo&&o.tipo.toLowerCase()===TIPO})
    .forEach(function(o){var g=o.saga_o_serie||o.titulo;if(!grupos[g]){grupos[g]=[];nombres.push(g)}grupos[g].push(o)});
  nombres.sort(function(a,b){return a.localeCompare(b,"es",{sensitivity:"base",numeric:true})});
  mostrarLista();
}).catch(function(){cont.innerHTML="";cont.appendChild(el("p","vacio","No se pudo cargar el catálogo. Intenta más tarde."))});
})();