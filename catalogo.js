var SHEET_ID="1Rh9oyXSsYypBgPXSAzwW0kYdvugEtHG6FiDKrfxRK8s";
var BOT="Contenedorpelisseries_bot";
var TIPO=document.body.getAttribute("data-tipo");
var cont=document.getElementById("catalogo");
var URL_HOJA="https://docs.google.com/spreadsheets/d/"+SHEET_ID+"/gviz/tq?tqx=out:csv&gid=0";
var grupos={},nombres=[];

function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function botLink(cod){return "https://t.me/"+BOT+"?start="+encodeURIComponent(cod)}
function num(v){var n=parseInt(v,10);return isNaN(n)?0:n}
function portadaDe(lista,campo){var x=lista.filter(function(o){return o[campo]})[0];return x?x[campo]:""}
function parseCSV(t){
  var r=[],f=[],c="",q=false,i,ch;
  for(i=0;i<t.length;i++){ch=t[i];
    if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}
    else if(ch=='"')q=true;
    else if(ch==","){f.push(c);c=""}
    else if(ch=="\n"){f.push(c);r.push(f);f=[];c=""}
    else if(ch!="\r")c+=ch}
  if(c!==""||f.length){f.push(c);r.push(f)}
  return r}

function mostrarLista(){
  cont.innerHTML="";window.scrollTo(0,0);
  if(!nombres.length){cont.appendChild(el("p","vacio","Aún no hay títulos aquí. ¡Pronto habrá más!"));return}
  var grid=el("div","grid");
  nombres.forEach(function(n){
    var lista=grupos[n],card=el("button","card"),cover=el("div","cover",n);
    var p=portadaDe(lista,"portada");
    if(p){var img=el("img");img.alt=n;img.loading="lazy";img.src="portadas/"+encodeURI(p);
      img.onerror=function(){img.remove()};cover.appendChild(img)}
    card.appendChild(cover);card.appendChild(el("span","nombre",n));
    card.onclick=function(){
      if(TIPO==="pelicula"&&lista.length===1){location.href=botLink(lista[0].codigo)}
      else mostrarDetalle(n)};
    grid.appendChild(card)});
  cont.appendChild(grid)}

function mostrarDetalle(n){
  cont.innerHTML="";window.scrollTo(0,0);
  var lista=grupos[n].slice();
  if(TIPO==="serie"){lista.sort(function(a,b){return num(a.temporada)-num(b.temporada)||num(a.episodio)-num(b.episodio)})}
  else{lista.sort(function(a,b){return num(a.orden)-num(b.orden)})}
  var volver=el("button","btn alt","← Volver al catálogo");volver.style.marginTop="0";volver.onclick=mostrarLista;
  cont.appendChild(volver);
  cont.appendChild(el("h2","titulo",n));
  var temp=null;
  lista.forEach(function(o){
    if(TIPO==="serie"&&o.temporada!==temp){
      temp=o.temporada;
      cont.appendChild(el("p","sub","Temporada "+temp));
      var delTemp=lista.filter(function(x){return x.temporada===temp});
      var f=portadaDe(delTemp,"portada_temporada")||portadaDe(delTemp,"portada");
      if(f){
        var im=el("img");im.alt="Temporada "+temp;im.loading="lazy";im.src="portadas/"+encodeURI(f);
        im.style.cssText="display:block;width:160px;max-width:60%;margin:8px auto 12px;border-radius:12px;box-shadow:0 4px 14px #0008";
        im.onerror=function(){im.remove()};
        cont.appendChild(im)}}
    var a=el("a","btn item","▶ "+o.titulo);a.href=botLink(o.codigo);a.target="_blank";a.rel="noopener";
    cont.appendChild(a)})}

fetch(URL_HOJA).then(function(r){return r.text()}).then(function(t){
  var rows=parseCSV(t),h=rows.shift().map(function(s){return s.trim().toLowerCase()});
  rows.map(function(r){var o={};h.forEach(function(k,i){o[k]=(r[i]||"").trim()});return o})
    .filter(function(o){return o.codigo&&o.tipo.toLowerCase()===TIPO})
    .forEach(function(o){var g=o.saga_o_serie||o.titulo;if(!grupos[g]){grupos[g]=[];nombres.push(g)}grupos[g].push(o)});
  nombres.sort(function(a,b){return a.localeCompare(b,"es",{sensitivity:"base",numeric:true})});
  mostrarLista();
}).catch(function(){cont.innerHTML="";cont.appendChild(el("p","vacio","No se pudo cargar el catálogo. Intenta más tarde."))});