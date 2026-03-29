# Premium-System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Schüler können AP-Inhalte durch ein manuelles Twint-Abo freischalten — mit Code-basierter Anfrage, Admin-Freischalten im Panel, und automatischem Ablauf nach 30 Tagen. Vor QSP (17. April 2026) ist alles gratis.

**Architecture:** Prisma-Schema-Erweiterung für `isPremium`/`premiumUntil` auf User + neues `PremiumRequest`-Model. Server-seitiges Content-Gating nach `examType` — aktiv erst ab 17.04.2026 (QSP-Datum). Admin schaltet manuell nach Twint-Eingang frei. Kein externer Zahlungsanbieter.

**Tech Stack:** Next.js 16, Prisma 7, PostgreSQL (Supabase), lucide-react, TypeScript

---

## Datei-Übersicht

| Aktion | Datei |
|--------|-------|
| Modify | `prisma/schema.prisma` |
| Modify | `src/lib/auth.ts` |
| Modify | `src/components/AuthProvider.tsx` |
| Create | `src/app/api/premium/request/route.ts` |
| Create | `src/app/api/premium/status/route.ts` |
| Create | `src/app/api/admin/premium/route.ts` |
| Create | `src/app/api/admin/premium/[id]/approve/route.ts` |
| Create | `src/app/api/admin/premium/[id]/reject/route.ts` |
| Create | `src/app/premium/page.tsx` |
| Modify | `src/app/frw/page.tsx` |
| Modify | `src/app/frw/[slug]/page.tsx` |
| Modify | `src/app/admin/page.tsx` |
| Modify | `src/components/layout/navbar.tsx` |

---

## Task 1: Prisma Schema erweitern + Migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: User-Model erweitern**

In `prisma/schema.prisma` die zwei Felder nach `createdAt` im User-Model ergänzen:

```prisma
model User {
  // ... existing fields ...
  createdAt         DateTime          @default(now())
  isPremium         Boolean           @default(false)
  premiumUntil      DateTime?
  progress          ChapterProgress[]
  quizAttempts      QuizAttempt[]
  feedback          Feedback[]
  activityLogs      ActivityLog[]
  premiumRequests   PremiumRequest[]
}
```

- [ ] **Step 2: PremiumRequest-Model hinzufügen**

Am Ende von `prisma/schema.prisma` vor dem letzten `}` anfügen:

```prisma
model PremiumRequest {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  code      String   @unique
  status    String   @default("pending")
  createdAt DateTime @default(now())
}
```

- [ ] **Step 3: Migration ausführen**

```bash
cd "c:/ÜBUNGSTOOL ABSCHLUSSPRÜFUNG WR/wr-lernplattform"
npx prisma migrate dev --name add_premium_system
```

Erwartete Ausgabe: `Your database is now in sync with your schema.`

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: Prisma-Schema — isPremium, premiumUntil auf User + PremiumRequest-Model"
```

---

## Task 2: Auth-Utilities + AuthProvider aktualisieren

**Files:**
- Modify: `src/lib/auth.ts`
- Modify: `src/components/AuthProvider.tsx`

- [ ] **Step 1: getCurrentUser in `src/lib/auth.ts` — isPremium + premiumUntil einschliessen**

Den `select`-Block in `getCurrentUser()` anpassen (Zeile ~92):

```typescript
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      isBanned: true,
      createdAt: true,
      isPremium: true,
      premiumUntil: true,
    },
  })
}
```

- [ ] **Step 2: Premium-Hilfsfunktion in `src/lib/auth.ts` ergänzen**

Am Ende von `src/lib/auth.ts` anfügen:

```typescript
export function isPremiumActive(user: { isPremium: boolean; premiumUntil: Date | null }): boolean {
  if (!user.isPremium || !user.premiumUntil) return false
  return user.premiumUntil > new Date()
}
```

- [ ] **Step 3: `AuthUser`-Interface in `src/components/AuthProvider.tsx` erweitern**

```typescript
export interface AuthUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isBanned: boolean
  isPremium: boolean
  premiumUntil: string | null
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts src/components/AuthProvider.tsx
git commit -m "feat: isPremium/premiumUntil in getCurrentUser + AuthUser + isPremiumActive helper"
```

---

## Task 3: User-seitige API-Routes (request + status)

**Files:**
- Create: `src/app/api/premium/request/route.ts`
- Create: `src/app/api/premium/status/route.ts`

- [ ] **Step 1: Code-Generator-Hilfsfunktion + POST `/api/premium/request`**

Neue Datei `src/app/api/premium/request/route.ts` erstellen:

```typescript
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isPremiumActive } from '@/lib/auth'

function generateCode(): string {
  // Keine I, O, 0, 1 um Verwechslungen zu vermeiden
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `HMS-${suffix}`
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  if (isPremiumActive(user)) {
    return Response.json({ error: 'Du hast bereits ein aktives Premium-Abo.' }, { status: 400 })
  }

  // Prüfen ob bereits eine offene Anfrage existiert
  const existing = await prisma.premiumRequest.findFirst({
    where: { userId: user.id, status: 'pending' },
  })
  if (existing) {
    return Response.json({ code: existing.code })
  }

  // Einzigartigen Code generieren (Retry bei Kollision)
  let code = generateCode()
  let attempts = 0
  while (attempts < 10) {
    const conflict = await prisma.premiumRequest.findUnique({ where: { code } })
    if (!conflict) break
    code = generateCode()
    attempts++
  }

  const request = await prisma.premiumRequest.create({
    data: { userId: user.id, code },
  })

  return Response.json({ code: request.code })
}
```

- [ ] **Step 2: GET `/api/premium/status`**

Neue Datei `src/app/api/premium/status/route.ts` erstellen:

```typescript
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isPremiumActive } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ status: 'unauthenticated' })

  const active = isPremiumActive(user)

  const pendingRequest = await prisma.premiumRequest.findFirst({
    where: { userId: user.id, status: 'pending' },
    select: { code: true, createdAt: true },
  })

  return Response.json({
    isPremium: active,
    premiumUntil: active ? user.premiumUntil : null,
    pendingRequest: pendingRequest ?? null,
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/premium/
git commit -m "feat: API /api/premium/request + /api/premium/status"
```

---

## Task 4: Admin API-Routes (list + approve + reject)

**Files:**
- Create: `src/app/api/admin/premium/route.ts`
- Create: `src/app/api/admin/premium/[id]/approve/route.ts`
- Create: `src/app/api/admin/premium/[id]/reject/route.ts`

- [ ] **Step 1: GET `/api/admin/premium` — alle Anfragen auflisten**

Neue Datei `src/app/api/admin/premium/route.ts`:

```typescript
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const requests = await prisma.premiumRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, isPremium: true, premiumUntil: true } },
    },
  })

  return Response.json({ requests })
}
```

- [ ] **Step 2: POST `/api/admin/premium/[id]/approve` — Premium freischalten**

Neue Datei `src/app/api/admin/premium/[id]/approve/route.ts`:

```typescript
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { id } = await params

  const request = await prisma.premiumRequest.findUnique({ where: { id } })
  if (!request) return Response.json({ error: 'Anfrage nicht gefunden.' }, { status: 404 })
  if (request.status !== 'pending') {
    return Response.json({ error: 'Anfrage ist nicht mehr offen.' }, { status: 400 })
  }

  const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 Tage

  await prisma.$transaction([
    prisma.premiumRequest.update({
      where: { id },
      data: { status: 'approved' },
    }),
    prisma.user.update({
      where: { id: request.userId },
      data: { isPremium: true, premiumUntil },
    }),
  ])

  return Response.json({ ok: true, premiumUntil })
}
```

- [ ] **Step 3: POST `/api/admin/premium/[id]/reject` — Anfrage ablehnen**

Neue Datei `src/app/api/admin/premium/[id]/reject/route.ts`:

```typescript
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { id } = await params

  const request = await prisma.premiumRequest.findUnique({ where: { id } })
  if (!request) return Response.json({ error: 'Anfrage nicht gefunden.' }, { status: 404 })

  await prisma.premiumRequest.update({
    where: { id },
    data: { status: 'rejected' },
  })

  return Response.json({ ok: true })
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/premium/
git commit -m "feat: Admin API /api/admin/premium — list, approve, reject"
```

---

## Task 5: /premium Seite

**Files:**
- Create: `src/app/premium/page.tsx`

- [ ] **Step 1: Seite erstellen**

Neue Datei `src/app/premium/page.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Crown, Smartphone, Copy, Check, Lock, BookOpen, Zap } from 'lucide-react'

const TWINT_NUMBER = process.env.NEXT_PUBLIC_TWINT_NUMBER ?? '079 XXX XX XX'
const PREMIUM_PRICE = process.env.NEXT_PUBLIC_PREMIUM_PRICE ?? '5'

type Status = 'loading' | 'unauthenticated' | 'active' | 'pending' | 'none'

interface PremiumState {
  status: Status
  premiumUntil: string | null
  code: string | null
}

export default function PremiumPage() {
  const [state, setState] = useState<PremiumState>({ status: 'loading', premiumUntil: null, code: null })
  const [requesting, setRequesting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/premium/status')
      .then(r => r.json())
      .then(data => {
        if (data.status === 'unauthenticated') {
          setState({ status: 'unauthenticated', premiumUntil: null, code: null })
        } else if (data.isPremium) {
          setState({ status: 'active', premiumUntil: data.premiumUntil, code: null })
        } else if (data.pendingRequest) {
          setState({ status: 'pending', premiumUntil: null, code: data.pendingRequest.code })
        } else {
          setState({ status: 'none', premiumUntil: null, code: null })
        }
      })
      .catch(() => setState({ status: 'none', premiumUntil: null, code: null }))
  }, [])

  async function handleRequest() {
    setRequesting(true)
    setError('')
    const res = await fetch('/api/premium/request', { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Fehler beim Erstellen der Anfrage.')
    } else {
      setState({ status: 'pending', premiumUntil: null, code: data.code })
    }
    setRequesting(false)
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <Crown size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Premium</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Abschlussprüfungs-Inhalte freischalten</p>
        </div>
      </div>

      {/* Was ist Premium */}
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Was du bekommst</h2>
        <ul className="space-y-2">
          {[
            { icon: BookOpen, text: 'Alle AP-Kapitel (Abschlussprüfung) in FRW' },
            { icon: Zap, text: 'Vollständiger Zugang zu allen Lernmaterialien' },
            { icon: Lock, text: '30 Tage Zugang ab Freischaltung' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Icon size={14} className="text-amber-400 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
        <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--border-color)' }}>
          <span className="text-2xl font-bold text-amber-400">CHF {PREMIUM_PRICE}</span>
          <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>/ 30 Tage</span>
        </div>
      </div>

      {/* State-abhängiger Content */}
      {state.status === 'loading' && (
        <div className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>Laden...</div>
      )}

      {state.status === 'unauthenticated' && (
        <div className="rounded-2xl p-5 text-center space-y-3"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Du musst angemeldet sein um Premium zu bestellen.
          </p>
          <a href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
            Jetzt anmelden
          </a>
        </div>
      )}

      {state.status === 'active' && state.premiumUntil && (
        <div className="rounded-2xl p-5 text-center space-y-2"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Crown size={28} className="text-amber-400 mx-auto" />
          <p className="text-sm font-semibold text-amber-400">Premium aktiv</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Gültig bis {new Date(state.premiumUntil).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      )}

      {state.status === 'pending' && state.code && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Anfrage erstellt — jetzt zahlen
          </h2>
          <ol className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold shrink-0">1</span>
              Öffne Twint und zahle <strong className="text-amber-400 mx-1">CHF {PREMIUM_PRICE}</strong> an:
              <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{TWINT_NUMBER}</span>
            </li>
            <li className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold shrink-0">2</span>
              Schreibe diesen Code ins <strong style={{ color: 'var(--text-primary)' }}>Mitteilungsfeld</strong>:
            </li>
          </ol>
          {/* Code Box */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)' }}>
            <span className="font-mono text-2xl font-bold tracking-widest text-amber-400 flex-1">
              {state.code}
            </span>
            <button
              onClick={() => copyCode(state.code!)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                color: copied ? '#4ade80' : '#fbbf24',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Kopiert' : 'Kopieren'}
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Sobald die Zahlung bestätigt wurde, schalten wir deinen Zugang frei. Dies kann einige Stunden dauern.
          </p>
        </div>
      )}

      {state.status === 'none' && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Smartphone size={16} className="text-amber-400 shrink-0" />
            Zahlung per Twint — du erhältst einen Code den du im Mitteilungsfeld angibst.
          </div>
          {error && (
            <p className="text-xs text-red-400 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)' }}>
              {error}
            </p>
          )}
          <button
            onClick={handleRequest}
            disabled={requesting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <Crown size={15} />
            {requesting ? 'Wird erstellt...' : 'Jetzt anfragen — CHF ' + PREMIUM_PRICE}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Env-Variablen in `.env.local` ergänzen**

Folgende Zeilen in `.env.local` hinzufügen (Werte anpassen):

```env
NEXT_PUBLIC_TWINT_NUMBER=079 XXX XX XX
NEXT_PUBLIC_PREMIUM_PRICE=5
```

- [ ] **Step 3: Commit**

```bash
git add src/app/premium/page.tsx
git commit -m "feat: /premium Seite — Twint-Anfrage mit Code-Anzeige"
```

---

## Task 6: Content-Gating in FRW

**Files:**
- Modify: `src/app/frw/page.tsx`
- Modify: `src/app/frw/[slug]/page.tsx`

- [ ] **Step 1: `getFrwData` in `src/app/frw/page.tsx` — User-Premium-Status einschliessen**

Die `getFrwData`-Funktion anpassen, damit sie den Premium-Status zurückgibt:

```typescript
import { isPremiumActive } from '@/lib/auth'

// QSP-Datum: ab diesem Tag gilt das Premium-Gate für AP-Inhalte
const QSP_DATE = new Date('2026-04-17T00:00:00')

async function getFrwData() {
  const user = await getCurrentUser()

  const [topics, progressList] = await Promise.all([
    prisma.topic.findMany({
      where: { category: 'frw', published: true },
      orderBy: { order: 'asc' },
      include: {
        chapters: {
          include: {
            _count: { select: { bookingEntries: true, keyTerms: true } },
          },
        },
      },
    }),
    user
      ? prisma.chapterProgress.findMany({
          where: { userId: user.id },
          select: { chapterId: true, status: true },
        })
      : [],
  ])

  const progressMap = new Map(progressList.map(p => [p.chapterId, p.status]))
  // Vor QSP ist alles gratis — Premium-Gate erst ab 17.04.2026 aktiv
  const gatingActive = new Date() >= QSP_DATE
  const hasPremium = !gatingActive || (user ? isPremiumActive(user) : false)
  return { topics, progressMap, hasPremium }
}
```

- [ ] **Step 2: `TopicGrid` in `src/app/frw/page.tsx` — Lock-Icon für AP-Inhalte**

Import ergänzen am Anfang der Datei: `import { Lock } from 'lucide-react'` (zu den bestehenden Lucide-Imports hinzufügen).

Die `TopicGrid`-Komponente bekommt `hasPremium` als Prop und zeigt ein Lock-Badge für gesperrte Topics:

```typescript
function TopicGrid({
  topics,
  progressMap,
  hasPremium,
}: {
  topics: Awaited<ReturnType<typeof getFrwData>>['topics']
  progressMap: Map<string, string>
  hasPremium: boolean
}) {
  if (topics.length === 0) return (
    <div className="text-center py-12">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Keine Themen gefunden.</p>
    </div>
  )
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map(topic => {
        const ch = topic.chapters[0]
        const kapitelNr = topic.order
        const colors = KAPITEL_COLORS[kapitelNr] ?? KAPITEL_COLORS[3]
        const isLocked = topic.examType === 'abschluss' && !hasPremium
        return (
          <Link
            key={topic.id}
            href={isLocked ? '/premium' : `/frw/${topic.slug}`}
            className="group relative rounded-2xl p-5 hover:-translate-y-0.5 hover:border-white/20"
            style={{
              background: 'var(--card-bg)',
              border: `1px solid var(--border-color)`,
              transition: 'transform 200ms, border-color 200ms',
              opacity: isLocked ? 0.7 : 1,
            }}
          >
            {isLocked && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                <Lock size={9} />
                Premium
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }} />
                Kapitel {kapitelNr}
              </div>
              <ChevronRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
            <h2 className="text-sm font-semibold mb-1.5 leading-snug" style={{ color: 'var(--text-primary)' }}>
              {topic.title}
            </h2>
            <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>
              {topic.description}
            </p>
            {ch && (
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                {ch._count.bookingEntries > 0 && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Hash size={11} />
                    {ch._count.bookingEntries} Buchungen
                  </div>
                )}
                {ch._count.keyTerms > 0 && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <FileText size={11} />
                    {ch._count.keyTerms} Begriffe
                  </div>
                )}
                {ch._count.bookingEntries === 0 && ch._count.keyTerms === 0 && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>In Vorbereitung</span>
                )}
                {!isLocked && progressMap.get(ch.id) && (
                  <span
                    className="ml-auto flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Besucht
                  </span>
                )}
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: `hasPremium` an `TopicGrid` weitergeben**

Im `FrwPage`-Render den `TopicGrid`-Aufruf anpassen (in der `return`-Anweisung der Page-Komponente):

```typescript
const { topics, progressMap, hasPremium } = await getFrwData()
// ...
<TopicGrid topics={filteredTopics} progressMap={progressMap} hasPremium={hasPremium} />
```

- [ ] **Step 4: Premium-Gate in `src/app/frw/[slug]/page.tsx`**

In der `getChapter`-Funktion den User ebenfalls laden und Premium-Status prüfen. Direkt nach dem `const { topic, allTopics } = await getChapter(slug)` Block, vor dem return der Page-Komponente, folgenden Check einfügen:

```typescript
import { getCurrentUser, isPremiumActive } from '@/lib/auth'
import Link from 'next/link'
import { Lock } from 'lucide-react'
// (zu den bestehenden Imports hinzufügen)
```

Und in der Page-Komponente, nach dem `notFound()` Check:

```typescript
const QSP_DATE = new Date('2026-04-17T00:00:00')
const gatingActive = new Date() >= QSP_DATE
const user = await getCurrentUser()
const hasPremium = !gatingActive || (user ? isPremiumActive(user) : false)

if (topic.examType === 'abschluss' && !hasPremium) {
  return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-5 fade-in">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
        <Lock size={24} className="text-amber-400" />
      </div>
      <div>
        <h1 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Premium-Inhalt
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Dieses Kapitel gehört zum Abschlussprüfungs-Stoff und ist nur mit Premium zugänglich.
        </p>
      </div>
      <Link
        href="/premium"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
      >
        <Lock size={14} />
        Premium freischalten
      </Link>
      <Link href="/frw" className="block text-xs" style={{ color: 'var(--text-muted)' }}>
        ← Zurück zur Übersicht
      </Link>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/frw/page.tsx src/app/frw/[slug]/page.tsx
git commit -m "feat: Content-Gating — AP-Kapitel in FRW hinter Premium sperren"
```

---

## Task 7: Admin-Panel — Premium-Tab

**Files:**
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Interface + State ergänzen**

In `src/app/admin/page.tsx` das Interface und den State für Premium-Anfragen hinzufügen. Zum bestehenden Import-Block `Crown` ergänzen (Lucide-Icons sind bereits importiert, nur `Crown` fehlt).

Neues Interface nach den bestehenden Interfaces:

```typescript
interface PremiumRequestItem {
  id: string
  code: string
  status: string
  createdAt: string
  user: { id: string; name: string; email: string; isPremium: boolean; premiumUntil: string | null }
}
```

`Tab`-Type erweitern:

```typescript
type Tab = 'pending' | 'users' | 'create' | 'feedback' | 'messages' | 'log' | 'premium'
```

Neue State-Variable nach den bestehenden `useState`-Aufrufen:

```typescript
const [premiumRequests, setPremiumRequests] = useState<PremiumRequestItem[]>([])
```

- [ ] **Step 2: loadPremiumRequests-Funktion + useEffect-Integration**

Nach `loadLogs()` folgende Funktion hinzufügen:

```typescript
async function loadPremiumRequests() {
  const res = await fetch('/api/admin/premium')
  if (res.ok) { const data = await res.json(); setPremiumRequests(data.requests) }
}
```

In `useEffect` die Funktion beim ersten Load und im Interval aufrufen:

```typescript
useEffect(() => {
  loadUsers()
  loadFeedback()
  loadLogs()
  loadPremiumRequests()
  const interval = setInterval(() => {
    loadUsers(true)
    loadFeedback()
    loadLogs()
    loadPremiumRequests()
  }, 3_000)
  // ...
}, [loadUsers])
```

- [ ] **Step 3: Approve/Reject Handler**

Nach `reviewFeedback` folgende Handler hinzufügen:

```typescript
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
```

- [ ] **Step 4: Tab-Button für Premium hinzufügen**

In der Tab-Navigation (wo `pending`, `users`, `feedback`, etc. stehen) einen neuen Button hinzufügen:

```tsx
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
```

- [ ] **Step 5: Premium-Tab-Inhalt rendern**

Im JSX, nach dem letzten `{tab === 'log' && ...}` Block, folgenden Block hinzufügen:

```tsx
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
```

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: Admin-Panel — Premium-Tab mit Approve/Reject"
```

---

## Task 8: Navbar — Premium-Badge

**Files:**
- Modify: `src/components/layout/navbar.tsx`

- [ ] **Step 1: Crown-Icon und Premium-Link hinzufügen**

In `src/components/layout/navbar.tsx` den Import um `Crown` erweitern:

```typescript
import { ..., Crown } from 'lucide-react'
```

Im Desktop-Nav, im `user`-Block direkt vor dem Abmelden-Button, folgenden Schnipsel hinzufügen:

```tsx
{user.isPremium && user.premiumUntil && new Date(user.premiumUntil) > new Date() ? (
  <Link
    href="/premium"
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border"
    style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)', color: '#fbbf24' }}
  >
    <Crown size={12} />
    Premium
  </Link>
) : (
  <Link
    href="/premium"
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border border-transparent hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400"
    style={{ color: 'var(--text-muted)' }}
  >
    <Crown size={12} />
    Premium
  </Link>
)}
```

Im Mobile-Menu dasselbe vor dem Abmelden-Button ergänzen:

```tsx
{user.isPremium && user.premiumUntil && new Date(user.premiumUntil) > new Date() ? (
  <Link
    href="/premium"
    onClick={() => setMenuOpen(false)}
    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
    style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}
  >
    <Crown size={16} />
    Premium aktiv
  </Link>
) : (
  <Link
    href="/premium"
    onClick={() => setMenuOpen(false)}
    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
    style={{ color: 'var(--text-muted)' }}
  >
    <Crown size={16} />
    Premium holen
  </Link>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/navbar.tsx
git commit -m "feat: Navbar — Premium-Badge für aktive und nicht-aktive User"
```

---

## Task 9: Build-Check + Push

- [ ] **Step 1: Build prüfen**

```bash
cd "c:/ÜBUNGSTOOL ABSCHLUSSPRÜFUNG WR/wr-lernplattform"
npm run build
```

Erwartete Ausgabe: keine TypeScript-Fehler, Build erfolgreich.

- [ ] **Step 2: Push**

```bash
git push
```

---

## Abschluss-Checkliste

- [ ] Migration erfolgreich (`npx prisma migrate dev`)
- [ ] `/premium` Seite zeigt Twint-Nummer und Preis korrekt
- [ ] Als User: "Jetzt anfragen" generiert Code
- [ ] Admin-Panel Tab "Premium" zeigt offene Anfragen
- [ ] Admin "Freischalten" setzt isPremium + premiumUntil 30 Tage
- [ ] AP-Kapitel in FRW-Übersicht zeigen Lock-Badge wenn kein Premium
- [ ] AP-Kapitel-Detailseite zeigt Premium-Gate wenn kein Zugang
- [ ] Navbar zeigt "Premium" Link / Badge korrekt
- [ ] `.env.local` hat `NEXT_PUBLIC_TWINT_NUMBER` und `NEXT_PUBLIC_PREMIUM_PRICE` gesetzt
