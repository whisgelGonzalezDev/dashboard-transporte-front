import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { PublicConfiguracionDTO } from '../types'
import { PublicLayout } from '../components/layout/PublicLayout'
import { ErrorState, LoadingState } from '../components/ui/States'
import { useSeo } from '../hooks/useSeo'

export function TermsPage() {
  const { data: config, isLoading, isError, refetch } = useQuery({
    queryKey: ['configuracion', 'publica'],
    queryFn: () => api.get<PublicConfiguracionDTO>('/configuracion/publica'),
  })

  useSeo({
    title: `Términos y condiciones · ${config?.nombreNegocio ?? 'Corazón Aventurero'}`,
    description: config?.seoDescripcion,
    keywords: config?.seoPalabrasClave,
  })

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-ivory">
          Términos y condiciones
        </h1>

        {isLoading && <LoadingState label="Cargando…" />}
        {isError && (
          <ErrorState message="No pudimos cargar esta información." onRetry={() => refetch()} />
        )}

        {config && (
          <p className="mt-6 whitespace-pre-line text-navy-600 dark:text-navy-300">
            {config.terminosCondiciones || 'Aún no se ha configurado esta sección.'}
          </p>
        )}
      </section>
    </PublicLayout>
  )
}
