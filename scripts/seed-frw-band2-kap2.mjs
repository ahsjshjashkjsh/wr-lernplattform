import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function upsertTopic(slug, title, description, examType, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,band,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'Globe','blue',$5,'frw','2',$6,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, "updatedAt"=NOW()`,
    [topicId, slug, title, description, examType, order]
  )
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function upsertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET title=EXCLUDED.title, subtitle=EXCLUDED.subtitle, summary=EXCLUDED.summary, "contentStatus"='complete', "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary]
  )
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function replaceGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1]
    )
}

async function replaceTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1]
    )
}

async function replacePoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1]
    )
}

async function replaceQuiz(chId, questions) {
  // Delete options first (FK constraint), then questions
  await client.query(
    `DELETE FROM "QuizOption" WHERE "questionId" IN (SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1)`,
    [chId]
  )
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

// ══════════════════════════════════════════════════
// TOPIC: Fremde Währungen
// ══════════════════════════════════════════════════
const tId = await upsertTopic(
  'frw-fremde-waehrungen',
  'Fremde Währungen',
  'Wechselkurse lesen, Kurse situationsgerecht wählen und Beträge zwischen CHF und Fremdwährungen korrekt umrechnen.',
  'abschluss',
  10
)

// ══════════════════════════════════════════════════
// KAPITEL 2: Fremde Währung — Wechselkursumrechnung
// ══════════════════════════════════════════════════
const ch2 = await upsertChapter(
  tId,
  'fremde-waehrung',
  'Fremde Währung',
  'Wechselkurse lesen, Kurse wählen und Währungen umrechnen',
  10,
  `WECHSELKURSUMRECHNUNG — Die Schweiz ist eng mit dem Ausland verflochten. Wer Fremdwährungen kauft, verkauft oder überweist, muss den richtigen Kurs aus der Wechselkurstabelle auswählen und die Umrechnung methodisch korrekt durchführen.

SCHRITT 1 — TRANSAKTIONSART: Bargeld (Banknoten/Münzen) → Notenkurs. Bargeldlos (Überweisung, Karte, Check) → Devisenkurs.

SCHRITT 2 — BANKPERSPEKTIVE: Bank kauft Fremdwährung vom Kunden (Kunde gibt Fremdwährung ab, erhält CHF) → Ankaufskurs. Bank verkauft Fremdwährung an den Kunden (Kunde gibt CHF ab, erhält Fremdwährung) → Verkaufskurs.

SCHRITT 3 — NOTIERUNGSBASIS: Einige Währungen werden pro 1 Einheit notiert (EUR, USD, GBP, AUD, CAD, GBP usw.), andere pro 100 Einheiten (NOK, SEK, DKK, JPY, THB usw.). Diese Basis steht in der Tabelle und bestimmt die Formel.

SCHRITT 4 — UMRECHNUNGSFORMEL:
• Fremdwährung → CHF: CHF = (Kurs × Fremdwährungsbetrag) ÷ (1 oder 100)
• CHF → Fremdwährung: Fremdwährung = ((1 oder 100) × CHF-Betrag) ÷ Kurs
• Kurs bestimmen: Kurs = (CHF-Betrag × (1 oder 100)) ÷ Fremdwährungsbetrag

RUNDUNGSREGELN: CHF auf den Fünfer runden. JPY auf einen Yen genau. Alle anderen Währungen auf 2 Dezimalstellen. Kurse auf 2–4 Dezimalstellen.

BANK-PERSPEKTIVE MERKEN: Ankauf und Verkauf sind immer aus Sicht der Bank definiert — nicht aus Sicht des Kunden. Die Bank verdient an der Spanne (Spread) zwischen Ankaufs- und Verkaufskurs.`
)

await replaceGoals(ch2, [
  'Du kannst eine Wechselkurstabelle lesen und erklären, was Noten- und Devisenkurs sowie Ankauf- und Verkaufskurs bedeuten.',
  'Du kannst für eine konkrete Transaktion den richtigen Kurs aus der Tabelle auswählen (Bargeld/Buchgeld, Bank kauft/verkauft).',
  'Du kannst Fremdwährungsbeträge in Schweizer Franken umrechnen — sowohl bei Währungen mit 1er- als auch mit 100er-Notierung.',
  'Du kannst Schweizer-Franken-Beträge in Fremdwährungsbeträge umrechnen und das Ergebnis korrekt runden.',
  'Du kannst aus einem bekannten CHF-Betrag und einem bekannten Fremdwährungsbetrag den angewendeten Wechselkurs zurückrechnen.',
  'Du kennst die verbindlichen Rundungsregeln für CHF, JPY und alle übrigen Währungen.',
])

await replaceTerms(ch2, [
  ['Wechselkurs', 'Preis einer ausländischen Währung, ausgedrückt in Schweizer Franken. Gibt an, wie viele CHF man für 1 oder 100 Einheiten der Fremdwährung zahlt oder erhält.'],
  ['Notenkurs', 'Wechselkurs für Bargeldtransaktionen (Banknoten und Münzen). Wird angewendet, wenn physische Fremdwährung den Besitzer wechselt.'],
  ['Devisenkurs', 'Wechselkurs für bargeldlose Zahlungsvorgänge wie Überweisungen, Kartenzahlungen, Checks oder Fremdwährungskonten.'],
  ['Ankaufskurs (Geldkurs)', 'Kurs, zu dem die Bank Fremdwährung vom Kunden kauft. Der Kunde gibt Fremdwährung ab und erhält CHF. Für den Kunden ungünstiger als der Verkaufskurs.'],
  ['Verkaufskurs (Briefkurs)', 'Kurs, zu dem die Bank Fremdwährung an den Kunden verkauft. Der Kunde gibt CHF ab und erhält Fremdwährung. Für den Kunden teurer als der Ankaufskurs.'],
  ['Einheit der Kursnotierung', 'Anzahl ausländischer Währungseinheiten, auf die sich der Kurs bezieht — typischerweise 1 (z.B. EUR, USD) oder 100 (z.B. NOK, SEK, JPY). Bestimmt den Rechenfaktor in der Formel.'],
  ['Spread', 'Differenz zwischen Ankaufs- und Verkaufskurs. Hierin liegt der Gewinn der Bank bei Devisengeschäften.'],
  ['Dreisatz', 'Rechenmethode, mit der Währungsumrechnungen als proportionale Verhältnisse dargestellt und gelöst werden. Macht den Zusammenhang zwischen Kurs und Betrag transparent.'],
  ['Rückrechnung des Wechselkurses', 'Bestimmung des angewendeten Kurses, wenn CHF-Betrag und Fremdwährungsbetrag einer Transaktion bekannt sind. Formel: Kurs = (CHF × (1 oder 100)) ÷ Fremdwährungsbetrag.'],
  ['Devisen', 'Fremdwährung in bargeldloser Form. Im weiteren Sinne: jede ausländische Währung. Im engeren Sinne (Kurstabelle): nur bargeldlose Positionen — Gegenbegriff zu Noten.'],
])

await replacePoints(ch2, [
  'Ankauf und Verkauf in der Wechselkurstabelle sind immer aus Sicht der Bank definiert — nicht aus Kundensicht.',
  'Bargeld (Noten) und Buchgeld (Devisen) haben unterschiedliche Kurse. Die erste Entscheidung ist immer: Bargeld oder bargeldlos?',
  'Einige Währungen werden pro 1 Einheit notiert (EUR, USD, GBP), andere pro 100 Einheiten (NOK, SEK, DKK, JPY). Wer die Basis ignoriert, rechnet systematisch falsch.',
  'Fremdwährung → CHF: CHF = (Kurs × Fremdwährungsbetrag) ÷ (1 oder 100).',
  'CHF → Fremdwährung: Fremdwährung = ((1 oder 100) × CHF-Betrag) ÷ Kurs.',
  'Kurs unbekannt bestimmen: Kurs = (CHF-Betrag × (1 oder 100)) ÷ Fremdwährungsbetrag.',
  'Rundungsregeln sind fachlicher Bestandteil der Lösung: CHF auf den Fünfer, JPY auf einen Yen, alle anderen Währungen auf 2 Dezimalstellen, Kurse auf 2–4 Dezimalstellen.',
  'Der Spread zwischen Ankaufs- und Verkaufskurs ist der Gewinn der Bank — deshalb ist der Verkaufskurs (Bank verkauft) immer höher als der Ankaufskurs (Bank kauft).',
  'Die Entscheidungsreihenfolge ist entscheidend: (1) Bargeld oder Buchgeld? → (2) Bank kauft oder verkauft? → (3) Kurs pro 1 oder 100? → (4) Welche Richtung wird umgerechnet?',
  'Aus einer Bankabrechnung mit bekanntem CHF- und Fremdwährungsbetrag lässt sich der tatsächlich angewendete Kurs algebraisch zurückrechnen.',
])

await replaceQuiz(ch2, [
  {
    q: 'Eine Kundin kauft EUR 500 Bargeld bei der Bank. Welcher Kurs ist anzuwenden?',
    opts: [
      ['EUR-Noten-Verkaufskurs', true],
      ['EUR-Noten-Ankaufskurs', false],
      ['EUR-Devisen-Verkaufskurs', false],
      ['EUR-Devisen-Ankaufskurs', false],
    ],
    exp: 'Die Bank verkauft Euro-Bargeld (Noten) an die Kundin. Deshalb gilt: Noten (Bargeld) + Verkauf (Bank verkauft) = EUR-Noten-Verkaufskurs.',
    diff: 'easy',
  },
  {
    q: 'Ein Schweizer Unternehmen überweist NOK 4 000 an einen norwegischen Lieferanten. Der NOK-Devisen-Verkaufskurs beträgt 11.216 für 100 NOK. Wie viel CHF werden belastet?',
    opts: [
      ['CHF 448.64', true],
      ['CHF 44 864.00', false],
      ['CHF 356.85', false],
      ['CHF 4 486.40', false],
    ],
    exp: 'Bargeldlos (Devisen), Bank verkauft NOK → Devisen-Verkaufskurs. NOK wird pro 100 notiert. Formel: (11.216 × 4 000) ÷ 100 = CHF 448.64.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Unterschied zwischen Notenkurs und Devisenkurs?',
    opts: [
      ['Notenkurs gilt für Bargeld, Devisenkurs für bargeldlose Zahlungen', true],
      ['Notenkurs gilt für Überweisungen, Devisenkurs für Bargeld', false],
      ['Notenkurs ist immer günstiger für den Kunden', false],
      ['Es gibt keinen Unterschied, die Bezeichnungen sind austauschbar', false],
    ],
    exp: 'Noten = physische Banknoten und Münzen → Notenkurs. Bargeldlose Vorgänge wie Überweisungen, Kartenzahlungen → Devisenkurs. Die Zuordnung bestimmt das korrekte Tabellenfeld.',
    diff: 'easy',
  },
  {
    q: 'Eine Reisende tauscht EUR 125 Bargeld zurück in CHF. Der EUR-Noten-Ankaufskurs beträgt 1.083. Wie viele CHF erhält sie (auf den Fünfer gerundet)?',
    opts: [
      ['CHF 135.40', true],
      ['CHF 115.45', false],
      ['CHF 135.375', false],
      ['CHF 125.00', false],
    ],
    exp: 'Die Bank kauft EUR-Bargeld (Ankauf, Noten). Formel: (1.083 × 125) ÷ 1 = CHF 135.375 → auf den Fünfer gerundet = CHF 135.40.',
    diff: 'medium',
  },
  {
    q: 'Warum ist der Verkaufskurs der Bank immer höher als der Ankaufskurs?',
    opts: [
      ['Die Differenz ist der Gewinn (Spread) der Bank', true],
      ['Weil Bargeld teurer ist als Buchgeld', false],
      ['Weil der Staat eine Wechselsteuer erhebt', false],
      ['Weil der Kunde immer den schlechteren Kurs wählen muss', false],
    ],
    exp: 'Verkaufskurs > Ankaufskurs → Spread. Die Bank verdient an dieser Spanne: Sie kauft Fremdwährung billiger und verkauft sie teurer. Das ist die Haupteinnahmequelle im Devisengeschäft.',
    diff: 'easy',
  },
  {
    q: 'Eine Bank belastet für eine EUR-Überweisung von EUR 8 000 den Betrag von CHF 8 960. Welcher Kurs wurde angewendet?',
    opts: [
      ['CHF 1.12 pro EUR 1', true],
      ['CHF 1.20 pro EUR 1', false],
      ['CHF 0.893 pro EUR 1', false],
      ['CHF 11.20 pro EUR 100', false],
    ],
    exp: 'Kursformel: (CHF 8 960 × 1) ÷ EUR 8 000 = 1.12. EUR wird pro 1 Einheit notiert, also Faktor 1. Ergebnis: CHF 1.12 pro EUR 1.',
    diff: 'medium',
  },
  {
    q: 'Ein Kunde möchte CHF 400 in norwegische Kronen (Bargeld) tauschen. Der NOK-Noten-Verkaufskurs beträgt 11.814 für 100 NOK. Wie viele NOK erhält er?',
    opts: [
      ['NOK 3 385.81', true],
      ['NOK 338.58', false],
      ['NOK 47 256.00', false],
      ['NOK 33 858.10', false],
    ],
    exp: 'Bank verkauft NOK-Bargeld → Noten-Verkaufskurs. NOK pro 100 notiert. Formel: (100 × 400) ÷ 11.814 = NOK 3 385.81.',
    diff: 'hard',
  },
  {
    q: 'Welche Aussage zur Kursnotierung ist korrekt?',
    opts: [
      ['EUR wird pro 1 Einheit notiert, NOK wird pro 100 Einheiten notiert', true],
      ['Alle Währungen werden pro 1 Einheit notiert', false],
      ['NOK wird pro 1 Einheit notiert, EUR pro 100 Einheiten', false],
      ['JPY und EUR werden beide pro 1 Einheit notiert', false],
    ],
    exp: 'EUR, USD, GBP etc. werden pro 1 Einheit notiert. NOK, SEK, DKK, JPY etc. werden pro 100 Einheiten notiert. Diese Unterscheidung bestimmt den Rechenfaktor (÷1 oder ÷100).',
    diff: 'medium',
  },
  {
    q: 'Welches ist die korrekte Entscheidungsreihenfolge bei der Kurswahl?',
    opts: [
      ['Bargeld oder Buchgeld? → Bank kauft oder verkauft? → Kurs pro 1 oder 100? → Umrechnungsrichtung?', true],
      ['Welche Währung? → Wie viel Betrag? → Welcher Kurs ist am günstigsten?', false],
      ['Umrechnungsrichtung → Notierungsbasis → Bankperspektive → Transaktionsart', false],
      ['Nur die Höhe des Betrags entscheidet, welcher Kurs anzuwenden ist', false],
    ],
    exp: 'Das Entscheidungsmodell lautet: (1) Bargeld/Buchgeld → Noten- oder Devisenkurs. (2) Bank kauft/verkauft → Ankauf oder Verkauf. (3) Notierungsbasis 1 oder 100. (4) Formel anwenden.',
    diff: 'medium',
  },
])

console.log('✅ Kapitel 2: Fremde Währung (Wechselkursumrechnung) erfolgreich aktualisiert.')
await client.end()
