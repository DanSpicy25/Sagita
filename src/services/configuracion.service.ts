import { apiClient } from './api.client'
import { ConfiguracionMarcaBlanca } from '@/types'

export const configuracionService = {
  // Obtener la configuración actual del negocio y marca blanca
  getConfiguracion: () =>
    apiClient.get<ConfiguracionMarcaBlanca>('/configuracion'),

  // Actualizar la configuración del negocio y marca blanca
  actualizarConfiguracion: (data: Partial<ConfiguracionMarcaBlanca>) =>
    apiClient.put<ConfiguracionMarcaBlanca>('/configuracion', data),

  // Restablecer la configuración a los valores por defecto del sistema
  resetConfiguracion: () =>
    apiClient.post<ConfiguracionMarcaBlanca>('/configuracion/reset', {}),
}

