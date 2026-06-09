import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import { sucursales } from '../../data/mockData'
import { getReservas } from '../../services/reservasService'

const estadosReserva = ['Pendiente', 'Confirmada', 'En curso']

function AdminReservasPage() {
  const [filters, setFilters] = useState({ estado: '', sucursal: '' })
  const reservas = getReservas()

  const reservasFiltradas = useMemo(
    () =>
      reservas.filter((reserva) => {
        const matchesEstado = !filters.estado || reserva.estado === filters.estado
        const matchesSucursal = !filters.sucursal || reserva.sucursal === filters.sucursal

        return matchesEstado && matchesSucursal
      }),
    [filters, reservas],
  )

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleAction(action, reservaId) {
    window.alert(`${action}: ${reservaId}`)
  }

  return (
    <main>
      <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
          Administracion
        </p>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">Reservas</h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted)]">
          Listado operativo de solicitudes con filtros basicos por estado y sucursal.
        </p>
      </div>

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Estado
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="field"
            >
              <option value="">Todos</option>
              {estadosReserva.map((estado) => (
                <option key={estado}>{estado}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Sucursal
            <select
              name="sucursal"
              value={filters.sucursal}
              onChange={handleFilterChange}
              className="field"
            >
              <option value="">Todas</option>
              {sucursales.map((sucursal) => (
                <option key={sucursal}>{sucursal}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <p className="text-sm font-semibold text-[var(--color-muted)]">
              {reservasFiltradas.length} reservas encontradas
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3">Codigo</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Vehiculo</th>
                <th className="px-5 py-3">Sucursal</th>
                <th className="px-5 py-3">Inicio</th>
                <th className="px-5 py-3">Devolucion</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {reservasFiltradas.map((reserva) => (
                <tr key={reserva.id}>
                  <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                    {reserva.id}
                  </td>
                  <td className="px-5 py-4">{reserva.cliente}</td>
                  <td className="px-5 py-4">{reserva.vehiculo}</td>
                  <td className="px-5 py-4">{reserva.sucursal}</td>
                  <td className="px-5 py-4">{reserva.inicio}</td>
                  <td className="px-5 py-4">{reserva.devolucion}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[var(--color-secondary)]">
                      {reserva.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAction('Ver reserva', reserva.id)}
                      >
                        Ver
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleAction('Cancelar reserva', reserva.id)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default AdminReservasPage
