'use client'

import { useState, useEffect, useMemo } from 'react'
import { CARDS as STATIC_CARDS } from '@/data/buchungstrainer-cards'
import {
  Search, Plus, Trash2, Check, X, PenLine,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
  RotateCcw, BookMarked, AlertCircle,
} from 'lucide-react'

// ─── types ────────────────────────────────────────────────────────────────────
type Override = { id: number; staticId: number; question: string | null; answer: string | null }
type Alias    = { id: number; cardId: number; isCustom: boolean; answer: string }
type CustomCard = { id: number; question: string; answer: string; isActive: boolean }

// Unified card for display
type CardEntry = {
  key: string          // 'static-5' or 'custom-3'
  origQ: string        // original/DB question
  origA: string        // original/DB answer
  isCustom: boolean
  staticId?: number
  customId?: number
  isActive: boolean
  overrideId?: number
  aliases: Alias[]
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function buildCards(
  overrides: Override[],
  customCards: CustomCard[],
  aliases: Alias[],
): CardEntry[] {
  const overrideMap = new Map(overrides.map(o => [o.staticId, o]))

  const staticEntries: CardEntry[] = STATIC_CARDS.map(card => {
    const ov = overrideMap.get(card.id)
    return {
      key: `static-${card.id}`,
      origQ: ov?.question ?? card.q,
      origA: ov?.answer   ?? card.a,
      isCustom: false,
      staticId: card.id,
      isActive: true,
      overrideId: ov?.id,
      aliases: aliases.filter(a => a.cardId === card.id && !a.isCustom),
    }
  })

  const customEntries: CardEntry[] = customCards.map(card => ({
    key: `custom-${card.id}`,
    origQ: card.question,
    origA: card.answer,
    isCustom: true,
    customId: card.id,
    isActive: card.isActive,
    aliases: aliases.filter(a => a.cardId === card.id && a.isCustom),
  }))

  return [...staticEntries, ...customEntries]
}

// ─── component ────────────────────────────────────────────────────────────────
export default function BuchungstrainerEditorPage() {
  const [overrides,    setOverrides]    = useState<Override[]>([])
  const [aliases,      setAliases]      = useState<Alias[]>([])
  const [customCards,  setCustomCards]  = useState<CustomCard[]>([])
  const [loading,      setLoading]      = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  const [search,      setSearch]      = useState('')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [saving,      setSaving]      = useState<string | null>(null)
  const [error,       setError]       = useState<string | null>(null)

  // Per-card edit state
  const [editQ,     setEditQ]     = useState('')
  const [editA,     setEditA]     = useState('')
  const [newAlias,  setNewAlias]  = useState('')

  // New card form
  const [showNewCard, setShowNewCard] = useState(false)
  const [newCard, setNewCard] = useState({ question: '', answer: '' })

  // ── load all data ────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch('/api/buchungstrainer/overrides').then(r => r.json()),
      fetch('/api/buchungstrainer/aliases').then(r => r.json()),
      fetch('/api/buchungstrainer/custom-cards').then(r => r.json()),
    ]).then(([ovData, alData, ccData]) => {
      // 403 = no access (trainer check happens only on mutating requests, GET is public)
      // We detect trainer access via a test POST attempt if needed;
      // for now show UI and surface errors on save.
      setOverrides(ovData.overrides ?? [])
      setAliases(alData.aliases ?? [])
      setCustomCards(ccData.cards ?? [])
      setLoading(false)
    }).catch(() => { setAccessDenied(true); setLoading(false) })
  }, [])

  // ── derived cards ────────────────────────────────────────────────────────────
  const allCards = useMemo(
    () => buildCards(overrides, customCards, aliases),
    [overrides, aliases, customCards],
  )

  const filteredCards = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return allCards
    return allCards.filter(c =>
      c.origQ.toLowerCase().includes(q) || c.origA.toLowerCase().includes(q),
    )
  }, [allCards, search])

  // ── expand a card ────────────────────────────────────────────────────────────
  function openCard(card: CardEntry) {
    if (expandedKey === card.key) { setExpandedKey(null); return }
    setExpandedKey(card.key)
    setEditQ(card.origQ)
    setEditA(card.origA)
    setNewAlias('')
    setError(null)
  }

  // ── save question + main answer ──────────────────────────────────────────────
  async function saveCard(card: CardEntry) {
    setSaving(`save-${card.key}`)
    setError(null)
    try {
      if (!card.isCustom) {
        // Static card: save as override
        const orig = STATIC_CARDS.find(c => c.id === card.staticId)
        const qChanged = editQ.trim() !== (orig?.q ?? '')
        const aChanged = editA.trim() !== (orig?.a ?? '')
        if (!qChanged && !aChanged && !card.overrideId) { setSaving(null); return }

        const res = await fetch('/api/buchungstrainer/overrides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staticId: card.staticId,
            question: qChanged ? editQ.trim() : null,
            answer:   aChanged ? editA.trim() : null,
          }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Fehler beim Speichern.'); setSaving(null); return }
        setOverrides(prev => {
          const next = prev.filter(o => o.staticId !== card.staticId)
          return [...next, data.override]
        })
      } else {
        // Custom card: update directly
        const res = await fetch('/api/buchungstrainer/custom-cards', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: card.customId, question: editQ.trim(), answer: editA.trim() }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Fehler beim Speichern.'); setSaving(null); return }
        setCustomCards(prev => prev.map(c => c.id === card.customId ? data.card : c))
      }
    } catch { setError('Netzwerkfehler.') }
    setSaving(null)
  }

  // ── reset card to original (remove override) ─────────────────────────────────
  async function resetCard(card: CardEntry) {
    if (!card.staticId) return
    setSaving(`reset-${card.key}`)
    await fetch(`/api/buchungstrainer/overrides?staticId=${card.staticId}`, { method: 'DELETE' })
    setOverrides(prev => prev.filter(o => o.staticId !== card.staticId))
    const orig = STATIC_CARDS.find(c => c.id === card.staticId)
    if (orig) { setEditQ(orig.q); setEditA(orig.a) }
    setSaving(null)
  }

  // ── alias management ─────────────────────────────────────────────────────────
  async function addAlias(card: CardEntry) {
    const answer = newAlias.trim()
    if (!answer) return
    setSaving(`alias-add-${card.key}`)
    setError(null)
    const res = await fetch('/api/buchungstrainer/aliases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId:   card.isCustom ? card.customId : card.staticId,
        isCustom: card.isCustom,
        answer,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Fehler.'); setSaving(null); return }
    setAliases(prev => [...prev, data.alias])
    setNewAlias('')
    setSaving(null)
  }

  async function deleteAlias(aliasId: number) {
    setSaving(`alias-del-${aliasId}`)
    await fetch(`/api/buchungstrainer/aliases?id=${aliasId}`, { method: 'DELETE' })
    setAliases(prev => prev.filter(a => a.id !== aliasId))
    setSaving(null)
  }

  // ── custom card management ───────────────────────────────────────────────────
  async function addCustomCard() {
    if (!newCard.question.trim() || !newCard.answer.trim()) return
    setSaving('new-card')
    const res = await fetch('/api/buchungstrainer/custom-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCard),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Fehler.'); setSaving(null); return }
    setCustomCards(prev => [...prev, data.card])
    setNewCard({ question: '', answer: '' })
    setShowNewCard(false)
    setSaving(null)
  }

  async function toggleCustomActive(card: CardEntry) {
    setSaving(`toggle-${card.key}`)
    const res = await fetch('/api/buchungstrainer/custom-cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: card.customId, isActive: !card.isActive }),
    })
    const data = await res.json()
    if (data.card) setCustomCards(prev => prev.map(c => c.id === card.customId ? data.card : c))
    setSaving(null)
  }

  async function deleteCustomCard(card: CardEntry) {
    setSaving(`del-${card.key}`)
    await fetch(`/api/buchungstrainer/custom-cards?id=${card.customId}`, { method: 'DELETE' })
    setCustomCards(prev => prev.filter(c => c.id !== card.customId))
    setAliases(prev => prev.filter(a => !(a.cardId === card.customId && a.isCustom)))
    setExpandedKey(null)
    setSaving(null)
  }

  // ── render ────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Laden…</p>
    </div>
  )

  if (accessDenied) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <BookMarked size={32} style={{ color: 'var(--text-muted)' }} className="opacity-30" />
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Kein Zugriff</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Du benötigst die Buchungstrainer-Rolle.</p>
    </div>
  )

  const totalCustom   = customCards.length
  const totalOverrides = overrides.length
  const totalAliases   = aliases.length

  return (
    <div className="space-y-5 fade-in">

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
          {STATIC_CARDS.length} statische · {totalCustom} eigene · {totalOverrides} Korrekturen · {totalAliases} weitere Lösungen
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-red-400"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={13} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={`Karte suchen… (${filteredCards.length})`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>
        <button
          onClick={() => setShowNewCard(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--accent)' }}>
          <Plus size={15} /> Neue Karte
        </button>
      </div>

      {/* New card form */}
      {showNewCard && (
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--accent-border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            Neue Karte hinzufügen
          </p>
          <div className="space-y-2">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Frage / Situation</label>
            <textarea rows={2} placeholder="z.B. Wir kaufen Waren auf Rechnung für CHF 500"
              value={newCard.question} onChange={e => setNewCard(p => ({ ...p, question: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Hauptlösung (Buchungssatz)</label>
            <input type="text" placeholder="z.B. Warenaufwand / Verbindlichkeiten"
              value={newCard.answer} onChange={e => setNewCard(p => ({ ...p, answer: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') addCustomCard() }}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-mono outline-none"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addCustomCard} disabled={saving === 'new-card' || !newCard.question.trim() || !newCard.answer.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: 'var(--accent)' }}>
              <Plus size={14} /> Hinzufügen
            </button>
            <button onClick={() => setShowNewCard(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Card list */}
      <div className="space-y-2">
        {filteredCards.map(card => {
          const isOpen = expandedKey === card.key
          const hasOverride = !card.isCustom && card.overrideId != null
          const aliasCount = card.aliases.length
          const isSavingThis = saving?.startsWith(`save-${card.key}`) || saving?.startsWith(`alias-${card.key}`) || saving?.startsWith(`reset-${card.key}`)

          return (
            <div key={card.key} className="rounded-xl overflow-hidden"
              style={{
                border: `1px solid ${isOpen ? 'var(--accent-border)' : hasOverride ? 'rgba(139,92,246,0.25)' : 'var(--border-color)'}`,
                background: 'var(--card-bg)',
                opacity: card.isCustom && !card.isActive ? 0.55 : 1,
              }}>

              {/* Row header */}
              <button className="w-full flex items-start gap-3 px-4 py-3 text-left" onClick={() => openCard(card)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {card.isCustom && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>Eigene</span>
                    )}
                    {hasOverride && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>Angepasst</span>
                    )}
                    {aliasCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(79,114,245,0.1)', color: 'var(--accent)' }}>
                        +{aliasCount} Lösung{aliasCount !== 1 ? 'en' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{card.origQ}</p>
                  <p className="text-xs mt-0.5 font-mono font-semibold" style={{ color: 'var(--accent)' }}>{card.origA}</p>
                </div>
                <div className="shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {/* Expanded edit panel */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid var(--border-color)' }}>

                  {/* Edit question + main answer */}
                  <div className="pt-3 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        Frage / Situation
                      </label>
                      <textarea rows={2} value={editQ} onChange={e => setEditQ(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                        Hauptlösung
                      </label>
                      <input type="text" value={editA} onChange={e => setEditA(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveCard(card) }}
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--accent-border)', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => saveCard(card)} disabled={!!isSavingThis || !editQ.trim() || !editA.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                        style={{ background: 'var(--accent)' }}>
                        <Check size={14} /> Speichern
                      </button>
                      {hasOverride && (
                        <button onClick={() => resetCard(card)} disabled={!!isSavingThis}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
                          title="Original wiederherstellen"
                          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                          <RotateCcw size={13} /> Original
                        </button>
                      )}
                      {card.isCustom && (
                        <>
                          <button onClick={() => toggleCustomActive(card)} disabled={!!isSavingThis}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ml-auto"
                            style={{ color: card.isActive ? '#4ade80' : 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                            {card.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            {card.isActive ? 'Aktiv' : 'Deaktiviert'}
                          </button>
                          <button onClick={() => deleteCustomCard(card)} disabled={!!isSavingThis}
                            className="p-2 rounded-xl transition-all hover:bg-red-500/10"
                            style={{ color: 'var(--text-muted)' }}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Weitere Lösungen */}
                  <div className="space-y-2 pt-1" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest pt-2" style={{ color: 'var(--text-muted)' }}>
                      Weitere richtige Lösungen
                    </p>

                    {card.aliases.length === 0 && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Noch keine — alle Schreibweisen hier eintragen, die auch als richtig gelten.
                      </p>
                    )}

                    {card.aliases.map(alias => (
                      <div key={alias.id} className="flex items-center gap-2">
                        <span className="flex-1 text-xs font-mono px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(79,114,245,0.06)', border: '1px solid var(--accent-border)', color: 'var(--text-primary)' }}>
                          {alias.answer}
                        </span>
                        <button onClick={() => deleteAlias(alias.id)} disabled={saving === `alias-del-${alias.id}`}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-40"
                          style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {/* Add alias */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Weitere richtige Antwort…"
                        value={newAlias}
                        onChange={e => setNewAlias(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addAlias(card) }}
                        className="flex-1 px-3 py-2 rounded-xl text-sm font-mono outline-none"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <button onClick={() => addAlias(card)}
                        disabled={saving === `alias-add-${card.key}` || !newAlias.trim()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                        style={{ background: 'var(--accent)' }}>
                        <Plus size={13} /> Hinzufügen
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )
        })}

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Keine Karten gefunden.</p>
          </div>
        )}
      </div>
    </div>
  )
}
