import { apiClient } from '@/services/api.client'
import { Cita, Cliente, Servicio, Factura } from '@/types'

export const reportesService = {
  getCitas: () => apiClient.get<Cita[]>('/citas'),
  getClientes: () => apiClient.get<Cliente[]>('/clientes'),
  getServicios: () => apiClient.get<Servicio[]>('/servicios'),
  getFacturas: () => apiClient.get<Factura[]>('/facturas'),
}
