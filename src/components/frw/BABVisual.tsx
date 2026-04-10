'use client'
import { useState } from 'react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const KOSTENSTELLEN = ['Allgemein', 'Einkauf', 'Fertigung', 'Verwaltung', 'Verkauf']

const KS_COLOR  = ['#94a3b8', '#60a5fa', '#34d399', '#a78bfa', '#fbbf24']
const KS_BG_HI  = ['rgba(148,163,184,0.14)', 'rgba(96,165,250,0.14)', 'rgba(52,211,153,0.14)', 'rgba(167,139,250,0.14)', 'rgba(251,191,36,0.14)']
const KS_BG_LO  = ['rgba(148,163,184,0.06)', 'rgba(96,165,250,0.06)', 'rgba(52,211,153,0.06)', 'rgba(167,139,250,0.06)', 'rgba(251,191,36,0.06)']
const KS_BORDER = ['rgba(148,163,184,0.25)', 'rgba(96,165,250,0.25)', 'rgba(52,211,153,0.25)', 'rgba(167,139,250,0.25)', 'rgba(251,191,36,0.25)']

const KOSTENARTEN = [
  { label: 'Materialkosten', values: [     0,  2_000,  8_000,  1_000,  1_000], color: '#60a5fa', hint: 'Roh-, Hilfs- & Betriebsstoffe' },
  { label: 'Personalkosten', values: [ 8_000, 10_000, 30_000,  8_000,  6_000], color: '#34d399', hint: 'Löhne, Gehälter, Sozialleistungen' },
  { label: 'Abschreibungen', values: [ 2_000,  1_000, 13_000,  1_000,  1_000], color: '#a78bfa', hint: 'Maschinen, Fahrzeuge, Einrichtung' },
  { label: 'Übrige Kosten',  values: [ 2_000,  1_000,  3_000,  1_000,  1_000], color: '#fbbf24', hint: 'Miete, Energie, Versicherungen' },
]

// Summe pro Kostenstelle vor Umlage: [12'000, 14'000, 54'000, 11'000, 9'000]
const SUMME_VOR  = [12_000, 14_000, 54_000, 11_000,  9_000]
// Allgemein (12'000) wird nach Schlüssel umgelegt
const UMLAGE     = [-12_000,  2_000,  6_000,  2_500,  1_500]
// Summe nach Umlage: [0, 16'000, 60'000, 13'500, 10'500] → total 100'000
const SUMME_NACH = [      0, 16_000, 60_000, 13_500, 10_500]

const GRUNDLAGEN     = [0, 40_000, 200_000, 100_000, 100_000]
const GRUNDL_LABEL   = ['–', 'MEK', 'FEK', 'HK', 'HK']
const GRUNDL_FULL    = ['–', "MEK 40'000", "FEK 200'000", "HK 100'000", "HK 100'000"]
// ZS: [–, 40%, 30%, 13.5%, 10.5%]
const ZS             = [0, 40, 30, 13.5, 10.5]

const ZS_ERKLAERUNG = [
  '',
  "Pro Franken MEK fallen CHF 0.40 Materialgemeinkosten an (MGK-Satz = 40 %).",
  "Pro Franken FEK fallen CHF 0.30 Fertigungsgemeinkosten an (FGK-Satz = 30 %).",
  "Pro Franken Herstellkosten fallen CHF 0.135 Verwaltungsgemeinkosten an (VwGK-Satz = 13.5 %).",
  "Pro Franken Herstellkosten fallen CHF 0.105 Vertriebsgemeinkosten an (VtGK-Satz = 10.5 %).",
]

// ─── Formatierung ─────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n === 0) return '–'
  const abs = Math.abs(n)
  const str = abs.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
  return n < 0 ? `−${str}` : str
}
function fmtU(n: number): string {
  if (n === 0) return '–'
  const abs = Math.abs(n)
  const str = abs.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
  return n > 0 ? `+${str}` : `−${str}`
}

// ─── Schritt-Farben ───────────────────────────────────────────────────────────

const STEP_STYLE = [
  { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.28)'  },
  { color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.28)' },
  { color: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.28)'  },
]

const STEP_LABELS   = ['Kosten verteilen', 'Umlage', 'Zuschlagssatz']
const STEP_ICONS    = ['📊', '↕️', '🧮']
const STEP_DESC = [
  'Jede Kostenart wird direkt den Kostenstellen zugeordnet, wo sie anfallen. Fahre mit der Maus über eine Zeile, um die Verteilung zu sehen.',
  'Die Allgemeinstelle (z.B. Geschäftsleitung) erbringt Leistungen für alle anderen Stellen. Ihre Kosten werden nach einem Schlüssel auf Einkauf, Fertigung, Verwaltung und Verkauf umgelegt.',
  'Der Zuschlagssatz (ZS) zeigt, wie viel Gemeinkosten pro Einheit Zuschlagsgrundlage anfallen. Klicke eine Kostenstelle an, um die Formel zu sehen.',
]

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export function BABVisual() {
  const [step,   setStep]   = useState(0)
  const [selCol, setSelCol] = useState<number | null>(null)
  const [hovRow, setHovRow] = useState<number | null>(null)

  const showUmlage = step >= 1
  const showZS     = step >= 2

  function goStep(s: number) { setStep(s); setSelCol(null) }

  const tdBase: React.CSSProperties = {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    transition: 'background 0.15s, color 0.15s',
  }
  const tdLeft: React.CSSProperties = { ...tdBase, borderLeft: '1px solid var(--border-color)' }

  function cellBg(ci: number, extra?: React.CSSProperties): React.CSSProperties {
    if (selCol === ci) return { ...tdLeft, background: KS_BG_HI[ci], ...extra }
    if (ci === 0 && showUmlage) return { ...tdLeft, background: 'rgba(248,113,113,0.05)', ...extra }
    return { ...tdLeft, ...extra }
  }

  return (
    <div className="space-y-5">

      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
        <span className="text-xl leading-none mt-0.5">📋</span>
        <div>
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            Was ist der BAB?
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Der <strong style={{ color: 'var(--text-secondary)' }}>Betriebsabrechnungsbogen</strong> verteilt die Gemeinkosten auf die Kostenstellen und berechnet daraus die Zuschlagssätze — Grundlage für die Kalkulation.
          </p>
        </div>
      </div>

      {/* ── Schritte ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {STEP_LABELS.map((label, i) => {
          const s = STEP_STYLE[i]
          const active = step === i
          return (
            <button
              key={i}
              onClick={() => goStep(i)}
              className="py-2.5 px-2 rounded-xl text-xs font-semibold transition-all text-center"
              style={{
                background: active ? s.bg : 'rgba(255,255,255,0.02)',
                border: `1px solid ${active ? s.border : 'var(--border-color)'}`,
                color: active ? s.color : 'var(--text-muted)',
              }}
            >
              <span className="block text-[10px] font-bold mb-0.5 opacity-50">Schritt {i + 1}</span>
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Schritt-Beschreibung ──────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-3 rounded-xl"
        style={{ background: STEP_STYLE[step].bg, border: `1px solid ${STEP_STYLE[step].border}` }}>
        <span className="text-base leading-none mt-0.5">{STEP_ICONS[step]}</span>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {STEP_DESC[step]}
        </p>
      </div>

      {/* ── BAB-Tabelle ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
        <table className="w-full text-xs border-collapse" style={{ minWidth: '580px' }}>

          {/* Kopfzeile */}
          <thead>
            <tr>
              <th className="text-left px-3 py-2.5 font-semibold"
                style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', minWidth: '130px' }}>
                Kostenart
              </th>
              <th className="text-right px-3 py-2.5 font-semibold"
                style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', minWidth: '72px' }}>
                Gesamt
              </th>
              {KOSTENSTELLEN.map((ks, ci) => (
                <th
                  key={ci}
                  onClick={() => showZS && ci > 0 && setSelCol(selCol === ci ? null : ci)}
                  className="text-right px-3 py-2.5 font-semibold transition-all"
                  style={{
                    color: KS_COLOR[ci],
                    background: selCol === ci ? KS_BG_HI[ci] : (ci === 0 && showUmlage ? 'rgba(248,113,113,0.07)' : 'rgba(255,255,255,0.03)'),
                    borderBottom: `1px solid ${selCol === ci ? KS_BORDER[ci] : 'var(--border-color)'}`,
                    borderLeft: '1px solid var(--border-color)',
                    cursor: showZS && ci > 0 ? 'pointer' : 'default',
                    minWidth: '72px',
                  }}
                >
                  <span className="block">{ks}</span>
                  {showZS && ci > 0 && (
                    <span className="block text-[9px] font-normal opacity-40 mt-0.5">↓ anklicken</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>

            {/* Kostenarten-Zeilen */}
            {KOSTENARTEN.map((ka, ri) => {
              const gesamt = ka.values.reduce((s, v) => s + v, 0)
              return (
                <tr key={ri}
                  onMouseEnter={() => setHovRow(ri)}
                  onMouseLeave={() => setHovRow(null)}>
                  <td className="px-3 py-2.5" style={{ ...tdBase, color: 'var(--text-secondary)' }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 mb-0.5 shrink-0" style={{ background: ka.color }} />
                    {ka.label}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold"
                    style={{ ...tdBase, color: 'var(--text-primary)' }}>
                    {fmt(gesamt)}
                  </td>
                  {ka.values.map((v, ci) => (
                    <td key={ci} className="px-3 py-2.5 text-right font-mono"
                      style={{
                        ...tdLeft,
                        color: hovRow === ri && v > 0 ? KS_COLOR[ci] : (v === 0 ? 'rgba(255,255,255,0.18)' : 'var(--text-secondary)'),
                        background: hovRow === ri
                          ? KS_BG_LO[ci]
                          : (selCol === ci ? KS_BG_HI[ci] : (ci === 0 && showUmlage ? 'rgba(248,113,113,0.04)' : 'transparent')),
                        fontWeight: hovRow === ri && v > 0 ? 600 : 400,
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}>
                      {fmt(v)}
                    </td>
                  ))}
                </tr>
              )
            })}

            {/* Trennlinie */}
            <tr>
              <td colSpan={7} style={{ padding: 0, borderBottom: '2px solid rgba(255,255,255,0.1)' }} />
            </tr>

            {/* Summe vor Umlage */}
            <tr>
              <td className="px-3 py-2.5 font-semibold"
                style={{ ...tdBase, color: 'var(--text-primary)' }}>
                {showUmlage ? 'Summe GK (vor Umlage)' : 'Summe Gemeinkosten'}
              </td>
              <td className="px-3 py-2.5 text-right font-mono font-bold"
                style={{ ...tdBase, color: 'var(--text-primary)' }}>
                100'000
              </td>
              {SUMME_VOR.map((v, ci) => (
                <td key={ci} className="px-3 py-2.5 text-right font-mono font-semibold"
                  style={{
                    ...tdLeft,
                    color: KS_COLOR[ci],
                    background: selCol === ci ? KS_BG_HI[ci] : (ci === 0 && showUmlage ? 'rgba(248,113,113,0.06)' : 'rgba(255,255,255,0.02)'),
                    borderBottom: showUmlage ? '1px solid rgba(255,255,255,0.05)' : undefined,
                  }}>
                  {fmt(v)}
                </td>
              ))}
            </tr>

            {/* Umlage-Zeile */}
            {showUmlage && (
              <tr>
                <td className="px-3 py-2.5 italic"
                  style={{ ...tdBase, color: '#f87171' }}>
                  ↕ Umlage Allgemein
                </td>
                <td className="px-3 py-2.5 text-right font-mono"
                  style={{ ...tdBase, color: 'var(--text-muted)' }}>
                  –
                </td>
                {UMLAGE.map((v, ci) => (
                  <td key={ci} className="px-3 py-2.5 text-right font-mono font-semibold"
                    style={{
                      ...tdLeft,
                      color: v < 0 ? '#f87171' : (v > 0 ? '#34d399' : 'var(--text-muted)'),
                      background: ci === 0
                        ? 'rgba(248,113,113,0.10)'
                        : (v > 0 ? 'rgba(52,211,153,0.04)' : 'transparent'),
                    }}>
                    {fmtU(v)}
                  </td>
                ))}
              </tr>
            )}

            {/* Summe nach Umlage */}
            {showUmlage && (
              <tr>
                <td className="px-3 py-3 font-bold"
                  style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.025)' }}>
                  Summe GK (nach Umlage)
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold"
                  style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.025)' }}>
                  100'000
                </td>
                {SUMME_NACH.map((v, ci) => (
                  <td key={ci} className="px-3 py-3 text-right font-mono font-bold"
                    style={{
                      ...tdLeft,
                      color: ci === 0 ? 'var(--text-muted)' : KS_COLOR[ci],
                      background: selCol === ci ? KS_BG_HI[ci] : 'rgba(255,255,255,0.025)',
                    }}>
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            )}

            {/* Zuschlagssatz-Zeilen */}
            {showZS && (
              <>
                <tr>
                  <td colSpan={7} style={{ padding: 0, borderBottom: '2px solid rgba(255,255,255,0.08)' }} />
                </tr>

                {/* Zuschlagsgrundlage */}
                <tr>
                  <td className="px-3 py-2.5 italic"
                    style={{ ...tdBase, color: 'var(--text-muted)' }}>
                    Zuschlagsgrundlage
                  </td>
                  <td className="px-3 py-2.5 text-right"
                    style={{ ...tdBase, color: 'var(--text-muted)' }}>
                    –
                  </td>
                  {GRUNDLAGEN.map((v, ci) => (
                    <td key={ci}
                      onClick={() => ci > 0 && setSelCol(selCol === ci ? null : ci)}
                      className="px-3 py-2.5 text-right font-mono leading-snug"
                      style={{
                        ...tdLeft,
                        color: selCol === ci ? KS_COLOR[ci] : 'var(--text-muted)',
                        background: selCol === ci ? KS_BG_HI[ci] : 'transparent',
                        cursor: ci > 0 ? 'pointer' : 'default',
                        fontSize: '10px',
                      }}>
                      {ci === 0 ? '–' : (
                        <>
                          <span className="block font-semibold">{GRUNDL_LABEL[ci]}</span>
                          <span className="block opacity-60">{fmt(v)}</span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Zuschlagssatz */}
                <tr>
                  <td className="px-3 py-3 font-bold"
                    style={{ color: 'var(--text-primary)', background: 'rgba(52,211,153,0.04)' }}>
                    Zuschlagssatz (ZS)
                  </td>
                  <td className="px-3 py-3 text-right"
                    style={{ color: 'var(--text-muted)', background: 'rgba(52,211,153,0.04)' }}>
                    –
                  </td>
                  {ZS.map((v, ci) => (
                    <td key={ci}
                      onClick={() => ci > 0 && setSelCol(selCol === ci ? null : ci)}
                      className="px-3 py-3 text-right font-mono font-bold transition-all"
                      style={{
                        ...tdLeft,
                        color: ci === 0 ? 'var(--text-muted)' : (selCol === ci ? KS_COLOR[ci] : '#34d399'),
                        background: selCol === ci ? KS_BG_HI[ci] : 'rgba(52,211,153,0.04)',
                        cursor: ci > 0 ? 'pointer' : 'default',
                        fontSize: ci > 0 ? '13px' : undefined,
                      }}>
                      {ci === 0 ? '–' : `${v.toFixed(1)} %`}
                    </td>
                  ))}
                </tr>
              </>
            )}

          </tbody>
        </table>
      </div>

      {/* ── Umlage-Schlüssel-Panel (Schritt 2) ───────────────────────── */}
      {step === 1 && (
        <div className="p-4 rounded-xl space-y-3"
          style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.22)' }}>
          <p className="text-xs font-semibold text-red-300">
            Umlage-Schlüssel — Allgemein (CHF 12'000) wird verteilt auf:
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(ci => (
              <div key={ci} className="text-center p-2.5 rounded-xl"
                style={{ background: KS_BG_LO[ci], border: `1px solid ${KS_BORDER[ci]}` }}>
                <div className="text-[10px] font-semibold mb-1" style={{ color: KS_COLOR[ci] }}>
                  {KOSTENSTELLEN[ci]}
                </div>
                <div className="font-mono font-bold text-sm" style={{ color: '#34d399' }}>
                  +{UMLAGE[ci].toLocaleString('de-CH')}
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {Math.round(UMLAGE[ci] / 12_000 * 100)} %
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Schlüssel z.B. nach Mitarbeiterzahl, Nutzfläche oder Inanspruchnahme. Die Summe der Umlage muss immer gleich der Allgemein-Summe sein (hier CHF 12'000).
          </p>
        </div>
      )}

      {/* ── ZS-Kacheln (Schritt 3, nichts ausgewählt) ────────────────── */}
      {showZS && selCol === null && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(ci => (
            <button key={ci} onClick={() => setSelCol(ci)}
              className="p-3 rounded-xl text-left transition-all hover:brightness-125"
              style={{ background: KS_BG_LO[ci], border: `1px solid ${KS_BORDER[ci]}` }}>
              <div className="text-[10px] font-semibold mb-1" style={{ color: KS_COLOR[ci] }}>
                {KOSTENSTELLEN[ci]}
              </div>
              <div className="font-mono font-bold text-sm" style={{ color: KS_COLOR[ci] }}>
                {ZS[ci].toFixed(1)} %
              </div>
              <div className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {['MGK-Satz', 'FGK-Satz', 'VwGK-Satz', 'VtGK-Satz'][ci - 1]}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── ZS-Formel-Panel (Schritt 3, Kostenstelle ausgewählt) ─────── */}
      {showZS && selCol !== null && selCol > 0 && (
        <div className="p-4 rounded-xl space-y-3 transition-all"
          style={{ background: KS_BG_HI[selCol], border: `1px solid ${KS_BORDER[selCol]}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: KS_COLOR[selCol] }} />
              <span className="text-xs font-bold" style={{ color: KS_COLOR[selCol] }}>
                {KOSTENSTELLEN[selCol]} — Zuschlagssatz
              </span>
            </div>
            <button onClick={() => setSelCol(null)}
              className="text-[10px] px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
              ✕
            </button>
          </div>

          {/* Formel-Kacheln */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Gemeinkosten (GK)
              </div>
              <div className="font-mono font-bold text-sm" style={{ color: KS_COLOR[selCol] }}>
                CHF {SUMME_NACH[selCol].toLocaleString('de-CH')}
              </div>
            </div>
            <div className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Grundlage ({GRUNDL_LABEL[selCol]})
              </div>
              <div className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                CHF {GRUNDLAGEN[selCol].toLocaleString('de-CH')}
              </div>
            </div>
            <div className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${KS_BORDER[selCol]}` }}>
              <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Zuschlagssatz
              </div>
              <div className="font-mono font-bold text-lg" style={{ color: KS_COLOR[selCol] }}>
                {ZS[selCol].toFixed(1)} %
              </div>
            </div>
          </div>

          {/* Formel-Zeile */}
          <div className="py-2.5 px-4 rounded-xl text-center font-mono text-sm"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
            {SUMME_NACH[selCol].toLocaleString('de-CH')} ÷ {GRUNDLAGEN[selCol].toLocaleString('de-CH')} × 100
            {' = '}
            <strong style={{ color: KS_COLOR[selCol] }}>{ZS[selCol].toFixed(1)} %</strong>
          </div>

          {/* Grundlagen-Info */}
          <div className="flex items-start gap-2 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs mt-0.5">💡</span>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                Grundlage: {GRUNDL_FULL[selCol]}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {ZS_ERKLAERUNG[selCol]}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
