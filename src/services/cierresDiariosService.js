import { supabase } from '../lib/supabaseClient'

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'No se pudo conectar con Supabase. Revisá la configuración del entorno.',
    )
  }

  return supabase
}

function normalizarEjecucion(row) {
  return {
    idEjecucion: row.id_ejecucion,
    fechaCierre: row.fecha_cierre,
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    estado: row.estado,
    cantidadSucursales: Number(row.cantidad_sucursales ?? 0),
    cantidadFacturas: Number(row.cantidad_facturas ?? 0),
    montoTotal: Number(row.monto_total ?? 0),
  }
}

function normalizarCierre(row) {
  return {
    idCierre: row.id_cierre,
    fechaCierre: row.fecha_cierre,
    idSucursal: row.id_sucursal,
    direccionSucursal:
      row.sucursal?.direccion || `Sucursal #${row.id_sucursal}`,
    idEjecucion: row.id_ejecucion,
    cantidadReservasCreadas: Number(
      row.cantidad_reservas_creadas ?? 0,
    ),
    cantidadAlquileresIniciados: Number(
      row.cantidad_alquileres_iniciados ?? 0,
    ),
    cantidadAlquileresFinalizados: Number(
      row.cantidad_alquileres_finalizados ?? 0,
    ),
    cantidadFacturas: Number(row.cantidad_facturas ?? 0),
    montoAlquiler: Number(row.monto_alquiler ?? 0),
    montoRecargos: Number(row.monto_recargos ?? 0),
    montoTotal: Number(row.monto_total ?? 0),
    fechaGeneracion: row.fecha_generacion,
  }
}

export async function getEjecucionesCierreDiario(limite = 30) {
  const client = requireSupabase()

  const { data, error } = await client
    .from('ejecucion_cierre_diario')
    .select('*')
    .order('id_ejecucion', { ascending: false })
    .limit(limite)

  if (error) {
    console.error(
      'Error al cargar ejecuciones de cierre diario:',
      error,
    )

    throw new Error(
      error.message ||
        'No se pudieron cargar las ejecuciones de cierre diario.',
    )
  }

  return (data || []).map(normalizarEjecucion)
}

export async function getCierreDiarioPorFecha(fecha) {
  if (!fecha) {
    return []
  }

  const client = requireSupabase()

  const { data, error } = await client
    .from('cierre_diario_sucursal')
    .select(`
      id_cierre,
      fecha_cierre,
      id_sucursal,
      id_ejecucion,
      cantidad_reservas_creadas,
      cantidad_alquileres_iniciados,
      cantidad_alquileres_finalizados,
      cantidad_facturas,
      monto_alquiler,
      monto_recargos,
      monto_total,
      fecha_generacion,
      sucursal (
        direccion
      )
    `)
    .eq('fecha_cierre', fecha)
    .order('id_sucursal', { ascending: true })

  if (error) {
    console.error('Error al cargar el cierre diario:', error)

    throw new Error(
      error.message ||
        'No se pudo cargar el cierre diario seleccionado.',
    )
  }

  return (data || []).map(normalizarCierre)
}