interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-300 border-t-adventure-500" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 py-12 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold text-red-700 underline">
          Reintentar
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-ink-200 py-16 text-center text-sm text-ink-400">
      {message}
    </div>
  )
}
