import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { TourDTO } from '../types'
import { TourCard } from '../components/tours/TourCard'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'

export function LandingPage() {
  const {
    data: tours,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['tours', 'active'],
    queryFn: () => api.get<TourDTO[]>('/tours/active'),
  })

  return (
    <div className="flex-1 bg-ink-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌋</span>
            <span className="font-display text-lg font-semibold text-ink-900">
              Corazón Aventurero
            </span>
          </div>
          <Link
            to="/login"
            className="text-sm font-medium text-ink-400 hover:text-adventure-600"
          >
            Acceso administrativo
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-adventure-500 via-adventure-600 to-jungle-700 px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Vive la aventura que estabas buscando
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-adventure-50/90">
            Explora nuestros tours activos: naturaleza, playa y cultura en un solo lugar.
            Cupos limitados, guías locales y transporte incluido.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Tours activos</h2>
          {tours && tours.length > 0 && (
            <span className="text-sm text-ink-400">{tours.length} disponibles</span>
          )}
        </div>

        {isLoading && <LoadingState label="Buscando aventuras…" />}

        {isError && (
          <ErrorState
            message="No pudimos cargar los tours en este momento."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && tours && tours.length === 0 && (
          <EmptyState message="Todavía no hay tours activos. Vuelve pronto." />
        )}

        {!isLoading && !isError && tours && tours.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-ink-100 bg-white px-6 py-6 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} Corazón Aventurero. Todos los derechos reservados.
      </footer>
    </div>
  )
}
