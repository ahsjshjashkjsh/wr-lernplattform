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
  'aktiengesellschaft',
  'Aktiengesellschaft (AG)',
  'Gründung, Gewinnverteilung, Verrechnungssteuer und Kapitalerhöhung',
  7,
  `Die AG ist eine juristische Person mit beschränkter Haftung — häufigste Rechtsform für grosse Unternehmen.

MERKMALE DER AG:
• Juristische Person (eigenständiges Rechtssubjekt)
• Mindestkapital: CHF 100 000 (mind. CHF 50 000 einbezahlt)
• Haftung: NUR das Gesellschaftsvermögen — Aktionäre verlieren maximal ihre Einlage
• Gründung: öffentliche Beurkundung + Handelsregistereintrag
• Organe: Generalversammlung (GV) → Verwaltungsrat (VR) → Geschäftsführung

EIGENKAPITAL DER AG:
• Aktienkapital: Nennwert × Anzahl Aktien
• Gesetzliche Kapitalreserve: Agio (Ausgabepreis > Nennwert)
• Gesetzliche Gewinnreserve: mind. 5% des JÜ, bis 20% des AK
• Freiwillige Gewinnreserven
• Gewinnvortrag (aus Vorjahr)

GRÜNDUNG (Verbuchung):
Einzahlung Aktionäre: Bank / Aktienkapital
Mit Agio: Bank / Aktienkapital + Gesetzliche Kapitalreserve
Sacheinlagen: Fahrzeuge / Aktienkapital usw.

GEWINNVERWENDUNG (Reihenfolge):
1. Gesetzliche Gewinnreserve: mind. 5% bis 20% AK → Gewinnvortrag / Ges. Gewinnreserve
2. Freiwillige Reserven (falls beschlossen): Gewinnvortrag / Freiwillige Gewinnreserven
3. Dividende: Gewinnvortrag / Dividendenverbindlichkeiten
4. Verrechnungssteuer 35%: Dividendenverbindlichkeiten / VS-Verbindlichkeiten
5. Netto-Dividende 65% auszahlen: Dividendenverbindlichkeiten / Bank
6. VS abliefern: VS-Verbindlichkeiten / Bank

KAPITALERHÖHUNG:
Neue Aktien ausgeben → Bank / Aktienkapital (+ Gesetzliche Kapitalreserve bei Agio)`
)

await addGoals(ch, [
  'Du kennst die Merkmale der AG und kannst sie von anderen Rechtsformen abgrenzen.',
  'Du kannst die Gründung einer AG vollständig buchen (inkl. Agio).',
  'Du verstehst den Ablauf der Gewinnverwendung und kannst alle Buchungsschritte durchführen.',
  'Du kannst die Verrechnungssteuer auf Dividenden korrekt berechnen und buchen.',
  'Du kannst eine Kapitalerhöhung verbuchen.',
])

await addTerms(ch, [
  ['Aktiengesellschaft (AG)', 'Juristische Person mit beschränkter Haftung. Kapital in Aktien aufgeteilt. Mindestkapital CHF 100 000.'],
  ['Aktienkapital', 'Nennwert × Anzahl Aktien. Steht auf der Passivseite (Eigenkapital). Darf nicht unter Mindestbetrag sinken.'],
  ['Aktie', 'Bruchteil des Aktienkapitals. Nennwert mind. CHF 0.01. Gibt dem Inhaber Stimmrecht und Dividendenanspruch.'],
  ['Agio (Emissionsagio)', 'Differenz zwischen Ausgabepreis und Nennwert einer Aktie. Fliesst in die Gesetzliche Kapitalreserve.'],
  ['Gesetzliche Kapitalreserve', 'Entsteht durch Agio. Darf nicht ausgeschüttet werden (OR-Schutz für Gläubiger).'],
  ['Gesetzliche Gewinnreserve', 'Pflichtreserve: mind. 5% des Jahresgewinns, bis die Reserve 20% des Aktienkapitals beträgt.'],
  ['Gewinnvortrag', 'Nicht ausgeschütteter Gewinn aus dem Vorjahr. Bildet zusammen mit dem Jahresgewinn den Bilanzgewinn.'],
  ['Dividende', 'Gewinnausschüttung an Aktionäre. Beschluss durch Generalversammlung. Unterliegt 35% Verrechnungssteuer.'],
  ['Verrechnungssteuer (VS)', '35% Quellensteuer auf Dividenden und Zinsen. AG zieht ab und liefert an Bund. Aktionär kann zurückfordern.'],
  ['Generalversammlung (GV)', 'Oberstes Organ der AG. Wählt VR, beschliesst Jahresabschluss und Gewinnverwendung.'],
  ['Verwaltungsrat (VR)', 'Strategische Führung und Kontrolle der AG. Von GV gewählt, unübertragbare Aufgaben (OR Art. 716a).'],
  ['Kapitalerhöhung', 'Ausgabe neuer Aktien zur Beschaffung von neuem Eigenkapital. Beschluss durch GV.'],
])

await addPoints(ch, [
  'AG = juristische Person: beschränkte Haftung, Mindestkapital CHF 100 000',
  'Gründung: öffentliche Beurkundung + Handelsregister + Einzahlung mind. 20%',
  'Gründungsbuchung: Bank / Aktienkapital; bei Agio: + Gesetzliche Kapitalreserve',
  'Jahresabschluss: alle ER-Konten → GuV → Jahresgewinn → Gewinnvortrag',
  'Gewinnverwendung Reihenfolge: 1. Ges.Gewinnreserve 2. Freiwillige Res. 3. Dividende',
  'Dividende: Gewinnvortrag / Dividendenverbindlichkeiten',
  'Verrechnungssteuer 35%: Dividendenverbindlichkeiten / VS-Verbindlichkeiten',
  'Netto-Dividende an Aktionäre = 65% der Brutto-Dividende',
  'Aktionär erhält 65%, kann 35% VS beim Steueramt zurückfordern (wenn in CH)',
  'Kapitalerhöhung: Bank / Aktienkapital (Nennwert) + Gesetzliche Kapitalreserve (Agio)',
])

await addExamples(ch, [
  'GRÜNDUNG OHNE AGIO: 500 Aktien à CHF 1 000 Nennwert. Total AK = CHF 500 000. Buchung: Bank 500 000 / Aktienkapital 500 000.',
  'GRÜNDUNG MIT AGIO: 200 Aktien, Nennwert CHF 1 000, Ausgabepreis CHF 1 400. Bank 280 000 / Aktienkapital 200 000 + Gesetzliche Kapitalreserve 80 000.',
  'GEWINNVERWENDUNG: Jahresgewinn 144 000, Gewinnvortrag Vorjahr 10 000 → Bilanzgewinn 154 000. Ges.Gewinnreserve 5%=7 200: Gewinnvortrag 7 200 / Ges.GR 7 200. Freiwillige Res. 20 000: Gewinnvortrag 20 000 / Freiw.Res. 20 000. Dividende 100 000: Gewinnvortrag 100 000 / Dividendenverbindlichkeiten 100 000. Neuer Gewinnvortrag: 154 000−127 200 = 26 800.',
  'VERRECHNUNGSSTEUER auf Dividende CHF 100 000: VS = 35% × 100 000 = 35 000. Buchung Abzug: Dividendenverbindlichkeiten 35 000 / VS-Verbindlichkeiten 35 000. Auszahlung Netto 65%: Dividendenverbindlichkeiten 65 000 / Bank 65 000. VS abliefern: VS-Verbindlichkeiten 35 000 / Bank 35 000.',
  'KAPITALERHÖHUNG: 50 000 neue Aktien à CHF 100 Nennwert, Ausgabepreis CHF 170. AK-Erhöhung = 5 000 000. Agio = 3 500 000. Buchung: Bank 8 500 000 / Aktienkapital 5 000 000 + Gesetzliche Kapitalreserve 3 500 000.',
])

await addQuiz(ch, [
  {
    q: 'Was ist das Mindesteigenkapital bei Gründung einer AG in der Schweiz?',
    opts: [['CHF 100 000 (mind. CHF 50 000 einbezahlt)', true], ['CHF 20 000', false], ['CHF 500 000', false], ['Kein Mindestkapital', false]],
    exp: 'OR: Aktienkapital mind. CHF 100 000. Davon müssen mind. 20% (= CHF 20 000) oder CHF 50 000 bei Gründung einbezahlt sein.',
    diff: 'easy'
  },
  {
    q: 'Dividende CHF 80 000 beschlossen. Wie hoch ist die Verrechnungssteuer?',
    opts: [['CHF 28 000', true], ['CHF 8 000', false], ['CHF 52 000', false], ['CHF 80 000', false]],
    exp: 'VS = 35% × 80 000 = CHF 28 000. Aktionär erhält Netto: 80 000 − 28 000 = CHF 52 000.',
    diff: 'easy'
  },
  {
    q: 'Was fliesst in die Gesetzliche Kapitalreserve?',
    opts: [['Das Agio (Ausgabepreis minus Nennwert der Aktien)', true], ['Der Jahresgewinn', false], ['Die Dividende', false], ['Das einbezahlte Aktienkapital', false]],
    exp: 'Gesetzliche Kapitalreserve = Agio bei Aktienausgabe. Beispiel: Ausgabepreis CHF 1 400 − Nennwert CHF 1 000 = CHF 400 Agio pro Aktie.',
    diff: 'medium'
  },
  {
    q: 'In welcher Reihenfolge wird der Bilanzgewinn verwendet?',
    opts: [['Gesetzliche GR → Freiwillige Res. → Dividende → Gewinnvortrag', true], ['Dividende → Gewinnvortrag → Reserven', false], ['Freiwillige Res. → Dividende → Gesetzliche GR', false], ['Beliebige Reihenfolge', false]],
    exp: 'OR-Vorschrift: Zuerst gesetzliche Gewinnreserve (5% Pflicht), dann freiwillige, dann Dividende, Rest als Gewinnvortrag.',
    diff: 'medium'
  },
  {
    q: 'Buchung wenn die Verrechnungssteuer auf Dividenden abgezogen wird:',
    opts: [['Dividendenverbindlichkeiten / VS-Verbindlichkeiten', true], ['VS-Verbindlichkeiten / Dividendenverbindlichkeiten', false], ['Dividendenverbindlichkeiten / Bank', false], ['Gewinnvortrag / VS-Verbindlichkeiten', false]],
    exp: 'VS-Abzug: Dividendenverbindlichkeiten sinken (Soll), VS-Verbindlichkeiten entstehen (Haben). Dann separat: VS-Verbindlichkeiten / Bank.',
    diff: 'medium'
  },
  {
    q: 'Wer entscheidet über die Verwendung des Gewinns einer AG?',
    opts: [['Die Generalversammlung (auf Antrag des Verwaltungsrats)', true], ['Der Verwaltungsrat allein', false], ['Die Geschäftsführung', false], ['Das Handelsregisteramt', false]],
    exp: 'Die GV ist das oberste Organ und beschliesst die Gewinnverwendung (auf Antrag des VR). Recht der Aktionäre.',
    diff: 'easy'
  },
  {
    q: 'Wie haftet ein Aktionär bei Schulden der AG?',
    opts: [['Nur bis zur Höhe seiner Einlage (beschränkte Haftung)', true], ['Unbeschränkt mit Privatvermögen', false], ['Gar nicht', false], ['Bis zum doppelten der Einlage', false]],
    exp: 'AG = beschränkte Haftung. Aktionäre riskieren maximal den Wert ihrer Aktien. Privatvermögen ist geschützt.',
    diff: 'easy'
  },
  {
    q: 'Jahresgewinn CHF 60 000, Gewinnvortrag Vorjahr CHF 8 000. Wie gross ist der Bilanzgewinn?',
    opts: [['CHF 68 000', true], ['CHF 60 000', false], ['CHF 52 000', false], ['CHF 8 000', false]],
    exp: 'Bilanzgewinn = Jahresgewinn + Gewinnvortrag Vorjahr = 60 000 + 8 000 = CHF 68 000.',
    diff: 'easy'
  },
])

console.log('✅ Kapitel 8: Aktiengesellschaft erfolgreich erstellt.')
await client.end()
