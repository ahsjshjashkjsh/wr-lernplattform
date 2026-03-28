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
     VALUES ($1,$2,$3,$4,'Shield','purple','abschluss','frw','1',$5,true,NOW(),NOW())
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
  'frw-band1-vst',
  'Verrechnungssteuer (VST)',
  'Schweizer Quellensteuer auf Kapitalerträge: 35 % Abzug durch die Bank, Rückforderung über Steuererklärung, Buchung als Aktivkonto.',
  4
)

const ch = await insertChapter(tId,
  'band1-vst',
  'Verrechnungssteuer (VST)',
  'Sicherungssteuer, Abzug und Rückforderung, Buchung als Forderung',
  1,
  `WESEN DER VST — Die Verrechnungssteuer ist eine schweizerische Quellensteuer auf bestimmte Kapitalerträge. Steuersatz grundsätzlich 35 %. Spezialsatz 8 % bei Kapitalauszahlungen aus gemischten Lebensversicherungen.
BETROFFENE ERTRÄGE — Bankzinsen über CHF 200, Obligationenzinsen, Dividenden, Lotteriegewinne über CHF 1 000 000.
MECHANISMUS — Bank zieht 35 % ab und überweist sie an die Eidgenössische Steuerverwaltung (EStV). Der Kunde erhält nur 65 % des Bruttoertrags gutgeschrieben.
RÜCKFORDERUNG — In der Schweiz wohnhafte Personen können die 35 % über das Wertschriftenverzeichnis in der Steuererklärung zurückfordern — aber nur bei vollständiger Deklaration von Ertrag und Vermögen.
BUCHUNG — Zinsgutschrift CHF 1 000 brutto: Bank 650 + Forderung Verrechnungssteuer 350 / Zinsertrag 1 000. "Forderung Verrechnungssteuer" ist ein Aktivkonto (Forderung gegenüber EStV).`
)

await addGoals(ch, [
  'Du kennst den Steuersatz der Verrechnungssteuer (35 %) und die Ausnahme (8 %).',
  'Du weißt, welche Ertragsarten der Verrechnungssteuer unterliegen.',
  'Du kannst den Mechanismus von Abzug, Auszahlung und Rückforderung erklären.',
  'Du kannst das Konto "Forderung Verrechnungssteuer" als Aktivkonto korrekt einordnen und buchen.',
  'Du verstehst die Sicherungsfunktion der VST und die Folgen fehlender Deklaration.',
])

await addTerms(ch, [
  ['Verrechnungssteuer (VST)', 'Schweizerische Quellensteuer auf bestimmte Kapitalerträge. Standardsatz 35 %. Wird direkt bei der Auszahlung von der Bank abgezogen.'],
  ['Sicherungssteuer', 'Zweck der VST: Sicherstellung der korrekten Deklaration von Kapitalerträgen und Vermögen. Wer korrekt deklariert, erhält die 35 % zurück.'],
  ['Forderung Verrechnungssteuer', 'Aktivkonto — erfasst den Rückforderungsanspruch gegenüber der Eidgenössischen Steuerverwaltung. Steht in der Bilanz unter Forderungen.'],
  ['Wertschriftenverzeichnis', 'Beilage zur Steuererklärung, mit der Kapitalerträge und Vermögenswerte deklariert und die Rückerstattung der VST beantragt wird.'],
  ['Bruttoertrag', '100 % des Kapitalertrags vor Abzug der Verrechnungssteuer. Grundlage für die Berechnung der 35 % VST.'],
  ['Nachsteuer/Strafsteuer', 'Folge fehlender oder unvollständiger Deklaration. Bei Aufdeckung nicht deklarierter Kapitalerträge werden Nachsteuern und Strafsteuern erhoben.'],
])

await addPoints(ch, [
  'VST-Satz: grundsätzlich 35 %. Spezialsatz 8 % bei gemischten Lebensversicherungsauszahlungen.',
  'Steuerbare Erträge: Bankzinsen >CHF 200, Obligationenzinsen, Dividenden, Lotteriegewinne >CHF 1 Mio.',
  'Bank zahlt Kunden 65 % aus, 35 % gehen an Eidgenössische Steuerverwaltung.',
  'Rückforderung: Wertschriftenverzeichnis in Steuererklärung ausfüllen. Nur bei vollständiger Deklaration.',
  'Buchung Zinsgutschrift CHF 1 000 brutto: Bank 650 + Forderung VST 350 / Zinsertrag 1 000.',
  '"Forderung Verrechnungssteuer" = Aktivkonto (wie Debitoren). Steht unter Forderungen in der Bilanz.',
  'Sicherungsfunktion: VST schafft Anreiz zur Deklaration — nur deklarierte Erträge sind rückerstattungsfähig.',
])

await addQuiz(ch, [
  {
    q: 'Wie hoch ist der Standardsatz der Verrechnungssteuer?',
    opts: [
      ['35 %', true],
      ['25 %', false],
      ['8 %', false],
      ['7,7 %', false],
    ],
    exp: '35 % ist der Standardsatz. 8 % gilt als Spezialsatz nur für Kapitalauszahlungen bei gemischten Lebensversicherungen.',
    diff: 'easy',
  },
  {
    q: 'Wozu dient die Verrechnungssteuer primär?',
    opts: [
      ['Sicherstellung der korrekten Deklaration von Kapitalerträgen und Vermögen', true],
      ['Endgültige Besteuerung von Zinserträgen', false],
      ['Finanzierung der AHV/IV', false],
      ['Besteuerung von Warenimporten', false],
    ],
    exp: 'VST = Sicherungssteuer. Sie erzwingt Deklaration, weil nur deklarierte Erträge rückerstattet werden.',
    diff: 'medium',
  },
  {
    q: 'Wie viel erhält ein Bankkunde bei einem Zinsertrag von CHF 2 000 brutto gutgeschrieben?',
    opts: [
      ['CHF 1 300 (65 %)', true],
      ['CHF 2 000 (100 %)', false],
      ['CHF 1 500 (75 %)', false],
      ['CHF 700 (35 %)', false],
    ],
    exp: 'Bank zahlt 65 % aus: CHF 2 000 × 0.65 = CHF 1 300. Die restlichen CHF 700 (35 %) gehen an die EStV.',
    diff: 'easy',
  },
  {
    q: 'Wie wird das Konto "Forderung Verrechnungssteuer" eingeordnet?',
    opts: [
      ['Aktivkonto — Forderung gegenüber der Eidgenössischen Steuerverwaltung', true],
      ['Passivkonto — Schuld gegenüber der Steuerverwaltung', false],
      ['Aufwandskonto in der Erfolgsrechnung', false],
      ['Ertragskonto in der Erfolgsrechnung', false],
    ],
    exp: 'Die einbehaltene VST ist noch nicht verloren — sie ist ein Rückforderungsanspruch. Deshalb Aktivkonto (wie Debitoren), in der Bilanz unter Forderungen.',
    diff: 'medium',
  },
  {
    q: 'Wie wird eine Zinsgutschrift von CHF 1 000 brutto (35 % VST) gebucht?',
    opts: [
      ['Bank 650 + Forderung VST 350 / Zinsertrag 1 000', true],
      ['Zinsertrag 1 000 / Bank 650 + VST-Aufwand 350', false],
      ['Bank 1 000 / Zinsertrag 650 + VST 350', false],
      ['Bank 650 / Zinsertrag 650', false],
    ],
    exp: 'Der Bruttoertrag (1 000) wird als Ertrag erfasst. Die Bank zahlt nur 650 aus. Die 350 VST entstehen als Forderung gegenüber der EStV.',
    diff: 'hard',
  },
])

console.log('✅ Band 1 — Verrechnungssteuer (VST) erfolgreich erstellt.')
await client.end()
