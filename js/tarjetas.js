/* Retraso de 300 ms al abrir las tarjetas */
document.querySelectorAll('.choice').forEach(tarjeta=>{
  tarjeta.addEventListener('click',e=>{
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.button!==0)return;
    e.preventDefault();
    const destino=tarjeta.href;
    setTimeout(()=>{location.href=destino;},300);
  });
});
