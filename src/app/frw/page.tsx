import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calculator, BookOpen, Zap, FileText, ChevronRight, GraduationCap, Target, Hash, BookMarked } from 'lucide-react'
import { FRW_BAND_LABELS } from '@/lib/utils'

export default async function FrwHubPage() {
  const topics = await prisma.topic.findMany({
    where: { category: 'frw', published: true },
    orderBy: [{ band: 'asc' }, { order: 'asc' }],
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { bookingEntries: true, formulas: true, quizQuestions: true } },
        },
      },
    },
  })

  const totalEntries = await prisma.bookingEntry.count({
    where: { chapter: { topic: { category: 'frw' } } },
  })
  const totalFormulas = await prisma.formula.count({
    where: { chapter: { topic: { category: 'frw' } } },
  })
  const totalChapters = topics.reduce((s, t) => s + t.chapters.length, 0)
  const totalQuiz = topics.reduce(
    (s, t) => s + t.chapters.reduce((cs, c) => cs + c._count.quizQuestions, 0),
    0
  )

  // Group by band
  const bands: Record<string, typeof topics> = {}
  for (const t of topics) {
    const key = t.band ?? 'other'
    if (!bands[key]) bands[key] = []
    bands[key].push(t)
  }

  const BAND_COLORS: Record<string, { border: string; bg: string; dot: string; badge: string; text: string }> = {
    '1': { border: 'rgba(59,130,246,0.2)', bg: 'rgba(59,130,246,0.05)', dot: '#3b82f6', badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20', text: 'text-blue-400' },
    '2': { border: 'rgba(245,158,11,0.2)', bg: 'rgba(245,158,11,0.05)', dot: '#f59e0b', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
    '3': { border: 'rgba(139,92,246,0.2)', bg: 'rgba(139,92,246,0.05)', dot: '#8b5cf6', badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20', text: 'text-violet-400' },
    other: { border: 'rgba(100,116,139,0.2)', bg: 'rgba(100,116,139,0.05)', dot: '#64748b', badge: 'text-slate-400 bg-slate-500/10 border-slate-500/20', text: 'text-slate-400' },
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(234,88,12,0.08) 50%, rgba(15,23,42,0) 100%)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(245,158,11,0.1) 0%, transparent 60%)' }} />
        <div className="relative z-10 px-8 py-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(234,88,12,0.2))', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Calculator size={28} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Finanz- & Rechnungswesen</h1>
            <p className="text-slate-400 mt-1.5 text-base">Buchungssätze verstehen, üben und meistern — Schritt für Schritt.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/frw/trainer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
            >
              <Zap size={15} />
              Trainer starten
            </Link>
            <Link
              href="/frw/spickzettel"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }}
            >
              <FileText size={15} />
              Spickzettel
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Themen', value: topics.length, icon: BookOpen, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Buchungssätze', value: totalEntries, icon: BookMarked, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Formeln', value: totalFormulas, icon: Hash, color: 'text-violet-400', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Quiz-Fragen', value: totalQuiz, icon: Target, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.bg }}>
              <stat.icon size={17} className={stat.color} />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Topics by Band */}
      {topics.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <GraduationCap size={40} className="text-amber-400/40 mx-auto mb-4" />
          <p className="text-slate-300 font-medium text-lg">FRW-Inhalte werden gerade aufgebaut</p>
          <p className="text-slate-500 text-sm mt-2">Die Themen und Buchungssätze werden bald hier erscheinen.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(bands).sort(([a], [b]) => a.localeCompare(b)).map(([band, bandTopics]) => {
            const c = BAND_COLORS[band] ?? BAND_COLORS.other
            return (
              <div key={band}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 rounded-full shrink-0" style={{ background: c.dot }} />
                  <h2 className={`text-sm font-bold uppercase tracking-widest ${c.text}`}>
                    {FRW_BAND_LABELS[band] ?? `Band ${band}`}
                  </h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${c.badge}`}>
                    {bandTopics.length} Themen
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bandTopics.map(topic => {
                    const chapterCount = topic.chapters.length
                    const entryCount = topic.chapters.reduce((s, ch) => s + ch._count.bookingEntries, 0)
                    const quizCount = topic.chapters.reduce((s, ch) => s + ch._count.quizQuestions, 0)
                    const hasContent = entryCount > 0 || chapterCount > 0

                    return (
                      <Link
                        key={topic.id}
                        href={hasContent ? `/topics/${topic.slug}` : '#'}
                        className={`group glass rounded-2xl overflow-hidden flex flex-col transition-all ${hasContent ? 'glass-hover cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                      >
                        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${c.dot}60, ${c.dot}10)` }} />
                        <div className="p-5 flex flex-col gap-4 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.bg, border: `1px solid ${c.dot}30` }}>
                              <Calculator size={18} style={{ color: c.dot }} />
                            </div>
                            {hasContent ? (
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${c.badge}`}>
                                {entryCount} Buchungssätze
                              </span>
                            ) : (
                              <span className="text-[11px] px-2 py-0.5 rounded-full border text-slate-600 border-slate-700 bg-slate-800/50">
                                Bald verfügbar
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors leading-snug">{topic.title}</h3>
                            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{topic.description}</p>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                              {chapterCount > 0 && <span>{chapterCount} Kapitel</span>}
                              {quizCount > 0 && <span>{quizCount} Quiz</span>}
                            </div>
                            {hasContent && (
                              <ChevronRight size={14} className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-200 text-base">Bereit zum Üben?</h3>
          <p className="text-slate-500 text-sm mt-1">Der Buchungssatz-Trainer testet dich mit allen Situationen — gemischt, mit sofortigem Feedback.</p>
        </div>
        <Link
          href="/frw/trainer"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white shrink-0 transition-all"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 0 20px rgba(245,158,11,0.25)' }}
        >
          <Zap size={15} />
          Jetzt trainieren
        </Link>
      </div>

    </div>
  )
}
