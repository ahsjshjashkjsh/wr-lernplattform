import pg from 'pg'
import { randomUUID } from 'crypto'

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

await client.connect()

const TOPIC_ID = 'bda8cf96-9a20-444f-9215-ad287b04a939'

// Helper
function id() { return randomUUID() }

async function run() {
  // ─── CHAPTER 1: Die Bilanz ────────────────────────────────────────────
  const ch1Id = id()
  await client.query(`
    INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
  `, [ch1Id, 'die-bilanz', 'Die Bilanz', 'Aufbau, Aktiven & Passiven', TOPIC_ID, 1, 'complete',
    'Die Bilanz ist eine Momentaufnahme des Vermögens und der Schulden eines Unternehmens zu einem bestimmten Stichtag. Sie zeigt auf der linken Seite die Aktiven (Mittelverwendung) und auf der rechten Seite die Passiven (Mittelherkunft). Aktiven = Passiven ist immer ausgeglichen.'])

  // Learning Goals ch1
  const lg1 = [
    'Du kannst erklären, was eine Bilanz ist und wozu sie dient.',
    'Du kennst den Aufbau der Bilanz (Aktiven / Passiven) und kannst die Seiten benennen.',
    'Du kannst Aktiven in Umlaufvermögen und Anlagevermögen einteilen.',
    'Du kannst Passiven in Fremdkapital und Eigenkapital einteilen.',
    'Du verstehst das Grundprinzip: Aktiven = Passiven (Bilanzgleichung).',
  ]
  for (let i = 0; i < lg1.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [id(), lg1[i], ch1Id, i + 1])
  }

  // Key Terms ch1
  const kt1 = [
    ['Bilanz', 'Gegenüberstellung von Aktiven (Vermögen) und Passiven (Kapital/Schulden) zu einem Stichtag. Aktiven = Passiven.'],
    ['Aktiven', 'Linke Seite der Bilanz. Zeigt, wie das Kapital eingesetzt (verwendet) wird. Besteht aus Umlaufvermögen (UV) und Anlagevermögen (AV).'],
    ['Passiven', 'Rechte Seite der Bilanz. Zeigt, woher das Kapital stammt. Besteht aus Fremdkapital (FK) und Eigenkapital (EK).'],
    ['Umlaufvermögen (UV)', 'Vermögensgegenstände, die kurzfristig (< 1 Jahr) zu Geld werden: Kasse, Post, Debitoren, Vorräte.'],
    ['Anlagevermögen (AV)', 'Langfristig gebundene Vermögensgegenstände: Maschinen, Fahrzeuge, Gebäude, Liegenschaften.'],
    ['Fremdkapital (FK)', 'Schulden des Unternehmens gegenüber Dritten: Kreditoren, Bankdarlehen, Hypotheken.'],
    ['Eigenkapital (EK)', 'Kapital der Eigentümer. EK = Aktiven − Fremdkapital. Enthält Aktienkapital und Gewinnreserven.'],
    ['Bilanzgleichung', 'Aktiven = Fremdkapital + Eigenkapital. Diese Gleichung ist immer erfüllt.'],
    ['Debitoren', 'Forderungen aus Lieferungen und Leistungen — Kunden, die noch nicht bezahlt haben.'],
    ['Kreditoren', 'Schulden aus Lieferungen und Leistungen — Lieferanten, denen man noch nicht bezahlt hat.'],
  ]
  for (let i = 0; i < kt1.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), kt1[i][0], kt1[i][1], ch1Id, i + 1])
  }

  // Core Points ch1
  const cp1 = [
    'Die Bilanz ist immer ausgeglichen: Aktiven = Passiven (Bilanzgleichung).',
    'Aktiven zeigen die Mittelverwendung — worin das Kapital steckt.',
    'Passiven zeigen die Mittelherkunft — woher das Kapital kommt.',
    'Umlaufvermögen (UV): kurzfristig verfügbar (Kasse, Debitoren, Vorräte).',
    'Anlagevermögen (AV): langfristig gebunden (Maschinen, Gebäude).',
    'Fremdkapital (FK): kurzfristige Schulden (Kreditoren) + langfristige Schulden (Bankdarlehen).',
    'Eigenkapital (EK) = Aktiven − Fremdkapital. Positives EK = gesundes Unternehmen.',
    'Steigende Schulden bei gleichen Aktiven → sinkendes Eigenkapital.',
  ]
  for (let i = 0; i < cp1.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [id(), cp1[i], ch1Id, i + 1])
  }

  // Examples ch1
  const ex1 = [
    'Beispiel Bilanz: Aktiven: Kasse 5 000, Debitoren 20 000, Vorräte 30 000, Maschinen 100 000 = Total Aktiven 155 000. Passiven: Kreditoren 25 000, Bankdarlehen 80 000, Eigenkapital 50 000 = Total Passiven 155 000.',
    'Transaktion 1 — Kauf Maschine bar: Maschinen +100 000, Kasse −100 000. Bilanz bleibt ausgeglichen, nur Umschichtung auf der Aktivseite.',
    'Transaktion 2 — Bankdarlehen aufnehmen: Kasse +50 000, Bankdarlehen +50 000. Beide Seiten steigen um 50 000.',
    'Eigenkapital berechnen: Aktiven 200 000 − Fremdkapital 130 000 = Eigenkapital 70 000.',
  ]
  for (let i = 0; i < ex1.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [id(), ex1[i], ch1Id, i + 1])
  }

  // Quiz ch1
  const q1 = [
    {
      q: 'Was zeigt die linke Seite der Bilanz (Aktiven)?',
      opts: [
        { text: 'Woher das Kapital stammt (Mittelherkunft)', correct: false },
        { text: 'Wie das Kapital eingesetzt wird (Mittelverwendung)', correct: true },
        { text: 'Den Gewinn des Unternehmens', correct: false },
        { text: 'Die Schulden gegenüber der Bank', correct: false },
      ],
      explanation: 'Aktiven = Mittelverwendung: Sie zeigen, wie das Kapital im Unternehmen eingesetzt ist (Kasse, Maschinen, Vorräte usw.).',
      difficulty: 'easy',
    },
    {
      q: 'Ein Unternehmen hat Aktiven von CHF 300 000 und Fremdkapital von CHF 180 000. Wie hoch ist das Eigenkapital?',
      opts: [
        { text: 'CHF 480 000', correct: false },
        { text: 'CHF 120 000', correct: true },
        { text: 'CHF 180 000', correct: false },
        { text: 'CHF 300 000', correct: false },
      ],
      explanation: 'EK = Aktiven − Fremdkapital = 300 000 − 180 000 = 120 000.',
      difficulty: 'easy',
    },
    {
      q: 'Was gehört zum Umlaufvermögen?',
      opts: [
        { text: 'Maschinen und Fahrzeuge', correct: false },
        { text: 'Liegenschaften', correct: false },
        { text: 'Kasse, Debitoren und Vorräte', correct: true },
        { text: 'Bankdarlehen', correct: false },
      ],
      explanation: 'Das Umlaufvermögen umfasst kurzfristig verfügbare Mittel wie Kasse, Postcheck, Debitoren und Vorräte.',
      difficulty: 'easy',
    },
    {
      q: 'Was passiert mit der Bilanz, wenn ein Unternehmen eine Maschine bar kauft?',
      opts: [
        { text: 'Aktiven steigen, Passiven steigen', correct: false },
        { text: 'Aktiven sinken, Eigenkapital sinkt', correct: false },
        { text: 'Nur Umschichtung auf der Aktivseite (Maschinen +, Kasse −)', correct: true },
        { text: 'Fremdkapital steigt', correct: false },
      ],
      explanation: 'Beim Barkauf einer Maschine verschiebt sich nur das Umlaufvermögen ins Anlagevermögen — die Bilanzsumme bleibt gleich.',
      difficulty: 'medium',
    },
    {
      q: 'Kreditoren sind...',
      opts: [
        { text: 'Kunden, die noch nicht bezahlt haben', correct: false },
        { text: 'Lieferanten, denen man noch nicht bezahlt hat', correct: true },
        { text: 'Langfristige Bankschulden', correct: false },
        { text: 'Teil des Eigenkapitals', correct: false },
      ],
      explanation: 'Kreditoren = Verbindlichkeiten gegenüber Lieferanten (Schulden aus Warenkäufen). Debitoren = Forderungen gegenüber Kunden.',
      difficulty: 'easy',
    },
  ]
  for (let i = 0; i < q1.length; i++) {
    const qId = id()
    await client.query(`
      INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order")
      VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)
    `, [qId, ch1Id, q1[i].q, q1[i].explanation, q1[i].difficulty, i + 1])
    for (let j = 0; j < q1[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q1[i].opts[j].text, q1[i].opts[j].correct, j + 1])
    }
  }

  console.log('✅ Chapter 1 (Die Bilanz) inserted')

  // ─── CHAPTER 2: Die Erfolgsrechnung ──────────────────────────────────
  const ch2Id = id()
  await client.query(`
    INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
  `, [ch2Id, 'die-erfolgsrechnung', 'Die Erfolgsrechnung', 'Ertrag, Aufwand & Ergebnis', TOPIC_ID, 2, 'complete',
    'Die Erfolgsrechnung (ER) zeigt, ob ein Unternehmen in einer Periode einen Gewinn oder Verlust erwirtschaftet hat. Sie gegenüberstellt alle Erträge (Einnahmen) und Aufwendungen (Ausgaben) der Periode. Ertrag > Aufwand = Gewinn; Ertrag < Aufwand = Verlust.'])

  // Learning Goals ch2
  const lg2 = [
    'Du kannst erklären, was eine Erfolgsrechnung ist und wozu sie dient.',
    'Du verstehst den Unterschied zwischen Ertrag und Aufwand.',
    'Du kannst Gewinn und Verlust berechnen.',
    'Du kennst typische Ertrags- und Aufwandskonten.',
    'Du kannst die Erfolgsrechnung in Staffelform lesen.',
  ]
  for (let i = 0; i < lg2.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [id(), lg2[i], ch2Id, i + 1])
  }

  // Key Terms ch2
  const kt2 = [
    ['Erfolgsrechnung (ER)', 'Übersicht über alle Erträge und Aufwände einer Periode. Ergebnis: Gewinn oder Verlust.'],
    ['Ertrag', 'Einnahmen des Unternehmens aus dem Verkauf von Waren/Dienstleistungen sowie sonstige Einkünfte.'],
    ['Aufwand', 'Kosten und Ausgaben, die das Unternehmen in der Periode hatte (Löhne, Miete, Materialkosten usw.).'],
    ['Gewinn', 'Ertrag > Aufwand. Positives Ergebnis — das Unternehmen hat mehr eingenommen als ausgegeben.'],
    ['Verlust', 'Aufwand > Ertrag. Negatives Ergebnis — das Unternehmen hat mehr ausgegeben als eingenommen.'],
    ['Warenertrag', 'Erlöse aus dem Verkauf von Waren (Umsatz). Häufigster Ertrag im Handelsunternehmen.'],
    ['Warenaufwand', 'Kosten für eingekaufte Waren (Einstandspreis). Wird dem Warenertrag gegenübergestellt.'],
    ['Bruttogewinn (Rohertrag)', 'Warenertrag − Warenaufwand = Bruttogewinn. Zeigt die Marge auf den Waren.'],
    ['Personalaufwand', 'Löhne, Gehälter und Sozialversicherungsbeiträge des Unternehmens.'],
    ['Reingewinn', 'Endgültiger Gewinn nach Abzug aller Aufwände. Fliesst ins Eigenkapital der Bilanz.'],
  ]
  for (let i = 0; i < kt2.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), kt2[i][0], kt2[i][1], ch2Id, i + 1])
  }

  // Core Points ch2
  const cp2 = [
    'Erfolgsrechnung = Ertrag − Aufwand = Gewinn oder Verlust.',
    'Ertrag: Einnahmen aus Geschäftstätigkeit (Umsatz, Zinsertrag usw.).',
    'Aufwand: Kosten der Periode (Löhne, Miete, Abschreibungen, Warenaufwand).',
    'Gewinn erhöht das Eigenkapital in der Bilanz.',
    'Verlust vermindert das Eigenkapital in der Bilanz.',
    'Bruttogewinn = Warenertrag − Warenaufwand (Marge auf dem Warenverkauf).',
    'Reingewinn = Bruttogewinn − alle übrigen Aufwände.',
    'Die Erfolgsrechnung deckt eine Periode ab (z.B. ein Geschäftsjahr), die Bilanz ist ein Stichtag.',
  ]
  for (let i = 0; i < cp2.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [id(), cp2[i], ch2Id, i + 1])
  }

  // Examples ch2
  const ex2 = [
    'Staffel-ER: Warenertrag 200 000 − Warenaufwand 120 000 = Bruttogewinn 80 000. − Personalaufwand 40 000 − Raumaufwand 12 000 − Abschreibungen 8 000 = Reingewinn 20 000.',
    'Verlustbeispiel: Ertrag 150 000 − Aufwand 180 000 = Verlust −30 000. Das Eigenkapital sinkt um 30 000.',
    'Marge berechnen: Einkaufspreis CHF 60, Verkaufspreis CHF 100. Bruttogewinn = 40. Marge = 40 / 100 = 40 %.',
  ]
  for (let i = 0; i < ex2.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [id(), ex2[i], ch2Id, i + 1])
  }

  // Quiz ch2
  const q2 = [
    {
      q: 'Was ist das Ergebnis der Erfolgsrechnung, wenn der Ertrag CHF 250 000 und der Aufwand CHF 210 000 beträgt?',
      opts: [
        { text: 'Verlust von CHF 40 000', correct: false },
        { text: 'Gewinn von CHF 40 000', correct: true },
        { text: 'Gewinn von CHF 460 000', correct: false },
        { text: 'Verlust von CHF 210 000', correct: false },
      ],
      explanation: 'Gewinn = Ertrag − Aufwand = 250 000 − 210 000 = 40 000. Da Ertrag > Aufwand, ist das Ergebnis ein Gewinn.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist der Bruttogewinn (Rohertrag)?',
      opts: [
        { text: 'Ertrag minus alle Aufwände', correct: false },
        { text: 'Warenertrag minus Warenaufwand', correct: true },
        { text: 'Umsatz minus Personalaufwand', correct: false },
        { text: 'Reingewinn plus Steuern', correct: false },
      ],
      explanation: 'Bruttogewinn = Warenertrag − Warenaufwand. Er zeigt die rohe Marge, bevor andere Aufwände (Löhne, Miete) abgezogen werden.',
      difficulty: 'easy',
    },
    {
      q: 'Was passiert mit dem Eigenkapital, wenn das Unternehmen einen Verlust macht?',
      opts: [
        { text: 'Eigenkapital steigt', correct: false },
        { text: 'Eigenkapital bleibt gleich', correct: false },
        { text: 'Eigenkapital sinkt', correct: true },
        { text: 'Fremdkapital sinkt', correct: false },
      ],
      explanation: 'Ein Verlust vermindert das Eigenkapital, weil das Unternehmen mehr ausgegeben als eingenommen hat.',
      difficulty: 'easy',
    },
    {
      q: 'Ein Unternehmen kauft Waren für CHF 80 000 ein und verkauft sie für CHF 130 000. Der Personalaufwand beträgt CHF 35 000. Wie hoch ist der Reingewinn?',
      opts: [
        { text: 'CHF 50 000', correct: false },
        { text: 'CHF 15 000', correct: true },
        { text: 'CHF 95 000', correct: false },
        { text: 'CHF 45 000', correct: false },
      ],
      explanation: 'Bruttogewinn = 130 000 − 80 000 = 50 000. Reingewinn = 50 000 − 35 000 = 15 000.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist der Unterschied zwischen Bilanz und Erfolgsrechnung?',
      opts: [
        { text: 'Die Bilanz zeigt Gewinne, die ER zeigt Schulden', correct: false },
        { text: 'Die Bilanz ist ein Stichtag (Momentaufnahme), die ER deckt eine Periode ab', correct: true },
        { text: 'Beide zeigen dasselbe, aber in verschiedenen Formaten', correct: false },
        { text: 'Die ER ist für grosse Unternehmen, die Bilanz für kleine', correct: false },
      ],
      explanation: 'Die Bilanz ist eine Momentaufnahme zu einem bestimmten Datum. Die Erfolgsrechnung zeigt den Erfolg über eine Periode (z.B. 1 Jahr).',
      difficulty: 'medium',
    },
  ]
  for (let i = 0; i < q2.length; i++) {
    const qId = id()
    await client.query(`
      INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order")
      VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)
    `, [qId, ch2Id, q2[i].q, q2[i].explanation, q2[i].difficulty, i + 1])
    for (let j = 0; j < q2[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q2[i].opts[j].text, q2[i].opts[j].correct, j + 1])
    }
  }

  console.log('✅ Chapter 2 (Die Erfolgsrechnung) inserted')

  // ─── CHAPTER 3: Zusammenhang Bilanz & ER ─────────────────────────────
  const ch3Id = id()
  await client.query(`
    INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
  `, [ch3Id, 'zusammenhang-bilanz-er', 'Zusammenhang Bilanz & Erfolgsrechnung', 'Wie Gewinn/Verlust die Bilanz verändert', TOPIC_ID, 3, 'complete',
    'Bilanz und Erfolgsrechnung sind eng verknüpft: Der Reingewinn aus der Erfolgsrechnung fliesst als Erhöhung des Eigenkapitals in die Schlussbilanz. Ein Verlust vermindert das Eigenkapital. Die Eröffnungsbilanz des nächsten Jahres entspricht der Schlussbilanz des Vorjahres.'])

  // Learning Goals ch3
  const lg3 = [
    'Du kannst erklären, wie Gewinn/Verlust das Eigenkapital in der Bilanz beeinflusst.',
    'Du verstehst den Kreislauf: Eröffnungsbilanz → Erfolgsrechnung → Schlussbilanz.',
    'Du kannst eine einfache Schlussbilanz nach einem Geschäftsjahr aufstellen.',
    'Du kennst den Begriff "Gewinnvortrag" und "Verlustvortrag".',
  ]
  for (let i = 0; i < lg3.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [id(), lg3[i], ch3Id, i + 1])
  }

  // Key Terms ch3
  const kt3 = [
    ['Eröffnungsbilanz', 'Bilanz zu Beginn des Geschäftsjahres. Entspricht der Schlussbilanz des Vorjahres.'],
    ['Schlussbilanz', 'Bilanz am Ende des Geschäftsjahres nach Berücksichtigung von Gewinn oder Verlust.'],
    ['Gewinnvortrag', 'Nicht ausgeschütteter Gewinn, der ins nächste Jahr übertragen wird und das EK erhöht.'],
    ['Verlustvortrag', 'Aufgelaufener Verlust, der das Eigenkapital des nächsten Jahres vermindert.'],
    ['Gewinnausschüttung', 'Auszahlung des Gewinns an die Eigentümer (Dividende). Vermindert das EK und die Aktiven (Kasse).'],
    ['Buchungssatz', 'Gibt an, welches Konto debetiert (links) und welches kredtiert (rechts) wird. Form: Soll / Haben.'],
  ]
  for (let i = 0; i < kt3.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), kt3[i][0], kt3[i][1], ch3Id, i + 1])
  }

  // Core Points ch3
  const cp3 = [
    'Reingewinn → Eigenkapital in der Schlussbilanz steigt.',
    'Verlust → Eigenkapital in der Schlussbilanz sinkt.',
    'Schlussbilanz Jahr 1 = Eröffnungsbilanz Jahr 2.',
    'Gewinnausschüttung: EK sinkt, Kasse sinkt (oder Verbindlichkeit gegenüber Aktionären).',
    'Die Bilanzsumme ändert sich durch einen Gewinn: Aktiven steigen, EK steigt.',
    'Ohne Ausschüttung akkumuliert der Gewinn als "Gewinnreserven" im EK.',
  ]
  for (let i = 0; i < cp3.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [id(), cp3[i], ch3Id, i + 1])
  }

  // Examples ch3
  const ex3 = [
    'Eröffnungsbilanz: Aktiven 200 000 | FK 120 000, EK 80 000. Jahresgewinn (aus ER) = 25 000. Schlussbilanz: Aktiven 225 000 | FK 120 000, EK 105 000.',
    'Verlustjahr: EK sinkt von 80 000 auf 50 000 nach einem Verlust von 30 000. Aktiven sinken ebenfalls.',
    'Gewinnausschüttung CHF 10 000: Kasse −10 000 (Aktiven), EK −10 000 (Passiven). Bilanzsumme sinkt um 10 000.',
  ]
  for (let i = 0; i < ex3.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [id(), ex3[i], ch3Id, i + 1])
  }

  // Quiz ch3
  const q3 = [
    {
      q: 'Was passiert mit dem Eigenkapital in der Schlussbilanz, wenn die Erfolgsrechnung einen Gewinn von CHF 30 000 ausweist?',
      opts: [
        { text: 'EK bleibt gleich', correct: false },
        { text: 'EK steigt um CHF 30 000', correct: true },
        { text: 'EK sinkt um CHF 30 000', correct: false },
        { text: 'Fremdkapital steigt um CHF 30 000', correct: false },
      ],
      explanation: 'Der Reingewinn fliesst ins Eigenkapital — er erhöht die Gewinnreserven und damit das EK.',
      difficulty: 'easy',
    },
    {
      q: 'Was ist die Eröffnungsbilanz?',
      opts: [
        { text: 'Die erste Bilanz, die ein Unternehmen je erstellt hat', correct: false },
        { text: 'Die Bilanz zu Beginn des Geschäftsjahres (= Schlussbilanz des Vorjahres)', correct: true },
        { text: 'Eine Bilanz ohne Eigenkapital', correct: false },
        { text: 'Eine Bilanz, die nur Aktiven zeigt', correct: false },
      ],
      explanation: 'Die Eröffnungsbilanz entspricht immer der Schlussbilanz des Vorjahres — sie ist der Ausgangspunkt für das neue Geschäftsjahr.',
      difficulty: 'easy',
    },
    {
      q: 'Ein Unternehmen schüttet CHF 15 000 Gewinn als Dividende aus. Welche Auswirkung hat das auf die Bilanz?',
      opts: [
        { text: 'Nur EK sinkt', correct: false },
        { text: 'Kasse sinkt und EK sinkt (Bilanzsumme sinkt)', correct: true },
        { text: 'Kasse steigt und EK sinkt', correct: false },
        { text: 'Keine Auswirkung auf die Bilanz', correct: false },
      ],
      explanation: 'Dividendenausschüttung: Kasse −15 000 (Aktiven sinken) und EK −15 000 (Passiven sinken). Die Bilanzsumme sinkt.',
      difficulty: 'medium',
    },
    {
      q: 'Was ist ein Gewinnvortrag?',
      opts: [
        { text: 'Ein Verlust, der vorgetragen wird', correct: false },
        { text: 'Nicht ausgeschütteter Gewinn, der ins nächste Jahr übertragen wird', correct: true },
        { text: 'Geld, das die Bank vorgestreckt hat', correct: false },
        { text: 'Die Marge auf dem Warenverkauf', correct: false },
      ],
      explanation: 'Gewinnvortrag = thesaurierter (einbehaltener) Gewinn. Er erhöht die Gewinnreserven im EK und wird ins nächste Jahr mitgenommen.',
      difficulty: 'medium',
    },
  ]
  for (let i = 0; i < q3.length; i++) {
    const qId = id()
    await client.query(`
      INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order")
      VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)
    `, [qId, ch3Id, q3[i].q, q3[i].explanation, q3[i].difficulty, i + 1])
    for (let j = 0; j < q3[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q3[i].opts[j].text, q3[i].opts[j].correct, j + 1])
    }
  }

  console.log('✅ Chapter 3 (Zusammenhang) inserted')

  await client.end()
  console.log('\n🎉 Alle 3 Kapitel für Bilanz & Erfolgsrechnung eingefügt!')
}

run().catch(e => { console.error(e); process.exit(1) })
