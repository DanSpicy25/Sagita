import React, { useState, useEffect } from 'react'
import {
  Gift,
  Plus,
  CreditCard,
  Search,
  CheckCircle,
  Sparkles,
  Calendar,
  Mail,
  User,
} from 'lucide-react'
import { GiftCard } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import {
  Button,
  Badge,
  Modal,
  Input,
  EmptyState,
} from '@/components/ui'
import { useToast } from '@/hooks/useToast'

const GIFTCARDS_DEFAULT: GiftCard[] = [
  {
    id: 1,
    codigo: 'GIFT-2026-VAL',
    saldo_inicial: 50000,
    saldo_actual: 32000,
    cliente_destinatario_nombre: 'Camila Orellana',
    cliente_destinatario_email: 'camila@gmail.com',
    fecha_emision: '2026-09-15',
    fecha_expiracion: '2026-12-31',
    estado: 'activa',
    movimientos: [
      {
        id: 'mov-1',
        tipo: 'emision',
        monto: 50000,
        saldo_resultante: 50000,
        fecha: '2026-09-15',
      },
      {
        id: 'mov-2',
        tipo: 'consumo',
        monto: 18000,
        saldo_resultante: 32000,
        referencia: 'Venta #V-2026-001',
        fecha: '2026-10-02',
      },
    ],
  },
  {
    id: 2,
    codigo: 'GIFT-2026-SPA',
    saldo_inicial: 30000,
    saldo_actual: 0,
    cliente_destinatario_nombre: 'Ignacio Rojas',
    cliente_destinatario_email: 'ignacio.rojas@outlook.com',
    fecha_emision: '2026-08-20',
    fecha_expiracion: '2026-11-20',
    estado: 'agotada',
    movimientos: [
      {
        id: 'mov-3',
        tipo: 'emision',
        monto: 30000,
        saldo_resultante: 30000,
        fecha: '2026-08-20',
      },
      {
        id: 'mov-4',
        tipo: 'consumo',
        monto: 30000,
        saldo_resultante: 0,
        referencia: 'Venta #V-2026-000',
        fecha: '2026-09-01',
      },
    ],
  },
]

export function GestionGiftCards() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cardSeleccionada, setCardSeleccionada] = useState<GiftCard | null>(null)

  // Modal Nueva Gift Card
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
  const [montoInicial, setMontoInicial] = useState<number>(30000)
  const [destinatarioNombre, setDestinatarioNombre] = useState('')
  const [destinatarioEmail, setDestinatarioEmail] = useState('')
  const [codigoCustom, setCodigoCustom] = useState('')

  const { toast } = useToast()

  const cargarDatos = () => {
    const guardadas = LocalStorageAdapter.get<GiftCard[]>('gift_cards', GIFTCARDS_DEFAULT)
    if (!guardadas || guardadas.length === 0) {
      LocalStorageAdapter.set('gift_cards', GIFTCARDS_DEFAULT)
      setGiftCards(GIFTCARDS_DEFAULT)
    } else {
      setGiftCards(guardadas)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleCrearGiftCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (montoInicial <= 0) {
      toast.warning('Monto Inválido', 'Ingresa un saldo inicial mayor a 0')
      return
    }

    const codigoGenerado =
      codigoCustom.trim().toUpperCase() ||
      `GIFT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    const hoy = new Date()
    const expDate = new Date()
    expDate.setMonth(hoy.getMonth() + 6)

    const nueva: GiftCard = {
      id: Date.now(),
      codigo: codigoGenerado,
      saldo_inicial: montoInicial,
      saldo_actual: montoInicial,
      cliente_destinatario_nombre: destinatarioNombre.trim() || undefined,
      cliente_destinatario_email: destinatarioEmail.trim() || undefined,
      fecha_emision: hoy.toISOString().slice(0, 10),
      fecha_expiracion: expDate.toISOString().slice(0, 10),
      estado: 'activa',
      movimientos: [
        {
          id: `mov-${Date.now()}`,
          tipo: 'emision',
          monto: montoInicial,
          saldo_resultante: montoInicial,
          fecha: hoy.toISOString().slice(0, 10),
        },
      ],
    }

    const actualizadas = [nueva, ...giftCards]
    LocalStorageAdapter.set('gift_cards', actualizadas)
    setGiftCards(actualizadas)
    setModalNuevoAbierto(false)
    toast.success('Gift Card Emitida', `Código ${nueva.codigo} listo para canjear`)
  }

  const cardsFiltradas = giftCards.filter((g) => {
    const q = busqueda.toLowerCase().trim()
    if (!q) return true
    return (
      g.codigo.toLowerCase().includes(q) ||
      (g.cliente_destinatario_nombre && g.cliente_destinatario_nombre.toLowerCase().includes(q)) ||
      (g.cliente_destinatario_email && g.cliente_destinatario_email.toLowerCase().includes(q))
    )
  })

  const totalSaldoEnCirculacion = giftCards
    .filter((g) => g.estado === 'activa')
    .reduce((acc, g) => acc + g.saldo_actual, 0)

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Tarjetas de Regalo / Gift Cards
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Emite tarjetas con saldo prepagado, haz seguimiento de consumos y canjéalas como medio de pago en el POS.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setMontoInicial(30000)
            setDestinatarioNombre('')
            setDestinatarioEmail('')
            setCodigoCustom('')
            setModalNuevoAbierto(true)
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Emitir Gift Card
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-full">
              Saldo en Circulación
            </span>
            <CreditCard className="w-4 h-4 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalSaldoEnCirculacion.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Disponible para compras</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Activas
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {giftCards.filter((g) => g.estado === 'activa').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Tarjetas vigentes</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              Histórico
            </span>
            <Sparkles className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {giftCards.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total emitidas</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código (ej. GIFT-2026), destinatario o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Grid de Cards */}
      {cardsFiltradas.length === 0 ? (
        <EmptyState
          title="Sin tarjetas de regalo"
          description="Crea tarjetas de regalo para programas de fidelización o regalos empresariales."
          icon={<Gift className="w-10 h-10 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cardsFiltradas.map((card) => (
            <div
              key={card.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                        {card.codigo}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Emitida: {card.fecha_emision}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={card.estado === 'activa' ? 'success' : 'default'}
                    size="sm"
                  >
                    {card.estado.toUpperCase()}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Saldo Disponible:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ${card.saldo_actual.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Monto Original:</span>
                    <span>${card.saldo_inicial.toLocaleString()}</span>
                  </div>
                </div>

                {card.cliente_destinatario_nombre && (
                  <div className="space-y-1 text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{card.cliente_destinatario_nombre}</span>
                    </div>
                    {card.cliente_destinatario_email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{card.cliente_destinatario_email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Vence: {card.fecha_expiracion || 'Sin vencimiento'}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCardSeleccionada(card)}
                >
                  Movimientos ({card.movimientos.length})
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Historial de Movimientos */}
      {cardSeleccionada && (
        <Modal
          isOpen={true}
          onClose={() => setCardSeleccionada(null)}
          title={`Movimientos ${cardSeleccionada.codigo}`}
        >
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
              <div>
                <p className="text-slate-400">Saldo Actual</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  ${cardSeleccionada.saldo_actual.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Monto Inicial</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  ${cardSeleccionada.saldo_inicial.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Transacciones</span>
              {cardSeleccionada.movimientos.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {m.tipo === 'emision' ? 'Emisión / Carga' : 'Canje / Consumo POS'}
                    </span>
                    {m.referencia && (
                      <span className="block text-[10px] text-slate-400">{m.referencia}</span>
                    )}
                    <span className="text-[10px] text-slate-400">{m.fecha}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold ${
                        m.tipo === 'emision' ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {m.tipo === 'emision' ? '+' : '-'}${m.monto.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Quedó: ${m.saldo_resultante.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <Button onClick={() => setCardSeleccionada(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Emitir Gift Card */}
      {modalNuevoAbierto && (
        <Modal
          isOpen={true}
          onClose={() => setModalNuevoAbierto(false)}
          title="Emitir Tarjeta de Regalo"
        >
          <form onSubmit={handleCrearGiftCard} className="space-y-4">
            <Input
              label="Monto o Saldo Inicial ($) *"
              type="number"
              min={1000}
              step={1000}
              value={montoInicial}
              onChange={(e) => setMontoInicial(Number(e.target.value))}
              required
            />
            <Input
              label="Código Personalizado (Opcional)"
              placeholder="Ej. REGALO-MAMA-2026 (Dejar vacío para autogenerar)"
              value={codigoCustom}
              onChange={(e) => setCodigoCustom(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre Destinatario"
                placeholder="Ej. Ana Sepúlveda"
                value={destinatarioNombre}
                onChange={(e) => setDestinatarioNombre(e.target.value)}
              />
              <Input
                label="Email Destinatario"
                type="email"
                placeholder="ana@ejemplo.com"
                value={destinatarioEmail}
                onChange={(e) => setDestinatarioEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setModalNuevoAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Emitir y Guardar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
