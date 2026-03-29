import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function insertTopic(slug, title, description, examType, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'Globe','blue',$5,'frw',$6,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title,
       description=EXCLUDED.description,
       icon=EXCLUDED.icon,
       color=EXCLUDED.color,
       "order"=EXCLUDED."order",
       "updatedAt"=NOW()`,
    [topicId, slug, title, description, examType, order])
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

// ─── TOPIC ───────────────────────────────────────────────────────────────────

const tId = await insertTopic(
  'frw-rechtsformen',
  'Rechtsformen',
  'Einzelunternehmung, Aktiengesellschaft: Gründung, Eigenkapital, Gewinnverteilung und Rechtsformvergleich.',
  'abschluss',
  14
)

// ─── CHAPTER ─────────────────────────────────────────────────────────────────

const ch = await insertChapter(
  tId,
  'einzelunternehmung',
  'Einzelunternehmung',
  'Gründung, Eigenkapital, Konto Privat, Unternehmerinkommen und Privatanteile',
  1,
  `EINZELUNTERNEHMUNG — einfachste Unternehmensform, Inhaber und Betrieb sind rechtlich identisch.

EIGENKAPITAL DER EINZELUNTERNEHMUNG:
• Passivkonto — zeigt den Anspruch der Inhaberin auf das Reinvermögen des Unternehmens
• Zunahmen im Haben: Kapitaleinlagen, Jahresgewinn, Übertrag Privat-Habensaldo
• Abnahmen im Soll: Kapitalrückzüge, Jahresverlust, Übertrag Privat-Sollsaldo
• EK Ende = EK Anfang + Jahresgewinn − Netto-Privatbezüge (Bezüge − Einlagen)
• Steuern: Inhaber versteuert Gewinn als Einkommen (Einkommenssteuer) und EK als Vermögen

KONTO PRIVAT — Schema:
Soll (belastet)                         Haben (gutgeschrieben)
Kapitalbezüge (Geldentnahmen)           Privateinlagen (Geld eingebracht)
Sachbezüge (Waren entnommen)            Sacheinlagen (Anlagen eingebracht)
Private Rechnungen via Betrieb          Gutschrift Eigenlohn
Privatanteil Fahrzeug, Telefon          Gutschrift Eigenzins

BUCHUNGEN PRIVAT / EIGENKAPITAL:
• Geldbezug: Privat / Kasse (oder Bank)
• Sachbezug Waren: Privat / Warenaufwand (immer zum EINSTANDSPREIS)
• Private Rechnung: Privat / Kreditoren (oder Bank)
• Privateinlage Geld: Bank / Privat
• Sacheinlage Anlage: Fahrzeuge / Privat (zum Verkehrswert)
• Eigenlohn: Lohnaufwand / Privat
• Eigenzins: Zinsaufwand / Privat

JAHRESABSCHLUSS KONTO PRIVAT → EIGENKAPITAL:
• Bezüge > Einlagen (Normallfall): Eigenkapital / Privat (EK sinkt)
• Einlagen > Bezüge (Netto-Einlage): Privat / Eigenkapital (EK steigt)

GRÜNDUNG (Eröffnungsbilanz):
• Bareinlage: Bank / Eigenkapital
• Sacheinlage: Fahrzeuge (Verkehrswert) / Eigenkapital
• Fremdkapital: Eigenkapital / Darlehen (wenn mitgebrachte Schulden)
• Kauf Anlagen: Einrichtungen / Bank

GEWINN- UND VERLUSTAUSWEIS:
• Jahresgewinn: Erfolgsrechnung → Eigenkapital / Jahresgewinn (erhöht EK)
• Jahresverlust: Jahresverlust / Eigenkapital (vermindert EK)
• Keine Reservenbildung wie bei juristischen Personen — Gewinn gehört vollständig der Inhaberin

UNTERNEHMERINKOMMEN:
• = Eigenlohn + Eigenzins + Reingewinn
• Eigenlohn: kalkulatorisch — was ein Angestellter kosten würde
• Eigenzins: kalkulatorisch — Verzinsung des eingesetzten Eigenkapitals
• Zeigt den «echten Gesamtverdienst» im Vergleich zu einer Anstellung

PRIVATANTEIL (MWSt-Korrektur):
• Betriebliche Güter/Dienste privat genutzt → Privatanteil erfassen
• Fahrzeug: Privat / Fahrzeugaufwand (prozentualer Anteil privater Nutzung)
• Vorsteuerkorrektur: Privat / Vorsteuer (private Nutzung ist nicht vorsteuerberechtigt)`
)

// ─── LEARNING GOALS ──────────────────────────────────────────────────────────

await addGoals(ch, [
  'Du kennst die Merkmale der Einzelunternehmung (Haftung, Gründung, HR-Pflicht, Steuern).',
  'Du kannst das Konto Eigenkapital als Passivkonto erklären und dessen Bewegungen zuordnen.',
  'Du kannst das Konto Privat führen und weisst, welche Buchungen auf Soll- und Habenseite gehören.',
  'Du kannst typische Privat/Eigenkapital-Buchungen korrekt erfassen (Bezüge, Einlagen, Sachbezüge).',
  'Du kannst die Eröffnungsbilanz bei Gründung einer Einzelunternehmung erstellen.',
  'Du kannst den Jahresabschluss des Privatkontos buchen und die EK-Veränderung berechnen.',
  'Du kannst den Gewinn- und Verlustausweis der Einzelunternehmung erklären.',
  'Du kannst das Unternehmerinkommen aus Eigenlohn, Eigenzins und Reingewinn ermitteln.',
  'Du weisst, wie Privatanteile gebucht werden und welche MWSt-Konsequenzen (Vorsteuerkorrektur) entstehen.',
])

// ─── KEY TERMS ───────────────────────────────────────────────────────────────

await addTerms(ch, [
  ['Einzelunternehmung', 'Einfachste Unternehmensform. Keine juristische Person — Inhaber und Unternehmen sind rechtlich identisch. Unbeschränkte persönliche Haftung mit Geschäfts- und Privatvermögen.'],
  ['Konto Eigenkapital', 'Passivkonto. Zeigt den Anspruch der Inhaberin auf das Reinvermögen des Unternehmens. Steigt durch Einlagen und Gewinn, sinkt durch Verlust und Netto-Privatbezüge.'],
  ['Konto Privat', 'Unterkonto des Eigenkapitals. Sammelt alle privaten Transaktionen des Inhabers: Bezüge (Soll) und Einlagen/Gutschriften (Haben). Wird am Jahresende auf Eigenkapital abgeschlossen.'],
  ['Kapitalbezug', 'Entnahme von Geld aus dem Unternehmen durch den Inhaber. Buchung: Privat / Kasse oder Bank.'],
  ['Sachbezug', 'Entnahme von Waren oder Gütern für den privaten Gebrauch. Buchung: Privat / Warenaufwand (immer zum Einstandspreis, nie zum Verkaufspreis).'],
  ['Privateinlage', 'Einbringen von privatem Geld oder Sachwerten in das Unternehmen. Buchung: Bank / Privat (Geld) oder Fahrzeuge / Privat (Sacheinlage zum Verkehrswert).'],
  ['Gründungsbilanz', 'Eröffnungsbilanz nach den ersten Gründungsgeschäften. Zeigt Anfangsvermögen und Startfinanzierung. Entsteht durch Einlagen, Darlehensaufnahmen und Anschaffungen.'],
  ['Unternehmerinkommen', 'Wirtschaftlicher Gesamtertrag der Inhaberin: Eigenlohn + Eigenzins + Reingewinn. Zeigt, was sie im Vergleich zu einer Anstellung effektiv «verdient» hat.'],
  ['Eigenlohn', 'Kalkulatorische Entschädigung für die persönliche Arbeitsleistung der Inhaberin. Buchung: Lohnaufwand / Privat. Bestandteil des Unternehmereinkommens.'],
  ['Eigenzins', 'Kalkulatorische Verzinsung des von der Inhaberin eingesetzten Eigenkapitals. Buchung: Zinsaufwand / Privat. Bestandteil des Unternehmereinkommens.'],
  ['Privatanteil', 'Anteil betrieblicher Güter oder Dienstleistungen, der privat genutzt wird. Muss separat verbucht werden (Privat / Aufwandkonto). MWSt-Korrektur: Privat / Vorsteuer.'],
  ['Vorsteuerkorrektur', 'Rückgabe von Vorsteuer, die auf privat genutzten Leistungen lastete. Private Nutzung ist nicht vorsteuerberechtigt → Buchung: Privat / Vorsteuer.'],
  ['Handelsregisterpflicht', 'Einzelunternehmen müssen sich ab CHF 100 000 Jahresumsatz im Handelsregister eintragen. Die Firma muss den Familiennamen des Inhabers enthalten.'],
  ['Kapitalbedarfsplanung', 'Planung vor der Gründung: Verwendungsseite (Investitionen, Vorräte, liquide Mittel) und Herkunftsseite (Eigenkapital, Bankkredit, Darlehen, Lieferantenkredit).'],
])

// ─── CORE POINTS ─────────────────────────────────────────────────────────────

await addPoints(ch, [
  'Haftung Einzelunternehmung: UNBESCHRÄNKT — Inhaber haftet mit privatem UND geschäftlichem Vermögen.',
  'Gründung formlos — Unternehmen entsteht mit Aufnahme der Tätigkeit (kein Notar, kein Mindestkapital).',
  'HR-Pflicht ab CHF 100 000 Jahresumsatz; Firma muss Familienname des Inhabers enthalten.',
  'Konto Privat ist Unterkonto des Eigenkapitals: Bezüge → Soll | Einlagen/Gutschriften → Haben.',
  'Sachbezug (Warenbezug): IMMER zum Einstandspreis buchen — Buchungssatz: Privat / Warenaufwand.',
  'Privateinlage Geld: Buchungssatz: Bank / Privat. Sacheinlage Anlage: Fahrzeuge / Privat (Verkehrswert).',
  'Jahresabschluss Privat → EK: Bezüge > Einlagen (Normal): Eigenkapital / Privat (EK sinkt).',
  'Jahresabschluss Privat → EK: Einlagen > Bezüge (Netto-Einlage): Privat / Eigenkapital (EK steigt).',
  'EK-Formel: EK Ende = EK Anfang + Jahresgewinn − (Bezüge − Einlagen).',
  'Jahresgewinn erhöht EK direkt (über Erfolgsrechnung). Jahresverlust vermindert EK.',
  'Eigenlohn: Buchung: Lohnaufwand / Privat. Eigenzins: Buchung: Zinsaufwand / Privat.',
  'Unternehmerinkommen = Eigenlohn + Eigenzins + Reingewinn (zeigt wirtschaftlichen Gesamtertrag).',
  'Privatanteil Fahrzeug/Telefon: Privat / Fahrzeugaufwand (bzw. Kommunikationsaufwand).',
  'Vorsteuerkorrektur Privatanteil: Privat / Vorsteuer — private Nutzung ist nicht vorsteuerberechtigt.',
  'Gründungsbilanz: Bareinlage: Bank / EK | Sacheinlage: Fahrzeuge / EK | Fremdkapital: EK / Darlehen.',
])

// ─── QUIZ ─────────────────────────────────────────────────────────────────────

await addQuiz(ch, [
  {
    q: 'Wie haftet der Inhaber einer Einzelunternehmung?',
    opts: [
      ['Unbeschränkt mit privatem und geschäftlichem Vermögen', true],
      ['Nur mit dem Geschäftsvermögen', false],
      ['Bis zur Höhe des eingebrachten Eigenkapitals', false],
      ['Gar nicht persönlich', false],
    ],
    exp: 'Die Einzelunternehmung ist keine juristische Person. Inhaber und Unternehmen sind identisch → unbeschränkte persönliche Haftung mit beiden Vermögenssphären.',
    diff: 'easy',
  },
  {
    q: 'Ab welchem Jahresumsatz ist eine Einzelunternehmung handelsregisterpflichtig?',
    opts: [
      ['CHF 100 000', true],
      ['CHF 50 000', false],
      ['CHF 200 000', false],
      ['Immer, ab Gründung', false],
    ],
    exp: 'Die Handelsregisterpflicht tritt für Einzelunternehmen ab CHF 100 000 Jahresumsatz im Handels- und Gewerbebereich ein.',
    diff: 'easy',
  },
  {
    q: 'Der Inhaber entnimmt Waren (Einstandspreis CHF 600, Verkaufspreis CHF 900) für privaten Gebrauch. Welcher Betrag und welcher Buchungssatz ist korrekt?',
    opts: [
      ['Privat 600 / Warenaufwand 600', true],
      ['Privat 900 / Warenertrag 900', false],
      ['Warenaufwand 600 / Privat 600', false],
      ['Eigenkapital 600 / Warenaufwand 600', false],
    ],
    exp: 'Sachbezüge werden immer zum Einstandspreis verbucht. Buchungssatz: Privat (Soll) / Warenaufwand (Haben) — der Aufwand im Betrieb wird reduziert.',
    diff: 'medium',
  },
  {
    q: 'Auf welcher Seite des Privatkontos stehen Kapitalbezüge (Geldentnahmen)?',
    opts: [
      ['Soll (Debit)', true],
      ['Haben (Credit)', false],
      ['Wird direkt auf Eigenkapital gebucht', false],
      ['Auf beiden Seiten gleich', false],
    ],
    exp: 'Bezüge belasten das Privatkonto → Soll-Seite. Einlagen und Gutschriften (Eigenlohn, Eigenzins) stehen im Haben.',
    diff: 'easy',
  },
  {
    q: 'Jahresgewinn CHF 45 000. Privatbezüge CHF 38 000, Privateinlagen CHF 5 000. Wie verändert sich das Eigenkapital?',
    opts: [
      ['EK steigt um CHF 12 000', true],
      ['EK sinkt um CHF 12 000', false],
      ['EK steigt um CHF 45 000', false],
      ['EK ändert sich nicht', false],
    ],
    exp: 'EK-Veränderung = Gewinn + Einlagen − Bezüge = 45 000 + 5 000 − 38 000 = +CHF 12 000. EK steigt.',
    diff: 'hard',
  },
  {
    q: 'Privatbezüge CHF 32 000, Privateinlagen CHF 8 000 — welcher Buchungssatz schliesst das Privatkonto ab?',
    opts: [
      ['Eigenkapital 24 000 / Privat 24 000', true],
      ['Privat 24 000 / Eigenkapital 24 000', false],
      ['Eigenkapital 32 000 / Privat 32 000', false],
      ['Privat 8 000 / Eigenkapital 8 000', false],
    ],
    exp: 'Netto-Bezüge = 32 000 − 8 000 = CHF 24 000. Bezüge > Einlagen → EK sinkt → Buchung: Eigenkapital / Privat 24 000.',
    diff: 'medium',
  },
  {
    q: 'Wie wird die Gründungseinlage einer Inhaberin (Bareinlage CHF 80 000) verbucht?',
    opts: [
      ['Bank 80 000 / Eigenkapital 80 000', true],
      ['Eigenkapital 80 000 / Bank 80 000', false],
      ['Bank 80 000 / Privat 80 000', false],
      ['Privat 80 000 / Eigenkapital 80 000', false],
    ],
    exp: 'Bareinlagen bei Gründung erhöhen Bank (Aktiv) und Eigenkapital (Passiv). Buchung: Bank / Eigenkapital.',
    diff: 'easy',
  },
  {
    q: 'Was ist das Unternehmerinkommen der Einzelunternehmung?',
    opts: [
      ['Eigenlohn + Eigenzins + Reingewinn', true],
      ['Nur der Reingewinn des Unternehmens', false],
      ['Reingewinn abzüglich AHV-Beiträge', false],
      ['Nettolohn des Inhabers gemäss Arbeitsvertrag', false],
    ],
    exp: 'Das Unternehmerinkommen besteht aus drei Komponenten: Eigenlohn (kalkulatorisch für eigene Arbeit), Eigenzins (Verzinsung des EK) und Reingewinn. Es zeigt den wirtschaftlichen Gesamtertrag.',
    diff: 'medium',
  },
  {
    q: 'Ein Geschäftsfahrzeug wird zu 30% privat genutzt. Fahrzeugaufwand Jahr: CHF 10 000. Buchung des Privatanteils?',
    opts: [
      ['Privat 3 000 / Fahrzeugaufwand 3 000', true],
      ['Fahrzeugaufwand 3 000 / Privat 3 000', false],
      ['Privat 10 000 / Fahrzeugaufwand 10 000', false],
      ['Eigenkapital 3 000 / Fahrzeugaufwand 3 000', false],
    ],
    exp: 'Privatanteil = 30% × CHF 10 000 = CHF 3 000. Buchung: Privat (Soll) / Fahrzeugaufwand (Haben). Zusätzlich Vorsteuerkorrektur: Privat / Vorsteuer.',
    diff: 'medium',
  },
  {
    q: 'Sabine Hofer bringt bei Gründung ihr Privatfahrzeug (Verkehrswert CHF 18 000) ins Unternehmen ein. Buchung?',
    opts: [
      ['Fahrzeuge 18 000 / Eigenkapital 18 000', true],
      ['Eigenkapital 18 000 / Fahrzeuge 18 000', false],
      ['Fahrzeuge 18 000 / Privat 18 000', false],
      ['Privat 18 000 / Fahrzeuge 18 000', false],
    ],
    exp: 'Sacheinlagen bei Gründung werden zum Verkehrswert erfasst. Aktivkonto (Fahrzeuge) steigt, Eigenkapital (Passiv) steigt. Buchung: Fahrzeuge / Eigenkapital.',
    diff: 'medium',
  },
  {
    q: 'Warum muss die Vorsteuer bei privater Nutzung eines Geschäftsfahrzeugs korrigiert werden?',
    opts: [
      ['Weil private Nutzung nicht vorsteuerberechtigt ist', true],
      ['Weil das Fahrzeug abgeschrieben wird', false],
      ['Weil der Privatanteil steuerfrei ist', false],
      ['Weil die MWST nur bei Verkauf anfällt', false],
    ],
    exp: 'Vorsteuer darf nur auf geschäftlich genutzten Leistungen geltend gemacht werden. Der private Anteil ist nicht vorsteuerberechtigt → Korrektur: Privat / Vorsteuer.',
    diff: 'hard',
  },
])

console.log('✅ Kapitel 7: Einzelunternehmung erfolgreich aktualisiert.')
await client.end()
