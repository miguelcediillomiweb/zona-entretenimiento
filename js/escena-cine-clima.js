/* Clima real y animación de la escena de bienvenida.
   Actualiza cada 5 minutos; no solicita permiso GPS repetidamente. */
(()=>{"use strict";
const scene=document.getElementById("cineEscena");if(!scene)return;
const $=id=>document.getElementById(id);
const icon=$("climaIcono"),label=$("climaTexto"),temp=$("climaTemperatura"),ambient=$("ambienteTexto");
const fallbackName="Reyes Acozac";
const weatherNames={
0:["Despejado","☀️","soleado"],1:["Mayormente despejado","🌤️","soleado"],2:["Parcialmente nublado","⛅","nublado"],3:["Nublado","☁️","nublado"],45:["Neblina","🌫️","nublado"],48:["Niebla helada","🌫️","nublado"],51:["Llovizna ligera","🌦️","lluvia"],53:["Llovizna","🌦️","lluvia"],55:["Llovizna intensa","🌧️","lluvia"],56:["Llovizna helada","🌧️","lluvia"],57:["Llovizna helada intensa","🌧️","lluvia"],61:["Lluvia ligera","🌦️","lluvia"],63:["Lluvia","🌧️","lluvia"],65:["Lluvia intensa","🌧️","lluvia"],66:["Lluvia helada","🌧️","lluvia"],67:["Lluvia helada intensa","🌧️","lluvia"],71:["Nieve ligera","🌨️","nieve"],73:["Nevando","🌨️","nieve"],75:["Nieve intensa","❄️","nieve"],77:["Granizo pequeño","🌨️","nieve"],80:["Chubascos ligeros","🌦️","lluvia"],81:["Chubascos","🌧️","lluvia"],82:["Chubascos fuertes","⛈️","tormenta"],85:["Chubascos de nieve","🌨️","nieve"],86:["Nieve intensa","❄️","nieve"],95:["Tormenta eléctrica","⛈️","tormenta"],96:["Tormenta con granizo","⛈️","tormenta"],99:["Tormenta fuerte con granizo","⛈️","tormenta"]};
let coords=null,refreshing=false;
function setMoment(isDay){
 const day=!!isDay;scene.dataset.momento=day?"dia":"noche";
 if(ambient)ambient.textContent=day?"Una tarde perfecta para disfrutar":"La noche se disfruta mejor con una película";
}
function showWeather(w){
 const info=weatherNames[w.weather_code]||["Clima actual","🌤️","nublado"];
 if(icon)icon.textContent=info[1];if(label)label.textContent=info[0];
 if(temp)temp.textContent=Math.round(w.temperature_2m)+"°";
 scene.dataset.clima=info[2];setMoment(w.is_day===1);
 if(w.precipitation>0&&info[2]==="soleado")scene.dataset.clima="lluvia";
}
async function loadWeather(lat,lon){
 const url="https://api.open-meteo.com/v1/forecast?latitude="+encodeURIComponent(lat)+"&longitude="+encodeURIComponent(lon)+"&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto";
 const res=await fetch(url,{cache:"no-store"});if(!res.ok)throw Error("weather");
 const data=await res.json();if(!data.current)throw Error("empty");showWeather(data.current);
}
async function geocodeFallback(){
 const u="https://geocoding-api.open-meteo.com/v1/search?name="+encodeURIComponent(fallbackName)+"&count=15&language=es&format=json";
 const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw Error("geo");
 const d=await r.json(),list=d.results||[];
 const match=list.find(x=>/México|Mexico/i.test((x.country||"")+" "+(x.country_code||""))&&/Tecámac|Tecamac/i.test((x.admin2||"")+" "+(x.admin1||"")))||list.find(x=>/México|Mexico/i.test((x.country||"")+" "+(x.country_code||"")))||list[0];
 if(!match)throw Error("notfound");coords={lat:match.latitude,lon:match.longitude};await loadWeather(coords.lat,coords.lon);
}
async function refresh(){
 if(refreshing)return;refreshing=true;
 try{
  if(coords){await loadWeather(coords.lat,coords.lon);}
  else if(navigator.geolocation){
   const pos=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout:6500,maximumAge:300000}));
   coords={lat:pos.coords.latitude,lon:pos.coords.longitude};await loadWeather(coords.lat,coords.lon);
  }else await geocodeFallback();
 }catch(e){
  try{if(!coords)await geocodeFallback();else throw e;}
  catch(_){if(!scene.dataset.momento)setMoment(new Date().getHours()>=6&&new Date().getHours()<19);if(!scene.dataset.clima)scene.dataset.clima="nublado";}
 }finally{refreshing=false;}
}
refresh();
setInterval(refresh,5*60*1000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();});
})();