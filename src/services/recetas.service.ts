import { RecetaServicio, InsumoServicio, Producto, MovimientoStock, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const COLLECTION_RECETAS = 'recetas_servicio'
const COLLECTION_PRODUCTOS = 'productos'
const COLLECTION_MOVIMIENTOS = 'movimientos_stock'

const SEED_RECETAS: RecetaServicio[] = [
  {
    servicio_id: 2, // Limpieza Facial Profunda
    servicio_nombre: 'Limpieza Facial Profunda',
    activo: true,
    insumos: [
      {
        id: 'ins-1',
        producto_id: 2, // Aceite de Lavanda
        producto_nombre: 'Aceite de Masaje Relajante Lavanda 250ml',
        cantidad: 1,
        unidad: 'dosis (25ml)',
        costo_estimado: 3.5,
      },
      {
        id: 'ins-2',
        producto_id: 3, // Guantes de Nitrilo
        producto_nombre: 'Guantes de Nitrilo Desechables (Caja x100)',
        cantidad: 2,
        unidad: 'unidades',
        costo_estimado: 0.36,
      },
    ],
  },
  {
    servicio_id: 3, // Masaje Relajante
    servicio_nombre: 'Masaje Relajante',
    activo: true,
    insumos: [
      {
        id: 'ins-3',
        producto_id: 2,
        producto_nombre: 'Aceite de Masaje Relajante Lavanda 250ml',
        cantidad: 1,
        unidad: 'dosis (50ml)',
        costo_estimado: 6.0,
      },
    ],
  },
]

export const recetasService = {
  getRecetas: async (): Promise<ApiResponse<RecetaServicio[]>> => {
    const data = LocalStorageAdapter.getCollection<RecetaServicio>(COLLECTION_RECETAS, SEED_RECETAS)
    return { success: true, message: 'OK', data }
  },

  getRecetaPorServicio: async (servicioId: number): Promise<ApiResponse<RecetaServicio | null>> => {
    const list = LocalStorageAdapter.getCollection<RecetaServicio>(COLLECTION_RECETAS, SEED_RECETAS)
    const encontrada = list.find((r) => r.servicio_id === servicioId) || null
    return { success: true, message: 'OK', data: encontrada }
  },

  guardarReceta: async (receta: RecetaServicio): Promise<ApiResponse<RecetaServicio>> => {
    const list = LocalStorageAdapter.getCollection<RecetaServicio>(COLLECTION_RECETAS, SEED_RECETAS)
    const idx = list.findIndex((r) => r.servicio_id === receta.servicio_id)
    if (idx >= 0) {
      list[idx] = receta
    } else {
      list.push(receta)
    }
    LocalStorageAdapter.setCollection(COLLECTION_RECETAS, list)
    return { success: true, message: 'Receta de servicio guardada', data: receta }
  },

  eliminarReceta: async (servicioId: number): Promise<ApiResponse<void>> => {
    const list = LocalStorageAdapter.getCollection<RecetaServicio>(COLLECTION_RECETAS, SEED_RECETAS)
    const filtered = list.filter((r) => r.servicio_id !== servicioId)
    LocalStorageAdapter.setCollection(COLLECTION_RECETAS, filtered)
    return { success: true, message: 'Receta eliminada' }
  },

  consumirInsumosPorServicio: async (
    servicioId: number,
    referencia?: string,
    multiplicador = 1
  ): Promise<ApiResponse<{ insumosConsumidos: InsumoServicio[]; advertencias: string[] }>> => {
    const list = LocalStorageAdapter.getCollection<RecetaServicio>(COLLECTION_RECETAS, SEED_RECETAS)
    const receta = list.find((r) => r.servicio_id === servicioId && r.activo)

    if (!receta || !receta.insumos || receta.insumos.length === 0) {
      return {
        success: true,
        message: 'El servicio no requiere insumos de inventario',
        data: { insumosConsumidos: [], advertencias: [] },
      }
    }

    const productos = LocalStorageAdapter.getCollection<Producto>(COLLECTION_PRODUCTOS, [])
    const advertencias: string[] = []
    const consumidos: InsumoServicio[] = []

    for (const insumo of receta.insumos) {
      const cantidadTotal = insumo.cantidad * multiplicador
      const producto = productos.find((p) => p.id === insumo.producto_id)

      if (!producto) {
        advertencias.push(`Insumo "${insumo.producto_nombre}" (ID: ${insumo.producto_id}) no encontrado en el inventario.`)
        continue
      }

      const anterior = producto.stock_actual
      const nuevoStock = Math.max(0, anterior - cantidadTotal)

      if (anterior < cantidadTotal) {
        advertencias.push(
          `Stock insuficiente para "${producto.nombre}". Requerido: ${cantidadTotal} ${insumo.unidad}, Disponible: ${anterior}. Stock ajustado a 0.`
        )
      }

      // Actualizar producto en inventario
      LocalStorageAdapter.update<Producto>(COLLECTION_PRODUCTOS, producto.id, {
        stock_actual: nuevoStock,
      })

      // Registrar movimiento de auditorÃ­a
      const mov: MovimientoStock = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        producto_id: producto.id,
        producto,
        tipo: 'SERVICE_CONSUMPTION',
        cantidad: cantidadTotal,
        cantidad_anterior: anterior,
        cantidad_nueva: nuevoStock,
        motivo: `Consumo en servicio: ${receta.servicio_nombre || `Servicio #${servicioId}`}`,
        referencia: referencia || `SERV-${servicioId}`,
        usuario: 'Sistema POS',
        created_at: new Date().toISOString(),
      }
      LocalStorageAdapter.insert<MovimientoStock>(COLLECTION_MOVIMIENTOS, mov)

      consumidos.push({
        ...insumo,
        cantidad: cantidadTotal,
      })
    }

    return {
      success: true,
      message: `Consumo de insumos registrado (${consumidos.length} insumos)`,
      data: { insumosConsumidos: consumidos, advertencias },
    }
  },
}
