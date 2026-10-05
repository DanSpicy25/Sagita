import React, { useState, useEffect } from 'react'
import {
  Truck,
  Plus,
  ShoppingBag,
  CheckCircle,
  FileText,
  Mail,
  Phone,
  Building2,
  Calendar,
} from 'lucide-react'
import { Proveedor, OrdenCompra, Producto } from '@/types'
import { LocalStorageAdapter } from '@/repositories/local/LocalStorageAdapter'
import { inventarioService } from '@/services/inventario.service'
import {
  Button,
  Badge,
  Modal,
  Input,
  Select,
  Textarea,
  EmptyState,
} from '@/components/ui'
import { useToast } from '@/hooks/useToast'

const PROVEEDORES_DEFAULT: Proveedor[] = [
  {
    id: 1,
    nombre: 'L’Oréal Professional & Cosmetología',
    contacto: 'Carlos Velásquez',
    email: 'contacto@loreal-pro.com',
    telefono: '+56 2 2840 9000',
    direccion: 'Av. Las Condes 11200, Santiago',
    plazo_pago_dias: 30,
    activo: true,
  },
  {
    id: 2,
    nombre: 'BioDerm Insumos Clínicos & SPA',
    contacto: 'Mariana Duarte',
    email: 'ventas@bioderm-spa.cl',
    telefono: '+56 9 9123 4567',
    direccion: 'Providencia 450, Santiago',
    plazo_pago_dias: 15,
    activo: true,
  },
  {
    id: 3,
    nombre: 'Wella Care & Distribuidores',
    contacto: 'Esteban Morales',
    email: 'pedidos@wellacare.com',
    telefono: '+56 2 2789 1100',
    plazo_pago_dias: 30,
    activo: true,
  },
]

export function GestionProveedoresCompras() {
  const [subTab, setSubTab] = useState<'proveedores' | 'ordenes'>('proveedores')
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([])
  const [productos, setProductos] = useState<Producto[]>([])

  // Modal Proveedor
  const [modalProvAbierto, setModalProvAbierto] = useState(false)
  const [nombreProv, setNombreProv] = useState('')
  const [contactoProv, setContactoProv] = useState('')
  const [emailProv, setEmailProv] = useState('')
  const [telProv, setTelProv] = useState('')
  const [dirProv, setDirProv] = useState('')
  const [plazoProv, setPlazoProv] = useState(30)

  // Modal Orden de Compra
  const [modalOCAbierto, setModalOCAbierto] = useState(false)
  const [proveedorOC, setProveedorOC] = useState<number>(1)
  const [productoOC, setProductoOC] = useState<number>(1)
  const [cantidadOC, setCantidadOC] = useState<number>(10)
  const [costoUnitOC, setCostoUnitOC] = useState<number>(5000)
  const [notasOC, setNotasOC] = useState('')

  const { toast } = useToast()

  const cargarDatos = async () => {
    // Proveedores
    const provsGuardados = LocalStorageAdapter.get<Proveedor[]>('proveedores', PROVEEDORES_DEFAULT)
    if (!provsGuardados || provsGuardados.length === 0) {
      LocalStorageAdapter.set('proveedores', PROVEEDORES_DEFAULT)
      setProveedores(PROVEEDORES_DEFAULT)
    } else {
      setProveedores(provsGuardados)
    }

    // Órdenes
    const ordenesGuardadas = LocalStorageAdapter.get<OrdenCompra[]>('ordenes_compra', [])
    setOrdenes(ordenesGuardadas || [])

    // Productos para el selector
    const resProds = await inventarioService.getProductos()
    if (resProds.data) setProductos(resProds.data)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleCrearProveedor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreProv.trim()) {
      toast.warning('Campo requerido', 'Por favor ingresa la razón social del proveedor')
      return
    }

    const nuevo: Proveedor = {
      id: Date.now(),
      nombre: nombreProv.trim(),
      contacto: contactoProv.trim() || undefined,
      email: emailProv.trim() || undefined,
      telefono: telProv.trim() || undefined,
      direccion: dirProv.trim() || undefined,
      plazo_pago_dias: plazoProv,
      activo: true,
    }

    const actualizados = [...proveedores, nuevo]
    LocalStorageAdapter.set('proveedores', actualizados)
    setProveedores(actualizados)
    setModalProvAbierto(false)
    toast.success('Proveedor guardado', `${nuevo.nombre} ha sido registrado`)
  }

  const handleCrearOrdenCompra = async (e: React.FormEvent) => {
    e.preventDefault()
    const prov = proveedores.find((p) => p.id === Number(proveedorOC))
    const prod = productos.find((p) => p.id === Number(productoOC))

    if (!prov || !prod) {
      toast.error('Datos incompletos', 'Selecciona un proveedor y producto válido')
      return
    }

    const subtotal = cantidadOC * costoUnitOC
    const impuesto = Math.round(subtotal * 0.19)
    const total = subtotal + impuesto

    const nuevaOC: OrdenCompra = {
      id: Date.now(),
      numero: `OC-${Math.floor(1000 + Math.random() * 9000)}`,
      proveedor_id: prov.id,
      proveedor_nombre: prov.nombre,
      items: [
        {
          producto_id: prod.id,
          producto_nombre: prod.nombre,
          cantidad: cantidadOC,
          costo_unitario: costoUnitOC,
          total: subtotal,
        },
      ],
      subtotal,
      impuesto,
      total,
      estado: 'ordenada',
      fecha_creacion: new Date().toISOString().slice(0, 10),
      notas: notasOC.trim() || undefined,
    }

    const ordenesActualizadas = [nuevaOC, ...ordenes]
    LocalStorageAdapter.set('ordenes_compra', ordenesActualizadas)
    setOrdenes(ordenesActualizadas)
    setModalOCAbierto(false)
    toast.success('Orden de Compra Creada', `Orden ${nuevaOC.numero} generada exitosamente`)
  }

  const handleRecibirOrden = async (oc: OrdenCompra) => {
    try {
      // Incrementar stock en inventario
      for (const item of oc.items) {
        await inventarioService.registrarMovimiento({
          producto_id: item.producto_id,
          tipo: 'PURCHASE',
          cantidad: item.cantidad,
          motivo: `Recepción Orden de Compra ${oc.numero}`,
        })
      }

      const actualizadas = ordenes.map((o) =>
        o.id === oc.id
          ? { ...o, estado: 'recibida' as const, fecha_recepcion: new Date().toISOString().slice(0, 10) }
          : o
      )
      LocalStorageAdapter.set('ordenes_compra', actualizadas)
      setOrdenes(actualizadas)
      toast.success('Mercadería Recibida', `Stock actualizado para los ítems de la orden ${oc.numero}`)
    } catch {
      toast.error('Error', 'No se pudo actualizar el stock')
    }
  }

  return (
    <div className="space-y-6">
      {/* Sub-Tabs y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('proveedores')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              subTab === 'proveedores'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Directorio de Proveedores ({proveedores.length})
          </button>
          <button
            onClick={() => setSubTab('ordenes')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              subTab === 'ordenes'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Órdenes de Compra ({ordenes.length})
          </button>
        </div>

        {subTab === 'proveedores' ? (
          <Button
            size="sm"
            onClick={() => {
              setNombreProv('')
              setContactoProv('')
              setEmailProv('')
              setTelProv('')
              setDirProv('')
              setModalProvAbierto(true)
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Proveedor
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => {
              if (productos.length > 0) setProductoOC(productos[0].id)
              if (proveedores.length > 0) setProveedorOC(proveedores[0].id)
              setModalOCAbierto(true)
            }}
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Nueva Orden de Compra
          </Button>
        )}
      </div>

      {/* Sub-Tab 1: Proveedores */}
      {subTab === 'proveedores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedores.map((p) => (
            <div
              key={p.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                      {p.nombre}
                    </h4>
                  </div>
                  <Badge variant={p.activo ? 'success' : 'default'} size="sm">
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                {p.contacto && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Contacto: <span className="font-medium text-slate-700 dark:text-slate-200">{p.contacto}</span>
                  </p>
                )}

                <div className="space-y-1 text-xs text-slate-400">
                  {p.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                  {p.telefono && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{p.telefono}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Crédito: {p.plazo_pago_dias} días</span>
                <span className="text-primary-600 dark:text-primary-400 font-medium cursor-pointer">
                  Ver Historial
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-Tab 2: Órdenes de Compra */}
      {subTab === 'ordenes' && (
        <div>
          {ordenes.length === 0 ? (
            <EmptyState
              title="Sin órdenes de compra"
              description="Emite pedidos a tus proveedores para abastecer tus insumos y productos de venta."
              icon={<Truck className="w-10 h-10 text-slate-400" />}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Número OC</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Proveedor</th>
                    <th className="px-4 py-3">Detalle Insumos</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ordenes.map((oc) => (
                    <tr key={oc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-primary-500" />
                        {oc.numero}
                      </td>
                      <td className="px-4 py-3 text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {oc.fecha_creacion}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {oc.proveedor_nombre}
                      </td>
                      <td className="px-4 py-3">
                        {oc.items.map((i) => `${i.cantidad}x ${i.producto_nombre}`).join(', ')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        ${oc.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            oc.estado === 'recibida'
                              ? 'success'
                              : oc.estado === 'ordenada'
                              ? 'info'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {oc.estado.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {oc.estado === 'ordenada' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRecibirOrden(oc)}
                            leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                          >
                            Recibir Stock
                          </Button>
                        )}
                        {oc.estado === 'recibida' && (
                          <span className="text-[11px] text-emerald-600 font-medium">
                            Stock Ingresado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Nuevo Proveedor */}
      {modalProvAbierto && (
        <Modal
          isOpen={true}
          onClose={() => setModalProvAbierto(false)}
          title="Registrar Nuevo Proveedor"
        >
          <form onSubmit={handleCrearProveedor} className="space-y-4">
            <Input
              label="Razón Social / Proveedor *"
              value={nombreProv}
              onChange={(e) => setNombreProv(e.target.value)}
              placeholder="Ej. Distribuidora Central SpA"
              required
            />
            <Input
              label="Persona de Contacto"
              value={contactoProv}
              onChange={(e) => setContactoProv(e.target.value)}
              placeholder="Ej. Juan Pérez"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Email Comercial"
                type="email"
                value={emailProv}
                onChange={(e) => setEmailProv(e.target.value)}
                placeholder="pedidos@empresa.com"
              />
              <Input
                label="Teléfono"
                value={telProv}
                onChange={(e) => setTelProv(e.target.value)}
                placeholder="+56 9 1234 5678"
              />
            </div>
            <Input
              label="Dirección / Casa Matriz"
              value={dirProv}
              onChange={(e) => setDirProv(e.target.value)}
              placeholder="Av. Providencia 123"
            />
            <Input
              label="Plazo de Pago (Días)"
              type="number"
              value={plazoProv}
              onChange={(e) => setPlazoProv(Number(e.target.value))}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setModalProvAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Proveedor</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Nueva Orden de Compra */}
      {modalOCAbierto && (
        <Modal
          isOpen={true}
          onClose={() => setModalOCAbierto(false)}
          title="Emitir Orden de Compra (PO)"
        >
          <form onSubmit={handleCrearOrdenCompra} className="space-y-4">
            <Select
              label="Proveedor *"
              value={proveedorOC}
              onChange={(e) => setProveedorOC(Number(e.target.value))}
              options={proveedores.map((p) => ({ value: p.id, label: p.nombre }))}
            />
            <Select
              label="Insumo / Producto *"
              value={productoOC}
              onChange={(e) => setProductoOC(Number(e.target.value))}
              options={productos.map((p) => ({
                value: p.id,
                label: `${p.nombre} (Stock actual: ${p.stock_actual})`,
              }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cantidad a Pedir *"
                type="number"
                min={1}
                value={cantidadOC}
                onChange={(e) => setCantidadOC(Number(e.target.value))}
                required
              />
              <Input
                label="Costo Unitario ($) *"
                type="number"
                min={1}
                value={costoUnitOC}
                onChange={(e) => setCostoUnitOC(Number(e.target.value))}
                required
              />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${(cantidadOC * costoUnitOC).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IVA (19%):</span>
                <span>${Math.round(cantidadOC * costoUnitOC * 0.19).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total Estimado:</span>
                <span>${Math.round(cantidadOC * costoUnitOC * 1.19).toLocaleString()}</span>
              </div>
            </div>
            <Textarea
              label="Notas u Observaciones"
              value={notasOC}
              onChange={(e) => setNotasOC(e.target.value)}
              placeholder="Instrucciones de entrega, horarios..."
              rows={2}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setModalOCAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Generar Orden</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
