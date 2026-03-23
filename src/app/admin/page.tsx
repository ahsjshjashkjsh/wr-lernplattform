'use client'
import { useEffect, useState } from 'react'
import { Shield, Trash2, Crown, Users, BarChart2, BookOpen } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  createdAt: string
  _count: { quizAttempts: number; progress: number }
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function loadUsers() {
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function toggleAdmin(userId: string, current: boolean) {
    setActionLoading(userId + '-admin')
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isAdmin: !current }),
    })
    await loadUsers()
    setActionLoading(null)
  }

  async function deleteUser(userId: string) {
    setActionLoading(userId + '-delete')
    await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' })
    await loadUsers()
    setActionLoading(null)
    setConfirmDelete(null)
  }

  const totalQuizAttempts = users.reduce((s, u) => s + u._count.quizAttempts, 0)
  const totalProgress = users.reduce((s, u) => s + u._count.progress, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
        >
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Benutzerverwaltung & Statistiken</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: 'Benutzer', value: users.length, color: '#3b82f6' },
          { icon: BarChart2, label: 'Quiz-Versuche', value: totalQuizAttempts, color: '#10b981' },
          { icon: BookOpen, label: 'Kapitel besucht', value: totalProgress, color: '#8b5cf6' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass rounded-2xl p-4 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} style={{ color }} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">{value}</div>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="glass rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-semibold text-slate-200">Alle Benutzer</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Lade...</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {users.map(user => (
              <div key={user.id} className="px-5 py-4 flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{ background: user.isAdmin ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(99,102,241,0.2)', color: user.isAdmin ? 'white' : '#818cf8' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">{user.name}</span>
                    {user.isAdmin && (
                      <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                        <Crown size={10} /> Admin
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex gap-4 text-xs text-slate-500">
                  <span>{user._count.quizAttempts} Quiz</span>
                  <span>{user._count.progress} Kapitel</span>
                  <span>{new Date(user.createdAt).toLocaleDateString('de-CH')}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAdmin(user.id, user.isAdmin)}
                    disabled={actionLoading === user.id + '-admin'}
                    title={user.isAdmin ? 'Admin entfernen' : 'Zum Admin machen'}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                    style={{
                      background: user.isAdmin ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                      color: user.isAdmin ? '#f59e0b' : '#64748b',
                    }}
                  >
                    <Crown size={14} />
                  </button>

                  {confirmDelete === user.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={actionLoading === user.id + '-delete'}
                        className="text-xs px-2 py-1 rounded-lg font-medium disabled:opacity-40"
                        style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                      >
                        Löschen
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}
                      >
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      title="Benutzer löschen"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
