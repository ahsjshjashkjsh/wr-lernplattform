# Band 1 FRW Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5 neue Band 1 FRW-Topics in die DB einspielen und die /frw-Seite in zwei Sektionen (Band 2 oben, Band 1 unten) aufteilen.

**Architecture:** Jedes Topic bekommt ein eigenes idempotentes Seed-Script. Das frw/page.tsx filtert Topics nach band-Feld und rendert zwei getrennte Sektionen. Band 1 Karten sind sofort klickbar (kein Maintenance-Overlay).

**Tech Stack:** Node.js Seed-Scripts mit `pg` Client, Next.js Server Component (frw/page.tsx), Prisma Schema (band-Feld bereits vorhanden als `String?`)

---

## File Structure

| File | Action |
|------|--------|
| `scripts/seed-frw-band1-grundlagen.mjs` | Create |
| `scripts/seed-frw-band1-warenkonten.mjs` | Create |
| `scripts/seed-frw-band1-mwst.mjs` | Create |
| `scripts/seed-frw-band1-vst.mjs` | Create |
| `scripts/seed-frw-band1-fremde-waehrungen.mjs` | Create |
| `src/app/frw/page.tsx` | Modify (band-splitting) |

---

## Task 1: Seed — Grundlagen der Buchhaltung (Band 1, Kap. 1–8)

**Files:**
- Create: `scripts/seed-frw-band1-grundlagen.mjs`

- [ ] **Step 1: Create the seed script**

```js
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
     ON CONFLICT (slug) DO NOTHING`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO NOTHING`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}
async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

// ════════════════════════════════════════════
// TOPIC
// ════════════════════════════════════════════
const tId = await insertTopic(
  'frw-band1-grundlagen',
  'Grundlagen der Buchhaltung',
  'Doppelte Buchhaltung, Bilanz, Erfolgsrechnung, Jahresabschluss und gesetzliche Grundlagen nach OR.',
  1
)

const ch = await insertChapter(tId,
  'band1-grundlagen',
  'Grundlagen der Buchhaltung',
  'Bilanz, Erfolgsrechnung und Jahresabschluss',
  1,
  `DOPPELTE BUCHHALTUNG — Jeder Geschäftsfall wird in zwei Konten erfasst: einmal Soll, einmal Haben. Der Betrag ist identisch. So bleibt die rechnerische Konsistenz erhalten.
BILANZ UND ERFOLGSRECHNUNG — Bilanz = stichtagsbezogene Gegenüberstellung von Aktiven und Passiven. Aktiven = Passiven gilt immer. Erfolgsrechnung = periodenbezogene Gegenüberstellung von Aufwänden und Erträgen zur Ermittlung von Gewinn oder Verlust.
KONTENARTEN — Aktivkonten (Vermögen): Zunahmen Soll, Abnahmen Haben. Passivkonten (Schulden/EK): Zunahmen Haben, Abnahmen Soll. Aufwandskonten: kein Anfangsbestand, Zunahmen Soll. Ertragskonten: kein Anfangsbestand, Zunahmen Haben.
JAHRESABSCHLUSS — Ablauf: Eröffnungsbilanz → laufende Buchungen → Schlussbilanz I + Erfolgsrechnung → Gewinnverbuchung ins Eigenkapital → Schlussbilanz II.
GESETZLICHE GRUNDLAGEN — Buchführungspflicht OR: Einzelunternehmen ab CHF 500 000 Jahresumsatz; juristische Personen immer. Belegprinzip: Keine Buchung ohne Beleg. Aufbewahrungspflicht: 10 Jahre.`
)

await addGoals(ch, [
  'Du kennst die vier Grundgrössen der Buchhaltung: Vermögen, Schulden, Aufwände und Erträge.',
  'Du kannst Buchungssätze für typische Geschäftsvorfälle korrekt formulieren.',
  'Du verstehst den Unterschied zwischen Bilanzkonten und Erfolgskonten.',
  'Du kannst den vollständigen Ablauf eines Jahresabschlusses beschreiben.',
  'Du kennst die gesetzlichen Buchführungspflichten nach schweizerischem Obligationenrecht.',
])

await addTerms(ch, [
  ['Aktivkonto', 'Bilanzkonto für Vermögenswerte (Bank, Kasse, Fahrzeuge). Anfangsbestand und Zunahmen im Soll; Abnahmen und Schlussbestand im Haben.'],
  ['Passivkonto', 'Bilanzkonto für Schulden und Eigenkapital. Anfangsbestand und Zunahmen im Haben; Abnahmen und Schlussbestand im Soll.'],
  ['Eigenkapital', 'Aus Sicht der Buchhaltung eine Schuld des Unternehmens gegenüber dem Eigentümer. Verändert sich durch Einlagen, Bezüge, Gewinne und Verluste.'],
  ['Doppelte Buchhaltung', 'Jeder Geschäftsfall wird in zwei Konten erfasst — einmal im Soll, einmal im Haben — mit identischem Betrag.'],
  ['Bilanz', 'Stichtagsbezogene Gegenüberstellung von Aktiven (Mittelverwendung) und Passiven (Mittelherkunft). Es gilt immer: Aktiven = Passiven.'],
  ['Erfolgsrechnung', 'Periodenbezogene Gegenüberstellung von Aufwänden und Erträgen. Ergebnis: Reingewinn oder Reinverlust.'],
  ['Belegprinzip', '"Keine Buchung ohne Beleg" — jeder Geschäftsvorfall muss durch einen Beleg dokumentiert sein. Aufbewahrungspflicht: 10 Jahre.'],
  ['Buchführungspflicht OR', 'Einzelunternehmen und Personengesellschaften ab CHF 500 000 Jahresumsatz; juristische Personen (AG, GmbH) unabhängig vom Umsatz.'],
])

await addPoints(ch, [
  'Aktivkonten: Anfangsbestand + Zunahmen = Soll. Abnahmen + Schlussbestand = Haben.',
  'Passivkonten: Anfangsbestand + Zunahmen = Haben. Abnahmen + Schlussbestand = Soll.',
  'Erfolgskonten beginnen bei null. Aufwand: Zunahmen Soll. Ertrag: Zunahmen Haben.',
  'Jeder Buchungssatz: Sollkonto / Habenkonto, identischer Betrag.',
  'Jahresabschluss: Eröffnungsbilanz → Buchungen → Schlussbilanz I + ER → Gewinn ins EK → Schlussbilanz II.',
  'Bilanz = Stichtagsrechnung (ein Tag). Erfolgsrechnung = Periodenrechnung (ein Jahr).',
  'Buchführungspflicht: Einzelunternehmen ab CHF 500 000. Juristische Personen: immer.',
  'Aufwand ≠ Ausgabe: Abschreibungen = Aufwand ohne Ausgabe. Anlagenkauf = Ausgabe ohne sofortigen Aufwand.',
])

await addQuiz(ch, [
  {
    q: 'Was gilt für Aktivkonten?',
    opts: [
      ['Anfangsbestand und Zunahmen im Soll, Abnahmen im Haben', true],
      ['Anfangsbestand und Zunahmen im Haben, Abnahmen im Soll', false],
      ['Kein Anfangsbestand, Zunahmen im Soll', false],
      ['Kein Anfangsbestand, Zunahmen im Haben', false],
    ],
    exp: 'Aktivkonten zeigen Vermögenswerte. Zunahmen = Soll (links), Abnahmen = Haben (rechts).',
    diff: 'easy',
  },
  {
    q: 'Was ist Eigenkapital aus buchhalterischer Sicht?',
    opts: [
      ['Eine Schuld des Unternehmens gegenüber dem Eigentümer', true],
      ['Ein Aktivum (Vermögenswert) des Unternehmens', false],
      ['Ein Ertrag aus dem laufenden Geschäft', false],
      ['Ein Aufwand aus der Unternehmensgründung', false],
    ],
    exp: 'Das Unternehmen ist eine eigenständige wirtschaftliche Einheit. Die Einlage des Eigentümers = Schuld des Unternehmens → Eigenkapital ist ein Passivkonto.',
    diff: 'medium',
  },
  {
    q: 'Welche Aussage zur Bilanz ist korrekt?',
    opts: [
      ['Die Bilanz ist stichtagsbezogen und zeigt stets Aktiven = Passiven', true],
      ['Die Bilanz zeigt Aufwände und Erträge einer Periode', false],
      ['Bei Gewinn sind Aktiven grösser als Passiven', false],
      ['Die Bilanz wird monatlich erstellt', false],
    ],
    exp: 'Bilanz = Stichtagsrechnung. Aktiven = Passiven gilt immer (Gewinn ist im Eigenkapital enthalten).',
    diff: 'easy',
  },
  {
    q: 'Ab welchem Jahresumsatz sind Einzelunternehmen in der Schweiz buchführungspflichtig?',
    opts: [
      ['CHF 500 000', true],
      ['CHF 100 000', false],
      ['CHF 250 000', false],
      ['Immer, unabhängig vom Umsatz', false],
    ],
    exp: 'Nach OR: Einzelunternehmen und Personengesellschaften ab CHF 500 000 Jahresumsatz. Juristische Personen (AG, GmbH) sind immer buchführungspflichtig.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Unterschied zwischen Aufwand und Ausgabe?',
    opts: [
      ['Aufwand ist erfolgswirksam; Ausgabe ist liquiditätswirksam', true],
      ['Aufwand und Ausgabe sind immer identisch', false],
      ['Ausgabe ist erfolgswirksam; Aufwand ist liquiditätswirksam', false],
      ['Aufwand betrifft nur Bargeschäfte', false],
    ],
    exp: 'Abschreibungen = Aufwand ohne Ausgabe. Anlagenkauf = Ausgabe, aber kein sofortiger Aufwand (wird aktiviert).',
    diff: 'medium',
  },
  {
    q: 'Was besagt das Belegprinzip?',
    opts: [
      ['Keine Buchung ohne Beleg — jeder Geschäftsfall muss dokumentiert sein', true],
      ['Buchungen dürfen nur am Periodenende vorgenommen werden', false],
      ['Das Belegprinzip gilt nur für Bargeschäfte', false],
      ['Belege müssen nur für Beträge über CHF 1 000 aufbewahrt werden', false],
    ],
    exp: 'Belegprinzip = gesetzliche Grundregel der Buchführung. Aufbewahrungspflicht beträgt 10 Jahre.',
    diff: 'easy',
  },
])

console.log('✅ Band 1 — Grundlagen der Buchhaltung erfolgreich erstellt.')
await client.end()
```

- [ ] **Step 2: Run the script**

```bash
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" node scripts/seed-frw-band1-grundlagen.mjs
```

Expected: `✅ Band 1 — Grundlagen der Buchhaltung erfolgreich erstellt.`

- [ ] **Step 3: Verify in browser**

Navigate to `/frw/band1-grundlagen` — chapter page should load with Summary, Begriffe (8 terms), Quiz (6 questions).

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-frw-band1-grundlagen.mjs
git commit -m "Seed: Band 1 Grundlagen der Buchhaltung"
```

---

## Task 2: Seed — Warenkonten (Band 1, Kap. 9)

**Files:**
- Create: `scripts/seed-frw-band1-warenkonten.mjs`

- [ ] **Step 1: Create the seed script**

```js
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
     VALUES ($1,$2,$3,$4,'ShoppingCart','orange','abschluss','frw','1',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO NOTHING`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO NOTHING`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}
async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i+1])
}
async function addExamples(chId, examples) {
  for (let i = 0; i < examples.length; i++)
    await client.query(`INSERT INTO "Example" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), examples[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

const tId = await insertTopic(
  'frw-band1-warenkonten',
  'Warenkonten',
  'Einkauf und Verkauf von Handelswaren, Einstandspreis, Nettoerlös, Bruttogewinn und Bestandeskorrektur.',
  2
)

const ch = await insertChapter(tId,
  'band1-warenkonten',
  'Warenkonten',
  'Warenaufwand, Warenerlöse, Warenvorrat und Bestandesänderung',
  1,
  `WARENBUCHHALTUNG — Ein Handelsbetrieb kauft Waren ein und verkauft sie weiter. Warenaufwand erfasst alle einkaufsbezogenen Buchungen. Warenerlöse erfasst alle verkaufsbezogenen Buchungen.
EINSTANDSPREIS UND NETTOERLÖS — Einstandspreis = Katalogpreis − Rabatt − Skonto + Bezugskosten. Nettoerlös = Katalogpreis − Rabatt − Skonto − Versandkosten (wenn Unternehmen trägt).
BUCHUNGSLOGIK EINKAUF — Lieferantenrechnung: Warenaufwand / Kreditoren. Skontobuchung: Kreditoren / Warenaufwand. Bezugskosten: Warenaufwand / Kasse.
BUCHUNGSLOGIK VERKAUF — Kundenrechnung: Debitoren / Warenerlöse. Kundenskonto: Warenerlöse / Debitoren. Retour vom Kunden: Warenerlöse / Debitoren.
BESTANDESKORREKTUR — Warenvorrat ist ein ruhendes Konto — wird nur beim Jahresabschluss angepasst. Bestandeszunahme: Warenvorrat / Warenaufwand. Bestandesabnahme: Warenaufwand / Warenvorrat. Bruttogewinn = Warenerlöse − Warenaufwand (nach Korrektur).`
)

await addGoals(ch, [
  'Du kannst Wareneinkäufe und Warenverkäufe (auf Rechnung und bar) korrekt verbuchen.',
  'Du kennst die Ermittlung von Einstandspreis und Nettoerlös.',
  'Du kannst Skonti, Rabatte und Rücksendungen buchhalterisch korrekt behandeln.',
  'Du verstehst die Funktion des Warenvorrats als ruhendes Konto.',
  'Du kannst die Bestandskorrektur beim Jahresabschluss durchführen und erklären.',
])

await addTerms(ch, [
  ['Warenaufwand', 'Aufwandskonto für alle einkaufsbezogenen Geschäftsfälle: Lieferantenrechnungen, Bezugskosten, Skonti, Rabatte, Rücksendungen an Lieferanten.'],
  ['Warenerlöse', 'Ertragskonto für alle verkaufsbezogenen Geschäftsfälle: Kundenrechnungen abzüglich Skonti, Rabatte, Retouren von Kunden, Versandkosten.'],
  ['Warenvorrat', 'Aktivkonto für das Warenlager. Ruhendes Konto — wird während des Jahres nicht laufend bebuchtet. Bestandskorrektur nur beim Jahresabschluss.'],
  ['Einstandspreis', 'Effektiver Beschaffungswert der eingekauften Waren: Katalogpreis − Rabatt − Skonto + Bezugskosten.'],
  ['Nettoerlös', 'Effektiver Verkaufsertrag: Katalogpreis − Rabatt − Skonto − Versandkosten (wenn das Unternehmen sie trägt).'],
  ['Bruttogewinn', 'Warenerlöse − Warenaufwand (nach Bestandskorrektur). Zeigt die Handelsspanne vor Abzug der Gemeinkosten.'],
  ['Bestandesänderung', 'Differenz zwischen Anfangs- und Schlussbestand des Warenvorrats. Bestimmt die Korrektur des Warenaufwands beim Jahresabschluss.'],
  ['Bezugskosten', 'Zusätzliche Beschaffungskosten (Transport, Zoll, Versicherung), die den Einstandspreis erhöhen.'],
])

await addPoints(ch, [
  'Wareneinkauf auf Rechnung: Warenaufwand / Kreditoren (Bruttobetrag nach Rabatt).',
  'Lieferantenskonto genutzt: Kreditoren / Warenaufwand (vermindert den Aufwand).',
  'Bezugskosten bar: Warenaufwand / Kasse.',
  'Warenverkauf auf Rechnung: Debitoren / Warenerlöse.',
  'Kundenskonto gewährt: Warenerlöse / Debitoren (vermindert den Erlös).',
  'Warenretoure von Kunde: Warenerlöse / Debitoren.',
  'Bestandeszunahme (mehr eingekauft als verkauft): Warenvorrat / Warenaufwand.',
  'Bestandesabnahme (mehr verkauft als eingekauft): Warenaufwand / Warenvorrat.',
])

await addExamples(ch, [
  'EINSTANDSPREIS: 100 Stück à CHF 18.00 = CHF 1 800. Rabatt 8 % = CHF 144. Rechnungsbetrag CHF 1 656. Skonto 2 % = CHF 33.10. Zahlungsbetrag CHF 1 622.90. Bezugskosten CHF 217. Einstandspreis CHF 1 839.90.',
  'BESTANDESZUNAHME: Anfangsbestand CHF 5 000, Schlussbestand CHF 7 000. Differenz = +2 000. Buchung: Warenvorrat 2 000 / Warenaufwand 2 000.',
  'BESTANDESABNAHME: Anfangsbestand CHF 8 000, Schlussbestand CHF 6 000. Differenz = −2 000. Buchung: Warenaufwand 2 000 / Warenvorrat 2 000.',
])

await addQuiz(ch, [
  {
    q: 'Wie wird ein Wareneinkauf auf Rechnung (nach Rabatt CHF 3 400) gebucht?',
    opts: [
      ['Warenaufwand 3 400 / Kreditoren 3 400', true],
      ['Kreditoren 3 400 / Warenaufwand 3 400', false],
      ['Warenaufwand 3 400 / Debitoren 3 400', false],
      ['Warenerlöse 3 400 / Kreditoren 3 400', false],
    ],
    exp: 'Einkauf auf Rechnung: Aufwand entsteht (Soll) und Schuld beim Lieferanten entsteht (Haben).',
    diff: 'easy',
  },
  {
    q: 'Der Lieferant gewährt 2 % Skonto. Wie wird die Skontozahlung gebucht (Skonto CHF 68)?',
    opts: [
      ['Kreditoren 68 / Warenaufwand 68', true],
      ['Warenaufwand 68 / Kreditoren 68', false],
      ['Bank 68 / Warenaufwand 68', false],
      ['Kreditoren 68 / Bank 68', false],
    ],
    exp: 'Skonto vermindert den Warenaufwand (Haben). Die Verbindlichkeit (Kreditoren) wird ebenfalls reduziert (Soll).',
    diff: 'medium',
  },
  {
    q: 'Was versteht man unter dem Einstandspreis?',
    opts: [
      ['Katalogpreis − Rabatt − Skonto + Bezugskosten', true],
      ['Katalogpreis ohne Abzüge', false],
      ['Warenerlöse − Warenaufwand', false],
      ['Rechnungsbetrag nach Rabatt ohne Skonto und Bezugskosten', false],
    ],
    exp: 'Einstandspreis = effektiver Beschaffungswert der Waren, inkl. Bezugskosten, exkl. aller Abzüge.',
    diff: 'medium',
  },
  {
    q: 'Der Schlussbestand des Warenvorrats ist höher als der Anfangsbestand. Was wird gebucht?',
    opts: [
      ['Warenvorrat / Warenaufwand (Aufwand sinkt)', true],
      ['Warenaufwand / Warenvorrat (Aufwand steigt)', false],
      ['Warenerlöse / Warenvorrat', false],
      ['Keine Buchung nötig', false],
    ],
    exp: 'Bestandeszunahme = mehr eingekauft als verkauft. Warenaufwand war zu hoch — Korrektur: Warenvorrat / Warenaufwand.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Bruttogewinn?',
    opts: [
      ['Warenerlöse − Warenaufwand (nach Bestandskorrektur)', true],
      ['Reingewinn nach Abzug aller Gemeinkosten', false],
      ['Umsatz vor Abzug von Rabatten', false],
      ['Einstandspreis minus Katalogpreis', false],
    ],
    exp: 'Bruttogewinn = Handelsspanne. Aus ihm müssen noch die Gemeinkosten gedeckt werden, bevor der Reingewinn entsteht.',
    diff: 'easy',
  },
  {
    q: 'Ein Kunde retourniert Waren im Wert von CHF 500. Wie wird gebucht?',
    opts: [
      ['Warenerlöse 500 / Debitoren 500', true],
      ['Debitoren 500 / Warenerlöse 500', false],
      ['Warenaufwand 500 / Debitoren 500', false],
      ['Warenerlöse 500 / Kreditoren 500', false],
    ],
    exp: 'Retoure vom Kunden vermindert die Forderung (Debitoren sinken = Haben) und den Erlös (Warenerlöse sinken = Soll).',
    diff: 'medium',
  },
])

console.log('✅ Band 1 — Warenkonten erfolgreich erstellt.')
await client.end()
```

- [ ] **Step 2: Run the script**

```bash
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" node scripts/seed-frw-band1-warenkonten.mjs
```

Expected: `✅ Band 1 — Warenkonten erfolgreich erstellt.`

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-frw-band1-warenkonten.mjs
git commit -m "Seed: Band 1 Warenkonten"
```

---

## Task 3: Seed — Mehrwertsteuer (Band 1, Kap. 11)

**Files:**
- Create: `scripts/seed-frw-band1-mwst.mjs`

- [ ] **Step 1: Create the seed script**

```js
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
     VALUES ($1,$2,$3,$4,'Percent','green','abschluss','frw','1',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO NOTHING`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO NOTHING`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}
async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

const tId = await insertTopic(
  'frw-band1-mwst',
  'Mehrwertsteuer (MWST)',
  'Allphasensteuer mit Vorsteuerabzug, Buchungslogik bei Einkauf und Verkauf, quartalsweiser Abschluss, Saldosteuersatzmethode.',
  3
)

const ch = await insertChapter(tId,
  'band1-mwst',
  'Mehrwertsteuer (MWST)',
  'Vorsteuer, Umsatzsteuer, Steuersätze und Abschluss',
  1,
  `GRUNDPRINZIP — Die MWST ist eine indirekte Allphasensteuer mit Vorsteuerabzug. Das Unternehmen ist Steuersubjekt (rechnet ab), der Konsument ist Steuerträger (trägt die Last wirtschaftlich). Abrechnungspflicht ab CHF 100 000 Jahresumsatz.
VORSTEUER UND UMSATZSTEUER — Vorsteuer (Konto 1170/1171): beim Einkauf bezahlte MWST, kann abgezogen werden. Umsatzsteuer (Konto 2200): auf Verkäufen geschuldete MWST. An den Bund abzuliefern = Umsatzsteuer − Vorsteuer.
STEUERSÄTZE — Normalsatz 7,7 % (meiste Güter/DL). Reduzierter Satz 2,5 % (Lebensmittel, Medikamente). Sondersatz 3,7 % (Beherbergung). Exporte 0 % (Vorsteuerabzug bleibt). Ausgenommene Umsätze: kein Vorsteuerabzug.
BUCHUNGSLOGIK — Einkauf: Warenaufwand + Vorsteuer 1170 / Kreditoren (brutto). Verkauf: Debitoren (brutto) / Warenerlöse + Umsatzsteuer 2200.
QUARTALSABSCHLUSS — Umsatzsteuer 2200 / Vorsteuer 1170 + 1171. Restbetrag = geschuldete MWST. Zahlung: Umsatzsteuer 2200 / Bank.`
)

await addGoals(ch, [
  'Du kannst Vorsteuer und Umsatzsteuer korrekt unterscheiden und buchen.',
  'Du kennst alle MWST-Steuersätze (Normal, Reduziert, Sondersatz, Export, Ausgenommen).',
  'Du kannst den quartalsweisen Abschluss der MWST-Konten durchführen.',
  'Du verstehst das Prinzip der Allphasensteuer mit Vorsteuerabzug.',
  'Du kannst die Saldosteuersatzmethode erklären und abgrenzen.',
])

await addTerms(ch, [
  ['Steuersubjekt', 'Die natürliche oder juristische Person, die gegenüber der Steuerverwaltung abrechnungspflichtig ist. Bei der MWST: das Unternehmen ab CHF 100 000 Jahresumsatz.'],
  ['Steuerträger', 'Die Person, die die Steuer wirtschaftlich trägt — bei der MWST der Endkonsument, da die Steuer im Verkaufspreis enthalten ist.'],
  ['Vorsteuer (Konto 1170/1171)', 'Beim Einkauf bezahlte MWST. Kann von der geschuldeten Umsatzsteuer abgezogen werden. Konto 1170 für Waren/Material, 1171 für Investitionen/sonstiger Aufwand.'],
  ['Umsatzsteuer (Konto 2200)', 'Auf eigenen Verkäufen geschuldete MWST. Verbindlichkeit gegenüber der Steuerverwaltung.'],
  ['Normalsatz', '7,7 % MWST auf die meisten Güter und Dienstleistungen in der Schweiz.'],
  ['Reduzierter Satz', '2,5 % MWST auf Güter des täglichen Bedarfs (z.B. Lebensmittel, Medikamente, Bücher).'],
  ['Vorsteuerabzug', 'Das Recht, beim Einkauf bezahlte MWST von der geschuldeten Umsatzsteuer abzuziehen. Nur bei steuerbaren Umsätzen möglich.'],
  ['Saldosteuersatzmethode', 'Vereinfachtes Abrechnungsverfahren: steuerbarer Bruttoumsatz × branchenspezifischer Saldosteuersatz. Vorsteuern werden nicht separat erfasst.'],
])

await addPoints(ch, [
  'Wareneinkauf mit MWST 7,7 %: Warenaufwand (netto) + Vorsteuer 1170 / Kreditoren (brutto).',
  'Warenverkauf mit MWST 7,7 %: Debitoren (brutto) / Warenerlöse (netto) + Umsatzsteuer 2200.',
  'Investitionen/sonstiger Aufwand: Vorsteuer auf Konto 1171 (nicht 1170).',
  'Skonto/Rabatt nachträglich: korrigiert sowohl den Aufwand/Erlös als auch die Vorsteuer/Umsatzsteuer.',
  'Quartalsabschluss: Umsatzsteuer 2200 / Vorsteuer 1170 + 1171. Differenz = Zahlung an Bund.',
  'Exporte (0 % steuerbar): Vorsteuerabzug bleibt erhalten. Ausgenommene Umsätze: kein Vorsteuerabzug.',
  'Pflicht zur MWST-Abrechnung ab CHF 100 000 steuerbarem Jahresumsatz.',
])

await addQuiz(ch, [
  {
    q: 'Wie hoch ist der Normalsatz der MWST in der Schweiz?',
    opts: [
      ['7,7 %', true],
      ['8,0 %', false],
      ['5,0 %', false],
      ['2,5 %', false],
    ],
    exp: 'Normalsatz = 7,7 %. Reduzierter Satz = 2,5 % (Grundbedarf). Sondersatz = 3,7 % (Beherbergung).',
    diff: 'easy',
  },
  {
    q: 'Auf welchem Konto wird die beim Wareneinkauf bezahlte MWST erfasst?',
    opts: [
      ['Konto 1170 (Vorsteuer auf Warenaufwand)', true],
      ['Konto 1171 (Vorsteuer auf Investitionen)', false],
      ['Konto 2200 (Umsatzsteuer)', false],
      ['Direkt auf Warenaufwand, kein separates Konto', false],
    ],
    exp: 'Konto 1170 = Vorsteuer auf Waren/Material. Konto 1171 = Vorsteuer auf Investitionen und sonstiger Aufwand.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Unterschied zwischen Steuersubjekt und Steuerträger bei der MWST?',
    opts: [
      ['Steuersubjekt = abrechnungspflichtiges Unternehmen; Steuerträger = Endkonsument', true],
      ['Beide sind identisch — das Unternehmen', false],
      ['Steuersubjekt = Konsument; Steuerträger = Unternehmen', false],
      ['Steuersubjekt = Bund; Steuerträger = Unternehmen', false],
    ],
    exp: 'Die MWST ist eine indirekte Steuer: Subjekt (wer abrechnet) ≠ Träger (wer wirtschaftlich belastet ist).',
    diff: 'medium',
  },
  {
    q: 'Was wird beim quartalsweisen MWST-Abschluss gebucht?',
    opts: [
      ['Umsatzsteuer 2200 / Vorsteuer 1170 + 1171 (Differenz = Schuld an Bund)', true],
      ['Vorsteuer / Umsatzsteuer', false],
      ['Bank / Vorsteuer', false],
      ['Warenaufwand / Umsatzsteuer', false],
    ],
    exp: 'Die Vorsteuer (Guthaben) wird mit der Umsatzsteuer (Schuld) verrechnet. Die Differenz ist an die Steuerverwaltung zu bezahlen.',
    diff: 'medium',
  },
  {
    q: 'Was gilt für ausgenommene Umsätze?',
    opts: [
      ['Kein Vorsteuerabzug auf den dazugehörigen Einkäufen möglich', true],
      ['Vorsteuerabzug bleibt vollständig erhalten', false],
      ['Es gilt der Normalsatz 7,7 %', false],
      ['Ausgenommene Umsätze sind dasselbe wie Exporte (0 %)', false],
    ],
    exp: 'Ausgenommene Umsätze (z.B. Ärzte, Versicherungen) sind von der MWST befreit — aber ohne Vorsteuerabzugsberechtigung. Exporte hingegen sind mit 0 % steuerbar und berechtigen zum Vorsteuerabzug.',
    diff: 'hard',
  },
  {
    q: 'Ab welchem Jahresumsatz besteht MWST-Abrechnungspflicht?',
    opts: [
      ['CHF 100 000', true],
      ['CHF 500 000', false],
      ['CHF 50 000', false],
      ['Sofort ab dem ersten steuerbaren Umsatz', false],
    ],
    exp: 'MWST-Pflicht beginnt ab CHF 100 000 steuerbarem Jahresumsatz (nicht Gewinn, sondern Umsatz).',
    diff: 'easy',
  },
])

console.log('✅ Band 1 — Mehrwertsteuer (MWST) erfolgreich erstellt.')
await client.end()
```

- [ ] **Step 2: Run the script**

```bash
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" node scripts/seed-frw-band1-mwst.mjs
```

Expected: `✅ Band 1 — Mehrwertsteuer (MWST) erfolgreich erstellt.`

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-frw-band1-mwst.mjs
git commit -m "Seed: Band 1 Mehrwertsteuer"
```

---

## Task 4: Seed — Verrechnungssteuer (Band 1, Kap. 12.4)

**Files:**
- Create: `scripts/seed-frw-band1-vst.mjs`

- [ ] **Step 1: Create the seed script**

```js
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
     VALUES ($1,$2,$3,$4,'Shield','purple','abschluss','frw','1',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO NOTHING`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO NOTHING`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}
async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

const tId = await insertTopic(
  'frw-band1-vst',
  'Verrechnungssteuer (VST)',
  'Schweizer Quellensteuer auf Kapitalerträge: 35 % Abzug durch die Bank, Rückforderung über Steuererklärung, Buchung als Aktivkonto.',
  4
)

const ch = await insertChapter(tId,
  'band1-vst',
  'Verrechnungssteuer (VST)',
  'Sicherungssteuer, Abzug und Rückforderung, Buchung als Forderung',
  1,
  `WESEN DER VST — Die Verrechnungssteuer ist eine schweizerische Quellensteuer auf bestimmte Kapitalerträge. Steuersatz grundsätzlich 35 %. Spezialsatz 8 % bei Kapitalauszahlungen aus gemischten Lebensversicherungen.
BETROFFENE ERTRÄGE — Bankzinsen über CHF 200, Obligationenzinsen, Dividenden, Lotteriegewinne über CHF 1 000 000.
MECHANISMUS — Bank zieht 35 % ab und überweist sie an die Eidgenössische Steuerverwaltung (EStV). Der Kunde erhält nur 65 % des Bruttoertrags gutgeschrieben.
RÜCKFORDERUNG — In der Schweiz wohnhafte Personen können die 35 % über das Wertschriftenverzeichnis in der Steuererklärung zurückfordern — aber nur bei vollständiger Deklaration von Ertrag und Vermögen.
BUCHUNG — Zinsgutschrift CHF 1 000 brutto: Bank 650 + Forderung Verrechnungssteuer 350 / Zinsertrag 1 000. "Forderung Verrechnungssteuer" ist ein Aktivkonto (Forderung gegenüber EStV).`
)

await addGoals(ch, [
  'Du kennst den Steuersatz der Verrechnungssteuer (35 %) und die Ausnahme (8 %).',
  'Du weißt, welche Ertragsarten der Verrechnungssteuer unterliegen.',
  'Du kannst den Mechanismus von Abzug, Auszahlung und Rückforderung erklären.',
  'Du kannst das Konto "Forderung Verrechnungssteuer" als Aktivkonto korrekt einordnen und buchen.',
  'Du verstehst die Sicherungsfunktion der VST und die Folgen fehlender Deklaration.',
])

await addTerms(ch, [
  ['Verrechnungssteuer (VST)', 'Schweizerische Quellensteuer auf bestimmte Kapitalerträge. Standardsatz 35 %. Wird direkt bei der Auszahlung von der Bank abgezogen.'],
  ['Sicherungssteuer', 'Zweck der VST: Sicherstellung der korrekten Deklaration von Kapitalerträgen und Vermögen. Wer korrekt deklariert, erhält die 35 % zurück.'],
  ['Forderung Verrechnungssteuer', 'Aktivkonto — erfasst den Rückforderungsanspruch gegenüber der Eidgenössischen Steuerverwaltung. Steht in der Bilanz unter Forderungen.'],
  ['Wertschriftenverzeichnis', 'Beilage zur Steuererklärung, mit der Kapitalerträge und Vermögenswerte deklariert und die Rückerstattung der VST beantragt wird.'],
  ['Bruttoertrag', '100 % des Kapitalertrags vor Abzug der Verrechnungssteuer. Grundlage für die Berechnung der 35 % VST.'],
  ['Nachsteuer/Strafsteuer', 'Folge fehlender oder unvollständiger Deklaration. Bei Aufdeckung nicht deklarierter Kapitalerträge werden Nachsteuern und Strafsteuern erhoben.'],
])

await addPoints(ch, [
  'VST-Satz: grundsätzlich 35 %. Spezialsatz 8 % bei gemischten Lebensversicherungsauszahlungen.',
  'Steuerbare Erträge: Bankzinsen >CHF 200, Obligationenzinsen, Dividenden, Lotteriegewinne >CHF 1 Mio.',
  'Bank zahlt Kunden 65 % aus, 35 % gehen an Eidgenössische Steuerverwaltung.',
  'Rückforderung: Wertschriftenverzeichnis in Steuererklärung ausfüllen. Nur bei vollständiger Deklaration.',
  'Buchung Zinsgutschrift CHF 1 000 brutto: Bank 650 + Forderung VST 350 / Zinsertrag 1 000.',
  '"Forderung Verrechnungssteuer" = Aktivkonto (wie Debitoren). Steht unter Forderungen in der Bilanz.',
  'Sicherungsfunktion: VST schafft Anreiz zur Deklaration — nur deklarierte Erträge sind rückerstattungsfähig.',
])

await addQuiz(ch, [
  {
    q: 'Wie hoch ist der Standardsatz der Verrechnungssteuer?',
    opts: [
      ['35 %', true],
      ['25 %', false],
      ['8 %', false],
      ['7,7 %', false],
    ],
    exp: '35 % ist der Standardsatz. 8 % gilt als Spezialsatz nur für Kapitalauszahlungen bei gemischten Lebensversicherungen.',
    diff: 'easy',
  },
  {
    q: 'Wozu dient die Verrechnungssteuer primär?',
    opts: [
      ['Sicherstellung der korrekten Deklaration von Kapitalerträgen und Vermögen', true],
      ['Endgültige Besteuerung von Zinserträgen', false],
      ['Finanzierung der AHV/IV', false],
      ['Besteuerung von Warenimporten', false],
    ],
    exp: 'VST = Sicherungssteuer. Sie erzwingt Deklaration, weil nur deklarierte Erträge rückerstattet werden.',
    diff: 'medium',
  },
  {
    q: 'Wie viel erhält ein Bankkunde bei einem Zinsertrag von CHF 2 000 brutto gutgeschrieben?',
    opts: [
      ['CHF 1 300 (65 %)', true],
      ['CHF 2 000 (100 %)', false],
      ['CHF 1 500 (75 %)', false],
      ['CHF 700 (35 %)', false],
    ],
    exp: 'Bank zahlt 65 % aus: CHF 2 000 × 0.65 = CHF 1 300. Die restlichen CHF 700 (35 %) gehen an die EStV.',
    diff: 'easy',
  },
  {
    q: 'Wie wird das Konto "Forderung Verrechnungssteuer" eingeordnet?',
    opts: [
      ['Aktivkonto — Forderung gegenüber der Eidgenössischen Steuerverwaltung', true],
      ['Passivkonto — Schuld gegenüber der Steuerverwaltung', false],
      ['Aufwandskonto in der Erfolgsrechnung', false],
      ['Ertragskonto in der Erfolgsrechnung', false],
    ],
    exp: 'Die einbehaltene VST ist noch nicht verloren — sie ist ein Rückforderungsanspruch. Deshalb Aktivkonto (wie Debitoren), in der Bilanz unter Forderungen.',
    diff: 'medium',
  },
  {
    q: 'Wie wird eine Zinsgutschrift von CHF 1 000 brutto (35 % VST) gebucht?',
    opts: [
      ['Bank 650 + Forderung VST 350 / Zinsertrag 1 000', true],
      ['Zinsertrag 1 000 / Bank 650 + VST-Aufwand 350', false],
      ['Bank 1 000 / Zinsertrag 650 + VST 350', false],
      ['Bank 650 / Zinsertrag 650', false],
    ],
    exp: 'Der Bruttoertrag (1 000) wird als Ertrag erfasst. Die Bank zahlt nur 650 aus. Die 350 VST entstehen als Forderung gegenüber der EStV.',
    diff: 'hard',
  },
])

console.log('✅ Band 1 — Verrechnungssteuer (VST) erfolgreich erstellt.')
await client.end()
```

- [ ] **Step 2: Run the script**

```bash
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" node scripts/seed-frw-band1-vst.mjs
```

Expected: `✅ Band 1 — Verrechnungssteuer (VST) erfolgreich erstellt.`

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-frw-band1-vst.mjs
git commit -m "Seed: Band 1 Verrechnungssteuer"
```

---

## Task 5: Seed — Fremde Währungen Grundlagen (Band 1)

**Files:**
- Create: `scripts/seed-frw-band1-fremde-waehrungen.mjs`

- [ ] **Step 1: Create the seed script**

```js
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
     VALUES ($1,$2,$3,$4,'Globe','teal','abschluss','frw','1',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO NOTHING`,
    [topicId, slug, title, description, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO NOTHING`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}
async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i+1])
}
async function addExamples(chId, examples) {
  for (let i = 0; i < examples.length; i++)
    await client.query(`INSERT INTO "Example" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), examples[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

const tId = await insertTopic(
  'frw-band1-fremde-waehrungen',
  'Fremde Währungen — Grundlagen',
  'Wechselkurstabellen, Noten- vs. Devisenkurs, Ankauf/Verkauf aus Sicht der Bank, Währungsumrechnung CHF ↔ Fremdwährung.',
  5
)

const ch = await insertChapter(tId,
  'band1-fremde-waehrungen',
  'Fremde Währungen — Grundlagen',
  'Wechselkurstabellen, Kursnotierung und Umrechnung',
  1,
  `WECHSELKURSTABELLEN — Banken veröffentlichen Tabellen mit Noten- und Devisenkursen. Jede Währung hat vier Kurse: Noten Ankauf, Noten Verkauf, Devisen Ankauf, Devisen Verkauf.
NOTEN VERSUS DEVISEN — Notenkurse gelten für Bargeld (Banknoten, Münzen). Devisenkurse gelten für bargeldlose Zahlungen (Überweisungen, Kartentransaktionen). Für Unternehmen in der Buchhaltung sind Devisenkurse massgebend.
ANKAUF UND VERKAUF AUS SICHT DER BANK — Ankauf: Bank kauft Fremdwährung vom Kunden, gibt CHF heraus. Verkauf: Bank verkauft Fremdwährung an Kunden, erhält CHF. Der Ankaufskurs ist für den Kunden ungünstiger; die Bank verdient an der Kursspanne.
KURSNOTIERUNG — EUR, USD, GBP: Kurs pro 1 Einheit. JPY, NOK, SEK, DKK: Kurs pro 100 Einheiten. Kurs = Preis in CHF für 1 oder 100 Einheiten der Fremdwährung.
UMRECHNUNG — FW → CHF: Betrag × Kurs ÷ Notierungseinheit. CHF → FW: Betrag × Notierungseinheit ÷ Kurs.`
)

await addGoals(ch, [
  'Du kannst eine Wechselkurstabelle korrekt lesen und die vier Kursfelder unterscheiden.',
  'Du verstehst den Unterschied zwischen Noten- und Devisenkurs.',
  'Du kannst Ankauf und Verkauf aus Sicht der Bank korrekt einordnen.',
  'Du kannst Beträge von Fremdwährung in CHF und zurück umrechnen.',
  'Du weißt, wann der Kurs für 1 und wann für 100 Einheiten gilt.',
])

await addTerms(ch, [
  ['Notenkurs', 'Wechselkurs für Bargeldtransaktionen (physische Banknoten und Münzen). Weniger günstig als Devisenkurs.'],
  ['Devisenkurs', 'Wechselkurs für bargeldlose Zahlungen (Überweisungen, Kreditkartentransaktionen, Fremdwährungskonten). Für die Buchhaltung massgebend.'],
  ['Ankaufskurs (Bank)', 'Kurs, zu dem die Bank Fremdwährung vom Kunden kauft und CHF herausgibt. Für den Kunden: er erhält CHF.'],
  ['Verkaufskurs (Bank)', 'Kurs, zu dem die Bank Fremdwährung an den Kunden verkauft und CHF erhält. Für den Kunden: er gibt CHF aus.'],
  ['Kursnotierung', 'Wechselkurse werden entweder pro 1 Einheit (EUR, USD, GBP) oder pro 100 Einheiten (JPY, NOK, SEK) der Fremdwährung angegeben.'],
  ['Kursspanne (Spread)', 'Differenz zwischen Ankaufs- und Verkaufskurs der Bank. Stellt den Gewinn der Bank dar.'],
])

await addPoints(ch, [
  'Noten = Bargeld. Devisen = bargeldlos. Für die Unternehmensbuchhaltung immer Devisenkurse verwenden.',
  'Perspektive der Bank: Ankauf = Bank kauft FW vom Kunden. Verkauf = Bank verkauft FW an Kunden.',
  'EUR, USD, GBP: Kurs pro 1 FW-Einheit. JPY, NOK, SEK, DKK: Kurs pro 100 FW-Einheiten.',
  'FW → CHF: Betrag (in FW) × Kurs ÷ Notierungseinheit (1 oder 100).',
  'CHF → FW: Betrag (in CHF) × Notierungseinheit ÷ Kurs.',
  'Bank verdient an der Kursspanne: Ankaufskurs immer tiefer als Verkaufskurs.',
])

await addExamples(ch, [
  'EUR → CHF: EUR 3 000, Devisenkurs Ankauf 0.975 (pro 1 EUR). CHF = 3 000 × 0.975 ÷ 1 = CHF 2 925.',
  'CHF → EUR: CHF 5 000, Devisenkurs Verkauf 0.985 (pro 1 EUR). EUR = 5 000 × 1 ÷ 0.985 = EUR 5 076.14.',
  'NOK → CHF: NOK 50 000, Devisenkurs Ankauf 8.85 (pro 100 NOK). CHF = 50 000 × 8.85 ÷ 100 = CHF 4 425.',
])

await addQuiz(ch, [
  {
    q: 'Was ist ein Devisenkurs?',
    opts: [
      ['Wechselkurs für bargeldlose Zahlungen (Überweisungen, Buchgeld)', true],
      ['Wechselkurs für Bargeldtransaktionen', false],
      ['Durchschnittskurs über alle Währungen', false],
      ['Kurs aus Sicht des Kunden, nicht der Bank', false],
    ],
    exp: 'Devisen = bargeldlose Zahlungsformen. Für Unternehmensbuchhaltungen sind immer die Devisenkurse massgebend.',
    diff: 'easy',
  },
  {
    q: 'Was bedeutet "Ankaufskurs" aus Sicht der Bank?',
    opts: [
      ['Die Bank kauft Fremdwährung vom Kunden und zahlt CHF aus', true],
      ['Die Bank verkauft Fremdwährung an den Kunden', false],
      ['Der günstigere Kurs für den Kunden', false],
      ['Der Kurs gilt nur für Bargeldtransaktionen', false],
    ],
    exp: 'Ankauf und Verkauf sind immer aus Sicht der Bank. Ankauf: Bank erhält FW, gibt CHF. Verkauf: Bank gibt FW, erhält CHF.',
    diff: 'medium',
  },
  {
    q: 'Ein Schweizer Unternehmen exportiert Waren und erhält EUR 8 000. Devisenkurs Ankauf: 0.972 (pro 1 EUR). Wie viel CHF erhält das Unternehmen?',
    opts: [
      ['CHF 7 776', true],
      ['CHF 8 230', false],
      ['CHF 8 000', false],
      ['CHF 7 500', false],
    ],
    exp: '8 000 × 0.972 ÷ 1 = CHF 7 776. Die Bank kauft EUR vom Unternehmen (Ankaufskurs) und zahlt CHF aus.',
    diff: 'medium',
  },
  {
    q: 'Für welche Währungen gilt typischerweise eine Kursnotierung pro 100 Einheiten?',
    opts: [
      ['Japanischer Yen (JPY) und Norwegische Krone (NOK)', true],
      ['Euro (EUR) und US-Dollar (USD)', false],
      ['Britisches Pfund (GBP) und Schweizer Franken (CHF)', false],
      ['Alle Währungen werden pro 1 Einheit notiert', false],
    ],
    exp: 'JPY, NOK, SEK, DKK werden pro 100 Einheiten notiert, da ihre Einzelwerte sehr klein sind. EUR, USD, GBP pro 1 Einheit.',
    diff: 'medium',
  },
  {
    q: 'Ein Unternehmen möchte CHF 10 000 in USD wechseln. Devisenkurs Verkauf: 1.095 (pro 1 USD). Wie viel USD erhält es?',
    opts: [
      ['USD 9 132 (gerundet)', true],
      ['USD 10 950', false],
      ['USD 10 000', false],
      ['USD 8 951', false],
    ],
    exp: 'CHF → USD: 10 000 × 1 ÷ 1.095 = USD 9 132. Der Verkaufskurs der Bank wird verwendet, da der Kunde USD kauft.',
    diff: 'hard',
  },
])

console.log('✅ Band 1 — Fremde Währungen Grundlagen erfolgreich erstellt.')
await client.end()
```

- [ ] **Step 2: Run the script**

```bash
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" node scripts/seed-frw-band1-fremde-waehrungen.mjs
```

Expected: `✅ Band 1 — Fremde Währungen Grundlagen erfolgreich erstellt.`

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-frw-band1-fremde-waehrungen.mjs
git commit -m "Seed: Band 1 Fremde Währungen Grundlagen"
```

---

## Task 6: UI — frw/page.tsx in zwei Sektionen aufteilen

**Files:**
- Modify: `src/app/frw/page.tsx`

Current behavior: alle FRW-Topics in einem Grid.
New behavior: Band 2 oben (bestehend, mit Sektion-Header), Band 1 unten (neu, klickbar).

- [ ] **Step 1: Read the current file**

Read `src/app/frw/page.tsx` to confirm current state before editing.

- [ ] **Step 2: Update getFrwData and add band-splitting**

Replace the entire `FrwPage` function body. The `getFrwData` function stays unchanged. Changes:

1. After `const { topics, progressMap } = await getFrwData()`, add:
```tsx
const band2Topics = topics.filter(t => t.band !== '1')
const band1Topics  = topics.filter(t => t.band === '1')
```

2. Replace the `<div className="space-y-8">` content with:

```tsx
<div className="space-y-8">
  {/* Header */}
  <div className="flex items-start justify-between">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Calculator size={18} className="text-emerald-400" />
        <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">FRW</span>
      </div>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Finanz- &amp; Rechnungswesen
      </h1>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        {topics.length} Kapitel · Alle Inhalte direkt aus dem Lehrmittel
      </p>
    </div>
    <Link
      href="/frw/trainer"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0"
      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}
    >
      <Dumbbell size={14} />
      Buchungstrainer
    </Link>
  </div>

  {/* Band 2 Section */}
  {band2Topics.length > 0 && (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Band 2 — Vertiefung
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
      </div>
      <TopicGrid topics={band2Topics} progressMap={progressMap} />
    </div>
  )}

  {/* Band 1 Section */}
  {band1Topics.length > 0 && (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Band 1 — Grundlagen
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
      </div>
      <TopicGrid topics={band1Topics} progressMap={progressMap} />
    </div>
  )}
</div>
```

3. Extract the existing topic-card rendering into a `TopicGrid` component function **in the same file** (above `FrwPage`):

```tsx
function TopicGrid({
  topics,
  progressMap,
}: {
  topics: Awaited<ReturnType<typeof getFrwData>>['topics']
  progressMap: Map<string, string>
}) {
  if (topics.length === 0) return null
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map(topic => {
        const ch = topic.chapters[0]
        const kapitelNr = topic.order
        const colors = KAPITEL_COLORS[kapitelNr] ?? KAPITEL_COLORS[3]
        return (
          <Link
            key={topic.id}
            href={`/frw/${topic.slug}`}
            className="group relative rounded-2xl p-5 hover:-translate-y-0.5 hover:border-white/20"
            style={{
              background: 'var(--card-bg)',
              border: `1px solid var(--border-color)`,
              transition: 'transform 200ms, border-color 200ms',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }} />
                Kapitel {kapitelNr}
              </div>
              <ChevronRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
            <h2 className="text-sm font-semibold mb-1.5 leading-snug" style={{ color: 'var(--text-primary)' }}>
              {topic.title}
            </h2>
            <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>
              {topic.description}
            </p>
            {ch && (
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                {ch._count.bookingEntries > 0 && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Hash size={11} />
                    {ch._count.bookingEntries} Buchungen
                  </div>
                )}
                {ch._count.keyTerms > 0 && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <FileText size={11} />
                    {ch._count.keyTerms} Begriffe
                  </div>
                )}
                {ch._count.bookingEntries === 0 && ch._count.keyTerms === 0 && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>In Vorbereitung</span>
                )}
                {progressMap.get(ch.id) && (
                  <span
                    className="ml-auto flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Besucht
                  </span>
                )}
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Verify the page compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing unrelated errors).

- [ ] **Step 4: Check the page in the browser**

Navigate to `/frw` — should see two sections: "Band 2 — Vertiefung" and "Band 1 — Grundlagen". Band 1 cards show topics from the seed scripts. Both sections use the same card design.

- [ ] **Step 5: Commit**

```bash
git add src/app/frw/page.tsx
git commit -m "UI: FRW-Seite in Band 1 und Band 2 aufgeteilt"
```

---

## Self-Review

**Spec coverage:**
- ✅ 5 neue Band 1 Topics mit `band: '1'` → Tasks 1–5
- ✅ Slugs korrekt: frw-band1-grundlagen, frw-band1-warenkonten, frw-band1-mwst, frw-band1-vst, frw-band1-fremde-waehrungen
- ✅ Je 1 Chapter pro Topic, ContentStatus 'complete'
- ✅ Goals, Terms, CorePoints, Quiz in jedem Script
- ✅ UI zeigt zwei Sektionen (Band 2 oben, Band 1 unten) → Task 6
- ✅ Band 1 Karten klickbar (kein Maintenance-Overlay)

**Placeholder scan:** Keine TBDs, alle Scripts vollständig.

**Type consistency:** `TopicGrid` bekommt gleichen `topics`-Typ wie aus `getFrwData` — Type-Inference über `ReturnType`. `progressMap` ist `Map<string, string>` in allen Aufrufen.
