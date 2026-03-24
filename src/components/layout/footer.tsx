import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-16 border-t py-6" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-6">
        <Link
          href="/impressum"
          className="text-xs transition-colors hover:text-slate-300"
          style={{ color: 'var(--text-muted)' }}
        >
          Impressum
        </Link>
        <span style={{ color: 'var(--text-muted)' }} className="text-xs">·</span>
        <Link
          href="/datenschutz"
          className="text-xs transition-colors hover:text-slate-300"
          style={{ color: 'var(--text-muted)' }}
        >
          Datenschutz
        </Link>
        <span style={{ color: 'var(--text-muted)' }} className="text-xs">·</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          © 2026 HMS-Plattform
        </span>
      </div>
    </footer>
  )
}
