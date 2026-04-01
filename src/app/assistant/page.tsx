'use client'

import { useState, useRef, useEffect, use, useCallback } from 'react'
import {
  Bot, User, Send, Sparkles, BookOpen, HelpCircle,
  FileText, Lightbulb, Copy, Check, RotateCcw, ChevronDown,
  Zap, AlertCircle,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

/* ─── Quick actions ─────────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { icon: Lightbulb,  label: 'Einfacher erklären', prompt: 'Bitte erkläre das nochmals einfacher und mit einem konkreten Beispiel.' },
  { icon: FileText,   label: 'Zusammenfassen',     prompt: 'Fasse das Wichtigste des aktuellen Themas kurz zusammen.' },
  { icon: HelpCircle, label: '3 Übungsfragen',     prompt: 'Erstelle 3 Übungsfragen zu diesem Thema, mit Lösungen.' },
  { icon: BookOpen,   label: 'Praxisbeispiel',     prompt: 'Gib mir ein konkretes Praxisbeispiel aus dem Berufsalltag dazu.' },
]

/* ─── Capability cards (empty state) ───────────────────────────────── */
const CAPABILITIES = [
  {
    icon: BookOpen,
    title: 'Themen erklären',
    description: 'Ich erkläre WR und FRW Konzepte verständlich — auf dein Niveau angepasst.',
    prompt: 'Was ist der Unterschied zwischen Aktiv- und Passivkonto?',
  },
  {
    icon: HelpCircle,
    title: 'Übungsfragen',
    description: 'Ich erstelle Übungsfragen mit Lösungen, damit du dich auf die Prüfung vorbereitest.',
    prompt: 'Erstelle 3 Prüfungsfragen zur Mehrwertsteuer mit Lösungen.',
  },
  {
    icon: Lightbulb,
    title: 'Beispiele geben',
    description: 'Ich veranschauliche abstrakte Konzepte mit konkreten Praxisbeispielen.',
    prompt: 'Erkläre mir die Bilanz anhand eines einfachen Beispiels.',
  },
  {
    icon: Zap,
    title: 'Prüfungsvorbereitung',
    description: 'Ich helfe dir gezielt bei den Themen der Abschlussprüfung 2026.',
    prompt: 'Welche Themen sind für die WR Abschlussprüfung 2026 besonders wichtig?',
  },
]

/* ─── Inline markdown renderer ─────────────────────────────────────── */
function renderContent(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Heading (##)
    if (line.startsWith('## ')) {
      elements.push(
        <p key={i} className="font-bold text-white/90 mt-3 mb-1 first:mt-0">
          {line.slice(3)}
        </p>
      )
      i++; continue
    }
    // Heading (#)
    if (line.startsWith('# ')) {
      elements.push(
        <p key={i} className="font-bold text-white mt-3 mb-1 text-[15px] first:mt-0">
          {line.slice(2)}
        </p>
      )
      i++; continue
    }
    // List item
    if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span style={{ color: 'rgba(167,139,250,0.8)' }} className="shrink-0 mt-0.5">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      )
      i++; continue
    }
    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)/)
    if (numMatch) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span style={{ color: 'rgba(167,139,250,0.8)' }} className="shrink-0 font-medium text-xs mt-0.5 w-4">{numMatch[1]}.</span>
          <span>{renderInline(numMatch[2])}</span>
        </div>
      )
      i++; continue
    }
    // Empty line → spacing
    if (line.trim() === '') {
      if (elements.length > 0) elements.push(<div key={i} className="h-1.5" />)
      i++; continue
    }
    // Normal paragraph
    elements.push(<p key={i} className="leading-relaxed">{renderInline(line)}</p>)
    i++
  }
  return <>{elements}</>
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="text-[12px] font-mono px-1 py-0.5 rounded"
          style={{ background: 'rgba(139,92,246,0.2)', color: '#c4b5fd' }}>
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white/90">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-white/80">{part.slice(1, -1)}</em>
    }
    return <span key={i}>{part}</span>
  })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
}

/* ─── Copy button ───────────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-white/5"
      title="Kopieren"
      style={{ color: 'rgba(255,255,255,0.3)' }}
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
    </button>
  )
}

/* ─── Message bubble ────────────────────────────────────────────────── */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5 group`}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(99,102,241,0.25))',
            border: '1px solid rgba(139,92,246,0.35)',
            boxShadow: '0 0 12px rgba(139,92,246,0.15)',
          }}
        >
          <Sparkles size={12} className="text-violet-300" />
        </div>
      )}

      <div className={`max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}>
        <div
          className="px-4 py-3 text-[13.5px] leading-relaxed"
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, #7c3aed, #5b5ef4)',
                  color: '#fff',
                  borderRadius: '16px 16px 4px 16px',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                }
              : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(226,220,255,0.85)',
                  borderRadius: '4px 16px 16px 16px',
                }
          }
        >
          {isUser ? message.content : renderContent(message.content)}
        </div>
        <div className={`flex items-center gap-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            {formatTime(message.timestamp)}
          </span>
          {!isUser && <CopyButton text={message.content} />}
        </div>
      </div>

      {isUser && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
          style={{
            background: 'rgba(59,130,246,0.2)',
            border: '1px solid rgba(59,130,246,0.3)',
          }}
        >
          <User size={12} className="text-blue-400" />
        </div>
      )}
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────────── */
export default function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string }>
}) {
  const params = use(searchParams)
  const chapterId = params.chapter

  const [messages, setMessages]         = useState<Message[]>([])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [noApiKey, setNoApiKey]         = useState(false)
  const [chapterTitle, setChapterTitle] = useState<string | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [msgCount, setMsgCount]         = useState(0)

  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const scrollRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chapterId) {
      fetch(`/api/chapters/${chapterId}`)
        .then(r => r.json())
        .then(data => { if (data.chapter?.title) setChapterTitle(data.chapter.title) })
        .catch(() => {})
    }
  }, [chapterId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  /* Auto-resize textarea */
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [input])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 150)
  }, [])

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
    setMsgCount(n => n + 1)

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          chapterId: chapterId ?? null,
        }),
      })
      const data = await res.json()
      if (data.error === 'NO_API_KEY') { setNoApiKey(true); return }
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content ?? 'Entschuldigung, ich konnte keine Antwort generieren.',
        timestamp: new Date(),
      }])
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

  /* ── No API key state ── */
  if (noApiKey) {
    return (
      <div className="max-w-lg mx-auto mt-16 fade-in">
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(245,158,11,0.05)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <AlertCircle size={24} className="text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-amber-400 mb-2">API-Schlüssel fehlt</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Der KI-Assistent benötigt einen <strong className="text-white/80">OpenAI API-Schlüssel</strong>.
          </p>
          <code
            className="text-xs font-mono px-3 py-1.5 rounded-lg block"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            OPENAI_API_KEY=sk-... in .env.local
          </code>
        </div>
      </div>
    )
  }

  const hasMessages = messages.length > 0

  return (
    <div
      className="-mt-6 sm:-mt-10 -mb-6 sm:-mb-10 fade-in flex flex-col"
      style={{
        height: 'calc(100dvh - 56px)',
        marginLeft: 'calc(50% - 50vw)',
        width: '100vw',
        overflowX: 'hidden',
      }}
    >

      {/* ── Header ── */}
      <div
        className="shrink-0 w-full"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(139,92,246,0.15)',
        }}
      >
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(99,102,241,0.25))',
                border: '1px solid rgba(139,92,246,0.4)',
                boxShadow: '0 0 20px rgba(139,92,246,0.2)',
              }}
            >
              <Sparkles size={18} className="text-violet-300" />
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{ background: '#22c55e', borderColor: '#0a0714' }}
            />
          </div>
          <div>
            <h1 className="font-bold text-white leading-tight">KI-Lernassistent</h1>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(196,181,253,0.5)' }}>
              WR &amp; FRW · Abschlussprüfung 2026 · GPT-4o mini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chapter context chip */}
          {chapterTitle && (
            <div
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                color: 'rgba(196,181,253,0.8)',
              }}
            >
              <BookOpen size={11} />
              <span className="max-w-[180px] truncate">{chapterTitle}</span>
            </div>
          )}
          {/* Stats */}
          {hasMessages && (
            <div
              className="text-[11px] px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              {msgCount} Nachrichten
            </div>
          )}
          {/* Clear button */}
          {hasMessages && (
            <button
              onClick={() => { setMessages([]); setMsgCount(0) }}
              title="Verlauf löschen"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5 active:scale-95"
              style={{ color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>
      </div>

      {/* ── Messages area ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative"
        style={{
          background: 'rgba(0,0,0,0.2)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(139,92,246,0.15) transparent',
        }}
      >
        {!hasMessages ? (
          /* ── Empty state ── */
          <div className="p-6 pb-4 max-w-4xl mx-auto w-full">
            {/* Welcome */}
            <div className="text-center mb-8 pt-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.1))',
                  border: '1px solid rgba(139,92,246,0.25)',
                  boxShadow: '0 0 40px rgba(139,92,246,0.1)',
                }}
              >
                <Bot size={28} className="text-violet-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1.5">
                {chapterTitle ? `Ich helfe dir bei „${chapterTitle}"` : 'Wie kann ich dir helfen?'}
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Stelle mir eine Frage oder wähle eine der Optionen unten.
              </p>
            </div>

            {/* Capability cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {CAPABILITIES.map(cap => (
                <button
                  key={cap.title}
                  onClick={() => sendMessage(cap.prompt)}
                  className="text-left p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                    style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
                  >
                    <cap.icon size={14} className="text-violet-400" />
                  </div>
                  <p className="text-[13px] font-semibold text-white mb-1">{cap.title}</p>
                  <p className="text-[11px] leading-snug" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {cap.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Message list ── */
          <div className="p-5 space-y-5 max-w-4xl mx-auto w-full">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(99,102,241,0.25))',
                    border: '1px solid rgba(139,92,246,0.35)',
                  }}
                >
                  <Sparkles size={12} className="text-violet-300" />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '4px 16px 16px 16px',
                  }}
                >
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 160, 320].map(d => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: 'rgba(167,139,250,0.5)', animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="sticky bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
            style={{
              display: 'flex',
              background: 'rgba(139,92,246,0.85)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}
          >
            <ChevronDown size={13} /> Nach unten
          </button>
        )}
      </div>

      {/* ── Quick actions ── */}
      <div
        className="shrink-0 w-full"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="max-w-3xl mx-auto px-4 pt-2.5 pb-1.5 flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={() => sendMessage(action.prompt)}
              disabled={loading}
              className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full transition-all disabled:opacity-30 hover:border-violet-500/40 active:scale-95"
              style={{
                background: 'rgba(139,92,246,0.07)',
                border: '1px solid rgba(139,92,246,0.18)',
                color: 'rgba(196,181,253,0.7)',
              }}
            >
              <action.icon size={11} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input ── */}
      <div
        className="shrink-0 w-full"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-3xl mx-auto p-3">
          <div
            className="flex items-end gap-2.5 rounded-xl px-4 py-3 transition-all"
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
              placeholder="Stelle eine Frage zu WR oder FRW…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm focus:outline-none disabled:opacity-50 placeholder:text-white/20"
              style={{
                color: 'rgba(226,220,255,0.9)',
                maxHeight: '140px',
                lineHeight: '1.55',
              }}
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                {input.length > 0 ? `${input.length}` : 'Enter ↵'}
              </span>
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                style={{
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
                    : 'rgba(139,92,246,0.1)',
                  boxShadow: input.trim() && !loading ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                <Send size={14} className="text-white" style={{ transform: 'translateX(1px)' }} />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.1)' }}>
            KI kann Fehler machen — wichtige Informationen immer überprüfen
          </p>
        </div>
      </div>

    </div>
  )
}
