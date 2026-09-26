import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ConfiguracionMarcaBlanca,
  PaletaColor,
} from '@/types'
import { configuracionService } from '@/services/configuracion.service'

export const PALETAS_PREDEFINIDAS: Record<
  PaletaColor,
  { nombre: string; hex: string; desc: string }
> = {
  indigo: {
    nombre: 'Índigo Sagitta',
    hex: '#6366f1',
    desc: 'Tecnología, moderno y corporativo',
  },
  emerald: {
    nombre: 'Esmeralda Vital',
    hex: '#10b981',
    desc: 'Salud, bienestar, spa y nutrición',
  },
  violet: {
    nombre: 'Violeta Luxe',
    hex: '#8b5cf6',
    desc: 'Estética, belleza premium y centros de relax',
  },
  rose: {
    nombre: 'Rosa Carmín',
    hex: '#f43f5e',
    desc: 'Peluquería, salones de uñas y cuidado personal',
  },
  ocean: {
    nombre: 'Azul Océano',
    hex: '#0284c7',
    desc: 'Clínicas dentales, médicos y consultorías',
  },
  amber: {
    nombre: 'Ámbar Cálido',
    hex: '#f59e0b',
    desc: 'Coaching, terapias y atención personalizada',
  },
  slate: {
    nombre: 'Slate Minimal',
    hex: '#334155',
    desc: 'Elegancia sobria, despachos y firmas',
  },
  custom: {
    nombre: 'Personalizado',
    hex: '#6366f1',
    desc: 'Define tu propio código de color hexadecimal',
  },
}

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
}

interface ConfiguracionContextValue {
  configuracion: ConfiguracionMarcaBlanca
  cargando: boolean
  actualizarConfiguracion: (data: Partial<ConfiguracionMarcaBlanca>) => Promise<ConfiguracionMarcaBlanca>
  resetConfiguracion: () => Promise<void>
  nombreMarca: string
  lemaMarca: string
  esMarcaBlancaTotal: boolean
}

export const ConfiguracionContext = createContext<ConfiguracionContextValue | undefined>(undefined)

const STORAGE_KEY = 'sagitta_marca_blanca_config'

export function ConfiguracionProvider({ children }: { children: React.ReactNode }) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionMarcaBlanca>(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY)
      return guardado ? JSON.parse(guardado) : CONFIGURACION_DEFAULT
    } catch {
      return CONFIGURACION_DEFAULT
    }
  })
  const [cargando, setCargando] = useState(false)

  // Cargar desde el servicio al iniciar
  useEffect(() => {
    configuracionService
      .getConfiguracion()
      .then((res) => {
        if (res.data) {
          setConfiguracion(res.data)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data))
        }
      })
      .catch(() => {
        // En caso de fallo de red, usamos el valor de localStorage/default
      })
  }, [])

  // Sincronizar DOM: title, favicon, fuentes y colores
  useEffect(() => {
    // 1. Título de la pestaña
    if (configuracion.nombre_negocio) {
      document.title = configuracion.nombre_negocio
    }

    // 2. Favicon dinámico
    if (configuracion.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = configuracion.favicon_url
    }

    // 3. Tipografía dinámica
    const fontName = configuracion.fuente_tipografica || 'Inter'
    if (fontName !== 'Inter') {
      const fontId = 'google-font-custom'
      let fontLink = document.getElementById(fontId) as HTMLLinkElement | null
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`
      
      if (!fontLink) {
        fontLink = document.createElement('link')
        fontLink.id = fontId
        fontLink.rel = 'stylesheet'
        document.head.appendChild(fontLink)
      }
      fontLink.href = fontUrl
      document.body.style.fontFamily = `"${fontName}", sans-serif`
    } else {
      document.body.style.fontFamily = '"Inter", sans-serif'
    }

    // 4. Color Primario dinámico en CSS Variables
    const colorPrimario = configuracion.color_primario || '#6366f1'
    document.documentElement.style.setProperty('--color-brand-primary', colorPrimario)
  }, [configuracion])

  const actualizarConfiguracion = useCallback(async (data: Partial<ConfiguracionMarcaBlanca>) => {
    setCargando(true)
    try {
      const res = await configuracionService.actualizarConfiguracion(data)
      const nueva = res.data ?? { ...configuracion, ...data }
      setConfiguracion(nueva)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nueva))
      return nueva
    } finally {
      setCargando(false)
    }
  }, [configuracion])

  const resetConfiguracion = useCallback(async () => {
    setCargando(true)
    try {
      await configuracionService.resetConfiguracion()
      setConfiguracion(CONFIGURACION_DEFAULT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIGURACION_DEFAULT))
    } finally {
      setCargando(false)
    }
  }, [])

  const esMarcaBlancaTotal = useMemo(() => {
    return Boolean(configuracion.marca_blanca_activa && configuracion.ocultar_marca_sistema)
  }, [configuracion.marca_blanca_activa, configuracion.ocultar_marca_sistema])

  const nombreMarca = useMemo(() => {
    return configuracion.nombre_negocio || 'Sagitta'
  }, [configuracion.nombre_negocio])

  const lemaMarca = useMemo(() => {
    return configuracion.lema_negocio || ''
  }, [configuracion.lema_negocio])

  const value = useMemo<ConfiguracionContextValue>(
    () => ({
      configuracion,
      cargando,
      actualizarConfiguracion,
      resetConfiguracion,
      nombreMarca,
      lemaMarca,
      esMarcaBlancaTotal,
    }),
    [
      configuracion,
      cargando,
      actualizarConfiguracion,
      resetConfiguracion,
      nombreMarca,
      lemaMarca,
      esMarcaBlancaTotal,
    ]
  )

  return <ConfiguracionContext.Provider value={value}>{children}</ConfiguracionContext.Provider>
}

export function useConfiguracion() {
  const context = useContext(ConfiguracionContext)
  if (!context) {
    throw new Error('useConfiguracion debe usarse dentro de un ConfiguracionProvider')
  }
  return context
}

