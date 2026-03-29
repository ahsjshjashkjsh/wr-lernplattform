import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const SUMMARY_EU = `## Einzelunternehmen – Gründung, Eigenkapital, Privatkonto und Unternehmereinkommen

Das Einzelunternehmen ist die typische Rechtsform für kleine, persönlich geführte Betriebe. Es wird von einer natürlichen Person getragen. Unternehmen und Inhaberin bilden keine getrennten Rechtssubjekte – die enge Verbindung zwischen Person und Betrieb prägt die gesamte buchhalterische Logik dieser Rechtsform.

---

## 1. Überblick und Merkmale

### Wer kann ein Einzelunternehmen gründen?

Ein Einzelunternehmen wird von **einer natürlichen Person** gegründet und geführt. Es entsteht mit der Aufnahme der Geschäftstätigkeit – ohne Gesellschaftsvertrag, ohne Gründungsakt vor Notar.

### Wesentliche Merkmale

| Merkmal | Ausprägung |
|---|---|
| Rechtsträger | Natürliche Person (Inhaberin / Inhaber) |
| Mindestkapital | Keines gesetzlich vorgeschrieben |
| Haftung | **Unbeschränkt** – mit Geschäfts- und Privatvermögen |
| Geschäftsführung | Allein durch die Inhaberin / den Inhaber |
| Gewinn und Verlust | Gehören vollständig der Inhaberin / dem Inhaber |
| Steuern | Gewinn und Eigenkapital werden in der privaten Steuererklärung versteuert |
| Handelsregisterpflicht | Ab CHF 100'000 Jahresumsatz im Handels- und Gewerbebereich |
| Firma | Muss den Familiennamen der Inhaberin / des Inhabers enthalten |

### Geeignet für…

Das Einzelunternehmen eignet sich besonders für **kleine Betriebe**, bei denen persönlicher Einsatz im Vordergrund steht und das Geschäftsrisiko überschaubar ist. Die enge Verbindung zwischen Unternehmen und Person ist Stärke und Risiko zugleich: Die Inhaberin profitiert direkt vom Erfolg, haftet aber auch direkt für Verluste – ohne jede Begrenzung auf das Geschäftsvermögen.

### Verhältnis Inhaberin – Unternehmen

Die Inhaberin steht dem Unternehmen in drei Rollen gegenüber:

- **Als Kapitalgeberin**: Sie stellt dem Unternehmen Eigenmittel zur Verfügung.
- **Als Arbeitskraft**: Sie erbringt Arbeitsleistung für das Unternehmen.
- **Als Empfängerin des Gewinns**: Sie erhält den gesamten Gewinn des Unternehmens.

Wirtschaftlich erhält sie dafür Eigenlohn (für die Arbeit), Eigenzins (für das eingesetzte Kapital) und den verbleibenden Reingewinn.

---

## 2. Kapitalbedarfsplanung

Vor der Gründung muss der **Kapitalbedarf** geplant werden. Die Kapitalbedarfsplanung unterscheidet klar zwischen der **Verwendung der Mittel** (Investitionen) und der **Herkunft der Mittel** (Finanzierung).

### Verwendungsseite – Investitionen

Was braucht das Unternehmen?

- Werkzeuge, Einrichtungen Werkstatt
- Mobiliar und Büroeinrichtung
- Fahrzeuge
- Informatik und Kommunikationsmittel
- Vorräte (Waren, Material)
- Flüssige Mittel / Kassenpuffer

### Herkunftsseite – Finanzierung

Woher kommt das Kapital?

- **Eigenmittel / Eigenkapital** der Inhaberin
- Bankkredit / Kontokorrentkredit
- Passivdarlehen (z. B. von Privatpersonen)
- Lieferantenkredite

> **Grundsatz:** Jede Investition muss durch eine Finanzierungsquelle gedeckt sein. Herkunft = Verwendung.

---

## 3. Verbuchung der Gründung

Die Gründung wird buchhalterisch Schritt für Schritt erfasst. Typische Anfangsgeschäfte:

### Schritt 1: Kapitaleinlage der Inhaberin

Die Inhaberin überweist private Mittel auf das Bankkonto des Unternehmens.

**Buchungssatz:**
```
Bank / Eigenkapital
```

### Schritt 2: Aufnahme eines Passivdarlehens

Das Unternehmen nimmt ein Darlehen auf (z. B. von einer Privatperson).

**Buchungssatz:**
```
Bank / Passivdarlehen
```

### Schritt 3: Kauf betrieblicher Anlagen

Mit den aufgenommenen Mitteln werden Einrichtungen, Fahrzeuge, Büromobiliar usw. gekauft.

**Buchungssätze (Beispiele):**
```
Einrichtungen Werkstatt / Bank
Fahrzeuge / Bank
Büromobiliar / Bank
```

### Gründungsbilanz

Nach diesen Anfangsgeschäften entsteht die **Gründungsbilanz**. Sie zeigt:
- Welche Vermögenswerte das Unternehmen besitzt (Aktiven)
- Wie diese Vermögenswerte finanziert sind (Eigen- und Fremdkapital)

Die Gründungsbilanz ist die Ausgangsbasis für die laufende Buchführung.

**Beispiel Gründungsbilanz (vereinfacht):**

| Aktiven | CHF | Passiven | CHF |
|---|---|---|---|
| Bank | 40'000 | Passivdarlehen | 30'000 |
| Einrichtungen | 25'000 | Eigenkapital | 55'000 |
| Fahrzeuge | 15'000 | | |
| Büromobiliar | 5'000 | | |
| **Total** | **85'000** | **Total** | **85'000** |

---

## 4. Das Konto Eigenkapital

### Funktion und Logik

Das **Eigenkapital** ist aus Sicht des Unternehmens eine Schuld gegenüber der Eigentümerin. Es zeigt den Anspruch der Inhaberin auf das **Reinvermögen** des Unternehmens (Aktiven minus Fremdkapital).

Das Eigenkapitalkonto ist ein **Passivkonto**:
- Zunahmen werden im **Haben** erfasst
- Abnahmen werden im **Soll** erfasst

### Bewegungen auf dem Eigenkapitalkonto

**Zunahmen (Haben):**
- Kapitaleinlagen der Inhaberin
- Jahresgewinn (am Jahresende)
- Habensaldo des Privatkontos (am Jahresende)

**Abnahmen (Soll):**
- Kapitalrückzüge der Inhaberin
- Jahresverlust (am Jahresende)
- Sollsaldo des Privatkontos (am Jahresende)

### Abschluss des Privatkontos über Eigenkapital

Am Jahresende wird das Privatkonto **über das Eigenkapitalkonto abgeschlossen**:

- **Sollsaldo Privat** (Bezüge überwiegen) → vermindert das Eigenkapital:
  ```
  Eigenkapital / Privat
  ```
- **Habensaldo Privat** (Gutschriften überwiegen) → erhöht das Eigenkapital:
  ```
  Privat / Eigenkapital
  ```

---

## 5. Das Konto Privat

### Funktion und Logik

Das **Privatkonto** ist ein Unterkonto des Eigenkapitals. Es dient dazu, private Bezüge und Gutschriften der Inhaberin während des Jahres **getrennt von den Geschäftsvorgängen** zu erfassen.

Das Privatkonto hat keinen dauerhaften Saldo – es wird am Jahresende über das Eigenkapital abgeschlossen.

### Buchungen im Soll (Privatbezüge)

| Vorgang | Buchungssatz |
|---|---|
| Geldbezug bar oder per Bank | Privat / Kasse oder Bank |
| Warenbezug aus dem Unternehmen | Privat / Warenaufwand (oder Warenbestand) |
| Private Rechnung durch Unternehmen bezahlt | Privat / Bank |
| Privatanteil Fahrzeugaufwand | Privat / Fahrzeugaufwand |
| Privatanteil Telefonkosten | Privat / Kommunikationsaufwand |

### Buchungen im Haben (Gutschriften an die Inhaberin)

| Vorgang | Buchungssatz |
|---|---|
| Eigenlohn (kalkulatorisch) | Lohnaufwand / Privat |
| Eigenzins (kalkulatorisch) | Zinsaufwand / Privat |

### Jahresabschluss

Am Jahresende wird der Saldo des Privatkontos auf das Eigenkapital übertragen.

---

## 6. Unternehmereinkommen

### Was ist das Unternehmereinkommen?

Das Unternehmereinkommen ist der **wirtschaftliche Gesamtertrag der Inhaberin** aus dem Einzelunternehmen. Es ist nicht mit dem Jahresgewinn allein gleichzusetzen, sondern umfasst drei Komponenten:

| Komponente | Bedeutung |
|---|---|
| **Eigenlohn** | Kalkulatorische Entschädigung für die eigene Arbeitsleistung |
| **Eigenzins** | Kalkulatorische Verzinsung des eingesetzten Eigenkapitals |
| **Reingewinn** | Buchhalterisches Unternehmensergebnis (Jahresgewinn) |

**Unternehmereinkommen = Eigenlohn + Eigenzins + Reingewinn**

### Warum diese Aufgliederung?

Ein Angestellter erhält Lohn für seine Arbeit. Die Inhaberin eines Einzelunternehmens erhält keinen separaten Lohn. Deshalb wird der Eigenlohn als **kalkulatorische Grösse** ausgewiesen – er zeigt, was die Arbeit der Inhaberin wirtschaftlich wert ist.

Dasselbe gilt für den Eigenzins: Das Eigenkapital hätte alternativ zinsbringend angelegt werden können. Der Eigenzins macht diesen entgangenen Ertrag sichtbar.

Erst nach Abzug von Eigenlohn und Eigenzins zeigt der Reingewinn, wie viel das Unternehmen über diese Mindestvergütungen hinaus erwirtschaftet hat.

### Steuerliche Relevanz

Das gesamte Unternehmereinkommen gilt als **steuerbares Einkommen** der Inhaberin. Eigenkapital und Unternehmensvermögen werden im Vermögen der Inhaberin versteuert. AHV-Beiträge werden auf Basis des Unternehmereinkommens berechnet.

---

## 7. Warenbezüge

### Was ist ein Warenbezug?

Ein **Warenbezug** liegt vor, wenn die Inhaberin Waren aus dem Unternehmen für private Zwecke entnimmt. In diesem Fall darf der betriebliche Warenaufwand nicht zu hoch ausgewiesen bleiben.

### Buchung des Warenbezugs

Die private Entnahme wird über das Privatkonto erfasst:

```
Privat / Warenaufwand  (zu Einstandspreisen)
```

Dadurch wird der Warenaufwand korrigiert: Er sinkt um den Wert der entnommenen Waren, und das Privatkonto belastet die Inhaberin mit dem entnommenen Betrag.

### MWST-Aspekt: Vorsteuerkorrektur

Wenn das Unternehmen MWST-pflichtig ist, wurde beim Kauf der Waren Vorsteuer geltend gemacht. Werden Waren privat verbraucht, muss diese Vorsteuer korrigiert werden, da private Nutzung nicht als vorsteuerberechtigt gilt.

**Buchung der Vorsteuerkorrektur:**
```
Privat / Vorsteuer  (anteiliger Vorsteuerbetrag)
```

---

## 8. Privatanteile

### Was sind Privatanteile?

**Privatanteile** entstehen, wenn betriebliche Aufwände oder Vermögenswerte teilweise privat genutzt werden. Die private Nutzung muss vom betrieblichen Aufwand abgetrennt werden, damit der Gewinn korrekt ausgewiesen wird.

### Privatanteil Fahrzeug

Das Geschäftsfahrzeug wird sowohl geschäftlich als auch privat genutzt. Der Privatanteil wird häufig **pauschal** berechnet – üblicherweise als Prozentsatz des Fahrzeugkaufpreises pro Monat.

**Buchung Privatanteil Fahrzeugaufwand:**
```
Privat / Fahrzeugaufwand
```

Gleichzeitig ist eine **Vorsteuerkorrektur** auf dem privat genutzten Anteil vorzunehmen.

### Privatanteil Kommunikation

Bei Telefon, Festnetz und Handy, die sowohl geschäftlich als auch privat genutzt werden, ist ebenfalls ein Privatanteil zu ermitteln und zu verbuchen.

**Buchung:**
```
Privat / Kommunikationsaufwand
```

### Vorsteuerkorrektur bei Privatanteilen

Bei MWST-pflichtigen Unternehmen muss für private Nutzungsanteile eine Vorsteuerkorrektur vorgenommen werden. Bei wenig detaillierten Kostenaufstellungen kann eine **pauschale Vorsteuerkorrektur** angewendet werden.

---

## 9. Buchungsübersicht Privatvorgänge

| Vorgang | Soll | Haben |
|---|---|---|
| Geldbezug bar | Privat | Kasse |
| Geldbezug per Bank | Privat | Bank |
| Warenbezug (Einstandspreis) | Privat | Warenaufwand |
| Private Rechnung über Unternehmen bezahlt | Privat | Bank |
| Privatanteil Fahrzeug | Privat | Fahrzeugaufwand |
| Privatanteil Kommunikation | Privat | Kommunikationsaufwand |
| Vorsteuerkorrektur | Privat | Vorsteuer |
| Eigenlohn (kalkulatorisch) | Lohnaufwand | Privat |
| Eigenzins (kalkulatorisch) | Zinsaufwand | Privat |
| Jahresabschluss (Sollsaldo) | Eigenkapital | Privat |
| Jahresabschluss (Habensaldo) | Privat | Eigenkapital |

---

## 10. Struktur und Logik des Kapitels

Das Kapitel folgt dem Lebenszyklus eines kleinen Betriebs:

1. **Rechtsform verstehen** – Merkmale, Haftung, Handelsregisterpflicht
2. **Gründung planen** – Kapitalbedarfsplanung: Was brauche ich, woher kommt das Kapital?
3. **Gründung verbuchen** – Einlagen, Darlehen, Anschaffungen → Gründungsbilanz
4. **Laufende Buchführung** – Eigenkapital und Privatkonto als Kernkonten
5. **Unternehmereinkommen ermitteln** – Eigenlohn + Eigenzins + Reingewinn
6. **Private Nutzung korrekt erfassen** – Warenbezüge und Privatanteile

**Wiederkehrendes Grundprinzip:** Private Nutzung von Unternehmensressourcen muss vom betrieblichen Bereich getrennt werden. Wird das nicht gemacht, ist der Aufwand zu hoch, der Gewinn zu tief und die Steuer zu niedrig.

---

## 11. Kernaussagen für die Prüfung

- Das Einzelunternehmen ist die Rechtsform für natürliche Personen – kein Mindestkapital, keine Haftungsbeschränkung.
- Die Inhaberin haftet **unbeschränkt** mit dem gesamten Vermögen (geschäftlich und privat).
- Ab CHF 100'000 Jahresumsatz besteht Handelsregisterpflicht; die Firma muss den Familiennamen enthalten.
- Das Konto **Eigenkapital** zeigt den Anspruch der Inhaberin auf das Reinvermögen (Passivkonto).
- Das Konto **Privat** ist ein Unterkonto des Eigenkapitals und wird am Jahresende über das Eigenkapital abgeschlossen.
- **Unternehmereinkommen = Eigenlohn + Eigenzins + Reingewinn** – nicht nur der buchhalterische Jahresgewinn.
- Warenbezüge und Privatanteile müssen verbucht werden, damit Aufwand, Gewinn und Steuern korrekt sind.
- Bei MWST-pflichtigen Unternehmen führen Privatanteile und Warenbezüge zu **Vorsteuerkorrekturen**.
- Die Kapitalbedarfsplanung trennt klar zwischen **Verwendung der Mittel** (Investitionen) und **Herkunft der Mittel** (Finanzierung).

---

## 12. Prüfungsfragen mit Lösungshinweisen

**Warum wird Eigenkapital als Schuld des Unternehmens betrachtet?**
Weil das Unternehmen buchhalterisch als eigenständige Einheit gilt. Das Eigenkapital zeigt, was das Unternehmen der Eigentümerin schuldet – nämlich das gesamte Reinvermögen.

**Warum ist das Privatkonto notwendig?**
Um private und geschäftliche Vorgänge sauber zu trennen. Ohne Privatkonto würden private Bezüge direkt den Aufwand oder die Aktiven verzerren.

**Was ist der Unterschied zwischen Eigenlohn und Reingewinn?**
Der Eigenlohn ist eine kalkulatorische Grösse für die Arbeitsleistung der Inhaberin. Der Reingewinn ist das buchhalterische Ergebnis, das nach allen Aufwänden (inkl. kalkulatorischer Grössen) verbleibt. Der Eigenlohn zeigt, was die Arbeit wert ist; der Reingewinn zeigt, was das Unternehmen zusätzlich erwirtschaftet.

**Warum darf privater Fahrzeuggebrauch nicht im Geschäftsaufwand verbleiben?**
Weil sonst der betriebliche Aufwand zu hoch und der Gewinn zu tief ausgewiesen würde. Steuerlich würde die Inhaberin zu wenig Steuern zahlen.
`

const SUMMARY_AG = `## Aktiengesellschaft (AG) – Gründung, Gewinnverwendung, Verlustverarbeitung und Kapitalerhöhung

Die Aktiengesellschaft ist eine juristische Person mit eigenem Vermögen, eigener Steuerpflicht und klar gegliedertem Eigenkapital. Sie eignet sich besonders für grössere Unternehmen, für kapitalintensive Vorhaben und für Situationen, in denen mehrere Personen Kapital einbringen und dabei ihre persönliche Haftung beschränken wollen.

---

## 1. Überblick und Merkmale

### Was ist eine AG?

Die **Aktiengesellschaft** ist eine Kapitalgesellschaft und juristische Person. Das Eigenkapital ist in **Aktien** zerlegt. Eigentümer der AG sind die **Aktionäre**. Die AG ist von ihren Aktionären rechtlich vollständig getrennt: Sie hat eigenes Vermögen, eigene Rechte und Pflichten.

### Wesentliche Merkmale

| Merkmal | Ausprägung |
|---|---|
| Rechtsträger | Juristische Person |
| Mindestkapital | CHF 100'000 (Aktienkapital) |
| Mindest-Einzahlung | Mindestens 20 %, aber mindestens CHF 50'000 |
| Haftung | **Beschränkt** – nur das Gesellschaftsvermögen haftet |
| Aktionäre | Persönlich keine Haftung für Gesellschaftsschulden |
| Geschäftsführung | Verwaltungsrat |
| Steuern | AG versteuert Gewinn und Eigenkapital selbst |
| Entstehung | Mit Eintrag im **Handelsregister** |
| Firma | Muss den Zusatz **„AG"** tragen; schweizweit eindeutig |

### Rechte der Aktionäre

Aktionäre haben zwei Arten von Rechten:

**Vermögensrechte:**
- Anspruch auf **Dividende** (Gewinnausschüttung)
- **Bezugsrecht** bei Ausgabe neuer Aktien

**Mitgliedschaftsrechte:**
- Teilnahme an der **Generalversammlung**
- **Stimm- und Wahlrecht**
- **Auskunftsrecht**

### Warum AG statt Einzelunternehmen?

Das Einführungsbeispiel (Sabine Hofer, Malergeschäft) zeigt die typische Ausgangslage: Das Unternehmen wächst, benötigt mehr Eigenkapital, und die Inhaberin möchte ihre Haftung beschränken. Gleichzeitig sollen sich Mitarbeitende beteiligen können. Lösung: Umwandlung in eine AG.

---

## 2. Voraussetzungen der Gründung

Für die Gründung einer AG gelten folgende Schritte und Anforderungen:

1. **Statuten** erstellen und öffentlich beurkunden lassen
2. Einzahlungen auf ein **Sperrkonto** bei einer Bank leisten
3. **Verwaltungsrat** und **Revisionsstelle** bestimmen
4. Eintrag ins **Handelsregister** – erst dann entsteht die AG rechtlich

---

## 3. Gründungsverbuchung

### Das zentrale Konto: Forderungen gegenüber Aktionären

Die Gründung wird nicht direkt über die Bank oder Sachanlagen gebucht, sondern immer **über das Konto „Forderungen gegenüber Aktionären"** abgewickelt. Dieses Konto verbindet die rechtliche Zeichnung von Aktien mit der wirtschaftlichen Kapitalzufuhr.

**Logik:**
1. Aktionäre zeichnen Aktien → AG erhält eine Forderung
2. Aktionäre erfüllen die Einlage (bar oder durch Sacheinlage) → Forderung wird ausgeglichen
3. Nach Abschluss aller Gründungsbuchungen: **Saldo Forderungen gegenüber Aktionären = 0**

### Schritt 1: Kapitalzeichnung

Alle Aktionäre zeichnen Aktien. Das gesamte Aktienkapital wird erfasst.

**Buchungssatz:**
```
Forderungen gegenüber Aktionären / Aktienkapital  200'000
```

### Schritt 2a: Bareinlagen

Aktionäre, die ihr Kapital bar einzahlen, tun dies auf das Bankkonto.

**Buchungssatz:**
```
Bank / Forderungen gegenüber Aktionären  100'000
```

### Schritt 2b: Sacheinlage

Ein Aktionär bringt ein bestehendes Unternehmen ein (z. B. Sabine Hofer bringt ihr Einzelunternehmen ein). Die Aktiven und Passiven des Einzelunternehmens werden einzeln in die AG-Bücher übernommen.

**Buchungen Sacheinlage (Beispiel):**
```
Kasse              /  Forderungen gegenüber Aktionären
Bank               /  Forderungen gegenüber Aktionären
Forderungen L+L    /  Forderungen gegenüber Aktionären
Betriebseinrichtungen / Forderungen gegenüber Aktionären
Mobiliar           /  Forderungen gegenüber Aktionären
Fahrzeuge          /  Forderungen gegenüber Aktionären
```

**Übernommene Schulden** vermindern den offenen Betrag der Zeichnung:
```
Forderungen gegenüber Aktionären  /  Verbindlichkeiten L+L
Forderungen gegenüber Aktionären  /  Passivdarlehen
```

Der verbleibende Restbetrag wird bar auf das Bankkonto eingezahlt.

### Sacheinlagen: Besonderheiten

Sacheinlagen erfordern eine **besondere Prüfungsbestätigung** der Revisionsstelle. Das Konto „Forderungen gegenüber Aktionären" wird dabei besonders empfohlen, weil es alle Einbringungsvorgänge transparent macht.

### Gründungsbilanz (Beispiel Hofer Malergeschäft AG)

| Aktiven | CHF | Passiven | CHF |
|---|---|---|---|
| Kasse | 2'000 | Verbindlichkeiten L+L | 33'600 |
| Bank | 121'600 | Passivdarlehen | 40'000 |
| Forderungen L+L | 18'000 | **Aktienkapital** | **200'000** |
| Betriebseinrichtungen | 60'000 | | |
| Mobiliar | 12'000 | | |
| Fahrzeuge | 60'000 | | |
| **Total** | **273'600** | **Total** | **273'600** |

---

## 4. Eigenkapitalstruktur der AG

Die AG weist ihr Eigenkapital nicht als einheitlichen Block aus, sondern gegliedert in mehrere Unterkonten:

| Konto | Bedeutung | Bemerkung |
|---|---|---|
| **Aktienkapital** | Nominell festgelegtes Grundkapital (Nennwert der Aktien) | Statutarisch fixiert |
| **Gesetzliche Kapitalreserve** | Agio und ähnliche Einlagen über den Nennwert | Entsteht bei Kapitalerhöhung mit Aufpreis |
| **Gesetzliche Gewinnreserve** | Einbehaltene Gewinne mit gesetzlicher Bindung | Aus Gewinnverwendung gebildet |
| **Freiwillige Gewinnreserve** | Zusätzliche, beschlossene Rücklagen | Durch Generalversammlungsbeschluss |
| **Gewinnvortrag** | Noch nicht verteilter Gewinnrest aus Vorjahren | Schnittstelle zwischen Perioden |
| **Jahresgewinn / Jahresverlust** | Ergebnis der laufenden Periode | Ausgangspunkt der Gewinnverwendung |

Sonderposten: **Nicht einbezahltes Aktienkapital** – formal ein Aktivkonto (ausstehende Einlagen), wirtschaftlich eine Korrektur des Eigenkapitals.

---

## 5. Zeitlicher Ablauf: Abschluss und Gewinnverwendung

Die Gewinnverwendung ist ein **rechtlich und zeitlich vom Jahresabschluss getrennter Schritt**:

```
Abschlusstermin (31.12.)
    ↓
Jahresabschluss erstellen (Bilanz, Erfolgsrechnung, Anhang)
    ↓
Revision (durch Revisionsstelle)
    ↓
Generalversammlung (innert 6 Monaten nach Abschluss)
    ↓
Beschluss über Gewinnverwendung
    ↓
Verbuchung der Gewinnverwendung
```

> Wichtig: Die Dividende wird erst nach dem Generalversammlungsbeschluss verbucht – nicht bereits im Jahresabschluss selbst.

---

## 6. Gewinnverwendung

### Gewinnverteilungsplan

Das Schema der Gewinnverwendung:

| Position | CHF |
|---|---|
| Gewinnvortrag (Anfangsbestand) | + |
| Jahresgewinn | + |
| **= Bilanzgewinn** | = |
| − Zuweisung an gesetzliche Gewinnreserve | − |
| − Zuweisung an freiwillige Gewinnreserve | − |
| − Dividende | − |
| **= Neuer Gewinnvortrag** | = |

> Der Bilanzgewinn (nicht der Jahresgewinn allein) ist die Basis für die Gewinnverwendung.

### Beispiel: Gewinnverwendung (3. Geschäftsjahr)

| Position | CHF |
|---|---|
| Gewinnvortrag Anfang | 1'600 |
| + Jahresgewinn | 29'700 |
| **= Bilanzgewinn** | **31'300** |
| − Zuweisung gesetzliche Gewinnreserve | − 12'000 |
| − Dividende (9 % von CHF 200'000 Aktienkapital) | − 18'000 |
| **= Neuer Gewinnvortrag** | **1'300** |

### Buchungen zur Gewinnverwendung

**Schritt 1: Jahresgewinn in Gewinnvortrag umbuchen**
```
Jahresgewinn / Gewinnvortrag  29'700
```

**Schritt 2: Zuweisung an gesetzliche Gewinnreserve**
```
Gewinnvortrag / Gesetzliche Gewinnreserve  12'000
```

**Schritt 3: Dividende beschliessen (Abgrenzung)**
```
Gewinnvortrag / Dividenden  18'000
```

Jetzt steht auf dem Konto **Dividenden** ein Betrag von CHF 18'000 – das ist eine **kurzfristige Schuld** der AG gegenüber den Aktionären (Fremdkapital).

---

## 7. Dividenden und Verrechnungssteuer

### Verrechnungssteuer auf Dividenden

Bei der Auszahlung von Dividenden muss die AG **35 % Verrechnungssteuer (VST)** abziehen und an die Steuerverwaltung abführen. Die Aktionäre erhalten nur den Nettoanteil.

**Berechnung:**

| Position | CHF |
|---|---|
| Dividende (brutto, beschlossen) | 18'000 |
| − Verrechnungssteuer (35 %) | − 6'300 |
| **= Nettoauszahlung an Aktionäre** | **11'700** |

### Buchungen Dividendenauszahlung

**Schritt 1: Dividendenauszahlung mit VST-Abzug**
```
Dividenden / Bank                      11'700
Dividenden / Verbindlichkeit VST        6'300
```

**Schritt 2: Überweisung der VST an die Steuerverwaltung**
```
Verbindlichkeit VST / Bank              6'300
```

### Wichtig zu verstehen

- Die **Dividende** ist nach dem Beschluss Fremdkapital (Schuld gegenüber Aktionären).
- Die **Verbindlichkeit VST** ist eine separate Schuld gegenüber der Steuerverwaltung.
- Die AG zahlt nicht die gesamte Dividende an die Aktionäre aus – sie behält die VST ein.

---

## 8. Vollständige Buchungsübersicht Gewinnverwendung

| Vorgang | Soll | Haben | Betrag |
|---|---|---|---|
| Jahresgewinn umbenuchen | Jahresgewinn | Gewinnvortrag | 29'700 |
| Zuweisung gesetzl. Gewinnreserve | Gewinnvortrag | Ges. Gewinnreserve | 12'000 |
| Dividendenbeschluss | Gewinnvortrag | Dividenden | 18'000 |
| Nettoauszahlung Dividenden | Dividenden | Bank | 11'700 |
| VST zurückbehalten | Dividenden | Verbindlichkeit VST | 6'300 |
| VST überweisen | Verbindlichkeit VST | Bank | 6'300 |

---

## 9. Verlustverarbeitung

### Wenn ein Jahresverlust entsteht

Ein Jahresverlust kann nicht ausgeschüttet werden. Er wird stattdessen verarbeitet:

**Schema der Verlustverarbeitung:**

| Schritt | Aktion |
|---|---|
| 1 | Jahresverlust auf Verlustvortrag übertragen |
| 2 | Vorhandenen Gewinnvortrag zur Deckung verwenden |
| 3 | Gesetzliche Gewinnreserven (soweit beschlossen) auflösen |
| 4 | Verbleibenden Rest als Verlustvortrag in die Bilanz übernehmen |

### Beispiel: Verlustverarbeitung

| Position | CHF |
|---|---|
| Jahresverlust | −53'900 |
| + Gewinnvortrag zur Deckung | +1'200 |
| + Auflösung gesetzliche Gewinnreserve | +21'100 |
| **= Verbleibender Verlustvortrag** | **−31'600** |

### Buchungen Verlustverarbeitung

```
Verlustvortrag / Jahresverlust             53'900
Gewinnvortrag / Verlustvortrag              1'200
Gesetzliche Gewinnreserve / Verlustvortrag 21'100
```

Der verbleibende **Verlustvortrag von CHF 31'600** erscheint in der Bilanz als **Minus-Passivkonto** nach dem Aktienkapital.

### Ausweis in der Bilanz

Der Verlustvortrag steht auf der **Passivseite** als negativer Eigenkapitalposten:

```
Eigenkapital
  Aktienkapital           200'000
  Gesetzl. Gewinnreserve        0
  Verlustvortrag          −31'600
  ─────────────────────────────
  Total Eigenkapital      168'400
```

---

## 10. Besondere Konten der AG

| Konto | Art | Funktion |
|---|---|---|
| **Aktienkapital** | Passiv (EK) | Statutarisches Grundkapital |
| **Gesetzliche Kapitalreserve** | Passiv (EK) | Agio und ähnliche Einlagen |
| **Gesetzliche Gewinnreserve** | Passiv (EK) | Gebundene Gewinnrücklagen |
| **Freiwillige Gewinnreserve** | Passiv (EK) | Frei gebildete Rücklagen |
| **Gewinnvortrag** | Passiv (EK) | Nicht verteilter Gewinnrest |
| **Verlustvortrag** | Passiv (EK, negativ) | Nicht gedeckter Verlust |
| **Dividenden** | Passiv (FK) | Schuld gegenüber Aktionären nach Beschluss |
| **Verbindlichkeit VST** | Passiv (FK) | Schuld aus einbehaltener Verrechnungssteuer |
| **Forderungen gegenüber Aktionären** | Aktiv | Offene Kapitalverpflichtungen (nur Gründung) |
| **Nicht einbezahltes Aktienkapital** | Aktiv | Korrekturposten (wirtschaftlich EK-Abzug) |

---

## 11. Rechnungslegungsvorschriften

### Revisionspflicht

| Gesellschaft | Revisionsart |
|---|---|
| Grössere AG (Börsenkotiert oder grosse Gesellschaft) | **Ordentliche Revision** |
| Andere AG | **Eingeschränkte Revision** |
| Kleine AG (max. 10 Vollzeitstellen, alle Aktionäre einverstanden) | **Opting-out** (Verzicht möglich) |

### Anhang zur Jahresrechnung

Der **Anhang** ist ein verbindlicher Bestandteil der Jahresrechnung (neben Bilanz und Erfolgsrechnung). Er enthält:

- Bilanzierungsgrundsätze
- Erläuterungen zu Bilanzpositionen
- Angaben zu Beteiligungen
- Eigene Aktien
- Leasingverbindlichkeiten
- Verpfändete Aktiven
- Bürgschaften und Garantien
- Vergütungen an Verwaltungsrat und Geschäftsleitung

Der Anhang dient dazu, Dritten (Gläubiger, Aktionäre) ein vollständigeres Bild der wirtschaftlichen Lage zu vermitteln – besonders wichtig bei stillen Reserven.

---

## 12. Kapitalerhöhung

### Wann wird das Aktienkapital erhöht?

Wenn das Unternehmen wächst und die Innenfinanzierung (einbehaltene Gewinne, Reserven) nicht ausreicht, können neue Aktien ausgegeben werden – **Kapitalerhöhung durch Aussenfinanzierung**.

### Agio

Werden neue Aktien **über dem Nennwert** ausgegeben, entsteht ein **Agio** (Aufgeld). Das Agio ist kein Ertrag – es wird der **gesetzlichen Kapitalreserve** zugewiesen.

### Beispiel: Kapitalerhöhung

| Position | CHF |
|---|---|
| Bisheriges Aktienkapital | 2'000'000 |
| Neues Aktienkapital | 3'000'000 |
| Neue Aktien | 10'000 Stück |
| Nennwert je Aktie | CHF 100 |
| Ausgabepreis je Aktie | CHF 170 |
| **Gesamteinzahlung** | **1'700'000** |
| davon Aktienkapital (10'000 × CHF 100) | 1'000'000 |
| davon Agio = gesetzliche Kapitalreserve (10'000 × CHF 70) | 700'000 |

### Buchungen Kapitalerhöhung

```
Bank / Aktienkapital                 1'000'000
Bank / Gesetzliche Kapitalreserve      700'000
```

oder in zwei Schritten (mit Zeichnungslogik):

```
Forderungen gegenüber Aktionären / Aktienkapital           1'000'000
Forderungen gegenüber Aktionären / Gesetzl. Kapitalreserve   700'000
Bank / Forderungen gegenüber Aktionären                    1'700'000
```

### Bezugsrecht

Bestehende Aktionäre haben bei Kapitalerhöhungen ein **Bezugsrecht**: Sie können neue Aktien im Verhältnis ihrer bisherigen Beteiligung erwerben. Das Bezugsrecht schützt sie vor Verwässerung ihrer Eigentumsquote.

---

## 13. Kernaussagen für die Prüfung

- Die AG ist eine juristische Person – sie haftet nur mit **ihrem** Gesellschaftsvermögen, nicht mit dem Privatvermögen der Aktionäre.
- Mindestkapital CHF 100'000; mindestens CHF 50'000 bzw. mindestens 20 % müssen vorläufig einbezahlt oder eingebracht werden.
- Die AG entsteht rechtlich erst mit dem **Handelsregistereintrag**.
- Die Gründungsverbuchung läuft immer über das Konto **„Forderungen gegenüber Aktionären"** – Saldo nach Abschluss: 0.
- Sacheinlagen erfordern eine **besondere Prüfungsbestätigung** der Revisionsstelle.
- Die Gewinnverwendung erfolgt **nach** Jahresabschluss, Revision und Generalversammlungsbeschluss.
- Nicht der Jahresgewinn, sondern der **Bilanzgewinn** (Jahresgewinn + Gewinnvortrag) wird verteilt.
- Dividenden sind nach dem Beschluss **Fremdkapital** (Schuld gegenüber Aktionären).
- Bei Dividendenauszahlungen: **35 % Verrechnungssteuer** abziehen, Rest netto auszahlen, VST an Steuerverwaltung überweisen.
- Jahresverluste werden auf **Verlustvortrag** gebucht und soweit möglich mit Gewinnvorträgen und Reserven gedeckt.
- Nicht gedeckte Verluste erscheinen als **Minus-Passivkonto** nach dem Aktienkapital in der Bilanz.
- Agio bei Kapitalerhöhungen gehört in die **gesetzliche Kapitalreserve** – nicht in den Gewinn.

---

## 14. Prüfungsfragen mit Lösungshinweisen

**Warum beginnt die Gründungsverbuchung mit „Forderungen gegenüber Aktionären / Aktienkapital"?**
Weil zunächst die rechtliche Verpflichtung (Zeichnung) erfasst wird, bevor die wirtschaftliche Erfüllung (Einlage) stattfindet. Das Forderungskonto zeigt, dass die AG einen Anspruch auf die ausstehende Kapitaleinlage hat.

**Was ist der Unterschied zwischen Jahresgewinn und Bilanzgewinn?**
Der Jahresgewinn ist das Ergebnis der laufenden Periode. Der Bilanzgewinn ist Jahresgewinn plus Gewinnvortrag aus Vorjahren. Der Bilanzgewinn ist die eigentliche Verteilungsbasis.

**Warum gehört die Dividende nach dem Beschluss ins Fremdkapital?**
Weil nach dem Beschluss der Generalversammlung eine rechtlich durchsetzbare Schuld der AG gegenüber den Aktionären entstanden ist – obwohl das Geld noch nicht ausbezahlt wurde.

**Warum ist ein Agio kein Ertrag?**
Weil es eine Kapitaleinlage der Aktionäre über den Nennwert hinaus ist. Es verändert das Eigenkapital, nicht den Periodenerfolg.

**Was passiert bilanziell mit einem nicht gedeckten Verlustvortrag?**
Er wird als negativer Eigenkapitalposten (Minus-Passivkonto) nach dem Aktienkapital ausgewiesen und vermindert damit das tatsächliche Eigenkapital der AG.
`

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  console.log('Connected to database')

  await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = $2`,
    [SUMMARY_EU, '8d2a1b28-ba8f-4fef-8072-a3c1582e3e2c']
  )
  console.log('Updated Einzelunternehmen chapter')

  await client.query(
    `UPDATE "Chapter" SET summary = $1 WHERE id = $2`,
    [SUMMARY_AG, '94403bc5-bbd8-4d00-af37-f8ee9eaff079']
  )
  console.log('Updated Aktiengesellschaft chapter')

  console.log(`SUMMARY_EU length: ${SUMMARY_EU.length} chars`)
  console.log(`SUMMARY_AG length: ${SUMMARY_AG.length} chars`)
  console.log('Done - updated frw-rechtsformen (EU + AG)')

  await client.end()
}

main().catch(console.error)
