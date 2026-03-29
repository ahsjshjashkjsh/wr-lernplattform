/**
 * Rendert das Summary-Format der Seed-Scripts:
 *
 *   ABSCHNITTSNAME — Satz 1. Satz 2. Satz 3.
 *   NÄCHSTER ABSCHNITT — Weiterer Text. Noch mehr.
 *
 * Jede Zeile = ein Abschnitt. "CAPS —" wird zum Heading,
 * der Rest wird in einzelne Sätze aufgeteilt (Bullet-Points).
 */
export function SummaryText({ text }: { text: string }) {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)

  return (
    <div className="space-y-5">
      {lines.map((line, i) => {
        const dashIdx = line.indexOf(' — ')

        if (dashIdx > 0) {
          const heading  = line.slice(0, dashIdx).trim()
          const body     = line.slice(dashIdx + 3).trim()

          // Split into sentences on ". " or "! " or "? " boundaries,
          // but keep the punctuation attached to the preceding sentence.
          const sentences = body
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(Boolean)

          return (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: '#60a5fa' }}
                >
                  {heading}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <ul className="space-y-1.5 pl-1">
                {sentences.map((s, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span
                      className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: 'rgba(96,165,250,0.5)' }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        }

        // Fallback für Zeilen ohne " — " (plain text)
        return (
          <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {line}
          </p>
        )
      })}
    </div>
  )
}
