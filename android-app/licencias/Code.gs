/**
 * ZONA ENTRETENIMIENTO · Licencias por dispositivo
 * Despliega como Aplicación web: ejecutar como propietario, acceso "Cualquier usuario".
 * La hoja se crea con configurarLicencias() desde el editor de Apps Script.
 */

const VERSION_API = "1";
const HOJA_LICENCIAS = "Licencias";
const HOJA_INTENTOS = "Intentos";

function configurarLicencias() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty("SPREADSHEET_ID");
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create("Zona Entretenimiento - Control de licencias");
    props.setProperty("SPREADSHEET_ID", ss.getId());
  }

  let lic = ss.getSheetByName(HOJA_LICENCIAS);
  if (!lic) lic = ss.insertSheet(HOJA_LICENCIAS);
  if (lic.getLastRow() === 0) {
    lic.appendRow(["Codigo", "Estado", "DeviceId", "Cliente", "Creado", "Activado", "UltimaConexion"]);
    lic.setFrozenRows(1);
  }

  let intentos = ss.getSheetByName(HOJA_INTENTOS);
  if (!intentos) intentos = ss.insertSheet(HOJA_INTENTOS);
  if (intentos.getLastRow() === 0) {
    intentos.appendRow(["Fecha", "Codigo", "DeviceId", "Resultado"]);
    intentos.setFrozenRows(1);
  }

  const info = "Hoja creada y lista: " + ss.getUrl();
  Logger.log(info);
  return info;
}

/** Ejecuta esta función desde el menú para crear diez claves nuevas. */
function generarDiezCodigos() {
  return generarCodigos(10);
}

/** También permite generar entre 1 y 100 claves indicando la cantidad. */
function generarCodigos(cantidad) {
  cantidad = Math.max(1, Math.min(100, Number(cantidad) || 1));
  const ss = obtenerHoja_();
  const sh = ss.getSheetByName(HOJA_LICENCIAS);
  const existentes = new Set(sh.getLastRow() > 1
    ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues().flat()
    : []);
  const filas = [];
  while (filas.length < cantidad) {
    const codigo = crearCodigo_();
    if (!existentes.has(codigo)) {
      existentes.add(codigo);
      filas.push([codigo, "ACTIVA", "", "", new Date(), "", ""]);
    }
  }
  sh.getRange(sh.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
  Logger.log("Códigos creados: " + filas.map(f => f[0]).join(", "));
  return filas.map(f => f[0]);
}

function doGet() {
  return salida_({ ok: true, service: "Zona Entretenimiento Licencias", api: VERSION_API });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = String(data.action || "");
    if (action !== "activate" && action !== "check") {
      return salida_({ ok: false, error: "Acción no válida." });
    }

    const codigo = normalizarCodigo_(data.code);
    const deviceId = String(data.deviceId || "").trim();
    if (!codigo || !/^[a-f0-9-]{20,80}$/i.test(deviceId)) {
      return salida_({ ok: false, error: "Datos incompletos." });
    }

    const ss = obtenerHoja_();
    const sh = ss.getSheetByName(HOJA_LICENCIAS);
    const last = sh.getLastRow();
    if (last < 2) {
      registrarIntento_(ss, codigo, deviceId, "SIN_LICENCIAS");
      return salida_({ ok: false, error: "Código no válido." });
    }

    const rows = sh.getRange(2, 1, last - 1, 7).getValues();
    const index = rows.findIndex(r => normalizarCodigo_(r[0]) === codigo);
    if (index < 0) {
      registrarIntento_(ss, codigo, deviceId, "CODIGO_INEXISTENTE");
      return salida_({ ok: false, error: "Código no válido." });
    }

    const rowNumber = index + 2;
    const row = rows[index];
    const estado = String(row[1] || "").toUpperCase();
    const dispositivoVinculado = String(row[2] || "");

    if (estado !== "ACTIVA") {
      registrarIntento_(ss, codigo, deviceId, "LICENCIA_REVOCADA");
      return salida_({ ok: false, error: "Esta licencia está desactivada." });
    }

    if (action === "activate") {
      if (!dispositivoVinculado) {
        sh.getRange(rowNumber, 3).setValue(deviceId);
        sh.getRange(rowNumber, 6).setValue(new Date());
        sh.getRange(rowNumber, 7).setValue(new Date());
        registrarIntento_(ss, codigo, deviceId, "ACTIVACION_OK");
        return salida_({ ok: true, activated: true });
      }
      if (dispositivoVinculado !== deviceId) {
        registrarIntento_(ss, codigo, deviceId, "DISPOSITIVO_DUPLICADO");
        return salida_({ ok: false, error: "Este código ya está vinculado a otro teléfono." });
      }
    } else if (dispositivoVinculado !== deviceId) {
      registrarIntento_(ss, codigo, deviceId, "DISPOSITIVO_NO_AUTORIZADO");
      return salida_({ ok: false, error: "Este teléfono no está autorizado para esta licencia." });
    }

    sh.getRange(rowNumber, 7).setValue(new Date());
    registrarIntento_(ss, codigo, deviceId, "VALIDACION_OK");
    return salida_({ ok: true, activated: true });
  } catch (err) {
    return salida_({ ok: false, error: "Servicio temporalmente no disponible." });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function obtenerHoja_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Ejecuta configurarLicencias() primero.");
  return SpreadsheetApp.openById(id);
}

function registrarIntento_(ss, codigo, deviceId, resultado) {
  const sh = ss.getSheetByName(HOJA_INTENTOS);
  sh.appendRow([new Date(), codigo, deviceId, resultado]);
}

function crearCodigo_() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s.slice(0, 4) + "-" + s.slice(4, 8) + "-" + s.slice(8);
}

function normalizarCodigo_(v) {
  return String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function salida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
