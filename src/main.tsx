import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

async function bootstrap() {
  // Activar MSW en desarrollo y demo salvo que se desactive explícitamente
  if (import.meta.env.VITE_USE_MOCKS !== 'false') {
    try {
      const { worker } = await import('./mocks/browser')
      await worker.start({
        onUnhandledRequest: 'bypass', // no lanza error para assets
      })
      console.info('[MSW] Mocks activos — API interceptada')
    } catch (err) {
      console.warn('[MSW] No se pudo inicializar mock service worker:', err)
    }
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

bootstrap()

