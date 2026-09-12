import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { MetricasDTO } from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, LoadingState } from '../../components/ui/States'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function StatCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'positive' | 'warning' }) {
  const toneClass =
    tone === 'positive'
      ? 'text-green-700 dark:text-green-400'
      : tone === 'warning'
        ? 'text-gold-700 dark:text-gold-400'
        : 'text-navy-900 dark:text-ivory'
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 dark:border-white/10 dark:bg-navy-900">
      <p className="font-label text-xs font-semibold uppercase tracking-wide text-navy-400">{label}</p>
      <p className={`font-label mt-2 text-2xl font-extrabold ${toneClass}`}>{value}</p>
    </div>
  )
}

export function MetricsPage() {
  const { data: metricas, isLoading, isError, refetch } = useQuery({
    queryKey: ['metricas'],
    queryFn: () => api.get<MetricasDTO>('/metricas'),
  })

  return (
    <div>
      <PageHeader title="Métricas" description="Un vistazo rápido a la operación." />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="No se pudieron cargar las métricas." onRetry={() => refetch()} />}

      {metricas && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Ingresos totales" value={currencyFormatter.format(metricas.ingresosTotales)} tone="positive" />
            <StatCard label="Saldo pendiente" value={currencyFormatter.format(metricas.saldoPendienteTotal)} tone="warning" />
            <StatCard label="Ocupación promedio" value={`${metricas.ocupacionPromedio}%`} />
            <StatCard label="Reservas totales" value={String(metricas.reservasTotales)} />
            <StatCard label="Pasajeros totales" value={String(metricas.pasajerosTotales)} />
            <StatCard label="Tours activos" value={`${metricas.toursActivos} / ${metricas.toursTotales}`} />
            <StatCard label="Viajes programados" value={`${metricas.viajesProgramados} / ${metricas.viajesTotales}`} />
          </div>

          <div>
            <h3 className="mb-3 font-display text-lg font-semibold text-navy-900 dark:text-ivory">Tours más reservados</h3>
            {metricas.topTours.length === 0 ? (
              <p className="text-sm text-navy-400">Todavía no hay reservas para mostrar un ranking.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-navy-100 bg-white dark:border-white/10 dark:bg-navy-900">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-navy-100 bg-navy-50 text-xs font-semibold uppercase text-navy-400 dark:border-white/10 dark:bg-white/5">
                      <th className="px-4 py-3">Tour</th>
                      <th className="px-4 py-3">Reservas</th>
                      <th className="px-4 py-3">Pasajeros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricas.topTours.map((t) => (
                      <tr key={t.tourId} className="border-b border-navy-50 last:border-0 dark:border-white/5">
                        <td className="px-4 py-3 font-medium text-navy-900 dark:text-ivory">{t.titulo}</td>
                        <td className="px-4 py-3 text-navy-600 dark:text-navy-300">{t.reservas}</td>
                        <td className="px-4 py-3 text-navy-600 dark:text-navy-300">{t.pasajeros}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
