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
     VALUES ($1,$2,$3,$4,'Eye','indigo','abschluss','frw','3',$5,true,NOW(),NOW())
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
  'frw-stille-reserven-vertiefung',
  'Stille Reserven Vertiefung',
  'Bereinigung von Bilanz und Erfolgsrechnung: stille Reserven bei Sachanlagen und Vorräten, externer vs. interner Abschluss.',
  17
)

const ch = await insertChapter(tId, 'stille-reserven-bereinigung', 'Stille Reserven — Bereinigung', 'Externer vs. interner Abschluss, Bilanz- und Erfolgsbereinigung', 1,
`GRUNDPRINZIP STILLE RESERVEN — Stille Reserven sind Differenzen zwischen den extern ausgewiesenen Buchwerten und den wirtschaftlich zutreffenden Werten. Aktiven werden zu tief, Passiven zu hoch ausgewiesen. Der externe Abschluss ist deshalb nicht zwingend identisch mit der wirtschaftlichen Realität.
EXTERNER VS. INTERNER ABSCHLUSS — Der externe Abschluss richtet sich an Aussenstehende (Gläubiger, Aktionäre, Steuerbehörden) und kann stille Reserven enthalten. Der interne Abschluss dient der Unternehmensleitung und soll die wirtschaftliche Lage unverfälscht zeigen. Für sachgerechte Analysen muss der externe Abschluss bereinigt werden.
BILANZBEREINIGUNG — Die Bilanz ist eine Stichtagsrechnung. Massgeblich ist der Bestand der stillen Reserven am Bilanzstichtag. Regel: Stille Reserven bei Aktiven hinzurechnen; stille Reserven bei Passiven abziehen. Die bereinigte Bilanz zeigt die wirtschaftlich zutreffenden Vermögens- und Schuldenwerte. Die Differenz zwischen externer und interner Bilanzsumme erscheint als Posten "Stille Reserven" auf der Passivseite.
ERFOLGSBEREINIGUNG — Die Erfolgsrechnung ist eine Periodenrechnung. Massgeblich ist die Veränderung der stillen Reserven im Geschäftsjahr, nicht ihr Bestand. Bildung stiller Reserven erhöht den externen Aufwand oder vermindert den externen Ertrag → interner Aufwand wird reduziert. Auflösung stiller Reserven vermindert den externen Aufwand oder erhöht den externen Ertrag → interner Aufwand wird erhöht. Interner Reingewinn = externer Reingewinn + Bildungen − Auflösungen stiller Reserven.
STILLE RESERVEN BEI SACHANLAGEN — Entstehen durch überhöhte Abschreibungen (z. B. steuerlich zulässige degressive Abschreibung vs. wirtschaftlich angemessene lineare). Externer Buchwert sinkt schneller als interner → Differenz = stille Reserve. In frühen Jahren steigt der Bestand, später nimmt er ab.
STILLE RESERVEN BEI VORRÄTEN — Entstehen durch pauschale Unterbewertung des Lagers (z. B. externer Lagerwert = 70 % des tatsächlichen Werts). Bei steigendem Lagerbestand werden neue stille Reserven gebildet. Bei sinkendem Lagerbestand werden stille Reserven aufgelöst → externer Warenaufwand erscheint dann zu tief.
BEISPIEL KIOSK — Externe Bilanzsumme CHF 162'200; stille Reserven Jahresende CHF 42'800 (Warenvorrat +21'000, Mobiliar +7'200, Fahrzeuge +9'600, Rückstellungen −5'000). Interne Bilanzsumme CHF 200'000. Externer Reingewinn CHF 42'600; Veränderung stiller Reserven +6'700 → interner Reingewinn CHF 49'300.`)

await addGoals(ch, [
  'Du kennst den Unterschied zwischen externem und internem Abschluss.',
  'Du kannst erklären, wie stille Reserven entstehen (bei Sachanlagen und Vorräten).',
  'Du kannst eine externe Bilanz in eine interne Bilanz überführen (Bilanzbereinigung).',
  'Du kannst eine externe Erfolgsrechnung in eine interne Erfolgsrechnung überführen (Erfolgsbereinigung).',
  'Du weisst, warum für die Bilanzbereinigung der Bestand und für die Erfolgsbereinigung die Veränderung der stillen Reserven massgebend ist.',
  'Du kannst den internen Reingewinn aus dem externen Reingewinn und der Veränderung der stillen Reserven berechnen.',
])

await addTerms(ch, [
  ['Stille Reserven', 'Nicht offen ausgewiesene Wertdifferenzen zwischen den extern dargestellten Buchwerten und den wirtschaftlich zutreffenden Werten. Entstehen durch Unterbewertung von Aktiven oder Überbewertung von Passiven.'],
  ['Externer Abschluss', 'Für Aussenstehende bestimmter Jahresabschluss (Gläubiger, Aktionäre, Steuerbehörden); kann stille Reserven enthalten.'],
  ['Interner Abschluss', 'Für die Unternehmensleitung bestimmter Abschluss; soll die wirtschaftliche Lage unverfälscht zeigen — stille Reserven werden herausgerechnet.'],
  ['Bilanzbereinigung', 'Überführung der externen Bilanz in eine interne Bilanz durch Addition der stillen Reserven bei Aktiven und Subtraktion bei Passiven (massgebend: Bestand am Stichtag).'],
  ['Erfolgsbereinigung', 'Überführung der externen Erfolgsrechnung in eine interne durch Korrektur um die Veränderung der stillen Reserven in der Periode (massgebend: Bildungen und Auflösungen).'],
  ['Bildung stiller Reserven', 'Neue stille Reserven entstehen in der Periode → externer Aufwand zu hoch oder externer Ertrag zu tief → beim internen Abschluss wird der Aufwand reduziert.'],
  ['Auflösung stiller Reserven', 'Bestehende stille Reserven nehmen ab → externer Aufwand zu tief oder externer Ertrag zu hoch → beim internen Abschluss wird der Aufwand erhöht.'],
  ['Stille Reserven bei Sachanlagen', 'Entstehen durch überhöhte Abschreibungen in der Finanzbuchhaltung; interner Buchwert > externer Buchwert.'],
  ['Stille Reserven bei Vorräten', 'Entstehen durch pauschale Unterbewertung des Lagerbestands; wirtschaftlicher Lagerwert > extern ausgewiesener Lagerwert.'],
])

await addPoints(ch, [
  'Bilanzbereinigung: Stichtagsprinzip — massgebend ist der Bestand der stillen Reserven am 31.12.',
  'Aktiven intern = Aktiven extern + stille Reserven bei Aktiven.',
  'Passiven intern = Passiven extern − stille Reserven bei Passiven.',
  'Stille Reserven erscheinen in der internen Bilanz als eigene Passivposition.',
  'Erfolgsbereinigung: Periodenprinzip — massgebend ist die Veränderung der stillen Reserven.',
  'Bildung SR: interner Aufwand < externer Aufwand (überhöhter Aufwand wird reduziert).',
  'Auflösung SR: interner Aufwand > externer Aufwand (zu tiefer Aufwand wird erhöht).',
  'Interner Reingewinn = externer Reingewinn + (Bildungen − Auflösungen stiller Reserven) = Veränderung der stillen Reserven.',
  'Kontrollgrösse: Differenz interner und externer Reingewinn = Veränderung stiller Reserven gesamt.',
])

await addQuiz(ch, [
  {
    q: 'Was ist der Unterschied zwischen externem und internem Abschluss bei stillen Reserven?',
    opts: [
      ['Der externe Abschluss kann stille Reserven enthalten; der interne soll die wirtschaftliche Lage unverfälscht zeigen', true],
      ['Der interne Abschluss enthält mehr stille Reserven als der externe', false],
      ['Stille Reserven erscheinen nur im externen Abschluss als eigene Bilanzposition', false],
      ['Es gibt keinen Unterschied — beide zeigen denselben Gewinn', false],
    ],
    exp: 'Externer Abschluss = für Aussenstehende, kann stille Reserven enthalten. Interner Abschluss = für Unternehmensführung, stille Reserven werden herausgerechnet.',
    diff: 'easy',
  },
  {
    q: 'Welche Grösse ist für die Bilanzbereinigung massgebend?',
    opts: [
      ['Der Bestand der stillen Reserven am Bilanzstichtag', true],
      ['Die Veränderung der stillen Reserven im Geschäftsjahr', false],
      ['Der Bestand der stillen Reserven zu Jahresbeginn', false],
      ['Der Durchschnitt aus Anfangs- und Schlussbestand', false],
    ],
    exp: 'Die Bilanz ist eine Stichtagsrechnung → massgebend ist der Bestand der stillen Reserven am 31.12. Die Veränderung ist dagegen relevant für die Erfolgsbereinigung.',
    diff: 'medium',
  },
  {
    q: 'Welche Grösse ist für die Erfolgsbereinigung massgebend?',
    opts: [
      ['Die Veränderung der stillen Reserven im Geschäftsjahr', true],
      ['Der Bestand der stillen Reserven am Jahresende', false],
      ['Der Bestand der stillen Reserven zu Jahresbeginn', false],
      ['Der Gesamtbestand über alle Jahre', false],
    ],
    exp: 'Die Erfolgsrechnung ist eine Periodenrechnung → nur die in dieser Periode gebildeten oder aufgelösten stillen Reserven beeinflussen den Periodenerfolg.',
    diff: 'medium',
  },
  {
    q: 'Stille Reserven bei Sachanlagen von CHF 8\'000 zu Jahresbeginn steigen auf CHF 11\'200 am Jahresende. Was gilt für die externe Erfolgsrechnung?',
    opts: [
      ['Der externe Abschreibungsaufwand ist um CHF 3\'200 zu hoch (Bildung stiller Reserven)', true],
      ['Der externe Abschreibungsaufwand ist um CHF 3\'200 zu tief (Auflösung stiller Reserven)', false],
      ['Der externe Warenaufwand ist um CHF 3\'200 zu hoch', false],
      ['Die Erfolgsrechnung wird nicht beeinflusst', false],
    ],
    exp: 'Stille Reserven steigen um CHF 3\'200 → neue SR wurden gebildet → überhöhte Abschreibungen in der Fibu → externer Abschreibungsaufwand ist zu hoch. Intern wird er um 3\'200 reduziert.',
    diff: 'medium',
  },
  {
    q: 'Externer Reingewinn CHF 55\'000; stille Reserven steigen von CHF 30\'000 auf CHF 36\'500. Wie hoch ist der interne Reingewinn?',
    opts: [
      ['CHF 61\'500', true],
      ['CHF 48\'500', false],
      ['CHF 55\'000', false],
      ['CHF 91\'500', false],
    ],
    exp: 'Veränderung SR = 36\'500 − 30\'000 = +6\'500 (Bildung). Interner RG = 55\'000 + 6\'500 = CHF 61\'500.',
    diff: 'medium',
  },
  {
    q: 'Wie werden stille Reserven in der internen Bilanz ausgewiesen?',
    opts: [
      ['Als eigene Passivposition auf der Passivseite', true],
      ['Als Abzug vom Eigenkapital', false],
      ['Als zusätzliche Aktivposition', false],
      ['Sie erscheinen nicht in der internen Bilanz', false],
    ],
    exp: 'In der internen Bilanz steigen die bereinigten Aktiven (und/oder sinken die Passiven). Die Differenz zur externen Bilanzsumme erscheint als Position "Stille Reserven" auf der Passivseite.',
    diff: 'easy',
  },
  {
    q: 'Warenvorrat extern CHF 42\'000; stille Reserven im Warenvorrat zu Jahresende CHF 21\'000; zu Jahresbeginn CHF 23\'000. Was ist für die interne Erfolgsrechnung zu korrigieren?',
    opts: [
      ['Warenaufwand intern um CHF 2\'000 erhöhen (Auflösung SR von 2\'000)', true],
      ['Warenaufwand intern um CHF 2\'000 reduzieren (Bildung SR von 2\'000)', false],
      ['Warenaufwand intern um CHF 21\'000 erhöhen', false],
      ['Keine Korrektur nötig', false],
    ],
    exp: 'SR Warenvorrat sinken von 23\'000 auf 21\'000 = Auflösung von CHF 2\'000. Auflösung → externer Warenaufwand ist zu tief → interner Warenaufwand wird um 2\'000 erhöht.',
    diff: 'hard',
  },
])

console.log('✅ Stille Reserven Vertiefung Band 3 komplett eingefügt!')
await client.end()
