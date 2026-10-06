import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Tag,
  DollarSign,
  Eye,
  Filter,
} from 'lucide-react'
import { Cliente } from '@/types'
import { clientesService } from '@/services/clientes.service'
import { Button, Loader, EmptyState, Pagination } from '@/components/ui'
import { FichaCliente360, ModalNuevoCliente } from '@/components/clientes'
import { useToast } from '@/hooks/useToast'
import { useModules } from '@/context/ModulesContext'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroTag, setFiltroTag] = useState<string>('todos')
  const [cargando, setCargando] = useState(true)

  // Expediente 360°
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [modalExpedienteAbierto, setModalExpedienteAbierto] = useState(false)

  // Modal Nuevo Cliente
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)

  const { toast } = useToast()
  const { tTerm } = useModules()
  const clienteTerm = tTerm('cliente', 'Cliente')
  const clientesTerm = tTerm('clientes', 'Clientes')
  const citasTerm = tTerm('citas', 'Citas')

  const [pagina, setPagina] = useState(1)
  const ITEMS_POR_PAGINA = 9

  const cargarClientes = (q?: string) => {
    setCargando(true)
    clientesService
      .getAll(q)
      .then((res) => {
        if (res.data) setClientes(res.data)
      })
      .catch((err) => {
        toast.error('Error al cargar clientes', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    setPagina(1)
    const timer = setTimeout(() => {
      cargarClientes(busqueda)
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda, filtroTag])

  // Obtener lista única de tags para filtros
  const tagsDisponibles = useMemo(() => {
    const setTags = new Set<string>()
    clientes.forEach((c) => {
      c.etiquetas?.forEach((t) => setTags.add(t))
    })
    return Array.from(setTags)
  }, [clientes])

  const clientesFiltrados = useMemo(() => {
    if (filtroTag === 'todos') return clientes
    return clientes.filter((c) => c.etiquetas?.includes(filtroTag))
  }, [clientes, filtroTag])

  const totalPaginas = Math.ceil(clientesFiltrados.length / ITEMS_POR_PAGINA)
  const clientesPaginados = useMemo(() => {
    return clientesFiltrados.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA)
  }, [clientesFiltrados, pagina])

  const handleAbrirExpediente = (c: Cliente) => {
    setClienteSeleccionado(c)
    setModalExpedienteAbierto(true)
  }

  const handleActualizarClienteEnLista = (clienteActualizado: Cliente) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === clienteActualizado.id ? clienteActualizado : c))
    )
    setClienteSeleccionado(clienteActualizado)
  }


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Directorio de {clientesTerm}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Expediente 360°, historial de atención, paquetes de sesiones, membresías y preferencias
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-base pl-9 text-xs py-2 w-full"
            />
          </div>

          <Button
            onClick={() => setModalNuevoAbierto(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo {clienteTerm}
          </Button>
        </div>
      </div>

      {/* Filtros por Etiquetas / Tags */}
      {tagsDisponibles.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Segmentos:
          </span>
          <button
            type="button"
            onClick={() => setFiltroTag('todos')}
            className={[
              'px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
              filtroTag === 'todos'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
            ].join(' ')}
          >
            Todos ({clientes.length})
          </button>
          {tagsDisponibles.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFiltroTag(tag)}
              className={[
                'px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1',
                filtroTag === tag
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
              ].join(' ')}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid de clientes */}
      {cargando ? (
        <Loader text={`Cargando directorio de ${clientesTerm.toLowerCase()}...`} />
      ) : clientesFiltrados.length === 0 ? (
        <EmptyState
          title={`No se encontraron ${clientesTerm.toLowerCase()}`}
          description={`Agrega nuevos ${clientesTerm.toLowerCase()} para llevar su historial de ${citasTerm.toLowerCase()}, membresías y datos comerciales.`}
          actionLabel={`Agregar ${clienteTerm}`}
          onAction={() => setModalNuevoAbierto(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientesPaginados.map((c) => (
              <div
                key={c.id}
                onClick={() => handleAbrirExpediente(c)}
                className="card p-5 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800 cursor-pointer group"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors shadow-sm">
                      {c.nombre.slice(0, 1)}
                      {c.apellido ? c.apellido.slice(0, 1) : ''}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 transition-colors">
                          {c.nombre} {c.apellido || ''}
                        </h4>
                        {c.documento_identidad && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {c.documento_identidad}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        {c.email}
                      </p>
                      {c.telefono && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {c.telefono}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Etiquetas */}
                  {c.etiquetas && c.etiquetas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {c.etiquetas.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-md border border-primary-200/60 dark:border-primary-800/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer de métricas */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {c.total_citas} {citasTerm.toLowerCase()}
                  </span>

                  {c.total_gastado !== undefined && (
                    <span className="flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      {c.total_gastado} total
                    </span>
                  )}

                  <span className="text-slate-400 text-[11px] group-hover:text-primary-500 font-medium flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    Expediente
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={pagina}
            totalPages={totalPaginas}
            onPageChange={setPagina}
            totalItems={clientesFiltrados.length}
            itemsPerPage={ITEMS_POR_PAGINA}
          />
        </>
      )}

      {/* Expediente Comercial 360° Modular */}
      <FichaCliente360
        cliente={clienteSeleccionado}
        isOpen={modalExpedienteAbierto}
        onClose={() => {
          setModalExpedienteAbierto(false)
          setClienteSeleccionado(null)
        }}
        onClienteActualizado={handleActualizarClienteEnLista}
      />

      {/* Modal Registrar Nuevo Cliente Modular */}
      <ModalNuevoCliente
        isOpen={modalNuevoAbierto}
        onClose={() => setModalNuevoAbierto(false)}
        onClienteCreado={() => cargarClientes()}
        clienteTerm={clienteTerm}
      />
    </div>
  )
}

