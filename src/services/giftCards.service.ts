import { ApiResponse, GiftCard, MovimientoGiftCard } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const COLLECTION_GIFT_CARDS = 'gift_cards'

const SEED_GIFT_CARDS: GiftCard[] = [
  {
    id: 1,
    codigo: 'GC-BIENVENIDA-50',
    saldo_inicial: 50,
    saldo_actual: 50,
    cliente_destinatario_nombre: 'Valued Client',
    fecha_emision: '2026-01-01T00:00:00Z',
    estado: 'activa',
    movimientos: [
      {
        id: 'mov-1',
        tipo: 'emision',
        monto: 50,
        saldo_resultante: 50,
        referencia: 'Emisión promocional inicial',
        fecha: '2026-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 2,
    codigo: 'GC-VIP-100',
    saldo_inicial: 100,
    saldo_actual: 75,
    cliente_destinatario_nombre: 'Cliente Frecuente',
    fecha_emision: '2026-02-15T00:00:00Z',
    estado: 'activa',
    movimientos: [
      {
        id: 'mov-2',
        tipo: 'emision',
        monto: 100,
        saldo_resultante: 100,
        referencia: 'Compra regalo',
        fecha: '2026-02-15T00:00:00Z',
      },
      {
        id: 'mov-3',
        tipo: 'consumo',
        monto: 25,
        saldo_resultante: 75,
        referencia: 'Consumo parcial VTA-001',
        fecha: '2026-03-01T12:00:00Z',
      },
    ],
  },
]

export const giftCardsService = {
  getAll: async (): Promise<ApiResponse<GiftCard[]>> => {
    const list = LocalStorageAdapter.getCollection<GiftCard>(
      COLLECTION_GIFT_CARDS,
      SEED_GIFT_CARDS
    )
    return { success: true, message: 'OK', data: list }
  },

  getGiftCards: async (): Promise<ApiResponse<GiftCard[]>> => {
    return giftCardsService.getAll()
  },

  getByCodigo: async (codigo: string): Promise<ApiResponse<GiftCard>> => {
    const list = LocalStorageAdapter.getCollection<GiftCard>(
      COLLECTION_GIFT_CARDS,
      SEED_GIFT_CARDS
    )
    const gc = list.find((g) => g.codigo.toUpperCase() === codigo.trim().toUpperCase())
    if (!gc) {
      throw new Error(`Gift Card "${codigo}" no encontrada`)
    }
    return { success: true, message: 'OK', data: gc }
  },

  crear: async (data: Partial<GiftCard>): Promise<ApiResponse<GiftCard>> => {
    const saldo = Number(data.saldo_inicial || 0)
    const codigo = data.codigo || `GC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const nuevo: GiftCard = {
      id: Date.now(),
      codigo,
      saldo_inicial: saldo,
      saldo_actual: saldo,
      cliente_comprador_id: data.cliente_comprador_id,
      cliente_destinatario_nombre: data.cliente_destinatario_nombre,
      cliente_destinatario_email: data.cliente_destinatario_email,
      fecha_emision: new Date().toISOString(),
      fecha_expiracion: data.fecha_expiracion,
      estado: 'activa',
      movimientos: [
        {
          id: `mov-${Date.now()}`,
          tipo: 'emision',
          monto: saldo,
          saldo_resultante: saldo,
          referencia: 'Emisión de tarjeta',
          fecha: new Date().toISOString(),
        },
      ],
    }

    const created = LocalStorageAdapter.insert<GiftCard>(COLLECTION_GIFT_CARDS, nuevo)
    return { success: true, message: 'Gift Card creada exitosamente', data: created }
  },

  consumirSaldo: async (
    codigo: string,
    monto: number,
    referencia?: string
  ): Promise<ApiResponse<GiftCard>> => {
    const list = LocalStorageAdapter.getCollection<GiftCard>(
      COLLECTION_GIFT_CARDS,
      SEED_GIFT_CARDS
    )
    const idx = list.findIndex((g) => g.codigo.toUpperCase() === codigo.trim().toUpperCase())
    if (idx === -1) {
      throw new Error(`Gift Card "${codigo}" no encontrada`)
    }

    const card = list[idx]
    if (card.estado !== 'activa') {
      throw new Error(`La tarjeta está ${card.estado} y no puede utilizarse`)
    }
    if (card.saldo_actual < monto) {
      throw new Error(`Saldo insuficiente en Gift Card. Disponible: $${card.saldo_actual.toFixed(2)}`)
    }

    const nuevoSaldo = Number((card.saldo_actual - monto).toFixed(2))
    const nuevoMovimiento: MovimientoGiftCard = {
      id: `mov-${Date.now()}`,
      tipo: 'consumo',
      monto,
      saldo_resultante: nuevoSaldo,
      referencia: referencia || 'Consumo en venta',
      fecha: new Date().toISOString(),
    }

    card.saldo_actual = nuevoSaldo
    if (nuevoSaldo === 0) {
      card.estado = 'agotada'
    }
    card.movimientos = [nuevoMovimiento, ...(card.movimientos || [])]

    LocalStorageAdapter.setCollection(COLLECTION_GIFT_CARDS, list)
    return { success: true, message: 'Saldo consumido con éxito', data: card }
  },

  recargarSaldo: async (
    codigo: string,
    monto: number,
    referencia?: string
  ): Promise<ApiResponse<GiftCard>> => {
    const list = LocalStorageAdapter.getCollection<GiftCard>(
      COLLECTION_GIFT_CARDS,
      SEED_GIFT_CARDS
    )
    const idx = list.findIndex((g) => g.codigo.toUpperCase() === codigo.trim().toUpperCase())
    if (idx === -1) {
      throw new Error(`Gift Card "${codigo}" no encontrada`)
    }

    const card = list[idx]
    const nuevoSaldo = Number((card.saldo_actual + monto).toFixed(2))
    const nuevoMovimiento: MovimientoGiftCard = {
      id: `mov-${Date.now()}`,
      tipo: 'recarga',
      monto,
      saldo_resultante: nuevoSaldo,
      referencia: referencia || 'Recarga de saldo',
      fecha: new Date().toISOString(),
    }

    card.saldo_actual = nuevoSaldo
    if (card.estado === 'agotada') {
      card.estado = 'activa'
    }
    card.movimientos = [nuevoMovimiento, ...(card.movimientos || [])]

    LocalStorageAdapter.setCollection(COLLECTION_GIFT_CARDS, list)
    return { success: true, message: 'Saldo recargado con éxito', data: card }
  },
}
