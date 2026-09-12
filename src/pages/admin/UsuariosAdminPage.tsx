import { useState } from 'react'
import { createResourceHooks } from '../../hooks/useResource'
import {
  EstadoUsuario,
  RolUsuario,
  type CreateUsuarioDto,
  type UpdateUsuarioDto,
  type UsuarioDTO,
} from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import { Field, inputClass } from '../../components/ui/Field'

const usuarioHooks = createResourceHooks<UsuarioDTO, CreateUsuarioDto, UpdateUsuarioDto>('usuarios')

const ROL_LABEL: Record<RolUsuario, string> = {
  [RolUsuario.ADMIN]: 'Administrador',
  [RolUsuario.OPERADOR]: 'Operador',
  [RolUsuario.PASAJERO]: 'Pasajero',
}

interface FormState {
  nombre: string
  email: string
  password: string
  rol: RolUsuario
  estado: EstadoUsuario
}

const EMPTY_FORM: FormState = {
  nombre: '',
  email: '',
  password: '',
  rol: RolUsuario.OPERADOR,
  estado: EstadoUsuario.ACTIVO,
}

function toFormState(usuario: UsuarioDTO): FormState {
  return {
    nombre: usuario.nombre,
    email: usuario.email,
    password: '',
    rol: usuario.rol,
    estado: usuario.estado,
  }
}

export function UsuariosAdminPage() {
  const { data: usuarios, isLoading, isError, refetch } = usuarioHooks.useList()
  const createUsuario = usuarioHooks.useCreate()
  const updateUsuario = usuarioHooks.useUpdate()
  const removeUsuario = usuarioHooks.useRemove()

  const [editing, setEditing] = useState<UsuarioDTO | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [deleting, setDeleting] = useState<UsuarioDTO | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(usuario: UsuarioDTO) {
    setEditing(usuario)
    setForm(toFormState(usuario))
    setFormError(null)
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const mutation = editing
      ? updateUsuario.mutateAsync({
          id: editing.id,
          dto: {
            nombre: form.nombre.trim(),
            rol: form.rol,
            estado: form.estado,
            password: form.password.trim() || undefined,
          },
        })
      : createUsuario.mutateAsync({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          password: form.password,
          rol: form.rol,
        })

    mutation
      .then(() => setFormOpen(false))
      .catch((err: Error) => setFormError(err.message ?? 'Ocurrió un error al guardar el usuario.'))
  }

  const columns: Column<UsuarioDTO>[] = [
    { header: 'Nombre', render: (u) => <span className="font-medium text-navy-900">{u.nombre}</span> },
    { header: 'Email', render: (u) => u.email },
    { header: 'Rol', render: (u) => ROL_LABEL[u.rol] },
    {
      header: 'Estado',
      render: (u) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            u.estado === EstadoUsuario.ACTIVO ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-500'
          }`}
        >
          {u.estado === EstadoUsuario.ACTIVO ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ]

  const pending = createUsuario.isPending || updateUsuario.isPending

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Cuentas del equipo que administra el sistema."
        action={<Button onClick={openCreate}>+ Nuevo usuario</Button>}
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="No se pudieron cargar los usuarios." onRetry={() => refetch()} />}
      {!isLoading && !isError && usuarios && usuarios.length === 0 && (
        <EmptyState message="Aún no hay usuarios registrados." />
      )}
      {!isLoading && !isError && usuarios && usuarios.length > 0 && (
        <DataTable
          rows={usuarios}
          getRowKey={(u) => u.id}
          columns={columns}
          actions={(u) => (
            <>
              <Button variant="secondary" onClick={() => openEdit(u)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => setDeleting(u)}>
                Eliminar
              </Button>
            </>
          )}
        />
      )}

      <Modal open={formOpen} title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setFormOpen(false)}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field label="Nombre">
            <input
              className={inputClass}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!!editing}
              required
            />
          </Field>
          <Field label={editing ? 'Nueva contraseña (opcional)' : 'Contraseña'}>
            <input
              type="password"
              className={inputClass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editing}
              minLength={6}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rol">
              <select
                className={inputClass}
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value as RolUsuario })}
              >
                {Object.values(RolUsuario).map((rol) => (
                  <option key={rol} value={rol}>
                    {ROL_LABEL[rol]}
                  </option>
                ))}
              </select>
            </Field>
            {editing && (
              <Field label="Estado">
                <select
                  className={inputClass}
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoUsuario })}
                >
                  <option value={EstadoUsuario.ACTIVO}>Activo</option>
                  <option value={EstadoUsuario.INACTIVO}>Inactivo</option>
                </select>
              </Field>
            )}
          </div>

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
        title="Eliminar usuario"
        message={`¿Seguro que quieres eliminar a "${deleting?.nombre}"?`}
        pending={removeUsuario.isPending}
        onConfirm={() =>
          deleting && removeUsuario.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
