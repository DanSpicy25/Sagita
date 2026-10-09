import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Calcular rango de páginas visibles
  const getPages = () => {
    const pages: (number | string)[] = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  const pages = getPages()

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted py-3 ${className}`}
    >
      {totalItems !== undefined && (
        <div>
          Mostrando{' '}
          <span className="font-semibold text-text">
            {itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 1}
          </span>{' '}
          a{' '}
          <span className="font-semibold text-text">
            {itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : totalItems}
          </span>{' '}
          de{' '}
          <span className="font-semibold text-text">
            {totalItems}
          </span>{' '}
          registros
        </div>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Página anterior"
          className="p-1.5 rounded-lg border border-border text-text hover:bg-surface-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-text-muted select-none">
              …
            </span>
          ) : (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(Number(p))}
              aria-current={currentPage === p ? 'page' : undefined}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentPage === p
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'text-text hover:bg-surface-subtle border border-transparent'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Página siguiente"
          className="p-1.5 rounded-lg border border-border text-text hover:bg-surface-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
