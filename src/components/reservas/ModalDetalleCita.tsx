import {
  Calendar as CalIcon,
  Receipt,
  FileDown,
  Printer,
  RefreshCw,
  Video,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react'
import type { Cita, EstadoCita, ConfiguracionMarcaBlanca } from '@/types'
import { Modal, Button, Badge } from '@/components/ui'
import { descargarArchivoIcs, descargarCitaPdf, visualizarCitaPdf } from '@/utils/calendar'

export interface ModalDetalleCitaProps {
  cita: Cita | null
  isOpen: boolean
  onClose: () => void
  onCambiarEstado: (id: number, nuevoEstado: EstadoCita) => Promise<void>
  onCancelarCita: (id: number) => Promise<void>
  onReprogramar: (cita: Cita) => void
  onVerFactura: (cita: Cita) => void
  configuracion: ConfiguracionMarcaBlanca
  citaTerm?: string
}

function estadoBadgeVariant(estado: EstadoCita): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (estado) {
    case 'confirmada': return 'success'
    case 'pendiente': return 'warning'
    case 'en_atencion': return 'info'
    case 'completada': return 'default'
    case 'cancelada':
    case 'no_asistio': return 'danger'
    default: return 'default'
  }
}

export function ModalDetalleCita({
  cita,
  isOpen,
  onClose,
  onCambiarEstado,
  onCancelarCita,
  onReprogramar,
  onVerFactura,
  configuracion,
  citaTerm = 'Cita',
}: ModalDetalleCitaProps) {
  if (!cita) return null

  const esVirtual = cita.servicio?.nombre.toLowerCase().includes('virtual') ||
    cita.servicio?.nombre.toLowerCase().includes('online') ||
    cita.notas?.toLowerCase().includes('meet') ||
    cita.notas?.toLowerCase().includes('zoom')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles de la ${citaTerm} · #CIT-${String(cita.id).padStart(4, '0')}`}
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          {/* Transición de Estados Principales */}
          <div className="flex items-center gap-2 flex-wrap">
            {cita.estado === 'pendiente' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onCambiarEstado(cita.id, 'confirmada')}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Confirmar
              </Button>
            )}

            {cita.estado === 'confirmada' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCambiarEstado(cita.id, 'en_atencion')}
                leftIcon={<Clock className="w-3.5 h-3.5" />}
              >
                Iniciar Atención
              </Button>
            )}

            {cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCambiarEstado(cita.id, 'completada')}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Completar
              </Button>
            )}

            {cita.estado !== 'no_asistio' && cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                onClick={() => onCambiarEstado(cita.id, 'no_asistio')}
                leftIcon={<AlertCircle className="w-3.5 h-3.5" />}
              >
                No Asistió
              </Button>
            )}
          </div>

          {/* Exportación & Acciones Documentales */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onVerFactura(cita)}
              leftIcon={<Receipt className="w-3.5 h-3.5" />}
            >
              Factura
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => descargarArchivoIcs(cita, configuracion.nombre_negocio)}
              title="Descargar archivo iCalendar (.ics)"
              leftIcon={<CalIcon className="w-3.5 h-3.5" />}
            >
              .ICS
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => descargarCitaPdf(cita, configuracion)}
              title="Descargar comprobante en PDF"
              leftIcon={<FileDown className="w-3.5 h-3.5" />}
            >
              PDF
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => visualizarCitaPdf(cita, configuracion)}
              title="Imprimir ticket o comprobante"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Imprimir
            </Button>

            {cita.estado !== 'cancelada' && cita.estado !== 'completada' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReprogramar(cita)}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Reprogramar
              </Button>
            )}

            {cita.estado !== 'cancelada' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onCancelarCita(cita.id)}
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-sm">
        {/* Cabecera del Servicio y Precio */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {cita.servicio?.nombre ?? 'Servicio Profesional'}
              </h4>
              {esVirtual && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  <Video className="w-3 h-3" />
                  Virtual / Online
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Duración estimada: {cita.servicio?.duracion_base_min ?? 30} minutos
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xl font-black text-primary-600">
              ${cita.precio_total.toFixed(2)}
            </span>
            <span className="block text-[10px] text-slate-400">Total liquidado</span>
          </div>
        </div>

        {/* Metadatos en Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Cliente */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Cliente Registrado</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              {cita.cliente?.nombre ?? 'Cliente sin nombre'}
            </p>
            <p className="text-slate-500 font-mono text-[11px] mt-0.5">
              {cita.cliente?.email || 'Sin correo registrado'}
            </p>
            {cita.cliente?.telefono && (
              <p className="text-slate-500 font-mono text-[11px]">
                {cita.cliente.telefono}
              </p>
            )}
          </div>

          {/* Profesional */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Profesional / Especialista</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              {cita.empleado?.nombre ?? 'Profesional asignado'}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Especialidad: {cita.empleado?.especialidad ?? 'General'}
            </p>
          </div>

          {/* Fecha y Horario */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <CalIcon className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Fecha y Horario</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {cita.fecha_inicio.slice(0, 10)}
            </p>
            <p className="text-slate-500 font-mono mt-0.5">
              {cita.fecha_inicio.slice(11, 16)} hrs → {cita.fecha_fin.slice(11, 16)} hrs
            </p>
          </div>

          {/* Estado de la Cita */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">Estado Operativo</span>
            <div className="mt-1">
              <Badge variant={estadoBadgeVariant(cita.estado)} dot size="md">
                {cita.estado.toUpperCase()}
              </Badge>
            </div>
            {cita.recurrencia && (
              <span className="text-[10px] text-primary-600 font-medium mt-1">
                🔄 Cita recurrente ({cita.recurrencia.tipo})
              </span>
            )}
          </div>
        </div>

        {/* Enlace de Videollamada si es Virtual */}
        {esVirtual && (
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Sala de Teleconsulta Generada
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  https://meet.google.com/sag-{String(cita.id).padStart(4, '0')}-apt
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`https://meet.google.com/sag-${String(cita.id).padStart(4, '0')}-apt`, '_blank')}
            >
              Unirse a Sala
            </Button>
          </div>
        )}

        {/* Notas u Observaciones */}
        {cita.notas && (
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notas u Observaciones del Cliente:
            </p>
            <p className="text-xs bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 italic text-slate-600 dark:text-slate-400">
              {cita.notas}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
