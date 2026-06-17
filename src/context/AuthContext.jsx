/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  cerrarSesion,
  iniciarSesion,
  obtenerSesionActual,
  registrarUsuario,
} from '../services/authService'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'autonexo_usuario'

function normalizeRol(rol) {
  return String(rol || '').trim().toUpperCase()
}

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function getStoredUser() {
  if (!canUseStorage()) return null

  try {
    const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return rawUser ? JSON.parse(rawUser) : null
  } catch {
    return null
  }
}

function saveStoredUser(user) {
  if (!canUseStorage()) return
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

function removeStoredUser() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

function normalizeUser(user) {
  if (!user) return null

  return {
    idUsuario: user.idUsuario ?? null,
    idCliente: user.idCliente ?? null,
    email: user.email ?? '',
    rol: normalizeRol(user.rol),
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentSession = obtenerSesionActual()

    setSession(currentSession)
    setUser(currentSession?.user || null)
    setLoading(false)
  }, [])

  async function login(credentials) {
    const data = await iniciarSesion(credentials)

    setSession(data.session)
    setUser(data.user)

    return data
  }

  async function register({ email, password, nombre, apellido }) {
    const data = await registrarUsuario({
      email,
      password,
      nombre,
      apellido,
    })

    setSession(data.session)
    setUser(data.user)

    return data
  }

  async function logout() {
    cerrarSesion()
    setSession(null)
    setUser(null)
  }

  const isAuthenticated = Boolean(user)
  const isAdmin = normalizeRol(user?.rol) === 'ADMIN'
  const isCliente = normalizeRol(user?.rol) === 'CLIENTE'

  const value = useMemo(
    () => ({
      user,
      usuario: user,
      session: null,
      sesion: null,
      loading,

      login,
      register,
      registro: register,
      logout,

      isAuthenticated: Boolean(user),
      isAdmin: user?.rol?.toUpperCase() === 'ADMIN',
      isCliente: user?.rol?.toUpperCase() === 'CLIENTE',
    }),
    [user, loading, isAuthenticated, isAdmin, isCliente],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
