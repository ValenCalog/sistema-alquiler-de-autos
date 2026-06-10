import { facturas, vehiculos, vehiculosAtrasados } from '../data/mockData'
import { getVehiculos } from './vehiculosService'
import { getAlquileresAdmin } from './alquileresService'
import { getReservasAdmin } from './reservasService'

export async function getDashboardStats() {
  const [reservasResult, vehiculosResult, alquileresResult] = await Promise.all([
    getReservasAdmin(),
    getVehiculos(),
    getAlquileresAdmin(),
  ])
  const reservas = reservasResult.data
  const alquileres = alquileresResult.data
  const vehiculosCatalogo = vehiculosResult.data.length > 0 ? vehiculosResult.data : vehiculos

  return {
    vehiculosDisponibles: vehiculosCatalogo.filter(
      (vehiculo) =>
        String(vehiculo.estadoNormalizado || vehiculo.estado).toLowerCase() === 'disponible',
    ).length,
    reservasActivas: reservas.filter((reserva) =>
      ['Pendiente', 'Confirmada', 'En curso', 'Activa'].includes(reserva.estado),
    ).length,
    totalReservas: reservas.length,
    alquileresEnCurso: alquileres.filter((alquiler) => alquiler.estado === 'En curso').length,
    alquileresFinalizados: alquileres.filter((alquiler) => alquiler.estado === 'Finalizado').length,
    vehiculosEnMantenimiento: vehiculosCatalogo.filter((vehiculo) =>
      String(vehiculo.estadoNormalizado || vehiculo.estado).toLowerCase().includes('mantenimiento'),
    ).length,
    facturasEmitidas: facturas.length,
    vehiculosAtrasados: vehiculosAtrasados.length,
    usedFallback:
      reservasResult.usedFallback || vehiculosResult.usedFallback || alquileresResult.usedFallback,
  }
}

export async function getReservasRecientes() {
  const result = await getReservasAdmin()

  return {
    ...result,
    data: result.data.slice(0, 6),
  }
}

export async function getAlquileresRecientes() {
  const result = await getAlquileresAdmin()

  return {
    ...result,
    data: result.data.slice(0, 6),
  }
}

export function getVehiculosAtrasados() {
  // TODO: Calcular atrasos con fechas reales desde Supabase.
  return [...vehiculosAtrasados]
}
