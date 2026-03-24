import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function run() {
  const topicId = id()
  await client.query(`INSERT INTO "Topic" (id, slug, title, description, icon, color, "examType", category, "order", published, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
    [topicId, 'frw-loehne-gehaelter', 'Löhne und Gehälter', 'Lohnbuchhaltung, Sozialversicherungen und Buchungssätze', 'Calculator', 'emerald', 'both', 'frw', 4, false])

  // ─── CHAPTER 1: Lohnabrechnung und Sozialversicherungen ──────────────
  const ch1Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch1Id, 'lohnabrechnung-sozialversicherungen', 'Lohnabrechnung und Sozialversicherungen', 'Bruttolohn, Abzüge und Nettolohn', topicId, 1, 'complete',
      'Der Bruttolohn ist der vereinbarte Lohn vor Abzügen. Davon werden Sozialversicherungsbeiträge (AHV, IV, EO, ALV, NBU) sowie Quellensteuer abgezogen, um den Nettolohn zu erhalten. Der Arbeitgeber trägt zusätzliche Sozialversicherungskosten (AHV-AG-Anteil, BVG, UVG usw.).'])

  const lg1 = [
    'Du kennst den Unterschied zwischen Bruttolohn und Nettolohn.',
    'Du kennst die wichtigsten Sozialversicherungsabzüge (AHV, IV, EO, ALV, NBU).',
    'Du kannst eine einfache Lohnabrechnung erstellen.',
    'Du kannst die Buchungssätze für Lohnzahlung und Sozialversicherungen erstellen.',
    'Du verstehst den Unterschied zwischen Arbeitnehmer- und Arbeitgeberanteil.',
  ]
  for (let i = 0; i < lg1.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg1[i], ch1Id, i + 1])
  }

  const kt1 = [
    ['Bruttolohn', 'Vereinbarter Lohn vor Abzügen aller Sozialversicherungen und Steuern.'],
    ['Nettolohn', 'Auszahlbetrag nach Abzug aller Abzüge (Sozialversicherungen, Quellensteuer). Geht auf das Konto des Mitarbeitenden.'],
    ['AHV/IV/EO', 'Alters- und Hinterlassenenversicherung / Invalidenversicherung / Erwerbsersatzordnung. Gemeinsam rund 10,6 % des Bruttolohns (je hälftig AG und AN).'],
    ['ALV', 'Arbeitslosenversicherung: 2,2 % des Bruttolohns bis CHF 148 200 (je hälftig AG und AN, also 1,1 % je).'],
    ['NBU', 'Nichtberufsunfall-Versicherung. Prämie trägt allein der Arbeitnehmer.'],
    ['BU', 'Berufsunfall-Versicherung (SUVA). Prämie trägt allein der Arbeitgeber.'],
    ['BVG', 'Berufliche Vorsorge (Pensionskasse, 2. Säule). Prämie aufgeteilt nach Vorsorgeplan.'],
    ['Quellensteuer', 'Steuerabzug direkt am Lohn für ausländische Arbeitnehmer ohne Niederlassungsbewilligung.'],
    ['Lohnnebenkosten', 'Gesamtkosten für den Arbeitgeber: Bruttolohn + AG-Anteile der Sozialversicherungen.'],
    ['Personalaufwand', 'Konto in der Erfolgsrechnung, das Bruttolohn + AG-Sozialversicherungsanteile enthält.'],
  ]
  for (let i = 0; i < kt1.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt1[i][0], kt1[i][1], ch1Id, i + 1])
  }

  const cp1 = [
    'Bruttolohn − AN-Abzüge (AHV/IV/EO, ALV, NBU, BVG, QSt) = Nettolohn.',
    'Nettolohn wird dem Mitarbeitenden ausbezahlt (Kasse oder Bank).',
    'Arbeitgeberanteil (AHV/IV/EO, ALV, BU, BVG) = zusätzlicher Aufwand für den Betrieb.',
    'Buchungssatz Lohn: Personalaufwand / Kasse + Sozialversicherungsverbindlichkeiten.',
    'AG-Sozialversicherungen: Personalaufwand / Sozialversicherungsverbindlichkeiten.',
    'Überweisung SV-Beiträge: Sozialversicherungsverbindlichkeiten / Kasse.',
    'Lohnaufwand im Konto "Personalaufwand" (Aufwandskonto der ER).',
    'Jeder Mitarbeitende erhält monatlich einen Lohnausweis.',
  ]
  for (let i = 0; i < cp1.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp1[i], ch1Id, i + 1])
  }

  const ex1 = [
    'Lohnabrechnung: Bruttolohn CHF 6 000. AN-Abzüge: AHV/IV/EO 318, ALV 66, NBU 30, BVG 180 = total 594. Nettolohn = 6 000 − 594 = 5 406.',
    'Buchungssatz Lohnzahlung: Personalaufwand 6 000 / Kasse 5 406 + Sozialversicherungsverbindlichkeiten 594.',
    'AG-Anteil: AHV/IV/EO 318, ALV 66, BU 60, BVG 240 = total 684. Buchung: Personalaufwand 684 / Sozialversicherungsverbindlichkeiten 684. Gesamtlohnaufwand = 6 000 + 684 = 6 684.',
  ]
  for (let i = 0; i < ex1.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex1[i], ch1Id, i + 1])
  }

  const q1 = [
    { q: 'Was ist der Nettolohn?', opts: [{ text: 'Der Lohn vor Abzügen', correct: false }, { text: 'Der ausgezahlte Lohn nach Abzug aller Sozialversicherungen', correct: true }, { text: 'Der Lohn inkl. Arbeitgeberanteil', correct: false }, { text: 'Der jährliche Lohn', correct: false }], explanation: 'Nettolohn = Bruttolohn minus alle Arbeitnehmer-Abzüge (AHV, ALV, NBU, BVG usw.). Dieser Betrag wird dem Mitarbeitenden ausbezahlt.', difficulty: 'easy' },
    { q: 'Wer bezahlt die NBU-Prämie (Nichtberufsunfall)?', opts: [{ text: 'Je hälftig Arbeitgeber und Arbeitnehmer', correct: false }, { text: 'Nur der Arbeitgeber', correct: false }, { text: 'Nur der Arbeitnehmer', correct: true }, { text: 'Der Staat', correct: false }], explanation: 'Die NBU-Prämie wird allein vom Arbeitnehmer getragen. Die BU-Prämie (Berufsunfall) bezahlt der Arbeitgeber.', difficulty: 'medium' },
    { q: 'Bruttolohn CHF 5 000, AN-Abzüge CHF 500. Wie lautet der Buchungssatz für die Lohnzahlung?', opts: [{ text: 'Personalaufwand 5 000 / Kasse 5 000', correct: false }, { text: 'Personalaufwand 5 000 / Kasse 4 500 + Sozialversicherungsverbindlichkeiten 500', correct: true }, { text: 'Kasse 4 500 / Personalaufwand 4 500', correct: false }, { text: 'Sozialversicherungsverbindlichkeiten 500 / Kasse 500', correct: false }], explanation: 'Der Aufwand entspricht dem Bruttolohn. Die Differenz zwischen Brutto und Netto wird als SV-Verbindlichkeit (Schuld gegenüber den Kassen) ausgewiesen.', difficulty: 'medium' },
    { q: 'Was sind "Lohnnebenkosten"?', opts: [{ text: 'Nur der Nettolohn', correct: false }, { text: 'Bruttolohn plus Arbeitgeberanteile der Sozialversicherungen', correct: true }, { text: 'Nur die Arbeitnehmerbeiträge', correct: false }, { text: 'Kosten für Büromaterial', correct: false }], explanation: 'Lohnnebenkosten = Bruttolohn + AG-Anteile (AHV, ALV, BU, BVG). Sie zeigen die Gesamtkosten eines Mitarbeitenden für den Betrieb.', difficulty: 'medium' },
    { q: 'Wofür steht BVG?', opts: [{ text: 'Bundesgesetz über die Vertragsgestaltung', correct: false }, { text: 'Berufliche Vorsorge (Pensionskasse, 2. Säule)', correct: true }, { text: 'Betriebliche Versicherungsgesellschaft', correct: false }, { text: 'Bundesverwaltungsgesetz', correct: false }], explanation: 'BVG = Berufliche Vorsorge (Pensionskasse). Es ist die 2. Säule des Schweizer Vorsorgesystems und ist obligatorisch ab einem bestimmten Jahreslohn.', difficulty: 'easy' },
  ]
  for (let i = 0; i < q1.length; i++) {
    const qId = id()
    await client.query(`INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, ch1Id, q1[i].q, q1[i].explanation, q1[i].difficulty, i + 1])
    for (let j = 0; j < q1[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q1[i].opts[j].text, q1[i].opts[j].correct, j + 1])
    }
  }
  console.log('✅ Chapter 1 inserted')

  // ─── CHAPTER 2: Lohnbuchhaltung und Jahresabschluss ──────────────────
  const ch2Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch2Id, 'lohnbuchhaltung-jahresabschluss', 'Lohnbuchhaltung und Jahresabschluss', 'Ferienlohn, 13. Monatslohn und Rückstellungen', topicId, 2, 'complete',
      'Im Jahresabschluss müssen Lohnrückstellungen für noch nicht bezahlte Löhne, Ferienguthaben und den 13. Monatslohn gebildet werden. Diese Transitorischen Passiven stellen sicher, dass der Lohnaufwand korrekt der Periode zugerechnet wird.'])

  const lg2 = [
    'Du verstehst, warum Lohnrückstellungen gebildet werden.',
    'Du kannst Rückstellungen für Ferienguthaben und 13. Monatslohn buchen.',
    'Du kennst den Begriff "transitorische Passiven" im Lohnbereich.',
    'Du weisst, welche Lohnbestandteile in den Jahresabschluss einfliessen.',
  ]
  for (let i = 0; i < lg2.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg2[i], ch2Id, i + 1])
  }

  const kt2 = [
    ['Lohnrückstellung', 'Rückstellung für noch nicht ausbezahlte Löhne, Ferien oder den 13. Monatslohn am Jahresende.'],
    ['Ferienguthaben', 'Aufgelaufene, noch nicht bezogene Ferientage, die als Rückstellung bewertet werden.'],
    ['13. Monatslohn', 'Zusätzlicher Monatslohn (meist im Dezember). Falls anteilsmässig zu buchen: je 1/12 pro Monat.'],
    ['Transitorische Passiven', 'Noch nicht bezahlte Aufwendungen, die wirtschaftlich zur abgelaufenen Periode gehören (Rückstellungen).'],
    ['Lohnausweis', 'Jährliches Dokument für jeden Mitarbeitenden, das alle Lohnbestandteile und Abzüge ausweist.'],
    ['Quellensteuer-Abrechnung', 'Monatliche Abrechnung der Quellensteuer mit den kantonalen Steuerbehörden.'],
  ]
  for (let i = 0; i < kt2.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt2[i][0], kt2[i][1], ch2Id, i + 1])
  }

  const cp2 = [
    '13. Monatslohn monatlich abgrenzen: 1/12 des Bruttolohns als Rückstellung buchen.',
    'Buchung Rückstellung: Personalaufwand / Rückstellung für Löhne (transitorische Passiven).',
    'Auszahlung 13. Monatslohn: Rückstellung / Kasse (Rückstellung wird aufgelöst).',
    'Ferienguthaben: Für jeden Ferientag, der am Stichtag noch nicht bezogen ist, wird ein Tageswert rückgestellt.',
    'Rückstellungen erhöhen den Aufwand der laufenden Periode und sind steuerlich relevant.',
    'Jahresabschluss: Alle nicht ausbezahlten Lohnbestandteile erscheinen als Passiven (Schulden).',
  ]
  for (let i = 0; i < cp2.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp2[i], ch2Id, i + 1])
  }

  const ex2 = [
    '13. Monatslohn Rückstellung: Bruttolohn CHF 6 000/Monat. Jährliche Rückstellung 13. ML = 6 000. Monatliche Buchung: Personalaufwand 500 / Rückstellung 13. ML 500.',
    'Ferienguthaben Jahresende: Mitarbeitender hat 10 Ferientage nicht bezogen. Tageslohn = 6 000 / 21 = 285,70. Rückstellung = 10 × 285,70 = 2 857. Buchung: Personalaufwand 2 857 / Rückstellung Ferienguthaben 2 857.',
  ]
  for (let i = 0; i < ex2.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex2[i], ch2Id, i + 1])
  }

  const q2 = [
    { q: 'Warum wird für den 13. Monatslohn monatlich eine Rückstellung gebildet?', opts: [{ text: 'Weil der Arbeitgeber sparen möchte', correct: false }, { text: 'Um den Lohnaufwand periodengerecht der laufenden Periode zuzuordnen', correct: true }, { text: 'Weil das Gesetz es verbietet, den 13. ML sofort zu zahlen', correct: false }, { text: 'Um die Steuern zu sparen', correct: false }], explanation: 'Periodenabgrenzung: Der 13. ML wird im Dezember ausgezahlt, aber der Aufwand gehört zu allen 12 Monaten. Deshalb wird monatlich 1/12 zurückgestellt.', difficulty: 'medium' },
    { q: 'Wie lautet der Buchungssatz für die monatliche Rückstellung des 13. Monatslohns (CHF 500)?', opts: [{ text: 'Kasse / Personalaufwand 500', correct: false }, { text: 'Personalaufwand 500 / Rückstellung 13. ML 500', correct: true }, { text: 'Rückstellung 13. ML 500 / Kasse 500', correct: false }, { text: 'Personalaufwand 6 000 / Kasse 6 000', correct: false }], explanation: 'Rückstellungsbildung: Personalaufwand (Soll) / Rückstellung (Haben). Der Aufwand wird schon jetzt erfasst, die Zahlung erfolgt später.', difficulty: 'medium' },
    { q: 'Was sind "transitorische Passiven" im Lohnbereich?', opts: [{ text: 'Bereits bezahlte Löhne', correct: false }, { text: 'Noch nicht ausbezahlte Lohnbestandteile, die der abgelaufenen Periode zuzuordnen sind', correct: true }, { text: 'Vorschüsse an Mitarbeitende', correct: false }, { text: 'Guthaben auf dem Lohnkonto', correct: false }], explanation: 'Transitorische Passiven = noch nicht bezahlte Schulden der abgelaufenen Periode. Beispiele: Ferienguthaben, 13. ML, ausstehende Löhne.', difficulty: 'medium' },
    { q: 'Bruttolohn CHF 7 200 im Monat. Wie hoch ist die monatliche Rückstellung für den 13. Monatslohn?', opts: [{ text: 'CHF 720', correct: false }, { text: 'CHF 600', correct: true }, { text: 'CHF 7 200', correct: false }, { text: 'CHF 1 200', correct: false }], explanation: 'Monatliche Rückstellung = Bruttolohn / 12 = 7 200 / 12 = 600.', difficulty: 'easy' },
    { q: 'Wer trägt die BU-Prämie (Berufsunfall-Versicherung SUVA)?', opts: [{ text: 'Nur der Arbeitnehmer', correct: false }, { text: 'Nur der Arbeitgeber', correct: true }, { text: 'Je hälftig', correct: false }, { text: 'Der Staat', correct: false }], explanation: 'Die BU-Prämie (Berufsunfall) trägt allein der Arbeitgeber. Die NBU-Prämie (Nichtberufsunfall) trägt allein der Arbeitnehmer.', difficulty: 'easy' },
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
  console.log('\n✅ Löhne und Gehälter komplett eingefügt!')
}

run().catch(e => { console.error(e); process.exit(1) })
