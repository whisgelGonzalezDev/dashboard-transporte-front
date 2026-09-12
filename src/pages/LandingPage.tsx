import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { TourDTO } from '../types'
import { TourCard } from '../components/tours/TourCard'
import { TourBookingModal } from '../components/tours/TourBookingModal'
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

  const [selectedTour, setSelectedTour] = useState<TourDTO | null>(null)

  return (
    <div className="flex-1 bg-navy-50">
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <img
            src="/logo-corazon-aventurero.png"
            alt="Corazón Aventurero"
            className="h-12 w-auto rounded-lg"
          />
          <Link
            to="/login"
            className="text-sm font-medium text-navy-400 hover:text-gold-600"
          >
            Acceso administrativo
          </Link>
        </div>
      </header>

      <section
        className="relative overflow-hidden px-6 py-20 text-white"
        style={{
          background:
            'radial-gradient(1200px 700px at 78% -8%, rgba(34,51,90,.55), transparent 60%), radial-gradient(900px 600px at 8% 108%, rgba(210,42,56,.2), transparent 55%), #0E1730',
        }}
      >
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-label text-xs font-bold uppercase tracking-[0.4em] text-gold-400">
            Aventura sin límites
          </p>
          <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">
            Vive la aventura que estabas <span className="text-gold-400">buscando</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-ivory/80">
            Explora nuestros tours activos: naturaleza, playa y cultura en un solo lugar.
            Cupos limitados, guías locales y transporte incluido.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-navy-900">Tours activos</h2>
          {tours && tours.length > 0 && (
            <span className="text-sm text-navy-400">{tours.length} disponibles</span>
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
              <TourCard key={tour.id} tour={tour} onClick={() => setSelectedTour(tour)} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-navy-100 bg-white px-6 py-6 text-center text-xs text-navy-400">
        © {new Date().getFullYear()} Corazón Aventurero. Todos los derechos reservados.
      </footer>

      {selectedTour && (
        <TourBookingModal tour={selectedTour} onClose={() => setSelectedTour(null)} />
      )}
    </div>
  )
}
