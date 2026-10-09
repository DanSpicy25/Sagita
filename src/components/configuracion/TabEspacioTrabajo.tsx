import {
  LayoutGrid,
  Calendar,
  Compass,
  Star,
  History,
  Bell,
  Trash2,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react'
import { Button, Switch, Badge } from '@/components/ui'
import { useWorkspacePreferences } from '@/hooks/useWorkspacePreferences'
import { useConfiguracion } from '@/context/ConfiguracionContext'
import { useToast } from '@/hooks/useToast'
import type { Densidad } from '@/types'

export function TabEspacioTrabajo() {
  const {
    preferences,
    updatePreference,
    resetPreferences,
    favorites,
    removeFavorite,
    clearFavorites,
    recents,
    clearRecents,
  } = useWorkspacePreferences()

  const { configuracion, actualizarConfiguracion } = useConfiguracion()
  const { toast } = useToast()

  const handleDensidadChange = async (d: Densidad) => {
    updatePreference('densidad', d)
    try {
      await actualizarConfiguracion({ ...configuracion, densidad: d })
    } catch {
      // ignore
    }
  }

  const handleReset = () => {
    resetPreferences()
    toast.info('Preferencias restablecidas', 'Se han restaurado los valores por defecto del espacio de trabajo.')
  }

  const densidades: { id: Densidad; label: string; desc: string }[] = [
    {
      id: 'compact',
      label: 'Compacta',
      desc: 'Alta densidad de datos y márgenes reducidos. Ideal para terminales POS y monitores pequeños.',
    },
    {
      id: 'comfortable',
      label: 'Confortable (Estándar)',
      desc: 'Espaciado armónico y legible para flujos de reservas y navegación diaria.',
    },
    {
      id: 'spacious',
      label: 'Espaciosa',
      desc: 'Márgenes generosos y alto respiro visual. Recomendada para tablets y pantallas táctiles.',
    },
  ]

  const vistasCalendario = [
    { id: 'dia', label: 'Día' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
    { id: 'lista', label: 'Lista' },
  ] as const

  const rutasInicio = [
    { ruta: '/dashboard', label: 'Centro de Mando (Dashboard)' },
    { ruta: '/citas', label: 'Agenda de Citas' },
    { ruta: '/ventas', label: 'Terminal Punto de Venta (POS)' },
    { ruta: '/recepcion', label: 'Recepción & Walk-in' },
    { ruta: '/clientes', label: 'Directorio de Clientes' },
  ]

  return (
    <div className="space-y-6">
      {/* ── 1. Densidad y Diseño del Espacio de Trabajo ── */}
      <div className="card p-6 border border-border bg-surface space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-text flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              Densidad de Interfaz
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Ajusta la compactación de tablas, celdas y listas para adaptarlas a la pantalla de tu negocio.
            </p>
          </div>
          <Badge variant="primary" size="sm">
            {preferences.densidad}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {densidades.map((d) => {
            const isSelected = preferences.densidad === d.id
            return (
              <div
                key={d.id}
                onClick={() => handleDensidadChange(d.id)}
                className={[
                  'p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none',
                  isSelected
                    ? 'border-primary bg-primary-soft/15 shadow-2xs'
                    : 'border-border bg-surface hover:border-border-hover hover:bg-surface-subtle/50',
                ].join(' ')}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-text">{d.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">{d.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 2. Vistas Predeterminadas ── */}
      <div className="card p-6 border border-border bg-surface space-y-4">
        <div>
          <h3 className="font-bold text-base text-text flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Vistas Predeterminadas
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Define la pantalla que se abre al entrar y la vista por defecto de la agenda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Vista inicial de Calendario */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-text-muted" />
              Vista inicial de la Agenda
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-surface-subtle rounded-xl border border-border">
              {vistasCalendario.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => updatePreference('vistaPredeterminadaCalendario', v.id)}
                  className={[
                    'py-1.5 text-xs font-semibold rounded-lg transition-all text-center capitalize cursor-pointer',
                    preferences.vistaPredeterminadaCalendario === v.id
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-text-muted hover:text-text',
                  ].join(' ')}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Módulo de Inicio */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-text-muted" />
              Pantalla al Iniciar Sesión
            </label>
            <select
              value={preferences.rutaInicioPredeterminada}
              onChange={(e) => updatePreference('rutaInicioPredeterminada', e.target.value)}
              className="input-base text-xs py-2 w-full"
            >
              {rutasInicio.map((r) => (
                <option key={r.ruta} value={r.ruta}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Preferencias de Navegación ── */}
      <div className="card p-6 border border-border bg-surface space-y-4">
        <div>
          <h3 className="font-bold text-base text-text flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            Navegación & Menú Lateral
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Controla el comportamiento ergonómico de la barra de navegación en escritorio.
          </p>
        </div>

        <div className="divide-y divide-border-subtle pt-1">
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-text block">
                Colapsar barra lateral por defecto
              </span>
              <span className="text-[11px] text-text-muted block mt-0.5">
                Inicia con el menú comprimido en iconos para priorizar el espacio de trabajo en pantallas reducidas.
              </span>
            </div>
            <Switch
              checked={preferences.sidebarColapsadaPorDefecto}
              onChange={(checked) => updatePreference('sidebarColapsadaPorDefecto', checked)}
              label=""
            />
          </div>
        </div>
      </div>

      {/* ── 4. Notificaciones y Alertas del Sistema ── */}
      <div className="card p-6 border border-border bg-surface space-y-4">
        <div>
          <h3 className="font-bold text-base text-text flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Alertas & Notificaciones Operativas
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Configura los avisos y advertencias visuales en el mostrador de atención.
          </p>
        </div>

        <div className="divide-y divide-border-subtle">
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-text block">
                Alertas de Stock Crítico
              </span>
              <span className="text-[11px] text-text-muted block mt-0.5">
                Muestra insignias visuales cuando un producto de inventario alcance su umbral mínimo.
              </span>
            </div>
            <Switch
              checked={preferences.alertasStockCritico}
              onChange={(checked) => updatePreference('alertasStockCritico', checked)}
              label=""
            />
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-text block">
                Avisos de Nuevas Citas Online
              </span>
              <span className="text-[11px] text-text-muted block mt-0.5">
                Notifica en pantalla cuando un cliente reserve o confirme a través del portal público.
              </span>
            </div>
            <Switch
              checked={preferences.alertasNuevasCitas}
              onChange={(checked) => updatePreference('alertasNuevasCitas', checked)}
              label=""
            />
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-text block">
                Efectos Sonoros en Mostrador
              </span>
              <span className="text-[11px] text-text-muted block mt-0.5">
                Sonido de confirmación al escanear código de barras o llamar turno en recepción.
              </span>
            </div>
            <Switch
              checked={preferences.sonidosNotificacion}
              onChange={(checked) => updatePreference('sonidosNotificacion', checked)}
              label=""
            />
          </div>
        </div>
      </div>

      {/* ── 5. Gestión de Favoritos e Historial de Omnibar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Favoritos */}
        <div className="card p-5 border border-border bg-surface space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-text flex items-center gap-1.5">
              <Star className="w-4 h-4 text-warning" />
              Atajos Favoritos ({favorites.length})
            </h4>
            {favorites.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFavorites} className="text-xs text-danger h-7">
                Limpiar
              </Button>
            )}
          </div>
          {favorites.length === 0 ? (
            <p className="text-[11px] text-text-muted italic py-2">
              No tienes atajos favoritos guardados. Presiona Ctrl+K y haz clic en la estrella para anclar comandos.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {favorites.map((fav) => (
                <div
                  key={fav}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle text-xs border border-border"
                >
                  <span className="font-medium text-text truncate">{fav}</span>
                  <button
                    type="button"
                    onClick={() => removeFavorite(fav)}
                    className="text-text-muted hover:text-danger p-1"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historial de Comandos Recientes */}
        <div className="card p-5 border border-border bg-surface space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-text flex items-center gap-1.5">
              <History className="w-4 h-4 text-primary" />
              Historial de Búsquedas ({recents.length})
            </h4>
            {recents.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearRecents} className="text-xs text-danger h-7">
                Limpiar
              </Button>
            )}
          </div>
          {recents.length === 0 ? (
            <p className="text-[11px] text-text-muted italic py-2">
              El historial de búsquedas recientes está limpio.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {recents.map((rec) => (
                <div
                  key={rec}
                  className="p-2 rounded-lg bg-surface-subtle text-xs text-text border border-border truncate"
                >
                  {rec}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Botón Restablecer Todo ── */}
      <div className="pt-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Restaurar Valores Predeterminados
        </Button>
      </div>
    </div>
  )
}

