import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Clock,
  ArrowRight,
  Check,
  Play,
  CheckCircle2,
  ShoppingCart,
  User,
  FileText,
  UserCheck,
} from 'lucide-react'
import { Cita, EstadoCita } from '@/types'
import { Badge, Button, EmptyState } from '@/components/ui'
import { citasService } from '@/services/citas.service'
import { useOptimisticAction } from '@/hooks/useOptimisticAction'
import { useRole } from '@/hooks/useRole'
import { useSector } from '@/context/SectorContext'

export interface WidgetAgendaHoyProps {
  citas: Cita[]
  onUpdateCitas: (updater: (prev: Cita[]) => Cita[]) => void
}

function estadoBadgeVariant(
  estado: EstadoCita
): 'success' | 'warning' | 'info' | 'error' | 'default' {
  switch (estado) {
    case 'confirmada':
      return 'success'
    case 'pendiente':
    case 'en_cola':
      return 'warning'
    case 'en_atencion':
      return 'info'
    case 'completada':
      return 'default'
    case 'cancelada':
      return 'error'
    default:
      return 'default'
  }
}

export function WidgetAgendaHoy({
  citas,
  onUpdateCitas,
}: WidgetAgendaHoyProps) {
  const navigate = useNavigate()
  const { isWorker, isAssignedToUser, capabilities } = useRole()
  const { execute } = useOptimisticAction<Cita[]>()
  const { vocabulario, tokens } = useSector()

  // Alcance de visualización: para trabajadores por defecto es 'mis_citas'
  const [alcance, setAlcance] = useState<'mis_citas' | 'todas'>(() =>
    isWorker ? 'mis_citas' : 'todas'
  )
  const [filtroEstado, setFiltroEstado] = useState<string>('todas')

  const hoyStr = new Date().toISOString().slice(0, 10)
  const citasHoy = citas
    .filter((c) => c.fecha_inicio.startsWith(hoyStr))
    .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))

  // Filtrado por alcance
  const citasPorAlcance =
    alcance === 'mis_citas'
      ? citasHoy.filter((c) => isAssignedToUser(c))
      : citasHoy

  // Filtrado por estado
  const citasFiltradas =
    filtroEstado === 'todas'
      ? citasPorAlcance
      : citasPorAlcance.filter((c) => c.estado === filtroEstado)

  // Mutación optimista genérica para transiciones de estado
  const handleCambiarEstado = async (
    citaId: number,
    nuevoEstado: EstadoCita,
    etiquetaAccion: string
  ) => {
    await execute(
      citas,
      (updater) => {
        if (typeof updater === 'function') {
          onUpdateCitas(updater)
        } else {
          onUpdateCitas(() => updater)
        }
      },
      {
        applyOptimistic: (current) =>
          current.map((c) =>
            c.id === citaId ? { ...c, estado: nuevoEstado } : c
          ),
        mutate: async () => {
          return await citasService.update(citaId, { estado: nuevoEstado })
        },
        successMessage: {
          title: `Cita ${etiquetaAccion}`,
          message: `El estado se ha actualizado a "${nuevoEstado.replace('_', ' ')}".`,
        },
      }
    )
  }

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden flex flex-col">
      {/* ── Header & Filter Bar ── */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-col gap-3 bg-surface-subtle/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-heading text-text leading-tight flex items-center gap-2">
                <span>
                  {alcance === 'mis_citas'
                    ? `Mis ${vocabulario.singularUnidad}s de Hoy`
                    : `${vocabulario.cola} de la Sede`}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-normal bg-surface border border-border text-text-muted">
                  {tokens.nombre.split('&')[0]}
                </span>
              </h2>
              <span className="text-[11px] text-text-muted">
                {citasPorAlcance.length} {vocabulario.singularUnidad.toLowerCase()}(s) en esta vista para la jornada
              </span>
            </div>
          </div>

          {/* Scope Toggle: Mis Citas vs Toda la Sede */}
          <div className="inline-flex p-0.5 rounded-lg bg-surface border border-border shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAlcance('mis_citas')}
              className={[
                'px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer select-none flex items-center gap-1',
                alcance === 'mis_citas'
                  ? 'bg-primary text-white shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text',
              ].join(' ')}
            >
              <UserCheck className="w-3 h-3" />
              <span>Mis Citas</span>
            </button>
            <button
              type="button"
              onClick={() => setAlcance('todas')}
              className={[
                'px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer select-none',
                alcance === 'todas'
                  ? 'bg-primary text-white shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text',
              ].join(' ')}
            >
              <span>Toda la Sede</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 border-t border-border-subtle pt-2.5">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'confirmada', label: 'Confirmadas' },
            { id: 'en_atencion', label: 'En Atención' },
            { id: 'completada', label: 'Completadas' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroEstado(tab.id)}
              className={[
                'px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap select-none',
                filtroEstado === tab.id
                  ? 'bg-surface-elevated text-primary border border-border shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text hover:bg-surface',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Appointment Timeline Body ── */}
      <div className="flex-1 divide-y divide-border-subtle overflow-y-auto max-h-[420px]">
        {citasFiltradas.length === 0 ? (
          <div className="py-10 px-4">
            <EmptyState
              title={
                filtroEstado === 'todas'
                  ? alcance === 'mis_citas'
                    ? `No tienes ${vocabulario.singularUnidad.toLowerCase()}s asignadas para hoy`
                    : `No hay ${vocabulario.singularUnidad.toLowerCase()}s registradas para hoy`
                  : `No hay ${vocabulario.singularUnidad.toLowerCase()}s ${filtroEstado.replace('_', ' ')}s`
              }
              description={
                alcance === 'mis_citas'
                  ? `Tu estación está libre. Puedes registrar una nueva operación o consultar ${vocabulario.cola}.`
                  : `El mostrador está listo para nuevas operaciones comerciales en ${tokens.nombre}.`
              }
              actionLabel={`Abrir ${vocabulario.singularUnidad} / POS`}
              onAction={() => navigate('/mostrador')}
            />
          </div>
        ) : (
          citasFiltradas.map((cita) => {
            const horaInicio = cita.fecha_inicio.slice(11, 16) || '--:--'
            const esPendiente = cita.estado === 'pendiente' || cita.estado === 'en_cola'
            const esConfirmada = cita.estado === 'confirmada'
            const esEnAtencion = cita.estado === 'en_atencion'

            return (
              <div
                key={cita.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-subtle/50 transition-colors group"
              >
                {/* Left: Time Badge + Service + Client */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-12 h-10 rounded-xl bg-surface-subtle border border-border flex flex-col items-center justify-center shrink-0 text-text font-mono">
                    <span className="text-xs font-bold leading-none">{horaInicio}</span>
                    <Clock className="w-2.5 h-2.5 text-text-muted mt-0.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs sm:text-sm text-text truncate">
                        {cita.servicio?.nombre || 'Servicio General'}
                      </span>
                      <Badge variant={estadoBadgeVariant(cita.estado)} size="sm">
                        {cita.estado.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5 truncate">
                      <span className="inline-flex items-center gap-1 truncate text-text font-medium">
                        <User className="w-3 h-3 text-text-muted" />
                        {cita.cliente?.nombre || 'Cliente sin nombre'}
                      </span>
                      <span>•</span>
                      <span className="truncate">
                        {cita.empleado?.nombre || 'Profesional no asignado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Operational Actions Tailored by Role */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle flex-wrap">
                  {/* Action 1: Confirmar (si está pendiente) */}
                  {esPendiente && (
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => handleCambiarEstado(cita.id, 'confirmada', 'confirmada')}
                      leftIcon={<Check className="w-3 h-3 text-success" />}
                      className="cursor-pointer"
                    >
                      Confirmar
                    </Button>
                  )}

                  {/* Action 2: Iniciar Atención (si está confirmada) */}
                  {esConfirmada && (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleCambiarEstado(cita.id, 'en_atencion', 'iniciada')}
                      leftIcon={<Play className="w-3 h-3 text-white fill-white" />}
                      className="cursor-pointer shadow-2xs"
                    >
                      Iniciar
                    </Button>
                  )}

                  {/* Action 3: Completar Atención (si está en atención) */}
                  {esEnAtencion && (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleCambiarEstado(cita.id, 'completada', 'completada')}
                      leftIcon={<CheckCircle2 className="w-3 h-3 text-white" />}
                      className="cursor-pointer shadow-2xs bg-success hover:bg-success/90 border-transparent text-white"
                    >
                      Completar
                    </Button>
                  )}

                  {/* Action 4: Ver Ficha Cliente */}
                  {cita.cliente_id ? (
                    <Link
                      to={`/clientes?id=${cita.cliente_id}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
                      title="Ver ficha del cliente"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="hidden md:inline">Ficha</span>
                    </Link>
                  ) : null}

                  {/* Action 5: Cobrar POS (solo si tiene permisos) */}
                  {capabilities.canChargePOS && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => navigate(`/ventas?cita_id=${cita.id}`)}
                      leftIcon={<ShoppingCart className="w-3 h-3 text-success" />}
                      className="cursor-pointer text-text-muted hover:text-success"
                      title="Cobrar en terminal POS"
                    >
                      Cobrar
                    </Button>
                  )}

                  {/* Action 6: Ver Detalle Completo de la Cita */}
                  <Link
                    to={`/citas?id=${cita.id}`}
                    className="p-1 rounded-md text-text-muted hover:text-text transition-colors"
                    title="Ver detalle de cita"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Footer Link to Full Calendar & POS ── */}
      <div className="p-3 border-t border-border bg-surface-subtle/30 flex items-center justify-between text-xs">
        <Link
          to="/mostrador"
          className="inline-flex items-center gap-1 font-semibold hover:underline cursor-pointer"
          style={{ color: tokens.accentColor }}
        >
          <span>Abrir Mostrador POS ({tokens.nombre.split('&')[0]})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/citas"
          className="inline-flex items-center gap-1 font-semibold text-text-muted hover:text-text hover:underline cursor-pointer"
        >
          <span>Calendario completo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
