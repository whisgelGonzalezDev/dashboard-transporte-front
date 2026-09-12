import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'
import type { StoredImageDTO } from '../../types'
import { ConfirmDialog } from './ConfirmDialog'
import { EmptyState, ErrorState, LoadingState } from './States'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface ImageGalleryProps {
  /** 'manage': borrar imágenes. 'picker': elegir una para usarla en un formulario. */
  mode: 'manage' | 'picker'
  onSelect?: (url: string) => void
  /** Imágenes que algún tour ya usa (para avisar antes de borrarlas). */
  imagesInUse?: Set<string>
}

export function ImageGallery({ mode, onSelect, imagesInUse }: ImageGalleryProps) {
  const queryClient = useQueryClient()
  const { data: images, isLoading, isError, refetch } = useQuery({
    queryKey: ['uploads', 'images'],
    queryFn: () => api.get<StoredImageDTO[]>('/uploads/images'),
  })

  const [deleting, setDeleting] = useState<StoredImageDTO | null>(null)

  const removeImage = useMutation({
    mutationFn: (name: string) => api.delete(`/uploads/images/${encodeURIComponent(name)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads', 'images'] })
      setDeleting(null)
    },
  })

  if (isLoading) return <LoadingState label="Cargando imágenes…" />
  if (isError) return <ErrorState message="No se pudieron cargar las imágenes." onRetry={() => refetch()} />
  if (!images || images.length === 0) {
    return <EmptyState message="Todavía no se ha subido ninguna imagen." />
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => {
          const enUso = imagesInUse?.has(image.url)
          return (
            <div
              key={image.name}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-navy-100 bg-white dark:border-white/10 dark:bg-navy-900"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-navy-100 dark:bg-navy-800">
                <img
                  src={image.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden'
                  }}
                />
                {enUso && (
                  <span className="font-label absolute left-2 top-2 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-gold-700 dark:bg-gold-500/15 dark:text-gold-300">
                    En uso
                  </span>
                )}
                {mode === 'picker' && (
                  <button
                    type="button"
                    onClick={() => onSelect?.(image.url)}
                    className="absolute inset-0 flex items-center justify-center bg-navy-900/0 text-sm font-semibold text-white opacity-0 transition-all hover:bg-navy-900/60 hover:opacity-100"
                  >
                    Usar esta imagen
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="text-xs text-navy-400">{formatSize(image.size)}</span>
                {mode === 'manage' && (
                  <button
                    type="button"
                    onClick={() => setDeleting(image)}
                    className="text-xs font-semibold text-crimson-600 hover:underline dark:text-crimson-400"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {removeImage.isError && (
        <p className="mt-3 text-sm text-crimson-600 dark:text-crimson-400">
          {removeImage.error instanceof ApiError
            ? removeImage.error.message
            : 'No se pudo eliminar la imagen.'}
        </p>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar imagen"
        message={
          deleting && imagesInUse?.has(deleting.url)
            ? 'Esta imagen está en uso por al menos un tour. Si la eliminas, ese tour se quedará sin imagen. ¿Continuar?'
            : '¿Seguro que quieres eliminar esta imagen? Esta acción no se puede deshacer.'
        }
        pending={removeImage.isPending}
        onConfirm={() => deleting && removeImage.mutate(deleting.name)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
