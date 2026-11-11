/* Boton e instalacion de la app (PWA) */
(()=>{
let eventoInstalacion=null;const botonInstalar=document.getElementById('install-button'),notaInstalar=document.getElementById('install-note'),bannerInstalar=document.getElementById('install-banner');
const yaInstalada=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
if(yaInstalada()){bannerInstalar.hidden=true;}
window.addEventListener('beforeinstallprompt',evento=>{evento.preventDefault();eventoInstalacion=evento;botonInstalar.textContent='📲 INSTALAR MI APP';notaInstalar.textContent='Toca el botón y confirma para tenerla siempre a la mano.';});
window.addEventListener('appinstalled',()=>{bannerInstalar.hidden=true;notaInstalar.textContent='¡Zona Entretenimiento ya está instalada!';eventoInstalacion=null;});
botonInstalar.addEventListener('click',async()=>{if(eventoInstalacion){eventoInstalacion.prompt();const eleccion=await eventoInstalacion.userChoice;notaInstalar.textContent=eleccion.outcome==='accepted'?'¡Listo! La instalación fue aceptada.':'Puedes instalarla cuando quieras desde este botón.';eventoInstalacion=null;return;}if(yaInstalada()){notaInstalar.textContent='La app ya está instalada en este dispositivo.';return;}notaInstalar.textContent='En el menú del navegador, elige “Instalar aplicación” o “Agregar a pantalla principal”.';});
})();
