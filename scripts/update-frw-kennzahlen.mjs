import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = `# Bilanz- und Erfolgsanalyse (Band 2, Kapitel 11)

## Überblick und Lernziele

Die Bilanz- und Erfolgsanalyse ist das zentrale Instrument zur systematischen Beurteilung der wirtschaftlichen Lage eines Unternehmens. Sie verdichtet die Rohdaten aus Bilanz und Erfolgsrechnung zu aussagekräftigen Kennzahlen und beantwortet betriebswirtschaftliche Kernfragen:

- Ist das Unternehmen liquide genug, um seine Verpflichtungen zu erfüllen?
- Wie hoch ist die Verschuldung — und ist sie tragbar?
- Ist das Anlagevermögen langfristig und solide finanziert?
- Erwirtschaftet das Unternehmen ausreichend Gewinn und Mittelzufluss?
- Wie effizient werden Forderungen und Vorräte bewirtschaftet?

Die Analyse bildet die Grundlage für Kreditentscheide, Investitionsbeurteilungen, Managementsteuerung, Budgetierung und die Einschätzung durch externe Anspruchsgruppen.

---

## 1. Anspruchsgruppen und Informationsinteressen

Die Bilanz- und Erfolgsanalyse richtet sich an unterschiedliche Nutzergruppen mit verschiedenen Schwerpunkten:

**Interne Anspruchsgruppen**
- Geschäftsleitung: Steuerung, Planung, Budgetkontrolle, Investitionsentscheide
- Verwaltungsrat: Überwachung der Unternehmensführung, strategische Beurteilung

**Externe Anspruchsgruppen**
- Banken und Fremdkapitalgeber: Beurteilung von Kreditwürdigkeit, Verschuldung, Liquidität und Rückzahlungsfähigkeit
- Aktionäre und Investoren: Rentabilität, Gewinnentwicklung, Unternehmenswert
- Steuerbehörden und Institutionen: Formelle und materielle Korrektheit des Abschlusses
- Lieferanten und Kunden: Zahlungsfähigkeit und wirtschaftliche Stabilität

**Kernaussage:** Die Analyse ist immer gleichzeitig Informationsverdichtung und Beurteilungsinstrument — je nach Anspruchsgruppe mit unterschiedlichen Schwerpunkten.

---

## 2. Aufbereitung der Abschlusszahlen

Vor der Kennzahlenbildung müssen Bilanz und Erfolgsrechnung strukturiert aufbereitet werden. Rohdaten aus der Buchhaltung sind zwar vollständig, aber für Vergleiche und Berechnungen noch nicht ausreichend verdichtet.

### Wesentliche Aufbereitungsschritte

- **Zusammenfassen** von Einzelkonten zu aussagekräftigen Hauptgruppen (z.B. alle Kasse- und Bankkonten zu «Flüssige Mittel»)
- **Korrekte Behandlung** von Minus-Aktivkonten (z.B. Delkredere, Wertberichtigungen auf Sachanlagen) — diese werden von den betreffenden Aktivpositionen abgezogen, nicht als eigene Position ausgewiesen
- **Offenlegen stiller Reserven** für eine betriebswirtschaftlich realistische Bewertung
- **Ausschluss betriebsfremder, ausserordentlicher und periodenfremder Posten**, wenn die operative Leistungsfähigkeit beurteilt werden soll
- **Standardisierte Gliederung** der Bilanz nach Fristigkeit (Umlauf- vs. Anlagevermögen; kurzfristiges vs. langfristiges Fremdkapital)

### Standardisierte Bilanzgliederung

**Aktiven**
- **Umlaufvermögen**
  - Flüssige Mittel (Kasse, Post, Bank)
  - Forderungen (Debitoren, sonstige kurzfristige Forderungen)
  - Vorräte (Waren, Fertig- und Halbfabrikate, Roh- und Hilfsstoffe)
- **Anlagevermögen**
  - Finanzanlagen (langfristige Wertschriften, Darlehen, Beteiligungen)
  - Mobile Sachanlagen (Maschinen, Fahrzeuge, Mobiliar, IT)
  - Immobile Sachanlagen (Liegenschaften, Grundstücke, Bauten)
  - Immaterielle Anlagen (Patente, Lizenzen, Goodwill)

**Passiven**
- **Kurzfristiges Fremdkapital** (Verbindlichkeiten, kurzfristige Bankschulden, Rückstellungen kurzfristig)
- **Langfristiges Fremdkapital** (langfristige Bankdarlehen, Hypotheken, Obligationenanleihen)
- **Eigenkapital**
  - Grundkapital (Aktienkapital, Stammkapital)
  - Zuwachskapital (gesetzliche Reserven, freiwillige Reserven, Gewinnvortrag, Jahresgewinn)

### Standardisierte Erfolgsrechnung

Für die Rentabilitäts- und Cashflow-Analyse sind besonders relevant:
- **Betriebsertrag** (Nettoerlös aus Lieferungen und Leistungen)
- **Betriebsaufwand** (Material, Personal, Abschreibungen, übriger Aufwand)
- **Reingewinn** (nach Steuern)
- **Abschreibungen** (werden separat ausgewiesen, da für Cashflow-Berechnung benötigt)
- **Fremdkapitalzinsen** (für Gesamtkapitalrendite)

---

## 3. Kapitalstruktur — Wie ist das Unternehmen finanziert?

Die Kapitalstruktur untersucht die Zusammensetzung der Passivseite der Bilanz. Sie zeigt das Verhältnis von Eigenkapital zu Fremdkapital und beantwortet die Frage nach finanzieller Stabilität und Unabhängigkeit.

### Kennzahlen der Kapitalstruktur

| Kennzahl | Formel | Zielgrösse |
|---|---|---|
| **Eigenfinanzierungsgrad** | Eigenkapital × 100 / Gesamtkapital | Mindestens **30 %** |
| **Fremdfinanzierungsgrad** | Fremdkapital × 100 / Gesamtkapital | Höchstens **70 %** |
| **Selbstfinanzierungsgrad** | Zuwachskapital × 100 / Grundkapital | Altersabhängig (steigt mit Unternehmensalter) |

**Wichtig:** Eigenfinanzierungsgrad + Fremdfinanzierungsgrad = immer 100 % (sie ergänzen sich zum Gesamtkapital).

### Detaillierte Formeln

```
Eigenfinanzierungsgrad = Eigenkapital / Gesamtkapital × 100
Fremdfinanzierungsgrad = Fremdkapital / Gesamtkapital × 100
Selbstfinanzierungsgrad = Zuwachskapital / Grundkapital × 100
```

- **Gesamtkapital** = Eigenkapital + Fremdkapital (= Bilanzsumme)
- **Zuwachskapital** = Reserven + Gewinnvortrag + Jahresgewinn (alles oberhalb des Grundkapitals im Eigenkapital)
- **Grundkapital** = Aktienkapital / Stammkapital

### Interpretation und Zielkonflikte

**Hoher Eigenfinanzierungsgrad (gut für Sicherheit):**
- Mehr Puffer bei wirtschaftlichem Rückgang
- Unabhängiger von Fremdkapitalgebern
- Tieferes finanzielles Risiko
- Mehr Vertrauen bei Banken und Lieferanten

**Hoher Fremdfinanzierungsgrad (potenziell gut für Rentabilität):**
- Kann die Eigenkapitalrendite erhöhen (Leverage-Effekt), solange die Gesamtkapitalrendite über den Fremdkapitalkosten liegt
- Erhöht aber das finanzielle Risiko (Zinslast, Abhängigkeit von Gläubigern)

**Selbstfinanzierungsgrad:** Zeigt, wie viel des Eigenkapitals durch zurückbehaltene Gewinne entstanden ist — ein Indikator für organisches Wachstum und Gewinnthesaurierung. Bei einem 6 Jahre alten Unternehmen ist ein Selbstfinanzierungsgrad von 36 % bereits ein gutes Zeichen.

### Fallbeispiel Hummel & Stamm AG — Kapitalstruktur

- Eigenfinanzierungsgrad: **43,27 %** → deutlich über Zielwert 30 %, solide
- Fremdfinanzierungsgrad: **56,73 %** → unter 70 %, nicht übermässig verschuldet
- Selbstfinanzierungsgrad: **36 %** → für ein 6-jähriges Unternehmen gut, zeigt substanzielle Gewinnthesaurierung

---

## 4. Vermögensstruktur — Wie ist das Kapital eingesetzt?

Die Vermögensstruktur untersucht die Aktivseite der Bilanz und zeigt, wie das vorhandene Kapital auf Umlauf- und Anlagevermögen verteilt ist.

### Kennzahlen der Vermögensstruktur

| Kennzahl | Formel | Zielgrösse |
|---|---|---|
| **Intensität des Umlaufvermögens** | Umlaufvermögen × 100 / Gesamtvermögen | Branchenabhängig |
| **Intensität des Anlagevermögens** | Anlagevermögen × 100 / Gesamtvermögen | Branchenabhängig |

**Wichtig:** UV-Intensität + AV-Intensität = immer 100 %.

### Interpretation

Die Vermögensstruktur ist **stark branchenabhängig** und kann nicht losgelöst vom Geschäftsmodell beurteilt werden:

- **Handelsunternehmen:** Tendenziell höherer UV-Anteil (grosse Lager, hohe Forderungen), geringerer AV-Anteil
- **Industriebetriebe / produktionsorientierte Unternehmen:** Tendenziell hoher AV-Anteil (Maschinen, Produktionsanlagen, Liegenschaften)
- **Dienstleistungsunternehmen:** Oft geringerer AV-Anteil (ausser bei Infrastrukturunternehmen)

**Zusammenhang mit anderen Kennzahlen:**
- Hoher AV-Anteil erfordert langfristige Finanzierung (→ Anlagedeckung)
- Hoher UV-Anteil in Vorräten/Forderungen kann Liquidität schwächen (→ Liquidität, Aktivitätskennzahlen)

### Fallbeispiel Hummel & Stamm AG — Vermögensstruktur

- Intensität UV: **27,05 %** → knapp ein Viertel des Vermögens kurzfristig
- Intensität AV: **72,95 %** → fast drei Viertel langfristig gebunden → typisch für anlageintensiven Industriebetrieb mit Maschinenpark

---

## 5. Liquidität — Kann das Unternehmen seine kurzfristigen Schulden bezahlen?

Die Liquiditätsanalyse misst die Fähigkeit, kurzfristige Verpflichtungen fristgerecht zu erfüllen. Es werden drei Liquiditätsgrade unterschieden, die jeweils unterschiedlich streng sind.

### Kennzahlen der Liquidität

| Kennzahl | Formel | Zielgrösse | Englischer Begriff |
|---|---|---|---|
| **Liquiditätsgrad 1** | Flüssige Mittel × 100 / kurzfristiges FK | Mindestens **20 %** | Cash Ratio |
| **Liquiditätsgrad 2** | (Flüssige Mittel + Forderungen) × 100 / kurzfristiges FK | Mindestens **100 %** | Quick Ratio / Acid Test |
| **Liquiditätsgrad 3** | Umlaufvermögen × 100 / kurzfristiges FK | Mindestens **150 %** | Current Ratio |

### Detaillierte Formeln

```
LG 1 = Flüssige Mittel / kurzfristiges Fremdkapital × 100
LG 2 = (Flüssige Mittel + Forderungen) / kurzfristiges Fremdkapital × 100
LG 3 = Umlaufvermögen / kurzfristiges Fremdkapital × 100
```

### Bedeutung der drei Grade

**Liquiditätsgrad 1 (Cash Ratio) — strengste Messung:**
- Berücksichtigt nur sofort verfügbare Mittel (Kasse, Bank, Post)
- Zielwert 20 %: Das Unternehmen sollte mindestens 20 % seiner kurzfristigen Schulden sofort zahlen können
- Sehr konservative Betrachtung — in der Praxis selten problematisch, wenn LG 2 und LG 3 stimmen
- Zu hoher Wert: Unproduktiv brachliegende Liquidität → schadet Rentabilität

**Liquiditätsgrad 2 (Quick Ratio) — wichtigste Kennzahl für viele Unternehmen:**
- Bezieht Forderungen (Debitoren) ein, die innerhalb kurzer Zeit eingehen sollten
- Zielwert 100 %: Die kurzfristigen Schulden sollten vollständig durch liquide Mittel + bald eingehende Forderungen gedeckt sein
- Unterschreitung = Warnsignal: Das Unternehmen müsste im Notfall Vorräte liquidieren
- Bei Unternehmen mit hohem Umsatz auf Kredit besonders aussagekräftig

**Liquiditätsgrad 3 (Current Ratio) — umfassendste, aber gröbste Messung:**
- Bezieht das gesamte Umlaufvermögen ein, also auch Vorräte
- Vorräte sind weniger schnell in Liquidität umwandelbar als Forderungen
- Zielwert 150 %: Grosszügiger Puffer, weil Vorräte nicht sofort liquidierbar sind
- Zu hoher Wert kann auf übermässige Lagerhaltung hinweisen

### Zielkonflikte bei der Liquidität

**Zu wenig Liquidität:** Zahlungsunfähigkeit, Vertrauensverlust bei Gläubigern, Konkursrisiko
**Zu viel Liquidität:** Unproduktiv gebundenes Kapital, tiefere Rendite, Kapital könnte gewinnbringend eingesetzt werden

→ Liquidität und Rentabilität stehen in einem permanenten Spannungsverhältnis.

### Fallbeispiel Hummel & Stamm AG — Liquidität

- LG 1: **20,11 %** → knapp am Zielwert, aber erfüllt
- LG 2: **106,32 %** → über 100 %, kurzfristige Zahlungsbereitschaft ist gegeben
- LG 3: **170,98 %** → deutlich über 150 %, solider Puffer vorhanden

Fazit: Die Hummel & Stamm AG ist ausreichend liquide — alle drei Zielgrössen werden erreicht.

---

## 6. Anlagedeckung — Ist das Anlagevermögen langfristig finanziert?

Die Anlagedeckung prüft, ob das langfristig im Unternehmen gebundene Anlagevermögen auch mit langfristigem Kapital finanziert ist. Dahinter steht die **goldene Bilanzregel**.

### Die goldene Bilanzregel

> **Langfristig gebundenes Vermögen soll mit langfristigem Kapital finanziert werden.**

Begründung: Wenn Anlagevermögen (z.B. Maschinen, Gebäude) mit kurzfristigen Mitteln finanziert wird, können Liquiditätsprobleme entstehen — denn das Anlagevermögen fliesst erst über Jahre durch Abschreibungen zurück, die kurzfristigen Schulden sind aber sofort fällig.

### Kennzahlen der Anlagedeckung

| Kennzahl | Formel | Zielgrösse |
|---|---|---|
| **Anlagedeckungsgrad 1** | Eigenkapital × 100 / Anlagevermögen | Mindestens **75 %** |
| **Anlagedeckungsgrad 2** | (Eigenkapital + langfristiges FK) × 100 / Anlagevermögen | Mindestens **100 %** |

### Detaillierte Formeln

```
AD 1 = Eigenkapital / Anlagevermögen × 100
AD 2 = (Eigenkapital + langfristiges Fremdkapital) / Anlagevermögen × 100
```

### Interpretation

**Anlagedeckungsgrad 1 (strenger):**
- Misst, ob das Anlagevermögen vollständig aus Eigenkapital gedeckt werden könnte
- Zielwert 75 %: In der Praxis ist vollständige EK-Deckung oft nicht realistisch — daher grosszügigerer Richtwert
- Wert unter 75 %: Das Unternehmen finanziert einen grossen Teil seines Anlagevermögens durch Fremdkapital

**Anlagedeckungsgrad 2 (praktisch entscheidender):**
- Prüft, ob das gesamte Anlagevermögen durch langfristiges Kapital (EK + langfristiges FK) finanziert ist
- Zielwert 100 %: Mindestanforderung — das gesamte Anlagevermögen soll langfristig finanziert sein
- Wert unter 100 %: Anlagevermögen wird teilweise kurzfristig finanziert → Verletzung der goldenen Bilanzregel
- Wert über 100 %: Teil des Umlaufvermögens wird aus langfristigen Mitteln finanziert (goldenes Polster)

### Fallbeispiel Hummel & Stamm AG — Anlagedeckung

- AD 1: **59,31 %** → unter 75 %, Eigenkapital deckt Anlagevermögen nicht vollständig
- AD 2: **115,39 %** → deutlich über 100 %, goldene Bilanzregel ist erfüllt

**Gesamtbeurteilung:** Das Unternehmen hält die goldene Bilanzregel ein. Das Anlagevermögen ist vollständig langfristig finanziert. Dass AD 1 unter 75 % liegt, ist kein Problem, solange AD 2 stimmt.

---

## 7. Rentabilität — Erwirtschaftet das Unternehmen ausreichend Gewinn?

Die Rentabilitätsanalyse misst die Ertragskraft eines Unternehmens. Sie zeigt, wie gut das eingesetzte Kapital verzinst wird und wie viel Gewinn pro Umsatzfranken verbleibt.

### Kennzahlen der Rentabilität

| Kennzahl | Formel | Zielgrösse |
|---|---|---|
| **Eigenkapitalrendite** | Reingewinn × 100 / Eigenkapital | Mindestens **8 %** |
| **Gesamtkapitalrendite** | (Reingewinn + FK-Zinsen) × 100 / Gesamtkapital | Mindestens **6 %** |
| **Umsatzrendite** | Reingewinn × 100 / Betriebsertrag | Handel: min. **1,5 %** / Industrie: min. **5 %** |

### Detaillierte Formeln

```
Eigenkapitalrendite = Reingewinn / Eigenkapital × 100

Gesamtkapitalrendite = (Reingewinn + Fremdkapitalzinsen) / Gesamtkapital × 100

Umsatzrendite = Reingewinn / Betriebsertrag × 100
```

### Bedeutung der drei Renditekennzahlen

**Eigenkapitalrendite:**
- Aus Sicht der Eigentümer: Wie gut wird mein eingesetztes Kapital verzinst?
- Vergleichsgrösse: Könnte ich mit dem gleichen Geld woanders mehr verdienen? (Alternativinvestition)
- Zielwert 8 %: Entspricht in etwa einer marktüblichen Mindestrendite
- **Achtung:** Kann durch hohe Fremdfinanzierung künstlich erhöht werden → nie isoliert beurteilen!

**Gesamtkapitalrendite:**
- Misst die Ertragskraft des gesamten eingesetzten Kapitals, unabhängig von der Finanzierungsstruktur
- Bezieht Fremdkapitalzinsen ein, weil diese eine Verzinsung des Fremdkapitals darstellen
- Ermöglicht Vergleiche zwischen unterschiedlich finanzierten Unternehmen
- **Leverage-Effekt:** Wenn Gesamtkapitalrendite > Fremdkapitalkostensatz → Fremdfinanzierung steigert EK-Rendite
- Zielwert 6 %: Niedriger als EK-Rendite, weil FK-Zinsen meist tiefer als EK-Renditeerwartungen

**Umsatzrendite:**
- Zeigt, wie viel Cent Gewinn pro 100 Franken Umsatz bleiben
- Stark branchenabhängig: Handelsunternehmen haben typisch tiefe Margen (1–3 %), Industriebetriebe höhere (5–15 %)
- Geringe Umsatzrendite bei hohem Umsatz kann immer noch eine gute absolute Rentabilität ergeben

### Zielkonflikte bei Rentabilität und Kapitalstruktur

**Der Leverage-Effekt (Hebelwirkung des Fremdkapitals):**
- Wenn ein Unternehmen mit Fremdkapital mehr verdient als die FK-Zinsen kosten, steigt die EK-Rendite
- Beispiel: GK-Rendite 10 %, FK-Zinsen 4 % → Mehrrendite 6 % fliesst zu den Eigentümern → erhöht EK-Rendite
- **Risiko:** Bei wirtschaftlichem Rückgang dreht sich der Effekt um → hohe FK-Kosten drücken EK-Rendite ins Negative

### Fallbeispiel Hummel & Stamm AG — Rentabilität

- Eigenkapitalrendite: **19,22 %** → deutlich über 8 %, sehr gut
- Umsatzrendite: **4,14 %** → eher gut (für Industriebetrieb grenzwertig, aber positiv)
- Gesamtkapitalrendite: positiv, tiefer als EK-Rendite (Leverage-Effekt wirkt)

---

## 8. Cashflow-Analyse — Wie stark ist die Innenfinanzierungskraft?

Die Cashflow-Analyse ergänzt die reine Gewinnbetrachtung um eine liquiditätsnahe Perspektive. Sie zeigt, wie viel Geld das Unternehmen tatsächlich aus seiner Geschäftstätigkeit erwirtschaftet.

### Warum ist Cashflow wichtiger als Gewinn allein?

**Abschreibungen** mindern den Gewinn in der Erfolgsrechnung — sie stellen aber **keine unmittelbaren Geldabflüsse** dar. Das Geld ist bereits früher geflossen (beim Kauf der Anlage). Deshalb ist der Cashflow oft deutlich höher als der Reingewinn und zeigt die reale Finanzkraft besser.

**Vereinfachte Formel (im Schulkontext):**
```
Cashflow = Reingewinn + Abschreibungen
```

(In der Praxis gibt es die direkte und indirekte Methode sowie eine umfassendere Berechnung, aber diese Vereinfachung ist prüfungsrelevant.)

### Kennzahlen der Cashflow-Analyse

| Kennzahl | Formel | Zielgrösse |
|---|---|---|
| **Cashflow** | Reingewinn + Abschreibungen | — (absolut, in CHF) |
| **Cashflow-Marge** | Cashflow × 100 / Betriebsertrag | Branchenabhängig; deutlich > Umsatzrendite |
| **Effektivverschuldung** | Fremdkapital – (Flüssige Mittel + Forderungen) | — (absolut, in CHF) |
| **Verschuldungsfaktor** | Effektivverschuldung / Jahrescashflow | Höchstens **5 Jahre** |

### Detaillierte Formeln

```
Cashflow = Reingewinn + Abschreibungen

Cashflow-Marge = Cashflow / Betriebsertrag × 100

Effektivverschuldung = Fremdkapital – (Flüssige Mittel + Forderungen)

Verschuldungsfaktor = Effektivverschuldung / Jahrescashflow
```

### Bedeutung der Cashflow-Kennzahlen

**Cashflow-Marge:**
- Zeigt den operativ erwirtschafteten Mittelzufluss pro Umsatzfranken
- Sollte immer deutlich höher sein als die Umsatzrendite
- Differenz zwischen Cashflow-Marge und Umsatzrendite = Abschreibungsanteil am Umsatz

**Effektivverschuldung:**
- Misst die Nettoverschuldung: Es werden die sofort verfügbaren Mittel (Kasse, Forderungen) vom Fremdkapital abgezogen
- Logik: Diese Mittel könnten theoretisch sofort zur Schuldenrückzahlung verwendet werden
- Zeigt die «echte» Last des Fremdkapitals

**Verschuldungsfaktor:**
- Beantwortet: «Wie viele Jahre bräuchte das Unternehmen, um seine Nettoverschuldung vollständig aus dem laufenden Cashflow abzubauen?»
- Zielwert max. 5 Jahre: Darüber hinaus gilt die Verschuldung als problematisch hoch
- Verbindet Kapitalstruktur (Verschuldung), Liquidität (sofort verfügbare Mittel) und operative Finanzkraft (Cashflow)

### Fallbeispiel Hummel & Stamm AG — Cashflow

- Cashflow: **CHF 393'000**
- Cashflow-Marge: **8,89 %** (deutlich über Umsatzrendite 4,14 % → korrekt)
- Effektivverschuldung: **CHF 878'000**
- Verschuldungsfaktor: **2,23 Jahre** → weit unter 5, hervorragend

**Interpretation:** Das Unternehmen generiert starken operativen Mittelzufluss und könnte seine Nettoverschuldung rechnerisch in ca. 2 Jahren aus dem laufenden Geschäft abbauen.

---

## 9. Aktivitätskennzahlen — Wie effizient werden Forderungen und Vorräte bewirtschaftet?

Aktivitätskennzahlen verbinden Bilanz und Erfolgsrechnung mit der operativen Geschäftstätigkeit. Sie zeigen, wie schnell Forderungen in Liquidität umgewandelt werden und wie effizient das Lager bewirtschaftet wird.

### Kennzahlen der Aktivität

| Kennzahl | Formel | Zielgrösse |
|---|---|---|
| **Debitorenumschlag** | Kreditverkäufe / Debitorenbestand | Mindestens **8-mal** pro Jahr |
| **Ø Kundenfrist** | 360 Tage / Debitorenumschlag | Weniger als **45 Tage** |
| **Lagerumschlag** | Warenaufwand / Lagerbestand | Branchenabhängig |
| **Ø Lagerdauer** | 360 Tage / Lagerumschlag | Branchenabhängig |

### Detaillierte Formeln

```
Debitorenumschlag = Kreditverkäufe / Debitorenbestand
(in der Praxis oft: Nettoumsatz auf Kredit / durchschnittlicher Debitorenbestand)

Durchschnittliche Kundenfrist = 360 / Debitorenumschlag
(in Tagen)

Lagerumschlag = Warenaufwand (Materialaufwand) / Lagerbestand
(auch: Umsatz zu Einstandspreisen / durchschnittlicher Lagerbestand)

Durchschnittliche Lagerdauer = 360 / Lagerumschlag
(in Tagen)
```

### Bedeutung und Interpretation

**Debitorenumschlag und Kundenfrist:**
- Zeigen, wie schnell Kundenforderungen in Liquidität umgewandelt werden
- Langsamer Umschlag = lange Zahlungsfristen → Liquidität wird gebunden → erhöhter Finanzierungsbedarf
- Schneller Umschlag = kurze Zahlungsfristen → freie Liquidität → weniger Finanzierungsbedarf
- Ziel 8-mal / max. 45 Tage: Entspricht marktüblichen Zahlungskonditionen (30 Tage netto)
- Abweichungen können auf: mangelndes Debitorenmanagement, branchenspezifische Gepflogenheiten oder schlechte Zahlungsmoral der Kunden hinweisen

**Lagerumschlag und Lagerdauer:**
- Messen die Effizienz der Lagerbewirtschaftung und des Einkaufs
- Sehr langer Lagerumschlag (tiefe Umschlagshäufigkeit): Kapital liegt unproduktiv im Lager, Veralterungsrisiko, Liquiditätsbelastung
- Sehr schneller Umschlag: Kann auf just-in-time Produktion oder dünne Lagerbestände hinweisen
- Stark branchenabhängig: Lebensmittel → sehr schnell; Möbel, Maschinen → langsamer

### Auswirkungen auf Liquidität

```
Langsamer Debitoren- oder Lagerumschlag
→ Kapital bleibt länger in Forderungen und Vorräten gebunden
→ Weniger freie Liquidität
→ Verschlechtert Liquiditätsgrade
→ Erhöht Finanzierungsbedarf
→ Kann Rentabilität senken (mehr FK nötig → mehr Zinsaufwand)
```

---

## 10. Gesamtüberblick aller Kennzahlen mit Zielgrössen

Die folgende Tabelle gibt eine vollständige Übersicht aller prüfungsrelevanten Kennzahlen:

### Kapitalstruktur

| Kennzahl | Formel | Zielgrösse | Fallbeispiel H&S |
|---|---|---|---|
| Eigenfinanzierungsgrad | EK / GK × 100 | Min. 30 % | **43,27 %** ✓ |
| Fremdfinanzierungsgrad | FK / GK × 100 | Max. 70 % | **56,73 %** ✓ |
| Selbstfinanzierungsgrad | Zuwachskapital / Grundkapital × 100 | Altersabh. | **36 %** ✓ |

### Vermögensstruktur

| Kennzahl | Formel | Zielgrösse | Fallbeispiel H&S |
|---|---|---|---|
| UV-Intensität | UV / GV × 100 | Branchenabh. | **27,05 %** |
| AV-Intensität | AV / GV × 100 | Branchenabh. | **72,95 %** |

### Liquidität

| Kennzahl | Formel | Zielgrösse | Fallbeispiel H&S |
|---|---|---|---|
| LG 1 (Cash Ratio) | FM / kfr. FK × 100 | Min. 20 % | **20,11 %** ✓ |
| LG 2 (Quick Ratio) | (FM + Ford.) / kfr. FK × 100 | Min. 100 % | **106,32 %** ✓ |
| LG 3 (Current Ratio) | UV / kfr. FK × 100 | Min. 150 % | **170,98 %** ✓ |

### Anlagedeckung

| Kennzahl | Formel | Zielgrösse | Fallbeispiel H&S |
|---|---|---|---|
| AD 1 | EK / AV × 100 | Min. 75 % | **59,31 %** ✗ |
| AD 2 | (EK + lfr. FK) / AV × 100 | Min. 100 % | **115,39 %** ✓ |

### Rentabilität

| Kennzahl | Formel | Zielgrösse | Fallbeispiel H&S |
|---|---|---|---|
| EK-Rendite | Reingewinn / EK × 100 | Min. 8 % | **19,22 %** ✓ |
| GK-Rendite | (Reingewinn + FK-Zinsen) / GK × 100 | Min. 6 % | positiv ✓ |
| Umsatzrendite | Reingewinn / Betriebsertrag × 100 | Ind.: 5 % | **4,14 %** ~ |

### Cashflow

| Kennzahl | Formel | Zielgrösse | Fallbeispiel H&S |
|---|---|---|---|
| Cashflow | Reingewinn + Abschreibungen | — | **CHF 393'000** |
| Cashflow-Marge | CF / Betriebsertrag × 100 | > Umsatzrendite | **8,89 %** ✓ |
| Effektivverschuldung | FK – (FM + Ford.) | — | **CHF 878'000** |
| Verschuldungsfaktor | Effektivverschuldung / CF | Max. 5 Jahre | **2,23 Jahre** ✓ |

### Aktivitätskennzahlen

| Kennzahl | Formel | Zielgrösse |
|---|---|---|
| Debitorenumschlag | Kreditverkäufe / Debitorenbestand | Min. 8-mal |
| Ø Kundenfrist | 360 / Debitorenumschlag | Max. 45 Tage |
| Lagerumschlag | Warenaufwand / Lagerbestand | Branchenabh. |
| Ø Lagerdauer | 360 / Lagerumschlag | Branchenabh. |

**Abkürzungen:** EK = Eigenkapital, FK = Fremdkapital, GK = Gesamtkapital, UV = Umlaufvermögen, AV = Anlagevermögen, FM = Flüssige Mittel, Ford. = Forderungen, kfr. = kurzfristig, lfr. = langfristig, CF = Cashflow, GV = Gesamtvermögen

---

## 11. Fallbeispiel Hummel & Stamm AG — Vollständige Kreditbeurteilung

Das Kapitel arbeitet durchgehend mit dem Beispielunternehmen Hummel & Stamm AG:

**Unternehmensprofil:**
- Gegründet vor 6 Jahren
- 18 Mitarbeitende
- Industriebetrieb (Holzbearbeitung)
- Investitionsprojekt: CNC-Holzbearbeitungsmaschine
- Antrag auf Investitionskredit bei der Bank

**Analytische Logik der Kreditprüfung:**
1. Bilanz und Erfolgsrechnung werden standardisiert dargestellt und bereinigt
2. Alle relevanten Kennzahlen werden berechnet
3. Kennzahlen werden mit Zielgrössen verglichen
4. Bank leitet Kreditentscheid ab
5. Auswirkungen des Kredits auf Bilanz und Kennzahlen werden simuliert

### Auswirkungen eines Investitionskredits (CHF 200'000)

**Auf die Bilanz:**
- Aktivseite: Maschinen / mobile Sachanlagen steigen um CHF 200'000
- Passivseite: Langfristige Bankdarlehen steigen um CHF 200'000
- Bilanzsumme steigt

**Auf die Erfolgsrechnung:**
- Zusätzlicher Zinsaufwand (senkt Reingewinn)
- Zusätzliche Abschreibungen auf der neuen Maschine (senkt Reingewinn, erhöht aber CF weniger stark)

**Auf die Kennzahlen:**
- Eigenfinanzierungsgrad sinkt (wegen höherer Bilanzsumme und tieferem rel. EK-Anteil)
- Fremdfinanzierungsgrad steigt
- AD 2 verändert sich (mehr AV, mehr lfr. FK)
- Rentabilität sinkt kurzfristig (mehr Aufwand)
- Verschuldungsfaktor steigt (mehr Effektivverschuldung)

**Betriebswirtschaftliche Lehre:** Investitionen verbessern die Produktionsbasis und Zukunftsfähigkeit, belasten aber kurzfristig Gewinn, Liquidität und Verschuldung. Die Rentabilität sollte langfristig steigen, wenn die Investition zu höherem Umsatz oder tieferen Kosten führt.

---

## 12. Interne Zusammenhänge und Zielkonflikte

Die Kennzahlen sind nicht isoliert zu interpretieren — sie bilden ein zusammenhängendes System:

### Kapitalstruktur und Rentabilität
- **Leverage-Effekt:** Mehr Fremdkapital → potentiell höhere EK-Rendite (wenn GK-Rendite > FK-Zinsen)
- **Risiko:** Mehr FK → höheres Zinsänderungs- und Ausfallrisiko
- Regel: EK-Rendite immer zusammen mit Verschuldungsgrad lesen

### Vermögensstruktur und Liquidität
- Hoher Vorrats- oder Forderungsbestand bindet Liquidität
- Langsame Debitoren- oder Lagerumschläge schwächen alle drei Liquiditätsgrade

### Vermögensstruktur und Anlagedeckung
- Hohes Anlagevermögen → verlangt hohe langfristige Finanzierung → AD 2 muss stimmen
- Investitionen erhöhen AV → erfordern parallel steigende langfristige Finanzierung

### Liquidität und Rentabilität
- Zu hohe Liquidität: Kapital liegt brach → tiefere Rendite
- Zu tiefe Liquidität: Zahlungsunfähigkeit, Vertrauensverlust → existenzielle Gefahr
- Optimum: Minimale Liquidität, die alle Zielgrössen erfüllt

### Cashflow und Verschuldung
- Hoher Cashflow macht auch höhere Verschuldung tragbar (Verschuldungsfaktor bleibt tief)
- Ohne ausreichenden Cashflow wird selbst moderate Verschuldung problematisch
- Cashflow und Gewinne können sehr unterschiedlich sein (wegen Abschreibungen)

### Aktivitätskennzahlen und Liquidität
- Langer Debitoren- oder Lagerumschlag → Kapital gebunden → Liquiditätsgrade sinken
- Verbesserung der operativen Effizienz (schnellere Zahlung, bessere Lagerbewirtschaftung) verbessert automatisch die Liquidität

---

## 13. Aufbereitung für vertiefte Analyse: Stille Reserven

Für betriebswirtschaftlich aussagekräftigere Analysen (z.B. bei Unternehmensverkauf, professioneller Kreditprüfung) müssen **stille Reserven** offengelegt werden:

**Was sind stille Reserven?**
- Bilanzpositionen, die in der Bilanz **tiefer** ausgewiesen werden als ihr tatsächlicher Wert
- Entstehen z.B. durch: übermässige Abschreibungen, zu tiefe Bewertung von Liegenschaften, zu hohe Rückstellungen
- Stille Reserven erhöhen den wahren Unternehmenswert, sind aber in der normalen Bilanz nicht sichtbar

**Auswirkung auf Kennzahlen:**
- Werden stille Reserven offengelegt, steigt das Eigenkapital
- Eigenfinanzierungsgrad steigt
- Anlagedeckungsgrad verbessert sich
- Rentabilität kann sich verändern (andere Bezugsgrössen)

**Korrekte Behandlung von Minus-Aktivkonten:**
- Delkredere (Wertberichtigung auf Forderungen): wird vom Debitorenbestand abgezogen, nicht separat aufgeführt
- Wertberichtigungen auf Sachanlagen: werden von den jeweiligen Sachanlagen abgezogen

---

## 14. E-Profil — Analyserahmen des Kapitels

Das Kapitel folgt dem sogenannten **E-Profil** der kaufmännischen Grundbildung, das die Bilanz- und Erfolgsanalyse in fünf Hauptbereiche gliedert:

| Bereich | Kernfrage | Kennzahlen |
|---|---|---|
| **Kapitalstruktur** | Wie ist das Unternehmen finanziert? | Eigenfinanzierungsgrad, Fremdfinanzierungsgrad, Selbstfinanzierungsgrad |
| **Vermögensstruktur** | Worin ist das Kapital gebunden? | UV-Intensität, AV-Intensität |
| **Zahlungsbereitschaft** | Können kurzfristige Schulden bezahlt werden? | LG 1, LG 2, LG 3 |
| **Anlagedeckung** | Ist langfristiges Vermögen langfristig finanziert? | AD 1, AD 2 |
| **Rentabilität** | Wirft das Kapital genug ab? | EK-Rendite, GK-Rendite, Umsatzrendite |

Ergänzend: Cashflow-Analyse und Aktivitätskennzahlen (Vertiefung)

---

## 15. Verbindungen zu anderen Themen

Die Bilanz- und Erfolgsanalyse ist eng vernetzt mit anderen betriebswirtschaftlichen Bereichen:

- **Buchhaltung und Jahresabschluss:** Ohne korrekten Jahresabschluss keine verlässliche Analyse
- **Finanzierung:** Kapitalstruktur, Anlagedeckung und Verschuldungsfaktor sind direkte Finanzierungsthemen
- **Investitionsrechnung:** Investitionen beeinflussen AV, Abschreibungen, Zinsen und alle davon abhängigen Kennzahlen
- **Controlling:** Kennzahlen als Steuerungsinstrument für Planung, Budgetierung, Soll-Ist-Vergleiche
- **Kreditprüfung und Bonität:** Banken nutzen genau diese Kennzahlen für Kreditentscheide
- **Debitorenmanagement:** Debitorenumschlag und Kundenfrist direkt relevant für Cash-Management
- **Lagerbewirtschaftung:** Lagerumschlag und Lagerdauer direkt relevant für Einkauf und Logistik

---

## 16. Prüfungsrelevante Fragen und Antworten

**1. Warum reicht eine Rohbilanz für die Analyse nicht aus?**
Einzelne Konten sind noch nicht zu aussagekräftigen Gruppen verdichtet, stille Reserven sind nicht offengelegt, betriebsfremde Einflüsse sind nicht bereinigt.

**2. Warum ergeben Eigenfinanzierungsgrad und Fremdfinanzierungsgrad immer 100 %?**
Weil Gesamtkapital = Eigenkapital + Fremdkapital. EK + FK = 100 % des GK per Definition.

**3. Weshalb kann hoher Fremdfinanzierungsgrad gleichzeitig vorteilhaft und riskant sein?**
Vorteilhaft: Leverage-Effekt erhöht EK-Rendite. Riskant: Höhere Zinslast, Abhängigkeit von Gläubigern, weniger Puffer bei Rückgang.

**4. Warum ist LG 2 oft aussagekräftiger als LG 1?**
LG 1 erfasst nur sofort verfügbare Mittel (sehr streng). LG 2 bezieht Forderungen ein, die bei normalem Geschäftsgang bald eingehen und daher kurzfristig verfügbar sind.

**5. Warum kann LG 3 trotz gutem Wert operative Schwächen verdecken?**
Weil Vorräte enthalten sind, die nicht schnell liquidierbar sein müssen. Überlagerte Vorräte oder schlechte Debitoren verbessern LG 3, schwächen aber LG 1 und LG 2.

**6. Was besagt die goldene Bilanzregel?**
Langfristig gebundenes Vermögen (Anlagevermögen) soll mit langfristigem Kapital (EK + lfr. FK) finanziert werden, um Liquiditätsprobleme zu vermeiden.

**7. Warum darf EK-Rendite nicht isoliert betrachtet werden?**
Weil sie durch hohe Fremdfinanzierung künstlich erhöht werden kann. Ein Unternehmen mit viel FK und wenig EK hat automatisch eine hohe EK-Rendite, selbst bei mässigem Gesamtergebnis.

**8. Warum ist Cashflow oft aussagekräftiger als Reingewinn?**
Abschreibungen mindern den Gewinn, sind aber kein Geldabfluss. Cashflow = Reingewinn + Abschreibungen zeigt, was operativ wirklich an Mitteln ins Unternehmen fliesst.

**9. Was bedeutet ein Verschuldungsfaktor von 2,23 Jahren?**
Das Unternehmen könnte bei konstantem Cashflow seine Nettoverschuldung (Effektivverschuldung) in ca. 2,23 Jahren vollständig aus dem operativen Cashflow abbauen.

**10. Wie beeinflusst ein langsamer Debitorenumschlag die Liquidität?**
Forderungen werden langsamer in Geld umgewandelt → Liquidität bleibt in Forderungen gebunden → LG 1 und LG 2 sinken → höherer Finanzierungsbedarf.

**11. Welche Zielkonflikte bestehen zwischen Sicherheit, Liquidität und Rentabilität?**
- Mehr Liquidität = mehr Sicherheit, aber weniger Rentabilität (Mittel liegen brach)
- Mehr Eigenkapital = mehr Sicherheit, aber unter Umständen tiefere EK-Rendite
- Mehr Fremdkapital = potentiell höhere EK-Rendite, aber weniger Sicherheit

**12. Wie verändern Investitionen auf Kredit die Kennzahlen?**
Bilanzsumme steigt, Fremdfinanzierungsgrad steigt, AD 2 verändert sich, Zinsen und Abschreibungen steigen (→ Gewinn sinkt), Cashflow sinkt weniger stark, Verschuldungsfaktor steigt.

---

## 17. Kernaussagen zum Merken

1. Bilanz- und Erfolgsanalyse verdichtet Jahresabschlusszahlen zu entscheidungsrelevantem Wissen
2. Rohzahlen müssen vor der Analyse strukturiert und bereinigt werden
3. Kapitalstruktur zeigt den Zielkonflikt zwischen Sicherheit und Rentabilität
4. Vermögensstruktur ist nur im Zusammenhang mit Branche und Geschäftsmodell aussagekräftig
5. Liquiditätsgrad 2 (Quick Ratio, mind. 100 %) ist die wichtigste Liquiditätskennzahl
6. Die goldene Bilanzregel fordert: Anlagevermögen langfristig finanzieren (AD 2 mind. 100 %)
7. EK-Rendite nie isoliert betrachten — immer zusammen mit Verschuldungsgrad lesen
8. Cashflow (Reingewinn + Abschreibungen) zeigt reale Innenfinanzierungskraft besser als Gewinn allein
9. Verschuldungsfaktor verbindet Verschuldung, Liquidität und operative Finanzkraft — Ziel max. 5 Jahre
10. Aktivitätskennzahlen verbinden Finanzanalyse mit operativer Praxis (Debitoren-, Lagermanagement)
11. Zielgrössen sind Richtwerte — Branche, Alter und Geschäftsmodell bestimmen die sinnvolle Interpretation
12. Erst die Gesamtschau aller Kennzahlen erlaubt ein belastbares Urteil über ein Unternehmen
`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  const result = await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = $2`,
    [SUMMARY, '068d03b4-c30e-4cf2-97b9-e417048d5469']
  )
  console.log('Updated kennzahlenanalyse chapter, rows affected:', result.rowCount)
  console.log('Summary length:', SUMMARY.length, 'characters')
  await client.end()
}
main().catch(console.error)
