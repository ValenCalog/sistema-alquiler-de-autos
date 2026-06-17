import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({
  children,
  requireCliente = false,
  requireAdmin = false,
}) {
  const { isAdmin, isCliente, loading, user } = useAuth()
  const location = useLocation()

  // 1. Mostrar estado de carga mientras se restaura o valida la sesión
  if (loading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-78px)] max-w-7xl items-center justify-center px-4 py-10">
        <p className="text-sm font-semibold text-[var(--color-muted)]">
          Cargando sesión...
        </p>
      </main>
    )
  }

  // 2. Si no hay usuario en absoluto, se le exige iniciar sesión
  if (!user) {
    return (
      <Navigate
        replace
        state={{ from: location }}
        to="/login"
      />
    )
  }

  // A partir de esta línea, GARANTIZAMOS que `user` no es null.
  
  // 3. Validación específica para clientes
  if (requireCliente) {
    // Es 100% seguro acceder a user.idCliente ahora
    const hasValidClientId =
      Number.isInteger(Number(user.idCliente)) && Number(user.idCliente) > 0

    if (!isCliente || !hasValidClientId) {
      // IMPORTANTE: Si ya está logueado pero no cumple los requisitos,
      // NO lo mandamos al login (evita bucles). Lo mandamos al catálogo.
      return <Navigate replace to="/vehiculos" />
    }
  }

  // 4. Validación específica para administradores
  if (requireAdmin && !isAdmin) {
    return <Navigate replace to="/vehiculos" />
  }

  // 5. Si superó todas las barreras de seguridad, renderizamos la vista
  return children
}

export default ProtectedRoute
