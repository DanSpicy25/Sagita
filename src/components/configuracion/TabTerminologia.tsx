import {
  Languages,
  RotateCcw,
  Sparkles,
  Check,
  Building,
  User,
  Calendar,
  Briefcase,
  Scissors,
  DoorOpen,
} from 'lucide-react'
import { useModules } from '@/hooks/useModules'
import { ALL_INDUSTRIES, getIndustryPreset } from '@/config/industries'
import type { IndustryId, TermKey } from '@/types'
import { Button, Badge } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface TerminoConfigItem {
  idSingular: TermKey
  idPlural: TermKey
  titulo: string
  descripcion: string
  icon: React.ElementType
  ejemplos: string[]
}

const TERMINOS_CONFIG: TerminoConfigItem[] = [
  {
    idSingular: 'cliente',
    idPlural: 'clientes',
    titulo: 'Entidad de Clientes',
    descripcion: 'Personas o entidades que reciben la atención o adquieren servicios.',
    icon: User,
    ejemplos: ['Cliente', 'Paciente', 'Alumno', 'Socio', 'Miembro', 'Huésped', 'Propietario'],
  },
  {
    idSingular: 'cita',
    idPlural: 'citas',
    titulo: 'Entidad de Citas / Reservas',
    descripcion: 'Eventos agendados en el calendario para prestar un servicio.',
    icon: Calendar,
    ejemplos: ['Cita', 'Consulta', 'Clase', 'Sesión', 'Turno', 'Reserva', 'Visita'],
  },
  {
    idSingular: 'profesional',
    idPlural: 'profesionales',
    titulo: 'Prestadores de Servicio',
    descripcion: 'Personal encargado de ejecutar la atención agendada.',
    icon: Briefcase,
    ejemplos: ['Profesional', 'Especialista', 'Doctor', 'Terapeuta', 'Instructor', 'Asesor', 'Barbero'],
  },
  {
    idSingular: 'servicio',
    idPlural: 'servicios',
    titulo: 'Catálogo de Servicios',
    descripcion: 'Tratamientos, clases o prestaciones ofrecidas por el negocio.',
    icon: Scissors,
    ejemplos: ['Servicio', 'Tratamiento', 'Procedimiento', 'Clase', 'Taller', 'Paquete'],
  },
  {
    idSingular: 'recurso',
    idPlural: 'recursos',
    titulo: 'Recursos Físicos / Espacios',
    descripcion: 'Equipamiento, boxes, salas o sillones requeridos.',
    icon: DoorOpen,
    ejemplos: ['Recurso', 'Sillón', 'Cabina', 'Box', 'Pista', 'Espacio', 'Consultorio'],
  },
]

export function TabTerminologia() {
  const {
    industry,
    applyPreset,
    tTerm,
    customTerms,
    setCustomTerm,
    resetCustomTerms,
  } = useModules()

  const { toast } = useToast()

  const handleCambiarSector = (id: IndustryId) => {
    applyPreset(id)
    toast.success('Sector actualizado', `Se aplicó la terminología y módulos sugeridos para "${getIndustryPreset(id).label}".`)
  }

  const handleRestablecerTerminos = () => {
    resetCustomTerms()
    toast.info('Términos restablecidos', 'Se restauró el vocabulario estándar para el sector actual.')
  }

  const presetActual = getIndustryPreset(industry)

  return (
    <div className="space-y-6">
      {/* ── Encabezado & Selección de Sector ── */}
      <div className="card p-6 border border-border bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-text flex items-center gap-2">
                <Languages className="w-5 h-5 text-primary" />
                Terminología & Vocabulario de Dominio
              </h3>
              <Badge variant="primary" size="sm">
                {presetActual.label}
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Sagitta se adapta al lenguaje natural de tu actividad. Modifica cómo se nombran las citas, clientes y profesionales en toda la plataforma.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRestablecerTerminos}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Restaurar Términos del Sector
          </Button>
        </div>

        {/* Selector Rápido de Sector Industrial */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-text flex items-center gap-1.5">
            <Building className="w-4 h-4 text-text-muted" />
            Sector / Industria Principal
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {ALL_INDUSTRIES.map((ind) => {
              const isSelected = industry === ind.id
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => handleCambiarSector(ind.id)}
                  className={[
                    'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none',
                    isSelected
                      ? 'border-primary bg-primary-soft/20 shadow-2xs'
                      : 'border-border bg-surface hover:border-border-hover hover:bg-surface-subtle',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-text truncate">{ind.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </div>
                  <span className="text-[10px] text-text-muted mt-1 line-clamp-1">
                    {ind.terms.cliente} · {ind.terms.cita}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Editor Interactivo de Términos Clave ── */}
      <div className="space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block px-1">
          Personalización Específica de Vocabulario
        </span>

        <div className="grid grid-cols-1 gap-4">
          {TERMINOS_CONFIG.map((item) => {
            const Icon = item.icon
            const valorSingular = tTerm(item.idSingular, presetActual.terms[item.idSingular] || '')
            const valorPlural = tTerm(item.idPlural, presetActual.terms[item.idPlural] || '')
            const isCustom = !!(customTerms[item.idSingular] || customTerms[item.idPlural])

            return (
              <div
                key={item.idSingular}
                className="card p-5 border border-border bg-surface hover:border-primary/30 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-soft/40 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text flex items-center gap-2">
                        {item.titulo}
                        {isCustom && (
                          <Badge variant="info" size="sm">
                            Personalizado
                          </Badge>
                        )}
                      </h4>
                      <p className="text-[11px] text-text-muted">{item.descripcion}</p>
                    </div>
                  </div>

                  {/* Chips rápidos de sugerencia */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-text-muted mr-1">Sugerencias:</span>
                    {item.ejemplos.slice(0, 5).map((ej) => (
                      <button
                        key={ej}
                        type="button"
                        onClick={() => {
                          setCustomTerm(item.idSingular, ej)
                          setCustomTerm(item.idPlural, `${ej}s`)
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-surface-subtle text-text hover:bg-primary-soft hover:text-primary transition-colors cursor-pointer border border-border"
                      >
                        {ej}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos de Entrada: Singular y Plural */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                      Nombre Singular (ej: {item.ejemplos[0]})
                    </label>
                    <input
                      type="text"
                      value={valorSingular}
                      onChange={(e) => setCustomTerm(item.idSingular, e.target.value)}
                      placeholder={`Ej: ${item.ejemplos[0]}`}
                      className="input-base text-xs py-1.5 w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                      Nombre Plural (ej: {item.ejemplos[0]}s)
                    </label>
                    <input
                      type="text"
                      value={valorPlural}
                      onChange={(e) => setCustomTerm(item.idPlural, e.target.value)}
                      placeholder={`Ej: ${item.ejemplos[0]}s`}
                      className="input-base text-xs py-1.5 w-full"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Simulador en Vivo de la Experiencia Visual ── */}
      <div className="card p-5 border border-primary/20 bg-primary-soft/10 space-y-3">
        <h4 className="font-bold text-xs text-text flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          Previsualización en Vivo de la Redacción de la Plataforma
        </h4>
        <p className="text-xs text-text-muted leading-relaxed">
          Así es como tus colaboradores y clientes verán los títulos, botones y notificaciones en Sagitta:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[10px] font-bold uppercase text-text-muted block">Botón de Creación</span>
            <span className="text-xs font-bold text-primary block">
              + Nueva {tTerm('cita', 'Cita')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[10px] font-bold uppercase text-text-muted block">Asignación Operativa</span>
            <span className="text-xs font-semibold text-text block truncate">
              {tTerm('profesional', 'Profesional')}: Carlos B. en {tTerm('recurso', 'Cabina')} 1
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[10px] font-bold uppercase text-text-muted block">Directorio Comercial</span>
            <span className="text-xs font-semibold text-text block truncate">
              Directorio de {tTerm('clientes', 'Clientes')} (128 registrados)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

