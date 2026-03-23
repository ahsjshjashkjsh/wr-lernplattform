'use client'
import { useEffect, useState } from 'react'
import { Shield, Trash2, Crown, Users, BarChart2, BookOpen, Ban, UserPlus, Pencil, X, Check, Eye, EyeOff, RefreshCw } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isBanned: boolean
  createdAt: string
  _count: { quizAttempts: number; progress: number }
  quizAttempts: { completedAt: string }[]
}

type Tab = 'users' | 'create'

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

  async function loadUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

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
          { icon: BookOpen, label: 'Kapitel besucht', value: totalProgress, color: '#8b5cf6' },
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
        {([['users', Users, 'Benutzer'], ['create', UserPlus, 'Neuer Account']] as const).map(([t, Icon, label]) => (
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
                  <div className="hidden md:flex flex-col gap-0.5 text-xs text-slate-500 text-right">
                    <span>{user._count.quizAttempts} Quiz · {user._count.progress} Kapitel</span>
                    <span>
                      {user.quizAttempts[0]
                        ? `Aktiv: ${new Date(user.quizAttempts[0].completedAt).toLocaleDateString('de-CH')}`
                        : `Seit: ${new Date(user.createdAt).toLocaleDateString('de-CH')}`}
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
