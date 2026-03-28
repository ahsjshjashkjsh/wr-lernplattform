# Quick Wins — WR-Lernplattform Verbesserungen

**Datum:** 2026-03-28
**Status:** Approved

## Überblick

5 fokussierte Verbesserungen, die Design, UX und Features abdecken, ohne große Risiken einzuführen.

---

## Feature 1: Fortschrittsanzeige auf Kapitelkarten

**Datei:** `src/app/frw/page.tsx`

### Verhalten
- Lädt `ChapterProgress` für den aktuell eingeloggten User
- Zeigt ein kleines Badge pro Karte:
  - ⚪ kein Badge = nicht begonnen (kein Eintrag in DB)
  - 🟡 gelber Punkt + "Begonnen" = `status: in_progress`
  - 🟢 grüner Punkt + "Abgeschlossen" = `status: complete`
- Nicht eingeloggt: keine Badges

### Daten
- `getCurrentUser()` → userId
- `prisma.chapterProgress.findMany({ where: { userId, chapter: { topic: { category: 'frw' } } } })`
- Map per `chapterId` für O(1)-Lookup in der Render-Schleife

---

## Feature 2: Prev/Next-Navigation zwischen Kapiteln

**Datei:** `src/app/frw/[slug]/page.tsx`

### Verhalten
- Am Ende der Seite (unter Tab-Content): eine Navigationsleiste
- Links: `← Kap. N-1: [Titel]` (falls vorhanden)
- Rechts: `Kap. N+1: [Titel] →` (falls vorhanden)
- Beim ersten/letzten Kapitel: entsprechende Seite leer

### Daten
- Alle FRW-Topics nach `order` sortiert laden (bereits im Query vorhanden, muss erweitert werden)
- `currentIndex = topics.findIndex(t => t.slug === slug)`
- `prev = topics[currentIndex - 1]`, `next = topics[currentIndex + 1]`

---

## Feature 3: Flashcard-Modus für Begriffe

**Neue Datei:** `src/components/frw/FlashcardMode.tsx` (Client Component)

### Verhalten
- Im Tab `begriffe`: Toggle-Button "Karten-Modus" oben rechts
- Wenn aktiv: zeigt eine Karte auf einmal
  - Vorderseite: Begriff (term)
  - Rückseite: Definition (definition)
  - Click auf Karte = 3D-Flip-Animation (CSS `rotateY`)
- Navigations-Buttons: ← → + Fortschrittsanzeige "3 / 12"
- Toggle zurück = normale Listenansicht

### Implementierung
- `useState` für: `isActive`, `currentIndex`, `isFlipped`
- CSS: `perspective`, `rotateY(180deg)`, `backface-visibility: hidden`
- Keine API-Calls nötig — Props aus dem Server-Component

---

## Feature 4: "Zuletzt besucht" im Dashboard

**Datei:** `src/app/page.tsx`

### Verhalten
- Neue Sektion "Weitermachen" über "Schnellzugriff"
- Nur sichtbar wenn: User eingeloggt + mind. 1 `ChapterProgress`-Eintrag vorhanden
- Zeigt: Kapitel-Nr, Topic-Titel, letzter Besuch (relativ: "vor 2 Stunden")
- Button "Weitermachen" → `/frw/[slug]`

### Daten
- `prisma.chapterProgress.findFirst({ where: { userId }, orderBy: { lastVisited: 'desc' }, include: { chapter: { include: { topic: true } } } })`

---

## Feature 5: Flüssigere Animationen

**Dateien:** `src/app/frw/[slug]/page.tsx`, globale CSS

### Änderungen
- Tab-Wechsel: Tab-Content bekommt `key={tab}` → React remountet → kombiniert mit CSS `fade-in` (bereits vorhanden) ergibt sanften Übergang
- Kapitelkarten (`/frw/page.tsx`): Border-Color-Transition beim Hover: `transition: border-color 200ms`
- Dashboard Quick-Access-Karten: `hover:scale-[1.01]` (Tailwind) zusätzlich zu bestehendem `hover:-translate-y-0.5`

---

## Reihenfolge der Implementierung

1. Animationen (kleinste Änderung, kein Risiko)
2. Prev/Next-Navigation (nur Server-Component, kein State)
3. "Zuletzt besucht" Dashboard (neuer DB-Query, neues UI-Element)
4. Fortschrittsanzeige auf Kapitelkarten (DB-Query + UI)
5. Flashcard-Modus (neue Client-Component, isoliert)
