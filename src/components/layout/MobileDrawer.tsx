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
        <div className="flex items-center gap-3 p-3.5 rounded-[22px] bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]">
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
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted px-1">
            Sede Activa
          </span>
          <div>
            <TenantSelector />
          </div>
        </div>

        {/* Global Sector Switcher (Camaleónico) */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted px-1">
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
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted/80 dark:text-white/40 px-2 block">
                  {cat.label}
                </span>

                <div className="space-y-1">
                  {categoryModules.map((mod) => {
                    const Icon = MODULE_ICONS[mod.id]
                    const label = mod.termKey ? tTerm(mod.termKey, mod.label) : mod.label

                    return (
                      <NavLink
                        key={mod.id}
                        to={mod.route!}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium transition-all ios-press ${
                            isActive
                              ? 'bg-primary-soft text-primary font-semibold'
                              : 'text-text/75 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-text'
                          }`
                        }
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
                          <Icon className="w-4 h-4 shrink-0" />
                        </span>
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
