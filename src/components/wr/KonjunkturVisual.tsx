export function KonjunkturVisual() {
  const startX = 60
  const width = 560
  const steps = 160
  const trendY0 = 155
  const trendY1 = 115
  const amplitude = 48

  // wave = amplitude * cos(2πt): starts at trough (Rezession), rises to peak (Hochkonjunktur)
  // Phases: Aufschwung (0→0.25), Hochkonjunktur (0.25→0.5), Abschwung (0.5→0.75), Rezession (0.75→1.0)
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

  return (
    <div className="space-y-6">
      {/* Cycle chart */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Konjunkturzyklus
        </h3>
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
          <svg viewBox="0 0 680 265" className="w-full">
            {/* Phase backgrounds */}
            {phases.map((p, i) => (
              <rect
                key={i}
                x={px(p.from)} y="22"
                width={(parseFloat(px(p.to)) - parseFloat(px(p.from))).toFixed(1)}
                height="200"
                fill={p.bg}
                stroke={p.border}
                strokeWidth="0.5"
              />
            ))}

            {/* Trend line */}
            <path d={trendPath} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="5,4" fill="none" />
            <text x="630" y={trendY1 - 6} fontSize="8.5" fill="rgba(255,255,255,0.35)" fontFamily="system-ui">Potential-</text>
            <text x="630" y={trendY1 + 5} fontSize="8.5" fill="rgba(255,255,255,0.35)" fontFamily="system-ui">wachstum</text>

            {/* Wave */}
            <path d={wavePath} stroke="#60a5fa" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Phase labels */}
            {phases.map((p, i) => {
              const parts = p.label.split('-')
              const midX = cx(p.from, p.to)
              return parts.length === 1 ? (
                <text key={i} x={midX} y="245" textAnchor="middle" fontSize="10" fill={p.color} fontFamily="system-ui" fontWeight="500">
                  {p.label}
                </text>
              ) : (
                <g key={i}>
                  <text x={midX} y="238" textAnchor="middle" fontSize="10" fill={p.color} fontFamily="system-ui" fontWeight="500">{parts[0]}</text>
                  <text x={midX} y="251" textAnchor="middle" fontSize="10" fill={p.color} fontFamily="system-ui" fontWeight="500">{parts[1]}</text>
                </g>
              )
            })}

            {/* Axis */}
            <line x1={startX} y1="222" x2={startX + width} y2="222" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

            {/* Y-axis label */}
            <text x="16" y="122" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui" transform="rotate(-90, 16, 122)">
              BIP-Wachstum
            </text>

            {/* Zeit label */}
            <text x="350" y="262" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">Zeit →</text>
          </svg>
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
