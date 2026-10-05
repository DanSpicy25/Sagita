import React, { useState, useEffect } from 'react'
import {
  Users,
  CheckCircle,
  Percent,
  Plus,
  Clock,
  Filter,
  CreditCard,
  Briefcase,
} from 'lucide-react'
import { ComisionVenta, ReglaComision, Empleado } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { empleadosService } from '@/services/empleados.service'
import {
  Button,
  Badge,
  Modal,
  Input,
  Select,
  EmptyState,
} from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { useModules } from '@/context/ModulesContext'

const REGLAS_DEFAULT: ReglaComision[] = [
  {
    id: 1,
    nombre: 'Comisión Estándar Servicios',
    tipo_calculo: 'porcentaje',
    valor: 40, // 40% por servicio
    aplicar_a: 'general',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Comisión Venta Productos Retail',
    tipo_calculo: 'porcentaje',
    valor: 10, // 10% por venta de producto
    aplicar_a: 'categoria',
    categoria: 'retail',
    activo: true,
  },
]

const COMISIONES_INICIALES: ComisionVenta[] = [
  {
    id: 1,
    venta_id: 101,
    venta_numero: 'V-2026-001',
    item_id: 'item-1',
    concepto: 'Corte de Cabello Clásico',
    profesional_id: 1,
    profesional_nombre: 'Valeria Mendoza',
    base_calculo: 18000,
    porcentaje: 40,
    monto_comision: 7200,
    periodo: '2026-10',
    estado: 'pendiente',
    fecha_generacion: '2026-10-04',
  },
  {
    id: 2,
    venta_id: 102,
    venta_numero: 'V-2026-002',
    item_id: 'item-2',
    concepto: 'Coloración & Balayage',
    profesional_id: 2,
    profesional_nombre: 'Matías Silva',
    base_calculo: 45000,
    porcentaje: 40,
    monto_comision: 18000,
    periodo: '2026-10',
    estado: 'pendiente',
    fecha_generacion: '2026-10-05',
  },
  {
    id: 3,
    venta_id: 95,
    venta_numero: 'V-2026-000',
    item_id: 'item-3',
    concepto: 'Masaje Descontracturante',
    profesional_id: 1,
    profesional_nombre: 'Valeria Mendoza',
    base_calculo: 25000,
    porcentaje: 40,
    monto_comision: 10000,
    periodo: '2026-09',
    estado: 'liquidada',
    fecha_generacion: '2026-09-28',
    fecha_liquidacion: '2026-09-30',
  },
]

export function GestionComisiones() {
  const [comisiones, setComisiones] = useState<ComisionVenta[]>([])
  const [reglas, setReglas] = useState<ReglaComision[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [filtroProfesional, setFiltroProfesional] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  // Modal Regla
  const [modalReglaAbierto, setModalReglaAbierto] = useState(false)
  const [nombreRegla, setNombreRegla] = useState('')
  const [tipoCalculo, setTipoCalculo] = useState<'porcentaje' | 'monto_fijo'>('porcentaje')
  const [valorRegla, setValorRegla] = useState<number>(30)

  const { toast } = useToast()
  const { tTerm } = useModules()
  const profesionalTerm = tTerm('profesional', 'Profesional')
  const profesionalesTerm = tTerm('profesionales', 'Profesionales')

  const cargarDatos = async () => {
    // Comisiones
    const comGuardadas = LocalStorageAdapter.get<ComisionVenta[]>('comisiones_profesionales', COMISIONES_INICIALES)
    if (!comGuardadas || comGuardadas.length === 0) {
      LocalStorageAdapter.set('comisiones_profesionales', COMISIONES_INICIALES)
      setComisiones(COMISIONES_INICIALES)
    } else {
      setComisiones(comGuardadas)
    }

    // Reglas
    const reglasGuardadas = LocalStorageAdapter.get<ReglaComision[]>('reglas_comisiones', REGLAS_DEFAULT)
    if (!reglasGuardadas || reglasGuardadas.length === 0) {
      LocalStorageAdapter.set('reglas_comisiones', REGLAS_DEFAULT)
      setReglas(REGLAS_DEFAULT)
    } else {
      setReglas(reglasGuardadas)
    }

    // Empleados
    const resEmp = await empleadosService.getAll()
    if (resEmp.data) setEmpleados(resEmp.data)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Filtrado
  const comisionesFiltradas = comisiones.filter((c) => {
    if (filtroProfesional !== 'todos' && String(c.profesional_id) !== filtroProfesional) return false
    if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false
    return true
  })

  // Métricas
  const totalPendiente = comisiones
    .filter((c) => c.estado === 'pendiente')
    .reduce((acc, c) => acc + c.monto_comision, 0)

  const totalLiquidado = comisiones
    .filter((c) => c.estado === 'liquidada')
    .reduce((acc, c) => acc + c.monto_comision, 0)

  const handleLiquidarComision = (id: number) => {
    const actualizadas = comisiones.map((c) =>
      c.id === id
        ? {
            ...c,
            estado: 'liquidada' as const,
            fecha_liquidacion: new Date().toISOString().slice(0, 10),
          }
        : c
    )
    LocalStorageAdapter.set('comisiones_profesionales', actualizadas)
    setComisiones(actualizadas)
    toast.success('Comisión Liquidada', 'El pago ha sido registrado como completado')
  }

  const handleLiquidarTodas = (profesionalId?: number) => {
    const actualizadas = comisiones.map((c) => {
      if (c.estado === 'pendiente' && (!profesionalId || c.profesional_id === profesionalId)) {
        return {
          ...c,
          estado: 'liquidada' as const,
          fecha_liquidacion: new Date().toISOString().slice(0, 10),
        }
      }
      return c
    })
    LocalStorageAdapter.set('comisiones_profesionales', actualizadas)
    setComisiones(actualizadas)
    toast.success('Comisiones Liquidadas', 'Todas las comisiones pendientes han sido marcadas como pagadas')
  }

  const handleCrearRegla = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreRegla.trim()) return

    const nueva: ReglaComision = {
      id: Date.now(),
      nombre: nombreRegla.trim(),
      tipo_calculo: tipoCalculo,
      valor: valorRegla,
      aplicar_a: 'general',
      activo: true,
    }

    const actualizadas = [...reglas, nueva]
    LocalStorageAdapter.set('reglas_comisiones', actualizadas)
    setReglas(actualizadas)
    setModalReglaAbierto(false)
    toast.success('Regla Guardada', `Regla "${nueva.nombre}" configurada`)
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              Pendiente de Pago
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalPendiente.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Por liquidar a {profesionalesTerm.toLowerCase()}</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Total Liquidado
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalLiquidado.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Pagos acumulados este año</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-full">
              Reglas Activas
            </span>
            <Percent className="w-4 h-4 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {reglas.length} Políticas
          </p>
          <p className="text-xs text-slate-400 mt-1">Cálculo automatizado</p>
        </div>
      </div>

      {/* Barra de Filtros y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filtroProfesional}
              onChange={(e) => setFiltroProfesional(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los {profesionalesTerm.toLowerCase()}</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={String(emp.id)}>
                  {emp.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Solo Pendientes</option>
              <option value="liquidada">Solo Liquidadas</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalPendiente > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleLiquidarTodas()}
              leftIcon={<CreditCard className="w-3.5 h-3.5 text-emerald-500" />}
            >
              Liquidar Todo Pendiente
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => {
              setNombreRegla('')
              setValorRegla(35)
              setModalReglaAbierto(true)
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva Regla (%)
          </Button>
        </div>
      </div>

      {/* Tabla de Comisiones */}
      {comisionesFiltradas.length === 0 ? (
        <EmptyState
          title="Sin comisiones registradas"
          description="Las comisiones se generan en tiempo real con cada venta o servicio completado en el POS."
          icon={<Briefcase className="w-10 h-10 text-slate-400" />}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">{profesionalTerm}</th>
                <th className="px-4 py-3">Venta / Concepto</th>
                <th className="px-4 py-3">Base Cálculo</th>
                <th className="px-4 py-3">Tasa %</th>
                <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Comisión</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comisionesFiltradas.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-500">{c.fecha_generacion}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary-500" />
                    {c.profesional_nombre}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{c.concepto}</span>
                    <span className="block text-[10px] text-slate-400">{c.venta_numero}</span>
                  </td>
                  <td className="px-4 py-3">${c.base_calculo.toLocaleString()}</td>
                  <td className="px-4 py-3">{c.porcentaje ? `${c.porcentaje}%` : 'Fijo'}</td>
                  <td className="px-4 py-3 font-bold text-primary-600 dark:text-primary-400">
                    ${c.monto_comision.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.estado === 'liquidada' ? 'success' : 'warning'} size="sm">
                      {c.estado.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.estado === 'pendiente' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleLiquidarComision(c.id)}
                      >
                        Pagar
                      </Button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-medium">
                        Pagado el {c.fecha_liquidacion}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nueva Regla */}
      {modalReglaAbierto && (
        <Modal
          isOpen={true}
          onClose={() => setModalReglaAbierto(false)}
          title="Configurar Regla de Comisión"
        >
          <form onSubmit={handleCrearRegla} className="space-y-4">
            <Input
              label="Nombre de la Regla *"
              value={nombreRegla}
              onChange={(e) => setNombreRegla(e.target.value)}
              placeholder="Ej. Comisión Estilistas Senior"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Tipo de Cálculo *"
                value={tipoCalculo}
                onChange={(e) => setTipoCalculo(e.target.value as any)}
                options={[
                  { value: 'porcentaje', label: 'Porcentaje (%)' },
                  { value: 'monto_fijo', label: 'Monto Fijo ($)' },
                ]}
              />
              <Input
                label={tipoCalculo === 'porcentaje' ? 'Porcentaje (%) *' : 'Monto Fijo ($) *'}
                type="number"
                min={1}
                max={tipoCalculo === 'porcentaje' ? 100 : undefined}
                value={valorRegla}
                onChange={(e) => setValorRegla(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setModalReglaAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Política</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
