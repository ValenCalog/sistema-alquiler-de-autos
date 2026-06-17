import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { cancelarReserva, getMisReservas } from '../../services/reservasService'

function formatCurrency(value) {
  return value != null ? `$${value.toLocaleString('es-AR')}` : 'No disponible'
}

function puedeCancelarReserva(estado) {
  return !['cancelada', 'finalizada', 'rechazada', 'vencida'].includes(
    String(estado || '').toLowerCase(),
  )
}

function MisReservasPage() {
  const { user } = useAuth()
  const idCliente = user?.idCliente
  const [misReservas, setMisReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [fallbackMessage, setFallbackMessage] = useState('')
  const [actionMessage, setActionMessage] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)

  async function loadReservas() {
    const result = await getMisReservas(idCliente)

    setMisReservas(result.data)
    setFallbackMessage(
      result.usedFallback
        ? 'No se pudieron cargar reservas desde Supabase. Se muestran datos locales.'
        : '',
    )
    setLoading(false)
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialReservas() {
      const result = await getMisReservas(idCliente)

      if (!ignore) {
        setMisReservas(result.data)
        setFallbackMessage(
          result.usedFallback
            ? 'No se pudieron cargar reservas desde Supabase. Se muestran datos locales.'
            : '',
        )
        setLoading(false)
      }
    }

    loadInitialReservas()

    return () => {
      ignore = true
    }
  }, [idCliente])

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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
            Area cliente
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
            Mis reservas
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            Consulta tus solicitudes de reserva y el estado informado por la base de datos.
          </p>
        </div>
        <Button to="/vehiculos">Volver a vehiculos</Button>
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

      {loading ? (
        <section className="mt-8 rounded-lg border border-[var(--color-border)] bg-white p-8 text-center text-sm font-semibold text-[var(--color-muted)] shadow-sm">
          Cargando reservas...
        </section>
      ) : misReservas.length === 0 ? (
        <section className="mt-8 rounded-lg border border-dashed border-[var(--color-border-strong)] bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            Todavia no tenes reservas
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
            Elegi un vehiculo, selecciona las fechas de alquiler y confirma la
            solicitud para verla reflejada aca.
          </p>
          <Button to="/vehiculos" className="mt-6">
            Buscar vehiculos
          </Button>
        </section>
      ) : (
        <>
          <section className="mt-6 grid gap-4 md:hidden">
            {misReservas.map((reserva) => (
              <article
                key={reserva.idReserva}
                className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--color-accent)]">
                      Reserva #{reserva.idReserva}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-[var(--color-primary)]">
                      {reserva.marca} {reserva.modelo}
                    </h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[var(--color-secondary)]">
                    {reserva.estado}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-[var(--color-muted)]">
                  <div>
                    <dt className="font-semibold text-[var(--color-text)]">Sucursal</dt>
                    <dd>{reserva.sucursal}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--color-text)]">Fechas</dt>
                    <dd>
                      {reserva.fechaInicio} al {reserva.fechaFin}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--color-text)]">Costo estimado</dt>
                    <dd>{formatCurrency(reserva.costoEstimado)}</dd>
                  </div>
                </dl>
                {puedeCancelarReserva(reserva.estado) && (
                  <Button
                    type="button"
                    variant="primary"
                    className="mt-5 w-full"
                    disabled={cancelingId === reserva.idReserva}
                    onClick={() => handleCancelarReserva(reserva.idReserva)}
                  >
                    {cancelingId === reserva.idReserva ? 'Cancelando...' : 'Cancelar'}
                  </Button>
                )}
              </article>
            ))}
          </section>

          <section className="mt-6 hidden rounded-lg border border-[var(--color-border)] bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  <tr>
                    <th className="px-5 py-3">Reserva</th>
                    <th className="px-5 py-3">Vehiculo</th>
                    <th className="px-5 py-3">Sucursal</th>
                    <th className="px-5 py-3">Inicio</th>
                    <th className="px-5 py-3">Devolucion</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Costo estimado</th>
                    <th className="px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {misReservas.map((reserva) => (
                    <tr key={reserva.idReserva}>
                      <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                        #{reserva.idReserva}
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
                        {puedeCancelarReserva(reserva.estado) ? (
                          <Button
                            type="button"
                            variant="primary"
                            disabled={cancelingId === reserva.idReserva}
                            onClick={() => handleCancelarReserva(reserva.idReserva)}
                          >
                            {cancelingId === reserva.idReserva ? 'Cancelando...' : 'Cancelar'}
                          </Button>
                        ) : (
                          <span className="text-sm font-semibold text-[var(--color-muted)]">
                            No disponible
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default MisReservasPage
