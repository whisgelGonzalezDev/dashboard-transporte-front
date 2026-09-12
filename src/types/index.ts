// Tipos espejo de los DTOs expuestos por dashboard-transporte-backend.

export const EstadoBus = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  MANTENIMIENTO: 'mantenimiento',
} as const
export type EstadoBus = (typeof EstadoBus)[keyof typeof EstadoBus]

export interface BusDTO {
  id: string
  placa: string
  capacidad: number
  modelo: string
  anio: number
  estado: EstadoBus
  amenidades: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateBusDto {
  placa: string
  capacidad: number
  modelo: string
  anio: number
  amenidades: string[]
}

export interface UpdateBusDto {
  capacidad?: number
  modelo?: string
  anio?: number
  amenidades?: string[]
  estado?: EstadoBus
}

export const EstadoViaje = {
  PROGRAMADO: 'programado',
  EN_CURSO: 'en_curso',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
} as const
export type EstadoViaje = (typeof EstadoViaje)[keyof typeof EstadoViaje]

export interface ViajeDTO {
  id: string
  busId: string
  tourId: string | null
  rutaOrigen: string
  rutaDestino: string
  fechaSalida: string
  horaSalida: string
  horaLlegada: string
  precio: number
  asientosDisponibles: number
  estado: EstadoViaje
  descripcion: string | null
  fotoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateViajeDto {
  busId: string
  tourId?: string | null
  rutaOrigen: string
  rutaDestino: string
  fechaSalida: string
  horaSalida: string
  horaLlegada: string
  precio: number
  asientosDisponibles?: number
  descripcion?: string | null
  fotoUrl?: string | null
}

export interface UpdateViajeDto {
  busId?: string
  rutaOrigen?: string
  rutaDestino?: string
  fechaSalida?: string
  horaSalida?: string
  horaLlegada?: string
  precio?: number
  asientosDisponibles?: number
  estado?: EstadoViaje
  descripcion?: string | null
  fotoUrl?: string | null
}

export const EstadoCuenta = {
  PENDIENTE: 'pendiente',
  PARCIAL: 'parcial',
  PAGADO: 'pagado',
} as const
export type EstadoCuenta = (typeof EstadoCuenta)[keyof typeof EstadoCuenta]

export interface PasajeroDTO {
  id: string
  nombre: string
  email: string
  telefono: string
  documento: string
  reservaId: string
  viajeId: string
  esPrincipal: boolean
  numeroAsiento: number | null
  createdAt: string
  updatedAt: string
}

export interface AssignSeatDto {
  numeroAsiento: number | null
}

export interface SeatSlotDTO {
  numero: number
  ocupado: boolean
  pasajeroId?: string
  nombre?: string
  esPrincipal?: boolean
  reservaId?: string
}

export interface PendienteAsientoDTO {
  pasajeroId: string
  nombre: string
  esPrincipal: boolean
  reservaId: string
}

export interface SeatMapDTO {
  viajeId: string
  busId: string
  capacidad: number
  rutaOrigen: string
  rutaDestino: string
  fechaSalida: string
  horaSalida: string
  asientos: SeatSlotDTO[]
  sinAsiento: PendienteAsientoDTO[]
}

export interface SalidaDTO {
  viajeId: string
  fechaSalida: string
  horaSalida: string
  horaLlegada: string
  precio: number
  asientosDisponibles: number
}

export interface CreatePasajeroGrupoItemDto {
  nombre: string
  email: string
  telefono: string
  documento: string
  esPrincipal: boolean
}

export interface CreateReservaDto {
  viajeId: string
  pasajeros: CreatePasajeroGrupoItemDto[]
  abonoInicial?: number
}

export interface ReservaPasajeroPrincipalDTO {
  id: string
  nombre: string
  email: string
  telefono: string
  documento: string
}

export interface ReservaDTO {
  id: string
  viajeId: string
  tourId: string | null
  cantidadPasajeros: number
  montoTotal: number
  abonado: number
  saldo: number
  estadoCuenta: EstadoCuenta
  pasajeroPrincipal: ReservaPasajeroPrincipalDTO | null
  createdAt: string
  updatedAt: string
}

export interface ConfiguracionDTO {
  nombreNegocio: string
  moneda: string
  emailContacto: string | null
  telefonoContacto: string | null
  porcentajeAbonoMinimo: number | null
  sobreNosotros: string | null
  terminosCondiciones: string | null
  contactoEventosNombre: string | null
  contactoEventosEmail: string | null
  contactoEventosTelefono: string | null
  seoTitulo: string | null
  seoDescripcion: string | null
  seoPalabrasClave: string | null
  updatedAt: string
}

export interface UpdateConfiguracionDto {
  nombreNegocio?: string
  moneda?: string
  emailContacto?: string | null
  telefonoContacto?: string | null
  porcentajeAbonoMinimo?: number | null
  sobreNosotros?: string | null
  terminosCondiciones?: string | null
  contactoEventosNombre?: string | null
  contactoEventosEmail?: string | null
  contactoEventosTelefono?: string | null
  seoTitulo?: string | null
  seoDescripcion?: string | null
  seoPalabrasClave?: string | null
}

/** Subconjunto de ConfiguracionDTO seguro para la landing pública (sin auth). */
export interface PublicConfiguracionDTO {
  nombreNegocio: string
  sobreNosotros: string | null
  terminosCondiciones: string | null
  contactoEventosNombre: string | null
  contactoEventosEmail: string | null
  contactoEventosTelefono: string | null
  seoTitulo: string | null
  seoDescripcion: string | null
  seoPalabrasClave: string | null
}

export interface TopTourDTO {
  tourId: string
  titulo: string
  reservas: number
  pasajeros: number
}

export interface MetricasDTO {
  toursActivos: number
  toursTotales: number
  viajesProgramados: number
  viajesTotales: number
  reservasTotales: number
  pasajerosTotales: number
  ingresosTotales: number
  saldoPendienteTotal: number
  ocupacionPromedio: number
  topTours: TopTourDTO[]
}

export const RolUsuario = {
  ADMIN: 'admin',
  OPERADOR: 'operador',
  PASAJERO: 'pasajero',
} as const
export type RolUsuario = (typeof RolUsuario)[keyof typeof RolUsuario]

export const EstadoUsuario = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
} as const
export type EstadoUsuario = (typeof EstadoUsuario)[keyof typeof EstadoUsuario]

export interface UsuarioDTO {
  id: string
  nombre: string
  email: string
  rol: RolUsuario
  estado: EstadoUsuario
  createdAt: string
  updatedAt: string
}

export interface CreateUsuarioDto {
  nombre: string
  email: string
  password: string
  rol: RolUsuario
}

export interface UpdateUsuarioDto {
  nombre?: string
  rol?: RolUsuario
  estado?: EstadoUsuario
  password?: string
}

export interface TourDTO {
  id: string
  titulo: string
  descripcion: string
  precio: number
  imagenUrl: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTourDto {
  titulo: string
  descripcion: string
  precio: number
  imagenUrl: string
}

export interface UpdateTourDto {
  titulo?: string
  descripcion?: string
  precio?: number
  imagenUrl?: string
}

export interface StoredImageDTO {
  name: string
  url: string
  size: number
  createdAt: string
}

/** Cuerpo uniforme de error que devuelve el backend (toHttpException). */
export interface ApiErrorBody {
  ok: false
  statusCode: number
  error: string
  message: string
}
