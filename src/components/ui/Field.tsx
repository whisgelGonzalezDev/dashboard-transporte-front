import type { ReactNode } from 'react'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-navy-700">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-800 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100'
