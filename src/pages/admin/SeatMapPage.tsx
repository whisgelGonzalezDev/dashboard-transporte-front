import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createResourceHooks } from '../../hooks/useResource'
import { api, httpClient } from '../../lib/api'
import type { AssignSeatDto, BusDTO, SeatMapDTO, SeatSlotDTO, ViajeDTO } from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Field } from '../../components/ui/Field'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'

const viajeHooks = createResourceHooks<ViajeDTO, never, never>('viajes')
const busHooks = createResourceHooks<BusDTO, never, never>('buses')

export function SeatMapPage() {
  const { data: viajes } = viajeHooks.useList()
  const { data: buses } = busHooks.useList()
  const [busId, setBusId] = useState<string>('')
  const [viajeId, setViajeId] = useState<string>('')
  const [assigning, setAssigning] = useState<{ numero: number } | null>(null)
  const [downloading, setDownloading] = useState(false)
  const queryClient = useQueryClient()

  const viajesDelBus = busId ? (viajes?.filter((v) => v.busId === busId) ?? []) : (viajes ?? [])
  const busSeleccionado = buses?.find((b) => b.id === busId)

  function handleBusChange(nuevoBusId: string) {
    setBusId(nuevoBusId)
    // Si el viaje elegido no pertenece al nuevo bus, se limpia para forzar
    // a elegir uno que sí coincida (viaje y bus siempre van juntos).
    const viajeActual = viajes?.find((v) => v.id === viajeId)
    if (nuevoBusId && viajeActual && viajeActual.busId !== nuevoBusId) {
      setViajeId('')
    }
  }

  function handleViajeChange(nuevoViajeId: string) {
    setViajeId(nuevoViajeId)
    const viaje = viajes?.find((v) => v.id === nuevoViajeId)
    if (viaje) setBusId(viaje.busId)
  }

  const {
    data: seatMap,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['pasajeros', 'seat-map', viajeId],
    queryFn: () => api.get<SeatMapDTO>(`/pasajeros/viaje/${viajeId}/mapa-asientos`),
    enabled: !!viajeId,
  })

  const assignSeat = useMutation({
    mutationFn: ({ pasajeroId, numeroAsiento }: { pasajeroId: string; numeroAsiento: number | null }) =>
      api.patch(`/pasajeros/${pasajeroId}/asiento`, { numeroAsiento } as AssignSeatDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pasajeros', 'seat-map', viajeId] })
      setAssigning(null)
    },
  })

  async function exportarPdf() {
    if (!viajeId) return
    setDownloading(true)
    try {
      const response = await httpClient.get(`/pasajeros/viaje/${viajeId}/mapa-asientos.pdf`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(response.data as Blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mapa-asientos-${viajeId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  function seatClasses(seat: SeatSlotDTO) {
    if (seat.ocupado) {
      return seat.esPrincipal
        ? 'bg-gold-100 border-gold-300 text-gold-800'
        : 'bg-navy-100 border-navy-300 text-navy-800'
    }
    return 'bg-white border-navy-200 text-navy-400 hover:border-gold-300'
  }

  return (
    <div>
      <PageHeader
        title="Asientos"
        description="Asigna los puestos del bus por pasajero o grupo y exporta el plano en PDF."
        action={
          <Button onClick={exportarPdf} disabled={!viajeId || downloading} variant="secondary">
            {downloading ? 'Generando…' : '⬇ Exportar PDF'}
          </Button>
        }
      />

      <div className="mb-6 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Bus">
          <select
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm"
            value={busId}
            onChange={(e) => handleBusChange(e.target.value)}
          >
            <option value="">Todos los buses…</option>
            {buses?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.placa} · {b.modelo} · {b.capacidad} asientos
              </option>
            ))}
          </select>
        </Field>
        <Field label="Viaje">
          <select
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm"
            value={viajeId}
            onChange={(e) => handleViajeChange(e.target.value)}
          >
            <option value="">Selecciona un viaje…</option>
            {viajesDelBus.map((v) => (
              <option key={v.id} value={v.id}>
                {v.rutaOrigen} → {v.rutaDestino} · {v.fechaSalida?.slice(0, 10)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {busSeleccionado && (
        <p className="mb-4 text-sm text-navy-500">
          Bus <strong>{busSeleccionado.placa}</strong> ({busSeleccionado.modelo}) · el mapa se pinta con sus{' '}
          <strong>{busSeleccionado.capacidad} asientos</strong>.
        </p>
      )}

      {!viajeId && (
        <EmptyState
          message={
            busId
              ? viajesDelBus.length === 0
                ? 'Este bus no tiene viajes programados.'
                : 'Selecciona un viaje para ver su mapa de asientos.'
              : 'Selecciona un bus y un viaje para ver su mapa de asientos.'
          }
        />
      )}
      {viajeId && isLoading && <LoadingState />}
      {viajeId && isError && (
        <ErrorState message="No se pudo cargar el mapa de asientos." onRetry={() => refetch()} />
      )}

      {seatMap && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 text-sm text-navy-500">
            <span>
              {seatMap.rutaOrigen} → {seatMap.rutaDestino}
            </span>
            <span>·</span>
            <span>{seatMap.fechaSalida?.slice(0, 10)} {seatMap.horaSalida}</span>
            <span>·</span>
            <span>{seatMap.capacidad} asientos</span>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
            {seatMap.asientos.map((seat) => (
              <button
                key={seat.numero}
                onClick={() =>
                  seat.ocupado
                    ? seat.pasajeroId && assignSeat.mutate({ pasajeroId: seat.pasajeroId, numeroAsiento: null })
                    : setAssigning({ numero: seat.numero })
                }
                className={`flex h-16 flex-col items-center justify-center rounded-lg border text-xs font-medium transition-colors ${seatClasses(seat)}`}
                title={seat.ocupado ? `${seat.nombre} — click para liberar` : 'Libre — click para asignar'}
              >
                <span className="font-semibold">#{seat.numero}</span>
                <span className="max-w-full truncate px-1">
                  {seat.ocupado ? (seat.esPrincipal ? `★ ${seat.nombre}` : seat.nombre) : 'Libre'}
                </span>
              </button>
            ))}
          </div>

          {seatMap.sinAsiento.length > 0 && (
            <div>
              <h3 className="mb-2 font-display text-sm font-semibold text-navy-900">
                Pendientes de asiento ({seatMap.sinAsiento.length})
              </h3>
              <ul className="flex flex-wrap gap-2">
                {seatMap.sinAsiento.map((p) => (
                  <li
                    key={p.pasajeroId}
                    className="rounded-full bg-navy-100 px-3 py-1 text-xs text-navy-600"
                  >
                    {p.esPrincipal && '★ '}
                    {p.nombre}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Modal
        open={!!assigning}
        title={`Asignar asiento #${assigning?.numero ?? ''}`}
        onClose={() => setAssigning(null)}
      >
        {seatMap && seatMap.sinAsiento.length === 0 && (
          <p className="text-sm text-navy-500">No hay pasajeros pendientes de asiento en este viaje.</p>
        )}
        {seatMap && seatMap.sinAsiento.length > 0 && (
          <ul className="flex flex-col gap-2">
            {seatMap.sinAsiento.map((p) => (
              <li key={p.pasajeroId}>
                <button
                  onClick={() =>
                    assigning &&
                    assignSeat.mutate({ pasajeroId: p.pasajeroId, numeroAsiento: assigning.numero })
                  }
                  disabled={assignSeat.isPending}
                  className="w-full rounded-lg border border-navy-100 px-3 py-2 text-left text-sm hover:bg-navy-50"
                >
                  {p.esPrincipal && '★ '}
                  {p.nombre}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}
