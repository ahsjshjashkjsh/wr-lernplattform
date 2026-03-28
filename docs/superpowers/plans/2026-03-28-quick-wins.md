# Quick Wins — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5 focused improvements to the WR-Lernplattform: animations, prev/next navigation, "last visited" on dashboard, progress badges on chapter cards, and flashcard mode for Begriffe.

**Architecture:** Server Components handle all DB queries. One new Client Component (`FlashcardMode`) for the flashcard UI. One new Client Component (`VisitTracker`) fires a fire-and-forget POST on chapter page load to track visits. One new API route handles the upsert.

**Tech Stack:** Next.js App Router, TypeScript, Prisma ORM, Tailwind CSS, Lucide icons, `getCurrentUser()` from `@/lib/auth`, `prisma` from `@/lib/prisma`.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/app/frw/page.tsx` | Add hover border-color transition + progress badges |
| Modify | `src/app/frw/[slug]/page.tsx` | Add tab fade-in + prev/next nav |
| Modify | `src/app/page.tsx` | Add "Zuletzt besucht" section |
| Create | `src/components/frw/FlashcardMode.tsx` | Flashcard flip UI (Client Component) |
| Create | `src/components/frw/VisitTracker.tsx` | Fires POST on chapter visit (Client Component) |
| Create | `src/app/api/frw/progress/route.ts` | Upserts ChapterProgress.lastVisited |

---

## Task 1: Smoother Animations

**Files:**
- Modify: `src/app/frw/page.tsx` (chapter card hover)
- Modify: `src/app/frw/[slug]/page.tsx` (tab content fade)
- Modify: `src/app/page.tsx` (Quick Access hover scale)

### Step 1.1 — Chapter cards: add border-color transition on hover

In `src/app/frw/page.tsx`, find the `<Link>` for each chapter card (line ~81). Replace the style/className:

```tsx
// BEFORE
<Link
  key={topic.id}
  href={`/frw/${topic.slug}`}
  className="group relative rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
  style={{
    background: 'var(--card-bg)',
    border: `1px solid var(--border-color)`,
  }}
>
```

```tsx
// AFTER
<Link
  key={topic.id}
  href={`/frw/${topic.slug}`}
  className="group relative rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20"
  style={{
    background: 'var(--card-bg)',
    border: `1px solid var(--border-color)`,
    transition: 'transform 200ms, border-color 200ms',
  }}
>
```

- [ ] Apply the change above to `src/app/frw/page.tsx`

### Step 1.2 — Tab content: add fade-in on tab switch

In `src/app/frw/[slug]/page.tsx`, find the `{/* Tab Content */}` section (line ~128). The outer wrapper div gets a `key={tab}` so React remounts it on tab change. The `.fade-in` class is already defined in globals.css and does `opacity 0→1`.

```tsx
// BEFORE
<div
  className="rounded-2xl p-6"
  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
>
```

```tsx
// AFTER
<div
  key={tab}
  className="rounded-2xl p-6 fade-in"
  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
>
```

- [ ] Apply the change above to `src/app/frw/[slug]/page.tsx`

### Step 1.3 — Dashboard Quick Access: add scale on hover

In `src/app/page.tsx`, the three Quick Access links (lines ~206, ~220, ~234) each have `hover:-translate-y-0.5`. Add `hover:scale-[1.01]` to each:

```tsx
// All 3 Quick Access <Link> elements: add hover:scale-[1.01]
// Example for Buchungstrainer:
<Link
  href="/frw/trainer"
  className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:scale-[1.01]"
  ...
>
```

- [ ] Apply `hover:scale-[1.01]` to all 3 Quick Access links in `src/app/page.tsx`

### Step 1.4 — Commit

```bash
git add src/app/frw/page.tsx src/app/frw/[slug]/page.tsx src/app/page.tsx
git commit -m "feat: flüssigere Animationen — border transition, tab fade, hover scale"
```

- [ ] Commit

---

## Task 2: Prev/Next Navigation zwischen Kapiteln

**Files:**
- Modify: `src/app/frw/[slug]/page.tsx`

### Step 2.1 — Fetch all topics alongside current

In `src/app/frw/[slug]/page.tsx`, modify the `getChapter` function to also load all FRW topics ordered by `order` (for prev/next). Add a second query:

```tsx
async function getChapter(slug: string) {
  const [topic, allTopics] = await Promise.all([
    prisma.topic.findUnique({
      where: { slug, category: 'frw' },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            bookingEntries: { orderBy: { order: 'asc' } },
            keyTerms:       { orderBy: { order: 'asc' } },
            corePoints:     { orderBy: { order: 'asc' } },
            formulas:       { orderBy: { order: 'asc' } },
            learningGoals:  { orderBy: { order: 'asc' } },
          },
        },
      },
    }),
    prisma.topic.findMany({
      where: { category: 'frw' },
      orderBy: { order: 'asc' },
      select: { slug: true, title: true, order: true },
    }),
  ])
  return { topic, allTopics }
}
```

- [ ] Replace the `getChapter` function in `src/app/frw/[slug]/page.tsx` with the version above

### Step 2.2 — Update the page component to destructure allTopics

Update the call site and destructure:

```tsx
export default async function FrwChapterPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { tab: rawTab } = await searchParams
  const tab = rawTab ?? 'theorie'

  const { topic, allTopics } = await getChapter(slug)
  if (!topic) notFound()

  const chapter = topic.chapters[0]
  if (!chapter) notFound()

  const currentIndex = allTopics.findIndex(t => t.slug === slug)
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null
  // ... rest of component unchanged
```

- [ ] Apply the destructuring and prev/next variables to the component

### Step 2.3 — Add the prev/next nav bar at the bottom

Add this block after the closing `</div>` of the Tab Content section (and after the Core Points Merksätze block), at the very end before the final closing `</div>`:

```tsx
{/* Prev / Next Navigation */}
<div className="flex items-center justify-between gap-4 pt-2">
  {prevTopic ? (
    <Link
      href={`/frw/${prevTopic.slug}`}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:-translate-x-0.5 group"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
    >
      <ChevronLeft size={15} className="group-hover:text-blue-400 transition-colors" />
      <div className="text-left">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Vorheriges</div>
        <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          Kap. {prevTopic.order} · {prevTopic.title}
        </div>
      </div>
    </Link>
  ) : (
    <div />
  )}

  {nextTopic ? (
    <Link
      href={`/frw/${nextTopic.slug}`}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:translate-x-0.5 group"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
    >
      <div className="text-right">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Nächstes</div>
        <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          Kap. {nextTopic.order} · {nextTopic.title}
        </div>
      </div>
      <ChevronRight size={15} className="group-hover:text-blue-400 transition-colors" />
    </Link>
  ) : (
    <div />
  )}
</div>
```

`ChevronLeft` and `ChevronRight` are already imported at the top of the file (`ChevronLeft` is there, `ChevronRight` needs to be added to the import).

- [ ] Add `ChevronRight` to the import line at the top of `src/app/frw/[slug]/page.tsx` (it's already in the frw/page.tsx import, just add it to the [slug] page import)
- [ ] Add the prev/next nav block at the end of the component return

### Step 2.4 — Commit

```bash
git add src/app/frw/[slug]/page.tsx
git commit -m "feat: Prev/Next-Navigation zwischen FRW-Kapiteln"
```

- [ ] Commit

---

## Task 3: "Zuletzt besucht" im Dashboard + VisitTracker API

**Files:**
- Create: `src/app/api/frw/progress/route.ts`
- Create: `src/components/frw/VisitTracker.tsx`
- Modify: `src/app/frw/[slug]/page.tsx` (add VisitTracker)
- Modify: `src/app/page.tsx` (add Zuletzt besucht section)

### Step 3.1 — Create the progress API route

Create `src/app/api/frw/progress/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const { chapterId } = await req.json()
  if (!chapterId) return NextResponse.json({ ok: false }, { status: 400 })

  await prisma.chapterProgress.upsert({
    where: { chapterId_userId: { chapterId, userId: session.userId } },
    update: { lastVisited: new Date(), status: 'in_progress' },
    create: { chapterId, userId: session.userId, status: 'in_progress', lastVisited: new Date() },
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] Create `src/app/api/frw/progress/route.ts` with the content above

### Step 3.2 — Create the VisitTracker client component

Create `src/components/frw/VisitTracker.tsx`:

```tsx
'use client'

import { useEffect } from 'react'

export function VisitTracker({ chapterId }: { chapterId: string }) {
  useEffect(() => {
    fetch('/api/frw/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId }),
    }).catch(() => {/* fire-and-forget, silently ignore errors */})
  }, [chapterId])

  return null
}
```

- [ ] Create `src/components/frw/VisitTracker.tsx` with the content above

### Step 3.3 — Add VisitTracker to the chapter page

In `src/app/frw/[slug]/page.tsx`, import and render VisitTracker:

Add to imports at top:
```tsx
import { VisitTracker } from '@/components/frw/VisitTracker'
```

Add as first child of the top-level `<div className="space-y-6 max-w-4xl mx-auto">`:
```tsx
<VisitTracker chapterId={chapter.id} />
```

- [ ] Add VisitTracker import and usage to `src/app/frw/[slug]/page.tsx`

### Step 3.4 — Add "Zuletzt besucht" to dashboard

In `src/app/page.tsx`, modify `getDashboardData` to also fetch last visited chapter:

```tsx
async function getDashboardData() {
  const user = await getCurrentUser()

  const [frwTopics, lastProgress] = await Promise.all([
    prisma.topic.findMany({
      where: { category: 'frw' },
      orderBy: { order: 'asc' },
      include: {
        chapters: {
          take: 1,
          include: {
            _count: { select: { bookingEntries: true, keyTerms: true } },
          },
        },
      },
    }),
    user ? prisma.chapterProgress.findFirst({
      where: { userId: user.id },
      orderBy: { lastVisited: 'desc' },
      include: {
        chapter: {
          include: { topic: { select: { slug: true, title: true, order: true } } },
        },
      },
    }) : null,
  ])

  const totalBuchungen = frwTopics.reduce((s, t) => s + (t.chapters[0]?._count.bookingEntries ?? 0), 0)
  const totalBegriffe  = frwTopics.reduce((s, t) => s + (t.chapters[0]?._count.keyTerms ?? 0), 0)

  return { user, frwTopics, totalBuchungen, totalBegriffe, lastProgress }
}
```

- [ ] Replace `getDashboardData` in `src/app/page.tsx` with the version above
- [ ] Update the destructure in `DashboardPage`: add `lastProgress` to `const { user, frwTopics, totalBuchungen, totalBegriffe, lastProgress } = await getDashboardData()`

### Step 3.5 — Add the "Zuletzt besucht" UI block

Add this helper function at the top of the file (after imports):

```tsx
function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 2) return 'gerade eben'
  if (diffMin < 60) return `vor ${diffMin} Minuten`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `vor ${diffH} Stunde${diffH === 1 ? '' : 'n'}`
  const diffD = Math.floor(diffH / 24)
  return `vor ${diffD} Tag${diffD === 1 ? '' : 'en'}`
}
```

Add the "Zuletzt besucht" block in the JSX of `DashboardPage`, between the `{/* FÄCHER */}` section and the `{/* QUICK ACCESS */}` section:

```tsx
{/* ZULETZT BESUCHT */}
{lastProgress && (
  <div>
    <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
      Weitermachen
    </h2>
    <Link
      href={`/frw/${lastProgress.chapter.topic.slug}`}
      className="flex items-center justify-between gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--card-bg)', border: '1px solid rgba(99,102,241,0.2)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <BookOpen size={15} className="text-indigo-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            Kap. {lastProgress.chapter.topic.order} · {lastProgress.chapter.topic.title}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {formatRelativeTime(lastProgress.lastVisited)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 shrink-0">
        Weitermachen <ChevronRight size={13} />
      </div>
    </Link>
  </div>
)}
```

Note: `ChevronRight` needs to be added to the import in `src/app/page.tsx`. Check existing imports — add `ChevronRight` to the lucide-react import line.

- [ ] Add `formatRelativeTime` helper function to `src/app/page.tsx` (before the `export default` function)
- [ ] Add `ChevronRight` to the lucide-react import in `src/app/page.tsx`
- [ ] Add the "Zuletzt besucht" JSX block between FÄCHER and QUICK ACCESS sections

### Step 3.6 — Commit

```bash
git add src/app/api/frw/progress/route.ts src/components/frw/VisitTracker.tsx src/app/frw/[slug]/page.tsx src/app/page.tsx
git commit -m "feat: Zuletzt besucht im Dashboard + VisitTracker API"
```

- [ ] Commit

---

## Task 4: Fortschrittsanzeige (Badges) auf Kapitelkarten

**Files:**
- Modify: `src/app/frw/page.tsx`

This task makes the progress badges visible on the `/frw` overview. The `ChapterProgress` entries are now being created by `VisitTracker` (Task 3), so visiting a chapter will make its badge appear.

### Step 4.1 — Load progress data in FrwPage

In `src/app/frw/page.tsx`, add `getCurrentUser` import and modify `getFrwChapters` to also fetch progress:

Add to imports:
```tsx
import { getCurrentUser } from '@/lib/auth'
```

Replace `getFrwChapters`:
```tsx
async function getFrwData() {
  const user = await getCurrentUser()

  const [topics, progressList] = await Promise.all([
    prisma.topic.findMany({
      where: { category: 'frw' },
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
  return { topics, progressMap }
}
```

- [ ] Add `getCurrentUser` import to `src/app/frw/page.tsx`
- [ ] Replace `getFrwChapters` with `getFrwData` in `src/app/frw/page.tsx`

### Step 4.2 — Update the component to use getFrwData

```tsx
export default async function FrwPage() {
  const { topics, progressMap } = await getFrwData()
  // ... rest unchanged
```

- [ ] Update `FrwPage` to call `getFrwData()` and destructure `{ topics, progressMap }`

### Step 4.3 — Render the badge on each card

In the chapter card JSX, find the `{/* Stats */}` section (around line ~115). Replace it so the badge appears inside the existing stats footer row, aligned to the right:

```tsx
{/* Stats */}
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
    {progressMap.get(ch.id) && (
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
```

This places the badge in the existing stats footer, using `ml-auto` to push it to the right — no absolute positioning needed, no conflict with the existing `ChevronRight` in the card header.

- [ ] Add the progress badge JSX to the chapter card in `src/app/frw/page.tsx`

### Step 4.4 — Commit

```bash
git add src/app/frw/page.tsx
git commit -m "feat: Besuchte-Badge auf FRW-Kapitelkarten"
```

- [ ] Commit

---

## Task 5: Flashcard-Modus für Begriffe

**Files:**
- Create: `src/components/frw/FlashcardMode.tsx`
- Modify: `src/app/frw/[slug]/page.tsx`

### Step 5.1 — Create FlashcardMode component

Create `src/components/frw/FlashcardMode.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Layers } from 'lucide-react'

type KeyTerm = {
  id: string
  term: string
  definition: string
}

export function FlashcardMode({ keyTerms }: { keyTerms: KeyTerm[] }) {
  const [isActive, setIsActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!isActive) {
    return (
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setIsActive(true); setIndex(0); setFlipped(false) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-violet-500/10"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}
        >
          <Layers size={12} />
          Karten-Modus
        </button>
      </div>
    )
  }

  const current = keyTerms[index]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {index + 1} / {keyTerms.length}
        </span>
        <button
          onClick={() => setIsActive(false)}
          className="text-xs px-2 py-1 rounded-lg transition-all hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
        >
          Listenansicht
        </button>
      </div>

      {/* Card with 3D flip */}
      <div
        className="relative cursor-pointer"
        style={{ perspective: '1000px', height: '200px' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transition: 'transform 400ms cubic-bezier(0.4,0,0.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front: Term */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'var(--card-bg)',
              border: '1px solid rgba(139,92,246,0.25)',
            }}
          >
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Begriff</p>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{current.term}</h3>
            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>Klicken zum Umdrehen</p>
          </div>

          {/* Back: Definition */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.25)',
            }}
          >
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>Definition</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{current.definition}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => { setIndex(i => Math.max(0, i - 1)); setFlipped(false) }}
          disabled={index === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={14} /> Zurück
        </button>

        <button
          onClick={() => { setIndex(0); setFlipped(false) }}
          className="p-2 rounded-xl transition-all hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
          title="Zurück zum Anfang"
        >
          <RotateCcw size={14} />
        </button>

        <button
          onClick={() => { setIndex(i => Math.min(keyTerms.length - 1, i + 1)); setFlipped(false) }}
          disabled={index === keyTerms.length - 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
        >
          Weiter <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
```

- [ ] Create `src/components/frw/FlashcardMode.tsx` with the content above

### Step 5.2 — Integrate FlashcardMode into the chapter page

In `src/app/frw/[slug]/page.tsx`, add import:

```tsx
import { FlashcardMode } from '@/components/frw/FlashcardMode'
```

In the `{tab === 'begriffe'}` section, add `<FlashcardMode>` before the existing list. Replace the begriffe section:

```tsx
{/* BEGRIFFE */}
{tab === 'begriffe' && (
  <div>
    {chapter.keyTerms.length > 0 ? (
      <div className="space-y-3">
        <FlashcardMode keyTerms={chapter.keyTerms} />
        {chapter.keyTerms.map(term => (
          <div
            key={term.id}
            className="p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {term.term}
            </div>
            <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {term.definition}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState icon={FileText} text="Begriffe werden noch geladen." />
    )}
  </div>
)}
```

Note: When `FlashcardMode` is in "Karten-Modus", it renders the card UI and hides the toggle button — but the list below is still visible. This is intentional: users can scroll down to see all terms while reviewing cards. If you want to hide the list in card mode, that would require lifting state up or wrapping both in a single client component — skip this for now (YAGNI).

- [ ] Add `FlashcardMode` import to `src/app/frw/[slug]/page.tsx`
- [ ] Replace the begriffe tab section with the version above

### Step 5.3 — Commit

```bash
git add src/components/frw/FlashcardMode.tsx src/app/frw/[slug]/page.tsx
git commit -m "feat: Flashcard-Modus für Begriffe mit 3D-Flip-Animation"
```

- [ ] Commit

---

## Verification Checklist

After all tasks:

- [ ] `/frw` — hover over a card: border brightens smoothly
- [ ] `/frw/[slug]` — switch tabs: content fades in
- [ ] `/frw/[slug]` — scroll to bottom: prev/next navigation shows correct adjacent chapters
- [ ] `/frw/[slug]` — visit while logged in, then go to `/` — "Weitermachen" section appears
- [ ] `/frw` — after visiting a chapter, its card shows "Besucht" badge
- [ ] `/frw/[slug]?tab=begriffe` — "Karten-Modus" button appears, click activates flashcards, click card flips it, ← → navigate, "Listenansicht" closes it
- [ ] Not logged in: no "Weitermachen" section, no "Besucht" badges
