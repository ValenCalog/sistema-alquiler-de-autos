import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

function RegistroPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Ingresa tu email.')
      return
    }

    if (!password) {
      setError('Ingresa una contrasena.')
      return
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('La confirmacion no coincide con la contrasena.')
      return
    }

    try {
      setLoading(true)
      const data = await register({ email: email.trim(), password })

      if (data.session) {
        navigate('/vehiculos', { replace: true })
        return
      }

      setMessage('Registro creado. Revisa tu correo para confirmar la cuenta.')
      setPassword('')
      setConfirmPassword('')
    } catch (authError) {
      setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-78px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Crear cuenta</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Registrate para solicitar reservas y consultar tus alquileres.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
              autoComplete="new-password"
              className="field"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Crea una contrasena"
              type="password"
              value={password}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Confirmar contrasena
            <input
              autoComplete="new-password"
              className="field"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeti la contrasena"
              type="password"
              value={confirmPassword}
            />
          </label>
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {message}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
          Ya tenes cuenta?{' '}
          <Link to="/login" className="font-bold text-[var(--color-accent)]">
            Iniciar sesion
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RegistroPage
