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
     VALUES ($1,$2,$3,$4,'Globe','teal','abschluss','frw','1',$5,true,NOW(),NOW())
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
  'frw-band1-fremde-waehrungen',
  'Fremde Währungen — Grundlagen',
  'Wechselkurstabellen, Noten- vs. Devisenkurs, Ankauf/Verkauf aus Sicht der Bank, Währungsumrechnung CHF ↔ Fremdwährung.',
  5
)

const ch = await insertChapter(tId,
  'band1-fremde-waehrungen',
  'Fremde Währungen — Grundlagen',
  'Wechselkurstabellen, Kursnotierung und Umrechnung',
  1,
  `WECHSELKURSTABELLEN — Banken veröffentlichen Tabellen mit Noten- und Devisenkursen. Jede Währung hat vier Kurse: Noten Ankauf, Noten Verkauf, Devisen Ankauf, Devisen Verkauf.
NOTEN VERSUS DEVISEN — Notenkurse gelten für Bargeld (Banknoten, Münzen). Devisenkurse gelten für bargeldlose Zahlungen (Überweisungen, Kartentransaktionen). Für Unternehmen in der Buchhaltung sind Devisenkurse massgebend.
ANKAUF UND VERKAUF AUS SICHT DER BANK — Ankauf: Bank kauft Fremdwährung vom Kunden, gibt CHF heraus. Verkauf: Bank verkauft Fremdwährung an Kunden, erhält CHF. Der Ankaufskurs ist für den Kunden ungünstiger; die Bank verdient an der Kursspanne.
KURSNOTIERUNG — EUR, USD, GBP: Kurs pro 1 Einheit. JPY, NOK, SEK, DKK: Kurs pro 100 Einheiten. Kurs = Preis in CHF für 1 oder 100 Einheiten der Fremdwährung.
UMRECHNUNG — FW → CHF: Betrag × Kurs ÷ Notierungseinheit. CHF → FW: Betrag × Notierungseinheit ÷ Kurs.`
)

await addGoals(ch, [
  'Du kannst eine Wechselkurstabelle korrekt lesen und die vier Kursfelder unterscheiden.',
  'Du verstehst den Unterschied zwischen Noten- und Devisenkurs.',
  'Du kannst Ankauf und Verkauf aus Sicht der Bank korrekt einordnen.',
  'Du kannst Beträge von Fremdwährung in CHF und zurück umrechnen.',
  'Du weißt, wann der Kurs für 1 und wann für 100 Einheiten gilt.',
])

await addTerms(ch, [
  ['Notenkurs', 'Wechselkurs für Bargeldtransaktionen (physische Banknoten und Münzen). Weniger günstig als Devisenkurs.'],
  ['Devisenkurs', 'Wechselkurs für bargeldlose Zahlungen (Überweisungen, Kreditkartentransaktionen, Fremdwährungskonten). Für die Buchhaltung massgebend.'],
  ['Ankaufskurs (Bank)', 'Kurs, zu dem die Bank Fremdwährung vom Kunden kauft und CHF herausgibt. Für den Kunden: er erhält CHF.'],
  ['Verkaufskurs (Bank)', 'Kurs, zu dem die Bank Fremdwährung an den Kunden verkauft und CHF erhält. Für den Kunden: er gibt CHF aus.'],
  ['Kursnotierung', 'Wechselkurse werden entweder pro 1 Einheit (EUR, USD, GBP) oder pro 100 Einheiten (JPY, NOK, SEK) der Fremdwährung angegeben.'],
  ['Kursspanne (Spread)', 'Differenz zwischen Ankaufs- und Verkaufskurs der Bank. Stellt den Gewinn der Bank dar.'],
])

await addPoints(ch, [
  'Noten = Bargeld. Devisen = bargeldlos. Für die Unternehmensbuchhaltung immer Devisenkurse verwenden.',
  'Perspektive der Bank: Ankauf = Bank kauft FW vom Kunden. Verkauf = Bank verkauft FW an Kunden.',
  'EUR, USD, GBP: Kurs pro 1 FW-Einheit. JPY, NOK, SEK, DKK: Kurs pro 100 FW-Einheiten.',
  'FW → CHF: Betrag (in FW) × Kurs ÷ Notierungseinheit (1 oder 100).',
  'CHF → FW: Betrag (in CHF) × Notierungseinheit ÷ Kurs.',
  'Bank verdient an der Kursspanne: Ankaufskurs immer tiefer als Verkaufskurs.',
])

await addExamples(ch, [
  'EUR → CHF: EUR 3 000, Devisenkurs Ankauf 0.975 (pro 1 EUR). CHF = 3 000 × 0.975 ÷ 1 = CHF 2 925.',
  'CHF → EUR: CHF 5 000, Devisenkurs Verkauf 0.985 (pro 1 EUR). EUR = 5 000 × 1 ÷ 0.985 = EUR 5 076.14.',
  'NOK → CHF: NOK 50 000, Devisenkurs Ankauf 8.85 (pro 100 NOK). CHF = 50 000 × 8.85 ÷ 100 = CHF 4 425.',
])

await addQuiz(ch, [
  {
    q: 'Was ist ein Devisenkurs?',
    opts: [
      ['Wechselkurs für bargeldlose Zahlungen (Überweisungen, Buchgeld)', true],
      ['Wechselkurs für Bargeldtransaktionen', false],
      ['Durchschnittskurs über alle Währungen', false],
      ['Kurs aus Sicht des Kunden, nicht der Bank', false],
    ],
    exp: 'Devisen = bargeldlose Zahlungsformen. Für Unternehmensbuchhaltungen sind immer die Devisenkurse massgebend.',
    diff: 'easy',
  },
  {
    q: 'Was bedeutet "Ankaufskurs" aus Sicht der Bank?',
    opts: [
      ['Die Bank kauft Fremdwährung vom Kunden und zahlt CHF aus', true],
      ['Die Bank verkauft Fremdwährung an den Kunden', false],
      ['Der günstigere Kurs für den Kunden', false],
      ['Der Kurs gilt nur für Bargeldtransaktionen', false],
    ],
    exp: 'Ankauf und Verkauf sind immer aus Sicht der Bank. Ankauf: Bank erhält FW, gibt CHF. Verkauf: Bank gibt FW, erhält CHF.',
    diff: 'medium',
  },
  {
    q: 'Ein Schweizer Unternehmen exportiert Waren und erhält EUR 8 000. Devisenkurs Ankauf: 0.972 (pro 1 EUR). Wie viel CHF erhält das Unternehmen?',
    opts: [
      ['CHF 7 776', true],
      ['CHF 8 230', false],
      ['CHF 8 000', false],
      ['CHF 7 500', false],
    ],
    exp: '8 000 × 0.972 ÷ 1 = CHF 7 776. Die Bank kauft EUR vom Unternehmen (Ankaufskurs) und zahlt CHF aus.',
    diff: 'medium',
  },
  {
    q: 'Für welche Währungen gilt typischerweise eine Kursnotierung pro 100 Einheiten?',
    opts: [
      ['Japanischer Yen (JPY) und Norwegische Krone (NOK)', true],
      ['Euro (EUR) und US-Dollar (USD)', false],
      ['Britisches Pfund (GBP) und Schweizer Franken (CHF)', false],
      ['Alle Währungen werden pro 1 Einheit notiert', false],
    ],
    exp: 'JPY, NOK, SEK, DKK werden pro 100 Einheiten notiert, da ihre Einzelwerte sehr klein sind. EUR, USD, GBP pro 1 Einheit.',
    diff: 'medium',
  },
  {
    q: 'Ein Unternehmen möchte CHF 10 000 in USD wechseln. Devisenkurs Verkauf: 1.095 (pro 1 USD). Wie viel USD erhält es?',
    opts: [
      ['USD 9 132 (gerundet)', true],
      ['USD 10 950', false],
      ['USD 10 000', false],
      ['USD 8 951', false],
    ],
    exp: 'CHF → USD: 10 000 × 1 ÷ 1.095 = USD 9 132. Der Verkaufskurs der Bank wird verwendet, da der Kunde USD kauft.',
    diff: 'hard',
  },
])

console.log('✅ Band 1 — Fremde Währungen Grundlagen erfolgreich erstellt.')
await client.end()
