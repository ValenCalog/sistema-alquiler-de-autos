import { supabase } from '../lib/supabaseClient'

function assertSupabase() {
  if (!supabase) {
    throw new Error('No hay variables de entorno de Supabase configuradas.')
  }
}

function obtenerPrimeraFila(data) {
  return Array.isArray(data) ? data[0] : data
}

function normalizeAlquiler(row) {
  return {
    id: String(row.id_alquiler),
    idAlquiler: row.id_alquiler,
    idReserva: row.id_reserva ?? null,
    idCliente: row.id_cliente ?? null,
    cliente: row.cliente ?? 'Cliente no disponible',
    emailCliente: row.email_cliente ?? '',
    idVehiculo: row.id_vehiculo ?? null,
    vehiculo: row.vehiculo ?? 'Vehiculo no disponible',
    tipoVehiculo: row.tipo_vehiculo ?? '',
    sucursal: row.sucursal ?? 'Sucursal no disponible',
    fechaHoraInicio: row.fecha_hora_inicio ?? null,
    fechaHoraFin: row.fecha_hora_fin ?? null,
    fechaHoraEntrega: row.fecha_hora_entrega ?? null,
    fechaInicio: row.fecha_hora_inicio ?? null,
    fechaFinPrevista: row.fecha_hora_fin ?? null,
    fechaEntrega: row.fecha_hora_entrega ?? null,
    kilometrajeInicio: row.kilometraje_inicio ?? null,
    kilometrajeFin: row.kilometraje_fin ?? null,
    estado: row.estado_alquiler ?? 'Sin estado',
    estadoAlquiler: row.estado_alquiler ?? 'Sin estado',
    idFactura: row.id_factura ?? null,
    montoAlquiler: row.monto_alquiler ?? null,
    montoExtra: row.monto_extra ?? null,
    montoTotal: row.monto_total ?? null,
  }
}

function normalizeCliente(row) {
  return {
    idCliente: row.id_cliente,
    nombreCompleto: row.nombre_completo ?? 'Cliente sin nombre',
    email: row.email ?? '',
  }
}

function normalizeVehiculo(row) {
  return {
    idVehiculo: row.id_vehiculo,
    vehiculo: row.vehiculo ?? 'Vehiculo sin detalle',
    tipo: row.tipo ?? '',
    sucursal: row.sucursal ?? 'Sucursal no disponible',
    estado: row.estado ?? '',
  }
}

function normalizeCrearAlquilerResponse(data) {
  const row = obtenerPrimeraFila(data)

  return {
    exito: Boolean(row?.exito),
    mensaje: row?.mensaje || '',
    idAlquiler: row?.id_alquiler ?? null,
  }
}

function normalizeFinalizarAlquilerResponse(data) {
  const row = obtenerPrimeraFila(data)

  return {
    exito: Boolean(row?.exito),
    mensaje: row?.mensaje || '',
    idFactura: row?.id_factura ?? null,
    montoAlquiler: row?.monto_alquiler ?? null,
    montoExtra: row?.monto_extra ?? null,
  }
}

async function callRpc(name, params) {
  assertSupabase()

  const { data, error } = await supabase.rpc(name, params)

  if (error) {
    console.error(`Error tecnico en ${name}:`, error)
    throw new Error(error.message || 'Ocurrio un error al consultar Supabase.')
  }

  return data
}

export async function listarAlquileresAdmin() {
  const data = await callRpc('fn_listar_alquileres_admin_api')
  return (data || []).map(normalizeAlquiler)
}

export async function listarClientesParaAlquiler() {
  const data = await callRpc('fn_listar_clientes_alquiler_api')
  return (data || []).map(normalizeCliente)
}

export async function listarVehiculosParaAlquilerDirecto() {
  const data = await callRpc('fn_listar_vehiculos_alquiler_directo_api')
  return (data || []).map(normalizeVehiculo)
}

export async function crearAlquilerDirecto({
  idCliente,
  idVehiculo,
  fechaFin,
  kilometrajeInicio,
}) {
  const data = await callRpc('fn_crear_alquiler_directo_api', {
    p_id_cliente: idCliente,
    p_id_vehiculo: idVehiculo,
    p_fecha_fin: fechaFin,
    p_kilometraje_inicio: kilometrajeInicio,
  })
  const result = normalizeCrearAlquilerResponse(data)

  if (!result.exito) {
    throw new Error(result.mensaje || 'No se pudo registrar el alquiler.')
  }

  return result
}

export async function finalizarAlquiler({ idAlquiler, kilometrajeFin }) {
  const data = await callRpc('fn_finalizar_alquiler_api', {
    p_id_alquiler: idAlquiler,
    p_kilometraje_fin: kilometrajeFin,
  })
  const result = normalizeFinalizarAlquilerResponse(data)

  if (!result.exito) {
    throw new Error(result.mensaje || 'No se pudo finalizar el alquiler.')
  }

  return result
}

export async function procesarAlquilerDesdeReserva({ idReserva, kilometrajeInicio }) {
  try {
    const data = await callRpc('fn_procesar_alquiler_desde_reserva_api', {
      p_id_reserva: idReserva,
      p_kilometraje_inicio: kilometrajeInicio,
    })
    const result = normalizeCrearAlquilerResponse(data)

    return {
      ...result,
      mensaje: result.mensaje || 'No se pudo procesar el alquiler.',
    }
  } catch (error) {
    console.error('Error inesperado al procesar alquiler:', error)
    return {
      exito: false,
      mensaje: error.message || 'No se pudo procesar el alquiler en este momento.',
      idAlquiler: null,
    }
  }
}

export async function getAlquileresAdmin() {
  try {
    const data = await listarAlquileresAdmin()

    return {
      data,
      error: '',
      source: 'supabase',
      usedFallback: false,
    }
  } catch (error) {
    return {
      data: [],
      error: error.message,
      source: 'supabase',
      usedFallback: false,
    }
  }
}
