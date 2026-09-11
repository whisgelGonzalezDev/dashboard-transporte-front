import { useState } from 'react'
import { createResourceHooks } from '../../hooks/useResource'
import {
  EstadoCuenta,
  type PasajeroDTO,
  type RegisterPasajeroDto,
  type ViajeDTO,
} from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import { Field, inputClass } from '../../components/ui/Field'

const pasajeroHooks = createResourceHooks<PasajeroDTO, RegisterPasajeroDto, never>('pasajeros')
const viajeHooks = createResourceHooks<ViajeDTO, never, never>('viajes')

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const ESTADO_LABEL: Record<EstadoCuenta, string> = {
  [EstadoCuenta.PENDIENTE]: 'Pendiente',
  [EstadoCuenta.PARCIAL]: 'Parcial',
  [EstadoCuenta.PAGADO]: 'Pagado',
}

const ESTADO_BADGE: Record<EstadoCuenta, string> = {
  [EstadoCuenta.PENDIENTE]: 'bg-red-100 text-red-700',
  [EstadoCuenta.PARCIAL]: 'bg-adventure-100 text-adventure-700',
  [EstadoCuenta.PAGADO]: 'bg-jungle-100 text-jungle-700',
}

interface FormState {
  nombre: string
  email: string
  telefono: string
  documento: string
  viajeId: string
  abonoInicial: string
}

const EMPTY_FORM: FormState = {
  nombre: '',
  email: '',
  telefono: '',
  documento: '',
  viajeId: '',
  abonoInicial: '',
}

export function PasajerosAdminPage() {
  const { data: pasajeros, isLoading, isError, refetch } = pasajeroHooks.useList()
  const { data: viajes } = viajeHooks.useList()
  const registerPasajero = pasajeroHooks.useCreate()
  const removePasajero = pasajeroHooks.useRemove()
  const abonar = pasajeroHooks.usePatch()

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<PasajeroDTO | null>(null)
  const [abonando, setAbonando] = useState<PasajeroDTO | null>(null)
  const [monto, setMonto] = useState('')

  const viajeLabel = (viajeId: string) => {
    const v = viajes?.find((viaje) => viaje.id === viajeId)
    return v ? `${v.rutaOrigen} → ${v.rutaDestino}` : viajeId
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    registerPasajero
      .mutateAsync({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        documento: form.documento.trim(),
        viajeId: form.viajeId,
        abonoInicial: form.abonoInicial ? Number(form.abonoInicial) : undefined,
      })
      .then(() => setFormOpen(false))
      .catch((err: Error) => setFormError(err.message ?? 'Ocurrió un error al registrar el pasajero.'))
  }

  function handleAbonar(e: React.FormEvent) {
    e.preventDefault()
    if (!abonando) return
    abonar.mutate(
      { id: abonando.id, action: 'abonar', body: { monto: Number(monto) } },
      { onSuccess: () => setAbonando(null) },
    )
  }

  const columns: Column<PasajeroDTO>[] = [
    { header: 'Nombre', render: (p) => <span className="font-medium text-ink-900">{p.nombre}</span> },
    { header: 'Contacto', render: (p) => <span className="text-ink-500">{p.email}</span> },
    { header: 'Viaje', render: (p) => viajeLabel(p.viajeId) },
    { header: 'Saldo', render: (p) => currencyFormatter.format(p.saldo) },
    {
      header: 'Cuenta',
      render: (p) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ESTADO_BADGE[p.estadoCuenta]}`}>
          {ESTADO_LABEL[p.estadoCuenta]}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Pasajeros"
        description="Personas registradas en los viajes y su estado de cuenta."
        action={
          <Button onClick={openCreate} disabled={!viajes || viajes.length === 0}>
            + Registrar pasajero
          </Button>
        }
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="No se pudieron cargar los pasajeros." onRetry={() => refetch()} />}
      {!isLoading && !isError && pasajeros && pasajeros.length === 0 && (
        <EmptyState message="Aún no hay pasajeros registrados." />
      )}
      {!isLoading && !isError && pasajeros && pasajeros.length > 0 && (
        <DataTable
          rows={pasajeros}
          getRowKey={(p) => p.id}
          columns={columns}
          actions={(p) => (
            <>
              {p.estadoCuenta !== EstadoCuenta.PAGADO && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAbonando(p)
                    setMonto('')
                  }}
                >
                  Abonar
                </Button>
              )}
              <Button variant="danger" onClick={() => setDeleting(p)}>
                Eliminar
              </Button>
            </>
          )}
        />
      )}

      <Modal open={formOpen} title="Registrar pasajero" onClose={() => setFormOpen(false)}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field label="Viaje">
            <select
              className={inputClass}
              value={form.viajeId}
              onChange={(e) => setForm({ ...form, viajeId: e.target.value })}
              required
            >
              <option value="" disabled>
                Selecciona un viaje…
              </option>
              {viajes?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.rutaOrigen} → {v.rutaDestino} · {v.fechaSalida?.slice(0, 10)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre completo">
            <input
              className={inputClass}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Field>
            <Field label="Teléfono">
              <input
                className={inputClass}
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                required
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Documento">
              <input
                className={inputClass}
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
                required
              />
            </Field>
            <Field label="Abono inicial (opcional)">
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.abonoInicial}
                onChange={(e) => setForm({ ...form, abonoInicial: e.target.value })}
              />
            </Field>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={registerPasajero.isPending}>
              {registerPasajero.isPending ? 'Guardando…' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!abonando} title="Registrar abono" onClose={() => setAbonando(null)}>
        <form className="flex flex-col gap-4" onSubmit={handleAbonar}>
          <p className="text-sm text-ink-500">
            Saldo pendiente de <strong>{abonando?.nombre}</strong>:{' '}
            {abonando && currencyFormatter.format(abonando.saldo)}
          </p>
          <Field label="Monto a abonar (USD)">
            <input
              type="number"
              min="0.01"
              step="0.01"
              className={inputClass}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setAbonando(null)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={abonar.isPending}>
              {abonar.isPending ? 'Guardando…' : 'Abonar'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar pasajero"
        message={`¿Seguro que quieres eliminar a "${deleting?.nombre}"?`}
        pending={removePasajero.isPending}
        onConfirm={() =>
          deleting && removePasajero.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
