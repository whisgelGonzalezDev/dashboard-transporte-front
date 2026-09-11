import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'
import type { ConfiguracionDTO, UpdateConfiguracionDto } from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Field, inputClass } from '../../components/ui/Field'
import { ErrorState, LoadingState } from '../../components/ui/States'

interface FormState {
  nombreNegocio: string
  moneda: string
  emailContacto: string
  telefonoContacto: string
  porcentajeAbonoMinimo: string
}

function toFormState(config: ConfiguracionDTO): FormState {
  return {
    nombreNegocio: config.nombreNegocio,
    moneda: config.moneda,
    emailContacto: config.emailContacto ?? '',
    telefonoContacto: config.telefonoContacto ?? '',
    porcentajeAbonoMinimo:
      config.porcentajeAbonoMinimo !== null ? String(config.porcentajeAbonoMinimo) : '',
  }
}

export function SettingsAdminPage() {
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
      nombreNegocio: form.nombreNegocio.trim(),
      moneda: form.moneda.trim().toUpperCase(),
      emailContacto: form.emailContacto.trim() || null,
      telefonoContacto: form.telefonoContacto.trim() || null,
      porcentajeAbonoMinimo:
        form.porcentajeAbonoMinimo.trim() === '' ? null : Number(form.porcentajeAbonoMinimo),
    })
  }

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Ajustes generales del negocio usados por el panel."
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="No se pudo cargar la configuración." onRetry={() => refetch()} />}

      {form && (
        <form
          className="flex max-w-lg flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6"
          onSubmit={handleSubmit}
        >
          <Field label="Nombre del negocio">
            <input
              className={inputClass}
              value={form.nombreNegocio}
              onChange={(e) => setForm({ ...form, nombreNegocio: e.target.value })}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Moneda (código de 3 letras)">
              <input
                className={inputClass}
                value={form.moneda}
                onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                maxLength={3}
                required
              />
            </Field>
            <Field label="% mínimo de abono">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                className={inputClass}
                value={form.porcentajeAbonoMinimo}
                onChange={(e) => setForm({ ...form, porcentajeAbonoMinimo: e.target.value })}
                placeholder="Sin mínimo"
              />
            </Field>
          </div>
          <Field label="Email de contacto">
            <input
              type="email"
              className={inputClass}
              value={form.emailContacto}
              onChange={(e) => setForm({ ...form, emailContacto: e.target.value })}
            />
          </Field>
          <Field label="Teléfono de contacto">
            <input
              className={inputClass}
              value={form.telefonoContacto}
              onChange={(e) => setForm({ ...form, telefonoContacto: e.target.value })}
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-jungle-600">Guardado correctamente.</p>}

          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
