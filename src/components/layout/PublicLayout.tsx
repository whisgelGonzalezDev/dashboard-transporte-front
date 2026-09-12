import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../ui/ThemeToggle'

interface PublicLayoutProps {
  children: ReactNode
}

/** Chrome compartido (header + footer) por todas las páginas públicas de la landing. */
export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex-1 bg-navy-50 dark:bg-navy-950">
      <header className="border-b border-navy-100 bg-white dark:border-white/10 dark:bg-navy-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/">
            <img
              src={`${import.meta.env.BASE_URL}logo-corazon-aventurero.png`}
              alt="Corazón Aventurero"
              className="h-12 w-auto rounded-lg"
            />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-navy-400 hover:text-gold-600 dark:text-navy-300 dark:hover:text-gold-400"
            >
              Acceso administrativo
            </Link>
            <ThemeToggle className="text-navy-500 hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-white/10" />
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-navy-100 bg-white px-6 py-6 dark:border-white/10 dark:bg-navy-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center text-xs text-navy-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Corazón Aventurero. Todos los derechos reservados.</p>
          <nav className="flex flex-wrap justify-center gap-4">
            <Link to="/nosotros" className="hover:text-gold-600 dark:hover:text-gold-400">
              Sobre nosotros
            </Link>
            <Link to="/terminos" className="hover:text-gold-600 dark:hover:text-gold-400">
              Términos y condiciones
            </Link>
            <Link to="/contacto" className="hover:text-gold-600 dark:hover:text-gold-400">
              Contacto para eventos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
