import { facturas, vehiculos, vehiculosAtrasados } from '../data/mockData'
import { getAlquileres, getReservas } from './reservasService'

export function getDashboardStats() {
  // TODO: Reemplazar por vistas, funciones SQL o RPC de Supabase para el dashboard.
  const reservas = getReservas()
  const alquileres = getAlquileres()

  return {
    vehiculosDisponibles: vehiculos.filter((vehiculo) => vehiculo.estado === 'Disponible').length,
    reservasActivas: reservas.filter((reserva) =>
      ['Pendiente', 'Confirmada', 'En curso'].includes(reserva.estado),
    ).length,
    alquileresEnCurso: alquileres.filter((alquiler) => alquiler.estado === 'En curso').length,
    vehiculosEnMantenimiento: vehiculos.filter(
      (vehiculo) => vehiculo.estado === 'Mantenimiento',
    ).length,
    facturasEmitidas: facturas.length,
    vehiculosAtrasados: vehiculosAtrasados.length,
  }
}

export function getReservasRecientes() {
  // TODO: Ordenar desde Supabase por fecha de creacion.
  return getReservas().slice(0, 6)
}

export function getAlquileresRecientes() {
  // TODO: Leer alquileres recientes desde Supabase.
  return getAlquileres().slice(0, 6)
}

export function getVehiculosAtrasados() {
  // TODO: Calcular atrasos con fechas reales desde Supabase.
  return [...vehiculosAtrasados]
}
