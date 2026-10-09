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
  TemaConfig,
} from '@/types'
import {
  configuracionService,
  migrateLegacySagittaConfig,
} from '@/services/configuracion.service'
import { useTenant } from '@/context/TenantContext'
import {
  applyTheme,
  configuracionToTema,
  temaToConfiguracion,
} from '@/utils/themeEngine'
import { THEME_PRESETS } from '@/config/themePresets'
import { exportarTema, importarTema } from '@/utils/themeValidator'

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
  lema_negocio: 'Gestión clara para las operaciones de tu negocio.',
  logo_url: '',
  logo_dark_url: '',
  logo_icono_url: '',
  favicon_url: '',
  color_primario: '#18181B',
  paleta_predefinida: 'slate',
  fuente_tipografica: 'DM Sans',
  radio_esquinas: 'moderno',
  densidad: 'comfortable',
  sombras: 'subtle',
  modo_visual: 'light',
  preset_nombre: 'Modern',
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
  escala_fuente: 'normal',
  titulo_pestana: 'Sagitta Platform · Sistema de Gestión',
  ticket_ancho: 80,
  ticket_pie: '¡Gracias por su preferencia! Vuelva pronto.',
  ticket_abrir_cajon: true,
  url_terminos: 'https://sagitta.com/terminos',
  url_privacidad: 'https://sagitta.com/privacidad',
}

export interface ConfiguracionContextValue {
  configuracion: ConfiguracionMarcaBlanca
  tema: TemaConfig
  cargando: boolean
  actualizarConfiguracion: (
    data: Partial<ConfiguracionMarcaBlanca>
  ) => Promise<ConfiguracionMarcaBlanca>
  actualizarTema: (nuevoTema: Partial<TemaConfig>) => Promise<TemaConfig>
  aplicarPreset: (presetId: string) => Promise<TemaConfig>
  resetConfiguracion: () => Promise<void>
  exportarTemaJson: () => string
  importarTemaJson: (
    jsonStr: string
  ) => Promise<{ success: boolean; errors?: string[] }>
  nombreMarca: string
  lemaMarca: string
  esMarcaBlancaTotal: boolean
}

export const ConfiguracionContext = createContext<ConfiguracionContextValue | undefined>(
  undefined
)

const GLOBAL_STORAGE_KEY = 'sagitta_marca_blanca_config'
const getTenantStorageKey = (tenantId: string) => `sagitta_tenant_config_${tenantId}`

export function ConfiguracionProvider({ children }: { children: React.ReactNode }) {
  const { tenantActivo } = useTenant()
  const tenantId = tenantActivo?.id || 'sede-principal'

  // Carga inicial basada en tenant
  const [configuracion, setConfiguracion] = useState<ConfiguracionMarcaBlanca>(() => {
    try {
      const tenantSaved = localStorage.getItem(getTenantStorageKey(tenantId))
      if (tenantSaved) {
        const config = migrateLegacySagittaConfig(JSON.parse(tenantSaved))
        localStorage.setItem(getTenantStorageKey(tenantId), JSON.stringify(config))
        return config
      }

      const globalSaved = localStorage.getItem(GLOBAL_STORAGE_KEY)
      if (globalSaved) {
        const config = migrateLegacySagittaConfig(JSON.parse(globalSaved))
        localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(config))
        return config
      }

      return CONFIGURACION_DEFAULT
    } catch {
      return CONFIGURACION_DEFAULT
    }
  })

  const [tema, setTema] = useState<TemaConfig>(() => {
    return configuracionToTema(configuracion)
  })

  const [cargando, setCargando] = useState(false)

  // Recargar configuración cuando cambia el tenant activo
  useEffect(() => {
    try {
      const tenantSaved = localStorage.getItem(getTenantStorageKey(tenantId))
      if (tenantSaved) {
        const parsed = migrateLegacySagittaConfig(JSON.parse(tenantSaved))
        localStorage.setItem(getTenantStorageKey(tenantId), JSON.stringify(parsed))
        const globalSaved = localStorage.getItem(GLOBAL_STORAGE_KEY)
        if (globalSaved) {
          const globalConfig = migrateLegacySagittaConfig(JSON.parse(globalSaved))
          localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(globalConfig))
        }
        setConfiguracion(parsed)
        const t = configuracionToTema(parsed)
        setTema(t)
        applyTheme(t)
        return
      }

      // Si no hay configuración específica para este tenant, consultar la API o usar la global
      configuracionService
        .getConfiguracion()
        .then((res) => {
          if (res.data) {
            setConfiguracion(res.data)
            const t = configuracionToTema(res.data)
            setTema(t)
            applyTheme(t)
            localStorage.setItem(getTenantStorageKey(tenantId), JSON.stringify(res.data))
          }
        })
        .catch(() => {
          // En caso de fallo de red, usamos el valor por defecto o local
        })
    } catch {
      // Fallback silencioso
    }
  }, [tenantId])

  // Aplicar tema en el DOM cada vez que el tema cambia
  useEffect(() => {
    applyTheme(tema)
  }, [tema])

  // Actualizar configuración (retrocompatible y síncrona con Tema)
  const actualizarConfiguracion = useCallback(
    async (data: Partial<ConfiguracionMarcaBlanca>) => {
      setCargando(true)
      try {
        const res = await configuracionService.actualizarConfiguracion(data)
        const nueva = res.data ?? { ...configuracion, ...data }
        const nuevoTema = configuracionToTema(nueva)

        setConfiguracion(nueva)
        setTema(nuevoTema)

        localStorage.setItem(getTenantStorageKey(tenantId), JSON.stringify(nueva))
        localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(nueva))

        applyTheme(nuevoTema)
        return nueva
      } finally {
        setCargando(false)
      }
    },
    [configuracion, tenantId]
  )

  // Actualizar tema directamente mediante el modelo TemaConfig
  const actualizarTema = useCallback(
    async (nuevoTemaParcial: Partial<TemaConfig>) => {
      setCargando(true)
      try {
        const mergedTema: TemaConfig = {
          ...tema,
          ...nuevoTemaParcial,
          brand: {
            ...tema.brand,
            ...(nuevoTemaParcial.brand ?? {}),
          },
          colors: {
            ...tema.colors,
            ...(nuevoTemaParcial.colors ?? {}),
          },
          typography: {
            ...tema.typography,
            ...(nuevoTemaParcial.typography ?? {}),
          },
          assets: {
            ...tema.assets,
            ...(nuevoTemaParcial.assets ?? {}),
          },
        }

        const nuevaConfig = temaToConfiguracion(mergedTema, configuracion)
        await configuracionService.actualizarConfiguracion(nuevaConfig)

        setTema(mergedTema)
        setConfiguracion(nuevaConfig)

        localStorage.setItem(getTenantStorageKey(tenantId), JSON.stringify(nuevaConfig))
        localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(nuevaConfig))

        applyTheme(mergedTema)
        return mergedTema
      } finally {
        setCargando(false)
      }
    },
    [tema, configuracion, tenantId]
  )

  // Aplicar un Preset predefinido
  const aplicarPreset = useCallback(
    async (presetId: string) => {
      const preset = THEME_PRESETS[presetId]
      if (!preset) {
        throw new Error(`Preset con id "${presetId}" no encontrado.`)
      }

      setCargando(true)
      try {
        const presetConfig = preset.config
        // Mantenemos la marca/textos actuales del tenant, pero adoptamos la estética del preset
        const temaActualizado: TemaConfig = {
          ...presetConfig,
          id: tema.id,
          brand: {
            ...presetConfig.brand,
            name: tema.brand.name || presetConfig.brand.name,
            tagline: tema.brand.tagline || presetConfig.brand.tagline,
            supportEmail: tema.brand.supportEmail || presetConfig.brand.supportEmail,
            supportPhone: tema.brand.supportPhone || presetConfig.brand.supportPhone,
            websiteUrl: tema.brand.websiteUrl || presetConfig.brand.websiteUrl,
          },
          assets: {
            ...tema.assets,
            ...presetConfig.assets,
          },
          whiteLabelActive: tema.whiteLabelActive,
          hideSystemBranding: tema.hideSystemBranding,
        }

        const nuevaConfig = temaToConfiguracion(temaActualizado, configuracion)
        await configuracionService.actualizarConfiguracion(nuevaConfig)

        setTema(temaActualizado)
        setConfiguracion(nuevaConfig)

        localStorage.setItem(getTenantStorageKey(tenantId), JSON.stringify(nuevaConfig))
        localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(nuevaConfig))

        applyTheme(temaActualizado)
        return temaActualizado
      } finally {
        setCargando(false)
      }
    },
    [tema, configuracion, tenantId]
  )

  // Restablecer a valores por defecto
  const resetConfiguracion = useCallback(async () => {
    setCargando(true)
    try {
      await configuracionService.resetConfiguracion()
      setConfiguracion(CONFIGURACION_DEFAULT)
      const defTema = configuracionToTema(CONFIGURACION_DEFAULT)
      setTema(defTema)
      localStorage.setItem(getTenantStorageKey(tenantId), JSON.stringify(CONFIGURACION_DEFAULT))
      localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(CONFIGURACION_DEFAULT))
      applyTheme(defTema)
    } finally {
      setCargando(false)
    }
  }, [tenantId])

  // Exportar tema a JSON
  const exportarTemaJson = useCallback(() => {
    return exportarTema(tema)
  }, [tema])

  // Importar tema desde JSON con validación
  const importarTemaJson = useCallback(
    async (jsonStr: string) => {
      const res = importarTema(jsonStr)
      if (!res.valid || !res.data) {
        return { success: false, errors: res.errors }
      }

      await actualizarTema(res.data)
      return { success: true }
    },
    [actualizarTema]
  )

  const esMarcaBlancaTotal = useMemo(() => {
    return Boolean(configuracion.marca_blanca_activa && configuracion.ocultar_marca_sistema)
  }, [configuracion.marca_blanca_activa, configuracion.ocultar_marca_sistema])

  const nombreMarca = useMemo(() => {
    return tema.brand?.name || configuracion.nombre_negocio || 'Sagitta'
  }, [tema.brand?.name, configuracion.nombre_negocio])

  const lemaMarca = useMemo(() => {
    return tema.brand?.tagline || configuracion.lema_negocio || ''
  }, [tema.brand?.tagline, configuracion.lema_negocio])

  const value = useMemo<ConfiguracionContextValue>(
    () => ({
      configuracion,
      tema,
      cargando,
      actualizarConfiguracion,
      actualizarTema,
      aplicarPreset,
      resetConfiguracion,
      exportarTemaJson,
      importarTemaJson,
      nombreMarca,
      lemaMarca,
      esMarcaBlancaTotal,
    }),
    [
      configuracion,
      tema,
      cargando,
      actualizarConfiguracion,
      actualizarTema,
      aplicarPreset,
      resetConfiguracion,
      exportarTemaJson,
      importarTemaJson,
      nombreMarca,
      lemaMarca,
      esMarcaBlancaTotal,
    ]
  )

  return (
    <ConfiguracionContext.Provider value={value}>
      {children}
    </ConfiguracionContext.Provider>
  )
}

export function useConfiguracion() {
  const context = useContext(ConfiguracionContext)
  if (!context) {
    throw new Error('useConfiguracion debe usarse dentro de un ConfiguracionProvider')
  }
  return context
}
