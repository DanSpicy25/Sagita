import { useState, useEffect } from 'react'
import {
  DoorOpen,
  Plus,
  Wrench,
  CheckCircle2,
  Sparkles,
  Layers,
  Armchair,
  Cpu,
} from 'lucide-react'
import { Recurso, TipoRecurso, EstadoRecurso } from '@/types'
import { recursosService } from '@/services/recursos.service'
import { Button, Modal, Badge, Loader } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export function GestionRecursos() {
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false)

  // Form nuevo recurso
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<TipoRecurso>('sala')
  const [capacidad, setCapacidad] = useState(1)
  const [descripcion, setDescripcion] = useState('')

  const { toast } = useToast()

  const cargarRecursos = async () => {
    try {
      const res = await recursosService.getAll()
      if (res.data) setRecursos(res.data)
    } catch (err) {
      toast.error('Error al cargar recursos', err instanceof Error ? err.message : 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarRecursos()
  }, [])

  const handleCrearRecurso = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.warning('Validación', 'Ingresa el nombre del recurso')
      return
    }

    try {
      await recursosService.create({
        nombre,
        tipo,
        capacidad: Math.max(1, capacidad),
        descripcion,
        estado: 'disponible',
        activo: true,
      })
      toast.success('Recurso creado', `Se agregó el recurso '${nombre}' exitosamente`)
      setNombre('')
      setDescripcion('')
      setCapacidad(1)
      setModalNuevoOpen(false)
      cargarRecursos()
    } catch (err) {
      toast.error('Error al crear recurso', err instanceof Error ? err.message : 'Error')
    }
  }

  const handleCambiarEstado = async (id: number, nuevoEstado: EstadoRecurso) => {
    try {
      await recursosService.cambiarEstado(id, nuevoEstado)
      toast.success('Estado actualizado', `Recurso marcado como ${nuevoEstado}`)
      cargarRecursos()
    } catch (err) {
      toast.error('Error al cambiar estado', err instanceof Error ? err.message : 'Error')
    }
  }

  const getTipoIcono = (t: TipoRecurso) => {
    switch (t) {
      case 'sala':
        return <DoorOpen className="w-5 h-5 text-indigo-500" />
      case 'cabina':
        return <Sparkles className="w-5 h-5 text-pink-500" />
      case 'silla':
        return <Armchair className="w-5 h-5 text-amber-500" />
      case 'equipo':
        return <Cpu className="w-5 h-5 text-cyan-500" />
      default:
        return <Layers className="w-5 h-5 text-slate-500" />
    }
  }

  const estadoBadgeMap: Record<EstadoRecurso, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
    disponible: { variant: 'success', label: 'Disponible' },
    en_uso: { variant: 'warning', label: 'En Uso' },
    mantenimiento: { variant: 'danger', label: 'Mantenimiento' },
    inactivo: { variant: 'default', label: 'Inactivo' },
  }

  if (cargando) {
    return <Loader text="Cargando recursos físicos y equipamiento..." />
  }

  const totalDisponibles = recursos.filter((r) => r.estado === 'disponible' && r.activo).length
  const totalEnUso = recursos.filter((r) => r.estado === 'en_uso').length
  const totalMantenimiento = recursos.filter((r) => r.estado === 'mantenimiento').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Recursos Físicos y Equipamiento
              <Badge variant="primary">{recursos.length} registrados</Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Salas, cabinas, sillones y aparatología para evitar doble asignación y controlar capacidad
            </p>
          </div>
        </div>

        <Button
          onClick={() => setModalNuevoOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          variant="primary"
        >
          Nuevo Recurso
        </Button>
      </div>

      {/* Tarjetas de métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center justify-between border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Disponibles</p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100">{totalDisponibles}</p>
            </div>
          </div>
          <Badge variant="success">Operativos</Badge>
        </div>

        <div className="card p-4 flex items-center justify-between border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">En Atención / Uso</p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100">{totalEnUso}</p>
            </div>
          </div>
          <Badge variant="warning">Ocupados</Badge>
        </div>

        <div className="card p-4 flex items-center justify-between border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">En Mantenimiento</p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100">{totalMantenimiento}</p>
            </div>
          </div>
          <Badge variant="danger">Bloqueados</Badge>
        </div>
      </div>

      {/* Grid de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recursos.map((r) => {
          const badge = estadoBadgeMap[r.estado] ?? { variant: 'default', label: r.estado }
          return (
            <div
              key={r.id}
              className="card p-5 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-800 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {getTipoIcono(r.tipo)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{r.nombre}</h3>
                    <p className="text-xs text-slate-400 capitalize">Tipo: {r.tipo}</p>
                  </div>
                </div>

                <Badge variant={badge.variant} dot>
                  {badge.label}
                </Badge>
              </div>

              {r.descripcion && (
                <p className="text-xs text-slate-500 line-clamp-2">{r.descripcion}</p>
              )}

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">
                  Capacidad máx: <strong className="text-slate-800 dark:text-slate-200">{r.capacidad} cliente(s)</strong>
                </span>

                {/* Dropdown de cambio rápido de estado */}
                <select
                  value={r.estado}
                  onChange={(e) => handleCambiarEstado(r.id, e.target.value as EstadoRecurso)}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="disponible">Disponible</option>
                  <option value="en_uso">En Uso</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: Nuevo Recurso */}
      <Modal
        isOpen={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        title="Crear Recurso Físico o Equipamiento"
      >
        <form onSubmit={handleCrearRecurso} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre del Recurso *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Consultorio 3, Cabina VIP, Láser Q-Switched"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Recurso *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoRecurso)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                <option value="sala">Sala / Consultorio</option>
                <option value="cabina">Cabina Estética / Box</option>
                <option value="silla">Silla / Sillón</option>
                <option value="equipo">Equipo / Maquinaria</option>
                <option value="generico">Recurso Genérico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Capacidad Simultánea
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={capacidad}
                onChange={(e) => setCapacidad(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción o Ubicación física
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Sala ubicada en el segundo piso con luz natural..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setModalNuevoOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Recurso
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
