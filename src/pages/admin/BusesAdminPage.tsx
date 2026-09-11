import { useState } from 'react'
import { createResourceHooks } from '../../hooks/useResource'
import { EstadoBus, type BusDTO, type CreateBusDto, type UpdateBusDto } from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import { Field, inputClass } from '../../components/ui/Field'

const busHooks = createResourceHooks<BusDTO, CreateBusDto, UpdateBusDto>('buses')

interface FormState {
  placa: string
  capacidad: string
  modelo: string
  anio: string
  amenidades: string
  estado: EstadoBus
}

const EMPTY_FORM: FormState = {
  placa: '',
  capacidad: '',
  modelo: '',
  anio: String(new Date().getFullYear()),
  amenidades: '',
  estado: EstadoBus.ACTIVO,
}

function toFormState(bus: BusDTO): FormState {
  return {
    placa: bus.placa,
    capacidad: String(bus.capacidad),
    modelo: bus.modelo,
    anio: String(bus.anio),
    amenidades: bus.amenidades.join(', '),
    estado: bus.estado,
  }
}

const ESTADO_LABEL: Record<EstadoBus, string> = {
  [EstadoBus.ACTIVO]: 'Activo',
  [EstadoBus.INACTIVO]: 'Inactivo',
  [EstadoBus.MANTENIMIENTO]: 'Mantenimiento',
}

export function BusesAdminPage() {
  const { data: buses, isLoading, isError, refetch } = busHooks.useList()
  const createBus = busHooks.useCreate()
  const updateBus = busHooks.useUpdate()
  const removeBus = busHooks.useRemove()

  const [editing, setEditing] = useState<BusDTO | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [deleting, setDeleting] = useState<BusDTO | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(bus: BusDTO) {
    setEditing(bus)
    setForm(toFormState(bus))
    setFormError(null)
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const capacidad = Number(form.capacidad)
    const anio = Number(form.anio)
    if (Number.isNaN(capacidad) || capacidad <= 0) {
      setFormError('La capacidad debe ser un número mayor a 0.')
      return
    }

    const amenidades = form.amenidades
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)

    const mutation = editing
      ? updateBus.mutateAsync({
          id: editing.id,
          dto: { capacidad, modelo: form.modelo.trim(), anio, amenidades, estado: form.estado },
        })
      : createBus.mutateAsync({
          placa: form.placa.trim().toUpperCase(),
          capacidad,
          modelo: form.modelo.trim(),
          anio,
          amenidades,
        })

    mutation
      .then(() => setFormOpen(false))
      .catch((err: Error) => setFormError(err.message ?? 'Ocurrió un error al guardar el bus.'))
  }

  const columns: Column<BusDTO>[] = [
    { header: 'Placa', render: (b) => <span className="font-medium text-ink-900">{b.placa}</span> },
    { header: 'Modelo', render: (b) => b.modelo },
    { header: 'Año', render: (b) => b.anio },
    { header: 'Capacidad', render: (b) => `${b.capacidad} asientos` },
    {
      header: 'Estado',
      render: (b) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            b.estado === EstadoBus.ACTIVO
              ? 'bg-jungle-100 text-jungle-700'
              : b.estado === EstadoBus.MANTENIMIENTO
                ? 'bg-adventure-100 text-adventure-700'
                : 'bg-ink-100 text-ink-500'
          }`}
        >
          {ESTADO_LABEL[b.estado]}
        </span>
      ),
    },
  ]

  const pending = createBus.isPending || updateBus.isPending

  return (
    <div>
      <PageHeader
        title="Buses"
        description="Flota de vehículos usada para operar los viajes."
        action={<Button onClick={openCreate}>+ Nuevo bus</Button>}
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="No se pudieron cargar los buses." onRetry={() => refetch()} />}
      {!isLoading && !isError && buses && buses.length === 0 && (
        <EmptyState message="Aún no hay buses registrados." />
      )}
      {!isLoading && !isError && buses && buses.length > 0 && (
        <DataTable
          rows={buses}
          getRowKey={(b) => b.id}
          columns={columns}
          actions={(b) => (
            <>
              <Button variant="secondary" onClick={() => openEdit(b)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => setDeleting(b)}>
                Eliminar
              </Button>
            </>
          )}
        />
      )}

      <Modal open={formOpen} title={editing ? 'Editar bus' : 'Nuevo bus'} onClose={() => setFormOpen(false)}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field label="Placa (ABC-1234)">
            <input
              className={inputClass}
              value={form.placa}
              onChange={(e) => setForm({ ...form, placa: e.target.value })}
              disabled={!!editing}
              placeholder="ABC-1234"
              required
            />
          </Field>
          <Field label="Modelo">
            <input
              className={inputClass}
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Año">
              <input
                type="number"
                className={inputClass}
                value={form.anio}
                onChange={(e) => setForm({ ...form, anio: e.target.value })}
                required
              />
            </Field>
            <Field label="Capacidad">
              <input
                type="number"
                min="1"
                className={inputClass}
                value={form.capacidad}
                onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
                required
              />
            </Field>
          </div>
          <Field label="Amenidades (separadas por coma)">
            <input
              className={inputClass}
              value={form.amenidades}
              onChange={(e) => setForm({ ...form, amenidades: e.target.value })}
              placeholder="wifi, aire acondicionado, baño"
            />
          </Field>
          {editing && (
            <Field label="Estado">
              <select
                className={inputClass}
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoBus })}
              >
                {Object.values(EstadoBus).map((estado) => (
                  <option key={estado} value={estado}>
                    {ESTADO_LABEL[estado]}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {formError && <p className="text-sm text-red-600">{formError}</p>}

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
        title="Eliminar bus"
        message={`¿Seguro que quieres eliminar el bus "${deleting?.placa}"?`}
        pending={removeBus.isPending}
        onConfirm={() => deleting && removeBus.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
