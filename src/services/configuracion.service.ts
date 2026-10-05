import { apiClient } from './api.client'
import { ConfiguracionMarcaBlanca, ApiResponse } from '@/types'

const STORAGE_KEY = 'sagitta_marca_blanca_config'

const DEFAULT_CONFIG: ConfiguracionMarcaBlanca = {
  id: 1,
  nombre_negocio: 'Sagitta',
  lema_negocio: 'Sistema de reservas y citas inteligente para profesionales.',
  logo_url: '',
  logo_dark_url: '',
  logo_icono_url: '',
  favicon_url: '',
  color_primario: '#6366f1',
  paleta_predefinida: 'indigo',
  fuente_tipografica: 'Inter',
  radio_esquinas: 'moderno',
  marca_blanca_activa: false,
  ocultar_marca_sistema: false,
  texto_pie_pagina: '© 2026 Sagitta. Todos los derechos reservados.',
  mostrar_powered_by: true,
  texto_powered_by: 'Powered by Sagitta Platform',
  email_soporte: 'soporte@sagitta.com',
  telefono_soporte: '+1 555-0900',
  sitio_web: 'https://sagitta.com',
  moneda: 'USD',
  simbolo_moneda: '$',
  zona_horaria: 'America/New_York',
  formato_hora: '12h',
  formato_fecha: 'DD/MM/YYYY',
  url_terminos: 'https://sagitta.com/terminos',
  url_privacidad: 'https://sagitta.com/privacidad',
}

function getStoredConfig(): ConfiguracionMarcaBlanca {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

export const configuracionService = {
  // Obtener la configuración actual del negocio y marca blanca
  getConfiguracion: async (): Promise<ApiResponse<ConfiguracionMarcaBlanca>> => {
    try {
      const res = await apiClient.get<ConfiguracionMarcaBlanca>('/configuracion')
      if (res.data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data))
        return res
      }
    } catch {
      // Fallback a localStorage
    }
    return { success: true, message: 'OK', data: getStoredConfig() }
  },

  // Actualizar la configuración del negocio y marca blanca
  actualizarConfiguracion: async (data: Partial<ConfiguracionMarcaBlanca>): Promise<ApiResponse<ConfiguracionMarcaBlanca>> => {
    const current = getStoredConfig()
    const updated = { ...current, ...data }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

    try {
      const res = await apiClient.put<ConfiguracionMarcaBlanca>('/configuracion', data)
      if (res.data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data))
        return res
      }
    } catch {
      // Sync background offline fallback
    }

    return { success: true, message: 'Configuración guardada en almacenamiento local', data: updated }
  },

  // Restablecer la configuración a los valores por defecto del sistema
  resetConfiguracion: async (): Promise<ApiResponse<ConfiguracionMarcaBlanca>> => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG))
    try {
      await apiClient.post<ConfiguracionMarcaBlanca>('/configuracion/reset', {})
    } catch {
      // Ignorar fallo remoto
    }
    return { success: true, message: 'Configuración restablecida', data: DEFAULT_CONFIG }
  },
}
