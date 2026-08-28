import React from 'react'
import { CBadge, CListGroup, CListGroupItem } from '@coreui/react'

const formatoFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleString('es-EC', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

const formatoDuracion = (minutos) => {
  if (minutos == null) return null
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return `${horas} h ${resto} min`
}

/**
 * Lista el historial de sesiones (entrada/salida) de un puesto, más
 * reciente primero. Cada fila viene de registros_estacionamiento.
 */
const HistorialPuesto = ({ historial }) => {
  if (!historial || historial.length === 0) {
    return <p className="text-body-secondary mb-0">No hay historial disponible para este puesto.</p>
  }

  return (
    <CListGroup>
      {historial.map((registro) => (
        <CListGroupItem key={registro.id}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <CBadge color={registro.fecha_salida ? 'secondary' : 'danger'} className="me-2">
                {registro.fecha_salida ? 'Finalizado' : 'En curso'}
              </CBadge>
              <strong>{registro.placa_detectada}</strong>
            </div>
            {registro.distancia_cm_entrada != null && (
              <span className="text-body-secondary small">
                {Math.round(registro.distancia_cm_entrada)} cm
              </span>
            )}
          </div>

          <div className="small text-body-secondary mt-1">
            Entrada: {formatoFecha(registro.fecha_entrada)}
            {registro.fecha_salida && <> · Salida: {formatoFecha(registro.fecha_salida)}</>}
            {registro.duracion_minutos != null && (
              <> · Duración: {formatoDuracion(registro.duracion_minutos)}</>
            )}
          </div>

          {registro.observacion && (
            <div className="small fst-italic mt-1">{registro.observacion}</div>
          )}
        </CListGroupItem>
      ))}
    </CListGroup>
  )
}

export default HistorialPuesto
