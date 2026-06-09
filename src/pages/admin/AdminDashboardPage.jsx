import StatCard from '../../components/ui/StatCard'
import {
  getAlquileresRecientes,
  getDashboardStats,
  getReservasRecientes,
  getVehiculosAtrasados,
} from '../../services/dashboardService'

function AdminDashboardPage() {
  const stats = getDashboardStats()
  const reservasRecientes = getReservasRecientes()
  const alquileresRecientes = getAlquileresRecientes()
  const atrasados = getVehiculosAtrasados()

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
          operativas con datos simulados.
        </p>
      </div>

      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Vehiculos disponibles"
          value={stats.vehiculosDisponibles}
          detail="Listos para reservar"
        />
        <StatCard
          label="Reservas activas"
          value={stats.reservasActivas}
          detail="Pendientes, confirmadas o en curso"
        />
        <StatCard
          label="Alquileres en curso"
          value={stats.alquileresEnCurso}
          detail="Unidades fuera de sucursal"
        />
        <StatCard
          label="En mantenimiento"
          value={stats.vehiculosEnMantenimiento}
          detail="Requieren control tecnico"
        />
        <StatCard
          label="Facturas emitidas"
          value={stats.facturasEmitidas}
          detail="Comprobantes simulados"
        />
        <StatCard
          label="Vehiculos atrasados"
          value={stats.vehiculosAtrasados}
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
                  Sucursal {alerta.sucursal} · devolucion prevista {alerta.devolucionPrevista}
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
                  <th className="px-5 py-3">Codigo</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Vehiculo</th>
                  <th className="px-5 py-3">Sucursal</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {reservasRecientes.map((reserva) => (
                  <tr key={reserva.id}>
                    <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                      {reserva.id}
                    </td>
                    <td className="px-5 py-4">{reserva.cliente}</td>
                    <td className="px-5 py-4">{reserva.vehiculo}</td>
                    <td className="px-5 py-4">{reserva.sucursal}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[var(--color-secondary)]">
                        {reserva.estado}
                      </span>
                    </td>
                  </tr>
                ))}
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
                {alquileresRecientes.map((alquiler) => (
                  <tr key={alquiler.id}>
                    <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                      {alquiler.id}
                    </td>
                    <td className="px-5 py-4">{alquiler.cliente}</td>
                    <td className="px-5 py-4">{alquiler.vehiculo}</td>
                    <td className="px-5 py-4">{alquiler.devolucionPrevista}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[var(--color-secondary)]">
                        {alquiler.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AdminDashboardPage
