import Link from 'next/link'
import { TrendingUp, Clock } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--accent)' }}>
            <TrendingUp size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>HMS-Plattform</h1>
        </div>

        <div className="rounded-2xl p-8 border text-center space-y-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Clock size={22} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Funktion nicht verfügbar</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Das Zurücksetzen des Passworts ist momentan nicht verfügbar. Bitte wende dich direkt an den Administrator.
            </p>
          </div>
          <Link href="/login" className="inline-block text-sm text-blue-400 hover:text-blue-300 font-medium">
            Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  )
}
