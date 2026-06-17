import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import VehicleImage from '../../components/ui/VehicleImage'
import CalendarioReservas from '../../components/ui/CalendarioReservas' // Asegúrate de ajustar esta ruta
import {
  calcularDiasReserva,
  crearReserva,
  guardarReservaLocal,
  getReservasPorVehiculo
} from '../../services/reservasService'
import { getVehiculoById } from '../../services/vehiculosService'

// TODO: Reemplazar por el id del cliente autenticado cuando se implemente Supabase Auth.
const CLIENTE_DEMO_ID = 1

// Función auxiliar para bloquear fechas pasadas en los inputs nativos
const getTodayFormatted = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function VehiculoDetallePage() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [loadingVehicle, setLoadingVehicle] = useState(true)
  const [fallbackMessage, setFallbackMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  
  // Estado centralizado para la sincronización bidireccional
  const [reservation, setReservation] = useState({ inicio: '', devolucion: '' })
  const [fechasOcupadas, setFechasOcupadas] = useState([])
  
  const [error, setError] = useState('')
  const [createdReservation, setCreatedReservation] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Obtenemos la fecha de hoy formateada para el atributo min de los inputs
  const todayFormatted = getTodayFormatted();

  useEffect(() => {
    let ignore = false

    async function loadVehicleData() {
      // Ejecutamos ambas consultas en paralelo para mejorar el rendimiento
      const [vehicleResult, reservasResult] = await Promise.all([
        getVehiculoById(id),
        getReservasPorVehiculo(id)
      ])

      if (!ignore) {
        setVehicle(vehicleResult.data)
        
        setFallbackMessage(
          vehicleResult.usedFallback || reservasResult.usedFallback
            ? 'No se pudo conectar con Supabase. Se muestra informacion simulada.'
            : '',
        )
        
        // 1. Definimos los estados estrictos que ocupan el vehículo
        const estadosBloqueantes = ['FINALIZADA', 'ACTIVA'];

        // 2. Filtramos robustamente normalizando el string y 3. Mapeamos al formato del calendario
        const reservasFiltradas = (reservasResult.data || [])
          .filter((res) => {
            if (!res.estado) return false;
            // Normalización: eliminamos espacios extra y pasamos a mayúsculas
            const estadoNormalizado = String(res.estado).trim().toUpperCase();
            return estadosBloqueantes.includes(estadoNormalizado);
          })
          .map((res) => ({
            inicio: res.inicio,
            fin: res.devolucion 
          }));
        
        // Guardamos solo los rangos válidos en el estado
        setFechasOcupadas(reservasFiltradas)
        setSelectedImage(0)
        setLoadingVehicle(false)
      }
    }

    loadVehicleData()

    return () => {
      ignore = true
    }
  }, [id])

  const days = useMemo(
    () => calcularDiasReserva(reservation.inicio, reservation.devolucion),
    [reservation],
  )

  const estimatedCost = days * (vehicle?.precioDiario || 0)
  
  const galleryImages = useMemo(() => {
    if (!vehicle) return []

    return [...new Set([...(vehicle.imagenes || []), vehicle.imagenPrincipal])]
      .map((image) => String(image || '').trim())
      .filter((image) => image.length > 0)
      .filter((image) => !image.toLowerCase().includes('sin imagen'))
  }, [vehicle])

  const mainImage = galleryImages[selectedImage] || galleryImages[0] || null

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

  // Manejador para los inputs nativos
  function handleReservationChange(event) {
    const { name, value } = event.target
    setReservation((current) => ({ ...current, [name]: value }))
    setError('')
  }

  // Manejador para el componente Calendario
  function handleFechasCalendarioSeleccionadas(fechas) {
    setReservation((prev) => ({
      ...prev,
      inicio: fechas.inicio !== undefined ? fechas.inicio : prev.inicio,
      devolucion: fechas.fin !== undefined ? fechas.fin : prev.devolucion
    }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    
    // Leemos directamente del estado controlado
    const { inicio, devolucion } = reservation
    const formDays = calcularDiasReserva(inicio, devolucion)

    if (!inicio || !devolucion) {
      setError('Completa la fecha de inicio y la fecha de devolucion prevista.')
      return
    }

    if (formDays <= 0) {
      setError('La fecha de inicio debe ser anterior a la fecha de devolucion.')
      return
    }

    setIsSubmitting(true)

    // TODO: Permitir seleccionar horarios reales de retiro y devolucion.
    const fechaInicioTimestamp = `${inicio} 10:00:00`
    const fechaFinTimestamp = `${devolucion} 10:00:00`

    const result = await crearReserva({
      idCliente: CLIENTE_DEMO_ID,
      idVehiculo: Number(vehicle.id),
      fechaInicio: fechaInicioTimestamp,
      fechaFin: fechaFinTimestamp,
    })

    setIsSubmitting(false)

    if (!result.exito) {
      setError(result.mensaje || 'No se pudo registrar la reserva.')
      return
    }

    const reservaLocal = guardarReservaLocal({
      id: `R-${result.idReserva}`,
      idReserva: result.idReserva,
      cliente: 'Cliente demo',
      idVehiculo: Number(vehicle.id),
      vehiculoId: vehicle.id,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      vehiculo: `${vehicle.marca} ${vehicle.modelo}`,
      tipo: vehicle.tipo,
      sucursal: vehicle.sucursal,
      fechaInicio: inicio,
      fechaFin: devolucion,
      inicio: inicio,
      devolucion: devolucion,
      estado: 'Pendiente',
      diasEstimados: formDays,
      costoEstimado: formDays * (vehicle.precioDiario || 0),
      creadaEn: new Date().toISOString(),
    })

    setCreatedReservation({
      ...reservaLocal,
      mensaje: result.mensaje,
    })
    setError('')
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
            <VehicleImage
              src={mainImage}
              alt={`${vehicle.marca} ${vehicle.modelo}`}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          {galleryImages.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-3">
              {galleryImages.map((image, index) => (
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
                  <VehicleImage
                    src={image}
                    alt={`Vista ${index + 1} de ${vehicle.marca} ${vehicle.modelo}`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
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
            <h2 className="text-xl font-bold text-[var(--color-primary)] mb-5">Solicitar reserva</h2>
            
            {/* Integración del Calendario */}
            <div className="mb-6 flex justify-center">
              <CalendarioReservas 
                reservasExistentes={fechasOcupadas}
                fechaInicio={reservation.inicio}
                fechaFin={reservation.devolucion}
                onFechasSeleccionadas={handleFechasCalendarioSeleccionadas}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Fecha de inicio
                <input
                  type="date"
                  name="inicio"
                  min={todayFormatted} // Bloquea fechas anteriores a hoy en el selector nativo
                  value={reservation.inicio}
                  onChange={handleReservationChange}
                  className="field w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  required
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Fecha de devolucion prevista
                <input
                  type="date"
                  name="devolucion"
                  min={reservation.inicio || todayFormatted} // Bloquea fechas anteriores al inicio seleccionado (o a hoy si no hay inicio)
                  value={reservation.devolucion}
                  onChange={handleReservationChange}
                  className="field w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  required
                />
              </label>
            </div>

            <div className="mt-6 rounded-md bg-[var(--color-bg)] p-4 text-sm">
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

            <Button type="submit" className="mt-5 w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando reserva...' : 'Confirmar reserva'}
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
              Creamos la reserva #{createdReservation.idReserva} para{' '}
              {createdReservation.vehiculo}. Ya podes consultarla desde Mis reservas.
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