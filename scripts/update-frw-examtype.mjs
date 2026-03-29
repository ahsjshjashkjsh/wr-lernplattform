// Sets examType for all FRW topics based on Stoffprogramm 2026
// QSP = 'querschnitt' | AP-only = 'abschluss'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) { console.error('DATABASE_URL missing'); process.exit(1) }

const QSP_SLUGS = new Set([
  // Band 1 — Grundlagen der Buchhaltung
  'frw-bilanz-erfolgsrechnung',   // Kap 1
  'frw-grundlagen',               // Kap 1 (alt)
  'frw-band1-grundlagen',         // Kap 1 (neu)
  // Band 1 — Warenkonten
  'frw-warenkonten',
  'frw-band1-warenkonten',
  // Band 1 — MWST
  'frw-mehrwertsteuer',
  'frw-band1-mwst',
  // Band 1 — VST
  'frw-verrechnungssteuer',
  'frw-band1-vst',
  // Band 2
  'frw-fremde-waehrungen',        // Kap 2
  'frw-verluste-forderungen',     // Kap 3
  'frw-abschreibungen',           // Kap 4
  'frw-zeitliche-abgrenzungen',   // Kap 5
  'frw-loehne-gehaelter',         // Kap 6
  // Band 3
  'frw-immobilien',               // Kap 7
  'frw-wertschriften',            // Kap 8
])

const client = new Client({ connectionString: DATABASE_URL })
await client.connect()

// Get all FRW topics
const { rows } = await client.query(`SELECT id, slug, title, "examType" FROM "Topic" WHERE category = 'frw' ORDER BY "order"`)

console.log(`\nFound ${rows.length} FRW topics:\n`)

let qspCount = 0, apCount = 0
for (const row of rows) {
  const newType = QSP_SLUGS.has(row.slug) ? 'querschnitt' : 'abschluss'
  const label = newType === 'querschnitt' ? '✓ QSP' : '  AP '
  console.log(`${label}  ${row.slug.padEnd(35)} (war: ${row.examType})`)
  await client.query(`UPDATE "Topic" SET "examType" = $1, "updatedAt" = NOW() WHERE id = $2`, [newType, row.id])
  if (newType === 'querschnitt') qspCount++; else apCount++
}

console.log(`\n✓ Fertig: ${qspCount} QSP, ${apCount} AP`)
await client.end()
