import { authHandlers }          from './auth.handlers'
import { citasHandlers }         from './citas.handlers'
import { serviciosHandlers }     from './servicios.handlers'
import { empleadosHandlers }     from './empleados.handlers'
import { clientesHandlers }      from './clientes.handlers'
import { pagosHandlers }         from './pagos.handlers'
import { integracionesHandlers } from './integraciones.handlers'
import { configuracionHandlers }  from './configuracion.handlers'
import { crmHandlers }            from './crm.handlers'
import { usuariosHandlers }       from './usuarios.handlers'
import { rolesHandlers }          from './roles.handlers'
import { inventarioHandlers }     from './inventario.handlers'
import { ventasHandlers }         from './ventas.handlers'


export const handlers = [
  ...authHandlers,
  ...citasHandlers,
  ...serviciosHandlers,
  ...empleadosHandlers,
  ...clientesHandlers,
  ...pagosHandlers,
  ...integracionesHandlers,
  ...configuracionHandlers,
  ...crmHandlers,
  ...usuariosHandlers,
  ...rolesHandlers,
  ...inventarioHandlers,
  ...ventasHandlers,
]
