import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import VehicleCard from '../../components/ui/VehicleCard'
import { sucursales, tiposVehiculo } from '../../data/mockData'
import { getVehiculosDisponibles } from '../../services/vehiculosService'

function HomeCliente() {
  const [destacados, setDestacados] = useState([])

  useEffect(() => {
    let ignore = false

    async function loadDestacados() {
      const result = await getVehiculosDisponibles({ estado: 'Disponible' })
      if (!ignore) setDestacados(result.data.slice(0, 3))
    }

    loadDestacados()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <main>
      <section className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
              Reserva online
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-[var(--color-primary)] sm:text-5xl">
              Alquila el vehiculo ideal para tu viaje
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)]">
              Elegi sucursal, fechas y tipo de vehiculo. Te mostramos opciones reales
              para reservar de forma simple y segura.
            </p>
          </div>

          <form className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-text)]">Buscar vehiculos</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Sucursal
                <select className="field">
                  <option value="">Todas</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal}>{sucursal}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Tipo de vehiculo
                <select className="field">
                  <option value="">Todos</option>
                  {tiposVehiculo.map((tipo) => (
                    <option key={tipo}>{tipo}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Fecha de inicio
                <input type="date" className="field" />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Fecha de devolucion
                <input type="date" className="field" />
              </label>
            </div>
            <Button to="/vehiculos" className="mt-5 w-full">
              Buscar vehiculos
            </Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
              Flota destacada
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
              Vehiculos disponibles
            </h2>
          </div>
          <Button to="/vehiculos" variant="outline">
            Ver todos
          </Button>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {destacados.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default HomeCliente
