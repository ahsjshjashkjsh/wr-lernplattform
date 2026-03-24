import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function run() {
  const topicId = id()
  await client.query(`INSERT INTO "Topic" (id, slug, title, description, icon, color, "examType", category, "order", published, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
    [topicId, 'frw-wertschriften', 'Wertschriften', 'Aktien, Obligationen und Wertschriftenanlagen in der Buchhaltung', 'Calculator', 'emerald', 'both', 'frw', 8, false])

  // ─── CHAPTER 1: Kauf und Bewertung von Wertschriften ─────────────────
  const ch1Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch1Id, 'kauf-bewertung-wertschriften', 'Kauf und Bewertung von Wertschriften', 'Aktien, Obligationen und Kursbewertung', topicId, 1, 'complete',
      'Wertschriften (Aktien, Obligationen) können als kurzfristige Anlage (Umlaufvermögen) oder langfristige Beteiligung (Anlagevermögen) gehalten werden. Sie werden zu Anschaffungskosten aktiviert und am Jahresende zum Niederstwert bewertet.'])

  const lg1 = [
    'Du kannst den Kauf von Wertschriften korrekt buchen.',
    'Du verstehst den Unterschied zwischen kurzfristigen Wertschriften (UV) und langfristigen Beteiligungen (AV).',
    'Du kannst Wertschriften am Jahresende nach dem Niederstwertprinzip bewerten.',
    'Du kannst Kursverluste und Kursgewinne bei Wertschriften buchen.',
    'Du kennst Dividenden- und Zinserträge aus Wertschriften (inkl. VST).',
  ]
  for (let i = 0; i < lg1.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg1[i], ch1Id, i + 1])
  }

  const kt1 = [
    ['Wertschriften', 'Handelbare Wertpapiere: Aktien (Eigenkapitaltitel) und Obligationen (Fremdkapitaltitel).'],
    ['Aktie', 'Eigenkapitalanteil an einer AG. Gibt Anrecht auf Dividende und Stimmrecht.'],
    ['Obligation', 'Schuldtitel (Anleihe). Gibt Anrecht auf festen Zins und Rückzahlung des Nominalwerts.'],
    ['Kurswert (Börsenwert)', 'Aktueller Marktpreis der Wertschrift an der Börse.'],
    ['Buchwert', 'In der Bilanz ausgewiesener Wert (Anschaffungskosten oder niedrigerer Kurswert).'],
    ['Niederstwertprinzip', 'Wertschriften werden am Jahresende mit dem tieferen Wert (Anschaffungskosten vs. Kurswert) bewertet.'],
    ['Wertschriftenverlust', 'Aufwand bei Abwertung von Wertschriften auf den tieferen Kurswert.'],
    ['Wertschriftengewinn', 'Ertrag beim Verkauf oder bei Aufwertung von Wertschriften.'],
    ['Coupon', 'Zinszahlung auf einer Obligation (festgelegter Zinssatz × Nominalbetrag).'],
    ['Dividende', 'Gewinnausschüttung der AG an ihre Aktionäre. Unterliegt VST von 35 %.'],
  ]
  for (let i = 0; i < kt1.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt1[i][0], kt1[i][1], ch1Id, i + 1])
  }

  const cp1 = [
    'Kauf Wertschriften: Wertschriften (Aktivum) / Kasse.',
    'Jahresende: Niederstwert = min(Anschaffungskosten, Kurswert).',
    'Abwertung auf Kurswert: Wertschriftenverlust / Wertschriften.',
    'Aufwertung (nach Abwertung): Wertschriften / Wertschriftengewinn (nur bis Anschaffungskosten).',
    'Dividendeneingang (mit VST): Kasse (65 %) + VST-Guthaben (35 %) / Dividendenertrag (100 %).',
    'Zinserträge (Obligationen): Kasse (65 %) + VST-Guthaben (35 %) / Zinsertrag (100 %).',
    'Verkauf Wertschriften: Kasse / Wertschriften ± Wertschriftengewinn/-verlust.',
  ]
  for (let i = 0; i < cp1.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp1[i], ch1Id, i + 1])
  }

  const ex1 = [
    'Kauf Aktien: 100 Aktien Novartis à CHF 90 = CHF 9 000 + Courtage CHF 50 = CHF 9 050. Buchung: Wertschriften 9 050 / Kasse 9 050.',
    'Jahresende: Kurswert CHF 80/Aktie → 100 × 80 = CHF 8 000. Niederstwert < Buchwert. Abwertung CHF 1 050. Buchung: Wertschriftenverlust 1 050 / Wertschriften 1 050.',
    'Dividende: 100 Aktien, CHF 3 Dividende brutto = CHF 300. VST 35 % = 105. Netto = 195. Buchung: Kasse 195 + VST-Guthaben 105 / Dividendenertrag 300.',
  ]
  for (let i = 0; i < ex1.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex1[i], ch1Id, i + 1])
  }

  const q1 = [
    { q: 'Was besagt das Niederstwertprinzip bei Wertschriften?', opts: [{ text: 'Wertschriften werden immer zu Anschaffungskosten bewertet', correct: false }, { text: 'Wertschriften werden mit dem tieferen Wert aus Anschaffungskosten oder Kurswert bewertet', correct: true }, { text: 'Wertschriften dürfen nur abgewertet, nicht aufgewertet werden', correct: false }, { text: 'Nur Aktien, nicht Obligationen unterliegen dem Niederstwertprinzip', correct: false }], explanation: 'Niederstwertprinzip (Vorsichtsprinzip): Wenn der Kurswert unter die Anschaffungskosten fällt, muss abgewertet werden.', difficulty: 'medium' },
    { q: 'Aktien gekauft für CHF 10 000. Kurswert Jahresende CHF 12 000. Was wird gebucht?', opts: [{ text: 'Wertschriften 2 000 / Wertschriftengewinn 2 000', correct: false }, { text: 'Keine Buchung — der höhere Wert darf nicht ausgewiesen werden', correct: true }, { text: 'Wertschriftenverlust 2 000 / Wertschriften 2 000', correct: false }, { text: 'Kasse 2 000 / Wertschriften 2 000', correct: false }], explanation: 'Nach dem Niederstwertprinzip darf der höhere Kurswert nicht in der Bilanz ausgewiesen werden. Stille Reserve. Aufwertung nur nach vorheriger Abwertung möglich.', difficulty: 'hard' },
    { q: 'Wie lautet der Buchungssatz beim Kauf von Aktien für CHF 5 000 bar?', opts: [{ text: 'Kasse / Wertschriften 5 000', correct: false }, { text: 'Wertschriften / Kasse 5 000', correct: true }, { text: 'Wertschriftenertrag / Kasse 5 000', correct: false }, { text: 'Eigenkapital / Wertschriften 5 000', correct: false }], explanation: 'Kauf Wertschriften: Wertschriften (Aktivum Soll) / Kasse (Haben). Das Geld fliesst ab, der Wertschriftenbestand steigt.', difficulty: 'easy' },
    { q: 'Was ist eine Obligation?', opts: [{ text: 'Ein Eigenkapitalanteil an einer AG', correct: false }, { text: 'Ein Schuldtitel mit fixem Zins und Rückzahlung am Ende der Laufzeit', correct: true }, { text: 'Eine staatliche Steuer', correct: false }, { text: 'Eine Art von Versicherung', correct: false }], explanation: 'Obligation = Anleihe / Schuldverschreibung. Der Anleger leiht dem Emittenten Geld und erhält dafür regelmässige Zinsen (Coupon) und am Schluss den Nennwert zurück.', difficulty: 'easy' },
    { q: 'Dividendenertrag brutto CHF 500. Wie buchen wir den Eingang (nach VST-Abzug)?', opts: [{ text: 'Kasse 500 / Dividendenertrag 500', correct: false }, { text: 'Kasse 325 + VST-Guthaben 175 / Dividendenertrag 500', correct: true }, { text: 'Kasse 500 / Kasse 325 + VST 175', correct: false }, { text: 'VST 175 / Kasse 175', correct: false }], explanation: 'VST = 35 % × 500 = 175. Nettozahlung = 325. Buchung: Kasse 325 + VST-Guthaben 175 / Dividendenertrag 500.', difficulty: 'medium' },
  ]
  for (let i = 0; i < q1.length; i++) {
    const qId = id()
    await client.query(`INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, ch1Id, q1[i].q, q1[i].explanation, q1[i].difficulty, i + 1])
    for (let j = 0; j < q1[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q1[i].opts[j].text, q1[i].opts[j].correct, j + 1])
    }
  }
  console.log('✅ Chapter 1 inserted')

  // ─── CHAPTER 2: Verkauf von Wertschriften ────────────────────────────
  const ch2Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch2Id, 'verkauf-wertschriften', 'Verkauf von Wertschriften', 'Buchgewinne, Buchverluste und Steuern', topicId, 2, 'complete',
      'Beim Verkauf von Wertschriften entsteht ein Buchgewinn (Verkaufspreis > Buchwert) oder Buchverlust (Verkaufspreis < Buchwert). In der Schweiz sind Kapitalgewinne aus Privatvermögen steuerfrei; für Unternehmen sind sie steuerpflichtig.'])

  const lg2 = [
    'Du kannst Buchgewinn und Buchverlust beim Wertschriftenverkauf berechnen.',
    'Du kannst die Buchungssätze für den Verkauf von Wertschriften erstellen.',
    'Du verstehst die steuerlichen Grundlagen bei Wertschriftengewinnen.',
    'Du kannst Wertschriften-Transaktionen vollständig in der Buchhaltung abbilden.',
  ]
  for (let i = 0; i < lg2.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg2[i], ch2Id, i + 1])
  }

  const kt2 = [
    ['Realisierter Kursgewinn', 'Gewinn beim tatsächlichen Verkauf der Wertschrift (Verkaufspreis − Buchwert > 0).'],
    ['Realisierter Kursverlust', 'Verlust beim tatsächlichen Verkauf der Wertschrift (Verkaufspreis − Buchwert < 0).'],
    ['Courtage', 'Börsengebühr / Provision der Bank beim Kauf oder Verkauf von Wertschriften.'],
    ['Wertschriftenbestand', 'Gesamtwert aller gehaltenen Wertschriften in der Bilanz.'],
    ['Stille Reserve', 'Differenz zwischen dem tatsächlichen Marktwert und dem (tieferen) Buchwert.'],
  ]
  for (let i = 0; i < kt2.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt2[i][0], kt2[i][1], ch2Id, i + 1])
  }

  const cp2 = [
    'Verkauf Wertschriften mit Gewinn: Kasse / Wertschriften (Buchwert) + Wertschriftengewinn.',
    'Verkauf Wertschriften mit Verlust: Kasse + Wertschriftenverlust / Wertschriften (Buchwert).',
    'Buchwert = zuletzt bilanzierter Wert (nach etwaigen Abwertungen).',
    'Courtage beim Verkauf = Abzug vom Verkaufserlös (reduziert den Buchgewinn).',
    'Wertschriftengewinn erscheint als Ertrag, Wertschriftenverlust als Aufwand in der ER.',
    'Stille Reserven entstehen, wenn Kurswert > Buchwert (nicht verbucht wegen Niederstwertprinzip).',
  ]
  for (let i = 0; i < cp2.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp2[i], ch2Id, i + 1])
  }

  const ex2 = [
    'Verkauf mit Gewinn: Buchwert Aktien CHF 8 000. Verkaufserlös CHF 11 000. Buchgewinn = 3 000. Buchung: Kasse 11 000 / Wertschriften 8 000 + Wertschriftengewinn 3 000.',
    'Verkauf mit Verlust: Buchwert CHF 5 000. Erlös CHF 3 500. Buchverlust = 1 500. Buchung: Kasse 3 500 + Wertschriftenverlust 1 500 / Wertschriften 5 000.',
  ]
  for (let i = 0; i < ex2.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex2[i], ch2Id, i + 1])
  }

  const q2 = [
    { q: 'Buchwert Aktien CHF 6 000, Verkaufserlös CHF 7 500. Welche Buchung?', opts: [{ text: 'Kasse 7 500 / Wertschriften 7 500', correct: false }, { text: 'Kasse 7 500 / Wertschriften 6 000 + Wertschriftengewinn 1 500', correct: true }, { text: 'Wertschriften 1 500 / Wertschriftengewinn 1 500', correct: false }, { text: 'Kasse 6 000 + Wertschriftengewinn 1 500 / Wertschriften 7 500', correct: false }], explanation: 'Verkauf mit Gewinn: Kasse 7 500 / Wertschriften (Buchwert) 6 000 + Wertschriftengewinn 1 500.', difficulty: 'medium' },
    { q: 'Was ist eine stille Reserve bei Wertschriften?', opts: [{ text: 'Ein verstecktes Konto', correct: false }, { text: 'Der Unterschied zwischen dem höheren Marktwert und dem tieferen Buchwert (nicht verbucht)', correct: true }, { text: 'Rückstellungen für mögliche Verluste', correct: false }, { text: 'Dividenden, die noch nicht ausbezahlt wurden', correct: false }], explanation: 'Stille Reserve = Kurswert > Buchwert. Wegen Niederstwertprinzip wird die Wertsteigerung nicht verbucht — sie ist "still" (nicht sichtbar in der Bilanz).', difficulty: 'hard' },
    { q: 'Wo erscheint ein Wertschriftengewinn in der Jahresrechnung?', opts: [{ text: 'In der Bilanz als Eigenkapital', correct: false }, { text: 'In der Erfolgsrechnung als Ertrag', correct: true }, { text: 'Im Anhang, aber nicht in der ER', correct: false }, { text: 'Gar nicht', correct: false }], explanation: 'Realisierte Wertschriftengewinne erscheinen als Ertrag (Finanzertrag) in der Erfolgsrechnung.', difficulty: 'easy' },
    { q: 'Was ist die Courtage?', opts: [{ text: 'Die jährliche Verwaltungsgebühr für Wertschriften', correct: false }, { text: 'Börsengebühr / Provision der Bank beim Kauf oder Verkauf von Wertschriften', correct: true }, { text: 'Die Dividende einer Aktie', correct: false }, { text: 'Der Nominalzins einer Obligation', correct: false }], explanation: 'Courtage = Bankprovision für die Ausführung von Börsenaufträgen. Sie erhöht die Anschaffungskosten beim Kauf und mindert den Erlös beim Verkauf.', difficulty: 'easy' },
    { q: 'Buchwert CHF 4 000 (nach Abwertung auf Kurswert). Kurs steigt auf CHF 5 000. Wie buchen wir die Aufwertung?', opts: [{ text: 'Keine Aufwertung möglich', correct: false }, { text: 'Wertschriften 1 000 / Wertschriftengewinn 1 000 (bis max. Anschaffungskosten)', correct: true }, { text: 'Wertschriftengewinn 1 000 / Kasse 1 000', correct: false }, { text: 'Wertschriften 5 000 / Eigenkapital 1 000', correct: false }], explanation: 'Nach einer Abwertung darf eine Aufwertung bis max. zu den ursprünglichen Anschaffungskosten vorgenommen werden. Buchung: Wertschriften / Wertschriftengewinn.', difficulty: 'hard' },
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
  console.log('\n✅ Wertschriften komplett eingefügt!')
}

run().catch(e => { console.error(e); process.exit(1) })
