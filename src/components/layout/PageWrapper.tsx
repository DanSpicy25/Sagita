import React from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { ToastContainer } from '@/components/ui'

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

