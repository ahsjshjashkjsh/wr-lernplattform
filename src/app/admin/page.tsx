'use client'
import { useEffect, useState, useCallback } from 'react'
import { Shield, Trash2, Crown, Users, BarChart2, Ban, UserPlus, Pencil, X, Check, Eye, EyeOff, RefreshCw, MessageSquare, CheckCircle2, XCircle, Clock, Bug, Lightbulb, FileText, HelpCircle, Wifi, WifiOff, Globe, Activity } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isBanned: boolean
  createdAt: string
  lastOnline: string | null
  lastIp: string | null
  _count: { quizAttempts: number; progress: number }
  quizAttempts: { completedAt: string; scorePercent: number }[]
  progress: { bestScore: number | null; status: string }[]
}

interface FeedbackItem {
  id: string
  userName: string
  title: string
  message: string
  category: string
  status: string
  adminNote: string | null
  createdAt: string
  user: { name: string; email: string } | null
}

const CATEGORY_ICONS: Record<string, typeof Bug> = { bug: Bug, feature: Lightbulb, content: FileText, general: HelpCircle }
const CATEGORY_LABELS: Record<string, string> = { bug: 'Fehler', feature: 'Vorschlag', content: 'Inhalt', general: 'Allgemein' }
const CATEGORY_COLORS: Record<string, string> = { bug: '#f87171', feature: '#fbbf24', content: '#60a5fa', general: '#a78bfa' }

type Tab = 'users' | 'create' | 'feedback'

// Online = lastOnline within last 3 minutes
function isOnline(lastOnline: string | null) {
  if (!lastOnline) return false
  return Date.now() - new Date(lastOnline).getTime() < 3 * 60 * 1000
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Nie'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'Gerade eben'
  if (mins < 60) return `vor ${mins} Min.`
  if (hours < 24) return `vor ${hours} Std.`
  return `vor ${days} Tagen`
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [bannedIps, setBannedIps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('users')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' })
  const [showEditPw, setShowEditPw] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', isAdmin: false })
  const [showCreatePw, setShowCreatePw] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'implemented'>('all')
  const [reviewItem, setReviewItem] = useState<FeedbackItem | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [banModal, setBanModal] = useState<AdminUser | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setBannedIps(data.bannedIps ?? [])
    }
    setLoading(false)
  }, [])

  async function loadFeedback() {
    const res = await fetch('/api/feedback')
    if (res.ok) { const data = await res.json(); setFeedback(data.feedback) }
  }

  async function reviewFeedback(id: string, status: 'accepted' | 'rejected' | 'implemented') {
    setActionLoading('review-' + id)
    await fetch('/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, adminNote }),
    })
    await loadFeedback()
    setActionLoading(null)
    setReviewItem(null)
    setAdminNote('')
  }

  // Auto-refresh every 30s to show live online status
  useEffect(() => {
    loadUsers()
    loadFeedback()
    const interval = setInterval(loadUsers, 30_000)
    return () => clearInterval(interval)
  }, [loadUsers])

  async function patch(userId: string, data: Record<string, unknown>, key: string) {
    setActionLoading(key)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    })
    await loadUsers()
    setActionLoading(null)
  }

  async function banUser(user: AdminUser, withIp: boolean) {
    setActionLoading(user.id + '-ban')
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, isBanned: true, banIp: withIp }),
    })
    await loadUsers()
    setActionLoading(null)
    setBanModal(null)
  }

  async function deleteUser(userId: string) {
    setActionLoading(userId + '-del')
    await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' })
    await loadUsers()
    setActionLoading(null)
    setConfirmDelete(null)
  }

  async function saveEdit() {
    if (!editUser) return
    setActionLoading('edit')
    const body: Record<string, unknown> = { userId: editUser.id }
    if (editForm.name) body.name = editForm.name
    if (editForm.email) body.email = editForm.email
    if (editForm.password) body.password = editForm.password
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await loadUsers()
    setActionLoading(null)
    setEditUser(null)
  }

  async function createUser() {
    setCreateError('')
    setCreateSuccess('')
    setActionLoading('create')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    })
    const data = await res.json()
    if (!res.ok) {
      setCreateError(data.error ?? 'Fehler beim Erstellen.')
    } else {
      setCreateSuccess(`Account für ${data.user.name} erstellt!`)
      setCreateForm({ name: '', email: '', password: '', isAdmin: false })
      await loadUsers()
    }
    setActionLoading(null)
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.lastIp ?? '').includes(search)
  )

  const totalQuiz = users.reduce((s, u) => s + u._count.quizAttempts, 0)
  const banned = users.filter(u => u.isBanned).length
  const online = users.filter(u => isOnline(u.lastOnline)).length
  const pendingFeedback = feedback.filter(f => f.status === 'pending').length
  const filteredFeedback = feedbackFilter === 'all' ? feedback : feedback.filter(f => f.status === feedbackFilter)

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Shield size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Benutzerverwaltung · Live-Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            {online} online
          </div>
          <button onClick={loadUsers} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users, label: 'Benutzer', value: users.length, color: '#3b82f6' },
          { icon: Activity, label: 'Gerade online', value: online, color: '#22c55e' },
          { icon: Ban, label: 'Gesperrt', value: banned, color: '#ef4444' },
          { icon: MessageSquare, label: 'Feedback offen', value: pendingFeedback, color: '#f59e0b' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass rounded-2xl p-4 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} style={{ color }} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">{value}</div>
          </div>
        ))}
      </div>

      {/* Banned IPs */}
      {bannedIps.length > 0 && (
        <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3 flex-wrap" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <Globe size={13} style={{ color: '#f87171' }} />
          <span className="text-xs font-semibold text-red-400">Gesperrte IPs:</span>
          {bannedIps.map(ip => (
            <span key={ip} className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5' }}>
              {ip}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {([['users', Users, 'Benutzer'], ['create', UserPlus, 'Neuer Account'], ['feedback', MessageSquare, `Feedback${pendingFeedback > 0 ? ` (${pendingFeedback})` : ''}`]] as const).map(([t, Icon, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
            style={{
              background: tab === t ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
              borderColor: tab === t ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
              color: tab === t ? '#60a5fa' : '#64748b',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* === TAB: USERS === */}
      {tab === 'users' && (
        <div className="glass rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <input
              type="text"
              placeholder="Name, E-Mail oder IP suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
            <span className="text-xs text-slate-500 shrink-0">{filtered.length} / {users.length}</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Lade...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Keine Benutzer gefunden.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.map(user => {
                const online = isOnline(user.lastOnline)
                const ipBanned = user.lastIp ? bannedIps.includes(user.lastIp) : false
                const scores = user.progress.map(p => p.bestScore).filter((s): s is number => s != null)
                const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

                return (
                  <div key={user.id} className={`px-5 py-4 transition-all ${user.isBanned ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-3">
                      {/* Online dot + Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{
                            background: user.isBanned ? 'rgba(239,68,68,0.2)'
                              : user.isAdmin ? 'rgba(245,158,11,0.2)'
                              : 'rgba(99,102,241,0.2)',
                            color: user.isBanned ? '#f87171' : user.isAdmin ? '#f59e0b' : '#818cf8',
                          }}
                        >
                          {user.isBanned ? <Ban size={14} /> : user.name.charAt(0).toUpperCase()}
                        </div>
                        {/* Live online indicator */}
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                          style={{
                            background: online ? '#22c55e' : '#374151',
                            borderColor: '#0c1526',
                            boxShadow: online ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <button
                            className="text-sm font-semibold text-slate-200 hover:text-white transition-colors text-left"
                            onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                          >
                            {user.name}
                          </button>
                          {user.isAdmin && (
                            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                              <Crown size={9} /> Admin
                            </span>
                          )}
                          {user.isBanned && (
                            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                              <Ban size={9} /> Gesperrt
                            </span>
                          )}
                          {online && (
                            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#22c55e' }}>
                              <Wifi size={9} /> Online
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{user.email}</div>

                        {/* Inline details */}
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
                          <span style={{ color: '#3d4d66' }}>
                            {online ? 'Gerade aktiv' : `Zuletzt: ${timeAgo(user.lastOnline)}`}
                          </span>
                          {user.lastIp && (
                            <span className="flex items-center gap-1 font-mono" style={{ color: ipBanned ? '#f87171' : '#3d4d66' }}>
                              <Globe size={9}/> {user.lastIp} {ipBanned && '(IP gesperrt)'}
                            </span>
                          )}
                          <span style={{ color: '#3d4d66' }}>
                            {user._count.quizAttempts} Quiz · {user._count.progress} Kapitel
                          </span>
                          {avgScore != null && (
                            <span style={{ color: '#f59e0b' }}>Ø {avgScore}%</span>
                          )}
                          <span style={{ color: '#3d4d66' }}>
                            Seit {new Date(user.createdAt).toLocaleDateString('de-CH')}
                          </span>
                        </div>

                        {/* Expanded details */}
                        {selectedUser?.id === user.id && (
                          <div className="mt-3 p-3 rounded-xl space-y-1.5 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-slate-600 block">User-ID</span>
                                <span className="font-mono text-slate-400 text-[10px]">{user.id}</span>
                              </div>
                              <div>
                                <span className="text-slate-600 block">IP-Adresse</span>
                                <span className="font-mono text-slate-400">{user.lastIp ?? '–'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600 block">Letzter Login</span>
                                <span className="text-slate-400">
                                  {user.lastOnline
                                    ? `${new Date(user.lastOnline).toLocaleDateString('de-CH')} ${new Date(user.lastOnline).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`
                                    : 'Noch nie'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600 block">Registriert</span>
                                <span className="text-slate-400">{new Date(user.createdAt).toLocaleDateString('de-CH')}</span>
                              </div>
                              <div>
                                <span className="text-slate-600 block">Quiz-Versuche</span>
                                <span className="text-slate-400">{user._count.quizAttempts}</span>
                              </div>
                              <div>
                                <span className="text-slate-600 block">Ø Score</span>
                                <span className="text-slate-400">{avgScore != null ? `${avgScore}%` : '–'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => { setEditUser(user); setEditForm({ name: user.name, email: user.email, password: '' }) }}
                          title="Bearbeiten"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          onClick={() => patch(user.id, { isAdmin: !user.isAdmin }, user.id + '-admin')}
                          disabled={actionLoading === user.id + '-admin'}
                          title={user.isAdmin ? 'Admin entfernen' : 'Zum Admin machen'}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                          style={{ background: user.isAdmin ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', color: user.isAdmin ? '#f59e0b' : '#64748b' }}
                        >
                          <Crown size={13} />
                        </button>

                        {user.isBanned ? (
                          <button
                            onClick={() => patch(user.id, { isBanned: false }, user.id + '-ban')}
                            disabled={actionLoading === user.id + '-ban'}
                            title="Entsperren"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                            style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                          >
                            <Ban size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setBanModal(user)}
                            disabled={actionLoading === user.id + '-ban'}
                            title="Sperren"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}
                          >
                            <Ban size={13} />
                          </button>
                        )}

                        {confirmDelete === user.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => deleteUser(user.id)} disabled={actionLoading === user.id + '-del'}
                              className="text-xs px-2 py-1 rounded-lg font-medium disabled:opacity-40"
                              style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                              Löschen
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="text-xs px-2 py-1 rounded-lg"
                              style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                              Abbruch
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(user.id)} title="Löschen"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* === TAB: CREATE === */}
      {tab === 'create' && (
        <div className="glass rounded-2xl border p-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-semibold text-slate-200 mb-5">Neuen Account erstellen</h2>
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Name</label>
              <input type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} placeholder="Max Mustermann" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">E-Mail</label>
              <input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} placeholder="max@beispiel.ch" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Passwort</label>
              <div className="relative">
                <input type={showCreatePw ? 'text' : 'password'} value={createForm.password}
                  onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none pr-10" style={inputStyle} placeholder="Mindestens 6 Zeichen" />
                <button type="button" onClick={() => setShowCreatePw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showCreatePw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={createForm.isAdmin} onChange={e => setCreateForm(f => ({ ...f, isAdmin: e.target.checked }))} className="rounded" />
              <span className="text-sm text-slate-400">Als Admin erstellen</span>
            </label>

            {createError && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">{createError}</div>}
            {createSuccess && <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5">{createSuccess}</div>}

            <button onClick={createUser} disabled={actionLoading === 'create'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all"
              style={{ background: '#3b82f6', color: '#fff' }}>
              <UserPlus size={14} />
              {actionLoading === 'create' ? 'Wird erstellt...' : 'Account erstellen'}
            </button>
          </div>
        </div>
      )}

      {/* === TAB: FEEDBACK === */}
      {tab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'accepted', 'implemented', 'rejected'] as const).map(f => {
              const labels = { all: 'Alle', pending: 'Offen', accepted: 'Akzeptiert', implemented: 'Erledigt ✓', rejected: 'Abgelehnt' }
              const colors = { all: '#64748b', pending: '#f59e0b', accepted: '#10b981', implemented: '#6366f1', rejected: '#f87171' }
              return (
                <button key={f} onClick={() => setFeedbackFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    background: feedbackFilter === f ? `${colors[f]}18` : 'rgba(255,255,255,0.04)',
                    borderColor: feedbackFilter === f ? `${colors[f]}40` : 'rgba(255,255,255,0.08)',
                    color: feedbackFilter === f ? colors[f] : '#64748b',
                  }}>
                  {labels[f]}
                </button>
              )
            })}
          </div>

          {filteredFeedback.length === 0 ? (
            <div className="glass rounded-2xl border p-10 text-center text-slate-500 text-sm" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              Kein Feedback vorhanden.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedback.map(item => {
                const CatIcon = CATEGORY_ICONS[item.category] ?? HelpCircle
                const color = CATEGORY_COLORS[item.category] ?? '#a78bfa'
                const statusIcon = item.status === 'accepted' ? CheckCircle2 : item.status === 'implemented' ? CheckCircle2 : item.status === 'rejected' ? XCircle : Clock
                const statusColor = item.status === 'accepted' ? '#10b981' : item.status === 'implemented' ? '#6366f1' : item.status === 'rejected' ? '#f87171' : '#f59e0b'
                const StatusIcon = statusIcon
                return (
                  <div key={item.id} className="glass rounded-2xl border p-5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                        <CatIcon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-slate-200">{item.title}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: `${color}18`, color }}>{CATEGORY_LABELS[item.category]}</span>
                          <div className="flex items-center gap-1 ml-auto">
                            <StatusIcon size={12} style={{ color: statusColor }} />
                            <span className="text-xs" style={{ color: statusColor }}>
                              {item.status === 'accepted' ? 'Akzeptiert' : item.status === 'implemented' ? 'Erledigt' : item.status === 'rejected' ? 'Abgelehnt' : 'Offen'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{item.userName} · {new Date(item.createdAt).toLocaleDateString('de-CH')}</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{item.message}</p>
                        {item.adminNote && (
                          <div className="mt-2 px-3 py-2 rounded-lg text-xs text-slate-400 italic" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            Admin-Notiz: {item.adminNote}
                          </div>
                        )}
                        {item.status === 'pending' && (
                          <button onClick={() => { setReviewItem(item); setAdminNote('') }}
                            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                            style={{ background: '#3b82f6' }}>
                            Prüfen
                          </button>
                        )}
                        {item.status === 'accepted' && (
                          <button onClick={() => reviewFeedback(item.id, 'implemented')}
                            disabled={actionLoading === 'review-' + item.id}
                            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                            ✓ Als erledigt markieren
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* === BAN MODAL === */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="glass rounded-2xl border p-6 w-full max-w-sm" style={{ borderColor: 'rgba(239,68,68,0.25)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-red-400 flex items-center gap-2"><Ban size={15}/> Benutzer sperren</h2>
              <button onClick={() => setBanModal(null)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>

            <div className="mb-5 p-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="font-semibold text-slate-200">{banModal.name}</div>
              <div className="text-xs text-slate-500">{banModal.email}</div>
              {banModal.lastIp && (
                <div className="text-xs font-mono mt-1.5 flex items-center gap-1.5" style={{ color: '#64748b' }}>
                  <Globe size={10}/> IP: {banModal.lastIp}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Wie soll der Benutzer gesperrt werden?
            </p>

            <div className="space-y-2">
              <button
                onClick={() => banUser(banModal, false)}
                disabled={actionLoading === banModal.id + '-ban'}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 text-left"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
              >
                <Ban size={15} className="shrink-0"/>
                <div>
                  <div>Nur Account sperren</div>
                  <div className="text-xs font-normal text-red-400/60">Konto gesperrt, neue Accounts möglich</div>
                </div>
              </button>

              {banModal.lastIp && banModal.lastIp !== 'unknown' && (
                <button
                  onClick={() => banUser(banModal, true)}
                  disabled={actionLoading === banModal.id + '-ban'}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 text-left"
                  style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}
                >
                  <Globe size={15} className="shrink-0"/>
                  <div>
                    <div>Account + IP sperren</div>
                    <div className="text-xs font-normal text-red-400/60">Keine neuen Accounts von {banModal.lastIp} möglich</div>
                  </div>
                </button>
              )}

              <button onClick={() => setBanModal(null)}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-center"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === REVIEW MODAL === */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="glass rounded-2xl border p-6 w-full max-w-md" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Feedback prüfen</h2>
              <button onClick={() => setReviewItem(null)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>
            <div className="mb-4 p-3 rounded-xl text-sm text-slate-300" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-medium text-slate-200 mb-1">{reviewItem.title}</p>
              <p className="text-xs text-slate-400 mb-2">{reviewItem.userName}</p>
              <p className="whitespace-pre-wrap">{reviewItem.message}</p>
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-400 block mb-1.5">Admin-Notiz <span className="text-slate-600">(optional)</span></label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                placeholder="z.B. Wird im nächsten Update umgesetzt..."
                rows={3} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => reviewFeedback(reviewItem.id, 'accepted')} disabled={actionLoading === 'review-' + reviewItem.id}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#10b981' }}>
                <CheckCircle2 size={14} /> Akzeptieren
              </button>
              <button onClick={() => reviewFeedback(reviewItem.id, 'rejected')} disabled={actionLoading === 'review-' + reviewItem.id}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#ef4444' }}>
                <XCircle size={14} /> Ablehnen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === EDIT MODAL === */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="glass rounded-2xl border p-6 w-full max-w-sm" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-slate-200">Benutzer bearbeiten</h2>
              <button onClick={() => setEditUser(null)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">E-Mail</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Neues Passwort <span className="text-slate-600">(leer = nicht ändern)</span></label>
                <div className="relative">
                  <input type={showEditPw ? 'text' : 'password'} value={editForm.password}
                    onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none pr-10" style={inputStyle} placeholder="Neues Passwort..." />
                  <button type="button" onClick={() => setShowEditPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showEditPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveEdit} disabled={actionLoading === 'edit'}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: '#3b82f6' }}>
                  <Check size={14} />
                  {actionLoading === 'edit' ? 'Speichern...' : 'Speichern'}
                </button>
                <button onClick={() => setEditUser(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
