import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function insertTopic(slug, title, description, examType, order) {
  const topicId = id()
  await client.query(`INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt") VALUES ($1,$2,$3,$4,'Globe','blue',$5,'frw',$6,true,NOW(),NOW()) ON CONFLICT (slug) DO NOTHING`,
    [topicId, slug, title, description, examType, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}
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

const tId = await insertTopic('frw-abschreibungen', 'Abschreibungen', 'Lineare und degressive Abschreibung, direkte und indirekte Methode, Verkauf von Anlagegütern.', 'abschluss', 12)

const ch = await insertChapter(tId,
  'abschreibungen',
  'Abschreibungen',
  'Linear, degressiv, direkt und indirekt — Anlagegüter korrekt abschreiben',
  1,
  `Abschreibungen erfassen die Wertverminderung von Anlagegütern (technischer Verschleiss, wirtschaftliche Überalterung, Zeitablauf) über ihre Nutzungsdauer.

GRUNDBEGRIFFE:
• Anschaffungswert (AW): Kaufpreis + alle Nebenkosten (Transport, Montage, Zoll)
• Buchwert (BW): AW minus kumulierte Abschreibungen = aktueller Bilanzwert
• Restwert: Geplanter Wert am Ende der Nutzungsdauer (oft CHF 0 oder symbolisch CHF 1)
• Nutzungsdauer: Geplante Einsatzdauer des Anlageguts
• Kumulierte Abschreibungen: Summe aller bisherigen Abschreibungen

METHODE 1 — LINEARE ABSCHREIBUNG:
Formel: (AW − Restwert) / Nutzungsdauer = gleicher CHF-Betrag pro Jahr
→ Abschreibungssatz: Abschreibung / AW × 100 = gleichbleibend
→ Buchung: Abschreibungen / Anlagekonto

METHODE 2 — DEGRESSIVE ABSCHREIBUNG:
Gleicher Prozentsatz auf den Restbuchwert → sinkende Beträge jedes Jahr
→ Vorteil: Höhere Abschreibungen in den Anfangsjahren → tiefere Steuern → Liquiditätsvorteil
→ Sobald Linearbetrag > Degressivbetrag: Wechsel auf linear möglich

STEUERLICHE ABSCHREIBUNGSSÄTZE SCHWEIZ (degressiv, Maximal):
• Fahrzeuge: 40% | EDV / Software: 40% | Mobilien / Maschinen: 25–30%
• Einrichtungen: 20–25% | Liegenschaften / Gebäude: 4–8%
• Goodwill: max. 5 Jahre (20% linear)

DIREKTE vs. INDIREKTE ABSCHREIBUNG:
Direkt: Aktivkonto wird direkt vermindert → Bilanz zeigt Nettobuchwert
  Buchung: Abschreibungen / Maschinen
Indirekt: Aktivkonto bleibt bei AW, kumulierte Afa auf Gegenkonto «WB Maschinen»
  Buchung: Abschreibungen / WB Maschinen
  Bilanzausweis: Maschinen AW − WB Maschinen = Nettobuchwert (transparenter!)

VERKAUF EINES ANLAGEGUTS (Direktmethode):
• Preis > BW → Bank / Anlagekonto + Anlagegewinn (Ertrag)
• Preis < BW → Bank + Anlageverlust / Anlagekonto (Aufwand)
• Indirekte Methode: zuerst WB auflösen (WB Maschinen / Maschinen), dann wie direkt

AUSSERPLANMÄSSIGE ABSCHREIBUNG:
Bei dauerhafter unerwarteter Wertminderung (Schaden, Markteinbruch): Ausserplanmässige Abschreibungen / Anlagekonto`
)

await addGoals(ch, [
  'Du kannst den Abschreibungsbetrag linear und degressiv berechnen.',
  'Du kennst den Unterschied zwischen direkter und indirekter Abschreibungsmethode.',
  'Du kannst einen vollständigen Abschreibungsplan erstellen.',
  'Du kannst den Verkauf eines Anlageguts mit Gewinn oder Verlust buchen.',
  'Du kennst die wichtigsten steuerlichen Abschreibungssätze in der Schweiz.',
])

await addTerms(ch, [
  ['Anschaffungswert (AW)', 'Kaufpreis des Anlageguts plus alle Nebenkosten (Transport, Montage, Zoll). Maximaler Bilanzansatz.'],
  ['Buchwert (BW)', 'Aktueller Wert des Anlageguts in der Buchhaltung: AW minus alle bisherigen (kumulierten) Abschreibungen.'],
  ['Restwert', 'Geplanter Wert des Anlageguts am Ende der Nutzungsdauer. Oft CHF 0 oder CHF 1 (symbolisch).'],
  ['Nutzungsdauer', 'Geplante Einsatzdauer des Anlageguts in Jahren. Bestimmt zusammen mit AW die jährliche Abschreibung.'],
  ['Lineare Abschreibung', 'Gleicher CHF-Betrag jedes Jahr. Formel: (AW − Restwert) / Nutzungsdauer. Einfach und gleichmässig.'],
  ['Degressive Abschreibung', 'Gleicher Prozentsatz auf den Restbuchwert → sinkende Beträge. Höhere Abschreibungen am Anfang.'],
  ['Direkte Abschreibung', 'Abschreibung direkt auf dem Aktivkonto: Abschreibungen / Anlagekonto. Bilanz zeigt Nettowert.'],
  ['Indirekte Abschreibung', 'Abschreibung auf Gegenkonto (WB): Abschreibungen / WB Anlagekonto. Bilanz zeigt brutto und netto — transparenter.'],
  ['Anlagegewinn', 'Entsteht beim Verkauf eines Anlageguts über dem Buchwert. Ertrag in der Erfolgsrechnung.'],
  ['Anlageverlust', 'Entsteht beim Verkauf eines Anlageguts unter dem Buchwert. Aufwand in der Erfolgsrechnung.'],
  ['Kumulierte Abschreibungen', 'Summe aller bisherigen Abschreibungen auf ein Anlagegut. Beim indirekten Verfahren auf dem WB-Konto.'],
])

await addPoints(ch, [
  'Linear: (AW − Restwert) / Nutzungsdauer = gleicher Jahresbetrag',
  'Degressiv: Restbuchwert × Abschreibungssatz = sinkender Jahresbetrag',
  'Direkte Buchung: Abschreibungen / Maschinen (Konto sinkt direkt)',
  'Indirekte Buchung: Abschreibungen / WB Maschinen (AW bleibt, WB wächst)',
  'Indirekte Methode ist transparenter (AW und kumulierte Afa getrennt sichtbar)',
  'Verkauf über BW → Anlagegewinn (Ertrag); unter BW → Anlageverlust (Aufwand)',
  'Indirekte Methode vor Verkauf: Zuerst WB-Konto auflösen (WB / Anlage), dann Verkauf buchen',
  'Steuer CH (degressiv): Fahrzeuge 40%, Mobilien 25%, Liegenschaften 4–8%, EDV 40%',
  'Ausserplanmässige Abschreibung bei dauerhafter Wertminderung: Ausserpl. Afa / Anlage',
])

await addExamples(ch, [
  'LINEAR: Maschine AW CHF 120 000, Nutzung 8 Jahre, Restwert CHF 8 000. Jährliche Afa = (120 000 − 8 000) / 8 = CHF 14 000. Jahr 1: BW 106 000. Jahr 2: BW 92 000. Buchung: Abschreibungen 14 000 / Maschinen 14 000.',
  'DEGRESSIV: Fahrzeug AW CHF 80 000, 40% degressiv. Jahr 1: 80 000 × 40% = 32 000 → BW 48 000. Jahr 2: 48 000 × 40% = 19 200 → BW 28 800. Jahr 3: 28 800 × 40% = 11 520 → BW 17 280.',
  'INDIREKT: Maschine AW 100 000. Jahr 1 Buchung: Abschreibungen 20 000 / WB Maschinen 20 000. Bilanz: Maschinen 100 000 − WB Maschinen 20 000 = Nettobuchwert 80 000.',
  'VERKAUF MIT GEWINN (direkt): BW CHF 20 000, Verkaufserlös CHF 25 000. Buchung: Bank 25 000 / Maschinen 20 000 + Anlagegewinn 5 000.',
  'VERKAUF MIT VERLUST (direkt): BW CHF 20 000, Verkaufserlös CHF 14 000. Buchung: Bank 14 000 + Anlageverlust 6 000 / Maschinen 20 000.',
  'VERKAUF INDIREKTE METHODE: AW 100 000, WB 60 000, BW 40 000, Verkauf für 45 000. Schritt 1: WB Maschinen 60 000 / Maschinen 60 000. Schritt 2: Bank 45 000 / Maschinen 40 000 + Anlagegewinn 5 000.',
])

await addQuiz(ch, [
  {
    q: 'Maschine AW CHF 90 000, Nutzungsdauer 6 Jahre, Restwert CHF 6 000. Jährliche lineare Abschreibung?',
    opts: [['CHF 14 000', true], ['CHF 15 000', false], ['CHF 16 000', false], ['CHF 13 000', false]],
    exp: '(90 000 − 6 000) / 6 = 84 000 / 6 = CHF 14 000 pro Jahr.',
    diff: 'easy'
  },
  {
    q: 'Fahrzeug BW CHF 48 000, Abschreibungssatz 40% degressiv. Abschreibung Jahr 2?',
    opts: [['CHF 19 200', true], ['CHF 32 000', false], ['CHF 40 000', false], ['CHF 12 800', false]],
    exp: 'Degressiv = % auf Restbuchwert. BW 48 000 × 40% = CHF 19 200.',
    diff: 'medium'
  },
  {
    q: 'Was ist der Vorteil der indirekten Abschreibungsmethode gegenüber der direkten?',
    opts: [['Transparenz: AW und kumulierte Abschreibungen sind separat sichtbar', true], ['Einfachere Buchungen', false], ['Tiefere Steuerlast', false], ['Höhere Abschreibungsbeträge möglich', false]],
    exp: 'Bei indirekter Methode bleibt der Anschaffungswert im Konto, die kumulierten Abschreibungen auf dem WB-Konto. Bilanz zeigt beides → transparenter.',
    diff: 'medium'
  },
  {
    q: 'Anlagegut BW CHF 30 000 wird für CHF 22 000 verkauft. Buchungssatz?',
    opts: [['Bank 22 000 + Anlageverlust 8 000 / Anlagekonto 30 000', true], ['Bank 22 000 / Anlagekonto 22 000', false], ['Bank 22 000 / Anlagekonto 30 000 + Anlagegewinn 8 000', false], ['Anlagekonto 30 000 / Bank 22 000 + Anlageverlust 8 000', false]],
    exp: 'Verkauf unter BW → Anlageverlust (Aufwand). Bank 22 000 + Anlageverlust 8 000 / Anlagekonto 30 000.',
    diff: 'medium'
  },
  {
    q: 'Welcher steuerliche Abschreibungssatz gilt in der Schweiz typischerweise für Fahrzeuge (degressiv)?',
    opts: [['40%', true], ['25%', false], ['10%', false], ['8%', false]],
    exp: 'Fahrzeuge dürfen steuerlich mit bis zu 40% degressiv abgeschrieben werden.',
    diff: 'easy'
  },
  {
    q: 'Buchung bei indirekter Abschreibung von CHF 15 000 auf Mobilien:',
    opts: [['Abschreibungen 15 000 / WB Mobilien 15 000', true], ['WB Mobilien 15 000 / Abschreibungen 15 000', false], ['Abschreibungen 15 000 / Mobilien 15 000', false], ['Mobilien 15 000 / Abschreibungen 15 000', false]],
    exp: 'Indirekte Methode: Abschreibungen (Aufwand, Soll) / WB Mobilien (Haben). Mobilien-Konto bleibt bei AW.',
    diff: 'easy'
  },
  {
    q: 'Was ist eine ausserplanmässige Abschreibung?',
    opts: [['Abschreibung bei dauerhafter unerwarteter Wertminderung (z.B. Schaden)', true], ['Die planmässige jährliche Abschreibung', false], ['Abschreibung bei Verkauf des Anlageguts', false], ['Rückbuchung einer zu hohen Abschreibung', false]],
    exp: 'Ausserplanmässige Abschreibung: bei unerwarteter dauerhafter Wertminderung (Unfall, Technologiesprung, Markteinbruch). Buchung: Ausserplanmässige Afa / Anlagekonto.',
    diff: 'medium'
  },
])

console.log('✅ Kapitel 4: Abschreibungen erfolgreich erstellt.')
await client.end()
