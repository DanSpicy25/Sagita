import {
  Sparkles,
  Calendar,
  Package,
  Printer,
  Store,
  Barcode,
  Laptop,
  Building2,
} from 'lucide-react'

export interface PortalHeroProps {
  tabPrincipal: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos'
  onSelectTab: (tab: 'reservas' | 'productos' | 'hardware' | 'verticales' | 'modulos') => void
}

export function PortalHero({ tabPrincipal, onSelectTab }: PortalHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-12 sm:py-20 border-b border-slate-100 dark:border-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Plataforma Comercial • PWA Táctil para Tablets & PC</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Punto de Venta, Gestión & Reservas para{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-indigo-600 to-emerald-600">
            Cualquier Negocio
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Desde <strong>puestos de comida rápida</strong> y <strong>minimarkets</strong> hasta <strong>salones de belleza</strong> y <strong>consultorios</strong>. Soporte para impresión térmica Bluetooth (ESC/POS 58mm/80mm), apertura de cajón, lectores de código de barras y códigos de producto <span className="font-mono font-bold text-primary-600 dark:text-primary-400">#PRD-XXXX</span>.
        </p>

        {/* Conmutador de modo / pestañas de la landing */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onSelectTab('modulos')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
              tabPrincipal === 'modulos'
                ? 'bg-purple-600 text-white ring-2 ring-purple-500/50'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-purple-400'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ver Todos los Módulos (18 Pantallas)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('reservas')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
              tabPrincipal === 'reservas'
                ? 'bg-primary-600 text-white ring-2 ring-primary-500/50'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-400'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Cita Online</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('productos')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
              tabPrincipal === 'productos'
                ? 'bg-blue-600 text-white ring-2 ring-blue-500/50'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catálogo de Productos (#PRD)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('hardware')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
              tabPrincipal === 'hardware'
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/50'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Terminal & Hardware POS</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('verticales')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
              tabPrincipal === 'verticales'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/50'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Soluciones por Negocio</span>
          </button>
        </div>

        {/* Mini badges de confianza comercial */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto text-left">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
            <Printer className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Impresión Bluetooth ESC/POS</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
            <Barcode className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Escáner HID y Códigos #PRD</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
            <Laptop className="w-4 h-4 text-blue-500 shrink-0" />
            <span>PWA Táctil para Tablets</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
            <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Multi-Sucursal & Marca Blanca</span>
          </div>
        </div>
      </div>
    </section>
  )
}
