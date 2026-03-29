import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BookOpen, FileText, GraduationCap, Lightbulb, BarChart2, Dumbbell } from 'lucide-react'
import { QuizTrainer } from '@/components/QuizTrainer'
import { TheoryTrainer } from '@/components/frw/TheoryTrainer'
import { ProgressBadge } from '@/components/ProgressBadge'
import { FlashcardMode } from '@/components/frw/FlashcardMode'
import { VisitTracker } from '@/components/frw/VisitTracker'
import { MarkdownContent } from '@/components/MarkdownContent'
import { KonjunkturVisual } from '@/components/wr/KonjunkturVisual'
import { MarketingVisual } from '@/components/wr/MarketingVisual'
import { VertragslehreVisual } from '@/components/wr/VertragslehreVisual'
import { GesellschaftsrechtVisual } from '@/components/wr/GesellschaftsrechtVisual'

const WR_VISUALS: Record<string, React.ComponentType> = {
  'wr-konjunktur':       KonjunkturVisual,
  'wr-marketing':        MarketingVisual,
  'wr-vertragslehre':    VertragslehreVisual,
  'wr-gesellschaftsrecht': GesellschaftsrechtVisual,
}

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string; ch?: string }>
}

const CATEGORY_LABEL: Record<string, string> = {
  bwl:   'BWL',
  vwl:   'VWL',
  recht: 'Recht',
}

async function getWrTopic(slug: string) {
  const [topic, allTopics] = await Promise.all([
    prisma.topic.findFirst({
      where: { slug, category: { in: ['bwl', 'vwl', 'recht'] } },
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
      where: { category: { in: ['bwl', 'vwl', 'recht'] }, published: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      select: { slug: true, title: true, order: true, category: true },
    }),
  ])
  return { topic, allTopics }
}


export default async function WrTopicPage({ params, searchParams }: Props) {
  const { slug }        = await params
  const { tab: rawTab, ch: rawCh } = await searchParams
  const tab = rawTab ?? 'theorie'

  const { topic, allTopics } = await getWrTopic(slug)
  if (!topic) notFound()

  // Chapter selector — default to first chapter
  const chIdx     = Math.max(0, Math.min(Number(rawCh ?? '0'), topic.chapters.length - 1))
  const chapter   = topic.chapters[chIdx]
  if (!chapter) notFound()

  // All quiz questions pooled from current chapter
  const quizQuestions = chapter.quizQuestions

  const currentIndex = allTopics.findIndex(t => t.slug === slug)
  const prevTopic    = currentIndex > 0 ? allTopics[currentIndex - 1] : null
  const nextTopic    = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null

  const catLabel = CATEGORY_LABEL[topic.category] ?? topic.category.toUpperCase()
  const hasVisual = slug in WR_VISUALS

  const user = await getCurrentUser()
  const chapterProgress = user ? await prisma.chapterProgress.findUnique({
    where: { chapterId_userId: { chapterId: chapter.id, userId: user.id } },
    select: { status: true, bestScore: true },
  }) : null

  const tabs = [
    { id: 'theorie',       label: 'Theorie',        icon: BookOpen      },
    { id: 'begriffe',      label: 'Begriffe',        icon: FileText      },
    ...(hasVisual ? [{ id: 'visual', label: 'Visualisierung', icon: BarChart2 }] : []),
    { id: 'theorie-ueben', label: 'Theorie üben',   icon: Dumbbell      },
    { id: 'quiz',          label: 'Quiz',            icon: GraduationCap },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {chapter && <VisitTracker chapterId={chapter.id} />}

      {/* Back */}
      <Link
        href="/wr"
        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-blue-400"
        style={{ color: 'var(--text-muted)' }}
      >
        <ChevronLeft size={14} />
        WR Übersicht
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="text-xs font-medium uppercase tracking-widest text-blue-400">
            {catLabel}
          </span>
          {user && (
            <ProgressBadge
              status={chapterProgress?.status ?? null}
              bestScore={chapterProgress?.bestScore ?? null}
            />
          )}
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
              href={`/wr/${slug}?tab=${tab}&ch=${i}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chIdx === i ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25' : 'border border-transparent hover:bg-white/5'
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
            href={`/wr/${slug}?tab=${id}&ch=${chIdx}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === id ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-white/5'
            }`}
            style={tab === id ? {} : { color: 'var(--text-muted)' }}
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
          <div className="space-y-6">
            {/* Learning Goals */}
            {chapter.learningGoals.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Lernziele
                </h3>
                <ul className="space-y-1.5">
                  {chapter.learningGoals.map(g => (
                    <li key={g.id} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-blue-400" />
                      {g.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            {chapter.summary ? (
              <MarkdownContent text={chapter.summary} />
            ) : (
              <div className="text-center py-12">
                <BookOpen size={28} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Theorie wird noch geladen.</p>
              </div>
            )}

            {/* Core Points */}
            {chapter.corePoints.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Merksätze
                </h3>
                {chapter.corePoints.map(cp => (
                  <div
                    key={cp.id}
                    className="flex items-start gap-3 p-3 rounded-xl text-sm"
                    style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}
                  >
                    <Lightbulb size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <span style={{ color: 'var(--text-secondary)' }}>{cp.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BEGRIFFE */}
        {tab === 'begriffe' && (
          <div>
            {chapter.keyTerms.length > 0 ? (
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
            )}
          </div>
        )}

        {/* VISUALISIERUNG */}
        {tab === 'visual' && (() => {
          const V = WR_VISUALS[slug]
          return V ? <V /> : null
        })()}

        {/* THEORIE ÜBEN */}
        {tab === 'theorie-ueben' && (
          (chapter.keyTerms.length > 0 || chapter.corePoints.length > 0) ? (
            <TheoryTrainer keyTerms={chapter.keyTerms} corePoints={chapter.corePoints} chapterId={chapter.id} />
          ) : (
            <div className="text-center py-12">
              <Dumbbell size={28} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine Theorieinhalte für dieses Kapitel.</p>
            </div>
          )
        )}

        {/* QUIZ */}
        {tab === 'quiz' && (
          <QuizTrainer questions={quizQuestions} chapterId={chapter.id} />
        )}

      </div>

      {/* Prev / Next Navigation */}
      <div className="flex items-center justify-between gap-4 pt-2">
        {prevTopic ? (
          <Link
            href={`/wr/${prevTopic.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:-translate-x-0.5 group"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={15} className="group-hover:text-blue-400 transition-colors" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Vorheriges</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {prevTopic.title}
              </div>
            </div>
          </Link>
        ) : <div />}

        {nextTopic ? (
          <Link
            href={`/wr/${nextTopic.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:translate-x-0.5 group"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Nächstes</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {nextTopic.title}
              </div>
            </div>
            <ChevronRight size={15} className="group-hover:text-blue-400 transition-colors" />
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
