import { useState } from 'react'
import Button from '../../components/ui/Button'
import { getMisReservas } from '../../services/reservasService'

function MisReservasPage() {
  const [misReservas] = useState(() => getMisReservas())

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
            Consulta las reservas creadas durante esta demo. Los datos quedan
            guardados en este navegador hasta que se limpie el almacenamiento local.
          </p>
        </div>
        <Button to="/vehiculos">Volver a vehiculos</Button>
      </div>

      {misReservas.length === 0 ? (
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
                key={reserva.id}
                className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--color-accent)]">
                      {reserva.id}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-[var(--color-primary)]">
                      {reserva.vehiculo}
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
                      {reserva.inicio} al {reserva.devolucion}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--color-text)]">Costo estimado</dt>
                    <dd>${reserva.costoEstimado.toLocaleString('es-AR')}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>

          <section className="mt-6 hidden rounded-lg border border-[var(--color-border)] bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  <tr>
                    <th className="px-5 py-3">Codigo</th>
                    <th className="px-5 py-3">Vehiculo</th>
                    <th className="px-5 py-3">Sucursal</th>
                    <th className="px-5 py-3">Inicio</th>
                    <th className="px-5 py-3">Devolucion</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Costo estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {misReservas.map((reserva) => (
                    <tr key={reserva.id}>
                      <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                        {reserva.id}
                      </td>
                      <td className="px-5 py-4">{reserva.vehiculo}</td>
                      <td className="px-5 py-4">{reserva.sucursal}</td>
                      <td className="px-5 py-4">{reserva.inicio}</td>
                      <td className="px-5 py-4">{reserva.devolucion}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[var(--color-secondary)]">
                          {reserva.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-[var(--color-text)]">
                        ${reserva.costoEstimado.toLocaleString('es-AR')}
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
