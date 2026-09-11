import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createResourceHooks } from '../../hooks/useResource'
import { api } from '../../lib/api'
import {
  EstadoCuenta,
  type PasajeroDTO,
  type ReservaDTO,
  type ViajeDTO,
} from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import { Field, inputClass } from '../../components/ui/Field'

const reservaHooks = createResourceHooks<ReservaDTO, never, never>('reservas')
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

export function ReservasAdminPage() {
  const { data: reservas, isLoading, isError, refetch } = reservaHooks.useList()
  const { data: viajes } = viajeHooks.useList()
  const removeReserva = reservaHooks.useRemove()
  const abonar = reservaHooks.usePatch()

  const [abonando, setAbonando] = useState<ReservaDTO | null>(null)
  const [monto, setMonto] = useState('')
  const [deleting, setDeleting] = useState<ReservaDTO | null>(null)
  const [detalle, setDetalle] = useState<ReservaDTO | null>(null)

  const { data: pasajerosDetalle, isLoading: loadingDetalle } = useQuery({
    queryKey: ['pasajeros', 'reserva', detalle?.id],
    queryFn: () => api.get<PasajeroDTO[]>(`/pasajeros?reservaId=${detalle?.id}`),
    enabled: !!detalle,
  })

  const viajeLabel = (viajeId: string) => {
    const v = viajes?.find((viaje) => viaje.id === viajeId)
    return v ? `${v.rutaOrigen} → ${v.rutaDestino} · ${v.fechaSalida?.slice(0, 10)}` : viajeId
  }

  function handleAbonar(e: React.FormEvent) {
    e.preventDefault()
    if (!abonando) return
    abonar.mutate(
      { id: abonando.id, action: 'abonar', body: { monto: Number(monto) } },
      { onSuccess: () => setAbonando(null) },
    )
  }

  const columns: Column<ReservaDTO>[] = [
    { header: 'Viaje', render: (r) => <span className="text-ink-500">{viajeLabel(r.viajeId)}</span> },
    {
      header: 'Contacto principal',
      render: (r) => (
        <span className="font-medium text-ink-900">{r.pasajeroPrincipal?.nombre ?? '—'}</span>
      ),
    },
    { header: 'Personas', render: (r) => r.cantidadPasajeros },
    { header: 'Total', render: (r) => currencyFormatter.format(r.montoTotal) },
    { header: 'Abonado', render: (r) => currencyFormatter.format(r.abonado) },
    { header: 'Saldo', render: (r) => currencyFormatter.format(r.saldo) },
    {
      header: 'Estado',
      render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ESTADO_BADGE[r.estadoCuenta]}`}>
          {ESTADO_LABEL[r.estadoCuenta]}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Reservas"
        description="Contabilidad por grupo: cuánto debe cada reserva y cuánto ha abonado."
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="No se pudieron cargar las reservas." onRetry={() => refetch()} />}
      {!isLoading && !isError && reservas && reservas.length === 0 && (
        <EmptyState message="Todavía no hay reservas registradas." />
      )}
      {!isLoading && !isError && reservas && reservas.length > 0 && (
        <DataTable
          rows={reservas}
          getRowKey={(r) => r.id}
          columns={columns}
          actions={(r) => (
            <>
              <Button variant="ghost" onClick={() => setDetalle(r)}>
                Ver grupo
              </Button>
              {r.estadoCuenta !== EstadoCuenta.PAGADO && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAbonando(r)
                    setMonto('')
                  }}
                >
                  Abonar
                </Button>
              )}
              <Button variant="danger" onClick={() => setDeleting(r)}>
                Cancelar
              </Button>
            </>
          )}
        />
      )}

      <Modal open={!!abonando} title="Registrar abono" onClose={() => setAbonando(null)}>
        <form className="flex flex-col gap-4" onSubmit={handleAbonar}>
          <p className="text-sm text-ink-500">
            Saldo pendiente: {abonando && currencyFormatter.format(abonando.saldo)}
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

      <Modal open={!!detalle} title="Pasajeros del grupo" onClose={() => setDetalle(null)}>
        {loadingDetalle && <LoadingState />}
        {!loadingDetalle && pasajerosDetalle && (
          <ul className="flex flex-col gap-2 text-sm">
            {pasajerosDetalle.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2"
              >
                <div>
                  <span className="font-medium text-ink-900">
                    {p.esPrincipal && '★ '}
                    {p.nombre}
                  </span>
                  <p className="text-xs text-ink-400">{p.documento} · {p.email}</p>
                </div>
                <span className="text-xs text-ink-500">
                  {p.numeroAsiento ? `Asiento ${p.numeroAsiento}` : 'Sin asiento'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Cancelar reserva"
        message={`¿Seguro que quieres cancelar la reserva de "${deleting?.pasajeroPrincipal?.nombre}"? Se liberarán los asientos del grupo.`}
        confirmLabel="Cancelar reserva"
        pending={removeReserva.isPending}
        onConfirm={() => deleting && removeReserva.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
