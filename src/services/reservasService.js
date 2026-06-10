import { alquileres, reservas, vehiculos } from '../data/mockData'

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

export function calcularDiasReserva(inicio, devolucion) {
  if (!inicio || !devolucion) return 0

  const fechaInicio = new Date(inicio)
  const fechaDevolucion = new Date(devolucion)
  const diff = Math.ceil((fechaDevolucion - fechaInicio) / (1000 * 60 * 60 * 24))

  return diff > 0 ? diff : 0
}

export function getReservas() {
  // TODO: Reemplazar por Supabase y combinar con datos del cliente autenticado.
  return [...getStoredReservas(), ...reservas]
}

export function getMisReservas() {
  // TODO: Vincular el usuario autenticado de Supabase Auth con public.cliente.
  // Auth usa UUID en auth.users y el modelo del dominio usa id_cliente entero.
  // No mezclar esos identificadores hasta definir la relacion en la base.
  return getStoredReservas()
}

export function crearReserva(datosReserva) {
  // TODO: Reemplazar por insert en Supabase o RPC cuando exista el flujo real.
  const vehiculo =
    vehiculos.find((item) => item.id === datosReserva.vehiculoId) || datosReserva.vehiculo
  const diasEstimados = calcularDiasReserva(datosReserva.inicio, datosReserva.devolucion)

  if (!vehiculo || diasEstimados <= 0) {
    throw new Error('No se pudo crear la reserva con los datos ingresados.')
  }

  const nuevaReserva = {
    id: `R-${Date.now()}`,
    cliente: datosReserva.cliente || 'Cliente demo',
    vehiculoId: vehiculo.id,
    vehiculo: `${vehiculo.marca} ${vehiculo.modelo}`,
    tipo: vehiculo.tipo,
    sucursal: vehiculo.sucursal,
    inicio: datosReserva.inicio,
    devolucion: datosReserva.devolucion,
    estado: 'Pendiente',
    diasEstimados,
    costoEstimado: diasEstimados * vehiculo.precioDiario,
    creadaEn: new Date().toISOString(),
  }

  const nextReservas = [nuevaReserva, ...getStoredReservas()]
  saveStoredReservas(nextReservas)

  return nuevaReserva
}

export function getAlquileres() {
  // TODO: Reemplazar por Supabase cuando exista el modulo de alquileres.
  return [...alquileres]
}
