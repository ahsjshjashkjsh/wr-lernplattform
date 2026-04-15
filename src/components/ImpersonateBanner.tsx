'use client'
import { useEffect, useState } from 'react'
import { Shield, X } from 'lucide-react'

export function ImpersonateBanner() {
  const [active, setActive] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/impersonate')
      .then(r => r.json())
      .then(d => setActive(d.active))
      .catch(() => {})
  }, [])

  if (!active) return null

  async function stopImpersonate() {
    setLeaving(true)
    await fetch('/api/admin/impersonate', { method: 'DELETE' })
    window.location.href = '/admin'
  }

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl text-sm font-medium"
      style={{
        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Shield size={15} />
      <span>Du siehst die Seite als anderer Benutzer</span>
      <button
        onClick={stopImpersonate}
        disabled={leaving}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:bg-white/20 disabled:opacity-60"
        style={{ background: 'rgba(255,255,255,0.15)' }}
      >
        <X size={12} />
        {leaving ? 'Zurück...' : 'Zurück zum Admin'}
      </button>
    </div>
  )
}
