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
        'hidden md:flex sticky top-0 z-sticky h-full min-h-0 shrink-0 flex-col border-r border-black/[0.06] dark:border-white/[0.08] bg-[#f8f8fa]/90 dark:bg-[#1c1c1e]/90 text-text dark:text-white backdrop-blur-xl transition-[width] duration-300 ease-out select-none',
        isOpen ? 'w-72' : 'w-[4.75rem]',
      ].join(' ')}
      aria-label="Navegación principal"
    >
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-4 scrollbar-none">
        {isOpen && (
          <div className="flex items-center gap-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] px-3.5 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted dark:text-white/45">Tu espacio</span>
              <span className="mt-0.5 block truncate text-xs font-semibold text-text dark:text-white">Gestión del negocio</span>
            </span>
          </div>
        )}
        {activeCategories.map((cat) => {
          const categoryModules = visibleModules.filter((m) => m.category === cat.id)
          if (categoryModules.length === 0) return null

          return (
            <section key={cat.id} className="space-y-1.5">
              {isOpen && (
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted/80 dark:text-white/40">
                  {cat.label}
                </p>
              )}

              <div className="flex flex-col gap-1">
                {categoryModules.map((mod) => {
                  const Icon = MODULE_ICONS[mod.id]
                  const label = mod.termKey ? tTerm(mod.termKey, mod.label) : mod.label

                  const linkElement = (
                    <NavLink
                      key={mod.id}
                      to={mod.route!}
                      aria-label={label}
                      className={({ isActive }) => [
                        'relative min-h-10 flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 ease-out cursor-pointer ios-press',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                        isOpen ? 'justify-start' : 'mx-auto w-10 justify-center px-0',
                        isActive
                          ? 'bg-primary-soft font-semibold text-primary dark:text-primary'
                          : 'text-text/75 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-text dark:hover:text-white',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {({ isActive }) => (
                        <>
                          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${isActive ? 'bg-primary text-white' : 'bg-black/[0.04] dark:bg-white/[0.06] text-text-muted dark:text-white/60'}`}>
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          </span>
                          {isOpen && <span className="truncate">{label}</span>}
                        </>
                      )}
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

      <div className="px-3 py-2 border-t border-black/[0.06] dark:border-white/[0.08]">
        <NavLink
          to="/mostrador"
          className={[
            'w-full min-h-10 flex items-center rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] py-2 text-primary transition-all duration-150 hover:bg-primary-soft ios-press cursor-pointer text-xs font-semibold',
            isOpen ? 'justify-start gap-2.5 px-3' : 'mx-auto w-10 justify-center px-0',
          ].join(' ')}
          title="Terminal POS y Mostrador Multivertical Camaleónico"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-sm">⚡</span>
          {isOpen && <span className="truncate">Mostrador POS</span>}
        </NavLink>
      </div>

      <div className="px-3 py-2 border-t border-black/[0.06] dark:border-white/[0.08]">
        <NavLink
          to="/demo"
          className={[
            'w-full min-h-10 flex items-center rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] py-2 text-success transition-all duration-150 hover:bg-success-soft ios-press cursor-pointer text-xs font-semibold',
            isOpen ? 'justify-start gap-2.5 px-3' : 'mx-auto w-10 justify-center px-0',
          ].join(' ')}
          title="Demo Center Interactivo para Ventas"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-success">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          {isOpen && <span className="truncate">Demo Center</span>}
        </NavLink>
      </div>

      <div className="border-t border-black/[0.06] dark:border-white/[0.08] p-3">
        <button
          type="button"
          onClick={() => app?.toggleSidebar()}
          className={[
            'w-full min-h-10 flex items-center rounded-2xl py-2 text-text-muted hover:text-text dark:text-white/60 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] ios-press cursor-pointer text-xs font-medium transition-colors',
            isOpen ? 'justify-start gap-2.5 px-3' : 'justify-center px-0',
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
