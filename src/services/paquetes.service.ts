import { PaqueteServicio, ClientePaquete, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const COLLECTION_PAQUETES = 'paquetes'
const COLLECTION_CLIENTES_PAQUETES = 'clientes_paquetes'

export const SEED_PAQUETES: PaqueteServicio[] = [
  {
    id: 1,
    nombre: 'Pack 5 Sesiones Terapia Facial',
    descripcion: 'Bono de 5 sesiones de limpieza e hidratación profunda con 20% de descuento.',
    precio_total: 180,
    precio_original: 225,
    total_sesiones: 5,
    validez_dias: 90,
    servicios_ids: [2],
    descuento_porcentaje: 20,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Bono 10 Sesiones Masaje Descontracturante',
    descripcion: 'Paquete intensivo de masajes terapéuticos corporales.',
    precio_total: 320,
    precio_original: 400,
    total_sesiones: 10,
    validez_dias: 180,
    servicios_ids: [3],
    descuento_porcentaje: 20,
    activo: true,
  },
]

export const SEED_CLIENTES_PAQUETES: ClientePaquete[] = [
  {
    id: 1,
    cliente_id: 1,
    paquete_id: 1,
    paquete: SEED_PAQUETES[0],
    total_sesiones: 5,
    sesiones_consumidas: 2,
    sesiones_restantes: 3,
    fecha_compra: '2026-09-01T10:00:00Z',
    fecha_expiracion: '2026-11-30T23:59:59Z',
    estado: 'activo',
  },
]

export const paquetesService = {
  getAll: async (params?: { activo?: boolean }): Promise<ApiResponse<PaqueteServicio[]>> => {
    let list = LocalStorageAdapter.getCollection<PaqueteServicio>(COLLECTION_PAQUETES, SEED_PAQUETES)
    if (params?.activo !== undefined) {
      list = list.filter((p) => p.activo === params.activo)
    }
    return { success: true, message: 'OK', data: list }
  },

  getById: async (id: number): Promise<ApiResponse<PaqueteServicio>> => {
    const list = LocalStorageAdapter.getCollection<PaqueteServicio>(COLLECTION_PAQUETES, SEED_PAQUETES)
    const found = list.find((p) => p.id === id)
    if (!found) throw new Error('Paquete no encontrado')
    return { success: true, message: 'OK', data: found }
  },

  create: async (data: Partial<PaqueteServicio>): Promise<ApiResponse<PaqueteServicio>> => {
    const nuevo: PaqueteServicio = {
      id: Date.now(),
      nombre: data.nombre || 'Nuevo Paquete',
      descripcion: data.descripcion || '',
      precio_total: Number(data.precio_total) || 100,
      precio_original: Number(data.precio_original) || 120,
      total_sesiones: Number(data.total_sesiones) || 5,
      validez_dias: Number(data.validez_dias) || 90,
      servicios_ids: data.servicios_ids || [],
      descuento_porcentaje: Number(data.descuento_porcentaje) || 15,
      activo: data.activo !== undefined ? data.activo : true,
    }
    const created = LocalStorageAdapter.insert<PaqueteServicio>(COLLECTION_PAQUETES, nuevo)
    return { success: true, message: 'Paquete creado con éxito', data: created }
  },

  update: async (id: number, data: Partial<PaqueteServicio>): Promise<ApiResponse<PaqueteServicio>> => {
    const updated = LocalStorageAdapter.update<PaqueteServicio>(COLLECTION_PAQUETES, id, data)
    if (!updated) throw new Error('Paquete no encontrado')
    return { success: true, message: 'Paquete actualizado', data: updated }
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.remove<PaqueteServicio>(COLLECTION_PAQUETES, id)
    return { success: true, message: 'Paquete eliminado' }
  },

  getClientesPaquetes: async (clienteId?: number): Promise<ApiResponse<ClientePaquete[]>> => {
    let list = LocalStorageAdapter.getCollection<ClientePaquete>(
      COLLECTION_CLIENTES_PAQUETES,
      SEED_CLIENTES_PAQUETES
    )
    if (clienteId !== undefined) {
      list = list.filter((cp) => cp.cliente_id === clienteId)
    }
    return { success: true, message: 'OK', data: list }
  },

  asignarACliente: async (
    clienteId: number,
    paqueteId: number,
    notas?: string
  ): Promise<ApiResponse<ClientePaquete>> => {
    void notas
    const paquetes = LocalStorageAdapter.getCollection<PaqueteServicio>(COLLECTION_PAQUETES, SEED_PAQUETES)
    const paq = paquetes.find((p) => p.id === paqueteId)
    if (!paq) throw new Error('Paquete no encontrado')

    const totalSesiones = paq.total_sesiones || 5
    const validezDias = paq.validez_dias || 90
    const expDate = new Date()
    expDate.setDate(expDate.getDate() + validezDias)

    const nuevo: ClientePaquete = {
      id: Date.now(),
      cliente_id: clienteId,
      paquete_id: paqueteId,
      paquete: paq,
      total_sesiones: totalSesiones,
      sesiones_consumidas: 0,
      sesiones_restantes: totalSesiones,
      fecha_compra: new Date().toISOString(),
      fecha_expiracion: expDate.toISOString(),
      estado: 'activo',
    }

    const created = LocalStorageAdapter.insert<ClientePaquete>(COLLECTION_CLIENTES_PAQUETES, nuevo)
    return { success: true, message: 'Paquete asignado al cliente con éxito', data: created }
  },

  consumirSesion: async (clientePaqueteId: number, motivo?: string): Promise<ApiResponse<ClientePaquete>> => {
    void motivo
    const list = LocalStorageAdapter.getCollection<ClientePaquete>(
      COLLECTION_CLIENTES_PAQUETES,
      SEED_CLIENTES_PAQUETES
    )
    const cp = list.find((item) => item.id === clientePaqueteId)
    if (!cp) throw new Error('Registro de paquete no encontrado')
    if (cp.sesiones_restantes <= 0) throw new Error('El paquete no posee sesiones restantes')

    cp.sesiones_consumidas += 1
    cp.sesiones_restantes -= 1
    if (cp.sesiones_restantes === 0) {
      cp.estado = 'agotado'
    }

    LocalStorageAdapter.setCollection(COLLECTION_CLIENTES_PAQUETES, list)
    return { success: true, message: 'Sesión consumida', data: cp }
  },
}

