---
active: true
iteration: 1
max_iterations: 20
completion_promise: "SEED KOMPLETT"
started_at: "2026-03-23T00:00:00Z"
---

Du arbeitest an der WR-Lernplattform. Deine Aufgabe ist es, prisma/seed.ts komplett zu erweitern mit Inhalten aus den Markdown-Zusammenfassungen und 30-50 Quiz-Fragen pro Thema.

## QUELLEN (lies diese Dateien):
- Zusammenfassungen/Zusammenfassng Thema/01_Marketing.md
- Zusammenfassungen/Zusammenfassng Thema/02_Finanzierung.md
- Zusammenfassungen/Zusammenfassng Thema/03_Kapitalanlagen_und_Banken_und_Boersen.md
- Zusammenfassungen/Zusammenfassng Thema/04_Versicherungen.md
- Zusammenfassungen/Zusammenfassng Thema/05_Allgemeine_Vertragslehre_und_Kaufvertrag.md
- Zusammenfassungen/Zusammenfassng Thema/06_Vertraege_auf_Arbeitsleistung.md
- Zusammenfassungen/Zusammenfassng Thema/07_Gesellschaftsrecht_und_Handelsregister.md
- Zusammenfassungen/Zusammenfassng Thema/08_Familien_und_Erbrecht_kombiniert.md
- Zusammenfassungen/Zusammenfassng Thema/09_Erbrecht.md
- Zusammenfassungen/Zusammenfassng Thema/10_Wirtschaftskreislauf_und_leistung.md
- Zusammenfassungen/Zusammenfassng Thema/11_Preisbildung.md
- Zusammenfassungen/Zusammenfassng Thema/12_Geld_und_Preisstabilitaet.md
- Zusammenfassungen/Zusammenfassng Thema/13_Konjunktur_und_Konjunkturpolitik.md

## VORHANDENE STRUKTUR (lies prisma/seed.ts):
Die seed.ts hat bereits Marketing und weitere Topics. Lies die KOMPLETTE seed.ts um zu verstehen was bereits drin ist.

## DEINE AUFGABE PRO ITERATION:
Arbeite THEMA FÜR THEMA. Pro Iteration bearbeite 1-2 Themen vollständig:

1. Lies die Markdown-Datei des Themas
2. Finde das passende Topic in seed.ts (slug, title)
3. Ergänze oder ersetze die Kapitel dieses Topics mit:
   - summary: Vollständige Zusammenfassung aus der Markdown-Datei
   - learningGoals: 5-8 Lernziele
   - keyTerms: 10-15 wichtige Begriffe mit Definitionen
   - corePoints: 6-10 Kernpunkte
   - examples: 2-4 Beispiele
   - quizQuestions: 30-50 Fragen TOTAL pro Topic (verteilt auf die Kapitel)

## QUIZ-FRAGEN ANFORDERUNGEN:
Jede Frage braucht:
- questionText: Klare Frage auf Deutsch
- explanation: Erklärung warum die Antwort richtig ist
- difficulty: "easy", "medium" oder "hard"
- options: GENAU 4 Antwortmöglichkeiten (eine isCorrect: true, drei isCorrect: false)

Erstelle eine MIX aus:
- Definitionsfragen ("Was bedeutet X?")
- Anwendungsfragen ("In welchem Fall gilt X?")
- Unterscheidungsfragen ("Was ist der Unterschied zwischen X und Y?")
- Berechnungsfragen wo passend (Marktanteil, ROI, etc.)
- Fallbeispiel-Fragen ("Herr Müller macht X. Was gilt rechtlich?")

## THEMEN-MAPPING (slug in seed.ts -> Markdown-Datei):
- marketing -> 01_Marketing.md
- finanzierung -> 02_Finanzierung.md
- kapitalanlagen-banken-boersen -> 03_Kapitalanlagen...md
- versicherungen -> 04_Versicherungen.md
- vertragsrecht -> 05_Allgemeine_Vertragslehre...md
- arbeitsvertraege -> 06_Vertraege_auf_Arbeitsleistung.md
- gesellschaftsrecht -> 07_Gesellschaftsrecht...md
- familienrecht -> 08_Familien_und_Erbrecht...md
- erbrecht -> 09_Erbrecht.md
- wirtschaftskreislauf -> 10_Wirtschaftskreislauf...md
- preisbildung -> 11_Preisbildung.md
- geld-preisstabilitaet -> 12_Geld_und_Preisstabilitaet.md
- konjunktur -> 13_Konjunktur_und_Konjunkturpolitik.md

## WORKFLOW:
1. Lies ZUERST die komplette seed.ts (alle Topics die bereits existieren)
2. Lies die Markdown-Datei für das nächste zu bearbeitende Thema
3. Schreibe/ergänze den entsprechenden Block in seed.ts
4. Fahre mit dem nächsten Thema fort
5. Am Schluss: stelle sicher dass seed.ts kompiliert (kein TypeScript-Fehler, kein fehlendes Komma)

## FORTSCHRITT VERFOLGEN:
Schreibe nach jeder Iteration in eine Datei .claude/ralph-progress.md welche Themen bereits erledigt sind.

Wenn ALLE 13 Themen vollständig mit Zusammenfassungen UND 30-50 Quizfragen in seed.ts eingebaut sind, gib aus:
<promise>SEED KOMPLETT</promise>
