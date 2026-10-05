import { useState } from 'react'
import { Bell, Calendar } from 'lucide-react'
import { Servicio } from '@/types'
import { pagosService } from '@/services/pagos.service'
import { Modal, Input, Textarea, Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface ModalListaEsperaProps {
  isOpen: boolean
  onClose: () => void
  servicio?: Servicio
  onExito?: () => void
}

export function ModalListaEspera({
  isOpen,
  onClose,
  servicio,
  onExito,
}: ModalListaEsperaProps) {
  const [fechaDeseada, setFechaDeseada] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  )
  const [horaPreferente, setHoraPreferente] = useState('10:00')
  const [notas, setNotas] = useState('')
  const [cargando, setCargando] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!servicio) return

    setCargando(true)
    try {
      await pagosService.unirseListaEspera({
        cliente_id: 1, // cliente activo en sesión
        servicio_id: servicio.id,
        fecha_deseada: fechaDeseada,
        hora_preferente: horaPreferente,
        notas,
      })
      toast.success(
        '¡Añadido a la lista de espera!',
        'Te notificaremos inmediatamente si se libera un turno.'
      )
      onExito?.()
      onClose()
    } catch {
      toast.error('Error', 'No pudimos registrarte en la lista de espera')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Anotarse en Lista de Espera"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200">
          <Bell className="w-5 h-5 flex-shrink-0" />
          <p>
            Si un cliente cancela o se abre un nuevo espacio para{' '}
            <strong>{servicio?.nombre}</strong>, el sistema te avisará con prioridad.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha Deseada"
            type="date"
            value={fechaDeseada}
            onChange={(e) => setFechaDeseada(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />
          <Input
            label="Hora Preferente"
            type="time"
            value={horaPreferente}
            onChange={(e) => setHoraPreferente(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Comentarios o disponibilidad adicional"
          placeholder="Ej: Puedo en cualquier horario por la tarde..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-2 pt-3">
          <Button variant="secondary" type="button" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button type="submit" isLoading={cargando} size="sm">
            Unirse a la Lista
          </Button>
        </div>
      </form>
    </Modal>
  )
}

