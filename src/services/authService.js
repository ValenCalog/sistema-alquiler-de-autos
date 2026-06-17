import { supabase } from '../lib/supabaseClient'

const AUTH_STORAGE_KEY = 'authUser'

function requireSupabase() {
  if (!supabase) {
    throw new Error('No se pudo conectar con Supabase. Revisa la configuracion del entorno.')
  }

  return supabase
}

function normalizeRol(rol) {
  return rol ? String(rol).toUpperCase() : 'CLIENTE'
}

function getFirstRow(data) {
  if (Array.isArray(data)) {
    return data[0]
  }

  return data
}

function guardarUsuario(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

function obtenerUsuarioGuardado() {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

function crearSesion(user) {
  return user ? { user } : null
}

export async function registrarUsuario({ email, password, nombre, apellido }) {
  try {
    const client = requireSupabase()

    const { data, error } = await client.rpc('fn_registrar_cliente_api', {
      p_email: email,
      p_contrasenia: password,
      p_nombre_cliente: nombre,
      p_apellido_cliente: apellido,
    })

    if (error) {
      throw error
    }

    const result = getFirstRow(data)

    if (!result?.exito) {
      throw new Error(result?.mensaje || 'No se pudo registrar el cliente.')
    }

    const user = {
      idUsuario: result.id_usuario,
      idCliente: result.id_cliente,
      email,
      rol: normalizeRol(result.rol),
      nombre,
      apellido,
    }

    guardarUsuario(user)

    return {
      ...result,
      user,
      session: crearSesion(user),
    }
  } catch (error) {
    console.error('Error de registro:', error)
    throw new Error(error.message || 'No se pudo registrar el usuario.')
  }
}

export async function iniciarSesion({ email, password }) {
  try {
    const client = requireSupabase()

    const { data, error } = await client.rpc('fn_login_usuario_api', {
      p_email: email,
      p_contrasenia: password,
    })

    if (error) {
      throw error
    }

    const result = getFirstRow(data)

    if (!result?.exito) {
      throw new Error(result?.mensaje || 'Email o contraseña incorrectos.')
    }

    const user = {
      idUsuario: result.id_usuario,
      idCliente: result.id_cliente,
      email: result.email,
      rol: normalizeRol(result.rol),
    }

    guardarUsuario(user)

    return {
      ...result,
      user,
      session: crearSesion(user),
    }
  } catch (error) {
    console.error('Error de login:', error)
    throw new Error(error.message || 'No se pudo iniciar sesión.')
  }
}

export function cerrarSesion() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function obtenerSesionActual() {
  const user = obtenerUsuarioGuardado()
  return crearSesion(user)
}

export function obtenerUsuarioActual() {
  return obtenerUsuarioGuardado()
}