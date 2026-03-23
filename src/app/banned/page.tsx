import Link from 'next/link'
import { Ban } from 'lucide-react'

export default function BannedPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            boxShadow: '0 0 40px rgba(239,68,68,0.3)',
          }}
        >
          <Ban size={32} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-2">Account gesperrt</h1>
        <p className="text-slate-400 text-sm mb-8">
          Dein Account wurde von einem Administrator gesperrt.<br />
          Du hast keinen Zugriff mehr auf die Plattform.
        </p>

        <div
          className="glass rounded-2xl p-4 border mb-6 text-left"
          style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
        >
          <p className="text-xs text-red-300">
            Falls du glaubst, dass dies ein Fehler ist, wende dich an deinen Lehrer oder Administrator.
          </p>
        </div>

        <Link
          href="/login"
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Zurück zum Login
        </Link>
      </div>
    </div>
  )
}
