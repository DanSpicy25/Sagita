import { useState, useEffect } from 'react'
import {
  Plus,
  Clock,
  Tag,
  Sparkles,
  Trash2,
  Edit2,
  Package,
  Award,
  Eye,
  EyeOff,
  DoorOpen,
  DollarSign,
} from 'lucide-react'
import { Servicio, CategoriaServicio, Empleado } from '@/types'
import { serviciosService } from '@/services/servicios.service'
import { empleadosService } from '@/services/empleados.service'
import { Button, Loader, EmptyState } from '@/components/ui'
import { ModalServicioComercial } from '@/components/servicios/ModalServicioComercial'
import { GestionPaquetes } from '@/components/servicios/GestionPaquetes'
import { GestionMembresias } from '@/components/servicios/GestionMembresias'
import { useToast } from '@/hooks/useToast'

type TabServiciosPage = 'servicios' | 'paquetes' | 'membresias'

export default function ServiciosPage() {
  const [tabPrincipal, setTabPrincipal] = useState<TabServiciosPage>('servicios')

  const [servicios, setServicios] = useState<Servicio[]>([])
  const [categorias, setCategorias] = useState<CategoriaServicio[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)

  // Modal de servicio comercial
  const [modalAbierto, setModalAbierto] = useState(false)
  const [servicioEditando, setServicioEditando] = useState<Partial<Servicio> | null>(null)

  const { toast } = useToast()

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      serviciosService.getAll(),
      serviciosService.getCategorias(),
      empleadosService.getAll({ activo: 'true' }),
    ])
      .then(([servRes, catRes, empRes]) => {
        if (servRes.data) setServicios(servRes.data)
        if (catRes.data) setCategorias(catRes.data)
        if (empRes.data) setEmpleados(empRes.data)
      })
      .catch((err) => {
        toast.error('Error al cargar servicios', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleGuardarServicio = async (servicioData: Partial<Servicio>) => {
    if (servicioData.id) {
      await serviciosService.update(servicioData.id, servicioData)
      toast.success('Servicio actualizado', 'Los cambios se guardaron con éxito')
    } else {
      await serviciosService.create(servicioData)
      toast.success('Servicio creado', 'El nuevo servicio ya está disponible en catálogo')
    }
    cargarDatos()
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
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Catálogo Comercial de Servicios
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestiona servicios individuales, paquetes de sesiones prepagadas y planes de membresía
          </p>
        </div>

        {tabPrincipal === 'servicios' && (
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
                visible_portal_publico: true,
                capacidad_maxima: 1,
                impuesto_porcentaje: 16,
                precio_incluye_impuesto: true,
                anticipacion_minima_horas: 2,
                anticipacion_maxima_dias: 30,
              })
              setModalAbierto(true)
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Servicio
          </Button>
        )}
      </div>

      {/* Navegación por pestañas superiores */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'servicios', label: `Servicios Individuales (${servicios.length})`, icon: Sparkles },
          { id: 'paquetes', label: 'Paquetes de Sesiones', icon: Package },
          { id: 'membresias', label: 'Planes de Membresía', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon
          const esActiva = tabPrincipal === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabPrincipal(tab.id as TabServiciosPage)}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                esActiva
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
              ].join(' ')}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* PESTAÑA: PAQUETES */}
      {tabPrincipal === 'paquetes' && <GestionPaquetes />}

      {/* PESTAÑA: MEMBRESÍAS */}
      {tabPrincipal === 'membresias' && <GestionMembresias />}

      {/* PESTAÑA: SERVICIOS INDIVIDUALES */}
      {tabPrincipal === 'servicios' && (
        <div className="space-y-6">
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
            <Loader text="Cargando catálogo comercial..." />
          ) : serviciosFiltrados.length === 0 ? (
            <EmptyState
              title="No hay servicios en esta categoría"
              description="Crea tu primer servicio con duraciones, recursos y depósitos para comenzar a recibir reservas."
              actionLabel="Crear Servicio"
              onAction={() => {
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
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {serviciosFiltrados.map((serv) => (
                <div
                  key={serv.id}
                  className="card p-5 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    {/* Header de tarjeta */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                          style={{ backgroundColor: serv.color || '#6366f1' }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                            {serv.nombre}
                          </h4>
                          {serv.categoria && (
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              {serv.categoria.nombre}
                            </span>
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

                    {/* Variantes de Duración */}
                    {serv.duraciones && serv.duraciones.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {serv.duraciones.map((d) => (
                          <span
                            key={d.id}
                            className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                          >
                            {d.duracion_min}m • ${d.precio}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Insignias de recurso, visibilidad y depósito */}
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      {serv.recurso_requerido_tipo && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                          <DoorOpen className="w-3 h-3" />
                          {serv.recurso_requerido_tipo.toUpperCase()}
                        </span>
                      )}

                      {serv.requiere_deposito && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
                          <DollarSign className="w-3 h-3" />
                          Seña: {serv.tipo_deposito === 'porcentaje' ? `${serv.monto_deposito}%` : `$${serv.monto_deposito}`}
                        </span>
                      )}

                      {serv.visible_portal_publico ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold px-1.5 py-0.5">
                          <Eye className="w-3 h-3" /> Portal OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-semibold px-1.5 py-0.5">
                          <EyeOff className="w-3 h-3" /> Privado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer de métricas y botones */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary-500" />
                        {serv.duracion_base_min} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        +{serv.buffer_despues_min}m buf
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setServicioEditando(serv)
                          setModalAbierto(true)
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Editar servicio"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEliminar(serv.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Crear / Editar Servicio Comercial */}
      <ModalServicioComercial
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false)
          setServicioEditando(null)
        }}
        servicio={servicioEditando}
        categorias={categorias}
        empleados={empleados}
        onGuardar={handleGuardarServicio}
      />
    </div>
  )
}
