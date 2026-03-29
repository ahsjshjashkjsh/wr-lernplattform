import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = `# Stille Reserven (Vertiefung) – Bilanzbereinigung und Erfolgsbereinigung

## 1. Was sind Stille Reserven?

**Stille Reserven** sind nicht offen ausgewiesene Wertdifferenzen zwischen dem externen Buchwert (wie er im Jahresabschluss erscheint) und dem wirtschaftlich zutreffenden Wert. Sie entstehen immer dann, wenn Vermögenswerte **zu tief** oder Schulden **zu hoch** ausgewiesen werden.

### Definition (präzise Formel)

> **Stille Reserve = Wirtschaftlich richtiger Wert − Extern ausgewiesener Wert**

- Bei **Aktiven**: Stille Reserve = interner Wert − externer Wert (positiv, weil Aktiven zu tief)
- Bei **Passiven**: Stille Reserve = externer Wert − interner Wert (positiv, weil Passiven zu hoch)

### Typische Entstehungsquellen

| Bereich | Entstehungsursache |
|---|---|
| Sachanlagen | Überhöhte Abschreibungen (z. B. degressive statt linearer Abschreibung) |
| Vorräte | Systematische Unterbewertung des Lagerbestands (z. B. pauschaler Abzug) |
| Rückstellungen | Zu hoch angesetzte Rückstellungen (Vorsichtsprinzip) |
| Forderungen | Zu hohe Wertberichtigungen |
| Wertschriften | Bewertung unter Marktwert |

### Warum entstehen stille Reserven?

Stille Reserven entstehen typischerweise aus zwei Motiven:

1. **Vorsichtsprinzip (OR-konform):** Das Obligationenrecht erlaubt in bestimmten Grenzen vorsichtige Bewertungen. Gläubiger sollen geschützt werden – daher darf ein Unternehmen Werte eher tiefer als höher ansetzen.
2. **Steuerliche Motivation:** Tiefere Buchwerte (höhere Abschreibungen, höhere Rückstellungen) senken den steuerbaren Gewinn und damit die Steuerbelastung im laufenden Jahr.

---

## 2. Externer vs. Interner Abschluss

Das Kernproblem stiller Reserven liegt darin, dass **zwei verschiedene Adressaten** eines Jahresabschlusses unterschiedliche Informationen benötigen:

### Externer Abschluss

- Richtet sich an **Außenstehende**: Gläubiger, Banken, Steuerbehörden, Aktionäre
- Darf stille Reserven enthalten (im Rahmen von OR und HGB/IFRS-Vorschriften)
- Schützt Gläubiger durch vorsichtige Bewertung
- **Nachteil:** Gibt kein vollständig wahrheitsgetreues Bild der wirtschaftlichen Lage

### Interner Abschluss

- Richtet sich an die **Geschäftsleitung und den Verwaltungsrat**
- Soll die wirtschaftliche Lage unverfälscht zeigen
- Enthält keine stillen Reserven – alle Werte werden zu wirtschaftlich zutreffenden Beträgen ausgewiesen
- **Zweck:** Fundierte Entscheidungsgrundlage für Management, Unternehmensbewertung, Kauf/Verkauf

### Praktische Relevanz: Kioskbeispiel

Stellen Sie sich vor: Reto Gisiger möchte seinen Kiosk altersbedingt verkaufen. Sein Treuhänder weist darauf hin, dass der externe Jahresabschluss **stille Reserven enthält** – der tatsächliche Unternehmenswert ist höher, als die Buchhaltung zeigt. Für eine sachgerechte Bewertung muss der externe Abschluss in einen internen Abschluss überführt werden.

---

## 3. Das Grundprinzip der Bereinigung

### Zwei verschiedene Korrekturgrössen je nach Rechenwerk

| Rechenwerk | Massgebliche Korrekturgrösse | Warum? |
|---|---|---|
| **Bilanz** | **Endbestand der stillen Reserven am Bilanzstichtag** | Die Bilanz ist eine Stichtagsrechnung – sie zeigt Vermögen und Schulden zu einem bestimmten Datum |
| **Erfolgsrechnung** | **Veränderung der stillen Reserven im Geschäftsjahr** | Die Erfolgsrechnung ist eine Periodenrechnung – sie zeigt Aufwand und Ertrag einer Periode |

Dieses Grundprinzip ist der wichtigste Lerninhalt des gesamten Themas und kommt in allen Aufgaben und Prüfungen vor.

---

## 4. Bereinigung der Bilanz

### Regel

> **Interne Bilanz = Externe Bilanz + Bestand stiller Reserven am 31.12.**

Im Detail:
- **Aktiven intern** = Aktiven extern + stille Reserven (Aktiven zu tief → intern erhöhen)
- **Passiven intern** = Passiven extern − stille Reserven (Passiven zu hoch → intern reduzieren)

Die Differenz beider Seiten – also der Aufschlag gegenüber dem externen Eigenkapital – entspricht dem Gesamtbestand der stillen Reserven. In der internen Bilanz erscheint dieser Betrag als eigene Position **„Stille Reserven"** auf der Passivseite (als Ergänzung zum Eigenkapital).

### Rechenweg Schritt für Schritt

1. Externe Schlussbilanz übernehmen
2. Tabelle der stillen Reserven aufstellen: Bestand je Konto am 31.12.
3. Bei jedem Aktivkonto mit stiller Reserve → externen Wert erhöhen
4. Bei jedem Passivkonto mit stiller Reserve → externen Wert reduzieren
5. Kontrolle: Bilanzsumme steigt um den Gesamtbestand der stillen Reserven

---

## 5. Bereinigung der Erfolgsrechnung

### Regel

> **Interner Reingewinn = Externer Reingewinn + Veränderung der stillen Reserven**

*(gilt, wenn alle stillen Reserven erfolgswirksam über die Aufwandseite entstanden sind)*

Im Detail – je nach Entstehungsrichtung:

| Situation | Wirkung extern | Korrektur intern |
|---|---|---|
| **Bildung** stiller Reserven (Bestand steigt) über Aufwand | Aufwand zu hoch ausgewiesen | Internen Aufwand **reduzieren** |
| **Auflösung** stiller Reserven (Bestand sinkt) über Aufwand | Aufwand zu tief ausgewiesen | Internen Aufwand **erhöhen** |
| **Bildung** stiller Reserven über Ertrag | Ertrag zu tief ausgewiesen | Internen Ertrag **erhöhen** |
| **Auflösung** stiller Reserven über Ertrag | Ertrag zu hoch ausgewiesen | Internen Ertrag **reduzieren** |

### Rechenweg Schritt für Schritt

1. Externe Erfolgsrechnung übernehmen
2. Veränderung der stillen Reserven je Konto bestimmen (Endbestand − Anfangsbestand)
3. Korrekturrichtung je Konto ermitteln (Bildung oder Auflösung? Aufwand- oder Ertragskonto?)
4. Aufwands- und Ertragskonten anpassen
5. Internen Reingewinn berechnen
6. Prüfkontrolle: Interner Reingewinn − externer Reingewinn = Gesamtveränderung stiller Reserven

---

## 6. Das Gesamtbeispiel: Kiosk Reto Gisiger

### 6.1 Externe Schlussbilanz

#### Aktiven

| Position | Betrag CHF |
|---|---:|
| Kasse | 3'700 |
| Bank | 87'500 |
| Forderungen L+L | 2'100 |
| Warenvorrat | 42'000 |
| Mobiliar | 12'500 |
| Fahrzeuge | 14'400 |
| **Total Aktiven** | **162'200** |

#### Passiven

| Position | Betrag CHF |
|---|---:|
| Verbindlichkeiten L+L | 31'900 |
| Rückstellungen | 12'000 |
| Eigenkapital | 118'300 |
| **Total Passiven** | **162'200** |

### 6.2 Externe Erfolgsrechnung

#### Aufwand

| Position | Betrag CHF |
|---|---:|
| Warenaufwand | 390'200 |
| Personalaufwand | 367'100 |
| Raumaufwand | 50'200 |
| Fahrzeugaufwand | 11'600 |
| Sonstiger Betriebsaufwand | 8'700 |
| Abschreibungen | 14'900 |
| **Reingewinn** | **42'600** |
| **Total** | **885'300** |

#### Ertrag

| Position | Betrag CHF |
|---|---:|
| Warenerlöse | 883'600 |
| Finanzertrag | 1'700 |
| **Total** | **885'300** |

### 6.3 Tabelle der stillen Reserven

Diese Tabelle ist das zentrale Instrument für die Überleitung von extern zu intern:

| Konto | Bestand 1.1. CHF | Bestand 31.12. CHF | Veränderung CHF |
|---|---:|---:|---:|
| Warenvorrat | 23'000 | 21'000 | −2'000 |
| Mobiliar | 5'100 | 7'200 | +2'100 |
| Fahrzeuge | 8'000 | 9'600 | +1'600 |
| Rückstellungen | 0 | 5'000 | +5'000 |
| **Total** | **36'100** | **42'800** | **+6'700** |

**Interpretation der Tabelle:**
- Warenvorrat: Stille Reserve ist gesunken → Auflösung von CHF 2'000
- Mobiliar: Stille Reserve ist gestiegen → Bildung von CHF 2'100 (überhöhte Abschreibung)
- Fahrzeuge: Stille Reserve ist gestiegen → Bildung von CHF 1'600 (überhöhte Abschreibung)
- Rückstellungen: Stille Reserve neu entstanden → Bildung von CHF 5'000 (zu hoch angesetzte Rückstellung)

### 6.4 Interne Schlussbilanz

#### Interne Aktiven (Endbestand stiller Reserven hinzurechnen)

| Position | Extern CHF | Stille Reserve CHF | Intern CHF |
|---|---:|---:|---:|
| Kasse | 3'700 | 0 | 3'700 |
| Bank | 87'500 | 0 | 87'500 |
| Forderungen L+L | 2'100 | 0 | 2'100 |
| Warenvorrat | 42'000 | +21'000 | **63'000** |
| Mobiliar | 12'500 | +7'200 | **19'700** |
| Fahrzeuge | 14'400 | +9'600 | **24'000** |
| **Total Aktiven** | **162'200** | **+37'800** | **200'000** |

#### Interne Passiven (Endbestand stiller Reserven abziehen)

| Position | Extern CHF | Stille Reserve CHF | Intern CHF |
|---|---:|---:|---:|
| Verbindlichkeiten L+L | 31'900 | 0 | 31'900 |
| Rückstellungen | 12'000 | −5'000 | **7'000** |
| Eigenkapital | 118'300 | 0 | 118'300 |
| Stille Reserven | — | — | **42'800** |
| **Total Passiven** | **162'200** | **+37'800** | **200'000** |

**Ergebnis:** Die interne Bilanzsumme beträgt CHF 200'000 statt extern CHF 162'200. Der Unterschied von CHF 37'800 ergibt sich aus: +21'000 (Vorrat) +7'200 (Mobiliar) +9'600 (Fahrzeuge) −5'000 (Rückstellungen) = +32'800 netto auf der Aktivseite + 5'000 Passivenkorrektur = CHF 37'800 gesamt. Diese Zahl entspricht dem Endbestand der stillen Reserven von CHF 42'800 abzüglich der Passivenreserve von CHF 5'000... Nein: Die Passivseite zeigt CHF 42'800 als eigene Position, während die Rückstellungen um CHF 5'000 sinken – damit stimmt die Passivseite insgesamt: 31'900 + 7'000 + 118'300 + 42'800 = 200'000.

### 6.5 Interne Erfolgsrechnung

#### Korrekturen (Veränderung der stillen Reserven anwenden)

**Warenaufwand:**
- Stille Reserve im Warenvorrat ist um CHF 2'000 gesunken (Auflösung)
- Auflösung → externer Aufwand zu tief → intern erhöhen
- Intern: 390'200 + 2'000 = **CHF 392'200**

**Sonstiger Betriebsaufwand:**
- Stille Reserve in Rückstellungen ist um CHF 5'000 gestiegen (Bildung)
- Bildung über Aufwandskonto → externer Aufwand zu hoch → intern reduzieren
- Intern: 8'700 − 5'000 = **CHF 3'700**

**Abschreibungen:**
- Stille Reserve bei Mobiliar +2'100 und Fahrzeuge +1'600 = +3'700 gesamt (Bildung)
- Bildung über Abschreibungen → externer Aufwand zu hoch → intern reduzieren
- Intern: 14'900 − 3'700 = **CHF 11'200**

#### Interne Erfolgsrechnung (vollständig)

| Position | Extern CHF | Korrektur CHF | Intern CHF |
|---|---:|---:|---:|
| Warenaufwand | 390'200 | +2'000 | **392'200** |
| Personalaufwand | 367'100 | — | 367'100 |
| Raumaufwand | 50'200 | — | 50'200 |
| Fahrzeugaufwand | 11'600 | — | 11'600 |
| Sonstiger Betriebsaufwand | 8'700 | −5'000 | **3'700** |
| Abschreibungen | 14'900 | −3'700 | **11'200** |
| **Reingewinn** | **42'600** | **+6'700** | **49'300** |
| **Total** | **885'300** | — | **885'300** |

**Prüfkontrolle:**
- Interner Reingewinn − externer Reingewinn = 49'300 − 42'600 = **CHF 6'700**
- Veränderung stiller Reserven total = **CHF +6'700** ✓

---

## 7. Stille Reserven bei Sachanlagen

### Entstehungsmechanismus

Bei Sachanlagen entstehen stille Reserven vor allem durch **überhöhte Abschreibungen**. Der steuerlich zulässige externe Abschreibungssatz ist oft höher als der wirtschaftlich angemessene interne Abschreibungssatz.

- **Intern (wirtschaftlich):** Linearer Abschreibungssatz, der der tatsächlichen Nutzungsdauer entspricht
- **Extern (steuerlich):** Degressiver Abschreibungssatz, der in frühen Jahren deutlich höhere Abschreibungen erlaubt

Dadurch sinkt der **externe Buchwert schneller** als der interne. Die Differenz zwischen internem und externem Buchwert ist die stille Reserve.

### Rechenbeispiel: Fahrzeug

**Annahmen:**
- Anschaffungskosten: CHF 40'000
- Interne Abschreibung: 20 % linear pro Jahr (wirtschaftliche Nutzungsdauer 5 Jahre)
- Externe Abschreibung: 40 % degressiv auf Restbuchwert (steuerlich zulässig)

| Jahr | Abschreibung intern | Buchwert intern | Abschreibung extern | Buchwert extern | Stille Reserve (Bestand) | Veränderung |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 8'000 | 32'000 | 16'000 | 24'000 | 8'000 | +8'000 |
| 2 | 8'000 | 24'000 | 9'600 | 14'400 | 9'600 | +1'600 |
| 3 | 8'000 | 16'000 | 5'760 | 8'640 | 7'360 | −2'240 |
| 4 | 8'000 | 8'000 | 3'456 | 5'184 | 2'816 | −4'544 |
| 5 | 8'000 | 0 | 5'184* | 0 | 0 | −2'816 |

*Im 5. Jahr wird der verbleibende Restbuchwert von CHF 3'110 vollständig abgeschrieben (Restabschreibung auf 0), da Anlagen nicht überbewertet werden dürfen und die Nutzungsdauer endet.

### Interpretation des Lebenszyklus

**Jahre 1–2 (Aufbauphase):**
- Externe Abschreibung > interne Abschreibung
- Bestand stiller Reserven wächst
- Bildung stiller Reserven → externer Abschreibungsaufwand zu hoch → externer Gewinn zu tief

**Jahre 3–5 (Abbauphase):**
- Externe Abschreibung < interne Abschreibung
- Bestand stiller Reserven schrumpft
- Auflösung stiller Reserven → externer Abschreibungsaufwand zu tief → externer Gewinn zu hoch

**Wichtige Erkenntnis:** Stille Reserven bei Sachanlagen sind keine dauerhaften „Polster" – sie bauen sich über den Lebenszyklus automatisch wieder ab. In späteren Jahren dreht sich der Effekt um.

### Berechnung der stillen Reserve bei Sachanlagen

> **Stille Reserve (Bestand) = Interner Buchwert − Externer Buchwert**

> **Veränderung stiller Reserve = Bestand Ende Jahr − Bestand Anfang Jahr**

**Oder direkt:**
> **Veränderung = Externe Abschreibung − Interne Abschreibung**

(positiv = Bildung, negativ = Auflösung)

---

## 8. Stille Reserven bei Vorräten

### Entstehungsmechanismus

Bei Vorräten entstehen stille Reserven durch **systematische Unterbewertung des Lagerbestands**. Das Niederstwertprinzip erlaubt, Vorräte unterhalb der Anschaffungskosten zu bewerten. Unternehmen nutzen diesen Spielraum oft pauschal.

**Typische Form:** Das Lager wird extern um einen festen Prozentsatz (z. B. ein Drittel) unter dem internen Wert ausgewiesen.

### Rechenmechanik

**Gegebene Grössen:**
- Externer Lageranfangsbestand: CHF 46'000
- Externer Lagerschlussbestand: CHF 42'000
- Einkäufe: CHF 386'200
- Unterbewertung: ein Drittel des internen Werts

**Berechnung der stillen Reserven im Lager:**

Die stille Reserve beträgt ein Drittel des internen Werts → der externe Wert entspricht zwei Dritteln des internen Werts.

Formel: Interne Lagerwert = Externer Lagerwert × 3/2

- Stille Reserven 1.1.: CHF 46'000 × 1/2 = CHF 23'000
- Stille Reserven 31.12.: CHF 42'000 × 1/2 = CHF 21'000

*(Achtung: "ein Drittel des internen Werts" bedeutet: extern = intern − 1/3 intern = 2/3 intern, also intern = extern × 3/2)*

**Interne Lagerwerte:**
- Interner Anfangsbestand: 46'000 + 23'000 = CHF 69'000
- Interner Schlussbestand: 42'000 + 21'000 = CHF 63'000

**Lagerveränderung:**
- Extern: 46'000 − 42'000 = CHF 4'000 (Lagerabnahme)
- Intern: 69'000 − 63'000 = CHF 6'000 (Lagerabnahme)

**Warenaufwand:**
- Extern: Einkäufe + externe Lagerabnahme = 386'200 + 4'000 = **CHF 390'200**
- Intern: Einkäufe + interne Lagerabnahme = 386'200 + 6'000 = **CHF 392'200**

**Differenz = CHF 2'000** → entspricht der Auflösung stiller Reserven (23'000 − 21'000)

### Logik der Lagerveränderung und stillen Reserven

| Lagerentwicklung | Wirkung auf stille Reserven | Wirkung auf Warenaufwand |
|---|---|---|
| Lager nimmt ab | Stille Reserven sinken (Auflösung) | Interner Aufwand > externer Aufwand |
| Lager nimmt zu | Stille Reserven steigen (Bildung) | Interner Aufwand < externer Aufwand |
| Lager bleibt gleich | Stille Reserven bleiben gleich | Kein Unterschied |

---

## 9. Stille Reserven bei Rückstellungen

### Entstehungsmechanismus

Rückstellungen entstehen für ungewisse Verbindlichkeiten. Das Vorsichtsprinzip erlaubt, Rückstellungen eher zu hoch anzusetzen. Wenn eine Rückstellung grösser ist als wirtschaftlich notwendig, entsteht eine **stille Reserve auf der Passivseite**.

### Wirkung in der Erfolgsrechnung

Wenn eine überhöhte Rückstellung **neu gebildet** wird:
- Externer Aufwand (z. B. „Sonstiger Betriebsaufwand") wird um den Überschussbetrag erhöht
- Externer Gewinn sinkt
- → Intern: Aufwand reduzieren (der Überschussbetrag war Bildung stiller Reserven)

Wenn eine überhöhte Rückstellung **aufgelöst** wird:
- Externer Ertrag steigt (oder Aufwand sinkt)
- Externer Gewinn steigt
- → Intern: Ertrag reduzieren (die Auflösung war nur eine Auflösung stiller Reserven, kein echter Gewinn)

**Beispiel:** Rückstellung neu gebildet CHF 12'000, davon wirtschaftlich begründet CHF 7'000, überhöhter Anteil CHF 5'000 = stille Reserve.

---

## 10. OR-Vorschriften und Bewertungsgrundsätze (Vertiefung)

### Grundsatz der Vorsicht (Art. 958c OR)

Das Obligationenrecht schreibt vor, dass der Jahresabschluss nach dem Grundsatz der Vorsicht zu erstellen ist. Das bedeutet:
- Aktiven und Erträge dürfen nicht zu hoch bewertet werden
- Schulden und Aufwand dürfen nicht zu tief bewertet werden
- Im Zweifelsfall wird der tiefere Wert für Aktiven und der höhere Wert für Schulden verwendet

### Bewertungsobergrenzen (Art. 960 ff. OR)

| Position | Maximale Bewertungsgrenze |
|---|---|
| Umlaufvermögen | Niederstwertprinzip: Anschaffungswert oder Marktwert, je nachdem welcher tiefer ist |
| Sachanlagen | Anschaffungs- oder Herstellungskosten abzüglich notwendiger Abschreibungen |
| Vorräte | Anschaffungskosten oder Nettoveräusserungswert (der tiefere Wert) |
| Rückstellungen | Soweit wirtschaftlich notwendig |

### Bewertungsspielräume und stille Reserven

Das OR erlaubt explizit Bewertungsspielräume, die zur Bildung stiller Reserven genutzt werden können:
- Abschreibungen können über das wirtschaftlich notwendige Mass hinaus vorgenommen werden
- Rückstellungen können grosszügig bemessen werden
- Vorräte können unter Anschaffungskosten bewertet werden

Diese Spielräume haben jedoch Grenzen: Eine extreme Unterbewertung ist nicht zulässig, und Anlagen dürfen nicht **über** ihren Anschaffungskosten ausgewiesen werden.

---

## 11. Methodik: Vollständige Überleitung in der Praxis

### Schritt-für-Schritt-Anleitung

#### Schritt 1: Externe Zahlen erfassen
- Externe Schlussbilanz (alle Konten mit externen Buchwerten)
- Externe Erfolgsrechnung (alle Aufwands- und Ertragskonten)

#### Schritt 2: Tabelle der stillen Reserven aufstellen

| Konto | Bestand 1.1. | Bestand 31.12. | Veränderung |
|---|---:|---:|---:|
| Konto A | X | Y | Y−X |
| Konto B | X | Y | Y−X |
| **Total** | **Σ** | **Σ** | **Σ** |

#### Schritt 3: Interne Bilanz erstellen
- Aktivkonten mit stillen Reserven: + Endbestand 31.12.
- Passivkonten mit stillen Reserven: − Endbestand 31.12.
- Neue Position „Stille Reserven" auf Passivseite = Gesamtendbestand

#### Schritt 4: Interne Erfolgsrechnung erstellen

Für jedes Konto mit Veränderung der stillen Reserve:

| Konto | Art der SR | Veränderung | Wirkung extern | Korrektur intern |
|---|---|---|---|---|
| Aufwandskonto | Bildung (SR↑) | + | Aufwand zu hoch | Aufwand −X |
| Aufwandskonto | Auflösung (SR↓) | − | Aufwand zu tief | Aufwand +X |
| Passivkonto | Bildung (SR↑) | + | Aufwand zu hoch | Aufwand −X |

#### Schritt 5: Kontrolle
- Differenz Bilanzsummen = Endbestand stiller Reserven ✓
- Differenz Reingewinne = Veränderung stiller Reserven ✓

---

## 12. Zusammenfassung der Korrekturen im Überblick

### Standardsituationen und Buchungslogik

**Situation A: Überhöhte Abschreibung auf Sachanlagen (Bildung)**
- Extern: Abschreibungsaufwand CHF 14'900
- Überhöhter Anteil: CHF 3'700 (Bildung stiller Reserven)
- Intern: Abschreibungsaufwand CHF 11'200
- Wirkung: Interner Gewinn steigt um CHF 3'700

**Situation B: Lagerabnahme bei unterbewertetem Vorrat (Auflösung)**
- Extern: Warenaufwand CHF 390'200
- Auflösung stiller Reserven: CHF 2'000
- Intern: Warenaufwand CHF 392'200
- Wirkung: Interner Gewinn sinkt um CHF 2'000

**Situation C: Überhöhte Rückstellung neu gebildet (Bildung)**
- Extern: Sonstiger Betriebsaufwand CHF 8'700
- Überhöhter Anteil: CHF 5'000 (Bildung stiller Reserven)
- Intern: Sonstiger Betriebsaufwand CHF 3'700
- Wirkung: Interner Gewinn steigt um CHF 5'000

**Gesamteffekt im Beispiel:**
+3'700 (Sachanlagen) − 2'000 (Vorrat) + 5'000 (Rückstellungen) = **+6'700 CHF** = Veränderung stiller Reserven

---

## 13. Prüfungsrelevante Fragen und Antworten

**Frage 1:** Warum ist für die Bilanzbereinigung der Bestand der stillen Reserven relevant, für die Erfolgsrechnung aber deren Veränderung?

**Antwort:** Die Bilanz ist eine Stichtagsrechnung. Sie zeigt Vermögen und Schulden zu einem bestimmten Datum – deshalb ist der Bestand am Stichtag massgeblich. Die Erfolgsrechnung ist eine Periodenrechnung. Sie zeigt Aufwand und Ertrag einer Periode – deshalb ist die Veränderung der stillen Reserven (also das, was im Laufe der Periode neu gebildet oder aufgelöst wurde) massgeblich.

---

**Frage 2:** Wie verändert sich der interne Reingewinn gegenüber dem externen, wenn im Geschäftsjahr netto stille Reserven gebildet wurden?

**Antwort:** Wenn stille Reserven netto gebildet werden (Endbestand > Anfangsbestand), dann ist der externe Aufwand in diesem Umfang zu hoch ausgewiesen. Der interne Reingewinn ist deshalb **höher** als der externe. Formel: Interner RG = Externer RG + Netto-Bildung stiller Reserven.

---

**Frage 3:** Weshalb führt eine Lagerabnahme bei pauschal unterbewertetem Vorrat zur Auflösung stiller Reserven?

**Antwort:** Wenn der Vorrat extern um einen festen Anteil unterbewertet wird, stecken in jedem Lagerfranken „versteckte" stille Reserven. Wenn das Lager abnimmt, gehen auch diese stillen Reserven verloren – sie „lösen sich auf". Der interne Wareneinsatz (Lagerabnahme) ist deshalb grösser als der externe, was bedeutet: externer Aufwand zu tief, interner Aufwand zu hoch.

---

**Frage 4:** Warum werden bei der Bereinigung der Bilanz stille Reserven bei Aktiven hinzugerechnet, bei Passiven aber abgezogen?

**Antwort:** Stille Reserven bei Aktiven bedeuten, dass der externe Aktivwert zu tief ist. Um den wirtschaftlich richtigen Wert zu zeigen, muss man den Aktivwert nach oben korrigieren. Stille Reserven bei Passiven bedeuten, dass der externe Passivwert zu hoch ist. Um den wirtschaftlich richtigen Wert zu zeigen, muss man den Passivwert nach unten korrigieren.

---

**Frage 5:** Warum können stille Reserven bei Sachanlagen nach einigen Jahren wieder sinken, obwohl die Anlage noch vorhanden ist?

**Antwort:** Bei degressiver Abschreibung fallen die jährlichen Abschreibungsbeträge mit der Zeit. Ab einem bestimmten Punkt ist die degressive Abschreibung kleiner als die lineare interne Abschreibung. Dann schrumpft die Differenz zwischen internem und externem Buchwert – die stille Reserve löst sich schrittweise auf.

---

**Frage 6:** Was zeigt die Prüfkontrolle bei einer Erfolgsrechungsbereinigung?

**Antwort:** Wenn alle Korrekturen konsistent und vollständig sind, gilt: Interner Reingewinn − Externer Reingewinn = Gesamtveränderung stiller Reserven. Diese Prüfung bestätigt, dass keine Korrektur vergessen oder falsch vorzeichen wurde.

---

**Frage 7:** Was passiert mit stillen Reserven am Ende der Nutzungsdauer einer Anlage?

**Antwort:** Am Ende der Nutzungsdauer ist der interne Buchwert null (vollständig abgeschrieben nach wirtschaftlicher Nutzungsdauer). Der externe Buchwert bei degressiver Abschreibung ist noch nicht null – er wird dann auf null restabgeschrieben. Damit lösen sich alle verbleibenden stillen Reserven vollständig auf.

---

**Frage 8:** Kann der externe Reingewinn höher sein als der interne?

**Antwort:** Ja. Das ist der Fall, wenn im Geschäftsjahr per Saldo stille Reserven aufgelöst werden (Endbestand < Anfangsbestand). Dann ist der externe Gewinn durch die Auflösung zu hoch ausgewiesen; intern ist der echte operative Gewinn tiefer.

---

## 14. Wichtige Definitionen im Überblick

| Begriff | Definition |
|---|---|
| Stille Reserven | Nicht offen ausgewiesene Differenz zwischen externem Buchwert und wirtschaftlich zutreffendem Wert |
| Bestand stiller Reserven | Höhe der stillen Reserven zu einem bestimmten Stichtag |
| Veränderung stiller Reserven | Endbestand − Anfangsbestand der stillen Reserven einer Periode |
| Bildung stiller Reserven | Erhöhung des Bestands; führt extern zu zu hohem Aufwand oder zu tiefem Ertrag |
| Auflösung stiller Reserven | Verringerung des Bestands; führt extern zu zu tiefem Aufwand oder zu hohem Ertrag |
| Externer Abschluss | Jahresabschluss für Außenstehende; kann stille Reserven enthalten |
| Interner Abschluss | Für Führungszwecke; zeigt wirtschaftlich korrekte Werte; enthält keine stillen Reserven |
| Bilanzbereinigung | Korrektur der externen Bilanz um den Endbestand stiller Reserven am Stichtag |
| Erfolgsbereinigung | Korrektur der externen Erfolgsrechnung um die Veränderung stiller Reserven der Periode |
| Interner Buchwert | Wirtschaftlich zutreffender Wert; Basis für Berechnung stiller Reserven |
| Externer Buchwert | Im externen Abschluss ausgewiesener Wert; durch steuerliche/vorsichtige Bewertung geprägt |

---

## 15. Verbindungen zu anderen Themen

- **Abschreibungen:** Unterschied zwischen betriebswirtschaftlich richtiger (linearer) und steuerlich zulässiger (degressiver) Abschreibung ist die klassische Quelle stiller Reserven bei Sachanlagen
- **Vorratsbewertung:** Niederstwertprinzip und Vorsichtsprinzip erlauben Unterbewertung → stille Reserven im Lager
- **Rückstellungen:** Überhöhte Rückstellungen = stille Reserven auf der Passivseite
- **Unternehmensbewertung:** Kaufpreis bei Unternehmensübernahmen basiert auf internem Wert, nicht externem Buchwert → stille Reserven erhöhen den Unternehmenswert
- **Jahresabschlussanalyse:** Kennzahlen wie Eigenkapitalquote, Gesamtkapitalrendite oder Liquiditätskennzahlen können durch stille Reserven verzerrt sein → Analyse muss auf intern bereinigten Zahlen aufbauen
- **Steuerrecht:** Steuerliche Bewertungswahlrechte (degressive AfA, grosszügige Rückstellungen) begünstigen die Entstehung stiller Reserven
- **Internes Rechnungswesen / Controlling:** Interne Steuerung braucht unverzerrte Werte → interner Abschluss ohne stille Reserven
- **Periodengerechte Erfolgsermittlung:** Bildung und Auflösung stiller Reserven beeinflussen den ausgewiesenen Periodenerfolg und können die Gewinnqualität verzerren

---

## 16. Merkhilfen für die Prüfung

### Die zwei goldenen Regeln

> **Bilanz → Endbestand der stillen Reserven (Stichtag)**
> **Erfolgsrechnung → Veränderung der stillen Reserven (Periode)**

### Vorzeichen-Eselsbrücke

| Was passiert? | Wo? | Extern zu hoch/tief? | Intern korrigieren? |
|---|---|---|---|
| Bildung SR | Aufwandskonto | Aufwand zu HOCH | Aufwand SENKEN |
| Auflösung SR | Aufwandskonto | Aufwand zu TIEF | Aufwand ERHÖHEN |
| Bildung SR | Passivkonto | Aufwand zu HOCH | Aufwand SENKEN |
| Auflösung SR | Passivkonto | Aufwand zu TIEF | Aufwand ERHÖHEN |

### Prüfkontrolle immer anwenden

1. Bilanzdifferenz = Endbestand stiller Reserven ✓
2. Gewinndifferenz = Veränderung stiller Reserven ✓

Wenn beide Kontrollen aufgehen: alle Bereinigungen korrekt und vollständig.
`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  const result = await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = $2`,
    [SUMMARY, 'b6aef95f-505c-4942-b90f-6b2b1d5e07e7']
  )
  console.log('Updated stille-reserven chapter. Rows affected:', result.rowCount)
  await client.end()
}
main().catch(console.error)
