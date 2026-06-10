import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import {
  crearVehiculo,
  getCatalogosVehiculo,
  getVehiculos,
} from '../../services/vehiculosService'

const emptyForm = {
  idModelo: '',
  idTipoVehiculo: '',
  idSucursal: '',
  idEstado: '',
  confort: '',
  imagenes: [''],
}

function formatCurrency(value) {
  return value != null ? `$${Number(value).toLocaleString('es-AR')}` : 'Precio no definido'
}

function findDisponible(estados) {
  return estados.find((estado) => estado.normalized === 'disponible')?.value || ''
}

function AdminVehiculosPage() {
  const [vehiculos, setVehiculos] = useState([])
  const [catalogos, setCatalogos] = useState({
    modelos: [],
    tipos: [],
    sucursales: [],
    estados: [],
    tarifas: [],
  })
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fallbackMessage, setFallbackMessage] = useState('')
  const [catalogMessage, setCatalogMessage] = useState('')
  const [actionMessage, setActionMessage] = useState(null)

  async function loadVehiculos() {
    setLoading(true)
    const result = await getVehiculos()

    setVehiculos(result.data)
    setFallbackMessage(
      result.usedFallback
        ? 'No se pudieron cargar vehiculos desde Supabase. Se muestran datos de respaldo.'
        : '',
    )
    setLoading(false)
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialData() {
      const [vehiculosResult, catalogosResult] = await Promise.all([
        getVehiculos(),
        getCatalogosVehiculo(),
      ])

      if (ignore) return

      const estados = catalogosResult.estados.data

      setVehiculos(vehiculosResult.data)
      setCatalogos({
        modelos: catalogosResult.modelos.data,
        tipos: catalogosResult.tipos.data,
        sucursales: catalogosResult.sucursales.data,
        estados,
        tarifas: catalogosResult.tarifas.data,
      })
      setForm((current) => ({
        ...current,
        idEstado: current.idEstado || findDisponible(estados),
      }))
      setFallbackMessage(
        vehiculosResult.usedFallback
          ? 'No se pudieron cargar vehiculos desde Supabase. Se muestran datos de respaldo.'
          : '',
      )
      setCatalogMessage(
        catalogosResult.error
          ? 'No se pudieron cargar todos los catalogos. Revisa modelos, tipos, sucursales y estados antes de guardar.'
          : '',
      )
      setLoading(false)
      setCatalogLoading(false)
    }

    loadInitialData()

    return () => {
      ignore = true
    }
  }, [])

  const hasPrecioNoDefinido = useMemo(
    () => vehiculos.some((vehiculo) => vehiculo.precioDiario == null),
    [vehiculos],
  )

  const tarifaSeleccionada = useMemo(
    () =>
      catalogos.tarifas.find(
        (tarifa) =>
          String(tarifa.idSucursal) === String(form.idSucursal) &&
          String(tarifa.idTipoVehiculo) === String(form.idTipoVehiculo),
      ),
    [catalogos.tarifas, form.idSucursal, form.idTipoVehiculo],
  )

  const showTarifaWarning =
    form.idSucursal && form.idTipoVehiculo && (!tarifaSeleccionada || tarifaSeleccionada.precioDiario == null)

  function resetForm() {
    setForm({
      ...emptyForm,
      idEstado: findDisponible(catalogos.estados),
    })
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleImageChange(index, value) {
    setForm((current) => ({
      ...current,
      imagenes: current.imagenes.map((imagen, currentIndex) =>
        currentIndex === index ? value : imagen,
      ),
    }))
  }

  function addImageInput() {
    setForm((current) => ({
      ...current,
      imagenes: current.imagenes.length < 5 ? [...current.imagenes, ''] : current.imagenes,
    }))
  }

  function removeImageInput(index) {
    setForm((current) => ({
      ...current,
      imagenes:
        current.imagenes.length > 1
          ? current.imagenes.filter((_, currentIndex) => currentIndex !== index)
          : current.imagenes,
    }))
  }

  function validateForm() {
    const cleanImagenes = form.imagenes.map((imagen) => imagen.trim()).filter(Boolean)

    if (!form.idModelo) return 'Selecciona un modelo.'
    if (!form.idTipoVehiculo) return 'Selecciona un tipo de vehiculo.'
    if (!form.idSucursal) return 'Selecciona una sucursal.'
    if (!form.idEstado) return 'Selecciona un estado.'
    if (!form.confort.trim()) return 'Ingresa el detalle de confort.'
    if (cleanImagenes.length === 0) return 'Carga al menos una URL de imagen.'
    if (cleanImagenes.length > 5) return 'Carga como maximo 5 imagenes.'
    if (cleanImagenes.length !== form.imagenes.length) return 'No dejes URLs de imagen vacias.'

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationMessage = validateForm()
    if (validationMessage) {
      setActionMessage({ type: 'error', text: validationMessage })
      return
    }

    setSaving(true)
    setActionMessage(null)

    const result = await crearVehiculo({
      idModelo: Number(form.idModelo),
      confort: form.confort.trim(),
      idTipoVehiculo: Number(form.idTipoVehiculo),
      idEstado: Number(form.idEstado),
      idSucursal: Number(form.idSucursal),
      imagenes: form.imagenes.map((imagen) => imagen.trim()),
    })

    setSaving(false)

    if (!result.exito) {
      setActionMessage({
        type: 'error',
        text: result.mensaje || 'No se pudo guardar el vehiculo.',
      })
      return
    }

    setActionMessage({
      type: 'success',
      text: `${result.mensaje || 'Vehiculo creado correctamente.'} ID vehiculo: ${result.idVehiculo}`,
    })
    resetForm()
    setShowForm(false)
    await loadVehiculos()
  }

  return (
    <main>
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
            Administracion
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
            Gestion de vehiculos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            Alta y control operativo del catalogo publicado para reservas.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setShowForm((current) => !current)
            setActionMessage(null)
          }}
        >
          {showForm ? 'Cerrar formulario' : 'Nuevo vehiculo'}
        </Button>
      </div>

      {fallbackMessage && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {fallbackMessage}
        </div>
      )}

      {catalogMessage && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {catalogMessage}
        </div>
      )}

      {hasPrecioNoDefinido && (
        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-[var(--color-secondary)]">
          Hay vehiculos con precio no definido. Revisa que exista tarifa para la combinacion
          sucursal + tipo.
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

      {showForm && (
        <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Modelo
                <select
                  name="idModelo"
                  value={form.idModelo}
                  onChange={handleChange}
                  className="field"
                  disabled={catalogLoading}
                >
                  <option value="">Seleccionar</option>
                  {!catalogLoading && catalogos.modelos.length === 0 && (
                    <option value="" disabled>
                      No hay opciones cargadas
                    </option>
                  )}
                  {catalogos.modelos.map((modelo) => (
                    <option key={modelo.value} value={modelo.value}>
                      {modelo.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Tipo de vehiculo
                <select
                  name="idTipoVehiculo"
                  value={form.idTipoVehiculo}
                  onChange={handleChange}
                  className="field"
                  disabled={catalogLoading}
                >
                  <option value="">Seleccionar</option>
                  {!catalogLoading && catalogos.tipos.length === 0 && (
                    <option value="" disabled>
                      No hay opciones cargadas
                    </option>
                  )}
                  {catalogos.tipos.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Sucursal
                <select
                  name="idSucursal"
                  value={form.idSucursal}
                  onChange={handleChange}
                  className="field"
                  disabled={catalogLoading}
                >
                  <option value="">Seleccionar</option>
                  {!catalogLoading && catalogos.sucursales.length === 0 && (
                    <option value="" disabled>
                      No hay opciones cargadas
                    </option>
                  )}
                  {catalogos.sucursales.map((sucursal) => (
                    <option key={sucursal.value} value={sucursal.value}>
                      {sucursal.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
                Estado
                <select
                  name="idEstado"
                  value={form.idEstado}
                  onChange={handleChange}
                  className="field"
                  disabled={catalogLoading}
                >
                  <option value="">Seleccionar</option>
                  {!catalogLoading && catalogos.estados.length === 0 && (
                    <option value="" disabled>
                      No hay opciones cargadas
                    </option>
                  )}
                  {catalogos.estados.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {showTarifaWarning && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                No se encontro una tarifa con precio diario para la sucursal y tipo
                seleccionados. El vehiculo puede aparecer con precio no definido.
              </div>
            )}

            <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
              Confort
              <textarea
                name="confort"
                value={form.confort}
                onChange={handleChange}
                className="field min-h-28"
                placeholder="Aire acondicionado, direccion asistida, Bluetooth..."
              />
            </label>

            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-[var(--color-muted)]">
                  Imagenes del vehiculo
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImageInput}
                  disabled={form.imagenes.length >= 5}
                >
                  Agregar imagen
                </Button>
              </div>

              <div className="grid gap-3">
                {form.imagenes.map((imagen, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      type="url"
                      value={imagen}
                      onChange={(event) => handleImageChange(index, event.target.value)}
                      className="field"
                      placeholder="https://..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeImageInput(index)}
                      disabled={form.imagenes.length === 1}
                    >
                      Quitar imagen
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || catalogLoading}>
                {saving ? 'Guardando...' : 'Guardar vehiculo'}
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3">Vehiculo</th>
                <th className="px-5 py-3">Marca</th>
                <th className="px-5 py-3">Modelo</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Sucursal</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Precio diario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                    Cargando vehiculos...
                  </td>
                </tr>
              ) : vehiculos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center font-semibold text-[var(--color-muted)]">
                    No hay vehiculos para mostrar.
                  </td>
                </tr>
              ) : (
                vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id}>
                    <td className="px-5 py-4 font-bold text-[var(--color-primary)]">
                      #{vehiculo.id}
                    </td>
                    <td className="px-5 py-4">{vehiculo.marca}</td>
                    <td className="px-5 py-4">{vehiculo.modelo}</td>
                    <td className="px-5 py-4">{vehiculo.tipo}</td>
                    <td className="px-5 py-4">{vehiculo.sucursal}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[var(--color-secondary)]">
                        {vehiculo.estado}
                      </span>
                    </td>
                    <td
                      className={`px-5 py-4 font-bold ${
                        vehiculo.precioDiario == null ? 'text-amber-700' : 'text-[var(--color-text)]'
                      }`}
                    >
                      {formatCurrency(vehiculo.precioDiario)}
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

export default AdminVehiculosPage

