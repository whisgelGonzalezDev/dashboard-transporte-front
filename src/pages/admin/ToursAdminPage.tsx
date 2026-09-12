import { useState } from 'react'
import { createResourceHooks } from '../../hooks/useResource'
import type { CreateTourDto, TourDTO, UpdateTourDto } from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import { Field, inputClass } from '../../components/ui/Field'

const tourHooks = createResourceHooks<TourDTO, CreateTourDto, UpdateTourDto>('tours')

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

interface FormState {
  titulo: string
  descripcion: string
  precio: string
  imagenUrl: string
}

const EMPTY_FORM: FormState = { titulo: '', descripcion: '', precio: '', imagenUrl: '' }

function toFormState(tour: TourDTO): FormState {
  return {
    titulo: tour.titulo,
    descripcion: tour.descripcion,
    precio: String(tour.precio),
    imagenUrl: tour.imagenUrl,
  }
}

export function ToursAdminPage() {
  const { data: tours, isLoading, isError, refetch } = tourHooks.useList()
  const createTour = tourHooks.useCreate()
  const updateTour = tourHooks.useUpdate()
  const removeTour = tourHooks.useRemove()
  const toggleTour = tourHooks.usePatch()

  const [editing, setEditing] = useState<TourDTO | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [deleting, setDeleting] = useState<TourDTO | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(tour: TourDTO) {
    setEditing(tour)
    setForm(toFormState(tour))
    setFormError(null)
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const precio = Number(form.precio)
    if (Number.isNaN(precio) || precio <= 0) {
      setFormError('El precio debe ser un número mayor a 0.')
      return
    }

    const dto = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      precio,
      imagenUrl: form.imagenUrl.trim(),
    }

    const mutation = editing
      ? updateTour.mutateAsync({ id: editing.id, dto })
      : createTour.mutateAsync(dto as CreateTourDto)

    mutation
      .then(() => setFormOpen(false))
      .catch((err: Error) => setFormError(err.message ?? 'Ocurrió un error al guardar el tour.'))
  }

  const columns: Column<TourDTO>[] = [
    {
      header: 'Tour',
      render: (t) => (
        <div className="flex items-center gap-3">
          <img
            src={t.imagenUrl}
            alt={t.titulo}
            className="h-10 w-14 rounded-md object-cover"
            onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
          />
          <span className="font-medium text-navy-900">{t.titulo}</span>
        </div>
      ),
    },
    {
      header: 'Descripción',
      render: (t) => <span className="line-clamp-2 max-w-xs text-navy-500">{t.descripcion}</span>,
    },
    { header: 'Precio', render: (t) => currencyFormatter.format(t.precio) },
    {
      header: 'Estado',
      render: (t) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            t.activo ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-500'
          }`}
        >
          {t.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ]

  const pending = createTour.isPending || updateTour.isPending

  return (
    <div>
      <PageHeader
        title="Tours"
        description="Gestiona los tours que se muestran en la landing pública."
        action={<Button onClick={openCreate}>+ Nuevo tour</Button>}
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="No se pudieron cargar los tours." onRetry={() => refetch()} />}
      {!isLoading && !isError && tours && tours.length === 0 && (
        <EmptyState message="Aún no hay tours creados." />
      )}
      {!isLoading && !isError && tours && tours.length > 0 && (
        <DataTable
          rows={tours}
          getRowKey={(t) => t.id}
          columns={columns}
          actions={(t) => (
            <>
              <Button
                variant="ghost"
                onClick={() =>
                  toggleTour.mutate({ id: t.id, action: t.activo ? 'deactivate' : 'activate' })
                }
              >
                {t.activo ? 'Desactivar' : 'Activar'}
              </Button>
              <Button variant="secondary" onClick={() => openEdit(t)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => setDeleting(t)}>
                Eliminar
              </Button>
            </>
          )}
        />
      )}

      <Modal open={formOpen} title={editing ? 'Editar tour' : 'Nuevo tour'} onClose={() => setFormOpen(false)}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field label="Título">
            <input
              className={inputClass}
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
              minLength={3}
              maxLength={150}
            />
          </Field>
          <Field label="Descripción breve">
            <textarea
              className={inputClass}
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              required
            />
          </Field>
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
          <Field label="URL de la imagen">
            <input
              className={inputClass}
              value={form.imagenUrl}
              onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })}
              placeholder="https://…"
              required
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
        title="Eliminar tour"
        message={`¿Seguro que quieres eliminar "${deleting?.titulo}"? Esta acción no se puede deshacer.`}
        pending={removeTour.isPending}
        onConfirm={() => deleting && removeTour.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
