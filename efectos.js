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
    var t=e.target.closest&&e.target.closest('.btn,.order,.install-button');
    if(t)explosion(e.clientX,e.clientY);
  },{passive:true});
})();
