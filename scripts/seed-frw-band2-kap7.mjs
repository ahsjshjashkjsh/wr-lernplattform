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

const tId = await insertTopic('frw-einzelunternehmung', 'Einzelunternehmung', 'Konto Privat, Unternehmerinkommen, Gründung und Bilanz der Einzelunternehmung.', 'abschluss', 14)

const ch = await insertChapter(tId,
  'einzelunternehmung',
  'Einzelunternehmung',
  'Gründung, Konto Privat, Unternehmerinkommen und Privatanteile',
  1,
  `Die Einzelunternehmung ist die einfachste Unternehmensform — der Inhaber und das Unternehmen sind rechtlich identisch.

MERKMALE:
• Keine juristische Person — Inhaber = Unternehmen (identisch)
• Gründung: formlos, nur durch Aufnahme der Tätigkeit (kein Notar, kein Mindestkapital)
• HR-Pflicht: ab CHF 100 000 Jahresumsatz im Handelsregister eintragen
• Buchführungspflicht: ab CHF 500 000 Umsatz vollständige Buchhaltung
• Haftung: UNBESCHRÄNKT — privates und geschäftliches Vermögen haften gleichermassen
• Kapital: kein gesetzliches Mindestkapital
• Steuern: Gewinn = Einkommen des Inhabers → Einkommenssteuer + Vermögenssteuer

KONTO PRIVAT — Schema:
Soll (belastet)                   Haben (gutgeschrieben)
Kapitalbezüge (Geldentnahmen)     Privateinlagen (Geld eingebracht)
Sachbezüge (Waren entnommen)      Sacheinlagen (Anlagen eingebracht)
Private Rechnungen via Betrieb
Privatanteil Fahrzeug, Telefon

BUCHUNGEN:
• Geldbezug: Privat / Kasse (oder Bank)
• Sachbezug Waren: Privat / Warenaufwand (immer zum EINSTANDSPREIS)
• Private Rechnung: Privat / Kreditoren (oder Bank)
• Privateinlage Geld: Bank / Privat
• Sacheinlage Anlage: Fahrzeuge / Privat (zum Verkehrswert)

JAHRESABSCHLUSS KONTO PRIVAT → EIGENKAPITAL:
• Bezüge > Einlagen (Normal): Eigenkapital / Privat (EK sinkt)
• Einlagen > Bezüge: Privat / Eigenkapital (EK steigt)
• EK Ende = EK Anfang + Jahresgewinn − Netto-Privatbezüge (Bezüge − Einlagen)

GRÜNDUNG (Eröffnungsbilanz):
Bareinlagen: Bank / Eigenkapital | Sacheinlagen: Fahrzeuge / Eigenkapital usw.
Fremdkapital mitgebracht: Eigenkapital / Darlehen

UNTERNEHMERINKOMMEN:
= Reingewinn + kalkulatorische Zinsen auf EK (was hätte er bei Bankanlage verdient?)
  + kalkulatorischer Unternehmerlohn (was würde ein angestellter Manager kosten?)
Zeigt den «echten Gesamtverdienst» des Unternehmers im Vergleich zu einer Anstellung

PRIVATANTEIL (MWSt-Korrektur):
Wenn betriebliche Güter/Dienste privat genutzt werden → Privatanteil
Buchung: Privat / Aufwandkonto + Privat / Vorsteuer (Vorsteuerkorrektur für private Nutzung)`
)

await addGoals(ch, [
  'Du kennst die Merkmale der Einzelunternehmung (Haftung, Gründung, Steuern).',
  'Du kannst die Konten Eigenkapital und Privat erklären und korrekt buchen.',
  'Du kannst die Eröffnungsbilanz bei Gründung einer Einzelunternehmung erstellen.',
  'Du kannst das Unternehmerinkommen erklären und abgrenzen.',
  'Du weisst, wie Privatanteile gebucht werden und welche MWSt-Konsequenzen entstehen.',
])

await addTerms(ch, [
  ['Einzelunternehmung', 'Einfachste Unternehmensform. Keine juristische Person — Inhaber und Unternehmen sind identisch. Unbeschränkte persönliche Haftung.'],
  ['Konto Eigenkapital', 'Zeigt das Kapital des Inhabers im Unternehmen. Eröffnung = Aktiven minus Passiven. Wird am Jahresende um Gewinn/Verlust und Netto-Privatbewegungen angepasst.'],
  ['Konto Privat', 'Sammelt alle privaten Transaktionen des Inhabers: Bezüge (Soll) und Einlagen (Haben). Wird am Jahresende auf Eigenkapital abgeschlossen.'],
  ['Kapitalbezug', 'Entnahme von Geld aus dem Unternehmen durch den Inhaber. Buchung: Privat / Kasse oder Bank.'],
  ['Sachbezug', 'Entnahme von Waren oder Gütern für den privaten Gebrauch. Buchung: Privat / Warenaufwand (zum Einstandspreis).'],
  ['Privateinlage', 'Einbringen von privatem Geld oder Sachwerten in das Unternehmen. Buchung: Bank oder Anlage / Privat.'],
  ['Unternehmerinkommen', 'Gesamter «Verdienst» des Unternehmers: Reingewinn + kalkulatorische Zinsen auf EK. Zeigt, was er wirklich erwirtschaftet hat.'],
  ['Privatanteil', 'Anteil der betrieblichen Güter/Dienstleistungen, der privat genutzt wird. MWSt-Korrektur nötig: Vorsteuer zurückgeben.'],
  ['Handelsregisterpflicht', 'Einzelunternehmen müssen sich ab CHF 100 000 Jahresumsatz im Handelsregister eintragen.'],
])

await addPoints(ch, [
  'Haftung Einzelunternehmen: UNBESCHRÄNKT — privates + geschäftliches Vermögen',
  'Gründung formlos — nur durch Aufnahme der Tätigkeit (kein Notar, kein Mindestkapital)',
  'Konto Privat: Bezüge (Soll) und Einlagen (Haben) — kein Lohn!',
  'Sachbezug: immer zum EINSTANDSPREIS buchen (nicht Verkaufspreis)',
  'Jahresabschluss Privat: wenn Bezüge > Einlagen → EK sinkt: Eigenkapital / Privat',
  'Jahresabschluss Privat: wenn Einlagen > Bezüge → EK steigt: Privat / Eigenkapital',
  'EK Ende = EK Anfang + Gewinn − Netto-Privatbezüge (Bezüge − Einlagen)',
  'Privatanteil Fahrzeug/Telefon: Privat / Aufwandkonto + Privat / Vorsteuer (MWSt zurückgeben)',
  'Unternehmerinkommen = Reingewinn + kalkulatorische EK-Zinsen',
])

await addExamples(ch, [
  'GRÜNDUNG: Sabina Hofer gründet Einzelunternehmen. Einlagen: Bank 60 000, Fahrzeug 14 000, Waren 10 000, Darlehen 20 000. Buchungen: Bank 60 000 / EK 60 000; Fahrzeuge 14 000 / EK 14 000; Waren 10 000 / EK 10 000; EK 20 000 / Darlehen 20 000. EK = 64 000.',
  'GELDBEZUG: Inhaber entnimmt CHF 3 500 aus der Kasse. Buchung: Privat 3 500 / Kasse 3 500.',
  'SACHBEZUG: Inhaber entnimmt Waren (Einstandspreis CHF 400) für privaten Gebrauch. Buchung: Privat 400 / Warenaufwand 400.',
  'PRIVATEINLAGE: Inhaber zahlt CHF 10 000 privates Geld in Betrieb ein. Buchung: Bank 10 000 / Privat 10 000.',
  'JAHRESABSCHLUSS PRIVAT: Bezüge total CHF 36 000, Einlagen CHF 10 000. Netto-Bezüge = CHF 26 000. EK sinkt. Buchung: Eigenkapital 26 000 / Privat 26 000.',
  'PRIVATANTEIL FAHRZEUG: Fahrzeug 30% privat genutzt. Fahrzeugaufwand Jahr = CHF 8 000. Privatanteil = CHF 2 400. Buchung: Privat 2 400 / Fahrzeugaufwand 2 400. Dazu MWSt-Korrektur: Privat / Vorsteuer (CHF 2 400 × 8,1% / 108,1%).',
])

await addQuiz(ch, [
  {
    q: 'Wie haftet der Inhaber einer Einzelunternehmung?',
    opts: [['Unbeschränkt mit privatem und geschäftlichem Vermögen', true], ['Nur mit dem Geschäftsvermögen', false], ['Bis zu CHF 100 000', false], ['Gar nicht persönlich', false]],
    exp: 'Die Einzelunternehmung ist keine juristische Person. Inhaber und Unternehmen sind identisch → unbeschränkte persönliche Haftung.',
    diff: 'easy'
  },
  {
    q: 'Der Inhaber entnimmt Waren (Einstandspreis CHF 600) für privaten Gebrauch. Buchung?',
    opts: [['Privat 600 / Warenaufwand 600', true], ['Privat 600 / Warenertrag 600', false], ['Warenaufwand 600 / Privat 600', false], ['Eigenkapital 600 / Warenaufwand 600', false]],
    exp: 'Sachbezug immer zum Einstandspreis. Buchung: Privat (belastet) / Warenaufwand (reduziert den Aufwand im Betrieb).',
    diff: 'medium'
  },
  {
    q: 'Auf welcher Seite des Privatkontos stehen Kapitalbezüge (Geldentnahmen)?',
    opts: [['Soll (Debit)', true], ['Haben (Credit)', false], ['Wird nicht auf Privat gebucht', false], ['Auf beiden Seiten', false]],
    exp: 'Bezüge = Belastungen → Soll-Seite des Privatkontos. Einlagen = Haben-Seite.',
    diff: 'easy'
  },
  {
    q: 'Jahresgewinn CHF 45 000. Privatbezüge CHF 38 000, Privateinlagen CHF 5 000. Wie verändert sich das Eigenkapital?',
    opts: [['EK steigt um CHF 12 000', true], ['EK sinkt um CHF 12 000', false], ['EK steigt um CHF 45 000', false], ['EK ändert sich nicht', false]],
    exp: 'EK-Veränderung = Gewinn + Einlagen − Bezüge = 45 000 + 5 000 − 38 000 = + CHF 12 000.',
    diff: 'hard'
  },
  {
    q: 'Ab welchem Jahresumsatz ist eine Einzelunternehmung handelsregisterpflichtig?',
    opts: [['CHF 100 000', true], ['CHF 50 000', false], ['CHF 200 000', false], ['Immer, ab Gründung', false]],
    exp: 'Handelsregisterpflicht für Einzelunternehmen besteht ab CHF 100 000 Jahresumsatz.',
    diff: 'easy'
  },
  {
    q: 'Was ist das Unternehmerinkommen?',
    opts: [['Reingewinn + kalkulatorische Zinsen auf Eigenkapital', true], ['Nur der Reingewinn des Unternehmens', false], ['Der Nettolohn des Inhabers', false], ['Der Bruttolohn minus SV-Beiträge', false]],
    exp: 'Unternehmerinkommen = Reingewinn + kalkulatorische EK-Zinsen. Zeigt, was der Unternehmer im Vergleich zu einer Anstellung wirklich «verdient» hat.',
    diff: 'medium'
  },
])

console.log('✅ Kapitel 7: Einzelunternehmung erfolgreich erstellt.')
await client.end()
