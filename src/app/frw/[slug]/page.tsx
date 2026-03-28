import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { ChevronLeft, BookOpen, Hash, FileText, Dumbbell, Lightbulb, AlertCircle, ArrowRight } from 'lucide-react'
import { BookingTrainer } from '@/components/frw/BookingTrainer'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

async function getChapter(slug: string) {
  return prisma.topic.findUnique({
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
        },
      },
    },
  })
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

  const topic = await getChapter(slug)
  if (!topic) notFound()

  const chapter = topic.chapters[0]
  if (!chapter) notFound()

  const tabs = [
    { id: 'theorie',     label: 'Theorie',        icon: BookOpen  },
    { id: 'buchungen',   label: 'Buchungssätze',   icon: Hash      },
    { id: 'begriffe',    label: 'Begriffe',         icon: FileText  },
    { id: 'ueben',       label: 'Üben',             icon: Dumbbell  },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium uppercase tracking-widest text-emerald-400">
            Kapitel {topic.order} · Band 2
          </span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {topic.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {topic.description}
        </p>
      </div>

      {/* Tab Nav */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit"
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

      {/* Tab Content */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >

        {/* THEORIE */}
        {tab === 'theorie' && (
          <div>
            {chapter.summary ? (
              <div className="prose-frw">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mt-8 mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-bold mt-6 mb-2 text-blue-400">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold mt-4 mb-1.5 text-emerald-400">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-1 mb-3 pl-4" style={{ listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-1 mb-3 pl-4" style={{ listStyleType: 'decimal', color: 'var(--text-secondary)' }}>
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm leading-relaxed">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{children}</strong>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote
                        className="pl-4 py-2 my-3 rounded-r-lg text-sm italic"
                        style={{ borderLeft: '3px solid #3b82f6', background: 'rgba(59,130,246,0.06)', color: 'var(--text-muted)' }}
                      >
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4 rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
                        <table className="w-full text-xs">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left font-semibold" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 text-sm" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {children}
                      </td>
                    ),
                    code: ({ children }) => (
                      <code
                        className="px-1.5 py-0.5 rounded text-xs font-mono"
                        style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}
                      >
                        {children}
                      </code>
                    ),
                    hr: () => (
                      <hr className="my-6" style={{ borderColor: 'var(--border-color)' }} />
                    ),
                  }}
                >
                  {chapter.summary}
                </ReactMarkdown>
              </div>
            ) : (
              <EmptyState icon={BookOpen} text="Theorie wird noch geladen." />
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
