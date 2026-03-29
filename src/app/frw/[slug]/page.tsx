import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BookOpen, Hash, FileText, Dumbbell, Lightbulb, AlertCircle, ArrowRight, GraduationCap } from 'lucide-react'
import { BookingTrainer } from '@/components/frw/BookingTrainer'
import { TheoryTrainer } from '@/components/frw/TheoryTrainer'
import { FlashcardMode } from '@/components/frw/FlashcardMode'
import { VisitTracker } from '@/components/frw/VisitTracker'
import { QuizTrainer } from '@/components/QuizTrainer'
import { MarkdownContent } from '@/components/MarkdownContent'
import { ProgressBadge } from '@/components/ProgressBadge'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

async function getChapter(slug: string) {
  const [topic, allTopics] = await Promise.all([
    prisma.topic.findUnique({
      where: { slug, category: 'frw' },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            bookingEntries: { orderBy: { order: 'asc' } },
            keyTerms:       { orderBy: { order: 'asc' } },
            corePoints:     { orderBy: { order: 'asc' } },
            formulas:       { orderBy: { order: 'asc' } },
            learningGoals:  { orderBy: { order: 'asc' } },
            quizQuestions:  { include: { options: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
          },
        },
      },
    }),
    prisma.topic.findMany({
      where: { category: 'frw', published: true },
      orderBy: { order: 'asc' },
      select: { slug: true, title: true, order: true },
    }),
  ])
  return { topic, allTopics }
}

function TAccount({ soll, haben, betrag }: { soll: string; haben: string; betrag?: string }) {
  return (
    <div className="rounded-xl overflow-hidden text-xs font-mono" style={{ border: '1px solid var(--border-color)' }}>
      <div className="grid grid-cols-2">
        <div className="px-3 py-2 font-semibold text-blue-400" style={{ background: 'rgba(59,130,246,0.08)', borderRight: '2px solid var(--border-color)' }}>
          Soll (Debit)
        </div>
        <div className="px-3 py-2 font-semibold text-emerald-400" style={{ background: 'rgba(34,197,94,0.08)' }}>
          Haben (Kredit)
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="px-3 py-3 text-blue-300" style={{ borderRight: '2px solid var(--border-color)', background: 'rgba(59,130,246,0.04)' }}>
          {soll}
          {betrag && <div className="text-emerald-400 mt-1 font-semibold">{betrag}</div>}
        </div>
        <div className="px-3 py-3 text-emerald-300" style={{ background: 'rgba(34,197,94,0.04)' }}>
          {haben}
        </div>
      </div>
    </div>
  )
}

export default async function FrwChapterPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { tab: rawTab } = await searchParams
  const tab = rawTab ?? 'theorie'

  const { topic, allTopics } = await getChapter(slug)
  if (!topic) notFound()

  const chapter = topic.chapters[0]
  if (!chapter) notFound()

  const user = await getCurrentUser()
  const chapterProgress = user ? await prisma.chapterProgress.findUnique({
    where: { chapterId_userId: { chapterId: chapter.id, userId: user.id } },
    select: { status: true, bestScore: true },
  }) : null

  const currentIndex = allTopics.findIndex(t => t.slug === slug)
  if (currentIndex === -1) notFound()
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null

  const tabs = [
    { id: 'theorie',     label: 'Theorie',         icon: BookOpen      },
    { id: 'buchungen',   label: 'Buchungssätze',   icon: Hash          },
    { id: 'begriffe',    label: 'Begriffe',         icon: FileText      },
    { id: 'ueben',       label: 'Buchungen üben',  icon: Dumbbell      },
    { id: 'theorie-quiz',label: 'Theorie üben',    icon: GraduationCap },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      <VisitTracker chapterId={chapter.id} />

      {/* Back */}
      <Link
        href="/frw"
        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-blue-400"
        style={{ color: 'var(--text-muted)' }}
      >
        <ChevronLeft size={14} />
        FRW Übersicht
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="text-xs font-medium uppercase tracking-widest text-emerald-400">
            Kapitel {topic.order}{topic.band ? ` · Band ${topic.band}` : ''}
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

      {/* Tab Nav */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit min-w-max"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <Link
            key={id}
            href={`/frw/${slug}?tab=${id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'hover:bg-white/5'
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
        key={tab}
        className="rounded-2xl p-6 fade-in"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >

        {/* THEORIE */}
        {tab === 'theorie' && (
          <div className="space-y-6">
            {chapter.learningGoals.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Lernziele
                </h3>
                <ul className="space-y-1.5">
                  {chapter.learningGoals.map(g => (
                    <li key={g.id} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-400" />
                      {g.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {chapter.summary ? (
              <MarkdownContent text={chapter.summary} />
            ) : (
              <EmptyState icon={BookOpen} text="Theorie wird noch geladen." />
            )}
            {chapter.bookingEntries.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-4 mt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <Link
                  href={`/frw/${slug}?tab=buchungen`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:brightness-125"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}
                >
                  <Hash size={13} />
                  Buchungssätze ansehen
                </Link>
                <Link
                  href={`/frw/${slug}?tab=ueben`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:brightness-125"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}
                >
                  <Dumbbell size={13} />
                  Buchungen üben
                </Link>
              </div>
            )}
          </div>
        )}

        {/* BUCHUNGSSÄTZE */}
        {tab === 'buchungen' && (
          <div className="space-y-5">
            {chapter.bookingEntries.length > 0 ? (
              <>
                {chapter.formulas.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                      Formeln
                    </h3>
                    {chapter.formulas.map(f => (
                      <div
                        key={f.id}
                        className="flex items-start gap-3 p-3 rounded-xl text-sm"
                        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
                      >
                        <span className="font-semibold text-indigo-300 shrink-0">{f.name}:</span>
                        <span className="font-mono text-indigo-200">{f.formel}</span>
                      </div>
                    ))}
                  </div>
                )}
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Buchungssätze
                </h3>
                {chapter.bookingEntries.map(entry => (
                  <div key={entry.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {entry.situation}
                      </span>
                      {entry.betragHint && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-mono text-emerald-400" style={{ background: 'rgba(34,197,94,0.1)' }}>
                          {entry.betragHint}
                        </span>
                      )}
                    </div>
                    <TAccount soll={entry.sollKonto} haben={entry.habenKonto} />
                    {entry.erklaerung && (
                      <p className="text-xs pl-1" style={{ color: 'var(--text-muted)' }}>{entry.erklaerung}</p>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <EmptyState icon={Hash} text="Buchungssätze werden noch geladen." />
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
              <EmptyState icon={FileText} text="Begriffe werden noch geladen." />
            )}
          </div>
        )}

        {/* ÜBEN */}
        {tab === 'ueben' && (
          <div className="space-y-6">
            {chapter.bookingEntries.length > 0 ? (
              <>
                <BookingTrainer entries={chapter.bookingEntries} chapterTitle={topic.title} />
                <div
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
                >
                  <div>
                    <p className="text-sm font-medium text-indigo-300">Alle Kapitel zusammen üben</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Kapitel selbst auswählen und kombinieren
                    </p>
                  </div>
                  <Link
                    href="/frw/trainer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-indigo-300 transition-all hover:bg-indigo-500/10"
                  >
                    Zum Gesamttrainer
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12 space-y-3">
                <div
                  className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  <Dumbbell size={24} className="text-indigo-400" />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Keine Buchungssätze</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Für dieses Kapitel sind noch keine Übungsaufgaben vorhanden.
                </p>
              </div>
            )}
          </div>
        )}

        {/* THEORIE ÜBEN */}
        {tab === 'theorie-quiz' && (
          <div className="space-y-6">
            {(chapter.keyTerms.length > 0 || chapter.corePoints.length > 0) ? (
              <>
                <TheoryTrainer keyTerms={chapter.keyTerms} corePoints={chapter.corePoints} chapterId={chapter.id} />
                <div
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}
                >
                  <div>
                    <p className="text-sm font-medium text-amber-300">Buchungssätze üben</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Buchungstrainer für dieses Kapitel
                    </p>
                  </div>
                  <Link
                    href={`/frw/${slug}?tab=ueben`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-300 transition-all hover:bg-amber-500/10"
                  >
                    Zu Buchungen
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12 space-y-3">
                <GraduationCap size={28} className="mx-auto opacity-20" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine Theorieinhalte für dieses Kapitel.</p>
              </div>
            )}
          </div>
        )}

        {/* QUIZ */}
        {tab === 'quiz' && (
          <QuizTrainer questions={chapter.quizQuestions} chapterId={chapter.id} />
        )}

      </div>

      {/* Core Points als Merksätze */}
      {tab === 'theorie' && chapter.corePoints.length > 0 && (
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

      {/* Prev / Next Navigation */}
      <div className="flex items-center justify-between gap-4 pt-2">
        {prevTopic ? (
          <Link
            href={`/frw/${prevTopic.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:-translate-x-0.5 group"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={15} className="group-hover:text-blue-400 transition-colors" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Vorheriges</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                Kap. {prevTopic.order} · {prevTopic.title}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextTopic ? (
          <Link
            href={`/frw/${nextTopic.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:translate-x-0.5 group"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Nächstes</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                Kap. {nextTopic.order} · {nextTopic.title}
              </div>
            </div>
            <ChevronRight size={15} className="group-hover:text-blue-400 transition-colors" />
          </Link>
        ) : (
          <div />
        )}
      </div>

    </div>
  )
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="text-center py-12 space-y-3">
      <Icon size={28} className="mx-auto opacity-20" style={{ color: 'var(--text-muted)' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>
    </div>
  )
}
