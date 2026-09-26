import { useState, useEffect } from 'react'
import { Plus, Search, Mail, Phone, Calendar, UserPlus } from 'lucide-react'
import { Cliente } from '@/types'
import { clientesService } from '@/services/clientes.service'
import { Button, Input, Modal, Loader, Avatar, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    email: '',
    telefono: '',
    notas: '',
  })

  const { toast } = useToast()

  const cargarClientes = (q?: string) => {
    setCargando(true)
    clientesService
      .getAll(q)
      .then((res) => {
        if (res.data) setClientes(res.data)
      })
      .catch((err) => {
        toast.error('Error al cargar clientes', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarClientes(busqueda)
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoCliente.nombre || !nuevoCliente.email) {
      toast.warning('Campos requeridos', 'Nombre y correo son obligatorios')
      return
    }

    try {
      await clientesService.create(nuevoCliente)
      toast.success('Cliente registrado', 'El cliente fue agregado al directorio')
      setModalAbierto(false)
      setNuevoCliente({ nombre: '', email: '', telefono: '', notas: '' })
      cargarClientes()
    } catch (err) {
      toast.error('Error al registrar cliente', err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Directorio de Clientes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Consulta el historial, datos de contacto y frecuencia de reservas de tus clientes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-base pl-9 text-xs py-2"
            />
          </div>

          <Button
            onClick={() => setModalAbierto(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Grid de clientes */}
      {cargando ? (
        <Loader text="Cargando directorio de clientes..." />
      ) : clientes.length === 0 ? (
        <EmptyState
          title="No se encontraron clientes"
          description="Agrega nuevos clientes para llevar su historial de citas y datos de contacto."
          actionLabel="Agregar Cliente"
          onAction={() => setModalAbierto(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map((c) => (
            <div
              key={c.id}
              className="card p-5 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-start gap-3.5 mb-3">
                <Avatar name={c.nombre} size="md" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {c.nombre}
                  </h4>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    {c.email}
                  </p>
                  {c.telefono && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      {c.telefono}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {c.total_citas} citas agendadas
                </span>
                <span>
                  Desde {new Date(c.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar Nuevo Cliente"
      >
        <form onSubmit={handleCrear} className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej: Laura Morales..."
            value={nuevoCliente.nombre}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
            leftIcon={<UserPlus className="w-4 h-4" />}
            required
          />

          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="laura@ejemplo.com"
            value={nuevoCliente.email}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Teléfono / WhatsApp"
            type="tel"
            placeholder="+1 555-0199"
            value={nuevoCliente.telefono}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Cliente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
