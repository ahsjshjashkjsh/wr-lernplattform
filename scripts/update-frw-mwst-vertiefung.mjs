import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = `# Mehrwertsteuer – Vertiefung (Band 3, Kapitel 1)

## 1. Überblick und Lernziele

Dieses Kapitel vertieft die schweizerische Mehrwertsteuer (MWST) aus buchhalterischer und steuerrechtlicher Perspektive. Im Mittelpunkt stehen vier Themenbereiche:

1. **Grundlagen und Systematik** der MWST (Wertschöpfungskette, Steuerpflicht, Steuersätze, Umsatzkategorien)
2. **Buchungsmethoden und Abrechnungsmethoden** (Nettomethode vs. Bruttomethode; vereinbartes vs. vereinnahmtes Entgelt)
3. **Verbuchung typischer Geschäftsfälle** mit MWST (Einkauf mit Skonto, Verkauf mit Rabatt, periodische Abrechnung)
4. **Forderungsverluste und MWST-Korrektur** bei Konkurs und Zahlungsausfall

Das übergeordnete Lernziel: MWST korrekt behandeln heisst, **steuerrechtliche Einordnung, wirtschaftlichen Vorgang und Buchungstechnik** gleichzeitig im Blick zu behalten.

---

## 2. Grundlagen der Mehrwertsteuer

### 2.1 Wesen der MWST

Die Mehrwertsteuer ist die **wichtigste Bundessteuer der Schweiz**. Sie ist eine allgemeine Konsumsteuer, die auf steuerbaren Lieferungen und Dienstleistungen erhoben wird. Entlang der gesamten Wertschöpfungskette – von der Rohstoffgewinnung über die Produktion und den Handel bis zum Endkonsumenten – entsteht auf jeder Stufe ein Mehrwert. Genau dieser Mehrwert wird besteuert.

**Wirtschaftliche Logik:** Die Steuer wird zwar von jedem steuerpflichtigen Unternehmen erhoben und abgerechnet, wirtschaftlich getragen wird sie jedoch ausschliesslich vom **Endkonsumenten**. Unternehmen fungieren lediglich als Einzugs- und Abrechnungssubjekte.

**Das Mehrwertprinzip:** Jedes Unternehmen schuldet dem Staat nur die Steuer auf seinem selbst geschaffenen Mehrwert. Die auf Vorleistungen bereits bezahlte Steuer (Vorsteuer) kann vollständig abgezogen werden. Dadurch entsteht keine Kumulierung der Steuer über mehrere Stufen.

### 2.2 Steuerpflicht und Umsatzgrenzen

Unternehmen werden steuerpflichtig, wenn sie innerhalb eines Jahres steuerbare Leistungen im Inland von mehr als **CHF 100'000** erbringen. Für folgende Organisationen gilt eine erhöhte Ausnahmegrenze von **CHF 150'000**:

- nicht gewinnorientierte, ehrenamtlich geführte Sportvereine
- gemeinnützige Institutionen
- Kulturvereine

### 2.3 Steuersätze im Überblick

| Satz | Anwendungsbereich |
|------|-------------------|
| **0 %** | Steuerbefreite Umsätze (z.B. Exporte); Vorsteuerabzug bleibt erhalten |
| **2,5 %** | Reduzierter Satz für Güter und Dienstleistungen des täglichen Bedarfs |
| **3,7 %** | Sondersatz für Beherbergungsdienstleistungen |
| **7,7 %** | Normalsatz für alle übrigen steuerbaren Leistungen |

> **Hinweis:** Diese Sätze gelten gemäss Lehrmittel. Für aktuelle Anwendungen die geltenden MWST-Sätze beim Eidgenössischen Finanzdepartement prüfen.

### 2.4 Umsatzkategorien: Die entscheidende Unterscheidung

Es gibt drei grundlegend verschiedene Kategorien von Umsätzen:

#### Steuerbare Umsätze
Alle Lieferungen und Dienstleistungen im Inland, die nicht ausdrücklich befreit oder ausgenommen sind. Sie unterliegen einem der oben genannten Steuersätze.

#### Steuerbefreite Umsätze (Steuersatz 0 %)
Diese Umsätze werden mit 0 % besteuert, **berechtigen aber zum Vorsteuerabzug**. Typisches Beispiel: Exporte von Waren und Dienstleistungen ins Ausland.

#### Von der Steuer ausgenommene Umsätze
Diese Umsätze fallen nicht unter die MWST-Pflicht und **berechtigen grundsätzlich nicht zum Vorsteuerabzug**. Typische Beispiele:

- Briefpost bis 50 g (Post)
- Leistungen von Ärzten, Spitälern, Therapieeinrichtungen
- Bildungswesen (Schulen, Kurse)
- Vermietung von Gebäuden und Gebäudeteilen
- Kulturelle Einrichtungen, kirchliche Leistungen
- Soziale Institutionen (Heime, Sozialversicherungen)
- Versicherungsleistungen
- Geld- und Kapitalverkehr (Bankgeschäfte)
- Liegenschaftskäufe und -übertragungen
- Lotterien und Wetten
- Bestimmte karitative und sportliche Organisationen

**Merke:** Steuerbefreit ≠ ausgenommen. Der entscheidende Unterschied liegt im **Vorsteuerabzugsrecht**. Wer ausgenommene Umsätze erbringt, verliert das Recht auf Vorsteuerabzug für die damit verbundenen Eingangsleistungen.

---

## 3. Buchungsmethoden und Abrechnungsmethoden

### 3.1 Buchungsmethoden

#### Nettomethode (Regelmethode)
Die Nettomethode ist die im Schweizer Rechnungswesen übliche und in diesem Lehrmittel vertiefte Methode.

**Grundprinzip:**
- Erlöse, Aufwände und Anschaffungen werden **ohne MWST** in den Ertrags- und Aufwandskonten erfasst
- Die MWST wird **separat** auf Steuerkonten geführt (Vorsteuer-Konto, MWST-Verbindlichkeits-Konto)
- Jede Rechnung mit MWST wird in **zwei Buchungssätze** aufgeteilt: Nettobetrag + Steueranteil

**Vorteile:** Höhere Transparenz der wirtschaftlichen Leistung; Aufwände und Erträge zeigen die tatsächlichen wirtschaftlichen Werte ohne Steuerverfälschung.

#### Bruttomethode (zur Abgrenzung)
- Geschäftsfälle werden zunächst **inklusive MWST** verbucht
- Die MWST wird erst am Periodenende (z.B. Quartalsende) gesamthaft herausgerechnet
- Diese Methode wird im Lehrmittel nur zur Abgrenzung erwähnt und nicht weiter vertieft

### 3.2 Abrechnungsmethoden

#### Abrechnung nach vereinbartem Entgelt (Sollmethode)
- Massgebend ist der **Zeitpunkt der Rechnungsstellung** (Ausgangsrechnung) bzw. des **Rechnungseingangs** (Eingangsrechnung)
- Umsatzsteuer entsteht bereits bei der Fakturierung
- Vorsteuer kann bereits beim Eingang der Lieferantenrechnung geltend gemacht werden
- **Konsequenz:** Nachträgliche Änderungen des Entgelts (Rabatt, Skonto, Rücksendung, Forderungsverlust) müssen die bereits erfasste Steuer korrigieren

#### Abrechnung nach vereinnahmtem Entgelt (Istmethode)
- Massgebend ist der **tatsächliche Zahlungsfluss**
- Umsatzsteuer entsteht erst beim Geldeingang, Vorsteuer erst bei der Bezahlung
- Bedarf einer besonderen Bewilligung der ESTV
- Wird im Lehrmittel nur zur Abgrenzung erwähnt

**Hinweis für die Praxis:** Das gesamte Buchungsbeispiel im Lehrmittel arbeitet mit der Kombination **Nettomethode + Abrechnung nach vereinbartem Entgelt**.

---

## 4. Verbuchung der MWST nach der Nettomethode

### 4.1 Die vier Grundregeln

Das Lehrmittel formuliert vier verbindliche Regeln für die Verbuchung unter der Nettomethode:

1. **Rechnungsein- und -ausgänge** mit MWST werden in **zwei Buchungssätzen** verbucht:
   - Rechnungsbetrag netto (ohne MWST)
   - Mehrwertsteuer
2. **Rabatte, Skonti, Rücksendungen** auf Rechnungen mit MWST werden ebenfalls in **zwei Buchungssätzen** verbucht:
   - Betrag netto (ohne MWST)
   - Mehrwertsteuer (Korrektur)
3. Beide Korrekturbuchungen sind **umgekehrt** zu den Buchungen bei der Rechnungsstellung
4. Die **Bezahlung** der Rechnung wird in **einem einzigen Buchungssatz** mit dem effektiv geflossenen Betrag verbucht

### 4.2 Konten im Kontenrahmen KMU

| Konto | Bezeichnung | Typ |
|-------|-------------|-----|
| 1170 | Vorsteuer | Aktivkonto (Bilanz) |
| 2200 | Verbindlichkeiten MWST | Passivkonto (Bilanz) |
| 1100 | Debitoren (Ford. L+L) | Aktivkonto (Bilanz) |
| 2000 | Kreditoren (Verb. L+L) | Passivkonto (Bilanz) |
| 4000 | Materialaufwand | Aufwandskonto (ER) |
| 3000 | Produktionserlöse | Ertragskonto (ER) |
| 1020 | Postkonto / Bank | Aktivkonto (Bilanz) |

---

## 5. Praxisbeispiel: F. Baumeler Solaranlagen (4. Quartal)

### 5.1 Ausgangslage

Das Unternehmen F. Baumeler Solaranlagen kauft Material für eine Photovoltaikanlage ein und verkauft die fertiggestellte Anlage im selben Quartal weiter. Alle Beträge in CHF, MWST-Satz 7,7 %.

---

### 5.2 Einkauf: Materialrechnung mit anschliessendem Skonto

**Gegeben:**
- Eingangsrechnung: **CHF 193'860.– inkl. 7,7 % MWST**
- Zahlungsbedingung: **2 % Skonto** bei Zahlung innerhalb der Frist

**Schritt 1 – Aufspaltung der Eingangsrechnung:**

$$\text{Netto} = \frac{193'860}{1.077} = 180'000$$
$$\text{Vorsteuer} = 193'860 - 180'000 = 13'860$$

**Buchung 1 – Rechnungseingang (Nettoanteil):**
| Soll | Haben | Betrag |
|------|-------|--------|
| Materialaufwand 4000 | Verbindlichkeiten L+L 2000 | CHF 180'000.– |

**Buchung 2 – Rechnungseingang (Steueranteil):**
| Soll | Haben | Betrag |
|------|-------|--------|
| Vorsteuer 1170 | Verbindlichkeiten L+L 2000 | CHF 13'860.– |

---

**Schritt 2 – Skontoabzug:**
Das Skonto von 2 % bezieht sich auf den gesamten Bruttobetrag:

$$\text{Skonto brutto} = 193'860 \times 0.02 = 3'877.20$$
$$\text{Skonto netto} = \frac{3'877.20}{1.077} = 3'600.–$$
$$\text{Vorsteuerkorrektur} = 3'877.20 - 3'600 = 277.20$$

**Buchung 3 – Skontokorrektur (Nettoanteil):**
| Soll | Haben | Betrag |
|------|-------|--------|
| Verbindlichkeiten L+L 2000 | Materialaufwand 4000 | CHF 3'600.– |

**Buchung 4 – Skontokorrektur (Steueranteil):**
| Soll | Haben | Betrag |
|------|-------|--------|
| Verbindlichkeiten L+L 2000 | Vorsteuer 1170 | CHF 277.20 |

---

**Schritt 3 – Zahlung:**
Nach Skonto verbleibende Verbindlichkeit:

$$193'860 - 3'877.20 = 189'982.80$$

**Buchung 5 – Bankzahlung:**
| Soll | Haben | Betrag |
|------|-------|--------|
| Verbindlichkeiten L+L 2000 | Bank / Post 1020 | CHF 189'982.80 |

**Ergebnis Vorsteuer nach Skonto:**
$$13'860 - 277.20 = \mathbf{13'582.80}$$

**Ergebnis Materialaufwand nach Skonto:**
$$180'000 - 3'600 = \mathbf{176'400}$$

---

### 5.3 Verkauf: Photovoltaikanlage mit nachträglichem Rabatt

**Gegeben:**
- Ausgangsrechnung: **CHF 430'800.– inkl. 7,7 % MWST**
- Nachträglicher Rabatt wegen Mängeln: **10 %**

**Schritt 1 – Aufspaltung der Ausgangsrechnung:**

$$\text{Netto} = \frac{430'800}{1.077} = 400'000$$
$$\text{Umsatzsteuer} = 430'800 - 400'000 = 30'800$$

**Buchung 6 – Rechnungsausgang (Nettoanteil):**
| Soll | Haben | Betrag |
|------|-------|--------|
| Debitoren L+L 1100 | Produktionserlöse 3000 | CHF 400'000.– |

**Buchung 7 – Rechnungsausgang (Steueranteil):**
| Soll | Haben | Betrag |
|------|-------|--------|
| Debitoren L+L 1100 | Verbindlichkeiten MWST 2200 | CHF 30'800.– |

---

**Schritt 2 – Rabattkorrektur:**
Der Rabatt von 10 % bezieht sich auf den Bruttobetrag:

$$\text{Rabatt brutto} = 430'800 \times 0.10 = 43'080$$
$$\text{Rabatt netto} = \frac{43'080}{1.077} = 40'000$$
$$\text{MWST-Korrektur} = 43'080 - 40'000 = 3'080$$

**Buchung 8 – Rabattkorrektur (Nettoanteil):**
| Soll | Haben | Betrag |
|------|-------|--------|
| Produktionserlöse 3000 | Debitoren L+L 1100 | CHF 40'000.– |

**Buchung 9 – Rabattkorrektur (Steueranteil):**
| Soll | Haben | Betrag |
|------|-------|--------|
| Verbindlichkeiten MWST 2200 | Debitoren L+L 1100 | CHF 3'080.– |

---

**Schritt 3 – Zahlungseingang:**
$$430'800 - 43'080 = 387'720$$

**Buchung 10 – Zahlungseingang:**
| Soll | Haben | Betrag |
|------|-------|--------|
| Bank / Post 1020 | Debitoren L+L 1100 | CHF 387'720.– |

**Ergebnis Umsatzsteuer nach Rabatt:**
$$30'800 - 3'080 = \mathbf{27'720}$$

**Ergebnis Produktionserlöse nach Rabatt:**
$$400'000 - 40'000 = \mathbf{360'000}$$

---

## 6. Periodische MWST-Abrechnung

### 6.1 Berechnung der MWST-Schuld

Am Ende des Quartals werden Umsatzsteuer und Vorsteuer gegenübergestellt:

| Position | Betrag |
|----------|--------|
| Umsatzsteuer aus Verkauf (nach Rabatt) | CHF 27'720.– |
| ./. Vorsteuer aus Einkauf (nach Skonto) | CHF 13'582.80 |
| **Abzuliefernde MWST** | **CHF 14'137.20** |

### 6.2 Probe: MWST aus dem Bruttogewinn

Die abzuliefernde MWST entspricht genau **7,7 % des geschaffenen Mehrwerts** (Bruttogewinn):

| Position | Betrag |
|----------|--------|
| Produktionserlöse netto (nach Rabatt) | CHF 360'000.– |
| ./. Materialaufwand netto (nach Skonto) | CHF 176'400.– |
| **Bruttogewinn (= Mehrwert)** | **CHF 183'600.–** |
| 7,7 % von CHF 183'600 | **CHF 14'137.20** |

Dies bestätigt die Mehrwertlogik der Steuer: Das Unternehmen schuldet dem Staat genau jenen Steueranteil, der seinem selbst erbrachten Mehrwert entspricht.

> **Einschränkung:** Diese Gleichheit gilt nur, wenn keine weiteren vorsteuerbelasteten Aufwände (z.B. Löhne mit Fremdleistungen, Investitionen) anfallen. Sobald zusätzliche Vorsteuerbeträge vorhanden sind, weichen MWST-Schuld und 7,7 % des Bruttogewinns voneinander ab.

### 6.3 Buchungssätze für die Abrechnung

**Schritt 1 – Vorsteuer auf MWST-Verbindlichkeitskonto umbuchen:**
| Soll | Haben | Betrag |
|------|-------|--------|
| Verbindlichkeiten MWST 2200 | Vorsteuer 1170 | CHF 13'582.80 |

**Schritt 2 – Zahlung der verbleibenden MWST-Schuld:**
| Soll | Haben | Betrag |
|------|-------|--------|
| Verbindlichkeiten MWST 2200 | Bank / Post 1020 | CHF 14'137.20 |

### 6.4 MWST-Abrechnungsformular (ESTV)

Das Formular der Eidgenössischen Steuerverwaltung verlangt:
- Verkaufsumsätze werden **netto** (ohne MWST) eingetragen
- Entgeltsminderungen (Skonti, Rabatte) werden ebenfalls **netto** ausgewiesen
- Die entsprechenden Steuerbeträge werden separat deklariert

Dies entspricht exakt der Logik der Nettomethode und stellt die direkte Verbindung zwischen Buchhaltung und steuerlicher Deklaration sicher.

---

## 7. Forderungsverluste und MWST-Korrektur

### 7.1 Grundprinzip

Wenn eine bereits fakturierte Forderung ganz oder teilweise uneinbringlich wird, **darf die ursprünglich verbuchte Umsatzsteuer im Ausmass des tatsächlichen Ausfalls korrigiert werden**. Das Unternehmen soll keine MWST abliefern müssen auf Entgelten, die es wirtschaftlich nie erhalten hat.

### 7.2 Praxisbeispiel: Forderungsausfall bei Konkurs

**Ausgangslage – ursprüngliche Fakturierung:**
- Forderung aus Lieferung: **CHF 12'924.– inkl. 7,7 % MWST**
- Nettoerlös: CHF 12'000.–
- Umsatzsteuer: CHF 924.–

**Weitere Positionen nach Mahnung und Betreibung:**
- Kostenvorschuss: CHF 100.–
- Verzugszinsen: CHF 440.–
- **Gesamtforderung per 18.12.: CHF 13'464.–**

**Konkursverfahren:**
- Konkursdividende: **10 %** der Gesamtforderung
- Eingang: CHF 1'346.40
- **Gesamtausfall: CHF 12'117.60**

**Berechnung des MWST-Ausfalls:**
Der MWST-Ausfall berechnet sich anteilig aus dem Verhältnis der ursprünglichen MWST zur ursprünglichen Nettoforderung plus MWST:

- Ursprüngliche MWST: CHF 924.–
- Davon als bezahlt geltend (10 %): CHF 92.40
- **MWST-Ausfall: CHF 831.60**

**Eigentlicher Forderungsverlust:**
$$12'117.60 - 831.60 = \mathbf{11'286.–}$$

### 7.3 Buchungssätze Forderungsausfall

**Phase 1 – Ursprüngliche Buchungen (Fakturierung):**

Buchung 1 – Nettoerlös:
| Soll | Haben | Betrag |
|------|-------|--------|
| Debitoren L+L 1100 | Produktionserlöse 3000 | CHF 12'000.– |

Buchung 2 – Umsatzsteuer:
| Soll | Haben | Betrag |
|------|-------|--------|
| Debitoren L+L 1100 | Verbindlichkeiten MWST 2200 | CHF 924.– |

**Phase 2 – Zusätzliche Forderungsbestandteile:**

Buchung 3 – Kostenvorschuss:
| Soll | Haben | Betrag |
|------|-------|--------|
| Debitoren L+L 1100 | Bank / Post 1020 | CHF 100.– |

Buchung 4 – Verzugszinsen:
| Soll | Haben | Betrag |
|------|-------|--------|
| Debitoren L+L 1100 | Zinsertrag | CHF 440.– |

**Phase 3 – Eingang der Konkursdividende:**

Buchung 5 – Teilzahlung:
| Soll | Haben | Betrag |
|------|-------|--------|
| Bank / Post 1020 | Debitoren L+L 1100 | CHF 1'346.40 |

**Phase 4 – Korrektur der Umsatzsteuer und Verbuchung des Verlusts:**

Buchung 6 – MWST-Ausfall korrigieren:
| Soll | Haben | Betrag |
|------|-------|--------|
| Verbindlichkeiten MWST 2200 | Debitoren L+L 1100 | CHF 831.60 |

Buchung 7 – Forderungsverlust verbuchen:
| Soll | Haben | Betrag |
|------|-------|--------|
| Verlust aus Forderungen | Debitoren L+L 1100 | CHF 11'286.– |

**Saldokontrolle Debitoren nach allen Buchungen:**
$$12'000 + 924 + 100 + 440 - 1'346.40 - 831.60 - 11'286 = 0$$

### 7.4 Wichtige fachliche Anmerkung

Das Lehrmittel weist ausdrücklich darauf hin, dass die vereinfachte Praxislösung **nicht vollständig korrekt** ist: Der volle Zinsertrag von CHF 440.– wird als Ertrag ausgewiesen, obwohl streng genommen auch auf den Zinsen ein Ausfall von 90 % (CHF 396.–) zu verbuchen wäre. Diese Vereinfachung ist didaktisch üblich, muss aber bei strenger periodengerechter Betrachtung korrigiert werden.

---

## 8. Zusammenfassung aller Buchungssätze (Gesamtübersicht)

### Einkaufsseite (Material für Solaranlage)

| Nr. | Beschreibung | Soll | Haben | CHF |
|-----|-------------|------|-------|-----|
| 1 | Rechnungseingang netto | Materialaufwand 4000 | Verbindlichkeiten L+L 2000 | 180'000.– |
| 2 | Rechnungseingang Vorsteuer | Vorsteuer 1170 | Verbindlichkeiten L+L 2000 | 13'860.– |
| 3 | Skonto netto | Verbindlichkeiten L+L 2000 | Materialaufwand 4000 | 3'600.– |
| 4 | Skonto Vorsteuerkorrektur | Verbindlichkeiten L+L 2000 | Vorsteuer 1170 | 277.20 |
| 5 | Zahlung Lieferant | Verbindlichkeiten L+L 2000 | Bank / Post 1020 | 189'982.80 |

### Verkaufsseite (Photovoltaikanlage)

| Nr. | Beschreibung | Soll | Haben | CHF |
|-----|-------------|------|-------|-----|
| 6 | Rechnungsausgang netto | Debitoren L+L 1100 | Produktionserlöse 3000 | 400'000.– |
| 7 | Rechnungsausgang Umsatzsteuer | Debitoren L+L 1100 | Verbindlichkeiten MWST 2200 | 30'800.– |
| 8 | Rabatt netto | Produktionserlöse 3000 | Debitoren L+L 1100 | 40'000.– |
| 9 | Rabatt Umsatzsteuerkorrektur | Verbindlichkeiten MWST 2200 | Debitoren L+L 1100 | 3'080.– |
| 10 | Zahlungseingang Kunde | Bank / Post 1020 | Debitoren L+L 1100 | 387'720.– |

### Periodische MWST-Abrechnung

| Nr. | Beschreibung | Soll | Haben | CHF |
|-----|-------------|------|-------|-----|
| 11 | Vorsteuer verrechnen | Verbindlichkeiten MWST 2200 | Vorsteuer 1170 | 13'582.80 |
| 12 | MWST-Schuld überweisen | Verbindlichkeiten MWST 2200 | Bank / Post 1020 | 14'137.20 |

---

## 9. Wichtige Rechenformeln und Merkhilfen

### Brutto ↔ Netto Umrechnung

$$\text{Brutto} = \text{Netto} \times (1 + \text{Steuersatz})$$
$$\text{Netto} = \frac{\text{Brutto}}{1 + \text{Steuersatz}}$$
$$\text{Steuer} = \text{Brutto} - \text{Netto} = \text{Netto} \times \text{Steuersatz}$$

**Beispiel (7,7 %):**
$$\text{Netto} = \frac{193'860}{1.077} = 180'000$$

### Entgeltsminderung aufsplitten

$$\text{Minderung netto} = \frac{\text{Minderung brutto}}{1 + \text{Steuersatz}}$$
$$\text{Steuerkorrektur} = \text{Minderung brutto} - \text{Minderung netto}$$

### Periodische MWST-Schuld

$$\text{MWST-Schuld} = \text{Umsatzsteuer} - \text{Vorsteuer}$$

### Mehrwertprobe

$$\text{MWST-Schuld} = \text{Mehrwert} \times \text{Steuersatz}$$

### Forderungsverlust

$$\text{Forderungsverlust netto} = \text{Gesamtausfall} - \text{MWST-Ausfall}$$
$$\text{MWST-Ausfall} = \text{urspr. MWST} \times (1 - \text{Dividendensatz})$$

---

## 10. Kernaussagen und Prüfungsregeln

1. Die MWST belastet wirtschaftlich den **Endkonsum**, technisch aber jede steuerpflichtige Stufe der Wertschöpfungskette.
2. Unternehmen schulden nicht die gesamte vereinnahmte Steuer – sondern **Umsatzsteuer minus abzugsfähige Vorsteuer**.
3. Die **Nettomethode** zerlegt jeden MWST-relevanten Geschäftsfall in Nettoanteil und Steueranteil (= zwei separate Buchungssätze).
4. Die **Abrechnung nach vereinbartem Entgelt** knüpft an die Rechnungsstellung an, nicht an den Zahlungsfluss.
5. Rabatte, Skonti und Rücksendungen korrigieren **immer auch den Steueranteil** – nicht nur den Erlös oder Aufwand.
6. Die **Zahlung** einer bereits korrekt gebuchten Rechnung wird in einem einzigen Buchungssatz mit dem effektiven Geldbetrag verbucht.
7. Die periodische MWST-Schuld entspricht bei reinen Produktionsvorgängen dem **Steuersatz auf dem Bruttogewinn**.
8. **Forderungsverluste** berechtigen zur anteiligen Korrektur der bereits verbuchten Umsatzsteuer.
9. Der Unterschied **steuerbefreit vs. ausgenommen** ist für das Vorsteuerabzugsrecht entscheidend.
10. Korrekturbuchungen sind stets das **Umkehrbild** der ursprünglichen Rechnungsbuchung.

---

## 11. Häufige Fehlerquellen und Falltricks

| Fehler | Korrekte Behandlung |
|--------|---------------------|
| Skonto nur netto verbuchen | Skonto immer in netto + Vorsteuerkorrektur aufteilen |
| Rabatt als Ausgabe auf separatem Konto | Rabatt als Umkehrbuchung zur Originalrechnung, inkl. MWST-Korrektur |
| Zahlung nochmals mit MWST verbuchen | Zahlung ist ein reiner Ausgleichsvorgang – keine neue Steuer |
| Steuerbefreit und ausgenommen verwechseln | Steuerbefreit = 0 % MIT Vorsteuerabzug; ausgenommen = OHNE Vorsteuerabzug |
| Forderungsverlust = Gesamtausfall | MWST-Anteil des Ausfalls separat korrigieren; Verlust = Nettoverlust |
| MWST auf Bruttogewinn immer anwendbar | Nur wenn keine weiteren vorsteuerbelasteten Aufwände vorhanden |

---

## 12. Prüfungsfragen und Verständnisaufgaben

### Grundlagenfragen

1. Warum trägt wirtschaftlich der Endkonsument die MWST, obwohl mehrere Unternehmen entlang der Wertschöpfungskette MWST verbuchen und abliefern?
2. Worin liegt der Unterschied zwischen einem **steuerbefreiten** Umsatz und einem von der Steuer **ausgenommenen** Umsatz? Warum ist diese Unterscheidung für den Vorsteuerabzug entscheidend?
3. Erkläre den Unterschied zwischen **Nettomethode** und **Bruttomethode** – nicht nur definitorisch, sondern anhand ihrer Wirkung auf Aufwand, Ertrag und Steuerkonten.
4. Warum wird bei der Abrechnung nach vereinbartem Entgelt die Umsatzsteuer schon bei der Rechnungsstellung erfasst und nicht erst beim Zahlungseingang?

### Buchungsfragen

5. Weshalb muss ein Skonto unter der Nettomethode in **Nettoanteil und Vorsteuerkorrektur** zerlegt werden?
6. Weshalb reduziert ein nachträglicher Rabatt nicht nur den Ertrag, sondern auch die **geschuldete Umsatzsteuer**?
7. Warum wird die Bezahlung einer bereits korrekt gebuchten Rechnung unter der Nettomethode nur mit dem **tatsächlich bezahlten Geldbetrag** verbucht?
8. Buche den folgenden Fall vollständig: Einkauf Maschine CHF 32'310 inkl. 7,7 % MWST. Zahlung innerhalb 10 Tagen mit 3 % Skonto. (Erarbeite alle Buchungssätze mit Beträgen.)

### Abrechnungsfragen

9. Zeige rechnerisch und logisch, warum die abzuliefernde MWST im Hauptbeispiel sowohl aus **Umsatzsteuer minus Vorsteuer** als auch aus **7,7 % des Bruttogewinns** ermittelt werden kann.
10. Unter welchen Voraussetzungen ist diese Gleichheit zwischen MWST-Schuld und einem Prozentsatz des Bruttogewinns **gültig**, und wann wäre sie **nicht** anwendbar?
11. Welche Positionen werden auf dem **MWST-Abrechnungsformular der ESTV netto** (ohne MWST) eingetragen?

### Forderungsverlustfragen

12. Warum darf bei einem Forderungsverlust die ursprünglich verbuchte **Umsatzsteuer teilweise korrigiert** werden?
13. Wie wird im Konkursbeispiel der eigentliche **Forderungsverlust** vom **Steuerausfall** getrennt?
14. Weshalb ist die im Dokument dargestellte Praxislösung für den **Zinsertrag im Konkursfall** nicht vollständig korrekt?
15. Berechne: Forderung CHF 21'540 inkl. 7,7 % MWST; Konkurs; Dividende 20 %. Wie hoch sind MWST-Ausfall und eigentlicher Forderungsverlust?

---

## 13. Lösungen zu den Rechenaufgaben

### Aufgabe 8: Maschinenkauf mit Skonto

- Brutto: CHF 32'310.–
- Netto: 32'310 / 1.077 = CHF 30'000.–
- Vorsteuer: CHF 2'310.–

Buchungssätze:
1. Maschinen / Verbindlichkeiten L+L | CHF 30'000.–
2. Vorsteuer 1170 / Verbindlichkeiten L+L 2000 | CHF 2'310.–

Skonto 3 %:
- Skonto brutto: 32'310 × 0.03 = CHF 969.30
- Skonto netto: 969.30 / 1.077 = CHF 900.–
- Vorsteuerkorrektur: CHF 69.30

3. Verbindlichkeiten L+L 2000 / Maschinen | CHF 900.–
4. Verbindlichkeiten L+L 2000 / Vorsteuer 1170 | CHF 69.30
5. Verbindlichkeiten L+L 2000 / Bank 1020 | CHF 31'340.70

Effektive Vorsteuer: 2'310 – 69.30 = **CHF 2'240.70**

### Aufgabe 15: Forderungsausfall

- Brutto: CHF 21'540.–
- Netto: 21'540 / 1.077 = CHF 20'000.–
- Umsatzsteuer: CHF 1'540.–
- Konkursdividende 20 %: CHF 4'308.–
- Gesamtausfall: CHF 17'232.–
- MWST-Ausfall: 1'540 × 0.80 = **CHF 1'232.–**
- Forderungsverlust: 17'232 – 1'232 = **CHF 16'000.–**

---

## 14. Steuersätze auf einen Blick (Übersichtstabelle)

| Steuersatz | Kategorie | Vorsteuerabzug | Typische Beispiele |
|------------|-----------|---------------|-------------------|
| 0 % | Steuerbefreit | Ja | Exporte von Waren und Dienstleistungen |
| 2,5 % | Reduziert | Ja | Lebensmittel, Medikamente, Zeitungen, Bücher |
| 3,7 % | Sondersatz Beherbergung | Ja | Hotelübernachtungen |
| 7,7 % | Normalsatz | Ja | Alle übrigen steuerbaren Leistungen |
| — | Ausgenommen | Nein (Grundsatz) | Ärzte, Schulen, Versicherungen, Vermietung, Banken |

---

## 15. Schematische Übersicht: MWST-Verarbeitungsprozess

\`\`\`
EINGANGSRECHNUNG (Einkauf)
├── Nettobetrag → Aufwand / Anlagevermögen
└── MWST-Anteil → Vorsteuer 1170

    Entgeltsminderung (Skonto/Rabatt/Rücksendung):
    ├── Netto-Minderung → Aufwand reduzieren (Umkehrbuchung)
    └── Steuer-Korrektur → Vorsteuer 1170 reduzieren

    Zahlung:
    └── Effektiver Geldbetrag → Verbindlichkeit ausgleichen

AUSGANGSRECHNUNG (Verkauf)
├── Nettobetrag → Erlös / Ertragskonto
└── MWST-Anteil → Verbindlichkeiten MWST 2200

    Entgeltsminderung (Rabatt/Skonto/Rücksendung):
    ├── Netto-Minderung → Erlös reduzieren (Umkehrbuchung)
    └── Steuer-Korrektur → Verbindlichkeiten MWST 2200 reduzieren

    Zahlungseingang:
    └── Effektiver Geldbetrag → Forderung ausgleichen

PERIODENABSCHLUSS
├── Vorsteuer 1170 → Verbindlichkeiten MWST 2200 (Verrechnung)
└── Verbleibende MWST-Schuld → Bank (Zahlung)

FORDERUNGSAUSFALL
├── Gesamtausfall = Nettoverlust + MWST-Ausfall
├── MWST-Ausfall → Verbindlichkeiten MWST 2200 korrigieren
└── Nettoverlust → Verlust aus Forderungen
\`\`\`

---

## 16. Verbindungen zu anderen FRW-Themen

| Thema | Verbindung zur MWST |
|-------|---------------------|
| Debitoren / Kreditoren | Forderungen und Verbindlichkeiten enthalten MWST |
| Erfolgsrechnung | Erlöse und Aufwände werden netto (ohne MWST) ausgewiesen |
| Bilanz | Vorsteuer und MWST-Verbindlichkeiten erscheinen in der Bilanz |
| Abschlussarbeiten | Periodische MWST-Verrechnung ist Teil der Quartalsabschlüsse |
| Forderungsmanagement | Abschreibungen auf Forderungen erfordern MWST-Korrektur |
| Wertschriften / Immobilien | Bestimmte Umsätze sind ausgenommen – kein Vorsteuerabzug |
| Saldosteuersatzmethode | Alternative Abrechnungsmethode; vereinfacht die MWST-Abrechnung für KMU |

---

*Dieses Kapitel basiert auf dem FRW-Lehrmittel Band 3, Kapitel 1 (Seiten 9–20) und deckt die schweizerische MWST-Vertiefung für die Abschlussprüfung ab. Steuersätze und Formulare sind gemäss Lehrmittelstand; für aktuelle Anwendungen die geltenden ESTV-Vorschriften konsultieren.*
`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  console.log('Connected to database')

  const result = await client.query(
    `UPDATE "Chapter" SET summary = $1, "updatedAt" = NOW() WHERE id = ANY($2::uuid[])`,
    [SUMMARY, ['841e0a7e-840f-4d99-bacc-2ca5c9b24e2f', '62433cc6-d3cc-4883-bce0-047cbbc14949']]
  )

  console.log(`Updated ${result.rowCount} chapter(s) for mwst-vertiefung`)
  await client.end()
  console.log('Done')
}

main().catch(console.error)
