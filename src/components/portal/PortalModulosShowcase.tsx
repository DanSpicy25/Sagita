import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  ConciergeBell,
  Sparkles,
  Users,
  Briefcase,
  DoorOpen,
  ShoppingCart,
  Receipt,
  Printer,
  Package,
  Workflow,
  BarChart2,
  Settings,
  Shield,
  Code2,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui'

interface ModuloItem {
  id: string
  titulo: string
  archivoTsx: string
  ruta: string
  categoria: 'operaciones' | 'ventas' | 'clientes' | 'inventario' | 'analitica' | 'configuracion'
  categoriaLabel: string
  descripcion: string
  capacidades: string[]
  icon: typeof LayoutDashboard
}

const MODULOS_SISTEMA: ModuloItem[] = [
  // ─── Control y Operaciones ────────────────────────────────────────────────
  {
    id: 'dashboard',
    titulo: 'Panel Ejecutivo & Métricas',
    archivoTsx: 'DashboardPage.tsx',
    ruta: '/dashboard',
    categoria: 'operaciones',
    categoriaLabel: 'Control General',
    descripcion: 'Vista de mando principal con KPIs de facturación, afluencia y próximos servicios.',
    capacidades: ['Ingresos del día en tiempo real', 'Próximas citas asignadas', 'Gráfico de horas pico'],
    icon: LayoutDashboard,
  },
  {
    id: 'citas',
    titulo: 'Agenda & Calendario de Citas',
    archivoTsx: 'CitasPage.tsx',
    ruta: '/citas',
    categoria: 'operaciones',
    categoriaLabel: 'Operaciones',
    descripcion: 'Control de citas con vistas mensual, semanal y lista. Filtros avanzados y reprogramación.',
    capacidades: ['Filtros por empleado y estado', 'Detalle con exportación .ICS / PDF', 'Reprogramación asistida'],
    icon: CalendarDays,
  },
  {
    id: 'recepcion',
    titulo: 'Recepción & Sala de Espera',
    archivoTsx: 'RecepcionPage.tsx',
    ruta: '/recepcion',
    categoria: 'operaciones',
    categoriaLabel: 'Operaciones',
    descripcion: 'Mostrador en vivo con cola de clientes walk-in espontáneos y lista de espera.',
    capacidades: ['Cola walk-in sin cita previa', 'Cronómetro de minutos en espera', 'Pase directo a cobro'],
    icon: ConciergeBell,
  },
  {
    id: 'servicios',
    titulo: 'Catálogo de Servicios & Recetas',
    archivoTsx: 'ServiciosPage.tsx',
    ruta: '/servicios',
    categoria: 'operaciones',
    categoriaLabel: 'Operaciones',
    descripcion: 'Configuración de servicios, precios, tiempos de holgura y recetas técnicas de insumos BOM.',
    capacidades: ['Categorías y duraciones base', 'Tiempos de preparación (buffers)', 'Paquetes y membresías'],
    icon: Sparkles,
  },
  {
    id: 'empleados',
    titulo: 'Equipo & Profesionales',
    archivoTsx: 'EmpleadosPage.tsx',
    ruta: '/empleados',
    categoria: 'operaciones',
    categoriaLabel: 'Operaciones',
    descripcion: 'Gestión del equipo humano, especialidades, jornadas laborales y comisiones.',
    capacidades: ['Horarios laborales semanales', 'Especialidades autorizadas', 'Liquidación de comisiones'],
    icon: Users,
  },
  {
    id: 'recursos',
    titulo: 'Recursos, Cabinas & Sillones',
    archivoTsx: 'RecursosPage.tsx',
    ruta: '/recursos',
    categoria: 'operaciones',
    categoriaLabel: 'Operaciones',
    descripcion: 'Inventario de espacios físicos y maquinaria. Prevención estricta de colisiones de agenda.',
    capacidades: ['Salas, camillas y equipamiento', 'Bloqueos por mantenimiento', 'Prevención de sobreventa'],
    icon: DoorOpen,
  },

  // ─── Ventas, POS y Finanzas ───────────────────────────────────────────────
  {
    id: 'pos',
    titulo: 'Punto de Venta Táctil (POS)',
    archivoTsx: 'VentasPage.tsx',
    ruta: '/ventas',
    categoria: 'ventas',
    categoriaLabel: 'Ventas & Caja',
    descripcion: 'Caja registradora táctil optimizada para tablets y PC con teclado rápido de billetes.',
    capacidades: ['Teclado táctil rápido de billetes', 'Pagos divididos (Split Payment)', 'Arqueo y control de caja'],
    icon: ShoppingCart,
  },
  {
    id: 'finanzas',
    titulo: 'Facturación, Cupones & Pagos',
    archivoTsx: 'PagosPage.tsx',
    ruta: '/finanzas',
    categoria: 'ventas',
    categoriaLabel: 'Ventas & Caja',
    descripcion: 'Emisión fiscal de comprobantes, reembolsos integrales y cupones de descuento.',
    capacidades: ['Descarga de comprobantes PDF', 'Reembolsos que restituyen stock', 'Cupones con topes'],
    icon: Receipt,
  },
  {
    id: 'hardware',
    titulo: 'Hardware POS & Bluetooth',
    archivoTsx: 'HardwarePage.tsx',
    ruta: '/hardware',
    categoria: 'ventas',
    categoriaLabel: 'Ventas & Caja',
    descripcion: 'Conexión Web Bluetooth directa con impresoras térmicas (58mm/80mm) y apertura de cajón.',
    capacidades: ['Impresión térmica ESC/POS directa', 'Apertura de gaveta RJ11', 'Lector de códigos de barras'],
    icon: Printer,
  },

  // ─── Clientes y CRM ───────────────────────────────────────────────────────
  {
    id: 'crm',
    titulo: 'CRM & Pipeline Comercial',
    archivoTsx: 'CrmPage.tsx',
    ruta: '/crm',
    categoria: 'clientes',
    categoriaLabel: 'Clientes & CRM',
    descripcion: 'Embudo de oportunidades comerciales kanban, métricas de conversión y reactivación.',
    capacidades: ['Tablero kanban de prospectos', 'Tasa de conversión de ventas', 'Filtro de clientes inactivos'],
    icon: Briefcase,
  },
  {
    id: 'clientes',
    titulo: 'Expediente de Clientes 360°',
    archivoTsx: 'ClientesPage.tsx',
    ruta: '/clientes',
    categoria: 'clientes',
    categoriaLabel: 'Clientes & CRM',
    descripcion: 'Ficha integral del cliente con historial de visitas, consentimientos legales y notas.',
    capacidades: ['Historial completo de citas', 'Consentimientos firmados', 'Campos personalizados'],
    icon: Users,
  },

  // ─── Inventario y Logística ───────────────────────────────────────────────
  {
    id: 'inventario',
    titulo: 'Inventario & Kardex (#PRD)',
    archivoTsx: 'InventarioPage.tsx',
    ruta: '/inventario',
    categoria: 'inventario',
    categoriaLabel: 'Inventario',
    descripcion: 'Catálogo de existencias con códigos oficiales #PRD-XXXX y auditoría de movimientos Kardex.',
    capacidades: ['Códigos oficiales #PRD-XXXX', 'Kardex inmutable de entradas/salidas', 'Semáforos de stock crítico'],
    icon: Package,
  },

  // ─── Automatizaciones y Analítica ─────────────────────────────────────────
  {
    id: 'automatizaciones',
    titulo: 'Motor de Automatizaciones',
    archivoTsx: 'AutomatizacionesPage.tsx',
    ruta: '/automatizaciones',
    categoria: 'analitica',
    categoriaLabel: 'Automatización',
    descripcion: 'Reglas de comunicación automática por WhatsApp, Email y Web Push.',
    capacidades: ['Recordatorios 24h antes por WhatsApp', 'Horario silencioso nocturno', 'Plantillas variables'],
    icon: Workflow,
  },
  {
    id: 'reportes',
    titulo: 'Reportes & Analítica Financiera',
    archivoTsx: 'ReportesPage.tsx',
    ruta: '/reportes',
    categoria: 'analitica',
    categoriaLabel: 'Analítica',
    descripcion: 'Métricas gerenciales consolidadas, tendencias de ingresos y exportación a Excel.',
    capacidades: ['Desglose por método de cobro', 'Retención y recurrencia', 'Exportación completa CSV'],
    icon: BarChart2,
  },

  // ─── Configuración y Marca Blanca ─────────────────────────────────────────
  {
    id: 'ajustes',
    titulo: 'Marca Blanca & Tipografías',
    archivoTsx: 'ConfiguracionPage.tsx',
    ruta: '/ajustes',
    categoria: 'configuracion',
    categoriaLabel: 'Configuración',
    descripcion: 'Personalización de marca: 8 fuentes empresariales, escala y favicon en vivo.',
    capacidades: ['8 fuentes Google Fonts', 'Favicon interactivo en vivo', 'Monedas y formatos locales'],
    icon: Settings,
  },
  {
    id: 'modulos',
    titulo: 'Sectores & Vocabulario (tTerm)',
    archivoTsx: 'ModulosPage.tsx',
    ruta: '/modulos',
    categoria: 'configuracion',
    categoriaLabel: 'Configuración',
    descripcion: '10 perfiles de industria (Salud, Comida, Barbería, Spa) que adaptan la terminología.',
    capacidades: ['Presets por sector empresarial', 'Adaptador dinámico de términos', 'Conmutador de módulos'],
    icon: Sparkles,
  },
  {
    id: 'roles',
    titulo: 'Seguridad, Roles & Permisos',
    archivoTsx: 'RolesPage.tsx',
    ruta: '/roles',
    categoria: 'configuracion',
    categoriaLabel: 'Configuración',
    descripcion: 'Matriz granular de permisos por módulo para proteger acciones críticas.',
    capacidades: ['Matriz de permisos por módulo', 'Roles del sistema y propios', 'Evaluación en sesión'],
    icon: Shield,
  },
  {
    id: 'desarrolladores',
    titulo: 'Centro de API & Desarrolladores',
    archivoTsx: 'CrmDesarrolladoresPage.tsx',
    ruta: '/desarrolladores',
    categoria: 'configuracion',
    categoriaLabel: 'Técnico',
    descripcion: 'Consola interactiva OpenAPI, gestión de API keys y logs de auditoría.',
    capacidades: ['Explorador OpenAPI interactivo', 'Generación de API Keys', 'Logs de auditoría'],
    icon: Code2,
  },
]

export function PortalModulosShowcase() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const { toast } = useToast()
  const [ingresando, setIngresando] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')

  const modulosFiltrados = filtroCategoria === 'todos'
    ? MODULOS_SISTEMA
    : MODULOS_SISTEMA.filter((m) => m.categoria === filtroCategoria)

  const handleEntrarAModulo = async (ruta: string, titulo: string) => {
    if (isAuthenticated) {
      navigate(ruta)
      return
    }

    setIngresando(true)
    try {
      await login({ email: 'supremo@demo.app', password: 'Supremo123!' })
      toast.success('Acceso Autorizado', `Abriendo ${titulo} con privilegios de Administrador`)
      navigate(ruta)
    } catch {
      navigate('/login')
    } finally {
      setIngresando(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-6 sm:space-y-8">
      {/* Banner Minimalista de Presentación */}
      <div className="bg-neutral-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-[11px] sm:text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Arquitectura Modular Lista para Operar</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Directorio Completo de Módulos
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Cada sección es un módulo independiente y desacoplado. Toca cualquier tarjeta para abrir la pantalla en vivo sin contraseñas en modo demostración.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full md:w-auto shrink-0 pt-1 md:pt-0">
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleEntrarAModulo('/dashboard', 'Panel de Control')}
            isLoading={ingresando}
            className="w-full sm:w-auto bg-white hover:bg-neutral-100 text-neutral-900 font-semibold rounded-full px-5 sm:px-6 py-3 shadow-sm text-xs sm:text-sm"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            <span>Abrir Panel General</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleEntrarAModulo('/ventas', 'Punto de Venta POS')}
            isLoading={ingresando}
            className="w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700 font-semibold rounded-full px-5 sm:px-6 py-3 text-xs sm:text-sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span>Abrir POS Directo</span>
          </Button>
        </div>
      </div>

      {/* Filtros de Categoría (Pill Segmented Control con Full-Bleed Scroll en Mobile) */}
      <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 pb-2 shrink-0">
          {[
            { id: 'todos', label: 'Todos (18)' },
            { id: 'operaciones', label: 'Operaciones & Citas' },
            { id: 'ventas', label: 'Ventas & POS' },
            { id: 'clientes', label: 'Clientes & CRM' },
            { id: 'inventario', label: 'Inventario' },
            { id: 'analitica', label: 'Automatizaciones & Reportes' },
            { id: 'configuracion', label: 'Configuración & Seguridad' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFiltroCategoria(cat.id)}
              className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all active:scale-95 ${
                filtroCategoria === cat.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas Limpias (Apple / Linear Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {modulosFiltrados.map((modulo) => {
          const Icon = modulo.icon
          return (
            <div
              key={modulo.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-full">
                      {modulo.categoriaLabel}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                      En Vivo
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-base text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {modulo.titulo}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                    Módulo Operativo Sagitta
                  </p>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {modulo.descripcion}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Capacidades clave:
                  </span>
                  <ul className="text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1">
                    {modulo.capacidades.map((cap, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300 shrink-0" />
                        <span className="truncate">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => handleEntrarAModulo(modulo.ruta, modulo.titulo)}
                  disabled={ingresando}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
                >
                  <span>Abrir Pantalla en Vivo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
