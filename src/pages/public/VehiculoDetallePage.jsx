import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { calcularDiasReserva, crearReserva } from '../../services/reservasService'
import { getVehiculoById } from '../../services/vehiculosService'

function VehiculoDetallePage() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [loadingVehicle, setLoadingVehicle] = useState(true)
  const [fallbackMessage, setFallbackMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [reservation, setReservation] = useState({ inicio: '', devolucion: '' })
  const [error, setError] = useState('')
  const [createdReservation, setCreatedReservation] = useState(null)

  useEffect(() => {
    let ignore = false

    async function loadVehicle() {
      const result = await getVehiculoById(id)

      if (!ignore) {
        setVehicle(result.data)
        setFallbackMessage(
          result.usedFallback
            ? 'No se pudo conectar con Supabase. Se muestra informacion simulada.'
            : '',
        )
        setSelectedImage(0)
        setLoadingVehicle(false)
      }
    }

    loadVehicle()

    return () => {
      ignore = true
    }
  }, [id])

  const days = useMemo(
    () => calcularDiasReserva(reservation.inicio, reservation.devolucion),
    [reservation],
  )

  const estimatedCost = days * (vehicle?.precioDiario || 0)

  if (loadingVehicle) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            Cargando vehiculo...
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Estamos consultando la informacion disponible.
          </p>
        </div>
      </main>
    )
  }

  if (!vehicle) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">
          Vehiculo no encontrado
        </h1>
        <p className="mt-3 text-[var(--color-muted)]">
          El vehiculo solicitado no existe en el catalogo simulado.
        </p>
        <Button to="/vehiculos" className="mt-6">
          Volver al catalogo
        </Button>
      </main>
    )
  }

  function handleReservationChange(event) {
    const { name, value } = event.target
    setReservation((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextReservation = {
      inicio: formData.get('inicio'),
      devolucion: formData.get('devolucion'),
    }
    const formDays = calcularDiasReserva(nextReservation.inicio, nextReservation.devolucion)

    setReservation(nextReservation)

    if (!nextReservation.inicio || !nextReservation.devolucion) {
      setError('Completa la fecha de inicio y la fecha de devolucion prevista.')
      return
    }

    if (formDays <= 0) {
      setError('La fecha de inicio debe ser anterior a la fecha de devolucion.')
      return
    }

    try {
      const nuevaReserva = crearReserva({
        vehiculoId: vehicle.id,
        vehiculo: vehicle,
        inicio: nextReservation.inicio,
        devolucion: nextReservation.devolucion,
      })

      setCreatedReservation(nuevaReserva)
      setError('')
    } catch (serviceError) {
      setError(serviceError.message)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/vehiculos"
        className="text-sm font-semibold text-[var(--color-accent)] hover:text-red-800"
      >
        Volver a vehiculos
      </Link>

      {fallbackMessage && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {fallbackMessage}
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section>
          <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
            <img
              src={vehicle.imagenes[selectedImage] || vehicle.imagenPrincipal}
              alt={`${vehicle.marca} ${vehicle.modelo}`}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <div className="mt-3 grid grid-cols-5 gap-3">
            {(vehicle.imagenes.length > 0 ? vehicle.imagenes : [vehicle.imagenPrincipal]).map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`overflow-hidden rounded-md border ${
                  selectedImage === index
                    ? 'border-[var(--color-accent)] ring-2 ring-red-100'
                    : 'border-[var(--color-border)]'
                }`}
              >
                <img
                  src={image}
                  alt={`Vista ${index + 1} de ${vehicle.marca} ${vehicle.modelo}`}
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
                  {vehicle.tipo}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
                  {vehicle.marca} {vehicle.modelo}
                </h1>
              </div>
              <Badge>{vehicle.estado}</Badge>
            </div>

            <p className="mt-4 leading-7 text-[var(--color-muted)]">{vehicle.descripcion}</p>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-semibold text-[var(--color-muted)]">Sucursal</dt>
                <dd className="mt-1 font-bold text-[var(--color-text)]">{vehicle.sucursal}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--color-muted)]">Precio diario</dt>
                <dd className="mt-1 font-bold text-[var(--color-text)]">
                  {vehicle.precioDiario != null
                    ? `$${vehicle.precioDiario.toLocaleString('es-AR')}`
                    : 'A confirmar'}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Confort
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {(Array.isArray(vehicle.confort) ? vehicle.confort : [vehicle.confort]).map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-[var(--color-secondary)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-[var(--color-primary)]">Solicitar reserva</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Fecha de inicio
                <input
                  type="date"
                  name="inicio"
                  value={reservation.inicio}
                  onChange={handleReservationChange}
                  onInput={handleReservationChange}
                  className="field"
                  required
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Fecha de devolucion prevista
                <input
                  type="date"
                  name="devolucion"
                  value={reservation.devolucion}
                  onChange={handleReservationChange}
                  onInput={handleReservationChange}
                  className="field"
                  required
                />
              </label>
            </div>

            <div className="mt-5 rounded-md bg-[var(--color-bg)] p-4 text-sm">
              <p className="font-bold text-[var(--color-text)]">Resumen</p>
              <p className="mt-2 text-[var(--color-muted)]">
                Duracion estimada: {days || '-'} dias
              </p>
              <p className="mt-1 text-[var(--color-muted)]">
                Total estimado:{' '}
                <span className="font-bold text-[var(--color-text)]">
                  ${Number(estimatedCost).toLocaleString('es-AR')}
                </span>
              </p>
            </div>

            {error && (
              <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="mt-5 w-full">
              Confirmar reserva
            </Button>
          </form>
        </section>
      </div>

      {createdReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
              Reserva registrada
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--color-primary)]">
              Tu solicitud fue guardada correctamente
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
              Creamos la reserva {createdReservation.id} para {createdReservation.vehiculo}.
              Ya podes consultarla desde Mis reservas.
            </p>
            <div className="mt-5 rounded-md bg-[var(--color-bg)] p-4 text-sm text-[var(--color-muted)]">
              <p>
                Fechas: {createdReservation.inicio} al {createdReservation.devolucion}
              </p>
              <p className="mt-1">
                Total estimado:{' '}
                <span className="font-bold text-[var(--color-text)]">
                  ${createdReservation.costoEstimado.toLocaleString('es-AR')}
                </span>
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button to="/mis-reservas" className="flex-1">
                Ver mis reservas
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCreatedReservation(null)}
              >
                Seguir viendo
              </Button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default VehiculoDetallePage
