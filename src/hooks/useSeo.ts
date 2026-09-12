import { useEffect } from 'react'

interface SeoOptions {
  title: string
  description?: string | null
  keywords?: string | null
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** SEO básico en cliente: título y meta tags por ruta (sin dependencias nuevas). */
export function useSeo({ title, description, keywords }: SeoOptions) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title
    upsertMeta('property', 'og:title', title)

    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
    }
    if (keywords) {
      upsertMeta('name', 'keywords', keywords)
    }

    return () => {
      document.title = previousTitle
    }
  }, [title, description, keywords])
}
