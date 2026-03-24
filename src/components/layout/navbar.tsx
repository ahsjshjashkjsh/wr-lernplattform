'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard, TrendingUp, Bot, CheckCircle, Sun, Moon, LogIn, LogOut, User, Shield, MessageSquarePlus } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'

const nav = [
  { href: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/topics',    label: 'Themen',     icon: BookOpen },
  { href: '/progress',  label: 'Fortschritt', icon: CheckCircle },
  { href: '/assistant', label: 'Assistent',  icon: Bot },
  { href: '/feedback',  label: 'Feedback',   icon: MessageSquarePlus },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const { user, loading, logout } = useAuth()

  return (
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
          <Link href="/" className="flex items-center gap-3 group">
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
                WR Lernplattform
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                HMS · H23b
              </div>
            </div>
          </Link>

          {/* Nav + User + Toggle */}
          <div className="flex items-center gap-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                    active
                      ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                      : 'border-transparent hover:bg-white/[0.06] [data-theme=light]_&:hover:bg-black/[0.04]'
                  }`}
                  style={active ? {} : { color: 'var(--text-muted)' }}
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{label}</span>
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
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  )}
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)' }}>
                    <User size={12} className="text-blue-400" />
                    <span className="font-medium text-slate-300">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border border-transparent hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                    style={{ color: 'var(--text-muted)' }}
                    title="Abmelden"
                  >
                    <LogOut size={13} />
                    <span className="hidden sm:inline">Abmelden</span>
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
                    <span className="hidden sm:inline">Anmelden</span>
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
        </div>
      </div>
    </header>
  )
}
