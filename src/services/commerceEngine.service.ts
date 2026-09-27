import {
  Venta,
  ItemVenta,
  SesionCaja,
  MovimientoCaja,
  Producto,
  MovimientoStock,
  ApiResponse,
  PagoSplit,
} from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { recetasService } from './recetas.service'
import { comisionesService } from './comisiones.service'
import { giftCardsService } from './giftCards.service'

const COLLECTION_VENTAS = 'ventas'
const COLLECTION_SESION_CAJA = 'caja_sesion'
const COLLECTION_PRODUCTOS = 'productos'
const COLLECTION_MOVIMIENTOS_STOCK = 'movimientos_stock'
const COLLECTION_CITAS = 'citas'

export interface DatosVentaPayload {
  cliente_id?: number
  cliente?: Venta['cliente']
  items: ItemVenta[]
  subtotal: number
  descuento_global: number
  impuesto: number
  total: number
  metodo_pago: Venta['metodo_pago']
  pagos_split?: PagoSplit[]
  propina?: number
  propina_profesional_id?: number
  notas?: string
  cita_id?: number
  origen?: 'pos' | 'cita' | 'portal'
  promocion_aplicada?: string
}

export interface ResultadoProcesamientoVenta {
  venta: Venta
  insumosConsumidosTotal: number
  comisionesGeneradasTotal: number
  cajaActualizada: boolean
}

export const commerceEngine = {
  /**
   * Ejecuta el flujo comercial completo:
   * 1. Registra la venta.
   * 2. Descuenta saldo de Gift Card si aplica.
   * 3. Descuenta stock directo para productos vendidos ('SALE').
   * 4. Descuenta insumos para servicios que posean Receta / BOM ('SERVICE_CONSUMPTION').
   * 5. Actualiza la sesiÃ³n de caja abierta con desglose de mÃ©todos y propinas.
   * 6. Genera comisiones para los profesionales asignados en las lÃ­neas.
   * 7. Si proviene de una cita, actualiza su estado.
   */
  procesarVenta: async (
    payload: DatosVentaPayload
  ): Promise<ApiResponse<ResultadoProcesamientoVenta>> => {
    const listVentas = LocalStorageAdapter.getCollection<Venta>(COLLECTION_VENTAS, [])
    const now = new Date().toISOString()
    const numero = `VTA-${new Date().getFullYear()}-${String(listVentas.length + 1).padStart(3, '0')}`

    const nuevaVenta: Venta = {
      id: Date.now(),
      numero,
      cliente_id: payload.cliente_id,
      cliente: payload.cliente,
      items: payload.items,
      subtotal: payload.subtotal,
      descuento_global: payload.descuento_global,
      impuesto: payload.impuesto,
      total: payload.total,
      metodo_pago: payload.metodo_pago,
      pagos_split: payload.pagos_split,
      propina: payload.propina,
      propina_profesional_id: payload.propina_profesional_id,
      estado: 'PAID',
      notas: payload.notas,
      cita_id: payload.cita_id,
      origen: payload.origen || 'pos',
      promocion_aplicada: payload.promocion_aplicada,
      created_at: now,
    }

    // 1. Guardar la venta
    const ventaCreada = LocalStorageAdapter.insert<Venta>(COLLECTION_VENTAS, nuevaVenta)

    // 2. Procesar deducciÃ³n de Gift Card si se utilizÃ³
    if (payload.metodo_pago === 'gift_card') {
      const splitGC = payload.pagos_split?.find((p) => p.metodo === 'gift_card')
      const codigoGC = splitGC?.gift_card_codigo || payload.notas?.match(/GC-[A-Z0-9-]+/)?.[0]
      if (codigoGC) {
        try {
          await giftCardsService.consumirSaldo(codigoGC, payload.total, `Pago Venta ${numero}`)
        } catch {
          // Ignorar si no se pudo deducir formalmente
        }
      }
    } else if (payload.pagos_split) {
      for (const p of payload.pagos_split) {
        if (p.metodo === 'gift_card' && p.gift_card_codigo) {
          try {
            await giftCardsService.consumirSaldo(p.gift_card_codigo, p.monto, `Pago Venta ${numero}`)
          } catch {
            // ContinÃºa con los demÃ¡s mÃ©todos
          }
        }
      }
    }

    // 3. Descontar stock directo de productos
    for (const item of payload.items) {
      if (item.tipo === 'producto' && item.referencia_id) {
        const productos = LocalStorageAdapter.getCollection<Producto>(COLLECTION_PRODUCTOS, [])
        const prod = productos.find((p) => p.id === item.referencia_id)
        if (prod) {
          const anterior = prod.stock_actual
          const nuevoStock = Math.max(0, anterior - item.cantidad)
          LocalStorageAdapter.update<Producto>(COLLECTION_PRODUCTOS, prod.id, {
            stock_actual: nuevoStock,
          })

          const mov: MovimientoStock = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            producto_id: prod.id,
            producto: prod,
            tipo: 'SALE',
            cantidad: item.cantidad,
            cantidad_anterior: anterior,
            cantidad_nueva: nuevoStock,
            motivo: `Venta POS: ${nuevaVenta.numero}`,
            referencia: nuevaVenta.numero,
            usuario: 'POS Sagitta',
            created_at: now,
          }
          LocalStorageAdapter.insert<MovimientoStock>(COLLECTION_MOVIMIENTOS_STOCK, mov)
        }
      }
    }

    // 4. Consumo por Receta / BOM para servicios
    let insumosConsumidosTotal = 0
    for (const item of payload.items) {
      if (item.tipo === 'servicio' && item.referencia_id) {
        const resInsumos = await recetasService.consumirInsumosPorServicio(
          item.referencia_id,
          nuevaVenta.numero,
          item.cantidad
        )
        if (resInsumos.data) {
          insumosConsumidosTotal += resInsumos.data.insumosConsumidos.length
        }
      }
    }

    // 5. Actualizar Caja
    const sesiones = LocalStorageAdapter.getCollection<SesionCaja>(COLLECTION_SESION_CAJA, [])
    const sesionAbierta = sesiones.find((s) => s.estado === 'abierta')
    let cajaActualizada = false

    if (sesionAbierta) {
      sesionAbierta.total_ventas = (sesionAbierta.total_ventas || 0) + payload.total

      // Desglose por mÃ©todo
      let montoEfectivo = 0
      let montoTarjeta = 0
      let montoTransf = 0
      let montoOtros = 0

      if (payload.pagos_split && payload.pagos_split.length > 0) {
        for (const p of payload.pagos_split) {
          if (p.metodo === 'efectivo') montoEfectivo += p.monto
          else if (p.metodo === 'tarjeta') montoTarjeta += p.monto
          else if (p.metodo === 'transferencia') montoTransf += p.monto
          else montoOtros += p.monto
        }
      } else {
        if (payload.metodo_pago === 'efectivo') montoEfectivo = payload.total
        else if (payload.metodo_pago === 'tarjeta') montoTarjeta = payload.total
        else if (payload.metodo_pago === 'transferencia') montoTransf = payload.total
        else montoOtros = payload.total
      }

      sesionAbierta.total_efectivo = (sesionAbierta.total_efectivo || 0) + montoEfectivo
      sesionAbierta.total_tarjeta = (sesionAbierta.total_tarjeta || 0) + montoTarjeta
      sesionAbierta.total_transferencia = (sesionAbierta.total_transferencia || 0) + montoTransf
      sesionAbierta.total_otros = (sesionAbierta.total_otros || 0) + montoOtros

      // Registrar movimiento de ingreso
      const movVenta: MovimientoCaja = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        tipo: 'ingreso',
        monto: payload.total,
        metodo_pago: payload.metodo_pago,
        venta_id: nuevaVenta.id,
        descripcion: `Venta ${nuevaVenta.numero} (${payload.items.length} items)`,
        usuario: 'Cajero',
        created_at: now,
      }
      sesionAbierta.movimientos.push(movVenta)

      // Registrar propina si existe
      if (payload.propina && payload.propina > 0) {
        sesionAbierta.total_propinas = (sesionAbierta.total_propinas || 0) + payload.propina
        const movPropina: MovimientoCaja = {
          id: Date.now() + Math.floor(Math.random() * 1000) + 1,
          tipo: 'propina',
          monto: payload.propina,
          empleado_id: payload.propina_profesional_id,
          descripcion: `Propina en Venta ${nuevaVenta.numero}`,
          usuario: 'Cajero',
          created_at: now,
        }
        sesionAbierta.movimientos.push(movPropina)
      }

      LocalStorageAdapter.setCollection(COLLECTION_SESION_CAJA, sesiones)
      cajaActualizada = true
    }

    // 6. Generar Comisiones
    const resComisiones = await comisionesService.registrarComisionesPorVenta(nuevaVenta)
    const comisionesGeneradasTotal = resComisiones.data ? resComisiones.data.length : 0

    // 7. Actualizar estado de cita si procede
    if (payload.cita_id) {
      try {
        const citas = LocalStorageAdapter.getCollection<Record<string, unknown>>(COLLECTION_CITAS, [])
        const cita = citas.find((c) => c.id === payload.cita_id)
        if (cita) {
          cita.estado = 'completada'
          cita.pago_estado = 'pagado'
          cita.venta_id = nuevaVenta.id
          LocalStorageAdapter.setCollection(COLLECTION_CITAS, citas)
        }
      } catch {
        // Fallback silencioso
      }
    }

    return {
      success: true,
      message: `Venta ${nuevaVenta.numero} procesada con Ã©xito`,
      data: {
        venta: ventaCreada,
        insumosConsumidosTotal,
        comisionesGeneradasTotal,
        cajaActualizada,
      },
    }
  },

  /**
   * Ejecuta la devoluciÃ³n de una venta:
   * 1. Cambia estado a REFUNDED.
   * 2. Reintegra stock de productos ('RETURN').
   * 3. Registra egreso por devoluciÃ³n en caja abierta.
   * 4. Cancela comisiones pendientes.
   */
  procesarDevolucion: async (
    ventaId: number,
    motivo: string,
    montoReembolso?: number
  ): Promise<ApiResponse<Venta>> => {
    const listVentas = LocalStorageAdapter.getCollection<Venta>(COLLECTION_VENTAS, [])
    const venta = listVentas.find((v) => v.id === ventaId)

    if (!venta) throw new Error('Venta no encontrada')
    if (venta.estado === 'REFUNDED') throw new Error('Esta venta ya fue reembolsada')

    const now = new Date().toISOString()
    const montoADevolver = montoReembolso !== undefined ? montoReembolso : venta.total

    venta.estado = 'REFUNDED'
    venta.devuelto_monto = montoADevolver
    venta.motivo_devolucion = motivo

    // 1. Reintegrar stock de productos
    for (const item of venta.items) {
      if (item.tipo === 'producto' && item.referencia_id) {
        const productos = LocalStorageAdapter.getCollection<Producto>(COLLECTION_PRODUCTOS, [])
        const prod = productos.find((p) => p.id === item.referencia_id)
        if (prod) {
          const anterior = prod.stock_actual
          const nuevoStock = anterior + item.cantidad

          LocalStorageAdapter.update<Producto>(COLLECTION_PRODUCTOS, prod.id, {
            stock_actual: nuevoStock,
          })

          const mov: MovimientoStock = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            producto_id: prod.id,
            producto: prod,
            tipo: 'RETURN',
            cantidad: item.cantidad,
            cantidad_anterior: anterior,
            cantidad_nueva: nuevoStock,
            motivo: `DevoluciÃ³n Venta ${venta.numero}: ${motivo}`,
            referencia: venta.numero,
            usuario: 'Auditor Caja',
            created_at: now,
          }
          LocalStorageAdapter.insert<MovimientoStock>(COLLECTION_MOVIMIENTOS_STOCK, mov)
        }
      }
    }

    // 2. Registrar egreso en sesiÃ³n de caja
    const sesiones = LocalStorageAdapter.getCollection<SesionCaja>(COLLECTION_SESION_CAJA, [])
    const sesionAbierta = sesiones.find((s) => s.estado === 'abierta')
    if (sesionAbierta) {
      sesionAbierta.total_devoluciones = (sesionAbierta.total_devoluciones || 0) + montoADevolver
      sesionAbierta.total_egresos = (sesionAbierta.total_egresos || 0) + montoADevolver

      const movDevolucion: MovimientoCaja = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        tipo: 'devolucion',
        monto: montoADevolver,
        venta_id: venta.id,
        descripcion: `Reembolso Venta ${venta.numero}: ${motivo}`,
        usuario: 'Auditor Caja',
        created_at: now,
      }
      sesionAbierta.movimientos.push(movDevolucion)
      LocalStorageAdapter.setCollection(COLLECTION_SESION_CAJA, sesiones)
    }

    // 3. Cancelar comisiones pendientes de la venta
    await comisionesService.cancelarComisionesPorVenta(venta.id)

    // Guardar cambios en venta
    LocalStorageAdapter.setCollection(COLLECTION_VENTAS, listVentas)

    return {
      success: true,
      message: `Venta ${venta.numero} reembolsada exitosamente`,
      data: venta,
    }
  },
}
