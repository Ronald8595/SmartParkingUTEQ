import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'

const VALORES_INICIALES = {
  placa: '',
  marca: '',
  modelo: '',
  anio: '',
  color: '',
  tipo: '',
  foto_url: '',
  foto_fuente_url: '',
  foto_propietario_url: '',
  cedula_enmascarada: '',
  propietario_nombre: '',
  correo_institucional: '',
  autorizado: true,
}

/**
 * Modal con formulario para crear o editar un vehículo.
 *
 * @param {boolean} visible - Controla si el modal está abierto.
 * @param {object|null} vehiculo - Vehículo a editar. `null` significa creación.
 * @param {Function} onGuardar - async (datos) => void. Lanza si falla.
 * @param {Function} onCerrar - Cierra el modal.
 */
const VehiculoFormModal = ({ visible, vehiculo, onGuardar, onCerrar }) => {
  const [form, setForm] = useState(VALORES_INICIALES)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const esEdicion = Boolean(vehiculo)

  useEffect(() => {
    if (visible) {
      setForm(vehiculo ? { ...VALORES_INICIALES, ...vehiculo } : VALORES_INICIALES)
      setError('')
    }
  }, [visible, vehiculo])

  const manejarCambio = (campo) => (evento) => {
    const valor =
      evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value
    setForm((anterior) => ({ ...anterior, [campo]: valor }))
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setError('')

    if (!form.placa || !form.marca || !form.modelo || !form.propietario_nombre) {
      setError('Complete al menos placa, marca, modelo y propietario.')
      return
    }

    const datos = {
      ...form,
      anio: form.anio === '' ? null : Number(form.anio),
    }
    delete datos.id

    setGuardando(true)
    try {
      await onGuardar(datos)
    } catch (errorGuardado) {
      setError(errorGuardado.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onCerrar} size="lg" alignment="center">
      <CForm onSubmit={manejarEnvio}>
        <CModalHeader closeButton>
          <CModalTitle>{esEdicion ? 'Editar vehículo' : 'Nuevo vehículo'}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}

          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel>Placa *</CFormLabel>
              <CFormInput value={form.placa} onChange={manejarCambio('placa')} required />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Marca *</CFormLabel>
              <CFormInput value={form.marca} onChange={manejarCambio('marca')} required />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Modelo *</CFormLabel>
              <CFormInput value={form.modelo} onChange={manejarCambio('modelo')} required />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Año</CFormLabel>
              <CFormInput
                type="number"
                value={form.anio ?? ''}
                onChange={manejarCambio('anio')}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Color</CFormLabel>
              <CFormInput value={form.color} onChange={manejarCambio('color')} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Tipo</CFormLabel>
              <CFormInput
                value={form.tipo}
                onChange={manejarCambio('tipo')}
                placeholder="Automóvil, moto, camioneta..."
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Foto del vehículo (URL)</CFormLabel>
              <CFormInput value={form.foto_url} onChange={manejarCambio('foto_url')} />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Fuente de la foto (URL)</CFormLabel>
              <CFormInput
                value={form.foto_fuente_url}
                onChange={manejarCambio('foto_fuente_url')}
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Foto del propietario (URL)</CFormLabel>
              <CFormInput
                value={form.foto_propietario_url}
                onChange={manejarCambio('foto_propietario_url')}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Cédula enmascarada</CFormLabel>
              <CFormInput
                value={form.cedula_enmascarada}
                onChange={manejarCambio('cedula_enmascarada')}
                placeholder="Ej. 172345***"
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Nombre del propietario *</CFormLabel>
              <CFormInput
                value={form.propietario_nombre}
                onChange={manejarCambio('propietario_nombre')}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Correo institucional</CFormLabel>
              <CFormInput
                type="email"
                value={form.correo_institucional}
                onChange={manejarCambio('correo_institucional')}
              />
            </CCol>

            <CCol md={12}>
              <CFormCheck
                checked={form.autorizado}
                onChange={manejarCambio('autorizado')}
                label="Vehículo autorizado"
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </CButton>
          <CButton color="success" type="submit" disabled={guardando}>
            {guardando ? <CSpinner size="sm" /> : esEdicion ? 'Guardar cambios' : 'Crear vehículo'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default VehiculoFormModal