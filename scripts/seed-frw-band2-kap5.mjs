import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }
async function getTopicId(slug) {
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(`INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW()) ON CONFLICT ("topicId",slug) DO NOTHING`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}
async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`, [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), points[i], chId, i+1])
}
async function addExamples(chId, examples) {
  for (let i = 0; i < examples.length; i++)
    await client.query(`INSERT INTO "Example" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), examples[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(`INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(`INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

const tId = await getTopicId('frw-band2')

const ch = await insertChapter(tId,
  'zeitliche-abgrenzungen',
  'Zeitliche Abgrenzungen',
  'Transitorische Aktiven/Passiven und Rückstellungen',
  4,
  `Aufwände und Erträge müssen derjenigen Periode zugeordnet werden, in der sie wirtschaftlich anfallen — unabhängig vom Zahlungszeitpunkt.

TRANSITORISCHE AKTIVEN (Aktive Rechnungsabgrenzung):
1. Vorauszahlter Aufwand: Bereits bezahlt, betrifft aber erst das nächste Jahr
   Buchung 31.12.: Transitorische Aktiven / Aufwandkonto
   Rückbuchung 1.1.: Aufwandkonto / Transitorische Aktiven
2. Noch nicht erhaltener Ertrag: Anfällt in diesem Jahr, aber noch nicht kassiert
   Buchung 31.12.: Transitorische Aktiven / Ertragskonto
   Rückbuchung 1.1.: Ertragskonto / Transitorische Aktiven

TRANSITORISCHE PASSIVEN (Passive Rechnungsabgrenzung):
1. Noch nicht bezahlter Aufwand: Anfällt in diesem Jahr, aber noch nicht bezahlt
   Buchung 31.12.: Aufwandkonto / Transitorische Passiven
   Rückbuchung 1.1.: Transitorische Passiven / Aufwandkonto
2. Vorausbezahlter Ertrag: Bereits kassiert, betrifft aber erst das nächste Jahr
   Buchung 31.12.: Ertragskonto / Transitorische Passiven
   Rückbuchung 1.1.: Transitorische Passiven / Ertragskonto

RÜCKSTELLUNGEN:
Verbindlichkeiten, deren Existenz wahrscheinlich, deren Höhe/Fälligkeit aber unbekannt ist.
Wann bilden: 1. Wahrscheinliche Verpflichtung, 2. Geldabfluss wahrscheinlich, 3. Betrag schätzbar
Arten: Garantierückstellung, Prozessrückstellung, Steuerrückstellung, Ferienrückstellung
Bildung: Rückstellungsaufwand / Rückstellungen
Verwendung: Rückstellungen / Bank
Auflösung (nicht gebraucht): Rückstellungen / Rückstellungsertrag

UNTERSCHIED Transitorische Passiven vs. Rückstellungen:
• Transitorische Passiven: Betrag UND Fälligkeit bekannt (z.B. Dezember-Lohn)
• Rückstellungen: Betrag ODER Fälligkeit unbekannt (z.B. Garantiefälle)`
)

await addGoals(ch, [
  'Du kannst transitorische Aktiven und Passiven korrekt buchen und abgrenzen.',
  'Du verstehst, warum zeitliche Abgrenzungen notwendig sind (Periodenabgrenzungsprinzip).',
  'Du kannst den Rückbuchungssatz am 1.1. des Folgejahres bestimmen.',
  'Du kannst Rückstellungen bilden, verwenden und auflösen.',
  'Du kennst den Unterschied zwischen transitorischen Passiven und Rückstellungen.',
])

await addTerms(ch, [
  ['Periodenabgrenzungsprinzip', 'Jeder Aufwand und jeder Ertrag muss der Periode zugeordnet werden, in der er wirtschaftlich anfällt — unabhängig vom Zahlungszeitpunkt.'],
  ['Transitorische Aktiven', 'Abgrenzungsposten auf der Aktivseite der Bilanz. Enthält: vorauszahlte Aufwände (nächstes Jahr) und noch nicht erhaltene Erträge (dieses Jahr).'],
  ['Transitorische Passiven', 'Abgrenzungsposten auf der Passivseite (kurzfristiges FK). Enthält: noch nicht bezahlte Aufwände (dieses Jahr) und vorausbezahlte Erträge (nächstes Jahr).'],
  ['Vorauszahlter Aufwand', 'Zahlung schon erfolgt, Aufwand betrifft aber erst das nächste Jahr → Transitorisches Aktivum bilden.'],
  ['Noch nicht bezahlter Aufwand', 'Aufwand fällt in diesem Jahr an, wird aber erst nächstes Jahr bezahlt → Transitorisches Passivum bilden.'],
  ['Rückstellung', 'Wahrscheinliche Verbindlichkeit mit unsicherer Höhe oder Fälligkeit. Erscheint auf der Passivseite (Fremdkapital).'],
  ['Rückstellungsaufwand', 'Aufwandskonto bei Bildung einer Rückstellung: Rückstellungsaufwand / Rückstellungen.'],
  ['Rückstellungsertrag', 'Ertragskonto bei Auflösung einer nicht benötigten Rückstellung: Rückstellungen / Rückstellungsertrag.'],
])

await addPoints(ch, [
  'Transitorische Aktiven: vorauszahlter Aufwand ODER noch nicht erhaltener Ertrag → Buchung 31.12.: Trans.A. / Aufwand oder Ertrag',
  'Transitorische Passiven: noch nicht bezahlter Aufwand ODER vorausbezahlter Ertrag → Buchung 31.12.: Aufwand oder Ertrag / Trans.P.',
  'Alle Abgrenzungen werden am 1.1. storniert (Gegenbuchung)',
  'Transitorische Aktiven: Bilanz Umlaufvermögen (Aktiven)',
  'Transitorische Passiven: Bilanz kurzfristiges Fremdkapital (Passiven)',
  'Rückstellungen: Betrag geschätzt, Fälligkeit unbekannt — deshalb keine transitorischen Passiven',
  'Rückstellung bilden: Rückstellungsaufwand / Rückstellungen',
  'Rückstellung verwenden: Rückstellungen / Bank (oder Kreditoren)',
  'Rückstellung auflösen: Rückstellungen / Rückstellungsertrag',
])

await addExamples(ch, [
  'VORAUSZAHLTER AUFWAND: Versicherungsprämie CHF 2 400 am 1. Oktober bezahlt (gilt für Okt.–Sept. nächstes Jahr). Per 31.12.: 9/12 von 2 400 = CHF 1 800 betreffen nächstes Jahr. Buchung 31.12.: Transitorische Aktiven 1 800 / Versicherungsaufwand 1 800. Rückbuchung 1.1.: Versicherungsaufwand 1 800 / Transitorische Aktiven 1 800.',
  'NOCH NICHT ERHALTENER ERTRAG: Jahreszins CHF 3 600 auf Darlehen, Zinsen werden jeweils im März für das Vorjahr gutgeschrieben. Per 31.12.: CHF 3 600 anfällt in diesem Jahr, aber noch nicht kassiert. Buchung 31.12.: Transitorische Aktiven 3 600 / Zinsertrag 3 600.',
  'NOCH NICHT BEZAHLTER AUFWAND: Dezember-Miete CHF 4 000 wird erst im Januar bezahlt. Buchung 31.12.: Mietaufwand 4 000 / Transitorische Passiven 4 000. Rückbuchung 1.1.: Transitorische Passiven 4 000 / Mietaufwand 4 000.',
  'VORAUSBEZAHLTER ERTRAG: Kunde bezahlt Jahresabo CHF 1 200 im Oktober (gilt Okt.–Sept.). Per 31.12.: 9/12 = CHF 900 betreffen nächstes Jahr. Buchung 31.12.: Mietertrag 900 / Transitorische Passiven 900.',
  'RÜCKSTELLUNG BILDEN: Firma hat laufenden Prozess, Verlust von CHF 50 000 wahrscheinlich. Buchung: Rückstellungsaufwand 50 000 / Rückstellungen 50 000. Vergleich: nur CHF 30 000 → Rückstellungen 30 000 / Rückstellungsertrag 20 000 (restliche 20 000 auflösen).',
])

await addQuiz(ch, [
  {
    q: 'Jahresmiete CHF 12 000 wird am 1. April bezahlt (April–März nächstes Jahr). Buchung per 31.12. (für die 3 Monate Jan–März nächstes Jahr)?',
    opts: [['Transitorische Aktiven 3 000 / Mietaufwand 3 000', true], ['Mietaufwand 3 000 / Transitorische Passiven 3 000', false], ['Transitorische Passiven 9 000 / Mietaufwand 9 000', false], ['Keine Buchung nötig', false]],
    exp: '3/12 von 12 000 = CHF 3 000 betreffen Jan.–März nächstes Jahr. Vorauszahlter Aufwand → Transitorisches Aktivum. Buchung: Trans.A. / Mietaufwand.',
    diff: 'medium'
  },
  {
    q: 'Was ist eine Transitorische Passive?',
    opts: [['Noch nicht bezahlter Aufwand dieses Jahres ODER vorausbezahlter Ertrag', true], ['Vorauszahlter Aufwand für nächstes Jahr', false], ['Eine Art Rückstellung', false], ['Bereits erhaltener Ertrag für dieses Jahr', false]],
    exp: 'Transitorische Passiven = (1) Aufwand fällt an, aber noch nicht bezahlt, oder (2) Ertrag kassiert, der erst nächstes Jahr anfällt.',
    diff: 'medium'
  },
  {
    q: 'Wann wird eine Rückstellung aufgelöst?',
    opts: [['Wenn das Risiko wegfällt oder kleiner als erwartet ist', true], ['Wenn das Geschäftsjahr endet', false], ['Wenn Transitorische Passiven übersteigen', false], ['Wenn Debitoren bezahlen', false]],
    exp: 'Rückstellungen werden aufgelöst wenn die Verpflichtung wegfällt (Buchung: Rückstellungen / Rückstellungsertrag) oder wenn sie verwendet wird (Rückstellungen / Bank).',
    diff: 'easy'
  },
  {
    q: 'Was ist der Buchungssatz am 1. Januar für eine Transitorische Passive (Mietaufwand)?',
    opts: [['Transitorische Passiven / Mietaufwand', true], ['Mietaufwand / Transitorische Passiven', false], ['Transitorische Aktiven / Mietaufwand', false], ['Mietaufwand / Transitorische Aktiven', false]],
    exp: 'Am 1.1. wird die Buchung vom 31.12. storniert (Gegenbuchung). War: Mietaufwand / Trans.P. → Storno: Trans.P. / Mietaufwand.',
    diff: 'medium'
  },
  {
    q: 'Unterschied zwischen Transitorischen Passiven und Rückstellungen?',
    opts: [['Trans.P.: Betrag und Fälligkeit bekannt; Rückstellungen: Betrag oder Fälligkeit unbekannt', true], ['Trans.P. sind immer kleiner', false], ['Rückstellungen werden immer aufgelöst', false], ['Es gibt keinen Unterschied', false]],
    exp: 'Transitorische Passiven: genauer Betrag UND Fälligkeit bekannt (z.B. Dezember-Lohn). Rückstellungen: Betrag oder Fälligkeit unsicher (z.B. Garantieverpflichtungen).',
    diff: 'medium'
  },
  {
    q: 'Buchung bei Bildung einer Rückstellung von CHF 25 000 für Garantiefälle:',
    opts: [['Rückstellungsaufwand 25 000 / Rückstellungen 25 000', true], ['Rückstellungen 25 000 / Rückstellungsaufwand 25 000', false], ['Rückstellungen 25 000 / Bank 25 000', false], ['Garantieaufwand 25 000 / Transitorische Passiven 25 000', false]],
    exp: 'Bildung Rückstellung: Aufwand steigt (Rückstellungsaufwand / Soll), Rückstellungen steigen (Haben, Passivseite).',
    diff: 'easy'
  },
])

console.log('✅ Kapitel 5: Zeitliche Abgrenzungen erfolgreich erstellt.')
await client.end()
