import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function upsertTopic(slug, title, description, examType, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,band,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'Globe','blue',$5,'frw','2',$6,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, "updatedAt"=NOW()`,
    [topicId, slug, title, description, examType, order]
  )
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function upsertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET title=EXCLUDED.title, subtitle=EXCLUDED.subtitle, summary=EXCLUDED.summary, "contentStatus"='complete', "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary]
  )
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function replaceGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1]
    )
}

async function replaceTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1]
    )
}

async function replacePoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1]
    )
}

async function replaceExamples(chId, examples) {
  await client.query(`DELETE FROM "Example" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < examples.length; i++)
    await client.query(
      `INSERT INTO "Example" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), examples[i], chId, i + 1]
    )
}

async function replaceQuiz(chId, questions) {
  // Delete options first (FK constraint), then questions
  await client.query(
    `DELETE FROM "QuizOption" WHERE "questionId" IN (SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1)`,
    [chId]
  )
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])

  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff || 'medium', i + 1]
    )
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j + 1]
      )
  }
}

// ══════════════════════════════════════════════════
// TOPIC: Verluste aus Forderungen
// ══════════════════════════════════════════════════
const tId = await upsertTopic(
  'frw-verluste-forderungen',
  'Verluste aus Forderungen',
  'Direkte Abschreibung, Wertberichtigung Forderungen und MWSt-Rückforderung bei Debitorenverlusten.',
  'abschluss',
  11
)

// ══════════════════════════════════════════════════
// KAPITEL 3: Verluste aus Forderungen
// ══════════════════════════════════════════════════
const ch = await upsertChapter(
  tId,
  'verluste-forderungen',
  'Verluste aus Forderungen',
  'Direkte Abschreibung, WB-Methode und MWSt-Rückforderung',
  1,
  `KREDITVERKEHR UND FORDERUNGSRISIKO — Forderungen aus Lieferungen und Leistungen entstehen, wenn ein Unternehmen auf Rechnung verkauft. Der Ertrag wird sofort erfasst, die Zahlung kann jedoch ausbleiben. Damit besteht ein Liquiditäts- und Erfolgsrisiko, das buchhalterisch korrekt abgebildet werden muss.

INKASSOPROZESS BEI ZAHLUNGSVERZUG — Bei ausbleibender Zahlung folgen üblicherweise mehrere Mahnungen (keine Buchung), anschliessend die Betreibung. Der Kostenvorschuss für das Betreibungsamt erhöht die Forderung (keine Aufwandbuchung). Im Konkursverfahren wird nur die Konkursdividende (z.B. 15%) überwiesen; der Rest ist definitiver Forderungsverlust.

ARTEN VON FORDERUNGSAUSFÄLLEN — Dubiose Forderung: Eingang unsicher (Schuldner in finanziellen Schwierigkeiten) → Wertberichtigung bilden. Uneinbringliche Forderung: Verlust definitiv (Konkurs, Nachlassvertrag, Verlustschein, Verjährung) → direkte Abschreibung.

METHODE 1 — DIREKTE ABSCHREIBUNG — Bei definitiv uneinbringlichen Forderungen ohne vorherige WB: Schritt 1: Verluste aus Forderungen / Forderungen L+L (Bruttobetrag inkl. MWSt). Schritt 2: MWSt-Verbindlichkeiten / Verluste aus Forderungen (Nettobetrag × MWSt-Satz). Netto-Verlust = Bruttobetrag − MWSt-Rückforderung. Beispiel: CHF 1 081 brutto (= 1 000 netto + 81 MWSt) → Netto-Verlust CHF 1 000.

METHODE 2 — INDIREKTE ABSCHREIBUNG (WB-METHODE) — Konto «WB Forderungen» (Minus-Aktivkonto / Korrekturposten zu Forderungen L+L, früher Delkredere). A) Einzelwertberichtigung (EWB): für konkret bekannte zweifelhafte Schuldner → Verluste aus Forderungen / WB Forderungen. B) Pauschalwertberichtigung (PWB): % auf verbleibenden Debitorenbestand nach Abzug EWB → Soll-WB berechnen, mit Ist-WB vergleichen, Differenz buchen. Erhöhung: Verluste aus Forderungen / WB Forderungen. Herabsetzung: WB Forderungen / Verluste aus Forderungen (Ertrag).

WENN WB-FORDERUNG DEFINITIV VERLOREN GEHT — Schritt 1: WB Forderungen / Forderungen L+L (soweit durch WB gedeckt). Schritt 2: Verluste aus Forderungen / Forderungen L+L (Restbetrag falls WB nicht reicht). Schritt 3: MWSt-Verbindlichkeiten / Verluste aus Forderungen (MWSt auf Nettobetrag zurückfordern).

ALTERNATIVE ERLEDIGUNGSFORMEN — Forderungen können auch erledigt werden durch: Übernahme eines Fahrzeugs (Fahrzeuge / Forderungen L+L), Übernahme von Mobiliar (Mobiliar / Forderungen L+L), Forderungsverzicht (Verluste aus Forderungen / Forderungen L+L), Übernahme von Handelswaren (Warenaufwand / Forderungen L+L), Umwandlung in ein Darlehen (Aktivdarlehen / Forderungen L+L).

NACHTRÄGLICHE ZAHLUNG ABGESCHRIEBENER FORDERUNGEN — Gleiche Periode: Storno des Verlustes (Bank / Verluste aus Forderungen). Spätere Periode: periodenfremder/ausserordentlicher Ertrag (Bank / A.o. Ertrag). Das Prinzip der periodengerechten Erfolgsabgrenzung ist massgebend.

BILANZAUSWEIS — Forderungen L+L brutto − WB Forderungen = Forderungen L+L netto. WB Forderungen erscheint als Minusposition bei den Aktiven (kein Fremdkapital). WB Forderungen ist ein ruhendes Konto: Es wird nur am Jahresende angepasst, nicht laufend benutzt.

KONTEN IM ÜBERBLICK — Verluste aus Forderungen (Aufwand / Minus-Ertrag, Soll). WB Forderungen (Minus-Aktivkonto, Haben bei Bildung). Forderungen L+L (Aktivkonto, Haben bei Abschreibung). MWSt-Verbindlichkeiten (Passivkonto, Soll bei Rückforderung).`
)

await replaceGoals(ch, [
  'Du kennst den Unterschied zwischen dubiosen und uneinbringlichen Forderungen und weisst, welche Massnahme jeweils greift.',
  'Du kannst Forderungsverluste direkt abschreiben (Bruttobetrag) und die MWSt-Rückforderung korrekt berechnen und buchen.',
  'Du kannst Einzelwertberichtigungen (EWB) für konkret bekannte zweifelhafte Schuldner bilden und anpassen.',
  'Du kannst Pauschalwertberichtigungen (PWB) auf den Restdebitorenbestand berechnen, mit dem Ist-Bestand vergleichen und die Differenz buchen.',
  'Du weisst, wie du vorgehst, wenn eine bereits wertberichtigte Forderung definitiv verloren geht (dreiteilige Buchungsfolge).',
  'Du kannst nachträgliche Zahlungen abgeschriebener Forderungen periodengerecht behandeln (gleiche vs. spätere Periode).',
  'Du kennst alternative Erledigungsformen offener Forderungen (Fahrzeugübernahme, Forderungsverzicht, Darlehensumwandlung).',
  'Du kannst Forderungen L+L korrekt in der Bilanz ausweisen (brutto minus WB Forderungen = netto).',
])

await replaceTerms(ch, [
  ['Forderungen L+L (Forderungen aus Lieferungen und Leistungen)', 'Guthaben gegenüber Kunden aus Warenverkäufen oder Dienstleistungen auf Kredit. Entsteht bei Rechnungsstellung; der Ertrag wird sofort erfasst, die Zahlung erfolgt später.'],
  ['Dubiose Forderung', 'Forderung, deren Eingang unsicher ist (Schuldner hat Zahlungsschwierigkeiten). Massnahme: Wertberichtigung bilden, Forderung bleibt bestehen.'],
  ['Uneinbringliche Forderung', 'Forderung, die definitiv nicht mehr bezahlt wird (Konkurs, Verlustschein, Verjährung). Massnahme: direkte Abschreibung über Verluste aus Forderungen.'],
  ['Verluste aus Forderungen', 'Aufwandskonto (Minus-Ertragskonto) für definitiv oder mutmasslich verlorene Forderungen. Wird in der Erfolgsrechnung als Ertragsminderung interpretiert.'],
  ['WB Forderungen (Wertberichtigungskonto)', 'Minus-Aktivkonto (Korrekturposten zu Forderungen L+L, früher Delkredere). Enthält geschätzte zukünftige Verluste. Ruhend: wird nur am Jahresende angepasst.'],
  ['Einzelwertberichtigung (EWB)', 'Wertberichtigung für einen konkret bekannten zweifelhaften Schuldner. Betrag = geschätzter Verlust auf diese Forderung. Buchung: Verluste aus Forderungen / WB Forderungen.'],
  ['Pauschalwertberichtigung (PWB)', 'Pauschale Wertberichtigung in % auf den gesamten verbleibenden Debitorenbestand (nach EWB). Deckt allgemeines statistisches Ausfallrisiko. Nur Differenz zum Ist-Bestand wird gebucht.'],
  ['Konkursdividende', 'Der tatsächlich aus der Konkursmasse zufliessende Teil der Forderung (z.B. 15% der Gesamtforderung). Der nicht gedeckte Rest wird als definitiver Verlust ausgebucht.'],
  ['MWSt-Rückforderung bei Forderungsverlust', 'Bei definitiv verlorenem Debitor kann die bereits abgeführte MWSt (Nettobetrag × MWSt-Satz) zurückgefordert werden. Buchung: MWSt-Verbindlichkeiten / Verluste aus Forderungen.'],
  ['Periodenfremder / ausserordentlicher Ertrag', 'Zahlung einer in einer früheren Periode abgeschriebenen Forderung. Da der ursprüngliche Aufwand bereits abgeschlossen ist, gilt die Zahlung als ausserordentlicher Ertrag (Bank / A.o. Ertrag).'],
  ['Betreibungskosten-Vorschuss', 'Kostenvorschuss an das Betreibungsamt. Kein Aufwand, sondern Erhöhung der Forderung (Forderungen L+L / Bank), da der Betrag dem Schuldner weiterbelastet werden kann.'],
  ['Bilanzausweis Forderungen', 'Forderungen L+L brutto minus WB Forderungen = Forderungen L+L netto. Die WB erscheint als Minusposition bei den Aktiven, nicht auf der Passivseite.'],
])

await replacePoints(ch, [
  'Direkte Abschreibung: Verluste aus Forderungen / Forderungen L+L (Bruttobetrag inkl. MWSt)',
  'MWSt-Rückforderung: MWSt-Verbindlichkeiten / Verluste aus Forderungen (Nettobetrag × MWSt-Satz)',
  'Netto-Verlust = Bruttoverlust minus MWSt-Rückforderung; der Nettobetrag belastet die Erfolgsrechnung effektiv',
  'EWB für bekannte Risiken: Verluste aus Forderungen / WB Forderungen (geschätzter Verlustbetrag)',
  'PWB: Soll-WB = % × Restdebitorenbestand nach EWB; nur Differenz zum Ist-Bestand buchen',
  'PWB erhöhen: Verluste aus Forderungen / WB Forderungen (Differenz positiv)',
  'PWB senken: WB Forderungen / Verluste aus Forderungen (Differenz negativ — Ertragswirkung)',
  'Definitiver Verlust mit vorhandener WB: Schritt 1 WB Forderungen / Forderungen L+L; Schritt 2 Verluste aus Forderungen / Forderungen L+L (Restbetrag); Schritt 3 MWSt zurückfordern',
  'WB Forderungen ist ein ruhendes Konto — es wird nur am Bilanzstichtag angepasst, nicht während des Jahres',
  'Bilanz: Forderungen L+L netto = Brutto − WB Forderungen (Minusposition bei Aktiven)',
  'Nachträgliche Zahlung im gleichen Jahr: Bank / Verluste aus Forderungen (Storno des Aufwands)',
  'Nachträgliche Zahlung in späterer Periode: Bank / A.o. Ertrag (periodengerechte Abgrenzung)',
])

await replaceExamples(ch, [
  'DIREKTE ABSCHREIBUNG: Forderung CHF 5 400 (inkl. 8,1% MWSt = CHF 402.95) definitiv verloren. Schritt 1: Verluste aus Forderungen 5 400 / Forderungen L+L 5 400. Schritt 2: MWSt-Verbindlichkeiten 402.95 / Verluste aus Forderungen 402.95. Netto-Verlust = CHF 4 997.05.',
  'KONKURSFALL MODESSA AG: Gesamtforderung CHF 7 200 (Rechnung 7 000 + Betreibungskosten 70 + Verzugszins 130). Konkursdividende 15%: Bank / Forderungen L+L CHF 1 080. Ausbuchung Rest: Verluste aus Forderungen 6 120 / Forderungen L+L 6 120.',
  'EWB BILDUNG: Schuldner Meier (Forderung CHF 8 000) ist in Konkurs, Verlust geschätzt 100%. Buchung: Verluste aus Forderungen 8 000 / WB Forderungen 8 000.',
  'PWB ANPASSUNG (Erhöhung): Debitoren nach EWB = CHF 120 000. PWB-Satz 5%. Soll-WB = 6 000. Ist-WB = 4 200. Differenz +1 800. Buchung: Verluste aus Forderungen 1 800 / WB Forderungen 1 800.',
  'PWB HERABSETZUNG: Debitoren = 80 000. PWB 5% = 4 000. Ist-WB = 5 500. Differenz −1 500. Buchung: WB Forderungen 1 500 / Verluste aus Forderungen 1 500.',
  'DEFINITIVER VERLUST (WB-Methode): Forderung Müller CHF 3 000, WB dafür CHF 2 000. Verlust definitiv. Schritt 1: WB Forderungen 2 000 / Forderungen L+L 2 000. Schritt 2: Verluste aus Forderungen 1 000 / Forderungen L+L 1 000. Schritt 3: MWSt-Verbindlichkeiten / Verluste aus Forderungen (Nettobetrag × MWSt-Satz).',
  'ALTERNATIVE ERLEDIGUNGSFORM — UMWANDLUNG IN DARLEHEN: Kunde schuldet CHF 9 700. Umwandlung in Darlehen CHF 10 000; Differenz = Verzugszins 300. Buchung: Forderungen L+L 300 / Finanzertrag 300, dann Aktivdarlehen 10 000 / Forderungen L+L 10 000.',
  'NACHTRÄGLICHE ZAHLUNG — GLEICHE PERIODE: Forderung CHF 1 340 im Frühjahr als Verlust gebucht (Verluste aus Forderungen / Forderungen L+L). Im Herbst doch noch bezahlt. Direkte Buchung: Bank 1 340 / Verluste aus Forderungen 1 340 (Storno). SPÄTERE PERIODE: Bank 2 180 / A.o. Ertrag 2 180.',
])

await replaceQuiz(ch, [
  {
    q: 'Forderung CHF 2 162 (inkl. 8,1% MWSt) ist definitiv verloren. Wie hoch ist die MWSt-Rückforderung?',
    opts: [
      ['CHF 162', true],
      ['CHF 2 162', false],
      ['CHF 2 000', false],
      ['CHF 175.12', false],
    ],
    exp: 'Netto = 2 162 / 1.081 = 2 000. MWSt = 2 162 − 2 000 = CHF 162. Buchung: MWSt-Verbindlichkeiten 162 / Verluste aus Forderungen 162.',
    diff: 'medium'
  },
  {
    q: 'Was ist der korrekte Buchungssatz bei der Bildung einer Einzelwertberichtigung?',
    opts: [
      ['Verluste aus Forderungen / WB Forderungen', true],
      ['WB Forderungen / Forderungen L+L', false],
      ['Verluste aus Forderungen / Forderungen L+L', false],
      ['WB Forderungen / Verluste aus Forderungen', false],
    ],
    exp: 'Bildung EWB: Aufwand steigt (Verluste aus Forderungen im Soll), WB Forderungen steigt (Haben). Die Forderungen L+L werden noch nicht berührt.',
    diff: 'easy'
  },
  {
    q: 'Debitoren CHF 200 000, davon EWB CHF 10 000. PWB-Satz 5% auf Restbestand. Bisherige WB (total) = CHF 18 000. Was wird gebucht?',
    opts: [
      ['Verluste aus Forderungen 1 500 / WB Forderungen 1 500', true],
      ['WB Forderungen 1 500 / Verluste aus Forderungen 1 500', false],
      ['Verluste aus Forderungen 500 / WB Forderungen 500', false],
      ['Keine Buchung nötig', false],
    ],
    exp: 'Restbestand = 200 000 − 10 000 = 190 000. PWB 5% = 9 500. Soll-WB total = 10 000 + 9 500 = 19 500. Ist-WB = 18 000. Differenz = +1 500. Erhöhung: Verluste aus Forderungen 1 500 / WB Forderungen 1 500.',
    diff: 'hard'
  },
  {
    q: 'Wo erscheint das Konto "WB Forderungen" in der Bilanz?',
    opts: [
      ['Als Minusposition bei den Forderungen (Aktiven)', true],
      ['Auf der Passivseite als Fremdkapital', false],
      ['In der Erfolgsrechnung als Aufwand', false],
      ['Als eigenes Aktivum neben den Forderungen', false],
    ],
    exp: 'WB Forderungen ist ein Minus-Aktivkonto. Es wird von den Forderungen L+L brutto abgezogen: Forderungen netto = Brutto − WB Forderungen. Es erscheint nicht auf der Passivseite.',
    diff: 'medium'
  },
  {
    q: 'Eine Forderung über CHF 3 000 ist definitiv verloren. WB besteht für CHF 2 000. Was ist der erste Buchungsschritt?',
    opts: [
      ['WB Forderungen 2 000 / Forderungen L+L 2 000', true],
      ['Verluste aus Forderungen 3 000 / Forderungen L+L 3 000', false],
      ['Verluste aus Forderungen 1 000 / Forderungen L+L 1 000', false],
      ['MWSt-Verbindlichkeiten / Forderungen L+L', false],
    ],
    exp: 'Wenn WB vorhanden: Zuerst WB Forderungen / Forderungen L+L (WB verwenden). Danach Verluste aus Forderungen / Forderungen L+L für den ungedeckten Rest (CHF 1 000). Zum Schluss MWSt zurückfordern.',
    diff: 'medium'
  },
  {
    q: 'Was ist der Unterschied zwischen direkter Abschreibung und WB-Methode?',
    opts: [
      ['Direkt: sofort auf Forderungen L+L buchen; WB: vorsorglich ein Gegenkonto bilden ohne Forderungen zu reduzieren', true],
      ['Direkt: nur für Einzelfälle; WB: nur für Pauschalfälle', false],
      ['Direkt: höhere MWSt-Rückforderung; WB: keine MWSt', false],
      ['Es gibt keinen buchhalterischen Unterschied', false],
    ],
    exp: 'Direkte Abschreibung bucht sofort auf Forderungen L+L (Forderung wird sofort reduziert). WB-Methode bildet vorsorglich ein Gegenkonto (WB Forderungen), ohne die Forderungen L+L direkt zu vermindern. Die Forderung bleibt in voller Höhe stehen.',
    diff: 'medium'
  },
  {
    q: 'Wann entsteht eine Ertragsauswirkung, wenn die WB Forderungen herabgesetzt wird?',
    opts: [
      ['Die Herabsetzung führt zu einem Ertrag (Verluste aus Forderungen wird gutgeschrieben)', true],
      ['Die Herabsetzung führt zu einem Aufwand', false],
      ['Die Herabsetzung hat keine Erfolgswirkung', false],
      ['Die Herabsetzung wird direkt mit Forderungen L+L verrechnet', false],
    ],
    exp: 'Herabsetzung WB: WB Forderungen (Soll) / Verluste aus Forderungen (Haben). Das Ertragskonto wird kreditiert → positive Erfolgswirkung, weil das Ausfallrisiko kleiner wurde als erwartet.',
    diff: 'easy'
  },
  {
    q: 'Ein Kunde zahlt im Jahr 3 eine Forderung, die im Jahr 1 als definitiver Verlust abgeschrieben wurde. Wie wird gebucht?',
    opts: [
      ['Bank / A.o. Ertrag (ausserordentlicher Ertrag)', true],
      ['Bank / Verluste aus Forderungen (Storno)', false],
      ['Forderungen L+L / Verluste aus Forderungen, dann Bank / Forderungen L+L', false],
      ['Bank / Warenerlöse', false],
    ],
    exp: 'Da die Abschreibung in einer früheren Periode erfolgte, ist der Aufwand bereits abgeschlossen. Die Zahlung in einer späteren Periode gilt als periodenfremder/ausserordentlicher Ertrag: Bank / A.o. Ertrag. Storno gilt nur für Buchungen im gleichen Geschäftsjahr.',
    diff: 'medium'
  },
  {
    q: 'Ein Betreibungskosten-Vorschuss von CHF 70 wird an das Betreibungsamt bezahlt. Wie wird gebucht?',
    opts: [
      ['Forderungen L+L 70 / Bank 70 (Forderung erhöht sich)', true],
      ['Betreibungsaufwand 70 / Bank 70', false],
      ['Verluste aus Forderungen 70 / Bank 70', false],
      ['Keine Buchung nötig', false],
    ],
    exp: 'Der Kostenvorschuss ist kein Aufwand, weil er dem Schuldner weiterbelastet werden kann. Er erhöht die Forderung: Forderungen L+L / Bank. Erst wenn klar ist, dass er nicht zurückerstattet wird, wird er als Verlust ausgebucht.',
    diff: 'hard'
  },
  {
    q: 'Wie wird die Übernahme eines Fahrzeugs (Wert CHF 8 000) zur Tilgung einer Forderung von CHF 8 000 gebucht?',
    opts: [
      ['Fahrzeuge 8 000 / Forderungen L+L 8 000', true],
      ['Bank 8 000 / Forderungen L+L 8 000', false],
      ['Verluste aus Forderungen 8 000 / Forderungen L+L 8 000', false],
      ['Forderungen L+L 8 000 / Fahrzeuge 8 000', false],
    ],
    exp: 'Bei der Übernahme eines Fahrzeugs zur Forderungstilgung tritt das Fahrzeug an die Stelle des Geldes: Fahrzeuge (Aktiv, Soll) / Forderungen L+L (Aktiv, Haben). Die Forderung ist erledigt, ein Sachanlagezugang entsteht.',
    diff: 'medium'
  },
])

console.log('✅ Kapitel 3: Verluste aus Forderungen erfolgreich erstellt/aktualisiert.')
await client.end()
