import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

function Header() {
  // Extraemos directamente 'isAdmin' que ya definiste en tu AuthContext
  const { user, logout, isAdmin } = useAuth()

  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-[var(--color-primary)]">
            RentCar
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--color-muted)]">
            <Link to="/vehiculos" className="hover:text-[var(--color-primary)]">
              Vehículos
            </Link>
            
            {user && (
              <Link to="/mis-reservas" className="hover:text-[var(--color-primary)]">
                Mis Reservas
              </Link>
            )}

            {/* Condicional que utiliza tu propia lógica de base de datos */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--color-muted)] hidden sm:inline">
                {user.email}
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)] px-3 py-2">
                Iniciar sesión
              </Link>
              <Link to="/registro">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header