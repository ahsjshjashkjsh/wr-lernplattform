import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function run() {
  const topicId = id()
  await client.query(`INSERT INTO "Topic" (id, slug, title, description, icon, color, "examType", category, "order", published, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
    [topicId, 'frw-fremde-waehrungen', 'Fremde Währungen', 'Wechselkurse, Kursdifferenzen und Fremdwährungsbuchungen', 'Calculator', 'emerald', 'both', 'frw', 5, false])

  // ─── CHAPTER 1: Grundlagen Fremdwährungen ────────────────────────────
  const ch1Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch1Id, 'grundlagen-fremdwaehrungen', 'Grundlagen Fremdwährungen', 'Wechselkurse und Umrechnungsprinzipien', topicId, 1, 'complete',
      'Schweizer Unternehmen buchen in CHF. Transaktionen in Fremdwährungen (EUR, USD usw.) müssen zum Kurs des Buchungsdatums in CHF umgerechnet werden. Der Umrechnungskurs beeinflusst den gebuchten Betrag direkt.'])

  const lg1 = [
    'Du kennst den Begriff Wechselkurs und kannst ihn anwenden.',
    'Du kannst Fremdwährungsbeträge in CHF umrechnen.',
    'Du verstehst die Begriffe Kauf- und Verkaufskurs (Brief/Geld).',
    'Du kannst Buchungssätze für Fremdwährungstransaktionen erstellen.',
    'Du verstehst, was Kursdifferenzen sind und wie sie entstehen.',
  ]
  for (let i = 0; i < lg1.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg1[i], ch1Id, i + 1])
  }

  const kt1 = [
    ['Wechselkurs', 'Preis einer Währung in einer anderen Währung. Z.B. EUR/CHF 0.95 bedeutet: 1 EUR = 0,95 CHF.'],
    ['Briefkurs (Verkaufskurs)', 'Kurs, zu dem die Bank Fremdwährung verkauft (wir kaufen). Immer etwas höher.'],
    ['Geldkurs (Kaufkurs)', 'Kurs, zu dem die Bank Fremdwährung kauft (wir verkaufen). Immer etwas tiefer.'],
    ['Mittelkurs', 'Durchschnitt aus Brief- und Geldkurs. Wird oft für Buchungszwecke verwendet.'],
    ['Kursdifferenz', 'Differenz zwischen dem Kurs bei Rechnungsstellung und dem Kurs bei Zahlung.'],
    ['Kursgewinn', 'Positive Kursdifferenz: Der CHF-Betrag bei Zahlung ist höher als bei Buchung.'],
    ['Kursverlust', 'Negative Kursdifferenz: Der CHF-Betrag bei Zahlung ist tiefer als bei Buchung.'],
    ['Fremdwährungskonto', 'Bankkonto, das auf eine andere Währung als CHF lautet.'],
    ['Stichtagskurs', 'Kurs am Jahresende (Bilanzstichtag) für die Bewertung offener Fremdwährungspositionen.'],
    ['Transaktionskurs', 'Kurs am Tag der Transaktion (Rechnung oder Zahlung).'],
  ]
  for (let i = 0; i < kt1.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt1[i][0], kt1[i][1], ch1Id, i + 1])
  }

  const cp1 = [
    'Buchhaltung immer in CHF — Fremdwährungen müssen umgerechnet werden.',
    'Umrechnung: CHF-Betrag = Fremdwährungsbetrag × Wechselkurs (bei EUR/CHF-Kurs).',
    'Buchungszeitpunkt: Kurs des Transaktionsdatums (Rechnungs- oder Zahldatum).',
    'Kursdifferenzen entstehen, wenn Kurs bei Zahlung ≠ Kurs bei Rechnungsstellung.',
    'Kursgewinn: Ertragskonto (z.B. "Kursgewinn Fremdwährung").',
    'Kursverlust: Aufwandskonto (z.B. "Kursverlust Fremdwährung").',
    'Am Jahresende offene Fremdwährungspositionen zum Stichtagskurs neu bewerten.',
    'Aufwertung Aktiven → Kursgewinn; Abwertung Aktiven → Kursverlust.',
  ]
  for (let i = 0; i < cp1.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp1[i], ch1Id, i + 1])
  }

  const ex1 = [
    'Warenverkauf USD: Rechnung USD 10 000 an US-Kunde. Kurs bei Rechnungsstellung: 1 USD = 0,90 CHF. Buchung: Debitoren USD 10 000 (= CHF 9 000) / Warenertrag 9 000.',
    'Zahlung mit Kursdifferenz: Zahlung USD 10 000 bei Kurs 0,92 CHF. Eingang CHF 9 200. Buchung: Kasse 9 200 / Debitoren 9 000 + Kursgewinn 200.',
    'Kursverlust: Eingang USD 10 000 bei Kurs 0,88 CHF = CHF 8 800. Buchung: Kasse 8 800 + Kursverlust 200 / Debitoren 9 000.',
  ]
  for (let i = 0; i < ex1.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex1[i], ch1Id, i + 1])
  }

  const q1 = [
    { q: 'Kurs EUR/CHF = 0,95. Wie viel sind EUR 5 000 in CHF?', opts: [{ text: 'CHF 5 263', correct: false }, { text: 'CHF 4 750', correct: true }, { text: 'CHF 5 000', correct: false }, { text: 'CHF 9 500', correct: false }], explanation: 'CHF = EUR × Kurs = 5 000 × 0,95 = 4 750.', difficulty: 'easy' },
    { q: 'Was ist ein Kursverlust?', opts: [{ text: 'Der Kurs ist gestiegen, was für uns vorteilhaft ist', correct: false }, { text: 'Der CHF-Betrag bei Zahlung ist tiefer als bei der Buchung der Forderung', correct: true }, { text: 'Wir haben zu viel für die Währung bezahlt', correct: false }, { text: 'Die Währung ist stärker geworden', correct: false }], explanation: 'Kursverlust bei Forderungen in Fremdwährung: Wenn der Kurs sinkt, erhalten wir beim Zahlungseingang weniger CHF als bei der Verbuchung der Forderung.', difficulty: 'medium' },
    { q: 'Wie wird ein Kursgewinn in der Erfolgsrechnung verbucht?', opts: [{ text: 'Als Aufwand', correct: false }, { text: 'Als Ertrag', correct: true }, { text: 'Im Eigenkapital', correct: false }, { text: 'Gar nicht', correct: false }], explanation: 'Kursgewinn = positives Ergebnis aus Währungsumrechnung. Er wird als Ertrag (Kursgewinn-Konto) in der ER verbucht.', difficulty: 'easy' },
    { q: 'Was ist der Stichtagskurs?', opts: [{ text: 'Der Kurs bei der ersten Transaktion des Jahres', correct: false }, { text: 'Der Kurs am Jahresende (Bilanzstichtag) für die Neubewertung offener Positionen', correct: true }, { text: 'Der Durchschnittskurs des ganzen Jahres', correct: false }, { text: 'Der Kurs bei der Rechnungsstellung', correct: false }], explanation: 'Am Jahresende müssen offene Fremdwährungspositionen (Debitoren, Kreditoren in FW) zum aktuellen Stichtagskurs bewertet werden.', difficulty: 'medium' },
    { q: 'Debitorenforderung EUR 2 000 gebucht bei Kurs 0,93. Zahlung bei Kurs 0,96. Was entsteht?', opts: [{ text: 'Kursverlust CHF 60', correct: false }, { text: 'Kursgewinn CHF 60', correct: true }, { text: 'Kein Effekt', correct: false }, { text: 'Mehrwertsteuer-Differenz', correct: false }], explanation: 'Gebuchte Forderung: 2 000 × 0,93 = 1 860. Eingang: 2 000 × 0,96 = 1 920. Differenz = 60 Kursgewinn.', difficulty: 'hard' },
  ]
  for (let i = 0; i < q1.length; i++) {
    const qId = id()
    await client.query(`INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, ch1Id, q1[i].q, q1[i].explanation, q1[i].difficulty, i + 1])
    for (let j = 0; j < q1[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q1[i].opts[j].text, q1[i].opts[j].correct, j + 1])
    }
  }
  console.log('✅ Chapter 1 inserted')

  // ─── CHAPTER 2: Fremdwährungen im Jahresabschluss ────────────────────
  const ch2Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch2Id, 'fremdwaehrungen-jahresabschluss', 'Fremdwährungen im Jahresabschluss', 'Neubewertung und Kursdifferenz-Buchungen', topicId, 2, 'complete',
      'Am Bilanzstichtag müssen alle offenen Fremdwährungspositionen (Debitoren, Kreditoren, Bankguthaben in FW) zum aktuellen Stichtagskurs neu bewertet werden. Entstehende Kursdifferenzen werden als Ertrag (Kursgewinn) oder Aufwand (Kursverlust) verbucht.'])

  const lg2 = [
    'Du kannst offene Fremdwährungspositionen zum Stichtagskurs neu bewerten.',
    'Du kannst die daraus entstehenden Kursdifferenzen korrekt buchen.',
    'Du verstehst die Auswirkungen auf Bilanz und Erfolgsrechnung.',
    'Du kennst das Niederstwertprinzip bei Fremdwährungsbewertung.',
  ]
  for (let i = 0; i < lg2.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg2[i], ch2Id, i + 1])
  }

  const kt2 = [
    ['Neubewertung', 'Anpassung von Fremdwährungspositionen an den aktuellen Kurs am Bilanzstichtag.'],
    ['Latenter Kursverlust', 'Noch nicht realisierter Kursverlust auf offenen Positionen, der bei Neubewertung entsteht.'],
    ['Latenter Kursgewinn', 'Noch nicht realisierter Kursgewinn auf offenen Positionen (nach OR nur bedingt realisierbar).'],
    ['Niederstwertprinzip', 'Aktiven müssen mit dem tieferen Wert (Buch- oder Marktwert) bewertet werden — Vorsichtsprinzip.'],
    ['Imparitätsprinzip', 'Nicht realisierte Verluste müssen sofort verbucht werden, Gewinne erst bei Realisierung (Vorsicht).'],
    ['Realisiertes Ergebnis', 'Kursdifferenz, die bei tatsächlicher Zahlung (Geldfluss) entsteht und abgerechnet ist.'],
  ]
  for (let i = 0; i < kt2.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt2[i][0], kt2[i][1], ch2Id, i + 1])
  }

  const cp2 = [
    'Neubewertung Debitoren FW: Stichtagskurs > Buchkurs → Kursgewinn; Stichtagskurs < Buchkurs → Kursverlust.',
    'Neubewertung Kreditoren FW: Stichtagskurs > Buchkurs → Kursverlust (wir müssen mehr zahlen).',
    'Kursgewinn-Buchung: Fremdwährungsposition / Kursgewinn.',
    'Kursverlust-Buchung: Kursverlust / Fremdwährungsposition.',
    'Im OR: Unrealisierte Verluste müssen verbucht werden; unrealisierte Gewinne nur wenn Prinzip konsequent angewendet.',
    'Imparitätsprinzip: Verluste immer sofort, Gewinne erst bei Realisierung (vorsichtiges Vorgehen).',
  ]
  for (let i = 0; i < cp2.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp2[i], ch2Id, i + 1])
  }

  const ex2 = [
    'Neubewertung Debitor: Offene Forderung EUR 10 000, Buchkurs 0,92 (CHF 9 200). Stichtagskurs 0,95 (CHF 9 500). Kursgewinn CHF 300. Buchung: Debitoren 300 / Kursgewinn 300.',
    'Neubewertung Kreditor: Schuld EUR 5 000, Buchkurs 0,93 (CHF 4 650). Stichtagskurs 0,97 (CHF 4 850). Kursverlust CHF 200. Buchung: Kursverlust 200 / Kreditoren 200.',
  ]
  for (let i = 0; i < ex2.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex2[i], ch2Id, i + 1])
  }

  const q2 = [
    { q: 'Debitor EUR 8 000 gebucht zu 0,91 CHF. Stichtagskurs 0,89 CHF. Was entsteht?', opts: [{ text: 'Kursgewinn CHF 160', correct: false }, { text: 'Kursverlust CHF 160', correct: true }, { text: 'Keine Buchung nötig', correct: false }, { text: 'Kursgewinn CHF 80', correct: false }], explanation: 'Buchwert: 8 000 × 0,91 = 7 280. Neuer Wert: 8 000 × 0,89 = 7 120. Kursverlust = 7 280 − 7 120 = 160. Buchung: Kursverlust 160 / Debitoren 160.', difficulty: 'hard' },
    { q: 'Was besagt das Imparitätsprinzip?', opts: [{ text: 'Gewinne und Verluste werden gleich behandelt', correct: false }, { text: 'Unrealisierte Verluste müssen sofort gebucht werden, Gewinne erst bei Realisierung', correct: true }, { text: 'Alle Kursdifferenzen werden am Jahresende gebucht', correct: false }, { text: 'Fremdwährungen dürfen nicht neu bewertet werden', correct: false }], explanation: 'Imparitätsprinzip (Vorsichtsprinzip): Drohende Verluste sofort verbuchen, aber Gewinne erst realisiert ausweisen.', difficulty: 'hard' },
    { q: 'Was passiert bei einer Neubewertung, wenn der Stichtagskurs des EUR gestiegen ist und wir eine Schuld in EUR haben?', opts: [{ text: 'Kursgewinn entsteht, weil EUR teurer ist', correct: false }, { text: 'Kursverlust entsteht, weil wir mehr CHF zahlen müssen', correct: true }, { text: 'Keine Auswirkung', correct: false }, { text: 'Die Schuld wird kleiner', correct: false }], explanation: 'Steigt der EUR-Kurs bei einer EUR-Schuld: Wir müssen mehr CHF aufwenden → Kursverlust (Aufwand).', difficulty: 'medium' },
    { q: 'Wie wird ein realisierter Kursgewinn bei Zahlungseingang gebucht?', opts: [{ text: 'Als Aufwand', correct: false }, { text: 'Als Ertrag (Kursgewinn-Ertragskonto)', correct: true }, { text: 'Direkt ins Eigenkapital', correct: false }, { text: 'Wird ignoriert', correct: false }], explanation: 'Realisierter Kursgewinn = Erlös aus günstigerer Wechselkursentwicklung. Er wird als Kursgewinn-Ertrag in der ER verbucht.', difficulty: 'easy' },
    { q: 'Wo erscheinen Kursgewinne und Kursverluste in der Jahresrechnung?', opts: [{ text: 'In der Bilanz als Eigenkapitalkorrektur', correct: false }, { text: 'In der Erfolgsrechnung (Ertrag bzw. Aufwand)', correct: true }, { text: 'Im Anhang, aber nicht in der ER', correct: false }, { text: 'Gar nicht', correct: false }], explanation: 'Kursdifferenzen beeinflussen den Erfolg und erscheinen in der Erfolgsrechnung als Kursgewinn (Ertrag) oder Kursverlust (Aufwand).', difficulty: 'easy' },
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
  console.log('\n✅ Fremde Währungen komplett eingefügt!')
}

run().catch(e => { console.error(e); process.exit(1) })
