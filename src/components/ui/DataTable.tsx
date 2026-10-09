import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table'
import { Skeleton } from './Skeleton'
import { Pagination } from './Pagination'
import { Checkbox } from './Checkbox'

export interface Column<T> {
  key: string
  header: React.ReactNode
  accessor?: (row: T) => React.ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T | ((row: T) => string | number)
  loading?: boolean
  emptyMessage?: React.ReactNode
  onRowClick?: (row: T) => void
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    totalItems?: number
    itemsPerPage?: number
  }
  hoverable?: boolean
  striped?: boolean
  dense?: boolean
  mobileCardRender?: (row: T, index: number) => React.ReactNode
  className?: string
  // Selección múltiple
  selectable?: boolean
  selectedKeys?: (string | number)[]
  onSelectionChange?: (keys: (string | number)[]) => void
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  loading = false,
  emptyMessage = 'No se encontraron registros.',
  onRowClick,
  pagination,
  hoverable = true,
  striped = false,
  dense = false,
  mobileCardRender,
  className = '',
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const getRowKey = (row: T, index: number): string | number => {
    if (typeof keyField === 'function') {
      return keyField(row)
    }
    return row[keyField] ?? index
  }

  // Ordenamiento básico si hay sortKey
  const sortedData = React.useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const valA = a[sortKey]
      const valB = b[sortKey]
      if (valA === valB) return 0
      if (valA == null) return 1
      if (valB == null) return -1
      const comparison = valA < valB ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortKey, sortDirection])

  const allKeys = React.useMemo(() => {
    return sortedData.map((row, idx) => getRowKey(row, idx))
  }, [sortedData, keyField])

  const isAllSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.includes(k))
  const isSomeSelected = allKeys.some((k) => selectedKeys.includes(k)) && !isAllSelected

  const toggleSelectAll = () => {
    if (!onSelectionChange) return
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(allKeys)
    }
  }

  const toggleSelectRow = (e: React.MouseEvent, key: string | number) => {
    e.stopPropagation()
    if (!onSelectionChange) return
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key))
    } else {
      onSelectionChange([...selectedKeys, key])
    }
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const totalColumns = columns.length + (selectable ? 1 : 0)

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Mobile Card View (cuando se proporcione mobileCardRender) */}
      {mobileCardRender && (
        <div className="block sm:hidden space-y-2.5">
          {loading ? (
            <div className="space-y-3">
              <Skeleton variant="card" count={3} />
            </div>
          ) : sortedData.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm bg-surface rounded-xl border border-border">
              {emptyMessage}
            </div>
          ) : (
            sortedData.map((row, index) => {
              const rowKey = getRowKey(row, index)
              const isSelected = selectedKeys.includes(rowKey)

              return (
                <div
                  key={rowKey}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    'relative transition-all',
                    onRowClick ? 'cursor-pointer' : '',
                    isSelected ? 'ring-2 ring-primary rounded-xl' : '',
                  ].join(' ')}
                >
                  {selectable && (
                    <div
                      className="absolute top-2.5 right-2.5 z-10"
                      onClick={(e) => toggleSelectRow(e, rowKey)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}}
                        aria-label="Seleccionar fila"
                      />
                    </div>
                  )}
                  {mobileCardRender(row, index)}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Desktop / Standard Table */}
      <div className={mobileCardRender ? 'hidden sm:block' : 'block'}>
        <Table dense={dense} striped={striped}>
          <TableHeader>
            <tr>
              {selectable && (
                <TableHead className="w-10 px-3 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onChange={toggleSelectAll}
                      aria-label="Seleccionar todos los registros"
                    />
                  </div>
                </TableHead>
              )}

              {columns.map((col) => {
                const isSorted = sortKey === col.key
                return (
                  <TableHead
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={[
                      alignClasses[col.align || 'left'],
                      col.sortable ? 'cursor-pointer select-none hover:text-text' : '',
                      col.className,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-text-muted shrink-0">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-primary" />
                            )
                          ) : (
                            <div className="w-3.5 h-3.5 opacity-30">↕</div>
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <TableRow key={`skeleton-row-${rIdx}`} hover={false}>
                  {Array.from({ length: totalColumns }).map((_, cIdx) => (
                    <TableCell key={`skeleton-cell-${cIdx}`}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sortedData.length === 0 ? (
              <TableRow hover={false}>
                <TableCell
                  colSpan={totalColumns}
                  className="py-12 text-center text-text-muted text-sm"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => {
                const rowKey = getRowKey(row, index)
                const isSelected = selectedKeys.includes(rowKey)

                return (
                  <TableRow
                    key={rowKey}
                    hover={hoverable}
                    onClick={() => onRowClick?.(row)}
                    className={[
                      onRowClick ? 'cursor-pointer' : '',
                      isSelected ? 'bg-primary-soft/40' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {selectable && (
                      <TableCell
                        className="w-10 px-3 text-center"
                        onClick={(e) => toggleSelectRow(e, rowKey)}
                      >
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => {}}
                            aria-label={`Seleccionar fila ${rowKey}`}
                          />
                        </div>
                      </TableCell>
                    )}

                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={[alignClasses[col.align || 'left'], col.className]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {col.accessor
                          ? col.accessor(row)
                          : (row[col.key] as React.ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Integration */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
        />
      )}
    </div>
  )
}
