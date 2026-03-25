import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function insertTopic(slug, title, description, examType, order) {
  const topicId = id()
  await client.query(`INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt") VALUES ($1,$2,$3,$4,'Globe','blue',$5,'frw',$6,true,NOW(),NOW()) ON CONFLICT (slug) DO NOTHING`,
    [topicId, slug, title, description, examType, order])
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

// ══════════════════════════════════════════════════
// TOPIC: FRW Band 2
// ══════════════════════════════════════════════════
const tId = await insertTopic(
  'frw-band2',
  'FRW Band 2',
  'Vertieftes Finanzielles Rechnungswesen: Fremde Währung, Forderungen, Abschreibungen, Abgrenzungen, Löhne, Einzelunternehmung, AG, Bewertung und Bilanzanalyse.',
  'abschluss',
  10
)

// ══════════════════════════════════════════════════
// KAPITEL 2: Fremde Währung
// ══════════════════════════════════════════════════
const ch2 = await insertChapter(tId,
  'fremde-waehrung',
  'Fremde Währung',
  'Kursgewinne, Kursverluste und Neubewertung per Jahresende',
  1,
  `Wenn ein Schweizer Unternehmen Geschäfte mit dem Ausland macht, entstehen Fremdwährungspositionen. Da die Buchhaltung in CHF geführt wird, müssen alle Beträge umgerechnet werden.

KURSE:
• Geldkurs (Ankaufskurs): Bank kauft Devisen vom Kunden — für den Kunden ungünstiger
• Briefkurs (Verkaufskurs): Bank verkauft Devisen an Kunden — für den Kunden teurer
• Tageskurs: Für laufende Buchungen verwendet

KURSGEWINNE UND -VERLUSTE entstehen, wenn zwischen Entstehung und Begleichung einer Forderung/Verbindlichkeit der Kurs sich verändert.

BUCHUNG IMPORT (Kreditoren in Fremdwährung):
• Entstehung: Warenaufwand / Kreditoren (zum Tageskurs)
• Zahlung bei gestiegenem Kurs (CHF schwächer): Kreditoren / Bank + Kursverlust
• Zahlung bei gesunkenem Kurs (CHF stärker): Kreditoren + Kursgewinn / Bank

BUCHUNG EXPORT (Debitoren in Fremdwährung):
• Entstehung: Debitoren / Warenertrag (zum Tageskurs)
• Eingang bei gestiegenem Kurs: Bank / Debitoren + Kursgewinn
• Eingang bei gesunkenem Kurs: Bank + Kursverlust / Debitoren

NEUBEWERTUNG PER 31.12.:
Alle offenen Fremdwährungspositionen werden zum Stichtagskurs neu bewertet.
• Forderung gesunken → Kursverlust / Debitoren (IMMER buchen — Vorsichtsprinzip)
• Verbindlichkeit gestiegen → Kursverlust / Kreditoren (IMMER buchen)
• Kursgewinne: nur buchen wenn sicher realisiert

Konten: Kursgewinn (Ertrag) / Kursverlust (Aufwand)`
)

await addGoals(ch2, [
  'Du kannst Fremdwährungsgeschäfte (Import und Export) korrekt buchen.',
  'Du kennst den Unterschied zwischen Geldkurs und Briefkurs.',
  'Du kannst Kursgewinne und Kursverluste erkennen und verbuchen.',
  'Du kannst Fremdwährungspositionen per 31.12. neu bewerten.',
  'Du verstehst das Vorsichtsprinzip bei Kursgewinnen und -verlusten.',
])

await addTerms(ch2, [
  ['Geldkurs (Ankaufskurs)', 'Kurs, zu dem die Bank Devisen vom Kunden kauft. Für den Kunden ungünstiger als der Briefkurs. Auch "Bid" genannt.'],
  ['Briefkurs (Verkaufskurs)', 'Kurs, zu dem die Bank Devisen an den Kunden verkauft. Für den Kunden teurer. Auch "Ask" genannt.'],
  ['Tageskurs', 'Aktueller Wechselkurs, der für die Umrechnung bei laufenden Buchungen verwendet wird.'],
  ['Stichtagskurs', 'Wechselkurs am 31. Dezember — wird für die Neubewertung offener Fremdwährungspositionen verwendet.'],
  ['Kursverlust', 'Aufwand, der entsteht wenn der CHF schwächer wird (bei Verbindlichkeiten) oder stärker (bei Forderungen). Konto: Kursverlust (Soll).'],
  ['Kursgewinn', 'Ertrag, der entsteht wenn der CHF stärker wird (bei Verbindlichkeiten) oder schwächer (bei Forderungen). Konto: Kursgewinn (Haben).'],
  ['Vorsichtsprinzip', 'Kursverluste werden sofort gebucht. Kursgewinne nur wenn sie sicher realisiert sind.'],
  ['Devisen', 'Ausländische Währungen (z.B. EUR, USD, GBP) — müssen für die CHF-Buchhaltung umgerechnet werden.'],
])

await addPoints(ch2, [
  'Import (Kreditoren in Fremdwährung): Entstehung zum Tageskurs buchen. Bei Zahlung: Differenz = Kursgewinn oder Kursverlust.',
  'Export (Debitoren in Fremdwährung): Entstehung zum Tageskurs buchen. Bei Eingang: Differenz = Kursgewinn oder Kursverlust.',
  'Kursverlust (Aufwand) = CHF-Betrag bei Zahlung ist grösser als bei Buchung (bei Verbindlichkeiten) oder kleiner (bei Forderungen).',
  'Kursgewinn (Ertrag) = CHF-Betrag bei Zahlung ist kleiner als bei Buchung (bei Verbindlichkeiten) oder grösser (bei Forderungen).',
  'Neubewertung 31.12.: Alle offenen Fremdwährungspositionen zum Stichtagskurs bewerten.',
  'Vorsichtsprinzip: Kursverluste IMMER buchen. Kursgewinne nur wenn sicher realisiert.',
  'Rückbuchung am 1.1.: Alle Neubewertungsbuchungen werden storniert (Gegenbuchung).',
  'Kursgewinn-Konto = Ertrag (Haben). Kursverlust-Konto = Aufwand (Soll).',
])

await addExamples(ch2, [
  'IMPORT — Kursverlust: Kauf 10 000 EUR, Kurs 1.10 → Kreditoren CHF 11 000. Zahlung bei Kurs 1.15 → Bank CHF 11 500. Buchung: Kreditoren 11 000 + Kursverlust 500 / Bank 11 500.',
  'IMPORT — Kursgewinn: Kauf 10 000 EUR, Kurs 1.10 → Kreditoren CHF 11 000. Zahlung bei Kurs 1.05 → Bank CHF 10 500. Buchung: Kreditoren 11 000 / Bank 10 500 + Kursgewinn 500.',
  'EXPORT — Kursverlust: Verkauf 5 000 USD, Kurs 0.92 → Debitoren CHF 4 600. Eingang bei Kurs 0.88 → Bank CHF 4 400. Buchung: Bank 4 400 + Kursverlust 200 / Debitoren 4 600.',
  'EXPORT — Kursgewinn: Verkauf 5 000 USD, Kurs 0.92 → Debitoren CHF 4 600. Eingang bei Kurs 0.96 → Bank CHF 4 800. Buchung: Bank 4 800 / Debitoren 4 600 + Kursgewinn 200.',
  'NEUBEWERTUNG 31.12.: Offene Verbindlichkeit 8 000 EUR, Buchkurs 1.10 = CHF 8 800. Stichtagskurs 1.14 = CHF 9 120. Differenz = 320 Kursverlust. Buchung: Kursverlust 320 / Kreditoren 320.',
])

await addQuiz(ch2, [
  {
    q: 'Ein Unternehmen kauft Waren für 20 000 EUR auf Rechnung. Kurs bei Buchung: 1.12. Kurs bei Zahlung: 1.08. Was entsteht?',
    opts: [['Kursgewinn von CHF 800', true], ['Kursverlust von CHF 800', false], ['Kursgewinn von CHF 400', false], ['Kein Kurseffekt', false]],
    exp: 'Buchung: 20 000 × 1.12 = CHF 22 400. Zahlung: 20 000 × 1.08 = CHF 21 600. CHF-Aufwand gesunken → Kursgewinn CHF 800.',
    diff: 'medium'
  },
  {
    q: 'Wie lautet der Buchungssatz bei einem Kursverlust auf einer Verbindlichkeit (Kreditoren)?',
    opts: [['Kursverlust / Kreditoren', true], ['Kreditoren / Kursverlust', false], ['Kursgewinn / Kreditoren', false], ['Kreditoren / Kursgewinn', false]],
    exp: 'Kursverlust = Aufwand → Soll. Kreditoren steigen → Haben. Also: Kursverlust / Kreditoren.',
    diff: 'easy'
  },
  {
    q: 'Was gilt beim Vorsichtsprinzip für Kursgewinne per 31.12.?',
    opts: [['Kursgewinne werden nur gebucht wenn sicher realisiert', true], ['Kursgewinne werden immer sofort gebucht', false], ['Kursgewinne werden nie gebucht', false], ['Kursgewinne werden erst im Folgejahr gebucht', false]],
    exp: 'Das Vorsichtsprinzip schreibt vor: Verluste sofort, Gewinne nur wenn sicher. Kursgewinne auf noch offenen Positionen sind noch nicht realisiert.',
    diff: 'medium'
  },
  {
    q: 'Ein Exporteur hat eine offene Forderung in EUR. Der EUR-Kurs sinkt per 31.12. Was wird gebucht?',
    opts: [['Kursverlust / Debitoren', true], ['Debitoren / Kursgewinn', false], ['Kursgewinn / Debitoren', false], ['Keine Buchung nötig', false]],
    exp: 'Forderung in EUR ist weniger wert (Kurs gesunken) → Kursverlust. Buchung: Kursverlust / Debitoren.',
    diff: 'medium'
  },
  {
    q: 'Was ist der Briefkurs?',
    opts: [['Der Kurs, zu dem die Bank Devisen an den Kunden verkauft', true], ['Der Kurs, zu dem die Bank Devisen vom Kunden kauft', false], ['Der Kurs am Jahresende', false], ['Der Durchschnittskurs über das Jahr', false]],
    exp: 'Briefkurs = Verkaufskurs der Bank. Der Kunde kauft Devisen zu diesem (teureren) Kurs.',
    diff: 'easy'
  },
  {
    q: 'Was passiert am 1. Januar mit den Neubewertungsbuchungen vom 31.12.?',
    opts: [['Sie werden storniert (Gegenbuchung)', true], ['Sie bleiben bestehen', false], ['Sie werden verdoppelt', false], ['Sie werden auf ein Rückstellungskonto übertragen', false]],
    exp: 'Am 1.1. werden alle Neubewertungsbuchungen durch Gegenbuchungen rückgängig gemacht, damit die ursprünglichen Kurse wieder gelten.',
    diff: 'medium'
  },
  {
    q: 'Buchung beim Kauf von Waren für EUR 5 000 auf Rechnung, Kurs 1.10:',
    opts: [['Warenaufwand 5 500 / Kreditoren 5 500', true], ['Kreditoren 5 000 / Warenaufwand 5 000', false], ['Warenaufwand 5 000 / Bank 5 500', false], ['Debitoren 5 500 / Warenertrag 5 500', false]],
    exp: 'Import auf Rechnung: 5 000 EUR × 1.10 = CHF 5 500. Buchung: Warenaufwand (Aufwand) / Kreditoren (Schuld entsteht).',
    diff: 'easy'
  },
  {
    q: 'Kursgewinn ist buchhalterisch ein...',
    opts: [['Ertrag (Habenseite)', true], ['Aufwand (Sollseite)', false], ['Aktivum', false], ['Passivum', false]],
    exp: 'Kursgewinn = positiver Effekt durch günstige Kursentwicklung → Ertrag, erscheint auf der Habenseite.',
    diff: 'easy'
  },
])

console.log('✅ Kapitel 2: Fremde Währung erfolgreich erstellt.')
await client.end()
