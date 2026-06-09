import { NavLink, Outlet } from 'react-router-dom'

const adminLinks = [
  { to: '/', label: 'Vista cliente' },
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/reservas', label: 'Reservas' },
  { to: '/admin/alquileres', label: 'Alquileres' },
]

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] lg:flex">
      <aside className="border-b border-[var(--color-border)] bg-[var(--color-primary)] px-4 py-5 text-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:px-6">
        <NavLink to="/" className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-sm font-bold text-[var(--color-primary)]">
            AN
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight">AutoNexo</span>
            <span className="block text-xs text-slate-300">Panel administrativo</span>
          </span>
        </NavLink>

        <nav className="flex gap-2 lg:flex-col">
          {adminLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-white text-[var(--color-primary)]'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
