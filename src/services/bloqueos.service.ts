import { BloqueoHorario, ExcepcionHorario, ApiResponse } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'

const SEED_BLOQUEOS: BloqueoHorario[] = [
  {
    id: 1,
    titulo: 'Año Nuevo',
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-01-01',
    tipo: 'feriado',
    todo_el_dia: true,
    motivo: 'Feriado nacional de Año Nuevo',
  },
  {
    id: 2,
    titulo: 'Día del Trabajador',
    fecha_inicio: '2026-05-01',
    fecha_fin: '2026-05-01',
    tipo: 'feriado',
    todo_el_dia: true,
    motivo: 'Feriado legal día del trabajo',
  },
  {
    id: 3,
    titulo: 'Navidad',
    fecha_inicio: '2026-12-25',
    fecha_fin: '2026-12-25',
    tipo: 'feriado',
    todo_el_dia: true,
    motivo: 'Feriado de Navidad',
  },
  {
    id: 4,
    titulo: 'Mantenimiento Preventivo Equipo Láser',
    fecha_inicio: '2026-10-15 08:00',
    fecha_fin: '2026-10-15 12:00',
    tipo: 'mantenimiento',
    recurso_id: 5,
    todo_el_dia: false,
    motivo: 'Revisión y calibración técnica semestral',
  },
]

const SEED_EXCEPCIONES: ExcepcionHorario[] = [
  {
    id: 1,
    fecha: '2026-12-24',
    hora_inicio: '09:00',
    hora_fin: '14:00',
    cerrado: false,
    motivo: 'Jornada reducida por víspera navideña',
  },
  {
    id: 2,
    fecha: '2026-12-31',
    hora_inicio: '09:00',
    hora_fin: '13:00',
    cerrado: false,
    motivo: 'Jornada reducida por víspera de año nuevo',
  },
]

export const bloqueosService = {
  getAllBloqueos: async (): Promise<ApiResponse<BloqueoHorario[]>> => {
    const list = LocalStorageAdapter.getCollection<BloqueoHorario>('bloqueos_horario', SEED_BLOQUEOS)
    return { success: true, message: 'OK', data: list }
  },

  createBloqueo: async (data: Omit<BloqueoHorario, 'id'>): Promise<ApiResponse<BloqueoHorario>> => {
    const created = LocalStorageAdapter.insert<BloqueoHorario>('bloqueos_horario', data as BloqueoHorario)
    return { success: true, message: 'Bloqueo registrado correctamente', data: created }
  },

  deleteBloqueo: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.remove('bloqueos_horario', id)
    return { success: true, message: 'Bloqueo eliminado' }
  },

  getAllExcepciones: async (): Promise<ApiResponse<ExcepcionHorario[]>> => {
    const list = LocalStorageAdapter.getCollection<ExcepcionHorario>('excepciones_horario', SEED_EXCEPCIONES)
    return { success: true, message: 'OK', data: list }
  },

  createExcepcion: async (data: Omit<ExcepcionHorario, 'id'>): Promise<ApiResponse<ExcepcionHorario>> => {
    const created = LocalStorageAdapter.insert<ExcepcionHorario>('excepciones_horario', data as ExcepcionHorario)
    return { success: true, message: 'Excepción de horario registrada', data: created }
  },

  deleteExcepcion: async (id: number): Promise<ApiResponse<void>> => {
    LocalStorageAdapter.remove('excepciones_horario', id)
    return { success: true, message: 'Excepción eliminada' }
  },
}
