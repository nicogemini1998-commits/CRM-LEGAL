'use client'

import { AuthProvider } from '@/components/auth/AuthProvider'
import { ToastProvider } from '@/components/ui/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  )
}
