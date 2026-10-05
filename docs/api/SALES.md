# SALES & CASH REGISTER MODULE API CONTRACT

## Endpoint
`/api/ventas`
`/api/ventas/:id`
`/api/ventas/:id/cancelar`
`/api/caja/sesion-actual`
`/api/caja/abrir`
`/api/caja/:id/cerrar`
`/api/caja/movimientos`

## Method
- `GET /api/ventas` — Historial de transacciones comerciales
- `POST /api/ventas` — Emitir venta (POS)
- `GET /api/ventas/:id` — Detalle de venta
- `POST /api/ventas/:id/cancelar` — Cancelar o anular venta
- `GET /api/caja/sesion-actual` — Estado de la caja abierta
- `POST /api/caja/abrir` — Apertura de caja con fondo inicial
- `POST /api/caja/:id/cerrar` — Cierre y arqueo de caja con conteo final
- `POST /api/caja/movimientos` — Registro manual de entrada o salida de efectivo

## Authentication
Bearer JWT Token requerido.

## Required Permission
- Ventas: `sales.read`, `sales.create`
- Caja: `sales.manage` o `sales.create`

## Request

### Registrar Venta (`POST /api/ventas`)
```json
{
  "cliente_id": 1,
  "items": [
    {
      "id": "item-1",
      "tipo": "servicio",
      "referencia_id": 1,
      "nombre": "Consulta General",
      "precio_unitario": 50,
      "cantidad": 1,
      "descuento_item": 0,
      "total": 50
    },
    {
      "id": "item-2",
      "tipo": "producto",
      "referencia_id": 2,
      "nombre": "Shampoo Profesional 500ml",
      "precio_unitario": 25,
      "cantidad": 2,
      "descuento_item": 5,
      "total": 45
    }
  ],
  "subtotal": 100,
  "descuento_global": 5,
  "impuesto": 15.2,
  "total": 110.2,
  "metodo_pago": "tarjeta",
  "estado": "PAID",
  "notas": "Cliente solicitó comprobante digital"
}
```

### Apertura de Caja (`POST /api/caja/abrir`)
```json
{
  "monto_inicial": 200.00
}
```

### Cierre de Caja (`POST /api/caja/:id/cerrar`)
```json
{
  "monto_final": 485.50
}
```

## Response

### Venta Registrada
```json
{
  "success": true,
  "message": "Venta registrada con éxito",
  "data": {
    "id": 89,
    "numero": "VTA-2026-089",
    "total": 110.2,
    "metodo_pago": "tarjeta",
    "estado": "PAID",
    "created_at": "2026-09-25T20:35:00Z"
  }
}
```

### Cierre de Caja
```json
{
  "success": true,
  "message": "Caja cerrada correctamente",
  "data": {
    "id": 12,
    "monto_inicial": 200.00,
    "total_ventas": 300.00,
    "total_ingresos": 0.00,
    "total_egresos": 14.50,
    "monto_final": 485.50,
    "diferencia": 0.00,
    "estado": "cerrada",
    "cierre_at": "2026-09-25T21:00:00Z"
  }
}
```

## Business Rules
1. No se puede emitir una venta con método de pago `efectivo` si no existe una sesión de caja abierta en la sucursal actual.
2. La venta descuenta automáticamente el stock en el módulo de Inventario para los ítems de tipo `producto`.
3. El cierre de caja calcula la diferencia entre el saldo teórico y el saldo real contado por el cajero.
