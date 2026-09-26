import { useState, useEffect } from 'react'
import { Plus, Clock, Tag, Sparkles, Trash2, Edit2 } from 'lucide-react'
import { Servicio, CategoriaServicio } from '@/types'
import { serviciosService } from '@/services/servicios.service'
import { Button, Input, Select, Modal, Loader, Badge, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [categorias, setCategorias] = useState<CategoriaServicio[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [servicioEditando, setServicioEditando] = useState<Partial<Servicio>>({
    nombre: '',
    descripcion: '',
    duracion_base_min: 30,
    precio_base: 50,
    buffer_antes_min: 0,
    buffer_despues_min: 5,
    activo: true,
  })

  const { toast } = useToast()

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([serviciosService.getAll(), serviciosService.getCategorias()])
      .then(([servRes, catRes]) => {
        if (servRes.data) setServicios(servRes.data)
        if (catRes.data) setCategorias(catRes.data)
      })
      .catch((err) => {
        toast.error('Error al cargar servicios', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!servicioEditando.nombre || !servicioEditando.precio_base) {
      toast.warning('Datos incompletos', 'Nombre y precio base son obligatorios')
      return
    }

    try {
      if (servicioEditando.id) {
        await serviciosService.update(servicioEditando.id, servicioEditando)
        toast.success('Servicio actualizado', 'Los cambios se guardaron con éxito')
      } else {
        await serviciosService.create(servicioEditando)
        toast.success('Servicio creado', 'El nuevo servicio ya está disponible en catálogo')
      }
      setModalAbierto(false)
      cargarDatos()
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) return
    try {
      await serviciosService.delete(id)
      toast.success('Servicio eliminado', 'El servicio fue retirado del catálogo')
      cargarDatos()
    } catch (err) {
      toast.error('Error al eliminar', err instanceof Error ? err.message : 'Error')
    }
  }

  const serviciosFiltrados = categoriaFiltro
    ? servicios.filter((s) => s.categoria_id === categoriaFiltro)
    : servicios

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Catálogo de Servicios
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configura tus tratamientos, consultas, duraciones personalizadas y buffer times
          </p>
        </div>

        <Button
          onClick={() => {
            setServicioEditando({
              nombre: '',
              descripcion: '',
              duracion_base_min: 30,
              precio_base: 50,
              buffer_antes_min: 0,
              buffer_despues_min: 5,
              activo: true,
            })
            setModalAbierto(true)
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nuevo Servicio
        </Button>
      </div>

      {/* Filtro por Categorías */}
      {categorias.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoriaFiltro(null)}
            className={[
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
              categoriaFiltro === null
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
            ].join(' ')}
          >
            Todas las categorías ({servicios.length})
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoriaFiltro(cat.id)}
              className={[
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                categoriaFiltro === cat.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
              ].join(' ')}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Grid de servicios */}
      {cargando ? (
        <Loader text="Cargando catálogo..." />
      ) : serviciosFiltrados.length === 0 ? (
        <EmptyState
          title="No hay servicios en esta categoría"
          description="Crea tu primer servicio para que los clientes puedan empezar a reservar."
          actionLabel="Crear Servicio"
          onAction={() => setModalAbierto(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {serviciosFiltrados.map((serv) => (
            <div
              key={serv.id}
              className="card p-5 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {serv.nombre}
                      </h4>
                      {serv.categoria && (
                        <Badge variant="default" size="sm">
                          {serv.categoria.nombre}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    ${serv.precio_base}
                  </span>
                </div>

                {serv.descripcion && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {serv.descripcion}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary-500" />
                    {serv.duracion_base_min} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Buffer: {serv.buffer_despues_min}m
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setServicioEditando(serv)
                      setModalAbierto(true)
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
                    aria-label="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEliminar(serv.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Servicio */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={servicioEditando.id ? 'Editar Servicio' : 'Nuevo Servicio'}
      >
        <form onSubmit={handleGuardar} className="space-y-4">
          <Input
            label="Nombre del Servicio"
            placeholder="Ej: Consulta Dental, Limpieza Facial..."
            value={servicioEditando.nombre}
            onChange={(e) => setServicioEditando({ ...servicioEditando, nombre: e.target.value })}
            required
          />

          <Input
            label="Descripción"
            placeholder="Breve descripción para tus clientes..."
            value={servicioEditando.descripcion ?? ''}
            onChange={(e) => setServicioEditando({ ...servicioEditando, descripcion: e.target.value })}
          />

          {categorias.length > 0 && (
            <Select
              label="Categoría"
              value={servicioEditando.categoria_id ?? ''}
              onChange={(e) =>
                setServicioEditando({
                  ...servicioEditando,
                  categoria_id: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
              placeholder="Seleccionar categoría"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duración Base (minutos)"
              type="number"
              min="5"
              step="5"
              value={servicioEditando.duracion_base_min ?? 30}
              onChange={(e) => setServicioEditando({ ...servicioEditando, duracion_base_min: Number(e.target.value) })}
              required
            />
            <Input
              label="Precio Base ($)"
              type="number"
              min="0"
              step="1"
              value={servicioEditando.precio_base ?? 0}
              onChange={(e) => setServicioEditando({ ...servicioEditando, precio_base: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Buffer Antes (min)"
              type="number"
              min="0"
              value={servicioEditando.buffer_antes_min ?? 0}
              onChange={(e) => setServicioEditando({ ...servicioEditando, buffer_antes_min: Number(e.target.value) })}
            />
            <Input
              label="Buffer Después (min)"
              type="number"
              min="0"
              value={servicioEditando.buffer_despues_min ?? 5}
              onChange={(e) => setServicioEditando({ ...servicioEditando, buffer_despues_min: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Servicio
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
