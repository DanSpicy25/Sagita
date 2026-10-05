/**
 * Utilidades para Impresión Térmica ESC/POS y Web Bluetooth
 * Sagitta Enterprise POS & Retail Engine
 * Compatible con impresoras de tickets térmicos de 58mm y 80mm (Bluetooth / USB / Red)
 */

import { Venta } from '@/types'

export interface ConfiguracionTicket {
  anchoMm: 58 | 80
  nombreEmpresa: string
  lema?: string
  direccion?: string
  telefono?: string
  rutOIdentificador?: string
  piePagina?: string
  mostrarLogo?: boolean
  abrirCajonDinero?: boolean
}

export const escposHelper = {
  /**
   * Genera el pulso eléctrico estándar ESC/POS para abrir cajón portamonedas (ESC p 0 25 250)
   */
  generarPulsoCajon: (): Uint8Array => new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]),

  /**
   * Genera el buffer de bytes ESC/POS estándar para un ticket de venta al cliente
   */
  generarBytesTicketVenta: (venta: Venta, config: ConfiguracionTicket): Uint8Array => {
    const charsPorLinea = config.anchoMm === 58 ? 32 : 48
    const separador = '-'.repeat(charsPorLinea) + '\n'
    const encoder = new TextEncoder()
    const chunks: number[] = []

    const pushBytes = (...bytes: number[]) => chunks.push(...bytes)
    const pushText = (text: string) => {
      const encoded = encoder.encode(text)
      encoded.forEach((b) => chunks.push(b))
    }

    // Inicializar impresora
    pushBytes(0x1b, 0x40)

    // Abrir cajón si está configurado (ESC p 0 25 250)
    if (config.abrirCajonDinero) {
      pushBytes(0x1b, 0x70, 0x00, 0x19, 0xfa)
    }

    // Encabezado Centrado
    pushBytes(0x1b, 0x61, 0x01) // Centrar

    // Título en negrita y doble altura
    pushBytes(0x1b, 0x45, 0x01) // Negrita ON
    pushBytes(0x1d, 0x21, 0x11) // Doble alto/ancho
    pushText(`${config.nombreEmpresa}\n`)
    pushBytes(0x1d, 0x21, 0x00) // Tamaño normal
    pushBytes(0x1b, 0x45, 0x00) // Negrita OFF

    if (config.lema) pushText(`${config.lema}\n`)
    if (config.rutOIdentificador) pushText(`ID/Fiscal: ${config.rutOIdentificador}\n`)
    if (config.direccion) pushText(`${config.direccion}\n`)
    if (config.telefono) pushText(`Tel: ${config.telefono}\n`)

    pushText(separador)

    // Info de la Venta (Alineado izquierda)
    pushBytes(0x1b, 0x61, 0x00) // Izquierda
    pushText(`Folio: ${venta.numero}\n`)
    pushText(`Fecha: ${new Date(venta.created_at).toLocaleString()}\n`)
    if (venta.cliente?.nombre) {
      pushText(`Cliente: ${venta.cliente.nombre}\n`)
    }
    pushText(`Metodo: ${venta.metodo_pago.toUpperCase()}\n`)
    pushText(separador)

    // Líneas de Items (Nombre y precio formateado en dos extremos)
    for (const item of venta.items) {
      const cantYNombre = `${item.cantidad}x ${item.nombre}`
      const totalItem = `$${item.total.toLocaleString()}`
      const espacios = Math.max(1, charsPorLinea - cantYNombre.length - totalItem.length)
      pushText(`${cantYNombre}${' '.repeat(espacios)}${totalItem}\n`)
    }

    pushText(separador)

    // Totales (Alineado a la derecha)
    pushBytes(0x1b, 0x61, 0x02) // Derecha
    pushText(`Subtotal: $${venta.subtotal.toLocaleString()}\n`)
    if (venta.descuento_global > 0) {
      pushText(`Descuento: -$${venta.descuento_global.toLocaleString()}\n`)
    }
    if (venta.propina && venta.propina > 0) {
      pushText(`Propina: +$${venta.propina.toLocaleString()}\n`)
    }

    // Total en negrita grande
    pushBytes(0x1b, 0x45, 0x01) // Negrita ON
    pushBytes(0x1d, 0x21, 0x01) // Altura doble
    pushText(`TOTAL: $${venta.total.toLocaleString()}\n`)
    pushBytes(0x1d, 0x21, 0x00) // Normal
    pushBytes(0x1b, 0x45, 0x00) // Negrita OFF

    // Pie de Ticket Centrado
    pushBytes(0x1b, 0x61, 0x01) // Centrar
    pushText(separador)
    pushText(`${config.piePagina || '¡Gracias por su compra!'}\n`)
    pushText(`Sagitta Enterprise POS\n\n\n`)

    // Corte parcial de papel (GS V 66 0)
    pushBytes(0x1d, 0x56, 0x42, 0x00)

    return new Uint8Array(chunks)
  },

  /**
   * Genera el buffer de bytes ESC/POS para una comanda interna de cocina/taller
   */
  generarBytesComandaCocina: (venta: Venta, config: ConfiguracionTicket): Uint8Array => {
    const charsPorLinea = config.anchoMm === 58 ? 32 : 48
    const separador = '='.repeat(charsPorLinea) + '\n'
    const encoder = new TextEncoder()
    const chunks: number[] = []

    const pushBytes = (...bytes: number[]) => chunks.push(...bytes)
    const pushText = (text: string) => {
      const encoded = encoder.encode(text)
      encoded.forEach((b) => chunks.push(b))
    }

    // Inicializar impresora
    pushBytes(0x1b, 0x40)

    // Encabezado Grande: ORDEN DE PREPARACIÓN
    pushBytes(0x1b, 0x61, 0x01) // Centrar
    pushBytes(0x1b, 0x45, 0x01) // Negrita
    pushBytes(0x1d, 0x21, 0x11) // Tamaño doble
    pushText(`*** COMANDA ***\n`)
    pushText(`ORDEN #${venta.numero.split('-').pop() || venta.id}\n`)
    pushBytes(0x1d, 0x21, 0x00)
    pushBytes(0x1b, 0x45, 0x00)

    pushText(`Hora: ${new Date().toLocaleTimeString()}\n`)
    if (venta.cliente?.nombre) pushText(`Para: ${venta.cliente.nombre}\n`)
    pushText(separador)

    // Items en letra grande para fácil lectura del cocinero/técnico
    pushBytes(0x1b, 0x61, 0x00) // Izquierda
    pushBytes(0x1b, 0x45, 0x01) // Negrita
    for (const item of venta.items) {
      pushText(`[ ] ${item.cantidad}x ${item.nombre}\n`)
      if (item.tipo === 'servicio') {
        pushText(`    -> Servicio Técnico / Atencion\n`)
      }
    }
    pushBytes(0x1b, 0x45, 0x00)

    if (venta.notas) {
      pushText(`\nNOTAS:\n${venta.notas}\n`)
    }

    pushText(separador)
    pushText(`\n\n\n`)

    // Corte parcial
    pushBytes(0x1d, 0x56, 0x42, 0x00)

    return new Uint8Array(chunks)
  },

  /**
   * Envía bytes directamente a una impresora térmica emparejada por Web Bluetooth
   */
  imprimirViaBluetooth: async (bytes: Uint8Array): Promise<boolean> => {
    const nav = navigator as unknown as { bluetooth?: { requestDevice: (opt: unknown) => Promise<unknown> } }
    if (!nav.bluetooth) {
      throw new Error(
        'Web Bluetooth API no está soportada en este navegador. Utiliza Google Chrome en Android o una laptop para impresión Bluetooth directa.'
      )
    }

    try {
      // Solicitar dispositivo Bluetooth POS
      const device = (await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Servicio estándar térmico
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        ],
      })) as {
        gatt?: {
          connect: () => Promise<{
            getPrimaryServices: () => Promise<Array<{
              getCharacteristics: () => Promise<Array<{
                properties: { write: boolean; writeWithoutResponse: boolean }
                writeValue: (data: Uint8Array) => Promise<void>
              }>>
            }>>
          }>
        }
      }

      if (!device.gatt) throw new Error('No se pudo establecer conexión GATT con la impresora')

      const server = await device.gatt.connect()
      const services = await server.getPrimaryServices()

      let characteristicEncontrada: {
        writeValue: (data: Uint8Array) => Promise<void>
      } | null = null

      for (const service of services) {
        const characteristics = await service.getCharacteristics()
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            characteristicEncontrada = char
            break
          }
        }
        if (characteristicEncontrada) break
      }

      if (!characteristicEncontrada) {
        throw new Error('No se encontró una característica de escritura en la impresora térmica')
      }

      // Enviar datos en paquetes de 512 bytes para evitar saturar el buffer Bluetooth
      const chunkSize = 512
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize)
        await characteristicEncontrada.writeValue(chunk)
      }

      return true
    } catch (err) {
      console.error('[ESC/POS Bluetooth Error]:', err)
      throw err
    }
  },
}
