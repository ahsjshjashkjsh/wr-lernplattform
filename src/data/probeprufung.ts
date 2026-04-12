export type ExamQuestion = {
  id: string
  question: string
  answer: string
}

export type ExamSection = {
  id: string
  title: string
  emoji: string
  richtzeit?: string
  context?: string
  questions: ExamQuestion[]
}

export const EXAM_SECTIONS: ExamSection[] = [
  {
    id: 'marketing',
    title: 'Marketing',
    emoji: '📊',
    richtzeit: '10 Minuten',
    context: 'Die ALPENLODGE ist ein kleines, modernes Sporthotel in den Schweizer Alpen, das verkehrstechnisch sehr gut gelegen ist und sehr nahe zur Langlaufloipe und zu den Velowegen liegt.',
    questions: [
      {
        id: 'marketing-a',
        question: 'a) Was ist eine Marktsegmentierung? Damit die ALPENLODGE wirksames Marketing betreiben kann, muss das Sporthotel den Markt segmentieren.',
        answer: 'Marktsegmentierung bedeutet die Aufteilung eines Gesamtmarktes in kleinere Teilmärkte (Segmente), die aus Kundengruppen mit ähnlichen Bedürfnissen oder Eigenschaften bestehen. Dadurch kann das Unternehmen gezielter auf diese Gruppen eingehen.',
      },
      {
        id: 'marketing-b1',
        question: 'b1) Berechne den Marktanteil der ALPENLODGE. (Übernachtungen ALPENLODGE: 6\'500 / Gesamtmarkt: 300\'000)',
        answer: 'Marktanteil = (6\'500 / 300\'000) × 100 = 2.17 %\n\nAntwort: ca. 2.2 %',
      },
      {
        id: 'marketing-b2',
        question: 'b2) Um welche Marktform handelt es sich?',
        answer: 'Eher gesättigter Markt, da viele Anbieter und hohe Konkurrenz.',
      },
      {
        id: 'marketing-c',
        question: 'c) Nenne je ein Beispiel für die vier Instrumente des Marketing-Mix für die ALPENLODGE (Businesskunden).',
        answer: '• Produkt: Businesszimmer mit WLAN und Arbeitsplatz\n• Preis: Firmenrabatte\n• Distribution: Buchungsplattformen\n• Promotion: LinkedIn Werbung',
      },
      {
        id: 'marketing-d',
        question: 'd) Ordne folgende Produkte den Phasen des Produktlebenszyklus zu:\nd1) Kassetten-Walkman  d2) E-Bike  d3) Streaming-Dienste',
        answer: '• d1: Degenerationsphase\n• d2: Einführungsphase\n• d3: Wachstumsphase',
      },
    ],
  },
  {
    id: 'vertragslehre',
    title: 'Vertragslehre',
    emoji: '⚖️',
    questions: [
      {
        id: 'vertrag-a',
        question: 'a) Wo ist der Zahlungsort beim Kaufvertrag? (Bringschuld oder Holschuld?)',
        answer: 'Wohnort des Verkäufers (Bringschuld)',
      },
      {
        id: 'vertrag-b',
        question: 'b) Kann der Käufer vom Vertrag zurücktreten, wenn der Verkäufer nicht liefert?',
        answer: 'Ja, nach Mahnung und Fristsetzung ist ein Rücktritt möglich.',
      },
      {
        id: 'vertrag-c',
        question: 'c) Wann gehen Nutzen und Gefahr auf den Käufer über?',
        answer: '6. Juni 2021 (zum vereinbarten Lieferzeitpunkt)',
      },
      {
        id: 'vertrag-d1',
        question: 'd1) Liegt ein Mangel vor, wenn die gelieferte Ware beschädigt ist?',
        answer: 'Ja, ein Mangel liegt vor. Der Käufer kann Reparatur (Nachbesserung) verlangen.',
      },
      {
        id: 'vertrag-d2',
        question: 'd2) Welche Frist gilt für die Mängelrüge?',
        answer: 'Unverzüglich (innerhalb weniger Tage nach Entdeckung des Mangels).',
      },
      {
        id: 'vertrag-d3',
        question: 'd3) Kann der Gewährleistungsausschluss im Vertrag auch bei Täuschung gelten?',
        answer: 'Nein, bei arglistiger Täuschung ist ein Gewährleistungsausschluss ungültig.',
      },
      {
        id: 'vertrag-e1',
        question: 'e1) Liegt eine Übervorteilung vor, wenn jemand eine Sache weit unter Wert verkauft, weil er in Not ist?',
        answer: 'Ja, eine Übervorteilung liegt vor, wenn ein offensichtliches Missverhältnis zwischen Leistung und Gegenleistung besteht und eine Notlage ausgenutzt wird.',
      },
      {
        id: 'vertrag-e2',
        question: 'e2) Wie kann die betroffene Person vorgehen?',
        answer: 'Den Vertrag anfechten (Frist: 1 Jahr ab Vertragsabschluss).',
      },
    ],
  },
  {
    id: 'rechtsformen',
    title: 'Rechtsformen',
    emoji: '🏢',
    questions: [
      {
        id: 'recht-a',
        question: 'a) Wie haftet der Inhaber eines Einzelunternehmens?',
        answer: 'Unbeschränkte Haftung — der Inhaber haftet mit seinem gesamten Privat- und Geschäftsvermögen.',
      },
      {
        id: 'recht-b',
        question: 'b) Wie muss die Firma (Name) eines Einzelunternehmens lauten? (Inhaber: Andi Müller, Betrieb: Bäckerei)',
        answer: 'Andi Müller Bäckerei (der Familienname des Inhabers muss enthalten sein).',
      },
      {
        id: 'recht-c',
        question: 'c) Zwei Personen beschliessen per Handschlag, gemeinsam ein Projekt zu starten. Welche Gesellschaftsform entsteht?',
        answer: 'Einfache Gesellschaft (formlos, kein Handelsregistereintrag nötig).',
      },
      {
        id: 'recht-d1',
        question: 'd1) Wann entsteht eine Aktiengesellschaft rechtlich?',
        answer: 'Mit dem Eintrag ins Handelsregister.',
      },
      {
        id: 'recht-d2',
        question: 'd2) Wie hoch ist das Mindestaktienkapital einer AG?',
        answer: 'CHF 100\'000 (davon mind. CHF 50\'000 oder 20 % liberiert).',
      },
      {
        id: 'recht-e1',
        question: 'e1) Welches Mehr braucht es für einen Beschluss zur Satzungsänderung an der Generalversammlung?',
        answer: 'Qualifiziertes Mehr (2/3 der vertretenen Stimmen + absolute Mehrheit der vertretenen Aktiennennwerte).',
      },
      {
        id: 'recht-e2',
        question: 'e2) Kann die GV die Vergütung des Verwaltungsrates festlegen?',
        answer: 'Ja, die Generalversammlung ist zuständig für die Genehmigung der Vergütungen des Verwaltungsrates.',
      },
    ],
  },
  {
    id: 'volkswirtschaft',
    title: 'Volkswirtschaft',
    emoji: '📈',
    questions: [
      {
        id: 'vwl-a',
        question: 'a) Das Angebot eines Gutes sinkt (z. B. durch einen Ernteausfall). Was passiert mit Preis und Menge im Marktgleichgewicht?',
        answer: 'Preis steigt, Menge sinkt (Angebotskurve verschiebt sich nach links).',
      },
      {
        id: 'vwl-b',
        question: 'b) Beurteile folgende Aussagen als richtig oder falsch:\nb1) Ein höherer Preis führt immer zu mehr Nachfrage.\nb2) Bei vollkommener Konkurrenz können Anbieter den Preis selbst bestimmen.\nb3) Eine Nachfrageerhöhung führt zu einem tieferen Gleichgewichtspreis.',
        answer: '• b1: Falsch (höherer Preis → weniger Nachfrage, ceteris paribus)\n• b2: Falsch (bei vollkommener Konkurrenz sind Anbieter Preisnehmer)\n• b3: Falsch (Nachfrageerhöhung → höherer Gleichgewichtspreis)',
      },
    ],
  },
  {
    id: 'geldpolitik',
    title: 'Geldpolitik',
    emoji: '💰',
    questions: [
      {
        id: 'geld-a',
        question: 'a) Was versteht man unter einer expansiven Geldpolitik? Was sind die Auswirkungen?',
        answer: 'Expansive Geldpolitik: Die Zentralbank erhöht die Geldmenge und senkt die Zinsen, um die Wirtschaft anzukurbeln. Auswirkungen: mehr Kredite, mehr Investitionen, höhere Nachfrage.',
      },
      {
        id: 'geld-b',
        question: 'b) Was passiert mit den Investitionen, wenn die SNB die Zinsen erhöht?',
        answer: 'Investitionen sinken, weil Kredite teurer werden und sich weniger lohnen.',
      },
      {
        id: 'geld-c',
        question: 'c) Was ist Deflation und wodurch entsteht sie?',
        answer: 'Deflation = anhaltender Rückgang des Preisniveaus. Ursache: Nachfragerückgang, zu wenig Geld im Umlauf. Gefährlich, weil Konsumenten Käufe aufschieben → Spirale nach unten.',
      },
      {
        id: 'geld-d',
        question: 'd) Was ist Stagflation?',
        answer: 'Stagflation = gleichzeitiges Auftreten von Inflation (steigende Preise) und wirtschaftlicher Stagnation (kein Wachstum / Rezession). Besonders schwer zu bekämpfen.',
      },
      {
        id: 'geld-e',
        question: 'e) Warum sprechen Ökonomen von einem "Zielkonflikt" bei der Geldpolitik?',
        answer: 'Zielkonflikt: Massnahmen gegen Inflation (Zinserhöhung) bremsen gleichzeitig das Wirtschaftswachstum. Beide Ziele gleichzeitig zu erreichen ist oft nicht möglich.',
      },
    ],
  },
  {
    id: 'arbeitslosigkeit',
    title: 'Arbeitslosigkeit',
    emoji: '📉',
    questions: [
      {
        id: 'arbeit-a',
        question: 'a) Nenne zwei Frühindikatoren für eine bevorstehende Rezession.',
        answer: '• Rückgang der Auftragseingänge in der Industrie\n• Rückgang des privaten Konsums / Konsumentenstimmung',
      },
      {
        id: 'arbeit-b',
        question: 'b) Nenne zwei Arten von Arbeitslosigkeit und erkläre sie kurz.',
        answer: '• Strukturelle Arbeitslosigkeit: entsteht durch strukturellen Wandel (z. B. Digitalisierung, Branchen sterben aus)\n• Saisonale Arbeitslosigkeit: entsteht durch jahreszeitliche Schwankungen (z. B. Tourismus, Baubranche)',
      },
      {
        id: 'arbeit-c',
        question: 'c) Welche staatlichen Massnahmen helfen gegen strukturelle Arbeitslosigkeit?',
        answer: '• Weiterbildungs- und Umschulungsprogramme\n• Staatliche Investitionen in neue Branchen\n• Förderung von Innovation und Digitalisierung',
      },
      {
        id: 'arbeit-d',
        question: 'd) Beurteile folgende Aussagen:\nd1) Vollbeschäftigung bedeutet 0 % Arbeitslosigkeit.\nd2) Die Arbeitslosenquote steigt in einer Rezession typischerweise an.\nd3) Frictional unemployment (Sucharbeitslosigkeit) ist kurzfristiger Natur.',
        answer: '• d1: Richtig (Vollbeschäftigung = keine unfreiwillige Arbeitslosigkeit, ca. 0 %)\n• d2: Falsch (sie steigt, aber oft verzögert — "Lagging Indicator")\n• d3: Richtig (Sucharbeitslosigkeit entsteht beim Stellenwechsel und ist kurzfristig)',
      },
    ],
  },
]
