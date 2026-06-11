import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useAuth } from '../../context/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleLogin(event) {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Ingresá tu email.')
      return
    }

    if (!password) {
      setError('Ingresá tu contraseña.')
      return
    }

    try {
      setLoading(true)

      const data = await login({
        email: email.trim(),
        password,
      })

      const rol = data.user?.rol?.toUpperCase()

      if (rol === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/vehiculos', { replace: true })
      }
    } catch (authError) {
      setError(authError.message || 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-78px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          Iniciar sesión
        </h1>

        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Accede para gestionar tus reservas online.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Email
            <input
              type="email"
              className="field"
              placeholder="cliente@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Contraseña
            <input
              type="password"
              className="field"
              placeholder="Ingresá tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesion'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
          No tenes cuenta?{' '}
          <Link to="/registro" className="font-bold text-[var(--color-accent)]">
            Registrarse
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
