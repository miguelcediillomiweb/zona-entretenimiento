/* Emojis al tocar botones - Zona Entretenimiento */
(function(){
  if(!document.body||!Element.prototype.animate)return;
  var emojis=['✨','🍿','🎬','💖'];
  function explosion(x,y){
    for(var i=0;i<10;i++){
      var s=document.createElement('span');
      s.className='fx-chispa';
      s.textContent=emojis[Math.floor(Math.random()*emojis.length)];
      s.style.left=x+'px';
      s.style.top=y+'px';
      document.body.appendChild(s);
      var ang=Math.random()*Math.PI*2;
      var dist=50+Math.random()*70;
      var dx=Math.cos(ang)*dist;
      var dy=Math.sin(ang)*dist-40;
      var giro=Math.random()*360-180;
      var anim=s.animate([
        {transform:'translate(-50%,-50%) scale(.4)',opacity:1},
        {transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(1.2) rotate('+giro+'deg)',opacity:0}
      ],{duration:700+Math.random()*300,easing:'cubic-bezier(.2,.8,.3,1)'});
      anim.onfinish=(function(el){return function(){el.remove();};})(s);
    }
  }
  document.addEventListener('pointerdown',function(e){
    var t=e.target.closest&&e.target.closest('.btn,.order,.install-button,.choice');
    if(t)explosion(e.clientX,e.clientY);
  },{passive:true});
})();

/* Origen APP: solo actúa dentro de la aplicación (?origen=app) */
(function () {
  try {
    if (new URLSearchParams(location.search).get("origen") !== "app") return;

    function marcar(a) {
      var h = a.getAttribute("href");
      if (!h || !/^[a-z0-9_\-]+\.html(\?|#|$)/i.test(h)) return;
      if (/[?&]origen=/.test(h)) return;
      a.setAttribute("href", h + (h.indexOf("?") > -1 ? "&" : "?") + "origen=app");
    }

    function marcarTodos() {
      var links = document.querySelectorAll("a[href]");
      for (var i = 0; i < links.length; i++) marcar(links[i]);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", marcarTodos);
    } else {
      marcarTodos();
    }

    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (a) marcar(a);
    }, true);
  } catch (x) {}
})();
