import { ContextoEventoAutomatizacion } from '@/types'

export interface ItemVariableCatalogo {
  variable: string
  token: string
  descripcion: string
  categoria: 'Cliente' | 'Cita / Reserva' | 'Servicio' | 'Profesional' | 'Negocio' | 'Ventas / Stock'
  ejemplo: string
}

export const CATALOGO_VARIABLES: ItemVariableCatalogo[] = [
  // Cliente
  {
    variable: '{{client.name}}',
    token: '{{client.name}}',
    descripcion: 'Nombre completo del cliente',
    categoria: 'Cliente',
    ejemplo: 'María González',
  },
  {
    variable: '{{client.first_name}}',
    token: '{{client.first_name}}',
    descripcion: 'Primer nombre del cliente',
    categoria: 'Cliente',
    ejemplo: 'María',
  },
  {
    variable: '{{client.email}}',
    token: '{{client.email}}',
    descripcion: 'Correo electrónico del cliente',
    categoria: 'Cliente',
    ejemplo: 'maria@ejemplo.com',
  },
  {
    variable: '{{client.phone}}',
    token: '{{client.phone}}',
    descripcion: 'Número de teléfono o WhatsApp',
    categoria: 'Cliente',
    ejemplo: '+1 555-0101',
  },

  // Cita / Reserva
  {
    variable: '{{appointment.date}}',
    token: '{{appointment.date}}',
    descripcion: 'Fecha de la cita (formato legible)',
    categoria: 'Cita / Reserva',
    ejemplo: '28 de Septiembre, 2026',
  },
  {
    variable: '{{appointment.time}}',
    token: '{{appointment.time}}',
    descripcion: 'Hora de inicio de la cita',
    categoria: 'Cita / Reserva',
    ejemplo: '10:30 AM',
  },
  {
    variable: '{{appointment.service}}',
    token: '{{appointment.service}}',
    descripcion: 'Nombre del servicio agendado',
    categoria: 'Cita / Reserva',
    ejemplo: 'Corte y Peinado Premium',
  },
  {
    variable: '{{appointment.staff}}',
    token: '{{appointment.staff}}',
    descripcion: 'Nombre del profesional asignado',
    categoria: 'Cita / Reserva',
    ejemplo: 'Carlos Especialista',
  },
  {
    variable: '{{appointment.link}}',
    token: '{{appointment.link}}',
    descripcion: 'Enlace de videollamada o confirmación',
    categoria: 'Cita / Reserva',
    ejemplo: 'https://meet.google.com/sag-itta-meet',
  },
  {
    variable: '{{appointment.notes}}',
    token: '{{appointment.notes}}',
    descripcion: 'Notas o comentarios de la cita',
    categoria: 'Cita / Reserva',
    ejemplo: 'Cliente prefiere tono cenizo',
  },

  // Servicio
  {
    variable: '{{service.name}}',
    token: '{{service.name}}',
    descripcion: 'Nombre del servicio',
    categoria: 'Servicio',
    ejemplo: 'Tratamiento Facial Hidratante',
  },
  {
    variable: '{{service.duration}}',
    token: '{{service.duration}}',
    descripcion: 'Duración en minutos',
    categoria: 'Servicio',
    ejemplo: '60 min',
  },
  {
    variable: '{{service.price}}',
    token: '{{service.price}}',
    descripcion: 'Precio base del servicio',
    categoria: 'Servicio',
    ejemplo: '$45.00',
  },

  // Profesional
  {
    variable: '{{staff.name}}',
    token: '{{staff.name}}',
    descripcion: 'Nombre del profesional o especialista',
    categoria: 'Profesional',
    ejemplo: 'Dra. Valentina Morales',
  },
  {
    variable: '{{staff.email}}',
    token: '{{staff.email}}',
    descripcion: 'Email del profesional',
    categoria: 'Profesional',
    ejemplo: 'valentina@sagitta.com',
  },
  {
    variable: '{{staff.role}}',
    token: '{{staff.role}}',
    descripcion: 'Especialidad o cargo',
    categoria: 'Profesional',
    ejemplo: 'Cosmiatra Especialista',
  },

  // Negocio / Marca Blanca
  {
    variable: '{{business.name}}',
    token: '{{business.name}}',
    descripcion: 'Nombre comercial del negocio / tenant',
    categoria: 'Negocio',
    ejemplo: 'Sagitta Spa & Studio',
  },
  {
    variable: '{{business.phone}}',
    token: '{{business.phone}}',
    descripcion: 'Teléfono de atención al cliente',
    categoria: 'Negocio',
    ejemplo: '+1 555-0900',
  },
  {
    variable: '{{business.address}}',
    token: '{{business.address}}',
    descripcion: 'Dirección física de la sucursal',
    categoria: 'Negocio',
    ejemplo: 'Av. Las Delicias 102, Suite 4',
  },

  // Ventas & Stock
  {
    variable: '{{sale.number}}',
    token: '{{sale.number}}',
    descripcion: 'Número o folio de factura/venta',
    categoria: 'Ventas / Stock',
    ejemplo: 'VTA-2026-042',
  },
  {
    variable: '{{sale.total}}',
    token: '{{sale.total}}',
    descripcion: 'Monto total pagado',
    categoria: 'Ventas / Stock',
    ejemplo: '$120.00',
  },
  {
    variable: '{{product.name}}',
    token: '{{product.name}}',
    descripcion: 'Nombre del producto involucrado',
    categoria: 'Ventas / Stock',
    ejemplo: 'Shampoo Profesional 500ml',
  },
  {
    variable: '{{product.stock}}',
    token: '{{product.stock}}',
    descripcion: 'Stock restante actual del producto',
    categoria: 'Ventas / Stock',
    ejemplo: '2 unidades',
  },
]

/**
 * Normaliza y extrae fecha u hora de un string ISO o formato estándar
 */
function parseFechaLegible(fechaStr?: string): string {
  if (!fechaStr) return ''
  try {
    const d = new Date(fechaStr.replace(' ', 'T'))
    if (isNaN(d.getTime())) return fechaStr
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return fechaStr
  }
}

function parseHoraLegible(fechaStr?: string, horaFallback?: string): string {
  if (horaFallback) return horaFallback
  if (!fechaStr) return ''
  try {
    if (fechaStr.includes('T')) {
      return fechaStr.split('T')[1].slice(0, 5)
    }
    const partes = fechaStr.split(' ')
    if (partes.length > 1) {
      return partes[1].slice(0, 5)
    }
    return fechaStr
  } catch {
    return fechaStr
  }
}

/**
 * Reemplaza tokens estándar `{{entidad.propiedad}}` y retrocompatibilidad con `{token}`
 */
export function renderizarPlantilla(
  template: string,
  contexto: ContextoEventoAutomatizacion
): string {
  if (!template) return ''

  // Retrocompatibilidad con plantillas viejas {token}
  let texto = template
    .replace(/\{cliente\}/gi, '{{client.name}}')
    .replace(/\{servicio\}/gi, '{{service.name}}')
    .replace(/\{profesional\}/gi, '{{staff.name}}')
    .replace(/\{fecha\}/gi, '{{appointment.date}}')
    .replace(/\{hora\}/gi, '{{appointment.time}}')
    .replace(/\{negocio\}/gi, '{{business.name}}')
    .replace(/\{enlace\}/gi, '{{appointment.link}}')

  // Datos del Cliente
  const cliente = contexto.cliente || contexto.cita?.cliente
  const clientName = cliente?.nombre || 'Estimado(a) Cliente'
  const clientFirstName = clientName.split(' ')[0] || clientName
  const clientEmail = cliente?.email || ''
  const clientPhone = cliente?.telefono || ''

  // Datos de la Cita
  const cita = contexto.cita
  const appDate = parseFechaLegible(cita?.fecha_inicio || cita?.fecha)
  const appTime = parseHoraLegible(cita?.fecha_inicio, cita?.hora)
  const appLink =
    cita?.enlace_videollamada ||
    (cita?.id ? `https://sagitta.app/portal/reservas/${cita.id}` : '')
  const appNotes = cita?.notas || ''

  // Datos del Servicio
  const servicio = contexto.servicio || contexto.cita?.servicio
  const serviceName = servicio?.nombre || 'Servicio Agendado'
  const serviceDuration = servicio?.duracion_base_min || servicio?.duracion_minutos || 60
  const servicePrice = servicio?.precio_base
    ? `$${servicio.precio_base.toFixed(2)}`
    : '$0.00'

  // Datos del Profesional
  const staff = contexto.empleado || contexto.cita?.empleado
  const staffName = staff?.nombre
    ? `${staff.nombre} ${staff.apellido || ''}`.trim()
    : 'Profesional Especialista'
  const staffEmail = staff?.email || ''
  const staffRole = staff?.especialidad || staff?.cargo || staff?.rol || 'Especialista'

  // Datos del Negocio
  const businessName =
    (contexto.metadata?.business_name as string) || 'Sagitta Center'
  const businessPhone =
    (contexto.metadata?.business_phone as string) || '+1 555-0900'
  const businessAddress =
    (contexto.metadata?.business_address as string) ||
    'Av. Principal 102, Sagitta Studio'

  // Datos de Venta & Pagos
  const venta = contexto.venta
  const saleNumber = venta?.numero || (venta?.id ? `VTA-${venta.id}` : 'VTA-000')
  const saleTotal = venta?.total ? `$${venta.total.toFixed(2)}` : '$0.00'
  const saleDiscount =
    venta?.descuento_global || venta?.descuento
      ? `$${(venta.descuento_global || venta.descuento || 0).toFixed(2)}`
      : '$0.00'

  // Datos de Producto / Stock
  const producto = contexto.producto
  const productName = producto?.nombre || 'Producto'
  const productSku = producto?.sku || ''
  const productStock =
    producto?.stock_actual !== undefined
      ? `${producto.stock_actual} ${producto.unidad || 'unidades'}`
      : '0'

  // Mapa de reemplazo
  const tokenMap: Record<string, string> = {
    '{{client.name}}': clientName,
    '{{client.first_name}}': clientFirstName,
    '{{client.email}}': clientEmail,
    '{{client.phone}}': clientPhone,
    '{{appointment.date}}': appDate,
    '{{appointment.time}}': appTime,
    '{{appointment.service}}': serviceName,
    '{{appointment.staff}}': staffName,
    '{{appointment.link}}': appLink,
    '{{appointment.notes}}': appNotes,
    '{{service.name}}': serviceName,
    '{{service.duration}}': `${serviceDuration} min`,
    '{{service.price}}': servicePrice,
    '{{staff.name}}': staffName,
    '{{staff.email}}': staffEmail,
    '{{staff.role}}': staffRole,
    '{{business.name}}': businessName,
    '{{business.phone}}': businessPhone,
    '{{business.address}}': businessAddress,
    '{{sale.number}}': saleNumber,
    '{{sale.total}}': saleTotal,
    '{{sale.discount}}': saleDiscount,
    '{{product.name}}': productName,
    '{{product.sku}}': productSku,
    '{{product.stock}}': productStock,
  }

  for (const [token, val] of Object.entries(tokenMap)) {
    texto = texto.split(token).join(val)
  }

  return texto
}

/**
 * Detecta qué variables {{...}} existen en una cadena de texto
 */
export function extraerVariablesUtilizadas(template: string): string[] {
  if (!template) return []
  const matches = template.match(/\{\{([a-zA-Z0-9_.]+)\}\}/g)
  if (!matches) return []
  return Array.from(new Set(matches))
}

/**
 * Genera un contexto realista de muestra para previsualizaciones de plantillas
 */
export function generarContextoEjemplo(): ContextoEventoAutomatizacion {
  return {
    cliente: {
      id: 999,
      nombre: 'Lucía Mendoza',
      email: 'lucia.mendoza@ejemplo.com',
      telefono: '+1 555-4321',
      total_citas: 5,
      created_at: '2026-01-15T00:00:00Z',
    },
    cita: {
      id: 888,
      cliente_id: 999,
      empleado_id: 1,
      servicio_id: 1,
      fecha_inicio: '2026-10-12 15:30',
      fecha_fin: '2026-10-12 16:30',
      estado: 'confirmada',
      precio_total: 45,
      modalidad: 'presencial',
      enlace_videollamada: 'https://meet.google.com/sag-itta-demo',
      created_at: '2026-09-25T10:00:00Z',
    },
    servicio: {
      id: 1,
      nombre: 'Sesión Terapéutica Facial & Relajante',
      duracion_base_min: 60,
      precio_base: 45,
      buffer_antes_min: 0,
      buffer_despues_min: 15,
      activo: true,
    },
    empleado: {
      id: 1,
      usuario_id: 10,
      nombre: 'Valeria',
      apellido: 'Castro',
      email: 'valeria.castro@sagitta.com',
      telefono: '+1 555-8888',
      especialidad: 'Especialista Facial Senior',
      activo: true,
    },
    venta: {
      id: 777,
      numero: 'VTA-2026-099',
      items: [],
      subtotal: 45,
      descuento_global: 5,
      impuesto: 0,
      total: 40,
      metodo_pago: 'tarjeta',
      estado: 'PAID',
      created_at: new Date().toISOString(),
    },
    producto: {
      id: 101,
      sku: 'PRD-SERUM-01',
      nombre: 'Serum Regenerador Vitamina C',
      categoria: 'Cuidado Facial',
      precio_venta: 32,
      precio_costo: 18,
      stock_actual: 3,
      stock_minimo: 5,
      unidad: 'unidades',
      activo: true,
      created_at: '2026-01-01T00:00:00Z',
    },
    metadata: {
      business_name: 'Sagitta Wellness & Beauty',
      business_phone: '+1 555-9090',
      business_address: 'Av. Las Palmas 500, Local 3',
    },
  }
}

