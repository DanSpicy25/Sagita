import {
  ApiResponse,
  Venta,
  SesionCaja,
  MovimientoCaja,
  TipoMovimientoCaja,
  Producto,
  MovimientoStock,
} from '@/types'
import { ISalesRepository } from '../interfaces/ISalesRepository'
import { LocalStorageAdapter } from './LocalStorageAdapter'

const SEED_VENTAS: Venta[] = [
  {
    id: 1,
    numero: 'VTA-2026-001',
    cliente_id: 1,
    cliente: {
      id: 1,
      nombre: 'Ana García',
      email: 'ana@email.com',
      telefono: '+1 555-0101',
      total_citas: 8,
      created_at: '2026-01-10T00:00:00Z',
    },
    items: [
      {
        id: '1',
        tipo: 'servicio',
        referencia_id: 1,
        nombre: 'Consulta General',
        precio_unitario: 50,
        cantidad: 1,
        descuento_item: 0,
        total: 50,
      },
    ],
    subtotal: 50,
    descuento_global: 0,
    impuesto: 0,
    total: 50,
    metodo_pago: 'efectivo',
    estado: 'PAID',
    created_at: new Date().toISOString(),
  },
]

const SEED_SESION: SesionCaja = {
  id: 1,
  apertura_at: new Date().toISOString(),
  monto_inicial: 200,
  total_ventas: 50,
  total_ingresos: 0,
  total_egresos: 0,
  usuario: 'Admin',
  estado: 'abierta',
  movimientos: [
    {
      id: 1,
      tipo: 'apertura',
      monto: 200,
      descripcion: 'Fondo inicial de caja',
      usuario: 'Admin',
      created_at: new Date().toISOString(),
    },
  ],
}

export class LocalSalesRepository implements ISalesRepository {
  private collectionVentas = 'ventas'
  private collectionSesion = 'caja_sesion'

  async getVentas(params?: Record<string, string>): Promise<ApiResponse<Venta[]>> {
    let list = LocalStorageAdapter.getCollection<Venta>(this.collectionVentas, SEED_VENTAS)
    if (params?.estado) {
      list = list.filter((v) => v.estado === params.estado)
    }
    return { success: true, message: 'OK', data: list }
  }

  async getVenta(id: number): Promise<ApiResponse<Venta>> {
    const list = LocalStorageAdapter.getCollection<Venta>(this.collectionVentas, SEED_VENTAS)
    const venta = list.find((v) => v.id === id)
    if (!venta) throw new Error('Venta no encontrada')
    return { success: true, message: 'OK', data: venta }
  }

  async createVenta(data: Partial<Venta>): Promise<ApiResponse<Venta>> {
    const list = LocalStorageAdapter.getCollection<Venta>(this.collectionVentas, SEED_VENTAS)
    const nueva: Venta = {
      id: Date.now(),
      numero: `VTA-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`,
      items: data.items ?? [],
      subtotal: data.subtotal ?? 0,
      descuento_global: data.descuento_global ?? 0,
      impuesto: data.impuesto ?? 0,
      total: data.total ?? 0,
      metodo_pago: data.metodo_pago ?? 'efectivo',
      estado: data.estado ?? 'PAID',
      cliente_id: data.cliente_id,
      cliente: data.cliente,
      notas: data.notas,
      created_at: new Date().toISOString(),
    }
    const created = LocalStorageAdapter.insert<Venta>(this.collectionVentas, nueva)

    // Descontar inventario y registrar movimiento de stock
    if (nueva.items && nueva.items.length > 0) {
      for (const item of nueva.items) {
        if (item.tipo === 'producto' && item.referencia_id) {
          const prods = LocalStorageAdapter.getCollection<Producto>('productos', [])
          const prod = prods.find((p) => p.id === item.referencia_id)
          if (prod) {
            const anterior = prod.stock_actual
            const nuevoStock = Math.max(0, anterior - item.cantidad)
            LocalStorageAdapter.update<Producto>('productos', item.referencia_id, {
              stock_actual: nuevoStock,
            })
            const mov: MovimientoStock = {
              id: Date.now() + Math.floor(Math.random() * 1000),
              producto_id: item.referencia_id,
              producto: prod,
              tipo: 'SALE',
              cantidad: item.cantidad,
              cantidad_anterior: anterior,
              cantidad_nueva: nuevoStock,
              motivo: `Venta ${nueva.numero}`,
              referencia: nueva.numero,
              usuario: 'Admin',
              created_at: nueva.created_at,
            }
            LocalStorageAdapter.insert<MovimientoStock>('movimientos_stock', mov)
          }
        }
      }
    }

    // Actualizar sesión de caja si hay sesión abierta
    const sesiones = LocalStorageAdapter.getCollection<SesionCaja>(this.collectionSesion, [])
    const sesionAbierta = sesiones.find((s) => s.estado === 'abierta')
    if (sesionAbierta) {
      sesionAbierta.total_ventas += nueva.total
      sesionAbierta.movimientos.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        tipo: 'ingreso',
        monto: nueva.total,
        descripcion: `Venta ${nueva.numero}`,
        usuario: 'Admin',
        created_at: nueva.created_at,
      })
      LocalStorageAdapter.setCollection(this.collectionSesion, sesiones)
    }

    return { success: true, message: 'Venta registrada con éxito', data: created }
  }

  async updateVenta(id: number, data: Partial<Venta>): Promise<ApiResponse<Venta>> {
    const updated = LocalStorageAdapter.update<Venta>(this.collectionVentas, id, data)
    if (!updated) throw new Error('Venta no encontrada')
    return { success: true, message: 'Venta actualizada', data: updated }
  }

  async cancelarVenta(id: number): Promise<ApiResponse<Venta>> {
    const updated = LocalStorageAdapter.update<Venta>(this.collectionVentas, id, {
      estado: 'CANCELLED',
    })
    if (!updated) throw new Error('Venta no encontrada')
    return { success: true, message: 'Venta cancelada', data: updated }
  }

  async getSesionActual(): Promise<ApiResponse<SesionCaja | null>> {
    const list = LocalStorageAdapter.getCollection<SesionCaja>(this.collectionSesion, [SEED_SESION])
    const abierta = list.find((s) => s.estado === 'abierta') || null
    return { success: true, message: 'OK', data: abierta }
  }

  async abrirCaja(montoInicial: number): Promise<ApiResponse<SesionCaja>> {
    const nueva: SesionCaja = {
      id: Date.now(),
      apertura_at: new Date().toISOString(),
      monto_inicial: montoInicial,
      total_ventas: 0,
      total_ingresos: 0,
      total_egresos: 0,
      usuario: 'Admin',
      estado: 'abierta',
      movimientos: [
        {
          id: Date.now(),
          tipo: 'apertura',
          monto: montoInicial,
          descripcion: 'Apertura de turno',
          usuario: 'Admin',
          created_at: new Date().toISOString(),
        },
      ],
    }
    LocalStorageAdapter.setCollection(this.collectionSesion, [nueva])
    return { success: true, message: 'Caja abierta exitosamente', data: nueva }
  }

  async cerrarCaja(id: number, montoFinal: number): Promise<ApiResponse<SesionCaja>> {
    const list = LocalStorageAdapter.getCollection<SesionCaja>(this.collectionSesion, [SEED_SESION])
    const sesion = list.find((s) => s.id === id)
    if (!sesion) throw new Error('Sesión de caja no encontrada')

    const saldoEsperado =
      sesion.monto_inicial + sesion.total_ventas + sesion.total_ingresos - sesion.total_egresos
    const diferencia = montoFinal - saldoEsperado

    const updated = LocalStorageAdapter.update<SesionCaja>(this.collectionSesion, id, {
      estado: 'cerrada',
      cierre_at: new Date().toISOString(),
      monto_final: montoFinal,
      diferencia,
    })
    return { success: true, message: 'Caja cerrada', data: updated! }
  }

  async getMovimientosCaja(sesionId?: number): Promise<ApiResponse<MovimientoCaja[]>> {
    const list = LocalStorageAdapter.getCollection<SesionCaja>(this.collectionSesion, [SEED_SESION])
    const sesion = sesionId ? list.find((s) => s.id === sesionId) : list[0]
    return { success: true, message: 'OK', data: sesion?.movimientos || [] }
  }

  async registrarMovimientoCaja(data: {
    sesion_id?: number
    tipo: TipoMovimientoCaja
    monto: number
    descripcion: string
  }): Promise<ApiResponse<MovimientoCaja>> {
    const list = LocalStorageAdapter.getCollection<SesionCaja>(this.collectionSesion, [SEED_SESION])
    const sesion = data.sesion_id
      ? list.find((s) => s.id === data.sesion_id)
      : list.find((s) => s.estado === 'abierta')

    if (!sesion) throw new Error('No hay sesión de caja abierta')

    const mov: MovimientoCaja = {
      id: Date.now(),
      tipo: data.tipo,
      monto: data.monto,
      descripcion: data.descripcion,
      usuario: 'Admin',
      created_at: new Date().toISOString(),
    }

    sesion.movimientos.push(mov)
    if (data.tipo === 'ingreso') sesion.total_ingresos += data.monto
    if (data.tipo === 'egreso') sesion.total_egresos += data.monto

    LocalStorageAdapter.setCollection(this.collectionSesion, list)
    return { success: true, message: 'Movimiento registrado', data: mov }
  }
}
