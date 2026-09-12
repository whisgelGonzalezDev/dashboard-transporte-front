import { useRef, useState, type ChangeEvent } from 'react'
import { ApiError, uploadImage } from '../../lib/api'
import { Field, inputClass } from './Field'
import { Button } from './Button'
import { Modal } from './Modal'
import { ImageGallery } from './ImageGallery'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
}

export function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <Field label={label}>
      <div className="flex flex-col gap-2">
        {value && (
          <img
            src={value}
            alt=""
            className="h-32 w-full rounded-lg border border-navy-100 object-cover dark:border-white/10"
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden'
            }}
            onLoad={(e) => {
              e.currentTarget.style.visibility = 'visible'
            }}
          />
        )}
        <div className="flex gap-2">
          <input
            className={`${inputClass} flex-1`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… o sube un archivo"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Subiendo…' : 'Subir'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setGalleryOpen(true)}>
            Galería
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {error && <p className="text-xs text-crimson-600 dark:text-crimson-400">{error}</p>}
      </div>

      <Modal open={galleryOpen} title="Elegir imagen de la galería" onClose={() => setGalleryOpen(false)}>
        <ImageGallery
          mode="picker"
          onSelect={(url) => {
            onChange(url)
            setGalleryOpen(false)
          }}
        />
      </Modal>
    </Field>
  )
}
