import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Calendar,
  ShoppingCart,
  Users,
  Package,
  Printer,
  Settings,
  BarChart2,
  Briefcase,
  DoorOpen,
  Receipt,
  Blocks,
  PlusCircle,
  Clock,
  Sparkles,
  Workflow,
  Share2,
  X,
  Star,
  History,
  Trash2,
} from 'lucide-react'
import { clientesService } from '@/services/clientes.service'
import { inventarioService } from '@/services/inventario.service'
import { citasService } from '@/services/citas.service'
import { Cliente, Producto, Cita } from '@/types'
import { Badge, IconButton } from '@/components/ui'
import { useRole } from '@/hooks/useRole'

interface CommandItem {
  id: string
  titulo: string
  subtitulo?: string
  categoria: 'Favoritos' | 'Recientes' | 'Módulos' | 'Acciones Rápidas' | 'Clientes' | 'Productos (#PRD)' | 'Citas'
  icono: React.ElementType
  ruta?: string
  accion?: () => void
  permiso?: string
}

interface CommandMenuProps {
  isOpen: boolean
  onClose: () => void
}

// In-memory data cache to avoid hammering API on every keypress
let dataCache: {
  clientes: Cliente[]
  productos: Producto[]
  citas: Cita[]
  timestamp: number
} | null = null

const CACHE_TTL_MS = 60000 // 60 seconds

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const navigate = useNavigate()
  const { hasPermission } = useRole()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [citas, setCitas] = useState<Cita[]>([])
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Cargar recientes y favoritos desde localStorage
  useEffect(() => {
    try {
      const rec = localStorage.getItem('sagitta_recent_commands')
      if (rec) setRecentIds(JSON.parse(rec))
      const fav = localStorage.getItem('sagitta_favorite_commands')
      if (fav) setFavoriteIds(JSON.parse(fav))
    } catch {
      // Ignorar errores de parseo
    }
  }, [isOpen])

  // Cargar datos en memoria al abrir con caché de 60s
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)

      const now = Date.now()
      if (dataCache && now - dataCache.timestamp < CACHE_TTL_MS) {
        setClientes(dataCache.clientes)
        setProductos(dataCache.productos)
        setCitas(dataCache.citas)
      } else {
        Promise.all([
          clientesService.getAll().catch(() => ({ data: [] })),
          inventarioService.getProductos().catch(() => ({ data: [] })),
          citasService.getAll().catch(() => ({ data: [] })),
        ]).then(([resCli, resProd, resCitas]) => {
          const cli = resCli.data ?? []
          const prod = resProd.data ?? []
          const cit = resCitas.data ?? []
          dataCache = { clientes: cli, productos: prod, citas: cit, timestamp: now }
          setClientes(cli)
          setProductos(prod)
          setCitas(cit)
        })
      }
    }
  }, [isOpen])

  // Navegación estática y acciones rápidas filtradas por permisos
  const comandosEstaticos: CommandItem[] = useMemo(
    () => {
      const todos: CommandItem[] = [
        // Acciones Rápidas
        {
          id: 'act-pos',
          titulo: 'Cobrar en Punto de Venta (POS)',
          subtitulo: 'Abrir terminal de caja y cobro táctil',
          categoria: 'Acciones Rápidas',
          icono: ShoppingCart,
          ruta: '/ventas',
          permiso: 'sales.read',
        },
        {
          id: 'act-cita',
          titulo: 'Agendar Nueva Cita',
          subtitulo: 'Abrir wizard de reserva asistida',
          categoria: 'Acciones Rápidas',
          icono: PlusCircle,
          ruta: '/citas/nueva',
          permiso: 'appointments.read',
        },
        {
          id: 'act-hardware',
          titulo: 'Banco de Pruebas de Hardware & Bluetooth',
          subtitulo: 'Test de impresora térmica 58/80mm y cajón',
          categoria: 'Acciones Rápidas',
          icono: Printer,
          ruta: '/hardware',
          permiso: 'settings.manage',
        },
        {
          id: 'act-walkin',
          titulo: 'Registrar Cliente Walk-in en Recepción',
          subtitulo: 'Agregar a la cola de espera de mostrador',
          categoria: 'Acciones Rápidas',
          icono: Clock,
          ruta: '/recepcion',
          permiso: 'appointments.read',
        },
        {
          id: 'act-demo-center',
          titulo: 'Abrir Demo Center (Ventas & Prospección)',
          subtitulo: 'Centro de demostración interactiva con datos ficticios',
          categoria: 'Acciones Rápidas',
          icono: Sparkles,
          ruta: '/demo',
        },

        // Módulos
        { id: 'mod-dash', titulo: 'Panel de Control (Dashboard)', categoria: 'Módulos', icono: BarChart2, ruta: '/dashboard' },
        { id: 'mod-demo', titulo: 'Demo Center Comercial (7 Módulos)', categoria: 'Módulos', icono: Sparkles, ruta: '/demo' },
        { id: 'mod-citas', titulo: 'Agenda y Calendario de Citas', categoria: 'Módulos', icono: Calendar, ruta: '/citas', permiso: 'appointments.read' },
        { id: 'mod-ventas', titulo: 'Punto de Venta (POS)', categoria: 'Módulos', icono: ShoppingCart, ruta: '/ventas', permiso: 'sales.read' },
        { id: 'mod-inv', titulo: 'Inventario & Productos (#PRD)', categoria: 'Módulos', icono: Package, ruta: '/inventario', permiso: 'inventory.read' },
        { id: 'mod-cli', titulo: 'Directorio de Clientes & CRM', categoria: 'Módulos', icono: Users, ruta: '/clientes', permiso: 'clients.read' },
        { id: 'mod-rec', titulo: 'Recepción & Cola de Espera', categoria: 'Módulos', icono: Clock, ruta: '/recepcion', permiso: 'appointments.read' },
        { id: 'mod-serv', titulo: 'Catálogo de Servicios & Paquetes', categoria: 'Módulos', icono: Sparkles, ruta: '/servicios', permiso: 'services.read' },
        { id: 'mod-emp', titulo: 'Equipo & Horarios de Personal', categoria: 'Módulos', icono: Briefcase, ruta: '/empleados', permiso: 'employees.read' },
        { id: 'mod-recursos', titulo: 'Recursos Físicos & Cabinas', categoria: 'Módulos', icono: DoorOpen, ruta: '/recursos', permiso: 'services.update' },
        { id: 'mod-fin', titulo: 'Facturación & Cobros', categoria: 'Módulos', icono: Receipt, ruta: '/finanzas', permiso: 'sales.read' },
        { id: 'mod-rep', titulo: 'Reportes y Analítica BI', categoria: 'Módulos', icono: BarChart2, ruta: '/reportes', permiso: 'reports.read' },
        { id: 'mod-crm', titulo: 'CRM & Pipeline Comercial', categoria: 'Módulos', icono: Users, ruta: '/crm', permiso: 'clients.read' },
        { id: 'mod-auto', titulo: 'Automatizaciones & Workflows Omnicanal', categoria: 'Módulos', icono: Workflow, ruta: '/automatizaciones', permiso: 'settings.manage' },
        { id: 'mod-integ', titulo: 'Integraciones & Conectores Externos', categoria: 'Módulos', icono: Share2, ruta: '/integraciones', permiso: 'settings.manage' },
        { id: 'mod-dev', titulo: 'Desarrolladores & API Keys OpenAPI', categoria: 'Módulos', icono: Settings, ruta: '/desarrolladores', permiso: 'settings.manage' },
        { id: 'mod-cfg', titulo: 'Configuración de Marca & Tipografías', categoria: 'Módulos', icono: Settings, ruta: '/ajustes', permiso: 'settings.manage' },
        { id: 'mod-sect', titulo: 'Módulos y Presets por Sector', categoria: 'Módulos', icono: Blocks, ruta: '/modulos', permiso: 'settings.manage' },
      ]

      return todos.filter((cmd) => (cmd.permiso ? hasPermission(cmd.permiso) : true))
    },
    [hasPermission]
  )

  // Alternar favorito
  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      localStorage.setItem('sagitta_favorite_commands', JSON.stringify(next))
      return next
    })
  }

  // Limpiar recientes
  const clearRecents = () => {
    setRecentIds([])
    localStorage.removeItem('sagitta_recent_commands')
  }

  // Filtrado de elementos
  const itemsFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    const resultados: CommandItem[] = []

    // Si la búsqueda está vacía, mostrar Favoritos y Recientes primero
    if (!q) {
      // 1. Favoritos
      if (favoriteIds.length > 0) {
        comandosEstaticos
          .filter((cmd) => favoriteIds.includes(cmd.id))
          .forEach((cmd) => {
            resultados.push({ ...cmd, categoria: 'Favoritos' })
          })
      }

      // 2. Recientes (hasta 4)
      if (recentIds.length > 0) {
        recentIds
          .slice(0, 4)
          .map((id) => comandosEstaticos.find((cmd) => cmd.id === id))
          .filter((cmd): cmd is CommandItem => Boolean(cmd))
          .forEach((cmd) => {
            if (!resultados.some((r) => r.id === cmd.id)) {
              resultados.push({ ...cmd, categoria: 'Recientes' })
            }
          })
      }
    }

    // 3. Filtrar acciones y módulos
    comandosEstaticos.forEach((cmd) => {
      if (!q || cmd.titulo.toLowerCase().includes(q) || cmd.subtitulo?.toLowerCase().includes(q)) {
        if (!resultados.some((r) => r.id === cmd.id)) {
          resultados.push(cmd)
        }
      }
    })

    // 4. Filtrar clientes (hasta 4)
    if (q) {
      clientes
        .filter(
          (c) =>
            c.nombre.toLowerCase().includes(q) ||
            c.telefono?.includes(q) ||
            c.email?.toLowerCase().includes(q)
        )
        .slice(0, 4)
        .forEach((c) => {
          resultados.push({
            id: `cli-${c.id}`,
            titulo: c.nombre,
            subtitulo: `${c.telefono || 'Sin teléfono'} • ${c.email || 'Sin email'}`,
            categoria: 'Clientes',
            icono: Users,
            ruta: `/clientes?id=${c.id}`,
          })
        })
    }

    // 5. Filtrar productos (#PRD-XXXX, hasta 4) (solo si tiene permiso de inventario)
    if (q && hasPermission('inventory.read')) {
      productos
        .filter((p) => {
          const prdCode = `#prd-${String(p.id).padStart(4, '0')}`.toLowerCase()
          return (
            p.nombre.toLowerCase().includes(q) ||
            prdCode.includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.categoria?.toLowerCase().includes(q)
          )
        })
        .slice(0, 4)
        .forEach((p) => {
          resultados.push({
            id: `prd-${p.id}`,
            titulo: `${p.nombre} [#PRD-${String(p.id).padStart(4, '0')}]`,
            subtitulo: `Stock: ${p.stock_actual} • SKU: ${p.sku} • ${p.categoria}`,
            categoria: 'Productos (#PRD)',
            icono: Package,
            ruta: `/inventario?id=${p.id}`,
          })
        })
    }

    // 6. Filtrar citas (hasta 3)
    if (q) {
      citas
        .filter(
          (c) =>
            c.cliente?.nombre?.toLowerCase().includes(q) ||
            c.servicio?.nombre?.toLowerCase().includes(q) ||
            `cit-${c.id}`.includes(q)
        )
        .slice(0, 3)
        .forEach((c) => {
          resultados.push({
            id: `cita-${c.id}`,
            titulo: `Cita #${c.id} - ${c.cliente?.nombre || 'Cliente'}`,
            subtitulo: `${c.servicio?.nombre || 'Servicio'} • ${
              c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString() : ''
            }`,
            categoria: 'Citas',
            icono: Calendar,
            ruta: `/citas?id=${c.id}`,
          })
        })
    }

    return resultados
  }, [query, comandosEstaticos, clientes, productos, citas, favoriteIds, recentIds])

  // Ejecutar selección
  const ejecutarItem = (item: CommandItem) => {
    // Guardar en recientes
    if (!item.id.startsWith('cli-') && !item.id.startsWith('prd-') && !item.id.startsWith('cita-')) {
      const nextRecent = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, 8)
      setRecentIds(nextRecent)
      localStorage.setItem('sagitta_recent_commands', JSON.stringify(nextRecent))
    }

    onClose()
    if (item.accion) {
      item.accion()
    } else if (item.ruta) {
      navigate(item.ruta)
    }
  }

  // Manejador de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1 < itemsFiltrados.length ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : itemsFiltrados.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (itemsFiltrados[selectedIndex]) {
        ejecutarItem(itemsFiltrados[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  // Agrupar items filtrados por categoría
  const categoriasAgrupadas = itemsFiltrados.reduce((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = []
    acc[item.categoria].push(item)
    return acc
  }, {} as Record<string, CommandItem[]>)

  let flatIndex = 0

  return (
    <div
      className="fixed inset-0 z-modal flex items-start justify-center pt-[8vh] sm:pt-[12vh] p-3 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel Omnibar */}
      <div
        className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface text-text shadow-xl animate-slide-up"
        onKeyDown={handleKeyDown}
      >
        {/* Input Bar */}
        <div className="flex items-center px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] gap-3 bg-black/[0.02] dark:bg-white/[0.03]">
          <Search className="w-5 h-5 text-[#007AFF] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Buscar por módulo, cliente, producto #PRD, cita o acción..."
            className="w-full bg-transparent text-text text-sm sm:text-base placeholder:text-text-muted/60 focus:outline-none"
          />
          {query && (
            <IconButton
              icon={<X className="w-4 h-4" />}
              aria-label="Borrar texto"
              variant="ghost"
              size="xs"
              onClick={() => {
                setQuery('')
                setSelectedIndex(0)
                inputRef.current?.focus()
              }}
            />
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-text-muted bg-white/80 dark:bg-white/10 border border-black/[0.06] dark:border-white/[0.1] rounded-full shadow-xs">
            ESC
          </kbd>
        </div>

        {/* List of Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-3">
          {itemsFiltrados.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted space-y-2">
              <p>No se encontraron resultados para "{query}"</p>
              <p className="text-[11px] opacity-75">
                Prueba buscando por nombre de cliente, código #PRD-XXXX o término de módulo.
              </p>
            </div>
          ) : (
            Object.entries(categoriasAgrupadas).map(([cat, items]) => (
              <div key={cat} className="space-y-1">
                <div className="px-3 py-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted dark:text-white/45 uppercase tracking-[0.14em] flex items-center gap-1.5">
                    {cat === 'Favoritos' && <Star className="w-3 h-3 text-[#FF9500] fill-[#FF9500]" />}
                    {cat === 'Recientes' && <History className="w-3 h-3 text-[#007AFF]" />}
                    <span>{cat}</span>
                  </span>

                  {cat === 'Recientes' && (
                    <button
                      type="button"
                      onClick={clearRecents}
                      className="text-[10px] text-text-muted hover:text-[#FF3B30] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Limpiar</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {items.map((item) => {
                    const currentIndex = flatIndex++
                    const isSelected = currentIndex === selectedIndex
                    const Icon = item.icono
                    const isFav = favoriteIds.includes(item.id)

                    return (
                      <div
                        key={`${cat}-${item.id}`}
                        onClick={() => ejecutarItem(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={[
                          'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium cursor-pointer transition-all select-none group ios-press',
                          isSelected
                            ? 'bg-primary-soft text-primary font-semibold'
                            : 'text-text dark:text-white/90 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-white/20 text-white border-transparent'
                                : 'bg-black/[0.04] dark:bg-white/[0.06] text-text-muted dark:text-white/60 border-black/[0.05] dark:border-white/[0.08] group-hover:text-text'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate leading-snug">{item.titulo}</div>
                            {item.subtitulo && (
                              <div
                                className={`text-[11px] truncate mt-0.5 font-normal ${
                                  isSelected ? 'text-white/80' : 'text-text-muted dark:text-white/50'
                                }`}
                              >
                                {item.subtitulo}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(e, item.id)}
                            aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                            className={`p-1 rounded-md transition-colors ${
                              isFav
                                ? 'text-warning hover:text-warning/80'
                                : 'text-text-muted/40 hover:text-warning'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-warning' : ''}`} />
                          </button>

                          <Badge size="sm" variant={isSelected ? 'primary' : 'default'}>
                            {item.categoria}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-border-subtle bg-surface-subtle/40 flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-surface border border-border px-1 py-0.5 rounded text-[10px] mr-1">
                ↑↓
              </kbd>
              Navegar
            </span>
            <span>
              <kbd className="font-mono bg-surface border border-border px-1 py-0.5 rounded text-[10px] mr-1">
                ↵
              </kbd>
              Seleccionar
            </span>
          </div>
          <span className="truncate">Sagita Omnibar 2.0</span>
        </div>
      </div>
    </div>
  )
}
