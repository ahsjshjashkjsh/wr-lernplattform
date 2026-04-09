import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BookOpen, FileText, GraduationCap, Clock } from 'lucide-react'
import { QuizTrainer } from '@/components/QuizTrainer'
import { FlashcardMode } from '@/components/frw/FlashcardMode'
import { VisitTracker } from '@/components/frw/VisitTracker'
import { TheorieTab } from '@/components/TheorieTab'

export const dynamic = 'force-dynamic'

// Verfügbar bis Ende 10. April 2026 (Prüfungstag)
const EXPIRY = new Date('2026-04-11T00:00:00')

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string; ch?: string }>
}

async function getGeschichteTopic(slug: string) {
  const [topic, allTopics] = await Promise.all([
    prisma.topic.findFirst({
      where: { slug, category: 'geschichte' },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            keyTerms:      { orderBy: { order: 'asc' } },
            corePoints:    { orderBy: { order: 'asc' } },
            learningGoals: { orderBy: { order: 'asc' } },
            quizQuestions: {
              include: { options: { orderBy: { order: 'asc' } } },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    }),
    prisma.topic.findMany({
      where: { category: 'geschichte', published: true },
      orderBy: { order: 'asc' },
      select: { slug: true, title: true, order: true },
    }),
  ])
  return { topic, allTopics }
}

export default async function GeschichteTopicPage({ params, searchParams }: Props) {
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

  const { slug }                   = await params
  const { tab: rawTab, ch: rawCh } = await searchParams
  const tab                        = rawTab ?? 'theorie'

  const { topic, allTopics } = await getGeschichteTopic(slug)
  if (!topic) notFound()

  const chIdx   = Math.max(0, Math.min(Number(rawCh ?? '0'), topic.chapters.length - 1))
  const chapter = topic.chapters[chIdx]
  if (!chapter) notFound()

  const currentIndex = allTopics.findIndex(t => t.slug === slug)
  const prevTopic    = currentIndex > 0 ? allTopics[currentIndex - 1] : null
  const nextTopic    = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null

  const tabs = [
    { id: 'theorie',  label: 'Theorie',  icon: BookOpen      },
    { id: 'begriffe', label: 'Begriffe', icon: FileText      },
    { id: 'quiz',     label: 'Quiz',     icon: GraduationCap },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {chapter && <VisitTracker chapterId={chapter.id} />}

      {/* Back */}
      <Link
        href="/geschichte"
        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-amber-400"
        style={{ color: 'var(--text-muted)' }}
      >
        <ChevronLeft size={14} />
        Geschichte Übersicht
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium uppercase tracking-widest text-amber-400">Geschichte</span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {topic.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {topic.description}
        </p>
      </div>

      {/* Chapter tabs — only if multiple chapters */}
      {topic.chapters.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          {topic.chapters.map((ch, i) => (
            <Link
              key={ch.id}
              href={`/geschichte/${slug}?tab=${tab}&ch=${i}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chIdx === i
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                  : 'border border-transparent hover:bg-white/5'
              }`}
              style={chIdx === i ? {} : { color: 'var(--text-muted)' }}
            >
              {ch.title}
            </Link>
          ))}
        </div>
      )}

      {/* Tab Nav */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <div
          className="flex items-center gap-1 p-1 rounded-xl w-fit min-w-max"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={`/geschichte/${slug}?tab=${id}&ch=${chIdx}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === id ? 'text-white shadow-sm' : 'hover:bg-white/5'
              }`}
              style={
                tab === id
                  ? { background: 'rgba(245,158,11,0.85)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              <Icon size={12} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div
        key={`${tab}-${chIdx}`}
        className="rounded-2xl p-6 fade-in"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        {/* THEORIE */}
        {tab === 'theorie' && (
          <TheorieTab
            learningGoals={chapter.learningGoals}
            summary={chapter.summary}
            corePoints={chapter.corePoints}
            accentColor="blue"
          />
        )}

        {/* BEGRIFFE */}
        {tab === 'begriffe' && (
          chapter.keyTerms.length > 0 ? (
            <div className="space-y-3">
              <FlashcardMode keyTerms={chapter.keyTerms} />
              {chapter.keyTerms.map(term => (
                <div
                  key={term.id}
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}
                >
                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {term.term}
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {term.definition}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={28} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine Begriffe vorhanden.</p>
            </div>
          )
        )}

        {/* QUIZ */}
        {tab === 'quiz' && (
          chapter.quizQuestions.length > 0 ? (
            <QuizTrainer questions={chapter.quizQuestions} chapterId={chapter.id} />
          ) : (
            <div className="text-center py-12">
              <GraduationCap size={28} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine Quiz-Fragen vorhanden.</p>
            </div>
          )
        )}
      </div>

      {/* Prev / Next Navigation */}
      <div className="flex items-center justify-between gap-4 pt-2">
        {prevTopic ? (
          <Link
            href={`/geschichte/${prevTopic.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:-translate-x-0.5 group"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={15} className="group-hover:text-amber-400 transition-colors" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Vorheriges</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{prevTopic.title}</div>
            </div>
          </Link>
        ) : <div />}

        {nextTopic ? (
          <Link
            href={`/geschichte/${nextTopic.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:translate-x-0.5 group"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Nächstes</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{nextTopic.title}</div>
            </div>
            <ChevronRight size={15} className="group-hover:text-amber-400 transition-colors" />
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
