import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { Idioma } from '@/types'

export interface IdiomaInfo {
  id: Idioma
  nombre: string
  bandera: string
  codigo: string
}

export const IDIOMAS_DISPONIBLES: IdiomaInfo[] = [
  { id: 'es', nombre: 'Español',   bandera: '🇪🇸', codigo: 'ES' },
  { id: 'en', nombre: 'English',   bandera: '🇺🇸', codigo: 'EN' },
  { id: 'pt', nombre: 'Português', bandera: '🇧🇷', codigo: 'PT' },
  { id: 'fr', nombre: 'Français',  bandera: '🇫🇷', codigo: 'FR' },
]

const DICCIONARIOS: Record<Idioma, Record<string, string>> = {
  es: {
    dashboard: 'Dashboard',
    citas: 'Citas',
    servicios: 'Servicios',
    empleados: 'Empleados',
    clientes: 'Clientes',
    finanzas: 'Finanzas',
    integraciones: 'Integraciones',
    crm: 'CRM & API',
    ajustes: 'Ajustes',
    nueva_cita: 'Nueva Cita',
    reservar_ahora: 'Reservar Cita',
    confirmar: 'Confirmar Reserva',
    buscar: 'Buscar...',
    guardar: 'Guardar Cambios',
    cancelar: 'Cancelar',
    eliminar: 'Eliminar',
    estado: 'Estado',
    sucursal: 'Sucursal Activa',
    notificaciones: 'Notificaciones',
    idioma: 'Idioma',
  },
  en: {
    dashboard: 'Dashboard',
    citas: 'Appointments',
    servicios: 'Services',
    empleados: 'Staff & Team',
    clientes: 'Customers',
    finanzas: 'Billing & Finance',
    integraciones: 'Integrations',
    crm: 'CRM & Developers',
    ajustes: 'Settings',
    nueva_cita: 'New Booking',
    reservar_ahora: 'Book Appointment',
    confirmar: 'Confirm Booking',
    buscar: 'Search...',
    guardar: 'Save Changes',
    cancelar: 'Cancel',
    eliminar: 'Delete',
    estado: 'Status',
    sucursal: 'Active Branch',
    notificaciones: 'Notifications',
    idioma: 'Language',
  },
  pt: {
    dashboard: 'Painel',
    citas: 'Agendamentos',
    servicios: 'Serviços',
    empleados: 'Equipe',
    clientes: 'Clientes',
    finanzas: 'Financeiro',
    integraciones: 'Integrações',
    crm: 'CRM e API',
    ajustes: 'Configurações',
    nueva_cita: 'Novo Agendamento',
    reservar_ahora: 'Agendar Horário',
    confirmar: 'Confirmar Agendamento',
    buscar: 'Pesquisar...',
    guardar: 'Salvar Alterações',
    cancelar: 'Cancelar',
    eliminar: 'Excluir',
    estado: 'Status',
    sucursal: 'Filial Ativa',
    notificaciones: 'Notificações',
    idioma: 'Idioma',
  },
  fr: {
    dashboard: 'Tableau de bord',
    citas: 'Rendez-vous',
    servicios: 'Prestations',
    empleados: 'Équipe',
    clientes: 'Clients',
    finanzas: 'Facturation',
    integraciones: 'Intégrations',
    crm: 'CRM & API',
    ajustes: 'Paramètres',
    nueva_cita: 'Nouveau RDV',
    reservar_ahora: 'Prendre Rendez-vous',
    confirmar: 'Confirmer la réservation',
    buscar: 'Rechercher...',
    guardar: 'Enregistrer',
    cancelar: 'Annuler',
    eliminar: 'Supprimer',
    estado: 'Statut',
    sucursal: 'Succursale Active',
    notificaciones: 'Notifications',
    idioma: 'Langue',
  },
}

interface I18nContextValue {
  idioma: Idioma
  cambiarIdioma: (nuevo: Idioma) => void
  t: (key: string, fallback?: string) => string
  idiomaInfo: IdiomaInfo
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined)

const STORAGE_KEY = 'sagitta_locale'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [idioma, setIdiomaState] = useState<Idioma>(() => {
    const guardado = localStorage.getItem(STORAGE_KEY) as Idioma | null
    if (guardado && ['es', 'en', 'pt', 'fr'].includes(guardado)) {
      return guardado
    }
    // Detectar idioma del navegador
    const navLang = navigator.language?.slice(0, 2)
    if (navLang === 'en') return 'en'
    if (navLang === 'pt') return 'pt'
    if (navLang === 'fr') return 'fr'
    return 'es'
  })

  const cambiarIdioma = useCallback((nuevo: Idioma) => {
    setIdiomaState(nuevo)
    localStorage.setItem(STORAGE_KEY, nuevo)
    document.documentElement.lang = nuevo
  }, [])

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = DICCIONARIOS[idioma] ?? DICCIONARIOS.es
      return dict[key] ?? fallback ?? key
    },
    [idioma]
  )

  const idiomaInfo = useMemo(() => {
    return (
      IDIOMAS_DISPONIBLES.find((i) => i.id === idioma) ??
      IDIOMAS_DISPONIBLES[0]
    )
  }, [idioma])

  const value = useMemo(
    () => ({
      idioma,
      cambiarIdioma,
      t,
      idiomaInfo,
    }),
    [idioma, cambiarIdioma, t, idiomaInfo]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n debe usarse dentro de un I18nProvider')
  }
  return context
}

