import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import {
  ArrowRight, BookOpen, Dumbbell, Sparkles,
  Calculator, Hash, FileText, ChevronRight,
  TrendingUp, Scale, Clock,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 2) return 'gerade eben'
  if (diffMin < 60) return `vor ${diffMin} Minuten`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `vor ${diffH} Stunde${diffH === 1 ? '' : 'n'}`
  const diffD = Math.floor(diffH / 24)
  return `vor ${diffD} Tag${diffD === 1 ? '' : 'en'}`
}

async function getDashboardData() {
  const user = await getCurrentUser()

  const [frwTopics, lastProgress] = await Promise.all([
    prisma.topic.findMany({
      where: { category: 'frw' },
      orderBy: { order: 'asc' },
      include: {
        chapters: {
          take: 1,
          include: {
            _count: { select: { bookingEntries: true, keyTerms: true } },
          },
        },
      },
    }),
    user ? prisma.chapterProgress.findFirst({
      where: { userId: user.id },
      orderBy: { lastVisited: 'desc' },
      include: {
        chapter: {
          include: { topic: { select: { slug: true, title: true, order: true, category: true } } },
        },
      },
    }) : null,
  ])

  const totalBuchungen = frwTopics.reduce((s, t) => s + (t.chapters[0]?._count.bookingEntries ?? 0), 0)
  const totalBegriffe  = frwTopics.reduce((s, t) => s + (t.chapters[0]?._count.keyTerms ?? 0), 0)

  return { user, frwTopics, totalBuchungen, totalBegriffe, lastProgress }
}

export default async function DashboardPage() {
  const { user, frwTopics, totalBuchungen, totalBegriffe, lastProgress } = await getDashboardData()
  const firstName = user?.name?.split(' ')[0] ?? null

  return (
    <div className="space-y-8 fade-in">

      {/* HERO */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.07) 50%, rgba(139,92,246,0.05) 100%)',
          border: '1px solid rgba(99,102,241,0.18)',
        }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)', transform: 'translate(35%, -35%)' }} />

        <div className="relative z-10 p-7 sm:p-9">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full w-fit mb-5">
            <Sparkles size={10} />
            HMS · H23b · Abschlussprüfung 2026
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            {firstName ? `Hallo, ${firstName}.` : 'HMS-Lernplattform'}
          </h1>
          <p className="text-sm max-w-lg leading-relaxed mb-7" style={{ color: 'var(--text-secondary)' }}>
            Deine Plattform zur Prüfungsvorbereitung — FRW, Wirtschaft &amp; Recht und mehr. Theorie, Übungen und KI-Assistent.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/frw"
              className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 20px -4px rgba(99,102,241,0.5)' }}
            >
              <BookOpen size={14} /> Lernen starten
            </Link>
            <Link
              href="/assistant"
              className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
            >
              <Sparkles size={14} className="text-indigo-400" /> KI-Assistent
            </Link>
          </div>
        </div>
      </div>

      {/* FÄCHER */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Fächer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* FRW — aktiv */}
          <Link
            href="/frw"
            className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'var(--card-bg)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <Calculator size={20} className="text-emerald-400" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                Verfügbar
              </span>
            </div>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Finanz- &amp; Rechnungswesen
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Band 2 · {frwTopics.length} Kapitel · Buchungssätze, Theorie &amp; Trainer
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Hash size={11} /> {totalBuchungen} Buchungen
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <FileText size={11} /> {totalBegriffe} Begriffe
              </span>
              <ArrowRight size={13} className="ml-auto text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* WR — aktiv */}
          <Link
            href="/wr"
            className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'var(--card-bg)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <Scale size={20} className="text-blue-400" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-blue-300 bg-blue-500/10 border border-blue-500/20">
                Verfügbar
              </span>
            </div>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Wirtschaft &amp; Recht
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              BWL · VWL · Recht · Theorie, Begriffe &amp; Quiz
            </p>
            <div className="flex items-center">
              <ArrowRight size={13} className="ml-auto text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* FRW Band 1 — coming soon */}
          <div
            className="rounded-2xl p-5 opacity-60"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
              >
                <Calculator size={20} className="text-violet-400" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-slate-400 bg-white/5 border border-white/10">
                In Vorbereitung
              </span>
            </div>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              FRW Band 1
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Grundlagen Rechnungswesen · Kommt bald
            </p>
          </div>

          {/* FRW Band 3 — coming soon */}
          <div
            className="rounded-2xl p-5 opacity-60"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)' }}
              >
                <TrendingUp size={20} className="text-pink-400" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-slate-400 bg-white/5 border border-white/10">
                In Vorbereitung
              </span>
            </div>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              FRW Band 3
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Erweitertes Rechnungswesen · Kommt bald
            </p>
          </div>

        </div>
      </div>

      {/* ZULETZT BESUCHT */}
      {lastProgress && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Weitermachen
          </h2>
          <Link
            href={`/${lastProgress.chapter.topic.category === 'frw' ? 'frw' : 'wr'}/${lastProgress.chapter.topic.slug}`}
            className="flex items-center justify-between gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--card-bg)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <BookOpen size={15} className="text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  Kap. {lastProgress.chapter.topic.order} · {lastProgress.chapter.topic.title}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {formatRelativeTime(lastProgress.lastVisited)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 shrink-0">
              Weitermachen <ChevronRight size={13} />
            </div>
          </Link>
        </div>
      )}

      {/* QUICK ACCESS */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Schnellzugriff
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/frw/trainer"
            className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.06) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Dumbbell size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-300">Buchungstrainer</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>FRW · alle Kapitel</p>
            </div>
          </Link>

          <Link
            href="/progress"
            className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.05) 100%)', border: '1px solid rgba(16,185,129,0.18)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.12)' }}>
              <Clock size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-300">Lernübersicht</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Fortschritt &amp; Inhalte</p>
            </div>
          </Link>

          <Link
            href="/assistant"
            className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.05) 100%)', border: '1px solid rgba(59,130,246,0.18)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <Sparkles size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-300">KI-Assistent</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Fragen stellen</p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  )
}
