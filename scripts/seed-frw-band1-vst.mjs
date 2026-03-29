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
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title, description=EXCLUDED.description, "updatedAt"=NOW()`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET
       title=EXCLUDED.title, subtitle=EXCLUDED.subtitle, summary=EXCLUDED.summary,
       "contentStatus"=EXCLUDED."contentStatus", "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function clearChapterContent(chId) {
  await client.query(`DELETE FROM "QuizOption" WHERE "questionId" IN (SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1)`, [chId])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
}

async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1])
}

async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1])
}

async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1])
}

async function addQuiz(chId, questions) {
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

// --- Topic ---
const tId = await insertTopic(
  'frw-verrechnungssteuer',
  'Verrechnungssteuer (VST)',
  'Schweizer Quellensteuer auf Kapitalerträge: 35 % Abzug, Rückforderung über Steuererklärung, bilanzielle Erfassung als Aktivkonto.',
  4
)

// --- Chapter ---
const ch = await insertChapter(
  tId,
  'band1-vst',
  'Verrechnungssteuer (VST)',
  'Sicherungssteuer, Abzug und Rückforderung, Buchung als Forderung',
  1,
  `WESEN DER VST — Die Verrechnungssteuer ist eine schweizerische Steuer auf bestimmte Vermögenserträge; ihr Standardsatz beträgt 35 %, der Spezialsatz 8 % bei Kapitalauszahlungen aus gemischten Lebensversicherungen.
STEUERBARE ERTRÄGE — Erfasst werden Bankzinsen über CHF 200, Obligationenzinsen, Dividenden und Lotteriegewinne über CHF 1'000'000.
MECHANISMUS (65/35-REGEL) — Die Bank zieht 35 % direkt vom Bruttoertrag ab und liefert sie an die Eidgenössische Steuerverwaltung (EStV) ab; dem Kunden werden nur 65 % gutgeschrieben.
RÜCKFORDERUNG — In der Schweiz wohnhafte Personen können die 35 % über das Wertschriftenverzeichnis der Steuererklärung zurückfordern, sofern Ertrag als Einkommen und Kapital als Vermögen vollständig deklariert sind.
SICHERUNGSFUNKTION — Zweck der VST ist nicht die endgültige Belastung, sondern die Sicherstellung korrekter Deklaration; Nichtdeklaration gilt als Steuerhinterziehung und zieht Nachsteuern sowie Strafsteuern nach sich.
BUCHUNG — Zinsgutschrift CHF 1'000 brutto: Bank 650 + Forderung Verrechnungssteuer 350 / Zinsertrag 1'000. Das Konto «Forderung Verrechnungssteuer» ist ein Aktivkonto (Forderung gegenüber EStV), ausgewiesen in der Bilanz unter Forderungen.`
)

// --- Clear before reinsert ---
await clearChapterContent(ch)

// --- Learning Goals (6) ---
await addGoals(ch, [
  'Du kennst den Standardsatz der Verrechnungssteuer (35 %) und den Spezialsatz (8 %) für gemischte Lebensversicherungen.',
  'Du kennst die Ertragsarten, die der Verrechnungssteuer unterliegen (Bankzinsen, Obligationenzinsen, Dividenden, Lotteriegewinne).',
  'Du kannst den Mechanismus Abzug–Ablieferung–Deklaration–Rückerstattung zwischen Bank, Bankkunde und EStV erklären.',
  'Du kannst die Sicherungsfunktion der VST beschreiben und die Folgen fehlender Deklaration benennen.',
  'Du kannst das Konto «Forderung Verrechnungssteuer» als Aktivkonto einordnen und einen Buchungssatz für eine Zinsgutschrift korrekt erstellen.',
  'Du kennst die Voraussetzungen für die Rückforderung der VST über das Wertschriftenverzeichnis.',
])

// --- Key Terms (10) ---
await addTerms(ch, [
  ['Verrechnungssteuer (VST)', 'Schweizerische Steuer auf bestimmte Vermögenserträge. Standardsatz 35 %. Wird direkt bei Auszahlung durch die Bank abgezogen und an die Eidgenössische Steuerverwaltung abgeliefert.'],
  ['Sicherungssteuer', 'Bezeichnung für den Zweck der VST: Sie sichert die korrekte Deklaration von Kapitalerträgen und Vermögen. Nur wer vollständig deklariert, erhält die 35 % zurück.'],
  ['65/35-Regel', 'Praktische Konsequenz des 35%-Steuersatzes: Der Bankkunde erhält 65 % des Bruttoertrags gutgeschrieben; 35 % gehen an die Eidgenössische Steuerverwaltung.'],
  ['Eidgenössische Steuerverwaltung (EStV)', 'Bundesbehörde, an welche die Bank die einbehaltene Verrechnungssteuer abliefert. Sie erstattet die VST zurück, wenn die Voraussetzungen der Deklaration erfüllt sind.'],
  ['Wertschriftenverzeichnis', 'Beilage zur Steuererklärung, in der Wertschriften, Kapitalerträge und Vermögenswerte deklariert werden. Es ist das Instrument zur Beantragung der VST-Rückerstattung.'],
  ['Forderung Verrechnungssteuer', 'Aktivkonto, das den Rückforderungsanspruch des Bankkunden gegenüber der EStV erfasst. Wird in der Bilanz unter Forderungen ausgewiesen; entsteht durch den 35%-Abzug.'],
  ['Bruttoertrag', 'Der vollständige Kapitalertrag (100 %) vor Abzug der Verrechnungssteuer. Grundlage der Steuerberechnung und des buchhalterisch erfassten Zinsertrags.'],
  ['Spezialsatz 8 %', 'Ausnahme vom allgemeinen VST-Satz: Gilt für Kapitalauszahlungen bei gemischten Lebensversicherungen anstelle der üblichen 35 %.'],
  ['Steuerhinterziehung', 'Nichtdeklaration von Kapitalerträgen oder Vermögen in der Steuererklärung. Folge: Keine Rückerstattung der VST; bei Aufdeckung werden Nachsteuern und Strafsteuern erhoben.'],
  ['Kapitalertrag', 'Ertrag aus Kapitalanlagen oder Vermögenswerten, z.B. Bankzinsen, Obligationenzinsen oder Dividenden. Bildet die Bemessungsgrundlage der Verrechnungssteuer.'],
])

// --- Core Points (9) ---
await addPoints(ch, [
  'VST-Satz: grundsätzlich 35 %. Spezialsatz 8 % bei Kapitalauszahlungen aus gemischten Lebensversicherungen.',
  'Steuerbare Erträge: Bankzinsen über CHF 200, Obligationenzinsen, Dividenden, Lotteriegewinne über CHF 1'000'000.',
  'Abzugsprozess: Bank zieht 35 % vom Bruttoertrag ab und liefert sie an die Eidgenössische Steuerverwaltung. Dem Kunden werden 65 % gutgeschrieben.',
  'Rückforderungsvoraussetzung (doppelte Deklaration): Kapitalertrag muss als Einkommen und das zugrunde liegende Kapital als Vermögen in der Steuererklärung deklariert werden.',
  'Instrument der Rückforderung: Wertschriftenverzeichnis als Beilage zur Steuererklärung.',
  'Sicherungsfunktion: Die VST schafft einen Anreiz zur vollständigen Offenlegung — nicht deklarierte Erträge sind nicht rückerstattungsfähig.',
  'Folgen fehlender Deklaration: Steuerhinterziehung; bei Aufdeckung Nachsteuern und Strafsteuern.',
  'Buchung Zinsgutschrift CHF 1'000 brutto: Bank 650 + Forderung Verrechnungssteuer 350 / Zinsertrag 1'000.',
  '«Forderung Verrechnungssteuer» ist ein Aktivkonto (analog zu Debitoren). Steht in der Bilanz unter Forderungen und spiegelt den Rückerstattungsanspruch gegenüber der EStV.',
])

// --- Quiz Questions (8) ---
await addQuiz(ch, [
  {
    q: 'Wie hoch ist der Standardsatz der Verrechnungssteuer in der Schweiz?',
    opts: [
      ['35 %', true],
      ['25 %', false],
      ['8 %', false],
      ['7,7 %', false],
    ],
    exp: '35 % ist der Standardsatz der VST. Der Spezialsatz von 8 % gilt nur für Kapitalauszahlungen aus gemischten Lebensversicherungen. 7,7 % ist der MWST-Normalsatz.',
    diff: 'easy',
  },
  {
    q: 'Welcher Spezialsatz gilt bei Kapitalauszahlungen aus gemischten Lebensversicherungen?',
    opts: [
      ['8 %', true],
      ['35 %', false],
      ['15 %', false],
      ['5 %', false],
    ],
    exp: 'Laut Lehrmittel gilt für Kapitalauszahlungen bei gemischten Lebensversicherungen ein Spezialsatz von 8 % statt des allgemeinen Satzes von 35 %.',
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
    exp: 'Die VST ist eine Sicherungssteuer: Sie zwingt zur Deklaration, weil nur vollständig deklarierte Erträge rückerstattet werden. Sie ist keine Endsteuer.',
    diff: 'medium',
  },
  {
    q: 'Wie viel erhält ein Bankkunde bei einem Zinsertrag von CHF 2'000 brutto gutgeschrieben?',
    opts: [
      ['CHF 1'300 (65 %)', true],
      ['CHF 2'000 (100 %)', false],
      ['CHF 1'500 (75 %)', false],
      ['CHF 700 (35 %)', false],
    ],
    exp: 'Die Bank zahlt 65 % aus: CHF 2'000 × 0.65 = CHF 1'300. Die restlichen CHF 700 (35 %) werden an die Eidgenössische Steuerverwaltung abgeliefert.',
    diff: 'easy',
  },
  {
    q: 'Welche beiden Bedingungen müssen für die Rückerstattung der VST erfüllt sein?',
    opts: [
      ['Kapitalertrag als Einkommen und Kapital als Vermögen deklarieren', true],
      ['Nur den Kapitalertrag als Einkommen deklarieren', false],
      ['Einen separaten Rückerstattungsantrag bei der Bank einreichen', false],
      ['Die Steuer innerhalb von 30 Tagen zurückfordern', false],
    ],
    exp: 'Die Rückforderung setzt eine doppelte Deklaration voraus: Der Ertrag muss als Einkommen und das zugrunde liegende Kapital muss als Vermögen in der Steuererklärung angegeben werden.',
    diff: 'medium',
  },
  {
    q: 'Wie wird das Konto «Forderung Verrechnungssteuer» in der Buchhaltung eingeordnet?',
    opts: [
      ['Aktivkonto — Forderung gegenüber der Eidgenössischen Steuerverwaltung', true],
      ['Passivkonto — Schuld gegenüber der Steuerverwaltung', false],
      ['Aufwandskonto in der Erfolgsrechnung', false],
      ['Ertragskonto in der Erfolgsrechnung', false],
    ],
    exp: 'Die einbehaltene VST ist kein endgültiger Verlust, sondern ein Rückforderungsanspruch gegenüber der EStV. Deshalb handelt es sich um ein Aktivkonto, das in der Bilanz unter Forderungen ausgewiesen wird.',
    diff: 'medium',
  },
  {
    q: 'Wie lautet der Buchungssatz für eine Zinsgutschrift von CHF 1'000 brutto (VST 35 %)?',
    opts: [
      ['Bank 650 + Forderung VST 350 / Zinsertrag 1'000', true],
      ['Zinsertrag 1'000 / Bank 650 + VST-Aufwand 350', false],
      ['Bank 1'000 / Zinsertrag 650 + Forderung VST 350', false],
      ['Bank 650 / Zinsertrag 650', false],
    ],
    exp: 'Der Bruttoertrag (1'000) wird vollständig als Zinsertrag erfasst. Die Bank überweist 650 auf das Konto des Kunden. Die einbehaltenen 350 entstehen als Forderung (Aktivkonto) gegenüber der EStV.',
    diff: 'hard',
  },
  {
    q: 'Was sind die Folgen, wenn Kapitalerträge in der Steuererklärung nicht deklariert werden?',
    opts: [
      ['Keine Rückerstattung der VST; bei Aufdeckung Nachsteuern und Strafsteuern', true],
      ['Automatische Rückerstattung nach 5 Jahren', false],
      ['Die Bank erstattet die VST direkt zurück', false],
      ['Keine Folgen, solange die Summe unter CHF 1'000 bleibt', false],
    ],
    exp: 'Nichtdeklaration gilt als Steuerhinterziehung. Die Rückerstattung wird verweigert. Bei Aufdeckung werden Nachsteuern für die nicht deklarierten Erträge sowie Strafsteuern erhoben.',
    diff: 'hard',
  },
])

console.log('VST Band 1 — Verrechnungssteuer erfolgreich aktualisiert.')
await client.end()
