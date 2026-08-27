import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const COLUMNAS_PUBLICAS = `
  id,
  placa,
  marca,
  modelo,
  anio,
  color,
  tipo,
  foto_url,
  foto_fuente_url,
  foto_propietario_url,
  cedula_enmascarada,
  propietario_nombre,
  correo_institucional,
  autorizado
`

export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarVehiculos = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('vehiculos')
      .select(COLUMNAS_PUBLICAS)
      .order('propietario_nombre', { ascending: true })

    if (errorSupabase) {
      setVehiculos([])
      setError(errorSupabase.message)
    } else {
      setVehiculos(data ?? [])
    }

    setCargando(false)
  }, [])

  useEffect(() => {
    cargarVehiculos()
  }, [cargarVehiculos])

  const crearVehiculo = useCallback(
    async (datos) => {
      const { data, error: errorSupabase } = await supabase
        .from('vehiculos')
        .insert([datos])
        .select(COLUMNAS_PUBLICAS)
        .single()

      if (errorSupabase) {
        throw new Error(errorSupabase.message)
      }

      await cargarVehiculos()
      return data
    },
    [cargarVehiculos],
  )

  const actualizarVehiculo = useCallback(
    async (id, datos) => {
      const { data, error: errorSupabase } = await supabase
        .from('vehiculos')
        .update(datos)
        .eq('id', id)
        .select(COLUMNAS_PUBLICAS)
        .single()

      if (errorSupabase) {
        throw new Error(errorSupabase.message)
      }

      await cargarVehiculos()
      return data
    },
    [cargarVehiculos],
  )

  const eliminarVehiculo = useCallback(
    async (id) => {
      const { error: errorSupabase } = await supabase
        .from('vehiculos')
        .delete()
        .eq('id', id)

      if (errorSupabase) {
        throw new Error(errorSupabase.message)
      }

      await cargarVehiculos()
    },
    [cargarVehiculos],
  )

  return {
    vehiculos,
    cargando,
    error,
    recargar: cargarVehiculos,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
  }
}