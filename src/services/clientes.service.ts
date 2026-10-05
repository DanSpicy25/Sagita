import { clientRepository } from '@/repositories'
import { Cliente, NotaCliente, ArchivoCliente, ConsentimientoCliente, ApiResponse } from '@/types'

export const clientesService = {
  getAll: (q?: string) => clientRepository.getAll(q),
  getClientes: (q?: string) => clientRepository.getAll(q),

  getById: (id: number) => clientRepository.getById(id),

  create: (data: Partial<Cliente>) => clientRepository.create(data),

  update: (id: number, data: Partial<Cliente>) => clientRepository.update(id, data),

  delete: (id: number): Promise<ApiResponse<void>> => clientRepository.delete(id),

  agregarNota: async (
    clienteId: number,
    autor: string,
    texto: string
  ): Promise<ApiResponse<Cliente>> => {
    const res = await clientRepository.getById(clienteId)
    const cliente = res.data
    if (!cliente) throw new Error('Cliente no encontrado')

    const nuevaNota: NotaCliente = {
      id: `nota_${Date.now()}`,
      fecha: new Date().toISOString().slice(0, 10),
      autor,
      texto,
    }

    const notasActualizadas = [nuevaNota, ...(cliente.notas_historial || [])]
    return clientRepository.update(clienteId, { notas_historial: notasActualizadas })
  },

  agregarArchivo: async (
    clienteId: number,
    archivo: { nombre: string; url?: string; tipo?: string; tamano?: string }
  ): Promise<ApiResponse<Cliente>> => {
    const res = await clientRepository.getById(clienteId)
    const cliente = res.data
    if (!cliente) throw new Error('Cliente no encontrado')

    const nuevoArchivo: ArchivoCliente = {
      id: `file_${Date.now()}`,
      nombre: archivo.nombre,
      url: archivo.url || '#',
      tipo: archivo.tipo || 'documento',
      fecha: new Date().toISOString().slice(0, 10),
      tamano: archivo.tamano || '1.0 MB',
    }

    const archivosActualizados = [...(cliente.archivos || []), nuevoArchivo]
    return clientRepository.update(clienteId, { archivos: archivosActualizados })
  },

  registrarConsentimiento: async (
    clienteId: number,
    consentimiento: { titulo: string; version?: string; firma_url?: string }
  ): Promise<ApiResponse<Cliente>> => {
    const res = await clientRepository.getById(clienteId)
    const cliente = res.data
    if (!cliente) throw new Error('Cliente no encontrado')

    const nuevoConsentimiento: ConsentimientoCliente = {
      id: `cons_${Date.now()}`,
      titulo: consentimiento.titulo,
      firmado: true,
      aceptado: true,
      fecha: new Date().toISOString(),
      version: consentimiento.version || '1.0',
      firma_url: consentimiento.firma_url,
    }

    const consentimientosActualizados = [...(cliente.consentimientos || []), nuevoConsentimiento]
    return clientRepository.update(clienteId, { consentimientos: consentimientosActualizados })
  },

  actualizarEtiquetas: async (
    clienteId: number,
    etiquetas: string[]
  ): Promise<ApiResponse<Cliente>> => {
    return clientRepository.update(clienteId, { etiquetas })
  },

  actualizarExtensionesVertical: async (
    clienteId: number,
    extensiones_vertical: Record<string, unknown>
  ): Promise<ApiResponse<Cliente>> => {
    const res = await clientRepository.getById(clienteId)
    const cliente = res.data
    if (!cliente) throw new Error('Cliente no encontrado')

    const fusionadas = { ...(cliente.extensiones_vertical || {}), ...extensiones_vertical }
    return clientRepository.update(clienteId, { extensiones_vertical: fusionadas })
  },
}
