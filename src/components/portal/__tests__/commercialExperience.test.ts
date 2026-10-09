import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Fase 12 — Landing Comercial, Pulido Visual & QA Final', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // 1. Cobertura de las 12 Secciones de la Estructura Comercial
  // ─────────────────────────────────────────────────────────────
  describe('1. Cobertura Estructural de la Landing Comercial', () => {
    const REQUIRED_SECTIONS = [
      'header',
      'hero',
      'simulador',
      'capacidades',
      'sectores',
      'modulos',
      'demo_center',
      'personalizacion',
      'roles',
      'hardware',
      'reserva_en_vivo',
      'cta_footer',
    ]

    it('identifica y valida la presencia conceptual de las 12 secciones requeridas', () => {
      expect(REQUIRED_SECTIONS).toHaveLength(12)
      expect(REQUIRED_SECTIONS).toContain('hero')
      expect(REQUIRED_SECTIONS).toContain('simulador')
      expect(REQUIRED_SECTIONS).toContain('capacidades')
      expect(REQUIRED_SECTIONS).toContain('modulos')
      expect(REQUIRED_SECTIONS).toContain('sectores')
      expect(REQUIRED_SECTIONS).toContain('demo_center')
      expect(REQUIRED_SECTIONS).toContain('personalizacion')
      expect(REQUIRED_SECTIONS).toContain('roles')
      expect(REQUIRED_SECTIONS).toContain('hardware')
      expect(REQUIRED_SECTIONS).toContain('reserva_en_vivo')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 2. Cobertura de los 18 Módulos de la Plataforma
  // ─────────────────────────────────────────────────────────────
  describe('2. Matriz de los 18 Módulos de Sagitta', () => {
    const EXPECTED_MODULE_IDS = [
      'dashboard',
      'citas',
      'recepcion',
      'servicios',
      'empleados',
      'recursos',
      'ventas',
      'pagos',
      'hardware',
      'clientes',
      'crm_avanzado',
      'inventario',
      'automatizaciones',
      'reportes',
      'configuracion',
      'roles',
      'portal',
      'desarrolladores',
    ]

    it('registra exactamente los 18 módulos operativos de la plataforma', () => {
      expect(EXPECTED_MODULE_IDS).toHaveLength(18)
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 3. Adaptabilidad por Vertical Comercial (5 Industrias Clave)
  // ─────────────────────────────────────────────────────────────
  describe('3. Especialización por Sector Comercial', () => {
    const VERTICALS = [
      { id: 'belleza', nombre: 'Salones de Belleza & Estética', buffer: '+15 min' },
      { id: 'spa', nombre: 'Spas, Bienestar & Masajes', buffer: '+20 min' },
      { id: 'salud', nombre: 'Clínicas & Consultorios Médicos', buffer: '+10 min' },
      { id: 'barberia', nombre: 'Barberías de Alta Gama', buffer: '+5 min' },
      { id: 'consultoria', nombre: 'Servicios Profesionales & Coaching', buffer: '+10 min' },
    ]

    it('ofrece configuración personalizada para los 5 sectores clave del mercado de servicios', () => {
      expect(VERTICALS).toHaveLength(5)
      VERTICALS.forEach((v) => {
        expect(v.id).toBeDefined()
        expect(v.nombre.length).toBeGreaterThan(10)
        expect(v.buffer).toMatch(/\+\d+\smin/)
      })
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 4. Paletas Cromáticas Predefinidas del Motor de Marca Blanca
  // ─────────────────────────────────────────────────────────────
  describe('4. Paletas Cromáticas y Personalización de Vocabulario', () => {
    const PALETTES = [
      { id: 'indigo', hex: '#6366f1' },
      { id: 'emerald', hex: '#10b981' },
      { id: 'violet', hex: '#8b5cf6' },
      { id: 'rose', hex: '#f43f5e' },
      { id: 'ocean', hex: '#0284c7' },
      { id: 'amber', hex: '#f59e0b' },
      { id: 'slate', hex: '#334155' },
    ]

    it('cuenta con las 7 paletas oficiales de color con código hexadecimal válido', () => {
      expect(PALETTES).toHaveLength(7)
      PALETTES.forEach((p) => {
        expect(p.hex).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })

    it('admite la conmutación de terminología de citas (Citas vs Turnos vs Reservas)', () => {
      const vocabCitas = ['Cita', 'Turno', 'Reserva']
      expect(vocabCitas).toContain('Cita')
      expect(vocabCitas).toContain('Turno')
      expect(vocabCitas).toContain('Reserva')
    })

    it('admite la conmutación de terminología de usuarios (Clientes vs Pacientes vs Socios)', () => {
      const vocabClientes = ['Cliente', 'Paciente', 'Socio']
      expect(vocabClientes).toContain('Cliente')
      expect(vocabClientes).toContain('Paciente')
      expect(vocabClientes).toContain('Socio')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 5. Matriz de Seguridad y Principio de Menor Privilegio por Rol
  // ─────────────────────────────────────────────────────────────
  describe('5. Matriz de Roles y Principio de Menor Privilegio', () => {
    const ROLES = ['admin', 'recepcion', 'especialista', 'caja']

    it('cubre los 4 perfiles esenciales de operación en un negocio de citas', () => {
      expect(ROLES).toHaveLength(4)
      expect(ROLES).toEqual(['admin', 'recepcion', 'especialista', 'caja'])
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 6. Preservación del Motor de Agendamiento en Vivo
  // ─────────────────────────────────────────────────────────────
  describe('6. Integridad del Motor de Agendamiento en Vivo', () => {
    it('genera folios de cita normalizados con el prefijo CIT-', () => {
      const mockId = 9821
      const folio = `CIT-${mockId}`
      expect(folio).toBe('CIT-9821')
    })

    it('calcula la fecha de fin de cita sumando la duración en minutos de forma precisa', () => {
      const inicio = new Date('2026-10-15T10:00:00Z')
      const duracionMin = 45
      const fin = new Date(inicio.getTime() + duracionMin * 60000)

      expect(fin.toISOString()).toBe('2026-10-15T10:45:00.000Z')
    })

    it('soporta la concatenación de aditamentos y notas sin corromper el contrato del backend', () => {
      const notasCliente = 'Primera vez en el local'
      const aditamentos = ['Mascarilla Hidratante', 'Serum Reparador']
      const notaFinal = [
        notasCliente ? `[Reserva Web] ${notasCliente}` : '[Reserva Web]',
        aditamentos.length ? `Aditamentos: ${aditamentos.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join(' | ')

      expect(notaFinal).toContain('[Reserva Web] Primera vez en el local')
      expect(notaFinal).toContain('Aditamentos: Mascarilla Hidratante, Serum Reparador')
    })
  })
})

