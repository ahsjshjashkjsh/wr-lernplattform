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
  'bewertungsvorschriften',
  'Bewertungsvorschriften & Stille Reserven',
  'OR-Bewertungsregeln, stille Reserven bilden und auflösen, Bilanzbereinigung',
  8,
  `Die Bewertung von Aktiven und Passiven ist gesetzlich geregelt (OR Art. 958 ff.) und schützt Gläubiger durch konservative Ansätze.

GRUNDPRINZIPIEN (OR):
• Vorsichtsprinzip: Im Zweifel tiefer bewerten — Gläubiger schützen
• Anschaffungswertprinzip: Aktiven max. zu Anschaffungs- oder Herstellungskosten
• Niederstwertprinzip (NWP): Umlaufvermögen zum tieferen Wert (AW oder Marktwert)
• Stetigkeitsprinzip: Gleiche Methoden über mehrere Jahre

BEWERTUNGSREGELN nach Positionen:
• Kasse/Bank: Nominalwert
• Debitoren: Nominalwert ./. WB (geschätzte Verluste)
• Warenvorräte: NWP — Anschaffungswert oder Marktwert (tieferer); + 1/3-Pauschalabzug zulässig
• Wertschriften (kotiert): Börsenkurs (NWP)
• Wertschriften (nicht kotiert): Ertragswert
• Mobilien/Maschinen: AW ./. kumulierte Abschreibungen
• Liegenschaften: AW (Verkehrswert als Obergrenze möglich)

STILLE RESERVEN:
= Ausgewiesenes EK ist tiefer als tatsächliches EK
Entstehung: Aktiven zu tief ODER Passiven zu hoch bewertet
Bildung (Aufwand ↑, Gewinn ↓, EK ↓):
• Überhöhte Abschreibungen → Abschreibungen / Anlagekonto
• Zu hohe WB Forderungen → Abschreibungen / WB Forderungen
• Waren unter NWP → Warenaufwand / Warenvorräte
• Überhöhte Rückstellungen → Rückstellungsaufwand / Rückstellungen
Auflösung (Ertrag ↑, Gewinn ↑, EK ↑):
• Aufwertung Waren → Warenvorräte / Warenertrag
• WB senken → WB Forderungen / Abschreibungsertrag
• Rückstellungen auflösen → Rückstellungen / Rückstellungsertrag

INTERNE vs. EXTERNE BILANZ:
• Externe Bilanz (nach OR): stille Reserven vorhanden, EK tiefer, Steuern tiefer
• Interne Bilanz (bereinigt): stille Reserven aufgedeckt, zeigt wahres Bild`
)

await addGoals(ch, [
  'Du kennst die wichtigsten OR-Bewertungsgrundsätze (Vorsicht, NWP, Stetigkeit).',
  'Du kannst Bewertungsregeln für die wichtigsten Bilanzpositionen nennen.',
  'Du verstehst was stille Reserven sind und wie sie entstehen.',
  'Du kannst stille Reserven bilden und auflösen (mit Buchungssätzen).',
  'Du kennst den Unterschied zwischen interner und externer Bilanz.',
])

await addTerms(ch, [
  ['Niederstwertprinzip (NWP)', 'Bei Umlaufvermögen: Bewertung zum tieferen Wert aus Anschaffungskosten und Marktwert. Pflicht: bei Marktwert < AW muss abgewertet werden.'],
  ['Vorsichtsprinzip', 'Im Zweifel konservativ bewerten — Verluste sofort, Gewinne erst bei Realisierung. Schützt Gläubiger.'],
  ['Anschaffungswertprinzip', 'Aktiven dürfen maximal zum Anschaffungs- oder Herstellungswert bilanziert werden.'],
  ['Stetigkeitsprinzip', 'Gleiche Bewertungsmethoden von Jahr zu Jahr anwenden. Methodenwechsel muss begründet werden.'],
  ['Stille Reserven', 'Unsichtbares Eigenkapital: Aktiven zu tief bewertet ODER Passiven zu hoch. Stilles EK = Tatsächliches EK − Ausgewiesenes EK.'],
  ['Externe Bilanz', 'Gesetzlich pflichtgemässer Abschluss (nach OR). Enthält stille Reserven. Zeigt tiefere Werte. Für Behörden, Öffentlichkeit.'],
  ['Interne Bilanz (bereinigt)', 'Aufgedeckte stille Reserven — zeigt das wahre Bild der Vermögenslage. Nur für internes Management.'],
  ['1/3-Pauschalabzug', 'Bei Warenvorräten erlaubt OR einen zusätzlichen Abzug von 1/3 vom NWP. Dient als stille Reserve — steuerlich anerkannt.'],
  ['Ertragswert', 'Bewertungsmethode für nicht kotierte Wertschriften: Barwert der zukünftigen Erträge.'],
])

await addPoints(ch, [
  'Vorsichtsprinzip: Verluste sofort buchen — Gewinne nur wenn sicher realisiert',
  'NWP Warenvorräte: MIN(Anschaffungswert, Marktwert) — Pflicht bei Abwertung',
  'Zusätzlich: 1/3-Pauschalabzug auf Warenvorräten steuerlich zulässig',
  'Kotierte Wertschriften: max. Börsenkurs; nicht kotiert: Ertragswert',
  'Liegenschaften: max. AW (Verkehrswert als Obergrenze möglich)',
  'Stille Reserven bilden: Aufwand ↑ → Gewinn ↓ → EK ↓ → Steuer ↓',
  'Stille Reserven auflösen: Ertrag ↑ → Gewinn ↑ → EK ↑ → Steuer ↑',
  'Stille Reserven = legal in der Schweiz (im Rahmen des OR)',
  'Interne Bilanz: stille Reserven aufgedeckt — zeigt wahres Bild für Management',
  'Externe Bilanz: nach OR — zeigt gesetzlich erlaubte tiefere Werte',
])

await addExamples(ch, [
  'NWP WAREN: Warenvorräte AK CHF 80 000, Marktwert CHF 65 000. NWP = 65 000. Abwertung CHF 15 000. Buchung: Warenaufwand 15 000 / Warenvorräte 15 000.',
  '1/3 PAUSCHALABZUG: Waren nach NWP = CHF 65 000. Zusätzlicher Abzug 1/3 = CHF 21 667. Bilanzwert: CHF 43 333. Buchung: Warenaufwand 21 667 / Warenvorräte 21 667. (Stille Reserve: CHF 21 667)',
  'STILLE RESERVE BILDEN (überhöhte Afa): Maschine BW 50 000, planmässige Afa CHF 10 000, effektiv gebucht CHF 20 000. Stille Reserve = CHF 10 000 extra. Buchung: Abschreibungen 20 000 / Maschinen 20 000.',
  'STILLE RESERVE AUFLÖSEN (Warenaufwertung): Waren extern CHF 40 000, intern (echter Wert) CHF 60 000. Stille Reserve CHF 20 000. Buchung Auflösung: Warenvorräte 20 000 / Warenertrag 20 000.',
  'BILANZBEREINIGUNG: Externe Bilanz zeigt Waren CHF 43 333 (mit stillen Reserven). Interne bereinigte Bilanz: Waren CHF 65 000 (NWP), EK entsprechend höher (+ CHF 21 667 stille Reserve).',
])

await addQuiz(ch, [
  {
    q: 'Was bedeutet das Niederstwertprinzip (NWP) beim Umlaufvermögen?',
    opts: [['Bewertet wird zum tieferen Wert aus Anschaffungskosten und Marktwert', true], ['Bewertet wird immer zum Anschaffungswert', false], ['Bewertet wird immer zum Marktwert', false], ['Der Buchwert darf nie sinken', false]],
    exp: 'NWP = MIN(AW, Marktwert). Wenn Marktwert < AW → Pflicht zur Abwertung (Vorsichtsprinzip). Wenn Marktwert > AW → keine Aufwertung.',
    diff: 'medium'
  },
  {
    q: 'Was sind stille Reserven?',
    opts: [['Unsichtbares Eigenkapital durch Unterbewertung von Aktiven oder Überbewertung von Passiven', true], ['Reserven auf dem Bankkonto', false], ['Gesetzlich verbotene Rücklagen', false], ['Teil der gesetzlichen Gewinnreserve', false]],
    exp: 'Stille Reserven = Tatsächliches EK − Ausgewiesenes EK. Entstehen wenn Aktiven zu tief oder Passiven zu hoch bewertet werden.',
    diff: 'medium'
  },
  {
    q: 'Welche steuerliche Auswirkung hat die Bildung stiller Reserven?',
    opts: [['Tieferer ausgewiesener Gewinn → tiefere Steuern', true], ['Höherer Gewinn → höhere Steuern', false], ['Keine steuerliche Auswirkung', false], ['Stille Reserven sind steuerlich verboten', false]],
    exp: 'Bildung stiller Reserven = höherer Aufwand → tieferer Gewinn → tiefere Ertragssteuern. Daher steuerlich interessant.',
    diff: 'easy'
  },
  {
    q: 'Buchung bei Auflösung stiller Reserven auf Warenvorräten:',
    opts: [['Warenvorräte / Warenertrag', true], ['Warenaufwand / Warenvorräte', false], ['Warenvorräte / Warenaufwand', false], ['Rückstellungen / Warenertrag', false]],
    exp: 'Auflösung: Warenvorräte werden aufgewertet (Soll) → Warenertrag entsteht (Haben). Gewinn steigt.',
    diff: 'medium'
  },
  {
    q: 'Warenvorräte AK CHF 90 000, Marktwert CHF 75 000. Welcher Wert wird bilanziert?',
    opts: [['CHF 75 000 (Niederstwertprinzip)', true], ['CHF 90 000 (Anschaffungswert)', false], ['CHF 82 500 (Durchschnitt)', false], ['Beliebig, je nach Wahl', false]],
    exp: 'NWP: MIN(90 000, 75 000) = 75 000. Marktwert ist tiefer → Pflicht zur Abwertung auf CHF 75 000.',
    diff: 'easy'
  },
  {
    q: 'Was zeigt die interne (bereinigte) Bilanz im Vergleich zur externen?',
    opts: [['Stille Reserven aufgedeckt — wahres Bild des Eigenkapitals', true], ['Noch tiefere Werte als die externe Bilanz', false], ['Nur steuerrelevante Positionen', false], ['Identisch mit der externen Bilanz', false]],
    exp: 'Interne Bilanz: stille Reserven werden aufgedeckt → Aktiven höher, EK höher. Zeigt das tatsächliche Vermögen des Unternehmens.',
    diff: 'medium'
  },
  {
    q: 'Welcher zusätzliche Abzug ist bei Warenvorräten steuerlich erlaubt?',
    opts: [['1/3 vom Niederstwert', true], ['10% vom Anschaffungswert', false], ['5% Pauschalabzug', false], ['Kein zusätzlicher Abzug', false]],
    exp: 'OR erlaubt bei Warenvorräten einen Pauschalabzug von 1/3 vom NWP als stille Reserve. Steuerlich anerkannt in der Schweiz.',
    diff: 'medium'
  },
])

console.log('✅ Kapitel 9: Bewertungsvorschriften & Stille Reserven erfolgreich erstellt.')
await client.end()
