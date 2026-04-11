'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { X, Shield, Send } from 'lucide-react'

interface Message {
  id: string
  message: string
  showSender: boolean
  senderName: string | null
  createdAt: string
}

const AUTO_DISMISS_MS = 10_000

export function AdminMessagePopup() {
  const { user } = useAuth()
  const [queue, setQueue] = useState<Message[]>([])
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replySending, setReplySending] = useState<string | null>(null)
  const [replySent, setReplySent] = useState<Record<string, boolean>>({})
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  async function sendReply(msgId: string) {
    const content = replyText[msgId]?.trim()
    if (!content) return
    setReplySending(msgId)
    await fetch('/api/messages/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: msgId, content }),
    }).catch(() => {})
    setReplySending(null)
    setReplySent(prev => ({ ...prev, [msgId]: true }))
    setReplyText(prev => ({ ...prev, [msgId]: '' }))
  }

  const dismiss = (id: string) => {
    setQueue(q => q.filter(m => m.id !== id))
    const t = timersRef.current.get(id)
    if (t) { clearTimeout(t); timersRef.current.delete(id) }
  }

  const addMessage = (msg: Message) => {
    setQueue(q => [...q, msg])
    const t = setTimeout(() => dismiss(msg.id), AUTO_DISMISS_MS)
    timersRef.current.set(msg.id, t)
  }

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
        if (messages?.length) messages.forEach(addMessage)
      } catch {}
    }

    poll()
    pollRef.current = setInterval(poll, 6_000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      timersRef.current.forEach(t => clearTimeout(t))
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!queue.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      {queue.map(msg => (
        <div
          key={msg.id}
          style={{
            background: msg.showSender
              ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #162032 100%)',
            border: `1px solid ${msg.showSender ? 'rgba(139,92,246,0.4)' : 'rgba(100,116,139,0.3)'}`,
            boxShadow: `0 0 0 1px ${msg.showSender ? 'rgba(139,92,246,0.1)' : 'rgba(100,116,139,0.08)'}, 0 20px 60px rgba(0,0,0,0.5)`,
            borderRadius: 16,
            overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <div style={{ height: 3, background: msg.showSender ? 'linear-gradient(90deg, #7c3aed, #a855f7)' : 'rgba(100,116,139,0.4)' }} />

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              {msg.showSender ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <Shield size={14} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-violet-400 uppercase tracking-wide">Admin-Nachricht</p>
                    {msg.senderName && (
                      <p className="text-[11px] text-slate-400 mt-0.5">von {msg.senderName}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nachricht</p>
              )}
              <button onClick={() => dismiss(msg.id)} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
                <X size={15} />
              </button>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed mt-3">{msg.message}</p>

            {/* Reply */}
            {msg.showSender && (
              <div className="mt-3">
                {replySent[msg.id] ? (
                  <p className="text-xs text-emerald-400">Antwort gesendet ✓</p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Antworten…"
                      value={replyText[msg.id] ?? ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') sendReply(msg.id) }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(139,92,246,0.2)', color: '#e2e8f0' }}
                    />
                    <button
                      onClick={() => sendReply(msg.id)}
                      disabled={replySending === msg.id || !replyText[msg.id]?.trim()}
                      className="px-2.5 py-1.5 rounded-lg disabled:opacity-40 transition-all"
                      style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}
                    >
                      <Send size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => dismiss(msg.id)}
                className="flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors"
                style={{
                  background: msg.showSender ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${msg.showSender ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  color: msg.showSender ? '#a78bfa' : '#94a3b8',
                }}
              >
                Verstanden
              </button>
              {/* Fortschrittsbalken */}
              <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    background: msg.showSender ? '#7c3aed' : '#475569',
                    animation: `shrink ${AUTO_DISMISS_MS}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideUp {
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
