export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'