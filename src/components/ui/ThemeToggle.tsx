import { useTheme } from '../../lib/ThemeContext'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-base transition-colors ${className}`}
    >
      <span aria-hidden>{isDark ? '☀️' : '🌙'}</span>
    </button>
  )
}
