export type OnboardingStepId =
  | 'negocio'
  | 'servicios'
  | 'horarios'
  | 'equipo'
  | 'pagos'
  | 'personalizacion'
  | 'listo'

export interface OnboardingServicioDraft {
  id: string
  nombre: string
  duracionMin: number
  precio: number
}

export interface OnboardingData {
  // 1. Negocio
  nombreNegocio: string
  vertical: string
  telefono: string
  ciudad: string
  // 2. Servicios
  servicios: OnboardingServicioDraft[]
  // 3. Horarios
  diasApertura: string[]
  horaApertura: string
  horaCierre: string
  // 4. Equipo
  primerColaborador: {
    nombre: string
    especialidad: string
    email: string
  }
  // 5. Pagos
  metodosPago: {
    efectivo: boolean
    tarjeta: boolean
    transferencia: boolean
  }
  // 6. Personalización
  terminoCita: 'cita' | 'turno' | 'reserva'
  terminoCliente: 'cliente' | 'paciente' | 'socio'
  colorPrimario: string
  // Control
  completedSteps: Record<OnboardingStepId, boolean>
  isCompleted: boolean
  isDismissed: boolean
  updatedAt: string
}

export interface OnboardingStepDefinition {
  id: OnboardingStepId
  numero: number
  titulo: string
  subtitulo: string
  descripcionCorta: string
  esOmitible: boolean
}

export const ONBOARDING_STEPS: OnboardingStepDefinition[] = [
  {
    id: 'negocio',
    numero: 1,
    titulo: 'Tu Negocio',
    subtitulo: 'Datos principales de tu establecimiento',
    descripcionCorta: 'Nombre comercial, especialidad e información de contacto.',
    esOmitible: false,
  },
  {
    id: 'servicios',
    numero: 2,
    titulo: 'Servicios Base',
    subtitulo: '¿Qué ofreces a tus clientes?',
    descripcionCorta: 'Registra tus primeros tratamientos o atenciones con duración y tarifa.',
    esOmitible: true,
  },
  {
    id: 'horarios',
    numero: 3,
    titulo: 'Jornada y Horarios',
    subtitulo: 'Días y horas de atención al público',
    descripcionCorta: 'Define cuándo abre y cierra tu establecimiento para la agenda.',
    esOmitible: true,
  },
  {
    id: 'equipo',
    numero: 4,
    titulo: 'Equipo de Trabajo',
    subtitulo: 'Tu primer profesional o especialista',
    descripcionCorta: 'Asigna quién realiza las atenciones y atiende las citas.',
    esOmitible: true,
  },
  {
    id: 'pagos',
    numero: 5,
    titulo: 'Cobros & Pagos',
    subtitulo: 'Formas de cobro aceptadas en mostrador',
    descripcionCorta: 'Efectivo, terminal de tarjeta o transferencias bancarias.',
    esOmitible: true,
  },
  {
    id: 'personalizacion',
    numero: 6,
    titulo: 'Personalización',
    subtitulo: 'Vocabulario y estilo visual a tu medida',
    descripcionCorta: '¿Llamas a tus citas "turnos"? ¿Y a tus usuarios "pacientes"?',
    esOmitible: true,
  },
  {
    id: 'listo',
    numero: 7,
    titulo: '¡Todo Preparado!',
    subtitulo: 'Tu plataforma está lista para operar',
    descripcionCorta: 'Resumen de configuración y bienvenida a Sagitta.',
    esOmitible: false,
  },
]

