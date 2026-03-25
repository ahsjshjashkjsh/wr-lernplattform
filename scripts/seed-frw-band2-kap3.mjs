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

// ══════════════════════════════════════════════════
// KAPITEL 3: Verluste aus Forderungen
// ══════════════════════════════════════════════════
const ch = await insertChapter(tId,
  'verluste-forderungen',
  'Verluste aus Forderungen',
  'Direkte Abschreibung, WB-Methode und MWSt-Rückforderung',
  2,
  `Nicht alle Forderungen (Debitoren) werden vollständig bezahlt. Unternehmen müssen drohende Verluste frühzeitig erfassen.

ARTEN VON FORDERUNGSAUSFÄLLEN:
• Dubiose Forderung: Eingang unsicher (Schuldner in finanziellen Schwierigkeiten) → Wertberichtigung bilden
• Uneinbringliche Forderung: Verlust definitiv (Konkurs, Pfändung) → Abschreibung

METHODE 1 — DIREKTE ABSCHREIBUNG:
Bei definitiv uneinbringlichen Forderungen:
1. Buchung Verlust: Debitorenverlust / Debitoren (Bruttobetrag inkl. MWSt)
2. MWSt zurückfordern: MWSt-Verbindlichkeiten / Debitorenverlust (Netto × MWSt-Satz)
→ Netto-Debitorenverlust = Bruttobetrag − MWSt-Rückforderung

METHODE 2 — INDIREKTE ABSCHREIBUNG (WB-Methode):
Konto «WB Forderungen» (Wertberichtigungskonto) = Dubiosenrücklage
A) Einzelwertberichtigung (EWB): für konkret bekannte zweifelhafte Schuldner
   Buchung Bildung: Abschreibungen auf Forderungen / WB Forderungen
B) Pauschalwertberichtigung (PWB): % auf verbleibende Debitoren (z.B. 5%)
   Anpassung auf Soll-WB:
   • Erhöhung: Abschreibungen auf Forderungen / WB Forderungen
   • Herabsetzung: WB Forderungen / Abschreibungsertrag

WENN WB-FORDERUNG DEFINITIV VERLOREN GEHT:
1. WB Forderungen / Debitoren (soweit durch WB gedeckt)
2. Debitorenverlust / Debitoren (Restbetrag falls WB nicht reicht)
3. MWSt-Verbindlichkeiten / Debitorenverlust (MWSt zurückfordern)

BILANZAUSWEIS:
Debitoren brutto − WB Forderungen = Debitoren netto

Konten: Debitorenverlust (Aufwand), Abschreibungen auf Forderungen (Aufwand), Abschreibungsertrag (Ertrag), WB Forderungen (Passivkorrektur)`
)

await addGoals(ch, [
  'Du kennst den Unterschied zwischen dubiosen und uneinbringlichen Forderungen.',
  'Du kannst Forderungsverluste direkt abschreiben (inkl. MWSt-Rückforderung).',
  'Du kannst Einzel- und Pauschalwertberichtigungen bilden und anpassen.',
  'Du weisst, wie du vorgehst, wenn eine bereits wertberichtigte Forderung definitiv verloren geht.',
  'Du kannst Debitoren korrekt in der Bilanz ausweisen (brutto minus WB).',
])

await addTerms(ch, [
  ['Dubiose Forderung', 'Forderung, deren Eingang unsicher ist (Schuldner hat Zahlungsschwierigkeiten). Lösung: Wertberichtigung bilden.'],
  ['Uneinbringliche Forderung (Debitorenverlust)', 'Forderung, die definitiv nicht mehr bezahlt wird (Konkurs, Pfändung, Verjährung). Lösung: Abschreibung.'],
  ['WB Forderungen (Wertberichtigungskonto)', 'Konto auf der Passivseite (Gegenkonto zu Debitoren), das geschätzte zukünftige Verluste enthält. Früher "Delkredere" oder "Dubiosenrücklage".'],
  ['Einzelwertberichtigung (EWB)', 'Wertberichtigung für einen konkret bekannten, zweifelhaften Schuldner. Betrag = geschätzter Verlust.'],
  ['Pauschalwertberichtigung (PWB)', 'Pauschale Wertberichtigung in % auf den gesamten verbleibenden Debitorenbestand (z.B. 5%). Deckt allgemeine Ausfallrisiken.'],
  ['Debitorenverlust', 'Aufwandskonto für definitiv verlorene Forderungen. Erscheint in der Erfolgsrechnung.'],
  ['Abschreibungsertrag', 'Ertragskonto: Entsteht wenn die WB Forderungen herabgesetzt wird (Risiko kleiner als erwartet).'],
  ['MWSt-Rückforderung bei Verlust', 'Bei definitiv verlorenem Debitor kann die bereits abgeführte MWSt (Netto × MWSt-Satz) zurückgefordert werden. Buchung: MWSt-Verbindlichkeiten / Debitorenverlust.'],
])

await addPoints(ch, [
  'Direkte Abschreibung: Debitorenverlust / Debitoren (Bruttobetrag)',
  'MWSt-Rückforderung bei definitivem Verlust: MWSt-Verbindlichkeiten / Debitorenverlust',
  'Netto-Verlust = Bruttoverlust minus MWSt-Rückforderung',
  'WB-Methode: Erst EWB für bekannte Risiken, dann PWB in % auf Restbestand',
  'PWB-Anpassung: Soll-WB berechnen, mit Ist-WB vergleichen, Differenz buchen',
  'Erhöhung WB: Abschreibungen auf Forderungen / WB Forderungen',
  'Senkung WB: WB Forderungen / Abschreibungsertrag',
  'Definitiver Verlust mit WB: WB Forderungen / Debitoren (dann evtl. MWSt)',
  'Bilanz: Debitoren netto = Debitoren brutto − WB Forderungen',
])

await addExamples(ch, [
  'DIREKTE ABSCHREIBUNG: Forderung CHF 5 400 (inkl. 8,1% MWSt = CHF 402.95) definitiv verloren. Schritt 1: Debitorenverlust 5 400 / Debitoren 5 400. Schritt 2: MWSt-Verbindlichkeiten 402.95 / Debitorenverlust 402.95. Netto-Verlust = CHF 4 997.05.',
  'EWB BILDUNG: Schuldner Meier (Forderung CHF 8 000) ist in Konkurs, Verlust geschätzt 100%. Buchung: Abschreibungen auf Forderungen 8 000 / WB Forderungen 8 000.',
  'PWB ANPASSUNG: Debitoren nach EWB = CHF 120 000. PWB-Satz 5%. Soll-WB = 6 000. Bisherige WB = 4 200. Fehlbetrag = 1 800. Buchung: Abschreibungen auf Forderungen 1 800 / WB Forderungen 1 800.',
  'PWB HERABSETZUNG: Debitoren = 80 000. PWB 5% = 4 000. Bisherige WB = 5 500. Überschuss = 1 500. Buchung: WB Forderungen 1 500 / Abschreibungsertrag 1 500.',
  'DEFINITIVER VERLUST (WB-Methode): Forderung Müller CHF 3 000, WB dafür CHF 2 000. Verlust definitiv. Schritt 1: WB Forderungen 2 000 / Debitoren 2 000. Schritt 2: Debitorenverlust 1 000 / Debitoren 1 000. Schritt 3: MWSt-Verbindlichkeiten / Debitorenverlust (auf Nettobetrag).',
])

await addQuiz(ch, [
  {
    q: 'Forderung CHF 2 160 (inkl. 8% MWSt) ist definitiv verloren. Wie hoch ist die MWSt-Rückforderung?',
    opts: [['CHF 160', true], ['CHF 2 160', false], ['CHF 2 000', false], ['CHF 172.80', false]],
    exp: 'Netto = 2 160 / 1.08 = 2 000. MWSt = 2 160 − 2 000 = CHF 160. Buchung: MWSt-Verbindlichkeiten 160 / Debitorenverlust 160.',
    diff: 'medium'
  },
  {
    q: 'Was ist der Buchungssatz bei der Bildung einer Einzelwertberichtigung?',
    opts: [['Abschreibungen auf Forderungen / WB Forderungen', true], ['WB Forderungen / Debitoren', false], ['Debitorenverlust / Debitoren', false], ['WB Forderungen / Abschreibungsertrag', false]],
    exp: 'Bildung WB: Aufwand steigt (Abschreibungen auf Forderungen / Soll), WB Forderungen steigt (Haben).',
    diff: 'easy'
  },
  {
    q: 'Debitoren CHF 200 000, EWB CHF 10 000, PWB 5% auf Restbestand. Bisherige WB = CHF 18 000. Was wird gebucht?',
    opts: [['WB Forderungen 500 / Abschreibungsertrag 500', true], ['Abschreibungen 500 / WB Forderungen 500', false], ['WB Forderungen 18 000 / Abschreibungsertrag 18 000', false], ['Keine Buchung nötig', false]],
    exp: 'Restbestand = 200 000 − 10 000 = 190 000. PWB 5% = 9 500. Soll-WB = 10 000 + 9 500 = 19 500. Nein — Soll-WB 19 500 < Ist-WB 18 000 → Nein, Soll > Ist → erhöhen um 1 500. Warte: Soll 19 500, Ist 18 000, Differenz = +1 500. Also: Abschreibungen 1 500 / WB 1 500.',
    diff: 'hard'
  },
  {
    q: 'Wo erscheint das Konto "WB Forderungen" in der Bilanz?',
    opts: [['Als Minusposition bei den Debitoren (Aktiven)', true], ['Auf der Passivseite als Fremdkapital', false], ['In der Erfolgsrechnung als Aufwand', false], ['Als eigenes Aktivum', false]],
    exp: 'WB Forderungen ist ein Wertberichtigungskonto und wird von den Debitoren abgezogen: Debitoren brutto − WB = Debitoren netto.',
    diff: 'medium'
  },
  {
    q: 'Wenn eine Forderung definitiv verloren geht, die vollständig durch WB gedeckt ist, lautet der erste Buchungssatz:',
    opts: [['WB Forderungen / Debitoren', true], ['Debitorenverlust / Debitoren', false], ['Abschreibungen / WB Forderungen', false], ['MWSt-Verbindlichkeiten / Debitoren', false]],
    exp: 'Wenn WB vorhanden: Zuerst WB Forderungen / Debitoren (WB verwenden). Nur wenn WB nicht reicht: Debitorenverlust / Debitoren.',
    diff: 'medium'
  },
  {
    q: 'Was ist der Unterschied zwischen direkter Abschreibung und WB-Methode?',
    opts: [['Direkt: sofort auf Debitoren; WB: über Gegenkonto mit Schätzung', true], ['Direkt: nur für Einzelfälle; WB: nur für Pauschalfälle', false], ['Direkt: höherer MWSt-Rückforderung; WB: keine MWSt', false], ['Es gibt keinen Unterschied', false]],
    exp: 'Direkte Abschreibung bucht sofort auf Debitoren. WB-Methode bildet vorsorglich ein Gegenkonto (WB Forderungen) für geschätzte Verluste, ohne Debitoren direkt zu reduzieren.',
    diff: 'medium'
  },
  {
    q: 'Wann entsteht ein "Abschreibungsertrag"?',
    opts: [['Wenn die WB Forderungen herabgesetzt wird', true], ['Wenn eine Forderung definitiv verloren geht', false], ['Wenn ein neuer Debitor aufgenommen wird', false], ['Wenn Debitoren steigen', false]],
    exp: 'Abschreibungsertrag entsteht wenn die WB Forderungen gesenkt wird — z.B. weil das Ausfallrisiko kleiner geworden ist. Buchung: WB Forderungen / Abschreibungsertrag.',
    diff: 'easy'
  },
])

console.log('✅ Kapitel 3: Verluste aus Forderungen erfolgreich erstellt.')
await client.end()
