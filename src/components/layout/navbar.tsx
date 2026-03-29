'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Bot, CheckCircle, Sun, Moon, LogIn, LogOut, User, Shield, MessageSquarePlus, Menu, X, Calculator, Scale } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'

const nav = [
  { href: '/',          label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/frw',       label: 'FRW',         icon: Calculator },
  { href: '/wr',        label: 'WR',          icon: Scale },
  { href: '/progress',  label: 'Fortschritt', icon: CheckCircle },
  { href: '/assistant', label: 'Assistent',   icon: Bot },
  { href: '/feedback',  label: 'Feedback',    icon: MessageSquarePlus },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  function isActive(href: string) {
    return pathname === href || (href !== '/' && pathname.startsWith(href))
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b transition-colors duration-250"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'var(--nav-border)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" onClick={() => setMenuOpen(false)}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  boxShadow: '0 0 16px rgba(99,102,241,0.35)',
                }}
              >
                <TrendingUp size={16} className="text-white" />
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

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {nav.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                      active
                        ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                        : 'border-transparent hover:bg-white/[0.06]'
                    }`}
                    style={active ? {} : { color: 'var(--text-muted)' }}
                  >
                    <Icon size={13} />
                    {label}
                  </Link>
                )
              })}

              {/* User section */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-1 ml-1 pl-1 border-l border-white/10">
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          pathname.startsWith('/admin')
                            ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                            : 'border-transparent hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400'
                        }`}
                        style={pathname.startsWith('/admin') ? {} : { color: 'var(--text-muted)' }}
                      >
                        <Shield size={13} />
                        Admin
                      </Link>
                    )}
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)' }}>
                      <User size={12} className="text-blue-400" />
                      <span className="font-medium text-slate-300">{user.name}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border border-transparent hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <LogOut size={13} />
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 ml-1 pl-1 border-l border-white/10">
                    <Link
                      href="/login"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border border-transparent hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-400"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <LogIn size={13} />
                      Anmelden
                    </Link>
                  </div>
                )
              )}

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg transition-all border glass glass-hover"
                title={theme === 'dark' ? 'Helles Design' : 'Dunkles Design'}
              >
                {theme === 'dark'
                  ? <Sun size={14} className="text-amber-400" />
                  : <Moon size={14} className="text-indigo-500" />
                }
              </button>
            </div>

            {/* Mobile: Theme + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggle}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all border glass"
              >
                {theme === 'dark'
                  ? <Sun size={14} className="text-amber-400" />
                  : <Moon size={14} className="text-indigo-500" />
                }
              </button>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all border glass"
                aria-label="Menü öffnen"
              >
                {menuOpen ? <X size={16} style={{ color: 'var(--text-primary)' }} /> : <Menu size={16} style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col"
          style={{ top: '56px', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)' }}
        >
          <div className="px-4 py-4 space-y-1 overflow-y-auto">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    active
                      ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                      : 'border-transparent'
                  }`}
                  style={active ? {} : { color: 'var(--text-muted)', borderColor: 'transparent' }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}

            {!loading && user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  pathname.startsWith('/admin')
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'border-transparent'
                }`}
                style={pathname.startsWith('/admin') ? {} : { color: 'var(--text-muted)' }}
              >
                <Shield size={16} />
                Admin Dashboard
              </Link>
            )}

            <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              {!loading && (
                user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <User size={16} className="text-blue-400" />
                      <span className="text-sm font-medium text-slate-300">{user.name}</span>
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-red-400"
                      style={{ background: 'rgba(239,68,68,0.08)' }}
                    >
                      <LogOut size={16} />
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-400"
                    style={{ background: 'rgba(59,130,246,0.08)' }}
                  >
                    <LogIn size={16} />
                    Anmelden
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
