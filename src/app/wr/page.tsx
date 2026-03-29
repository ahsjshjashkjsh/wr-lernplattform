import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { ChevronRight, Scale, FileText, GraduationCap, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

const CATEGORY_META = {
  bwl:   { label: 'Betriebswirtschaft (BWL)', color: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)'  },
  vwl:   { label: 'Volkswirtschaft (VWL)',    color: '#a78bfa', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)'  },
  recht: { label: 'Recht',                    color: '#f472b6', bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.2)'  },
} as const

async function getWrData() {
  const user = await getCurrentUser()
  const [topics, progressList] = await Promise.all([
    prisma.topic.findMany({
      where: { category: { in: ['bwl', 'vwl', 'recht'] }, published: true },
      orderBy: { order: 'asc' },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { keyTerms: true, quizQuestions: true, learningGoals: true } },
          },
        },
      },
    }),
    user
      ? prisma.chapterProgress.findMany({
          where: { userId: user.id },
          select: { chapterId: true, status: true },
        })
      : [],
  ])
  const progressMap = new Map(progressList.map(p => [p.chapterId, p.status]))
  return { topics, progressMap }
}

export default async function WrPage() {
  const { topics, progressMap } = await getWrData()

  const grouped = {
    bwl:   topics.filter(t => t.category === 'bwl'),
    vwl:   topics.filter(t => t.category === 'vwl'),
    recht: topics.filter(t => t.category === 'recht'),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Scale size={18} className="text-blue-400" />
          <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">WR</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Wirtschaft &amp; Recht
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {topics.length} Themen · BWL, VWL und Recht für die Abschlussprüfung
        </p>
      </div>

      {/* Sections */}
      {(['bwl', 'vwl', 'recht'] as const).map(cat => {
        const list = grouped[cat]
        if (list.length === 0) return null
        const meta = CATEGORY_META[cat]
        return (
          <div key={cat} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {meta.label}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map(topic => {
                const visited = topic.chapters.some(ch => progressMap.has(ch.id))
                const totalTerms = topic.chapters.reduce((s, ch) => s + ch._count.keyTerms, 0)
                const totalQuiz  = topic.chapters.reduce((s, ch) => s + ch._count.quizQuestions, 0)
                const totalGoals = topic.chapters.reduce((s, ch) => s + ch._count.learningGoals, 0)
                return (
                  <Link
                    key={topic.id}
                    href={`/wr/${topic.slug}`}
                    className="group relative rounded-2xl p-5 hover:-translate-y-0.5 hover:border-white/20"
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      transition: 'transform 200ms, border-color 200ms',
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                        {cat.toUpperCase()}
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
                      {totalGoals > 0 && totalTerms === 0 && totalQuiz === 0 && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <BookOpen size={11} /> {totalGoals} Lernziele
                        </span>
                      )}
                      {totalTerms === 0 && totalQuiz === 0 && totalGoals === 0 && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>In Vorbereitung</span>
                      )}
                      {visited && (
                        <span
                          className="ml-auto flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          Besucht
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      {topics.length === 0 && (
        <div className="text-center py-16">
          <Scale size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine WR-Themen vorhanden.</p>
        </div>
      )}
    </div>
  )
}
