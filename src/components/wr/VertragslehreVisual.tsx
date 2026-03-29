export function VertragslehreVisual() {
  return (
    <div className="space-y-6">

      {/* Vertragsschluss Flow */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Vertragsschluss
        </h3>
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
          <svg viewBox="0 0 680 130" className="w-full">
            {/* Antrag */}
            <rect x="30" y="30" width="140" height="60" rx="10" fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.3)" strokeWidth="1.5" />
            <text x="100" y="56" textAnchor="middle" fontSize="12" fill="#60a5fa" fontFamily="system-ui" fontWeight="600">Antrag</text>
            <text x="100" y="72" textAnchor="middle" fontSize="10" fill="rgba(96,165,250,0.7)" fontFamily="system-ui">(Offerte)</text>

            {/* Arrow 1 */}
            <path d="M172,60 L220,60" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" markerEnd="url(#arrow1)" />
            <text x="196" y="52" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">bindend</text>
            <defs>
              <marker id="arrow1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.2)" />
              </marker>
            </defs>

            {/* Annahme */}
            <rect x="222" y="30" width="140" height="60" rx="10" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.3)" strokeWidth="1.5" />
            <text x="292" y="56" textAnchor="middle" fontSize="12" fill="#34d399" fontFamily="system-ui" fontWeight="600">Annahme</text>
            <text x="292" y="72" textAnchor="middle" fontSize="10" fill="rgba(52,211,153,0.7)" fontFamily="system-ui">(Akzept)</text>

            {/* Arrow 2 */}
            <path d="M364,60 L412,60" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" markerEnd="url(#arrow2)" />
            <text x="388" y="52" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">übereinstimmend</text>
            <defs>
              <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.2)" />
              </marker>
            </defs>

            {/* Vertrag */}
            <rect x="414" y="20" width="240" height="80" rx="10" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.35)" strokeWidth="2" />
            <text x="534" y="52" textAnchor="middle" fontSize="13" fill="#a78bfa" fontFamily="system-ui" fontWeight="700">Vertrag</text>
            <text x="534" y="69" textAnchor="middle" fontSize="10" fill="rgba(167,139,250,0.7)" fontFamily="system-ui">gegenseitig übereinstimmende</text>
            <text x="534" y="83" textAnchor="middle" fontSize="10" fill="rgba(167,139,250,0.7)" fontFamily="system-ui">Willenserklärungen</text>
          </svg>
        </div>
      </div>

      {/* Voraussetzungen */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Voraussetzungen eines gültigen Vertrags
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Handlungsfähigkeit', sub: 'mind. 18 J., urteilsfähig', color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.2)' },
            { label: 'Übereinstimmung', sub: 'Antrag & Annahme decken sich', color: '#34d399', bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.2)' },
            { label: 'Gesetzlicher Inhalt', sub: 'nicht gegen Gesetz/Sittlichkeit', color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.2)' },
            { label: 'Formvorschrift', sub: 'einfach / schriftlich / öffentlich', color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)' },
          ].map(({ label, sub, color, bg, border }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="text-xs font-semibold mb-1" style={{ color }}>{label}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Kaufvertrag: Pflichten */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Kaufvertrag — Gegenseitige Pflichten
        </h3>
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
          <svg viewBox="0 0 680 110" className="w-full">
            {/* Verkäufer */}
            <rect x="20" y="20" width="200" height="70" rx="10" fill="rgba(96,165,250,0.07)" stroke="rgba(96,165,250,0.2)" strokeWidth="1.5" />
            <text x="120" y="42" textAnchor="middle" fontSize="12" fill="#60a5fa" fontFamily="system-ui" fontWeight="600">Verkäufer</text>
            <text x="120" y="58" textAnchor="middle" fontSize="10" fill="rgba(96,165,250,0.7)" fontFamily="system-ui">Ware übergeben</text>
            <text x="120" y="72" textAnchor="middle" fontSize="10" fill="rgba(96,165,250,0.7)" fontFamily="system-ui">Eigentum übertragen</text>
            <text x="120" y="86" textAnchor="middle" fontSize="10" fill="rgba(96,165,250,0.7)" fontFamily="system-ui">Mängelhaftung</text>

            {/* Double arrow */}
            <path d="M225,45 L455,45" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" markerEnd="url(#a3)" />
            <path d="M455,65 L225,65" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" markerEnd="url(#a4)" />
            <text x="340" y="40" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">Ware / Eigentumsübertragung</text>
            <text x="340" y="78" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">Kaufpreis</text>
            <defs>
              <marker id="a3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.2)" /></marker>
              <marker id="a4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.2)" /></marker>
            </defs>

            {/* Käufer */}
            <rect x="460" y="20" width="200" height="70" rx="10" fill="rgba(52,211,153,0.07)" stroke="rgba(52,211,153,0.2)" strokeWidth="1.5" />
            <text x="560" y="42" textAnchor="middle" fontSize="12" fill="#34d399" fontFamily="system-ui" fontWeight="600">Käufer</text>
            <text x="560" y="58" textAnchor="middle" fontSize="10" fill="rgba(52,211,153,0.7)" fontFamily="system-ui">Kaufpreis bezahlen</text>
            <text x="560" y="72" textAnchor="middle" fontSize="10" fill="rgba(52,211,153,0.7)" fontFamily="system-ui">Ware abnehmen</text>
            <text x="560" y="86" textAnchor="middle" fontSize="10" fill="rgba(52,211,153,0.7)" fontFamily="system-ui">Mängel rügen</text>
          </svg>
        </div>
      </div>

      {/* Mängel */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Mängelrüge — Optionen des Käufers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Wandelung', sub: 'Vertrag rückgängig machen', color: '#f87171', bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.2)' },
            { label: 'Minderung', sub: 'Preis herabsetzen', color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)' },
            { label: 'Ersatz', sub: 'Mangelfreie Ware verlangen', color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.2)' },
            { label: 'Schadenersatz', sub: 'Bei Verschulden des Verkäufers', color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.2)' },
          ].map(({ label, sub, color, bg, border }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="text-xs font-semibold mb-1" style={{ color }}>{label}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
