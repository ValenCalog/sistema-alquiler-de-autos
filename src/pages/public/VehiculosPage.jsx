import { useEffect, useState } from 'react'
import VehicleCard from '../../components/ui/VehicleCard'
import { sucursales, tiposVehiculo } from '../../data/mockData'
import { getVehiculosDisponibles } from '../../services/vehiculosService'

const estados = ['Disponible', 'Alquilado', 'Mantenimiento']

function VehiculosPage() {
  const [filters, setFilters] = useState({
    sucursal: '',
    tipo: '',
    estado: '',
    precioMaximo: '',
  })
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [fallbackMessage, setFallbackMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadVehicles() {
      const result = await getVehiculosDisponibles(filters)

      if (!ignore) {
        setVehicles(result.data)
        setFallbackMessage(
          result.usedFallback
            ? 'No se pudo conectar con Supabase. Se muestran datos simulados para la demo.'
            : '',
        )
        setLoading(false)
      }
    }

    loadVehicles()

    return () => {
      ignore = true
    }
  }, [filters])

  function handleFilterChange(event) {
    const { name, value } = event.target
    setLoading(true)
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
            Catalogo
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
            Vehiculos para alquilar
          </h1>
        </div>
        <p className="text-sm font-semibold text-[var(--color-muted)]">
          {vehicles.length} resultados encontrados
        </p>
      </div>

      {fallbackMessage && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {fallbackMessage}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Filtros</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
              Sucursal
              <select
                name="sucursal"
                value={filters.sucursal}
                onChange={handleFilterChange}
                className="field"
              >
                <option value="">Todas</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal}>{sucursal}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
              Tipo
              <select
                name="tipo"
                value={filters.tipo}
                onChange={handleFilterChange}
                className="field"
              >
                <option value="">Todos</option>
                {tiposVehiculo.map((tipo) => (
                  <option key={tipo}>{tipo}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
              Estado
              <select
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
                className="field"
              >
                <option value="">Todos</option>
                {estados.map((estado) => (
                  <option key={estado}>{estado}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
              Precio maximo:{' '}
              {filters.precioMaximo
                ? `$${Number(filters.precioMaximo).toLocaleString('es-AR')}`
                : 'sin limite'}
              <input
                type="range"
                name="precioMaximo"
                min="30000"
                max="100000"
                step="5000"
                value={filters.precioMaximo || '100000'}
                onChange={handleFilterChange}
                className="w-full accent-[var(--color-accent)]"
              />
              {filters.precioMaximo && (
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true)
                    setFilters((current) => ({ ...current, precioMaximo: '' }))
                  }}
                  className="text-sm font-bold text-[var(--color-accent)] hover:text-red-800"
                >
                  Quitar limite de precio
                </button>
              )}
            </label>
          </div>
        </aside>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 text-sm font-semibold text-[var(--color-muted)] shadow-sm md:col-span-2 xl:col-span-3">
              Cargando vehiculos...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 text-sm font-semibold text-[var(--color-muted)] shadow-sm md:col-span-2 xl:col-span-3">
              No hay vehiculos que coincidan con los filtros.
            </div>
          ) : (
            vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
          )}
        </section>
      </div>
    </main>
  )
}

export default VehiculosPage
