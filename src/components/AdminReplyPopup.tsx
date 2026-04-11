'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { X, Reply } from 'lucide-react'

interface ReplyNotif {
  id: string
  userName: string
  content: string
  originalMessage: string
  createdAt: string
}

const AUTO_DISMISS_MS = 12_000

export function AdminReplyPopup() {
  const { user } = useAuth()
  const [queue, setQueue] = useState<ReplyNotif[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = (id: string) => {
    setQueue(q => q.filter(r => r.id !== id))
    const t = timersRef.current.get(id)
    if (t) { clearTimeout(t); timersRef.current.delete(id) }
  }

  const addReply = (r: ReplyNotif) => {
    setQueue(q => q.find(x => x.id === r.id) ? q : [...q, r])
    const t = setTimeout(() => dismiss(r.id), AUTO_DISMISS_MS)
    timersRef.current.set(r.id, t)
  }

  useEffect(() => {
    if (!user?.isAdmin) {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }

    const poll = async () => {
      try {
        const res = await fetch('/api/admin/replies-poll')
        if (!res.ok) return
        const { replies } = await res.json()
        if (replies?.length) replies.forEach(addReply)
      } catch {}
    }

    poll()
    pollRef.current = setInterval(poll, 10_000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      timersRef.current.forEach(t => clearTimeout(t))
    }
  }, [user?.id, user?.isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!queue.length) return null

  return (
    <div className="fixed bottom-6 left-6 z-[9998] flex flex-col gap-3 max-w-sm w-full">
      {queue.map(r => (
        <div key={r.id}
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #0f2d1b 100%)',
            border: '1px solid rgba(34,197,94,0.3)',
            boxShadow: '0 0 0 1px rgba(34,197,94,0.08), 0 20px 60px rgba(0,0,0,0.5)',
            borderRadius: 16,
            overflow: 'hidden',
            animation: 'slideUpLeft 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <div style={{ height: 3, background: 'linear-gradient(90deg, #16a34a, #22c55e)' }} />
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <Reply size={14} className="text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wide">Antwort von {r.userName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">auf: {r.originalMessage}</p>
                </div>
              </div>
              <button onClick={() => dismiss(r.id)} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
                <X size={15} />
              </button>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed mt-3">{r.content}</p>

            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => dismiss(r.id)}
                className="flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                OK
              </button>
              <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full"
                  style={{ background: '#16a34a', animation: `shrink ${AUTO_DISMISS_MS}ms linear forwards` }} />
              </div>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideUpLeft {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}
