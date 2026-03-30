export function MarketingVisual() {
  const ps = [
    {
      letter: 'P1', name: 'Product', de: 'Produkt',
      color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.2)',
      items: ['Produktgestaltung & Design', 'Qualität & Funktionen', 'Marke & Verpackung', 'Sortimentsbreite', 'Serviceleistungen'],
    },
    {
      letter: 'P2', name: 'Price', de: 'Preis',
      color: '#34d399', bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.2)',
      items: ['Preisgestaltung', 'Rabatte & Skonti', 'Zahlungskonditionen', 'Finanzierungsangebote', 'Preisstrategie'],
    },
    {
      letter: 'P3', name: 'Place', de: 'Distribution',
      color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.2)',
      items: ['Vertriebsweg (direkt/indirekt)', 'Standortwahl', 'Logistik & Transport', 'Lagerhaltung', 'Online- vs. Offline-Kanal'],
    },
    {
      letter: 'P4', name: 'Promotion', de: 'Kommunikation',
      color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)',
      items: ['Werbung (Inserate, TV, Online)', 'Public Relations', 'Verkaufsförderung', 'Sponsoring', 'Direktmarketing'],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Central visual */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Marketing-Mix (4P)
        </h3>

        {/* SVG 4P diagram */}
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
          <svg viewBox="0 0 480 200" className="w-full">
            {/* Center circle */}
            <circle cx="240" cy="100" r="36" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
            <text x="240" y="96" textAnchor="middle" fontSize="11" fill="#a5b4fc" fontFamily="system-ui" fontWeight="600">Marketing-</text>
            <text x="240" y="110" textAnchor="middle" fontSize="11" fill="#a5b4fc" fontFamily="system-ui" fontWeight="600">Mix</text>

            {/* P1 - Product (top-left) */}
            <circle cx="100" cy="55" r="42" fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.25)" strokeWidth="1.5" />
            <text x="100" y="50" textAnchor="middle" fontSize="16" fill="#60a5fa" fontFamily="system-ui" fontWeight="700">P</text>
            <text x="100" y="65" textAnchor="middle" fontSize="10" fill="#60a5fa" fontFamily="system-ui">Product</text>
            <line x1="136" y1="70" x2="205" y2="80" stroke="rgba(96,165,250,0.2)" strokeWidth="1" strokeDasharray="3,3" />

            {/* P2 - Price (top-right) */}
            <circle cx="380" cy="55" r="42" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.25)" strokeWidth="1.5" />
            <text x="380" y="50" textAnchor="middle" fontSize="16" fill="#34d399" fontFamily="system-ui" fontWeight="700">P</text>
            <text x="380" y="65" textAnchor="middle" fontSize="10" fill="#34d399" fontFamily="system-ui">Price</text>
            <line x1="344" y1="70" x2="275" y2="80" stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="3,3" />

            {/* P3 - Place (bottom-left) */}
            <circle cx="100" cy="148" r="42" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.25)" strokeWidth="1.5" />
            <text x="100" y="143" textAnchor="middle" fontSize="16" fill="#a78bfa" fontFamily="system-ui" fontWeight="700">P</text>
            <text x="100" y="158" textAnchor="middle" fontSize="10" fill="#a78bfa" fontFamily="system-ui">Place</text>
            <line x1="136" y1="133" x2="205" y2="120" stroke="rgba(167,139,250,0.2)" strokeWidth="1" strokeDasharray="3,3" />

            {/* P4 - Promotion (bottom-right) */}
            <circle cx="380" cy="148" r="42" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.25)" strokeWidth="1.5" />
            <text x="380" y="143" textAnchor="middle" fontSize="16" fill="#fbbf24" fontFamily="system-ui" fontWeight="700">P</text>
            <text x="380" y="158" textAnchor="middle" fontSize="10" fill="#fbbf24" fontFamily="system-ui">Promotion</text>
            <line x1="344" y1="133" x2="275" y2="120" stroke="rgba(251,191,36,0.2)" strokeWidth="1" strokeDasharray="3,3" />
          </svg>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-3">
          {ps.map(p => (
            <div key={p.name} className="p-4 rounded-xl" style={{ background: p.bg, border: `1px solid ${p.border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ background: p.border, color: p.color }}>
                  P
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.de}</div>
                </div>
              </div>
              <ul className="space-y-1">
                {p.items.map(item => (
                  <li key={item} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: p.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* BCG-Matrix */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          BCG-Portfolio-Analyse
        </h3>

        {/* Matrix grid */}
        <div className="rounded-xl overflow-hidden mb-3" style={{ border: '1px solid var(--border-color)' }}>
          {/* Y-axis label + grid */}
          <div className="flex">
            {/* Y-axis */}
            <div className="flex flex-col items-center justify-center w-6 shrink-0 py-2" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-[9px] font-medium tracking-widest" style={{ color: 'var(--text-muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                Marktwachstum ↑
              </span>
            </div>

            {/* 2×2 grid */}
            <div className="flex-1">
              {/* Top row */}
              <div className="grid grid-cols-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                {/* Stars — hoch/hoch */}
                <div className="p-4 relative" style={{ background: 'rgba(52,211,153,0.07)', borderRight: '1px solid var(--border-color)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-base mb-0.5">⭐</div>
                      <div className="text-xs font-bold" style={{ color: '#34d399' }}>Stars</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Marktanteil</div>
                      <div className="text-[10px] font-semibold" style={{ color: '#34d399' }}>HOCH</div>
                    </div>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Hoher Anteil, hohes Wachstum. Brauchen Investitionen, aber erzeugen Gewinne.
                  </p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {['Marktführer', 'Investieren'].map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Question Marks — tief/hoch */}
                <div className="p-4 relative" style={{ background: 'rgba(251,191,36,0.07)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-base mb-0.5">❓</div>
                      <div className="text-xs font-bold" style={{ color: '#fbbf24' }}>Question Marks</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Marktanteil</div>
                      <div className="text-[10px] font-semibold" style={{ color: '#fbbf24' }}>TIEF</div>
                    </div>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Niedriger Anteil, hohes Wachstum. Ungewiss — entweder fördern oder abstoßen.
                  </p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {['Risiko', 'Entscheiden'].map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-2">
                {/* Cash Cows — hoch/tief */}
                <div className="p-4 relative" style={{ background: 'rgba(96,165,250,0.07)', borderRight: '1px solid var(--border-color)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-base mb-0.5">🐄</div>
                      <div className="text-xs font-bold" style={{ color: '#60a5fa' }}>Cash Cows</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Marktanteil</div>
                      <div className="text-[10px] font-semibold" style={{ color: '#60a5fa' }}>HOCH</div>
                    </div>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Hoher Anteil, geringes Wachstum. Stabile Geldquelle — finanziert andere Produkte.
                  </p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {['Gewinne', 'Melken'].map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Dogs — tief/tief */}
                <div className="p-4 relative" style={{ background: 'rgba(248,113,113,0.07)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-base mb-0.5">🐕</div>
                      <div className="text-xs font-bold" style={{ color: '#f87171' }}>Dogs</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Marktanteil</div>
                      <div className="text-[10px] font-semibold" style={{ color: '#f87171' }}>TIEF</div>
                    </div>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Niedriger Anteil, geringes Wachstum. Wenig Zukunft — meist abstoßen.
                  </p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {['Verlustbringer', 'Desinvestieren'].map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* X-axis label */}
          <div className="flex items-center justify-center py-2 text-[9px] font-medium tracking-widest" style={{ background: 'rgba(255,255,255,0.01)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
            ← Relativer Marktanteil (hoch links, tief rechts)
          </div>
        </div>

        {/* Strategie-Hinweis */}
        <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', color: 'var(--text-muted)' }}>
          <span className="font-semibold text-indigo-300">Ziel der BCG-Analyse:</span> Das Portfolio ausgewogen halten — Cash Cows finanzieren Stars und vielversprechende Question Marks.
        </div>
      </div>

      {/* Marktforschung */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Primär- vs. Sekundärforschung
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: 'Primärforschung', color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.2)',
              items: ['Eigene Datenerhebung', 'Befragung, Beobachtung', 'Experiment', 'Teuer, aber zielgenau'],
            },
            {
              label: 'Sekundärforschung', color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.2)',
              items: ['Auswertung vorhandener Daten', 'Statistiken, Berichte', 'Schneller & günstiger', 'Ggf. veraltet'],
            },
          ].map(({ label, color, bg, border, items }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="text-xs font-semibold mb-2" style={{ color }}>{label}</div>
              <ul className="space-y-1">
                {items.map(i => (
                  <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                    {i}
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
