export type ExamQuestion = {
  id: string
  label: string       // z.B. "a)", "b1)", "b2)"
  question: string
  answer: string
  points: number
  isSubQuestion?: boolean
}

export type ExamSection = {
  id: string
  number: number
  title: string
  emoji: string
  richtzeitMinutes: number
  context: string
  totalPoints: number
  questions: ExamQuestion[]
}

export const EXAM_SECTIONS: ExamSection[] = [
  {
    id: 'marketing',
    number: 1,
    title: 'Marketing',
    emoji: '📊',
    richtzeitMinutes: 10,
    totalPoints: 18,
    context:
      'Die ALPENLOGE ist ein kleines, modernes Sporthotel in den Schweizer Alpen, das verkehrstechnisch sehr gut gelegen ist und sehr nahe zur Langlaufloipe und zu den Velowegen liegt. Das Hotel bietet Sportbegeisterten eine erstklassige Unterkunft.',
    questions: [
      {
        id: 'marketing-a',
        label: 'a)',
        points: 2,
        question:
          'Damit die ALPENLOGE wirksames Marketing betreiben kann, muss das Sporthotel den Markt segmentieren. Was ist eine Marktsegmentierung?',
        answer:
          'Marktsegmentierung ist die Aufteilung eines Gesamtmarktes in kleinere, klar abgrenzbare Teilmärkte (Segmente). Diese Gruppen bestehen aus Kunden mit ähnlichen Bedürfnissen, Eigenschaften oder Kaufverhalten. Ziel: Das Unternehmen kann seine Marketingmassnahmen gezielt auf die relevante Zielgruppe ausrichten.',
      },
      {
        id: 'marketing-b-intro',
        label: 'b)',
        points: 0,
        question:
          'In der Schweiz gibt es 8 Mio. Einwohnerinnen und Einwohnern. Im Jahr 2021 waren rund 23 % der Bevölkerung sportlich aktiv und könnten sich den Aufenthalt in diesem Hotel leisten. In einem Sporthotel schlafen die Gäste mindestens 2 Nächte.',
        answer: '→ Aufgaben b1) und b2) beachten.',
        isSubQuestion: false,
      },
      {
        id: 'marketing-b1',
        label: 'b1)',
        points: 3,
        isSubQuestion: true,
        question:
          'Wie gross war der Marktanteil der ALPENLOGE im Jahr 2021, wenn das Hotel 9\'500 Gäste zählte? Zeigen Sie die Berechnung.',
        answer:
          'Marktgrösse: 8\'000\'000 × 23 % = 1\'840\'000 sportlich aktive Personen\n\nAnnahme Mindestaufenthalt 2 Nächte → Marktgrösse in Gästen = 1\'840\'000\n\nMarktanteil = (9\'500 / 1\'840\'000) × 100\n= 0.516 %\n\n→ Der Marktanteil der ALPENLOGE beträgt ca. 0.52 %.',
      },
      {
        id: 'marketing-b2',
        label: 'b2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Handelt es sich beim für die ALPENLOGE massgeblichen Markt um einen grossen oder um einen angemessenen Markt? Begründen Sie.',
        answer:
          'Es handelt sich um einen angemessenen (relevanten) Markt, da nicht der gesamte Tourismus-/Hotelmarkt der Schweiz massgebend ist, sondern nur jener Teil, der sportbegeistert ist, sich einen Aufenthalt leisten kann und mindestens 2 Nächte bucht. Dieser ist klar eingegrenzt und gezielt ansprechbar.',
      },
      {
        id: 'marketing-c',
        label: 'c)',
        points: 4,
        question:
          'Die ALPENLOGE beschliesst, sich fortan als Businesshotel zu positionieren. Entwerfen Sie für die ALPENLOGE als Businesshotel einen stimmigen Marketing-Mix und nennen Sie für jeden Marketingbereich ein konkretes Beispiel.',
        answer:
          '• Produkt (Product): Businesszimmer mit ergonomischem Arbeitsplatz, stabilem WLAN, Drucker und ruhiger Atmosphäre\n• Preis (Price): Spezielle Firmenpauschalen / Konferenzpakete inkl. Übernachtung und Verpflegung\n• Distribution (Place): Buchbar über Businessreise-Plattformen (z. B. HRS, booking.com Business) sowie direkte Verträge mit Unternehmen\n• Kommunikation (Promotion): LinkedIn-Werbung gezielt für Firmen, Kaltakquise bei regionalen KMU, Google-Ads mit Keyword «Businesshotel Alpen»',
      },
      {
        id: 'marketing-d',
        label: 'd)',
        points: 4,
        question:
          'Beurteilen Sie, welcher Phase des Produktlebenszyklus die folgenden Aussagen der ALPENLOGE zugeordnet werden können:\n\n• «Die Marketingausgaben sind sehr hoch, der Umsatz ist noch gering. Es wird erst langsam bekannt.»\n• «Mund-zu-Mund-Propaganda verbreitet sich. Die Buchungszahlen steigen stark. Die Gewinnschwelle wird schliesslich überschritten.»\n• «Das Hotel ist gut ausgelastet, der Markt ist gesättigt, das Wachstum stagniert.»\n• «Die Buchungszahlen sinken stark. Das Hotel investiert kaum noch in Werbung.»',
        answer:
          '• «Marketingausgaben hoch, Umsatz gering» → Einführungsphase\n• «Mund-zu-Mund, starkes Wachstum, Gewinnschwelle überschritten» → Wachstumsphase\n• «Gut ausgelastet, Markt gesättigt, Stagnation» → Reifephase (Sättigungsphase)\n• «Buchungszahlen sinken, kaum Investitionen» → Degenerationsphase (Rückgangsphase)',
      },
      {
        id: 'marketing-e',
        label: 'e)',
        points: 3,
        question:
          'Die ALPENLOGE befindet sich in der Einführungsphase. Die Marketingausgaben sind stark abgängig und die Deckungsbeiträge noch negativ. In welcher Kategorie der BCG-Portfolio-Matrix befindet sich die ALPENLOGE aktuell, und was empfehlen Sie dem Management?',
        answer:
          'Kategorie: Fragezeichen (Question Mark / Poor Child)\n→ Tiefer Marktanteil, aber hohe Marktwachstumsrate.\n\nEmpfehlung: Investieren («invest to grow»). Wenn das Hotel das Potenzial hat, Marktanteile zu gewinnen, sollte konsequent in Marketing und Qualität investiert werden, um ein «Star» zu werden. Falls kein Wachstumspotenzial besteht, Desinvestition prüfen.',
      },
    ],
  },
  {
    id: 'vertragslehre',
    number: 2,
    title: 'Allg. Vertragslehre und Kaufvertrag',
    emoji: '⚖️',
    richtzeitMinutes: 10,
    totalPoints: 16,
    context:
      'ANNA MEIER kauft von KURT KELLER per Kaufvertrag vom 31. März 2021 ein Occasionsauto zum Preis von CHF 21\'400. Die Fahrzeugübergabe und Bezahlung des Kaufpreises wurden auf den 6. Juni 2021 festgelegt. KELLER weist in der Vertragsklausel auf einen bekannten Defekt am linken Scheinwerfer hin, schliesst aber jegliche Gewährleistung aus. Nach der Übergabe stellt MEIER fest, dass der Scheinwerfer bereits vor der Übergabe auf Kosten von KELLER repariert wurde. Später bemerkt MEIER, dass das Fahrzeug laut einem unabhängigen Gutachten nur CHF 12\'000 wert ist.',
    questions: [
      {
        id: 'vertrag-a',
        label: 'a)',
        points: 1,
        question: 'Wo ist der Kaufpreis geschuldet (Erfüllungsort)?',
        answer:
          'Der Kaufpreis ist am Wohnort des Schuldners (MEIER) geschuldet → Bringschuld beim Gläubiger (KELLER). Da im Vertrag keine andere Regelung getroffen wurde, gilt nach OR Art. 74: Geldschulden sind am Wohnort/Niederlassungsort des Gläubigers (KELLER) zu bezahlen.\n\n→ Erfüllungsort: Wohnort von KELLER.',
      },
      {
        id: 'vertrag-b',
        label: 'b)',
        points: 2,
        question:
          'Könnte KELLER das Occasionsauto zurückfordern, falls MEIER den Kaufpreis nicht vollständig bezahlt? Begründen Sie.',
        answer:
          'Nein, grundsätzlich nicht direkt. Das Eigentum geht mit der Übergabe auf MEIER über. KELLER hat keinen automatischen Rückforderungsanspruch.\n\nKELLER könnte jedoch:\n1. Klage auf Erfüllung (Zahlung) einreichen\n2. Mahnung + Nachfristsetzung → Rücktritt vom Vertrag\n3. Nur mit einem ausdrücklichen Eigentumsvorbehalt im Vertrag könnte er das Auto zurückfordern.\n\n→ Ohne Eigentumsvorbehalt kein Rückforderungsrecht.',
      },
      {
        id: 'vertrag-c',
        label: 'c)',
        points: 2,
        question:
          'Was gilt für Nutzen und Gefahr ab dem 6. Juni 2021 (Datum der Fahrzeugübergabe)?',
        answer:
          'Ab dem 6. Juni 2021 (Übergabe) gehen Nutzen und Gefahr auf MEIER über (OR Art. 185).\n→ Nutzen: Alle Vorteile aus dem Auto (z. B. Fahrgebrauch, Wertsteigerung) gehören MEIER.\n→ Gefahr: Das Risiko des zufälligen Untergangs oder der Beschädigung trägt ebenfalls MEIER.\n\nBeispiel: Wenn das Auto durch einen Hagelsturm beschädigt wird, trägt MEIER den Schaden.',
      },
      {
        id: 'vertrag-d1',
        label: 'd1)',
        points: 2,
        isSubQuestion: true,
        question:
          'MEIER stellt nach der Übergabe fest, dass KELLER den Scheinwerfer noch vor dem 6. Juni auf eigene Kosten reparieren liess. Kann MEIER von KELLER die Kosten für diese Reparatur zurückfordern?',
        answer:
          'Nein. KELLER hat den Mangel (defekter Scheinwerfer) bereits vor der Übergabe auf eigene Kosten behoben. Da der Scheinwerfer bei Übergabe einwandfrei war, liegt kein Sachmangel mehr vor. MEIER hat keinen Anspruch auf Kostenerstattung für eine Reparatur, die KELLER selbst vorgenommen hat.',
      },
      {
        id: 'vertrag-d2',
        label: 'd2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Bis zu welchem konkreten Datum hätte MEIER einen neu entdeckten Sachmangel rügen müssen?',
        answer:
          'Gemäss OR Art. 201 muss der Käufer den Mangel unverzüglich nach Entdeckung rügen, d. h. innerhalb weniger Tage (üblicherweise 2–5 Werktage).\n\nDa die Übergabe am 6. Juni 2021 stattfand, hätte MEIER einen bei der Übergabe erkennbaren Mangel spätestens bis ca. 11. Juni 2021 rügen müssen (5 Werktage).\n\nDie gesetzliche Gewährleistungsfrist bei beweglichen Sachen beträgt 2 Jahre (OR Art. 210).',
      },
      {
        id: 'vertrag-d3',
        label: 'd3)',
        points: 2,
        isSubQuestion: true,
        question:
          'Hätte KELLER die Sachmängelgewährleistung beim Abschluss des Kaufvertrages vollständig ausschliessen können?',
        answer:
          'Grundsätzlich ja – ein Gewährleistungsausschluss ist bei Gebrauchtwagen zulässig (OR Art. 199).\n\nAusnahme: Bei arglistiger Täuschung ist ein Gewährleistungsausschluss unwirksam (OR Art. 199, Satz 2). Wenn KELLER einen bekannten Mangel absichtlich verschwiegen hätte, wäre der Ausschluss nichtig. In diesem Fall hat KELLER den Scheinwerferschaden jedoch offengelegt → der Ausschluss wäre gültig.',
      },
      {
        id: 'vertrag-e1',
        label: 'e1)',
        points: 3,
        isSubQuestion: true,
        question:
          'MEIER bemerkt, dass das Fahrzeug laut einem unabhängigen Gutachten nur CHF 12\'000 wert ist, obwohl sie CHF 21\'400 bezahlt hat. Prüfen Sie anhand aller Tatbestandsmerkmale, ob beim vorliegenden Kaufvertrag eine Übervorteilung (OR Art. 21) vorliegt.',
        answer:
          'Tatbestandsmerkmale der Übervorteilung (OR Art. 21):\n\n1. Offensichtliches Missverhältnis: CHF 21\'400 vs. Wert CHF 12\'000 → Differenz ca. 78 % → klares Missverhältnis ✓\n2. Notlage, Unerfahrenheit oder Leichtsinn auf Seite des Benachteiligten: Ob MEIER in einer Notlage war oder unerfahren ist, muss nachgewiesen werden → unklar aus dem Sachverhalt, prüfen ✓/✗\n3. Ausnützung durch den Begünstigten (KELLER): KELLER muss wissentlich die Situation ausgenutzt haben → zu prüfen\n\nFazit: Das Missverhältnis ist offensichtlich gegeben. Ob alle Merkmale erfüllt sind, hängt von der Notlage/Unerfahrenheit MEIERs und der absichtlichen Ausnützung KELLERs ab.',
      },
      {
        id: 'vertrag-e2',
        label: 'e2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Wie müsste MEIER rechtlich vorgehen, falls eine Übervorteilung vorläge?',
        answer:
          'MEIER kann den Vertrag anfechten und auf Herabsetzung des Kaufpreises oder Rückabwicklung klagen (OR Art. 21 Abs. 1).\n\nFrist: Innerhalb von 1 Jahr ab Vertragsabschluss (OR Art. 21 Abs. 2).\n\nDa der Vertrag am 31. März 2021 abgeschlossen wurde, muss MEIER bis spätestens 31. März 2022 klagen.',
      },
    ],
  },
  {
    id: 'rechtsformen',
    number: 3,
    title: 'Handelsregister und Rechtsformen',
    emoji: '🏢',
    richtzeitMinutes: 10,
    totalPoints: 16,
    context:
      'ANNE MÜLLER ist ausgebildete Bäckerin und möchte sich selbständig machen. Sie plant, eine eigene Bäckerei zu eröffnen. In einem späteren Schritt möchte sie das Unternehmen zusammen mit HUGO SCHNEIDER ausbauen und dazu eine Aktiengesellschaft gründen.',
    questions: [
      {
        id: 'recht-a',
        label: 'a)',
        points: 2,
        question:
          'Welche Rechtsform empfehlen Sie MÜLLER für den Start, wenn sie nur wenig Startkapital hat und möglichst unkompliziert beginnen will? Erklären Sie die Haftung.',
        answer:
          'Empfehlung: Einzelunternehmung\n\n• Kein Mindestkapital erforderlich\n• Einfache Gründung (kein Handelsregistereintrag nötig bis CHF 100\'000 Umsatz)\n• Eintrag ins HR: Ab CHF 100\'000 Jahresumsatz obligatorisch\n\nHaftung: MÜLLER haftet unbeschränkt mit ihrem gesamten Privat- und Geschäftsvermögen (persönliche, unbeschränkte Haftung).',
      },
      {
        id: 'recht-b',
        label: 'b)',
        points: 2,
        question:
          'Schlagen Sie eine korrekte Firma (Name) für die Einzelunternehmung von MÜLLER vor und begründen Sie.',
        answer:
          'Korrekter Name: «Anne Müller» oder «Anne Müller Bäckerei»\n\nBegründung: Bei einer Einzelunternehmung muss die Firma den Familiennamen der Inhaberin enthalten (OR Art. 945). Phantasienamen oder Abkürzungen allein sind nicht zulässig.\n→ «Müller Bäckerei» oder «Anne Müller» ist zulässig.',
      },
      {
        id: 'recht-c',
        label: 'c)',
        points: 3,
        question:
          'MÜLLER und SCHNEIDER möchten gemeinsam eine Bäckerei führen, aber noch nicht viel Kapital einsetzen. Welche Rechtsform empfehlen Sie den beiden und welche konkrete Handlung müssen sie vornehmen?',
        answer:
          'Empfehlung: Kollektivgesellschaft (oder Einfache Gesellschaft für informellen Start)\n\nKollektivgesellschaft:\n• Kein Mindestkapital\n• Beide Gesellschafter haften unbeschränkt und solidarisch\n• Eintrag ins Handelsregister erforderlich\n• Gesellschaftsvertrag schriftlich empfohlen\n\nEinfache Gesellschaft (informeller Start):\n• Formlos, per Handschlag oder mündlich möglich\n• Kein HR-Eintrag\n• Empfehlenswert für Anfangsphase ohne grossen Aufwand',
      },
      {
        id: 'recht-d',
        label: 'd)',
        points: 3,
        question:
          'MÜLLER und SCHNEIDER beschliessen eine AG zu gründen. Das Aktienkapital beträgt CHF 200\'000. Das Gesellschaftskapital wird zum Zeitpunkt der Gründung mit dem gesetzlich vorgeschriebenen Minimum liberiert.\n\nWelchen Frankenbetrag müssen MÜLLER und SCHNEIDER insgesamt bei der Gründung einbezahlt haben?',
        answer:
          'Gesetzliches Minimum bei AG-Gründung:\n• Mindestens 20 % des Aktienkapitals oder CHF 50\'000 (der höhere Betrag gilt)\n\nBerechnung:\n• 20 % von CHF 200\'000 = CHF 40\'000\n• Aber: Mindestbetrag CHF 50\'000\n\n→ Da CHF 50\'000 > CHF 40\'000, müssen MÜLLER und SCHNEIDER mindestens CHF 50\'000 einbezahlt haben.',
      },
      {
        id: 'recht-e1',
        label: 'e1)',
        points: 3,
        isSubQuestion: true,
        question:
          'Das Aktienkapital der AG besteht aus 1\'000 Aktien à CHF 200 Nennwert. An der Generalversammlung nehmen alle 1\'000 Aktionäre teil. Es wird über eine Kapitalerhöhung abgestimmt. Welches Mehr ist für diesen Beschluss erforderlich?',
        answer:
          'Eine Kapitalerhöhung ist ein wichtiger Beschluss und erfordert ein qualifiziertes Mehr (OR Art. 704):\n\n• Mindestens 2/3 der vertretenen Stimmen UND\n• Absolute Mehrheit der vertretenen Aktiennennwerte\n\nBei 1\'000 Aktionären, alle anwesend:\n→ Mindestens 667 Ja-Stimmen UND\n→ Ja-Stimmen mit Nennwert von mindestens CHF 100\'001 (>50 % von CHF 200\'000)',
      },
      {
        id: 'recht-f',
        label: 'f)',
        points: 3,
        question:
          'An der Generalversammlung stimmen 580 Aktionäre für die Kapitalerhöhung und 420 dagegen. Wird die Kapitalerhöhung angenommen? Begründen Sie.',
        answer:
          'Nein, die Kapitalerhöhung wird nicht angenommen.\n\nPrüfung:\n• Qualifiziertes Mehr erfordert 2/3 der Stimmen = 667 von 1\'000\n• 580 Ja-Stimmen < 667 notwendige Stimmen\n\n→ Das qualifizierte Mehr wurde nicht erreicht. Der Beschluss ist abgelehnt.',
      },
    ],
  },
  {
    id: 'volkswirtschaft',
    number: 4,
    title: 'Volkswirtschaft — Kartoffelmarkt',
    emoji: '📈',
    richtzeitMinutes: 10,
    totalPoints: 12,
    context:
      'Wir beschäftigen uns mit dem Kartoffelmarkt der Schweiz. Es liegen folgende Preis-Mengen-Paare vor:\n\nAngebot: 50 Rp/kg → 20 t | 100 Rp/kg → 40 t | 150 Rp/kg → 60 t\nNachfrage: 50 Rp/kg → 60 t | 100 Rp/kg → 40 t | 150 Rp/kg → 20 t',
    questions: [
      {
        id: 'vwl-a1',
        label: 'a1)',
        points: 3,
        isSubQuestion: true,
        question:
          'Zeichnen Sie Angebots- und Nachfragekurve für den Kartoffelmarkt in ein Preis-Mengen-Diagramm und beschriften Sie alle Achsen sowie das Marktgleichgewicht.',
        answer:
          'Diagramm-Aufbau:\n• Y-Achse: Preis (Rp/kg)\n• X-Achse: Menge (Tonnen)\n\nNachfragekurve: fällt von links oben nach rechts unten\n• Punkte: (20t, 150 Rp) → (40t, 100 Rp) → (60t, 50 Rp)\n\nAngebotskurve: steigt von links unten nach rechts oben\n• Punkte: (20t, 50 Rp) → (40t, 100 Rp) → (60t, 150 Rp)\n\nMarktgleichgewicht (Schnittpunkt):\n→ Preis = 100 Rp/kg, Menge = 40 t\n→ Als Punkt markieren und beschriften: «Gleichgewicht P* = 100 Rp, Q* = 40 t»',
      },
      {
        id: 'vwl-a2',
        label: 'a2)',
        points: 3,
        isSubQuestion: true,
        question:
          'Im Jahr 2021 steigern die Schweizer Landwirte ihre Produktionskapazitäten bei Kartoffeln erheblich. Zeichnen Sie die Auswirkung auf den Kartoffelmarkt und beschreiben Sie die Veränderung des Gleichgewichts.',
        answer:
          'Auswirkung: Die Angebotskurve verschiebt sich nach rechts (Angebotsausweitung).\n\nNeues Gleichgewicht:\n→ Der Gleichgewichtspreis sinkt (P* tiefer)\n→ Die Gleichgewichtsmenge steigt (Q* höher)\n\nErklärung: Bei gleichbleibender Nachfrage und mehr Angebot entsteht Überschussangebot. Der Preis sinkt, bis sich Angebot und Nachfrage wieder im neuen, tieferen Gleichgewichtspunkt treffen.',
      },
      {
        id: 'vwl-b1',
        label: 'b1)',
        points: 3,
        isSubQuestion: true,
        question:
          'Beurteilen Sie die folgende Aussage: «Falls ein Hagelsturm die Kartoffeln zerstört, wird die Angebotskurve nach links verschoben.» — Richtig oder falsch? Begründen Sie.',
        answer:
          'Richtig.\n\nBegründung: Ein Hagelsturm vernichtet Teile der Ernte → das Angebot sinkt → die Angebotskurve verschiebt sich nach links. Bei gleichbleibender Nachfrage entsteht Angebotsknappheit → der Gleichgewichtspreis steigt und die Gleichgewichtsmenge sinkt.',
      },
      {
        id: 'vwl-b2',
        label: 'b2)',
        points: 3,
        isSubQuestion: true,
        question:
          'Beurteilen Sie die folgende Aussage: «Ein staatlich festgelegter Mindestpreis für Kartoffeln liegt in der Regel über dem durch den Markt gebildeten Gleichgewichtspreis.» — Richtig oder falsch? Begründen Sie.',
        answer:
          'Richtig.\n\nBegründung: Ein Mindestpreis (Preisuntergrenze) ist nur sinnvoll, wenn er über dem Marktgleichgewichtspreis liegt. Liegt er darunter, hat er keinen Effekt, da der Markt sowieso höher handelt. Ein Mindestpreis über dem Gleichgewicht schützt Produzenten (z. B. Bauern), führt aber zu Angebotsüberschuss (Überproduktion), weil mehr angeboten als nachgefragt wird.',
      },
    ],
  },
  {
    id: 'geldpolitik',
    number: 5,
    title: 'Geldpolitik & Konjunktur',
    emoji: '💰',
    richtzeitMinutes: 10,
    totalPoints: 18,
    context:
      'In der Zeitung vom Dezember 2021 findet sich: «Die Schweizerische Nationalbank (SNB) belässt den Leitzins auf seinem bisherigen Niveau von –0.75 Prozent. Sie führt damit die expansive Geldpolitik fort. Es wird davon ausgegangen, dass die SNB den Leitzins bis Ende 2022 auf –0.25 Prozentpunkte hebt.» — Der KOF-Konjunkturbarometer zeigt für das Jahr 2022 einen Wert von 102 und prognostiziert ein BIP-Wachstum von 1.4 %.',
    questions: [
      {
        id: 'geld-a',
        label: 'a)',
        points: 2,
        question: 'Erkläre den Begriff «expansive Geldpolitik».',
        answer:
          'Expansive Geldpolitik: Die Zentralbank (SNB) erhöht die Geldmenge und senkt die Zinsen, um die Wirtschaft anzukurbeln.\n\nWirkung:\n• Kredite werden günstiger → mehr Investitionen durch Unternehmen\n• Konsum steigt, da Sparen weniger attraktiv ist\n• Exportwirtschaft profitiert (schwächerer Franken)\n\nZiel: Wirtschaftswachstum fördern, Deflation verhindern.',
      },
      {
        id: 'geld-b',
        label: 'b)',
        points: 3,
        question:
          'Welche Auswirkungen hat eine partielle Anhebung des Leitzinses auf Investitionen und Konsumverhalten? Begründen Sie.',
        answer:
          'Auswirkungen einer Leitzinserhöhung:\n\n• Investitionen sinken: Kredite werden teurer → Unternehmen investieren weniger, da Rendite die Kreditkosten übersteigen muss\n• Konsum sinkt: Hypotheken und Konsumkredite werden teurer → Haushalte sparen mehr, geben weniger aus\n• Sparen attraktiver: Höhere Zinsen auf Sparkonten → Geld wird zurückgehalten\n• Franken aufgewertet: Höhere Zinsen ziehen ausländisches Kapital an → CHF stärker → Export leidet',
      },
      {
        id: 'geld-c',
        label: 'c)',
        points: 2,
        question:
          'Nenne zwei Hauptmotive, warum die SNB den Leitzins lange auf –0.75 % belassen hat.',
        answer:
          '1. Frankenstärke bekämpfen: Negativzinsen machen das Halten von CHF unattraktiv → verhindert Kapitalzuflüsse aus dem Ausland → CHF bleibt schwächer → Schweizer Exportwirtschaft profitiert\n\n2. Wirtschaft ankurbeln / Deflation verhindern: Tiefe Zinsen fördern Investitionen und Konsum und schützen vor sinkenden Preisen (Deflation), die zu einer Abwärtsspirale führen könnten.',
      },
      {
        id: 'geld-d',
        label: 'd)',
        points: 3,
        question: 'Was ist eine Stagflation? Erläutere den Begriff.',
        answer:
          'Stagflation = Kombination aus «Stagnation» und «Inflation».\n\nEs tritt gleichzeitig auf:\n• Wirtschaftliche Stagnation oder Rezession (sinkendes / stagnierendes BIP)\n• Steigende Preise (Inflation)\n• Häufig auch steigende Arbeitslosigkeit\n\nProblem: Normalerweise wirkt man gegen Inflation mit Zinserhöhungen (bremst die Wirtschaft) und gegen Rezession mit Zinssenkungen (stimuliert die Wirtschaft). Beide Massnahmen schliessen sich gegenseitig aus → besonders schwer zu bekämpfen.\n\nBeispiel: Ölkrise 1970er Jahre.',
      },
      {
        id: 'geld-e',
        label: 'e)',
        points: 2,
        question:
          'Was versteht man unter dem KOF-Konjunkturbarometer und was bedeutet ein Wert von 102?',
        answer:
          'Der KOF-Konjunkturbarometer ist ein Frühindikator für die Schweizer Konjunktur. Er wird vom Konjunkturforschungsinstitut KOF der ETH Zürich berechnet und prognostiziert, wie sich die Schweizer Wirtschaft in den nächsten 6–9 Monaten entwickeln wird.\n\nInterpretation:\n• Wert > 100: überdurchschnittliches Wirtschaftswachstum erwartet\n• Wert < 100: unterdurchschnittliches Wachstum / Abschwächung erwartet\n\nWert 102: leicht überdurchschnittliches Wachstum → positive Konjunkturaussichten für die Schweiz.',
      },
      {
        id: 'geld-f',
        label: 'f)',
        points: 2,
        question:
          'Für das Jahr 2022 wird ein konjunktureller Rückgang der Arbeitslosigkeit erwartet. Erläutere den Begriff «konjunkturelle Arbeitslosigkeit».',
        answer:
          'Konjunkturelle Arbeitslosigkeit (auch: zyklische Arbeitslosigkeit) entsteht durch einen Rückgang der wirtschaftlichen Aktivität (Konjunkturabschwung / Rezession).\n\n• Unternehmen produzieren weniger → weniger Arbeitskräfte nötig → Entlassungen\n• Gesamtwirtschaftliche Nachfrage sinkt → Auftragsrückgang\n\nMerkmal: Sie ist vorübergehend und hängt direkt vom Konjunkturzyklus ab. Bei wirtschaftlichem Aufschwung steigt die Beschäftigung wieder.',
      },
      {
        id: 'geld-g',
        label: 'g)',
        points: 4,
        question:
          'Beurteilen Sie folgende Aussagen als richtig oder falsch. Korrigieren Sie die falschen Aussagen.\n\ng1) Der Rückgang in der Textilindustrie aufgrund der Digitalisierung hat zu konjunktureller Arbeitslosigkeit geführt.\ng2) Die Erhöhung der Staatsausgaben in Form von öffentlichen Investitionen ist ein Instrument der expansiven Fiskalpolitik.\ng3) In einer Rezession steigt die Arbeitslosigkeit verzögert an, da Unternehmen zuerst andere Massnahmen ergreifen.\ng4) Eine Senkung des Leitzinses ist ein Instrument der expansiven Geldpolitik der SNB.',
        answer:
          '• g1) Falsch — Der Rückgang der Textilindustrie durch Digitalisierung ist strukturelle Arbeitslosigkeit (dauerhafter Strukturwandel), nicht konjunkturelle.\n\n• g2) Richtig — Staatliche Investitionen erhöhen die Nachfrage in der Wirtschaft → expansive Fiskalpolitik.\n\n• g3) Richtig — Die Arbeitslosigkeit ist ein «Lagging Indicator»: Unternehmen reduzieren zuerst Überstunden, Teilzeit etc., bevor sie Entlassungen vornehmen.\n\n• g4) Richtig — Leitzinssenkung verbilligt Kredite → Investitionen und Konsum steigen → expansive Geldpolitik.',
      },
    ],
  },
]
