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
     VALUES ($1,$2,$3,$4,'Receipt','green','abschluss','frw','3',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET title=$2, description=$3, published=true, band='3', "updatedAt"=NOW()`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET title=$3, subtitle=$4, summary=$7, "contentStatus"='complete', "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}
async function addGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`, [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), points[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  const existing = await client.query(`SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (const q of existing.rows)
    await client.query(`DELETE FROM "QuizOption" WHERE "questionId"=$1`, [q.id])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(`INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(`INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

const tId = await insertTopic(
  'frw-mwst-vertiefung',
  'Mehrwertsteuer Vertiefung',
  'MWST-Buchführung nach Nettomethode: Buchung von Einkauf und Verkauf mit Skonto und Rabatt, Quartalsabrechnung, Forderungsverluste und MWST-Korrektur.',
  16
)

const ch = await insertChapter(tId, 'mwst-vertiefung', 'Mehrwertsteuer Vertiefung', 'Nettomethode, Abrechnung und Sonderfälle', 1,
`NETTOMETHODE — Die Nettomethode ist das Standardverfahren der Schweizer MWST-Buchführung. Erträge und Aufwände werden ohne MWST erfasst; die Steuer läuft getrennt über das Konto Abrechnungskonto MWST. Am Quartalsende wird der Saldo (Umsatzsteuer minus Vorsteuer) an die ESTV überwiesen oder zurückgefordert.
STEUERSÄTZE UND AUSNAHMEN — Normalsatz 7.7 % für die meisten Lieferungen und Dienstleistungen. Sondersatz 3.7 % für Beherbergungsleistungen. Sondersatz 2.5 % für Lebensmittel, Zeitungen, Bücher und Medikamente. Steuerbefreite Umsätze (Export, internationale Beförderung) berechtigen zum Vorsteuerabzug. Ausgenommene Umsätze (z. B. Versicherungen, Bildung, Gesundheit) berechtigen nicht zum Vorsteuerabzug — ein wichtiger Unterschied.
BUCHUNG EINKAUF MIT SKONTO — Eingangsrechnung: Warenaufwand (Netto) + Vorsteuer (MWST-Betrag) an Kreditoren (Bruttobetrag). Skonto bei Zahlung: Kreditoren an Bank (bezahlter Betrag) + Warenaufwand (Skonto-Nettoanteil) + Vorsteuer (MWST-Anteil des Skontos). Der Skonto wird also auf Netto und MWST aufgeteilt — die Vorsteuer wird proportional korrigiert.
BUCHUNG VERKAUF MIT RABATT — Ausgangsrechnung: Debitoren (Brutto nach Rabatt) an Warenerlöse (Netto nach Rabatt) + Abrechnungskonto MWST (Steuer auf Nettoerlös). Wird der Rabatt bereits bei Rechnungsstellung gewährt, ist er direkt in der Basis enthalten. Bei nachträglichem Rabatt wird eine Gutschrift mit entsprechender MWST-Korrektur erstellt.
MWST-ABRECHNUNG AM QUARTALSENDE — Umsatzsteuer (aus Verkäufen, im Haben des Abrechnungskontos) minus Vorsteuer (aus Einkäufen, im Soll des Abrechnungskontos) = geschuldete MWST. Positiver Saldo: Abrechnungskonto MWST an Bank. Negativer Saldo (Vorsteuerüberhang): Bank an Abrechnungskonto MWST. Das Abrechnungskonto hat nach der Buchung Saldo Null.
FORDERUNGSVERLUST UND MWST-KORREKTUR — Bei definitiv uneinbringlichem Forderungsverlust darf die bereits abgerechnete Umsatzsteuer korrigiert werden. Buchung: Verluste aus Lieferungen und Leistungen (Nettobetrag) + Abrechnungskonto MWST (MWST-Betrag) an Debitoren (Bruttobetrag). Bei Teilzahlung (z. B. Konkursdividende 10 %) wird nur der ausgefallene Anteil korrigiert.`)

await addGoals(ch, [
  'Du kennst die Nettomethode und kannst erklären, wie das Abrechnungskonto MWST funktioniert.',
  'Du kannst den Unterschied zwischen steuerbefreiten und ausgenommenen Umsätzen erklären.',
  'Du kannst einen Wareneinkauf inkl. MWST und nachfolgende Skontovereinnahmung korrekt verbuchen.',
  'Du kannst einen Warenverkauf inkl. MWST mit Rabatt korrekt verbuchen.',
  'Du kannst die MWST-Abrechnung am Quartalsende durchführen und die Zahlung an die ESTV verbuchen.',
  'Du kannst einen Forderungsverlust mit MWST-Korrektur korrekt verbuchen.',
])

await addTerms(ch, [
  ['Nettomethode', 'MWST-Buchführungsverfahren, bei dem Aufwände und Erträge ohne MWST erfasst werden und die Steuer getrennt über das Abrechnungskonto MWST läuft.'],
  ['Abrechnungskonto MWST', 'Zwischenkonto, das Umsatzsteuer (Haben) und Vorsteuer (Soll) sammelt; Saldo = geschuldete MWST oder Vorsteuerüberhang.'],
  ['Vorsteuer', 'MWST auf Einkäufen, die das Unternehmen von der geschuldeten Umsatzsteuer abziehen darf (Vorsteuerabzug).'],
  ['Umsatzsteuer', 'MWST auf Verkäufen, die das Unternehmen der ESTV schuldet.'],
  ['Normalsatz', 'Allgemeiner MWST-Satz von 7.7 % in der Schweiz (gilt seit 2024).'],
  ['Sondersatz 3.7 %', 'MWST-Satz für Beherbergungsleistungen (Hotels etc.).'],
  ['Sondersatz 2.5 %', 'MWST-Satz für Lebensmittel, Zeitungen, Bücher, Medikamente.'],
  ['Steuerbefreit', 'Umsätze, die nicht der MWST unterliegen, aber dennoch zum Vorsteuerabzug berechtigen (z. B. Exporte).'],
  ['Ausgenommen', 'Umsätze, die gesetzlich von der MWST ausgenommen sind und NICHT zum Vorsteuerabzug berechtigen (z. B. Bildung, Versicherungen, Arztleistungen).'],
  ['MWST-Abrechnung', 'Quartalsweise Abrechnung der geschuldeten MWST (Umsatzsteuer minus Vorsteuer) gegenüber der ESTV.'],
  ['ESTV', 'Eidgenössische Steuerverwaltung — Behörde, der die MWST abgeführt wird.'],
  ['Forderungsverlust mit MWST', 'Bei definitiv uneinbringlichen Forderungen kann die bereits abgerechnete Umsatzsteuer anteilsmässig zurückgefordert werden.'],
])

await addPoints(ch, [
  'Nettomethode: Aufwände/Erträge ohne MWST; Steuer separat auf Abrechnungskonto MWST.',
  'Vorsteuer (Einkauf) = Soll-Buchung auf Abrechnungskonto MWST.',
  'Umsatzsteuer (Verkauf) = Haben-Buchung auf Abrechnungskonto MWST.',
  'Skonto auf Einkauf: aufteilen in Netto-Anteil (Warenaufwand) + MWST-Anteil (Vorsteuerkorrektur).',
  'Rabatt auf Verkauf: Basis für MWST-Berechnung ist Nettobetrag nach Rabatt.',
  'MWST-Abrechnung: Saldo Abrechnungskonto → Zahlung oder Rückforderung; Konto wird auf Null gestellt.',
  'Steuerbefreit (Export) ≠ ausgenommen (Bildung/Versicherung): nur steuerbefreit berechtigt zum Vorsteuerabzug.',
  'Forderungsverlust: Debitoren-Bruttobetrag aufteilen in Verlust (Netto) + MWST-Korrektur auf Abrechnungskonto.',
  'Konkursdividende: nur der ausgefallene Anteil wird als Verlust + MWST-Korrektur gebucht.',
])

await addQuiz(ch, [
  {
    q: 'Was ist der Hauptunterschied zwischen steuerbefreiten und ausgenommenen Umsätzen?',
    opts: [
      ['Steuerbefreite Umsätze berechtigen zum Vorsteuerabzug, ausgenommene nicht', true],
      ['Ausgenommene Umsätze unterliegen dem Sondersatz 2.5 %, steuerbefreite dem Normalsatz', false],
      ['Beide berechtigen gleichermassen zum Vorsteuerabzug', false],
      ['Steuerbefreite Umsätze gibt es nur bei Importen', false],
    ],
    exp: 'Steuerbefreit = kein MWST-Ausweis, aber Vorsteuerabzug erlaubt (z. B. Export). Ausgenommen = kein MWST-Ausweis UND kein Vorsteuerabzug (z. B. Bildung, Versicherungen).',
    diff: 'medium',
  },
  {
    q: 'Wie lautet die korrekte Buchung für eine Eingangsrechnung Warenlieferung CHF 10 770 brutto (CHF 10 000 netto + 7.7 % MWST)?',
    opts: [
      ['Warenaufwand 10 000 + Abrechnungskonto MWST 770 / Kreditoren 10 770', true],
      ['Warenaufwand 10 770 / Kreditoren 10 770', false],
      ['Warenaufwand 10 000 / Kreditoren 10 000 (MWST separat ignorieren)', false],
      ['Abrechnungskonto MWST 10 770 / Kreditoren 10 770', false],
    ],
    exp: 'Nettomethode: Warenaufwand = Nettobetrag, Vorsteuer auf Abrechnungskonto MWST (Soll), Kreditoren = Bruttobetrag.',
    diff: 'medium',
  },
  {
    q: 'Wie wird Skonto von 2 % auf die obige Eingangsrechnung (CHF 10 770 brutto) beim Zahlen korrekt verbucht?',
    opts: [
      ['Kreditoren 10 770 / Bank 10 554.60 + Warenaufwand 200 + Abrechnungskonto MWST 15.40', true],
      ['Kreditoren 10 770 / Bank 10 554.60 + Warenaufwand 215.40', false],
      ['Kreditoren 10 770 / Bank 10 554.60 + Finanzertrag 215.40', false],
      ['Kreditoren 10 770 / Bank 10 770 (Skonto wird ignoriert)', false],
    ],
    exp: 'Skonto CHF 215.40 aufteilen: Netto 200.00 (Warenaufwand) + MWST-Anteil 15.40 (Vorsteuerkorrektur auf Abrechnungskonto). Bank = 10 770 - 215.40 = 10 554.60.',
    diff: 'hard',
  },
  {
    q: 'Was zeigt das Abrechnungskonto MWST am Quartalsende, wenn die Umsatzsteuer CHF 4 200 und die Vorsteuer CHF 2 800 beträgt?',
    opts: [
      ['Soll-Saldo CHF 1 400 — es sind CHF 1 400 an die ESTV zu zahlen', false],
      ['Haben-Saldo CHF 1 400 — es sind CHF 1 400 an die ESTV zu zahlen', true],
      ['Soll-Saldo CHF 7 000 — der gesamte Steuerertrag', false],
      ['Haben-Saldo CHF 2 800 — Vorsteuerüberhang', false],
    ],
    exp: 'Umsatzsteuer (Haben) CHF 4 200 minus Vorsteuer (Soll) CHF 2 800 = Haben-Saldo CHF 1 400. Dieser Betrag wird an die ESTV überwiesen: Abrechnungskonto MWST 1 400 / Bank 1 400.',
    diff: 'medium',
  },
  {
    q: 'Ein Debitor mit offenem Bruttobetrag CHF 12 924 (Netto CHF 12 000 + MWST 7.7 % CHF 924) geht in Konkurs; Dividende 10 %. Wie hoch ist der Forderungsverlust (netto)?',
    opts: [
      ['CHF 10 800 (Nettoverlust = 90 % von CHF 12 000)', true],
      ['CHF 11 631.60 (Bruttoverlust = 90 % von CHF 12 924)', false],
      ['CHF 12 000 (gesamter Nettobetrag)', false],
      ['CHF 12 924 (gesamter Bruttobetrag)', false],
    ],
    exp: 'Bezahlt werden 10 % von CHF 12 924 = CHF 1 292.40. Ausgefallener Bruttobetrag = CHF 11 631.60. Davon: Verlust (Netto) CHF 10 800 + MWST-Korrektur CHF 831.60.',
    diff: 'hard',
  },
  {
    q: 'Welcher MWST-Satz gilt für Hotelübernachtungen in der Schweiz?',
    opts: [
      ['3.7 %', true],
      ['7.7 %', false],
      ['2.5 %', false],
      ['0 % (steuerbefreit)', false],
    ],
    exp: 'Beherbergungsleistungen (Hotels, Pensionen) werden mit dem Sondersatz von 3.7 % besteuert.',
    diff: 'easy',
  },
  {
    q: 'Warum darf beim Forderungsverlust die MWST korrigiert werden?',
    opts: [
      ['Weil die Umsatzsteuer auf einem Umsatz basiert, der nun effektiv nicht kassiert wurde', true],
      ['Weil Forderungsverluste grundsätzlich steuerfrei sind', false],
      ['Weil die MWST beim Verkauf noch gar nicht abgerechnet wurde', false],
      ['Weil der Konkursrichter die MWST erlässt', false],
    ],
    exp: 'Die Umsatzsteuer wurde beim Verkauf bereits an die ESTV abgerechnet. Da der Betrag nun uneinbringlich ist, entfällt die Grundlage — die Steuer wird proportional zum Verlust korrigiert.',
    diff: 'medium',
  },
])

await client.end()
console.log('✅ MWST Vertiefung Band 3 komplett eingefügt!')
