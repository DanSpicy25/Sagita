import { ApiResponse, Servicio, CategoriaServicio } from '@/types'
import { IServiceRepository } from '../interfaces/IServiceRepository'
import { LocalStorageAdapter } from './LocalStorageAdapter'

const SEED_CATEGORIAS: CategoriaServicio[] = [
  { id: 1, nombre: 'Consultas & Evaluación', color: '#6366f1', icono: 'stethoscope', descripcion: 'Evaluaciones y citas de primera vez' },
  { id: 2, nombre: 'Tratamientos & Procedimientos', color: '#ec4899', icono: 'sparkles', descripcion: 'Sesiones técnicas especializadas' },
  { id: 3, nombre: 'Bienestar & Cuidado', color: '#10b981', icono: 'heart', descripcion: 'Servicios de relajación y mantenimiento' },
]

const SEED_SERVICIOS: Servicio[] = [
  {
    id: 1,
    nombre: 'Consulta General Especializada',
    categoria_id: 1,
    descripcion: 'Evaluación integral con diagnóstico y plan de atención personalizado.',
    duracion_base_min: 30,
    precio_base: 50,
    color: '#6366f1',
    activo: true,
    buffer_antes_min: 5,
    buffer_despues_min: 10,
    recurso_requerido_tipo: 'sala',
    capacidad_maxima: 1,
    visible_portal_publico: true,
    empleados_compatibles_ids: [1, 2],
    duraciones: [
      { id: 11, servicio_id: 1, duracion_min: 30, precio: 50, etiqueta: 'Consulta Estándar (30 min)' },
      { id: 12, servicio_id: 1, duracion_min: 60, precio: 90, etiqueta: 'Consulta Completa + Informe (60 min)' },
    ],
  },
  {
    id: 2,
    nombre: 'Limpieza Facial Profunda',
    categoria_id: 2,
    descripcion: 'Tratamiento dermocosmético con exfoliación, extracción e hidratación profunda.',
    duracion_base_min: 60,
    precio_base: 75,
    color: '#ec4899',
    activo: true,
    buffer_antes_min: 10,
    buffer_despues_min: 15,
    recurso_requerido_tipo: 'cabina',
    capacidad_maxima: 1,
    visible_portal_publico: true,
    requiere_deposito: true,
    tipo_deposito: 'porcentaje',
    monto_deposito: 20,
    empleados_compatibles_ids: [2],
    duraciones: [
      { id: 21, servicio_id: 2, duracion_min: 45, precio: 65, etiqueta: 'Express Purificante (45 min)' },
      { id: 22, servicio_id: 2, duracion_min: 60, precio: 75, etiqueta: 'Profunda Hidratante (60 min)' },
      { id: 23, servicio_id: 2, duracion_min: 90, precio: 110, etiqueta: 'Tratamiento Premium Antiedad (90 min)' },
    ],
  },
  {
    id: 3,
    nombre: 'Masaje Terapéutico Descontracturante',
    categoria_id: 3,
    descripcion: 'Terapia manual enfocada en aliviar sobrecargas musculares y estrés físico.',
    duracion_base_min: 45,
    precio_base: 60,
    color: '#10b981',
    activo: true,
    buffer_antes_min: 5,
    buffer_despues_min: 10,
    recurso_requerido_tipo: 'cabina',
    capacidad_maxima: 1,
    visible_portal_publico: true,
    empleados_compatibles_ids: [3],
    duraciones: [
      { id: 31, servicio_id: 3, duracion_min: 30, precio: 45, etiqueta: 'Zona Focal: Espalda & Cuello (30 min)' },
      { id: 32, servicio_id: 3, duracion_min: 60, precio: 75, etiqueta: 'Cuerpo Completo (60 min)' },
    ],
  },
  {
    id: 4,
    nombre: 'Corte & Estilo Personalizado',
    categoria_id: 2,
    descripcion: 'Diseño de corte adaptado a la fisonomía y preferencias del cliente.',
    duracion_base_min: 30,
    precio_base: 35,
    color: '#f59e0b',
    activo: true,
    buffer_antes_min: 0,
    buffer_despues_min: 5,
    recurso_requerido_tipo: 'silla',
    capacidad_maxima: 1,
    visible_portal_publico: true,
    empleados_compatibles_ids: [1, 3],
    duraciones: [
      { id: 41, servicio_id: 4, duracion_min: 30, precio: 35, etiqueta: 'Corte Clásico (30 min)' },
      { id: 42, servicio_id: 4, duracion_min: 45, precio: 50, etiqueta: 'Corte + Lavado & Peinado (45 min)' },
    ],
  },
]

export class LocalServiceRepository implements IServiceRepository {
  private collection = 'servicios'
  private categoriesCollection = 'categorias_servicios'

  async getAll(params?: Record<string, string>): Promise<ApiResponse<Servicio[]>> {
    let list = LocalStorageAdapter.getCollection<Servicio>(this.collection, SEED_SERVICIOS)
    const categorias = LocalStorageAdapter.getCollection<CategoriaServicio>(
      this.categoriesCollection,
      SEED_CATEGORIAS
    )

    // Enlazar objeto categoría
    list = list.map((s) => ({
      ...s,
      categoria: s.categoria || categorias.find((c) => c.id === s.categoria_id),
    }))

    if (params?.categoria_id) {
      list = list.filter((s) => String(s.categoria_id) === params.categoria_id)
    }
    if (params?.activo !== undefined) {
      const isActivo = params.activo === 'true'
      list = list.filter((s) => s.activo === isActivo)
    }
    return { success: true, message: 'OK', data: list }
  }

  async getById(id: number): Promise<ApiResponse<Servicio>> {
    const list = LocalStorageAdapter.getCollection<Servicio>(this.collection, SEED_SERVICIOS)
    const item = list.find((s) => s.id === id)
    if (!item) throw new Error('Servicio no encontrado')

    const categorias = LocalStorageAdapter.getCollection<CategoriaServicio>(
      this.categoriesCollection,
      SEED_CATEGORIAS
    )
    const conCategoria = {
      ...item,
      categoria: item.categoria || categorias.find((c) => c.id === item.categoria_id),
    }

    return { success: true, message: 'OK', data: conCategoria }
  }

  async create(data: Partial<Servicio>): Promise<ApiResponse<Servicio>> {
    const created = LocalStorageAdapter.insert<Servicio>(this.collection, {
      ...data,
      activo: data.activo ?? true,
      buffer_antes_min: data.buffer_antes_min ?? 0,
      buffer_despues_min: data.buffer_despues_min ?? 0,
    } as Servicio)
    return { success: true, message: 'Servicio creado', data: created }
  }

  async update(id: number, data: Partial<Servicio>): Promise<ApiResponse<Servicio>> {
    const updated = LocalStorageAdapter.update<Servicio>(this.collection, id, data)
    if (!updated) throw new Error('Servicio no encontrado')
    return { success: true, message: 'Servicio actualizado', data: updated }
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    LocalStorageAdapter.remove<Servicio>(this.collection, id)
    return { success: true, message: 'Servicio eliminado' }
  }

  async getCategorias(): Promise<ApiResponse<CategoriaServicio[]>> {
    const cats = LocalStorageAdapter.getCollection<CategoriaServicio>(
      this.categoriesCollection,
      SEED_CATEGORIAS
    )
    return { success: true, message: 'OK', data: cats }
  }

  async createCategoria(data: Partial<CategoriaServicio>): Promise<ApiResponse<CategoriaServicio>> {
    const nueva: CategoriaServicio = {
      id: Date.now(),
      nombre: data.nombre || 'Nueva Categoría',
      color: data.color || '#6366f1',
      icono: data.icono || 'sparkles',
      descripcion: data.descripcion,
    }
    const created = LocalStorageAdapter.insert<CategoriaServicio>(this.categoriesCollection, nueva)
    return { success: true, message: 'Categoría creada', data: created }
  }

  async updateCategoria(id: number, data: Partial<CategoriaServicio>): Promise<ApiResponse<CategoriaServicio>> {
    const updated = LocalStorageAdapter.update<CategoriaServicio>(this.categoriesCollection, id, data)
    if (!updated) throw new Error('Categoría no encontrada')
    return { success: true, message: 'Categoría actualizada', data: updated }
  }

  async deleteCategoria(id: number): Promise<ApiResponse<void>> {
    LocalStorageAdapter.remove<CategoriaServicio>(this.categoriesCollection, id)
    return { success: true, message: 'Categoría eliminada' }
  }
}
