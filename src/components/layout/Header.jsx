import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/vehiculos', label: 'Vehiculos' },
  { to: '/mis-reservas', label: 'Mis reservas' },
  { to: '/login', label: 'Iniciar sesion' },
  { to: '/registro', label: 'Registrarse' },
  { to: '/admin', label: 'Admin' },
]

function Header() {
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
        </nav>
      </div>
    </header>
  )
}

export default Header
