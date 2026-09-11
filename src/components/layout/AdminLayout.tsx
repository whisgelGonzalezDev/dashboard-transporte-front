import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/admin/tours', label: 'Tours', icon: '🏝️' },
  { to: '/admin/buses', label: 'Buses', icon: '🚌' },
  { to: '/admin/viajes', label: 'Viajes', icon: '🗺️' },
  { to: '/admin/pasajeros', label: 'Pasajeros', icon: '🧑‍🤝‍🧑' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: '🔐' },
]

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-ink-100 bg-white">
        <div className="flex items-center gap-2 px-6 py-5">
          <span className="text-2xl">🌋</span>
          <div>
            <p className="font-display text-sm font-semibold text-ink-900">Corazón Aventurero</p>
            <p className="text-xs text-ink-400">Panel administrativo</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-adventure-50 text-adventure-700'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                }`
              }
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-100 p-3">
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-jungle-700 hover:bg-jungle-50"
          >
            <span aria-hidden>↩️</span>
            Ver landing pública
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
