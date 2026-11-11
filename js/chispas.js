/* Emojis que salen al tocar tarjetas y botones */
(()=>{
const listas={
  choice:['🍿','✨','🎬','⭐'],
  order:['🎟️','✨','🍿','💖'],
  boton:['✨','📲','💖']
};
function explosion(x,y,lista){
  for(let i=0;i<10;i++){
    const s=document.createElement('span');
    s.className='fx-chispa';
    s.textContent=lista[Math.floor(Math.random()*lista.length)];
    s.style.left=x+'px';
    s.style.top=y+'px';
    document.body.appendChild(s);
    const ang=Math.random()*Math.PI*2;
    const dist=50+Math.random()*70;
    const dx=Math.cos(ang)*dist;
    const dy=Math.sin(ang)*dist-40;
    const giro=Math.random()*360-180;
    const anim=s.animate([
      {transform:'translate(-50%,-50%) scale(.4)',opacity:1},
      {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1.2) rotate(${giro}deg)`,opacity:0}
    ],{duration:700+Math.random()*300,easing:'cubic-bezier(.2,.8,.3,1)'});
    anim.onfinish=()=>s.remove();
  }
}
document.addEventListener('pointerdown',e=>{
  const t=e.target.closest('.choice,.order,.install-button');
  if(!t)return;
  const lista=t.classList.contains('choice')?listas.choice:t.classList.contains('order')?listas.order:listas.boton;
  explosion(e.clientX,e.clientY,lista);
},{passive:true});
})();
