import { FichaCliente360, FichaCliente360Props } from './FichaCliente360'

export type ModalExpedienteClienteProps = FichaCliente360Props

/**
 * ModalExpedienteCliente delegating directly to the modular FichaCliente360 component.
 * Maintained for 100% backward compatibility across Sagita modules.
 */
export function ModalExpedienteCliente(props: FichaCliente360Props) {
  return <FichaCliente360 {...props} />
}

export { FichaCliente360 }
