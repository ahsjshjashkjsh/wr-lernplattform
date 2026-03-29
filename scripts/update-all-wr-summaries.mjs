import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { join } from 'path'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const BASE = "C:/ÜBUNGSTOOL ABSCHLUSSPRÜFUNG WR/wr-lernplattform/WR"

const UPDATES = [
  {
    file: join(BASE, "Marketing/marketing_wissen_wirtschaft_und_recht.md"),
    ids: [
      '69b15cc2-438b-4888-81ad-2c60bdb43ad7',
      '1aaddaf9-26c9-4f47-b088-6bccad94a660',
    ],
    name: 'wr-marketing'
  },
  {
    file: join(BASE, "Gesellschaftsrecht und Handelsregister/wirtschaft_und_recht_wissensbasis.md"),
    ids: [
      'd613ce9b-3473-488f-b232-9b8d846a0cb9',
      'b28ea7ba-3640-458f-b304-14761a640d1c',
    ],
    name: 'wr-gesellschaftsrecht'
  },
  {
    file: join(BASE, "Allgemeine Vertragslehre und Kaufvertrag/wirtschaft_und_recht_wissensdatenbank.md"),
    ids: [
      '03013522-3ebe-4a4c-837e-a3c96c37995a',
      '95c67466-2c05-4787-b00b-a3bfcaa045ae',
    ],
    name: 'wr-vertragslehre'
  },
  {
    file: join(BASE, "Konjunktur/BIP_und_Konjunktur_Wissensdatenbank.md"),
    ids: [
      '3e97f40b-0174-4344-a250-342c0fb3b93f',
      '5f9aaf85-e9c5-45e7-9976-f7adcec4abe0',
    ],
    name: 'wr-konjunktur'
  },
]

async function main() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  console.log('Connected to DB\n')

  for (const update of UPDATES) {
    try {
      const content = readFileSync(update.file, 'utf8')
      await client.query(
        `UPDATE "Chapter" SET summary = $1 WHERE id = ANY($2::text[])`,
        [content, update.ids]
      )
      console.log(`✓ ${update.name}: ${content.length.toLocaleString()} chars → ${update.ids.length} chapter(s)`)
    } catch (err) {
      console.error(`✗ ${update.name}: ${err.message}`)
    }
  }

  await client.end()
  console.log('\nAll done.')
}

main().catch(console.error)
