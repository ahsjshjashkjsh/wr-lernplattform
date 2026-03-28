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
     VALUES ($1,$2,$3,$4,'BookOpen','blue','abschluss','frw','1',$5,true,NOW(),NOW())
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
  'frw-band1-grundlagen',
  'Grundlagen der Buchhaltung',
  'Doppelte Buchhaltung, Bilanz, Erfolgsrechnung, Jahresabschluss und gesetzliche Grundlagen nach OR.',
  1
)

const ch = await insertChapter(tId,
  'band1-grundlagen',
  'Grundlagen der Buchhaltung',
  'Bilanz, Erfolgsrechnung und Jahresabschluss',
  1,
  `DOPPELTE BUCHHALTUNG — Jeder Geschäftsfall wird in zwei Konten erfasst: einmal Soll, einmal Haben. Der Betrag ist identisch. So bleibt die rechnerische Konsistenz erhalten.
BILANZ UND ERFOLGSRECHNUNG — Bilanz = stichtagsbezogene Gegenüberstellung von Aktiven und Passiven. Aktiven = Passiven gilt immer. Erfolgsrechnung = periodenbezogene Gegenüberstellung von Aufwänden und Erträgen zur Ermittlung von Gewinn oder Verlust.
KONTENARTEN — Aktivkonten (Vermögen): Zunahmen Soll, Abnahmen Haben. Passivkonten (Schulden/EK): Zunahmen Haben, Abnahmen Soll. Aufwandskonten: kein Anfangsbestand, Zunahmen Soll. Ertragskonten: kein Anfangsbestand, Zunahmen Haben.
JAHRESABSCHLUSS — Ablauf: Eröffnungsbilanz → laufende Buchungen → Schlussbilanz I + Erfolgsrechnung → Gewinnverbuchung ins Eigenkapital → Schlussbilanz II.
GESETZLICHE GRUNDLAGEN — Buchführungspflicht OR: Einzelunternehmen ab CHF 500 000 Jahresumsatz; juristische Personen immer. Belegprinzip: Keine Buchung ohne Beleg. Aufbewahrungspflicht: 10 Jahre.`
)

await addGoals(ch, [
  'Du kennst die vier Grundgrössen der Buchhaltung: Vermögen, Schulden, Aufwände und Erträge.',
  'Du kannst Buchungssätze für typische Geschäftsvorfälle korrekt formulieren.',
  'Du verstehst den Unterschied zwischen Bilanzkonten und Erfolgskonten.',
  'Du kannst den vollständigen Ablauf eines Jahresabschlusses beschreiben.',
  'Du kennst die gesetzlichen Buchführungspflichten nach schweizerischem Obligationenrecht.',
])

await addTerms(ch, [
  ['Aktivkonto', 'Bilanzkonto für Vermögenswerte (Bank, Kasse, Fahrzeuge). Anfangsbestand und Zunahmen im Soll; Abnahmen und Schlussbestand im Haben.'],
  ['Passivkonto', 'Bilanzkonto für Schulden und Eigenkapital. Anfangsbestand und Zunahmen im Haben; Abnahmen und Schlussbestand im Soll.'],
  ['Eigenkapital', 'Aus Sicht der Buchhaltung eine Schuld des Unternehmens gegenüber dem Eigentümer. Verändert sich durch Einlagen, Bezüge, Gewinne und Verluste.'],
  ['Doppelte Buchhaltung', 'Jeder Geschäftsfall wird in zwei Konten erfasst — einmal im Soll, einmal im Haben — mit identischem Betrag.'],
  ['Bilanz', 'Stichtagsbezogene Gegenüberstellung von Aktiven (Mittelverwendung) und Passiven (Mittelherkunft). Es gilt immer: Aktiven = Passiven.'],
  ['Erfolgsrechnung', 'Periodenbezogene Gegenüberstellung von Aufwänden und Erträgen. Ergebnis: Reingewinn oder Reinverlust.'],
  ['Belegprinzip', '"Keine Buchung ohne Beleg" — jeder Geschäftsvorfall muss durch einen Beleg dokumentiert sein. Aufbewahrungspflicht: 10 Jahre.'],
  ['Buchführungspflicht OR', 'Einzelunternehmen und Personengesellschaften ab CHF 500 000 Jahresumsatz; juristische Personen (AG, GmbH) unabhängig vom Umsatz.'],
])

await addPoints(ch, [
  'Aktivkonten: Anfangsbestand + Zunahmen = Soll. Abnahmen + Schlussbestand = Haben.',
  'Passivkonten: Anfangsbestand + Zunahmen = Haben. Abnahmen + Schlussbestand = Soll.',
  'Erfolgskonten beginnen bei null. Aufwand: Zunahmen Soll. Ertrag: Zunahmen Haben.',
  'Jeder Buchungssatz: Sollkonto / Habenkonto, identischer Betrag.',
  'Jahresabschluss: Eröffnungsbilanz → Buchungen → Schlussbilanz I + ER → Gewinn ins EK → Schlussbilanz II.',
  'Bilanz = Stichtagsrechnung (ein Tag). Erfolgsrechnung = Periodenrechnung (ein Jahr).',
  'Buchführungspflicht: Einzelunternehmen ab CHF 500 000. Juristische Personen: immer.',
  'Aufwand ≠ Ausgabe: Abschreibungen = Aufwand ohne Ausgabe. Anlagenkauf = Ausgabe ohne sofortigen Aufwand.',
])

await addQuiz(ch, [
  {
    q: 'Was gilt für Aktivkonten?',
    opts: [
      ['Anfangsbestand und Zunahmen im Soll, Abnahmen im Haben', true],
      ['Anfangsbestand und Zunahmen im Haben, Abnahmen im Soll', false],
      ['Kein Anfangsbestand, Zunahmen im Soll', false],
      ['Kein Anfangsbestand, Zunahmen im Haben', false],
    ],
    exp: 'Aktivkonten zeigen Vermögenswerte. Zunahmen = Soll (links), Abnahmen = Haben (rechts).',
    diff: 'easy',
  },
  {
    q: 'Was ist Eigenkapital aus buchhalterischer Sicht?',
    opts: [
      ['Eine Schuld des Unternehmens gegenüber dem Eigentümer', true],
      ['Ein Aktivum (Vermögenswert) des Unternehmens', false],
      ['Ein Ertrag aus dem laufenden Geschäft', false],
      ['Ein Aufwand aus der Unternehmensgründung', false],
    ],
    exp: 'Das Unternehmen ist eine eigenständige wirtschaftliche Einheit. Die Einlage des Eigentümers = Schuld des Unternehmens → Eigenkapital ist ein Passivkonto.',
    diff: 'medium',
  },
  {
    q: 'Welche Aussage zur Bilanz ist korrekt?',
    opts: [
      ['Die Bilanz ist stichtagsbezogen und zeigt stets Aktiven = Passiven', true],
      ['Die Bilanz zeigt Aufwände und Erträge einer Periode', false],
      ['Bei Gewinn sind Aktiven grösser als Passiven', false],
      ['Die Bilanz wird monatlich erstellt', false],
    ],
    exp: 'Bilanz = Stichtagsrechnung. Aktiven = Passiven gilt immer (Gewinn ist im Eigenkapital enthalten).',
    diff: 'easy',
  },
  {
    q: 'Ab welchem Jahresumsatz sind Einzelunternehmen in der Schweiz buchführungspflichtig?',
    opts: [
      ['CHF 500 000', true],
      ['CHF 100 000', false],
      ['CHF 250 000', false],
      ['Immer, unabhängig vom Umsatz', false],
    ],
    exp: 'Nach OR: Einzelunternehmen und Personengesellschaften ab CHF 500 000 Jahresumsatz. Juristische Personen (AG, GmbH) sind immer buchführungspflichtig.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Unterschied zwischen Aufwand und Ausgabe?',
    opts: [
      ['Aufwand ist erfolgswirksam; Ausgabe ist liquiditätswirksam', true],
      ['Aufwand und Ausgabe sind immer identisch', false],
      ['Ausgabe ist erfolgswirksam; Aufwand ist liquiditätswirksam', false],
      ['Aufwand betrifft nur Bargeschäfte', false],
    ],
    exp: 'Abschreibungen = Aufwand ohne Ausgabe. Anlagenkauf = Ausgabe, aber kein sofortiger Aufwand (wird aktiviert).',
    diff: 'medium',
  },
  {
    q: 'Was besagt das Belegprinzip?',
    opts: [
      ['Keine Buchung ohne Beleg — jeder Geschäftsfall muss dokumentiert sein', true],
      ['Buchungen dürfen nur am Periodenende vorgenommen werden', false],
      ['Das Belegprinzip gilt nur für Bargeschäfte', false],
      ['Belege müssen nur für Beträge über CHF 1 000 aufbewahrt werden', false],
    ],
    exp: 'Belegprinzip = gesetzliche Grundregel der Buchführung. Aufbewahrungspflicht beträgt 10 Jahre.',
    diff: 'easy',
  },
])

console.log('✅ Band 1 — Grundlagen der Buchhaltung erfolgreich erstellt.')
await client.end()
