import { ItemListaEspera, EstadoListaEspera, Cita, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { citasService } from './citas.service'

const SEED_LISTA_ESPERA: ItemListaEspera[] = [
  {
    id: 1,
    cliente_id: 1,
    cliente: {
      id: 1,
      nombre: 'Ana García',
      email: 'ana@email.com',
      telefono: '+1 555-0101',
      total_citas: 8,
      created_at: '2026-01-10T00:00:00Z',
    },
    servicio_id: 2,
    servicio: {
      id: 2,
      nombre: 'Limpieza Facial',
      duracion_base_min: 60,
      precio_base: 75,
      activo: true,
      buffer_antes_min: 10,
      buffer_despues_min: 15,
    },
    empleado_id: 2,
    empleado: {
      id: 2,
      usuario_id: 3,
      nombre: 'Dra. Laura Gómez',
      email: 'laura@sagitta.com',
      especialidad: 'Dermatología',
      activo: true,
    },
    fecha_deseada: new Date().toISOString().slice(0, 10),
    hora_preferente: '15:00',
    notas: 'Prefiere en la tarde si se libera un espacio',
    estado: 'en_espera',
    created_at: new Date().toISOString(),
  },
]

export const listaEsperaService = {
  getLista: async (params?: {
    fecha?: string
    estado?: EstadoListaEspera
  }): Promise<ApiResponse<ItemListaEspera[]>> => {
    let list = LocalStorageAdapter.getCollection<ItemListaEspera>('lista_espera', SEED_LISTA_ESPERA)
    if (params?.fecha) {
      list = list.filter((i) => i.fecha_deseada === params.fecha)
    }
    if (params?.estado) {
      list = list.filter((i) => i.estado === params.estado)
    }
    return { success: true, message: 'OK', data: list }
  },

  agregar: async (
    data: Omit<ItemListaEspera, 'id' | 'created_at' | 'estado'>
  ): Promise<ApiResponse<ItemListaEspera>> => {
    const created = LocalStorageAdapter.insert<ItemListaEspera>('lista_espera', {
      ...data,
      estado: 'en_espera' as EstadoListaEspera,
      created_at: new Date().toISOString(),
    } as ItemListaEspera)
    return { success: true, message: 'Agregado a la lista de espera', data: created }
  },

  actualizarEstado: async (
    id: number,
    estado: EstadoListaEspera
  ): Promise<ApiResponse<ItemListaEspera>> => {
    const updated = LocalStorageAdapter.update<ItemListaEspera>('lista_espera', id, { estado })
    if (!updated) throw new Error('Elemento de lista de espera no encontrado')
    return { success: true, message: `Estado actualizado a ${estado}`, data: updated }
  },

  eliminar: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.remove('lista_espera', id)
    return { success: true, message: 'Eliminado de la lista de espera' }
  },

  convertirEnCita: async (
    id: number,
    fechaInicio: string,
    fechaFin: string,
    empleadoId?: number,
    recursoId?: number
  ): Promise<ApiResponse<Cita>> => {
    const item = LocalStorageAdapter.getCollection<ItemListaEspera>('lista_espera', SEED_LISTA_ESPERA).find(
      (i) => i.id === id
    )
    if (!item) throw new Error('Registro de lista de espera no encontrado')

    const res = await citasService.create({
      cliente_id: item.cliente_id,
      cliente: item.cliente,
      servicio_id: item.servicio_id,
      servicio: item.servicio,
      empleado_id: empleadoId || item.empleado_id || 1,
      empleado: item.empleado,
      recurso_id: recursoId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado: 'confirmada',
      precio_total: item.servicio?.precio_base || 50,
      notas: `Agendado desde Lista de Espera: ${item.notas || ''}`,
    })

    if (!res.data) throw new Error('No se pudo crear la cita')

    LocalStorageAdapter.update<ItemListaEspera>('lista_espera', id, {
      estado: 'convertido',
    })

    return {
      success: true,
      message: 'Cita confirmada y generada exitosamente desde la lista de espera',
      data: res.data,
    }
  },
}
