import { useState } from 'react'
import { Webhook as WebhookIcon, Globe, Shield } from 'lucide-react'
import { EventoWebhook, Webhook } from '@/types'
import { Modal, Input, Button } from '@/components/ui'

interface ModalWebhookProps {
  isOpen: boolean
  onClose: () => void
  onGuardar: (webhook: Partial<Webhook>) => Promise<void>
}

const EVENTOS_DISPONIBLES: { id: EventoWebhook; label: string; desc: string }[] = [
  { id: 'cita.creada', label: 'Cita Creada', desc: 'Dispara cuando un cliente agenda una cita' },
  { id: 'cita.confirmada', label: 'Cita Confirmada', desc: 'Dispara cuando el staff confirma la cita' },
  { id: 'cita.cancelada', label: 'Cita Cancelada', desc: 'Dispara cuando se anula una reserva' },
  { id: 'cita.pagada', label: 'Cita Pagada', desc: 'Dispara cuando se emite y cobra una factura' },
  { id: 'cita.reembolsada', label: 'Cita Reembolsada', desc: 'Dispara cuando se procesa un reembolso' },
  { id: 'cliente.creado', label: 'Nuevo Cliente', desc: 'Dispara cuando un nuevo usuario se registra' },
]

export function ModalWebhook({ isOpen, onClose, onGuardar }: ModalWebhookProps) {
  const [url, setUrl] = useState('')
  const [eventosSeleccionados, setEventosSeleccionados] = useState<EventoWebhook[]>([
    'cita.creada',
    'cita.pagada',
  ])
  const [cargando, setCargando] = useState(false)

  const toggleEvento = (ev: EventoWebhook) => {
    if (eventosSeleccionados.includes(ev)) {
      setEventosSeleccionados(eventosSeleccionados.filter((e) => e !== ev))
    } else {
      setEventosSeleccionados([...eventosSeleccionados, ev])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || eventosSeleccionados.length === 0) return

    setCargando(true)
    try {
      await onGuardar({
        url: url.trim(),
        eventos: eventosSeleccionados,
        activo: true,
      })
      onClose()
      setUrl('')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nuevo Webhook" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="URL del Endpoint de Destino"
          placeholder="https://api.tuempresa.com/webhooks/sagitta"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          leftIcon={<Globe className="w-4 h-4" />}
          required
        />

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
            Selecciona los eventos a suscribir:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EVENTOS_DISPONIBLES.map((ev) => {
              const estaActivo = eventosSeleccionados.includes(ev.id)
              return (
                <div
                  key={ev.id}
                  onClick={() => toggleEvento(ev.id)}
                  className={[
                    'p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-2.5',
                    estaActivo
                      ? 'bg-primary-50/50 dark:bg-primary-950/30 border-primary-500'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={estaActivo}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 mt-0.5 pointer-events-none"
                  />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{ev.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ev.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500">
          <Shield className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <span>
            Cada petición HTTP POST enviará la firma HMAC-SHA256 en la cabecera{' '}
            <code>X-Sagitta-Signature</code> con una clave secreta auto-generada.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button variant="secondary" type="button" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={cargando}
            disabled={!url.trim() || eventosSeleccionados.length === 0}
            leftIcon={<WebhookIcon className="w-4 h-4" />}
            size="sm"
          >
            Guardar Webhook
          </Button>
        </div>
      </form>
    </Modal>
  )
}

