import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

function RegistroPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-78px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Crear cuenta</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Registrate para solicitar reservas y consultar tus alquileres.
        </p>

        <form className="mt-6 space-y-4">
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Email
            <input type="email" className="field" placeholder="cliente@email.com" />
          </label>
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Contrasena
            <input type="password" className="field" placeholder="Crea una contrasena" />
          </label>
          <label className="space-y-2 text-sm font-semibold text-[var(--color-muted)]">
            Confirmar contrasena
            <input type="password" className="field" placeholder="Repeti la contrasena" />
          </label>
          <Button type="submit" className="w-full">
            Crear cuenta
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
