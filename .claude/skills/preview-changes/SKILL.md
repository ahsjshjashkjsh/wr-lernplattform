---
name: preview-changes
description: Workflow-Regel die bei JEDER Code- oder Datenbankänderung greift. Wenn der User eine Aufgabe gibt die Code, Dateien oder die DB verändert, MUSS Claude zuerst eine klare Vorschau zeigen bevor er irgendetwas ausführt. Warte auf explizite Zustimmung. Gilt IMMER — keine Ausnahmen.
---

# Preview-Changes — Änderungsvorschau vor Ausführung

## Pflichtablauf bei JEDER Änderung

**Schritt 1 — Analyse (intern, still)**
Relevante Dateien lesen und verstehen was geändert werden muss.

**Schritt 2 — Vorschau zeigen (BEVOR irgendetwas geändert wird)**

Zeige dem User folgendes in klarer, einfacher Sprache:

```
📋 Was ich ändern werde:

📁 Datei: src/app/topics/page.tsx (Zeile 48)
✏️  Änderung: Den Text "Nicht fertig" ersetzen durch "Fehler — in Bearbeitung"

👁️ So sieht es danach aus:
  Vorher: "Nicht fertig – aber kann man schon benutzen."
  Nachher: "Fehler – Die FRW-Themen werden überarbeitet."

Soll ich das so umsetzen?
```

**Schritt 3 — Warten**
Nicht ausführen bis der User explizit zustimmt.

Gültige Zustimmungen: "ja", "ok", "mach es", "passt", "gut", "yes", "go", "👍" oder ähnliches.

Bei Ablehnung oder Änderungswunsch: anpassen und erneut Vorschau zeigen.

---

## Format der Vorschau

Passe die Ausführlichkeit an die Komplexität an:

**Kleine Änderung (1-2 Zeilen):**
> Ich ändere in `topics/page.tsx` den Bannertext von "Nicht fertig" zu "Fehler – in Bearbeitung". Ok?

**Mittlere Änderung (mehrere Stellen):**
Aufzählung der betroffenen Dateien mit je einer Zeile Erklärung was sich ändert und was der User auf der Plattform sehen wird.

**Grosse Änderung (Feature / DB-Änderung):**
Strukturierte Vorschau mit:
- Welche Dateien werden geändert
- Was ändert sich in der UI (wie sieht es für den User aus)
- Falls DB: welche Daten werden geschrieben/geändert

---

## Ausnahmen (keine Vorschau nötig)

- Reine Leseoperationen (Dateien lesen, DB abfragen)
- `git status`, `git log`, `git diff`
- Analyse ohne Änderung

---

## Beispiele

**Gut:**
> Ich füge in `topics/page.tsx` einen neuen Filter-Tab "FRW" hinzu (grün gefärbt). Wenn man draufklickt, sieht man nur die FRW-Themen. Der Tab erscheint rechts neben "Recht". Soll ich das umsetzen?

**Schlecht (nicht erlaubt):**
> *(Ändert direkt den Code ohne Vorschau)*

---

## Warum dieser Workflow?

Der User hat explizit darum gebeten, weil frühere Änderungen mehrfach korrigiert werden mussten. Die Vorschau stellt sicher, dass wir beide das gleiche Ziel vor Augen haben — bevor Zeit und Aufwand in die falsche Richtung fliessen.
