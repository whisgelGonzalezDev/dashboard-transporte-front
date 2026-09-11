import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

/**
 * Fábrica de hooks CRUD para un recurso REST plano (list/create/update/delete).
 * Los 5 recursos del dashboard (buses, viajes, pasajeros, usuarios, tours)
 * comparten esta misma forma, así que se define una sola vez.
 */
export function createResourceHooks<
  TEntity extends { id: string },
  TCreate,
  TUpdate,
>(resourcePath: string) {
  const queryKey = [resourcePath]

  function useList() {
    return useQuery({
      queryKey,
      queryFn: () => api.get<TEntity[]>(`/${resourcePath}`),
    })
  }

  function useCreate() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (dto: TCreate) => api.post<TEntity>(`/${resourcePath}`, dto),
      onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    })
  }

  function useUpdate() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: TUpdate }) =>
        api.put<TEntity>(`/${resourcePath}/${id}`, dto),
      onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    })
  }

  function useRemove() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => api.delete(`/${resourcePath}/${id}`),
      onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    })
  }

  function usePatch() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ id, action, body }: { id: string; action: string; body?: unknown }) =>
        api.patch<TEntity>(`/${resourcePath}/${id}/${action}`, body),
      onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    })
  }

  return { useList, useCreate, useUpdate, useRemove, usePatch, queryKey }
}
