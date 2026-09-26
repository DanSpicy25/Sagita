import { http, HttpResponse } from 'msw'
import { ConfiguracionMarcaBlanca } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL as string

export const CONFIGURACION_DEFAULT: ConfiguracionMarcaBlanca = {
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
  updated_at: new Date().toISOString(),
}

// Estado en memoria simulado
let configuracionActual: ConfiguracionMarcaBlanca = { ...CONFIGURACION_DEFAULT }

export const configuracionHandlers = [
  // GET /api/configuracion
  http.get(`${BASE}/configuracion`, () => {
    return HttpResponse.json({
      success: true,
      data: configuracionActual,
      message: 'Configuración recuperada con éxito',
    })
  }),

  // PUT /api/configuracion
  http.put(`${BASE}/configuracion`, async ({ request }) => {
    const body = (await request.json()) as Partial<ConfiguracionMarcaBlanca>
    configuracionActual = {
      ...configuracionActual,
      ...body,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json({
      success: true,
      data: configuracionActual,
      message: 'Configuración de marca blanca actualizada',
    })
  }),

  // POST /api/configuracion/reset
  http.post(`${BASE}/configuracion/reset`, () => {
    configuracionActual = {
      ...CONFIGURACION_DEFAULT,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json({
      success: true,
      data: configuracionActual,
      message: 'Configuración restaurada a valores por defecto',
    })
  }),
]

