import React from 'react'
import { useContext } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { ToastContainer } from '@/components/ui'
import { AppContext } from '@/context/AppContext'

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  const app = useContext(AppContext)

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <Navbar />
      {app?.sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          onClick={() => app.toggleSidebar()}
          className="fixed inset-x-0 bottom-0 top-16 z-10 bg-slate-950/25 md:hidden"
        />
      )}
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 animate-fade-in sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

