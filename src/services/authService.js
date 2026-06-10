import { supabase } from '../lib/supabaseClient'

function normalizeRol(rol) {
  return String(rol || '').trim().toUpperCase()
}

function normalizeAuthUser(row, fallbackEmail = '') {
  return {
    idUsuario: row?.id_usuario ?? null,
    idCliente: row?.id_cliente ?? null,
    email: row?.email || fallbackEmail,
    rol: normalizeRol(row?.rol),
  }
}

function normalizeAuthRpcResponse(data, fallbackEmail = '') {
  const row = Array.isArray(data) ? data[0] : data
  const exito = Boolean(row?.exito)
  const user = exito ? normalizeAuthUser(row, fallbackEmail) : null

  return {
    exito,
    mensaje: row?.mensaje || '',
    user,
    idUsuario: user?.idUsuario ?? row?.id_usuario ?? null,
    idCliente: user?.idCliente ?? row?.id_cliente ?? null,
    email: user?.email ?? row?.email ?? fallbackEmail,
    rol: user?.rol ?? normalizeRol(row?.rol),
  }
}

function authErrorResult(mensaje) {
  return {
    exito: false,
    mensaje,
    user: null,
    idUsuario: null,
    idCliente: null,
    email: '',
    rol: '',
  }
}

export async function iniciarSesion({ email, password }) {
  if (!supabase) {
    return authErrorResult('No se pudo conectar con Supabase. Revisa la configuracion del entorno.')
  }

  try {
    const { data, error } = await supabase.rpc('fn_login_usuario_api', {
      p_email: email,
      p_contrasenia: password,
    })

    if (error) {
      console.error('Error tecnico al iniciar sesion:', error)
      return authErrorResult('No se pudo iniciar sesion en este momento.')
    }

    const result = normalizeAuthRpcResponse(data, email)

    return {
      ...result,
      mensaje: result.mensaje || 'No se pudo iniciar sesion.',
    }
  } catch (error) {
    console.error('Error inesperado al iniciar sesion:', error)
    return authErrorResult('No se pudo iniciar sesion en este momento.')
  }
}

export async function registrarUsuario({ email, password }) {
  if (!supabase) {
    return authErrorResult('No se pudo conectar con Supabase. Revisa la configuracion del entorno.')
  }

  try {
    const { data, error } = await supabase.rpc('fn_registrar_cliente_api', {
      p_email: email,
      p_contrasenia: password,
    })

    if (error) {
      console.error('Error tecnico al registrar cliente:', error)
      return authErrorResult('No se pudo registrar la cuenta en este momento.')
    }

    const result = normalizeAuthRpcResponse(data, email)

    return {
      ...result,
      mensaje: result.mensaje || 'No se pudo registrar la cuenta.',
    }
  } catch (error) {
    console.error('Error inesperado al registrar cliente:', error)
    return authErrorResult('No se pudo registrar la cuenta en este momento.')
  }
}
