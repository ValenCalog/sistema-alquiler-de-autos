import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import { getAlquileres } from '../../services/reservasService'

const estadosAlquiler = ['En curso', 'Atrasado', 'Finalizado']

function AdminAlquileresPage() {
  const [estado, setEstado] = useState('')
  const alquileres = getAlquileres()

  const alquileresFiltrados = useMemo(
    () => alquileres.filter((alquiler) => !estado || alquiler.estado === estado),
    [alquileres, estado],
  )

  function handleAction(action, alquilerId) {
    window.alert(`${action}: ${alquilerId}`)
  }

  return (
    <main>
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
            Administracion
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
            Alquileres
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            Seguimiento simulado de alquileres en curso, atrasados y finalizados.
          </p>
        </div>
        <Button type="button" onClick={() => handleAction('Registrar alquiler', 'nuevo')}>
          Registrar alquiler
        </Button>
      </div>

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Estado
            <select
              name="estado"
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              className="field"
            >
              <option value="">Todos</option>
              {estadosAlquiler.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <p className="text-sm font-semibold text-[var(--color-muted)]">
              {alquileresFiltrados.length} alquileres encontrados
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
                <th className="px-5 py-3">Devolucion prevista</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {alquileresFiltrados.map((alquiler) => (
                <tr key={alquiler.id}>
                  <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                    {alquiler.id}
                  </td>
                  <td className="px-5 py-4">{alquiler.cliente}</td>
                  <td className="px-5 py-4">{alquiler.vehiculo}</td>
                  <td className="px-5 py-4">{alquiler.sucursal}</td>
                  <td className="px-5 py-4">{alquiler.inicio}</td>
                  <td className="px-5 py-4">{alquiler.devolucionPrevista}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[var(--color-secondary)]">
                      {alquiler.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAction('Ver alquiler', alquiler.id)}
                      >
                        Ver detalle
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleAction('Finalizar alquiler', alquiler.id)}
                      >
                        Finalizar
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

export default AdminAlquileresPage
