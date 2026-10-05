import React from 'react'

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string
}

export function Table({ className = '', wrapperClassName = '', children, ...props }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 ${wrapperClassName}`}>
      <table className={`w-full text-left text-sm text-slate-600 dark:text-slate-300 ${className}`} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800 ${className}`}
      {...props}
    >
      {children}
    </thead>
  )
}

export function TableBody({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-slate-100 dark:divide-slate-800 ${className}`} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ className = '', hover = true, children, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { hover?: boolean }) {
  return (
    <tr
      className={`transition-colors ${
        hover ? 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableHead({ className = '', children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-4 py-3 whitespace-nowrap ${className}`} {...props}>
      {children}
    </th>
  )
}

export function TableCell({ className = '', children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3 align-middle ${className}`} {...props}>
      {children}
    </td>
  )
}
