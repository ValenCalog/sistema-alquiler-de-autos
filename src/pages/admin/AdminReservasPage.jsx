import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import { sucursales } from '../../data/mockData'
import { procesarAlquilerDesdeReserva } from '../../services/alquileresService'
import { cancelarReserva, getReservasAdmin } from '../../services/reservasService'

const estadosReservaBase = ['Pendiente', 'Confirmada', 'En curso', 'Activa', 'Cancelada']

function formatCurrency(value) {
  return value != null ? `$${value.toLocaleString('es-AR')}` : 'No disponible'
}

function puedeCancelarReserva(estado) {
  return !['cancelada', 'finalizada', 'rechazada', 'vencida'].includes(
    String(estado || '').trim().toLowerCase(),
  )
}

function puedeProcesarAlquiler(estado) {
  return String(estado || '').trim().toLowerCase() === 'activa'
}

function AdminReservasPage() {
  const [filters, setFilters] = useState({ estado: '', sucursal: '' })
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [fallbackMessage, setFallbackMessage] = useState('')
  const [actionMessage, setActionMessage] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  async function loadReservas() {
    const result = await getReservasAdmin()

    setReservas(result.data)
    setFallbackMessage(
      result.usedFallback
        ? 'No se pudieron cargar reservas desde Supabase. Se muestran datos de respaldo.'
        : '',
    )
    setLoading(false)
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialReservas() {
      const result = await getReservasAdmin()

      if (!ignore) {
        setReservas(result.data)
        setFallbackMessage(
          result.usedFallback
            ? 'No se pudieron cargar reservas desde Supabase. Se muestran datos de respaldo.'
            : '',
        )
        setLoading(false)
      }
    }

    loadInitialReservas()

    return () => {
      ignore = true
    }
  }, [])

  const reservasFiltradas = useMemo(
    () =>
      reservas.filter((reserva) => {
        const matchesEstado = !filters.estado || reserva.estado === filters.estado
        const matchesSucursal = !filters.sucursal || reserva.sucursal === filters.sucursal

        return matchesEstado && matchesSucursal
      }),
    [filters, reservas],
  )

  const estadosReserva = useMemo(
    () => [...new Set([...estadosReservaBase, ...reservas.map((reserva) => reserva.estado)])],
    [reservas],
  )

  const sucursalesDisponibles = useMemo(
    () => [...new Set([...sucursales, ...reservas.map((reserva) => reserva.sucursal)])],
    [reservas],
  )

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleAction(action, reservaId) {
    window.alert(`${action}: ${reservaId}`)
  }

  async function handleCancelarReserva(idReserva) {
    const confirmed = window.confirm(`Confirmas la cancelacion de la reserva #${idReserva}?`)
    if (!confirmed) return

    setCancelingId(idReserva)
    setActionMessage(null)

    const result = await cancelarReserva(idReserva)

    setCancelingId(null)

    if (!result.exito) {
      setActionMessage({
        type: 'error',
        text: result.mensaje || 'No se pudo cancelar la reserva.',
      })
      return
    }

    setActionMessage({
      type: 'success',
      text: result.mensaje || 'Reserva cancelada correctamente.',
    })
    await loadReservas()
  }

  async function handleProcesarAlquiler(idReserva) {
    const rawKilometraje = window.prompt(
      `Ingresá el kilometraje inicial para la reserva #${idReserva}`,
    )
    if (rawKilometraje === null) return

    const kilometrajeInicio = Number(rawKilometraje.trim())

    if (
      rawKilometraje.trim() === '' ||
      !Number.isInteger(kilometrajeInicio) ||
      kilometrajeInicio < 0
    ) {
      setActionMessage({
        type: 'error',
        text: 'Ingresá un kilometraje inicial válido, sin decimales y mayor o igual a 0.',
      })
      return
    }

    const confirmed = window.confirm(
      `Confirmás procesar la reserva #${idReserva} con ${kilometrajeInicio} km iniciales?`,
    )
    if (!confirmed) return

    setProcessingId(idReserva)
    setActionMessage(null)

    const result = await procesarAlquilerDesdeReserva({ idReserva, kilometrajeInicio })

    setProcessingId(null)

    if (!result.exito) {
      setActionMessage({
        type: 'error',
        text: result.mensaje || 'No se pudo procesar el alquiler.',
      })
      return
    }

    setActionMessage({
      type: 'success',
      text: `${result.mensaje || 'Alquiler procesado correctamente.'} Alquiler #${result.idAlquiler}`,
      idAlquiler: result.idAlquiler,
    })
    await loadReservas()
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

      {fallbackMessage && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {fallbackMessage}
        </div>
      )}

      {actionMessage && (
        <div
          className={`mt-5 flex flex-col gap-3 rounded-md border p-4 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between ${
            actionMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <span>{actionMessage.text}</span>
          {actionMessage.idAlquiler && (
            <Button to="/admin/alquileres" variant="outline" className="bg-white">
              Ver alquileres
            </Button>
          )}
        </div>
      )}

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
              {sucursalesDisponibles.map((sucursal) => (
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
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3">Reserva</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Vehiculo</th>
                <th className="px-5 py-3">Sucursal</th>
                <th className="px-5 py-3">Inicio</th>
                <th className="px-5 py-3">Fin</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Costo estimado</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                    Cargando reservas...
                  </td>
                </tr>
              ) : reservasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                    No hay reservas para mostrar.
                  </td>
                </tr>
              ) : (
                reservasFiltradas.map((reserva) => (
                  <tr key={reserva.idReserva}>
                    <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                      #{reserva.idReserva}
                    </td>
                    <td className="px-5 py-4">
                      {reserva.emailCliente || reserva.cliente}
                    </td>
                    <td className="px-5 py-4">
                      {reserva.marca} {reserva.modelo}
                    </td>
                    <td className="px-5 py-4">{reserva.sucursal}</td>
                    <td className="px-5 py-4">{reserva.fechaInicio}</td>
                    <td className="px-5 py-4">{reserva.fechaFin}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[var(--color-secondary)]">
                        {reserva.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-[var(--color-text)]">
                      {formatCurrency(reserva.costoEstimado)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAction('Ver reserva', reserva.idReserva)}
                        >
                          Ver
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          disabled={
                            cancelingId === reserva.idReserva ||
                            !puedeCancelarReserva(reserva.estado)
                          }
                          onClick={() => handleCancelarReserva(reserva.idReserva)}
                        >
                          {cancelingId === reserva.idReserva ? 'Cancelando...' : 'Cancelar'}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={
                            processingId === reserva.idReserva ||
                            !puedeProcesarAlquiler(reserva.estado)
                          }
                          onClick={() => handleProcesarAlquiler(reserva.idReserva)}
                        >
                          {processingId === reserva.idReserva
                            ? 'Procesando...'
                            : 'Procesar alquiler'}
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

export default AdminReservasPage
