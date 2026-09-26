import { useState } from 'react'
import { Copy, Check, Terminal, Play, ChevronRight, Lock } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface EndpointDoc {
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE'
  ruta: string
  titulo: string
  descripcion: string
  autenticacion: 'Bearer JWT' | 'X-API-Key' | 'Ambos'
  headers: Record<string, string>
  bodyEjemplo?: Record<string, unknown>
  respuestaEjemplo: Record<string, unknown>
}

const ENDPOINTS: EndpointDoc[] = [
  {
    metodo: 'GET',
    ruta: '/api/citas',
    titulo: 'Listar Citas Programadas',
    descripcion: 'Devuelve la lista de citas filtradas por fecha, profesional o estado.',
    autenticacion: 'Ambos',
    headers: {
      'Authorization': 'Bearer <token>',
      'X-Tenant-ID': 'sede-principal',
      'Accept': 'application/json',
    },
    respuestaEjemplo: {
      success: true,
      data: [
        {
          id: 1,
          cliente: { id: 10, nombre: 'Lucía Fernández', email: 'lucia@email.com' },
          servicio: { id: 2, nombre: 'Consulta Médica General', precio: 50 },
          fecha: '2026-09-18',
          hora_inicio: '10:00',
          estado: 'confirmada',
        },
      ],
      message: 'Citas recuperadas con éxito',
    },
  },
  {
    metodo: 'POST',
    ruta: '/api/citas',
    titulo: 'Crear Nueva Cita',
    descripcion: 'Agenda una cita y bloquea el horario del profesional correspondiente.',
    autenticacion: 'Ambos',
    headers: {
      'Authorization': 'Bearer <token>',
      'X-API-Key': 'sag_live_***',
      'Content-Type': 'application/json',
    },
    bodyEjemplo: {
      servicio_id: 2,
      empleado_id: 1,
      fecha: '2026-09-20',
      hora_inicio: '11:30',
      modalidad: 'presencial',
      cliente: {
        nombre: 'Andrés Morales',
        email: 'andres@example.com',
        telefono: '+1 555-0999',
      },
    },
    respuestaEjemplo: {
      success: true,
      data: {
        id: 142,
        codigo: 'SAG-8921',
        estado: 'confirmada',
        enlace_ics: 'https://api.sagitta.com/api/citas/142/ics',
      },
      message: 'Cita programada exitosamente',
    },
  },
  {
    metodo: 'GET',
    ruta: '/api/citas/disponibilidad',
    titulo: 'Consultar Horarios Disponibles',
    descripcion: 'Calcula slots libres para un servicio y empleado en una fecha específica.',
    autenticacion: 'Ambos',
    headers: {
      'X-API-Key': 'sag_live_***',
    },
    respuestaEjemplo: {
      success: true,
      data: {
        fecha: '2026-09-20',
        empleado_id: 1,
        slots_disponibles: ['09:00', '09:45', '11:00', '14:30', '16:00'],
      },
      message: 'Disponibilidad calculada',
    },
  },
  {
    metodo: 'GET',
    ruta: '/api/servicios',
    titulo: 'Catálogo de Servicios y Precios',
    descripcion: 'Devuelve todos los servicios activos con sus duraciones y precios base.',
    autenticacion: 'Ambos',
    headers: {
      'Accept': 'application/json',
    },
    respuestaEjemplo: {
      success: true,
      data: [
        { id: 1, nombre: 'Limpieza Dental Profunda', duracion_minutos: 45, precio: 75 },
        { id: 2, nombre: 'Consulta Médica General', duracion_minutos: 30, precio: 50 },
      ],
      message: 'Catálogo recuperado',
    },
  },
]

export function VisorOpenApi() {
  const [endpointSeleccionado, setEndpointSeleccionado] = useState<EndpointDoc>(ENDPOINTS[0])
  const [copiado, setCopiado] = useState(false)
  const [probando, setProbando] = useState(false)
  const [respuestaEnVivo, setRespuestaEnVivo] = useState<string | null>(null)
  const { toast } = useToast()

  const baseUrl = window.location.origin

  const generarCurl = (ep: EndpointDoc) => {
    let curl = `curl -X ${ep.metodo} "${baseUrl}${ep.ruta}" \\\n`
    Object.entries(ep.headers).forEach(([k, v]) => {
      curl += `  -H "${k}: ${v}" \\\n`
    })
    if (ep.bodyEjemplo) {
      curl += `  -d '${JSON.stringify(ep.bodyEjemplo, null, 2)}'`
    } else {
      curl = curl.slice(0, -3) // Quitar último \
    }
    return curl
  }

  const handleCopiarCurl = () => {
    navigator.clipboard.writeText(generarCurl(endpointSeleccionado))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
    toast.success('Comando curl copiado', 'Puedes pegarlo en tu terminal o cliente HTTP')
  }

  const handleProbarEndpoint = () => {
    setProbando(true)
    setRespuestaEnVivo(null)
    setTimeout(() => {
      setRespuestaEnVivo(JSON.stringify(endpointSeleccionado.respuestaEjemplo, null, 2))
      setProbando(false)
      toast.success('Respuesta HTTP 200 OK', 'Simulación de respuesta exitosa')
    }, 450)
  }

  const getMethodBadgeVariant = (m: string) => {
    if (m === 'GET') return 'success'
    if (m === 'POST') return 'primary'
    if (m === 'PUT') return 'warning'
    return 'danger'
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary-600" />
            Explorador OpenAPI / Swagger v3.0
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Especificación pública de endpoints para desarrolladores y sistemas externos
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-primary-500" />
          <span>Autenticación: <strong>Bearer JWT / X-API-Key</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Lista de Endpoints (Izq) */}
        <div className="lg:col-span-5 space-y-2">
          {ENDPOINTS.map((ep) => {
            const activo = ep.ruta === endpointSeleccionado.ruta && ep.metodo === endpointSeleccionado.metodo
            return (
              <button
                key={`${ep.metodo}-${ep.ruta}`}
                type="button"
                onClick={() => {
                  setEndpointSeleccionado(ep)
                  setRespuestaEnVivo(null)
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                  activo
                    ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20 ring-1 ring-primary-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getMethodBadgeVariant(ep.metodo)} size="sm">
                      {ep.metodo}
                    </Badge>
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {ep.ruta}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{ep.titulo}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 ${activo ? 'text-primary-600' : ''}`} />
              </button>
            )
          })}
        </div>

        {/* Detalle del Endpoint & Consola (Der) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card p-5 border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getMethodBadgeVariant(endpointSeleccionado.metodo)} size="sm">
                    {endpointSeleccionado.metodo}
                  </Badge>
                  <code className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                    {endpointSeleccionado.ruta}
                  </code>
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {endpointSeleccionado.titulo}
                </h4>
                <p className="text-xs text-slate-400">{endpointSeleccionado.descripcion}</p>
              </div>

              <Button
                size="sm"
                onClick={handleProbarEndpoint}
                isLoading={probando}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Probar
              </Button>
            </div>

            {/* Cabeceras Requeridas */}
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-slate-500">Cabeceras (Headers):</span>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                {Object.entries(endpointSeleccionado.headers).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-primary-600 font-bold">{k}:</span> {v}
                  </div>
                ))}
              </div>
            </div>

            {/* Snippet Curl */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Comando cURL:</span>
                <button
                  type="button"
                  onClick={handleCopiarCurl}
                  className="hover:text-primary-600 flex items-center gap-1 font-semibold"
                >
                  {copiado ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copiado ? 'Copiado' : 'Copiar curl'}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                {generarCurl(endpointSeleccionado)}
              </pre>
            </div>

            {/* Respuesta JSON */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Respuesta HTTP 200 (JSON):</span>
                {respuestaEnVivo && (
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">
                    ● En vivo simulado
                  </span>
                )}
              </div>
              <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-60 border border-slate-800/80">
                {respuestaEnVivo ?? JSON.stringify(endpointSeleccionado.respuestaEjemplo, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

