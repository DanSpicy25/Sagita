import { ReglaComision, ComisionVenta, ItemVenta, Venta, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const COLLECTION_REGLAS = 'reglas_comision'
const COLLECTION_COMISIONES = 'comisiones_ventas'

const SEED_REGLAS: ReglaComision[] = [
  {
    id: 1,
    nombre: 'ComisiÃ³n EstÃ¡ndar de Servicios',
    tipo_calculo: 'porcentaje',
    valor: 35, // 35% de comisiÃ³n en servicios
    aplicar_a: 'general',
    activo: true,
  },
  {
    id: 2,
    nombre: 'ComisiÃ³n Especial Dr. Carlos Ruiz (Consultas)',
    tipo_calculo: 'porcentaje',
    valor: 50, // 50%
    aplicar_a: 'profesional',
    referencia_id: 1, // ID de empleado Carlos
    activo: true,
  },
  {
    id: 3,
    nombre: 'Bono Fijo Limpieza Facial',
    tipo_calculo: 'monto_fijo',
    valor: 20, // $20 fijos por limpieza
    aplicar_a: 'servicio',
    referencia_id: 2, // Limpieza Facial
    activo: true,
  },
  {
    id: 4,
    nombre: 'ComisiÃ³n Ventas de Productos CosmÃ©ticos',
    tipo_calculo: 'porcentaje',
    valor: 10, // 10%
    aplicar_a: 'categoria',
    categoria: 'Productos de Belleza',
    activo: true,
  },
]

const SEED_COMISIONES: ComisionVenta[] = [
  {
    id: 1,
    venta_id: 1,
    venta_numero: 'VTA-2026-001',
    item_id: 'i1',
    concepto: 'Consulta General',
    profesional_id: 1,
    profesional_nombre: 'Dr. Carlos Ruiz',
    base_calculo: 50,
    regla_id: 2,
    porcentaje: 50,
    monto_comision: 25,
    periodo: '2026-09',
    estado: 'pendiente',
    fecha_generacion: '2026-09-25T10:15:00Z',
  },
  {
    id: 2,
    venta_id: 2,
    venta_numero: 'VTA-2026-002',
    item_id: 'i3',
    concepto: 'Limpieza Facial Profunda',
    profesional_id: 2,
    profesional_nombre: 'Dra. MarÃ­a Santos',
    base_calculo: 65,
    regla_id: 3,
    monto_comision: 20,
    periodo: '2026-09',
    estado: 'liquidada',
    fecha_generacion: '2026-09-25T11:30:00Z',
    fecha_liquidacion: '2026-09-26T18:00:00Z',
  },
]

export const comisionesService = {
  // â”€â”€â”€ Reglas de ComisiÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  getReglas: async (): Promise<ApiResponse<ReglaComision[]>> => {
    const data = LocalStorageAdapter.getCollection<ReglaComision>(COLLECTION_REGLAS, SEED_REGLAS)
    return { success: true, message: 'OK', data }
  },

  crearRegla: async (data: Omit<ReglaComision, 'id'>): Promise<ApiResponse<ReglaComision>> => {
    const nueva: ReglaComision = {
      ...data,
      id: Date.now(),
    }
    const created = LocalStorageAdapter.insert<ReglaComision>(COLLECTION_REGLAS, nueva)
    return { success: true, message: 'Regla de comisiÃ³n creada', data: created }
  },

  actualizarRegla: async (id: number, data: Partial<ReglaComision>): Promise<ApiResponse<ReglaComision>> => {
    const updated = LocalStorageAdapter.update<ReglaComision>(COLLECTION_REGLAS, id, data)
    if (!updated) throw new Error('Regla no encontrada')
    return { success: true, message: 'Regla actualizada', data: updated }
  },

  eliminarRegla: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.remove<ReglaComision>(COLLECTION_REGLAS, id)
    return { success: true, message: 'Regla eliminada' }
  },

  // â”€â”€â”€ Comisiones Registradas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  getComisiones: async (params?: {
    profesional_id?: number
    periodo?: string
    estado?: string
  }): Promise<ApiResponse<ComisionVenta[]>> => {
    let list = LocalStorageAdapter.getCollection<ComisionVenta>(COLLECTION_COMISIONES, SEED_COMISIONES)

    if (params?.profesional_id) {
      list = list.filter((c) => c.profesional_id === params.profesional_id)
    }
    if (params?.periodo) {
      list = list.filter((c) => c.periodo === params.periodo)
    }
    if (params?.estado) {
      list = list.filter((c) => c.estado === params.estado)
    }

    return { success: true, message: 'OK', data: list }
  },

  calcularComisionItem: (
    item: ItemVenta,
    categoriaItem?: string
  ): { monto: number; regla?: ReglaComision } => {
    const reglas = LocalStorageAdapter.getCollection<ReglaComision>(COLLECTION_REGLAS, SEED_REGLAS).filter(
      (r) => r.activo
    )

    // Prioridad de reglas:
    // 1. EspecÃ­fica por servicio (si item.tipo === 'servicio')
    if (item.tipo === 'servicio') {
      const reglaServicio = reglas.find((r) => r.aplicar_a === 'servicio' && r.referencia_id === item.referencia_id)
      if (reglaServicio) {
        const monto =
          reglaServicio.tipo_calculo === 'porcentaje'
            ? (item.total * reglaServicio.valor) / 100
            : reglaServicio.valor * item.cantidad
        return { monto, regla: reglaServicio }
      }
    }

    // 2. EspecÃ­fica por profesional
    if (item.profesional_id) {
      const reglaProf = reglas.find((r) => r.aplicar_a === 'profesional' && r.referencia_id === item.profesional_id)
      if (reglaProf) {
        const monto =
          reglaProf.tipo_calculo === 'porcentaje'
            ? (item.total * reglaProf.valor) / 100
            : reglaProf.valor * item.cantidad
        return { monto, regla: reglaProf }
      }
    }

    // 3. EspecÃ­fica por categorÃ­a
    if (categoriaItem) {
      const reglaCat = reglas.find(
        (r) => r.aplicar_a === 'categoria' && r.categoria?.toLowerCase() === categoriaItem.toLowerCase()
      )
      if (reglaCat) {
        const monto =
          reglaCat.tipo_calculo === 'porcentaje'
            ? (item.total * reglaCat.valor) / 100
            : reglaCat.valor * item.cantidad
        return { monto, regla: reglaCat }
      }
    }

    // 4. Regla general
    const reglaGeneral = reglas.find((r) => r.aplicar_a === 'general')
    if (reglaGeneral) {
      const monto =
        reglaGeneral.tipo_calculo === 'porcentaje'
          ? (item.total * reglaGeneral.valor) / 100
          : reglaGeneral.valor * item.cantidad
      return { monto, regla: reglaGeneral }
    }

    return { monto: 0 }
  },

  registrarComisionesPorVenta: async (venta: Venta): Promise<ApiResponse<ComisionVenta[]>> => {
    const generadas: ComisionVenta[] = []
    const now = new Date()
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    for (const item of venta.items) {
      if (item.profesional_id && item.profesional_nombre) {
        const { monto, regla } = comisionesService.calcularComisionItem(item)
        if (monto > 0) {
          const comision: ComisionVenta = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            venta_id: venta.id,
            venta_numero: venta.numero,
            item_id: item.id,
            concepto: item.nombre,
            profesional_id: item.profesional_id,
            profesional_nombre: item.profesional_nombre,
            base_calculo: item.total,
            regla_id: regla?.id,
            porcentaje: regla?.tipo_calculo === 'porcentaje' ? regla.valor : undefined,
            monto_comision: Math.round(monto * 100) / 100,
            periodo,
            estado: 'pendiente',
            fecha_generacion: now.toISOString(),
          }

          LocalStorageAdapter.insert<ComisionVenta>(COLLECTION_COMISIONES, comision)
          generadas.push(comision)
        }
      }
    }

    return { success: true, message: `Se generaron ${generadas.length} comisiones`, data: generadas }
  },

  liquidarComisiones: async (ids: number[]): Promise<ApiResponse<{ liquidadaCount: number; total: number }>> => {
    const list = LocalStorageAdapter.getCollection<ComisionVenta>(COLLECTION_COMISIONES, SEED_COMISIONES)
    let total = 0
    let liquidadaCount = 0
    const now = new Date().toISOString()

    for (const id of ids) {
      const com = list.find((c) => c.id === id)
      if (com && com.estado === 'pendiente') {
        com.estado = 'liquidada'
        com.fecha_liquidacion = now
        total += com.monto_comision
        liquidadaCount++
      }
    }

    LocalStorageAdapter.setCollection(COLLECTION_COMISIONES, list)
    return {
      success: true,
      message: `${liquidadaCount} comisiones liquidadas por un total de $${total.toFixed(2)}`,
      data: { liquidadaCount, total },
    }
  },

  cancelarComisionesPorVenta: async (ventaId: number): Promise<ApiResponse<void>> => {
    const list = LocalStorageAdapter.getCollection<ComisionVenta>(COLLECTION_COMISIONES, SEED_COMISIONES)
    for (const com of list) {
      if (com.venta_id === ventaId && com.estado === 'pendiente') {
        com.estado = 'cancelada'
      }
    }
    LocalStorageAdapter.setCollection(COLLECTION_COMISIONES, list)
    return { success: true, message: 'Comisiones pendientes canceladas para la venta' }
  },
}
