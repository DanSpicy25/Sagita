import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ShoppingCart,
  SlidersHorizontal,
  Building2,
  Clock,
  Sparkles,
  ConciergeBell,
  UserCheck,
} from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { useTenant } from '@/hooks/useTenant'
import { useSector } from '@/context/SectorContext'
import { Badge, Button, FirstUseHint } from '@/components/ui'

export interface DashboardHeroProps {
  onOpenConfig: () => void
  citasHoyCount: number
  citasPendientesCount: number
  misCitasHoyCount?: number
  misCitasPendientesCount?: number
}

export function DashboardHero({
  onOpenConfig,
  citasHoyCount,
  citasPendientesCount,
  misCitasHoyCount,
  misCitasPendientesCount,
}: DashboardHeroProps) {
  const { user, isWorker, isReceptionist, roleLabel } = useRole()
  const { tenantActivo } = useTenant()
  const { vocabulario, tokens } = useSector()

  // Saludo contextual según la hora del día
  const hora = new Date().getHours()
  const saludo =
    hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const fechaTexto = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const primerNombre = user?.nombre ? user.nombre.split(' ')[0] : 'Operador'

  // Mensaje de subtítulo adaptado por rol y vocabulario sectorial
  const unidadPlural = vocabulario.singularUnidad.toLowerCase() + 's'

  const renderSubtitulo = () => {
    if (isWorker) {
      const personalCount = misCitasHoyCount ?? citasHoyCount
      const personalPendientes = misCitasPendientesCount ?? citasPendientesCount

      if (personalCount > 0) {
        return (
          <>
            Tienes <strong className="text-text font-semibold">{personalCount} {unidadPlural}</strong> asignadas para ti hoy
            {personalPendientes > 0 && (
              <span className="text-warning font-medium"> ({personalPendientes} pendientes en {vocabulario.cola.toLowerCase()})</span>
            )}.
          </>
        )
      }
      return `No tienes ${unidadPlural} asignadas para ti hoy. ¡Tu estación está lista para ${vocabulario.accionPrincipal.toLowerCase()}!`
    }

    if (isReceptionist) {
      if (citasHoyCount > 0) {
        return (
          <>
            Hay <strong className="text-text font-semibold">{citasHoyCount} {unidadPlural}</strong> en {vocabulario.cola.toLowerCase()} hoy
            {citasPendientesCount > 0 && (
              <span className="text-warning font-medium"> ({citasPendientesCount} pendientes de atención en mostrador)</span>
            )}.
          </>
        )
      }
      return `No hay ${unidadPlural} en cola para hoy. Mostrador disponible para recibir operaciones espontáneas.`
    }

    // Default / Admin / Gerente / Superadmin
    if (citasHoyCount > 0) {
      return (
        <>
          La sucursal tiene <strong className="text-text font-semibold">{citasHoyCount} {unidadPlural}</strong> registradas para hoy
          {citasPendientesCount > 0 && (
            <span className="text-warning font-medium"> ({citasPendientesCount} pendientes de procesar)</span>
          )}.
        </>
      )
    }
    return `No hay ${unidadPlural} registradas para hoy en esta sucursal. Jornada lista para operaciones comerciales en ${tokens.nombre}.`
  }

  // Insignia de rol con variantes visuales
  const badgeVariant = isWorker
    ? 'secondary'
    : isReceptionist
    ? 'warning'
    : 'primary'

  return (
    <div className="space-y-4">
      {/* ── First-Use Hint: Introducción Contextual ── */}
      <FirstUseHint
        hintKey="dashboard_intro"
        title={isWorker ? 'Tu Espacio de Trabajo Personal' : 'Centro de Mando Personalizado'}
        description={
          isWorker
            ? `Aquí tienes el seguimiento directo de tus ${unidadPlural} y operaciones del día en ${tokens.nombre}.`
            : `Aquí tienes la visión operativa en tiempo real de tu jornada en ${tokens.nombre}.`
        }
        variant="callout"
        icon={<Sparkles className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
      />

      {/* ── Hero Panel ── */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Column: Greeting, Role & Branch Context */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={badgeVariant} size="sm" className="font-semibold uppercase tracking-wider text-[10px]">
                {roleLabel}
              </Badge>

              {tenantActivo && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-subtle border border-border text-text-muted">
                  <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-none">
                    {tenantActivo.nombre}
                  </span>
                </div>
              )}

              {/* Sector Activo Badge */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
              >
                <span>{tokens.iconEmoji}</span>
                <span className="truncate max-w-[150px]">{tokens.nombre}</span>
              </div>

              <div className="inline-flex items-center gap-1 text-xs text-text-muted hidden sm:inline-flex">
                <Clock className="w-3.5 h-3.5" />
                <span className="capitalize">{fechaTexto}</span>
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-text tracking-tight">
                {saludo}, {primerNombre}
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                {renderSubtitulo()}
              </p>
            </div>
          </div>

          {/* Right Column: Tactical Action Shortcuts Adaptados por Rol */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
            {isWorker ? (
              <>
                <Link to="/citas">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CalendarDays className="w-4 h-4" />}
                    className="cursor-pointer shadow-xs"
                  >
                    Ver Mi Agenda
                  </Button>
                </Link>

                <Link to="/citas/nueva">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<UserCheck className="w-4 h-4 text-primary" />}
                    className="cursor-pointer"
                  >
                    Agendar Cita
                  </Button>
                </Link>
              </>
            ) : isReceptionist ? (
              <>
                <Link to="/recepcion">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<ConciergeBell className="w-4 h-4" />}
                    className="cursor-pointer shadow-xs"
                  >
                    Recepción Walk-in
                  </Button>
                </Link>

                <Link to="/ventas">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<ShoppingCart className="w-4 h-4 text-success" />}
                    className="cursor-pointer"
                  >
                    Cobrar POS
                  </Button>
                </Link>

                <Link to="/citas/nueva">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<CalendarDays className="w-4 h-4" />}
                    className="cursor-pointer hidden sm:inline-flex text-text-muted hover:text-text"
                  >
                    Agendar
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/mostrador">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    className="cursor-pointer shadow-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    {vocabulario.accionPrincipal}
                  </Button>
                </Link>

                <Link to="/citas/nueva">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<CalendarDays className="w-4 h-4 text-primary" />}
                    className="cursor-pointer"
                  >
                    Agendar {vocabulario.singularUnidad}
                  </Button>
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={onOpenConfig}
              className="text-text-muted hover:text-text cursor-pointer"
              aria-label="Personalizar widgets del dashboard"
              title="Personalizar widgets"
            >
              <span className="hidden sm:inline">Ajustes</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
