import pg from 'pg'
const { Client } = pg

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// 1. Alles löschen (in richtiger Reihenfolge)
const tables = [
  'QuizAttemptAnswer', 'QuizAttempt', 'QuizOption', 'QuizQuestion',
  'BookingEntry', 'Formula', 'LearningGoal', 'KeyTerm', 'CorePoint',
  'Example', 'ChapterProgress', 'Chapter', 'Topic',
]
for (const t of tables) {
  await client.query(`DELETE FROM "${t}"`)
  console.log(`✓ ${t} geleert`)
}

// 2. FRW Topics einfügen (Kapitel-Nummer = order)
const topics = [
  {
    slug: 'frw-fremde-waehrungen',
    title: 'Fremde Währungen',
    description: 'Buchkurs, Tageskurs und Kursdifferenzen bei Fremdwährungstransaktionen.',
    order: 2,
  },
  {
    slug: 'frw-verluste-forderungen',
    title: 'Verluste aus Forderungen',
    description: 'Mahnverfahren, Betreibung, Verlustschein und Delkredere-Rückstellung.',
    order: 3,
  },
  {
    slug: 'frw-abschreibungen',
    title: 'Abschreibungen',
    description: 'Lineare und degressive Abschreibung, direkte und indirekte Verbuchung, Anlagenverkauf.',
    order: 4,
  },
  {
    slug: 'frw-zeitliche-abgrenzungen',
    title: 'Zeitliche Abgrenzungen & Rückstellungen',
    description: 'Periodengerechte Zuordnung von Aufwand und Ertrag, transitorische Konten, Rückstellungen.',
    order: 5,
  },
  {
    slug: 'frw-loehne-gehaelter',
    title: 'Löhne und Gehälter',
    description: 'Lohnbuchhaltung, Sozialabzüge, Arbeitgeberbeiträge und Sonderfälle.',
    order: 6,
  },
  {
    slug: 'frw-einzelunternehmen',
    title: 'Einzelunternehmen',
    description: 'Gründung, Eigenkapitalstruktur, Privatkonto und Jahresabschluss.',
    order: 7,
  },
  {
    slug: 'frw-aktiengesellschaft',
    title: 'Aktiengesellschaft & Gewinnverteilung',
    description: 'AG-Gründung, Buchung, Gewinnverteilung, Kapitalerhöhung.',
    order: 8,
  },
  {
    slug: 'frw-bewertungsvorschriften',
    title: 'Bewertungsvorschriften & Stille Reserven',
    description: 'Bewertung von Bilanzpositionen, stille Reserven und Bilanzbereinigung.',
    order: 9,
  },
  {
    slug: 'frw-bilanzanalyse',
    title: 'Analyse der Bilanz und Erfolgsrechnung',
    description: 'Kennzahlen zur Beurteilung der Finanzlage und Ertragskraft eines Unternehmens.',
    order: 11,
  },
]

for (const t of topics) {
  const res = await client.query(
    `INSERT INTO "Topic" (id, slug, title, description, icon, color, "examType", category, band, "order", published, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, 'Calculator', 'emerald', 'abschluss', 'frw', '2', $4, true, NOW(), NOW())
     RETURNING id`,
    [t.slug, t.title, t.description, t.order]
  )
  const topicId = res.rows[0].id

  // Ein Chapter pro Topic
  await client.query(
    `INSERT INTO "Chapter" (id, slug, title, "topicId", "order", "contentStatus", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, 1, 'pending', NOW(), NOW())`,
    [t.slug, t.title, topicId]
  )

  console.log(`✓ Kapitel ${t.order}: ${t.title}`)
}

await client.end()
console.log('\n✅ 9 FRW-Topics und Chapters angelegt')
