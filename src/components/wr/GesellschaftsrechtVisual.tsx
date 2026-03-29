export function GesellschaftsrechtVisual() {
  return (
    <div className="space-y-6">

      {/* Hierarchy SVG */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Rechtsformen-Übersicht (Schweiz)
        </h3>
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
          <svg viewBox="0 0 680 220" className="w-full">
            {/* Root */}
            <rect x="240" y="14" width="200" height="40" rx="8" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
            <text x="340" y="30" textAnchor="middle" fontSize="11" fill="#a5b4fc" fontFamily="system-ui" fontWeight="600">Rechtsformen</text>
            <text x="340" y="46" textAnchor="middle" fontSize="9" fill="rgba(165,180,252,0.6)" fontFamily="system-ui">(nach OR / ZGB)</text>

            {/* Lines to Level 2 */}
            <line x1="340" y1="54" x2="340" y2="76" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="120" y1="76" x2="560" y2="76" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="120" y1="76" x2="120" y2="96" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="340" y1="76" x2="340" y2="96" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="560" y1="76" x2="560" y2="96" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

            {/* Einzelunternehmen */}
            <rect x="30" y="96" width="180" height="40" rx="8" fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.25)" strokeWidth="1.5" />
            <text x="120" y="113" textAnchor="middle" fontSize="11" fill="#60a5fa" fontFamily="system-ui" fontWeight="600">Einzelunternehmen</text>
            <text x="120" y="128" textAnchor="middle" fontSize="9" fill="rgba(96,165,250,0.6)" fontFamily="system-ui">1 Person, kein Mindestkapital</text>

            {/* Personengesellschaft */}
            <rect x="250" y="96" width="180" height="40" rx="8" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.25)" strokeWidth="1.5" />
            <text x="340" y="113" textAnchor="middle" fontSize="11" fill="#a78bfa" fontFamily="system-ui" fontWeight="600">Personengesellschaft</text>
            <text x="340" y="128" textAnchor="middle" fontSize="9" fill="rgba(167,139,250,0.6)" fontFamily="system-ui">KlG, KmG</text>

            {/* Kapitalgesellschaft */}
            <rect x="470" y="96" width="180" height="40" rx="8" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.25)" strokeWidth="1.5" />
            <text x="560" y="113" textAnchor="middle" fontSize="11" fill="#34d399" fontFamily="system-ui" fontWeight="600">Kapitalgesellschaft</text>
            <text x="560" y="128" textAnchor="middle" fontSize="9" fill="rgba(52,211,153,0.6)" fontFamily="system-ui">GmbH, AG</text>

            {/* Sub-lines KlG/KmG */}
            <line x1="310" y1="136" x2="310" y2="155" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />
            <line x1="370" y1="136" x2="370" y2="155" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />
            <line x1="310" y1="155" x2="370" y2="155" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />
            <line x1="310" y1="155" x2="310" y2="172" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />
            <line x1="370" y1="155" x2="370" y2="172" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />

            <rect x="260" y="172" width="90" height="30" rx="6" fill="rgba(167,139,250,0.06)" stroke="rgba(167,139,250,0.18)" strokeWidth="1" />
            <text x="305" y="192" textAnchor="middle" fontSize="9" fill="rgba(167,139,250,0.8)" fontFamily="system-ui">KlG</text>

            <rect x="360" y="172" width="90" height="30" rx="6" fill="rgba(167,139,250,0.06)" stroke="rgba(167,139,250,0.18)" strokeWidth="1" />
            <text x="405" y="192" textAnchor="middle" fontSize="9" fill="rgba(167,139,250,0.8)" fontFamily="system-ui">KmG</text>

            {/* Sub-lines GmbH/AG */}
            <line x1="520" y1="136" x2="520" y2="155" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
            <line x1="600" y1="136" x2="600" y2="155" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
            <line x1="520" y1="155" x2="600" y2="155" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
            <line x1="520" y1="155" x2="520" y2="172" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
            <line x1="600" y1="155" x2="600" y2="172" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />

            <rect x="470" y="172" width="90" height="30" rx="6" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.18)" strokeWidth="1" />
            <text x="515" y="192" textAnchor="middle" fontSize="9" fill="rgba(52,211,153,0.8)" fontFamily="system-ui">GmbH</text>

            <rect x="570" y="172" width="90" height="30" rx="6" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.18)" strokeWidth="1" />
            <text x="615" y="192" textAnchor="middle" fontSize="9" fill="rgba(52,211,153,0.8)" fontFamily="system-ui">AG</text>
          </svg>
        </div>
      </div>

      {/* Comparison table */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Vergleich: Einzelunternehmen vs. GmbH vs. AG
        </h3>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
          <table className="w-full text-xs">
            <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
              <tr>
                {['Merkmal', 'Einzelunternehmen', 'GmbH', 'AG'].map((h, i) => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold" style={{ color: i === 0 ? 'var(--text-muted)' : ['#60a5fa','#a78bfa','#34d399'][i-1], borderBottom: '1px solid var(--border-color)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Mindestkapital', 'Keines', 'CHF 20\'000', 'CHF 100\'000'],
                ['Haftung', 'Unbeschränkt persönlich', 'Auf Gesellschaftskapital', 'Auf Aktienkapital'],
                ['Eigentümer', '1 Person', 'mind. 1 Gesellschafter', 'mind. 1 Aktionär'],
                ['Handelsregister', 'Ab CHF 100\'000 Umsatz', 'Pflicht', 'Pflicht'],
                ['Firma', 'Name der Inhaberin', 'Frei wählbar + «GmbH»', 'Frei wählbar + «AG»'],
                ['Gewinn', 'Geht direkt an Inhaber/in', 'Ausschüttung an Gesellschafter', 'Dividende an Aktionäre'],
              ].map((row, ri) => (
                <tr key={ri} style={{ borderBottom: ri < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: ri % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <td className="px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{row[0]}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{row[1]}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{row[2]}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handelsregister */}
      <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
        <span className="text-amber-400 font-bold text-lg leading-none shrink-0">!</span>
        <div>
          <span className="text-xs font-semibold text-amber-300">Handelsregister:</span>
          <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>
            Öffentliches Register mit Rechtsformen, Firmenname, Sitz, Kapital, Organe. Schafft Transparenz und Rechtssicherheit. Eintragung kann Pflicht oder freiwillig sein.
          </span>
        </div>
      </div>

    </div>
  )
}
