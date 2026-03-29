import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = "# Die Verrechnungssteuer (Schweiz) — Kapitel 12.4\n\n## Überblick\n\nDie **Verrechnungssteuer** ist eine schweizerische Steuer auf bestimmte Vermögenserträge. Ihr Standardsatz beträgt **35 %**. Sie wird direkt an der Quelle — also bei der auszahlenden Stelle (in der Regel die Bank) — abgezogen, bevor dem Berechtigten der Nettobetrag gutgeschrieben wird.\n\nDas System ist bewusst als **Sicherungssteuer** konzipiert: Wer seine Kapitalerträge und das zugrunde liegende Vermögen korrekt deklariert, erhält die einbehaltenen 35 % zurück. Wer nicht deklariert, verliert die Rückerstattung und riskiert zusätzlich **Nachsteuern und Strafsteuern**.\n\n---\n\n## 1. Steuerbare Ertragsarten\n\nDie folgenden Vermögenserträge unterliegen der Verrechnungssteuer:\n\n| Ertragsart | Steuersatz | Besonderheit |\n|---|---|---|\n| Zinserträge auf Bankkonten | 35 % | Nur über CHF 200 |\n| Obligationenzinsen | 35 % | Auf Wertschriften |\n| Dividenden (Aktien) | 35 % | Beteiligungserträge |\n| Lotteriegewinne | 35 % | Nur über CHF 1'000'000 |\n| Kapitalauszahlungen gemischte Lebensversicherungen | **8 %** | **Spezialsatz** — Ausnahme vom Regelsatz |\n\n> **Merke:** Der Spezialsatz von 8 % gilt ausschliesslich für Kapitalauszahlungen aus gemischten Lebensversicherungen. In allen anderen Fällen gilt der Regelsatz von 35 %.\n\n---\n\n## 2. Der Mechanismus: Abzug an der Quelle\n\n### Die 65/35-Regel\n\nSobald ein steuerbarer Kapitalertrag entsteht, gilt folgende Aufteilung:\n\n- **65 %** des Bruttoertrags → werden dem Bankkunden gutgeschrieben oder ausbezahlt\n- **35 %** des Bruttoertrags → werden von der Bank an die **Eidgenössische Steuerverwaltung (ESTV)** abgeliefert\n\n**Beispielrechnung:**\nEin Bankkonto erzielt Habenzinsen von CHF 100 (Brutto):\n- Gutschrift an Kunden: CHF 65 (= 65 %)\n- Ablieferung an ESTV: CHF 35 (= 35 %)\n\nDer Kunde erhält **zunächst** nur CHF 65 ausbezahlt. Die fehlenden CHF 35 sind kein definitiver Verlust — sie können über die Steuererklärung zurückgefordert werden.\n\n### Prozessablauf: Drei Akteure\n\n```\nBANKKUNDE  ←── 65 % Nettobetrag ──  BANK  ──── 35 % VST ────→  ESTV\n    │                                                              │\n    └──────── Rückerstattungsantrag (Steuererklärung) ────────────┘\n                    ↑ Voraussetzung: korrekte Deklaration\n``"

**Schritt für Schritt:**
1. Ein steuerbarer Vermögensertrag entsteht (z. B. Habenzins, Dividende)
2. Die Bank zieht 35 % Verrechnungssteuer ab
3. Der Nettobetrag (65 %) wird dem Kunden gutgeschrieben
4. Die Bank überweist die 35 % an die Eidgenössische Steuerverwaltung
5. Der Kunde deklariert in der Steuererklärung: Ertrag als Einkommen, Kapital als Vermögen
6. Die ESTV erstattet die 35 % an den Kunden zurück

---

## 3. Rückerstattung — Voraussetzungen und Verfahren

### Wer hat Anspruch?

Grundsätzlich in der **Schweiz wohnhafte Personen**, die ihre Kapitalerträge und das zugrunde liegende Vermögen ordnungsgemäss deklarieren.

### Doppelte Deklarationspflicht

Die Rückerstattung ist an **zwei Bedingungen** geknüpft:

1. **Kapitalertrag als Einkommen deklarieren** — z. B. Zinsen und Dividenden im Steuerformular angeben
2. **Zugrunde liegendes Kapital als Vermögen deklarieren** — das Bankguthaben oder die Wertschriften im Vermögensverzeichnis ausweisen

> **Wichtig:** Es genügt nicht, nur den Ertrag zu deklarieren. Auch das zugrunde liegende Kapital muss offengelegt werden.

### Das Wertschriftenverzeichnis

Das **Wertschriftenverzeichnis** ist der zentrale Teil der Steuererklärung für die Rückforderung der Verrechnungssteuer. Darin werden:
- Wertschriften (Aktien, Obligationen etc.) aufgeführt
- Erzielte Erträge (Dividenden, Zinsen) angegeben
- Der Rückerstattungsanspruch geltend gemacht

Das Wertschriftenverzeichnis ist somit die **Brücke zwischen Steuerrecht und Rückerstattungsverfahren**.

---

## 4. Sicherungsfunktion der Verrechnungssteuer

Die Verrechnungssteuer hat **keinen primär fiskalischen Zweck** — sie soll nicht dauerhaft Einnahmen generieren, sondern die **korrekte Besteuerung von Vermögen und Vermögenserträgen sicherstellen**.

### Anreizmechanismus

Das System schafft einen starken wirtschaftlichen Anreiz zur vollständigen Deklaration:

| Verhalten | Folge |
|---|---|
| Korrekte Deklaration (Einkommen + Vermögen) | 35 % werden zurückerstattet → keine Steuermehrbelastung |
| Keine oder unvollständige Deklaration | Keine Rückerstattung → 35 % gehen definitiv verloren |
| Nichtdeklaration und spätere Aufdeckung | Steuerhinterziehung → Nachsteuern + Strafsteuern |

### Das Vier-Schritt-Prinzip

Das Kernsystem lässt sich als einfaches Muster beschreiben:

**Abzug → Ablieferung → Deklaration → Rückerstattung**

1. **Abzug:** Bank behält 35 % ein
2. **Ablieferung:** 35 % gehen an die ESTV
3. **Deklaration:** Steuerpflichtiger offenbart Ertrag und Kapital
4. **Rückerstattung:** ESTV zahlt die 35 % zurück

Wer Schritt 3 auslässt, erhält keine Rückerstattung (Schritt 4).

---

## 5. Steuerhinterziehung und Sanktionen

### Definition

**Steuerhinterziehung** liegt vor, wenn Kapitalerträge und/oder das zugrunde liegende Vermögen in der Steuererklärung nicht deklariert werden.

### Folgen

- **Keine Rückerstattung** der Verrechnungssteuer
- Bei späterer Aufdeckung: **Nachsteuern** (Rückforderung der zu wenig bezahlten ordentlichen Steuern)
- Zusätzlich: **Strafsteuern** als Sanktion

> Die Verrechnungssteuer wirkt damit auch als **Kontroll- und Sanktionsmechanismus** im schweizerischen Steuersystem.

---

## 6. Praxisbezug: Kontokorrentkonto und Quartalsabschluss

Ein praxisnaher Anwendungsfall ist das **quartalsweise abgeschlossene Kontokorrentkonto**:

- Bei jedem Quartalsabschluss werden die aufgelaufenen Habenzinsen berechnet
- Die Bank zieht sofort 35 % Verrechnungssteuer ab
- Dem Kunden werden nur 65 % der Zinsen gutgeschrieben
- Der Steuerabzug erfolgt also **periodisch wiederkehrend** — nicht nur einmal jährlich

Dieser Aspekt macht deutlich, dass die Verrechnungssteuer nicht ein theoretisches Steuerrecht-Konzept ist, sondern direkt in den laufenden Kontoführungsprozess eingebettet ist.

---

## 7. Buchhalterische Behandlung: Konto „Forderung Verrechnungssteuer"

### Das Konto in der Bilanz

Die einbehaltene Verrechnungssteuer ist aus Sicht des Berechtigten **kein Aufwand**, sondern ein **Vermögenswert** — nämlich ein Rückerstattungsanspruch gegenüber der ESTV.

| Merkmal | Wert |
|---|---|
| Kontoname | Forderung Verrechnungssteuer |
| Kontoart | **Aktivkonto** |
| Bilanzposition | Umlaufvermögen → Forderungen |
| Gegenpartei | Eidgenössische Steuerverwaltung |

### Buchungslogik

Die Verrechnungssteuer führt zu folgender buchhalterischer Logik:

- **Bruttoprinzip:** Der Bruttoertrag ist wirtschaftlich vollständig entstanden
- **Liquiditätszufluss:** Zunächst fliesst nur der Nettobetrag (65 %) als Liquidität zu
- **Forderungsposition:** Die restlichen 35 % bleiben als Anspruch (Forderung) bestehen
- **Aktivierung:** Die Forderung wird in der Bilanz unter den Forderungen ausgewiesen

> **Analogie:** Das Konto „Forderung Verrechnungssteuer" funktioniert analog zu Forderungen aus Lieferungen und Leistungen — es ist ein Guthaben gegenüber einem Dritten (hier: dem Staat).

### Buchungssatz (konzeptionell)

**Bei Entstehung eines Zinsertrags mit Verrechnungssteuerabzug:**

| Soll | Haben |
|---|---|
| Bank / Kontokorrent (65 %) | Zinsertrag (100 %) |
| Forderung Verrechnungssteuer (35 %) | — |

**Bei Rückerstattung durch die ESTV:**

| Soll | Haben |
|---|---|
| Bank (35 %) | Forderung Verrechnungssteuer (35 %) |

---

## 8. Wichtige Begriffe und Definitionen

### Verrechnungssteuer
Schweizer Quellensteuer auf bestimmte Vermögenserträge. Regelsatz: **35 %**. Zweck: Sicherstellung der korrekten Besteuerung. Rückerstattbar bei ordnungsgemässer Deklaration.

### Kapitalertrag
Ertrag aus einer Kapitalanlage. Umfasst Zinserträge, Dividenden und Obligationenzinsen. Bildet die Bemessungsgrundlage der Verrechnungssteuer.

### Habenzins
Zinsgutschrift auf einem Bankguthaben. Typischer Anwendungsfall der Verrechnungssteuer im Bankalltag.

### Dividende
Gewinnanteil aus einer Aktienbeteiligung. Unterliegt der 35%igen Verrechnungssteuer.

### Obligationenzins
Ertrag aus einer Obligation (Anleihe). Unterliegt der 35%igen Verrechnungssteuer.

### Wertschriftenverzeichnis
Teil der Steuererklärung. Listet Wertschriften und deren Erträge auf. Instrument zur Geltendmachung der Verrechnungssteuer-Rückerstattung.

### Eidgenössische Steuerverwaltung (ESTV)
Schweizer Bundesbehörde. Empfängt die einbehaltene Verrechnungssteuer von der Bank. Zahlt die Rückerstattung an berechtigte Steuerpflichtige.

### Forderung Verrechnungssteuer
Aktivkonto in der Buchhaltung. Erfasst den Rückerstattungsanspruch gegenüber der ESTV. Wird in der Bilanz unter Forderungen ausgewiesen.

### Steuerhinterziehung
Nichtdeklaration von Kapitalerträgen und/oder Vermögen. Führt zum Verlust der Rückerstattung sowie bei Aufdeckung zu Nachsteuern und Strafsteuern.

### Nachsteuern
Rückwirkend erhobene ordentliche Steuern, wenn Einkommen oder Vermögen zu spät oder nicht deklariert wurde.

### Strafsteuern
Zusätzliche Steuern als Sanktion bei aufgedeckter Steuerhinterziehung.

---

## 9. Zusammenfassung der Steuersätze

| Fallgruppe | Satz |
|---|---|
| Zinserträge auf Bankkonten (über CHF 200) | 35 % |
| Obligationenzinsen | 35 % |
| Dividenden | 35 % |
| Lotteriegewinne (über CHF 1'000'000) | 35 % |
| Kapitalauszahlungen gemischte Lebensversicherungen | **8 %** |

---

## 10. Systemlogik auf einen Blick

```
Bruttoertrag CHF 100
        │
        ├──── 65 % ────→  Bankkunde (Gutschrift sofort)
        │
        └──── 35 % ────→  ESTV (Ablieferung durch Bank)
                              │
                              │ ← Rückerstattungsantrag via Steuererklärung
                              │    (Voraussetzung: korrekte Deklaration)
                              │
                              └──→  Bankkunde (Rückerstattung 35 %)
```

**Nettoresultat bei korrekter Deklaration:** Kunde erhält 100 % — es verbleibt nur die ordentliche Einkommens-/Vermögenssteuer auf die Erträge.

**Nettoresultat ohne Deklaration:** Kunde erhält nur 65 % — 35 % gehen definitiv verloren. Bei Aufdeckung: zusätzlich Nachsteuern + Strafsteuern.

---

## 11. Prüfungsfragen und Antworten

**F: Was ist die Verrechnungssteuer und welchem Zweck dient sie?**
A: Die Verrechnungssteuer ist eine schweizerische Quellensteuer auf bestimmte Vermögenserträge (Regelsatz 35 %). Sie dient als Sicherungssteuer, die die korrekte Deklaration von Einkommen und Vermögen in der Steuererklärung erzwingen soll.

**F: Warum erhält der Bankkunde nur 65 % des Kapitalertrags ausbezahlt?**
A: Weil die Bank 35 % als Verrechnungssteuer direkt einbehält und an die Eidgenössische Steuerverwaltung abliefert. Dem Kunden werden nur die verbleibenden 65 % gutgeschrieben.

**F: Welche Voraussetzungen müssen erfüllt sein, damit die 35 % zurückerstattet werden?**
A: Zwei Voraussetzungen: (1) Kapitalertrag als Einkommen deklarieren und (2) zugrunde liegendes Kapital als Vermögen deklarieren — beides im Rahmen der Steuererklärung (Wertschriftenverzeichnis).

**F: Weshalb muss auch das zugrunde liegende Kapital und nicht nur der Ertrag deklariert werden?**
A: Weil die Verrechnungssteuer nicht nur die Besteuerung der Erträge, sondern auch die vollständige Offenlegung des Vermögens sicherstellen soll.

**F: Wie schafft die Verrechnungssteuer einen Anreiz zur Deklaration?**
A: Wer nicht deklariert, verliert die 35 % definitiv. Nur bei korrekter Deklaration erfolgt die Rückerstattung. Der finanzielle Anreiz zur Offenlegung ist damit direkt im System eingebaut.

**F: Welche Ertragsarten unterliegen der Verrechnungssteuer?**
A: Zinserträge auf Bankkonten (über CHF 200), Obligationenzinsen, Dividenden, Lotteriegewinne (über CHF 1'000'000) sowie Kapitalauszahlungen aus gemischten Lebensversicherungen (mit Spezialsatz 8 %).

**F: Was passiert bei Steuerhinterziehung (Nichtdeklaration)?**
A: Keine Rückerstattung der Verrechnungssteuer. Bei späterer Aufdeckung: Nachsteuern (Rückforderung zu wenig bezahlter ordentlicher Steuern) und Strafsteuern als Sanktion.

**F: Was ist das Konto "Forderung Verrechnungssteuer" und wie ist es bilanziert?**
A: Es ist ein Aktivkonto, das den Rückerstattungsanspruch des Steuerpflichtigen gegenüber der ESTV erfasst. Es wird in der Bilanz unter den Forderungen (Umlaufvermögen) ausgewiesen — analog zu Forderungen aus Lieferungen und Leistungen.

**F: Wozu dient das Wertschriftenverzeichnis?**
A: Das Wertschriftenverzeichnis ist der Teil der Steuererklärung, in dem Wertschriften und deren Erträge deklariert werden. Es ist das Instrument, mit dem der Steuerpflichtige seinen Rückerstattungsanspruch geltend macht.

**F: Welcher Spezialsatz gilt bei gemischten Lebensversicherungen?**
A: 8 % — im Unterschied zum allgemeinen Satz von 35 %.

**F: Welche Beziehung besteht zwischen Steuerabzug und buchhalterischer Forderung?**
A: Was steuerrechtlich ein Abzug (35 % werden einbehalten) ist, wird buchhalterisch zu einem Vermögenswert: der einbehaltene Betrag ist ein Rückerstattungsanspruch und damit eine Forderung in der Bilanz.

**F: Wie oft kann die Verrechnungssteuer abgezogen werden?**
A: Sie kann periodisch anfallen — z. B. bei jedem Quartalsabschluss eines Kontokorrentkontos, wenn Habenzinsen gutgeschrieben werden.

---

## 12. Interne Zusammenhänge

Die Inhalte dieses Kapitels sind eng miteinander verknüpft:

- **Steuerbare Erträge** → bilden den Ausgangspunkt
- **Steuerabzugsmechanismus** → greift automatisch bei jeder Auszahlung
- **Rückerstattungslogik** → ohne Abzug kein Anspruch; ohne Deklaration kein Recht
- **Sicherungsfunktion** → erklärt, warum das System so gestaltet ist
- **Buchhalterische Forderung** → übersetzt Steuerrecht in Bilanzlogik

Der rote Faden des gesamten Kapitels ist das Vier-Schritt-Muster:
**Abzug → Ablieferung → Deklaration → Rückerstattung**

---

## 13. Verbindung zu anderen Themen

- **Einkommensteuer / Vermögenssteuer:** Kapitalerträge sind einkommenssteuerpflichtig; das zugrunde liegende Kapital ist vermögenssteuerpflichtig — beides Voraussetzung für Rückerstattung
- **Steuererklärung und Steuerverfahren:** Rückerstattung erfolgt im Rahmen des ordentlichen Veranlagunsgverfahrens
- **Steuerstrafrecht:** Nichtdeklaration führt zu Steuerhinterziehung mit Nachsteuern und Strafsteuern
- **Finanzbuchhaltung:** Konto "Forderung Verrechnungssteuer" verbindet Steuerrecht mit doppelter Buchhaltung
- **Wertschriften und Kapitalmarkt:** Zinsen, Obligationen, Dividenden sind zentrale Wertschrifterträge
- **Bankbuchhaltung:** Kontokorrentkonto, Quartalsabschluss, Habenzins

---

## 14. Kernaussagen zur Wiederholung

- Die Verrechnungssteuer beträgt grundsätzlich **35 %**; bei gemischten Lebensversicherungen gilt ein Spezialsatz von **8 %**
- Steuerbar sind: Zinserträge (über CHF 200), Obligationenzinsen, Dividenden, Lotteriegewinne (über CHF 1 Mio.), Kapitalauszahlungen aus gemischten LV
- Die Bank zieht 35 % direkt ab und überweist diesen Betrag an die **Eidgenössische Steuerverwaltung**
- Dem Kunden werden nur **65 %** des Bruttoertrags gutgeschrieben
- Rückerstattung ist möglich bei korrekter Deklaration von **Ertrag als Einkommen** und **Kapital als Vermögen**
- Das Instrument für die Rückforderung ist das **Wertschriftenverzeichnis** in der Steuererklärung
- Die Verrechnungssteuer ist eine **Sicherungssteuer** — ihr Zweck ist nicht primär Staatseinnahmen, sondern korrekte Besteuerung
- Nichtdeklaration = **Steuerhinterziehung** → Nachsteuern und Strafsteuern
- Buchhalterisch ist die einbehaltene VST ein **Aktivkonto** ("Forderung Verrechnungssteuer") unter den Forderungen
- Die Forderung gegenüber der ESTV ist analog zu einer gewöhnlichen Kundenforderung zu behandeln
`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  const res = await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = ANY($2::uuid[])`,
    [SUMMARY, ['c17edd2c-23f6-412d-9afa-67de2f1d91c9', '9a92cc88-b280-4968-ba0b-043146ab5e56']]
  )
  console.log(`Updated ${res.rowCount} verrechnungssteuer chapters (${SUMMARY.length} characters)`)
  await client.end()
}
main().catch(console.error)
