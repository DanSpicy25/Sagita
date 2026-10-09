import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  ShoppingCart,
  Package,
  BarChart2,
  type LucideIcon,
} from 'lucide-react'

export type DemoModuleId =
  | 'dashboard'
  | 'calendar'
  | 'customers'
  | 'services'
  | 'pos'
  | 'inventory'
  | 'reports'

export type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export interface DemoPresentationInfo {
  id: DemoModuleId
  label: string
  icon: LucideIcon
  tagline: string
  queEs: string
  porQueEsUtil: string
  quePuedoHacer: string[]
  comoSeVeEnMovil: string
  kpisClave: { label: string; valor: string }[]
}

export const DEMO_PRESENTATIONS: Record<DemoModuleId, DemoPresentationInfo> = {
  dashboard: {
    id: 'dashboard',
    label: 'Panel Principal',
    icon: LayoutDashboard,
    tagline: 'Centro de control operativo y financiero en tiempo real',
    queEs:
      'Es la pantalla inicial de bienvenida que sintetiza el pulso diario del negocio: ingresos facturados, citas agendadas, tasa de ocupación de especialistas y alertas urgentes.',
    porQueEsUtil:
      'Evita revisar múltiples reportes para saber cómo va el día. Tanto gerentes como recepcionistas identifican cuellos de botella y oportunidades de venta en menos de 5 segundos.',
    quePuedoHacer: [
      'Visualizar ingresos del día comparados contra la semana anterior.',
      'Revisar citas del día con estados en vivo (en atención, confirmada, pendiente).',
      'Atender alertas prioritarias (stock crítico, citas por confirmar, caja abierta).',
      'Lanzar acciones rápidas de 1 clic (nueva cita, walk-in, cobro rápido).',
    ],
    comoSeVeEnMovil:
      'En smartphones, los KPIs se condensan en carruseles táctiles de deslizamiento horizontal y las alertas prioritarias se ubican al alcance del pulgar con barra de acciones inferior.',
    kpisClave: [
      { label: 'Ingresos Hoy', valor: '$3,480.00' },
      { label: 'Citas Hoy', valor: '24 agendadas' },
      { label: 'Ocupación', valor: '92% salas' },
    ],
  },

  calendar: {
    id: 'calendar',
    label: 'Agenda & Calendario',
    icon: CalendarDays,
    tagline: 'Gestión inteligente de citas por especialista, sala y duración',
    queEs:
      'Un calendario interactivo multi-vista (semanal, diaria y por profesional) diseñado para coordinar simultáneamente personal, cabinas y tiempos de preparación (buffers).',
    porQueEsUtil:
      'Elimina el 100% de los solapamientos de citas, respeta los tiempos de descanso y limpieza entre turnos y reduce las inasistencias con estados visuales inmediatos.',
    quePuedoHacer: [
      'Ver la disponibilidad de cada especialista en columnas paralelas.',
      'Hacer clic en una cita para ver ficha del cliente, servicio y notas clínicas.',
      'Cambiar el estado de la cita (confirmar, iniciar atención, completar o cancelar).',
      'Consultar salas y equipos asignados a cada tratamiento.',
    ],
    comoSeVeEnMovil:
      'En móvil se activa la vista compacta diaria con deslizamiento por día, botones grandes de acceso a WhatsApp del cliente y selector rápido de fecha superior.',
    kpisClave: [
      { label: 'Citas Hoy', valor: '24' },
      { label: 'En Atención', valor: '3 simultáneas' },
      { label: 'Completadas', valor: '14' },
    ],
  },

  customers: {
    id: 'customers',
    label: 'Clientes & CRM 360°',
    icon: Users,
    tagline: 'Expediente integral con historial clínico, compras y fidelización',
    queEs:
      'El directorio de pacientes y clientes con expediente digital completo: consentimientos firmados, fórmulas, alergias, historial de tratamientos pasados y métricas de recurrencia.',
    porQueEsUtil:
      'Ofrece una atención hiper-personalizada. Cuando un cliente regresa, el especialista conoce inmediatamente sus preferencias, alergias y última fecha de visita.',
    quePuedoHacer: [
      'Buscar clientes por nombre, teléfono, etiqueta o historial.',
      'Inspeccionar el expediente 360° (citas pasadas, compras de productos, notas privadas).',
      'Gestionar etiquetas de segmentación (VIP, Frecuente, Alergia a Penicilina, etc.).',
      'Consultar saldo en monedero, membresías activas o paquetes de sesiones.',
    ],
    comoSeVeEnMovil:
      'Diseño tipo tarjeta de contacto nativa con acceso directo a llamada o mensaje de WhatsApp en un solo toque, y visor de notas en hoja deslizable inferior (bottom sheet).',
    kpisClave: [
      { label: 'Total Clientes', valor: '1,420' },
      { label: 'Recurrencia', valor: '78%' },
      { label: 'Ticket Promedio', valor: '$85.00' },
    ],
  },

  services: {
    id: 'services',
    label: 'Servicios & Subservicios',
    icon: Sparkles,
    tagline: 'Catálogo flexible con variantes de duración, precios y recursos',
    queEs:
      'El catálogo comercial donde se estructuran los servicios, sus duraciones escalonadas (subservicios ej. 30m / 60m / 90m), precios dinámicos y personal capacitado.',
    porQueEsUtil:
      'Permite vender el mismo servicio con diferentes duraciones y tarifas sin duplicar registros y asegurando que solo los especialistas certificados puedan realizarlo.',
    quePuedoHacer: [
      'Visualizar rangos de precio automáticos ($45 – $110) según las duraciones creadas.',
      'Explorar subservicios desplegables con su duración y tarifa exacta.',
      'Comprobar especialistas compatibles y cabinas asignadas a cada servicio.',
      'Simular activación o desactivación sin romper el histórico contable.',
    ],
    comoSeVeEnMovil:
      'Tarjetas expandibles con botones táctiles de 44px, selector de variantes por acordeón suave y vista de catálogo público optimizada para reservas por teléfono.',
    kpisClave: [
      { label: 'Servicios Activos', valor: '18' },
      { label: 'Categorías', valor: '5 rubros' },
      { label: 'Con Variantes', valor: '85%' },
    ],
  },

  pos: {
    id: 'pos',
    label: 'Punto de Venta (POS)',
    icon: ShoppingCart,
    tagline: 'Caja táctil ultra-rápida con cobro mixto y emisión de tickets',
    queEs:
      'La terminal de venta mostrador para facturar citas, productos de retail, paquetes y membresías, con soporte para efectivo, tarjetas, transferencias y propinas.',
    porQueEsUtil:
      'Acelera el cobro a menos de 10 segundos por cliente, calcula impuestos automáticamente, descuenta inventario en tiempo real y permite imprimir tickets térmicos ESC/POS.',
    quePuedoHacer: [
      'Agregar servicios o productos al carrito con un solo toque.',
      'Aplicar cupones de descuento o propinas calculadas.',
      'Simular cobro con tarjeta o pago dividido (efectivo + terminal).',
      'Previsualizar el comprobante de venta o ticket de impresión térmica.',
    ],
    comoSeVeEnMovil:
      'Modo mostrador vertical con teclado numérico deslizable, lector de códigos por cámara y confirmación háptica de cobro.',
    kpisClave: [
      { label: 'Ventas de Caja', valor: '$2,140.00' },
      { label: 'Tickets Emitidos', valor: '19' },
      { label: 'Tiempo Promedio', valor: '12 seg' },
    ],
  },

  inventory: {
    id: 'inventory',
    label: 'Control de Inventario',
    icon: Package,
    tagline: 'Stock en tiempo real, alertas de agotamiento y recetas de insumos',
    queEs:
      'El módulo de administración de productos físicos, tanto para venta al por menor (retail) como para insumos consumidos internamente en cabina durante las citas.',
    porQueEsUtil:
      'Evita quedarse sin stock en medio de un procedimiento y detecta discrepancias de inventario antes de que representen pérdidas financieras.',
    quePuedoHacer: [
      'Filtrar productos por nivel de stock (Normal, Bajo, Agotado).',
      'Realizar ajustes rápidos de existencias (+ / -) con justificación.',
      'Simular escaneo de código de barras para reposición inmediata.',
      'Monitorear costos unitarios, margen de ganancia y valor total del almacén.',
    ],
    comoSeVeEnMovil:
      'Lista compacta con barra de búsqueda rápida por voz o cámara, semáforos de stock en color contrastado y botones rápidos de reposición táctil.',
    kpisClave: [
      { label: 'SKUs Registrados', valor: '142' },
      { label: 'En Alerta Crítica', valor: '4' },
      { label: 'Valorización', valor: '$18,450' },
    ],
  },

  reports: {
    id: 'reports',
    label: 'Reportes & Inteligencia',
    icon: BarChart2,
    tagline: 'Métricas de rentabilidad, recurrencia y productividad del equipo',
    queEs:
      'El centro analítico con gráficos interactivos sobre ingresos periódicos, servicios más rentables, métodos de pago preferidos y retención de pacientes.',
    porQueEsUtil:
      'Transforma datos operativos en decisiones estratégicas: qué tratamientos promocionar, qué especialista genera más ingresos y en qué días se concentran las cancelaciones.',
    quePuedoHacer: [
      'Comparar ingresos del mes actual contra el mes anterior.',
      'Analizar la distribución porcentual de citas (completadas vs canceladas vs no-shows).',
      'Identificar los servicios estrella que generan el 80% de la facturación.',
      'Revisar la tasa de retorno de clientes recurrentes.',
    ],
    comoSeVeEnMovil:
      'Gráficos adaptativos vectoriales SVG con tooltips táctiles por pulsación prolongada y tarjetas resumen apiladas verticalmente.',
    kpisClave: [
      { label: 'Crecimiento MoM', valor: '+18.4%' },
      { label: 'Tasa de Asistencia', valor: '94.2%' },
      { label: 'Servicio Top', valor: 'Tratamiento Glow' },
    ],
  },
}

// ── Datos Ficticios Cuidadosamente Diseñados ─────────────────────────────────

export interface DemoEspecialista {
  id: number
  nombre: string
  especialidad: string
  avatar: string
  color: string
}

export const DEMO_ESPECIALISTAS: DemoEspecialista[] = [
  {
    id: 1,
    nombre: 'Dra. Valeria Montes',
    especialidad: 'Medicina Estética & Láser',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    color: '#6366f1',
  },
  {
    id: 2,
    nombre: 'Dr. Carlos Mendoza',
    especialidad: 'Dermatología Clínica',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    color: '#0ea5e9',
  },
  {
    id: 3,
    nombre: 'Lic. Sofía Alarcón',
    especialidad: 'Cosmiatría & Cuidado Facial',
    avatar: 'https://images.unsplash.com/photo-1594824813596-f68444a706be?w=150&auto=format&fit=crop&q=80',
    color: '#ec4899',
  },
  {
    id: 4,
    nombre: 'Lic. Diego Morales',
    especialidad: 'Fisioterapia & Masajes',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    color: '#10b981',
  },
]

export const DEMO_BUSINESS_INFO = {
  nombre: 'Nova Clinic & Wellness',
  vertical: 'Dermatología, Medicina Estética & Spa',
  moneda: 'USD ($)',
  isDemo: true,
}

export interface DemoCliente {
  id: number
  nombre: string
  email: string
  telefono: string
  avatar: string
  etiquetas: string[]
  tags: string[]
  alergias?: string[]
  consentimientoFirmado?: boolean
  ultimaVisita: string
  totalGastado: number
  citasHistorial: number
}

export const DEMO_CLIENTES: DemoCliente[] = [
  {
    id: 101,
    nombre: 'Elena Rostova',
    email: 'elena.rostova@ejemplo.com',
    telefono: '+52 55 4912 3019',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    etiquetas: ['VIP', 'Piel Sensible', 'Plan Glow'],
    tags: ['VIP', 'Piel Sensible', 'Plan Glow'],
    alergias: ['Ácido glicólico en alta concentración', 'Látex'],
    consentimientoFirmado: true,
    ultimaVisita: 'Hace 3 días',
    totalGastado: 890,
    citasHistorial: 8,
  },
  {
    id: 102,
    nombre: 'Mateo Silva',
    email: 'mateo.silva@ejemplo.com',
    telefono: '+52 55 8192 4402',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    etiquetas: ['Frecuente', 'Control Mensual'],
    tags: ['Frecuente', 'Control Mensual'],
    alergias: [],
    consentimientoFirmado: true,
    ultimaVisita: 'Hace 1 semana',
    totalGastado: 450,
    citasHistorial: 4,
  },
  {
    id: 103,
    nombre: 'Camila Vargas',
    email: 'camila.vargas@ejemplo.com',
    telefono: '+52 55 3301 9821',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    etiquetas: ['Nueva Paciente'],
    tags: ['Nueva Paciente'],
    alergias: ['Sulfatos'],
    consentimientoFirmado: true,
    ultimaVisita: 'Ayer',
    totalGastado: 120,
    citasHistorial: 1,
  },
  {
    id: 104,
    nombre: 'Lucas Benítez',
    email: 'lucas.benitez@ejemplo.com',
    telefono: '+52 55 9942 1204',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    etiquetas: ['Fisioterapia Deportiva'],
    tags: ['Fisioterapia Deportiva'],
    alergias: [],
    consentimientoFirmado: true,
    ultimaVisita: 'Hace 5 días',
    totalGastado: 340,
    citasHistorial: 5,
  },
  {
    id: 105,
    nombre: 'Daniela Prieto',
    email: 'daniela.prieto@ejemplo.com',
    telefono: '+52 55 1284 5591',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    etiquetas: ['VIP', 'Membresía Platino'],
    tags: ['VIP', 'Membresía Platino'],
    alergias: ['Fragancias sintéticas'],
    consentimientoFirmado: true,
    ultimaVisita: 'Hoy',
    totalGastado: 1420,
    citasHistorial: 12,
  },
]

export interface DemoServicioDuracion {
  id: number
  duracionMin: number
  minutos: number
  precio: number
  etiqueta: string
}

export interface DemoServicio {
  id: number
  nombre: string
  categoria: string
  precioBase: number
  duracionBase: number
  duraciones: DemoServicioDuracion[]
  color: string
}

export const DEMO_SERVICIOS: DemoServicio[] = [
  {
    id: 201,
    nombre: 'Tratamiento Facial Glow Luminosidad',
    categoria: 'Estética Facial',
    precioBase: 45,
    duracionBase: 30,
    duraciones: [
      { id: 1, duracionMin: 30, minutos: 30, precio: 45, etiqueta: 'Express 30m' },
      { id: 2, duracionMin: 60, minutos: 60, precio: 75, etiqueta: 'Completo con Máscara LED' },
      { id: 3, duracionMin: 90, minutos: 90, precio: 110, etiqueta: 'VIP Spa Signature' },
    ],
    color: '#ec4899',
  },
  {
    id: 202,
    nombre: 'Consulta Dermatológica Especializada',
    categoria: 'Medicina Clínica',
    precioBase: 50,
    duracionBase: 40,
    duraciones: [
      { id: 4, duracionMin: 40, minutos: 40, precio: 50, etiqueta: 'Consulta Inicial' },
      { id: 5, duracionMin: 20, minutos: 20, precio: 35, etiqueta: 'Control & Receta' },
    ],
    color: '#6366f1',
  },
  {
    id: 203,
    nombre: 'Limpieza Profunda con Punta de Diamante',
    categoria: 'Estética Facial',
    precioBase: 60,
    duracionBase: 50,
    duraciones: [
      { id: 8, duracionMin: 50, minutos: 50, precio: 60, etiqueta: 'Sesión Estándar 50m' },
    ],
    color: '#0ea5e9',
  },
  {
    id: 204,
    nombre: 'Masaje Descontracturante & Terapéutico',
    categoria: 'Bienestar & Fisioterapia',
    precioBase: 55,
    duracionBase: 45,
    duraciones: [
      { id: 6, duracionMin: 45, minutos: 45, precio: 55, etiqueta: 'Sesión 45m' },
      { id: 7, duracionMin: 75, minutos: 75, precio: 85, etiqueta: 'Intensivo 75m' },
    ],
    color: '#10b981',
  },
  {
    id: 205,
    nombre: 'Depilación Láser Diodo Zona Facial',
    categoria: 'Tecnología Láser',
    precioBase: 40,
    duracionBase: 25,
    duraciones: [
      { id: 9, duracionMin: 25, minutos: 25, precio: 40, etiqueta: 'Zona Rostro Completo' },
      { id: 10, duracionMin: 15, minutos: 15, precio: 25, etiqueta: 'Zona Bozo / Mentón' },
    ],
    color: '#f59e0b',
  },
]

export interface DemoProducto {
  id: number
  codigo: string
  sku: string
  nombre: string
  categoria: string
  precio: number
  precioVenta: number
  costo: number
  stock: number
  stockMinimo: number
  imagen: string
}

export const DEMO_PRODUCTOS: DemoProducto[] = [
  {
    id: 301,
    codigo: 'PRD-SER-01',
    sku: 'PRD-SER-01',
    nombre: 'Serum Ácido Hialurónico 2% Ultra-Hydra',
    categoria: 'Cosmecéuticos',
    precio: 38,
    precioVenta: 38,
    costo: 18,
    stock: 14,
    stockMinimo: 5,
    imagen: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 302,
    codigo: 'PRD-CREM-02',
    sku: 'PRD-CREM-02',
    nombre: 'Crema Regeneradora Noche con Péptidos',
    categoria: 'Cuidado Facial',
    precio: 45,
    precioVenta: 45,
    costo: 22,
    stock: 3, // Bajo
    stockMinimo: 6,
    imagen: 'https://images.unsplash.com/photo-1608248597359-bb4f605cb4cb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 303,
    codigo: 'PRD-SOL-03',
    sku: 'PRD-SOL-03',
    nombre: 'Protector Solar FPS 50+ Toque Seco',
    categoria: 'Protección Solar',
    precio: 32,
    precioVenta: 32,
    costo: 14,
    stock: 28,
    stockMinimo: 8,
    imagen: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 304,
    codigo: 'PRD-MASC-04',
    sku: 'PRD-MASC-04',
    nombre: 'Mascarilla Hidroplástica Colágeno Marino',
    categoria: 'Insumos Cabina',
    precio: 22,
    precioVenta: 22,
    costo: 9,
    stock: 0, // Agotado
    stockMinimo: 5,
    imagen: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 305,
    codigo: 'PRD-ACE-05',
    sku: 'PRD-ACE-05',
    nombre: 'Aceite Esencial Lavanda Terapéutica 30ml',
    categoria: 'Bienestar & Aromaterapia',
    precio: 18,
    precioVenta: 18,
    costo: 7,
    stock: 19,
    stockMinimo: 4,
    imagen: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 306,
    codigo: 'PRD-GEL-06',
    sku: 'PRD-GEL-06',
    nombre: 'Gel Limpiador Botánico Purificante',
    categoria: 'Limpieza Facial',
    precio: 26,
    precioVenta: 26,
    costo: 11,
    stock: 9,
    stockMinimo: 5,
    imagen: 'https://images.unsplash.com/photo-1556228722-d0b777a83626?w=150&auto=format&fit=crop&q=80',
  },
]

export interface DemoCita {
  id: number
  hora: string
  cliente: string
  servicio: string
  especialista: string
  estado: 'en_atencion' | 'confirmada' | 'pendiente' | 'completada'
  sala: string
  precio: number
}

export const DEMO_CITAS: DemoCita[] = [
  {
    id: 401,
    hora: '09:00 - 10:00',
    cliente: 'Elena Rostova',
    servicio: 'Tratamiento Facial Glow Completo',
    especialista: 'Lic. Sofía Alarcón',
    estado: 'completada',
    sala: 'Cabina 01 (Láser)',
    precio: 75,
  },
  {
    id: 402,
    hora: '10:15 - 11:00',
    cliente: 'Mateo Silva',
    servicio: 'Consulta Dermatológica Especializada',
    especialista: 'Dr. Carlos Mendoza',
    estado: 'en_atencion',
    sala: 'Consultorio 02',
    precio: 50,
  },
  {
    id: 403,
    hora: '11:15 - 12:00',
    cliente: 'Daniela Prieto',
    servicio: 'Limpieza Profunda Punta Diamante',
    especialista: 'Lic. Sofía Alarcón',
    estado: 'confirmada',
    sala: 'Cabina 01 (Láser)',
    precio: 60,
  },
  {
    id: 404,
    hora: '12:30 - 13:15',
    cliente: 'Lucas Benítez',
    servicio: 'Masaje Descontracturante & Terapéutico',
    especialista: 'Lic. Diego Morales',
    estado: 'confirmada',
    sala: 'Sala de Fisioterapia',
    precio: 55,
  },
  {
    id: 405,
    hora: '15:00 - 15:45',
    cliente: 'Camila Vargas',
    servicio: 'Depilación Láser Diodo Facial',
    especialista: 'Dra. Valeria Montes',
    estado: 'pendiente',
    sala: 'Cabina 03',
    precio: 40,
  },
]

// Aliases para integración y pruebas de demostración
export const MOCK_DEMO_SPECIALISTS = DEMO_ESPECIALISTAS
export const MOCK_DEMO_CLIENTS = DEMO_CLIENTES
export const MOCK_DEMO_SERVICES = DEMO_SERVICIOS
export const MOCK_DEMO_PRODUCTS = DEMO_PRODUCTOS
export const MOCK_DEMO_APPOINTMENTS = DEMO_CITAS
