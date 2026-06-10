import { alquileres as mockAlquileres } from '../data/mockData'
import { supabase } from '../lib/supabaseClient'
import { getReservasAdmin } from './reservasService'
import { getVehiculos } from './vehiculosService'

function fallbackResult(data, motivo = '') {
  console.warn('Usando fallback de alquileres por:', motivo)

  return {
    data,
    error: motivo,
    source: 'fallback',
    usedFallback: true,
  }
}

function supabaseResult(data, extra = {}) {
  return {
    data,
    error: '',
    source: 'supabase',
    usedFallback: false,
    ...extra,
  }
}

function normalizeAlquilerRpcResponse(data) {
  const row = Array.isArray(data) ? data[0] : data

  return {
    exito: Boolean(row?.exito),
    mensaje: row?.mensaje || '',
    idAlquiler: row?.id_alquiler ?? null,
  }
}

function normalizeFinalizarAlquilerRpcResponse(data) {
  const row = Array.isArray(data) ? data[0] : data

  return {
    exito: Boolean(row?.exito),
    mensaje: row?.mensaje || '',
    idFactura: row?.id_factura ?? null,
    montoAlquiler: row?.monto_alquiler ?? null,
    montoExtra: row?.monto_extra ?? null,
  }
}

function formatDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function normalizeVehiculoLabel(reserva, vehiculo) {
  const marca = vehiculo?.marca || reserva?.marca || 'Vehiculo'
  const modelo = vehiculo?.modelo || reserva?.modelo || 'sin detalle'

  return `${marca} ${modelo}`.trim()
}

function normalizeFallbackAlquiler(alquiler) {
  return {
    id: alquiler.id,
    idAlquiler: alquiler.id,
    idReserva: alquiler.idReserva ?? alquiler.reservaId ?? '',
    cliente: alquiler.cliente ?? 'Cliente no disponible',
    vehiculo: alquiler.vehiculo ?? 'Vehiculo no disponible',
    sucursal: alquiler.sucursal ?? 'Sucursal no disponible',
    fechaInicio: alquiler.inicio ?? '',
    fechaFinPrevista: alquiler.devolucionPrevista ?? '',
    fechaEntrega: alquiler.fechaEntrega ?? '',
    kilometrajeInicio: alquiler.kilometrajeInicio ?? null,
    kilometrajeFin: alquiler.kilometrajeFin ?? null,
    inicio: alquiler.inicio ?? '',
    devolucionPrevista: alquiler.devolucionPrevista ?? '',
    estado: alquiler.estado ?? 'Sin estado',
  }
}

function normalizeAlquiler(row, reserva, vehiculo) {
  const fechaEntrega =
    row.fecha_hora_entrega || row.fecha_entrega || row.fecha_devolucion || row.fechaEntrega
  const idAlquiler = row.id_alquiler ?? row.idAlquiler ?? row.id
  const idReserva = row.id_reserva ?? row.idReserva ?? reserva?.idReserva ?? ''
  const fechaInicio =
    row.fecha_hora_inicio ||
    row.fecha_inicio ||
    row.fecha_alquiler_inicio ||
    row.fecha_inicio_alquiler ||
    reserva?.fechaInicio
  const fechaFinPrevista =
    row.fecha_hora_fin_prevista ||
    row.fecha_fin_prevista ||
    row.fecha_devolucion_prevista ||
    row.fecha_solicitud_fin ||
    reserva?.fechaFin

  return {
    id: String(idAlquiler),
    idAlquiler,
    idReserva,
    idVehiculo: row.id_vehiculo ?? reserva?.idVehiculo ?? null,
    cliente:
      row.email_cliente ||
      row.cliente ||
      reserva?.emailCliente ||
      reserva?.cliente ||
      'Cliente no disponible',
    vehiculo: row.vehiculo || normalizeVehiculoLabel(reserva, vehiculo),
    sucursal: row.sucursal || vehiculo?.sucursal || reserva?.sucursal || 'Sucursal no disponible',
    fechaInicio: formatDate(fechaInicio),
    fechaFinPrevista: formatDate(fechaFinPrevista),
    fechaEntrega: formatDate(fechaEntrega),
    kilometrajeInicio: row.kilometraje_inicio ?? row.km_inicio ?? row.kilometrajeInicio ?? null,
    kilometrajeFin: row.kilometraje_fin ?? row.km_fin ?? row.kilometrajeFin ?? null,
    inicio: formatDate(fechaInicio),
    devolucionPrevista: formatDate(fechaFinPrevista),
    estado: fechaEntrega ? 'Finalizado' : 'En curso',
  }
}

function getFallbackAlquileres() {
  return mockAlquileres.map(normalizeFallbackAlquiler)
}

export async function procesarAlquilerDesdeReserva({ idReserva, kilometrajeInicio }) {
  if (!supabase) {
    return {
      exito: false,
      mensaje: 'No se pudo procesar el alquiler en este momento.',
      idAlquiler: null,
    }
  }

  try {
    console.log('Procesando alquiler desde reserva:', idReserva, kilometrajeInicio)

    const { data, error } = await supabase.rpc('fn_procesar_alquiler_desde_reserva_api', {
      p_id_reserva: idReserva,
      p_kilometraje_inicio: kilometrajeInicio,
    })

    console.log('Respuesta procesar alquiler:', data)

    if (error) {
      console.log('Error procesar alquiler:', error)
      console.error('Error tecnico al procesar alquiler:', error)
      return {
        exito: false,
        mensaje: 'No se pudo procesar el alquiler en este momento.',
        idAlquiler: null,
      }
    }

    const result = normalizeAlquilerRpcResponse(data)

    return {
      ...result,
      mensaje: result.mensaje || 'No se pudo procesar el alquiler.',
    }
  } catch (error) {
    console.log('Error procesar alquiler:', error)
    console.error('Error inesperado al procesar alquiler:', error)
    return {
      exito: false,
      mensaje: 'No se pudo procesar el alquiler en este momento.',
      idAlquiler: null,
    }
  }
}

export async function finalizarAlquiler({ idAlquiler, kilometrajeFin }) {
  if (!supabase) {
    return {
      exito: false,
      mensaje: 'No se pudo finalizar el alquiler en este momento.',
      idFactura: null,
      montoAlquiler: null,
      montoExtra: null,
    }
  }

  try {
    console.log('Finalizando alquiler:', idAlquiler, kilometrajeFin)

    const { data, error } = await supabase.rpc('fn_finalizar_alquiler_api', {
      p_id_alquiler: idAlquiler,
      p_kilometraje_fin: kilometrajeFin,
    })

    console.log('Respuesta finalizar alquiler:', data)

    if (error) {
      console.log('Error finalizar alquiler:', error)
      console.error('Error tecnico al finalizar alquiler:', error)
      return {
        exito: false,
        mensaje: 'No se pudo finalizar el alquiler en este momento.',
        idFactura: null,
        montoAlquiler: null,
        montoExtra: null,
      }
    }

    const result = normalizeFinalizarAlquilerRpcResponse(data)

    return {
      ...result,
      mensaje: result.mensaje || 'No se pudo finalizar el alquiler.',
    }
  } catch (error) {
    console.log('Error finalizar alquiler:', error)
    console.error('Error inesperado al finalizar alquiler:', error)
    return {
      exito: false,
      mensaje: 'No se pudo finalizar el alquiler en este momento.',
      idFactura: null,
      montoAlquiler: null,
      montoExtra: null,
    }
  }
}

export async function getAlquileresAdmin() {
  if (!supabase) {
    return fallbackResult(getFallbackAlquileres(), 'No hay variables de entorno de Supabase configuradas.')
  }

  try {
    const { data, error } = await supabase
      .from('alquiler')
      .select('*')
      .order('id_alquiler', { ascending: false })

    if (error) {
      console.log('Error al leer alquileres:', error)
      throw error
    }

    console.log('Alquileres desde public.alquiler:', data)

    const [reservasResult, vehiculosResult] = await Promise.all([getReservasAdmin(), getVehiculos()])
    const reservas = reservasResult.data || []
    const vehiculos = vehiculosResult.data || []

    const reservasById = new Map(
      reservas.map((reserva) => [String(reserva.idReserva), reserva]),
    )
    const vehiculosById = new Map(vehiculos.map((vehiculo) => [String(vehiculo.id), vehiculo]))

    const normalized = (data || []).map((alquiler) => {
      const reserva = reservasById.get(String(alquiler.id_reserva ?? alquiler.idReserva))
      const idVehiculo = alquiler.id_vehiculo ?? reserva?.idVehiculo
      const vehiculo = vehiculosById.get(String(idVehiculo))

      return normalizeAlquiler(alquiler, reserva, vehiculo)
    })

    return supabaseResult(normalized, {
      usedFallback: reservasResult.usedFallback || vehiculosResult.usedFallback,
    })
  } catch (error) {
    return fallbackResult(getFallbackAlquileres(), error.message)
  }
}
