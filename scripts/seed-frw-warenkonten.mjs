import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function run() {
  const topicId = id()
  await client.query(`INSERT INTO "Topic" (id, slug, title, description, icon, color, "examType", category, "order", published, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
    [topicId, 'frw-warenkonten', 'Warenkonten', 'Wareneingang, Warenausgang und Warenkonten in der doppelten Buchhaltung', 'Calculator', 'emerald', 'both', 'frw', 2, false])

  // ─── CHAPTER 1: Grundlagen der Warenkonten ───────────────────────────
  const ch1Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch1Id, 'grundlagen-warenkonten', 'Grundlagen der Warenkonten', 'Wareneingang, -ausgang und Lagerbestand', topicId, 1, 'complete',
      'Im Handelsunternehmen werden Warenbewegungen über spezielle Konten erfasst. Der Wareneingang (Einkauf) wird auf dem Warenaufwandskonto, der Warenausgang (Verkauf) auf dem Warenertragskonto gebucht. Der Unterschied ergibt den Bruttogewinn (Rohertrag).'])

  const lg1 = [
    'Du kannst erklären, welche Konten für Wareneinkauf und Warenverkauf verwendet werden.',
    'Du kennst die Buchungssätze für Wareneinkauf auf Kredit und bar.',
    'Du kennst die Buchungssätze für Warenverkauf auf Kredit und bar.',
    'Du kannst den Bruttogewinn (Rohertrag) berechnen.',
    'Du verstehst den Unterschied zwischen Warenaufwand und Warenertrag.',
  ]
  for (let i = 0; i < lg1.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg1[i], ch1Id, i + 1])
  }

  const kt1 = [
    ['Warenaufwand', 'Konto für die Kosten eingekaufter Waren (Einstandspreis). Aufwandskonto, steht in der Erfolgsrechnung auf der Aufwandseite.'],
    ['Warenertrag', 'Konto für die Erlöse aus dem Warenverkauf (Verkaufspreis). Ertragskonto in der Erfolgsrechnung.'],
    ['Bruttogewinn (Rohertrag)', 'Warenertrag minus Warenaufwand. Zeigt die rohe Marge vor Abzug der Betriebskosten.'],
    ['Kreditoren', 'Lieferanten, an die noch nicht bezahlt wurde. Schulden aus Wareneinkäufen auf Kredit.'],
    ['Debitoren', 'Kunden, die noch nicht bezahlt haben. Forderungen aus Warenverkäufen auf Kredit.'],
    ['Buchungssatz', 'Anweisung: Welches Konto wird im Soll (Debit) und welches im Haben (Kredit) gebucht?'],
    ['Soll (Debit)', 'Linke Seite eines Kontos. Aktiv- und Aufwandskonten steigen im Soll.'],
    ['Haben (Kredit)', 'Rechte Seite eines Kontos. Passiv- und Ertragskonten steigen im Haben.'],
    ['Einstandspreis', 'Preis, zu dem eine Ware eingekauft wird (ohne Marge). Grundlage des Warenaufwands.'],
    ['Verkaufspreis', 'Preis, zu dem eine Ware an Kunden verkauft wird. Grundlage des Warenertrags.'],
  ]
  for (let i = 0; i < kt1.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt1[i][0], kt1[i][1], ch1Id, i + 1])
  }

  const cp1 = [
    'Wareneinkauf auf Kredit: Warenaufwand (Soll) / Kreditoren (Haben).',
    'Wareneinkauf bar: Warenaufwand (Soll) / Kasse (Haben).',
    'Warenverkauf auf Kredit: Debitoren (Soll) / Warenertrag (Haben).',
    'Warenverkauf bar: Kasse (Soll) / Warenertrag (Haben).',
    'Bruttogewinn = Warenertrag − Warenaufwand.',
    'Warenaufwand ist ein Aufwandskonto (Debit-Saldo).',
    'Warenertrag ist ein Ertragskonto (Kredit-Saldo).',
    'Beide Konten werden am Jahresende über die Erfolgsrechnung abgeschlossen.',
  ]
  for (let i = 0; i < cp1.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp1[i], ch1Id, i + 1])
  }

  const ex1 = [
    'Wareneinkauf auf Kredit: Einkauf Waren CHF 50 000 bei Lieferant Müller AG auf Kredit. Buchungssatz: Warenaufwand 50 000 / Kreditoren 50 000.',
    'Warenverkauf auf Kredit: Verkauf Waren CHF 80 000 an Kunde Meier GmbH auf Kredit. Buchungssatz: Debitoren 80 000 / Warenertrag 80 000.',
    'Bruttogewinn berechnen: Warenertrag 180 000 − Warenaufwand 110 000 = Bruttogewinn 70 000. Marge = 70 000 / 180 000 = 38.9 %.',
  ]
  for (let i = 0; i < ex1.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex1[i], ch1Id, i + 1])
  }

  const q1 = [
    { q: 'Wie lautet der Buchungssatz für einen Wareneinkauf auf Kredit (CHF 30 000)?', opts: [{ text: 'Kasse / Warenaufwand', correct: false }, { text: 'Warenaufwand / Kreditoren', correct: true }, { text: 'Debitoren / Warenertrag', correct: false }, { text: 'Kreditoren / Warenaufwand', correct: false }], explanation: 'Wareneinkauf auf Kredit: Warenaufwand (Soll) / Kreditoren (Haben). Die Ware kommt ins Unternehmen, die Schuld gegenüber dem Lieferanten entsteht.', difficulty: 'easy' },
    { q: 'Wie lautet der Buchungssatz für einen Warenverkauf bar (CHF 20 000)?', opts: [{ text: 'Warenertrag / Kasse', correct: false }, { text: 'Kasse / Warenertrag', correct: true }, { text: 'Debitoren / Warenertrag', correct: false }, { text: 'Kasse / Warenaufwand', correct: false }], explanation: 'Warenverkauf bar: Kasse (Soll) / Warenertrag (Haben). Geld fliesst ins Unternehmen, Ertrag wird realisiert.', difficulty: 'easy' },
    { q: 'Warenertrag 200 000, Warenaufwand 140 000. Wie hoch ist der Bruttogewinn?', opts: [{ text: 'CHF 340 000', correct: false }, { text: 'CHF 140 000', correct: false }, { text: 'CHF 60 000', correct: true }, { text: 'CHF 200 000', correct: false }], explanation: 'Bruttogewinn = Warenertrag − Warenaufwand = 200 000 − 140 000 = 60 000.', difficulty: 'easy' },
    { q: 'Auf welcher Seite der Erfolgsrechnung erscheint der Warenaufwand?', opts: [{ text: 'Auf der Ertragsseite', correct: false }, { text: 'Auf der Aufwandseite', correct: true }, { text: 'In der Bilanz auf der Aktivseite', correct: false }, { text: 'Im Eigenkapital', correct: false }], explanation: 'Warenaufwand ist ein Aufwandskonto und erscheint deshalb auf der Aufwandseite der Erfolgsrechnung.', difficulty: 'easy' },
    { q: 'Ein Kunde kauft Waren für CHF 15 000 auf Kredit. Welches Konto wird im Soll gebucht?', opts: [{ text: 'Kreditoren', correct: false }, { text: 'Warenaufwand', correct: false }, { text: 'Debitoren', correct: true }, { text: 'Kasse', correct: false }], explanation: 'Warenverkauf auf Kredit: Debitoren (Soll) / Warenertrag (Haben). Die Forderung gegenüber dem Kunden entsteht.', difficulty: 'medium' },
  ]
  for (let i = 0; i < q1.length; i++) {
    const qId = id()
    await client.query(`INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, ch1Id, q1[i].q, q1[i].explanation, q1[i].difficulty, i + 1])
    for (let j = 0; j < q1[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q1[i].opts[j].text, q1[i].opts[j].correct, j + 1])
    }
  }
  console.log('✅ Chapter 1 inserted')

  // ─── CHAPTER 2: Rabatte, Skonti und Retouren ─────────────────────────
  const ch2Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch2Id, 'rabatte-skonti-retouren', 'Rabatte, Skonti und Retouren', 'Preisminderungen und Rücksendungen korrekt buchen', topicId, 2, 'complete',
      'Beim Warenkauf und -verkauf entstehen oft Preiskorrekturen: Rabatte (Mengenrabatt), Skonti (Zahlungsrabatt bei frühzeitiger Zahlung) und Retouren (Rücksendungen). Diese werden direkt auf den Waren- oder Debitorenkonten berichtigt.'])

  const lg2 = [
    'Du kennst den Unterschied zwischen Rabatt, Skonto und Retour.',
    'Du kannst Skonti beim Wareneinkauf korrekt buchen.',
    'Du kannst Skonti beim Warenverkauf korrekt buchen.',
    'Du kannst Retouren beim Einkauf und Verkauf buchen.',
    'Du kannst den Nettoeinstandspreis nach Abzug von Rabatten berechnen.',
  ]
  for (let i = 0; i < lg2.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg2[i], ch2Id, i + 1])
  }

  const kt2 = [
    ['Rabatt', 'Preisnachlass, der direkt auf der Rechnung gewährt wird (z.B. Mengenrabatt 10 %). Reduziert den Einstandspreis.'],
    ['Skonto', 'Zahlungsrabatt für frühzeitige Zahlung (z.B. 2 % bei Zahlung innert 10 Tagen). Wird beim Zahlen abgezogen.'],
    ['Retour / Rücksendung', 'Zurückgesandte Ware. Beim Einkauf: Warenaufwand sinkt. Beim Verkauf: Warenertrag sinkt.'],
    ['Debitorenverlust', 'Forderung, die nicht eingetrieben werden kann. Wird als Aufwand verbucht.'],
    ['Zahlungsbedingungen', 'Vereinbarte Fristen und Konditionen für Zahlung, z.B. "30 Tage netto, 10 Tage 2 % Skonto".'],
    ['Nettobetrag', 'Rechnungsbetrag nach Abzug aller Rabatte und Skonti.'],
    ['Bruttobetrag', 'Rechnungsbetrag vor Abzug von Rabatten/Skonti (Listenpreis).'],
    ['Gutschrift', 'Dokument, das eine Preiskorrektur zu Gunsten des Kunden (oder zu Lasten des Lieferanten) bestätigt.'],
  ]
  for (let i = 0; i < kt2.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt2[i][0], kt2[i][1], ch2Id, i + 1])
  }

  const cp2 = [
    'Skonto beim Einkauf (wir zahlen früh): Kreditoren / Kasse + Warenaufwand (Skonto vermindert Aufwand).',
    'Skonto beim Verkauf (Kunde zahlt früh): Kasse + Warenertrag / Debitoren (Skonto vermindert Ertrag).',
    'Retouren Einkauf: Kreditoren / Warenaufwand (Aufwand sinkt, Schuld sinkt).',
    'Retouren Verkauf: Warenertrag / Debitoren (Ertrag sinkt, Forderung sinkt).',
    'Rabatte werden direkt vom Einstandspreis abgezogen — sie erscheinen nicht separat.',
    'Skonti erscheinen je nach Methode als Aufwands- oder Ertragskorrektur.',
    'Ziel: Der gebuchte Warenaufwand entspricht dem tatsächlichen Einstandspreis (nach allen Abzügen).',
  ]
  for (let i = 0; i < cp2.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp2[i], ch2Id, i + 1])
  }

  const ex2 = [
    'Skonto beim Einkauf: Rechnung Kreditoren CHF 10 000, 2 % Skonto bei Zahlung innert 10 Tagen. Zahlung: Kreditoren 10 000 / Kasse 9 800 + Warenaufwand 200 (Skonto = Aufwandskorrektur).',
    'Retour beim Verkauf: Kunde schickt Waren CHF 5 000 zurück. Buchungssatz: Warenertrag 5 000 / Debitoren 5 000.',
    'Skonto beim Verkauf: Debitorenrechnung CHF 20 000, Kunde zahlt innert 10 Tagen mit 2 % Skonto. Zahlung: Kasse 19 600 + Warenertrag 400 / Debitoren 20 000.',
  ]
  for (let i = 0; i < ex2.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex2[i], ch2Id, i + 1])
  }

  const q2 = [
    { q: 'Ein Lieferant gewährt uns 2 % Skonto auf eine Rechnung von CHF 5 000. Wie hoch ist der Skontobetrag?', opts: [{ text: 'CHF 100', correct: true }, { text: 'CHF 50', correct: false }, { text: 'CHF 200', correct: false }, { text: 'CHF 500', correct: false }], explanation: '2 % von 5 000 = 100. Skonto = Rechnungsbetrag × Skontosatz.', difficulty: 'easy' },
    { q: 'Was ist der Unterschied zwischen Rabatt und Skonto?', opts: [{ text: 'Kein Unterschied, beides bedeutet Preisnachlass', correct: false }, { text: 'Rabatt ist ein sofortiger Preisnachlass; Skonto ist ein Zahlungsrabatt für frühzeitige Zahlung', correct: true }, { text: 'Skonto ist grösser als Rabatt', correct: false }, { text: 'Rabatt gilt nur beim Einkauf, Skonto nur beim Verkauf', correct: false }], explanation: 'Rabatt: Sofortiger Nachlass auf den Preis (z.B. Mengenrabatt). Skonto: Nachlass für frühzeitige Zahlung, steht in den Zahlungsbedingungen.', difficulty: 'medium' },
    { q: 'Wie buchen wir eine Warenrücksendung an den Lieferanten (CHF 3 000)?', opts: [{ text: 'Warenaufwand / Kreditoren', correct: false }, { text: 'Kreditoren / Warenaufwand', correct: true }, { text: 'Debitoren / Warenertrag', correct: false }, { text: 'Kasse / Kreditoren', correct: false }], explanation: 'Retouren Einkauf: Kreditoren (Soll) / Warenaufwand (Haben). Die Schuld sinkt, der Aufwand wird rückgängig gemacht.', difficulty: 'medium' },
    { q: 'Ein Kunde zahlt seine Rechnung von CHF 8 000 mit 2 % Skonto. Wie viel geht auf unser Konto ein?', opts: [{ text: 'CHF 8 000', correct: false }, { text: 'CHF 7 840', correct: true }, { text: 'CHF 7 200', correct: false }, { text: 'CHF 8 160', correct: false }], explanation: 'Skontobetrag = 8 000 × 2 % = 160. Zahlungseingang = 8 000 − 160 = 7 840.', difficulty: 'easy' },
    { q: 'Wo erscheint Skonto auf der Verkäuferseite in der Erfolgsrechnung?', opts: [{ text: 'Als Aufwand', correct: false }, { text: 'Als Minderung des Warenertrags', correct: true }, { text: 'Als Erhöhung des Warenaufwands', correct: false }, { text: 'Gar nicht, Skonto hat keinen Effekt', correct: false }], explanation: 'Gewährter Skonto vermindert den Warenertrag (Haben-Seite). Buchungssatz: Kasse + Warenertrag / Debitoren.', difficulty: 'medium' },
  ]
  for (let i = 0; i < q2.length; i++) {
    const qId = id()
    await client.query(`INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, ch2Id, q2[i].q, q2[i].explanation, q2[i].difficulty, i + 1])
    for (let j = 0; j < q2[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q2[i].opts[j].text, q2[i].opts[j].correct, j + 1])
    }
  }
  console.log('✅ Chapter 2 inserted')

  // ─── CHAPTER 3: Lagerbestand und Inventur ────────────────────────────
  const ch3Id = id()
  await client.query(`INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", summary, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [ch3Id, 'lagerbestand-inventur', 'Lagerbestand und Inventur', 'Warenbestand, Inventur und Lagerkorrekturen', topicId, 3, 'complete',
      'Am Jahresende wird der tatsächliche Warenbestand durch eine Inventur ermittelt. Abweichungen zwischen Buchbestand und Istbestand (Lagerdifferenzen) müssen korrigiert werden. Die Warenbestandsveränderung beeinflusst den Warenaufwand der Periode.'])

  const lg3 = [
    'Du verstehst den Begriff Inventur und weisst, wann sie durchgeführt wird.',
    'Du kannst Lagerdifferenzen (Schwund, Diebstahl) korrekt buchen.',
    'Du verstehst die Beziehung zwischen Anfangsbestand, Einkäufen, Verkäufen und Endbestand.',
    'Du kannst die Warenbestandsveränderung berechnen.',
  ]
  for (let i = 0; i < lg3.length; i++) {
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), lg3[i], ch3Id, i + 1])
  }

  const kt3 = [
    ['Inventur', 'Körperliche Bestandsaufnahme aller Waren am Jahresende. Ermittelt den Istbestand.'],
    ['Buchbestand', 'Rechnerischer Sollbestand laut Buchhaltung (Anfangsbestand + Einkäufe − Verkäufe).'],
    ['Istbestand', 'Tatsächlich vorhandene Menge laut Inventur (Zählen, Messen, Wiegen).'],
    ['Lagerdifferenz', 'Abweichung zwischen Buchbestand und Istbestand (Schwund, Diebstahl, Verderb).'],
    ['Warenbestandskonto', 'Aktivkonto, das den Wert des Lagerbestands ausweist. Steht in der Bilanz unter Umlaufvermögen.'],
    ['Anfangsbestand (AB)', 'Warenbestand zu Beginn der Periode (= Endbestand der Vorperiode).'],
    ['Endbestand (EB)', 'Warenbestand am Ende der Periode nach Inventur.'],
    ['Schwund', 'Unkontrollierter Warenverlust durch Verderb, Diebstahl, Verdunstung usw.'],
  ]
  for (let i = 0; i < kt3.length; i++) {
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), kt3[i][0], kt3[i][1], ch3Id, i + 1])
  }

  const cp3 = [
    'Inventurformel: AB + Einkäufe − Verkäufe = Buchbestand; Buchbestand − Istbestand = Differenz.',
    'Lagerdifferenz (Schwund): Warenaufwand / Warenbestand (Aufwand steigt, Bestand sinkt).',
    'Endbestand erscheint in der Bilanz als Aktivposten (Umlaufvermögen).',
    'Höherer Endbestand = weniger Warenaufwand in der Periode (und umgekehrt).',
    'Bestandserhöhung: Warenbestand / Warenaufwand (korrigiert den Aufwand nach unten).',
    'Bestandsminderung: Warenaufwand / Warenbestand (erhöht den Aufwand).',
  ]
  for (let i = 0; i < cp3.length; i++) {
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), cp3[i], ch3Id, i + 1])
  }

  const ex3 = [
    'Inventur: Buchbestand CHF 45 000, Istbestand laut Inventur CHF 43 000. Differenz CHF 2 000 = Schwund. Buchungssatz: Warenaufwand 2 000 / Warenbestand 2 000.',
    'Endbestand-Buchung: Anfangsbestand 30 000, Einkäufe 120 000, Inventur Endbestand 35 000. Warenaufwand der Periode = 30 000 + 120 000 − 35 000 = 115 000.',
  ]
  for (let i = 0; i < ex3.length; i++) {
    await client.query(`INSERT INTO "Example" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`, [id(), ex3[i], ch3Id, i + 1])
  }

  const q3 = [
    { q: 'Was ist der Zweck der Inventur?', opts: [{ text: 'Den Gewinn zu berechnen', correct: false }, { text: 'Den tatsächlichen Warenbestand zu ermitteln und mit dem Buchbestand abzugleichen', correct: true }, { text: 'Neue Waren zu bestellen', correct: false }, { text: 'Die Bilanz zu erstellen', correct: false }], explanation: 'Die Inventur ermittelt den Istbestand (körperliche Zählung). Abweichungen vom Buchbestand werden als Lagerdifferenz erfasst.', difficulty: 'easy' },
    { q: 'Buchbestand CHF 50 000, Istbestand CHF 47 000. Wie wird die Differenz gebucht?', opts: [{ text: 'Warenbestand / Warenaufwand CHF 3 000', correct: false }, { text: 'Warenaufwand / Warenbestand CHF 3 000', correct: true }, { text: 'Kasse / Warenbestand CHF 3 000', correct: false }, { text: 'Keine Buchung nötig', correct: false }], explanation: 'Schwund (Istbestand < Buchbestand): Warenaufwand (Soll) / Warenbestand (Haben). Der Bestand wird auf den tatsächlichen Wert reduziert.', difficulty: 'medium' },
    { q: 'Wo erscheint der Endbestand an Waren in der Jahresrechnung?', opts: [{ text: 'In der Erfolgsrechnung als Ertrag', correct: false }, { text: 'In der Bilanz als Aktivposten (Umlaufvermögen)', correct: true }, { text: 'Im Eigenkapital', correct: false }, { text: 'Im Fremdkapital', correct: false }], explanation: 'Warenbestand = Vermögenswert. Er gehört zum Umlaufvermögen auf der Aktivseite der Bilanz.', difficulty: 'easy' },
    { q: 'AB 20 000 + Einkäufe 80 000 − EB 25 000 = ?', opts: [{ text: 'Warenertrag CHF 75 000', correct: false }, { text: 'Warenaufwand CHF 75 000', correct: true }, { text: 'Bruttogewinn CHF 75 000', correct: false }, { text: 'Lagerbestand CHF 75 000', correct: false }], explanation: 'Warenaufwand der Periode = AB + Einkäufe − EB = 20 000 + 80 000 − 25 000 = 75 000.', difficulty: 'medium' },
    { q: 'Was bedeutet "Bestandserhöhung" beim Warenbestand?', opts: [{ text: 'Der Endbestand ist kleiner als der Anfangsbestand', correct: false }, { text: 'Der Endbestand ist grösser als der Anfangsbestand — der Warenaufwand sinkt', correct: true }, { text: 'Es wurden mehr Waren verkauft als eingekauft', correct: false }, { text: 'Die Inventur zeigt Schwund', correct: false }], explanation: 'Bestandserhöhung: EB > AB. Das bedeutet, ein Teil der eingekauften Waren wurde nicht verkauft — der Warenaufwand der Periode ist entsprechend tiefer.', difficulty: 'hard' },
  ]
  for (let i = 0; i < q3.length; i++) {
    const qId = id()
    await client.query(`INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, ch3Id, q3[i].q, q3[i].explanation, q3[i].difficulty, i + 1])
    for (let j = 0; j < q3[i].opts.length; j++) {
      await client.query(`INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q3[i].opts[j].text, q3[i].opts[j].correct, j + 1])
    }
  }
  console.log('✅ Chapter 3 inserted')

  await client.end()
  console.log('\n✅ Warenkonten komplett eingefügt!')
}

run().catch(e => { console.error(e); process.exit(1) })
