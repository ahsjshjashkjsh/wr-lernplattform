import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

// ─── helpers ────────────────────────────────────────────────────────────────

async function insertTopic(slug, title, description, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'Landmark','amber','abschluss','geschichte',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title,
       description=EXCLUDED.description,
       "order"=EXCLUDED."order",
       "updatedAt"=NOW()`,
    [topicId, slug, title, description, order]
  )
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET
       title=EXCLUDED.title,
       subtitle=EXCLUDED.subtitle,
       summary=EXCLUDED.summary,
       "contentStatus"=EXCLUDED."contentStatus",
       "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary]
  )
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function addGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1]
    )
}

async function addTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1]
    )
}

async function addPoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1]
    )
}

async function addQuiz(chId, questions) {
  const qRows = await client.query(`SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (const row of qRows.rows)
    await client.query(`DELETE FROM "QuizOption" WHERE "questionId"=$1`, [row.id])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])

  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff || 'medium', i + 1]
    )
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j + 1]
      )
  }
}

// ════════════════════════════════════════════════════════════════════════════
// THEMA 1 — PLATZHALTER (wird durch Inhalt ersetzt)
// ════════════════════════════════════════════════════════════════════════════

const t1 = await insertTopic(
  'geschichte-thema-1',          // slug
  'Thema 1',                     // titel
  'Beschreibung folgt.',         // beschreibung
  10                             // reihenfolge
)

const ch1 = await insertChapter(
  t1,
  'thema-1-kapitel-1',
  'Kapitel 1',
  'Untertitel',
  1,
  `Zusammenfassung folgt.`
)

await addGoals(ch1, [
  'Lernziel 1',
])

await addTerms(ch1, [
  ['Begriff', 'Definition'],
])

await addPoints(ch1, [
  'Merksatz 1',
])

await addQuiz(ch1, [
  {
    q: 'Frage?',
    opts: [
      ['Richtige Antwort', true],
      ['Falsche Antwort', false],
    ],
    exp: 'Erklärung',
    diff: 'medium',
  },
])

// ════════════════════════════════════════════════════════════════════════════

console.log('✅ Geschichte: Seed abgeschlossen.')
await client.end()
