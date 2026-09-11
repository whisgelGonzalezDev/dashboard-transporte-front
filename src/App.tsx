import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { AdminLayout } from './components/layout/AdminLayout'
import { ToursAdminPage } from './pages/admin/ToursAdminPage'
import { BusesAdminPage } from './pages/admin/BusesAdminPage'
import { ViajesAdminPage } from './pages/admin/ViajesAdminPage'
import { PasajerosAdminPage } from './pages/admin/PasajerosAdminPage'
import { UsuariosAdminPage } from './pages/admin/UsuariosAdminPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La landing pública es la vista principal al desplegar. */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="tours" replace />} />
          <Route path="tours" element={<ToursAdminPage />} />
          <Route path="buses" element={<BusesAdminPage />} />
          <Route path="viajes" element={<ViajesAdminPage />} />
          <Route path="pasajeros" element={<PasajerosAdminPage />} />
          <Route path="usuarios" element={<UsuariosAdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
