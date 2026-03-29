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

async function upsertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET title=EXCLUDED.title, subtitle=EXCLUDED.subtitle, summary=EXCLUDED.summary, "contentStatus"='complete', "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary]
  )
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function replaceGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1]
    )
}

async function replaceTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1]
    )
}

async function replacePoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1]
    )
}

async function replaceQuiz(chId, questions) {
  await client.query(
    `DELETE FROM "QuizOption" WHERE "questionId" IN (SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1)`,
    [chId]
  )
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])

  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff || 'medium', i + 1]
    )
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j + 1]
      )
  }
}

// ─── Topic & Chapter ────────────────────────────────────────────────────────

const tId = await getTopicId('frw-loehne-gehaelter')

const ch = await upsertChapter(
  tId,
  'loehne-gehaelter',
  'Löhne und Gehälter',
  'Lohnabrechnung, Sozialversicherungen und Spesen buchen',
  10,
  `LOHNABRECHNUNG — Von Brutto zu Netto:

BRUTTOLOHN — vertraglich vereinbarter Lohn vor allen Abzügen. Bemessungsgrundlage für alle Sozialversicherungen. Kann durch Kinder- oder Ausbildungszulagen ergänzt werden.

SOZIALABZÜGE DES ARBEITNEHMERS (AN):
• AHV/IV/EO: 5,3 % des Bruttolohns (AN-Anteil; Gesamtsatz 10,6 %)
• ALV: 1,1 % des Bruttolohns (AN-Anteil; nur bis CHF 148 200 Jahreslohn)
• BVG (Pensionskasse / 2. Säule): variiert nach Alter und Vorsorgeeinrichtung — AN zahlt mind. 50 %
• NBU (Nichtberufsunfall): 100 % Arbeitnehmer — Freizeitunfälle
= NETTOLOHN (effektiver Auszahlungsbetrag an den Arbeitnehmer)

ARBEITGEBERANTEIL (AG) — Lohnzusatzkosten, kürzen nicht den Nettolohn:
• AHV/IV/EO: 5,3 % (AG-Anteil; spiegelgleich zum AN)
• ALV: 1,1 % (AG-Anteil)
• BVG: mindestens gleich viel wie AN-Anteil
• BU (Berufsunfall): 100 % Arbeitgeber — branchenabhängiger Satz
• VKB (Verwaltungskostenbeitrag): max. 3 % der AHV/IV/EO-Beiträge

BUCHUNGSSÄTZE LOHNABRECHNUNG (4 Schritte):
1. Lohnaufwand (Brutto) / Lohnverbindlichkeiten (Netto) + Verbindlichkeiten Sozialversicherungen (AN-Abzüge)
2. Sozialversicherungsaufwand / Verbindlichkeiten Sozialversicherungen (AG-Anteil)
3. Lohnverbindlichkeiten / Bank (Nettolohn auszahlen)
4. Verbindlichkeiten Sozialversicherungen / Bank (AN + AG Anteile an Ausgleichskasse/PK/Unfallversicherung)

QUELLENSTEUER — gilt für Ausländer ohne C-Ausweis (Ausweis B, L, G) und Grenzgänger:
• Ersetzt die normale Einkommenssteuer
• AG zieht direkt vom Nettolohn ab und führt an Kanton ab
• Buchung Abzug: Lohnverbindlichkeiten / Quellensteuerverbindlichkeiten
• Abführung: Quellensteuerverbindlichkeiten / Bank

NETTOLOHN — Bruttolohn minus alle AN-Abzüge = Auszahlungsbetrag an Arbeitnehmer.

LOHNAUSWEIS — jährliches Dokument für die Steuererklärung des Arbeitnehmers: zeigt Bruttolohn, alle Abzüge, Naturalleistungen, Privatanteil Geschäftsfahrzeug und Spesenpauschalen.

SPESEN — Auslagenersatz für betriebliche Auslagen (Reise, Verpflegung, Repräsentation):
• Kein Lohnbestandteil → keine SV-Abgaben
• Effektive Spesen: nicht auf Lohnausweis
• Buchung: Spesenaufwand (Übriger Personalaufwand) / Bank
• Pauschalspesen: muss mit Kanton vereinbart sein; auf Lohnausweis eingetragen

SPEZIALFÄLLE:
• Lohnvorschuss: zuerst Vorschusszahlung buchen (Lohnvorschuss / Bank), dann bei Lohnabrechnung nur Restbetrag auszahlen
• Naturallohn (z.B. Kost & Logis im Gastgewerbe): Teil der Vergütung in Sachleistungen; separat abgegrenzt
• Warenbezüge zu reduzierten Preisen: geldwerter Vorteil ist SV-pflichtig — Lohnaufwand / Warenertrag`
)

// ─── Learning Goals (min 6) ─────────────────────────────────────────────────

await replaceGoals(ch, [
  'Du kannst den Nettolohn aus dem Bruttolohn berechnen, indem du alle Arbeitnehmerabzüge (AHV/IV/EO, ALV, BVG, NBU) korrekt abziehst.',
  'Du kennst die wichtigsten Sozialversicherungen der Schweiz, deren Beitragssätze und die Aufteilung zwischen Arbeitnehmer und Arbeitgeber.',
  'Du kannst alle vier Buchungsschritte der Lohnabrechnung vollständig und korrekt durchführen.',
  'Du verstehst den Unterschied zwischen Lohnaufwand (Bruttolohn) und Sozialversicherungsaufwand (AG-Anteil) und deren Kontenlogik.',
  'Du weisst, was Spesen sind, warum sie kein Lohnbestandteil sind und wie sie korrekt verbucht werden.',
  'Du verstehst die Quellensteuer: für wen sie gilt, wie sie abgezogen und abgeführt wird.',
  'Du kannst Spezialfälle wie Lohnvorschüsse, Naturallohn und Warenbezüge buchhalterisch einordnen und verbuchen.',
  'Du kannst den vollständigen Personalaufwand eines Unternehmens (Lohnaufwand + SV-Aufwand) ermitteln.',
])

// ─── Key Terms (min 10) ─────────────────────────────────────────────────────

await replaceTerms(ch, [
  ['Bruttolohn', 'Vertraglich vereinbarter Lohn vor allen Abzügen. Bemessungsgrundlage für Sozialversicherungen und Ausgangspunkt der Lohnabrechnung.'],
  ['Nettolohn', 'Auszahlungsbetrag an den Arbeitnehmer: Bruttolohn minus alle Arbeitnehmerabzüge (AHV/IV/EO, ALV, BVG, NBU, Quellensteuer).'],
  ['AHV/IV/EO', 'Alters- und Hinterlassenenversicherung / Invalidenversicherung / Erwerbsersatzordnung. Gesamtsatz 10,6 % — je 5,3 % AN und AG.'],
  ['ALV', 'Arbeitslosenversicherung. Gesamtsatz 2,2 % (je 1,1 % AN und AG) bis max. CHF 148 200 Jahreslohn pro Arbeitsverhältnis.'],
  ['BVG / Pensionskasse', 'Berufliche Vorsorge (2. Säule). Ab CHF 21 510 Jahreslohn obligatorisch. AG zahlt mind. gleich viel wie AN. Satz variiert nach Alter.'],
  ['BU (Berufsunfall)', 'Unfallversicherung für Arbeitsunfälle und Wegunfälle. Prämie zu 100 % vom Arbeitgeber getragen, branchenabhängiger Satz.'],
  ['NBU (Nichtberufsunfall)', 'Unfallversicherung für Freizeitunfälle. Prämie zu 100 % vom Arbeitnehmer getragen (Abzug vom Lohn).'],
  ['Quellensteuer', 'Einkommenssteuer für Ausländer ohne Niederlassungsbewilligung C (Ausweis B, L, G, Grenzgänger). AG zieht direkt ab und führt an Kanton ab.'],
  ['Lohnaufwand', 'Erfolgsrechnungskonto für den gesamten Bruttolohn: enthält Nettolohn + AN-Sozialabzüge. Gegenposition: Lohnverbindlichkeiten + Verbindlichkeiten SV.'],
  ['Sozialversicherungsaufwand', 'Separates Aufwandkonto für die AG-Anteile an Sozialversicherungen (AHV/IV/EO, ALV, BVG, BU, VKB). Erhöht den Personalaufwand über den Bruttolohn hinaus.'],
  ['Verbindlichkeiten Sozialversicherungen', 'Passivkonto für ausstehende SV-Beiträge (AN + AG) gegenüber Ausgleichskasse, Pensionskasse, Unfallversicherung. Wird bei Abführung mit Bank ausgeglichen.'],
  ['Spesen', 'Auslagenersatz für betriebliche Auslagen des Arbeitnehmers. Kein Lohnbestandteil → keine SV-Abgaben, kein Lohnausweis-Eintrag (bei effektiven Spesen).'],
  ['VKB (Verwaltungskostenbeitrag)', 'Beitrag des AG an die Ausgleichskasse für Verwaltungskosten. Max. 3 % der AHV/IV/EO-Beiträge (≈ 0,318 % der Bruttolohnsumme).'],
  ['Lohnausweis', 'Jährliches Dokument für die Steuererklärung des Arbeitnehmers: Bruttolohn, alle Abzüge, Naturalleistungen, Privatanteil Fahrzeug, Spesenpauschalen.'],
])

// ─── Core Points (min 10) ───────────────────────────────────────────────────

await replacePoints(ch, [
  'Brutto → Netto: AN-Abzüge = AHV/IV/EO (5,3 %) + ALV (1,1 %) + BVG (variabel) + NBU + ggf. Quellensteuer',
  'AG-Zusatzkosten: AHV/IV/EO (5,3 %) + ALV (1,1 %) + BVG (mind. = AN-Anteil) + BU (100 % AG) + VKB',
  'Lohnaufwand (Konto) = Bruttolohn wirtschaftlich: Nettolohn + AN-Abzüge in einem Buchungsschritt',
  'Sozialversicherungsaufwand (Konto) = AG-Anteil: separater Aufwand, erhöht Personalkosten über Bruttolohn hinaus',
  'Schritt 1 — Lohn erfassen: Lohnaufwand (Brutto) / Lohnverbindlichkeiten (Netto) + Verbindlichkeiten SV (AN-Abzüge)',
  'Schritt 2 — AG-Anteil erfassen: Sozialversicherungsaufwand / Verbindlichkeiten SV (AG-Anteil)',
  'Schritt 3 — Nettolohn auszahlen: Lohnverbindlichkeiten / Bank',
  'Schritt 4 — SV abführen: Verbindlichkeiten SV (AN + AG) / Bank',
  'Quellensteuer: Lohnverbindlichkeiten / Quellensteuerverbindlichkeiten → Quellensteuerverbindlichkeiten / Bank',
  'Spesen: Spesenaufwand / Bank — keine SV-Pflicht, kein Lohnbestandteil, kein Lohnausweis-Eintrag (effektiv)',
  'Lohnvorschuss: Lohnvorschuss / Bank (Vorauszahlung) — bei Monatsende nur Restbetrag des Nettolohns auszahlen',
  'Naturallohn (Kost & Logis): Teilabgeltung in Sachleistungen — separat vom Nettolohn abgegrenzt',
  'Warenbezüge zu Vorzugspreisen: geldwerter Vorteil gilt als Lohn → SV-pflichtig; Buchung Lohnaufwand / Warenertrag',
  'Personalaufwand gesamt = Lohnaufwand (Bruttolohn) + Sozialversicherungsaufwand (AG-Anteile)',
])

// ─── Quiz (min 8 questions) ─────────────────────────────────────────────────

await replaceQuiz(ch, [
  {
    q: 'Wie hoch ist der Arbeitnehmer-Anteil an AHV/IV/EO in Prozent des Bruttolohns?',
    opts: [
      ['5,3 %', true],
      ['10,6 %', false],
      ['1,1 %', false],
      ['6,4 %', false],
    ],
    exp: 'Der Gesamtsatz AHV/IV/EO beträgt 10,6 %. Er wird hälftig geteilt: je 5,3 % für Arbeitnehmer und Arbeitgeber.',
    diff: 'easy',
  },
  {
    q: 'Wie hoch ist der ALV-Beitragssatz des Arbeitnehmers?',
    opts: [
      ['1,1 %', true],
      ['2,2 %', false],
      ['0,5 %', false],
      ['5,3 %', false],
    ],
    exp: 'Der ALV-Gesamtsatz beträgt 2,2 %, aufgeteilt in je 1,1 % für Arbeitnehmer und Arbeitgeber (bis max. CHF 148 200 Jahreslohn).',
    diff: 'easy',
  },
  {
    q: 'Wer trägt die Prämie für den Nichtberufsunfall (NBU)?',
    opts: [
      ['100 % der Arbeitnehmer', true],
      ['100 % der Arbeitgeber', false],
      ['50 % AN, 50 % AG', false],
      ['Der Staat übernimmt die Prämie', false],
    ],
    exp: 'NBU (Freizeitunfälle) = 100 % Arbeitnehmer. BU (Berufsunfall/Wegunfall) = 100 % Arbeitgeber.',
    diff: 'easy',
  },
  {
    q: 'Wer trägt die Prämie für den Berufsunfall (BU)?',
    opts: [
      ['100 % der Arbeitgeber', true],
      ['100 % der Arbeitnehmer', false],
      ['50 % AN, 50 % AG', false],
      ['Freiwillig je nach Arbeitsvertrag', false],
    ],
    exp: 'BU (Unfälle bei der Arbeit und Wegunfälle) = 100 % Arbeitgeber. Im Gegensatz dazu: NBU (Freizeitunfälle) = 100 % Arbeitnehmer.',
    diff: 'easy',
  },
  {
    q: 'Bruttolohn CHF 6 000, Abzüge total CHF 640 (AN-Anteil). Wie lautet Buchungsschritt 1 (Lohn erfassen)?',
    opts: [
      ['Lohnaufwand 6 000 / Lohnverbindlichkeiten 5 360 + Verbindlichkeiten SV 640', true],
      ['Lohnaufwand 5 360 / Bank 5 360', false],
      ['Verbindlichkeiten SV 640 / Lohnaufwand 640', false],
      ['Bank 6 000 / Lohnaufwand 6 000', false],
    ],
    exp: 'Schritt 1 erfasst den Bruttolohn als Aufwand (6 000), den Nettolohn (6 000 − 640 = 5 360) als Verbindlichkeit gegenüber AN und die Abzüge (640) als Verbindlichkeit gegenüber SV-Trägern.',
    diff: 'medium',
  },
  {
    q: 'Welcher Buchungssatz gilt für den Arbeitgeberanteil an den Sozialversicherungen?',
    opts: [
      ['Sozialversicherungsaufwand / Verbindlichkeiten Sozialversicherungen', true],
      ['Lohnaufwand / Verbindlichkeiten Sozialversicherungen', false],
      ['Verbindlichkeiten Sozialversicherungen / Bank', false],
      ['Lohnaufwand / Bank', false],
    ],
    exp: 'Der AG-Anteil ist ein separater Aufwand und erhöht die Personalkosten über den Bruttolohn hinaus. Buchung: Sozialversicherungsaufwand / Verbindlichkeiten SV. Die Zahlung (Schritt 4) lautet dann: Verbindlichkeiten SV / Bank.',
    diff: 'medium',
  },
  {
    q: 'Für welche Personen gilt die Quellensteuer?',
    opts: [
      ['Ausländer ohne Niederlassungsbewilligung (Ausweis B, L, G) und Grenzgänger', true],
      ['Alle Arbeitnehmer in der Schweiz', false],
      ['Nur Personen mit einem Jahreseinkommen über CHF 120 000', false],
      ['Nur Teilzeitarbeitende', false],
    ],
    exp: 'Quellensteuer gilt für Ausländer ohne C-Ausweis (Niederlassungsbewilligung). Sie ersetzt die normale Einkommenssteuer — der AG zieht sie direkt ab und führt sie an den Kanton ab.',
    diff: 'medium',
  },
  {
    q: 'Was unterscheidet Spesen buchhalterisch vom Lohn?',
    opts: [
      ['Spesen sind Auslagenersatz — kein Lohnbestandteil, keine SV-Abgaben, kein Lohnausweis-Eintrag (effektiv)', true],
      ['Spesen sind höher besteuert als der reguläre Lohn', false],
      ['Spesen gelten als Gewinnanteil des Arbeitnehmers', false],
      ['Spesen müssen immer auf dem Lohnausweis erscheinen', false],
    ],
    exp: 'Spesen ersetzen dem Arbeitnehmer seine betrieblichen Auslagen. Sie sind kein Lohnbestandteil → keine AHV/ALV/BVG-Abgaben. Effektive Spesen erscheinen nicht auf dem Lohnausweis; Pauschalspesen hingegen müssen deklariert werden.',
    diff: 'easy',
  },
  {
    q: 'Ein Mitarbeiter erhält einen Lohnvorschuss von CHF 1 500. Wie wird diese Vorauszahlung gebucht?',
    opts: [
      ['Lohnvorschuss / Bank 1 500', true],
      ['Lohnaufwand / Bank 1 500', false],
      ['Bank / Lohnaufwand 1 500', false],
      ['Lohnverbindlichkeiten / Bank 1 500', false],
    ],
    exp: 'Ein Lohnvorschuss wird als Aktivposten (Lohnvorschuss / Bank) gebucht. Bei der Lohnabrechnung am Monatsende wird dann nur der Restbetrag des Nettolohns ausgezahlt und der Vorschuss aufgelöst.',
    diff: 'medium',
  },
  {
    q: 'Wie hoch ist der gemeinsame Beitragssatz AN + AG für AHV/IV/EO zusammen?',
    opts: [
      ['10,6 %', true],
      ['5,3 %', false],
      ['12,8 %', false],
      ['6,4 %', false],
    ],
    exp: 'AHV/IV/EO: Gesamtsatz 10,6 % (je 5,3 % AN und AG). ALV kommt noch dazu: je 1,1 % AN und AG = 2,2 %. Staatliche Vorsorge total: 12,8 % (je 6,4 %).',
    diff: 'medium',
  },
  {
    q: 'Was sind die Lohnzusatzkosten des Arbeitgebers (neben dem Bruttolohn)?',
    opts: [
      ['AG-Anteile AHV/IV/EO + ALV + BVG (mind. = AN) + BU + VKB', true],
      ['Nur der NBU-Anteil', false],
      ['Nur der BVG-Anteil', false],
      ['Nichts — der Bruttolohn deckt alle Kosten', false],
    ],
    exp: 'Lohnzusatzkosten = AG-Anteile: AHV/IV/EO (5,3 %), ALV (1,1 %), BVG (mind. = AN-Anteil), BU (100 % AG, branchenabhängig), VKB (max. 3 % der AHV/IV/EO-Beiträge). Sie erhöhen den Personalaufwand über den Bruttolohn hinaus.',
    diff: 'medium',
  },
])

console.log('Kapitel 6: Löhne und Gehälter erfolgreich upserted.')
await client.end()
