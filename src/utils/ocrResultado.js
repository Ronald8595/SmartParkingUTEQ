/**
 * Utilidades para interpretar la respuesta del endpoint OCR sin inventar
 * ni modificar datos: solo normalizan el campo `estado` y dan formato de
 * presentación a los valores que la API ya entrega.
 */

/**
 * Normaliza un texto de estado ("Encontrado", "no_registrado",
 * "Baja confianza", etc.) a una forma comparable: minúsculas, sin
 * acentos y con espacios convertidos a guion bajo.
 */
const normalizar = (texto) =>
  (texto ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

/**
 * Clasifica la respuesta del endpoint en uno de los estados conocidos
 * de la fase 2, apoyándose primero en `vehiculo_encontrado` (booleano)
 * y luego en el texto de `estado`. Si no coincide con ninguno de los
 * casos documentados, devuelve 'desconocido' para que la UI muestre la
 * respuesta cruda sin asumir nada.
 *
 * @param {object|null} resultado - Respuesta ya parseada del endpoint.
 * @returns {'encontrado'|'no_registrado'|'sin_placa'|'baja_confianza'|'multiples_placas'|'desconocido'}
 */
export const clasificarEstado = (resultado) => {
  if (!resultado) return 'desconocido'

  const estadoNormalizado = normalizar(resultado.estado)

  if (resultado.vehiculo_encontrado === true || estadoNormalizado === 'encontrado') {
    return 'encontrado'
  }
  if (estadoNormalizado.includes('sin_placa')) return 'sin_placa'
  if (estadoNormalizado.includes('baja_confianza')) return 'baja_confianza'
  if (
    estadoNormalizado.includes('multiples_placas') ||
    estadoNormalizado.includes('multiples_plates') ||
    estadoNormalizado.includes('multiple_placas')
  ) {
    return 'multiples_placas'
  }
  if (estadoNormalizado.includes('no_registrado') || resultado.vehiculo_encontrado === false) {
    return 'no_registrado'
  }

  return 'desconocido'
}

/**
 * La API puede anidar los datos del vehículo en `resultado.vehiculo` o
 * devolverlos en el nivel raíz de la respuesta; esta función solo lee
 * lo que ya vino en uno u otro lugar, sin generar valores nuevos.
 */
export const obtenerDatosVehiculo = (resultado) => resultado?.vehiculo ?? resultado ?? {}

/**
 * Da formato a la confianza del OCR. Acepta tanto un número (0–1 o
 * 0–100) como un texto que la API ya haya formateado (ej. "88.9 %").
 */
export const formatearConfianza = (confianza) => {
  if (confianza === null || confianza === undefined || confianza === '') return null
  if (typeof confianza === 'number') {
    const porcentaje = confianza <= 1 ? confianza * 100 : confianza
    return `${porcentaje.toFixed(1)} %`
  }
  return String(confianza)
}

/**
 * Enmascara una cédula dejando visibles solo los últimos 4 dígitos. Si
 * el valor ya viene enmascarado desde la API, se muestra tal cual.
 */
export const enmascararCedula = (cedula) => {
  if (!cedula) return null
  const texto = String(cedula)
  if (texto.includes('*')) return texto
  if (texto.length <= 4) return texto
  return '*'.repeat(texto.length - 4) + texto.slice(-4)
}

/**
 * Quita un posible prefijo "data:...;base64," que algunos backends ya
 * incluyen dentro del propio campo base64, para no duplicarlo al
 * construir la URL data:.
 */
const limpiarBase64 = (valor) => {
  const texto = String(valor)
  const indice = texto.indexOf('base64,')
  return indice >= 0 ? texto.slice(indice + 'base64,'.length) : texto
}

/**
 * Busca, en distintas ubicaciones y con distintos nombres posibles, el
 * base64 y el mime type de la imagen ya marcada por el servicio OCR.
 * Esto tolera variantes de nomenclatura del backend sin tener que
 * adivinar un único nombre de campo "correcto".
 */
const CANDIDATOS_BASE64 = [
  'imagen_marcada_base64',
  'imagen_base64_marcada',
  'imagen_procesada_base64',
  'imagen_placa_base64',
  'imagen_anotada_base64',
  'foto_marcada_base64',
  'image_marked_base64',
  'marked_image_base64',
]
const CANDIDATOS_MIME = [
  'imagen_marcada_mime_type',
  'imagen_marcada_mimetype',
  'imagen_procesada_mime_type',
  'mime_type_imagen_marcada',
  'marked_image_mime_type',
]
const CANDIDATOS_CONTENEDOR = ['imagen_marcada', 'imagen_procesada', 'marked_image']

const buscarEnObjeto = (obj, claves) => {
  if (!obj) return null
  for (const clave of claves) {
    if (obj[clave]) return obj[clave]
  }
  return null
}

/**
 * Construye la URL data: para mostrar la imagen ya marcada por el
 * servicio OCR, si la respuesta trae los campos correspondientes (en el
 * nivel raíz o anidados bajo un contenedor tipo `imagen_marcada`).
 */
export const construirUrlImagenMarcada = (resultado) => {
  if (!resultado) return null

  let base64 = buscarEnObjeto(resultado, CANDIDATOS_BASE64)
  let mimeType = buscarEnObjeto(resultado, CANDIDATOS_MIME)

  if (!base64) {
    for (const clave of CANDIDATOS_CONTENEDOR) {
      const contenedor = resultado[clave]
      if (contenedor && typeof contenedor === 'object') {
        base64 = base64 ?? buscarEnObjeto(contenedor, ['base64', 'data', ...CANDIDATOS_BASE64])
        mimeType = mimeType ?? buscarEnObjeto(contenedor, ['mime_type', 'mimetype', 'tipo', ...CANDIDATOS_MIME])
      }
    }
  }

  if (!base64) {
    // eslint-disable-next-line no-console
    console.warn(
      '[MonitoreoEntrada] La respuesta del OCR no trae un campo reconocible de imagen marcada. Claves recibidas:',
      Object.keys(resultado),
      resultado,
    )
    return null
  }

  return `data:${mimeType || 'image/jpeg'};base64,${limpiarBase64(base64)}`
}