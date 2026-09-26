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
  permission?: string
  feature?: FeatureKey
}

const navItems: NavItem[] = [
  { label: 'Dashboard',     to: '/dashboard',     icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Citas',         to: '/citas',          icon: <CalendarDays    className="w-5 h-5" />, permission: 'appointments.read', feature: 'appointments' },
  { label: 'Servicios',     to: '/servicios',      icon: <Sparkles        className="w-5 h-5" />, permission: 'services.read',     feature: 'services' },
  { label: 'Empleados',     to: '/empleados',      icon: <Briefcase       className="w-5 h-5" />, permission: 'employees.read',    feature: 'employees' },
  { label: 'Clientes',      to: '/clientes',       icon: <Users           className="w-5 h-5" />, permission: 'clients.read',      feature: 'clients' },
  { label: 'Ventas',        to: '/ventas',         icon: <ShoppingCart    className="w-5 h-5" />, permission: 'sales.read',        feature: 'sales' },
  { label: 'Finanzas',      to: '/finanzas',       icon: <Receipt         className="w-5 h-5" />, permission: 'sales.read',        feature: 'billing' },
  { label: 'Inventario',    to: '/inventario',     icon: <Package         className="w-5 h-5" />, permission: 'inventory.read',    feature: 'inventory' },
  { label: 'Usuarios',      to: '/usuarios',       icon: <UserCog         className="w-5 h-5" />, permission: 'users.manage' },
  { label: 'Roles',         to: '/roles',          icon: <Shield          className="w-5 h-5" />, permission: 'roles.manage',      feature: 'roles' },
  { label: 'Reportes',      to: '/reportes',       icon: <BarChart2       className="w-5 h-5" />, permission: 'reports.read',      feature: 'reports' },
  { label: 'Integraciones', to: '/integraciones',  icon: <Share2          className="w-5 h-5" />, permission: 'settings.manage' },
  { label: 'CRM & API',     to: '/crm',            icon: <Boxes           className="w-5 h-5" />, permission: 'settings.manage',   feature: 'crm' },
  { label: 'Ajustes',       to: '/ajustes',        icon: <Settings        className="w-5 h-5" />, permission: 'settings.manage',   feature: 'settings' },
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

  return (
    <aside
      className={[
        'h-[calc(100vh-4rem)] sticky top-16 flex flex-col border-r border-slate-100 dark:border-slate-800',
        'bg-white dark:bg-slate-900 transition-all duration-300 overflow-hidden',
        isOpen ? 'w-60' : 'w-16',
      ].join(' ')}
    >
      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1 pt-4">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
              ].join(' ')}
          >
            {item.icon}
            {isOpen && (
              <span className="text-sm whitespace-nowrap overflow-hidden">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => app?.toggleSidebar()}
          className="w-full justify-center"
          aria-label={isOpen ? 'Colapsar menú' : 'Expandir menú'}
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`}
          />
          {isOpen && <span className="text-xs">Colapsar</span>}
        </Button>
      </div>
    </aside>
  )
}
