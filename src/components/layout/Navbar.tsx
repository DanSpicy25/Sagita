import { useContext } from 'react'
import { Menu, Sun, Moon, LogOut, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AppContext } from '@/context/AppContext'
import { Button } from '@/components/ui'
import { CentroNotificaciones } from '@/components/integraciones'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { TenantSelector } from '@/components/crm'

export function Navbar() {
  const { user, logout } = useAuth()
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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface/95 text-text px-2 backdrop-blur sm:px-5">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
        <Button variant="ghost" size="sm" onClick={() => app?.toggleSidebar()} aria-label="Alternar menú lateral" title="Alternar menú lateral" className="h-8 w-8 shrink-0 p-0 sm:h-9 sm:w-9">
          <Menu className="h-5 w-5 text-text" />
        </Button>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={nombreMarca}
            className="h-8 max-w-[92px] shrink-0 object-contain sm:max-w-[140px]"
          />
        ) : (
          <span className="max-w-[100px] truncate font-display text-xl text-primary sm:max-w-[180px]">
            {nombreMarca}
          </span>
        )}

        {/* Multi-Tenant Switcher */}
        <div className="hidden md:block pl-2 border-l border-border">
          <TenantSelector />
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
        {/* Notificaciones */}
        <CentroNotificaciones />

        {/* Tema */}
        <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Cambiar tema" title="Cambiar tema" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
          {app?.theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Usuario */}
        <div className="ml-0 flex items-center gap-1 border-l border-border pl-1 sm:ml-1 sm:gap-2 sm:pl-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft ring-1 ring-primary/20 sm:h-8 sm:w-8">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.nombre} className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-tight">{user?.nombre}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.rol}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

