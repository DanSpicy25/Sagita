import { inventoryRepository } from '@/repositories'
import {
  ApiResponse,
  Producto,
  MovimientoStock,
  AlertaStock,
  MovimientoInventario,
  Proveedor,
  OrdenCompra,
  RecetaServicio,
  InsumoServicio,
} from '@/types'
import { comprasService } from './compras.service'
import { recetasService } from './recetas.service'

export const inventarioService = {
  getProductos: (params?: Record<string, string>): Promise<ApiResponse<Producto[]>> =>
    inventoryRepository.getProductos(params),

  getProducto: (id: number): Promise<ApiResponse<Producto>> =>
    inventoryRepository.getProducto(id),

  createProducto: (data: Partial<Producto>): Promise<ApiResponse<Producto>> =>
    inventoryRepository.createProducto(data),

  updateProducto: (id: number, data: Partial<Producto>): Promise<ApiResponse<Producto>> =>
    inventoryRepository.updateProducto(id, data),

  deleteProducto: (id: number): Promise<ApiResponse<void>> =>
    inventoryRepository.deleteProducto(id),

  getMovimientos: (productoId?: number): Promise<ApiResponse<MovimientoStock[]>> =>
    inventoryRepository.getMovimientos(productoId),

  registrarMovimiento: (data: {
    producto_id: number
    tipo: MovimientoInventario
    cantidad: number
    motivo?: string
    referencia?: string
  }): Promise<ApiResponse<MovimientoStock>> =>
    inventoryRepository.registrarMovimiento(data),

  getAlertasStock: (): Promise<ApiResponse<AlertaStock[]>> =>
    inventoryRepository.getAlertasStock(),

  // ─── Proveedores y Compras ─────────────────────────────────────────────────
  getProveedores: (): Promise<ApiResponse<Proveedor[]>> =>
    comprasService.getProveedores(),

  crearProveedor: (data: Omit<Proveedor, 'id'>): Promise<ApiResponse<Proveedor>> =>
    comprasService.crearProveedor(data),

  actualizarProveedor: (id: number, data: Partial<Proveedor>): Promise<ApiResponse<Proveedor>> =>
    comprasService.actualizarProveedor(id, data),

  eliminarProveedor: (id: number): Promise<ApiResponse<void>> =>
    comprasService.eliminarProveedor(id),

  getOrdenesCompra: (): Promise<ApiResponse<OrdenCompra[]>> =>
    comprasService.getOrdenes(),

  crearOrdenCompra: (data: Partial<OrdenCompra>): Promise<ApiResponse<OrdenCompra>> =>
    comprasService.crearOrden(data),

  actualizarOrdenCompra: (id: number, data: Partial<OrdenCompra>): Promise<ApiResponse<OrdenCompra>> =>
    comprasService.actualizarOrden(id, data),

  recibirOrdenCompra: (id: number): Promise<ApiResponse<OrdenCompra>> =>
    comprasService.recibirOrden(id),

  // ─── Recetas / BOM de Servicios ────────────────────────────────────────────
  getRecetasServicio: (): Promise<ApiResponse<RecetaServicio[]>> =>
    recetasService.getRecetas(),

  getRecetaPorServicio: (servicioId: number): Promise<ApiResponse<RecetaServicio | null>> =>
    recetasService.getRecetaPorServicio(servicioId),

  guardarRecetaServicio: (receta: RecetaServicio): Promise<ApiResponse<RecetaServicio>> =>
    recetasService.guardarReceta(receta),

  eliminarRecetaServicio: (servicioId: number): Promise<ApiResponse<void>> =>
    recetasService.eliminarReceta(servicioId),

  consumirInsumosPorServicio: (
    servicioId: number,
    referencia?: string,
    multiplicador = 1
  ): Promise<ApiResponse<{ insumosConsumidos: InsumoServicio[]; advertencias: string[] }>> =>
    recetasService.consumirInsumosPorServicio(servicioId, referencia, multiplicador),
}

