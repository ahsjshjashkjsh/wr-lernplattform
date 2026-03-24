import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function run() {
  const topicId = id()
  await client.query(`INSERT INTO "Topic" (id, slug, title, description, icon, color, "examType", category, "order", published, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
    [topicId, 'frw-verrechnungssteuer', 'Verrechnungssteuer', 'Schweizer Verrechnungssteuer auf Kapitalerträgen und Rückforderung', 'Calculator', 'emerald', 'both', 'frw', 6, false])

  // ─── CHAPTER 1: Grundlagen der Verrechnungssteuer ────────────────────
  const ch1Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch1Id, 'grundlagen-verrechnungssteuer', 'Grundlagen der Verrechnungssteuer', 'Satz, Anwendung und Rückforderung', topicId, 1, 'complete',
      'Die Verrechnungssteuer (VST) ist eine Sicherungssteuer des Bundes. Sie beträgt 35 % auf Kapitalerträgen (Dividenden, Zinsen auf Obligationen) und wird direkt vom Schuldner einbehalten. Steuerpflichtige Personen mit ordnungsgemässen Steuererklärungen erhalten die VST zurück.'])

  const lg1 = [
    'Du weisst, was die Verrechnungssteuer ist und welchem Zweck sie dient.',
    'Du kennst den Steuersatz der Verrechnungssteuer (35 %).',
    'Du verstehst, auf welche Erträge die VST erhoben wird.',
    'Du kannst erklären, wer die VST einbehält und wer sie zurückfordern kann.',
    'Du kannst die Buchungssätze für Zinserträge und Dividenden mit VST erstellen.',
  ]
  for (let i = 0; i < lg1.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg1[i], ch1Id, i + 1])
  }

  const kt1 = [
    ['Verrechnungssteuer (VST)', 'Bundessteuer von 35 % auf Kapitalerträgen (Dividenden, Bankzinsen, Obligationenzinsen). Dient als Sicherungssteuer.'],
    ['Sicherungssteuer', 'Die VST soll sicherstellen, dass Kapitalerträge ordnungsgemäss deklariert werden. Wer deklariert, bekommt sie zurück.'],
    ['Quellenabzug', 'Der Schuldner (Bank, AG) zieht die VST ab und leitet sie an die ESTV weiter. Gläubiger erhält nur 65 %.'],
    ['Rückforderung', 'Wer die Erträge in der Steuererklärung deklariert, erhält die 35 % VST vom Bund zurückerstattet.'],
    ['Bruttoertrag', 'Ertrag vor Abzug der VST (100 %).'],
    ['Nettoertrag', 'Ertrag nach Abzug der 35 % VST — Auszahlungsbetrag (65 % des Bruttoertrags).'],
    ['VST-Guthaben', 'Aktivkonto in der Bilanz. Hält den ausstehenden Rückforderungsanspruch der VST beim Bund.'],
    ['ESTV', 'Eidgenössische Steuerverwaltung — erhebt die VST und verarbeitet Rückforderungsanträge.'],
    ['Dividende', 'Gewinnausschüttung einer AG an ihre Aktionäre. Unterliegt der 35 % VST.'],
    ['Obligationenzins', 'Zins auf Anleihen. Unterliegt ebenfalls der VST von 35 %.'],
  ]
  for (let i = 0; i < kt1.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt1[i][0], kt1[i][1], ch1Id, i + 1])
  }

  const cp1 = [
    'VST-Satz: 35 % auf Dividenden, Bankzinsen, Obligationenzinsen.',
    'Aus Brutto 100 werden netto 65 ausgezahlt (100 − 35 = 65).',
    'Brutto berechnen aus Netto: Brutto = Netto / 0,65.',
    'VST berechnen aus Brutto: VST = Brutto × 35 %.',
    'Bei Erhalt Nettoertrag: Kasse (65 %) + VST-Guthaben (35 %) / Zins-/Dividendenertrag (100 %).',
    'Rückforderung VST: Kasse / VST-Guthaben (Guthaben wird aufgelöst).',
    'Unternehmen mit ordnungsgemässer Buchhaltung können VST vollständig zurückfordern.',
  ]
  for (let i = 0; i < cp1.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp1[i], ch1Id, i + 1])
  }

  const ex1 = [
    'Bankzins: Brutto-Zinsertrag CHF 1 000. VST = 35 % = 350. Nettoauszahlung = 650. Buchung: Kasse 650 + VST-Guthaben 350 / Zinsertrag 1 000.',
    'Rückforderung: Rückerstattung VST-Guthaben vom Bund CHF 350. Buchung: Kasse 350 / VST-Guthaben 350.',
    'Brutto aus Netto berechnen: Nettozins CHF 650. Brutto = 650 / 0,65 = 1 000. VST = 1 000 − 650 = 350.',
  ]
  for (let i = 0; i < ex1.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex1[i], ch1Id, i + 1])
  }

  const q1 = [
    { q: 'Wie hoch ist der Steuersatz der Verrechnungssteuer in der Schweiz?', opts: [{ text: '8,1 %', correct: false }, { text: '20 %', correct: false }, { text: '35 %', correct: true }, { text: '25 %', correct: false }], explanation: 'Die Verrechnungssteuer beträgt 35 % auf Kapitalerträgen (Dividenden, Zinsen).', difficulty: 'easy' },
    { q: 'Brutto-Dividende CHF 2 000. Wie viel erhält der Aktionär (nach VST-Abzug)?', opts: [{ text: 'CHF 2 000', correct: false }, { text: 'CHF 1 300', correct: true }, { text: 'CHF 700', correct: false }, { text: 'CHF 1 650', correct: false }], explanation: 'VST = 2 000 × 35 % = 700. Netto = 2 000 − 700 = 1 300 (= 65 % von 2 000).', difficulty: 'easy' },
    { q: 'Welchen Zweck hat die Verrechnungssteuer?', opts: [{ text: 'Die Unternehmen sollen mehr Steuern bezahlen', correct: false }, { text: 'Sie ist eine Sicherungssteuer: Sie stellt sicher, dass Kapitalerträge deklariert werden', correct: true }, { text: 'Sie soll den Konsum bremsen', correct: false }, { text: 'Sie ist eine Strafe für zu hohe Dividenden', correct: false }], explanation: 'VST = Sicherungssteuer: Wer deklariert, bekommt sie zurück. Wer nicht deklariert, verliert sie. So werden Steuerhinterziehung bei Kapitalerträgen verhindert.', difficulty: 'medium' },
    { q: 'Wie lautet der Buchungssatz für den Eingang einer Nettodividende von CHF 650 (Brutto CHF 1 000)?', opts: [{ text: 'Kasse 650 / Dividendenertrag 650', correct: false }, { text: 'Kasse 650 + VST-Guthaben 350 / Dividendenertrag 1 000', correct: true }, { text: 'Dividendenertrag 1 000 / Kasse 1 000', correct: false }, { text: 'VST-Guthaben 350 / Kasse 350', correct: false }], explanation: 'Der volle Bruttoertrag (1 000) wird als Ertrag gebucht. Die einbehaltene VST (350) ist ein Guthaben gegenüber dem Bund.', difficulty: 'medium' },
    { q: 'Wer kann die Verrechnungssteuer zurückfordern?', opts: [{ text: 'Jeder beliebig', correct: false }, { text: 'Nur ausländische Personen', correct: false }, { text: 'Steuerpflichtige Personen, die den Ertrag ordnungsgemäss deklariert haben', correct: true }, { text: 'Niemand', correct: false }], explanation: 'Rückerstattung der VST: Wer die Erträge korrekt in der Steuererklärung deklariert, erhält die VST zurück. Unternehmen: via Jahresabschluss und Antrag bei der ESTV.', difficulty: 'medium' },
  ]
  for (let i = 0; i < q1.length; i++) {
    const qId = id()
    await client.query(`INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, ch1Id, q1[i].q, q1[i].explanation, q1[i].difficulty, i + 1])
    for (let j = 0; j < q1[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q1[i].opts[j].text, q1[i].opts[j].correct, j + 1])
    }
  }
  console.log('✅ Chapter 1 inserted')

  // ─── CHAPTER 2: VST im Unternehmenskontext ────────────────────────────
  const ch2Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch2Id, 'vst-unternehmenskontext', 'VST im Unternehmenskontext', 'Dividendenausschüttung und Quellenabzug durch das Unternehmen', topicId, 2, 'complete',
      'Wenn eine AG Dividenden ausschüttet, muss sie die Verrechnungssteuer (35 %) einbehalten und an die ESTV abführen. Der Aktionär erhält nur 65 %. Das Unternehmen muss korrekte Buchungssätze für Ausschüttung und VST-Ablieferung kennen.'])

  const lg2 = [
    'Du kannst aus der Sicht der ausschüttenden AG Dividenden mit VST-Abzug buchen.',
    'Du weisst, wie die VST an die ESTV abgeführt wird.',
    'Du kennst den Unterschied zwischen VST-Guthaben (Empfänger) und VST-Schuld (Schuldner).',
    'Du kannst Wertschriftenerträge mit VST korrekt erfassen.',
  ]
  for (let i = 0; i < lg2.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg2[i], ch2Id, i + 1])
  }

  const kt2 = [
    ['VST-Schuld', 'Verbindlichkeit der ausschüttenden AG gegenüber der ESTV (35 % der Bruttodividende). Passivkonto.'],
    ['Bruttodividende', 'Gesamte beschlossene Dividende vor VST-Abzug.'],
    ['Nettodividende', 'Ausgezahlte Dividende nach Abzug der 35 % VST.'],
    ['Generalversammlungsbeschluss', 'Die Ausschüttung von Dividenden muss von der GV genehmigt werden.'],
    ['Verrechnungssteuer-Abrechnung', 'Formular, das die ausschüttende Gesellschaft innerhalb von 30 Tagen nach GV bei der ESTV einreicht.'],
  ]
  for (let i = 0; i < kt2.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt2[i][0], kt2[i][1], ch2Id, i + 1])
  }

  const cp2 = [
    'Ausschüttende AG: Dividende beschlossen → Verbindlichkeit gegenüber Aktionären + ESTV.',
    'Buchung Dividende: Gewinnreserven / Verbindlichkeit Aktionäre (65 %) + VST-Schuld ESTV (35 %).',
    'Zahlung Nettodividende: Verbindlichkeit Aktionäre / Kasse.',
    'Abführung VST: VST-Schuld / Kasse.',
    'Empfangende Seite (Aktionär): Kasse (65 %) + VST-Guthaben (35 %) / Dividendenertrag (100 %).',
    'Rückforderung durch Aktionär: Kasse / VST-Guthaben (nach Genehmigung durch ESTV).',
  ]
  for (let i = 0; i < cp2.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp2[i], ch2Id, i + 1])
  }

  const ex2 = [
    'AG beschliesst Dividende CHF 100 000 brutto. VST = 35 000. Nettodividende = 65 000. Buchung AG: Gewinnreserven 100 000 / Verbindlichkeit Aktionäre 65 000 + VST-Schuld 35 000.',
    'Zahlung: Verbindlichkeit Aktionäre 65 000 / Kasse 65 000. Dann: VST-Schuld 35 000 / Kasse 35 000.',
    'Buchung beim Aktionär (Unternehmen): Kasse 65 000 + VST-Guthaben 35 000 / Dividendenertrag 100 000.',
  ]
  for (let i = 0; i < ex2.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex2[i], ch2Id, i + 1])
  }

  const q2 = [
    { q: 'Eine AG schüttet Dividenden von CHF 50 000 brutto aus. Wie viel muss sie an die ESTV abführen?', opts: [{ text: 'CHF 50 000', correct: false }, { text: 'CHF 17 500', correct: true }, { text: 'CHF 32 500', correct: false }, { text: 'CHF 5 000', correct: false }], explanation: 'VST = 35 % × 50 000 = 17 500. Nettodividende an Aktionäre = 50 000 − 17 500 = 32 500.', difficulty: 'easy' },
    { q: 'Wie bucht die ausschüttende AG die beschlossene Dividende (Brutto CHF 20 000)?', opts: [{ text: 'Kasse / Gewinnreserven 20 000', correct: false }, { text: 'Gewinnreserven 20 000 / Verbindlichkeit Aktionäre 13 000 + VST-Schuld 7 000', correct: true }, { text: 'Dividendenaufwand 20 000 / Kasse 20 000', correct: false }, { text: 'VST-Guthaben 7 000 / Kasse 7 000', correct: false }], explanation: 'Dividendenbeschluss: Eigenkapital (Gewinnreserven) sinkt. Schulden entstehen: 65 % an Aktionäre, 35 % an ESTV (VST-Schuld).', difficulty: 'hard' },
    { q: 'Wohin buchen wir die VST, die wir als Empfänger einer Dividende noch nicht zurückgefordert haben?', opts: [{ text: 'Als Aufwand', correct: false }, { text: 'Als Aktivum (VST-Guthaben / Forderung gegenüber Bund)', correct: true }, { text: 'Als Passivum', correct: false }, { text: 'Direkt als Ertrag', correct: false }], explanation: 'VST-Guthaben ist eine Forderung gegenüber dem Bund. Es erscheint als Aktivum (Umlaufvermögen) in der Bilanz bis zur Rückerstattung.', difficulty: 'medium' },
    { q: 'Was passiert mit der VST, wenn der Aktionär seinen Ertrag nicht in der Steuererklärung deklariert?', opts: [{ text: 'Er erhält sie trotzdem zurück', correct: false }, { text: 'Er verliert die VST — sie verfällt zugunsten des Bundes', correct: true }, { text: 'Er muss sie doppelt zahlen', correct: false }, { text: 'Die AG muss sie zurückzahlen', correct: false }], explanation: 'VST = Sicherungssteuer: Wer nicht deklariert, verliert die 35 %. Das ist der Sanktionsmechanismus gegen Steuerhinterziehung.', difficulty: 'medium' },
    { q: 'Nettozinsertrag CHF 325. Wie hoch ist der Bruttobetrag?', opts: [{ text: 'CHF 360', correct: false }, { text: 'CHF 500', correct: true }, { text: 'CHF 438,75', correct: false }, { text: 'CHF 465', correct: false }], explanation: 'Brutto = Netto / (1 − 0,35) = Netto / 0,65 = 325 / 0,65 = 500. VST = 500 × 35 % = 175.', difficulty: 'medium' },
  ]
  for (let i = 0; i < q2.length; i++) {
    const qId = id()
    await client.query(`INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, ch2Id, q2[i].q, q2[i].explanation, q2[i].difficulty, i + 1])
    for (let j = 0; j < q2[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q2[i].opts[j].text, q2[i].opts[j].correct, j + 1])
    }
  }
  console.log('✅ Chapter 2 inserted')

  await client.end()
  console.log('\n✅ Verrechnungssteuer komplett eingefügt!')
}

run().catch(e => { console.error(e); process.exit(1) })
