'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, ChevronRight, ChevronLeft, Zap, Trophy, BookMarked, Filter } from 'lucide-react'

interface BookingEntry {
  id: string
  situation: string
  sollKonto: string
  habenKonto: string
  betragHint?: string | null
  erklaerung: string
  chapter: {
    id: string
    title: string
    slug: string
    topic: { id: string; title: string; slug: string; band?: string | null }
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TrainerPage() {
  const [allEntries, setAllEntries] = useState<BookingEntry[]>([])
  const [queue, setQueue] = useState<BookingEntry[]>([])
  const [mastered, setMastered] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<Set<string>>(new Set())
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterTopic, setFilterTopic] = useState<string>('all')
  const [done, setDone] = useState(false)
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    fetch('/api/frw/booking-entries')
      .then(r => r.json())
      .then((data: BookingEntry[]) => {
        setAllEntries(data)
        setQueue(shuffle(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Get unique topics for filter
  const topics = Array.from(
    new Map(allEntries.map(e => [e.chapter.topic.id, e.chapter.topic])).values()
  ).sort((a, b) => (a.band ?? '').localeCompare(b.band ?? '') || a.title.localeCompare(b.title))

  const restart = useCallback((topicId?: string) => {
    const filtered = topicId && topicId !== 'all'
      ? allEntries.filter(e => e.chapter.topic.id === topicId)
      : allEntries
    setQueue(shuffle(filtered))
    setMastered(new Set())
    setWrong(new Set())
    setCurrentIdx(0)
    setRevealed(false)
    setDone(false)
  }, [allEntries])

  const handleFilter = (topicId: string) => {
    setFilterTopic(topicId)
    setShowFilter(false)
    restart(topicId)
  }

  const current = queue[currentIdx]
  const total = queue.length
  const masteredCount = mastered.size
  const progress = total > 0 ? Math.round((masteredCount / total) * 100) : 0

  function handleKnow() {
    const newMastered = new Set(mastered)
    newMastered.add(current.id)
    setMastered(newMastered)
    if (currentIdx + 1 >= queue.length) {
      setDone(true)
    } else {
      setCurrentIdx(i => i + 1)
      setRevealed(false)
    }
  }

  function handleRepeat() {
    const newWrong = new Set(wrong)
    newWrong.add(current.id)
    setWrong(newWrong)
    // Move to end of queue
    const newQueue = [...queue]
    const [card] = newQueue.splice(currentIdx, 1)
    newQueue.push(card)
    setQueue(newQueue)
    setRevealed(false)
  }

  function handlePrev() {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1)
      setRevealed(false)
    }
  }

  function handleNext() {
    if (currentIdx + 1 < queue.length) {
      setCurrentIdx(i => i + 1)
      setRevealed(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 fade-in">
        <div className="skeleton h-12 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  if (allEntries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <div className="glass rounded-2xl p-12 text-center">
          <BookMarked size={40} className="text-amber-400/40 mx-auto mb-4" />
          <p className="text-slate-300 font-medium text-lg">Noch keine Buchungssätze vorhanden</p>
          <p className="text-slate-500 text-sm mt-2">Die Buchungssätze werden bald hier erscheinen.</p>
          <Link href="/frw" className="mt-6 inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
            <ArrowLeft size={14} /> Zurück zum FRW-Hub
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    const allCorrect = wrong.size === 0
    return (
      <div className="max-w-2xl mx-auto space-y-6 fade-in">
        <Link href="/frw" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> FRW Hub
        </Link>
        <div className="glass rounded-2xl p-10 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: allCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', border: allCorrect ? '2px solid rgba(16,185,129,0.3)' : '2px solid rgba(245,158,11,0.3)' }}>
            <Trophy size={36} className={allCorrect ? 'text-emerald-400' : 'text-amber-400'} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {allCorrect ? 'Perfekt! Alle gemeistert.' : 'Runde abgeschlossen!'}
          </h2>
          <p className="text-slate-400 mb-8">
            {masteredCount} von {total} Buchungssätzen gemeistert
            {wrong.size > 0 && ` · ${wrong.size} nochmals wiederholt`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => restart(filterTopic)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
            >
              <RotateCcw size={15} /> Nochmals
            </button>
            <Link
              href="/frw"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
            >
              Zum FRW-Hub
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/frw" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> FRW Hub
        </Link>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilter(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
            >
              <Filter size={12} />
              {filterTopic === 'all' ? 'Alle Themen' : (topics.find(t => t.id === filterTopic)?.title ?? 'Gefiltert')}
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-1 z-20 rounded-xl overflow-hidden shadow-2xl" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', minWidth: '220px' }}>
                <button onClick={() => handleFilter('all')} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filterTopic === 'all' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300 hover:bg-white/5'}`}>
                  Alle Themen ({allEntries.length})
                </button>
                {topics.map(t => {
                  const count = allEntries.filter(e => e.chapter.topic.id === t.id).length
                  return (
                    <button key={t.id} onClick={() => handleFilter(t.id)} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filterTopic === t.id ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300 hover:bg-white/5'}`}>
                      {t.title} ({count})
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <button
            onClick={() => restart(filterTopic)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
          >
            <RotateCcw size={12} /> Neu mischen
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-emerald-400" /> {masteredCount} gemeistert</span>
          <span>{currentIdx + 1} / {total}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #f59e0b, #10b981)' }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="glass rounded-2xl overflow-hidden" style={{ minHeight: '360px' }}>
        {/* Topic label */}
        <div className="px-6 pt-5 pb-0 flex items-center gap-2">
          <Zap size={13} className="text-amber-400" />
          <span className="text-xs text-amber-400/80 font-medium">{current.chapter.topic.title}</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-600">{current.chapter.title}</span>
        </div>

        {/* Situation */}
        <div className="px-6 pt-4 pb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Situation</p>
          <p className="text-white text-lg leading-relaxed font-medium">{current.situation}</p>
          {current.betragHint && (
            <p className="text-sm text-amber-400/70 mt-2 font-mono">{current.betragHint}</p>
          )}
        </div>

        {/* Reveal button or answer */}
        {!revealed ? (
          <div className="px-6 pb-6">
            <div className="rounded-xl py-8 text-center cursor-pointer transition-all hover:opacity-80" style={{ background: 'rgba(245,158,11,0.08)', border: '1px dashed rgba(245,158,11,0.3)' }} onClick={() => setRevealed(true)}>
              <p className="text-amber-400/60 text-sm font-medium">Buchungssatz aufdecken</p>
              <p className="text-slate-600 text-xs mt-1">Klicken oder Leertaste</p>
            </div>
          </div>
        ) : (
          <div className="px-6 pb-4 space-y-4">
            {/* T-Account style */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="grid grid-cols-2">
                <div className="p-4" style={{ background: 'rgba(59,130,246,0.08)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">Soll (Debit)</p>
                  <p className="text-white font-semibold text-sm leading-snug">{current.sollKonto}</p>
                </div>
                <div className="p-4" style={{ background: 'rgba(16,185,129,0.08)' }}>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Haben (Kredit)</p>
                  <p className="text-white font-semibold text-sm leading-snug">{current.habenKonto}</p>
                </div>
              </div>
              <div className="px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[11px] font-mono text-slate-400">{current.sollKonto} / {current.habenKonto}</p>
              </div>
            </div>
            {/* Explanation */}
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-slate-500 font-medium mb-1">Erklärung</p>
              <p className="text-sm text-slate-300 leading-relaxed">{current.erklaerung}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {revealed ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRepeat}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
          >
            <XCircle size={16} /> Nochmal
          </button>
          <button
            onClick={handleKnow}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 16px rgba(16,185,129,0.2)' }}
          >
            <CheckCircle2 size={16} /> Gewusst!
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button onClick={handlePrev} disabled={currentIdx === 0} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-all">
            <ChevronLeft size={16} /> Zurück
          </button>
          <button
            onClick={() => setRevealed(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
          >
            Aufdecken <ChevronRight size={15} />
          </button>
          <button onClick={handleNext} disabled={currentIdx + 1 >= queue.length} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-all">
            Weiter <ChevronRight size={16} />
          </button>
        </div>
      )}

    </div>
  )
}
