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
     VALUES ($1,$2,$3,$4,'BookOpen','blue','abschluss','frw','1',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title,
       description=EXCLUDED.description,
       icon=EXCLUDED.icon,
       color=EXCLUDED.color,
       "examType"=EXCLUDED."examType",
       category=EXCLUDED.category,
       band=EXCLUDED.band,
       "order"=EXCLUDED."order",
       published=EXCLUDED.published,
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
  const existingQs = await client.query(`SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (const row of existingQs.rows)
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
  'frw-bilanz-erfolgsrechnung',
  'Grundlagen der Buchhaltung',
  'Doppelte Buchhaltung, Bilanz, Erfolgsrechnung, Jahresabschluss und gesetzliche Grundlagen nach OR.',
  1
)

// ─── Chapter ──────────────────────────────────────────────────────────────────

const ch = await insertChapter(
  tId,
  'grundlagen-buchhaltung',
  'Grundlagen der Buchhaltung',
  'Bilanz, Erfolgsrechnung und Jahresabschluss',
  1,
  `DOPPELTE BUCHHALTUNG — Jeder Geschäftsfall wird in mindestens zwei Konten erfasst: einmal im Soll, einmal im Haben. Der Betrag ist identisch. So bleibt die rechnerische Konsistenz erhalten, und wirtschaftliche Zusammenhänge werden vollständig abgebildet.
BILANZ UND ERFOLGSRECHNUNG — Die Bilanz ist eine stichtagsbezogene Gegenüberstellung von Aktiven (Mittelverwendung) und Passiven (Mittelherkunft); es gilt stets: Aktiven = Passiven. Die Erfolgsrechnung ist eine periodenbezogene Gegenüberstellung von Aufwänden und Erträgen und ermittelt Reingewinn oder Reinverlust.
KONTENARTEN — Aktivkonten (Vermögen): Anfangsbestand und Zunahmen im Soll, Abnahmen und Schlussbestand im Haben. Passivkonten (Schulden und Eigenkapital): Anfangsbestand und Zunahmen im Haben, Abnahmen und Schlussbestand im Soll. Aufwandskonten: kein Anfangsbestand, Zunahmen im Soll. Ertragskonten: kein Anfangsbestand, Zunahmen im Haben.
JAHRESABSCHLUSS — Ablauf: Eröffnungsbilanz → laufende Buchungen → Schlussbilanz I und Erfolgsrechnung → Erfolgsverbuchung ins Eigenkapital → Schlussbilanz II. Schlussbilanz I zeigt den Erfolg noch separat; Schlussbilanz II enthält ihn bereits im Eigenkapital.
GESETZLICHE GRUNDLAGEN — Buchführungspflicht nach OR: Einzelunternehmen und Personengesellschaften ab CHF 500 000 Jahresumsatz; juristische Personen (AG, GmbH) unabhängig vom Umsatz. Es gelten Belegprinzip («Keine Buchung ohne Beleg»), Aufbewahrungspflicht von 10 Jahren und Verrechnungsverbot (Bruttoprinzip).`
)

// ─── Learning Goals ───────────────────────────────────────────────────────────

await addGoals(ch, [
  'Du kennst die vier Grundgrössen der Buchhaltung: Vermögen, Schulden, Aufwände und Erträge.',
  'Du kannst Buchungssätze für typische Geschäftsvorfälle korrekt mit Sollkonto, Habenkonto und Betrag formulieren.',
  'Du verstehst den Unterschied zwischen Bilanzkonten (Bestände) und Erfolgskonten (periodische Erfolgsgrössen).',
  'Du kannst den vollständigen Ablauf eines Jahresabschlusses von der Eröffnungsbilanz bis zur Schlussbilanz II beschreiben.',
  'Du kennst die gesetzlichen Buchführungspflichten nach schweizerischem Obligationenrecht sowie das Belegprinzip und die Aufbewahrungspflicht.',
  'Du verstehst den Unterschied zwischen Aufwand und Ausgabe sowie zwischen Ertrag und Einnahme und kannst Beispiele nennen.',
])

// ─── Key Terms ────────────────────────────────────────────────────────────────

await addTerms(ch, [
  ['Doppelte Buchhaltung', 'System, bei dem jeder Geschäftsfall in mindestens zwei Konten erfasst wird — einmal im Soll, einmal im Haben — mit identischem Betrag. Dadurch bleibt die rechnerische Konsistenz erhalten.'],
  ['Aktivkonto', 'Bilanzkonto zur Erfassung von Vermögenswerten (z. B. Bank, Kasse, Mobiliar, Fahrzeuge). Anfangsbestand und Zunahmen stehen im Soll; Abnahmen und Schlussbestand im Haben.'],
  ['Passivkonto', 'Bilanzkonto zur Erfassung von Schulden und Eigenkapital (z. B. Verbindlichkeiten L+L, Bankdarlehen, Eigenkapital). Anfangsbestand und Zunahmen stehen im Haben; Abnahmen und Schlussbestand im Soll.'],
  ['Eigenkapital', 'Aus Sicht der Buchhaltung eine Schuld des Unternehmens gegenüber den Eigentümern. Verändert sich durch Einlagen, Entnahmen, Gewinne und Verluste. Es ist die zentrale Passivposition, die Bilanz und Erfolg verbindet.'],
  ['Bilanz', 'Stichtagsbezogene Gegenüberstellung von Aktiven (Mittelverwendung) und Passiven (Mittelherkunft). Es gilt stets: Aktiven = Passiven. Kann in Kontenform oder Staffelform dargestellt werden.'],
  ['Erfolgsrechnung', 'Periodenbezogene Gegenüberstellung von Aufwänden (Wertverzehr) und Erträgen (Wertzuwachs). Ergebnis ist Reingewinn oder Reinverlust, der anschliessend ins Eigenkapital überführt wird.'],
  ['Aufwand', 'Erfolgswirksamer Wertverzehr innerhalb einer Periode. Vermindert den Gewinn. Nicht identisch mit Ausgabe: Abschreibungen sind Aufwand ohne gleichzeitige Auszahlung.'],
  ['Abschreibung', 'Periodische Wertminderung des Anlagevermögens, die als Aufwand erfasst wird. Sie ist liquiditätsunwirksam, da keine Auszahlung stattfindet, vermindert aber den Gewinn.'],
  ['Buchungssatz', 'Formale Anweisung zur Verbuchung eines Geschäftsvorfalls: enthält Sollkonto, Habenkonto, Text und Betrag. Kernoperation der doppelten Buchhaltung.'],
  ['Belegprinzip', '«Keine Buchung ohne Beleg» — jeder Geschäftsvorfall muss durch einen Beleg (Papier oder elektronisch) dokumentiert sein. Die Aufbewahrungspflicht beträgt 10 Jahre.'],
])

// ─── Core Points ──────────────────────────────────────────────────────────────

await addPoints(ch, [
  'Aktivkonten: Anfangsbestand + Zunahmen = Soll. Abnahmen + Schlussbestand = Haben.',
  'Passivkonten: Anfangsbestand + Zunahmen = Haben. Abnahmen + Schlussbestand = Soll.',
  'Erfolgskonten beginnen bei null. Aufwand: Zunahmen im Soll, Abschluss im Haben. Ertrag: Zunahmen im Haben, Abschluss im Soll.',
  'Jeder Buchungssatz: Sollkonto / Habenkonto, identischer Betrag — eine Buchung trifft stets mindestens zwei Konten.',
  'Jahresabschluss-Ablauf: Eröffnungsbilanz → laufende Buchungen → Schlussbilanz I + Erfolgsrechnung → Gewinn/Verlust ins EK → Schlussbilanz II.',
  'Bilanz = Stichtagsrechnung (ein Zeitpunkt). Erfolgsrechnung = Periodenrechnung (eine Zeitspanne, typisch ein Jahr).',
  'Buchführungspflicht nach OR: Einzelunternehmen ab CHF 500 000 Jahresumsatz. Juristische Personen (AG, GmbH) immer.',
  'Aufwand ≠ Ausgabe: Abschreibungen = Aufwand ohne Ausgabe. Anlagenkauf = Ausgabe, wird zunächst aktiviert, nicht sofort als Aufwand verbucht.',
  'Verrechnungsverbot (Bruttoprinzip): Aktiven und Passiven sowie Aufwand und Ertrag dürfen nicht miteinander verrechnet werden.',
  'Stornobuchung: Fehlerhafte Buchungen werden nicht gelöscht, sondern durch eine Gegenbuchung neutralisiert und korrekt neu erfasst.',
])

// ─── Quiz Questions ───────────────────────────────────────────────────────────

await addQuiz(ch, [
  {
    q: 'Was gilt für Aktivkonten in der doppelten Buchhaltung?',
    opts: [
      ['Anfangsbestand und Zunahmen im Soll, Abnahmen und Schlussbestand im Haben', true],
      ['Anfangsbestand und Zunahmen im Haben, Abnahmen und Schlussbestand im Soll', false],
      ['Kein Anfangsbestand; Zunahmen im Soll, Abschluss im Haben', false],
      ['Kein Anfangsbestand; Zunahmen im Haben, Abschluss im Soll', false],
    ],
    exp: 'Aktivkonten bilden Vermögenswerte ab. Zunahmen des Vermögens stehen links (Soll); Abnahmen stehen rechts (Haben). Damit unterscheiden sie sich von Passivkonten, die spiegelverkehrt funktionieren.',
    diff: 'easy',
  },
  {
    q: 'Was ist Eigenkapital aus buchhalterischer Sicht?',
    opts: [
      ['Eine Schuld des Unternehmens gegenüber den Eigentümern', true],
      ['Ein Aktivum — also ein Vermögenswert des Unternehmens', false],
      ['Ein Ertrag aus dem laufenden Geschäftsbetrieb', false],
      ['Ein Aufwand aus der Unternehmensgründung', false],
    ],
    exp: 'Das Unternehmen wird als eigenständige wirtschaftliche Einheit betrachtet, getrennt vom Privatbereich der Eigentümer. Die Kapitaleinlage erscheint im Unternehmen daher als Schuld gegenüber der Eigentümerin. Eigenkapital ist deshalb ein Passivkonto.',
    diff: 'medium',
  },
  {
    q: 'Welche Aussage zur Bilanz ist korrekt?',
    opts: [
      ['Die Bilanz ist stichtagsbezogen und zeigt stets Aktiven = Passiven', true],
      ['Die Bilanz zeigt Aufwände und Erträge einer Rechnungsperiode', false],
      ['Bei einem Gewinn sind die Aktiven grösser als die Passiven', false],
      ['Die Bilanz wird zwingend monatlich erstellt', false],
    ],
    exp: 'Die Bilanz ist eine Stichtagsrechnung — sie zeigt Vermögen und Schulden an einem bestimmten Tag. Aktiven = Passiven gilt immer, weil ein allfälliger Gewinn bereits im Eigenkapital enthalten ist.',
    diff: 'easy',
  },
  {
    q: 'Ab welchem Jahresumsatz sind Einzelunternehmen in der Schweiz zur doppelten Buchführung verpflichtet?',
    opts: [
      ['CHF 500 000', true],
      ['CHF 100 000', false],
      ['CHF 250 000', false],
      ['Immer, unabhängig vom Umsatz', false],
    ],
    exp: 'Nach dem Obligationenrecht sind Einzelunternehmen und Personengesellschaften ab CHF 500 000 Jahresumsatz buchführungspflichtig. Juristische Personen (AG, GmbH) sind unabhängig vom Umsatz immer buchführungspflichtig.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Unterschied zwischen Aufwand und Ausgabe?',
    opts: [
      ['Aufwand ist erfolgswirksam; Ausgabe ist liquiditätswirksam', true],
      ['Aufwand und Ausgabe sind in der Buchhaltung stets identisch', false],
      ['Ausgabe ist erfolgswirksam; Aufwand ist liquiditätswirksam', false],
      ['Aufwand betrifft ausschliesslich Bargeschäfte', false],
    ],
    exp: 'Abschreibungen sind ein typisches Beispiel für Aufwand ohne Ausgabe: Sie vermindern den Gewinn, aber es fliesst kein Geld ab. Umgekehrt ist der Kauf einer Maschine eine Ausgabe, aber kein sofortiger Aufwand — sie wird zunächst aktiviert.',
    diff: 'medium',
  },
  {
    q: 'Was besagt das Belegprinzip?',
    opts: [
      ['Keine Buchung ohne Beleg — jeder Geschäftsvorfall muss dokumentiert sein', true],
      ['Buchungen dürfen nur am Periodenende vorgenommen werden', false],
      ['Das Belegprinzip gilt ausschliesslich für Bargeschäfte', false],
      ['Belege müssen nur für Beträge über CHF 1 000 aufbewahrt werden', false],
    ],
    exp: 'Das Belegprinzip ist eine gesetzliche Grundregel der ordnungsmässigen Buchführung. Belege können auf Papier oder elektronisch vorliegen. Die Aufbewahrungspflicht beträgt 10 Jahre.',
    diff: 'easy',
  },
  {
    q: 'Was zeigt die Schlussbilanz II im Vergleich zur Schlussbilanz I?',
    opts: [
      ['Der Erfolg ist im Eigenkapital enthalten und nicht mehr separat sichtbar', true],
      ['Die Schlussbilanz II enthält zusätzlich die Erfolgsrechnung', false],
      ['In der Schlussbilanz II ist der Gewinn noch als eigene Position ausgewiesen', false],
      ['Die Schlussbilanz II entspricht der Eröffnungsbilanz des laufenden Jahres', false],
    ],
    exp: 'Nach der Erfolgsverbuchung wird der Gewinn oder Verlust dem Eigenkapital zugeordnet. In der Schlussbilanz II ist der Erfolg dadurch nicht mehr separat sichtbar — er ist bereits im Eigenkapital enthalten. Die Schlussbilanz II ist gleichzeitig die Grundlage der nächsten Eröffnungsbilanz.',
    diff: 'medium',
  },
  {
    q: 'Welches der folgenden Konten ist ein Erfolgskonto?',
    opts: [
      ['Lohnaufwand', true],
      ['Fahrzeuge', false],
      ['Verbindlichkeiten aus Lieferungen und Leistungen', false],
      ['Eigenkapital', false],
    ],
    exp: 'Erfolgskonten erfassen periodenbezogene, erfolgswirksame Veränderungen. Lohnaufwand ist ein Aufwandskonto und damit ein Erfolgskonto. Fahrzeuge (Aktivkonto), Verbindlichkeiten L+L (Passivkonto) und Eigenkapital (Passivkonto) sind Bilanzkonten.',
    diff: 'easy',
  },
  {
    q: 'Was bewirkt eine Buchung zwischen einem Bilanzkonto und einem Erfolgskonto?',
    opts: [
      ['Sie ist erfolgswirksam und verändert den Gewinn', true],
      ['Sie ist erfolgsunwirksam und verändert nur Bestände', false],
      ['Sie ist nur bei Jahresabschlüssen zulässig', false],
      ['Sie betrifft ausschliesslich Eigenkapitalbewegungen', false],
    ],
    exp: 'Buchungen zwischen Bilanzkonten sind erfolgsunwirksam — sie verschieben nur Bestände. Sobald ein Erfolgskonto (Aufwand oder Ertrag) betroffen ist, wird der Gewinn verändert; die Buchung ist damit erfolgswirksam.',
    diff: 'hard',
  },
  {
    q: 'Was ist der Kontenrahmen KMU?',
    opts: [
      ['Ein standardisiertes Ordnungssystem mit möglichen Konten für KMU in der Schweiz', true],
      ['Die konkrete Liste der Konten, die ein bestimmtes Unternehmen verwendet', false],
      ['Eine gesetzlich vorgeschriebene Mindestgliederung der Jahresrechnung', false],
      ['Ein Buchungsjournal für Klein- und Mittelunternehmen', false],
    ],
    exp: 'Der Kontenrahmen KMU ist ein allgemeines Ordnungssystem mit Klassen, Hauptgruppen, Gruppen und Einzelkonten. Der konkrete Kontenplan eines Unternehmens ist die unternehmensspezifische Auswahl daraus — angepasst an Branche, Grösse und Rechtsform.',
    diff: 'hard',
  },
])

console.log('✅ Band 1 — Grundlagen der Buchhaltung erfolgreich aktualisiert.')
await client.end()
