import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { Button } from '../components/ui/Button'
import { Field, inputClass } from '../components/ui/Field'

export function LoginPage() {
  const { isAuthenticated, isLoggingIn, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/admin/tours'
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/admin/tours', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-navy-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="text-3xl">🌋</span>
          <h1 className="font-display text-xl font-semibold text-navy-900">
            Corazón Aventurero
          </h1>
          <p className="text-sm text-navy-400">Acceso al panel administrativo</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </Field>
          <Field label="Contraseña">
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && <p className="text-sm text-crimson-600">{error}</p>}

          <Button type="submit" disabled={isLoggingIn} className="mt-2 w-full">
            {isLoggingIn ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
