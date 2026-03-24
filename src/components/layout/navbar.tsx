'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard, TrendingUp, Bot, CheckCircle, Sun, Moon, LogIn, LogOut, User, Shield, MessageSquarePlus, Menu, X, BookMarked } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'

const nav = [
  { href: '/',                  label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/topics',            label: 'Themen',       icon: BookOpen },
  { href: '/buchungssaetze',    label: 'Buchungssätze', icon: BookMarked },
  { href: '/progress',          label: 'Fortschritt',  icon: CheckCircle },
  { href: '/assistant',         label: 'Assistent',    icon: Bot },
  { href: '/feedback',          label: 'Feedback',     icon: MessageSquarePlus },
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
        className="sticky top-0 z-50"
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--nav-border)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMenuOpen(false)}>
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'var(--accent)', }}
              >
                <TrendingUp size={14} className="text-white" style={{ color: '#09090e' }} />
              </div>
              <div className="leading-none">
                <div className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  HMS-Plattform
                </div>
                <div className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                  HMS · H23b
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {nav.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
                    style={{
                      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: active ? 'var(--bg-surface)' : 'transparent',
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    <Icon size={12} />
                    {label}
                  </Link>
                )
              })}

              {/* User section */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-0.5 ml-2 pl-2" style={{ borderLeft: '1px solid var(--border-color)' }}>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{
                          color: pathname.startsWith('/admin') ? 'var(--accent)' : 'var(--text-muted)',
                          background: pathname.startsWith('/admin') ? 'var(--accent-dim)' : 'transparent',
                        }}
                      >
                        <Shield size={12} />
                        Admin
                      </Link>
                    )}
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <User size={11} style={{ color: 'var(--accent)' }} />
                      {user.name}
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => {
                        ;(e.currentTarget as HTMLElement).style.color = '#ef4444'
                        ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
                        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                      }}
                    >
                      <LogOut size={12} />
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center ml-2 pl-2" style={{ borderLeft: '1px solid var(--border-color)' }}>
                    <Link
                      href="/login"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <LogIn size={12} />
                      Anmelden
                    </Link>
                  </div>
                )
              )}

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                title={theme === 'dark' ? 'Helles Design' : 'Dunkles Design'}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {theme === 'dark'
                  ? <Sun size={14} style={{ color: 'var(--accent)' }} />
                  : <Moon size={14} style={{ color: 'var(--blue)' }} />
                }
              </button>
            </div>

            {/* Mobile: Theme + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggle}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ border: '1px solid var(--border-color)' }}
              >
                {theme === 'dark'
                  ? <Sun size={14} style={{ color: 'var(--accent)' }} />
                  : <Moon size={14} style={{ color: 'var(--blue)' }} />
                }
              </button>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ border: '1px solid var(--border-color)' }}
                aria-label="Menü öffnen"
              >
                {menuOpen
                  ? <X size={15} style={{ color: 'var(--text-primary)' }} />
                  : <Menu size={15} style={{ color: 'var(--text-muted)' }} />
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col overflow-y-auto"
          style={{ top: '56px', background: 'var(--bg-base)', borderTop: '1px solid var(--border-color)' }}
        >
          <div className="px-4 py-4 space-y-0.5">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: active ? 'var(--bg-surface)' : 'transparent',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}

            {!loading && user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  color: pathname.startsWith('/admin') ? 'var(--accent)' : 'var(--text-secondary)',
                  background: pathname.startsWith('/admin') ? 'var(--accent-dim)' : 'transparent',
                }}
              >
                <Shield size={15} />
                Admin Dashboard
              </Link>
            )}

            <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              {!loading && (
                user ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3 px-4 py-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <User size={15} style={{ color: 'var(--accent)' }} />
                      {user.name}
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                      style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
                    >
                      <LogOut size={15} />
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{ color: 'var(--blue)', background: 'var(--blue-dim)' }}
                  >
                    <LogIn size={15} />
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
