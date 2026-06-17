import Badge from './Badge'
import Button from './Button'
import VehicleImage from './VehicleImage'
import { useAuth } from '../../context/AuthContext'

function VehicleCard({ vehicle }) {
  const { isCliente, user } = useAuth()
  const imageSrc = vehicle.imagenPrincipal || vehicle.imagenes?.[0]
  const detailPath = `/vehiculos/${vehicle.id}`
  const hasValidClientId = Number.isInteger(Number(user?.idCliente)) && Number(user?.idCliente) > 0
  const canReserve = Boolean(user && isCliente && hasValidClientId)
  const reserveTarget = canReserve ? detailPath : '/login'
  const reserveState = canReserve ? undefined : { from: { pathname: detailPath } }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-[16/10] overflow-hidden bg-slate-200">
        <VehicleImage
          src={imageSrc}
          alt={`${vehicle.marca} ${vehicle.modelo}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-accent)]">
              {vehicle.tipo}
            </p>
            <h3 className="mt-1 text-xl font-bold text-[var(--color-text)]">
              {vehicle.marca} {vehicle.modelo}
            </h3>
          </div>
          <Badge>{vehicle.estado}</Badge>
        </div>

        <p className="mt-3 text-sm text-[var(--color-muted)]">{vehicle.descripcion}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="font-semibold text-[var(--color-muted)]">Sucursal</dt>
            <dd className="text-[var(--color-text)]">{vehicle.sucursal}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--color-muted)]">Precio diario</dt>
            <dd className="font-bold text-[var(--color-text)]">
              {vehicle.precioDiario != null
                ? `$${vehicle.precioDiario.toLocaleString('es-AR')}`
                : 'A confirmar'}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button to={detailPath} variant="outline" className="flex-1">
            Ver detalle
          </Button>
          <Button to={reserveTarget} state={reserveState} className="flex-1">
            {canReserve ? 'Reservar' : 'Iniciar sesion para reservar'}
          </Button>
        </div>
      </div>
    </article>
  )
}

export default VehicleCard
