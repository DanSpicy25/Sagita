import { Promocion, ItemVenta, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const COLLECTION_PROMOS = 'promociones'

const SEED_PROMOCIONES: Promocion[] = [
  {
    id: 1,
    nombre: 'Happy Hour Spa (14:00 - 18:00)',
    codigo: 'HAPPYSPA',
    tipo: 'porcentaje',
    valor: 20, // 20%
    alcance: 'categoria',
    categoria: 'Productos de Belleza',
    solo_primera_compra: false,
    hora_inicio: '14:00',
    hora_fin: '18:00',
    usos_max: 200,
    usos_actuales: 42,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Primera Cita Bienvenida',
    codigo: 'BIENVENIDO50',
    tipo: 'monto_fijo',
    valor: 15, // $15 off
    alcance: 'todos',
    solo_primera_compra: true,
    usos_max: 100,
    usos_actuales: 25,
    activo: true,
  },
  {
    id: 3,
    nombre: 'Promo Flash Limpieza Facial',
    codigo: 'FACIAL25',
    tipo: 'porcentaje',
    valor: 25,
    alcance: 'servicio',
    referencia_id: 2, // Limpieza Facial
    solo_primera_compra: false,
    usos_max: 50,
    usos_actuales: 10,
    activo: true,
  },
]

export interface EvaluacionPromoResult {
  aplicable: boolean
  promocion?: Promocion
  descuentoCalculado: number
  mensaje: string
}

export const promocionesService = {
  getPromociones: async (): Promise<ApiResponse<Promocion[]>> => {
    const data = LocalStorageAdapter.getCollection<Promocion>(COLLECTION_PROMOS, SEED_PROMOCIONES)
    return { success: true, message: 'OK', data }
  },

  crearPromocion: async (data: Omit<Promocion, 'id' | 'usos_actuales'>): Promise<ApiResponse<Promocion>> => {
    const nueva: Promocion = {
      ...data,
      id: Date.now(),
      usos_actuales: 0,
    }
    const created = LocalStorageAdapter.insert<Promocion>(COLLECTION_PROMOS, nueva)
    return { success: true, message: 'PromociÃ³n creada', data: created }
  },

  actualizarPromocion: async (id: number, data: Partial<Promocion>): Promise<ApiResponse<Promocion>> => {
    const updated = LocalStorageAdapter.update<Promocion>(COLLECTION_PROMOS, id, data)
    if (!updated) throw new Error('PromociÃ³n no encontrada')
    return { success: true, message: 'PromociÃ³n actualizada', data: updated }
  },

  eliminarPromocion: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.remove<Promocion>(COLLECTION_PROMOS, id)
    return { success: true, message: 'PromociÃ³n eliminada' }
  },

  evaluarPromocion: (params: {
    codigo?: string
    items: ItemVenta[]
    subtotal: number
    esPrimeraCompra?: boolean
  }): EvaluacionPromoResult => {
    const list = LocalStorageAdapter.getCollection<Promocion>(COLLECTION_PROMOS, SEED_PROMOCIONES).filter(
      (p) => p.activo
    )

    if (!params.codigo || !params.codigo.trim()) {
      return { aplicable: false, descuentoCalculado: 0, mensaje: 'Ingrese un cÃ³digo promocional' }
    }

    const codigoBuscado = params.codigo.trim().toUpperCase()
    const promo = list.find((p) => p.codigo?.toUpperCase() === codigoBuscado)

    if (!promo) {
      return { aplicable: false, descuentoCalculado: 0, mensaje: 'CÃ³digo promocional no vÃ¡lido o expirado' }
    }

    // Validar lÃ­mite de usos
    if (promo.usos_max && promo.usos_actuales >= promo.usos_max) {
      return { aplicable: false, descuentoCalculado: 0, mensaje: 'Esta promociÃ³n ha alcanzado su lÃ­mite de usos' }
    }

    // Validar primera compra
    if (promo.solo_primera_compra && !params.esPrimeraCompra) {
      return {
        aplicable: false,
        descuentoCalculado: 0,
        mensaje: 'Esta promociÃ³n es vÃ¡lida Ãºnicamente para nuevos clientes en su primera compra',
      }
    }

    // Validar fechas
    const hoy = new Date().toISOString().split('T')[0]
    if (promo.fecha_inicio && hoy < promo.fecha_inicio) {
      return { aplicable: false, descuentoCalculado: 0, mensaje: `PromociÃ³n vÃ¡lida a partir de ${promo.fecha_inicio}` }
    }
    if (promo.fecha_fin && hoy > promo.fecha_fin) {
      return { aplicable: false, descuentoCalculado: 0, mensaje: 'Esta promociÃ³n ha vencido' }
    }

    // Validar franja horaria
    if (promo.hora_inicio && promo.hora_fin) {
      const now = new Date()
      const horaActual = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      if (horaActual < promo.hora_inicio || horaActual > promo.hora_fin) {
        return {
          aplicable: false,
          descuentoCalculado: 0,
          mensaje: `PromociÃ³n vÃ¡lida solo en horario Happy Hour de ${promo.hora_inicio} a ${promo.hora_fin}`,
        }
      }
    }

    // Calcular descuento segÃºn alcance
    let baseAplicable = 0

    if (promo.alcance === 'todos') {
      baseAplicable = params.subtotal
    } else if (promo.alcance === 'servicio') {
      // Filtrar items que coincidan con referencia_id
      const itemsCoincidentes = params.items.filter(
        (i) => i.tipo === 'servicio' && i.referencia_id === promo.referencia_id
      )
      baseAplicable = itemsCoincidentes.reduce((acc, i) => acc + i.total, 0)
      if (baseAplicable === 0) {
        return {
          aplicable: false,
          descuentoCalculado: 0,
          mensaje: 'El carrito no contiene el servicio especÃ­fico requerido por esta promociÃ³n',
        }
      }
    } else if (promo.alcance === 'categoria') {
      // Aplica sobre productos o servicios que coincidan con la categorÃ­a
      baseAplicable = params.subtotal
    }

    let descuento = 0
    if (promo.tipo === 'porcentaje') {
      descuento = (baseAplicable * promo.valor) / 100
    } else {
      descuento = Math.min(baseAplicable, promo.valor)
    }

    descuento = Math.round(descuento * 100) / 100

    return {
      aplicable: true,
      promocion: promo,
      descuentoCalculado: descuento,
      mensaje: `Â¡PromociÃ³n aplicada! Descuento de $${descuento.toFixed(2)} (${promo.nombre})`,
    }
  },

  registrarUsoPromocion: async (id: number): Promise<void> => {
    const list = LocalStorageAdapter.getCollection<Promocion>(COLLECTION_PROMOS, SEED_PROMOCIONES)
    const promo = list.find((p) => p.id === id)
    if (promo) {
      promo.usos_actuales += 1
      LocalStorageAdapter.setCollection(COLLECTION_PROMOS, list)
    }
  },
}
