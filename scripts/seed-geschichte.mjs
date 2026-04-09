import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

// ─── helpers ────────────────────────────────────────────────────────────────

async function insertTopic(slug, title, description, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'Landmark','amber','abschluss','geschichte',$5,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title,
       description=EXCLUDED.description,
       "order"=EXCLUDED."order",
       "updatedAt"=NOW()`,
    [topicId, slug, title, description, order]
  )
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
       "contentStatus"=EXCLUDED."contentStatus",
       "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary]
  )
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function addGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1]
    )
}

async function addTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1]
    )
}

async function addPoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1]
    )
}

async function addQuiz(chId, questions) {
  const qRows = await client.query(`SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (const row of qRows.rows)
    await client.query(`DELETE FROM "QuizOption" WHERE "questionId"=$1`, [row.id])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])

  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff || 'medium', i + 1]
    )
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j + 1]
      )
  }
}

// ════════════════════════════════════════════════════════════════════════════
// THEMA: Ukraine-Konflikt
// ════════════════════════════════════════════════════════════════════════════

const tId = await insertTopic(
  'ukraine-konflikt',
  'Ukraine-Konflikt',
  'Von der Unabhängigkeit 1991 über das Budapester Memorandum bis zum Krieg — Hintergründe, Abkommen und Eskalation.',
  10
)

const ch1 = await insertChapter(
  tId,
  'ukraine-konflikt-hintergruende',
  'Hintergründe & Eskalation',
  'Unabhängigkeit, Budapester Memorandum, NATO-Osterweiterung, Euromaidan und Minsker Abkommen',
  1,
  `## 1. Unabhängigkeit der Ukraine (1991)

Nach dem gescheiterten Putschversuch gegen Gorbatschow erklärte die Ukraine am **24. August 1991** ihre Unabhängigkeit. Am **1. Dezember 1991** bestätigte ein Referendum mit über 90 % Zustimmung diesen Schritt.

Trotz grossem Industriepotenzial (zweitgrösste Industrie der UdSSR) und fruchtbaren Böden ("Brotkorb" der UdSSR) geriet das Land ab 1993 in Hyperinflation und Rezession. Die alte Elite (Nomenklatura) blieb an der Macht und bereicherte sich durch Privatisierungen — es entstanden die **Oligarchen**. Dieser Prozess wurde als "Wildwest-Kapitalismus" bezeichnet.

## 2. Budapester Memorandum (1994)

Die Ukraine besass nach 1991 das **drittgrösste Atomwaffenarsenal der Welt** (~1'800 strategische + 2'500 taktische Sprengköpfe). Am **5. Dezember 1994** unterzeichneten Ukraine, Russland, USA und Grossbritannien das Memorandum.

Die Ukraine verzichtete vollständig auf Atomwaffen und trat dem Atomwaffensperrvertrag bei. Im Gegenzug versprachen die Unterzeichner:
• Achtung der ukrainischen Grenzen
• Verzicht auf militärische Gewalt und wirtschaftlichen Druck
• Einschaltung des UN-Sicherheitsrats im Konfliktfall

**Kritik:** Das Memorandum enthielt keine explizite militärische Beistandsgarantie — dies gilt heute als Sicherheitslücke.

## 3. NATO und Osterweiterung

Die NATO wurde am **4. April 1949** gegründet (heute 32 Staaten). Kern ist die **Beistandsklausel (Artikel 5)**: Ein Angriff auf ein Mitglied gilt als Angriff auf alle.

**Russlands Vorwurf:** Westliche Politiker hätten 1990 versprochen, die NATO nicht nach Osten auszudehnen ("not one inch" — US-Aussenminister Baker). **Westliche Position:** Es gab nie eine schriftliche Zusage; jeder souveräne Staat darf seine Bündnisse selbst wählen.

Ein offener Brief an Präsident Clinton (1997) von US-Experten warnte, die Osterweiterung gefährde die Stabilität Europas und stärke die nicht-demokratische Opposition in Russland.

## 4. Euromaidan, Krim-Annexion und Donbas (2013/14)

**Euromaidan (2013/14):** Massenproteste in Kiew, nachdem Präsident Janukowitsch das EU-Assoziierungsabkommen unter russischem Druck ablehnte. Nach seiner Flucht (Februar 2014) übernahm die Opposition die Macht.

**Krim-Annexion (2014):** Russland besetzte die Halbinsel mit Soldaten ohne Hoheitsabzeichen ("grüne Männchen") und gliederte sie nach einem völkerrechtlich nicht anerkannten Referendum ein. Putin bezeichnete dies als "Wiedervereinigung".

**Krieg im Donbas:** In Donezk und Luhansk begannen Kämpfe zwischen ukrainischen Truppen und von Russland unterstützten Separatisten, die "Volksrepubliken" ausriefen.

## 5. Minsker Abkommen

**Minsk I (September 2014):** 12-Punkte-Plan (Waffenstillstand, Gefangenenaustausch) — scheiterte nach drei Wochen durch Kämpfe am Flughafen Donezk.

**Minsk II (Februar 2015):** Vermittelt durch Merkel (Deutschland) und Hollande (Frankreich), mit Putin und Poroschenko. Wichtige Punkte:
• Sofortiger Waffenstillstand
• Abzug schwerer Waffen (Sicherheitszone 50–140 km)
• OSZE-Überwachung
• Amnestie für Kämpfer
• Verfassungsreform für Sonderstatus des Donbas

**Scheitern:** Beide Seiten warfen sich Verstösse vor. Ukraine wollte zuerst Grenzkontrolle; Russland forderte zuerst Wahlen im Donbas. Am **24. Februar 2022** erklärte Putin das Abkommen für endgültig gescheitert — mit dem Angriffbefehl auf die Ukraine.`
)

await addGoals(ch1, [
  'Du kannst erklären, wie und wann die Ukraine ihre Unabhängigkeit erlangte und welche wirtschaftlichen Folgen das hatte.',
  'Du kennst den Inhalt des Budapester Memorandums (1994) und kannst die kritische Schwachstelle benennen.',
  'Du kannst den Streit um die NATO-Osterweiterung aus russischer und westlicher Sicht erklären.',
  'Du kennst die Ereignisse des Euromaidan (2013/14) und kannst die Krim-Annexion einordnen.',
  'Du kennst die wichtigsten Punkte der Minsker Abkommen (I und II) und kannst deren Scheitern begründen.',
  'Du kannst die verschiedenen Sichtweisen (Russland vs. Westen) zu den zentralen Streitpunkten gegenüberstellen.',
])

await addTerms(ch1, [
  ['Nomenklatura', 'Die sowjetische Elite (Parteikader, Manager), die nach der Unabhängigkeit 1991 an der Macht blieb und sich durch Privatisierungen bereicherte — Ursprung der Oligarchen.'],
  ['Oligarchen', 'Mächtige Wirtschaftselite, die nach 1991 durch den "Wildwest-Kapitalismus" entstand: Ex-Nomenklatura und Unternehmer, die Staatsbetriebe billig erwarben und politischen Einfluss erlangten.'],
  ['Budapester Memorandum (1994)', 'Abkommen vom 5. Dezember 1994 zwischen Ukraine, Russland, USA und Grossbritannien. Die Ukraine gab ihre Atomwaffen ab; die Partner garantierten ihre Grenzen — ohne militärische Beistandspflicht.'],
  ['Artikel 5 (NATO)', 'Die Beistandsklausel der NATO: Ein bewaffneter Angriff auf ein Mitglied wird als Angriff auf alle Mitglieder gewertet. Kern des Verteidigungsbündnisses seit 1949.'],
  ['"Not one inch"', 'Aussage von US-Aussenminister Baker (1990): die NATO werde sich "keinen Zoll" nach Osten ausdehnen. Russland sieht dies als gebrochenes Versprechen; der Westen bestreitet, dass es je eine schriftliche Zusage gab.'],
  ['Euromaidan', 'Massenproteste 2013/14 auf dem Maidan-Platz in Kiew. Auslöser: Janukowitschs Ablehnung des EU-Assoziierungsabkommens. Führte zu seinem Sturz und zur Machtübernahme der Opposition im Februar 2014.'],
  ['"Grüne Männchen"', 'Soldaten ohne Hoheitsabzeichen, die Russland 2014 zur Besetzung der Krim einsetzte. Russland bestritt zunächst deren Herkunft; Putin räumte es später ein.'],
  ['Volksrepubliken Donezk/Luhansk', 'Von Russland unterstützte Separatistengebiete im Donbas, die 2014 ausgerufen wurden. Grundlage für den anhaltenden Konflikt und die Minsker Abkommen.'],
  ['Minsk II (2015)', 'Im Februar 2015 von Merkel und Hollande vermitteltes Abkommen zwischen Ukraine und Russland. 13 Punkte: Waffenstillstand, Truppenabzug, OSZE-Überwachung, Amnestie und Verfassungsreform. Scheiterte endgültig am 24. Februar 2022.'],
  ['OSZE', 'Organisation für Sicherheit und Zusammenarbeit in Europa. Sollte die Umsetzung der Minsker Abkommen überwachen, hatte aber keine Durchsetzungsmacht.'],
])

await addPoints(ch1, [
  'Ukraine wurde am 24. August 1991 unabhängig — per Referendum (1. Dez. 1991) mit >90 % bestätigt.',
  'Das Budapester Memorandum (1994) war kein Vertrag — es enthielt keine Beistandspflicht, nur politische Zusagen.',
  'Die Ukraine gab das drittgrösste Atomwaffenarsenal der Welt freiwillig ab — als Gegenleistung für Sicherheitsgarantien.',
  '"Not one inch": Russland sieht es als gebrochenes Versprechen — der Westen sagt, es gab nie eine schriftliche Zusage.',
  'Artikel 5 der NATO gilt nur für Mitglieder — die Ukraine ist kein NATO-Mitglied.',
  'Euromaidan 2013/14: Auslöser war die Ablehnung des EU-Abkommens unter russischem Druck.',
  'Krim-Annexion 2014: "Grüne Männchen" + nicht anerkanntes Referendum → Putin nennt es "Wiedervereinigung".',
  'Minsk I scheiterte nach 3 Wochen; Minsk II scheiterte am 24. Februar 2022 mit dem russischen Angriff.',
  'Der Kern des Konflikts: Ukraine will Grenzkontrolle zuerst — Russland will Wahlen im Donbas zuerst.',
])

await addQuiz(ch1, [
  {
    q: 'Wann erklärte die Ukraine ihre Unabhängigkeit und wie wurde sie bestätigt?',
    opts: [
      ['Am 24. August 1991 — bestätigt durch ein Referendum am 1. Dezember 1991 mit über 90 % Zustimmung.', true],
      ['Am 1. Januar 1992 — durch den Zerfall der UdSSR automatisch.', false],
      ['Am 19. August 1991 — während des Putschversuchs gegen Gorbatschow.', false],
      ['Am 25. Dezember 1991 — gleichzeitig mit der Auflösung der UdSSR.', false],
    ],
    exp: 'Die Ukraine erklärte am 24. August 1991 die Unabhängigkeit, nachdem der Putsch gegen Gorbatschow gescheitert war. Das Referendum vom 1. Dezember 1991 bestätigte dies mit über 90 % Ja-Stimmen.',
    diff: 'easy',
  },
  {
    q: 'Was war die kritische Schwachstelle des Budapester Memorandums (1994)?',
    opts: [
      ['Es enthielt keine explizite militärische Beistandsgarantie — nur politische Versprechen.', true],
      ['Die Ukraine musste dafür Reparationen an Russland zahlen.', false],
      ['Es wurde nie von allen Parteien ratifiziert.', false],
      ['Es galt nur für die Krim, nicht für das restliche Territorium.', false],
    ],
    exp: 'Das Memorandum verpflichtete die Unterzeichner, die Grenzen zu achten und auf Gewalt zu verzichten — enthielt aber keine Pflicht zur militärischen Unterstützung im Angriffsfall. Das ist die Sicherheitslücke, auf die die Ukraine heute hinweist.',
    diff: 'medium',
  },
  {
    q: 'Was behauptet Russland bezüglich der NATO-Osterweiterung?',
    opts: [
      ['Westliche Politiker hätten 1990 mündlich versprochen, die NATO nicht nach Osten auszudehnen ("not one inch").', true],
      ['Die NATO hätte einen schriftlichen Vertrag unterzeichnet, keine neuen Mitglieder aufzunehmen.', false],
      ['Die UNO hätte die Osterweiterung 1993 offiziell verboten.', false],
      ['Die USA hätten Russland 1997 die NATO-Mitgliedschaft angeboten.', false],
    ],
    exp: 'Russland beruft sich auf mündliche Zusagen von 1990 — besonders auf US-Aussenminister Bakers "not one inch"-Aussage. Der Westen betont, es habe nie eine schriftliche, rechtsverbindliche Zusage gegeben.',
    diff: 'medium',
  },
  {
    q: 'Was löste den Euromaidan 2013/14 aus?',
    opts: [
      ['Präsident Janukowitsch lehnte unter russischem Druck das EU-Assoziierungsabkommen ab.', true],
      ['Russland annektierte die Krim und löste damit Proteste aus.', false],
      ['Die NATO lud die Ukraine offiziell zur Mitgliedschaft ein.', false],
      ['Die Ukraine erklärte den Ausnahmezustand nach einem Terroranschlag.', false],
    ],
    exp: 'Der Auslöser des Euromaidan war Janukowitschs Kurswechsel im November 2013: Unter Druck Russlands lehnte er das Assoziierungsabkommen mit der EU ab — das führte zu Massenprotesten, die schliesslich zu seinem Sturz führten.',
    diff: 'easy',
  },
  {
    q: 'Warum scheiterten die Minsker Abkommen?',
    opts: [
      ['Ukraine und Russland hatten entgegengesetzte Reihenfolge-Forderungen: Ukraine wollte zuerst Grenzkontrolle, Russland zuerst Wahlen im Donbas.', true],
      ['Die USA blockierten die Umsetzung durch Wirtschaftssanktionen.', false],
      ['Die OSZE verweigerte die Entsendung von Beobachtern.', false],
      ['Deutschland und Frankreich zogen sich aus der Vermittlung zurück.', false],
    ],
    exp: 'Der grundlegende Widerspruch: Die Ukraine wollte erst die Kontrolle über ihre Grenze zurück (um Waffenlieferungen zu stoppen), bevor sie politische Reformen umsetzt. Russland bestand auf Wahlen und Sonderstatus im Donbas zuerst. Dieser Deadlock war nicht auflösbar.',
    diff: 'medium',
  },
  {
    q: 'Über welches Atomwaffenarsenal verfügte die Ukraine nach 1991?',
    opts: [
      ['Das drittgrösste der Welt — ca. 1\'800 strategische und 2\'500 taktische Sprengköpfe.', true],
      ['Das grösste der Welt — mehr als Russland und die USA zusammen.', false],
      ['Ein kleines Arsenal von ca. 50 taktischen Waffen.', false],
      ['Gar keines — die Atomwaffen verblieben vollständig bei Russland.', false],
    ],
    exp: 'Nach dem Zerfall der UdSSR befanden sich auf ukrainischem Gebiet etwa 1\'800 strategische und 2\'500 taktische Atomsprengköpfe — das drittgrösste Arsenal der Welt. Alle wurden im Zuge des Budapester Memorandums an Russland übergeben.',
    diff: 'medium',
  },
  {
    q: 'Was ist die Kernaussage von Artikel 5 der NATO?',
    opts: [
      ['Ein Angriff auf ein NATO-Mitglied gilt als Angriff auf alle Mitglieder.', true],
      ['Alle NATO-Mitglieder müssen mindestens 2 % des BIP für Verteidigung ausgeben.', false],
      ['Die NATO darf nur auf dem Territorium ihrer Mitglieder operieren.', false],
      ['Nuklearmächte innerhalb der NATO dürfen keine Atomwaffen einsetzen.', false],
    ],
    exp: 'Artikel 5 ist die Beistandsklausel: Ein Angriff auf ein Mitglied wird als Angriff auf alle gewertet — das ist das Herzstück der NATO-Sicherheitsgarantie. Die Ukraine ist kein NATO-Mitglied und geniesst diesen Schutz nicht.',
    diff: 'easy',
  },
  {
    q: 'Wie rechtfertigte Putin die Annexion der Krim 2014?',
    opts: [
      ['Als "Wiedervereinigung" aufgrund der gemeinsamen Geschichte und des Referendums.', true],
      ['Als Reaktion auf einen NATO-Angriff auf russische Stützpunkte.', false],
      ['Als humanitäre Intervention zum Schutz der russischsprachigen Bevölkerung vor Genozid.', false],
      ['Als Umsetzung des Budapester Memorandums.', false],
    ],
    exp: 'Putin bezeichnete die Annexion als "Wiedervereinigung" — die Krim sei historisch und kulturell russisch. Das Referendum vom März 2014 wurde jedoch von der Ukraine, der EU und den USA als völkerrechtswidrig abgelehnt, da es unter militärischer Besatzung stattfand.',
    diff: 'easy',
  },
])

console.log('✅ Geschichte: Ukraine-Konflikt erfolgreich in DB eingetragen.')
await client.end()
