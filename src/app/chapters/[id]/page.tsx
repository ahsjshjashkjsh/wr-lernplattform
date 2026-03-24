import React from 'react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { STATUS_LABELS } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'
import { MarkLearnedButton } from './MarkLearnedButton'
import { ArrowLeft, ArrowRight, BookOpen, Target, Lightbulb, Hash, Search, AlertTriangle } from 'lucide-react'

function SummaryText({ text, terms }: { text: string; terms: string[] }) {
  // Split into sentences for better readability
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)

  // Highlight key terms within a sentence
  function highlightTerms(sentence: string): React.ReactNode[] {
    if (terms.length === 0) return [sentence]
    const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const parts = sentence.split(pattern)
    return parts.map((part, i) =>
      terms.some(t => t.toLowerCase() === part.toLowerCase())
        ? <mark key={i} style={{ background: 'rgba(99,102,241,0.18)', color: '#a5b4fc', borderRadius: 3, padding: '0 3px', fontWeight: 600 }}>{part}</mark>
        : part
    )
  }

  if (sentences.length <= 2) {
    return (
      <p className="text-sm text-slate-300 leading-relaxed">
        {sentences.map((s, i) => <span key={i}>{highlightTerms(s)}{i < sentences.length - 1 ? ' ' : ''}</span>)}
      </p>
    )
  }

  return (
    <ul className="space-y-2.5">
      {sentences.map((s, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: 'rgba(99,102,241,0.5)' }} />
          <span>{highlightTerms(s)}</span>
        </li>
      ))}
    </ul>
  )
}

const STATUS_STYLE: Record<string, string> = {
  complete: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  partial:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
  draft:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
  missing:  'text-slate-400 bg-slate-500/10 border-slate-500/20',
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      topic: {
        include: {
          chapters: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } },
        },
      },
      learningGoals: { orderBy: { order: 'asc' } },
      keyTerms:      { orderBy: { order: 'asc' } },
      corePoints:    { orderBy: { order: 'asc' } },
      examples:      { orderBy: { order: 'asc' } },
      quizQuestions: { select: { id: true } },
      progress: user ? { where: { userId: user.id } } : false,
    },
  })

  if (!chapter) notFound()

  const statusLabel = STATUS_LABELS[chapter.contentStatus as keyof typeof STATUS_LABELS] ?? chapter.contentStatus
  const statusClass = STATUS_STYLE[chapter.contentStatus] ?? STATUS_STYLE.missing
  const isIncomplete = chapter.contentStatus === 'partial' || chapter.contentStatus === 'missing'
  const isDraft = chapter.contentStatus === 'draft'
  const progress = user && Array.isArray(chapter.progress) ? chapter.progress[0] ?? null : null

  const allChapters = chapter.topic.chapters
  const currentIdx = allChapters.findIndex(c => c.id === id)
  const prevChapter = currentIdx > 0 ? allChapters[currentIdx - 1] : null
  const nextChapter = currentIdx < allChapters.length - 1 ? allChapters[currentIdx + 1] : null

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
        <Link href="/" className="hover:text-slate-400 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/topics" className="hover:text-slate-400 transition-colors">Themen</Link>
        <span>/</span>
        <Link href={`/topics/${chapter.topic.slug}`} className="hover:text-slate-400 transition-colors">
          {chapter.topic.title}
        </Link>
        <span>/</span>
        <span className="text-slate-400">{chapter.title}</span>
      </nav>

      {/* Status banners */}
      {isIncomplete && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Inhalt unvollständig</p>
            <p className="text-xs text-amber-400/70 mt-0.5">Diese Inhalte sind noch nicht vollständig vorhanden.</p>
          </div>
        </div>
      )}
      {isDraft && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border" style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.2)' }}>
          <BookOpen size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">Dieser Inhalt ist noch im Entwurfsstatus.</p>
        </div>
      )}

      {/* Chapter header */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.15) 0%, transparent 60%)' }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusClass}`}>
                {statusLabel}
              </span>
              <Link
                href={`/topics/${chapter.topic.slug}`}
                className="text-[11px] text-slate-500 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full hover:text-slate-300 transition-colors"
              >
                {chapter.topic.title}
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{chapter.title}</h1>
            {chapter.subtitle && (
              <p className="text-slate-400 mt-1.5 text-base">{chapter.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
              {chapter.learningGoals.length > 0 && (
                <span className="flex items-center gap-1.5"><Target size={12} className="text-emerald-400" /> {chapter.learningGoals.length} Lernziele</span>
              )}
              {chapter.keyTerms.length > 0 && (
                <span className="flex items-center gap-1.5"><Hash size={12} className="text-blue-400" /> {chapter.keyTerms.length} Begriffe</span>
              )}
              {chapter.quizQuestions.length > 0 && (
                <span className="flex items-center gap-1.5"><BookOpen size={12} className="text-violet-400" /> {chapter.quizQuestions.length} Quizfragen</span>
              )}
            </div>
          </div>
          <MarkLearnedButton
            chapterId={chapter.id}
            currentStatus={progress?.status ?? 'not_started'}
          />
        </div>
      </div>

      {/* Summary */}
      {chapter.summary && (
        <section className="glass rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BookOpen size={13} /> Zusammenfassung
          </h2>
          <SummaryText text={chapter.summary} terms={chapter.keyTerms.map(t => t.term)} />
        </section>
      )}

      {/* Lernziele */}
      {chapter.learningGoals.length > 0 && (
        <section className="glass rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Target size={13} /> Lernziele
          </h2>
          <ul className="space-y-2.5">
            {chapter.learningGoals.map(goal => (
              <li key={goal.id} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 text-xs font-bold"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  ✓
                </div>
                <span className="text-sm text-slate-300 leading-relaxed">{goal.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Begriffe */}
      {chapter.keyTerms.length > 0 && (
        <section className="glass rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Hash size={13} /> Wichtige Begriffe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chapter.keyTerms.map(term => (
              <div
                key={term.id}
                className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <dt className="font-semibold text-blue-400 text-sm mb-1">{term.term}</dt>
                <dd className="text-slate-400 text-xs leading-relaxed">{term.definition}</dd>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kernpunkte */}
      {chapter.corePoints.length > 0 && (
        <section className="glass rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Lightbulb size={13} /> Kernpunkte
          </h2>
          <ul className="space-y-3">
            {chapter.corePoints.map((point, idx) => (
              <li key={point.id} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full text-xs font-bold shrink-0 flex items-center justify-center text-blue-400"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  {idx + 1}
                </div>
                <span className="text-sm text-slate-300 leading-relaxed">{point.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Beispiele */}
      {chapter.examples.length > 0 && (
        <section className="glass rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Search size={13} /> Beispiele
          </h2>
          <div className="space-y-3">
            {chapter.examples.map((example, idx) => (
              <div
                key={example.id}
                className="rounded-xl p-4"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                <span className="text-xs font-semibold text-amber-400 block mb-1">Beispiel {idx + 1}</span>
                <p className="text-sm text-slate-300 leading-relaxed">{example.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="glass rounded-2xl p-5 flex flex-wrap items-center gap-3">
        {chapter.quizQuestions.length > 0 && (
          <Link
            href={`/quiz/${chapter.id}`}
            className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all glow-blue-sm"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            <BookOpen size={14} /> Quiz starten ({chapter.quizQuestions.length})
          </Link>
        )}
        <Link
          href={`/assistant?chapter=${chapter.id}`}
          className="flex items-center gap-2 text-sm font-semibold text-violet-300 px-5 py-2.5 rounded-xl transition-all"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <span>✦</span> Assistent fragen
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {prevChapter && (
            <Link
              href={`/chapters/${prevChapter.id}`}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={14} /> Vorheriges
            </Link>
          )}
          {!prevChapter && (
            <Link
              href={`/topics/${chapter.topic.slug}`}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={14} /> Zurück
            </Link>
          )}
          {nextChapter && (
            <Link
              href={`/chapters/${nextChapter.id}`}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Nächstes <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

    </div>
  )
}
