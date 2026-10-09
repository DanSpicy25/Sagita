import React from 'react'

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string
  dense?: boolean
  striped?: boolean
}

export function Table({
  className = '',
  wrapperClassName = '',
  children,
  dense = false,
  striped = false,
  ...props
}: TableProps) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-border bg-surface ${wrapperClassName}`}>
      <table
        className={[
          'w-full text-left text-sm text-text',
          dense ? 'table-dense' : '',
          striped ? 'table-striped' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`bg-surface-subtle text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border ${className}`}
      {...props}
    >
      {children}
    </thead>
  )
}

export function TableBody({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-border-subtle ${className}`} {...props}>
      {children}
    </tbody>
  )
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hover?: boolean
  selected?: boolean
}

export function TableRow({
  className = '',
  hover = true,
  selected = false,
  children,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={[
        'transition-colors duration-100',
        hover ? 'hover:bg-surface-subtle/70' : '',
        selected ? 'bg-primary-soft/50' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableHead({
  className = '',
  children,
  scope = 'col',
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={`px-4 py-3 whitespace-nowrap text-text-muted font-semibold align-middle ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ className = '', children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3 align-middle text-text ${className}`} {...props}>
      {children}
    </td>
  )
}

export function TableCaption({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption className={`p-2 text-xs text-text-muted italic caption-bottom ${className}`} {...props}>
      {children}
    </caption>
  )
}
