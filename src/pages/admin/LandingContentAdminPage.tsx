import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'
import type { ConfiguracionDTO, UpdateConfiguracionDto } from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Field, inputClass } from '../../components/ui/Field'
import { ErrorState, LoadingState } from '../../components/ui/States'

interface FormState {
  sobreNosotros: string
  terminosCondiciones: string
  contactoEventosNombre: string
  contactoEventosEmail: string
  contactoEventosTelefono: string
  seoTitulo: string
  seoDescripcion: string
  seoPalabrasClave: string
}

function toFormState(config: ConfiguracionDTO): FormState {
  return {
    sobreNosotros: config.sobreNosotros ?? '',
    terminosCondiciones: config.terminosCondiciones ?? '',
    contactoEventosNombre: config.contactoEventosNombre ?? '',
    contactoEventosEmail: config.contactoEventosEmail ?? '',
    contactoEventosTelefono: config.contactoEventosTelefono ?? '',
    seoTitulo: config.seoTitulo ?? '',
    seoDescripcion: config.seoDescripcion ?? '',
    seoPalabrasClave: config.seoPalabrasClave ?? '',
  }
}

export function LandingContentAdminPage() {
  const queryClient = useQueryClient()
  const { data: config, isLoading, isError, refetch } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => api.get<ConfiguracionDTO>('/configuracion'),
  })

  const [form, setForm] = useState<FormState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (config && !form) setForm(toFormState(config))
  }, [config, form])

  const update = useMutation({
    mutationFn: (dto: UpdateConfiguracionDto) => api.put<ConfiguracionDTO>('/configuracion', dto),
    onSuccess: (data) => {
      queryClient.setQueryData(['configuracion'], data)
      setForm(toFormState(data))
      setSuccess(true)
      setError(null)
      setTimeout(() => setSuccess(false), 2500)
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudo guardar.'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setError(null)

    update.mutate({
      sobreNosotros: form.sobreNosotros.trim() || null,
      terminosCondiciones: form.terminosCondiciones.trim() || null,
      contactoEventosNombre: form.contactoEventosNombre.trim() || null,
      contactoEventosEmail: form.contactoEventosEmail.trim() || null,
      contactoEventosTelefono: form.contactoEventosTelefono.trim() || null,
      seoTitulo: form.seoTitulo.trim() || null,
      seoDescripcion: form.seoDescripcion.trim() || null,
      seoPalabrasClave: form.seoPalabrasClave.trim() || null,
    })
  }

  return (
    <div>
      <PageHeader
        title="Sitio web"
        description="Contenido de la landing pública: información de la empresa, términos y condiciones, contacto para eventos, y SEO."
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="No se pudo cargar el contenido." onRetry={() => refetch()} />}

      {form && (
        <form
          className="flex max-w-2xl flex-col gap-8 rounded-2xl border border-navy-100 bg-white p-6 dark:border-white/10 dark:bg-navy-900"
          onSubmit={handleSubmit}
        >
          <fieldset className="flex flex-col gap-4">
            <legend className="font-display text-lg font-semibold text-navy-900 dark:text-ivory">
              Información de la empresa
            </legend>
            <Field label="Sobre nosotros">
              <textarea
                className={inputClass}
                rows={5}
                value={form.sobreNosotros}
                onChange={(e) => setForm({ ...form, sobreNosotros: e.target.value })}
                placeholder="Cuéntale a tus visitantes quiénes son y qué los hace diferentes."
              />
            </Field>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="font-display text-lg font-semibold text-navy-900 dark:text-ivory">
              Términos y condiciones
            </legend>
            <Field label="Contenido">
              <textarea
                className={inputClass}
                rows={10}
                value={form.terminosCondiciones}
                onChange={(e) => setForm({ ...form, terminosCondiciones: e.target.value })}
                placeholder="Políticas de reserva, cancelación, uso del sitio, etc."
              />
            </Field>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="font-display text-lg font-semibold text-navy-900 dark:text-ivory">
              Contacto para eventos
            </legend>
            <Field label="Nombre de contacto">
              <input
                className={inputClass}
                value={form.contactoEventosNombre}
                onChange={(e) => setForm({ ...form, contactoEventosNombre: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email">
                <input
                  type="email"
                  className={inputClass}
                  value={form.contactoEventosEmail}
                  onChange={(e) => setForm({ ...form, contactoEventosEmail: e.target.value })}
                />
              </Field>
              <Field label="Teléfono">
                <input
                  className={inputClass}
                  value={form.contactoEventosTelefono}
                  onChange={(e) => setForm({ ...form, contactoEventosTelefono: e.target.value })}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="font-display text-lg font-semibold text-navy-900 dark:text-ivory">SEO</legend>
            <Field label="Título (recomendado hasta ~60 caracteres)">
              <input
                className={inputClass}
                maxLength={70}
                value={form.seoTitulo}
                onChange={(e) => setForm({ ...form, seoTitulo: e.target.value })}
              />
            </Field>
            <Field label="Descripción (recomendado hasta ~155 caracteres)">
              <textarea
                className={inputClass}
                rows={3}
                maxLength={200}
                value={form.seoDescripcion}
                onChange={(e) => setForm({ ...form, seoDescripcion: e.target.value })}
              />
            </Field>
            <Field label="Palabras clave (separadas por coma)">
              <input
                className={inputClass}
                maxLength={300}
                value={form.seoPalabrasClave}
                onChange={(e) => setForm({ ...form, seoPalabrasClave: e.target.value })}
                placeholder="tours, aventura, playa, naturaleza"
              />
            </Field>
          </fieldset>

          {error && <p className="text-sm text-crimson-600 dark:text-crimson-400">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">Guardado correctamente.</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
