'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, User, Send, X, Zap, Loader2, MessageCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  { label: 'Einfacher',       prompt: 'Bitte erkläre das nochmals einfacher und mit einem konkreten Beispiel.' },
  { label: 'Beispiel',        prompt: 'Kannst du mir ein konkretes Beispiel dazu geben?' },
  { label: 'Zusammenfassung', prompt: 'Fasse das Wichtigste des aktuellen Themas kurz zusammen.' },
  { label: '3 Fragen',        prompt: 'Erstelle 3 Übungsfragen zu diesem Thema.' },
]

export function FloatingChat() {
  const [isOpen, setIsOpen]     = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content ?? 'Entschuldigung, ich konnte keine Antwort generieren.',
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Es ist ein Fehler aufgetreten. Bitte versuche es nochmals.',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Chat schliessen' : 'Assistent öffnen'}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200"
        style={
          isOpen
            ? { background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }
            : { background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 4px 24px rgba(99,102,241,0.45)' }
        }
      >
        {isOpen
          ? <><X size={15} /> Schliessen</>
          : <><MessageCircle size={15} /> Assistent</>
        }
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-[4.5rem] right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: '22rem',
            height: '520px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.2))',
              borderBottom: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                <Bot size={15} className="text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">KI-Lernassistent</p>
                <p className="text-[10px]" style={{ color: 'rgba(196,181,253,0.7)' }}>WR Abschlussprüfung 2026</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-xs font-medium px-2 py-1 rounded-lg transition-all"
                style={{ color: 'rgba(196,181,253,0.7)', background: 'rgba(139,92,246,0.1)' }}
              >
                Leeren
              </button>
            )}
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          >
            {messages.length === 0 && (
              <div className="text-center py-10">
                <Bot size={28} className="text-violet-400/40 mx-auto mb-2" />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Wie kann ich dir helfen?</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Stelle eine Frage zu WR</p>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-1.5`}>
                {msg.role === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
                  >
                    <Bot size={11} className="text-violet-400" />
                  </div>
                )}
                <div
                  className="max-w-[85%] px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.role === 'user'
                      ? { background: 'linear-gradient(135deg,#7c3aed,#6366f1)', color: '#fff', borderRadius: '14px 14px 4px 14px' }
                      : { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '4px 14px 14px 14px' }
                  }
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}
                  >
                    <User size={11} className="text-blue-400" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
                >
                  <Bot size={11} className="text-violet-400" />
                </div>
                <div
                  className="px-3 py-2.5"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px 14px 14px 14px' }}
                >
                  <div className="flex gap-1 items-center">
                    {[0, 150, 300].map(d => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: 'var(--text-muted)', animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          <div
            className="px-3 py-2 flex gap-1.5 overflow-x-auto shrink-0"
            style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
          >
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.prompt)}
                disabled={loading}
                className="shrink-0 flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full transition-all disabled:opacity-40"
                style={{
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  color: '#a78bfa',
                }}
              >
                <Zap size={9} />
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            className="p-3 shrink-0"
            style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
          >
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Frage stellen… (Enter = senden)"
                rows={2}
                disabled={loading}
                className="flex-1 resize-none rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/40 disabled:opacity-60"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
              >
                {loading
                  ? <Loader2 size={13} className="text-white animate-spin" />
                  : <Send size={13} className="text-white" />
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
