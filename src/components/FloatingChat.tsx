'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, User, Send, X, MessageCircle, Sparkles, RotateCcw, ChevronDown } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_ACTIONS = [
  { label: 'Einfacher erklären', prompt: 'Bitte erkläre das nochmals einfacher und mit einem konkreten Beispiel.' },
  { label: 'Beispiel geben',     prompt: 'Kannst du mir ein konkretes Praxisbeispiel dazu geben?' },
  { label: 'Zusammenfassen',     prompt: 'Fasse das Wichtigste des aktuellen Themas kurz zusammen.' },
  { label: '3 Übungsfragen',     prompt: 'Erstelle 3 Übungsfragen zu diesem Thema mit Lösungen.' },
]

function formatTime(date: Date) {
  return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
}

/* Simple inline renderer: **bold** → <strong>, newlines → <br> */
function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white/90">{part.slice(2, -2)}</strong>
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
    ))
  })
}

export function FloatingChat() {
  const [isOpen, setIsOpen]         = useState(false)
  const [messages, setMessages]     = useState<Message[]>([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [unread, setUnread]         = useState(0)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)

  /* Auto-scroll on new messages */
  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, isOpen])

  /* Focus input when opened */
  useEffect(() => {
    if (isOpen) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  /* Track scroll position to show/hide scroll-to-bottom button */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 120)
  }, [])

  /* Textarea auto-resize */
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
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
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content ?? 'Entschuldigung, ich konnte keine Antwort generieren.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
      if (!isOpen) setUnread(n => n + 1)
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Es ist ein Fehler aufgetreten. Bitte versuche es nochmals.',
        timestamp: new Date(),
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
      {/* ── Toggle button ── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Chat schliessen' : 'Assistent öffnen'}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-300 select-none"
        style={
          isOpen
            ? {
                background: 'rgba(15,10,30,0.85)',
                border: '1px solid rgba(139,92,246,0.25)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }
            : {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.3)',
              }
        }
      >
        {isOpen ? (
          <><X size={16} /> Schliessen</>
        ) : (
          <>
            <MessageCircle size={16} />
            <span>KI-Assistent</span>
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* ── Chat window ── */}
      <div
        className="fixed z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-300 origin-bottom-right"
        style={{
          bottom: '5.5rem',
          right: '1.5rem',
          width: '26rem',
          height: isOpen ? '600px' : '0px',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(16px)',
          background: 'rgba(10,7,20,0.92)',
          border: '1px solid rgba(139,92,246,0.2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3.5 flex items-center justify-between shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.1) 100%)',
            borderBottom: '1px solid rgba(139,92,246,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Animated AI avatar */}
            <div className="relative">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(99,102,241,0.3))',
                  border: '1px solid rgba(139,92,246,0.4)',
                  boxShadow: '0 0 16px rgba(139,92,246,0.2)',
                }}
              >
                <Sparkles size={16} className="text-violet-300" />
              </div>
              {/* Online dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: '#22c55e', borderColor: 'rgba(10,7,20,0.92)' }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">KI-Lernassistent</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(196,181,253,0.6)' }}>
                WR &amp; FRW · Abschlussprüfung 2026
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              title="Verlauf löschen"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5 active:scale-95"
              style={{ color: 'rgba(196,181,253,0.5)' }}
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.2) transparent' }}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.1))',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
              >
                <Bot size={24} className="text-violet-400" />
              </div>
              <p className="text-sm font-semibold text-white mb-1.5">Wie kann ich dir helfen?</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(196,181,253,0.5)' }}>
                Stelle mir eine Frage zu WR oder FRW — ich erkläre Konzepte, gebe Beispiele und erstelle Übungsfragen.
              </p>
              {/* Suggested prompts */}
              <div className="mt-5 w-full space-y-2">
                {[
                  'Was ist der Unterschied zwischen Aktiv- und Passivkonto?',
                  'Erkläre mir die Mehrwertsteuer einfach.',
                  'Wie funktioniert die Bilanz?',
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="w-full text-left text-xs px-3.5 py-2.5 rounded-xl transition-all hover:border-violet-500/40 active:scale-[0.98]"
                    style={{
                      background: 'rgba(139,92,246,0.05)',
                      border: '1px solid rgba(139,92,246,0.15)',
                      color: 'rgba(196,181,253,0.7)',
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user'
              const showTime =
                idx === messages.length - 1 ||
                Math.abs(messages[idx + 1].timestamp.getTime() - msg.timestamp.getTime()) > 60_000
              return (
                <div key={msg.id}>
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
                    {!isUser && (
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-1"
                        style={{
                          background: 'rgba(139,92,246,0.2)',
                          border: '1px solid rgba(139,92,246,0.3)',
                        }}
                      >
                        <Sparkles size={11} className="text-violet-400" />
                      </div>
                    )}
                    <div
                      className="max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed"
                      style={
                        isUser
                          ? {
                              background: 'linear-gradient(135deg, #7c3aed, #5b5ef4)',
                              color: '#fff',
                              borderRadius: '16px 16px 4px 16px',
                              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.07)',
                              color: 'rgba(226,220,255,0.85)',
                              borderRadius: '4px 16px 16px 16px',
                            }
                      }
                    >
                      {renderContent(msg.content)}
                    </div>
                    {isUser && (
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-1"
                        style={{
                          background: 'rgba(59,130,246,0.2)',
                          border: '1px solid rgba(59,130,246,0.3)',
                        }}
                      >
                        <User size={11} className="text-blue-400" />
                      </div>
                    )}
                  </div>
                  {showTime && (
                    <p
                      className={`text-[10px] mt-1 ${isUser ? 'text-right mr-8' : 'ml-8'}`}
                      style={{ color: 'rgba(255,255,255,0.18)' }}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  )}
                </div>
              )
            })
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                <Sparkles size={11} className="text-violet-400" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '4px 16px 16px 16px',
                }}
              >
                <div className="flex gap-1.5 items-center h-3">
                  {[0, 160, 320].map(d => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'rgba(167,139,250,0.6)', animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all hover:scale-105"
            style={{
              bottom: '9.5rem',
              background: 'rgba(139,92,246,0.9)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}
          >
            <ChevronDown size={12} /> Nach unten
          </button>
        )}

        {/* Quick actions */}
        <div
          className="px-3 pt-2.5 pb-1.5 flex gap-1.5 overflow-x-auto shrink-0"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.02)',
            scrollbarWidth: 'none',
          }}
        >
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={() => sendMessage(action.prompt)}
              disabled={loading}
              className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full transition-all disabled:opacity-30 hover:border-violet-500/40 active:scale-95"
              style={{
                background: 'rgba(139,92,246,0.07)',
                border: '1px solid rgba(139,92,246,0.18)',
                color: 'rgba(196,181,253,0.75)',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          className="px-3 pb-3 pt-2 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div
            className="flex gap-2 items-end rounded-xl px-3 py-2 transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Frage stellen… (Enter senden, Shift+Enter neue Zeile)"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-[13px] focus:outline-none disabled:opacity-50 placeholder:text-white/20"
              style={{
                color: 'rgba(226,220,255,0.9)',
                maxHeight: '120px',
                lineHeight: '1.5',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95 shrink-0"
              style={{
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
                  : 'rgba(139,92,246,0.15)',
                boxShadow: input.trim() && !loading ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
              }}
            >
              <Send size={13} className="text-white" style={{ transform: 'translateX(1px)' }} />
            </button>
          </div>
          <p className="text-center text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.12)' }}>
            KI kann Fehler machen — wichtige Infos überprüfen
          </p>
        </div>
      </div>
    </>
  )
}
