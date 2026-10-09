import { useState } from 'react'
import {
  HelpCircle,
  RotateCcw,
  Sparkles,
  Play,
  Keyboard,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Shield,
  Package,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { useFirstUseHint } from '@/hooks/useFirstUseHint'
import { useOnboarding, OnboardingWizard } from '@/components/onboarding'
import { useToast } from '@/hooks/useToast'
import { Link } from 'react-router-dom'

export function TabAyudaOnboarding() {
  const { resetAllHints, resetHint, isHintDismissed, getDismissedCount } = useFirstUseHint()
  const { reopenOnboarding, resetOnboarding, completedCount, totalSteps, isCompleted } = useOnboarding()
  const { toast } = useToast()
  const [wizardOpen, setWizardOpen] = useState(false)

  const handleReplayTips = () => {
    resetAllHints()
    toast.success('Consejos reactivados', 'Se han restablecido todas las sugerencias contextuales en la interfaz')
  }

  const handleRelaunchOnboarding = () => {
    reopenOnboarding()
    setWizardOpen(true)
  }

  const handleResetCompleteOnboarding = () => {
    resetOnboarding()
    setWizardOpen(true)
    toast.info('Asistente reiniciado', 'Comenzando desde el paso 1')
  }

  const dismissedCount = getDismissedCount()

  // Catálogo de hints contextuales del sistema
  const hintsCatalogo = [
    {
      key: 'dashboard_intro',
      titulo: 'Panel de Control & KPIs',
      descripcion: 'Explicación del cálculo de ingresos, citas y personalización de widgets.',
      modulo: 'Dashboard',
      icono: LayoutDashboard,
    },
    {
      key: 'citas_buffers',
      titulo: 'Tiempos de Amortiguación & Buffers',
      descripcion: 'Cómo evitar choques de agenda y dar tiempo de limpieza/preparación entre turnos.',
      modulo: 'Citas',
      icono: Calendar,
    },
    {
      key: 'recursos_capacidad',
      titulo: 'Capacidad Física de Salas vs Personal',
      descripcion: 'Por qué la disponibilidad de cabinas limita turnos simultáneos aun con personal libre.',
      modulo: 'Recursos',
      icono: Layers,
    },
    {
      key: 'inventario_umbral',
      titulo: 'Umbrales de Stock Mínimo & Reorden',
      descripcion: 'Alertas automáticas antes de agotar productos de reventa o insumos internos.',
      modulo: 'Inventario',
      icono: Package,
    },
    {
      key: 'roles_seguridad',
      titulo: 'Matriz de Permisos & Seguridad',
      descripcion: 'Principio de menor privilegio para recepcionistas, especialistas y cajeros.',
      modulo: 'Roles',
      icono: Shield,
    },
    {
      key: 'servicios_overview',
      titulo: 'Catálogo de Servicios & Multi-Duración',
      descripcion: 'Estructuración de tratamientos express vs sesiones extendidas.',
      modulo: 'Servicios',
      icono: Sparkles,
    },
    {
      key: 'modulos_overview',
      titulo: 'Plataforma Modular & Presets por Sector',
      descripcion: 'Activación y desactivación de funcionalidades según tu giro de negocio.',
      modulo: 'Módulos',
      icono: Layers,
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Encabezado de la Pestaña ── */}
      <div>
        <h3 className="text-base font-bold text-text flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span>Ayuda, Guías & Asistencia Contextual</span>
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Controla la frecuencia de sugerencias en pantalla, vuelve a ejecutar el asistente de inicio o consulta atajos de productividad.
        </p>
      </div>

      {/* ── Bloque 1: Controles Principales de Onboarding & Replay Tips ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta Replay Tips */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Replay Tips (Reiniciar Consejos)</span>
              </span>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted border border-border">
                {dismissedCount} consejos ocultos
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Si tú o un nuevo miembro del equipo desean volver a ver las notas de ayuda flotantes en citas, inventario y dashboard, reactívalas aquí en un clic.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReplayTips}
              className="w-full gap-2 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reactivar todos los consejos</span>
            </Button>
          </div>
        </div>

        {/* Tarjeta Asistente de Inicio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-500" />
                <span>Asistente de Bienvenida (Onboarding)</span>
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {isCompleted ? 'Completado' : `${completedCount}/${totalSteps} pasos`}
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Vuelve a abrir el asistente guiado de 7 pasos para actualizar los datos base de tu negocio, horarios, catálogo y métodos de cobro.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleRelaunchOnboarding}
              className="flex-1 gap-1.5 text-xs font-semibold"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Abrir Asistente</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetCompleteOnboarding}
              className="text-xs text-text-muted hover:text-text"
              title="Reiniciar progreso desde cero"
            >
              Reiniciar
            </Button>
          </div>
        </div>
      </div>

      {/* ── Bloque 2: Directorio de Consejos Contextuales Disponibles ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h4 className="text-xs font-bold text-text">
              Directorio de Consejos Contextuales en Sagitta
            </h4>
            <p className="text-[11px] text-text-muted">
              Puedes ver el estado de cada sugerencia y restablecerlas individualmente.
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {hintsCatalogo.map((hint) => {
            const Icon = hint.icono
            const oculto = isHintDismissed(hint.key)

            return (
              <div
                key={hint.key}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs first:pt-1 last:pb-1"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface-subtle text-primary border border-border mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text">{hint.titulo}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-subtle text-text-muted font-mono">
                        {hint.modulo}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {hint.descripcion}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      oculto
                        ? 'bg-surface-subtle text-text-muted'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {oculto ? 'Descartado' : 'Activo'}
                  </span>

                  {oculto && (
                    <button
                      type="button"
                      onClick={() => {
                        resetHint(hint.key)
                        toast.success('Consejo reactivado', `Se mostrará en la pantalla de ${hint.modulo}`)
                      }}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Reactivar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Bloque 3: Atajos de Teclado & Enlaces de Productividad ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Atajos Rápidos */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-text">
            <Keyboard className="w-4 h-4 text-text-muted" />
            <span>Atajos de Teclado del Sistema</span>
          </div>

          <div className="space-y-1.5 text-xs text-text-muted">
            <div className="flex items-center justify-between py-1 border-b border-border/50">
              <span>Menú de Comandos & Búsqueda</span>
              <kbd className="px-2 py-0.5 rounded bg-surface border border-border text-[11px] font-mono font-bold text-text">
                ⌘K / Ctrl+K
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/50">
              <span>Cerrar diálogos y modales</span>
              <kbd className="px-2 py-0.5 rounded bg-surface border border-border text-[11px] font-mono font-bold text-text">
                Esc
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Navegar controles</span>
              <kbd className="px-2 py-0.5 rounded bg-surface border border-border text-[11px] font-mono font-bold text-text">
                Tab / Shift+Tab
              </kbd>
            </div>
          </div>
        </div>

        {/* Recursos Externos & Demo Center */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-text">
              <Info className="w-4 h-4 text-text-muted" />
              <span>Entornos de Aprendizaje & Demostración</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              ¿Quieres capacitar a un nuevo empleado sin riesgo de alterar citas o facturación real? Abre el Demo Center para probar con datos ficticios.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/demo"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>Abrir Demo Center Interactivo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal del Asistente cuando se lanza desde aquí */}
      <OnboardingWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  )
}

