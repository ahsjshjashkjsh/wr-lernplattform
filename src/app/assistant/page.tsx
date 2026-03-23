'use client'

import { useState, useRef, useEffect, use } from 'react'
import { Bot, User, Send, Zap, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  { label: 'Einfacher erklären', prompt: 'Bitte erkläre das nochmals einfacher und mit einem konkreten Beispiel.' },
  { label: 'Beispiel geben',     prompt: 'Kannst du mir ein konkretes Beispiel dazu geben?' },
  { label: 'Zusammenfassen',     prompt: 'Fasse das Wichtigste des aktuellen Themas kurz zusammen.' },
  { label: '3 Übungsfragen',     prompt: 'Erstelle 3 Übungsfragen zu diesem Thema, mit denen ich mein Wissen testen kann.' },
]

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5`}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
        >
          <Bot size={13} className="text-violet-400" />
        </div>
      )}
      <div
        className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff',
                borderRadius: '18px 18px 4px 18px',
              }
            : {
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: '4px 18px 18px 18px',
              }
        }
      >
        {message.content}
      </div>
      {isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}
        >
          <User size={13} className="text-blue-400" />
        </div>
      )}
    </div>
  )
}

export default function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string }>
}) {
  const params = use(searchParams)
  const chapterId = params.chapter

  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [noApiKey, setNoApiKey]       = useState(false)
  const [chapterTitle, setChapterTitle] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

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
          chapterId: chapterId ?? null,
        }),
      })
      const data = await res.json()
      if (data.error === 'NO_API_KEY') { setNoApiKey(true); return }
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

  if (noApiKey) {
    return (
      <div className="max-w-xl mx-auto mt-12 glass rounded-2xl p-8 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <span className="text-2xl">🔑</span>
        </div>
        <h2 className="text-xl font-bold text-amber-400 mb-2">API-Schlüssel fehlt</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Der KI-Assistent benötigt einen <strong className="text-slate-200">OpenAI API-Schlüssel</strong>. Bitte lege eine
          Umgebungsvariable{' '}
          <code
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}
          >
            OPENAI_API_KEY
          </code>{' '}
          in der Datei{' '}
          <code
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}
          >
            .env.local
          </code>{' '}
          an und starte den Server neu.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col fade-in" style={{ height: 'calc(100vh - 130px)' }}>

      {/* Header */}
      <div
        className="glass rounded-t-2xl px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.2))',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              <Bot size={18} className="text-violet-400" />
            </div>
            <div>
              <h1 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>KI-Lernassistent</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by GPT-4o mini</p>
            </div>
          </div>
          {chapterTitle && (
            <div
              className="text-xs font-medium px-3 py-1.5 rounded-full truncate max-w-xs"
              style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                color: '#a78bfa',
              }}
            >
              📖 {chapterTitle}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ background: 'rgba(0,0,0,0.15)' }}
      >
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
            >
              <Bot size={28} className="text-violet-400" />
            </div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Wie kann ich dir helfen?</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {chapterTitle
                ? `Ich helfe dir bei „${chapterTitle}" und allen WR-Themen.`
                : 'Stelle mir eine Frage zu Wirtschaft und Recht.'}
            </p>
          </div>
        )}

        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}

        {loading && (
          <div className="flex justify-start gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <Bot size={13} className="text-violet-400" />
            </div>
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px 18px 18px 18px' }}
            >
              <div className="flex gap-1.5 items-center">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: 'var(--text-muted)', animationDelay: `${delay}ms` }}
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
        className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto shrink-0"
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}
      >
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.label}
            onClick={() => sendMessage(action.prompt)}
            disabled={loading}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all disabled:opacity-40"
            style={{
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.2)',
              color: '#a78bfa',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.15)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.08)' }}
          >
            <Zap size={10} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="glass rounded-b-2xl p-3 shrink-0"
        style={{ borderTop: 'none' }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Stelle eine Frage… (Enter = senden, Shift+Enter = neue Zeile)"
            rows={2}
            disabled={loading}
            className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 disabled:opacity-60"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
          >
            {loading
              ? <Loader2 size={15} className="text-white animate-spin" />
              : <Send size={15} className="text-white" />
            }
          </button>
        </div>
        <p className="text-xs mt-1.5 px-1" style={{ color: 'var(--text-muted)' }}>
          Enter = senden · Shift+Enter = neue Zeile
        </p>
      </div>
    </div>
  )
}
