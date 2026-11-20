# Zona Entretenimiento para Android

Este proyecto Android está separado de la web publicada. La aplicación abre la web remota de GitHub Pages, por lo que los cambios de contenido de la web se reflejan al abrir la app con conexión.

## Archivos de la web que no deben modificarse para esta app

La integración actual de OneSignal Web y su service worker permanecen independientes. La app utiliza el SDK nativo de OneSignal.

## Control remoto

El archivo `app-config.json` permite suspender o reactivar el acceso desde la APK:
- `enabled: true`: permite abrir la web.
- `enabled: false`: muestra el mensaje de mantenimiento.

Si el control remoto no está disponible, la app permite el acceso para evitar bloquear a los usuarios por una falla temporal de conexión.

## Notificaciones Android

El SDK nativo ya está incluido e inicializado con el App ID existente de OneSignal. Para entregar notificaciones Android todavía se debe configurar Google Android (FCM) en el mismo panel de OneSignal y añadir la configuración Firebase correspondiente al proyecto Android. La web y sus notificaciones no necesitan modificarse.

## Compilación

GitHub Actions genera una APK de prueba al ejecutar manualmente el workflow **Construir APK Android** o al actualizar archivos de esta carpeta en la rama `app-android-separada`.

La APK debug es para pruebas; antes de distribuir una versión final habrá que configurar firma de lanzamiento y probarla en el teléfono.
