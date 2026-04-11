'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Shield, Trash2, Crown, Users, BarChart2, Ban, UserPlus, Pencil, X, Check, Eye, EyeOff, RefreshCw, MessageSquare, CheckCircle2, XCircle, Clock, Bug, Lightbulb, FileText, HelpCircle, Wifi, WifiOff, Globe, Activity, Send, Bell, UserCheck, UserX, Tag, Plus, Copy, Lock, TrendingUp, TrendingDown, Calculator, BookMarked, Star } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface AdminUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isBanned: boolean
  isApproved: boolean
  isPremium: boolean
  premiumUntil: string | null
  buchungstrainerRole: boolean
  isAyri: boolean
  isCreator: boolean
  createdAt: string
  lastOnline: string | null
  lastIp: string | null
  _count: { quizAttempts: number; progress: number }
  quizAttempts: { completedAt: string; scorePercent: number }[]
  progress: { bestScore: number | null; status: string }[]
}

interface ActivityLog {
  id: string
  userName: string
  action: string
  detail: string | null
  page: string
  createdAt: string
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

interface PremiumRequestItem {
  id: string
  code: string
  status: string
  createdAt: string
  user: { id: string; name: string; email: string; isPremium: boolean; premiumUntil: string | null }
}

type Tab = 'pending' | 'users' | 'create' | 'feedback' | 'messages' | 'log' | 'premium' | 'codes' | 'buchhaltung' | 'msglog'

interface AccountingEntry {
  id: string
  typ: string
  beschreibung: string
  betrag: number
  datum: string
  kategorie: string | null
  wiederkehrend: boolean
  createdAt: string
}

// Online = lastOnline innerhalb der letzten 75s (60s Aktivitätsfenster + 15s Puffer)
function isOnline(lastOnline: string | null) {
  if (!lastOnline) return false
  return Date.now() - new Date(lastOnline).getTime() < 75_000
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
  const { user: me, loading: authLoading } = useAuth()
  const isCreator = me?.isCreator ?? false
  const isCreatorRef = useRef(isCreator)
  useEffect(() => { isCreatorRef.current = isCreator }, [isCreator])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [bannedIps, setBannedIps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('pending')
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
  const [premiumFilter, setPremiumFilter] = useState<'all' | 'premium' | 'free'>('all')
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'implemented'>('all')
  const [reviewItem, setReviewItem] = useState<FeedbackItem | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [banModal, setBanModal] = useState<AdminUser | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [msgText, setMsgText] = useState('')
  const [msgTarget, setMsgTarget] = useState<string>('all')
  const [msgShowSender, setMsgShowSender] = useState(true)
  const [msgSending, setMsgSending] = useState(false)
  const [msgSent, setMsgSent] = useState(false)

  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [premiumRequests, setPremiumRequests] = useState<PremiumRequestItem[]>([])
  const [promoCodes, setPromoCodes] = useState<{ id: string; code: string; usedAt: string | null; usedBy: { name: string; email: string } | null; createdAt: string }[]>([])
  const [promoGenerating, setPromoGenerating] = useState(false)
  const [promoCopied, setPromoCopied] = useState<string | null>(null)

  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([])
  function localNow() {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }
  const [buchForm, setBuchForm] = useState({ typ: 'ertrag', beschreibung: '', betrag: '', datum: localNow(), kategorie: '', waehrung: 'chf', kurs: '0.80', wiederkehrend: false })
  const [buchSaving, setBuchSaving] = useState(false)
  const [buchDeleting, setBuchDeleting] = useState<string | null>(null)
  const [buchEditEntry, setBuchEditEntry] = useState<AccountingEntry | null>(null)
  const [buchEditForm, setBuchEditForm] = useState({ typ: 'ertrag', beschreibung: '', betrag: '', datum: '', kategorie: '', waehrung: 'chf', kurs: '0.80', wiederkehrend: false })
  const [buchEditSaving, setBuchEditSaving] = useState(false)

  type MsgLogReply = { id: string; userName: string; content: string; createdAt: string }
  type MsgLogEntry = { id: string; message: string; senderName: string | null; showSender: boolean; targetName: string | null; seenCount: number; replies: MsgLogReply[]; createdAt: string; expired: boolean }
  const [msgLog, setMsgLog] = useState<MsgLogEntry[]>([])
  async function loadMsgLog() {
    const res = await fetch('/api/admin/messages/log')
    if (res.ok) { const data = await res.json(); setMsgLog(data.messages) }
  }

  const loadUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setBannedIps(prev => JSON.stringify(prev) === JSON.stringify(data.bannedIps ?? []) ? prev : data.bannedIps ?? [])
      setLastRefresh(new Date())
    }
    if (!silent) setLoading(false)
  }, [])

  async function loadFeedback() {
    const res = await fetch('/api/feedback')
    if (res.ok) {
      const data = await res.json()
      setFeedback(prev => JSON.stringify(prev) === JSON.stringify(data.feedback) ? prev : data.feedback)
    }
  }

  async function loadLogs() {
    const res = await fetch('/api/activity')
    if (res.ok) {
      const data = await res.json()
      setActivityLogs(prev => JSON.stringify(prev) === JSON.stringify(data.logs) ? prev : data.logs)
    }
  }

  async function loadPremiumRequests() {
    const res = await fetch('/api/admin/premium')
    if (res.ok) { const data = await res.json(); setPremiumRequests(data.requests) }
  }

  async function loadPromoCodes() {
    const res = await fetch('/api/admin/promo-codes')
    if (res.ok) { const data = await res.json(); setPromoCodes(data.codes) }
  }

  async function generatePromoCode() {
    setPromoGenerating(true)
    await fetch('/api/admin/promo-codes', { method: 'POST' })
    await loadPromoCodes()
    setPromoGenerating(false)
  }

  async function loadBuchhaltung() {
    const res = await fetch('/api/admin/buchhaltung')
    if (res.ok) { const data = await res.json(); setAccountingEntries(data.entries) }
  }

  async function addBuchEntry() {
    if (!buchForm.beschreibung || !buchForm.betrag) return
    setBuchSaving(true)
    const chfBetrag = buchForm.waehrung === 'usd'
      ? (parseFloat(buchForm.betrag) * parseFloat(buchForm.kurs || '0.80')).toFixed(2)
      : buchForm.betrag
    await fetch('/api/admin/buchhaltung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...buchForm,
        betrag: chfBetrag,
        datum: new Date(buchForm.datum).toISOString(),
      }),
    })
    await loadBuchhaltung()
    setBuchForm(f => ({ typ: f.typ, beschreibung: '', betrag: '', datum: localNow(), kategorie: '', waehrung: f.waehrung, kurs: f.kurs, wiederkehrend: false }))
    setBuchSaving(false)
  }

  async function deleteBuchEntry(id: string) {
    setBuchDeleting(id)
    await fetch('/api/admin/buchhaltung', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await loadBuchhaltung()
    setBuchDeleting(null)
  }

  function openBuchEdit(entry: AccountingEntry) {
    setBuchEditEntry(entry)
    const d = new Date(entry.datum)
    const localDatum = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setBuchEditForm({
      typ: entry.typ,
      beschreibung: entry.beschreibung,
      betrag: entry.betrag.toString(),
      datum: localDatum,
      kategorie: entry.kategorie ?? '',
      waehrung: 'chf',
      kurs: '0.80',
      wiederkehrend: entry.wiederkehrend,
    })
  }

  async function saveBuchEdit() {
    if (!buchEditEntry) return
    setBuchEditSaving(true)
    const chfBetrag = buchEditForm.waehrung === 'usd'
      ? (parseFloat(buchEditForm.betrag) * parseFloat(buchEditForm.kurs || '0.80')).toFixed(2)
      : buchEditForm.betrag
    await fetch('/api/admin/buchhaltung', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: buchEditEntry.id,
        ...buchEditForm,
        betrag: chfBetrag,
        datum: new Date(buchEditForm.datum).toISOString(),
      }),
    })

    await loadBuchhaltung()
    setBuchEditEntry(null)
    setBuchEditSaving(false)
  }

  function copyPromoCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {})
    setPromoCopied(code)
    setTimeout(() => setPromoCopied(null), 2000)
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

  async function deleteFeedback(id: string) {
    setActionLoading('delete-' + id)
    await fetch(`/api/feedback?id=${id}`, { method: 'DELETE' })
    setFeedback(prev => prev.filter(f => f.id !== id))
    setActionLoading(null)
  }

  async function approvePremium(id: string) {
    setActionLoading('premium-' + id)
    await fetch(`/api/admin/premium/${id}/approve`, { method: 'POST' })
    await loadPremiumRequests()
    setActionLoading(null)
  }

  async function rejectPremium(id: string) {
    setActionLoading('premium-' + id)
    await fetch(`/api/admin/premium/${id}/reject`, { method: 'POST' })
    await loadPremiumRequests()
    setActionLoading(null)
  }

  // Creator-only data: load once when isCreator becomes true
  useEffect(() => {
    if (isCreator) {
      loadPremiumRequests()
      loadPromoCodes()
      loadBuchhaltung()
    }
  }, [isCreator]) // eslint-disable-line react-hooks/exhaustive-deps

  // Live-Polling: erster Load mit Spinner, danach alle 3s still
  useEffect(() => {
    loadUsers()
    loadFeedback()
    loadLogs()
    if (isCreatorRef.current) {
      loadPremiumRequests()
      loadPromoCodes()
    }
    const interval = setInterval(() => {
      loadUsers(true)
      loadFeedback()
      loadLogs()
      if (isCreatorRef.current) loadPremiumRequests()
    }, 3_000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isPremiumActive = (u: AdminUser) =>
    u.isPremium && !!u.premiumUntil && new Date(u.premiumUntil) > new Date()

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.lastIp ?? '').includes(search)
    const matchPremium =
      premiumFilter === 'all' ? true :
      premiumFilter === 'premium' ? isPremiumActive(u) :
      !isPremiumActive(u)
    return matchSearch && matchPremium
  }).sort((a, b) => {
    const aOnline = isOnline(a.lastOnline) ? 1 : 0
    const bOnline = isOnline(b.lastOnline) ? 1 : 0
    if (bOnline !== aOnline) return bOnline - aOnline
    return new Date(b.lastOnline ?? 0).getTime() - new Date(a.lastOnline ?? 0).getTime()
  })

  const totalQuiz = users.reduce((s, u) => s + u._count.quizAttempts, 0)
  const banned = users.filter(u => u.isBanned).length
  const online = users.filter(u => isOnline(u.lastOnline)).length
  const pendingFeedback = feedback.filter(f => f.status === 'pending').length
  const avgScore = (() => {
    const all = users.flatMap(u => u.quizAttempts.map(a => a.scorePercent))
    return all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0
  })()

  // Benutzerwachstum: letzte 30 Tage kumuliert
  const growthData = (() => {
    const days = 30
    const now = Date.now()
    const points: { label: string; total: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = now - i * 86_400_000
      const label = new Date(dayStart).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })
      const total = users.filter(u => new Date(u.createdAt ?? 0).getTime() <= dayStart).length
      points.push({ label, total })
    }
    return points
  })()
  // Neueste Seite pro User-Name aus den Activity-Logs
  const lastPageByName: Record<string, string> = {}
  for (const log of [...activityLogs].reverse()) {
    lastPageByName[log.userName] = log.page
  }

  const filteredFeedback = feedbackFilter === 'all'
    ? feedback.filter(f => f.status === 'pending')
    : feedback.filter(f => f.status === feedbackFilter)

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
  }

  if (!authLoading && !me?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Shield size={32} style={{ color: 'var(--text-muted)' }} className="opacity-30" />
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Kein Zugriff</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Shield size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">HMS-Plattform · Verwaltung & Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            {online} online
          </div>
          {lastRefresh && (
            <span className="text-[10px] text-slate-600 hidden sm:block">
              aktualisiert {lastRefresh.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button onClick={() => { loadUsers(true); loadFeedback() }} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-80" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { icon: Users,        label: 'Benutzer',      value: users.length,    color: '#3b82f6', sub: `+${users.filter(u => Date.now() - new Date(u.createdAt).getTime() < 7*86400000).length} diese Woche` },
          { icon: Activity,     label: 'Online',        value: online,          color: '#22c55e', sub: 'aktiv in letzter Minute' },
          { icon: BarChart2,    label: 'Quiz-Attempts', value: totalQuiz,       color: '#a855f7', sub: `Ø ${avgScore}% Score` },
          { icon: Ban,          label: 'Gesperrt',      value: banned,          color: '#ef4444', sub: `${bannedIps.length} IPs blockiert` },
          { icon: MessageSquare,label: 'Feedback',      value: pendingFeedback, color: '#f59e0b', sub: 'offen' },
        ].map(({ icon: Icon, label, value, color, sub }) => (
          <div key={label} className="glass rounded-2xl p-4 border relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">{label}</span>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={12} style={{ color }} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-100">{value}</div>
            <p className="text-[10px] text-slate-600 mt-1 truncate">{sub}</p>
          </div>
        ))}
      </div>

      {/* Growth Chart */}
      {growthData.length > 0 && (() => {
        const W = 800, H = 140, PAD = { t: 16, r: 20, b: 32, l: 36 }
        const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b
        const maxV = Math.max(...growthData.map(d => d.total), 1)
        const pts = growthData.map((d, i) => ({
          x: PAD.l + (i / (growthData.length - 1)) * iW,
          y: PAD.t + iH - (d.total / maxV) * iH,
          ...d,
        }))
        const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
        const areaD = `${pathD} L${pts[pts.length-1].x.toFixed(1)},${(PAD.t+iH).toFixed(1)} L${PAD.l},${(PAD.t+iH).toFixed(1)} Z`
        const labels = pts.filter((_, i) => i === 0 || i === pts.length - 1 || i % 7 === 0)
        const gridLines = [0, 0.25, 0.5, 0.75, 1].map(r => ({ y: PAD.t + iH - r * iH, v: Math.round(r * maxV) }))
        return (
          <div className="glass rounded-2xl border mb-5 overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Benutzerwachstum</h3>
                <p className="text-xs text-slate-500">Letzte 30 Tage · kumuliert</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#3b82f6' }}>
                <Users size={12}/> {users.length} total
              </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {gridLines.map(gl => (
                <g key={gl.y}>
                  <line x1={PAD.l} y1={gl.y} x2={W - PAD.r} y2={gl.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                  <text x={PAD.l - 6} y={gl.y + 4} fill="#334155" fontSize="9" textAnchor="end">{gl.v}</text>
                </g>
              ))}
              {/* Area */}
              <path d={areaD} fill="url(#chartGrad)"/>
              {/* Line */}
              <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
              {/* X labels */}
              {labels.map(p => (
                <text key={p.x} x={p.x} y={H - 8} fill="#334155" fontSize="9" textAnchor="middle">{p.label}</text>
              ))}
              {/* Last point dot */}
              <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="4" fill="#3b82f6" stroke="#1e293b" strokeWidth="2"/>
            </svg>
          </div>
        )
      })()}

      {/* Insights row */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Neuste Benutzer */}
          <div className="glass rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <UserPlus size={11}/> Neu registriert
            </h3>
            <div className="space-y-2">
              {[...users].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,5).map(u => (
                <div key={u.id} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                    {u.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-300 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-600 truncate">{new Date(u.createdAt).toLocaleDateString('de-CH')}</p>
                  </div>
                  {isOnline(u.lastOnline) && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"/>}
                </div>
              ))}
            </div>
          </div>

          {/* Top aktive Benutzer */}
          <div className="glass rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <BarChart2 size={11}/> Aktivste Benutzer
            </h3>
            <div className="space-y-2">
              {[...users].filter(u => !u.isAdmin).sort((a,b) => (b._count.quizAttempts + b._count.progress) - (a._count.quizAttempts + a._count.progress)).slice(0,5).map((u, i) => {
                const score = u._count.quizAttempts + u._count.progress
                const maxScore = Math.max(...users.filter(x => !x.isAdmin).map(x => x._count.quizAttempts + x._count.progress), 1)
                const pct = Math.round((score / maxScore) * 100)
                return (
                  <div key={u.id} className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black text-slate-600 w-4 shrink-0">#{i+1}</span>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-300 truncate">{u.name}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-500">{u._count.quizAttempts} Quiz</span>
                          <span className="text-[10px] text-slate-700">·</span>
                          <span className="text-[10px] text-violet-400">{u._count.progress} Kapitel</span>
                        </div>
                      </div>
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#a855f7)' }}/>
                      </div>
                    </div>
                  </div>
                )
              })}
              {users.filter(u => !u.isAdmin && u._count.quizAttempts === 0 && u._count.progress === 0).length > 0 && (
                <p className="text-[10px] text-slate-600 pt-1">{users.filter(u => !u.isAdmin && u._count.quizAttempts === 0 && u._count.progress === 0).length} Benutzer noch nicht aktiv</p>
              )}
            </div>
          </div>
        </div>
      )}

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
      <div className="flex gap-2 mb-4 flex-wrap">
        {([['pending', Clock, `Anfragen${users.filter(u => !u.isApproved).length > 0 ? ` (${users.filter(u => !u.isApproved).length})` : ''}`], ['users', Users, 'Benutzer'], ['create', UserPlus, 'Neuer Account'], ['feedback', MessageSquare, `Feedback${pendingFeedback > 0 ? ` (${pendingFeedback})` : ''}`], ['messages', Bell, 'Nachrichten'], ['log', Activity, `Live-Log${activityLogs.length > 0 ? ` (${activityLogs.length})` : ''}`]] as const).map(([t, Icon, label]) => (
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
        {isCreator && (
          <button
            onClick={() => setTab('premium')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              tab === 'premium'
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                : 'border-transparent hover:bg-amber-500/10 hover:text-amber-400'
            }`}
            style={tab === 'premium' ? {} : { color: 'var(--text-muted)' }}
          >
            <Crown size={13} />
            Premium
            {premiumRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {premiumRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        )}
        {isCreator && (
          <button
            onClick={() => { setTab('codes'); loadPromoCodes() }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              tab === 'codes'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'border-transparent hover:bg-emerald-500/10 hover:text-emerald-400'
            }`}
            style={tab === 'codes' ? {} : { color: 'var(--text-muted)' }}
          >
            <Tag size={13} />
            Rabattcodes
          </button>
        )}
        {isCreator && (
          <button
            onClick={() => { setTab('buchhaltung'); loadBuchhaltung() }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              tab === 'buchhaltung'
                ? 'border-violet-500/20 bg-violet-500/10 text-violet-400'
                : 'border-transparent hover:bg-violet-500/10 hover:text-violet-400'
            }`}
            style={tab === 'buchhaltung' ? {} : { color: 'var(--text-muted)' }}
          >
            <Calculator size={13} />
            Buchhaltung
          </button>
        )}
        {isCreator && (
          <button
            onClick={() => { setTab('msglog'); loadMsgLog() }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              tab === 'msglog'
                ? 'border-sky-500/20 bg-sky-500/10 text-sky-400'
                : 'border-transparent hover:bg-sky-500/10 hover:text-sky-400'
            }`}
            style={tab === 'msglog' ? {} : { color: 'var(--text-muted)' }}
          >
            <Send size={13} />
            Nachrichten-Log
          </button>
        )}
      </div>

      {/* === TAB: PENDING === */}
      {tab === 'pending' && (
        <div className="glass rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Clock size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">Ausstehende Registrierungen</span>
          </div>
          {users.filter(u => !u.isApproved).length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">Keine ausstehenden Anfragen.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {users.filter(u => !u.isApproved).map(u => (
                <div key={u.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Registriert {timeAgo(u.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => patch(u.id, { isApproved: true }, u.id + '-approve')}
                      disabled={actionLoading === u.id + '-approve'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
                    >
                      <UserCheck size={13} /> Genehmigen
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      disabled={actionLoading === u.id + '-del'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                    >
                      <UserX size={13} /> Ablehnen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === TAB: USERS === */}
      {tab === 'users' && (
        <div className="glass rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-3 border-b flex flex-wrap items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <input
              type="text"
              placeholder="Name, E-Mail oder IP suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-0 px-3 py-1.5 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
            {/* Premium-Filter */}
            <div className="flex items-center gap-1 shrink-0">
              {(['all', 'premium', 'free'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setPremiumFilter(f)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={premiumFilter === f ? {
                    background: f === 'premium' ? 'rgba(245,158,11,0.2)' : f === 'free' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.1)',
                    color: f === 'premium' ? '#fbbf24' : f === 'free' ? '#818cf8' : '#cbd5e1',
                    border: `1px solid ${f === 'premium' ? 'rgba(245,158,11,0.35)' : f === 'free' ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.15)'}`,
                  } : {
                    background: 'transparent',
                    color: '#475569',
                    border: '1px solid transparent',
                  }}
                >
                  {f === 'all' ? 'Alle' : f === 'premium' ? '👑 Premium' : 'Gratis'}
                </button>
              ))}
            </div>
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
                          {user.isPremium && (
                            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                              <Crown size={9} /> Premium
                            </span>
                          )}
                          {user.buchungstrainerRole && (
                            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                              <BookMarked size={9} /> Trainer
                            </span>
                          )}
                          {user.isAyri && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                              Ayri
                            </span>
                          )}
                          {user.isCreator && (
                            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-bold" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                              <Star size={9} /> Creator
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
                            {online
                              ? lastPageByName[user.name]
                                ? <><span style={{ color: '#22c55e' }}>●</span> {lastPageByName[user.name]}</>
                                : 'Gerade aktiv'
                              : `Zuletzt: ${timeAgo(user.lastOnline)}`}
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
                          disabled={actionLoading === user.id + '-admin' || user.isCreator}
                          title={user.isCreator ? 'Creator — Rollen gesperrt' : user.isAdmin ? 'Admin entfernen' : 'Zum Admin machen'}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                          style={{ background: user.isAdmin ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', color: user.isAdmin ? '#f59e0b' : '#64748b' }}
                        >
                          <Crown size={13} />
                        </button>

                        <button
                          onClick={() => patch(user.id, { buchungstrainerRole: !user.buchungstrainerRole } as any, user.id + '-trainer')}
                          disabled={actionLoading === user.id + '-trainer' || user.isCreator}
                          title={user.isCreator ? 'Creator — Rollen gesperrt' : user.buchungstrainerRole ? 'Trainer-Rolle entfernen' : 'Buchungstrainer-Rolle vergeben'}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                          style={{ background: user.buchungstrainerRole ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', color: user.buchungstrainerRole ? '#818cf8' : '#64748b' }}
                        >
                          <BookMarked size={13} />
                        </button>
                        {isCreator && (
                          <button
                            onClick={() => patch(user.id, { isAyri: !user.isAyri } as any, user.id + '-ayri')}
                            disabled={actionLoading === user.id + '-ayri' || user.isCreator}
                            title={user.isCreator ? 'Creator — Rollen gesperrt' : user.isAyri ? 'Ayri-Rolle entfernen' : 'Ayri-Rolle vergeben'}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 text-xs font-black"
                            style={{ background: user.isAyri ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)', color: user.isAyri ? '#f87171' : '#64748b' }}
                          >
                            A
                          </button>
                        )}
                        {isCreator && (
                          <button
                            onClick={() => patch(user.id, { isCreator: !user.isCreator } as any, user.id + '-creator')}
                            disabled={actionLoading === user.id + '-creator'}
                            title={user.isCreator ? 'Creator-Rolle entfernen' : 'Creator-Rolle vergeben'}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                            style={{ background: user.isCreator ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)', color: user.isCreator ? '#fbbf24' : '#64748b' }}
                          >
                            <Star size={13} />
                          </button>
                        )}

                        {user.isPremium && !user.isCreator && (
                          <button
                            onClick={() => patch(user.id, { isPremium: false } as any, user.id + '-premium')}
                            disabled={actionLoading === user.id + '-premium'}
                            title="Premium entfernen"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                            style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}
                          >
                            <Lock size={13} />
                          </button>
                        )}

                        {!user.isCreator && (user.isBanned ? (
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
                        ))}

                        {!user.isCreator && (confirmDelete === user.id ? (
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
                        ))}
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
                        <p className="text-sm text-slate-300 whitespace-pre-wrap break-all line-clamp-6">{item.message}</p>
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
                        <button onClick={() => deleteFeedback(item.id)}
                          disabled={actionLoading === 'delete-' + item.id}
                          className="mt-3 ml-2 p-1.5 rounded-lg transition-all hover:bg-red-500/10 disabled:opacity-40"
                          title="Feedback löschen"
                          style={{ color: '#f87171' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* === TAB: MESSAGES === */}
      {tab === 'messages' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl border p-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Bell size={14} className="text-violet-400" /> Nachricht senden
            </h3>

            <div className="space-y-3">
              {/* Empfänger */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Empfänger</label>
                <select
                  value={msgTarget}
                  onChange={e => setMsgTarget(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                >
                  <option value="all">Alle Benutzer</option>
                  {users.filter(u => !u.isBanned && !u.isAdmin).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email}){isOnline(u.lastOnline) ? ' 🟢' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Nachricht */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Nachricht</label>
                <textarea
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  placeholder="Schreibe deine Nachricht..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex items-center gap-4">
                {/* Absender-Auswahl */}
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setMsgShowSender(true)}
                    className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border"
                    style={{
                      background: msgShowSender ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                      borderColor: msgShowSender ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)',
                      color: msgShowSender ? '#a78bfa' : '#64748b',
                    }}
                  >
                    <Shield size={13} />
                    Als Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsgShowSender(false)}
                    className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border"
                    style={{
                      background: !msgShowSender ? 'rgba(100,116,139,0.15)' : 'rgba(255,255,255,0.03)',
                      borderColor: !msgShowSender ? 'rgba(100,116,139,0.4)' : 'rgba(255,255,255,0.08)',
                      color: !msgShowSender ? '#94a3b8' : '#64748b',
                    }}
                  >
                    <MessageSquare size={13} />
                    Anonym
                  </button>
                </div>
              </div>

              <button
                disabled={!msgText.trim() || msgSending}
                onClick={async () => {
                  if (!msgText.trim()) return
                  setMsgSending(true)
                  try {
                    await fetch('/api/admin/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ message: msgText, targetUserId: msgTarget === 'all' ? null : msgTarget, showSender: msgShowSender }),
                    })
                    setMsgText('')
                    setMsgShowSender(true)
                    setMsgSent(true)
                    setTimeout(() => setMsgSent(false), 3000)
                  } finally {
                    setMsgSending(false)
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
              >
                <Send size={14} />
                {msgSending ? 'Senden...' : 'Nachricht senden'}
              </button>

              {msgSent && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <Check size={14} /> Nachricht gesendet — erscheint beim Nutzer als Popup.
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-3 rounded-xl text-xs text-slate-500" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            Das Popup schliesst sich automatisch nach 10 Sekunden. Online-Nutzer sehen es sofort, offline Nutzer beim nächsten Login (max. 1h).
          </div>
        </div>
      )}

      {/* === TAB: LOG === */}
      {tab === 'log' && (
        <div className="glass rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <Activity size={14} style={{ color: '#22c55e' }} />
              <span className="text-sm font-semibold text-slate-200">Live-Aktivitäten</span>
            </div>
            <span className="text-xs text-slate-500">letzte 60 Aktionen · alle 3s aktualisiert</span>
          </div>
          {activityLogs.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-600 text-sm">Noch keine Aktivitäten erfasst.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {activityLogs.map((log, i) => {
                const diffMs = Date.now() - new Date(log.createdAt).getTime()
                const mins = Math.floor(diffMs / 60_000)
                const secs = Math.floor(diffMs / 1_000)
                const when = secs < 60 ? `vor ${secs}s` : mins < 60 ? `vor ${mins} Min.` : timeAgo(log.createdAt)
                const isRecent = secs < 30
                return (
                  <div key={log.id} className="px-5 py-3 flex items-start gap-3" style={{ background: i === 0 ? 'rgba(34,197,94,0.03)' : undefined }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5"
                      style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                      {log.userName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-200">{log.userName}</span>
                        <span className="text-sm text-slate-400">{log.action}</span>
                        {log.detail && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}>
                            {log.detail}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-600">{log.page}</span>
                        <span className="text-[10px] text-slate-700">·</span>
                        <span className={`text-[10px] font-medium ${isRecent ? 'text-green-500' : 'text-slate-600'}`}>
                          {when}
                        </span>
                        {isRecent && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* === TAB: PREMIUM === */}
      {tab === 'premium' && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Premium-Anfragen
          </h2>
          {premiumRequests.length === 0 && (
            <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
              Keine Anfragen vorhanden.
            </p>
          )}
          {premiumRequests.map(req => (
            <div
              key={req.id}
              className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-amber-400">{req.code}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    req.status === 'pending'  ? 'bg-yellow-500/15 text-yellow-400' :
                    req.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>
                    {req.status === 'pending' ? 'Offen' : req.status === 'approved' ? 'Freigeschalten' : 'Abgelehnt'}
                  </span>
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {req.user.name} — {req.user.email}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {new Date(req.createdAt).toLocaleDateString('de-CH')}
                  {req.user.premiumUntil && ` · Premium bis ${new Date(req.user.premiumUntil).toLocaleDateString('de-CH')}`}
                </p>
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approvePremium(req.id)}
                    disabled={actionLoading === 'premium-' + req.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
                  >
                    <Check size={12} />
                    Freischalten
                  </button>
                  <button
                    onClick={() => rejectPremium(req.id)}
                    disabled={actionLoading === 'premium-' + req.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                  >
                    <X size={12} />
                    Ablehnen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* === TAB: RABATTCODES === */}
      {tab === 'codes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Rabattcodes — 1 Monat gratis
            </h2>
            <button
              onClick={generatePromoCode}
              disabled={promoGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}
            >
              <Plus size={13} />
              {promoGenerating ? 'Wird erstellt...' : 'Neuen Code generieren'}
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Jeder Code gewährt 1 Monat kostenlosen Premium-Zugang und ist nur einmal verwendbar.
          </p>
          {promoCodes.length === 0 && (
            <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
              Noch keine Codes generiert.
            </p>
          )}
          <div className="space-y-2">
            {promoCodes.map(promo => (
              <div
                key={promo.id}
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  background: promo.usedBy ? 'rgba(255,255,255,0.02)' : 'rgba(52,211,153,0.04)',
                  border: `1px solid ${promo.usedBy ? 'var(--border-color)' : 'rgba(52,211,153,0.2)'}`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <span className={`font-mono text-sm font-bold tracking-widest ${promo.usedBy ? 'line-through opacity-40' : 'text-emerald-400'}`}>
                    {promo.code}
                  </span>
                  {promo.usedBy && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Verwendet von {promo.usedBy.name} ({promo.usedBy.email}) · {new Date(promo.usedAt!).toLocaleDateString('de-CH')}
                    </p>
                  )}
                  {!promo.usedBy && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Erstellt am {new Date(promo.createdAt).toLocaleDateString('de-CH')} · noch nicht verwendet
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    promo.usedBy ? 'bg-slate-500/15 text-slate-400' : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {promo.usedBy ? 'Verwendet' : 'Verfügbar'}
                  </span>
                  {!promo.usedBy && (
                    <button
                      onClick={() => copyPromoCode(promo.code)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
                      style={{
                        background: promoCopied === promo.code ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                        color: promoCopied === promo.code ? '#4ade80' : 'var(--text-muted)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {promoCopied === promo.code ? <Check size={11} /> : <Copy size={11} />}
                      {promoCopied === promo.code ? 'Kopiert' : 'Kopieren'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === TAB: BUCHHALTUNG === */}
      {tab === 'buchhaltung' && (() => {
        const ertraege        = accountingEntries.filter(e => e.typ === 'ertrag').reduce((s, e) => s + e.betrag, 0)
        const aufwaende       = accountingEntries.filter(e => e.typ === 'aufwand').reduce((s, e) => s + e.betrag, 0)
        const einlagen        = accountingEntries.filter(e => e.typ === 'einlage').reduce((s, e) => s + e.betrag, 0)
        const ergebnis        = ertraege - aufwaende
        const kassenbestand   = einlagen + ertraege - aufwaende

        // Unterscheidung: Fixkosten (monatl.) vs. einmalige Aufwände
        const fixkostenEntries   = accountingEntries.filter(e => e.typ === 'aufwand' && e.wiederkehrend)
        const einmaligeEntries   = accountingEntries.filter(e => e.typ === 'aufwand' && !e.wiederkehrend)
        const fixkostenTotal     = fixkostenEntries.reduce((s, e) => s + e.betrag, 0)
        const einmaligeTotal     = einmaligeEntries.reduce((s, e) => s + e.betrag, 0)

        // Monatlicher Burn = nur Fixkosten (Subscriptions)
        const monthlyBurn = (() => {
          if (fixkostenEntries.length === 0) return 0
          if (fixkostenEntries.length < 2) return fixkostenEntries[0].betrag
          const dates = fixkostenEntries.map(e => new Date(e.datum).getTime())
          const days  = Math.max(1, (Math.max(...dates) - Math.min(...dates)) / 86_400_000)
          return (fixkostenTotal / days) * 30
        })()

        const premiumPreis   = parseFloat(process.env.NEXT_PUBLIC_PREMIUM_PRICE ?? '5')
        const aktivePremium  = users.filter(u => u.isPremium).length
        const monatlicheErl  = aktivePremium * premiumPreis

        const neededUsers      = Math.ceil(monthlyBurn / premiumPreis)
        const breakevenPct     = Math.min(100, neededUsers > 0 ? (aktivePremium / neededUsers) * 100 : 0)
        const monthlyDefizit   = Math.max(0, monthlyBurn - monatlicheErl)
        const monthsLeft       = monthlyDefizit > 0 && kassenbestand > 0 ? kassenbestand / monthlyDefizit : null

        const fmt = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' CHF'
        const iStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }

        return (
          <div className="space-y-4">

            {/* ── HERO: Kassenbestand ── */}
            <div className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{
              background: kassenbestand >= 0 ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
              border: `1px solid ${kassenbestand >= 0 ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.22)'}`,
            }}>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: kassenbestand >= 0 ? 'rgba(52,211,153,0.6)' : 'rgba(248,113,113,0.6)' }}>
                  Kassenbestand
                </p>
                <p className="text-3xl font-bold" style={{ color: kassenbestand >= 0 ? '#10b981' : '#f87171' }}>
                  {kassenbestand < 0 ? '−' : ''}{fmt(Math.abs(kassenbestand))}
                </p>
                <p className="text-[11px] mt-1.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
                  {fmt(einlagen)} Einlagen &nbsp;+&nbsp; {fmt(ertraege)} Erlöse &nbsp;−&nbsp; {fmt(fixkostenTotal)} Fixkosten &nbsp;−&nbsp; {fmt(einmaligeTotal)} einmalige Aufwände
                </p>
              </div>
              <div className="text-right shrink-0 space-y-2">
                {monthsLeft !== null && monthsLeft > 0 && (
                  <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <p className="text-[10px] text-yellow-600 uppercase tracking-wide">Kapital reicht noch</p>
                    <p className="text-lg font-bold text-yellow-400">{monthsLeft.toFixed(1)} Monate</p>
                  </div>
                )}
                {kassenbestand < 0 && (
                  <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="text-[10px] text-red-500 uppercase tracking-wide">Nachfinanzierung nötig</p>
                    <p className="text-lg font-bold text-red-400">{fmt(Math.abs(kassenbestand))}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── KPI-Karten ── */}
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Erlöse',           ertraege,      '#34d399', 'rgba(52,211,153,0.08)',  'rgba(52,211,153,0.18)',  'Premium-Einnahmen'],
                ['Kapitaleinlagen',  einlagen,      '#a78bfa', 'rgba(139,92,246,0.08)', 'rgba(139,92,246,0.18)', 'Investiertes EK'],
              ] as const).map(([label, val, color, bg, border, sub]) => (
                <div key={label} className="rounded-2xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
                  <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color }}>{label}</p>
                  <p className="text-lg font-bold" style={{ color }}>{fmt(val)}</p>
                  <p className="text-[10px] mt-1.5" style={{ color: 'rgba(100,116,139,0.7)' }}>{sub}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: '#f87171' }}>Fixkosten</p>
                <p className="text-lg font-bold" style={{ color: '#f87171' }}>{fmt(fixkostenTotal)}</p>
                <p className="text-[10px] mt-1.5" style={{ color: 'rgba(100,116,139,0.7)' }}>Monatl. wiederkehrend</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.18)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: '#fb923c' }}>Einmalige Aufwände</p>
                <p className="text-lg font-bold" style={{ color: '#fb923c' }}>{fmt(einmaligeTotal)}</p>
                <p className="text-[10px] mt-1.5" style={{ color: 'rgba(100,116,139,0.7)' }}>Variable Kosten</p>
              </div>
              <div className="rounded-2xl p-4" style={{
                background: ergebnis >= 0 ? 'rgba(59,130,246,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${ergebnis >= 0 ? 'rgba(59,130,246,0.18)' : 'rgba(239,68,68,0.18)'}`,
              }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: ergebnis >= 0 ? '#60a5fa' : '#f87171' }}>
                  {ergebnis >= 0 ? 'Gewinn' : 'Verlust'}
                </p>
                <p className="text-lg font-bold" style={{ color: ergebnis >= 0 ? '#60a5fa' : '#f87171' }}>{fmt(Math.abs(ergebnis))}</p>
                <p className="text-[10px] mt-1.5" style={{ color: 'rgba(100,116,139,0.7)' }}>Erlöse − Aufwände</p>
              </div>
            </div>

            {/* ── Breakeven-Analyse ── */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 size={14} className="text-violet-400" />
                  <span className="text-sm font-semibold text-slate-300">Breakeven-Analyse</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {fmt(monthlyBurn)} Fixkosten/Monat
                </span>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-slate-500">{aktivePremium} von {neededUsers} Premium-Usern</span>
                  <span className="text-xs font-semibold" style={{ color: breakevenPct >= 100 ? '#34d399' : '#a78bfa' }}>
                    {breakevenPct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${breakevenPct}%`,
                      background: breakevenPct >= 100
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-1">Akt. Monatserlös</p>
                  <p className="text-base font-bold text-emerald-400">{fmt(monatlicheErl)}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{aktivePremium} × CHF {premiumPreis}</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-1">Monatl. Defizit</p>
                  <p className="text-base font-bold" style={{ color: monthlyDefizit > 0 ? '#f87171' : '#34d399' }}>
                    {fmt(monthlyDefizit)}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Kosten − Erlöse</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-1">Noch bis Break-even</p>
                  <p className="text-base font-bold text-violet-400">
                    {neededUsers - aktivePremium <= 0 ? '✓ erreicht' : `${neededUsers - aktivePremium} User`}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">à CHF {premiumPreis}/Mt.</p>
                </div>
              </div>
            </div>

            {/* ── Neuer Eintrag ── */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Neuer Eintrag</p>
              <div className="flex gap-2 mb-3">
                {([
                  ['ertrag',  'Erlös',   'rgba(52,211,153,0.15)', 'rgba(52,211,153,0.35)',  '#34d399',  TrendingUp],
                  ['aufwand', 'Aufwand', 'rgba(239,68,68,0.15)',  'rgba(239,68,68,0.35)',   '#f87171',  TrendingDown],
                  ['einlage', 'Einlage', 'rgba(139,92,246,0.15)', 'rgba(139,92,246,0.35)',  '#a78bfa',  BarChart2],
                ] as const).map(([val, label, bg, border, color, Icon]) => (
                  <button key={val}
                    onClick={() => setBuchForm(f => ({ ...f, typ: val }))}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: buchForm.typ === val ? bg : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${buchForm.typ === val ? border : 'rgba(255,255,255,0.07)'}`,
                      color: buchForm.typ === val ? color : '#334155',
                    }}
                  >
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <input type="text" value={buchForm.beschreibung}
                  onChange={e => setBuchForm(f => ({ ...f, beschreibung: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter' && buchForm.beschreibung && buchForm.betrag) addBuchEntry() }}
                  placeholder="Beschreibung..."
                  className="px-3 py-2.5 rounded-xl text-sm outline-none flex-[3] min-w-[180px]"
                  style={iStyle} />
                <div className="flex gap-1 flex-[1.5] min-w-[180px]">
                  <input type="number" min="0" step="0.05" value={buchForm.betrag}
                    onChange={e => setBuchForm(f => ({ ...f, betrag: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter' && buchForm.beschreibung && buchForm.betrag) addBuchEntry() }}
                    placeholder={buchForm.waehrung === 'usd' ? 'Betrag USD' : 'Betrag CHF'}
                    className="px-3 py-2.5 rounded-xl text-sm outline-none flex-1 min-w-0" style={iStyle} />
                  <button onClick={() => setBuchForm(f => ({ ...f, waehrung: f.waehrung === 'chf' ? 'usd' : 'chf' }))}
                    className="px-2.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all"
                    style={{ background: buchForm.waehrung === 'usd' ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${buchForm.waehrung === 'usd' ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.08)'}`, color: buchForm.waehrung === 'usd' ? '#fbbf24' : '#475569' }}>
                    {buchForm.waehrung === 'usd' ? 'USD' : 'CHF'}
                  </button>
                  {buchForm.waehrung === 'usd' && (
                    <input type="number" min="0" step="0.001" value={buchForm.kurs}
                      onChange={e => setBuchForm(f => ({ ...f, kurs: e.target.value }))}
                      placeholder="Kurs" title="USD→CHF"
                      className="px-2 py-2.5 rounded-xl text-xs outline-none w-16 shrink-0"
                      style={{ ...iStyle, color: '#fbbf24' }} />
                  )}
                </div>
                {buchForm.waehrung === 'usd' && buchForm.betrag && (
                  <div className="text-xs px-2 py-1 rounded-lg self-center shrink-0" style={{ background: 'rgba(234,179,8,0.08)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.2)' }}>
                    = {(parseFloat(buchForm.betrag || '0') * parseFloat(buchForm.kurs || '0.80')).toFixed(2)} CHF
                  </div>
                )}
                <input type="datetime-local" value={buchForm.datum}
                  onChange={e => setBuchForm(f => ({ ...f, datum: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl text-sm outline-none flex-[2] min-w-[170px]"
                  style={{ ...iStyle, colorScheme: 'dark' }} />
                <input type="text" value={buchForm.kategorie}
                  onChange={e => setBuchForm(f => ({ ...f, kategorie: e.target.value }))}
                  placeholder="Kategorie (optional)"
                  className="px-3 py-2.5 rounded-xl text-sm outline-none flex-[1.5] min-w-[140px]"
                  style={iStyle} />
                {buchForm.typ === 'aufwand' && (
                  <button type="button"
                    onClick={() => setBuchForm(f => ({ ...f, wiederkehrend: !f.wiederkehrend }))}
                    className="px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5"
                    style={{
                      background: buchForm.wiederkehrend ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${buchForm.wiederkehrend ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      color: buchForm.wiederkehrend ? '#f87171' : '#475569',
                    }}>
                    ↻ Fixkosten
                  </button>
                )}
                <button onClick={addBuchEntry}
                  disabled={buchSaving || !buchForm.beschreibung || !buchForm.betrag}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
                  style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
                  <Plus size={15} />{buchSaving ? 'Speichern...' : 'Hinzufügen'}
                </button>
              </div>
            </div>

            {/* ── Einträge-Tabelle ── */}
            {accountingEntries.length === 0 ? (
              <p className="text-xs py-8 text-center text-slate-600">Noch keine Einträge.</p>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Buchungen</span>
                  <span className="text-[11px] text-slate-700">{accountingEntries.length} Einträge</span>
                </div>
                {accountingEntries.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3 group"
                    style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                    <div className="shrink-0">
                      {entry.typ === 'ertrag'  ? <TrendingUp  size={13} className="text-emerald-500" />
                     : entry.typ === 'einlage' ? <BarChart2   size={13} className="text-violet-500"  />
                     : <TrendingDown size={13} className="text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-300">{entry.beschreibung}</span>
                      {entry.kategorie && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                          {entry.kategorie}
                        </span>
                      )}
                      {entry.typ === 'aufwand' && (
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full" style={
                          entry.wiederkehrend
                            ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
                            : { background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }
                        }>
                          {entry.wiederkehrend ? '↻ Fixkosten' : '1× einmalig'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] shrink-0 tabular-nums" style={{ color: '#334155' }}>
                      {new Date(entry.datum).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm font-bold shrink-0 w-28 text-right tabular-nums"
                      style={{ color: entry.typ === 'ertrag' ? '#34d399' : entry.typ === 'einlage' ? '#a78bfa' : '#f87171' }}>
                      {entry.typ === 'aufwand' ? '−' : '+'} {entry.betrag.toFixed(2)}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openBuchEdit(entry)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 transition-all">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => deleteBuchEntry(entry.id)} disabled={buchDeleting === entry.id}
                        className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* === BUCHHALTUNG EDIT MODAL === */}
      {buchEditEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="glass rounded-2xl border p-6 w-full max-w-md" style={{ borderColor: 'rgba(139,92,246,0.25)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-violet-400 flex items-center gap-2"><Pencil size={14} /> Eintrag bearbeiten</h2>
              <button onClick={() => setBuchEditEntry(null)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {/* Typ-Toggle */}
              <div className="flex gap-2">
                {([
                  ['ertrag',  'Erlös',   'rgba(52,211,153,0.15)', 'rgba(52,211,153,0.35)',  '#34d399', TrendingUp],
                  ['aufwand', 'Aufwand', 'rgba(239,68,68,0.15)',  'rgba(239,68,68,0.35)',   '#f87171', TrendingDown],
                  ['einlage', 'Einlage', 'rgba(139,92,246,0.15)', 'rgba(139,92,246,0.35)',  '#a78bfa', BarChart2],
                ] as const).map(([val, label, bg, border, color, Icon]) => (
                  <button key={val}
                    onClick={() => setBuchEditForm(f => ({ ...f, typ: val }))}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: buchEditForm.typ === val ? bg : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${buchEditForm.typ === val ? border : 'rgba(255,255,255,0.08)'}`,
                      color: buchEditForm.typ === val ? color : '#475569',
                    }}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Beschreibung</label>
                <input type="text" value={buchEditForm.beschreibung}
                  onChange={e => setBuchEditForm(f => ({ ...f, beschreibung: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Betrag</label>
                  <div className="flex gap-1">
                    <input type="number" min="0" step="0.05" value={buchEditForm.betrag}
                      onChange={e => setBuchEditForm(f => ({ ...f, betrag: e.target.value }))}
                      placeholder={buchEditForm.waehrung === 'usd' ? 'USD' : 'CHF'}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} />
                    <button
                      onClick={() => setBuchEditForm(f => ({ ...f, waehrung: f.waehrung === 'chf' ? 'usd' : 'chf' }))}
                      className="px-2 py-2 rounded-xl text-xs font-bold shrink-0 transition-all"
                      style={{
                        background: buchEditForm.waehrung === 'usd' ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${buchEditForm.waehrung === 'usd' ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        color: buchEditForm.waehrung === 'usd' ? '#fbbf24' : '#475569',
                      }}
                    >{buchEditForm.waehrung === 'usd' ? 'USD' : 'CHF'}</button>
                  </div>
                  {buchEditForm.waehrung === 'usd' && (
                    <div className="flex items-center gap-1 mt-1">
                      <input type="number" min="0" step="0.001" value={buchEditForm.kurs}
                        onChange={e => setBuchEditForm(f => ({ ...f, kurs: e.target.value }))}
                        placeholder="Kurs"
                        className="w-20 px-2 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fbbf24' }} />
                      <span className="text-xs text-yellow-400">= {(parseFloat(buchEditForm.betrag || '0') * parseFloat(buchEditForm.kurs || '0.80')).toFixed(2)} CHF</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Kategorie <span className="text-slate-600">(optional)</span></label>
                  <input type="text" value={buchEditForm.kategorie}
                    onChange={e => setBuchEditForm(f => ({ ...f, kategorie: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              {buchEditForm.typ === 'aufwand' && (
                <button type="button"
                  onClick={() => setBuchEditForm(f => ({ ...f, wiederkehrend: !f.wiederkehrend }))}
                  className="w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: buchEditForm.wiederkehrend ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${buchEditForm.wiederkehrend ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    color: buchEditForm.wiederkehrend ? '#f87171' : '#475569',
                  }}>
                  ↻ {buchEditForm.wiederkehrend ? 'Fixkosten (monatl. wiederkehrend)' : 'Einmaliger Aufwand'}
                </button>
              )}
              <div>
                <label className="text-xs text-slate-500 block mb-1">Datum & Uhrzeit</label>
                <input type="datetime-local" value={buchEditForm.datum}
                  onChange={e => setBuchEditForm(f => ({ ...f, datum: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', colorScheme: 'dark' }} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveBuchEdit} disabled={buchEditSaving || !buchEditForm.beschreibung || !buchEditForm.betrag}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa' }}>
                  <Check size={14} />
                  {buchEditSaving ? 'Speichern...' : 'Speichern'}
                </button>
                <button onClick={() => setBuchEditEntry(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === TAB: NACHRICHTEN-LOG === */}
      {tab === 'msglog' && isCreator && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">{msgLog.length} Nachrichten total</p>
            <button onClick={loadMsgLog} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
              <RefreshCw size={12} />
            </button>
          </div>
          {msgLog.length === 0 ? (
            <p className="text-sm text-center py-10 text-slate-600">Noch keine Nachrichten gesendet.</p>
          ) : msgLog.map(m => (
            <div key={m.id} className="rounded-xl px-4 py-3 space-y-1"
              style={{ background: 'var(--card-bg)', border: `1px solid ${m.expired ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.2)'}`, opacity: m.expired ? 0.5 : 1 }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-300">{m.senderName ?? 'Unbekannt'}</span>
                <span className="text-[10px] text-slate-600">→</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                  {m.targetName ? m.targetName : 'Alle'}
                </span>
                <span className="ml-auto text-[10px] text-slate-600">{new Date(m.createdAt).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                {m.expired && <span className="text-[10px] text-slate-700">abgelaufen</span>}
              </div>
              <p className="text-sm text-slate-300">{m.message}</p>
              <p className="text-[10px] text-slate-600">{m.seenCount} mal gesehen · {m.replies.length} Antwort{m.replies.length !== 1 ? 'en' : ''}</p>
              {m.replies.length > 0 && (
                <div className="mt-2 space-y-1 pl-3 border-l border-slate-700">
                  {m.replies.map(r => (
                    <div key={r.id}>
                      <span className="text-[10px] font-semibold text-slate-400">{r.userName}: </span>
                      <span className="text-[11px] text-slate-300">{r.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
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
              {!editUser?.isCreator && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">E-Mail</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
              )}
              {!editUser?.isCreator && (
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
              )}
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
