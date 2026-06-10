/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import { iniciarSesion, registrarUsuario } from '../services/authService'

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
  const [user, setUser] = useState(() => normalizeUser(getStoredUser()))
  const loading = false

  async function login({ email, password }) {
    const result = await iniciarSesion({ email, password })

    if (result.exito) {
      const nextUser = normalizeUser(result.user)
      saveStoredUser(nextUser)
      setUser(nextUser)

      return {
        ...result,
        user: nextUser,
      }
    }

    return result
  }

  async function register({ email, password }) {
    const result = await registrarUsuario({ email, password })

    if (result.exito) {
      const nextUser = normalizeUser(result.user)
      saveStoredUser(nextUser)
      setUser(nextUser)

      return {
        ...result,
        user: nextUser,
      }
    }

    return result
  }

  function logout() {
    removeStoredUser()
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
      registro: register,
      register,
      logout,
      isAuthenticated,
      isAdmin,
      isCliente,
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
