import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

// ══════════════════════════════════════════════════
// TOPIC
// ══════════════════════════════════════════════════
async function upsertTopic() {
  const topicId = id()
  await client.query(`
    INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,NOW(),NOW())
    ON CONFLICT (slug) DO UPDATE SET
      title=EXCLUDED.title,
      description=EXCLUDED.description,
      icon=EXCLUDED.icon,
      color=EXCLUDED.color,
      "examType"=EXCLUDED."examType",
      category=EXCLUDED.category,
      "order"=EXCLUDED."order",
      published=EXCLUDED.published,
      "updatedAt"=NOW()
  `, [
    topicId,
    'wr-vertragslehre',
    'Allgemeine Vertragslehre und Kaufvertrag',
    'Das Obligationenrecht regelt die Entstehung, den Abschluss und die Erfüllung von Verträgen sowie die besonderen Regeln des Kaufvertrags. Ergänzend behandelt dieses Thema die betriebliche Organisation mit Aufbau- und Ablauforganisation.',
    'FileText',
    'orange',
    'both',
    'recht',
    53,
  ])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, ['wr-vertragslehre'])
  return r.rows[0].id
}

// ══════════════════════════════════════════════════
// CHAPTER
// ══════════════════════════════════════════════════
async function upsertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(`
    INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
    ON CONFLICT ("topicId",slug) DO UPDATE SET
      title=EXCLUDED.title,
      subtitle=EXCLUDED.subtitle,
      "order"=EXCLUDED."order",
      "contentStatus"=EXCLUDED."contentStatus",
      summary=EXCLUDED.summary,
      "updatedAt"=NOW()
  `, [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function addGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1])
}

async function addTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1])
}

async function addPoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1])
}

async function addQuiz(chId, questions) {
  // Delete options first (FK dependency), then questions
  const existingQs = await client.query(`SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (const row of existingQs.rows)
    await client.query(`DELETE FROM "QuizOption" WHERE "questionId"=$1`, [row.id])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])

  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(`
      INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
      VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)
    `, [qId, chId, q.q, q.exp, q.diff || 'medium', i + 1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(`INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j + 1])
  }
}

// ══════════════════════════════════════════════════
// SEED
// ══════════════════════════════════════════════════
const tId = await upsertTopic()

// ── KAPITEL 1: Obligation, Vertragsabschluss und Vertragserfüllung ──
const ch1 = await upsertChapter(
  tId,
  'obligation-vertragsabschluss',
  'Obligation, Vertragsabschluss und Vertragserfüllung',
  'Entstehungsgründe, Gültigkeitsvoraussetzungen und Erfüllungssystematik',
  1,
  `Die Obligation ist das zentrale Rechtsverhältnis des OR: Der Gläubiger kann eine Leistung verlangen, der Schuldner schuldet sie. Obligationen entstehen auf drei Arten: durch Vertrag, durch unerlaubte Handlung oder durch ungerechtfertigte Bereicherung.

ENTSTEHUNGSGRÜNDE — ÜBERBLICK:
• Vertrag: übereinstimmende gegenseitige Willensäusserung über die wesentlichen Vertragspunkte.
• Unerlaubte Handlung (Art. 41 OR): Schaden + Widerrechtlichkeit + Kausalzusammenhang + Verschulden.
• Ungerechtfertigte Bereicherung: Vermögensvorteil ohne gültigen Rechtsgrund → Rückerstattungspflicht.

VERTRAGSABSCHLUSS — VORAUSSETZUNGEN:
1. Vertragsfähigkeit (Handlungsfähigkeit = Urteilsfähigkeit + Volljährigkeit).
2. Antrag (Offerte) und übereinstimmende Annahme.
3. Einigung über wesentliche Vertragspunkte (z. B. Kaufgegenstand + Kaufpreis).
4. Einhaltung allfälliger Formvorschriften.
5. Kein Nichtigkeits- oder Anfechtungsgrund.

FORM:
• Grundsatz der Formfreiheit — Verträge können grundsätzlich mündlich oder konkludent geschlossen werden.
• Ausnahmen: einfache Schriftlichkeit, qualifizierte Schriftlichkeit, öffentliche Beurkundung (z. B. Grundstückkauf).
• Nichtigkeit: von Anfang an keine Rechtswirkung (z. B. Widerrechtlichkeit, Unsittlichkeit).
• Anfechtbarkeit: Vertrag zunächst gültig, aber aufhebbar wegen Willensmängeln (Irrtum, Täuschung, Drohung, Übervorteilung).

VERTRAGSERFÜLLUNG — SYSTEMATIK:
• Was? Erfüllungsgegenstand (Gattungs- oder Speziesschuld).
• Wo? Erfüllungsort: Geldschuld = Bringschuld; Speziesschuld = Holschuld; übrige = Schickschuld.
• Wann? Fälligkeit: ohne Vereinbarung sofort fällig.

VERJÄHRUNG UND SICHERUNG:
• Verjährung beseitigt nicht die Forderung, aber die zwangsweise Durchsetzbarkeit.
• Realsicherheiten: Kaution, Faustpfand, Grundpfand, Eigentumsvorbehalt.
• Personalsicherheiten: Bürgschaft, Konventionalstrafe, Zession.`
)

await addGoals(ch1, [
  'Du kannst die drei Entstehungsgründe einer Obligation nennen und mit je einem Beispiel erläutern.',
  'Du kennst die Voraussetzungen eines gültigen Vertragsabschlusses (Vertragsfähigkeit, Einigung, Form).',
  'Du kannst Nichtigkeit und Anfechtbarkeit voneinander abgrenzen und typische Gründe nennen.',
  'Du kennst die Regeln zum Erfüllungsort für Geldschuld, Speziesschuld und andere Verbindlichkeiten.',
  'Du weisst, was Verjährung bedeutet und welche Wirkung sie auf eine Forderung hat.',
  'Du kannst Real- und Personalsicherheiten unterscheiden und je zwei Beispiele nennen.',
])

await addTerms(ch1, [
  ['Obligation', 'Schuldverhältnis, in dem der Gläubiger eine bestimmte Leistung vom Schuldner verlangen kann. Grundbegriff des Obligationenrechts (OR).'],
  ['Handlungsfähigkeit', 'Fähigkeit, durch eigenes Handeln rechtlich wirksam Rechte und Pflichten zu begründen. Setzt Urteilsfähigkeit und Volljährigkeit voraus.'],
  ['Formfreiheit', 'Grundsatz, dass Verträge in beliebiger Form geschlossen werden können. Wird durch gesetzliche Formvorschriften begrenzt (z. B. öffentliche Beurkundung beim Grundstückkauf).'],
  ['Nichtigkeit', 'Von Anfang an fehlende Rechtswirksamkeit eines Vertrags (z. B. wegen Widerrechtlichkeit oder Unsittlichkeit). Bedarf keiner Anfechtung.'],
  ['Anfechtbarkeit', 'Möglichkeit, einen zunächst gültigen Vertrag wegen Willensmängeln (Irrtum, Täuschung, Drohung, Übervorteilung) aufzuheben.'],
  ['Unerlaubte Handlung', 'Ausservertraglicher Haftungstatbestand (Art. 41 OR). Voraussetzungen: Schaden, Widerrechtlichkeit, Kausalzusammenhang, Verschulden.'],
  ['Ungerechtfertigte Bereicherung', 'Vermögensvorteil ohne gültigen Rechtsgrund. Begründet Rückerstattungspflicht. Dritter Entstehungsgrund von Obligationen.'],
  ['Erfüllungsort', 'Ort, an dem die Leistung zu erbringen ist. Geldschuld = Bringschuld (beim Gläubiger); Speziesschuld = Holschuld (beim Schuldner); übrige = Schickschuld (Sitz Schuldner).'],
  ['Verjährung', 'Zeitliche Begrenzung der gerichtlichen Durchsetzbarkeit einer Forderung. Die Forderung erlischt nicht, wird aber einredeweise undurchsetzbar.'],
  ['Eigentumsvorbehalt', 'Realsicherheit: Der Verkäufer behält das Eigentum an der Ware bis zur vollständigen Bezahlung des Kaufpreises.'],
])

await addPoints(ch1, [
  'Obligationen entstehen durch Vertrag, unerlaubte Handlung oder ungerechtfertigte Bereicherung.',
  'Vertrag = übereinstimmende Willensäusserung über wesentliche Punkte (Einigung auf Antrag und Annahme).',
  'Vertragsfähigkeit setzt Urteilsfähigkeit und Volljährigkeit voraus (Handlungsfähigkeit).',
  'Grundsatz der Formfreiheit — Ausnahmen: einfache/qualifizierte Schriftlichkeit, öffentliche Beurkundung.',
  'Nichtige Verträge wirken von Anfang an nicht; anfechtbare Verträge erst nach Geltendmachung.',
  'Haftung aus unerlaubter Handlung: Schaden + Widerrechtlichkeit + Kausalzusammenhang + Verschulden.',
  'Geldschuld = Bringschuld; Speziesschuld = Holschuld; übrige Schulden = Schickschuld.',
  'Verjährung beseitigt nicht die Forderung, sondern nur die zwangsweise Durchsetzbarkeit.',
  'Realsicherheiten (Faustpfand, Eigentumsvorbehalt) sichern dingliche Werte; Personalsicherheiten (Bürgschaft, Zession) haften mit Vermögen einer weiteren Person.',
])

await addQuiz(ch1, [
  {
    q: 'Auf welche drei Arten können Obligationen entstehen?',
    opts: [
      ['Vertrag, unerlaubte Handlung, ungerechtfertigte Bereicherung', true],
      ['Vertrag, Delikt, Schenkung', false],
      ['Kaufvertrag, Mietvertrag, Arbeitsvertrag', false],
      ['Antrag, Annahme, Formvorschrift', false],
    ],
    exp: 'Das OR nennt drei Entstehungsgründe: Vertrag (häufigster Grund), unerlaubte Handlung (Art. 41 OR) und ungerechtfertigte Bereicherung.',
    diff: 'easy',
  },
  {
    q: 'Was ist Voraussetzung für die Handlungsfähigkeit einer Person?',
    opts: [
      ['Urteilsfähigkeit und Volljährigkeit', true],
      ['Volljährigkeit und Schweizer Bürgerrecht', false],
      ['Urteilsfähigkeit allein genügt', false],
      ['Eintrag im Handelsregister', false],
    ],
    exp: 'Handlungsfähigkeit setzt zwei kumulative Bedingungen voraus: Urteilsfähigkeit (Einsichts- und Steuerungsfähigkeit) und Volljährigkeit.',
    diff: 'easy',
  },
  {
    q: 'Welche Wirkung hat die Verjährung auf eine Forderung?',
    opts: [
      ['Die Forderung bleibt bestehen, ist aber einredeweise nicht mehr zwangsweise durchsetzbar', true],
      ['Die Forderung erlischt automatisch', false],
      ['Der Schuldner wird von der Leistung befreit, ohne etwas tun zu müssen', false],
      ['Die Forderung wird zur ungerechtfertigten Bereicherung', false],
    ],
    exp: 'Verjährung lässt die Forderung als solche bestehen. Erst wenn der Schuldner die Einrede der Verjährung erhebt, kann er die Leistung verweigern.',
    diff: 'medium',
  },
  {
    q: 'Welche Aussage zur Nichtigkeit ist korrekt?',
    opts: [
      ['Nichtige Verträge entfalten von Anfang an keine Rechtswirkung und müssen nicht angefochten werden', true],
      ['Nichtige Verträge sind zunächst gültig und werden erst durch Anfechtung unwirksam', false],
      ['Nichtigkeit und Anfechtbarkeit sind synonyme Begriffe', false],
      ['Nichtige Verträge können durch Erfüllung geheilt werden', false],
    ],
    exp: 'Nichtigkeit wirkt ex tunc (von Anfang an). Im Gegensatz dazu sind anfechtbare Verträge zunächst gültig und werden erst auf Antrag aufgehoben.',
    diff: 'medium',
  },
  {
    q: 'Wo muss eine Geldschuld erfüllt werden?',
    opts: [
      ['Am Wohn- oder Geschäftssitz des Gläubigers (Bringschuld)', true],
      ['Am Wohn- oder Geschäftssitz des Schuldners (Holschuld)', false],
      ['Am Ort, wo sich das Geld bei Vertragsschluss befand', false],
      ['Am vereinbarten Gerichtsstand', false],
    ],
    exp: 'Geldschulden sind Bringschulden: Der Schuldner muss die Zahlung zum Gläubiger bringen. Speziesschulden hingegen sind Holschulden.',
    diff: 'medium',
  },
  {
    q: 'Was ist ein typisches Beispiel für eine Personalsicherheit?',
    opts: [
      ['Bürgschaft', true],
      ['Faustpfand', false],
      ['Eigentumsvorbehalt', false],
      ['Grundpfand', false],
    ],
    exp: 'Bürgschaft und Zession sind Personalsicherheiten (eine weitere Person haftet mit ihrem Vermögen). Faustpfand, Grundpfand und Eigentumsvorbehalt sind Realsicherheiten.',
    diff: 'easy',
  },
  {
    q: 'Was sind die Voraussetzungen der Haftung aus unerlaubter Handlung (Art. 41 OR)?',
    opts: [
      ['Schaden, Widerrechtlichkeit, Kausalzusammenhang, Verschulden', true],
      ['Schaden, Vertrag, Mahnung, Verzug', false],
      ['Widerrechtlichkeit, Absicht, Bereicherung', false],
      ['Kausalzusammenhang und Schaden genügen immer', false],
    ],
    exp: 'Art. 41 OR verlangt kumulativ: Schaden, Widerrechtlichkeit, adäquaten Kausalzusammenhang und Verschulden (Absicht oder Fahrlässigkeit).',
    diff: 'medium',
  },
  {
    q: 'Ein Vertrag wird wegen wesentlichem Irrtum angefochten. Welche Aussage ist richtig?',
    opts: [
      ['Der Vertrag war zunächst gültig und wird durch Anfechtung aufgehoben', true],
      ['Der Vertrag war von Anfang an nichtig', false],
      ['Irrtum führt immer zur Nichtigkeit, nie zur Anfechtbarkeit', false],
      ['Nur absichtliche Täuschung begründet Anfechtbarkeit', false],
    ],
    exp: 'Wesentlicher Irrtum ist ein Willensmangel und führt zur Anfechtbarkeit, nicht zur Nichtigkeit. Der Vertrag ist zunächst gültig und wird erst nach Geltendmachung aufgehoben.',
    diff: 'hard',
  },
])

// ── KAPITEL 2: Kaufvertrag, Gewährleistung und betriebliche Organisation ──
const ch2 = await upsertChapter(
  tId,
  'kaufvertrag-gewaehrleistung-organisation',
  'Kaufvertrag, Gewährleistung und betriebliche Organisation',
  'Pflichten, Leistungsstörungen, Konsumentenschutz und Unternehmensorganisation',
  2,
  `Der Kaufvertrag ist ein zweiseitig verpflichtender Vertrag: Der Verkäufer schuldet Übergabe und Eigentumsverschaffung; der Käufer schuldet die Kaufpreiszahlung. Das Kaufrecht unterscheidet insbesondere Fahrniskauf und Grundstückkauf.

EIGENTUMSÜBERTRAGUNG UND NUTZEN/GEFAHR:
• Fahrniskauf: Eigentum geht mit Übergabe über (nicht bereits mit Vertragsabschluss).
• Nutzen und Gefahr: Übergang bestimmt, ab wann der Käufer das Risiko des zufälligen Untergangs trägt.
• Unterscheidung: Speziesschuld (individuell) vs. Gattungsschuld (austauschbar); Platzkauf vs. Distanzkauf.

VERTRAGSVERLETZUNGEN DES VERKÄUFERS:
1. Nichterfüllung / Unmöglichkeit
2. Lieferverzug: Leistung möglich, aber nicht rechtzeitig → Nachfrist → Wahlrechte
3. Mangelhafte Lieferung (Sachmangel) → nach Prüfung und rechtzeitiger Mängelrüge:
   - Wandelung: Rückabwicklung des Kaufvertrags
   - Minderung: Herabsetzung des Kaufpreises
   - Ersatzlieferung: nur bei Gattungssachen

VERTRAGSVERLETZUNGEN DES KÄUFERS:
• Annahmeverzug: Käufer nimmt die Ware nicht rechtzeitig an.
• Zahlungsverzug: Käufer zahlt den fälligen Kaufpreis nicht rechtzeitig.

KONSUMENTENSCHUTZ:
• Konsumkreditgesetz: Schriftform, Widerrufsrecht, Kreditfähigkeitsprüfung.
• Haustürgeschäfte und ähnliche Verträge: Widerrufsrecht.
• Ansichtssendungen: Unterschied zwischen verlangter und unverlangter Sendung.

BETRIEBLICHE ORGANISATION:
• Aufbauorganisation: Wer macht was? — Stellen, Hierarchien, AKV-Prinzip, dargestellt im Organigramm.
• Ablauforganisation: Was wird in welcher Reihenfolge gemacht? — Prozesse, Zeiten, Kapazitäten, Schnittstellen.
• AKV-Prinzip: Jede Stelle braucht Aufgaben, Kompetenzen und Verantwortung.
• Gliederungsformen: Funktional (nach Tätigkeiten) vs. Divisional (nach Produkten/Märkten/Regionen).
• Spezialformen: Linien-, Stablinien-, Matrix- und Profitcenter-Organisation.`
)

await addGoals(ch2, [
  'Du kannst die Hauptpflichten von Käufer und Verkäufer aus einem Kaufvertrag nennen.',
  'Du kennst den Unterschied zwischen Eigentumsübergang und Übergang von Nutzen und Gefahr beim Fahrniskauf.',
  'Du kannst die drei kaufrechtlichen Gewährleistungsrechte (Wandelung, Minderung, Ersatzlieferung) erläutern und abgrenzen.',
  'Du weisst, welche Vertragsverletzungen dem Käufer angelastet werden können (Annahmeverzug, Zahlungsverzug).',
  'Du kennst die wesentlichen Konsumentenschutzmechanismen beim Kauf.',
  'Du kannst Aufbau- und Ablauforganisation unterscheiden und das AKV-Prinzip erklären.',
])

await addTerms(ch2, [
  ['Fahrniskauf', 'Kauf beweglicher Sachen. Eigentumsübertragung erfolgt grundsätzlich mit der Übergabe der Sache, nicht bereits beim Vertragsabschluss.'],
  ['Grundstückkauf', 'Kauf eines Grundstücks. Erfordert öffentliche Beurkundung und Eintrag ins Grundbuch. Formstrengster Kaufvertrag.'],
  ['Sachmangel', 'Die gelieferte Sache weist nicht die vereinbarten oder vorausgesetzten Eigenschaften auf. Auslöser der kaufrechtlichen Gewährleistung.'],
  ['Mängelrüge', 'Sofortige Anzeige des Mangels nach Prüfung der Ware. Obliegenheit des Käufers — bei Unterlassung droht Verlust der Gewährleistungsrechte.'],
  ['Wandelung', 'Rückgängigmachung des Kaufvertrags wegen erheblichem Mangel: Käufer gibt Ware zurück und erhält den Kaufpreis zurück.'],
  ['Minderung', 'Herabsetzung des Kaufpreises entsprechend dem Minderwert der mangelhaften Sache. Der Vertrag bleibt bestehen.'],
  ['Ersatzlieferung', 'Lieferung einer mängelfreien Sache anstelle der mangelhaften. Nur bei Gattungssachen möglich, nicht bei Speziessachen.'],
  ['AKV-Prinzip', 'Grundsatz der Aufbauorganisation: Jede Stelle braucht Aufgaben (was zu tun ist), Kompetenzen (was entschieden werden darf) und Verantwortung (wofür einzustehen ist).'],
  ['Aufbauorganisation', 'Ordnung der Stellen, Hierarchien und Zuständigkeiten im Unternehmen. Beantwortet: Wer macht was? Dargestellt im Organigramm.'],
  ['Ablauforganisation', 'Ordnung der Arbeitsprozesse nach zeitlicher und sachlicher Reihenfolge. Beantwortet: Was wird in welcher Reihenfolge gemacht?'],
])

await addPoints(ch2, [
  'Kaufvertrag: Verkäufer schuldet Übergabe + Eigentumsverschaffung; Käufer schuldet Kaufpreiszahlung.',
  'Fahrniskauf: Eigentum geht mit Übergabe über — nicht schon mit dem Vertragsabschluss.',
  'Nutzen und Gefahr sind vom Eigentumsübergang zu unterscheiden — Übergang richtet sich nach Kauf- und Schuldart.',
  'Gewährleistung setzt voraus: Sachmangel + rechtzeitige Prüfung + sofortige Mängelrüge.',
  'Gewährleistungsrechte des Käufers: Wandelung, Minderung, Ersatzlieferung (bei Gattungssachen).',
  'Lieferverzug: Verkäufer liefert nicht rechtzeitig → Nachfrist → Rücktritt oder Schadenersatz möglich.',
  'Käuferverletzungen: Annahmeverzug (Ware nicht angenommen) und Zahlungsverzug (Preis nicht bezahlt).',
  'Konsumentenschutz: Widerrufsrecht bei Haustürgeschäften; Konsumkreditgesetz schreibt Schriftform und Kreditfähigkeitsprüfung vor.',
  'Aufbauorganisation regelt statische Strukturen; Ablauforganisation regelt dynamische Prozesse.',
  'AKV-Prinzip: Aufgaben, Kompetenzen und Verantwortung jeder Stelle müssen deckungsgleich sein.',
])

await addQuiz(ch2, [
  {
    q: 'Wann geht beim Fahrniskauf das Eigentum auf den Käufer über?',
    opts: [
      ['Mit der Übergabe der Sache', true],
      ['Bereits mit dem Vertragsabschluss', false],
      ['Mit der Bezahlung des Kaufpreises', false],
      ['Mit dem Gerichtsurteil', false],
    ],
    exp: 'Beim Fahrniskauf geht das Eigentum grundsätzlich mit der Übergabe der Sache über, nicht schon mit dem Vertragsabschluss.',
    diff: 'easy',
  },
  {
    q: 'Was versteht man unter Wandelung?',
    opts: [
      ['Rückgängigmachung des Kaufvertrags — Käufer gibt Ware zurück und erhält den Kaufpreis zurück', true],
      ['Herabsetzung des Kaufpreises bei mangelhafter Ware', false],
      ['Lieferung einer mängelfreien Ersatzsache', false],
      ['Verlängerung der Lieferfrist durch den Verkäufer', false],
    ],
    exp: 'Wandelung = vollständige Rückabwicklung. Gegensatz: Minderung (Vertrag bleibt bestehen, Preis sinkt) und Ersatzlieferung (neue Sache statt mangelhafter).',
    diff: 'easy',
  },
  {
    q: 'Wann ist Ersatzlieferung als Gewährleistungsrecht möglich?',
    opts: [
      ['Nur bei Gattungssachen, nicht bei Speziessachen', true],
      ['Immer, wenn eine Mängelrüge eingereicht wurde', false],
      ['Nur bei Grundstückkäufen', false],
      ['Nur wenn der Verkäufer zustimmt', false],
    ],
    exp: 'Ersatzlieferung setzt austauschbare Sachen voraus (Gattungssachen). Bei individuell bestimmten Speziessachen gibt es keine gleichartige Ersatzsache.',
    diff: 'medium',
  },
  {
    q: 'Was ist die Obliegenheit des Käufers nach Erhalt einer mangelhaften Lieferung?',
    opts: [
      ['Rasche Prüfung der Ware und sofortige Mängelrüge beim Verkäufer', true],
      ['Klage beim Richter ohne vorherige Rüge', false],
      ['Rücksendung der Ware ohne Mitteilung', false],
      ['Abwarten bis zur Verjährung', false],
    ],
    exp: 'Der Käufer muss die Ware rasch prüfen und Mängel sofort rügen. Unterlässt er die rechtzeitige Rüge, verliert er seine Gewährleistungsrechte.',
    diff: 'medium',
  },
  {
    q: 'Was beschreibt das AKV-Prinzip in der Aufbauorganisation?',
    opts: [
      ['Jede Stelle braucht Aufgaben, Kompetenzen und Verantwortung', true],
      ['Ablauf, Koordination und Verwaltung als Organisationsziele', false],
      ['Antrag, Kündigung und Vertrag im Arbeitsrecht', false],
      ['Aufwand, Kosten und Verlust in der Buchhaltung', false],
    ],
    exp: 'AKV steht für Aufgaben (was zu tun ist), Kompetenzen (was entschieden werden darf) und Verantwortung (wofür einzustehen ist). Fehlende Deckungsgleichheit führt zu Konflikten.',
    diff: 'easy',
  },
  {
    q: 'Was unterscheidet Aufbauorganisation von Ablauforganisation?',
    opts: [
      ['Aufbau regelt Strukturen und Zuständigkeiten (Wer macht was?); Ablauf regelt Prozesse und Reihenfolgen (Was wird wann gemacht?)', true],
      ['Aufbau regelt Prozesse; Ablauf regelt Stellen und Hierarchien', false],
      ['Beide beschreiben dasselbe — nur unterschiedliche Begriffe', false],
      ['Aufbau betrifft nur grosse Unternehmen; Ablauf nur kleine', false],
    ],
    exp: 'Aufbauorganisation = statische Struktur (Organigramm, AKV). Ablauforganisation = dynamische Prozessgestaltung (Reihenfolge, Zeiten, Kapazitäten).',
    diff: 'medium',
  },
  {
    q: 'Welche Konsumentenschutzmassnahme gilt bei Haustürgeschäften?',
    opts: [
      ['Widerrufsrecht: Der Konsument kann den Vertrag innert Frist widerrufen', true],
      ['Der Vertrag ist von Anfang an nichtig', false],
      ['Der Kaufpreis wird automatisch halbiert', false],
      ['Nur schriftliche Verträge sind gültig, mündliche immer nichtig', false],
    ],
    exp: 'Bei Haustürgeschäften und ähnlichen Verträgen (z. B. am Telefon oder ausserhalb von Geschäftsräumen) hat der Konsument ein gesetzliches Widerrufsrecht.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Unterschied zwischen funktionaler und divisionaler Gliederung?',
    opts: [
      ['Funktional = nach Tätigkeiten (z. B. Einkauf, Produktion); Divisional = nach Produkten, Märkten oder Regionen', true],
      ['Funktional = nach Grösse; Divisional = nach Hierarchie', false],
      ['Beide sind identisch und werden synonym verwendet', false],
      ['Divisional = nach Tätigkeiten; Funktional = nach Produkten', false],
    ],
    exp: 'Funktionale Gliederung bündelt gleichartige Tätigkeiten (Spezialisierung nach Verrichtung). Divisionale Gliederung gliedert nach Objekten (Produkte, Sparten, Regionen) mit eigener Ergebnisverantwortung.',
    diff: 'medium',
  },
  {
    q: 'Ein Käufer zahlt den fälligen Kaufpreis nicht rechtzeitig. Welche Vertragsverletzung liegt vor?',
    opts: [
      ['Zahlungsverzug des Käufers', true],
      ['Annahmeverzug des Käufers', false],
      ['Lieferverzug des Verkäufers', false],
      ['Sachgewährleistungsfall', false],
    ],
    exp: 'Zahlungsverzug = Käufer zahlt den fälligen Kaufpreis nicht rechtzeitig. Annahmeverzug = Käufer nimmt die Ware nicht rechtzeitig an (anderer Tatbestand).',
    diff: 'easy',
  },
])

console.log('✅ WR Vertragslehre: 2 Kapitel erfolgreich erstellt.')
await client.end()
