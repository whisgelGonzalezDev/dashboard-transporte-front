import { useMemo } from 'react'
import { createResourceHooks } from '../../hooks/useResource'
import type { TourDTO } from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { ImageGallery } from '../../components/ui/ImageGallery'

const tourHooks = createResourceHooks<TourDTO, never, never>('tours')

export function GalleryAdminPage() {
  const { data: tours } = tourHooks.useList()

  const imagesInUse = useMemo(
    () => new Set((tours ?? []).map((t) => t.imagenUrl)),
    [tours],
  )

  return (
    <div>
      <PageHeader
        title="Galería"
        description="Imágenes ya subidas al bucket. Bórralas cuando ya no se usen; el tag «En uso» avisa si algún tour depende de ellas."
      />
      <ImageGallery mode="manage" imagesInUse={imagesInUse} />
    </div>
  )
}
