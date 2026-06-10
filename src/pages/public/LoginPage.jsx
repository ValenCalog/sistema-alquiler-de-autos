import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(event) {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Ingresa tu email.')
      return
    }

    if (!password) {
      setError('Ingresa tu contrasena.')
      return
    }

    setLoading(true)
    const result = await login({ email: email.trim(), password })
    setLoading(false)

    if (!result.exito) {
      setError(result.mensaje || 'No se pudo iniciar sesion.')
      return
    }

    if (result.user?.rol === 'ADMIN') {
      navigate('/admin', { replace: true })
      return
    }

    navigate('/vehiculos', { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-78px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Iniciar sesion</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Accede para gestionar tus reservas online.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Email
            <input
              autoComplete="email"
              className="field"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="cliente@email.com"
              type="email"
              value={email}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Contrasena
            <input
              autoComplete="current-password"
              className="field"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contrasena"
              type="password"
              value={password}
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
