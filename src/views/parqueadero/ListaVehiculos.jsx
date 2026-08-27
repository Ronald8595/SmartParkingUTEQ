import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'

import { useVehiculos } from '../../hooks/useVehiculos'
import VehiculoFormModal from './VehiculoFormModal'

const ListaVehiculos = () => {
  const {
    vehiculos,
    cargando,
    error,
    recargar,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
  } = useVehiculos()
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const vehiculosPorPagina = 10

  const [modalFormVisible, setModalFormVisible] = useState(false)
  const [vehiculoEnEdicion, setVehiculoEnEdicion] = useState(null)
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')

  useEffect(() => {
    if (!mensajeExito) return undefined
    const temporizador = setTimeout(() => setMensajeExito(''), 4000)
    return () => clearTimeout(temporizador)
  }, [mensajeExito])

  const abrirCreacion = () => {
    setVehiculoEnEdicion(null)
    setModalFormVisible(true)
  }

  const abrirEdicion = (vehiculo) => {
    setVehiculoEnEdicion(vehiculo)
    setModalFormVisible(true)
  }

  const cerrarFormulario = () => {
    setModalFormVisible(false)
    setVehiculoEnEdicion(null)
  }

  const guardarVehiculo = async (datos) => {
    if (vehiculoEnEdicion) {
      await actualizarVehiculo(vehiculoEnEdicion.id, datos)
      setMensajeExito('Vehículo actualizado correctamente.')
    } else {
      await crearVehiculo(datos)
      setMensajeExito('Vehículo creado correctamente.')
    }
    setModalFormVisible(false)
    setVehiculoEnEdicion(null)
  }

  const confirmarEliminacion = async () => {
    if (!vehiculoAEliminar) return
    setEliminando(true)
    setErrorEliminar('')
    try {
      await eliminarVehiculo(vehiculoAEliminar.id)
      setMensajeExito('Vehículo eliminado correctamente.')
      setVehiculoAEliminar(null)
    } catch (errorBorrado) {
      setErrorEliminar(errorBorrado.message)
    } finally {
      setEliminando(false)
    }
  }

  useEffect(() => {
    setPagina(1)
  }, [busqueda])

  const vehiculosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return vehiculos

    return vehiculos.filter((vehiculo) =>
      [
        vehiculo.placa,
        vehiculo.marca,
        vehiculo.modelo,
        vehiculo.color,
        vehiculo.propietario_nombre,
        vehiculo.correo_institucional,
      ].some((valor) => valor?.toLowerCase().includes(texto)),
    )
  }, [vehiculos, busqueda])

  const totalPaginas = Math.max(
    1,
    Math.ceil(vehiculosFiltrados.length / vehiculosPorPagina),
  )
  const paginaActual = Math.min(pagina, totalPaginas)

  const vehiculosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * vehiculosPorPagina
    return vehiculosFiltrados.slice(inicio, inicio + vehiculosPorPagina)
  }, [vehiculosFiltrados, paginaActual])

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Vehículos y propietarios</strong>
          <div className="small text-body-secondary">
            Vehículos autorizados en UTEQ Smart Parking
          </div>
        </div>

        <div className="d-flex gap-2">
          <CButton color="primary" onClick={abrirCreacion}>
            <CIcon icon={cilPlus} className="me-1" />
            Nuevo vehículo
          </CButton>
          <CButton color="success" onClick={recargar} disabled={cargando}>
            Actualizar
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        {mensajeExito && (
          <CAlert color="success" dismissible onClose={() => setMensajeExito('')}>
            {mensajeExito}
          </CAlert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
          <CFormInput
            type="search"
            placeholder="Buscar placa, vehículo o propietario..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            style={{ maxWidth: '420px' }}
          />

          <span className="text-body-secondary">
            {vehiculosFiltrados.length} vehículos
          </span>
        </div>

        {cargando && (
          <div className="text-center py-5">
            <CSpinner color="success" />
            <p className="mt-3">Cargando vehículos...</p>
          </div>
        )}

        {!cargando && error && (
          <CAlert color="danger">
            No se pudieron cargar los vehículos: {error}
          </CAlert>
        )}

        {!cargando && !error && (
          <>
            <CTable align="middle" bordered hover responsive striped>
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Foto del vehículo</CTableHeaderCell>
                  <CTableHeaderCell>Placa</CTableHeaderCell>
                  <CTableHeaderCell>Vehículo</CTableHeaderCell>
                  <CTableHeaderCell>Año / color</CTableHeaderCell>
                  <CTableHeaderCell>Foto del propietario</CTableHeaderCell>
                  <CTableHeaderCell>Propietario</CTableHeaderCell>
                  <CTableHeaderCell>Cédula</CTableHeaderCell>
                  <CTableHeaderCell>Correo</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {vehiculosPaginados.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={10} className="text-center py-4">
                      No se encontraron vehículos.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  vehiculosPaginados.map((vehiculo) => (
                    <CTableRow key={vehiculo.id}>
                      <CTableDataCell>
                        <a
                          href={vehiculo.foto_fuente_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Abrir fuente de la imagen"
                        >
                          <img
                            src={vehiculo.foto_url}
                            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                            width="100"
                            height="65"
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </a>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge color="dark" className="fs-6">
                          {vehiculo.placa}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <strong>{vehiculo.marca}</strong>
                        <div className="small text-body-secondary">
                          {vehiculo.modelo}
                        </div>
                      </CTableDataCell>

                      <CTableDataCell>
                        {vehiculo.anio}
                        <div className="small text-body-secondary">
                          {vehiculo.color}
                        </div>
                      </CTableDataCell>

                      <CTableDataCell className="text-center">
                        <img
                          src={vehiculo.foto_propietario_url}
                          alt={`Fotografía de ${vehiculo.propietario_nombre}`}
                          width="60"
                          height="60"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          style={{
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '2px solid var(--cui-border-color)',
                          }}
                        />
                      </CTableDataCell>

                      <CTableDataCell>
                        {vehiculo.propietario_nombre}
                      </CTableDataCell>

                      <CTableDataCell>
                        {vehiculo.cedula_enmascarada}
                      </CTableDataCell>

                      <CTableDataCell>
                        <a href={`mailto:${vehiculo.correo_institucional}`}>
                          {vehiculo.correo_institucional}
                        </a>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge color={vehiculo.autorizado ? 'success' : 'danger'}>
                          {vehiculo.autorizado ? 'Autorizado' : 'No autorizado'}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <div className="d-flex gap-2">
                          <CButton
                            color="info"
                            variant="outline"
                            size="sm"
                            onClick={() => abrirEdicion(vehiculo)}
                            title="Editar vehículo"
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => setVehiculoAEliminar(vehiculo)}
                            title="Eliminar vehículo"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>

            <div className="d-flex justify-content-between align-items-center">
              <small className="text-body-secondary">
                Página {paginaActual} de {totalPaginas}
              </small>

              <div className="d-flex gap-2">
                <CButton
                  color="secondary"
                  variant="outline"
                  disabled={paginaActual === 1}
                  onClick={() => setPagina((valor) => Math.max(1, valor - 1))}
                >
                  Anterior
                </CButton>

                <CButton
                  color="success"
                  variant="outline"
                  disabled={paginaActual === totalPaginas}
                  onClick={() =>
                    setPagina((valor) => Math.min(totalPaginas, valor + 1))
                  }
                >
                  Siguiente
                </CButton>
              </div>
            </div>
          </>
        )}
      </CCardBody>

      <VehiculoFormModal
        visible={modalFormVisible}
        vehiculo={vehiculoEnEdicion}
        onGuardar={guardarVehiculo}
        onCerrar={cerrarFormulario}
      />

      <CModal
        visible={Boolean(vehiculoAEliminar)}
        onClose={() => {
          setVehiculoAEliminar(null)
          setErrorEliminar('')
        }}
        alignment="center"
      >
        <CModalHeader closeButton>
          <CModalTitle>Eliminar vehículo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {errorEliminar && <CAlert color="danger">{errorEliminar}</CAlert>}
          ¿Está seguro de eliminar el vehículo{' '}
          <strong>{vehiculoAEliminar?.placa}</strong> de{' '}
          <strong>{vehiculoAEliminar?.propietario_nombre}</strong>? Esta acción no se
          puede deshacer.
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setVehiculoAEliminar(null)}
            disabled={eliminando}
          >
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmarEliminacion} disabled={eliminando}>
            {eliminando ? <CSpinner size="sm" /> : 'Eliminar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default ListaVehiculos