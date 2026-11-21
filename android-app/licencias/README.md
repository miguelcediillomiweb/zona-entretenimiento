# Control de licencias · Zona Entretenimiento

Este servicio vincula cada código a un solo identificador aleatorio guardado en el almacenamiento privado de la APK. No usa IMEI, contactos, GPS ni IP.

## Preparación (una sola vez)

1. Entra a https://script.google.com/ con la cuenta Google propietaria.
2. Crea un proyecto nuevo y pega el contenido completo de `Code.gs` de esta carpeta.
3. Guarda y ejecuta la función `configurarLicencias`. Autoriza los permisos solicitados.
4. En el registro de ejecución aparecerá el enlace de la hoja creada. Guárdalo.
5. Ejecuta `generarCodigos` con el argumento `10` para crear diez códigos. Se registrarán en la hoja **Licencias**.
6. Despliega > Nueva implementación > Aplicación web:
   - Ejecutar como: Yo.
   - Quién tiene acceso: Cualquier usuario.
7. Copia la URL terminada en `/exec`. Esa URL se configurará en la APK.

## Administración desde Google Sheets

- **Revocar:** cambia Estado de `ACTIVA` a `REVOCADA`.
- **Reactivar:** cambia Estado de `REVOCADA` a `ACTIVA`.
- **Liberar un teléfono:** borra únicamente el valor de la columna `DeviceId` de esa fila. El siguiente teléfono que active el código quedará vinculado.
- **Intentos:** la hoja **Intentos** registra códigos incorrectos, intentos desde otro dispositivo y validaciones. No registra IP ni datos personales.

No compartas públicamente la hoja ni el proyecto de Apps Script. La URL /exec es pública para que la APK pueda consultarla; la protección está en los códigos aleatorios y en la vinculación al dispositivo.

## Importante

La API no activa licencias por sí sola hasta que la APK se conecte a la URL /exec. No pegues contraseñas ni claves privadas en este repositorio. Antes de distribuir la actualización se debe probar con una licencia de prueba y conservar el mismo keystore de firma.
