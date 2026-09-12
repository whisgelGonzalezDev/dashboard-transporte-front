import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-navy-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}
