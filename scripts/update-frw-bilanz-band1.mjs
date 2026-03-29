import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = "# Grundlagen der doppelten Buchhaltung, Bilanz und Erfolgsrechnung (Schweiz)\n\n> Dieses Kapitel behandelt die Grundlagen der doppelten Buchhaltung im schweizerischen KMU-Kontext. Die Inhalte basieren auf einem Lehrwerk mit dem durchgehenden Fallbeispiel von **Sara Baumer** (Einzelunternehmerin) und der **Beauty Cosmetic Salon AG**. Es werden die Entstehung eines Unternehmens, die Erfassung von Geschäftsfällen, Bilanz, Erfolgsrechnung, Jahresabschluss, gesetzliche Vorgaben und der Kontenrahmen KMU behandelt.\n\n---\n\n## 1. Überblick und Zweck der Buchhaltung\n\n**Buchhaltung** ist gleichzeitig drei Dinge: ein Dokumentationssystem, ein Messinstrument und ein Führungsinstrument. Sie erfüllt folgende Funktionen:\n\n- **Dokumentation:** Geschäftsvorfälle werden lückenlos, chronologisch und nachvollziehbar erfasst.\n- **Messung:** Vermögens-, Schulden- und Erfolgslage des Unternehmens werden quantifizierbar.\n- **Führung:** Budgetierung, Kostenkontrolle, Finanzplanung und Rechenschaft gegenüber Eigentümern, Gläubigern, Behörden und Sozialversicherungen werden ermöglicht.\n- **Steuerberechnung:** Korrekte Grundlage für Steuererklärungen.\n- **Beweissicherung:** Bei Rechtsstreitigkeiten liefert die Buchhaltung Belege.\n\n---\n\n## 2. Unternehmensgründung und das Prinzip der Einheit\n\n### 2.1 Trennung von Privat- und Geschäftsbereich\n\nEin grundlegendes Prinzip: Das Unternehmen wird als **eigene wirtschaftliche Einheit** behandelt – getrennt vom Privatbereich der Eigentümer. Nur Vermögen und Schulden des Unternehmens erscheinen in der Buchhaltung.\n\n**Beispiel Sara Baumer:** Sara Baumer gründet ein IT-Dienstleistungsunternehmen. Sie bringt privates Geld ein. Aus Sicht des Unternehmens ist dieses Geld eine Schuld gegenüber der Eigentümerin – es wird als **Eigenkapital** auf der Passivseite geführt, nicht als Privatvermögen.\n\n### 2.2 Kapitaleinlage und Eigenkapital\n\n| Perspektive | Was passiert |\n|---|---|\n| Eigentümerin | Gibt privates Geld ins Unternehmen |\n| Unternehmen | Erhält Bankguthaben (Aktiv ↑) |\n| Unternehmen | Schuldet der Eigentümerin diesen Betrag = Eigenkapital (Passiv ↑) |\n\n**Buchungssatz:** Bank / Eigenkapital\n\n---\n\n## 3. Die vier Grundgrössen der Buchhaltung\n\n| Grundgrösse | Beschreibung | Kontenart |\n|---|---|---|\n| **Vermögen** | Was das Unternehmen besitzt (Aktiven) | Aktivkonten |\n| **Schulden** | Was das Unternehmen schuldet (Passiven) | Passivkonten |\n| **Aufwände** | Erfolgswirksamer Wertverzehr in der Periode | Aufwandskonten |\n| **Erträge** | Erfolgswirksamer Wertzuwachs in der Periode | Ertragskonten |\n\n**Vermögen und Schulden** beschreiben die **Bestandeslage** (Stichtag).\n**Aufwände und Erträge** beschreiben die **Erfolgslage** (Periode).\n\n---\n\n## 4. Das Prinzip der doppelten Buchhaltung\n\n### 4.1 Grundregel\n\n**Jeder Geschäftsfall wird auf zwei Konten erfasst – einmal im Soll, einmal im Haben – mit demselben Betrag.**\n\nDies heisst \"doppelte Buchhaltung\" (Doppik). Dadurch werden:\n- Ursache und Gegenwirkung gleichzeitig abgebildet\n- Rechnerische Konsistenz sichergestellt\n- Wirtschaftliche Zusammenhänge vollständig dokumentiert\n\n### 4.2 Soll und Haben\n\nDie Begriffe **Soll** (links) und **Haben** (rechts) sind rein technische Bezeichnungen – sie haben keine direkte Bedeutung wie \"gut\" oder \"schlecht\". Ihre Funktion hängt von der Kontenart ab.\n\n---\n\n## 5. Kontenarten und ihre Regeln\n\n### 5.1 Aktivkonten (Vermögenskonten)\n\nAktivkonten bilden **Vermögenswerte** ab (Mittelverwendung).\n\n| Position | Seite |\n|---|---|\n| Anfangsbestand | **Soll** |\n| Zunahmen | **Soll** |\n| Abnahmen | Haben |\n| Schlussbestand | Haben |\n\n**Beispiele:** Bank, Kasse, Post, Wertschriften, Forderungen aus Lieferungen und Leistungen (Forderungen L+L), Mobiliar, Fahrzeuge, Maschinen, Liegenschaften, Aktivdarlehen.\n\n### 5.2 Passivkonten (Schuldenkonten)\n\nPassivkonten bilden **Schulden** ab (Mittelherkunft).\n\n| Position | Seite |\n|---|---|\n| Anfangsbestand | **Haben** |\n| Zunahmen | **Haben** |\n| Abnahmen | Soll |\n| Schlussbestand | Soll |\n\n**Beispiele:** Eigenkapital, Verbindlichkeiten aus Lieferungen und Leistungen (Verbindlichkeiten L+L), Passivdarlehen, Bankverbindlichkeiten, Hypotheken.\n\n### 5.3 Aufwandskonten\n\nAufwandskonten erfassen **erfolgswirksamen Wertverzehr**.\n\n| Position | Seite |\n|---|---|\n| Anfangsbestand | **Kein Anfangsbestand** (beginnen bei 0) |\n| Zunahmen | **Soll** |\n| Minderungen | Haben |\n| Saldo/Abschluss | Haben |\n\n**Typische Aufwandskonten:**\n- Lohnaufwand\n- Sozialversicherungsaufwand\n- Übriger Personalaufwand\n- Raumaufwand\n- Fahrzeugaufwand\n- Versicherungsaufwand\n- Energieaufwand\n- Verwaltungsaufwand\n- Werbeaufwand\n- Sonstiger Betriebsaufwand\n- Abschreibungen\n- Finanzaufwand\n- Direkte Steuern\n\n### 5.4 Ertragskonten\n\nErtragskonten erfassen **erfolgswirksamen Wertzuwachs**.\n\n| Position | Seite |\n|---|---|\n| Anfangsbestand | **Kein Anfangsbestand** (beginnen bei 0) |\n| Zunahmen | **Haben** |\n| Minderungen | Soll |\n| Saldo/Abschluss | Soll |\n\n**Typische Ertragskonten:**\n- Honorarertrag\n- Dienstleistungsertrag\n- Finanzertrag\n- Übrige Erlöse\n- (Handelsbetriebe: Warenerlöse; Produktionsbetriebe: Produktionserlöse)\n\n---\n\n## 6. Wichtige Begriffspaare\n\n### 6.1 Aufwand vs. Ausgabe\n\n| Begriff | Definition | Wirkung |\n|---|---|---|\n| **Aufwand** | Erfolgswirksamer Wertverzehr | Vermindert den Gewinn |\n| **Ausgabe** | Abfluss liquider Mittel oder Entstehung einer Zahlungspflicht | Vermindert flüssige Mittel |\n\n**Nicht identisch!** Beispiele:\n- **Abschreibungen** = Aufwand, aber **keine** Ausgabe (liquiditätsunwirksam)\n- **Kauf einer Maschine** = Ausgabe, aber zunächst **kein** Aufwand (wird aktiviert)\n- **Lohnzahlung** = Aufwand UND Ausgabe (fallen zusammen)\n\n### 6.2 Ertrag vs. Einnahme\n\n| Begriff | Definition | Wirkung |\n|---|---|---|\n| **Ertrag** | Erfolgswirksamer Wertzuwachs | Erhöht den Gewinn |\n| **Einnahme** | Zufluss liquider Mittel oder Entstehung eines Zahlungsanspruchs | Erhöht Liquidität oder Forderungen |\n\n**Nicht identisch!** Beispiel: Verkauf auf Rechnung = Ertrag sofort, Einnahme erst bei Zahlung.\n\n---\n\n## 7. Der Buchungssatz und das Journal\n\n### 7.1 Aufbau eines Buchungssatzes\n\nEin vollständiger Buchungssatz enthält:\n1. **Sollkonto** (links)\n2. **Habenkonto** (rechts)\n3. **Text** (Beschreibung des Geschäftsvorfalls)\n4. **Betrag** (in CHF)\n5. **Datum**\n\n**Kurzform:** Sollkonto / Habenkonto, Betrag\n\n**Beispiele:**\n- Lohnzahlung per Bank: `Lohnaufwand / Bank, CHF 5'000`\n- Dienstleistung auf Rechnung fakturiert: `Forderungen L+L / Honorarertrag, CHF 3'500`\n- Kauf Büromöbel bar: `Mobiliar / Kasse, CHF 2'000`\n- Kauf Geschäftsauto auf Rechnung: `Fahrzeuge / Verbindlichkeiten L+L, CHF 45'000"

### 7.2 Erfolgswirksame vs. erfolgsunwirksame Buchungen

| Typ | Beteiligte Konten | Wirkung auf Gewinn |
|---|---|---|
| **Erfolgswirksam** | Bilanzkonto ↔ Erfolgskonto | Gewinn verändert sich |
| **Erfolgsunwirksam** | Bilanzkonto ↔ Bilanzkonto | Kein Einfluss auf Gewinn |

**Beispiel erfolgswirksam:** Lohnaufwand / Bank (Aufwandskonto betroffen)
**Beispiel erfolgsunwirksam:** Bank / Verbindlichkeiten L+L (nur Bilanzkonten betroffen)

### 7.3 Das Journal

Das **Journal** hält alle Buchungssätze chronologisch fest. Es ist die zeitliche Dokumentation aller Geschäftsvorfälle und bildet die Grundlage für die Kontenführung im Hauptbuch.

---

## 8. Kontendifferenzierung im Laufe des Wachstums

Im didaktischen Aufbau des Lehrwerks beginnt Sara Baumer mit wenigen Sammelkonten (Bank, Eigenkapital, Aufwand, Ertrag). Mit zunehmendem Wachstum werden diese **aufgespalten**:

**Aus einem Sammelkonto "Aufwand" werden:**
- Lohnaufwand
- Raumaufwand
- Fahrzeugaufwand
- Versicherungsaufwand
- Verwaltungsaufwand
- Werbeaufwand
- Abschreibungen
- usw.

**Aus einem Sammelkonto "Vermögen" werden:**
- Bank
- Kasse
- Mobiliar
- Fahrzeuge
- Forderungen L+L
- usw.

Diese Differenzierung macht die Buchhaltung aussagekräftiger und ermöglicht Kostenkontrolle und branchenspezifische Auswertungen.

---

## 9. Die Bilanz

### 9.1 Definition und Grundprinzip

Die **Bilanz** ist eine **stichtagsbezogene** Gegenüberstellung von Aktiven und Passiven. Sie zeigt die Vermögens- und Finanzierungslage des Unternehmens zu einem bestimmten Zeitpunkt.

**Grundgleichung:** `Aktiven = Passiven` (die Bilanz muss immer ausgeglichen sein)

### 9.2 Aktivseite und Passivseite

| Aktivseite | Passivseite |
|---|---|
| Mittelverwendung | Mittelherkunft |
| Wofür wurden Mittel eingesetzt? | Woher stammen die Mittel? |
| Vermögenswerte | Schulden (Fremd- + Eigenkapital) |

### 9.3 Gliederung der Bilanz

**Aktivseite (nach Liquidierbarkeit – liquideste zuerst):**

- **Umlaufvermögen (UV)**
  - Flüssige Mittel (Kasse, Post, Bank)
  - Wertschriften (kurzfristig)
  - Forderungen L+L
  - Vorräte / Warenvorrat
  - Aktive Rechnungsabgrenzung
- **Anlagevermögen (AV)**
  - Mobiliar / Einrichtungen
  - Fahrzeuge / Maschinen
  - Liegenschaften
  - Aktivdarlehen
  - Beteiligungen

**Passivseite (nach Fälligkeit – kurzfristigste zuerst):**

- **Fremdkapital (FK)**
  - Verbindlichkeiten L+L
  - Kurzfristige Bankverbindlichkeiten
  - Passive Rechnungsabgrenzung
  - Langfristige Darlehen
  - Hypotheken
- **Eigenkapital (EK)**
  - Kapital / Eigenkapital
  - Jahresgewinn (in Schlussbilanz I)

### 9.4 Darstellungsformen der Bilanz

**Kontenform:** Aktiven links, Passiven rechts – klassische T-Konto-Darstellung.

**Berichtsform / Staffelform:** Aktiven oben, Passiven darunter – besser geeignet für umfangreichere Gliederungen und moderne Berichte.

Beide Formen transportieren dieselben Informationen.

---

## 10. Die Erfolgsrechnung

### 10.1 Definition und Grundprinzip

Die **Erfolgsrechnung** ist eine **periodenbezogene** Gegenüberstellung von Aufwänden und Erträgen. Sie dient der Ermittlung von **Reingewinn** oder **Reinverlust**.

### 10.2 Struktur

**Linke Seite: Aufwände** (Wertverzehr)
**Rechte Seite: Erträge** (Wertzuwachs)

**Ergebnis:**
- Erträge > Aufwände = **Reingewinn**
- Aufwände > Erträge = **Reinverlust**

### 10.3 Gliederung der Erfolgsrechnung

Die Erfolgsrechnung wird nach wirtschaftlicher Logik gegliedert:

1. **Branchentypische Erträge** (z.B. Honorarertrag, Dienstleistungsertrag, Warenerlöse)
2. **Branchentypische direkte Aufwände** (z.B. Material- oder Warenaufwand)
3. **Personalaufwand** (Löhne, Sozialversicherungen)
4. **Raumaufwand**
5. **Sonstiger betrieblicher Aufwand** (Energie, Versicherungen, Verwaltung, Werbung)
6. **Abschreibungen**
7. **Finanzerfolg** (Finanzertrag vs. Finanzaufwand)
8. **Ausserordentliche Positionen** (falls vorhanden)
9. **Reingewinn / Reinverlust**

### 10.4 Gewinnermittlung – zwei Methoden

**Methode 1: Erfolgsrechnung (Aufwand/Ertrag-Vergleich)**
`Reingewinn = Summe Erträge – Summe Aufwände`

**Methode 2: Bestandesvergleich (Vermögensvergleich)**
`Erfolg = (Schlussbestand Vermögen – Schlussbestand Schulden) – (Anfangsbestand Vermögen – Anfangsbestand Schulden)`
Entspricht der Veränderung des Nettovermögens (Eigenkapitals) in der Periode.

---

## 11. Der Jahresabschluss – Vollständiger Ablauf

Der Jahresabschluss folgt einem klaren 7-Schritte-Prozess:

### Schritt 1: Eröffnungsbilanz erstellen
Die Anfangsbestände aus dem Vorjahr werden in einer Eröffnungsbilanz zusammengefasst. Bei Neugründungen basiert sie auf der Einlagensituation.

### Schritt 2: Bilanzkonten eröffnen
Die Anfangsbestände werden auf die einzelnen Bilanzkonten (Aktiv- und Passivkonten) übertragen.
- Aktivkonten: Anfangsbestand ins **Soll**
- Passivkonten: Anfangsbestand ins **Haben**

### Schritt 3: Laufende Verbuchung
Während des Geschäftsjahres werden alle Geschäftsvorfälle chronologisch im Journal erfasst und auf die Konten gebucht.

### Schritt 4: Provisorischer Kontenabschluss
Am Periodenende werden alle Konten saldiert (Saldo ermitteln):
- Bilanzkonten: Schlussbestand ermitteln
- Erfolgskonten: Periodensaldo ermitteln

### Schritt 5: Schlussbilanz I und Erfolgsrechnung erstellen
- **Schlussbilanz I:** Zeigt alle Bilanzkonten mit Schlussbestand + den **ausgewiesenen Reingewinn/Reinverlust** als separate Position
- **Erfolgsrechnung:** Alle Aufwands- und Ertragskonten werden gegenübergestellt → Ergebnis = Reingewinn oder Reinverlust

Der Reingewinn erscheint in diesem Stadium **doppelt**: einmal in der Erfolgsrechnung, einmal als separate Position in der Schlussbilanz I.

### Schritt 6: Gewinn oder Verlust verbuchen (Erfolgsverbuchung)
Der Reingewinn wird dem Eigenkapital **gutgeschrieben**, der Reinverlust wird vom Eigenkapital **abgezogen**.

**Bei Reingewinn:** `Jahresgewinn / Eigenkapital` (oder direkt auf Eigenkapital)
**Bei Reinverlust:** `Eigenkapital / Jahresverlust` (oder direkt vom Eigenkapital)

### Schritt 7: Schlussbilanz II erstellen
Nach der Erfolgsverbuchung entsteht die endgültige **Schlussbilanz II**. Der Erfolg ist nicht mehr separat sichtbar – er ist bereits im erhöhten (oder verminderten) Eigenkapital enthalten. Die Schlussbilanz II wird zur **Eröffnungsbilanz der nächsten Periode**.

### Übersicht Schlussbilanzen

| | Schlussbilanz I | Schlussbilanz II |
|---|---|---|
| Gewinn sichtbar? | Ja, separat ausgewiesen | Nein, im EK enthalten |
| Zweck | Provisorischer Abschluss | Endgültiger Abschluss |
| Grundlage für | Erfolgsverbuchung | Nächste Eröffnungsbilanz |

---

## 12. Eigenkapital – Veränderungen

Das Eigenkapital verändert sich durch vier Faktoren:

| Faktor | Wirkung auf EK |
|---|---|
| **Einlagen** der Eigentümer | Erhöhung |
| **Entnahmen / Bezüge** der Eigentümer | Verminderung |
| **Reingewinn** | Erhöhung |
| **Reinverlust** | Verminderung |

---

## 13. Abschreibungen

### 13.1 Definition
**Abschreibungen** erfassen die periodische Wertminderung von Anlagegütern (z.B. Mobiliar, Fahrzeuge, Maschinen). Sie verteilen den Anschaffungswert systematisch auf die Nutzungsdauer.

### 13.2 Buchhalterische Wirkung
- **Aufwand** in der Erfolgsrechnung (vermindert Gewinn)
- **Verminderung** des Aktivwerts auf der Bilanz
- **Liquiditätsunwirksam** – kein Geldabfluss bei der Buchung

**Buchungssatz:** `Abschreibungen / Mobiliar (oder Fahrzeuge, Maschinen, ...)`

### 13.3 Aktivierung vs. sofortiger Aufwand

| Entscheid | Beispiel | Buchung |
|---|---|---|
| **Aktivieren** | Kauf Fahrzeug CHF 45'000 | Fahrzeuge / Bank oder Verbindlichkeiten L+L |
| **Als Aufwand** | Büromaterial CHF 50 | Büromaterialaufwand / Bank |

Faustregel: Grössere Anschaffungen mit mehrjährigem Nutzen werden aktiviert. Kleinere, schnell verbrauchte Güter werden direkt als Aufwand erfasst.

---

## 14. Gesetzliche Vorgaben nach schweizerischem OR

### 14.1 Buchführungspflicht

Die Pflicht zur ordentlichen doppelten Buchhaltung richtet sich nach Rechtsform und Umsatz:

| Unternehmen | Pflicht |
|---|---|
| **Einzelunternehmen / Personengesellschaften** mit Jahresumsatz ≥ CHF 500'000 | Buchführungspflichtig (doppelte Buchhaltung) |
| **Einzelunternehmen / Personengesellschaften** mit Jahresumsatz < CHF 500'000 | Vereinfachte Buchführung über Einnahmen, Ausgaben und Vermögenslage genügt |
| **Juristische Personen** (AG, GmbH, Verein, Stiftung, Genossenschaft) | Buchführungspflichtig – **unabhängig vom Umsatz** |

### 14.2 Rechnungslegungspflicht

Die Jahresrechnung muss mindestens umfassen:
- **Bilanz**
- **Erfolgsrechnung**
- **Anhang**

### 14.3 Belegprinzip

**"Keine Buchung ohne Beleg."**

Jeder Geschäftsvorfall muss durch schriftliche oder elektronische Unterlagen nachvollziehbar sein. Belege können auf Papier oder digital vorliegen.

### 14.4 Aufbewahrungsfrist

**Geschäftsbücher, Buchungsbelege und relevante Berichte sind 10 Jahre aufzubewahren.**

### 14.5 Verrechnungsverbot (Bruttoprinzip)

**Aktiven und Passiven dürfen nicht miteinander verrechnet werden.**
**Aufwand und Ertrag dürfen nicht miteinander verrechnet werden.**

Es sind stets **Bruttobeträge** auszuweisen.

**Beispiel:** Ein Unternehmen hat ein Bankguthaben von CHF 30'000 und eine Bankverbindlichkeit von CHF 10'000. Es müssen beide Positionen separat ausgewiesen werden (Aktiv: CHF 30'000; Passiv: CHF 10'000) – nicht saldiert als CHF 20'000.

---

## 15. Kontenrahmen KMU und Kontenplan

### 15.1 Kontenrahmen KMU

Der **Kontenrahmen KMU** ist ein standardisiertes Ordnungssystem für alle möglichen Konten, die ein schweizerisches KMU verwenden könnte. Er strukturiert Konten in einer Hierarchie:

**Hierarchie:**
1. Kontenklasse (z.B. Klasse 1 = Aktiven)
2. Hauptgruppe (z.B. 10 = Flüssige Mittel)
3. Gruppe (z.B. 100 = Kasse)
4. Einzelkonto (z.B. 1000 = Kasse)

**Kontenklassen des Kontenrahmens KMU:**
- Klasse 1: Aktiven
- Klasse 2: Passiven
- Klasse 3: Betrieblicher Ertrag
- Klasse 4: Material-, Waren- und Dienstleistungsaufwand
- Klasse 5: Personalaufwand
- Klasse 6: Übriger betrieblicher Aufwand
- Klasse 7: Nebenerfolg
- Klasse 8: Betriebsfremder / ausserordentlicher Bereich
- Klasse 9: Abschluss

### 15.2 Kontenplan

Der **Kontenplan** ist die unternehmensspezifische Auswahl aus dem Kontenrahmen, angepasst an:
- Branche
- Rechtsform
- Unternehmensgrösse
- Spezifische Geschäftstätigkeit

### 15.3 Unterschiede nach Unternehmensart

| Unternehmensart | Typische Ertragskonten | Typische Aufwandskonten |
|---|---|---|
| **Dienstleistungsbetrieb** | Honorarertrag, Dienstleistungsertrag | Personalaufwand (dominant), Raumaufwand |
| **Handelsbetrieb** | Warenerlöse | Warenaufwand, Lagerveränderungen |
| **Produktionsbetrieb** | Produktionserlöse | Materialaufwand, Fertigungsaufwand |

---

## 16. Forderungen und Verbindlichkeiten

### 16.1 Kauf auf Rechnung – Verbindlichkeiten L+L

Wenn ein Unternehmen Waren oder Dienstleistungen auf Rechnung **kauft**, entsteht eine **Verbindlichkeit aus Lieferungen und Leistungen (Verbindlichkeiten L+L)**.

- Kontenart: **Passivkonto**
- Buchung bei Erhalt der Rechnung: `Aufwandskonto / Verbindlichkeiten L+L`
- Buchung bei Zahlung: `Verbindlichkeiten L+L / Bank`

### 16.2 Verkauf auf Rechnung – Forderungen L+L

Wenn ein Unternehmen Waren oder Dienstleistungen auf Rechnung **verkauft**, entsteht eine **Forderung aus Lieferungen und Leistungen (Forderungen L+L)**.

- Kontenart: **Aktivkonto**
- Buchung bei Ausstellung der Rechnung: `Forderungen L+L / Ertragskonto`
- Buchung bei Zahlung: `Bank / Forderungen L+L`

### 16.3 Mengenrabatt

Ein Mengenrabatt wird **bei Rechnungsstellung** gewährt und ist bereits auf der Rechnung sichtbar. Der Buchungsbetrag ist der bereits reduzierte Nettobetrag.

**Beispiel:** Listenpreis CHF 10'000, 10% Mengenrabatt → Rechnungsbetrag CHF 9'000.
Buchung: `Warenaufwand / Verbindlichkeiten L+L, CHF 9'000`

### 16.4 Mängelrabatt (nachträglicher Rabatt)

Ein Mängelrabatt wird **nach** der ursprünglichen Buchung gewährt, weil die Ware mangelhaft war. Er mindert die offene Verbindlichkeit bzw. Forderung.

**Beim Käufer:**
`Verbindlichkeiten L+L / Warenaufwand, CHF xxx` (Verbindlichkeit sinkt, Aufwand sinkt)

**Beim Verkäufer:**
`Honorarertrag / Forderungen L+L, CHF xxx` (Forderung sinkt, Ertrag sinkt)

### 16.5 Rücksendung

Bei einer Rücksendung werden sowohl die Ware als auch die Schuld/Forderung vollständig oder teilweise rückgängig gemacht.

**Beim Käufer:** Verbindlichkeit sinkt, Warenaufwand sinkt
**Beim Verkäufer:** Forderung sinkt, Ertrag sinkt

### 16.6 Skonto

**Skonto** ist ein Preisnachlass bei **schneller Zahlung** innerhalb einer bestimmten Frist (z.B. 2% bei Zahlung innert 10 Tagen).

- Skonto wird erst **bei Zahlung** verbucht (nicht bei Rechnungsstellung)
- Beim Käufer mindert Skonto die Verbindlichkeit und den Aufwand
- Beim Verkäufer mindert Skonto die Forderung und den Ertrag

**Beispiel Käufer:** Rechnung CHF 5'000, 2% Skonto bei Sofortzahlung:
- Zahlung: CHF 4'900
- `Verbindlichkeiten L+L / Bank, CHF 4'900`
- `Verbindlichkeiten L+L / Warenaufwand, CHF 100` (Skontobetrag)

### 16.7 Übersicht: Wirkung von Preisnachlässen

| Vorgang | Verbindlichkeiten L+L | Forderungen L+L | Aufwand/Ertrag |
|---|---|---|---|
| Mengenrabatt | Schon berücksichtigt | Schon berücksichtigt | Reduziert |
| Mängelrabatt nachträglich | Sinkt | Sinkt | Sinkt |
| Rücksendung | Sinkt | Sinkt | Sinkt |
| Skonto bei Zahlung | Sinkt | Sinkt | Sinkt |

---

## 17. Belegkontierung und Korrekturen

### 17.1 Kontierungsstempel

Belege werden vor der Erfassung mit einem **Kontierungsstempel** versehen, der Sollkonto, Habenkonto und Betrag zeigt. Bei gemischten Rechnungen (mehrere Konten betroffen) wird die Rechnung **gesplittet** (Splitbuchung).

**Beispiel Splitbuchung:** Eine Rechnung enthält Materialaufwand CHF 800 und Büroaufwand CHF 200:
- `Materialaufwand / Verbindlichkeiten L+L, CHF 800`
- `Verwaltungsaufwand / Verbindlichkeiten L+L, CHF 200`

### 17.2 Stornobuchung

Fehlerhafte Buchungen dürfen **nicht gelöscht oder überschrieben** werden. Stattdessen wird eine **Stornobuchung** (Gegenbuchung) vorgenommen, die die falsche Buchung neutralisiert. Anschliessend wird die korrekte Buchung neu erfasst.

**Vorgehen:**
1. Fehlerbuchung identifizieren
2. Stornobuchung: Soll und Haben der fehlerhaften Buchung werden **umgekehrt** (gleicher Betrag)
3. Korrekte Buchung neu erfassen

**Warum Storno statt Löschen?**
- Transparenz und Nachvollziehbarkeit bleiben gewahrt
- Entspricht dem Dokumentationsprinzip und Belegprinzip
- Revisions- und prüfungstauglich

---

## 18. Interne Zusammenhänge im System

Das Buchhaltungssystem ist intern stark vernetzt:

- **Unternehmensgründung** erklärt, warum Eigenkapital als Passivkonto behandelt wird.
- **Aktiv- und Passivkonten** liefern die Grundlage für die **Bilanz**.
- **Aufwands- und Ertragskonten** liefern die Grundlage für die **Erfolgsrechnung**.
- **Journal und Buchungssatz** sind das operative Bindeglied zwischen Geschäftsvorfall und Rechenwerk.
- **Abschreibungen** verbinden Anlagevermögen und Erfolgskonten: Sie mindern Vermögen und erzeugen gleichzeitig Aufwand.
- **Schlussbilanz I und Erfolgsrechnung** zeigen denselben Erfolg aus zwei Perspektiven.
- **Erfolgsverbuchung** transformiert den periodischen Erfolg in eine Veränderung des Eigenkapitals.
- **Schlussbilanz II** schliesst den Kreislauf – sie wird zur Eröffnungsbilanz der Folgeperiode.
- **Forderungen und Verbindlichkeiten** bilden Zahlungsziele und nachträgliche Preisanpassungen ab.
- **Gesetzliche Vorschriften** sichern Nachvollziehbarkeit, Vergleichbarkeit und Ordnungsmässigkeit des gesamten Systems.

---

## 19. Wichtige Kernaussagen (Zusammenfassung)

1. Jeder Geschäftsfall wird **doppelt** erfasst – einmal im Soll, einmal im Haben.
2. Das Unternehmen wird buchhalterisch **vom Privatbereich** der Eigentümer getrennt.
3. **Eigenkapital** ist aus Sicht des Unternehmens eine Schuld gegenüber den Eigentümern.
4. **Aktivkonten** und **Passivkonten** bilden Bestände ab (Bilanz).
5. **Aufwands-** und **Ertragskonten** bilden periodische Erfolgsgrössen ab (Erfolgsrechnung).
6. **Aufwand ≠ Ausgabe** und **Ertrag ≠ Einnahme** – wichtige begriffliche Trennung.
7. **Abschreibungen** sind Aufwand, aber keine liquiditätswirksame Ausgabe.
8. Grössere Anschaffungen werden **aktiviert** und nicht sofort als Aufwand verbucht.
9. Die **Bilanz** ist eine Stichtagsrechnung; die **Erfolgsrechnung** ist eine Periodenrechnung.
10. **Aktiven = Passiven** – die Bilanz muss immer ausgeglichen sein.
11. **Schlussbilanz I** zeigt den Erfolg separat; **Schlussbilanz II** enthält den Erfolg bereits im Eigenkapital.
12. Die **Erfolgsverbuchung** verbindet Erfolgsrechnung und Bilanz.
13. **Buchführungspflicht** und **Rechnungslegung** in der Schweiz sind durch das Obligationenrecht (OR) geregelt.
14. **"Keine Buchung ohne Beleg"** – das Belegprinzip gilt absolut.
15. Buchungsunterlagen und Belege sind **10 Jahre** aufzubewahren.
16. **Aktiven/Passiven** und **Aufwand/Ertrag** dürfen grundsätzlich nicht miteinander verrechnet werden (Bruttoprinzip).
17. Der **Kontenrahmen KMU** strukturiert mögliche Konten; der **Kontenplan** konkretisiert sie für ein bestimmtes Unternehmen.
18. Verschiedene Unternehmensarten (Produktion, Handel, Dienstleistung) benötigen **unterschiedliche Konten**.
19. Käufe auf Rechnung führen zu **Verbindlichkeiten**, Verkäufe auf Rechnung zu **Forderungen**.
20. Rabatte, Rücksendungen und Skonti reduzieren offene Forderungen oder Verbindlichkeiten und müssen **separat** berücksichtigt werden.

---

## 20. Verbindungen zu anderen Themen

- **Rechnungswesen:** Bilanz, Erfolgsrechnung und Buchungssystematik sind Kernbestandteile.
- **Controlling:** Die feinere Gliederung von Aufwand und Ertrag ermöglicht Kostenbeobachtung und Managemententscheidungen.
- **Finanzierung:** Bilanz und Eigen-/Fremdkapital beziehen sich direkt auf Finanzierungsfragen.
- **Investition und Abschreibung:** Die Unterscheidung Aktivierung vs. Aufwand verbindet Buchhaltung mit Investitionsrechnung.
- **Liquiditätsmanagement:** Die Differenz Aufwand/Ausgabe und Ertrag/Einnahme ist zentral für Cashflow-Denken.
- **Steuerrecht:** Das OR wird explizit genannt; direkte Steuern und ordnungsmässige Belege sind relevant.
- **Wirtschaftsrecht / Compliance:** Buchführungspflicht, Aufbewahrung, Belegprinzip und Verrechnungsverbot sind Compliance-Themen.
- **ERP-Software:** Buchungen erfolgen heute oft softwaregestützt, inklusive Kontierung, Freigabeprozessen und elektronischer Archivierung.
`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()

  await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = $2`,
    [SUMMARY, 'c1fc9611-23ff-4f27-bef3-5229e0793699']
  )
  console.log('Updated grundlagen-buchhaltung')
  console.log('Summary length:', SUMMARY.length, 'characters')

  await client.end()
}

main().catch(console.error)
