'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function VerifyContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setState('error'); setError('Kein Token angegeben.'); return }
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok) { setState('success'); setTimeout(() => { window.location.href = '/' }, 2000) }
        else { setState('error'); setError(data.error ?? 'Verifizierung fehlgeschlagen.') }
      })
      .catch(() => { setState('error'); setError('Verbindungsfehler.') })
  }, [token])

  return (
    <div className="glass rounded-2xl p-8 border text-center space-y-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      {state === 'loading' && (
        <>
          <Loader2 size={40} className="mx-auto text-blue-400 animate-spin" />
          <p className="text-slate-300 font-medium">E-Mail wird bestätigt…</p>
        </>
      )}
      {state === 'success' && (
        <>
          <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
          <h2 className="text-lg font-bold text-white">E-Mail bestätigt!</h2>
          <p className="text-slate-400 text-sm">Du wirst weitergeleitet…</p>
        </>
      )}
      {state === 'error' && (
        <>
          <XCircle size={40} className="mx-auto text-red-400" />
          <h2 className="text-lg font-bold text-white">Fehler</h2>
          <p className="text-red-400 text-sm">{error}</p>
          <Link href="/login" className="inline-block text-sm text-blue-400 hover:text-blue-300 font-medium mt-2">
            Zurück zum Login
          </Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
            <TrendingUp size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">HMS-Plattform</h1>
        </div>
        <Suspense fallback={<div className="glass rounded-2xl p-8 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  )
}
