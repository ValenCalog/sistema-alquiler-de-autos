import { alquileres, reservas, vehiculos as mockVehiculos } from '../data/mockData'
import { supabase } from '../lib/supabaseClient'

const MIS_RESERVAS_KEY = 'autonexo_mis_reservas'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function getStoredReservas() {
  if (!canUseStorage()) return []

  try {
    const rawReservas = window.localStorage.getItem(MIS_RESERVAS_KEY)
    return rawReservas ? JSON.parse(rawReservas) : []
  } catch {
    return []
  }
}

function saveStoredReservas(nextReservas) {
  if (!canUseStorage()) return
  window.localStorage.setItem(MIS_RESERVAS_KEY, JSON.stringify(nextReservas))
}

function fallbackResult(data, motivo = '') {
  console.warn('Usando reservas fallback por:', motivo)

  return {
    data,
    error: motivo,
    source: 'fallback',
    usedFallback: true,
  }
}

function supabaseResult(data) {
  return {
    data,
    error: '',
    source: 'supabase',
    usedFallback: false,
  }
}

function normalizeReservaRpcResponse(data) {
  const row = Array.isArray(data) ? data[0] : data

  return {
    exito: Boolean(row?.exito),
    mensaje: row?.mensaje || '',
    idReserva: row?.id_reserva ?? null,
  }
}

function normalizeCancelacionRpcResponse(data) {
  const row = Array.isArray(data) ? data[0] : data

  return {
    exito: Boolean(row?.exito),
    mensaje: row?.mensaje || '',
  }
}

function formatDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function getVehiculoNombre(vehiculo) {
  if (!vehiculo) return 'Vehiculo no disponible'
  return `${vehiculo.marca} ${vehiculo.modelo}`.trim()
}

function getMockVehiculoByReserva(reserva) {
  const idVehiculo = String(reserva.id_vehiculo || reserva.idVehiculo || reserva.vehiculoId || '')
  const nombreVehiculo = reserva.vehiculo || ''

  return (
    mockVehiculos.find((vehiculo) => vehiculo.id === idVehiculo) ||
    mockVehiculos.find((vehiculo) => `${vehiculo.marca} ${vehiculo.modelo}` === nombreVehiculo) ||
    null
  )
}

function normalizeVehiculoForReserva(vehiculo) {
  if (!vehiculo) {
    return {
      marca: 'Marca no disponible',
      modelo: 'Modelo no disponible',
      tipo: 'Tipo no disponible',
      sucursal: 'Sucursal no disponible',
      imagenPrincipal: '',
      precioDiario: null,
    }
  }

  return {
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    tipo: vehiculo.tipo,
    sucursal: vehiculo.sucursal,
    imagenPrincipal: vehiculo.imagenPrincipal || vehiculo.imagenes?.[0] || '',
    precioDiario: vehiculo.precioDiario ?? null,
  }
}

export function calcularDiasReserva(inicio, devolucion) {
  if (!inicio || !devolucion) return 0

  const fechaInicio = new Date(inicio)
  const fechaDevolucion = new Date(devolucion)
  const diff = Math.ceil((fechaDevolucion - fechaInicio) / (1000 * 60 * 60 * 24))

  return diff > 0 ? diff : 0
}

function normalizeReserva(row, vehiculo) {
  const vehiculoData = normalizeVehiculoForReserva(vehiculo)
  const idReserva = row.id_reserva ?? row.idReserva ?? row.id
  const idVehiculo = row.id_vehiculo ?? row.idVehiculo ?? row.vehiculoId
  const idCliente = row.id_cliente ?? row.idCliente ?? null
  const fechaInicio = formatDate(row.fecha_solicitud_inicio || row.fechaInicio || row.inicio)
  const fechaFin = formatDate(row.fecha_solicitud_fin || row.fechaFin || row.devolucion)
  const diasEstimados = row.cantidad_dias ?? calcularDiasReserva(fechaInicio, fechaFin)
  const costoEstimado =
    row.costo_estimado ??
    (vehiculoData.precioDiario != null ? vehiculoData.precioDiario * diasEstimados : null)

  return {
    id: String(idReserva),
    idReserva,
    idCliente,
    emailCliente: row.email_cliente ?? row.emailCliente ?? '',
    idVehiculo: idVehiculo != null ? Number(idVehiculo) : null,
    cliente:
      row.email_cliente ||
      row.emailCliente ||
      row.cliente ||
      (idCliente ? `Cliente #${idCliente}` : 'Cliente no identificado'),
    marca: row.marca ?? vehiculoData.marca ?? 'Marca no especificada',
    modelo: row.modelo ?? vehiculoData.modelo ?? 'Modelo no especificado',
    tipo: row.tipo ?? vehiculoData.tipo ?? 'Tipo no especificado',
    sucursal: row.sucursal ?? vehiculoData.sucursal ?? 'Sucursal no especificada',
    imagenPrincipal: row.imagen_principal || row.imagenPrincipal || vehiculoData.imagenPrincipal,
    vehiculo: row.vehiculo || getVehiculoNombre({
      marca: row.marca ?? vehiculoData.marca,
      modelo: row.modelo ?? vehiculoData.modelo,
    }),
    fechaInicio,
    fechaFin,
    fechaCreacion: formatDate(row.fecha_creacion_reserva || row.fechaCreacion || row.creadaEn),
    inicio: fechaInicio,
    devolucion: fechaFin,
    estado: row.estado_reserva ?? row.estado ?? row.estadoReserva ?? 'Sin estado',
    cantidadDias: diasEstimados,
    costoEstimado: row.costoEstimado ?? costoEstimado,
  }
}

function normalizeFallbackReservas(sourceReservas) {
  return sourceReservas.map((reserva) => normalizeReserva(reserva, getMockVehiculoByReserva(reserva)))
}

async function fetchReservasDetalle(queryBuilder) {
  if (!supabase) {
    throw new Error('No hay variables de entorno de Supabase configuradas.')
  }

  const { data, error } = await queryBuilder(
    supabase.from('vw_reservas_detalle').select('*'),
  ).order('id_reserva', { ascending: false })

  if (error) {
    console.log('Error al leer reservas:', error)
    throw error
  }

  console.log('Reservas desde vw_reservas_detalle:', data)

  return data || []
}

export function getReservas() {
  return normalizeFallbackReservas([...getStoredReservas(), ...reservas])
}

export async function getMisReservas(idCliente) {
  if (!Number.isInteger(Number(idCliente)) || Number(idCliente) <= 0) {
    return supabaseResult([])
  }

  try {
    const rows = await fetchReservasDetalle((query) => query.eq('id_cliente', idCliente))
    return supabaseResult(rows.map((reserva) => normalizeReserva(reserva)))
  } catch (error) {
    return fallbackResult(normalizeFallbackReservas(getStoredReservas()), error.message)
  }
}

export async function getReservasAdmin() {
  try {
    const rows = await fetchReservasDetalle((query) => query)
    return supabaseResult(rows.map((reserva) => normalizeReserva(reserva)))
  } catch (error) {
    return fallbackResult(
      normalizeFallbackReservas([...getStoredReservas(), ...reservas]),
      error.message,
    )
  }
}

export async function getReservaById(idReserva) {
  try {
    const rows = await fetchReservasDetalle((query) => query.eq('id_reserva', idReserva))
    return supabaseResult(rows.map((reserva) => normalizeReserva(reserva))[0] || null)
  } catch (error) {
    const fallbackReservas = normalizeFallbackReservas([...getStoredReservas(), ...reservas])
    return fallbackResult(
      fallbackReservas.find((reserva) => String(reserva.idReserva) === String(idReserva)) || null,
      error.message,
    )
  }
}

export function getMisReservasFallback() {
  return normalizeFallbackReservas(getStoredReservas())
}

export async function crearReserva({ idCliente, idVehiculo, fechaInicio, fechaFin }) {
  if (!Number.isInteger(Number(idCliente)) || Number(idCliente) <= 0) {
    return {
      exito: false,
      mensaje: 'Tenes que iniciar sesion como cliente para crear una reserva.',
      idReserva: null,
    }
  }

  if (!supabase) {
    return {
      exito: false,
      mensaje: 'No se pudo registrar la reserva en este momento.',
      idReserva: null,
    }
  }

  try {
    const { data, error } = await supabase.rpc('fn_crear_reserva_api', {
      p_id_cliente: idCliente,
      p_id_vehiculo: idVehiculo,
      p_fecha_inicio: fechaInicio,
      p_fecha_fin: fechaFin,
    })

    if (error) {
      console.error('Error tecnico al crear reserva:', error)
      return {
        exito: false,
        mensaje: 'No se pudo registrar la reserva en este momento.',
        idReserva: null,
      }
    }

    const result = normalizeReservaRpcResponse(data)

    return {
      ...result,
      mensaje: result.mensaje || 'No se pudo registrar la reserva.',
    }
  } catch (error) {
    console.error('Error inesperado al crear reserva:', error)
    return {
      exito: false,
      mensaje: 'No se pudo registrar la reserva en este momento.',
      idReserva: null,
    }
  }
}

export async function cancelarReserva(idReserva) {
  if (!supabase) {
    return {
      exito: false,
      mensaje: 'No se pudo cancelar la reserva en este momento.',
    }
  }

  try {
    console.log('Cancelando reserva:', idReserva)

    const { data, error } = await supabase.rpc('fn_cancelar_reserva_api', {
      p_id_reserva: idReserva,
    })

    console.log('Respuesta cancelacion reserva:', data)

    if (error) {
      console.log('Error cancelacion reserva:', error)
      console.error('Error tecnico al cancelar reserva:', error)
      return {
        exito: false,
        mensaje: 'No se pudo cancelar la reserva en este momento.',
      }
    }

    const result = normalizeCancelacionRpcResponse(data)

    return {
      ...result,
      mensaje: result.mensaje || 'No se pudo cancelar la reserva.',
    }
  } catch (error) {
    console.log('Error cancelacion reserva:', error)
    console.error('Error inesperado al cancelar reserva:', error)
    return {
      exito: false,
      mensaje: 'No se pudo cancelar la reserva en este momento.',
    }
  }
}

export function guardarReservaLocal(reserva) {
  const nextReservas = [reserva, ...getStoredReservas()]
  saveStoredReservas(nextReservas)

  return reserva
}

export async function getReservasPorVehiculo(idVehiculo) {
  try {
    // Consultamos la vista filtrando por el ID del vehículo
    const rows = await fetchReservasDetalle((query) => query.eq('id_vehiculo', idVehiculo))
    
    // Normalizamos y retornamos resultado exitoso de Supabase
    return supabaseResult(rows.map((reserva) => normalizeReserva(reserva)))
  } catch (error) {
    // Si falla Supabase, leemos del fallback (localStorage + mockData)
    const fallbackReservas = normalizeFallbackReservas([...getStoredReservas(), ...reservas])
    
    // Filtramos las reservas locales para que coincidan con el vehículo solicitado
    const reservasDelVehiculo = fallbackReservas.filter(
      (reserva) => String(reserva.idVehiculo) === String(idVehiculo)
    )
    
    return fallbackResult(reservasDelVehiculo, error.message)
  }
}