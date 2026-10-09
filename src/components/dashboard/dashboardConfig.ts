import { UserRole } from '@/types'

export type DashboardWidgetId =
  | 'metricas'
  | 'agenda_hoy'
  | 'cola_recepcion'
  | 'alertas_operativas'
  | 'acciones_rapidas'

export interface DashboardWidgetMeta {
  id: DashboardWidgetId
  title: string
  description: string
  rolesPermitidos?: UserRole[]
  defaultVisible: boolean
}

export const DASHBOARD_WIDGETS: DashboardWidgetMeta[] = [
  {
    id: 'metricas',
    title: 'Métricas de la Jornada',
    description: 'Indicadores clave de ingresos, ocupación y actividad de clientes adaptados a tu rol.',
    defaultVisible: true,
  },
  {
    id: 'agenda_hoy',
    title: 'Agenda & Citas de Hoy',
    description: 'Línea de tiempo cronológica con citas programadas y acciones de mostrador.',
    defaultVisible: true,
  },
  {
    id: 'cola_recepcion',
    title: 'Cola de Espera Walk-in',
    description: 'Clientes recibidos en mostrador en espera de turno o profesional.',
    defaultVisible: true,
  },
  {
    id: 'alertas_operativas',
    title: 'Alertas & Stock Crítico',
    description: 'Notificaciones prioritarias de existencias bajas y citas sin confirmar.',
    defaultVisible: true,
  },
  {
    id: 'acciones_rapidas',
    title: 'Accesos Rápidos Operativos',
    description: 'Atajos táctiles para operaciones de mostrador frecuentes.',
    defaultVisible: true,
  },
]

export const DEFAULT_WIDGET_ORDER: DashboardWidgetId[] = [
  'metricas',
  'agenda_hoy',
  'cola_recepcion',
  'alertas_operativas',
  'acciones_rapidas',
]

const STORAGE_PREFS_KEY = 'sagitta_dashboard_widgets_v1'
const STORAGE_ORDER_KEY = 'sagitta_dashboard_widget_order_v1'

export function getWidgetPreferences(): Record<DashboardWidgetId, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_PREFS_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // fallback
  }

  const defaults: Record<string, boolean> = {}
  DASHBOARD_WIDGETS.forEach((w) => {
    defaults[w.id] = w.defaultVisible
  })
  return defaults as Record<DashboardWidgetId, boolean>
}

export function saveWidgetPreferences(prefs: Record<DashboardWidgetId, boolean>): void {
  try {
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // ignore
  }
}

export function getWidgetOrder(): DashboardWidgetId[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDER_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Asegurar que todos los widgets conocidos estén presentes
        const validIds = new Set(DEFAULT_WIDGET_ORDER)
        const filtered = parsed.filter((id) => validIds.has(id))
        const missing = DEFAULT_WIDGET_ORDER.filter((id) => !filtered.includes(id))
        return [...filtered, ...missing]
      }
    }
  } catch {
    // fallback
  }
  return [...DEFAULT_WIDGET_ORDER]
}

export function saveWidgetOrder(order: DashboardWidgetId[]): void {
  try {
    localStorage.setItem(STORAGE_ORDER_KEY, JSON.stringify(order))
  } catch {
    // ignore
  }
}

export function resetWidgetConfig(): {
  prefs: Record<DashboardWidgetId, boolean>
  order: DashboardWidgetId[]
} {
  const defaults: Record<string, boolean> = {}
  DASHBOARD_WIDGETS.forEach((w) => {
    defaults[w.id] = w.defaultVisible
  })
  saveWidgetPreferences(defaults as Record<DashboardWidgetId, boolean>)
  saveWidgetOrder(DEFAULT_WIDGET_ORDER)
  return {
    prefs: defaults as Record<DashboardWidgetId, boolean>,
    order: [...DEFAULT_WIDGET_ORDER],
  }
}
