import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function reconnect() {
  // No-op with PostgreSQL – connection pooling handles this automatically
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data in reverse dependency order
  await prisma.quizAttemptAnswer.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.chapterProgress.deleteMany()
  await prisma.assistantMessage.deleteMany()
  await prisma.quizOption.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.learningGoal.deleteMany()
  await prisma.keyTerm.deleteMany()
  await prisma.corePoint.deleteMany()
  await prisma.example.deleteMany()
  await prisma.chapter.deleteMany()
  await prisma.topic.deleteMany()

  // ═══════════════════════════════════════════════════════
  //  BETRIEBSWIRTSCHAFTSLEHRE
  // ═══════════════════════════════════════════════════════

  // ─────────────────────────────────────────
  // TOPIC 1: MARKETING (QSP)
  // Stadlin/Riemek/König, Kapitel 4
  // ─────────────────────────────────────────
  const tMarketing = await prisma.topic.create({
    data: {
      slug: 'marketing',
      title: 'Marketing',
      description: 'Marktforschung, Segmentierung, Marketing-Mix (4P), Marktstrategien, SWOT – QSP',
      icon: 'TrendingUp',
      color: 'amber',
      examType: 'querschnitt',
      category: 'bwl',
      order: 1,
    },
  })

  // ── Kapitel 1: Marketing-Grundlagen ──────────────────────────────────
  const chMarketingGrundlagen = await prisma.chapter.create({
    data: {
      slug: 'marketing-grundlagen',
      title: 'Marketing-Grundlagen',
      subtitle: 'Märkte, Marktforschung, KYC und Segmentierung',
      topicId: tMarketing.id,
      order: 1,
      contentStatus: 'complete',
      summary: `Marketing – Was es wirklich bedeutet

Marketing bedeutet im Kern: Ein Unternehmen überlegt, welche Leistungen es für welchen Markt anbietet und wie es diese Leistungen erfolgreich an Kundinnen und Kunden bringt. Marketing wird nicht nur als Werbung verstanden, sondern als ganzer Bereich zwischen Leistung, Markt, Absatz und Beschaffung. Dazu gehören also Marktanalyse, Zielgruppenwahl, Strategie und der Marketing-Mix.

Für die Prüfung ist wichtig: Marketing ist ein Teil des Unternehmenskonzepts und hängt eng mit Strategie zusammen. Man schaut zuerst: Wo stehen wir?, welchen Markt bearbeiten wir?, wie wollen wir uns gegenüber der Konkurrenz behaupten? Erst danach setzt man das operativ mit Product, Price, Place und Promotion um.

Markt, Absatz und Beschaffung

Im Marketing wird zwischen Absatzmarkt und Beschaffungsmarkt unterschieden. Absatzmarkt bedeutet: Wo verkauft das Unternehmen seine Produkte oder Dienstleistungen? Beschaffungsmarkt bedeutet: Woher bekommt das Unternehmen das, was es selber braucht, zum Beispiel Rohstoffe, Lieferanten oder Arbeitskräfte?

Für die Prüfung solltest du also erklären können: was ein Markt ist, warum Unternehmen sowohl den Absatzmarkt als auch den Beschaffungsmarkt beachten müssen, und weshalb Marketing nicht nur Verkauf, sondern auch Marktbeobachtung und Marktentscheidung ist.

Marktforschung und Markterkundung

Ein zentrales Prüfungsthema ist die Unterscheidung zwischen Marktforschung und Markterkundung. Informationen können direkt im Markt erhoben (Field Research) oder aus bestehenden Quellen beschafft werden (Desk Research).

Marktforschung ist systematischer, liefert fundiertere Informationen, wird gezielt geplant, ist meist aufwendiger und teurer. Markterkundung ist einfacher und schneller, liefert eher erste Eindrücke, ist weniger exakt, eignet sich für eine erste Orientierung.

Prüfungswichtig ist ausserdem die Unterscheidung zwischen primärer Marktforschung (Daten werden neu erhoben, z. B. Umfrage, Interview, Beobachtung) und sekundärer Marktforschung (bereits vorhandene Daten werden genutzt, z. B. Statistiken, Kundendaten, Branchenzahlen, interne Unterlagen). Das gehört fast sicher zum Basiswissen, wenn nach Informationsbeschaffung im Marketing gefragt wird.

KYC und Kundensegmentierung

Ein sehr wichtiger Punkt ist KYC – Know your customer. Ähnliche Kunden – ähnliche Merkmale – ähnlich bearbeiten – Fokussierung – effizienter Einsatz der Ressourcen. Das heisst: Unternehmen sollen ihre Kundschaft kennen und in sinnvolle Gruppen aufteilen, damit sie gezielter arbeiten können.

Die drei zentralen Segmentierungsarten sind: Geografische Segmentierung (nach Ort, Region, Land, Stadt, Klima, Sprache), Demografische Segmentierung (nach Alter, Geschlecht, Einkommen, Bildung, Beruf, Familienstand) und Segmentierung nach Kundenverhalten (nach Kaufverhalten, Bedürfnissen, Nutzenvorstellungen, Preissensibilität, Treue, Mediennutzung).

Für die Prüfung solltest du nicht nur die Begriffe kennen, sondern auch Beispiele dazu geben können. Segmentierung macht nur Sinn, wenn das Segment gross genug ist und wenn das Unternehmen prüfen kann, ob seine eigene Grösse und sein Wachstumspotenzial zu diesem Segment passen. Relevante Faktoren: Entwicklung des Marktes, Grösse des Kundensegments, eigene Grösse vs. Grösse des Segments, Wachstum und Konkurrenz.

Marktanteil, Marktvolumen und Marktpotenzial

Diese drei Begriffe sind ganz typische Prüfungsbegriffe. Marktanteil = Anteil eines Unternehmens am gesamten Markt. Marktvolumen = tatsächlich von allen Anbietern abgesetzte Menge oder tatsächlich erzielter Umsatz im Markt. Marktpotenzial = theoretisch erreichbare maximale Marktgrösse.

Merke: Marktvolumen = was wirklich verkauft wird. Marktpotenzial = was theoretisch möglich wäre. Marktanteil = welcher Teil davon auf ein Unternehmen entfällt.

Das musst du für die Prüfung können: die Begriffe voneinander unterscheiden, erklären, was real und was theoretisch ist, und einfache Aufgaben dazu lösen.`,
      learningGoals: {
        create: [
          { text: 'Marketing als Konzept erklären (nicht nur Werbung)', order: 1 },
          { text: 'Absatzmarkt und Beschaffungsmarkt unterscheiden', order: 2 },
          { text: 'Marktforschung vs. Markterkundung und primär vs. sekundär erklären', order: 3 },
          { text: 'KYC und die drei Segmentierungsarten erklären', order: 4 },
          { text: 'Marktanteil, Marktvolumen und Marktpotenzial unterscheiden', order: 5 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Absatzmarkt', definition: 'Markt, auf dem das Unternehmen seine Produkte/Dienstleistungen verkauft', order: 1 },
          { term: 'Beschaffungsmarkt', definition: 'Markt, auf dem das Unternehmen Rohstoffe, Lieferanten und Arbeitskräfte bezieht', order: 2 },
          { term: 'Marktforschung', definition: 'Systematische, geplante Informationsbeschaffung über den Markt – aufwendiger, aber fundierter', order: 3 },
          { term: 'Markterkundung', definition: 'Schnelle, einfache Informationsbeschaffung für erste Orientierung – weniger exakt', order: 4 },
          { term: 'Primäre Marktforschung', definition: 'Neue Daten werden direkt erhoben (Field Research): Umfragen, Interviews, Beobachtungen', order: 5 },
          { term: 'Sekundäre Marktforschung', definition: 'Vorhandene Daten werden genutzt (Desk Research): Statistiken, Kundendaten, Branchenzahlen', order: 6 },
          { term: 'KYC – Know Your Customer', definition: 'Prinzip: Ähnliche Kunden – ähnliche Merkmale – ähnlich bearbeiten → gezielter, effizienter Ressourceneinsatz', order: 7 },
          { term: 'Geografische Segmentierung', definition: 'Einteilung nach Ort, Region, Land, Klima, Sprache', order: 8 },
          { term: 'Demografische Segmentierung', definition: 'Einteilung nach Alter, Geschlecht, Einkommen, Bildung, Beruf, Familienstand', order: 9 },
          { term: 'Segmentierung nach Kundenverhalten', definition: 'Einteilung nach Kaufverhalten, Bedürfnissen, Preissensibilität, Markentreue, Mediennutzung', order: 10 },
          { term: 'Marktvolumen', definition: 'Tatsächlich von allen Anbietern abgesetzte Menge / Umsatz im Markt (was wirklich verkauft wird)', order: 11 },
          { term: 'Marktpotenzial', definition: 'Theoretisch maximal erreichbare Marktgrösse (was möglich wäre)', order: 12 },
          { term: 'Marktanteil', definition: 'Anteil eines Unternehmens am Marktvolumen in %', order: 13 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Marketing = Marktanalyse + Zielgruppenwahl + Strategie + Marketing-Mix (nicht nur Werbung)', order: 1 },
          { text: 'Absatzmarkt: wohin verkaufen? – Beschaffungsmarkt: woher beziehen?', order: 2 },
          { text: 'Marktforschung: systematisch, teuer, fundiert – Markterkundung: schnell, einfach, erste Eindrücke', order: 3 },
          { text: 'Primär (Field Research): neue Daten erheben; Sekundär (Desk Research): bestehende Daten nutzen', order: 4 },
          { text: 'KYC: Segmentierung macht nur Sinn, wenn Segment gross genug und zum Unternehmen passt', order: 5 },
          { text: 'Drei Segmentierungsarten: geografisch, demografisch, Kundenverhalten', order: 6 },
          { text: 'Marktvolumen = real; Marktpotenzial = theoretisch; Marktanteil = Anteil eines Unternehmens', order: 7 },
        ],
      },
      examples: {
        create: [
          { text: 'Primär: Umfrage bei 500 Kunden über neue Produktidee – eigene neue Daten', order: 1 },
          { text: 'Sekundär: Bundesamt-Statistiken über Einkommensentwicklung für Zielgruppenanalyse nutzen', order: 2 },
          { text: 'Demografische Segmentierung: Seniorentarif für ältere Kunden, Studententarif für Junge', order: 3 },
          { text: 'Marktvolumen = CHF 10 Mio.; Marktpotenzial = CHF 15 Mio.; Marktanteil Unternehmen = CHF 2 Mio. → 20 %', order: 4 },
        ],
      },
    },
  })

  await createQuiz(chMarketingGrundlagen.id, [
    {
      q: 'Was versteht man unter Marketing?',
      opts: [
        { t: 'Nur Werbung und Reklame für Produkte', c: false },
        { t: 'Der gesamte Bereich zwischen Leistung, Markt, Absatz und Beschaffung – inkl. Marktanalyse, Zielgruppenwahl, Strategie und Marketing-Mix', c: true },
        { t: 'Die Buchhaltung und Kalkulation von Produktpreisen', c: false },
        { t: 'Der Einkauf von Rohstoffen für die Produktion', c: false },
      ],
      explanation: 'Marketing umfasst viel mehr als Werbung: Marktanalyse, Zielgruppenwahl, Strategie und den operativen Marketing-Mix (4P). Es ist Teil des gesamten Unternehmenskonzepts.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Unterschied zwischen Absatzmarkt und Beschaffungsmarkt?',
      opts: [
        { t: 'Es gibt keinen Unterschied – beide Begriffe meinen dasselbe', c: false },
        { t: 'Absatzmarkt: wo das Unternehmen verkauft; Beschaffungsmarkt: woher es Ressourcen bezieht', c: true },
        { t: 'Absatzmarkt = Inland; Beschaffungsmarkt = Ausland', c: false },
        { t: 'Absatzmarkt betrifft Dienstleistungen, Beschaffungsmarkt betrifft Waren', c: false },
      ],
      explanation: 'Absatzmarkt = wo das Unternehmen seine Produkte/Dienstleistungen an Kunden verkauft. Beschaffungsmarkt = wo das Unternehmen Rohstoffe, Lieferanten, Arbeitskräfte bezieht. Marketing betrifft beide Seiten.',
      difficulty: 'easy',
    },
    {
      q: 'Was gehört zum Beschaffungsmarkt eines Unternehmens?',
      opts: [
        { t: 'Kunden und Endabnehmer', c: false },
        { t: 'Rohstoffe, Lieferanten und Arbeitskräfte', c: true },
        { t: 'Werbepartner und Medienagenturen', c: false },
        { t: 'Detailhändler und Grosshändler für den Verkauf', c: false },
      ],
      explanation: 'Der Beschaffungsmarkt umfasst alles, was das Unternehmen für seine Leistungserbringung einkauft oder bezieht: Rohstoffe, Lieferanten, Personal.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Unterschied zwischen Marktforschung und Markterkundung?',
      opts: [
        { t: 'Marktforschung ist schneller und billiger als Markterkundung', c: false },
        { t: 'Marktforschung ist systematischer und fundierter; Markterkundung ist schneller und liefert erste Eindrücke', c: true },
        { t: 'Beide Begriffe bedeuten dasselbe', c: false },
        { t: 'Markterkundung ist für grosse Unternehmen, Marktforschung für kleine', c: false },
      ],
      explanation: 'Marktforschung: systematisch, geplant, aufwendig, fundiert. Markterkundung: schnell, einfach, weniger exakt, erste Orientierung.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Unterschied zwischen primärer und sekundärer Marktforschung?',
      opts: [
        { t: 'Primär ist teurer, sekundär ist günstiger – sonst gleich', c: false },
        { t: 'Primär erhebt neue Daten (z. B. Umfragen); sekundär nutzt vorhandene Daten (z. B. Statistiken)', c: true },
        { t: 'Primär = quantitativ, sekundär = qualitativ', c: false },
        { t: 'Primär betrifft Produkte, sekundär betrifft Dienstleistungen', c: false },
      ],
      explanation: 'Primäre Marktforschung (Field Research): Neue Daten werden gezielt erhoben – Umfragen, Interviews, Beobachtungen. Sekundäre Marktforschung (Desk Research): Bestehende Daten aus Statistiken, Berichten, Kundendatenbanken.',
      difficulty: 'easy',
    },
    {
      q: 'Ein Unternehmen wertet Branchenberichte und Bundesamt-Statistiken aus, um seinen Markt zu analysieren. Was ist das?',
      opts: [
        { t: 'Primäre Marktforschung', c: false },
        { t: 'Sekundäre Marktforschung', c: true },
        { t: 'Markterkundung', c: false },
        { t: 'Kundensegmentierung', c: false },
      ],
      explanation: 'Sekundäre Marktforschung (Desk Research) nutzt vorhandene Daten wie Statistiken, Branchenberichte oder interne Unterlagen – es werden keine neuen Daten erhoben.',
      difficulty: 'medium',
    },
    {
      q: 'Ein Unternehmen führt 300 Telefoninterviews mit potenziellen Kunden durch. Was ist das?',
      opts: [
        { t: 'Sekundäre Marktforschung', c: false },
        { t: 'Primäre Marktforschung', c: true },
        { t: 'Markterkundung', c: false },
        { t: 'KYC-Analyse', c: false },
      ],
      explanation: 'Primäre Marktforschung (Field Research): Neue Daten werden direkt erhoben – hier durch Interviews. Das Unternehmen gewinnt eigene, neue Informationen.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet KYC im Marketing?',
      opts: [
        { t: 'Keep Your Costs – Kosten tief halten', c: false },
        { t: 'Know Your Customer – Kunden kennen für gezielten, effizienten Ressourceneinsatz', c: true },
        { t: 'Keep Your Competitors – Konkurrenz beobachten', c: false },
        { t: 'Know Your Competition – Wettbewerb analysieren', c: false },
      ],
      explanation: 'KYC = Know Your Customer. Ähnliche Kunden – ähnliche Merkmale – ähnlich bearbeiten – Fokussierung – effizienter Ressourceneinsatz. Basis der Segmentierung.',
      difficulty: 'easy',
    },
    {
      q: 'Welche drei Segmentierungsarten musst du für die Prüfung kennen?',
      opts: [
        { t: 'Preis, Qualität und Menge', c: false },
        { t: 'Geografisch, demografisch und nach Kundenverhalten', c: true },
        { t: 'National, international und global', c: false },
        { t: 'Produkt, Preis und Vertrieb', c: false },
      ],
      explanation: 'Die drei Segmentierungsarten: geografisch (Ort, Region, Land), demografisch (Alter, Geschlecht, Einkommen, Bildung) und nach Kundenverhalten (Kaufverhalten, Bedürfnisse, Preissensibilität, Markentreue).',
      difficulty: 'easy',
    },
    {
      q: 'Ein Mobilfunkanbieter bietet einen günstigeren Tarif für Personen über 65 Jahre an. Welche Segmentierungsart ist das?',
      opts: [
        { t: 'Geografische Segmentierung', c: false },
        { t: 'Demografische Segmentierung', c: true },
        { t: 'Segmentierung nach Kundenverhalten', c: false },
        { t: 'KYC-Segmentierung', c: false },
      ],
      explanation: 'Demografische Segmentierung teilt nach Alter, Geschlecht, Einkommen, Bildung usw. ein. Ein Seniorentarif basiert auf dem Merkmal Alter.',
      difficulty: 'easy',
    },
    {
      q: 'Ein Unternehmen bietet in der Deutschschweiz ein anderes Produkt an als im Tessin. Welche Segmentierungsart nutzt es?',
      opts: [
        { t: 'Demografische Segmentierung', c: false },
        { t: 'Geografische Segmentierung', c: true },
        { t: 'Segmentierung nach Kundenverhalten', c: false },
        { t: 'Primäre Marktforschung', c: false },
      ],
      explanation: 'Geografische Segmentierung teilt nach Ort, Region, Land, Sprache oder Klima ein. Deutschschweiz vs. Tessin ist eine regionale (geografische) Unterscheidung.',
      difficulty: 'easy',
    },
    {
      q: 'Ein Sportgeschäft richtet sich gezielt an Kunden, die regelmässig Ausdauersport betreiben und markentreu sind. Welche Segmentierungsart ist das?',
      opts: [
        { t: 'Geografische Segmentierung', c: false },
        { t: 'Demografische Segmentierung', c: false },
        { t: 'Segmentierung nach Kundenverhalten', c: true },
        { t: 'Marktentwicklung', c: false },
      ],
      explanation: 'Segmentierung nach Kundenverhalten basiert auf Kaufverhalten, Bedürfnissen, Preissensibilität, Markentreue, Nutzungsgewohnheiten.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Marktvolumen und Marktpotenzial?',
      opts: [
        { t: 'Marktvolumen ist grösser als Marktpotenzial', c: false },
        { t: 'Marktvolumen = tatsächlich verkaufte Menge/Umsatz; Marktpotenzial = theoretisch maximal mögliche Nachfrage', c: true },
        { t: 'Marktvolumen betrifft das Inland, Marktpotenzial das Ausland', c: false },
        { t: 'Beide Begriffe bedeuten dasselbe', c: false },
      ],
      explanation: 'Marktvolumen = was aktuell wirklich verkauft wird (real). Marktpotenzial = theoretisches Maximum, was der Markt aufnehmen könnte. Deshalb gilt immer: Marktpotenzial ≥ Marktvolumen.',
      difficulty: 'medium',
    },
    {
      q: 'Ein Unternehmen macht CHF 4 Mio. Umsatz. Das gesamte Marktvolumen beträgt CHF 25 Mio. Wie hoch ist der Marktanteil?',
      opts: [
        { t: '4 %', c: false },
        { t: '16 %', c: true },
        { t: '25 %', c: false },
        { t: '6,25 %', c: false },
      ],
      explanation: 'Marktanteil = Unternehmensumsatz / Marktvolumen × 100 = 4 / 25 × 100 = 16 %.',
      difficulty: 'medium',
    },
    {
      q: 'Das Marktvolumen eines Marktes beträgt CHF 80 Mio., das Marktpotenzial CHF 120 Mio. Was bedeutet das?',
      opts: [
        { t: 'Der Markt ist übersättigt', c: false },
        { t: 'Es gibt noch unausgeschöpftes Wachstumspotenzial von CHF 40 Mio.', c: true },
        { t: 'Das Marktvolumen übersteigt das Marktpotenzial – das ist unmöglich', c: false },
        { t: 'Der Marktanteil beträgt 80 %', c: false },
      ],
      explanation: 'Marktpotenzial (120 Mio.) > Marktvolumen (80 Mio.) = Differenz von 40 Mio. ist noch nicht ausgeschöpft. Es besteht Wachstumspotenzial.',
      difficulty: 'medium',
    },
    {
      q: 'Warum macht Kundensegmentierung nur Sinn, wenn das Segment gross genug ist?',
      opts: [
        { t: 'Weil zu kleine Segmente gesetzlich verboten sind', c: false },
        { t: 'Weil sich der gezielte Einsatz von Ressourcen nur lohnt, wenn das Segment auch ausreichend Umsatzpotenzial bietet', c: true },
        { t: 'Weil die Marktforschung sonst zu teuer wird', c: false },
        { t: 'Weil kleine Segmente immer bereits von Konkurrenten besetzt sind', c: false },
      ],
      explanation: 'Segmentierung erfordert spezifische Massnahmen (Produkt, Werbung, Preise). Diese lohnen sich nur, wenn das Segment gross genug ist und zum Wachstumspotenzial des Unternehmens passt.',
      difficulty: 'medium',
    },
    {
      q: 'Wofür steht Field Research bei der Marktforschung?',
      opts: [
        { t: 'Auswertung von Berichten und Statistiken am Schreibtisch', c: false },
        { t: 'Direkte Datenerhebung im Markt (Umfragen, Interviews, Beobachtungen)', c: true },
        { t: 'Beobachtung von Konkurrenzprodukten im Regal', c: false },
        { t: 'Analyse von internen Verkaufszahlen', c: false },
      ],
      explanation: 'Field Research = primäre Marktforschung: Daten werden direkt im Feld (bei Kunden, im Markt) erhoben. Desk Research = sekundäre Marktforschung: Auswertung bestehender Daten.',
      difficulty: 'medium',
    },
    {
      q: 'In welcher Reihenfolge geht man bei der Marketingstrategie vor?',
      opts: [
        { t: 'Zuerst Werbung schalten, dann Strategie entwickeln', c: false },
        { t: 'Zuerst Markt analysieren und Strategie wählen, dann operativ mit den 4P umsetzen', c: true },
        { t: 'Zuerst Preise festlegen, dann Zielgruppe bestimmen', c: false },
        { t: 'Zuerst Produkt entwickeln, dann Markt suchen', c: false },
      ],
      explanation: 'Die richtige Reihenfolge: 1. Markt verstehen (Wo stehen wir? Welcher Markt?), 2. Strategie wählen (Preis? Differenzierung? Nische?), 3. Operativ mit 4P umsetzen.',
      difficulty: 'medium',
    },
  ])

  await reconnect()
  // ── Kapitel 2: Marketing-Mix (4P) ─────────────────────────────────────
  const chMarketingMix = await prisma.chapter.create({
    data: {
      slug: 'marketing-mix',
      title: 'Marketing-Mix (4P)',
      subtitle: 'Product, Price, Place und Promotion – operativer Kern des Marketings',
      topicId: tMarketing.id,
      order: 2,
      contentStatus: 'complete',
      summary: `Marketing-Mix: die 4P

Der operative Kern des Marketings ist der Marketing-Mix mit den 4P: Product, Price, Place, Promotion. Das ist absolut prüfungsrelevant. Du musst jeden Bereich erklären und Beispiele geben können.

Product – Produktpolitik

Zur Produktpolitik gehören die Stichworte: Differenzierung, Funktionalität, Geschmack, Wiedererkennung, Logo, Düfte, Haltbarkeit, Image Support. Ein Produkt ist nicht nur der Gegenstand selbst, sondern alles, was es ausmacht und wie es wahrgenommen wird. Zur Produktpolitik gehören: Qualität, Design, Verpackung, Marke, Name, Zusatznutzen, Service, Haltbarkeit, Wiedererkennung.

Für die Prüfung solltest du also erklären können: wie sich Produkte unterscheiden lassen, wie ein Unternehmen sein Produkt attraktiver macht, und wie Produktpolitik zur Differenzierung beiträgt.

Sortimentspolitik: Bei den Produktzielen musst du die vier Begriffe kennen – breit, schmal, tief, flach. Bedeutung: breites Sortiment = viele verschiedene Produktarten, schmales Sortiment = wenige Produktarten, tiefes Sortiment = viele Varianten innerhalb einer Produktart, flaches Sortiment = wenige Varianten. Das ist ein sehr klassisches Prüfungsthema, weil man oft entscheiden muss: Soll ein Unternehmen mehr Auswahl bieten oder sich konzentrieren?

Price – Preispolitik

Bei der Preispolitik musst du mehrere Dinge können: erklären, warum Preis ein wichtiges Wettbewerbsinstrument ist, den Zusammenhang von Preis und Nachfrage verstehen, einfache Preisaufgaben lösen, verschiedene Preisstrategien unterscheiden.

Die Preispolitik hängt mit Kostenführerschaft, Marktanteil, Umsatz, Kosten und Marktsituation zusammen. Wichtige Begriffe: kostenorientierte Preisfestsetzung, marktorientierte Preisfestsetzung, Preisdifferenzierung, Preisstrategie/Kostenführerschaft.

Preisdifferenzierung bedeutet: Gleiches oder ähnliches Produkt, aber unterschiedliche Preise je nach Kundengruppe, Zeitpunkt, Menge, Region oder Ausgestaltung. Das passt direkt zur Segmentierung. Für die Prüfung ist wichtig: Preis beeinflusst die Nachfrage, den Umsatz, die Wettbewerbsposition, und muss zu Kosten und Markt passen.

Place – Distributionspolitik

Die zentrale Frage: Auf welchem Weg gelangt das Produkt zum Kunden? Du musst unterscheiden können: Direkter Absatz (Hersteller verkauft direkt an Endkunden) und Indirekter Absatz (Verkauf über Zwischenhändler, Grosshandel, Detailhandel usw.).

Wichtige Entscheidungsfragen: Braucht das Produkt viel Erklärung? Ist Kundennähe wichtig? Will das Unternehmen selbst verkaufen oder über andere? Geht es eher um Massenware oder um Beratung?

Franchising

Franchising ist ausdrücklich im Marketing-Mix-Teil drin. Das musst du wissen: Der Franchising-Geber stellt Marke, Konzept, oft Werbung und Know-how zur Verfügung. Der Franchising-Nehmer nutzt dieses Konzept gegen Gebühr, ist rechtlich selbstständig, führt das Geschäft vor Ort.

Vorteil: schnelles Wachstum, weniger eigene Investitionen. Nachteil: geringere direkte Kontrolle durch die Geschäftsleitung. Das ist ein sehr typisches Prüfungsthema, weil man Vor- und Nachteile erklären muss.

Promotion – Kommunikationspolitik

Beim vierten P geht es um Kommunikation mit dem Markt. Dazu gehören Werbung und alle Massnahmen, mit denen ein Unternehmen Aufmerksamkeit, Interesse und Kaufbereitschaft erzeugt. Zentrales Modell: das AIDA-Prinzip.

AIDA: Attention = Aufmerksamkeit, Interest = Interesse, Desire = Wunsch, Action = Handlung/Kauf.

Das musst du für die Prüfung fast sicher können: das AIDA-Modell erklären, Werbung oder einen Flyer nach AIDA beurteilen, und Beispiele nennen, wie jede Stufe umgesetzt wird.

Beispiel: Attention – auffälliger Titel oder Bild. Interest – spannender Nutzen. Desire – Wunsch erzeugen. Action – klare Kaufaufforderung.`,
      learningGoals: {
        create: [
          { text: 'Die vier P des Marketing-Mix erklären und Beispiele nennen', order: 1 },
          { text: 'Produktpolitik: Differenzierung, Sortimentsbreite/-tiefe erklären', order: 2 },
          { text: 'Preispolitik: kosten- vs. marktorientiert, Preisdifferenzierung erklären', order: 3 },
          { text: 'Direkter vs. indirekter Absatz unterscheiden', order: 4 },
          { text: 'Franchising mit Vor- und Nachteilen erklären', order: 5 },
          { text: 'AIDA-Modell anwenden und Werbung damit analysieren', order: 6 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Marketing-Mix (4P)', definition: 'Product, Price, Place, Promotion – die vier aufeinander abgestimmten Marketinginstrumente', order: 1 },
          { term: 'Produktpolitik (Product)', definition: 'Alles rund ums Produkt: Qualität, Design, Verpackung, Marke, Name, Zusatznutzen, Haltbarkeit, Wiedererkennung', order: 2 },
          { term: 'Sortimentsbreite', definition: 'Anzahl verschiedener Produktarten (breit = viele, schmal = wenige Arten)', order: 3 },
          { term: 'Sortimentstiefe', definition: 'Anzahl Varianten innerhalb einer Produktart (tief = viele, flach = wenige Varianten)', order: 4 },
          { term: 'Preispolitik (Price)', definition: 'Festlegung des Preises: kosten- oder marktorientiert; Preis beeinflusst Nachfrage, Umsatz und Wettbewerbsposition', order: 5 },
          { term: 'Preisdifferenzierung', definition: 'Gleiches/ähnliches Produkt zu verschiedenen Preisen je nach Kundengruppe, Zeitpunkt, Menge oder Region', order: 6 },
          { term: 'Distributionspolitik (Place)', definition: 'Wie und auf welchem Weg gelangt das Produkt zum Kunden?', order: 7 },
          { term: 'Direkter Absatz', definition: 'Hersteller verkauft direkt an Endkunden (kein Zwischenhändler)', order: 8 },
          { term: 'Indirekter Absatz', definition: 'Verkauf über Zwischenhändler, Gross- oder Detailhandel', order: 9 },
          { term: 'Franchising', definition: 'Geber stellt Marke, Konzept und Know-how bereit; Nehmer führt Geschäft selbstständig gegen Lizenzgebühr', order: 10 },
          { term: 'Kommunikationspolitik (Promotion)', definition: 'Alle Massnahmen zur Marktansprache: Werbung, PR, Verkaufsförderung, persönlicher Verkauf', order: 11 },
          { term: 'AIDA-Modell', definition: 'Attention → Interest → Desire → Action – Stufenmodell der Werbewirkung', order: 12 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Product: Qualität, Design, Marke, Verpackung, Haltbarkeit, Wiedererkennung', order: 1 },
          { text: 'Sortiment: breit/schmal (Vielfalt) und tief/flach (Varianten)', order: 2 },
          { text: 'Price: Preis beeinflusst Nachfrage, Umsatz und Wettbewerbsposition – muss zu Kosten und Markt passen', order: 3 },
          { text: 'Preisdifferenzierung: gleiche Leistung, verschiedene Preise je nach Segment/Zeitpunkt', order: 4 },
          { text: 'Place: Erklärungsbedarf hoch → eher direkter Absatz; Massenware → eher indirekter Absatz', order: 5 },
          { text: 'Franchising-Vorteil: schnelles Wachstum, wenig eigene Investitionen', order: 6 },
          { text: 'Franchising-Nachteil: weniger direkte Kontrolle über Qualität und Auftreten', order: 7 },
          { text: 'AIDA: Attention (auffälliges Bild/Titel) → Interest (Nutzen) → Desire (Wunsch wecken) → Action (Kaufaufforderung)', order: 8 },
        ],
      },
      examples: {
        create: [
          { text: 'McDonald\'s = Franchising: Nehmer zahlen Lizenzgebühr, betreiben Filiale selbstständig unter der Marke', order: 1 },
          { text: 'Preisdifferenzierung: Kinoticket günstiger am Montag als am Samstag; Seniorentarif im ÖV', order: 2 },
          { text: 'AIDA-Analyse Werbeplakat: auffälliges Bild (A), spannende Headline (I), «Jetzt vorbestellen – nur noch 3 verfügbar» (D), QR-Code zum Kauf (A)', order: 3 },
          { text: 'Sortiment breit+tief: Migros – viele Produktkategorien (breit) mit vielen Varianten pro Kategorie (tief)', order: 4 },
        ],
      },
    },
  })

  await createQuiz(chMarketingMix.id, [
    {
      q: 'Welche vier Instrumente umfasst der Marketing-Mix?',
      opts: [
        { t: 'Preis, Personal, Planung, Produkt', c: false },
        { t: 'Product, Price, Place, Promotion', c: true },
        { t: 'Produkt, Prozess, Planung, Platzierung', c: false },
        { t: 'Profit, Person, Prozess, Produkt', c: false },
      ],
      explanation: 'Die 4P: Product (Produkt), Price (Preis), Place (Vertrieb/Distribution), Promotion (Kommunikation). Alle vier müssen aufeinander abgestimmt sein.',
      difficulty: 'easy',
    },
    {
      q: 'Was gehört zur Produktpolitik (Product)?',
      opts: [
        { t: 'Nur der Preis und die Rabatte', c: false },
        { t: 'Qualität, Design, Verpackung, Marke, Name, Zusatznutzen, Haltbarkeit, Wiedererkennung', c: true },
        { t: 'Der Vertriebskanal und die Logistik', c: false },
        { t: 'Werbung, PR und Verkaufsförderung', c: false },
      ],
      explanation: 'Produktpolitik umfasst alles, was das Produkt ausmacht und wie es wahrgenommen wird: Qualität, Design, Verpackung, Marke, Name, Zusatznutzen, Service, Haltbarkeit, Wiedererkennung.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Unterschied zwischen Sortimentsbreite und Sortimentstiefe?',
      opts: [
        { t: 'Breite = viele Varianten pro Produkt; Tiefe = viele Produktarten', c: false },
        { t: 'Breite = viele verschiedene Produktarten; Tiefe = viele Varianten innerhalb einer Produktart', c: true },
        { t: 'Breite und Tiefe bedeuten dasselbe', c: false },
        { t: 'Breite betrifft den Preis, Tiefe die Qualität', c: false },
      ],
      explanation: 'Sortimentsbreite = Anzahl verschiedener Produktarten. Sortimentstiefe = Anzahl Varianten innerhalb einer Produktart. Migros: breites Sortiment (viele Arten) und tiefes Sortiment (viele Varianten je Art).',
      difficulty: 'medium',
    },
    {
      q: 'Ein Bäcker verkauft 2 Sorten Brot (Weiss und Grau). Wie ist sein Sortiment?',
      opts: [
        { t: 'Breites und tiefes Sortiment', c: false },
        { t: 'Schmales und flaches Sortiment', c: true },
        { t: 'Schmales und tiefes Sortiment', c: false },
        { t: 'Breites und flaches Sortiment', c: false },
      ],
      explanation: 'Schmal = wenige Produktarten (nur Brot). Flach = wenige Varianten innerhalb der Produktart (nur 2 Sorten). → schmales, flaches Sortiment.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet kostenorientierte Preisfestsetzung?',
      opts: [
        { t: 'Preis wird danach festgelegt, was die Konkurrenz verlangt', c: false },
        { t: 'Preis wird auf Basis der eigenen Produktionskosten kalkuliert', c: true },
        { t: 'Preis wird nach dem AIDA-Modell bestimmt', c: false },
        { t: 'Preis wird durch die Nachfrage bestimmt', c: false },
      ],
      explanation: 'Kostenorientierte Preisfestsetzung: Der Preis basiert auf den eigenen Kosten (Material, Lohn, Gemeinkosten) plus einem Gewinnaufschlag. Marktorientierte Preisfestsetzung orientiert sich am Markt/Konkurrenz.',
      difficulty: 'medium',
    },
    {
      q: 'Ein Kinobetreiber verlangt am Montag CHF 10, am Samstag CHF 18 für das gleiche Ticket. Was ist das?',
      opts: [
        { t: 'Kostenführerschaft', c: false },
        { t: 'Preisdifferenzierung', c: true },
        { t: 'Sortimentstiefe', c: false },
        { t: 'Direkter Absatz', c: false },
      ],
      explanation: 'Preisdifferenzierung: Gleiches Produkt zu verschiedenen Preisen je nach Zeitpunkt, Kundengruppe oder Situation. Ziel: Ertrag maximieren und verschiedene Segmente ansprechen.',
      difficulty: 'easy',
    },
    {
      q: 'Warum beeinflusst der Preis die Nachfrage?',
      opts: [
        { t: 'Weil höhere Preise immer mehr Kunden anziehen', c: false },
        { t: 'Weil ein höherer Preis in der Regel die Nachfrage senkt und ein tieferer Preis sie erhöht', c: true },
        { t: 'Weil der Preis nichts mit der Nachfrage zu tun hat', c: false },
        { t: 'Weil der Preis nur die Kosten, nicht die Nachfrage beeinflusst', c: false },
      ],
      explanation: 'Grundregel der Preispolitik: Preis und Nachfrage stehen in einem umgekehrten Verhältnis – steigt der Preis, sinkt (in der Regel) die Nachfrage. Der Preis beeinflusst direkt Nachfrage, Umsatz und Wettbewerbsposition.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist direkter Absatz?',
      opts: [
        { t: 'Verkauf über Grosshändler und Detailhändler', c: false },
        { t: 'Hersteller verkauft direkt an den Endkunden ohne Zwischenhändler', c: true },
        { t: 'Verkauf ausschliesslich über das Internet', c: false },
        { t: 'Franchising-System mit Lizenzgebühr', c: false },
      ],
      explanation: 'Direkter Absatz: Hersteller → Endkunde, ohne Zwischenhändler. Indirekter Absatz: Hersteller → Grosshandel → Detailhandel → Endkunde.',
      difficulty: 'easy',
    },
    {
      q: 'Wann eignet sich direkter Absatz besonders?',
      opts: [
        { t: 'Bei Massenprodukten, die keine Erklärung brauchen', c: false },
        { t: 'Wenn das Produkt viel Erklärung braucht oder Kundennähe wichtig ist', c: true },
        { t: 'Wenn man möglichst viele Filialen aufbauen will', c: false },
        { t: 'Immer bei günstigen Produkten', c: false },
      ],
      explanation: 'Direkter Absatz eignet sich, wenn das Produkt erklärungsbedürftig ist (z. B. Maschinen, Beratungsleistungen) oder wenn persönliche Kundenbeziehung wichtig ist. Massenware läuft eher über indirekten Absatz.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Franchising-Geber?',
      opts: [
        { t: 'Der Betreiber einer einzelnen Filiale gegen Lizenzgebühr', c: false },
        { t: 'Das Unternehmen, das Marke, Konzept und Know-how zur Verfügung stellt', c: true },
        { t: 'Die Bank, die das Franchise finanziert', c: false },
        { t: 'Der Staat, der das Franchise genehmigt', c: false },
      ],
      explanation: 'Franchising-Geber: stellt Marke, Konzept, Werbung, Know-how bereit. Franchising-Nehmer: nutzt das Konzept gegen Lizenzgebühr, ist rechtlich selbstständig.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist ein Vorteil von Franchising für den Franchising-Geber?',
      opts: [
        { t: 'Der Geber hat volle Kontrolle über alle Filialen', c: false },
        { t: 'Schnelles Wachstum mit weniger eigenen Investitionen', c: true },
        { t: 'Der Geber trägt alle Kosten der Filialen', c: false },
        { t: 'Die Nehmer zahlen keine Lizenzgebühr', c: false },
      ],
      explanation: 'Franchising-Vorteil: Netzwerk wächst schnell, ohne dass der Geber selbst jede Filiale finanziert. Nachteil: weniger direkte Kontrolle über Qualität und Auftreten der Nehmer.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist ein Nachteil von Franchising für den Franchising-Geber?',
      opts: [
        { t: 'Das Netzwerk wächst zu langsam', c: false },
        { t: 'Geringere direkte Kontrolle über die Filialen', c: true },
        { t: 'Der Geber muss alle Verluste der Nehmer tragen', c: false },
        { t: 'Es entstehen sehr hohe Eigeninvestitionen', c: false },
      ],
      explanation: 'Der Nachteil von Franchising aus Sicht des Gebers: Die Nehmer sind rechtlich selbstständig, daher hat der Geber weniger direkte Kontrolle über Qualitätsstandards, Auftreten und Kundenerlebnis.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind die Stufen des AIDA-Modells?',
      opts: [
        { t: 'Analyse, Information, Data, Action', c: false },
        { t: 'Attention → Interest → Desire → Action', c: true },
        { t: 'Advertising → Investment → Design → Approval', c: false },
        { t: 'Awareness → Interaction → Decision → Adoption', c: false },
      ],
      explanation: 'AIDA: Aufmerksamkeit erzeugen (Attention) → Interesse wecken (Interest) → Kaufwunsch auslösen (Desire) → Kauf auslösen (Action).',
      difficulty: 'easy',
    },
    {
      q: 'Ein Inserat zeigt ein grosses Bild eines Sportwagens, dann den Fahrgenuss, dann «Nur noch 5 verfügbar – Jetzt bestellen». Was entspricht dem AIDA-Schritt «Desire»?',
      opts: [
        { t: 'Das grosse Bild des Sportwagens', c: false },
        { t: 'Die Aussage «Nur noch 5 verfügbar»', c: true },
        { t: 'Die Beschreibung des Fahrgenusses', c: false },
        { t: 'Der Markenname des Herstellers', c: false },
      ],
      explanation: 'Desire = Wunsch auslösen. «Nur noch 5 verfügbar» erzeugt Dringlichkeit und Begehren. Attention = Bild, Interest = Fahrgenuss, Action = «Jetzt bestellen».',
      difficulty: 'medium',
    },
    {
      q: 'Was gehört zur Kommunikationspolitik (Promotion)?',
      opts: [
        { t: 'Nur Fernsehwerbung', c: false },
        { t: 'Alle Massnahmen zur Marktansprache: Werbung, PR, Verkaufsförderung, persönlicher Verkauf', c: true },
        { t: 'Produktdesign und Verpackung', c: false },
        { t: 'Preisgestaltung und Rabatte', c: false },
      ],
      explanation: 'Promotion/Kommunikationspolitik umfasst alle Massnahmen, mit denen das Unternehmen mit dem Markt kommuniziert: Werbung, PR, Verkaufsförderung, persönlicher Verkauf – koordiniert nach AIDA.',
      difficulty: 'easy',
    },
    {
      q: 'Welches der folgenden Beispiele zeigt ein breites, aber flaches Sortiment?',
      opts: [
        { t: 'Ein Spezialgeschäft für Laufschuhe mit 50 Modellen', c: false },
        { t: 'Ein Warenhaus mit Elektronik, Kleidern, Lebensmitteln und Haushalt – je 2-3 Produkte pro Kategorie', c: true },
        { t: 'Ein Bäcker mit 20 verschiedenen Brotsorten', c: false },
        { t: 'Ein Online-Shop für nur ein Produkt in 30 Farben', c: false },
      ],
      explanation: 'Breit = viele Kategorien/Produktarten. Flach = wenige Varianten pro Kategorie. Ein Warenhaus mit vielen Abteilungen, aber je wenig Auswahl pro Abteilung ist breit und flach.',
      difficulty: 'hard',
    },
    {
      q: 'Warum müssen die 4P aufeinander abgestimmt sein?',
      opts: [
        { t: 'Weil das gesetzlich vorgeschrieben ist', c: false },
        { t: 'Weil ein unabgestimmter Mix Widersprüche erzeugt und die Zielgruppe verwirrt', c: true },
        { t: 'Weil alle vier P gleich viel kosten sollen', c: false },
        { t: 'Weil der Preis immer vom Produkt abhängt', c: false },
      ],
      explanation: 'Beispiel: Luxusprodukt (Product) mit Billigpreis (Price) und Discounter-Vertrieb (Place) passt nicht zusammen und beschädigt die Marke. Alle 4P müssen dieselbe Zielgruppe ansprechen.',
      difficulty: 'medium',
    },
    {
      q: 'McDonald\'s nutzt Franchising. Was bedeutet das für den einzelnen Filialbetreiber?',
      opts: [
        { t: 'Er gehört zur McDonald\'s-Konzernstruktur und ist angestellt', c: false },
        { t: 'Er ist rechtlich selbstständig, nutzt die Marke gegen Lizenzgebühr und führt die Filiale auf eigene Rechnung', c: true },
        { t: 'Er darf die McDonald\'s-Marke kostenlos nutzen', c: false },
        { t: 'Er muss alle Produkte selbst entwickeln', c: false },
      ],
      explanation: 'Franchising-Nehmer: rechtlich selbstständig, führt Filiale vor Ort, zahlt Lizenzgebühr an Geber (McDonald\'s), nutzt Marke, Konzept und Know-how des Gebers.',
      difficulty: 'medium',
    },
  ])

  await reconnect()
  // ── Kapitel 3: Marktstrategien ────────────────────────────────────────
  const chMarktstrategien = await prisma.chapter.create({
    data: {
      slug: 'marktstrategien',
      title: 'Marktstrategien',
      subtitle: 'SWOT, Wettbewerbsstrategien, Produktportfolio und Produktlebenszyklus',
      topicId: tMarketing.id,
      order: 3,
      contentStatus: 'complete',
      summary: `Gesättigte und wachsende Märkte

Ein zentrales Thema ist die Frage, ob ein Markt gesättigt ist oder noch wächst. Gesättigter Markt: kaum zusätzliches Wachstum, Marktanteile können oft nur noch auf Kosten der Konkurrenz gewonnen werden, Preis- und Konkurrenzdruck sind hoch. Wachstumsmarkt: Markt wächst noch, zusätzliche Nachfrage ist möglich, Expansion ist leichter.

Wichtig ist: In gesättigten Märkten spielen Kosten, Effizienz und Verdrängung oft eine grössere Rolle. In weniger gesättigten oder neuen Märkten spielen Differenzierung, Innovation und Marktentwicklung oft eine grössere Rolle. Kostenführerschaft gehört eher zu gesättigten Märkten.

Marktstrategien und Wettbewerbsstrategien

Das gehört zum Prüfungskern. Die vier Wettbewerbsstrategien: Gesamtmarktstrategie (das Unternehmen bearbeitet einen breiten Markt), Preisstrategie/Kostenführerschaft (das Unternehmen versucht, günstiger als die Konkurrenz zu sein – wichtig vor allem in gesättigten Märkten), Differenzierungsstrategie (das Unternehmen grenzt sich durch besondere Eigenschaften ab, z. B. Qualität, Design, Marke, Service), Nischenstrategie (Konzentration auf einen kleinen, klar abgegrenzten Teilmarkt – Fokus statt Gesamtmarkt).

Zusätzlich taucht Marktentwicklung auf: mit bestehenden Produkten neue Märkte erschliessen, zum Beispiel neue Regionen oder neue Kundengruppen. Für die Prüfung solltest du diese Strategien erklären und auf Beispiele anwenden können.

SWOT-Analyse

SWOT gehört klar zum strategischen Marketing-Zusammenhang. Du musst wissen: Strengths = Stärken, Weaknesses = Schwächen, Opportunities = Chancen, Threats = Risiken/Gefahren.

Die Frage dahinter ist: Wo stehen wir aktuell? Daraus leitet das Unternehmen seine Strategie ab. SWOT ist direkt mit Wettbewerbsstrategie und Unternehmenskonzept verknüpft. Interne Faktoren: Stärken und Schwächen. Externe Faktoren: Chancen und Risiken.

Produkt- und Marktportfolio

Zwei Modelle für die Abschlussprüfung:

BCG-Portfolio: Einordnung von Produkten nach Marktwachstum und relativem Marktanteil. Typische Felder: Stars (hohes Wachstum, hoher Marktanteil), Cash Cows (geringes Wachstum, hoher Marktanteil – finanzieren andere Produkte), Question Marks (hohes Wachstum, geringer Marktanteil – unsichere Zukunft), Poor Dogs (geringes Wachstum, geringer Marktanteil – oft abzustossen).

Ansoff-Matrix: zeigt Wachstumsrichtungen. Marktdurchdringung (bestehendes Produkt, bestehender Markt), Produktentwicklung (neues Produkt, bestehender Markt), Marktentwicklung (bestehendes Produkt, neuer Markt), Diversifikation (neues Produkt, neuer Markt).

Produktportfolio und Produktlebenszyklus

In den Notizen stehen Produktportfolio und querfinanzieren direkt zusammen. Die Idee: Ein Unternehmen hat meistens mehrere Produkte. Erfolgreiche Produkte finanzieren schwächere oder neue Produkte mit.

Produkte durchlaufen Lebensphasen: Einführung, Wachstum, Reife, Sättigung, Rückgang/Degeneration. Nicht alle Produkte sind gleichzeitig gleich erfolgreich. Neue Produkte kosten Geld. Reifere oder erfolgreichere Produkte (Cash Cows) helfen oft, neue Produkte zu finanzieren (Querfinanzierung).

Das Wichtigste, das du auswendig können solltest

Definition von Marketing – Absatzmarkt und Beschaffungsmarkt – Marktforschung vs. Markterkundung – primäre vs. sekundäre Marktforschung – KYC – geografische, demografische und verhaltensorientierte Segmentierung – Marktanteil, Marktvolumen, Marktpotenzial – gesättigter Markt – Kostenführerschaft – Differenzierung – Nischenstrategie – SWOT – Gesamtmarktstrategie – Marktentwicklung – Sortimentsbreite und Sortimentstiefe – Produktportfolio / Querfinanzierung – Marketing-Mix – Product, Price, Place, Promotion – Franchising – AIDA.

Lernformel: 1. Markt verstehen (Wer sind die Kunden? Wie gross ist der Markt? Wie sieht die Konkurrenz aus?), 2. Strategie wählen (Preis? Differenzierung? Nische? Gesamtmarkt?), 3. Mit 4P umsetzen (Product, Price, Place, Promotion).`,
      learningGoals: {
        create: [
          { text: 'SWOT-Analyse mit internen und externen Faktoren erklären', order: 1 },
          { text: 'Die vier Wettbewerbsstrategien nennen und unterscheiden', order: 2 },
          { text: 'Kostenführerschaft und gesättigte Märkte verknüpfen', order: 3 },
          { text: 'BCG-Portfolio und Ansoff-Matrix erklären', order: 4 },
          { text: 'Produktlebenszyklus und Querfinanzierung erklären', order: 5 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'SWOT-Analyse', definition: 'Strengths (Stärken) / Weaknesses (Schwächen) intern + Opportunities (Chancen) / Threats (Risiken) extern → Grundlage für Strategie', order: 1 },
          { term: 'Kostenführerschaft / Preisstrategie', definition: 'Unternehmen versucht günstiger als die Konkurrenz zu sein – vor allem in gesättigten Märkten', order: 2 },
          { term: 'Differenzierungsstrategie', definition: 'Abgrenzung durch besondere Eigenschaften: Qualität, Design, Marke, Service', order: 3 },
          { term: 'Nischenstrategie', definition: 'Konzentration auf einen kleinen, klar abgegrenzten Teilmarkt', order: 4 },
          { term: 'Gesamtmarktstrategie', definition: 'Bearbeitung eines breiten Marktes ohne Fokus auf ein Segment', order: 5 },
          { term: 'Marktentwicklung', definition: 'Mit bestehenden Produkten neue Märkte erschliessen (neue Regionen oder Kundengruppen)', order: 6 },
          { term: 'Gesättigter Markt', definition: 'Kaum zusätzliches Wachstum; Marktanteile nur noch auf Kosten der Konkurrenz – hoher Preis- und Konkurrenzdruck', order: 7 },
          { term: 'BCG-Portfolio', definition: 'Einordnung von Produkten nach Marktwachstum und relativem Marktanteil: Stars, Cash Cows, Question Marks, Poor Dogs', order: 8 },
          { term: 'Ansoff-Matrix', definition: 'Wachstumsrichtungen: Marktdurchdringung, Produktentwicklung, Marktentwicklung, Diversifikation', order: 9 },
          { term: 'Produktlebenszyklus', definition: 'Phasen: Einführung → Wachstum → Reife → Sättigung → Rückgang/Degeneration', order: 10 },
          { term: 'Querfinanzierung', definition: 'Starke/reife Produkte (Cash Cows) finanzieren neue oder schwächere Produkte im Produktportfolio', order: 11 },
        ],
      },
      corePoints: {
        create: [
          { text: 'SWOT: intern = Stärken/Schwächen; extern = Chancen/Risiken → Strategie daraus ableiten', order: 1 },
          { text: 'Kostenführerschaft passt vor allem zu gesättigten Märkten mit hohem Konkurrenzdruck', order: 2 },
          { text: 'Differenzierung: abheben durch Qualität, Design, Marke oder Service – nicht durch Preis', order: 3 },
          { text: 'Nische: kleiner Markt, aber klar fokussiert – besser als breiter Markt mit schlechter Position', order: 4 },
          { text: 'BCG: Stars (Wachstum+Anteil hoch), Cash Cows (Wachstum tief, Anteil hoch), Question Marks, Poor Dogs', order: 5 },
          { text: 'Ansoff: Marktdurchdringung (bestehend/bestehend), Produktentwicklung, Marktentwicklung, Diversifikation', order: 6 },
          { text: 'Querfinanzierung: Cash Cows finanzieren Question Marks und neue Produkte', order: 7 },
        ],
      },
      examples: {
        create: [
          { text: 'SWOT-Stärke: bekannte Marke. SWOT-Chance: wachsender Onlinehandel → Strategie: Differenzierung über Marke im E-Commerce', order: 1 },
          { text: 'Kostenführer: Aldi/Lidl – Kostenvorteile durch Effizienz weitergeben; Differenzierung: Apple – Design und Ökosystem statt günstigster Preis', order: 2 },
          { text: 'BCG: iPhone = Star; ältere Macbooks = Cash Cow; neue AR-Brille = Question Mark', order: 3 },
          { text: 'Produktlebenszyklus: Einführung (hohe Kosten, wenig Umsatz) → Wachstum → Reife (Maximum) → Rückgang (neue Produkte nötig)', order: 4 },
        ],
      },
    },
  })

  await createQuiz(chMarktstrategien.id, [
    {
      q: 'Welche vier Felder hat die SWOT-Analyse?',
      opts: [
        { t: 'Sales, Work, Operations, Tactics', c: false },
        { t: 'Strengths, Weaknesses, Opportunities, Threats', c: true },
        { t: 'Strategy, Worth, Outcomes, Targets', c: false },
        { t: 'Segment, Wachstum, Optimierung, Timing', c: false },
      ],
      explanation: 'SWOT: Strengths (Stärken) und Weaknesses (Schwächen) sind intern; Opportunities (Chancen) und Threats (Risiken) sind extern. Daraus leitet das Unternehmen seine Strategie ab.',
      difficulty: 'easy',
    },
    {
      q: 'Welche SWOT-Felder sind interne Faktoren?',
      opts: [
        { t: 'Chancen und Risiken', c: false },
        { t: 'Stärken und Schwächen', c: true },
        { t: 'Stärken und Chancen', c: false },
        { t: 'Schwächen und Risiken', c: false },
      ],
      explanation: 'Interne Faktoren: Stärken (was das Unternehmen gut kann) und Schwächen (was fehlt/schlecht läuft). Externe Faktoren: Chancen und Risiken aus dem Marktumfeld.',
      difficulty: 'easy',
    },
    {
      q: 'Ein Unternehmen erkennt, dass sein Markenname bekannt ist (Stärke) und der Online-Handel wächst (Chance). Was leitet es daraus ab?',
      opts: [
        { t: 'Eine Nischenstrategie', c: false },
        { t: 'Eine Differenzierungsstrategie über die Marke im Online-Handel', c: true },
        { t: 'Kostenführerschaft durch Preissenkung', c: false },
        { t: 'Den Rückzug aus dem Markt', c: false },
      ],
      explanation: 'SWOT-Logik: Stärke (bekannte Marke) + Chance (wachsender Onlinehandel) → Strategie nutzen: Differenzierung über die Marke im E-Commerce ausbauen.',
      difficulty: 'medium',
    },
    {
      q: 'Welche Wettbewerbsstrategie passt besonders gut zu einem gesättigten Markt?',
      opts: [
        { t: 'Differenzierungsstrategie', c: false },
        { t: 'Kostenführerschaft / Preisstrategie', c: true },
        { t: 'Nischenstrategie', c: false },
        { t: 'Marktentwicklung', c: false },
      ],
      explanation: 'In gesättigten Märkten sind Wachstum und neue Nachfrage kaum möglich. Marktanteile werden meist durch Verdrängung gewonnen → Kosten- und Preiseffizienz entscheidend (Kostenführerschaft).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist eine Differenzierungsstrategie?',
      opts: [
        { t: 'Das Unternehmen versucht, immer günstiger als die Konkurrenz zu sein', c: false },
        { t: 'Das Unternehmen hebt sich durch besondere Eigenschaften wie Qualität, Design oder Service ab', c: true },
        { t: 'Das Unternehmen fokussiert sich auf einen kleinen Teilmarkt', c: false },
        { t: 'Das Unternehmen bearbeitet so viele Märkte wie möglich', c: false },
      ],
      explanation: 'Differenzierungsstrategie: Das Unternehmen grenzt sich von der Konkurrenz ab, nicht durch Preis, sondern durch Qualität, Design, Marke oder besonderen Service.',
      difficulty: 'easy',
    },
    {
      q: 'Welches Unternehmen verfolgt am ehesten eine Kostenführerschaftsstrategie?',
      opts: [
        { t: 'Apple – bekannt für Premium-Design und hohe Preise', c: false },
        { t: 'Aldi – tiefe Preise durch maximale Kosteneffizienz', c: true },
        { t: 'Rolex – exklusives Luxussegment', c: false },
        { t: 'Tesla – innovative Technologie mit Premium-Preis', c: false },
      ],
      explanation: 'Kostenführerschaft: günstigster Anbieter im Markt durch strikte Kostenkontrolle (Aldi/Lidl). Differenzierung: Apple/Rolex/Tesla setzen auf andere Merkmale als den Preis.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist eine Nischenstrategie?',
      opts: [
        { t: 'Das Unternehmen bearbeitet einen möglichst breiten Markt', c: false },
        { t: 'Das Unternehmen konzentriert sich auf einen kleinen, klar abgegrenzten Teilmarkt', c: true },
        { t: 'Das Unternehmen versucht, alle Kunden gleich zu behandeln', c: false },
        { t: 'Das Unternehmen senkt die Preise unter die der Konkurrenz', c: false },
      ],
      explanation: 'Nischenstrategie: Fokus auf ein kleines, klar abgegrenztes Marktsegment statt auf den Gesamtmarkt. Vorteil: weniger direkte Konkurrenz, bessere Spezialisierung.',
      difficulty: 'easy',
    },
    {
      q: 'Ein Unternehmen verkauft sein bestehendes Produkt in einem neuen Land. Welche Ansoff-Strategie ist das?',
      opts: [
        { t: 'Marktdurchdringung', c: false },
        { t: 'Marktentwicklung', c: true },
        { t: 'Produktentwicklung', c: false },
        { t: 'Diversifikation', c: false },
      ],
      explanation: 'Marktentwicklung = bestehende Produkte auf neuen Märkten (neue Regionen, neue Kundengruppen). Marktdurchdringung = bestehend/bestehend; Produktentwicklung = neues Produkt/bestehender Markt; Diversifikation = neues Produkt/neuer Markt.',
      difficulty: 'medium',
    },
    {
      q: 'Ein Unternehmen entwickelt ein neues Produkt für seinen bestehenden Kundenstamm. Welche Ansoff-Strategie ist das?',
      opts: [
        { t: 'Marktdurchdringung', c: false },
        { t: 'Marktentwicklung', c: false },
        { t: 'Produktentwicklung', c: true },
        { t: 'Diversifikation', c: false },
      ],
      explanation: 'Produktentwicklung = neues Produkt auf bestehendem Markt (gleiche Kunden, neues Angebot). Beispiel: Apple bringt die Apple Watch für bestehende iPhone-Kunden.',
      difficulty: 'medium',
    },
    {
      q: 'Ein Unternehmen lanciert ein völlig neues Produkt in einem völlig neuen Markt. Welche Ansoff-Strategie ist das?',
      opts: [
        { t: 'Marktdurchdringung', c: false },
        { t: 'Marktentwicklung', c: false },
        { t: 'Produktentwicklung', c: false },
        { t: 'Diversifikation', c: true },
      ],
      explanation: 'Diversifikation = neues Produkt + neuer Markt. Höchstes Risiko unter den Ansoff-Strategien, da man weder das Produkt noch den Markt kennt.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind Stars im BCG-Portfolio?',
      opts: [
        { t: 'Produkte mit tiefem Marktwachstum und hohem Marktanteil', c: false },
        { t: 'Produkte mit hohem Marktwachstum und hohem Marktanteil', c: true },
        { t: 'Produkte mit tiefem Marktwachstum und tiefem Marktanteil', c: false },
        { t: 'Neue Produkte mit unsicherer Zukunft', c: false },
      ],
      explanation: 'Stars: hohes Marktwachstum + hoher Marktanteil. Vielversprechend, aber brauchen noch Investitionen. Wenn das Marktwachstum nachlässt, werden Stars zu Cash Cows.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind Cash Cows im BCG-Portfolio?',
      opts: [
        { t: 'Produkte mit hohem Marktwachstum und hohem Marktanteil', c: false },
        { t: 'Produkte mit tiefem Marktwachstum und hohem Marktanteil – hoher Cashflow, wenig Investitionsbedarf', c: true },
        { t: 'Produkte mit tiefem Marktwachstum und tiefem Marktanteil', c: false },
        { t: 'Neue Produkte mit unsicherer Zukunft', c: false },
      ],
      explanation: 'Cash Cows: gesättigter Markt (tiefes Wachstum), aber hoher Marktanteil → generieren viel Cash bei wenig Investitionsbedarf. Sie querfinanzieren Stars und Question Marks.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind Poor Dogs im BCG-Portfolio?',
      opts: [
        { t: 'Produkte mit hohem Marktanteil und tiefem Wachstum', c: false },
        { t: 'Produkte mit tiefem Marktwachstum und tiefem Marktanteil – häufig abzustossen', c: true },
        { t: 'Neue Produkte mit hohem Potenzial', c: false },
        { t: 'Produkte mit hohem Wachstum und tiefem Marktanteil', c: false },
      ],
      explanation: 'Poor Dogs: tiefes Marktwachstum + tiefer Marktanteil = weder Zukunftspotenzial noch hoher Cashflow. Diese Produkte sollten oft aus dem Sortiment genommen werden.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet Querfinanzierung im Produktportfolio?',
      opts: [
        { t: 'Das Unternehmen leiht sich Geld bei der Bank für neue Produkte', c: false },
        { t: 'Starke, reife Produkte (Cash Cows) finanzieren neue oder schwächere Produkte', c: true },
        { t: 'Das Unternehmen verkauft Produkte unter dem Selbstkostenpreis', c: false },
        { t: 'Zwei Unternehmen finanzieren sich gegenseitig', c: false },
      ],
      explanation: 'Querfinanzierung: Cash Cows generieren hohen Cashflow und finanzieren Question Marks oder neue Produkte in der Einführungsphase, die noch keine Gewinne erzielen.',
      difficulty: 'medium',
    },
    {
      q: 'In welcher Phase des Produktlebenszyklus ist der Umsatz typischerweise am höchsten?',
      opts: [
        { t: 'Einführungsphase', c: false },
        { t: 'Wachstumsphase', c: false },
        { t: 'Reifephase', c: true },
        { t: 'Rückgangsphase', c: false },
      ],
      explanation: 'Produktlebenszyklus: Einführung (tief), Wachstum (steigend), Reife (Maximum – höchster Umsatz), Sättigung (stagnierend), Rückgang (sinkend). In der Reifephase ist der Markt am grössten.',
      difficulty: 'medium',
    },
    {
      q: 'Welche der vier Wettbewerbsstrategien beschreibt, dass ein Unternehmen den gesamten Markt ohne spezifische Fokussierung bearbeitet?',
      opts: [
        { t: 'Nischenstrategie', c: false },
        { t: 'Gesamtmarktstrategie', c: true },
        { t: 'Differenzierungsstrategie', c: false },
        { t: 'Kostenführerschaft', c: false },
      ],
      explanation: 'Gesamtmarktstrategie: Das Unternehmen bearbeitet einen breiten Markt, ohne sich auf ein bestimmtes Segment zu konzentrieren. Beispiel: grosse Supermarktketten, die alle Kundengruppen ansprechen.',
      difficulty: 'easy',
    },
    {
      q: 'Ein Unternehmen erhöht seine Werbeausgaben, um mehr Kunden in seinem bestehenden Markt mit seinem bestehenden Produkt zu gewinnen. Welche Ansoff-Strategie ist das?',
      opts: [
        { t: 'Marktentwicklung', c: false },
        { t: 'Marktdurchdringung', c: true },
        { t: 'Produktentwicklung', c: false },
        { t: 'Diversifikation', c: false },
      ],
      explanation: 'Marktdurchdringung = bestehendes Produkt auf bestehendem Markt intensiver vermarkten. Ziel: Marktanteil erhöhen, ohne neue Märkte oder Produkte zu entwickeln.',
      difficulty: 'medium',
    },
    {
      q: 'Welche Aussage über gesättigte Märkte stimmt?',
      opts: [
        { t: 'In gesättigten Märkten ist Wachstum einfach, weil viele Kunden noch nicht bedient sind', c: false },
        { t: 'In gesättigten Märkten können Marktanteile oft nur durch Verdrängung der Konkurrenz gewonnen werden', c: true },
        { t: 'Gesättigte Märkte haben einen tiefen Preis- und Konkurrenzdruck', c: false },
        { t: 'In gesättigten Märkten lohnt sich Differenzierung mehr als Kostenführerschaft', c: false },
      ],
      explanation: 'Gesättigter Markt: kaum neues Wachstum → Marktanteile nur durch Verdrängung, hoher Preis- und Konkurrenzdruck. Deshalb ist Kostenführerschaft hier oft entscheidend.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet Marktentwicklung als Strategie?',
      opts: [
        { t: 'Ein neues Produkt für bestehende Kunden entwickeln', c: false },
        { t: 'Mit bestehenden Produkten neue Märkte erschliessen (neue Regionen oder Kundengruppen)', c: true },
        { t: 'Den bestehenden Markt durch Werbung intensiver bearbeiten', c: false },
        { t: 'Ein völlig neues Produkt in einem völlig neuen Markt einführen', c: false },
      ],
      explanation: 'Marktentwicklung = bestehendes Produkt auf neuen Märkten: neue geografische Regionen (z. B. Export) oder neue Kundengruppen (z. B. Jugendliche für ein bisher erwachsenenorientiertes Produkt).',
      difficulty: 'easy',
    },
  ])

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 2: FINANZIERUNG (AP)
  // Stadlin/Riemek/König, Kapitel 6.1 / 6.2 / 6.3 / 6.5 / 6.6
  // ─────────────────────────────────────────
  const tFinanzierung = await prisma.topic.create({
    data: {
      slug: 'finanzierung',
      title: 'Finanzierung',
      description: 'Eigen- und Fremdfinanzierung, Finanzierungsregeln, Kapitalstruktur – AP',
      icon: 'DollarSign',
      color: 'green',
      examType: 'abschluss',
      category: 'bwl',
      order: 2,
    },
  })

  const chFinanzierungsarten = await prisma.chapter.create({
    data: {
      slug: 'finanzierungsarten',
      title: 'Finanzierungsarten',
      subtitle: 'Eigenfinanzierung, Fremdfinanzierung und Finanzierungsregeln',
      topicId: tFinanzierung.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 2. Finanzierung\n\n## 2.1 Grundidee\n\nFinanzierung = Kapitalbeschaffung fuer Vermoegenswerte (Maschinen, Gebaeude, Umlaufvermoegen).\n\n## 2.2 Finanzierungsarten\n\nEigenfinanzierung: Kapital von Eigentuemern / aus Gewinnen.\nFremdfinanzierung: Kapital von Glaeubigern, mit Rueckzahlungspflicht und Zins.\nAussenfinanzierung: Kapital kommt von aussen.\nInnenfinanzierung: Kapital entsteht im Unternehmen (Gewinnthesaurierung).\n\n## 2.3 Finanzierungsziele\n\nRentabilitaet, Liquiditaet, Sicherheit.\nZielkonflikt: viel FK kann Eigenkapitalrendite erhoehen, aber auch Risiko steigern.\n\n## 2.4 Leverage-Effekt\n\nPositiv: Gesamtkapitalrendite > FK-Zins -> Eigenkapitalrendite steigt.\nNegativ: FK-Zins > Rendite -> Eigenkapitalrendite sinkt.\n\n## 2.5 Liquiditaetsgrade\n\nLiquiditaetsgrad 1: Fluessige Mittel / kurzfr. FK.\nLiquiditaetsgrad 2: (Fluessige Mittel + Forderungen) / kurzfr. FK.\nLiquiditaetsgrad 3: Umlaufvermoegen / kurzfr. FK.\n\n## 2.6 Goldene Bilanzregel\n\nLangfristige Vermoegensteile mit langfristigem Kapital finanzieren (Fristenkongruenz).\nAnlagedeckungsgrad 2: (EK + langfr. FK) / Anlagevermoegen >= 1.\n\n## 2.7 Sicherheiten\n\nRealsicherheiten (Pfand, Grundpfand), Personalsicherheiten (Buergschaft), Zession.\nHypothek: grundpfandgesicherter Kredit auf Immobilie.`,
      learningGoals: {
        create: [
          { text: 'Eigenfinanzierung und Fremdfinanzierung unterscheiden', order: 1 },
          { text: 'Beteiligungsfinanzierung und Selbstfinanzierung erklären', order: 2 },
          { text: 'Goldene Finanzierungsregel (Fristenkongruenz) anwenden', order: 3 },
          { text: 'Eigenkapitalquote und Verschuldungsgrad berechnen', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Eigenkapital (EK)', definition: 'Kapital, das von den Eigentümern eingebracht oder durch Gewinne angesammelt wurde', order: 1 },
          { term: 'Fremdkapital (FK)', definition: 'Kapital, das von Dritten (Banken, Gläubigern) geliehen wurde – muss zurückgezahlt werden', order: 2 },
          { term: 'Beteiligungsfinanzierung', definition: 'Aufnahme neuer Gesellschafter oder Aktionäre → EK erhöht sich', order: 3 },
          { term: 'Selbstfinanzierung', definition: 'Einbehaltung von Gewinnen statt Ausschüttung an Eigentümer', order: 4 },
          { term: 'Goldene Finanzierungsregel', definition: 'Langfristige Anlagen = langfristig finanziert; kurzfristige Anlagen = kurzfristig finanziert (Fristenkongruenz)', order: 5 },
          { term: 'Eigenkapitalquote', definition: 'EK / Gesamtkapital × 100 % – je höher, desto stabiler die Finanzierung', order: 6 },
          { term: 'Verschuldungsgrad', definition: 'FK / EK – zeigt das Verhältnis von Fremd- zu Eigenkapital', order: 7 },
          { term: 'Obligationenanleihe', definition: 'Schuldverschreibung: Unternehmen leiht sich Geld vom Publikum (Anleihe)', order: 8 },
        ],
      },
      corePoints: {
        create: [
          { text: 'EK: kein Rückzahlungszwang, kein Zins – Eigentümer tragen Verlustrisiko', order: 1 },
          { text: 'FK: muss zurückgezahlt werden, Zinspflicht – Gläubiger haben Vorrang bei Insolvenz', order: 2 },
          { text: 'Beteiligungsfinanzierung: AG gibt neue Aktien aus (Kapitalerhöhung)', order: 3 },
          { text: 'Selbstfinanzierung: stille Reserve durch Unterbewertung von Aktiven oder Überbewertung von Passiven', order: 4 },
          { text: 'Goldene Regel: Maschinenkauf (langfristig) → Bankkredit mit langer Laufzeit, NICHT kurzfristiger Kontokorrent', order: 5 },
          { text: 'Hohe EK-Quote = solide; hoher Verschuldungsgrad = riskanter, aber Leverage-Effekt möglich', order: 6 },
        ],
      },
      examples: {
        create: [
          { text: 'Kapitalerhöhung: AG gibt 1\'000 neue Aktien à CHF 100 aus → EK steigt um CHF 100\'000', order: 1 },
          { text: 'Fehler goldene Regel: Gebäude (30 Jahre) mit 1-Jahres-Kredit finanziert → Liquiditätsrisiko bei Verlängerung', order: 2 },
          { text: 'Selbstfinanzierung: Jahresgewinn CHF 500\'000, ausgeschüttet CHF 200\'000 → CHF 300\'000 im Unternehmen belassen', order: 3 },
        ],
      },
    },
  })

  await createQuiz(chFinanzierungsarten.id, [
    {
      q: 'Was ist der Unterschied zwischen Eigenkapital und Fremdkapital?',
      opts: [
        { t: 'Kein Unterschied – beide müssen verzinst werden', c: false },
        { t: 'EK: kein Rückzahlungszwang; FK: muss zurückgezahlt werden und ist zu verzinsen', c: true },
        { t: 'EK gehört dem Staat, FK gehört dem Unternehmen', c: false },
        { t: 'FK hat immer einen tieferen Zinssatz als EK', c: false },
      ],
      explanation: 'EK ist das Kapital der Eigentümer (kein Rückzahlungszwang, kein Zins). FK ist geliehenes Kapital von Dritten – muss zurückgezahlt und verzinst werden.',
      difficulty: 'easy',
    },
    {
      q: 'Was besagt die goldene Finanzierungsregel?',
      opts: [
        { t: 'Unternehmen sollen immer mehr EK als FK haben', c: false },
        { t: 'Langfristige Anlagen müssen langfristig finanziert werden (Fristenkongruenz)', c: true },
        { t: 'Gewinne müssen immer vollständig ausgeschüttet werden', c: false },
        { t: 'Zinsen auf FK sind immer steuerlich abzugsfähig', c: false },
      ],
      explanation: 'Goldene Finanzierungsregel = Fristenkongruenz: Langfristige Anlagen (z.B. Gebäude, Maschinen) sollen langfristig finanziert werden. Kurzfristige Finanzierung von langfristigen Anlagen birgt Liquiditätsrisiko.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist Selbstfinanzierung?',
      opts: [
        { t: 'Das Unternehmen leiht sich Geld von der eigenen Hausbank', c: false },
        { t: 'Einbehaltung von Gewinnen statt Ausschüttung an die Eigentümer', c: true },
        { t: 'Aufnahme neuer Aktionäre durch eine Kapitalerhöhung', c: false },
        { t: 'Finanzierung durch staatliche Subventionen', c: false },
      ],
      explanation: 'Selbstfinanzierung = thesaurierte Gewinne. Statt Dividende auszuzahlen, behält das Unternehmen den Gewinn ein und stärkt damit das Eigenkapital.',
      difficulty: 'easy',
    },
    {
      q: 'Was versteht man unter Aussenfinanzierung?',
      opts: [
        { t: 'Kapital, das durch Gewinne im Unternehmen entsteht', c: false },
        { t: 'Kapital, das von aussen ins Unternehmen fliesst (z.B. neue Aktionäre, Bankkredit)', c: true },
        { t: 'Finanzierung durch staatliche Fördergelder', c: false },
        { t: 'Abschreibungsrückflüsse aus dem Anlagevermögen', c: false },
      ],
      explanation: 'Aussenfinanzierung = Kapital kommt von ausserhalb des Unternehmens: neue Gesellschafter, Bankkredit, Obligationsanleihe. Gegenteil: Innenfinanzierung (Gewinnthesaurierung, Abschreibungsrückflüsse).',
      difficulty: 'easy',
    },
    {
      q: 'Was beschreibt der Leverage-Effekt?',
      opts: [
        { t: 'Je mehr Eigenkapital, desto höher der Gewinn', c: false },
        { t: 'Der Einfluss von Fremdkapital auf die Eigenkapitalrendite', c: true },
        { t: 'Die Wirkung von Inflation auf die Schuldenlast', c: false },
        { t: 'Das Verhältnis von Umsatz zum Gesamtkapital', c: false },
      ],
      explanation: 'Leverage-Effekt: Ist die Gesamtkapitalrendite höher als der Fremdkapitalzins, steigt die EK-Rendite durch mehr FK (positiv). Ist sie tiefer, sinkt sie (negativ). Fremdkapital lohnt sich nur, wenn es mehr bringt als es kostet.',
      difficulty: 'medium',
    },
    {
      q: 'Was misst die Gesamtkapitalrendite (ROI)?',
      opts: [
        { t: 'Den Gewinn im Verhältnis zum Eigenkapital', c: false },
        { t: 'Den Gewinn im Verhältnis zum gesamten eingesetzten Kapital', c: true },
        { t: 'Den Umsatz im Verhältnis zu den Gesamtkosten', c: false },
        { t: 'Die Liquidität des Unternehmens', c: false },
      ],
      explanation: 'ROI (Return on Investment) / Gesamtkapitalrendite = Gewinn / Gesamtkapital. Sie zeigt, wie rentabel das gesamte eingesetzte Kapital (EK + FK) arbeitet.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Liquiditätsgrad 1 und Liquiditätsgrad 2?',
      opts: [
        { t: 'Liquiditätsgrad 1 ist genauer und immer besser', c: false },
        { t: 'LG 1 = nur flüssige Mittel / kurzfristiges FK; LG 2 = flüssige Mittel + Forderungen / kurzfristiges FK', c: true },
        { t: 'LG 2 berücksichtigt auch das langfristige Fremdkapital', c: false },
        { t: 'LG 1 schliesst das Eigenkapital ein', c: false },
      ],
      explanation: 'LG 1 (streng): nur Kasse/Bank / kurzfristiges FK. LG 2 (realistischer): + Forderungen. LG 3 (weitest): + Vorräte. Je höher, desto eher kann das Unternehmen kurzfristige Verpflichtungen erfüllen.',
      difficulty: 'hard',
    },
    {
      q: 'Welches der folgenden Finanzierungsziele steht im Zielkonflikt mit hohem Fremdkapital?',
      opts: [
        { t: 'Rentabilität', c: false },
        { t: 'Sicherheit / Stabilität', c: true },
        { t: 'Innenfinanzierung', c: false },
        { t: 'Leverage-Effekt', c: false },
      ],
      explanation: 'Hoher Fremdkapitalanteil kann die EK-Rendite steigern (Rentabilität), gefährdet aber die Sicherheit: steigende Zinslasten, Abhängigkeit von Gläubigern, höheres Konkursrisiko.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist eine Hypothek?',
      opts: [
        { t: 'Ein kurzfristiger, ungesicherter Bankkredit', c: false },
        { t: 'Ein langfristiger, grundpfandgesicherter Kredit auf einer Immobilie', c: true },
        { t: 'Eine Bürgschaft einer dritten Person', c: false },
        { t: 'Eine Abtretung von Forderungen an die Bank', c: false },
      ],
      explanation: 'Hypothek = langfristiger Kredit, bei dem die Immobilie als Pfand dient. Das Eigentum bleibt beim Schuldner; bei Ausfall kann die Bank die Liegenschaft verwerten.',
      difficulty: 'easy',
    },
    {
      q: 'Was bedeutet die goldene Bilanzregel (Anlagedeckungsgrad)?',
      opts: [
        { t: 'Das Eigenkapital muss immer doppelt so gross sein wie das Fremdkapital', c: false },
        { t: 'Langfristig gebundenes Vermögen soll langfristig finanziert werden', c: true },
        { t: 'Umlaufvermögen muss immer vollständig durch EK gedeckt sein', c: false },
        { t: 'Gewinne müssen vollständig reinvestiert werden', c: false },
      ],
      explanation: 'Goldene Bilanzregel / Anlagedeckungsgrad: Anlagevermögen soll durch EK und langfristiges FK finanziert sein (AD 2 ≥ 100%). Kurzfristiges FK zur Finanzierung von Maschinen/Gebäuden birgt Liquiditätsrisiko.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist eine Zession als Kreditsicherheit?',
      opts: [
        { t: 'Eine Person bürgt für den Kreditnehmer', c: false },
        { t: 'Forderungen des Kreditnehmers werden an die Bank abgetreten', c: true },
        { t: 'Ein Grundstück wird der Bank als Pfand übertragen', c: false },
        { t: 'Der Staat übernimmt die Bürgschaft', c: false },
      ],
      explanation: 'Zession = Abtretung von Forderungen: Der Kreditnehmer überträgt seine zukünftigen Kundenzahlungen an die Bank als Sicherheit. Bei Zahlungsausfall kann die Bank direkt die Forderungen einziehen.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist der Unterschied zwischen Eigenkapitalrendite und Gesamtkapitalrendite?',
      opts: [
        { t: 'Sie sind identisch, nur andere Bezeichnungen', c: false },
        { t: 'EK-Rendite = Gewinn/Eigenkapital; GK-Rendite = Gewinn/Gesamtkapital (EK+FK)', c: true },
        { t: 'EK-Rendite bezieht sich auf Zinsen, GK-Rendite auf Dividenden', c: false },
        { t: 'GK-Rendite ist immer höher als EK-Rendite', c: false },
      ],
      explanation: 'EK-Rendite (ROE) = Gewinn / EK – relevant für Eigentümer. GK-Rendite (ROI) = Gewinn / (EK+FK) – relevant für die Rentabilität des gesamten Kapitaleinsatzes unabhängig von der Finanzierungsstruktur.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet Liquidität für ein Unternehmen?',
      opts: [
        { t: 'Das Unternehmen hat viele Aktiven in Form von Gebäuden', c: false },
        { t: 'Das Unternehmen kann seine fälligen Zahlungsverpflichtungen jederzeit erfüllen', c: true },
        { t: 'Das Unternehmen erwirtschaftet einen hohen Gewinn', c: false },
        { t: 'Das Unternehmen hat ein hohes Eigenkapital', c: false },
      ],
      explanation: 'Liquidität = Zahlungsfähigkeit. Ein Unternehmen muss Rechnungen, Löhne und Zinsen fristgerecht bezahlen können. Auch rentable Unternehmen können scheitern, wenn sie kurzfristig nicht zahlen können (Illiquidität = Konkursgrund).',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der operative Cash-Flow?',
      opts: [
        { t: 'Der Gewinn des Unternehmens nach Steuern', c: false },
        { t: 'Der Geldfluss aus dem eigentlichen Geschäftsbetrieb (Einzahlungen minus Auszahlungen)', c: true },
        { t: 'Die Differenz zwischen EK und FK', c: false },
        { t: 'Die jährlichen Abschreibungen auf das Anlagevermögen', c: false },
      ],
      explanation: 'Operativer Cash-Flow = tatsächlicher Geldeingang aus dem Kerngeschäft minus Geldausgaben. Er zeigt, ob das Unternehmen aus eigener Kraft Liquidität generiert – unabhängig von Buchhaltungseffekten wie Abschreibungen.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist ein gedeckter Kredit?',
      opts: [
        { t: 'Ein Kredit, der vollständig durch EK gedeckt ist', c: false },
        { t: 'Ein Kredit, der durch Sicherheiten (z.B. Pfand, Bürgschaft, Zession) abgesichert ist', c: true },
        { t: 'Ein Kredit ohne Zinsen', c: false },
        { t: 'Ein Kredit, der vom Staat garantiert wird', c: false },
      ],
      explanation: 'Gedeckter Kredit: Die Bank hat Sicherheiten (Realsicherheiten wie Pfand/Grundpfand oder Personalsicherheiten wie Bürgschaft, oder Zession). Das Ausfallrisiko ist geringer als bei ungedeckten Krediten, daher oft günstiger.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Fremdfinanzierungsgrad?',
      opts: [
        { t: 'Der Anteil des Eigenkapitals am Gesamtkapital', c: false },
        { t: 'Der Anteil des Fremdkapitals am Gesamtkapital', c: true },
        { t: 'Das Verhältnis von Fremdkapital zu Eigenkapital', c: false },
        { t: 'Die Zinsbelastung in Prozent des Gewinns', c: false },
      ],
      explanation: 'Fremdfinanzierungsgrad = FK / Gesamtkapital. Ein hoher Fremdfinanzierungsgrad bedeutet starke Abhängigkeit von Gläubigern und höheres Risiko. Gegenteil: Eigenfinanzierungsgrad = EK / Gesamtkapital.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist eine Bürgschaft als Kreditsicherheit?',
      opts: [
        { t: 'Die Bank leiht Geld ohne jede Sicherheit', c: false },
        { t: 'Eine dritte Person verpflichtet sich, für die Schulden des Kreditnehmers einzustehen', c: true },
        { t: 'Eine Immobilie wird der Bank als Sicherheit übertragen', c: false },
        { t: 'Der Kreditnehmer hinterlegt Wertpapiere bei der Bank', c: false },
      ],
      explanation: 'Bürgschaft = Personalsicherheit: Ein Bürge (z.B. Elternteil) verpflichtet sich, für den Kreditnehmer zu zahlen, wenn dieser ausfällt. Realsicherheiten sind dagegen konkrete Vermögenswerte (Pfand).',
      difficulty: 'medium',
    },
    {
      q: 'Was versteht man unter Innenfinanzierung?',
      opts: [
        { t: 'Kapital von neuen Gesellschaftern oder Banken', c: false },
        { t: 'Kapital, das im Unternehmen selbst entsteht (z.B. einbehaltene Gewinne, Abschreibungsrückflüsse)', c: true },
        { t: 'Finanzierung durch kurzfristige Bankkredite', c: false },
        { t: 'Kapital, das durch Ausgabe von Aktien beschafft wird', c: false },
      ],
      explanation: 'Innenfinanzierung: Kapital entsteht im Betrieb selbst – durch Gewinnthesaurierung (Selbstfinanzierung) oder Abschreibungsrückflüsse. Kein Kapitalzufluss von aussen nötig.',
      difficulty: 'easy',
    },
    {
      q: 'Wie wirkt sich ein negativer Leverage-Effekt auf die EK-Rendite aus?',
      opts: [
        { t: 'Die EK-Rendite steigt', c: false },
        { t: 'Die EK-Rendite sinkt unter die GK-Rendite', c: true },
        { t: 'Die EK-Rendite bleibt gleich', c: false },
        { t: 'Die EK-Rendite wird negativ, auch wenn das Unternehmen Gewinn macht', c: false },
      ],
      explanation: 'Negativer Leverage-Effekt: Fremdkapitalzins > GK-Rendite → die EK-Rendite wird durch den FK-Einsatz gesenkt. Das FK kostet mehr, als es einbringt.',
      difficulty: 'hard',
    },
    {
      q: 'Welches Finanzierungsziel steht im Vordergrund, wenn ein Unternehmen seine Eigenkapitalquote erhöht?',
      opts: [
        { t: 'Steigerung der Eigenkapitalrendite durch Leverage', c: false },
        { t: 'Sicherheit und Unabhängigkeit von Gläubigern', c: true },
        { t: 'Maximierung der kurzfristigen Liquidität', c: false },
        { t: 'Senkung der Steuerlast', c: false },
      ],
      explanation: 'Ein hoher Eigenfinanzierungsgrad bedeutet mehr Stabilität und Unabhängigkeit von Banken und Gläubigern. Das Zinsrisiko sinkt und das Unternehmen ist in Krisen widerstandsfähiger.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Liquiditätsgrad 3?',
      opts: [
        { t: 'Flüssige Mittel / kurzfristiges Fremdkapital', c: false },
        { t: 'Umlaufvermögen / kurzfristiges Fremdkapital', c: true },
        { t: 'Gesamtkapital / kurzfristiges Fremdkapital', c: false },
        { t: 'EK + langfristiges FK / Gesamtkapital', c: false },
      ],
      explanation: 'LG 3 = Umlaufvermögen / kurzfristiges FK. Er ist am weitesten gefasst, weil er auch Vorräte einschliesst. LG 3 ≥ 100% gilt als Mindestmass – das Umlaufvermögen sollte das kurzfristige FK decken.',
      difficulty: 'medium',
    },
    {
      q: 'Warum ist es problematisch, langfristige Anlagen kurzfristig zu finanzieren?',
      opts: [
        { t: 'Weil kurzfristige Kredite immer teurer sind', c: false },
        { t: 'Weil kurzfristige Kredite fällig werden, bevor die Anlage Erträge bringt – Liquiditätsrisiko', c: true },
        { t: 'Weil Banken keine kurzfristigen Hypotheken anbieten', c: false },
        { t: 'Weil es gesetzlich verboten ist', c: false },
      ],
      explanation: 'Verletzt die goldene Finanzierungsregel: Kurzfristige Kredite müssen vor Fälligkeit erneuert werden, aber die Anlage (z.B. Maschine) bringt erst langfristig Rückflüsse. Risiko: Kredit wird nicht verlängert → Liquiditätskrise.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist das Ziel des Cash-Flow-Managements?',
      opts: [
        { t: 'Den Gewinn des Unternehmens zu maximieren', c: false },
        { t: 'Zahlungsflüsse zu steuern, um jederzeit zahlungsfähig zu bleiben und Engpässe zu vermeiden', c: true },
        { t: 'Die Eigenkapitalrendite durch Leverage zu steigern', c: false },
        { t: 'Steuern zu optimieren', c: false },
      ],
      explanation: 'Cash-Flow-Management: Einzahlungen sichern, Auszahlungen planen, Reserven halten, Zahlungsfristen steuern. Ziel: jederzeit liquide sein und kurzfristige Engpässe vermeiden.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Fremdfinanzierung und Eigenfinanzierung?',
      opts: [
        { t: 'Fremdfinanzierung ist immer günstiger als Eigenfinanzierung', c: false },
        { t: 'EF: Kapital der Eigentümer ohne Rückzahlungspflicht; FF: Kapital von Gläubigern mit Rückzahlungs- und Zinspflicht', c: true },
        { t: 'Eigenfinanzierung kommt immer von aussen', c: false },
        { t: 'Fremdfinanzierung stärkt das Eigenkapital', c: false },
      ],
      explanation: 'Eigenfinanzierung: Kapital der Eigentümer (kein Rückzahlungszwang, kein fixer Zins). Fremdfinanzierung: Kapital von Gläubigern (Rückzahlung + Zinsen obligatorisch, unabhängig vom Gewinn).',
      difficulty: 'easy',
    },
    {
      q: 'Welche Aussage zum Anlagedeckungsgrad 2 ist korrekt?',
      opts: [
        { t: 'AD 2 = EK / Anlagevermögen', c: false },
        { t: 'AD 2 = (EK + langfristiges FK) / Anlagevermögen – sollte ≥ 100% sein', c: true },
        { t: 'AD 2 misst die kurzfristige Liquidität', c: false },
        { t: 'AD 2 ist immer höher als AD 1', c: false },
      ],
      explanation: 'AD 2 = (EK + langfristiges FK) / Anlagevermögen. Er sollte ≥ 100% sein (goldene Bilanzregel): Das gesamte Anlagevermögen soll durch langfristiges Kapital finanziert sein. AD 1 (nur EK) ist strenger.',
      difficulty: 'hard',
    },
    {
      q: 'Warum verdient eine Bank am Zinsdifferenzgeschäft?',
      opts: [
        { t: 'Weil sie Geld drucken darf', c: false },
        { t: 'Weil sie Kredite zu höherem Zins vergibt als sie für Einlagen zahlt', c: true },
        { t: 'Weil Bankgebühren höher sind als die Kreditkosten', c: false },
        { t: 'Weil der Staat Banken subventioniert', c: false },
      ],
      explanation: 'Zinsdifferenzgeschäft: Bank zahlt z.B. 0.5% auf Sparkonten (Passivgeschäft) und verlangt 3% auf Hypotheken (Aktivgeschäft). Die Differenz (2.5%) ist der Hauptertrag der Bank.',
      difficulty: 'easy',
    },
    {
      q: 'Was versteht man unter Rentabilität als Finanzierungsziel?',
      opts: [
        { t: 'Das Unternehmen hat immer genug Bargeld', c: false },
        { t: 'Das eingesetzte Kapital soll sich lohnen und eine angemessene Rendite abwerfen', c: true },
        { t: 'Das Unternehmen hat keine Schulden', c: false },
        { t: 'Das Unternehmen kann jeden Kredit zurückzahlen', c: false },
      ],
      explanation: 'Rentabilität = das eingesetzte Kapital bringt eine ausreichende Rendite. Eigentümer erwarten eine Verzinsung ihres Kapitals. Rentabilität steht oft im Spannungsfeld mit Sicherheit und Liquidität.',
      difficulty: 'easy',
    },
    {
      q: 'Was zeigt die Anlagevermögensintensität?',
      opts: [
        { t: 'Den Anteil des Umlaufvermögens am Gesamtvermögen', c: false },
        { t: 'Den Anteil des Anlagevermögens am Gesamtvermögen', c: true },
        { t: 'Das Verhältnis von EK zu AV', c: false },
        { t: 'Die Abschreibungsquote des Anlagevermögens', c: false },
      ],
      explanation: 'Anlagevermögensintensität = AV / Gesamtvermögen. Ein hoher Wert bedeutet kapitalintensives Unternehmen (z.B. Industrie). Hoher Anteil UV = flexibler, aber oft im Tagesgeschäft gebunden (z.B. Handelsbetrieb).',
      difficulty: 'medium',
    },
    {
      q: 'Welche der folgenden Finanzierungsquellen gehört zur Aussenfinanzierung mit Eigenkapital?',
      opts: [
        { t: 'Gewinnthesaurierung (einbehaltene Gewinne)', c: false },
        { t: 'Kapitalerhöhung durch Ausgabe neuer Aktien', c: true },
        { t: 'Aufnahme eines Bankkredits', c: false },
        { t: 'Abschreibungsrückflüsse', c: false },
      ],
      explanation: 'Aussenfinanzierung + EK: neue Gesellschafter bringen Kapital ein (z.B. Aktienausgabe). Innenfinanzierung + EK: Gewinnthesaurierung. FK-Aussenfinanzierung: Bankkredit. FK-Innenfinanzierung: Rückstellungen.',
      difficulty: 'hard',
    },
  ])

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 3: KAPITALANLAGEN & BANKEN/BÖRSEN (AP)
  // Stadlin/Riemek/König, Kapitel 7 / 8
  // ─────────────────────────────────────────
  const tKapital = await prisma.topic.create({
    data: {
      slug: 'kapitalanlagen-banken-boersen',
      title: 'Kapitalanlagen & Banken/Börsen',
      description: 'Present/Future Value, Obligationen, Aktien, Währungen und Anlagestrategien – AP',
      icon: 'BarChart2',
      color: 'orange',
      examType: 'abschluss',
      category: 'bwl',
      order: 3,
    },
  })

  await reconnect()
  const chFvPv = await prisma.chapter.create({
    data: {
      slug: 'future-present-value',
      title: 'Future Value & Present Value',
      subtitle: 'Zinsrechnung, Zinseszins und Diskontierung',
      topicId: tKapital.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 3. Kapitalanlagen und Banken & Boersen\n\n## 3.1 Anlageziele und Zielkonflikte\n\nWichtige Kriterien: Rendite, Risiko, Sicherheit, Liquiditaet, Nachhaltigkeit (ESG).\nRisikofaehigkeit: finanziell tragbares Risiko. Risikotoleranz: psychologisch aushaltbares Risiko.\n\n## 3.2 Anlageformen\n\nSparkonto: hohe Sicherheit, tiefe Rendite. Obligationen: Fremdkapitaltitel (Coupon + Rueckzahlung). Aktien: Beteiligungstitel (Dividende, Kursgewinn). Fonds: Diversifikation und professionelles Management.\n\n## 3.3 Obligationen und Zinszusammenhang\n\nSteigt das allgemeine Zinsniveau -> fallen bestehende Obligationenkurse (neue bringen mehr Zins).\nRisiken: Zinsaenderungsrisiko, Bonitaetsrisiko, Inflationsrisiko.\n\n## 3.4 Diversifikation und Portfolio\n\nDiversifikation = Risikostreuung. Spezifische Risiken koennen reduziert werden, Marktrisiko nicht vollstaendig.\nPortfoliorendite = gewichteter Durchschnitt der Einzelrenditen.\n\n## 3.5 Bewertungsgedanke: FV und PV\n\nFV (Future Value) = PV * (1 + r)^n -> zukuenftiger Wert einer heutigen Anlage.\nPV (Present Value) = FV / (1 + r)^n -> heutiger Wert einer zukuenftigen Zahlung.\n\nSteigen die Zinsen -> faellt der PV. Je laenger die Laufzeit, desto staerker der Effekt.\nZinseszins: Zinsen werden wieder verzinst.\n\n## 3.6 Banken und Boerse\n\nBanken: Passivgeschaeft (Einlagen) und Aktivgeschaeft (Kredite). Zinsdifferenzgeschaeft.\nBoerse: Primaermarkt (Erstausgabe) und Sekundaermarkt (spaeterer Handel zwischen Anlegern).`,
      learningGoals: {
        create: [
          { text: 'Future Value mit Zinseszins berechnen: FV = PV × (1+i)^n', order: 1 },
          { text: 'Present Value berechnen: PV = FV / (1+i)^n', order: 2 },
          { text: 'Zusammenhang zwischen Zinsen und PV erklären', order: 3 },
          { text: 'Investitionsentscheid auf Basis von PV treffen', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Future Value (FV)', definition: 'Zukünftiger Wert einer heutigen Anlage: FV = PV × (1+i)^n', order: 1 },
          { term: 'Present Value (PV)', definition: 'Heutiger Wert einer zukünftigen Zahlung: PV = FV / (1+i)^n', order: 2 },
          { term: 'Diskontierung', definition: 'Berechnung des Barwerts (PV) zukünftiger Zahlungen', order: 3 },
          { term: 'Zinseszins', definition: 'Zinsen werden auf das Kapital inklusive bereits aufgelaufener Zinsen berechnet', order: 4 },
          { term: 'Nominalzins', definition: 'Vertraglicher Zinssatz ohne Inflationsbereinigung', order: 5 },
          { term: 'Realzins', definition: 'Nominalzins minus Inflationsrate', order: 6 },
        ],
      },
      corePoints: {
        create: [
          { text: 'FV = PV × (1+i)^n: CHF 1\'000 zu 5% nach 3 Jahren = 1\'157.63 CHF', order: 1 },
          { text: 'PV = FV / (1+i)^n: Wie viel muss ich heute anlegen, um in 3 Jahren CHF 1\'000 zu haben?', order: 2 },
          { text: 'Steigen Zinsen → PV sinkt; sinken Zinsen → PV steigt', order: 3 },
          { text: 'Je häufiger Auszahlungen → desto höher PV', order: 4 },
          { text: 'Je länger die Laufzeit → desto höher PV (bei gleichem Zins)', order: 5 },
          { text: 'Investitionsentscheid: PV(Kosten) < PV(Erträge) → investieren', order: 6 },
        ],
      },
      examples: {
        create: [
          { text: 'CHF 1\'000 zu 5% nach 3 Jahren: T1=1\'050, T2=1\'102.50, T3=1\'157.63', order: 1 },
          { text: 'Annuität: 3× CHF 20\'000 zu 1%: T0=20\'402, T1=40\'814, T2=62\'444...', order: 2 },
        ],
      },
    },
  })

  await createQuiz(chFvPv.id, [
    {
      q: 'Was passiert mit dem Present Value (PV), wenn der Zinssatz steigt?',
      opts: [
        { t: 'PV steigt', c: false },
        { t: 'PV sinkt', c: true },
        { t: 'PV bleibt gleich', c: false },
        { t: 'PV verdoppelt sich', c: false },
      ],
      explanation: '"Steigen die Zinsen, fällt der PV" – bei höherem Diskontierungssatz wird der heutige Wert zukünftiger Zahlungen geringer.',
      difficulty: 'medium',
    },
    {
      q: 'Wie lautet die Formel für den Future Value?',
      opts: [
        { t: 'FV = PV / (1+i)^n', c: false },
        { t: 'FV = PV × (1+i)^n', c: true },
        { t: 'FV = PV + i × n', c: false },
        { t: 'FV = PV × i^n', c: false },
      ],
      explanation: 'FV = PV × (1+i)^n berücksichtigt den Zinseszins. Der Unterschied zu einfacher Verzinsung: Zinsen werden jedes Jahr auf das neue (höhere) Kapital berechnet.',
      difficulty: 'easy',
    },
    {
      q: 'CHF 2\'000 werden zu 3% p.a. für 2 Jahre angelegt. Wie lautet der Future Value?',
      opts: [
        { t: 'CHF 2\'060.00', c: false },
        { t: 'CHF 2\'121.80', c: true },
        { t: 'CHF 2\'120.00', c: false },
        { t: 'CHF 2\'060.90', c: false },
      ],
      explanation: 'FV = 2\'000 × (1.03)^2 = 2\'000 × 1.0609 = CHF 2\'121.80. Der Unterschied zu einfacher Verzinsung (2\'120) kommt durch den Zinseszins im 2. Jahr.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet Diskontierung?',
      opts: [
        { t: 'Eine Preisreduktion beim Kauf', c: false },
        { t: 'Die Berechnung des heutigen Wertes (PV) einer zukünftigen Zahlung', c: true },
        { t: 'Die Berechnung der Verzinsung über mehrere Perioden', c: false },
        { t: 'Das Aufzinsen eines Betrags in die Zukunft', c: false },
      ],
      explanation: 'Diskontierung = Abzinsung: Man rechnet rückwärts und fragt, was eine zukünftige Zahlung heute wert ist. PV = FV / (1+i)^n. Gegenteil: Aufzinsung (FV berechnen).',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Present Value von CHF 1\'000 in 3 Jahren bei einem Zinssatz von 5%?',
      opts: [
        { t: 'CHF 950.00', c: false },
        { t: 'CHF 863.84', c: true },
        { t: 'CHF 857.14', c: false },
        { t: 'CHF 750.00', c: false },
      ],
      explanation: 'PV = 1\'000 / (1.05)^3 = 1\'000 / 1.157625 ≈ CHF 863.84. Je höher der Zins und je länger die Laufzeit, desto tiefer ist der heutige Wert einer zukünftigen Zahlung.',
      difficulty: 'hard',
    },
    {
      q: 'Wie ändert sich der Present Value, wenn der Zinssatz von 3% auf 6% steigt (bei gleicher zukünftiger Zahlung)?',
      opts: [
        { t: 'Der PV steigt', c: false },
        { t: 'Der PV sinkt', c: true },
        { t: 'Der PV bleibt gleich', c: false },
        { t: 'Der PV verdoppelt sich', c: false },
      ],
      explanation: 'Höherer Zins → stärkere Diskontierung → tieferer PV. Intuitiv: Bei 6% braucht man heute weniger anzulegen, um morgen CHF 1\'000 zu haben, als bei 3%.',
      difficulty: 'easy',
    },
    {
      q: 'Welchen Einfluss hat eine längere Laufzeit auf den Present Value (bei gleichem Zinssatz)?',
      opts: [
        { t: 'Der PV steigt, weil man länger wartet', c: false },
        { t: 'Der PV sinkt, weil die zukünftige Zahlung weiter in der Zukunft liegt', c: true },
        { t: 'Der PV bleibt unverändert', c: false },
        { t: 'Der PV verdoppelt sich mit jeder Verdoppelung der Laufzeit', c: false },
      ],
      explanation: 'Längere Laufzeit → mehr Abzinsungsperioden → PV sinkt. Eine Zahlung in 10 Jahren ist heute weniger wert als dieselbe Zahlung in 5 Jahren, weil das Geld länger arbeiten kann.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Zinseszins-Effekt?',
      opts: [
        { t: 'Zinsen werden nur auf das ursprüngliche Kapital berechnet', c: false },
        { t: 'Zinsen werden jede Periode auf das gewachsene Kapital (inkl. aufgelaufener Zinsen) berechnet', c: true },
        { t: 'Zinsen werden erst am Ende der Laufzeit berechnet', c: false },
        { t: 'Der Zins bleibt konstant, unabhängig vom Kapital', c: false },
      ],
      explanation: 'Zinseszins: Im Jahr 1 werden Zinsen auf PV berechnet. Im Jahr 2 werden Zinsen auf PV + Zinsen Jahr 1 berechnet. FV = PV × (1+i)^n – das n im Exponenten erzeugt den Zinseszinseffekt.',
      difficulty: 'easy',
    },
    {
      q: 'Wann lohnt sich eine Investition aus PV-Sicht?',
      opts: [
        { t: 'Wenn der PV der Kosten grösser ist als der PV der Erträge', c: false },
        { t: 'Wenn der PV der Erträge grösser ist als der PV der Kosten', c: true },
        { t: 'Immer, wenn der Zinssatz unter 5% liegt', c: false },
        { t: 'Wenn der FV höher ist als der Kaufpreis', c: false },
      ],
      explanation: 'Investitionsentscheid: PV(Erträge) > PV(Kosten) → positiver Kapitalwert → Investition lohnt sich. Wenn PV(Kosten) > PV(Erträge) → negative Rendite → nicht investieren.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Nominalzins und Realzins?',
      opts: [
        { t: 'Sie sind identisch – nur andere Bezeichnungen', c: false },
        { t: 'Nominalzins = vertraglicher Zins; Realzins = Nominalzins minus Inflationsrate', c: true },
        { t: 'Nominalzins ist immer höher als Realzins', c: false },
        { t: 'Realzins gilt nur für Staatsanleihen', c: false },
      ],
      explanation: 'Realzins = Nominalzins − Inflationsrate. Bei 4% Nominalzins und 2% Inflation beträgt der Realzins 2%. Der Realzins gibt die tatsächliche Kaufkraftsteigerung einer Anlage an.',
      difficulty: 'medium',
    },
    {
      q: 'CHF 500 werden einmalig angelegt und sollen in 1 Jahr CHF 525 ergeben. Wie hoch ist der Zinssatz?',
      opts: [
        { t: '3%', c: false },
        { t: '5%', c: true },
        { t: '4.5%', c: false },
        { t: '2.5%', c: false },
      ],
      explanation: 'FV = PV × (1+i)^1 → 525 = 500 × (1+i) → 1+i = 525/500 = 1.05 → i = 5%.',
      difficulty: 'medium',
    },
    {
      q: 'Was versteht man unter einer Annuität?',
      opts: [
        { t: 'Eine einmalige Zahlung am Ende der Laufzeit', c: false },
        { t: 'Regelmässige, gleich hohe Zahlungen über mehrere Perioden', c: true },
        { t: 'Eine Zahlung, die jährlich um einen fixen Betrag steigt', c: false },
        { t: 'Der Coupon einer Obligation', c: false },
      ],
      explanation: 'Annuität = regelmässige, gleich hohe Zahlungen (z.B. monatliche Hypothekarraten oder jährliche Rentenzahlungen). Der PV aller Annuitäten ergibt den heutigen Gesamtwert dieser Zahlungsreihe.',
      difficulty: 'medium',
    },
    {
      q: 'Wie verändert sich der Future Value, wenn der Zinssatz steigt (bei gleichem PV und gleicher Laufzeit)?',
      opts: [
        { t: 'Der FV sinkt', c: false },
        { t: 'Der FV steigt', c: true },
        { t: 'Der FV bleibt gleich', c: false },
        { t: 'Der FV sinkt zuerst und steigt dann', c: false },
      ],
      explanation: 'Höherer Zinssatz → stärkeres Wachstum → höherer FV. FV = PV × (1+i)^n: Je grösser i, desto grösser der Faktor und damit FV.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Zusammenhang zwischen PV und FV?',
      opts: [
        { t: 'PV und FV sind immer gleich gross', c: false },
        { t: 'FV ist der aufgezinste PV; PV ist der diskontierte FV', c: true },
        { t: 'PV ist immer grösser als FV', c: false },
        { t: 'FV entsteht durch Multiplikation von PV mit dem Zinssatz', c: false },
      ],
      explanation: 'FV = PV × (1+i)^n (Aufzinsung). PV = FV / (1+i)^n (Diskontierung). Es sind zwei Seiten derselben Gleichung – je nach Fragestellung löst man nach FV oder PV.',
      difficulty: 'easy',
    },
    {
      q: 'Bei welchem Zinssatz steigt der PV einer zukünftigen Zahlung am meisten – 2%, 5% oder 10%?',
      opts: [
        { t: 'Bei 10%', c: false },
        { t: 'Bei 2%', c: true },
        { t: 'Bei 5%', c: false },
        { t: 'Der Zinssatz hat keinen Einfluss auf den PV', c: false },
      ],
      explanation: 'Je tiefer der Zinssatz, desto weniger wird abgezinst, desto höher ist der PV. Bei 2% ist der PV von CHF 1\'000 in 5 Jahren höher als bei 5% oder 10%.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet es, wenn der Kapitalwert einer Investition (PV der Erträge minus PV der Kosten) gleich null ist?',
      opts: [
        { t: 'Die Investition lohnt sich nicht', c: false },
        { t: 'Die Investition erzielt genau die geforderte Mindestrendite (break-even)', c: true },
        { t: 'Die Investition erzielt eine Superrendite', c: false },
        { t: 'Das Unternehmen macht weder Gewinn noch Verlust', c: false },
      ],
      explanation: 'Kapitalwert = 0: PV der Erträge = PV der Kosten. Das bedeutet, die Investition erzielt exakt die als Kalkulationszinssatz verwendete Mindestrendite. Positiver KW → Mehrwert; negativer KW → lohnt sich nicht.',
      difficulty: 'hard',
    },
    {
      q: 'CHF 1\'000 werden zu 4% angelegt. Was ist der FV nach genau 1 Jahr?',
      opts: [
        { t: 'CHF 1\'040', c: true },
        { t: 'CHF 1\'400', c: false },
        { t: 'CHF 1\'004', c: false },
        { t: 'CHF 1\'080', c: false },
      ],
      explanation: 'FV = 1\'000 × (1.04)^1 = 1\'000 × 1.04 = CHF 1\'040. Nach genau einem Jahr gibt es noch keinen Zinseszinseffekt – er tritt erst ab Jahr 2 auf.',
      difficulty: 'easy',
    },
  ])

  await reconnect()
  const chObligationen = await prisma.chapter.create({
    data: {
      slug: 'obligationen-aktien',
      title: 'Obligationen & Aktien',
      subtitle: 'Anlagebewertung, Coupon, YTM, DDM, P/E Ratio',
      topicId: tKapital.id,
      order: 2,
      contentStatus: 'complete',
      summary: `# 3. Obligationen und Aktien\n\n## Obligationen (Fremdkapitaltitel)\n\nEine Obligation ist ein Fremdkapitaltitel: Der Anleger leiht dem Schuldner Geld und erhaelt Coupon (Zins) und am Ende die Rueckzahlung des Nennwerts.\n\nWichtiger Zusammenhang: Steigt das allgemeine Zinsniveau -> fallen bestehende Obligationenkurse.\nFair Value einer Obligation = PV aller zukuenftigen Zahlungen (Coupons + Nennwert), abgezinst mit dem Marktzins.\n\nRisiken: Zinsaenderungsrisiko, Bonitaetsrisiko, Inflationsrisiko.\n\n## Aktien (Beteiligungstitel)\n\nAktionaere sind Miteigentuemer. Ertrag: Dividende + Kursgewinne. Risiken: Kursverluste, Unternehmensrisiko.\n\nBewertungsmodelle:\n- P/E Ratio (Kurs-Gewinn-Verhaeltnis): Kurs / Gewinn pro Aktie\n- DDM (Dividend Discount Model): Aktienwert = erwartete Dividende / (Diskontierungssatz - Wachstumsrate)\n\n## Diversifikation\n\nDiversifikation reduziert spezifische Einzelrisiken, aber nicht das allgemeine Marktrisiko.\nPortfoliorendite = gewichteter Durchschnitt der Einzelrenditen.\n\n## Anlegerprofil\n\nRisikofaehigkeit: finanziell tragbares Risiko (Einkommen, Vermoegen, Zeithorizont).\nRisikotoleranz: psychologisch aushaltbares Risiko.\n\nDie Anlage muss zum Anlegerprofil passen.`,
      learningGoals: {
        create: [
          { text: 'Fair Value einer Obligation berechnen', order: 1 },
          { text: 'Zusammenhang Zinsen und Obligationskurs erklären', order: 2 },
          { text: 'P/E Ratio berechnen und interpretieren', order: 3 },
          { text: 'DDM-Konzept erklären', order: 4 },
          { text: 'Rechte eines Aktionärs aufzählen', order: 5 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Coupon', definition: 'Jährliche Zinszahlung einer Obligation (Nominalwert × Couponzins)', order: 1 },
          { term: 'Fair Value (Obligation)', definition: 'PV aller zukünftigen Zahlungen (Coupons + Rückzahlung) diskontiert mit Marktzins', order: 2 },
          { term: 'YTM (Yield to Maturity)', definition: 'Rendite auf Verfall: Gesamtrendite wenn Obligation bis Fälligkeit gehalten wird', order: 3 },
          { term: 'P/E Ratio', definition: 'Kurs-Gewinn-Verhältnis: Aktienkurs / Gewinn pro Aktie', order: 4 },
          { term: 'DDM (Dividend Discount Model)', definition: 'Aktienbewertung: PV aller zukünftigen Dividenden', order: 5 },
          { term: 'Dividende', definition: 'Gewinnausschüttung an Aktionäre', order: 6 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Obligation Fair Value: Summe der diskontierten Coupons + diskontierten Rückzahlungsbetrag', order: 1 },
          { text: 'Marktzins sinkt → Obligationskurs steigt (gegenläufig!)', order: 2 },
          { text: 'YTM = interne Rendite der Obligation', order: 3 },
          { text: 'P/E tief → möglicherweise unterbewertet; immer im Vergleich mit ähnlichen Aktien', order: 4 },
          { text: 'Aktionärsrechte: Dividende + Kursgewinn + Stimmrecht', order: 5 },
          { text: 'DDM bei konstanter Dividende: PV = D / i (Gordon Growth Model)', order: 6 },
        ],
      },
      examples: {
        create: [
          { text: 'Obligation CHF 10\'000, Coupon 5%, Laufzeit 3J, Marktzins 2%: FV = 108.65% → Fair Value über pari', order: 1 },
          { text: 'DDM: Aktie zahlt immer CHF 5 Dividende, i=2% → PV = 5/0.02 = CHF 250', order: 2 },
        ],
      },
    },
  })

  await createQuiz(chObligationen.id, [
    {
      q: 'Was passiert mit dem Kurs einer Obligation, wenn die Marktzinsen sinken?',
      opts: [
        { t: 'Der Kurs sinkt', c: false },
        { t: 'Der Kurs steigt', c: true },
        { t: 'Der Kurs bleibt unverändert', c: false },
        { t: 'Die Obligation wird zurückgezahlt', c: false },
      ],
      explanation: 'Obligationskurs und Marktzinsen bewegen sich gegenläufig: Sinkt der Marktzins → steigt der PV der Obligation → steigt ihr Kurs.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist das P/E Ratio?',
      opts: [
        { t: 'Preis des Unternehmens / Eigenkapital', c: false },
        { t: 'Aktienkurs / Gewinn pro Aktie', c: true },
        { t: 'Gewinn / Umsatz × 100', c: false },
        { t: 'Dividende / Aktienkurs', c: false },
      ],
      explanation: 'P/E = Price/Earnings = Aktienkurs / Gewinn pro Aktie. Ein tiefes P/E deutet auf mögliche Unterbewertung hin – immer im Vergleich zu ähnlichen Unternehmen.',
      difficulty: 'medium',
    },
    {
      q: 'Welche drei Rechte hat ein Aktionär?',
      opts: [
        { t: 'Stimmrecht, fixer Zins, Rückzahlung des Kapitals', c: false },
        { t: 'Dividendenanspruch, Kursgewinnpotenzial, Stimmrecht', c: true },
        { t: 'Dividende, Vorzugsstimmrecht, Insolvenzschutz', c: false },
        { t: 'Zinszahlung, Rückzahlung, Mitbestimmung', c: false },
      ],
      explanation: 'Aktionäre haben: 1. Anrecht auf Dividende, 2. Kursgewinnpotenzial, 3. Stimmrecht an der Generalversammlung.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist eine Obligation?',
      opts: [
        { t: 'Ein Beteiligungstitel, der Miteigentum an einem Unternehmen verbrieft', c: false },
        { t: 'Ein Fremdkapitaltitel: der Anleger leiht dem Schuldner Geld gegen Zins und Rückzahlung', c: true },
        { t: 'Ein Derivat zur Absicherung von Währungsrisiken', c: false },
        { t: 'Eine staatliche Förderanleihe ohne Zinszahlung', c: false },
      ],
      explanation: 'Obligation = Fremdkapitaltitel (Schuldverschreibung). Der Anleger leiht dem Emittenten Geld. Dafür erhält er regelmässige Couponzahlungen und am Ende die Rückzahlung des Nennwerts.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Coupon einer Obligation?',
      opts: [
        { t: 'Der Kurs der Obligation an der Börse', c: false },
        { t: 'Die jährliche Zinszahlung (Nennwert × Couponzins)', c: true },
        { t: 'Der Rückzahlungsbetrag am Ende der Laufzeit', c: false },
        { t: 'Die Gebühr für den Kauf der Obligation', c: false },
      ],
      explanation: 'Coupon = jährliche Zinszahlung der Obligation. Nennwert CHF 10\'000, Coupon 3% → jährliche Zahlung CHF 300. Der Coupon ist fix und bleibt über die gesamte Laufzeit gleich.',
      difficulty: 'easy',
    },
    {
      q: 'Was passiert mit einer bestehenden Obligation (Coupon 2%), wenn neue Obligationen am Markt 4% bieten?',
      opts: [
        { t: 'Ihr Kurs steigt, da sie attraktiver wird', c: false },
        { t: 'Ihr Kurs fällt, da sie weniger attraktiv ist als neue 4%-Obligationen', c: true },
        { t: 'Ihr Coupon wird auf 4% angepasst', c: false },
        { t: 'Sie wird sofort zurückgezahlt', c: false },
      ],
      explanation: 'Wenn neue Obligationen mehr Zins bieten, werden bestehende mit tieferem Coupon unattraktiver → ihr Kurs fällt. Käufer zahlen weniger, bis die Gesamtrendite dem Marktzins entspricht.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Fair Value einer Obligation?',
      opts: [
        { t: 'Immer der Nennwert (pari = 100%)', c: false },
        { t: 'Der Barwert (PV) aller zukünftigen Zahlungen (Coupons + Rückzahlung), diskontiert mit dem Marktzins', c: true },
        { t: 'Der Kurs an der Börse multipliziert mit dem Nennwert', c: false },
        { t: 'Der Coupon multipliziert mit der Laufzeit', c: false },
      ],
      explanation: 'Fair Value Obligation = PV aller zukünftigen Cash-Flows (Coupons + Rückzahlung), diskontiert mit dem aktuellen Marktzins. Ist der Coupon > Marktzins, ist der FV über pari (>100%).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist YTM (Yield to Maturity)?',
      opts: [
        { t: 'Der Couponzins der Obligation', c: false },
        { t: 'Die Gesamtrendite einer Obligation, wenn sie bis zur Fälligkeit gehalten wird', c: true },
        { t: 'Der aktuelle Börsenkurs der Obligation', c: false },
        { t: 'Die Differenz zwischen Kurs und Nennwert', c: false },
      ],
      explanation: 'YTM (Yield to Maturity / Rendite auf Verfall): Die interne Rendite der Obligation unter der Annahme, dass alle Zahlungen bis Fälligkeit erhalten werden. Berücksichtigt Coupon + Kurs-Nennwert-Differenz.',
      difficulty: 'hard',
    },
    {
      q: 'Eine Obligation hat einen Nennwert von CHF 1\'000, Coupon 5% und 2 Jahre Restlaufzeit. Der Marktzins beträgt 3%. Liegt der Fair Value über oder unter pari?',
      opts: [
        { t: 'Unter pari (unter 100%)', c: false },
        { t: 'Über pari (über 100%), weil der Coupon höher ist als der Marktzins', c: true },
        { t: 'Genau bei pari (100%)', c: false },
        { t: 'Das lässt sich ohne Kursdaten nicht sagen', c: false },
      ],
      explanation: 'Coupon 5% > Marktzins 3% → Obligation zahlt mehr als neue Bonds → höhere Nachfrage → Kurs steigt über pari. Formel: FV = 50/(1.03) + 50/(1.03)^2 + 1000/(1.03)^2 > 1000.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist das Zinsänderungsrisiko bei Obligationen?',
      opts: [
        { t: 'Das Risiko, dass der Emittent bankrott geht', c: false },
        { t: 'Das Risiko, dass steigende Marktzinsen den Kurs der bestehenden Obligation senken', c: true },
        { t: 'Das Risiko, dass die Inflation die Kaufkraft der Couponzahlungen mindert', c: false },
        { t: 'Das Risiko, dass Dividenden ausbleiben', c: false },
      ],
      explanation: 'Zinsänderungsrisiko: Bei steigenden Marktzinsen fallen die Kurse bestehender Obligationen. Wer verkaufen muss, realisiert einen Kursverlust. Bei Halten bis Fälligkeit erhält man Nennwert zurück.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist das Bonitätsrisiko (Kreditrisiko) einer Obligation?',
      opts: [
        { t: 'Das Risiko, dass der Aktienkurs fällt', c: false },
        { t: 'Das Risiko, dass der Schuldner zahlungsunfähig wird und Coupon oder Rückzahlung ausfallen', c: true },
        { t: 'Das Risiko, dass der Coupon sinkt', c: false },
        { t: 'Das Risiko, dass die Laufzeit verlängert wird', c: false },
      ],
      explanation: 'Bonitätsrisiko: Wenn der Emittent (Staat, Unternehmen) zahlungsunfähig wird, können Zinsen und/oder der Nennwert ganz oder teilweise ausfallen. Je schlechter das Rating, desto höher der Zins (Risikoprämie).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist das Dividend Discount Model (DDM)?',
      opts: [
        { t: 'Ein Modell zur Berechnung des Obligationenkurses', c: false },
        { t: 'Ein Modell zur Aktienbewertung: PV aller zukünftigen Dividenden', c: true },
        { t: 'Ein Modell zur Berechnung der optimalen Dividendenausschüttung', c: false },
        { t: 'Ein Modell zur Messung der Marktliquidität', c: false },
      ],
      explanation: 'DDM (Dividend Discount Model): Aktie = PV aller zukünftigen Dividenden. Bei konstanter Dividende D und Zinssatz i: PV = D / i (Gordon Formel). Beispiel: D=5, i=2% → PV = 250 CHF.',
      difficulty: 'hard',
    },
    {
      q: 'Eine Aktie zahlt jährlich CHF 4 Dividende (konstant). Der Zinssatz beträgt 4%. Was ist der faire Wert der Aktie gemäss DDM?',
      opts: [
        { t: 'CHF 4', c: false },
        { t: 'CHF 100', c: true },
        { t: 'CHF 16', c: false },
        { t: 'CHF 400', c: false },
      ],
      explanation: 'DDM bei konstanter Dividende: PV = D / i = 4 / 0.04 = CHF 100. Bei höherem Zinssatz würde der faire Wert sinken (z.B. i=8% → PV = 50 CHF).',
      difficulty: 'hard',
    },
    {
      q: 'Was ist der Unterschied zwischen Aktie und Obligation?',
      opts: [
        { t: 'Beide sind Fremdkapitaltitel', c: false },
        { t: 'Aktie = Beteiligungstitel (EK); Obligation = Fremdkapitaltitel (FK)', c: true },
        { t: 'Aktien haben fixe Zinsen; Obligationen haben variable Dividenden', c: false },
        { t: 'Obligationen berechtigen zur Teilnahme an der Generalversammlung', c: false },
      ],
      explanation: 'Aktie = EK-Titel: Aktionär ist Miteigentümer, erhält Dividende und hat Stimmrecht. Obligation = FK-Titel: Anleger ist Gläubiger, erhält fixen Coupon und Rückzahlung – kein Mitspracherecht.',
      difficulty: 'easy',
    },
    {
      q: 'Was besagt ein niedriges P/E Ratio (KGV)?',
      opts: [
        { t: 'Die Aktie ist teuer und sollte verkauft werden', c: false },
        { t: 'Die Aktie könnte möglicherweise unterbewertet sein (immer im Vergleich mit ähnlichen Aktien)', c: true },
        { t: 'Das Unternehmen macht keinen Gewinn', c: false },
        { t: 'Die Dividende ist sehr hoch', c: false },
      ],
      explanation: 'Niedriges P/E: Man zahlt wenig pro Einheit Gewinn → möglicherweise günstig bewertet. Wichtig: immer im Branchenvergleich. Ein KGV von 8 kann in einer Branche normal sein, in einer anderen tief.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Primärmarkt an der Börse?',
      opts: [
        { t: 'Handel zwischen Anlegern mit bereits emittierten Wertpapieren', c: false },
        { t: 'Erstausgabe von Wertpapieren – hier fliesst Kapital direkt an den Emittenten', c: true },
        { t: 'Markt für besonders grosse Transaktionen', c: false },
        { t: 'Markt, der nur für institutionelle Anleger zugänglich ist', c: false },
      ],
      explanation: 'Primärmarkt = Erstausgabe (IPO): Das Unternehmen gibt neue Aktien oder Obligationen aus und erhält das Kapital direkt. Sekundärmarkt = späterer Handel zwischen Anlegern (Unternehmen erhält kein neues Geld).',
      difficulty: 'medium',
    },
    {
      q: 'Was versteht man unter Diversifikation bei der Kapitalanlage?',
      opts: [
        { t: 'Alles Geld in die renditestärkste Anlage investieren', c: false },
        { t: 'Verteilung des Vermögens auf verschiedene Anlagen zur Risikostreuung', c: true },
        { t: 'Nur in Obligationen investieren, weil diese sicherer sind', c: false },
        { t: 'Regelmässige Umschichtung des Portfolios', c: false },
      ],
      explanation: 'Diversifikation = Risikostreuung: Nicht alles in eine Anlage investieren. Einzelrisiken können gesenkt werden. Das allgemeine Marktrisiko (systematisches Risiko) lässt sich aber nicht vollständig eliminieren.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Unterschied zwischen Risikofähigkeit und Risikotoleranz?',
      opts: [
        { t: 'Sie sind dasselbe – nur verschiedene Bezeichnungen', c: false },
        { t: 'Risikofähigkeit = finanziell tragbares Risiko; Risikotoleranz = psychologisch gewolltes Risiko', c: true },
        { t: 'Risikotoleranz ist immer höher als Risikofähigkeit', c: false },
        { t: 'Risikofähigkeit gilt nur für professionelle Anleger', c: false },
      ],
      explanation: 'Risikofähigkeit: Wie viel Verlust kann man sich finanziell leisten (Einkommen, Vermögen, Zeithorizont)? Risikotoleranz: Wie viel Kursschwankung hält man psychologisch aus? Eine gute Anlage muss zu beiden passen.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind typische Risiken bei der Anlage in Aktien?',
      opts: [
        { t: 'Zinsänderungsrisiko und Inflationsrisiko', c: false },
        { t: 'Kursrisiko und Unternehmensrisiko (Insolvenz)', c: true },
        { t: 'Bonitätsrisiko und Rückzahlungsrisiko', c: false },
        { t: 'Wechselkursrisiko und Liquiditätsrisiko', c: false },
      ],
      explanation: 'Aktienrisiken: Kursrisiko (Kurse können stark schwanken) und Unternehmensrisiko (Konkurs → Totalverlust möglich). Obligationen haben hauptsächlich Zinsänderungs- und Bonitätsrisiko.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Fristentransformation einer Bank?',
      opts: [
        { t: 'Die Bank wechselt Fremdwährungen in CHF um', c: false },
        { t: 'Die Bank nimmt kurzfristige Einlagen entgegen und vergibt langfristige Kredite', c: true },
        { t: 'Die Bank verlängert die Kreditlaufzeit auf Wunsch des Kunden', c: false },
        { t: 'Die Bank konvertiert Obligationen in Aktien', c: false },
      ],
      explanation: 'Fristentransformation: Sparer legen kurzfristig an (Sparkonto), Kreditnehmer brauchen langfristiges Geld (Hypothek). Die Bank überbrückt diese Fristdifferenz und trägt das Liquiditätsrisiko.',
      difficulty: 'hard',
    },
    {
      q: 'Welche Anlageform bietet typischerweise die höchste Sicherheit bei tiefer Rendite?',
      opts: [
        { t: 'Aktien von Jungunternehmen (Start-ups)', c: false },
        { t: 'Sparkonto oder Kassenobligationen', c: true },
        { t: 'Hochzinsanleihen (Junk Bonds)', c: false },
        { t: 'Rohstoffe und Edelmetalle', c: false },
      ],
      explanation: 'Sparkonto/Kassenobligationen: hohe Sicherheit, gute Liquidität (Sparkonto), aber tiefe Rendite. Das magische Dreieck der Geldanlage: Rendite – Sicherheit – Liquidität können nicht alle gleichzeitig maximal sein.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist das Magische Dreieck der Kapitalanlage?',
      opts: [
        { t: 'Aktien, Obligationen, Immobilien', c: false },
        { t: 'Rendite, Sicherheit und Liquidität – die drei Anlageziele stehen in Zielkonflikt', c: true },
        { t: 'Kurzfrist-, Mittelfrist- und Langfristanlage', c: false },
        { t: 'Risikofähigkeit, Risikotoleranz und Anlageziel', c: false },
      ],
      explanation: 'Magisches Dreieck: Rendite, Sicherheit, Liquidität. Man kann nicht alle drei gleichzeitig maximieren. Hohe Rendite geht oft mit höherem Risiko (tiefere Sicherheit) einher. Hohe Liquidität oft mit tieferer Rendite.',
      difficulty: 'easy',
    },
    {
      q: 'Was passiert mit einer Obligation bei Fälligkeit (am Ende der Laufzeit)?',
      opts: [
        { t: 'Der Coupon wird verdoppelt ausgezahlt', c: false },
        { t: 'Der Emittent zahlt den Nennwert (Rückzahlungsbetrag) zurück', c: true },
        { t: 'Die Obligation wird automatisch in Aktien umgewandelt', c: false },
        { t: 'Der letzte Coupon entfällt', c: false },
      ],
      explanation: 'Bei Fälligkeit: Letzter Coupon + Rückzahlung des Nennwerts (typisch 100%). War der Kurs unter pari, profitiert der Anleger von der Differenz. War er über pari, verliert er bei Rückzahlung.',
      difficulty: 'easy',
    },
    {
      q: 'Wer ist Emittent einer Staatsobligation?',
      opts: [
        { t: 'Eine private Grossbank', c: false },
        { t: 'Der Staat (Bund, Kanton oder Gemeinde)', c: true },
        { t: 'Die Nationalbank', c: false },
        { t: 'Ein internationaler Fonds', c: false },
      ],
      explanation: 'Staatsobligation = der Staat leiht sich Geld von Anlegern. Gilt als sehr sicher (tiefes Bonitätsrisiko bei stabilen Staaten wie der Schweiz). Deshalb oft tiefer Zins. Unternehmensanleihen zahlen mehr Zins (höheres Risiko).',
      difficulty: 'easy',
    },
    {
      q: 'Was bedeutet ESG bei der Kapitalanlage?',
      opts: [
        { t: 'Eine Abkürzung für eine Börsenhandelsstrategie', c: false },
        { t: 'Environment, Social, Governance – Berücksichtigung von Umwelt, Sozialem und Unternehmensführung', c: true },
        { t: 'Eine spezielle Depotgebühr bei Banken', c: false },
        { t: 'Eine staatliche Anlagevorschrift für Pensionskassen', c: false },
      ],
      explanation: 'ESG (Nachhaltigkeit): Environment = Umweltaspekte, Social = soziale Verantwortung, Governance = gute Unternehmensführung. Immer wichtigeres Kriterium bei Anlageentscheiden neben Rendite, Risiko und Liquidität.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die erwartete Portfoliorendite eines Portfolios aus 60% Aktien (Rendite 8%) und 40% Obligationen (Rendite 3%)?',
      opts: [
        { t: '5.5%', c: false },
        { t: '6%', c: true },
        { t: '5%', c: false },
        { t: '11%', c: false },
      ],
      explanation: 'Erwartete Portfoliorendite = gewichteter Durchschnitt: 0.6 × 8% + 0.4 × 3% = 4.8% + 1.2% = 6%. Die Portfoliorendite liegt zwischen den Einzelrenditen, gewichtet nach Anteil.',
      difficulty: 'hard',
    },
  ])

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 4: VERSICHERUNGEN (AP)
  // Stadlin/Riemek/König, Kapitel 9
  // ─────────────────────────────────────────
  const tVersicherungen = await prisma.topic.create({
    data: {
      slug: 'versicherungen',
      title: 'Versicherungen',
      description: 'Sozialversicherungen, 3-Säulen-Prinzip, Privatversicherungen – AP',
      icon: 'Shield',
      color: 'teal',
      examType: 'abschluss',
      category: 'bwl',
      order: 4,
    },
  })

  const chVersicherungen = await prisma.chapter.create({
    data: {
      slug: 'versicherungsarten',
      title: 'Versicherungsarten & 3-Säulen-Prinzip',
      subtitle: 'Sozialversicherungen, Privatversicherungen und Vorsorge',
      topicId: tVersicherungen.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 4. Versicherungen

## 4.1 Grundidee des Versicherungsprinzips

Versicherungen schützen vor finanziellen Folgen zufälliger Schäden.

Darum schliessen viele Personen einen Vertrag mit einem Versicherer ab.
Alle zahlen Prämien. Wer vom versicherten Schadenfall betroffen ist, erhält Leistungen.

## 4.2 Der Zufall als Voraussetzung

Versichert wird nur ein **zufälliges** Ereignis:
- ungewiss, ungewollt, bei Vertragsabschluss noch nicht eingetreten, nicht absichtlich herbeigeführt.

## 4.3 Das Versicherungsprinzip als Gefahrengemeinschaft

Viele mit ähnlichen Risiken bilden eine Gemeinschaft. Nur wenige erleiden tatsächlich einen Schaden. Die Schäden der Betroffenen werden aus den Prämien vieler finanziert.

## 4.4 Risk Management

1. Risiko erkennen
2. Risiko bewerten
3. Risiko vermeiden
4. Risiko vermindern
5. Risiko überwälzen (versichern)
6. Risiko überwachen

## 4.5 Zentrale Begriffe

### Prämie
Preis der Versicherung.

### Franchise
Fixer Betrag, den die versicherte Person im Schadenfall selbst trägt, bevor die Versicherung zahlt.

### Selbstbehalt
Zusätzlicher prozentualer Anteil, den der Versicherte nach der Franchise selbst übernimmt.

### Leistungskürzung
Die Versicherung kann Leistungen kürzen bei grober Fahrlässigkeit oder nicht erfüllten Voraussetzungen.

## 4.6 Schadenarten

### Personenschäden
Krankheit, Unfall, Invalidität, Tod, Arbeitslosigkeit.

### Sachschäden
Beschädigung oder Zerstörung von Sachen.

## 4.7 Personenversicherungen

**Direkte finanzielle Schäden:** Behandlungskosten, Heilungskosten.
**Indirekte finanzielle Schäden:** Erwerbsausfall, Einkommensausfall, langfristige Vorsorgeprobleme.

Beispiele: Krankenversicherung, Unfallversicherung, Lebensversicherung.

## 4.8 Vorsorge und 3-Säulen-System

### 1. Säule: staatliche Vorsorge
- AHV / IV / EO
- Existenzsicherung, obligatorisch, Umlageverfahren

### 2. Säule: berufliche Vorsorge
- Pensionskasse / BVG
- Fortsetzung des gewohnten Lebensstandards
- Kapitaldeckungsverfahren

### 3. Säule: private Vorsorge
- 3a gebunden (steuerlich begünstigt)
- 3b frei
- freiwillig

## 4.9 Krankenversicherung

### Grundversicherung
- obligatorisch, gesetzlich definierter Leistungskatalog
- Kostenbeteiligung via Franchise und Selbstbehalt

### Zusatzversicherung
- freiwillig, bessere Leistungen oder Komfort

## 4.10 Unfallversicherung (UVG)

- Berufsunfall: Prämie trägt Arbeitgeber
- Nichtberufsunfall: Prämie trägt Arbeitnehmer

## 4.11 Umlageverfahren vs. Kapitaldeckungsverfahren

**Umlageverfahren (AHV):** Heutige Beitragszahler finanzieren heutige Rentner.
**Kapitaldeckungsverfahren (PK/BVG):** Jede Person spart eigenes Kapital an.`,
      learningGoals: {
        create: [
          { text: 'Das 3-Säulen-Prinzip der Schweizer Vorsorge erklären', order: 1 },
          { text: 'Wichtige Sozialversicherungen (AHV, IV, ALV, UVG, KVG) benennen', order: 2 },
          { text: 'Sozialversicherungen und Privatversicherungen unterscheiden', order: 3 },
          { text: 'Prämie, Selbstbehalt und Versicherungssumme erklären', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: '1. Säule (AHV/IV)', definition: 'Staatliche Alters-, Hinterlassenen- und Invalidenversicherung – obligatorisch, solidarisch', order: 1 },
          { term: '2. Säule (BVG)', definition: 'Berufliche Vorsorge (Pensionskasse) – obligatorisch ab CHF 22\'050 Jahreslohn', order: 2 },
          { term: '3. Säule (3a/3b)', definition: 'Private Vorsorge – freiwillig, steuerlich begünstigt (3a) oder frei (3b)', order: 3 },
          { term: 'ALV', definition: 'Arbeitslosenversicherung – zahlt max. 80% des versicherten Lohns bei Erwerbslosigkeit', order: 4 },
          { term: 'UVG', definition: 'Unfallversicherungsgesetz – Berufsunfall obligatorisch durch AG; Nichtberufsunfall durch AN', order: 5 },
          { term: 'KVG', definition: 'Krankenversicherungsgesetz – Grundversicherung obligatorisch für alle Personen in der Schweiz', order: 6 },
          { term: 'Prämie', definition: 'Regelmässige Zahlung des Versicherungsnehmers an die Versicherung', order: 7 },
          { term: 'Selbstbehalt (Franchise)', definition: 'Anteil des Schadens, den der Versicherungsnehmer selbst trägt', order: 8 },
          { term: 'Solidaritätsprinzip', definition: 'Alle zahlen ein, Leistungen gehen an Bedürftige (unabhängig vom individuellen Risiko)', order: 9 },
        ],
      },
      corePoints: {
        create: [
          { text: '1. Säule: AHV-Rente sichert Existenzminimum – finanziert durch Umlageverfahren', order: 1 },
          { text: '2. Säule: Pensionskasse sichert gewohnten Lebensstandard – Kapitaldeckungsverfahren', order: 2 },
          { text: '3. Säule: freiwillige Ergänzung – 3a steuerlich begünstigt, gebunden; 3b frei verfügbar', order: 3 },
          { text: 'UVG: Berufsunfall = AG zahlt Prämie; Nichtberufsunfall = AN zahlt Prämie', order: 4 },
          { text: 'KVG: Grundversicherung obligatorisch; Zusatzversicherung freiwillig', order: 5 },
          { text: 'Privatversicherungen: Haftpflicht, Hausrat, Fahrzeug, Lebensversicherung', order: 6 },
        ],
      },
      examples: {
        create: [
          { text: '1. Säule: Rentnerpaar erhält AHV-Rente als Grundabsicherung im Alter', order: 1 },
          { text: '2. Säule: Arbeitnehmerin zahlt monatlich in Pensionskasse ein, Arbeitgeber zahlt mindestens gleich viel dazu', order: 2 },
          { text: '3a: Max. CHF 7\'258 (2026) jährlich einzahlen → Steuerersparnis', order: 3 },
        ],
      },
    },
  })

  await createQuiz(chVersicherungen.id, [
    {
      q: 'Was ist die 1. Säule des Schweizer Vorsorgesystems?',
      opts: [
        { t: 'Die Pensionskasse (BVG)', c: false },
        { t: 'Die staatliche AHV/IV-Versicherung', c: true },
        { t: 'Die private 3. Säule (3a)', c: false },
        { t: 'Die Krankenversicherung (KVG)', c: false },
      ],
      explanation: '1. Säule = AHV (Alters- und Hinterlassenenversicherung) und IV (Invalidenversicherung). Obligatorisch für alle, solidarisch finanziert, sichert Existenzminimum.',
      difficulty: 'easy',
    },
    {
      q: 'Wer zahlt die Prämie für den Nichtberufsunfall (UVG)?',
      opts: [
        { t: 'Der Arbeitgeber', c: false },
        { t: 'Der Arbeitnehmer', c: true },
        { t: 'Der Staat', c: false },
        { t: 'Die Pensionskasse', c: false },
      ],
      explanation: 'UVG: Berufsunfallversicherung zahlt der Arbeitgeber. Nichtberufsunfallversicherung (Freizeitunfälle) zahlt der Arbeitnehmer.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Vorteil der Säule 3a gegenüber 3b?',
      opts: [
        { t: '3a ist vollständig staatlich subventioniert', c: false },
        { t: '3a-Einzahlungen können vom steuerbaren Einkommen abgezogen werden', c: true },
        { t: '3a hat keine Bezugsbeschränkungen', c: false },
        { t: '3a ist für Selbstständige nicht zugänglich', c: false },
      ],
      explanation: '3. Säule 3a (gebundene Vorsorge): Einzahlungen bis zum Maximalbetrag (ca. CHF 7\'258) sind steuerlich abzugsfähig. Dafür ist das Kapital bis zur Pensionierung gebunden.',
      difficulty: 'medium',
    },
    {
      q: 'Was versteht man unter dem Solidaritätsprinzip bei Sozialversicherungen?',
      opts: [
        { t: 'Jeder zahlt genau so viel, wie er voraussichtlich beziehen wird', c: false },
        { t: 'Alle zahlen Beiträge, aber Leistungen gehen an jene, die sie brauchen – unabhängig vom individuellen Risiko', c: true },
        { t: 'Nur Personen mit hohem Einkommen zahlen Beiträge', c: false },
        { t: 'Jeder kann selbst wählen, wie viel er einzahlt', c: false },
      ],
      explanation: 'Solidaritätsprinzip: Jung finanziert Alt (AHV), Gesunde finanzieren Kranke (KVG). Im Gegensatz zur Privatversicherung richtet sich die Prämie nicht nach dem individuellen Risiko des Einzelnen.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist das Umlageverfahren der AHV?',
      opts: [
        { t: 'Jeder spart sein eigenes Kapital an, das später seine Rente finanziert', c: false },
        { t: 'Die heutigen Beiträge der Erwerbstätigen finanzieren die heutigen Renten der Pensionierten', c: true },
        { t: 'Der Staat finanziert alle AHV-Renten aus allgemeinen Steuermitteln', c: false },
        { t: 'AHV-Kapital wird an der Börse angelegt und verzinst', c: false },
      ],
      explanation: 'Umlageverfahren: Heutige Arbeitnehmer zahlen Beiträge → diese Beiträge gehen direkt an heutige Rentner. Demografisches Problem: Weniger Junge müssen mehr Alte finanzieren. Gegenteil: Kapitaldeckungsverfahren (Pensionskasse).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Franchise und Selbstbehalt in der Krankenversicherung?',
      opts: [
        { t: 'Sie sind dasselbe – nur verschiedene Bezeichnungen', c: false },
        { t: 'Franchise = fixer Betrag, den man selbst zahlt; Selbstbehalt = prozentualer Anteil nach der Franchise', c: true },
        { t: 'Franchise zahlt die Krankenkasse, Selbstbehalt der Versicherte', c: false },
        { t: 'Franchise gilt nur im Ausland', c: false },
      ],
      explanation: 'Franchise: Fixer Jahresbetrag (z.B. CHF 300–2500), den der Versicherte selbst zahlt. Selbstbehalt: 10% der Kosten über der Franchise (max. CHF 700 pro Jahr). Höhere Franchise = tiefere Prämie.',
      difficulty: 'medium',
    },
    {
      q: 'Ab welchem Jahreseinkommen ist die 2. Säule (BVG) obligatorisch?',
      opts: [
        { t: 'Ab CHF 10\'000', c: false },
        { t: 'Ab CHF 22\'050', c: true },
        { t: 'Ab CHF 50\'000', c: false },
        { t: 'Für alle Angestellten ohne Einkommensgrenze', c: false },
      ],
      explanation: '2. Säule (BVG): Obligatorisch für Angestellte ab einem Jahreslohn von CHF 22\'050 (Eintrittsschwelle 2026). Arbeitgeber und Arbeitnehmer teilen die Prämie mindestens hälftig.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist das Kapitaldeckungsverfahren der Pensionskasse?',
      opts: [
        { t: 'Die heutigen Beiträge finanzieren die heutigen Rentner', c: false },
        { t: 'Jede Person spart ihr eigenes Altersguthaben an, das später ihre Rente finanziert', c: true },
        { t: 'Der Staat garantiert alle Pensionskassenleistungen', c: false },
        { t: 'Das Guthaben wird nach der Pensionierung verpfändet', c: false },
      ],
      explanation: 'Kapitaldeckungsverfahren (BVG): Jeder Arbeitnehmer spart ein individuelles Altersguthaben an. Dieses Kapital wird angelegt und verzinst. Vorteil: Demografieunabhängiger als Umlageverfahren. Nachteil: Anlagerisiko.',
      difficulty: 'medium',
    },
    {
      q: 'Welche der folgenden Versicherungen ist für alle Personen in der Schweiz obligatorisch?',
      opts: [
        { t: 'Die Lebensversicherung', c: false },
        { t: 'Die Krankengrundversicherung (KVG)', c: true },
        { t: 'Die Haftpflichtversicherung', c: false },
        { t: 'Die Hausratversicherung', c: false },
      ],
      explanation: 'KVG-Grundversicherung ist für alle Personen mit Wohnsitz in der Schweiz obligatorisch – unabhängig von Nationalität, Alter oder Einkommen. Prämie ist kantonal und altersabhängig.',
      difficulty: 'easy',
    },
    {
      q: 'Was sichert die 1. Säule (AHV) im Alter?',
      opts: [
        { t: 'Den gewohnten Lebensstandard vollständig', c: false },
        { t: 'Das Existenzminimum', c: true },
        { t: 'Nur die Krankheitskosten', c: false },
        { t: 'Die gesamte berufliche Invaliditätsabsicherung', c: false },
      ],
      explanation: '1. Säule (AHV): Sichert das Existenzminimum im Alter, bei Invalidität und für Hinterlassene. Die 2. Säule (PK) soll zusammen mit der 1. Säule den gewohnten Lebensstandard sichern.',
      difficulty: 'easy',
    },
    {
      q: 'Was versteht man unter einem versicherten Risiko?',
      opts: [
        { t: 'Ein Risiko, das man absichtlich herbeiführen kann', c: false },
        { t: 'Ein zufälliges, ungewisses Ereignis, das bei Vertragsabschluss noch nicht eingetreten ist', c: true },
        { t: 'Ein Risiko, das die Versicherung selbst trägt', c: false },
        { t: 'Ein Risiko, das immer zum Schaden führt', c: false },
      ],
      explanation: 'Versichertes Risiko: muss zufällig, ungewiss, ungewollt und bei Vertragsabschluss noch nicht eingetreten sein. Absichtlich herbeigeführte Schäden werden nicht versichert.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist die Arbeitslosenversicherung (ALV)?',
      opts: [
        { t: 'Eine private Zusatzversicherung gegen Jobverlust', c: false },
        { t: 'Eine obligatorische Sozialversicherung, die bei unverschuldeter Arbeitslosigkeit max. 80% des versicherten Lohns zahlt', c: true },
        { t: 'Eine staatliche Sozialhilfe für Bedürftige', c: false },
        { t: 'Eine Versicherung, die nur für KMU-Angestellte gilt', c: false },
      ],
      explanation: 'ALV = obligatorische Sozialversicherung: Bei unverschuldeter Arbeitslosigkeit werden max. 80% des versicherten Lohns für eine begrenzte Dauer ausbezahlt. Beiträge zahlen AG und AN je zur Hälfte.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist eine Haftpflichtversicherung?',
      opts: [
        { t: 'Eine Versicherung gegen Diebstahl an Eigentum', c: false },
        { t: 'Eine Versicherung, die Schäden abdeckt, die man anderen Personen oder deren Sachen zufügt', c: true },
        { t: 'Eine Versicherung gegen eigene Verletzungen', c: false },
        { t: 'Eine Versicherung für den Todesfall', c: false },
      ],
      explanation: 'Haftpflichtversicherung: Deckt Schäden, die man Dritten verursacht (Personen- und Sachschäden). Privathaftpflicht ist sehr empfehlenswert – ohne sie müssen Schäden aus dem eigenen Vermögen bezahlt werden.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Unterschied zwischen Personenschaden und Sachschaden?',
      opts: [
        { t: 'Personenschaden ist teurer, Sachschaden ist günstiger', c: false },
        { t: 'Personenschaden = Schaden an Leib/Leben/Gesundheit; Sachschaden = Beschädigung oder Zerstörung von Sachen', c: true },
        { t: 'Sachschäden werden immer von der Haftpflicht gedeckt', c: false },
        { t: 'Personenschäden werden nur von der AHV gedeckt', c: false },
      ],
      explanation: 'Personenschaden: Krankheit, Unfall, Invalidität, Tod. Sachschaden: Beschädigung/Zerstörung von Gegenständen. Beide Schadensarten können von verschiedenen Versicherungen abgedeckt werden.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist Risk Management im Zusammenhang mit Versicherungen?',
      opts: [
        { t: 'Alle Risiken versichern', c: false },
        { t: 'Systematischer Umgang mit Risiken: erkennen, bewerten, vermeiden, vermindern, überwälzen, überwachen', c: true },
        { t: 'Risiken verstecken, damit die Versicherungsprämie sinkt', c: false },
        { t: 'Nur grosse Risiken versichern, kleine ignorieren', c: false },
      ],
      explanation: 'Risk Management: 1. Erkennen, 2. Bewerten, 3. Vermeiden (z.B. Velo nicht liegen lassen), 4. Vermindern (Helm tragen), 5. Überwälzen (versichern), 6. Überwachen. Versicherung ist nur eine von mehreren Massnahmen.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist eine Prämie in der Versicherung?',
      opts: [
        { t: 'Ein Bonus bei Schadensfreiheit', c: false },
        { t: 'Der regelmässige Beitrag, den der Versicherungsnehmer an die Versicherung zahlt', c: true },
        { t: 'Der Betrag, den die Versicherung im Schadensfall zahlt', c: false },
        { t: 'Die Provision des Versicherungsberaters', c: false },
      ],
      explanation: 'Prämie = Preis der Versicherung. Der Versicherte zahlt regelmässig (monatlich oder jährlich) die Prämie. Im Gegenzug übernimmt die Versicherung definierte Risiken. Höheres Risiko → höhere Prämie.',
      difficulty: 'easy',
    },
    {
      q: 'Wer trägt beim UVG die Prämie für die Berufsunfallversicherung?',
      opts: [
        { t: 'Der Arbeitnehmer', c: false },
        { t: 'Der Arbeitgeber', c: true },
        { t: 'Hälftig AG und AN', c: false },
        { t: 'Der Staat', c: false },
      ],
      explanation: 'UVG: Berufsunfall (Unfall bei der Arbeit) → Prämie zahlt Arbeitgeber. Nichtberufsunfall (Freizeit) → Prämie zahlt Arbeitnehmer. Arbeitnehmer mit weniger als 8h/Woche beim gleichen AG sind für NBU nicht obligatorisch versichert.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist eine Gefahrengemeinschaft im Versicherungswesen?',
      opts: [
        { t: 'Eine Gruppe von Personen, die alle denselben Beruf ausüben', c: false },
        { t: 'Viele Personen mit ähnlichen Risiken, die gemeinsam Schäden der Betroffenen aus den Prämien aller finanzieren', c: true },
        { t: 'Eine staatliche Haftungsgemeinschaft', c: false },
        { t: 'Eine Versicherung für besonders gefährliche Berufe', c: false },
      ],
      explanation: 'Gefahrengemeinschaft: Das Grundprinzip der Versicherung. Viele zahlen Prämien, nur wenige erleiden Schäden. Die Schäden der Betroffenen werden aus den Prämien der Gemeinschaft gedeckt.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Vorteil einer höheren Franchise in der Krankenversicherung?',
      opts: [
        { t: 'Man erhält höhere Leistungen im Schadensfall', c: false },
        { t: 'Die monatliche Prämie ist tiefer', c: true },
        { t: 'Man muss weniger Selbstbehalt zahlen', c: false },
        { t: 'Der Versicherungsschutz ist umfassender', c: false },
      ],
      explanation: 'Höhere Franchise (z.B. CHF 2\'500 statt CHF 300) → tiefere monatliche Prämie. Man trägt selbst mehr Risiko (zahlt mehr, bis die Versicherung zahlt). Sinnvoll für gesunde Personen, die selten Arzt brauchen.',
      difficulty: 'easy',
    },
    {
      q: 'Was sind direkte und indirekte finanzielle Schäden bei Personenversicherungen?',
      opts: [
        { t: 'Direkt = Sachschaden, indirekt = Personenschaden', c: false },
        { t: 'Direkt = Behandlungs-/Heilungskosten; indirekt = Erwerbsausfall und Einkommensverlust', c: true },
        { t: 'Direkt = kurzfristiger Schaden, indirekt = langfristiger Schaden', c: false },
        { t: 'Direkte Schäden zahlt der Staat, indirekte die Versicherung', c: false },
      ],
      explanation: 'Direkte finanzielle Schäden: Behandlungskosten, Heilungskosten. Indirekte: Erwerbsausfall (man kann nicht arbeiten), Einkommensausfall, langfristige Vorsorgeprobleme. Beides ist versicherbar.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist eine Zusatzversicherung in der Krankenversicherung?',
      opts: [
        { t: 'Die obligatorische Grundversicherung für alle', c: false },
        { t: 'Eine freiwillige Versicherung für bessere Leistungen oder Komfort über die Grundversicherung hinaus', c: true },
        { t: 'Eine staatlich subventionierte Prämienverbilligung', c: false },
        { t: 'Eine Versicherung, die die Franchise übernimmt', c: false },
      ],
      explanation: 'Zusatzversicherung: freiwillig, auf privatrechtlicher Basis. Beispiele: private Abteilung im Spital, Wahlarztsystem, alternative Medizin. Annahme kann abgelehnt werden (Risikoprüfung).',
      difficulty: 'easy',
    },
    {
      q: 'Warum kann ein Versicherungsunternehmen Gewinn erzielen?',
      opts: [
        { t: 'Weil die meisten Versicherten nie einen Schaden melden', c: false },
        { t: 'Weil die Prämien so kalkuliert werden, dass sie Schäden, Verwaltungskosten und Gewinn decken', c: true },
        { t: 'Weil der Staat alle grossen Schäden übernimmt', c: false },
        { t: 'Weil Versicherungen Monopole sind', c: false },
      ],
      explanation: 'Versicherungen rechnen mit Wahrscheinlichkeiten und Erwartungswerten. Die Prämien werden so festgelegt, dass im Durchschnitt Schäden, Verwaltungskosten und ein Gewinnzuschlag gedeckt sind.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Erwerbsersatzordnung (EO)?',
      opts: [
        { t: 'Eine Versicherung gegen Arbeitslosigkeit', c: false },
        { t: 'Eine Sozialversicherung zur 1. Säule, die Erwerbsausfall bei Militärdienst, Mutterschaft und Vaterschschaft deckt', c: true },
        { t: 'Eine Pensionskassenleistung bei Invalidität', c: false },
        { t: 'Eine private Zusatzversicherung bei Erwerbsunfähigkeit', c: false },
      ],
      explanation: 'EO (Erwerbsersatzordnung): Teil der 1. Säule (wie AHV/IV). Deckt Erwerbsausfall bei Militär-/Zivildienst, Mutterschaft (14 Wochen) und Vaterschaft (2 Wochen). Finanziert durch Lohnbeiträge.',
      difficulty: 'hard',
    },
    {
      q: 'Welche Versicherung deckt Schäden an der eigenen Wohnung und am eigenen Hausrat ab?',
      opts: [
        { t: 'Haftpflichtversicherung', c: false },
        { t: 'Hausratversicherung', c: true },
        { t: 'Unfallversicherung', c: false },
        { t: 'Krankenversicherung', c: false },
      ],
      explanation: 'Hausratversicherung: Deckt Schäden am eigenen Mobiliar und Hausrat (Diebstahl, Feuer, Wasser). Gebäudeversicherung deckt das Gebäude selbst. Haftpflicht deckt Schäden, die man anderen zufügt.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist das Ziel des Schweizer 3-Säulen-Systems insgesamt?',
      opts: [
        { t: 'Den Staat von allen Sozialausgaben zu entlasten', c: false },
        { t: 'Im Alter, bei Invalidität oder Tod des Versorgers das Einkommen auf mindestens 60-70% des letzten Lohns zu sichern', c: true },
        { t: 'Alle Bürger mit dem gleichen Rentenbetrag zu versorgen', c: false },
        { t: 'Die Staatsverschuldung zu finanzieren', c: false },
      ],
      explanation: '3-Säulen-Ziel: 1. Säule sichert Existenzminimum, 2. Säule sichert zusammen mit 1. Säule den gewohnten Lebensstandard (Ziel: ~60-70% des letzten Lohns), 3. Säule ergänzt individuell.',
      difficulty: 'medium',
    },
    {
      q: 'Für wen ist die 2. Säule (BVG) nicht obligatorisch?',
      opts: [
        { t: 'Für alle Angestellten über 25 Jahre', c: false },
        { t: 'Für Selbstständigerwerbende', c: true },
        { t: 'Für Teilzeitangestellte mit mehr als 8 Stunden pro Woche', c: false },
        { t: 'Für Arbeitgeber', c: false },
      ],
      explanation: 'BVG-Pflicht gilt für unselbstständig Erwerbende ab der Eintrittsschwelle. Selbstständigerwerbende können freiwillig der BVG beitreten. Für sie ist die 3. Säule oft die wichtigste Altersvorsorge.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist eine Leistungskürzung in der Versicherung?',
      opts: [
        { t: 'Eine Senkung der Prämie bei Schadensfreiheit', c: false },
        { t: 'Die Versicherung kürzt die Leistung, wenn z.B. grobe Fahrlässigkeit vorliegt oder Voraussetzungen nicht erfüllt sind', c: true },
        { t: 'Eine automatische Anpassung der Versicherungssumme', c: false },
        { t: 'Eine Rückerstattung zu viel gezahlter Prämien', c: false },
      ],
      explanation: 'Leistungskürzung: Die Versicherung kann bei grober Fahrlässigkeit (z.B. Trunkenheit am Steuer), verspäteter Schadenmeldung oder falschen Angaben die Leistung kürzen oder verweigern.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist das Umlageverfahren bei der AHV?',
      opts: [
        { t: 'Jede Person spart ihr eigenes Kapital für die Rente an', c: false },
        { t: 'Die heutigen Beitragszahler finanzieren die heutigen Rentenleistungen', c: true },
        { t: 'Der Staat zahlt alle AHV-Renten aus dem Bundesbudget', c: false },
        { t: 'Renten werden durch Kapitalerträge finanziert', c: false },
      ],
      explanation: 'AHV-Umlageverfahren (Pay-as-you-go): Erwerbstätige zahlen heute Beiträge, die sofort an die heutigen Rentner ausgeschüttet werden. Risiko: demographischer Wandel (mehr Rentner, weniger Beitragszahler).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Franchise und Selbstbehalt in der Krankenversicherung?',
      opts: [
        { t: 'Es gibt keinen Unterschied – beides sind Synonyme', c: false },
        { t: 'Franchise = fixer Betrag pro Jahr, den man selbst trägt; Selbstbehalt = 10% der verbleibenden Kosten', c: true },
        { t: 'Selbstbehalt = fixer Betrag; Franchise = Prozentualer Anteil', c: false },
        { t: 'Franchise wird monatlich abgezogen; Selbstbehalt jährlich', c: false },
      ],
      explanation: 'In der Schweizer Krankenversicherung: Franchise = jährlicher Freibetrag (CHF 300–2\'500), den man selbst bezahlt bevor die KK zahlt. Selbstbehalt = 10% der Kosten über der Franchise, maximal CHF 700/Jahr.',
      difficulty: 'medium',
    },
    {
      q: 'Welche Aussage zum Kapitaldeckungsverfahren (Pensionskasse) ist korrekt?',
      opts: [
        { t: 'Heutige Rentner werden durch heutige Beitragszahler finanziert', c: false },
        { t: 'Jede Person spart eigenes Kapital an, das später ihre eigene Rente finanziert', c: true },
        { t: 'Der Staat garantiert alle Pensionskassenleistungen', c: false },
        { t: 'Das Kapital wird kollektiv angelegt und gleichmässig verteilt', c: false },
      ],
      explanation: 'Kapitaldeckungsverfahren (Pensionskasse): Jede Person spart individuell Kapital an. Dieses wird investiert und soll später die eigene Rente finanzieren. Vorteil: demographieresistenter. Risiko: Anlagerisiken.',
      difficulty: 'medium',
    },
    {
      q: 'Was deckt die Unfallversicherung UVG ab?',
      opts: [
        { t: 'Nur Krankheiten und chronische Leiden', c: false },
        { t: 'Berufsunfälle, Nichtberufsunfälle und Berufskrankheiten', c: true },
        { t: 'Nur Unfälle während der Arbeitszeit', c: false },
        { t: 'Alle Gesundheitsrisiken ersetzend zur KVG-Grundversicherung', c: false },
      ],
      explanation: 'UVG: Berufsunfälle (während Arbeit/Arbeitsweg), Nichtberufsunfälle (Freizeit) und Berufskrankheiten. BU-Prämie zahlt Arbeitgeber, NBU-Prämie zahlt Arbeitnehmer.',
      difficulty: 'easy',
    },
    {
      q: 'Was versteht man unter dem Solidaritätsprinzip bei Sozialversicherungen?',
      opts: [
        { t: 'Jeder zahlt genau das, was er statistisch an Leistungen erhalten wird', c: false },
        { t: 'Alle zahlen Beiträge, aber Leistungen richten sich nach dem Bedarf, nicht nach den geleisteten Beiträgen', c: true },
        { t: 'Reiche zahlen mehr, Arme zahlen weniger – die Leistungen sind für alle gleich', c: false },
        { t: 'Solidarität bedeutet, dass Freunde füreinander einspringen', c: false },
      ],
      explanation: 'Solidaritätsprinzip: Risikoausgleich zwischen Gesunden und Kranken, Jung und Alt, Gut- und Schlechtverdienenden. Beiträge nach Leistungsfähigkeit, Leistungen nach Bedarf – nicht nach individuellem Risiko.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind Privatversicherungen? Nenne ein Beispiel.',
      opts: [
        { t: 'Staatliche Pflichtversicherungen für alle Einwohner', c: false },
        { t: 'Freiwillige Versicherungen gegen individuelle Risiken, z.B. Haftpflicht oder Hausrat', c: true },
        { t: 'Nur für Selbständige zugängliche Vorsorgeprodukte', c: false },
        { t: 'Versicherungen die ausschliesslich von Privatbanken angeboten werden', c: false },
      ],
      explanation: 'Privatversicherungen sind freiwillig (ausser KVG-Grundversicherung und UVG). Beispiele: Haftpflicht, Hausrat, Fahrzeug, Rechtsschutz, Lebensversicherung, Reiseversicherung.',
      difficulty: 'easy',
    },
    {
      q: 'Was gilt für die Grundversicherung KVG?',
      opts: [
        { t: 'Freiwillig, jede Krankenkasse darf selbst wählen was sie abdeckt', c: false },
        { t: 'Obligatorisch für alle Personen in der Schweiz, gesetzlich definierter Leistungskatalog', c: true },
        { t: 'Nur für Angestellte mit mehr als 50% Pensum obligatorisch', c: false },
        { t: 'Deckt auch Zahnbehandlungen und Brillen vollständig ab', c: false },
      ],
      explanation: 'KVG-Grundversicherung: Für alle Personen in der Schweiz obligatorisch. Einheitlicher Leistungskatalog (gleich bei allen Kassen), aber freie Kassenwahl und Franchisenswahl. Zahnbehandlung und Brillen sind grundsätzlich nicht gedeckt.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist Risk Management in Bezug auf Versicherungen?',
      opts: [
        { t: 'Ausschliesslich die Auswahl der günstigsten Versicherungsprämie', c: false },
        { t: 'Systematischer Prozess: Risiken erkennen, bewerten, vermeiden, vermindern, überwälzen und überwachen', c: true },
        { t: 'Die Berechnung der erwarteten Schadenshöhe durch den Versicherer', c: false },
        { t: 'Das Prinzip, möglichst viele Versicherungen abzuschliessen', c: false },
      ],
      explanation: 'Risk Management umfasst mehr als nur Versicherung: 1. Risiko erkennen, 2. Bewerten (Wahrscheinlichkeit × Schadenshöhe), 3. Vermeiden, 4. Vermindern, 5. Überwälzen (Versicherung), 6. Selbst tragen, 7. Überwachen.',
      difficulty: 'hard',
    },
  ])

  // ═══════════════════════════════════════════════════════
  //  RECHTSLEHRE
  // ═══════════════════════════════════════════════════════

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 5: ALLG. VERTRAGSLEHRE & KAUFVERTRAG (AP / QSP)
  // Stadlin/Riemek/König, Kapitel 4.1 / 4.2 / 4.3 / 5.1 / 5.2
  // ─────────────────────────────────────────
  const tVertrag = await prisma.topic.create({
    data: {
      slug: 'vertragslehre-kaufvertrag',
      title: 'Allg. Vertragslehre & Kaufvertrag',
      description: 'Vertragsentstehung, Willensmängel, Haftung, Kaufvertrag, Mietvertrag – AP/QSP',
      icon: 'FileText',
      color: 'violet',
      examType: 'both',
      category: 'recht',
      order: 5,
    },
  })

  const chVertragsentstehung = await prisma.chapter.create({
    data: {
      slug: 'vertragsentstehung',
      title: 'Entstehung des Vertrags',
      subtitle: 'Antrag, Annahme, Formen und Voraussetzungen',
      topicId: tVertrag.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 5. Allgemeine Vertragslehre und Kaufvertrag

## 5.1 Obligation und Obligationsrecht

Eine **Obligation** ist ein rechtliches Schuldverhältnis zwischen Gläubiger und Schuldner.
Obligationen entstehen durch: Vertrag, unerlaubte Handlung, ungerechtfertigte Bereicherung.

## 5.2 Voraussetzungen für einen gültigen Vertrag

1. **Handlungsfähigkeit** (volljährig + urteilsfähig)
2. **Übereinstimmende gegenseitige Willensäusserung** (Antrag + Annahme)
3. **Formvorschriften** (Grundsatz Formfreiheit; Ausnahmen: Schriftform, öffentliche Beurkundung)
4. **Zulässiger Inhalt** (nicht unmöglich, widerrechtlich oder sittenwidrig)

## 5.3 Antrag und Annahme

- Verbindlicher Antrag: enthält wesentliche Punkte, bindet den Antragsteller
- Unverbindlicher Antrag: Schaufenster, Prospekte, Kataloge
- Verspätete Annahme: gilt als neuer Antrag

## 5.4 Vertragsmängel: nichtig oder anfechtbar

### Nichtigkeit
Schwere Mängel: Formmangel, widerrechtlicher/unmöglicher/sittenwidriger Inhalt → Vertrag von Anfang an nichtig.

### Anfechtbarkeit (Willensmängel)
- **Übervorteilung (Art. 21 OR):** Ausnutzung einer Schwächesituation
- **Wesentlicher Irrtum (Art. 23/24 OR):** unbewusste Falschvorstellung
- **Absichtliche Täuschung (Art. 28 OR):** aktives Irreführen
- **Drohung (Art. 29/30 OR):** Abschluss unter Zwang
- **Motivirrtum berechtigt NICHT zur Anfechtung**
- **Anfechtungsfrist: 1 Jahr** ab Entdeckung

## 5.5 Kaufvertrag (Art. 184 OR)

Verkäufer übergibt Sache und verschafft Eigentum; Käufer zahlt Kaufpreis.

### Eigentumsübertragung
- Fahrniskauf: Vertrag + Übergabe
- Grundstück: öffentliche Beurkundung + Grundbucheintrag

### Leistungsstörungen
- **Verzug:** Leistung nicht rechtzeitig erbracht
- **Schlechterfüllung / Mängel:** Wandelung, Minderung oder Ersatzlieferung

## 5.6 Haftung (Art. 41 OR)

**Verschuldenshaftung:** Schaden + Widerrechtlichkeit + Kausalzusammenhang + Verschulden
**Kausalhaftung:** ohne Verschulden (z.B. Werkeigentümerhaftung, Tierhalterhaftung)
**Verjährung:** 3 Jahre ab Kenntnisnahme, absolut 10 Jahre`,
      learningGoals: {
        create: [
          { text: 'Erklären, wann ein Vertrag zustande kommt', order: 1 },
          { text: 'Verbindliche und unverbindliche Angebote unterscheiden', order: 2 },
          { text: 'Handlungsfähigkeit und deren Voraussetzungen erklären', order: 3 },
          { text: 'Verschiedene Vertragsformen kennen (formfrei, schriftlich, öffentliche Beurkundung)', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Antrag (Offerte)', definition: 'Verbindliche Willenserklärung zum Vertragsabschluss (Art. 3 OR)', order: 1 },
          { term: 'Annahme', definition: 'Einverständniserklärung des Empfängers mit dem Antrag', order: 2 },
          { term: 'Handlungsfähigkeit', definition: 'Fähigkeit, Rechte und Pflichten selbst zu begründen (= Volljährigkeit + Urteilsfähigkeit)', order: 3 },
          { term: 'Volljährigkeit', definition: 'Vollendung des 18. Lebensjahres (Art. 14 ZGB)', order: 4 },
          { term: 'Urteilsfähigkeit', definition: 'Fähigkeit, vernunftgemäss zu handeln (Art. 16 ZGB)', order: 5 },
          { term: 'Treu und Glauben', definition: 'Fundamentaler Rechtsgrundsatz: fair und ehrlich handeln (Art. 2 ZGB)', order: 6 },
          { term: 'Privatautonomie', definition: 'Vertragsfreiheit: Jeder ist frei zu entscheiden, solange nicht gesetzwidrig (Art. 19 OR)', order: 7 },
          { term: 'Öffentliche Beurkundung', definition: 'Strengste Formvorschrift (Notar) – z.B. bei Grundstückskauf', order: 8 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Vertrag = Antrag + Annahme (übereinstimmende Willenserklärungen, Art. 1 OR)', order: 1 },
          { text: 'Inserate, Preisschilder, Internet-Auslagen → UNVERBINDLICH', order: 2 },
          { text: 'Verspätete Annahme → gilt als neuer Antrag', order: 3 },
          { text: 'Handlungsfähigkeit: Volljährigkeit (Art. 14) + Urteilsfähigkeit (Art. 16 ZGB)', order: 4 },
          { text: 'Formfreiheit ist Grundsatz – Ausnahmen: Schriftform, öffentliche Beurkundung', order: 5 },
          { text: 'Grundstückskauf: zwingend öffentliche Beurkundung (Notar)', order: 6 },
        ],
      },
      examples: {
        create: [
          { text: 'Supermarkt: Preisschild = unverbindlich. Vertrag kommt erst an der Kasse zustande', order: 1 },
          { text: 'Online-Bestellung: Bestellung = Antrag des Kunden; Bestätigungsmail = Annahme des Shops', order: 2 },
        ],
      },
    },
  })

  await createQuiz(chVertragsentstehung.id, [
    {
      q: 'Wann kommt ein Vertrag zustande?',
      opts: [
        { t: 'Wenn ein Angebot im Internet publiziert wird', c: false },
        { t: 'Wenn Antrag und Annahme übereinstimmen (gegenseitige Willenserklärungen)', c: true },
        { t: 'Wenn eine Rechnung ausgestellt wird', c: false },
        { t: 'Wenn eine Anzahlung geleistet wurde', c: false },
      ],
      explanation: 'Ein Vertrag kommt durch übereinstimmende gegenseitige Willenserklärungen zustande (Art. 1 OR): Antrag des einen + Annahme des anderen.',
      difficulty: 'easy',
    },
    {
      q: 'Ist ein Supermarkt-Preisschild ein verbindlicher Antrag?',
      opts: [
        { t: 'Ja, der Supermarkt ist an den Preis gebunden', c: false },
        { t: 'Nein, Auslagen und Preisschilder sind unverbindliche Einladungen zur Offerte', c: true },
        { t: 'Ja, aber nur für registrierte Stammkunden', c: false },
        { t: 'Nur wenn die Ware physisch aufgenommen wird', c: false },
      ],
      explanation: 'Preisschilder/Auslagen sind unverbindliche Einladungen (invitatio ad offerendum). Der Vertrag kommt erst an der Kasse zustande.',
      difficulty: 'medium',
    },
    {
      q: 'Was braucht man für Handlungsfähigkeit?',
      opts: [
        { t: 'Schweizer Staatsbürgerschaft und Wohnsitz in der Schweiz', c: false },
        { t: 'Volljährigkeit (18 Jahre, Art. 14 ZGB) und Urteilsfähigkeit (Art. 16 ZGB)', c: true },
        { t: 'Nur Volljährigkeit – Urteilsfähigkeit ist nicht Voraussetzung', c: false },
        { t: 'Mindestens 16 Jahre und eine elterliche Zustimmung', c: false },
      ],
      explanation: 'Handlungsfähigkeit = Volljährigkeit (Art. 14 ZGB: vollendetes 18. Lebensjahr) + Urteilsfähigkeit (Art. 16 ZGB: vernunftgemässes Handeln).',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet Vertragsfreiheit (Privatautonomie) im Schweizer Recht?',
      opts: [
        { t: 'Man darf jeden Vertrag schriftlich oder mündlich abschliessen', c: false },
        { t: 'Jeder ist frei in der Entscheidung, ob und mit wem er einen Vertrag abschliesst, solange der Inhalt legal ist', c: true },
        { t: 'Verträge brauchen keine Gegenleistung', c: false },
        { t: 'Nur Volljährige dürfen Verträge abschliessen', c: false },
      ],
      explanation: 'Privatautonomie (Art. 19 OR): Vertragsfreiheit = Abschlussfreiheit (ob), Partnerwahlfreiheit (mit wem), Inhaltsfreiheit (was), Formfreiheit (wie). Grenzen: Gesetze, Sitten, Unmöglichkeit.',
      difficulty: 'medium',
    },
    {
      q: 'Für welchen Vertrag ist öffentliche Beurkundung (Notar) zwingend?',
      opts: [
        { t: 'Für alle Verträge über CHF 10\'000', c: false },
        { t: 'Für den Kauf eines Grundstücks', c: true },
        { t: 'Für Arbeitsverträge mit mehr als 1 Jahr Laufzeit', c: false },
        { t: 'Für Mietverträge mit einer Laufzeit über 5 Jahre', c: false },
      ],
      explanation: 'Grundstückskauf: zwingend öffentliche Beurkundung (Notar) + Eintrag im Grundbuch. Ohne dies kein Eigentumsübergang. Andere Immobilienverträge (z.B. Stockwerkeigentumsregelungen) können ebenfalls Beurkundung erfordern.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist ein verbindlicher Antrag (Offerte)?',
      opts: [
        { t: 'Eine Einladung, ein Angebot zu machen', c: false },
        { t: 'Eine Willenserklärung mit allen wesentlichen Vertragspunkten, die den Antragsteller bindet', c: true },
        { t: 'Ein Preisschild im Schaufenster', c: false },
        { t: 'Ein Katalog mit Preisliste', c: false },
      ],
      explanation: 'Verbindlicher Antrag (Art. 3 OR): enthält alle wesentlichen Punkte (Ware, Preis, Menge) und bindet den Antragsteller bis zum Ablauf der Annahmefrist. Annahme = Vertrag. Ablehnung/Schweigen = kein Vertrag.',
      difficulty: 'medium',
    },
    {
      q: 'Was gilt, wenn jemand ein Angebot zu spät annimmt?',
      opts: [
        { t: 'Der Vertrag kommt trotzdem zustande', c: false },
        { t: 'Die verspätete Annahme gilt als neuer Antrag, den der ursprüngliche Antragsteller annehmen kann oder nicht', c: true },
        { t: 'Der Antragsteller muss den Vertrag annehmen', c: false },
        { t: 'Die verspätete Annahme hat keine Wirkung', c: false },
      ],
      explanation: 'Verspätete Annahme (Art. 5 OR): gilt als neuer Antrag. Der ursprüngliche Antragsteller kann diesen neuen Antrag annehmen oder ablehnen. Damit liegt die Entscheidung nun beim ursprünglichen Anbieter.',
      difficulty: 'hard',
    },
    {
      q: 'Welcher Vertrag bedarf keiner besonderen Form?',
      opts: [
        { t: 'Kauf eines Grundstücks', c: false },
        { t: 'Mündlicher Kauf eines Fahrrads', c: true },
        { t: 'Kaufvertrag für ein Auto mit Ratenzahlung', c: false },
        { t: 'Arbeitsvertrag mit 3-jähriger Laufzeit', c: false },
      ],
      explanation: 'Formfreiheit ist der Grundsatz (Art. 11 OR): Der mündliche Kauf eines Fahrrads ist vollständig gültig. Ausnahmen brauchen Schriftform oder öffentliche Beurkundung – z.B. Grundstückkauf, Schenkungsversprechen.',
      difficulty: 'easy',
    },
    {
      q: 'Was bedeutet Handlungsunfähigkeit?',
      opts: [
        { t: 'Man kann körperlich keine Tätigkeiten ausführen', c: false },
        { t: 'Man kann keine rechtswirksamen Handlungen vornehmen – z.B. bei Urteilsunfähigkeit oder Minderjährigkeit', c: true },
        { t: 'Man darf keine Verträge kündigen', c: false },
        { t: 'Man haftet nicht für eigene Schulden', c: false },
      ],
      explanation: 'Handlungsunfähige können keine Rechte und Pflichten selbst begründen. Urteilsunfähige (z.B. schwere Demenz) sind handlungsunfähig. Minderjährige sind beschränkt handlungsfähig (brauchen Zustimmung der Eltern).',
      difficulty: 'medium',
    },
    {
      q: 'Was sind sittenwidrige Verträge?',
      opts: [
        { t: 'Verträge, die mündlich und nicht schriftlich abgeschlossen wurden', c: false },
        { t: 'Verträge mit einem Inhalt, der gegen das allgemeine Anstandsgefühl oder grundlegende Werte verstösst (Art. 20 OR)', c: true },
        { t: 'Verträge ohne Gegenleistung', c: false },
        { t: 'Verträge zwischen Verwandten', c: false },
      ],
      explanation: 'Sittenwidriger Vertrag (Art. 20 OR): nichtig von Anfang an. Beispiel: Vertrag über illegale Handlungen, Wucher. Der Unterschied zu Übervorteilung (Art. 21 OR): Art. 20 = nichtig; Art. 21 = nur anfechtbar.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist Treu und Glauben im Vertragsrecht?',
      opts: [
        { t: 'Ein Grundsatz, der nur für Kaufverträge gilt', c: false },
        { t: 'Ein fundamentaler Rechtsgrundsatz (Art. 2 ZGB): fair, ehrlich und rücksichtsvoll handeln', c: true },
        { t: 'Die Pflicht, alle Verträge schriftlich festzuhalten', c: false },
        { t: 'Das Recht, einen Vertrag jederzeit zu widerrufen', c: false },
      ],
      explanation: 'Treu und Glauben (Art. 2 ZGB): Fundamentales Prinzip des Schweizer Privatrechts. Jeder muss sich beim Vertragsabschluss und bei der Vertragserfüllung fair und ehrlich verhalten. Verstoss kann Haftung begründen.',
      difficulty: 'medium',
    },
  ])

  await reconnect()
  const chMaengel = await prisma.chapter.create({
    data: {
      slug: 'maengel-vertragsentstehung',
      title: 'Mängel bei der Vertragsentstehung',
      subtitle: 'Irrtum, Täuschung, Drohung und Übervorteilung',
      topicId: tVertrag.id,
      order: 2,
      contentStatus: 'complete',
      summary: `# 5. Maengel bei der Vertragsentstehung\n\n## Nichtigkeit vs. Anfechtbarkeit\n\nNichtigkeit: Vertrag ist von Anfang an ungueltig bei schwerem Mangel (widerrechtlicher Inhalt, Formmangel, Unmoeglichkeit, Sittenwidrigkeit).\nAnfechtbarkeit: Vertrag ist entstanden, aber nicht endgueltig verbindlich bis zur Anfechtung.\n\n## Uebervorteilung (Art. 21 OR)\n\nVoraussetzungen: offenbares Missverhaeltnis zwischen Leistung und Gegenleistung + Schwaechesituation + Ausbeutung.\nFolge: anfechtbar.\n\n## Wesentlicher Irrtum (Art. 23/24 OR)\n\nUnbewusste Falschvorstellung ueber einen wesentlichen Punkt (Vertragspartner, Sache, Grundlage).\nFolge: anfechtbar. Motivirrtum berechtigt NICHT zur Anfechtung.\n\n## Absichtliche Taeuschung (Art. 28 OR)\n\nEine Partei wird absichtlich in die Irre gefuehrt.\nFolge: anfechtbar.\n\n## Drohung / Furchterregung (Art. 29/30 OR)\n\nEine Partei schliesst den Vertrag wegen ernsthafter Drohung.\nFolge: anfechtbar.\n\n## Anfechtungsfrist\n\nAnfechtung innert eines Jahres, sonst gilt der Vertrag als genehmigt.\n\n## Typische Pruefungslogik\n\n1. Liegt ein Willensmangel vor?\n2. Welcher Art?\n3. Nichtig oder anfechtbar?\n4. Rechtzeitig angefochten?`,
      learningGoals: {
        create: [
          { text: 'Verschiedene Willensmängel unterscheiden und erklären', order: 1 },
          { text: 'Irrtum von Täuschung abgrenzen', order: 2 },
          { text: 'Motivirrtum vs. Erklärungsirrtum unterscheiden', order: 3 },
          { text: 'Folgen von Willensmängeln kennen', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Wesentlicher Irrtum', definition: 'Unbewusste Falschvorstellung über einen wesentlichen Vertragspunkt – anfechtbar (Art. 23 OR)', order: 1 },
          { term: 'Motivirrtum', definition: 'Irrtum über den Beweggrund – berechtigt NICHT zur Anfechtung', order: 2 },
          { term: 'Erklärungsirrtum', definition: 'Versprechen oder Verschreiben – wesentlicher Irrtum, anfechtbar', order: 3 },
          { term: 'Absichtliche Täuschung', definition: 'Bewusstes Irreführen des Vertragspartners (Art. 28 OR) – Vertrag anfechtbar', order: 4 },
          { term: 'Drohung', definition: 'Abschluss unter Zwang durch Furcht (Art. 29 OR) – Vertrag anfechtbar', order: 5 },
          { term: 'Übervorteilung', definition: 'Bewusstes Ausnutzen von Notlage, Unerfahrenheit oder Leichtsinn (Art. 21 OR)', order: 6 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Willensmängel machen Vertrag ANFECHTBAR (nicht automatisch nichtig)', order: 1 },
          { text: 'Motivirrtum: "Ich kaufte Aktien, weil ich dachte sie steigen" → KEINE Anfechtung', order: 2 },
          { text: 'Erklärungsirrtum: "Ich meinte 1\'000, schrieb aber 10\'000" → Anfechtung möglich', order: 3 },
          { text: 'Täuschung: die andere Partei muss aktiv täuschen', order: 4 },
          { text: 'Übervorteilung: offensichtliches Missverhältnis + bewusstes Ausnutzen', order: 5 },
        ],
      },
      examples: {
        create: [
          { text: 'Übervorteilung: Person in Notlage verkauft Haus weit unter Marktwert; Käufer nutzt Lage bewusst aus', order: 1 },
          { text: 'Motivirrtum: Kauf einer Vase "weil sie antik ist" – stellt sich als Fälschung heraus → kein Anfechtungsrecht', order: 2 },
        ],
      },
    },
  })

  await createQuiz(chMaengel.id, [
    {
      q: 'Berechtigt der Motivirrtum zur Anfechtung eines Vertrags?',
      opts: [
        { t: 'Ja, immer', c: false },
        { t: 'Nein, der Motivirrtum berechtigt grundsätzlich NICHT zur Anfechtung', c: true },
        { t: 'Nur bei Verträgen über CHF 10\'000', c: false },
        { t: 'Nur wenn der andere Teil davon wusste', c: false },
      ],
      explanation: 'Der Motivirrtum (Irrtum über den Beweggrund) berechtigt nicht zur Anfechtung – im Gegensatz zum Erklärungs- oder Inhaltsirrtum.',
      difficulty: 'hard',
    },
    {
      q: 'Was versteht man unter Übervorteilung (Art. 21 OR)?',
      opts: [
        { t: 'Eine faire aber harte Preisverhandlung', c: false },
        { t: 'Bewusstes Ausnutzen einer Schwächesituation zur Erzielung eines unverhältnismässigen Vorteils', c: true },
        { t: 'Ein einseitig bindender Vertrag ohne Gegenleistung', c: false },
        { t: 'Eine Übertragung von Eigentumsrechten ohne Zustimmung', c: false },
      ],
      explanation: 'Übervorteilung (Art. 21 OR): Eine Partei nutzt BEWUSST die Notlage, Unerfahrenheit oder Leichtsinn der anderen aus + offensichtliches Missverhältnis der Leistungen.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Irrtum und absichtlicher Täuschung?',
      opts: [
        { t: 'Irrtum ist schwerwiegender und führt zur Nichtigkeit', c: false },
        { t: 'Irrtum = unbewusste Falschvorstellung; Täuschung = bewusstes Irreführen durch die andere Partei', c: true },
        { t: 'Täuschung berechtigt nicht zur Anfechtung', c: false },
        { t: 'Irrtum kann nur über den Kaufpreis bestehen', c: false },
      ],
      explanation: 'Irrtum (Art. 23 OR): eigene Falschvorstellung, unbewusst. Täuschung (Art. 28 OR): die andere Partei täuscht aktiv. Beide machen den Vertrag anfechtbar, aber Täuschung ist moralisch und rechtlich schwerwiegender.',
      difficulty: 'medium',
    },
    {
      q: 'Innert welcher Frist muss ein Willensmangel angefochten werden?',
      opts: [
        { t: 'Innert 3 Monaten', c: false },
        { t: 'Innert eines Jahres nach Entdeckung des Mangels', c: true },
        { t: 'Innert 2 Jahren', c: false },
        { t: 'Die Frist gibt es nicht – man kann jederzeit anfechten', c: false },
      ],
      explanation: 'Anfechtungsfrist (Art. 31 OR): 1 Jahr ab Entdeckung des Irrtums oder Täuschung, bzw. 1 Jahr ab Ende der Drohung. Versäumt man die Frist, gilt der Vertrag als genehmigt und ist nicht mehr anfechtbar.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist ein Erklärungsirrtum?',
      opts: [
        { t: 'Irrtum über den Beweggrund für den Vertrag', c: false },
        { t: 'Irrtum beim Erklären: man sagt oder schreibt etwas anderes als gemeint (Versprechen, Verschreiben)', c: true },
        { t: 'Irrtum über die Rechtsfolgen des Vertrags', c: false },
        { t: 'Irrtum über die Identität des Vertragspartners', c: false },
      ],
      explanation: 'Erklärungsirrtum: Der Fehler liegt bei der Erklärung (Aussprechen/Schreiben), nicht bei der inneren Vorstellung. Beispiel: Man meint CHF 1\'000, schreibt CHF 10\'000. Wesentlicher Irrtum → Vertrag anfechtbar.',
      difficulty: 'medium',
    },
    {
      q: 'Was passiert, wenn ein Vertrag erfolgreich angefochten wird?',
      opts: [
        { t: 'Der Vertrag wird mit sofortiger Wirkung nichtig', c: false },
        { t: 'Der Vertrag kann rückabgewickelt werden – Leistungen werden zurückerstattet', c: true },
        { t: 'Nur der benachteiligte Teil ist nicht mehr gebunden', c: false },
        { t: 'Schadenersatzpflicht entsteht automatisch', c: false },
      ],
      explanation: 'Anfechtung: Der anfechtbare Vertrag kann rückgängig gemacht werden. Die Parteien müssen sich gegenseitig das Empfangene zurückgeben. Bei Täuschung oder Drohung kann zusätzlich Schadenersatz verlangt werden.',
      difficulty: 'hard',
    },
    {
      q: 'Liegt ein Irrtum über die Vertragsgrundlage vor, wenn jemand ein Bild kauft, in der Annahme es sei ein Original, und es ist eine Kopie?',
      opts: [
        { t: 'Nein, das ist nur ein Motivirrtum', c: false },
        { t: 'Ja, das ist ein wesentlicher Irrtum über die Sache (Grundlagenirrtum) – Vertrag anfechtbar', c: true },
        { t: 'Das spielt keine Rolle, weil der Preis bezahlt wurde', c: false },
        { t: 'Nur wenn der Verkäufer absichtlich getäuscht hat', c: false },
      ],
      explanation: 'Grundlagenirrtum (Art. 24 OR): Irrtum über wesentliche Eigenschaften der Kaufsache. Kauf eines Bildes als "Original" statt Kopie = wesentlicher Irrtum über die Sache → anfechtbar. Unterschied zum Motivirrtum (z.B. "Ich kaufte, weil ich dachte, es steigt im Wert").',
      difficulty: 'hard',
    },
    {
      q: 'Wann liegt Drohung als Willensmangel vor?',
      opts: [
        { t: 'Wenn jemand zu einem günstigen Preis verhandelt', c: false },
        { t: 'Wenn jemand unter dem Eindruck einer ernsthaften Bedrohung oder Gefahr einen Vertrag abschliesst', c: true },
        { t: 'Wenn der Preis für das Produkt zu hoch ist', c: false },
        { t: 'Wenn die Verhandlungsposition einer Partei stärker ist', c: false },
      ],
      explanation: 'Drohung (Art. 29/30 OR): Jemand schliesst einen Vertrag, weil ihm ernsthafter Nachteil angedroht wird (z.B. körperliche Gewalt, schwere wirtschaftliche Nachteile). Der Vertrag ist anfechtbar, nicht nichtig.',
      difficulty: 'medium',
    },
  ])

  await reconnect()
  const chHaftung = await prisma.chapter.create({
    data: {
      slug: 'verschuldens-kausalhaftung',
      title: 'Verschuldens- und Kausalhaftung',
      subtitle: 'Voraussetzungen der Haftung und Verjährungsfristen',
      topicId: tVertrag.id,
      order: 3,
      contentStatus: 'complete',
      summary: `# 5. Verschuldens- und Kausalhaftung\n\n## Entstehungsgruende von Obligationen\n\nObligationen entstehen durch: 1. Vertrag, 2. Unerlaubte Handlung, 3. Ungerechtfertigte Bereicherung.\n\n## Verschuldenshaftung (Art. 41 OR)\n\nWer jemandem widerrechtlich Schaden zufuegt, muss Schadenersatz leisten.\n\nVoraussetzungen (alle vier muessen vorliegen):\n1. Schaden\n2. Widerrechtlichkeit\n3. Adaequater Kausalzusammenhang\n4. Verschulden\n\n## Kausalhaftung\n\nEntsteht unabhaengig vom persoenlichen Verschulden.\nBeispiele: Werkeigentuemerhaftung, Tierhalterhaftung, Gefahrenhaftung.\n\n## Ungerechtfertigte Bereicherung\n\nWer ohne rechtlichen Grund auf Kosten einer anderen Person bereichert ist, muss die Bereicherung zurueckerstatten.\n\n## Verjaehrung\n\nVerjaehrung = Anspruch besteht noch, kann aber nach Fristablauf nicht mehr durchgesetzt werden.\nDeliktische Ansprueche: 3 Jahre nach Kenntnisnahme, max. 10 Jahre.\n\n## Typische Pruefungslogik\n\n1. Welcher Haftungstyp liegt vor (Verschuldens- oder Kausalhaftung)?\n2. Sind alle Voraussetzungen erfuellt?\n3. Ist der Anspruch noch nicht verjaehrt?`,
      learningGoals: {
        create: [
          { text: 'Die vier Voraussetzungen der Verschuldenshaftung nennen', order: 1 },
          { text: 'Kausalhaftung von Verschuldenshaftung unterscheiden', order: 2 },
          { text: 'Adäquaten Kausalzusammenhang erklären', order: 3 },
          { text: 'Verjährungsfristen kennen', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Verschuldenshaftung', definition: 'Art. 41 OR: Haftung bei Schaden + Widerrechtlichkeit + Kausalzusammenhang + Verschulden', order: 1 },
          { term: 'Kausalhaftung', definition: 'Haftung unabhängig vom Verschulden (z.B. Werkeigentümerhaftung)', order: 2 },
          { term: 'Adäquater Kausalzusammenhang', definition: 'Handlung konnte nach dem "gewöhnlichen Lauf der Dinge" den Schaden verursachen', order: 3 },
          { term: 'Werkeigentümerhaftung', definition: 'Eigentümer eines Gebäudes haftet für Schäden durch mangelhafte Unterhaltung', order: 4 },
          { term: 'Verjährung', definition: 'Nach Ablauf der Frist kann Anspruch nicht mehr gerichtlich durchgesetzt werden', order: 5 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Verschuldenshaftung: 1. Schaden 2. Widerrechtlichkeit 3. Kausalzusammenhang 4. Verschulden', order: 1 },
          { text: 'Kausalhaftung: keine Verschuldensvoraussetzung – Werkeigentümer haftet ohne eigenes Verschulden', order: 2 },
          { text: 'Adäquanz: "Kann diese Handlung nach normalem Verlauf diesen Schaden verursachen?"', order: 3 },
          { text: 'Verjährung (deliktisch): 3 Jahre ab Kenntnisnahme, max. 10 Jahre ab Ereignis', order: 4 },
        ],
      },
      examples: {
        create: [
          { text: 'Schnee fällt vom Dach und verletzt Passant: Werkeigentümerhaftung → Eigentümer haftet', order: 1 },
          { text: 'Heilungskosten + Erwerbsausfall des Verletzten = Schaden; Schnee nicht wegräumen = widerrechtlich', order: 2 },
        ],
      },
    },
  })

  await createQuiz(chHaftung.id, [
    {
      q: 'Welches sind die vier Voraussetzungen der Verschuldenshaftung?',
      opts: [
        { t: 'Schaden, Mangel, Vorsatz, Beweis', c: false },
        { t: 'Schaden, Widerrechtlichkeit, adäquater Kausalzusammenhang, Verschulden', c: true },
        { t: 'Unfall, Verletzung, Arzt, Entschädigung', c: false },
        { t: 'Vertrag, Verletzung, Schaden, Klage', c: false },
      ],
      explanation: 'Art. 41 OR Verschuldenshaftung: 1. Schaden, 2. Widerrechtliches Verhalten, 3. Adäquater Kausalzusammenhang, 4. Verschulden (Vorsatz oder Fahrlässigkeit).',
      difficulty: 'hard',
    },
    {
      q: 'Was ist die Kausalhaftung?',
      opts: [
        { t: 'Haftung nur bei eigenem Verschulden', c: false },
        { t: 'Haftung unabhängig von eigenem Verschulden, z.B. Werkeigentümerhaftung', c: true },
        { t: 'Haftung nur bei Vertragsbruch', c: false },
        { t: 'Staatshaftung für Behördenversagen', c: false },
      ],
      explanation: 'Kausalhaftung = Haftung ohne Verschulden (z.B. Werkeigentümer haftet für Schäden durch sein Gebäude, auch ohne persönliches Fehlverhalten).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der adäquate Kausalzusammenhang?',
      opts: [
        { t: 'Der Schaden muss vom Verletzten selbst verursacht worden sein', c: false },
        { t: 'Die Handlung muss nach dem gewöhnlichen Lauf der Dinge geeignet sein, den eingetretenen Schaden zu verursachen', c: true },
        { t: 'Es muss ein direkter zeitlicher Zusammenhang zwischen Handlung und Schaden bestehen', c: false },
        { t: 'Der Schaden muss grösser als CHF 1\'000 sein', c: false },
      ],
      explanation: 'Adäquater Kausalzusammenhang: War die Handlung generell geeignet, diesen Schaden zu verursachen (Vorhersehbarkeit)? Beispiel: Eisglätte auf Gehweg → Sturz = adäquat. Zufälliger Herzinfarkt beim Sturz → nicht adäquat kausal für Herzinfarkt.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist Widerrechtlichkeit als Voraussetzung der Verschuldenshaftung?',
      opts: [
        { t: 'Der Schädiger muss vorbestraft sein', c: false },
        { t: 'Das Verhalten muss gegen eine gesetzliche Norm oder ein absolutes Recht verstossen', c: true },
        { t: 'Der Schaden muss vorsätzlich verursacht worden sein', c: false },
        { t: 'Der Schaden muss finanzieller Natur sein', c: false },
      ],
      explanation: 'Widerrechtlichkeit: Verletzung einer Schutznorm (z.B. Gebot, kein Eis auf dem Gehweg zu lassen) oder eines absoluten Rechts (Leben, Körper, Eigentum). Rein wirtschaftliche Schäden ohne Rechtsverletzung = oft nicht widerrechtlich.',
      difficulty: 'hard',
    },
    {
      q: 'Welche Schadensarten können Grundlage einer Schadenersatzklage sein?',
      opts: [
        { t: 'Nur finanzielle Schäden', c: false },
        { t: 'Heilungskosten, Erwerbsausfall, Genugtuung (Schmerzensgeld) und Sachschäden', c: true },
        { t: 'Nur immaterielle Schäden (Schmerzensgeld)', c: false },
        { t: 'Nur Schäden über CHF 10\'000', c: false },
      ],
      explanation: 'Schadenersatz umfasst: Heilungskosten, Erwerbsausfall (direkte Schäden), Sachschäden. Zusätzlich kann Genugtuung (Schmerzensgeld) für immateriellen Schaden verlangt werden, wenn schwere Persönlichkeitsverletzung vorliegt.',
      difficulty: 'medium',
    },
    {
      q: 'Wann verjährt ein Anspruch aus unerlaubter Handlung (Delikt)?',
      opts: [
        { t: '1 Jahr ab dem Schaden', c: false },
        { t: '3 Jahre ab Kenntnisnahme, absolut 10 Jahre ab Ereignis', c: true },
        { t: '5 Jahre ab Entstehung des Schadens', c: false },
        { t: '2 Jahre ab dem Ereignis', c: false },
      ],
      explanation: 'Verjährung (Art. 60 OR): 3 Jahre ab Kenntnisnahme von Schaden und Schädiger (relativ), maximal 10 Jahre ab dem schädigenden Ereignis (absolut). Läuft die Frist ab ohne Klage, ist der Anspruch verjährt.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist Verschulden im Kontext der Haftung?',
      opts: [
        { t: 'Immer nur Vorsatz – Fahrlässigkeit reicht nicht', c: false },
        { t: 'Vorsatz (bewusstes Handeln) oder Fahrlässigkeit (Missachten der gebotenen Sorgfalt)', c: true },
        { t: 'Nur strafbares Verhalten', c: false },
        { t: 'Verschulden ist bei der Verschuldenshaftung nicht notwendig', c: false },
      ],
      explanation: 'Verschulden = Vorsatz (man will den Schaden) oder Fahrlässigkeit (man hätte sorgfältiger sein müssen). Grobe Fahrlässigkeit: stark vorwerfbare Sorglosigkeit. Art. 41 OR: beide Formen begründen Haftung.',
      difficulty: 'medium',
    },
    {
      q: 'Ein Tierhalter haftet für seinen Hund, der jemanden beisst. Handelt es sich um Verschuldens- oder Kausalhaftung?',
      opts: [
        { t: 'Verschuldenshaftung – der Halter hätte besser aufpassen müssen', c: false },
        { t: 'Kausalhaftung – der Halter haftet unabhängig von eigenem Verschulden', c: true },
        { t: 'Keine Haftung – Tiere sind nicht rechtsfähig', c: false },
        { t: 'Haftung des Hundes, nicht des Halters', c: false },
      ],
      explanation: 'Tierhalterhaftung (Art. 56 ZGB) = Kausalhaftung: Haftung ohne persönliches Verschulden. Der Halter kann sich entlasten, wenn er nachweist, dass er alle gebotene Sorgfalt walten liess oder der Schaden auch bei höchster Sorgfalt eingetreten wäre.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist eine ungerechtfertigte Bereicherung?',
      opts: [
        { t: 'Gewinne aus unerlaubtem Handel', c: false },
        { t: 'Wer ohne rechtlichen Grund auf Kosten eines anderen bereichert wird, muss das Erlangte zurückgeben', c: true },
        { t: 'Übermässige Gewinne eines Unternehmens', c: false },
        { t: 'Bereicherung durch Erbschaft', c: false },
      ],
      explanation: 'Ungerechtfertigte Bereicherung (Art. 62 OR): Jemand erhält etwas ohne rechtlichen Grund auf Kosten einer anderen Person (z.B. irrtümliche Zahlung). Er muss das Erlangte zurückgeben. Kein Verschulden erforderlich.',
      difficulty: 'medium',
    },
  ])

  await reconnect()
  const chMietvertrag = await prisma.chapter.create({
    data: {
      slug: 'mietvertrag',
      title: 'Mietvertrag',
      subtitle: 'Mietrecht, Nebenkosten, Kündigung, Mietzinsdepot',
      topicId: tVertrag.id,
      order: 4,
      contentStatus: 'complete',
      summary: `# Mietvertrag (Art. 253ff. OR)\n\nDer Mietvertrag verpflichtet den Vermieter zur Gebrauchsueberlassung und den Mieter zur Mietzinszahlung.\n\nMietzinsdepot: max. 3 Monatszinse auf Sperrkonto (Art. 257e OR).\n\nNettomiete: Mietzins ohne Nebenkosten (NK separat). Bruttomiete: Mietzins inkl. Nebenkosten.\n\nNebenkosten: Strom, Heizung, Wasser, Reinigung gemeinsamer Anlagen.\n\nKuendigung: grundsaetzlich 30 Tage auf Monatsende (Art. 266a OR).\n\nMietzinsverzug: 30 Tage Nachfrist (Art. 257d OR) bevor Kuendigung moeglich.\n\nNormaler Verschleiss (z. B. Farbe verblasst): traegt Vermieter.\nUebermassige Abnutzung (z. B. Loch in Wand): traegt Mieter.`,
      learningGoals: {
        create: [
          { text: 'Bestandteile des Mietvertrags kennen', order: 1 },
          { text: 'Netto- und Bruttomiete unterscheiden', order: 2 },
          { text: 'Nebenkosten korrekt einordnen', order: 3 },
          { text: 'Kündigungsfristen und Mietzinsdepot kennen', order: 4 },
          { text: 'Übermässige Abnutzung von normalem Verschleiss abgrenzen', order: 5 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Mietzinsdepot', definition: 'Sicherheitsleistung des Mieters: max. 3 Monatszinse, auf Sperrkonto', order: 1 },
          { term: 'Nettomiete', definition: 'Mietzins ohne Nebenkosten – NK werden separat abgerechnet', order: 2 },
          { term: 'Bruttomiete', definition: 'Mietzins inklusive Nebenkosten – nur eine Rechnung', order: 3 },
          { term: 'Nebenkosten (NK)', definition: 'Strom, Heizung, Wasser, Reinigung/Reparatur gemeinsamer Anlagen', order: 4 },
          { term: 'Übermässige Abnutzung', definition: 'Schäden über normalen Gebrauch hinaus – vom Mieter zu ersetzen', order: 5 },
          { term: 'Nachfrist (Mietzinsverzug)', definition: '30 Tage Nachfrist bei ausbleibendem Mietzins, bevor Kündigung möglich', order: 6 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Mietzinsdepot: max. 3 Monatszinse auf Sperrkonto (Art. 257e OR)', order: 1 },
          { text: 'Nettomiete (Normalfall): Mietzins + separate NK-Abrechnung', order: 2 },
          { text: 'NK: Strom, Heizung, Wasser, gemeinsame Anlagen', order: 3 },
          { text: 'Kündigung: 30 Tage auf Monatsende (Art. 266a OR)', order: 4 },
          { text: 'Mietzinsverzug: 30 Tage Nachfrist (Art. 257d OR) vor Kündigung', order: 5 },
          { text: 'Normaler Verschleiss trägt Vermieter; übermässige Abnutzung trägt Mieter', order: 6 },
        ],
      },
      examples: {
        create: [
          { text: 'Mietzins CHF 1\'500 → max. Depot = 3 × 1\'500 = CHF 4\'500 auf Sperrkonto', order: 1 },
          { text: 'Normaler Verschleiss: Farbe an der Wand verblasst nach 10 Jahren → Vermieter bezahlt', order: 2 },
          { text: 'Übermässige Abnutzung: Mieter schlägt Loch in die Wand → Mieter haftet', order: 3 },
        ],
      },
    },
  })

  await createQuiz(chMietvertrag.id, [
    {
      q: 'Wie hoch ist das maximale Mietzinsdepot in der Schweiz?',
      opts: [
        { t: 'Ein Monatszins', c: false },
        { t: 'Zwei Monatszinse', c: false },
        { t: 'Drei Monatszinse', c: true },
        { t: 'Sechs Monatszinse', c: false },
      ],
      explanation: 'Art. 257e OR: Das Mietzinsdepot darf maximal 3 Monatszinse betragen und muss auf einem Sperrkonto (getrennt vom Vermieter-Vermögen) angelegt werden.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Unterschied zwischen Nettomiete und Bruttomiete?',
      opts: [
        { t: 'Bruttomiete ist immer teurer als Nettomiete', c: false },
        { t: 'Nettomiete: NK separat abgerechnet; Bruttomiete: NK im Mietzins enthalten', c: true },
        { t: 'Bei Nettomiete zahlt der Vermieter alle Nebenkosten', c: false },
        { t: 'Kein Unterschied – beides ist dasselbe', c: false },
      ],
      explanation: 'Nettomiete (Normalfall): Mietzins + separate Nebenkostenabrechnung. Bruttomiete (Inklusivmiete): alle Kosten in einem Betrag enthalten.',
      difficulty: 'easy',
    },
    {
      q: 'Wie lange ist die Kündigungsfrist für eine Mietwohnung in der Schweiz im Normalfall?',
      opts: [
        { t: 'Sofort', c: false },
        { t: '30 Tage auf Ende eines Monats', c: true },
        { t: '3 Monate auf Ende eines Quartals', c: false },
        { t: '6 Monate auf Ende eines Halbjahres', c: false },
      ],
      explanation: 'Art. 266a OR: Normalfrist Wohnungsmiete = 3 Monate auf einen ortsüblichen Termin (in der Regel Ende Monat). Parteien können im Vertrag abweichende Fristen vereinbaren, aber zu Ungunsten des Mieters nur beschränkt.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind Nebenkosten beim Mietvertrag?',
      opts: [
        { t: 'Reparaturkosten für strukturelle Mängel des Gebäudes', c: false },
        { t: 'Tatsächliche Aufwendungen für Heizung, Warmwasser, Strom und gemeinsame Anlagen', c: true },
        { t: 'Versicherungskosten des Vermieters', c: false },
        { t: 'Renovierungskosten beim Auszug', c: false },
      ],
      explanation: 'Nebenkosten (Art. 257a OR): Nur tatsächliche Aufwendungen, über die abgerechnet werden muss (Heizung, Wasser, Strom, Reinigung gemeinsamer Räume). Keine pauschale Bereicherung des Vermieters erlaubt.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist übermässige Abnutzung beim Mietvertrag?',
      opts: [
        { t: 'Normaler Verschleiss durch sachgemässen Gebrauch', c: false },
        { t: 'Schäden, die über den normalen Gebrauch hinausgehen und vom Mieter zu ersetzen sind', c: true },
        { t: 'Jeder Schaden, der während der Mietdauer entsteht', c: false },
        { t: 'Schäden, die durch höhere Gewalt entstehen', c: false },
      ],
      explanation: 'Übermässige Abnutzung: z.B. Loch in der Wand, defekte Türen durch Missbrauch, Flecken auf dem Teppich. Normaler Verschleiss (Farbe verblasst, Teppich abgetreten) trägt der Vermieter. Mieter haftet nur für übermässige Schäden.',
      difficulty: 'medium',
    },
    {
      q: 'Auf welchem Konto muss das Mietzinsdepot hinterlegt werden?',
      opts: [
        { t: 'Auf dem Privatkonto des Vermieters', c: false },
        { t: 'Auf einem Sperrkonto auf den Namen des Mieters bei einer Bank', c: true },
        { t: 'Auf einem Konto des Mieters', c: false },
        { t: 'Bei einem Notar', c: false },
      ],
      explanation: 'Art. 257e OR: Das Depot muss auf einem Sperrkonto bei einer Bank hinterlegt werden – auf den Namen des Mieters. Es gehört dem Mieter, der Vermieter hat keinen Zugriff ohne Einwilligung oder Gerichtsentscheid.',
      difficulty: 'medium',
    },
    {
      q: 'Was muss der Vermieter tun, wenn der Mieter die Miete nicht zahlt?',
      opts: [
        { t: 'Sofort kündigen', c: false },
        { t: 'Eine Nachfrist von mindestens 30 Tagen setzen, danach kann er kündigen', c: true },
        { t: 'Die Polizei rufen', c: false },
        { t: 'Den Mieter direkt vor Gericht zitieren', c: false },
      ],
      explanation: 'Art. 257d OR (Mietzinsverzug): Der Vermieter muss dem Mieter eine schriftliche Nachfrist von mindestens 30 Tagen setzen. Zahlt der Mieter auch dann nicht, kann der Vermieter mit einer Frist von 30 Tagen auf Ende Monat kündigen.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Grundsatz beim Mietvertrag bezüglich Gebrauchsüberlassung?',
      opts: [
        { t: 'Der Mieter erhält Eigentum an der Sache', c: false },
        { t: 'Der Vermieter überlässt dem Mieter die Sache zum Gebrauch gegen Mietzins', c: true },
        { t: 'Der Mieter kann die Sache unbegrenzt umbauen', c: false },
        { t: 'Der Mieter haftet für alle Schäden ohne Ausnahme', c: false },
      ],
      explanation: 'Mietvertrag (Art. 253 OR): Der Vermieter überlässt die Sache zum Gebrauch, ohne Eigentum zu übertragen. Im Gegenzug zahlt der Mieter Mietzins. Der Mieter hat nur ein Recht auf Gebrauch, nicht auf Eigentum.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist ein Kaufvertrag?',
      opts: [
        { t: 'Ein Vertrag, bei dem eine Sache vorübergehend überlassen wird', c: false },
        { t: 'Ein Vertrag, bei dem der Verkäufer Eigentum überträgt und der Käufer den Kaufpreis zahlt', c: true },
        { t: 'Ein Vertrag ohne Gegenleistung', c: false },
        { t: 'Ein Vertrag, der immer schriftlich sein muss', c: false },
      ],
      explanation: 'Kaufvertrag (Art. 184 OR): Verkäufer übergibt die Sache und verschafft dem Käufer Eigentum. Käufer zahlt den Kaufpreis. Es ist ein gegenseitiger Vertrag mit zwei Hauptpflichten.',
      difficulty: 'easy',
    },
    {
      q: 'Was sind die Gewährleistungsrechte des Käufers bei einem mangelhaften Kaufgegenstand?',
      opts: [
        { t: 'Nur Schadenersatz ist möglich', c: false },
        { t: 'Wandelung (Rückabwicklung), Minderung (Preisreduktion) oder Ersatzlieferung', c: true },
        { t: 'Der Käufer muss den Mangel selbst beheben', c: false },
        { t: 'Der Käufer hat keine Rechte, wenn er die Ware abgeholt hat', c: false },
      ],
      explanation: 'Mängelrechte des Käufers: 1. Wandelung (Rücktritt + Kaufpreisrückgabe), 2. Minderung (Preisreduktion), 3. Ersatzlieferung (bei Gattungssachen). Voraussetzung: sofortige Mängelrüge nach Entdeckung.',
      difficulty: 'medium',
    },
  ])

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 6: VERTRÄGE AUF ARBEITSLEISTUNG (AP)
  // Stadlin/Riemek/König, Kapitel 7.1 / 7.2
  // ─────────────────────────────────────────
  const tArbeit = await prisma.topic.create({
    data: {
      slug: 'vertraege-arbeitsleistung',
      title: 'Verträge auf Arbeitsleistung',
      description: 'Arbeitsvertrag, Werkvertrag, einfacher Auftrag – Rechte & Pflichten – AP',
      icon: 'Briefcase',
      color: 'indigo',
      examType: 'abschluss',
      category: 'recht',
      order: 6,
    },
  })

  const chArbeitsvertrag = await prisma.chapter.create({
    data: {
      slug: 'arbeitsvertrag-rechte-pflichten',
      title: 'Arbeitsvertrag – Rechte & Pflichten',
      subtitle: 'Sorgfaltspflicht, Lohnfortzahlung, Ferien, Kündigung',
      topicId: tArbeit.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 6. Verträge auf Arbeitsleistung

## 6.1 Überblick

Zu den wichtigsten Verträgen auf Arbeitsleistung gehören:
- **Werkvertrag:** Erfolg geschuldet (Ergebnis muss gelingen)
- **Auftrag:** sorgfältiges Tätigwerden geschuldet (kein garantierter Erfolg)
- **Arbeitsvertrag:** unselbständige, weisungsgebundene Arbeit gegen Lohn

## 6.2 Werkvertrag

Beim Werkvertrag wird ein **bestimmter Erfolg** geschuldet.
Beispiel: Reparatur, Hausbau, Haarschnitt beim Coiffeur.
Bei Mängeln: Nachbesserung, Preisreduktion, Rücktritt/Schadenersatz.

## 6.3 Auftrag

Beim Auftrag wird **sorgfältiges Tätigwerden** geschuldet, kein Erfolg.
Beispiele: Arzt, Anwalt, Berater. Keine Garantie auf Heilung oder Prozessgewinn.

## 6.4 Arbeitsvertrag

**Merkmale:** Weisungsgebundenheit, Eingliederung in Betrieb, Lohnzahlung.

**Pflichten Arbeitnehmer (Art. 321a OR):**
- Sorgfalts- und Treuepflicht
- Weisungen befolgen
- Geschäftsgeheimnisse schützen
- Überstunden leisten wenn nötig und zumutbar

**Pflichten Arbeitgeber:**
- Lohnzahlung
- Lohnfortzahlung bei unverschuldeter Verhinderung (mind. 3 Wochen im 1. Jahr)
- Schutz der Persönlichkeit (Art. 328 OR)
- Ferien: mind. 4 Wochen (unter 20 Jahre: 5 Wochen)
- Arbeitszeugnis (Art. 330a OR)

## 6.5 Kündigung

- Ordentliche Kündigung: Im 1. Jahr = 1 Monat, ab 2. Jahr = 2 Monate, ab 10. Jahr = 3 Monate
- Fristlose Kündigung: nur bei wichtigem Grund (schwere Pflichtverletzung)
- Missbräuchliche Kündigung: bis 6 Monatslöhne Entschädigung

## 6.6 Konkurrenzverbot

Nur gültig wenn: schriftlich, räumlich/zeitlich/sachlich begrenzt, AN hatte Einblick in schützenswerte Geheimnisse.`,
      learningGoals: {
        create: [
          { text: 'Pflichten des Arbeitnehmers und Arbeitgebers aus dem Arbeitsvertrag kennen', order: 1 },
          { text: 'Lohnfortzahlungsanspruch nach Art. 324a OR erklären', order: 2 },
          { text: 'Ferienanspruch und Ferienzeitpunkt kennen', order: 3 },
          { text: 'Arbeitsvertrag, Werkvertrag und einfachen Auftrag abgrenzen', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Sorgfalts- und Treuepflicht', definition: 'Art. 321a OR: AN muss im Interesse des AG handeln, sorgfältig und treu', order: 1 },
          { term: 'Lohnfortzahlung Art. 324a', definition: 'Bei unverschuldeter Verhinderung: mind. 3 Wochen im 1. Jahr, mehr danach', order: 2 },
          { term: 'Werkvertrag', definition: 'Schuldet ein konkretes Ergebnis (Werk) – z.B. Haarschnitt beim Coiffeur', order: 3 },
          { term: 'Einfacher Auftrag', definition: 'Schuldet sorgfältige Ausführung, KEIN bestimmtes Ergebnis – z.B. Zahnarzt', order: 4 },
          { term: 'Weisungsgebundenheit', definition: 'Arbeitnehmer folgt den Weisungen des Arbeitgebers – charakteristisch für Arbeitsvertrag', order: 5 },
          { term: 'Ferienzeitpunkt', definition: 'Der Arbeitgeber bestimmt den Zeitpunkt (kann Feriensperre aussprechen)', order: 6 },
        ],
      },
      corePoints: {
        create: [
          { text: 'AN: Sorgfalt + Treue (Art. 321a), Weisungen befolgen, Rechenschaft ablegen', order: 1 },
          { text: 'AG: Lohn zahlen, Fürsorge, Persönlichkeit schützen (Art. 328), Zeugnis ausstellen (Art. 330a)', order: 2 },
          { text: 'Lohnfortzahlung: unverschuldet krank/unfallverletzt → mind. 3 Wochen im Jahr 1', order: 3 },
          { text: 'Ferien: <20J = 5 Wochen; ≥20J = 4 Wochen (Art. 329a OR)', order: 4 },
          { text: 'Ferienzeitpunkt = AG (mit Rücksicht auf AN-Wünsche, kann Sperre aussprechen)', order: 5 },
          { text: 'Werkvertrag: Ergebnis geschuldet; Auftrag: sorgfältige Ausführung geschuldet', order: 6 },
        ],
      },
      examples: {
        create: [
          { text: 'Coiffeur: schuldet den Haarschnitt (Werk) → Werkvertrag', order: 1 },
          { text: 'Zahnarzt: schuldet fachgerechte Behandlung, nicht gesunde Zähne → einfacher Auftrag', order: 2 },
          { text: 'UBER-Fahrer: kein klassischer Arbeitsvertrag → kein AHV/Unfallschutz durch AG', order: 3 },
        ],
      },
    },
  })

  await createQuiz(chArbeitsvertrag.id, [
    {
      q: 'Was schuldet der Arbeitnehmer gemäss Art. 321a OR?',
      opts: [
        { t: 'Nur die vertraglich vereinbarten Arbeitsstunden einhalten', c: false },
        { t: 'Sorgfalt und Treue – im Interesse des Arbeitgebers handeln', c: true },
        { t: 'Täglich Überstunden leisten ohne Mehrkosten', c: false },
        { t: 'Alle Weisungen schriftlich entgegennehmen', c: false },
      ],
      explanation: 'Art. 321a OR: "Sorgfalts- und Treuepflicht" – der Arbeitnehmer muss im Interesse des Arbeitgebers handeln, sorgfältig und treu.',
      difficulty: 'easy',
    },
    {
      q: 'Wie lange dauert die Lohnfortzahlung im 1. Anstellungsjahr bei Krankheit?',
      opts: [
        { t: '1 Woche', c: false },
        { t: '2 Wochen', c: false },
        { t: 'Mindestens 3 Wochen', c: true },
        { t: '1 Monat', c: false },
      ],
      explanation: 'Art. 324a Abs. 1 OR: Im 1. Dienstjahr mindestens 3 Wochen Lohnfortzahlung bei unverschuldeter Arbeitsverhinderung (Krankheit, Unfall, Schwangerschaft).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der wesentliche Unterschied zwischen Arbeitsvertrag und Werkvertrag?',
      opts: [
        { t: 'Kein Unterschied – nur verschiedene Namen', c: false },
        { t: 'Arbeitsvertrag: Weisungsgebundenheit + Lohn unabhängig vom Erfolg; Werkvertrag: Ergebnis (Werk) wird geschuldet', c: true },
        { t: 'Beim Werkvertrag wird immer mehr gezahlt', c: false },
        { t: 'Arbeitsvertrag ist immer schriftlich, Werkvertrag immer mündlich', c: false },
      ],
      explanation: 'Arbeitsvertrag: AN ist weisungsgebunden, Lohn unabhängig vom Ergebnis. Werkvertrag: Ein bestimmtes Werk wird geschuldet (Ergebnis zählt).',
      difficulty: 'medium',
    },
    {
      q: 'Wie viele Wochen Ferien haben Arbeitnehmende unter 20 Jahren in der Schweiz mindestens?',
      opts: [
        { t: '4 Wochen', c: false },
        { t: '5 Wochen', c: true },
        { t: '6 Wochen', c: false },
        { t: '3 Wochen', c: false },
      ],
      explanation: 'Art. 329a OR: Arbeitnehmende bis 20 Jahre haben Anspruch auf mindestens 5 Wochen Ferien pro Jahr (ab 20 Jahren: mindestens 4 Wochen).',
      difficulty: 'medium',
    },
    {
      q: 'Was unterscheidet den Arbeitsvertrag vom Werkvertrag?',
      opts: [
        { t: 'Beim Arbeitsvertrag wird ein bestimmtes Ergebnis geschuldet', c: false },
        { t: 'Beim Arbeitsvertrag ist man weisungsgebunden und unselbständig; beim Werkvertrag schuldet man ein bestimmtes Werk selbständig', c: true },
        { t: 'Beim Werkvertrag muss man Urlaub beantragen', c: false },
        { t: 'Beide Verträge sind identisch', c: false },
      ],
      explanation: 'Arbeitsvertrag: unselbständig, weisungsgebunden, Lohn unabhängig vom Ergebnis. Werkvertrag: selbständig, ein konkretes Werk (Ergebnis) wird geschuldet, Preiszahlung bei Abnahme des Werks.',
      difficulty: 'easy',
    },
    {
      q: 'Was unterscheidet den Auftrag (einfacher Auftrag) vom Werkvertrag?',
      opts: [
        { t: 'Der Auftragnehmer schuldet ein garantiertes Ergebnis', c: false },
        { t: 'Der Auftragnehmer schuldet sorgfältiges Tätigwerden – kein bestimmtes Ergebnis', c: true },
        { t: 'Der Auftrag ist immer mündlich', c: false },
        { t: 'Der Werkvertrag ist nur für Bauprojekte', c: false },
      ],
      explanation: 'Einfacher Auftrag (Art. 394 OR): Sorgfalt geschuldet, kein Erfolg garantiert. Arzt schuldet keine Heilung, Anwalt keinen Prozessgewinn. Werkvertrag: Erfolg (Werk) geschuldet – Coiffeur schuldet einen Haarschnitt.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Sorgfaltspflicht des Arbeitnehmers?',
      opts: [
        { t: 'Der Arbeitnehmer muss Überstunden leisten', c: false },
        { t: 'Der Arbeitnehmer muss sorgfältig arbeiten und Schäden am Arbeitgebervermögen vermeiden', c: true },
        { t: 'Der Arbeitnehmer muss alle Weisungen schriftlich bestätigen', c: false },
        { t: 'Der Arbeitnehmer darf Betriebsgeheimnisse weitergeben', c: false },
      ],
      explanation: 'Sorgfaltspflicht (Art. 321a OR): Der AN muss Maschinen, Fahrzeuge und Güter des AG sorgfältig behandeln. Bei grober Fahrlässigkeit kann er für Schäden haftbar gemacht werden.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist die Treuepflicht des Arbeitnehmers?',
      opts: [
        { t: 'Der Arbeitnehmer muss dem Arbeitgeber persönlich ergeben sein', c: false },
        { t: 'Der Arbeitnehmer muss im Interesse des Arbeitgebers handeln und darf keine Konkurrenz betreiben oder Geheimnisse verraten', c: true },
        { t: 'Der Arbeitnehmer darf niemals den Job wechseln', c: false },
        { t: 'Der Arbeitnehmer muss alle Geschäftsreisen absolvieren', c: false },
      ],
      explanation: 'Treuepflicht (Art. 321a OR): AN wahrt Interessen des AG, schützt Geschäftsgeheimnisse, unterlässt Konkurrenztätigkeit während der Anstellung. Nach Kündigung gilt ein allfälliges Konkurrenzverbot (wenn gültig vereinbart).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Fürsorgepflicht des Arbeitgebers?',
      opts: [
        { t: 'Der Arbeitgeber muss dem Arbeitnehmer Wohnung und Essen bereitstellen', c: false },
        { t: 'Der Arbeitgeber muss die Persönlichkeit, Gesundheit und Würde des Arbeitnehmers schützen', c: true },
        { t: 'Der Arbeitgeber muss alle Fehler des Arbeitnehmers tolerieren', c: false },
        { t: 'Der Arbeitgeber muss einen Rechtsanwalt bereitstellen', c: false },
      ],
      explanation: 'Fürsorgepflicht (Art. 328 OR): AG schützt Gesundheit (Arbeitsschutz), Würde (Anti-Mobbing), Persönlichkeitsrechte. Auch: korrekte Abrechnung der Sozialversicherungsbeiträge, Schutz vor Diskriminierung.',
      difficulty: 'medium',
    },
    {
      q: 'Hat der Arbeitnehmer Anspruch auf ein Zeugnis?',
      opts: [
        { t: 'Nur nach mindestens 3 Jahren Anstellung', c: false },
        { t: 'Ja, jederzeit – auf ein vollständiges (qualifiziertes) oder einfaches Zeugnis', c: true },
        { t: 'Nur wenn der Arbeitgeber es freiwillig ausstellt', c: false },
        { t: 'Nur bei einvernehmlicher Kündigung', c: false },
      ],
      explanation: 'Art. 330a OR: AN kann jederzeit ein Zeugnis verlangen. Es muss vollständig und wahrheitsgemäss sein – aber wohlwollend formuliert. Pflicht zur Ausstellung ist absolut – der AG kann nicht verweigern.',
      difficulty: 'medium',
    },
    {
      q: 'Welches Merkmal unterscheidet den Arbeitnehmer von einem Selbständigerwerbenden?',
      opts: [
        { t: 'Selbständige verdienen immer mehr als Angestellte', c: false },
        { t: 'Arbeitnehmer sind weisungsgebunden und in den Betrieb eingegliedert; Selbständige tragen ihr eigenes unternehmerisches Risiko', c: true },
        { t: 'Arbeitnehmer zahlen keine Steuern', c: false },
        { t: 'Selbständige dürfen keine Mitarbeitenden beschäftigen', c: false },
      ],
      explanation: 'Abgrenzung wichtig für Sozialversicherungen. Arbeitnehmer: weisungsgebunden, in Betrieb eingegliedert, kein eigenes Risiko. Scheinselbständigkeit (=eigentlich Arbeitnehmer) ist rechtlich problematisch.',
      difficulty: 'medium',
    },
    {
      q: 'Wann müssen Überstunden geleistet werden?',
      opts: [
        { t: 'Immer, wenn der Arbeitgeber es verlangt', c: false },
        { t: 'Wenn sie nötig, zumutbar und nach Treu und Glauben verlangt sind', c: true },
        { t: 'Nur wenn sie im Vertrag ausdrücklich vereinbart wurden', c: false },
        { t: 'Nie – Überstunden sind freiwillig', c: false },
      ],
      explanation: 'Überstundenpflicht (Art. 321c OR): Nur wenn nötig (betrieblich erforderlich), zumutbar (gesundheitlich, familiär) und nach Treu und Glauben. Entschädigung: Lohn + 25% Zuschlag oder Kompensation durch Freizeit.',
      difficulty: 'medium',
    },
    {
      q: 'Welche Bedingungen müssen für ein gültiges Konkurrenzverbot erfüllt sein?',
      opts: [
        { t: 'Es genügt eine mündliche Vereinbarung', c: false },
        { t: 'Schriftlich, räumlich, zeitlich und sachlich begrenzt; AN muss Einblick in Kundenkreis/Geschäftsgeheimnisse gehabt haben', c: true },
        { t: 'Es muss nur nach der Kündigung vereinbart werden', c: false },
        { t: 'Unbegrenztes Konkurrenzverbot ist immer gültig', c: false },
      ],
      explanation: 'Gültiges Konkurrenzverbot (Art. 340 OR): schriftlich vereinbart, begrenzt nach Ort, Zeit (max. 3 Jahre) und Sachgebiet. AN muss tatsächlich Einblick in schützenswerte Geheimnisse gehabt haben.',
      difficulty: 'hard',
    },
    {
      q: 'Wie ist die ordentliche Kündigungsfrist im 1. Anstellungsjahr beim Arbeitsvertrag?',
      opts: [
        { t: '1 Monat auf Monatsende', c: true },
        { t: '2 Monate auf Monatsende', c: false },
        { t: '3 Monate auf Monatsende', c: false },
        { t: '1 Woche', c: false },
      ],
      explanation: 'Art. 335c OR: Im 1. Anstellungsjahr 1 Monat, ab 2. Jahr 2 Monate, ab 10. Jahr 3 Monate – jeweils auf Monatsende. Probezeit (max. 3 Monate): 7 Tage Kündigungsfrist.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist fristlose Kündigung?',
      opts: [
        { t: 'Eine Kündigung, die keine Begründung braucht', c: false },
        { t: 'Sofortige Auflösung des Arbeitsvertrags bei wichtigem Grund (schwere Pflichtverletzung)', c: true },
        { t: 'Eine Kündigung, die der Arbeitgeber ohne Grund aussprechen kann', c: false },
        { t: 'Eine Kündigung während der Probezeit', c: false },
      ],
      explanation: 'Fristlose Kündigung (Art. 337 OR): nur bei wichtigem Grund möglich, z.B. Diebstahl, schwere Vertragsverletzung. Beide Parteien können fristlos kündigen. Der Kündigende trägt Beweislast für den wichtigen Grund.',
      difficulty: 'medium',
    },
    {
      q: 'Was schuldet der Arbeitgeber nach Art. 328 OR bezüglich der Persönlichkeit des Arbeitnehmers?',
      opts: [
        { t: 'Nichts – dies ist Privatangelegenheit', c: false },
        { t: 'Schutz der Persönlichkeit, Gesundheit und Würde des Arbeitnehmers', c: true },
        { t: 'Nur Schutz vor Körperverletzungen am Arbeitsplatz', c: false },
        { t: 'Schutz nur gegenüber externen Dritten', c: false },
      ],
      explanation: 'Art. 328 OR: AG schützt die Persönlichkeit des AN: Gesundheitsschutz (sichere Arbeitsbedingungen), Schutz vor Mobbing, Schutz vor Diskriminierung, Achtung der Würde. Verletzung → Schadenersatz + Genugtuung.',
      difficulty: 'easy',
    },
    {
      q: 'Wann hat ein Arbeitnehmer Anspruch auf Lohnfortzahlung bei Krankheit?',
      opts: [
        { t: 'Nur nach 1 Jahr Anstellung', c: false },
        { t: 'Bei unverschuldeter Verhinderung – ab dem ersten Tag der Anstellung', c: true },
        { t: 'Nur wenn eine Krankentaggeldversicherung besteht', c: false },
        { t: 'Nur wenn der Arzt eine Vollarbeitsunfähigkeit bestätigt', c: false },
      ],
      explanation: 'Lohnfortzahlung (Art. 324a OR): bereits ab dem 1. Anstellungstag, wenn Verhinderung unverschuldet. Im 1. Jahr mind. 3 Wochen. Die Dauer steigt mit der Anstellungsdauer (Berner Skala, Zürcher Skala oder Basler Skala).',
      difficulty: 'medium',
    },
    {
      q: 'Wer bestimmt den Zeitpunkt der Ferien?',
      opts: [
        { t: 'Der Arbeitnehmer – er kann jederzeit Ferien beziehen', c: false },
        { t: 'Grundsätzlich der Arbeitgeber, unter Rücksichtnahme auf die Wünsche des Arbeitnehmers', c: true },
        { t: 'Eine Kommission aus AG und AN gemeinsam', c: false },
        { t: 'Das Amt für Arbeit', c: false },
      ],
      explanation: 'Art. 329c OR: AG bestimmt den Ferienzeitpunkt (kann Feriensperre aussprechen z.B. Weihnachtsgeschäft), muss aber auf Wünsche des AN Rücksicht nehmen. Ferien dürfen nicht durch Geld abgegolten werden (nur bei Beendigung des Vertrags).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Weisungsgebundenheit beim Arbeitsvertrag?',
      opts: [
        { t: 'Der Arbeitnehmer kann eigenständig entscheiden, wann und wie er arbeitet', c: false },
        { t: 'Der Arbeitnehmer muss die Weisungen des Arbeitgebers im Rahmen des Vertrags befolgen', c: true },
        { t: 'Weisungen sind nur für Vorgesetzte bindend', c: false },
        { t: 'Weisungsgebundenheit gilt nur für Vollzeitangestellte', c: false },
      ],
      explanation: 'Weisungsgebundenheit = charakteristisches Merkmal des Arbeitsvertrags. Der AN ist in den Betrieb eingegliedert und folgt Anweisungen des AG (Arbeitszeit, Arbeitsmethode, Kleiderordnung etc.). Selbständige haben keine Weisungsgebundenheit.',
      difficulty: 'easy',
    },
    {
      q: 'Wann liegt ein Werkvertrag vor – bei einer Friseurin oder einem Arzt?',
      opts: [
        { t: 'Beide sind Aufträge – da kein Erfolg garantiert wird', c: false },
        { t: 'Friseurin = Werkvertrag (Haarschnitt ist das geschuldete Werk); Arzt = Auftrag (kein garantiertes Ergebnis)', c: true },
        { t: 'Friseurin = Auftrag; Arzt = Werkvertrag', c: false },
        { t: 'Beide sind Arbeitsverträge', c: false },
      ],
      explanation: 'Friseurin: schuldet ein konkretes Werk (Haarschnitt). Arzt: schuldet sorgfältige Behandlung, aber keine garantierte Heilung (Auftrag). Zahnarzt, der eine Krone setzt = Werkvertrag. Zahnarzt der berät = Auftrag.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist der Unterschied zwischen Lohn und Gehalt?',
      opts: [
        { t: 'Lohn und Gehalt sind identisch', c: false },
        { t: 'Lohn = stundenweise oder leistungsabhängige Vergütung; Gehalt = fixe monatliche Vergütung', c: true },
        { t: 'Gehalt ist immer höher als Lohn', c: false },
        { t: 'Gehalt gilt nur für Selbständige', c: false },
      ],
      explanation: 'Im Schweizer Sprachgebrauch: Lohn (Stunden- oder Akkordlohn) und Gehalt (Monatspauschale) sind Varianten der Arbeitsentgeltung. Beide unterliegen denselben gesetzlichen Regelungen des Arbeitsvertrags.',
      difficulty: 'easy',
    },
    {
      q: 'Dürfen Ferien während der Krankheit des Arbeitnehmers abgezogen werden?',
      opts: [
        { t: 'Ja, Krankheitstage gelten automatisch als Ferientage', c: false },
        { t: 'Nein – Krankheitstage dürfen nicht als Ferientage angerechnet werden', c: true },
        { t: 'Nur wenn der Arbeitnehmer keine Arztzeugnisse vorlegt', c: false },
        { t: 'Nur bei längerem Krankenstand über 3 Wochen', c: false },
      ],
      explanation: 'Krankheit während Ferien: Bewiesene Krankheitstage dürfen nicht als Ferientage gezählt werden (Art. 329b OR). Der AN muss einen Arzt aufsuchen. Die verpassten Ferientage werden nachgeholt.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist ein GAV (Gesamtarbeitsvertrag)?',
      opts: [
        { t: 'Ein individueller Arbeitsvertrag zwischen AG und AN', c: false },
        { t: 'Ein kollektiver Vertrag zwischen Arbeitgeberverbänden und Gewerkschaften mit verbesserten Mindestbedingungen', c: true },
        { t: 'Ein staatlicher Mindestlohn für alle Branchen', c: false },
        { t: 'Ein Vertrag über die Arbeitszeiten im gesamten Betrieb', c: false },
      ],
      explanation: 'GAV = Gesamtarbeitsvertrag: zwischen Arbeitgeberverbänden und Gewerkschaften ausgehandelt. Legt Mindestlöhne, Arbeitszeiten, Ferien usw. fest. Geht dem OR vor, wenn er besser ist als das Gesetz.',
      difficulty: 'hard',
    },
    {
      q: 'Was schuldet der Arbeitgeber bei ungerechtfertigter Kündigung?',
      opts: [
        { t: 'Nichts – er darf jederzeit kündigen', c: false },
        { t: 'Schadenersatz bis zu 6 Monatslöhnen bei missbräuchlicher Kündigung', c: true },
        { t: 'Lebenslange Rente für den Arbeitnehmer', c: false },
        { t: 'Automatische Wiederanstellung', c: false },
      ],
      explanation: 'Missbräuchliche Kündigung (Art. 336 OR): z.B. wegen Gewerkschaftsmitgliedschaft, Schwangerschaft. Nicht nichtig, aber Entschädigung bis 6 Monatslöhne. Kündigung in Unzeit (Art. 336c OR) kann aufgeschoben werden.',
      difficulty: 'hard',
    },
  ])

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 7: GESELLSCHAFTSRECHT & HANDELSREGISTER (QSP)
  // Stadlin/Riemek/König, Kapitel 2.1 / 2.2 / 3.1 / 3.2 / 3.3 / 3.5 / 3.6
  // ─────────────────────────────────────────
  const tGesRecht = await prisma.topic.create({
    data: {
      slug: 'gesellschaftsrecht-handelsregister',
      title: 'Gesellschaftsrecht & Handelsregister',
      description: 'Rechtsformen: EK, GmbH, AG, Genossenschaft, Handelsregister – QSP',
      icon: 'Building2',
      color: 'slate',
      examType: 'querschnitt',
      category: 'recht',
      order: 7,
    },
  })

  const chRechtsformen = await prisma.chapter.create({
    data: {
      slug: 'rechtsformen-unternehmen',
      title: 'Rechtsformen der Unternehmen',
      subtitle: 'Einzelunternehmung, GmbH, AG, Kollektivgesellschaft',
      topicId: tGesRecht.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 7. Gesellschaftsrecht und Handelsregister

## 7.1 Grundfrage bei der Wahl der Rechtsform

- Wie unabhängig will ich sein? Wie viel Kapital steht zur Verfügung?
- Wer soll haften? Wie hoch ist das Risiko?

## 7.2 Einfache Gesellschaft

- Keine juristische Person, formlos möglich, subsidiäre Gesellschaftsform
- Haftung: persönlich und unbeschränkt

## 7.3 Kollektivgesellschaft (KG)

- Mind. 2 natürliche Personen, Eintrag im Handelsregister, keine juristische Person
- Haftung: persönlich, unbeschränkt und **solidarisch**

## 7.4 Einzelunternehmen

- Keine juristische Person, einfache Gründung
- Haftung: unbeschränkt mit Privatvermögen
- HR-Pflicht ab CHF 100'000 Jahresumsatz

## 7.5 GmbH

- **Juristische Person**, Mindest-Stammkapital CHF 20'000 (vollständig einzuzahlen)
- Organe: Gesellschafterversammlung, Geschäftsführung
- Haftung: nur Gesellschaftsvermögen (beschränkt)
- Stammanteile: nicht börsenkotiert, Abtretung braucht Zustimmung

## 7.6 Aktiengesellschaft (AG)

- **Juristische Person**, Mindest-Aktienkapital CHF 100'000 (mind. 50% einzuzahlen)
- Organe: Generalversammlung, Verwaltungsrat, Revisionsstelle
- Haftung: nur Gesellschaftsvermögen (beschränkt)
- Aktien frei handelbar (bei börsenkotierten AG)

## 7.7 Handelsregister

- Schafft **Publizität**: Eingetragenes gilt als allen bekannt
- **Konstitutive Wirkung**: AG/GmbH entstehen erst mit Eintrag
- **Deklarative Wirkung**: macht bereits Bestehendes bekannt
- Schafft **Firmenschutz**: keine verwechselbare Firma möglich

## 7.8 Genossenschaft

- Mitglieder sind Eigentümer und Nutzer: ein Mitglied = eine Stimme (demokratisch)
- Ziel: Nutzen der Mitglieder (nicht Kapitalrendite), z.B. Migros, Coop`,
      learningGoals: {
        create: [
          { text: 'Rechtsformen nach Haftung, Kapital und Eigentümerstruktur unterscheiden', order: 1 },
          { text: 'Vor- und Nachteile von GmbH und AG vergleichen', order: 2 },
          { text: 'Handelsregisterpflicht erklären', order: 3 },
          { text: 'Genossenschaft und ihre Merkmale beschreiben', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Einzelunternehmung (EK)', definition: 'Einfachste Rechtsform: eine Person, unbeschränkte Haftung mit Privatvermögen, kein Mindestkapital', order: 1 },
          { term: 'Kollektivgesellschaft (KG)', definition: 'Mind. 2 Personen, alle haften solidarisch und unbeschränkt', order: 2 },
          { term: 'GmbH', definition: 'Gesellschaft mit beschränkter Haftung: min. CHF 20\'000 Stammkapital, Haftung auf Einlage beschränkt', order: 3 },
          { term: 'AG (Aktiengesellschaft)', definition: 'Kapitalgesellschaft: min. CHF 100\'000 Aktienkapital, Aktionäre haften nicht persönlich', order: 4 },
          { term: 'Genossenschaft', definition: 'Selbsthilfeorganisation für Mitglieder (z.B. Migros, Coop); Mitglieder sind Eigentümer', order: 5 },
          { term: 'Handelsregister', definition: 'Öffentliches Register mit Unternehmensinfos (Name, Sitz, Kapital, Organe) – Eintrag Pflicht ab bestimmten Voraussetzungen', order: 6 },
          { term: 'Solidarische Haftung', definition: 'Jeder Gesellschafter haftet für die gesamte Schuld (nicht nur seinen Anteil)', order: 7 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Einzelunternehmung: keine Mindestkapital, unbeschränkte Haftung', order: 1 },
          { text: 'GmbH: min. CHF 20\'000 Stammkapital, Haftung auf Stammkapital beschränkt', order: 2 },
          { text: 'AG: min. CHF 100\'000 Aktienkapital, Aktionäre haften nicht persönlich', order: 3 },
          { text: 'KG: unbeschränkte und solidarische Haftung aller Gesellschafter', order: 4 },
          { text: 'Handelsregisterpflicht: EK ab CHF 100\'000 Umsatz; GmbH/AG immer', order: 5 },
          { text: 'Genossenschaft: ein Mitglied = eine Stimme (demokratisch)', order: 6 },
        ],
      },
      examples: {
        create: [
          { text: 'Handwerkerbetrieb als Einzelunternehmung: geht bankrott → Inhaber verliert auch Privatvermögen', order: 1 },
          { text: 'Start-up als GmbH: Investoren haften max. mit ihrer Stammeinlage', order: 2 },
          { text: 'Migros: Genossenschaft – Kunden sind Mitglieder und Eigentümer', order: 3 },
        ],
      },
    },
  })

  await createQuiz(chRechtsformen.id, [
    {
      q: 'Was ist der Unterschied zwischen Einzelunternehmung und GmbH bei der Haftung?',
      opts: [
        { t: 'Kein Unterschied – beide haften beschränkt', c: false },
        { t: 'Einzelunternehmung: unbeschränkte persönliche Haftung; GmbH: beschränkt auf Stammkapital', c: true },
        { t: 'GmbH haftet stets mit dem gesamten Privatvermögen der Gesellschafter', c: false },
        { t: 'Einzelunternehmung hat immer mehr Kapital als GmbH', c: false },
      ],
      explanation: 'Einzelunternehmung: Inhaber haftet mit dem gesamten Privatvermögen. GmbH: Haftung auf das eingebrachte Stammkapital beschränkt (min. CHF 20\'000).',
      difficulty: 'easy',
    },
    {
      q: 'Wie hoch ist das Mindestkapital einer AG?',
      opts: [
        { t: 'CHF 20\'000', c: false },
        { t: 'CHF 50\'000', c: false },
        { t: 'CHF 100\'000', c: true },
        { t: 'CHF 200\'000', c: false },
      ],
      explanation: 'AG: Mindestaktienkapital CHF 100\'000 (davon mind. 50% eingezahlt = CHF 50\'000). GmbH: Mindeststammkapital CHF 20\'000 (muss vollständig eingezahlt sein).',
      difficulty: 'easy',
    },
    {
      q: 'Was ist das Besondere an der Genossenschaft?',
      opts: [
        { t: 'Sie hat immer mehr als 100 Mitglieder', c: false },
        { t: 'Mitglieder sind gleichzeitig Eigentümer und Kunden; ein Mitglied = eine Stimme', c: true },
        { t: 'Nur staatliche Unternehmen dürfen Genossenschaften gründen', c: false },
        { t: 'Genossenschaften müssen keinen Gewinn erzielen', c: false },
      ],
      explanation: 'Genossenschaft (z.B. Migros, Coop): Mitglieder sind Eigentümer und Nutzer. Demokratisches Prinzip: ein Mitglied = eine Stimme (unabhängig von Kapitalanteil).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Kollektivgesellschaft?',
      opts: [
        { t: 'Eine Kapitalgesellschaft mit beschränkter Haftung', c: false },
        { t: 'Eine Personengesellschaft mit mindestens 2 natürlichen Personen, die solidarisch und unbeschränkt haften', c: true },
        { t: 'Eine staatliche Unternehmensform', c: false },
        { t: 'Eine Gesellschaft ohne Eintragspflicht im Handelsregister', c: false },
      ],
      explanation: 'Kollektivgesellschaft (KG): mind. 2 natürliche Personen, Eintrag im Handelsregister, keine juristische Person. Haftung: alle Gesellschafter haften persönlich, unbeschränkt und solidarisch für alle Schulden.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die einfache Gesellschaft?',
      opts: [
        { t: 'Eine Gesellschaft mit einfacher Buchführung', c: false },
        { t: 'Zusammenschluss von mind. 2 Personen zur Erreichung eines gemeinsamen Zwecks ohne juristische Person', c: true },
        { t: 'Die einfachste Form einer Aktiengesellschaft', c: false },
        { t: 'Eine GmbH mit nur einem Gesellschafter', c: false },
      ],
      explanation: 'Einfache Gesellschaft (Art. 530 OR): subsidiäre Gesellschaftsform. Keine juristische Person, formlos möglich. Haftung persönlich und unbeschränkt. Beispiel: zwei Personen betreiben gemeinsam ein Ladenatelier.',
      difficulty: 'medium',
    },
    {
      q: 'Ist die GmbH eine juristische Person?',
      opts: [
        { t: 'Nein, die GmbH ist eine Personengesellschaft', c: false },
        { t: 'Ja, die GmbH ist eine juristische Person mit eigenem Rechtsstatus', c: true },
        { t: 'Nur wenn mehr als 2 Gesellschafter vorhanden sind', c: false },
        { t: 'Nur wenn das Stammkapital vollständig eingezahlt ist', c: false },
      ],
      explanation: 'GmbH = juristische Person (Kapitalgesellschaft). Sie handelt im eigenen Namen, kann klagen und geklagt werden, hat eigenes Vermögen. Gesellschafter sind von der GmbH rechtlich getrennt (daher beschränkte Haftung).',
      difficulty: 'easy',
    },
    {
      q: 'Welche Organe hat eine AG?',
      opts: [
        { t: 'Gesellschafterversammlung, Geschäftsführung, Beirat', c: false },
        { t: 'Generalversammlung, Verwaltungsrat, Revisionsstelle', c: true },
        { t: 'Aktionäre, CEO, Buchhalter', c: false },
        { t: 'Vorstand, Aufsichtsrat, Geschäftsleitung', c: false },
      ],
      explanation: 'AG-Organe: 1. Generalversammlung (Aktionäre: wählen VR, genehmigen Jahresabschluss), 2. Verwaltungsrat (strategische Führung), 3. Revisionsstelle (Prüfung). Bei kleinen AGs kann auf Revisionsstelle verzichtet werden.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind Stammanteile bei der GmbH?',
      opts: [
        { t: 'Aktien der GmbH, die an der Börse gehandelt werden', c: false },
        { t: 'Anteile am Stammkapital der GmbH – vergleichbar mit Aktien, aber nicht börsenkotiert', c: true },
        { t: 'Das Mindestkapital der GmbH', c: false },
        { t: 'Schulden der GmbH bei Gesellschaftern', c: false },
      ],
      explanation: 'Stammanteile = Anteile am Stammkapital der GmbH. Gesellschafter halten Stammanteile (min. CHF 100 pro Anteil). Im Unterschied zu Aktien sind sie nicht frei handelbar – Abtretung braucht Zustimmung der Gesellschafterversammlung.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die konstitutive Wirkung des Handelsregisters?',
      opts: [
        { t: 'Der Eintrag hat nur informative Bedeutung', c: false },
        { t: 'Der Eintrag ist für das Entstehen bestimmter Rechtswirkungen konstitutiv – z.B. AG und GmbH entstehen erst mit Eintrag', c: true },
        { t: 'Der Eintrag ist für das Steuerrecht relevant', c: false },
        { t: 'Der Eintrag schützt vor Konkurs', c: false },
      ],
      explanation: 'Konstitutive Wirkung: Bestimmte Gesellschaften (AG, GmbH, Genossenschaft) entstehen erst mit dem Handelsregistereintrag. Deklarative Wirkung: Eintrag macht bekannt, was bereits existiert (z.B. Einzelunternehmen).',
      difficulty: 'hard',
    },
    {
      q: 'Wann muss sich ein Einzelunternehmen im Handelsregister eintragen?',
      opts: [
        { t: 'Immer – jedes Einzelunternehmen muss eingetragen sein', c: false },
        { t: 'Ab einem Jahresumsatz von CHF 100\'000', c: true },
        { t: 'Erst nach 3 Jahren Betrieb', c: false },
        { t: 'Nur wenn der Inhaber Schulden hat', c: false },
      ],
      explanation: 'Einzelunternehmen: Handelsregisterpflicht ab CHF 100\'000 Jahresumsatz. Darunter freiwillig möglich. GmbH und AG müssen sich immer eintragen (Eintrag ist konstitutiv für ihre Entstehung).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der grösste Nachteil der Einzelunternehmung?',
      opts: [
        { t: 'Zu viele formelle Vorschriften bei der Gründung', c: false },
        { t: 'Unbeschränkte persönliche Haftung des Inhabers mit dem gesamten Privatvermögen', c: true },
        { t: 'Das Mindestkapital ist sehr hoch', c: false },
        { t: 'Der Inhaber hat keine Entscheidungsfreiheit', c: false },
      ],
      explanation: 'Grösster Nachteil EK: Bei Konkurs haftet der Inhaber mit seinem gesamten Privatvermögen – auch Haus und Ersparnisse können gepfändet werden. Vorteil: einfache Gründung, volle Kontrolle, kein Mindestkapital.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist das Mindestkapital einer GmbH?',
      opts: [
        { t: 'CHF 10\'000', c: false },
        { t: 'CHF 20\'000', c: true },
        { t: 'CHF 50\'000', c: false },
        { t: 'CHF 100\'000', c: false },
      ],
      explanation: 'GmbH: Mindeststammkapital CHF 20\'000 (muss vollständig einbezahlt sein). AG: Mindestaktienkapital CHF 100\'000 (davon mind. 50% = CHF 50\'000 einbezahlt). Wichtig für die Prüfung!',
      difficulty: 'easy',
    },
    {
      q: 'Was ist Firmenschutz im Handelsregister?',
      opts: [
        { t: 'Schutz des Unternehmens vor Diebstahl', c: false },
        { t: 'Eingetragene Firmennamen sind geschützt – andere dürfen keine verwechselbare Firma verwenden', c: true },
        { t: 'Schutz vor staatlichen Eingriffen', c: false },
        { t: 'Schutz der Gesellschafter vor Haftung', c: false },
      ],
      explanation: 'Firmenschutz: Mit Handelsregistereintrag erhält die Firma Schutz. Dritte dürfen keine Firma verwenden, die mit der eingetragenen verwechselt werden kann. Das schützt vor unlauterem Wettbewerb.',
      difficulty: 'medium',
    },
    {
      q: 'Bei welcher Rechtsform haftet kein Gesellschafter persönlich?',
      opts: [
        { t: 'Kollektivgesellschaft', c: false },
        { t: 'AG (Aktiengesellschaft)', c: true },
        { t: 'Einfache Gesellschaft', c: false },
        { t: 'Einzelunternehmung', c: false },
      ],
      explanation: 'AG: nur das Gesellschaftsvermögen haftet. Aktionäre riskieren maximal ihren eingesetzten Betrag (Aktienkauf), haften aber nicht mit Privatvermögen. Gleiches gilt für GmbH-Gesellschafter.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Unterschied zwischen Kapitalgesellschaft und Personengesellschaft?',
      opts: [
        { t: 'Kapitalgesellschaften haben mehr Kapital', c: false },
        { t: 'Kapitalgesellschaften sind juristische Personen mit Haftungsbeschränkung; Personengesellschaften haben persönlich haftende Gesellschafter', c: true },
        { t: 'Personengesellschaften brauchen kein Kapital', c: false },
        { t: 'Kapitalgesellschaften dürfen keine Gewinne ausschütten', c: false },
      ],
      explanation: 'Kapitalgesellschaften (AG, GmbH): juristische Person, Gesellschafter haften nicht persönlich. Personengesellschaften (KG, Einfache Gesellschaft): keine eigenständige Rechtspersönlichkeit, Gesellschafter haften persönlich.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind die Vorteile einer AG gegenüber einer GmbH?',
      opts: [
        { t: 'Tieferes Mindestkapital und einfachere Gründung', c: false },
        { t: 'Bessere Eignung für grössere Unternehmen, einfacherer Eigentümerwechsel durch Aktienhandel, bessere Kapitalaufnahme', c: true },
        { t: 'Weniger formelle Pflichten', c: false },
        { t: 'Höhere Kontrolle der Gesellschafter über das Tagesgeschäft', c: false },
      ],
      explanation: 'AG: Aktien können (bei börsenkotierten AG) einfach gehandelt werden → Eigentümerwechsel ohne aufwendige Anteilsübertragung. Grösserer Kapitalmarkt. Nachteil: teurere Gründung, Mindestkapital CHF 100\'000.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Haftung bei einer Kollektivgesellschaft?',
      opts: [
        { t: 'Beschränkt auf das Gesellschaftskapital', c: false },
        { t: 'Solidarisch und unbeschränkt: jeder Gesellschafter haftet für alle Schulden mit Privatvermögen', c: true },
        { t: 'Jeder Gesellschafter haftet nur für seinen Anteil', c: false },
        { t: 'Der Staat übernimmt die Haftung', c: false },
      ],
      explanation: 'KG-Haftung: solidarisch + unbeschränkt. Solidarisch = Gläubiger können von jedem Gesellschafter den vollen Betrag fordern. Unbeschränkt = auch Privatvermögen. Der zahlende Gesellschafter hat intern einen Regressanspruch.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet, dass das Handelsregister Publizität schafft?',
      opts: [
        { t: 'Alle Bürger sind verpflichtet, das Handelsregister zu lesen', c: false },
        { t: 'Eingetragene Tatsachen gelten als jedermann bekannt – niemand kann sich auf Unkenntnis berufen', c: true },
        { t: 'Unternehmen müssen ihre Bilanzen veröffentlichen', c: false },
        { t: 'Nur grosse Unternehmen müssen Informationen veröffentlichen', c: false },
      ],
      explanation: 'Publizitätswirkung: Was im Handelsregister steht, gilt als allen bekannt. Dritte können sich nicht auf Unkenntnis berufen ("ich wusste nicht, dass die GmbH keinen Vertretungsberechtigten mehr hat").',
      difficulty: 'hard',
    },
    {
      q: 'Welche Rechtsform ist für zwei Freunde geeignet, die gemeinsam ein kleines Café betreiben wollen?',
      opts: [
        { t: 'AG – wegen bester Haftungsbeschränkung', c: false },
        { t: 'GmbH – beschränkte Haftung, einfache Struktur für kleines Unternehmen', c: true },
        { t: 'Kollektivgesellschaft – weil kein Mindestkapital nötig', c: false },
        { t: 'Einzelunternehmung – weil am einfachsten', c: false },
      ],
      explanation: 'GmbH: gute Wahl für kleine bis mittlere Unternehmen mit mehreren Gesellschaftern. Beschränkte Haftung schützt Privatvermögen. Mindeststammkapital CHF 20\'000. Klare rechtliche Struktur. KG wäre möglich, aber unbeschränkte Haftung ist ein grosser Nachteil.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Generalversammlung (GV) der AG?',
      opts: [
        { t: 'Das operative Management der AG', c: false },
        { t: 'Das oberste Organ der AG – alle Aktionäre sind Mitglieder und haben Stimmrecht', c: true },
        { t: 'Das Kontrollgremium für den Verwaltungsrat', c: false },
        { t: 'Eine externe Revisionsgesellschaft', c: false },
      ],
      explanation: 'GV = oberstes Organ: alle Aktionäre stimmen zu wichtigen Beschlüssen (Jahresabschluss, Dividende, VR-Wahl, Statutenänderung). Je mehr Aktien, desto mehr Stimmen (Prinzip Kapitalquote, nicht Kopfquote wie Genossenschaft).',
      difficulty: 'easy',
    },
    {
      q: 'Was ist ein Vorteil der Genossenschaft gegenüber der AG?',
      opts: [
        { t: 'Höheres Kapital und bessere Finanzierungsmöglichkeiten', c: false },
        { t: 'Demokratisches Prinzip (ein Mitglied = eine Stimme) und Ausrichtung auf Mitgliedernutzen, nicht auf Kapitalrendite', c: true },
        { t: 'Tieferes Mindestkapital als AG', c: false },
        { t: 'Weniger Verwaltungsaufwand', c: false },
      ],
      explanation: 'Genossenschaft: Mitglieder sind Eigentümer und Nutzer. Ein Mitglied = eine Stimme (unabhängig von Kapitalanteil). Ziel: Nutzen der Mitglieder, nicht Kapitalrendite. Nachteile: komplexere Struktur, Kapitalbeschaffung schwieriger.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Prokura?',
      opts: [
        { t: 'Eine Art Handelsregistereintrag für kleine Firmen', c: false },
        { t: 'Eine weitgehende Handlungsvollmacht für leitende Angestellte, die im HR eingetragen wird', c: true },
        { t: 'Die persönliche Haftung des Geschäftsführers', c: false },
        { t: 'Ein Sonderrecht für AG-Aktionäre', c: false },
      ],
      explanation: 'Prokura (Art. 458 OR): Vollmacht zur Vornahme aller Handlungen, die der Betrieb eines Handelsgewerbes mit sich bringt. Muss im HR eingetragen werden. Prokurist kann alles ausser: Grundstücke verkaufen und die Prokura übertragen.',
      difficulty: 'hard',
    },
    {
      q: 'Wann muss eine Einzelunternehmung ins Handelsregister eingetragen werden?',
      opts: [
        { t: 'Immer, bei jeder Gründung', c: false },
        { t: 'Ab einem Jahresumsatz von mindestens CHF 100\'000', c: true },
        { t: 'Nur wenn Angestellte beschäftigt werden', c: false },
        { t: 'Nur wenn das Unternehmen mehr als 5 Jahre besteht', c: false },
      ],
      explanation: 'EK: HR-Eintragungspflicht ab CHF 100\'000 Jahresumsatz (Art. 36 HRegV). Darunter ist der Eintrag freiwillig. AG, GmbH, KG: immer Pflichtregistrierung.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist ein Verwaltungsrat (VR) bei der AG?',
      opts: [
        { t: 'Das oberste Organ der AG, das alle Aktionäre vertritt', c: false },
        { t: 'Das leitende und überwachende Organ, das die Geschäftsführung leitet oder an die Direktion delegiert', c: true },
        { t: 'Die Revisionsstelle, die die Bücher prüft', c: false },
        { t: 'Eine externe Beratungsgesellschaft', c: false },
      ],
      explanation: 'VR: Zwischen GV (oberstes Organ) und operativem Management. Hat unübertragbare Aufgaben (Gesamtleitung, Finanzkontrolle, Konstituierung). Kann Geschäftsführung an Direktion delegieren. Mind. 1 Mitglied muss in der Schweiz wohnhaft sein.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Komplementär und Kommanditist?',
      opts: [
        { t: 'Beide haften unbeschränkt', c: false },
        { t: 'Komplementär: unbeschränkte Haftung + Geschäftsführung; Kommanditist: beschränkte Haftung auf Einlage, keine Geschäftsführung', c: true },
        { t: 'Kommanditist haftet unbeschränkt, Komplementär beschränkt', c: false },
        { t: 'Beide Begriffe sind Synonyme', c: false },
      ],
      explanation: 'Kommanditgesellschaft: Komplementär (wie in KG, unbeschränkte Haftung, Geschäftsführung) + Kommanditist (haftet nur bis zur Höhe der Einlage, keine Geschäftsführung). Keine eigene Rechtspersönlichkeit.',
      difficulty: 'hard',
    },
    {
      q: 'Was versteht man unter der Revisionspflicht der AG?',
      opts: [
        { t: 'Alle AG müssen ihre Statuten jährlich überarbeiten', c: false },
        { t: 'AG ab bestimmter Grösse müssen die Jahresrechnung durch eine unabhängige Revisionsstelle prüfen lassen', c: true },
        { t: 'Die GV muss jedes Jahr über die Geschäftsstrategie abstimmen', c: false },
        { t: 'Der VR muss monatlich die Buchhaltung kontrollieren', c: false },
      ],
      explanation: 'Revisionspflicht: Grosse AG (ordentliche Revision durch zugelassene Revisionsexperten), kleinere AG (eingeschränkte Revision). Sehr kleine AG ohne externe Investoren können auf Revision verzichten (Opting-out). Ziel: Schutz der Aktionäre und Gläubiger.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Genossenschaft und wie wird sie geführt?',
      opts: [
        { t: 'Eine AG mit vielen kleinen Aktionären', c: false },
        { t: 'Eine Körperschaft mit variabler Mitgliederzahl und Generalversammlung (ein Mitglied = eine Stimme)', c: true },
        { t: 'Eine Kollektivgesellschaft mit Haftungsbeschränkung', c: false },
        { t: 'Ein staatliches Unternehmen', c: false },
      ],
      explanation: 'Genossenschaft: variable Mitgliederzahl, oberstes Organ = GV (Kopfprinzip: 1 Mitglied = 1 Stimme, unabhängig vom Kapital). Mitglieder sind gleichzeitig Nutzer. Beispiele: Migros, Raiffeisen, Coop.',
      difficulty: 'easy',
    },
    {
      q: 'Welche Funktion hat das Handelsregister für Gläubiger?',
      opts: [
        { t: 'Keine – das HR ist nur für die Unternehmer selbst relevant', c: false },
        { t: 'Gläubiger können prüfen, wer haftbar ist, wie das Kapital der Firma ist und wer zur Unterschrift berechtigt ist', c: true },
        { t: 'Das HR garantiert, dass Schulden bezahlt werden', c: false },
        { t: 'Gläubiger bekommen automatisch Auskunft über die Bonität des Unternehmens', c: false },
      ],
      explanation: 'HR-Funktionen für Gläubiger: Wer führt das Unternehmen? Wer ist unterschriftsberechtigt? Wie hoch ist das Kapital (AG, GmbH)? Wer haftet persönlich? Diese Transparenz schützt Gläubiger im Geschäftsverkehr.',
      difficulty: 'medium',
    },
    {
      q: 'Was passiert, wenn eine GmbH nicht im Handelsregister eingetragen ist?',
      opts: [
        { t: 'Sie kann trotzdem als GmbH tätig sein', c: false },
        { t: 'Sie entsteht als juristische Person erst mit dem HR-Eintrag – vorher keine GmbH', c: true },
        { t: 'Sie gilt automatisch als Einzelunternehmung', c: false },
        { t: 'Die Gesellschafter haften dann wie bei einer AG', c: false },
      ],
      explanation: 'GmbH und AG entstehen als juristische Personen erst mit dem HR-Eintrag. Vor der Eintragung: Vorgesellschaft, die Gründer haften persönlich für Verbindlichkeiten. Die Eintragung ist konstitutiv (rechtsbegründend).',
      difficulty: 'hard',
    },
    {
      q: 'Was ist das Aktienkapital?',
      opts: [
        { t: 'Das gesamte Vermögen der AG inklusive Schulden', c: false },
        { t: 'Das nominale Grundkapital der AG, das durch Ausgabe von Aktien aufgebracht wird', c: true },
        { t: 'Der Gewinn, der an Aktionäre ausgeschüttet wird', c: false },
        { t: 'Der Börsenwert der AG', c: false },
      ],
      explanation: 'Aktienkapital (Nominalwert aller Aktien) = Mindest CHF 100\'000, davon mind. CHF 50\'000 einbezahlt. Wichtig: Aktienkapital ≠ Börsenwert (Marktkapitalisierung). Aktienkapital ist eine Bilanzzahl; Börsenwert schwankt täglich.',
      difficulty: 'medium',
    },
  ])

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 8: FAMILIENRECHT (AP)
  // ─────────────────────────────────────────
  const tFamilienrecht = await prisma.topic.create({
    data: {
      slug: 'familienrecht',
      title: 'Familienrecht',
      description: 'Konkubinat, Ehe, Güterrecht, Scheidung – AP',
      icon: 'Heart',
      color: 'rose',
      examType: 'abschluss',
      category: 'recht',
      order: 8,
    },
  })

  const chFamilienrecht = await prisma.chapter.create({
    data: {
      slug: 'familienrecht-ehe-gueterrecht',
      title: 'Familienrecht',
      subtitle: 'Konkubinat, Ehe, Güterrecht und Scheidungsfolgen',
      topicId: tFamilienrecht.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 8. Familienrecht

## 8.1 Familienrecht und Konkubinat

Familienrecht ist nicht identisch mit Eherecht.
Wichtig ist zunächst die Unterscheidung zwischen:
- Konkubinat
- Ehe

### Konkubinat
Das Konkubinat ist das Zusammenleben eines Paares ohne Eheschliessung.
Rechtlich gilt im Grundsatz **nicht automatisch** das Eherecht.
Oft ist eher über allgemeine Regeln, insbesondere über die **einfache Gesellschaft**, nachzudenken.

### Typische Folgen im Konkubinat
Ohne klare Vereinbarung gibt es oft Probleme bei:
- Eigentum an Möbeln und Vermögen,
- Kostenverteilung,
- Auslagen,
- Schulden,
- Trennung,
- Vorsorge,
- Erbrecht.

### Wichtig
Wer im Konkubinat lebt, sollte heikle Punkte vertraglich regeln:
- Beiträge an den Haushalt
- Eigentum an Gegenständen
- Aufteilung bei Trennung
- Begünstigungen in Vorsorge / Testament

## 8.2 Ehevoraussetzungen

Für eine gültige Ehe braucht es insbesondere:
- Ehefähigkeit
- kein Ehehindernis
- Trauung

### Ehefähigkeit
- Handlungsfähigkeit
- Volljährigkeit

### Ehehindernisse
- Verwandtschaft in gerader Linie
- Geschwister / Halbgeschwister
- enge familienrechtliche Verbindungen
- bestehende Ehe oder bestehende eingetragene Partnerschaft

## 8.3 Ungültigkeit der Ehe

Eine Ehe kann ungültig sein oder angefochten werden, wenn Voraussetzungen fehlen.
Wichtige Fälle:
- Ehehindernis
- Urteilsunfähigkeit
- wesentliche Willensmängel

## 8.4 Wirkung der Ehe: allgemeine Rechte und Pflichten

Mit der Trauung entsteht eine rechtliche Gemeinschaft.
Zentrale Pflichten:
- Beistand und Treue
- Wahrung des Wohls der Gemeinschaft
- gemeinsame Sorge für die Familie

## 8.5 Name und Bürgerrecht

Grundsatz:
- beide Ehegatten behalten ihren Namen,
- unter bestimmten Voraussetzungen ist ein gemeinsamer Familienname möglich.

Bürgerrecht:
- Heirat führt nicht automatisch zur Einbürgerung,
- es gibt aber erleichterte Einbürgerungsmöglichkeiten.

## 8.6 Eherechtliche Gemeinschaft

### Eheliche Wohnung
Fragen:
- wer darf über die Wohnung verfügen?
- wer darf kündigen?
- wann braucht es Zustimmung?

### Unterhalt der Familie
Die Ehegatten tragen gemeinsam zum Unterhalt bei.
Das kann erfolgen durch:
- Erwerbsarbeit,
- Haushaltsarbeit,
- Kinderbetreuung,
- andere Beiträge.

### Betrag zur freien Verfügung
Wenn ein Ehegatte den Haushalt führt und kein eigenes oder wenig eigenes Einkommen hat, stellt sich die Frage nach einem angemessenen Betrag zur freien Verfügung.

### Berufsausübung
Grundsätzlich darf jeder Ehegatte einen Beruf ausüben. Es braucht aber Rücksichtnahme auf die Ehegemeinschaft.

### Auskunftspflicht
Ehegatten müssen einander über Einkommen, Vermögen und Schulden Auskunft geben.

## 8.7 Vertretung der ehelichen Gemeinschaft

Im Alltag darf ein Ehegatte die Gemeinschaft für laufende Bedürfnisse vertreten.
Beispiele:
- Einkäufe für den täglichen Bedarf

Bei grösseren oder aussergewöhnlichen Geschäften reicht die Vertretungsmacht nicht automatisch.
Dann braucht es Zustimmung oder besondere Ermächtigung.

## 8.8 Haftung

Bei Geschäften für die laufenden Bedürfnisse kann solidarische Haftung entstehen.
Sonst haftet grundsätzlich jeder für eigene Schulden.

## 8.9 Auflösung der Ehe

Die Ehe endet nicht bereits durch Trennung.
Zwei Hauptgründe:
- Tod
- Scheidung

### Folgen der Scheidung
- Auflösung der ehelichen Gemeinschaft
- Regelung der Kinderbelange
- Unterhalt
- güterrechtliche Auseinandersetzung
- Vorsorgeausgleich

## 8.10 Güterrecht

Das Güterrecht beantwortet zwei Kernfragen:
1. Wem gehört welches Vermögen während der Ehe?
2. Wie wird bei Auflösung geteilt?

### Ordentlicher Güterstand: Errungenschaftsbeteiligung
Wichtig sind zwei Vermögensmassen je Ehegatte:
- Eigengut
- Errungenschaft

**Eigengut**:
- was jemand in die Ehe einbringt,
- persönliche Gegenstände,
- Erbschaften,
- Schenkungen.

**Errungenschaft**:
- was während der Ehe entgeltlich erworben wird,
- insbesondere Arbeitseinkommen.

Bei Auflösung wird der Vorschlag grundsätzlich hälftig geteilt.

### Gütergemeinschaft
- gemeinsames Gesamtgut
- nur bestimmte Vermögensteile bleiben Eigengut
- ausserordentlicher Güterstand, braucht Ehevertrag

### Gütertrennung
- Vermögen bleiben getrennt
- ebenfalls ausserordentlicher Güterstand, braucht Ehevertrag

## 8.11 Güterrechtliche Auseinandersetzung

Wichtig:
- kein Problem bei Gütertrennung: keine gegenseitigen Vermögensansprüche aus dem Güterstand
- bei Errungenschaftsbeteiligung muss zwischen Eigengut und Errungenschaft unterschieden werden
- Vermögen muss bewertet werden
- Schulden werden berücksichtigt
- negative Errungenschaft bleibt grundsätzlich bei der betroffenen Person

## 8.12 Unterhalt nach Scheidung

Unterhalt richtet sich nach:
- Einkommen der Ehegatten,
- Bedarf / Lebenshaltung,
- Zumutbarkeit,
- Erwerbsmöglichkeiten,
- Kinderbetreuung,
- bisherigen Rollenverteilungen.

Besonders wichtig:
- Kinderunterhalt geht vor,
- Eigenversorgungskapazität spielt grosse Rolle,
- wirtschaftlich schwächere Partei kann Anspruch haben.`,
      learningGoals: {
        create: [
          { text: 'Konkubinat von der Ehe abgrenzen', order: 1 },
          { text: 'Ehevoraussetzungen und Ehehindernisse nennen', order: 2 },
          { text: 'Güterrecht (Errungenschaftsbeteiligung) anwenden', order: 3 },
          { text: 'Scheidungsfolgen erklären', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Konkubinat', definition: 'Zusammenleben ohne Eheschliessung – Eherecht gilt nicht automatisch', order: 1 },
          { term: 'Errungenschaftsbeteiligung', definition: 'Ordentlicher Güterstand: Eigengut bleibt getrennt, Errungenschaft wird hälftig geteilt', order: 2 },
          { term: 'Eigengut', definition: 'In die Ehe eingebrachtes Vermögen, persönliche Gegenstände, Erbschaften, Schenkungen', order: 3 },
          { term: 'Errungenschaft', definition: 'Während der Ehe entgeltlich erworbenes Vermögen, insbesondere Arbeitseinkommen', order: 4 },
          { term: 'Gütergemeinschaft', definition: 'Ausserordentlicher Güterstand: gemeinsames Gesamtgut, braucht Ehevertrag', order: 5 },
          { term: 'Gütertrennung', definition: 'Ausserordentlicher Güterstand: Vermögen bleibt getrennt, braucht Ehevertrag', order: 6 },
          { term: 'Vorsorgeausgleich', definition: 'Ausgleich der Vorsorge (Pensionskasse) bei Scheidung', order: 7 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Konkubinat: kein automatisches Eherecht – vertragliche Regelung nötig', order: 1 },
          { text: 'Ehevoraussetzungen: Ehefähigkeit + kein Ehehindernis + Trauung', order: 2 },
          { text: 'Ordentlicher Güterstand = Errungenschaftsbeteiligung', order: 3 },
          { text: 'Eigengut wird nicht geteilt; Errungenschaft (Vorschlag) wird hälftig geteilt', order: 4 },
          { text: 'Scheidungsfolgen: Güterrecht, Unterhalt, Kinderbelange, Vorsorgeausgleich', order: 5 },
        ],
      },
      examples: {
        create: [
          { text: 'Konkubinatspaar trennt sich: ohne Vertrag unklare Eigentumsverhältnisse → kein gesetzliches Erbrecht', order: 1 },
          { text: 'Ehegatte A bringt CHF 50\'000 mit (Eigengut), verdient CHF 200\'000 in der Ehe (Errungenschaft). Bei Scheidung: nur die Errungenschaft wird hälftig geteilt.', order: 2 },
        ],
      },
    },
  })

  await createQuiz(chFamilienrecht.id, [
    {
      q: 'Was ist ein Konkubinat?',
      opts: [
        { t: 'Eine eingetragene Partnerschaft', c: false },
        { t: 'Zusammenleben ohne Eheschliessung – Eherecht gilt nicht automatisch', c: true },
        { t: 'Eine kirchliche Ehe ohne Zivilstandsamt', c: false },
        { t: 'Eine besondere Form der Ehe für Ausländer', c: false },
      ],
      explanation: 'Konkubinat: Zusammenleben ohne Eheschliessung. Das Eherecht gilt nicht automatisch. Wichtige Fragen (Eigentum, Erbrecht, Vorsorge) müssen vertraglich geregelt werden.',
      difficulty: 'easy',
    },
    {
      q: 'Was sind typische Probleme im Konkubinat ohne vertragliche Regelung?',
      opts: [
        { t: 'Keine – das Eherecht gilt automatisch auch für Konkubinatspaare', c: false },
        { t: 'Unklare Eigentumsverhältnisse, kein gesetzliches Erbrecht, keine Vorsorge des Partners', c: true },
        { t: 'Höhere Steuern als verheiratete Paare', c: false },
        { t: 'Keine sozialversicherungsrechtlichen Leistungen', c: false },
      ],
      explanation: 'Konkubinat: Das Eherecht gilt nicht automatisch. Keine gesetzliche Erbberechtigung (ohne Testament), kein Güterrecht, keine AHV-Witwenrente, unklare Eigentumsverhältnisse bei Trennung. Lösung: vertragliche Regelungen und Testament.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind Ehevoraussetzungen nach Schweizer Recht?',
      opts: [
        { t: 'Gemeinsamer Wohnsitz und gleiches Einkommen', c: false },
        { t: 'Ehefähigkeit (Handlungsfähigkeit), kein Ehehindernis und Trauung', c: true },
        { t: 'Zustimmung der Eltern und Mindesteinkommensnachweis', c: false },
        { t: 'Schweizer Staatsbürgerschaft beider Parteien', c: false },
      ],
      explanation: 'Ehevoraussetzungen (Art. 94-96 ZGB): Ehefähigkeit (Volljährigkeit + Urteilsfähigkeit), kein Ehehindernis (Verwandtschaft, bestehende Ehe), Trauung vor dem Zivilstandsamt.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind Ehehindernisse?',
      opts: [
        { t: 'Finanzielle Schwierigkeiten eines Partners', c: false },
        { t: 'Enge Verwandtschaft, bestehende Ehe oder eingetragene Partnerschaft', c: true },
        { t: 'Altersunterschied von mehr als 20 Jahren', c: false },
        { t: 'Verschiedene Nationalitäten', c: false },
      ],
      explanation: 'Ehehindernisse (Art. 95 ZGB): Verwandtschaft in gerader Linie (Eltern-Kind), Geschwister und Halbgeschwister, bestehende Ehe oder eingetragene Partnerschaft. Fehlende Volljährigkeit ist ein weiteres Hindernis.',
      difficulty: 'medium',
    },
    {
      q: 'Wie entsteht eine Ehe in der Schweiz?',
      opts: [
        { t: 'Durch kirchliche Trauung', c: false },
        { t: 'Durch Trauung vor dem Zivilstandsamt', c: true },
        { t: 'Durch gemeinsamen Wohnsitz über 5 Jahre', c: false },
        { t: 'Durch Registrierung im Handelsregister', c: false },
      ],
      explanation: 'Ehe: zwingend vor dem Zivilstandsamt (zivile Trauung). Kirchliche Trauung hat keine rechtliche Wirkung. Seit 2022 können auch gleichgeschlechtliche Paare in der Schweiz heiraten.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der ordentliche Güterstand in der Schweiz?',
      opts: [
        { t: 'Gütertrennung – alle Vermögenswerte bleiben getrennt', c: false },
        { t: 'Errungenschaftsbeteiligung – Eigengut bleibt getrennt, Errungenschaft wird hälftig geteilt', c: true },
        { t: 'Gütergemeinschaft – alle Vermögen werden zusammengelegt', c: false },
        { t: 'Taschengeldregime – beide behalten ihr Einkommen vollständig', c: false },
      ],
      explanation: 'Ordentlicher Güterstand = Errungenschaftsbeteiligung (Art. 196 ff. ZGB). Eigengut (mitgebracht, geerbt, geschenkt) bleibt privat. Errungenschaft (Arbeitseinkommen während der Ehe) wird bei Auflösung hälftig geteilt.',
      difficulty: 'medium',
    },
    {
      q: 'Was gehört zum Eigengut eines Ehegatten?',
      opts: [
        { t: 'Alles, was während der Ehe erworben wird', c: false },
        { t: 'Was in die Ehe eingebracht wurde, persönliche Gegenstände, Erbschaften und Schenkungen', c: true },
        { t: 'Nur das Geld, das man selbst verdient hat', c: false },
        { t: 'Alle Sparguthaben des Ehegatten', c: false },
      ],
      explanation: 'Eigengut (Art. 198 ZGB): In die Ehe eingebrachtes Vermögen, persönliche Gegenstände (Kleider, Hobby), Erbschaften und Schenkungen, Genugtuungsleistungen. Wird bei Scheidung nicht geteilt.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Errungenschaft im Güterrecht?',
      opts: [
        { t: 'Das Eigengut des Ehegatten', c: false },
        { t: 'Vermögen, das entgeltlich während der Ehe erworben wird, insbesondere Arbeitseinkommen', c: true },
        { t: 'Alle Schulden, die während der Ehe gemacht wurden', c: false },
        { t: 'Gemeinschaftliches Eigentum an der Familienwohnung', c: false },
      ],
      explanation: 'Errungenschaft (Art. 197 ZGB): insbesondere Arbeitseinkommen, Ersparnisse aus dem Erwerbseinkommen, Kapitalerträge auf der Errungenschaft. Bei Scheidung werden die Vorschläge (Errungenschaft nach Abzug der Schulden) hälftig geteilt.',
      difficulty: 'medium',
    },
    {
      q: 'Was gehört zum Eigengut bei der Errungenschaftsbeteiligung?',
      opts: [
        { t: 'Alles, was während der Ehe angeschafft wurde', c: false },
        { t: 'In die Ehe eingebrachtes Vermögen, Erbschaften, Schenkungen und persönliche Gegenstände', c: true },
        { t: 'Nur der gemeinsame Wohnsitz', c: false },
        { t: 'Das gemeinsame Einkommen beider Ehegatten', c: false },
      ],
      explanation: 'Eigengut (Art. 198 ZGB): Vorehe-Vermögen, Erbschaften, Schenkungen, Schadenersatz für Körperverletzung, persönliche Gebrauchsgegenstände. Errungenschaft: Arbeitseinkommen, Ersparnisse, während der Ehe Angeschafftes.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die güterrechtliche Auseinandersetzung bei der Scheidung?',
      opts: [
        { t: 'Die Aufteilung der Schulden', c: false },
        { t: 'Die Bestimmung, wer welches Vermögen bekommt, basierend auf Eigengut und Errungenschaft', c: true },
        { t: 'Die Aufteilung der gemeinsamen Kinder', c: false },
        { t: 'Die Regelung des Unterhalts nach der Scheidung', c: false },
      ],
      explanation: 'Güterrechtliche Auseinandersetzung: Eigengut bleibt beim jeweiligen Ehegatten. Errungenschaft jedes Ehegatten wird berechnet (Aktiven minus Schulden = Vorschlag). Die Vorschläge werden hälftig geteilt. Wer mehr Errungenschaft hat, muss ausgleichen.',
      difficulty: 'hard',
    },
    {
      q: 'Was regelt das Güterrecht?',
      opts: [
        { t: 'Die Erbfolge nach dem Tod eines Ehegatten', c: false },
        { t: 'Wem welches Vermögen gehört während der Ehe und wie es bei Auflösung aufgeteilt wird', c: true },
        { t: 'Die Unterhaltspflichten nach der Scheidung', c: false },
        { t: 'Die Haftung der Ehegatten für gemeinsame Schulden', c: false },
      ],
      explanation: 'Güterrecht: zwei Kernfragen: 1. Wem gehört was während der Ehe? 2. Wie wird aufgeteilt bei Scheidung oder Tod? Ordentlicher Güterstand = Errungenschaftsbeteiligung. Ausserordentlich: Gütergemeinschaft oder Gütertrennung (braucht Ehevertrag).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Gütergemeinschaft und Gütertrennung?',
      opts: [
        { t: 'Beide sind identisch – nur verschiedene Namen', c: false },
        { t: 'Gütergemeinschaft: gemeinsames Gesamtgut; Gütertrennung: Vermögen bleibt vollständig getrennt – beides braucht Ehevertrag', c: true },
        { t: 'Gütergemeinschaft ist der ordentliche Güterstand', c: false },
        { t: 'Gütertrennung bedeutet, dass das Eigengut geteilt wird', c: false },
      ],
      explanation: 'Ausserordentliche Güterstände (brauchen Ehevertrag): Gütergemeinschaft (gemeinsames Gesamtgut, nur bestimmte Teile bleiben Eigengut) oder Gütertrennung (alle Vermögen bleiben getrennt, keine Teilung bei Auflösung).',
      difficulty: 'hard',
    },
    {
      q: 'Was sind die Folgen einer Scheidung?',
      opts: [
        { t: 'Nur die Aufteilung des gemeinsamen Eigentums', c: false },
        { t: 'Güterrechtliche Auseinandersetzung, Unterhalt, Kinderbelange und Vorsorgeausgleich', c: true },
        { t: 'Automatischer Verlust des gemeinsamen Wohnsitzes', c: false },
        { t: 'Keine rechtlichen Folgen – die Ehe endet einfach', c: false },
      ],
      explanation: 'Scheidungsfolgen: 1. Güterrechtliche Auseinandersetzung (Eigengut/Errungenschaft), 2. Unterhalt (Kindesunterhalt und nachehelicher Unterhalt), 3. Kinderbelange (Obhut, Besuchsrecht), 4. Vorsorgeausgleich (Pensionskasse).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Vorsorgeausgleich bei der Scheidung?',
      opts: [
        { t: 'Die Aufteilung der AHV-Rente', c: false },
        { t: 'Die hälftige Teilung der während der Ehe angesammelten Pensionskassenguthaben', c: true },
        { t: 'Ein freiwilliger Ausgleich zwischen den Ehegatten', c: false },
        { t: 'Die Übertragung der beruflichen Vorsorge auf die Kinder', c: false },
      ],
      explanation: 'Vorsorgeausgleich (Art. 122 ZGB): Die während der Ehe angesammelten Pensionskassenguthaben (BVG) werden hälftig geteilt. Ziel: Ausgleich dafür, dass ein Ehegatte zugunsten der Familie auf Erwerbsarbeit verzichtet hat.',
      difficulty: 'hard',
    },
    {
      q: 'Wann haben Ehegatten Anspruch auf nachehelichen Unterhalt?',
      opts: [
        { t: 'Immer, automatisch nach der Scheidung', c: false },
        { t: 'Wenn ein Ehegatte wirtschaftlich schwächer ist und Unterhalt zumutbar ist, insbesondere bei Kinderbetreuung oder langer Ehe', c: true },
        { t: 'Nur wenn kein gemeinsames Vermögen vorhanden ist', c: false },
        { t: 'Nur für maximal 2 Jahre nach der Scheidung', c: false },
      ],
      explanation: 'Nachehelicher Unterhalt (Art. 125 ZGB): Abhängig von Einkommen, Bedarf, Zumutbarkeit, Eigenversorgungskapazität, Kinderbetreuung und bisheriger Rollenverteilung. Kindesunterhalt geht vor. Wirtschaftlich schwächere Partei kann Anspruch haben.',
      difficulty: 'hard',
    },
  ])

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 9: ERBRECHT (AP)
  // ─────────────────────────────────────────
  const tErbrecht = await prisma.topic.create({
    data: {
      slug: 'erbrecht',
      title: 'Erbrecht',
      description: 'Parentelsystem, Pflichtteile, Testament, Erbvertrag – AP',
      icon: 'Scale',
      color: 'violet',
      examType: 'abschluss',
      category: 'recht',
      order: 9,
    },
  })

  const chErbrecht = await prisma.chapter.create({
    data: {
      slug: 'erbrecht-parentel-pflichtteil',
      title: 'Erbrecht',
      subtitle: 'Parentelsystem, Pflichtteile, Testament und Erbvertrag',
      topicId: tErbrecht.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 9. Erbrecht

## 9.1 Grundidee

Erbrecht regelt, was mit dem Vermögen einer Person nach ihrem Tod geschieht.
Die Logik ist stark von der gesetzlichen Verwandtschaftsordnung geprägt.

## 9.2 Zentrale Begriffe

### Erblasser
Verstorbene Person.

### Erben
Personen, die in die Rechtsstellung des Erblassers eintreten.

### Nachlass
Gesamtheit der vererblichen Rechte und Pflichten.

## 9.3 Gesetzliche Erbfolge

Die gesetzliche Erbfolge folgt dem **Stammprinzip**.

### 1. Stamm
Nachkommen des Erblassers.
Sie schliessen die folgenden Stämme aus.

### 2. Stamm
Eltern und deren Nachkommen.
Kommt nur zum Zug, wenn keine Nachkommen vorhanden sind.

### 3. Stamm
Grosseltern und deren Nachkommen.
Kommt nur zum Zug, wenn auch aus dem 2. Stamm niemand vorhanden ist.

## 9.4 Parentelensystem und Eintrittsrecht

Wenn jemand aus einem Stamm vorverstorben ist, treten seine Nachkommen an seine Stelle.
Das nennt man Eintrittsrecht.

## 9.5 Stellung des überlebenden Ehegatten

Der Ehegatte erbt neben Verwandten mit.
Die Quote hängt davon ab, mit welchem Stamm er konkurriert.

Typische Fälle:
- Ehegatte + Nachkommen
- Ehegatte + Elternstamm
- Ehegatte ohne nähere Verwandte

## 9.6 Pflichtteil und verfügbare Quote

Nicht über den ganzen Nachlass kann frei verfügt werden.
Bestimmte Personen haben Mindestansprüche.

### Pflichtteil
gesetzlich geschützter Mindestanspruch.

### Verfügbare Quote
Teil des Nachlasses, über den der Erblasser frei verfügen darf.

## 9.7 Verfügungen von Todes wegen

### Testament
Einseitige Verfügung.
Formen:
- eigenhändig (handschriftlich, datiert, unterschrieben)
- öffentlich
- unter besonderen Umständen Nottestament

### Erbvertrag
Vertragliche Regelung mit Mitwirkung weiterer Personen.
Regelmässig formeller als das Testament.

## 9.8 Grenzen der Verfügung

Der Erblasser kann nicht frei über Pflichtteile hinweg verfügen.
Wird Pflichtteilsrecht verletzt, kommen Korrekturen in Betracht.

## 9.9 Wichtige Klagen / Korrekturen

### Herabsetzungsklage
Dient dazu, pflichtteilverletzende Verfügungen auf das zulässige Mass zurückzuführen.

### Ungültigkeitsklage
Bei schweren Mängeln einer Verfügung von Todes wegen.

## 9.10 Enterbung

Enterbung ist nur in besonderen, gesetzlich geregelten Fällen möglich.
Nicht jeder familiäre Konflikt reicht aus.

## 9.11 Typische Prüfungslogik im Erbrecht

1. Wer ist gestorben?
2. Gibt es Ehegatten und Nachkommen?
3. Welcher Stamm kommt zum Zug?
4. Gibt es Testament oder Erbvertrag?
5. Sind Pflichtteile betroffen?
6. Wie gross ist die verfügbare Quote?
7. Müssen Verfügungen herabgesetzt oder angefochten werden?`,
      learningGoals: {
        create: [
          { text: 'Parentelsystem und gesetzliche Erbfolge erklären', order: 1 },
          { text: 'Repräsentationsprinzip anwenden', order: 2 },
          { text: 'Pflichtteil berechnen', order: 3 },
          { text: 'Testament und Erbvertrag unterscheiden', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Parentelsystem', definition: 'Gesetzliche Erbfolge in drei Stämmen: Nachkommen → Eltern → Grosseltern', order: 1 },
          { term: 'Erblasser', definition: 'Die verstorbene Person, nach der geerbt wird', order: 2 },
          { term: 'Repräsentationsprinzip', definition: 'Vorverstorbene Erben werden durch ihre Nachkommen ersetzt', order: 3 },
          { term: 'Pflichtteil', definition: 'Gesetzlich garantierter Mindestanteil am Erbe = ½ des gesetzlichen Erbteils', order: 4 },
          { term: 'Testierfreiheit', definition: 'Recht, per Testament über den Nachlass zu verfügen (innerhalb der Pflichtteile)', order: 5 },
          { term: 'Testament', definition: 'Einseitig abänderbarer letzter Wille (handschriftlich oder öffentlich)', order: 6 },
          { term: 'Erbvertrag', definition: 'Bindende, beidseitige Vereinbarung über die Erbfolge', order: 7 },
        ],
      },
      corePoints: {
        create: [
          { text: '1. Stamm: Nachkommen (Art. 457 ZGB) – schliessen alle anderen Stämme aus', order: 1 },
          { text: '2. Stamm: Eltern (Art. 458 ZGB) – nur wenn keine Nachkommen', order: 2 },
          { text: '3. Stamm: Grosseltern (Art. 459 ZGB) – nur wenn kein 1./2. Stamm', order: 3 },
          { text: 'Repräsentation: vorverstorbener Erbe → seine Kinder treten an seine Stelle', order: 4 },
          { text: 'Pflichtteil = ½ × gesetzlicher Erbteil', order: 5 },
          { text: 'Mit Testament kann man Pflichtteile nicht unterschreiten', order: 6 },
        ],
      },
      examples: {
        create: [
          { text: 'Erblasser hat 2 Kinder A und B. B ist vorverstorben und hat 2 Kinder E1, E2 → E1 und E2 erben je ¼ (Repräsentation)', order: 1 },
          { text: 'Nachlass CHF 320\'000, Pflichtteil der Kinder: ½ × gesetzlicher Anteil', order: 2 },
        ],
      },
    },
  })

  await createQuiz(chErbrecht.id, [
    {
      q: 'In welcher Reihenfolge erben die gesetzlichen Erben im Parentelsystem?',
      opts: [
        { t: 'Geschwister → Eltern → Kinder', c: false },
        { t: '1. Stamm: Nachkommen; 2. Stamm: Eltern; 3. Stamm: Grosseltern', c: true },
        { t: 'Eltern → Grosseltern → Nachkommen', c: false },
        { t: 'Nur direkte Nachkommen, alle anderen gehen leer aus', c: false },
      ],
      explanation: 'Parentelsystem (Art. 457–459 ZGB): 1. Nachkommen → 2. Eltern → 3. Grosseltern. Nähere Stämme schliessen fernere vollständig aus.',
      difficulty: 'medium',
    },
    {
      q: 'Wie hoch ist der Pflichtteil im Schweizer Erbrecht?',
      opts: [
        { t: '1/4 des gesetzlichen Erbteils', c: false },
        { t: 'Die Hälfte (1/2) des gesetzlichen Erbteils', c: true },
        { t: '3/4 des gesetzlichen Erbteils', c: false },
        { t: 'Den gesamten gesetzlichen Erbteil', c: false },
      ],
      explanation: 'Der Pflichtteil beträgt ½ des gesetzlichen Erbteils. Er ist der unentziehbare Mindestanteil – auch mit Testament kann man Pflichtteile nicht unterschreiten.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist das Repräsentationsprinzip im Erbrecht?',
      opts: [
        { t: 'Der Erblasser wird durch einen Rechtsanwalt vertreten', c: false },
        { t: 'Vorverstorbene Erben werden durch ihre eigenen Nachkommen ersetzt', c: true },
        { t: 'Das Testament muss von einem Notar vertreten werden', c: false },
        { t: 'Erben müssen persönlich beim Erbgang anwesend sein', c: false },
      ],
      explanation: 'Repräsentationsprinzip: Stirbt ein Erbe vor dem Erblasser, treten seine Nachkommen (Kinder) an seine Stelle und teilen seinen Erbteil unter sich auf.',
      difficulty: 'medium',
    },
    {
      q: 'Wie erbt der überlebende Ehegatte neben Kindern?',
      opts: [
        { t: 'Er erbt nichts – Kinder haben Vorrang', c: false },
        { t: 'Er erbt 1/2 des Nachlasses neben Kindern', c: true },
        { t: 'Er erbt 3/4 des Nachlasses', c: false },
        { t: 'Er erbt alles, bis er wieder heiratet', c: false },
      ],
      explanation: 'Ehegatte + Nachkommen: Ehegatte erbt ½, Nachkommen erben ½ (aufgeteilt untereinander). Ehegatte + Elternstamm: Ehegatte erbt ¾. Ehegatte ohne nähere Verwandte: erbt alles.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist der Unterschied zwischen Testament und Erbvertrag?',
      opts: [
        { t: 'Sie sind identisch – nur verschiedene Bezeichnungen', c: false },
        { t: 'Testament ist einseitig und jederzeit widerrufbar; Erbvertrag ist bilateral und bindend', c: true },
        { t: 'Erbverträge gelten nur für sehr grosse Nachlässe', c: false },
        { t: 'Ein Testament braucht immer einen Notar', c: false },
      ],
      explanation: 'Testament: einseitige Verfügung, jederzeit widerrufbar. Erbvertrag: zwischen mindestens zwei Parteien, öffentlich beurkundet, bindend. Beide können Pflichtteile nicht unterschreiten.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist ein handschriftliches Testament?',
      opts: [
        { t: 'Ein Testament, das am Computer geschrieben und ausgedruckt wird', c: false },
        { t: 'Eigenhändiges Testament: vollständig handgeschrieben, datiert und unterschrieben', c: true },
        { t: 'Ein Testament, das der Notar für den Erblasser schreibt', c: false },
        { t: 'Ein Testament, das nur für bewegliche Sachen gilt', c: false },
      ],
      explanation: 'Eigenhändiges Testament (Art. 505 ZGB): Muss vollständig von Hand geschrieben (nicht getippt!), datiert und unterschrieben sein. Kein Notar nötig. Öffentliches Testament: vom Notar errichtet.',
      difficulty: 'easy',
    },
    {
      q: 'Wer hat im Erbrecht immer einen Pflichtteilsanspruch?',
      opts: [
        { t: 'Alle Verwandten bis zum 3. Grad', c: false },
        { t: 'Nachkommen und der überlebende Ehegatte', c: true },
        { t: 'Nur direkte Kinder, nicht Enkel', c: false },
        { t: 'Eltern und Geschwister', c: false },
      ],
      explanation: 'Pflichtteile haben: Nachkommen (Art. 471 ZGB) und überlebender Ehegatte (Art. 473 ZGB). Eltern haben seit 2023 keinen Pflichtteil mehr. Pflichtteil = ½ des gesetzlichen Erbteils.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist eine Herabsetzungsklage im Erbrecht?',
      opts: [
        { t: 'Eine Klage zur Senkung der Erbschaftssteuer', c: false },
        { t: 'Eine Klage, um pflichtteilsverletzende Verfügungen auf das zulässige Mass zurückzuführen', c: true },
        { t: 'Eine Klage gegen ungerechte Testamente', c: false },
        { t: 'Eine Klage zur Auflösung des Erbvertrags', c: false },
      ],
      explanation: 'Herabsetzungsklage (Art. 522 ZGB): Wenn ein Testament Pflichtteile verletzt (Erblasser gibt zu viel an Dritte), können Pflichtteilsberechtigte die Herabsetzung auf den Pflichtteil verlangen.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist der Erblasser?',
      opts: [
        { t: 'Der Notar, der das Testament erstellt', c: false },
        { t: 'Die verstorbene Person, deren Nachlass geteilt wird', c: true },
        { t: 'Der Haupterbe des Nachlasses', c: false },
        { t: 'Der Testamentsvollstrecker', c: false },
      ],
      explanation: 'Erblasser = die verstorbene Person (de cuius). Das Erbrecht regelt, was mit dem Nachlass (Vermögen, Rechte und Pflichten) des Erblassers geschieht. Erben treten in die Rechtsstellung des Erblassers ein.',
      difficulty: 'easy',
    },
    {
      q: 'Erblasser hat keine Nachkommen, keine Ehegattin und keine Eltern mehr. Wer erbt?',
      opts: [
        { t: 'Der Staat', c: false },
        { t: 'Der 3. Stamm: Grosseltern oder deren Nachkommen', c: true },
        { t: 'Niemand', c: false },
        { t: 'Geschwister im 2. Stamm', c: false },
      ],
      explanation: 'Ohne 1. Stamm (Nachkommen) und ohne 2. Stamm (Eltern sind tot, keine Geschwister vorhanden), kommt der 3. Stamm: Grosseltern oder – wenn auch diese tot – deren Nachkommen (Onkel/Tante, Cousins). Gibt es gar keine Erben, fällt der Nachlass an den Kanton.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist der Nachlass?',
      opts: [
        { t: 'Das Testament des Erblassers', c: false },
        { t: 'Die Gesamtheit der vererblichen Rechte und Pflichten des Erblassers', c: true },
        { t: 'Nur das Bargeld und die Bankguthaben des Erblassers', c: false },
        { t: 'Der Betrag, der nach Abzug der Erbschaftssteuer verbleibt', c: false },
      ],
      explanation: 'Nachlass = alle vererblichen Aktiven (Geld, Immobilien, Gegenstände, Forderungen) und Passiven (Schulden). Erben treten in alle Rechte und Pflichten des Erblassers ein. Schulden werden aus dem Nachlass bezahlt, bevor geteilt wird.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist eine verfügbare Quote im Erbrecht?',
      opts: [
        { t: 'Der Anteil, der dem Staat als Erbschaftssteuer zukommt', c: false },
        { t: 'Der Teil des Nachlasses, über den der Erblasser frei verfügen darf (nach Abzug der Pflichtteile)', c: true },
        { t: 'Der Anteil, der automatisch an den Ehegatten geht', c: false },
        { t: 'Der Mindestanteil jedes Erben', c: false },
      ],
      explanation: 'Verfügbare Quote = Nachlass minus Pflichtteile. Nur über diesen Teil kann der Erblasser im Testament frei verfügen (z.B. für Drittpersonen, Stiftungen). Beispiel: Gesetzlicher Erbteil Kind 50%, Pflichtteil 25%, verfügbare Quote von diesem Kind = 25%.',
      difficulty: 'hard',
    },
    {
      q: 'Was passiert mit dem Pflichtteilsrecht, wenn ein Kind enterbt wird?',
      opts: [
        { t: 'Das Kind verliert automatisch sein Erbrecht', c: false },
        { t: 'Enterbung ist nur in gesetzlich geregelten Ausnahmefällen (z.B. schwere Straftat gegen Erblasser) möglich; sonst bleibt Pflichtteilsanspruch bestehen', c: true },
        { t: 'Das Kind kann die Enterbung nicht anfechten', c: false },
        { t: 'Der Pflichtteil wird verdoppelt', c: false },
      ],
      explanation: 'Enterbung (Art. 477 ZGB): nur bei gesetzlichen Enterbungsgründen möglich (schwere Straftat gegen Erblasser, Verletzung von Familienpflichten). Ohne Enterbungsgrund bleibt der Pflichtteilsanspruch bestehen – das Testament kann den Erbteil auf den Pflichtteil reduzieren, aber nicht darunter.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist das Eintrittsrecht (Repräsentation) im Erbrecht?',
      opts: [
        { t: 'Das Recht des überlebenden Ehegatten, in den Nachlass einzutreten', c: false },
        { t: 'Wenn ein Erbe vor dem Erblasser stirbt, treten dessen Nachkommen an seine Stelle', c: true },
        { t: 'Das Recht des Staates, bei fehlendem Testament einzutreten', c: false },
        { t: 'Die Möglichkeit eines Dritten, anstelle des Erben zu erben', c: false },
      ],
      explanation: 'Eintrittsrecht (Art. 461 ZGB): Vorverstorbene Erben werden durch ihre Nachkommen "ersetzt". Beispiel: Kind stirbt vor dem Erblasser → Enkeln treten an die Stelle des Kindes und teilen dessen Erbteil unter sich auf.',
      difficulty: 'hard',
    },
    {
      q: 'Wie viel erbt der Ehegatte neben den Nachkommen (1. Stamm)?',
      opts: [
        { t: '¼', c: false },
        { t: '½', c: true },
        { t: '¾', c: false },
        { t: 'Alles', c: false },
      ],
      explanation: 'Ehegattenerbrecht (Art. 462 ZGB): Neben 1. Stamm (Nachkommen) → ½. Neben 2. Stamm (Eltern) → ¾. Keine Verwandten → alles. Der Pflichtteil des Ehegatten beträgt ½ seines gesetzlichen Erbteils.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist die Erbunwürdigkeit?',
      opts: [
        { t: 'Wenn ein Erbe zu arm ist, um das Erbe anzunehmen', c: false },
        { t: 'Gesetzlicher Ausschluss vom Erbrecht wegen schwerer Delikte gegen den Erblasser (z.B. vorsätzliche Tötung)', c: true },
        { t: 'Wenn ein Erbe im Ausland wohnt', c: false },
        { t: 'Wenn ein Erbe das Erbe ausschlägt', c: false },
      ],
      explanation: 'Erbunwürdigkeit (Art. 540 ZGB): Wer den Erblasser vorsätzlich oder durch schwere Straftat tötet, testierungsunfähig macht oder das Testament fälscht, ist von Gesetzes wegen erbunwürdig. Gilt auch ohne Gericht – aber muss geltend gemacht werden.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist ein Erbvertrag?',
      opts: [
        { t: 'Ein mündlicher Vertrag über die Erbteilung unter Erben', c: false },
        { t: 'Ein öffentlich beurkundeter Vertrag zwischen Erblasser und Erben, der beide Parteien bindet', c: true },
        { t: 'Ein Testament, das zwei Personen gemeinsam erstellen', c: false },
        { t: 'Ein Vertrag zwischen zwei Erben über ihren Anteil', c: false },
      ],
      explanation: 'Erbvertrag (Art. 494 ZGB): zwingend öffentliche Beurkundung (Notar), bindet beide Parteien. Erblasser kann z.B. auf Verfügungsfreiheit über bestimmtes Vermögen verzichten; Erbe erhält Zusicherung. Kündigung nur mit Zustimmung oder aus wichtigem Grund.',
      difficulty: 'medium',
    },
    {
      q: 'Welche Form muss ein eigenhändiges Testament haben?',
      opts: [
        { t: 'Öffentlich beurkundet durch Notar und zwei Zeugen', c: false },
        { t: 'Vollständig handgeschrieben, datiert und unterzeichnet durch den Erblasser', c: true },
        { t: 'Ausgedruckt, datiert und durch zwei Zeugen beglaubigt', c: false },
        { t: 'Nur eine mündliche Erklärung gegenüber zwei Zeugen', c: false },
      ],
      explanation: 'Eigenhändiges Testament (Art. 505 ZGB): muss vollständig von Hand geschrieben (nicht gedruckt), datiert (Tag, Monat, Jahr) und eigenhändig unterzeichnet sein. Ungültig wenn z.B. teilweise am PC geschrieben. Öffentliches Testament: notariell beurkundet.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Pflichtteil der Nachkommen?',
      opts: [
        { t: '¼ des Nachlasses', c: false },
        { t: '½ ihres gesetzlichen Erbteils', c: true },
        { t: '¾ ihres gesetzlichen Erbteils', c: false },
        { t: 'Ihr gesamter gesetzlicher Erbteil', c: false },
      ],
      explanation: 'Pflichtteil Nachkommen (Art. 471 ZGB): ½ des gesetzlichen Erbteils. Beispiel: Kind hat gesetzlichen Erbteil von 50% → Pflichtteil = 25%. Der Erblasser kann über die verfügbare Quote (25%) frei verfügen. Achtung: Seit 2023 haben Eltern keinen Pflichtteil mehr.',
      difficulty: 'hard',
    },
    {
      q: 'Was versteht man unter Erbteilung?',
      opts: [
        { t: 'Die Berechnung der Erbschaftssteuer', c: false },
        { t: 'Die Aufteilung des Nachlasses unter den Erben nach Erbquoten', c: true },
        { t: 'Das Recht des Erblassers, bestimmte Erben auszuschliessen', c: false },
        { t: 'Die Verwaltung des Nachlasses durch einen Willensvollstrecker', c: false },
      ],
      explanation: 'Erbteilung: nach dem Tod des Erblassers wird der Nachlass auf die Erben aufgeteilt. Jeder Erbe hat einen Anspruch auf seinen Erbanteil gemäss gesetzlicher oder testamentarischer Erbfolge. Die Erben können unter sich teilen oder vor Gericht.',
      difficulty: 'easy',
    },
  ])

  // ═══════════════════════════════════════════════════════
  //  VOLKSWIRTSCHAFTSLEHRE
  // ═══════════════════════════════════════════════════════

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 10: WIRTSCHAFTSKREISLAUF & -LEISTUNG (AP)
  // Wottreng/König, Kapitel 4.1 / 4.2 / 4.3 / 4.4 / 11.4.1 / 11.4.2
  // ─────────────────────────────────────────
  const tWirtschaftskreislauf = await prisma.topic.create({
    data: {
      slug: 'wirtschaftskreislauf-leistung',
      title: 'Wirtschaftskreislauf & -leistung',
      description: 'BIP, Wohlstand vs. Wohlfahrt, Wirtschaftskreislauf – AP',
      icon: 'RefreshCw',
      color: 'cyan',
      examType: 'abschluss',
      category: 'vwl',
      order: 10,
    },
  })

  const chBip = await prisma.chapter.create({
    data: {
      slug: 'bip-wohlstand',
      title: 'BIP & Wohlstand',
      subtitle: 'Bruttoinlandprodukt, Wohlstand vs. Wohlfahrt',
      topicId: tWirtschaftskreislauf.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 10. Wirtschaftskreislauf und -leistung

## 10.1 Mikroökonomie und Makroökonomie

### Mikroökonomie
Betrachtet Einzelentscheidungen von Haushalten und Unternehmen.

### Makroökonomie
Betrachtet die Volkswirtschaft als Ganzes:
- Produktion
- Einkommen
- Preisniveau
- Zinsen
- Staat
- Ausland

## 10.2 Einfacher Wirtschaftskreislauf

Im einfachen Kreislauf stehen zwei Akteure im Zentrum:
- Haushalte
- Unternehmen

### Realstrom
- Haushalte bieten Produktionsfaktoren an
- Unternehmen produzieren Güter und Dienstleistungen

### Geldstrom
- Unternehmen zahlen Einkommen an Haushalte
- Haushalte kaufen Güter und Dienstleistungen

## 10.3 Erweiterter Wirtschaftskreislauf

Der Kreislauf wird ergänzt durch:
- Staat
- Banken / Finanzsektor
- Ausland

### Staat
- erhebt Steuern
- tätigt Ausgaben
- beeinflusst Umverteilung und Nachfrage

### Banken
- vermitteln Kapital
- nehmen Spargelder entgegen
- vergeben Kredite

### Ausland
- Exporte und Importe
- internationale Verflechtung

## 10.4 Produktionsfaktoren

Wichtig sind vor allem:
- Arbeit
- Kapital

Diese werden im Produktionsprozess kombiniert, um Güter und Dienstleistungen herzustellen.

## 10.5 Bruttoinlandprodukt (BIP)

Das BIP misst den **Wert aller im Inland produzierten Endgüter und Dienstleistungen** in einer bestimmten Periode.

Wichtig:
- nur Endprodukte,
- nur im Inland,
- nur innerhalb der betrachteten Periode.

## 10.6 Drei Berechnungsarten des BIP

### Entstehungsseite / Produktionsansatz
Wertschöpfung aller Unternehmen.

### Verwendungsseite / Nachfrageansatz
BIP =
- privater Konsum
- staatlicher Konsum
- Investitionen
- Exporte
- minus Importe

### Einkommensseite / Verteilungsansatz
BIP als Summe von:
- Löhnen
- Zinsen
- Gewinnen
usw.

Alle drei Ansätze führen theoretisch zum gleichen BIP.

## 10.7 Nominales und reales BIP

### Nominales BIP
Mit aktuellen Preisen gemessen.

### Reales BIP
Um Preisveränderungen bereinigt.

Wichtig:
Nur mit dem realen BIP lässt sich feststellen, ob **wirklich mehr produziert** wurde.

## 10.8 LIK und Preisbereinigung

Der Landesindex der Konsumentenpreise (LIK) hilft, Preisveränderungen zu messen.
Damit kann nominale Entwicklung in reale Entwicklung umgerechnet werden.

## 10.9 BIP pro Kopf

BIP pro Kopf = BIP / Bevölkerung.

Es dient dem Ländervergleich, ist aber nur ein grober Indikator.

## 10.10 Wohlstand und Wohlfahrt

### Wohlstand
Materiell messbare Güterversorgung.

### Wohlfahrt
Umfasst zusätzlich qualitative Aspekte, z. B.:
- Gesundheit
- Bildung
- Umweltqualität
- Sicherheit
- Freizeit

Darum ist das BIP nützlich, aber unvollständig.

## 10.11 Typische Prüfungslogik

1. Was wird gemessen?
2. Welche Seite des Kreislaufs ist gemeint?
3. Ist eine Grösse nominal oder real?
4. Was sagt das BIP – und was sagt es nicht?`,
      learningGoals: {
        create: [
          { text: 'BIP nominal und BIP real unterscheiden', order: 1 },
          { text: 'Die drei Berechnungsseiten des BIP erklären', order: 2 },
          { text: 'Wohlstand und Wohlfahrt abgrenzen', order: 3 },
          { text: 'Den Wirtschaftskreislauf zwischen Haushalten und Unternehmen erklären', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'BIP', definition: 'Bruttoinlandprodukt: Marktwert aller Güter/DL, die innerhalb eines Jahres im Inland produziert werden', order: 1 },
          { term: 'BIP nominal', definition: 'BIP berechnet zu laufenden (aktuellen) Preisen – enthält Inflation', order: 2 },
          { term: 'BIP real', definition: 'BIP preisbereinigt – Preisentwicklung (Inflation) herausgerechnet', order: 3 },
          { term: 'BIP pro Kopf', definition: 'BIP geteilt durch Bevölkerungszahl – zeigt durchschnittlichen Wohlstand', order: 4 },
          { term: 'Wohlstand', definition: 'Rein materieller Lebensstandard (quantitativ, einfach messbar)', order: 5 },
          { term: 'Wohlfahrt', definition: 'Umfassenderer Begriff: materiell + qualitativ (Gesundheit, Umwelt, Freiheit)', order: 6 },
          { term: 'Wertschöpfung', definition: 'Mehrwert, der in einer Produktionsstufe geschaffen wird (Umsatz minus Vorleistungen)', order: 7 },
        ],
      },
      corePoints: {
        create: [
          { text: 'BIP = P × M (Preisniveau × Menge aller Güter)', order: 1 },
          { text: 'Für Wachstumsvergleiche: immer BIP real verwenden', order: 2 },
          { text: 'Entstehungsseite: Summe der Wertschöpfung aller Branchen', order: 3 },
          { text: 'Verwendungsseite: Konsum + Investitionen + Staatsausgaben + Nettoexporte', order: 4 },
          { text: 'Einkommensseite: Löhne + Zinsen + Gewinne + Mieten', order: 5 },
          { text: 'Wohlfahrt ist schwerer zu messen als Wohlstand (empirisch komplex)', order: 6 },
        ],
      },
      examples: {
        create: [
          { text: 'Wertschöpfung: Bäcker kauft Mehl für 200 CHF, verkauft Brot für 1000 CHF → Wertschöpfung = 800 CHF', order: 1 },
          { text: 'BIP real/nominal: BIP nominal stieg 5%, Inflation 4% → BIP real ≈ 1% (reales Wachstum)', order: 2 },
        ],
      },
    },
  })

  await createQuiz(chBip.id, [
    {
      q: 'Was ist der Unterschied zwischen BIP nominal und BIP real?',
      opts: [
        { t: 'BIP nominal ist genauer und sollte immer verwendet werden', c: false },
        { t: 'BIP nominal: laufende Preise; BIP real: preisbereinigt (Inflation herausgerechnet)', c: true },
        { t: 'BIP real ist immer höher als BIP nominal', c: false },
        { t: 'Es gibt keinen Unterschied – beide sind identisch', c: false },
      ],
      explanation: 'Für reale Wachstumsvergleiche nutzt man BIP real, weil es die Inflation herausrechnet. BIP nominal kann steigen, ohne dass mehr produziert wird.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Wohlstand und Wohlfahrt?',
      opts: [
        { t: 'Wohlstand ist wichtiger für die Wirtschaftspolitik', c: false },
        { t: 'Wohlstand = rein materiell; Wohlfahrt = materiell + qualitative Aspekte (Umwelt, Gesundheit)', c: true },
        { t: 'Wohlfahrt ist nur für Entwicklungsländer relevant', c: false },
        { t: 'Kein Unterschied – synonyme Begriffe', c: false },
      ],
      explanation: 'Wohlstand (BIP pro Kopf) ist quantitativ messbar. Wohlfahrt umfasst auch Lebensqualität, Gesundheit, Umweltqualität – empirisch schwieriger zu erfassen.',
      difficulty: 'medium',
    },
    {
      q: 'Was misst das BIP (Bruttoinlandprodukt)?',
      opts: [
        { t: 'Den Gewinn aller Unternehmen in einem Land', c: false },
        { t: 'Den Marktwert aller Güter und Dienstleistungen, die innerhalb eines Jahres im Inland produziert werden', c: true },
        { t: 'Das Vermögen aller Bürger eines Landes', c: false },
        { t: 'Den Wert aller Exporte eines Landes', c: false },
      ],
      explanation: 'BIP = Marktwert aller im Inland produzierten Endgüter und Dienstleistungen in einer Periode. Nur Endprodukte (keine Vorleistungen), nur Inland (egal ob Inländer oder Ausländer produziert).',
      difficulty: 'easy',
    },
    {
      q: 'Was ist Wertschöpfung?',
      opts: [
        { t: 'Der Umsatz eines Unternehmens', c: false },
        { t: 'Der Mehrwert einer Produktionsstufe: Umsatz minus Vorleistungen', c: true },
        { t: 'Der Gewinn eines Unternehmens nach Steuern', c: false },
        { t: 'Der BIP-Anteil des Dienstleistungssektors', c: false },
      ],
      explanation: 'Wertschöpfung = Umsatz − Vorleistungen. Bäcker kauft Mehl für CHF 200, verkauft Brot für CHF 1\'000 → Wertschöpfung CHF 800. BIP = Summe aller Wertschöpfungen aller Stufen.',
      difficulty: 'medium',
    },
    {
      q: 'Was umfasst die Verwendungsseite des BIP?',
      opts: [
        { t: 'Löhne + Zinsen + Gewinne + Mieten', c: false },
        { t: 'Privater Konsum + Investitionen + Staatsausgaben + Nettoexporte', c: true },
        { t: 'Wertschöpfung aller Branchen', c: false },
        { t: 'Sparen + Investieren + Konsum', c: false },
      ],
      explanation: 'BIP Verwendungsseite: C (privater Konsum) + I (Investitionen) + G (Staatsausgaben) + NX (Nettoexporte = Exporte minus Importe). Alle drei Seiten (Entstehung, Verwendung, Einkommensseite) müssen dasselbe Ergebnis liefern.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Einkommensseite des BIP?',
      opts: [
        { t: 'Privater Konsum + Staatsausgaben', c: false },
        { t: 'Summe von Löhnen, Zinsen, Gewinnen und Mieten', c: true },
        { t: 'Summe aller Importe und Exporte', c: false },
        { t: 'Staatliche Steuereinnahmen', c: false },
      ],
      explanation: 'Einkommensseite (Verteilungsansatz): Das BIP wird zu Einkommen der Produktionsfaktoren: Löhne (Arbeit), Zinsen (Kapital), Gewinne (Unternehmen), Mieten (Boden). Alle drei BIP-Seiten führen zum gleichen Ergebnis.',
      difficulty: 'medium',
    },
    {
      q: 'Warum ist BIP pro Kopf ein besserer Wohlstandsindikator als das absolute BIP?',
      opts: [
        { t: 'Weil es die Inflation berücksichtigt', c: false },
        { t: 'Weil es Länder mit unterschiedlicher Bevölkerungsgrösse vergleichbar macht', c: true },
        { t: 'Weil es die Wohlfahrt vollständig misst', c: false },
        { t: 'Weil es einfacher zu berechnen ist', c: false },
      ],
      explanation: 'BIP pro Kopf = BIP / Bevölkerung. Ermöglicht Ländervergleiche: Ein kleines Land mit tiefem absolutem BIP kann pro Kopf sehr reich sein. Dennoch bleibt es ein unvollständiger Indikator (kein Mass für Ungleichverteilung, Lebensqualität).',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der einfache Wirtschaftskreislauf?',
      opts: [
        { t: 'Nur der Staat nimmt und gibt Geld', c: false },
        { t: 'Haushalte bieten Produktionsfaktoren, Unternehmen zahlen Löhne; Haushalte kaufen Güter, Unternehmen verkaufen', c: true },
        { t: 'Banken vermitteln zwischen Haushalten und dem Ausland', c: false },
        { t: 'Der Staat besteuert Unternehmen und zahlt Sozialleistungen', c: false },
      ],
      explanation: 'Einfacher Kreislauf: Realstrom (Faktoren: Arbeit, Kapital von HH zu U → Güter/DL von U zu HH) + Geldstrom (Löhne von U zu HH → Konsumausgaben von HH zu U). Erweiterung: + Staat, Banken, Ausland.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Mikroökonomie und Makroökonomie?',
      opts: [
        { t: 'Mikroökonomie = grosse Unternehmen; Makroökonomie = kleine Unternehmen', c: false },
        { t: 'Mikroökonomie = Einzelentscheidungen; Makroökonomie = Volkswirtschaft als Ganzes', c: true },
        { t: 'Mikroökonomie = nationales BIP; Makroökonomie = internationales BIP', c: false },
        { t: 'Mikroökonomie = kurzfristig; Makroökonomie = langfristig', c: false },
      ],
      explanation: 'Mikroökonomie: Entscheidungen einzelner Haushalte und Unternehmen (Preisbildung, Nachfrage). Makroökonomie: Gesamtwirtschaftliche Grössen (BIP, Inflation, Arbeitslosigkeit, Wirtschaftswachstum).',
      difficulty: 'easy',
    },
    {
      q: 'Welche der folgenden Grössen zählt beim BIP der Verwendungsseite zu den Nettoexporten?',
      opts: [
        { t: 'Alle Exporte eines Landes', c: false },
        { t: 'Exporte minus Importe', c: true },
        { t: 'Importe minus Exporte', c: false },
        { t: 'Nur Güterexporte, nicht Dienstleistungsexporte', c: false },
      ],
      explanation: 'Nettoexporte (NX) = Exporte − Importe. Bei mehr Exporten als Importen (Handelsbilanzüberschuss) ist NX positiv → erhöht BIP. Bei mehr Importen (Defizit) ist NX negativ → senkt BIP.',
      difficulty: 'medium',
    },
    {
      q: 'Welche Aspekte werden vom BIP NICHT erfasst?',
      opts: [
        { t: 'Industrieproduktion und Dienstleistungen', c: false },
        { t: 'Unbezahlte Hausarbeit, Ehrenamt, Umweltqualität, Verteilung des Einkommens', c: true },
        { t: 'Importe und Exporte', c: false },
        { t: 'Staatliche Ausgaben für Bildung', c: false },
      ],
      explanation: 'BIP-Kritik: Erfasst keine Schattenarbeit (Hausarbeit, Ehrenamt), Umweltqualität, Einkommensverteilung oder subjektives Wohlbefinden. Deshalb ist BIP ein unvollständiger Wohlfahrtsindikator.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Landesindex der Konsumentenpreise (LIK)?',
      opts: [
        { t: 'Ein Index für die Aktienkurse schweizerischer Unternehmen', c: false },
        { t: 'Ein Messinstrument für die Preisentwicklung eines repräsentativen Warenkorbs der Konsumenten', c: true },
        { t: 'Ein Massstab für das BIP-Wachstum', c: false },
        { t: 'Ein internationaler Vergleich der Kaufkraft', c: false },
      ],
      explanation: 'LIK = Schweizer Konsumentenpreisindex. Misst, wie sich die Preise eines Warenkorbs (Nahrungsmittel, Miete, Energie, etc.) entwickeln. Wird zur Berechnung der Inflationsrate und zur Preisbereinigung des nominalen BIP verwendet.',
      difficulty: 'medium',
    },
    {
      q: 'BIP nominal stieg um 6%, die Inflation betrug 4%. Wie hoch ist das reale BIP-Wachstum ungefähr?',
      opts: [
        { t: '10%', c: false },
        { t: '2%', c: true },
        { t: '6%', c: false },
        { t: '24%', c: false },
      ],
      explanation: 'BIP real ≈ BIP nominal − Inflationsrate = 6% − 4% = 2%. Nur das reale Wachstum zeigt, ob tatsächlich mehr produziert wurde. Nominales Wachstum kann auch durch Preiserhöhungen entstehen.',
      difficulty: 'medium',
    },
    {
      q: 'Welche Ausgabe zählt als Investition im BIP?',
      opts: [
        { t: 'Kauf von Aktien an der Börse', c: false },
        { t: 'Kauf einer neuen Maschine durch ein Unternehmen', c: true },
        { t: 'Kauf von Staatsanleihen', c: false },
        { t: 'Privatkonsum im Supermarkt', c: false },
      ],
      explanation: 'Investitionen (I) = Ausgaben für neue Produktionskapazitäten: Maschinen, Gebäude, Infrastruktur. Börsenkäufe sind Finanztransaktionen (keine neue Produktion) und zählen nicht zum BIP.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind Produktionsfaktoren im Wirtschaftskreislauf?',
      opts: [
        { t: 'Nur Rohstoffe und Energie', c: false },
        { t: 'Arbeit und Kapital (und Boden) – werden von Haushalten angeboten und von Unternehmen genutzt', c: true },
        { t: 'Alle Güter, die produziert werden', c: false },
        { t: 'Staatliche Subventionen an Unternehmen', c: false },
      ],
      explanation: 'Produktionsfaktoren: Arbeit (von Haushalten), Kapital (von Haushalten und Investoren), Boden (von Eigentümern). Im Kreislauf bieten Haushalte diese Faktoren an, Unternehmen nutzen sie für die Produktion.',
      difficulty: 'easy',
    },
    {
      q: 'Was sind qualitative Aspekte der Wohlfahrt, die das BIP nicht misst?',
      opts: [
        { t: 'Bruttoinvestitionen und staatliche Ausgaben', c: false },
        { t: 'Gesundheit, Bildung, Freizeit, Umweltqualität, soziale Sicherheit', c: true },
        { t: 'Import- und Exportmengen', c: false },
        { t: 'Löhne und Zinseinkommen', c: false },
      ],
      explanation: 'Wohlfahrt (umfassend): materieller Lebensstandard + qualitative Aspekte wie Gesundheitszustand, Bildungsqualität, Umweltverschmutzung, Sicherheit, Freizeit, soziale Gerechtigkeit. Das BIP misst nur den materiellen Teil.',
      difficulty: 'easy',
    },
    {
      q: 'Welche Rolle spielen Banken im erweiterten Wirtschaftskreislauf?',
      opts: [
        { t: 'Sie produzieren Güter und Dienstleistungen', c: false },
        { t: 'Sie vermitteln Kapital: nehmen Spargelder entgegen und vergeben Kredite an Unternehmen und Haushalte', c: true },
        { t: 'Sie erheben Steuern für den Staat', c: false },
        { t: 'Sie regulieren den Handel mit dem Ausland', c: false },
      ],
      explanation: 'Banken im Kreislauf: Haushalte sparen → Banken nehmen Einlagen entgegen → Banken vergeben Kredite an Unternehmen (für Investitionen). Ermöglichen Finanzierung über die unmittelbaren Ersparnisse hinaus.',
      difficulty: 'easy',
    },
    {
      q: 'Was passiert mit dem BIP, wenn Haushalte mehr sparen und weniger konsumieren?',
      opts: [
        { t: 'BIP steigt, weil mehr gespart wird', c: false },
        { t: 'BIP sinkt tendenziell, weil der Konsum eine wichtige BIP-Komponente ist', c: true },
        { t: 'BIP bleibt gleich – Sparen und Konsum gleichen sich aus', c: false },
        { t: 'BIP steigt, weil mehr Kapital für Investitionen vorhanden ist', c: false },
      ],
      explanation: 'Sparparadoxon: Mehr Sparen auf individueller Ebene kann gut sein, aber auf gesamtwirtschaftlicher Ebene sinkt der Konsum → sinkt BIP (Verwendungsseite: C sinkt). Langfristig kann mehr Sparen zu mehr Investitionen führen.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist der Unterschied zwischen nominalem und realem BIP?',
      opts: [
        { t: 'Nominales BIP berücksichtigt die Inflation, reales nicht', c: false },
        { t: 'Nominales BIP zu aktuellen Preisen; reales BIP preisbereinigt (inflationsbereinigt)', c: true },
        { t: 'Reales BIP ist immer höher als nominales BIP', c: false },
        { t: 'Beide sind identisch, nur unterschiedliche Bezeichnungen', c: false },
      ],
      explanation: 'Nominales BIP: zu aktuellen Marktpreisen – steigt auch bei Inflation. Reales BIP: inflationsbereinigt, misst echtes Wirtschaftswachstum. Beispiel: Preise +5%, Menge gleich → nominales BIP steigt um 5%, reales BIP bleibt gleich.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist das Bruttonationaleinkommen (BNE)?',
      opts: [
        { t: 'Das BIP abzüglich der Abschreibungen', c: false },
        { t: 'Das Einkommen aller Staatsbürger eines Landes, unabhängig vom Wohnort', c: true },
        { t: 'Das BIP plus Sozialausgaben des Staates', c: false },
        { t: 'Der Wert aller importierten Güter', c: false },
      ],
      explanation: 'BNE (früher BSP): Einkommen aller Inländer (Staatsbürger), egal ob im In- oder Ausland. BNE = BIP + Einkommen Inländer im Ausland – Einkommen Ausländer im Inland. In der Schweiz wichtig wegen vieler im Ausland tätiger Schweizer.',
      difficulty: 'hard',
    },
    {
      q: 'Was sind "Externalitäten" und warum erscheinen sie nicht im BIP?',
      opts: [
        { t: 'Auslandsexporte – die Schweiz exportiert mehr als sie importiert', c: false },
        { t: 'Externe Effekte (positiv/negativ) wie Umweltverschmutzung, die nicht am Markt bewertet werden', c: true },
        { t: 'Ausländische Investitionen in der Schweiz', c: false },
        { t: 'Staatliche Subventionen für Unternehmen', c: false },
      ],
      explanation: 'Externalitäten = externe Effekte ohne Marktpreis: Umweltverschmutzung (negativ), Bildungseffekte (positiv). Das BIP erfasst nur marktmässig bewertete Leistungen. Daher misst BIP nicht vollständig den Wohlstand (Wohlfahrt).',
      difficulty: 'hard',
    },
    {
      q: 'Was ist Volkswohlstand und wie unterscheidet er sich von Volkswirtschaft?',
      opts: [
        { t: 'Volkswohlstand = BIP pro Kopf; Volkswirtschaft = alle wirtschaftlichen Aktivitäten', c: true },
        { t: 'Beide Begriffe sind identisch', c: false },
        { t: 'Volkswohlstand misst Glück, Volkswirtschaft misst Einkommen', c: false },
        { t: 'Volkswohlstand gilt nur für entwickelte Länder', c: false },
      ],
      explanation: 'Volkswohlstand: materieller Lebensstandard einer Bevölkerung, gemessen mit BIP pro Kopf. Volkswirtschaft: das gesamte wirtschaftliche System (Haushalte, Unternehmen, Staat, Ausland). Wohlstand ≠ Wohlfahrt (Lebensqualität).',
      difficulty: 'medium',
    },
    {
      q: 'Was versteht man unter dem "Haushaltssektor" im Wirtschaftskreislauf?',
      opts: [
        { t: 'Die staatlichen Haushalte (Bund, Kanton, Gemeinde)', c: false },
        { t: 'Alle privaten Haushalte (Konsumenten), die Produktionsfaktoren anbieten und Güter nachfragen', c: true },
        { t: 'Die Banken und Finanzinstitute', c: false },
        { t: 'Ausländische Handelspartner der Schweiz', c: false },
      ],
      explanation: 'Haushaltssektor: Private Haushalte bieten Produktionsfaktoren (Arbeit, Kapital, Boden) an → erhalten Faktorentgelte (Lohn, Zins, Miete). Sie verwenden Einkommen für Konsum oder Sparen. Im Kreislauf: Verbindung zu Unternehmen, Staat und Finanzsektor.',
      difficulty: 'easy',
    },
    {
      q: 'Wie wird der Wirtschaftskreislauf durch das Ausland ergänzt?',
      opts: [
        { t: 'Das Ausland kauft nur Schweizer Güter', c: false },
        { t: 'Exporte fliessen in den Kreislauf ein (Einnahmen), Importe fliessen heraus (Ausgaben) – Leistungsbilanz', c: true },
        { t: 'Das Ausland steuert die Schweizer Wirtschaft', c: false },
        { t: 'Das Ausland hat keinen Einfluss auf den Wirtschaftskreislauf', c: false },
      ],
      explanation: 'Erweiterter Kreislauf mit Ausland: Exporte (+) = Einnahmen aus dem Ausland für Schweizer Güter. Importe (-) = Zahlungen ins Ausland für ausländische Güter. Leistungsbilanz: Exporte minus Importe. Schweiz hat traditionell Überschuss.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Wohlstand und Wohlfahrt?',
      opts: [
        { t: 'Wohlstand = materielles Einkommen/BIP pro Kopf; Wohlfahrt = umfassendes Wohlbefinden inkl. Freizeit, Umwelt, Sicherheit', c: true },
        { t: 'Beides ist dasselbe', c: false },
        { t: 'Wohlfahrt = staatliche Sozialleistungen', c: false },
        { t: 'Wohlstand gilt für Reiche, Wohlfahrt für Arme', c: false },
      ],
      explanation: 'Wohlstand: wirtschaftlich-materiell (BIP pro Kopf). Wohlfahrt: umfassender (Freizeit, Umweltqualität, Sicherheit, Gesundheit, soziales Netz). BIP-Wachstum kann Wohlstand steigern, aber Wohlfahrt senken (wenn Umwelt leidet).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist Nettoinlandsprodukt (NIP)?',
      opts: [
        { t: 'BIP plus Importe minus Exporte', c: false },
        { t: 'BIP minus Abschreibungen (Kapitalverzehr)', c: true },
        { t: 'BIP des privaten Sektors ohne Staatstätigkeit', c: false },
        { t: 'BIP plus Sozialleistungen', c: false },
      ],
      explanation: 'NIP = BIP – Abschreibungen. Abschreibungen = Wertminderung des Kapitalstocks (Maschinen, Gebäude). NIP zeigt den echten Nettowertzuwachs. Das BIP "überschätzt" das Wachstum, weil es Abschreibungen nicht abzieht.',
      difficulty: 'hard',
    },
    {
      q: 'Warum wächst das BIP, wenn jemand krank wird und Arztkosten entstehen?',
      opts: [
        { t: 'Das ist eine Schwäche des BIP – es zählt Ausgaben für Heilung als Wachstum, obwohl Wohlfahrt gesunken ist', c: true },
        { t: 'Weil Gesundheit ein wertvolles Gut ist', c: false },
        { t: 'Das BIP wächst nicht durch Krankheit', c: false },
        { t: 'Weil die Arztkosten exportiert werden', c: false },
      ],
      explanation: 'BIP-Kritik: Arztkosten (durch Krankheit) steigern das BIP (Arzt erbringt Leistung), obwohl die Wohlfahrt sinkt. Ebenso: Naturkatastrophen → Wiederaufbaukosten → BIP steigt. BIP misst wirtschaftliche Aktivität, nicht Lebensqualität.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist das BIP nach der Verwendungsrechnung?',
      opts: [
        { t: 'Summe aller Einkommen (Löhne + Gewinne + Mieten)', c: false },
        { t: 'Privater Konsum + Staatlicher Konsum + Investitionen + Exporte – Importe', c: true },
        { t: 'Summe aller Wertschöpfungen der Unternehmen', c: false },
        { t: 'Gesamte Steuereinnahmen des Staates', c: false },
      ],
      explanation: 'Verwendungsrechnung (Ausgabenseite): BIP = C (privater Konsum) + G (Staatskonsum) + I (Investitionen) + X (Exporte) – M (Importe). Drei Methoden geben dasselbe Ergebnis: Entstehungsrechnung, Verwendungsrechnung, Verteilungsrechnung.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet "Pro-Kopf-BIP" und wofür wird es verwendet?',
      opts: [
        { t: 'Das BIP des reichsten 10% der Bevölkerung', c: false },
        { t: 'BIP geteilt durch Einwohnerzahl – Mass für den durchschnittlichen Lebensstandard', c: true },
        { t: 'BIP abzüglich Staatsausgaben', c: false },
        { t: 'Das BIP aller kleinen Länder', c: false },
      ],
      explanation: 'BIP pro Kopf = BIP / Bevölkerung. Erlaubt internationalen Vergleich. Schweiz: eines der höchsten BIP pro Kopf weltweit (ca. CHF 90\'000+). Kritik: zeigt nicht Verteilung (Gini-Koeffizient besser für Ungleichheit).',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Staatssektors Rolle im Wirtschaftskreislauf?',
      opts: [
        { t: 'Der Staat kauft nur Dienstleistungen, keine Güter', c: false },
        { t: 'Der Staat erhebt Steuern und Abgaben, stellt öffentliche Güter bereit und umverteilt Einkommen', c: true },
        { t: 'Der Staat hat keine wirtschaftliche Funktion', c: false },
        { t: 'Der Staat kontrolliert alle Unternehmen im Land', c: false },
      ],
      explanation: 'Staatssektor im Kreislauf: nimmt Steuern (Haushalt, Unternehmen) und Abgaben (Sozialversicherungen) ein. Gibt aus: öffentliche Güter (Schulen, Strassen, Verteidigung), Transferzahlungen (AHV, Sozialhilfe). Wichtiger Kreislaufteilnehmer.',
      difficulty: 'easy',
    },
  ])

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 11: PREISBILDUNG (AP)
  // Wottreng/König, Kapitel 3.1 / 3.2 / 3.3 / 3.4
  // ─────────────────────────────────────────
  const tPreisbildung = await prisma.topic.create({
    data: {
      slug: 'preisbildung',
      title: 'Preisbildung',
      description: 'Angebot & Nachfrage, Marktgleichgewicht, Elastizität, Marktformen – AP',
      icon: 'Tag',
      color: 'emerald',
      examType: 'abschluss',
      category: 'vwl',
      order: 11,
    },
  })

  const chAngebotNachfrage = await prisma.chapter.create({
    data: {
      slug: 'angebot-nachfrage',
      title: 'Angebot & Nachfrage',
      subtitle: 'Marktgleichgewicht, Elastizität und Marktformen',
      topicId: tPreisbildung.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 11. Preisbildung

## 11.1 Grundidee des Marktes

Ein Markt ist der Ort, an dem Angebot und Nachfrage aufeinandertreffen.
Der Preis entsteht durch das Zusammenwirken beider Seiten.

## 11.2 Nachfrage

Die Nachfrage beschreibt, welche Mengen eines Gutes bei verschiedenen Preisen gekauft werden.

### Gesetz der Nachfrage
Steigt der Preis, sinkt die nachgefragte Menge – ceteris paribus.

### Warum?
- Käufer weichen aus
- Nutzen zusätzlicher Einheiten sinkt
- Budget ist begrenzt

## 11.3 Zahlungsbereitschaft

Die Zahlungsbereitschaft ist der maximale Preis, den jemand für eine Einheit zu zahlen bereit ist.
Sie hängt u. a. ab von:
- Einkommen / Ausstattung
- Präferenzen
- Alternativen / Substituten
- Erwartungen
- Dringlichkeit des Bedürfnisses

## 11.4 Opportunitätskosten

Opportunitätskosten sind der Nutzen der **besten nicht gewählten Alternative**.
Sie spielen bei Nachfrageentscheidungen eine wichtige Rolle.

## 11.5 Angebotskurve

Das Angebot beschreibt, welche Mengen Produzenten bei verschiedenen Preisen anbieten.

### Gesetz des Angebots
Steigt der Preis, steigt die angebotene Menge – ceteris paribus.

### Warum?
- Produktion wird lohnender
- zusätzliche Einheiten können rentabel werden
- mehr Anbieter treten ein

## 11.6 Einflussfaktoren auf das Angebot

- Produktionskosten
- Preise von Inputgütern
- Technologie / Produktivität
- Zahl der Anbieter
- Erwartungen
- Staatliche Eingriffe

## 11.7 Marktgleichgewicht

Im Gleichgewicht gilt:
- angebotene Menge = nachgefragte Menge
- kein Druck auf Preisänderungen

Der Gleichgewichtspreis koordiniert Marktteilnehmer.

## 11.8 Verschiebung oder Bewegung auf der Kurve

### Bewegung auf der Kurve
Nur der Preis ändert sich.

### Verschiebung der Kurve
Andere Einflussfaktoren ändern sich.

Das ist im Test zentral.

## 11.9 Nachfrageverschiebungen

Nachfrage steigt bei:
- höherem Einkommen (bei normalen Gütern)
- besseren Erwartungen
- stärkeren Präferenzen
- höheren Preisen von Substituten

Nachfrage sinkt umgekehrt.

## 11.10 Angebotsverschiebungen

Angebot steigt bei:
- tieferen Produktionskosten
- technologischem Fortschritt
- mehr Anbietern

Angebot sinkt umgekehrt.

## 11.11 Preiselastizität der Nachfrage

Sie misst, wie stark die nachgefragte Menge auf Preisänderungen reagiert.

### Elastische Nachfrage
Menge reagiert stärker als der Preis.

### Unelastische Nachfrage
Menge reagiert schwächer als der Preis.

## 11.12 Einflussfaktoren auf die Elastizität

- Vorhandensein von Substituten
- Höhe des Preisanteils am Budget
- Notwendigkeit des Gutes
- Zeit zur Anpassung
- Position auf der Nachfragekurve

## 11.13 Typische Prüfungslogik bei Preisbildung

1. Ist Nachfrage oder Angebot gemeint?
2. Geht es um Bewegung auf der Kurve oder um Kurvenverschiebung?
3. Was passiert mit Preis und Menge im neuen Gleichgewicht?
4. Ist die Nachfrage elastisch oder unelastisch?`,
      learningGoals: {
        create: [
          { text: 'Marktgleichgewicht erklären und grafisch darstellen', order: 1 },
          { text: 'Preiselastizität berechnen und interpretieren', order: 2 },
          { text: 'Voraussetzungen für perfekten Wettbewerb nennen', order: 3 },
          { text: 'Marktformen (Monopol, Oligopol, Polypol) unterscheiden', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Marktgleichgewicht', definition: 'Preis und Menge, bei der angebotene = nachgefragte Menge', order: 1 },
          { term: 'Preiselastizität', definition: '% Änderung Nachfrage / % Änderung Preis – misst Reaktion auf Preisänderungen', order: 2 },
          { term: 'Elastische Nachfrage', definition: 'Preiselastizität > 1: Nachfrage reagiert stark auf Preisänderungen', order: 3 },
          { term: 'Unelastische Nachfrage', definition: 'Preiselastizität < 1: Nachfrage reagiert wenig auf Preisänderungen (z.B. Insulin)', order: 4 },
          { term: 'Perfekter Wettbewerb', definition: 'Homogenes Gut, viele Anbieter/Nachfrager, freier Marktzutritt und perfekte Information', order: 5 },
          { term: 'Monopol', definition: 'Ein Anbieter, viele Nachfrager – Anbieter hat Marktmacht', order: 6 },
          { term: 'Oligopol', definition: 'Wenige Anbieter, viele Nachfrager – z.B. Mobilfunkmarkt Schweiz', order: 7 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Nachfrage: Preis steigt → Nachfrage sinkt (ceteris paribus)', order: 1 },
          { text: 'Angebot: Preis steigt → Angebot steigt (mehr lohnend zu produzieren)', order: 2 },
          { text: 'Gleichgewicht: Schnittpunkt Angebot- und Nachfragekurve', order: 3 },
          { text: 'Elastizität > 1: elastisch (Luxusgüter); < 1: unelastisch (Grundgüter)', order: 4 },
          { text: 'Perfekter Wettbewerb: homogenes Gut + viele Anbieter + freier Zutritt + perfekte Info', order: 5 },
        ],
      },
      examples: {
        create: [
          { text: 'Unelastische Nachfrage: Insulin – selbst bei starkem Preisanstieg bleibt die Nachfrage konstant', order: 1 },
          { text: 'Elastische Nachfrage: Designerhandtaschen – kleiner Preisanstieg führt zu starkem Nachfragerückgang', order: 2 },
          { text: 'Gebrauchtwagen: nicht perfekter Wettbewerb (keine perfekte Information)', order: 3 },
        ],
      },
    },
  })

  await createQuiz(chAngebotNachfrage.id, [
    {
      q: 'Welche Voraussetzungen braucht perfekter Wettbewerb?',
      opts: [
        { t: 'Wenige grosse Anbieter mit staatlicher Preisregulierung', c: false },
        { t: 'Homogenes Gut, viele Anbieter/Nachfrager, freier Marktzutritt, perfekte Information', c: true },
        { t: 'Produktdifferenzierung und starke Markenbindung', c: false },
        { t: 'Staatliche Kontrolle und fixe Preise', c: false },
      ],
      explanation: 'Perfekter Wettbewerb erfordert alle vier Bedingungen gleichzeitig. In der Realität ist er selten vollständig erfüllt.',
      difficulty: 'medium',
    },
    {
      q: 'Was misst die Preiselastizität der Nachfrage?',
      opts: [
        { t: 'Wie stark das Angebot auf Preisänderungen reagiert', c: false },
        { t: 'Die prozentuale Reaktion der Nachfrage auf eine 1%ige Preisänderung', c: true },
        { t: 'Den absoluten Preisunterschied zwischen zwei Gütern', c: false },
        { t: 'Die maximale Zahlungsbereitschaft der Konsumenten', c: false },
      ],
      explanation: 'Preiselastizität = % Änderung Nachfrage / % Änderung Preis. >1: elastisch (Luxus). <1: unelastisch (lebensnotwendige Güter wie Benzin, Medikamente).',
      difficulty: 'medium',
    },
    {
      q: 'Was besagt das Gesetz der Nachfrage?',
      opts: [
        { t: 'Steigt der Preis, steigt die Nachfrage', c: false },
        { t: 'Steigt der Preis, sinkt die nachgefragte Menge (ceteris paribus)', c: true },
        { t: 'Die Nachfrage ist immer konstant', c: false },
        { t: 'Mehr Anbieter erhöhen die Nachfrage', c: false },
      ],
      explanation: 'Gesetz der Nachfrage (Normalfall): Preis steigt → Nachfrage sinkt. Gründe: Ausweichen auf Substitute, sinkendes Budget, abnehmender Grenznutzen. Ausnahme: Giffen-Güter (sehr selten).',
      difficulty: 'easy',
    },
    {
      q: 'Was besagt das Gesetz des Angebots?',
      opts: [
        { t: 'Steigt der Preis, sinkt das Angebot', c: false },
        { t: 'Steigt der Preis, steigt die angebotene Menge', c: true },
        { t: 'Das Angebot ist immer konstant', c: false },
        { t: 'Mehr Anbieter senken den Preis automatisch', c: false },
      ],
      explanation: 'Gesetz des Angebots: Steigt der Preis, lohnt es sich für Produzenten mehr zu produzieren → Angebot steigt. Tieferer Preis → weniger rentabel → Angebot sinkt. Angebotskurve verläuft aufwärts.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist das Marktgleichgewicht?',
      opts: [
        { t: 'Der Preis, bei dem alle Konsumenten zufrieden sind', c: false },
        { t: 'Preis und Menge, bei denen angebotene und nachgefragte Menge übereinstimmen', c: true },
        { t: 'Der tiefste Preis auf dem Markt', c: false },
        { t: 'Ein staatlich regulierter Preis', c: false },
      ],
      explanation: 'Marktgleichgewicht: Schnittpunkt von Angebots- und Nachfragekurve. Kein Überschuss (Angebot > Nachfrage) und kein Mangel (Nachfrage > Angebot). Preis koordiniert Markt.',
      difficulty: 'easy',
    },
    {
      q: 'Was passiert auf dem Markt, wenn der Preis über dem Gleichgewichtspreis liegt?',
      opts: [
        { t: 'Nachfrageüberschuss entsteht', c: false },
        { t: 'Angebotsüberschuss entsteht – Anbieter haben unverkaufte Ware und senken den Preis', c: true },
        { t: 'Angebot und Nachfrage bleiben gleich', c: false },
        { t: 'Der Preis steigt weiter', c: false },
      ],
      explanation: 'Preis zu hoch: Angebotsüberschuss (Anbieter wollen mehr verkaufen als Käufer kaufen wollen). Lager füllen sich → Preisdruck nach unten → Preis sinkt Richtung Gleichgewicht.',
      difficulty: 'medium',
    },
    {
      q: 'Was verschiebt die Nachfragekurve nach rechts (mehr Nachfrage)?',
      opts: [
        { t: 'Preisanstieg des Gutes', c: false },
        { t: 'Einkommenserhöhung der Konsumenten (bei normalen Gütern)', c: true },
        { t: 'Preissenkung des Gutes', c: false },
        { t: 'Steigende Produktionskosten', c: false },
      ],
      explanation: 'Verschiebung der Nachfragekurve (andere Faktoren als der Preis): höheres Einkommen, bessere Erwartungen, stärkere Präferenzen, höhere Preise von Substituten → Nachfrage steigt bei jedem Preis. Preisänderung = Bewegung auf der Kurve.',
      difficulty: 'medium',
    },
    {
      q: 'Was verschiebt die Angebotskurve nach rechts (mehr Angebot)?',
      opts: [
        { t: 'Steigende Rohstoffpreise', c: false },
        { t: 'Tiefere Produktionskosten oder technologischer Fortschritt', c: true },
        { t: 'Weniger Anbieter auf dem Markt', c: false },
        { t: 'Steigende Steuern für Produzenten', c: false },
      ],
      explanation: 'Angebotsverschiebung (andere Faktoren als Preis): tiefere Inputpreise, bessere Technologie, mehr Anbieter → Angebot steigt. Angebot sinkt bei: steigenden Kosten, Steuererhöhungen, weniger Produzenten.',
      difficulty: 'medium',
    },
    {
      q: 'Wie berechnet man die Preiselastizität der Nachfrage?',
      opts: [
        { t: 'Preisänderung / Mengenänderung', c: false },
        { t: '% Mengenänderung / % Preisänderung', c: true },
        { t: 'Mengenänderung × Preisänderung', c: false },
        { t: 'Nachfragemenge × Preis', c: false },
      ],
      explanation: 'Preiselastizität = (ΔQ/Q) / (ΔP/P) = % Mengenänderung / % Preisänderung. Beispiel: Preis +10%, Menge −20% → Elastizität = 20%/10% = 2 → elastisch.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind typische Güter mit unelastischer Nachfrage?',
      opts: [
        { t: 'Luxushandtaschen, Schmuck, Yachten', c: false },
        { t: 'Lebensnotwendige Güter wie Insulin, Elektrizität, Grundnahrungsmittel', c: true },
        { t: 'Urlaubsreisen und Restaurants', c: false },
        { t: 'Elektronikprodukte und Autos', c: false },
      ],
      explanation: 'Unelastische Nachfrage (|E| < 1): Güter ohne nahe Substitute, lebensnotwendig, kleiner Budgetanteil. Insulin: Diabetiker kaufen es unabhängig vom Preis. Preissteigerung → kaum Mengenrückgang.',
      difficulty: 'easy',
    },
    {
      q: 'Was sind typische Güter mit elastischer Nachfrage?',
      opts: [
        { t: 'Benzin und Heizöl', c: false },
        { t: 'Luxusgüter wie teure Restaurantbesuche oder Markenkleidung', c: true },
        { t: 'Trinkwasser', c: false },
        { t: 'Medikamente gegen Bluthochdruck', c: false },
      ],
      explanation: 'Elastische Nachfrage (|E| > 1): Güter mit vielen Substituten, Luxusgüter, grosser Budgetanteil. Preissteigerung → starker Mengenrückgang (Konsumenten weichen aus oder verzichten).',
      difficulty: 'easy',
    },
    {
      q: 'Was ist ein Monopol?',
      opts: [
        { t: 'Viele Anbieter und viele Nachfrager', c: false },
        { t: 'Ein Anbieter (Preismacht) gegenüber vielen Nachfragern', c: true },
        { t: 'Wenige Anbieter, viele Nachfrager', c: false },
        { t: 'Staatlich festgesetzter Preis', c: false },
      ],
      explanation: 'Monopol: Ein Anbieter beherrscht den Markt → Preissetzungsmacht. Kann Preis über den Wettbewerbspreis setzen. Problem: weniger Angebot, höhere Preise, geringere Wohlfahrt.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist ein Oligopol?',
      opts: [
        { t: 'Nur ein Anbieter auf dem Markt', c: false },
        { t: 'Wenige grosse Anbieter, viele Nachfrager – z.B. Schweizer Mobilfunkmarkt', c: true },
        { t: 'Sehr viele kleine Anbieter und viele Nachfrager', c: false },
        { t: 'Ein Markt mit staatlich regulierten Preisen', c: false },
      ],
      explanation: 'Oligopol: Wenige grosse Anbieter (z.B. 3 Mobilfunkanbieter CH: Swisscom, Salt, Sunrise). Gegenseitige Abhängigkeit: Entscheidungen eines Anbieters beeinflussen die anderen. Tendenz zu Preisabsprachen möglich (Kartell).',
      difficulty: 'easy',
    },
    {
      q: 'Was sind Opportunitätskosten?',
      opts: [
        { t: 'Direkte Kosten einer Handlung', c: false },
        { t: 'Der entgangene Nutzen der besten nicht gewählten Alternative', c: true },
        { t: 'Kosten, die nur in besonderen Gelegenheiten entstehen', c: false },
        { t: 'Zufällige Kosten, die nicht geplant werden können', c: false },
      ],
      explanation: 'Opportunitätskosten: Wer CHF 100\'000 in Aktien anlegt, verliert den Zins, den er auf einem Sparkonto erhalten hätte. Diese entgangene Rendite = Opportunitätskosten. Relevant für jede wirtschaftliche Entscheidung.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Zahlungsbereitschaft?',
      opts: [
        { t: 'Der tatsächliche Marktpreis eines Gutes', c: false },
        { t: 'Der maximale Betrag, den ein Konsument für eine Einheit eines Gutes zu zahlen bereit ist', c: true },
        { t: 'Der Preis, den der Produzent mindestens erhalten muss', c: false },
        { t: 'Die minimale Nachfragemenge', c: false },
      ],
      explanation: 'Zahlungsbereitschaft hängt ab von: Einkommen, Präferenzen, Dringlichkeit, verfügbaren Substituten, Erwartungen. Sie bestimmt die Lage der Nachfragekurve. Konsumentenrente = Zahlungsbereitschaft minus tatsächlicher Preis.',
      difficulty: 'medium',
    },
    {
      q: 'Was passiert mit dem Gleichgewichtspreis, wenn das Angebot steigt und die Nachfrage konstant bleibt?',
      opts: [
        { t: 'Der Preis steigt', c: false },
        { t: 'Der Preis sinkt', c: true },
        { t: 'Der Preis bleibt gleich', c: false },
        { t: 'Die Gleichgewichtsmenge sinkt', c: false },
      ],
      explanation: 'Angebotserhöhung (rechte Verschiebung): mehr Angebot bei gleichbleibender Nachfrage → Angebotsüberschuss → Preisdruck → neuer Gleichgewichtspreis tiefer. Gleichgewichtsmenge steigt.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist eine Bewegung auf der Nachfragekurve?',
      opts: [
        { t: 'Wenn sich das Einkommen der Konsumenten ändert', c: false },
        { t: 'Wenn sich der Preis des Gutes ändert und die Nachfragemenge entsprechend reagiert', c: true },
        { t: 'Wenn die Anzahl der Anbieter zunimmt', c: false },
        { t: 'Wenn sich die Präferenzen der Konsumenten verändern', c: false },
      ],
      explanation: 'Bewegung AUF der Kurve: nur der Preis ändert sich → Menge passt sich an. VERSCHIEBUNG der Kurve: andere Faktoren ändern sich (Einkommen, Präferenzen, Erwartungen, Substitute). Diese Unterscheidung ist prüfungsrelevant!',
      difficulty: 'medium',
    },
    {
      q: 'Welche Marktform kommt dem perfekten Wettbewerb in der Realität am nächsten?',
      opts: [
        { t: 'Der Mobilfunkmarkt (Oligopol)', c: false },
        { t: 'Der Markt für Weizen oder Aktien (viele Anbieter, homogenes Gut, gute Information)', c: true },
        { t: 'Der Pharmasektor (patentgeschützte Medikamente)', c: false },
        { t: 'Der Markt für Betriebssysteme', c: false },
      ],
      explanation: 'Perfekter Wettbewerb: homogenes Gut, viele kleine Anbieter/Nachfrager, freier Marktzutritt, perfekte Information. Rohstoffmärkte (Weizen, Kupfer) oder Aktienmärkte kommen diesem Ideal nahe.',
      difficulty: 'hard',
    },
    {
      q: 'Was erhöht die Preiselastizität der Nachfrage?',
      opts: [
        { t: 'Fehlen von Substituten für das Gut', c: false },
        { t: 'Viele verfügbare Substitute und grosser Anteil am Budget', c: true },
        { t: 'Lebensnotwendigkeit des Gutes', c: false },
        { t: 'Kurzer Zeithorizont', c: false },
      ],
      explanation: 'Elastizität steigt bei: vielen Substituten (Ausweichen möglich), grossem Budgetanteil (Konsumenten reagieren stark), Luxusgütern, längerem Zeithorizont (Anpassung möglich). Sinkt bei: Notwendigkeit, keine Substitute.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist ceteris paribus?',
      opts: [
        { t: 'Ein lateinischer Begriff für "alles bleibt konstant"', c: false },
        { t: 'Ein ökonomisches Analyseprinzip: alle anderen Faktoren werden konstant gehalten', c: true },
        { t: 'Eine spezielle Kurvenform in der Wirtschaftsanalyse', c: false },
        { t: 'Das Gleichgewicht zwischen Angebot und Nachfrage', c: false },
      ],
      explanation: 'Ceteris paribus (= "alles andere gleich"): Wenn wir den Einfluss des Preises auf die Nachfrage analysieren, halten wir alle anderen Faktoren (Einkommen, Präferenzen, etc.) konstant. So können kausale Zusammenhänge isoliert werden.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist das Gesetz des abnehmenden Grenznutzens?',
      opts: [
        { t: 'Jede weitere Einheit eines Gutes bringt mehr Nutzen als die vorherige', c: false },
        { t: 'Jede weitere konsumierte Einheit eines Gutes bringt geringeren Zusatznutzen als die vorherige', c: true },
        { t: 'Der Nutzen sinkt, wenn der Preis steigt', c: false },
        { t: 'Der Preis eines Gutes sinkt, wenn mehr produziert wird', c: false },
      ],
      explanation: 'Gesetz des abnehmenden Grenznutzens: 1. Glas Wasser bei Durst → hoher Nutzen. 2. Glas → etwas weniger. 10. Glas → kaum Nutzen. Erklärt die negative Steigung der Nachfragekurve: höherer Preis → Konsument kauft weniger.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet Elastizität der Nachfrage?',
      opts: [
        { t: 'Die Fähigkeit eines Marktes, sich schnell anzupassen', c: false },
        { t: 'Wie stark die Nachfrage auf eine Preisänderung reagiert', c: true },
        { t: 'Die Flexibilität des Angebots bei Preisschwankungen', c: false },
        { t: 'Die Geschwindigkeit, mit der ein Marktgleichgewicht erreicht wird', c: false },
      ],
      explanation: 'Preiselastizität der Nachfrage: misst prozentuale Mengenänderung / prozentuale Preisänderung. Elastisch (>1): Luxusgüter, viele Substitute. Unelastisch (<1): lebenswichtige Güter (Brot, Insulin). Vollständig unelastisch: Nachfrage ändert sich nie.',
      difficulty: 'medium',
    },
    {
      q: 'Was passiert mit dem Marktgleichgewicht, wenn die Nachfrage steigt und das Angebot konstant bleibt?',
      opts: [
        { t: 'Preis und Menge sinken', c: false },
        { t: 'Preis steigt, Gleichgewichtsmenge steigt', c: true },
        { t: 'Preis steigt, Menge bleibt gleich', c: false },
        { t: 'Preis fällt, Menge steigt', c: false },
      ],
      explanation: 'Nachfrageanstieg bei konstantem Angebot: Nachfragekurve verschiebt sich rechts. Neue Gleichgewichtspunkt: höherer Preis UND höhere Menge. Beispiel: Boom → mehr Nachfrage nach Wohnungen → höhere Mieten und mehr gebaute Wohnungen.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist ein Mindestpreis und welche Wirkung hat er?',
      opts: [
        { t: 'Ein vom Staat gesetzter Preis, unter den der Marktpreis nicht fallen darf – führt zu Überschussangebot', c: true },
        { t: 'Der tiefste Preis, den Konsumenten zahlen wollen', c: false },
        { t: 'Ein Preis, der vom Anbieter nicht überschritten werden darf', c: false },
        { t: 'Ein Preis, der das Marktgleichgewicht stabilisiert', c: false },
      ],
      explanation: 'Mindestpreis (Preisuntergrenze) > Gleichgewichtspreis: Angebot > Nachfrage → Überschussangebot (Angebotsüberhang). Beispiele: Mindestlohn (Arbeit), Agrarpreise (EU). Wirkung: Preis bleibt künstlich hoch, Markt räumt nicht vollständig.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist ein Höchstpreis und welche Folgen hat er?',
      opts: [
        { t: 'Der maximale Preis, den Anbieter wünschen', c: false },
        { t: 'Ein staatlich gesetzter Maximalpreis < Gleichgewichtspreis – führt zu Nachfrageüberhang (Knappheit)', c: true },
        { t: 'Der Preis, bei dem kein Anbieter mehr auf den Markt kommt', c: false },
        { t: 'Ein Preis, der Inflation verhindert', c: false },
      ],
      explanation: 'Höchstpreis (Preisobergrenze) < Gleichgewichtspreis: Nachfrage > Angebot → Nachfrageüberhang (Mangel, Warteschlangen). Beispiele: Mietpreisbindung, Benzinpreisdeckel in Krisenzeiten. Schwarzmarkt kann entstehen.',
      difficulty: 'hard',
    },
    {
      q: 'Was sind komplementäre Güter?',
      opts: [
        { t: 'Güter, die sich gegenseitig ersetzen können', c: false },
        { t: 'Güter, die zusammen verwendet werden – Preisanstieg eines Gutes senkt Nachfrage nach dem anderen', c: true },
        { t: 'Güter, deren Nachfrage steigt, wenn Einkommen steigt', c: false },
        { t: 'Güter ohne Substitute', c: false },
      ],
      explanation: 'Komplementäre Güter: werden zusammen konsumiert. Beispiele: Auto + Benzin, Drucker + Tintenpatronen, Ski + Skischuhe. Steigt der Benzinpreis → weniger Autos werden gekauft (Komplementäreffekt). Gegenteil: Substitute (können sich ersetzen).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist Marktmacht und wie entsteht sie?',
      opts: [
        { t: 'Die Fähigkeit des Staates, Preise zu bestimmen', c: false },
        { t: 'Die Fähigkeit eines Anbieters oder Nachfragers, den Marktpreis zu beeinflussen', c: true },
        { t: 'Der Einfluss von Gewerkschaften auf Löhne', c: false },
        { t: 'Die Macht der Konsumenten, Preise zu senken', c: false },
      ],
      explanation: 'Marktmacht entsteht bei Monopolen, Oligopolen oder durch Produktdifferenzierung. Ein Monopolist kann Preis setzen (Preisnehmer vs. Preissetzer). Bei vollständiger Konkurrenz: kein Marktteilnehmer hat Marktmacht (Preisnehmer).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen einer Verschiebung der Nachfragekurve und einer Bewegung auf der Nachfragekurve?',
      opts: [
        { t: 'Kein Unterschied – beides beschreibt dasselbe Phänomen', c: false },
        { t: 'Bewegung = Preisänderung; Verschiebung = Änderung anderer Determinanten (Einkommen, Präferenzen, Preise anderer Güter)', c: true },
        { t: 'Verschiebung = Preisänderung; Bewegung = Mengenänderung', c: false },
        { t: 'Verschiebung betrifft nur das Angebot, Bewegung nur die Nachfrage', c: false },
      ],
      explanation: 'Bewegung auf der Kurve: Preis ändert sich → Menge ändert sich (Gesetz der Nachfrage). Verschiebung der gesamten Kurve: andere Determinanten ändern sich: Einkommen, Präferenzen, Preise verwandter Güter, Erwartungen, Bevölkerung.',
      difficulty: 'hard',
    },
    {
      q: 'Was versteht man unter "Konsumentenrente"?',
      opts: [
        { t: 'Staatliche Unterstützung für Konsumenten mit tiefem Einkommen', c: false },
        { t: 'Der Unterschied zwischen dem, was Konsumenten zu zahlen bereit wären, und dem tatsächlichen Marktpreis', c: true },
        { t: 'Der Gewinn, den Konsumenten durch Einkäufe erzielen', c: false },
        { t: 'Die Rente, die aus Konsumgüterinvestitionen entsteht', c: false },
      ],
      explanation: 'Konsumentenrente: Wenn jemand CHF 100 für ein Buch zahlen würde, es aber nur CHF 30 kostet → Konsumentenrente = CHF 70. Im Markt: Summe aller Konsumentenrenten = Fläche zwischen Nachfragekurve und Marktpreis. Wohlfahrtsgewinne durch freien Handel.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist ein vollkommener Markt?',
      opts: [
        { t: 'Ein staatlich regulierter Markt ohne Preisschwankungen', c: false },
        { t: 'Ein Markt mit vollständiger Konkurrenz, homogenen Gütern, vollständiger Markttransparenz und vollständiger Mobilität', c: true },
        { t: 'Ein Markt ohne Steuern und Abgaben', c: false },
        { t: 'Ein Markt, in dem immer ein Gleichgewicht herrscht', c: false },
      ],
      explanation: 'Vollkommener Markt (Modell): viele Anbieter/Nachfrager, homogenes Gut, vollständige Preistransparenz, vollständige Mobilität (kein Standortvorteil), keine persönlichen Präferenzen. In der Realität: Märkte sind unvollkommen (Informationsasymmetrien, Marktmacht).',
      difficulty: 'medium',
    },
  ])

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 12: GELD & PREISSTABILITÄT (AP)
  // Wottreng/König, Kapitel 8 / 9
  // ─────────────────────────────────────────
  const tGeld = await prisma.topic.create({
    data: {
      slug: 'geld-preisstabilitaet',
      title: 'Geld & Preisstabilität',
      description: 'Geldfunktionen, Inflation, Geldpolitik, SNB, Realzins – AP',
      icon: 'Coins',
      color: 'yellow',
      examType: 'abschluss',
      category: 'vwl',
      order: 12,
    },
  })

  const chGeld = await prisma.chapter.create({
    data: {
      slug: 'geld-inflation-snb',
      title: 'Geld, Inflation & Geldpolitik',
      subtitle: 'Geldfunktionen, Geldmenge, SNB und Preisstabilität',
      topicId: tGeld.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 12. Geld und Preisstabilität

## 12.1 Funktionen des Geldes

Geld erfüllt drei zentrale Funktionen:
1. **Tauschmittel**
2. **Recheneinheit**
3. **Wertaufbewahrungsmittel**

Ohne Geld wären Tauschprozesse viel komplizierter.

## 12.2 Geldwert und Kaufkraft

Der Wert des Geldes zeigt sich in seiner Kaufkraft:
**Wie viele Güter und Dienstleistungen kann man mit einer Geldeinheit kaufen?**

Steigende Preise senken die Kaufkraft.

## 12.3 Preisniveau und Inflation

### Preisniveau
Durchschnittliches Niveau der Preise in einer Volkswirtschaft.

### Inflation
Anhaltender Anstieg des allgemeinen Preisniveaus.
Folge: Kaufkraft des Geldes sinkt.

### Deflation
Anhaltender Rückgang des allgemeinen Preisniveaus.
Klingt attraktiv, kann aber wirtschaftlich problematisch sein.

## 12.4 Messung der Inflation

Der LIK (Landesindex der Konsumentenpreise) ist zentral.
Er misst die Preisentwicklung eines Warenkorbs für Konsumenten.

## 12.5 Folgen von Inflation

- Kaufkraftverlust
- Umverteilung zwischen Gläubigern und Schuldnern
- Unsicherheit für Haushalte und Unternehmen
- Verzerrung von Spar- und Investitionsentscheiden

## 12.6 Ursachen von Inflation

### Nachfrageinflation
Gesamtnachfrage steigt stärker als das Angebot.

### Angebotsinflation / Kosteninflation
Produktionskosten steigen, Unternehmen erhöhen Preise.

### Importierte Inflation
Auslandspreise oder Wechselkursveränderungen wirken auf Inlandpreise.

## 12.7 Geldmenge und Geldschöpfung

In modernen Volkswirtschaften gibt es:
- Zentralbankgeld
- Buchgeld bei Geschäftsbanken

Geschäftsbanken schaffen im Kreditprozess Buchgeld.
Die Zentralbank beeinflusst die Rahmenbedingungen.

## 12.8 Rolle der Zentralbank / SNB

Die Schweizerische Nationalbank steuert nicht jeden einzelnen Preis, sondern versucht, **Preisstabilität** zu gewährleisten.

Wichtige Instrumente:
- Zinspolitik / Leitzinsen
- Steuerung der Liquidität
- geldpolitische Signale

## 12.9 Warum Preisstabilität wichtig ist

Preisstabilität schafft:
- Planungssicherheit
- Vertrauen in Geld und Verträge
- bessere Investitionsbedingungen
- weniger willkürliche Umverteilung

## 12.10 Typische Prüfungslogik

1. Wird Geldfunktion oder Geldwert geprüft?
2. Geht es um Inflation oder Deflation?
3. Was passiert mit Kaufkraft, Sparern, Schuldnern, Unternehmen?
4. Welche Rolle spielt die Nationalbank?`,
      learningGoals: {
        create: [
          { text: 'Die drei Funktionen des Geldes nennen und erklären', order: 1 },
          { text: 'Inflation und Deflation unterscheiden und deren Folgen kennen', order: 2 },
          { text: 'Die Rolle der SNB und Instrumente der Geldpolitik erklären', order: 3 },
          { text: 'Realzins aus Nominalzins und Inflationsrate berechnen', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Tauschmittel', definition: 'Geld ersetzt den Tauschhandel – allgemein akzeptiertes Zahlungsmittel', order: 1 },
          { term: 'Wertaufbewahrung', definition: 'Geld ermöglicht, Kaufkraft in die Zukunft zu übertragen', order: 2 },
          { term: 'Recheneinheit', definition: 'Geld dient als gemeinsamer Massstab für Preise und Werte', order: 3 },
          { term: 'Inflation', definition: 'Allgemeines Ansteigen des Preisniveaus – Kaufkraft des Geldes sinkt', order: 4 },
          { term: 'Deflation', definition: 'Allgemeines Sinken des Preisniveaus – gefährlich wegen Kaufzurückhaltung', order: 5 },
          { term: 'SNB', definition: 'Schweizerische Nationalbank – Zentralbank, verantwortlich für Preisstabilität und Geldversorgung', order: 6 },
          { term: 'Leitzins', definition: 'Zinssatz der SNB für Banken – beeinflusst Kreditzinsen und Geldmenge', order: 7 },
          { term: 'Realzins', definition: 'Nominalzins minus Inflationsrate – gibt tatsächliche Kaufkraftentwicklung an', order: 8 },
          { term: 'Quantitätsgleichung', definition: 'M × V = P × Y (Geldmenge × Umlaufgeschwindigkeit = Preisniveau × reales BIP)', order: 9 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Geldfunktionen: Tauschmittel, Wertaufbewahrung, Recheneinheit', order: 1 },
          { text: 'Inflation: Geldmenge steigt schneller als Gütermenge → Preise steigen', order: 2 },
          { text: 'SNB-Ziel: Preisstabilität (Inflation <2%) bei angemessenem Wirtschaftswachstum', order: 3 },
          { text: 'Geldpolitik expansiv: SNB senkt Leitzins → günstigere Kredite → mehr Investitionen', order: 4 },
          { text: 'Geldpolitik restriktiv: SNB erhöht Leitzins → teurere Kredite → weniger Inflation', order: 5 },
          { text: 'Realzins = Nominalzins - Inflationsrate (z.B. 3% - 1% = 2% real)', order: 6 },
          { text: 'Deflation gefährlich: Konsumenten warten mit Käufen → Wirtschaft stockt', order: 7 },
        ],
      },
      examples: {
        create: [
          { text: 'Realzins: Nominalzins 3%, Inflation 2% → Realzins = 1% (tatsächliche Rendite)', order: 1 },
          { text: 'Expansive Geldpolitik 2020: SNB hielt Leitzins tief → günstige Hypotheken, mehr Bautätigkeit', order: 2 },
          { text: 'Deflation Japan 1990er: Preise sinken → Kaufaufschub → weniger Produktion → mehr Arbeitslosigkeit', order: 3 },
        ],
      },
    },
  })

  await createQuiz(chGeld.id, [
    {
      q: 'Welche drei Funktionen hat Geld?',
      opts: [
        { t: 'Sparen, Investieren, Konsumieren', c: false },
        { t: 'Tauschmittel, Wertaufbewahrungsmittel, Recheneinheit', c: true },
        { t: 'Zahlen, Leihen, Sparen', c: false },
        { t: 'Produzieren, Verteilen, Konsumieren', c: false },
      ],
      explanation: 'Geld hat drei klassische Funktionen: 1. Tauschmittel (ersetzt Tauschhandel), 2. Wertaufbewahrungsmittel (Kaufkraft in die Zukunft), 3. Recheneinheit (gemeinsamer Massstab).',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Realzins?',
      opts: [
        { t: 'Der vom Staat garantierte Mindestzinssatz', c: false },
        { t: 'Nominalzins minus Inflationsrate', c: true },
        { t: 'Zinssatz nach Steuern', c: false },
        { t: 'Zinssatz für Hypothekarkredite', c: false },
      ],
      explanation: 'Realzins = Nominalzins − Inflationsrate. Er gibt an, wie viel Kaufkraft eine Geldanlage tatsächlich gewinnt. Bei 3% Nominalzins und 2% Inflation = 1% Realzins.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist das Ziel der SNB?',
      opts: [
        { t: 'Maximales Wirtschaftswachstum erreichen', c: false },
        { t: 'Preisstabilität gewährleisten (Inflation unter 2%)', c: true },
        { t: 'Den Franken gegenüber dem Euro abwerten', c: false },
        { t: 'Staatsschulden finanzieren', c: false },
      ],
      explanation: 'Die SNB hat als primäres Ziel Preisstabilität (Inflation <2%) bei angemessenem Wirtschaftswachstum. Sie steuert die Geldmenge hauptsächlich über den Leitzins.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist Inflation?',
      opts: [
        { t: 'Sinkendes Preisniveau über mehrere Perioden', c: false },
        { t: 'Anhaltender Anstieg des allgemeinen Preisniveaus – die Kaufkraft des Geldes sinkt', c: true },
        { t: 'Steigendes BIP-Wachstum', c: false },
        { t: 'Erhöhung der Geldmenge durch die SNB', c: false },
      ],
      explanation: 'Inflation = anhaltender Anstieg des allgemeinen Preisniveaus (nicht nur einzelne Güter). Kaufkraft sinkt: Für denselben Geldbetrag kann man weniger kaufen. Gemessen mit dem LIK (Konsumentenpreisindex).',
      difficulty: 'easy',
    },
    {
      q: 'Was ist Deflation und warum ist sie wirtschaftlich problematisch?',
      opts: [
        { t: 'Deflation = Inflation; beide sind schädlich', c: false },
        { t: 'Sinkende Preise → Konsumenten warten mit Käufen → weniger Nachfrage → wirtschaftliche Abwärtsspirale', c: true },
        { t: 'Deflation ist nur für Exporteure problematisch', c: false },
        { t: 'Deflation ist positiv, weil Güter günstiger werden', c: false },
      ],
      explanation: 'Deflation: Preise sinken → Konsumenten warten ("morgen ist es noch billiger") → Nachfrage sinkt → Produktion sinkt → Arbeitslosigkeit steigt → noch weniger Konsum. Japan-Szenario: Deflationsspirale ist schwer zu durchbrechen.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist Nachfrageinflation?',
      opts: [
        { t: 'Inflation durch steigende Rohstoffkosten', c: false },
        { t: 'Inflation, weil die Gesamtnachfrage stärker steigt als das Angebot', c: true },
        { t: 'Inflation durch staatliche Preisregulierung', c: false },
        { t: 'Inflation durch importierte Güter', c: false },
      ],
      explanation: 'Nachfrageinflation (demand-pull): Zu viel Geld jagt zu wenige Güter. Beispiel: starkes Wirtschaftswachstum, alle wollen mehr → Preise steigen. Gegenteil: Angebotsinflation (cost-push).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist Kosteninflation (Angebotsinflation)?',
      opts: [
        { t: 'Inflation durch zu hohe Konsumentennachfrage', c: false },
        { t: 'Inflation, weil Produktionskosten (z.B. Löhne, Rohstoffe) steigen und Unternehmen Preise erhöhen', c: true },
        { t: 'Inflation durch Geldmengenwachstum', c: false },
        { t: 'Inflation durch staatliche Subventionen', c: false },
      ],
      explanation: 'Kosteninflation (cost-push): z.B. Ölpreisschock erhöht Produktionskosten → Unternehmen geben sie weiter → Preise steigen. Besonders problematisch: Stagflation (Kosteninflation + gleichzeitig schwache Wirtschaft).',
      difficulty: 'medium',
    },
    {
      q: 'Wie bekämpft die SNB eine zu hohe Inflation?',
      opts: [
        { t: 'Sie senkt den Leitzins', c: false },
        { t: 'Sie erhöht den Leitzins (restriktive Geldpolitik)', c: true },
        { t: 'Sie erhöht die Staatsausgaben', c: false },
        { t: 'Sie druckt mehr Geld', c: false },
      ],
      explanation: 'Restriktive Geldpolitik: SNB erhöht Leitzins → Kredite teurer → weniger Investitionen und Konsum → weniger Nachfrage → Inflationsdruck sinkt. Risiko: zu starke Bremsung kann Wachstum gefährden.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist expansive Geldpolitik?',
      opts: [
        { t: 'SNB erhöht Leitzins, um Wirtschaft zu bremsen', c: false },
        { t: 'SNB senkt Leitzins, um Kredite zu verbilligen und Wirtschaft zu stimulieren', c: true },
        { t: 'Staat erhöht Ausgaben in der Rezession', c: false },
        { t: 'SNB kauft Staatsanleihen, um den Staatshaushalt zu finanzieren', c: false },
      ],
      explanation: 'Expansive Geldpolitik: tiefer Leitzins → günstige Kredite → mehr Investitionen und Konsum → Wirtschaft wird stimuliert. Risiko bei zu lang anhaltender Tiefzinspolitik: Immobilienblasen, zu hohe Inflation.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Quantitätsgleichung des Geldes (M × V = P × Y)?',
      opts: [
        { t: 'Eine Formel für Geldmengenwachstum', c: false },
        { t: 'Geldmenge × Umlaufgeschwindigkeit = Preisniveau × reales BIP', c: true },
        { t: 'Die Formel für den Nominalzins', c: false },
        { t: 'Eine Formel für die Berechnung der Kaufkraft', c: false },
      ],
      explanation: 'MV=PY: M (Geldmenge) × V (Umlaufgeschwindigkeit) = P (Preisniveau) × Y (reales BIP). Wenn M steigt und V, Y konstant → P steigt (Inflation). Basis der Quantitätstheorie des Geldes.',
      difficulty: 'hard',
    },
    {
      q: 'Wer verliert bei Inflation – Gläubiger oder Schuldner?',
      opts: [
        { t: 'Schuldner verlieren', c: false },
        { t: 'Gläubiger verlieren, weil ihre Forderungen real weniger wert werden', c: true },
        { t: 'Beide verlieren gleichermassen', c: false },
        { t: 'Weder Gläubiger noch Schuldner sind betroffen', c: false },
      ],
      explanation: 'Inflation: Schuldner gewinnen (schulden nominal gleich viel, aber das Geld ist real weniger wert). Gläubiger verlieren (Rückzahlung hat geringere Kaufkraft). Daher ist Inflation eine versteckte Vermögensumverteilung.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet die Funktion "Wertaufbewahrungsmittel" des Geldes?',
      opts: [
        { t: 'Geld kann als Zahlungsmittel verwendet werden', c: false },
        { t: 'Geld ermöglicht, Kaufkraft zeitlich zu verschieben – heute sparen, morgen ausgeben', c: true },
        { t: 'Geld dient als Massstab zum Vergleich von Preisen', c: false },
        { t: 'Geld kann physisch gelagert werden', c: false },
      ],
      explanation: 'Wertaufbewahrung: Geld erhält seinen Wert über die Zeit (im Gegensatz zu verderblichen Gütern). Bei Inflation erfüllt Geld diese Funktion schlechter. Alternative Wertaufbewahrungsmittel: Gold, Immobilien, Aktien.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist die Kaufkraft des Geldes?',
      opts: [
        { t: 'Die Menge an Geld, die ein Konsument besitzt', c: false },
        { t: 'Die Menge an Gütern und Dienstleistungen, die man mit einer Geldeinheit kaufen kann', c: true },
        { t: 'Der Zinssatz, den die SNB festlegt', c: false },
        { t: 'Das Bruttoinlandprodukt pro Kopf', c: false },
      ],
      explanation: 'Kaufkraft = was man für das Geld bekommt. Steigende Preise → sinkende Kaufkraft. Fallende Preise (Deflation) → steigende Kaufkraft. Realzins = Nominalzins − Inflation = Kaufkraftveränderung der Ersparnisse.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist importierte Inflation?',
      opts: [
        { t: 'Inflation durch staatliche Importzölle', c: false },
        { t: 'Wenn steigende Auslandspreise oder Wechselkursveränderungen die Inlandpreise erhöhen', c: true },
        { t: 'Inflation, die durch ausländische Unternehmen verursacht wird', c: false },
        { t: 'Inflation, die durch Importe bekämpft wird', c: false },
      ],
      explanation: 'Importierte Inflation: z.B. wenn der CHF gegenüber dem EUR schwächer wird → Importe teurer → steigende Produktionskosten für Schweizer Unternehmen → Preise steigen. Oder: globale Ölpreissteigerung = importierte Inflation.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist Buchgeld?',
      opts: [
        { t: 'Das physische Bargeld in der Geldbörse', c: false },
        { t: 'Elektronisch gespeicherte Guthaben bei Banken, ohne physische Entsprechung', c: true },
        { t: 'Das Kapital der Nationalbank', c: false },
        { t: 'Wertpapiere und Obligationen', c: false },
      ],
      explanation: 'Buchgeld = elektronisch auf Bankkonten gespeichertes Geld. Entsteht durch Kreditvergabe (Banken schaffen Buchgeld). Der grösste Teil der Geldmenge ist Buchgeld, nicht Bargeld. Die SNB beeinflusst die Bedingungen für Buchgeldschöpfung.',
      difficulty: 'medium',
    },
    {
      q: 'Warum ist Preisstabilität wichtig?',
      opts: [
        { t: 'Weil der Staat bei tiefer Inflation weniger Steuern erheben muss', c: false },
        { t: 'Weil sie Planungssicherheit für Haushalte und Unternehmen schafft und Vertrauen in das Geld erhält', c: true },
        { t: 'Weil Inflation immer gut für die Wirtschaft ist', c: false },
        { t: 'Weil Deflation einfacher zu bekämpfen ist als Inflation', c: false },
      ],
      explanation: 'Preisstabilität schafft: Planungssicherheit (Investitionen, Lohnverhandlungen), Vertrauen in das Geld und in Verträge, faire Vermögensverteilung (keine willkürliche Umverteilung durch Inflation), bessere Sparbedingungen.',
      difficulty: 'medium',
    },
    {
      q: 'Nominalzins 2%, Inflationsrate 3%. Was ist der Realzins?',
      opts: [
        { t: '5%', c: false },
        { t: '−1%', c: true },
        { t: '1%', c: false },
        { t: '6%', c: false },
      ],
      explanation: 'Realzins = Nominalzins − Inflationsrate = 2% − 3% = −1%. Negativer Realzins: die Kaufkraft der Ersparnisse sinkt, auch wenn man Zinsen erhält. Das Kapital verliert real an Wert.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Funktion von Geld als Recheneinheit?',
      opts: [
        { t: 'Geld kann gespart und für die Zukunft aufbewahrt werden', c: false },
        { t: 'Geld dient als gemeinsamer Massstab, um Güter und Dienstleistungen zu bewerten und zu vergleichen', c: true },
        { t: 'Geld ermöglicht den Kauf von Waren und Dienstleistungen', c: false },
        { t: 'Geld zeigt an, wie viel jemand verdient', c: false },
      ],
      explanation: 'Recheneinheit: Mit Geld können Äpfel mit Orangen verglichen werden (beide haben CHF-Preise). Ohne Geld müsste man relative Tauschverhältnisse kennen (wie viele Äpfel ist eine Orange wert?). Vereinfacht Wirtschaftsrechnung enorm.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Leitzins der SNB?',
      opts: [
        { t: 'Der Zinssatz für Hypotheken', c: false },
        { t: 'Der Zinssatz, zu dem Geschäftsbanken bei der SNB Geld leihen oder anlegen – beeinflusst alle anderen Zinsen', c: true },
        { t: 'Der Zinssatz für Staatsobligationen', c: false },
        { t: 'Der Maximalsatz für Konsumkredite', c: false },
      ],
      explanation: 'SNB-Leitzins: Steuert die Geldmenge indirekt. Tiefer Leitzins → Banken können günstig bei SNB borgen → günstige Kredite für Kunden → mehr Investitionen. Hoher Leitzins → umgekehrt. Wichtigstes Instrument der Geldpolitik.',
      difficulty: 'medium',
    },
    {
      q: 'Was passiert mit der Kaufkraft von Ersparnissen bei negativem Realzins?',
      opts: [
        { t: 'Die Kaufkraft steigt', c: false },
        { t: 'Die Kaufkraft sinkt – man kann morgen weniger kaufen als heute', c: true },
        { t: 'Die Kaufkraft bleibt gleich', c: false },
        { t: 'Negativer Realzins ist theoretisch unmöglich', c: false },
      ],
      explanation: 'Negativer Realzins (Nominalzins < Inflation): Ersparnisse wachsen nominal, verlieren aber real an Kaufkraft. Beispiel: 1% Zins, 3% Inflation → Real −2%: Mit CHF 1\'000 kann man in einem Jahr weniger kaufen als heute.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Geldmenge M1?',
      opts: [
        { t: 'Alle Banknoten und Münzen plus Sparkonten und Festgelder', c: false },
        { t: 'Bargeld im Umlauf plus Sichteinlagen (jederzeit verfügbare Bankguthaben)', c: true },
        { t: 'Nur die Notenbankgeldmenge der SNB', c: false },
        { t: 'Alle Vermögenswerte inklusive Aktien und Obligationen', c: false },
      ],
      explanation: 'Geldmengenaggregate: M0 = Notenbankgeld (Bargeld + Giroguthaben der Banken bei SNB). M1 = M0 + Sichteinlagen. M2 = M1 + Spareinlagen. M3 = M2 + Festgelder. M1 ist am liquidesten und geldähnlichsten.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist Deflation und warum ist sie gefährlich?',
      opts: [
        { t: 'Deflation ist gut – Preise sinken, Konsumenten kaufen mehr', c: false },
        { t: 'Anhaltender Preisrückgang, der zu Kaufzurückhaltung, sinkenden Gewinnen und Deflationsspirale führen kann', c: true },
        { t: 'Deflation ist dasselbe wie Rezession', c: false },
        { t: 'Deflation trifft nur den Finanzsektor', c: false },
      ],
      explanation: 'Deflationsspirale: Preise sinken → Konsumenten warten auf tiefere Preise → Nachfrage sinkt → Unternehmen senken Preise weiter → Löhne sinken → weniger Konsum → Spirale nach unten. Schulden werden real schwerer. Japan: "verlorenes Jahrzehnt" durch Deflation.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist die Geldschöpfung durch Geschäftsbanken?',
      opts: [
        { t: 'Nur die SNB kann Geld schaffen', c: false },
        { t: 'Banken schaffen Geld durch Kreditvergabe – Guthaben des Kreditnehmers erhöht sich, ohne dass vorher jemand gespart hat', c: true },
        { t: 'Banken drucken eigene Banknoten', c: false },
        { t: 'Geld entsteht nur durch staatliche Einnahmen', c: false },
      ],
      explanation: 'Giralgeldschöpfung: Bank vergibt Kredit CHF 10\'000 → schreibt Konto des Kreditnehmers gut → neues Geld entsteht. Multiplikatoreffekt: Je nach Mindestreservesatz können Banken ein Vielfaches der Reserven als Kredit ausgeben. SNB kontrolliert indirekt durch Leitzinsen.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist die Kaufkraftparität (KKP)?',
      opts: [
        { t: 'Der Wechselkurs, der durch Angebot und Nachfrage auf dem Devisenmarkt bestimmt wird', c: false },
        { t: 'Wechselkurs, bei dem ein Warenkorb in zwei Ländern gleich viel kostet – misst reale Kaufkraft', c: true },
        { t: 'Die Inflationsrate minus Wechselkursänderung', c: false },
        { t: 'Der Zinssatz, bei dem Kapital nicht ins Ausland fliesst', c: false },
      ],
      explanation: 'KKP: Wenn ein Big Mac in der Schweiz CHF 7 und in den USA USD 5 kostet → KKP-Kurs: 1 CHF = 5/7 USD. KKP-Wechselkurs > Marktrealkurs → CHF überbewertet. Wird für internationalen Lebensstandard-Vergleich verwendet (Economist: "Big Mac Index").',
      difficulty: 'hard',
    },
    {
      q: 'Was sind die Funktionen des Geldes?',
      opts: [
        { t: 'Zahlungsmittel, Schmiermittel und Kreditmittel', c: false },
        { t: 'Tauschmittel, Wertmesser (Recheneinheit) und Wertaufbewahrungsmittel', c: true },
        { t: 'Investitionsmittel, Sparmittel und Konsummittel', c: false },
        { t: 'Staatliches Kontrollmittel, Steuermittel und Regulierungsmittel', c: false },
      ],
      explanation: 'Drei Geldfunktionen: 1. Tauschmittel: überwindet das "doppelte Koinzidenzproblem" des Tauschhandels. 2. Wertmesser/Recheneinheit: Preise werden in Geldeinheiten ausgedrückt. 3. Wertaufbewahrungsmittel: Kaufkraft kann über Zeit gespart werden (gefährdet durch Inflation).',
      difficulty: 'easy',
    },
    {
      q: 'Wie beeinflusst die SNB die Inflation mit dem Leitzins?',
      opts: [
        { t: 'Höherer Leitzins → mehr Inflation; tieferer Leitzins → weniger Inflation', c: false },
        { t: 'Höherer Leitzins → Kreditkosten steigen → weniger Konsum/Investitionen → Inflation sinkt', c: true },
        { t: 'Der Leitzins hat keinen Einfluss auf die Inflation', c: false },
        { t: 'Der Leitzins beeinflusst nur den Frankenkurs, nicht die Inflation', c: false },
      ],
      explanation: 'Transmissionsmechanismus: SNB erhöht Leitzins → Banken erhöhen Kreditzinsen → teurere Finanzierung → weniger Investitionen und Konsum → gesamtwirtschaftliche Nachfrage sinkt → Preisdruck sinkt → Inflation geht zurück. Wirkung: mit 12-18 Monaten Verzögerung.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Landesindex der Konsumentenpreise (LIK)?',
      opts: [
        { t: 'Ein Index für die Entwicklung der Aktienkurse in der Schweiz', c: false },
        { t: 'Ein Warenkorb repräsentativer Güter/Dienstleistungen, dessen Preisentwicklung die Inflation misst', c: true },
        { t: 'Die Summe aller Konsumausgaben privater Haushalte', c: false },
        { t: 'Ein Massstab für die Kaufkraft des Frankens im Ausland', c: false },
      ],
      explanation: 'LIK (CPI): misst Preisentwicklung eines repräsentativen Warenkorbs (Wohnen, Nahrung, Verkehr, Gesundheit etc.). Basisjahr = 100. LIK steigt von 100 auf 103 → 3% Inflation. Problem: Warenkorb veraltet, Qualitätsverbesserungen werden nicht berücksichtigt.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist Stagflation?',
      opts: [
        { t: 'Hohe Inflation bei gleichzeitig starkem Wirtschaftswachstum', c: false },
        { t: 'Kombination von Stagnation (Wirtschaftsstillstand/Rezession) und hoher Inflation', c: true },
        { t: 'Niedrige Inflation bei hoher Arbeitslosigkeit', c: false },
        { t: 'Ein Zustand, in dem alle Preise stabil bleiben', c: false },
      ],
      explanation: 'Stagflation (1970er: Ölkrise): gleichzeitig hohe Inflation + hohe Arbeitslosigkeit + schwaches Wachstum. Widerspricht der Phillips-Kurve (die einen Trade-off zwischen Inflation und Arbeitslosigkeit beschreibt). Sehr schwer zu bekämpfen: Zinssenkung hilft Wachstum, schadet Inflation.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist die Geldnachfrage und wovon hängt sie ab?',
      opts: [
        { t: 'Die Geldmenge, die die SNB druckt', c: false },
        { t: 'Der Bedarf nach liquiden Mitteln: abhängig von Einkommensniveau, Zinssatz und Transaktionsbedarf', c: true },
        { t: 'Die Nachfrage nach Fremdwährungen auf dem Devisenmarkt', c: false },
        { t: 'Der Kreditbedarf der Unternehmen bei den Banken', c: false },
      ],
      explanation: 'Geldnachfrage: 1. Transaktionsmotiv: für Einkäufe (steigt mit Einkommen). 2. Vorsichtsmotiv: für unerwartete Ausgaben. 3. Spekulationsmotiv: wenn Zinsen tief → Geld halten statt investieren. Steigt der Zins → weniger Geld nachgefragt (Opportunitätskosten).',
      difficulty: 'hard',
    },
    {
      q: 'Was ist die Quantitätstheorie des Geldes?',
      opts: [
        { t: 'Je mehr Geld gedruckt wird, desto höher die Zinsen', c: false },
        { t: 'M × V = P × Y: Geldmenge × Umlaufgeschwindigkeit = Preisniveau × reales BIP', c: true },
        { t: 'Der Wert des Geldes hängt nur von der Goldmenge ab', c: false },
        { t: 'Inflation entsteht nur durch staatliche Verschuldung', c: false },
      ],
      explanation: 'Fisher-Gleichung: M × V = P × Y. Wenn V und Y konstant → Verdopplung der Geldmenge (M) → Verdopplung des Preisniveaus (P). Monetaristen (Friedman): "Inflation ist immer und überall ein monetäres Phänomen" – zu viel Geld jagt zu wenige Güter.',
      difficulty: 'hard',
    },
  ])

  await reconnect()
  // ─────────────────────────────────────────
  // TOPIC 13: KONJUNKTUR & KONJUNKTURPOLITIK (AP / QSP)
  // Wottreng/König, Kapitel 10.1 / 10.2 / 10.4
  // ─────────────────────────────────────────
  const tKonjunktur = await prisma.topic.create({
    data: {
      slug: 'konjunktur-konjunkturpolitik',
      title: 'Konjunktur & Konjunkturpolitik',
      description: 'Konjunkturzyklus, Fiskalpolitik, Geldpolitik, Markt- vs. Planwirtschaft – AP/QSP',
      icon: 'Activity',
      color: 'red',
      examType: 'both',
      category: 'vwl',
      order: 13,
    },
  })

  const chKonjunktur = await prisma.chapter.create({
    data: {
      slug: 'konjunktur',
      title: 'Konjunktur & Wirtschaftspolitik',
      subtitle: 'Konjunkturzyklus, Inflation, Wirtschaftssysteme',
      topicId: tKonjunktur.id,
      order: 1,
      contentStatus: 'complete',
      summary: `# 13. Konjunktur & Konjunkturpolitik

## 13.1 Konjunkturbegriff

Konjunktur beschreibt die **kurzfristigen Schwankungen** der wirtschaftlichen Aktivität um den langfristigen Trend.

Es geht um die Frage:
- Läuft die Wirtschaft gerade stark oder schwach?
- Ist die Produktion über- oder unterausgelastet?

## 13.2 Konjunkturphasen

Typischer Zyklus:
1. Aufschwung
2. Boom
3. Abschwung
4. Rezession / Tiefphase

### Aufschwung
- Produktion steigt
- Beschäftigung steigt
- Investitionen nehmen zu

### Boom
- hohe Auslastung
- Fachkräftemangel möglich
- Preis- und Lohndruck steigt

### Abschwung
- Nachfrage schwächt sich ab
- Lager nehmen zu
- Investitionen sinken

### Rezession / Krise
- Produktion sinkt
- Arbeitslosigkeit steigt
- Unsicherheit nimmt zu

## 13.3 Konjunkturindikatoren

Wichtige Hinweise auf die Lage:
- BIP-Wachstum
- Arbeitslosigkeit
- Auftragslage
- Konsum
- Investitionen
- Preisentwicklung
- Erwartungen / Stimmungsindikatoren

## 13.4 BIP-Lücke / Output-Lücke

Wenn die tatsächliche Produktion vom Produktionspotenzial abweicht, spricht man von einer Lücke.

### Positive Lücke
Wirtschaft überhitzt, hohe Auslastung.

### Negative Lücke
Wirtschaft bleibt unter Potenzial, ungenutzte Kapazitäten.

## 13.5 Konjunkturursachen

- Nachfrageschwankungen
- Investitionszurückhaltung oder Investitionsboom
- externe Schocks (z. B. Ölpreisschock)
- Finanzkrisen
- Erwartungen
- staatliche oder geldpolitische Effekte

## 13.6 Stagflation

Problematische Situation mit:
- schwachem Wachstum bzw. Krise und
- gleichzeitig steigenden Preisen.

Das ist wirtschaftspolitisch schwierig, weil Gegenmassnahmen Zielkonflikte auslösen.

## 13.7 Ziele der Konjunkturpolitik

- Konjunkturschwankungen glätten
- starke Krisen dämpfen
- Überhitzung verhindern
- Beschäftigung stabilisieren
- Preisstabilität sichern

## 13.8 Arten der Konjunkturpolitik

### Fiskalpolitik
Staat beeinflusst Nachfrage über:
- Staatsausgaben
- Steuern

In der Krise kann der Staat expansiv handeln:
- mehr Ausgaben
- tiefere Steuern

Im Boom eher bremsend.

### Geldpolitik
Nationalbank beeinflusst Finanzierungsbedingungen und Nachfrage über Zinsen und Liquidität.

### Angebotsorientierte Politik
Verbessert die Produktionsbedingungen langfristig.
Beispiele:
- Bildung
- Infrastruktur
- Innovationsförderung
- flexible Märkte

## 13.9 Automatische Stabilisatoren

Bestimmte staatliche Mechanismen wirken ohne neue politische Entscheide konjunkturdämpfend.
Beispiele:
- progressive Steuern
- Arbeitslosenversicherung

Sie bremsen den Boom und stützen in der Krise.

## 13.10 Grenzen der Konjunkturpolitik

- zeitliche Verzögerungen
- Unsicherheit über Lage und Wirkung
- Schuldenproblematik
- Zielkonflikte mit Preisstabilität
- internationale Abhängigkeiten

## 13.11 Typische Prüfungslogik

1. In welcher Konjunkturphase befindet sich die Wirtschaft?
2. Welche Indikatoren sprechen dafür?
3. Handelt es sich um ein Nachfrage- oder Angebotsproblem?
4. Welche Politikmassnahme wäre geeignet?
5. Welche Nebenwirkungen oder Zielkonflikte entstehen?`,
      learningGoals: {
        create: [
          { text: 'Die vier Phasen des Konjunkturzyklus benennen', order: 1 },
          { text: 'Markt- und Planwirtschaft unterscheiden', order: 2 },
          { text: 'Staatliche Eingriffsmöglichkeiten (Fiskal- und Geldpolitik) kennen', order: 3 },
          { text: 'Rezession technisch definieren', order: 4 },
        ],
      },
      keyTerms: {
        create: [
          { term: 'Konjunkturzyklus', definition: 'Zyklische Schwankungen der Wirtschaftsleistung: Aufschwung → Hochkonjunktur → Abschwung → Rezession', order: 1 },
          { term: 'Rezession', definition: 'Wirtschaftliche Abschwungphase, technisch: zwei aufeinanderfolgende Quartale mit negativem BIP-Wachstum', order: 2 },
          { term: 'Planwirtschaft', definition: 'Staat lenkt alle Ressourcen zentral; alle Ressourcen gehören dem Staat', order: 3 },
          { term: 'Marktwirtschaft', definition: 'Ressourcenallokation über Preissignale; Eigentumsrechte und Rechtssicherheit', order: 4 },
          { term: 'Fiskalpolitik', definition: 'Staatliche Eingriffe über Steuern und Staatsausgaben (konjunkturpolitisch)', order: 5 },
          { term: 'Antizyklische Fiskalpolitik', definition: 'In Rezession: Staatsausgaben erhöhen / Steuern senken; in Boom: umgekehrt', order: 6 },
        ],
      },
      corePoints: {
        create: [
          { text: 'Aufschwung: BIP steigt, Beschäftigung steigt', order: 1 },
          { text: 'Hochkonjunktur/Überhitzung: Kapazitäten voll ausgelastet, Inflation droht', order: 2 },
          { text: 'Abschwung: BIP sinkt, Arbeitslosigkeit steigt', order: 3 },
          { text: 'Rezession (technisch): 2 aufeinanderfolgende Quartale negativen BIP-Wachstums', order: 4 },
          { text: 'Planwirtschaft-Problem: fehlende Anreize für Leistung und Innovation', order: 5 },
          { text: 'Marktwirtschaft braucht: Eigentumsrechte, Rechtssicherheit, freie Preisbildung', order: 6 },
          { text: 'Antizyklische Politik: In Rezession stimulieren; in Boom bremsen', order: 7 },
        ],
      },
      examples: {
        create: [
          { text: 'Planwirtschaft: frühere UdSSR – Staat bestimmt, wer was produziert → ineffizient', order: 1 },
          { text: 'Überhitzung: Lohnforderungen steigen → Preise steigen → Konkurrenz steigt → Preis sinkt wieder', order: 2 },
          { text: 'COVID-19: Rezession 2020 → Schweiz erhöhte Staatsausgaben (Kurzarbeit) = antizyklische Fiskalpolitik', order: 3 },
        ],
      },
    },
  })

  await createQuiz(chKonjunktur.id, [
    {
      q: 'Welche vier Phasen hat der Konjunkturzyklus?',
      opts: [
        { t: 'Wachstum → Stagnation → Deflation → Inflation', c: false },
        { t: 'Aufschwung → Hochkonjunktur → Abschwung → Rezession/Tiefkonjunktur', c: true },
        { t: 'Boom → Plateau → Absturz → Erholung', c: false },
        { t: 'Expansion → Kontraktion → Depression → Stabilisierung', c: false },
      ],
      explanation: 'Der Konjunkturzyklus: 1. Aufschwung/Erholung, 2. Hochkonjunktur/Überhitzung, 3. Abschwung, 4. Rezession/Tiefkonjunktur – dann wieder von vorne.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die technische Definition einer Rezession?',
      opts: [
        { t: 'Wenn die Arbeitslosenquote über 5% steigt', c: false },
        { t: 'Zwei aufeinanderfolgende Quartale mit negativem BIP-Wachstum', c: true },
        { t: 'Wenn die Inflation auf 0% fällt', c: false },
        { t: 'Wenn die Börse um mehr als 20% fällt', c: false },
      ],
      explanation: 'Technische Rezession = mind. 2 aufeinanderfolgende Quartale mit negativem realen BIP-Wachstum. Wichtig: "negativ" bedeutet Schrumpfen der Wirtschaft.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist antizyklische Fiskalpolitik?',
      opts: [
        { t: 'In guten Zeiten mehr ausgeben, in schlechten Zeiten sparen', c: false },
        { t: 'In der Rezession stimulieren (Ausgaben erhöhen/Steuern senken); in Boom bremsen', c: true },
        { t: 'Immer gleichmässige Staatsausgaben unabhängig von der Konjunktur', c: false },
        { t: 'Privatisierung staatlicher Unternehmen in Rezessionsphasen', c: false },
      ],
      explanation: 'Antizyklisch = gegen den Konjunkturzyklus: In Rezession stimuliert der Staat (mehr Ausgaben, weniger Steuern). In Hochkonjunktur bremst er (Schuldenabbau, Steuererhöhungen).',
      difficulty: 'hard',
    },
    {
      q: 'Was kennzeichnet die Hochkonjunktur/Boom-Phase?',
      opts: [
        { t: 'Hohe Arbeitslosigkeit und sinkende Produktion', c: false },
        { t: 'Volle Kapazitätsauslastung, Fachkräftemangel, steigende Löhne und Preisniveau', c: true },
        { t: 'Negative BIP-Wachstumsraten', c: false },
        { t: 'Staatseingriffe zur Wirtschaftsstimulierung', c: false },
      ],
      explanation: 'Hochkonjunktur/Boom: Wirtschaft läuft auf vollen Touren. Kapazitäten ausgelastet → Fachkräftemangel → Lohndruck → Preisdruck → Inflation droht. SNB erhöht Zins. Staat kann antizyklisch bremsen.',
      difficulty: 'medium',
    },
    {
      q: 'Was kennzeichnet den wirtschaftlichen Aufschwung?',
      opts: [
        { t: 'Sinkende Beschäftigung und fallende Investitionen', c: false },
        { t: 'Steigende Produktion, sinkende Arbeitslosigkeit, zunehmende Investitionen', c: true },
        { t: 'Vollbeschäftigung und Überhitzung', c: false },
        { t: 'Zwei Quartale mit negativem BIP-Wachstum', c: false },
      ],
      explanation: 'Aufschwung: BIP steigt, mehr Beschäftigung, mehr Investitionen, steigende Konsumnachfrage. Wirtschaft erholt sich von der Rezession. Noch keine Überhitzung wie im Boom.',
      difficulty: 'easy',
    },
    {
      q: 'Was sind automatische Stabilisatoren in der Konjunkturpolitik?',
      opts: [
        { t: 'Staatliche Konjunkturprogramme, die jedes Jahr neu beschlossen werden', c: false },
        { t: 'Mechanismen wie ALV und progressive Steuern, die ohne neue Entscheide konjunkturstabilisierend wirken', c: true },
        { t: 'SNB-Interventionen am Devisenmarkt', c: false },
        { t: 'Automatische Zinserhöhungen bei hoher Inflation', c: false },
      ],
      explanation: 'Automatische Stabilisatoren: wirken sofort ohne politische Entscheidung. In Rezession: ALV zahlt Arbeitslose → Kaufkraft bleibt → Konsum stützt sich. Progressive Steuern: In Boom steigen Steuern automatisch → bremsen Überhitzung.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist Stagflation?',
      opts: [
        { t: 'Hohe Inflation bei gleichzeitig starkem Wachstum', c: false },
        { t: 'Gleichzeitig schwaches Wachstum (oder Rezession) und steigende Preise – wirtschaftspolitisch sehr schwierig', c: true },
        { t: 'Tiefe Inflation bei hoher Arbeitslosigkeit', c: false },
        { t: 'Eine Phase der Preisstabilität und hoher Beschäftigung', c: false },
      ],
      explanation: 'Stagflation: Kombination Stagnation + Inflation. Problematisch, weil Gegenmassnahmen Zielkonflikte auslösen: Tiefer Zins → mehr Wachstum, aber mehr Inflation. Hoher Zins → weniger Inflation, aber mehr Abschwung.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist ein Konjunkturindikator?',
      opts: [
        { t: 'Ein Massstab für die langfristige Wirtschaftsentwicklung', c: false },
        { t: 'Eine wirtschaftliche Grösse, die Rückschlüsse auf die aktuelle Konjunkturlage erlaubt', c: true },
        { t: 'Ein staatliches Programm zur Konjunktursteuerung', c: false },
        { t: 'Der offizielle BIP-Bericht der Nationalbank', c: false },
      ],
      explanation: 'Konjunkturindikatoren: BIP-Wachstum, Arbeitslosenquote, Auftragslage, Konsumentenstimmung, Investitionen, Preisentwicklung. Unterschied: vorlaufend (zeigen künftige Lage), gleichlaufend, nachlaufend.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Marktwirtschaft und Planwirtschaft?',
      opts: [
        { t: 'In der Marktwirtschaft plant der Staat alles', c: false },
        { t: 'Marktwirtschaft: Ressourcen durch Preissignale; Planwirtschaft: Ressourcen durch staatliche Entscheidungen', c: true },
        { t: 'Planwirtschaft ist effizienter als Marktwirtschaft', c: false },
        { t: 'In der Planwirtschaft gibt es keine Unternehmen', c: false },
      ],
      explanation: 'Marktwirtschaft: dezentrale Koordination über Preise. Planwirtschaft: Staat entscheidet, was produziert wird. Hauptproblem Planwirtschaft: Informationsproblem (keine effizienten Preissignale) und fehlende Innovationsanreize.',
      difficulty: 'easy',
    },
    {
      q: 'Was sind Eigenschaften einer funktionierenden Marktwirtschaft?',
      opts: [
        { t: 'Staatliche Preisfestsetzung und Produktionsplanung', c: false },
        { t: 'Eigentumsrechte, Rechtssicherheit, freie Preisbildung, Vertragsfreiheit', c: true },
        { t: 'Kein staatlicher Eingriff in die Wirtschaft', c: false },
        { t: 'Staatliche Kontrolle aller Produktionsmittel', c: false },
      ],
      explanation: 'Funktionierende Marktwirtschaft braucht: Eigentumsrechte (Anreize zu Investitionen), Rechtssicherheit (Verträge werden eingehalten), freie Preisbildung (Informationssignal), Vertragsfreiheit. Ohne diese Grundlagen versagen Märkte.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist Fiskalpolitik?',
      opts: [
        { t: 'Geldpolitik der Nationalbank', c: false },
        { t: 'Staatliche Konjunkturpolitik über Steuern und Staatsausgaben', c: true },
        { t: 'Handelspolitik für Importe und Exporte', c: false },
        { t: 'Regulierung der Finanzmärkte durch den Staat', c: false },
      ],
      explanation: 'Fiskalpolitik: Staat beeinflusst Konjunktur durch: 1. Staatsausgaben (Infrastruktur, Sozialleistungen) und 2. Steuern (Steuersenkung stimuliert, Steuererhöhung bremst). Antizyklisch = gegen den Konjunkturzyklus.',
      difficulty: 'easy',
    },
    {
      q: 'Was sind Grenzen der antizyklischen Fiskalpolitik?',
      opts: [
        { t: 'Antizyklische Politik funktioniert immer perfekt', c: false },
        { t: 'Zeitliche Verzögerungen, Staatsschuldenproblem, Zielkonflikte und Unsicherheit über Wirkung', c: true },
        { t: 'Nur reiche Länder können Fiskalpolitik betreiben', c: false },
        { t: 'Fiskalpolitik kann nicht gleichzeitig mit Geldpolitik eingesetzt werden', c: false },
      ],
      explanation: 'Grenzen der Fiskalpolitik: Erkennung und Entscheidungsverzögerung, Schuldenanstieg (Budgetdefizit in Rezession), internationale Abhängigkeiten, Zielkonflikte (Stimulierung vs. Preisstabilität), politische Schwierigkeit der "Bremsung" im Boom.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist die Output-Lücke?',
      opts: [
        { t: 'Die Differenz zwischen Exporten und Importen', c: false },
        { t: 'Die Abweichung des tatsächlichen BIP vom Produktionspotenzial', c: true },
        { t: 'Die Lücke zwischen nominalem und realem BIP', c: false },
        { t: 'Das Staatsdefizit in einer Rezession', c: false },
      ],
      explanation: 'Output-Lücke: Positive Lücke (BIP > Potenzial) = Überhitzung → Inflation droht. Negative Lücke (BIP < Potenzial) = ungenutzte Kapazitäten, Arbeitslosigkeit → Stimulierung angezeigt.',
      difficulty: 'hard',
    },
    {
      q: 'Was sind angebotsorientierte wirtschaftspolitische Massnahmen?',
      opts: [
        { t: 'Steuersenkungen und Ausgabenerhöhungen in der Rezession', c: false },
        { t: 'Verbesserung der Produktionsbedingungen: Bildung, Infrastruktur, Innovation, flexible Märkte', c: true },
        { t: 'Geldpolitik der Nationalbank', c: false },
        { t: 'Staatliche Preiskontrollen', c: false },
      ],
      explanation: 'Angebotsorientierte Politik: verbessert langfristig das Produktionspotenzial. Massnahmen: Bildungsinvestitionen, Infrastruktur, Forschungsförderung, Deregulierung, flexible Arbeitsmärkte. Wirkt langfristig, nicht kurzfristig konjunkturstabilisierend.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen antizyklischer und prozyklischer Fiskalpolitik?',
      opts: [
        { t: 'Sie sind identisch', c: false },
        { t: 'Antizyklisch = gegen den Zyklus (Boom bremsen, Rezession stimulieren); prozyklisch = mit dem Zyklus (Boom stimulieren, Rezession sparen)', c: true },
        { t: 'Antizyklisch bedeutet keine Fiskalpolitik', c: false },
        { t: 'Prozyklisch ist immer die richtige Politik', c: false },
      ],
      explanation: 'Antizyklisch = stabilisierend: In Rezession mehr Ausgaben/weniger Steuern. Im Boom sparen. Prozyklisch = destabilisierend: Im Boom mehr ausgeben, in Rezession sparen (viele Staaten tun dies aus Haushaltsdruck – falsch!).',
      difficulty: 'medium',
    },
    {
      q: 'Was passiert im Abschwung mit den Lagerbeständen der Unternehmen?',
      opts: [
        { t: 'Lager werden kleiner, weil mehr verkauft wird', c: false },
        { t: 'Lager nehmen zu, weil die Nachfrage sinkt und mehr unverkauft bleibt', c: true },
        { t: 'Lager bleiben konstant', c: false },
        { t: 'Unternehmen haben im Abschwung keine Lager', c: false },
      ],
      explanation: 'Abschwung: Nachfrage sinkt → Unternehmen verkaufen weniger → Lager füllen sich → Unternehmen drosseln Produktion → weniger Beschäftigung → weniger Einkommen → noch weniger Nachfrage (Abwärtsspirale).',
      difficulty: 'medium',
    },
    {
      q: 'Was ist die Wirkung einer Steuererhöhung auf Konsum und BIP?',
      opts: [
        { t: 'BIP steigt, weil der Staat mehr Einnahmen hat', c: false },
        { t: 'Konsum und BIP sinken tendenziell, weil Haushalte weniger verfügbares Einkommen haben', c: true },
        { t: 'Keine Auswirkung auf BIP', c: false },
        { t: 'BIP steigt, weil höhere Steuern Investitionen fördern', c: false },
      ],
      explanation: 'Steuererhöhung: Haushalte haben weniger verfügbares Einkommen → weniger Konsum → BIP sinkt (kontraktive Wirkung). In der Hochkonjunktur eingesetzt, um Überhitzung zu dämpfen.',
      difficulty: 'medium',
    },
    {
      q: 'Was bedeutet Konjunktur im volkswirtschaftlichen Sinne?',
      opts: [
        { t: 'Die langfristige Wachstumstendenz der Wirtschaft', c: false },
        { t: 'Kurzfristige Schwankungen der wirtschaftlichen Aktivität um den langfristigen Trend', c: true },
        { t: 'Das durchschnittliche Wirtschaftswachstum über 10 Jahre', c: false },
        { t: 'Die Entwicklung der Börsenkurse', c: false },
      ],
      explanation: 'Konjunktur = kurzfristige Schwankungen des BIP. Unterschied: Trend (langfristiges Wachstumspotenzial, z.B. 1-2% p.a.) vs. Konjunktur (Abweichungen davon, z.B. +4% im Boom, -2% in der Rezession).',
      difficulty: 'easy',
    },
    {
      q: 'Wie wirken progressive Steuern als automatischer Stabilisator im Boom?',
      opts: [
        { t: 'Steuereinnahmen sinken im Boom – stimulieren die Wirtschaft weiter', c: false },
        { t: 'Steuereinnahmen steigen überproportional im Boom – dämpfen die Nachfrage automatisch', c: true },
        { t: 'Progressive Steuern haben keinen konjunkturellen Effekt', c: false },
        { t: 'Nur regressive Steuern wirken stabilisierend', c: false },
      ],
      explanation: 'Progressive Besteuerung: Bei steigendem Einkommen (Boom) steigt der Steuersatz → Steuereinnahmen wachsen überproportional → weniger verfügbares Einkommen → bremst Überhitzung automatisch, ohne neue politische Entscheidung.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist der Unterschied zwischen Rezession und Depression?',
      opts: [
        { t: 'Beide Begriffe sind identisch', c: false },
        { t: 'Rezession: 2+ Quartale negatives BIP-Wachstum; Depression: schwere, lange Rezession mit massivem BIP-Einbruch', c: true },
        { t: 'Rezession betrifft nur Entwicklungsländer', c: false },
        { t: 'Depression = Deflation, Rezession = Inflation', c: false },
      ],
      explanation: 'Rezession (technisch): 2 aufeinanderfolgende Quartale mit negativem BIP-Wachstum. Depression: sehr schwere und lang anhaltende Rezession (Beispiel: Weltwirtschaftskrise 1929-33, USA -30% BIP). Heute oft "Rezession" für mässigen Abschwung.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Konjunkturzyklus und Strukturwandel?',
      opts: [
        { t: 'Beides beschreibt wirtschaftliche Schwankungen', c: false },
        { t: 'Konjunktur: kurzfristige Schwankungen (3-10 Jahre); Strukturwandel: langfristige Verschiebungen in Wirtschaftssektoren', c: true },
        { t: 'Strukturwandel ist schneller als Konjunkturzyklen', c: false },
        { t: 'Konjunkturzyklen betreffen nur die Industrie, Strukturwandel alle Sektoren', c: false },
      ],
      explanation: 'Konjunktur: zyklische Schwankungen um den Wachstumstrend (4 Phasen). Strukturwandel: langfristige Verlagerung (z.B. von Landwirtschaft zu Industrie zu Dienstleistungen, Digitalisierung). Strukturwandel ≠ Konjunkturschwankung, braucht andere Massnahmen.',
      difficulty: 'medium',
    },
    {
      q: 'Was sind "automatische Stabilisatoren" in der Konjunkturpolitik?',
      opts: [
        { t: 'Staatliche Eingriffe, die per Gesetz automatisch ausgelöst werden', c: false },
        { t: 'Staatliche Einnahmen/Ausgaben, die automatisch gegenzyklisch wirken (z.B. Arbeitslosenversicherung, progressive Steuer)', c: true },
        { t: 'Die automatische Anpassung der Geldmenge durch die SNB', c: false },
        { t: 'Technologische Entwicklungen, die Krisen abfedern', c: false },
      ],
      explanation: 'Automatische Stabilisatoren: wirken ohne politische Entscheidung. Abschwung → mehr Arbeitslose → mehr Arbeitslosengelder (Staatsausgaben steigen automatisch, stützen Nachfrage). Progressive Steuer: Einkommen sinkt → Steuerlast sinkt überproportional → bleibt mehr Kaufkraft.',
      difficulty: 'hard',
    },
    {
      q: 'Warum kann Fiskalpolitik in einer offenen Volkswirtschaft (z.B. Schweiz) weniger wirksam sein?',
      opts: [
        { t: 'Weil die Schweiz keine Staatsschulden hat', c: false },
        { t: 'Weil ein Teil des Nachfrageimpulses durch Importe "verloren" geht statt im Inland zu bleiben', c: true },
        { t: 'Weil die Schweiz keine Fiskalpolitik betreiben darf', c: false },
        { t: 'Weil die SNB alle fiskalpolitischen Massnahmen blockiert', c: false },
      ],
      explanation: 'Import-Leakage: staatliche Ausgaben stimulieren zwar die Nachfrage, aber ein Teil davon fliesst in Importe (ausländische Güter). In kleinen, offenen Volkswirtschaften (Schweiz: hohe Importquote) verpufft Fiskalpolitik teilweise. Multiplikatoreffekt kleiner.',
      difficulty: 'hard',
    },
    {
      q: 'Was ist der Unterschied zwischen expansiver und kontraktiver Geldpolitik?',
      opts: [
        { t: 'Expansiv = staatliche Ausgaben erhöhen; Kontraktiv = Steuern erhöhen', c: false },
        { t: 'Expansiv = Leitzins senken/Geldmenge erhöhen; Kontraktiv = Leitzins erhöhen/Geldmenge reduzieren', c: true },
        { t: 'Expansiv = Inflation fördern; Kontraktiv = Deflation fördern', c: false },
        { t: 'Beide Begriffe beschreiben Fiskalpolitik, nicht Geldpolitik', c: false },
      ],
      explanation: 'Geldpolitik-Tools: Expansiv (lockere Geldpolitik): Leitzins senken → günstigere Kredite → mehr Konsum/Investitionen → Konjunktur ankurbeln. Kontraktiv (straffe Geldpolitik): Leitzins erhöhen → teurere Kredite → weniger Nachfrage → Inflation bekämpfen.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Phillips-Kurven-Zusammenhang?',
      opts: [
        { t: 'Steigt das BIP, sinkt die Inflation', c: false },
        { t: 'Historisch: negativer Zusammenhang zwischen Inflation und Arbeitslosigkeit – niedrige Arbeitslosigkeit geht mit höherer Inflation einher', c: true },
        { t: 'Höhere Staatsausgaben führen immer zu Inflation', c: false },
        { t: 'Hohe Zinsen führen zu mehr Arbeitslosigkeit und höherer Inflation', c: false },
      ],
      explanation: 'Phillips-Kurve: kurzfristig Trade-off zwischen Inflation und Arbeitslosigkeit. Tiefer Leitzins → mehr Beschäftigung → höhere Löhne → mehr Nachfrage → Inflation steigt. Problem: Stagflation (1970er) widerlegte den stabilen Phillips-Kurven-Zusammenhang langfristig.',
      difficulty: 'hard',
    },
    {
      q: 'Was versteht man unter "Crowding-out"?',
      opts: [
        { t: 'Staatliche Unternehmen, die private Unternehmen vom Markt verdrängen', c: false },
        { t: 'Staatliche Kreditaufnahme verdrängt private Investitionen, weil sie Zinsen in die Höhe treibt', c: true },
        { t: 'Der Effekt, wenn Grossunternehmen kleine Firmen aus dem Markt drängen', c: false },
        { t: 'Wenn Importe die einheimische Produktion verdrängen', c: false },
      ],
      explanation: 'Crowding-out: Staat leiht viel Geld am Kapitalmarkt → Nachfrage nach Kapital steigt → Zinsen steigen → private Investitionen werden verdrängt (zu teuer). Argument der Liberalen gegen expansive Fiskalpolitik: "Staat verdrängt Privaten".',
      difficulty: 'hard',
    },
    {
      q: 'Was ist der Unterschied zwischen Konjunkturpolitik und Strukturpolitik?',
      opts: [
        { t: 'Konjunkturpolitik ist langfristig, Strukturpolitik kurzfristig', c: false },
        { t: 'Konjunkturpolitik: kurzfristige Stabilisierung der Nachfrage; Strukturpolitik: langfristige Verbesserung der Angebotsseite', c: true },
        { t: 'Strukturpolitik betrifft nur die Industrie', c: false },
        { t: 'Beide Politiken verfolgen identische Ziele', c: false },
      ],
      explanation: 'Konjunkturpolitik: kurzfristig, Nachfrageseite (Fiskalpolitik, Geldpolitik). Strukturpolitik: langfristig, Angebotsseite: Bildung, Infrastruktur, Forschung, Deregulierung. Strukturwandel (Digitalisierung) erfordert Strukturpolitik, nicht Konjunkturpolitik.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist ein Wirtschaftsindikator und gib je ein Beispiel für einen Früh-, Jetzt- und Spätindikator?',
      opts: [
        { t: 'BIP = Frühindikator, Aktienkurse = Jetzt, Arbeitslosigkeit = Spätindikator', c: false },
        { t: 'Aktienkurse, Konsumklima = Frühindikatoren; BIP = Jetzt; Arbeitslosigkeit, Insolvenzen = Späte Indikatoren', c: true },
        { t: 'Alle Indikatoren zeigen denselben Zustand der Wirtschaft', c: false },
        { t: 'Zinsen = Frühindikator; Löhne = Jetzt; Exporte = Spätindikator', c: false },
      ],
      explanation: 'Frühindikatoren: signalisieren kommende Entwicklung (Aktien, Baugesuche, Konsumklima-Index, Auftragseingang). Jetzige Indikatoren: BIP, Umsätze. Späte Indikatoren: folgen der Konjunktur nach (Arbeitslosigkeit, Insolvenzen). Kombiniert ergeben sie Konjunkturdiagnose.',
      difficulty: 'hard',
    },
    {
      q: 'Was sind die Phasen des Konjunkturzyklus der Reihe nach?',
      opts: [
        { t: 'Boom → Aufschwung → Abschwung → Rezession', c: false },
        { t: 'Aufschwung (Expansion) → Hochkonjunktur (Boom) → Abschwung (Rezession) → Tiefpunkt (Trough)', c: true },
        { t: 'Rezession → Boom → Depression → Erholung', c: false },
        { t: 'Inflation → Deflation → Stagnation → Wachstum', c: false },
      ],
      explanation: 'Vier Phasen: 1. Aufschwung: BIP wächst, Beschäftigung steigt. 2. Hochkonjunktur/Boom: Kapazitäten ausgelastet, Inflation droht. 3. Abschwung/Rezession: BIP sinkt, Arbeitslosigkeit steigt. 4. Tiefpunkt/Trough: Wendepunkt nach unten. Dann beginnt neuer Zyklus.',
      difficulty: 'easy',
    },
  ])

  console.log('✅ Seed complete!')
  console.log('Topics created: 13 (nach WR-Stoffprogramm 2026)')
  console.log('  BWL: Marketing, Finanzierung, Kapitalanlagen & Banken/Börsen, Versicherungen')
  console.log('  Recht: Allg. Vertragslehre & Kaufvertrag, Verträge auf Arbeitsleistung, Gesellschaftsrecht & Handelsregister, Familienrecht, Erbrecht')
  console.log('  VWL: Wirtschaftskreislauf, Preisbildung, Geld & Preisstabilität, Konjunktur & Konjunkturpolitik')
}

async function finalize() {
  await prisma.$disconnect()
  console.log('✅ Seed complete!')
}

// Helper: create quiz questions with options
async function createQuiz(
  chapterId: string,
  questions: Array<{
    q: string
    opts: Array<{ t: string; c: boolean }>
    explanation: string
    difficulty: string
  }>
) {
  for (let i = 0; i < questions.length; i++) {
    const { q, opts, explanation, difficulty } = questions[i]
    await prisma.quizQuestion.create({
      data: {
        chapterId,
        questionText: q,
        questionType: 'multiple_choice',
        explanation,
        difficulty,
        order: i,
        options: {
          create: opts.map((o, idx) => ({
            text: o.t,
            isCorrect: o.c,
            order: idx,
          })),
        },
      },
    })
  }
}

main()
  .then(() => finalize())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
