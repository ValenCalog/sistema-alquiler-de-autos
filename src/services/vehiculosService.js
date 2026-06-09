import { vehiculos } from '../data/mockData'
import { supabase } from '../lib/supabaseClient'

const PLACEHOLDER_IMAGE =
  vehiculos.find((vehiculo) => vehiculo.imagenes?.length > 0)?.imagenes[0] ||
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80'

function fallbackResult(data, motivo = '') {
  console.warn('Usando mockData por:', motivo)

  return {
    data,
    error: motivo,
    source: 'mock',
    usedFallback: true,
  }
}

function supabaseResult(data) {
  return {
    data,
    error: '',
    source: 'supabase',
    usedFallback: false,
  }
}

function hasMeaningfulFilter(value, ignoredValues = []) {
  if (value === undefined || value === null) return false

  const normalizedValue = String(value).trim().toLowerCase()
  if (!normalizedValue || normalizedValue === '0') return false

  return !ignoredValues.includes(normalizedValue)
}

function normalizeFilterValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function normalizeImagenes(row) {
  const rawImagenes = row.imagenes
  let imagenes = []

  if (Array.isArray(rawImagenes)) {
    imagenes = rawImagenes
  } else if (typeof rawImagenes === 'string' && rawImagenes.trim()) {
    try {
      const parsed = JSON.parse(rawImagenes)
      imagenes = Array.isArray(parsed) ? parsed : [rawImagenes]
    } catch {
      imagenes = rawImagenes.includes(',')
        ? rawImagenes.split(',').map((imagen) => imagen.trim())
        : [rawImagenes]
    }
  }

  const cleanImagenes = imagenes
    .map((imagen) => {
      if (typeof imagen === 'string') return imagen.trim()
      return imagen?.url || imagen?.url_imagen || imagen?.imagen_url || imagen?.ruta || ''
    })
    .filter(Boolean)

  if (cleanImagenes.length > 0) return cleanImagenes.slice(0, 5)
  if (row.imagen_principal) return [row.imagen_principal]

  return []
}

function normalizeVehiculoCatalogo(row) {
  const imagenes = normalizeImagenes(row)
  const imagenPrincipal = row.imagen_principal || imagenes[0] || PLACEHOLDER_IMAGE

  return {
    id: String(row.id_vehiculo),
    marca: row.marca ?? 'Marca no especificada',
    modelo: row.modelo ?? 'Modelo no especificado',
    tipo: row.tipo ?? 'Tipo no especificado',
    sucursal: row.sucursal ?? 'Sucursal no especificada',
    estado: row.estado ?? 'Estado no especificado',
    estadoNormalizado: row.estado_normalizado ?? row.estado ?? 'Estado no especificado',
    precioDiario: row.precio_diario != null ? Number(row.precio_diario) : null,
    porcentajeRecargo:
      row.porcentaje_recargo != null ? Number(row.porcentaje_recargo) : null,
    confort: row.confort ?? 'Sin detalle de confort',
    descripcion: row.descripcion ?? '',
    imagenes,
    imagenPrincipal,
  }
}

function filterVehiculos(data, filtros = {}) {
  return data.filter((vehiculo) => {
    const hasEstado = hasMeaningfulFilter(filtros.estado, ['todos', 'todas'])
    const hasSucursal = hasMeaningfulFilter(filtros.sucursal, ['todos', 'todas'])
    const hasTipo = hasMeaningfulFilter(filtros.tipo, ['todos', 'todas'])
    const hasPrecio = hasMeaningfulFilter(filtros.precioMaximo, ['todos', 'todas'])

    const matchesEstado =
      !hasEstado ||
      normalizeFilterValue(vehiculo.estadoNormalizado || vehiculo.estado) ===
        normalizeFilterValue(filtros.estado)
    const matchesSucursal =
      !hasSucursal ||
      normalizeFilterValue(vehiculo.sucursal) === normalizeFilterValue(filtros.sucursal)
    const matchesTipo =
      !hasTipo || normalizeFilterValue(vehiculo.tipo) === normalizeFilterValue(filtros.tipo)
    const matchesPrecio =
      !hasPrecio ||
      (vehiculo.precioDiario != null &&
        vehiculo.precioDiario <= Number(filtros.precioMaximo))

    return matchesEstado && matchesSucursal && matchesTipo && matchesPrecio
  })
}

function applyCatalogoFilters(query, filtros = {}) {
  let nextQuery = query

  if (hasMeaningfulFilter(filtros.sucursal, ['todos', 'todas'])) {
    nextQuery = nextQuery.eq('sucursal', filtros.sucursal)
  }

  if (hasMeaningfulFilter(filtros.tipo, ['todos', 'todas'])) {
    nextQuery = nextQuery.eq('tipo', filtros.tipo)
  }

  if (hasMeaningfulFilter(filtros.estado, ['todos', 'todas'])) {
    nextQuery = nextQuery.ilike('estado_normalizado', normalizeFilterValue(filtros.estado))
  }

  if (hasMeaningfulFilter(filtros.precioMaximo, ['todos', 'todas'])) {
    nextQuery = nextQuery.lte('precio_diario', Number(filtros.precioMaximo))
  }

  return nextQuery
}

async function fetchVehiculosCatalogoFromSupabase(filtros = {}) {
  if (!supabase) {
    throw new Error('No hay variables de entorno de Supabase configuradas.')
  }

  console.log('Filtros enviados a Supabase:', filtros)

  const query = applyCatalogoFilters(
    supabase.from('vw_vehiculos_catalogo').select('*'),
    filtros,
  ).order('id_vehiculo', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.log('Error de Supabase al cargar vehiculos:', error)
    throw error
  }

  console.log('Vehiculos recibidos desde Supabase:', data)

  return (data || []).map(normalizeVehiculoCatalogo)
}

export async function getVehiculos() {
  try {
    if (!supabase) {
      throw new Error('No hay variables de entorno de Supabase configuradas.')
    }

    console.log('Filtros enviados a Supabase:', {})

    const { data, error } = await supabase
      .from('vw_vehiculos_catalogo')
      .select('*')
      .order('id_vehiculo', { ascending: true })

    if (error) {
      console.log('Error de Supabase al cargar vehiculos:', error)
      throw error
    }

    console.log('Vehiculos recibidos desde Supabase:', data)

    return supabaseResult((data || []).map(normalizeVehiculoCatalogo))
  } catch (error) {
    return fallbackResult([...vehiculos], error.message)
  }
}

export async function getVehiculoById(id) {
  try {
    if (!supabase) {
      throw new Error('No hay variables de entorno de Supabase configuradas.')
    }

    const { data, error } = await supabase
      .from('vw_vehiculos_catalogo')
      .select('*')
      .eq('id_vehiculo', id)
      .maybeSingle()

    if (error) {
      console.log('Error de Supabase al cargar vehiculos:', error)
      throw error
    }

    console.log('Vehiculos recibidos desde Supabase:', data ? [data] : [])

    return supabaseResult(data ? normalizeVehiculoCatalogo(data) : null)
  } catch (error) {
    return fallbackResult(
      vehiculos.find((vehiculo) => vehiculo.id === String(id)) || null,
      error.message,
    )
  }
}

export async function getVehiculosDisponibles(filtros = {}) {
  try {
    const data = await fetchVehiculosCatalogoFromSupabase(filtros)
    return supabaseResult(data)
  } catch (error) {
    return fallbackResult(filterVehiculos(vehiculos, filtros), error.message)
  }
}
