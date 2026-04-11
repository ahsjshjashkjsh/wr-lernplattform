import { prisma } from '@/lib/prisma'
import { getCurrentUser, isPremiumActive } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BookOpen, FileText, GraduationCap, BarChart2, Dumbbell, Crown, Lock } from 'lucide-react'
import { QuizTrainer } from '@/components/QuizTrainer'
import { TheoryTrainer } from '@/components/frw/TheoryTrainer'
import { ProgressBadge } from '@/components/ProgressBadge'
import { FlashcardMode } from '@/components/frw/FlashcardMode'
import { VisitTracker } from '@/components/frw/VisitTracker'
import { TheorieTab } from '@/components/TheorieTab'
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

function WrPremiumCta() {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
        <Lock size={24} className="text-amber-400" />
      </div>
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Premium-Inhalt
        </p>
        <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
          Schalte alle Inhalte frei — Zusammenfassung, Begriffe, Übungen und Quiz.
        </p>
      </div>
      <a
        href="/premium"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
      >
        <Crown size={14} />
        Premium freischalten — CHF 5 / Monat
      </a>
    </div>
  )
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
  const hasPremium = user ? ((user as any).isCreator || isPremiumActive(user)) : false

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
          hasPremium ? (
            <TheorieTab
              learningGoals={chapter.learningGoals}
              summary={chapter.summary}
              corePoints={chapter.corePoints}
              accentColor="blue"
            />
          ) : (
            <div className="space-y-4">
              {/* Vorschau: erste ~200 Zeichen der Zusammenfassung */}
              {chapter.summary && (
                <div className="relative">
                  <div style={{ maxHeight: '140px', overflow: 'hidden' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {chapter.summary.slice(0, 220).replace(/#+\s/g, '')}…
                    </p>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, var(--card-bg), transparent)' }} />
                </div>
              )}
              <WrPremiumCta />
            </div>
          )
        )}

        {/* BEGRIFFE */}
        {tab === 'begriffe' && (
          hasPremium ? (
            <div>
              {chapter.keyTerms.length > 0 ? (
                <div className="space-y-3">
                  <FlashcardMode keyTerms={chapter.keyTerms} />
                  {chapter.keyTerms.map(term => (
                    <div key={term.id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                      <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{term.term}</div>
                      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{term.definition}</div>
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
          ) : <WrPremiumCta />
        )}

        {/* VISUALISIERUNG */}
        {tab === 'visual' && (
          hasPremium ? (() => { const V = WR_VISUALS[slug]; return V ? <V /> : null })() : <WrPremiumCta />
        )}

        {/* THEORIE ÜBEN */}
        {tab === 'theorie-ueben' && (
          hasPremium ? (
            (chapter.keyTerms.length > 0 || chapter.corePoints.length > 0) ? (
              <TheoryTrainer keyTerms={chapter.keyTerms} corePoints={chapter.corePoints} chapterId={chapter.id} />
            ) : (
              <div className="text-center py-12">
                <Dumbbell size={28} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine Theorieinhalte für dieses Kapitel.</p>
              </div>
            )
          ) : <WrPremiumCta />
        )}

        {/* QUIZ */}
        {tab === 'quiz' && (
          hasPremium
            ? <QuizTrainer questions={quizQuestions} chapterId={chapter.id} />
            : <WrPremiumCta />
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
