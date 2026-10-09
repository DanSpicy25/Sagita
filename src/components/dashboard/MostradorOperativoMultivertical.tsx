import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react'
import { useSector, SectorId, SectorMockItem, SectorMockOrder } from '@/context/SectorContext'
import {
  TactileButton,
  BioluminescentBadge,
  QuickPeekCard,
  StreakCounter,
  SkeletonMetric,
  SkeletonCard,
  SkeletonTable,
  SkeletonTransition,
} from '@/components/ui'

interface TicketLineItem {
  item: SectorMockItem
  cantidad: number
}

export function MostradorOperativoMultivertical() {
  const {
    sector,
    setSector,
    vocabulario,
    tokens,
    mockItems,
    mockOrders,
    allSectors,
    incrementStreak,
    playTactileClick,
  } = useSector()

  // Estados interactivos
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('todas')
  const [ticketLines, setTicketLines] = useState<TicketLineItem[]>([])
  const [ordersQueue, setOrdersQueue] = useState<SectorMockOrder[]>(() => mockOrders)
  const [activeTab, setActiveTab] = useState<'catalogo' | 'kds_cola'>('catalogo')
  const [simularCarga, setSimularCarga] = useState(false)
  const [despachoExitoso, setDespachoExitoso] = useState<string | null>(null)

  // Categorías únicas según el sector
  const categorias = useMemo(() => {
    const set = new Set(mockItems.map((i) => i.categoria))
    return ['todas', ...Array.from(set)]
  }, [mockItems])

  // Filtrado de items
  const itemsFiltrados = useMemo(() => {
    return mockItems.filter((it) => {
      const matchCat = selectedCategory === 'todas' || it.categoria === selectedCategory
      const matchSearch =
        searchTerm === '' ||
        it.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      return matchCat && matchSearch
    })
  }, [mockItems, selectedCategory, searchTerm])

  // Cálculos de ticket
  const subtotal = useMemo(() => {
    return ticketLines.reduce((acc, line) => acc + line.item.precio * line.cantidad, 0)
  }, [ticketLines])

  const impuestos = useMemo(() => subtotal * 0.16, [subtotal])
  const total = useMemo(() => subtotal + impuestos, [subtotal, impuestos])
  const cantidadTotalItems = useMemo(() => {
    return ticketLines.reduce((acc, line) => acc + line.cantidad, 0)
  }, [ticketLines])

  // Acciones sobre el ticket
  const agregarAlTicket = (item: SectorMockItem) => {
    playTactileClick()
    setTicketLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id)
      if (existing) {
        return prev.map((l) =>
          l.item.id === item.id ? { ...l, cantidad: l.cantidad + 1 } : l
        )
      }
      return [...prev, { item, cantidad: 1 }]
    })
  }

  const modificarCantidad = (itemId: string, delta: number) => {
    playTactileClick()
    setTicketLines((prev) => {
      return prev
        .map((l) => {
          if (l.item.id === itemId) {
            const nuevaCant = l.cantidad + delta
            return nuevaCant > 0 ? { ...l, cantidad: nuevaCant } : null
          }
          return l
        })
        .filter(Boolean) as TicketLineItem[]
    })
  }

  const eliminarLinea = (itemId: string) => {
    playTactileClick()
    setTicketLines((prev) => prev.filter((l) => l.item.id !== itemId))
  }

  const vaciarTicket = () => {
    playTactileClick()
    setTicketLines([])
  }

  // Despacho con efecto efervescente, sonido háptico e incremento de racha
  const ejecutarDespachoPrincipal = () => {
    if (ticketLines.length === 0) return

    // Generar nueva orden en cola
    const nuevaOrden: SectorMockOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      clienteOIdentificador: `${vocabulario.singularUnidad} #${Math.floor(100 + Math.random() * 900)}`,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: ticketLines.map((l) => ({
        nombre: l.item.nombre,
        cantidad: l.cantidad,
        precio: l.item.precio,
      })),
      total,
      estado: 'en_preparacion',
      tagOExtra: `Turno Activo • ${vocabulario.accionCompletar}`,
    }

    setOrdersQueue((prev) => [nuevaOrden, ...prev])
    incrementStreak()
    setDespachoExitoso(nuevaOrden.id)

    // Notificación transitoria
    setTimeout(() => {
      setDespachoExitoso(null)
      setTicketLines([])
    }, 1200)
  }

  // Actualizar estado en la cola activa
  const avanzarEstadoCola = (ordenId: string) => {
    playTactileClick()
    setOrdersQueue((prev) =>
      prev.map((o) => {
        if (o.id === ordenId) {
          const proxEstado: SectorMockOrder['estado'] =
            o.estado === 'en_cola'
              ? 'en_preparacion'
              : o.estado === 'en_preparacion'
              ? 'listo'
              : 'completado'
          return { ...o, estado: proxEstado }
        }
        return o
      })
    )
    incrementStreak()
  }

  // Alternar simulación de shimmer
  const toggleSimulacionShimmer = () => {
    playTactileClick()
    setSimularCarga(true)
    setTimeout(() => {
      setSimularCarga(false)
    }, 1400)
  }

  return (
    <div
      className="relative min-h-screen w-full bg-[#0A0A0C] text-neutral-100 transition-colors duration-300 selection:bg-amber-500/30 overflow-x-hidden font-sans"
      style={{
        background: `radial-gradient(ellipse 90% 60% at 50% -15%, ${tokens.accentGlow} 0%, rgba(10, 10, 12, 0.98) 75%)`,
      }}
    >
      {/* ─── Resplandor ambiental de sector ────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20 filter blur-3xl transition-opacity duration-700"
        style={{
          background: tokens.radialGlow,
        }}
        aria-hidden="true"
      />

      {/* ─── Barra Superior de Mando Multivertical (Sticky) ───────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/85 backdrop-blur-xl px-4 sm:px-6 py-3 transition-colors">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Identificación de Terminal & Sector Activo */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 border border-white/15 bg-white/[0.04] shadow-md text-xl ${tokens.radiusClass}`}
              style={{
                borderColor: tokens.accentBorder,
                boxShadow: `0 0 16px ${tokens.accentGlow}`,
              }}
            >
              {tokens.iconEmoji}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>Sagitta POS</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-normal bg-white/10 text-neutral-300 border border-white/10">
                    v3.4 Camaleónica
                  </span>
                </h1>
                <BioluminescentBadge
                  variant="sector"
                  size="sm"
                  label={tokens.nombre}
                />
              </div>
              <p className="text-xs text-neutral-400 truncate max-w-xs sm:max-w-md">
                Terminal POS #04 • Mostrador Principal • {tokens.tagline}
              </p>
            </div>
          </div>

          {/* Switcher de Industria Camaleónica en Vivo */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-md overflow-x-auto max-w-full">
            {allSectors.map((s) => {
              const isActive = s.id === sector
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    playTactileClick()
                    setSector(s.id as SectorId)
                  }}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${tokens.accentColor} 0%, ${tokens.accentHover} 100%)`,
                          boxShadow: `0 4px 14px ${tokens.accentGlow}`,
                        }
                      : {}
                  }
                >
                  <span className="text-sm">{s.iconEmoji}</span>
                  <span className="hidden sm:inline">{s.nombre.split('&')[0]}</span>
                </button>
              )
            })}
          </div>

          {/* Widgets de Barra Superior: Racha Diaria + Shimmer Simulator */}
          <div className="flex items-center gap-2.5 self-end md:self-center">
            {/* Widget de Racha Diaria */}
            <StreakCounter />

            {/* Botón Simular Shimmer Anti-Pulse */}
            <button
              type="button"
              onClick={toggleSimulacionShimmer}
              title="Simular carga de datos para apreciar skeletons con shimmer de cristal"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-all cursor-pointer select-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simularCarga ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden lg:inline">Probar Shimmer</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Contenedor Global Balanceado de 12 Columnas (max-w-[1720px]) ───────── */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ════════════════════════════════════════════════════════════════════════
              COLUMNA IZQUIERDA (8 COLUMNAS): FLUJO OPERATIVO Y CATÁLOGO / KDS
              ════════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-6">

            {/* ─── Fila 1: 3 KPIs con Vocabulario Dinámico Paramétrico ─────────── */}
            <SkeletonTransition
              isLoading={simularCarga}
              skeleton={
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SkeletonMetric />
                  <SkeletonMetric />
                  <SkeletonMetric />
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Métrica 1: Facturación / Ventas Hoy */}
                <div
                  className={`p-4.5 bg-neutral-900/60 border border-white/10 backdrop-blur-md transition-all duration-200 hover:border-white/20 ${tokens.radiusClass}`}
                  style={{
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.4)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      {vocabulario.metricLabel1}
                    </span>
                    <div
                      className="p-2 rounded-lg bg-white/[0.05]"
                      style={{ color: tokens.accentColor }}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono text-white tracking-tight mb-1">
                    $2,480.50
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span>↑ +14.2%</span>
                    <span className="text-neutral-400">vs turno anterior</span>
                  </div>
                </div>

                {/* Métrica 2: Unidades en Cola / KDS */}
                <div
                  className={`p-4.5 bg-neutral-900/60 border border-white/10 backdrop-blur-md transition-all duration-200 hover:border-white/20 ${tokens.radiusClass}`}
                  style={{
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.4)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      {vocabulario.metricLabel2}
                    </span>
                    <div className="p-2 rounded-lg bg-white/[0.05] text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono text-white tracking-tight mb-1">
                    {ordersQueue.filter((o) => o.estado !== 'completado').length} activas
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <span>Flujo continuo en tiempo real</span>
                  </div>
                </div>

                {/* Métrica 3: Stock Crítico / Lotes / Insumos */}
                <div
                  className={`p-4.5 bg-neutral-900/60 border border-white/10 backdrop-blur-md transition-all duration-200 hover:border-white/20 ${tokens.radiusClass}`}
                  style={{
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.4)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      {vocabulario.metricLabel3}
                    </span>
                    <div className="p-2 rounded-lg bg-white/[0.05] text-sky-400">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono text-white tracking-tight mb-1">
                    2 alertas
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <span className="text-sky-300 font-medium">Reorden sugerido</span>
                    <span>• {vocabulario.stock}</span>
                  </div>
                </div>
              </div>
            </SkeletonTransition>

            {/* ─── Pestañas Operativas (Catálogo vs KDS / Cola Activa) ─────────── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick()
                    setActiveTab('catalogo')
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                    activeTab === 'catalogo'
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Catálogo de {vocabulario.item}s</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10">
                    {mockItems.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick()
                    setActiveTab('kds_cola')
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                    activeTab === 'kds_cola'
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{vocabulario.cola}</span>
                  <span
                    className="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: tokens.accentSoft,
                      color: tokens.accentColor,
                    }}
                  >
                    {ordersQueue.length}
                  </span>
                </button>
              </div>

              {/* Barra de Búsqueda Rápida Táctil */}
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Buscar ${vocabulario.singularItem.toLowerCase()} o código...`}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-hidden focus:border-white/30 focus:bg-white/[0.08] transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* ─── VISTA 1: CATÁLOGO CON PEEK & HOVER DRAWER ──────────────────── */}
            {activeTab === 'catalogo' && (
              <div className="space-y-4">
                {/* Pastillas de filtro de categoría */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categorias.map((cat) => {
                    const isSelected = selectedCategory === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          playTactileClick()
                          setSelectedCategory(cat)
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all duration-150 cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'text-white border border-white/20 shadow-xs'
                            : 'bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-white/5'
                        }`}
                        style={
                          isSelected
                            ? {
                                background: tokens.accentSoft,
                                borderColor: tokens.accentBorder,
                                color: tokens.accentColor,
                              }
                            : {}
                        }
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>

                {/* Grid de Ítems / Productos con Skeletons Shimmer */}
                <SkeletonTransition
                  isLoading={simularCarga}
                  skeleton={
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  }
                >
                  {itemsFiltrados.length === 0 ? (
                    <div className="text-center py-16 border border-white/10 rounded-2xl bg-white/[0.02]">
                      <SlidersHorizontal className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-neutral-300">
                        No se encontraron {vocabulario.item.toLowerCase()}s
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Intenta con otro término de búsqueda o cambia la categoría activa.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {itemsFiltrados.map((item) => (
                        <div
                          key={item.id}
                          className={`group relative p-4 bg-neutral-900/50 border border-white/10 hover:border-white/25 backdrop-blur-md flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${tokens.radiusClass}`}
                          style={{
                            boxShadow: '0 6px 20px -4px rgba(0,0,0,0.5)',
                          }}
                        >
                          {/* Top: Categoría + Código con QuickPeekCard */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                                {item.categoria}
                              </span>
                              <QuickPeekCard item={item} placement="top">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-neutral-300 hover:text-white cursor-help">
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>{item.codigo}</span>
                                </span>
                              </QuickPeekCard>
                            </div>

                            {/* Nombre del ítem */}
                            <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors leading-snug">
                              {item.nombre}
                            </h3>

                            {/* Detalle específico de stock / receta / talla */}
                            <div className="mt-2 text-xs text-neutral-400 flex items-center justify-between">
                              <span className="truncate">
                                <strong className="text-neutral-300 font-medium">
                                  {vocabulario.stock.split('&')[0]}:
                                </strong>{' '}
                                {item.stockOAtributo}
                              </span>
                            </div>
                          </div>

                          {/* Footer: Precio + Botón Táctil de Agregar */}
                          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] text-neutral-400 uppercase font-mono block">
                                Precio
                              </span>
                              <span
                                className="text-lg font-black font-mono tracking-tight"
                                style={{ color: tokens.accentColor }}
                              >
                                ${item.precio.toFixed(2)}
                              </span>
                            </div>

                            {/* Botón Táctil Físico de Añadir */}
                            <TactileButton
                              variant="secondary"
                              size="sm"
                              icon={<Plus className="w-3.5 h-3.5" />}
                              onClick={() => agregarAlTicket(item)}
                              title={`Agregar ${item.nombre} a la comanda activa`}
                            >
                              Agregar
                            </TactileButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SkeletonTransition>
              </div>
            )}

            {/* ─── VISTA 2: KDS / COLA ACTIVA EN TIEMPO REAL ───────────────────── */}
            {activeTab === 'kds_cola' && (
              <SkeletonTransition
                isLoading={simularCarga}
                skeleton={<SkeletonTable rows={4} cols={4} />}
              >
                <div
                  className={`overflow-hidden border border-white/10 bg-neutral-900/40 backdrop-blur-md shadow-2xl ${tokens.radiusClass}`}
                >
                  <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{vocabulario.cola} en Tiempo Real</span>
                        <BioluminescentBadge
                          variant="sector"
                          size="sm"
                          label={`${ordersQueue.length} órdenes`}
                        />
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Despacha y actualiza el estado de cada {vocabulario.singularUnidad.toLowerCase()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOrdersQueue(mockOrders)}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Restablecer</span>
                    </button>
                  </div>

                  <div className="divide-y divide-white/10">
                    {ordersQueue.map((orden) => {
                      const badgeVariant =
                        orden.estado === 'en_cola'
                          ? 'cola'
                          : orden.estado === 'en_preparacion'
                          ? 'preparacion'
                          : orden.estado === 'listo'
                          ? 'listo'
                          : 'completado'

                      return (
                        <div
                          key={orden.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white text-sm">
                                {orden.clienteOIdentificador}
                              </span>
                              <span className="text-xs text-neutral-400 font-mono">
                                • {orden.hora}
                              </span>
                              <BioluminescentBadge
                                variant={badgeVariant}
                                size="sm"
                                label={orden.estado.replace('_', ' ').toUpperCase()}
                              />
                            </div>

                            <div className="text-xs text-neutral-300">
                              {orden.items
                                .map((i) => `${i.cantidad}x ${i.nombre}`)
                                .join(' + ')}
                            </div>

                            <div className="text-[11px] text-neutral-400 italic">
                              {orden.tagOExtra}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <span className="font-mono font-extrabold text-sm text-white">
                              ${orden.total.toFixed(2)}
                            </span>

                            {orden.estado !== 'completado' ? (
                              <TactileButton
                                variant="primary"
                                size="sm"
                                withEffervescent={true}
                                onClick={() => avanzarEstadoCola(orden.id)}
                              >
                                {orden.estado === 'listo'
                                  ? vocabulario.accionCompletar
                                  : 'Avanzar Estado'}
                              </TactileButton>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Finalizado</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </SkeletonTransition>
            )}

          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              COLUMNA DERECHA (4 COLUMNAS PEGAJOSAS): RESUMEN DE COBRA / TICKET
              ════════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">

            {/* Panel de Comanda / Ticket Activo */}
            <div
              className={`p-5 bg-neutral-900/80 border border-white/10 backdrop-blur-xl shadow-2xl transition-all ${tokens.radiusClass}`}
              style={{
                boxShadow: `0 16px 36px -6px rgba(0,0,0,0.7), 0 0 20px -4px ${tokens.accentGlow}`,
              }}
            >
              {/* Header del Ticket */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded-lg bg-white/[0.05]"
                    style={{ color: tokens.accentColor }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {vocabulario.singularUnidad} en Curso
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      {cantidadTotalItems} {vocabulario.singularItem.toLowerCase()}(s) añadidos
                    </p>
                  </div>
                </div>

                {ticketLines.length > 0 && (
                  <button
                    type="button"
                    onClick={vaciarTicket}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Vaciar ticket"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

              {/* Lista de Líneas de Ticket */}
              {ticketLines.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 space-y-2 border border-dashed border-white/10 rounded-xl my-4">
                  <ShoppingBag className="w-8 h-8 mx-auto text-neutral-600" />
                  <p className="text-xs font-semibold text-neutral-300">
                    Sin {vocabulario.item.toLowerCase()}s seleccionados
                  </p>
                  <p className="text-[11px] text-neutral-500 max-w-[200px] mx-auto">
                    Haz clic en "Agregar" en el catálogo o escanea para abrir la cuenta.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 my-4 scrollbar-thin">
                  {ticketLines.map((line) => (
                    <div
                      key={line.item.id}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2 hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {line.item.nombre}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          ${line.item.precio.toFixed(2)} c/u
                        </div>
                      </div>

                      {/* Selector de cantidad háptico */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => modificarCantidad(line.item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer active:scale-95 transition-all"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="w-6 text-center text-xs font-mono font-bold text-white">
                          {line.cantidad}
                        </span>

                        <button
                          type="button"
                          onClick={() => modificarCantidad(line.item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer active:scale-95 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => eliminarLinea(line.item.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-500 hover:text-rose-400 cursor-pointer ml-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total de la línea */}
                      <div className="text-right font-mono font-bold text-xs text-white min-w-[50px]">
                        ${(line.item.precio * line.cantidad).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totales y Liquidación */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal bruto</span>
                  <span className="font-mono text-neutral-200">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Impuestos (16%)</span>
                  <span className="font-mono text-neutral-200">
                    ${impuestos.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                  <span className="text-sm font-bold text-white">Total a Cobrar</span>
                  <span
                    className="text-2xl font-black font-mono tracking-tight"
                    style={{ color: tokens.accentColor }}
                  >
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botón Táctil Principal con Respuesta Física & Efecto Efervescente */}
              <div className="mt-5 space-y-2">
                <TactileButton
                  variant="primary"
                  size="xl"
                  fullWidth={true}
                  disabled={ticketLines.length === 0}
                  withEffervescent={true}
                  onClick={ejecutarDespachoPrincipal}
                  icon={<Sparkles className="w-5 h-5 text-amber-300" />}
                >
                  {vocabulario.accionPrincipal}
                </TactileButton>

                {despachoExitoso && (
                  <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-bold animate-fade-in flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      ¡{vocabulario.singularUnidad} {despachoExitoso} despachada con éxito! (+1 Racha)
                    </span>
                  </div>
                )}
              </div>

              {/* Resumen de atajos del cajero */}
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-neutral-500 flex justify-between font-mono">
                <span>Atajos: [Espacio] Cobrar</span>
                <span>[Esc] Limpiar</span>
              </div>
            </div>

            {/* Widget Mini de Monitor de Cocina / Mostrador Reciente */}
            <div
              className={`p-3.5 bg-neutral-900/50 border border-white/5 backdrop-blur-md ${tokens.radiusClass}`}
            >
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Última Operación Despachada</span>
                </span>
                <span className="font-mono text-[10px]">Hace 2 min</span>
              </div>
              <div className="text-xs text-neutral-200 font-mono">
                #ORD-8921 • $48.00 • Completado sin incidencias
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}

