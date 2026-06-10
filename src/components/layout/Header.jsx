import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/vehiculos', label: 'Vehiculos' },
  { to: '/mis-reservas', label: 'Mis reservas' },
  { to: '/admin', label: 'Admin' },
]

function Header() {
  const { user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    try {
      setLoggingOut(true)
      await logout()
    } catch (error) {
      console.error('No se pudo cerrar sesion:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary)] text-sm font-bold text-white">
            AN
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight text-[var(--color-text)]">
              AutoNexo
            </span>
            <span className="block text-xs font-medium text-[var(--color-muted)]">
              Alquiler de vehiculos
            </span>
          </span>
        </NavLink>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 transition ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-muted)] hover:bg-slate-100 hover:text-[var(--color-text)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {!user ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 transition ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-muted)] hover:bg-slate-100 hover:text-[var(--color-text)]'
                  }`
                }
              >
                Iniciar sesion
              </NavLink>
              <NavLink
                to="/registro"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 transition ${
                    isActive
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-accent)] text-white hover:bg-red-800'
                  }`
                }
              >
                Registrarse
              </NavLink>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-3 py-2 text-[var(--color-secondary)]">
                {user.email}
              </span>
              <button
                className="rounded-md border border-[var(--color-border-strong)] bg-white px-3 py-2 text-[var(--color-primary)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loggingOut}
                onClick={handleLogout}
                type="button"
              >
                {loggingOut ? 'Cerrando...' : 'Cerrar sesion'}
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
