import { useContext } from 'react'
import { Menu, Sun, Moon, Search } from 'lucide-react'
import { AppContext } from '@/context/AppContext'
import { IconButton } from '@/components/ui'
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
    <header className="sticky top-0 z-header flex h-[4.25rem] sm:h-[4.75rem] shrink-0 items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-[#000000]/75 px-3.5 sm:px-6 backdrop-blur-2xl transition-colors">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
        <IconButton
          icon={<Menu className="h-5 w-5 text-text" />}
          aria-label="Alternar menú de navegación"
          variant="ghost"
          size="md"
          className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] shadow-xs ios-press hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
          onClick={() => {
            if (window.innerWidth < 768 && onToggleMobileDrawer) {
              onToggleMobileDrawer()
            } else {
              app?.toggleSidebar()
            }
          }}
        />

        <div className="flex items-center gap-2.5 sm:gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={nombreMarca}
              className="h-8 max-w-[120px] shrink-0 object-contain sm:h-10 sm:max-w-[150px]"
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-xs">
                S
              </div>
              <div className="min-w-0">
                <span className="block truncate font-heading text-lg font-bold tracking-tight text-text sm:text-xl">
                  {nombreMarca}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="hidden 2xl:block pl-3 border-l border-black/[0.06] dark:border-white/[0.08]">
          <TenantSelector />
        </div>

        <div className="hidden xl:block pl-3 border-l border-black/[0.06] dark:border-white/[0.08]">
          <SectorSelector />
        </div>
      </div>

      <div className="mx-3 hidden flex-1 max-w-xl md:max-w-2xl sm:block">
        <button
          type="button"
          onClick={onOpenCommand}
          className="group flex w-full items-center justify-between rounded-full border border-black/[0.06] dark:border-white/[0.1] bg-black/[0.035] dark:bg-white/[0.06] px-4 py-2 text-xs text-text-muted shadow-xs transition-all duration-200 hover:bg-black/[0.06] dark:hover:bg-white/[0.1] hover:border-black/[0.1] dark:hover:border-white/[0.15] ios-press cursor-pointer"
          title="Buscar clientes, productos #PRD, citas o acciones (⌘K)"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Search className="h-3.5 w-3.5" />
            </span>
            <span className="truncate font-medium text-text-muted transition-colors group-hover:text-text">
              Buscar clientes, productos #PRD, citas o acciones...
            </span>
          </div>
          <kbd className="hidden items-center gap-1 rounded-full border border-black/[0.06] dark:border-white/[0.1] bg-white/80 dark:bg-white/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-text-muted dark:text-white/70 shadow-xs lg:inline-flex">
            <span>⌘</span> K
          </kbd>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        <IconButton
          icon={<Search className="h-4 w-4 text-text" />}
          aria-label="Abrir buscador global"
          variant="ghost"
          size="md"
          onClick={onOpenCommand}
          className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] ios-press sm:hidden"
        />

        <div className="hidden sm:block">
          <QuickActionsMenu />
        </div>

        <CentroNotificaciones />

        <IconButton
          icon={app?.theme === 'dark' ? <Sun className="h-4 w-4 text-[#FF9500]" /> : <Moon className="h-4 w-4 text-text" />}
          aria-label={app?.theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          variant="ghost"
          size="md"
          className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] ios-press hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
          onClick={toggleTheme}
        />

        <div className="border-l border-black/[0.06] dark:border-white/[0.08] pl-2 sm:pl-3">
          <UserProfileMenu />
        </div>
      </div>
    </header>
  )
}
