import { useState } from 'react'
import { createResourceHooks } from '../../hooks/useResource'
import {
  EstadoViaje,
  type BusDTO,
  type CreateViajeDto,
  type TourDTO,
  type UpdateViajeDto,
  type ViajeDTO,
} from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import { Field, inputClass } from '../../components/ui/Field'

const viajeHooks = createResourceHooks<ViajeDTO, CreateViajeDto, UpdateViajeDto>('viajes')
const busHooks = createResourceHooks<BusDTO, never, never>('buses')
const tourHooks = createResourceHooks<TourDTO, never, never>('tours')

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const ESTADO_LABEL: Record<EstadoViaje, string> = {
  [EstadoViaje.PROGRAMADO]: 'Programado',
  [EstadoViaje.EN_CURSO]: 'En curso',
  [EstadoViaje.COMPLETADO]: 'Completado',
  [EstadoViaje.CANCELADO]: 'Cancelado',
}

const ESTADO_BADGE: Record<EstadoViaje, string> = {
  [EstadoViaje.PROGRAMADO]: 'bg-gold-100 text-gold-700',
  [EstadoViaje.EN_CURSO]: 'bg-green-100 text-green-700',
  [EstadoViaje.COMPLETADO]: 'bg-navy-100 text-navy-500',
  [EstadoViaje.CANCELADO]: 'bg-crimson-100 text-crimson-700',
}

interface FormState {
  busId: string
  tourId: string
  rutaOrigen: string
  rutaDestino: string
  fechaSalida: string
  horaSalida: string
  horaLlegada: string
  precio: string
  asientosDisponibles: string
  descripcion: string
}

const EMPTY_FORM: FormState = {
  busId: '',
  tourId: '',
  rutaOrigen: '',
  rutaDestino: '',
  fechaSalida: '',
  horaSalida: '',
  horaLlegada: '',
  precio: '',
  asientosDisponibles: '',
  descripcion: '',
}

function toFormState(viaje: ViajeDTO): FormState {
  return {
    busId: viaje.busId,
    tourId: viaje.tourId ?? '',
    rutaOrigen: viaje.rutaOrigen,
    rutaDestino: viaje.rutaDestino,
    fechaSalida: viaje.fechaSalida?.slice(0, 10) ?? '',
    horaSalida: viaje.horaSalida,
    horaLlegada: viaje.horaLlegada,
    precio: String(viaje.precio),
    asientosDisponibles: String(viaje.asientosDisponibles),
    descripcion: viaje.descripcion ?? '',
  }
}

export function ViajesAdminPage() {
  const { data: viajes, isLoading, isError, refetch } = viajeHooks.useList()
  const { data: buses } = busHooks.useList()
  const { data: tours } = tourHooks.useList()
  const createViaje = viajeHooks.useCreate()
  const updateViaje = viajeHooks.useUpdate()
  const removeViaje = viajeHooks.useRemove()
  const cancelViaje = viajeHooks.usePatch()

  const [editing, setEditing] = useState<ViajeDTO | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [deleting, setDeleting] = useState<ViajeDTO | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(viaje: ViajeDTO) {
    setEditing(viaje)
    setForm(toFormState(viaje))
    setFormError(null)
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const precio = Number(form.precio)
    if (Number.isNaN(precio) || precio <= 0) {
      setFormError('El precio debe ser mayor a 0.')
      return
    }

    const base = {
      rutaOrigen: form.rutaOrigen.trim(),
      rutaDestino: form.rutaDestino.trim(),
      fechaSalida: form.fechaSalida,
      horaSalida: form.horaSalida,
      horaLlegada: form.horaLlegada,
      precio,
      descripcion: form.descripcion.trim() || null,
    }

    const mutation = editing
      ? updateViaje.mutateAsync({
          id: editing.id,
          dto: {
            ...base,
            busId: form.busId,
            asientosDisponibles: form.asientosDisponibles
              ? Number(form.asientosDisponibles)
              : undefined,
          },
        })
      : createViaje.mutateAsync({
          ...base,
          busId: form.busId,
          tourId: form.tourId || null,
          asientosDisponibles: form.asientosDisponibles
            ? Number(form.asientosDisponibles)
            : undefined,
        })

    mutation
      .then(() => setFormOpen(false))
      .catch((err: Error) => setFormError(err.message ?? 'Ocurrió un error al guardar el viaje.'))
  }

  const columns: Column<ViajeDTO>[] = [
    {
      header: 'Ruta',
      render: (v) => (
        <span className="font-medium text-navy-900">
          {v.rutaOrigen} → {v.rutaDestino}
        </span>
      ),
    },
    {
      header: 'Bus',
      render: (v) => (
        <span className="text-navy-600">{buses?.find((b) => b.id === v.busId)?.placa ?? '—'}</span>
      ),
    },
    {
      header: 'Tour',
      render: (v) =>
        v.tourId ? (
          <span className="text-gold-700">
            {tours?.find((t) => t.id === v.tourId)?.titulo ?? '—'}
          </span>
        ) : (
          <span className="text-navy-300">—</span>
        ),
    },
    { header: 'Salida', render: (v) => `${v.fechaSalida?.slice(0, 10)} · ${v.horaSalida}` },
    { header: 'Precio', render: (v) => currencyFormatter.format(v.precio) },
    { header: 'Asientos', render: (v) => v.asientosDisponibles },
    {
      header: 'Estado',
      render: (v) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ESTADO_BADGE[v.estado]}`}>
          {ESTADO_LABEL[v.estado]}
        </span>
      ),
    },
  ]

  const pending = createViaje.isPending || updateViaje.isPending

  return (
    <div>
      <PageHeader
        title="Viajes"
        description="Rutas programadas, precio y disponibilidad de asientos."
        action={
          <Button onClick={openCreate} disabled={!buses || buses.length === 0}>
            + Nuevo viaje
          </Button>
        }
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="No se pudieron cargar los viajes." onRetry={() => refetch()} />}
      {!isLoading && !isError && viajes && viajes.length === 0 && (
        <EmptyState message="Aún no hay viajes programados." />
      )}
      {!isLoading && !isError && viajes && viajes.length > 0 && (
        <DataTable
          rows={viajes}
          getRowKey={(v) => v.id}
          columns={columns}
          actions={(v) => (
            <>
              {v.estado === EstadoViaje.PROGRAMADO && (
                <Button
                  variant="ghost"
                  onClick={() => cancelViaje.mutate({ id: v.id, action: 'cancel' })}
                >
                  Cancelar
                </Button>
              )}
              <Button variant="secondary" onClick={() => openEdit(v)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => setDeleting(v)}>
                Eliminar
              </Button>
            </>
          )}
        />
      )}

      <Modal open={formOpen} title={editing ? 'Editar viaje' : 'Nuevo viaje'} onClose={() => setFormOpen(false)}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field label="Bus">
            <select
              className={inputClass}
              value={form.busId}
              onChange={(e) => setForm({ ...form, busId: e.target.value })}
              required
            >
              <option value="" disabled>
                Selecciona un bus…
              </option>
              {buses?.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.placa} · {bus.modelo} · {bus.capacidad} asientos
                </option>
              ))}
            </select>
          </Field>
          {!editing && (
            <Field label="Tour (opcional: convierte este viaje en una salida reservable)">
              <select
                className={inputClass}
                value={form.tourId}
                onChange={(e) => setForm({ ...form, tourId: e.target.value })}
              >
                <option value="">Ninguno (viaje suelto)</option>
                {tours?.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.titulo}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Origen">
              <input
                className={inputClass}
                value={form.rutaOrigen}
                onChange={(e) => setForm({ ...form, rutaOrigen: e.target.value })}
                required
              />
            </Field>
            <Field label="Destino">
              <input
                className={inputClass}
                value={form.rutaDestino}
                onChange={(e) => setForm({ ...form, rutaDestino: e.target.value })}
                required
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Fecha de salida">
              <input
                type="date"
                className={inputClass}
                value={form.fechaSalida}
                onChange={(e) => setForm({ ...form, fechaSalida: e.target.value })}
                required
              />
            </Field>
            <Field label="Hora salida">
              <input
                type="time"
                className={inputClass}
                value={form.horaSalida}
                onChange={(e) => setForm({ ...form, horaSalida: e.target.value })}
                required
              />
            </Field>
            <Field label="Hora llegada">
              <input
                type="time"
                className={inputClass}
                value={form.horaLlegada}
                onChange={(e) => setForm({ ...form, horaLlegada: e.target.value })}
                required
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio (USD)">
              <input
                type="number"
                step="0.01"
                min="0.01"
                className={inputClass}
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                required
              />
            </Field>
            <Field label="Asientos disponibles">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.asientosDisponibles}
                onChange={(e) => setForm({ ...form, asientosDisponibles: e.target.value })}
                placeholder="Por defecto: capacidad del bus"
              />
            </Field>
          </div>
          <Field label="Descripción (opcional)">
            <textarea
              className={inputClass}
              rows={2}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </Field>

          {formError && <p className="text-sm text-crimson-600">{formError}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar viaje"
        message={`¿Seguro que quieres eliminar el viaje "${deleting?.rutaOrigen} → ${deleting?.rutaDestino}"?`}
        pending={removeViaje.isPending}
        onConfirm={() => deleting && removeViaje.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
