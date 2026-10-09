import {
  LayoutDashboard,
  CalendarDays,
  ConciergeBell,
  Sparkles,
  Briefcase,
  DoorOpen,
  Users,
  ShoppingCart,
  Receipt,
  Package,
  Workflow,
  BarChart2,
  UserCog,
  Shield,
  Share2,
  Code2,
  Blocks,
  Settings,
  Handshake,
  Truck,
  Gift,
  Megaphone,
  UserCircle,
  Printer,
  Percent,
  Building2,
  type LucideIcon,
} from 'lucide-react'
import type { ModuleCategory, ModuleDefinition, ModuleId, TenantPlan } from '@/types'

/**
 * Registro maestro de módulos de Sagitta.
 *
 * Regla: un complemento con `availability: 'disponible'` DEBE estar cableado con
 * `isEnabled('<modulo>.<complemento>')` en la UI. Lo que no está cableado se declara
 * como `parcial` o `planificado` y solo se muestra como hoja de ruta.
 *
 * Documentación funcional: docs/product/MODULE_MAP.md y CAPABILITY_CATALOG.md
 */

export const MODULE_CATEGORIES: { id: ModuleCategory; label: string }[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'operaciones', label: 'Operaciones' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'ventas', label: 'Ventas' },
  { id: 'inventario', label: 'Inventario' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'analitica', label: 'Analítica' },
  { id: 'configuracion', label: 'Configuración' },
]

export const PLAN_ORDER: Record<TenantPlan, number> = { starter: 0, pro: 1, enterprise: 2 }

export const PLAN_LABEL: Record<TenantPlan, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export const MODULES: ModuleDefinition[] = [
  // ─── Inicio ────────────────────────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Panel',
    description: 'Resumen operativo del día: agenda, ingresos y alertas.',
    category: 'inicio',
    route: '/dashboard',
    core: true,
    availability: 'disponible',
    backend: 'mock',
    minPlan: 'starter',
    capabilities: ['KPIs del día', 'Próximas citas', 'Accesos rápidos'],
  },

  // ─── Operaciones ───────────────────────────────────────────────────────────
  {
    id: 'reservas',
    label: 'Citas',
    description: 'Agenda por profesional y recurso, reservas online y administrativas.',
    category: 'operaciones',
    route: '/citas',
    permission: 'appointments.read',
    platformFlag: 'appointments',
    termKey: 'citas',
    core: false,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'starter',
    dependencies: { technical: ['servicios', 'profesionales'], functional: ['recursos', 'recepcion'] },
    capabilities: [
      'Vistas mes, semana y lista',
      'Wizard con carrito multi-servicio',
      'Recurrencia diaria/semanal/mensual/anual',
      'Presencial y virtual con enlace de videollamada',
      'Cancelación y facturación vinculada',
    ],
    addons: [
      { key: 'reservas.reprogramacion', label: 'Reprogramación asistida', description: 'Mover citas validando disponibilidad.', defaultEnabled: true, availability: 'parcial' },
      { key: 'reservas.grupales', label: 'Clases y reservas grupales', description: 'Cupos por sesión y capacidad.', defaultEnabled: false, availability: 'planificado' },
      { key: 'reservas.domicilio', label: 'Servicio a domicilio', description: 'Dirección, zona y tiempo de traslado.', defaultEnabled: false, availability: 'planificado' },
      { key: 'reservas.depositos', label: 'Depósitos y anticipos', description: 'Cobro previo para confirmar.', defaultEnabled: false, availability: 'planificado' },
      { key: 'reservas.politicas', label: 'Políticas de reserva', description: 'Antelación, ventana de cancelación y no-show.', defaultEnabled: false, availability: 'planificado' },
    ],
  },
  {
    id: 'recepcion',
    label: 'Recepción',
    description: 'Atención en mostrador: cola de walk-in y lista de espera.',
    category: 'operaciones',
    route: '/recepcion',
    permission: 'appointments.read',
    platformFlag: 'appointments',
    core: false,
    availability: 'disponible',
    backend: 'mock',
    minPlan: 'starter',
    dependencies: { technical: ['reservas'] },
    capabilities: ['Turnos por orden de llegada', 'Conversión de espera a cita'],
    addons: [
      { key: 'recepcion.walk_in', label: 'Cola de walk-in', description: 'Turnos sin cita con asignación de profesional.', defaultEnabled: true, availability: 'disponible' },
      { key: 'recepcion.lista_espera', label: 'Lista de espera', description: 'Clientes en espera de un hueco libre.', defaultEnabled: true, availability: 'disponible' },
    ],
  },
  {
    id: 'servicios',
    label: 'Servicios',
    description: 'Catálogo comercial: duración, precio, buffers, paquetes y membresías.',
    category: 'operaciones',
    route: '/servicios',
    permission: 'services.read',
    platformFlag: 'services',
    termKey: 'servicios',
    core: false,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'starter',
    capabilities: ['Categorías y duraciones', 'Buffers antes/después', 'Extras (add-ons)', 'Visibilidad en portal'],
    addons: [
      { key: 'servicios.paquetes', label: 'Paquetes de sesiones', description: 'Bonos prepagados de N sesiones.', defaultEnabled: true, availability: 'disponible' },
      { key: 'servicios.membresias', label: 'Membresías', description: 'Planes periódicos con beneficios.', defaultEnabled: true, availability: 'disponible' },
      { key: 'servicios.recetas', label: 'Insumos por servicio', description: 'Consumo de inventario al completar.', defaultEnabled: false, availability: 'parcial' },
      { key: 'servicios.precios_variables', label: 'Estrategias de precio', description: 'Desde, por duración, por profesional o recurso.', defaultEnabled: false, availability: 'planificado' },
    ],
  },
  {
    id: 'profesionales',
    label: 'Profesionales',
    description: 'Equipo que presta servicios: especialidades y jornadas.',
    category: 'operaciones',
    route: '/empleados',
    permission: 'employees.read',
    platformFlag: 'employees',
    termKey: 'profesionales',
    core: false,
    availability: 'parcial',
    backend: 'frontend_ready',
    minPlan: 'starter',
    capabilities: ['Directorio y especialidades', 'Visor de jornada laboral'],
    addons: [
      { key: 'profesionales.comisiones', label: 'Comisiones', description: 'Reglas y liquidación por venta o servicio.', defaultEnabled: false, availability: 'parcial' },
      { key: 'profesionales.ausencias', label: 'Vacaciones y ausencias', description: 'Solicitudes y aprobación.', defaultEnabled: false, availability: 'planificado' },
    ],
  },
  {
    id: 'recursos',
    label: 'Recursos',
    description: 'Salas, cabinas, equipos o bahías con capacidad, estado y bloqueos.',
    category: 'operaciones',
    route: '/recursos',
    permission: 'services.update',
    termKey: 'recursos',
    core: false,
    availability: 'disponible',
    backend: 'mock',
    minPlan: 'starter',
    dependencies: { functional: ['reservas'] },
    capabilities: ['Tipos, capacidad y estado', 'Asignación por sucursal'],
    addons: [
      { key: 'recursos.bloqueos', label: 'Bloqueos de agenda', description: 'Cierres, mantenimiento y ausencias.', defaultEnabled: true, availability: 'disponible' },
    ],
  },

  // ─── Clientes ──────────────────────────────────────────────────────────────
  {
    id: 'clientes',
    label: 'Clientes',
    description: 'Directorio y expediente: notas, archivos, consentimientos y campos propios.',
    category: 'clientes',
    route: '/clientes',
    permission: 'clients.read',
    platformFlag: 'clients',
    termKey: 'clientes',
    core: true,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'starter',
    capabilities: ['Expediente completo', 'Consentimientos', 'Campos personalizados', 'Historial'],
  },
  {
    id: 'crm',
    label: 'CRM Comercial',
    description: 'Pipeline de oportunidades, ciclo de vida del cliente y reactivación.',
    category: 'clientes',
    route: '/crm',
    permission: 'clients.read',
    platformFlag: 'clients',
    core: false,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'starter',
    dependencies: { technical: ['clientes'] },
    capabilities: ['Pipeline kanban', 'Gestión de oportunidades', 'Reactivación de clientes', 'Métricas de conversión'],
  },
  {
    id: 'fidelizacion',
    label: 'Fidelización',
    description: 'Puntos, niveles, recompensas y referidos.',
    category: 'clientes',
    core: false,
    availability: 'planificado',
    backend: 'backend_required',
    minPlan: 'pro',
    dependencies: { technical: ['clientes'], functional: ['pos'] },
    capabilities: ['Puntos por compra o visita', 'Niveles', 'Recompensas'],
  },
  {
    id: 'portal_cliente',
    label: 'Portal de cliente',
    description: 'Autoservicio: mis citas, compras, membresía y documentos.',
    category: 'clientes',
    core: false,
    availability: 'planificado',
    backend: 'backend_required',
    minPlan: 'pro',
    dependencies: { technical: ['clientes'], functional: ['reservas'] },
    capabilities: ['Reprogramar y cancelar', 'Historial de compras', 'Saldo de paquetes'],
  },

  // ─── Ventas ────────────────────────────────────────────────────────────────
  {
    id: 'pos',
    label: 'Punto de venta',
    description: 'Cobro de servicios y productos, historial y control de caja.',
    category: 'ventas',
    route: '/ventas',
    permission: 'sales.read',
    platformFlag: 'sales',
    core: false,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'starter',
    dependencies: { functional: ['inventario', 'servicios'] },
    capabilities: ['Carrito con impuestos y descuentos', 'Efectivo, tarjeta, transferencia y mixto', 'Apertura, cierre y arqueo de caja'],
    addons: [
      { key: 'pos.gift_cards', label: 'Gift cards', description: 'Emisión, saldo y redención.', defaultEnabled: false, availability: 'parcial' },
      { key: 'pos.promociones', label: 'Promociones automáticas', description: 'Reglas de descuento por producto, servicio o cliente.', defaultEnabled: false, availability: 'parcial' },
      { key: 'pos.devoluciones', label: 'Devoluciones y cambios', description: 'Reintegro a caja o crédito del cliente.', defaultEnabled: false, availability: 'planificado' },
    ],
  },
  {
    id: 'finanzas',
    label: 'Facturación',
    description: 'Facturas, cupones, reembolsos y estado de cobros.',
    category: 'ventas',
    route: '/finanzas',
    permission: 'sales.read',
    platformFlag: 'billing',
    core: false,
    availability: 'disponible',
    backend: 'mock',
    minPlan: 'starter',
    dependencies: { functional: ['pos', 'reservas'] },
    capabilities: ['Facturas vinculadas a citas', 'PDF e impresión', 'Cupones', 'Reembolsos'],
    addons: [
      { key: 'finanzas.cotizaciones', label: 'Cotizaciones y presupuestos', description: 'Documentos previos a la venta.', defaultEnabled: false, availability: 'planificado' },
      { key: 'finanzas.fiscal', label: 'Facturación electrónica', description: 'Timbrado según país.', defaultEnabled: false, availability: 'planificado' },
    ],
  },
  {
    id: 'hardware',
    label: 'Hardware y POS',
    description: 'Impresoras térmicas ESC/POS, Bluetooth, gaveta de dinero y escáneres.',
    category: 'ventas',
    route: '/hardware',
    permission: 'settings.manage',
    core: false,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'starter',
    dependencies: { functional: ['pos'] },
    capabilities: [
      'Impresoras térmicas 58mm y 80mm',
      'Conexión Web Bluetooth directa ESC/POS',
      'Apertura de cajón monedero',
      'Lector de códigos de barras HID',
    ],
  },
  {
    id: 'comisiones',
    label: 'Comisiones',
    description: 'Reglas de comisión por servicio y producto, cálculo automático y liquidación periódica a profesionales.',
    category: 'ventas',
    route: '/finanzas',
    configRoute: '/finanzas?tab=comisiones',
    permission: 'sales.read',
    core: false,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'pro',
    dependencies: { technical: ['profesionales'], functional: ['pos', 'servicios'] },
    capabilities: [
      'Porcentajes de comisión por servicio y producto',
      'Cálculo automático en órdenes del POS',
      'Liquidación periódica por empleado',
      'Historial de pagos de comisiones',
    ],
  },

  // ─── Inventario ────────────────────────────────────────────────────────────
  {
    id: 'inventario',
    label: 'Inventario',
    description: 'Productos, stock, movimientos y alertas de reposición.',
    category: 'inventario',
    route: '/inventario',
    permission: 'inventory.read',
    platformFlag: 'inventory',
    core: false,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'starter',
    dependencies: { functional: ['pos'] },
    capabilities: ['Compra, venta, ajuste, merma y transferencia', 'Alertas de stock bajo'],
    addons: [
      { key: 'inventario.lotes', label: 'Lotes y vencimientos', description: 'Trazabilidad por lote.', defaultEnabled: false, availability: 'planificado' },
      { key: 'inventario.almacenes', label: 'Almacenes múltiples', description: 'Stock por ubicación.', defaultEnabled: false, availability: 'planificado' },
    ],
  },
  {
    id: 'compras',
    label: 'Compras y proveedores',
    description: 'Proveedores, órdenes de compra y recepción de mercancía.',
    category: 'inventario',
    core: false,
    availability: 'planificado',
    backend: 'mock',
    minPlan: 'starter',
    dependencies: { technical: ['inventario'] },
    capabilities: ['Órdenes de compra', 'Recepción parcial', 'Historial de costos'],
  },

  // ─── Marketing ─────────────────────────────────────────────────────────────
  {
    id: 'automatizaciones',
    label: 'Automatizaciones',
    description: 'Reglas disparador → condición → acción, plantillas y bitácora.',
    category: 'marketing',
    route: '/automatizaciones',
    permission: 'settings.manage',
    platformFlag: 'notifications',
    core: false,
    availability: 'disponible',
    backend: 'mock',
    minPlan: 'pro',
    dependencies: { functional: ['reservas', 'clientes'] },
    capabilities: ['Editor de reglas', 'Plantillas multicanal', 'Historial de ejecuciones'],
  },
  {
    id: 'marketing',
    label: 'Campañas',
    description: 'Segmentos dinámicos y campañas por email, WhatsApp o SMS.',
    category: 'marketing',
    core: false,
    availability: 'planificado',
    backend: 'integration_required',
    minPlan: 'pro',
    dependencies: { technical: ['clientes'], functional: ['automatizaciones'] },
    capabilities: ['Segmentos (inactivos, VIP, cumpleaños)', 'Envíos programados'],
  },

  // ─── Analítica ─────────────────────────────────────────────────────────────
  {
    id: 'reportes',
    label: 'Reportes',
    description: 'Indicadores de citas, ventas, clientes y servicios.',
    category: 'analitica',
    route: '/reportes',
    permission: 'reports.read',
    platformFlag: 'reports',
    core: false,
    availability: 'disponible',
    backend: 'mock',
    minPlan: 'starter',
    capabilities: ['Resumen', 'Citas por estado', 'Ventas por método de pago', 'Recurrencia de clientes'],
  },

  // ─── Configuración ─────────────────────────────────────────────────────────
  {
    id: 'usuarios',
    label: 'Usuarios',
    description: 'Cuentas de acceso del personal.',
    category: 'configuracion',
    route: '/usuarios',
    permission: 'users.manage',
    core: true,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'starter',
    capabilities: ['Alta de usuarios', 'Asignación de rol y sucursal'],
  },
  {
    id: 'roles',
    label: 'Roles y permisos',
    description: 'Matriz de permisos por módulo.',
    category: 'configuracion',
    route: '/roles',
    permission: 'roles.manage',
    platformFlag: 'roles',
    core: true,
    availability: 'parcial',
    backend: 'frontend_ready',
    minPlan: 'starter',
    capabilities: ['Roles de sistema protegidos', 'Editor de matriz'],
  },
  {
    id: 'modulos',
    label: 'Módulos y sector',
    description: 'Activa módulos y complementos según el tipo de negocio.',
    category: 'configuracion',
    route: '/modulos',
    permission: 'settings.manage',
    core: true,
    availability: 'disponible',
    backend: 'backend_required',
    minPlan: 'starter',
    capabilities: ['Presets por sector', 'Activación con dependencias', 'Terminología por sector'],
  },
  {
    id: 'integraciones',
    label: 'Integraciones',
    description: 'Calendarios, videollamadas, WhatsApp y webhooks.',
    category: 'configuracion',
    route: '/integraciones',
    permission: 'settings.manage',
    core: false,
    availability: 'parcial',
    backend: 'integration_required',
    minPlan: 'starter',
    capabilities: ['Exportar a Google Calendar / .ics', 'Webhooks firmados (simulado)', 'WhatsApp (simulado)'],
  },
  {
    id: 'desarrolladores',
    label: 'Desarrolladores',
    description: 'API keys, documentación OpenAPI, conectores y auditoría.',
    category: 'configuracion',
    route: '/desarrolladores',
    permission: 'settings.manage',
    platformFlag: 'settings',
    core: false,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'pro',
    capabilities: ['API keys con alcance', 'Consola OpenAPI', 'Bitácora de auditoría'],
  },
  {
    id: 'ajustes',
    label: 'Empresa y marca',
    description: 'Datos del negocio, marca blanca, apariencia y widget.',
    category: 'configuracion',
    route: '/ajustes',
    permission: 'settings.manage',
    platformFlag: 'settings',
    core: true,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'starter',
    capabilities: ['Marca blanca', 'Paletas y tipografía', 'Widget embebible'],
  },
  {
    id: 'sucursales',
    label: 'Sucursales y Sedes',
    description: 'Gestión multi-sede, selector de sucursal activa, horarios independientes y aislamiento de agenda.',
    category: 'configuracion',
    route: '/configuracion',
    configRoute: '/configuracion?tab=ubicaciones',
    permission: 'settings.manage',
    core: false,
    availability: 'disponible',
    backend: 'frontend_ready',
    minPlan: 'pro',
    dependencies: { functional: ['recursos', 'profesionales'] },
    capabilities: [
      'Multi-tenant con cambio instantáneo de sede',
      'Aislamiento de citas por ubicación',
      'Asignación de recursos y personal por sede',
      'Horarios y festivos específicos por sucursal',
    ],
  },
]

export const MODULE_ICONS: Record<ModuleId, LucideIcon> = {
  dashboard: LayoutDashboard,
  reservas: CalendarDays,
  recepcion: ConciergeBell,
  servicios: Sparkles,
  profesionales: Briefcase,
  recursos: DoorOpen,
  clientes: Users,
  crm: Handshake,
  fidelizacion: Gift,
  portal_cliente: UserCircle,
  pos: ShoppingCart,
  finanzas: Receipt,
  inventario: Package,
  compras: Truck,
  automatizaciones: Workflow,
  marketing: Megaphone,
  reportes: BarChart2,
  usuarios: UserCog,
  roles: Shield,
  modulos: Blocks,
  integraciones: Share2,
  desarrolladores: Code2,
  ajustes: Settings,
  hardware: Printer,
  comisiones: Percent,
  sucursales: Building2,
}

const MODULE_INDEX = new Map<ModuleId, ModuleDefinition>(MODULES.map((m) => [m.id, m]))

export function getModule(id: ModuleId): ModuleDefinition | undefined {
  return MODULE_INDEX.get(id)
}

/** Todas las claves de complementos declaradas (para validar perfiles guardados) */
export const ALL_ADDON_KEYS: string[] = MODULES.flatMap((m) => (m.addons ?? []).map((a) => a.key))

/** Módulos que dependen técnicamente (directa o transitivamente) de `id` */
export function getTechnicalDependents(id: ModuleId): ModuleId[] {
  const result = new Set<ModuleId>()
  const visit = (target: ModuleId) => {
    for (const m of MODULES) {
      if (m.dependencies?.technical?.includes(target) && !result.has(m.id)) {
        result.add(m.id)
        visit(m.id)
      }
    }
  }
  visit(id)
  return [...result]
}

/** Dependencias técnicas (directas y transitivas) de `id` */
export function getTechnicalRequirements(id: ModuleId): ModuleId[] {
  const result = new Set<ModuleId>()
  const visit = (target: ModuleId) => {
    for (const dep of getModule(target)?.dependencies?.technical ?? []) {
      if (!result.has(dep)) {
        result.add(dep)
        visit(dep)
      }
    }
  }
  visit(id)
  return [...result]
}
