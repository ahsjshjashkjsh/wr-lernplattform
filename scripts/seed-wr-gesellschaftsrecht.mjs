import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

// ── Topic ──────────────────────────────────────────────────────────────────────
async function insertTopic(slug, title, description, examType, category, color, icon, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title=$3, description=$4, icon=$5, color=$6, "examType"=$7,
       category=$8, "order"=$9, "updatedAt"=NOW()`,
    [topicId, slug, title, description, icon, color, examType, category, order]
  )
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

// ── Chapter ────────────────────────────────────────────────────────────────────
async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET
       title=$3, subtitle=$4, "order"=$6, summary=$7, "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary]
  )
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

// ── Helpers ────────────────────────────────────────────────────────────────────
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
  // Delete options first (FK), then questions
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

// ══════════════════════════════════════════════════════════════════════════════
// TOPIC
// ══════════════════════════════════════════════════════════════════════════════
const tId = await insertTopic(
  'wr-gesellschaftsrecht',
  'Gesellschaftsrecht und Handelsregister',
  'Rechtsformen schweizer Unternehmen im Überblick: Firmenrecht, Handelsregister, Vollmachten sowie Personengesellschaften und Kapitalgesellschaften mit ihren Haftungs- und Organisationsregeln.',
  'both',
  'recht',
  'purple',
  'Scale',
  51
)

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 1: Firmenrecht, Handelsregister und Vollmachten
// ══════════════════════════════════════════════════════════════════════════════
const ch1 = await insertChapter(
  tId,
  'firmenrecht-handelsregister-vollmachten',
  'Firmenrecht, Handelsregister und Vollmachten',
  'Unternehmensname, öffentliches Register und Vertretung im Geschäftsverkehr',
  1,
  `Das Firmenrecht, das Handelsregister und die Vollmachten bilden den rechtlichen Rahmen für den Aussenauftritt eines Unternehmens.

FIRMENRECHT — NAME DES UNTERNEHMENS:
• Die Firma ist der rechtlich verwendete Name eines Unternehmens im Handelsregister und im Geschäftsverkehr.
• Grundsätze: Firmenwahrheit (keine irreführenden Angaben), Firmenausschliesslichkeit (keine Verwechslungsgefahr), rechtsformspezifische Bestandteile.
• Arten: Personenfirma (Personenname), Sachfirma (Tätigkeit/Gegenstand), Fantasiefirma (frei gewählt).
• Bei juristischen Personen ist der Rechtsformzusatz (AG, GmbH, KLG) zwingend.
• Einzelunternehmen: Familienname muss erkennbar sein.
• Firmenschutz durch Handelsregistereintrag ist lokal; für weitergehenden Schutz braucht es Markenschutz.

HANDELSREGISTER — PUBLIZITÄT UND RECHTSWIRKUNGEN:
• Öffentliches Verzeichnis mit zentralen Unternehmensdaten (Firma, Rechtsform, Sitz, Zweck, Organe, Kapital).
• Vier Hauptwirkungen: Firmenschutz, konstitutive Wirkung, Publizität, Betreibung auf Konkurs.
• Deklaratorische Wirkung: Eintrag verleiht keine neue Rechtslage, sondern macht bestehende sichtbar.
• Konstitutive Wirkung: Gesellschaft (GmbH, AG, KLG) entsteht rechtlich erst mit dem Eintrag.
• Veröffentlichung im Schweizerischen Handelsamtsblatt (SHAB).

VOLLMACHTEN — VERTRETUNG NACH AUSSEN:
• Prokura: weitreichende kaufmännische Vollmacht; umfasst alle Rechtshandlungen, die der Unternehmenszweck mit sich bringen kann; einige gesetzliche Ausnahmen (z.B. Grundstücksveräusserung ohne besondere Ermächtigung); eintragbar im Handelsregister; Zeichnung mit «ppa.» oder «pp.».
• Handlungsvollmacht: auf gewöhnliche Geschäfte des Unternehmens beschränkt; enger als Prokura.
• Bürgerliche Vollmacht: General-, Spezial- oder Gattungsvollmacht.
• Organschaftliche Vertretung: Organe (VR, Geschäftsführung) handeln kraft Stellung, nicht kraft Ermächtigung.
• Grundsatz Innen- vs. Aussenverhältnis: Interne Beschränkungen schützen gutgläubige Dritte nicht, solange sie nicht publiziert oder gesetzlich vorgesehen sind.`
)

await addGoals(ch1, [
  'Du kennst die drei Firmenarten (Personen-, Sach-, Fantasiefirma) und die gesetzlichen Anforderungen an eine zulässige Firma.',
  'Du kannst die vier Hauptwirkungen des Handelsregisters (Firmenschutz, konstitutive Wirkung, Publizität, Betreibung auf Konkurs) erklären.',
  'Du kennst den Unterschied zwischen konstitutiver und deklaratorischer Wirkung des Handelsregistereintrags.',
  'Du kannst Prokura und Handlungsvollmacht voneinander abgrenzen und deren Umfang beschreiben.',
  'Du verstehst das Prinzip von Innen- und Aussenverhältnis bei Vollmachten und weisst, wann interne Beschränkungen Dritten gegenüber wirksam sind.',
  'Du kannst erklären, warum der handelsrechtliche Firmenschutz nur lokal gilt und welchen Zusatzschutz der Markenschutz bietet.',
])

await addTerms(ch1, [
  ['Firma', 'Rechtlich verwendeter Name eines Unternehmens im Handelsregister und Geschäftsverkehr. Muss den Regeln der Firmenwahrheit und Firmenausschliesslichkeit genügen.'],
  ['Firmenwahrheit', 'Grundsatz, dass die Firma keine unrichtigen oder irreführenden Angaben enthalten darf. Schützt den Rechtsverkehr vor Täuschung.'],
  ['Firmenausschliesslichkeit', 'Verbot, eine bereits eingetragene Firma mit einer identischen oder verwechselbaren neuen Firma zu kollidieren. Schutz vor Verwechslungsgefahr im Handelsregister.'],
  ['Konstitutive Wirkung', 'Der Rechtszustand (z.B. Entstehung einer Gesellschaft) entsteht erst mit dem Handelsregistereintrag. Ohne Eintrag existiert die Gesellschaft in dieser Form nicht.'],
  ['Deklaratorische Wirkung', 'Der Handelsregistereintrag bestätigt eine bereits bestehende Rechtslage, schafft sie aber nicht. Beispiel: Einzelunternehmen existiert bereits vor dem Eintrag.'],
  ['Publizität', 'Rechtliche Bekanntmachung eingetragener Tatsachen (via SHAB). Dritte können sich auf veröffentlichte Angaben verlassen.'],
  ['Prokura', 'Gesetzlich geregelte, weitreichende kaufmännische Vollmacht für alle Rechtshandlungen im Rahmen des Unternehmenszwecks. Eintragbar im Handelsregister; Zeichnung mit «ppa.» Ausnahme: Grundstücksveräusserung ohne besondere Ermächtigung nicht möglich.'],
  ['Handlungsvollmacht', 'Kaufmännische Vollmacht für gewöhnliche Geschäfte des Unternehmens. Enger als die Prokura; keine aussergewöhnlichen Geschäfte, keine Grundstücksgeschäfte, kein Führen von Prozessen.'],
  ['Innenverhältnis / Aussenverhältnis', 'Das Innenverhältnis regelt die Rechte und Pflichten zwischen Vollmachtgeber und Bevollmächtigtem. Das Aussenverhältnis betrifft die Wirkung gegenüber Dritten. Interne Beschränkungen schützen gutgläubige Dritte nicht automatisch.'],
  ['SHAB', 'Schweizerisches Handelsamtsblatt — amtliches Publikationsorgan für Handelsregistereinträge. Veröffentlichung schafft Publizität gegenüber Dritten.'],
])

await addPoints(ch1, [
  'Die Firma muss wahr, nicht täuschend und rechtsformgerecht sein (Firmenwahrheit und Firmenausschliesslichkeit).',
  'Einzelunternehmen: Familienname muss in der Firma erkennbar sein.',
  'Juristische Personen (AG, GmbH): Rechtsformzusatz ist zwingend; Namenswahl sonst frei.',
  'Handelsregistereintrag hat konstitutive Wirkung für AG, GmbH und Kollektivgesellschaft.',
  'Handelsregistereintrag hat deklaratorische Wirkung für das Einzelunternehmen.',
  'Vier Wirkungen des Handelsregisters: Firmenschutz, konstitutive Wirkung, Publizität, Betreibung auf Konkurs.',
  'Prokura ist weiter als Handlungsvollmacht, aber ohne besondere Ermächtigung keine Grundstücksveräusserung.',
  'Interne Beschränkungen wirken nicht gegen gutgläubige Dritte, ausser sie sind publiziert oder gesetzlich vorgesehen.',
  'Firmenschutz durch HR-Eintrag gilt lokal; weitergehender Schutz erfordert Markenschutz.',
])

await addQuiz(ch1, [
  {
    q: 'Eine AG wird ins Handelsregister eingetragen. Welche Wirkung hat dieser Eintrag?',
    opts: [
      ['Konstitutive Wirkung — die AG entsteht rechtlich erst mit dem Eintrag', true],
      ['Deklaratorische Wirkung — die AG existierte schon vorher', false],
      ['Keine rechtliche Wirkung — nur zu Informationszwecken', false],
      ['Deklaratorische Wirkung — der Eintrag bestätigt nur den Verwaltungsrat', false],
    ],
    exp: 'AG und GmbH entstehen rechtlich erst mit dem Handelsregistereintrag (konstitutive Wirkung). Ohne diesen Eintrag gibt es die juristische Person nicht.',
    diff: 'easy',
  },
  {
    q: 'Was darf ein Prokurist NICHT ohne besondere Ermächtigung tun?',
    opts: [
      ['Grundstücke des Unternehmens veräussern oder belasten', true],
      ['Verträge mit Lieferanten abschliessen', false],
      ['Das Unternehmen gegenüber Kunden vertreten', false],
      ['Zahlungen im Namen des Unternehmens leisten', false],
    ],
    exp: 'Die Prokura umfasst alle Rechtshandlungen im Rahmen des Unternehmenszwecks. Ausgenommen sind insbesondere die Veräusserung und Belastung von Grundstücken — dafür braucht es eine besondere Ermächtigung.',
    diff: 'medium',
  },
  {
    q: 'Was ist der Unterschied zwischen Prokura und Handlungsvollmacht?',
    opts: [
      ['Prokura ist umfassender; Handlungsvollmacht ist auf gewöhnliche Geschäfte beschränkt', true],
      ['Handlungsvollmacht ist umfassender; Prokura gilt nur für Grundstücksgeschäfte', false],
      ['Beide sind gleichwertig; der Unterschied liegt nur im Namen', false],
      ['Handlungsvollmacht ist im Handelsregister eintragbar; Prokura nicht', false],
    ],
    exp: 'Die Prokura deckt alle Rechtshandlungen im Rahmen des Unternehmenszwecks ab und ist im HR eintragbar. Die Handlungsvollmacht ist enger und auf gewöhnliche Geschäfte des Unternehmens beschränkt.',
    diff: 'medium',
  },
  {
    q: 'Ein Unternehmensinhaber hat intern festgelegt, dass sein Prokurist keine Verträge über CHF 50 000 abschliessen darf. Der Prokurist schliesst dennoch einen Vertrag über CHF 80 000 ab. Ist dieser Vertrag für den Vertragspartner bindend?',
    opts: [
      ['Ja — interne Beschränkungen schützen gutgläubige Dritte nicht', true],
      ['Nein — der Prokurist hat seine Vollmacht überschritten', false],
      ['Nein — Verträge über CHF 50 000 brauchen immer die Unterschrift des Inhabers', false],
      ['Ja — aber nur wenn der Vertrag im SHAB veröffentlicht wurde', false],
    ],
    exp: 'Das Aussenverhältnis schützt gutgläubige Dritte. Interne Beschränkungen der Prokura sind gegenüber Dritten nicht wirksam, solange sie nicht publiziert oder gesetzlich vorgesehen sind.',
    diff: 'hard',
  },
  {
    q: 'Welche Firma ist für ein Einzelunternehmen zwingend vorgeschrieben?',
    opts: [
      ['Der Familienname des Inhabers muss erkennbar sein', true],
      ['Eine Fantasiefirma ohne Namensnennung', false],
      ['Der Rechtsformzusatz "EU" (Einzelunternehmen)', false],
      ['Freie Namenswahl wie bei der AG', false],
    ],
    exp: 'Beim Einzelunternehmen muss der Familienname des Inhabers in der Firma erkennbar sein. Das ist eine gesetzliche Anforderung des Firmenrechts.',
    diff: 'easy',
  },
  {
    q: 'Was versteht man unter Publizität im Handelsregisterrecht?',
    opts: [
      ['Rechtliche Bekanntmachung eingetragener Tatsachen im SHAB, auf die Dritte sich verlassen können', true],
      ['Das Recht jeder Person, Einsicht in alle Verträge eines Unternehmens zu nehmen', false],
      ['Die Pflicht eines Unternehmens, seine Jahresrechnung zu veröffentlichen', false],
      ['Die inhaltliche Prüfung aller wirtschaftlichen Hintergründe durch das Handelsregister', false],
    ],
    exp: 'Publizität bedeutet, dass rechtlich relevante Tatsachen (z.B. Vertretungsregelungen, Rechtsform) öffentlich bekanntgemacht werden — insbesondere im SHAB. Dritte können und dürfen auf diese Angaben vertrauen.',
    diff: 'medium',
  },
  {
    q: 'Wann wirkt der Handelsregistereintrag DEKLARATORISCH?',
    opts: [
      ['Beim Einzelunternehmen — es existiert bereits vor dem Eintrag', true],
      ['Bei der AG — sie entsteht erst mit dem Eintrag', false],
      ['Bei der GmbH — sie entsteht erst mit dem Eintrag', false],
      ['Bei der Kollektivgesellschaft — sie entsteht erst mit dem Eintrag', false],
    ],
    exp: 'Das Einzelunternehmen entsteht durch die Aufnahme der selbständigen Erwerbstätigkeit — unabhängig vom Handelsregistereintrag. Der Eintrag ist hier deklaratorisch (er bestätigt den bestehenden Zustand). AG, GmbH und KLG entstehen dagegen erst mit dem Eintrag (konstitutiv).',
    diff: 'medium',
  },
  {
    q: 'Welche der folgenden Aussagen zum Firmenschutz durch den Handelsregistereintrag ist korrekt?',
    opts: [
      ['Der Firmenschutz durch den HR-Eintrag ist mindestens lokal gesichert; für umfassenderen Schutz braucht es Markenschutz', true],
      ['Der HR-Eintrag schützt die Firma weltweit vor identischen Bezeichnungen', false],
      ['Markenschutz und Firmenschutz sind identisch und bieten denselben Schutz', false],
      ['Der HR-Eintrag schützt nur den Rechtsformzusatz, nicht den Namenszusatz', false],
    ],
    exp: 'Der handelsrechtliche Firmenschutz durch den HR-Eintrag ist lokal (am Ort des Eintrags). Für einen weitergehenden Schutz — insbesondere schweizweit oder international — ist der Markenschutz das geeignete Instrument.',
    diff: 'medium',
  },
])

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 2: Rechtsformen — Personengesellschaften und Kapitalgesellschaften
// ══════════════════════════════════════════════════════════════════════════════
const ch2 = await insertChapter(
  tId,
  'rechtsformen-personengesellschaften-kapitalgesellschaften',
  'Rechtsformen: Personengesellschaften und Kapitalgesellschaften',
  'Einzelunternehmen, einfache Gesellschaft, Kollektivgesellschaft, GmbH, AG und Genossenschaft',
  2,
  `Die Wahl der Rechtsform ist eine der zentralen wirtschaftlich-strategischen Entscheidungen bei der Unternehmensgründung und -führung.

GRUNDUNTERSCHEIDUNG:
• Einzelunternehmen: eine natürliche Person, keine juristische Person, unbeschränkte Haftung.
• Personengesellschaften: personenbezogen, persönliche Mitwirkung, persönliche Haftung.
• Kapitalgesellschaften: juristische Person, Trennung zwischen Gesellschaft und Beteiligten, Haftungsbeschränkung.
• Genossenschaft: Förderzweck, Mitgliedergleichheit im Stimmrecht.

EINZELUNTERNEHMEN:
• Eine natürliche Person führt allein; keine juristische Person.
• Gründung: formlos durch Aufnahme der selbständigen Erwerbstätigkeit.
• HR-Pflicht ab gesetzlicher Umsatzschwelle.
• Haftung: unbeschränkt mit Privat- und Geschäftsvermögen.
• Firma muss erkennbaren Familiennamen enthalten.

EINFACHE GESELLSCHAFT:
• Lockerste Form des Zusammenschlusses; keine juristische Person; kein HR-Eintrag.
• Entsteht oft formlos und auch unbewusst (Risiko!).
• Mindestens zwei Personen mit gemeinsamem Zweck.
• Haftung: solidarisch und unbeschränkt; Gewinn/Verlust nach Köpfen.
• Typische Auffangrechtsform und Vorstufe anderer Gesellschaften.

KOLLEKTIVGESELLSCHAFT:
• Nur natürliche Personen; kaufmännisches Unternehmen.
• Entsteht erst mit HR-Eintrag (konstitutiv).
• Haftung: zwingend solidarisch und unbeschränkt.
• Konkurrenzverbot für Gesellschafter dispositiv vorgesehen.
• Vertretungsregelungen können im HR publiziert werden.

GmbH — GESELLSCHAFT MIT BESCHRÄNKTER HAFTUNG:
• Juristische Person; Mindeststammkapital CHF 20 000; Mindestnennwert Stammanteil CHF 100.
• Gründung: Statuten, Stammkapitaleinzahlung, öffentliche Beurkundung, HR-Eintrag.
• Oberstes Organ: Gesellschafterversammlung.
• Haftung: grundsätzlich nur mit Gesellschaftsvermögen.
• Personenbezogener Charakter; Statuten haben hohe praktische Bedeutung.
• Mögliche Nachschusspflicht statutarisch bis zum doppelten Nennwert.

AG — AKTIENGESELLSCHAFT:
• Juristische Person; Mindestaktienkapital CHF 100 000.
• Gründung: Statuten, Aktienzeichnung, Liberierung, öffentliche Beurkundung, HR-Eintrag.
• Organe: Generalversammlung (oberstes Organ), Verwaltungsrat (Geschäftsführung und Leitung), Revisionsstelle.
• Aktien grundsätzlich frei handelbar; Namenaktien können vinkuliert werden.
• Kapitalschutz: Kapitalverlust → GV einberufen; Überschuldung → Bilanz deponieren/Gericht.

GENOSSENSCHAFT:
• Mindestens sieben Mitglieder; HR-Eintrag; kein Mindestkapital.
• Zweck: Förderung wirtschaftlicher Interessen der Mitglieder durch gemeinsame Selbsthilfe.
• Stimmrecht kapitalunabhängig: ein Mitglied, eine Stimme.`
)

await addGoals(ch2, [
  'Du kannst die sechs wichtigsten Rechtsformen (Einzelunternehmen, einfache Gesellschaft, Kollektivgesellschaft, GmbH, AG, Genossenschaft) nach Haftung, Gründung, Kapital und Organisation unterscheiden.',
  'Du kennst die Risiken des unbewussten Entstehens einer einfachen Gesellschaft und deren Haftungsfolgen.',
  'Du kannst erklären, warum GmbH und AG erst mit dem Handelsregistereintrag rechtlich entstehen.',
  'Du kennst die drei Organe der AG (Generalversammlung, Verwaltungsrat, Revisionsstelle) und deren Aufgaben.',
  'Du weisst, was Kapitalverlust und Überschuldung bei der AG bedeuten und welche Pflichten den Verwaltungsrat treffen.',
  'Du kannst die Genossenschaft von Kapital- und Personengesellschaften abgrenzen und ihren Förderzweck erklären.',
])

await addTerms(ch2, [
  ['Einzelunternehmen', 'Unternehmung einer einzelnen natürlichen Person auf eigene Rechnung und Verantwortung. Keine juristische Person; unbeschränkte Haftung mit Privat- und Geschäftsvermögen.'],
  ['Einfache Gesellschaft', 'Vertraglicher Zusammenschluss von mindestens zwei Personen zur Erreichung eines gemeinsamen Zwecks — sofern keine andere Gesellschaftsform einschlägig ist. Keine juristische Person; entsteht oft formlos und unbewusst; solidarische unbeschränkte Haftung.'],
  ['Kollektivgesellschaft (KLG)', 'Personengesellschaft natürlicher Personen zum Betrieb eines kaufmännischen Unternehmens. Entsteht konstitutiv mit HR-Eintrag; zwingend solidarische und unbeschränkte Haftung.'],
  ['GmbH (Gesellschaft mit beschränkter Haftung)', 'Juristische Person mit Stammkapital (Mindest CHF 20 000). Personenbezogene Kapitalgesellschaft; Haftung grundsätzlich auf Gesellschaftsvermögen beschränkt; oberstes Organ: Gesellschafterversammlung.'],
  ['AG (Aktiengesellschaft)', 'Juristische Person mit Aktienkapital (Mindest CHF 100 000). Kapitalorientierte Gesellschaft; Aktien grundsätzlich frei handelbar; Organe: Generalversammlung, Verwaltungsrat, Revisionsstelle.'],
  ['Verwaltungsrat', 'Geschäftsführendes Organ der AG. Zuständig für Leitung, Organisation und Vertretung. Kann Geschäftsführung delegieren, behält aber unübertragbare gesetzliche Aufgaben. Pflichten bei Kapitalverlust und Überschuldung.'],
  ['Generalversammlung', 'Oberstes Organ der AG (Versammlung der Aktionäre). Entscheidet über Grundsatzfragen: Statutenänderung, Wahl des Verwaltungsrats, Gewinnverwendung/Dividende.'],
  ['Vinkulierung', 'Beschränkung der Übertragbarkeit von Namenaktien. Eintragung eines Erwerbers ins Aktienbuch kann verweigert werden. Inhaberaktien können nicht vinkuliert werden.'],
  ['Kapitalverlust / Überschuldung', 'Kapitalverlust: bilanziell liegt ein Verlust vor, der das Eigenkapital teilweise aufzehrt → Verwaltungsrat muss GV einberufen. Überschuldung: Vermögen deckt nicht einmal mehr das Fremdkapital → Bilanz deponieren oder Gericht einschalten.'],
  ['Genossenschaft', 'Körperschaft mit variabler Mitgliederzahl (mindestens sieben). Zweck: Förderung wirtschaftlicher Interessen der Mitglieder in gemeinsamer Selbsthilfe. Stimmrecht kapitalunabhängig (ein Mitglied, eine Stimme); kein Mindestkapital; HR-Eintrag.'],
])

await addPoints(ch2, [
  'Das Einzelunternehmen entsteht formlos; der Inhaber haftet unbeschränkt mit dem gesamten Vermögen.',
  'Die einfache Gesellschaft kann unbewusst entstehen — mit dem Risiko solidarischer und unbeschränkter Haftung.',
  'Die Kollektivgesellschaft entsteht erst mit HR-Eintrag (konstitutiv); Haftung ist zwingend unbeschränkt und solidarisch.',
  'GmbH und AG sind juristische Personen und entstehen erst mit öffentlicher Beurkundung und HR-Eintrag.',
  'GmbH: Mindeststammkapital CHF 20 000; oberstes Organ ist die Gesellschafterversammlung.',
  'AG: Mindestaktienkapital CHF 100 000; Organe sind Generalversammlung, Verwaltungsrat und Revisionsstelle.',
  'Verwaltungsrat kann Geschäftsführung delegieren, nicht aber seine unübertragbaren gesetzlichen Aufgaben.',
  'Bei Kapitalverlust: GV einberufen. Bei Überschuldung: Bilanz deponieren oder Gericht einschalten.',
  'Genossenschaft verfolgt keinen Gewinnzweck, sondern Mitgliederförderung; Stimmrecht ist kapitalunabhängig.',
  'Je stärker die Verselbständigung einer Gesellschaft (juristische Person), desto stärker ist die Haftungsbeschränkung, aber auch der Gründungsaufwand.',
])

await addQuiz(ch2, [
  {
    q: 'Zwei Freunde beschliessen zusammen, eine Ferienwohnung zu kaufen und zu vermieten — ohne Gesellschaftsvertrag. Welche Rechtsform liegt vor?',
    opts: [
      ['Einfache Gesellschaft — entsteht formlos durch gemeinsamen Zweck', true],
      ['GmbH — weil sie gemeinsam Eigentümer sind', false],
      ['Kollektivgesellschaft — weil zwei Personen zusammenarbeiten', false],
      ['Keine Rechtsform — es braucht immer einen schriftlichen Vertrag', false],
    ],
    exp: 'Die einfache Gesellschaft entsteht formlos und oft unbewusst, sobald mindestens zwei Personen ihre Kräfte oder Mittel zur Erreichung eines gemeinsamen Zwecks verbinden — ohne dass eine andere Gesellschaftsform einschlägig ist.',
    diff: 'medium',
  },
  {
    q: 'Was ist das Mindeststammkapital einer GmbH in der Schweiz?',
    opts: [
      ['CHF 20 000', true],
      ['CHF 100 000', false],
      ['CHF 50 000', false],
      ['CHF 10 000', false],
    ],
    exp: 'Das Mindeststammkapital einer GmbH beträgt CHF 20 000. Zum Vergleich: Bei der AG beträgt das Mindestaktienkapital CHF 100 000.',
    diff: 'easy',
  },
  {
    q: 'Welches ist das oberste Organ der AG?',
    opts: [
      ['Die Generalversammlung (Versammlung aller Aktionäre)', true],
      ['Der Verwaltungsrat', false],
      ['Die Revisionsstelle', false],
      ['Die Gesellschafterversammlung', false],
    ],
    exp: 'Die Generalversammlung ist das oberste Organ der AG. Sie entscheidet über Grundsatzfragen wie Statutenänderungen, Wahl des Verwaltungsrats und Gewinnverwendung. Die Gesellschafterversammlung ist das entsprechende Organ bei der GmbH.',
    diff: 'easy',
  },
  {
    q: 'Eine Kollektivgesellschaft soll gegründet werden. Wann entsteht sie rechtlich?',
    opts: [
      ['Mit dem Handelsregistereintrag (konstitutive Wirkung)', true],
      ['Mit der Unterzeichnung des Gesellschaftsvertrags', false],
      ['Mit der Aufnahme der Geschäftstätigkeit', false],
      ['Sie entsteht formlos, wie die einfache Gesellschaft', false],
    ],
    exp: 'Die Kollektivgesellschaft entsteht konstitutiv mit dem Handelsregistereintrag. Erst damit ist sie als Kollektivgesellschaft nach aussen rechtlich erkennbar und existent.',
    diff: 'medium',
  },
  {
    q: 'Die Bilanz einer AG zeigt, dass das Vermögen das Fremdkapital nicht mehr vollständig deckt. Was muss der Verwaltungsrat tun?',
    opts: [
      ['Die Bilanz beim Gericht deponieren oder das Gericht benachrichtigen (Überschuldung)', true],
      ['Die Generalversammlung einberufen und Sanierungsmassnahmen beantragen (Kapitalverlust)', false],
      ['Nichts — dieser Zustand ist rechtlich unproblematisch', false],
      ['Sofort die Gesellschaft auflösen', false],
    ],
    exp: 'Bei Überschuldung (Vermögen deckt nicht einmal mehr das Fremdkapital) ist der Verwaltungsrat verpflichtet, die Bilanz zu deponieren oder das Gericht einzuschalten. Beim blossen Kapitalverlust (weniger gravierend) muss er die GV einberufen.',
    diff: 'hard',
  },
  {
    q: 'Was unterscheidet die Genossenschaft grundlegend von einer AG?',
    opts: [
      ['Die Genossenschaft verfolgt Mitgliederförderung statt Gewinnmaximierung; Stimmrecht ist kapitalunabhängig', true],
      ['Die Genossenschaft hat kein oberstes Organ', false],
      ['Bei der Genossenschaft haftet jedes Mitglied unbeschränkt', false],
      ['Die Genossenschaft braucht keinen Handelsregistereintrag', false],
    ],
    exp: 'Die Genossenschaft fördert die wirtschaftlichen Interessen ihrer Mitglieder durch gemeinsame Selbsthilfe — nicht primär Gewinn. Jedes Mitglied hat eine Stimme, unabhängig von seiner Kapitaleinlage. Die AG dagegen ist kapitalorientiert.',
    diff: 'medium',
  },
  {
    q: 'Ein Gesellschafter einer Kollektivgesellschaft möchte seine Haftung auf seinen Kapitalanteil beschränken. Ist das möglich?',
    opts: [
      ['Nein — die unbeschränkte solidarische Haftung bei der KLG ist zwingend', true],
      ['Ja — durch entsprechende Regelung im Gesellschaftsvertrag', false],
      ['Ja — wenn alle Gesellschafter zustimmen und dies im HR eingetragen wird', false],
      ['Ja — wenn der Umsatz unter einer bestimmten Schwelle liegt', false],
    ],
    exp: 'Bei der Kollektivgesellschaft ist die unbeschränkte solidarische Haftung aller Gesellschafter zwingend. Sie kann weder durch den Gesellschaftsvertrag noch durch HR-Eintrag wegbedungen werden.',
    diff: 'medium',
  },
  {
    q: 'Was versteht man unter Vinkulierung von Aktien?',
    opts: [
      ['Beschränkung der Übertragbarkeit von Namenaktien; Erwerber kann im Aktienbuch verweigert werden', true],
      ['Beschränkung des Stimmrechts bei Inhaberaktien', false],
      ['Gesetzliche Pflicht zur öffentlichen Beurkundung bei Aktienübertragung', false],
      ['Umwandlung von Namenaktien in Inhaberaktien', false],
    ],
    exp: 'Vinkulierung bedeutet, dass die Übertragung von Namenaktien eingeschränkt werden kann — der Verwaltungsrat kann die Eintragung eines Erwerbers ins Aktienbuch unter bestimmten Voraussetzungen verweigern. Inhaberaktien können laut Unterlagen nicht vinkuliert werden.',
    diff: 'hard',
  },
])

console.log('✅ WR Gesellschaftsrecht und Handelsregister — 2 Kapitel erfolgreich erstellt.')
await client.end()
