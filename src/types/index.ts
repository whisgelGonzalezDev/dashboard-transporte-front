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
  viajeId: string
  montoTotal: number
  abonado: number
  saldo: number
  estadoCuenta: EstadoCuenta
  createdAt: string
  updatedAt: string
}

export interface RegisterPasajeroDto {
  nombre: string
  email: string
  telefono: string
  documento: string
  viajeId: string
  abonoInicial?: number
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

/** Cuerpo uniforme de error que devuelve el backend (toHttpException). */
export interface ApiErrorBody {
  ok: false
  statusCode: number
  error: string
  message: string
}
