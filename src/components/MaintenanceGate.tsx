'use client'
import { useAuth } from '@/components/AuthProvider'
import { usePathname } from 'next/navigation'

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Loginseite immer zugänglich (damit Admin sich einloggen kann)
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email')

  if (isAuthPage) return <>{children}</>

  // Während Auth lädt — nichts zeigen
  if (loading) return null

  // Alle eingeloggten User sehen die Plattform
  return <>{children}</>
}
