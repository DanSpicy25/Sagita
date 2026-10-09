import { NavLink } from 'react-router-dom'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { useContext } from 'react'
import { AppContext } from '@/context/AppContext'
import { useAuth } from '@/hooks/useAuth'
import { useModules } from '@/hooks/useModules'
import { Tooltip } from '@/components/ui'
import { MODULES, MODULE_CATEGORIES, MODULE_ICONS } from '@/config/modules'
import type { ModuleDefinition } from '@/types'

export function Sidebar() {
  const app = useContext(AppContext)
  const { hasPermission } = useAuth()
  const { isModuleEnabled, tTerm } = useModules()
  const isOpen = app?.sidebarOpen ?? true

  // Módulos con ruta definida, activos en el tenant actual y con permiso de usuario
  const visibleModules = MODULES.filter((mod: ModuleDefinition) => {
    if (!mod.route) return false
    if (!isModuleEnabled(mod.id)) return false
    if (mod.permission && !hasPermission(mod.permission)) return false
    return true
  })

  // Categorías que tienen al menos un módulo visible
  const activeCategories = MODULE_CATEGORIES.filter((cat) =>
    visibleModules.some((m) => m.category === cat.id)
  )

  return (
    <aside
      className={[
        'hidden md:flex sticky top-14 sm:top-16 left-0 z-sticky h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-border',
        'bg-surface text-text transition-[width] duration-200 ease-in-out select-none',
        isOpen ? 'w-60' : 'w-[4.25rem]',
      ].join(' ')}
      aria-label="Navegación principal"
    >
      {/* Scrollable Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-4 scrollbar-none">
        {activeCategories.map((cat) => {
          const categoryModules = visibleModules.filter((m) => m.category === cat.id)
          if (categoryModules.length === 0) return null

          return (
            <section key={cat.id} className="space-y-1">
              {isOpen && (
                <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {cat.label}
                </p>
              )}

              <div className="flex flex-col gap-0.5">
                {categoryModules.map((mod) => {
                  const Icon = MODULE_ICONS[mod.id]
                  const label = mod.termKey ? tTerm(mod.termKey, mod.label) : mod.label

                  const linkElement = (
                    <NavLink
                      key={mod.id}
                      to={mod.route!}
                      aria-label={label}
                      className={({ isActive }) => [
                        'min-h-9 flex items-center gap-2.5 rounded-lg py-2 transition-all duration-150 cursor-pointer',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isOpen ? 'px-2.5' : 'justify-center px-0 w-10 mx-auto',
                        isActive
                          ? isOpen
                            ? 'border-l-[3px] border-primary bg-primary-soft pl-[7px] font-semibold text-primary shadow-2xs'
                            : 'bg-primary-soft font-semibold text-primary shadow-2xs'
                          : 'text-text-muted hover:bg-surface-subtle hover:text-text',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {isOpen && <span className="truncate text-xs">{label}</span>}
                    </NavLink>
                  )

                  if (!isOpen) {
                    return (
                      <Tooltip key={mod.id} content={label} position="right">
                        {linkElement}
                      </Tooltip>
                    )
                  }

                  return linkElement
                })}
              </div>
            </section>
          )
        })}
      </nav>

      {/* Mostrador POS Camaleónico */}
      <div className="px-2 py-1 border-t border-border-subtle">
        <NavLink
          to="/mostrador"
          className={[
            'w-full flex items-center py-2 rounded-lg text-amber-500 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer text-xs font-semibold',
            isOpen ? 'justify-start px-2.5 gap-2' : 'justify-center px-0 w-10 mx-auto',
          ].join(' ')}
          title="Terminal POS y Mostrador Multivertical Camaleónico"
        >
          <span className="text-sm shrink-0">⚡</span>
          {isOpen && <span className="truncate">Mostrador POS</span>}
        </NavLink>
      </div>

      {/* Demo Center Sales Link */}
      <div className="px-2 py-1.5 border-t border-border-subtle">
        <NavLink
          to="/demo"
          className={[
            'w-full flex items-center py-2 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer text-xs font-semibold',
            isOpen ? 'justify-start px-2.5 gap-2' : 'justify-center px-0 w-10 mx-auto',
          ].join(' ')}
          title="Demo Center Interactivo para Ventas"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
          {isOpen && <span className="truncate">Demo Center</span>}
        </NavLink>
      </div>

      {/* Collapse / Expand Toggle Footer */}
      <div className="border-t border-border-subtle p-2">
        <button
          type="button"
          onClick={() => app?.toggleSidebar()}
          className={[
            'w-full flex items-center py-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-subtle transition-colors cursor-pointer text-xs font-medium',
            isOpen ? 'justify-start px-2.5 gap-2' : 'justify-center',
          ].join(' ')}
          aria-label={isOpen ? 'Contraer menú lateral' : 'Expandir menú lateral'}
          title={isOpen ? 'Contraer menú lateral' : 'Expandir menú lateral'}
        >
          <ChevronLeft
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
              !isOpen ? 'rotate-180' : ''
            }`}
          />
          {isOpen && <span className="truncate">Contraer menú</span>}
        </button>
      </div>
    </aside>
  )
}
