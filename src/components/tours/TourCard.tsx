import type { TourDTO } from '../../types'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export function TourCard({ tour, onClick }: { tour: TourDTO; onClick?: () => void }) {
  return (
    <article
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick()
      }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adventure-500 cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        <img
          src={tour.imagenUrl}
          alt={tour.titulo}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-adventure-700 shadow">
          {currencyFormatter.format(tour.precio)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-semibold text-ink-900">{tour.titulo}</h3>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-ink-500">
          {tour.descripcion}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-jungle-700">
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-jungle-500" />
            Disponible ahora
          </span>
          <span className="font-semibold text-adventure-600 group-hover:underline">
            Reservar →
          </span>
        </div>
      </div>
    </article>
  )
}
