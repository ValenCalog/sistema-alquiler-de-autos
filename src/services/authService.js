import { supabase } from '../lib/supabaseClient'

function requireSupabase() {
  if (!supabase) {
    throw new Error('No se pudo conectar con Supabase. Revisa la configuracion del entorno.')
  }

  return supabase
}

function getFriendlyAuthMessage(error) {
  const message = String(error?.message || '').toLowerCase()
  const status = error?.status

  if (message.includes('supabase') || message.includes('configuracion')) {
    return 'No se pudo conectar con Supabase. Revisa la configuracion del entorno.'
  }

  if (message.includes('invalid login credentials') || status === 400) {
    return 'Email o contrasena incorrectos.'
  }

  if (message.includes('email not confirmed')) {
    return 'Tenes que confirmar tu correo antes de iniciar sesion.'
  }

  if (message.includes('user already registered') || message.includes('already registered')) {
    return 'Ya existe una cuenta registrada con ese email.'
  }

  if (
    message.includes('password') &&
    (message.includes('6') || message.includes('weak') || message.includes('short'))
  ) {
    return 'La contrasena debe tener al menos 6 caracteres.'
  }

  if (message.includes('signup') && message.includes('disabled')) {
    return 'El registro de usuarios esta deshabilitado en Supabase.'
  }

  if (message.includes('invalid email') || message.includes('email address is invalid')) {
    return 'Ingresa un email valido.'
  }

  if (message.includes('email rate limit exceeded') || message.includes('rate limit')) {
    return 'Se hicieron demasiados intentos. Espera unos minutos y proba de nuevo.'
  }

  if (message.includes('database error')) {
    return 'Supabase no pudo guardar el usuario. Revisa si hay triggers o restricciones sobre usuarios/clientes.'
  }

  if (message.includes('error sending confirmation email')) {
    return 'La cuenta se intento crear, pero Supabase no pudo enviar el correo de confirmacion.'
  }

  if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
    return 'No se pudo conectar con Supabase. Intenta nuevamente.'
  }

  return error?.message || 'Ocurrio un error. Intenta nuevamente.'
}

function throwFriendlyError(error) {
  console.error('Error de autenticacion:', error)
  throw new Error(getFriendlyAuthMessage(error))
}

export async function registrarUsuario({ email, password }) {
  try {
    const client = requireSupabase()
    const { data, error } = await client.auth.signUp({ email, password })

    if (error) throw error

    return data
  } catch (error) {
    throwFriendlyError(error)
  }
}

export async function iniciarSesion({ email, password }) {
  try {
    const client = requireSupabase()
    const { data, error } = await client.auth.signInWithPassword({ email, password })

    if (error) throw error

    return data
  } catch (error) {
    throwFriendlyError(error)
  }
}

export async function cerrarSesion() {
  try {
    const client = requireSupabase()
    const { error } = await client.auth.signOut()

    if (error) throw error
  } catch (error) {
    throwFriendlyError(error)
  }
}

export async function obtenerSesionActual() {
  if (!supabase) return null

  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    return data.session
  } catch (error) {
    console.error('No se pudo obtener la sesion actual:', error)
    return null
  }
}

export async function obtenerUsuarioActual() {
  if (!supabase) return null

  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) throw error

    return data.user
  } catch (error) {
    console.error('No se pudo obtener el usuario actual:', error)
    return null
  }
}
