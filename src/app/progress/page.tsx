import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Calculator, Hash, FileText, Lightbulb, BookOpen,
  ChevronRight, Dumbbell, ArrowRight, FunctionSquare,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getProgressData() {
  const topics = await prisma.topic.findMany({
    where: { category: 'frw' },
    orderBy: { order: 'asc' },
    include: {
      chapters: {
        take: 1,
        include: {
          _count: {
            select: {
              bookingEntries: true,
              keyTerms: true,
              corePoints: true,
              formulas: true,
            },
          },
        },
      },
    },
  })

  const totalBuchungen  = topics.reduce((s, t) => s + (t.chapters[0]?._count.bookingEntries ?? 0), 0)
  const totalBegriffe   = topics.reduce((s, t) => s + (t.chapters[0]?._count.keyTerms ?? 0), 0)
  const totalMerksaetze = topics.reduce((s, t) => s + (t.chapters[0]?._count.corePoints ?? 0), 0)
  const totalFormeln    = topics.reduce((s, t) => s + (t.chapters[0]?._count.formulas ?? 0), 0)
  const chaptersReady   = topics.filter(t => (t.chapters[0]?._count.bookingEntries ?? 0) > 0).length

  return { topics, totalBuchungen, totalBegriffe, totalMerksaetze, totalFormeln, chaptersReady }
}

const KAPITEL_COLORS: Record<number, { bg: string; border: string; text: string; bar: string }> = {
  2:  { bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.2)',  text: '#38bdf8', bar: '#0ea5e9' },
  3:  { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   text: '#f87171', bar: '#ef4444' },
  4:  { bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.2)',  text: '#fb923c', bar: '#f97316' },
  5:  { bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.2)',   text: '#facc15', bar: '#eab308' },
  6:  { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   text: '#4ade80', bar: '#22c55e' },
  7:  { bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.2)',  text: '#2dd4bf', bar: '#14b8a6' },
  8:  { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  text: '#60a5fa', bar: '#3b82f6' },
  9:  { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)',  text: '#a78bfa', bar: '#8b5cf6' },
  11: { bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.2)',  text: '#f472b6', bar: '#ec4899' },
}

export default async function ProgressPage() {
  const { topics, totalBuchungen, totalBegriffe, totalMerksaetze, totalFormeln, chaptersReady } = await getProgressData()

  const readyPct = topics.length > 0 ? Math.round((chaptersReady / topics.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calculator size={16} className="text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">Band 2</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Lernübersicht</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Alle FRW-Kapitel auf einen Blick — Inhalte und Lernmaterial
        </p>
      </div>

      {/* Stats overview */}
      <div
        className="rounded-2xl p-6 space-y-5 relative overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(16,185,129,0.06) 0%, transparent 60%)' }}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Gesamtinhalt</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {chaptersReady} von {topics.length} Kapiteln mit vollem Inhalt
              </p>
            </div>
            <span className="text-3xl font-extrabold text-emerald-400 tabular-nums">{readyPct}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden mb-5" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${readyPct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }}
            />
          </div>

          {/* Content stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Hash,           label: 'Buchungssätze', value: totalBuchungen,  color: 'text-blue-400',    bg: 'rgba(59,130,246,0.08)' },
              { icon: FileText,       label: 'Begriffe',      value: totalBegriffe,   color: 'text-violet-400',  bg: 'rgba(139,92,246,0.08)' },
              { icon: Lightbulb,      label: 'Merksätze',     value: totalMerksaetze, color: 'text-amber-400',   bg: 'rgba(234,179,8,0.08)'  },
              { icon: FunctionSquare, label: 'Formeln',       value: totalFormeln,    color: 'text-indigo-400',  bg: 'rgba(99,102,241,0.08)' },
            ].map(s => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
                  style={{ background: s.bg, border: '1px solid var(--border-color)' }}
                >
                  <Icon size={14} className={`${s.color} shrink-0`} />
                  <div>
                    <div className={`text-base font-bold tabular-nums ${s.color}`}>{s.value}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Kapitel list */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#10b981,#059669)' }} />
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-300">
            Finanz- &amp; Rechnungswesen · Band 2
          </h2>
        </div>

        {topics.map(topic => {
          const ch = topic.chapters[0]
          const colors = KAPITEL_COLORS[topic.order] ?? KAPITEL_COLORS[3]
          const buchungen  = ch?._count.bookingEntries ?? 0
          const begriffe   = ch?._count.keyTerms ?? 0
          const merksaetze = ch?._count.corePoints ?? 0
          const formeln    = ch?._count.formulas ?? 0
          const hasContent = buchungen > 0 || begriffe > 0

          // Content score: how "full" this chapter is (0–100)
          const maxBuchungen = 10, maxBegriffe = 12, maxMerksaetze = 8, maxFormeln = 5
          const contentScore = hasContent ? Math.min(100, Math.round(
            ((buchungen / maxBuchungen) * 40 +
             (begriffe / maxBegriffe) * 30 +
             (merksaetze / maxMerksaetze) * 20 +
             (formeln / maxFormeln) * 10)
          )) : 0

          return (
            <div
              key={topic.id}
              className="rounded-2xl p-5 space-y-4"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              {/* Chapter header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
                  >
                    Kap. {topic.order}
                  </div>
                  <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {topic.title}
                  </h3>
                </div>
                {hasContent && (
                  <span
                    className="text-xs font-bold tabular-nums shrink-0"
                    style={{ color: colors.text }}
                  >
                    {contentScore}%
                  </span>
                )}
              </div>

              {/* Content bar */}
              {hasContent ? (
                <>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${contentScore}%`, background: colors.bar, boxShadow: `0 0 6px ${colors.bar}66` }}
                    />
                  </div>

                  {/* Content chips */}
                  <div className="flex flex-wrap gap-2">
                    {buchungen > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#93c5fd' }}>
                        <Hash size={11} /> {buchungen} Buchungssätze
                      </div>
                    )}
                    {begriffe > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', color: '#c4b5fd' }}>
                        <FileText size={11} /> {begriffe} Begriffe
                      </div>
                    )}
                    {merksaetze > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)', color: '#fde68a' }}>
                        <Lightbulb size={11} /> {merksaetze} Merksätze
                      </div>
                    )}
                    {formeln > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                        <FunctionSquare size={11} /> {formeln} Formeln
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <Link
                      href={`/frw/${topic.slug}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-blue-400"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                    >
                      <BookOpen size={12} /> Theorie
                    </Link>
                    {buchungen > 0 && (
                      <Link
                        href={`/frw/${topic.slug}?tab=ueben`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-indigo-400"
                        style={{ background: 'rgba(99,102,241,0.06)', color: 'var(--text-muted)' }}
                      >
                        <Dumbbell size={12} /> Üben
                      </Link>
                    )}
                    <Link
                      href={`/frw/${topic.slug}?tab=begriffe`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-violet-400"
                      style={{ background: 'rgba(139,92,246,0.06)', color: 'var(--text-muted)' }}
                    >
                      <FileText size={12} /> Begriffe
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Inhalt in Vorbereitung
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Trainer CTA */}
      <Link
        href="/frw/trainer"
        className="rounded-2xl p-6 flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.06) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell size={15} className="text-indigo-400" />
            <span className="font-bold text-sm text-indigo-300">Buchungstrainer starten</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Kapitel auswählen und alle Buchungssätze interaktiv üben
          </p>
        </div>
        <ArrowRight size={16} className="text-indigo-400 shrink-0" />
      </Link>

    </div>
  )
}
