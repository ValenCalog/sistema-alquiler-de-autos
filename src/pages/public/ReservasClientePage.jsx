import Button from '../../components/ui/Button'
import { getReservas } from '../../services/reservasService'

function ReservasClientePage() {
  const reservas = getReservas()

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
            Area cliente
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
            Reservas recientes
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            Vista simulada para consultar solicitudes y alquileres asociados a una
            cuenta de cliente.
          </p>
        </div>
        <Button to="/vehiculos">Nueva reserva</Button>
      </div>

      <section className="mt-6 grid gap-4">
        {reservas.map((reserva) => (
          <article
            key={reserva.id}
            className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--color-accent)]">{reserva.id}</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-primary)]">
                  {reserva.vehiculo}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {reserva.sucursal} - {reserva.inicio} al {reserva.devolucion}
                </p>
              </div>
              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-[var(--color-secondary)]">
                {reserva.estado}
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default ReservasClientePage
