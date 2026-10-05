# INVENTORY MODULE API CONTRACT

## Endpoint
`/api/productos`
`/api/productos/:id`
`/api/movimientos-stock`
`/api/alertas-stock`

## Method
- `GET /api/productos` — Catálogo de productos en inventario
- `POST /api/productos` — Crear nuevo producto
- `GET /api/productos/:id` — Detalle del producto
- `PUT /api/productos/:id` — Modificar producto
- `DELETE /api/productos/:id` — Eliminar o descatalogar producto
- `GET /api/movimientos-stock` — Historial de entradas, salidas y mermas
- `POST /api/movimientos-stock` — Registrar movimiento de stock
- `GET /api/alertas-stock` — Listado de productos bajo o igual al stock mínimo

## Authentication
Bearer JWT Token requerido.

## Required Permission
- Lectura: `inventory.read`
- Modificación/Movimientos: `inventory.manage`

## Request

### Registrar Producto (`POST /api/productos`)
```json
{
  "sku": "PROD-009",
  "nombre": "Kit Sérum Reparador Noche 30ml",
  "categoria": "Productos de Belleza",
  "precio_venta": 45.0,
  "precio_costo": 20.0,
  "stock_actual": 25,
  "stock_minimo": 8,
  "unidad": "unidad",
  "proveedor": "Laboratorios Dermocare",
  "activo": true
}
```

### Registrar Movimiento (`POST /api/movimientos-stock`)
```json
{
  "producto_id": 9,
  "tipo": "PURCHASE",
  "cantidad": 15,
  "motivo": "Reabastecimiento mensual orden de compra #8812",
  "referencia": "FAC-PROV-991"
}
```

Tipos de Movimiento permitidos:
- `PURCHASE`: Entrada por compra a proveedor (suma stock).
- `SALE`: Salida por venta a cliente (resta stock).
- `ADJUSTMENT`: Corrección manual por inventario físico.
- `RETURN`: Devolución de cliente o anulación (suma stock).
- `LOSS`: Merma, rotura o vencimiento (resta stock).
- `TRANSFER`: Transferencia entre sucursales.

## Response

### Alertas de Stock (`GET /api/alertas-stock`)
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "producto_id": 2,
      "producto": {
        "id": 2,
        "sku": "PROD-002",
        "nombre": "Aceite de Masaje Relajante Lavanda 250ml",
        "stock_actual": 3,
        "stock_minimo": 6
      },
      "stock_actual": 3,
      "stock_minimo": 6
    }
  ]
}
```

## Business Rules
1. No se permiten valores de stock negativo; si una venta o merma excede el stock actual, la API debe rechazar con `409 Conflict`.
2. Todo movimiento registra el usuario que lo ejecutó, la fecha exacta y la cantidad anterior y nueva para trazabilidad de auditoría.
