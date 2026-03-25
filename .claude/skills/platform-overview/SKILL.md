---
name: platform-overview
description: Vollständige Übersicht der wr-lernplattform. Verwende diesen Skill IMMER am Anfang eines neuen Chats, oder wenn der User /platform-overview eingibt, oder wenn Fragen zur Plattformstruktur auftauchen. Gibt dir sofort den kompletten Kontext ohne dass du Dateien durchsuchen musst.
---

# WR-Lernplattform — Vollständiger Überblick

## Projekt
Lernplattform für die Abschlussprüfung Wirtschaft & Recht (WR) und Finanz- & Rechnungswesen (FRW) für Schweizer Berufsschüler.

**Deployment:** Vercel (automatisch bei git push auf `main`) + Supabase PostgreSQL
**Stack:** Next.js (App Router), TypeScript, Prisma ORM, PostgreSQL, Tailwind CSS
**Repo:** `c:\ÜBUNGSTOOL ABSCHLUSSPRÜFUNG WR\wr-lernplattform`
**DB-Verbindung:** `.env` → `DATABASE_URL` (Supabase Pooler, Port 6543)
**Seed-Scripts ausführen:** `DATABASE_URL="..." node scripts/seed-xyz.mjs`

---

## Ordnerstruktur

```
src/
  app/
    page.tsx                  — Dashboard/Startseite
    topics/page.tsx           — Themenübersicht (WR + FRW, mit Filter-Tabs)
    topics/[slug]/page.tsx    — Einzelnes Thema mit Kapitelliste
    chapters/[id]/page.tsx    — Kapitelseite (Summary, Goals, Terms, Quiz)
    quiz/[chapterId]/page.tsx — Quiz
    admin/page.tsx            — Admin-Dashboard
    api/                      — API Routes (topics, chapters, quiz, progress, etc.)
  components/
    TopicIcon.tsx
    FloatingChat.tsx          — KI-Assistent
    AdminMessagePopup.tsx
prisma/schema.prisma          — DB-Schema
scripts/                      — Seed-Scripts (.mjs)
Inhalt/FRW/                   — Quellmaterial (PDFs, Fotos, Zusammenfassungen)
```

---

## Datenbank-Schema (alle Modelle)

| Modell | Zweck |
|--------|-------|
| `User` | Benutzer, isAdmin, isBanned, emailVerified |
| `Topic` | Thema (slug, title, examType, category, published, order) |
| `Chapter` | Kapitel eines Topics (slug, summary, order, contentStatus) |
| `LearningGoal` | Lernziele eines Kapitels |
| `KeyTerm` | Schlüsselbegriffe mit Definition |
| `CorePoint` | Kernpunkte / Merksätze |
| `Example` | Buchungsbeispiele |
| `QuizQuestion` | Multiple-Choice-Frage (difficulty, explanation) |
| `QuizOption` | Antwortoptionen (isCorrect) |
| `QuizAttempt` | Quiz-Versuch eines Users |
| `ChapterProgress` | Lernfortschritt pro User+Kapitel |
| `Feedback` | User-Feedback (status: pending/reviewed) |
| `AdminMessage` | Popup-Nachrichten vom Admin an User |
| `ActivityLog` | Live-Log aller Aktionen (page, action, detail) |

---

## Summary-Format (WICHTIG)

Das `summary`-Feld wird vom `SummaryText`-Komponenten in `src/app/chapters/[id]/page.tsx` gerendert.

**Pflichtformat:**
```
ÜBERSCHRIFT — Satz 1. Satz 2. Satz 3.
ZWEITE ÜBERSCHRIFT — Weitere Punkte. Noch mehr.
```

- `ÜBERSCHRIFT —` (mit em-Dash `—`) = wird als Abschnittsheading angezeigt
- Jeder Satz danach = ein Aufzählungspunkt
- Kein HTML, keine Markdown-Formatierung
- Alternative: `Gross geschriebener Text: Satz.` (Doppelpunkt-Format)

---

## Themen-Struktur

### WR (Wirtschaft & Recht)
- category: `bwl`, `vwl`, oder `recht`
- examType: `querschnitt`, `abschluss`, oder `both`
- Alle published, fertig befüllt

### FRW (Finanz- & Rechnungswesen)
- category: `frw`
- **Status: GESPERRT** — werden aktuell überarbeitet
- Auf `topics/page.tsx`: rotes Banner + Maintenance-Cards (nicht klickbar)
- Grund: Zusammenfassungen waren ungenau — werden neu aus hep-Lehrmittel Band 1/2/3 geschrieben

**FRW Topics in DB (alle `published: true`, aber gesperrt in UI):**
- frw-warenkonten, frw-mehrwertsteuer, frw-loehne-gehaelter
- frw-fremde-waehrungen, frw-verrechnungssteuer, frw-abschreibungen
- frw-zeitliche-abgrenzungen, frw-verluste-forderungen, frw-immobilien
- frw-wertschriften, frw-rechtsformen, frw-bewertungsvorschriften
- frw-bilanz-erfolgsrechnung, frw-kennzahlenanalyse, frw-kostenrechnung, frw-geldflussrechnung

**Kapitelstruktur pro FRW-Topic:** je 2 Kapitel (Band 1 = order 1, Band 2 = order 2)

---

## Filter-System (topics/page.tsx)

Filter-Tabs: **Alle | QSP | AP | BWL | VWL | Recht | FRW**

- QSP/AP: filtert BEIDE Sektionen (WR + FRW) nach examType
- BWL/VWL/Recht: nur WR-Sektion
- FRW: nur FRW-Sektion
- FRW-Tab ist grün gefärbt

---

## Offene Aufgaben (TODO)

**FRW-Zusammenfassungen neu schreiben (aus Quellmaterial!):**
1. Quellfotos/PDFs in `Inhalt/FRW/` lesen — NICHTS erfinden
2. Kap 2 Fremde Währung | Kap 3 Verluste aus Forderungen | Kap 4 Abschreibungen
3. Kap 5 Zeitliche Abgrenzungen | Kap 6 Löhne & Gehälter
4. Kap 7 Einzelunternehmung | Kap 8 AG & Gewinnverteilung
5. Kap 9 Bewertungsvorschriften & Stille Reserven | Kap 11 Bilanzanalyse
6. Alle 18 Kapitel-Summaries in DB hochladen (`update-summaries-band2.mjs` als Vorlage)
7. Band 1 und Band 3 Inhalte folgen später

**Quellmaterial:**
- `Inhalt/FRW/` — Fotos und PDFs der hep-Lehrmittel Bände
- `Inhalt/FRW/Zusammenfassung Claude/BAND 2 ZUSAMMENFASSUNF CLAUDE.txt` — vorhandene Zusammenfassung (als Ausgangspunkt, aber Original-Buch hat Vorrang)

---

## Arbeitsweise (PFLICHT)

Der User möchte wie mit einem professionellen Webentwickler zusammenarbeiten:
- **Vor jeder Änderung:** Preview-Skill beachten (was ändert sich, wie sieht es aus)
- **User gibt Aufgabe → ich liefere fertiges Ergebnis** — kein Hin-und-Her
- Immer zuerst relevante Dateien lesen, dann erst ändern
- Bei wirklich unklaren Aufgaben: EINE kurze Frage, dann ausführen
