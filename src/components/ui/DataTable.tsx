import type { ReactNode } from 'react'

export interface Column<T> {
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  getRowKey: (row: T) => string
  actions?: (row: T) => ReactNode
}

export function DataTable<T>({ rows, columns, getRowKey, actions }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="font-label border-b border-navy-100 bg-navy-50 text-xs font-semibold uppercase tracking-wide text-navy-400">
            {columns.map((col) => (
              <th key={col.header} className={`px-4 py-3 ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-navy-50 last:border-0 hover:bg-navy-50/60">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 text-navy-700 ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">{actions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
