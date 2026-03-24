import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function run() {
  const topicId = id()
  await client.query(`INSERT INTO "Topic" (id, slug, title, description, icon, color, "examType", category, "order", published, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
    [topicId, 'frw-immobilien', 'Immobilien', 'Liegenschaften in der Buchhaltung: Kauf, Abschreibung und Verkauf', 'Calculator', 'emerald', 'both', 'frw', 7, false])

  // ─── CHAPTER 1: Kauf und Bewertung von Liegenschaften ────────────────
  const ch1Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch1Id, 'kauf-bewertung-liegenschaften', 'Kauf und Bewertung von Liegenschaften', 'Anschaffungskosten, Hypotheken und Buchungssätze', topicId, 1, 'complete',
      'Liegenschaften (Grundstücke, Gebäude) gehören zum Anlagevermögen und werden zu Anschaffungskosten aktiviert. Nebenkosten (Grundbuchgebühren, Handänderungssteuer, Notar) gehören zu den Anschaffungskosten. Liegenschaften werden meist mit Hypotheken finanziert.'])

  const lg1 = [
    'Du kannst den Kauf einer Liegenschaft korrekt buchen (inkl. Nebenkosten).',
    'Du verstehst den Begriff Hypothek und kannst Hypothekenbuchungen erstellen.',
    'Du kennst den Unterschied zwischen Grundstück und Gebäude.',
    'Du weisst, dass Grundstücke nicht abgeschrieben werden.',
    'Du kannst Liegenschaftserträge und -aufwände buchen.',
  ]
  for (let i = 0; i < lg1.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg1[i], ch1Id, i + 1])
  }

  const kt1 = [
    ['Liegenschaft', 'Grundstück mit oder ohne Gebäude. Teil des Anlagevermögens.'],
    ['Anschaffungskosten', 'Kaufpreis + alle Nebenkosten (Notar, Grundbuchgebühren, Handänderungssteuer, Maklergebühren).'],
    ['Hypothek', 'Langfristiges Darlehen, das mit dem Grundstück als Sicherheit besichert ist.'],
    ['Hypothekarzins', 'Zinsen auf der Hypothek. Aufwand für das Unternehmen (Zinsaufwand).'],
    ['Grundstück', 'Bodenfläche ohne Gebäude. Wird nicht abgeschrieben (kein Wertverzehr).'],
    ['Gebäude', 'Bauwerk auf dem Grundstück. Wird abgeschrieben (Wertverzehr über Nutzungsdauer).'],
    ['Handänderungssteuer', 'Kantonale Steuer beim Kauf eines Grundstücks. Gehört zu den Anschaffungskosten.'],
    ['Liegenschaftsaufwand', 'Kosten für Unterhalt, Reparaturen und Betrieb der Liegenschaft.'],
    ['Mieteinnahmen', 'Erträge aus Vermietung von Teilen der Liegenschaft.'],
    ['Aktivierung', 'Langfristiger Vermögenswert wird in der Bilanz als Aktivo erfasst (nicht sofort als Aufwand).'],
  ]
  for (let i = 0; i < kt1.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt1[i][0], kt1[i][1], ch1Id, i + 1])
  }

  const cp1 = [
    'Liegenschaft kaufen: Liegenschaft (Aktivum) / Kasse + Hypothek (Passivum).',
    'Nebenkosten (Notar, Handänderungssteuer) werden zum Kaufpreis addiert (Anschaffungskosten).',
    'Grundstück: kein Abschreibungsbedarf (unvergänglicher Wert).',
    'Gebäude: wird über Nutzungsdauer abgeschrieben (z.B. 2 % p.a. linear).',
    'Hypothekarzins: Zinsaufwand / Kasse oder Verbindlichkeit.',
    'Mieteinnahmen: Kasse / Mietertrag.',
    'Liegenschaftsunterhalt: Liegenschaftsaufwand / Kasse.',
    'Bilanziell: Liegenschaft unter "Sachanlagen" im Anlagevermögen.',
  ]
  for (let i = 0; i < cp1.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp1[i], ch1Id, i + 1])
  }

  const ex1 = [
    'Liegenschaftskauf: Kaufpreis CHF 800 000 + Notar CHF 5 000 + Handänderungssteuer CHF 15 000 = Anschaffungskosten CHF 820 000. Finanzierung: CHF 200 000 bar + CHF 620 000 Hypothek. Buchung: Liegenschaft 820 000 / Kasse 200 000 + Hypothek 620 000.',
    'Hypothekarzins: Jahreszins 1,5 % auf CHF 600 000 = CHF 9 000. Buchung: Zinsaufwand 9 000 / Kasse 9 000.',
    'Mieteinnahmen: Monatliche Miete CHF 4 500. Jahresbuchung: Kasse 54 000 / Mietertrag 54 000.',
  ]
  for (let i = 0; i < ex1.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex1[i], ch1Id, i + 1])
  }

  const q1 = [
    { q: 'Gehört die Handänderungssteuer beim Kauf einer Liegenschaft zu den Anschaffungskosten?', opts: [{ text: 'Nein, sie wird sofort als Aufwand verbucht', correct: false }, { text: 'Ja, sie erhöht die Anschaffungskosten der Liegenschaft', correct: true }, { text: 'Nein, sie wird im Eigenkapital abgezogen', correct: false }, { text: 'Nein, sie ist irrelevant', correct: false }], explanation: 'Alle Nebenkosten beim Kauf (Notar, Handänderungssteuer, Makler, Grundbuchgebühren) gehören zu den Anschaffungskosten und werden mit dem Kaufpreis aktiviert.', difficulty: 'medium' },
    { q: 'Warum wird ein Grundstück nicht abgeschrieben?', opts: [{ text: 'Weil es zu teuer ist', correct: false }, { text: 'Weil Grundstücke keinem Wertverzehr unterliegen (unvergänglicher Wert)', correct: true }, { text: 'Weil das gesetzlich verboten ist', correct: false }, { text: 'Weil es kein Anlagevermögen ist', correct: false }], explanation: 'Grundstücke haben eine unbegrenzte Nutzungsdauer — sie verschleissen nicht. Deshalb keine Abschreibung. Gebäude hingegen schon.', difficulty: 'easy' },
    { q: 'Wie wird eine Hypothek in der Bilanz ausgewiesen?', opts: [{ text: 'Als Aktivum unter Umlaufvermögen', correct: false }, { text: 'Als Passivum (Fremdkapital) — langfristige Schuld', correct: true }, { text: 'Als Eigenkapital', correct: false }, { text: 'Als Aufwand in der ER', correct: false }], explanation: 'Hypothek = langfristiges Darlehen, gesichert durch das Grundstück. Sie ist eine Schuld (Fremdkapital) auf der Passivseite der Bilanz.', difficulty: 'easy' },
    { q: 'Liegenschaft: Kaufpreis CHF 500 000, Notar CHF 3 000, Handänderungssteuer CHF 10 000. Wie hoch sind die Anschaffungskosten?', opts: [{ text: 'CHF 500 000', correct: false }, { text: 'CHF 510 000', correct: false }, { text: 'CHF 513 000', correct: true }, { text: 'CHF 503 000', correct: false }], explanation: 'Anschaffungskosten = Kaufpreis + alle Nebenkosten = 500 000 + 3 000 + 10 000 = 513 000.', difficulty: 'medium' },
    { q: 'Was ist ein Hypothekarzins?', opts: [{ text: 'Zinsen, die der Hypothekarnehmer vom Staat erhält', correct: false }, { text: 'Zinsen auf dem Hypothekardarlehen — Aufwand für den Darlehensnehmer', correct: true }, { text: 'Mieteinnahmen aus der Liegenschaft', correct: false }, { text: 'Amortisation des Darlehens', correct: false }], explanation: 'Hypothekarzins = Preis für das geliehene Geld (Zinsen). Er ist ein Finanzaufwand und wird in der Erfolgsrechnung verbucht.', difficulty: 'easy' },
  ]
  for (let i = 0; i < q1.length; i++) {
    const qId = id()
    await client.query(`INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, ch1Id, q1[i].q, q1[i].explanation, q1[i].difficulty, i + 1])
    for (let j = 0; j < q1[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q1[i].opts[j].text, q1[i].opts[j].correct, j + 1])
    }
  }
  console.log('✅ Chapter 1 inserted')

  // ─── CHAPTER 2: Abschreibung und Verkauf von Liegenschaften ──────────
  const ch2Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch2Id, 'abschreibung-verkauf-liegenschaften', 'Abschreibung und Verkauf von Liegenschaften', 'Gebäudeabschreibung und Buchgewinn/-verlust beim Verkauf', topicId, 2, 'complete',
      'Gebäude werden linear über ihre Nutzungsdauer abgeschrieben (typisch 1,5–2 % p.a.). Beim Verkauf einer Liegenschaft entsteht ein Buchgewinn (Verkaufspreis > Buchwert) oder Buchverlust (Verkaufspreis < Buchwert). Buchgewinne unterliegen der Grundstückgewinnsteuer.'])

  const lg2 = [
    'Du kannst die jährliche Abschreibung auf einem Gebäude berechnen und buchen.',
    'Du kannst den Buchwert einer Liegenschaft nach mehreren Jahren ermitteln.',
    'Du kannst Buchgewinn und Buchverlust beim Verkauf einer Liegenschaft berechnen.',
    'Du kennst die steuerliche Behandlung des Grundstückgewinns.',
  ]
  for (let i = 0; i < lg2.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg2[i], ch2Id, i + 1])
  }

  const kt2 = [
    ['Buchwert', 'Anschaffungskosten minus kumulierte Abschreibungen. Wert der Liegenschaft in der Bilanz.'],
    ['Lineare Abschreibung', 'Gleichmässige Abschreibung pro Jahr (Anschaffungskosten / Nutzungsdauer).'],
    ['Buchgewinn', 'Verkaufspreis > Buchwert. Positiver Ertrag beim Verkauf der Liegenschaft.'],
    ['Buchverlust', 'Verkaufspreis < Buchwert. Negativer Effekt beim Verkauf der Liegenschaft.'],
    ['Grundstückgewinnsteuer', 'Kantonale Steuer auf dem realisierten Gewinn beim Verkauf einer Liegenschaft.'],
    ['Amortisation', 'Rückzahlung der Hypothek. Reduziert die Schuld, aber ist kein Aufwand.'],
  ]
  for (let i = 0; i < kt2.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt2[i][0], kt2[i][1], ch2Id, i + 1])
  }

  const cp2 = [
    'Gebäudeabschreibung: Abschreibungsaufwand / Kumulierte Abschreibungen (oder direkt Liegenschaft).',
    'Typischer Abschreibungssatz: 1,5–2 % p.a. linear auf Gebäude.',
    'Buchwert = Anschaffungskosten − Σ Abschreibungen.',
    'Verkauf Liegenschaft: Kasse / Liegenschaft (Buchwert) ± Buchgewinn / Buchverlust.',
    'Buchgewinn (Verkaufspreis > Buchwert): Kasse / Liegenschaft + Buchgewinn (Ertrag).',
    'Buchverlust (Verkaufspreis < Buchwert): Kasse + Buchverlust / Liegenschaft.',
    'Amortisation Hypothek: Hypothek / Kasse (keine Aufwandswirkung).',
  ]
  for (let i = 0; i < cp2.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp2[i], ch2Id, i + 1])
  }

  const ex2 = [
    'Abschreibung: Gebäude CHF 600 000, Abschreibungssatz 2 % p.a. Jährliche Abschreibung = 12 000. Buchung: Abschreibungsaufwand 12 000 / Liegenschaft 12 000. Nach 5 Jahren: Buchwert = 600 000 − 60 000 = 540 000.',
    'Verkauf mit Buchgewinn: Buchwert Liegenschaft CHF 540 000. Verkaufspreis CHF 650 000. Buchgewinn = 110 000. Buchung: Kasse 650 000 / Liegenschaft 540 000 + Buchgewinn 110 000.',
    'Amortisation: Hypothekenrückzahlung CHF 20 000. Buchung: Hypothek 20 000 / Kasse 20 000 (Schuld sinkt, Kasse sinkt).',
  ]
  for (let i = 0; i < ex2.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex2[i], ch2Id, i + 1])
  }

  const q2 = [
    { q: 'Gebäude CHF 400 000, Abschreibungssatz 2 %. Wie hoch ist der Buchwert nach 3 Jahren?', opts: [{ text: 'CHF 376 000', correct: true }, { text: 'CHF 392 000', correct: false }, { text: 'CHF 370 000', correct: false }, { text: 'CHF 400 000', correct: false }], explanation: 'Jährliche Abschreibung = 400 000 × 2 % = 8 000. Nach 3 Jahren: 3 × 8 000 = 24 000. Buchwert = 400 000 − 24 000 = 376 000.', difficulty: 'medium' },
    { q: 'Was ist ein Buchgewinn beim Liegenschaftsverkauf?', opts: [{ text: 'Wenn der Verkaufspreis kleiner als der Buchwert ist', correct: false }, { text: 'Wenn der Verkaufspreis grösser als der Buchwert ist', correct: true }, { text: 'Der Gewinn aus Mieteinnahmen', correct: false }, { text: 'Die Differenz zwischen Hypothek und Kaufpreis', correct: false }], explanation: 'Buchgewinn = Verkaufspreis − Buchwert (wenn positiv). Er wird als Ertrag in der Erfolgsrechnung verbucht.', difficulty: 'easy' },
    { q: 'Buchwert Liegenschaft CHF 300 000, Verkaufspreis CHF 270 000. Was entsteht?', opts: [{ text: 'Buchgewinn CHF 30 000', correct: false }, { text: 'Buchverlust CHF 30 000', correct: true }, { text: 'Kein Effekt', correct: false }, { text: 'Grundstückgewinnsteuer', correct: false }], explanation: 'Buchverlust = Buchwert − Verkaufspreis = 300 000 − 270 000 = 30 000. Der Aufwand wird in der ER verbucht.', difficulty: 'medium' },
    { q: 'Was ist die Amortisation einer Hypothek?', opts: [{ text: 'Abschreibung des Gebäudes', correct: false }, { text: 'Rückzahlung der Hypothekenschuld (kein Aufwand)', correct: true }, { text: 'Zahlung von Hypothekarzinsen', correct: false }, { text: 'Erhöhung der Hypothek', correct: false }], explanation: 'Amortisation = Tilgung/Rückzahlung der Hypothek. Sie reduziert die Schuld und den Kassenbestand, ist aber kein Aufwand.', difficulty: 'medium' },
    { q: 'Welcher Abschreibungssatz ist typisch für Gebäude?', opts: [{ text: '10–20 % p.a.', correct: false }, { text: '1,5–2 % p.a.', correct: true }, { text: '5 % p.a.', correct: false }, { text: '33 % p.a.', correct: false }], explanation: 'Gebäude haben eine sehr lange Nutzungsdauer (50+ Jahre). Typisch sind 1,5–2 % lineare Abschreibung pro Jahr.', difficulty: 'easy' },
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
  console.log('\n✅ Immobilien komplett eingefügt!')
}

run().catch(e => { console.error(e); process.exit(1) })
