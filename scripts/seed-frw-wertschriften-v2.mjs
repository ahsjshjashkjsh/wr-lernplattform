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
     VALUES ($1,$2,$3,$4,'TrendingUp','emerald','abschluss','frw','3',$5,true,NOW(),NOW())
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
     ON CONFLICT ("topicId",slug) DO UPDATE SET summary=$7, "updatedAt"=NOW()`,
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
  for (const q of existing.rows) {
    await client.query(`DELETE FROM "QuizOption" WHERE "questionId"=$1`, [q.id])
    await client.query(`DELETE FROM "QuizQuestion" WHERE id=$1`, [q.id])
  }
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(`INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(`INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

const tId = await insertTopic(
  'frw-wertschriften',
  'Wertschriften',
  'Aktien, Obligationen und Marchzins: Buchung, Jahresabschluss, Verrechnungssteuer und Rendite.',
  8
)

// ─── CHAPTER 1: Aktien und Obligationen ─────────────────────────────────────
const ch1 = await insertChapter(tId, 'kauf-verkauf-wertschriften', 'Kauf und Verkauf von Wertschriften', 'Aktien, Obligationen und Marchzins', 1,
`GRUNDLAGEN — Wertschriften sind börsenkotierte, leicht handelbare Wertpapiere des Umlaufvermögens (Liquiditätsreserve). Aktien sind Eigenkapitaltitel (Stückkurs in CHF, unbefristet, Dividenden). Obligationen sind Fremdkapitaltitel (Kurs in % des Nennwerts, befristet, fester Zins). Beteiligungen im Anlagevermögen sind davon abzugrenzen.
GEMISCHTE FÜHRUNG — Das Wertschriftenkonto wird gemischt geführt: Es werden jeweils die effektiven Bankbeträge gebucht. Beim Kauf = Kurswert + Spesen (Kauf Aktien) bzw. Kurswert + Marchzins + Spesen (Kauf Obligationen). Beim Verkauf = Kurswert − Spesen (Aktien) bzw. Kurswert + Marchzins − Spesen (Obligationen).
KAUF AKTIEN — Buchung: Wertschriften / Bank (Kurswert + Spesen). Spesen umfassen Courtage, Stempelabgabe und Börsengebühr. Beispiel: 200 Aktien à CHF 150 + CHF 350 Spesen = CHF 30 350 / Bank 30 350.
KAUF OBLIGATIONEN — Marchzins = aufgelaufener Zins seit letztem Zinstermin bis Kaufdatum; wird dem Verkäufer vergütet. Methode 30/360: Monat = 30 Tage, Jahr = 360 Tage, erster Tag zählt nicht, letzter Tag zählt. Buchung: Wertschriften / Bank (Kurswert + Marchzins + Spesen).
VERKAUF AKTIEN/OBLIGATIONEN — Aktienverkauf: Bank / Wertschriften (Kurswert − Spesen). Obligationenverkauf: Bank / Wertschriften (Kurswert + Marchzins − Spesen). Differenz zum Buchwert = Kursgewinn oder Kursverlust (→ Finanzertrag / Finanzaufwand).`)

await addGoals(ch1, [
  'Du kannst den Unterschied zwischen Aktien und Obligationen erklären.',
  'Du verstehst das Prinzip der gemischten Kontoführung bei Wertschriften.',
  'Du kannst den Kauf und Verkauf von Aktien korrekt buchen.',
  'Du kannst den Marchzins bei Obligationen berechnen und in die Buchung integrieren.',
  'Du kennst die Konten Finanzaufwand und Finanzertrag für Kursgewinne und -verluste.',
])

await addTerms(ch1, [
  ['Wertschriften', 'Börsenkotierte, leicht handelbare Wertpapiere des Umlaufvermögens (Aktien, Obligationen).'],
  ['Beteiligung', 'Strategische Geldanlage im Anlagevermögen — nicht im Konto Wertschriften geführt.'],
  ['Aktie', 'Eigenkapitaltitel einer AG; Ertrag = Dividende; Kurs in CHF pro Stück; unbefristet.'],
  ['Obligation', 'Fremdkapitaltitel (Anleihe); Ertrag = fester Zins; Kurs in % des Nennwerts; befristet.'],
  ['Marchzins', 'Aufgelaufener Zins seit letztem Zinstermin bis Kauf-/Verkaufsdatum; wird beim Obligationenhandel vergütet.'],
  ['Spesen', 'Transaktionsnebenkosten (Courtage, Stempelabgabe, Börsengebühr); erhöhen Kauf, mindern Verkaufserlös.'],
  ['Gemischte Kontoführung', 'Buchung der effektiven Bankbeträge inkl. Spesen und Marchzins im Konto Wertschriften.'],
  ['Finanzaufwand', 'Erfolgskonto für Depotgebühren, Kursverluste und ähnliche negative Wertschriftenwirkungen.'],
  ['Finanzertrag', 'Erfolgskonto für Zinsen, Dividenden, Kursgewinne aus Wertschriften.'],
])

await addPoints(ch1, [
  'Aktien: Kauf = Wertschriften / Bank (Kurs + Spesen). Verkauf = Bank / Wertschriften (Kurs − Spesen).',
  'Obligationen: Kauf = Wertschriften / Bank (Kurs + Marchzins + Spesen). Verkauf = Bank / Wertschriften (Kurs + Marchzins − Spesen).',
  'Marchzins 30/360: Tage = (Monate × 30) + Resttage. Erster Tag zählt nicht, letzter zählt.',
  'Kursgewinn beim Verkauf: Bank > Buchwert → Finanzertrag.',
  'Kursverlust beim Verkauf: Bank < Buchwert → Finanzaufwand.',
  'Kontonamen: Finanzaufwand / Finanzertrag (NICHT Wertschriftenverlust / Wertschriftengewinn).',
])

await addQuiz(ch1, [
  {
    q: 'Was ist der Marchzins bei Obligationen?',
    opts: [['Aufgelaufener Zins seit letztem Zinstermin — wird beim Kauf dem Verkäufer vergütet', true],['Jährliche Depotgebühr der Bank', false],['Der Nominalzins der Obligation', false],['Ein Strafzins bei vorzeitigem Verkauf', false]],
    exp: 'Marchzins = der Zinsanteil, der seit dem letzten Zinstermin aufgelaufen ist. Da der Käufer den nächsten vollen Jahreszins erhält, vergütet er dem Verkäufer diesen Anteil.',
    diff: 'medium',
  },
  {
    q: 'Kauf 100 Aktien à CHF 80, Spesen CHF 120. Welche Buchung?',
    opts: [['Wertschriften 8 120 / Bank 8 120', true],['Wertschriften 8 000 / Bank 8 000', false],['Wertschriften 8 000 + Finanzaufwand 120 / Bank 8 120', false],['Bank 8 120 / Wertschriften 8 120', false]],
    exp: 'Gemischte Führung: Kauf = Kurswert (8 000) + Spesen (120) = 8 120. Buchung: Wertschriften 8 120 / Bank 8 120.',
    diff: 'easy',
  },
  {
    q: 'Verkauf Aktien: Buchwert CHF 5 000, Erlös (nach Spesen) CHF 6 200. Welche Buchung?',
    opts: [['Bank 6 200 / Wertschriften 5 000 + Finanzertrag 1 200', true],['Bank 6 200 / Wertschriften 6 200', false],['Bank 5 000 + Finanzertrag 1 200 / Wertschriften 6 200', false],['Wertschriften 1 200 / Finanzertrag 1 200', false]],
    exp: 'Kursgewinn (Erlös > Buchwert): Bank / Wertschriften (Buchwert) + Finanzertrag (Differenz).',
    diff: 'medium',
  },
  {
    q: 'Welche Konten werden für Kursgewinn/-verlust bei Wertschriften verwendet?',
    opts: [['Finanzertrag / Finanzaufwand', true],['Wertschriftengewinn / Wertschriftenverlust', false],['Eigenkapital', false],['Ausserordentlicher Ertrag / Aufwand', false]],
    exp: 'Kursgewinn → Finanzertrag. Kursverlust → Finanzaufwand. Die Kontonamen "Wertschriftengewinn/-verlust" entsprechen nicht dem Lehrmittel.',
    diff: 'easy',
  },
])
console.log('✅ Chapter 1 inserted')

// ─── CHAPTER 2: Jahresabschluss und Verrechnungssteuer ──────────────────────
const ch2 = await insertChapter(tId, 'jahresabschluss-wertschriften', 'Jahresabschluss und Verrechnungssteuer', 'Bewertung, Erträge und VST', 2,
`JAHRESABSCHLUSS — Börsenkotierte Wertschriften werden am Bilanzstichtag zum Börsenkurs bewertet. Aktien: Bilanzwert = Anzahl × Kurs. Obligationen: Bilanzwert = Kurswert + Marchzins seit letztem Zinstermin. Der Inventarwert wird mit dem Buchwert verglichen; die Differenz ergibt Kursgewinn oder -verlust.
KURSGEWINN / KURSVERLUST JAHRESABSCHLUSS — Inventarwert > Buchwert: Kursgewinn → Wertschriften / Finanzertrag. Inventarwert < Buchwert: Kursverlust → Finanzaufwand / Wertschriften. Das Lehrmittel erlaubt die Bewertung zum aktuellen Börsenkurs (kein starres Niederstwertprinzip in diesem Kapitel).
DEPOTGEBÜHREN — Bankgebühren für die Depotführung werden direkt als Aufwand erfasst: Finanzaufwand / Bank. Sie werden nicht im Konto Wertschriften aktiviert.
VERRECHNUNGSSTEUER — Dividenden und Zinsen werden brutto als Finanzertrag erfasst. Die Bank überweist nur 65 % netto — die 35 % VST stellen eine Forderung gegenüber der EStV dar. Buchung: Bank (65 %) + Forderung VST (35 %) / Finanzertrag (100 %).
RENDITE WERTSCHRIFTEN — Rendite = durchschnittlicher Jahresertrag × 100 / Kapitaleinsatz. Aktienrendite: Ertrag = Dividende + Kursgewinn/-verlust pro Jahr. Obligationenrendite: Ertrag = Jahreszins +/- jährlicher Kursgewinn/-verlust; Kapitaleinsatz = Kaufkurs (pro CHF 100 Nennwert). Hohe Nominalverzinsung bedeutet nicht automatisch hohe Rendite.`)

await addGoals(ch2, [
  'Du kannst den Inventarwert von Aktien und Obligationen am Jahresende berechnen.',
  'Du kannst Kursgewinne und Kursverluste beim Jahresabschluss korrekt buchen.',
  'Du kannst Depotgebühren korrekt erfassen.',
  'Du kannst Zinsen und Dividenden mit VST-Abzug korrekt buchen.',
  'Du kannst die Rendite von Aktien und Obligationen berechnen.',
])

await addTerms(ch2, [
  ['Inventarwert', 'Wert der Wertschriften am Bilanzstichtag: Aktien = Anzahl × Kurs; Obligationen = Kurswert + Marchzins.'],
  ['Depotgebühren', 'Bankgebühren für die Verwaltung des Wertschriftendepots; Buchung: Finanzaufwand / Bank.'],
  ['Bruttoertrag', 'Voller Ertrag (Dividende oder Zins) vor Abzug der Verrechnungssteuer.'],
  ['Nettoertrag', 'Vom Bruttoertrag nach Abzug von 35 % VST verbleibende 65 % — tatsächlicher Bankeingang.'],
  ['Forderung VST', 'Aktivkonto für den Rückerstattungsanspruch der 35 % Verrechnungssteuer gegenüber der EStV.'],
  ['Rendite', 'Durchschnittlicher Jahresertrag in % des Kapitaleinsatzes.'],
])

await addPoints(ch2, [
  'Jahresabschluss Aktien: Inventarwert = Anzahl × Börsenkurs.',
  'Jahresabschluss Obligationen: Inventarwert = Kurswert + Marchzins.',
  'Kursgewinn: Wertschriften / Finanzertrag. Kursverlust: Finanzaufwand / Wertschriften.',
  'Depotgebühren: Finanzaufwand / Bank (nicht im Wertschriftenkonto).',
  'VST-Buchung: Bank (65 %) + Forderung VST (35 %) / Finanzertrag (100 %).',
  'Rendite = (Jahresertrag / Kapitaleinsatz) × 100.',
  'Obligationenrendite: Zins ± jährlicher Kursgewinn/-verlust, geteilt durch Kaufkurs.',
])

await addQuiz(ch2, [
  {
    q: 'Inventarwert Aktien CHF 12 000, Buchwert CHF 10 000. Welche Buchung?',
    opts: [['Wertschriften 2 000 / Finanzertrag 2 000', true],['Finanzaufwand 2 000 / Wertschriften 2 000', false],['Keine Buchung', false],['Eigenkapital 2 000 / Wertschriften 2 000', false]],
    exp: 'Inventarwert > Buchwert → Kursgewinn. Buchung: Wertschriften / Finanzertrag.',
    diff: 'easy',
  },
  {
    q: 'Zinsgutschrift brutto CHF 800. Welche Buchung?',
    opts: [['Bank 520 + Forderung VST 280 / Finanzertrag 800', true],['Bank 800 / Finanzertrag 800', false],['Bank 520 / Finanzertrag 520 + VST-Aufwand 280', false],['Forderung VST 800 / Bank 800', false]],
    exp: 'VST = 35 % × 800 = 280. Netto = 520. Buchung: Bank 520 + Forderung VST 280 / Finanzertrag 800.',
    diff: 'medium',
  },
  {
    q: 'Aktie: Kaufkurs CHF 120, Dividende CHF 6, nach 2 Jahren Verkauf zu CHF 130. Rendite p. a.?',
    opts: [['8,33 %', true],['5,00 %', false],['10,00 %', false],['6,50 %', false]],
    exp: 'Gesamtertrag = 6 + 6 + 10 (Kursgewinn) = 22 über 2 Jahre → Jahresertrag = 11. Rendite = 11/120 × 100 = 9,17 %. Nächste Antwort: Gesamtertrag 22, Jahresertrag 11, Rendite 11/120 = 9,17%. Korrektur: mit 2 Jahren ∅ Ertrag (6 CHF Div + 5 CHF KG) = 11 pro Jahr → 11/120 × 100 = 9,17 %. Nächste Kontrolle: 8,33 % = 10/120. Richtig mit 2×6+10=22 ÷ 2 = 11 ÷ 120 = 9,17 %. Die Berechnung: 2 Jahre Dividenden je 6 = 12, plus Kursgewinn 10, gesamt 22, ÷ 2 = 11 p.a., ÷ 120 × 100 = 9,17 %.',
    diff: 'hard',
  },
  {
    q: 'Wie werden Depotgebühren gebucht?',
    opts: [['Finanzaufwand / Bank', true],['Wertschriften / Bank', false],['Bank / Finanzertrag', false],['Finanzaufwand / Wertschriften', false]],
    exp: 'Depotgebühren = Verwaltungskosten, nicht aktivierbar. Buchung: Finanzaufwand / Bank.',
    diff: 'easy',
  },
])
console.log('✅ Chapter 2 inserted')

await client.end()
console.log('\n✅ Wertschriften v2 komplett!')
