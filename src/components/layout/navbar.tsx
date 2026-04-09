'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Bot, CheckCircle,
  Sun, Moon, LogIn, LogOut, User, Shield,
  MessageSquarePlus, Menu, X, Calculator, Scale,
  Crown, Landmark,
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'

const GESCHICHTE_EXPIRY = new Date('2026-04-11T00:00:00')

const nav = [
  { href: '/',           label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/frw',        label: 'FRW',         icon: Calculator },
  { href: '/wr',         label: 'WR',          icon: Scale },
  ...(new Date() < GESCHICHTE_EXPIRY ? [{ href: '/geschichte', label: 'Geschichte', icon: Landmark, badge: '⏰' }] : []),
  { href: '/progress',   label: 'Fortschritt', icon: CheckCircle },
  { href: '/assistant',  label: 'Assistent',   icon: Bot },
  { href: '/feedback',   label: 'Feedback',    icon: MessageSquarePlus },
] as { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge?: string }[]

export function Navbar() {
  const pathname  = usePathname()
  const { theme, toggle } = useTheme()
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const isPremiumActive = user?.isPremium && user.premiumUntil && new Date(user.premiumUntil) > new Date()

  function isActive(href: string) {
    return pathname === href || (href !== '/' && pathname.startsWith(href))
  }

  // ── shared nav link for sidebar ──────────────────────────
  function SidebarLink({ href, label, icon: Icon, badge }: typeof nav[number]) {
    const active = isActive(href)
    return (
      <Link
        href={href}
        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative"
        style={active ? {
          background: 'var(--accent-bg)',
          color: 'var(--accent)',
          border: '1px solid var(--accent-border)',
        } : {
          color: 'var(--text-muted)',
          border: '1px solid transparent',
        }}
        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)' } }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent' } }}
      >
        <Icon size={15} className="shrink-0" />
        <span className="flex-1">{label}</span>
        {badge && <span className="text-[10px]">{badge}</span>}
      </Link>
    )
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full w-[220px] z-50"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--nav-border)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-4 h-[60px] shrink-0 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{ background: 'var(--accent)', boxShadow: '0 2px 12px rgba(79,114,245,0.4)' }}
          >
            <TrendingUp size={15} className="text-white" />
          </div>
          <div className="leading-none">
            <div className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              HMS-Plattform
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              HMS · H23b
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div className="mx-4 h-px" style={{ background: 'var(--nav-border)' }} />

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => <SidebarLink key={item.href} {...item} />)}

          {/* Admin link */}
          {!loading && user?.isAdmin && (
            <>
              <div className="my-2 mx-1 h-px" style={{ background: 'var(--nav-border)' }} />
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={pathname.startsWith('/admin') ? {
                  background: 'rgba(245,158,11,0.1)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245,158,11,0.25)',
                } : {
                  color: 'var(--text-muted)',
                  border: '1px solid transparent',
                }}
                onMouseEnter={e => { if (!pathname.startsWith('/admin')) { (e.currentTarget as HTMLElement).style.color = '#fbbf24'; (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)' } }}
                onMouseLeave={e => { if (!pathname.startsWith('/admin')) { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent' } }}
              >
                <Shield size={15} className="shrink-0" />
                Admin
              </Link>
            </>
          )}
        </nav>

        {/* Bottom: user + actions */}
        <div className="shrink-0 px-3 pb-4 pt-3 space-y-2" style={{ borderTop: '1px solid var(--nav-border)' }}>
          {!loading && (
            user ? (
              <>
                {/* User info */}
                <div className="px-3 py-2 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'rgba(79,114,245,0.2)', color: 'var(--accent)' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.name}
                    </span>
                  </div>
                  <Link
                    href="/premium"
                    className="flex items-center gap-1.5 text-[11px] font-medium transition-opacity hover:opacity-80"
                    style={isPremiumActive
                      ? { color: '#fbbf24' }
                      : { color: 'var(--text-muted)' }
                    }
                  >
                    <Crown size={11} />
                    {isPremiumActive ? 'Premium aktiv' : 'Premium holen'}
                  </Link>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={logout}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)' }}
                  >
                    <LogOut size={12} /> Abmelden
                  </button>
                  <button
                    onClick={toggle}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                    title={theme === 'dark' ? 'Helles Design' : 'Dunkles Design'}
                  >
                    {theme === 'dark'
                      ? <Sun size={13} className="text-amber-400" />
                      : <Moon size={13} className="text-indigo-500" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--accent)' }}
                >
                  <LogIn size={14} /> Anmelden
                </Link>
                <button
                  onClick={toggle}
                  className="w-full h-8 flex items-center justify-center rounded-lg transition-all"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                >
                  {theme === 'dark'
                    ? <Sun size={13} className="text-amber-400" />
                    : <Moon size={13} className="text-indigo-500" />}
                </button>
              </div>
            )
          )}
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ──────────────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-50 border-b"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'var(--nav-border)',
        }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>HMS-Plattform</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-lg border glass">
              {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-500" />}
            </button>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border glass"
              aria-label="Menü"
            >
              {menuOpen ? <X size={16} style={{ color: 'var(--text-primary)' }} /> : <Menu size={16} style={{ color: 'var(--text-muted)' }} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ─────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col overflow-y-auto"
          style={{ top: '56px', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)' }}
        >
          <div className="px-4 py-4 space-y-1">
            {nav.map(({ href, label, icon: Icon, badge }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={active
                    ? { color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }
                    : { color: 'var(--text-muted)', border: '1px solid transparent' }
                  }
                >
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                  {badge && <span className="text-xs">{badge}</span>}
                </Link>
              )
            })}

            {!loading && user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.startsWith('/admin') ? 'text-amber-400 bg-amber-500/10' : ''}`}
                style={pathname.startsWith('/admin') ? {} : { color: 'var(--text-muted)' }}
              >
                <Shield size={16} /> Admin Dashboard
              </Link>
            )}

            <div className="pt-4 mt-2 space-y-1" style={{ borderTop: '1px solid var(--border-color)' }}>
              {!loading && (user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <User size={15} className="text-blue-400" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                    {isPremiumActive && <Crown size={13} className="text-amber-400 ml-auto" />}
                  </div>
                  <Link href="/premium" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={isPremiumActive ? { background: 'rgba(245,158,11,0.1)', color: '#fbbf24' } : { color: 'var(--text-muted)' }}>
                    <Crown size={15} /> {isPremiumActive ? 'Premium aktiv' : 'Premium holen'}
                  </Link>
                  <button onClick={() => { logout(); setMenuOpen(false) }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400" style={{ background: 'rgba(239,68,68,0.07)' }}>
                    <LogOut size={15} /> Abmelden
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-400" style={{ background: 'rgba(59,130,246,0.08)' }}>
                  <LogIn size={15} /> Anmelden
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
