import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ShoppingBag,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react'
import { useSector, SectorId, SectorMockItem } from '@/context/SectorContext'
import {
  QuickPeekCard,
} from '@/components/ui'

type MockupSubView = 'mostrador' | 'catalogo' | 'ficha360'

const SECTOR_METRICS = {
  gastronomia: {
    primaryLabel: 'Facturación Turno',
    primaryValue: '$840.50',
    secondaryLabel: 'Comandas en KDS',
    secondaryValue: '6',
  },
  retail: {
    primaryLabel: 'Ventas Hoy',
    primaryValue: '$1,420.00',
    secondaryLabel: 'Unidades / Ticket',
    secondaryValue: '2.8',
  },
  farmacia: {
    primaryLabel: 'Caja Auditada',
    primaryValue: '$2,180.00',
    secondaryLabel: 'Recetas',
    secondaryValue: '48',
  },
  spa: {
    primaryLabel: 'Servicios Hoy',
    primaryValue: '$950.00',
    secondaryLabel: 'Ocupación Cabinas',
    secondaryValue: '85%',
  },
} as const

const SECTOR_ACTIVITY = {
  gastronomia: [
    { item: 'Mesa 4 • 2x Smash Burger + Papas', amount: '$28.50', status: 'En Cocina' },
    { item: 'Barra • Cerveza Artesanal', amount: '$6.00', status: 'Listo' },
  ],
  retail: [
    { item: 'Ticket #1042 • Hoodie Oversize L + Jeans 32', amount: '$84.00', status: 'Cobrado' },
  ],
  farmacia: [
    { item: 'Dispensación #512 • Amoxicilina 875mg + Suero', amount: '$22.10', status: 'Dispensado' },
  ],
  spa: [
    { item: 'Cabina 1 • Masaje Terapéutico 60 min', amount: '$65.00', status: 'En Sesión' },
  ],
} as const

function getDefaultTicketLines(sec: SectorId, items: SectorMockItem[]) {
  if (sec === 'gastronomia') {
    const item1 = items.find((it) => it.id === 'g-1') || items[0]
    const item2 = items.find((it) => it.id === 'g-2') || items[1] || items[0]
    return [
      { item: item1, cantidad: 2 }, // 2x Hamburguesa Trufada ($16 = $32)
      { item: item2, cantidad: 1 }, // 1x Papas Rústicas ($6.50)
    ]
  }
  if (sec === 'retail') {
    const item1 = items.find((it) => it.id === 'r-1') || items[0]
    const item2 = items.find((it) => it.id === 'r-2') || items[1] || items[0]
    return [
      { item: item1, cantidad: 1 }, // 1x Hoodie Oversize M ($52)
      { item: item2, cantidad: 1 }, // 1x Jeans Denim 32 ($42)
    ]
  }
  if (sec === 'farmacia') {
    const item1 = items.find((it) => it.id === 'f-1') || items[0]
    const item2 = items.find((it) => it.id === 'f-2') || items[1] || items[0]
    return [
      { item: item1, cantidad: 1 }, // 1x Amoxicilina 875mg ($14.80)
      { item: item2, cantidad: 1 }, // 1x Suero Rehidratante Oral ($7.30)
    ]
  }
  // spa
  const item1 = items.find((it) => it.id === 's-1') || items[0]
  return [
    { item: item1, cantidad: 1 }, // 1x Masaje Relajante 60min ($75)
  ]
}

export function PortalProductSimulator() {
  const {
    sector,
    setSector,
    vocabulario,
    tokens,
    mockItems,
    allSectors,
    playTactileClick,
  } = useSector()

  const [subView, setSubView] = useState<MockupSubView>('mostrador')
  const [ticketLines, setTicketLines] = useState<{ item: SectorMockItem; cantidad: number }[]>(() =>
    getDefaultTicketLines(sector, mockItems)
  )
  const [despachoExitoso, setDespachoExitoso] = useState<string | null>(null)

  // Sincronización reactiva inmediata al cambiar de sector
  useEffect(() => {
    setTicketLines(getDefaultTicketLines(sector, mockItems))
  }, [sector, mockItems])

  // Metadatos y etiquetas exactas del ticket según vertical
  const sectorOrderMeta = useMemo(() => {
    switch (sector) {
      case 'gastronomia':
        return {
          identificador: 'Mesa 4',
          estado: 'En Cocina',
          hora: '14:22',
          accion: 'Despachar KDS',
          badgeClass: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
        }
      case 'retail':
        return {
          identificador: 'Caja 1',
          estado: 'Cobrado',
          hora: '14:26',
          accion: 'Cobrar Mostrador',
          badgeClass: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
        }
      case 'farmacia':
        return {
          identificador: 'Mostrador A',
          estado: 'Dispensado',
          hora: '14:20',
          accion: 'Verificar Receta',
          badgeClass: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
        }
      case 'spa':
      default:
        return {
          identificador: 'Cabina Zen',
          estado: 'En Sesión',
          hora: '14:30',
          accion: 'Iniciar Sesión',
          badgeClass: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
        }
    }
  }, [sector])
  const metrics = SECTOR_METRICS[sector]
  const activity = SECTOR_ACTIVITY[sector]

  // Cálculos dinámicos de ticket en el mockup
  const subtotal = useMemo(() => {
    return ticketLines.reduce((acc, line) => acc + line.item.precio * line.cantidad, 0)
  }, [ticketLines])

  // Acciones en el ticket
  const agregarItem = (it: SectorMockItem) => {
    playTactileClick()
    setTicketLines((prev) => {
      const idx = prev.findIndex((l) => l.item.id === it.id)
      if (idx >= 0) {
        return prev.map((l, i) => (i === idx ? { ...l, cantidad: l.cantidad + 1 } : l))
      }
      return [...prev, { item: it, cantidad: 1 }]
    })
  }

  const cambiarCantidad = (itemId: string, delta: number) => {
    playTactileClick()
    setTicketLines((prev) =>
      prev
        .map((l) => (l.item.id === itemId ? { ...l, cantidad: l.cantidad + delta } : l))
        .filter((l) => l.cantidad > 0)
    )
  }

  const despacharMock = () => {
    if (ticketLines.length === 0) return
    const ordenId = `TK-${Math.floor(100 + Math.random() * 900)}`
    setDespachoExitoso(ordenId)
    setTimeout(() => {
      setDespachoExitoso(null)
      setTicketLines(getDefaultTicketLines(sector, mockItems))
    }, 1500)
  }

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* ── Encabezado de Sección ── */}
      <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider border border-zinc-200/80 dark:border-zinc-800">
          <Sparkles className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>Simulador Camaleónico en Tiempo Real</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
          Diseñado para el ritmo real de tu mostrador
        </h2>

        <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed">
          Sin capturas estáticas ni maquetas de humo. Haz clic en tu sector comercial y observa cómo la interfaz, los cálculos, el vocabulario y las reglas de inventario mutan instantáneamente.
        </p>

        {/* ── Selector sectorial sincronizado con el Hero ── */}
        <div className="pt-3 flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-x-auto max-w-full gap-1.5">
            {allSectors.map((s) => {
              const activo = s.id === sector
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    playTactileClick()
                    setSector(s.id as SectorId)
                  }}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer select-none ${
                    activo
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="text-base">{s.iconEmoji}</span>
                  <span>{s.nombre}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Ventana de Software Camaleónico (Estilo Linear / Apple Pro Sober) ── */}
      <div
        className={`relative rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 ${tokens.radiusClass}`}
      >
        {/* Barra de Título Superior de la Ventana */}
        <div className="px-5 py-3 bg-zinc-50 dark:bg-[#18181B] border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700 mx-2">|</span>
            <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-300 hidden sm:inline flex items-center gap-1.5">
              <span>sagitta.app/{sector}</span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-zinc-900 dark:text-white font-semibold">Terminal POS #04</span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{tokens.nombre}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              <span>En Línea ({sector === 'gastronomia' ? 'KDS' : sector === 'retail' ? 'Punto de Venta' : sector === 'farmacia' ? 'Dispensación' : 'Agenda'})</span>
            </span>
          </div>
        </div>

        {/* Selector de Vistas Internas del Simulador */}
        <div className="px-5 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playTactileClick()
                setSubView('mostrador')
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                subView === 'mostrador'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Mostrador & {vocabulario.singularUnidad}
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick()
                setSubView('catalogo')
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                subView === 'catalogo'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Catálogo de {vocabulario.item}s ({mockItems.length})
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick()
                setSubView('ficha360')
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                subView === 'ficha360'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Ficha Técnica & {vocabulario.stock.split('&')[0]}
            </button>
          </div>

          <Link
            to="/mostrador"
            className="text-xs font-semibold flex items-center gap-1 transition-colors text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shrink-0"
          >
            <span>Ver pantalla completa (/mostrador)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Contenido Dinámico de la Ventana según Sector y Sub-vista */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">

          {/* ── 3 Tarjetas KPI que Mutan en Vivo con el Sector ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-4 bg-zinc-50 dark:bg-[#18181B]/80 border border-zinc-200/80 dark:border-zinc-800/80 ${tokens.radiusClass}`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px]">{metrics.primaryLabel}</span>
                <TrendingUp className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">{metrics.primaryValue}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                <span>Indicador del día</span>
              </div>
            </div>

            <div
              className={`p-4 bg-zinc-50 dark:bg-[#18181B]/80 border border-zinc-200/80 dark:border-zinc-800/80 ${tokens.radiusClass}`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px]">{metrics.secondaryLabel}</span>
                <Clock className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">{metrics.secondaryValue}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                <span>Operación actual</span>
              </div>
            </div>

            <div
              className={`p-4 bg-zinc-50 dark:bg-[#18181B]/80 border border-zinc-200/80 dark:border-zinc-800/80 ${tokens.radiusClass}`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  {vocabulario.metricLabel3}
                </span>
                <AlertCircle className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                {sector === 'gastronomia'
                  ? '2 insumos bajo mín.'
                  : sector === 'retail'
                  ? 'Talla M agotándose'
                  : sector === 'farmacia'
                  ? 'Lote #LT-88 vence'
                  : '2 protocolos listos'}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                <span>Seguimiento de inventario</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/70 border-b border-zinc-200/80 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Actividad reciente</h3>
            </div>
            <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
              {activity.map((row) => (
                <div key={row.item} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_auto] gap-2 sm:gap-4 items-center px-4 py-3 text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{row.item}</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{row.amount}</span>
                  <span className="justify-self-start sm:justify-self-end rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">{row.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sub-vista 1: Mostrador / KDS Táctil ── */}
          {subView === 'mostrador' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ── PANEL DE TICKET EN CURSO (COLOCADO A LA IZQUIERDA: lg:col-span-5) ── */}
              <div
                className={`lg:col-span-5 order-first p-4 sm:p-5 bg-zinc-50/90 dark:bg-[#18181B] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xs ${tokens.radiusClass}`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800 mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                        {vocabulario.singularUnidad}: {sectorOrderMeta.identificador}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                        Hora: {sectorOrderMeta.hora}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${sectorOrderMeta.badgeClass}`}>
                    {sectorOrderMeta.estado}
                  </span>
                </div>

                {/* Líneas de Ticket Mutables en Tiempo Real */}
                <div className="space-y-2 mb-3 max-h-[170px] overflow-y-auto pr-1">
                  {ticketLines.map((line) => (
                    <div
                      key={line.item.id}
                      className="p-2.5 rounded-lg bg-white dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {line.item.nombre}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          ${line.item.precio.toFixed(2)} c/u
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(line.item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[10px] cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {line.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(line.item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[10px] cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="font-mono font-bold text-right text-zinc-900 dark:text-white min-w-[50px]">
                        ${(line.item.precio * line.cantidad).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desglose Financiero */}
                <div className="pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Base Imponible</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">
                      ${(subtotal * 0.84).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Impuestos (16% IVA)</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">
                      ${(subtotal * 0.16).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-zinc-200/80 dark:border-zinc-800 font-bold">
                    <span className="text-sm text-zinc-900 dark:text-white">Total del Ticket</span>
                    <span className="text-xl font-mono font-black text-zinc-900 dark:text-white">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botón Táctil de Despacho */}
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={despacharMock}
                    className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-50 shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    {sectorOrderMeta.accion}
                  </button>

                  {despachoExitoso && (
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs text-center font-semibold animate-fade-in flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                      <span>
                        {vocabulario.singularUnidad} {despachoExitoso} procesada correctamente.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CATÁLOGO RÁPIDO PARA AÑADIR (COLOCADO A LA DERECHA: lg:col-span-7) ── */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span>{vocabulario.item}s Populares</span>
                    <span className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                      Vista interactiva
                    </span>
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Clic para añadir a la comanda</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mockItems.slice(0, 4).map((it) => (
                    <div
                      key={it.id}
                      className={`p-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between transition-all hover:-translate-y-0.5 rounded-xl shadow-xs ${tokens.radiusClass}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                            {it.categoria}
                          </span>
                          <QuickPeekCard item={it} placement="top">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono font-bold cursor-help flex items-center gap-1 border border-zinc-200/60 dark:border-zinc-700">
                              <Eye className="w-2.5 h-2.5" />
                              {it.codigo}
                            </span>
                          </QuickPeekCard>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">{it.nombre}</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                          {it.stockOAtributo}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800 mt-2.5 flex items-center justify-between">
                        <span className="font-mono font-extrabold text-sm text-zinc-900 dark:text-white">
                          ${it.precio.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => agregarItem(it)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          Añadir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── Sub-vista 2: Catálogo Completo ── */}
          {subView === 'catalogo' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockItems.map((it) => (
                <div
                  key={it.id}
                  className={`p-4 bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex flex-col justify-between shadow-xs ${tokens.radiusClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <span className="font-mono uppercase">{it.categoria}</span>
                      <span className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                        {it.codigo}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1">{it.nombre}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{it.stockOAtributo}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 italic leading-snug">
                      {it.notaTecnica}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800 mt-3 flex items-center justify-between">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white text-base">
                      ${it.precio.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => agregarItem(it)}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Sub-vista 3: Ficha Técnica & Inventario Sectorial ── */}
          {subView === 'ficha360' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-900 dark:text-white uppercase text-[10px] tracking-wider block">
                  Reglas de Stock: {vocabulario.stock}
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {sector === 'gastronomia'
                    ? 'Descuento gramo a gramo por receta Bill of Materials (BOM). Alerta cuando la proteína o pan cae por debajo del stock de seguridad.'
                    : sector === 'retail'
                    ? 'Matriz multidimensional de tallas y colores. Trazabilidad por código de barras #PRD y lector láser Bluetooth.'
                    : sector === 'farmacia'
                    ? 'Trazabilidad estricta de lote y fecha de expiración. Bloqueo automático de dispensación si el lote está vencido.'
                    : 'Disponibilidad vinculada a cabinas físicas y consumo de insumos/aceites esenciales en el protocolo de la sesión.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-900 dark:text-white uppercase text-[10px] tracking-wider block">
                  Acción Principal: {sectorOrderMeta.accion}
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Diseñado para operadoras en cajeros de alta velocidad: tecla de atajo rápido, audio táctil mecánico y despacho con feedback háptico simulado.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-900 dark:text-white uppercase text-[10px] tracking-wider block">
                  Dispositivos Compatibles
                </span>
                <div className="space-y-1.5 text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Impresoras térmicas ESC/POS (58mm / 80mm)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pantallas táctiles KDS y tablets Android/iPad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                    <span>Operación offline PWA sin pérdida de datos</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
