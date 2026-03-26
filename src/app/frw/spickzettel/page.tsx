import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Printer, BookMarked } from 'lucide-react'
import { FRW_BAND_LABELS } from '@/lib/utils'
import { PrintButton } from './PrintButton'

export default async function SpickzettelPage() {
  const topics = await prisma.topic.findMany({
    where: { category: 'frw', published: true },
    orderBy: [{ band: 'asc' }, { order: 'asc' }],
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          bookingEntries: { orderBy: { order: 'asc' } },
          formulas: { orderBy: { order: 'asc' } },
        },
      },
    },
  })

  const topicsWithContent = topics.filter(t =>
    t.chapters.some(c => c.bookingEntries.length > 0 || c.formulas.length > 0)
  )

  const BAND_ACCENT: Record<string, string> = {
    '1': '#3b82f6',
    '2': '#f59e0b',
    '3': '#8b5cf6',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">

      {/* Header — hidden in print */}
      <div className="no-print flex items-center justify-between">
        <Link href="/frw" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> FRW Hub
        </Link>
        <PrintButton />
      </div>

      <div className="no-print">
        <h1 className="text-2xl font-bold text-white">Spickzettel — Buchungssätze</h1>
        <p className="text-slate-500 text-sm mt-1">Alle Buchungssätze auf einen Blick. Ideal zum Wiederholen vor der Prüfung.</p>
      </div>

      {/* Print header — only visible in print */}
      <div className="print-only" style={{ display: 'none' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>FRW Spickzettel — Buchungssätze</h1>
        <p style={{ fontSize: '11px', color: '#666' }}>HMS-Lernplattform</p>
      </div>

      {topicsWithContent.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BookMarked size={40} className="text-amber-400/40 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">Noch keine Buchungssätze vorhanden</p>
          <p className="text-slate-500 text-sm mt-2">Die Buchungssätze erscheinen hier sobald sie eingetragen sind.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {topicsWithContent.map(topic => {
            const accent = BAND_ACCENT[topic.band ?? ''] ?? '#64748b'
            const allEntries = topic.chapters.flatMap(c => c.bookingEntries)
            const allFormulas = topic.chapters.flatMap(c => c.formulas)

            return (
              <div key={topic.id} className="glass rounded-2xl overflow-hidden">
                {/* Topic header */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}80, ${accent}10)` }} />
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <h2 className="font-bold text-white text-base">{topic.title}</h2>
                    {topic.band && (
                      <p className="text-xs mt-0.5" style={{ color: accent }}>{FRW_BAND_LABELS[topic.band] ?? `Band ${topic.band}`}</p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}>
                    {allEntries.length} Buchungssätze
                  </span>
                </div>

                {/* Booking entries table */}
                {allEntries.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-5/12">Situation</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-blue-400/70 uppercase tracking-wider w-2.5/12">Soll</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-emerald-400/70 uppercase tracking-wider w-2.5/12">Haben</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/12 hidden sm:table-cell">Hinweis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allEntries.map((entry, idx) => (
                          <tr
                            key={entry.id}
                            style={{ borderBottom: idx < allEntries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}
                          >
                            <td className="px-6 py-3 text-slate-300 leading-snug">{entry.situation}</td>
                            <td className="px-4 py-3 font-semibold text-blue-300 font-mono text-xs leading-snug">{entry.sollKonto}</td>
                            <td className="px-4 py-3 font-semibold text-emerald-300 font-mono text-xs leading-snug">{entry.habenKonto}</td>
                            <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell">{entry.betragHint ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Formulas */}
                {allFormulas.length > 0 && (
                  <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Formeln</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allFormulas.map(f => (
                        <div key={f.id} className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <p className="text-xs font-semibold text-amber-400 mb-1">{f.name}</p>
                          <p className="font-mono text-sm text-slate-200">{f.formel}</p>
                          {f.erklaerung && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.erklaerung}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
