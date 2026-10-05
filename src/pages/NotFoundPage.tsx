import { Link } from 'react-router-dom'
import { CalendarDays, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-6 px-4">
        <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mx-auto">
          <CalendarDays className="w-10 h-10 text-primary-500" />
        </div>
        <div>
          <h1 className="text-7xl font-bold text-primary-600">404</h1>
          <h2 className="text-2xl font-semibold mt-2">Página no encontrada</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            La página que buscas no existe o fue movida.
          </p>
        </div>
        <Link to="/dashboard">
          <Button leftIcon={<ArrowLeft className="w-4 h-4" />} size="lg">
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

