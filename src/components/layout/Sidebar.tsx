import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Users,
  Briefcase,
  Receipt,
  Share2,
  Settings,
  Boxes,
  ChevronLeft,
  UserCog,
  ShoppingCart,
  Package,
  Shield,
  BarChart2,
} from 'lucide-react'
import { useContext } from 'react'
import { AppContext } from '@/context/AppContext'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui'
import { isFeatureEnabled, FeatureKey } from '@/config/features'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  group: string
  permission?: string
  feature?: FeatureKey
}

const navItems: NavItem[] = [
  { label: 'Dashboard',     to: '/dashboard',    group: 'Inicio',           icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Citas',         to: '/citas',         group: 'Operación',        icon: <CalendarDays className="w-5 h-5" />, permission: 'appointments.read', feature: 'appointments' },
  { label: 'Servicios',     to: '/servicios',     group: 'Operación',        icon: <Sparkles className="w-5 h-5" />, permission: 'services.read', feature: 'services' },
  { label: 'Empleados',     to: '/empleados',     group: 'Operación',        icon: <Briefcase className="w-5 h-5" />, permission: 'employees.read', feature: 'employees' },
  { label: 'Clientes',      to: '/clientes',      group: 'Operación',        icon: <Users className="w-5 h-5" />, permission: 'clients.read', feature: 'clients' },
  { label: 'Ventas',        to: '/ventas',        group: 'Gestión',          icon: <ShoppingCart className="w-5 h-5" />, permission: 'sales.read', feature: 'sales' },
  { label: 'Finanzas',      to: '/finanzas',      group: 'Gestión',          icon: <Receipt className="w-5 h-5" />, permission: 'sales.read', feature: 'billing' },
  { label: 'Inventario',    to: '/inventario',    group: 'Gestión',          icon: <Package className="w-5 h-5" />, permission: 'inventory.read', feature: 'inventory' },
  { label: 'Reportes',      to: '/reportes',      group: 'Gestión',          icon: <BarChart2 className="w-5 h-5" />, permission: 'reports.read', feature: 'reports' },
  { label: 'Usuarios',      to: '/usuarios',      group: 'Administración',  icon: <UserCog className="w-5 h-5" />, permission: 'users.manage' },
  { label: 'Roles',         to: '/roles',         group: 'Administración',  icon: <Shield className="w-5 h-5" />, permission: 'roles.manage', feature: 'roles' },
  { label: 'Integraciones', to: '/integraciones', group: 'Administración',  icon: <Share2 className="w-5 h-5" />, permission: 'settings.manage' },
  { label: 'CRM & API',     to: '/crm',           group: 'Administración',  icon: <Boxes className="w-5 h-5" />, permission: 'settings.manage', feature: 'crm' },
  { label: 'Ajustes',       to: '/ajustes',       group: 'Administración',  icon: <Settings className="w-5 h-5" />, permission: 'settings.manage', feature: 'settings' },
]

export function Sidebar() {
  const app = useContext(AppContext)
  const { hasPermission } = useAuth()
  const isOpen = app?.sidebarOpen ?? true

  const visibleNavItems = navItems.filter((item) => {
    if (item.feature && !isFeatureEnabled(item.feature)) return false
    if (item.permission && !hasPermission(item.permission)) return false
    return true
  })
  const groups = [...new Set(visibleNavItems.map((item) => item.group))]

  return (
    <aside
      className={[
        'fixed md:sticky top-16 left-0 z-20 h-[calc(100vh-4rem)] shrink-0 flex flex-col border-r border-border',
        'bg-surface text-text transition-[width,transform] duration-200 overflow-hidden',
        isOpen ? 'translate-x-0 w-60' : '-translate-x-full w-60 md:translate-x-0 md:w-[4.5rem]',
      ].join(' ')}
      aria-label="Navegación principal"
    >
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <section key={group} className="mb-5 last:mb-0">
            {isOpen && (
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {group}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {visibleNavItems.filter((item) => item.group === group).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={isOpen ? undefined : item.label}
                  aria-label={isOpen ? undefined : item.label}
                  onClick={() => {
                    if (window.matchMedia('(max-width: 767px)').matches) app?.toggleSidebar()
                  }}
                  className={({ isActive }) => [
                    'min-h-10 flex items-center gap-3 rounded-md px-3 py-2 transition-colors duration-150',
                    isOpen ? 'justify-start' : 'justify-center px-0',
                    isActive
                      ? isOpen
                        ? 'border-l-[3px] border-primary bg-primary-soft pl-[9px] font-semibold text-primary'
                        : 'bg-primary-soft font-semibold text-primary'
                      : 'text-text-muted hover:bg-secondary-soft hover:text-text',
                  ].join(' ')}
                >
                  {item.icon}
                  {isOpen && <span className="truncate text-[13px]">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => app?.toggleSidebar()}
          className="w-full justify-center"
          aria-label={isOpen ? 'Cerrar o contraer menú' : 'Abrir o expandir menú'}
          title={isOpen ? 'Cerrar o contraer menú' : 'Abrir o expandir menú'}
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-200 ${!isOpen ? 'rotate-180' : ''}`}
          />
          {isOpen && <span className="text-xs">Contraer menú</span>}
        </Button>
      </div>
    </aside>
  )
}
