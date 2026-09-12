import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { AboutPage } from './pages/AboutPage'
import { TermsPage } from './pages/TermsPage'
import { ContactPage } from './pages/ContactPage'
import { RequireAuth } from './components/auth/RequireAuth'
import { AdminLayout } from './components/layout/AdminLayout'
import { ToursAdminPage } from './pages/admin/ToursAdminPage'
import { BusesAdminPage } from './pages/admin/BusesAdminPage'
import { ViajesAdminPage } from './pages/admin/ViajesAdminPage'
import { ReservasAdminPage } from './pages/admin/ReservasAdminPage'
import { SeatMapPage } from './pages/admin/SeatMapPage'
import { UsuariosAdminPage } from './pages/admin/UsuariosAdminPage'
import { MetricsPage } from './pages/admin/MetricsPage'
import { SettingsAdminPage } from './pages/admin/SettingsAdminPage'
import { GalleryAdminPage } from './pages/admin/GalleryAdminPage'
import { LandingContentAdminPage } from './pages/admin/LandingContentAdminPage'

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* La landing pública es la vista principal al desplegar. */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/contacto" element={<ContactPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="tours" replace />} />
              <Route path="tours" element={<ToursAdminPage />} />
              <Route path="galeria" element={<GalleryAdminPage />} />
              <Route path="sitio-web" element={<LandingContentAdminPage />} />
              <Route path="buses" element={<BusesAdminPage />} />
              <Route path="viajes" element={<ViajesAdminPage />} />
              <Route path="reservas" element={<ReservasAdminPage />} />
              <Route path="asientos" element={<SeatMapPage />} />
              <Route path="usuarios" element={<UsuariosAdminPage />} />
              <Route path="metricas" element={<MetricsPage />} />
              <Route path="configuracion" element={<SettingsAdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
