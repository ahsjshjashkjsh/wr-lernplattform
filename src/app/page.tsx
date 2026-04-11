import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import {
  ArrowRight, BookOpen,
  Calculator, Hash, FileText,
  Scale, Clock, GraduationCap, Layers, Bot,
  ChevronRight, GitCommit, Landmark,
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
    <div className="space-y-10 fade-in">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <div className="pt-4 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: 'var(--text-muted)' }}>
          HMS Handelsmittelschule · H23b · AP 2026
        </p>
        <h1
          className="text-[2.6rem] sm:text-[3.25rem] font-extrabold leading-[1.05] mb-6"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
        >
          {firstName ? (
            <>{firstName}<span style={{ color: 'var(--text-muted)' }}>.</span></>
          ) : (
            <>HMS<wbr /><span style={{ color: 'var(--text-muted)' }}>-</span>Lernplattform</>
          )}
        </h1>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/frw"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--accent)', boxShadow: '0 2px 16px rgba(79,114,245,0.3)' }}
          >
            <BookOpen size={14} /> FRW lernen
          </Link>
          <Link
            href="/wr"
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl card-link"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Scale size={14} /> WR lernen
          </Link>
        </div>
      </div>

      {/* ── GESCHICHTE (nur heute) ────────────────────────────── */}
      {new Date() < GESCHICHTE_EXPIRY && (
        <Link
          href="/geschichte"
          className="group rounded-2xl p-5 flex items-center gap-5 transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <Landmark size={20} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Geschichte</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-amber-300 bg-amber-500/10 border border-amber-500/25 animate-pulse">
                ⏰ Nur heute
              </span>
            </div>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              Prüfungsstoff · Prüfung 10. April 2026
            </p>
          </div>
          <ArrowRight size={15} className="shrink-0 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* ── FÄCHER ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger">

        {/* FRW card */}
        <Link
          href="/frw"
          className="group card-link rounded-2xl p-6 flex flex-col min-h-[200px]"
        >
          <div className="flex items-start justify-between mb-auto">
            <div>
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded mb-3"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.18)' }}
              >
                Verfügbar
              </span>
              <h2
                className="text-xl font-bold leading-tight mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Finanz- &amp; Rechnungswesen
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Buchungssätze, Theorie &amp; Trainer · Band 1–3
              </p>
            </div>
            <ArrowRight
              size={16}
              className="shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-0.5"
              style={{ color: 'var(--text-muted)' }}
            />
          </div>

          <div
            className="flex items-center gap-5 pt-4 mt-6"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{totalBuchungen}</span> Buchungen
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{totalBegriffe}</span> Begriffe
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{frwTopics.length}</span> Kapitel
            </span>
          </div>
        </Link>

        {/* WR card */}
        <Link
          href="/wr"
          className="group card-link rounded-2xl p-6 flex flex-col min-h-[200px]"
        >
          <div className="flex items-start justify-between mb-auto">
            <div>
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded mb-3"
                style={{ background: 'rgba(79,114,245,0.1)', color: '#93aaf7', border: '1px solid rgba(79,114,245,0.2)' }}
              >
                Verfügbar
              </span>
              <h2
                className="text-xl font-bold leading-tight mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Wirtschaft &amp; Recht
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Theorie, Begriffe, Quiz &amp; Visualisierungen
              </p>
            </div>
            <ArrowRight
              size={16}
              className="shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-0.5"
              style={{ color: 'var(--text-muted)' }}
            />
          </div>

          <div
            className="flex items-center gap-5 pt-4 mt-6"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{wrByCategory.bwl}</span> BWL
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{wrByCategory.vwl}</span> VWL
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{wrByCategory.recht}</span> Recht
            </span>
          </div>
        </Link>

      </div>

      {/* ── WEITERMACHEN ──────────────────────────────────────── */}
      {lastProgress && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--text-muted)' }}>
            Weitermachen
          </p>
          <Link
            href={`/${lastProgress.chapter.topic.category === 'frw' ? 'frw' : 'wr'}/${lastProgress.chapter.topic.slug}`}
            className="group card-link rounded-xl px-5 py-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: 'var(--accent)' }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {lastProgress.chapter.topic.title}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Zuletzt besucht {formatRelativeTime(lastProgress.lastVisited)}
                </p>
              </div>
            </div>
            <span
              className="flex items-center gap-1 text-xs font-medium shrink-0 group-hover:gap-1.5 transition-all"
              style={{ color: 'var(--accent)' }}
            >
              Weitermachen <ChevronRight size={13} />
            </span>
          </Link>
        </div>
      )}

      {/* ── TOOLS ─────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--text-muted)' }}>
          Tools
        </p>
        <div
          className="rounded-xl overflow-hidden stagger"
          style={{ border: '1px solid var(--border-color)' }}
        >
          {[
            {
              href: '/progress',
              label: 'Lernübersicht',
              sub: 'FRW &amp; WR · Fortschritt im Überblick',
              icon: Clock,
            },
            {
              href: '/assistant',
              label: 'KI-Assistent',
              sub: 'Fragen stellen, Themen vertiefen',
              icon: Bot,
            },
          ].map((item, idx, arr) => (
            <Link
              key={item.href}
              href={item.href}
              className="group hover-card flex items-center justify-between gap-4 px-5 py-4"
              style={{
                background: 'var(--card-bg)',
                borderTop: idx > 0 ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <div className="flex items-center gap-3.5">
                <item.icon size={15} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                    dangerouslySetInnerHTML={{ __html: item.sub }}
                  />
                </div>
              </div>
              <ChevronRight
                size={14}
                className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                style={{ color: 'var(--text-muted)' }}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* ── CHANGELOG ─────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--text-muted)' }}>
          Änderungen
        </p>
        <div className="space-y-2 stagger">
          {CHANGELOG.map((entry) => (
            <div
              key={entry.version}
              className="rounded-xl px-5 py-4"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <GitCommit size={12} style={{ color: 'var(--accent)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {entry.version}
                  </span>
                </div>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {entry.date}
                </span>
              </div>
              <ul className="space-y-1">
                {entry.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="mt-[5px] w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--text-muted)' }} />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

const CHANGELOG: { version: string; date: string; changes: string[] }[] = [
  {
    version: 'v1.5',
    date: '09.04.2026',
    changes: [
      'Geschichte-Sektion: gesamter Prüfungsstoff direkt auf einer Seite',
      'Geschichte heute für alle gratis zugänglich (ab 10. April Premium)',
      'Video "Wurzeln eines Konflikts" eingebettet',
      'Admin: Premium/Gratis-Filter im Benutzer-Tab',
      'Premium-Seite: WR-Inhalte & Semester-Hinweis ergänzt',
    ],
  },
  {
    version: 'v1.4',
    date: '09.04.2026',
    changes: [
      'QSP: Analyse der Bilanz & Erfolgsrechnung und Kostenrechnung hinzugefügt',
      'Changelog-Sektion auf dem Dashboard',
    ],
  },
  {
    version: 'v1.3',
    date: '29.03.2026',
    changes: [
      'Neues Design: Swiss Utility Dark — einheitliches Akzentsystem',
      'KI-Assistent: Vollbild-Viewport auf Mobile',
      'Dashboard & Header komplett überarbeitet',
    ],
  },
  {
    version: 'v1.2',
    date: '15.03.2026',
    changes: [
      'FRW Band 2 Kapitel 2–6 Zusammenfassungen aktualisiert',
      'Lernübersicht: Fortschrittsanzeige verbessert',
    ],
  },
  {
    version: 'v1.1',
    date: '01.03.2026',
    changes: [
      'FRW-Bereich gesperrt für Überarbeitung (hep-Lehrmittel Band 1–3)',
      'QSP-Filter auf Themenübersicht eingeführt',
      'Admin-Dashboard mit Live-Log',
    ],
  },
]
