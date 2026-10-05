import { ApiResponse, ReglaAutomatizacion, EjecucionLogAutomatizacion } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import {
  automationEngine,
  COLLECTION_REGLAS,
  COLLECTION_LOGS,
  SEED_REGLAS,
} from './automationEngine.service'
import { generarContextoEjemplo } from '@/utils/templateEngine'

export const automatizacionesService = {
  getReglas: async (): Promise<ApiResponse<ReglaAutomatizacion[]>> => {
    const list = LocalStorageAdapter.getCollection<ReglaAutomatizacion>(
      COLLECTION_REGLAS,
      SEED_REGLAS
    )
    return { success: true, message: 'OK', data: list }
  },

  getReglaById: async (id: number): Promise<ApiResponse<ReglaAutomatizacion>> => {
    const list = LocalStorageAdapter.getCollection<ReglaAutomatizacion>(
      COLLECTION_REGLAS,
      SEED_REGLAS
    )
    const regla = list.find((r) => r.id === id)
    if (!regla) {
      throw new Error(`Regla con ID ${id} no encontrada`)
    }
    return { success: true, message: 'OK', data: regla }
  },

  crearRegla: async (
    data: Partial<ReglaAutomatizacion>
  ): Promise<ApiResponse<ReglaAutomatizacion>> => {
    const nueva: ReglaAutomatizacion = {
      id: Date.now(),
      nombre: data.nombre || 'Nueva Regla',
      descripcion: data.descripcion || '',
      trigger: data.trigger || 'reserva_creada',
      condiciones: data.condiciones || [],
      acciones: data.acciones || [],
      activo: data.activo !== undefined ? data.activo : true,
      ejecuciones_totales: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const created = LocalStorageAdapter.insert<ReglaAutomatizacion>(COLLECTION_REGLAS, nueva)
    return { success: true, message: 'Regla creada con éxito', data: created }
  },

  actualizarRegla: async (
    id: number,
    data: Partial<ReglaAutomatizacion>
  ): Promise<ApiResponse<ReglaAutomatizacion>> => {
    const updated = LocalStorageAdapter.update<ReglaAutomatizacion>(COLLECTION_REGLAS, id, {
      ...data,
      updated_at: new Date().toISOString(),
    })
    if (!updated) {
      throw new Error(`Regla con ID ${id} no encontrada`)
    }
    return { success: true, message: 'Regla actualizada', data: updated }
  },

  toggleActivo: async (id: number, activo: boolean): Promise<ApiResponse<ReglaAutomatizacion>> => {
    return automatizacionesService.actualizarRegla(id, { activo })
  },

  eliminarRegla: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.delete(COLLECTION_REGLAS, id)
    return { success: true, message: 'Regla eliminada' }
  },

  getLogs: async (): Promise<ApiResponse<EjecucionLogAutomatizacion[]>> => {
    const list = LocalStorageAdapter.getCollection<EjecucionLogAutomatizacion>(
      COLLECTION_LOGS,
      []
    )
    return { success: true, message: 'OK', data: list }
  },

  limpiarLogs: async (): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.setCollection(COLLECTION_LOGS, [])
    return { success: true, message: 'Historial de ejecuciones vaciado' }
  },

  probarRegla: async (reglaId: number): Promise<ApiResponse<EjecucionLogAutomatizacion>> => {
    const { data: regla } = await automatizacionesService.getReglaById(reglaId)
    if (!regla) {
      throw new Error(`Regla con ID ${reglaId} no encontrada`)
    }
    const contextoEjemplo = generarContextoEjemplo()
    const log = await automationEngine.simularRegla(regla, contextoEjemplo)
    return { success: true, message: 'Prueba ejecutada con éxito', data: log }
  },
}

