'use client'
import { useState } from 'react'

// ─── AD-AS interactive diagram ────────────────────────────────────────────────

const AS_X1 = 80, AS_Y1 = 220, AS_X2 = 370, AS_Y2 = 45
const AD_X1 = 80, AD_Y1 = 45, AD_X2 = 370, AD_Y2 = 220

const asSlope = (AS_Y2 - AS_Y1) / (AS_X2 - AS_X1) // negative in SVG = upward
const adSlope = (AD_Y2 - AD_Y1) / (AD_X2 - AD_X1) // positive in SVG = downward

function getEquilibrium(shift: number) {
  // y_AS(x) = AS_Y1 + asSlope*(x - AS_X1)
  // y_AD(x) = AD_Y1 + adSlope*(x - AD_X1 - shift)
  // solve: AS_Y1 + asSlope*(x-AS_X1) = AD_Y1 + adSlope*(x-AD_X1-shift)
  const x = (AD_Y1 - AS_Y1 - adSlope * (AD_X1 + shift) + asSlope * AS_X1) / (asSlope - adSlope)
  const y = AS_Y1 + asSlope * (x - AS_X1)
  return { x, y }
}

function getPhase(shift: number) {
  if (shift < -60) return { label: 'Rezession', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', desc: 'AD sinkt stark → BIP fällt, Preise sinken, Arbeitslosigkeit steigt.' }
  if (shift < -20) return { label: 'Abschwung', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', desc: 'AD sinkt → BIP-Wachstum verlangsamt sich, erste Entlassungen.' }
  if (shift < 20)  return { label: 'Gleichgewicht', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)', desc: 'AD = Potenzialoutput → Vollbeschäftigung, stabile Preise.' }
  if (shift < 60)  return { label: 'Aufschwung', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)', desc: 'AD steigt → BIP wächst, Beschäftigung steigt, leichte Inflation.' }
  return { label: 'Überhitzung', color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.25)', desc: 'AD sehr hoch → Kapazitätsgrenzen erreicht, Inflation steigt stark.' }
}

function AdAsChart({ shift }: { shift: number }) {
  const { x: ex, y: ey } = getEquilibrium(shift)
  const phase = getPhase(shift)

  const adX1 = AD_X1 + shift
  const adX2 = AD_X2 + shift

  // clamp AD endpoints for display
  const adStartX = Math.max(40, adX1)
  const adStartY = AD_Y1 + adSlope * (adStartX - adX1)
  const adEndX = Math.min(430, adX2)
  const adEndY = AD_Y1 + adSlope * (adEndX - adX1)

  // BIP label (relative position)
  const bipPct = Math.round(((ex - 80) / (370 - 80)) * 100)

  return (
    <svg viewBox="0 0 450 270" className="w-full">
      {/* Axes */}
      <line x1="50" y1="230" x2="430" y2="230" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <line x1="50" y1="230" x2="50" y2="20" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <text x="425" y="244" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui" textAnchor="end">BIP (Y) →</text>
      <text x="12" y="130" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui" textAnchor="middle" transform="rotate(-90,12,130)">Preisniveau (P) →</text>

      {/* Potential output line */}
      <line x1={getEquilibrium(0).x} y1="25" x2={getEquilibrium(0).x} y2="228" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeDasharray="4,4" />
      <text x={getEquilibrium(0).x + 4} y="35" fontSize="8" fill="rgba(255,255,255,0.25)" fontFamily="system-ui">Y*</text>

      {/* AS curve (fixed, upward) */}
      <line x1={AS_X1} y1={AS_Y1} x2={AS_X2} y2={AS_Y2} stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
      <text x={AS_X2 + 4} y={AS_Y2 + 4} fontSize="10" fill="#34d399" fontFamily="system-ui" fontWeight="bold">AS</text>

      {/* AD curve (movable, downward) */}
      <line x1={adStartX} y1={adStartY} x2={adEndX} y2={adEndY} stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
      <text
        x={Math.min(adEndX + 4, 435)}
        y={Math.max(adEndY - 4, 15)}
        fontSize="10" fill="#60a5fa" fontFamily="system-ui" fontWeight="bold"
      >AD</text>

      {/* Equilibrium dotted lines */}
      {ex > 55 && ex < 425 && ey > 25 && ey < 228 && (
        <>
          <line x1={ex} y1={ey} x2={ex} y2="230" stroke={phase.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
          <line x1="50" y1={ey} x2={ex} y2={ey} stroke={phase.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
          {/* Equilibrium dot */}
          <circle cx={ex} cy={ey} r="5" fill={phase.color} opacity="0.9" />
          <circle cx={ex} cy={ey} r="9" fill={phase.color} opacity="0.15" />
        </>
      )}

      {/* BIP indicator on x-axis */}
      {ex > 55 && ex < 425 && (
        <text x={ex} y="244" fontSize="8.5" fill={phase.color} fontFamily="system-ui" textAnchor="middle" fontWeight="600">
          Y={bipPct}%
        </text>
      )}
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function KonjunkturVisual() {
  const [adShift, setAdShift] = useState(0)

  const startX = 60
  const width = 560
  const steps = 160
  const trendY0 = 155
  const trendY1 = 115
  const amplitude = 48

  const wavePath = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const x = startX + t * width
    const trend = trendY0 + (trendY1 - trendY0) * t
    const y = trend + amplitude * Math.cos(2 * Math.PI * t)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  const trendPath = `M${startX},${trendY0} L${startX + width},${trendY1}`
  const px = (t: number) => (startX + t * width).toFixed(1)
  const cx = (t1: number, t2: number) => ((startX + t1 * width + startX + t2 * width) / 2).toFixed(1)

  const phases = [
    { from: 0, to: 0.25, label: 'Aufschwung', color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.18)' },
    { from: 0.25, to: 0.5, label: 'Hoch-konjunktur', color: '#34d399', bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.18)' },
    { from: 0.5, to: 0.75, label: 'Abschwung', color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.18)' },
    { from: 0.75, to: 1.0, label: 'Rezession', color: '#f87171', bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.18)' },
  ]

  const phase = getPhase(adShift)

  return (
    <div className="space-y-6">
      {/* Konjunkturzyklus */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Konjunkturzyklus
        </h3>
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
          <svg viewBox="0 0 680 265" className="w-full">
            {phases.map((p, i) => (
              <rect key={i} x={px(p.from)} y="22"
                width={(parseFloat(px(p.to)) - parseFloat(px(p.from))).toFixed(1)}
                height="200" fill={p.bg} stroke={p.border} strokeWidth="0.5" />
            ))}
            <path d={trendPath} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="5,4" fill="none" />
            <text x="630" y={trendY1 - 6} fontSize="8.5" fill="rgba(255,255,255,0.35)" fontFamily="system-ui">Potential-</text>
            <text x="630" y={trendY1 + 5} fontSize="8.5" fill="rgba(255,255,255,0.35)" fontFamily="system-ui">wachstum</text>
            <path d={wavePath} stroke="#60a5fa" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {phases.map((p, i) => {
              const parts = p.label.split('-')
              const midX = cx(p.from, p.to)
              return parts.length === 1 ? (
                <text key={i} x={midX} y="245" textAnchor="middle" fontSize="10" fill={p.color} fontFamily="system-ui" fontWeight="500">{p.label}</text>
              ) : (
                <g key={i}>
                  <text x={midX} y="238" textAnchor="middle" fontSize="10" fill={p.color} fontFamily="system-ui" fontWeight="500">{parts[0]}</text>
                  <text x={midX} y="251" textAnchor="middle" fontSize="10" fill={p.color} fontFamily="system-ui" fontWeight="500">{parts[1]}</text>
                </g>
              )
            })}
            <line x1={startX} y1="222" x2={startX + width} y2="222" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x="16" y="122" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui" transform="rotate(-90, 16, 122)">BIP-Wachstum</text>
            <text x="350" y="262" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">Zeit →</text>
          </svg>
        </div>
      </div>

      {/* Interactive AD-AS */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          AD-AS Modell — Interaktiv
        </h3>

        {/* Phase badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl mb-3 transition-all duration-300" style={{ background: phase.bg, border: `1px solid ${phase.border}` }}>
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: phase.color }} />
          <div>
            <span className="text-sm font-semibold" style={{ color: phase.color }}>{phase.label}</span>
            <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{phase.desc}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
          <AdAsChart shift={adShift} />
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: '#f87171' }}>← Rezession</span>
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>AD-Kurve verschieben</span>
            <span style={{ color: '#c084fc' }}>Überhitzung →</span>
          </div>
          <input
            type="range" min={-100} max={100} step={1}
            value={adShift}
            onChange={e => setAdShift(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: phase.color }}
          />
          <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>AD sinkt</span>
            <button
              onClick={() => setAdShift(0)}
              className="text-[10px] px-2 py-0.5 rounded-md transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
            >
              Zurücksetzen
            </button>
            <span>AD steigt</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 rounded" style={{ background: '#60a5fa' }} />
            <span>AD (Gesamtnachfrage)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 rounded" style={{ background: '#34d399' }} />
            <span>AS (Gesamtangebot)</span>
          </div>
        </div>
      </div>

      {/* AD Formula */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Gesamtwirtschaftliche Nachfrage (AD)
        </h3>
        <div className="p-4 rounded-xl text-center mb-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <span className="font-mono text-sm font-semibold text-indigo-300">Y = C + I + G + NX</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: 'C', label: 'Konsum', color: '#60a5fa' },
            { key: 'I', label: 'Investitionen', color: '#34d399' },
            { key: 'G', label: 'Staatsausgaben', color: '#a78bfa' },
            { key: 'NX', label: 'Nettoexporte', color: '#fbbf24' },
          ].map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
              <span className="font-mono font-bold text-sm w-7 shrink-0" style={{ color }}>{key}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Konjunkturindikatoren */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Konjunkturindikatoren
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Vorauslaufend', sub: 'Steigen/fallen vor dem BIP', ex: 'Börsenindex, Auftragseingang, Konsumentenvertrauen', color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.2)' },
            { label: 'Gleichlaufend', sub: 'Entwickeln sich mit dem BIP', ex: 'Industrieproduktion, Beschäftigung', color: '#34d399', bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.2)' },
            { label: 'Nachhinkend', sub: 'Reagieren nach dem BIP', ex: 'Arbeitslosenquote, Zinssätze', color: '#f87171', bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.2)' },
          ].map(({ label, sub, ex, color, bg, border }) => (
            <div key={label} className="p-3 rounded-xl space-y-1.5" style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="text-xs font-semibold" style={{ color }}>{label}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sub}</div>
              <div className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>{ex}</div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          ⚠ Indikatoren zeigen nur statistischen Zusammenhang — keinen kausalen Beweis.
        </p>
      </div>

      {/* Rezession definition */}
      <div className="flex items-start gap-3 p-3 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
        <span className="text-red-400 font-bold text-lg leading-none">!</span>
        <div>
          <span className="text-xs font-semibold text-red-300">Rezession:</span>
          <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>
            Mindestens 2 aufeinanderfolgende Quartale mit negativem Wachstum. Hält sie länger an → Depression.
          </span>
        </div>
      </div>
    </div>
  )
}
