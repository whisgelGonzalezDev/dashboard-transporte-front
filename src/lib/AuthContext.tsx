import { createContext, useContext, useState, type ReactNode } from 'react'
import { api, ApiError } from './api'
import { clearSession, getStoredUser, getToken, setSession, type StoredUser } from './auth'
import { clearActivity } from './idleSession'

interface LoginResponse {
  accessToken: string
  expiresIn: number
  usuario: StoredUser
}

interface AuthContextValue {
  user: StoredUser | null
  isAuthenticated: boolean
  isLoggingIn: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() =>
    getToken() ? getStoredUser() : null,
  )
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  async function login(email: string, password: string) {
    setIsLoggingIn(true)
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password })
      setSession(response.accessToken, response.usuario)
      setUser(response.usuario)
    } catch (err) {
      if (err instanceof ApiError) throw err
      throw new Error('No se pudo iniciar sesión. Intenta de nuevo.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  function logout() {
    clearSession()
    clearActivity()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoggingIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
