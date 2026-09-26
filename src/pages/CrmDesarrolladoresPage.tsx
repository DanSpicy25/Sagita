import { useState, useEffect } from 'react'
import {
  Share2,
  Key,
  Terminal,
  ShieldAlert,
  Plus,
  RefreshCw,
  Trash2,
  Download,
  Search,
  CheckCircle2,
} from 'lucide-react'
import {
  CrmConfig,
  ApiKey,
  AuditLog,
  NivelAuditLog,
} from '@/types'
import { crmService } from '@/services/crm.service'
import { Button, Badge, Loader, EmptyState } from '@/components/ui'
import { ModalApiKey, VisorOpenApi } from '@/components/crm'
import { useToast } from '@/hooks/useToast'

type TabCrm = 'crm' | 'apikeys' | 'openapi' | 'auditoria'

export default function CrmDesarrolladoresPage() {
  const [tabActivo, setTabActivo] = useState<TabCrm>('crm')
  const [crmConfigs, setCrmConfigs] = useState<CrmConfig[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [cargando, setCargando] = useState(true)

  // Estados de CRM y API Keys
  const [sincronizandoId, setSincronizandoId] = useState<string | null>(null)
  const [modalApiKeyAbierto, setModalApiKeyAbierto] = useState(false)

  // Filtros de Auditoría
  const [busquedaAudit, setBusquedaAudit] = useState('')
  const [nivelFiltro, setNivelFiltro] = useState<string>('todos')

  const { toast } = useToast()

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      crmService.getCrmConfigs(),
      crmService.getApiKeys(),
      crmService.getAuditLogs(),
    ])
      .then(([crmRes, keyRes, logRes]) => {
        if (crmRes.data) setCrmConfigs(crmRes.data)
        if (keyRes.data) setApiKeys(keyRes.data)
        if (logRes.data) setAuditLogs(logRes.data)
      })
      .catch((err) => {
        toast.error('Error al cargar datos', err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Toggle estado CRM
  const handleToggleCrm = async (id: string, estadoActual: 'conectado' | 'desconectado') => {
    const nuevo = estadoActual === 'conectado' ? 'desconectado' : 'conectado'
    try {
      await crmService.toggleCrm(id, nuevo)
      toast.success(
        'Conector actualizado',
        nuevo === 'conectado' ? 'CRM vinculado con éxito' : 'CRM desvinculado'
      )
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo actualizar el conector')
    }
  }

  // Sincronizar CRM
  const handleSincronizarCrm = async (id: string) => {
    setSincronizandoId(id)
    try {
      const res = await crmService.sincronizarCrm(id)
      toast.success(
        'Sincronización completa',
        `Se han enviado ${res.data?.sincronizados ?? 12} registros al CRM`
      )
      cargarDatos()
    } catch {
      toast.error('Fallo en la sincronización', 'Error al comunicar con la API externa')
    } finally {
      setSincronizandoId(null)
    }
  }

  // Crear API Key
  const handleCrearApiKey = async (data: { nombre: string; permisos: 'read' | 'write' | 'admin' }) => {
    try {
      const res = await crmService.crearApiKey(data)
      toast.success('Clave de API generada', 'Copia el token antes de cerrar el modal')
      cargarDatos()
      return res.data
    } catch {
      toast.error('Error', 'No se pudo generar la clave de API')
    }
  }

  // Revocar API Key
  const handleRevocarApiKey = async (id: number) => {
    if (!confirm('¿Deseas revocar esta clave de API permanentemente? Las aplicaciones que la usen perderán el acceso.')) {
      return
    }
    try {
      await crmService.revocarApiKey(id)
      toast.success('Clave revocada', 'El token ya no tiene validez')
      cargarDatos()
    } catch {
      toast.error('Error', 'No se pudo revocar la clave')
    }
  }

  // Exportar logs a CSV
  const handleExportarCsv = () => {
    if (auditLogs.length === 0) return
    const headers = ['ID', 'Fecha', 'Usuario', 'Email', 'Rol', 'Accion', 'Modulo', 'IP', 'Nivel', 'Detalles']
    const rows = logsFiltrados.map((l) => [
      l.id,
      l.created_at,
      `"${l.usuario}"`,
      l.email,
      l.rol,
      `"${l.accion}"`,
      l.modulo,
      l.ip,
      l.nivel,
      `"${l.detalles.replace(/"/g, '""')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `sagitta-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Reporte descargado', 'Archivo CSV generado con éxito')
  }

  // Filtrado reactivo de auditoría
  const logsFiltrados = auditLogs.filter((log) => {
    const cumpleNivel = nivelFiltro === 'todos' || log.nivel === nivelFiltro
    const cumpleBusqueda =
      !busquedaAudit ||
      log.usuario.toLowerCase().includes(busquedaAudit.toLowerCase()) ||
      log.accion.toLowerCase().includes(busquedaAudit.toLowerCase()) ||
      log.modulo.toLowerCase().includes(busquedaAudit.toLowerCase()) ||
      log.detalles.toLowerCase().includes(busquedaAudit.toLowerCase()) ||
      log.ip.includes(busquedaAudit)
    return cumpleNivel && cumpleBusqueda
  })

  const getNivelBadge = (nivel: NivelAuditLog) => {
    if (nivel === 'error') return <Badge variant="danger" size="sm">ERROR</Badge>
    if (nivel === 'warning') return <Badge variant="warning" size="sm">ALERTA</Badge>
    return <Badge variant="default" size="sm">INFO</Badge>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Escalabilidad, CRM & Desarrolladores
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Conecta con HubSpot / Salesforce, genera claves de API, explora OpenAPI y audita eventos
          </p>
        </div>

        {tabActivo === 'apikeys' && (
          <Button
            size="sm"
            onClick={() => setModalApiKeyAbierto(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva Clave de API
          </Button>
        )}

        {tabActivo === 'auditoria' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportarCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setTabActivo('crm')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'crm'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Share2 className="w-4 h-4" />
          Conectores CRM ({crmConfigs.filter((c) => c.estado === 'conectado').length} activos)
        </button>

        <button
          onClick={() => setTabActivo('apikeys')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'apikeys'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Key className="w-4 h-4" />
          Claves de API ({apiKeys.length})
        </button>

        <button
          onClick={() => setTabActivo('openapi')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'openapi'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <Terminal className="w-4 h-4" />
          Explorador OpenAPI / Swagger
        </button>

        <button
          onClick={() => setTabActivo('auditoria')}
          className={[
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
            tabActivo === 'auditoria'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <ShieldAlert className="w-4 h-4" />
          Bitácora de Auditoría ({auditLogs.length})
        </button>
      </div>

      {cargando ? (
        <Loader text="Cargando datos empresariales..." />
      ) : (
        <div>
          {/* TAB 1: CONECTORES CRM */}
          {tabActivo === 'crm' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {crmConfigs.map((crm) => {
                  const conectado = crm.estado === 'conectado'
                  return (
                    <div
                      key={crm.id}
                      className="card p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center font-bold text-sm shadow-xs">
                              {crm.nombre.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                                {crm.nombre}
                              </h4>
                              <p className="text-xs text-slate-400 capitalize">
                                Proveedor: {crm.proveedor}
                              </p>
                            </div>
                          </div>

                          <Badge variant={conectado ? 'success' : 'default'} dot={conectado}>
                            {conectado ? 'Conectado' : 'Desconectado'}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                          {crm.descripcion}
                        </p>

                        {conectado && (
                          <div className="space-y-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Cuenta:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {crm.cuenta_conectada ?? 'Empresa Verificada'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Total sincronizado:</span>
                              <span className="font-semibold text-emerald-600">
                                {crm.total_sincronizados} registros
                              </span>
                            </div>
                            {crm.ultima_sync && (
                              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                                <span>Último sync:</span>
                                <span>{new Date(crm.ultima_sync).toLocaleTimeString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        {conectado ? (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSincronizarCrm(crm.id)}
                              isLoading={sincronizandoId === crm.id}
                              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                            >
                              Sincronizar Ahora
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleCrm(crm.id, 'conectado')}
                              className="text-red-500 hover:text-red-600"
                            >
                              Desconectar
                            </Button>
                          </>
                        ) : (
                          <div className="w-full flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleToggleCrm(crm.id, 'desconectado')}
                            >
                              Conectar {crm.nombre}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CLAVES DE API (API KEYS) */}
          {tabActivo === 'apikeys' && (
            <div className="card shadow-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Tokens de Acceso a la API REST
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permite a tus desarrolladores e integraciones autenticarse vía cabecera <code>X-API-Key</code>
                  </p>
                </div>
              </div>

              {apiKeys.length === 0 ? (
                <EmptyState
                  title="No hay claves de API creadas"
                  description="Genera una clave para conectar sistemas externos con Sagitta."
                  actionLabel="Generar Clave"
                  onAction={() => setModalApiKeyAbierto(true)}
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {key.nombre}
                          </span>
                          <Badge
                            variant={key.permisos === 'admin' ? 'warning' : 'primary'}
                            size="sm"
                          >
                            Scope: {key.permisos.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                          <span>Token:</span>
                          <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {key.token.slice(0, 16)}••••••••••••••••
                          </code>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span>Creada: {new Date(key.creada_en).toLocaleDateString()}</span>
                          {key.ultimo_uso && (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Último uso hoy
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevocarApiKey(key.id)}
                        className="text-red-500 hover:text-red-600 shrink-0"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Revocar Token
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VISOR OPENAPI / SWAGGER */}
          {tabActivo === 'openapi' && <VisorOpenApi />}

          {/* TAB 4: BITÁCORA DE AUDITORÍA (AUDIT LOGS) */}
          {tabActivo === 'auditoria' && (
            <div className="space-y-4">
              {/* Barra de Filtros */}
              <div className="card p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={busquedaAudit}
                    onChange={(e) => setBusquedaAudit(e.target.value)}
                    placeholder="Buscar por usuario, acción, IP o detalle..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Nivel:</span>
                  <select
                    value={nivelFiltro}
                    onChange={(e) => setNivelFiltro(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="todos">Todos los niveles</option>
                    <option value="info">Solo Info</option>
                    <option value="warning">Solo Alertas (Warning)</option>
                    <option value="error">Solo Errores (Error)</option>
                  </select>
                </div>
              </div>

              {/* Tabla de Registros */}
              <div className="card shadow-card overflow-hidden">
                {logsFiltrados.length === 0 ? (
                  <EmptyState
                    title="No se encontraron eventos de auditoría"
                    description="Prueba cambiando los términos de búsqueda o los filtros de nivel."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                        <tr>
                          <th className="py-3 px-4">Fecha y Hora</th>
                          <th className="py-3 px-4">Nivel</th>
                          <th className="py-3 px-4">Usuario / IP</th>
                          <th className="py-3 px-4">Acción & Módulo</th>
                          <th className="py-3 px-4">Detalles</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        {logsFiltrados.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-slate-400">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {getNivelBadge(log.nivel)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{log.usuario}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{log.ip}</p>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-medium text-slate-900 dark:text-slate-100">{log.accion}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                                {log.modulo}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                              {log.detalles}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Alta API Key */}
      <ModalApiKey
        isOpen={modalApiKeyAbierto}
        onClose={() => setModalApiKeyAbierto(false)}
        onCrear={handleCrearApiKey}
      />
    </div>
  )
}
