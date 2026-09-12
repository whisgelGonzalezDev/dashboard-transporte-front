import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { RolUsuario } from '../../types'
import { ThemeToggle } from '../ui/ThemeToggle'

const NAV_ITEMS = [
  { to: '/admin/tours', label: 'Tours', icon: '🏝️' },
  { to: '/admin/viajes', label: 'Viajes', icon: '🗺️' },
  { to: '/admin/buses', label: 'Buses', icon: '🚌' },
  { to: '/admin/reservas', label: 'Reservas', icon: '🧾' },
  { to: '/admin/asientos', label: 'Asientos', icon: '💺' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: '🔐', adminOnly: true },
  { to: '/admin/metricas', label: 'Métricas', icon: '📊' },
  { to: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
]

const ROL_LABEL: Record<RolUsuario, string> = {
  [RolUsuario.ADMIN]: 'Administrador',
  [RolUsuario.OPERADOR]: 'Operador',
  [RolUsuario.PASAJERO]: 'Pasajero',
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user?.rol === RolUsuario.ADMIN)

  return (
    <div className="flex min-h-screen bg-navy-50 dark:bg-navy-950">
      <aside className="flex w-64 shrink-0 flex-col bg-navy-900">
        <div className="flex items-center gap-3 px-5 py-5">
          <img
            src="/logo-corazon-aventurero.png"
            alt="Corazón Aventurero"
            className="h-11 w-auto rounded-md"
          />
          <p className="text-xs font-medium text-navy-300">Panel administrativo</p>
          <ThemeToggle className="ml-auto text-navy-300 hover:bg-white/5 hover:text-ivory" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400'
                    : 'text-navy-300 hover:bg-white/5 hover:text-ivory'
                }`
              }
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          {user && (
            <div className="mb-1 px-3 py-2">
              <p className="truncate text-sm font-medium text-ivory">{user.nombre}</p>
              <p className="text-xs text-navy-400">{ROL_LABEL[user.rol]}</p>
            </div>
          )}
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gold-400 hover:bg-white/5"
          >
            <span aria-hidden>↩️</span>
            Ver landing pública
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-navy-300 hover:bg-white/5 hover:text-crimson-400"
          >
            <span aria-hidden>🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
