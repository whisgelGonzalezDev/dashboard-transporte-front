interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-navy-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy-300 border-t-gold-500" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-crimson-200 bg-crimson-50 py-12 text-center">
      <p className="text-sm font-medium text-crimson-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold text-crimson-700 underline">
          Reintentar
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-navy-200 py-16 text-center text-sm text-navy-400">
      {message}
    </div>
  )
}
