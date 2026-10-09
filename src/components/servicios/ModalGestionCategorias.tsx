import { useState } from 'react'
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  Stethoscope,
  Scissors,
  Heart,
  Dumbbell,
  Dog,
  Wrench,
  Briefcase,
} from 'lucide-react'
import { CategoriaServicio, Servicio } from '@/types'
import { Modal, Button, Input, Badge } from '@/components/ui'
import { serviciosService } from '@/services/servicios.service'
import { useToast } from '@/hooks/useToast'

export interface ModalGestionCategoriasProps {
  isOpen: boolean
  onClose: () => void
  categorias: CategoriaServicio[]
  servicios: Servicio[]
  onCategoriasActualizadas: () => void
}

const PALETA_COLORES = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
  '#ef4444', // Red
  '#64748b', // Slate
]

const PRESETS_SECTOR = [
  {
    sector: 'Salud & Medicina',
    icono: Stethoscope,
    categorias: [
      { nombre: 'Consultas Médicas', color: '#6366f1', descripcion: 'Evaluación y control clínico' },
      { nombre: 'Diagnóstico & Estudios', color: '#3b82f6', descripcion: 'Exámenes y análisis clínicos' },
      { nombre: 'Terapias & Rehabilitación', color: '#10b981', descripcion: 'Fisioterapia y recuperación' },
    ],
  },
  {
    sector: 'Belleza & Estética',
    icono: Scissors,
    categorias: [
      { nombre: 'Corte & Peinado', color: '#f59e0b', descripcion: 'Estilismo y peluquería' },
      { nombre: 'Cuidado Facial', color: '#ec4899', descripcion: 'Limpieza y tratamientos dérmicos' },
      { nombre: 'Manicura & Pedicura', color: '#8b5cf6', descripcion: 'Cuidado de uñas y esmaltado' },
    ],
  },
  {
    sector: 'Spa & Bienestar',
    icono: Heart,
    categorias: [
      { nombre: 'Masajes Relajantes', color: '#10b981', descripcion: 'Terapia manual antiestrés' },
      { nombre: 'Tratamientos Corporales', color: '#14b8a6', descripcion: 'Exfoliación y envolturas' },
      { nombre: 'Rituales Spa', color: '#ec4899', descripcion: 'Circuitos y experiencias completas' },
    ],
  },
  {
    sector: 'Fitness & Deporte',
    icono: Dumbbell,
    categorias: [
      { nombre: 'Entrenamiento Personal', color: '#ef4444', descripcion: 'Sesiones 1 a 1 especializadas' },
      { nombre: 'Clases Grupales', color: '#f59e0b', descripcion: 'Sesiones colectivas programadas' },
      { nombre: 'Evaluación Física', color: '#3b82f6', descripcion: 'Medición de rendimiento y metas' },
    ],
  },
  {
    sector: 'Veterinaria & Mascotas',
    icono: Dog,
    categorias: [
      { nombre: 'Consultas Veterinarias', color: '#10b981', descripcion: 'Atención médica para mascotas' },
      { nombre: 'Estética & Grooming', color: '#ec4899', descripcion: 'Baño, corte e higiene animal' },
      { nombre: 'Vacunación & Cirugía', color: '#6366f1', descripcion: 'Procedimientos preventivos' },
    ],
  },
  {
    sector: 'Técnico & Automotriz',
    icono: Wrench,
    categorias: [
      { nombre: 'Mantenimiento Periódico', color: '#3b82f6', descripcion: 'Servicios preventivos y fluidos' },
      { nombre: 'Diagnóstico & Frenos', color: '#ef4444', descripcion: 'Revisión técnica computarizada' },
      { nombre: 'Estética & Detailing', color: '#f59e0b', descripcion: 'Limpieza profunda y protección' },
    ],
  },
  {
    sector: 'Consultoría & Asesoría',
    icono: Briefcase,
    categorias: [
      { nombre: 'Asesoría Estratégica', color: '#6366f1', descripcion: 'Consultoría legal, contable o fiscal' },
      { nombre: 'Coaching & Mentoría', color: '#14b8a6', descripcion: 'Sesiones de acompañamiento' },
    ],
  },
]

export function ModalGestionCategorias({
  isOpen,
  onClose,
  categorias,
  servicios,
  onCategoriasActualizadas,
}: ModalGestionCategoriasProps) {
  const { toast } = useToast()
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [guardando, setGuardando] = useState(false)

  const limpiarFormulario = () => {
    setEditandoId(null)
    setNombre('')
    setDescripcion('')
    setColor('#6366f1')
  }

  const iniciarEdicion = (cat: CategoriaServicio) => {
    setEditandoId(cat.id)
    setNombre(cat.nombre)
    setDescripcion(cat.descripcion || '')
    setColor(cat.color || '#6366f1')
  }

  const handleGuardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.warning('Campo requerido', 'Por favor ingresa un nombre para la categoría.')
      return
    }

    setGuardando(true)
    try {
      if (editandoId) {
        await serviciosService.updateCategoria(editandoId, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          color,
        })
        toast.success('Categoría actualizada', 'Los cambios se aplicaron correctamente.')
      } else {
        await serviciosService.createCategoria({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          color,
        })
        toast.success('Categoría creada', 'La nueva categoría está lista para clasificar servicios.')
      }
      limpiarFormulario()
      onCategoriasActualizadas()
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : 'Error desconocido.')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarCategoria = async (cat: CategoriaServicio) => {
    const serviciosConCat = servicios.filter((s) => s.categoria_id === cat.id)
    if (serviciosConCat.length > 0) {
      if (
        !confirm(
          `Esta categoría está asignada a ${serviciosConCat.length} servicio(s). Si la eliminas, esos servicios quedarán sin categoría clasificada. ¿Deseas continuar?`
        )
      ) {
        return
      }
    } else {
      if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return
    }

    try {
      await serviciosService.deleteCategoria(cat.id)
      toast.success('Categoría eliminada', 'La categoría fue retirada del catálogo.')
      if (editandoId === cat.id) limpiarFormulario()
      onCategoriasActualizadas()
    } catch (err) {
      toast.error('Error al eliminar', err instanceof Error ? err.message : 'Error.')
    }
  }

  const handleAplicarPreset = async (catsPreset: { nombre: string; color: string; descripcion: string }[]) => {
    setGuardando(true)
    try {
      for (const item of catsPreset) {
        const existe = categorias.some((c) => c.nombre.toLowerCase() === item.nombre.toLowerCase())
        if (!existe) {
          await serviciosService.createCategoria(item)
        }
      }
      toast.success('Plantilla aplicada', 'Se agregaron las categorías del sector seleccionado.')
      onCategoriasActualizadas()
    } catch {
      toast.error('Error al aplicar plantilla', 'No se pudieron crear algunas categorías.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        limpiarFormulario()
        onClose()
      }}
      title="Gestión de Categorías de Servicios"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Formulario Crear / Editar */}
        <form
          onSubmit={handleGuardarCategoria}
          className="p-4 rounded-xl bg-surface-subtle border border-border space-y-3.5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span>{editandoId ? 'Editar Categoría' : 'Nueva Categoría'}</span>
            </h3>
            {editandoId && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="text-xs text-text-muted hover:text-text cursor-pointer"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Nombre de la categoría *
              </label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Tratamientos Faciales, Fisioterapia..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Color identificador
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {PALETA_COLORES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition-transform cursor-pointer border border-border shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Descripción breve (opcional)
            </label>
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción visible para clientes y personal..."
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              loading={guardando}
              leftIcon={editandoId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            >
              {editandoId ? 'Guardar Cambios' : 'Agregar Categoría'}
            </Button>
          </div>
        </form>

        {/* Lista de Categorías Existentes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Categorías Activas ({categorias.length})
            </span>
            <span>Usa las categorías para organizar tu catálogo y filtros de reserva.</span>
          </div>

          {categorias.length === 0 ? (
            <div className="py-6 text-center text-xs text-text-muted bg-surface-subtle/50 rounded-xl border border-dashed border-border">
              Aún no tienes categorías registradas. Puedes agregar una arriba o aplicar una plantilla rápida de sector.
            </div>
          ) : (
            <div className="divide-y divide-border-subtle rounded-xl border border-border bg-surface overflow-hidden max-h-56 overflow-y-auto">
              {categorias.map((cat) => {
                const totalServicios = servicios.filter((s) => s.categoria_id === cat.id).length
                return (
                  <div
                    key={cat.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-surface-subtle/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color || '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-text truncate">
                            {cat.nombre}
                          </span>
                          <Badge size="sm" variant="default">
                            {totalServicios} {totalServicios === 1 ? 'servicio' : 'servicios'}
                          </Badge>
                        </div>
                        {cat.descripcion && (
                          <p className="text-[11px] text-text-muted truncate mt-0.5">
                            {cat.descripcion}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => iniciarEdicion(cat)}
                        className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-subtle transition-colors cursor-pointer"
                        title="Editar categoría"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarCategoria(cat)}
                        className="p-1 rounded-md text-text-muted hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Plantillas Rápidas por Sector */}
        <div className="pt-2 border-t border-border-subtle space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Plantillas de Categorías por Tipo de Negocio</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESETS_SECTOR.map((pre) => {
              const Icon = pre.icono
              return (
                <button
                  key={pre.sector}
                  type="button"
                  onClick={() => handleAplicarPreset(pre.categorias)}
                  className="flex flex-col items-start p-2.5 rounded-xl border border-border bg-surface-subtle/50 hover:bg-surface hover:border-primary/40 text-left transition-all cursor-pointer group"
                >
                  <Icon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors mb-1.5" />
                  <span className="text-xs font-semibold text-text group-hover:text-primary transition-colors leading-tight">
                    {pre.sector}
                  </span>
                  <span className="text-[10px] text-text-muted mt-0.5">
                    +{pre.categorias.length} categorías
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

