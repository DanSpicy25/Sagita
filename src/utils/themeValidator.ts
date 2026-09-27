import {
  TemaConfig,
  FuenteTipografica,
  RadioEsquinas,
  EstiloSombras,
  Densidad,
  ModoVisual,
} from '@/types'

const FUENTES_VALIDAS: FuenteTipografica[] = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Outfit']
const RADIOS_VALIDOS: RadioEsquinas[] = ['cuadrado', 'suave', 'moderno', 'pronunciado']
const SOMBRAS_VALIDAS: EstiloSombras[] = ['none', 'subtle', 'elevated']
const DENSIDADES_VALIDAS: Densidad[] = ['compact', 'comfortable', 'spacious']
const MODOS_VALIDOS: ModoVisual[] = ['light', 'dark', 'system']

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const SENSITIVE_KEY_REGEX = /(secret|password|token|api[_-]?key|credential|private)/i

export interface ValidationResult {
  valid: boolean
  errors: string[]
  data?: TemaConfig
}

/**
 * Valida un objeto de configuración de tema asegurando integridad visual
 * y rechazando la presencia de secretos o credenciales.
 */
export function validarTema(input: unknown): ValidationResult {
  const errors: string[] = []

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['El tema debe ser un objeto JSON válido.'] }
  }

  const raw = input as Record<string, unknown>

  // 1. Detección de claves sensibles / secretos
  const checkForSensitiveKeys = (obj: Record<string, unknown>, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key
      if (SENSITIVE_KEY_REGEX.test(key)) {
        errors.push(`Propiedad prohibida o potencialmente sensible detectada: "${fullPath}".`)
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        checkForSensitiveKeys(value as Record<string, unknown>, fullPath)
      }
    }
  }
  checkForSensitiveKeys(raw)

  // 2. Validación de Marca (Brand)
  const brand = raw.brand as Record<string, unknown> | undefined
  if (!brand || typeof brand !== 'object') {
    errors.push('El tema requiere un objeto "brand" con el nombre comercial.')
  } else if (!brand.name || typeof brand.name !== 'string' || brand.name.trim().length === 0) {
    errors.push('El campo "brand.name" es obligatorio y debe ser una cadena no vacía.')
  }

  // 3. Validación de Colores (Colors)
  const colors = raw.colors as Record<string, unknown> | undefined
  if (!colors || typeof colors !== 'object') {
    errors.push('El tema requiere un objeto "colors" con al menos el color primario.')
  } else if (!colors.primary || typeof colors.primary !== 'string' || !HEX_COLOR_REGEX.test(colors.primary)) {
    errors.push('El campo "colors.primary" debe ser un código hexadecimal válido (ej. #6366f1).')
  }

  // 4. Validación de Tipografía (Typography)
  const typography = raw.typography as Record<string, unknown> | undefined
  if (!typography || typeof typography !== 'object') {
    errors.push('El tema requiere un objeto "typography".')
  } else {
    if (!typography.fontBody || !FUENTES_VALIDAS.includes(typography.fontBody as FuenteTipografica)) {
      errors.push(`"typography.fontBody" inválida. Permitidas: ${FUENTES_VALIDAS.join(', ')}.`)
    }
  }

  // 5. Validación de Geometría y Estilo
  if (!raw.radius || !RADIOS_VALIDOS.includes(raw.radius as RadioEsquinas)) {
    errors.push(`"radius" inválido. Opciones permitidas: ${RADIOS_VALIDOS.join(', ')}.`)
  }

  if (raw.shadows && !SOMBRAS_VALIDAS.includes(raw.shadows as EstiloSombras)) {
    errors.push(`"shadows" inválido. Opciones permitidas: ${SOMBRAS_VALIDAS.join(', ')}.`)
  }

  if (raw.density && !DENSIDADES_VALIDAS.includes(raw.density as Densidad)) {
    errors.push(`"density" inválido. Opciones permitidas: ${DENSIDADES_VALIDAS.join(', ')}.`)
  }

  if (raw.mode && !MODOS_VALIDOS.includes(raw.mode as ModoVisual)) {
    errors.push(`"mode" inválido. Opciones permitidas: ${MODOS_VALIDOS.join(', ')}.`)
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  // Construcción sanitizada de TemaConfig garantizando estructura canónica
  const cleanBrand = brand as Record<string, unknown>
  const cleanColors = colors as Record<string, unknown>
  const cleanTypo = typography as Record<string, unknown>
  const cleanAssets = (raw.assets as Record<string, unknown>) ?? {}

  const sanitized: TemaConfig = {
    version: typeof raw.version === 'string' ? raw.version : '1.0.0',
    presetName: typeof raw.presetName === 'string' ? raw.presetName : undefined,
    brand: {
      name: String(cleanBrand.name ?? 'Negocio'),
      tagline: String(cleanBrand.tagline ?? ''),
      footerText: String(cleanBrand.footerText ?? ''),
      showPoweredBy: Boolean(cleanBrand.showPoweredBy ?? true),
      poweredByText: String(cleanBrand.poweredByText ?? 'Powered by Platform'),
      supportEmail: String(cleanBrand.supportEmail ?? ''),
      supportPhone: String(cleanBrand.supportPhone ?? ''),
      websiteUrl: String(cleanBrand.websiteUrl ?? ''),
      termsUrl: cleanBrand.termsUrl ? String(cleanBrand.termsUrl) : undefined,
      privacyUrl: cleanBrand.privacyUrl ? String(cleanBrand.privacyUrl) : undefined,
    },
    colors: {
      primary: String(cleanColors.primary),
      primaryHover: cleanColors.primaryHover ? String(cleanColors.primaryHover) : undefined,
      primarySoft: cleanColors.primarySoft ? String(cleanColors.primarySoft) : undefined,
      secondary: cleanColors.secondary ? String(cleanColors.secondary) : undefined,
      accent: cleanColors.accent ? String(cleanColors.accent) : undefined,
      success: cleanColors.success ? String(cleanColors.success) : undefined,
      warning: cleanColors.warning ? String(cleanColors.warning) : undefined,
      danger: cleanColors.danger ? String(cleanColors.danger) : undefined,
      info: cleanColors.info ? String(cleanColors.info) : undefined,
      palettePredefinida: cleanColors.palettePredefinida as TemaConfig['colors']['palettePredefinida'],
    },
    typography: {
      fontBody: cleanTypo.fontBody as FuenteTipografica,
      fontHeading: cleanTypo.fontHeading ? (cleanTypo.fontHeading as FuenteTipografica) : undefined,
      fontMono: cleanTypo.fontMono ? String(cleanTypo.fontMono) : undefined,
    },
    radius: (raw.radius as RadioEsquinas) ?? 'moderno',
    shadows: (raw.shadows as EstiloSombras) ?? 'subtle',
    density: (raw.density as Densidad) ?? 'comfortable',
    mode: (raw.mode as ModoVisual) ?? 'light',
    assets: {
      logoUrl: cleanAssets.logoUrl ? String(cleanAssets.logoUrl) : '',
      logoDarkUrl: cleanAssets.logoDarkUrl ? String(cleanAssets.logoDarkUrl) : '',
      logoIconoUrl: cleanAssets.logoIconoUrl ? String(cleanAssets.logoIconoUrl) : '',
      faviconUrl: cleanAssets.faviconUrl ? String(cleanAssets.faviconUrl) : '',
    },
    whiteLabelActive: Boolean(raw.whiteLabelActive ?? false),
    hideSystemBranding: Boolean(raw.hideSystemBranding ?? false),
  }

  return { valid: true, errors: [], data: sanitized }
}

/**
 * Exporta un tema en formato JSON limpio sin secretos.
 */
export function exportarTema(tema: TemaConfig): string {
  const sanitized = validarTema(tema)
  if (!sanitized.valid || !sanitized.data) {
    throw new Error(`Tema inválido para exportar: ${sanitized.errors.join(', ')}`)
  }
  return JSON.stringify(sanitized.data, null, 2)
}

/**
 * Descarga el tema como archivo JSON en el navegador.
 */
export function descargarTema(tema: TemaConfig, nombreArchivo?: string): void {
  const json = exportarTema(tema)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const slug = (tema.brand.name || 'tema').toLowerCase().replace(/[^a-z0-9]/g, '-')
  a.href = url
  a.download = nombreArchivo ?? `${slug}-theme.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Importa y valida un tema a partir de una cadena JSON.
 */
export function importarTema(jsonString: string): ValidationResult {
  try {
    const parsed = JSON.parse(jsonString)
    return validarTema(parsed)
  } catch {
    return { valid: false, errors: ['El archivo no contiene un JSON sintácticamente válido.'] }
  }
}
