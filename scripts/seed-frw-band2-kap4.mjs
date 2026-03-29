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
       summary=EXCLUDED.summary,
       "contentStatus"='complete',
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
  // Delete options before questions (FK constraint)
  await client.query(
    `DELETE FROM "QuizOption" WHERE "questionId" IN (SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1)`,
    [chId])
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

// ─── Topic ────────────────────────────────────────────────────────────────────

const tId = await insertTopic(
  'frw-abschreibungen',
  'Abschreibungen',
  'Lineare und degressive Abschreibung, direkte und indirekte Methode, Anschaffungswert, Verkauf von Anlagegütern.',
  'abschluss',
  12
)

// ─── Chapter ──────────────────────────────────────────────────────────────────

const ch = await insertChapter(
  tId,
  'abschreibungen',
  'Abschreibungen',
  'Linear, degressiv, direkt und indirekt — Sachanlagen korrekt bewerten, abschreiben und verkaufen',
  1,
  `ABSCHREIBUNG — Buchhalterische Erfassung der Wertverminderung einer Sachanlage über ihre Nutzungsdauer; notwendig für korrekte Bilanzwerte und periodengerechten Erfolgsausweis.

URSACHEN DES WERTVERLUSTS — Sachanlagen verlieren durch Nutzung (Abnützung), technologische Entwicklung (Überalterung) und Zeitablauf an Wert. Ohne Abschreibung wären Bilanzwerte und Gewinn zu hoch.

ANSCHAFFUNGSWERT — Ausgangsbasis jeder Abschreibung: Kaufpreis brutto − Rabatt/Skonto − abziehbare Vorsteuer + direkt zurechenbare Nebenkosten (Transport, Installation) = Anschaffungswert. Aktivierungsgrenze in der Praxis: CHF 1 000.

LINEARE VS. DEGRESSIVE ABSCHREIBUNG — Linear: (Anschaffungswert / Nutzungsdauer) = gleicher CHF-Betrag pro Jahr; Buchwert sinkt gleichmässig bis 0. Degressiv: aktueller Buchwert × Prozentsatz = sinkende Beträge; steuerliche Maximalsätze CH: Mobiliar 25 %, Fahrzeuge 40 %; linear halb so viel.

DIREKTE VS. INDIREKTE BUCHUNGSMETHODE — Direkt: Abschreibungen / Anlagekonto → Bilanz zeigt Nettobuchwert, Anschaffungswert nicht mehr sichtbar. Indirekt: Abschreibungen / WB Anlage → Anlagekonto bleibt bei Anschaffungswert; WB-Konto sammelt kumulierte Abschreibungen; Bilanz zeigt Anschaffungswert, WB und Buchwert → transparenter.

VERKAUF VON ANLAGEGÜTERN — Direkt: Kasse / Anlagekonto (Erlös) + A.o. Aufwand / Anlagekonto (Verlust) bzw. Anlagekonto / A.o. Ertrag (Gewinn). Indirekt: zuerst WB auflösen (WB Anlage / Anlagekonto), dann wie direkt. Erlös > Buchwert = ausserordentlicher Ertrag; Erlös < Buchwert = ausserordentlicher Aufwand.

SELBSTFINANZIERUNGSEFFEKT — Abschreibungen sind Aufwand ohne Auszahlung (nicht liquiditätswirksam). Sie mindern den Gewinn, ohne Geld abfliessen zu lassen → liquide Mittel bleiben im Unternehmen für Ersatzinvestitionen (Förderung der Selbstfinanzierung).`
)

// ─── Learning Goals ───────────────────────────────────────────────────────────

await addGoals(ch, [
  'Du kannst den Anschaffungswert einer Sachanlage korrekt berechnen (Kaufpreis, Rabatt, Vorsteuer, Nebenkosten).',
  'Du kannst den jährlichen Abschreibungsbetrag sowohl linear als auch degressiv berechnen.',
  'Du kennst den Unterschied zwischen direkter und indirekter Abschreibungsmethode und kannst beide buchen.',
  'Du kannst einen vollständigen Abschreibungsplan über mehrere Jahre erstellen.',
  'Du kannst den Verkauf eines Anlageguts mit Gewinn oder Verlust buchhalterisch erfassen — bei direkter und indirekter Methode.',
  'Du kennst die drei Hauptzwecke von Abschreibungen: korrekte Bilanzwerte, periodengerechter Aufwand, Förderung der Selbstfinanzierung.',
  'Du kennst die steuerlichen Maximalsätze für degressive Abschreibungen in der Schweiz (Mobiliar 25 %, Fahrzeuge 40 %).',
  'Du kannst erklären, warum Abschreibungen nicht liquiditätswirksam sind und wie das die Innenfinanzierung fördert.',
])

// ─── Key Terms ────────────────────────────────────────────────────────────────

await addTerms(ch, [
  ['Abschreibung', 'Buchhalterische Erfassung der Wertverminderung einer Sachanlage über ihre Nutzungsdauer. Vermindert Bilanzwert und belastet als Aufwand die Erfolgsrechnung.'],
  ['Sachanlage', 'Materieller Vermögenswert, der dem Unternehmen längerfristig dient (z. B. Fahrzeuge, Mobiliar, Büroeinrichtung). Objekt der Abschreibung.'],
  ['Anschaffungswert (AW)', 'Aktivierter Wert einer Anlage: Kaufpreis brutto − Rabatt/Skonto − abziehbare Vorsteuer + direkt zurechenbare Nebenkosten (Transport, Installation). Ausgangsbasis für die Abschreibung.'],
  ['Buchwert (BW)', 'Wert einer Anlage in der Buchhaltung nach Abzug aller bisherigen Abschreibungen vom Anschaffungswert. Relevanter Vergleichswert beim Verkauf.'],
  ['Nutzungsdauer', 'Geplante Zeitspanne, über die eine Anlage wirtschaftlich genutzt wird. Bestimmt bei linearer Abschreibung den jährlichen Betrag: je länger, desto geringer die Jahresabschreibung.'],
  ['Lineare Abschreibung', 'Gleichbleibender CHF-Betrag pro Jahr. Formel: Anschaffungswert / Nutzungsdauer. Buchwert sinkt gleichmässig und erreicht am Ende der Nutzungsdauer CHF 0.'],
  ['Degressive Abschreibung', 'Konstanter Prozentsatz auf den jeweils aktuellen Buchwert → sinkende absolute Beträge. Bildet stärkere Wertverluste in frühen Jahren ab; führt ohne Schlusskorrektur nicht automatisch zu Buchwert 0.'],
  ['Direkte Abschreibungsmethode', 'Buchungssatz: Abschreibungen / Anlagekonto. Das Anlagekonto zeigt danach direkt den Buchwert; ursprüngliche Anschaffungskosten sind nicht mehr sichtbar.'],
  ['Indirekte Abschreibungsmethode', 'Buchungssatz: Abschreibungen / WB Anlage. Anlagekonto bleibt bei Anschaffungswert; kumulierte Abschreibungen werden auf Wertberichtigungskonto gesammelt. Transparenter, da AW und WB getrennt sichtbar.'],
  ['Wertberichtigungskonto (WB)', 'Separates Minus-Aktivkonto bei indirekter Abschreibung. Sammelt kumulierte Abschreibungen; wird in der Bilanz vom Anlagekonto abgezogen und beim Verkauf der Anlage aufgelöst.'],
  ['Verkaufsgewinn (A.o. Ertrag)', 'Entsteht, wenn der Verkaufserlös über dem Buchwert liegt. Wird als ausserordentlicher Ertrag verbucht: Anlagekonto / A.o. Ertrag.'],
  ['Verkaufsverlust (A.o. Aufwand)', 'Entsteht, wenn der Verkaufserlös unter dem Buchwert liegt. Wird als ausserordentlicher Aufwand verbucht: A.o. Aufwand / Anlagekonto.'],
  ['Nicht liquiditätswirksam', 'Abschreibungen sind Aufwand ohne Geldabfluss. Der Geldabfluss fand bereits beim Kauf statt; die Abschreibung verteilt diesen Ressourcenverbrauch auf die Nutzungsjahre.'],
  ['Selbstfinanzierung', 'Finanzierung künftiger Investitionen aus im Unternehmen zurückbehaltenen Mitteln. Abschreibungen fördern sie, weil sie Gewinn mindern ohne Liquidität zu verbrauchen.'],
  ['Pro-Memoria-Posten', 'Symbolischer Buchwert von CHF 1 für vollständig abgeschriebene, aber noch vorhandene Anlagen. Hält die Anlage in der Bilanz sichtbar.'],
])

// ─── Core Points ──────────────────────────────────────────────────────────────

await addPoints(ch, [
  'Anschaffungswert = Kaufpreis − Rabatt/Skonto − Vorsteuer + Transport/Installation. Nur dieser Betrag wird aktiviert und abgeschrieben.',
  'Lineare Abschreibung: AW / Nutzungsdauer = gleicher CHF-Betrag pro Jahr. Prozentsatz = 100 % / Nutzungsdauer.',
  'Degressive Abschreibung: aktueller Buchwert × Prozentsatz = sinkende Beträge. Am Ende der Nutzungsdauer verbleibenden Restwert vollständig abschreiben.',
  'Steuerliche Maximalsätze (degressiv): Mobiliar/Büroeinrichtung 25 %, Fahrzeuge 40 %. Bei linearer Methode diese Sätze halbieren.',
  'Direkte Buchung: Abschreibungen / Anlagekonto → Anlagekonto sinkt direkt; Anschaffungswert in Bilanz nicht mehr ersichtlich.',
  'Indirekte Buchung: Abschreibungen / WB Anlage → Anlagekonto bleibt bei AW; Bilanz zeigt AW, kumulierte WB und Buchwert getrennt → informativer.',
  'Abschreibungen sind Aufwand ohne Auszahlung: nicht liquiditätswirksam. Fördern Selbstfinanzierung, weil liquide Mittel im Unternehmen bleiben.',
  'Verkauf direkt: Kasse / Anlagekonto (Erlös), dann A.o. Aufwand / Anlagekonto (Verlust) oder Anlagekonto / A.o. Ertrag (Gewinn).',
  'Verkauf indirekt: Schritt 1 WB auflösen (WB Anlage / Anlagekonto), Schritt 2 Erlös buchen, Schritt 3 Gewinn oder Verlust buchen.',
  'Verkaufserlös > Buchwert → ausserordentlicher Ertrag. Verkaufserlös < Buchwert → ausserordentlicher Aufwand.',
  'Abschreibungen erfüllen drei Kernfunktionen: (1) korrekte Bilanzwerte, (2) periodengerechter Aufwandausweis, (3) Förderung der Selbstfinanzierung.',
  'Aktivierungsgrenze in der Praxis: Anschaffungen unter CHF 1 000 werden oft direkt als Aufwand erfasst, auch wenn sie länger nutzbar wären.',
])

// ─── Quiz ─────────────────────────────────────────────────────────────────────

await addQuiz(ch, [
  {
    q: 'Büroeinrichtung: Rechnung CHF 25 800, Rabatt 10 %, Transportkosten CHF 780. Keine Vorsteuer abzugsfähig. Anschaffungswert?',
    opts: [
      ['CHF 24 000', true],
      ['CHF 25 800', false],
      ['CHF 23 220', false],
      ['CHF 26 580', false],
    ],
    exp: '25 800 − 2 580 (10 % Rabatt) + 780 (Transport) = CHF 24 000. Rabatt und Skonto reduzieren den AW; Nebenkosten erhöhen ihn.',
    diff: 'easy',
  },
  {
    q: 'Maschine AW CHF 90 000, Nutzungsdauer 6 Jahre, Restwert CHF 0. Jährliche lineare Abschreibung?',
    opts: [
      ['CHF 15 000', true],
      ['CHF 14 000', false],
      ['CHF 18 000', false],
      ['CHF 22 500', false],
    ],
    exp: '90 000 / 6 = CHF 15 000 pro Jahr. Bei linearer Methode wird AW gleichmässig über die Nutzungsdauer verteilt.',
    diff: 'easy',
  },
  {
    q: 'Fahrzeug BW CHF 48 000, Abschreibungssatz 40 % degressiv. Abschreibung in diesem Jahr?',
    opts: [
      ['CHF 19 200', true],
      ['CHF 32 000', false],
      ['CHF 40 000', false],
      ['CHF 12 800', false],
    ],
    exp: 'Degressiv = Prozentsatz auf aktuellen Buchwert. 48 000 × 40 % = CHF 19 200. Der Betrag sinkt jedes Jahr, weil der Buchwert sinkt.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Hauptvorteil der indirekten gegenüber der direkten Abschreibungsmethode?',
    opts: [
      ['Anschaffungswert und kumulierte Abschreibungen bleiben in der Bilanz separat sichtbar', true],
      ['Die Buchungen sind einfacher', false],
      ['Es entsteht eine tiefere Steuerbelastung', false],
      ['Der Buchwert ist stets höher', false],
    ],
    exp: 'Bei indirekter Methode bleibt das Anlagekonto beim AW; das WB-Konto zeigt kumulierte Abschreibungen. Bilanz weist AW, WB und Buchwert getrennt aus → transparenter.',
    diff: 'medium',
  },
  {
    q: 'Mobiliar wird indirekt abgeschrieben. Buchungssatz für Jahresabschreibung CHF 3 000?',
    opts: [
      ['Abschreibungen 3 000 / WB Mobiliar 3 000', true],
      ['Abschreibungen 3 000 / Mobiliar 3 000', false],
      ['WB Mobiliar 3 000 / Abschreibungen 3 000', false],
      ['Mobiliar 3 000 / Abschreibungen 3 000', false],
    ],
    exp: 'Indirekte Methode: Aufwandskonto Abschreibungen im Soll, Wertberichtigungskonto im Haben. Das Mobiliar-Konto bleibt bei AW.',
    diff: 'easy',
  },
  {
    q: 'Anlage BW CHF 15 000, Barverkauf für CHF 8 800 (direkte Abschreibung). Buchungen?',
    opts: [
      ['Kasse 8 800 / Mobiliar 8 800; A.o. Aufwand 6 200 / Mobiliar 6 200', true],
      ['Kasse 8 800 / Mobiliar 15 000; Anlagegewinn 6 200 (Ertrag)', false],
      ['Bank 15 000 / Mobiliar 15 000; A.o. Aufwand 6 200 / Bank 6 200', false],
      ['Kasse 8 800 / Mobiliar 8 800 (keine weitere Buchung nötig)', false],
    ],
    exp: 'Erlös < BW → Verlust CHF 6 200. Schritt 1: Kasse / Mobiliar 8 800. Schritt 2: A.o. Aufwand / Mobiliar 6 200. Mobiliar-Konto ist damit auf 0.',
    diff: 'hard',
  },
  {
    q: 'Büroeinrichtung AW CHF 24 000, kumulierte WB CHF 15 000, BW CHF 9 000. Barverkauf CHF 10 500 (indirekte Methode). Welche Buchungen sind richtig?',
    opts: [
      ['Kasse 10 500 / Mobiliar 10 500; WB Mobiliar 15 000 / Mobiliar 15 000; Mobiliar 1 500 / A.o. Ertrag 1 500', true],
      ['Kasse 10 500 / Mobiliar 9 000; A.o. Ertrag 1 500 / Mobiliar 1 500', false],
      ['WB Mobiliar 15 000 / Mobiliar 15 000; Kasse 10 500 / A.o. Ertrag 10 500', false],
      ['Kasse 10 500 / Mobiliar 24 000; A.o. Aufwand 13 500 / Mobiliar 13 500', false],
    ],
    exp: 'Indirekte Methode Verkauf: (1) Erlös: Kasse 10 500 / Mobiliar 10 500. (2) WB auflösen: WB Mobiliar 15 000 / Mobiliar 15 000. (3) Gewinn: Mobiliar 1 500 / A.o. Ertrag 1 500. Erlös 10 500 > BW 9 000 → Gewinn 1 500.',
    diff: 'hard',
  },
  {
    q: 'Welcher steuerliche Maximalsatz gilt in der Schweiz für Fahrzeuge bei degressiver Abschreibung?',
    opts: [
      ['40 %', true],
      ['25 %', false],
      ['20 %', false],
      ['8 %', false],
    ],
    exp: 'Fahrzeuge: max. 40 % degressiv laut steuerlichen Obergrenzen. Mobiliar/Büroeinrichtung: max. 25 %. Bei linearer Methode jeweils die Hälfte.',
    diff: 'easy',
  },
  {
    q: 'Warum sind Abschreibungen «nicht liquiditätswirksam»?',
    opts: [
      ['Bei der Abschreibungsbuchung fliesst kein Geld ab — der Geldabfluss fand bereits beim Kauf statt', true],
      ['Abschreibungen erhöhen den Kassenbestand', false],
      ['Abschreibungen werden bar an den Staat gezahlt', false],
      ['Der Gewinn steigt durch Abschreibungen', false],
    ],
    exp: 'Der Geldabfluss passierte beim Anschaffungskauf. Die Abschreibungsbuchung ist nur ein Umschichten des bereits verbrauchten Ressourcenwerts auf Perioden — ohne Zahlungsvorgang.',
    diff: 'medium',
  },
  {
    q: 'Welche drei Kernfunktionen erfüllen Abschreibungen?',
    opts: [
      ['Korrekte Bilanzwerte, periodengerechter Aufwand, Förderung der Selbstfinanzierung', true],
      ['Steueroptimierung, Gewinnmaximierung, Liquiditätssteigerung', false],
      ['Buchwerterhöhung, Fremdfinanzierung, Risikoabsicherung', false],
      ['Umsatzsteigerung, Renditeverbesserung, Tilgungsplanung', false],
    ],
    exp: 'Abschreibungen sorgen für (1) realistische Bilanzwerte, (2) den Aufwand periodengerecht in die Erfolgsrechnung einzubeziehen, und (3) die Selbstfinanzierung zu fördern, da liquide Mittel im Unternehmen bleiben.',
    diff: 'medium',
  },
])

console.log('✅ Kapitel 4: Abschreibungen — vollständig aktualisiert.')
await client.end()
