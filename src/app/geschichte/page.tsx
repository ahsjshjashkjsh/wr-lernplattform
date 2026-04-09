import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronRight, Landmark, FileText, GraduationCap, BookOpen, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Verfügbar bis Ende 10. April 2026 (Prüfungstag)
const EXPIRY = new Date('2026-04-11T00:00:00')

async function getTopics() {
  return prisma.topic.findMany({
    where: { category: 'geschichte', published: true },
    orderBy: { order: 'asc' },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { keyTerms: true, quizQuestions: true, learningGoals: true } },
        },
      },
    },
  })
}

export default async function GeschichtePage() {
  if (new Date() >= EXPIRY) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <Clock size={24} className="text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Sektion nicht mehr verfügbar
          </p>
          <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Die Geschichte-Sektion war nur für die Prüfungsvorbereitung am 9./10. April 2026 verfügbar.
          </p>
        </div>
      </div>
    )
  }

  const topics = await getTopics()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Landmark size={18} className="text-amber-400" />
          <span className="text-xs font-medium text-amber-400 uppercase tracking-widest">Geschichte</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Geschichte</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {topics.reduce((s, t) => s + t.chapters.length, 0)} Kapitel · Prüfungsstoff Abschlussprüfung 10. April 2026
        </p>
      </div>

      {/* Nur-heute Banner */}
      <div
        className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
      >
        <span className="text-amber-400 text-base shrink-0">⏰</span>
        <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-semibold text-amber-400">Nur heute &amp; morgen verfügbar.</span>
          {' '}Diese Sektion enthält den Prüfungsstoff für die Abschlussprüfung Geschichte vom 10. April 2026.
        </div>
      </div>

      {/* Topics */}
      {topics.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Themen
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map(topic => {
              const totalTerms = topic.chapters.reduce((s, ch) => s + ch._count.keyTerms, 0)
              const totalQuiz  = topic.chapters.reduce((s, ch) => s + ch._count.quizQuestions, 0)
              const totalGoals = topic.chapters.reduce((s, ch) => s + ch._count.learningGoals, 0)
              return (
                <Link
                  key={topic.id}
                  href={`/geschichte/${topic.slug}`}
                  className="group relative rounded-2xl p-5 hover:-translate-y-0.5 hover:border-white/15"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    transition: 'transform 200ms, border-color 200ms',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Geschichte
                    </div>
                    <ChevronRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    />
                  </div>
                  <h2 className="text-sm font-semibold mb-1.5 leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {topic.title}
                  </h2>
                  <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>
                    {topic.description}
                  </p>
                  <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    {totalTerms > 0 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <FileText size={11} /> {totalTerms} Begriffe
                      </span>
                    )}
                    {totalQuiz > 0 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <GraduationCap size={11} /> {totalQuiz} Fragen
                      </span>
                    )}
                    {totalTerms === 0 && totalQuiz === 0 && totalGoals > 0 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <BookOpen size={11} /> {totalGoals} Lernziele
                      </span>
                    )}
                    {totalTerms === 0 && totalQuiz === 0 && totalGoals === 0 && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>In Vorbereitung</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Landmark size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Inhalt wird gleich hinzugefügt.</p>
        </div>
      )}
    </div>
  )
}
