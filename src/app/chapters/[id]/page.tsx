import React from 'react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { STATUS_LABELS } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'
import { MarkLearnedButton } from './MarkLearnedButton'
import { ArrowLeft, ArrowRight, BookOpen, Target, Lightbulb, Hash, Search, AlertTriangle, BookMarked, Calculator, GraduationCap } from 'lucide-react'
import { ChapterTabNav } from './ChapterTabNav'
import ReactMarkdown from 'react-markdown'

// ─── SummaryText ──────────────────────────────────────────────────────────────
function SummaryText({ text, terms }: { text: string; terms: string[] }) {
  // Split on sentence-ending punctuation but NOT on abbreviations like A.o., z.B., CHF, inkl., etc.
  const sentences = text
    .replace(/\b(A\.o\.|z\.B\.|z\.T\.|u\.a\.|inkl\.|bzw\.|etc\.|CHF|Fr\.|Abs\.|Art\.|vgl\.)\s/g, m => m.replace(' ', '\x00'))
    .split(/(?<=[.!?])\s+/)
    .map(s => s.replace(/\x00/g, ' ').trim())
    .filter(Boolean)

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

  function isHeading(s: string) {
    return /^[A-ZÄÖÜ\w]{2,30}\s[–—]\s/.test(s) || /^[A-ZÄÖÜ][^.!?]{3,40}:\s/.test(s.slice(0, 50))
  }

  type Section = { heading: string | null; points: string[] }
  const sections: Section[] = []
  let current: Section = { heading: null, points: [] }

  for (const s of sentences) {
    if (isHeading(s)) {
      if (current.heading !== null || current.points.length > 0) sections.push(current)
      current = { heading: s, points: [] }
    } else {
      current.points.push(s)
    }
  }
  sections.push(current)

  const hasStructure = sections.some(s => s.heading !== null)

  if (!hasStructure) {
    if (sentences.length <= 2) {
      return <p className="text-sm text-slate-300 leading-relaxed">{sentences.join(' ')}</p>
    }
    return (
      <ul className="space-y-2">
        {sentences.map((s, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-[7px]" style={{ background: 'rgba(99,102,241,0.5)' }} />
            <span>{highlightTerms(s)}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-5">
      {sections.map((section, si) => (
        <div key={si}>
          {section.heading && (
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-1 h-4 rounded-full shrink-0" style={{ background: 'rgba(99,102,241,0.6)' }} />
              <h3 className="text-sm font-bold text-slate-200">{highlightTerms(section.heading)}</h3>
            </div>
          )}
          {section.points.length > 0 && (
            <ul className="space-y-1.5 ml-3">
              {section.points.map((p, pi) => (
                <li key={pi} className="flex items-start gap-2.5 text-sm text-slate-400 leading-relaxed">
                  <span className="shrink-0 w-1 h-1 rounded-full mt-[7px]" style={{ background: 'rgba(148,163,184,0.4)' }} />
                  <span>{highlightTerms(p)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── T-Account visual ─────────────────────────────────────────────────────────
type BookingEntryRow = {
  id: string
  situation: string
  sollKonto: string
  habenKonto: string
  betragHint: string | null
  erklaerung: string
}

function TAccount({ entry, idx }: { entry: BookingEntryRow; idx: number }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Situation header */}
      <div className="px-5 py-3.5" style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-start gap-3">
          <span
            className="shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}
          >
            {idx + 1}
          </span>
          <p className="text-sm text-slate-200 font-medium leading-snug">{entry.situation}</p>
        </div>
        {entry.betragHint && (
          <p className="text-[11px] font-mono text-amber-400/60 mt-2 ml-8">{entry.betragHint}</p>
        )}
      </div>

      {/* T-Account body */}
      <div className="grid grid-cols-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {/* SOLL — left side */}
        <div className="px-5 py-4" style={{ borderRight: '2px solid rgba(255,255,255,0.07)', background: 'rgba(59,130,246,0.05)' }}>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Soll (links)</p>
          <p className="font-mono font-bold text-white text-[14px] leading-tight">{entry.sollKonto}</p>
        </div>
        {/* HABEN — right side */}
        <div className="px-5 py-4" style={{ background: 'rgba(16,185,129,0.05)' }}>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Haben (rechts)</p>
          <p className="font-mono font-bold text-white text-[14px] leading-tight">{entry.habenKonto}</p>
        </div>
      </div>

      {/* Short notation */}
      <div className="px-5 py-2 text-center" style={{ background: 'rgba(0,0,0,0.12)' }}>
        <p className="text-[11px] font-mono" style={{ color: 'rgba(148,163,184,0.4)' }}>
          {entry.sollKonto} <span style={{ color: 'rgba(245,158,11,0.5)' }}>/</span> {entry.habenKonto}
        </p>
      </div>

      {/* Erklärung */}
      {entry.erklaerung && (
        <div className="px-5 py-3.5" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-slate-400 leading-relaxed">{entry.erklaerung}</p>
        </div>
      )}
    </div>
  )
}

// ─── Status styles ────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  complete: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  partial:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
  draft:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
  missing:  'text-slate-400 bg-slate-500/10 border-slate-500/20',
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab: rawTab } = await searchParams
  const user = await getCurrentUser()

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      topic: {
        include: {
          chapters: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } },
        },
      },
      learningGoals:  { orderBy: { order: 'asc' } },
      keyTerms:       { orderBy: { order: 'asc' } },
      corePoints:     { orderBy: { order: 'asc' } },
      examples:       { orderBy: { order: 'asc' } },
      bookingEntries: { orderBy: { order: 'asc' } },
      formulas:       { orderBy: { order: 'asc' } },
      quizQuestions:  { select: { id: true } },
      progress: user ? { where: { userId: user.id } } : false,
    },
  })

  if (!chapter) notFound()

  const isFrw = chapter.topic.category === 'frw'
  const hasBookingEntries = chapter.bookingEntries.length > 0
  const hasFormulas = chapter.formulas.length > 0
  const hasQuiz = chapter.quizQuestions.length > 0

  // Default tab: 'lernen' for FRW chapters, 'verstehen' for WR
  const tab = rawTab ?? (isFrw ? 'lernen' : 'verstehen')

  const statusLabel = STATUS_LABELS[chapter.contentStatus as keyof typeof STATUS_LABELS] ?? chapter.contentStatus
  const statusClass = STATUS_STYLE[chapter.contentStatus] ?? STATUS_STYLE.missing
  const isIncomplete = chapter.contentStatus === 'partial' || chapter.contentStatus === 'missing'
  const isDraft = chapter.contentStatus === 'draft'
  const progress = user && Array.isArray(chapter.progress) ? chapter.progress[0] ?? null : null

  const allChapters = chapter.topic.chapters
  const currentIdx = allChapters.findIndex(c => c.id === id)
  const prevChapter = currentIdx > 0 ? allChapters[currentIdx - 1] : null
  const nextChapter = currentIdx < allChapters.length - 1 ? allChapters[currentIdx + 1] : null

  const hasFrwContent = isFrw && (hasBookingEntries || hasFormulas)

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
        <Link href="/" className="hover:text-slate-400 transition-colors">Dashboard</Link>
        <span>/</span>
        {isFrw ? (
          <Link href="/frw" className="hover:text-slate-400 transition-colors">FRW</Link>
        ) : (
          <Link href="/topics" className="hover:text-slate-400 transition-colors">Themen</Link>
        )}
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
          style={{ background: isFrw
            ? 'radial-gradient(ellipse at top right, rgba(245,158,11,0.15) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at top right, rgba(99,102,241,0.15) 0%, transparent 60%)' }}
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
              {isFrw && chapter.topic.band && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full border text-amber-400/80 border-amber-500/20 bg-amber-500/8">
                  Band {chapter.topic.band}
                </span>
              )}
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
              {hasBookingEntries && (
                <span className="flex items-center gap-1.5"><BookMarked size={12} className="text-amber-400" /> {chapter.bookingEntries.length} Buchungssätze</span>
              )}
              {hasQuiz && (
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

      {/* Tab Nav */}
      {(hasFrwContent || hasBookingEntries || hasQuiz) && (
        <ChapterTabNav
          chapterId={chapter.id}
          activeTab={tab}
          hasBookingEntries={hasBookingEntries || hasFormulas}
          hasQuiz={hasQuiz}
          isFrw={isFrw}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: LERNEN  (FRW chapters — theory + T-accounts on one screen)
      ═══════════════════════════════════════════════════════════════════════ */}
      {tab === 'lernen' && isFrw && (
        <div className="space-y-6">

          {/* Summary / Theory — rendered as full Markdown */}
          {chapter.summary && (
            <section className="glass rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Lightbulb size={13} className="text-amber-400" /> Theorie
              </h2>
              <div className="frw-markdown">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-6 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(245,158,11,0.2)' }}>{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold text-amber-300 mt-6 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-200 mt-4 mb-2">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-sm font-semibold text-blue-300 mt-3 mb-1">{children}</h4>,
                    p: ({ children }) => <p className="text-sm text-slate-300 leading-relaxed mb-3">{children}</p>,
                    ul: ({ children }) => <ul className="space-y-1.5 mb-3 ml-2">{children}</ul>,
                    ol: ({ children }) => <ol className="space-y-1.5 mb-3 ml-2 list-decimal list-inside">{children}</ol>,
                    li: ({ children }) => (
                      <li className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-[7px]" style={{ background: 'rgba(245,158,11,0.5)' }} />
                        <span>{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                    em: ({ children }) => <em className="text-amber-300 not-italic font-medium">{children}</em>,
                    code: ({ children }) => <code className="font-mono text-sm text-amber-300 bg-black/30 px-1.5 py-0.5 rounded">{children}</code>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-amber-500/40 pl-4 my-3 text-sm text-slate-400 italic">{children}</blockquote>
                    ),
                    hr: () => <hr className="my-5" style={{ borderColor: 'rgba(255,255,255,0.07)' }} />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        <table className="w-full text-sm">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => <thead style={{ background: 'rgba(245,158,11,0.1)' }}>{children}</thead>,
                    th: ({ children }) => <th className="px-4 py-2 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">{children}</th>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => <tr style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>{children}</tr>,
                    td: ({ children }) => <td className="px-4 py-2.5 text-slate-300 text-sm">{children}</td>,
                  }}
                >
                  {chapter.summary}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Lernziele */}
          {chapter.learningGoals.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target size={13} className="text-emerald-400" /> Lernziele
              </h2>
              <ul className="space-y-2.5">
                {chapter.learningGoals.map(goal => (
                  <li key={goal.id} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 text-xs font-bold"
                      style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
                    >✓</div>
                    <span className="text-sm text-slate-300 leading-relaxed">{goal.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Kernpunkte */}
          {chapter.corePoints.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen size={13} className="text-blue-400" /> Kernpunkte
              </h2>
              <ul className="space-y-3">
                {chapter.corePoints.map((point, idx) => (
                  <li key={point.id} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full text-xs font-bold shrink-0 flex items-center justify-center text-blue-400"
                      style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}
                    >{idx + 1}</div>
                    <span className="text-sm text-slate-300 leading-relaxed">{point.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Wichtige Begriffe */}
          {chapter.keyTerms.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Hash size={13} className="text-blue-400" /> Wichtige Begriffe
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

          {/* Formeln */}
          {hasFormulas && (
            <section className="glass rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calculator size={13} className="text-amber-400" /> Formeln
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chapter.formulas.map(f => (
                  <div key={f.id} className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <p className="text-xs font-bold text-amber-400 mb-1.5">{f.name}</p>
                    <p className="font-mono text-sm text-white bg-black/20 rounded-lg px-3 py-2">{f.formel}</p>
                    {f.erklaerung && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{f.erklaerung}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Buchungssätze als T-Konten */}
          {hasBookingEntries && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BookMarked size={14} className="text-amber-400" />
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Buchungssätze ({chapter.bookingEntries.length})
                </h2>
              </div>
              <div className="space-y-3">
                {chapter.bookingEntries.map((entry, idx) => (
                  <TAccount key={entry.id} entry={entry} idx={idx} />
                ))}
              </div>
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
                  <div key={example.id} className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <span className="text-xs font-semibold text-amber-400 block mb-1">Beispiel {idx + 1}</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{example.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: VERSTEHEN  (WR chapters)
      ═══════════════════════════════════════════════════════════════════════ */}
      {tab === 'verstehen' && !isFrw && (
        <>
          {chapter.summary && (
            <section className="glass rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen size={13} /> Zusammenfassung
              </h2>
              <SummaryText text={chapter.summary} terms={chapter.keyTerms.map(t => t.term)} />
            </section>
          )}

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
                    >✓</div>
                    <span className="text-sm text-slate-300 leading-relaxed">{goal.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {chapter.keyTerms.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Hash size={13} /> Wichtige Begriffe
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chapter.keyTerms.map(term => (
                  <div key={term.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <dt className="font-semibold text-blue-400 text-sm mb-1">{term.term}</dt>
                    <dd className="text-slate-400 text-xs leading-relaxed">{term.definition}</dd>
                  </div>
                ))}
              </div>
            </section>
          )}

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
                    >{idx + 1}</div>
                    <span className="text-sm text-slate-300 leading-relaxed">{point.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {chapter.examples.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Search size={13} /> Beispiele
              </h2>
              <div className="space-y-3">
                {chapter.examples.map((example, idx) => (
                  <div key={example.id} className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <span className="text-xs font-semibold text-amber-400 block mb-1">Beispiel {idx + 1}</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{example.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {hasBookingEntries && (
            <div className="rounded-xl px-5 py-4 flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <BookMarked size={16} className="text-amber-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-amber-300 font-medium">Buchungssätze vorhanden</p>
                <p className="text-xs text-slate-500 mt-0.5">Wechsle zum Tab «Buchungssätze» für alle Buchungseinträge dieses Kapitels.</p>
              </div>
              <Link href={`/chapters/${chapter.id}?tab=buchungssaetze`} className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0">
                Zum Tab →
              </Link>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: BUCHUNGSSÄTZE  (WR chapters with booking entries)
      ═══════════════════════════════════════════════════════════════════════ */}
      {tab === 'buchungssaetze' && !isFrw && (
        <div className="space-y-6">
          {hasFormulas && (
            <section className="glass rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calculator size={13} className="text-amber-400" /> Formeln
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chapter.formulas.map(f => (
                  <div key={f.id} className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <p className="text-xs font-bold text-amber-400 mb-1.5">{f.name}</p>
                    <p className="font-mono text-sm text-white bg-black/20 rounded-lg px-3 py-2">{f.formel}</p>
                    {f.erklaerung && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{f.erklaerung}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {hasBookingEntries && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <BookMarked size={14} className="text-amber-400" />
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Buchungssätze ({chapter.bookingEntries.length})
                </h2>
              </div>
              {chapter.bookingEntries.map((entry, idx) => (
                <TAccount key={entry.id} entry={entry} idx={idx} />
              ))}
            </section>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: ÜBEN  (both FRW and WR)
      ═══════════════════════════════════════════════════════════════════════ */}
      {tab === 'ueben' && (
        <div className="glass rounded-2xl p-8 text-center space-y-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <GraduationCap size={24} className="text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Buchungssatz-Trainer</h3>
            <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
              Starte den Trainer mit den {chapter.bookingEntries.length} Buchungssätzen aus diesem Kapitel — Karte für Karte mit sofortigem Feedback.
            </p>
          </div>
          <Link
            href={`/frw/trainer?chapterId=${chapter.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 0 20px rgba(245,158,11,0.25)' }}
          >
            Trainer starten ({chapter.bookingEntries.length} Karten)
          </Link>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: QUIZ
      ═══════════════════════════════════════════════════════════════════════ */}
      {tab === 'quiz' && (
        hasQuiz ? (
          <div className="glass rounded-2xl p-8 text-center space-y-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
            >
              <BookOpen size={24} className="text-violet-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Quiz</h3>
              <p className="text-slate-500 text-sm mt-1.5">{chapter.quizQuestions.length} Fragen zu diesem Kapitel</p>
            </div>
            <Link
              href={`/quiz/${chapter.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
            >
              <BookOpen size={14} /> Quiz starten
            </Link>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 text-center space-y-3">
            <p className="text-slate-500 text-sm">Für dieses Kapitel sind noch keine Quizfragen vorhanden.</p>
            <Link
              href={isFrw ? `/frw/trainer?chapterId=${chapter.id}` : `/topics/${chapter.topic.slug}`}
              className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              {isFrw ? '← Zum Buchungssatz-Trainer' : '← Zurück zum Thema'}
            </Link>
          </div>
        )
      )}

      {/* Actions (non-FRW or fallback) */}
      {!hasFrwContent && (
        <div className="glass rounded-2xl p-5 flex flex-wrap items-center gap-3">
          {hasQuiz && (
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
            {prevChapter ? (
              <Link href={`/chapters/${prevChapter.id}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                <ArrowLeft size={14} /> Vorheriges
              </Link>
            ) : (
              <Link href={`/topics/${chapter.topic.slug}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                <ArrowLeft size={14} /> Zurück
              </Link>
            )}
            {nextChapter && (
              <Link href={`/chapters/${nextChapter.id}`} className="flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Nächstes <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* FRW bottom nav */}
      {hasFrwContent && (
        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {prevChapter ? (
              <Link href={`/chapters/${prevChapter.id}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                <ArrowLeft size={14} /> Vorheriges
              </Link>
            ) : (
              <Link href={`/topics/${chapter.topic.slug}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                <ArrowLeft size={14} /> Zurück
              </Link>
            )}
          </div>
          <Link
            href={`/assistant?chapter=${chapter.id}`}
            className="flex items-center gap-2 text-sm font-semibold text-violet-300 px-4 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            <span>✦</span> Assistent fragen
          </Link>
          <div>
            {nextChapter && (
              <Link href={`/chapters/${nextChapter.id}`} className="flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
                Nächstes <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
