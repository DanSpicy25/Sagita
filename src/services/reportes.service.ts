import { apiClient } from '@/services/api.client'
import { Cita, Cliente, Servicio, Factura, ApiResponse } from '@/types'
import { appointmentRepository, clientRepository, serviceRepository } from '@/repositories'
import { pagosService } from './pagos.service'

export const reportesService = {
  getCitas: async (): Promise<ApiResponse<Cita[]>> => {
    try {
      const res = await apiClient.get<Cita[]>('/citas')
      if (res.data) return res
    } catch {
      // Fallback a repositorio local
    }
    return appointmentRepository.getAll()
  },

  getClientes: async (): Promise<ApiResponse<Cliente[]>> => {
    try {
      const res = await apiClient.get<Cliente[]>('/clientes')
      if (res.data) return res
    } catch {
      // Fallback a repositorio local
    }
    return clientRepository.getAll()
  },

  getServicios: async (): Promise<ApiResponse<Servicio[]>> => {
    try {
      const res = await apiClient.get<Servicio[]>('/servicios')
      if (res.data) return res
    } catch {
      // Fallback a repositorio local
    }
    return serviceRepository.getAll()
  },

  getFacturas: async (): Promise<ApiResponse<Factura[]>> => {
    return pagosService.getFacturas()
  },
}
