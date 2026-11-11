/* Mensajito amistoso que aparece cada cierto tiempo (textos editables arriba) */
(()=>{
const mensajesAmistosos=[
'🎬💌 Recuerda que este contenido lo haces tú. ¡Manda tus peticiones y ayudemos a que la zona siga creciendo! 🍿✨',
'🆓💖 Este contenido no tiene costo alguno. Si alguien quiere vendértelo, ¡avísame! 🚨🤝',
'☕🥰 Sabemos que es gratis, pero si te nace, ¡invítame a un café! Gracias por apoyar este rinconcito cinéfilo. 🎥💛',
'🙏💝 Decir gracias no cuesta nada… ¡pero si viene acompañado de un café, mucho mejor! ☕😄✨'
];
const popup=document.getElementById('mensaje-amistoso'),textoPopup=document.getElementById('popup-texto'),cerrarPopup=document.getElementById('cerrar-mensaje');
let temporizadorPopup=null,temporizadorSiguiente=null,ultimoMensaje=-1;
const ocultarPopup=()=>{popup.classList.remove('visible');clearTimeout(temporizadorPopup);programarPopup();};
const programarPopup=()=>{clearTimeout(temporizadorSiguiente);const espera=45000+Math.floor(Math.random()*30001);temporizadorSiguiente=setTimeout(mostrarPopup,espera);};
function mostrarPopup(){let indice=Math.floor(Math.random()*mensajesAmistosos.length);if(mensajesAmistosos.length>1&&indice===ultimoMensaje)indice=(indice+1+Math.floor(Math.random()*(mensajesAmistosos.length-1)))%mensajesAmistosos.length;ultimoMensaje=indice;textoPopup.textContent=mensajesAmistosos[indice];popup.classList.add('visible');temporizadorPopup=setTimeout(()=>{popup.classList.remove('visible');programarPopup();},9500);}
cerrarPopup.addEventListener('click',ocultarPopup);
programarPopup();
})();
