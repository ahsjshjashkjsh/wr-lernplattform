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
          'Marktsegmentierung ist die Aufteilung eines Gesamtmarktes in kleinere, homogene Teilmärkte (Segmente). Diese Teilmärkte bestehen aus Kunden mit ähnlichen Bedürfnissen, Eigenschaften oder Kaufverhalten. Dadurch kann das Unternehmen seine Marketing­massnahmen gezielt auf die relevante Zielgruppe ausrichten.',
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
          'Marktanteil = Absatz ALPENLODGE / Gesamtmarkt × 100\n\nMarktanteil = 6\'500 / 300\'000 × 100\n= 2.17 %\n\n→ Die ALPENLODGE hat einen Marktanteil von ca. 2.2 %.',
      },
      {
        id: 'mkt-b2',
        label: 'b2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Handelt es sich beim für die ALPENLODGE massgeblichen Markt um einen gesättigten oder um einen ungesättigten Markt?',
        answer:
          'Es handelt sich um einen ungesättigten Markt.\n\nBegründung: Das Marktpotenzial beträgt 8\'000\'000 × 25 % = 2\'000\'000 Personen. Tatsächlich haben jedoch nur 300\'000 Personen in einem Sporthotel übernachtet. Das entspricht einer Marktausschöpfung von nur 15 %. Es gibt also noch viel ungenutztes Potenzial → ungesättigter Markt.',
      },
      {
        id: 'mkt-c',
        label: 'c)',
        points: 4,
        question:
          'Die ALPENLODGE beschliesst, sich fortan als Businesshotel zu positionieren.\nEntwerfen Sie für die ALPENLODGE als Businesshotel einen stimmigen Marketing-Mix und nennen Sie für jedes Marketinginstrument ein konkretes Beispiel.',
        answer:
          '• Produkt (Product): Businesszimmer mit Schreibtisch, stabilem WLAN und Drucker\n• Preis (Price): Firmenpauschalen / Konferenzpakete zu günstigeren Preisen für Firmen\n• Distribution (Place): Buchbar über Businessreise-Plattformen (z. B. HRS) sowie direkte Firmenverträge\n• Kommunikation (Promotion): LinkedIn-Werbung, Kaltakquise bei regionalen KMU, Messen für Geschäftsreisende',
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
          'Phase: Rückgangsphase (Degenerationsphase)\n\nMerkmale: Der Umsatz sinkt stark, es wird kaum noch investiert. Um die Nachfrage künstlich zu stützen, werden Sonderangebote und Rabattaktionen eingesetzt.',
      },
      {
        id: 'mkt-d2',
        label: 'd2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Die Marketingausgaben der ALPENLODGE sind sehr hoch, der Umsatz ist noch gering. Es muss vorläufig mit Verlusten gerechnet werden.',
        answer:
          'Phase: Einführungsphase\n\nMerkmale: Das Hotel ist noch wenig bekannt, es müssen hohe Investitionen in Werbung und Markteinführung getätigt werden. Der Umsatz deckt die Kosten noch nicht → Verluste.',
      },
      {
        id: 'mkt-d3',
        label: 'd3)',
        points: 1,
        isSubQuestion: true,
        question:
          'Die Mund-zu-Mund-Propaganda bewirkt, dass immer mehr neue Gäste bei der ALPENLODGE einen Aufenthalt buchen. Die Gewinnschwelle wird schliesslich überschritten.',
        answer:
          'Phase: Wachstumsphase\n\nMerkmale: Das Hotel wird bekannter, die Buchungszahlen steigen stark. Mund-zu-Mund-Empfehlungen ersetzen zunehmend teure Werbung. Der Umsatz übersteigt die Kosten → Gewinnschwelle (Break-even) wird erreicht.',
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
          'Der Kaufpreis ist am Wohnsitz des Gläubigers (KELLER) geschuldet.\n\nBegründung: Geldschulden sind Bringschulden (OR Art. 74 Abs. 2 Ziff. 1). Der Schuldner (MEIER) muss die Zahlung an den Wohnsitz des Gläubigers (KELLER) bringen.',
      },
      {
        id: 'vtr-b',
        label: 'b)',
        points: 2,
        question:
          'Könnte KELLER das Occasionsauto zurückverlangen, falls MEIER den Kaufpreis auch nach wiederholter Mahnung nicht bezahlen würde?',
        answer:
          'Nein, nicht direkt — ausser es wurde ein Eigentumsvorbehalt vereinbart.\n\nOhne Eigentumsvorbehalt geht das Eigentum mit der Übergabe auf MEIER über. KELLER hat kein automatisches Rückforderungsrecht. Er kann jedoch:\n1. Mahnung aussprechen + Nachfrist setzen\n2. Bei Fristablauf: vom Vertrag zurücktreten und Schadenersatz verlangen\n3. Oder Klage auf Zahlung einreichen',
      },
      {
        id: 'vtr-c',
        label: 'c)',
        points: 2,
        question: 'Wann gehen Nutzen und Gefahr nach Gesetz auf MEIER über?',
        answer:
          'Nutzen und Gefahr gehen am 6. Juni 2021 auf MEIER über — dem Zeitpunkt der Fahrzeugübergabe (OR Art. 185).\n\n→ Ab diesem Datum trägt MEIER das Risiko des zufälligen Untergangs oder der Beschädigung und hat Anspruch auf alle Vorteile (Nutzung, Wertsteigerung) des Fahrzeugs.',
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
          'Ja, MEIER kann Sachmängelgewährleistung geltend machen (OR Art. 197 ff.).\n\nMEIER hat folgende Rechte:\n• Nachbesserung (Reparatur auf Kosten KELLERs)\n• Ersatzlieferung\n• Minderung (Preisreduktion)\n• Wandlung (Rückgabe gegen Rückerstattung des Kaufpreises)\n\nVoraussetzung: Der Mangel bestand bereits bei der Übergabe und wurde unverzüglich gerügt.',
      },
      {
        id: 'vtr-d2',
        label: 'd2)',
        points: 2,
        isSubQuestion: true,
        question: 'Bis wann muss MEIER den Mangel melden bzw. die Kosten zurückfordern?',
        answer:
          'MEIER muss den Mangel unverzüglich nach Entdeckung rügen — in der Praxis innerhalb von 2–5 Werktagen (OR Art. 201).\n\nDa die Übergabe am 6. Juni 2021 war, musste MEIER den Mangel spätestens bis ca. 11. Juni 2021 melden.\n\nDie gesetzliche Gewährleistungsfrist beträgt 2 Jahre ab Übergabe (OR Art. 210), also bis 6. Juni 2023.',
      },
      {
        id: 'vtr-d3',
        label: 'd3)',
        points: 2,
        isSubQuestion: true,
        question: 'Hätte KELLER seine Sachgewährleistungspflicht ausschliessen können?',
        answer:
          'Ja, grundsätzlich ist ein Gewährleistungsausschluss zulässig (OR Art. 199).\n\nAusnahme: Bei arglistiger Täuschung ist der Ausschluss ungültig. Wenn KELLER den Defekt am Scheinwerfer kannte und ihn absichtlich verschwieg, wäre der Ausschluss nichtig.\n\nFazit: Ohne Täuschung → Ausschluss gültig. Mit absichtlichem Verschweigen → Ausschluss ungültig.',
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
          'Ja, eine Übervorteilung (OR Art. 21) liegt vor, wenn folgende Tatbestandsmerkmale erfüllt sind:\n\n1. ✅ Offensichtliches Missverhältnis: CHF 20\'000 bezahlt, Wert CHF 5\'000 → Missverhältnis von CHF 15\'000 (300 % überbezahlt)\n2. ✅ Schwächesituation: Notlage, Unerfahrenheit oder Leichtsinn von MEIER muss vorliegen\n3. ✅ Bewusstes Ausnützen durch KELLER\n\nFazit: Das Missverhältnis ist klar gegeben. Wenn auch Unerfahrenheit/Notlage und Ausnützung nachgewiesen werden können, liegt eine Übervorteilung vor.',
      },
      {
        id: 'vtr-e2',
        label: 'e2)',
        points: 3,
        isSubQuestion: true,
        question: 'Wie muss MEIER rechtlich vorgehen?',
        answer:
          'MEIER muss den Kaufvertrag wegen Übervorteilung anfechten (OR Art. 21 Abs. 1).\n\nVorgehen:\n1. Anfechtungserklärung gegenüber KELLER abgeben\n2. Rückabwicklung des Vertrags verlangen (Rückgabe Auto gegen Rückerstattung des Kaufpreises)\n\nFrist: Die Anfechtung muss innerhalb von 1 Jahr ab Vertragsabschluss erfolgen (OR Art. 21 Abs. 2).\n→ Vertragsabschluss 31. Mai 2021 → Frist bis 31. Mai 2022.',
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
          'Das Einzelunternehmen ist für die Bäckereibründung in folgenden Punkten problematisch:\n\n• Unbeschränkte persönliche Haftung: ANDI MÜLLER haftet mit seinem gesamten Privat­vermögen. Bei einem Misserfolg ist sein persönliches Eigentum gefährdet.\n• Kapitalbeschaffung: Als Einzelunternehmer ist es schwieriger, grössere Investitionen zu finanzieren (keine Ausgabe von Aktien möglich).\n• Abhängigkeit: Das Unternehmen ist vollständig von einer Person abhängig (Krankheit, Unfall → Betrieb gefährdet).',
      },
      {
        id: 'rft-b',
        label: 'b)',
        points: 2,
        question: 'Nennen Sie eine korrekte Firma für das Unternehmen.',
        answer:
          'Korrekte Firma: «Andi Müller» oder «Andi Müller Bäckerei»\n\nBegründung: Bei einer Einzelunternehmung muss die Firma zwingend den Familiennamen des Inhabers enthalten (OR Art. 945). Phantasienamen allein (z. B. «Leckerbissen») sind nicht zulässig.',
      },
      {
        id: 'rft-c',
        label: 'c)',
        points: 2,
        question:
          'ANDI MÜLLER gründet mit einer Freundin per Handschlag ein Unternehmen.\nWelche Rechtsform liegt vor?',
        answer:
          'Rechtsform: Einfache Gesellschaft (OR Art. 530 ff.)\n\nMerkmale:\n• Entsteht formlos, bereits per Handschlag oder mündlich\n• Kein Handelsregistereintrag erforderlich\n• Beide Gesellschafter haften unbeschränkt und solidarisch\n• Für temporäre oder informelle Zusammenarbeit geeignet',
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
          'Die AG entsteht rechtlich mit dem Eintrag ins Handelsregister (OR Art. 643).\n\nErst ab diesem Zeitpunkt ist die AG eine eigenständige juristische Person mit eigener Rechtspersönlichkeit.',
      },
      {
        id: 'rft-d2',
        label: 'd2)',
        points: 2,
        isSubQuestion: true,
        question: 'Wie viel Kapital muss mindestens einbezahlt werden?',
        answer:
          'Mindestens 20 % des Aktienkapitals oder CHF 50\'000 — es gilt der höhere Betrag (OR Art. 632).\n\nBeispiel: Bei einem Aktienkapital von CHF 100\'000:\n• 20 % = CHF 20\'000\n• Mindestbetrag = CHF 50\'000\n→ Es müssen CHF 50\'000 einbezahlt werden (da CHF 50\'000 > CHF 20\'000).',
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
          'Für eine Kapitalerhöhung ist ein qualifiziertes Mehr erforderlich (OR Art. 704):\n\n• Mindestens ⅔ (zwei Drittel) der vertretenen Stimmen\nUND\n• Absolute Mehrheit der vertretenen Aktiennennwerte',
      },
      {
        id: 'rft-e2',
        label: 'e2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Wird die Kapitalerhöhung angenommen, wenn Stimmrechtsaktien mehr Stimmen haben als das übrige Kapital?',
        answer:
          'Ja, die Kapitalerhöhung wird angenommen.\n\nBegründung: Stimmrechtsaktien (Aktien mit erhöhtem Stimmrecht) besitzen mehr Stimmgewicht. Wenn die Inhaber dieser Aktien mehrheitlich für die Kapitalerhöhung stimmen und damit sowohl 2/3 der Stimmen als auch die absolute Mehrheit der Aktiennennwerte erreicht wird, ist das qualifizierte Mehr erfüllt → Kapitalerhöhung angenommen.',
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
          'Preis-Mengen-Diagramm mit:\n• Nachfragekurve (N) von links oben nach rechts unten (fallend)\n• Angebotskurve (A) von links unten nach rechts oben (steigend)\n• Schnittpunkt = Marktgleichgewicht (P*, M*)\n• Achsen beschriftet: Preis (P) auf der y-Achse, Menge (M) auf der x-Achse\n• Lotlinien vom Schnittpunkt auf beide Achsen → P* und M* ablesen',
      },
      {
        id: 'vwl-a2',
        label: 'a2)',
        points: 3,
        isSubQuestion: true,
        question:
          'Wegen eines nassen Sommers ist die Kartoffelernte im Jahr 2021 deutlich unter dem Durchschnitt ausgefallen: Zeichnen Sie die Auswirkungen im gleichen Preis-Mengen-Diagramm mit einer anderen Farbe ein. [Grafik]',
        answer:
          'Die Angebotskurve verschiebt sich nach links (A → A\'): weniger Kartoffeln werden zu jedem Preis angeboten.\n\nEinzeichnen:\n• Neue Angebotskurve A\' links von A (mit anderer Farbe)\n• Neuer Schnittpunkt mit Nachfragekurve N ergibt neues Gleichgewicht (P*\', M*\')\n• P*\' liegt höher, M*\' liegt links von M*',
      },
      {
        id: 'vwl-a3',
        label: 'a3)',
        points: 3,
        isSubQuestion: true,
        question:
          'Nennen Sie das neue Marktgleichgewicht und erklären Sie in Worten die Folgen der gekürzten Ernte auf den Gleichgewichtspreis sowie auf die Gleichgewichtsmenge. [Grafik / Antwort]',
        answer:
          'Neues Marktgleichgewicht: höherer Gleichgewichtspreis (P*\' > P*), tiefere Gleichgewichtsmenge (M*\' < M*).\n\nErklärung:\nDie schlechte Ernte reduziert das Angebot an Kartoffeln → Angebotskurve verschiebt sich nach links. Bei unveränderter Nachfrage entsteht eine Knappheit → Preis steigt, bis sich Angebot und Nachfrage im neuen Gleichgewicht treffen.\n\n→ Gleichgewichtspreis steigt\n→ Gleichgewichtsmenge sinkt',
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
          'Falsch.\n\nEin Höchstpreis (Preisdeckel) liegt unter dem Gleichgewichtspreis. Er macht das Gut günstiger → die Nachfrage steigt, das Angebot sinkt → es entsteht ein Nachfrageüberschuss (Mangel), nicht ein Angebotsüberschuss.\n\nAngebotsüberschuss entsteht durch einen Mindestpreis (über dem Gleichgewichtspreis).',
      },
      {
        id: 'vwl-b2',
        label: 'b2)',
        points: 2,
        isSubQuestion: true,
        question:
          'Steigt der Preis eines Komplementärgutes, verschiebt sich die Nachfrage nach rechts.',
        answer:
          'Falsch.\n\nKomplementärgüter werden zusammen verwendet (z. B. Auto und Benzin). Steigt der Preis des Komplementärgutes, wird die Gesamtkombination teurer → Nachfrage nach beiden Gütern sinkt → Nachfragekurve verschiebt sich nach links.',
      },
      {
        id: 'vwl-b3',
        label: 'b3)',
        points: 2,
        isSubQuestion: true,
        question: 'Ein Mindestpreis liegt unter dem Gleichgewichtspreis.',
        answer:
          'Falsch.\n\nEin wirksamer Mindestpreis (Preisuntergrenze) muss über dem Gleichgewichtspreis liegen. Nur dann erzwingt er einen höheren Preis als der Markt bilden würde. Ein Mindestpreis unter dem Gleichgewichtspreis wäre wirkungslos, da der Markt ohnehin höher handelt.',
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
      'Die Schweizerische Nationalbank (SNB) entscheidet über den Leitzins und die Geldmenge in der Schweiz. Diese Entscheide beeinflussen Investitionen, Konsum und Preisniveau.',
    questions: [
      {
        id: 'geld-a',
        label: 'a)',
        points: 2,
        question: 'Was versteht man unter expansiver Geldpolitik?',
        answer:
          'Expansive Geldpolitik: Die Zentralbank erhöht die Geldmenge und senkt die Zinsen, um die Wirtschaft anzukurbeln.\n\nMassnahmen:\n• Leitzinssenkung → Kredite werden günstiger\n• Anleihenkäufe (Geldmenge erhöhen)\n\nZiel: Investitionen und Konsum fördern, Wirtschaftswachstum stimulieren, Deflation verhindern.',
      },
      {
        id: 'geld-b',
        label: 'b)',
        points: 2,
        question: 'Welche Auswirkungen hat eine Zinserhöhung auf Investitionen und Konsum?',
        answer:
          'Zinserhöhung führt zu:\n\n• Investitionen sinken: Kredite werden teurer → Unternehmen investieren weniger, da Finanzierungskosten steigen\n• Konsum sinkt: Hypotheken und Konsumkredite werden teurer → Haushalte geben weniger aus\n• Sparen attraktiver: Höhere Zinsen auf Sparkonten → weniger Konsum\n\n→ Insgesamt: dämpfender Effekt auf Wirtschaft (kontraktive Wirkung).',
      },
      {
        id: 'geld-c',
        label: 'c)',
        points: 2,
        question: 'Nennen Sie mögliche Ursachen für Deflation.',
        answer:
          'Ursachen für Deflation (anhaltend sinkende Preise):\n\n• Nachfragerückgang: Konsumenten kaufen weniger → Unternehmen senken Preise\n• Überproduktion: Angebot übersteigt die Nachfrage dauerhaft\n• Zu geringe Geldmenge im Umlauf\n• Kreditklemme: Banken vergeben weniger Kredite → weniger Investitionen\n• Deflationäre Erwartungen: Konsumenten verschieben Käufe → Nachfrage sinkt weiter',
      },
      {
        id: 'geld-d',
        label: 'd)',
        points: 2,
        question: 'Was versteht man unter Stagflation?',
        answer:
          'Stagflation = gleichzeitiges Auftreten von:\n• Stagnation (fehlendes Wirtschaftswachstum oder Rezession)\n• Inflation (steigende Preise)\n• Oft auch steigende Arbeitslosigkeit\n\nProblem: Die üblichen Gegenmassnahmen widersprechen sich:\n→ Gegen Inflation: Zinsen erhöhen (bremst Wirtschaft weiter)\n→ Gegen Rezession: Zinsen senken (verstärkt Inflation)\n\nBeispiel: Ölkrise 1973–74.',
      },
      {
        id: 'geld-e',
        label: 'e)',
        points: 2,
        question: 'Welche Auswirkungen haben Zinsänderungen auf Inflation und Wirtschaftswachstum?',
        answer:
          'Zinssenkung:\n• Inflation steigt (mehr Geld im Umlauf, mehr Nachfrage)\n• Wirtschaftswachstum steigt (günstigere Kredite → mehr Investitionen)\n\nZinserhöhung:\n• Inflation sinkt (weniger Geld im Umlauf, gedämpfte Nachfrage)\n• Wirtschaftswachstum sinkt (teurere Kredite → weniger Investitionen)\n\n→ Zielkonflikt: Preisstabilität vs. Wachstum.',
      },
      {
        id: 'geld-f',
        label: 'f)',
        points: 2,
        question: 'Welche Geldpolitik ist bei Stagflation sinnvoll?',
        answer:
          'Bei Stagflation gibt es keine ideale geldpolitische Lösung — es besteht ein Zielkonflikt.\n\nMögliche Ansätze:\n• Priorität Inflation bekämpfen: Zinsen erhöhen → Inflation sinkt, aber Rezession verschlimmert sich\n• Priorität Wirtschaft stützen: Zinsen senken → Wachstum steigt, aber Inflation verschlimmert sich\n\nIn der Praxis bevorzugt die SNB meist Preisstabilität (Inflationsbekämpfung) als vorrangiges Ziel, da Inflation schwerer langfristig zu kontrollieren ist.',
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
        question: 'Nennen Sie zwei Frühindikatoren der Konjunktur.',
        answer:
          '1. KOF-Konjunkturbarometer: Prognostiziert die Entwicklung der Schweizer Wirtschaft in den nächsten 6–9 Monaten\n2. Auftragseingang der Industrie: Zeigt künftige Produktionstätigkeit an\n\nWeitere mögliche Antworten:\n• Konsumentenstimmungsindex (SECO)\n• Einkaufsmanager-Index (PMI)\n• Aktienkursentwicklung (z. B. SMI)',
      },
      {
        id: 'konj-b',
        label: 'b)',
        points: 2,
        question: 'Was versteht man unter konjunktureller Arbeitslosigkeit?',
        answer:
          'Konjunkturelle Arbeitslosigkeit entsteht durch einen Rückgang der wirtschaftlichen Aktivität (Konjunkturabschwung / Rezession).\n\n• Unternehmen erhalten weniger Aufträge → produzieren weniger → entlassen Mitarbeitende\n• Ist vorübergehend: Erholt sich die Wirtschaft, steigt die Beschäftigung wieder\n\nBeispiel: Während der Corona-Krise 2020 stieg die konjunkturelle Arbeitslosigkeit stark an.',
      },
      {
        id: 'konj-c',
        label: 'c)',
        points: 2,
        question: 'Nennen Sie zwei weitere Arten von Arbeitslosigkeit.',
        answer:
          '1. Strukturelle Arbeitslosigkeit: Entsteht durch dauerhaften Strukturwandel (z. B. Digitalisierung, Automatisierung, Branchenwandel). Langfristiger Natur.\n\n2. Saisonale Arbeitslosigkeit: Entsteht durch jahreszeitliche Schwankungen in bestimmten Branchen (z. B. Tourismus, Baubranche, Landwirtschaft).\n\nWeitere mögliche Antwort:\n• Friktionelle Arbeitslosigkeit (Sucharbeitslosigkeit): Kurzfristige Arbeitslosigkeit beim Stellenwechsel.',
      },
      {
        id: 'konj-d',
        label: 'd)',
        points: 2,
        question: 'Nennen Sie zwei Massnahmen zur Bekämpfung der Arbeitslosigkeit.',
        answer:
          '1. Kurzarbeitsentschädigung (KAE): Der Staat übernimmt einen Teil der Lohnkosten, damit Unternehmen Mitarbeitende nicht entlassen müssen.\n\n2. Staatliche Investitionsprogramme (Fiskalpolitik): Der Staat erhöht die Ausgaben (z. B. Infrastrukturprojekte) → schafft Nachfrage und Arbeitsplätze.\n\nWeitere mögliche Antworten:\n• Weiterbildungs- und Umschulungsprogramme\n• Arbeitsvermittlung / RAV-Beratung',
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
          'Richtig.\n\nWenn die Nachfrage sinkt, produzieren Unternehmen weniger → sie benötigen weniger Arbeitskräfte → Arbeitslosigkeit steigt (konjunkturelle oder nachfragebedingte Arbeitslosigkeit).',
      },
      {
        id: 'konj-e2',
        label: 'e2)',
        points: 1,
        isSubQuestion: true,
        question: 'Die keynesianische Theorie ist angebotsorientiert.',
        answer:
          'Falsch.\n\nDie keynesianische Theorie ist nachfrageorientiert. Sie besagt, dass der Staat durch höhere Ausgaben die gesamtwirtschaftliche Nachfrage ankurbeln kann (Fiskalpolitik). Angebotsorientierte Wirtschaftspolitik ist das Gegenteil davon (z. B. Monetarismus, Neoklassik).',
      },
      {
        id: 'konj-e3',
        label: 'e3)',
        points: 2,
        isSubQuestion: true,
        question: 'Der Staat kann durch höhere Ausgaben die Wirtschaft ankurbeln.',
        answer:
          'Richtig.\n\nLaut keynesianischer Theorie kann der Staat in einer Rezession durch erhöhte Staatsausgaben (z. B. Infrastruktur, Bildung, Sozialtransfers) die Gesamtnachfrage steigern und so die Wirtschaft ankurbeln (expansive Fiskalpolitik). Dies führt zu mehr Aufträgen, mehr Beschäftigung und mehr Einkommen.',
      },
    ],
  },
]
