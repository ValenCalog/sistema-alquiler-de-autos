/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  cerrarSesion,
  iniciarSesion,
  obtenerSesionActual,
  registrarUsuario,
} from '../services/authService'

const AuthContext = createContext(null)

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

  const value = useMemo(
    () => ({
      user,
      usuario: user,
      session,
      sesion: session,
      loading,

      login,
      register,
      registro: register,
      logout,

      isAuthenticated: Boolean(user),
      isAdmin: user?.rol?.toUpperCase() === 'ADMIN',
      isCliente: user?.rol?.toUpperCase() === 'CLIENTE',
    }),
    [user, session, loading],
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
