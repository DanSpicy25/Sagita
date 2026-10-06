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
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  Command,
  X,
} from 'lucide-react'
import { clientesService } from '@/services/clientes.service'
import { inventarioService } from '@/services/inventario.service'
import { citasService } from '@/services/citas.service'
import { Cliente, Producto, Cita } from '@/types'

interface CommandItem {
  id: string
  titulo: string
  subtitulo?: string
  categoria: 'Módulos' | 'Acciones Rápidas' | 'Clientes' | 'Productos (#PRD)' | 'Citas'
  icono: React.ElementType
  ruta?: string
  accion?: () => void
}

interface CommandMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [citas, setCitas] = useState<Cita[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Cargar datos en memoria al abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)

      Promise.all([
        clientesService.getAll().catch(() => ({ data: [] })),
        inventarioService.getProductos().catch(() => ({ data: [] })),
        citasService.getAll().catch(() => ({ data: [] })),
      ]).then(([resCli, resProd, resCitas]) => {
        setClientes(resCli.data ?? [])
        setProductos(resProd.data ?? [])
        setCitas(resCitas.data ?? [])
      })
    }
  }, [isOpen])

  // Navegación estática y acciones rápidas
  const comandosEstaticos: CommandItem[] = useMemo(
    () => [
      // Acciones Rápidas
      {
        id: 'act-pos',
        titulo: 'Cobrar en Punto de Venta (POS)',
        subtitulo: 'Abrir terminal de caja y cobro táctil',
        categoria: 'Acciones Rápidas',
        icono: ShoppingCart,
        ruta: '/ventas',
      },
      {
        id: 'act-cita',
        titulo: 'Agendar Nueva Cita',
        subtitulo: 'Abrir wizard de reserva asistida',
        categoria: 'Acciones Rápidas',
        icono: PlusCircle,
        ruta: '/citas/nueva',
      },
      {
        id: 'act-hardware',
        titulo: 'Banco de Pruebas de Hardware & Bluetooth',
        subtitulo: 'Test de impresora térmica 58/80mm y cajón',
        categoria: 'Acciones Rápidas',
        icono: Printer,
        ruta: '/hardware',
      },
      {
        id: 'act-walkin',
        titulo: 'Registrar Cliente Walk-in en Recepción',
        subtitulo: 'Agregar a la cola de espera de mostrador',
        categoria: 'Acciones Rápidas',
        icono: Clock,
        ruta: '/recepcion',
      },

      // Módulos
      { id: 'mod-dash', titulo: 'Panel de Control (Dashboard)', categoria: 'Módulos', icono: BarChart2, ruta: '/dashboard' },
      { id: 'mod-citas', titulo: 'Agenda y Calendario de Citas', categoria: 'Módulos', icono: Calendar, ruta: '/citas' },
      { id: 'mod-ventas', titulo: 'Punto de Venta (POS)', categoria: 'Módulos', icono: ShoppingCart, ruta: '/ventas' },
      { id: 'mod-inv', titulo: 'Inventario & Productos (#PRD)', categoria: 'Módulos', icono: Package, ruta: '/inventario' },
      { id: 'mod-cli', titulo: 'Directorio de Clientes & CRM', categoria: 'Módulos', icono: Users, ruta: '/clientes' },
      { id: 'mod-rec', titulo: 'Recepción & Cola de Espera', categoria: 'Módulos', icono: Clock, ruta: '/recepcion' },
      { id: 'mod-serv', titulo: 'Catálogo de Servicios & Paquetes', categoria: 'Módulos', icono: Sparkles, ruta: '/servicios' },
      { id: 'mod-emp', titulo: 'Equipo & Horarios de Personal', categoria: 'Módulos', icono: Briefcase, ruta: '/empleados' },
      { id: 'mod-recursos', titulo: 'Recursos Físicos & Cabinas', categoria: 'Módulos', icono: DoorOpen, ruta: '/recursos' },
      { id: 'mod-fin', titulo: 'Facturación & Cobros', categoria: 'Módulos', icono: Receipt, ruta: '/finanzas' },
      { id: 'mod-rep', titulo: 'Reportes y Analítica BI', categoria: 'Módulos', icono: BarChart2, ruta: '/reportes' },
      { id: 'mod-crm', titulo: 'CRM & Pipeline Comercial', categoria: 'Módulos', icono: Users, ruta: '/crm' },
      { id: 'mod-dev', titulo: 'Desarrolladores & API Keys OpenAPI', categoria: 'Módulos', icono: Settings, ruta: '/desarrolladores' },
      { id: 'mod-cfg', titulo: 'Configuración de Marca & Tipografías', categoria: 'Módulos', icono: Settings, ruta: '/ajustes' },
      { id: 'mod-sect', titulo: 'Módulos y Presets por Sector', categoria: 'Módulos', icono: Blocks, ruta: '/modulos' },
    ],
    []
  )

  // Filtrado de elementos
  const itemsFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    const resultados: CommandItem[] = []

    // 1. Filtrar acciones y módulos
    comandosEstaticos.forEach((cmd) => {
      if (!q || cmd.titulo.toLowerCase().includes(q) || cmd.subtitulo?.toLowerCase().includes(q)) {
        resultados.push(cmd)
      }
    })

    // 2. Filtrar clientes (hasta 4)
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

    // 3. Filtrar productos (#PRD-XXXX, hasta 4)
    if (q) {
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

    // 4. Filtrar citas (hasta 3)
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
            subtitulo: `${c.servicio?.nombre || 'Servicio'} • ${c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString() : ''}`,
            categoria: 'Citas',
            icono: Calendar,
            ruta: `/citas?id=${c.id}`,
          })
        })
    }

    return resultados
  }, [query, comandosEstaticos, clientes, productos, citas])

  // Ejecutar selección
  const ejecutarItem = (item: CommandItem) => {
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

  let indiceGlobal = 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera con Input de Búsqueda */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escribe para buscar clientes, #PRD, citas o módulos..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Resultados */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-3">
          {itemsFiltrados.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No se encontraron resultados para &ldquo;<span className="font-semibold text-slate-600 dark:text-slate-300">{query}</span>&rdquo;
            </div>
          ) : (
            Object.entries(categoriasAgrupadas).map(([cat, items]) => (
              <div key={cat} className="space-y-1">
                <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {cat}
                </div>
                {items.map((item) => {
                  const currentIndex = indiceGlobal++
                  const isSelected = currentIndex === selectedIndex
                  const Icon = item.icono

                  return (
                    <div
                      key={item.id}
                      onClick={() => ejecutarItem(item)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-900 dark:text-white'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-primary-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">
                            {item.titulo}
                          </p>
                          {item.subtitulo && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {item.subtitulo}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-2">
                        {isSelected && <ArrowRight className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Barra de atajos de pie de ventana */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">↑↓</kbd> Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">↵</kbd> Seleccionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">ESC</kbd> Cerrar
            </span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
            <Command className="w-3.5 h-3.5" />
            <span>Sagitta Omnibar</span>
          </div>
        </div>
      </div>
    </div>
  )
}
