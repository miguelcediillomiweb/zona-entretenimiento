/* Mensajito de apoyo: discreto y nunca aparece mientras se reproduce contenido. */
(()=>{
const mensajesAmistosos=[
'🎬💌 Recuerda que este contenido lo haces tú. ¡Manda tus peticiones y ayudemos a que la zona siga creciendo! 🍿✨',
'🆓💖 Este contenido no tiene costo alguno. Si alguien quiere vendértelo, ¡avísame! 🚨🤝',
'☕🥰 Sabemos que es gratis, pero si te nace, ¡invítame a un café! Gracias por apoyar este rinconcito cinéfilo. 🎥💛',
'🙏💝 Decir gracias no cuesta nada… ¡pero si viene acompañado de un café, mucho mejor! ☕😄✨'
];
const popup=document.getElementById('mensaje-amistoso'),textoPopup=document.getElementById('popup-texto'),cerrarPopup=document.getElementById('cerrar-mensaje');
if(!popup||!textoPopup||!cerrarPopup)return;
let temporizadorPopup=null,temporizadorSiguiente=null,ultimoMensaje=-1,pausado=false;
const reproduciendo=()=>Array.from(document.querySelectorAll('video,audio')).some(m=>!m.paused&&!m.ended&&m.readyState>2);
const ocultar=()=>{popup.classList.remove('visible');clearTimeout(temporizadorPopup);};
const programar=()=>{clearTimeout(temporizadorSiguiente);temporizadorSiguiente=setTimeout(mostrar,180000);};
function mostrar(){if(document.hidden||reproduciendo()){programar();return;}let i=Math.floor(Math.random()*mensajesAmistosos.length);if(mensajesAmistosos.length>1&&i===ultimoMensaje)i=(i+1)%mensajesAmistosos.length;ultimoMensaje=i;textoPopup.textContent=mensajesAmistosos[i];popup.classList.add('visible');temporizadorPopup=setTimeout(()=>{ocultar();programar();},6500);}
function cerrar(){ocultar();programar();}
cerrarPopup.addEventListener('click',cerrar);
document.addEventListener('visibilitychange',()=>{if(document.hidden)ocultar();});
document.addEventListener('play',()=>{ocultar();},{capture:true});
programar();
})();
