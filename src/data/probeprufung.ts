export type ExamQuestion = {
  id: string
  label: string
  question: string
  answer: string
  points: number
  isSubQuestion?: boolean
  isIntroText?: boolean
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
  // ─── 1. MARKETING ───────────────────────────────────────────────────────────
  {
    id: 'marketing',
    number: 1,
    title: 'Marketing',
    emoji: '📊',
    richtzeitMinutes: 10,
    totalPoints: 16,
    context:
      'Die ALPENLODGE ist ein kleines, modernes Sporthotel in den Schweizer Alpen, das verkehrstechnisch sehr gut gelegen ist und sehr nahe zur Langlaufloipe und zu den Velowegen liegt.',
    questions: [
      {
        id: 'mkt-a',
        label: 'a)',
        points: 2,
        question:
          'Damit die ALPENLODGE wirksames Marketing betreiben kann, muss das Sporthotel den Markt segmentieren.\nWas ist eine Marktsegmentierung?',
        answer:
          'Marktsegmentierung ist die Aufteilung des Gesamtmarktes in kleinere Teilgruppen (Segmente) mit ähnlichen Bedürfnissen oder Eigenschaften.\n\nZiel: Das Marketing gezielt auf die Zielgruppe ausrichten, um sie besser anzusprechen.',
      },
      {
        id: 'mkt-b-text',
        label: 'b)',
        points: 0,
        isIntroText: true,
        question:
          'In der Schweiz mit 8 Mio. Einwohnerinnen und Einwohnern war im Jahr 2021 rund 25 % der Bevölkerung sportlich aktiv und könnte sich den Aufenthalt in einem Hotel leisten.\nIn einem Sporthotel hatten in diesem Jahr 300\'000 Schweizerinnen und Schweizer übernachtet.',
        answer: '',
      },
      {
        id: 'mkt-b1',
        label: 'b1)',
        points: 3,
        isSubQuestion: true,
        question:
          'Wie gross ist der Marktanteil der ALPENLODGE im Jahr 2021, wenn das Hotel 6\'500 Gäste zählt?',
        answer:
          'Marktanteil = Absatz ALPENLODGE / Gesamtmarkt × 100\n\n= 6\'500 / 300\'000 × 100\n= 2.17 %\n\n→ Die ALPENLODGE hat einen Marktanteil von ca. 2.2 %.',
      },
      {
        id: 'mkt-b2',
        label: 'b2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Handelt es sich beim für die ALPENLODGE massgeblichen Markt um einen gesättigten oder um einen ungesättigten Markt?',
        answer:
          'Ungesättigter Markt.\n\nMarktpotenzial: 8\'000\'000 × 25 % = 2\'000\'000 Personen.\nTatsächlich haben nur 300\'000 in einem Sporthotel übernachtet.\n→ Es gibt noch viel ungenutztes Potenzial → ungesättigter Markt.',
      },
      {
        id: 'mkt-c',
        label: 'c)',
        points: 4,
        question:
          'Die ALPENLODGE beschliesst, sich fortan als Businesshotel zu positionieren.\nEntwerfen Sie für die ALPENLODGE als Businesshotel einen stimmigen Marketing-Mix und nennen Sie für jedes Marketinginstrument ein konkretes Beispiel.',
        answer:
          '• Produkt (Product): Businesszimmer mit Schreibtisch, stabilem WLAN und Drucker\n• Preis (Price): Firmenpauschalen / Konferenzpakete zu günstigeren Preisen für Firmen\n• Distribution (Place): Buchbar über Businessreise-Plattformen sowie direkte Firmenverträge\n• Kommunikation (Promotion): LinkedIn-Werbung, Kaltakquise bei regionalen KMU',
      },
      {
        id: 'mkt-d-text',
        label: 'd)',
        points: 0,
        isIntroText: true,
        question:
          'Beurteilen Sie, welcher Phase des Produktlebenszyklus die folgenden Aussagen zugeordnet werden können.',
        answer: '',
      },
      {
        id: 'mkt-d1',
        label: 'd1)',
        points: 2,
        isSubQuestion: true,
        question:
          'Die Zimmer der ALPENLODGE sind stark abgenutzt und werden nicht renoviert. Neue Angebote wie z. B. „4 Nächte schlafen – 3 Nächte bezahlen" werden geschaffen.',
        answer:
          'Phase: Rückgangsphase (Degenerationsphase)\n\nDer Umsatz sinkt stark, es wird kaum noch investiert. Um die Nachfrage zu stützen, werden Sonderangebote und Rabattaktionen eingesetzt.',
      },
      {
        id: 'mkt-d2',
        label: 'd2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Die Marketingausgaben der ALPENLODGE sind sehr hoch, der Umsatz ist noch gering. Es muss vorläufig mit Verlusten gerechnet werden.',
        answer:
          'Phase: Einführungsphase\n\nDas Hotel ist noch wenig bekannt, es müssen hohe Investitionen in Werbung und Markteinführung getätigt werden. Der Umsatz deckt die Kosten noch nicht → Verluste.',
      },
      {
        id: 'mkt-d3',
        label: 'd3)',
        points: 1,
        isSubQuestion: true,
        question:
          'Die Mund-zu-Mund-Propaganda bewirkt, dass immer mehr neue Gäste bei der ALPENLODGE einen Aufenthalt buchen. Die Gewinnschwelle wird schliesslich überschritten.',
        answer:
          'Phase: Wachstumsphase\n\nDas Hotel wird bekannter, die Buchungszahlen steigen stark. Mund-zu-Mund-Empfehlungen ersetzen teure Werbung. Der Umsatz übersteigt die Kosten → Gewinnschwelle wird erreicht.',
      },
    ],
  },

  // ─── 2. VERTRAGSLEHRE ────────────────────────────────────────────────────────
  {
    id: 'vertragslehre',
    number: 2,
    title: 'Allg. Vertragslehre und Kaufvertrag',
    emoji: '⚖️',
    richtzeitMinutes: 10,
    totalPoints: 16,
    context:
      'ANNA MEIER kauft von KURT KELLER ein Occasionsauto. Der Vertrag wird am 31. Mai 2021 abgeschlossen. Das Auto wird am 6. Juni 2021 übergeben. Die Zahlung soll am 30. Juni 2021 erfolgen.',
    questions: [
      {
        id: 'vtr-a',
        label: 'a)',
        points: 1,
        question: 'Wo ist der Kaufpreis geschuldet?',
        answer:
          'Am Wohnsitz des Gläubigers (KELLER).\n\nGeldschulden sind Bringschulden: Der Schuldner (MEIER) muss die Zahlung zum Gläubiger (KELLER) bringen.',
      },
      {
        id: 'vtr-b',
        label: 'b)',
        points: 2,
        question:
          'Könnte KELLER das Occasionsauto zurückverlangen, falls MEIER den Kaufpreis auch nach wiederholter Mahnung nicht bezahlen würde?',
        answer:
          'Nein — ausser es wurde ein Eigentumsvorbehalt vereinbart.\n\nOhne Eigentumsvorbehalt geht das Eigentum mit der Übergabe auf MEIER über. KELLER hat kein automatisches Rückforderungsrecht.\n\nKELLER kann aber:\n• Eine Mahnung mit Nachfrist setzen\n• Bei Fristablauf: vom Vertrag zurücktreten\n• Oder auf Zahlung klagen',
      },
      {
        id: 'vtr-c',
        label: 'c)',
        points: 2,
        question: 'Wann gehen Nutzen und Gefahr nach Gesetz auf MEIER über?',
        answer:
          'Am 6. Juni 2021 — dem Tag der Fahrzeugübergabe.\n\nAb diesem Zeitpunkt trägt MEIER das Risiko für zufälligen Untergang oder Beschädigung und hat Anspruch auf alle Vorteile des Fahrzeugs.',
      },
      {
        id: 'vtr-d-text',
        label: 'd)',
        points: 0,
        isIntroText: true,
        question:
          'Nach der Fahrzeugübernahme stellt MEIER fest, dass der linke Scheinwerfer defekt ist.',
        answer: '',
      },
      {
        id: 'vtr-d1',
        label: 'd1)',
        points: 2,
        isSubQuestion: true,
        question:
          'Kann MEIER von KELLER verlangen, dass dieser den Scheinwerfer auf eigene Kosten reparieren lässt?',
        answer:
          'Ja. MEIER kann Sachmängelgewährleistung geltend machen.\n\nSie hat folgende Rechte:\n• Nachbesserung (Reparatur auf Kosten KELLERs)\n• Minderung (Kaufpreisreduktion)\n• Wandlung (Rückgabe des Autos gegen Rückerstattung des Kaufpreises)\n\nVoraussetzung: Der Mangel muss unverzüglich nach Entdeckung gemeldet werden.',
      },
      {
        id: 'vtr-d2',
        label: 'd2)',
        points: 2,
        isSubQuestion: true,
        question: 'Bis wann muss MEIER den Mangel melden bzw. die Kosten zurückfordern?',
        answer:
          'MEIER muss den Mangel unverzüglich nach Entdeckung rügen.\n\nDie gesetzliche Gewährleistungsfrist beträgt 2 Jahre ab Übergabe → bis 6. Juni 2023.',
      },
      {
        id: 'vtr-d3',
        label: 'd3)',
        points: 2,
        isSubQuestion: true,
        question: 'Hätte KELLER seine Sachgewährleistungspflicht ausschliessen können?',
        answer:
          'Ja, ein Gewährleistungsausschluss ist grundsätzlich zulässig.\n\nAusnahme: Bei arglistiger Täuschung ist der Ausschluss ungültig. Wenn KELLER den Defekt kannte und ihn absichtlich verschwieg, wäre der Ausschluss nichtig.',
      },
      {
        id: 'vtr-e-text',
        label: 'e)',
        points: 0,
        isIntroText: true,
        question:
          'MEIER erfährt später, dass das Auto nur CHF 5\'000 wert ist, sie aber CHF 20\'000 bezahlt hat.',
        answer: '',
      },
      {
        id: 'vtr-e1',
        label: 'e1)',
        points: 2,
        isSubQuestion: true,
        question: 'Liegt eine Übervorteilung vor?',
        answer:
          'Ja, eine Übervorteilung liegt vor, wenn drei Voraussetzungen erfüllt sind:\n\n1. Offensichtliches Missverhältnis: CHF 5\'000 wert, CHF 20\'000 bezahlt → klar gegeben\n2. Schwächesituation von MEIER (Notlage, Unerfahrenheit oder Leichtsinn)\n3. Bewusstes Ausnützen durch KELLER\n\n→ Das Missverhältnis ist eindeutig. Wenn auch Schwächesituation und Ausnützung vorliegen: Übervorteilung.',
      },
      {
        id: 'vtr-e2',
        label: 'e2)',
        points: 3,
        isSubQuestion: true,
        question: 'Wie muss MEIER rechtlich vorgehen?',
        answer:
          'MEIER muss den Kaufvertrag wegen Übervorteilung anfechten.\n\nVorgehen:\n1. Anfechtungserklärung gegenüber KELLER abgeben\n2. Rückabwicklung verlangen (Auto zurück, Kaufpreis zurück)\n\nFrist: Die Anfechtung muss innerhalb von 1 Jahr ab Vertragsabschluss erfolgen.\n→ Vertragsabschluss 31. Mai 2021 → Frist bis 31. Mai 2022.',
      },
    ],
  },

  // ─── 3. RECHTSFORMEN ─────────────────────────────────────────────────────────
  {
    id: 'rechtsformen',
    number: 3,
    title: 'Handelsregister und Rechtsformen',
    emoji: '🏢',
    richtzeitMinutes: 10,
    totalPoints: 14,
    context: 'ANDI MÜLLER möchte eine eigene Bäckerei gründen.',
    questions: [
      {
        id: 'rft-a',
        label: 'a)',
        points: 2,
        question:
          'Begründen Sie, warum das Einzelunternehmen für dieses Vorhaben ungeeignet ist.',
        answer:
          '• Unbeschränkte persönliche Haftung: ANDI MÜLLER haftet mit seinem gesamten Privatvermögen. Bei einem Misserfolg ist sein persönliches Eigentum gefährdet.\n• Kapitalbeschaffung schwierig: Als Einzelunternehmer kann er kein Kapital über Aktien beschaffen. Investitionen sind schwerer zu finanzieren.',
      },
      {
        id: 'rft-b',
        label: 'b)',
        points: 2,
        question: 'Nennen Sie eine korrekte Firma für das Unternehmen.',
        answer:
          'Korrekte Firma: «Andi Müller» oder «Andi Müller Bäckerei»\n\nBei einer Einzelunternehmung muss die Firma zwingend den Familiennamen des Inhabers enthalten. Phantasienamen allein (z. B. «Leckerbissen») sind nicht zulässig.',
      },
      {
        id: 'rft-c',
        label: 'c)',
        points: 2,
        question:
          'ANDI MÜLLER gründet mit einer Freundin per Handschlag ein Unternehmen.\nWelche Rechtsform liegt vor?',
        answer:
          'Einfache Gesellschaft.\n\n• Entsteht formlos, bereits per Handschlag oder mündlich\n• Kein Handelsregistereintrag erforderlich\n• Beide Gesellschafter haften unbeschränkt und solidarisch',
      },
      {
        id: 'rft-d-text',
        label: 'd)',
        points: 0,
        isIntroText: true,
        question: 'ANDI MÜLLER entscheidet sich später für eine Aktiengesellschaft (AG).',
        answer: '',
      },
      {
        id: 'rft-d1',
        label: 'd1)',
        points: 2,
        isSubQuestion: true,
        question: 'Wann entsteht die AG rechtlich?',
        answer:
          'Die AG entsteht mit dem Eintrag ins Handelsregister.\n\nErst ab diesem Zeitpunkt ist die AG eine eigenständige juristische Person mit eigener Rechtspersönlichkeit.',
      },
      {
        id: 'rft-d2',
        label: 'd2)',
        points: 2,
        isSubQuestion: true,
        question: 'Wie viel Kapital muss mindestens einbezahlt werden?',
        answer:
          'Mindestens 20 % des Aktienkapitals oder CHF 50\'000 — es gilt der höhere Betrag.\n\nBeispiel: Bei einem Aktienkapital von CHF 100\'000:\n• 20 % = CHF 20\'000\n• Minimum = CHF 50\'000\n→ Es müssen CHF 50\'000 einbezahlt werden.',
      },
      {
        id: 'rft-e-text',
        label: 'e)',
        points: 0,
        isIntroText: true,
        question:
          'In einer Generalversammlung wird über eine Kapitalerhöhung abgestimmt.',
        answer: '',
      },
      {
        id: 'rft-e1',
        label: 'e1)',
        points: 2,
        isSubQuestion: true,
        question: 'Welche Mehrheit ist erforderlich?',
        answer:
          'Qualifiziertes Mehr:\n\n• Mindestens ⅔ (zwei Drittel) der vertretenen Stimmen\nUND\n• Absolute Mehrheit der vertretenen Aktiennennwerte',
      },
      {
        id: 'rft-e2',
        label: 'e2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Wird die Kapitalerhöhung angenommen, wenn Stimmrechtsaktien mehr Stimmen haben als das übrige Kapital?',
        answer:
          'Ja, die Kapitalerhöhung wird angenommen.\n\nStimmrechtsaktien haben mehr Stimmgewicht pro Aktie. Wenn die Inhaber dieser Aktien dafür stimmen und damit ⅔ der Stimmen erreicht werden, ist das qualifizierte Mehr erfüllt → angenommen.',
      },
    ],
  },

  // ─── 4. VWL — PREISBILDUNG ───────────────────────────────────────────────────
  {
    id: 'vwl',
    number: 4,
    title: 'Volkswirtschaftslehre — Preisbildung',
    emoji: '📈',
    richtzeitMinutes: 10,
    totalPoints: 12,
    context:
      'Wir wollen uns mit nachfolgenden Aufgaben dem Kartoffelmarkt der Schweiz beschäftigen.',
    questions: [
      {
        id: 'vwl-a-text',
        label: 'a)',
        points: 0,
        isIntroText: true,
        question: 'Erstellen Sie ein Preis-Mengen-Diagramm, welches den Kartoffelmarkt darstellt.',
        answer: '',
      },
      {
        id: 'vwl-a1',
        label: 'a1)',
        points: 2,
        isSubQuestion: true,
        question:
          'Zeichnen Sie die Angebots- und Nachfragekurve sowie das Marktgleichgewicht ein. [Grafik / Beschriftung]',
        answer:
          'Preis-Mengen-Diagramm:\n• Nachfragekurve (N): fällt von links oben nach rechts unten\n• Angebotskurve (A): steigt von links unten nach rechts oben\n• Schnittpunkt = Marktgleichgewicht (P*, M*)\n• Achsen: Preis (P) auf y-Achse, Menge (M) auf x-Achse',
      },
      {
        id: 'vwl-a2',
        label: 'a2)',
        points: 3,
        isSubQuestion: true,
        question:
          'Wegen eines nassen Sommers ist die Kartoffelernte im Jahr 2021 deutlich unter dem Durchschnitt ausgefallen: Zeichnen Sie die Auswirkungen im gleichen Preis-Mengen-Diagramm mit einer anderen Farbe ein. [Grafik]',
        answer:
          'Die Angebotskurve verschiebt sich nach links (A → A\').\n\nWeniger Kartoffeln werden produziert → Angebotskurve nach links verschieben.\nNeuer Schnittpunkt mit Nachfragekurve → neues Gleichgewicht (P*\', M*\'):\n• P*\' liegt höher als P*\n• M*\' liegt tiefer als M*',
      },
      {
        id: 'vwl-a3',
        label: 'a3)',
        points: 3,
        isSubQuestion: true,
        question:
          'Nennen Sie das neue Marktgleichgewicht und erklären Sie in Worten die Folgen der gekürzten Ernte auf den Gleichgewichtspreis sowie auf die Gleichgewichtsmenge. [Grafik / Antwort]',
        answer:
          'Neues Marktgleichgewicht: höherer Preis (P*\'), tiefere Menge (M*\').\n\nErklärung:\nDie schlechte Ernte reduziert das Angebot → Angebotskurve verschiebt sich nach links. Bei gleichbleibender Nachfrage entsteht eine Knappheit → Preis steigt.\n\n→ Gleichgewichtspreis steigt\n→ Gleichgewichtsmenge sinkt',
      },
      {
        id: 'vwl-b-text',
        label: 'b)',
        points: 0,
        isIntroText: true,
        question:
          'Beurteilen Sie die folgenden Aussagen als richtig oder falsch:',
        answer: '',
      },
      {
        id: 'vwl-b1',
        label: 'b1)',
        points: 2,
        isSubQuestion: true,
        question:
          'Ein staatlich festgelegter Höchstpreis führt zu einem Angebotsüberschuss.',
        answer:
          'Falsch.\n\nEin Höchstpreis liegt unter dem Gleichgewichtspreis. Er macht das Gut günstiger → Nachfrage steigt, Angebot sinkt → es entsteht ein Nachfrageüberschuss (Mangel), kein Angebotsüberschuss.\n\n(Angebotsüberschuss entsteht bei einem Mindestpreis über dem Gleichgewichtspreis.)',
      },
      {
        id: 'vwl-b2',
        label: 'b2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Steigt der Preis eines Komplementärgutes, verschiebt sich die Nachfrage nach rechts.',
        answer:
          'Falsch.\n\nKomplementärgüter werden zusammen verwendet (z. B. Auto und Benzin). Steigt der Preis des einen, wird die Kombination teurer → Nachfrage nach beiden sinkt → Nachfragekurve verschiebt sich nach links.',
      },
      {
        id: 'vwl-b3',
        label: 'b3)',
        points: 2,
        isSubQuestion: true,
        question: 'Ein Mindestpreis liegt unter dem Gleichgewichtspreis.',
        answer:
          'Falsch.\n\nEin wirksamer Mindestpreis muss über dem Gleichgewichtspreis liegen. Nur dann erzwingt er einen höheren Marktpreis. Ein Mindestpreis unterhalb des Gleichgewichtspreises wäre wirkungslos.',
      },
    ],
  },

  // ─── 5. GELDPOLITIK ──────────────────────────────────────────────────────────
  {
    id: 'geldpolitik',
    number: 5,
    title: 'Geldpolitik',
    emoji: '💰',
    richtzeitMinutes: 10,
    totalPoints: 12,
    context:
      'Die Schweizerische Nationalbank (SNB) entscheidet über den Leitzins und die Geldmenge in der Schweiz.',
    questions: [
      {
        id: 'geld-a',
        label: 'a)',
        points: 2,
        question: 'Was versteht man unter expansiver Geldpolitik?',
        answer:
          'Expansive Geldpolitik: Die SNB senkt den Leitzins und erhöht die Geldmenge, um die Wirtschaft anzukurbeln.\n\n→ Kredite werden günstiger → Unternehmen investieren mehr, Haushalte konsumieren mehr\n→ Ziel: Wirtschaft ankurbeln, Arbeitslosigkeit senken',
      },
      {
        id: 'geld-b',
        label: 'b)',
        points: 2,
        question: 'Welche Auswirkungen hat eine Zinserhöhung auf Investitionen und Konsum?',
        answer:
          '• Investitionen sinken: Kredite werden teurer → Unternehmen investieren weniger\n• Konsum sinkt: Hypotheken und Konsumkredite werden teurer → Haushalte geben weniger aus\n• Sparen wird attraktiver → noch weniger Konsum\n\n→ Dämpfender Effekt auf die Wirtschaft (kontraktive Wirkung)',
      },
      {
        id: 'geld-c',
        label: 'c)',
        points: 2,
        question: 'Nennen Sie mögliche Ursachen für Inflation.',
        answer:
          'Ursachen für Inflation (steigende Preise):\n\n• Nachfrageüberhang: Mehr Nachfrage als Angebot → Preise steigen\n• Steigende Produktionskosten (z. B. Rohstoffe, Löhne) → Unternehmen erhöhen Preise\n• Zu viel Geld im Umlauf (Geldmenge steigt schneller als Wirtschaft)\n• Importierte Inflation: Preisanstieg im Ausland wirkt sich auf Schweizer Preise aus',
      },
      {
        id: 'geld-d',
        label: 'd)',
        points: 2,
        question: 'Was ist kontraktive Geldpolitik und wann setzt die SNB sie ein?',
        answer:
          'Kontraktive Geldpolitik: Die SNB erhöht den Leitzins und verringert die Geldmenge.\n\n→ Kredite werden teurer → weniger Investitionen und Konsum → Nachfrage sinkt → Preise steigen langsamer\n\nEingesetzt bei: Zu hoher Inflation (Preise steigen zu stark)',
      },
      {
        id: 'geld-e',
        label: 'e)',
        points: 2,
        question: 'Welche Auswirkungen hat eine Zinssenkung auf die Wirtschaft?',
        answer:
          '• Kredite werden günstiger → mehr Investitionen\n• Konsum steigt (günstigere Konsumkredite)\n• Sparen wird weniger attraktiv → mehr Geld fliesst in die Wirtschaft\n• Wirtschaftswachstum steigt\n• Risiko: Inflation kann steigen',
      },
      {
        id: 'geld-f',
        label: 'f)',
        points: 2,
        question: 'Was ist der Unterschied zwischen expansiver und kontraktiver Geldpolitik?',
        answer:
          'Expansive Geldpolitik:\n• Zinsen senken, Geldmenge erhöhen\n• Ziel: Wirtschaft ankurbeln\n• Risiko: Inflation\n\nKontraktive Geldpolitik:\n• Zinsen erhöhen, Geldmenge verringern\n• Ziel: Inflation bekämpfen\n• Risiko: Wirtschaft kühlt ab',
      },
    ],
  },

  // ─── 6. KONJUNKTUR & ARBEITSLOSIGKEIT ────────────────────────────────────────
  {
    id: 'konjunktur',
    number: 6,
    title: 'Konjunktur und Arbeitslosigkeit',
    emoji: '📉',
    richtzeitMinutes: 10,
    totalPoints: 12,
    context:
      'Die Schweizer Wirtschaft befindet sich in einer Abschwungphase. Viele Unternehmen erhalten weniger Aufträge, investieren weniger und bauen Stellen ab.',
    questions: [
      {
        id: 'konj-a',
        label: 'a)',
        points: 2,
        question: 'Nennen Sie die vier Phasen des Konjunkturzyklus.',
        answer:
          '1. Aufschwung (Expansion): Wirtschaft wächst, Beschäftigung steigt\n2. Hochkonjunktur (Boom): Maximale Auslastung, Inflation kann steigen\n3. Abschwung (Rezession): Nachfrage sinkt, Unternehmen entlassen Mitarbeitende\n4. Tiefkonjunktur (Depression): Tiefpunkt, hohe Arbeitslosigkeit, geringes Wachstum',
      },
      {
        id: 'konj-b',
        label: 'b)',
        points: 2,
        question: 'Was versteht man unter konjunktureller Arbeitslosigkeit?',
        answer:
          'Konjunkturelle Arbeitslosigkeit entsteht durch einen Rückgang der wirtschaftlichen Aktivität (Konjunkturabschwung).\n\n• Unternehmen erhalten weniger Aufträge → produzieren weniger → entlassen Mitarbeitende\n• Ist vorübergehend: Erholt sich die Wirtschaft, sinkt die Arbeitslosigkeit wieder',
      },
      {
        id: 'konj-c',
        label: 'c)',
        points: 2,
        question: 'Nennen Sie zwei weitere Arten von Arbeitslosigkeit.',
        answer:
          '1. Strukturelle Arbeitslosigkeit: Entsteht durch dauerhaften Wandel (z. B. Digitalisierung, Automatisierung). Langfristiger Natur.\n\n2. Saisonale Arbeitslosigkeit: Entsteht durch jahreszeitliche Schwankungen (z. B. Tourismus, Baubranche).',
      },
      {
        id: 'konj-d',
        label: 'd)',
        points: 2,
        question: 'Nennen Sie zwei Massnahmen zur Bekämpfung der Arbeitslosigkeit.',
        answer:
          '1. Kurzarbeitsentschädigung (KAE): Der Staat übernimmt einen Teil der Lohnkosten, damit Unternehmen Mitarbeitende nicht entlassen müssen.\n\n2. Staatliche Investitionsprogramme: Der Staat erhöht die Ausgaben (z. B. Infrastruktur) → schafft Nachfrage und Arbeitsplätze.',
      },
      {
        id: 'konj-e-text',
        label: 'e)',
        points: 0,
        isIntroText: true,
        question: 'Beurteilen Sie die folgenden Aussagen:',
        answer: '',
      },
      {
        id: 'konj-e1',
        label: 'e1)',
        points: 1,
        isSubQuestion: true,
        question: 'Ein Rückgang der Nachfrage kann zu Arbeitslosigkeit führen.',
        answer:
          'Richtig.\n\nWenn die Nachfrage sinkt, produzieren Unternehmen weniger → sie benötigen weniger Arbeitskräfte → konjunkturelle Arbeitslosigkeit steigt.',
      },
      {
        id: 'konj-e2',
        label: 'e2)',
        points: 1,
        isSubQuestion: true,
        question: 'Expansive Fiskalpolitik bedeutet, dass der Staat seine Ausgaben senkt.',
        answer:
          'Falsch.\n\nExpansive Fiskalpolitik bedeutet, dass der Staat seine Ausgaben erhöht (z. B. Infrastrukturprojekte, Sozialtransfers), um die Wirtschaft anzukurbeln und Arbeitslosigkeit zu senken.',
      },
      {
        id: 'konj-e3',
        label: 'e3)',
        points: 2,
        isSubQuestion: true,
        question: 'Der Staat kann durch höhere Ausgaben die Wirtschaft ankurbeln.',
        answer:
          'Richtig.\n\nDer Staat kann durch erhöhte Ausgaben (z. B. Infrastruktur, Bildung) die Nachfrage steigern → mehr Aufträge für Unternehmen → mehr Beschäftigung → Wirtschaft erholt sich.',
      },
    ],
  },
]
