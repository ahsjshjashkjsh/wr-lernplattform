import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function run() {
  const topicId = id()
  await client.query(`INSERT INTO "Topic" (id, slug, title, description, icon, color, "examType", category, "order", published, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
    [topicId, 'frw-mehrwertsteuer', 'Mehrwertsteuer', 'Vorsteuer, Umsatzsteuer und MWST-Abrechnung in der Buchhaltung', 'Calculator', 'emerald', 'both', 'frw', 3, false])

  // ─── CHAPTER 1: Grundlagen der MWST ─────────────────────────────────
  const ch1Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch1Id, 'grundlagen-mwst', 'Grundlagen der MWST', 'Steuersätze, Vorsteuer und Umsatzsteuer', topicId, 1, 'complete',
      'Die Mehrwertsteuer (MWST) ist eine Verbrauchssteuer, die in der Schweiz auf Lieferungen und Dienstleistungen erhoben wird. Unternehmen erheben MWST auf ihren Verkäufen (Umsatzsteuer) und können die bezahlte MWST auf Einkäufen (Vorsteuer) zurückfordern. Der Normalsatz beträgt 8,1 %, der Sondersatz 3,8 %, der reduzierte Satz 2,6 %.'])

  const lg1 = [
    'Du kennst die aktuellen MWST-Sätze in der Schweiz (Normal-, Sonder- und reduzierter Satz).',
    'Du verstehst den Unterschied zwischen Vorsteuer und Umsatzsteuer.',
    'Du kannst MWST-Beträge aus Bruttopreisen herausrechnen.',
    'Du kannst Buchungssätze für Einkäufe und Verkäufe mit MWST erstellen.',
    'Du verstehst das Prinzip der MWST-Abrechnung mit der Steuerverwaltung.',
  ]
  for (let i = 0; i < lg1.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg1[i], ch1Id, i + 1])
  }

  const kt1 = [
    ['Mehrwertsteuer (MWST)', 'Indirekte Steuer auf Lieferungen und Dienstleistungen in der Schweiz. Wird auf jeder Handelsstufe erhoben, aber nur der "Mehrwert" wird besteuert.'],
    ['Normalsatz', 'Allgemeiner MWST-Satz: 8,1 % auf die meisten Waren und Dienstleistungen (seit 01.01.2024).'],
    ['Sondersatz', 'Reduzierter Satz für Beherbergungsleistungen (Hotels): 3,8 %.'],
    ['Reduzierter Satz', 'Tieferer Satz für Lebensmittel, Bücher, Zeitungen, Medikamente: 2,6 %.'],
    ['Vorsteuer (Vorsteuerkonto)', 'MWST auf Einkäufen des Unternehmens. Kann von der Steuerschuld abgezogen werden. Aktivkonto.'],
    ['Umsatzsteuer (MWST-Schuld)', 'MWST, die das Unternehmen auf seinen Verkäufen erhebt und an den Staat abliefert. Passivkonto.'],
    ['Nettomethode', 'Buchung ohne MWST: Warenaufwand / Kreditoren (netto), Vorsteuer / Kreditoren separat.'],
    ['Bruttobetrag', 'Preis inkl. MWST (= Nettobetrag × (1 + Steuersatz)).'],
    ['Nettobetrag', 'Preis exkl. MWST. Grundlage für die Steuerberechnung.'],
    ['Abrechnungsperiode', 'Zeitraum (Quartal oder Semester), für den die MWST mit der Steuerverwaltung abgerechnet wird.'],
  ]
  for (let i = 0; i < kt1.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt1[i][0], kt1[i][1], ch1Id, i + 1])
  }

  const cp1 = [
    'Normalsatz Schweiz: 8,1 % (seit 2024). Sondersatz 3,8 %, Reduzierter Satz 2,6 %.',
    'Vorsteuer = MWST auf Einkäufen. Wird vom Staat zurückerstattet → Aktivkonto.',
    'Umsatzsteuer = MWST auf Verkäufen. Wird an den Staat abgeführt → Passivkonto.',
    'MWST herausrechnen (aus Brutto): Netto = Brutto / 1,081. MWST = Brutto − Netto.',
    'MWST aufrechnen (auf Netto): MWST = Netto × 8,1 %. Brutto = Netto + MWST.',
    'Zahlung an Steuerverwaltung: MWST-Schuld / Kasse (wenn Schuld > Vorsteuer).',
    'Rückerstattung: Kasse / Vorsteuer (wenn Vorsteuer > MWST-Schuld).',
    'Steuerumgehung ist verboten — korrekte Verbuchung ist Pflicht.',
  ]
  for (let i = 0; i < cp1.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp1[i], ch1Id, i + 1])
  }

  const ex1 = [
    'MWST aufrechnen: Nettobetrag CHF 1 000, Normalsatz 8,1 %. MWST = 81. Bruttobetrag = 1 081. Buchung Einkauf: Warenaufwand 1 000 + Vorsteuer 81 / Kreditoren 1 081.',
    'MWST herausrechnen: Bruttopreis CHF 2 162. Netto = 2 162 / 1,081 = 2 000. MWST = 162. Buchung Verkauf: Debitoren 2 162 / Warenertrag 2 000 + MWST-Schuld 162.',
    'MWST-Abrechnung Quartal: Vorsteuer 4 500, MWST-Schuld 8 200. Zahlung: MWST-Schuld 8 200 / Vorsteuer 4 500 + Kasse 3 700.',
  ]
  for (let i = 0; i < ex1.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex1[i], ch1Id, i + 1])
  }

  const q1 = [
    { q: 'Wie hoch ist der Normalsatz der MWST in der Schweiz seit 2024?', opts: [{ text: '7,7 %', correct: false }, { text: '8,1 %', correct: true }, { text: '10 %', correct: false }, { text: '2,6 %', correct: false }], explanation: 'Seit dem 01.01.2024 gilt in der Schweiz der Normalsatz von 8,1 % (vorher 7,7 %).', difficulty: 'easy' },
    { q: 'Was ist die Vorsteuer?', opts: [{ text: 'MWST auf Verkäufen, die an den Staat geht', correct: false }, { text: 'MWST auf Einkäufen, die zurückgefordert werden kann', correct: true }, { text: 'Ein Steuervorteil für Private', correct: false }, { text: 'Die Differenz zwischen Normal- und Sondersatz', correct: false }], explanation: 'Vorsteuer = MWST auf Einkäufen. Das Unternehmen kann sie von der MWST-Schuld abziehen und erhält sie vom Staat zurück.', difficulty: 'easy' },
    { q: 'Nettobetrag CHF 500, MWST-Satz 8,1 %. Wie hoch ist der Bruttobetrag?', opts: [{ text: 'CHF 508,10', correct: false }, { text: 'CHF 540,50', correct: true }, { text: 'CHF 581,00', correct: false }, { text: 'CHF 513,00', correct: false }], explanation: 'Brutto = Netto × 1,081 = 500 × 1,081 = 540,50. MWST = 500 × 8,1 % = 40,50.', difficulty: 'medium' },
    { q: 'Welcher MWST-Satz gilt für Lebensmittel in der Schweiz?', opts: [{ text: '8,1 %', correct: false }, { text: '3,8 %', correct: false }, { text: '2,6 %', correct: true }, { text: '0 %', correct: false }], explanation: 'Lebensmittel, Bücher und Medikamente unterliegen dem reduzierten MWST-Satz von 2,6 %.', difficulty: 'easy' },
    { q: 'Wie wird die MWST-Zahlung an die Steuerverwaltung gebucht (MWST-Schuld 5 000, Vorsteuer 2 000)?', opts: [{ text: 'Kasse 3 000 / MWST-Schuld 3 000', correct: false }, { text: 'MWST-Schuld 5 000 / Vorsteuer 2 000 + Kasse 3 000', correct: true }, { text: 'Vorsteuer 2 000 / MWST-Schuld 2 000', correct: false }, { text: 'Kasse 5 000 / MWST-Schuld 5 000', correct: false }], explanation: 'Die MWST-Schuld wird aufgelöst, die Vorsteuer verrechnet. Netto-Zahlung = 5 000 − 2 000 = 3 000.', difficulty: 'hard' },
  ]
  for (let i = 0; i < q1.length; i++) {
    const qId = id()
    await client.query(`INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, ch1Id, q1[i].q, q1[i].explanation, q1[i].difficulty, i + 1])
    for (let j = 0; j < q1[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q1[i].opts[j].text, q1[i].opts[j].correct, j + 1])
    }
  }
  console.log('✅ Chapter 1 inserted')

  // ─── CHAPTER 2: MWST-Buchungen in der Praxis ─────────────────────────
  const ch2Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch2Id, 'mwst-buchungen-praxis', 'MWST-Buchungen in der Praxis', 'Einkauf, Verkauf und Abrechnung mit Belegen', topicId, 2, 'complete',
      'In der täglichen Buchhaltung muss die MWST bei jedem Einkauf und Verkauf korrekt erfasst werden. Die Nettomethode trennt Warenaufwand/-ertrag und MWST klar. Am Ende jeder Abrechnungsperiode wird die Abrechnung mit der Eidgenössischen Steuerverwaltung (ESTV) eingereicht.'])

  const lg2 = [
    'Du kannst Einkaufsbuchungen mit MWST (Nettomethode) korrekt durchführen.',
    'Du kannst Verkaufsbuchungen mit MWST (Nettomethode) korrekt durchführen.',
    'Du weisst, wie die MWST-Abrechnung am Quartalsende erstellt wird.',
    'Du kannst berechnen, ob ein Unternehmen MWST zahlen oder zurückfordern muss.',
  ]
  for (let i = 0; i < lg2.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg2[i], ch2Id, i + 1])
  }

  const kt2 = [
    ['ESTV', 'Eidgenössische Steuerverwaltung — Behörde, die die MWST-Abrechnungen entgegennimmt.'],
    ['Abrechnungsformular', 'Formular, das quartals- oder semesterweise bei der ESTV eingereicht wird.'],
    ['Steuerpflicht', 'Ab einem Jahresumsatz von CHF 100 000 ist ein Unternehmen in der Schweiz MWST-pflichtig.'],
    ['Steuerbefreiung', 'Bestimmte Leistungen sind von der MWST befreit (z.B. Arztleistungen, Bildung, Bankleistungen).'],
    ['Vorsteuerguthaben', 'Wenn die Vorsteuer die MWST-Schuld übersteigt, entsteht ein Guthaben gegenüber dem Staat.'],
    ['Effektive Abrechnungsmethode', 'Genaue Abrechnung: Vorsteuer und Umsatzsteuer werden einzeln erfasst und verrechnet.'],
    ['Saldosteuersatzmethode', 'Vereinfachte Abrechnungsmethode für KMU: Ein pauschaler Steuersatz wird auf dem Umsatz angewendet.'],
  ]
  for (let i = 0; i < kt2.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt2[i][0], kt2[i][1], ch2Id, i + 1])
  }

  const cp2 = [
    'MWST-Pflicht ab Jahresumsatz CHF 100 000 (Ausnahme: Kleinunternehmer, Steuerbefreiung).',
    'Nettomethode Einkauf: Warenaufwand (netto) + Vorsteuer / Kreditoren (brutto).',
    'Nettomethode Verkauf: Debitoren (brutto) / Warenertrag (netto) + MWST-Schuld.',
    'Quartalsabrechnung: MWST-Schuld − Vorsteuer = Zahllast (positiv = zahlen, negativ = Guthaben).',
    'Zahlung an ESTV: MWST-Schuld / Vorsteuer + Kasse (bei Zahllast).',
    'Guthaben von ESTV: Kasse / MWST-Schuld + Vorsteuer (bei Vorsteuerguthaben).',
    'Belege müssen MWST-Nummer des Lieferanten enthalten, damit Vorsteuer abzugsfähig ist.',
  ]
  for (let i = 0; i < cp2.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp2[i], ch2Id, i + 1])
  }

  const ex2 = [
    'Einkauf mit MWST: Warenrechnung CHF 10 000 netto + 8,1 % MWST = CHF 10 810 brutto. Buchung: Warenaufwand 10 000 + Vorsteuer 810 / Kreditoren 10 810.',
    'Verkauf mit MWST: Warenverkauf CHF 15 000 netto + 8,1 % MWST = CHF 16 215 brutto. Buchung: Debitoren 16 215 / Warenertrag 15 000 + MWST-Schuld 1 215.',
    'Quartalsabrechnung: Vorsteuer (Konto) CHF 3 200, MWST-Schuld (Konto) CHF 6 800. Zahllast = 6 800 − 3 200 = 3 600. Buchung: MWST-Schuld 6 800 / Vorsteuer 3 200 + Kasse 3 600.',
  ]
  for (let i = 0; i < ex2.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex2[i], ch2Id, i + 1])
  }

  const q2 = [
    { q: 'Ab welchem Jahresumsatz ist ein Unternehmen in der Schweiz MWST-pflichtig?', opts: [{ text: 'CHF 50 000', correct: false }, { text: 'CHF 100 000', correct: true }, { text: 'CHF 200 000', correct: false }, { text: 'CHF 500 000', correct: false }], explanation: 'Die Steuerpflicht beginnt ab einem Jahresumsatz von CHF 100 000 (Art. 10 MWSTG).', difficulty: 'easy' },
    { q: 'Warenverkauf netto CHF 20 000, MWST 8,1 %. Wie buchen wir den Verkauf (Nettomethode)?', opts: [{ text: 'Debitoren 20 000 / Warenertrag 20 000', correct: false }, { text: 'Debitoren 21 620 / Warenertrag 20 000 + MWST-Schuld 1 620', correct: true }, { text: 'Warenertrag 20 000 / Debitoren 21 620', correct: false }, { text: 'Debitoren 20 000 / MWST-Schuld 1 620', correct: false }], explanation: 'Nettomethode Verkauf: Debitoren (brutto) / Warenertrag (netto) + MWST-Schuld. Brutto = 20 000 × 1,081 = 21 620.', difficulty: 'medium' },
    { q: 'Vorsteuer CHF 2 000, MWST-Schuld CHF 5 500. Was überweisen wir an die ESTV?', opts: [{ text: 'CHF 5 500', correct: false }, { text: 'CHF 3 500', correct: true }, { text: 'CHF 2 000', correct: false }, { text: 'CHF 7 500', correct: false }], explanation: 'Zahllast = MWST-Schuld − Vorsteuer = 5 500 − 2 000 = 3 500. Nur der Nettobetrag wird überwiesen.', difficulty: 'medium' },
    { q: 'Welche Leistungen sind in der Schweiz von der MWST befreit?', opts: [{ text: 'Restaurantbesuche', correct: false }, { text: 'Hotelübernachtungen', correct: false }, { text: 'Arztleistungen und Bildungsleistungen', correct: true }, { text: 'Kleiderverkauf', correct: false }], explanation: 'Arztleistungen, Bildung, Sozialleistungen und bestimmte Finanzdienstleistungen sind von der MWST ausgenommen.', difficulty: 'medium' },
    { q: 'Was bedeutet "Vorsteuerguthaben"?', opts: [{ text: 'Das Unternehmen schuldet dem Staat mehr MWST als es bezahlt hat', correct: false }, { text: 'Die bezahlte Vorsteuer übersteigt die MWST-Schuld — der Staat erstattet den Betrag zurück', correct: true }, { text: 'Ein Konto für noch nicht fakturierte MWST', correct: false }, { text: 'Die MWST auf Eigenverbrauch', correct: false }], explanation: 'Vorsteuerguthaben entsteht, wenn Vorsteuer > MWST-Schuld. Oft bei Unternehmen mit hohen Investitionen oder Exporten.', difficulty: 'medium' },
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
  console.log('\n✅ Mehrwertsteuer komplett eingefügt!')
}

run().catch(e => { console.error(e); process.exit(1) })
