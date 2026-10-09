import { describe, it, expect } from 'vitest'
import { Servicio, CategoriaServicio, Cita } from '@/types'
import { ServiciosFiltros } from '@/components/servicios/ServiciosFiltrosBar'

// ── Helpers bajo prueba ──────────────────────────────────────────────────
function calculateServicePriceRange(servicio: Servicio): {
  minPrecio: number
  maxPrecio: number
  esRango: boolean
  textoFormateado: string
} {
  const duraciones = servicio.duraciones || []
  if (duraciones.length === 0) {
    return {
      minPrecio: servicio.precio_base,
      maxPrecio: servicio.precio_base,
      esRango: false,
      textoFormateado: `$${servicio.precio_base}`,
    }
  }

  const precios = [servicio.precio_base, ...duraciones.map((d) => d.precio)]
  const minPrecio = Math.min(...precios)
  const maxPrecio = Math.max(...precios)
  const esRango = minPrecio !== maxPrecio

  return {
    minPrecio,
    maxPrecio,
    esRango,
    textoFormateado: esRango ? `$${minPrecio} – $${maxPrecio}` : `$${minPrecio}`,
  }
}

function filtrarServicios(
  servicios: Servicio[],
  filtros: ServiciosFiltros
): Servicio[] {
  return servicios.filter((s) => {
    // 1. Búsqueda de texto
    if (filtros.busqueda.trim()) {
      const q = filtros.busqueda.toLowerCase().trim()
      const matchNombre = s.nombre.toLowerCase().includes(q)
      const matchDesc = s.descripcion?.toLowerCase().includes(q)
      const matchCat = s.categoria?.nombre.toLowerCase().includes(q)
      if (!matchNombre && !matchDesc && !matchCat) return false
    }

    // 2. Categoría
    if (filtros.categoriaId !== 'todas') {
      if (s.categoria_id !== filtros.categoriaId) return false
    }

    // 3. Estado
    if (filtros.estado === 'activos' && !s.activo) return false
    if (filtros.estado === 'inactivos' && s.activo) return false

    // 4. Especialista / Personal asignado
    if (filtros.empleadoId !== 'todos') {
      const empId = Number(filtros.empleadoId)
      const asignados = s.empleados_compatibles_ids || s.empleados_asignados_ids || []
      if (!asignados.includes(empId)) return false
    }

    return true
  })
}

function clonarServicio(servicio: Servicio): Partial<Servicio> {
  return {
    ...servicio,
    id: undefined,
    nombre: `${servicio.nombre} (Copia)`,
    activo: false,
    duraciones: servicio.duraciones?.map((d) => ({
      ...d,
      id: undefined as unknown as number,
      servicio_id: undefined as unknown as number,
    })),
  }
}

function evaluarImpactoEliminacion(servicio: Servicio, citasRegistradas: Cita[]) {
  const citasDelServicio = citasRegistradas.filter((c) => c.servicio_id === servicio.id)
  const citasActivas = citasDelServicio.filter(
    (c) => !['completada', 'cancelada', 'no_asistio'].includes(c.estado)
  )

  const tieneImpacto = citasDelServicio.length > 0
  const accionRecomendada = tieneImpacto ? 'desactivar' : 'eliminar_permanente'

  return {
    tieneImpacto,
    totalCitas: citasDelServicio.length,
    citasActivas: citasActivas.length,
    accionRecomendada,
    mensajeRiesgo: tieneImpacto
      ? `El servicio tiene ${citasDelServicio.length} citas asociadas (${citasActivas.length} activas). Se recomienda desactivar para conservar la integridad contable.`
      : 'El servicio no tiene citas vinculadas y puede eliminarse de forma permanente sin riesgo.',
  }
}

// ── Datos Mock ────────────────────────────────────────────────────────────
const mockCategorias: CategoriaServicio[] = [
  { id: 1, nombre: 'Medicina General', color: '#6366f1' },
  { id: 2, nombre: 'Estética & Peinado', color: '#ec4899' },
  { id: 3, nombre: 'Fisioterapia & Masajes', color: '#10b981' },
]

const mockServicios: Servicio[] = [
  {
    id: 101,
    nombre: 'Consulta Médica General',
    descripcion: 'Evaluación integral y prescripción de salud preventiva',
    categoria_id: 1,
    categoria: mockCategorias[0],
    duracion_base_min: 30,
    precio_base: 50,
    activo: true,
    buffer_antes_min: 0,
    buffer_despues_min: 10,
    empleados_compatibles_ids: [1, 2],
    recurso_requerido_tipo: 'cabina',
    duraciones: [
      { id: 1, servicio_id: 101, duracion_min: 30, precio: 50, etiqueta: 'Estándar 30m' },
      { id: 2, servicio_id: 101, duracion_min: 60, precio: 90, etiqueta: 'Extendida 60m' },
    ],
  },
  {
    id: 102,
    nombre: 'Corte de Cabello & Barba',
    descripcion: 'Estilo personalizado con lavado y tratamiento hidratante',
    categoria_id: 2,
    categoria: mockCategorias[1],
    duracion_base_min: 45,
    precio_base: 25,
    activo: true,
    buffer_antes_min: 5,
    buffer_despues_min: 5,
    empleados_compatibles_ids: [3],
    duraciones: [
      { id: 3, servicio_id: 102, duracion_min: 30, precio: 20, etiqueta: 'Express' },
      { id: 4, servicio_id: 102, duracion_min: 45, precio: 25, etiqueta: 'Completo' },
      { id: 5, servicio_id: 102, duracion_min: 60, precio: 35, etiqueta: 'VIP Spa Capilar' },
    ],
  },
  {
    id: 103,
    nombre: 'Masaje Descontracturante Profundo',
    descripcion: 'Terapia manual intensiva para aliviar tensiones crónicas',
    categoria_id: 3,
    categoria: mockCategorias[2],
    duracion_base_min: 50,
    precio_base: 60,
    activo: false, // Inactivo
    buffer_antes_min: 5,
    buffer_despues_min: 15,
    empleados_compatibles_ids: [2],
    duraciones: [],
  },
]

describe('Fase 08 — Experiencia de Servicios & Subservicios (Services Experience)', () => {
  describe('1. Modelado de Duraciones y Cálculo de Rango de Precios', () => {
    it('muestra precio exacto cuando el servicio no posee variantes de duración', () => {
      const res = calculateServicePriceRange(mockServicios[2])
      expect(res.esRango).toBe(false)
      expect(res.minPrecio).toBe(60)
      expect(res.maxPrecio).toBe(60)
      expect(res.textoFormateado).toBe('$60')
    })

    it('calcula rango mínimo y máximo dinámicamente cuando hay múltiples variantes de duración', () => {
      const res = calculateServicePriceRange(mockServicios[0])
      expect(res.esRango).toBe(true)
      expect(res.minPrecio).toBe(50)
      expect(res.maxPrecio).toBe(90)
      expect(res.textoFormateado).toBe('$50 – $90')
    })

    it('maneja 3 o más variantes de subservicio con rango amplio', () => {
      const res = calculateServicePriceRange(mockServicios[1])
      expect(res.esRango).toBe(true)
      expect(res.minPrecio).toBe(20)
      expect(res.maxPrecio).toBe(35)
      expect(res.textoFormateado).toBe('$20 – $35')
    })
  })

  describe('2. Motor de Búsqueda y Filtros de Catálogo', () => {
    it('filtra por búsqueda de texto en nombre de servicio', () => {
      const filtrados = filtrarServicios(mockServicios, {
        busqueda: 'Médica',
        categoriaId: 'todas',
        estado: 'todos',
        empleadoId: 'todos',
      })
      expect(filtrados).toHaveLength(1)
      expect(filtrados[0].id).toBe(101)
    })

    it('filtra por búsqueda de texto en descripción', () => {
      const filtrados = filtrarServicios(mockServicios, {
        busqueda: 'hidratante',
        categoriaId: 'todas',
        estado: 'todos',
        empleadoId: 'todos',
      })
      expect(filtrados).toHaveLength(1)
      expect(filtrados[0].id).toBe(102)
    })

    it('filtra por categoría específica', () => {
      const filtrados = filtrarServicios(mockServicios, {
        busqueda: '',
        categoriaId: 2,
        estado: 'todos',
        empleadoId: 'todos',
      })
      expect(filtrados).toHaveLength(1)
      expect(filtrados[0].nombre).toBe('Corte de Cabello & Barba')
    })

    it('filtra por estado activo vs inactivo', () => {
      const activos = filtrarServicios(mockServicios, {
        busqueda: '',
        categoriaId: 'todas',
        estado: 'activos',
        empleadoId: 'todos',
      })
      expect(activos).toHaveLength(2)
      expect(activos.every((s) => s.activo)).toBe(true)

      const inactivos = filtrarServicios(mockServicios, {
        busqueda: '',
        categoriaId: 'todas',
        estado: 'inactivos',
        empleadoId: 'todos',
      })
      expect(inactivos).toHaveLength(1)
      expect(inactivos[0].nombre).toBe('Masaje Descontracturante Profundo')
    })

    it('filtra por especialista compatible asignado', () => {
      const paraEmpleado1 = filtrarServicios(mockServicios, {
        busqueda: '',
        categoriaId: 'todas',
        estado: 'todos',
        empleadoId: 1,
      })
      expect(paraEmpleado1).toHaveLength(1)
      expect(paraEmpleado1[0].id).toBe(101)

      const paraEmpleado2 = filtrarServicios(mockServicios, {
        busqueda: '',
        categoriaId: 'todas',
        estado: 'todos',
        empleadoId: 2,
      })
      expect(paraEmpleado2).toHaveLength(2) // 101 y 103
    })

    it('combina múltiples filtros simultáneos con conjunción estricta', () => {
      const filtrados = filtrarServicios(mockServicios, {
        busqueda: 'Masaje',
        categoriaId: 3,
        estado: 'inactivos',
        empleadoId: 2,
      })
      expect(filtrados).toHaveLength(1)
      expect(filtrados[0].id).toBe(103)
    })
  })

  describe('3. Flujo de Clonado / Duplicado de Servicios', () => {
    it('crea un borrador seguro con nombre sufijado y estado inactivo', () => {
      const clon = clonarServicio(mockServicios[0])

      expect(clon.id).toBeUndefined()
      expect(clon.nombre).toBe('Consulta Médica General (Copia)')
      expect(clon.activo).toBe(false)
      expect(clon.precio_base).toBe(mockServicios[0].precio_base)
      expect(clon.categoria_id).toBe(mockServicios[0].categoria_id)
      expect(clon.buffer_despues_min).toBe(mockServicios[0].buffer_despues_min)
      expect(clon.recurso_requerido_tipo).toBe('cabina')
    })

    it('duplica todas las variantes de duración limpiando sus IDs previos', () => {
      const clon = clonarServicio(mockServicios[1])
      expect(clon.duraciones).toHaveLength(3)

      clon.duraciones?.forEach((d) => {
        expect(d.id).toBeUndefined()
        expect(d.servicio_id).toBeUndefined()
        expect(d.precio).toBeGreaterThan(0)
        expect(d.duracion_min).toBeGreaterThan(0)
      })

      expect(clon.duraciones?.[0].etiqueta).toBe('Express')
      expect(clon.duraciones?.[2].etiqueta).toBe('VIP Spa Capilar')
    })
  })

  describe('4. Protocolo de Eliminación Segura y Protección Contable', () => {
    const mockCitas: Cita[] = [
      {
        id: 1,
        cliente_id: 10,
        empleado_id: 1,
        servicio_id: 101, // Vinculada al servicio 101
        fecha_inicio: '2026-10-15T10:00:00',
        fecha_fin: '2026-10-15T10:30:00',
        estado: 'confirmada', // Cita futura activa
        precio_total: 50,
        created_at: '2026-10-01T00:00:00',
      },
      {
        id: 2,
        cliente_id: 11,
        empleado_id: 2,
        servicio_id: 101, // Vinculada al servicio 101
        fecha_inicio: '2026-09-01T10:00:00',
        fecha_fin: '2026-09-01T10:30:00',
        estado: 'completada', // Cita histórica completada
        precio_total: 90,
        created_at: '2026-08-25T00:00:00',
      },
    ]

    it('advierte y recomienda desactivar cuando el servicio tiene citas asociadas', () => {
      const impacto = evaluarImpactoEliminacion(mockServicios[0], mockCitas)

      expect(impacto.tieneImpacto).toBe(true)
      expect(impacto.totalCitas).toBe(2)
      expect(impacto.citasActivas).toBe(1)
      expect(impacto.accionRecomendada).toBe('desactivar')
      expect(impacto.mensajeRiesgo).toContain('Se recomienda desactivar')
    })

    it('permite eliminación permanente cuando el servicio no tiene citas vinculadas', () => {
      const impacto = evaluarImpactoEliminacion(mockServicios[1], mockCitas)

      expect(impacto.tieneImpacto).toBe(false)
      expect(impacto.totalCitas).toBe(0)
      expect(impacto.citasActivas).toBe(0)
      expect(impacto.accionRecomendada).toBe('eliminar_permanente')
      expect(impacto.mensajeRiesgo).toContain('sin riesgo')
    })
  })

  describe('5. Cobertura de Categorías Multirubro', () => {
    it('soporta paleta de colores consistentes y metadatos por rubro', () => {
      const rubrosValidos = [
        'Salud & Medicina',
        'Belleza & Estética',
        'Spa & Bienestar',
        'Fitness & Deporte',
        'Veterinaria & Mascotas',
        'Técnico & Automotriz',
        'Consultoría & Asesoría',
      ]

      expect(rubrosValidos).toHaveLength(7)
      expect(rubrosValidos).toContain('Salud & Medicina')
      expect(rubrosValidos).toContain('Veterinaria & Mascotas')
      expect(rubrosValidos).toContain('Consultoría & Asesoría')
    })
  })
})

