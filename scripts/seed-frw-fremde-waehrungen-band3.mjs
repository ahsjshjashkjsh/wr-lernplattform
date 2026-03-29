import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

const chId = '3467c6de-fb52-4517-9a57-c504fef13b67'

const summary = `GRUNDPRINZIP FREMDWÄHRUNGSBUCHHALTUNG — Ein Unternehmen führt seine Buchhaltung in CHF; Geschäftsfälle in fremder Währung müssen deshalb umgerechnet werden. Die zentrale Frage ist nicht ob, sondern mit welchem Kurs und zu welchem Zeitpunkt umgerechnet wird. Alle Forderungen, Verbindlichkeiten und Bankbewegungen in Fremdwährung werden einheitlich in CHF ausgewiesen.
DREI KURSARTEN — Buchkurs (intern, stabil): Kurs der Unternehmensleitung für laufende Rechnungen, Rücksendungen, Rabatte und Skonti. Bilanzkurs (intern): Kurs für Anfangs- und Schlusssalden am Stichtag. Tageskurs (extern, Bankkurs): Kurs, zu dem Zahlungen und Überweisungen tatsächlich abgewickelt werden.
KURSDIFFERENZEN — Da Buchkurs und Tageskurs in der Regel voneinander abweichen, entstehen bei Zahlung systematisch Kursgewinne oder Kursverluste. Diese sind integraler Bestandteil der Verbuchung und müssen erfasst werden. Zur Übersicht empfiehlt sich die Führung von Hilfskonten in der Fremdwährung.
VERBUCHUNG NACH GRUNDGESCHÄFT — Kursdifferenzen werden nicht isoliert verbucht, sondern korrigieren immer das zugehörige Konto. Beim Wareneinkauf: Korrektur des Warenaufwands. Beim Warenverkauf: Korrektur der Warenerlöse. Beim Kauf von Anlagegütern: Korrektur des Aktivkontos.
EINKAUF IN FREMDWÄHRUNG — Rechnung zum Buchkurs erfassen (Warenaufwand / Kreditoren). Skonto in Fremdwährung ebenfalls zum Buchkurs buchen (Kreditoren / Warenaufwand). Zahlung zum Tageskurs erfassen (Kreditoren / Bank). Differenz = Kursgewinn (Buchkurs > Tageskurs) oder Kursverlust (Tageskurs > Buchkurs).
VERKAUF IN FREMDWÄHRUNG — Ausgangsrechnung zum Buchkurs erfassen (Debitoren / Warenerlöse). Zahlung des Kunden zum Tageskurs buchen (Bank / Debitoren). Ist der eingegangene CHF-Betrag kleiner als die ursprüngliche CHF-Forderung, entsteht ein Kursverlust; ist er grösser, ein Kursgewinn.
BANKSPESEN TRENNEN — Im Zahlungsprozess können Bankspesen entstehen, die von der Kursdifferenz strikt zu trennen sind. Nicht jede Abweichung zwischen Verbindlichkeit und Bankausgang ist eine Kursdifferenz — Spesen werden separat als Finanzaufwand gebucht.`

await client.query(`UPDATE "Chapter" SET summary=$1, "updatedAt"=NOW() WHERE id=$2`, [summary, chId])
console.log('summary updated')

const goals = [
  'Du kannst Buchkurs, Bilanzkurs und Tageskurs definieren und ihre jeweilige Verwendung erklären.',
  'Du kannst eine Eingangsrechnung in Fremdwährung korrekt zum Buchkurs erfassen.',
  'Du kannst eine Zahlung in Fremdwährung zum Tageskurs buchen und die entstehende Kursdifferenz berechnen.',
  'Du kannst Kursdifferenzen beim Wareneinkauf und Warenverkauf dem richtigen Konto zuordnen.',
  'Du kannst Skonti in Fremdwährung korrekt verbuchen.',
  'Du kennst den Unterschied zwischen Kursdifferenz und Bankspesen.',
]
for (let i = 0; i < goals.length; i++)
  await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), goals[i], chId, i+1])
console.log('goals inserted')

const terms = [
  ['Buchwährung', 'Währung, in der die Buchhaltung geführt wird — bei Schweizer Unternehmen CHF.'],
  ['Buchkurs', 'Intern festgelegter, stabiler Umrechnungskurs für laufende Rechnungen, Skonti und Retouren in Fremdwährung.'],
  ['Bilanzkurs', 'Kurs zur Umrechnung von Anfangs- und Schlusssalden am Bilanzstichtag.'],
  ['Tageskurs', 'Bankenkurs am Tag der tatsächlichen Zahlung oder Überweisung.'],
  ['Kursdifferenz', 'Unterschied zwischen CHF-Betrag aus Buchkurs (Rechnung) und CHF-Betrag aus Tageskurs (Zahlung).'],
  ['Kursgewinn', 'Positive Kursdifferenz — die Zahlung ist für das Unternehmen günstiger als ursprünglich verbucht.'],
  ['Kursverlust', 'Negative Kursdifferenz — die Zahlung ist ungünstiger als ursprünglich verbucht.'],
  ['Hilfskonto', 'Zusätzliches Nebenbuch in der Fremdwährung zur Kontrolle und Nachvollziehbarkeit der Fremdwährungsbeträge.'],
]
for (let i = 0; i < terms.length; i++)
  await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`, [id(), terms[i][0], terms[i][1], chId, i+1])
console.log('terms inserted')

const points = [
  'Buchkurs = intern, stabil → für laufende Rechnungen, Skonti und Korrekturen.',
  'Tageskurs = extern, Bankkurs → für tatsächliche Zahlungen.',
  'Bilanzkurs = intern → für Stichtagsbewertung offener Salden.',
  'Kursdifferenz = Differenz zwischen CHF-Verbindlichkeit/-Forderung (Buchkurs) und CHF-Zahlung (Tageskurs).',
  'Einkauf: Kursgewinn wenn Buchkurs > Tageskurs. Kursverlust wenn Tageskurs > Buchkurs.',
  'Verkauf: Kursverlust wenn Tageskurs < Buchkurs. Kursgewinn wenn Tageskurs > Buchkurs.',
  'Skonto in FW immer zum Buchkurs buchen; Zahlung immer zum Tageskurs.',
  'Bankspesen separat buchen — kein Teil der Kursdifferenz.',
]
for (let i = 0; i < points.length; i++)
  await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), points[i], chId, i+1])
console.log('points inserted')

const questions = [
  {
    q: 'Mit welchem Kurs werden laufende Rechnungen in Fremdwährung erfasst?',
    opts: [['Buchkurs', true],['Tageskurs', false],['Bilanzkurs', false],['Mittelkurs der SNB', false]],
    exp: 'Buchkurs = intern festgelegter, stabiler Kurs für laufende Rechnungen. Tageskurs gilt erst bei der tatsächlichen Zahlung.',
    diff: 'easy',
  },
  {
    q: 'Mit welchem Kurs wird eine Zahlung in Fremdwährung über die Bank verbucht?',
    opts: [['Tageskurs (Bankkurs am Zahlungstag)', true],['Buchkurs', false],['Bilanzkurs', false],['Historischer Kurs', false]],
    exp: 'Zahlungen werden zum Tageskurs der Bank erfasst — das ist der effektive CHF-Betrag, der tatsächlich fliesst.',
    diff: 'easy',
  },
  {
    q: 'Beim Wareneinkauf (EUR) ist der Buchkurs 115, der Tageskurs 111. Was entsteht?',
    opts: [['Kursgewinn — die Zahlung ist günstiger als verbucht', true],['Kursverlust — die Zahlung ist teurer als verbucht', false],['Keine Differenz', false],['Bilanzkurskorrektur', false]],
    exp: 'Buchkurs 115 > Tageskurs 111: Der CHF-Betrag bei Zahlung ist tiefer als die verbuchte Verbindlichkeit → Kursgewinn.',
    diff: 'medium',
  },
  {
    q: 'Beim Warenverkauf (GBP) ist der Buchkurs 1.25, der Tageskurs 1.215. Was entsteht?',
    opts: [['Kursverlust — weniger CHF eingegangen als verbucht', true],['Kursgewinn', false],['Keine Differenz', false],['Bilanzkurskorrektur', false]],
    exp: 'Tageskurs 1.215 < Buchkurs 1.25: Es gehen weniger CHF ein als die ursprünglich verbuchte Forderung → Kursverlust.',
    diff: 'medium',
  },
  {
    q: 'Wie wird ein Skonto in Fremdwährung umgerechnet?',
    opts: [['Zum Buchkurs', true],['Zum Tageskurs', false],['Zum Bilanzkurs', false],['Zum Mittelkurs der Nationalbank', false]],
    exp: 'Skonti in Fremdwährung werden wie alle laufenden Korrekturen zum Buchkurs umgerechnet.',
    diff: 'easy',
  },
  {
    q: 'Wie werden Kursdifferenzen beim Wareneinkauf verbucht?',
    opts: [['Als Korrektur des Warenaufwands', true],['Auf einem separaten Kursgewinn-/Kursverlust-Konto', false],['Als Korrektur der Bilanzsalden', false],['Als reiner Finanzertrag/-aufwand ohne Bezug zum Grundgeschäft', false]],
    exp: 'Kursdifferenzen korrigieren immer das Grundgeschäftskonto: Wareneinkauf = Warenaufwand, Verkauf = Warenerlöse, Anlage = Aktivkonto.',
    diff: 'medium',
  },
]
for (let i = 0; i < questions.length; i++) {
  const qId = id()
  const q = questions[i]
  await client.query(`INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`, [qId, chId, q.q, q.exp, q.diff, i+1])
  for (let j = 0; j < q.opts.length; j++)
    await client.query(`INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`, [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
}
console.log('quiz inserted')

await client.end()
console.log('frw-fremde-waehrungen Band 3 komplett!')
