import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'
import type {
  CreatePasajeroGrupoItemDto,
  CreateReservaDto,
  ReservaDTO,
  SalidaDTO,
  TourDTO,
} from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field, inputClass } from '../ui/Field'
import { LoadingState } from '../ui/States'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

interface PasajeroForm {
  nombre: string
  email: string
  telefono: string
  documento: string
}

const EMPTY_PASAJERO: PasajeroForm = { nombre: '', email: '', telefono: '', documento: '' }

function formatFecha(fecha: string) {
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

export function TourBookingModal({ tour, onClose }: { tour: TourDTO; onClose: () => void }) {
  const {
    data: salidas,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tours', tour.id, 'salidas'],
    queryFn: () => api.get<SalidaDTO[]>(`/tours/${tour.id}/salidas`),
  })

  const [viajeId, setViajeId] = useState<string | null>(null)
  const [pasajeros, setPasajeros] = useState<PasajeroForm[]>([{ ...EMPTY_PASAJERO }])
  const [principalIndex, setPrincipalIndex] = useState(0)
  const [abonoInicial, setAbonoInicial] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [reserva, setReserva] = useState<ReservaDTO | null>(null)

  const salidaSeleccionada = salidas?.find((s) => s.viajeId === (viajeId ?? salidas?.[0]?.viajeId))
  const cantidad = pasajeros.length
  const montoTotal = (salidaSeleccionada?.precio ?? 0) * cantidad

  const crearReserva = useMutation({
    mutationFn: (dto: CreateReservaDto) => api.post<ReservaDTO>('/reservas', dto),
  })

  function updatePasajero(index: number, fields: Partial<PasajeroForm>) {
    setPasajeros((prev) => prev.map((p, i) => (i === index ? { ...p, ...fields } : p)))
  }

  function addPasajero() {
    if (!salidaSeleccionada) return
    if (pasajeros.length >= salidaSeleccionada.asientosDisponibles) return
    setPasajeros((prev) => [...prev, { ...EMPTY_PASAJERO }])
  }

  function removePasajero(index: number) {
    if (pasajeros.length <= 1) return
    setPasajeros((prev) => prev.filter((_, i) => i !== index))
    if (principalIndex >= index && principalIndex > 0) {
      setPrincipalIndex((prev) => prev - 1)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!salidaSeleccionada) {
      setFormError('Selecciona una fecha de salida.')
      return
    }

    const items: CreatePasajeroGrupoItemDto[] = pasajeros.map((p, i) => ({
      nombre: p.nombre.trim(),
      email: p.email.trim(),
      telefono: p.telefono.trim(),
      documento: p.documento.trim(),
      esPrincipal: i === principalIndex,
    }))

    crearReserva.mutate(
      {
        viajeId: salidaSeleccionada.viajeId,
        pasajeros: items,
        abonoInicial: abonoInicial ? Number(abonoInicial) : undefined,
      },
      {
        onSuccess: (r) => setReserva(r),
        onError: (err) =>
          setFormError(err instanceof ApiError ? err.message : 'No se pudo completar la reserva.'),
      },
    )
  }

  return (
    <Modal open title={reserva ? '¡Reserva confirmada!' : `Reservar: ${tour.titulo}`} onClose={onClose}>
      {isLoading && <LoadingState label="Buscando fechas disponibles…" />}

      {isError && (
        <p className="text-sm text-crimson-600">
          No pudimos cargar las fechas disponibles. Intenta de nuevo más tarde.
        </p>
      )}

      {!isLoading && !isError && salidas && salidas.length === 0 && !reserva && (
        <p className="text-sm text-navy-500">
          Este tour no tiene salidas disponibles por el momento. Vuelve a intentarlo pronto.
        </p>
      )}

      {reserva && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-navy-600">
            Tu grupo de <strong>{reserva.cantidadPasajeros}</strong> persona(s) quedó reservado para{' '}
            <strong>{tour.titulo}</strong>.
          </p>
          <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
            <div className="flex justify-between">
              <span>Monto total</span>
              <strong>{currencyFormatter.format(reserva.montoTotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Abonado</span>
              <strong>{currencyFormatter.format(reserva.abonado)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Saldo pendiente</span>
              <strong>{currencyFormatter.format(reserva.saldo)}</strong>
            </div>
          </div>
          <p className="text-xs text-navy-400">
            Código de reserva: <span className="font-mono">{reserva.id}</span>
          </p>
          <Button onClick={onClose}>Listo</Button>
        </div>
      )}

      {!reserva && salidas && salidas.length > 0 && (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field label="Fecha de salida">
            <select
              className={inputClass}
              value={viajeId ?? salidas[0].viajeId}
              onChange={(e) => setViajeId(e.target.value)}
            >
              {salidas.map((s) => (
                <option key={s.viajeId} value={s.viajeId}>
                  {formatFecha(s.fechaSalida)} · {s.horaSalida} · {currencyFormatter.format(s.precio)} por
                  persona · {s.asientosDisponibles} cupos
                </option>
              ))}
            </select>
          </Field>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-navy-700">Pasajeros del grupo</span>
              <Button
                type="button"
                variant="secondary"
                onClick={addPasajero}
                disabled={!salidaSeleccionada || pasajeros.length >= salidaSeleccionada.asientosDisponibles}
              >
                + Agregar
              </Button>
            </div>

            {pasajeros.map((p, index) => (
              <div key={index} className="rounded-xl border border-navy-100 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-500">
                    <input
                      type="radio"
                      name="principal"
                      checked={principalIndex === index}
                      onChange={() => setPrincipalIndex(index)}
                    />
                    Contacto principal
                  </label>
                  {pasajeros.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePasajero(index)}
                      className="text-xs font-medium text-crimson-500 hover:underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={inputClass}
                    placeholder="Nombre completo"
                    value={p.nombre}
                    onChange={(e) => updatePasajero(index, { nombre: e.target.value })}
                    required
                  />
                  <input
                    className={inputClass}
                    placeholder="Documento"
                    value={p.documento}
                    onChange={(e) => updatePasajero(index, { documento: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="Email"
                    value={p.email}
                    onChange={(e) => updatePasajero(index, { email: e.target.value })}
                    required
                  />
                  <input
                    className={inputClass}
                    placeholder="Teléfono"
                    value={p.telefono}
                    onChange={(e) => updatePasajero(index, { telefono: e.target.value })}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <Field label="Abono inicial (opcional, USD)">
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={abonoInicial}
              onChange={(e) => setAbonoInicial(e.target.value)}
              placeholder="0.00"
            />
          </Field>

          <div className="flex justify-between rounded-xl bg-gold-50 p-3 text-sm text-gold-800">
            <span>Total ({cantidad} persona{cantidad > 1 ? 's' : ''})</span>
            <strong>{currencyFormatter.format(montoTotal)}</strong>
          </div>

          {formError && <p className="text-sm text-crimson-600">{formError}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crearReserva.isPending}>
              {crearReserva.isPending ? 'Reservando…' : 'Confirmar reserva'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
