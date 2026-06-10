import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabaseClient' // Asegurate de que la ruta sea correcta

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 1. Autenticamos con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      alert('Error al iniciar sesión: ' + error.message)
      return
    }

    // 2. Extraemos el rol desde los metadatos (si no tiene, asumimos que es cliente)
    const rol = data.user.user_metadata?.rol || 'cliente'

    // 3. Redirigimos según el rol
    if (rol === 'admin') {
      navigate('/admin') // Redirige al AdminDashboardPage
    } else {
      navigate('/vehiculos') // Redirige a la vista pública de VehiculosPage
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-78px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Accedé para gestionar tus reservas online.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Email
            <input 
              type="email" 
              className="field" 
              placeholder="cliente@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="font-bold text-[var(--color-accent)]">
            Registrarse
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage