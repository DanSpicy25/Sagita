import { Link } from 'react-router-dom'
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Printer,
  Clock,
  ShoppingCart,
} from 'lucide-react'
import { useSector } from '@/context/SectorContext'

export interface PortalCtaBannerProps {
  onIrAReservas: () => void
}

export function PortalCtaBanner({ onIrAReservas }: PortalCtaBannerProps) {
  const { sector } = useSector()

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-900/70 text-zinc-100 p-6 sm:p-10 border border-zinc-800 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 text-zinc-300 text-xs font-semibold uppercase tracking-wider border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>Una operación más clara</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Sagitta crece contigo y con tu negocio
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Organiza tus ventas, equipo, inventario y atención en una sola plataforma, con herramientas adaptadas a tu forma de trabajar.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onIrAReservas}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-zinc-100 text-zinc-900 font-medium text-sm shadow-sm hover:bg-white active:scale-[0.98] transition-all"
            >
              {sector === 'spa' ? <Calendar className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              <span>{sector === 'spa' ? 'Ver agenda y reservar' : 'Explorar catálogo'}</span>
              <ArrowRight className="w-4 h-4 opacity-70" />
            </button>

            <Link to="/demo" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium text-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span>Explorar Demos Interactivas</span>
              </button>
            </Link>
          </div>

          {/* Garantías y Certezas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 text-xs text-zinc-400 text-left border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
              <span>Control claro de tus operaciones</span>
            </div>
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-zinc-300 shrink-0" />
              <span>Compatible con tu impresora térmica actual</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-300 shrink-0" />
              <span>Puesta en marcha en menos de 5 minutos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
