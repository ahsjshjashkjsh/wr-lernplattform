import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function upsertTopic(slug, title, description, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,band,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'ShoppingCart','green','abschluss','frw','1',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title,
       description=EXCLUDED.description,
       icon=EXCLUDED.icon,
       color=EXCLUDED.color,
       "updatedAt"=NOW()`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function upsertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET
       title=EXCLUDED.title,
       subtitle=EXCLUDED.subtitle,
       summary=EXCLUDED.summary,
       "contentStatus"=EXCLUDED."contentStatus",
       "updatedAt"=NOW()`,
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
  // Delete options first (FK constraint), then questions
  const qRows = await client.query(`SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (const row of qRows.rows)
    await client.query(`DELETE FROM "QuizOption" WHERE "questionId"=$1`, [row.id])
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

const tId = await upsertTopic(
  'frw-warenkonten',
  'Warenkonten',
  'Einkauf und Verkauf von Handelswaren, Einstandspreis, Nettoerlös, Bruttogewinn und Bestandeskorrektur im Jahresabschluss.',
  2
)

// ─── Chapter ─────────────────────────────────────────────────────────────────

const ch = await upsertChapter(
  tId,
  'band1-warenkonten',
  'Warenkonten',
  'Warenaufwand, Warenerlöse, Warenvorrat und Bestandesänderung',
  1,
  `WARENHANDEL — Ein Handelsbetrieb kauft fertige Waren ein und verkauft sie ohne wesentliche Verarbeitung weiter. Daraus entstehen Aufwand (Warenaufwand) und Ertrag (Warenerlöse), deren Differenz den Bruttogewinn ergibt.

EINSTANDSPREIS — Der Einstandspreis ist der tatsächliche Beschaffungswert der eingekauften Waren: Katalogpreis minus Rabatt minus Skonto plus Bezugskosten. Er kann höher sein als der fakturierte Betrag, wenn selbst zu tragende Bezugskosten anfallen.

NETTOERLÖS — Der Nettoerlös ist der tatsächliche Verkaufsertrag: Katalogpreis minus Rabatt minus Skonto minus Versandkosten (wenn das Unternehmen sie trägt). Er ist die Grundlage für das Konto Warenerlöse.

BUCHUNGSLOGIK EINKAUF — Lieferantenrechnung: Warenaufwand / Kreditoren. Skonto genutzt: Kreditoren / Warenaufwand. Bezugskosten bar: Warenaufwand / Kasse. Rücksendung/Rabatt vom Lieferanten: Kreditoren / Warenaufwand.

BUCHUNGSLOGIK VERKAUF — Kundenrechnung: Debitoren / Warenerlöse. Kundenskonto: Warenerlöse / Debitoren. Versandkosten selbst getragen: Warenerlöse / Kasse. Retoure vom Kunden: Warenerlöse / Debitoren.

BESTANDESKORREKTUR — Das Konto Warenvorrat ist ein ruhendes Aktivkonto und wird nur beim Jahresabschluss angepasst. Bestandeszunahme (mehr eingekauft als verkauft): Warenvorrat / Warenaufwand — Aufwand sinkt, Gewinn steigt. Bestandesabnahme (mehr verkauft als eingekauft): Warenaufwand / Warenvorrat — Aufwand steigt, Gewinn sinkt. Nach der Korrektur zeigt der Warenaufwand den Einstandswert der verkauften Waren.`
)

// ─── Learning Goals ───────────────────────────────────────────────────────────

await addGoals(ch, [
  'Du kannst Wareneinkäufe und Warenverkäufe (auf Rechnung und bar) korrekt verbuchen.',
  'Du kannst den Einstandspreis und den Nettoerlös stufenweise berechnen.',
  'Du kannst Skonti, Rabatte, Rücksendungen und Bezugskosten buchhalterisch korrekt erfassen.',
  'Du kennst die Funktion des Warenvorrats als ruhendes Aktivkonto und weisst, warum es nur beim Abschluss bebucht wird.',
  'Du kannst die Bestandeskorrektur beim Jahresabschluss für alle drei Fälle (keine Änderung, Zunahme, Abnahme) durchführen und erklären.',
  'Du kannst den Bruttogewinn berechnen und ihn als Bruttogewinnzuschlag (in % des Warenaufwandes) und als Bruttogewinnquote (in % der Warenerlöse) ausdrücken.',
])

// ─── Key Terms ────────────────────────────────────────────────────────────────

await addTerms(ch, [
  ['Warenaufwand', 'Aufwandskonto für alle einkaufsbezogenen Geschäftsfälle: Lieferantenrechnungen, Bezugskosten sowie Korrekturen durch Skonti, Rabatte und Rücksendungen an Lieferanten. Vor der Bestandeskorrektur zeigt der Saldo den Einstandswert der eingekauften Waren; danach den Einstandswert der verkauften Waren.'],
  ['Warenerlöse', 'Ertragskonto für alle verkaufsbezogenen Geschäftsfälle: Rechnungen an Kunden, vermindert um Kundenskonti, Kundenrabatte, Retouren von Kunden und selbst getragene Versandkosten. Der Saldo entspricht dem Nettoerlös der Periode.'],
  ['Warenvorrat', 'Aktivkonto für den Lagerbestand an Handelswaren. Im behandelten System ein ruhendes Konto: Während des Geschäftsjahres wird es nicht laufend mit jeder Warenbewegung bebucht, sondern erst beim Jahresabschluss zur Bestandeskorrektur verwendet.'],
  ['Einstandspreis', 'Tatsächlicher Beschaffungswert der eingekauften Waren: Katalogpreis minus Rabatt minus Skonto plus Bezugskosten. Massgebend für den Warenaufwand und die Lagerbewertung.'],
  ['Nettoerlös', 'Tatsächlicher Verkaufsertrag: Katalogpreis minus Rabatt minus Skonto minus selbst getragene Versandkosten. Massgebend für das Konto Warenerlöse und die Bruttogewinnermittlung.'],
  ['Bruttogewinn', 'Differenz zwischen Warenerlösen und Warenaufwand (nach Bestandeskorrektur). Zeigt die Handelsspanne vor Abzug der Gemeinkosten. Erst wenn der Bruttogewinn die Gemeinkosten übersteigt, entsteht ein Reingewinn.'],
  ['Bruttogewinnzuschlag', 'Bruttogewinn ausgedrückt in Prozent des Warenaufwandes. Misst die Handelsspanne bezogen auf die Kostenbasis. Beispiel: CHF 12 390 / CHF 21 790 = 56.86 %.'],
  ['Bruttogewinnquote', 'Bruttogewinn ausgedrückt in Prozent der Warenerlöse. Misst den Gewinnanteil am Verkaufserlös. Beispiel: CHF 12 390 / CHF 34 180 = 36.25 %.'],
  ['Bestandesänderung', 'Differenz zwischen Schluss- und Anfangsbestand des Warenvorrats. Bestimmt die periodengerechte Korrektur des Warenaufwands beim Jahresabschluss: Zunahme senkt den Aufwand, Abnahme erhöht ihn.'],
  ['Bezugskosten', 'Zusätzliche Beschaffungskosten (Transport, Zoll, Transportversicherung), die der Käufer selbst trägt. Sie erhöhen den Einstandspreis und werden dem Warenaufwand zugerechnet.'],
])

// ─── Core Points (Merksätze) ──────────────────────────────────────────────────

await addPoints(ch, [
  'Wareneinkauf auf Rechnung: Warenaufwand / Kreditoren (Rechnungsbetrag nach Rabatt).',
  'Lieferantenskonto genutzt: Kreditoren / Warenaufwand — vermindert den Warenaufwand.',
  'Bezugskosten bar bezahlt: Warenaufwand / Kasse — erhöhen den Einstandspreis.',
  'Warenverkauf auf Rechnung: Debitoren / Warenerlöse.',
  'Kundenskonto gewährt: Warenerlöse / Debitoren — vermindert den Warenerlös.',
  'Retoure vom Kunden oder Rabatt an Kunden: Warenerlöse / Debitoren — Ertragsminderung.',
  'Das Konto Warenvorrat ruht während des Jahres; die Bestandeskorrektur erfolgt nur beim Jahresabschluss.',
  'Bestandeszunahme (Schlussbestand > Anfangsbestand): Warenvorrat / Warenaufwand — Aufwand sinkt, Bruttogewinn steigt.',
  'Bestandesabnahme (Schlussbestand < Anfangsbestand): Warenaufwand / Warenvorrat — Aufwand steigt, Bruttogewinn sinkt.',
  'Nach der Bestandeskorrektur zeigt der Saldo des Warenaufwands den Einstandswert der verkauften Waren der Periode.',
])

// ─── Quiz Questions ───────────────────────────────────────────────────────────

await addQuiz(ch, [
  {
    q: 'Wie wird ein Wareneinkauf auf Rechnung über CHF 1 656 (nach Rabatt) gebucht?',
    opts: [
      ['Warenaufwand 1 656 / Kreditoren 1 656', true],
      ['Kreditoren 1 656 / Warenaufwand 1 656', false],
      ['Warenaufwand 1 656 / Debitoren 1 656', false],
      ['Warenerlöse 1 656 / Kreditoren 1 656', false],
    ],
    exp: 'Der Einkauf auf Rechnung erzeugt Aufwand (Soll: Warenaufwand) und eine Verbindlichkeit gegenüber dem Lieferanten (Haben: Kreditoren).',
    diff: 'easy',
  },
  {
    q: 'Der Lieferant gewährt 2 % Skonto (CHF 33.10). Wie wird der Skontoabzug gebucht?',
    opts: [
      ['Kreditoren 33.10 / Warenaufwand 33.10', true],
      ['Warenaufwand 33.10 / Kreditoren 33.10', false],
      ['Bank 33.10 / Warenaufwand 33.10', false],
      ['Kreditoren 33.10 / Bank 33.10', false],
    ],
    exp: 'Skonto vermindert den Warenaufwand (Haben) und reduziert gleichzeitig die Verbindlichkeit gegenüber dem Lieferanten (Soll: Kreditoren).',
    diff: 'medium',
  },
  {
    q: 'Welche Formel ergibt den Einstandspreis?',
    opts: [
      ['Katalogpreis − Rabatt − Skonto + Bezugskosten', true],
      ['Katalogpreis − Rabatt + Skonto − Bezugskosten', false],
      ['Rechnungsbetrag nach Rabatt, ohne weitere Korrekturen', false],
      ['Warenerlöse − Warenaufwand', false],
    ],
    exp: 'Einstandspreis = tatsächlicher Beschaffungswert. Rabatt und Skonto senken ihn, Bezugskosten (Transport, Zoll, Versicherung) erhöhen ihn.',
    diff: 'easy',
  },
  {
    q: 'Elias trägt Versandkosten von CHF 22 für eine Kundenlieferung selbst. Wie wird gebucht?',
    opts: [
      ['Warenerlöse 22 / Kasse 22', true],
      ['Warenaufwand 22 / Kasse 22', false],
      ['Kasse 22 / Warenerlöse 22', false],
      ['Debitoren 22 / Warenerlöse 22', false],
    ],
    exp: 'Selbst getragene Versandkosten vermindern den Nettoerlös und werden als Ertragsminderung im Soll des Kontos Warenerlöse erfasst.',
    diff: 'medium',
  },
  {
    q: 'Der Schlussbestand des Warenvorrats (CHF 7 000) ist höher als der Anfangsbestand (CHF 5 000). Welche Buchung ist korrekt?',
    opts: [
      ['Warenvorrat 2 000 / Warenaufwand 2 000', true],
      ['Warenaufwand 2 000 / Warenvorrat 2 000', false],
      ['Warenerlöse 2 000 / Warenvorrat 2 000', false],
      ['Keine Buchung — der Warenvorrat ist ein ruhendes Konto', false],
    ],
    exp: 'Bestandeszunahme: Mehr eingekauft als verkauft. Der Warenaufwand war zu hoch; die Korrektur Warenvorrat / Warenaufwand senkt ihn und erhöht den Bruttogewinn.',
    diff: 'medium',
  },
  {
    q: 'Der Schlussbestand ist tiefer als der Anfangsbestand (Abnahme CHF 1 440). Was folgt daraus für den Bruttogewinn?',
    opts: [
      ['Der Bruttogewinn sinkt, weil der Warenaufwand steigt.', true],
      ['Der Bruttogewinn steigt, weil der Warenaufwand sinkt.', false],
      ['Der Bruttogewinn bleibt unverändert, weil nur Bestandskonten betroffen sind.', false],
      ['Der Bruttogewinn steigt, weil mehr Waren verkauft wurden.', false],
    ],
    exp: 'Bestandesabnahme: Buchung Warenaufwand / Warenvorrat erhöht den Warenaufwand um CHF 1 440. Höherer Aufwand bei gleichen Erlösen senkt den Bruttogewinn.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Unterschied zwischen Bruttogewinn und Reingewinn?',
    opts: [
      ['Der Bruttogewinn deckt noch keine Gemeinkosten; erst nach Abzug der Gemeinkosten ergibt sich der Reingewinn.', true],
      ['Der Bruttogewinn berücksichtigt keine Warenerlöse; der Reingewinn schon.', false],
      ['Bruttogewinn und Reingewinn sind in der Warenbuchhaltung identisch.', false],
      ['Der Reingewinn ist immer grösser als der Bruttogewinn.', false],
    ],
    exp: 'Bruttogewinn = Warenerlöse − Warenaufwand (Handelsspanne). Reingewinn = Bruttogewinn − Gemeinkosten. Deckt der Bruttogewinn die Gemeinkosten nicht, entsteht ein Reinverlust.',
    diff: 'easy',
  },
  {
    q: 'Warenerlöse CHF 34 180, Warenaufwand CHF 21 790. Wie hoch ist der Bruttogewinnzuschlag?',
    opts: [
      ['56.86 % (Bruttogewinn in % des Warenaufwandes)', true],
      ['36.25 % (Bruttogewinn in % der Warenerlöse)', false],
      ['63.75 % (Warenaufwand in % der Warenerlöse)', false],
      ['12 390 CHF (absoluter Bruttogewinn, kein Prozentsatz)', false],
    ],
    exp: 'Bruttogewinn = 34 180 − 21 790 = 12 390. Bruttogewinnzuschlag = 12 390 / 21 790 = 56.86 %. Die Bruttogewinnquote (auf Erlösbasis) wäre 36.25 %.',
    diff: 'hard',
  },
])

console.log('Band 1 — Warenkonten erfolgreich aktualisiert.')
await client.end()
