import React, { useState, useEffect } from 'react'
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  FlaskConical,
  Sparkles,
} from 'lucide-react'
import { RecetaServicio, Servicio, Producto, InsumoServicio } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { serviciosService } from '@/services/servicios.service'
import { inventarioService } from '@/services/inventario.service'
import {
  Button,
  Badge,
  Modal,
  Input,
  Select,
  EmptyState,
} from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { useModules } from '@/context/ModulesContext'

const RECETAS_DEFAULT: RecetaServicio[] = [
  {
    servicio_id: 1, // Corte de Cabello / Styling
    servicio_nombre: 'Corte de Cabello Clásico',
    activo: true,
    insumos: [
      {
        id: 'ins-1',
        producto_id: 1,
        producto_nombre: 'Shampoo Profesional Hidratante',
        cantidad: 30,
        unidad: 'ml',
        costo_estimado: 450,
      },
      {
        id: 'ins-2',
        producto_id: 3,
        producto_nombre: 'Cera Fijadora Mate',
        cantidad: 10,
        unidad: 'gr',
        costo_estimado: 300,
      },
    ],
  },
  {
    servicio_id: 2, // Coloración / Balayage
    servicio_nombre: 'Coloración & Balayage',
    activo: true,
    insumos: [
      {
        id: 'ins-3',
        producto_id: 2,
        producto_nombre: 'Tinte Profesional Tubo 60g',
        cantidad: 1,
        unidad: 'tubo',
        costo_estimado: 4500,
      },
      {
        id: 'ins-4',
        producto_id: 4,
        producto_nombre: 'Oxidante en Crema 20 Vol',
        cantidad: 90,
        unidad: 'ml',
        costo_estimado: 1200,
      },
    ],
  },
]

export function GestionRecetasBOM() {
  const [recetas, setRecetas] = useState<RecetaServicio[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [productos, setProductos] = useState<Producto[]>([])

  // Modal para configurar/editar receta
  const [modalAbierto, setModalAbierto] = useState(false)
  const [servicioSeleccionadoId, setServicioSeleccionadoId] = useState<number>(1)
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<number>(1)
  const [cantidadInsumo, setCantidadInsumo] = useState<number>(1)
  const [unidadInsumo, setUnidadInsumo] = useState<string>('unidad')
  const { toast } = useToast()
  const { tTerm } = useModules()
  const servicioTerm = tTerm('servicio', 'Servicio')
  const serviciosTerm = tTerm('servicios', 'Servicios')

  const cargarDatos = async () => {
    // Recetas
    const guardadas = LocalStorageAdapter.get<RecetaServicio[]>('recetas_servicios', RECETAS_DEFAULT)
    if (!guardadas || guardadas.length === 0) {
      LocalStorageAdapter.set('recetas_servicios', RECETAS_DEFAULT)
      setRecetas(RECETAS_DEFAULT)
    } else {
      setRecetas(guardadas)
    }

    // Servicios
    const resServ = await serviciosService.getAll()
    if (resServ.data) setServicios(resServ.data)

    // Productos
    const resProd = await inventarioService.getProductos()
    if (resProd.data) setProductos(resProd.data)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleAgregarInsumo = (e: React.FormEvent) => {
    e.preventDefault()
    const serv = servicios.find((s) => s.id === Number(servicioSeleccionadoId))
    const prod = productos.find((p) => p.id === Number(productoSeleccionadoId))

    if (!serv || !prod) {
      toast.error('Error', 'Selecciona servicio y producto válidos')
      return
    }

    const nuevoInsumo: InsumoServicio = {
      id: `ins-${Date.now()}`,
      producto_id: prod.id,
      producto_nombre: prod.nombre,
      cantidad: cantidadInsumo,
      unidad: unidadInsumo,
      costo_estimado: (prod.precio_costo || 1000) * (cantidadInsumo / (prod.stock_actual || 1)),
    }

    let recetasActualizadas = [...recetas]
    const indexReceta = recetasActualizadas.findIndex((r) => r.servicio_id === serv.id)

    if (indexReceta >= 0) {
      recetasActualizadas[indexReceta].insumos.push(nuevoInsumo)
    } else {
      recetasActualizadas.push({
        servicio_id: serv.id,
        servicio_nombre: serv.nombre,
        activo: true,
        insumos: [nuevoInsumo],
      })
    }

    LocalStorageAdapter.set('recetas_servicios', recetasActualizadas)
    setRecetas(recetasActualizadas)
    setModalAbierto(false)
    toast.success('Fórmula Actualizada', `Insumo ${prod.nombre} vinculado al servicio ${serv.nombre}`)
  }

  const handleEliminarInsumo = (servicioId: number, insumoId: string) => {
    const actualizadas = recetas.map((r) => {
      if (r.servicio_id === servicioId) {
        return {
          ...r,
          insumos: r.insumos.filter((i) => i.id !== insumoId),
        }
      }
      return r
    })
    LocalStorageAdapter.set('recetas_servicios', actualizadas)
    setRecetas(actualizadas)
    toast.info('Insumo removido', 'Se ha retirado de la fórmula del servicio')
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Fórmulas y Recetas de Consumo (BOM)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define qué insumos se descuentan automáticamente de stock cada vez que se ejecuta o vende un {servicioTerm.toLowerCase()}.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            if (servicios.length > 0) setServicioSeleccionadoId(servicios[0].id)
            if (productos.length > 0) setProductoSeleccionadoId(productos[0].id)
            setModalAbierto(true)
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Añadir Insumo a {servicioTerm}
        </Button>
      </div>

      {/* Grid de Recetas */}
      {recetas.length === 0 ? (
        <EmptyState
          title="Sin recetas registradas"
          description={`Vincula productos de inventario como insumos técnicos a los ${serviciosTerm.toLowerCase()} de tu catálogo.`}
          icon={<Layers className="w-10 h-10 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recetas.map((r) => {
            const totalCostoInsumos = r.insumos.reduce((acc, i) => acc + (i.costo_estimado || 0), 0)

            return (
              <div
                key={r.servicio_id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        {r.servicio_nombre || `Servicio #${r.servicio_id}`}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {r.insumos.length} insumos de consumo estándar
                      </p>
                    </div>
                    <Badge variant="info" size="sm">
                      BOM Activo
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {r.insumos.map((ins) => (
                      <div
                        key={ins.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs"
                      >
                        <div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {ins.producto_nombre}
                          </span>
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {ins.cantidad} {ins.unidad}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            ~${Math.round(ins.costo_estimado || 0).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleEliminarInsumo(r.servicio_id, ins.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Eliminar insumo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Costo técnico en insumos:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ${Math.round(totalCostoInsumos).toLocaleString()} / servicio
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Agregar Insumo */}
      {modalAbierto && (
        <Modal
          isOpen={true}
          onClose={() => setModalAbierto(false)}
          title="Vincular Insumo a Fórmula de Servicio"
        >
          <form onSubmit={handleAgregarInsumo} className="space-y-4">
            <Select
              label="Servicio de Destino *"
              value={servicioSeleccionadoId}
              onChange={(e) => setServicioSeleccionadoId(Number(e.target.value))}
              options={servicios.map((s) => ({ value: s.id, label: s.nombre }))}
            />
            <Select
              label="Insumo de Inventario *"
              value={productoSeleccionadoId}
              onChange={(e) => setProductoSeleccionadoId(Number(e.target.value))}
              options={productos.map((p) => ({
                value: p.id,
                label: `${p.nombre} (Stock: ${p.stock_actual} | ${p.categoria})`,
              }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cantidad a Descontar *"
                type="number"
                min={0.1}
                step={0.1}
                value={cantidadInsumo}
                onChange={(e) => setCantidadInsumo(Number(e.target.value))}
                required
              />
              <Select
                label="Unidad de Medida *"
                value={unidadInsumo}
                onChange={(e) => setUnidadInsumo(e.target.value)}
                options={[
                  { value: 'ml', label: 'Mililitros (ml)' },
                  { value: 'gr', label: 'Gramos (gr)' },
                  { value: 'unidad', label: 'Unidad / Pieza' },
                  { value: 'tubo', label: 'Tubo' },
                  { value: 'ampolla', label: 'Ampolla' },
                  { value: 'par', label: 'Par (guantes, etc.)' },
                ]}
              />
            </div>

            <div className="p-3 bg-primary-50/50 dark:bg-primary-950/20 rounded-xl border border-primary-100 dark:border-primary-900/40 text-xs text-primary-700 dark:text-primary-300">
              Cada vez que este servicio se complete en agenda o se cobre en el POS, el motor restará automáticamente esta dosis de tus existencias.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Guardar en Fórmula
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
