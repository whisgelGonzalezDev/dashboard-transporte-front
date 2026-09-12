import axios, { type AxiosInstance } from 'axios'
import type { ApiErrorBody } from '../types'
import { clearSession, getToken } from './auth'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

/** Error tipado con el mensaje de negocio que devuelve el backend (DomainError). */
export class ApiError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.statusCode = body.statusCode
    this.code = body.error
  }
}

httpClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession()
      if (location.hash !== '#/login') {
        location.hash = '#/login'
      }
    }

    const body = error?.response?.data as ApiErrorBody | undefined
    if (body?.message) {
      return Promise.reject(new ApiError(body))
    }
    return Promise.reject(error)
  },
)

/** Wrapper delgado sobre axios para los recursos CRUD del dashboard. */
export const api = {
  get: <T>(path: string) => httpClient.get<T>(path).then((r) => r.data),
  post: <T>(path: string, data?: unknown) =>
    httpClient.post<T>(path, data).then((r) => r.data),
  put: <T>(path: string, data?: unknown) =>
    httpClient.put<T>(path, data).then((r) => r.data),
  patch: <T>(path: string, data?: unknown) =>
    httpClient.patch<T>(path, data).then((r) => r.data),
  delete: (path: string) => httpClient.delete(path).then(() => undefined),
}

/** Sube una imagen (multipart) y devuelve su URL pública en el bucket de Supabase. */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await httpClient.post<{ url: string }>('/uploads/image', formData, {
    // Content-Type: undefined deja que el navegador arme el multipart con su propio boundary.
    headers: { 'Content-Type': undefined },
  })
  return response.data.url
}
