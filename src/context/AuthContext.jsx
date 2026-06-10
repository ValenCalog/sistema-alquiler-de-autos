/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
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
    let active = true
    let subscription

    async function loadSession() {
      const currentSession = await obtenerSesionActual()

      if (!active) return

      setSession(currentSession)
      setUser(currentSession?.user || null)
      setLoading(false)
    }

    loadSession()

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession)
        setUser(nextSession?.user || null)
        setLoading(false)
      })

      subscription = data.subscription
    }

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  async function login(credentials) {
    const data = await iniciarSesion(credentials)
    setSession(data.session)
    setUser(data.user)
    return data
  }

  async function register({ email, password, metadata }) {
    const data = await registrarUsuario({ email, password, metadata })
    setSession(data.session)
    setUser(data.session?.user || null)
    return data
  }

  async function logout() {
    await cerrarSesion()
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
      registro: register,
      register,
      logout,
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
