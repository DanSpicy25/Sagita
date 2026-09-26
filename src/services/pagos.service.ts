import { apiClient } from './api.client'
import {
  Factura,
  Cupon,
  ValidacionCupon,
  Reembolso,
  PaqueteServicio,
  ServicioExtra,
  ItemListaEspera,
} from '@/types'

export const pagosService = {
  // ─── Facturas ────────────────────────────────────────────────────────────
  getFacturas: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<Factura[]>(`/facturas${qs}`)
  },

  getFacturaById: (id: number) =>
    apiClient.get<Factura>(`/facturas/${id}`),

  crearFactura: (data: Partial<Factura>) =>
    apiClient.post<Factura>('/facturas', data),

  // ─── Cupones ─────────────────────────────────────────────────────────────
  validarCupon: (codigo: string, total: number) =>
    apiClient.post<ValidacionCupon>('/cupones/validar', { codigo, total }),

  getCupones: () =>
    apiClient.get<Cupon[]>('/cupones'),

  crearCupon: (data: Partial<Cupon>) =>
    apiClient.post<Cupon>('/cupones', data),

  eliminarCupon: (id: number) =>
    apiClient.delete<void>(`/cupones/${id}`),

  // ─── Reembolsos ──────────────────────────────────────────────────────────
  getReembolsos: () =>
    apiClient.get<Reembolso[]>('/reembolsos'),

  solicitarReembolso: (data: { factura_id: number; monto: number; motivo: string }) =>
    apiClient.post<Reembolso>('/reembolsos', data),

  // ─── Paquetes y Bundles ──────────────────────────────────────────────────
  getPaquetes: () =>
    apiClient.get<PaqueteServicio[]>('/paquetes'),

  crearPaquete: (data: Partial<PaqueteServicio>) =>
    apiClient.post<PaqueteServicio>('/paquetes', data),

  // ─── Servicios Extra (Add-ons) ───────────────────────────────────────────
  getServiciosExtra: (servicioId?: number) => {
    const qs = servicioId ? `?servicio_id=${servicioId}` : ''
    return apiClient.get<ServicioExtra[]>(`/servicios-extra${qs}`)
  },

  // ─── Lista de Espera ─────────────────────────────────────────────────────
  getListaEspera: () =>
    apiClient.get<ItemListaEspera[]>('/lista-espera'),

  unirseListaEspera: (data: Partial<ItemListaEspera>) =>
    apiClient.post<ItemListaEspera>('/lista-espera', data),

  cancelarListaEspera: (id: number) =>
    apiClient.delete<void>(`/lista-espera/${id}`),
}

