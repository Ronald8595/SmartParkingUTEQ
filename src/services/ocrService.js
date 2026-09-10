/**
 * Error de solicitud HTTP hacia el servicio de OCR. Conserva el código
 * de estado para que la capa de UI pueda traducirlo a un mensaje claro
 * (ver utils/errorHandler.js).
 */
export class OcrHttpError extends Error {
  constructor(status) {
    super(`El servicio OCR respondió con el código ${status}`)
    this.name = 'OcrHttpError'
    this.status = status
  }
}

/**
 * Envía una imagen (Blob/File) al endpoint OCR configurado en
 * VITE_OCR_ENDPOINT y devuelve el JSON de resultado.
 *
 * La URL del endpoint nunca se escribe en el código: se lee desde la
 * variable de entorno para no publicarla en el repositorio. La imagen
 * se envía como cuerpo binario (NO como Base64 dentro de un JSON).
 *
 * @param {Blob|File} archivo - Imagen capturada o subida.
 * @returns {Promise<object>} Respuesta del endpoint ya parseada.
 */
export const reconocerPlaca = async (archivo) => {
  const endpoint = import.meta.env.VITE_OCR_ENDPOINT

  if (!endpoint) {
    throw new Error(
      'VITE_OCR_ENDPOINT no está configurado. Defina la variable de entorno con la URL provista por el docente.',
    )
  }

  const respuesta = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': archivo.type || 'application/octet-stream',
    },
    body: archivo,
  })

  if (!respuesta.ok) {
    throw new OcrHttpError(respuesta.status)
  }

  const contenido = await respuesta.text()
  try {
    return JSON.parse(contenido)
  } catch {
    throw new Error('El servicio de reconocimiento devolvió una respuesta que no es JSON válido.')
  }
}
