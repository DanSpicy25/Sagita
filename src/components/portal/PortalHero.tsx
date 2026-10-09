import { useNavigate } from 'react-router-dom'
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  Flower2,
  LayoutDashboard,
  Package,
  Pill,
  Shirt,
  Store,
  Utensils,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useSector, SectorId } from '@/context/SectorContext'

export interface PortalHeroProps {
  onSelectTab: (tab: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos') => void
  simboloMoneda: string
}

const SECTOR_LABELS: Record<SectorId, string> = {
  gastronomia: 'Gastronomía',
  retail: 'Retail y moda',
  farmacia: 'Farmacia',
  spa: 'Bienestar',
}

const SECTOR_ICONS = {
  gastronomia: Utensils,
  retail: Shirt,
  farmacia: Pill,
  spa: Flower2,
}

export function PortalHero({ onSelectTab, simboloMoneda }: PortalHeroProps) {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const { toast } = useToast()
  const { sector, setSector, allSectors, tokens, mockItems, playTactileClick } = useSector()

  const handleEntrarAdmin = async () => {
    if (isAuthenticated) {
      navigate('/dashboard')
      return
    }

    try {
      await login({ email: 'supremo@demo.app', password: 'Supremo123!' })
      toast.success('Acceso autorizado', 'Abriendo el panel de demostración')
      navigate('/dashboard')
    } catch {
      navigate('/login')
    }
  }

  const handleVerCatalogo = () => {
    onSelectTab('productos')
    window.setTimeout(() => {
      document.getElementById('catalogo')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)
  }

  const handleSeleccionarSector = (id: SectorId, playSound = false) => {
    setSector(id)
    if (playSound) playTactileClick()
  }

  return (
    <>
      <section className="border-b border-[#d9d3c7] bg-[#f2efe8] dark:border-zinc-800 dark:bg-[#171815]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.94fr_1.06fr] lg:gap-12 lg:px-8">
          <div className="space-y-6 lg:py-4">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#76613b] dark:text-[#c4aa74]">
              <span className="h-2 w-2 rounded-full bg-[#73816b]" />
              Gestión hecha para negocios reales
            </p>

            <div className="space-y-4">
              <h1 className="max-w-2xl font-heading text-4xl font-bold leading-[1.08] tracking-tight text-[#252722] dark:text-zinc-100 sm:text-5xl lg:text-[3.55rem]">
                Tu negocio merece orden, no más trabajo.
              </h1>
              <p className="max-w-xl text-base leading-7 text-[#64645d] dark:text-zinc-400 sm:text-lg">
                Organiza ventas, productos, equipo y atención desde un solo lugar. Sagitta se adapta a cómo funciona tu negocio.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleEntrarAdmin}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#806331] px-5 text-sm font-bold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#6d5329] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] focus-visible:ring-offset-2 active:translate-y-0 dark:bg-[#b99a5c] dark:text-[#211d15] dark:hover:bg-[#c8aa6a]"
              >
                <LayoutDashboard className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                <span>{isAuthenticated ? 'Entrar al panel' : 'Entrar al panel demo'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleVerCatalogo}
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#4f504a] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#e7e2d8] hover:text-[#252722] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] focus-visible:ring-offset-2 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <Package className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
                <span>Ver catálogo</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#d9d3c7] pt-4 text-xs font-medium text-[#68685f] dark:border-zinc-700 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#6d8064]" />Ventas y cobros</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#6d8064]" />Inventario</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#6d8064]" />Equipo y agenda</span>
            </div>
          </div>

          <div
            id="sector-preview"
            role="tabpanel"
            tabIndex={0}
            aria-label={`Vista previa del panel para ${tokens.nombre}`}
            className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806331] lg:translate-y-7"
          >
            <div className="overflow-hidden rounded-xl border border-[#cfc8ba] bg-[#fbfaf7] shadow-[0_12px_28px_-20px_rgba(35,33,27,0.55)] dark:border-zinc-700 dark:bg-[#20211e]">
              <div className="flex items-center justify-between border-b border-[#e2ddd3] px-4 py-3 dark:border-zinc-700">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8e0cf] text-[#70592e] dark:bg-[#b99a5c]/15 dark:text-[#cbb47e]">
                    <Store className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#292a25] dark:text-zinc-100">Vista previa del panel</p>
                    <p className="text-[10px] text-[#77766e] dark:text-zinc-400">Así se organiza tu operación</p>
                  </div>
                </div>
                <span className="rounded-md bg-[#e9e6dd] px-2 py-1 text-[10px] font-semibold text-[#66645c] dark:bg-zinc-700 dark:text-zinc-300">
                  DEMO
                </span>
              </div>

              <div className="grid min-h-[17rem] sm:grid-cols-[7.5rem_1fr]">
                <aside className="hidden border-r border-[#e2ddd3] bg-[#f3f0e9] p-3 dark:border-zinc-700 dark:bg-[#1a1b18] sm:block">
                  <p className="mb-3 px-2 text-[9px] font-bold uppercase tracking-wider text-[#8a887f]">Operación</p>
                  <div className="space-y-1 text-[10px] font-semibold">
                    <div className="flex items-center gap-2 rounded-md bg-[#e6dfd0] px-2 py-2 text-[#4f432d] dark:bg-[#b99a5c]/15 dark:text-[#d0bb8a]">
                      <LayoutDashboard className="h-3.5 w-3.5" /> Panel
                    </div>
                    <div className="flex items-center gap-2 rounded-md px-2 py-2 text-[#77766e] dark:text-zinc-400">
                      <Store className="h-3.5 w-3.5" /> Ventas
                    </div>
                    <div className="flex items-center gap-2 rounded-md px-2 py-2 text-[#77766e] dark:text-zinc-400">
                      <Package className="h-3.5 w-3.5" /> Productos
                    </div>
                    <div className="flex items-center gap-2 rounded-md px-2 py-2 text-[#77766e] dark:text-zinc-400">
                      <CalendarDays className="h-3.5 w-3.5" /> Agenda
                    </div>
                  </div>
                </aside>

                <div className="min-w-0 p-4 sm:p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#858278]">Catálogo de muestra</p>
                      <h2 className="mt-1 text-base font-bold text-[#292a25] dark:text-zinc-100">
                        {tokens.nombre}
                      </h2>
                    </div>
                    <span className="rounded-md bg-[#e7ede4] px-2 py-1 text-[10px] font-semibold text-[#4c6348] dark:bg-[#73816b]/20 dark:text-[#bdcfb5]">
                      {mockItems.length} artículos
                    </span>
                  </div>

                  <div className="space-y-2">
                    {mockItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e8e4dc] py-2.5 last:border-0 dark:border-zinc-700"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e9e5dc] text-[#70684f] dark:bg-zinc-700 dark:text-zinc-300">
                          <Package className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-[#33342e] dark:text-zinc-100">{item.nombre}</span>
                          <span className="mt-0.5 block truncate text-[10px] text-[#828077] dark:text-zinc-400">{item.categoria} · {item.codigo}</span>
                        </span>
                        <span className="whitespace-nowrap text-xs font-bold text-[#45443e] dark:text-zinc-200">
                          {simboloMoneda}{item.precio.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#e2ddd3] pt-3 text-[10px] dark:border-zinc-700">
                    <span className="truncate text-[#77766e] dark:text-zinc-400">
                      Existencias y precios en una sola vista
                    </span>
                    <span className="shrink-0 font-semibold text-[#6d8064] dark:text-[#a9bd9f]">Sector activo</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-right text-[10px] font-medium text-[#77766e] dark:text-zinc-500">
              Ejemplo ilustrativo · la vista cambia según tu sector
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pb-1 pt-1 text-xs font-medium text-[#77766e] dark:text-zinc-400">
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
          <span>Desplázate para descubrir todo lo que puedes gestionar</span>
        </div>
      </section>

      <section
        id="sectores"
        aria-label="Sectores disponibles"
        className="border-b border-[#d3cbbd] bg-[#e8e4da] dark:border-zinc-800 dark:bg-[#20211e]"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="shrink-0">
            <p className="text-xs font-bold text-[#36372f] dark:text-zinc-100">Hecho para distintos tipos de negocio</p>
            <p className="mt-1 text-[11px] text-[#77766e] dark:text-zinc-400">Elige un sector y mira cómo se adapta Sagitta</p>
          </div>
          <div
            role="tablist"
            aria-label="Seleccionar sector del negocio"
            className="flex max-w-full gap-1 overflow-x-auto border-b border-[#cbc3b4] dark:border-zinc-700"
          >
            {allSectors.map((item) => {
              const id = item.id as SectorId
              const isSelected = sector === id
              const SectorIcon = SECTOR_ICONS[id]
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="sector-preview"
                  onMouseEnter={() => handleSeleccionarSector(id)}
                  onFocus={() => handleSeleccionarSector(id)}
                  onClick={() => handleSeleccionarSector(id, true)}
                  className={[
                    'inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-xs font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#806331]',
                    isSelected
                      ? 'border-[#806331] text-[#5f4924] dark:border-[#c6a664] dark:text-[#e0c88e]'
                      : 'border-transparent text-[#696960] hover:-translate-y-0.5 hover:text-[#30312c] dark:text-zinc-400 dark:hover:text-zinc-100',
                  ].join(' ')}
                >
                  <SectorIcon className="h-4 w-4" aria-hidden="true" />
                  <span>{SECTOR_LABELS[id]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
