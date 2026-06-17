import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({
  children,
  requireCliente = false,
  requireAdmin = false,
}) {
  const { isAdmin, isCliente, loading, user } =
    useAuth()

  const location = useLocation()

  const hasValidClientId =
    Number.isInteger(Number(user?.idCliente)) &&
    Number(user?.idCliente) > 0

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-78px)] max-w-7xl items-center justify-center px-4 py-10">
        <p className="text-sm font-semibold text-[var(--color-muted)]">
          Cargando sesión...
        </p>
      </main>
    )
  }

  if (!user) {
    return (
      <Navigate
        replace
        state={{ from: location }}
        to="/login"
      />
    )
  }

  if (
    requireCliente &&
    (!isCliente || !hasValidClientId)
  ) {
    return <Navigate replace to="/login" />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate replace to="/vehiculos" />
  }

  return children
}

export default ProtectedRoute