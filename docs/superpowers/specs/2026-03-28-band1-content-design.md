# Band 1 FRW Content — Design Spec

**Datum:** 2026-03-28
**Status:** Approved

## Überblick

Band 1-Inhalte (5 neue FRW-Topics) in die bestehende `/frw`-Seite integrieren. Die Seite zeigt zwei Sektionen: erst Band 2 (bestehend), dann Band 1 (neu). Beide Sektionen nutzen denselben Layout-Code; die Trennung erfolgt durch eine Sektion-Überschrift.

---

## Neue Topics (Band 1)

| Slug | Titel | Kapitel-Nr | Quellmaterial |
|------|-------|------------|---------------|
| `frw-band1-grundlagen` | Grundlagen der Buchhaltung | Kap. 1–8 | `FRW/Band 1/Bilanz.../wissensbasis_buchhaltung_schweiz.md` |
| `frw-band1-warenkonten` | Warenkonten | Kap. 9 | `FRW/Band 1/Warenkonto/warenkonten_wissensextraktion.md` |
| `frw-band1-mwst` | Mehrwertsteuer (MWST) | Kap. 11 | `FRW/Band 1/MWST/mehrwertsteuer_wissensextrakt.md` |
| `frw-band1-vst` | Verrechnungssteuer (VST) | Kap. 12.4 | `FRW/Band 1/VST/verrechnungssteuer_wissensmodul.md` |
| `frw-band1-fremde-waehrungen` | Fremde Währungen (Grundlagen) | Kap. 2 | `FRW/Band 2/Fremde Währung/fremde_waehrungen_wissensbasis (1).md` |

**DB-Felder pro Topic:**
```js
{
  slug: 'frw-band1-grundlagen',
  title: 'Grundlagen der Buchhaltung',
  description: '...',
  category: 'frw',
  examType: 'abschluss',
  published: true,
  band: '1',
  order: 1  // aufsteigend innerhalb Band 1
}
```

Jedes Topic erhält genau **1 Kapitel** (order: 1) mit Summary, LearningGoals, KeyTerms, CorePoints und QuizQuestions.

---

## UI-Änderung: `/frw/page.tsx`

**Jetzt:** Eine flache Liste aller FRW-Topics (alle sind Band 2, gesperrt).

**Neu:** Zwei Sektionen:

```
## Band 2 — Vertiefung
[bestehende gesperrte Karten]

## Band 1 — Grundlagen
[neue Band 1 Karten, klickbar]
```

**Implementierung:**
- `getFrwData` gibt Topics zurück (bereits sortiert nach `order`)
- Aufteilung: `band2Topics = topics.filter(t => t.band === '2')`, `band1Topics = topics.filter(t => t.band === '1')`
- Band 1 Karten sind **nicht gesperrt** (kein Maintenance-Overlay), da der Inhalt fertig ist
- Band 1 Karten zeigen denselben Progress-Badge wie Band 2

---

## Seed Scripts (5 Stück)

Jedes Script folgt dem Muster von `scripts/seed-frw-band2-kap2.mjs`:

1. `scripts/seed-frw-band1-grundlagen.mjs`
2. `scripts/seed-frw-band1-warenkonten.mjs`
3. `scripts/seed-frw-band1-mwst.mjs`
4. `scripts/seed-frw-band1-vst.mjs`
5. `scripts/seed-frw-band1-fremde-waehrungen.mjs`

Jedes Script:
- Liest Inhalte aus dem Quellmaterial (Markdown-Dateien)
- Erstellt Topic + 1 Chapter + Goals + Terms + CorePoints + Examples (falls vorhanden) + 5 QuizQuestions
- Verwendet `pg` Client mit `DATABASE_URL` aus `.env`
- Idempotent: löscht bestehende Daten für den Slug zuerst (oder upsert)

---

## Nicht in Scope

- Band 3 Inhalte (folgen später)
- Entsperren der bestehenden Band 2 Topics (separates Projekt)
- Änderungen an Quiz-Logik, Auth, Admin-Panel
