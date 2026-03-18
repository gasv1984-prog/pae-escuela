/**
 * CÓDIGO GOOGLE APPS SCRIPT (Backend)
 * Este archivo debes copiarlo y pegarlo en el editor de Apps Script tu Google Sheets.
 */

// Nombre de la hoja de cálculo donde están los datos
const NOMBRE_HOJA = "Estudiantes"; 
const HOJA_REGISTRO_DIARIO = "Asistencia"; // Donde guardaremos la hora del almuerzo

/**
 * Función que recibe datos desde la página web (EJ: nuevo escaneo o nuevo estudiante)
 */
function doPost(e) {
  // Configurar CORS para permitir que cualquier sitio web lo llame
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // =============== ACCIÓN: REGISTRAR ASISTENCIA ===============
    if (data.action === "registrar_asistencia") {
      const hojaAsistencia = ss.getSheetByName(HOJA_REGISTRO_DIARIO) || ss.insertSheet(HOJA_REGISTRO_DIARIO);
      const fechaActual = new Date();
      
      // Si la hoja está vacía, poner encabezados
      if (hojaAsistencia.getLastRow() === 0) {
        hojaAsistencia.appendRow(["Fecha y Hora", "Documento"]);
      }

      // Guardar el registro
      hojaAsistencia.appendRow([fechaActual, data.documento]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "Éxito", 
        message: "Asistencia registrada"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // =============== ACCIÓN: REPOSITORIO DE DATOS (NUEVO ESTUDIANTE) ===============
    // (Por si quieres que el formulario de "Registro" guarde automáticamente acá)
    if (data.action === "crear_estudiante") {
      const hojaEstudiantes = ss.getSheetByName(NOMBRE_HOJA) || ss.insertSheet(NOMBRE_HOJA);
      if (hojaEstudiantes.getLastRow() === 0) {
        hojaEstudiantes.appendRow(["Documento", "Nombre", "Grado"]);
      }
      
      hojaEstudiantes.appendRow([data.documento, data.nombre, data.grado]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "Éxito", 
        message: "Estudiante creado"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "Error", 
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función para descargar la base de datos a la memoria del celular
 * (Para que sea ultra rápida)
 */
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaEstudiantes = ss.getSheetByName(NOMBRE_HOJA);
  
  if (!hojaEstudiantes) {
    return ContentService.createTextOutput(JSON.stringify({error: "Hoja 'Estudiantes' no encontrada"}))
           .setMimeType(ContentService.MimeType.JSON);
  }

  const datos = hojaEstudiantes.getDataRange().getValues();
  const jsonArray = [];

  // Omite la cabecera (fila 0)
  for (let i = 1; i < datos.length; i++) {
    // Si la fila tiene al menos el documento
    if(datos[i][0]) {
      jsonArray.push({
        documento: String(datos[i][0]).trim(),
        nombre: datos[i][1],
        grado: datos[i][2]
      });
    }
  }

  // Devolver toda la base de estudiantes en JSON
  return ContentService.createTextOutput(JSON.stringify(jsonArray))
         .setMimeType(ContentService.MimeType.JSON);
}

// Para lidiar con preflights de CORS (Opciones)
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return ContentService.createTextOutput()
         .setHeaders(headers);
}
