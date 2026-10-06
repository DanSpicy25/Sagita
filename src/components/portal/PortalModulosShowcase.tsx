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
  categoria: string
  descripcion: string
  capacidades: string[]
  icon: typeof LayoutDashboard
  badgeColor: string
}

const MODULOS_SISTEMA: ModuloItem[] = [
  // ─── Operaciones y Citas ──────────────────────────────────────────────────
  {
    id: 'dashboard',
    titulo: 'Panel Ejecutivo & Métricas',
    archivoTsx: 'src/pages/DashboardPage.tsx',
    ruta: '/dashboard',
    categoria: 'Control General',
    descripcion: 'Vista de mando principal con KPIs de facturación, afluencia y próximos servicios.',
    capacidades: ['Ingresos del día en tiempo real', 'Próximas citas asignadas', 'Gráfico de horas pico'],
    icon: LayoutDashboard,
    badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'citas',
    titulo: 'Agenda & Calendario de Citas',
    archivoTsx: 'src/pages/CitasPage.tsx',
    ruta: '/citas',
    categoria: 'Operaciones',
    descripcion: 'Control de citas con vistas mensual, semanal y lista. Filtros avanzados y reprogramación.',
    capacidades: ['Filtros por empleado y estado', 'Modal de detalle con exportación .ICS / PDF', 'Reprogramación asistida'],
    icon: CalendarDays,
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'recepcion',
    titulo: 'Recepción & Sala de Espera',
    archivoTsx: 'src/pages/RecepcionPage.tsx',
    ruta: '/recepcion',
    categoria: 'Operaciones',
    descripcion: 'Mostrador en vivo con cola de clientes walk-in espontáneos y lista de espera.',
    capacidades: ['Cola walk-in sin cita previa', 'Cronómetro de minutos en espera', 'Pase directo a cobro'],
    icon: ConciergeBell,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'servicios',
    titulo: 'Catálogo de Servicios & Recetas',
    archivoTsx: 'src/pages/ServiciosPage.tsx',
    ruta: '/servicios',
    categoria: 'Operaciones',
    descripcion: 'Configuración de servicios, precios, tiempos de holgura y recetas técnicas de insumos BOM.',
    capacidades: ['Categorías y duraciones base', 'Tiempos de preparación (buffers)', 'Paquetes y membresías periódicas'],
    icon: Sparkles,
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'empleados',
    titulo: 'Equipo & Profesionales',
    archivoTsx: 'src/pages/EmpleadosPage.tsx',
    ruta: '/empleados',
    categoria: 'Operaciones',
    descripcion: 'Gestión del equipo humano, especialidades, jornadas laborales y liquidación de comisiones.',
    capacidades: ['Horarios laborales semanales', 'Especialidades y servicios autorizados', 'Comisiones por venta'],
    icon: Users,
    badgeColor: 'bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800',
  },
  {
    id: 'recursos',
    titulo: 'Recursos, Cabinas & Sillones',
    archivoTsx: 'src/pages/RecursosPage.tsx',
    ruta: '/recursos',
    categoria: 'Operaciones',
    descripcion: 'Inventario de espacios físicos y maquinaria. Prevención estricta de colisiones de agenda.',
    capacidades: ['Salas, camillas y equipamiento', 'Bloqueos por mantenimiento', 'Aforo máximo'],
    icon: DoorOpen,
    badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800',
  },

  // ─── Ventas, POS y Finanzas ───────────────────────────────────────────────
  {
    id: 'pos',
    titulo: 'Punto de Venta Táctil (POS)',
    archivoTsx: 'src/pages/VentasPage.tsx',
    ruta: '/ventas',
    categoria: 'Ventas & Caja',
    descripcion: 'Caja registradora táctil optimizada para tablets y PC con teclado rápido de billetes.',
    capacidades: ['Teclado táctil rápido de billetes', 'Pagos divididos (Split Payment)', 'Arqueo y control de caja'],
    icon: ShoppingCart,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'finanzas',
    titulo: 'Facturación, Cupones & Devoluciones',
    archivoTsx: 'src/pages/PagosPage.tsx',
    ruta: '/finanzas',
    categoria: 'Ventas & Caja',
    descripcion: 'Emisión fiscal de facturas, reembolsos integrales y administración de cupones de descuento.',
    capacidades: ['Descarga de comprobantes en PDF', 'Reembolsos que restituyen inventario', 'Cupones con fecha y topes'],
    icon: Receipt,
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'hardware',
    titulo: 'Hardware POS & Impresión Bluetooth',
    archivoTsx: 'src/pages/HardwarePage.tsx',
    ruta: '/hardware',
    categoria: 'Ventas & Caja',
    descripcion: 'Conexión Web Bluetooth directa con impresoras térmicas (58mm/80mm) y apertura de cajón monedero.',
    capacidades: ['Impresión térmica ESC/POS directa', 'Apertura de gaveta RJ11', 'Lector de códigos de barras HID'],
    icon: Printer,
    badgeColor: 'bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800',
  },

  // ─── Logística y Clientes ─────────────────────────────────────────────────
  {
    id: 'inventario',
    titulo: 'Inventario & Kardex (#PRD)',
    archivoTsx: 'src/pages/InventarioPage.tsx',
    ruta: '/inventario',
    categoria: 'Inventario',
    descripcion: 'Catálogo de existencias con códigos oficiales #PRD-XXXX y auditoría de movimientos Kardex.',
    capacidades: ['Códigos oficiales #PRD-XXXX', 'Kardex inmutable de entradas/salidas', 'Semáforos de stock crítico'],
    icon: Package,
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'crm',
    titulo: 'CRM & Pipeline Comercial',
    archivoTsx: 'src/pages/CrmPage.tsx',
    ruta: '/crm',
    categoria: 'Clientes',
    descripcion: 'Embudo de oportunidades comerciales kanban, métricas de conversión y reactivación.',
    capacidades: ['Tablero kanban de prospectos', 'Tasa de conversión de ventas', 'Filtro de clientes inactivos'],
    icon: Briefcase,
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800',
  },
  {
    id: 'clientes',
    titulo: 'Expediente de Clientes 360°',
    archivoTsx: 'src/pages/ClientesPage.tsx',
    ruta: '/clientes',
    categoria: 'Clientes',
    descripcion: 'Ficha integral del cliente con historial de visitas, consentimientos legales y notas protegidas.',
    capacidades: ['Historial completo de citas y facturas', 'Consentimientos firmados', 'Campos dinámicos personalizados'],
    icon: Users,
    badgeColor: 'bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800',
  },

  // ─── Automatizaciones y Análisis ──────────────────────────────────────────
  {
    id: 'automatizaciones',
    titulo: 'Motor de Automatizaciones',
    archivoTsx: 'src/pages/AutomatizacionesPage.tsx',
    ruta: '/automatizaciones',
    categoria: 'Marketing',
    descripcion: 'Reglas de comunicación automática por WhatsApp, Email y Web Push para recordatorios y post-venta.',
    capacidades: ['Recordatorios 24h antes por WhatsApp', 'Horario silencioso nocturno', 'Plantillas dinámicas'],
    icon: Workflow,
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'reportes',
    titulo: 'Reportes & Analítica Financiera',
    archivoTsx: 'src/pages/ReportesPage.tsx',
    ruta: '/reportes',
    categoria: 'Analítica',
    descripcion: 'Métricas gerenciales consolidadas, tendencias de ingresos, servicios líderes y exportación a Excel.',
    capacidades: ['Desglose por método de cobro', 'Retención y recurrencia de clientes', 'Exportación completa a CSV'],
    icon: BarChart2,
    badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800',
  },

  // ─── Marca Blanca y Configuración ─────────────────────────────────────────
  {
    id: 'ajustes',
    titulo: 'Marca Blanca & Tipografías',
    archivoTsx: 'src/pages/ConfiguracionPage.tsx',
    ruta: '/ajustes',
    categoria: 'Configuración',
    descripcion: 'Personalización de marca: 8 fuentes empresariales, escala de interfaz y favicon interactivo en vivo.',
    capacidades: ['8 fuentes tipográficas Google', 'Favicon interactivo en pestaña en vivo', 'Configuración de moneda y región'],
    icon: Settings,
    badgeColor: 'bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800',
  },
  {
    id: 'modulos',
    titulo: 'Sectores & Vocabulario (tTerm)',
    archivoTsx: 'src/pages/ModulosPage.tsx',
    ruta: '/modulos',
    categoria: 'Configuración',
    descripcion: '10 perfiles de industria (Salud, Comida, Barbería, Spa) que adaptan la terminología y módulos.',
    capacidades: ['Presets por sector empresarial', 'Adaptador dinámico de terminología', 'Conmutador de módulos activos'],
    icon: Sparkles,
    badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800',
  },
  {
    id: 'roles',
    titulo: 'Seguridad, Roles & Permisos',
    archivoTsx: 'src/pages/RolesPage.tsx',
    ruta: '/roles',
    categoria: 'Configuración',
    descripcion: 'Matriz granular de permisos por módulo para proteger acciones críticas como descuentos y caja.',
    capacidades: ['Matriz de permisos por módulo', 'Roles del sistema y personalizados', 'Evaluación dinámica en sesión'],
    icon: Shield,
    badgeColor: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
  },
  {
    id: 'desarrolladores',
    titulo: 'Centro de API & Desarrolladores',
    archivoTsx: 'src/pages/CrmDesarrolladoresPage.tsx',
    ruta: '/desarrolladores',
    categoria: 'Técnico',
    descripcion: 'Consola interactiva OpenAPI, gestión de API keys, documentación técnica y logs de auditoría.',
    capacidades: ['Explorador OpenAPI interactivo', 'Generación de API Keys', 'Logs de auditoría del sistema'],
    icon: Code2,
    badgeColor: 'bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800',
  },
]

export function PortalModulosShowcase() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const { toast } = useToast()
  const [ingresando, setIngresando] = useState(false)

  const handleEntrarAModulo = async (ruta: string, titulo: string) => {
    if (isAuthenticated) {
      navigate(ruta)
      return
    }

    setIngresando(true)
    try {
      await login({ email: 'supremo@demo.app', password: 'Supremo123!' })
      toast.success('Acceso Demo Autorizado', `Entrando a ${titulo} con privilegios de Administrador Supremo`)
      navigate(ruta)
    } catch {
      toast.info('Redirigiendo', 'Por favor selecciona tus credenciales en la pantalla de acceso')
      navigate('/login')
    } finally {
      setIngresando(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner Principal de Acceso Directo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-indigo-900/50 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Explorador de la Plataforma Completa</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Todos los 18 Módulos & Pantallas de Sagitta
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Puedes abrir y probar cada pantalla en vivo. Al hacer clic en cualquier módulo se habilita automáticamente el modo demostración como <strong>Administrador Supremo</strong> sin necesidad de rellenar formularios.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleEntrarAModulo('/dashboard', 'Panel de Control')}
              isLoading={ingresando}
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Entrar al Panel General (/dashboard)</span>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleEntrarAModulo('/ventas', 'Punto de Venta POS')}
              isLoading={ingresando}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Abrir POS Directo (/ventas)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de Módulos */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Directorio de Pantallas Implementadas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cada módulo cuenta con su propio archivo TSX desacoplado y sus submódulos correspondientes
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
            18 Pantallas 100% Funcionales
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULOS_SISTEMA.map((modulo) => {
            const Icon = modulo.icon
            return (
              <div
                key={modulo.id}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 dark:hover:border-primary-500/50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/50 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${modulo.badgeColor}`}>
                        {modulo.categoria}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {modulo.ruta}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {modulo.titulo}
                    </h4>
                    <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                      {modulo.archivoTsx}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {modulo.descripcion}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Capacidades clave:
                    </span>
                    <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      {modulo.capacidades.map((cap, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleEntrarAModulo(modulo.ruta, modulo.titulo)}
                    disabled={ingresando}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all group-hover:bg-primary-50 dark:group-hover:bg-primary-950/40 group-hover:text-primary-600 dark:group-hover:text-primary-400"
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
    </div>
  )
}
