/* Emojis solo en botones de acción; nunca en las portadas del catálogo. */
(function(){
  if(!document.body || !document.body.matches('[data-tipo]')) return;
  var emojis=document.body.dataset.tipo==='serie'?['📺','✨','💠','🔹']:['🎬','🍿','✨','🌟'];
  var max=6;
  document.addEventListener('click',function(ev){
    var btn=ev.target.closest('a.btn,button,.btn, .order, .choice, .install-button');
    if(!btn || btn.closest('.card') || btn.matches('.cover')) return;
    var x=ev.clientX,y=ev.clientY;
    if(!x&&!y){var r=btn.getBoundingClientRect();x=r.left+r.width/2;y=r.top+r.height/2}
    for(var i=0;i<max;i++){
      var el=document.createElement('span');el.className='fx-chispa';el.textContent=emojis[i%emojis.length];
      el.style.left=x+'px';el.style.top=y+'px';document.body.appendChild(el);
      var dx=(Math.random()-.5)*110,dy=-25-Math.random()*95,rot=(Math.random()-.5)*70;
      var anim=el.animate([{transform:'translate(-50%,-50%) scale(.45) rotate(0deg)',opacity:1},{transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(1.15) rotate('+rot+'deg)',opacity:0}],{duration:650+Math.random()*250,easing:'cubic-bezier(.15,.7,.25,1)'});
      anim.onfinish=function(){this.effect.target.remove()};
    }
  },{passive:true});
})();