import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import { finalizarAlquiler, getAlquileresAdmin } from '../../services/alquileresService'

const estadosAlquilerBase = ['En curso', 'Finalizado']

function formatValue(value) {
  return value !== null && value !== undefined && value !== '' ? value : 'No disponible'
}

function formatCurrency(value) {
  return value !== null && value !== undefined ? `$${Number(value).toLocaleString('es-AR')}` : '$0'
}

function estaEnCurso(alquiler) {
  return String(alquiler.estado || '').trim().toLowerCase() === 'en curso'
}

function AdminAlquileresPage() {
  const [estado, setEstado] = useState('')
  const [alquileres, setAlquileres] = useState([])
  const [loading, setLoading] = useState(true)
  const [fallbackMessage, setFallbackMessage] = useState('')
  const [actionMessage, setActionMessage] = useState(null)
  const [finalizingId, setFinalizingId] = useState(null)

  async function loadAlquileres() {
    setLoading(true)
    const result = await getAlquileresAdmin()

    setAlquileres(result.data)
    setFallbackMessage(
      result.usedFallback
        ? 'No se pudieron cargar alquileres desde Supabase. Se muestran datos de respaldo.'
        : '',
    )
    setLoading(false)
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialAlquileres() {
      const result = await getAlquileresAdmin()

      if (!ignore) {
        setAlquileres(result.data)
        setFallbackMessage(
          result.usedFallback
            ? 'No se pudieron cargar alquileres desde Supabase. Se muestran datos de respaldo.'
            : '',
        )
        setLoading(false)
      }
    }

    loadInitialAlquileres()

    return () => {
      ignore = true
    }
  }, [])

  const alquileresFiltrados = useMemo(
    () => alquileres.filter((alquiler) => !estado || alquiler.estado === estado),
    [alquileres, estado],
  )

  const estadosAlquiler = useMemo(
    () => [...new Set([...estadosAlquilerBase, ...alquileres.map((alquiler) => alquiler.estado)])],
    [alquileres],
  )

  function handleAction(action, alquilerId) {
    window.alert(`${action}: ${alquilerId}`)
  }

  async function handleFinalizarAlquiler(alquiler) {
    const rawKilometraje = window.prompt(
      `Ingresá el kilometraje final para el alquiler #${alquiler.idAlquiler}`,
    )
    if (rawKilometraje === null) return

    const kilometrajeFin = Number(rawKilometraje.trim())
    const kilometrajeInicio = Number(alquiler.kilometrajeInicio)
    const tieneKilometrajeInicio =
      alquiler.kilometrajeInicio !== null &&
      alquiler.kilometrajeInicio !== undefined &&
      alquiler.kilometrajeInicio !== '' &&
      Number.isFinite(kilometrajeInicio)

    if (
      rawKilometraje.trim() === '' ||
      !Number.isInteger(kilometrajeFin) ||
      kilometrajeFin < 0
    ) {
      setActionMessage({
        type: 'error',
        text: 'Ingresá un kilometraje final válido, sin decimales y mayor o igual a 0.',
      })
      return
    }

    if (tieneKilometrajeInicio && kilometrajeFin < kilometrajeInicio) {
      setActionMessage({
        type: 'error',
        text: `El kilometraje final no puede ser menor al kilometraje inicial (${kilometrajeInicio} km).`,
      })
      return
    }

    const confirmed = window.confirm(
      `Confirmás finalizar el alquiler #${alquiler.idAlquiler} con ${kilometrajeFin} km finales?`,
    )
    if (!confirmed) return

    setFinalizingId(alquiler.idAlquiler)
    setActionMessage(null)

    const result = await finalizarAlquiler({
      idAlquiler: alquiler.idAlquiler,
      kilometrajeFin,
    })

    setFinalizingId(null)

    if (!result.exito) {
      setActionMessage({
        type: 'error',
        text: result.mensaje || 'No se pudo finalizar el alquiler.',
      })
      return
    }

    setActionMessage({
      type: 'success',
      text: `${
        result.mensaje || 'Alquiler finalizado correctamente.'
      } Factura N° ${result.idFactura}. Monto alquiler: ${formatCurrency(
        result.montoAlquiler,
      )}. Recargo: ${formatCurrency(result.montoExtra)}.`,
    })
    await loadAlquileres()
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
            Seguimiento de alquileres generados desde reservas procesadas.
          </p>
        </div>
        <Button type="button" onClick={() => handleAction('Registrar alquiler', 'nuevo')}>
          Registrar alquiler
        </Button>
      </div>

      {fallbackMessage && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {fallbackMessage}
        </div>
      )}

      {actionMessage && (
        <div
          className={`mt-5 rounded-md border p-4 text-sm font-semibold ${
            actionMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

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
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3">Alquiler</th>
                <th className="px-5 py-3">Reserva</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Vehiculo</th>
                <th className="px-5 py-3">Inicio</th>
                <th className="px-5 py-3">Fin prevista</th>
                <th className="px-5 py-3">Entrega</th>
                <th className="px-5 py-3">Km inicio</th>
                <th className="px-5 py-3">Km fin</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                    Cargando alquileres...
                  </td>
                </tr>
              ) : alquileresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                    No hay alquileres para mostrar.
                  </td>
                </tr>
              ) : (
                alquileresFiltrados.map((alquiler) => (
                  <tr key={alquiler.idAlquiler}>
                    <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                      #{alquiler.idAlquiler}
                    </td>
                    <td className="px-5 py-4">{formatValue(alquiler.idReserva)}</td>
                    <td className="px-5 py-4">{formatValue(alquiler.cliente)}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--color-text)]">
                        {formatValue(alquiler.vehiculo)}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {formatValue(alquiler.sucursal)}
                      </p>
                    </td>
                    <td className="px-5 py-4">{formatValue(alquiler.fechaInicio)}</td>
                    <td className="px-5 py-4">{formatValue(alquiler.fechaFinPrevista)}</td>
                    <td className="px-5 py-4">{formatValue(alquiler.fechaEntrega)}</td>
                    <td className="px-5 py-4">{formatValue(alquiler.kilometrajeInicio)}</td>
                    <td className="px-5 py-4">{formatValue(alquiler.kilometrajeFin)}</td>
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
                          onClick={() => handleAction('Ver alquiler', alquiler.idAlquiler)}
                        >
                          Ver detalle
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={finalizingId === alquiler.idAlquiler || !estaEnCurso(alquiler)}
                          onClick={() => handleFinalizarAlquiler(alquiler)}
                        >
                          {finalizingId === alquiler.idAlquiler
                            ? 'Finalizando...'
                            : 'Finalizar alquiler'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default AdminAlquileresPage
