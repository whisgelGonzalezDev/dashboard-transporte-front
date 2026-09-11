import type { RolUsuario } from '../types'

const TOKEN_KEY = 'ca_dashboard_token'
const USER_KEY = 'ca_dashboard_user'

export interface StoredUser {
  id: string
  nombre: string
  email: string
  rol: RolUsuario
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as StoredUser) : null
  } catch {
    return null
  }
}

export function setSession(token: string, usuario: StoredUser) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(usuario))
  } catch {
    // localStorage no disponible (modo privado, etc.) — la sesión no persiste entre recargas.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    // no-op
  }
}
