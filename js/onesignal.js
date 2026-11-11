/* Notificaciones OneSignal */
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "7aba97c6-14da-43b9-bddb-89aa766d321e",
      serviceWorkerPath: "/zona-entretenimiento/sw.js",
      serviceWorkerParam: { scope: "/zona-entretenimiento/" }
    });
    try { OneSignal.User.addTag("peliculas", "si"); } catch (e) {}
  });
