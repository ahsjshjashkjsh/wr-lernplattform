import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = "# Die Warenkonten — Umfassende Zusammenfassung\n\n## 1. Überblick und Lernziel\n\nDie **Warenkonten** bilden das Herzstück der Buchhaltung eines Handelsbetriebs. Ein Handelsbetrieb kauft fertige Produkte ein und verkauft sie ohne wesentliche Weiterverarbeitung zu einem höheren Preis. Dieses Kapitel erklärt, wie dieser Prozess buchhalterisch korrekt abgebildet wird.\n\nZiel des Kapitels ist es, die drei zentralen Konten zu verstehen:\n\n- **Warenaufwand** — für alle einkaufsbezogenen Geschäftsfälle\n- **Warenerlöse** — für alle verkaufsbezogenen Geschäftsfälle\n- **Warenvorrat** — für den Lagerbestand (ruhendes Konto, nur beim Jahresabschluss relevant)\n\nNur wenn Einkauf, Verkauf und Bestandesänderung korrekt verbucht werden, kann der tatsächliche **Bruttogewinn** eines Handelsbetriebs zuverlässig ermittelt werden.\n\n---\n\n## 2. Der Handelsbetrieb und seine Buchungslogik\n\nEin **Handelsbetrieb** produziert keine Waren selbst, sondern kauft sie beim Produzenten ein und verkauft sie weiter. Im Lehrbuchbeispiel kauft Elias Berger Kaffeebecher aus Edelstahl beim Produzenten ein und verkauft sie über einen Onlineshop.\n\nDie wirtschaftliche Grundlogik lautet:\n\n- **Einkauf** erzeugt **Aufwand** → Konto Warenaufwand\n- **Verkauf** erzeugt **Ertrag** → Konto Warenerlöse\n- Die Differenz zwischen Verkaufswert und Einstandswert der verkauften Waren ergibt den **Bruttogewinn**\n\nDas Lager wird gehalten, damit verschiedene Modelle sofort lieferbar sind — der Lagerbestand dient also der Verkaufsbereitschaft und der raschen Lieferung.\n\n---\n\n## 3. Das Konto Warenaufwand\n\n### Definition\n\nDas Konto **Warenaufwand** ist ein **Erfolgskonto** (Aufwandskonto) und erfasst alle Geschäftsfälle im Zusammenhang mit dem **Einkauf von Handelswaren**.\n\n### Was wird auf Warenaufwand gebucht?\n\n| Geschäftsfall | Soll/Haben | Begründung |\n|---|---|---|\n| Lieferantenrechnung eingetroffen | **Soll** (Warenaufwand) | Aufwand steigt |\n| Bezugskosten selbst getragen | **Soll** (Warenaufwand) | Teil des Beschaffungsaufwands |\n| Rücksendung an Lieferanten | **Haben** (Warenaufwand) | Aufwand sinkt |\n| Rabatt vom Lieferanten erhalten | **Haben** (Warenaufwand) | Aufwand sinkt |\n| Skonto vom Lieferanten genutzt | **Haben** (Warenaufwand) | Aufwand sinkt |\n\n### Grundregel\n\n- **Zunahme des Aufwandes → Soll**\n- **Abnahme des Aufwandes → Haben**\n\n### Wichtige Erkenntnis\n\nVor der Bestandskorrektur am Jahresende zeigt der Saldo des Kontos Warenaufwand den **Einstandswert der im laufenden Jahr eingekauften Waren**. Nach der Bestandskorrektur zeigt er den **Einstandswert der tatsächlich verkauften Waren**.\n\n---\n\n## 4. Das Konto Warenerlöse\n\n### Definition\n\nDas Konto **Warenerlöse** ist ein **Erfolgskonto** (Ertragskonto) und erfasst alle Geschäftsfälle im Zusammenhang mit dem **Verkauf von Handelswaren**.\n\n### Was wird auf Warenerlöse gebucht?\n\n| Geschäftsfall | Soll/Haben | Begründung |\n|---|---|---|\n| Rechnung an Kunden ausgestellt | **Haben** (Warenerlöse) | Ertrag steigt |\n| Rücksendung von Kunden | **Soll** (Warenerlöse) | Ertrag sinkt |\n| Rabatt an Kunden gewährt | **Soll** (Warenerlöse) | Ertrag sinkt |\n| Skonto von Kunden abgezogen | **Soll** (Warenerlöse) | Ertrag sinkt |\n| Versandkosten selbst getragen | **Soll** (Warenerlöse) | Ertrag sinkt |\n\n### Grundregel\n\n- **Zunahme des Ertrages → Haben**\n- **Abnahme des Ertrages → Soll**\n\n---\n\n## 5. Ermittlung des Einstandspreises\n\n### Konzept\n\nDer **Einstandspreis** ist der tatsächlich für die beschaffte Ware zu aktivierende bzw. als Aufwand zu verbuchende Wert. Er entspricht nicht einfach dem Katalogpreis des Lieferanten, sondern wird schrittweise berechnet.\n\n### Stufenrechnung\n\n| Schritt | Berechnung |\n|---|---|\n| 1 | Katalogpreis des Lieferanten |\n| 2 | − Rabatt (% auf Katalogpreis) |\n| 3 | = **Rechnungsbetrag** (Nettokreditankaufspreis) |\n| 4 | − Skonto (% auf Rechnungsbetrag nach Rabatt) |\n| 5 | = **Zahlungsbetrag** (Nettobarankaufspreis) |\n| 6 | + Bezugskosten |\n| 7 | = **Einstandspreis** |\n\n**Wichtig:** Das Skonto wird auf dem Rechnungsbetrag nach Rabatt berechnet — nicht auf dem ursprünglichen Katalogpreis.\n\n### Beispiel aus den Unterlagen: 100 Kaffeebecher\n\n| Position | Betrag (CHF) |\n|---|---|\n| Katalogpreis: 100 × CHF 18.00 | 1'800.00 |\n| − Rabatt 8 % | − 144.00 |\n| = Rechnungsbetrag | **1'656.00** |\n| − Skonto 2 % (auf CHF 1'656.00) | − 33.10 |\n| = Zahlungsbetrag | **1'622.90** |\n| + Bezugskosten (Transport etc.) | + 217.00 |\n| = **Einstandspreis** | **1'839.90** |\n\n**Schlussfolgerung:** Der Einstandspreis (CHF 1'839.90) kann sogar **höher sein als der Rechnungsbetrag** (CHF 1'656.00), weil Bezugskosten hinzukommen.\n\n### Komponenten des Einstandspreises\n\n**Rabatt** ist eine prozentuale Preisermässigung auf dem Katalogpreis, z.B. als Wiederverkaufs-, Mengen- oder Qualitätsrabatt.\n\n**Skonto** ist ein Abzug für rasche Zahlung und wird auf dem Rechnungsbetrag nach Rabatt berechnet. Typisch: 2 % bei Zahlung innert 10 Tagen.\n\n**Bezugskosten** sind zusätzliche Kosten der Beschaffung, die vom Käufer selbst getragen werden, beispielsweise:\n- Transportkosten\n- Zollgebühren\n- Transportversicherung\n\n---\n\n## 6. Verbuchung eines Einkaufs (Schritt für Schritt)\n\nAnhand des Beispiels mit 100 Kaffeebechern werden die Buchungssätze schrittweise dargestellt:\n\n### Buchungssätze\n\n| Geschäftsfall | Buchungssatz | Betrag (CHF) |\n|---|---|---|\n| Rechnung des Lieferanten eingetroffen | **Warenaufwand / Verb. L+L** | 1'656.00 |\n| Skonto genutzt (2 % auf CHF 1'656.00) | **Verb. L+L / Warenaufwand** | 33.10 |\n| Banküberweisung an Lieferanten | **Verb. L+L / Bank** | 1'622.90 |\n| Bezugskosten bar bezahlt | **Warenaufwand / Kasse** | 217.00 |\n\n**Ergebnis:** Das Konto Warenaufwand sammelt den effektiven Beschaffungswert CHF 1'839.90 (= 1'656.00 − 33.10 + 217.00).\n\n### Minderungen des Warenaufwandes\n\nDrei typische Fälle, die den Warenaufwand **nachträglich vermindern**:\n\n| Geschäftsfall | Buchungssatz | Logik |\n|---|---|---|\n| Rücksendung an Lieferanten | **Verb. L+L / Warenaufwand** | Umkehrung der Eingangsrechnung |\n| Nachträglicher Rabatt vom Lieferanten | **Verb. L+L / Warenaufwand** | Umkehrung der Eingangsrechnung |\n| Bezugskosten zulasten des Lieferanten | **Verb. L+L / Kasse** | Lieferant trägt die Kosten |\n\n**Prinzip:** Abzüge werden **umgekehrt zur ursprünglichen Einkaufsrechnung** verbucht.\n\n---\n\n## 7. Ermittlung des Nettoerlöses\n\n### Konzept\n\nDer **Nettoerlös** ist der tatsächliche Verkaufserlös nach Abzug aller Nachlässe. Er entspricht nicht dem fakturierten Rechnungsbetrag, wenn Rabatte, Skonto oder selbst getragene Versandkosten anfallen.\n\n### Stufenrechnung\n\n| Schritt | Berechnung |\n|---|---|\n| 1 | Katalogpreis für Kunden |\n| 2 | − Rabatt |\n| 3 | = **Rechnungsbetrag** (Nettokreditverkaufspreis) |\n| 4 | − Skonto |\n| 5 | = **Zahlungsbetrag** (Nettobarverkaufspreis) |\n| 6 | − Versandkosten (falls vom Unternehmen getragen) |\n| 7 | = **Nettoerlös** |\n\n### Beispiel aus den Unterlagen: 20 Kaffeebecher\n\n| Position | Betrag (CHF) |\n|---|---|\n| Katalogpreis: 20 × CHF 29.50 | 590.00 |\n| − Rabatt 5 % | − 29.50 |\n| = Rechnungsbetrag | **560.50** |\n| − Skonto 2 % (auf CHF 560.50) | − 11.20 |\n| = Zahlungsbetrag | **549.30** |\n| − Versandkosten | − 22.00 |\n| = **Nettoerlös** | **527.30** |\n\n**Schlussfolgerung:** Der Nettoerlös (CHF 527.30) ist deutlich kleiner als der fakturierte Rechnungsbetrag (CHF 560.50).\n\n---\n\n## 8. Verbuchung eines Verkaufs (Schritt für Schritt)\n\n### Buchungssätze\n\n| Geschäftsfall | Buchungssatz | Betrag (CHF) |\n|---|---|---|\n| Rechnung an Kunden ausgestellt | **Ford. L+L / Warenerlöse** | 560.50 |\n| Kunde zieht Skonto ab | **Warenerlöse / Ford. L+L** | 11.20 |\n| Banküberweisung des Kunden | **Bank / Ford. L+L** | 549.30 |\n| Versandkosten bar bezahlt | **Warenerlöse / Kasse** | 22.00 |\n\n**Ergebnis:** Das Konto Warenerlöse zeigt am Ende den tatsächlich verbleibenden Nettoerlös von CHF 527.30.\n\n### Minderungen der Warenerlöse\n\n| Geschäftsfall | Buchungssatz | Logik |\n|---|---|---|\n| Rücksendung vom Kunden | **Warenerlöse / Ford. L+L** | Ertragsminderung |\n| Nachträglicher Rabatt an Kunden | **Warenerlöse / Ford. L+L** | Ertragsminderung |\n| Versandkosten selbst getragen | **Warenerlöse / Kasse** | Ertragsminderung |\n\n**Prinzip:** Abzüge und Rücksendungen werden im **Soll des Kontos Warenerlöse** verbucht — als direkte Ertragsminderung.\n\n---\n\n## 9. Der Bruttogewinn\n\n### Definition und Formel\n\nDer **Bruttogewinn** ist die zentrale Erfolgsgrösse des Warenhandels und ergibt sich direkt aus den beiden Warenkonten:\n\n> **Bruttogewinn = Warenerlöse − Warenaufwand**\n\nEr repräsentiert die **Handelsspanne** vor Abzug der Gemeinkosten und ist nicht identisch mit dem Reingewinn.\n\n### Weg vom Bruttogewinn zum Reingewinn\n\n```\nWarenerlöse\n− Warenaufwand\n= Bruttogewinn\n− Gemeinkosten (Personal, Miete, etc.)\n= Reingewinn (oder Reinverlust)\n``"

### Kennzahlen zum Bruttogewinn

Zwei Kennzahlen erlauben eine differenzierte Beurteilung der Handelsspanne:

| Kennzahl | Formel | Bedeutung |
|---|---|---|
| **Bruttogewinnzuschlag** | Bruttogewinn / Warenaufwand | Spanne bezogen auf Kosten |
| **Bruttogewinnquote** | Bruttogewinn / Warenerlöse | Spanne bezogen auf Erlöse |

### Beispiel aus den Unterlagen: Jahresübersicht

| Position | Betrag (CHF) |
|---|---|
| Warenerlöse | 34'180.00 |
| Warenaufwand | 21'790.00 |
| **Bruttogewinn** | **12'390.00** |

Daraus ergibt sich:

- **Bruttogewinnzuschlag** = 12'390 / 21'790 = **56.86 %**
- **Bruttogewinnquote** = 12'390 / 34'180 = **36.25 %**

**Interpretation:** Auf jeden Franken Einkaufskosten kommen 56.86 Rappen Bruttogewinn hinzu. Vom fakturierten Verkaufserlös verbleiben 36.25 % als Bruttogewinn.

---

## 10. Das Konto Warenvorrat — das ruhende Konto

### Definition

Das Konto **Warenvorrat** ist ein **Aktivkonto** in der Bilanz und zeigt den Wert der gelagerten Handelswaren.

### Ruhendes Konto — Was bedeutet das?

Im behandelten System wird das Warenvorrat-Konto als **ruhendes Konto** geführt: Es wird **nicht laufend** mit jeder einzelnen Warenbewegung bebucht. Stattdessen werden:

- Alle Einkäufe direkt auf **Warenaufwand** gebucht
- Alle Verkäufe direkt auf **Warenerlöse** gebucht
- Die Lagerveränderung erst am **Jahresende** über eine Korrekturbuchung berücksichtigt

### Konsequenz

Weil das Warenvorrat-Konto während des Jahres ruht, zeigt der Saldo des Kontos Warenaufwand zunächst nur den Wert der **eingekauften** Waren — nicht zwingend den Wert der **verkauften** Waren. Diese Diskrepanz muss am Jahresende über die **Bestandesänderung** korrigiert werden.

---

## 11. Die Bestandesänderung

### Grundproblem

Wenn mehr Waren eingekauft als verkauft werden (oder umgekehrt), weichen Anfangsbestand und Schlussbestand voneinander ab. Dann ist der vorläufige Warenaufwand **periodenfremd** — er enthält Kosten für Waren, die noch nicht verkauft sind (oder fehlt für Waren aus dem Vorjahresbestand).

### Die drei Fälle

---

### Fall 1: Keine Bestandesänderung

**Situation:** Anfangsbestand = Schlussbestand

**Beispiel:**
| Position | Menge |
|---|---|
| Anfangsbestand | 100 Stück |
| Zukauf im Jahr | 200 Stück |
| Verkauf im Jahr | 200 Stück |
| Schlussbestand | 100 Stück |
| **Bestandesänderung** | **0** |

**Zahlen:**
- Warenaufwand: CHF 3'600.00
- Warenerlöse: CHF 6'000.00
- Bruttogewinn: CHF 2'400.00

**Buchung:** Keine Korrekturbuchung nötig.

**Begründung:** Der im Jahr eingekaufte Warenwert entspricht exakt dem Wert der verkauften Waren.

---

### Fall 2: Bestandeszunahme

**Situation:** Schlussbestand > Anfangsbestand → Es wurden mehr Waren eingekauft als verkauft.

**Konsequenz:** Ein Teil der eingekauften Waren liegt noch auf Lager und wird erst in späteren Perioden verkauft. Der vorläufige Warenaufwand ist deshalb **zu hoch**.

**Beispiel:**
| Position | Menge |
|---|---|
| Anfangsbestand | 100 Stück |
| Zukauf im Jahr | 250 Stück |
| Verkauf im Jahr | 220 Stück |
| Schlussbestand | 130 Stück |
| **Bestandeszunahme** | **+30 Stück** |

**Zahlen:**
| Position | Betrag (CHF) |
|---|---|
| Vor Korrektur: Warenaufwand | 4'500.00 |
| Lagerzunahme (30 Stück) | 540.00 |
| Nach Korrektur: Warenaufwand | **3'960.00** |
| Warenerlöse | 6'600.00 |
| **Korrekter Bruttogewinn** | **2'640.00** |

**Korrekturbuchung:**

> **Warenvorrat / Warenaufwand** CHF 540.00

**Wirkung:**
- Warenvorrat in der Bilanz steigt (mehr Vermögen)
- Warenaufwand sinkt (weniger Aufwand)
- Bruttogewinn und Reingewinn steigen

---

### Fall 3: Bestandesabnahme

**Situation:** Schlussbestand < Anfangsbestand → Es wurden mehr Waren verkauft als im laufenden Jahr eingekauft.

**Konsequenz:** Zusätzlich zu den Einkäufen des laufenden Jahres wurden auch Waren aus dem Vorjahresbestand verkauft. Der vorläufige Warenaufwand ist deshalb **zu tief**.

**Beispiel:**
| Position | Menge |
|---|---|
| Anfangsbestand | 130 Stück |
| Zukauf im Jahr | 200 Stück |
| Verkauf im Jahr | 280 Stück |
| Schlussbestand | 50 Stück |
| **Bestandesabnahme** | **−80 Stück** |

**Zahlen:**
| Position | Betrag (CHF) |
|---|---|
| Vor Korrektur: Warenaufwand | 3'600.00 |
| Lagerabnahme (80 Stück) | 1'440.00 |
| Nach Korrektur: Warenaufwand | **5'040.00** |
| Warenerlöse | 8'400.00 |
| **Korrekter Bruttogewinn** | **3'360.00** |

**Korrekturbuchung:**

> **Warenaufwand / Warenvorrat** CHF 1'440.00

**Wirkung:**
- Warenvorrat in der Bilanz sinkt (weniger Vermögen)
- Warenaufwand steigt (mehr Aufwand)
- Bruttogewinn und Reingewinn sinken

---

## 12. Übersichtstabelle: Bestandesänderung im Vergleich

| Situation | Buchung | Warenaufwand | Bruttogewinn |
|---|---|---|---|
| Kein Unterschied | — | unverändert | unverändert |
| Bestandeszunahme | Warenvorrat / Warenaufwand | sinkt | steigt |
| Bestandesabnahme | Warenaufwand / Warenvorrat | steigt | sinkt |

---

## 13. Vorgehen beim Jahresabschluss der Warenkonten

Die Unterlagen geben folgendes klares Abschlussvorgehen vor:

1. **Inventar erstellen:** Anhand des Inventars den Wert des Warenvorrates bestimmen (Schlussbestand).
2. **Warenvorrat aktualisieren:** Den Schlussbestandswert als Saldo auf der Habenseite im Konto Warenvorrat eintragen.
3. **Bestandesänderung berechnen:** Differenz zwischen Anfangsbestand und Schlussbestand ermitteln.
4. **Korrekturbuchung vornehmen:**
   - Keine Änderung → keine Buchung
   - Bestandeszunahme → **Warenvorrat / Warenaufwand**
   - Bestandesabnahme → **Warenaufwand / Warenvorrat**
5. **Korrigierten Warenaufwand verwenden:** Für die Bruttogewinnermittlung in der Erfolgsrechnung.

---

## 14. Kernbegriffe und Definitionen

### Handelsbetrieb
Unternehmen, das fertige Waren einkauft und ohne wesentliche Verarbeitung weiterverkauft. Das gesamte Kapitel baut auf dieser Geschäftslogik auf. Verbindet Einkauf, Verkauf, Lagerhaltung, Aufwand und Ertrag.

**Beispiel:** Elias Berger kauft Kaffeebecher ein und verkauft sie online weiter.

### Warenaufwand
Erfolgskonto für Geschäftsfälle im Zusammenhang mit dem Einkauf von Handelswaren. Zeigt zunächst den Wert der eingekauften Waren; nach Bestandskorrektur den Einstandswert der verkauften Waren. Gegenkonto zu Verbindlichkeiten, Kasse, Bank und bei Bestandeskorrekturen zu Warenvorrat.

**Beispiel:** Lieferantenrechnung, Bezugskosten, Lagerabnahme.

### Warenerlöse
Erfolgskonto für Geschäftsfälle im Zusammenhang mit dem Verkauf von Handelswaren. Zeigt den Nettoerlös aus dem Warenverkauf. Gegenkonto zu Forderungen, Bank, Kasse. Grundlage für die Bruttogewinnermittlung.

**Beispiel:** Rechnung an Kunden, Rabatte an Kunden, Versandkosten.

### Warenvorrat
Aktivkonto für den Bestand an Handelswaren im Lager. Wird im behandelten System als ruhendes Konto geführt und erst beim Jahresabschluss korrigiert. Verbindet Lagerbestand mit Erfolgsrechnung, weil Bestandesänderungen den Warenaufwand beeinflussen.

**Beispiel:** Lagerzunahme wird mit Warenvorrat / Warenaufwand gebucht.

### Rabatt
Prozentuale Preisermässigung auf dem Katalogpreis. Beim Einkauf reduziert Rabatt den Warenaufwand; beim Verkauf reduziert er die Warenerlöse.

**Beispiel:** 8 % Mengenrabatt vom Lieferanten; 5 % Rabatt an Kunden.

### Skonto
Preisnachlass für rasche Zahlung innerhalb einer bestimmten Frist. Beim Einkauf Minderung des Warenaufwandes; beim Verkauf Minderung der Warenerlöse. Wird auf dem Rechnungsbetrag nach Rabatt berechnet.

**Beispiel:** 2 % Skonto bei Zahlung innert zehn Tagen.

### Bezugskosten
Zusätzliche Beschaffungskosten wie Transport, Zoll oder Versicherung. Erhöhen den Einstandspreis der eingekauften Waren. Werden dem Warenaufwand zugerechnet, sofern sie zulasten des Unternehmens gehen.

**Beispiel:** Bar bezahlte Transportkosten von CHF 217.00.

### Versandkosten
Kosten der Auslieferung an Kunden. Wenn das Unternehmen sie trägt, vermindern sie die Warenerlöse. Gehören wirtschaftlich zum Verkaufsvorgang und korrigieren den Nettoerlös.

**Beispiel:** Versandkosten von CHF 22.00 im Verkaufsbeispiel.

### Einstandspreis
Tatsächlicher Beschaffungswert der Ware nach Rabatt, Skonto und Bezugskosten. Massgebend für den Warenaufwand und damit für den Bruttogewinn. Ausgangsgrösse für die Bewertung des Lagers.

> Einstandspreis = Katalogpreis − Rabatt − Skonto + Bezugskosten

**Beispiel:** CHF 1'839.90 für 100 eingekaufte Kaffeebecher.

### Nettoerlös
Tatsächlicher Verkaufserlös nach Abzug von Rabatten, Skonti und selbst getragenen Versandkosten. Massgebend für das Konto Warenerlöse. Gegenstück zum Einstandspreis.

> Nettoerlös = Katalogpreis − Rabatt − Skonto − Versandkosten

**Beispiel:** CHF 527.30 für 20 verkaufte Kaffeebecher.

### Bruttogewinn
Differenz zwischen Warenerlösen und Warenaufwand. Zeigt den direkten Erfolg des Warenhandels vor Gemeinkosten. Grundlage für Bruttogewinnzuschlag und Bruttogewinnquote.

**Beispiel:** CHF 12'390.00 im Gesamtbeispiel.

### Bruttogewinnzuschlag
Bruttogewinn in Prozent des Warenaufwandes. Misst die Handelsspanne bezogen auf die Kostenbasis.

> Bruttogewinnzuschlag = Bruttogewinn / Warenaufwand × 100

**Beispiel:** 56.86 %

### Bruttogewinnquote
Bruttogewinn in Prozent der Warenerlöse. Misst den Gewinnanteil am Verkaufserlös.

> Bruttogewinnquote = Bruttogewinn / Warenerlöse × 100

**Beispiel:** 36.25 %

### Bestandeszunahme
Schlussbestand ist höher als Anfangsbestand — ein Teil der eingekauften Waren wurde noch nicht verkauft. Korrekturbuchung: Warenvorrat / Warenaufwand; Aufwand sinkt.

**Beispiel:** Zunahme um 30 Stück bzw. CHF 540.00.

### Bestandesabnahme
Schlussbestand ist tiefer als Anfangsbestand — es wurden auch Waren aus dem Vorjahresbestand verkauft. Korrekturbuchung: Warenaufwand / Warenvorrat; Aufwand steigt.

**Beispiel:** Abnahme um 80 Stück bzw. CHF 1'440.00.

### Ruhendes Konto
Konto, das während des Geschäftsjahres nicht laufend mit jeder Einzelbewegung bebucht wird. Das Konto Warenvorrat wird nur zum Abschluss für Bestandskorrekturen verwendet. Erzeugt die Notwendigkeit, den Warenaufwand periodengerecht zu korrigieren.

---

## 15. Systematische Buchungsregeln

### Regel 1: Konto Warenaufwand

| Position | Kontoseite |
|---|---|
| Einkäufe | Soll |
| Bezugskosten zu unseren Lasten | Soll |
| Lagerabnahme (Bestandeskorrektur) | Soll |
| Rücksendungen an Lieferanten | Haben |
| Rabatte von Lieferanten | Haben |
| Skonti von Lieferanten | Haben |
| Lagerzunahme (Bestandeskorrektur) | Haben |

### Regel 2: Konto Warenerlöse

| Position | Kontoseite |
|---|---|
| Verkäufe von Waren | Haben |
| Rücksendungen von Kunden | Soll |
| Rabatte an Kunden | Soll |
| Skontoabzüge von Kunden | Soll |
| Versandkosten zu unseren Lasten | Soll |

### Regel 3: Umkehrbuchung

Abzüge für Rücksendungen, Rabatte und Skonti werden **umgekehrt** zur entsprechenden Rechnungsbuchung verbucht. Dieses Prinzip ist konsistent und wiederverwendbar.

---

## 16. Ursache-Wirkung-Beziehungen

| Ursache | Wirkung auf Warenaufwand | Wirkung auf Bruttogewinn |
|---|---|---|
| Mehr Einkauf als Verkauf (Lagerzunahme) | Sinkt nach Korrektur | Steigt |
| Mehr Verkauf als Einkauf (Lagerabnahme) | Steigt nach Korrektur | Sinkt |
| Rabatt/Skonto beim Einkauf | Sinkt | Steigt |
| Bezugskosten zu eigenen Lasten | Steigt | Sinkt |

| Ursache | Wirkung auf Warenerlöse | Wirkung auf Bruttogewinn |
|---|---|---|
| Rabatt/Skonto im Verkauf | Sinkt | Sinkt |
| Versandkosten zu eigenen Lasten | Sinkt | Sinkt |
| Kundenrücksendungen | Sinkt | Sinkt |

---

## 17. Zusammenhang der Konten: Das Gesamtsystem

Das System der Warenkonten bildet ein geschlossenes Ganzes:

```
EINKAUF
  → Warenaufwand (Soll)
  → Korrekturen: Bezugskosten, Rabatte, Skonti, Rücksendungen

LAGER (Warenvorrat — ruhend)
  → Am Jahresende: Schlussbestand per Inventar
  → Bestandesänderung als Brücke zum korrekten Warenaufwand

VERKAUF
  → Warenerlöse (Haben)
  → Korrekturen: Versandkosten, Rabatte, Skonti, Rücksendungen

ERGEBNIS
  → Bruttogewinn = Warenerlöse − korrigierter Warenaufwand
  → Reingewinn = Bruttogewinn − Gemeinkosten
```

### Die wichtigste inhaltliche Regel

> **Vor** Bestandskorrektur → Warenaufwand = Einstandswert der **eingekauften** Waren
> **Nach** Bestandskorrektur → Warenaufwand = Einstandswert der **verkauften** Waren

Erst nach dieser Korrektur ist der Bruttogewinn **periodengerecht** und korrekt interpretierbar.

---

## 18. Verbindungen zu anderen Themen

Das Thema Warenkonten verbindet sich mit zahlreichen anderen Bereichen der Buchhaltung:

- **Doppelte Buchhaltung:** Soll/Haben-Logik, Aktivkonten, Erfolgskonten, Gegenkonten
- **Erfolgsrechnung:** Bruttogewinn, Gemeinkosten, Reingewinn, Reinverlust
- **Bilanz:** Bewertung und Ausweis des Warenvorrats als Aktivum
- **Inventar und Bewertung:** Schlussbestand wird anhand des Inventars ermittelt
- **Kalkulation und Preisbildung:** Zusammenhang zwischen Einstandspreis, Verkaufspreis, Rabattpolitik und Marge
- **Periodenabgrenzung:** Aufwand soll der Periode der tatsächlichen Verkäufe zugeordnet werden
- **Lagerwirtschaft:** Bestände beeinflussen Ergebnis und Kapitalbindung

---

## 19. Prüfungs- und Verständnisfragen

1. Warum reicht es nicht aus, den Katalogpreis des Lieferanten direkt als Warenaufwand zu verbuchen?
2. Weshalb werden Bezugskosten dem Warenaufwand zugerechnet, Versandkosten im Verkaufsbeispiel aber von den Warenerlösen abgezogen?
3. Welche wirtschaftliche Aussage hat der Einstandspreis, und warum unterscheidet er sich vom Zahlungsbetrag?
4. Warum ist der Rechnungsbetrag an einen Kunden nicht automatisch identisch mit dem Nettoerlös?
5. Welche Buchungslogik steckt hinter dem Grundsatz, dass Rücksendungen, Rabatte und Skonti umgekehrt zur Rechnung verbucht werden?
6. In welchem Sinn ist der Warenvorrat ein ruhendes Konto, und welche Folgen hat das für die laufende Erfolgsrechnung?
7. Warum zeigt der Saldo des Kontos Warenaufwand vor der Bestandskorrektur nicht zwingend den Aufwand der verkauften Waren?
8. Begründen Sie fachlich, weshalb bei einer Bestandeszunahme der Buchungssatz **Warenvorrat / Warenaufwand** lautet.
9. Begründen Sie fachlich, weshalb bei einer Bestandesabnahme der Buchungssatz **Warenaufwand / Warenvorrat** lautet.
10. Wie verändert sich Bruttogewinn und Reingewinn bei einer Bestandeszunahme, und warum?
11. Wie verändert sich Bruttogewinn und Reingewinn bei einer Bestandesabnahme, und warum?
12. Erklären Sie den Unterschied zwischen Bruttogewinnzuschlag und Bruttogewinnquote.
13. Weshalb ist die Bestandskorrektur ein Beispiel für periodengerechte Erfolgsermittlung?
14. Welche inhaltliche Rolle spielt das Inventar beim Abschluss der Warenkonten?
15. Wie hängen Warenaufwand, Warenerlöse, Warenvorrat und Bruttogewinn systematisch zusammen?

---

## 20. Kernaussagen auf einen Blick

- Einkaufsbezogene Geschäftsfälle werden über das Konto **Warenaufwand** verbucht.
- Verkaufsbezogene Geschäftsfälle werden über das Konto **Warenerlöse** verbucht.
- Rabatt, Skonto und weitere Abzüge korrigieren den ursprünglichen Preis nach unten.
- Bezugskosten erhöhen den Einstandspreis; selbst getragene Versandkosten vermindern den Nettoerlös.
- Der Bruttogewinn ergibt sich aus Warenerlösen minus Warenaufwand.
- Der Bruttogewinn ist nicht der Reingewinn; zuerst müssen noch Gemeinkosten gedeckt werden.
- Das Konto Warenvorrat ist im behandelten System ein ruhendes Aktivkonto.
- Ohne Bestandskorrektur zeigt der Warenaufwand nur den Wert der eingekauften, nicht zwingend der verkauften Waren.
- Bestandeszunahme vermindert den Warenaufwand und erhöht den Gewinn.
- Bestandesabnahme erhöht den Warenaufwand und vermindert den Gewinn.
- Nach der Bestandskorrektur entspricht der Saldo des Warenaufwandes dem Einstandswert der verkauften Waren.`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  const result = await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = ANY($2::uuid[])`,
    [SUMMARY, ['8e97beb2-6529-4c71-a1cc-3a8227c7acc8', '68cba68b-88cf-4f9e-8658-468d666da8c4']]
  )
  console.log(`Updated ${result.rowCount} warenkonten chapters (${SUMMARY.length} characters)`)
  await client.end()
}
main().catch(console.error)
