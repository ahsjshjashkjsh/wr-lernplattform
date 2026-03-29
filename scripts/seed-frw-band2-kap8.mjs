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
     VALUES ($1,$2,$3,$4,'Building2','indigo','abschluss','frw','2',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title,
       description=EXCLUDED.description,
       icon=EXCLUDED.icon,
       color=EXCLUDED.color,
       band=EXCLUDED.band,
       "order"=EXCLUDED."order",
       "updatedAt"=NOW()`,
    [topicId, slug, title, description, order])
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

const tId = await insertTopic(
  'frw-rechtsformen',
  'Rechtsformen',
  'Einzelunternehmung, Aktiengesellschaft: Gründung, Eigenkapital, Gewinnverteilung und Rechtsformvergleich.',
  15
)

const ch = await insertChapter(tId,
  'aktiengesellschaft',
  'Aktiengesellschaft (AG)',
  'Gründung, Gewinnverteilung, Verrechnungssteuer und Kapitalerhöhung',
  2,
  `Die AG ist eine juristische Person mit beschränkter Haftung — die häufigste Rechtsform für grössere Unternehmen in der Schweiz.

AG-GRÜNDUNG — Voraussetzungen und Buchungslogik:
• Mindestkapital: CHF 100 000 (mind. 20 % oder CHF 50 000 bei Gründung einbezahlt oder als Sacheinlage)
• Gründung: öffentliche Beurkundung durch Notar + Handelsregistereintrag (Gesellschaft entsteht erst dann)
• Statuten müssen erstellt werden; Firma muss Zusatz «AG» tragen und schweizweit eindeutig sein
• Organe: Generalversammlung (GV) → Verwaltungsrat (VR) → Geschäftsführung
• Buchungslogik Gründung: Forderungen gegenüber Aktionären / Aktienkapital — dann Bareinlagen und Sacheinlagen gegen Forderungskonto; Schuldenübernahme mindert offenen Anspruch
• Gründungsbuchung (ohne Agio): Bank / Aktienkapital (Nennwert)
• Gründungsbuchung (mit Sacheinlage): Aktiven einzeln / Aktienkapital + Passiven übernommen gegenverbucht

AKTIENKAPITAL UND EIGENKAPITALSTRUKTUR:
• Aktienkapital = Nennwert × Anzahl Aktien (Nennwert mind. CHF 0.01 je Aktie)
• Gesetzliche Kapitalreserve: Agio (Ausgabepreis − Nennwert) — darf nicht ausgeschüttet werden
• Gesetzliche Gewinnreserve: Pflicht — mind. 5 % des Jahresgewinns, bis Reserve 20 % des Aktienkapitals erreicht
• Freiwillige Gewinnreserven: auf Beschluss der GV
• Gewinnvortrag: nicht ausgeschütteter Restgewinn aus Vorjahren
• Bilanzgewinn = Jahresgewinn + Gewinnvortrag Vorjahr

GESETZLICHE UND STATUTARISCHE RESERVEN:
• Gesetzliche Kapitalreserve (OR): entsteht durch Agio — gesetzlich geschützt, nicht ausschüttbar
• Gesetzliche Gewinnreserve (OR): 5 % des Jahresgewinns bis 20 % AK — Puffer gegen Verluste
• Freiwillige Gewinnreserve (statutarisch oder GV-Beschluss): kein gesetzlicher Mindestsatz

GEWINNVERTEILUNGSSCHEMA (Reihenfolge nach OR zwingend):
1. Jahresgewinn auf Gewinnvortrag umbuchen: Jahresgewinn / Gewinnvortrag
2. Gesetzliche Gewinnreserve (Pflicht, mind. 5 % JÜ): Gewinnvortrag / Gesetzliche Gewinnreserve
3. Freiwillige Reserven (falls beschlossen): Gewinnvortrag / Freiwillige Gewinnreserven
4. Dividende beschliessen: Gewinnvortrag / Dividendenverbindlichkeiten (Brutto-Dividende)
5. Verrechnungssteuer 35 % abziehen: Dividendenverbindlichkeiten / VS-Verbindlichkeiten
6. Netto-Dividende 65 % auszahlen: Dividendenverbindlichkeiten / Bank
7. VS an Bund abliefern: VS-Verbindlichkeiten / Bank
Restbetrag = neuer Gewinnvortrag in die nächste Bilanz

DIVIDENDE UND VERRECHNUNGSSTEUER:
• Dividendenbeschluss schafft Schuld der AG gegenüber Aktionären
• VS = 35 % der Brutto-Dividende; Aktionär erhält nur 65 % netto
• Aktionär kann VS beim Steueramt zurückfordern (wenn in CH wohnhaft und Einkommen deklariert)
• VS-Abzug: Dividendenverbindlichkeiten / VS-Verbindlichkeiten
• Netto-Auszahlung: Dividendenverbindlichkeiten / Bank
• VS-Ablieferung: VS-Verbindlichkeiten / Bank

VERLUSTVORTRAG:
• Jahresverlust → auf Verlustvortrag übertragen (Verlustvortrag / Jahresverlust)
• GV beschliesst Deckung: Gewinnvortrag und Gewinnreserven soweit vorhanden auflösen
• Nicht gedeckter Rest = Verlustvortrag → Minus-Passivkonto nach dem Aktienkapital in der Bilanz
• Verlustvortrag zeigt Substanzverlust; reduziert wirtschaftlich das Eigenkapital

KAPITALERHÖHUNG MIT AGIO:
• GV beschliesst (2/3-Mehrheit), neue Aktien auszugeben
• Bestehende Aktionäre haben Bezugsrecht (proportional zur bisherigen Beteiligung)
• Agio = Ausgabepreis − Nennwert → fliesst in Gesetzliche Kapitalreserve (kein Ertrag!)
• Buchung: Bank / Aktienkapital (Nennwert) + Gesetzliche Kapitalreserve (Agio)`
)

await addGoals(ch, [
  'Du kennst die Merkmale der AG und kannst sie von der Einzelunternehmung abgrenzen.',
  'Du kannst die Gründung einer AG vollständig buchen — mit Bareinlagen, Sacheinlagen und Agio.',
  'Du verstehst die Eigenkapitalstruktur der AG und kannst alle Eigenkapitalkonten erklären.',
  'Du kennst den zwingenden Ablauf der Gewinnverwendung nach OR und kannst alle Buchungsschritte durchführen.',
  'Du kannst die Verrechnungssteuer auf Dividenden korrekt berechnen, buchen und abliefern.',
  'Du kannst einen Jahresverlust verbuchen und einen Verlustvortrag korrekt in der Bilanz ausweisen.',
  'Du kannst eine Kapitalerhöhung mit Agio buchen und das Agio korrekt der Gesetzlichen Kapitalreserve zuweisen.',
  'Du kennst die Revisionsvorschriften für AGs und weisst, wann auf eine Revision verzichtet werden kann.',
])

await addTerms(ch, [
  ['Aktiengesellschaft (AG)', 'Juristische Person mit beschränkter Haftung. Kapital in Aktien aufgeteilt. Mindestkapital CHF 100 000. Eigentümer und Unternehmen sind rechtlich getrennt.'],
  ['Aktienkapital', 'Statutarisch und handelsregisterlich festgelegtes Grundkapital. Nennwert × Anzahl Aktien. Passivkonto (Eigenkapital). Darf nicht unter Mindestbetrag sinken.'],
  ['Aktie', 'Bruchteil des Aktienkapitals. Nennwert mind. CHF 0.01. Gibt Inhabern Vermögensrechte (Dividende, Bezugsrecht) und Mitgliedschaftsrechte (Stimmrecht, Auskunftsrecht).'],
  ['Agio (Emissionsagio)', 'Differenz zwischen Ausgabepreis und Nennwert einer Aktie. Fliesst in die Gesetzliche Kapitalreserve — ist kein Ertrag.'],
  ['Gesetzliche Kapitalreserve', 'Entsteht durch Agio bei Aktienausgabe. Darf nicht ausgeschüttet werden (OR-Schutz für Gläubiger). Kein Periodengewinn.'],
  ['Gesetzliche Gewinnreserve', 'Pflichtreserve: mind. 5 % des Jahresgewinns, bis die Reserve 20 % des Aktienkapitals beträgt. Puffer gegen künftige Verluste.'],
  ['Gewinnvortrag', 'Nicht ausgeschütteter Restgewinn aus Vorjahren. Bildet zusammen mit dem Jahresgewinn den Bilanzgewinn. Verrechnungskonto der Gewinnverwendung.'],
  ['Bilanzgewinn', 'Jahresgewinn + Gewinnvortrag Vorjahr. Basis für die Gewinnverwendung durch die GV.'],
  ['Dividende', 'Gewinnausschüttung an Aktionäre. Beschluss durch GV. Unterliegt 35 % Verrechnungssteuer. Schafft Schuld der AG gegenüber Aktionären.'],
  ['Verrechnungssteuer (VS)', '35 % Quellensteuer auf Dividenden und Zinsen. AG zieht ab und liefert an Bund (Steuerverwaltung). Aktionär kann VS zurückfordern, wenn Einkommen deklariert.'],
  ['Verlustvortrag', 'Nicht durch Reserven und Gewinnvorträge gedeckter Jahresverlust. Minus-Passivkonto nach dem Aktienkapital. Zeigt Substanzverlust der AG.'],
  ['Forderungen gegenüber Aktionären', 'Technisches Verrechnungskonto bei der Gründung. Erfasst Kapitalverpflichtung der Aktionäre; wird durch Einlagen und Sacheinlagen ausgeglichen.'],
  ['Sacheinlage', 'Einbringung von Vermögenswerten (statt Barzahlung) zur Erfüllung der Aktienzeichnung. Erfordert besondere Prüfungsbestätigung der Revisionsstelle.'],
  ['Bezugsrecht', 'Recht bestehender Aktionäre, neue Aktien bei Kapitalerhöhung proportional zu ihrer bisherigen Beteiligung zu erwerben. Schutz vor Verwässerung.'],
  ['Kapitalerhöhung', 'Ausgabe neuer Aktien zur Beschaffung von Eigenkapital. Beschluss durch GV (2/3-Mehrheit). Agio fliesst in Gesetzliche Kapitalreserve.'],
])

await addPoints(ch, [
  'AG = juristische Person: beschränkte Haftung, Mindestkapital CHF 100 000 (mind. 20 % oder CHF 50 000 bei Gründung einbezahlt)',
  'Gründung: öffentliche Beurkundung + Handelsregistereintrag; AG entsteht erst mit Handelsregistereintrag',
  'Gründungsbuchung Schritt 1 — Kapitalzeichnung: Forderungen gegenüber Aktionären / Aktienkapital (CHF 200 000)',
  'Gründungsbuchung Schritt 2 — Bareinlage: Bank / Forderungen gegenüber Aktionären',
  'Gründungsbuchung mit Agio: Bank / Aktienkapital (Nennwert) + Gesetzliche Kapitalreserve (Agio)',
  'Bilanzgewinn = Jahresgewinn + Gewinnvortrag Vorjahr — Basis für Gewinnverwendung',
  'Gewinnverwendung Reihenfolge OR: 1. Gesetzliche Gewinnreserve (5 %) 2. Freiwillige Reserven 3. Dividende 4. Gewinnvortrag',
  'Buchung Dividende: Gewinnvortrag / Dividendenverbindlichkeiten (Brutto-Betrag)',
  'Buchung VS-Abzug: Dividendenverbindlichkeiten / VS-Verbindlichkeiten (35 % der Dividende)',
  'Netto-Auszahlung an Aktionär: Dividendenverbindlichkeiten / Bank (65 %); VS-Ablieferung: VS-Verbindlichkeiten / Bank',
  'Verlustvortrag = nicht gedeckter Verlust → Minus-Passivkonto nach Aktienkapital; kann durch spätere Gewinne abgedeckt werden',
  'Kapitalerhöhung: Bank / Aktienkapital (Nennwert) + Gesetzliche Kapitalreserve (Agio) — Agio ist kein Ertrag',
])

await addQuiz(ch, [
  {
    q: 'Was ist das gesetzliche Mindestkapital bei Gründung einer AG in der Schweiz?',
    opts: [
      ['CHF 100 000 (mind. 20 % oder CHF 50 000 bei Gründung einbezahlt)', true],
      ['CHF 20 000', false],
      ['CHF 500 000', false],
      ['Kein Mindestkapital vorgeschrieben', false],
    ],
    exp: 'OR: Aktienkapital mind. CHF 100 000. Bei Gründung müssen mind. 20 % (= CHF 20 000) oder CHF 50 000 einbezahlt sein — je nachdem, welcher Betrag höher ist.',
    diff: 'easy',
  },
  {
    q: 'Welche Buchung erfasst die Kapitalzeichnung bei der AG-Gründung korrekt?',
    opts: [
      ['Forderungen gegenüber Aktionären / Aktienkapital', true],
      ['Bank / Aktienkapital', false],
      ['Aktienkapital / Bank', false],
      ['Aktienkapital / Forderungen gegenüber Aktionären', false],
    ],
    exp: 'Die Zeichnung der Aktien erzeugt zunächst eine Forderung der AG gegenüber den Aktionären. Erst danach werden Einlagen gegen dieses Forderungskonto verbucht.',
    diff: 'medium',
  },
  {
    q: 'Wohin fliesst das Agio bei Ausgabe neuer Aktien über dem Nennwert?',
    opts: [
      ['Gesetzliche Kapitalreserve', true],
      ['Jahresgewinn (Ertragskonto)', false],
      ['Gesetzliche Gewinnreserve', false],
      ['Freiwillige Gewinnreserven', false],
    ],
    exp: 'Agio = Ausgabepreis minus Nennwert. Es ist kein Periodenertrag, sondern fliesst in die Gesetzliche Kapitalreserve (OR). Darf nicht ausgeschüttet werden.',
    diff: 'medium',
  },
  {
    q: 'In welcher Reihenfolge wird der Bilanzgewinn nach OR verwendet?',
    opts: [
      ['Gesetzliche Gewinnreserve → Freiwillige Reserven → Dividende → Gewinnvortrag', true],
      ['Dividende → Gewinnvortrag → Reserven', false],
      ['Freiwillige Reserven → Dividende → Gesetzliche Gewinnreserve', false],
      ['Die GV kann die Reihenfolge frei wählen', false],
    ],
    exp: 'OR-Vorschrift: Zuerst gesetzliche Gewinnreserve (5 % Pflicht), dann freiwillige, dann Dividende. Der Rest wird als Gewinnvortrag in die nächste Periode übernommen.',
    diff: 'medium',
  },
  {
    q: 'Jahresgewinn CHF 29 700, Gewinnvortrag Vorjahr CHF 1 600. Wie hoch ist der Bilanzgewinn?',
    opts: [
      ['CHF 31 300', true],
      ['CHF 29 700', false],
      ['CHF 28 100', false],
      ['CHF 1 600', false],
    ],
    exp: 'Bilanzgewinn = Jahresgewinn + Gewinnvortrag Vorjahr = 29 700 + 1 600 = CHF 31 300.',
    diff: 'easy',
  },
  {
    q: 'Die GV beschliesst eine Dividende von CHF 18 000. Welcher Betrag wird netto an die Aktionäre ausbezahlt?',
    opts: [
      ['CHF 11 700 (65 %)', true],
      ['CHF 18 000 (brutto)', false],
      ['CHF 6 300 (35 %)', false],
      ['CHF 9 000 (50 %)', false],
    ],
    exp: 'VS = 35 % × 18 000 = CHF 6 300. Netto an Aktionäre: 18 000 − 6 300 = CHF 11 700 (65 %). Die CHF 6 300 werden als VS-Verbindlichkeit an den Bund abgeliefert.',
    diff: 'easy',
  },
  {
    q: 'Wie lautet die Buchung, wenn die Verrechnungssteuer auf die Dividende abgezogen wird?',
    opts: [
      ['Dividendenverbindlichkeiten / VS-Verbindlichkeiten', true],
      ['VS-Verbindlichkeiten / Dividendenverbindlichkeiten', false],
      ['Dividendenverbindlichkeiten / Bank', false],
      ['Gewinnvortrag / VS-Verbindlichkeiten', false],
    ],
    exp: 'VS-Abzug: Dividendenverbindlichkeiten sinken (Soll), VS-Verbindlichkeiten entstehen (Haben). Danach separat: VS-Verbindlichkeiten / Bank (Ablieferung an Bund).',
    diff: 'medium',
  },
  {
    q: 'Die AG weist einen Reinverlust von CHF 53 900 aus. Nach Verwendung von Gewinnvortrag CHF 10 200 und gesetzlicher Gewinnreserve CHF 12 100 verbleiben noch CHF 31 600 ungedeckt. Wie wird dieser Restbetrag ausgewiesen?',
    opts: [
      ['Als Verlustvortrag — Minus-Passivkonto nach dem Aktienkapital', true],
      ['Als Aktivkonto auf der Aktivseite der Bilanz', false],
      ['Er wird sofort mit dem Aktienkapital verrechnet', false],
      ['Er wird als Aufwand in der nächsten Erfolgsrechnung verbucht', false],
    ],
    exp: 'Nicht gedeckte Verluste erscheinen als Verlustvortrag — ein Minus-Passivkonto nach dem Aktienkapital. Er zeigt den Substanzverlust und kann durch spätere Gewinne gedeckt werden.',
    diff: 'hard',
  },
  {
    q: 'Eine AG erhöht ihr Aktienkapital. 10 000 neue Aktien (Nennwert CHF 100, Ausgabepreis CHF 170) werden ausgegeben. Wie lautet die Buchung?',
    opts: [
      ['Bank 1 700 000 / Aktienkapital 1 000 000 + Gesetzliche Kapitalreserve 700 000', true],
      ['Bank 1 700 000 / Aktienkapital 1 700 000', false],
      ['Bank 1 000 000 / Aktienkapital 1 000 000 und Bank 700 000 / Kapitalertrag 700 000', false],
      ['Bank 1 700 000 / Gesetzliche Kapitalreserve 1 700 000', false],
    ],
    exp: 'Nennwert 10 000 × 100 = CHF 1 000 000 → Aktienkapital. Agio 10 000 × 70 = CHF 700 000 → Gesetzliche Kapitalreserve. Total Zufluss: CHF 1 700 000.',
    diff: 'hard',
  },
  {
    q: 'Wer entscheidet über die Gewinnverwendung einer AG?',
    opts: [
      ['Die Generalversammlung auf Antrag des Verwaltungsrats', true],
      ['Der Verwaltungsrat allein', false],
      ['Die Geschäftsführung (CEO)', false],
      ['Das Handelsregisteramt', false],
    ],
    exp: 'Die GV ist das oberste Organ und beschliesst die Gewinnverwendung. Der VR stellt den Antrag. Die Verbuchung erfolgt erst nach GV-Beschluss.',
    diff: 'easy',
  },
])

console.log('✅ Kapitel 8: Aktiengesellschaft (AG) & Gewinnverteilung erfolgreich erstellt.')
await client.end()
