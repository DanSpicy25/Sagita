import { NavLink } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useContext } from 'react'
import { AppContext } from '@/context/AppContext'
import { useAuth } from '@/hooks/useAuth'
import { useModules } from '@/hooks/useModules'
import { Button } from '@/components/ui'
import { MODULES, MODULE_CATEGORIES, MODULE_ICONS } from '@/config/modules'
import type { ModuleDefinition } from '@/types'
import { TenantSelector } from '@/components/crm'

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
        'fixed md:sticky top-16 left-0 z-20 h-[calc(100vh-4rem)] shrink-0 flex flex-col border-r border-border',
        'bg-surface text-text transition-[width,transform] duration-200 overflow-hidden',
        isOpen ? 'translate-x-0 w-60' : '-translate-x-full w-60 md:translate-x-0 md:w-[4.5rem]',
      ].join(' ')}
      aria-label="Navegación principal"
    >
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Selector de Sede para Dispositivos Móviles */}
        <div className="block md:hidden pb-3 border-b border-border">
          <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Sede Activa
          </p>
          <TenantSelector />
        </div>
        {activeCategories.map((cat) => {
          const categoryModules = visibleModules.filter((m) => m.category === cat.id)
          if (categoryModules.length === 0) return null

          return (
            <section key={cat.id}>
              {isOpen && (
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {cat.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {categoryModules.map((mod) => {
                  const Icon = MODULE_ICONS[mod.id]
                  const label = mod.termKey ? tTerm(mod.termKey, mod.label) : mod.label

                  return (
                    <NavLink
                      key={mod.id}
                      to={mod.route!}
                      title={isOpen ? undefined : label}
                      aria-label={isOpen ? undefined : label}
                      onClick={() => {
                        if (window.matchMedia('(max-width: 767px)').matches) {
                          app?.toggleSidebar()
                        }
                      }}
                      className={({ isActive }) => [
                        'min-h-9 flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors duration-150',
                        isOpen ? 'justify-start' : 'justify-center px-0',
                        isActive
                          ? isOpen
                            ? 'border-l-[3px] border-primary bg-primary-soft pl-[9px] font-semibold text-primary'
                            : 'bg-primary-soft font-semibold text-primary'
                          : 'text-text-muted hover:bg-secondary-soft hover:text-text',
                      ].join(' ')}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {isOpen && <span className="truncate text-xs">{label}</span>}
                    </NavLink>
                  )
                })}
              </div>
            </section>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => app?.toggleSidebar()}
          className="w-full justify-center"
          aria-label={isOpen ? 'Contraer menú' : 'Expandir menú'}
          title={isOpen ? 'Contraer menú' : 'Expandir menú'}
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-200 ${
              !isOpen ? 'rotate-180' : ''
            }`}
          />
          {isOpen && <span className="text-xs">Contraer menú</span>}
        </Button>
      </div>
    </aside>
  )
}
