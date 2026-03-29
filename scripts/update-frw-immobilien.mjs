import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = `# Immobilien – Liegenschaften im Rechnungswesen (Band 3, Kapitel 4)

## 1. Überblick und Lernziele

Dieses Kapitel behandelt die buchhalterische Behandlung von Immobilien und Liegenschaften im Unternehmenskontext. Die drei Kernthemen sind eng miteinander verbunden:

1. **Laufende Verbuchung** – Aufwände und Erträge einer betrieblich gehaltenen Liegenschaft
2. **Kauf und Verkauf** – vollständige Buchungsabläufe mit Nebenkosten, Hypotheken und Abrechnungskonten
3. **Rendite und Bewertung** – Bruttorendite, Nettorendite und Ertragswertmethode

**Typisches Schweizer Szenario:** Ein Unternehmen besitzt eine Geschäftsliegenschaft, nutzt Teile davon selbst und vermietet andere Teile an Dritte. Dadurch entstehen sowohl betriebliche als auch liegenschaftsbezogene Erfolgsbestandteile – diese müssen klar getrennt werden, damit der Betriebserfolg nicht durch Immobilien-Nebenerfolge verzerrt wird.

---

## 2. Das Kontensystem für Liegenschaften

### 2.1 Die vier Hauptkonten im Überblick

| Konto | Typ | Soll | Haben |
|---|---|---|---|
| **Immobilien** | Aktivkonto (Anlagevermögen) | Käufe, Nebenkosten, wertvermehrende Investitionen, Verkaufsgewinn | Verkäufe, Abschreibungen, Verkaufsverlust |
| **Hypotheken** | Passivkonto (langfr. Fremdkapital) | Amortisationen, Abzahlungen | Anfangsbestand, neue Hypotheken |
| **Liegenschaftsaufwand** | Aufwandskonto (Erfolgskonto) | Unterhalt, Versicherungen, Hypothekarzinsen, Abschreibungen | Korrekturen |
| **Liegenschaftsertrag** | Ertragskonto (Erfolgskonto) | Korrekturen | Mietzinseinnahmen, Mietwerte |

### 2.2 Bilanzkonto Immobilien (Aktivkonto)

Das Konto **Immobilien** bildet den bilanziellen Wert der Liegenschaften ab:

**Sollseite (Zugänge und Aufwertungen):**
- Anfangsbestand der Liegenschaften
- Kaufpreis beim Erwerb
- Handänderungskosten, Notariats- und Grundbuchgebühren (Käuferanteil)
- Neubauten und Erweiterungen
- Wertvermehrende Sanierungen und Ausbauten
- Verkaufsgewinne (in bestimmten Buchungsvarianten)

**Habenseite (Abgänge und Wertminderungen):**
- Buchwert bei Verkauf
- Abschreibungen (jährliche Wertminderung)
- Verkaufsverluste

### 2.3 Bilanzkonto Hypotheken (Passivkonto)

Das Konto **Hypotheken** zeigt die Fremdfinanzierung der Liegenschaft:

**Habenseite:** Anfangsbestand und neue Hypotheken (Aufnahme)
**Sollseite:** Amortisationen und Rückzahlungen

### 2.4 Erfolgskonto Liegenschaftsaufwand

Über dieses Konto laufen **alle** Aufwände, die direkt aus Eigentum und Betrieb der Liegenschaft entstehen:

- Unterhalt und Reparaturen (werterhaltend)
- Versicherungen der Liegenschaft
- Heizkosten
- Strom und Wasser
- Hauswart-Kosten
- Verwaltungskosten
- **Hypothekarzinsen** (Finanzierungskosten gehören zum Liegenschaftsaufwand, nicht zum allgemeinen Finanzaufwand)
- **Abschreibungen** auf der Liegenschaft

### 2.5 Erfolgskonto Liegenschaftsertrag

Über dieses Konto laufen **alle** immobilienbezogenen Erträge:

- Mietzinseinnahmen von Dritten (externe Mieter)
- Mietwert der Geschäftsräume (intern verrechnet)
- Mietwert der Privatwohnung des Inhabers (intern verrechnet)

**Liegenschaftserfolg = Liegenschaftsertrag − Liegenschaftsaufwand**

Der Saldo zeigt unmittelbar den Gewinn oder Verlust der Liegenschaft.

### 2.6 Abrechnungskonten bei Kauf und Verkauf

| Situation | Abrechnungskonto |
|---|---|
| **Kauf** einer Liegenschaft | **Verbindlichkeiten L+L** |
| **Verkauf** einer Liegenschaft | **Forderungen L+L** |

Diese temporären Konten sammeln alle gegenseitigen Ansprüche (Kaufpreis, Hypothekenübernahme, Heizölvorrat, Mietzinsabgrenzungen) und werden anschliessend durch die Restzahlung per Bank auf null abgeschlossen.

---

## 3. Mehrstufige Erfolgsrechnung mit Liegenschaften

Liegenschaften erscheinen in einer mehrstufigen Erfolgsrechnung **nicht** im Betriebserfolg, sondern auf der Stufe des Unternehmensgewinns:

```
Warenerlös
− Warenaufwand
− Forderungsverluste
= BRUTTOGEWINN

− Betriebliche Aufwände (Personal, Verwaltung, Raum usw.)
+ Finanzertrag
= BETRIEBSGEWINN (EBIT)

− Ausserordentlicher Aufwand
+ Liegenschaftsertrag
− Liegenschaftsaufwand
= UNTERNEHMENSGEWINN
```

**Warum diese Trennung?** Vermietung an Dritte gehört nicht zum eigentlichen Unternehmenszweck. Würden die Liegenschaftsergebnisse in den Betriebsgewinn einfliessen, wäre die Kernperformance des Unternehmens nicht mehr lesbar. Die saubere Trennung verbessert die Aussagekraft der Erfolgsrechnung erheblich.

---

## 4. Mietwertverrechnung (interne Leistungsverrechnung)

### Grundprinzip

Wenn ein Unternehmen eigene Räume in der eigenen Liegenschaft nutzt, zahlt es keine externe Miete. Trotzdem soll der Raumaufwand in der Erfolgsrechnung sichtbar sein – und die Liegenschaft soll ihren Ertrag ausweisen. Daher wird ein **Mietwert intern verrechnet**.

### Buchungssätze Mietwertverrechnung

| Situation | Buchungssatz | Erläuterung |
|---|---|---|
| Geschäftsräume selbst genutzt | Raumaufwand / Liegenschaftsertrag | Betrieb trägt Raumkosten, Liegenschaft erzielt Ertrag |
| Privatwohnung des Inhabers | Privat / Liegenschaftsertrag | Privatentnahme für Wohnnutzung |
| Externe Mietzinseinnahmen | Bank / Liegenschaftsertrag | Echte Mietzahlung von Drittmietern |

### Bedeutung

Durch diese Technik zeigt die Liegenschaft immer ihren vollen Ertrag – egal ob die Miete extern eingeht oder intern verrechnet wird. Gleichzeitig erscheinen die Raumkosten des Betriebs im Aufwand, wo sie hingehören.

---

## 5. Abschreibung von Liegenschaften

### 5.1 Buchungssatz

```
Liegenschaftsaufwand / Immobilien   (Betrag der Abschreibung)
```

Die Abschreibung senkt den **Buchwert der Liegenschaft** und ist gleichzeitig ein Aufwand im **Liegenschaftsaufwand**. Sie fliesst damit in den Liegenschaftserfolg ein.

### 5.2 Lineare Abschreibung

Bei der linearen Methode wird jedes Jahr derselbe Betrag abgeschrieben:

```
Abschreibungsbetrag = Anschaffungskosten / Nutzungsdauer in Jahren
```

**Beispiel:** Liegenschaft CHF 1'200'000, Nutzungsdauer 40 Jahre
→ Jährliche Abschreibung: CHF 1'200'000 / 40 = **CHF 30'000**

Der Buchwert sinkt jedes Jahr gleichmässig bis auf CHF 0 (oder einen Restwert).

### 5.3 Degressive Abschreibung

Bei der degressiven Methode wird ein fixer Prozentsatz vom **Restwert** (Buchwert) berechnet:

```
Abschreibungsbetrag = aktueller Buchwert × Abschreibungssatz %
```

**Beispiel:** Buchwert CHF 1'200'000, Satz 5 %
→ Jahr 1: 1'200'000 × 5 % = CHF 60'000 → neuer Buchwert CHF 1'140'000
→ Jahr 2: 1'140'000 × 5 % = CHF 57'000 → neuer Buchwert CHF 1'083'000
→ Die Beträge sinken jedes Jahr, der Buchwert nähert sich null asymptotisch.

### 5.4 Vergleich: Linear vs. Degressiv

| Merkmal | Linear | Degressiv |
|---|---|---|
| Basis | Anschaffungskosten (konstant) | Aktueller Buchwert (sinkt) |
| Abschreibungsbetrag | Gleich jedes Jahr | Höher am Anfang, sinkt laufend |
| Buchwert-Verlauf | Gerade Linie | Kurve (exponentiell fallend) |
| Vorteil | Einfach, vorhersehbar | Höhere Steuerersparnis am Anfang |

---

## 6. Werterhaltende vs. wertvermehrende Kosten

Diese Unterscheidung ist eine **Kernregel** der Liegenschaftsbuchhaltung.

### 6.1 Werterhaltende Kosten → Aufwand

**Definition:** Die Ausgabe erhält den bisherigen Zustand oder Nutzen der Liegenschaft. Der Wert bleibt im Wesentlichen gleich.

**Typische Beispiele:**
- Malerarbeiten (Renovation bestehender Oberflächen)
- Reparaturen an Heizung, Fenstern, Türen
- Ersatz vorhandener Geräte durch gleichwertige
- Dachsanierung (erhaltend, nicht erweiternd)

**Buchungssatz:**
```
Liegenschaftsaufwand / Bank (oder Kreditoren)
```

Die Kosten sind **sofort erfolgswirksam** und senken den Liegenschaftserfolg in der aktuellen Periode.

### 6.2 Wertvermehrende Kosten → Aktivierung

**Definition:** Die Ausgabe erhöht den Wert der Liegenschaft über den bisherigen Stand hinaus.

**Typische Beispiele:**
- Erweiterung um zusätzliche Räume
- Einbau einer Klimaanlage (neu, war vorher nicht vorhanden)
- Ausbau des Dachgeschosses zur Wohnung
- Fundamentale Modernisierung, die den Standard deutlich hebt

**Buchungssatz:**
```
Immobilien / Bank (oder Kreditoren)
```

Die Kosten werden **aktiviert** – sie erhöhen den Buchwert der Liegenschaft und beeinflussen erst später über höhere Abschreibungen oder einen höheren Buchwert den Erfolg.

### 6.3 Steuerliche Relevanz

Die Unterscheidung ist auch **steuerlich** wichtig: Werterhaltende Kosten sind steuerlich sofort abziehbar; wertvermehrende Kosten müssen über Abschreibungen verteilt werden. In der Praxis gibt es Graubereiche – die Qualifikation muss fallweise beurteilt werden.

---

## 7. Kauf einer Liegenschaft – vollständige Buchung

### 7.1 Ausgangssituation

Das Unternehmen kauft eine voll vermietete Liegenschaft zur Eröffnung einer Filiale.

**Gegebene Werte:**
| Position | Betrag CHF |
|---|---|
| Kaufpreis Gebäude | 1'180'000 |
| Handänderungskosten total | 11'600 |
| Anteil Käufer (50 %) | 5'800 |
| Übernommene Hypothek | 900'000 |
| Heizölvorrat übernommen | 3'400 |
| Vorausbezahlter Mietzins (Käufer zugute) | 1'100 |
| **Restzahlung per Bank** | **282'300** |

### 7.2 Buchungsablauf

**Schritt 1: Kaufpreis über Abrechnungskonto erfassen**
```
Immobilien 1'180'000 / Verbindlichkeiten L+L 1'180'000
```

**Schritt 2: Handänderungskosten (Käuferanteil direkt)**
```
Immobilien 5'800 / Bank 5'800
```

**Schritt 3: Hypothek wird übernommen (verrechnet mit Schuld gegenüber Verkäufer)**
```
Verbindlichkeiten L+L 900'000 / Hypotheken 900'000
```

**Schritt 4: Heizölvorrat wird übernommen**
```
Liegenschaftsaufwand 3'400 / Verbindlichkeiten L+L 3'400
```
*(Der Heizölvorrat ist ein Aufwand für den Käufer – er bezahlt dafür, erhält aber keinen eigenen Lagerposten auf der Bilanz.)*

**Schritt 5: Bereits bezahlter Mietzins steht Käufer zu**
```
Verbindlichkeiten L+L 1'100 / Liegenschaftsertrag 1'100
```
*(Der vorausbezahlte Mietzins gehört dem Käufer → er ist ein Ertrag für die Liegenschaft.)*

**Schritt 6: Restzahlung per Bank**
```
Verbindlichkeiten L+L 282'300 / Bank 282'300
```

### 7.3 Saldoberechnung Verbindlichkeiten L+L

| Soll (Abzüge vom Schuldbetrag) | Haben (Schuldbetrag und Zuschläge) |
|---|---|
| Hypotheken 900'000 | Kaufpreis 1'180'000 |
| Heizöl → nein (Soll-Seite) | − |
| Mietzins 1'100 | Heizöl 3'400 |
| Bank 282'300 | |
| **Total Soll: 1'183'400** | **Total Haben: 1'183'400** ✓ |

Das Konto **Verbindlichkeiten L+L** schliesst auf null ab.

### 7.4 Bilanzeffekt nach dem Kauf

```
Aktiven:
+ Immobilien: +1'185'800 (Kaufpreis + Nebenkosten)
+ Liegenschaftsaufwand: +3'400 (Heizöl)
− Bank: −288'100 (Nebenkosten + Restzahlung)

Passiven:
+ Hypotheken: +900'000
```

---

## 8. Verkauf einer Liegenschaft – vollständige Buchung

### 8.1 Ausgangssituation

Die Liegenschaft (Buchwert CHF 920'000) wird für CHF 1'180'000 verkauft.

**Gegebene Werte:**
| Position | Betrag CHF |
|---|---|
| Verkaufspreis | 1'180'000 |
| Handänderungskosten (Verkäuferanteil) | 5'800 |
| Übernommene Hypothek durch Käufer | 900'000 |
| Heizölvorrat übernommen durch Käufer | 3'400 |
| Mietzinsverrechnung | 1'100 |
| **Restzahlung per Bank** | **282'300** |
| **Buchwert der Liegenschaft** | **920'000** |
| **Verkaufsgewinn** | **260'000** |

### 8.2 Buchungsablauf

**Schritt 1: Anspruch auf Kaufpreis im Abrechnungskonto erfassen**
```
Forderungen L+L 1'180'000 / Immobilien 1'180'000
```
*(Hier wird zunächst der volle Verkaufspreis gegen die Immobilie gebucht.)*

**Schritt 2: Handänderungskosten des Verkäufers**
```
A.o. Ertrag 5'800 / Bank 5'800
```
*(Oder alternativ: Aufwand / Bank – je nach Handhabung. Der Verkäufer trägt seinen Anteil.)*

**Schritt 3: Käufer übernimmt die Hypothek**
```
Hypotheken 900'000 / Forderungen L+L 900'000
```

**Schritt 4: Käufer übernimmt den Heizölvorrat**
```
Forderungen L+L 3'400 / Liegenschaftsaufwand 3'400
```

**Schritt 5: Mietzinsverrechnung zugunsten des Käufers**
```
Liegenschaftsertrag 1'100 / Forderungen L+L 1'100
```

**Schritt 6: Restzahlung per Bank eingeht**
```
Bank 282'300 / Forderungen L+L 282'300
```

**Schritt 7: Verkaufsgewinn erfassen**
```
Immobilien 260'000 / A.o. Ertrag 260'000
```

### 8.3 Berechnung des Verkaufsgewinns

```
Verkaufsgewinn = Verkaufspreis − Buchwert

1'180'000 − 920'000 = CHF 260'000
```

**Warum ausserordentlicher Ertrag?**
Der Verkaufsgewinn ist keine wiederkehrende, betriebsübliche Einnahme – er entsteht durch ein einmaliges Ereignis. Deshalb wird er als **ausserordentlicher Ertrag (A.o. Ertrag)** ausgewiesen, nicht als Liegenschaftsertrag oder betrieblicher Ertrag.

### 8.4 Saldoberechnung Forderungen L+L

| Soll (Abzüge vom Anspruch) | Haben (Anspruch gegenüber Käufer) |
|---|---|
| Hypotheken 900'000 | Verkaufspreis 1'180'000 |
| Heizöl → nein (Haben-Seite) | Heizöl 3'400 |
| Mietzins 1'100 | |
| Bank 282'300 | |
| **Total Soll: 1'183'400** | **Total Haben: 1'183'400** ✓ |

### 8.5 Verkaufsverlust

Falls der Verkaufspreis **unter** dem Buchwert liegt:
```
Verkaufsverlust = Buchwert − Verkaufspreis
Buchung: A.o. Aufwand / Immobilien   (Betrag des Verlustes)
```

---

## 9. Renditeberechnung und Ertragswertmethode

### 9.1 Ausgangsdaten (Beispiel)

| Position | Betrag CHF |
|---|---|
| Kaufpreis | 1'180'000 |
| Hypothek | 900'000 |
| **Eigene Mittel** | **280'000** |
| Mietzinseinnahmen pro Jahr (brutto) | 55'300 |
| Hypothekarzins (2 % von 900'000) | 18'000 |
| Unterhaltskosten pro Jahr | 21'500 |
| **Liegenschaftsgewinn** | **15'800** |

**Berechnung Liegenschaftsgewinn:**
```
55'300 − 18'000 − 21'500 = CHF 15'800
```

### 9.2 Bruttorendite

**Definition:** Verhältnis des Brutto-Liegenschaftsertrags zum Kaufpreis (vor Abzug aller Kosten).

**Formel:**
```
Bruttorendite = Liegenschaftsertrag brutto × 100 / Kaufpreis
```

**Beispiel:**
```
Bruttorendite = 55'300 × 100 / 1'180'000 = 4,69 %
```

**Interpretation:** Mit dieser Liegenschaft erzielt man 4,69 % des investierten Kaufpreises als Bruttoertrag. Diese Kennzahl sagt noch nichts über die Kosten – sie ist eine schnelle Vergleichsgrösse.

### 9.3 Nettorendite

**Definition:** Verhältnis des Liegenschaftsgewinns (nach allen Kosten) zu den eingesetzten eigenen Mitteln.

**Formel:**
```
Nettorendite = Liegenschaftsgewinn × 100 / Eigene Mittel
```

**Beispiel:**
```
Nettorendite = 15'800 × 100 / 280'000 = 5,64 %
```

**Interpretation:** Das eingesetzte Eigenkapital von CHF 280'000 wird mit 5,64 % verzinst. Die Nettorendite ist höher als die Bruttorendite, weil ein grosser Teil der Investition fremdfinanziert ist (Hebeleffekt / Leverage).

**Warum Nettorendite > Bruttorendite möglich?**
Die Hypothek finanziert einen Teil der Liegenschaft zu einem Zinssatz (hier 2 %), der unter der Bruttorendite liegt (4,69 %). Das übrig bleibende Eigenkapital partizipiert überproportional am Gewinn – daher steigt die Eigenkapitalrendite über die Gesamtrendite.

### 9.4 Ertragswert (Ertragswertmethode)

**Definition:** Kapitalisierter Wert der Liegenschaft auf Basis des nachhaltig erzielbaren Ertrags und einer Zielrendite.

**Formel:**
```
Ertragswert = Liegenschaftsertrag brutto × 100 / Bruttorendite in %
```

**Beispiel:**
```
Ertragswert = 55'300 × 100 / 4,69 = CHF 1'179'104.50 ≈ CHF 1'180'000
```

**Alternative Formel (Kapitalwert-Logik):**
```
Ertragswert = Jahresertrag / (Bruttorendite / 100)
```

**Anwendung:** Wenn man weiss, welche Bruttorendite am Markt üblich ist, kann man aus dem Mietertrag den fairen Marktwert einer Liegenschaft ableiten. Ist der tatsächliche Kaufpreis höher als der Ertragswert, zahlt man eine Prämie (zu teuer); ist er tiefer, ist es ein gutes Geschäft.

### 9.5 Zusammenfassung Renditekennzahlen

| Kennzahl | Formel | Bedeutung |
|---|---|---|
| **Bruttorendite** | Brutto-Ertrag × 100 / Kaufpreis | Ertragskraft vor Kosten |
| **Nettorendite** | Liegenschaftsgewinn × 100 / Eigene Mittel | Verzinsung des Eigenkapitals |
| **Ertragswert** | Brutto-Ertrag × 100 / Bruttorendite % | Marktwert aus Ertragssicht |

---

## 10. Vollständige Buchungssatz-Übersicht

### 10.1 Laufende Buchungen

| Vorgang | Soll | Haben |
|---|---|---|
| Mietzinseinnahme (Dritte) | Bank | Liegenschaftsertrag |
| Mietwert Geschäftsräume (intern) | Raumaufwand | Liegenschaftsertrag |
| Mietwert Privatwohnung (Inhaber) | Privat | Liegenschaftsertrag |
| Hypothekarzins bezahlt | Liegenschaftsaufwand | Bank |
| Unterhalt/Reparatur (werterhaltend) | Liegenschaftsaufwand | Bank |
| Versicherungsprämie | Liegenschaftsaufwand | Bank |
| Abschreibung Liegenschaft | Liegenschaftsaufwand | Immobilien |
| Wertvermehrende Sanierung | Immobilien | Bank |
| Hypothek aufgenommen | Bank | Hypotheken |
| Hypothek amortisiert | Hypotheken | Bank |

### 10.2 Buchungen beim Kauf

| Schritt | Soll | Haben | Betrag |
|---|---|---|---|
| Kaufpreis aktivieren | Immobilien | Verbindlichkeiten L+L | 1'180'000 |
| Nebenkosten (Käufer) | Immobilien | Bank | 5'800 |
| Hypothek übernehmen | Verbindlichkeiten L+L | Hypotheken | 900'000 |
| Heizöl übernehmen | Liegenschaftsaufwand | Verbindlichkeiten L+L | 3'400 |
| Mietzins verrechnen | Verbindlichkeiten L+L | Liegenschaftsertrag | 1'100 |
| Restzahlung | Verbindlichkeiten L+L | Bank | 282'300 |

### 10.3 Buchungen beim Verkauf

| Schritt | Soll | Haben | Betrag |
|---|---|---|---|
| Anspruch auf Kaufpreis | Forderungen L+L | Immobilien | 1'180'000 |
| Käufer übernimmt Hypothek | Hypotheken | Forderungen L+L | 900'000 |
| Käufer übernimmt Heizöl | Forderungen L+L | Liegenschaftsaufwand | 3'400 |
| Mietzins verrechnen | Liegenschaftsertrag | Forderungen L+L | 1'100 |
| Restzahlung eingeht | Bank | Forderungen L+L | 282'300 |
| Verkaufsgewinn buchen | Immobilien | A.o. Ertrag | 260'000 |

---

## 11. Wichtige Konzepte und Definitionen

### Liegenschaft / Immobilie
Grundstück mit Gebäude, das vom Unternehmen gehalten, genutzt oder vermietet wird. Als materieller Anlagewert erscheint die Liegenschaft auf der Aktivseite der Bilanz.

### Liegenschaftsaufwand
Erfolgskonto (Aufwand), das alle immobilienbezogenen Kosten sammelt: Unterhalt, Versicherungen, Heizkosten, Hypothekarzinsen, Abschreibungen. Dient der sauberen Trennung von Betriebs- und Liegenschaftskosten.

### Liegenschaftsertrag
Erfolgskonto (Ertrag), das alle immobilienbezogenen Einnahmen erfasst: externe Mietzinseinnahmen und intern verrechnete Mietwerte.

### Mietwert
Fiktiver, intern verrechneter Nutzungswert selbst genutzter Räume. Macht den Raumaufwand des Betriebs und den Liegenschaftsertrag sichtbar, auch wenn keine externe Zahlung fliesst.

### Werterhaltend
Ausgaben, die den bestehenden Zustand der Liegenschaft erhalten. Sofort als Aufwand (Liegenschaftsaufwand) zu verbuchen.

### Wertvermehrend
Ausgaben, die den Wert der Liegenschaft nachhaltig steigern. Müssen aktiviert werden (Konto Immobilien) und beeinflussen den Erfolg erst über spätere Abschreibungen.

### Abrechnungskonto (beim Kauf: Verb. L+L; beim Verkauf: Ford. L+L)
Temporäres Konto, das beim Liegenschaftsübergang alle gegenseitigen Ansprüche und Verpflichtungen sammelt, bevor der Netto-Restbetrag per Bank abgerechnet wird. Vermeidet unübersichtliche Direktbuchungen.

### Bruttorendite
Brutto-Liegenschaftsertrag im Verhältnis zum Kaufpreis. Massstab für die Ertragskraft vor laufenden Kosten.

### Nettorendite
Liegenschaftsgewinn (nach allen Kosten inkl. Zinsen) im Verhältnis zu den eigenen Mitteln. Massstab für die Verzinsung des eingesetzten Eigenkapitals.

### Ertragswert
Kapitalisierter Marktwert der Liegenschaft auf Basis des nachhaltig erzielbaren Ertrags und der Bruttorendite als Diskontierungssatz.

### Ausserordentlicher Ertrag (A.o. Ertrag)
Konto für einmalige, nicht betriebsübliche Gewinne. Verkaufsgewinne auf Liegenschaften werden hier ausgewiesen, nicht als Liegenschaftsertrag.

---

## 12. Prüfungsaufgaben mit Musterlösungen

### Prüfungsbeispiel 1: Interne Mietwertverrechnung

**Aufgabe:** Die Bürobedarf AG besitzt eine Liegenschaft. Der Mietwert der selbst genutzten Geschäftsräume beträgt CHF 36'000 pro Jahr. Buchen Sie die interne Mietwertverrechnung.

**Lösung:**
```
Raumaufwand   36'000   /   Liegenschaftsertrag   36'000
```
*Betrieb: Raumaufwand steigt um CHF 36'000. Liegenschaft: Ertrag steigt um CHF 36'000.*

---

### Prüfungsbeispiel 2: Hypothekarzins und Unterhalt

**Aufgabe:** Buchen Sie folgende Liegenschaftsaufwände:
- Hypothekarzins: CHF 18'000
- Malerarbeiten (werterhaltend): CHF 4'200
- Versicherungsprämie: CHF 1'800

**Lösung:**
```
Liegenschaftsaufwand   18'000   /   Bank   18'000   (Hypothekarzins)
Liegenschaftsaufwand    4'200   /   Bank    4'200   (Malerarbeiten)
Liegenschaftsaufwand    1'800   /   Bank    1'800   (Versicherung)
```
*Alle drei Positionen laufen über Liegenschaftsaufwand, da sie werterhaltend und liegenschaftsbezogen sind.*

---

### Prüfungsbeispiel 3: Wertvermehrende Investition

**Aufgabe:** Die Bürobedarf AG baut ein zusätzliches Stockwerk auf ihre Liegenschaft (neue Räume). Kosten: CHF 280'000 (per Kredit).

**Lösung:**
```
Immobilien   280'000   /   Bank / Kreditoren   280'000
```
*Aktivierung, da wertvermehrend. Der Buchwert der Liegenschaft steigt um CHF 280'000.*

---

### Prüfungsbeispiel 4: Abschreibung (linear)

**Aufgabe:** Buchwert der Liegenschaft: CHF 1'185'800. Abschreibungssatz: 2,5 % linear vom Anschaffungswert CHF 1'185'800. Berechnen und buchen Sie die Abschreibung.

**Lösung:**
```
Abschreibung = 1'185'800 × 2,5 % = CHF 29'645

Liegenschaftsaufwand   29'645   /   Immobilien   29'645
```
*Buchwert nach Abschreibung: 1'185'800 − 29'645 = CHF 1'156'155*

---

### Prüfungsbeispiel 5: Kauf einer Liegenschaft

**Aufgabe:** Die Bürobedarf AG kauft eine Liegenschaft:
- Kaufpreis: CHF 1'180'000
- Handänderungskosten (Käuferanteil): CHF 5'800
- Übernommene Hypothek: CHF 900'000
- Heizölvorrat: CHF 3'400
- Vorausbezahlter Mietzins (dem Käufer zugute): CHF 1'100
Buchen Sie alle Schritte und berechnen Sie die Restzahlung.

**Lösung:**

*Restzahlung:*
```
Kaufpreis               1'180'000
+ Heizöl                    3'400
− Hypothek               −900'000
− Mietzins                 −1'100
= Restzahlung           282'300
```

*Buchungssätze:*
```
1. Immobilien 1'180'000 / Verb. L+L 1'180'000
2. Immobilien     5'800 / Bank          5'800
3. Verb. L+L    900'000 / Hypotheken  900'000
4. Liegensch.aufwand 3'400 / Verb. L+L  3'400
5. Verb. L+L      1'100 / Liegensch.ertrag 1'100
6. Verb. L+L    282'300 / Bank         282'300
```

---

### Prüfungsbeispiel 6: Verkauf einer Liegenschaft mit Gewinn

**Aufgabe:** Buchwert der Liegenschaft: CHF 920'000. Verkaufspreis: CHF 1'180'000. Selbe Nebenkonditionen wie beim Kauf (Hypothek 900'000, Heizöl 3'400, Mietzins 1'100). Buchen Sie alle Schritte und berechnen Sie den Verkaufsgewinn.

**Lösung:**

*Verkaufsgewinn:*
```
Verkaufspreis   1'180'000
− Buchwert        −920'000
= Gewinn          260'000
```

*Buchungssätze:*
```
1. Ford. L+L 1'180'000 / Immobilien      1'180'000
2. Hypotheken  900'000 / Ford. L+L         900'000
3. Ford. L+L     3'400 / Liegensch.aufwand   3'400
4. Liegensch.ertrag 1'100 / Ford. L+L        1'100
5. Bank        282'300 / Ford. L+L          282'300
6. Immobilien  260'000 / A.o. Ertrag        260'000
```

---

### Prüfungsbeispiel 7: Renditeberechnung

**Aufgabe:** Kaufpreis CHF 1'180'000, Hypothek CHF 900'000 (Zinssatz 2 %), Mietzinseinnahmen CHF 55'300, Unterhaltskosten CHF 21'500. Berechnen Sie:
a) die eigenen Mittel
b) den Liegenschaftsgewinn
c) die Bruttorendite
d) die Nettorendite
e) den Ertragswert

**Lösung:**

**a) Eigene Mittel:**
```
1'180'000 − 900'000 = CHF 280'000
```

**b) Liegenschaftsgewinn:**
```
Hypothekarzins: 900'000 × 2 % = CHF 18'000
Liegenschaftsgewinn: 55'300 − 18'000 − 21'500 = CHF 15'800
```

**c) Bruttorendite:**
```
55'300 × 100 / 1'180'000 = 4,69 %
```

**d) Nettorendite:**
```
15'800 × 100 / 280'000 = 5,64 %
```

**e) Ertragswert:**
```
55'300 × 100 / 4,69 = CHF 1'179'104.50 ≈ CHF 1'180'000
```

---

### Prüfungsbeispiel 8: Verkaufsverlust

**Aufgabe:** Eine Liegenschaft mit Buchwert CHF 850'000 wird für CHF 780'000 verkauft (kein Hypothekentransfer, keine Nebenkosten). Buchen Sie den Verkauf.

**Lösung:**
```
Verkaufsverlust = 850'000 − 780'000 = CHF 70'000

1. Bank         780'000 / Immobilien   850'000
2. A.o. Aufwand  70'000 /
   (oder direkt: Bank 780'000 + A.o. Aufwand 70'000 / Immobilien 850'000)
```

---

## 13. Häufige Fehler und Verwechslungen

### Fehler 1: Hypothekarzins falsch kontieren
**Falsch:** Hypothekarzins / Finanzaufwand
**Richtig:** Liegenschaftsaufwand / Bank
*Hypothekarzinsen gehören zum Liegenschaftsaufwand, damit der Liegenschaftserfolg vollständig sichtbar ist.*

### Fehler 2: Wertvermehrende Kosten aufwanden
**Falsch:** Liegenschaftsaufwand / Bank (für Erweiterungsbau)
**Richtig:** Immobilien / Bank
*Wertvermehrende Kosten müssen aktiviert werden.*

### Fehler 3: Verkaufsgewinn als Liegenschaftsertrag buchen
**Falsch:** Immobilien / Liegenschaftsertrag
**Richtig:** Immobilien / A.o. Ertrag
*Verkaufsgewinne sind ausserordentlich, da einmalig und nicht betriebsüblich.*

### Fehler 4: Beim Kauf direkt Bank statt Abrechnungskonto
**Falsch:** Immobilien / Bank (für den gesamten Kaufpreis)
**Richtig:** Immobilien / Verbindlichkeiten L+L (Kaufpreis); dann schrittweise Verrechnung aller Positionen
*Das Abrechnungskonto ist zwingend, damit alle Nebenkonditionen sauber verarbeitet werden.*

### Fehler 5: Bruttorendite auf eigene Mittel beziehen
**Falsch:** Bruttorendite = Brutto-Ertrag / Eigene Mittel
**Richtig:** Bruttorendite = Brutto-Ertrag / **Kaufpreis**; Nettorendite = Gewinn / Eigene Mittel

### Fehler 6: Mietwert vergessen
Wenn keine externe Miete bezahlt wird, heisst das nicht, dass kein Mietwert existiert. Selbst genutzte Räume müssen über Raumaufwand / Liegenschaftsertrag intern verrechnet werden.

---

## 14. Verbindungen zu anderen Themen

| Thema | Verbindung |
|---|---|
| **Anlagevermögen** | Liegenschaften sind materielle Anlagewerte; Aktivierung, Abschreibung, Buchwert |
| **Erfolgsrechnung** | Liegenschaftserfolg erscheint als eigenständige Stufe (unter Betriebsgewinn) |
| **Fremdfinanzierung** | Hypotheken = langfristiges Fremdkapital; Zinsen beeinflussen Nettorendite |
| **Abgrenzungen** | Zeitliche Abgrenzung von Mietzinsen und Vorräten beim Eigentumsübergang |
| **Interne Leistungsverrechnung** | Mietwert als interne Verrechnungsgrösse |
| **Steuerrecht** | Werterhaltend sofort abziehbar; wertvermehrend über Abschreibungen |
| **Immobilienbewertung** | Ertragswertverfahren verbindet Buchhaltung und Marktwertschätzung |
| **Investitionsrechnung** | Renditekennzahlen dienen der Investitionsbeurteilung |
| **Unternehmensanalyse** | Trennung von Betriebserfolg und Nebenerfolgen erhöht Aussagekraft |

---

## 15. Kernaussagen für die Prüfung

1. Liegenschaften müssen im Rechnungswesen getrennt vom operativen Kerngeschäft betrachtet werden.
2. Liegenschaftsaufwand und Liegenschaftsertrag sind eigene Erfolgskonten – der Saldo zeigt unmittelbar den Liegenschaftserfolg.
3. Hypothekarzinsen gehören zum **Liegenschaftsaufwand**, nicht zum allgemeinen Finanzaufwand.
4. Werterhaltende Kosten → Liegenschaftsaufwand; wertvermehrende Kosten → Immobilien (aktivieren).
5. Beim Kauf: Abrechnungskonto **Verbindlichkeiten L+L**; beim Verkauf: **Forderungen L+L**.
6. Verkaufsgewinn = Verkaufspreis − Buchwert → ausserordentlicher Ertrag.
7. Bruttorendite = Brutto-Ertrag × 100 / Kaufpreis.
8. Nettorendite = Liegenschaftsgewinn × 100 / Eigene Mittel.
9. Ertragswert = Brutto-Ertrag × 100 / Bruttorendite %.
10. Die Nettorendite kann höher sein als die Bruttorendite (Hebeleffekt durch günstige Fremdfinanzierung).
`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  const result = await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = ANY($2::uuid[])`,
    [SUMMARY, [
      'c79d84e7-0fb3-468f-b9a6-8bf78d55575d',
      'd062d0db-2ab8-4ecc-aa7c-47940d23b8cb',
      '432128e8-3d54-4b8b-b04d-598c08e63639',
      '268c0b2e-24f5-4b8b-a1f7-e2c70ded14c2'
    ]]
  )
  console.log(`Updated ${result.rowCount} immobilien chapters`)
  await client.end()
}

main().catch(console.error)
