import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopicIcon } from '@/components/TopicIcon'
import { EXAM_LABELS_LONG, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/utils'
import { ArrowLeft, ArrowRight, BookOpen, HelpCircle, Target } from 'lucide-react'

const CATEGORY_STYLE: Record<string, { dot: string; badge: string }> = {
  bwl:   { dot: 'bg-blue-400',    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  vwl:   { dot: 'bg-emerald-400', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  recht: { dot: 'bg-violet-400',  badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
}

const EXAM_STYLE: Record<string, string> = {
  querschnitt: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  abschluss:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  both:        'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
}

const STATUS_STYLE: Record<string, string> = {
  complete: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  partial:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
  draft:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
  missing:  'text-slate-400 bg-slate-500/10 border-slate-500/20',
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          learningGoals: true,
          quizQuestions: { select: { id: true } },
        },
      },
    },
  })

  if (!topic) notFound()

  const examLabel = EXAM_LABELS_LONG[topic.examType as keyof typeof EXAM_LABELS_LONG] ?? topic.examType
  const examClass = EXAM_STYLE[topic.examType] ?? EXAM_STYLE.both
  const catLabel = CATEGORY_LABELS[topic.category] ?? topic.category
  const catStyle = CATEGORY_STYLE[topic.category] ?? { dot: 'bg-slate-400', badge: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
  const totalQuestions = topic.chapters.reduce((s, c) => s + c.quizQuestions.length, 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-600">
        <Link href="/" className="hover:text-slate-400 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/topics" className="hover:text-slate-400 transition-colors">Themen</Link>
        <span>/</span>
        <span className="text-slate-400">{topic.title}</span>
      </nav>

      {/* Header card */}
      <div className="glass rounded-2xl p-6 overflow-hidden relative">
        <div
          className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />

        <div className="relative z-10 flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <TopicIcon name={topic.icon} size={22} className="text-slate-200" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${catStyle.badge}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                {catLabel}
              </div>
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${examClass}`}>
                {examLabel}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">{topic.title}</h1>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">{topic.description}</p>
          </div>
        </div>

        <div className="relative z-10 flex gap-5 mt-5 pt-5 text-sm text-slate-500" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-blue-400" />
            {topic.chapters.length} Kapitel
          </div>
          {totalQuestions > 0 && (
            <div className="flex items-center gap-1.5">
              <HelpCircle size={13} className="text-violet-400" />
              {totalQuestions} Quizfragen
            </div>
          )}
        </div>
      </div>

      {/* Chapters */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target size={13} className="text-slate-500" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Kapitel</h2>
        </div>

        {topic.chapters.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <BookOpen size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="font-medium text-slate-400">Noch keine Kapitel vorhanden</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topic.chapters.map((chapter, idx) => {
              const statusLabel = STATUS_LABELS[chapter.contentStatus as keyof typeof STATUS_LABELS] ?? chapter.contentStatus
              const statusClass = STATUS_STYLE[chapter.contentStatus] ?? STATUS_STYLE.missing

              return (
                <div
                  key={chapter.id}
                  className="glass glass-hover rounded-xl group"
                >
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <div
                      className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 text-blue-400"
                      style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-200 text-sm group-hover:text-white transition-colors">
                          {chapter.title}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      {chapter.subtitle && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{chapter.subtitle}</p>
                      )}
                      {(chapter.learningGoals.length > 0 || chapter.quizQuestions.length > 0) && (
                        <div className="flex gap-3 mt-1 text-[11px] text-slate-600">
                          {chapter.learningGoals.length > 0 && <span>{chapter.learningGoals.length} Lernziele</span>}
                          {chapter.quizQuestions.length > 0 && <span>{chapter.quizQuestions.length} Fragen</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {chapter.quizQuestions.length > 0 && (
                        <Link
                          href={`/quiz/${chapter.id}`}
                          className="text-[11px] font-medium text-slate-400 px-3 py-1.5 rounded-lg transition-all hover:text-violet-400"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          Quiz
                        </Link>
                      )}
                      <Link
                        href={`/chapters/${chapter.id}`}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 px-3 py-1.5 rounded-lg transition-all hover:text-white group/btn"
                        style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}
                      >
                        Öffnen <ArrowRight size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Back */}
      <Link
        href="/topics"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft size={14} /> Alle Themen
      </Link>
    </div>
  )
}
