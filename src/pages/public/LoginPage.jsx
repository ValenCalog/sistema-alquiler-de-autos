import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-78px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Iniciar sesion</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Accede para gestionar tus reservas online.
        </p>

        <form className="mt-6 space-y-4">
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Email
            <input type="email" className="field" placeholder="cliente@email.com" />
          </label>
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Contrasena
            <input type="password" className="field" placeholder="Ingresa tu contrasena" />
          </label>
          <Button type="submit" className="w-full">
            Iniciar sesion
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
