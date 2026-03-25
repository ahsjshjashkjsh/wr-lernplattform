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
  'loehne-gehaelter',
  'Löhne und Gehälter',
  'Lohnabrechnung, Sozialversicherungen und Spesen buchen',
  5,
  `Die Lohnbuchhaltung erfasst alle Kosten des Arbeitgebers für seine Mitarbeitenden.

LOHNABRECHNUNG (von Brutto zu Netto):
Bruttolohn (vertraglich vereinbart)
./. AHV/IV/EO Arbeitnehmer-Anteil (~5,3%)
./. ALV Arbeitnehmer-Anteil (1,1%)
./. BVG Arbeitnehmer-Anteil (variiert)
./. NBU Prämie (100% Arbeitnehmer)
./. KTG Prämie (50% Arbeitnehmer, falls vorhanden)
./. Quellensteuer (nur bei Ausländern ohne C-Ausweis)
= NETTOLOHN (Auszahlung)

SOZIALVERSICHERUNGEN — AUFTEILUNG:
• AHV/IV/EO: je ~5,3% AN + AG (total ~10,6%)
• ALV: je 1,1% AN + AG
• BVG (Pensionskasse): AG zahlt mind. gleich viel wie AN
• BU (Berufsunfall): 100% Arbeitgeber
• NBU (Nicht-Berufsunfall): 100% Arbeitnehmer

BUCHUNGSSCHRITTE:
1. Lohnaufwand / Lohnverbindlichkeiten (Brutto) + Sozialversicherungsverbindlichkeiten (AN-Anteil)
2. Sozialversicherungsaufwand / Sozialversicherungsverbindlichkeiten (AG-Anteil)
3. Lohnverbindlichkeiten / Bank (Nettolohn auszahlen)
4. Sozialversicherungsverbindlichkeiten / Bank (SV-Beiträge abführen)

SPESEN (Auslagenersatz):
Kein Lohnbestandteil → keine SV-Abgaben, nicht auf Lohnausweis
Buchung: Spesenaufwand / Bank (oder Kreditoren)

QUELLENSTEUER:
Gilt für Ausländer ohne Niederlassungsbewilligung (Ausweis B, L, G)
Arbeitgeber zieht vom Lohn ab und führt an Kanton ab
Buchung: Lohnverbindlichkeiten / Quellensteuerverbindlichkeiten`
)

await addGoals(ch, [
  'Du kannst aus dem Bruttolohn den Nettolohn berechnen.',
  'Du kennst die wichtigsten Sozialversicherungen und ihre Aufteilung zwischen AN und AG.',
  'Du kannst alle Lohnbuchungsschritte vollständig durchführen.',
  'Du weisst, was Spesen sind und wie sie gebucht werden.',
  'Du verstehst die Quellensteuer und weisst für wen sie gilt.',
])

await addTerms(ch, [
  ['Bruttolohn', 'Vertraglich vereinbarter Lohn vor allen Abzügen. Entspricht dem Lohnaufwand des Arbeitgebers.'],
  ['Nettolohn', 'Auszahlbetrag an den Mitarbeiter: Bruttolohn minus alle Abzüge (SV-Beiträge, Quellensteuer).'],
  ['AHV/IV/EO', 'Alters- und Hinterlassenenversicherung / Invalidenversicherung / Erwerbsersatzordnung. Total ~10,6%, je ~5,3% AN und AG.'],
  ['ALV (Arbeitslosenversicherung)', 'Sichert bei Arbeitslosigkeit. Je 1,1% Arbeitnehmer und Arbeitgeber. Nur bis zum versicherten Maximallohn.'],
  ['BVG (Pensionskasse)', 'Berufliche Vorsorge — 2. Säule. Beiträge variieren nach Alter und Lohn. AG zahlt mind. gleich viel wie AN.'],
  ['NBU (Nicht-Berufsunfall)', 'Versicherung für Freizeitunfälle. 100% vom Arbeitnehmer getragen (Abzug vom Lohn).'],
  ['BU (Berufsunfall)', 'Versicherung für Arbeits- und Wegunfälle. 100% vom Arbeitgeber getragen.'],
  ['Quellensteuer', 'Einkommenssteuer für Ausländer ohne Niederlassungsbewilligung (B, L, G-Ausweis). Direkt vom Lohn abgezogen und vom AG an Kanton abgeführt.'],
  ['Spesen', 'Auslagenersatz für betriebliche Auslagen des Mitarbeiters (Reise, Verpflegung). Kein Lohn — keine SV-Abgaben.'],
  ['Lohnausweis', 'Dokument für Steuererklärung: zeigt Bruttolohn, alle Abzüge, Naturalleistungen und Spesenpauschalen.'],
])

await addPoints(ch, [
  'Brutto → Netto: Abzüge = AHV/IV/EO + ALV + BVG + NBU (+ Quellensteuer)',
  'AG-Anteil = AHV/IV/EO + ALV + BVG + BU → separater Sozialversicherungsaufwand',
  'Schritt 1: Lohnaufwand (Brutto) / Lohnverbindlichkeiten (Netto) + SV-Verbindlichkeiten (AN-Abzüge)',
  'Schritt 2: Sozialversicherungsaufwand / SV-Verbindlichkeiten (AG-Anteil)',
  'Schritt 3: Lohnverbindlichkeiten / Bank (Nettolohn)',
  'Schritt 4: SV-Verbindlichkeiten / Bank (AN + AG Anteile an Kasse/AHV-Ausgleichskasse)',
  'Spesen: Spesenaufwand / Bank — keine SV, nicht Lohn',
  'Quellensteuer: Lohnverbindlichkeiten / Quellensteuerverbindlichkeiten (dann / Bank)',
  'Lohnausweis: jährlich für jeden Mitarbeitenden erstellen',
])

await addExamples(ch, [
  'LOHNABRECHNUNG: Bruttolohn CHF 6 000. AHV/IV/EO 5,3% = 318. ALV 1,1% = 66. BVG AN = 200. NBU = 36. Total Abzüge = 620. Nettolohn = CHF 5 380.',
  'BUCHUNGSSCHRITT 1 (Lohn erfassen): Lohnaufwand 6 000 / Lohnverbindlichkeiten 5 380 + SV-Verbindlichkeiten 620.',
  'BUCHUNGSSCHRITT 2 (AG-Anteil): AHV/IV/EO 318 + ALV 66 + BVG 200 + BU 30 = CHF 614. Buchung: Sozialversicherungsaufwand 614 / SV-Verbindlichkeiten 614.',
  'BUCHUNGSSCHRITT 3 (Nettolohn auszahlen): Lohnverbindlichkeiten 5 380 / Bank 5 380.',
  'BUCHUNGSSCHRITT 4 (SV abführen): SV-Verbindlichkeiten 1 234 (= 620 AN + 614 AG) / Bank 1 234.',
  'SPESEN: Mitarbeiter legt Reisespesen CHF 340 vor. Buchung: Spesenaufwand 340 / Bank 340. (Keine SV, kein Lohnausweis-Eintrag)',
  'QUELLENSTEUER: Bruttolohn CHF 4 500, Quellensteuer 15% = 675. Buchung Abzug: Lohnverbindlichkeiten 675 / Quellensteuerverbindlichkeiten 675. Abführung: Quellensteuerverbindlichkeiten 675 / Bank 675.',
])

await addQuiz(ch, [
  {
    q: 'Wer trägt die Prämie für den Nicht-Berufsunfall (NBU)?',
    opts: [['100% der Arbeitnehmer', true], ['100% der Arbeitgeber', false], ['50% AN, 50% AG', false], ['Der Staat', false]],
    exp: 'NBU (Freizeitunfall) = 100% Arbeitnehmer. BU (Berufsunfall/Wegunfall) = 100% Arbeitgeber.',
    diff: 'easy'
  },
  {
    q: 'Bruttolohn CHF 5 000, Abzüge total CHF 530. Wie lautet Buchungsschritt 1?',
    opts: [['Lohnaufwand 5 000 / Lohnverbindlichkeiten 4 470 + SV-Verbindlichkeiten 530', true], ['Lohnaufwand 4 470 / Bank 4 470', false], ['Bank 4 470 / Lohnaufwand 5 000', false], ['SV-Verbindlichkeiten 530 / Lohnaufwand 530', false]],
    exp: 'Schritt 1: Bruttolohn als Aufwand, Nettolohn (5 000 − 530 = 4 470) als Verbindlichkeit an AN, Abzüge (530) als Verbindlichkeit an SV-Träger.',
    diff: 'medium'
  },
  {
    q: 'Was unterscheidet Spesen vom Lohn?',
    opts: [['Spesen sind Auslagenersatz — kein Lohnbestandteil, keine SV-Abgaben', true], ['Spesen sind höher besteuert als der Lohn', false], ['Spesen gelten als Gewinnanteil', false], ['Spesen müssen auf dem Lohnausweis stehen', false]],
    exp: 'Spesen ersetzen dem Mitarbeiter seine betrieblichen Auslagen. Sie sind kein Lohn → keine AHV/ALV etc., kein Eintrag auf Lohnausweis (wenn effektive Spesen).',
    diff: 'easy'
  },
  {
    q: 'Für welche Personen gilt die Quellensteuer?',
    opts: [['Ausländer ohne Niederlassungsbewilligung (Ausweis B, L, G)', true], ['Alle Arbeitnehmer in der Schweiz', false], ['Nur für Grenzgänger', false], ['Nur für Teilzeitarbeitende', false]],
    exp: 'Quellensteuer gilt für Ausländer ohne C-Ausweis (Niederlassungsbewilligung). Sie ersetzt die normale Einkommenssteuer.',
    diff: 'medium'
  },
  {
    q: 'Wie wird der Arbeitgeberanteil der Sozialversicherungen gebucht?',
    opts: [['Sozialversicherungsaufwand / SV-Verbindlichkeiten', true], ['Lohnaufwand / SV-Verbindlichkeiten', false], ['SV-Verbindlichkeiten / Bank', false], ['Bank / Sozialversicherungsaufwand', false]],
    exp: 'AG-Anteil = separater Aufwand. Buchung: Sozialversicherungsaufwand (Soll) / SV-Verbindlichkeiten (Haben). Zahlung dann: SV-Verbindlichkeiten / Bank.',
    diff: 'medium'
  },
  {
    q: 'Wer zahlt den Berufsunfall (BU) gemäss UVG?',
    opts: [['100% der Arbeitgeber', true], ['100% der Arbeitnehmer', false], ['50/50 AN und AG', false], ['Freiwillig je nach Vertrag', false]],
    exp: 'Berufsunfall und Wegunfall (BU) = 100% vom Arbeitgeber finanziert. Im Gegensatz dazu: NBU (Freizeitunfall) = 100% Arbeitnehmer.',
    diff: 'easy'
  },
])

console.log('✅ Kapitel 6: Löhne und Gehälter erfolgreich erstellt.')
await client.end()
