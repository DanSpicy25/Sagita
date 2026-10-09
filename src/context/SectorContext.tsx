import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'

export type SectorId = 'gastronomia' | 'retail' | 'farmacia' | 'spa'

export interface SectorVocabulario {
  unidad: string
  item: string
  stock: string
  accionPrincipal: string
  cola: string
  singularUnidad: string
  singularItem: string
  accionCompletar: string
  metricLabel1: string
  metricLabel2: string
  metricLabel3: string
}

export interface SectorDesignTokens {
  id: SectorId
  nombre: string
  tagline: string
  accentColor: string
  accentHover: string
  accentSoft: string
  accentGlow: string
  accentLight: string
  accentBorder: string
  bgDark: string
  bgLight: string
  surfaceDark: string
  surfaceLight: string
  radiusClass: string
  radiusPixels: string
  typographyTag: string
  iconEmoji: string
  radialGlow: string
  badgeClass: string
}

export interface SectorMockItem {
  id: string
  nombre: string
  categoria: string
  precio: number
  codigo: string
  stockOAtributo: string
  notaTecnica: string
  tiempoMin: number
}

export interface SectorMockOrder {
  id: string
  clienteOIdentificador: string
  hora: string
  items: { nombre: string; cantidad: number; precio: number }[]
  total: number
  estado: 'en_cola' | 'en_preparacion' | 'listo' | 'completado'
  tagOExtra: string
}

export interface SectorPreset {
  vocabulario: SectorVocabulario
  tokens: SectorDesignTokens
  mockItems: SectorMockItem[]
  mockOrders: SectorMockOrder[]
}

export const SECTOR_PRESETS: Record<SectorId, SectorPreset> = {
  gastronomia: {
    vocabulario: {
      unidad: 'Comanda / Mesa',
      item: 'Platillo / Menú',
      stock: 'Receta & Insumos',
      accionPrincipal: 'Despachar KDS',
      cola: 'Cola de Cocina',
      singularUnidad: 'Comanda',
      singularItem: 'Platillo',
      accionCompletar: 'Despachado a Salón',
      metricLabel1: 'Facturación KDS Hoy',
      metricLabel2: 'Comandas en Cocina',
      metricLabel3: 'Insumos en Mínimo',
    },
    tokens: {
      id: 'gastronomia',
      nombre: 'Gastronomía',
      tagline: 'Cocina de alta velocidad, KDS táctil y recetas BOM',
      accentColor: '#f97316',
      accentHover: '#ea580c',
      accentSoft: 'rgba(249, 115, 22, 0.1)',
      accentGlow: 'none',
      accentLight: '#ffedd5',
      accentBorder: 'rgba(249, 115, 22, 0.25)',
      bgDark: '#0A0A0C',
      bgLight: '#F4F4F5',
      surfaceDark: '#121214',
      surfaceLight: '#FFFFFF',
      radiusClass: 'rounded-xl',
      radiusPixels: '12px',
      typographyTag: 'Sans de alto impacto',
      iconEmoji: '🍔',
      radialGlow: 'none',
      badgeClass: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    },
    mockItems: [
      {
        id: 'g-1',
        nombre: 'Hamburguesa Trufada',
        categoria: 'Principales',
        precio: 16.0,
        codigo: '#KDS-01',
        stockOAtributo: 'BOM: Carne Angus 180g, salsa trufa',
        notaTecnica: 'Punto de cocción: Medio jugoso. Sin cebolla a pedido.',
        tiempoMin: 8,
      },
      {
        id: 'g-2',
        nombre: 'Papas Rústicas',
        categoria: 'Guarniciones',
        precio: 6.5,
        codigo: '#KDS-02',
        stockOAtributo: 'Stock: 42 porciones fritura',
        notaTecnica: 'Corte artesanal con romero y flor de sal.',
        tiempoMin: 5,
      },
      {
        id: 'g-3',
        nombre: 'Tacos de Birria de Res (3 pzas)',
        categoria: 'Especialidades',
        precio: 12.0,
        codigo: '#KDS-03',
        stockOAtributo: 'Receta: Olla cocción lenta 8h',
        notaTecnica: 'Servir con cilantro picado, lima y salsa verde.',
        tiempoMin: 6,
      },
      {
        id: 'g-4',
        nombre: 'Bebida Artesanal 500ml',
        categoria: 'Bebidas',
        precio: 4.0,
        codigo: '#KDS-04',
        stockOAtributo: 'Insumo: Pulpa natural 85%',
        notaTecnica: 'Limón y menta orgánica.',
        tiempoMin: 2,
      },
    ],
    mockOrders: [
      {
        id: 'COM-104',
        clienteOIdentificador: 'Mesa 4',
        hora: '14:22',
        items: [
          { nombre: 'Hamburguesa Trufada', cantidad: 2, precio: 16.0 },
          { nombre: 'Papas Rústicas', cantidad: 1, precio: 6.5 },
        ],
        total: 38.5,
        estado: 'en_preparacion',
        tagOExtra: 'Mesa 4 • En Cocina',
      },
      {
        id: 'COM-105',
        clienteOIdentificador: 'Mesa 2',
        hora: '14:28',
        items: [
          { nombre: 'Tacos de Birria de Res', cantidad: 1, precio: 12.0 },
          { nombre: 'Bebida Artesanal', cantidad: 1, precio: 4.0 },
        ],
        total: 16.0,
        estado: 'en_cola',
        tagOExtra: 'Mesa 2 • En Cola',
      },
    ],
  },
  retail: {
    vocabulario: {
      unidad: 'Ticket Mostrador',
      item: 'Prenda / Modelo',
      stock: 'Tallas & Colores',
      accionPrincipal: 'Escanear Código',
      cola: 'Línea de Caja',
      singularUnidad: 'Ticket',
      singularItem: 'Prenda',
      accionCompletar: 'Cobrado & Embolsado',
      metricLabel1: 'Facturación Mostrador',
      metricLabel2: 'Tickets en Fila',
      metricLabel3: 'Prendas sin Stock',
    },
    tokens: {
      id: 'retail',
      nombre: 'Retail & Moda',
      tagline: 'Control de tallas, colores, código de barras y probadores',
      accentColor: '#6366f1',
      accentHover: '#4f46e5',
      accentSoft: 'rgba(99, 102, 241, 0.1)',
      accentGlow: 'none',
      accentLight: '#e0e7ff',
      accentBorder: 'rgba(99, 102, 241, 0.25)',
      bgDark: '#0A0A0C',
      bgLight: '#F4F4F5',
      surfaceDark: '#121214',
      surfaceLight: '#FFFFFF',
      radiusClass: 'rounded-xl',
      radiusPixels: '12px',
      typographyTag: 'Minimalista refinado',
      iconEmoji: '👗',
      radialGlow: 'none',
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    },
    mockItems: [
      {
        id: 'r-1',
        nombre: 'Hoodie Oversize M',
        categoria: 'Abrigos',
        precio: 52.0,
        codigo: '#SKU-HOD01',
        stockOAtributo: 'Algodón grueso 380g, lavado mineral',
        notaTecnica: 'Corte relajado unisex preencogido.',
        tiempoMin: 1,
      },
      {
        id: 'r-2',
        nombre: 'Jeans Denim 32',
        categoria: 'Pantalones',
        precio: 42.0,
        codigo: '#SKU-JNS02',
        stockOAtributo: 'Corte clásico tiro medio',
        notaTecnica: 'Tejido denim 13oz con remaches de latón.',
        tiempoMin: 1,
      },
      {
        id: 'r-3',
        nombre: 'Camiseta Básica Pima (L)',
        categoria: 'Básicos',
        precio: 24.0,
        codigo: '#SKU-TSH03',
        stockOAtributo: '100% Algodón pima peinado',
        notaTecnica: 'Gramaje 220g preencogido.',
        tiempoMin: 1,
      },
      {
        id: 'r-4',
        nombre: 'Gorra Canvas Reforzada',
        categoria: 'Accesorios',
        precio: 18.0,
        codigo: '#SKU-CAP04',
        stockOAtributo: 'Hebilla metálica ajustable',
        notaTecnica: 'Tejido canvas encerado anti-desgaste.',
        tiempoMin: 1,
      },
    ],
    mockOrders: [
      {
        id: 'TCK-208',
        clienteOIdentificador: 'Caja 1',
        hora: '14:26',
        items: [
          { nombre: 'Hoodie Oversize M', cantidad: 1, precio: 52.0 },
          { nombre: 'Jeans Denim 32', cantidad: 1, precio: 42.0 },
        ],
        total: 94.0,
        estado: 'completado',
        tagOExtra: 'Caja 1 • Cobrado',
      },
      {
        id: 'TCK-209',
        clienteOIdentificador: 'Caja 2',
        hora: '14:31',
        items: [{ nombre: 'Camiseta Básica Pima (L)', cantidad: 1, precio: 24.0 }],
        total: 24.0,
        estado: 'en_cola',
        tagOExtra: 'Pago con tarjeta POS',
      },
    ],
  },
  farmacia: {
    vocabulario: {
      unidad: 'Dispensación',
      item: 'Medicamento / Fármaco',
      stock: 'Lotes & Vencimientos',
      accionPrincipal: 'Verificar Receta',
      cola: 'Mostrador Ético',
      singularUnidad: 'Dispensación',
      singularItem: 'Medicamento',
      accionCompletar: 'Validado & Entregado',
      metricLabel1: 'Dispensaciones del Turno',
      metricLabel2: 'Recetas en Validación',
      metricLabel3: 'Lotes Próximos a Vencer',
    },
    tokens: {
      id: 'farmacia',
      nombre: 'Farmacia',
      tagline: 'Dispensación ética, trazabilidad de lotes y control de recetas',
      accentColor: '#10b981',
      accentHover: '#059669',
      accentSoft: 'rgba(16, 185, 129, 0.1)',
      accentGlow: 'none',
      accentLight: '#d1fae5',
      accentBorder: 'rgba(16, 185, 129, 0.25)',
      bgDark: '#0A0A0C',
      bgLight: '#F4F4F5',
      surfaceDark: '#121214',
      surfaceLight: '#FFFFFF',
      radiusClass: 'rounded-lg',
      radiusPixels: '12px',
      typographyTag: 'Técnico farmacológico',
      iconEmoji: '💊',
      radialGlow: 'none',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    mockItems: [
      {
        id: 'f-1',
        nombre: 'Amoxicilina 875mg',
        categoria: 'Antibióticos',
        precio: 14.8,
        codigo: '#CN-718293',
        stockOAtributo: 'Lote #LT-8821 (Vence: 11/2027) • 34 cajas',
        notaTecnica: 'Exige verificación farmacéutica.',
        tiempoMin: 2,
      },
      {
        id: 'f-2',
        nombre: 'Suero Rehidratante Oral',
        categoria: 'Electrolitos',
        precio: 7.3,
        codigo: '#CN-102938',
        stockOAtributo: 'Frasco 500ml electrolitos',
        notaTecnica: 'Almacenar a menos de 25°C.',
        tiempoMin: 1,
      },
      {
        id: 'f-3',
        nombre: 'Paracetamol 500mg',
        categoria: 'Analgésicos',
        precio: 4.5,
        codigo: '#CN-441209',
        stockOAtributo: 'Lote #L-998 (Vence: 04/2028) • 18 frascos',
        notaTecnica: 'Sin receta requerida.',
        tiempoMin: 1,
      },
      {
        id: 'f-4',
        nombre: 'Termómetro Infrarrojo Digital',
        categoria: 'Dispositivos',
        precio: 28.0,
        codigo: '#CN-908123',
        stockOAtributo: 'Garantía 2 años • 6 unidades',
        notaTecnica: 'Sensor digital de frente y oído.',
        tiempoMin: 2,
      },
    ],
    mockOrders: [
      {
        id: 'DISP-512',
        clienteOIdentificador: 'Mostrador A',
        hora: '14:20',
        items: [
          { nombre: 'Amoxicilina 875mg', cantidad: 1, precio: 14.8 },
          { nombre: 'Suero Rehidratante Oral', cantidad: 1, precio: 7.3 },
        ],
        total: 22.1,
        estado: 'completado',
        tagOExtra: 'Mostrador A • Dispensado',
      },
      {
        id: 'DISP-513',
        clienteOIdentificador: 'Mostrador B',
        hora: '14:27',
        items: [
          { nombre: 'Paracetamol 500mg', cantidad: 1, precio: 4.5 },
          { nombre: 'Suero Rehidratante Oral', cantidad: 1, precio: 7.3 },
        ],
        total: 11.8,
        estado: 'en_cola',
        tagOExtra: 'Pago en efectivo',
      },
    ],
  },
  spa: {
    vocabulario: {
      unidad: 'Cita / Sesión',
      item: 'Tratamiento',
      stock: 'Cabinas & Protocolos',
      accionPrincipal: 'Iniciar Cita',
      cola: 'Recepción Zen',
      singularUnidad: 'Sesión',
      singularItem: 'Tratamiento',
      accionCompletar: 'Sesión Completada',
      metricLabel1: 'Ingresos de Cabina',
      metricLabel2: 'Sesiones en Espera',
      metricLabel3: 'Cabinas Ocupadas',
    },
    tokens: {
      id: 'spa',
      nombre: 'Bienestar & Spa',
      tagline: 'Relajación, cromoterapia, cabinas privadas y fórmulas cosméticas',
      accentColor: '#ec4899',
      accentHover: '#db2777',
      accentSoft: 'rgba(236, 72, 153, 0.1)',
      accentGlow: 'none',
      accentLight: '#fce7f3',
      accentBorder: 'rgba(236, 72, 153, 0.25)',
      bgDark: '#0A0A0C',
      bgLight: '#F4F4F5',
      surfaceDark: '#121214',
      surfaceLight: '#FFFFFF',
      radiusClass: 'rounded-3xl',
      radiusPixels: '16px',
      typographyTag: 'Lujo sutil y orgánico',
      iconEmoji: '🌿',
      radialGlow: 'none',
      badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    },
    mockItems: [
      {
        id: 's-1',
        nombre: 'Masaje Relajante 60min',
        categoria: 'Masoterapia',
        precio: 75.0,
        codigo: '#SRV-SPA01',
        stockOAtributo: 'Cabina Zen • Aceite Romero & Lavanda',
        notaTecnica: 'Temperatura ambiente 24°C con música relajante 432Hz.',
        tiempoMin: 60,
      },
      {
        id: 's-2',
        nombre: 'Higiene Facial Profunda',
        categoria: 'Faciales',
        precio: 55.0,
        codigo: '#SRV-SPA02',
        stockOAtributo: 'Cabina 1 • Mascarilla Ácido Hialurónico',
        notaTecnica: 'Punta de diamante con hidratación profunda.',
        tiempoMin: 50,
      },
      {
        id: 's-3',
        nombre: 'Exfoliación Corporal Bambú',
        categoria: 'Corporales',
        precio: 45.0,
        codigo: '#SRV-SPA03',
        stockOAtributo: 'Sales minerales y manteca de karité',
        notaTecnica: 'Exfoliación suave con aclarado térmico.',
        tiempoMin: 40,
      },
      {
        id: 's-4',
        nombre: 'Sesión Hidroterapia 30min',
        categoria: 'Aguas',
        precio: 35.0,
        codigo: '#SRV-SPA04',
        stockOAtributo: 'Jacuzzi con aromaterapia eucalipto',
        notaTecnica: 'Incluye infusión botánica de cortesía.',
        tiempoMin: 30,
      },
    ],
    mockOrders: [
      {
        id: 'SES-301',
        clienteOIdentificador: 'Cabina Zen',
        hora: '14:30',
        items: [
          { nombre: 'Masaje Relajante 60min', cantidad: 1, precio: 75.0 },
        ],
        total: 75.0,
        estado: 'en_preparacion',
        tagOExtra: 'Cabina Zen • En Sesión',
      },
      {
        id: 'SES-302',
        clienteOIdentificador: 'Cabina 2',
        hora: '15:15',
        items: [
          { nombre: 'Higiene Facial Profunda', cantidad: 1, precio: 55.0 },
        ],
        total: 55.0,
        estado: 'en_cola',
        tagOExtra: 'Recepción Zen',
      },
    ],
  },
}

export interface SectorContextType {
  sector: SectorId
  setSector: (id: SectorId) => void
  vocabulario: SectorVocabulario
  tokens: SectorDesignTokens
  mockItems: SectorMockItem[]
  mockOrders: SectorMockOrder[]
  allSectors: { id: SectorId; nombre: string; iconEmoji: string }[]
  streakCount: number
  incrementStreak: () => void
  resetStreak: () => void
  playTactileClick: () => void
}

const SectorContext = createContext<SectorContextType | undefined>(undefined)

const SECTOR_STORAGE_KEY = 'sagitta_active_sector'
const STREAK_STORAGE_KEY = 'sagitta_daily_streak'
const SECTOR_UPDATED_EVENT = 'sagitta:sector-updated'

/**
 * Sintetizador Web Audio API puro para respuesta háptica auditiva (click mecánico suave).
 * Cero dependencias externas de audio.
 */
export function playSynthesizedHapticClick() {
  try {
    if (typeof window === 'undefined') return
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(820, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.035)

    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.035)
  } catch {
    // Fallback silencioso en navegadores sin permisos de audio
  }
}

export function SectorProvider({ children }: { children: React.ReactNode }) {
  const [sector, setSectorState] = useState<SectorId>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(SECTOR_STORAGE_KEY) as SectorId
        if (saved && SECTOR_PRESETS[saved]) return saved
      }
    } catch {
      // Ignorar
    }
    return 'gastronomia'
  })

  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STREAK_STORAGE_KEY)
        if (saved) return parseInt(saved, 10) || 0
      }
    } catch {
      // Ignorar
    }
    return 18
  })

  // Sincronizar variables CSS dinámicas en :root según el sector activo
  useEffect(() => {
    try {
      const activePreset = SECTOR_PRESETS[sector]
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        root.style.setProperty('--sector-accent', activePreset.tokens.accentColor)
        root.style.setProperty('--sector-glow', activePreset.tokens.accentGlow)
        root.style.setProperty('--sector-radius', activePreset.tokens.radiusPixels)
      }
    } catch {
      // Ignorar en entornos de prueba
    }
  }, [sector])

  const setSector = useCallback((newSector: SectorId) => {
    if (!SECTOR_PRESETS[newSector]) return
    setSectorState(newSector)
    playSynthesizedHapticClick()
    try {
      localStorage.setItem(SECTOR_STORAGE_KEY, newSector)
      window.dispatchEvent(new CustomEvent(SECTOR_UPDATED_EVENT, { detail: newSector }))
    } catch {
      // Ignorar
    }
  }, [])

  const incrementStreak = useCallback(() => {
    setStreakCount((prev) => {
      const next = prev + 1
      try {
        localStorage.setItem(STREAK_STORAGE_KEY, String(next))
      } catch {
        // Ignorar
      }
      return next
    })
    playSynthesizedHapticClick()
  }, [])

  const resetStreak = useCallback(() => {
    setStreakCount(0)
    try {
      localStorage.setItem(STREAK_STORAGE_KEY, '0')
    } catch {
      // Ignorar
    }
  }, [])

  const playTactileClick = useCallback(() => {
    playSynthesizedHapticClick()
  }, [])

  const allSectors = useMemo(
    () => [
      { id: 'gastronomia' as SectorId, nombre: 'Gastronomía & Comida Rápida', iconEmoji: '🍔' },
      { id: 'retail' as SectorId, nombre: 'Retail & Moda', iconEmoji: '👗' },
      { id: 'farmacia' as SectorId, nombre: 'Farmacias', iconEmoji: '💊' },
      { id: 'spa' as SectorId, nombre: 'Spas & Estética', iconEmoji: '🌿' },
    ],
    []
  )

  const activePreset = SECTOR_PRESETS[sector]

  const value = useMemo(
    () => ({
      sector,
      setSector,
      vocabulario: activePreset.vocabulario,
      tokens: activePreset.tokens,
      mockItems: activePreset.mockItems,
      mockOrders: activePreset.mockOrders,
      allSectors,
      streakCount,
      incrementStreak,
      resetStreak,
      playTactileClick,
    }),
    [sector, setSector, activePreset, allSectors, streakCount, incrementStreak, resetStreak, playTactileClick]
  )

  return <SectorContext.Provider value={value}>{children}</SectorContext.Provider>
}

export function useSector(): SectorContextType {
  const context = useContext(SectorContext)
  if (!context) {
    // Fallback defensivo que provee Gastronomía si se consume fuera de SectorProvider
    const fallback = SECTOR_PRESETS.gastronomia
    return {
      sector: 'gastronomia',
      setSector: () => {},
      vocabulario: fallback.vocabulario,
      tokens: fallback.tokens,
      mockItems: fallback.mockItems,
      mockOrders: fallback.mockOrders,
      allSectors: [
        { id: 'gastronomia', nombre: 'Gastronomía & Comida Rápida', iconEmoji: '🍔' },
        { id: 'retail', nombre: 'Retail & Moda', iconEmoji: '👗' },
        { id: 'farmacia', nombre: 'Farmacias', iconEmoji: '💊' },
        { id: 'spa', nombre: 'Spas & Estética', iconEmoji: '🌿' },
      ],
      streakCount: 18,
      incrementStreak: () => {},
      resetStreak: () => {},
      playTactileClick: () => {},
    }
  }
  return context
}
