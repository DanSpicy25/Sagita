/**
 * Repositories Container
 * Punto central de inyección de dependencias para los repositorios de datos.
 * Conmuta dinámicamente entre LocalStorage y API Backend según la variable VITE_DATA_MODE.
 */

import { IAppointmentRepository } from './interfaces/IAppointmentRepository'
import { IClientRepository } from './interfaces/IClientRepository'
import { IServiceRepository } from './interfaces/IServiceRepository'
import { IEmployeeRepository } from './interfaces/IEmployeeRepository'
import { ISalesRepository } from './interfaces/ISalesRepository'
import { IInventoryRepository } from './interfaces/IInventoryRepository'
import { IUserRepository } from './interfaces/IUserRepository'

import { LocalAppointmentRepository } from './local/LocalAppointmentRepository'
import { LocalClientRepository } from './local/LocalClientRepository'
import { LocalServiceRepository } from './local/LocalServiceRepository'
import { LocalEmployeeRepository } from './local/LocalEmployeeRepository'
import { LocalSalesRepository } from './local/LocalSalesRepository'
import { LocalInventoryRepository } from './local/LocalInventoryRepository'
import { LocalUserRepository } from './local/LocalUserRepository'

import { ApiAppointmentRepository } from './api/ApiAppointmentRepository'
import { ApiClientRepository } from './api/ApiClientRepository'
import { ApiServiceRepository } from './api/ApiServiceRepository'
import { ApiEmployeeRepository } from './api/ApiEmployeeRepository'
import { ApiSalesRepository } from './api/ApiSalesRepository'
import { ApiInventoryRepository } from './api/ApiInventoryRepository'
import { ApiUserRepository } from './api/ApiUserRepository'

const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'local'
const isApi = DATA_MODE === 'api'

export const appointmentRepository: IAppointmentRepository = isApi
  ? new ApiAppointmentRepository()
  : new LocalAppointmentRepository()

export const clientRepository: IClientRepository = isApi
  ? new ApiClientRepository()
  : new LocalClientRepository()

export const serviceRepository: IServiceRepository = isApi
  ? new ApiServiceRepository()
  : new LocalServiceRepository()

export const employeeRepository: IEmployeeRepository = isApi
  ? new ApiEmployeeRepository()
  : new LocalEmployeeRepository()

export const salesRepository: ISalesRepository = isApi
  ? new ApiSalesRepository()
  : new LocalSalesRepository()

export const inventoryRepository: IInventoryRepository = isApi
  ? new ApiInventoryRepository()
  : new LocalInventoryRepository()

export const userRepository: IUserRepository = isApi
  ? new ApiUserRepository()
  : new LocalUserRepository()

export { LocalStorageAdapter } from './local/LocalStorageAdapter'
