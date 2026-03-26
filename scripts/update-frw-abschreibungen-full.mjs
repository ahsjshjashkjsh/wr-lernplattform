import pg from 'pg'
import { readFileSync } from 'fs'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const md = readFileSync(
  'Inhalt/FRW/Band 2/Abschreibung (Band 2, Kapitel 4)/Claude Code/abschreibungen_zusammenfassung (1).md',
  'utf8'
)

// abschreibungen-methoden bekommt die komplette Theorie
const { rows: [ch1] } = await client.query(`SELECT id FROM "Chapter" WHERE slug = 'abschreibungen-methoden'`)
await client.query(`UPDATE "Chapter" SET summary = $1 WHERE id = $2`, [md, ch1.id])
console.log('✓ abschreibungen-methoden — vollständiges MD gespeichert (' + md.length + ' Zeichen)')

// abschreibungen bekommt den zweiten Teil (ab Abschnitt 10 Verbuchung)
const split = md.indexOf('## 10. Verbuchung der Abschreibungen')
const md2 = split > -1 ? md.slice(split) : md
const { rows: [ch2] } = await client.query(`SELECT id FROM "Chapter" WHERE slug = 'abschreibungen'`)
await client.query(`UPDATE "Chapter" SET summary = $1 WHERE id = $2`, [md2, ch2.id])
console.log('✓ abschreibungen — Verbuchung + Verkauf + Selbstfinanzierung (' + md2.length + ' Zeichen)')

await client.end()
console.log('\n✅ Vollständige Theorie in DB gespeichert')
