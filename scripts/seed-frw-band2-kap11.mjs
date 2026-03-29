import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function insertTopic(slug, title, description, examType, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'Globe','blue',$5,'frw',$6,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET title=$3, description=$4, "updatedAt"=NOW()`,
    [topicId, slug, title, description, examType, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET title=$3, subtitle=$4, summary=$7, "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function addGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1])
}

async function addTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1])
}

async function addPoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1])
}

async function addQuiz(chId, questions) {
  // Delete options before questions (FK constraint)
  await client.query(`DELETE FROM "QuizOption" WHERE "questionId" IN (SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1)`, [chId])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff || 'medium', i + 1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j + 1])
  }
}

// ─── Topic ────────────────────────────────────────────────────────────────────

const tId = await insertTopic(
  'frw-kennzahlenanalyse',
  'Analyse der Bilanz & Erfolgsrechnung',
  'Alle wichtigen Kennzahlen: Liquidität, Rentabilität, Kapitalstruktur, Cashflow und Anlagendeckung.',
  'abschluss',
  17
)

// ─── Chapter ──────────────────────────────────────────────────────────────────

const ch = await insertChapter(
  tId,
  'bilanzanalyse',
  'Analyse der Bilanz und Erfolgsrechnung',
  'Kennzahlen: Liquidität, Rentabilität, Kapitalstruktur, Anlagedeckung und Cashflow',
  1,
  `Die Bilanz- und Erfolgsanalyse beurteilt die wirtschaftliche Lage eines Unternehmens anhand von Kennzahlen. Vorgehen: 1. Berechnen — 2. Zielgrösse nennen — 3. Interpretieren. Stets bereinigte Bilanz (stille Reserven aufgedeckt) verwenden.

LIQUIDITÄTSKENNZAHLEN (Zahlungsbereitschaft):
• Cash Ratio (LG 1) = Flüssige Mittel / kurzfr. FK × 100 → Ziel: ≥ 20%
  Nur sofort verfügbare Mittel (Kasse, Bank, kurzfristige Wertschriften) — strengste Messung.
• Quick Ratio (LG 2) = (Flüssige Mittel + Forderungen) / kurzfr. FK × 100 → Ziel: ≥ 100%
  Ohne Warenverkauf kurzfristige Schulden decken — praxisrelevanteste Kennzahl.
• Current Ratio (LG 3) = Umlaufvermögen / kurzfr. FK × 100 → Ziel: ≥ 150%
  Gesamtes UV gegen kurzfristiges FK — umfassend, aber auch gröber wegen Vorräten.

FINANZIERUNGSKENNZAHLEN (Kapitalstruktur):
• EK-Quote (Eigenfinanzierungsgrad) = EK / GK × 100 → Ziel: ≥ 30%
• FK-Quote (Fremdfinanzierungsgrad) = FK / GK × 100 → Ziel: ≤ 70%
• Selbstfinanzierungsgrad = Zuwachskapital / Grundkapital × 100 → altersabhängig
• ADG 1 = EK / AV × 100 → Ziel: ≥ 75%
• ADG 2 = (EK + langfr. FK) / AV × 100 → Ziel: ≥ 100% — GOLDENE BILANZREGEL (Pflicht!)
  Anlagevermögen muss durch langfristiges Kapital gedeckt sein.

RENTABILITÄTSKENNZAHLEN:
• EK-Rentabilität = Reingewinn / EK × 100 → Ziel: ≥ 8%
  Rendite auf das investierte Eigenkapital der Eigentümer.
• GK-Rentabilität = (Reingewinn + FK-Zinsen) / GK × 100 → Ziel: ≥ 6%
  Unabhängig von Finanzierungsstruktur — zwischen Firmen vergleichbar.
• Umsatzrentabilität = Reingewinn / Betriebsertrag × 100 → Handel ≥ 1,5%; Industrie ≥ 5%

CASHFLOW-KENNZAHLEN:
• Cashflow = Reingewinn + Abschreibungen (Abschreibungen = Aufwand ohne Geldabfluss)
• Cashflow-Marge = Cashflow / Betriebsertrag × 100 → Ziel: deutlich > Umsatzrentabilität
• Effektivverschuldung = FK − (Flüssige Mittel + Forderungen) — «echte» Nettoschulden
• Verschuldungsfaktor = Effektivverschuldung / Cashflow → Ziel: < 5 Jahre (Banken-Massstab)

AKTIVITÄTSKENNZAHLEN:
• Debitorenumschlag = Kreditverkäufe / Debitorenbestand → Ziel: ≥ 8×/Jahr
• Kundenfrist = 360 / Debitorenumschlag → Ziel: < 45 Tage
• Lagerumschlag = Warenaufwand / Lagerbestand → branchenabhängig
• Lagerdauer = 360 / Lagerumschlag → branchenabhängig`
)

// ─── Learning Goals (min 6) ───────────────────────────────────────────────────

await addGoals(ch, [
  'Du kannst alle Liquiditätskennzahlen (Cash Ratio, Quick Ratio, Current Ratio) berechnen und die Zielgrössen nennen.',
  'Du kannst Finanzierungskennzahlen (EK-Quote, FK-Quote, Selbstfinanzierungsgrad) berechnen und interpretieren.',
  'Du kannst die Anlagedeckungsgrade 1 und 2 berechnen und erklärst die Goldene Bilanzregel.',
  'Du kannst Rentabilitätskennzahlen (EK-, GK- und Umsatzrentabilität) berechnen und weisst, welche Zielgrössen gelten.',
  'Du kannst den Cashflow, die Cashflow-Marge, die Effektivverschuldung und den Verschuldungsfaktor berechnen.',
  'Du kannst Aktivitätskennzahlen (Debitorenumschlag, Kundenfrist, Lagerumschlag, Lagerdauer) berechnen.',
  'Du kannst Kennzahlen korrekt interpretieren: Berechnen — Zielgrösse — Beurteilung.',
  'Du weisst, welche Anspruchsgruppen welche Kennzahlen besonders interessieren (Banken, Aktionäre, Management).',
])

// ─── Key Terms (min 12) ───────────────────────────────────────────────────────

await addTerms(ch, [
  ['Cash Ratio (Liquiditätsgrad 1)', 'Flüssige Mittel / kurzfristiges FK × 100. Sofort verfügbare Mittel (Kasse, Bank, kurzfr. Wertschriften). Ziel: ≥ 20%.'],
  ['Quick Ratio (Liquiditätsgrad 2)', '(Flüssige Mittel + Forderungen) / kurzfristiges FK × 100. Zahlungsfähigkeit ohne Warenverkauf. Ziel: ≥ 100%.'],
  ['Current Ratio (Liquiditätsgrad 3)', 'Umlaufvermögen / kurzfristiges FK × 100. Umfassende Liquiditätsmessung inkl. Vorräte. Ziel: ≥ 150%.'],
  ['EK-Quote (Eigenfinanzierungsgrad)', 'EK / Gesamtkapital × 100. Anteil des Eigenkapitals am Gesamtkapital. Ziel: ≥ 30%.'],
  ['FK-Quote (Fremdfinanzierungsgrad)', 'FK / Gesamtkapital × 100. Anteil des Fremdkapitals. Ziel: ≤ 70%. EK-Quote + FK-Quote = 100%.'],
  ['Selbstfinanzierungsgrad', 'Zuwachskapital / Grundkapital × 100. Zeigt, wie viel Eigenkapital durch zurückbehaltene Gewinne aufgebaut wurde. Altersabhängig.'],
  ['Anlagedeckungsgrad 1 (ADG 1)', 'EK / Anlagevermögen × 100. Wie viel AV ist durch EK gedeckt. Ziel: ≥ 75%.'],
  ['Anlagedeckungsgrad 2 (ADG 2)', '(EK + langfristiges FK) / Anlagevermögen × 100. Goldene Bilanzregel: AV durch langfristiges Kapital finanzieren. Ziel: ≥ 100% — Pflicht!'],
  ['Goldene Bilanzregel', 'Langfristig gebundenes Vermögen (AV) muss langfristig finanziert sein. Verletzung gefährdet die Liquidität. Gemessen durch ADG 2 ≥ 100%.'],
  ['EK-Rentabilität', 'Reingewinn / EK × 100. Rendite auf das Eigenkapital der Eigentümer. Ziel: ≥ 8%.'],
  ['GK-Rentabilität (Gesamtkapitalrendite)', '(Reingewinn + FK-Zinsen) / GK × 100. Finanzierungsstruktur-neutral — für Unternehmensvergleiche geeignet. Ziel: ≥ 6%.'],
  ['Umsatzrentabilität', 'Reingewinn / Betriebsertrag × 100. Gewinn je Umsatzfranken. Branchenabhängig: Handel ≥ 1,5%, Industrie ≥ 5%.'],
  ['Cashflow', 'Reingewinn + Abschreibungen. Zeigt den tatsächlichen Mittelzufluss aus der Geschäftstätigkeit. Abschreibungen sind Aufwand, aber kein Geldabfluss.'],
  ['Cashflow-Marge', 'Cashflow / Betriebsertrag × 100. Cashflow pro Umsatzfranken. Soll deutlich höher sein als die Umsatzrentabilität.'],
  ['Effektivverschuldung', 'FK − (Flüssige Mittel + Forderungen). «Echte» Nettoschulden nach Abzug rasch verfügbarer Mittel.'],
  ['Verschuldungsfaktor', 'Effektivverschuldung / Cashflow. Wie viele Jahre braucht das Unternehmen, Nettoschulden aus Cashflow zu tilgen. Ziel: < 5 Jahre — Banken-Massstab.'],
  ['Debitorenumschlag', 'Kreditverkäufe / Debitorenbestand. Wie oft Forderungen jährlich in Geld umgewandelt werden. Ziel: ≥ 8×/Jahr.'],
  ['Lagerdauer', '360 / Lagerumschlag. Durchschnittliche Verweildauer von Waren im Lager in Tagen. Branchenabhängig.'],
])

// ─── Core Points (min 10) ─────────────────────────────────────────────────────

await addPoints(ch, [
  'Cash Ratio ≥ 20%: nur sofort verfügbare Mittel zählen — strengste Liquiditätsmessung.',
  'Quick Ratio ≥ 100%: kurzfristige Schulden ohne Warenverkauf deckbar — praxisrelevanteste Kennzahl.',
  'Current Ratio ≥ 150%: gesamtes Umlaufvermögen vs. kurzfristiges FK — umfassend, aber gröber wegen Vorräten.',
  'EK-Quote ≥ 30%, FK-Quote ≤ 70%: Grundregeln der Kapitalstruktur — höhere EK-Quote bedeutet mehr Sicherheit.',
  'ADG 2 ≥ 100% ist Pflicht — Goldene Bilanzregel: Anlagevermögen muss langfristig finanziert sein.',
  'ADG 1 ≥ 75%: Zielgrösse aus Quelltextbuch — nicht 50% wie oft vereinfacht angegeben.',
  'EK-Rentabilität ≥ 8%; GK-Rentabilität ≥ 6%; Umsatzrentabilität branchenabhängig (Handel ≥ 1,5%, Industrie ≥ 5%).',
  'Cashflow = Reingewinn + Abschreibungen — Abschreibungen mindern Gewinn, aber nicht den Geldbestand.',
  'Verschuldungsfaktor < 5 Jahre — zentraler Massstab für Banken bei Kreditentscheiden.',
  'Effektivverschuldung = FK − (Fl. Mittel + Forderungen) — «echte» Nettoschulden, Basis des Verschuldungsfaktors.',
  'Hohe EK-Rentabilität kann aus hoher Verschuldung stammen — immer zusammen mit Kapitalstruktur lesen.',
  'Vorgehen bei jeder Kennzahl: 1. Berechnen — 2. Zielgrösse nennen — 3. Beurteilen (gut/nicht erreicht/kritisch).',
  'Für vertiefte Analyse immer bereinigte Bilanz verwenden: stille Reserven aufdecken, betriebsfremde Posten entfernen.',
  'Zeitvergleich (Trend) UND Branchenvergleich sind entscheidend — Kennzahlen isoliert sind wenig aussagekräftig.',
)

// ─── Quiz (min 8 Berechnungsfragen) ──────────────────────────────────────────

await addQuiz(ch, [
  {
    q: 'Flüssige Mittel CHF 87 000, Forderungen CHF 215 000, kurzfristiges FK CHF 280 000. Liquiditätsgrad 2 (Quick Ratio)?',
    opts: [
      ['107,9%', true],
      ['31,1%', false],
      ['76,8%', false],
      ['86,1%', false],
    ],
    exp: 'Quick Ratio = (Fl.Mittel + Ford.) / kurzfr.FK × 100 = (87 000 + 215 000) / 280 000 × 100 = 302 000 / 280 000 × 100 = 107,9%. Ziel ≥ 100% — knapp erreicht.',
    diff: 'medium',
  },
  {
    q: 'Umlaufvermögen CHF 510 000, kurzfristiges FK CHF 290 000. Liquiditätsgrad 3 (Current Ratio)?',
    opts: [
      ['175,9%', true],
      ['56,9%', false],
      ['210,3%', false],
      ['131,4%', false],
    ],
    exp: 'Current Ratio = UV / kurzfr.FK × 100 = 510 000 / 290 000 × 100 = 175,9%. Ziel ≥ 150% — erreicht.',
    diff: 'easy',
  },
  {
    q: 'EK CHF 850 000, Gesamtkapital CHF 2 200 000. Eigenfinanzierungsgrad (EK-Quote)?',
    opts: [
      ['38,6%', true],
      ['61,4%', false],
      ['25,9%', false],
      ['43,2%', false],
    ],
    exp: 'EF-Grad = 850 000 / 2 200 000 × 100 = 38,6%. Ziel ≥ 30% — erreicht. Das Unternehmen ist solide eigenfinanziert.',
    diff: 'easy',
  },
  {
    q: 'EK CHF 720 000, langfristiges FK CHF 980 000, Anlagevermögen CHF 1 600 000. Anlagedeckungsgrad 2?',
    opts: [
      ['106,3%', true],
      ['45,0%', false],
      ['85,0%', false],
      ['212,5%', false],
    ],
    exp: 'ADG 2 = (EK + langfr.FK) / AV × 100 = (720 000 + 980 000) / 1 600 000 × 100 = 1 700 000 / 1 600 000 × 100 = 106,3%. Ziel ≥ 100% — Goldene Bilanzregel erfüllt.',
    diff: 'medium',
  },
  {
    q: 'Reingewinn CHF 95 000, FK-Zinsen CHF 35 000, Gesamtkapital CHF 2 500 000. GK-Rentabilität?',
    opts: [
      ['5,2%', true],
      ['3,8%', false],
      ['6,7%', false],
      ['1,4%', false],
    ],
    exp: 'GK-Rendite = (Reingewinn + FK-Zinsen) / GK × 100 = (95 000 + 35 000) / 2 500 000 × 100 = 130 000 / 2 500 000 × 100 = 5,2%. Ziel ≥ 6% — knapp nicht erreicht.',
    diff: 'medium',
  },
  {
    q: 'Reingewinn CHF 120 000, Abschreibungen CHF 85 000, Betriebsertrag CHF 3 400 000. Cashflow-Marge?',
    opts: [
      ['6,03%', true],
      ['3,53%', false],
      ['2,50%', false],
      ['7,74%', false],
    ],
    exp: 'Cashflow = 120 000 + 85 000 = 205 000. Cashflow-Marge = 205 000 / 3 400 000 × 100 = 6,03%. Soll deutlich über der Umsatzrendite (3,53%) liegen — hier erfüllt.',
    diff: 'medium',
  },
  {
    q: 'FK CHF 1 800 000, Flüssige Mittel CHF 90 000, Forderungen CHF 260 000, Cashflow CHF 350 000. Verschuldungsfaktor?',
    opts: [
      ['4,14 Jahre', true],
      ['5,14 Jahre', false],
      ['2,43 Jahre', false],
      ['6,57 Jahre', false],
    ],
    exp: 'Effektivverschuldung = 1 800 000 − (90 000 + 260 000) = 1 450 000. Verschuldungsfaktor = 1 450 000 / 350 000 = 4,14 Jahre. Ziel < 5 Jahre — erreicht.',
    diff: 'hard',
  },
  {
    q: 'Reingewinn CHF 160 000, EK CHF 900 000. EK-Rentabilität?',
    opts: [
      ['17,8%', true],
      ['5,6%', false],
      ['56,3%', false],
      ['8,9%', false],
    ],
    exp: 'EK-Rendite = Reingewinn / EK × 100 = 160 000 / 900 000 × 100 = 17,8%. Ziel ≥ 8% — sehr gut.',
    diff: 'easy',
  },
  {
    q: 'Kreditverkäufe CHF 2 160 000, Debitorenbestand CHF 240 000. Durchschnittliche Kundenfrist in Tagen?',
    opts: [
      ['40 Tage', true],
      ['9 Tage', false],
      ['45 Tage', false],
      ['54 Tage', false],
    ],
    exp: 'Debitorenumschlag = 2 160 000 / 240 000 = 9×/Jahr. Kundenfrist = 360 / 9 = 40 Tage. Ziel < 45 Tage — erreicht.',
    diff: 'medium',
  },
  {
    q: 'Was ist die korrekte Formel für die Effektivverschuldung?',
    opts: [
      ['FK − (Flüssige Mittel + Forderungen)', true],
      ['FK − Eigenkapital', false],
      ['FK + Abschreibungen', false],
      ['Umlaufvermögen − kurzfristiges FK', false],
    ],
    exp: 'Effektivverschuldung = FK − (Flüssige Mittel + Forderungen). Sie zeigt die «echten» Nettoschulden nach Abzug der rasch verfügbaren Mittel — Grundlage des Verschuldungsfaktors.',
    diff: 'medium',
  },
])

console.log('✅ Kapitel 11: Bilanz- und Erfolgsanalyse — seed abgeschlossen.')
await client.end()
