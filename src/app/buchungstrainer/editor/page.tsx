'use client'

import { useState, useEffect, useMemo } from 'react'
import { CARDS } from '@/data/buchungstrainer-cards'
import {
  Plus, Trash2, Check, X, Search, BookMarked,
  PenLine, ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
} from 'lucide-react'

type Alias = { id: number; cardId: number; isCustom: boolean; answer: string }
type CustomCard = { id: number; question: string; answer: string; isActive: boolean; createdAt: string }

type Tab = 'aliases' | 'custom'

export default function BuchungstrainerEditorPage() {
  const [tab, setTab] = useState<Tab>('aliases')
  const [aliases, setAliases] = useState<Alias[]>([])
  const [customCards, setCustomCards] = useState<CustomCard[]>([])
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  // Alias tab state
  const [search, setSearch] = useState('')
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [newAlias, setNewAlias] = useState<Record<number, string>>({})
  const [aliasLoading, setAliasLoading] = useState<string | null>(null)

  // Custom card tab state
  const [newCard, setNewCard] = useState({ question: '', answer: '' })
  const [editingCard, setEditingCard] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ question: '', answer: '' })
  const [cardLoading, setCardLoading] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/buchungstrainer/aliases').then(r => r.json()),
      fetch('/api/buchungstrainer/custom-cards').then(r => r.json()),
    ]).then(([aliasData, cardData]) => {
      if (aliasData.error || cardData.error) {
        setAccessDenied(true)
      } else {
        setAliases(aliasData.aliases ?? [])
        setCustomCards(cardData.cards ?? [])
      }
      setLoading(false)
    }).catch(() => { setAccessDenied(true); setLoading(false) })
  }, [])

  // ── Alias helpers ──────────────────────────────────────────────
  const aliasesByCard = useMemo(() => {
    const map = new Map<number, Alias[]>()
    aliases.filter(a => !a.isCustom).forEach(a => {
      if (!map.has(a.cardId)) map.set(a.cardId, [])
      map.get(a.cardId)!.push(a)
    })
    return map
  }, [aliases])

  const filteredCards = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return CARDS
    return CARDS.filter(c => c.q.toLowerCase().includes(q) || c.a.toLowerCase().includes(q))
  }, [search])

  async function addAlias(cardId: number) {
    const answer = (newAlias[cardId] ?? '').trim()
    if (!answer) return
    setAliasLoading(`add-${cardId}`)
    const res = await fetch('/api/buchungstrainer/aliases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, isCustom: false, answer }),
    })
    const data = await res.json()
    if (data.alias) {
      setAliases(prev => [...prev, data.alias])
      setNewAlias(prev => ({ ...prev, [cardId]: '' }))
    }
    setAliasLoading(null)
  }

  async function deleteAlias(id: number) {
    setAliasLoading(`del-${id}`)
    await fetch(`/api/buchungstrainer/aliases?id=${id}`, { method: 'DELETE' })
    setAliases(prev => prev.filter(a => a.id !== id))
    setAliasLoading(null)
  }

  // ── Custom card helpers ────────────────────────────────────────
  async function addCustomCard() {
    if (!newCard.question.trim() || !newCard.answer.trim()) return
    setCardLoading('add')
    const res = await fetch('/api/buchungstrainer/custom-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCard),
    })
    const data = await res.json()
    if (data.card) {
      setCustomCards(prev => [...prev, data.card])
      setNewCard({ question: '', answer: '' })
    }
    setCardLoading(null)
  }

  async function saveEditCard(id: number) {
    setCardLoading(`edit-${id}`)
    const res = await fetch('/api/buchungstrainer/custom-cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm }),
    })
    const data = await res.json()
    if (data.card) {
      setCustomCards(prev => prev.map(c => c.id === id ? data.card : c))
      setEditingCard(null)
    }
    setCardLoading(null)
  }

  async function toggleCardActive(id: number, isActive: boolean) {
    setCardLoading(`toggle-${id}`)
    const res = await fetch('/api/buchungstrainer/custom-cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive }),
    })
    const data = await res.json()
    if (data.card) setCustomCards(prev => prev.map(c => c.id === id ? data.card : c))
    setCardLoading(null)
  }

  async function deleteCustomCard(id: number) {
    setCardLoading(`del-${id}`)
    await fetch(`/api/buchungstrainer/custom-cards?id=${id}`, { method: 'DELETE' })
    setCustomCards(prev => prev.filter(c => c.id !== id))
    setCardLoading(null)
  }

  // ── Render ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Laden…</div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <BookMarked size={32} style={{ color: 'var(--text-muted)' }} className="opacity-30" />
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Kein Zugriff</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Du benötigst die Buchungstrainer-Rolle.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">

      {/* Header */}
      <div className="pt-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] mb-3" style={{ color: 'var(--text-muted)' }}>
          Buchungstrainer
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Editor
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {CARDS.length} statische Karten · {customCards.length} eigene Karten · {aliases.filter(a => !a.isCustom).length} Aliases
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        {([
          { id: 'aliases', label: `Aliases (${aliases.filter(a => !a.isCustom).length})` },
          { id: 'custom',  label: `Eigene Karten (${customCards.length})` },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={tab === t.id
              ? { background: 'var(--accent)', color: 'white' }
              : { color: 'var(--text-muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ ALIASES TAB ══════════════════════════ */}
      {tab === 'aliases' && (
        <div className="space-y-4">
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <PenLine size={13} style={{ color: 'var(--accent)' }} />
            Füge alternative richtige Antworten zu bestehenden Karten hinzu. Der Buchungstrainer akzeptiert dann mehrere Schreibweisen.
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Karte suchen…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Card list */}
          <div className="space-y-2">
            {filteredCards.map(card => {
              const cardAliases = aliasesByCard.get(card.id) ?? []
              const isOpen = expandedCard === card.id
              return (
                <div key={card.id} className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${cardAliases.length > 0 ? 'var(--accent-border)' : 'var(--border-color)'}`, background: 'var(--card-bg)' }}>
                  {/* Header row */}
                  <button
                    className="w-full flex items-start gap-3 px-4 py-3 text-left"
                    onClick={() => setExpandedCard(isOpen ? null : card.id)}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{card.q}</p>
                      <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--accent)' }}>{card.a}</p>
                      {cardAliases.length > 0 && (
                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                          {cardAliases.length} Alias{cardAliases.length !== 1 ? 'e' : ''}
                        </p>
                      )}
                    </div>
                    {isOpen ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="text-[10px] pt-2 uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
                        Alternative Antworten
                      </p>
                      {cardAliases.map(alias => (
                        <div key={alias.id} className="flex items-center gap-2">
                          <span className="flex-1 text-xs font-mono px-3 py-1.5 rounded-lg"
                            style={{ background: 'rgba(79,114,245,0.07)', color: 'var(--text-primary)', border: '1px solid var(--accent-border)' }}>
                            {alias.answer}
                          </span>
                          <button
                            onClick={() => deleteAlias(alias.id)}
                            disabled={aliasLoading === `del-${alias.id}`}
                            className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                            style={{ color: 'var(--text-muted)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      {/* Add alias */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Neue alternative Antwort…"
                          value={newAlias[card.id] ?? ''}
                          onChange={e => setNewAlias(prev => ({ ...prev, [card.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') addAlias(card.id) }}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
                          style={{ background: 'var(--input-bg, var(--card-bg))', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                        />
                        <button
                          onClick={() => addAlias(card.id)}
                          disabled={aliasLoading === `add-${card.id}` || !(newAlias[card.id] ?? '').trim()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
                          style={{ background: 'var(--accent)' }}>
                          <Plus size={13} /> Hinzufügen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ══════════════════ CUSTOM CARDS TAB ═════════════════════ */}
      {tab === 'custom' && (
        <div className="space-y-4">
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <Plus size={13} style={{ color: 'var(--accent)' }} />
            Neue Buchungssätze hinzufügen — sie erscheinen automatisch im Buchungstrainer für alle Benutzer.
          </div>

          {/* Add new card form */}
          <div className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--accent-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Neue Karte
            </p>
            <div className="space-y-2">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Situation / Frage</label>
              <textarea
                rows={2}
                placeholder="z.B. Wir kaufen Waren auf Rechnung für CHF 500"
                value={newCard.question}
                onChange={e => setNewCard(p => ({ ...p, question: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Buchungssatz (primäre Antwort)</label>
              <input
                type="text"
                placeholder="z.B. Warenaufwand / Verbindlichkeiten"
                value={newCard.answer}
                onChange={e => setNewCard(p => ({ ...p, answer: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') addCustomCard() }}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-mono outline-none"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              onClick={addCustomCard}
              disabled={cardLoading === 'add' || !newCard.question.trim() || !newCard.answer.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: 'var(--accent)' }}>
              <Plus size={15} /> Karte hinzufügen
            </button>
          </div>

          {/* Existing custom cards */}
          {customCards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine eigenen Karten.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customCards.map(card => (
                <div key={card.id} className="rounded-xl p-4"
                  style={{
                    background: 'var(--card-bg)',
                    border: `1px solid ${card.isActive ? 'var(--border-color)' : 'rgba(239,68,68,0.2)'}`,
                    opacity: card.isActive ? 1 : 0.6,
                  }}>
                  {editingCard === card.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={editForm.question}
                        onChange={e => setEditForm(p => ({ ...p, question: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <input
                        type="text"
                        value={editForm.answer}
                        onChange={e => setEditForm(p => ({ ...p, answer: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEditCard(card.id)} disabled={cardLoading === `edit-${card.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                          style={{ background: 'var(--accent)' }}>
                          <Check size={13} /> Speichern
                        </button>
                        <button onClick={() => setEditingCard(null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                          <X size={13} /> Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{card.question}</p>
                        <p className="text-sm mt-1 font-mono font-semibold" style={{ color: 'var(--accent)' }}>{card.answer}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => toggleCardActive(card.id, !card.isActive)}
                          disabled={cardLoading === `toggle-${card.id}`}
                          className="p-1.5 rounded-lg transition-all"
                          title={card.isActive ? 'Deaktivieren' : 'Aktivieren'}
                          style={{ color: card.isActive ? '#4ade80' : 'var(--text-muted)' }}>
                          {card.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => { setEditingCard(card.id); setEditForm({ question: card.question, answer: card.answer }) }}
                          className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                          style={{ color: 'var(--text-muted)' }}>
                          <PenLine size={14} />
                        </button>
                        <button
                          onClick={() => deleteCustomCard(card.id)}
                          disabled={cardLoading === `del-${card.id}`}
                          className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                          style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
