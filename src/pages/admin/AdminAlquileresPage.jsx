import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import {
  crearAlquilerDirecto,
  finalizarAlquiler,
  listarAlquileresAdmin,
  listarClientesParaAlquiler,
  listarVehiculosParaAlquilerDirecto,
} from '../../services/alquileresService'

const ESTADOS_ALQUILER = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVO', label: 'Activos' },
  { value: 'ATRASADO', label: 'Atrasados' },
  { value: 'FINALIZADO', label: 'Finalizados' },
]

const initialCreateForm = {
  idCliente: '',
  idVehiculo: '',
  fechaFin: '',
  kilometrajeInicio: '',
}

const initialFinishForm = {
  kilometrajeFin: '',
}

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

function formatCurrency(value) {
  return value !== null && value !== undefined
    ? currencyFormatter.format(Number(value || 0))
    : 'Pendiente'
}

function formatDateTime(value) {
  if (!value) return 'Pendiente'

  const rawValue = String(value).replace('T', ' ')
  const [datePart, timePart = ''] = rawValue.split(' ')
  const [year, month, day] = datePart.split('-')

  if (!year || !month || !day) return rawValue

  const time = timePart.slice(0, 5)
  return time ? `${day}/${month}/${year} ${time}` : `${day}/${month}/${year}`
}

function getLocalDateTimeValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toLocalTimestamp(value) {
  return value ? `${value.replace('T', ' ')}:00` : ''
}

function isNonNegativeInteger(value) {
  if (value === '' || value === null || value === undefined) return false
  return Number.isInteger(Number(value)) && Number(value) >= 0
}

function normalizeSearch(value) {
  return String(value || '').trim().toLowerCase()
}

function puedeFinalizar(alquiler) {
  return ['ACTIVO', 'ATRASADO'].includes(String(alquiler.estado || '').toUpperCase())
}

function getEstadoBadgeClasses(estado) {
  const normalized = String(estado || '').toUpperCase()

  if (normalized === 'ACTIVO') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (normalized === 'ATRASADO') return 'bg-red-50 text-red-700 ring-red-200'
  if (normalized === 'FINALIZADO') return 'bg-slate-100 text-slate-700 ring-slate-200'

  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] p-5">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm font-bold text-[var(--color-muted)] hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  )
}

function Message({ message }) {
  if (!message) return null

  return (
    <div
      className={`mt-5 rounded-md border p-4 text-sm font-semibold ${
        message.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {message.text}
    </div>
  )
}

function AdminAlquileresPage() {
  const [filters, setFilters] = useState({ estado: '', search: '' })
  const [alquileres, setAlquileres] = useState([])
  const [clientes, setClientes] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [error, setError] = useState('')
  const [optionsError, setOptionsError] = useState('')
  const [actionMessage, setActionMessage] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [finishRental, setFinishRental] = useState(null)
  const [finishForm, setFinishForm] = useState(initialFinishForm)
  const [finishError, setFinishError] = useState('')
  const [finishing, setFinishing] = useState(false)
  const [invoiceSummary, setInvoiceSummary] = useState(null)

  async function loadAlquileres() {
    setLoading(true)
    setError('')

    try {
      const data = await listarAlquileresAdmin()
      setAlquileres(data)
    } catch (nextError) {
      setError(nextError.message || 'No se pudieron cargar los alquileres.')
      setAlquileres([])
    } finally {
      setLoading(false)
    }
  }

  async function loadOptions() {
    setLoadingOptions(true)
    setOptionsError('')

    try {
      const [clientesData, vehiculosData] = await Promise.all([
        listarClientesParaAlquiler(),
        listarVehiculosParaAlquilerDirecto(),
      ])
      setClientes(clientesData)
      setVehiculos(vehiculosData)
    } catch (nextError) {
      setOptionsError(nextError.message || 'No se pudieron cargar las opciones.')
      setClientes([])
      setVehiculos([])
    } finally {
      setLoadingOptions(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => loadAlquileres())
  }, [])

  const alquileresFiltrados = useMemo(
    () =>
      alquileres.filter((alquiler) => {
        const estado = String(alquiler.estado || '').toUpperCase()
        const matchesEstado = !filters.estado || estado === filters.estado
        const search = normalizeSearch(filters.search)

        if (!matchesEstado) return false
        if (!search) return true

        return [
          alquiler.idAlquiler,
          alquiler.cliente,
          alquiler.emailCliente,
          alquiler.vehiculo,
          alquiler.sucursal,
        ].some((value) => normalizeSearch(value).includes(search))
      }),
    [alquileres, filters],
  )

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function openCreateModal() {
    setCreateOpen(true)
    setCreateForm(initialCreateForm)
    setCreateError('')
    setActionMessage(null)
    loadOptions()
  }

  function closeCreateModal() {
    if (!creating) setCreateOpen(false)
  }

  function handleCreateChange(event) {
    const { name, value } = event.target
    setCreateForm((current) => ({ ...current, [name]: value }))
    setCreateError('')
  }

  function validateCreateForm() {
    if (!createForm.idCliente) return 'Selecciona un cliente.'
    if (!createForm.idVehiculo) return 'Selecciona un vehiculo.'
    if (!createForm.fechaFin) return 'Selecciona la fecha y hora prevista de devolucion.'

    const selectedDate = new Date(createForm.fechaFin)
    if (Number.isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
      return 'La fecha prevista de devolucion debe ser posterior al momento actual.'
    }

    if (!isNonNegativeInteger(createForm.kilometrajeInicio)) {
      return 'Ingresa un kilometraje inicial entero mayor o igual a 0.'
    }

    return ''
  }

  async function handleCreateSubmit(event) {
    event.preventDefault()

    const validationError = validateCreateForm()
    if (validationError) {
      setCreateError(validationError)
      return
    }

    setCreating(true)
    setCreateError('')

    try {
      const result = await crearAlquilerDirecto({
        idCliente: Number(createForm.idCliente),
        idVehiculo: Number(createForm.idVehiculo),
        fechaFin: toLocalTimestamp(createForm.fechaFin),
        kilometrajeInicio: Number(createForm.kilometrajeInicio),
      })

      setActionMessage({
        type: 'success',
        text: `${result.mensaje || 'Alquiler registrado correctamente.'} Alquiler #${result.idAlquiler}`,
      })
      setCreateForm(initialCreateForm)
      setCreateOpen(false)
      await Promise.all([loadAlquileres(), loadOptions()])
    } catch (nextError) {
      setCreateError(nextError.message || 'No se pudo registrar el alquiler.')
    } finally {
      setCreating(false)
    }
  }

  function openFinishModal(alquiler) {
    setFinishRental(alquiler)
    setFinishForm(initialFinishForm)
    setFinishError('')
    setActionMessage(null)
  }

  function closeFinishModal() {
    if (!finishing) setFinishRental(null)
  }

  function handleFinishChange(event) {
    const { name, value } = event.target
    setFinishForm((current) => ({ ...current, [name]: value }))
    setFinishError('')
  }

  function validateFinishForm() {
    if (!isNonNegativeInteger(finishForm.kilometrajeFin)) {
      return 'Ingresa un kilometraje final entero mayor o igual a 0.'
    }

    const kilometrajeFin = Number(finishForm.kilometrajeFin)
    const kilometrajeInicio = Number(finishRental?.kilometrajeInicio)

    if (Number.isFinite(kilometrajeInicio) && kilometrajeFin < kilometrajeInicio) {
      return `El kilometraje final no puede ser menor al kilometraje inicial (${kilometrajeInicio} km).`
    }

    return ''
  }

  async function handleFinishSubmit(event) {
    event.preventDefault()

    const validationError = validateFinishForm()
    if (validationError) {
      setFinishError(validationError)
      return
    }

    setFinishing(true)
    setFinishError('')

    try {
      const result = await finalizarAlquiler({
        idAlquiler: finishRental.idAlquiler,
        kilometrajeFin: Number(finishForm.kilometrajeFin),
      })
      const total = Number(result.montoAlquiler || 0) + Number(result.montoExtra || 0)

      setInvoiceSummary({
        idFactura: result.idFactura,
        montoAlquiler: result.montoAlquiler,
        montoExtra: result.montoExtra,
        total,
        mensaje: result.mensaje || 'Alquiler finalizado correctamente.',
      })
      setFinishRental(null)
      await Promise.all([loadAlquileres(), loadOptions()])
    } catch (nextError) {
      setFinishError(nextError.message || 'No se pudo finalizar el alquiler.')
    } finally {
      setFinishing(false)
    }
  }

  const canSubmitCreate =
    !loadingOptions &&
    !creating &&
    clientes.length > 0 &&
    vehiculos.length > 0

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
            Gestion de alquileres activos, atrasados y finalizados con datos reales de Supabase.
          </p>
        </div>
        <Button type="button" onClick={openCreateModal}>
          Registrar alquiler
        </Button>
      </div>

      {error && (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <Message message={actionMessage} />

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end">
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Estado
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="field"
            >
              {ESTADOS_ALQUILER.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Buscar
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="field"
              placeholder="ID, cliente, email, vehiculo o sucursal"
            />
          </label>
          <p className="text-sm font-semibold text-[var(--color-muted)]">
            {alquileresFiltrados.length} alquileres encontrados
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3">Alquiler</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Vehiculo</th>
                <th className="px-4 py-3">Sucursal</th>
                <th className="px-4 py-3">Inicio</th>
                <th className="px-4 py-3">Fin previsto</th>
                <th className="px-4 py-3">Entrega</th>
                <th className="px-4 py-3">KM inicial</th>
                <th className="px-4 py-3">KM final</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Factura</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan="13" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                    Cargando alquileres...
                  </td>
                </tr>
              ) : alquileresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                    No hay alquileres para mostrar.
                  </td>
                </tr>
              ) : (
                alquileresFiltrados.map((alquiler) => (
                  <tr key={alquiler.idAlquiler}>
                    <td className="px-4 py-4 font-bold text-[var(--color-primary)]">
                      #{alquiler.idAlquiler}
                    </td>
                    <td className="px-4 py-4">
                      {alquiler.idReserva ? `Reserva #${alquiler.idReserva}` : 'Directo'}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[var(--color-text)]">{alquiler.cliente}</p>
                      {alquiler.emailCliente && (
                        <p className="text-xs text-[var(--color-muted)]">{alquiler.emailCliente}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[var(--color-text)]">{alquiler.vehiculo}</p>
                      {alquiler.tipoVehiculo && (
                        <p className="text-xs text-[var(--color-muted)]">{alquiler.tipoVehiculo}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">{alquiler.sucursal}</td>
                    <td className="px-4 py-4">{formatDateTime(alquiler.fechaHoraInicio)}</td>
                    <td className="px-4 py-4">{formatDateTime(alquiler.fechaHoraFin)}</td>
                    <td className="px-4 py-4">{formatDateTime(alquiler.fechaHoraEntrega)}</td>
                    <td className="px-4 py-4">{alquiler.kilometrajeInicio ?? 'No disponible'}</td>
                    <td className="px-4 py-4">{alquiler.kilometrajeFin ?? '-'}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getEstadoBadgeClasses(
                          alquiler.estado,
                        )}`}
                      >
                        {alquiler.estado}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[var(--color-text)]">
                        {alquiler.idFactura ? `Factura #${alquiler.idFactura}` : 'Pendiente'}
                      </p>
                      {alquiler.montoTotal !== null && alquiler.montoTotal !== undefined && (
                        <p className="text-xs font-bold text-[var(--color-muted)]">
                          {formatCurrency(alquiler.montoTotal)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {puedeFinalizar(alquiler) ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => openFinishModal(alquiler)}
                        >
                          Finalizar alquiler
                        </Button>
                      ) : (
                        <span className="text-sm font-semibold text-[var(--color-muted)]">
                          Sin acciones
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {createOpen && (
        <Modal title="Registrar alquiler directo" onClose={closeCreateModal}>
          <p className="text-sm leading-6 text-[var(--color-muted)]">
            Este formulario registra un alquiler sin reserva previa. La fecha de inicio la toma la
            base de datos al confirmar la operacion.
          </p>

          {optionsError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {optionsError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
            <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
              Cliente
              <select
                name="idCliente"
                value={createForm.idCliente}
                onChange={handleCreateChange}
                className="field"
                disabled={loadingOptions || creating}
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.idCliente} value={cliente.idCliente}>
                    {cliente.nombreCompleto} - {cliente.email}
                  </option>
                ))}
              </select>
              {!loadingOptions && clientes.length === 0 && (
                <span className="block text-xs text-[var(--color-muted)]">
                  No hay clientes disponibles.
                </span>
              )}
            </label>

            <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
              Vehiculo
              <select
                name="idVehiculo"
                value={createForm.idVehiculo}
                onChange={handleCreateChange}
                className="field"
                disabled={loadingOptions || creating}
              >
                <option value="">Seleccionar vehiculo</option>
                {vehiculos.map((vehiculo) => (
                  <option key={vehiculo.idVehiculo} value={vehiculo.idVehiculo}>
                    {vehiculo.vehiculo} - {vehiculo.tipo} - {vehiculo.sucursal}
                  </option>
                ))}
              </select>
              {!loadingOptions && vehiculos.length === 0 && (
                <span className="block text-xs text-[var(--color-muted)]">
                  No hay vehiculos disponibles para registrar un alquiler directo.
                </span>
              )}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Fecha y hora prevista de devolucion
                <input
                  type="datetime-local"
                  name="fechaFin"
                  min={getLocalDateTimeValue()}
                  value={createForm.fechaFin}
                  onChange={handleCreateChange}
                  className="field"
                  disabled={creating}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Kilometraje inicial
                <input
                  type="number"
                  name="kilometrajeInicio"
                  min="0"
                  step="1"
                  value={createForm.kilometrajeInicio}
                  onChange={handleCreateChange}
                  className="field"
                  disabled={creating}
                />
              </label>
            </div>

            {loadingOptions && (
              <p className="text-sm font-semibold text-[var(--color-muted)]">
                Cargando clientes y vehiculos...
              </p>
            )}

            {createError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {createError}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeCreateModal} disabled={creating}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmitCreate}>
                {creating ? 'Registrando...' : 'Confirmar alquiler'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {finishRental && (
        <Modal title={`Finalizar alquiler #${finishRental.idAlquiler}`} onClose={closeFinishModal}>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <span className="block font-semibold text-[var(--color-muted)]">Cliente</span>
              {finishRental.cliente}
            </p>
            <p>
              <span className="block font-semibold text-[var(--color-muted)]">Vehiculo</span>
              {finishRental.vehiculo}
            </p>
            <p>
              <span className="block font-semibold text-[var(--color-muted)]">Sucursal</span>
              {finishRental.sucursal}
            </p>
            <p>
              <span className="block font-semibold text-[var(--color-muted)]">Estado actual</span>
              {finishRental.estado}
            </p>
            <p>
              <span className="block font-semibold text-[var(--color-muted)]">Inicio</span>
              {formatDateTime(finishRental.fechaHoraInicio)}
            </p>
            <p>
              <span className="block font-semibold text-[var(--color-muted)]">
                Fecha prevista de devolucion
              </span>
              {formatDateTime(finishRental.fechaHoraFin)}
            </p>
            <p>
              <span className="block font-semibold text-[var(--color-muted)]">
                Kilometraje inicial
              </span>
              {finishRental.kilometrajeInicio ?? 'No disponible'}
            </p>
          </div>

          {String(finishRental.estado || '').toUpperCase() === 'ATRASADO' && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              Este alquiler figura atrasado. La base de datos puede aplicar un recargo al finalizar.
            </div>
          )}

          <div className="mt-4 rounded-md bg-[var(--color-bg)] p-4 text-sm text-[var(--color-muted)]">
            Al confirmar, se registra la devolucion, se finaliza el alquiler, el vehiculo vuelve a
            quedar disponible y PostgreSQL genera la factura correspondiente.
          </div>

          <form onSubmit={handleFinishSubmit} className="mt-5 space-y-4">
            <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
              Kilometraje final
              <input
                type="number"
                name="kilometrajeFin"
                min="0"
                step="1"
                value={finishForm.kilometrajeFin}
                onChange={handleFinishChange}
                className="field"
                disabled={finishing}
              />
            </label>

            {finishError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {finishError}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeFinishModal} disabled={finishing}>
                Cancelar
              </Button>
              <Button type="submit" disabled={finishing}>
                {finishing ? 'Finalizando...' : 'Finalizar alquiler'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {invoiceSummary && (
        <Modal title={`Factura #${invoiceSummary.idFactura}`} onClose={() => setInvoiceSummary(null)}>
          <p className="text-sm font-semibold text-emerald-800">{invoiceSummary.mensaje}</p>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-md bg-[var(--color-bg)] px-4 py-3">
              <dt className="font-semibold text-[var(--color-muted)]">Monto del alquiler</dt>
              <dd className="font-bold text-[var(--color-text)]">
                {formatCurrency(invoiceSummary.montoAlquiler)}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-md bg-[var(--color-bg)] px-4 py-3">
              <dt className="font-semibold text-[var(--color-muted)]">Monto extra</dt>
              <dd className="font-bold text-[var(--color-text)]">
                {formatCurrency(invoiceSummary.montoExtra)}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] px-4 py-3">
              <dt className="font-semibold text-[var(--color-primary)]">Total</dt>
              <dd className="font-bold text-[var(--color-primary)]">
                {formatCurrency(invoiceSummary.total)}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={() => setInvoiceSummary(null)}>
              Cerrar resumen
            </Button>
          </div>
        </Modal>
      )}
    </main>
  )
}

export default AdminAlquileresPage
