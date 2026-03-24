'use client'
import { useEffect, useState } from 'react'
import { Shield, Trash2, Crown, Users, BarChart2, BookOpen, Ban, UserPlus, Pencil, X, Check, Eye, EyeOff, RefreshCw, MessageSquare, CheckCircle2, XCircle, Clock, Bug, Lightbulb, FileText, HelpCircle } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isBanned: boolean
  createdAt: string
  lastOnline: string | null
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

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
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
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')
  const [reviewItem, setReviewItem] = useState<FeedbackItem | null>(null)
  const [adminNote, setAdminNote] = useState('')

  async function loadUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
    setLoading(false)
  }

  async function loadFeedback() {
    const res = await fetch('/api/feedback')
    if (res.ok) { const data = await res.json(); setFeedback(data.feedback) }
  }

  async function reviewFeedback(id: string, status: 'accepted' | 'rejected') {
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

  useEffect(() => { loadUsers(); loadFeedback() }, [])

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
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalQuiz = users.reduce((s, u) => s + u._count.quizAttempts, 0)
  const totalProgress = users.reduce((s, u) => s + u._count.progress, 0)
  const banned = users.filter(u => u.isBanned).length
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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Benutzerverwaltung</p>
          </div>
        </div>
        <button onClick={loadUsers} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users, label: 'Gesamt', value: users.length, color: '#3b82f6' },
          { icon: Ban, label: 'Gesperrt', value: banned, color: '#ef4444' },
          { icon: BarChart2, label: 'Quiz-Versuche', value: totalQuiz, color: '#10b981' },
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
              placeholder="Suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
            <span className="text-xs text-slate-500">{filtered.length} von {users.length}</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Lade...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Keine Benutzer gefunden.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.map(user => (
                <div key={user.id} className={`px-5 py-4 flex items-center gap-4 transition-all ${user.isBanned ? 'opacity-50' : ''}`}>
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{
                      background: user.isBanned ? 'rgba(239,68,68,0.2)'
                        : user.isAdmin ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                        : 'rgba(99,102,241,0.2)',
                      color: user.isBanned ? '#f87171' : user.isAdmin ? 'white' : '#818cf8',
                    }}
                  >
                    {user.isBanned ? <Ban size={14} /> : user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-200 truncate">{user.name}</span>
                      {user.isAdmin && (
                        <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                          <Crown size={10} /> Admin
                        </span>
                      )}
                      {user.isBanned && (
                        <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                          <Ban size={10} /> Gesperrt
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex flex-col gap-0.5 text-xs text-right">
                    <span className="text-slate-400">
                      {user._count.quizAttempts} Quiz · {user._count.progress} Kapitel abgeschlossen
                    </span>
                    {user.progress.length > 0 && (() => {
                      const scores = user.progress.map(p => p.bestScore).filter((s): s is number => s != null)
                      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
                      return avg != null ? <span className="text-amber-400 font-medium">Ø Score: {avg}%</span> : null
                    })()}
                    <span className="text-slate-500">
                      Registriert: {new Date(user.createdAt).toLocaleDateString('de-CH')}
                    </span>
                    <span className={user.lastOnline ? 'text-emerald-400' : 'text-slate-600'}>
                      {user.lastOnline
                        ? `Online: ${new Date(user.lastOnline).toLocaleDateString('de-CH')} ${new Date(user.lastOnline).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Noch nie eingeloggt'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Edit */}
                    <button
                      onClick={() => { setEditUser(user); setEditForm({ name: user.name, email: user.email, password: '' }) }}
                      title="Bearbeiten"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                    >
                      <Pencil size={13} />
                    </button>

                    {/* Admin toggle */}
                    <button
                      onClick={() => patch(user.id, { isAdmin: !user.isAdmin }, user.id + '-admin')}
                      disabled={actionLoading === user.id + '-admin'}
                      title={user.isAdmin ? 'Admin entfernen' : 'Zum Admin machen'}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                      style={{ background: user.isAdmin ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', color: user.isAdmin ? '#f59e0b' : '#64748b' }}
                    >
                      <Crown size={13} />
                    </button>

                    {/* Ban toggle */}
                    <button
                      onClick={() => patch(user.id, { isBanned: !user.isBanned }, user.id + '-ban')}
                      disabled={actionLoading === user.id + '-ban'}
                      title={user.isBanned ? 'Entsperren' : 'Sperren'}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                      style={{ background: user.isBanned ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)', color: user.isBanned ? '#f87171' : '#64748b' }}
                    >
                      <Ban size={13} />
                    </button>

                    {/* Delete */}
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
              ))}
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
              <input type="checkbox" checked={createForm.isAdmin} onChange={e => setCreateForm(f => ({ ...f, isAdmin: e.target.checked }))}
                className="rounded" />
              <span className="text-sm text-slate-400">Als Admin erstellen</span>
            </label>

            {createError && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">{createError}</div>}
            {createSuccess && <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5">{createSuccess}</div>}

            <button onClick={createUser} disabled={actionLoading === 'create'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
              <UserPlus size={14} />
              {actionLoading === 'create' ? 'Wird erstellt...' : 'Account erstellen'}
            </button>
          </div>
        </div>
      )}

      {/* === TAB: FEEDBACK === */}
      {tab === 'feedback' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map(f => {
              const labels = { all: 'Alle', pending: 'Offen', accepted: 'Akzeptiert', rejected: 'Abgelehnt' }
              const colors = { all: '#64748b', pending: '#f59e0b', accepted: '#10b981', rejected: '#f87171' }
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
                const statusIcon = item.status === 'accepted' ? CheckCircle2 : item.status === 'rejected' ? XCircle : Clock
                const statusColor = item.status === 'accepted' ? '#10b981' : item.status === 'rejected' ? '#f87171' : '#f59e0b'
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
                              {item.status === 'accepted' ? 'Akzeptiert' : item.status === 'rejected' ? 'Abgelehnt' : 'Offen'}
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
                          <button
                            onClick={() => { setReviewItem(item); setAdminNote('') }}
                            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                          >
                            Prüfen
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
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="z.B. Wird im nächsten Update umgesetzt..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => reviewFeedback(reviewItem.id, 'accepted')}
                disabled={actionLoading === 'review-' + reviewItem.id}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <CheckCircle2 size={14} /> Akzeptieren
              </button>
              <button
                onClick={() => reviewFeedback(reviewItem.id, 'rejected')}
                disabled={actionLoading === 'review-' + reviewItem.id}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
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
              <button onClick={() => setEditUser(null)} className="text-slate-500 hover:text-slate-300">
                <X size={16} />
              </button>
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
                <label className="text-xs text-slate-400 block mb-1.5">Neues Passwort <span className="text-slate-600">(leer lassen = nicht ändern)</span></label>
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
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
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
