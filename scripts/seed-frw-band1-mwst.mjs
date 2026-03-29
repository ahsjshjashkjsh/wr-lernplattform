import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function insertTopic(slug, title, description, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,band,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'Percent','orange','abschluss','frw','1',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title,
       description=EXCLUDED.description,
       icon=EXCLUDED.icon,
       color=EXCLUDED.color,
       band=EXCLUDED.band,
       "order"=EXCLUDED."order",
       "updatedAt"=NOW()`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET
       title=EXCLUDED.title,
       subtitle=EXCLUDED.subtitle,
       "order"=EXCLUDED."order",
       "contentStatus"=EXCLUDED."contentStatus",
       summary=EXCLUDED.summary,
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
  // Delete options first (FK dependency), then questions
  const existing = await client.query(`SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (const row of existing.rows)
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

// ─── Topic ────────────────────────────────────────────────────────────────────

const tId = await insertTopic(
  'frw-mehrwertsteuer',
  'Mehrwertsteuer (MWST)',
  'Indirekte Allphasensteuer mit Vorsteuerabzug: Grundbegriffe, Steuersätze, Buchungslogik bei Einkauf und Verkauf, Korrekturen durch Skonti und Retouren, quartalsweiser Abschluss der MWST-Konten und Saldosteuersatzmethode.',
  3
)

// ─── Chapter ──────────────────────────────────────────────────────────────────

const ch = await insertChapter(tId,
  'band1-mwst',
  'Mehrwertsteuer (MWST)',
  'Vorsteuer, Umsatzsteuer, Steuersätze, Korrekturbuchungen und Quartalsabschluss',
  1,
  `GRUNDPRINZIP — Die MWST ist eine indirekte Allphasensteuer mit Vorsteuerabzug: Das Unternehmen ist Steuersubjekt (es rechnet ab), der Endkonsument ist Steuerträger (er trägt die Last im Kaufpreis). Abrechnungspflicht besteht ab CHF 100 000 steuerpflichtigem Jahresumsatz.
VORSTEUER UND UMSATZSTEUER — Vorsteuer (Konto 1170/1171) ist die beim Einkauf bezahlte MWST; sie kann von der geschuldeten Umsatzsteuer abgezogen werden. Umsatzsteuer (Konto 2200) ist die auf Verkäufen geschuldete MWST. An den Bund abzuliefern gilt: Umsatzsteuer − Vorsteuer = Zahllast.
STEUERSÄTZE — Normalsatz 7,7 % (Güter und DL allgemein); reduzierter Satz 2,5 % (Lebensmittel, Medikamente, Bücher, Zeitungen, Wasser); Sondersatz 3,7 % (Beherbergung); Export 0 % (Vorsteuerabzug bleibt); ausgenommene Umsätze ohne Vorsteuerabzug (Gesundheit, Bildung, Versicherungen, Vermietung Wohnungen).
BUCHUNGSLOGIK — Einkauf: Warenaufwand (netto) + Vorsteuer 1170 / Kreditoren (brutto). Verkauf: Debitoren (brutto) / Warenerlöse (netto) + Umsatzsteuer 2200. Investitionen/übrige Aufwände: Vorsteuer auf Konto 1171, nicht 1170.
KORREKTUREN — Skonti, Rabatte und Retouren korrigieren stets sowohl den Nettobetrag als auch die Vorsteuer bzw. Umsatzsteuer. Zahlungen nach bereits verbuchter Rechnung werden mit dem Bruttobetrag gebucht.
QUARTALSABSCHLUSS — Verb. MWST / Vorsteuer 1170 + Vorsteuer 1171; Differenz = Schuld an Steuerverwaltung; Zahlung: Verb. MWST / Bank. Danach Saldo null auf allen MWST-Konten.
SALDOSTEUERSATZMETHODE — Vereinfachtes Verfahren: steuerbarer Umsatz inkl. MWST × branchenspezifischer Saldosteuersatz. Zulässig bis CHF 5 005 000 Jahresumsatz inkl. MWST und Steuer < CHF 103 000. Abrechnung halbjährlich. Vorsteuern sind pauschal eingerechnet; keine Einzelerfassung nötig.`
)

// ─── Learning Goals ───────────────────────────────────────────────────────────

await addGoals(ch, [
  'Du kannst die Begriffe Steuersubjekt, Steuerobjekt und Steuerträger bei der MWST präzise unterscheiden.',
  'Du kennst alle MWST-Steuersätze (Normalsatz 7,7 %, Sondersatz 3,7 %, reduzierter Satz 2,5 %, Export 0 %, ausgenommene Umsätze) und deren Anwendungsbereiche.',
  'Du kannst Wareneinkäufe, Warenverkäufe sowie Investitionen und übrige Aufwände mit der korrekten Vorsteuer-/Umsatzsteuerbuchung erfassen.',
  'Du kannst Skonti, Rabatte und Retouren korrekt buchen und dabei sowohl den Nettobetrag als auch die Mehrwertsteuer berücksichtigen.',
  'Du kannst den quartalsweisen Abschluss der MWST-Konten (1170, 1171, Verbindlichkeiten MWST) Schritt für Schritt durchführen.',
  'Du kannst die Saldosteuersatzmethode erklären, die Zahllast berechnen und sie von der normalen Methode mit Vorsteuerabzug abgrenzen.',
])

// ─── Key Terms ────────────────────────────────────────────────────────────────

await addTerms(ch, [
  ['Steuersubjekt',
    'Natürliche oder juristische Person, die gegenüber der Steuerverwaltung abrechnungspflichtig ist. Bei der MWST: das Unternehmen ab CHF 100 000 steuerpflichtigem Jahresumsatz. Steuersubjekt und Steuerträger sind bei der MWST nicht identisch.'],
  ['Steuerträger',
    'Die Person, die die Steuer wirtschaftlich trägt. Bei der MWST sind dies die Endkonsumenten, weil sie die Steuer im Bruttoverkaufspreis bezahlen.'],
  ['Allphasensteuer mit Vorsteuerabzug',
    'Steuerstruktur, bei der MWST auf allen Produktions- und Handelsstufen erhoben wird, aber jedes Unternehmen die bezahlte Vorsteuer abziehen kann. Wirtschaftlich belastet wird dadurch nur der Mehrwert jeder Stufe, nicht der gesamte Umsatz.'],
  ['Vorsteuer (Konto 1170/1171)',
    'Beim Einkauf bezahlte MWST, die von der geschuldeten Umsatzsteuer abgezogen werden darf. Vorsteuer auf Waren- und Materialeinkäufen: Konto 1170. Vorsteuer auf Investitionen und übrige Aufwände: Konto 1171.'],
  ['Umsatzsteuer (Konto 2200)',
    'Auf eigenen Verkäufen geschuldete MWST; stellt eine Verbindlichkeit gegenüber der Steuerverwaltung dar. Beispiel: Netto CHF 5 000 × 7,7 % = Umsatzsteuer CHF 385.'],
  ['Normalsatz',
    '7,7 % MWST auf die meisten Güter und Dienstleistungen in der Schweiz (z. B. Kleider, Maschinen, Beratungen, Benzin, Strom).'],
  ['Reduzierter Satz',
    '2,5 % MWST auf Güter und Dienstleistungen des täglichen Bedarfs: Nahrungsmittel, alkoholfreie Getränke, Medikamente, Bücher, Zeitungen, Wasser, Pflanzen.'],
  ['Ausgenommene Umsätze',
    'Umsätze, die von der MWST ausgenommen sind (z. B. Gesundheitswesen, Bildung, Versicherungen, Kreditgeschäft, Vermietung von Wohnungen). Kein Vorsteuerabzug auf den dazugehörigen Einkäufen möglich — wichtige Abgrenzung zu Exporten mit 0 %.'],
  ['Saldosteuersatzmethode',
    'Vereinfachtes Abrechnungsverfahren: steuerbarer Umsatz inkl. MWST × branchenspezifischer Saldosteuersatz = Zahllast. Vorsteuern werden nicht einzeln erfasst, da sie pauschal im Satz eingerechnet sind. Abrechnung halbjährlich. Beispiel: CHF 224 500 × 5,1 % = CHF 11 449.50.'],
  ['Voraussetzungen Vorsteuerabzug',
    'Vorsteuern dürfen nur abgezogen werden, wenn die Belege vollständig sind: Name und Adresse Lieferant, MWST-Nummer Lieferant, Name Empfänger, Lieferdatum, genaue Bezeichnung der Leistung, Preis sowie MWST-Betrag oder -Satz.'],
])

// ─── Core Points ──────────────────────────────────────────────────────────────

await addPoints(ch, [
  'Die abzuliefernde MWST berechnet sich immer als: Umsatzsteuer − Vorsteuer = Zahllast an die Steuerverwaltung.',
  'Wareneinkauf (7,7 %): Warenaufwand (netto) + Vorsteuer 1170 / Kreditoren (brutto).',
  'Warenverkauf (7,7 %): Debitoren (brutto) / Warenerlöse (netto) + Umsatzsteuer 2200.',
  'Investitionen und übrige Aufwände (z. B. Fahrzeug, Werbung, Strom): Vorsteuer auf Konto 1171, nicht 1170.',
  'Skonti, Rabatte und Retouren beim Einkauf: Warenaufwand und Vorsteuer 1170 werden gleichzeitig reduziert.',
  'Skonti, Rabatte und Retouren beim Verkauf: Warenerlös und Umsatzsteuer 2200 werden gleichzeitig reduziert.',
  'Zahlungen nach bereits verbuchter Rechnung werden mit dem Bruttobetrag gebucht — keine separate MWST-Buchung bei der Zahlung.',
  'Exporte (0 % steuerbar): Vorsteuerabzug bleibt erhalten. Ausgenommene Umsätze: kein Vorsteuerabzug möglich.',
  'Quartalsabschluss: Verb. MWST / Vorsteuer 1170; Verb. MWST / Vorsteuer 1171; verbleibende Schuld per Bank bezahlen. Danach Saldo null auf allen MWST-Konten.',
  'Saldosteuersatzmethode zulässig bis CHF 5 005 000 Jahresumsatz inkl. MWST und Steuer < CHF 103 000; Abrechnung halbjährlich.',
])

// ─── Quiz Questions ───────────────────────────────────────────────────────────

await addQuiz(ch, [
  {
    q: 'Was bedeutet es, dass die MWST eine «indirekte Steuer» ist?',
    opts: [
      ['Steuersubjekt (abrechnungspflichtig) und Steuerträger (wirtschaftlich belastet) sind nicht identisch.', true],
      ['Die Steuer wird direkt vom Konsumenten an den Bund bezahlt.', false],
      ['Nur Unternehmen ab CHF 1 Mio. Umsatz müssen die Steuer abrechnen.', false],
      ['Die Steuer fällt nur auf der letzten Handelsstufe an.', false],
    ],
    exp: 'Bei der MWST rechnet das Unternehmen (Steuersubjekt) ab, aber die wirtschaftliche Last liegt beim Endkonsumenten (Steuerträger). Diese Trennung ist das Merkmal einer indirekten Steuer.',
    diff: 'easy',
  },
  {
    q: 'Wie hoch ist der Normalsatz der MWST in der Schweiz?',
    opts: [
      ['7,7 %', true],
      ['8,0 %', false],
      ['3,7 %', false],
      ['2,5 %', false],
    ],
    exp: 'Normalsatz = 7,7 %. Sondersatz (Beherbergung) = 3,7 %. Reduzierter Satz (Grundbedarf) = 2,5 %. Export = 0 %.',
    diff: 'easy',
  },
  {
    q: 'Ein Unternehmen kauft Waren für CHF 2 154 brutto (inkl. 7,7 % MWST). Wie lautet die korrekte Buchung?',
    opts: [
      ['Warenaufwand CHF 2 000 + Vorsteuer 1170 CHF 154 / Kreditoren CHF 2 154', true],
      ['Warenaufwand CHF 2 154 / Kreditoren CHF 2 154', false],
      ['Warenaufwand CHF 2 000 + Vorsteuer 1171 CHF 154 / Kreditoren CHF 2 154', false],
      ['Umsatzsteuer 2200 CHF 154 / Warenaufwand CHF 2 000 + Kreditoren CHF 154', false],
    ],
    exp: 'Beim Wareneinkauf wird der Nettobetrag (CHF 2 000) auf Warenaufwand und die Vorsteuer (CHF 154) auf Konto 1170 gebucht. Konto 1171 gilt für Investitionen und übrige Aufwände, nicht für Waren.',
    diff: 'medium',
  },
  {
    q: 'Welcher Unterschied besteht zwischen Vorsteuer 1170 und Vorsteuer 1171?',
    opts: [
      ['1170 = Vorsteuer auf Waren-/Materialeinkäufe; 1171 = Vorsteuer auf Investitionen und übrige Aufwände.', true],
      ['1170 = Vorsteuer Normalsatz; 1171 = Vorsteuer reduzierter Satz.', false],
      ['Beide sind gleichwertig und können beliebig verwendet werden.', false],
      ['1171 ist nur für Unternehmen mit Saldosteuersatzmethode relevant.', false],
    ],
    exp: 'Die Trennung ist sachlich: 1170 erfasst Vorsteuern aus dem Wareneinkauf, 1171 aus Investitionen (z. B. Fahrzeuge) und sonstigen betrieblichen Aufwänden (z. B. Werbung, Strom). Beide werden beim Quartalsabschluss übertragen.',
    diff: 'medium',
  },
  {
    q: 'Ein Lieferant gewährt nachträglich 10 % Rabatt auf eine bereits verbuchte Rechnung über CHF 6 462 brutto. Was muss gebucht werden?',
    opts: [
      ['Kreditoren / Warenaufwand (netto) + Vorsteuer 1170 (MWST-Anteil des Rabatts)', true],
      ['Kreditoren / Warenaufwand (Bruttobetrag des Rabatts)', false],
      ['Nur Warenaufwand, da die Vorsteuer bereits abgerechnet ist', false],
      ['Umsatzsteuer 2200 / Warenaufwand', false],
    ],
    exp: 'Nachträgliche Rabatte korrigieren stets sowohl den Nettoaufwand als auch die Vorsteuer. Die Vorsteuer im Rabatt beträgt CHF 46.20 (netto CHF 600 × 7,7 %); beide Positionen müssen reduziert werden.',
    diff: 'hard',
  },
  {
    q: 'Was gilt für ausgenommene Umsätze im Unterschied zu Exporten (0 %)?',
    opts: [
      ['Ausgenommene Umsätze berechtigen nicht zum Vorsteuerabzug; Exporte mit 0 % hingegen schon.', true],
      ['Exporte berechtigen nicht zum Vorsteuerabzug; ausgenommene Umsätze schon.', false],
      ['Beide berechtigen zum vollen Vorsteuerabzug.', false],
      ['Beide schliessen den Vorsteuerabzug aus.', false],
    ],
    exp: 'Exporte sind mit 0 % steuerbar — der Vorsteuerabzug bleibt vollständig erhalten. Ausgenommene Umsätze (z. B. Ärzte, Versicherungen, Wohnungsvermietung) sind von der Steuer ausgenommen, aber ohne Vorsteuerabzugsberechtigung.',
    diff: 'hard',
  },
  {
    q: 'Wie läuft der quartalsweise MWST-Abschluss korrekt ab?',
    opts: [
      ['Verb. MWST / Vorsteuer 1170; Verb. MWST / Vorsteuer 1171; Verb. MWST / Bank (Restschuld)', true],
      ['Vorsteuer 1170 / Umsatzsteuer; Vorsteuer 1171 / Umsatzsteuer; Bank / Umsatzsteuer', false],
      ['Warenaufwand / Vorsteuer 1170; Warenerlöse / Umsatzsteuer', false],
      ['Bank / Vorsteuer 1170; Bank / Vorsteuer 1171', false],
    ],
    exp: 'Die Vorsteuerkonten (1170, 1171) werden auf das Verbindlichkeitskonto MWST übertragen. Die verbleibende Differenz — Umsatzsteuer minus Vorsteuern — wird per Banküberweisung an die Steuerverwaltung bezahlt. Danach haben alle MWST-Konten Saldo null.',
    diff: 'medium',
  },
  {
    q: 'Wie wird die Zahllast bei der Saldosteuersatzmethode berechnet?',
    opts: [
      ['Steuerbarer Umsatz inkl. MWST × branchenspezifischer Saldosteuersatz', true],
      ['Nettoumsatz × Normalsatz 7,7 %', false],
      ['Umsatzsteuer minus tatsächlich bezahlte Vorsteuern', false],
      ['Nettoumsatz × (Normalsatz − Vorsteuerquote)', false],
    ],
    exp: 'Bei der Saldosteuersatzmethode wird der Bruttoumsatz (inkl. MWST) mit dem branchenspezifischen Satz multipliziert. Vorsteuern sind pauschal eingerechnet und werden nicht separat erfasst. Beispiel: CHF 224 500 × 5,1 % = CHF 11 449.50.',
    diff: 'medium',
  },
])

console.log('✅ Band 1 — Mehrwertsteuer (MWST) erfolgreich aktualisiert.')
await client.end()
