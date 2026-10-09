import { NavLink } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { Drawer, Avatar, Badge, Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useModules } from '@/hooks/useModules'
import { MODULES, MODULE_CATEGORIES, MODULE_ICONS } from '@/config/modules'
import type { ModuleDefinition } from '@/types'
import { TenantSelector } from '@/components/crm'
import { SectorSelector } from './SectorSelector'

export interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { user, logout, hasPermission } = useAuth()
  const { isModuleEnabled, tTerm } = useModules()

  const visibleModules = MODULES.filter((mod: ModuleDefinition) => {
    if (!mod.route) return false
    if (!isModuleEnabled(mod.id)) return false
    if (mod.permission && !hasPermission(mod.permission)) return false
    return true
  })

  const activeCategories = MODULE_CATEGORIES.filter((cat) =>
    visibleModules.some((m) => m.category === cat.id)
  )

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="left"
      size="sm"
      title="Navegación"
      description="Menú completo de Sagitta"
      footer={
        <div className="w-full flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose()
              logout()
            }}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="text-danger hover:text-danger hover:bg-danger-soft"
          >
            Cerrar Sesión
          </Button>

          <NavLink
            to="/configuracion"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text rounded-md hover:bg-surface-subtle transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Ajustes</span>
          </NavLink>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* User Card Summary */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border-subtle">
          <Avatar
            src={user?.avatar}
            name={user?.nombre}
            size="md"
            status="online"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-text truncate leading-tight">
              {user?.nombre}
            </h4>
            <p className="text-[11px] text-text-muted truncate mt-0.5">
              {user?.email || 'Sesión activa'}
            </p>
            <div className="mt-1">
              <Badge variant="primary" size="sm">
                {user?.rol || 'Usuario'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Branch Context Switcher */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-1">
            Sede Activa
          </span>
          <div>
            <TenantSelector />
          </div>
        </div>

        {/* Global Sector Switcher (Camaleónico) */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-1">
            Sector Comercial
          </span>
          <div>
            <SectorSelector />
          </div>
        </div>

        {/* Categorized Navigation */}
        <div className="space-y-4 pt-2">
          {activeCategories.map((cat) => {
            const categoryModules = visibleModules.filter((m) => m.category === cat.id)
            if (categoryModules.length === 0) return null

            return (
              <section key={cat.id} className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-2 block">
                  {cat.label}
                </span>

                <div className="space-y-0.5">
                  {categoryModules.map((mod) => {
                    const Icon = MODULE_ICONS[mod.id]
                    const label = mod.termKey ? tTerm(mod.termKey, mod.label) : mod.label

                    return (
                      <NavLink
                        key={mod.id}
                        to={mod.route!}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-primary-soft text-primary font-semibold border-l-2 border-primary'
                              : 'text-text-muted hover:bg-surface-subtle hover:text-text'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </Drawer>
  )
}

