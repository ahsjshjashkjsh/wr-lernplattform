import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }
async function getTopicId(slug) {
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(`INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW()) ON CONFLICT ("topicId",slug) DO NOTHING`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}
async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`, [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), points[i], chId, i+1])
}
async function addExamples(chId, examples) {
  for (let i = 0; i < examples.length; i++)
    await client.query(`INSERT INTO "Example" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), examples[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(`INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(`INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

const tId = await getTopicId('frw-band2')

const ch = await insertChapter(tId,
  'bilanzanalyse',
  'Analyse der Bilanz und Erfolgsrechnung',
  'Kennzahlen: Liquidität, Rentabilität, Kapitalstruktur und Cashflow',
  9,
  `Die Bilanz- und Erfolgsanalyse beurteilt die wirtschaftliche Lage eines Unternehmens anhand von Kennzahlen.

KAPITALSTRUKTUR:
• Eigenfinanzierungsgrad = EK / GK × 100 → Ziel: ≥ 30%
• Fremdfinanzierungsgrad = FK / GK × 100 → Ziel: ≤ 70%

VERMÖGENSSTRUKTUR:
• UV-Intensität = Umlaufvermögen / Gesamtvermögen × 100
• AV-Intensität = Anlagevermögen / Gesamtvermögen × 100

LIQUIDITÄT (Zahlungsbereitschaft):
• LG 1 (Cash Ratio) = Flüssige Mittel / kurzfr.FK × 100 → Ziel: ≥ 20%
• LG 2 (Quick Ratio) = (Fl.Mittel + Forderungen) / kurzfr.FK × 100 → Ziel: ≥ 100%
• LG 3 (Current Ratio) = Umlaufvermögen / kurzfr.FK × 100 → Ziel: ≥ 150–200%

ANLAGENDECKUNG (Goldene Bilanzregel):
• ADG 1 = EK / AV × 100 → Ziel: ≥ 50%
• ADG 2 = (EK + langfr.FK) / AV × 100 → Ziel: ≥ 100% (Pflicht!)

RENTABILITÄT:
• EK-Rendite = Reingewinn / EK × 100 → Ziel: ≥ 6–8%
• GK-Rendite = (Reingewinn + FK-Zinsen) / GK × 100 → Ziel: ≥ 5%
• Umsatzrendite = Reingewinn / Umsatz × 100 → branchenabhängig

CASHFLOW-ANALYSE:
• Cashflow = Reingewinn + Abschreibungen (+ nicht zahlungswirksame Aufwände)
• Cashflow-Marge = Cashflow / Umsatz × 100 → Ziel: ≥ 5–15%
• Effektivverschuldung = FK − Flüssige Mittel − Forderungen
• Verschuldungsfaktor = Effektivverschuldung / Cashflow → Ziel: < 5 Jahre

AKTIVITÄTSANALYSE:
• Lagerumschlag = Wareneinsatz / ∅Lagerbestand → branchenabhängig
• Lagerdauer = 360 / Lagerumschlag → Ziel: < 40 Tage

Bei jeder Kennzahl: 1. Berechnen 2. Zielgrösse nennen 3. Interpretieren (Kontext!)`
)

await addGoals(ch, [
  'Du kannst alle wichtigen Kennzahlen aus Bilanz und Erfolgsrechnung berechnen.',
  'Du kennst die Zielgrössen für Liquidität, Kapitalstruktur und Rentabilität.',
  'Du kannst Kennzahlen korrekt interpretieren (nicht nur berechnen).',
  'Du kannst den Cashflow berechnen und den Verschuldungsfaktor erklären.',
  'Du weisst, wer welche Kennzahlen am meisten interessiert (Anspruchsgruppen).',
])

await addTerms(ch, [
  ['Eigenfinanzierungsgrad', 'EK / Gesamtkapital × 100. Zeigt wie viel % des Kapitals eigenfinanziert ist. Ziel: ≥ 30%.'],
  ['Liquiditätsgrad 1 (Cash Ratio)', 'Flüssige Mittel / kurzfristiges FK × 100. Sofort zahlbare Mittel. Ziel: ≥ 20%.'],
  ['Liquiditätsgrad 2 (Quick Ratio)', '(Flüssige Mittel + Forderungen) / kurzfristiges FK × 100. Ohne Warenverkauf zahlbar. Ziel: ≥ 100%.'],
  ['Liquiditätsgrad 3 (Current Ratio)', 'Umlaufvermögen / kurzfristiges FK × 100. Mittelfristige Zahlungsfähigkeit. Ziel: ≥ 150–200%.'],
  ['Anlagendeckungsgrad 1 (ADG 1)', 'EK / Anlagevermögen × 100. Wie viel AV ist durch EK gedeckt. Ziel: ≥ 50%.'],
  ['Anlagendeckungsgrad 2 (ADG 2)', '(EK + langfristiges FK) / Anlagevermögen × 100. Goldene Bilanzregel: AV durch langfristiges Kapital finanzieren. Ziel: ≥ 100%.'],
  ['Eigenkapitalrendite', 'Reingewinn / EK × 100. Rendite auf das investierte Eigenkapital. Ziel: ≥ 6–8%.'],
  ['Gesamtkapitalrendite', '(Reingewinn + FK-Zinsen) / Gesamtkapital × 100. Unabhängig von Finanzierungsstruktur. Ziel: ≥ 5%.'],
  ['Cashflow', 'Reingewinn + Abschreibungen (+ weitere nicht zahlungswirksame Aufwände). Zeigt den tatsächlichen Geldmittelzufluss aus dem Betrieb.'],
  ['Cashflow-Marge', 'Cashflow / Umsatz × 100. Wie viele Rappen Cashflow je Umsatz-Franken. Ziel: ≥ 5–15%.'],
  ['Effektivverschuldung', 'FK − Flüssige Mittel − Forderungen. Zeigt die «echten» Nettoschulden nach Abzug liquider Mittel.'],
  ['Verschuldungsfaktor', 'Effektivverschuldung / Cashflow. Wie viele Jahre braucht das Unternehmen um Nettoschulden zurückzuzahlen. Ziel: < 5 Jahre.'],
  ['Lagerumschlag', 'Wareneinsatz / ∅Lagerbestand. Wie oft wird das Lager pro Jahr umgeschlagen. Ziel: branchenabhängig.'],
  ['Lagerdauer', '360 / Lagerumschlag. Durchschnittliche Lagerdauer in Tagen. Ziel: < 40 Tage.'],
])

await addPoints(ch, [
  'Kapitalstruktur: EF-Grad ≥ 30%; FF-Grad ≤ 70%',
  'LG1 ≥ 20% (sofort); LG2 ≥ 100% (schnell); LG3 ≥ 150% (mittelfristig)',
  'ADG2 ≥ 100% = Pflicht! Goldene Bilanzregel: AV durch langfristiges Kapital decken',
  'EK-Rendite ≥ 6–8%; GK-Rendite ≥ 5%; Umsatzrendite: branchenabhängig',
  'Cashflow = Reingewinn + Abschreibungen (nicht zahlungswirksame Posten zurückaddieren)',
  'Verschuldungsfaktor < 5 Jahre — Banken achten stark auf diesen Wert',
  'Immer: 1. Berechnen, 2. Zielgrösse nennen, 3. Interpretieren!',
  'Für Analyse immer BEREINIGTE Bilanz (stille Reserven aufgedeckt) verwenden',
  'Zeitvergleich (Trend) UND Branchenvergleich sind entscheidend',
])

await addExamples(ch, [
  'KAPITALSTRUKTUR: EK = 685 000, GK = 3 055 000. EF-Grad = 685 000 / 3 055 000 × 100 = 22,4%. Ziel 30% nicht erreicht → Unternehmen ist stark fremdfinanziert.',
  'LG 1: Flüssige Mittel = 70 000, kurzfr.FK = 340 000. LG1 = 70 000/340 000×100 = 20,6%. Gerade noch im Zielbereich (≥20%).',
  'LG 2: (70 000 + 300 000) / 340 000 × 100 = 108,8%. Über 100% — kurzfristige Schulden ohne Warenverkauf deckbar. Gut.',
  'ADG 2: (685 000 + 1 600 000) / 2 460 000 × 100 = 92,9%. Unter 100% — Goldene Bilanzregel verletzt! Teile des AV durch kurzfristiges FK finanziert.',
  'EK-RENDITE: Reingewinn = 163 000, EK = 685 000. EK-Rendite = 163 000/685 000×100 = 23,8%. Sehr gut (Ziel ≥8%).',
  'CASHFLOW: Reingewinn 163 000 + Abschreibungen 81 000 = Cashflow 244 000. Cashflow-Marge: 244 000/4 420 000×100 = 5,5%. Knapp im Zielbereich.',
  'VERSCHULDUNGSFAKTOR: FK = 1 940 000, Fl.Mittel 70 000, Ford. 300 000. Effektivversch. = 1 940 000−370 000 = 1 570 000. Faktor = 1 570 000/244 000 = 6,4 Jahre. Über Ziel von 5 Jahren.',
])

await addQuiz(ch, [
  {
    q: 'Flüssige Mittel CHF 50 000, Forderungen CHF 200 000, kurzfr. FK CHF 220 000. Liquiditätsgrad 2?',
    opts: [['113,6%', true], ['22,7%', false], ['90,9%', false], ['136,4%', false]],
    exp: 'LG2 = (Fl.Mittel + Ford.) / kurzfr.FK × 100 = (50 000 + 200 000) / 220 000 × 100 = 113,6%. Ziel ≥ 100% — erreicht.',
    diff: 'medium'
  },
  {
    q: 'Was ist die Zielgrösse für den Anlagendeckungsgrad 2?',
    opts: [['Mindestens 100%', true], ['Mindestens 50%', false], ['Mindestens 30%', false], ['Mindestens 200%', false]],
    exp: 'ADG2 = (EK + langfr.FK) / AV × 100. Ziel: ≥ 100% (Goldene Bilanzregel: Anlagevermögen durch langfristiges Kapital finanzieren).',
    diff: 'easy'
  },
  {
    q: 'Wie berechnet sich der Cashflow (vereinfacht)?',
    opts: [['Reingewinn + Abschreibungen', true], ['Umsatz − alle Aufwände', false], ['Reingewinn − Dividenden', false], ['Flüssige Mittel am Jahresende', false]],
    exp: 'Cashflow = Reingewinn + Abschreibungen (+ weitere nicht zahlungswirksame Posten). Abschreibungen sind Aufwand, aber kein Geldabfluss → werden zurückaddiert.',
    diff: 'easy'
  },
  {
    q: 'EK = 400 000, GK = 1 600 000. Eigenfinanzierungsgrad?',
    opts: [['25%', true], ['40%', false], ['75%', false], ['16%', false]],
    exp: 'EF-Grad = 400 000 / 1 600 000 × 100 = 25%. Ziel ≥ 30% — nicht erreicht.',
    diff: 'easy'
  },
  {
    q: 'Reingewinn CHF 80 000, FK-Zinsen CHF 40 000, GK CHF 2 000 000. Gesamtkapitalrendite?',
    opts: [['6%', true], ['4%', false], ['8%', false], ['2%', false]],
    exp: 'GK-Rendite = (Reingewinn + FK-Zinsen) / GK × 100 = (80 000 + 40 000) / 2 000 000 × 100 = 6%.',
    diff: 'medium'
  },
  {
    q: 'Was bedeutet ein Verschuldungsfaktor von 8 Jahren?',
    opts: [['Das Unternehmen braucht 8 Jahre um Nettoschulden mit Cashflow zu tilgen — zu hoch', true], ['Das Unternehmen ist sehr gut finanziert', false], ['Die Schulden werden in 8 Monaten zurückbezahlt', false], ['Der Cashflow beträgt 1/8 des Umsatzes', false]],
    exp: 'Verschuldungsfaktor = Effektivverschuldung / Cashflow. Ziel < 5 Jahre. Bei 8 Jahren ist das Unternehmen zu stark verschuldet — Banken sehen das kritisch.',
    diff: 'medium'
  },
  {
    q: 'Liquiditätsgrad 1 berechnet sich aus:',
    opts: [['Flüssige Mittel / kurzfristiges FK × 100', true], ['Umlaufvermögen / kurzfristiges FK × 100', false], ['(Fl.Mittel + Forderungen) / kurzfr.FK × 100', false], ['EK / Gesamtkapital × 100', false]],
    exp: 'LG1 = Flüssige Mittel (Kasse + Bank + kurzfristige Wertschriften) / kurzfristiges FK × 100. Ziel: ≥ 20%.',
    diff: 'easy'
  },
  {
    q: 'Wareneinsatz CHF 360 000, ∅Lagerbestand CHF 60 000. Lagerdauer in Tagen?',
    opts: [['60 Tage', true], ['6 Tage', false], ['36 Tage', false], ['120 Tage', false]],
    exp: 'Lagerumschlag = 360 000/60 000 = 6×/Jahr. Lagerdauer = 360/6 = 60 Tage. Etwas hoch — Ziel < 40 Tage.',
    diff: 'medium'
  },
])

console.log('✅ Kapitel 11: Bilanz- und Erfolgsanalyse erfolgreich erstellt.')
await client.end()
