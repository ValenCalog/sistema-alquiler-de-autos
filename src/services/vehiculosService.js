import { vehiculos } from '../data/mockData'
import { supabase } from '../lib/supabaseClient'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80'

function fallbackResult(data, message = '') {
  return {
    data,
    error: message,
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

function normalizeText(value, fallback = 'Sin especificar') {
  if (typeof value === 'string' && value.trim()) return value.trim()
  return fallback
}

function firstValue(source, keys, fallback = null) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key]
  }

  return fallback
}

function getRelationName(relation, keys, fallback = 'Sin especificar') {
  if (!relation) return fallback

  if (typeof relation === 'string') return normalizeText(relation, fallback)

  for (const key of keys) {
    const value = relation[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return fallback
}

function normalizeImagenes(row) {
  const imagenes =
    row.imagenvehiculo ||
    row.imagenes ||
    row.imagen_vehiculo ||
    row.imagenVehiculo ||
    []

  const urls = Array.isArray(imagenes)
    ? imagenes
        .map((imagen) =>
          typeof imagen === 'string'
            ? imagen
            : firstValue(imagen, ['url', 'url_imagen', 'imagen_url', 'ruta', 'path']),
        )
        .filter(Boolean)
    : []

  return urls.length > 0 ? urls.slice(0, 5) : [FALLBACK_IMAGE]
}

function normalizeConfort(row) {
  const confort = firstValue(row, ['confort', 'detalle_confort', 'detalleConfort'], [])

  if (Array.isArray(confort)) return confort
  if (typeof confort === 'string' && confort.trim()) {
    return confort.split(',').map((item) => item.trim()).filter(Boolean)
  }

  return ['Confort pendiente de cargar']
}

function normalizeVehiculo(row) {
  const modelo = row.modelo || {}
  const marca = row.marca || modelo.marca || {}
  const tipo = row.tipovehiculo || row.tipo_vehiculo || modelo.tipovehiculo || {}
  const estado = row.estadovehiculo || row.estado_vehiculo || row.estado || {}
  const sucursal = row.sucursal || {}

  return {
    id: String(firstValue(row, ['id_vehiculo', 'id', 'vehiculo_id'])),
    marca: getRelationName(marca, ['nombre_marca', 'marca', 'nombre'], 'Marca pendiente'),
    modelo: getRelationName(modelo, ['nombre_modelo', 'modelo', 'nombre'], 'Modelo pendiente'),
    tipo: getRelationName(tipo, ['nombre_tipo', 'tipo', 'descripcion', 'nombre'], 'Tipo pendiente'),
    sucursal: getRelationName(
      sucursal,
      ['nombre_sucursal', 'sucursal', 'nombre', 'direccion'],
      'Sucursal pendiente',
    ),
    estado: getRelationName(
      estado,
      ['nombre_estado', 'estado', 'descripcion', 'nombre'],
      'Disponible',
    ),
    // TODO: Reemplazar este fallback por tarifa/precio real cuando este definida la relacion.
    precioDiario: Number(firstValue(row, ['precio_diario', 'precioDiario', 'tarifa_diaria'], 45000)),
    confort: normalizeConfort(row),
    descripcion: normalizeText(
      firstValue(row, ['descripcion', 'detalle', 'observaciones']),
      'Vehiculo cargado desde Supabase. Descripcion pendiente de completar.',
    ),
    imagenes: normalizeImagenes(row),
  }
}

function filterVehiculos(data, filtros = {}) {
  return data.filter((vehiculo) => {
    const matchesEstado =
      !filtros.estado || vehiculo.estado.toLowerCase() === filtros.estado.toLowerCase()
    const matchesSucursal =
      !filtros.sucursal || vehiculo.sucursal.toLowerCase() === filtros.sucursal.toLowerCase()
    const matchesTipo =
      !filtros.tipo || vehiculo.tipo.toLowerCase() === filtros.tipo.toLowerCase()
    const matchesPrecio =
      !filtros.precioMaximo || vehiculo.precioDiario <= Number(filtros.precioMaximo)

    return matchesEstado && matchesSucursal && matchesTipo && matchesPrecio
  })
}

async function fetchVehiculosFromSupabase() {
  if (!supabase) {
    throw new Error('No hay variables de entorno de Supabase configuradas.')
  }

  const richQuery = await supabase
    .from('vehiculo')
    .select(
      `
        id_vehiculo,
        confort,
        descripcion,
        precio_diario,
        modelo (
          nombre_modelo,
          modelo,
          nombre,
          marca (
            nombre_marca,
            marca,
            nombre
          ),
          tipovehiculo (
            nombre_tipo,
            tipo,
            descripcion,
            nombre
          )
        ),
        estadovehiculo (
          nombre_estado,
          estado,
          descripcion,
          nombre
        ),
        sucursal (
          nombre_sucursal,
          sucursal,
          nombre,
          direccion
        ),
        imagenvehiculo (
          url,
          url_imagen,
          imagen_url,
          ruta
        )
      `,
    )
    .order('id_vehiculo', { ascending: true })

  if (!richQuery.error) {
    return (richQuery.data || []).map(normalizeVehiculo)
  }

  // TODO: Ajustar nombres de relaciones si el esquema expone otros aliases o FKs.
  const simpleQuery = await supabase
    .from('vehiculo')
    .select(
      `
        id_vehiculo,
        id_modelo,
        id_estado_vehiculo,
        id_sucursal,
        confort,
        descripcion,
        precio_diario
      `,
    )
    .order('id_vehiculo', { ascending: true })

  if (simpleQuery.error) {
    throw richQuery.error
  }

  return (simpleQuery.data || []).map(normalizeVehiculo)
}

export async function getVehiculos() {
  try {
    const data = await fetchVehiculosFromSupabase()
    if (data.length === 0) {
      return fallbackResult([...vehiculos], 'Supabase no devolvio vehiculos.')
    }

    return supabaseResult(data)
  } catch (error) {
    return fallbackResult([...vehiculos], error.message)
  }
}

export async function getVehiculoById(id) {
  try {
    const data = await fetchVehiculosFromSupabase()
    const vehiculo = data.find((item) => item.id === String(id))

    if (!vehiculo) throw new Error('El vehiculo no existe en Supabase.')

    return supabaseResult(vehiculo)
  } catch (error) {
    return fallbackResult(
      vehiculos.find((vehiculo) => vehiculo.id === String(id)) || null,
      error.message,
    )
  }
}

export async function getVehiculosDisponibles(filtros = {}) {
  const result = await getVehiculos()
  return {
    ...result,
    data: filterVehiculos(result.data, filtros),
  }
}
