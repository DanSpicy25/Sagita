import { useContext } from 'react'
import { Menu, Sun, Moon, Search } from 'lucide-react'
import { AppContext } from '@/context/AppContext'
import { IconButton, StreakCounter } from '@/components/ui'
import { CentroNotificaciones } from '@/components/integraciones'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { TenantSelector } from '@/components/crm'
import { QuickActionsMenu } from './QuickActionsMenu'
import { UserProfileMenu } from './UserProfileMenu'
import { SectorSelector } from './SectorSelector'

export interface NavbarProps {
  onOpenCommand?: () => void
  onToggleMobileDrawer?: () => void
}

export function Navbar({ onOpenCommand, onToggleMobileDrawer }: NavbarProps) {
  const app = useContext(AppContext)
  const { configuracion, nombreMarca } = useConfiguracion()

  const toggleTheme = () => {
    if (!app) return
    app.setTheme(app.theme === 'dark' ? 'light' : 'dark')
  }

  const logoUrl =
    app?.theme === 'dark' && configuracion.logo_dark_url
      ? configuracion.logo_dark_url
      : configuracion.logo_url

  return (
    <header className="sticky top-0 z-header flex h-14 sm:h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface/95 text-text px-3 sm:px-5 backdrop-blur shadow-2xs">
      {/* ─── Left Section ─────────────────────────────────────────────────── */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Toggle para Sidebar Desktop / Drawer Mobile */}
        <IconButton
          icon={<Menu className="h-4 w-4 sm:h-5 sm:w-5 text-text" />}
          aria-label="Alternar menú de navegación"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.innerWidth < 768 && onToggleMobileDrawer) {
              onToggleMobileDrawer()
            } else {
              app?.toggleSidebar()
            }
          }}
        />

        {/* Brand Logo / Title */}
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={nombreMarca}
              className="h-7 sm:h-8 max-w-[100px] sm:max-w-[140px] shrink-0 object-contain"
            />
          ) : (
            <span className="truncate font-display text-lg sm:text-xl font-bold text-text">
              {nombreMarca}
            </span>
          )}
        </div>

        {/* Multi-Tenant Switcher (Desktop) */}
        <div className="hidden md:block pl-2 border-l border-border-subtle">
          <TenantSelector />
        </div>

        {/* Global Sector Switcher (Camaleónico) */}
        <div className="hidden md:block pl-2 border-l border-border-subtle">
          <SectorSelector />
        </div>
      </div>

      {/* ─── Center Section (Desktop Omnibar Search Trigger) ─────────────── */}
      <div className="flex-1 max-w-xs md:max-w-md mx-2 hidden sm:block">
        <button
          type="button"
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-text-muted bg-surface-subtle hover:bg-surface border border-border hover:border-border-hover rounded-lg transition-all shadow-2xs group cursor-pointer"
          title="Buscar clientes, productos #PRD, citas o acciones (Ctrl+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
            <span className="truncate">Buscar clientes, productos #PRD, citas...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-text-muted bg-surface border border-border rounded shadow-2xs shrink-0">
            <span className="text-[9px]">Ctrl</span> K
          </kbd>
        </button>
      </div>

      {/* ─── Right Section (Quick Actions, Notifications, Theme, User) ──── */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {/* Mobile Search Trigger */}
        <IconButton
          icon={<Search className="h-4 w-4 text-text" />}
          aria-label="Abrir buscador global"
          variant="ghost"
          size="sm"
          onClick={onOpenCommand}
          className="sm:hidden"
        />

        {/* Widget de Racha Diaria en Barra Superior */}
        <div className="hidden sm:block">
          <StreakCounter />
        </div>

        {/* Desktop Quick Actions Dropdown */}
        <QuickActionsMenu />

        {/* Centro de Notificaciones */}
        <CentroNotificaciones />

        {/* Selector de Tema */}
        <IconButton
          icon={app?.theme === 'dark' ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-text" />}
          aria-label={app?.theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
        />

        {/* Perfil de Usuario */}
        <div className="border-l border-border-subtle pl-1 sm:pl-2">
          <UserProfileMenu />
        </div>
      </div>
    </header>
  )
}
