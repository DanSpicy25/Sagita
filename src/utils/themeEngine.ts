import {
  TemaConfig,
  ConfiguracionMarcaBlanca,
  FuenteTipografica,
  RadioEsquinas,
  Densidad,
  EstiloSombras,
} from '@/types'

/**
 * Aplica un objeto TemaConfig completo a nivel global en el DOM:
 * - Variables CSS de marca y semánticas (--color-brand-primary, --color-primary, etc.)
 * - Atributos de dataset en <html> (data-radius, data-density, data-shadows, data-theme)
 * - Inyección y aplicación de fuentes Google Fonts (--font-body, --font-heading)
 * - Título del documento y favicon dinámico
 */
export function applyTheme(tema: TemaConfig, isDarkOverride?: boolean): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // 1. Geometría (Radius)
  const radius: RadioEsquinas = tema.radius || 'moderno'
  root.setAttribute('data-radius', radius)

  // 2. Densidad (Density)
  const density: Densidad = tema.density || 'comfortable'
  root.setAttribute('data-density', density)

  // 3. Profundidad (Shadows)
  const shadows: EstiloSombras = tema.shadows || 'subtle'
  root.setAttribute('data-shadows', shadows)

  // 4. Modo Visual (Light / Dark / System)
  let shouldBeDark = false
  if (typeof isDarkOverride === 'boolean') {
    shouldBeDark = isDarkOverride
  } else if (tema.mode === 'dark') {
    shouldBeDark = true
  } else if (tema.mode === 'system') {
    shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  if (shouldBeDark) {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
  }

  // 5. Paleta de Colores Semánticos y Primarios
  const primaryColor = tema.colors?.primary || '#6366f1'
  root.style.setProperty('--color-brand-primary', primaryColor)
  root.style.setProperty('--color-primary', primaryColor)

  if (tema.colors?.primaryHover) {
    root.style.setProperty('--color-primary-hover', tema.colors.primaryHover)
  } else {
    // Si no se especifica, dejar que CSS color-mix lo resuelva o quitar inline
    root.style.removeProperty('--color-primary-hover')
  }

  if (tema.colors?.primarySoft) {
    root.style.setProperty('--color-primary-soft', tema.colors.primarySoft)
  } else {
    root.style.removeProperty('--color-primary-soft')
  }

  if (tema.colors?.secondary) {
    root.style.setProperty('--color-secondary', tema.colors.secondary)
  } else {
    root.style.removeProperty('--color-secondary')
  }

  if (tema.colors?.accent) {
    root.style.setProperty('--color-accent', tema.colors.accent)
  } else {
    root.style.removeProperty('--color-accent')
  }

  if (tema.colors?.success) {
    root.style.setProperty('--color-success', tema.colors.success)
  }
  if (tema.colors?.warning) {
    root.style.setProperty('--color-warning', tema.colors.warning)
  }
  if (tema.colors?.danger) {
    root.style.setProperty('--color-danger', tema.colors.danger)
  }
  if (tema.colors?.info) {
    root.style.setProperty('--color-info', tema.colors.info)
  }

  // 6. Tipografía dinámica y escala
  const fontBody = tema.typography?.fontBody || 'Inter'
  const fontHeading = tema.typography?.fontHeading || fontBody
  const fontScale = tema.typography?.fontScale || 'normal'

  root.setAttribute('data-font-scale', fontScale)
  const scaleMap: Record<string, string> = {
    compacto: '13px',
    normal: '14px',
    comodo: '15px',
    grande: '16px',
  }
  root.style.fontSize = scaleMap[fontScale] || '14px'

  // Cargar Google Fonts si difiere del sistema estándar
  const fontFamilies = Array.from(new Set([fontBody, fontHeading])).filter(
    (f) => f && f !== 'Inter'
  )

  const fontId = 'google-font-custom'
  let fontLink = document.getElementById(fontId) as HTMLLinkElement | null

  if (fontFamilies.length > 0) {
    const familyQueries = fontFamilies
      .map((f) => `family=${f.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800`)
      .join('&')
    const fontUrl = `https://fonts.googleapis.com/css2?${familyQueries}&display=swap`

    if (!fontLink) {
      fontLink = document.createElement('link')
      fontLink.id = fontId
      fontLink.rel = 'stylesheet'
      document.head.appendChild(fontLink)
    }
    if (fontLink.href !== fontUrl) {
      fontLink.href = fontUrl
    }
  } else if (fontLink) {
    fontLink.remove()
  }

  root.style.setProperty('--font-body', `"${fontBody}", sans-serif`)
  document.body.style.fontFamily = `"${fontBody}", sans-serif`
  if (fontHeading) {
    root.style.setProperty('--font-heading', `"${fontHeading}", sans-serif`)
  }

  // 7. Título de página (Brand & Browser Tab)
  if (tema.brand?.name) {
    const titleText = tema.brand.tagline
      ? `${tema.brand.name} · ${tema.brand.tagline}`
      : tema.brand.name
    document.title = titleText
  }

  // 8. Favicon dinámico en esquina de pestaña
  if (tema.assets?.faviconUrl) {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = tema.assets.faviconUrl
  }
}

/**
 * Convierte el modelo de persistencia `ConfiguracionMarcaBlanca`
 * al objeto estandarizado y desacoplado `TemaConfig`.
 */
export function configuracionToTema(cfg: ConfiguracionMarcaBlanca): TemaConfig {
  return {
    version: '1.0.0',
    presetName: cfg.preset_nombre || 'Personalizado',
    brand: {
      name: cfg.nombre_negocio || 'Sagitta',
      tagline: cfg.lema_negocio || '',
      footerText: cfg.texto_pie_pagina || 'Todos los derechos reservados.',
      showPoweredBy: cfg.mostrar_powered_by ?? true,
      poweredByText: cfg.texto_powered_by || 'Powered by Sagitta Platform',
      supportEmail: cfg.email_soporte || '',
      supportPhone: cfg.telefono_soporte || '',
      websiteUrl: cfg.sitio_web || '',
      termsUrl: cfg.url_terminos,
      privacyUrl: cfg.url_privacidad,
    },
    colors: {
      primary: cfg.color_primario || '#6366f1',
      palettePredefinida: cfg.paleta_predefinida || 'custom',
    },
    typography: {
      fontBody: (cfg.fuente_tipografica as FuenteTipografica) || 'Inter',
      fontHeading: (cfg.fuente_tipografica as FuenteTipografica) || 'Inter',
      fontScale: cfg.escala_fuente || 'normal',
    },
    radius: cfg.radio_esquinas || 'moderno',
    shadows: cfg.sombras || 'subtle',
    density: cfg.densidad || 'comfortable',
    mode: cfg.modo_visual || 'light',
    assets: {
      logoUrl: cfg.logo_url || '',
      logoDarkUrl: cfg.logo_dark_url || '',
      logoIconoUrl: cfg.logo_icono_url || '',
      faviconUrl: cfg.favicon_url || '',
    },
    whiteLabelActive: Boolean(cfg.marca_blanca_activa),
    hideSystemBranding: Boolean(cfg.ocultar_marca_sistema),
  }
}

/**
 * Sincroniza un objeto `TemaConfig` hacia el formato `ConfiguracionMarcaBlanca`.
 */
export function temaToConfiguracion(
  tema: TemaConfig,
  prev?: ConfiguracionMarcaBlanca
): ConfiguracionMarcaBlanca {
  return {
    id: prev?.id ?? 1,
    nombre_negocio: tema.brand.name,
    lema_negocio: tema.brand.tagline,
    logo_url: tema.assets.logoUrl || '',
    logo_dark_url: tema.assets.logoDarkUrl || '',
    logo_icono_url: tema.assets.logoIconoUrl || '',
    favicon_url: tema.assets.faviconUrl || '',
    color_primario: tema.colors.primary,
    paleta_predefinida: tema.colors.palettePredefinida || 'custom',
    fuente_tipografica: tema.typography.fontBody,
    escala_fuente: tema.typography.fontScale || 'normal',
    titulo_pestana: prev?.titulo_pestana || `${tema.brand.name} · ${tema.brand.tagline || 'Sagitta'}`,
    radio_esquinas: tema.radius,
    densidad: tema.density,
    sombras: tema.shadows,
    modo_visual: tema.mode,
    preset_nombre: tema.presetName,
    marca_blanca_activa: tema.whiteLabelActive,
    ocultar_marca_sistema: tema.hideSystemBranding,
    texto_pie_pagina: tema.brand.footerText,
    mostrar_powered_by: tema.brand.showPoweredBy,
    texto_powered_by: tema.brand.poweredByText,
    email_soporte: tema.brand.supportEmail,
    telefono_soporte: tema.brand.supportPhone,
    sitio_web: tema.brand.websiteUrl,
    moneda: prev?.moneda || 'USD',
    simbolo_moneda: prev?.simbolo_moneda || '$',
    zona_horaria: prev?.zona_horaria || 'America/New_York',
    formato_hora: prev?.formato_hora || '12h',
    formato_fecha: prev?.formato_fecha || 'DD/MM/YYYY',
    url_terminos: tema.brand.termsUrl || prev?.url_terminos || '',
    url_privacidad: tema.brand.privacyUrl || prev?.url_privacidad || '',
  }
}
