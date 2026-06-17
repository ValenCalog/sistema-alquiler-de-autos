import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import PublicLayout from './components/layout/PublicLayout'
import ProtectedRoute from './components/routes/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AdminAlquileresPage from './pages/admin/AdminAlquileresPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminReservasPage from './pages/admin/AdminReservasPage'
import AdminVehiculosPage from './pages/admin/AdminVehiculosPage'
import HomeCliente from './pages/public/HomeCliente'
import LoginPage from './pages/public/LoginPage'
import MisReservasPage from './pages/public/MisReservasPage'
import RegistroPage from './pages/public/RegistroPage'
import ReservasClientePage from './pages/public/ReservasClientePage'
import VehiculoDetallePage from './pages/public/VehiculoDetallePage'
import VehiculosPage from './pages/public/VehiculosPage'
import AdminCierresDiariosPage from './pages/admin/AdminCierresDiariosPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomeCliente />} />
            <Route path="/vehiculos" element={<VehiculosPage />} />
            <Route path="/vehiculos/:id" element={<VehiculoDetallePage />} />
            <Route
              path="/reservas"
              element={
                <ProtectedRoute requireCliente>
                  <ReservasClientePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-reservas"
              element={
                <ProtectedRoute requireCliente>
                  <MisReservasPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
          </Route>
          <Route
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/admin"
              element={<AdminDashboardPage />}
            />

            <Route
              path="/admin/vehiculos"
              element={<AdminVehiculosPage />}
            />

            <Route
              path="/admin/reservas"
              element={<AdminReservasPage />}
            />

            <Route
              path="/admin/alquileres"
              element={<AdminAlquileresPage />}
            />

            <Route
              path="/admin/cierres-diarios"
              element={<AdminCierresDiariosPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App