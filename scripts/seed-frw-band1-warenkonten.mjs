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
     VALUES ($1,$2,$3,$4,'ShoppingCart','orange','abschluss','frw','1',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO NOTHING`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO NOTHING`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}
async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i+1])
}
async function addExamples(chId, examples) {
  for (let i = 0; i < examples.length; i++)
    await client.query(`INSERT INTO "Example" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), examples[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

const tId = await insertTopic(
  'frw-band1-warenkonten',
  'Warenkonten',
  'Einkauf und Verkauf von Handelswaren, Einstandspreis, Nettoerlös, Bruttogewinn und Bestandeskorrektur.',
  2
)

const ch = await insertChapter(tId,
  'band1-warenkonten',
  'Warenkonten',
  'Warenaufwand, Warenerlöse, Warenvorrat und Bestandesänderung',
  1,
  `WARENBUCHHALTUNG — Ein Handelsbetrieb kauft Waren ein und verkauft sie weiter. Warenaufwand erfasst alle einkaufsbezogenen Buchungen. Warenerlöse erfasst alle verkaufsbezogenen Buchungen.
EINSTANDSPREIS UND NETTOERLÖS — Einstandspreis = Katalogpreis − Rabatt − Skonto + Bezugskosten. Nettoerlös = Katalogpreis − Rabatt − Skonto − Versandkosten (wenn Unternehmen trägt).
BUCHUNGSLOGIK EINKAUF — Lieferantenrechnung: Warenaufwand / Kreditoren. Skontobuchung: Kreditoren / Warenaufwand. Bezugskosten: Warenaufwand / Kasse.
BUCHUNGSLOGIK VERKAUF — Kundenrechnung: Debitoren / Warenerlöse. Kundenskonto: Warenerlöse / Debitoren. Retour vom Kunden: Warenerlöse / Debitoren.
BESTANDESKORREKTUR — Warenvorrat ist ein ruhendes Konto — wird nur beim Jahresabschluss angepasst. Bestandeszunahme: Warenvorrat / Warenaufwand. Bestandesabnahme: Warenaufwand / Warenvorrat. Bruttogewinn = Warenerlöse − Warenaufwand (nach Korrektur).`
)

await addGoals(ch, [
  'Du kannst Wareneinkäufe und Warenverkäufe (auf Rechnung und bar) korrekt verbuchen.',
  'Du kennst die Ermittlung von Einstandspreis und Nettoerlös.',
  'Du kannst Skonti, Rabatte und Rücksendungen buchhalterisch korrekt behandeln.',
  'Du verstehst die Funktion des Warenvorrats als ruhendes Konto.',
  'Du kannst die Bestandskorrektur beim Jahresabschluss durchführen und erklären.',
])

await addTerms(ch, [
  ['Warenaufwand', 'Aufwandskonto für alle einkaufsbezogenen Geschäftsfälle: Lieferantenrechnungen, Bezugskosten, Skonti, Rabatte, Rücksendungen an Lieferanten.'],
  ['Warenerlöse', 'Ertragskonto für alle verkaufsbezogenen Geschäftsfälle: Kundenrechnungen abzüglich Skonti, Rabatte, Retouren von Kunden, Versandkosten.'],
  ['Warenvorrat', 'Aktivkonto für das Warenlager. Ruhendes Konto — wird während des Jahres nicht laufend bebuchtet. Bestandskorrektur nur beim Jahresabschluss.'],
  ['Einstandspreis', 'Effektiver Beschaffungswert der eingekauften Waren: Katalogpreis − Rabatt − Skonto + Bezugskosten.'],
  ['Nettoerlös', 'Effektiver Verkaufsertrag: Katalogpreis − Rabatt − Skonto − Versandkosten (wenn das Unternehmen sie trägt).'],
  ['Bruttogewinn', 'Warenerlöse − Warenaufwand (nach Bestandskorrektur). Zeigt die Handelsspanne vor Abzug der Gemeinkosten.'],
  ['Bestandesänderung', 'Differenz zwischen Anfangs- und Schlussbestand des Warenvorrats. Bestimmt die Korrektur des Warenaufwands beim Jahresabschluss.'],
  ['Bezugskosten', 'Zusätzliche Beschaffungskosten (Transport, Zoll, Versicherung), die den Einstandspreis erhöhen.'],
])

await addPoints(ch, [
  'Wareneinkauf auf Rechnung: Warenaufwand / Kreditoren (Bruttobetrag nach Rabatt).',
  'Lieferantenskonto genutzt: Kreditoren / Warenaufwand (vermindert den Aufwand).',
  'Bezugskosten bar: Warenaufwand / Kasse.',
  'Warenverkauf auf Rechnung: Debitoren / Warenerlöse.',
  'Kundenskonto gewährt: Warenerlöse / Debitoren (vermindert den Erlös).',
  'Warenretoure von Kunde: Warenerlöse / Debitoren.',
  'Bestandeszunahme (mehr eingekauft als verkauft): Warenvorrat / Warenaufwand.',
  'Bestandesabnahme (mehr verkauft als eingekauft): Warenaufwand / Warenvorrat.',
])

await addExamples(ch, [
  'EINSTANDSPREIS: 100 Stück à CHF 18.00 = CHF 1 800. Rabatt 8 % = CHF 144. Rechnungsbetrag CHF 1 656. Skonto 2 % = CHF 33.10. Zahlungsbetrag CHF 1 622.90. Bezugskosten CHF 217. Einstandspreis CHF 1 839.90.',
  'BESTANDESZUNAHME: Anfangsbestand CHF 5 000, Schlussbestand CHF 7 000. Differenz = +2 000. Buchung: Warenvorrat 2 000 / Warenaufwand 2 000.',
  'BESTANDESABNAHME: Anfangsbestand CHF 8 000, Schlussbestand CHF 6 000. Differenz = −2 000. Buchung: Warenaufwand 2 000 / Warenvorrat 2 000.',
])

await addQuiz(ch, [
  {
    q: 'Wie wird ein Wareneinkauf auf Rechnung (nach Rabatt CHF 3 400) gebucht?',
    opts: [
      ['Warenaufwand 3 400 / Kreditoren 3 400', true],
      ['Kreditoren 3 400 / Warenaufwand 3 400', false],
      ['Warenaufwand 3 400 / Debitoren 3 400', false],
      ['Warenerlöse 3 400 / Kreditoren 3 400', false],
    ],
    exp: 'Einkauf auf Rechnung: Aufwand entsteht (Soll) und Schuld beim Lieferanten entsteht (Haben).',
    diff: 'easy',
  },
  {
    q: 'Der Lieferant gewährt 2 % Skonto. Wie wird die Skontozahlung gebucht (Skonto CHF 68)?',
    opts: [
      ['Kreditoren 68 / Warenaufwand 68', true],
      ['Warenaufwand 68 / Kreditoren 68', false],
      ['Bank 68 / Warenaufwand 68', false],
      ['Kreditoren 68 / Bank 68', false],
    ],
    exp: 'Skonto vermindert den Warenaufwand (Haben). Die Verbindlichkeit (Kreditoren) wird ebenfalls reduziert (Soll).',
    diff: 'medium',
  },
  {
    q: 'Was versteht man unter dem Einstandspreis?',
    opts: [
      ['Katalogpreis − Rabatt − Skonto + Bezugskosten', true],
      ['Katalogpreis ohne Abzüge', false],
      ['Warenerlöse − Warenaufwand', false],
      ['Rechnungsbetrag nach Rabatt ohne Skonto und Bezugskosten', false],
    ],
    exp: 'Einstandspreis = effektiver Beschaffungswert der Waren, inkl. Bezugskosten, exkl. aller Abzüge.',
    diff: 'medium',
  },
  {
    q: 'Der Schlussbestand des Warenvorrats ist höher als der Anfangsbestand. Was wird gebucht?',
    opts: [
      ['Warenvorrat / Warenaufwand (Aufwand sinkt)', true],
      ['Warenaufwand / Warenvorrat (Aufwand steigt)', false],
      ['Warenerlöse / Warenvorrat', false],
      ['Keine Buchung nötig', false],
    ],
    exp: 'Bestandeszunahme = mehr eingekauft als verkauft. Warenaufwand war zu hoch — Korrektur: Warenvorrat / Warenaufwand.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Bruttogewinn?',
    opts: [
      ['Warenerlöse − Warenaufwand (nach Bestandskorrektur)', true],
      ['Reingewinn nach Abzug aller Gemeinkosten', false],
      ['Umsatz vor Abzug von Rabatten', false],
      ['Einstandspreis minus Katalogpreis', false],
    ],
    exp: 'Bruttogewinn = Handelsspanne. Aus ihm müssen noch die Gemeinkosten gedeckt werden, bevor der Reingewinn entsteht.',
    diff: 'easy',
  },
  {
    q: 'Ein Kunde retourniert Waren im Wert von CHF 500. Wie wird gebucht?',
    opts: [
      ['Warenerlöse 500 / Debitoren 500', true],
      ['Debitoren 500 / Warenerlöse 500', false],
      ['Warenaufwand 500 / Debitoren 500', false],
      ['Warenerlöse 500 / Kreditoren 500', false],
    ],
    exp: 'Retoure vom Kunden vermindert die Forderung (Debitoren sinken = Haben) und den Erlös (Warenerlöse sinken = Soll).',
    diff: 'medium',
  },
])

console.log('✅ Band 1 — Warenkonten erfolgreich erstellt.')
await client.end()
