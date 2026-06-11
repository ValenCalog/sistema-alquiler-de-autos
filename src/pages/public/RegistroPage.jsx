import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

function RegistroPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!nombre.trim()) {
      setError('Ingresá tu nombre.')
      return
    }

    if (!apellido.trim()) {
      setError('Ingresá tu apellido.')
      return
    }

    if (!email.trim()) {
      setError('Ingresá tu email.')
      return
    }

    if (!password) {
      setError('Ingresá una contraseña.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('La confirmación no coincide con la contraseña.')
      return
    }

    try {
      setLoading(true)

      const data = await register({
        email: email.trim(),
        password,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
      })

      if (data?.exito) {
        navigate('/vehiculos', { replace: true })
        return
      }

      setError(data?.mensaje || 'No se pudo crear la cuenta.')
    } catch (authError) {
      setError(authError.message || 'Error al registrar usuario.')
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
            Nombre
            <input
              autoComplete="given-name"
              className="field"
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Juan"
              type="text"
              value={nombre}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Apellido
            <input
              autoComplete="family-name"
              className="field"
              onChange={(event) => setApellido(event.target.value)}
              placeholder="Pérez"
              type="text"
              value={apellido}
            />
          </label>

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
            Contraseña
            <input
              autoComplete="new-password"
              className="field"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Creá una contraseña"
              type="password"
              value={password}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Confirmar contraseña
            <input
              autoComplete="new-password"
              className="field"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repetí la contraseña"
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
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-bold text-[var(--color-accent)]">
            Iniciar sesión
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RegistroPage