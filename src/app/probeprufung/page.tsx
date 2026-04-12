import { getCurrentUser, isPremiumActive } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Crown, Lock } from 'lucide-react'
import ProbeprufungContent from '@/components/ProbeprufungContent'

export const dynamic = 'force-dynamic'

export default async function ProbeprufungPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?next=/probeprufung')
  }

  const hasPremium = (user as any).isCreator || isPremiumActive(user)

  if (!hasPremium) {
    return (
      <div className="max-w-lg mx-auto pt-20 px-4">
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <Lock size={24} className="text-amber-400" />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Premium-Inhalt
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Die Probeprüfung ist nur für Premium-Mitglieder verfügbar. Schalte deinen Zugang frei und übe gezielt für die Abschlussprüfung.
          </p>
          <a
            href="/premium"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <Crown size={15} />
            Premium freischalten — CHF 5 / Monat
          </a>
        </div>
      </div>
    )
  }

  return <ProbeprufungContent />
}
