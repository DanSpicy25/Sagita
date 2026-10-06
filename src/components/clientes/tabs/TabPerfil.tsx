import React from 'react'
import { Save } from 'lucide-react'
import { Cliente, TipoDocumentoCliente, CanalContactoCliente } from '@/types'
import { Button, Input, Select } from '@/components/ui'
import { formatTelefonoVE, handleOnlyNumbersKeyDown } from '@/utils/phone'

interface TabPerfilProps {
  formCliente: Partial<Cliente>
  setFormCliente: React.Dispatch<React.SetStateAction<Partial<Cliente>>>
  onGuardar: (e: React.FormEvent) => void
}

export function TabPerfil({ formCliente, setFormCliente, onGuardar }: TabPerfilProps) {
  return (
    <form onSubmit={onGuardar} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Nombre"
          value={formCliente.nombre || ''}
          onChange={(e) => setFormCliente({ ...formCliente, nombre: e.target.value })}
          required
        />
        <Input
          label="Apellidos"
          value={formCliente.apellido || ''}
          onChange={(e) => setFormCliente({ ...formCliente, apellido: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-1">
          <Select
            label="Tipo Doc."
            value={formCliente.tipo_documento || 'CI'}
            onChange={(e) =>
              setFormCliente({
                ...formCliente,
                tipo_documento: e.target.value as TipoDocumentoCliente,
              })
            }
            options={[
              { value: 'CI', label: 'CI' },
              { value: 'DNI', label: 'DNI' },
              { value: 'RIF', label: 'RIF' },
              { value: 'pasaporte', label: 'Pasaporte' },
              { value: 'otro', label: 'Otro' },
            ]}
          />
          <div className="col-span-2">
            <Input
              label="N° Documento"
              value={formCliente.documento_identidad || ''}
              onChange={(e) =>
                setFormCliente({ ...formCliente, documento_identidad: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Correo Electrónico"
          type="email"
          value={formCliente.email || ''}
          onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
          required
        />
        <Input
          label="Teléfono Principal"
          type="tel"
          value={formCliente.telefono || ''}
          onChange={(e) =>
            setFormCliente({ ...formCliente, telefono: formatTelefonoVE(e.target.value) })
          }
          onKeyDown={handleOnlyNumbersKeyDown}
        />
        <Input
          label="Teléfono Secundario"
          type="tel"
          value={formCliente.telefono_secundario || ''}
          onChange={(e) =>
            setFormCliente({
              ...formCliente,
              telefono_secundario: formatTelefonoVE(e.target.value),
            })
          }
          onKeyDown={handleOnlyNumbersKeyDown}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Fecha de Nacimiento"
          type="date"
          value={formCliente.fecha_nacimiento || ''}
          onChange={(e) =>
            setFormCliente({ ...formCliente, fecha_nacimiento: e.target.value })
          }
        />
        <Select
          label="Género"
          value={formCliente.genero || 'prefiero_no_decir'}
          onChange={(e) =>
            setFormCliente({ ...formCliente, genero: e.target.value as Cliente['genero'] })
          }
          options={[
            { value: 'femenino', label: 'Femenino' },
            { value: 'masculino', label: 'Masculino' },
            { value: 'otro', label: 'Otro' },
            { value: 'prefiero_no_decir', label: 'Prefiero no especificar' },
          ]}
        />
        <Select
          label="Canal Preferido de Contacto"
          value={formCliente.canal_contacto_preferido || 'whatsapp'}
          onChange={(e) =>
            setFormCliente({
              ...formCliente,
              canal_contacto_preferido: e.target.value as CanalContactoCliente,
            })
          }
          options={[
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'email', label: 'Correo Electrónico' },
            { value: 'telefono', label: 'Llamada Telefónica' },
            { value: 'sms', label: 'Mensaje SMS' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Dirección de Habitación"
            placeholder="Calle, avenida, edificio, número de casa..."
            value={formCliente.direccion || ''}
            onChange={(e) => setFormCliente({ ...formCliente, direccion: e.target.value })}
          />
        </div>
        <Input
          label="Ciudad"
          value={formCliente.ciudad || ''}
          onChange={(e) => setFormCliente({ ...formCliente, ciudad: e.target.value })}
        />
      </div>

      <div className="pt-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Notas Generales de Atención
        </label>
        <textarea
          rows={2}
          value={formCliente.notas || ''}
          onChange={(e) => setFormCliente({ ...formCliente, notas: e.target.value })}
          placeholder="Preferencias de atención, restricciones, detalles importantes..."
          className="input-base text-xs w-full"
        />
      </div>

      <div className="flex justify-end pt-3">
        <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
          Guardar Cambios de Identidad
        </Button>
      </div>
    </form>
  )
}
