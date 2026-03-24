'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { X, Shield } from 'lucide-react'

interface Message {
  id: string
  message: string
  createdAt: string
}

export function AdminMessagePopup() {
  const { user } = useAuth()
  const [queue, setQueue] = useState<Message[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!user) {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }

    const poll = async () => {
      try {
        const res = await fetch('/api/messages/poll')
        if (!res.ok) return
        const { messages } = await res.json()
        if (messages?.length) setQueue(q => [...q, ...messages])
      } catch {}
    }

    poll()
    pollRef.current = setInterval(poll, 6_000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = (id: string) => setQueue(q => q.filter(m => m.id !== id))

  if (!queue.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      {queue.map(msg => (
        <div
          key={msg.id}
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            border: '1px solid rgba(139,92,246,0.4)',
            boxShadow: '0 0 0 1px rgba(139,92,246,0.15), 0 20px 60px rgba(0,0,0,0.5)',
            borderRadius: 16,
            overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Farbiger Streifen oben */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }} />

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
                >
                  <Shield size={14} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-violet-400 uppercase tracking-wide">Admin-Nachricht</p>
                </div>
              </div>
              <button
                onClick={() => dismiss(msg.id)}
                className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed mt-3">{msg.message}</p>

            <button
              onClick={() => dismiss(msg.id)}
              className="mt-3 w-full text-xs font-medium text-violet-400 py-1.5 rounded-lg transition-colors hover:text-violet-300"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
            >
              Verstanden
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
