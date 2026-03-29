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
     VALUES ($1,$2,$3,$4,'Home','emerald','abschluss','frw','3',$5,true,NOW(),NOW())
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
  'frw-immobilien',
  'Immobilien',
  'Liegenschaften im Rechnungswesen: laufende Verbuchung, Kauf, Verkauf und Renditebewertung.',
  7
)

// ─── CHAPTER 1: Laufende Verbuchung und Kauf ───────────────────────────────
const ch1 = await insertChapter(tId, 'kauf-bewertung-liegenschaften', 'Kauf und laufende Verbuchung', 'Liegenschaftskonten, Mietwertverrechnung und Kauf', 1,
`KONTENSYSTEM — Vier Kernkonten: Immobilien (Aktivkonto, Anlagevermögen), Hypotheken (Passivkonto, Fremdkapital), Liegenschaftsaufwand (alle Kosten: Unterhalt, Versicherung, Heizung, Hypothekarzinsen, Abschreibungen) und Liegenschaftsertrag (Mietzinseinnahmen, interne Mietwertverrechnungen). Liegenschaftsgewinn/-verlust erscheint in der letzten Stufe der Erfolgsrechnung als Nebenerfolg.
TRENNUNG BETRIEBS- UND LIEGENSCHAFTSERFOLG — Vermietung an Dritte ist nicht der eigentliche Unternehmenszweck. Alle immobilienbezogenen Erträge und Aufwände laufen über Liegenschaftsertrag/-aufwand, um den Betriebserfolg nicht zu verfälschen. Die mehrstufige Erfolgsrechnung zeigt: Bruttogewinn → Betriebsgewinn → Unternehmensgewinn (nach Liegenschaftserfolg).
MIETWERTVERRECHNUNG — Nutzt das Unternehmen eigene Räume, wird der Mietwert intern verrechnet: Raumaufwand / Liegenschaftsertrag. Privatwohnung des Inhabers: Privat / Liegenschaftsertrag. Echte Mietzinseinnahmen: Bank / Liegenschaftsertrag.
WERTERHALTEND vs. WERTVERMEHREND — Werterhaltende Massnahmen (Reparaturen, Malerarbeiten, Ersatz): Aufwand → Liegenschaftsaufwand / Bank. Wertvermehrende Massnahmen (Erweiterungen, Ausbau): Aktivierung → Immobilien / Bank.
KAUF EINER LIEGENSCHAFT — Kaufpreis + Handänderungskosten (Käuferanteil) auf Immobilien. Übernommene Hypothek auf Hypotheken. Heizölvorrat und Mietzinsverrechnung über Abrechnungskonto Verbindlichkeiten L+L. Restbetrag per Bank. Beispiel: Kaufpreis CHF 1 180 000 + Nebenkosten CHF 5 800, Hypothek CHF 900 000, Restzahlung CHF 282 300 (nach Verrechnung von Heizöl und Miete).`)

await addGoals(ch1, [
  'Du kennst die vier Kernkonten der Liegenschaftsbuchhaltung und ihre Funktion.',
  'Du verstehst, warum Liegenschaftserfolg und Betriebserfolg getrennt ausgewiesen werden.',
  'Du kannst echte Mietzinseinnahmen und interne Mietwertverrechnungen korrekt buchen.',
  'Du kannst werterhaltende und wertvermehrende Massnahmen buchhalterisch unterscheiden.',
  'Du kannst den Kauf einer Liegenschaft mit Hypothek, Nebenkosten und Abrechnungskonto vollständig buchen.',
])

await addTerms(ch1, [
  ['Immobilien', 'Aktivkonto für Liegenschaften im materiellen Anlagevermögen.'],
  ['Hypotheken', 'Passivkonto für langfristige Darlehen, die durch das Grundstück gesichert sind.'],
  ['Liegenschaftsaufwand', 'Erfolgskonto für alle immobilienbezogenen Kosten: Unterhalt, Versicherung, Hypothekarzinsen, Abschreibungen.'],
  ['Liegenschaftsertrag', 'Erfolgskonto für alle immobilienbezogenen Erträge: Mietzinseinnahmen, interne Mietwertverrechnungen.'],
  ['Mietwertverrechnung', 'Interne Buchung des fiktiven Mietzinses für selbst genutzte Räume: Raumaufwand / Liegenschaftsertrag.'],
  ['Werterhaltend', 'Sanierungskosten, die den bestehenden Zustand erhalten → Aufwand (Liegenschaftsaufwand).'],
  ['Wertvermehrend', 'Investitionen, die den Wert der Liegenschaft steigern → Aktivierung auf Konto Immobilien.'],
  ['Handänderungskosten', 'Kantonale Steuer und Notariatskosten beim Kauf einer Liegenschaft; gehören zu den Anschaffungskosten.'],
  ['Verbindlichkeiten L+L', 'Abrechnungskonto beim Liegenschaftskauf zur Verrechnung aller gegenseitigen Ansprüche.'],
])

await addPoints(ch1, [
  'Liegenschaftsertrag / -aufwand erscheinen erst in der letzten Stufe der ER (nach Betriebsgewinn).',
  'Werterhaltend = Aufwand (Liegenschaftsaufwand). Wertvermehrend = Aktivierung (Immobilien).',
  'Mietwertverrechnung Geschäftsräume: Raumaufwand / Liegenschaftsertrag.',
  'Kauf Buchungssätze: 1) Immobilien / Verb.L+L (Kaufpreis). 2) Immobilien / Bank (Nebenkosten). 3) Verb.L+L / Hypotheken. 4) Liegenschaftsaufwand / Verb.L+L (Heizöl). 5) Verb.L+L / Liegenschaftsertrag (vorausbez. Miete). 6) Verb.L+L / Bank (Restbetrag).',
  'Hypothekarzinsen = Aufwand → Liegenschaftsaufwand. Amortisation = kein Aufwand → Hypotheken / Bank.',
])

await addQuiz(ch1, [
  {
    q: 'Was versteht man unter Mietwertverrechnung?',
    opts: [['Interne Buchung des fiktiven Mietzinses für selbst genutzte Räume: Raumaufwand / Liegenschaftsertrag', true],['Die Abschreibung der Liegenschaft', false],['Der Mietzins von externen Mietern', false],['Der Hypothekarzins', false]],
    exp: 'Mietwertverrechnung = interne Buchung, damit die Raumnutzung als Betriebsaufwand erscheint und der Liegenschaftsertrag vollständig ausgewiesen wird.',
    diff: 'medium',
  },
  {
    q: 'Eine Fassadenrenovation erhöht den Wert der Liegenschaft. Wie wird sie gebucht?',
    opts: [['Immobilien / Bank (Aktivierung, wertvermehrend)', true],['Liegenschaftsaufwand / Bank (Aufwand, werterhaltend)', false],['Eigenkapital / Bank', false],['Keine Buchung nötig', false]],
    exp: 'Wertvermehrend = Wert steigt → Aktivierung auf Konto Immobilien. Werterhaltend = Erhaltung → Liegenschaftsaufwand.',
    diff: 'medium',
  },
  {
    q: 'Warum wird Liegenschaftserfolg in der mehrstufigen ER getrennt ausgewiesen?',
    opts: [['Weil Vermietung an Dritte nicht zum eigentlichen Unternehmenszweck gehört', true],['Weil es gesetzlich verboten ist, ihn im Betriebsgewinn zu zeigen', false],['Um Steuern zu sparen', false],['Weil Immobilien kein Umlaufvermögen sind', false]],
    exp: 'Liegenschaftserfolg ist ein Nebenerfolg. Er darf den Betriebsgewinn nicht verfälschen — deshalb separate Darstellung als letzte Erfolgsstufe.',
    diff: 'medium',
  },
])
console.log('✅ Chapter 1 inserted')

// ─── CHAPTER 2: Abschreibung und Verkauf ───────────────────────────────────
const ch2 = await insertChapter(tId, 'abschreibung-verkauf-liegenschaften', 'Abschreibung und Verkauf', 'Gebäudeabschreibung und Buchgewinn/-verlust', 2,
`ABSCHREIBUNG GEBÄUDE — Gebäude unterliegen Wertverzehr und werden linear abgeschrieben (typisch 1,5–2 % p.a.). Grundstücke werden nicht abgeschrieben. Direktmethode: Liegenschaftsaufwand / Immobilien. Buchwert = Kaufpreis − Σ Abschreibungen.
VERKAUF EINER LIEGENSCHAFT — Beim Verkauf dient Forderungen L+L als Abrechnungskonto. Der Verkäufer sammelt seinen Anspruch; der Käufer übernimmt Hypothek, Heizölvorrat und bezahlt Restsumme per Bank. Buchgewinn (Verkaufspreis > Buchwert) oder Buchverlust (< Buchwert) wird als ausserordentlicher Ertrag bzw. Aufwand verbucht.
BUCHUNGSLOGIK VERKAUF — 1) Forderungen L+L / Immobilien (Buchwert): Liegenschaft ausbuchen. 2) Falls Buchgewinn: Forderungen L+L / Ausserordentlicher Ertrag. 3) Hypotheken / Forderungen L+L: Käufer übernimmt Hypothek. 4) Liegenschaftsaufwand / Forderungen L+L: Heizöl übernommen. 5) Liegenschaftsertrag / Forderungen L+L: Mietzinsverrechnung. 6) Bank / Forderungen L+L: Restbetrag.
BUCHGEWINN/-VERLUST — Buchgewinn: Verkaufspreis > Buchwert → ausserordentlicher Ertrag. Buchverlust: Verkaufspreis < Buchwert → ausserordentlicher Aufwand. Beispiel: Buchwert CHF 920 000, Verkaufspreis CHF 1 180 000 → Buchgewinn CHF 260 000.`)

await addGoals(ch2, [
  'Du kannst die jährliche Gebäudeabschreibung berechnen und buchen.',
  'Du weisst, warum Grundstücke nicht abgeschrieben werden.',
  'Du kannst den Verkauf einer Liegenschaft mit Abrechnungskonto vollständig buchen.',
  'Du kannst Buchgewinn und Buchverlust berechnen und korrekt kontieren.',
])

await addTerms(ch2, [
  ['Buchwert Liegenschaft', 'Anschaffungskosten minus kumulierte Abschreibungen.'],
  ['Buchgewinn', 'Verkaufspreis > Buchwert → ausserordentlicher Ertrag.'],
  ['Buchverlust', 'Verkaufspreis < Buchwert → ausserordentlicher Aufwand.'],
  ['Forderungen L+L', 'Abrechnungskonto beim Verkauf einer Liegenschaft.'],
  ['Direktmethode Abschreibung', 'Abschreibung direkt vom Aktivkonto: Liegenschaftsaufwand / Immobilien.'],
])

await addPoints(ch2, [
  'Abschreibung Gebäude: Liegenschaftsaufwand / Immobilien (Direktmethode).',
  'Grundstück: kein Abschreibungsbedarf.',
  'Typischer Abschreibungssatz Gebäude: 1,5–2 % p.a. linear.',
  'Buchgewinn = Verkaufspreis − Buchwert (positiv) → ausserordentlicher Ertrag.',
  'Buchverlust = Buchwert − Verkaufspreis (Buchwert > Verkaufspreis) → ausserordentlicher Aufwand.',
  'Amortisation (Hypothekenrückzahlung): Hypotheken / Bank — kein Aufwand.',
])

await addQuiz(ch2, [
  {
    q: 'Buchwert Liegenschaft CHF 920 000, Verkaufspreis CHF 1 180 000. Was entsteht?',
    opts: [['Buchgewinn CHF 260 000 (ausserordentlicher Ertrag)', true],['Buchverlust CHF 260 000', false],['Keine Differenz', false],['Kursdifferenz', false]],
    exp: 'Buchgewinn = Verkaufspreis (1 180 000) − Buchwert (920 000) = 260 000 → ausserordentlicher Ertrag.',
    diff: 'easy',
  },
  {
    q: 'Warum wird ein Grundstück nicht abgeschrieben?',
    opts: [['Es hat keine begrenzte Nutzungsdauer und unterliegt keinem Wertverzehr', true],['Weil es zu teuer wäre', false],['Weil es gesetzlich verboten ist', false],['Weil Grundstücke kein Anlagevermögen sind', false]],
    exp: 'Grundstücke verschleissen nicht — sie haben eine unbegrenzte Nutzungsdauer. Gebäude hingegen schon.',
    diff: 'easy',
  },
])
console.log('✅ Chapter 2 inserted')

// ─── CHAPTER 3: Rendite und Ertragswert ────────────────────────────────────
const ch3 = await insertChapter(tId, 'rendite-ertragswert-liegenschaften', 'Rendite und Ertragswert', 'Bruttorendite, Nettorendite und Ertragswertberechnung', 3,
`LIEGENSCHAFTSFINANZIERUNG — Kaufpreis = Eigenkapital + Hypothek. Das eingesetzte Eigenkapital = Kaufpreis − Hypothek. Die Bruttorendite bezieht sich auf den gesamten Kaufpreis, die Nettorendite auf das eingesetzte Eigenkapital.
BRUTTORENDITE — Bruttorendite = Liegenschaftsertrag brutto × 100 / Kaufpreis. Sie misst den Ertrag vor Abzug der laufenden Kosten. Hohe Bruttorendite ist ein gutes Zeichen, aber ohne Berücksichtigung der Kosten noch nicht aussagekräftig.
NETTORENDITE — Nettorendite = Liegenschaftsgewinn × 100 / eingesetzte eigene Mittel. Liegenschaftsgewinn = Liegenschaftsertrag − Hypothekarzinsen − Unterhaltskosten. Sie zeigt die tatsächliche Verzinsung des eingesetzten Eigenkapitals.
ERTRAGSWERT — Ertragswert = Liegenschaftsertrag brutto × 100 / Bruttorendite (in %). Er kapitalisiert den Ertrag: Bei welchem Kaufpreis würde die gegebene Rendite erzielt? Der Ertragswert schätzt den wirtschaftlich begründeten Wert einer Liegenschaft.
BEISPIELRECHNUNG — Kaufpreis CHF 1 180 000, Hypothek CHF 900 000, Eigenkapital CHF 280 000. Mietzinseinnahmen CHF 55 350, Hypothekarzinsen CHF 22 500, Unterhaltskosten CHF 1 500. Bruttorendite = 55 350/1 180 000 × 100 = 4,69 %. Liegenschaftsgewinn = 55 350 − 22 500 − 1 500 = 31 350. Nettorendite = 31 350/280 000 × 100 = 11,2 %. Ertragswert bei 5 % = 55 350 × 100/5 = CHF 1 107 000.`)

await addGoals(ch3, [
  'Du kannst Bruttorendite, Nettorendite und Ertragswert einer Liegenschaft berechnen.',
  'Du verstehst den Unterschied zwischen Bruttorendite (bezogen auf Kaufpreis) und Nettorendite (bezogen auf Eigenkapital).',
  'Du kannst den Liegenschaftsgewinn aus Ertrag, Zinsen und Unterhaltskosten ermitteln.',
  'Du kannst den Ertragswert einer Liegenschaft bei gegebener Renditeerwartung berechnen.',
])

await addTerms(ch3, [
  ['Bruttorendite', 'Liegenschaftsertrag brutto × 100 / Kaufpreis; Ertrag vor Kosten bezogen auf den Gesamtpreis.'],
  ['Nettorendite', 'Liegenschaftsgewinn × 100 / eingesetzte eigene Mittel; Verzinsung des Eigenkapitals.'],
  ['Liegenschaftsgewinn', 'Liegenschaftsertrag minus Hypothekarzinsen minus Unterhaltskosten.'],
  ['Ertragswert', 'Kapitalisierter Wert einer Liegenschaft: Liegenschaftsertrag × 100 / Bruttorendite (%).'],
  ['Eingesetzte eigene Mittel', 'Kaufpreis minus Hypothek; das tatsächlich investierte Eigenkapital.'],
])

await addPoints(ch3, [
  'Bruttorendite = Liegenschaftsertrag brutto / Kaufpreis × 100.',
  'Nettorendite = Liegenschaftsgewinn / Eigenkapital × 100.',
  'Liegenschaftsgewinn = Ertrag − Hypothekarzinsen − Unterhaltskosten.',
  'Ertragswert = Liegenschaftsertrag × 100 / Bruttorendite (%).',
  'Nettorendite > Bruttorendite möglich, wenn Hebeleffekt der Hypothek (Fremdkapitalzins < Bruttorendite).',
])

await addQuiz(ch3, [
  {
    q: 'Liegenschaftsertrag CHF 60 000, Kaufpreis CHF 1 200 000. Bruttorendite?',
    opts: [['5,0 %', true],['4,0 %', false],['6,0 %', false],['20,0 %', false]],
    exp: 'Bruttorendite = 60 000 / 1 200 000 × 100 = 5,0 %.',
    diff: 'easy',
  },
  {
    q: 'Liegenschaftsgewinn CHF 30 000, eingesetztes Eigenkapital CHF 300 000. Nettorendite?',
    opts: [['10,0 %', true],['5,0 %', false],['30,0 %', false],['3,0 %', false]],
    exp: 'Nettorendite = 30 000 / 300 000 × 100 = 10,0 %.',
    diff: 'easy',
  },
  {
    q: 'Liegenschaftsertrag CHF 50 000, Bruttorenditeerwartung 4 %. Ertragswert?',
    opts: [['CHF 1 250 000', true],['CHF 2 000 000', false],['CHF 200 000', false],['CHF 500 000', false]],
    exp: 'Ertragswert = 50 000 × 100 / 4 = 1 250 000.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Unterschied zwischen Bruttorendite und Nettorendite?',
    opts: [['Bruttorendite bezieht sich auf Kaufpreis; Nettorendite auf das eingesetzte Eigenkapital', true],['Bruttorendite ist immer höher als Nettorendite', false],['Nettorendite berücksichtigt keine Kosten', false],['Es gibt keinen Unterschied', false]],
    exp: 'Bruttorendite = Ertrag/Kaufpreis. Nettorendite = Gewinn nach Kosten/Eigenkapital. Durch Hebeleffekt kann Nettorendite > Bruttorendite sein.',
    diff: 'medium',
  },
])
console.log('✅ Chapter 3 inserted')

await client.end()
console.log('\n✅ Immobilien v2 komplett!')
