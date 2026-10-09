import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Plus,
  Sparkles,
  Package,
  Award,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react'
import { Servicio, CategoriaServicio, Empleado } from '@/types'
import { serviciosService } from '@/services/servicios.service'
import { empleadosService } from '@/services/empleados.service'
import { citasService } from '@/services/citas.service'
import { Button, Loader, EmptyState, FirstUseHint, Modal } from '@/components/ui'
import {
  ServicioCard,
  ServiciosFiltrosBar,
  ServiciosTabla,
  ModalGestionCategorias,
  ModalServicioComercial,
  GestionPaquetes,
  GestionMembresias,
  ServiciosFiltros,
} from '@/components/servicios'
import { useToast } from '@/hooks/useToast'

type TabServiciosPage = 'servicios' | 'paquetes' | 'membresias'

interface DeleteDialogState {
  isOpen: boolean
  servicio: Servicio | null
  citasCount: number
  citasActivasCount: number
  verificando: boolean
  modo: 'desactivar' | 'eliminar_forzado'
  procesando: boolean
}

export default function ServiciosPage() {
  const [tabPrincipal, setTabPrincipal] = useState<TabServiciosPage>('servicios')

  const [servicios, setServicios] = useState<Servicio[]>([])
  const [categorias, setCategorias] = useState<CategoriaServicio[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [cargando, setCargando] = useState(true)

  // Filtros & Vista
  const [filtros, setFiltros] = useState<ServiciosFiltros>({
    busqueda: '',
    categoriaId: 'todas',
    estado: 'todos',
    empleadoId: 'todos',
  })

  const [vistaModo, setVistaModo] = useState<'grid' | 'tabla'>(() => {
    const saved = localStorage.getItem('sagitta_servicios_view_mode')
    return saved === 'tabla' ? 'tabla' : 'grid'
  })

  // Modal de servicio comercial
  const [modalAbierto, setModalAbierto] = useState(false)
  const [servicioEditando, setServicioEditando] = useState<Partial<Servicio> | null>(null)

  // Modal de gestión de categorías
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)

  // Estado del diálogo de eliminación segura
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    servicio: null,
    citasCount: 0,
    citasActivasCount: 0,
    verificando: false,
    modo: 'desactivar',
    procesando: false,
  })

  const { toast } = useToast()

  const handleVistaModoChange = (modo: 'grid' | 'tabla') => {
    setVistaModo(modo)
    localStorage.setItem('sagitta_servicios_view_mode', modo)
  }

  const cargarDatos = useCallback(() => {
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
  }, [toast])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Filtrado reactivo en memoria
  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((s) => {
      // 1. Búsqueda de texto libre
      if (filtros.busqueda.trim()) {
        const q = filtros.busqueda.toLowerCase().trim()
        const matchNombre = s.nombre.toLowerCase().includes(q)
        const matchDesc = s.descripcion?.toLowerCase().includes(q)
        const matchCat = s.categoria?.nombre.toLowerCase().includes(q)
        if (!matchNombre && !matchDesc && !matchCat) return false
      }

      // 2. Filtro por Categoría
      if (filtros.categoriaId !== 'todas') {
        if (s.categoria_id !== filtros.categoriaId) return false
      }

      // 3. Filtro por Estado
      if (filtros.estado === 'activos' && !s.activo) return false
      if (filtros.estado === 'inactivos' && s.activo) return false

      // 4. Filtro por Empleado asignado
      if (filtros.empleadoId !== 'todos') {
        const empId = Number(filtros.empleadoId)
        const asignados = s.empleados_compatibles_ids || s.empleados_asignados_ids || []
        if (!asignados.includes(empId)) return false
      }

      return true
    })
  }, [servicios, filtros])

  // Guardar servicio (Crear o Actualizar)
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

  // Toggle rápido de estado Activo / Inactivo
  const handleToggleActivo = async (servicio: Servicio, nuevoActivo: boolean) => {
    // Actualización optimista
    setServicios((prev) =>
      prev.map((s) => (s.id === servicio.id ? { ...s, activo: nuevoActivo } : s))
    )
    try {
      await serviciosService.update(servicio.id, { activo: nuevoActivo })
      toast.success(
        nuevoActivo ? 'Servicio activado' : 'Servicio desactivado',
        `"${servicio.nombre}" ahora está ${nuevoActivo ? 'disponible para reservas' : 'oculto de reservas'}.`
      )
    } catch (err) {
      // Revertir en fallo
      setServicios((prev) =>
        prev.map((s) => (s.id === servicio.id ? { ...s, activo: !nuevoActivo } : s))
      )
      toast.error('Error al cambiar estado', err instanceof Error ? err.message : 'Error')
    }
  }

  // Duplicar servicio con sufijo y estado inactivo
  const handleDuplicar = async (servicio: Servicio) => {
    const copia: Partial<Servicio> = {
      ...servicio,
      id: undefined,
      nombre: `${servicio.nombre} (Copia)`,
      activo: false,
      duraciones: servicio.duraciones?.map((d) => ({
        ...d,
        id: undefined as unknown as number,
        servicio_id: undefined as unknown as number,
      })),
    }

    try {
      const res = await serviciosService.create(copia)
      toast.success('Servicio duplicado', `Se creó "${copia.nombre}" como borrador inactivo.`)
      cargarDatos()
      if (res.data) {
        setServicioEditando(res.data)
        setModalAbierto(true)
      }
    } catch (err) {
      toast.error('Error al duplicar servicio', err instanceof Error ? err.message : 'Error')
    }
  }

  // Apertura de confirmación segura de eliminación
  const handleSolicitarEliminar = async (servicio: Servicio) => {
    setDeleteDialog({
      isOpen: true,
      servicio,
      citasCount: 0,
      citasActivasCount: 0,
      verificando: true,
      modo: 'desactivar',
      procesando: false,
    })

    try {
      const res = await citasService.getAll()
      const citasDelServicio = (res.data || []).filter((c) => c.servicio_id === servicio.id)
      const citasActivas = citasDelServicio.filter(
        (c) => !['completada', 'cancelada', 'no_asistio'].includes(c.estado)
      )

      setDeleteDialog((prev) => ({
        ...prev,
        citasCount: citasDelServicio.length,
        citasActivasCount: citasActivas.length,
        verificando: false,
        modo: citasDelServicio.length > 0 ? 'desactivar' : 'eliminar_forzado',
      }))
    } catch {
      setDeleteDialog((prev) => ({ ...prev, verificando: false }))
    }
  }

  // Confirmar acción del diálogo de eliminación
  const handleConfirmarEliminacion = async () => {
    if (!deleteDialog.servicio) return

    setDeleteDialog((prev) => ({ ...prev, procesando: true }))
    try {
      if (deleteDialog.modo === 'desactivar') {
        await serviciosService.update(deleteDialog.servicio.id, { activo: false })
        toast.success(
          'Servicio archivado y desactivado',
          `"${deleteDialog.servicio.nombre}" se desactivó para conservar el historial contable.`
        )
      } else {
        await serviciosService.delete(deleteDialog.servicio.id)
        toast.success(
          'Servicio eliminado',
          `"${deleteDialog.servicio.nombre}" fue retirado permanentemente del catálogo.`
        )
      }
      setDeleteDialog((prev) => ({ ...prev, isOpen: false }))
      cargarDatos()
    } catch (err) {
      toast.error('Error al procesar acción', err instanceof Error ? err.message : 'Error')
    } finally {
      setDeleteDialog((prev) => ({ ...prev, procesando: false }))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Catálogo Comercial de Servicios
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Gestiona servicios con duraciones flexibles, variantes de precio, paquetes y membresías
          </p>
        </div>

        {tabPrincipal === 'servicios' && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      {/* Navegación por pestañas superiores */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
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
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                esActiva
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface text-text-muted hover:text-text hover:bg-surface-subtle border border-border',
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
        <div className="space-y-5">
          {/* Onboarding / First Use Hint */}
          <FirstUseHint
            hintKey="servicios_catalogo_onboarding"
            title="Catálogo Flexible & Subservicios"
            description="Configura duraciones y variantes de precios escalonados para cada servicio. Puedes asignar especialistas compatibles, requerir señas o anticipos y desactivar servicios sin alterar tus reportes históricos."
            variant="banner"
          />

          {/* Barra de Filtros, Categorías y Modos de Vista */}
          <ServiciosFiltrosBar
            filtros={filtros}
            onFiltrosChange={setFiltros}
            categorias={categorias}
            empleados={empleados}
            totalServicios={servicios.length}
            serviciosFiltrados={serviciosFiltrados.length}
            vistaModo={vistaModo}
            onVistaModoChange={handleVistaModoChange}
            onAbrirGestionCategorias={() => setModalCategoriasAbierto(true)}
          />

          {/* Contenido: Loader, Empty State o Catálogo */}
          {cargando ? (
            <div className="py-16">
              <Loader text="Cargando catálogo comercial y subservicios..." />
            </div>
          ) : serviciosFiltrados.length === 0 ? (
            <EmptyState
              title={
                servicios.length === 0
                  ? 'Tu catálogo de servicios está vacío'
                  : 'No se encontraron servicios'
              }
              description={
                servicios.length === 0
                  ? 'Crea tu primer servicio con duraciones, precios escalonados y especialistas asignados para habilitar reservas.'
                  : 'Prueba ajustando los filtros de búsqueda, estado o categoría seleccionada.'
              }
              actionLabel={
                servicios.length === 0
                  ? 'Crear Primer Servicio'
                  : 'Limpiar Filtros'
              }
              onAction={() => {
                if (servicios.length === 0) {
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
                } else {
                  setFiltros({
                    busqueda: '',
                    categoriaId: 'todas',
                    estado: 'todos',
                    empleadoId: 'todos',
                  })
                }
              }}
            />
          ) : vistaModo === 'grid' ? (
            /* Vista de Tarjetas */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {serviciosFiltrados.map((serv) => (
                <ServicioCard
                  key={serv.id}
                  servicio={serv}
                  empleados={empleados}
                  onEditar={(s) => {
                    setServicioEditando(s)
                    setModalAbierto(true)
                  }}
                  onDuplicar={handleDuplicar}
                  onToggleActivo={handleToggleActivo}
                  onEliminar={handleSolicitarEliminar}
                />
              ))}
            </div>
          ) : (
            /* Vista de Tabla Compacta */
            <ServiciosTabla
              servicios={serviciosFiltrados}
              empleados={empleados}
              onEditar={(s) => {
                setServicioEditando(s)
                setModalAbierto(true)
              }}
              onDuplicar={handleDuplicar}
              onToggleActivo={handleToggleActivo}
              onEliminar={handleSolicitarEliminar}
            />
          )}
        </div>
      )}

      {/* Modal Comercial de Servicio (Crear / Editar) */}
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
        onAbrirCategorias={() => setModalCategoriasAbierto(true)}
      />

      {/* Modal de Gestión de Categorías Multirubro */}
      <ModalGestionCategorias
        isOpen={modalCategoriasAbierto}
        onClose={() => setModalCategoriasAbierto(false)}
        categorias={categorias}
        servicios={servicios}
        onCategoriasActualizadas={cargarDatos}
      />

      {/* Diálogo de Eliminación Segura y Protección de Citas */}
      <Modal
        isOpen={deleteDialog.isOpen}
        onClose={() => {
          if (!deleteDialog.procesando) {
            setDeleteDialog((prev) => ({ ...prev, isOpen: false }))
          }
        }}
        title="Confirmación de Eliminación"
        size="md"
      >
        <div className="p-5 space-y-4">
          {deleteDialog.verificando ? (
            <div className="py-6">
              <Loader text="Comprobando citas e historial de reservas..." />
            </div>
          ) : deleteDialog.citasCount > 0 ? (
            <>
              {/* Advertencia de Citas Históricas / Activas */}
              <div className="p-4 rounded-xl bg-warning-soft border border-warning/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-text">
                    Servicio vinculado a reservas activas o históricas
                  </p>
                  <p className="text-text-muted">
                    El servicio <strong className="text-text font-bold">"{deleteDialog.servicio?.nombre}"</strong> registra{' '}
                    <strong className="text-text font-bold">{deleteDialog.citasCount} citas</strong> en la plataforma
                    {deleteDialog.citasActivasCount > 0 && (
                      <span className="text-warning-bold font-semibold">
                        {' '}({deleteDialog.citasActivasCount} agendadas / activas)
                      </span>
                    )}.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-text-muted">
                  ¿Qué acción deseas realizar con este servicio?
                </p>

                {/* Opción 1: Desactivar (Recomendada) */}
                <label
                  onClick={() => setDeleteDialog((prev) => ({ ...prev, modo: 'desactivar' }))}
                  className={[
                    'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
                    deleteDialog.modo === 'desactivar'
                      ? 'border-primary bg-primary-soft/40 shadow-2xs'
                      : 'border-border bg-surface hover:bg-surface-subtle',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="modoEliminar"
                    checked={deleteDialog.modo === 'desactivar'}
                    onChange={() => setDeleteDialog((prev) => ({ ...prev, modo: 'desactivar' }))}
                    className="mt-0.5 text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-text">
                        Desactivar servicio
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Se retira del catálogo y reservas públicas, pero se preserva todo el historial contable, citas pasadas y reportes.
                    </p>
                  </div>
                </label>

                {/* Opción 2: Eliminar definitivamente */}
                <label
                  onClick={() => setDeleteDialog((prev) => ({ ...prev, modo: 'eliminar_forzado' }))}
                  className={[
                    'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
                    deleteDialog.modo === 'eliminar_forzado'
                      ? 'border-danger bg-danger-soft/30 shadow-2xs'
                      : 'border-border bg-surface hover:bg-surface-subtle',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="modoEliminar"
                    checked={deleteDialog.modo === 'eliminar_forzado'}
                    onChange={() => setDeleteDialog((prev) => ({ ...prev, modo: 'eliminar_forzado' }))}
                    className="mt-0.5 text-danger focus:ring-danger"
                  />
                  <div>
                    <span className="text-xs font-bold text-danger">
                      Eliminar permanentemente del sistema
                    </span>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Borrado forzado. Las citas históricas vinculadas perderán la referencia al servicio original.
                    </p>
                  </div>
                </label>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
                  disabled={deleteDialog.procesando}
                >
                  Cancelar
                </Button>
                <Button
                  variant={deleteDialog.modo === 'desactivar' ? 'primary' : 'danger'}
                  onClick={handleConfirmarEliminacion}
                  loading={deleteDialog.procesando}
                >
                  {deleteDialog.modo === 'desactivar'
                    ? 'Desactivar Servicio'
                    : 'Eliminar de Todos Modos'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Sin citas asociadas - Borrado estándar seguro */}
              <div className="p-4 rounded-xl bg-danger-soft border border-danger/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-text">
                    ¿Confirmas que deseas eliminar este servicio?
                  </p>
                  <p className="text-text-muted">
                    El servicio <strong className="text-text font-bold">"{deleteDialog.servicio?.nombre}"</strong> no tiene citas registradas. Se eliminará de forma permanente de tu catálogo.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
                  disabled={deleteDialog.procesando}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmarEliminacion}
                  loading={deleteDialog.procesando}
                >
                  Eliminar Servicio
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
