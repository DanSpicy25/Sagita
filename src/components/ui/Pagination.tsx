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
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 py-3 ${className}`}
    >
      {totalItems !== undefined && (
        <div>
          Mostrando{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 1}
          </span>{' '}
          a{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : totalItems}
          </span>{' '}
          de{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
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
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(Number(p))}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                currentPage === p
                  ? 'bg-primary-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
