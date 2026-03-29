# Immobilien – Verbuchung von Geschäfts­fällen, Kauf/Verkauf und Rendite von Liegenschaften

## 1. Kurzüberblick

Dieses Wissensmodul behandelt die buchhalterische Behandlung von Immobilien bzw. Liegenschaften im Unternehmenskontext. Im Mittelpunkt stehen drei eng verbundene Themen:

1. die laufende Verbuchung von Aufwänden und Erträgen einer betrieblich gehaltenen Liegenschaft,
2. die Verbuchung des Kaufs und Verkaufs einer Liegenschaft,
3. die wirtschaftliche Beurteilung einer Liegenschaft über Renditekennzahlen und den Ertragswert.

Das Material zeigt ein typisches Schweizer Rechnungswesen-Szenario: Ein Unternehmen nutzt eine eigene Liegenschaft teilweise selbst und vermietet andere Teile an Dritte. Dadurch entstehen sowohl betriebliche als auch liegenschaftsbezogene Erfolgsbestandteile. Die korrekte Trennung ist wichtig, damit der Betriebserfolg nicht durch immobilienbezogene Nebenerfolge verzerrt wird.

Für einen Coding-Agent ist dieses Thema wichtig, weil es ein regelbasiertes System aus Kontenlogik, Buchungssätzen, Abgrenzungen und finanzmathematischen Kennzahlen darstellt. Das Wissen lässt sich für Buchungsvorschläge, Kontenzuordnungen, Plausibilitätsprüfungen, Lernsysteme und automatisierte Fallbearbeitung wiederverwenden.

## 2. Ausführliche Gesamtzusammenfassung

Das Dokument behandelt Immobilien als Teil des Rechnungswesens eines Unternehmens. Ausgangspunkt ist ein Unternehmen, das eine eigene Geschäftsliegenschaft besitzt. Ein Teil dieser Liegenschaft wird betrieblich selbst genutzt, ein anderer Teil wird an Dritte vermietet. Daraus folgt ein zentraler Grundsatz: Nicht alle mit der Liegenschaft verbundenen Aufwände und Erträge gehören zum eigentlichen Betriebserfolg. Werden Geschäftsräume oder Wohnungen an Dritte vermietet, sind die daraus entstehenden Mietzinseinnahmen und die damit zusammenhängenden Aufwände betriebsfremd bzw. Nebenerfolge. Sie müssen deshalb gesondert ausgewiesen werden.

Zunächst zeigt das Material eine mehrstufige Erfolgsrechnung eines Beispielunternehmens. Daraus wird ersichtlich, dass der eigentliche Unternehmensgewinn nicht nur aus dem Handelsgeschäft entsteht, sondern zu einem wesentlichen Teil auch aus Liegenschaftserträgen. Die getrennte Darstellung von Bruttogewinn, Betriebsgewinn und Unternehmensgewinn macht sichtbar, wie liegenschaftsbezogene Ergebnisse den Gesamterfolg beeinflussen.

Für die laufende Buchhaltung werden spezielle Konten eingeführt. Das Konto **Liegenschaftsaufwand** sammelt alle Aufwände, die direkt mit der Liegenschaft zusammenhängen, etwa Unterhalt, Reparaturen, Versicherungen, Heizung, Wasser, Hauswartung, Verwaltungskosten, Hypothekarzinsen und Abschreibungen. Das Konto **Liegenschaftsertrag** sammelt die dazugehörigen Erträge, insbesondere Mietzinseinnahmen sowie intern verrechnete Mietwerte für selbst genutzte Geschäfts- oder Privaträume. Der entscheidende Effekt dieser Struktur ist: Weil alle relevanten Aufwände und Erträge über diese beiden Konten laufen, wird die Differenz unmittelbar als Gewinn oder Verlust der Liegenschaft sichtbar.

Zusätzlich behandelt das Material die Bilanzkonten **Immobilien** und **Hypotheken**. Das Konto **Immobilien** ist ein Aktivkonto des materiellen Anlagevermögens. Es nimmt den Anfangsbestand, Käufe, wertvermehrende Investitionen, Neubauten, Sanierungen und auch Verkaufsgewinne auf der Sollseite auf; auf der Habenseite stehen Verkäufe, Abschreibungen und Verkaufsverluste. Das Konto **Hypotheken** ist ein Passivkonto des langfristigen Fremdkapitals. Es zeigt Anfangsbestand und Erhöhungen im Haben sowie Abzahlungen bzw. Amortisationen im Soll.

Ein wichtiger Teil des Dokuments ist die Unterscheidung zwischen **werterhaltenden** und **wertvermehrenden** Sanierungskosten. Werterhaltende Arbeiten erhalten den bisherigen Zustand und werden als Aufwand über **Liegenschaftsaufwand** verbucht. Wertvermehrende Arbeiten erhöhen den Wert der Liegenschaft und werden aktiviert, also dem Konto **Immobilien** belastet. Diese Trennung ist nicht nur buchhalterisch, sondern auch steuerlich relevant.

Danach folgt die Verbuchung des **Kaufs einer Liegenschaft**. Der Kaufpreis wird auf dem Aktivkonto **Immobilien** erfasst, Nebenkosten wie Handänderungskosten ebenfalls. Übernommene Hypotheken erhöhen das Hypothekenkonto. Übernommene Vorräte wie Heizöl sowie Mietzinsabgrenzungen werden über ein Abrechnungskonto **Verbindlichkeiten L+L** verarbeitet. Dieses Konto dient dazu, alle gegenseitigen Ansprüche zwischen Käufer und Verkäufer im Zusammenhang mit der Übernahme sauber auszugleichen. Nach Verrechnung der Einzelpositionen wird nur noch der Restbetrag per Bank bezahlt.

Anschliessend wird der **Verkauf einer Liegenschaft** dargestellt. Hier dient das Abrechnungskonto **Forderungen L+L** dazu, den gesamten Anspruch gegenüber dem Käufer zu sammeln. Der Käufer übernimmt unter Umständen auch Hypotheken und Heizölvorräte; diese Positionen werden gegen das Abrechnungskonto gebucht. Nach Eingang des Restbetrags per Bank wird das Abrechnungskonto ausgeglichen. Ein allfälliger Verkaufsgewinn wird als ausserordentlicher Ertrag erfasst. Im Beispiel ergibt sich der Verkaufsgewinn aus der Differenz zwischen Verkaufspreis und Buchwert der Liegenschaft.

Abschliessend behandelt das Dokument die **Rendite von Liegenschaften**. Dafür wird zunächst die Finanzierung betrachtet: Kaufpreis minus Hypothek ergibt die eigenen Mittel. Auf der Erfolgsseite ergeben Mietzinseinnahmen minus Hypothekarzinsen minus Unterhaltskosten den Liegenschaftsgewinn. Aus diesen Grössen werden drei Kennzahlen abgeleitet:

- **Bruttorendite**: Liegenschaftsertrag brutto im Verhältnis zum Kaufpreis.
- **Nettorendite**: Liegenschaftsgewinn im Verhältnis zu den eingesetzten eigenen Mitteln.
- **Ertragswert**: Kapitalisierung des Liegenschaftsertrags mit einer gegebenen Bruttorendite.

Diese Kennzahlen verbinden Buchhaltung und Bewertung. Die Bruttorendite misst den Ertrag vor laufenden Kosten bezogen auf den Kaufpreis. Die Nettorendite zeigt die Verzinsung des tatsächlich eingesetzten Eigenkapitals. Der Ertragswert schätzt den Markt- bzw. Verkehrswert einer Liegenschaft aus dem nachhaltig erzielbaren Ertrag.

## 3. Hauptthemen

### 3.1 Immobilien im Rechnungswesen eines Unternehmens

Immobilien sind im Kontext des Dokuments keine rein privaten Vermögensobjekte, sondern betriebliche oder teilweise betriebliche Liegenschaften. Die Liegenschaft ist bilanziell ein Teil des materiellen Anlagevermögens. Gleichzeitig beeinflusst sie den Erfolg über Mieterträge, Unterhaltsaufwand, Zinsen und Abschreibungen.

### 3.2 Trennung von Betriebserfolg und Liegenschaftserfolg

Das Dokument betont, dass Vermietung an Dritte nicht zum eigentlichen Unternehmenszweck gehört. Daher sollen liegenschaftsbezogene Erträge und Aufwände nicht mit dem Kerngeschäft vermischt werden. Dadurch bleibt die Aussagekraft der Erfolgsrechnung erhalten.

### 3.3 Kontensystem für Immobilien

Vier Kontentypen stehen im Mittelpunkt:

- **Immobilien** als Aktivkonto,
- **Hypotheken** als Passivkonto,
- **Liegenschaftsaufwand** als Erfolgskonto für liegenschaftsbezogene Aufwände,
- **Liegenschaftsertrag** als Erfolgskonto für liegenschaftsbezogene Erträge.

Hinzu kommen Abrechnungskonten bei Kauf und Verkauf:

- **Verbindlichkeiten L+L** beim Kauf,
- **Forderungen L+L** beim Verkauf.

### 3.4 Kauf und Verkauf von Liegenschaften

Der Kauf und Verkauf einer Liegenschaft wird nicht nur als einfacher Bankvorgang verbucht. Vielmehr müssen Kaufpreis, Nebenkosten, Hypothekenübernahme, Heizölvorrat, Mietzinsverrechnung und Restzahlung systematisch getrennt verarbeitet werden.

### 3.5 Rendite- und Bewertungslogik

Die Liegenschaft wird nicht nur verbucht, sondern auch beurteilt. Das Dokument verknüpft die Buchhaltung mit Investitionsüberlegungen: Wie hoch ist die Bruttorendite? Wie rentiert das eingesetzte Eigenkapital? Welchen Wert hat die Liegenschaft bei gegebener Renditeerwartung?

## 4. Unterthemen

### 4.1 Einführungsszenario: gemischt genutzte Liegenschaft

Das Beispielunternehmen besitzt eine Liegenschaft mit eigenen Geschäftsräumen, einem vermieteten Ladenlokal und vier vermieteten Wohnungen. Diese Mischform erklärt, warum sowohl interne Mietwertverrechnungen als auch externe Mietzinseinnahmen vorkommen.

### 4.2 Mehrstufige Erfolgsrechnung

Die Erfolgsrechnung wird in mehrere Stufen gegliedert:

- **Bruttogewinn** aus Warenerlös minus Warenaufwand und Forderungsverlusten,
- **Betriebsgewinn** nach Abzug der betrieblichen Aufwände und unter Berücksichtigung des Finanzertrags,
- **Unternehmensgewinn** nach Einbezug von ausserordentlichem Aufwand sowie Liegenschaftsertrag und Liegenschaftsaufwand.

Die Struktur zeigt, dass Liegenschaftserträge nicht den Betriebsgewinn, sondern die letzte Erfolgsstufe beeinflussen.

### 4.3 Liegenschaftsaufwand

Über dieses Konto laufen alle Aufwände, die direkt aus Eigentum, Erhaltung und Finanzierung der Liegenschaft entstehen. Genannt werden insbesondere:

- Unterhalt und Reparaturen,
- Versicherungen der Liegenschaft,
- Heizung,
- Strom und Wasser,
- Kosten des Hauswarts,
- Verwaltungskosten,
- Hypothekarzinsen,
- Abschreibungen.

Minderungen des Aufwands werden auf der Gegenseite gebucht. Der Saldo fliesst in die Erfolgsrechnung.

### 4.4 Liegenschaftsertrag

Dieses Konto sammelt alle immobilienbezogenen Erträge:

- Mietzinseinnahmen,
- Mietwert der Geschäftsräume,
- Mietwert der Privatwohnung.

Minderungen des Ertrags stehen auf der Sollseite. Der Saldo fliesst in die Erfolgsrechnung.

### 4.5 Mietwertverrechnung

Wenn ein Unternehmen eigene Räume in der eigenen Liegenschaft nutzt, entsteht keine externe Miete. Für eine aussagekräftige Erfolgsrechnung wird der Mietwert intern verrechnet. Dadurch erscheint die Raumnutzung als Aufwand im Betrieb und als Ertrag der Liegenschaft. Beim Einzelunternehmen kann auch die Privatwohnung des Inhabers auf diese Weise verrechnet werden.

Beispielbuchungen:
- Bank / Liegenschaftsertrag für echte Mietzinseinnahmen,
- Raumaufwand / Liegenschaftsertrag für den Mietwert der Geschäftsräume,
- Privat / Liegenschaftsertrag für den Mietwert der Privatwohnung.

### 4.6 Bilanzkonto Immobilien

Das Konto **Immobilien** ist ein Aktivkonto. Auf die Sollseite kommen Anfangsbestand, Käufe, Handänderungskosten, Notariats- und Grundbuchgebühren, Neubauten, wertvermehrende Sanierungen und laut Darstellung auch Verkaufsgewinne. Auf die Habenseite kommen Verkäufe, Abschreibungen und Verkaufsverluste. Der Saldo entspricht dem Schlussbestand der bilanzierten Liegenschaften.

Wesentliche Deutung: Das Konto bildet nicht nur den ursprünglichen Kaufpreis ab, sondern auch aktivierbare Anschaffungs- und Verbesserungskosten sowie wertmindernde Abgänge.

### 4.7 Bilanzkonto Hypotheken

Das Konto **Hypotheken** ist ein Passivkonto des langfristigen Fremdkapitals. Auf der Habenseite stehen Anfangsbestand und Erhöhungen der Hypothek. Auf der Sollseite stehen Abzahlungen bzw. Amortisationen. Der Saldo zeigt den noch offenen Hypothekarschuldbestand.

### 4.8 Werterhaltende versus wertvermehrende Kosten

Diese Unterscheidung ist eine Kernregel.

**Werterhaltend** bedeutet: Der Wert der Liegenschaft bleibt im Wesentlichen gleich. Typische Beispiele sind Malerarbeiten, Reparaturen an bestehenden Geräten oder Ersatz vorhandener Bestandteile. Solche Kosten sind Aufwand und werden über **Liegenschaftsaufwand** verbucht.

**Wertvermehrend** bedeutet: Der Wert der Liegenschaft steigt. Beispiele sind Erweiterungen, Ausbau zusätzlicher Räume oder Einbau zusätzlicher Geräte. Solche Kosten werden aktiviert und auf **Immobilien** gebucht.

### 4.9 Kauf einer Liegenschaft

Im Beispiel möchte das Unternehmen eine Filiale eröffnen und kauft eine voll vermietete Liegenschaft.

Gegebene Werte:
- Kaufpreis Gebäude: CHF 1’180’000
- Handänderungskosten: CHF 11’600, je hälftig auf Käufer und Verkäufer verteilt → Anteil Käufer CHF 5’800
- Übernommene Hypothek: CHF 900’000
- Voraus bezahlter Heizölvorrat: CHF 3’400
- Bereits bezahlter Mietzins, der dem Käufer zusteht: CHF 1’100

Buchungslogik:
- Kaufpreis und Käuferanteil an den Handänderungskosten erhöhen **Immobilien**.
- Die übernommene Hypothek erhöht **Hypotheken**.
- Heizölvorrat und Mietzinsverrechnung laufen über **Verbindlichkeiten L+L**.
- Der Restbetrag wird per Bank bezahlt.

Buchungssätze aus dem Beispiel:
- Immobilien / Verb. L+L = 1’180’000
- Immobilien / Bank = 5’800
- Verb. L+L / Hypotheken = 900’000
- Liegenschaftsaufwand / Verb. L+L = 3’400
- Verb. L+L / Liegenschaftsertrag = 1’100
- Verb. L+L / Bank = 282’300

Das Abrechnungskonto **Verbindlichkeiten L+L** wird dadurch auf null abgeschlossen.

### 4.10 Verkauf einer Liegenschaft

Beim Verkauf wird das Konto **Forderungen L+L** als Abrechnungskonto verwendet. Es sammelt den Anspruch gegenüber dem Käufer. Der Käufer übernimmt bestimmte Positionen; diese werden gegen das Abrechnungskonto gebucht. Der Rest wird per Bank bezahlt.

Gegebene Werte:
- Verkaufspreis Liegenschaft: CHF 1’180’000
- Handänderungskosten Käufer-/Verkäuferanteil analog: eigener Anteil CHF 5’800
- Übernommene Hypothek durch Käufer: CHF 900’000
- Übernommener Heizölvorrat: CHF 3’400
- Mietzinsverrechnung: CHF 1’100
- Restzahlung per Bank: CHF 282’300
- Buchwert der Liegenschaft: CHF 920’000
- Verkaufsgewinn: CHF 260’000

Buchungssätze aus dem Beispiel:
- Ford. L+L / Immobilien = 1’180’000
- A.o. Ertrag / Bank = 5’800
- Hypotheken / Ford. L+L = 900’000
- Ford. L+L / Liegenschaftsaufwand = 3’400
- Liegenschaftsertrag / Ford. L+L = 1’100
- Bank / Ford. L+L = 282’300
- Immobilien / A.o. Ertrag = 260’000

Die letzte Buchung stellt den Verkaufsgewinn als ausserordentlichen Ertrag dar. Das Abrechnungskonto **Forderungen L+L** wird anschliessend saldiert.

Hinweis zur Interpretation: Der Verkaufsgewinn ergibt sich aus Verkaufspreis minus Buchwert. Im Beispiel: 1’180’000 minus 920’000 = 260’000.

### 4.11 Rendite von Liegenschaften

Die Renditebetrachtung verbindet Finanzierung und Jahreserfolg.

Gegebene Werte:
- Kaufpreis: CHF 1’180’000
- Hypothek: CHF 900’000
- Eigene Mittel: CHF 280’000
- Mietzinseinnahmen pro Jahr: CHF 55’300
- Hypothekarzins: 2 % von CHF 900’000 = CHF 18’000
- Unterhaltskosten pro Jahr: CHF 21’500
- Liegenschaftsgewinn: CHF 15’800

Formeln und Resultate:

**Bruttorendite**  
Liegenschaftsertrag brutto × 100 / Kaufpreis  
55’300 × 100 / 1’180’000 = **4,69 %**

**Nettorendite**  
Liegenschaftsgewinn × 100 / Eigene Mittel  
15’800 × 100 / 280’000 = **5,64 %**

**Ertragswert**  
Liegenschaftsertrag brutto × 100 / Bruttorendite in %  
55’300 × 100 / 4,69 = **CHF 1’179’104.50**, gerundet **CHF 1’180’000**

## 5. Wichtige Konzepte und Begriffe

### Immobilie / Liegenschaft
**Definition:** Grundstück mit Gebäude, das vom Unternehmen gehalten, genutzt oder vermietet wird.  
**Bedeutung im Kontext:** Zentraler Vermögensgegenstand, der sowohl Bilanz- als auch Erfolgswirkungen hat.  
**Zusammenhang:** Verknüpft mit Immobilienkonto, Hypotheken, Liegenschaftsaufwand, Liegenschaftsertrag und Renditeberechnung.  
**Beispiel:** Geschäftsliegenschaft der «Bürobedarf AG».

### Liegenschaftsaufwand
**Definition:** Erfolgskonto für sämtliche immobilienbezogenen Aufwände.  
**Bedeutung im Kontext:** Dient der sauberen Trennung von betrieblichen und liegenschaftsbezogenen Kosten.  
**Zusammenhang:** Gegenkonto zu Reparaturen, Versicherungen, Hypothekarzinsen, Abschreibungen etc.  
**Beispiel:** Liegenschaftsaufwand / Bank bei Hypothekarzinsbelastung.

### Liegenschaftsertrag
**Definition:** Erfolgskonto für sämtliche immobilienbezogenen Erträge.  
**Bedeutung im Kontext:** Macht die Ertragskraft der Liegenschaft sichtbar.  
**Zusammenhang:** Gegenkonto zu Mietzinseinnahmen und Mietwertverrechnungen.  
**Beispiel:** Bank / Liegenschaftsertrag bei Mietzinseingang.

### Mietwert
**Definition:** Fiktiver bzw. intern verrechneter Nutzungswert selbst genutzter Räume.  
**Bedeutung im Kontext:** Dient der verursachungsgerechten Erfolgsdarstellung.  
**Zusammenhang:** Erhöht den Liegenschaftsertrag und zugleich z. B. den Raumaufwand oder das Privatkonto.  
**Beispiel:** Raumaufwand / Liegenschaftsertrag.

### Immobilienkonto
**Definition:** Aktivkonto des materiellen Anlagevermögens.  
**Bedeutung im Kontext:** Bilanzielle Erfassung des Werts der Liegenschaft.  
**Zusammenhang:** Erhöht sich bei Kauf und wertvermehrenden Investitionen, vermindert sich bei Verkauf und Abschreibung.  
**Beispiel:** Immobilien / Verb. L+L beim Kauf.

### Hypotheken
**Definition:** Langfristiges Fremdkapital zur Finanzierung der Liegenschaft.  
**Bedeutung im Kontext:** Zeigt die Fremdfinanzierung der Immobilie.  
**Zusammenhang:** Beeinflusst Finanzierung, Zinsaufwand und Nettorendite.  
**Beispiel:** Verb. L+L / Hypotheken beim Kauf.

### Verbindlichkeiten L+L (Abrechnungskonto)
**Definition:** Temporäres Abrechnungskonto beim Kauf einer Liegenschaft.  
**Bedeutung im Kontext:** Bündelt die gegenseitigen Ansprüche zwischen Käufer und Verkäufer, bis der Restbetrag bezahlt ist.  
**Zusammenhang:** Verrechnet Kaufpreis, Hypothekenübernahme, Heizölvorrat, Mietzinsanteile und Bankzahlung.  
**Beispiel:** Verb. L+L / Bank für den Restbetrag.

### Forderungen L+L (Abrechnungskonto)
**Definition:** Temporäres Abrechnungskonto beim Verkauf einer Liegenschaft.  
**Bedeutung im Kontext:** Bündelt den Anspruch des Verkäufers gegenüber dem Käufer.  
**Zusammenhang:** Gegenkonto für Verkaufspreis, übernommene Hypothek, Heizölvorrat, Mietzinsanteile und Bankeingang.  
**Beispiel:** Bank / Ford. L+L.

### Werterhaltender Aufwand
**Definition:** Aufwand, der den bisherigen Zustand oder Nutzen der Liegenschaft erhält.  
**Bedeutung im Kontext:** Sofort erfolgswirksam.  
**Zusammenhang:** Buchung über Liegenschaftsaufwand.  
**Beispiel:** Malerarbeiten oder Ersatz bestehender Geräte.

### Wertvermehrende Investition
**Definition:** Ausgabe, die den Wert der Liegenschaft steigert.  
**Bedeutung im Kontext:** Aktivierung statt sofortiger Aufwand.  
**Zusammenhang:** Buchung auf Immobilienkonto.  
**Beispiel:** Erweiterung der Liegenschaft oder Ausbau zusätzlicher Räume.

### Bruttorendite
**Definition:** Verhältnis des Brutto-Liegenschaftsertrags zum Kaufpreis.  
**Bedeutung im Kontext:** Einfache Kennzahl zur Ertragskraft vor laufenden Kosten.  
**Zusammenhang:** Grundlage für Ertragswertberechnung.  
**Beispiel:** 4,69 % im Beispiel.

### Nettorendite
**Definition:** Verhältnis des Liegenschaftsgewinns zu den eingesetzten eigenen Mitteln.  
**Bedeutung im Kontext:** Zeigt die Verzinsung des Eigenkapitals.  
**Zusammenhang:** Bezieht Finanzierung explizit ein.  
**Beispiel:** 5,64 % im Beispiel.

### Ertragswert
**Definition:** Kapitalisierter Wert der Liegenschaft auf Basis des Ertrags und der gewünschten Rendite.  
**Bedeutung im Kontext:** Bewertungsmethode für Immobilien.  
**Zusammenhang:** Verknüpft Mieterträge mit Marktwertschätzung.  
**Beispiel:** CHF 1’179’104.50 bei 4,69 % Bruttorendite.

## 6. Kernaussagen

- Liegenschaften müssen im Rechnungswesen häufig getrennt vom operativen Kerngeschäft betrachtet werden.
- Vermietung an Dritte erzeugt betriebsfremde bzw. Nebenerfolge.
- Liegenschaftsbezogene Aufwände und Erträge werden über eigene Erfolgskonten gebucht.
- Die Differenz zwischen Liegenschaftsertrag und Liegenschaftsaufwand zeigt unmittelbar den Gewinn oder Verlust der Liegenschaft.
- Das Konto **Immobilien** ist ein Aktivkonto; das Konto **Hypotheken** ist ein Passivkonto.
- Werterhaltende Kosten sind Aufwand, wertvermehrende Kosten sind zu aktivieren.
- Beim Kauf und Verkauf von Liegenschaften werden Abrechnungskonten verwendet, damit alle Nebenpositionen systematisch verrechnet werden können.
- Übernommene Hypotheken, Heizölvorräte und Mietzinsanteile beeinflussen die effektive Restzahlung, aber nicht den Grundmechanismus des Kaufs bzw. Verkaufs.
- Verkaufsgewinne werden als ausserordentlicher Ertrag behandelt.
- Bruttorendite, Nettorendite und Ertragswert sind unterschiedliche, aber logisch verknüpfte Sichtweisen auf dieselbe Liegenschaft.

## 7. Struktur und Logik

Das Material ist didaktisch in drei Ebenen aufgebaut.

Zuerst wird die **Einbettung in die Erfolgsrechnung** gezeigt. Damit wird klar, warum das Thema überhaupt relevant ist: Die Liegenschaft beeinflusst den Unternehmenserfolg, soll aber den Betriebserfolg nicht verfälschen.

Danach folgt die **Kontenlogik**. Die Leserinnen und Leser lernen, welche Konten für Immobilienfälle verwendet werden und welche typische Soll-/Haben-Struktur diese Konten aufweisen.

Darauf aufbauend kommen die **Buchungsfälle**. Diese zeigen die konkrete Anwendung der Kontenlogik auf laufende Vorgänge, Kauf- und Verkaufssituationen.

Am Schluss wird die **finanzielle Interpretation** der Liegenschaft eingeführt. Aus den buchhalterischen Grössen werden Rendite- und Bewertungskennzahlen berechnet.

Die Ursache-Wirkung-Beziehungen sind klar:
- Besitz einer Liegenschaft führt zu Erträgen, Aufwänden, Bilanzwerten und Finanzierung.
- Die Art der Ausgabe entscheidet über Aufwand oder Aktivierung.
- Die Finanzierungsstruktur beeinflusst nicht die Bruttorendite, aber die Nettorendite.
- Die Qualität der Ertragsdaten beeinflusst den Ertragswert.
- Eine saubere Trennung von Betrieb und Liegenschaft verbessert die Aussagekraft der Erfolgsrechnung.

Wiederkehrende Muster:
- Erfolgskonten trennen betriebliche von liegenschaftsbezogenen Vorgängen.
- Abrechnungskonten sammeln komplexe Kauf-/Verkaufsvorgänge und werden anschliessend ausgeglichen.
- Buchhalterische Erfassung und wirtschaftliche Beurteilung greifen ineinander.

## 8. Modelle, Methoden und Regeln

### 8.1 Kontentrennungsregel
Alle Aufwände und Erträge, die direkt mit der Liegenschaft zusammenhängen, werden nicht auf allgemeine Betriebskonten verteilt, sondern über **Liegenschaftsaufwand** und **Liegenschaftsertrag** geführt.

### 8.2 Mietwertverrechnungsregel
Selbst genutzte Räume einer eigenen Liegenschaft werden zum Mietwert intern verrechnet, damit die Erfolgsrechnung realistische Kosten- und Ertragsstrukturen zeigt.

### 8.3 Aktivierungsregel
Wertvermehrende Ausgaben erhöhen das Aktivkonto **Immobilien**. Werterhaltende Ausgaben belasten den Aufwand.

### 8.4 Abrechnungskonto-Methode beim Kauf
Beim Kauf werden alle gegenseitigen Ansprüche zwischen Käufer und Verkäufer über **Verbindlichkeiten L+L** gesammelt. Erst danach wird der Netto-Restbetrag bezahlt.

### 8.5 Abrechnungskonto-Methode beim Verkauf
Beim Verkauf werden alle gegenseitigen Ansprüche über **Forderungen L+L** gesammelt. Der Restbetrag wird nach Verrechnung der übernommenen bzw. abgegrenzten Positionen eingezogen.

### 8.6 Methode zur Ermittlung des Verkaufsgewinns
Verkaufsgewinn = Verkaufspreis minus Buchwert der Liegenschaft.  
Im Dokument: 1’180’000 − 920’000 = 260’000.

### 8.7 Formelmodell für Rendite und Ertragswert

**Bruttorendite**
```text
Bruttorendite = Liegenschaftsertrag brutto × 100 / Kaufpreis
```

**Nettorendite**
```text
Nettorendite = Liegenschaftsgewinn × 100 / Eigene Mittel
```

**Ertragswert**
```text
Ertragswert = Liegenschaftsertrag brutto × 100 / Bruttorendite in %
```

## 9. Beispiele

### Beispiel 1: Interne Mietwertverrechnung
Die Geschäftsräume befinden sich in der eigenen Liegenschaft. Damit der Raumbedarf des Betriebs in der Erfolgsrechnung sichtbar wird, wird ein Mietwert gebucht:
- Raumaufwand / Liegenschaftsertrag

Bedeutung: Der Betrieb trägt einen Raumaufwand, die Liegenschaft weist einen entsprechenden Ertrag aus.

### Beispiel 2: Hypothekarzins
Die Bank belastet Hypothekarzinsen:
- Liegenschaftsaufwand / Bank

Bedeutung: Finanzierungskosten der Liegenschaft sind Teil des Liegenschaftserfolgs.

### Beispiel 3: Abschreibung der Liegenschaft
Die Liegenschaft wird abgeschrieben:
- Liegenschaftsaufwand / Immobilien

Bedeutung: Wertminderung der Liegenschaft wird erfolgswirksam erfasst und senkt zugleich den Buchwert.

### Beispiel 4: Kauf einer Liegenschaft mit Nebenkosten
Neben dem Kaufpreis fallen Handänderungskosten an, es wird eine Hypothek übernommen und ein Heizölvorrat abgegolten.  
Bedeutung: Der Kaufpreis allein genügt nicht für die korrekte Verbuchung; der Erwerb ist ein Bündel mehrerer Teiltransaktionen.

### Beispiel 5: Verkauf mit Gewinn
Eine Liegenschaft mit Buchwert CHF 920’000 wird für CHF 1’180’000 verkauft.  
Bedeutung: Die Differenz von CHF 260’000 ist kein ordentlicher Betriebsertrag, sondern ausserordentlicher Ertrag.

### Beispiel 6: Renditeberechnung
Mit Mietzinseinnahmen von CHF 55’300, Hypothekarzins von CHF 18’000 und Unterhalt von CHF 21’500 resultiert ein Gewinn von CHF 15’800.  
Bedeutung: Dieselbe Liegenschaft kann als Vermögensgegenstand, Erfolgsquelle und Investitionsobjekt analysiert werden.

## 10. Interne Zusammenhänge

Die Kapitel sind stark miteinander verzahnt.

Die mehrstufige Erfolgsrechnung begründet, warum liegenschaftsbezogene Konten überhaupt separat geführt werden. Die Kontenstruktur wiederum bildet die Grundlage für konkrete Buchungssätze. Ohne die Unterscheidung zwischen **Liegenschaftsaufwand**, **Liegenschaftsertrag**, **Immobilien** und **Hypotheken** wären Kauf, Verkauf und Renditeanalyse nicht konsistent darstellbar.

Die Trennung zwischen werterhaltend und wertvermehrend verbindet Erfolgsrechnung und Bilanz direkt. Werterhaltende Kosten beeinflussen den Periodenerfolg sofort, wertvermehrende Kosten erhöhen den Buchwert der Liegenschaft und wirken sich typischerweise erst später über Abschreibungen oder Verkaufsgewinne/-verluste aus.

Die Finanzierung über Hypotheken beeinflusst mehrere Ebenen gleichzeitig:
- bilanziell über das Passivkonto **Hypotheken**,
- erfolgswirksam über **Hypothekarzinsen** im Liegenschaftsaufwand,
- investitionsrechnerisch über die **Nettorendite**, weil sie die eigenen Mittel reduziert.

Die Abrechnungskonten bei Kauf und Verkauf bilden eine Brücke zwischen Vertragslogik und Buchungstechnik. Sie sorgen dafür, dass Teilpositionen wie Mietzinsabgrenzungen und Vorratsübernahmen nicht vergessen oder falsch direkt mit Bank und Immobilienkonto vermischt werden.

## 11. Verbindungen zu anderen Themen

Dieses Thema ist eng verbunden mit:

- **Finanzbuchhaltung:** Aktiv- und Passivkonten, Erfolgsrechnung, Abschlusslogik
- **Anlagevermögen:** Aktivierung, Abschreibung, Bilanzierung langlebiger Vermögenswerte
- **Fremdfinanzierung:** Hypotheken, Zinsaufwand, langfristige Schulden
- **Abgrenzungen:** zeitliche und sachliche Verrechnung von Mietzins und Vorräten
- **Kostenrechnung / interne Verrechnung:** Mietwert als interne Leistungsverrechnung
- **Steuerrecht:** Unterschied zwischen werterhaltenden und wertvermehrenden Investitionen
- **Immobilienbewertung:** Ertragswertverfahren und Renditekennzahlen
- **Unternehmensanalyse:** Trennung von operativem Ergebnis und Nebenerfolgen

## 12. Offene Fragen

- Das Material behandelt vor allem die Grundlogik; Details zu steuerlichen Sonderfällen werden nur angedeutet.
- Die Darstellung der Kontonummern gemäss Schweizer Kontenrahmen wird erwähnt, aber in den Bildern nur teilweise lesbar. Für Implementierungen sollte ein vollständiger Kontenplan separat geprüft werden.
- Die Behandlung von Handänderungskosten beim Verkauf ist im Beispiel verkürzt dargestellt; für praktische Anwendungen sollte geklärt werden, ob und wie diese je nach Vertrag verteilt und gebucht werden.
- Nicht behandelt werden komplexere Fälle wie Teilverkäufe, Renovationen über mehrere Perioden, gemischte private/betriebliche Nutzung mit detaillierten Quoten oder Änderungen des Verkehrswerts ohne Verkauf.
- Ebenfalls offen bleiben Mehrwertsteuerfragen, direkte Steuerfolgen und Spezialfälle bei ausserordentlichen Wertberichtigungen.

## 13. Prüfungs- und Verständnisfragen

1. Warum wird der Mietwert selbst genutzter Geschäftsräume in einer eigenen Liegenschaft intern verrechnet, obwohl keine externe Zahlung erfolgt?
2. Weshalb sollen Liegenschaftserträge und Liegenschaftsaufwände den Betriebserfolg nicht verfälschen?
3. Welche Kriterien entscheiden darüber, ob Sanierungskosten auf **Liegenschaftsaufwand** oder **Immobilien** gebucht werden?
4. Warum wird beim Kauf einer Liegenschaft ein Abrechnungskonto wie **Verbindlichkeiten L+L** verwendet?
5. Wie wirkt sich die Übernahme einer Hypothek beim Kauf auf Bilanz und Liquidität aus?
6. Worin besteht der Unterschied zwischen Bruttorendite und Nettorendite?
7. Warum kann die Nettorendite höher sein als die Bruttorendite?
8. Wie entsteht ein Verkaufsgewinn bei einer Liegenschaft, und warum wird er als ausserordentlicher Ertrag behandelt?
9. Welche Folgen hätte es für die Aussagekraft der Erfolgsrechnung, wenn Hypothekarzinsen direkt als allgemeiner Finanzaufwand statt als Liegenschaftsaufwand erfasst würden?
10. Wie verändert sich der Buchwert der Liegenschaft durch Abschreibungen und wertvermehrende Investitionen?
11. Welche Rolle spielen Heizölvorrat und Mietzinsabgrenzung beim Eigentumsübergang?
12. Unter welchen Annahmen ist der Ertragswert einer Liegenschaft eine sinnvolle Bewertungsgrösse?

## 14. Wissensbausteine (für Datenbank)

**Thema:**  
Immobilien im Rechnungswesen: laufende Verbuchung, Kauf/Verkauf, Rendite und Ertragswert

**Unterthemen:**  
Mehrstufige Erfolgsrechnung; Liegenschaftsaufwand; Liegenschaftsertrag; Mietwertverrechnung; Immobilienkonto; Hypothekenkonto; werterhaltende vs. wertvermehrende Kosten; Kauf einer Liegenschaft; Verkauf einer Liegenschaft; Bruttorendite; Nettorendite; Ertragswert

**Schlüsselbegriffe:**  
Immobilien, Liegenschaft, Hypotheken, Liegenschaftsaufwand, Liegenschaftsertrag, Mietwert, Aktivkonto, Passivkonto, Verbindlichkeiten L+L, Forderungen L+L, werterhaltend, wertvermehrend, Bruttorendite, Nettorendite, Ertragswert, Verkaufsgewinn

**Definitionen:**  
Immobilien = materielle Anlagewerte in Form von Liegenschaften.  
Liegenschaftsaufwand = Erfolgskonto für immobilienbezogene Aufwände.  
Liegenschaftsertrag = Erfolgskonto für immobilienbezogene Erträge.  
Mietwert = intern verrechneter Nutzungswert selbst genutzter Räume.  
Werterhaltend = Aufwand erhält den bestehenden Wert.  
Wertvermehrend = Ausgabe erhöht den Vermögenswert und wird aktiviert.  
Bruttorendite = Bruttoertrag im Verhältnis zum Kaufpreis.  
Nettorendite = Gewinn im Verhältnis zum eingesetzten Eigenkapital.  
Ertragswert = kapitalisierter Ertrag einer Liegenschaft.

**Kernideen:**  
Liegenschaftsergebnisse sollen separat vom operativen Kerngeschäft dargestellt werden.  
Aufwand oder Aktivierung hängt davon ab, ob der Wert erhalten oder erhöht wird.  
Kauf und Verkauf werden über Abrechnungskonten strukturiert verarbeitet.  
Renditekennzahlen verbinden Buchhaltung und Investitionsentscheidung.

**Modelle/Methoden:**  
Kontentrennung; interne Mietwertverrechnung; Abrechnungskonto-Methode beim Kauf/Verkauf; Renditeformeln; Ertragswertverfahren

**Wichtige Fakten:**  
Immobilien = Aktivkonto.  
Hypotheken = Passivkonto.  
Verkaufsgewinn = Verkaufspreis minus Buchwert.  
Bruttorendite im Beispiel = 4,69 %.  
Nettorendite im Beispiel = 5,64 %.  
Ertragswert im Beispiel = rund CHF 1’180’000.

**Beispiele:**  
Raumaufwand / Liegenschaftsertrag für Mietwert Geschäftsräume.  
Liegenschaftsaufwand / Bank für Hypothekarzins.  
Liegenschaftsaufwand / Immobilien für Abschreibung.  
Immobilien / Verb. L+L beim Kaufpreis.  
Ford. L+L / Immobilien beim Verkaufspreis.

**Zentrale Zusammenhänge:**  
Liegenschaftsertrag minus Liegenschaftsaufwand = Liegenschaftserfolg.  
Hypotheken beeinflussen Zinsaufwand und Eigenmittelrendite.  
Wertvermehrende Investitionen erhöhen den Buchwert und beeinflussen spätere Abschreibungen bzw. Verkaufsergebnisse.  
Der Ertragswert hängt direkt von Ertrag und Renditeanforderung ab.

**Verwandte Themen:**  
Finanzbuchhaltung, Immobilienbewertung, Investitionsrechnung, Steuerrecht, Kontenrahmen KMU, Anlagebuchhaltung

**Offene Fragen:**  
Steuerliche Details, Kontonummern im Vollumfang, Spezialfälle bei gemischter Nutzung, Teilverkäufen und ausserordentlichen Wertanpassungen

## 15. Tags und Verknüpfungen

**Tags:**  
#Immobilien #Liegenschaften #Buchhaltung #Rechnungswesen #Hypotheken #Erfolgsrechnung #Bilanz #Anlagevermögen #Rendite #Ertragswert #Schweiz #Kontenlogik

**Verknüpfte Begriffe:**  
Mietwert, Abschreibung, Aktivierung, Fremdfinanzierung, Nebenerfolg, ausserordentlicher Ertrag, Unterhalt, Sanierung, Bilanzkonto, Erfolgskonto, Abrechnungskonto

**Übergeordnete Themen:**  
Finanzbuchhaltung, Unternehmensbewertung, Investitionsbeurteilung, Rechnungslegung

**Gehört zusammen mit:**  
Anlagebuchhaltung, Abschlussbuchungen, Kontenrahmen KMU, Kostenartenrechnung, Immobilienfinanzierung

## 16. Endzusammenfassung (5–10 Sätze)

Das Dokument erklärt, wie Liegenschaften im Unternehmensrechnungswesen bilanziert, erfolgswirksam erfasst und wirtschaftlich beurteilt werden. Zentral ist die Trennung zwischen operativem Betriebserfolg und liegenschaftsbezogenen Erfolgen, damit die Erfolgsrechnung aussagekräftig bleibt. Dafür werden eigene Konten für **Liegenschaftsaufwand** und **Liegenschaftsertrag** verwendet, während **Immobilien** und **Hypotheken** die Bilanzseite abbilden. Werterhaltende Ausgaben sind Aufwand, wertvermehrende Ausgaben werden aktiviert. Beim Kauf und Verkauf von Liegenschaften werden Abrechnungskonten eingesetzt, damit Kaufpreis, Hypothekenübernahme, Vorräte, Mietzinsabgrenzungen und Restzahlungen sauber verrechnet werden. Ein Verkaufsgewinn ergibt sich aus der Differenz zwischen Verkaufspreis und Buchwert und wird als ausserordentlicher Ertrag ausgewiesen. Für die wirtschaftliche Beurteilung werden Bruttorendite, Nettorendite und Ertragswert berechnet. Insgesamt verbindet das Material Kontenlogik, Buchungstechnik und Investitionsanalyse zu einem konsistenten Modell des Umgangs mit Immobilien.

## Hinweise zu Grenzen der Extraktion

Dieses Wissensmodul basiert auf den sichtbaren Seiten 77–82 des hochgeladenen Materials. Es deckt damit den Themenausschnitt **Immobilien** mit den Unterkapiteln 4.1 bis 4.3 ab. Wo Randtexte oder teilweise verdeckte Stellen nicht vollständig lesbar waren, wurde nur das sicher erkennbare Wissen übernommen. Es wurden keine zusätzlichen Inhalte ergänzt, die im Material nicht erkennbar waren.
