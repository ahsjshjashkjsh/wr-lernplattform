import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = `# Die Geldflussrechnung (Band 3, Kapitel 9)

## Überblick und Lernziele

Die **Geldflussrechnung** ist die dritte Jahresrechnung neben Bilanz und Erfolgsrechnung. Sie erklärt, warum und wie sich der Bestand an flüssigen Mitteln eines Unternehmens innerhalb einer Rechnungsperiode verändert hat. Während die Bilanz Vermögen und Schulden an einem Stichtag zeigt und die Erfolgsrechnung den Periodenerfolg misst, beantwortet die Geldflussrechnung eine andere Frage: **Welche Einzahlungen sind eingegangen, und welche Auszahlungen wurden geleistet?**

Nach diesem Kapitel kannst du:
- erklären, warum Gewinn und Liquidität nicht dasselbe sind
- den Geldfluss aus Geschäftstätigkeit direkt und indirekt berechnen
- die vollständige Geldflussrechnung mit allen drei Bereichen aufstellen
- eine Geldflussrechnung interpretieren und den Free Cashflow ableiten

---

## 1. Warum braucht es eine Geldflussrechnung?

### 1.1 Gewinn ist nicht gleich Liquidität

Ein Unternehmen kann in der Erfolgsrechnung einen Gewinn ausweisen und dennoch zahlungsunfähig sein. Das erscheint paradox – ist es aber nicht. Der Grund liegt in der **zeitlichen Entkopplung von Erfolg und Zahlung**:

- Ein Verkauf auf Kredit wird als Ertrag gebucht, aber das Geld fliesst erst später ein.
- Eine Abschreibung mindert den Gewinn, löst aber keine Auszahlung aus.
- Eine Rückstellungsbildung ist Aufwand, ohne dass in der Periode Geld abfliesst.
- Eine Kreditaufnahme bringt Liquidität, ist aber kein Ertrag.

> **Kernaussage:** Die Erfolgsrechnung misst wirtschaftlichen Erfolg. Die Geldflussrechnung misst Zahlungsflüsse. Beides sind wichtige, aber unterschiedliche Perspektiven auf dieselbe wirtschaftliche Realität.

### 1.2 Drei Jahresrechnungen im Zusammenhang

| Rechnung | Perspektive | Zeitbezug | Kernfrage |
|---|---|---|---|
| Bilanz | Vermögen und Schulden | Stichtag | Was besitzt das Unternehmen? |
| Erfolgsrechnung | Aufwand und Ertrag | Periode | Hat das Unternehmen Gewinn erzielt? |
| Geldflussrechnung | Einzahlungen und Auszahlungen | Periode | Wie haben sich die flüssigen Mittel verändert? |

Die drei Rechnungen hängen eng zusammen:
- Der **Reingewinn** aus der Erfolgsrechnung erhöht das Eigenkapital in der Bilanz.
- **Bilanzveränderungen** (Forderungen, Vorräte, Verbindlichkeiten) erklären die Differenz zwischen Erfolg und Zahlung.
- Die Geldflussrechnung schlägt die Brücke zwischen Periodenerfolg und Liquiditätsveränderung.

### 1.3 Was sind flüssige Mittel?

**Flüssige Mittel** umfassen alle sofort verfügbaren Zahlungsmittel: **Kasse, Post und Bank**. Sie bilden die Bezugsgrösse der Geldflussrechnung. Jede Buchung ist liquiditätswirksam, wenn eines dieser Konten betroffen ist.

Beispiele:
- \`Kasse / Warenerlöse\` → Mittelzufluss (liquiditätswirksam)
- \`Personalaufwand / Kasse\` → Mittelabfluss (liquiditätswirksam)
- \`Abschreibungen / Fahrzeuge\` → kein Mittelabfluss (liquiditätsunwirksam)
- \`Rückstellungen / Rückstellungsaufwand\` → kein Mittelabfluss (liquiditätsunwirksam)

---

## 2. Liquiditätswirksam versus liquiditätsunwirksam

Diese Unterscheidung ist das Fundament der Geldflussrechnung.

| Kategorie | Beschreibung | Beispiele |
|---|---|---|
| **Liquiditätswirksam** | Buchung verändert Kasse/Post/Bank | Barverkauf, Lohnzahlung, Maschine kaufen, Dividende auszahlen |
| **Liquiditätsunwirksam** | Buchung verändert Gewinn oder Bilanz, aber kein Zahlungsmittel | Abschreibung, Rückstellungsbildung, Rückstellungsauflösung als Ertrag, Delkrederebildung |

### Typische liquiditätsunwirksame Aufwände (werden in indirekter Methode addiert):
- Abschreibungen auf Sachanlagen, immaterielle Anlagen, Finanzanlagen
- Bildung oder Erhöhung von Rückstellungen
- Wertberichtigungen auf Forderungen (Delkredere)

### Typische liquiditätsunwirksame Erträge (werden in indirekter Methode subtrahiert):
- Auflösung von Rückstellungen
- Buchgewinne aus Veräusserungen von Anlagevermögen (der Mittelzufluss gehört zur Investitionstätigkeit)

---

## 3. Geldfluss aus Geschäftstätigkeit (operativer Cashflow)

Der **Geldfluss aus Geschäftstätigkeit** ist der wichtigste Bereich der Geldflussrechnung. Er zeigt, ob das operative Kerngeschäft selbst Zahlungsmittel generiert – und wie viel. Er ist die wichtigste Quelle der **Innenfinanzierung**.

### 3.1 Direkte Methode

Bei der direkten Methode werden die tatsächlichen Zahlungsströme erfasst: Welche Einzahlungen sind eingegangen, welche Auszahlungen wurden geleistet?

#### Einfaches Barzahlungsmodell (nur Bar-Transaktionen):

\`\`\`
Liquiditätswirksame Erträge (Barverkäufe)
− Liquiditätswirksame Aufwände (Bareinkäufe, Lohn, sonstiger Aufwand, Zinsen)
= Geldfluss aus Geschäftstätigkeit
\`\`\`

#### Beispiel Jeans-Boutique AG (vereinfacht, nur Bargeschäfte):

| Position | Betrag |
|---|---|
| Warenverkaufserlöse (bar) | 2'300 |
| − Warenaufwand (bar) | −1'100 |
| − Personalaufwand | −630 |
| − Übriger Betriebsaufwand (bar) | −185 |
| − Zinsaufwand | −75 |
| **= Geldfluss aus Geschäftstätigkeit** | **310** |

Nicht enthalten: Abschreibungen (−80) und Rückstellungserhöhung (−100), weil diese keine Auszahlung auslösen.

### 3.2 Erweiterte direkte Methode (mit Kreditverkehr und Bestandsänderungen)

In der Praxis erfolgen Verkäufe und Einkäufe oft auf Kredit. Zusätzlich verändern sich die Lagerbestände. Dann muss die direkte Methode die **tatsächlichen Zahlungen** ableiten – nicht einfach die Erträge und Aufwände aus der Erfolgsrechnung übernehmen.

#### Kundenzahlungen berechnen:

\`\`\`
Warenerlöse (Barverkäufe + Kreditverkäufe)
− Zunahme Forderungen L+L  (oder + Abnahme Forderungen L+L)
= Zahlungen von Kunden
\`\`\`

**Logik:** Wenn Forderungen zunehmen, hat das Unternehmen zwar Umsätze gebucht, aber noch nicht alles kassiert. Die tatsächlichen Einzahlungen sind kleiner als der Umsatz.

#### Lieferantenzahlungen berechnen:

\`\`\`
Warenaufwand
− Abnahme Warenvorrat  (oder + Zunahme Warenvorrat)
= Lieferantenrechnungen eingegangen
+ Abnahme Verbindlichkeiten L+L  (oder − Zunahme Verbindlichkeiten L+L)
= Zahlungen an Lieferanten
\`\`\`

**Logik:**
- Wenn der Lagerbestand sinkt, stammt ein Teil des Warenaufwands aus bereits vorhandenem Lager – es wurde weniger eingekauft als verbraucht.
- Wenn die Verbindlichkeiten steigen, wurden Einkäufe auf Rechnung getätigt, aber noch nicht bezahlt.

#### Vollständige direkte Methode (Jeans-Boutique AG, erweitertes Beispiel):

| Position | Betrag |
|---|---|
| Zahlungen von Kunden (2'300 − 20 Zunahme Ford.) | 2'280 |
| − Zahlungen an Lieferanten (1'100 − 60 Abnahme Vorrat − 30 Zunahme Verbindl.) | −1'010 |
| − Personalaufwand | −630 |
| − Übriger Betriebsaufwand (bar) | −185 |
| − Zinsaufwand | −75 |
| **= Geldfluss aus Geschäftstätigkeit** | **380** |

### 3.3 Indirekte Methode

Bei der indirekten Methode wird nicht mit Zahlungsströmen gearbeitet, sondern mit dem **Reingewinn aus der Erfolgsrechnung** – der dann korrigiert wird.

#### Grundschema der indirekten Methode:

\`\`\`
Reingewinn
+ liquiditätsunwirksame Aufwände (z.B. Abschreibungen, Rückstellungserhöhungen)
− liquiditätsunwirksame Erträge (z.B. Rückstellungsauflösungen, Buchgewinne)
− Zunahme Forderungen L+L     (oder + Abnahme)
− Zunahme Vorräte             (oder + Abnahme)
− Zunahme aktive Rechnungsabgrenzungen  (oder + Abnahme)
+ Zunahme Verbindlichkeiten L+L  (oder − Abnahme)
+ Zunahme passive Rechnungsabgrenzungen  (oder − Abnahme)
= Geldfluss aus Geschäftstätigkeit
\`\`\`

#### Beispiel Jeans-Boutique AG (indirekte Methode):

| Position | Betrag |
|---|---|
| Reingewinn | 130 |
| + Abschreibungen | +80 |
| + Erhöhung betriebliche Rückstellungen | +100 |
| − Zunahme Forderungen L+L (95 − 75 = 20) | −20 |
| + Abnahme Warenvorrat (220 − 160 = 60) | +60 |
| + Zunahme Verbindlichkeiten L+L (130 − 100 = 30) | +30 |
| **= Geldfluss aus Geschäftstätigkeit** | **380** |

> **Wichtig:** Direkte und indirekte Methode führen **immer zum gleichen Ergebnis**. Sie sind äquivalente Herleitungen derselben Grösse.

### 3.4 Vorzeichenregel für Bilanzveränderungen (Zusammenfassung)

| Bilanzposition | Zunahme | Abnahme |
|---|---|---|
| Forderungen L+L (Aktiv) | − (senkt Cashflow) | + (erhöht Cashflow) |
| Vorräte / Warenvorrat (Aktiv) | − (senkt Cashflow) | + (erhöht Cashflow) |
| Aktive Rechnungsabgrenzungen (Aktiv) | − (senkt Cashflow) | + (erhöht Cashflow) |
| Verbindlichkeiten L+L (Passiv) | + (erhöht Cashflow) | − (senkt Cashflow) |
| Passive Rechnungsabgrenzungen (Passiv) | + (erhöht Cashflow) | − (senkt Cashflow) |
| Rückstellungen (Passiv) | + (erhöht Cashflow) | − (senkt Cashflow) |

**Merkhilfe:** Aktivkonten und Cashflow bewegen sich **entgegen**gesetzt. Passivkonten und Cashflow bewegen sich **gleich**sinnig.

---

## 4. Geldfluss aus Investitionstätigkeit

Der **Geldfluss aus Investitionstätigkeit** zeigt, ob und in welchem Umfang das Unternehmen in seine langfristige Substanz investiert oder Teile davon veräussert hat.

### Was gehört zur Investitionstätigkeit?

**Mittelabflüsse (negativ):**
- Kauf von Sachanlagen (Maschinen, Fahrzeuge, Gebäude, Einrichtungen)
- Kauf von immateriellen Anlagen
- Kauf von Finanzanlagen und Beteiligungen
- Gewährung langfristiger Darlehen

**Mittelzuflüsse (positiv):**
- Verkauf von Sachanlagen
- Verkauf von Finanzanlagen und Beteiligungen
- Rückzahlung gewährter Darlehen

### Spezialfall: Buchgewinne bei Veräusserung von Anlagevermögen

Wenn Anlagevermögen mit Buchgewinn verkauft wird, erscheint dieser Buchgewinn in der Erfolgsrechnung. Bei der indirekten Methode wird dieser Buchgewinn deshalb **subtrahiert** (liquiditätsunwirksamer Ertrag), weil der **gesamte Verkaufserlös** in der Investitionstätigkeit ausgewiesen wird.

Beispiel:
- Maschine Buchwert 100, Verkaufspreis 130 → Buchgewinn 30
- In Erfolgsrechnung: Buchgewinn 30 als Ertrag
- In Geldflussrechnung: Indirekte Methode −30 (Buchgewinn abziehen), Investitionstätigkeit +130 (gesamter Erlös)

### Beispiel X-Star AG (Investitionstätigkeit):

| Position | Betrag |
|---|---|
| Investitionen in Sachanlagen | −875 |
| Verkauf von Finanzanlagen | +75 |
| − Weitere Investitionen | − |
| **= Geldfluss aus Investitionstätigkeit** | **−800** |

---

## 5. Geldfluss aus Finanzierungstätigkeit

Der **Geldfluss aus Finanzierungstätigkeit** zeigt, wie das Unternehmen mit seinen Kapitalgebern (Eigenkapitalgeber und Fremdkapitalgeber) interagiert.

### Was gehört zur Finanzierungstätigkeit?

**Mittelzuflüsse (positiv) – Aussenfinanzierung:**
- Ausgabe neuer Aktien (Kapitalerhöhung)
- Aufnahme langfristiger Bankdarlehen
- Aufnahme von Hypotheken
- Ausgabe von Obligationen

**Mittelabflüsse (negativ) – Definanzierung:**
- Dividendenausschüttungen an Aktionäre
- Rückzahlung langfristiger Darlehen und Hypotheken
- Rückkauf eigener Aktien

> **Wichtig:** Dividendenausschüttungen gehören zur Finanzierungstätigkeit, nicht zur Geschäftstätigkeit – auch wenn sie in der Erfolgsrechnung eine Rolle spielen.

### Beispiel X-Star AG (Finanzierungstätigkeit):

| Position | Betrag |
|---|---|
| Dividendenausschüttung | −100 |
| Rückzahlung Hypothek | −100 |
| **= Geldfluss aus Finanzierungstätigkeit** | **−200** |

---

## 6. Die vollständige Geldflussrechnung

### 6.1 Aufbau und Abschlusslogik

Die vollständige Geldflussrechnung fasst alle drei Bereiche zusammen und schliesst mit dem **Nachweis der Veränderung der flüssigen Mittel**:

\`\`\`
Geldfluss aus Geschäftstätigkeit
+ Geldfluss aus Investitionstätigkeit
+ Geldfluss aus Finanzierungstätigkeit
= Nettogeldfluss im Geschäftsjahr
+ Flüssige Mittel am 1.1. (Anfangsbestand)
= Flüssige Mittel am 31.12. (Endbestand)
\`\`\`

Der **Endbestand flüssige Mittel** muss mit dem entsprechenden Bilanzwert zum 31.12. übereinstimmen. Das ist die Kontrollgrösse der Geldflussrechnung.

### 6.2 Vollständiges Beispiel X-Star AG

| Bereich | Betrag |
|---|---|
| Geldfluss aus Geschäftstätigkeit | +1'200 |
| Geldfluss aus Investitionstätigkeit | −900 |
| Geldfluss aus Finanzierungstätigkeit | −200 |
| **Nettogeldfluss im Geschäftsjahr** | **+100** |
| Flüssige Mittel 1.1. | 250 |
| **Flüssige Mittel 31.12.** | **350** |

Der Endbestand von 350 muss mit dem Bilanzwert der flüssigen Mittel per 31.12. übereinstimmen – hier ist er 350. Der Nachweis ist erbracht.

---

## 7. Erstellung der vollständigen Geldflussrechnung – Schritt für Schritt

### Schritt 1: Informationsgrundlagen zusammenstellen

Benötigte Unterlagen:
1. **Eröffnungsbilanz** (Anfangsbestände aller Konten)
2. **Schlussbilanz** (Endbestände aller Konten)
3. **Erfolgsrechnung** (Reingewinn, Aufwands- und Ertragsstruktur)
4. **Zusatzangaben** (z.B. Investitionen, Desinvestitionen, Dividenden, Kreditbewegungen)

### Schritt 2: Vorbereitungsarbeiten – Kontenkreuze

Für jedes relevante Bilanzkonto wird ein **Kontenkreuz** erstellt. Es zeigt:
- Anfangsbestand (aus Eröffnungsbilanz)
- Endbestand (aus Schlussbilanz)
- Bekannte Bewegungen (aus Zusatzangaben oder Erfolgsrechnung)
- Fehlende Bewegung (abgeleitet als Differenz → das ist der gesuchte Geldfluss)

**Beispiel Kontenkreuz für Sachanlagen:**

\`\`\`
Sachanlagen
Anfang: 2'000  |  Abschreibungen: 200
Käufe:   875   |  Erlös Verkauf: 75 (Buchwert)
Endbestand: 2'600
\`\`\`

Daraus lässt sich ableiten: Kauf von Sachanlagen = 875 (Mittelabfluss Investitionstätigkeit)

**Beispiel Kontenkreuz für Dividenden (über Eigenkapitalkonto):**
Der Reingewinn erhöht das EK, die Dividendenausschüttung vermindert es. Die Differenz erklärt die Bilanzveränderung des EK.

### Schritt 3: Geldflussrechnung aufstellen

Mit den Ergebnissen aus den Kontenkreuzen und der Erfolgsrechnung werden die drei Bereiche systematisch befüllt:

1. **Operative Geldflüsse** aus Reingewinn + Korrekturen (indirekt) oder direkt aus Zahlungsströmen
2. **Investive Geldflüsse** aus Kontenkreuzen der Anlagekonten
3. **Finanzielle Geldflüsse** aus Kontenkreuzen von Kapitalkonten (EK, langfristige Schulden)

---

## 8. Free Cashflow – Definition und Aussagekraft

### Definition

\`\`\`
Free Cashflow = Geldfluss aus Geschäftstätigkeit + Geldfluss aus Investitionstätigkeit
\`\`\`

Da Investitionstätigkeit typischerweise negativ ist (Mittelabflüsse), entspricht der Free Cashflow dem **operativen Geldfluss nach Abzug der Investitionsauszahlungen**.

### Bedeutung

| Free Cashflow | Interpretation |
|---|---|
| Positiv | Das Unternehmen erwirtschaftet nach Investitionen noch Liquidität. Diese steht für Schuldentilgung, Dividenden oder Liquiditätsaufbau zur Verfügung. |
| Negativ | Die Investitionen übersteigen den operativen Geldfluss. Zusätzliche Aussenfinanzierung oder Liquiditätsreserven werden benötigt. |

### Beispiel X-Star AG:

\`\`\`
Free Cashflow = +1'200 + (−900) = +300
\`\`\`

Nach Investitionen stehen der X-Star AG 300 aus eigener Kraft für Schuldentilgung, Dividenden oder weiteren Liquiditätsaufbau zur Verfügung.

---

## 9. Interpretation der Geldflussrechnung

### 9.1 Typische Muster und ihre Bedeutung

| Muster | Mögliche Interpretation |
|---|---|
| Hoher positiver operativer Geldfluss | Starkes Kerngeschäft, gute Innenfinanzierungskraft |
| Stark negativer Investitionscashflow | Expansionsphase, hohe Investitionen in Zukunftspotenzial |
| Positiver Finanzierungscashflow | Aussenfinanzierung (Kredit oder Kapitalerhöhung) nötig oder strategisch gewählt |
| Negativer Finanzierungscashflow | Schuldentilgung, Dividendenzahlung, Eigenkapitalrückführung |
| Positiver Free Cashflow | Finanzielle Unabhängigkeit nach Investitionen |
| Negativer Free Cashflow | Investitionen übersteigen operativen Geldfluss – externe Finanzierung nötig |

### 9.2 MERO AG: Interpretation eines Zweijahresvergleichs

Die Geldflussrechnung der MERO AG zeigt für zwei Jahre:

| Bereich | Jahr 20.2 | Jahr 20.3 |
|---|---|---|
| Geldfluss aus Geschäftstätigkeit | niedrig | deutlich höher |
| Geldfluss aus Investitionstätigkeit | stark negativ | stark negativ |
| Geldfluss aus Finanzierungstätigkeit | hoher Zufluss | hoher Zufluss |
| Free Cashflow | negativ | negativ |

**Interpretation:**
- Das operative Kerngeschäft verbessert sich (höherer operativer Geldfluss im Jahr 20.3).
- Dennoch reichen die operativen Mittel nicht aus, um die Investitionen zu decken → Free Cashflow bleibt negativ.
- Die Liquidität wird massgeblich durch Aussenfinanzierung gesichert (hoher Finanzierungscashflow).
- Das Unternehmen befindet sich wahrscheinlich in einer Wachstums- oder Aufbauphase.

### 9.3 Was eine Geldflussrechnung nicht zeigt

- Rentabilität und Effizienz (das zeigt die Erfolgsrechnung)
- Vermögensstruktur und Verschuldungsgrad (das zeigt die Bilanz)
- Qualität der Forderungen und Vorräte

---

## 10. Buchungsbeispiele mit Liquiditätszuordnung

### Operative Buchungen (→ Geschäftstätigkeit)

| Buchungssatz | Liquiditätswirkung | Kategorie |
|---|---|---|
| Bank / Warenerlöse | +Zufluss | Geschäftstätigkeit |
| Warenaufwand / Bank | −Abfluss | Geschäftstätigkeit |
| Personalaufwand / Bank | −Abfluss | Geschäftstätigkeit |
| Zinsaufwand / Bank | −Abfluss | Geschäftstätigkeit |
| Abschreibungen / Fahrzeuge | keine | Liquiditätsunwirksam (Korrektur in indirekter Methode) |
| Rückstellungsaufwand / Rückstellungen | keine | Liquiditätsunwirksam (Korrektur in indirekter Methode) |
| Forderungen L+L / Warenerlöse | keine (noch) | Erst bei Zahlung liquiditätswirksam |

### Investive Buchungen (→ Investitionstätigkeit)

| Buchungssatz | Liquiditätswirkung | Kategorie |
|---|---|---|
| Maschinen / Bank | −Abfluss | Investitionstätigkeit |
| Fahrzeuge / Bank | −Abfluss | Investitionstätigkeit |
| Bank / Maschinen (Verkauf) | +Zufluss | Investitionstätigkeit |
| Finanzanlagen / Bank | −Abfluss | Investitionstätigkeit |
| Bank / Finanzanlagen (Verkauf) | +Zufluss | Investitionstätigkeit |

### Finanzierungsbuchungen (→ Finanzierungstätigkeit)

| Buchungssatz | Liquiditätswirkung | Kategorie |
|---|---|---|
| Bank / Aktienkapital | +Zufluss | Finanzierungstätigkeit |
| Bank / Hypothek | +Zufluss | Finanzierungstätigkeit |
| Hypothek / Bank | −Abfluss | Finanzierungstätigkeit |
| Dividenden / Bank | −Abfluss | Finanzierungstätigkeit |
| Langfristige Schulden / Bank (Rückzahlung) | −Abfluss | Finanzierungstätigkeit |

---

## 11. Detaillierte Erklärung der Korrekturgrössen (indirekte Methode)

### Abschreibungen (+)

Abschreibungen mindern den Gewinn (Aufwand), lösen aber **keine Auszahlung** aus. Das Geld für die Anlage wurde bereits beim Kauf ausgegeben (in der Investitionstätigkeit). Deshalb werden Abschreibungen beim Reingewinn wieder **addiert**, um vom buchhalterischen Erfolg zur Liquiditätsgrösse zu gelangen.

\`\`\`
Reingewinn 130
+ Abschreibungen 80  →  Hier wird rückgängig gemacht, dass Abschreibungen den Gewinn gemindert haben
\`\`\`

### Rückstellungserhöhung (+) / Rückstellungsauflösung (−)

Eine **Rückstellungserhöhung** ist Aufwand ohne sofortige Zahlung → addieren.
Eine **Rückstellungsauflösung** ist Ertrag ohne Einzahlung → subtrahieren.

### Zunahme Forderungen L+L (−)

Das Unternehmen hat Umsätze gebucht, aber noch nicht kassiert. Der Gewinn überschätzt die tatsächlichen Einzahlungen. → Korrektur nach unten.

**Formel:** Kundenzahlungen = Umsatz − Zunahme Forderungen

### Abnahme Forderungen L+L (+)

Kunden begleichen alte Rechnungen. Es fliessen mehr Mittel ein, als der aktuelle Umsatz suggeriert. → Korrektur nach oben.

### Zunahme Vorräte (−)

Es wurde mehr eingekauft als verbraucht. Die Auszahlungen an Lieferanten übersteigen den Warenaufwand. → Cashflow sinkt.

### Abnahme Vorräte (+)

Ein Teil des Warenaufwands stammt aus bereits bezahltem Lagerbestand. Die aktuellen Lieferantenzahlungen sind geringer als der Warenaufwand. → Cashflow steigt.

### Zunahme Verbindlichkeiten L+L (+)

Einkäufe erfolgten auf Rechnung, noch nicht bezahlt. Der Aufwand überschätzt die tatsächlichen Auszahlungen. → Korrektur nach oben.

### Abnahme Verbindlichkeiten L+L (−)

Alte Lieferantenrechnungen werden bezahlt. Es fliessen mehr Mittel ab, als der aktuelle Aufwand vermuten lässt. → Korrektur nach unten.

### Aktive Rechnungsabgrenzungen (−/+)

Gleiche Logik wie Forderungen: Zunahme = Mittel wurden bereits ausgezahlt, aber Aufwand noch nicht verbucht → senkt Cashflow. Abnahme = Aufwand wird jetzt verbucht, Zahlung erfolgte früher → erhöht Cashflow.

### Passive Rechnungsabgrenzungen (+/−)

Gleiche Logik wie Verbindlichkeiten: Zunahme = Ertrag verbucht, Zahlung noch nicht erhalten (oder Zahlung erhalten, Aufwand noch nicht verbucht) → erhöht Cashflow temporär.

---

## 12. Kennzahlen und Querbezüge

### Cashflow-Marge

\`\`\`
Cashflow-Marge = Geldfluss aus Geschäftstätigkeit / Nettoumsatz × 100
\`\`\`

Zeigt, wie viel Prozent des Umsatzes als operativer Cashflow verbleiben.

### Innenfinanzierungskraft

Der operative Geldfluss ist das Mass für die Fähigkeit des Unternehmens, seine Liquidität aus eigener Kraft zu stärken, ohne auf Aussenfinanzierung angewiesen zu sein.

### Verbindung zu Liquiditätsgraden

Die Liquiditätsgrade 1–3 (aus der Bilanz) sind Stichtagsgrössen. Die Geldflussrechnung ergänzt diese mit einer **dynamischen** Perspektive: Wie hat sich die Liquidität im Zeitverlauf entwickelt?

---

## 13. Prüfungsrelevante Zusammenfassung

### Die 13 wichtigsten Regeln

1. **Gewinn ≠ Liquidität.** Die Erfolgsrechnung und die Geldflussrechnung messen verschiedene Dinge.
2. **Flüssige Mittel** = Kasse + Post + Bank. Jede Buchung, die diese betrifft, ist liquiditätswirksam.
3. **Abschreibungen** mindern den Gewinn, aber nicht die Liquidität → bei indirekter Methode addieren.
4. **Rückstellungserhöhungen** sind Aufwand ohne Zahlung → bei indirekter Methode addieren.
5. **Zunahme Forderungen** = noch nicht kassiert → Cashflow sinkt.
6. **Abnahme Forderungen** = alte Rechnungen kassiert → Cashflow steigt.
7. **Zunahme Vorräte** = mehr eingekauft als verbraucht → Cashflow sinkt.
8. **Abnahme Vorräte** = aus Lager entnommen, weniger eingekauft → Cashflow steigt.
9. **Zunahme Verbindlichkeiten** = noch nicht bezahlt → Cashflow steigt.
10. **Abnahme Verbindlichkeiten** = alte Rechnungen bezahlt → Cashflow sinkt.
11. **Direkte und indirekte Methode** führen immer zum gleichen Ergebnis.
12. **Investitionen** gehören zur Investitionstätigkeit, nicht zur Geschäftstätigkeit – auch wenn Abschreibungen darauf in der Geschäftstätigkeit korrigiert werden.
13. **Dividenden und Kapitalrückzahlungen** gehören zur Finanzierungstätigkeit.

### Zuordnungsübersicht: Welcher Bereich?

| Vorgang | Bereich |
|---|---|
| Barverkauf von Waren | Geschäftstätigkeit |
| Lohnzahlung | Geschäftstätigkeit |
| Zinszahlung | Geschäftstätigkeit |
| Zahlung von Lieferantenrechnung | Geschäftstätigkeit |
| Kauf einer Maschine | Investitionstätigkeit |
| Verkauf eines Lieferwagens | Investitionstätigkeit |
| Kauf von Aktien einer Beteiligung | Investitionstätigkeit |
| Dividendenausschüttung | Finanzierungstätigkeit |
| Rückzahlung einer Hypothek | Finanzierungstätigkeit |
| Kapitalerhöhung (neue Aktien ausgeben) | Finanzierungstätigkeit |
| Aufnahme eines Bankdarlehens | Finanzierungstätigkeit |
| Abschreibung | Liquiditätsunwirksam (Korrektur in indirekter Methode) |
| Rückstellungserhöhung | Liquiditätsunwirksam (Korrektur in indirekter Methode) |

---

## 14. Prüfungsaufgaben

### Aufgabe 1: Grundverständnis

**a)** Warum reicht die Erfolgsrechnung allein nicht aus, um die finanzielle Lage eines Unternehmens zu beurteilen?

**b)** Welche drei Bereiche umfasst die vollständige Geldflussrechnung?

**c)** Was zeigt der Free Cashflow, und wie wird er berechnet?

---

### Aufgabe 2: Einordnung von Geschäftsvorfällen

Ordne jeden Vorgang dem richtigen Bereich der Geldflussrechnung zu (Geschäftstätigkeit, Investitionstätigkeit, Finanzierungstätigkeit) oder markiere ihn als liquiditätsunwirksam:

| Nr. | Vorgang |
|---|---|
| 1 | Kauf einer CNC-Maschine für 120'000 bar |
| 2 | Dividendenausschüttung per Banküberweisung |
| 3 | Barverkauf von Waren |
| 4 | Abschreibung auf Fahrzeugpark |
| 5 | Rückzahlung einer Hypothek |
| 6 | Erhöhung des Aktienkapitals gegen Bareinlage |
| 7 | Lohnzahlung per Bank |
| 8 | Verkauf eines alten Servers (Buchwert 0, Erlös 500) |
| 9 | Bildung einer Rückstellung für Prozessrisiken |
| 10 | Zinszahlung für kurzfristiges Darlehen |

**Lösungen:**
1. Investitionstätigkeit (Mittelabfluss)
2. Finanzierungstätigkeit (Mittelabfluss)
3. Geschäftstätigkeit (Mittelzufluss)
4. Liquiditätsunwirksam
5. Finanzierungstätigkeit (Mittelabfluss)
6. Finanzierungstätigkeit (Mittelzufluss)
7. Geschäftstätigkeit (Mittelabfluss)
8. Investitionstätigkeit (Mittelzufluss 500)
9. Liquiditätsunwirksam (aber Korrektur +/addieren in indirekter Methode)
10. Geschäftstätigkeit (Mittelabfluss)

---

### Aufgabe 3: Indirekte Methode

Die Müller AG weist folgende Zahlen aus:

| Position | Betrag |
|---|---|
| Reingewinn | 450'000 |
| Abschreibungen | 120'000 |
| Zunahme Forderungen L+L | 35'000 |
| Abnahme Warenvorrat | 15'000 |
| Zunahme Verbindlichkeiten L+L | 25'000 |
| Rückstellungserhöhung | 10'000 |

**Berechne den Geldfluss aus Geschäftstätigkeit (indirekte Methode).**

**Lösung:**

\`\`\`
Reingewinn                                450'000
+ Abschreibungen                         +120'000
+ Rückstellungserhöhung                  + 10'000
− Zunahme Forderungen L+L                − 35'000
+ Abnahme Warenvorrat                    + 15'000
+ Zunahme Verbindlichkeiten L+L          + 25'000
= Geldfluss aus Geschäftstätigkeit       585'000
\`\`\`

---

### Aufgabe 4: Vollständige Geldflussrechnung

Die Schneider AG liefert folgende Angaben:

**Indirekte Methode Geschäftstätigkeit:**
- Reingewinn: 300'000
- Abschreibungen: 80'000
- Zunahme Forderungen: −20'000
- Abnahme Vorräte: +10'000
- Zunahme Verbindlichkeiten: +15'000

**Investitionstätigkeit:**
- Kauf von Sachanlagen: −250'000
- Verkauf einer Beteiligung: +50'000

**Finanzierungstätigkeit:**
- Dividendenausschüttung: −100'000
- Aufnahme Hypothek: +200'000

**Flüssige Mittel 1.1.:** 80'000

**Stelle die vollständige Geldflussrechnung auf.**

**Lösung:**

| Bereich | Betrag |
|---|---|
| Geldfluss aus Geschäftstätigkeit | +385'000 |
| Geldfluss aus Investitionstätigkeit | −200'000 |
| Geldfluss aus Finanzierungstätigkeit | +100'000 |
| **Nettogeldfluss** | **+285'000** |
| Flüssige Mittel 1.1. | 80'000 |
| **Flüssige Mittel 31.12.** | **365'000** |

Free Cashflow = +385'000 + (−200'000) = **+185'000**

---

### Aufgabe 5: Verständnisfragen (Kurzantworten)

**F1:** Warum wird eine Abschreibung in der indirekten Methode zum Reingewinn addiert?

**A1:** Abschreibungen sind ein Aufwand, der den Reingewinn mindert, aber zu keiner Auszahlung führt. Um vom buchhalterischen Gewinn zur tatsächlichen Liquiditätsgrösse zu gelangen, muss dieser nicht zahlungswirksame Aufwand wieder zurückgerechnet werden.

---

**F2:** Das Unternehmen hat Forderungen von 100'000 abgebaut (Forderungen von 150'000 auf 50'000 gesunken). Wie wirkt das auf den operativen Geldfluss?

**A2:** Die Abnahme der Forderungen um 100'000 wirkt sich **positiv** aus (+100'000). Kunden haben alte Rechnungen bezahlt – das Unternehmen hat mehr Mittel erhalten, als der aktuelle Umsatz suggeriert.

---

**F3:** Ein Unternehmen zeigt einen Reingewinn von 500'000 und einen Geldfluss aus Geschäftstätigkeit von nur 200'000. Welche möglichen Erklärungen gibt es?

**A3:** Mögliche Erklärungen:
- Starke Zunahme von Forderungen (Umsätze gebucht, aber nicht kassiert)
- Starke Zunahme von Vorräten (viel eingekauft, aber nicht verbraucht)
- Abbau von Verbindlichkeiten (alte Lieferantenrechnungen bezahlt)
- Hohe nicht zahlungswirksame Erträge (z.B. Rückstellungsauflösungen)

---

**F4:** Was bedeutet ein negativer Free Cashflow?

**A4:** Ein negativer Free Cashflow bedeutet, dass die Investitionsauszahlungen den operativen Geldfluss übersteigen. Das Unternehmen kann seine Investitionen nicht vollständig aus eigenerwirtschafteten Mitteln finanzieren und ist auf Aussenfinanzierung (Kredit, Kapitalerhöhung) oder Liquiditätsreserven angewiesen. Das ist nicht zwingend negativ – oft ist es Ausdruck einer Wachstumsstrategie.

---

**F5:** Weshalb gehört die Dividendenausschüttung zur Finanzierungstätigkeit und nicht zur Geschäftstätigkeit?

**A5:** Dividenden sind eine Rückführung von Kapital an die Eigenkapitalgeber – sie stehen im Zusammenhang mit der Kapitalstruktur des Unternehmens, nicht mit dem operativen Kerngeschäft. Die Finanzierungstätigkeit erfasst alle Mittelflüsse zwischen dem Unternehmen und seinen Kapitalgebern (Eigen- und Fremdkapital).

---

## 15. Glossar der wichtigsten Begriffe

| Begriff | Definition |
|---|---|
| **Geldflussrechnung** | Jahresrechnung, die die Veränderung der flüssigen Mittel während einer Periode erklärt |
| **Flüssige Mittel** | Sofort verfügbare Zahlungsmittel (Kasse, Post, Bank) |
| **Liquidität** | Fähigkeit, fällige Zahlungsverpflichtungen rechtzeitig zu erfüllen |
| **Cashflow** | Geldfluss aus Geschäftstätigkeit; misst selbst erwirtschaftete operative Liquidität |
| **Free Cashflow** | Geldfluss aus Geschäftstätigkeit + Geldfluss aus Investitionstätigkeit |
| **Direkte Methode** | Ermittlung des Cashflows über tatsächliche Zahlungsströme |
| **Indirekte Methode** | Ermittlung des Cashflows durch Korrektur des Reingewinns |
| **Liquiditätswirksam** | Buchung verändert Kasse/Post/Bank |
| **Liquiditätsunwirksam** | Buchung verändert Gewinn oder Bilanz, aber kein Zahlungsmittel |
| **Innenfinanzierung** | Finanzierung aus selbst erwirtschafteten Mitteln (operativer Geldfluss) |
| **Aussenfinanzierung** | Zuführung von Mitteln durch Eigen- oder Fremdkapitalgeber |
| **Definanzierung** | Abfluss an Kapitalgeber (Dividenden, Kreditrückzahlung) |
| **Investitionstätigkeit** | Geldflüsse aus Kauf/Verkauf von Anlagevermögen und Beteiligungen |
| **Finanzierungstätigkeit** | Geldflüsse aus Kapitalbeschaffung und -rückzahlung |
| **Nettoumlaufvermögen** | Forderungen + Vorräte − Verbindlichkeiten (Working Capital) |
| **Kontenkreuz** | Hilfsmittel zur Herleitung von Geldflüssen aus Bilanzkonten |
`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  console.log('Connected to database')

  const result = await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = ANY($2::uuid[])`,
    [SUMMARY, ['e7154f93-4d94-453c-83ac-1d4eaa6be48b', '3eaed969-3269-4b7c-b0f3-441e453ec796']]
  )

  console.log(`Updated ${result.rowCount} chapter(s) for geldflussrechnung`)
  await client.end()
  console.log('Done.')
}

main().catch(console.error)
