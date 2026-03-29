import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = `# Wertschriften – Umfassende Zusammenfassung (Band 3, Kapitel 5)

## 1. Überblick und Einordnung

Das Kapitel **Wertschriften** behandelt die buchhalterische und wirtschaftliche Behandlung von börsenkotierten Wertpapieren im schweizerischen Rechnungswesen. Im Mittelpunkt stehen **Aktien** und **Obligationen**, die als Liquiditätsreserve im Umlaufvermögen gehalten werden. Das Kapitel verbindet drei Perspektiven: die **Buchführungstechnik** (wie werden Käufe, Verkäufe und Erträge verbucht?), die **Bewertungslehre** (wie werden Wertschriften am Jahresende korrekt bewertet?) und die **finanzwirtschaftliche Interpretation** (wie berechnet man die Rendite einer Anlage?).

Wertschriften dienen in der Praxis als flexible Anlageform für überschüssige Liquidität. Im Gegensatz zu Beteiligungen, die strategischen Charakter haben und im **Anlagevermögen** geführt werden, sind Wertschriften kurzfristig liquidierbar und gehören zum **Umlaufvermögen**.

---

## 2. Grundlagen: Aktien und Obligationen im Vergleich

### 2.1 Was sind Wertschriften?

Wertschriften sind börsenkotierte, grundsätzlich leicht handelbare Wertpapiere des Umlaufvermögens. Dazu gehören insbesondere Aktien und Obligationen, grundsätzlich aber auch Partizipationsscheine, Genussscheine, Pfandbriefe, Anteilscheine von Anlagefonds und Derivate. Im Konto **Wertschriften** werden alle diese Positionen zusammengefasst, sofern sie als Liquiditätsreserve gehalten werden.

**Abgrenzung zu Beteiligungen:**
Nicht alle gehaltenen Wertpapiere gehören in das Konto Wertschriften. Aktien, die aus einer längerfristigen, strategischen Überlegung heraus gehalten werden – z. B. um Einfluss auf ein Unternehmen auszuüben – gelten als **Beteiligungen** und werden im Anlagevermögen geführt. Ab einem Anteil von mindestens 20 % am Aktienkapital liegt gemäss Lehrmittel immer eine Beteiligung vor. Beteiligungen werden über separate Erfolgskonten abgewickelt: **8040 Beteiligungsaufwand** und **8140 Beteiligungsertrag**. Sie sind für die Erfolgsrechnung betriebsfremd.

**Einführungsbeispiel:**
Die Julian Gross AG hält als Liquiditätsreserve 500 börsenkotierte Aktien der Hypo Bank AG sowie eine 1%-Anleihensobligation der Schweizerischen Eidgenossenschaft (Wertschriften, Umlaufvermögen). Zusätzlich hält sie 1000 Aktien der Hela AG aus strategischen Gründen – diese werden als Beteiligung behandelt und nicht im Konto Wertschriften geführt.

### 2.2 Gegenüberstellung: Aktien vs. Obligationen

| Merkmal | Aktien | Obligationen |
|---|---|---|
| Rechtsnatur | Beteiligungspapier des Eigenkapitals | Gläubigerpapier des Fremdkapitals |
| Mitspracherecht | Ja (Stimm- und Wahlrechte) | Nein |
| Kursnotierung | Stückkurs in CHF (pro Aktie) | Prozentkurs auf den Nennwert |
| Laufzeit | Unbefristet | Befristet |
| Ertragsform | Dividende (variabel, vom Geschäftsgang abhängig) | Jahreszins (fest, vereinbart) |
| Kursschwankungen | Meist höher | Meist geringer |
| Gewinnchancen | Grösser | Kleiner |

Diese Unterschiede sind für die Buchungspraxis entscheidend: Aktien und Obligationen haben unterschiedliche Kursberechnungen, unterschiedliche Ertragsarten und unterschiedliche Bewertungslogiken.

---

## 3. Kauf und Verkauf von Aktien

### 3.1 Methode: Gemischte Führung des Wertschriftenkontos

Das Lehrmittel verwendet die **gemischte Führung des Wertschriftenkontos**. Das bedeutet: Bei Kauf und Verkauf wird jeweils der effektive Bankbetrag (Endbetrag der Bankabrechnung) gebucht – nicht nur der reine Kurswert. Dadurch enthält das Konto Wertschriften auch Transaktionskosten (Spesen) und bei Obligationen Marchzinsbestandteile.

Die Konsequenz: Am Jahresende muss der Buchwert durch eine Korrekturbuchung mit dem zulässigen Bilanzwert abgeglichen werden.

### 3.2 Spesen

Unter **Spesen** fasst das Lehrmittel alle Transaktionsnebenkosten zusammen:
- Courtage (Bankprovision)
- Eidgenössische Stempelabgabe
- Börsengebühren

**Grundregel Spesen:**
- Beim **Kauf**: Spesen werden zum Kurswert **addiert** (erhöhen den Kaufpreis)
- Beim **Verkauf**: Spesen werden vom Kurswert **subtrahiert** (vermindern den Erlös)

### 3.3 Formeln und Buchungen: Aktien

**Kauf von Aktien:**

> **Kaufpreis Aktien = Anzahl × Kurs + Spesen**

Buchung: **Wertschriften / Bank** (Betrag = Kaufpreis)

**Verkauf von Aktien:**

> **Verkaufserlös Aktien = Anzahl × Kurs − Spesen**

Buchung: **Bank / Wertschriften** (Betrag = Verkaufserlös)

### 3.4 Buchungsbeispiele: Aktien

**Beispiel 1 – Kauf von Aktien der Goods AG:**
- 200 Aktien
- Kurs: CHF 150 pro Aktie
- Kurswert: 200 × 150 = **CHF 30'000**
- Spesen: **CHF 350**
- Bankbelastung: **CHF 30'350**

| Soll | Haben | Betrag |
|---|---|---|
| Wertschriften | Bank | CHF 30'350 |

**Beispiel 2 – Verkauf von Aktien der Hypo Bank AG:**
- 150 Aktien
- Kurs: CHF 110 pro Aktie
- Kurswert: 150 × 110 = **CHF 16'500**
- Spesen: **CHF 250**
- Bankgutschrift: **CHF 16'250**

| Soll | Haben | Betrag |
|---|---|---|
| Bank | Wertschriften | CHF 16'250 |

---

## 4. Kauf und Verkauf von Obligationen

### 4.1 Der Marchzins – Definition und Bedeutung

Der **Marchzins** (auch: aufgelaufener Zins) ist der Zinsanteil einer Obligation, der seit dem letzten Zinstermin bis zum Kauf- bzw. Verkaufstag aufgelaufen ist.

**Warum gibt es den Marchzins?**
Zinsen auf Obligationen werden jährlich an einem bestimmten **Zinstermin** ausbezahlt. Wer eine Obligation zwischen zwei Zinsterminen kauft, erhält am nächsten Zinstermin den vollen Jahreszins – auch wenn er die Obligation nur einen Teil des Jahres hielt. Der Käufer muss daher dem Verkäufer beim Kauf den bereits aufgelaufenen Zinsanteil vergüten (= Marchzins zahlen). Beim Verkauf gilt die umgekehrte Logik: Der Verkäufer erhält den aufgelaufenen Marchzins vom Käufer.

**Resultat:** Der Marchzins wird sowohl beim Kauf als auch beim Verkauf zum Kurswert **addiert**.

### 4.2 Marchzinsberechnung: Kaufmännische 30/360-Methode

Das Lehrmittel verwendet die **kaufmännische Zinsmethode**:
- Jeder Monat = 30 Tage
- Jedes Jahr = 360 Tage
- Erster Tag der Zinsperiode zählt **nicht**
- Letzter Tag (Kaufdatum / Verkaufsdatum) zählt

> **Marchzins = Nennwert × Zinssatz × Anzahl Tage / (100 × 360)**

**Berechnungsbeispiel (Kauf):**
Obligation Kanton Zürich, Nennwert CHF 15'000, Zinssatz 1.5 %, 180 Tage seit letztem Zinstermin:
> CHF 15'000 × 1.5 × 180 / (100 × 360) = **CHF 112.50**

**Berechnungsbeispiel (Verkauf):**
Bundesobligation, Nennwert CHF 20'000, Zinssatz 1 %, 90 Tage seit letztem Zinstermin:
> CHF 20'000 × 1 × 90 / (100 × 360) = **CHF 50.00**

### 4.3 Formeln und Buchungen: Obligationen

**Kauf von Obligationen:**

> **Kaufpreis Obligationen = Nennwert × Kurs% + Marchzins + Spesen**

Buchung: **Wertschriften / Bank** (Betrag = Kaufpreis)

**Verkauf von Obligationen:**

> **Verkaufserlös Obligationen = Nennwert × Kurs% + Marchzins − Spesen**

Buchung: **Bank / Wertschriften** (Betrag = Verkaufserlös)

### 4.4 Buchungsbeispiele: Obligationen

**Beispiel 3 – Kauf einer Obligation Kanton Zürich:**
- Nennwert: CHF 15'000
- Kurs: 104 %
- Kurswert: CHF 15'000 × 104% = **CHF 15'600**
- Marchzins (180 Tage, 1.5 %): **CHF 112.50**
- Spesen: **CHF 141**
- Bankbelastung: 15'600 + 112.50 + 141 = **CHF 15'853.50**

| Soll | Haben | Betrag |
|---|---|---|
| Wertschriften | Bank | CHF 15'853.50 |

**Beispiel 4 – Verkauf einer Bundesobligation:**
- Nennwert: CHF 20'000
- Kurs: 105 %
- Kurswert: CHF 20'000 × 105% = **CHF 21'000**
- Marchzins (90 Tage, 1 %): **CHF 50**
- Zwischensumme: CHF 21'050
- Spesen: **CHF 189**
- Bankgutschrift: 21'050 − 189 = **CHF 20'861**

| Soll | Haben | Betrag |
|---|---|---|
| Bank | Wertschriften | CHF 20'861 |

---

## 5. Jahresabschluss der Wertschriftenkonten

### 5.1 Grundsatz: Höchstbewertung zum Börsenkurs

Börsenkotierte Wertschriften des Umlaufvermögens dürfen am Bilanzstichtag **höchstens zum Börsenkurs** bewertet werden. Das Inventar per 31.12. zeigt den aktuellen Bestand und den Bilanzwert jeder Position.

### 5.2 Bilanzwert von Aktien

> **Bilanzwert Aktien = Anzahl Aktien × Börsenkurs am Bilanzstichtag**

### 5.3 Bilanzwert von Obligationen

> **Bilanzwert Obligationen = Nennwert × aktueller Kurs% + Marchzins (seit letztem Zinstermin bis 31.12.)**

Der Marchzins wird vereinfachend direkt in den Inventarwert eingerechnet (zeitliche Abgrenzung möglich, aber im Lehrmittel nicht umgesetzt).

### 5.4 Jahresabschluss-Schema (Schritt für Schritt)

**Schritt 1:** Inventarwert aller Wertschriften per 31.12. berechnen
- Jede Aktienposition: Anzahl × Kurs
- Jede Obligationsposition: Nennwert × Kurs% + Marchzins

**Schritt 2:** Gesamten Inventarwert (= neuer Bilanzwert) bestimmen

**Schritt 3:** Inventarwert als Saldo im Haben des Kontos Wertschriften eintragen

**Schritt 4:** Korrekturbuchung vornehmen, um das Konto auszugleichen:
- Inventarwert **höher** als bisheriger Buchwert → **Kursgewinn** → Buchung: **Wertschriften / Finanzertrag**
- Inventarwert **tiefer** als bisheriger Buchwert → **Kursverlust** → Buchung: **Finanzaufwand / Wertschriften**

### 5.5 Buchungsbeispiele: Jahresabschluss

**Inventar per 31.12. (Beispiel aus dem Lehrmittel):**

| Position | Berechnung | Inventarwert |
|---|---|---|
| 200 Aktien Goods AG, Kurs CHF 145 | 200 × 145 | CHF 29'000.00 |
| 350 Aktien Hypo Bank AG, Kurs CHF 101 | 350 × 101 | CHF 35'350.00 |
| Obligation Kt. Zürich, NW CHF 15'000, Kurs 103%, Marchzins CHF 186.90 | 15'000 × 103% + 186.90 | CHF 15'636.90 |
| **Gesamtinventarwert** | | **CHF 79'986.90** |

**Beispiel – Kursgewinn:**
Bisheriger Buchwert Konto Wertschriften: CHF 76'092.50
Inventarwert: CHF 79'986.90
Differenz (Kursgewinn): **CHF 3'894.40**

| Soll | Haben | Betrag |
|---|---|---|
| Wertschriften | Finanzertrag | CHF 3'894.40 |

**Beispiel – Kursverlust (allgemeine Darstellung):**
Falls Inventarwert < bisheriger Buchwert:

| Soll | Haben | Betrag |
|---|---|---|
| Finanzaufwand | Wertschriften | [Differenzbetrag] |

---

## 6. Konten Finanzaufwand und Finanzertrag

### 6.1 Grundregel: Keine Verrechnung

Finanzaufwand und Finanzertrag dürfen **nicht miteinander verrechnet** (saldiert) werden. Sie sind stets auf getrennten Konten zu erfassen.

### 6.2 Was gehört in den Finanzaufwand?

- **Depotgebühren** (Bankgebühren für Depotführung und Verwaltung)
- **Kursverluste** (aus der Jahresabschlusskorrektur)

Buchung Depotgebühren:

| Soll | Haben | Betrag |
|---|---|---|
| Finanzaufwand | Bank | CHF 250 |

Wichtig: Depotgebühren werden **nicht** im Konto Wertschriften aktiviert, sondern direkt als Aufwand verbucht.

### 6.3 Was gehört in den Finanzertrag?

- **Bruttozinsen** (z. B. Zins auf Obligationen)
- **Bruttodividenden** (z. B. Dividende auf Aktien)
- **Kursgewinne** (aus der Jahresabschlusskorrektur)

### 6.4 Hinweis zur Praxis

Im Lehrmittel werden Finanzaufwand und Finanzertrag vereinfacht als betriebliche Finanzkonten behandelt. In der Praxis können sie auch betriebsfremd sein. Beteiligungen sind ausdrücklich als betriebsfremd eingeordnet und werden über separate Konten (Beteiligungsaufwand / Beteiligungsertrag) abgewickelt.

---

## 7. Verrechnungssteuer (VST)

### 7.1 Was ist die Verrechnungssteuer?

Die **Verrechnungssteuer** ist eine Schweizer Quellensteuer von **35 %** auf bestimmte Kapitalerträge (Zinsen aus Obligationen, Dividenden aus Aktien). Sie wird direkt an der Quelle (durch die auszahlende Stelle) einbehalten und an die Eidgenössische Steuerverwaltung (ESTV) abgeführt.

**Folge:** Auf dem Bankkonto des Empfängers werden nur **65 %** des Brutteertrags gutgeschrieben.

### 7.2 Buchhalterische Behandlung

Die Verrechnungssteuer ist **keine Aufwandposition**. Der Anspruch auf Rückerstattung wird als **Forderung gegenüber der Steuerverwaltung** aktiviert, auf dem Konto **Forderung Verrechnungssteuer (Ford. VST)**.

Das Prinzip: Der gesamte **Bruttoertrag** wird als Finanzertrag erfasst, auch wenn netto weniger zufliesst.

**Formeln:**
> **Nettoertrag = Bruttoertrag × 65%**
> **Verrechnungssteuer = Bruttoertrag × 35%**

**Buchungsschema:**

| Soll | Haben | Betrag | Erläuterung |
|---|---|---|---|
| Bank | Finanzertrag | Nettoertrag (65%) | Bankzufluss |
| Ford. VST | Finanzertrag | VST-Anteil (35%) | Steuerforderung |

### 7.3 Buchungsbeispiele: Verrechnungssteuer

**Beispiel 5 – Zinsgutschrift auf Bundesobligation:**
- 1%-Bundesobligation, Nennwert CHF 20'000
- Bruttozins: CHF 20'000 × 1% = **CHF 200**
- Nettozins (65%): **CHF 130**
- Verrechnungssteuer (35%): **CHF 70**

| Soll | Haben | Betrag |
|---|---|---|
| Bank | Finanzertrag | CHF 130 |
| Ford. VST | Finanzertrag | CHF 70 |

**Beispiel 6 – Dividendengutschrift Hypo Bank AG:**
- 350 Aktien, Dividende CHF 2.50 je Aktie
- Bruttodividende: 350 × 2.50 = **CHF 875**
- Nettodividende (65%): **CHF 568.75**
- Verrechnungssteuer (35%): **CHF 306.25**

| Soll | Haben | Betrag |
|---|---|---|
| Bank | Finanzertrag | CHF 568.75 |
| Ford. VST | Finanzertrag | CHF 306.25 |

### 7.4 Rückerstattung der Verrechnungssteuer

Die auf dem Konto Ford. VST aktivierten Forderungen können gegenüber der ESTV geltend gemacht werden. Das Konto wird bei Rückerstattung ausgebucht: **Bank / Ford. VST**.

---

## 8. Gesamtübersicht aller Buchungen im Konto Wertschriften

Nach allen Transaktionen des Beispielunternehmens Julian Gross AG ergibt sich folgendes Bild im Konto Wertschriften:

| Datum | Soll | Haben | Buchungstext |
|---|---|---|---|
| 01.01. | CHF 67'000 | | Anfangsbestand |
| lfd. | CHF 30'350 | | Kauf Aktien Goods AG |
| lfd. | CHF 15'853.50 | | Kauf Obligation Kt. Zürich |
| lfd. | | CHF 16'250 | Verkauf Aktien Hypo Bank AG |
| lfd. | | CHF 20'861 | Verkauf Bundesobligation |
| 31.12. | CHF 3'894.40 | | Kursgewinn (Korrekturbuchung) |
| 31.12. | | CHF 79'986.90 | Inventarwert (Saldo) |

**Finanzaufwand (Konto-Übersicht):**
- Depotgebühren CHF 250

**Finanzertrag (Konto-Übersicht):**
- Nettozins CHF 130
- Ford. VST (Zins) CHF 70
- Nettodividende CHF 568.75
- Ford. VST (Dividende) CHF 306.25
- Kursgewinn CHF 3'894.40

---

## 9. Rendite von Wertschriften

### 9.1 Was ist die Rendite?

Die **Rendite** misst, wie viele Prozent des eingesetzten Kapitals im Durchschnitt pro Jahr als Ertrag erzielt werden. Sie dient dem Vergleich verschiedener Anlageformen.

> **(Jahres-)Rendite = (durchschnittlicher Jahresertrag × 100) / Kapitaleinsatz**

**Wichtig:** Bei Haltedauern, die nicht exakt ein Jahr betragen, muss der Gesamtertrag auf ein Jahr umgerechnet werden, bevor die Rendite berechnet wird.

### 9.2 Rendite von Aktien

**Bestandteile des Ertrags:**
- Dividenden (während der Haltedauer)
- Kursgewinn oder Kursverlust (Verkaufspreis − Kaufpreis)

**Vorgehen:**
1. Alle Dividenden während der Haltedauer addieren
2. Kursgewinn oder Kursverlust bestimmen
3. Gesamtertrag der Haltedauer berechnen
4. Auf Jahresertrag umrechnen (÷ Haltejahre, oder × 12/Haltedauer in Monaten)
5. Jahresertrag × 100 ÷ Kaufpreis = Rendite in %

> **Rendite Aktien = (durchschnittlicher Jahresertrag × 100) / Kaufpreis je Aktie**

**Beispiel 7 – Aktienrendite über 3 Jahre:**
- Kaufpreis: CHF 95 pro Aktie
- 3 × Dividende CHF 2.50 = CHF 7.50
- Aktueller Kurs: CHF 114.50 → Kursgewinn: CHF 19.50
- Gesamtertrag in 3 Jahren: CHF 27.00
- Durchschnittlicher Jahresertrag: CHF 27 ÷ 3 = **CHF 9.00**
- Rendite: 9 × 100 / 95 = **9.47 %**

**Beispiel 8 – Aktienrendite über 9 Monate:**
- Kaufpreis: CHF 150 pro Aktie
- Dividende: CHF 2.00
- Verkauf zu CHF 154 → Kursgewinn: CHF 4.00
- Ertrag in 9 Monaten: CHF 6.00
- Jahresertrag: 6 × 12/9 = **CHF 8.00**
- Rendite: 8 × 100 / 150 = **5.33 %**

### 9.3 Rendite von Obligationen

**Vereinfachung des Lehrmittels:** Berechnungen werden auf Basis eines Nennwerts von **CHF 100** durchgeführt. Dadurch entspricht der Zinssatz in Prozent numerisch direkt dem Bruttojahreszins in Franken.

**Bestandteile des Ertrags:**
- Jahreszins (in CHF, abgeleitet aus dem Nominalzinssatz)
- Kursgewinn oder Kursverlust (auf Jahresbasis umgerechnet)

**Vorgehen:**
1. Jahreszins aus dem Nominalzinssatz ableiten (bei NW 100: Zinssatz% = CHF Zinsen)
2. Gesamten Kursverlust oder Kursgewinn über die Haltedauer bestimmen
3. Kursdifferenz auf ein Jahr umrechnen (÷ Haltedauer in Jahren, oder × 12/Monate)
4. Jahresertrag = Jahreszins ± jährliche Kursdifferenz
5. Jahresertrag × 100 ÷ Kaufkurs = Rendite in %

> **Rendite Obligationen = (Jahreszins ± durchschnittliche jährliche Kursdifferenz) × 100 / Kaufkurs**

**Beispiel 9 – Obligationenrendite über 1 Jahr:**
- 1%-Obligation
- Kaufkurs: 106% → Kapitaleinsatz CHF 106 (pro CHF 100 NW)
- Verkaufskurs: 105.50% → Kursverlust: CHF 0.50
- Jahreszins: CHF 1.00
- Jahresertrag: 1.00 − 0.50 = **CHF 0.50**
- Rendite: 0.50 × 100 / 106 = **0.47 %**

**Beispiel 10 – Obligationenrendite über 42 Monate:**
- 1.5%-Obligation
- Kaufkurs: 104% → Kapitaleinsatz CHF 104
- Rückzahlung bei Laufzeitende zu 100%
- Gesamter Kursverlust: CHF 4.00 in 42 Monaten
- Jährlicher Kursverlust: 4 × 12/42 = **CHF 1.14**
- Jahreszins: CHF 1.50
- Jahresertrag: 1.50 − 1.14 = **CHF 0.36**
- Rendite: 0.36 × 100 / 104 = **0.35 %**

**Erkenntnis:** Eine hohe Nominalverzinsung bedeutet nicht automatisch eine hohe Rendite, wenn der Kaufkurs hoch liegt oder der Kursverlust gross ist.

---

## 10. Zusammenfassung aller Buchungsregeln

### 10.1 Laufende Transaktionen

| Geschäftsfall | Soll | Haben | Betrag-Formel |
|---|---|---|---|
| Kauf Aktien | Wertschriften | Bank | Kurswert + Spesen |
| Verkauf Aktien | Bank | Wertschriften | Kurswert − Spesen |
| Kauf Obligationen | Wertschriften | Bank | Kurswert + Marchzins + Spesen |
| Verkauf Obligationen | Bank | Wertschriften | Kurswert + Marchzins − Spesen |
| Depotgebühren | Finanzaufwand | Bank | Gebührenbetrag |

### 10.2 Jahresabschluss

| Geschäftsfall | Soll | Haben | Betrag-Formel |
|---|---|---|---|
| Kursgewinn (Inventarwert > Buchwert) | Wertschriften | Finanzertrag | Differenz |
| Kursverlust (Inventarwert < Buchwert) | Finanzaufwand | Wertschriften | Differenz |

### 10.3 Erträge mit Verrechnungssteuer

| Buchungsschritt | Soll | Haben | Betrag |
|---|---|---|---|
| Nettogutschrift Bank | Bank | Finanzertrag | 65% des Bruttoertrags |
| VST-Forderung | Ford. VST | Finanzertrag | 35% des Bruttoertrags |

### 10.4 Rückerstattung Verrechnungssteuer

| Geschäftsfall | Soll | Haben | Betrag |
|---|---|---|---|
| Rückerstattung VST | Bank | Ford. VST | VST-Betrag |

---

## 11. Alle Formeln auf einen Blick

| Formel | Anwendung |
|---|---|
| Kaufpreis Aktien = Kurswert + Spesen | Aktienkauf |
| Verkaufserlös Aktien = Kurswert − Spesen | Aktienverkauf |
| Kaufpreis Obligationen = Nennwert × Kurs% + Marchzins + Spesen | Obligationenkauf |
| Verkaufserlös Obligationen = Nennwert × Kurs% + Marchzins − Spesen | Obligationenverkauf |
| Marchzins = Nennwert × Zinssatz × Tage / (100 × 360) | Marchzinsberechnung (30/360) |
| Bilanzwert Aktien = Anzahl × Börsenkurs 31.12. | Jahresabschluss Aktien |
| Bilanzwert Obligationen = Nennwert × Kurs% + Marchzins | Jahresabschluss Obligationen |
| Nettoertrag = Bruttoertrag × 65% | Verrechnungssteuer |
| Verrechnungssteuer = Bruttoertrag × 35% | Verrechnungssteuer |
| Rendite = (Jahresertrag × 100) / Kapitaleinsatz | Renditeberechnung allgemein |
| Jahresertrag Aktien = (Dividenden + Kursgewinn) / Haltedauer in Jahren | Aktienrendite |
| Jahresertrag Obligationen = Jahreszins ± jährliche Kursdifferenz | Obligationenrendite |

---

## 12. Wichtige Begriffe (Glossar)

**Wertschriften:** Börsenkotierte, handelbare Wertpapiere des Umlaufvermögens (Aktien, Obligationen etc.).

**Aktien:** Beteiligungspapiere des Eigenkapitals; Ertrag über Dividende; Kurs in CHF pro Stück notiert.

**Obligationen:** Gläubigerpapiere des Fremdkapitals; fester Zins; Kurs in % des Nennwerts notiert; befristete Laufzeit.

**Beteiligungen:** Strategische Kapitalbeteiligungen im Anlagevermögen (ab 20% des Aktienkapitals immer Beteiligung); eigene Erfolgskonten.

**Kurswert:** Marktwert = Anzahl/Nennwert × aktueller Kurs.

**Nennwert:** Nominalwert einer Obligation; Basis für Prozentkursrechnung und Zinsen.

**Marchzins:** Aufgelaufener Zinsanteil seit letztem Zinstermin; wird beim Kauf UND Verkauf zum Kurswert addiert.

**Spesen:** Transaktionsnebenkosten (Courtage, Stempelabgabe, Börsengebühr); beim Kauf + addiert, beim Verkauf − subtrahiert.

**Bilanzwert / Inventarwert:** Wert der Wertschriften am Bilanzstichtag; Basis für Jahresabschlusskorrektur.

**Kursgewinn:** Wenn Inventarwert > bisheriger Buchwert; Buchung Wertschriften / Finanzertrag.

**Kursverlust:** Wenn Inventarwert < bisheriger Buchwert; Buchung Finanzaufwand / Wertschriften.

**Finanzertrag:** Erfolgskonto für positive Ergebnisse (Bruttozinsen, Bruttodividenden, Kursgewinne).

**Finanzaufwand:** Erfolgskonto für negative Ergebnisse (Depotgebühren, Kursverluste).

**Verrechnungssteuer:** Quellensteuer 35% auf Zinsen und Dividenden in der Schweiz; nur 65% fliessen netto zu.

**Ford. VST:** Forderung Verrechnungssteuer; rückforderbare Quellensteuer; Aktivkonto.

**Bruttoertrag:** Gesamter Zins oder Dividende vor VST-Abzug; wird vollständig als Finanzertrag erfasst.

**Rendite:** Durchschnittlicher Jahresertrag in % des eingesetzten Kapitals; macht verschiedene Anlagen vergleichbar.

**Gemischte Kontoführung:** Im Konto Wertschriften wird der gesamte Bankbetrag (inkl. Spesen, Marchzins) gebucht; Abschlusskorrektur am Jahresende nötig.

---

## 13. Interne Zusammenhänge und Lernlogik

Das Kapitel folgt einer klaren didaktischen Struktur:

1. **Einordnung**: Was sind Wertschriften, was sind Beteiligungen? → Grundlage für alle weiteren Buchungen
2. **Vergleich**: Aktien vs. Obligationen → prägt die unterschiedlichen Buchungsregeln
3. **Laufende Buchungen**: Kauf und Verkauf von Aktien (einfacher) → dann Obligationen (mit Marchzins)
4. **Jahresabschluss**: Inventarwert vs. Buchwert → Kursgewinn oder Kursverlust
5. **Erfolgskonten**: Finanzaufwand und Finanzertrag → alle Ergebnisse fliessen hier zusammen
6. **Steuerlogik**: Verrechnungssteuer → Bruttoertrag vs. Nettobankzufluss
7. **Wirtschaftliche Beurteilung**: Renditeberechnung → Vergleich verschiedener Anlagen

**Zentrale Ursache-Wirkungs-Ketten:**
- Kursänderung → Inventarwert verändert sich → Abschlusskorrektur → Kursgewinn oder Kursverlust in Erfolgsrechnung
- Kauf/Verkauf von Obligationen → Marchzins erhöht den Transaktionsbetrag → gemischte Kontoführung enthält Marchzinsen → Abschlusskorrektur bereinigt
- Bruttoertrag entsteht → VST wird einbehalten → Bank erhält 65%, Ford. VST aktiviert 35% → Finanzertrag zeigt Bruttobetrag

---

## 14. Verbindungen zu anderen Themen

- **Doppelte Buchhaltung**: Alle Buchungen folgen dem System Soll/Haben; Aktiv- und Erfolgskonten werden korrekt angesprochen
- **Jahresabschluss allgemein**: Inventur, Inventar und Abschlussbewertung; stille Reserven durch Abschreibungen
- **Bilanzbewertung**: Höchstbewertungsgrundsatz für Umlaufvermögen; gesetzliche Grundlagen im schweizerischen OR
- **Steuerrecht**: Verrechnungssteuer als Schnittstelle zwischen Buchhaltung und Steuerrecht
- **Finanzwirtschaft und Investitionsvergleich**: Renditeberechnung als Bindeglied zwischen Buchführung und betriebswirtschaftlicher Anlageentscheidung
- **Beteiligungsbuchhaltung**: Abgrenzung von Wertschriften zu Beteiligungen (Anlagevermögen, andere Konten)
- **Forderungen**: Ford. VST als Umlaufvermögensforderung; gleiche Logik wie andere Debitoren
- **Periodengerechtigkeit**: Bruttoertrag wird zum Zeitpunkt der Entstehung erfasst, nicht erst bei Geldzufluss

---

## 15. Prüfungs- und Verständnisfragen

1. Wodurch unterscheiden sich Wertschriften des Umlaufvermögens von Beteiligungen des Anlagevermögens, und warum ist diese Unterscheidung für die Buchführung wesentlich?

2. Warum werden Aktien in Franken pro Stück und Obligationen in Prozent des Nennwerts notiert? Welche Folgen hat das für die Berechnung von Kauf- und Verkaufspreisen?

3. Erkläre die Logik der gemischten Führung des Wertschriftenkontos. Welche Vorteile bietet sie, und weshalb macht sie eine Jahresabschlusskorrektur notwendig?

4. Weshalb werden Spesen beim Kauf von Aktien addiert, beim Verkauf aber subtrahiert?

5. Warum wird der Marchzins beim Kauf **und** beim Verkauf einer Obligation addiert – nicht nur beim Kauf?

6. Erkläre die kaufmännische 30/360-Methode der Marchzinsberechnung. Wie berechnet man den Marchzins für eine 1.5%-Obligation mit NW CHF 15'000 über 180 Tage?

7. Weshalb gehört der Marchzins bei Obligationen auch zum Bilanzwert am Jahresende?

8. Unter welchen Bedingungen entsteht beim Jahresabschluss ein Kursgewinn, und wie lautet die zugehörige Buchung?

9. Unter welchen Bedingungen entsteht ein Kursverlust, und wie lautet die zugehörige Buchung?

10. Warum dürfen Finanzaufwand und Finanzertrag nicht miteinander verrechnet werden?

11. Weshalb werden Depotgebühren nicht im Konto Wertschriften aktiviert, sondern direkt als Finanzaufwand verbucht?

12. Weshalb wird eine Dividende oder ein Zinsertrag brutto als Finanzertrag erfasst, obwohl netto nur 65 % auf dem Bankkonto ankommen?

13. Warum ist die Verrechnungssteuer keine Aufwandposition, sondern eine Forderung?

14. Wie lautet die vollständige Buchung bei einer Dividendengutschrift von CHF 875 brutto? (mit Verrechnungssteuer)

15. Wie hängen Kursgewinn/Kursverlust im Jahresabschluss mit dem Konto Wertschriften und den Erfolgskonten zusammen?

16. Weshalb ist Rendite aussagekräftiger als der absolute Ertrag allein, wenn verschiedene Anlagen verglichen werden sollen?

17. Weshalb kann eine Obligation mit höherem Zinssatz dennoch eine tiefere Rendite aufweisen als eine mit tieferem Zinssatz?

18. Wie verändert sich die Renditeberechnung, wenn die Haltedauer nicht exakt ein Jahr beträgt?

19. Welche Informationen benötigt man mindestens, um die Rendite einer Aktie vollständig zu berechnen?

20. Berechne die Rendite einer Aktie: Kauf zu CHF 95, drei Dividenden à CHF 2.50, aktueller Kurs CHF 114.50.

21. Berechne die Rendite einer Obligation: 1%-Obligation, Kaufkurs 106%, Verkaufskurs 105.50% nach einem Jahr.

22. Berechne die Rendite einer 1.5%-Obligation: Kaufkurs 104%, Rückzahlung zu 100% nach 42 Monaten.

23. Was ist der Unterschied zwischen Nominalzins und Rendite bei Obligationen?

24. Wie berechnet man den Bilanzwert einer Obligationsposition per 31.12.? Was wird zum Kurswert addiert?
`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  console.log('Connected to database')

  const result = await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = ANY($2::uuid[])`,
    [
      SUMMARY,
      [
        'da9a5adf-6183-46a7-a7c0-981614d986ea',
        '3b92006d-2831-4953-92a1-5e85ea8ba299',
        'd231a2b1-b6a6-4a41-8e93-c0b4124cace0'
      ]
    ]
  )

  console.log(`Updated ${result.rowCount} wertschriften chapters`)
  await client.end()
  console.log('Done.')
}

main().catch(console.error)
