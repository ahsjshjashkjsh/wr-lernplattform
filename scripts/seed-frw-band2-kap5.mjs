import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function insertTopic(slug, title, description, examType, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'Globe','blue',$5,'frw',$6,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET title=$3, description=$4, "updatedAt"=NOW()`,
    [topicId, slug, title, description, examType, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET title=$3, subtitle=$4, "order"=$6, summary=$7, "contentStatus"='complete', "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function addGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1])
}

async function addTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1])
}

async function addPoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1])
}

async function addQuiz(chId, questions) {
  // Delete options before questions (FK constraint order)
  await client.query(
    `DELETE FROM "QuizOption" WHERE "questionId" IN (SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1)`,
    [chId])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff || 'medium', i + 1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j + 1])
  }
}

// ─── Topic ───────────────────────────────────────────────────────────────────

const tId = await insertTopic(
  'frw-zeitliche-abgrenzungen',
  'Zeitliche Abgrenzungen & Rückstellungen',
  'Transitorische Aktiven/Passiven, antizipative Buchungen und Rückstellungen — periodengerechte Rechnungslegung.',
  'abschluss',
  13
)

// ─── Chapter ─────────────────────────────────────────────────────────────────

const ch = await insertChapter(
  tId,
  'zeitliche-abgrenzungen',
  'Zeitliche Abgrenzungen & Rückstellungen',
  'Transitorische Aktiven/Passiven, antizipative Buchungen und Rückstellungen',
  1,
  `Aufwände und Erträge müssen der Periode zugeordnet werden, in der sie wirtschaftlich anfallen — unabhängig vom Zahlungszeitpunkt (Periodenabgrenzungsprinzip).

TRANSITORISCHE AKTIVEN (Aktive Rechnungsabgrenzung) — Bilanzposition: Umlaufvermögen:
Am Abschluss besteht ein Guthaben. Zwei Fälle:
1. Vorauszahlter Aufwand: Bereits bezahlt, betrifft aber erst das nächste Jahr.
   Buchung 31.12.: Transitorische Aktiven / Aufwandkonto
   Rückbuchung 1.1.: Aufwandkonto / Transitorische Aktiven
2. Noch nicht erhaltener Ertrag: Fällt in diesem Jahr an, aber noch nicht kassiert.
   Buchung 31.12.: Transitorische Aktiven / Ertragskonto
   Rückbuchung 1.1.: Ertragskonto / Transitorische Aktiven

TRANSITORISCHE PASSIVEN (Passive Rechnungsabgrenzung) — Bilanzposition: kurzfristiges FK:
Am Abschluss besteht eine Schuld. Zwei Fälle:
1. Noch nicht bezahlter Aufwand: Fällt in diesem Jahr an, aber noch nicht bezahlt.
   Buchung 31.12.: Aufwandkonto / Transitorische Passiven
   Rückbuchung 1.1.: Transitorische Passiven / Aufwandkonto
2. Vorausbezahlter Ertrag: Bereits kassiert, betrifft aber erst das nächste Jahr.
   Buchung 31.12.: Ertragskonto / Transitorische Passiven
   Rückbuchung 1.1.: Transitorische Passiven / Ertragskonto

ANTIZIPATIVE BUCHUNGEN — Begriff aus der Praxis:
Antizipative Buchungen erfassen Aufwände oder Erträge, die wirtschaftlich bereits angefallen sind, aber noch nicht kassiert oder bezahlt wurden. Sie sind ein Teilbereich der Abgrenzungsbuchungen und führen zu transitorischen Positionen in der Bilanz.
Beispiele: noch nicht erhaltene Zinsen (→ Trans. Aktiven), noch nicht bezahlter Mietaufwand (→ Trans. Passiven).

RÜCKSTELLUNGEN — Definition:
Passivposten für wahrscheinliche zukünftige Verpflichtungen aus vergangenen Ereignissen, deren Betrag und/oder Fälligkeit noch ungewiss ist. Sie sind echte Schulden (Fremdkapital), keine Rücklagen.
Kriterien für Bildung: (1) Vergangenes Ereignis, (2) wahrscheinliche Verpflichtung, (3) Betrag schätzbar.
Arten: Garantierückstellung, Prozessrückstellung, Steuerrückstellung, Ferienrückstellung, Restrukturierungsrückstellung.

Buchungssätze Rückstellungen:
• Bildung:    Rückstellungsaufwand / Rückstellungen
• Verwendung (Zahlung trifft ein): Rückstellungen / Bank
• Auflösung (Risiko weggefallen): Rückstellungen / Rückstellungsertrag
• Teilverwendung + Restauflösung: Rückstellungen / Bank (Teil) + Rückstellungen / Rückstellungsertrag (Rest)
• Anpassung nach oben: Rückstellungsaufwand / Rückstellungen (Differenz nachbuchen)

VERGLEICH TRANSITORISCHE PASSIVEN vs. RÜCKSTELLUNGEN:
• Transitorische Passiven: Betrag UND Fälligkeit genau bekannt (z.B. Dezember-Lohn, ausstehende Stromrechnung).
• Rückstellungen: Betrag ODER Fälligkeit unbekannt (z.B. Garantieverpflichtungen, Prozessrisiken).
Beide stehen auf der Passivseite — aber nur Trans. Passiven werden am 1.1. automatisch rückgebucht.`
)

// ─── Learning Goals ───────────────────────────────────────────────────────────

await addGoals(ch, [
  'Du kannst das Periodenabgrenzungsprinzip erklären und auf Buchungsfälle anwenden.',
  'Du kannst transitorische Aktiven (beide Fälle) korrekt buchen und am 1.1. zurückbuchen.',
  'Du kannst transitorische Passiven (beide Fälle) korrekt buchen und am 1.1. zurückbuchen.',
  'Du kannst antizipative Buchungen von transitorischen Abgrenzungen abgrenzen und zuordnen.',
  'Du kannst den Rückbuchungssatz am 1. Januar für jede Abgrenzungsart selbstständig bestimmen.',
  'Du kannst Rückstellungen bilden, verwenden, anpassen und auflösen — mit korrekten Buchungssätzen.',
  'Du kennst den Unterschied zwischen transitorischen Passiven und Rückstellungen (Betrag/Fälligkeit).',
  'Du kannst beurteilen, ob ein Sachverhalt eine transitorische Abgrenzung oder eine Rückstellung erfordert.',
])

// ─── Key Terms ────────────────────────────────────────────────────────────────

await addTerms(ch, [
  ['Periodenabgrenzungsprinzip', 'Jeder Aufwand und jeder Ertrag wird der Periode zugeordnet, in der er wirtschaftlich verursacht wurde — unabhängig davon, wann die Zahlung erfolgt.'],
  ['Transitorische Aktiven', 'Aktive Rechnungsabgrenzung auf der Aktivseite (Umlaufvermögen). Enthält vorauszahlte Aufwände (Zahlung schon erfolgt, Nutzen erst nächstes Jahr) und noch nicht erhaltene Erträge (verdient, aber noch nicht kassiert).'],
  ['Transitorische Passiven', 'Passive Rechnungsabgrenzung auf der Passivseite (kurzfristiges FK). Enthält noch nicht bezahlte Aufwände (angefallen, aber noch nicht bezahlt) und vorausbezahlte Erträge (kassiert, Leistung erst nächstes Jahr).'],
  ['Vorauszahlter Aufwand', 'Zahlung bereits erfolgt, der wirtschaftliche Aufwand betrifft aber erst die nächste Periode. Führt zu einer transitorischen Aktiven. Buchung 31.12.: Trans. Aktiven / Aufwandkonto.'],
  ['Noch nicht erhaltener Ertrag', 'Ertrag ist im laufenden Jahr wirtschaftlich verdient, die Zahlung steht aber noch aus. Führt zu einer transitorischen Aktiven. Buchung 31.12.: Trans. Aktiven / Ertragskonto.'],
  ['Noch nicht bezahlter Aufwand', 'Aufwand fällt im laufenden Jahr an, die Zahlung erfolgt aber erst nächstes Jahr. Führt zu einer transitorischen Passiven. Buchung 31.12.: Aufwandkonto / Trans. Passiven.'],
  ['Vorausbezahlter Ertrag', 'Zahlung bereits kassiert, die zugehörige Leistung wird aber erst nächstes Jahr erbracht. Führt zu einer transitorischen Passiven. Buchung 31.12.: Ertragskonto / Trans. Passiven.'],
  ['Antizipative Buchungen', 'Buchungen, die Aufwände oder Erträge erfassen, die bereits wirtschaftlich angefallen sind, aber noch nicht gezahlt wurden. Sie sind Teil der Abgrenzungsbuchungen und erzeugen transitorische Bilanzpositionen.'],
  ['Rückstellung', 'Passivposten für wahrscheinliche zukünftige Verpflichtungen aus vergangenen Ereignissen, deren genauer Betrag und/oder Fälligkeit noch ungewiss ist. Zählt zum Fremdkapital.'],
  ['Rückstellungsaufwand', 'Aufwandskonto, das bei Bildung oder Erhöhung einer Rückstellung belastet wird. Buchung: Rückstellungsaufwand / Rückstellungen.'],
  ['Rückstellungsertrag', 'Ertragskonto, das bei Auflösung einer nicht mehr benötigten Rückstellung gutgeschrieben wird. Buchung: Rückstellungen / Rückstellungsertrag.'],
  ['Provisorische Erfolgsrechnung', 'Vorläufige Erfolgsrechnung vor periodengerechten Korrekturen. Ausgangspunkt für die Abgrenzungsarbeiten am Jahresende — zeigt, wo Korrekturbedarf besteht.'],
])

// ─── Core Points ──────────────────────────────────────────────────────────────

await addPoints(ch, [
  'Periodenabgrenzungsprinzip: Nicht der Zahlungszeitpunkt, sondern die wirtschaftliche Verursachung entscheidet, in welche Periode Aufwand oder Ertrag gehört.',
  'Transitorische Aktiven entstehen, wenn am Abschluss ein Guthaben besteht — entweder vorauszahlter Aufwand oder noch nicht erhaltener Ertrag. Bilanzseite: Umlaufvermögen.',
  'Transitorische Passiven entstehen, wenn am Abschluss eine Schuld besteht — entweder noch nicht bezahlter Aufwand oder vorausbezahlter Ertrag. Bilanzseite: kurzfristiges Fremdkapital.',
  'Vorauszahlter Aufwand (Trans. Aktiven): Buchung 31.12.: Transitorische Aktiven / Aufwandkonto. Rückbuchung 1.1.: Aufwandkonto / Transitorische Aktiven.',
  'Noch nicht erhaltener Ertrag (Trans. Aktiven): Buchung 31.12.: Transitorische Aktiven / Ertragskonto. Rückbuchung 1.1.: Ertragskonto / Transitorische Aktiven.',
  'Noch nicht bezahlter Aufwand (Trans. Passiven): Buchung 31.12.: Aufwandkonto / Transitorische Passiven. Rückbuchung 1.1.: Transitorische Passiven / Aufwandkonto.',
  'Vorausbezahlter Ertrag (Trans. Passiven): Buchung 31.12.: Ertragskonto / Transitorische Passiven. Rückbuchung 1.1.: Transitorische Passiven / Ertragskonto.',
  'Antizipative Buchungen = Erfassung bereits verursachter, aber noch nicht gezahlter Aufwände oder Erträge. Sie führen stets zu transitorischen Bilanzpositionen.',
  'Rückstellung bilden (Risiko wahrscheinlich): Rückstellungsaufwand / Rückstellungen — der Aufwand erscheint im Jahr der wirtschaftlichen Verursachung.',
  'Rückstellung verwenden (Verpflichtung tritt ein): Rückstellungen / Bank — die Rückstellung wird durch die tatsächliche Zahlung verbraucht.',
  'Rückstellung auflösen (Risiko weggefallen): Rückstellungen / Rückstellungsertrag — der Überschuss wird erfolgswirksam aufgelöst.',
  'Schlüsselunterschied Trans. Passiven vs. Rückstellungen: Trans. Passiven — Betrag UND Fälligkeit bekannt; Rückstellungen — Betrag ODER Fälligkeit unbekannt. Nur Trans. Passiven werden am 1.1. automatisch rückgebucht.',
])

// ─── Quiz ─────────────────────────────────────────────────────────────────────

await addQuiz(ch, [
  {
    q: 'Jahresmiete CHF 12 000 wird am 1. April bezahlt (April–März nächstes Jahr). Welcher Betrag und welche Buchung ist per 31.12. korrekt?',
    opts: [
      ['Transitorische Aktiven 3 000 / Mietaufwand 3 000', true],
      ['Mietaufwand 3 000 / Transitorische Passiven 3 000', false],
      ['Transitorische Aktiven 9 000 / Mietaufwand 9 000', false],
      ['Keine Buchung nötig', false],
    ],
    exp: '3/12 von 12 000 = CHF 3 000 betreffen Jan.–März nächstes Jahr. Zahlung schon erfolgt, Aufwand betrifft nächstes Jahr → vorauszahlter Aufwand → Transitorische Aktiven. Buchung: Trans. Aktiven / Mietaufwand.',
    diff: 'medium',
  },
  {
    q: 'Was ist eine Transitorische Passive?',
    opts: [
      ['Noch nicht bezahlter Aufwand dieses Jahres ODER vorausbezahlter Ertrag', true],
      ['Vorauszahlter Aufwand für nächstes Jahr', false],
      ['Eine Art Rückstellung mit unbekanntem Betrag', false],
      ['Bereits erhaltener Ertrag, der dieses Jahr anfällt', false],
    ],
    exp: 'Transitorische Passiven entstehen, wenn am Abschluss eine Schuld besteht: entweder (1) Aufwand bereits angefallen aber noch nicht bezahlt, oder (2) Ertrag bereits kassiert aber Leistung noch nicht erbracht.',
    diff: 'easy',
  },
  {
    q: 'Buchungssatz am 1. Januar für eine Transitorische Passive, die einen Mietaufwand betrifft?',
    opts: [
      ['Transitorische Passiven / Mietaufwand', true],
      ['Mietaufwand / Transitorische Passiven', false],
      ['Transitorische Aktiven / Mietaufwand', false],
      ['Mietaufwand / Transitorische Aktiven', false],
    ],
    exp: 'Am 1.1. wird die Abgrenzungsbuchung vom 31.12. storniert (Gegenbuchung). Die Buchung am 31.12. war: Mietaufwand / Trans. Passiven → Storno am 1.1.: Trans. Passiven / Mietaufwand.',
    diff: 'medium',
  },
  {
    q: 'Ein Unternehmen hat einen laufenden Rechtsstreit. Der erwartete Verlust beträgt CHF 80 000, der genaue Betrag und Zeitpunkt sind aber unbekannt. Welche Buchung ist korrekt?',
    opts: [
      ['Rückstellungsaufwand 80 000 / Rückstellungen 80 000', true],
      ['A.o. Aufwand 80 000 / Transitorische Passiven 80 000', false],
      ['Rückstellungen 80 000 / Bank 80 000', false],
      ['Keine Buchung, da Betrag noch nicht bekannt', false],
    ],
    exp: 'Wahrscheinliche Verpflichtung aus vergangenem Ereignis, Betrag schätzbar aber Fälligkeit unbekannt → Rückstellung bilden. Buchung: Rückstellungsaufwand / Rückstellungen.',
    diff: 'medium',
  },
  {
    q: 'Was unterscheidet eine Transitorische Passive von einer Rückstellung?',
    opts: [
      ['Trans. Passiven: Betrag und Fälligkeit bekannt; Rückstellungen: Betrag oder Fälligkeit unbekannt', true],
      ['Trans. Passiven sind immer kleiner als Rückstellungen', false],
      ['Rückstellungen werden am 1.1. automatisch rückgebucht, Trans. Passiven nicht', false],
      ['Es gibt keinen buchhalterischen Unterschied', false],
    ],
    exp: 'Transitorische Passiven: Betrag UND Fälligkeit sind genau bekannt (z.B. Dezember-Lohn zahlbar im Januar). Rückstellungen: Betrag ODER Fälligkeit unsicher (z.B. Garantieverpflichtungen). Nur Trans. Passiven werden am 1.1. automatisch rückgebucht.',
    diff: 'medium',
  },
  {
    q: 'Ein Prozess wird mit CHF 50 000 zurückgestellt. Im Folgejahr kostet er nur CHF 30 000. Welche Buchungen sind nötig?',
    opts: [
      ['Rückstellungen 30 000 / Bank 30 000 UND Rückstellungen 20 000 / Rückstellungsertrag 20 000', true],
      ['Bank 50 000 / Rückstellungen 50 000', false],
      ['Rückstellungsaufwand 30 000 / Bank 30 000', false],
      ['Rückstellungen 50 000 / Rückstellungsertrag 50 000', false],
    ],
    exp: 'Verwendung des tatsächlichen Betrags: Rückstellungen / Bank (30 000). Restliche 20 000 sind nicht mehr benötigt → Auflösung: Rückstellungen / Rückstellungsertrag (20 000).',
    diff: 'hard',
  },
  {
    q: 'Was sind antizipative Buchungen?',
    opts: [
      ['Buchungen für wirtschaftlich bereits angefallene, aber noch nicht gezahlte Aufwände oder Erträge', true],
      ['Buchungen, die im nächsten Jahr vorgenommen werden', false],
      ['Buchungen für bereits bezahlte, aber noch nicht angefallene Aufwände', false],
      ['Buchungen, die nie rückgebucht werden', false],
    ],
    exp: 'Antizipative Buchungen erfassen Sachverhalte, die wirtschaftlich bereits verursacht sind, aber noch keinen Zahlungsfluss ausgelöst haben. Sie führen zu transitorischen Positionen in der Bilanz (Trans. Aktiven oder Trans. Passiven).',
    diff: 'medium',
  },
  {
    q: 'Kunde bezahlt Jahresabo CHF 2 400 im Oktober (gilt Oktober bis September nächstes Jahr). Buchung per 31.12.?',
    opts: [
      ['Mietertrag 1 800 / Transitorische Passiven 1 800', true],
      ['Transitorische Aktiven 1 800 / Mietertrag 1 800', false],
      ['Transitorische Passiven 600 / Mietertrag 600', false],
      ['Keine Buchung nötig', false],
    ],
    exp: '9/12 von 2 400 = CHF 1 800 betreffen Jan.–Sept. nächstes Jahr. Ertrag bereits kassiert, Leistung aber erst nächstes Jahr → vorausbezahlter Ertrag → Trans. Passiven. Buchung: Mietertrag / Trans. Passiven.',
    diff: 'hard',
  },
  {
    q: 'Darlehen CHF 120 000 zu 5% p.a. Zinsen werden jährlich im März für das Vorjahr gutgeschrieben. Buchung per 31.12.?',
    opts: [
      ['Transitorische Aktiven 6 000 / Zinsertrag 6 000', true],
      ['Zinsertrag 6 000 / Transitorische Passiven 6 000', false],
      ['Bank 6 000 / Zinsertrag 6 000', false],
      ['Keine Buchung, da Zahlung erst im März', false],
    ],
    exp: '120 000 × 5% = CHF 6 000 Jahreszins. Der Zins ist im laufenden Jahr wirtschaftlich verdient, aber noch nicht kassiert → noch nicht erhaltener Ertrag → Trans. Aktiven. Buchung 31.12.: Trans. Aktiven / Zinsertrag.',
    diff: 'medium',
  },
  {
    q: 'Wann darf keine Rückstellung gebildet werden?',
    opts: [
      ['Für reine Zukunftsinvestitionen ohne bestehende Verpflichtung aus einem vergangenen Ereignis', true],
      ['Wenn der Betrag noch nicht genau bekannt ist', false],
      ['Wenn die Verpflichtung erst nächstes Jahr fällig wird', false],
      ['Für Garantieverpflichtungen aus bereits verkauften Produkten', false],
    ],
    exp: 'Rückstellungen setzen ein vergangenes Ereignis voraus, das eine gegenwärtige Verpflichtung begründet. Reine Zukunftsinvestitionen (z.B. geplante Maschinenersatz) begründen keine bestehende Verpflichtung — für diese darf keine Rückstellung gebildet werden.',
    diff: 'hard',
  },
])

console.log('Kapitel 5: Zeitliche Abgrenzungen & Rueckstellungen erfolgreich erstellt.')
await client.end()
