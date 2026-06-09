import { useEffect, useState } from 'react'
import StatCard from '../../components/ui/StatCard'
import {
  getAlquileresRecientes,
  getDashboardStats,
  getReservasRecientes,
  getVehiculosAtrasados,
} from '../../services/dashboardService'

const emptyStats = {
  vehiculosDisponibles: 0,
  reservasActivas: 0,
  totalReservas: 0,
  alquileresEnCurso: 0,
  vehiculosEnMantenimiento: 0,
  facturasEmitidas: 0,
  vehiculosAtrasados: 0,
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(emptyStats)
  const [reservasRecientes, setReservasRecientes] = useState([])
  const [alquileresRecientes, setAlquileresRecientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [fallbackMessage, setFallbackMessage] = useState('')
  const atrasados = getVehiculosAtrasados()

  useEffect(() => {
    let ignore = false

    async function loadDashboard() {
      const [nextStats, reservasResult, alquileresResult] = await Promise.all([
        getDashboardStats(),
        getReservasRecientes(),
        getAlquileresRecientes(),
      ])

      if (!ignore) {
        setStats(nextStats)
        setReservasRecientes(reservasResult.data)
        setAlquileresRecientes(alquileresResult.data)
        setFallbackMessage(
          reservasResult.usedFallback || alquileresResult.usedFallback || nextStats.usedFallback
            ? 'Algunos datos administrativos se muestran desde respaldo local.'
            : '',
        )
        setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <main>
      <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
          Administracion
        </p>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">
          Dashboard operativo
        </h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted)]">
          Vista inicial para seguimiento de flota, reservas, alquileres y alertas
          operativas.
        </p>
      </div>

      {fallbackMessage && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {fallbackMessage}
        </div>
      )}

      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Vehiculos disponibles"
          value={loading ? '-' : stats.vehiculosDisponibles}
          detail="Listos para reservar"
        />
        <StatCard
          label="Reservas activas"
          value={loading ? '-' : stats.reservasActivas}
          detail={`${loading ? '-' : stats.totalReservas} reservas totales`}
        />
        <StatCard
          label="Alquileres en curso"
          value={loading ? '-' : stats.alquileresEnCurso}
          detail="Unidades fuera de sucursal"
        />
        <StatCard
          label="En mantenimiento"
          value={loading ? '-' : stats.vehiculosEnMantenimiento}
          detail="Requieren control tecnico"
        />
        <StatCard
          label="Facturas emitidas"
          value={loading ? '-' : stats.facturasEmitidas}
          detail="Comprobantes simulados"
        />
        <StatCard
          label="Vehiculos atrasados"
          value={loading ? '-' : stats.vehiculosAtrasados}
          detail="Devoluciones vencidas"
        />
      </section>

      {atrasados.length > 0 && (
        <section className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-bold text-red-800">Alertas de devolucion</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {atrasados.map((alerta) => (
              <article key={alerta.id} className="rounded-md bg-white p-4 text-sm shadow-sm">
                <p className="font-bold text-[var(--color-primary)]">{alerta.vehiculo}</p>
                <p className="mt-1 text-red-700">
                  {alerta.cliente} registra {alerta.diasAtraso} dia de atraso.
                </p>
                <p className="mt-1 text-[var(--color-muted)]">
                  Sucursal {alerta.sucursal} - devolucion prevista {alerta.devolucionPrevista}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
          <div className="border-b border-[var(--color-border)] p-5">
            <h2 className="text-xl font-bold text-[var(--color-primary)]">
              Reservas recientes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <tr>
                  <th className="px-5 py-3">Reserva</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Vehiculo</th>
                  <th className="px-5 py-3">Sucursal</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                      Cargando reservas...
                    </td>
                  </tr>
                ) : reservasRecientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                      No hay reservas recientes.
                    </td>
                  </tr>
                ) : (
                  reservasRecientes.map((reserva) => (
                    <tr key={reserva.idReserva}>
                      <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                        #{reserva.idReserva}
                      </td>
                      <td className="px-5 py-4">{reserva.emailCliente || reserva.cliente}</td>
                      <td className="px-5 py-4">
                        {reserva.marca} {reserva.modelo}
                      </td>
                      <td className="px-5 py-4">{reserva.sucursal}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[var(--color-secondary)]">
                          {reserva.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
          <div className="border-b border-[var(--color-border)] p-5">
            <h2 className="text-xl font-bold text-[var(--color-primary)]">
              Alquileres recientes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <tr>
                  <th className="px-5 py-3">Codigo</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Vehiculo</th>
                  <th className="px-5 py-3">Vence</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                      Cargando alquileres...
                    </td>
                  </tr>
                ) : alquileresRecientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                      No hay alquileres recientes.
                    </td>
                  </tr>
                ) : (
                  alquileresRecientes.map((alquiler) => (
                    <tr key={alquiler.idAlquiler || alquiler.id}>
                      <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                        #{alquiler.idAlquiler || alquiler.id}
                      </td>
                      <td className="px-5 py-4">{alquiler.cliente}</td>
                      <td className="px-5 py-4">{alquiler.vehiculo}</td>
                      <td className="px-5 py-4">
                        {alquiler.fechaFinPrevista || alquiler.devolucionPrevista}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[var(--color-secondary)]">
                          {alquiler.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AdminDashboardPage
