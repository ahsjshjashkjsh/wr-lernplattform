import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = `# Betriebsabrechnung, Kalkulation, Deckungsbeitrag und Nutzschwelle

## Überblick und Lernziele

Dieses Kapitel behandelt zwei eng zusammenhängende Gebiete der **internen Unternehmensrechnung** (Betriebsbuchhaltung, Bebu):

1. **Betriebsabrechnung und Kalkulation im Produktionsbetrieb** – wie aus den Zahlen der Finanzbuchhaltung betriebswirtschaftlich brauchbare Kosteninformationen gewonnen und auf Produkte verrechnet werden.
2. **Deckungsbeitrag und Nutzschwelle (Break-even)** – wie Kosten in fixe und variable Bestandteile zerlegt werden und daraus Gewinnschwellen berechnet und grafisch dargestellt werden.

**Warum das wichtig ist:**
- Die Finanzbuchhaltung (Fibu) zeigt das Gesamtergebnis, aber nicht präzise, **wo** Kosten entstehen und **welches Produkt** welchen Beitrag leistet.
- Die Betriebsabrechnung schafft Grundlagen für **Führung, Kalkulation, Kontrolle und Entscheidungen**.
- Die Deckungsbeitragsrechnung macht sichtbar, **ab welcher Menge Gewinn entsteht** und wie empfindlich ein Unternehmen auf Änderungen reagiert.

---

## Teil 1: Betriebsabrechnung (BAB) und Kalkulation

### 1.1 Von der Finanzbuchhaltung zur Betriebsbuchhaltung

Die **Erfolgsrechnung der Finanzbuchhaltung** zeigt Aufwände, Erträge und das Gesamtergebnis. Für das Management reicht sie allein nicht aus, weil sie:
- stille Reserven enthalten kann, die den Aufwand verfälschen,
- ausserordentliche oder betriebsfremde Aufwände enthält,
- kalkulatorische Kosten weglassen kann,
- Kosten nicht nach Abteilungen oder Produkten trennt.

**Lösung:** Der **Betriebsabrechnungsbogen (BAB)** überbrückt diese Lücke. Er besteht aus drei logisch aufeinander aufbauenden Teilrechnungen:

| Teilrechnung | Frage | Zweck |
|---|---|---|
| **Kostenartenrechnung** | Welche Kosten liegen vor? | Fibu-Aufwand bereinigen zu betriebsnotwendigen Kosten |
| **Kostenstellenrechnung** | Wo sind die Kosten angefallen? | Gemeinkosten auf Abteilungen (Orte) verteilen |
| **Kostenträgerrechnung** | Welches Produkt trägt die Kosten? | Kosten und Erlöse produktbezogen zuordnen |

---

### 1.2 Kostenartenrechnung – Sachliche Abgrenzung

Die **Kostenartenrechnung** überführt den Aufwand der Fibu in Kosten der Bebu. Dies geschieht durch **sachliche Abgrenzungen**.

**Grundformel:**
\`\`\`
Aufwand (Fibu)  +/-  sachliche Abgrenzung  =  Kosten (Bebu)
\`\`\`

**Merke:** Nicht jeder Aufwand ist Kosten – und nicht alle Kosten erscheinen unverändert als Aufwand.

**Typische sachliche Abgrenzungen:**

| Situation in der Fibu | Wirkung auf die Bebu-Kosten |
|---|---|
| Auflösung stiller Reserven (Aufwand zu tief) | Kosten in der Bebu **höher** |
| Bildung stiller Reserven (Aufwand zu hoch) | Kosten in der Bebu **tiefer** |
| Überhöhte Abschreibungen in der Fibu | Kosten in der Bebu **tiefer** |
| Betriebsfremde oder ausserordentliche Aufwände | **Nicht** in Kosten übernehmen |
| Zusätzliche kalkulatorische Kosten (fehlen in Fibu) | In der Bebu **ergänzen** |

**Beispiel Sonderegger Fensterläden AG:**
- Einzelmaterial Fibu: +20 wegen Auflösung stiller Reserven → Bebu-Kosten höher
- Abschreibungen Fibu: -35 wegen überhöhter Fibu-Abschreibung → Bebu-Kosten tiefer
- Betriebserfolg Bebu: **112** | Betriebserfolg Fibu: **97** | Unternehmenserfolg: **45**

---

### 1.3 Kostenstellenrechnung – Kosten nach Abteilung

In der **Kostenstellenrechnung** werden Gemeinkosten den Unternehmensbereichen (Kostenstellen) zugeordnet. Die Zuordnung soll möglichst **verursachungsgerecht** erfolgen.

**Kostenstellen im Produktionsbetrieb (Beispiel):**
- Einkauf und Lager
- Fertigung 1
- Fertigung 2
- Verwaltung und Vertrieb

**Verteilungsschlüssel – Überblick:**

| Gemeinkostenart | Typischer Verteilungsschlüssel |
|---|---|
| Hilfsmaterial | Materialverbrauch je Stelle |
| Hilfslöhne | Arbeitspensen (%) |
| Raumkosten | Beanspruchte Fläche (m²) |
| Fahrzeugkosten | Gefahrene Kilometer |
| Energiekosten | Stromverbrauch (kWh) |
| Abschreibungen | Anschaffungs- oder Buchwerte |
| Kapitalkosten | Investiertes Kapital |
| Unterhalt/Reparaturen | Schätzung oder vereinfachte Zuordnung |

**Prinzip:** Die Kostenstelle mit dem grössten Bedarf an einer Ressource trägt auch den grössten Anteil an deren Kosten.

---

### 1.4 Einzelkosten und Gemeinkosten

| Begriff | Definition | Beispiele | Behandlung |
|---|---|---|---|
| **Einzelkosten** | Einem Produkt **direkt** zurechenbar | Einzelmaterial, Einzellöhne | Direkte Zuordnung zum Kostenträger |
| **Gemeinkosten** | Einem Produkt **nicht direkt** zurechenbar | Miete, Abschreibungen, Verwaltung | Über Kostenstellen und Zuschlagssätze |

---

### 1.5 Kostenträgerrechnung – Zuschlagssätze und Umlage

Nachdem Gemeinkosten den Kostenstellen zugeordnet wurden, werden sie über **Zuschlagssätze** auf die Produkte umgelegt.

**Formeln der vier Zuschlagssätze:**

\`\`\`
MGK-Satz (%)  =  Materialgemeinkosten × 100  /  Einzelmaterialkosten

FGK 1-Satz (%)  =  Fertigungsgemeinkosten 1 × 100  /  Einzellohnkosten

FGK 2-Satz (CHF/h)  =  Fertigungsgemeinkosten 2  /  Maschinenstunden

VVGK-Satz (%)  =  Verwaltungs- und Vertriebs-GK × 100  /  Herstellkosten der verkauften Produkte
\`\`\`

**Beispielwerte Sonderegger Fensterläden AG:**

| Zuschlagssatz | Bezugsgrösse | Wert |
|---|---|---|
| MGK | Einzelmaterialkosten | **30 %** |
| FGK 1 | Einzellöhne | **34 %** |
| FGK 2 | Maschinenstunden | **CHF 74.50 / h** |
| VVGK | Herstellkosten (verkauft) | **11.56 %** |

Berechnung der Sätze:
\`\`\`
MGK-Satz  = 420'000 × 100 / 1'400'000  = 30 %
FGK 1-Satz = [FGK 1-Total] × 100 / Einzellöhne  = 34 %
FGK 2-Satz = [FGK 2-Total] / Maschinenstunden  = CHF 74.50 / h
VVGK-Satz  = 720'000 × 100 / 6'228'000  = 11.56 %
\`\`\`

---

### 1.6 Bestandesänderungen bei Halb- und Fertigfabrikaten

In Produktionsbetrieben fallen Kosten für Güter an, auch wenn diese noch nicht verkauft wurden. Lagerveränderungen müssen deshalb berücksichtigt werden.

**Regeln:**
- Lagerzunahme (mehr produziert als verkauft) → Kosten **abziehen**
- Lagerabnahme (mehr verkauft als produziert) → Kosten **hinzuzählen**

\`\`\`
HK produzierte Fabrikate  -  Bestandeszunahme  =  HK verkaufte Fabrikate
HK produzierte Fabrikate  +  Bestandesabnahme  =  HK verkaufte Fabrikate
\`\`\`

**Logik:** Die Kostenträgerrechnung soll nur die Kosten der tatsächlich **verkauften** Produkte erfassen.

---

### 1.7 Kalkulation im Produktionsbetrieb

Auf Basis der ermittelten Zuschlagssätze kann für jedes Produkt ein Angebotspreis (Nettoerlös) kalkuliert werden.

**Kalkulationsschema:**

\`\`\`
Einzelmaterial
+ Materialgemeinkosten (MGK-Satz × Einzelmaterial)
= Materialkosten

Einzellöhne
+ Fertigungsgemeinkosten 1 (FGK 1-Satz × Einzellöhne)
+ Fertigungsgemeinkosten 2 (FGK 2-Satz × Maschinenstunden)
= Fertigungskosten

Materialkosten
+ Fertigungskosten
= Herstellkosten (produzierte Fabrikate)

Herstellkosten (verkaufte Fabrikate)
+ Verwaltungs- und Vertriebsgemeinkosten (VVGK-Satz × HK verkauft)
= Selbstkosten

Selbstkosten
+ Reingewinn (z. B. 10 % der Selbstkosten)
= Nettoerlös (Angebotspreis)
\`\`\`

**Konkretes Beispiel: Aluminium-Fensterladen (2 Stück)**

| Position | Berechnung | Betrag |
|---|---|---|
| Einzelmaterial | gegeben | CHF 90.00 |
| + MGK (30 %) | 90.00 × 30 % | CHF 27.00 |
| **= Materialkosten** | | **CHF 117.00** |
| Einzellöhne | 1.25 h × CHF 80.00 | CHF 100.00 |
| + FGK 1 (34 %) | 100.00 × 34 % | CHF 34.00 |
| + FGK 2 | 1 h × CHF 74.50 | CHF 74.50 |
| **= Fertigungskosten** | | **CHF 208.50** |
| **= Herstellkosten** | 117.00 + 208.50 | **CHF 325.50** |
| + VVGK (11.56 %) | 325.50 × 11.56 % | CHF 37.65 |
| **= Selbstkosten** | | **CHF 363.15** |
| + Reingewinn (10 %) | 363.15 × 10 % | CHF 36.30 |
| **= Nettoerlös** | | **CHF 399.45** |

---

### 1.8 Ergebnisüberleitung: Bebu → Fibu

Das Ergebnis der Betriebsbuchhaltung lässt sich systematisch mit dem Ergebnis der Finanzbuchhaltung verknüpfen.

\`\`\`
Betriebserfolg gemäss Bebu
+/- sachliche Abgrenzungen (mit umgekehrten Vorzeichen)
= Betriebserfolg gemäss Fibu
+/- ausserordentlicher Erfolg
+/- betriebsfremder Erfolg
- direkte Steuern
= Unternehmenserfolg gemäss Fibu
\`\`\`

**Beispiel Sonderegger Fensterläden AG:**

| Position | Betrag |
|---|---|
| Betriebserfolg Bebu | +112 |
| Sachliche Abgrenzung Einzelmaterial | -20 |
| Sachliche Abgrenzung Abschreibungen | +35 |
| **= Betriebserfolg Fibu** | **97** |
| Ausserordentlicher Aufwand | -38 |
| Direkte Steuern | -14 |
| **= Unternehmenserfolg Fibu** | **45** |

---

### 1.9 Produktergebnisse und Interpretation

Die Kostenträgerrechnung zeigt je Produktgruppe: Erlöse, Herstellkosten, Selbstkosten, Gewinn oder Verlust.

**Beispiel Sonderegger Fensterläden AG:**

| Produktgruppe | Ergebnis |
|---|---|
| Fensterläden Holz | **Gewinn +160** |
| Fensterläden Aluminium | **Verlust -48** |
| Betriebserfolg Bebu total | **+112** |

**Wichtige Interpretationsregel:**
Ein negativer Produkterfolg bedeutet **nicht automatisch**, dass das Produkt eingestellt werden soll. Entscheidend ist, ob das Produkt zumindest einen positiven **Deckungsbeitrag** zur Deckung der Gemeinkosten leistet. Wird es eingestellt, werden die Gemeinkosten nur auf die verbleibenden Produkte verlagert.

---

## Teil 2: Deckungsbeitragsrechnung und Nutzschwelle

### 2.1 Vollkostenrechnung vs. Teilkostenrechnung

| Merkmal | Vollkostenrechnung | Teilkostenrechnung |
|---|---|---|
| Kostenbehandlung | Alle Kosten (Einzel + Gemeinkosten) | Nur variable Kosten direkt zugeordnet |
| Kostentrennung | Einzelkosten / Gemeinkosten | Fixe / variable Kosten |
| Kennzahl | Selbstkosten, Gewinn/Verlust | Deckungsbeitrag |
| Zeitorientierung | Eher vergangenheitsorientiert | Eher zukunftsorientiert |
| Hauptzweck | Kontrolle, Kalkulation | Steuerung, Entscheidungen |
| Geeignet für | Produktkalkulation, Analyse | Preisuntergrenzen, Make-or-buy, Break-even |

---

### 2.2 Fixe und variable Kosten

**Variable Kosten** verändern sich mit der produzierten oder verkauften Menge.
**Fixe Kosten** bleiben innerhalb des relevanten Bereichs konstant, unabhängig von der Menge.

**Vereinfachende Annahmen im Lernstoff:**
- Fixe Kosten bleiben innerhalb der Periode konstant.
- Variable Kosten steigen **proportional** mit der Menge.
- Alle betrieblichen Gemeinkosten werden in der Deckungsbeitragsrechnung als **fixe Kosten** behandelt.
- Im Produktionsbetrieb zählen Einzelmaterial und (je nach Art) Einzellöhne zu den **variablen Kosten**.

**Beispiele:**

| Kostenart | Typ | Begründung |
|---|---|---|
| Rohmaterial pro Stück | variabel | steigt mit jeder produzierten Einheit |
| Akkordlöhne | variabel | abhängig von produzierter Menge |
| Miete | fix | unabhängig von der Produktionsmenge |
| Abschreibungen | fix | laufzeitabhängig, nicht mengenabhängig |
| Versicherungen | fix | unabhängig von der Menge |
| Verwaltungslöhne | fix | konstant in der Periode |

---

### 2.3 Deckungsbeitragsrechnung – Grundschema

\`\`\`
Nettoerlös (Umsatz)
- variable Kosten
= Deckungsbeitrag (DB)
- fixe Kosten
= Gewinn / Verlust (Reingewinn / Reinverlust)
\`\`\`

**Der Deckungsbeitrag** zeigt, welchen Beitrag ein Produkt zur Deckung der fixen Kosten leistet. Erst wenn die Summe aller Deckungsbeiträge die Fixkosten übersteigt, entsteht Gewinn.

**Merke:** DB = Nettoerlös − variable Kosten (nicht Nettoerlös − Selbstkosten)

---

### 2.4 Nutzschwelle (Break-even-Point)

Die **Nutzschwelle** ist der Punkt, an dem weder Gewinn noch Verlust entsteht:

\`\`\`
Nettoerlös = Selbstkosten
Reingewinn = 0
Deckungsbeitrag total = fixe Kosten total
\`\`\`

**Formeln:**

**Mengenmässige Nutzschwelle:**
\`\`\`
Nutzschwelle (Stück) = fixe Kosten total  /  Deckungsbeitrag je Stück
\`\`\`

**Wertmässige Nutzschwelle (bei bekannten Stückdaten):**
\`\`\`
Nutzschwelle (CHF) = mengenmässige Nutzschwelle × Nettoerlös je Stück
\`\`\`

**Wertmässige Nutzschwelle ohne Mengenangaben:**
\`\`\`
Nutzschwelle (CHF) = fixe Kosten × 100  /  Bruttogewinnquote (%)
\`\`\`

Dabei gilt:
\`\`\`
Bruttogewinnquote (%) = Bruttogewinn × 100  /  Nettoerlös
Bruttogewinn = Nettoerlös − variable Kosten = Deckungsbeitrag
\`\`\`

---

### 2.5 Notwendige Menge für Zielgewinn

Will ein Unternehmen einen bestimmten Reingewinn erzielen, muss es mehr als die Break-even-Menge verkaufen:

\`\`\`
Notwendige Menge = (fixe Kosten total + gewünschter Reingewinn)  /  Deckungsbeitrag je Stück
\`\`\`

**Logik:** Der Deckungsbeitrag muss zuerst die Fixkosten decken, danach erst den Zielgewinn.

---

## Durchgerechnete Prüfungsbeispiele

### Beispiel A: Pizza-Take-away Al Capone (mengenmässige Nutzschwelle)

**Angaben:**
- Nettoerlös pro Pizza: CHF 15.00
- Variable Kosten (Materialkosten) pro Pizza: CHF 5.00
- Fixe Kosten pro Jahr: CHF 300'000
- Öffnungstage pro Jahr: 340

**Schritt 1 – Deckungsbeitrag je Stück:**
\`\`\`
DB/Stück = 15 − 5 = CHF 10.00
\`\`\`

**Schritt 2 – Mengenmässige Nutzschwelle:**
\`\`\`
Nutzschwelle = 300'000 / 10 = 30'000 Pizzen pro Jahr
\`\`\`

**Schritt 3 – Nutzschwelle pro Tag:**
\`\`\`
30'000 / 340 = 88.24 → aufgerundet: 89 Pizzen pro Tag
\`\`\`

**Schritt 4 – Wertmässige Nutzschwelle:**
\`\`\`
30'000 × 15 = CHF 450'000 Umsatz
\`\`\`

**Schritt 5 – Kontrolle der Deckungsbeitragsrechnung bei Nutzschwelle:**

| Position | Betrag |
|---|---|
| Nettoerlös: 30'000 × CHF 15 | CHF 450'000 |
| Variable Kosten: 30'000 × CHF 5 | CHF 150'000 |
| Deckungsbeitrag | CHF 300'000 |
| Fixe Kosten | CHF 300'000 |
| **Reingewinn** | **CHF 0** |

---

### Beispiel B: Pizza-Take-away – Zielgewinnrechnung

**Angabe:** Gewünschter Reingewinn CHF 25'000

\`\`\`
Notwendige Menge = (300'000 + 25'000) / 10 = 32'500 Pizzen pro Jahr
\`\`\`

**Kontrolle:**

| Position | Betrag |
|---|---|
| Nettoerlös: 32'500 × CHF 15 | CHF 487'500 |
| Variable Kosten: 32'500 × CHF 5 | CHF 162'500 |
| Deckungsbeitrag | CHF 325'000 |
| Fixe Kosten | CHF 300'000 |
| **Reingewinn** | **CHF 25'000** ✓ |

---

### Beispiel C: Foto-Rahmen (grafische Darstellung)

**Angaben:**
- Nettoerlös pro Stück: CHF 50
- Variable Kosten pro Stück: CHF 30
- Deckungsbeitrag pro Stück: CHF 20
- Fixe Kosten pro Jahr: CHF 100'000

**Nutzschwelle:**
\`\`\`
100'000 / 20 = 5'000 Stück
Wertmässig: 5'000 × 50 = CHF 250'000 Umsatz
\`\`\`

**Überprüfung bei 5'000 Stück:**

| Position | Betrag |
|---|---|
| Nettoerlös: 5'000 × CHF 50 | CHF 250'000 |
| Variable Kosten: 5'000 × CHF 30 | CHF 150'000 |
| + Fixe Kosten | CHF 100'000 |
| = Selbstkosten | CHF 250'000 |
| **Reingewinn** | **CHF 0** ✓ |

---

### Beispiel D: Bauspenglerei Kurt Müller (Nutzschwelle ohne Mengenangabe)

**Angaben:**
- Nettoerlös: CHF 800'000
- Variable Kosten: CHF 200'000
- Bruttogewinn (= DB): CHF 600'000
- Fixe Kosten: CHF 450'000

**Bruttogewinnquote:**
\`\`\`
600'000 / 800'000 × 100 = 75 %
\`\`\`

**Wertmässige Nutzschwelle:**
\`\`\`
450'000 × 100 / 75 = CHF 600'000 Umsatz
\`\`\`

**Interpretation:** Das Unternehmen muss mindestens CHF 600'000 Umsatz erzielen, um alle fixen Kosten zu decken. Tatsächlicher Umsatz CHF 800'000 > Nutzschwelle CHF 600'000 → das Unternehmen ist profitabel.

---

## Grafische Darstellung der Nutzschwelle

Die Nutzschwelle kann auf **drei äquivalente grafische Arten** dargestellt werden – alle führen zum gleichen Break-even-Punkt:

### Darstellung 1: Nettoerlös-Kurve schneidet Selbstkosten-Kurve
- **Nettoerlösgerade:** startet im Ursprung, Steigung = Nettoerlös je Stück
- **Selbstkosten-Kurve:** startet bei Fixkosten (y-Achse), Steigung = variable Kosten je Stück
- **Schnittpunkt** = Nutzschwelle
- Links des Schnittpunkts: **Verlustzone** (Selbstkosten > Nettoerlös)
- Rechts des Schnittpunkts: **Gewinnzone** (Nettoerlös > Selbstkosten)

### Darstellung 2: Deckungsbeitrags-Kurve schneidet Fixkosten-Linie
- **Deckungsbeitragsgerade:** startet im Ursprung, Steigung = DB je Stück
- **Fixkosten-Linie:** horizontal auf Höhe der Fixkosten
- **Schnittpunkt** = Nutzschwelle (DB total = Fixkosten)

### Darstellung 3: Gewinn/Verlust-Kurve schneidet die Nulllinie
- **Gewinn/Verlust-Gerade:** startet im negativen Bereich (−Fixkosten), Steigung = DB je Stück
- **Nulllinie:** horizontale Achse
- **Schnittpunkt mit Nulllinie** = Nutzschwelle

### Nutzschwelle ohne Mengenangabe (Spenglerei-Grafik)
Wenn keine Stückzahlen vorliegen (z. B. im Dienstleistungsbetrieb), wird die Grafik nach **Umsatz (CHF)** auf der x-Achse aufgebaut. Die Nutzschwelle ergibt sich aus:
\`\`\`
Nutzschwelle-Umsatz = fixe Kosten × 100  /  Bruttogewinnquote
\`\`\`

---

## Vollständige Formelübersicht

### Kostenartenrechnung
\`\`\`
Aufwand (Fibu)  +/-  sachliche Abgrenzung  =  Kosten (Bebu)
\`\`\`

### Zuschlagssätze (Kostenstellenrechnung → Kostenträger)
\`\`\`
MGK-Satz (%)    = Materialgemeinkosten × 100  /  Einzelmaterialkosten
FGK 1-Satz (%)  = Fertigungsgemeinkosten 1 × 100  /  Einzellohnkosten
FGK 2-Satz (CHF/h) = Fertigungsgemeinkosten 2  /  Maschinenstunden total
VVGK-Satz (%)   = VV-Gemeinkosten × 100  /  Herstellkosten der verkauften Produkte
\`\`\`

### Kalkulation (Selbstkosten → Nettoerlös)
\`\`\`
Einzelmaterial + MGK = Materialkosten
Einzellöhne + FGK 1 + FGK 2 = Fertigungskosten
Materialkosten + Fertigungskosten = Herstellkosten
Herstellkosten + VVGK = Selbstkosten
Selbstkosten + Reingewinn = Nettoerlös
\`\`\`

### Bestandesänderungen
\`\`\`
HK prod. Fabrikate  −  Bestandeszunahme  =  HK verkaufte Fabrikate
HK prod. Fabrikate  +  Bestandesabnahme  =  HK verkaufte Fabrikate
\`\`\`

### Ergebnisüberleitung Bebu → Fibu
\`\`\`
Betriebserfolg Bebu  +/-  sachliche Abgrenzungen (umgekehrt)  =  Betriebserfolg Fibu
Betriebserfolg Fibu  +/-  ausserordentl./betriebsfremder Erfolg  −  direkte Steuern  =  Unternehmenserfolg
\`\`\`

### Deckungsbeitragsrechnung
\`\`\`
Nettoerlös  −  variable Kosten  =  Deckungsbeitrag (DB)
DB  −  fixe Kosten  =  Reingewinn / Reinverlust
\`\`\`

### Nutzschwelle
\`\`\`
Nutzschwelle (Stück)  =  fixe Kosten total  /  DB je Stück

Nutzschwelle (CHF, bei Stückdaten)  =  Nutzschwelle (Stück) × Nettoerlös je Stück

Nutzschwelle (CHF, ohne Stückdaten)  =  fixe Kosten × 100  /  Bruttogewinnquote (%)

Bruttogewinnquote (%)  =  DB total × 100  /  Nettoerlös total
\`\`\`

### Zielgewinnmenge
\`\`\`
Notwendige Menge  =  (fixe Kosten + Zielgewinn)  /  DB je Stück
\`\`\`

---

## Begriffsglossar

| Begriff | Erklärung |
|---|---|
| **Aufwand (Fibu)** | In der Finanzbuchhaltung verbuchter Werteverzehr einer Periode |
| **Kosten (Bebu)** | Betriebsnotwendiger Werteverzehr der normalen Geschäftstätigkeit |
| **Sachliche Abgrenzung** | Korrektur zwischen Fibu und Bebu (stille Reserven, ausserordentliche Posten, kalkulatorische Kosten) |
| **BAB** | Betriebsabrechnungsbogen – Instrument zur systematischen internen Kostenverrechnung |
| **Kostenartenrechnung** | Erste Stufe des BAB: Welche Kosten liegen vor? |
| **Kostenstellenrechnung** | Zweite Stufe des BAB: Wo sind die Kosten angefallen? |
| **Kostenträgerrechnung** | Dritte Stufe des BAB: Welches Produkt trägt die Kosten? |
| **Einzelkosten** | Einem Produkt direkt zurechenbar (z.B. Einzelmaterial, Einzellöhne) |
| **Gemeinkosten** | Nicht direkt einem Produkt zurechenbar, müssen über Schlüssel verteilt werden |
| **MGK** | Materialgemeinkosten (Gemeinkosten der Einkaufs- und Lagerstelle) |
| **FGK** | Fertigungsgemeinkosten (Gemeinkosten der Fertigungsstellen) |
| **VVGK** | Verwaltungs- und Vertriebsgemeinkosten |
| **Herstellkosten** | Materialkosten + Fertigungskosten (ohne VVGK) |
| **Selbstkosten** | Herstellkosten + VVGK (Vollkosten eines Produkts) |
| **Variable Kosten** | Verändern sich mit der Produktionsmenge |
| **Fixe Kosten** | Bleiben innerhalb des relevanten Bereichs konstant |
| **Deckungsbeitrag (DB)** | Nettoerlös − variable Kosten; Beitrag zur Deckung der Fixkosten |
| **Nutzschwelle** | Punkt ohne Gewinn und Verlust (DB total = Fixkosten; Nettoerlös = Selbstkosten) |
| **Bruttogewinnquote** | DB total in % des Nettoerlöses; Grundlage für Nutzschwelle ohne Stückdaten |
| **Vollkostenrechnung** | Verrechnet alle Kosten auf Produkte; Instrument für Kontrolle und Kalkulation |
| **Teilkostenrechnung** | Trennt fixe und variable Kosten; Instrument für Steuerung und Entscheidungen |

---

## Typische Prüfungsaufgaben und Lösungshinweise

### Aufgabentyp 1: Sachliche Abgrenzung berechnen
**Vorgehen:** Aufwand (Fibu) als Ausgangspunkt nehmen. Für jede Korrekturposition prüfen: erhöht oder reduziert sie die Kosten in der Bebu? Vorzeichen korrekt anwenden.

### Aufgabentyp 2: BAB ausfüllen (Kostenstellenrechnung)
**Vorgehen:**
1. Gemeinkosten aus der Kostenartenrechnung übernehmen.
2. Für jede Gemeinkostenart den passenden Verteilungsschlüssel anwenden.
3. Anteil je Kostenstelle berechnen und eintragen.
4. Kostenstellen-Totale bilden.

### Aufgabentyp 3: Zuschlagssätze berechnen
**Vorgehen:** Formel anwenden. Bezugsgrösse (Nenner) korrekt identifizieren – z. B. VVGK immer auf **Herstellkosten der verkauften** (nicht produzierten) Fabrikate.

### Aufgabentyp 4: Kalkulation eines Produkts
**Vorgehen:** Schema von Einzelmaterial bis Nettoerlös durchgehen. Zuschlagssätze auf die richtige Bezugsgrösse anwenden.

### Aufgabentyp 5: Mengenmässige und wertmässige Nutzschwelle
**Vorgehen:**
1. DB je Stück berechnen: Nettoerlös/Stück − variable Kosten/Stück.
2. Nutzschwelle (Stück) = Fixkosten / DB je Stück.
3. Nutzschwelle (CHF) = Nutzschwelle (Stück) × Nettoerlös je Stück.

### Aufgabentyp 6: Zielgewinnmenge berechnen
**Vorgehen:** Zielgewinn zu den Fixkosten addieren, dann durch DB je Stück dividieren.

### Aufgabentyp 7: Nutzschwelle ohne Stückzahlen (Bruttogewinnquote)
**Vorgehen:**
1. Bruttogewinnquote berechnen: DB × 100 / Nettoerlös.
2. Nutzschwelle = Fixkosten × 100 / Bruttogewinnquote.

### Aufgabentyp 8: Ergebnisüberleitung Bebu → Fibu
**Vorgehen:** Sachliche Abgrenzungen mit **umgekehrtem Vorzeichen** zum Betriebserfolg Bebu addieren. Dann ausserordentliche/betriebsfremde Erfolge und direkte Steuern berücksichtigen.

---

## Häufige Fehler und Fallen

| Fehler | Richtig |
|---|---|
| VVGK auf HK **produzierter** Fabrikate rechnen | VVGK immer auf HK der **verkauften** Fabrikate |
| Deckungsbeitrag = Nettoerlös − Selbstkosten | DB = Nettoerlös − **variable Kosten** |
| Bei Nutzschwelle: Fixkosten durch Nettoerlös teilen | Fixkosten durch **DB je Stück** teilen |
| Produktverlust = Produkt einstellen | Prüfen ob positiver DB vorhanden ist! |
| Sachliche Abgrenzung: gleiches Vorzeichen wie Aufwand-Korrektur | Bei Überleitung Bebu → Fibu: **umgekehrtes Vorzeichen** |
| Variable Kosten = Gemeinkosten | Variable Kosten ≠ Gemeinkosten (unterschiedliche Einteilungsprinzipien) |

---

## Zusammenfassung der Kernaussagen

1. Die Erfolgsrechnung der Finanzbuchhaltung reicht für betriebliche Entscheidungszwecke nicht aus.
2. Die Kostenartenrechnung korrigiert den Fibu-Aufwand durch sachliche Abgrenzungen zu betriebsnotwendigen Kosten.
3. Die Kostenstellenrechnung macht sichtbar, in welchen Unternehmensbereichen Kosten entstehen.
4. Die Kostenträgerrechnung zeigt, welche Produkte Gewinn oder Verlust erwirtschaften.
5. Einzelkosten werden direkt, Gemeinkosten indirekt über Zuschlagssätze auf Produkte verrechnet.
6. Lagerveränderungen von Halb- und Fertigfabrikaten müssen in Produktionsbetrieben korrekt berücksichtigt werden.
7. Vollkostenrechnung eignet sich für Kontrolle und Kalkulation; Teilkostenrechnung für kurzfristige Steuerung und Entscheidungen.
8. Der Deckungsbeitrag zeigt, welchen Beitrag ein Produkt zur Deckung fixer Kosten leistet.
9. Die Nutzschwelle ist erreicht, wenn Deckungsbeitrag total = fixe Kosten total.
10. Ein Produktverlust in der Vollkostenrechnung darf nicht automatisch zur Einstellung des Produkts führen – entscheidend ist der Deckungsbeitrag.
11. Grafische und rechnerische Nutzschwellendarstellungen sind äquivalent und führen zum gleichen Ergebnis.
12. Die Bruttogewinnquote ermöglicht die Berechnung der Nutzschwelle auch ohne Stückzahlen.`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  console.log('Connected to database.')

  const result = await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = ANY($2::uuid[])`,
    [SUMMARY, ['f5c28c8f-f820-4dbf-a37e-38d0f815be76', '55da8759-ee41-4f9e-9b5d-e32f8b7c44b1']]
  )
  console.log(`Updated ${result.rowCount} kostenrechnung chapters.`)

  await client.end()
  console.log('Done.')
}

main().catch(console.error)
