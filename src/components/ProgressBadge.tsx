type Props = {
  status: string | null
  bestScore: number | null
  size?: 'sm' | 'md'
}

export function ProgressBadge({ status, bestScore, size = 'sm' }: Props) {
  const score = bestScore ? Math.round(bestScore) : null

  let label: string
  let color: string
  let bg: string
  let border: string
  let dot: string

  if (!status || status === 'not_started') {
    label = 'Noch nicht begonnen'
    color = 'rgba(255,255,255,0.35)'
    bg    = 'rgba(255,255,255,0.04)'
    border = 'rgba(255,255,255,0.08)'
    dot   = '○'
  } else if (status === 'in_progress') {
    label = 'Besucht'
    color = '#60a5fa'
    bg    = 'rgba(59,130,246,0.08)'
    border = 'rgba(59,130,246,0.2)'
    dot   = '◑'
  } else if (status === 'completed') {
    if ((score ?? 0) >= 80) {
      label = score ? `${score}% · Abgeschlossen` : 'Abgeschlossen'
      color = '#4ade80'
      bg    = 'rgba(34,197,94,0.08)'
      border = 'rgba(34,197,94,0.2)'
      dot   = '✓'
    } else {
      label = score ? `${score}% · Geübt` : 'Geübt'
      color = '#fbbf24'
      bg    = 'rgba(251,191,36,0.08)'
      border = 'rgba(251,191,36,0.2)'
      dot   = '◉'
    }
  } else {
    label = 'Besucht'
    color = '#60a5fa'
    bg    = 'rgba(59,130,246,0.08)'
    border = 'rgba(59,130,246,0.2)'
    dot   = '◑'
  }

  const px = size === 'md' ? 'px-3 py-1.5' : 'px-2.5 py-1'
  const textSize = size === 'md' ? 'text-xs' : 'text-[11px]'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium ${px} ${textSize}`}
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      <span className="text-[10px]">{dot}</span>
      {label}
    </span>
  )
}

export function progressLevel(status: string | null, score: number | null): number {
  if (!status || status === 'not_started') return 0
  if (status === 'in_progress') return 1
  if (status === 'completed') return (score ?? 0) >= 80 ? 3 : 2
  return 1
}
