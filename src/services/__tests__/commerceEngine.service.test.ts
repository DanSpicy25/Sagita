import { describe, it, expect, beforeEach } from 'vitest'
import { commerceEngine } from '../commerceEngine.service'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { Producto, SesionCaja, MovimientoStock, RecetaServicio, ReglaComision, ComisionVenta } from '@/types'

// Emulador en memoria para LocalStorage independiente de browser
class MemoryStorage {
  private store: Record<string, string> = {}

  getItem(key: string): string | null {
    return this.store[key] ?? null
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }
}

describe('Commerce Engine — Auditoría de Operaciones Comerciales e Inventario', () => {
  beforeEach(() => {
    const memory = new MemoryStorage()
    // Asignar al globalThis para que LocalStorageAdapter interactúe con estado limpio
    Object.defineProperty(globalThis, 'localStorage', {
      value: memory,
      writable: true,
      configurable: true,
    })
  })

  describe('1. Descuento de stock en venta de productos (SALE)', () => {
    it('reduce las existencias del producto y genera el movimiento de auditoría correspondiente', async () => {
      // Configurar producto inicial
      const productoInicial: Producto = {
        id: 101,
        nombre: 'Shampoo Profesional 500ml',
        sku: 'SHAMP-001',
        precio_venta: 25.0,
        precio_costo: 12.0,
        stock_actual: 20,
        stock_minimo: 5,
        categoria: 'Cuidado Capilar',
        unidad: 'unidad',
        activo: true,
        created_at: '2026-01-01T00:00:00.000Z',
      }
      LocalStorageAdapter.setCollection('productos', [productoInicial])

      // Abrir sesión de caja
      const sesionCaja: SesionCaja = {
        id: 1,
        apertura_at: new Date().toISOString(),
        monto_inicial: 100,
        total_ventas: 0,
        total_ingresos: 0,
        total_efectivo: 0,
        total_tarjeta: 0,
        total_transferencia: 0,
        total_otros: 0,
        total_propinas: 0,
        total_egresos: 0,
        total_devoluciones: 0,
        estado: 'abierta',
        usuario: 'Cajero Principal',
        movimientos: [],
      }
      LocalStorageAdapter.setCollection('caja_sesion', [sesionCaja])

      // Procesar venta de 4 unidades
      const res = await commerceEngine.procesarVenta({
        items: [
          {
            id: 'item-1',
            tipo: 'producto',
            referencia_id: 101,
            nombre: 'Shampoo Profesional 500ml',
            cantidad: 4,
            precio_unitario: 25.0,
            descuento_item: 0,
            total: 100.0,
          },
        ],
        subtotal: 100.0,
        descuento_global: 0,
        impuesto: 0,
        total: 100.0,
        metodo_pago: 'efectivo',
      })

      expect(res.success).toBe(true)
      expect(res.data?.venta.estado).toBe('PAID')

      // Verificar stock actualizado: 20 - 4 = 16
      const productos = LocalStorageAdapter.getCollection<Producto>('productos')
      const prod = productos.find((p) => p.id === 101)
      expect(prod).toBeDefined()
      expect(prod?.stock_actual).toBe(16)

      // Verificar registro de auditoría de movimientos
      const movimientos = LocalStorageAdapter.getCollection<MovimientoStock>('movimientos_stock')
      const mov = movimientos.find((m) => m.producto_id === 101 && m.tipo === 'SALE')
      expect(mov).toBeDefined()
      expect(mov?.cantidad).toBe(4)
      expect(mov?.cantidad_anterior).toBe(20)
      expect(mov?.cantidad_nueva).toBe(16)
    })

    it('no permite stock negativo si la venta supera la existencia disponible', async () => {
      const productoEscaso: Producto = {
        id: 102,
        nombre: 'Cera Fijadora Mate',
        sku: 'CERA-002',
        precio_venta: 15.0,
        precio_costo: 7.0,
        stock_actual: 3,
        stock_minimo: 2,
        categoria: 'Styling',
        unidad: 'unidad',
        activo: true,
        created_at: '2026-01-01T00:00:00.000Z',
      }
      LocalStorageAdapter.setCollection('productos', [productoEscaso])

      // Vender 5 unidades (más de las 3 disponibles)
      await commerceEngine.procesarVenta({
        items: [
          {
            id: 'item-2',
            tipo: 'producto',
            referencia_id: 102,
            nombre: 'Cera Fijadora Mate',
            cantidad: 5,
            precio_unitario: 15.0,
            descuento_item: 0,
            total: 75.0,
          },
        ],
        subtotal: 75.0,
        descuento_global: 0,
        impuesto: 0,
        total: 75.0,
        metodo_pago: 'tarjeta',
      })

      const productos = LocalStorageAdapter.getCollection<Producto>('productos')
      const prod = productos.find((p) => p.id === 102)
      // Debe quedar en 0 y no en número negativo
      expect(prod?.stock_actual).toBe(0)
    })
  })

  describe('2. Consumo de insumos por Receta / BOM técnica (SERVICE_CONSUMPTION)', () => {
    it('descuenta automáticamente las materias primas vinculadas al servicio vendido', async () => {
      // Insumo en inventario
      const insumoAceite: Producto = {
        id: 501,
        nombre: 'Aceite de Eucalipto Puro',
        sku: 'INS-EUC-501',
        precio_venta: 0,
        precio_costo: 5.0,
        stock_actual: 50,
        stock_minimo: 10,
        categoria: 'Insumos',
        unidad: 'dosis',
        activo: true,
        created_at: '2026-01-01T00:00:00.000Z',
      }
      LocalStorageAdapter.setCollection('productos', [insumoAceite])

      // Receta técnica para Servicio ID 10
      const receta: RecetaServicio = {
        servicio_id: 10,
        servicio_nombre: 'Masaje Descontracturante',
        activo: true,
        insumos: [
          {
            id: 'b-1',
            producto_id: 501,
            producto_nombre: 'Aceite de Eucalipto Puro',
            cantidad: 3, // 3 dosis por sesión
            unidad: 'dosis',
            costo_estimado: 1.5,
          },
        ],
      }
      LocalStorageAdapter.setCollection('recetas_servicio', [receta])

      // Venta de 2 servicios de Masaje Descontracturante (consumo: 2 * 3 = 6 dosis)
      const res = await commerceEngine.procesarVenta({
        items: [
          {
            id: 'item-serv-1',
            tipo: 'servicio',
            referencia_id: 10,
            nombre: 'Masaje Descontracturante',
            cantidad: 2,
            precio_unitario: 60.0,
            descuento_item: 0,
            total: 120.0,
          },
        ],
        subtotal: 120.0,
        descuento_global: 0,
        impuesto: 0,
        total: 120.0,
        metodo_pago: 'transferencia',
      })

      expect(res.success).toBe(true)
      expect(res.data?.insumosConsumidosTotal).toBe(1)

      // Stock de insumo debe haber bajado de 50 a 44
      const productos = LocalStorageAdapter.getCollection<Producto>('productos')
      const insumo = productos.find((p) => p.id === 501)
      expect(insumo?.stock_actual).toBe(44)

      // Verificar trazabilidad de movimiento de consumo
      const movimientos = LocalStorageAdapter.getCollection<MovimientoStock>('movimientos_stock')
      const mov = movimientos.find((m) => m.producto_id === 501 && m.tipo === 'SERVICE_CONSUMPTION')
      expect(mov).toBeDefined()
      expect(mov?.cantidad).toBe(6)
      expect(mov?.cantidad_anterior).toBe(50)
      expect(mov?.cantidad_nueva).toBe(44)
    })
  })

  describe('3. Imputación de comisiones profesionales', () => {
    it('liquida la comisión proporcional configurada según regla de profesional', async () => {
      // Regla: 40% para Dr. Alejandro (Empleado 5)
      const reglas: ReglaComision[] = [
        {
          id: 10,
          nombre: 'Comisión Dr. Alejandro',
          tipo_calculo: 'porcentaje',
          valor: 40,
          aplicar_a: 'profesional',
          referencia_id: 5,
          activo: true,
        },
      ]
      LocalStorageAdapter.setCollection('reglas_comision', reglas)
      LocalStorageAdapter.setCollection('comisiones_ventas', [])

      const res = await commerceEngine.procesarVenta({
        items: [
          {
            id: 'item-dr-1',
            tipo: 'servicio',
            referencia_id: 20,
            nombre: 'Consulta Dermatológica Especializada',
            cantidad: 1,
            precio_unitario: 150.0,
            descuento_item: 0,
            total: 150.0,
            profesional_id: 5,
            profesional_nombre: 'Dr. Alejandro Peña',
          },
        ],
        subtotal: 150.0,
        descuento_global: 0,
        impuesto: 0,
        total: 150.0,
        metodo_pago: 'tarjeta',
      })

      expect(res.success).toBe(true)
      expect(res.data?.comisionesGeneradasTotal).toBe(1)

      const comisiones = LocalStorageAdapter.getCollection<ComisionVenta>('comisiones_ventas')
      expect(comisiones.length).toBe(1)
      const com = comisiones[0]
      expect(com.profesional_id).toBe(5)
      expect(com.base_calculo).toBe(150.0)
      expect(com.porcentaje).toBe(40)
      // 40% de 150 = 60
      expect(com.monto_comision).toBe(60.0)
      expect(com.estado).toBe('pendiente')
    })
  })

  describe('4. Flujo de Caja y Desglose de Métodos Split', () => {
    it('actualiza los saldos discriminados de la sesión de caja abierta', async () => {
      const sesion: SesionCaja = {
        id: 2,
        apertura_at: new Date().toISOString(),
        monto_inicial: 200,
        total_ventas: 0,
        total_ingresos: 0,
        total_efectivo: 0,
        total_tarjeta: 0,
        total_transferencia: 0,
        total_otros: 0,
        total_propinas: 0,
        total_egresos: 0,
        total_devoluciones: 0,
        estado: 'abierta',
        usuario: 'Cajero',
        movimientos: [],
      }
      LocalStorageAdapter.setCollection('caja_sesion', [sesion])

      // Venta de $100 dividida en $40 efectivo + $60 tarjeta, con $15 propina
      await commerceEngine.procesarVenta({
        items: [
          {
            id: 'it-1',
            tipo: 'servicio',
            referencia_id: 99,
            nombre: 'Servicio Spa Completo',
            cantidad: 1,
            precio_unitario: 100,
            descuento_item: 0,
            total: 100,
          },
        ],
        subtotal: 100,
        descuento_global: 0,
        impuesto: 0,
        total: 100,
        metodo_pago: 'mixto',
        pagos_split: [
          { metodo: 'efectivo', monto: 40 },
          { metodo: 'tarjeta', monto: 60 },
        ],
        propina: 15,
        propina_profesional_id: 2,
      })

      const sesiones = LocalStorageAdapter.getCollection<SesionCaja>('caja_sesion')
      const caja = sesiones.find((s) => s.id === 2)
      expect(caja).toBeDefined()
      expect(caja?.total_ventas).toBe(100)
      expect(caja?.total_efectivo).toBe(40)
      expect(caja?.total_tarjeta).toBe(60)
      expect(caja?.total_propinas).toBe(15)
      expect(caja?.movimientos.length).toBe(2) // 1 ingreso venta + 1 propina
    })
  })

  describe('5. Devolución de Venta (REFUNDED) y Reversión Integral', () => {
    it('restaura el stock de productos, cancela comisiones y anota egreso en caja', async () => {
      // 1. Setup producto
      const producto: Producto = {
        id: 301,
        nombre: 'Perfume Esencia Rosa',
        sku: 'PERF-01',
        precio_venta: 80,
        precio_costo: 35,
        stock_actual: 10,
        stock_minimo: 2,
        categoria: 'Perfumería',
        unidad: 'unidad',
        activo: true,
        created_at: '2026-01-01T00:00:00.000Z',
      }
      LocalStorageAdapter.setCollection('productos', [producto])

      // 2. Setup caja
      const sesion: SesionCaja = {
        id: 3,
        apertura_at: new Date().toISOString(),
        monto_inicial: 500,
        total_ventas: 0,
        total_ingresos: 0,
        total_efectivo: 0,
        total_tarjeta: 0,
        total_transferencia: 0,
        total_otros: 0,
        total_propinas: 0,
        total_egresos: 0,
        total_devoluciones: 0,
        estado: 'abierta',
        usuario: 'Cajero',
        movimientos: [],
      }
      LocalStorageAdapter.setCollection('caja_sesion', [sesion])

      // 3. Regla de comision general 10%
      const reglas: ReglaComision[] = [
        {
          id: 1,
          nombre: 'Comisión General',
          tipo_calculo: 'porcentaje',
          valor: 10,
          aplicar_a: 'general',
          activo: true,
        },
      ]
      LocalStorageAdapter.setCollection('reglas_comision', reglas)
      LocalStorageAdapter.setCollection('comisiones_ventas', [])

      // 4. Realizar venta de 2 perfumes ($160)
      const resVenta = await commerceEngine.procesarVenta({
        items: [
          {
            id: 'p-item',
            tipo: 'producto',
            referencia_id: 301,
            nombre: 'Perfume Esencia Rosa',
            cantidad: 2,
            precio_unitario: 80,
            descuento_item: 0,
            total: 160,
            profesional_id: 7,
            profesional_nombre: 'Vendedor Sandra',
          },
        ],
        subtotal: 160,
        descuento_global: 0,
        impuesto: 0,
        total: 160,
        metodo_pago: 'efectivo',
      })

      const ventaId = resVenta.data!.venta.id

      // Comprobar que el stock bajó a 8
      let prod = LocalStorageAdapter.getCollection<Producto>('productos').find((p) => p.id === 301)
      expect(prod?.stock_actual).toBe(8)

      // Comprobar que hay una comisión pendiente de $16
      let comisiones = LocalStorageAdapter.getCollection<ComisionVenta>('comisiones_ventas')
      expect(comisiones[0].estado).toBe('pendiente')
      expect(comisiones[0].monto_comision).toBe(16)

      // 5. Procesar Devolución Total
      const resDevolucion = await commerceEngine.procesarDevolucion(
        ventaId,
        'Frasco con defecto en atomizador',
        160
      )

      expect(resDevolucion.success).toBe(true)
      expect(resDevolucion.data?.estado).toBe('REFUNDED')
      expect(resDevolucion.data?.devuelto_monto).toBe(160)

      // Verificar que el stock se reintegró a 10
      prod = LocalStorageAdapter.getCollection<Producto>('productos').find((p) => p.id === 301)
      expect(prod?.stock_actual).toBe(10)

      // Verificar movimiento de stock RETURN
      const movs = LocalStorageAdapter.getCollection<MovimientoStock>('movimientos_stock')
      const returnMov = movs.find((m) => m.producto_id === 301 && m.tipo === 'RETURN')
      expect(returnMov).toBeDefined()
      expect(returnMov?.cantidad).toBe(2)
      expect(returnMov?.cantidad_nueva).toBe(10)

      // Verificar que la comisión pasó a cancelada
      comisiones = LocalStorageAdapter.getCollection<ComisionVenta>('comisiones_ventas')
      const comCancelada = comisiones.find((c) => c.venta_id === ventaId)
      expect(comCancelada?.estado).toBe('cancelada')

      // Verificar egreso en caja
      const caja = LocalStorageAdapter.getCollection<SesionCaja>('caja_sesion').find((s) => s.id === 3)
      expect(caja?.total_devoluciones).toBe(160)
      expect(caja?.total_egresos).toBe(160)
      const movDevolucion = caja?.movimientos.find((m) => m.tipo === 'devolucion')
      expect(movDevolucion).toBeDefined()
      expect(movDevolucion?.monto).toBe(160)
    })
  })
})

