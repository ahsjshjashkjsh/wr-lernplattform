'use client'
import { useAuth } from '@/components/AuthProvider'
import { usePathname } from 'next/navigation'
import { Construction, Clock, Sparkles } from 'lucide-react'

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

  // Admins sehen alles normal
  if (user?.isAdmin) return <>{children}</>

  // Alle anderen → Wartungsseite
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">

        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
              border: '1px solid rgba(99,102,241,0.3)',
              boxShadow: '0 0 40px rgba(99,102,241,0.15)',
            }}
          >
            <Construction size={36} className="text-indigo-400" />
          </div>
        </div>

        {/* Titel */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Plattform wird überarbeitet
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Die HMS-Lernplattform befindet sich aktuell in einem grossen Umbau.
            Alle Inhalte werden von Grund auf neu aufgebaut — für ein deutlich besseres Lernerlebnis.
          </p>
        </div>

        {/* Badge Montag */}
        <div
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium"
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            color: '#4ade80',
          }}
        >
          <Clock size={15} />
          Voraussichtlich wieder verfügbar: <strong>Montag, 30. März 2026</strong>
        </div>

        {/* Hinweis */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl text-left text-sm"
          style={{
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.15)',
            color: 'var(--text-muted)',
          }}
        >
          <Sparkles size={15} className="text-indigo-400 mt-0.5 shrink-0" />
          <span>
            Wir bitten um etwas Geduld — das Ergebnis wird sich lohnen.
            Die finale Version bringt vollständige Theorie, Buchungssätze und Übungen direkt aus dem Lehrmittel.
          </span>
        </div>

      </div>
    </div>
  )
}
