import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function insertTopic(slug, title, description, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,band,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'BarChart2','violet','abschluss','frw','3',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET title=$2, description=$3, published=true, band='3', "updatedAt"=NOW()`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET summary=$7, "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}
async function addGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`, [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), points[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  const existing = await client.query(`SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (const q of existing.rows)
    await client.query(`DELETE FROM "QuizOption" WHERE "questionId"=$1`, [q.id])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(`INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(`INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

const tId = await insertTopic(
  'frw-kostenrechnung',
  'Kostenrechnung',
  'Betriebsabrechnungsbogen (BAB), Kalkulation im Produktionsbetrieb, Deckungsbeitragsrechnung und Nutzschwellenanalyse.',
  18
)

// ── KAPITEL 1: Betriebsabrechnung und Kalkulation ──
const ch1 = await insertChapter(tId, 'betriebsabrechnung-kalkulation', 'Betriebsabrechnung und Kalkulation', 'BAB, Kostenstellen, Kostenträger und Kalkulation im Produktionsbetrieb', 1,
`VON DER FIBU ZUR INTERNEN RECHNUNG — Die Erfolgsrechnung zeigt das Gesamtergebnis, nicht aber wo Kosten entstehen oder welches Produkt welchen Beitrag leistet. Die Betriebsbuchhaltung (Bebu) überführt Aufwände in betriebsnotwendige Kosten und liefert Grundlagen für Führung, Kalkulation und Kontrolle.
BETRIEBSABRECHNUNGSBOGEN (BAB) — Das zentrale Instrument der Betriebsabrechnung. Drei Stufen: (1) Kostenartenrechnung: Welche Kosten liegen vor? (2) Kostenstellenrechnung: Wo sind die Kosten angefallen? (3) Kostenträgerrechnung: Welches Produkt trägt die Kosten?
KOSTENARTENRECHNUNG — Aufwand (Fibu) +/– sachliche Abgrenzung = Kosten (Bebu). Korrekturen: Auflösung stiller Reserven → Kosten höher. Bildung stiller Reserven → Kosten tiefer. Überhöhte Abschreibungen → Kosten tiefer. Betriebsfremde Aufwände → nicht übernehmen.
KOSTENSTELLENRECHNUNG — Gemeinkosten werden den Abteilungen zugeordnet (Einkauf und Lager, Fertigung 1, Fertigung 2, Verwaltung und Vertrieb). Verteilungsschlüssel: Fläche, Arbeitspensen, Verbrauch, Buchwerte. Einzelkosten gehen direkt auf den Kostenträger.
KOSTENTRÄGERRECHNUNG — Einzelkosten direkt dem Produkt zuordnen. Gemeinkosten über Zuschlagssätze umlegen: MGK = % der Einzelmaterialkosten; FGK 1 = % der Einzellöhne; FGK 2 = CHF/Maschinenstunde; VVGK = % der Herstellkosten verkaufter Produkte.
KALKULATIONSSCHEMA — Einzelmaterial + MGK = Materialkosten. Einzellöhne + FGK = Fertigungskosten. Materialkosten + Fertigungskosten = Herstellkosten. Herstellkosten + VVGK = Selbstkosten. Selbstkosten + Gewinn = Nettoerlös.
VOM BETRIEBSERFOLG ZUM UNTERNEHMENSERFOLG — Betriebserfolg (Bebu) +/– sachliche Abgrenzungen = Betriebserfolg (Fibu) +/– ausserordentlicher/betriebsfremder Erfolg, direkte Steuern = Unternehmenserfolg (Fibu).`)

await addGoals(ch1, [
  'Du kannst den Unterschied zwischen Aufwand (Fibu) und Kosten (Bebu) erklären.',
  'Du kennst die drei Stufen des Betriebsabrechnungsbogens (BAB) und ihre Funktion.',
  'Du kannst sachliche Abgrenzungen berechnen und Kosten korrekt ermitteln.',
  'Du kannst Gemeinkosten mit geeigneten Schlüsseln auf Kostenstellen verteilen.',
  'Du kannst Selbstkosten und Nettoerlöse im Produktionsbetrieb kalkulieren.',
  'Du kannst den Betriebserfolg der Bebu in den Unternehmenserfolg der Fibu überführen.',
])

await addTerms(ch1, [
  ['Betriebsbuchhaltung (Bebu)', 'Interne Unternehmensrechnung; überführt Fibu-Aufwände in betriebsnotwendige Kosten und liefert Entscheidungsgrundlagen.'],
  ['Betriebsabrechnungsbogen (BAB)', 'Tabellarisches Instrument mit Kostenartenrechnung, Kostenstellenrechnung und Kostenträgerrechnung.'],
  ['Sachliche Abgrenzung', 'Korrektur zwischen Fibu und Bebu: eliminiert betriebsfremde Aufwände, korrigiert stille Reserven und überhöhte Abschreibungen.'],
  ['Einzelkosten', 'Kosten, die einem Produkt direkt zugeordnet werden können (z. B. Einzelmaterial, Einzellöhne).'],
  ['Gemeinkosten', 'Kosten, die nicht direkt zugeordnet werden können; Umlage über Kostenstellen und Zuschlagssätze.'],
  ['Materialgemeinkosten (MGK)', 'Gemeinkosten der Materialstelle; Satz = MGK total × 100 / Einzelmaterialkosten.'],
  ['Fertigungsgemeinkosten (FGK)', 'Gemeinkosten der Fertigungsstellen; prozentual zu Einzellöhnen oder als CHF-Satz pro Maschinenstunde.'],
  ['Verwaltungs- und Vertriebsgemeinkosten (VVGK)', 'Gemeinkosten von Verwaltung und Vertrieb; Satz = VVGK total × 100 / HK verkaufter Produkte.'],
  ['Herstellkosten (HK)', 'Material- + Fertigungskosten; vor VVGK.'],
  ['Selbstkosten', 'Herstellkosten + VVGK; Vollkostenbasis für Kalkulation.'],
])

await addPoints(ch1, [
  'Aufwand (Fibu) +/– sachliche Abgrenzung = Kosten (Bebu).',
  'Auflösung stiller Reserven in Fibu → Kosten in Bebu höher.',
  'Bildung stiller Reserven / überhöhte Abschreibungen → Kosten in Bebu tiefer.',
  'Betriebsfremde oder ausserordentliche Aufwände → nicht in Kosten übernehmen.',
  'MGK-Satz = MGK total / Einzelmaterialkosten × 100.',
  'FGK-Satz = FGK total / Einzellöhne × 100 (oder CHF/Maschinenstunde für FGK 2).',
  'VVGK-Satz = VVGK total / HK verkaufte Produkte × 100.',
  'Herstellkosten = Einzelmaterial + MGK + Einzellöhne + FGK.',
  'Selbstkosten = Herstellkosten + VVGK.',
  'Lagerveränderung Halb-/Fertigfabrikate: Zunahme → HK verkaufte < HK produzierte.',
])

await addQuiz(ch1, [
  {
    q: 'Was ist der Unterschied zwischen Aufwand (Fibu) und Kosten (Bebu)?',
    opts: [
      ['Kosten = Aufwand +/– sachliche Abgrenzungen; nur betriebsnotwendige Werteverzehre zählen', true],
      ['Aufwand und Kosten sind in der Praxis identisch', false],
      ['Kosten umfassen auch betriebsfremde Ausgaben, Aufwand nicht', false],
      ['Kosten = Aufwand + alle Steuern und Abschreibungen', false],
    ],
    exp: 'Durch sachliche Abgrenzungen werden betriebsfremde und ausserordentliche Aufwände eliminiert und stille Reserven sowie überhöhte Abschreibungen korrigiert.',
    diff: 'medium',
  },
  {
    q: 'Was bewirkt eine Auflösung stiller Reserven in der Fibu auf die Kosten in der Bebu?',
    opts: [
      ['Kosten sind höher als Aufwand — der externe Aufwand war zu tief', true],
      ['Kosten sind tiefer als Aufwand', false],
      ['Keine Auswirkung auf die Bebu', false],
      ['Kosten und Aufwand bleiben gleich', false],
    ],
    exp: 'Auflösung SR → Fibu-Aufwand ist zu tief → sachliche Abgrenzung: Kosten werden erhöht.',
    diff: 'medium',
  },
  {
    q: 'Einzelmaterialkosten CHF 1\'400\'000; MGK total CHF 420\'000. Wie hoch ist der MGK-Satz?',
    opts: [
      ['30 %', true],
      ['3 %', false],
      ['33.3 %', false],
      ['23 %', false],
    ],
    exp: 'MGK-Satz = 420\'000 × 100 / 1\'400\'000 = 30 %.',
    diff: 'easy',
  },
  {
    q: 'Welcher Satz wird für die Fertigungsgemeinkosten 2 (FGK 2) verwendet?',
    opts: [
      ['CHF pro Maschinenstunde', true],
      ['Prozent der Einzellöhne', false],
      ['Prozent des Einzelmaterials', false],
      ['Prozent der Herstellkosten', false],
    ],
    exp: 'FGK 2 wird als CHF-Satz pro Maschinenstunde verrechnet, da Fertigungsstelle 2 maschinenintensiv ist.',
    diff: 'easy',
  },
  {
    q: 'Produktgruppe A zeigt laut Kostenrechnung einen Verlust. Was sollte sofort gefolgert werden?',
    opts: [
      ['Nichts Vorschnelles — Verlustprodukte können trotzdem zur Deckung von Gemeinkosten beitragen', true],
      ['Das Produkt sofort einstellen', false],
      ['Den Preis sofort verdoppeln', false],
      ['Das Produkt ist zwingend unprofitabel und belastet das Unternehmen', false],
    ],
    exp: 'Verlustbringende Produkte leisten oft einen Deckungsbeitrag zu Fixkosten — eine vorschnelle Einstellung kann die Fixkostensituation verschlechtern.',
    diff: 'medium',
  },
])

// ── KAPITEL 2: Deckungsbeitrag und Nutzschwelle ──
const ch2 = await insertChapter(tId, 'deckungsbeitrag-nutzschwelle', 'Deckungsbeitrag und Nutzschwelle', 'Teilkostenrechnung, Break-even-Analyse, grafische Darstellung', 2,
`VOLLKOSTEN VS. TEILKOSTEN — Vollkostenrechnung: alle Kosten werden den Produkten zugeordnet → Analyse, Kalkulation, Kontrolle. Teilkostenrechnung (Deckungsbeitragsrechnung): trennt variable und fixe Kosten → kurzfristige Steuerung, Entscheidungsvorbereitung, Nutzschwellenanalyse.
FIXE UND VARIABLE KOSTEN — Variable Kosten verändern sich proportional mit der Menge (Einzelmaterial, Einzellöhne je nach Art). Fixe Kosten bleiben im betrachteten Intervall konstant (Miete, Versicherungen, Verwaltung). In der Deckungsbeitragsrechnung werden alle betrieblichen Gemeinkosten vereinfacht als fixe Kosten behandelt.
DECKUNGSBEITRAGSRECHNUNG — Grundschema: Nettoerlös − variable Kosten = Deckungsbeitrag (DB). DB − fixe Kosten = Gewinn/Verlust. Der Deckungsbeitrag dient zuerst zur Deckung der Fixkosten. Erst wenn DB = Fixkosten ist die Nutzschwelle erreicht; ab dann entsteht Gewinn.
NUTZSCHWELLE (BREAK-EVEN) — Mengenmässige Nutzschwelle = fixe Kosten / DB je Stück. Wertmässige Nutzschwelle = mengenmässige Nutzschwelle × Nettoerlös je Stück. Ohne Mengenangabe: wertmässige NS = fixe Kosten × 100 / Bruttogewinnquote.
ZIELMENGENRECHNUNG — Erforderliche Menge für Zielgewinn = (fixe Kosten + Zielgewinn) / DB je Stück.
GRAFISCHE DARSTELLUNG — Die Nutzschwelle erscheint als: (1) Schnittpunkt Nettoerlösgerade und Selbstkostengerade. (2) Schnittpunkt Deckungsbeitragsgerade und Fixkostenlinie. (3) Schnittpunkt Gewinn-/Verlustlinie mit der Nulllinie. Links der Nutzschwelle: Verlustzone. Rechts: Gewinnzone.
BEISPIEL PIZZA — Nettoerlös je Stück CHF 15, variable Kosten je Stück CHF 5, DB je Stück CHF 10. Fixe Kosten CHF 300'000. Mengenmässige NS = 300'000 / 10 = 30'000 Pizzen. Wertmässige NS = 30'000 × 15 = CHF 450'000.`)

await addGoals(ch2, [
  'Du kennst den Unterschied zwischen fixen und variablen Kosten.',
  'Du kannst den Deckungsbeitrag je Stück und total berechnen.',
  'Du kannst die mengenmässige und wertmässige Nutzschwelle berechnen.',
  'Du kannst die erforderliche Menge für einen Zielgewinn bestimmen.',
  'Du kannst die Nutzschwelle grafisch darstellen und Gewinn-/Verlustzonen beschriften.',
  'Du kennst den Unterschied zwischen Vollkosten- und Teilkostenrechnung.',
])

await addTerms(ch2, [
  ['Variable Kosten', 'Kosten, die sich proportional mit der Produktions- oder Absatzmenge verändern (z. B. Einzelmaterial, variable Löhne).'],
  ['Fixe Kosten', 'Kosten, die innerhalb des betrachteten Bereichs unabhängig von der Menge konstant bleiben (z. B. Miete, Versicherungen, Verwaltung).'],
  ['Deckungsbeitrag (DB)', 'Nettoerlös minus variable Kosten; Beitrag eines Produkts zur Deckung der Fixkosten und zum Gewinn.'],
  ['Nutzschwelle (Break-even)', 'Menge oder Umsatz, bei der weder Gewinn noch Verlust entsteht; DB = fixe Kosten.'],
  ['Mengenmässige Nutzschwelle', 'Fixe Kosten / Deckungsbeitrag je Stück.'],
  ['Wertmässige Nutzschwelle', 'Mengenmässige Nutzschwelle × Nettoerlös je Stück; oder: fixe Kosten / Bruttogewinnquote × 100.'],
  ['Bruttogewinnquote', 'Deckungsbeitrag / Nettoerlös × 100 %; Anteil des Nettoerlöses, der zur Deckung der Fixkosten dient.'],
  ['Selbstkosten', 'Fixe + variable Kosten; bei der Nutzschwelle gleich dem Nettoerlös.'],
])

await addPoints(ch2, [
  'Deckungsbeitrag je Stück = Nettoerlös − variable Kosten je Stück.',
  'Mengenmässige Nutzschwelle = fixe Kosten / DB je Stück.',
  'Wertmässige Nutzschwelle = NS-Menge × Nettoerlös je Stück.',
  'Ohne Mengendaten: wertmässige NS = fixe Kosten / Bruttogewinnquote × 100.',
  'Zielgewinn: erforderliche Menge = (fixe Kosten + Zielgewinn) / DB je Stück.',
  'Grafik: Nettoerlösgerade und Selbstkostengerade → Schnittpunkt = Nutzschwelle.',
  'Variable Kosten: steigen proportional mit der Menge.',
  'Fixe Kosten: horizontale Linie, unabhängig von der Menge.',
  'Unterhalb NS: Verlustzone. Oberhalb NS: Gewinnzone.',
])

await addQuiz(ch2, [
  {
    q: 'Nettoerlös je Stück CHF 15, variable Kosten je Stück CHF 5. Wie hoch ist der Deckungsbeitrag je Stück?',
    opts: [
      ['CHF 10', true],
      ['CHF 5', false],
      ['CHF 15', false],
      ['CHF 20', false],
    ],
    exp: 'DB = Nettoerlös − variable Kosten = 15 − 5 = CHF 10.',
    diff: 'easy',
  },
  {
    q: 'Fixe Kosten CHF 300\'000, Deckungsbeitrag je Stück CHF 10. Wie lautet die mengenmässige Nutzschwelle?',
    opts: [
      ['30\'000 Stück', true],
      ['3\'000 Stück', false],
      ['300\'000 Stück', false],
      ['10\'000 Stück', false],
    ],
    exp: 'Mengenmässige NS = 300\'000 / 10 = 30\'000 Stück.',
    diff: 'easy',
  },
  {
    q: 'Mengenmässige NS 30\'000 Stück, Nettoerlös je Stück CHF 15. Wie hoch ist die wertmässige Nutzschwelle?',
    opts: [
      ['CHF 450\'000', true],
      ['CHF 300\'000', false],
      ['CHF 30\'000', false],
      ['CHF 150\'000', false],
    ],
    exp: 'Wertmässige NS = 30\'000 × 15 = CHF 450\'000.',
    diff: 'easy',
  },
  {
    q: 'Fixe Kosten CHF 300\'000, DB je Stück CHF 10, Zielgewinn CHF 50\'000. Wie viele Stück müssen verkauft werden?',
    opts: [
      ['35\'000 Stück', true],
      ['30\'000 Stück', false],
      ['50\'000 Stück', false],
      ['25\'000 Stück', false],
    ],
    exp: 'Erforderliche Menge = (300\'000 + 50\'000) / 10 = 350\'000 / 10 = 35\'000 Stück.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Hauptunterschied zwischen Vollkosten- und Teilkostenrechnung?',
    opts: [
      ['Vollkosten: alle Kosten den Produkten zuordnen (Analyse/Kalkulation). Teilkosten: fixe vs. variable trennen (Steuerung/Entscheidung).', true],
      ['Teilkostenrechnung berücksichtigt mehr Kosten als die Vollkostenrechnung', false],
      ['Vollkostenrechnung dient nur der Nutzschwellenanalyse', false],
      ['Es gibt keinen Unterschied — beide führen zum selben Ergebnis', false],
    ],
    exp: 'Vollkostenrechnung = Vergangenheitsanalyse und Kalkulation. Teilkostenrechnung = zukunftsorientierte Steuerung, Deckungsbeiträge und Break-even.',
    diff: 'medium',
  },
  {
    q: 'Bei welcher Menge entsteht weder Gewinn noch Verlust (Nettoerlös CHF 50, var. Kosten CHF 30, fixe Kosten CHF 100\'000)?',
    opts: [
      ['5\'000 Stück', true],
      ['2\'000 Stück', false],
      ['10\'000 Stück', false],
      ['3\'333 Stück', false],
    ],
    exp: 'DB = 50 − 30 = 20. Mengenmässige NS = 100\'000 / 20 = 5\'000 Stück.',
    diff: 'medium',
  },
  {
    q: 'Welche drei Darstellungsmöglichkeiten zeigen die Nutzschwelle grafisch?',
    opts: [
      ['Schnittpunkt: (1) Nettoerlös/Selbstkosten, (2) DB/Fixkosten, (3) Gewinn-Verlust-Linie/Nulllinie', true],
      ['Schnittpunkt: (1) variable/fixe Kosten, (2) Gewinn/Verlust, (3) Umsatz/Aufwand', false],
      ['Nur der Schnittpunkt von Nettoerlös und Fixkosten', false],
      ['Nutzschwelle lässt sich nicht grafisch darstellen', false],
    ],
    exp: 'Alle drei Darstellungen zeigen denselben Punkt — die Nutzschwelle — auf unterschiedliche Weise.',
    diff: 'medium',
  },
])

console.log('✅ Kostenrechnung Band 3 komplett eingefügt!')
await client.end()
