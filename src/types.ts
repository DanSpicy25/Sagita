// ─── Usuarios y Auth ───────────────────────────────────────────────────────
export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'gerente'
  | 'empleado'
  | 'recepcionista'
  | 'cliente'
  | (string & {})

export interface User {
  id: number
  nombre: string
  email: string
  rol: UserRole
  avatar?: string
  telefono?: string
  sucursal_id?: number
  sucursal_nombre?: string
  timezone: string
  permisos?: string[]
  created_at: string
}

export interface UsuarioGestion extends User {
  activo: boolean
  ultimo_login?: string
  password?: string
}

export interface CrearUsuarioPayload {
  nombre: string
  email: string
  password: string
  rol: UserRole
  telefono?: string
  sucursal_id?: number
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface LoginPayload {
  email: string
  password: string
}

// ─── Respuesta genérica de la API ─────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  message: string
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

// ─── Fase 2: Ubicaciones ──────────────────────────────────────────────────
export interface Ubicacion {
  id: number
  nombre: string
  direccion: string
  ciudad: string
  pais: string
  timezone: string
  activo: boolean
}

// ─── Fase 2: Categorías de Servicio ───────────────────────────────────────
export interface CategoriaServicio {
  id: number
  nombre: string
  descripcion?: string
  color?: string
  icono?: string
}

// ─── Fase 2: Servicios ────────────────────────────────────────────────────
export interface DuracionServicio {
  id: number
  servicio_id: number
  duracion_min: number
  precio: number
  etiqueta?: string
}

export interface Servicio {
  id: number
  nombre: string
  descripcion?: string
  categoria_id?: number
  categoria?: CategoriaServicio
  duracion_base_min: number
  duracion_minutos?: number
  precio_base: number
  precio?: number
  duraciones?: DuracionServicio[]
  color?: string
  imagen?: string
  activo: boolean
  buffer_antes_min: number
  buffer_despues_min: number
  recurso_requerido_tipo?: TipoRecurso
  capacidad_maxima?: number
  // Campos Comerciales y Políticas
  visible_portal_publico?: boolean
  requiere_deposito?: boolean
  tipo_deposito?: 'porcentaje' | 'monto_fijo'
  monto_deposito?: number
  porcentaje_anticipo?: number
  impuesto_porcentaje?: number
  precio_incluye_impuesto?: boolean
  anticipacion_minima_horas?: number
  anticipacion_maxima_dias?: number
  horas_anticipacion_cancelacion?: number
  politica_cancelacion_horas?: number
  penalizacion_cancelacion_porcentaje?: number
  penalizacion_cancelacion_tardia?: boolean | number
  capacidad_simultanea?: number
  duracion_buffer_previo?: number
  duracion_buffer_posterior?: number
  precios_por_nivel?: { nivel: string; precio: number }[]
  empleados_asignados_ids?: number[]
  empleados_compatibles_ids?: number[]
  recursos_requeridos_ids?: number[]
}

// ─── Fase 3 (Booking Engine): Recursos Físicos y Genéricos ────────────────
export type TipoRecurso = 'sala' | 'cabina' | 'silla' | 'equipo' | 'generico'
export type EstadoRecurso = 'disponible' | 'en_uso' | 'mantenimiento' | 'inactivo'

export interface Recurso {
  id: number
  nombre: string
  tipo: TipoRecurso
  descripcion?: string
  capacidad: number
  ubicacion_id?: number
  servicios_compatibles_ids?: number[]
  estado: EstadoRecurso
  activo: boolean
}

// ─── Fase 2 & 3: Empleados / Profesionales y Pausas ───────────────────────
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6  // 0=Domingo

export interface PausaHorario {
  id?: string
  nombre?: string
  hora_inicio: string  // "HH:mm"
  hora_fin: string     // "HH:mm"
}

export interface HorarioEmpleado {
  id: number
  empleado_id: number
  dia_semana: DiaSemana
  hora_inicio: string  // "HH:mm"
  hora_fin: string     // "HH:mm"
  pausas?: PausaHorario[]
  activo: boolean
}

export interface DiaLibre {
  id: number
  empleado_id: number
  fecha: string  // "YYYY-MM-DD"
  motivo?: string
}

export interface Empleado {
  id: number
  usuario_id?: number
  nombre: string
  apellido?: string
  email: string
  telefono?: string
  rol?: string
  cargo?: string
  bio?: string
  foto?: string
  especialidad?: string
  ubicacion_id?: number
  ubicacion?: Ubicacion
  servicios?: Servicio[]
  horarios?: HorarioEmpleado[]
  dias_libres?: DiaLibre[]
  activo: boolean
}

// ─── Fase 3: Bloqueos de Horario, Feriados y Excepciones ──────────────────
export type TipoBloqueo = 'feriado' | 'mantenimiento' | 'capacitacion' | 'personal' | 'bloqueo_general'

export interface BloqueoHorario {
  id: number
  titulo: string
  fecha_inicio: string  // "YYYY-MM-DD HH:mm" o "YYYY-MM-DD"
  fecha_fin: string
  tipo: TipoBloqueo
  empleado_id?: number
  recurso_id?: number
  todo_el_dia: boolean
  motivo?: string
}

export interface ExcepcionHorario {
  id: number
  fecha: string  // "YYYY-MM-DD"
  empleado_id?: number
  hora_inicio: string  // "HH:mm"
  hora_fin: string     // "HH:mm"
  cerrado: boolean
  motivo?: string
}

// ─── Fase 3: Verificación de Conflictos ────────────────────────────────────
export interface ConflictoReserva {
  hayConflicto: boolean
  motivo?:
    | 'empleado_ocupado'
    | 'recurso_ocupado'
    | 'fuera_de_horario'
    | 'pausa_laboral'
    | 'bloqueo_horario'
    | 'feriado'
    | 'dia_libre'
  mensaje?: string
  detalles?: {
    citaConflictivaId?: number
    bloqueoId?: number
    recursoNombre?: string
    empleadoNombre?: string
  }
}

// ─── Fase 2: Disponibilidad ───────────────────────────────────────────────
export interface SlotDisponible {
  hora_inicio: string  // "HH:mm"
  hora_fin: string
  disponible: boolean
  motivo_no_disponible?: string
  recurso_id?: number
}

export interface DisponibilidadDia {
  fecha: string
  slots: SlotDisponible[]
}

// ─── Fase 2: Clientes & CRM ───────────────────────────────────────────────
export type TipoDocumentoCliente = 'CI' | 'DNI' | 'RIF' | 'pasaporte' | 'otro'
export type GeneroCliente = 'femenino' | 'masculino' | 'otro' | 'prefiero_no_decir'
export type CanalContactoCliente = 'whatsapp' | 'email' | 'telefono' | 'sms'

export interface NotaCliente {
  id: string
  fecha?: string
  autor?: string
  texto?: string
  contenido?: string
  created_at?: string
}

export interface ArchivoCliente {
  id: string
  nombre: string
  url: string
  tipo?: string
  size?: number
  tamano?: string
  fecha?: string
  created_at?: string
}

export interface ConsentimientoCliente {
  id: string
  titulo: string
  firmado: boolean
  aceptado?: boolean
  fecha?: string
  fecha_firma?: string
  firmado_por?: string
  version?: string
  archivo_url?: string
  firma_url?: string
}

export interface Cliente {
  id: number
  usuario_id?: number
  nombre: string
  apellido?: string
  email: string
  telefono?: string
  telefono_secundario?: string
  tipo_documento?: TipoDocumentoCliente
  documento_identidad?: string
  fecha_nacimiento?: string
  genero?: GeneroCliente
  ciudad?: string
  direccion?: string
  canal_contacto_preferido?: CanalContactoCliente
  empleado_preferido_id?: number
  etiquetas?: string[]
  total_gastado?: number
  notas?: string
  notas_historial?: NotaCliente[]
  archivos?: ArchivoCliente[]
  consentimientos?: ConsentimientoCliente[]
  extensiones_vertical?: Record<string, unknown>
  total_citas: number
  created_at: string
}

// ─── Fase 2: Campos personalizados ────────────────────────────────────────
export type TipoCampo = 'text' | 'textarea' | 'checkbox' | 'select' | 'phone' | 'date'

export interface CampoPersonalizado {
  id: number
  servicio_id: number
  etiqueta: string
  tipo: TipoCampo
  requerido: boolean
  opciones?: string[]  // para tipo 'select'
  orden: number
}

export interface RespuestaCampo {
  campo_id: number
  valor: string | boolean
}

// ─── Fase 2 & 3: Recurrencia Segura ───────────────────────────────────────
export type TipoRecurrencia = 'diaria' | 'semanal' | 'mensual' | 'anual'

export interface Recurrencia {
  id: number
  tipo: TipoRecurrencia
  intervalo: number   // cada N días/semanas/meses/años
  fecha_fin?: string
  max_repeticiones?: number
}

// ─── Fase 3: Walk-In y Cola de Espera en Vivo ─────────────────────────────
export type EstadoTurnoCola = 'en_espera' | 'llamado' | 'en_atencion' | 'completado' | 'cancelado' | 'no_asistio'

export interface TurnoCola {
  id: number
  codigo_turno: string  // ej: "W-01", "W-02"
  cliente_nombre: string
  cliente_telefono?: string
  cliente_id?: number
  servicio_id: number
  servicio_nombre: string
  empleado_id?: number
  empleado_nombre?: string
  recurso_id?: number
  recurso_nombre?: string
  hora_llegada: string
  hora_estimada_inicio?: string
  estado: EstadoTurnoCola
  cita_id?: number
  notas?: string
}

// ─── Fase 2 & 3: Citas y Estados de Reserva ───────────────────────────────
export type EstadoCita =
  | 'pendiente'
  | 'confirmada'
  | 'en_cola'
  | 'en_atencion'
  | 'completada'
  | 'cancelada'
  | 'no_asistio'
  | 'reprogramada'

export interface Cita {
  id: number
  cliente_id: number
  cliente?: Cliente
  empleado_id: number
  empleado?: Empleado
  servicio_id: number
  servicio?: Servicio
  recurso_id?: number
  recurso?: Recurso
  duracion_id?: number
  duracion?: DuracionServicio
  ubicacion_id?: number
  ubicacion?: Ubicacion
  fecha_inicio: string  // ISO 8601 o "YYYY-MM-DD HH:mm"
  fecha_fin: string
  estado: EstadoCita
  notas?: string
  recurrencia_id?: number
  recurrencia?: Recurrencia
  respuestas_campos?: RespuestaCampo[]
  precio_total: number
  modalidad?: 'presencial' | 'virtual'
  enlace_videollamada?: string
  plataforma_videollamada?: 'meet' | 'zoom'
  google_calendar_event_id?: string
  es_walk_in?: boolean
  hora_llegada_cola?: string
  hora_inicio_atencion?: string
  hora_fin_atencion?: string
  motivo_cancelacion?: string
  cita_origen_reprogramada_id?: number
  fecha?: string
  hora?: string
  created_at: string
}

// ─── Fase 2: Carrito de reservas ─────────────────────────────────────────
export interface ItemCarrito {
  id: string  // uuid local
  servicio: Servicio
  duracion?: DuracionServicio
  empleado?: Empleado
  fecha_inicio?: string
  fecha_fin?: string
  precio: number
}

// ─── Fase 2: Wizard de nueva cita ────────────────────────────────────────
export type PasoWizard = 1 | 2 | 3 | 4

export interface EstadoWizard {
  paso: PasoWizard
  servicioSeleccionado?: Servicio
  duracionSeleccionada?: DuracionServicio
  empleadoSeleccionado?: Empleado
  fechaSeleccionada?: string
  horaSeleccionada?: string
  notas: string
  respuestasCampos: RespuestaCampo[]
  carrito: ItemCarrito[]
  serviciosExtraSeleccionados?: ServicioExtra[]
  cuponAplicado?: Cupon
  descuentoCupon?: number
}

// ─── Fase 3: Pagos, Facturas y Cupones ──────────────────────────────────
export type MetodoPago = 'tarjeta' | 'efectivo' | 'transferencia' | 'stripe'
export type EstadoFactura = 'pagada' | 'pendiente' | 'reembolsada'

export interface ItemFactura {
  descripcion: string
  cantidad: number
  precio_unitario: number
  total: number
}

export interface Factura {
  id: number
  numero: string
  cita_id?: number
  cita?: Cita
  cliente_id: number
  cliente?: Cliente
  subtotal: number
  descuento: number
  total: number
  metodo_pago: MetodoPago
  estado: EstadoFactura
  items: ItemFactura[]
  cupon_aplicado?: string
  pdf_url?: string
  created_at: string
}

export type TipoCupon = 'porcentual' | 'fijo'

export interface Cupon {
  id: number
  codigo: string
  tipo: TipoCupon
  valor: number
  valido_desde?: string
  valido_hasta?: string
  usos_max?: number
  usos_actuales: number
  activo: boolean
}

export interface ValidacionCupon {
  valido: boolean
  mensaje: string
  cupon?: Cupon
  descuento_calculado?: number
}

export type EstadoReembolso = 'completado' | 'procesando' | 'rechazado'

export interface Reembolso {
  id: number
  factura_id: number
  factura_numero?: string
  cliente_id?: number
  cliente_nombre?: string
  monto: number
  motivo: string
  estado: EstadoReembolso
  created_at: string
}

// ─── Fase 3: Servicios Extra y Paquetes ──────────────────────────────────
export interface ServicioExtra {
  id: number
  servicio_id?: number
  nombre: string
  descripcion?: string
  precio: number
  duracion_extra_min: number
  activo: boolean
}

export interface PaqueteServicio {
  id: number
  nombre: string
  descripcion: string
  precio_total: number
  precio_original: number
  total_sesiones?: number
  validez_dias?: number
  servicios_ids: number[]
  servicios?: Servicio[]
  descuento_porcentaje: number
  activo: boolean
}

export interface ClientePaquete {
  id: number
  cliente_id: number
  paquete_id: number
  paquete?: PaqueteServicio
  total_sesiones: number
  sesiones_totales?: number
  sesiones_consumidas: number
  sesiones_usadas?: number
  sesiones_restantes: number
  fecha_compra: string
  fecha_expiracion?: string
  fecha_vencimiento?: string
  estado: 'activo' | 'agotado' | 'expirado'
}

export type PeriodicidadMembresia = 'mensual' | 'trimestral' | 'anual'

export interface PlanMembresia {
  id: number
  codigo?: string
  nombre: string
  descripcion?: string
  precio?: number
  precio_recurrente: number
  periodicidad?: PeriodicidadMembresia
  frecuencia: PeriodicidadMembresia
  descuento_servicios_porcentaje?: number
  descuento_servicios_extra_porcentaje?: number
  descuento_productos_porcentaje?: number
  servicios_incluidos?: { servicio_id: number; sesiones_por_periodo: number }[]
  beneficios?: string[]
  activo: boolean
}

export interface ClienteMembresia {
  id: number
  cliente_id: number
  plan_id: number
  plan?: PlanMembresia
  estado: 'activa' | 'pausada' | 'cancelada'
  fecha_inicio: string
  fecha_proxima_renovacion?: string
  fecha_renovacion?: string
}

// ─── Fase 3: Lista de Espera ─────────────────────────────────────────────
export type EstadoListaEspera = 'en_espera' | 'notificado' | 'cancelado' | 'convertido'

export interface ItemListaEspera {
  id: number
  cliente_id: number
  cliente?: Cliente
  servicio_id: number
  servicio?: Servicio
  empleado_id?: number
  empleado?: Empleado
  fecha_deseada: string
  hora_preferente?: string
  notas?: string
  estado: EstadoListaEspera
  created_at: string
}

// ─── Fase 4: Integraciones y Notificaciones ──────────────────────────────
export type EstadoIntegracion = 'conectado' | 'desconectado' | 'error'
export type TipoIntegracion = 'google_calendar' | 'google_meet' | 'zoom' | 'whatsapp' | 'webpush'

export interface Integracion {
  id: string
  tipo: TipoIntegracion
  nombre: string
  descripcion: string
  estado: EstadoIntegracion
  icono?: string
  cuenta_vinculada?: string
  sincronizacion_automatica?: boolean
  ultima_sync?: string
  ultima_sincronizacion?: string
}

export type EventoWebhook =
  | 'cita.creada'
  | 'cita.confirmada'
  | 'cita.cancelada'
  | 'cita.pagada'
  | 'cita.reembolsada'
  | 'cliente.creado'

export interface Webhook {
  id: number
  url: string
  eventos: EventoWebhook[]
  secret_key: string
  activo: boolean
  ultimo_envio?: string
  ultimo_status?: number
}

export type TipoNotificacion = 'cita' | 'pago' | 'recordatorio' | 'sistema' | 'espera'

export interface Notificacion {
  id: number
  titulo: string
  mensaje: string
  tipo: TipoNotificacion
  leida: boolean
  fecha: string
  created_at?: string
  enlace?: string
}

export type CanalNotificacion = 'whatsapp' | 'email' | 'push' | 'sms'

export interface PlantillaMensaje {
  id: number
  canal: CanalNotificacion
  evento: string
  nombre: string
  asunto?: string
  cuerpo: string
  activo: boolean
}

// ─── UI ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
}

export type Theme = 'light' | 'dark' | 'system'

export type VistaCalendario = 'mes' | 'semana' | 'dia' | 'lista'

// ─── Fase 5: Configuración y Marca Blanca (White Label) ────────────────────
export type PaletaColor =
  | 'indigo'
  | 'emerald'
  | 'violet'
  | 'rose'
  | 'ocean'
  | 'amber'
  | 'slate'
  | 'custom'

export type FuenteTipografica =
  | 'Inter'
  | 'Roboto'
  | 'Poppins'
  | 'Montserrat'
  | 'Outfit'
  | 'Plus Jakarta Sans'
  | 'DM Sans'
  | 'Geist'

export type EscalaFuente = 'compacto' | 'normal' | 'comodo' | 'grande'

export type RadioEsquinas = 'cuadrado' | 'suave' | 'moderno' | 'pronunciado'
export type Densidad = 'compact' | 'comfortable' | 'spacious'
export type EstiloSombras = 'none' | 'subtle' | 'elevated'
export type ModoVisual = 'light' | 'dark' | 'system'

export interface ThemeBrand {
  name: string
  tagline: string
  footerText: string
  showPoweredBy: boolean
  poweredByText: string
  supportEmail: string
  supportPhone: string
  websiteUrl: string
  termsUrl?: string
  privacyUrl?: string
}

export interface ThemeColors {
  primary: string
  primaryHover?: string
  primarySoft?: string
  secondary?: string
  accent?: string
  success?: string
  warning?: string
  danger?: string
  info?: string
  palettePredefinida?: PaletaColor
}

export interface ThemeTypography {
  fontBody: FuenteTipografica
  fontHeading?: FuenteTipografica
  fontMono?: string
  fontScale?: EscalaFuente
}

export interface ThemeAssets {
  logoUrl?: string
  logoDarkUrl?: string
  logoIconoUrl?: string
  faviconUrl?: string
}

export interface TemaConfig {
  id?: string
  version: string
  presetName?: string
  brand: ThemeBrand
  colors: ThemeColors
  typography: ThemeTypography
  radius: RadioEsquinas
  shadows: EstiloSombras
  density: Densidad
  mode: ModoVisual
  assets: ThemeAssets
  whiteLabelActive: boolean
  hideSystemBranding: boolean
}

export interface ConfiguracionMarcaBlanca {
  id: number
  nombre_negocio: string
  lema_negocio: string
  logo_url: string
  logo_dark_url: string
  logo_icono_url: string
  favicon_url: string
  color_primario: string
  paleta_predefinida: PaletaColor
  fuente_tipografica: FuenteTipografica
  radio_esquinas: RadioEsquinas
  densidad?: Densidad
  sombras?: EstiloSombras
  modo_visual?: ModoVisual
  preset_nombre?: string
  marca_blanca_activa: boolean
  ocultar_marca_sistema: boolean
  texto_pie_pagina: string
  mostrar_powered_by: boolean
  texto_powered_by?: string
  email_soporte: string
  telefono_soporte: string
  sitio_web: string
  moneda: string
  simbolo_moneda: string
  zona_horaria: string
  formato_hora: '12h' | '24h'
  formato_fecha: 'DD/MM/YYYY' | 'YYYY-MM-DD'
  url_terminos?: string
  url_privacidad?: string
  direccion?: string
  telefono?: string
  rut_empresa?: string
  ticket_ancho?: 58 | 80
  ticket_pie?: string
  ticket_abrir_cajon?: boolean
  escala_fuente?: EscalaFuente
  titulo_pestana?: string
  updated_at?: string
}

// ─── Fase 6: Multi-Tenant, i18n, CRM y Escalabilidad ──────────────────────
export type TenantPlan = 'starter' | 'pro' | 'enterprise'

export interface Tenant {
  id: string
  nombre: string
  slug: string
  logo_url?: string
  plan: TenantPlan
  activo: boolean
  es_principal: boolean
  direccion?: string
  telefono?: string
  citas_mes: number
  limite_citas: number
}

export type Idioma = 'es' | 'en' | 'pt' | 'fr'

export type CrmProvider = 'hubspot' | 'salesforce' | 'pipedrive' | 'zoho'

export interface CrmConfig {
  id: string
  proveedor: CrmProvider
  nombre: string
  descripcion: string
  estado: 'conectado' | 'desconectado' | 'error'
  cuenta_conectada?: string
  sincronizar_contactos: boolean
  sincronizar_deals: boolean
  ultima_sync?: string
  total_sincronizados: number
}

export interface ApiKey {
  id: number
  nombre: string
  token: string
  permisos: 'read' | 'write' | 'admin'
  creada_en: string
  ultimo_uso?: string
  activa: boolean
}

export type NivelAuditLog = 'info' | 'warning' | 'error'

export interface AuditLog {
  id: number
  tenant_id?: string
  usuario: string
  email: string
  rol: string
  accion: string
  modulo: string
  ip: string
  detalles: string
  nivel: NivelAuditLog
  created_at: string
}

// ─── Roles y Permisos ─────────────────────────────────────────────────────────
export interface Permiso {
  id: string
  modulo: string
  accion: string
  descripcion: string
}

export interface Rol {
  id: number
  nombre: string
  descripcion: string
  permisos: string[] // array of permiso ids like 'appointments.read'
  activo: boolean
  usuarios_count: number
  created_at: string
  es_sistema: boolean // system roles can't be deleted
}

// ─── Inventario ───────────────────────────────────────────────────────────────
export type MovimientoInventario =
  | 'PURCHASE'
  | 'SALE'
  | 'ADJUSTMENT'
  | 'RETURN'
  | 'LOSS'
  | 'TRANSFER'
  | 'SERVICE_CONSUMPTION'

export type EstadoProducto = 'activo' | 'inactivo' | 'sin_stock'

export interface Producto {
  id: number
  sku: string
  codigo_barras?: string
  nombre: string
  descripcion?: string
  categoria: string
  precio_venta: number
  precio_costo: number
  stock_actual: number
  stock_minimo: number
  stock_maximo?: number
  unidad: string
  activo: boolean
  imagen?: string
  proveedor?: string
  proveedor_id?: number
  ubicacion?: string
  created_at: string
}

export interface MovimientoStock {
  id: number
  producto_id: number
  producto?: Producto
  tipo: MovimientoInventario
  cantidad: number
  cantidad_anterior: number
  cantidad_nueva: number
  motivo?: string
  referencia?: string
  usuario?: string
  created_at: string
}

export interface AlertaStock {
  producto_id: number
  producto: Producto
  stock_actual: number
  stock_minimo: number
}

// ─── Proveedores y Compras ───────────────────────────────────────────────────
export interface Proveedor {
  id: number
  nombre: string
  rnc_rif?: string
  contacto?: string
  email?: string
  telefono?: string
  direccion?: string
  plazo_pago_dias?: number
  activo: boolean
  created_at?: string
}

export type EstadoOrdenCompra = 'borrador' | 'ordenada' | 'recibida' | 'cancelada'

export interface ItemOrdenCompra {
  producto_id: number
  producto_nombre: string
  cantidad: number
  costo_unitario: number
  total: number
}

export interface OrdenCompra {
  id: number
  numero: string
  proveedor_id: number
  proveedor_nombre: string
  items: ItemOrdenCompra[]
  subtotal: number
  impuesto: number
  total: number
  estado: EstadoOrdenCompra
  fecha_creacion: string
  fecha_recepcion?: string
  notas?: string
}

// ─── Receta / BOM de Servicio (Consumo por Servicio) ─────────────────────────
export interface InsumoServicio {
  id: string
  producto_id: number
  producto_nombre: string
  cantidad: number
  unidad: string
  costo_estimado?: number
}

export interface RecetaServicio {
  servicio_id: number
  servicio_nombre?: string
  insumos: InsumoServicio[]
  activo: boolean
}

// ─── Ventas / POS ─────────────────────────────────────────────────────────────
export type EstadoVenta = 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
export type MetodoPagoVenta =
  | 'efectivo'
  | 'tarjeta'
  | 'transferencia'
  | 'pago_movil'
  | 'zelle'
  | 'stripe'
  | 'deposito'
  | 'gift_card'
  | 'mixto'

export interface ItemVenta {
  id: string
  tipo: 'servicio' | 'producto' | 'paquete' | 'gift_card'
  referencia_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  descuento_item: number
  total: number
  profesional_id?: number
  profesional_nombre?: string
  impuesto_porcentaje?: number
  impuesto_monto?: number
}

export interface PagoSplit {
  metodo: MetodoPagoVenta
  monto: number
  referencia?: string
  gift_card_codigo?: string
}

export interface Venta {
  id: number
  numero: string
  cliente_id?: number
  cliente?: Cliente
  items: ItemVenta[]
  subtotal: number
  descuento_global: number
  descuento?: number
  impuesto: number
  total: number
  metodo_pago: MetodoPagoVenta
  pagos_split?: PagoSplit[]
  propina?: number
  propina_profesional_id?: number
  estado: EstadoVenta
  notas?: string
  cita_id?: number
  origen?: 'pos' | 'cita' | 'portal'
  devuelto_monto?: number
  motivo_devolucion?: string
  promocion_aplicada?: string
  created_at: string
}

// ─── Caja ────────────────────────────────────────────────────────────────────
export type TipoMovimientoCaja =
  | 'apertura'
  | 'ingreso'
  | 'egreso'
  | 'cierre'
  | 'devolucion'
  | 'propina'

export interface MovimientoCaja {
  id: number
  tipo: TipoMovimientoCaja
  monto: number
  descripcion: string
  metodo_pago?: MetodoPagoVenta
  venta_id?: number
  empleado_id?: number
  usuario?: string
  created_at: string
}

export interface SesionCaja {
  id: number
  apertura_at: string
  cierre_at?: string
  monto_inicial: number
  monto_final?: number
  total_ventas: number
  total_ingresos: number
  total_egresos: number
  total_efectivo?: number
  total_tarjeta?: number
  total_transferencia?: number
  total_otros?: number
  total_propinas?: number
  total_devoluciones?: number
  diferencia?: number
  observaciones?: string
  usuario: string
  estado: 'abierta' | 'cerrada'
  movimientos: MovimientoCaja[]
}

// ─── Comisiones ──────────────────────────────────────────────────────────────
export type TipoCalculoComision = 'porcentaje' | 'monto_fijo'
export type AlcanceComision = 'general' | 'servicio' | 'profesional' | 'categoria'
export type EstadoComision = 'pendiente' | 'liquidada' | 'cancelada'

export interface ReglaComision {
  id: number
  nombre: string
  tipo_calculo: TipoCalculoComision
  valor: number // e.g. 20 (20%) or 15 ($15 fijo)
  aplicar_a: AlcanceComision
  referencia_id?: number // servicio_id o empleado_id
  categoria?: string
  activo: boolean
}

export interface ComisionVenta {
  id: number
  venta_id: number
  venta_numero?: string
  item_id: string
  concepto: string
  profesional_id: number
  profesional_nombre: string
  base_calculo: number
  regla_id?: number
  porcentaje?: number
  monto_comision: number
  periodo: string // e.g. '2026-09'
  estado: EstadoComision
  fecha_generacion: string
  fecha_liquidacion?: string
}

// ─── Promociones ─────────────────────────────────────────────────────────────
export type TipoPromocion = 'porcentaje' | 'monto_fijo'
export type AlcancePromocion = 'todos' | 'servicio' | 'categoria'

export interface Promocion {
  id: number
  nombre: string
  codigo?: string
  tipo: TipoPromocion
  valor: number
  alcance: AlcancePromocion
  referencia_id?: number
  categoria?: string
  solo_primera_compra: boolean
  hora_inicio?: string // ej '14:00'
  hora_fin?: string // ej '18:00'
  fecha_inicio?: string
  fecha_fin?: string
  usos_max?: number
  usos_actuales: number
  activo: boolean
}

// ─── Gift Cards ──────────────────────────────────────────────────────────────
export interface MovimientoGiftCard {
  id: string
  tipo: 'emision' | 'consumo' | 'recarga'
  monto: number
  saldo_resultante: number
  referencia?: string
  fecha: string
}

export interface GiftCard {
  id: number
  codigo: string
  saldo_inicial: number
  saldo_actual: number
  cliente_comprador_id?: number
  cliente_destinatario_nombre?: string
  cliente_destinatario_email?: string
  fecha_emision: string
  fecha_expiracion?: string
  estado: 'activa' | 'agotada' | 'expirada' | 'anulada'
  movimientos: MovimientoGiftCard[]
}

// ─── Fase 6: Automatizaciones y Comunicación (Automation + Communication Engine) ───

export type TipoTriggerAutomatizacion =
  | 'reserva_creada'
  | 'reserva_confirmada'
  | 'reserva_cancelada'
  | 'reserva_reprogramada'
  | 'recordatorio_pendiente'
  | 'cliente_creado'
  | 'venta_completada'
  | 'pago_recibido'
  | 'no_show'
  | 'cumpleanos'
  | 'stock_bajo'

export type CanalComunicacion = 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app'

export type TipoAccionAutomatizacion =
  | 'enviar_email'
  | 'notificacion_interna'
  | 'enviar_push'
  | 'ejecutar_webhook'
  | 'enviar_sms'
  | 'enviar_whatsapp'
  | 'crear_tarea'
  | 'aplicar_etiqueta'

export interface CondicionAutomatizacion {
  id?: string
  campo:
    | 'tenant_id'
    | 'sucursal_id'
    | 'servicio_id'
    | 'empleado_id'
    | 'cliente_id'
    | 'horario_inicio'
    | 'horario_fin'
    | 'estado'
    | 'etiquetas'
    | 'monto_minimo'
  operador: 'igual' | 'no_igual' | 'contiene' | 'no_contiene' | 'mayor_que' | 'menor_que' | 'entre'
  valor: string | number | string[]
}

export interface AccionAutomatizacion {
  id: string
  tipo: TipoAccionAutomatizacion
  canal?: CanalComunicacion
  plantilla_id?: number
  plantilla_cuerpo_custom?: string
  asunto?: string
  destinatario_tipo: 'cliente' | 'profesional' | 'admin' | 'webhook_url' | 'custom'
  destinatario_custom?: string
  webhook_url?: string
  webhook_metodo?: 'POST' | 'GET' | 'PUT'
  tarea_titulo?: string
  etiqueta_nombre?: string
  delay_minutos?: number
}

export interface ReglaAutomatizacion {
  id: number
  nombre: string
  descripcion?: string
  trigger: TipoTriggerAutomatizacion
  condiciones: CondicionAutomatizacion[]
  acciones: AccionAutomatizacion[]
  activo: boolean
  tenant_id?: string
  sucursal_id?: string
  ejecuciones_totales: number
  ultima_ejecucion?: string
  created_at: string
  updated_at: string
}

export interface DetalleAccionEjecutada {
  tipo: TipoAccionAutomatizacion
  canal?: CanalComunicacion
  destinatario?: string
  estado: 'enviado' | 'simulado_no_conectado' | 'fallido' | 'creado' | 'omitido_horario_silencioso'
  mensaje?: string
}

export interface EjecucionLogAutomatizacion {
  id: string
  regla_id: number
  regla_nombre: string
  trigger: TipoTriggerAutomatizacion
  exito: boolean
  detalles: string
  fecha: string
  entidad_tipo?: 'cita' | 'cliente' | 'venta' | 'pago' | 'producto' | 'general'
  entidad_id?: string | number
  acciones_ejecutadas: DetalleAccionEjecutada[]
}

export interface CanalConfiguracion {
  canal: CanalComunicacion
  conectado: boolean
  proveedor: string
  activo: boolean
  horario_silencioso_activo: boolean
  horario_silencioso_inicio: string
  horario_silencioso_fin: string
  permitir_urgentes_en_silencio?: boolean
  max_mensajes_por_dia_cliente?: number
}

export interface PreferenciaComunicacionTenant {
  tenant_id: string
  canales: Record<CanalComunicacion, CanalConfiguracion>
  idioma_predeterminado: string
  nombre_remitente: string
  email_remitente?: string
  whatsapp_remitente?: string
  sms_remitente?: string
}

export interface PagoAutomatizacion {
  id?: string | number
  monto: number
  metodo_pago?: string
  referencia?: string
  estado?: string
  fecha?: string
}

export interface ContextoEventoAutomatizacion {
  cita?: Cita
  cliente?: Cliente
  servicio?: Servicio
  empleado?: Empleado
  venta?: Venta
  pago?: PagoAutomatizacion
  producto?: Producto
  tenant_id?: string
  sucursal_id?: string
  etiquetas?: string[]
  metadata?: Record<string, unknown>
}

// ─── Plataforma modular: módulos, complementos, sectores y perfil de negocio ──
// Jerarquía: CORE → módulo → complemento (addon) → configuración.
// Resolución de visibilidad: flag de plataforma → plan → perfil del negocio → permiso del usuario.

/** Interruptores globales de plataforma (build/entorno). Ver src/config/features.ts */
export type PlatformFlag =
  | 'appointments'
  | 'clients'
  | 'services'
  | 'employees'
  | 'sales'
  | 'inventory'
  | 'billing'
  | 'reports'
  | 'crm'
  | 'notifications'
  | 'settings'
  | 'roles'

export type ModuleCategory =
  | 'inicio'
  | 'operaciones'
  | 'clientes'
  | 'ventas'
  | 'inventario'
  | 'marketing'
  | 'analitica'
  | 'configuracion'

export type ModuleId =
  // Disponibles
  | 'dashboard'
  | 'reservas'
  | 'recepcion'
  | 'servicios'
  | 'profesionales'
  | 'recursos'
  | 'clientes'
  | 'pos'
  | 'finanzas'
  | 'inventario'
  | 'automatizaciones'
  | 'reportes'
  | 'usuarios'
  | 'roles'
  | 'integraciones'
  | 'desarrolladores'
  | 'modulos'
  | 'ajustes'
  | 'hardware'
  | 'crm'
  | 'comisiones'
  | 'sucursales'
  // Planificados (hoja de ruta, sin ruta todavía)
  | 'compras'
  | 'fidelizacion'
  | 'marketing'
  | 'portal_cliente'

/** disponible = usable · parcial = usable con huecos · planificado = solo hoja de ruta */
export type ModuleAvailability = 'disponible' | 'parcial' | 'planificado'

/** Estado real de la capa de datos para evitar presentar mocks como funcionalidad real */
export type BackendReadiness = 'frontend_ready' | 'backend_required' | 'integration_required' | 'mock'

/** Términos de dominio que cambian según el sector (p. ej. Cita → Clase, Cliente → Paciente) */
export type TermKey =
  | 'cita'
  | 'citas'
  | 'cliente'
  | 'clientes'
  | 'profesional'
  | 'profesionales'
  | 'servicio'
  | 'servicios'
  | 'recurso'
  | 'recursos'

export interface ModuleAddon {
  /** Clave completa `modulo.complemento`, p. ej. `recepcion.walk_in` */
  key: string
  label: string
  description: string
  defaultEnabled: boolean
  availability: ModuleAvailability
}

export interface ModuleDependencies {
  /** Sin estos módulos el módulo no funciona (se activan/desactivan en cascada) */
  technical?: ModuleId[]
  /** Recomendados para sacarle valor, no obligatorios */
  functional?: ModuleId[]
}

export interface ModuleDefinition {
  id: ModuleId
  label: string
  description: string
  category: ModuleCategory
  /** Ruta principal. Los módulos sin ruta no aparecen en la navegación */
  route?: string
  /** Ruta opcional directa a la pantalla de configuración o subpestaña */
  configRoute?: string
  /** Permiso mínimo de lectura (UI). La autorización real es responsabilidad del backend */
  permission?: string
  platformFlag?: PlatformFlag
  /** El término de sector que sustituye la etiqueta en navegación */
  termKey?: TermKey
  /** Los módulos core no pueden desactivarse */
  core: boolean
  availability: ModuleAvailability
  backend: BackendReadiness
  /** Dependencia comercial: plan mínimo de la sucursal */
  minPlan: TenantPlan
  dependencies?: ModuleDependencies
  addons?: ModuleAddon[]
  /** Capacidades principales (resumen para la pantalla de módulos) */
  capabilities: string[]
}

export type IndustryId =
  | 'general'
  | 'belleza'
  | 'salud'
  | 'fitness'
  | 'automotriz'
  | 'educacion'
  | 'profesional'
  | 'creativo'
  | 'gastronomia'
  | 'hogar'
  | 'mascotas'
  | 'espacios'

export interface IndustryPreset {
  id: IndustryId
  label: string
  description: string
  examples: string[]
  /** Módulos no-core activados por el preset */
  modules: ModuleId[]
  /** Complementos activados por el preset (claves `modulo.complemento`) */
  addons: string[]
  terms: Partial<Record<TermKey, string>>
}

/** Perfil de negocio por sucursal/tenant: qué módulos y complementos usa */
export interface BusinessProfile {
  id: string
  tenant_id: string
  industria: IndustryId
  modulos: ModuleId[]
  complementos: string[]
  terminos_personalizados?: Partial<Record<TermKey, string>>
  updated_at: string
}
