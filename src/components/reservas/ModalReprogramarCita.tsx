import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { Cita, SlotDisponible, Recurso } from '@/types'
import { citasService } from '@/services/citas.service'
import { recursosService } from '@/services/recursos.service'
import { Modal, Button, Badge, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface ModalReprogramarCitaProps {
  cita: Cita | null
  isOpen: boolean
  onClose: () => void
  onCitaReprogramada: (nuevaCita: Cita) => void
}

export function ModalReprogramarCita({
  cita,
  isOpen,
  onClose,
  onCitaReprogramada,
}: ModalReprogramarCitaProps) {
  const [fecha, setFecha] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  )
  const [slots, setSlots] = useState<SlotDisponible[]>([])
  const [slotSeleccionado, setSlotSeleccionado] = useState<SlotDisponible | null>(null)
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [recursoId, setRecursoId] = useState<number | undefined>()
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (cita) {
      setRecursoId(cita.recurso_id)
      recursosService.getAll({ activo: true }).then((res) => {
        if (res.data) setRecursos(res.data)
      })
    }
  }, [cita])

  useEffect(() => {
    if (!cita || !isOpen) return

    setCargandoSlots(true)
    setSlotSeleccionado(null)

    citasService
      .getDisponibilidad(
        cita.empleado_id,
        fecha,
        cita.servicio_id,
        cita.servicio?.duracion_base_min,
        recursoId
      )
      .then((res) => {
        if (res.data) setSlots(res.data)
      })
      .catch((err) => {
        toast.error('Error al calcular disponibilidad', err instanceof Error ? err.message : 'Error')
        setSlots([])
      })
      .finally(() => setCargandoSlots(false))
  }, [cita, fecha, recursoId, isOpen, toast])

  if (!cita) return null

  const handleReprogramar = async () => {
    if (!slotSeleccionado) {
      toast.warning('Selecciona un horario', 'Debes seleccionar un horario disponible para reprogramar')
      return
    }

    const nuevaFechaInicio = `${fecha} ${slotSeleccionado.hora_inicio}`
    const nuevaFechaFin = `${fecha} ${slotSeleccionado.hora_fin}`

    setGuardando(true)
    try {
      const res = await citasService.reprogramar(
        cita.id,
        nuevaFechaInicio,
        nuevaFechaFin,
        recursoId
      )
      toast.success('Cita reprogramada', `La cita fue movida con éxito para el ${nuevaFechaInicio}`)
      if (res.data) onCitaReprogramada(res.data)
      onClose()
    } catch (err) {
      toast.error('No se pudo reprogramar', err instanceof Error ? err.message : 'Conflicto de horario')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reprogramar Cita"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleReprogramar}
            disabled={!slotSeleccionado || guardando}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${guardando ? 'animate-spin' : ''}`} />}
          >
            {guardando ? 'Guardando...' : 'Confirmar Nueva Fecha'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 text-sm">
        {/* Información de la cita original */}
        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">
              Horario Actual Programado
            </span>
            <Badge variant="warning" size="sm">
              Cita #{cita.id}
            </Badge>
          </div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {cita.servicio?.nombre} con {cita.empleado?.nombre}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Fecha: {cita.fecha_inicio.slice(0, 10)} | Hora: {cita.fecha_inicio.slice(11, 16)} a {cita.fecha_fin.slice(11, 16)}
          </p>
        </div>

        {/* Selección de nueva fecha y recurso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nueva Fecha *
            </label>
            <input
              type="date"
              value={fecha}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sala o Recurso Físico
            </label>
            <select
              value={recursoId || ''}
              onChange={(e) => setRecursoId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
            >
              <option value="">Cualquier sala disponible</option>
              {recursos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} ({r.tipo})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector de Horarios Disponibles */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span>Horarios Disponibles para esta Fecha</span>
            {slotSeleccionado && (
              <span className="text-primary-600 dark:text-primary-400 font-bold">
                Seleccionado: {slotSeleccionado.hora_inicio} - {slotSeleccionado.hora_fin}
              </span>
            )}
          </label>

          {cargandoSlots ? (
            <div className="py-8 text-center">
              <Loader text="Comprobando disponibilidad de personal y recursos..." />
            </div>
          ) : slots.length === 0 ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-xs text-slate-500 italic">
              No hay horarios disponibles para la fecha seleccionada.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
              {slots.map((slot) => {
                const esSeleccionado =
                  slotSeleccionado?.hora_inicio === slot.hora_inicio &&
                  slotSeleccionado?.hora_fin === slot.hora_fin

                return (
                  <button
                    key={slot.hora_inicio}
                    type="button"
                    disabled={!slot.disponible}
                    onClick={() => setSlotSeleccionado(slot)}
                    title={slot.motivo_no_disponible || 'Disponible'}
                    className={[
                      'py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border text-center',
                      esSeleccionado
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : slot.disponible
                        ? 'bg-white dark:bg-slate-800 hover:border-primary-400 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-transparent cursor-not-allowed line-through',
                    ].join(' ')}
                  >
                    {slot.hora_inicio}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
