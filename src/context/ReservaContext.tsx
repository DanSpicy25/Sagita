import React, { createContext, useCallback, useMemo, useReducer } from 'react'
import {
  EstadoWizard, PasoWizard, Servicio, DuracionServicio,
  Empleado, RespuestaCampo, ItemCarrito
} from '@/types'

// ─── Estado inicial ────────────────────────────────────────────────────────
const estadoInicial: EstadoWizard = {
  paso: 1,
  notas: '',
  respuestasCampos: [],
  carrito: [],
}

// ─── Acciones ─────────────────────────────────────────────────────────────
type Accion =
  | { type: 'SET_PASO'; paso: PasoWizard }
  | { type: 'SET_SERVICIO'; servicio: Servicio; duracion?: DuracionServicio }
  | { type: 'SET_EMPLEADO'; empleado: Empleado }
  | { type: 'SET_FECHA_HORA'; fecha: string; hora: string }
  | { type: 'SET_NOTAS'; notas: string }
  | { type: 'SET_RESPUESTAS'; respuestas: RespuestaCampo[] }
  | { type: 'AGREGAR_AL_CARRITO'; item: ItemCarrito }
  | { type: 'QUITAR_DEL_CARRITO'; itemId: string }
  | { type: 'RESET' }

function reducer(estado: EstadoWizard, accion: Accion): EstadoWizard {
  switch (accion.type) {
    case 'SET_PASO':
      return { ...estado, paso: accion.paso }
    case 'SET_SERVICIO':
      return { ...estado, servicioSeleccionado: accion.servicio,
        duracionSeleccionada: accion.duracion, empleadoSeleccionado: undefined,
        fechaSeleccionada: undefined, horaSeleccionada: undefined }
    case 'SET_EMPLEADO':
      return { ...estado, empleadoSeleccionado: accion.empleado,
        fechaSeleccionada: undefined, horaSeleccionada: undefined }
    case 'SET_FECHA_HORA':
      return { ...estado, fechaSeleccionada: accion.fecha, horaSeleccionada: accion.hora }
    case 'SET_NOTAS':
      return { ...estado, notas: accion.notas }
    case 'SET_RESPUESTAS':
      return { ...estado, respuestasCampos: accion.respuestas }
    case 'AGREGAR_AL_CARRITO':
      return { ...estado, carrito: [...estado.carrito, accion.item] }
    case 'QUITAR_DEL_CARRITO':
      return { ...estado, carrito: estado.carrito.filter(i => i.id !== accion.itemId) }
    case 'RESET':
      return estadoInicial
    default:
      return estado
  }
}

// ─── Contexto ─────────────────────────────────────────────────────────────
interface ReservaContextValue {
  estado: EstadoWizard
  irAPaso: (paso: PasoWizard) => void
  seleccionarServicio: (servicio: Servicio, duracion?: DuracionServicio) => void
  seleccionarEmpleado: (empleado: Empleado) => void
  seleccionarFechaHora: (fecha: string, hora: string) => void
  setNotas: (notas: string) => void
  setRespuestas: (respuestas: RespuestaCampo[]) => void
  agregarAlCarrito: (item: ItemCarrito) => void
  quitarDelCarrito: (itemId: string) => void
  totalCarrito: number
  reset: () => void
}

export const ReservaContext = createContext<ReservaContextValue | undefined>(undefined)

export function ReservaProvider({ children }: { children: React.ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial)

  const irAPaso = useCallback((paso: PasoWizard) => dispatch({ type: 'SET_PASO', paso }), [])
  const seleccionarServicio = useCallback((servicio: Servicio, duracion?: DuracionServicio) =>
    dispatch({ type: 'SET_SERVICIO', servicio, duracion }), [])
  const seleccionarEmpleado = useCallback((empleado: Empleado) =>
    dispatch({ type: 'SET_EMPLEADO', empleado }), [])
  const seleccionarFechaHora = useCallback((fecha: string, hora: string) =>
    dispatch({ type: 'SET_FECHA_HORA', fecha, hora }), [])
  const setNotas = useCallback((notas: string) => dispatch({ type: 'SET_NOTAS', notas }), [])
  const setRespuestas = useCallback((respuestas: RespuestaCampo[]) =>
    dispatch({ type: 'SET_RESPUESTAS', respuestas }), [])
  const agregarAlCarrito = useCallback((item: ItemCarrito) =>
    dispatch({ type: 'AGREGAR_AL_CARRITO', item }), [])
  const quitarDelCarrito = useCallback((itemId: string) =>
    dispatch({ type: 'QUITAR_DEL_CARRITO', itemId }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const totalCarrito = useMemo(
    () => estado.carrito.reduce((acc, item) => acc + item.precio, 0),
    [estado.carrito]
  )

  const value = useMemo<ReservaContextValue>(() => ({
    estado, irAPaso, seleccionarServicio, seleccionarEmpleado,
    seleccionarFechaHora, setNotas, setRespuestas,
    agregarAlCarrito, quitarDelCarrito, totalCarrito, reset,
  }), [estado, irAPaso, seleccionarServicio, seleccionarEmpleado,
      seleccionarFechaHora, setNotas, setRespuestas,
      agregarAlCarrito, quitarDelCarrito, totalCarrito, reset])

  return <ReservaContext.Provider value={value}>{children}</ReservaContext.Provider>
}

