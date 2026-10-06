import { useState } from 'react'
import { Cliente, TipoDocumentoCliente, CanalContactoCliente } from '@/types'
import { clientesService } from '@/services/clientes.service'
import { Button, Input, Select, Modal } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { sanitizeText } from '@/utils/sanitize'
import { formatTelefonoVE, handleOnlyNumbersKeyDown } from '@/utils/phone'

interface ModalNuevoClienteProps {
  isOpen: boolean
  onClose: () => void
  onClienteCreado: () => void
  clienteTerm: string
}

export function ModalNuevoCliente({
  isOpen,
  onClose,
  onClienteCreado,
  clienteTerm,
}: ModalNuevoClienteProps) {
  const [nuevoCliente, setNuevoCliente] = useState<Partial<Cliente>>({
    nombre: '',
    apellido: '',
    tipo_documento: 'CI',
    documento_identidad: '',
    email: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    canal_contacto_preferido: 'whatsapp',
    etiquetas: [],
    notas: '',
  })
  const [tagInput, setTagInput] = useState('')
  const [guardando, setGuardando] = useState(false)
  const { toast } = useToast()

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoCliente.nombre?.trim() || !nuevoCliente.email?.trim()) {
      toast.warning('Campos requeridos', 'Nombre y correo electrónico son obligatorios')
      return
    }

    setGuardando(true)
    try {
      const clienteSanitizado = {
        ...nuevoCliente,
        nombre: sanitizeText(nuevoCliente.nombre),
        apellido: sanitizeText(nuevoCliente.apellido),
        direccion: sanitizeText(nuevoCliente.direccion),
        ciudad: sanitizeText(nuevoCliente.ciudad),
        notas: sanitizeText(nuevoCliente.notas),
      }
      await clientesService.create(clienteSanitizado)
      toast.success(
        `${clienteTerm} registrado`,
        `El ${clienteTerm.toLowerCase()} fue agregado al directorio con éxito`
      )
      onClose()
      setNuevoCliente({
        nombre: '',
        apellido: '',
        tipo_documento: 'CI',
        documento_identidad: '',
        email: '',
        telefono: '',
        ciudad: '',
        direccion: '',
        canal_contacto_preferido: 'whatsapp',
        etiquetas: [],
        notas: '',
      })
      setTagInput('')
      onClienteCreado()
    } catch (err) {
      toast.error('Error al registrar', err instanceof Error ? err.message : 'Error')
    } finally {
      setGuardando(false)
    }
  }

  const handleAgregarTag = () => {
    if (tagInput.trim()) {
      const tags = nuevoCliente.etiquetas || []
      if (!tags.includes(tagInput.trim())) {
        setNuevoCliente({
          ...nuevoCliente,
          etiquetas: [...tags, tagInput.trim()],
        })
      }
      setTagInput('')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Registrar Nuevo ${clienteTerm} en el Directorio`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleCrear} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            placeholder="Ej: Laura..."
            value={nuevoCliente.nombre || ''}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
            required
          />
          <Input
            label="Apellidos"
            placeholder="Ej: Morales..."
            value={nuevoCliente.apellido || ''}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, apellido: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Tipo Documento"
            value={nuevoCliente.tipo_documento || 'CI'}
            onChange={(e) =>
              setNuevoCliente({
                ...nuevoCliente,
                tipo_documento: e.target.value as TipoDocumentoCliente,
              })
            }
            options={[
              { value: 'CI', label: 'Cédula (CI)' },
              { value: 'DNI', label: 'DNI' },
              { value: 'RIF', label: 'RIF' },
              { value: 'pasaporte', label: 'Pasaporte' },
              { value: 'otro', label: 'Otro' },
            ]}
          />
          <div className="sm:col-span-2">
            <Input
              label="Número de Identificación"
              placeholder="Ej: V-18442991"
              value={nuevoCliente.documento_identidad || ''}
              onChange={(e) =>
                setNuevoCliente({ ...nuevoCliente, documento_identidad: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="laura@ejemplo.com"
            value={nuevoCliente.email || ''}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
            required
          />
          <Input
            label="Teléfono / WhatsApp"
            type="tel"
            placeholder="+58 412 123 4567"
            value={nuevoCliente.telefono || ''}
            onChange={(e) =>
              setNuevoCliente({ ...nuevoCliente, telefono: formatTelefonoVE(e.target.value) })
            }
            onKeyDown={handleOnlyNumbersKeyDown}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ciudad"
            placeholder="Ej: Caracas"
            value={nuevoCliente.ciudad || ''}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, ciudad: e.target.value })}
          />
          <Select
            label="Canal Preferido de Contacto"
            value={nuevoCliente.canal_contacto_preferido || 'whatsapp'}
            onChange={(e) =>
              setNuevoCliente({
                ...nuevoCliente,
                canal_contacto_preferido: e.target.value as CanalContactoCliente,
              })
            }
            options={[
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'email', label: 'Correo Electrónico' },
              { value: 'telefono', label: 'Llamada' },
              { value: 'sms', label: 'SMS' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1">
            Etiquetas Iniciales (CRM)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe etiqueta (ej: VIP) y presiona Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAgregarTag()
                }
              }}
              className="input-base text-xs flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAgregarTag}
            >
              Añadir
            </Button>
          </div>
          {(nuevoCliente.etiquetas || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {nuevoCliente.etiquetas?.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-primary-soft text-primary border border-primary/20"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        etiquetas: nuevoCliente.etiquetas?.filter((tag) => tag !== t),
                      })
                    }
                    className="font-bold hover:text-danger ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1">
            Notas Iniciales
          </label>
          <textarea
            rows={2}
            placeholder="Preferencias o detalles iniciales..."
            value={nuevoCliente.notas || ''}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, notas: e.target.value })}
            className="input-base text-xs w-full"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="secondary" type="button" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
