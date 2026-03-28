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
     VALUES ($1,$2,$3,$4,'Percent','green','abschluss','frw','1',$5,true,NOW(),NOW())
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
  'frw-band1-mwst',
  'Mehrwertsteuer (MWST)',
  'Allphasensteuer mit Vorsteuerabzug, Buchungslogik bei Einkauf und Verkauf, quartalsweiser Abschluss, Saldosteuersatzmethode.',
  3
)

const ch = await insertChapter(tId,
  'band1-mwst',
  'Mehrwertsteuer (MWST)',
  'Vorsteuer, Umsatzsteuer, Steuersätze und Abschluss',
  1,
  `GRUNDPRINZIP — Die MWST ist eine indirekte Allphasensteuer mit Vorsteuerabzug. Das Unternehmen ist Steuersubjekt (rechnet ab), der Konsument ist Steuerträger (trägt die Last wirtschaftlich). Abrechnungspflicht ab CHF 100 000 Jahresumsatz.
VORSTEUER UND UMSATZSTEUER — Vorsteuer (Konto 1170/1171): beim Einkauf bezahlte MWST, kann abgezogen werden. Umsatzsteuer (Konto 2200): auf Verkäufen geschuldete MWST. An den Bund abzuliefern = Umsatzsteuer − Vorsteuer.
STEUERSÄTZE — Normalsatz 7,7 % (meiste Güter/DL). Reduzierter Satz 2,5 % (Lebensmittel, Medikamente). Sondersatz 3,7 % (Beherbergung). Exporte 0 % (Vorsteuerabzug bleibt). Ausgenommene Umsätze: kein Vorsteuerabzug.
BUCHUNGSLOGIK — Einkauf: Warenaufwand + Vorsteuer 1170 / Kreditoren (brutto). Verkauf: Debitoren (brutto) / Warenerlöse + Umsatzsteuer 2200.
QUARTALSABSCHLUSS — Umsatzsteuer 2200 / Vorsteuer 1170 + 1171. Restbetrag = geschuldete MWST. Zahlung: Umsatzsteuer 2200 / Bank.`
)

await addGoals(ch, [
  'Du kannst Vorsteuer und Umsatzsteuer korrekt unterscheiden und buchen.',
  'Du kennst alle MWST-Steuersätze (Normal, Reduziert, Sondersatz, Export, Ausgenommen).',
  'Du kannst den quartalsweisen Abschluss der MWST-Konten durchführen.',
  'Du verstehst das Prinzip der Allphasensteuer mit Vorsteuerabzug.',
  'Du kannst die Saldosteuersatzmethode erklären und abgrenzen.',
])

await addTerms(ch, [
  ['Steuersubjekt', 'Die natürliche oder juristische Person, die gegenüber der Steuerverwaltung abrechnungspflichtig ist. Bei der MWST: das Unternehmen ab CHF 100 000 Jahresumsatz.'],
  ['Steuerträger', 'Die Person, die die Steuer wirtschaftlich trägt — bei der MWST der Endkonsument, da die Steuer im Verkaufspreis enthalten ist.'],
  ['Vorsteuer (Konto 1170/1171)', 'Beim Einkauf bezahlte MWST. Kann von der geschuldeten Umsatzsteuer abgezogen werden. Konto 1170 für Waren/Material, 1171 für Investitionen/sonstiger Aufwand.'],
  ['Umsatzsteuer (Konto 2200)', 'Auf eigenen Verkäufen geschuldete MWST. Verbindlichkeit gegenüber der Steuerverwaltung.'],
  ['Normalsatz', '7,7 % MWST auf die meisten Güter und Dienstleistungen in der Schweiz.'],
  ['Reduzierter Satz', '2,5 % MWST auf Güter des täglichen Bedarfs (z.B. Lebensmittel, Medikamente, Bücher).'],
  ['Vorsteuerabzug', 'Das Recht, beim Einkauf bezahlte MWST von der geschuldeten Umsatzsteuer abzuziehen. Nur bei steuerbaren Umsätzen möglich.'],
  ['Saldosteuersatzmethode', 'Vereinfachtes Abrechnungsverfahren: steuerbarer Bruttoumsatz × branchenspezifischer Saldosteuersatz. Vorsteuern werden nicht separat erfasst.'],
])

await addPoints(ch, [
  'Wareneinkauf mit MWST 7,7 %: Warenaufwand (netto) + Vorsteuer 1170 / Kreditoren (brutto).',
  'Warenverkauf mit MWST 7,7 %: Debitoren (brutto) / Warenerlöse (netto) + Umsatzsteuer 2200.',
  'Investitionen/sonstiger Aufwand: Vorsteuer auf Konto 1171 (nicht 1170).',
  'Skonto/Rabatt nachträglich: korrigiert sowohl den Aufwand/Erlös als auch die Vorsteuer/Umsatzsteuer.',
  'Quartalsabschluss: Umsatzsteuer 2200 / Vorsteuer 1170 + 1171. Differenz = Zahlung an Bund.',
  'Exporte (0 % steuerbar): Vorsteuerabzug bleibt erhalten. Ausgenommene Umsätze: kein Vorsteuerabzug.',
  'Pflicht zur MWST-Abrechnung ab CHF 100 000 steuerbarem Jahresumsatz.',
])

await addQuiz(ch, [
  {
    q: 'Wie hoch ist der Normalsatz der MWST in der Schweiz?',
    opts: [
      ['7,7 %', true],
      ['8,0 %', false],
      ['5,0 %', false],
      ['2,5 %', false],
    ],
    exp: 'Normalsatz = 7,7 %. Reduzierter Satz = 2,5 % (Grundbedarf). Sondersatz = 3,7 % (Beherbergung).',
    diff: 'easy',
  },
  {
    q: 'Auf welchem Konto wird die beim Wareneinkauf bezahlte MWST erfasst?',
    opts: [
      ['Konto 1170 (Vorsteuer auf Warenaufwand)', true],
      ['Konto 1171 (Vorsteuer auf Investitionen)', false],
      ['Konto 2200 (Umsatzsteuer)', false],
      ['Direkt auf Warenaufwand, kein separates Konto', false],
    ],
    exp: 'Konto 1170 = Vorsteuer auf Waren/Material. Konto 1171 = Vorsteuer auf Investitionen und sonstiger Aufwand.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Unterschied zwischen Steuersubjekt und Steuerträger bei der MWST?',
    opts: [
      ['Steuersubjekt = abrechnungspflichtiges Unternehmen; Steuerträger = Endkonsument', true],
      ['Beide sind identisch — das Unternehmen', false],
      ['Steuersubjekt = Konsument; Steuerträger = Unternehmen', false],
      ['Steuersubjekt = Bund; Steuerträger = Unternehmen', false],
    ],
    exp: 'Die MWST ist eine indirekte Steuer: Subjekt (wer abrechnet) ≠ Träger (wer wirtschaftlich belastet ist).',
    diff: 'medium',
  },
  {
    q: 'Was wird beim quartalsweisen MWST-Abschluss gebucht?',
    opts: [
      ['Umsatzsteuer 2200 / Vorsteuer 1170 + 1171 (Differenz = Schuld an Bund)', true],
      ['Vorsteuer / Umsatzsteuer', false],
      ['Bank / Vorsteuer', false],
      ['Warenaufwand / Umsatzsteuer', false],
    ],
    exp: 'Die Vorsteuer (Guthaben) wird mit der Umsatzsteuer (Schuld) verrechnet. Die Differenz ist an die Steuerverwaltung zu bezahlen.',
    diff: 'medium',
  },
  {
    q: 'Was gilt für ausgenommene Umsätze?',
    opts: [
      ['Kein Vorsteuerabzug auf den dazugehörigen Einkäufen möglich', true],
      ['Vorsteuerabzug bleibt vollständig erhalten', false],
      ['Es gilt der Normalsatz 7,7 %', false],
      ['Ausgenommene Umsätze sind dasselbe wie Exporte (0 %)', false],
    ],
    exp: 'Ausgenommene Umsätze (z.B. Ärzte, Versicherungen) sind von der MWST befreit — aber ohne Vorsteuerabzugsberechtigung. Exporte hingegen sind mit 0 % steuerbar und berechtigen zum Vorsteuerabzug.',
    diff: 'hard',
  },
  {
    q: 'Ab welchem Jahresumsatz besteht MWST-Abrechnungspflicht?',
    opts: [
      ['CHF 100 000', true],
      ['CHF 500 000', false],
      ['CHF 50 000', false],
      ['Sofort ab dem ersten steuerbaren Umsatz', false],
    ],
    exp: 'MWST-Pflicht beginnt ab CHF 100 000 steuerbarem Jahresumsatz (nicht Gewinn, sondern Umsatz).',
    diff: 'easy',
  },
])

console.log('✅ Band 1 — Mehrwertsteuer (MWST) erfolgreich erstellt.')
await client.end()
