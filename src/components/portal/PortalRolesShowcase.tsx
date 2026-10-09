import { useState } from 'react'
import {
  Shield,
  ShieldCheck,
  ConciergeBell,
  Scissors,
  Receipt,
  Lock,
  Check,
  X,
} from 'lucide-react'

interface RoleProfile {
  id: string
  titulo: string
  perfil: string
  icono: typeof Shield
  color: string
  descripcion: string
  vistasPermitidas: string[]
  bloqueosSeguridad: string[]
}

const ROLES_DATA: RoleProfile[] = [
  {
    id: 'admin',
    titulo: 'Dueño / Gerencia',
    perfil: 'Control Total & Financiero',
    icono: ShieldCheck,
    color: 'text-primary bg-primary-soft border-primary/20',
    descripcion:
      'Supervisión estratégica de todas las sedes, márgenes de ganancia, auditoría de cajas y liquidación de comisiones.',
    vistasPermitidas: [
      'Facturación e ingresos en tiempo real',
      'Configuración de marca blanca y precios',
      'Liquidación de comisiones de personal',
      'Exportación de balances contables',
    ],
    bloqueosSeguridad: ['Sin restricciones en la plataforma'],
  },
  {
    id: 'recepcion',
    titulo: 'Recepción & Mostrador',
    perfil: 'Atención al Cliente Ágil',
    icono: ConciergeBell,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    descripcion:
      'Gestión de llamadas, altas de clientes, recepción de turnos espontáneos y control de la sala de espera.',
    vistasPermitidas: [
      'Agenda global de espacios y operaciones',
      'Registro de clientes y notas de contacto',
      'Asignación ágil de citas y walk-ins',
      'Recepción de pagos básicos',
    ],
    bloqueosSeguridad: [
      'Sin acceso a márgenes de ganancia ni costos',
      'No puede alterar roles ni permisos',
      'Sin acceso a reportes contables globales',
    ],
  },
  {
    id: 'especialista',
    titulo: 'Profesional / Especialista',
    perfil: 'Foco en la Atención del Cliente',
    icono: Scissors,
    color: 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
    descripcion:
      'Interfaz sencilla para tablets y móviles: cada integrante ve sus tareas, agenda y notas de atención.',
    vistasPermitidas: [
      'Mi Jornada Hoy (citas asignadas exclusivamente)',
      'Historial y preferencias de clientes',
      'Seguimiento de operaciones completadas',
    ],
    bloqueosSeguridad: [
      'No puede ver la agenda de otros colegas',
      'Sin acceso a facturación global del negocio',
      'Sin acceso al inventario general ni caja',
    ],
  },
  {
    id: 'caja',
    titulo: 'Cajero / Punto de Venta',
    perfil: 'Cobros & Liquidación Diaria',
    icono: Receipt,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    descripcion:
      'Operación de terminal táctil, tickets térmicos Bluetooth, cálculo de vuelto y arqueos de caja al cierre de turno.',
    vistasPermitidas: [
      'Emisión y cobro de tickets POS',
      'Apertura de cajón monedero (RJ11)',
      'Arqueo y cierre ciego de turno de caja',
    ],
    bloqueosSeguridad: [
      'No puede editar servicios ni tarifas',
      'Sin acceso a datos personales de contacto',
      'No puede borrar citas confirmadas',
    ],
  },
]

export function PortalRolesShowcase() {
  const [selectedRoleId, setSelectedRoleId] = useState('admin')
  const currentRole = ROLES_DATA.find((r) => r.id === selectedRoleId) || ROLES_DATA[0]

  return (
    <section id="roles" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold uppercase tracking-wider border border-primary/20">
          <Shield className="w-3.5 h-3.5" />
          <span>Seguridad & Permisos por Rol</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight">
          Principio de menor privilegio para proteger tu negocio
        </h2>
        <p className="text-text-muted text-sm sm:text-base leading-relaxed">
          Cada empleado ve únicamente lo que necesita para cumplir con su trabajo. Evita fugas de información financiera, agendas ajenas o modificaciones accidentales de precios.
        </p>

        {/* Selector de Roles */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-surface border border-border shadow-xs overflow-x-auto max-w-full">
            {ROLES_DATA.map((role) => {
              const Icon = role.icono
              const isSelected = selectedRoleId === role.id
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isSelected
                      ? 'bg-primary text-primary-contrast shadow-sm'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{role.titulo}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tarjeta de Detalle del Rol Activo */}
      <div className="w-full max-w-7xl mx-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 sm:p-9 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-subtle">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${currentRole.color}`}>
              <currentRole.icono className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text">{currentRole.titulo}</h3>
              <span className="text-xs font-semibold text-primary">{currentRole.perfil}</span>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-surface-subtle text-text-muted border border-border self-start sm:self-auto">
            Matriz de Permisos Segura
          </span>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          {currentRole.descripcion}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Permisos Concedidos */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Permisos & Vistas Activas
            </span>
            <ul className="space-y-2.5">
              {currentRole.vistasPermitidas.map((perm, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-text">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bloqueos de Seguridad */}
          <div className="p-5 rounded-2xl bg-surface-subtle border border-border space-y-3">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              Protecciones de Acceso
            </span>
            <ul className="space-y-2.5">
              {currentRole.bloqueosSeguridad.map((bloq, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-text-muted">
                  <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{bloq}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
