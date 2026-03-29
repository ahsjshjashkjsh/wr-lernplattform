import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY = "# Bewertungsvorschriften, Stille Reserven und Bilanzbereinigung\n\n## Überblick\n\nDieses Kapitel behandelt die handels- und steuerrechtlich geprägte Bewertung von Bilanzpositionen sowie das Konzept der stillen Reserven im schweizerischen Rechnungswesen. Im Zentrum stehen drei Fragen: Mit welchen Wertmassstäben werden Vermögenswerte und Schulden in der Bilanz angesetzt? Wie entstehen durch Bewertungsentscheide stille Reserven? Und wie verändern diese stille Reserven den ausgewiesenen Gewinn, die Bilanzstruktur und die Informationslage?\n\nBewertungen sind nicht nur Technik, sondern auch Bilanzpolitik und Informationspolitik. Wer das Kapitel versteht, kann Bilanzwerte fachlich korrekt einordnen und erkennt, wann ein Abschluss eher vorsichtig, eher realistisch oder bewusst verzerrt ist.\n\n---\n\n## 1. Bewertungsgrundsätze nach OR\n\n### 1.1 Das Vorsichtsprinzip als Leitprinzip\n\nDas Vorsichtsprinzip ist der zentrale Grundsatz der Bewertung nach schweizerischem Obligationenrecht (OR). Es wird durch zwei asymmetrische Regeln konkretisiert:\n\n- **Vermögen (Aktiven):** Dürfen **nicht zu hoch** ausgewiesen werden → **Höchstwertprinzip**\n- **Schulden (Passiven):** Dürfen **nicht zu tief** ausgewiesen werden → **Tiefstwertprinzip**\n\nDiese Logik schützt Gläubiger und verhindert, dass Vermögen und Gewinn überhöht dargestellt werden. Gleichzeitig verhindert das Gesetz, dass unrealistische Mehrwerte ausgewiesen und Gewinne vorweggenommen werden.\n\n### 1.2 Erst- und Folgebewertung\n\n| Bewertungszeitpunkt | Regel |\n|---|---|\n| **Erstbewertung** | Aktiven höchstens zu Anschaffungs- oder Herstellungskosten |\n| **Folgebewertung** | Prüfung, ob bisheriger Bilanzwert noch haltbar ist; notwendige Abschreibungen und Wertminderungen vornehmen |\n\nNach **Art. 960a OR** müssen materielle Anlagen sowie Waren- und Materialvorräte höchstens zu Anschaffungs- oder Herstellungskosten abzüglich notwendiger Abschreibungen ausgewiesen werden.\n\n### 1.3 Überblick: Bewertungsregeln nach Positionstyp\n\n| Bilanzposition | Bewertungsregel | Besonderheit |\n|---|---|---|\n| Waren- und Materialvorräte | Anschaffungs-/Herstellungskosten | Niederstwertprinzip zwingend |\n| Mobile Sachanlagen | Anlagekosten minus planmässige Abschreibung | Ausserplanmässige Abschreibung möglich |\n| Liegenschaften | Anlagekosten (inkl. wertvermehrender Kosten) | Abschreibung nur bei Wertminderung |\n| Börsenkotierte Aktiven | Anschaffungskosten oder Marktwert | Kursgewinne nicht erfolgswirksam |\n| Rückstellungen | Vollständige Passivierung wahrscheinlicher Verpflichtungen | Überhöhung = stille Reserve |\n\n---\n\n## 2. Bewertung einzelner Bilanzpositionen\n\n### 2.1 Waren- und Materialvorräte\n\n**Bewertungsgrundlage:** Einstandspreis = Anschaffungswert für Vorräte\n\n**Das Niederstwertprinzip** ist zwingend: Liegt der realisierbare Wert unter dem Einstandspreis, muss auf den tieferen Wert abgeschrieben werden.\n\n**Formel für realisierbaren Wert:**\n> Realisierbarer Wert = Erwarteter Verkaufspreis − Verkaufskosten\n\n**Buchungsbeispiel: Niederstwertabschreibung**\n\n*Ausgangslage:* 10 Computer zu CHF 900 Anschaffungskosten pro Gerät.\n- Erwarteter Verkaufspreis: CHF 810 pro Gerät\n- Verkaufskosten: CHF 70 pro Gerät\n- Realisierbarer Wert: CHF 740 pro Gerät\n\nDa CHF 740 < CHF 900 (Anschaffungskosten), muss auf CHF 740 abgewertet werden.\n\n| | CHF pro Gerät | CHF total (10 Stück) |\n|---|---|---|\n| Anschaffungskosten | 900 | 9'000 |\n| Realisierbarer Wert | 740 | 7'400 |\n| **Abwertungsbedarf** | **160** | **1'600** |\n\n**Buchungssatz:**\n\\`\\`\\`\nWarenaufwand (Abwertung)    1'600\n    an Warenvorrat               1'600\n\\`\\`\\"

### 2.2 Mobile Sachanlagen

**Anlagekosten** umfassen:
- Kaufpreis
- Transport und Beförderung
- Montage und Einrichtung
- Erstmalige Schulung (betriebsnotwendig)

**Buchungsbeispiel: Holzbearbeitungsanlage**

| Position | CHF |
|---|---|
| Kaufpreis | 116'000 |
| Beförderungskosten | 4'000 |
| **Anlagekosten (Erstbewertung)** | **120'000** |

- Nutzungsdauer: 8 Jahre
- Lineare Abschreibung: CHF 120'000 ÷ 8 = **CHF 15'000 pro Jahr**
- Buchwert nach Jahr 1: CHF 120'000 − CHF 15'000 = **CHF 105'000**

**Buchungssatz Abschreibung:**
\`\`\`
Abschreibungen Maschinen    15'000
    an Holzbearbeitungsanlage    15'000
\`\`\`

Sinkt der tatsächliche Wert stärker als planmässig vorgesehen, sind **ausserplanmässige Abschreibungen** nach Vorsichtsgesichtspunkten möglich oder nötig.

### 2.3 Liegenschaften

Bei Liegenschaften zählen zu den **Anlagekosten**:
- Kaufpreis
- Handänderungskosten (Notariatsgebühren, Grundbucheintrag, Handänderungssteuer)
- Wertvermehrende Sanierungen

**Nicht zu den Anlagekosten gehören:** Werterhaltende (nicht wertvermehrende) Unterhaltsaufwendungen − diese sind sofort als Aufwand zu verbuchen.

**Buchungsbeispiel: Liegenschaft**

| Position | CHF |
|---|---|
| Kaufpreis | 2'100'000 |
| Handänderungskosten | 45'000 |
| Wertvermehrende Sanierungen | 187'000 |
| **Anlagekosten total** | **2'332'000** |

Abschreibungen sind bei Liegenschaften **nicht in jedem Fall nötig** − der Bilanzwert kann dem Anschaffungswert entsprechen, sofern keine Wertminderung vorliegt.

**Buchungssatz Aktivierung:**
\`\`\`
Liegenschaft    2'332'000
    an Bank/Kasse            2'332'000
\`\`\`

### 2.4 Aktiven mit Börsenkurs oder beobachtbarem Marktpreis

Für bestimmte Aktiven erlaubt das OR eine Bewertung zum Marktpreis. Beispiele: börsenkotierte Aktien, Rohstoffe mit beobachtbarem Marktpreis.

**Wichtige Einschränkung:** Liegt der Marktwert über den Anschaffungskosten, darf der **Mehrwert nicht erfolgswirksam als Gewinn** verbucht werden.

**Buchungsbeispiel: Börsenkotierte Aktien**

| | CHF |
|---|---|
| 400 Aktien zu CHF 110 (Anschaffung) | 44'000 |
| Kurs am Bilanzstichtag: CHF 137 | 54'800 |
| Wertsteigerung | 10'800 |

Die Differenz von CHF 10'800 darf **nicht als Kursgewinn** in die Erfolgsrechnung gebucht werden. Der Mehrwert ist zwar in der Bilanz nachvollziehbar, aber nicht gewinnwirksam.

**Buchungsbeispiel: Kakaovorrat mit Börsenkurs**

Liegt der Börsenpreis über dem Anschaffungswert, darf höchstens der **Anschaffungswert** bilanziert werden.

---

## 3. Rückstellungen

### 3.1 Begriff und Funktion

**Rückstellungen** sind Passivpositionen für erwartete zukünftige Verpflichtungen oder Aufwände. Sie werden gebildet, wenn vor dem Bilanzstichtag Ereignisse eingetreten sind, die mit einer gewissen Wahrscheinlichkeit zu späteren Aufwendungen führen.

**Funktion:** Vorsichtige Erfassung von Risiken − der Gewinn wird schon im Jahr des Risikoeintritts gemindert, nicht erst bei tatsächlicher Zahlung.

### 3.2 Typische Anwendungsfälle

- Garantie- und Gewährleistungsfälle
- Drohende Prozesskosten
- Steuernachzahlungen
- Grosse Reparaturen
- Umstrukturierungskosten
- Ordentlicher oder ausserordentlicher Aufwand

### 3.3 Buchungssatz: Rückstellungsbildung

\`\`\`
Rückstellungsaufwand (Aufwandkonto)    [Betrag]
    an Rückstellungen (Passivkonto)           [Betrag]
\`\`\`

### 3.4 Rückstellungen als Quelle stiller Reserven

Rückstellungen können **stille Reserven erzeugen**, wenn sie höher dotiert sind als wirtschaftlich notwendig. Eine übervorsichtige Rückstellung ist eine klassische Quelle stiller Reserven.

---

## 4. Stille Reserven

### 4.1 Begriff und Definition

**Stille Reserven** sind verdeckte Differenzen zwischen dem intern realistischen Wert und dem extern vorsichtig ausgewiesenen Wert von Bilanzpositionen. Sie sind kein separater Bilanzposten, sondern eine unsichtbare Differenz.

> **Stille Reserve = Interner (realistischer) Wert − Externer (ausgewiesener) Bilanzwert**

### 4.2 Zwei Grundrichtungen der Entstehung

| Entstehungsweg | Mechanismus | Wirkung auf Bilanz |
|---|---|---|
| **Unterbewertung von Aktiven** | Vermögen wird tiefer bilanziert als wirtschaftlich gerechtfertigt | Aktiven zu tief → stille Reserve im Aktivum |
| **Überbewertung von Passiven** | Schulden/Rückstellungen werden höher bilanziert als notwendig | Fremdkapital zu hoch → stille Reserve im Passivum |

### 4.3 Konkrete Formen stiller Reserven

**Unterbewertung von Aktiven:**
- Zu tiefe Forderungswerte (überhöhtes Delkredere)
- Vorsichtige Vorratsbewertung (unter Einstandspreis)
- Überhöhte Abschreibungen auf Anlagevermögen (schneller als wirtschaftlich notwendig)

**Überbewertung von Passiven:**
- Überhöhte Verbindlichkeiten
- Nicht mehr notwendige Rückstellungen

### 4.4 Interne vs. externe Abschlüsse

Das Konzept der stillen Reserven schafft eine systematische Zweiteilung:

| Abschluss | Zweck | Adressaten | Bewertung |
|---|---|---|---|
| **Interne Bilanz & ER** | Realistische Führungsgrundlage | Geschäftsleitung, Controlling, Kalkulation | Wirtschaftlich realistische Werte |
| **Externe Bilanz & ER** | Publikation nach OR | Aktionäre, Staat, Öffentlichkeit, Gläubiger | Vorsichtig, zulässige Unterbewertungen |

Dieselbe Geschäftstätigkeit kann intern und extern unterschiedlich erscheinen − und das ist gesetzlich zulässig, solange die Grenzen des OR eingehalten werden.

---

## 5. Bildung stiller Reserven

### 5.1 Mechanismus

Werden stille Reserven aufgebaut, wirkt sich das im Jahr der Bildung **gewinnmindernd** aus:
- Unterbewertung von Aktiven → höherer Aufwand (z.B. Mehraufwand auf Warenvorrat)
- Überhöhte Abschreibungen → höhere Abschreibungsaufwände
- Überhöhte Rückstellungen → höherer Rückstellungsaufwand

**Ergebnis:** Tiefere Aktiven, höhere Passiven, **niedrigerer externer Reingewinn**

### 5.2 Buchungsbeispiel: Bildung stiller Reserven

*Ausgangslage (interne Sicht):*

| Bilanzposition | Interner Wert (CHF) |
|---|---|
| Warenvorrat | 100 |
| Anlagevermögen | 200 |
| Rückstellungen | 30 |
| Interner Reingewinn | 80 |

*Bildung stiller Reserven:*
- Warenvorrat wird um 20 unterbewertet
- Anlagevermögen wird um 20 unterbewertet
- Rückstellungen werden um 5 erhöht

| Position | Interne Sicht | Externe Sicht | Stille Reserve |
|---|---|---|---|
| Warenvorrat | 100 | 80 | 20 |
| Anlagevermögen | 200 | 180 | 20 |
| Rückstellungen | 30 | 35 | 5 |
| **Reingewinn** | **80** | **35** | **45** |

**Buchungssätze Bildung:**
\`\`\`
Warenaufwand / Mehraufwand Vorräte    20
    an Warenvorrat                         20

Abschreibungen Anlagevermögen         20
    an Anlagevermögen                      20

Rückstellungsaufwand                   5
    an Rückstellungen                       5
\`\`\`

---

## 6. Auflösung stiller Reserven

### 6.1 Mechanismus

Werden stille Reserven später aufgelöst, steigen die Bilanzwerte oder sinken die Passiven, und der **externe Reingewinn erhöht sich**:
- Unterbewertete Aktiven werden höher bilanziert → geringerer Aufwand oder Ertrag
- Überhöhte Rückstellungen werden aufgelöst → Rückstellungsertrag

**Ergebnis:** Höhere Aktiven, tiefere Passiven, **höherer externer Reingewinn**

### 6.2 Buchungsbeispiel: Auflösung stiller Reserven

*Auflösung in einem späteren Jahr:*
- Stille Reserve Warenvorrat: 10 wird aufgelöst
- Stille Reserve Anlagevermögen: 10 wird aufgelöst
- Stille Reserve Rückstellungen: 5 wird aufgelöst

| Position | Vor Auflösung | Nach Auflösung | Veränderung |
|---|---|---|---|
| Warenvorrat | 80 | 90 | +10 |
| Anlagevermögen | 180 | 190 | +10 |
| Rückstellungen | 35 | 30 | −5 |
| **Externer Reingewinn** | **35** | **60** | **+25** |

**Buchungssätze Auflösung:**
\`\`\`
Warenvorrat                        10
    an Warenertrag / Bestandskorrektur  10

Anlagevermögen                     10
    an Abschreibungsertrag               10

Rückstellungen                      5
    an Rückstellungsertrag               5
\`\`\`

### 6.3 Kritische Einordnung der Auflösung

> **Wichtig:** Eine Gewinnsteigerung durch Auflösung stiller Reserven ist **keine betriebliche Verbesserung**. Der operative Erfolg des Unternehmens hat sich nicht verbessert − es wurden lediglich frühere Unterbewertungen rückgängig gemacht.

Dies kann externe Adressaten (Aktionäre, Gläubiger, Analysten) täuschen, wenn die Auflösung nicht transparent offengelegt wird.

---

## 7. Informationspflicht im Anhang

### 7.1 Gesetzliche Anforderung

Grössere Auflösungen stiller Reserven müssen im **Anhang zur Jahresrechnung** erläutert werden. Andernfalls wäre der Leser über die wahre Gewinnentwicklung getäuscht.

### 7.2 Warum die Offenlegung wichtig ist

| Problem ohne Offenlegung | Konsequenz |
|---|---|
| Aktionäre interpretieren Gewinnsteigerung als operative Verbesserung | Falsche Erwartungen, ggf. überhöhte Dividendenerwartungen |
| Gläubiger überschätzen Kreditwürdigkeit | Fehlentscheidungen bei der Kreditvergabe |
| Zeitreihenvergleiche werden verzerrt | Jahresabschlüsse verschiedener Perioden nicht vergleichbar |
| Analysten ziehen falsche Schlüsse | Fehlbewertung des Unternehmens |

### 7.3 Grundsatz der Vergleichbarkeit

Stille Reserven beeinträchtigen die **Vergleichbarkeit** von Abschlüssen über die Zeit. Eine Jahresrechnung mit aufgelösten stillen Reserven ist nicht direkt mit der Vorjahresrechnung vergleichbar, wenn die Auflösung nicht transparent kommuniziert wird.

---

## 8. Steuerliche Aspekte und Bilanzpolitik

### 8.1 Stille Reserven als Steuersparmittel

Das schweizerische Steuerrecht lässt in wirtschaftlich guten Zeiten **beschleunigte Abschreibungen** zu. Dies ist eine Form der stillen Reservenbildung mit steuerlicher Wirkung:

- **Kurzfristig:** Tieferer steuerbarer Gewinn → weniger Steuern
- **Langfristig:** Geringere künftige Abschreibungsmöglichkeiten oder Auflösungsrisiko

### 8.2 Verbindung von Bilanzpolitik und Ergebnissteuerung

Stille Reserven verbinden mehrere Unternehmensziele:

| Ziel | Instrument |
|---|---|
| **Gläubigerschutz** | Vorsichtige Bewertung, tiefe Aktiven |
| **Steuerplanung** | Gewinnminderung durch Bildung stiller Reserven |
| **Gewinnglättung** | Auflösung in schlechten Jahren, Bildung in guten Jahren |
| **Dividendenpolitik** | Kontrolle des ausgewiesenen Reingewinns |

### 8.3 Grenzen der Bilanzpolitik

Der zulässige Bewertungsspielraum endet dort, wo aus Vorsicht gezielte Ergebnissteuerung wird. Das OR setzt Grenzen; bei grossen Unternehmen gelten zusätzlich strengere Offenlegungspflichten.

---

## 9. OR-Vorschriften im Überblick

### 9.1 Massgebliche Gesetzesartikel

| Artikel | Inhalt |
|---|---|
| **Art. 960 OR** | Allgemeine Grundsätze der Bewertung |
| **Art. 960a OR** | Bewertung von Aktiven: Höchstwert = Anschaffungs-/Herstellungskosten |
| **Art. 960b OR** | Bewertung von Aktiven mit Börsenkurs oder beobachtbarem Marktpreis |
| **Art. 960e OR** | Rückstellungen: Passivierungspflicht bei wahrscheinlichen Verpflichtungen |

### 9.2 Internationale Standards im Vergleich

| Standard | Orientierung | Stille Reserven |
|---|---|---|
| **OR (Schweiz)** | Vorsichtsorientiert | Zulässig und verbreitet |
| **Swiss GAAP FER** | Realitätsnäher als OR | Eingeschränkt |
| **IFRS** | True and Fair View | Weitgehend unzulässig |
| **US-GAAP** | True and Fair View | Weitgehend unzulässig |

Der Gegensatz zwischen OR-Vorsicht und dem «true and fair view» internationaler Standards ist ein grundlegendes Spannungsfeld der Rechnungslegung.

---

## 10. Wichtige Begriffe und Definitionen

| Begriff | Definition |
|---|---|
| **Bewertung** | Wertmässige Festlegung einer Bilanzposition in Franken |
| **Anschaffungswert** | Bezahlter Kaufpreis inkl. direkt zurechenbarer Anschaffungsnebenkosten |
| **Einstandspreis** | Anschaffungswert im Zusammenhang mit Waren- und Materialvorräten |
| **Anlagekosten** | Anschaffungswert einer Sachanlage inkl. wertvermehrender Nebenkosten |
| **Buchwert** | Wert einer Bilanzposition am Bilanzstichtag nach Abschreibungen |
| **Fortführungswert** | Wert eines Vermögensgegenstands bei weiterer betrieblicher Nutzung |
| **Liquidationswert** | Verkaufserlös bei Veräusserung oder Liquidation |
| **Niederstwertprinzip** | Bilanzierung zum tieferen Wert, wenn realisierbarer Wert < Buchwert |
| **Rückstellung** | Passivposition für erwartete zukünftige Verpflichtungen oder Aufwände |
| **Stille Reserve** | Verdeckte Differenz zwischen intern realistischem und extern ausgewiesenem Wert |
| **Interne Bilanz** | Realistische Darstellung für Führungszwecke |
| **Externe Bilanz** | Vorsichtiger, veröffentlichungsfähiger Abschluss nach OR |
| **Vorsichtsprinzip** | Grundsatz: Aktiven nicht zu hoch, Passiven nicht zu tief bewerten |
| **Höchstwertprinzip** | Aktiven dürfen nicht über Anschaffungskosten bewertet werden |
| **Tiefstwertprinzip** | Passiven dürfen nicht unter dem wirtschaftlich notwendigen Wert angesetzt werden |

---

## 11. Buchungsbeispiele Gesamtübersicht

### 11.1 Niederstwertabschreibung auf Vorräte

**Situation:** Computerbestand, Anschaffungskosten übersteigen realisierbaren Wert.

\`\`\`
Warenaufwand / Abwertung Vorräte   [Differenz]
    an Warenvorrat                       [Differenz]
\`\`\`

### 11.2 Aktivierung einer Sachanlage

\`\`\`
Maschinen / Anlagen                [Anlagekosten]
    an Bank / Kreditoren               [Anlagekosten]
\`\`\`

### 11.3 Planmässige Abschreibung

\`\`\`
Abschreibungen                     [Jahresbetrag]
    an Maschinen / Anlagen             [Jahresbetrag]
\`\`\`

### 11.4 Aktivierung einer Liegenschaft

\`\`\`
Liegenschaften                     [Anlagekosten total]
    an Bank / Hypothek                 [Anlagekosten total]
\`\`\`

### 11.5 Bildung einer Rückstellung

\`\`\`
Rückstellungsaufwand               [Betrag]
    an Rückstellungen                  [Betrag]
\`\`\`

### 11.6 Auflösung einer Rückstellung

\`\`\`
Rückstellungen                     [Betrag]
    an Rückstellungsertrag             [Betrag]
\`\`\`

### 11.7 Bildung stiller Reserve (Unterbewertung Vorrat)

\`\`\`
Warenaufwand                       [stille Reserve Betrag]
    an Warenvorrat                     [stille Reserve Betrag]
\`\`\`

### 11.8 Auflösung stiller Reserve (Vorrat)

\`\`\`
Warenvorrat                        [Auflösungsbetrag]
    an Warenertrag                     [Auflösungsbetrag]
\`\`\`

---

## 12. Kernaussagen

1. Bewertungen bestimmen die Höhe aller Bilanzpositionen und beeinflussen direkt Aufwand, Ertrag und Reingewinn.
2. Nach OR gilt für Vermögen ein Höchstwert- und für Schulden ein Tiefstwertansatz − das Vorsichtsprinzip.
3. Aktiven werden bei der Erstbewertung grundsätzlich zu Anschaffungs- oder Herstellungskosten angesetzt.
4. In der Folgebewertung müssen notwendige Abschreibungen und Wertminderungen berücksichtigt werden.
5. Waren- und Materialvorräte unterliegen dem **Niederstwertprinzip** − immer zum tieferen Wert bilanzieren.
6. Mobile Sachanlagen werden über ihre Nutzungsdauer abgeschrieben; Liegenschaften nur bei Wertminderung.
7. Börsenkotierte oder beobachtbare Marktpreise dürfen berücksichtigt werden, aber Mehrwerte über Anschaffungskosten sind **nicht erfolgswirksam**.
8. Rückstellungen dienen der vorsichtigen Erfassung zukünftiger Belastungen und können stille Reserven erzeugen.
9. Stille Reserven entstehen durch **Unterbewertung von Vermögen** oder **Überbewertung von Fremdkapital**.
10. Interne Abschlüsse sollen realistisch, externe Abschlüsse vorsichtig sein.
11. Die Bildung stiller Reserven **senkt** den externen Gewinn; ihre Auflösung **erhöht** ihn.
12. Grössere Auflösungen stiller Reserven **müssen im Anhang** erläutert werden.
13. Stille Reserven verbessern kurzfristig Gläubigerschutz und Steuerplanung, vermindern aber Transparenz und Vergleichbarkeit.
14. Bewertungsfragen sind nicht nur Technik, sondern auch **Bilanzpolitik und Informationspolitik**.

---

## 13. Lernfragen

1. Warum führt das Vorsichtsprinzip bei Aktiven zu einem Höchstwert- und bei Passiven zu einem Tiefstwertansatz?
2. Erkläre den Unterschied zwischen Anschaffungswert, Buchwert, Fortführungswert und Liquidationswert.
3. Warum genügt bei Vorräten der Anschaffungswert nicht immer als Bilanzwert?
4. Unter welchen Bedingungen darf ein beobachtbarer Marktpreis bilanziell berücksichtigt werden?
5. Weshalb darf ein Marktwert über dem Anschaffungswert nicht automatisch als Gewinn verbucht werden?
6. Wie unterscheiden sich interne und externe Bilanz bzw. Erfolgsrechnung funktional?
7. Auf welche zwei Grundarten können stille Reserven entstehen?
8. Warum senkt die Bildung stiller Reserven den externen Reingewinn?
9. Warum erhöht die Auflösung stiller Reserven den Gewinn, ohne dass die operative Leistung besser sein muss?
10. Welche Informationsprobleme entstehen, wenn Auflösungen stiller Reserven nicht transparent offengelegt werden?
11. Wie hängen Bewertung, Gläubigerschutz und Dividendenpolitik zusammen?
12. Inwiefern ist die Zulassung stiller Reserven ein Spannungsfeld zwischen «true and fair view» und vorsichtiger Rechnungslegung?

---

## 14. Verbindungen zu anderen Themen

- **Abschreibungen:** Die Bewertung von Sachanlagen baut direkt auf Abschreibungsregeln auf; überhöhte Abschreibungen bilden stille Reserven.
- **Rückstellungen und Delkredere:** Übervorsichtige Rückstellungen und Delkredere sind klassische Quellen stiller Reserven.
- **Jahresabschluss:** Bewertungen bestimmen die Aussagekraft von Bilanz und Erfolgsrechnung.
- **Bilanzanalyse:** Wer stille Reserven nicht erkennt, interpretiert Bilanzrelationen und Gewinne möglicherweise falsch.
- **Steuerrecht:** Bewertungsspielräume beeinflussen steuerbare Gewinne; beschleunigte Abschreibungen als Steuerinstrument.
- **Internationale Standards (IFRS/US-GAAP/Swiss GAAP FER):** OR-Vorsicht vs. «true and fair view».`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  const result = await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = ANY($2::uuid[])`,
    [SUMMARY, [
      'd8391498-16ad-4191-9d67-f931c0b0aa1d',
      '686e7828-7a6f-44c5-ae9f-ad28b2b86668',
      'efefdb24-9559-4437-8b9a-6e60f1b56342'
    ]]
  )
  console.log(`Updated ${result.rowCount} bewertungsvorschriften chapters`)
  console.log(`Summary length: ${SUMMARY.length} characters`)
  await client.end()
}
main().catch(console.error)
