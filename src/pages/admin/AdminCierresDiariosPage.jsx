import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import {
  getCierreDiarioPorFecha,
  getEjecucionesCierreDiario,
} from '../../services/cierresDiariosService'

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return '-'

  const fecha = new Date(
    `${String(value).slice(0, 10)}T00:00:00`,
  )

  return new Intl.DateTimeFormat('es-AR').format(fecha)
}

function formatDateTime(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function AdminCierresDiariosPage() {
  const [ejecuciones, setEjecuciones] = useState([])
  const [cierres, setCierres] = useState([])
  const [fechaSeleccionada, setFechaSeleccionada] =
    useState('')
  const [loading, setLoading] = useState(true)
  const [loadingDetalle, setLoadingDetalle] =
    useState(false)
  const [error, setError] = useState('')

  async function cargarEjecuciones() {
    setLoading(true)
    setError('')

    try {
      const data = await getEjecucionesCierreDiario()

      setEjecuciones(data)

      if (!fechaSeleccionada && data.length > 0) {
        setFechaSeleccionada(data[0].fechaCierre)
      }
    } catch (loadError) {
      setError(
        loadError.message ||
          'No se pudieron cargar los cierres diarios.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function cargarDetalle(fecha) {
    if (!fecha) {
      setCierres([])
      return
    }

    setLoadingDetalle(true)
    setError('')

    try {
      const data = await getCierreDiarioPorFecha(fecha)
      setCierres(data)
    } catch (loadError) {
      setError(
        loadError.message ||
          'No se pudo cargar el detalle del cierre.',
      )
      setCierres([])
    } finally {
      setLoadingDetalle(false)
    }
  }

  async function actualizarTodo() {
    await cargarEjecuciones()

    if (fechaSeleccionada) {
      await cargarDetalle(fechaSeleccionada)
    }
  }

  useEffect(() => {
    cargarEjecuciones()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    cargarDetalle(fechaSeleccionada)
  }, [fechaSeleccionada])

  const fechasDisponibles = useMemo(
    () => [
      ...new Set(
        ejecuciones
          .map((ejecucion) => ejecucion.fechaCierre)
          .filter(Boolean),
      ),
    ],
    [ejecuciones],
  )

  const ejecucionSeleccionada = useMemo(
    () =>
      ejecuciones.find(
        (ejecucion) =>
          ejecucion.fechaCierre === fechaSeleccionada,
      ) || null,
    [ejecuciones, fechaSeleccionada],
  )

  const resumen = useMemo(
    () => ({
      cantidadSucursales: cierres.length,
      cantidadFacturas: cierres.reduce(
        (total, cierre) =>
          total + cierre.cantidadFacturas,
        0,
      ),
      cantidadReservas: cierres.reduce(
        (total, cierre) =>
          total + cierre.cantidadReservasCreadas,
        0,
      ),
      montoTotal: cierres.reduce(
        (total, cierre) => total + cierre.montoTotal,
        0,
      ),
    }),
    [cierres],
  )

  const cantidadSucursales =
    ejecucionSeleccionada?.cantidadSucursales ??
    resumen.cantidadSucursales

  const cantidadFacturas =
    ejecucionSeleccionada?.cantidadFacturas ??
    resumen.cantidadFacturas

  const montoTotal =
    ejecucionSeleccionada?.montoTotal ??
    resumen.montoTotal

  return (
    <main>
      <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
          Administración
        </p>

        <h1 className="text-3xl font-bold text-[var(--color-primary)]">
          Cierres diarios
        </h1>

        <p className="max-w-3xl text-sm text-[var(--color-muted)]">
          Consultá los resultados del proceso masivo de
          cierre diario generado para cada sucursal.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="w-full max-w-sm space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Fecha de cierre

            <select
              className="field"
              value={fechaSeleccionada}
              onChange={(event) =>
                setFechaSeleccionada(event.target.value)
              }
              disabled={
                loading || fechasDisponibles.length === 0
              }
            >
              {fechasDisponibles.length === 0 ? (
                <option value="">
                  No hay cierres disponibles
                </option>
              ) : (
                fechasDisponibles.map((fecha) => (
                  <option key={fecha} value={fecha}>
                    {formatDate(fecha)}
                  </option>
                ))
              )}
            </select>
          </label>

          <Button
            type="button"
            variant="outline"
            onClick={actualizarTodo}
            disabled={loading || loadingDetalle}
          >
            {loading || loadingDetalle
              ? 'Actualizando...'
              : 'Actualizar'}
          </Button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Estado del cierre"
          value={
            loading
              ? '-'
              : ejecucionSeleccionada?.estado ||
                'Sin datos'
          }
          detail={
            ejecucionSeleccionada
              ? `Ejecución #${ejecucionSeleccionada.idEjecucion}`
              : 'No existe una ejecución para la fecha'
          }
        />

        <StatCard
          label="Sucursales procesadas"
          value={
            loadingDetalle ? '-' : cantidadSucursales
          }
          detail="Incluye sucursales sin actividad"
        />

        <StatCard
          label="Facturas emitidas"
          value={
            loadingDetalle ? '-' : cantidadFacturas
          }
          detail={`${resumen.cantidadReservas} reservas creadas`}
        />

        <StatCard
          label="Monto total"
          value={
            loadingDetalle
              ? '-'
              : formatCurrency(montoTotal)
          }
          detail="Alquileres y recargos"
        />
      </section>

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
        <div className="border-b border-[var(--color-border)] p-5">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">
            Detalle por sucursal
          </h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Resultados correspondientes al{' '}
            {formatDate(fechaSeleccionada)}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3">Sucursal</th>
                <th className="px-5 py-3">Reservas</th>
                <th className="px-5 py-3">
                  Alquileres iniciados
                </th>
                <th className="px-5 py-3">
                  Alquileres finalizados
                </th>
                <th className="px-5 py-3">Facturas</th>
                <th className="px-5 py-3">
                  Monto alquiler
                </th>
                <th className="px-5 py-3">Recargos</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Generado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {loadingDetalle ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]"
                  >
                    Cargando detalle del cierre...
                  </td>
                </tr>
              ) : cierres.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]"
                  >
                    No hay resultados para la fecha
                    seleccionada.
                  </td>
                </tr>
              ) : (
                cierres.map((cierre) => (
                  <tr key={cierre.idCierre}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-[var(--color-primary)]">
                        {cierre.direccionSucursal}
                      </p>

                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Sucursal #{cierre.idSucursal}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {cierre.cantidadReservasCreadas}
                    </td>

                    <td className="px-5 py-4">
                      {cierre.cantidadAlquileresIniciados}
                    </td>

                    <td className="px-5 py-4">
                      {
                        cierre.cantidadAlquileresFinalizados
                      }
                    </td>

                    <td className="px-5 py-4">
                      {cierre.cantidadFacturas}
                    </td>

                    <td className="px-5 py-4">
                      {formatCurrency(
                        cierre.montoAlquiler,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {formatCurrency(
                        cierre.montoRecargos,
                      )}
                    </td>

                    <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                      {formatCurrency(cierre.montoTotal)}
                    </td>

                    <td className="px-5 py-4">
                      {formatDateTime(
                        cierre.fechaGeneracion,
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
        <div className="border-b border-[var(--color-border)] p-5">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">
            Historial de ejecuciones
          </h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Últimas ejecuciones registradas por el
            procedimiento y por pg_cron.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3">Ejecución</th>
                <th className="px-5 py-3">
                  Fecha cierre
                </th>
                <th className="px-5 py-3">Inicio</th>
                <th className="px-5 py-3">Fin</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">
                  Sucursales
                </th>
                <th className="px-5 py-3">Facturas</th>
                <th className="px-5 py-3">Monto</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]"
                  >
                    Cargando ejecuciones...
                  </td>
                </tr>
              ) : ejecuciones.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]"
                  >
                    Todavía no hay ejecuciones
                    registradas.
                  </td>
                </tr>
              ) : (
                ejecuciones.map((ejecucion) => (
                  <tr key={ejecucion.idEjecucion}>
                    <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                      #{ejecucion.idEjecucion}
                    </td>

                    <td className="px-5 py-4">
                      {formatDate(
                        ejecucion.fechaCierre,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {formatDateTime(
                        ejecucion.fechaInicio,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {formatDateTime(
                        ejecucion.fechaFin,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        {ejecucion.estado}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {ejecucion.cantidadSucursales}
                    </td>

                    <td className="px-5 py-4">
                      {ejecucion.cantidadFacturas}
                    </td>

                    <td className="px-5 py-4 font-bold">
                      {formatCurrency(
                        ejecucion.montoTotal,
                      )}
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

export default AdminCierresDiariosPage