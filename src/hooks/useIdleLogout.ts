import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { IDLE_LIMIT_MS, clearActivity, getIdleMs, markActivity } from '../lib/idleSession'

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const
const CHECK_INTERVAL_MS = 30_000

/** Cierra la sesión del dashboard tras 1h sin actividad del usuario. */
export function useIdleLogout() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) return

    markActivity()

    function forceLogout() {
      clearActivity()
      logout()
      navigate('/login', { replace: true })
    }

    function handleActivity() {
      if (getIdleMs() >= IDLE_LIMIT_MS) {
        forceLogout()
        return
      }
      markActivity()
    }

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true })
    }

    const interval = window.setInterval(() => {
      if (getIdleMs() >= IDLE_LIMIT_MS) forceLogout()
    }, CHECK_INTERVAL_MS)

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity)
      }
      window.clearInterval(interval)
    }
  }, [isAuthenticated, logout, navigate])
}
