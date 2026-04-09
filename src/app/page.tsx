import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import {
  ArrowRight, BookOpen, Dumbbell, Sparkles,
  Calculator, Hash, FileText, ChevronRight,
  Scale, Clock, GraduationCap, Layers, Bot, Landmark,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const GESCHICHTE_EXPIRY = new Date('2026-04-11T00:00:00')

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

  const [frwTopics, wrTopics, lastProgress] = await Promise.all([
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
    prisma.topic.findMany({
      where: { category: { in: ['bwl', 'vwl', 'recht'] }, published: true },
      select: { category: true, id: true },
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

  const wrByCategory = {
    bwl:   wrTopics.filter(t => t.category === 'bwl').length,
    vwl:   wrTopics.filter(t => t.category === 'vwl').length,
    recht: wrTopics.filter(t => t.category === 'recht').length,
  }

  return { user, frwTopics, totalBuchungen, totalBegriffe, wrByCategory, lastProgress }
}

export default async function DashboardPage() {
  const { user, frwTopics, totalBuchungen, totalBegriffe, wrByCategory, lastProgress } = await getDashboardData()
  const firstName = user?.name?.split(' ')[0] ?? null
  const wrTotal = wrByCategory.bwl + wrByCategory.vwl + wrByCategory.recht

  return (
    <div className="space-y-8 fade-in">

      {/* HERO */}
      <div className="pt-2 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--text-muted)' }}>
          HMS · H23b · Abschlussprüfung 2026
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          {firstName ? `Hallo, ${firstName}.` : 'HMS-Lernplattform'}
        </h1>
        <p className="text-sm max-w-md leading-relaxed mb-7" style={{ color: 'var(--text-secondary)' }}>
          Deine Plattform zur Prüfungsvorbereitung — FRW, Wirtschaft &amp; Recht und mehr.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/frw"
            className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--accent)', boxShadow: '0 2px 12px rgba(79,114,245,0.35)' }}
          >
            <BookOpen size={14} /> Lernen starten
          </Link>
          <Link
            href="/assistant"
            className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-all hover:border-white/20"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <Bot size={14} /> KI-Assistent
          </Link>
        </div>
      </div>

      {/* FÄCHER */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Fächer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* FRW */}
          <Link
            href="/frw"
            className="group rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 flex flex-col"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <Calculator size={22} className="text-emerald-400" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                Verfügbar
              </span>
            </div>

            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Finanz- &amp; Rechnungswesen
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Buchungssätze, Theorie &amp; interaktiver Trainer
            </p>

            {/* Band chips */}
            <div className="flex gap-2 mb-5">
              {['Band 1', 'Band 2', 'Band 3'].map(b => (
                <span
                  key={b}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#6ee7b7' }}
                >
                  {b}
                </span>
              ))}
            </div>

            <div
              className="flex items-center gap-4 pt-4 mt-auto"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Hash size={11} className="text-emerald-400" /> {totalBuchungen} Buchungen
              </span>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <FileText size={11} className="text-emerald-400" /> {totalBegriffe} Begriffe
              </span>
              <ArrowRight size={14} className="ml-auto text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* WR */}
          <Link
            href="/wr"
            className="group rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 flex flex-col"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <Scale size={22} className="text-blue-400" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-blue-300 bg-blue-500/10 border border-blue-500/20">
                Verfügbar
              </span>
            </div>

            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Wirtschaft &amp; Recht
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Theorie, Begriffe, Visualisierungen &amp; Quiz
            </p>

            {/* Category chips */}
            <div className="flex gap-2 mb-5">
              {[
                { label: `BWL`,   count: wrByCategory.bwl,   color: '#60a5fa', bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.2)' },
                { label: `VWL`,   count: wrByCategory.vwl,   color: '#4ade80', bg: 'rgba(34,197,94,0.08)',    border: 'rgba(34,197,94,0.2)' },
                { label: `Recht`, count: wrByCategory.recht, color: '#fb923c', bg: 'rgba(249,115,22,0.08)',   border: 'rgba(249,115,22,0.2)' },
              ].map(c => (
                <span
                  key={c.label}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
                >
                  {c.count} {c.label}
                </span>
              ))}
            </div>

            <div
              className="flex items-center gap-4 pt-4 mt-auto"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Layers size={11} className="text-blue-400" /> {wrTotal} Themen
              </span>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <GraduationCap size={11} className="text-blue-400" /> Quiz &amp; Trainer
              </span>
              <ArrowRight size={14} className="ml-auto text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

        </div>

          {/* Geschichte — nur heute */}
          {new Date() < GESCHICHTE_EXPIRY && (
            <Link
              href="/geschichte"
              className="group rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/20 flex flex-col sm:col-span-2"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
                >
                  <Landmark size={22} className="text-amber-400" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-amber-300 bg-amber-500/10 border border-amber-500/25 animate-pulse">
                  ⏰ Nur heute
                </span>
              </div>

              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Geschichte
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                Prüfungsstoff · Abschlussprüfung 10. April 2026
              </p>

              <div
                className="flex items-center gap-4 pt-4 mt-auto"
                style={{ borderTop: '1px solid rgba(245,158,11,0.15)' }}
              >
                <span className="text-xs" style={{ color: 'rgba(251,191,36,0.7)' }}>
                  Zusammenfassung, Begriffe &amp; Quiz
                </span>
                <ArrowRight size={14} className="ml-auto text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* WEITERMACHEN */}
      {lastProgress && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Weitermachen
          </h2>
          <Link
            href={`/${lastProgress.chapter.topic.category === 'frw' ? 'frw' : 'wr'}/${lastProgress.chapter.topic.slug}`}
            className="flex items-center justify-between gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:border-white/15"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--icon-bg)', border: '1px solid var(--border-color)' }}
              >
                <BookOpen size={15} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {lastProgress.chapter.topic.title}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {formatRelativeTime(lastProgress.lastVisited)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium shrink-0" style={{ color: 'var(--accent)' }}>
              Weitermachen <ChevronRight size={13} />
            </div>
          </Link>
        </div>
      )}

      {/* SCHNELLZUGRIFF */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Schnellzugriff
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/frw/trainer"
            className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:border-white/15"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--icon-bg)' }}>
              <Dumbbell size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Buchungstrainer</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>FRW · alle Kapitel</p>
            </div>
          </Link>

          <Link
            href="/progress"
            className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:border-white/15"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--icon-bg)' }}>
              <Clock size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Lernübersicht</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>FRW &amp; WR Inhalte</p>
            </div>
          </Link>

          <Link
            href="/assistant"
            className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:border-white/15"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--icon-bg)' }}>
              <Bot size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>KI-Assistent</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Fragen stellen</p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  )
}
