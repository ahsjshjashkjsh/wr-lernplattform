import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import {
  ArrowRight, BookOpen, Dumbbell, Sparkles,
  Calculator, Hash, FileText, ChevronRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const user = await getCurrentUser()

  const topics = await prisma.topic.findMany({
    where: { category: 'frw' },
    orderBy: { order: 'asc' },
    include: {
      chapters: {
        take: 1,
        include: {
          _count: {
            select: { bookingEntries: true, keyTerms: true, corePoints: true },
          },
        },
      },
    },
  })

  const totalBuchungen = topics.reduce((s, t) => s + (t.chapters[0]?._count.bookingEntries ?? 0), 0)
  const totalBegriffe  = topics.reduce((s, t) => s + (t.chapters[0]?._count.keyTerms ?? 0), 0)

  return { user, topics, totalBuchungen, totalBegriffe }
}

const KAPITEL_COLORS: Record<number, { bg: string; border: string; text: string; dot: string }> = {
  2:  { bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.2)',  text: '#38bdf8', dot: '#0ea5e9' },
  3:  { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   text: '#f87171', dot: '#ef4444' },
  4:  { bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.2)',  text: '#fb923c', dot: '#f97316' },
  5:  { bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.2)',   text: '#facc15', dot: '#eab308' },
  6:  { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   text: '#4ade80', dot: '#22c55e' },
  7:  { bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.2)',  text: '#2dd4bf', dot: '#14b8a6' },
  8:  { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  text: '#60a5fa', dot: '#3b82f6' },
  9:  { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)',  text: '#a78bfa', dot: '#8b5cf6' },
  11: { bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.2)',  text: '#f472b6', dot: '#ec4899' },
}

export default async function DashboardPage() {
  const { user, topics, totalBuchungen, totalBegriffe } = await getDashboardData()
  const firstName = user?.name?.split(' ')[0] ?? null

  return (
    <div className="space-y-6 fade-in">

      {/* HERO */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.07) 50%, rgba(99,102,241,0.05) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)', transform: 'translate(35%, -35%)' }}
        />

        <div className="relative z-10 p-7 sm:p-9">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit mb-5">
            <Calculator size={10} />
            HMS · Finanz- &amp; Rechnungswesen · Band 2
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            {firstName ? `Hallo, ${firstName}.` : 'HMS-Lernplattform'}
          </h1>
          <p className="text-sm max-w-lg leading-relaxed mb-7" style={{ color: 'var(--text-secondary)' }}>
            Alle 9 FRW-Kapitel aus Band 2 — Theorie, Buchungssätze, Begriffe und interaktiver Trainer für die Abschlussprüfung.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/frw"
              className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px -4px rgba(16,185,129,0.5)' }}
            >
              <BookOpen size={14} /> Kapitel öffnen
            </Link>
            <Link
              href="/frw/trainer"
              className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
            >
              <Dumbbell size={14} className="text-indigo-400" /> Buchungstrainer
            </Link>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/frw',         icon: BookOpen,  label: 'Kapitel',       value: String(topics.length), sub: 'Band 2',         iconBg: 'rgba(16,185,129,0.12)', iconColor: 'text-emerald-400', glow: 'rgba(16,185,129,0.2)' },
          { href: '/frw/trainer', icon: Hash,      label: 'Buchungssätze', value: String(totalBuchungen),sub: 'zum Üben',       iconBg: 'rgba(59,130,246,0.12)', iconColor: 'text-blue-400',    glow: 'rgba(59,130,246,0.2)' },
          { href: '/frw',         icon: FileText,  label: 'Begriffe',      value: String(totalBegriffe), sub: 'Definitionen',   iconBg: 'rgba(139,92,246,0.12)', iconColor: 'text-violet-400',  glow: 'rgba(139,92,246,0.2)' },
          { href: '/assistant',   icon: Sparkles,  label: 'KI-Assistent',  value: '24/7',                sub: 'Fragen stellen', iconBg: 'rgba(99,102,241,0.12)', iconColor: 'text-indigo-400',  glow: 'rgba(99,102,241,0.2)' },
        ].map(card => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group relative rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 overflow-hidden"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at top left, ${card.glow} 0%, transparent 60%)` }}
              />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10" style={{ background: card.iconBg }}>
                <Icon size={18} className={card.iconColor} />
              </div>
              <div className="relative z-10">
                <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{card.label}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.sub}</div>
              </div>
              <ArrowRight size={13} className="absolute bottom-4 right-4 opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all" style={{ color: 'var(--text-muted)' }} />
            </Link>
          )
        })}
      </div>

      {/* KAPITEL GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator size={15} className="text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Kapitel</h2>
          </div>
          <Link href="/frw" className="flex items-center gap-1 text-xs hover:text-blue-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
            Alle anzeigen <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topics.map(topic => {
            const ch = topic.chapters[0]
            const colors = KAPITEL_COLORS[topic.order] ?? KAPITEL_COLORS[3]
            const hasContent = (ch?._count.bookingEntries ?? 0) > 0

            return (
              <Link
                key={topic.id}
                href={`/frw/${topic.slug}`}
                className="group rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }} />
                    Kap. {topic.order}
                  </div>
                  <ChevronRight size={13} className="transition-transform duration-150 group-hover:translate-x-0.5" style={{ color: 'var(--text-muted)' }} />
                </div>

                <h3 className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {topic.title}
                </h3>

                <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                  {hasContent ? (
                    <>
                      {ch!._count.bookingEntries > 0 && (
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <Hash size={10} /> {ch!._count.bookingEntries} Buchungen
                        </span>
                      )}
                      {ch!._count.keyTerms > 0 && (
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <FileText size={10} /> {ch!._count.keyTerms} Begriffe
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>In Vorbereitung</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* BOTTOM CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/frw/trainer"
          className="rounded-2xl p-6 flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.06) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell size={15} className="text-indigo-400" />
              <span className="font-bold text-sm text-indigo-300">Buchungstrainer</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Alle Kapitel wählbar · jede Runde anders</p>
          </div>
          <ArrowRight size={16} className="text-indigo-400 shrink-0" />
        </Link>

        <Link
          href="/assistant"
          className="rounded-2xl p-6 flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.05) 100%)', border: '1px solid rgba(59,130,246,0.18)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={15} className="text-blue-400" />
              <span className="font-bold text-sm text-blue-300">KI-Assistent</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fragen zu FRW · Erklärungen · Beispiele</p>
          </div>
          <ArrowRight size={16} className="text-blue-400 shrink-0" />
        </Link>
      </div>

    </div>
  )
}
