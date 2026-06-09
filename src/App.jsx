import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import PublicLayout from './components/layout/PublicLayout'
import AdminAlquileresPage from './pages/admin/AdminAlquileresPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminReservasPage from './pages/admin/AdminReservasPage'
import HomeCliente from './pages/public/HomeCliente'
import LoginPage from './pages/public/LoginPage'
import MisReservasPage from './pages/public/MisReservasPage'
import RegistroPage from './pages/public/RegistroPage'
import ReservasClientePage from './pages/public/ReservasClientePage'
import VehiculoDetallePage from './pages/public/VehiculoDetallePage'
import VehiculosPage from './pages/public/VehiculosPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomeCliente />} />
          <Route path="/vehiculos" element={<VehiculosPage />} />
          <Route path="/vehiculos/:id" element={<VehiculoDetallePage />} />
          <Route path="/reservas" element={<ReservasClientePage />} />
          <Route path="/mis-reservas" element={<MisReservasPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/reservas" element={<AdminReservasPage />} />
          <Route path="/admin/alquileres" element={<AdminAlquileresPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
