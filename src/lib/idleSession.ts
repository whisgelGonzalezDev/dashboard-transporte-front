const LAST_ACTIVITY_KEY = 'ca_last_activity'

/** Tiempo de inactividad tras el cual se cierra la sesión del dashboard. */
export const IDLE_LIMIT_MS = 60 * 60 * 1000

export function markActivity() {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
  } catch {
    // localStorage no disponible — el timeout de inactividad no podrá aplicarse.
  }
}

export function getIdleMs(): number {
  try {
    const last = localStorage.getItem(LAST_ACTIVITY_KEY)
    if (!last) return 0
    return Date.now() - Number(last)
  } catch {
    return 0
  }
}

export function clearActivity() {
  try {
    localStorage.removeItem(LAST_ACTIVITY_KEY)
  } catch {
    // no-op
  }
}
