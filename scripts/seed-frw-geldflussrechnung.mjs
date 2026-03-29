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
     VALUES ($1,$2,$3,$4,'TrendingUp','blue','abschluss','frw','3',$5,true,NOW(),NOW())
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
  'frw-geldflussrechnung',
  'Geldflussrechnung',
  'Cashflow-Statement: Geldfluss aus Geschäfts-, Investitions- und Finanzierungstätigkeit, direkte und indirekte Methode.',
  15
)

const ch = await insertChapter(tId, 'geldflussrechnung', 'Geldflussrechnung', 'Cashflow-Statement und Liquiditätsanalyse', 1,
`ZWECK DER GELDFLUSSRECHNUNG — Die Geldflussrechnung ist die dritte Jahresrechnung neben Bilanz und Erfolgsrechnung. Sie erklärt, warum sich der Bestand der flüssigen Mittel zwischen Periodenbeginn und Periodenende verändert hat. Gewinn ist nicht gleich Liquidität — ein Unternehmen kann Gewinn ausweisen und dennoch zahlungsunfähig sein.
DREI BEREICHE — Geldfluss aus Geschäftstätigkeit: Liquiditätswirkung des operativen Kerngeschäfts (wichtigste Quelle). Geldfluss aus Investitionstätigkeit: Kauf und Verkauf von Anlagevermögen. Geldfluss aus Finanzierungstätigkeit: Kapitalaufnahme und -rückzahlung, Dividenden. Die Summe der drei Bereiche = Veränderung der flüssigen Mittel.
LIQUIDITÄTSWIRKSAM VS. UNWIRKSAM — Liquiditätswirksam sind Buchungen, bei denen Kasse, Post oder Bank betroffen sind. Liquiditätsunwirksam sind Abschreibungen, Rückstellungsveränderungen und ähnliche Positionen — sie beeinflussen den Gewinn, nicht den Zahlungsmittelbestand.
DIREKTE METHODE — Zahlungswirksame Erträge minus zahlungswirksame Aufwände. Forderungsveränderungen, Vorratsveränderungen und Verbindlichkeitsveränderungen werden direkt einbezogen. Kundenzahlungen = Umsatz +/- Forderungsveränderung. Lieferantenzahlungen = Warenaufwand +/- Vorratsveränderung +/- Verbindlichkeitsveränderung.
INDIREKTE METHODE — Startet beim Reingewinn. Addition: nicht liquiditätswirksame Aufwände (Abschreibungen, Rückstellungen). Subtraktion: nicht liquiditätswirksame Erträge. Korrektur des Nettoumlaufvermögens: Forderungszunahme und Vorratserhöhung mindern den Cashflow; Verbindlichkeitszunahme erhöht ihn. Direkte und indirekte Methode führen zum selben Ergebnis.
FREE CASHFLOW — Free Cashflow = Geldfluss aus Geschäftstätigkeit + Geldfluss aus Investitionstätigkeit. Ein positiver Free Cashflow zeigt, dass nach Investitionen noch selbst erwirtschaftete Mittel für Schuldentilgung, Dividenden oder Liquiditätsaufbau verfügbar sind. Ein negativer Free Cashflow bedeutet, dass externe Finanzierung nötig ist.
ERSTELLUNG — Informationsgrundlagen: Eröffnungsbilanz, Schlussbilanz, Erfolgsrechnung und Zusatzangaben. Arbeitsschritte: Bilanzkontenkreuze erstellen, Positionen den drei Bereichen zuordnen, Geldflussrechnung aufbauen. Kontrollgrösse: Summe aller drei Bereiche = Veränderung flüssige Mittel (stimmt mit Bilanz überein).`)

await addGoals(ch, [
  'Du kennst den Zweck der Geldflussrechnung und ihren Unterschied zu Bilanz und Erfolgsrechnung.',
  'Du kannst die drei Bereiche der Geldflussrechnung benennen und Beispiele zuordnen.',
  'Du verstehst den Unterschied zwischen liquiditätswirksamen und liquiditätsunwirksamen Vorgängen.',
  'Du kannst den Geldfluss aus Geschäftstätigkeit nach der direkten und indirekten Methode berechnen.',
  'Du kannst den Free Cashflow berechnen und interpretieren.',
  'Du kannst eine einfache Geldflussrechnung aus Bilanz, Erfolgsrechnung und Zusatzangaben erstellen.',
])

await addTerms(ch, [
  ['Geldflussrechnung', 'Dritte Jahresrechnung neben Bilanz und Erfolgsrechnung; erklärt die Veränderung der flüssigen Mittel in einer Periode.'],
  ['Flüssige Mittel', 'Kasse, Post und Bank — die engste Liquiditätsbasis eines Unternehmens.'],
  ['Liquiditätswirksam', 'Geschäftsvorfall, bei dem ein Konto der flüssigen Mittel (Kasse/Post/Bank) betroffen ist.'],
  ['Liquiditätsunwirksam', 'Vorfall, der den Gewinn oder Bilanzpositionen verändert, aber keine Zahlungsmittelbewegung auslöst (z. B. Abschreibung, Rückstellung).'],
  ['Geldfluss aus Geschäftstätigkeit', 'Liquiditätsbeitrag des operativen Kerngeschäfts; wichtigste Finanzierungsquelle eines Unternehmens.'],
  ['Geldfluss aus Investitionstätigkeit', 'Mittelabflüsse durch Investitionen und Mittelzuflüsse durch Desinvestitionen.'],
  ['Geldfluss aus Finanzierungstätigkeit', 'Kapitalaufnahme (Zufluss) und Kapitalrückzahlung sowie Dividenden (Abfluss).'],
  ['Direkte Methode', 'Berechnung des operativen Cashflows aus tatsächlichen Zahlungsströmen (Kundenzahlungen minus Lieferantenzahlungen etc.).'],
  ['Indirekte Methode', 'Berechnung des operativen Cashflows ausgehend vom Reingewinn mit Korrektur um nicht liquiditätswirksame Positionen und Bilanzveränderungen.'],
  ['Free Cashflow', 'Geldfluss aus Geschäftstätigkeit plus Geldfluss aus Investitionstätigkeit; zeigt verfügbare Mittel nach Investitionen.'],
])

await addPoints(ch, [
  'Gewinn ≠ Liquidität: Abschreibungen mindern Gewinn, aber nicht Kasse.',
  'Abschreibungen sind liquiditätsunwirksam → werden bei indirekter Methode zum Reingewinn addiert.',
  'Forderungszunahme → Umsatz höher als Kundenzahlungen → mindert operativen Cashflow.',
  'Verbindlichkeitszunahme → Aufwand höher als Lieferantenzahlungen → erhöht operativen Cashflow.',
  'Vorratserhöhung → mehr eingekauft als verbraucht → mindert operativen Cashflow.',
  'Investition (Kauf Anlage): Mittelabfluss → Investitionstätigkeit, negativ.',
  'Desinvestition (Verkauf Anlage): Mittelzufluss → Investitionstätigkeit, positiv.',
  'Dividende / Hypothekenrückzahlung → Finanzierungstätigkeit, negativ.',
  'Free Cashflow positiv = Unternehmen finanziert Investitionen aus eigenem Cashflow.',
  'Kontrollgrösse: Summe aller drei Bereiche = Veränderung flüssige Mittel (aus Bilanzvergleich).',
])

await addQuiz(ch, [
  {
    q: 'Was erklärt die Geldflussrechnung?',
    opts: [['Die Veränderung der flüssigen Mittel in einer Periode', true],['Den Gewinn oder Verlust einer Periode', false],['Den Bestand an Vermögen und Schulden am Stichtag', false],['Die Eigenkapitalentwicklung', false]],
    exp: 'Geldflussrechnung = erklärt Liquiditätsveränderung. Bilanz = Vermögen/Schulden am Stichtag. Erfolgsrechnung = Gewinn/Verlust der Periode.',
    diff: 'easy',
  },
  {
    q: 'Welche Positionen werden bei der indirekten Methode zum Reingewinn addiert?',
    opts: [['Nicht liquiditätswirksame Aufwände (z. B. Abschreibungen)', true],['Dividendenausschüttungen', false],['Kreditaufnahmen', false],['Kauf von Anlagen', false]],
    exp: 'Abschreibungen mindern den Gewinn, aber nicht die Liquidität → sie werden beim indirekten Cashflow zum Reingewinn addiert.',
    diff: 'medium',
  },
  {
    q: 'Welchem Bereich wird der Kauf einer neuen Maschine zugeordnet?',
    opts: [['Geldfluss aus Investitionstätigkeit (Mittelabfluss)', true],['Geldfluss aus Geschäftstätigkeit', false],['Geldfluss aus Finanzierungstätigkeit', false],['Gar nicht — Käufe sind liquiditätsunwirksam', false]],
    exp: 'Kauf von Anlagevermögen = Investitionstätigkeit, Mittelabfluss.',
    diff: 'easy',
  },
  {
    q: 'Was passiert mit dem operativen Cashflow, wenn Forderungen zunehmen?',
    opts: [['Er sinkt — ein Teil der Umsätze wurde noch nicht bezahlt', true],['Er steigt — Kunden haben mehr bestellt', false],['Er ändert sich nicht', false],['Er steigt, weil Forderungen ein Aktivum sind', false]],
    exp: 'Forderungszunahme = Umsatz > Kundenzahlungen → weniger Geld eingegangen als Ertrag erfasst → operativer Cashflow sinkt.',
    diff: 'medium',
  },
  {
    q: 'Free Cashflow = Geldfluss Geschäftstätigkeit CHF 80 000 + Geldfluss Investitionstätigkeit CHF -110 000. Wie lautet der Free Cashflow?',
    opts: [['CHF -30 000 (negativ)', true],['CHF 190 000', false],['CHF 80 000', false],['CHF 110 000', false]],
    exp: 'Free Cashflow = 80 000 + (-110 000) = -30 000. Investitionen übersteigen operativ erwirtschaftete Mittel → externe Finanzierung nötig.',
    diff: 'medium',
  },
  {
    q: 'Dividendenzahlung per Bank gehört zur...',
    opts: [['Finanzierungstätigkeit (Mittelabfluss)', true],['Geschäftstätigkeit', false],['Investitionstätigkeit', false],['Keine Liquiditätswirkung', false]],
    exp: 'Dividenden = Kapitalrückfluss an Aktionäre → Finanzierungstätigkeit, Mittelabfluss.',
    diff: 'easy',
  },
  {
    q: 'Reingewinn CHF 50 000, Abschreibungen CHF 20 000, Forderungszunahme CHF 8 000. Indirekter Cashflow Geschäftstätigkeit?',
    opts: [['CHF 62 000', true],['CHF 70 000', false],['CHF 78 000', false],['CHF 42 000', false]],
    exp: '50 000 + 20 000 (Abschr. addieren) - 8 000 (Forderungszunahme abziehen) = 62 000.',
    diff: 'hard',
  },
])

await client.end()
console.log('✅ Geldflussrechnung komplett eingefügt!')
