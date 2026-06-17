import { listarAlquileresAdmin } from './alquileresService'
import { getReservasAdmin } from './reservasService'
import { getVehiculos } from './vehiculosService'

const emptyStats = {
  vehiculosDisponibles: 0,
  reservasActivas: 0,
  totalReservas: 0,
  alquileresEnCurso: 0,
  alquileresFinalizados: 0,
  vehiculosEnMantenimiento: 0,
  facturasEmitidas: 0,
  vehiculosAtrasados: 0,
}

function normalizarEstado(valor) {
  return String(valor || '').trim().toUpperCase()
}

function parseLocalDateTime(value) {
  if (!value) return null

  const normalized = String(value).trim().replace(' ', 'T')
  const date = new Date(normalized)

  return Number.isNaN(date.getTime()) ? null : date
}

function formatDateArgentina(value) {
  if (!value) return 'Fecha no informada'

  const rawValue = String(value).replace('T', ' ')
  const [datePart, timePart = ''] = rawValue.split(' ')
  const [year, month, day] = datePart.split('-')

  if (!year || !month || !day) return 'Fecha no informada'

  const time = timePart.slice(0, 5)
  return time ? `${day}/${month}/${year} ${time}` : `${day}/${month}/${year}`
}

function calcularDiasAtraso(fechaFin) {
  const dueDate = parseLocalDateTime(fechaFin)
  if (!dueDate) return null

  const diff = Date.now() - dueDate.getTime()
  if (diff <= 0) return 1

  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function buildAlertasDevolucion(alquileres) {
  return alquileres
    .filter((alquiler) => normalizarEstado(alquiler.estado) === 'ATRASADO')
    .map((alquiler) => ({
      id: alquiler.idAlquiler,
      vehiculo: alquiler.vehiculo || 'Vehiculo sin descripcion',
      cliente: alquiler.cliente || alquiler.emailCliente || 'Cliente no identificado',
      sucursal: alquiler.sucursal || 'Sucursal no informada',
      devolucionPrevista: formatDateArgentina(alquiler.fechaHoraFin || alquiler.fechaFinPrevista),
      diasAtraso: calcularDiasAtraso(alquiler.fechaHoraFin || alquiler.fechaFinPrevista),
    }))
}

function calculateStats({ vehiculos, reservas, alquileres }) {
  return {
    ...emptyStats,
    vehiculosDisponibles: vehiculos.filter(
      (vehiculo) =>
        normalizarEstado(vehiculo.estadoNormalizado || vehiculo.estado) === 'DISPONIBLE',
    ).length,
    reservasActivas: reservas.filter((reserva) => normalizarEstado(reserva.estado) === 'ACTIVA')
      .length,
    totalReservas: reservas.length,
    alquileresEnCurso: alquileres.filter((alquiler) =>
      ['ACTIVO', 'ATRASADO'].includes(normalizarEstado(alquiler.estado)),
    ).length,
    alquileresFinalizados: alquileres.filter(
      (alquiler) => normalizarEstado(alquiler.estado) === 'FINALIZADO',
    ).length,
    vehiculosEnMantenimiento: vehiculos.filter(
      (vehiculo) =>
        normalizarEstado(vehiculo.estadoNormalizado || vehiculo.estado) === 'EN MANTENIMIENTO',
    ).length,
    facturasEmitidas: alquileres.filter((alquiler) => alquiler.idFactura !== null).length,
    vehiculosAtrasados: alquileres.filter(
      (alquiler) => normalizarEstado(alquiler.estado) === 'ATRASADO',
    ).length,
  }
}

function getResultData(result, sourceName, errors) {
  if (result.status === 'rejected') {
    errors.push(`${sourceName}: ${result.reason?.message || 'No se pudo cargar la informacion.'}`)
    return []
  }

  const value = result.value

  if (value?.usedFallback) {
    errors.push(`${sourceName}: ${value.error || 'La consulta uso datos de respaldo y fue descartada.'}`)
    return []
  }

  return Array.isArray(value?.data) ? value.data : Array.isArray(value) ? value : []
}

export async function getDashboardData() {
  const [vehiculosResult, reservasResult, alquileresResult] = await Promise.allSettled([
    getVehiculos(),
    getReservasAdmin(),
    listarAlquileresAdmin(),
  ])
  const errors = []
  const vehiculos = getResultData(vehiculosResult, 'Vehiculos', errors)
  const reservas = getResultData(reservasResult, 'Reservas', errors)
  const alquileres = getResultData(alquileresResult, 'Alquileres', errors)

  return {
    stats: calculateStats({ vehiculos, reservas, alquileres }),
    reservasRecientes: reservas.slice(0, 6),
    alquileresRecientes: alquileres.slice(0, 6),
    alertasDevolucion: buildAlertasDevolucion(alquileres),
    errors,
  }
}

export async function getDashboardStats() {
  const data = await getDashboardData()
  return {
    ...data.stats,
    errors: data.errors,
  }
}

export async function getReservasRecientes() {
  const data = await getDashboardData()
  return {
    data: data.reservasRecientes,
    error: data.errors.join(' '),
    source: 'supabase',
    usedFallback: false,
  }
}

export async function getAlquileresRecientes() {
  const data = await getDashboardData()
  return {
    data: data.alquileresRecientes,
    error: data.errors.join(' '),
    source: 'supabase',
    usedFallback: false,
  }
}
