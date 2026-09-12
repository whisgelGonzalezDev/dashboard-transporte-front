import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { PublicConfiguracionDTO } from '../types'
import { PublicLayout } from '../components/layout/PublicLayout'
import { ErrorState, LoadingState } from '../components/ui/States'
import { useSeo } from '../hooks/useSeo'

export function ContactPage() {
  const { data: config, isLoading, isError, refetch } = useQuery({
    queryKey: ['configuracion', 'publica'],
    queryFn: () => api.get<PublicConfiguracionDTO>('/configuracion/publica'),
  })

  useSeo({
    title: `Contacto para eventos · ${config?.nombreNegocio ?? 'Corazón Aventurero'}`,
    description: config?.seoDescripcion,
    keywords: config?.seoPalabrasClave,
  })

  const hasContact =
    config && (config.contactoEventosNombre || config.contactoEventosEmail || config.contactoEventosTelefono)

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-ivory">
          Contacto para eventos
        </h1>
        <p className="mt-2 text-navy-500 dark:text-navy-400">
          ¿Organizas un evento y quieres contar con nosotros? Escríbenos directamente.
        </p>

        {isLoading && <LoadingState label="Cargando…" />}
        {isError && (
          <ErrorState message="No pudimos cargar esta información." onRetry={() => refetch()} />
        )}

        {config && !hasContact && (
          <p className="mt-6 text-navy-600 dark:text-navy-300">Aún no se ha configurado esta sección.</p>
        )}

        {hasContact && (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
            {config.contactoEventosNombre && (
              <p className="text-lg font-semibold text-navy-900 dark:text-ivory">
                {config.contactoEventosNombre}
              </p>
            )}
            {config.contactoEventosEmail && (
              <a
                href={`mailto:${config.contactoEventosEmail}`}
                className="text-gold-600 hover:underline dark:text-gold-400"
              >
                {config.contactoEventosEmail}
              </a>
            )}
            {config.contactoEventosTelefono && (
              <a
                href={`tel:${config.contactoEventosTelefono}`}
                className="text-gold-600 hover:underline dark:text-gold-400"
              >
                {config.contactoEventosTelefono}
              </a>
            )}
          </div>
        )}
      </section>
    </PublicLayout>
  )
}
