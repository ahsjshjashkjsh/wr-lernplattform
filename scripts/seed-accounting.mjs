import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// Alle Transaktionen aus der Prepaid-Karte (Kurs USD→CHF: ~0.796)
const entries = [
  // === AUFWÄNDE (Anthropic API-Kosten) ===
  { typ: 'aufwand', beschreibung: 'Anthropic San Francisco', betrag: 57.66, datum: '2026-03-29T14:44:00', kategorie: 'Claude API' },
  { typ: 'aufwand', beschreibung: 'Anthropic San Francisco', betrag: 11.18, datum: '2026-03-28T23:16:00', kategorie: 'Claude API' },
  { typ: 'aufwand', beschreibung: 'Anthropic San Francisco', betrag: 4.31,  datum: '2026-03-27T15:22:00', kategorie: 'Claude API' },
  { typ: 'aufwand', beschreibung: 'Anthropic',               betrag: 7.75,  datum: '2026-03-25T14:42:00', kategorie: 'Claude API' },
  { typ: 'aufwand', beschreibung: 'Anthropic',               betrag: 4.31,  datum: '2026-03-24T10:52:00', kategorie: 'Claude API' },
  { typ: 'aufwand', beschreibung: 'Anthropic',               betrag: 4.31,  datum: '2026-03-24T09:51:00', kategorie: 'Claude API' },
  { typ: 'aufwand', beschreibung: 'Anthropic',               betrag: 4.32,  datum: '2026-03-23T13:28:00', kategorie: 'Claude API' },
  { typ: 'aufwand', beschreibung: 'Anthropic',               betrag: 8.63,  datum: '2026-03-23T11:08:00', kategorie: 'Claude API' },
  { typ: 'aufwand', beschreibung: 'Anthropic',               betrag: 4.32,  datum: '2026-03-23T11:07:00', kategorie: 'Claude API' },
  { typ: 'aufwand', beschreibung: 'Anthropic',               betrag: 4.32,  datum: '2026-03-23T10:43:00', kategorie: 'Claude API' },
  { typ: 'aufwand', beschreibung: 'Claude.ai Subscription',  betrag: 17.17, datum: '2026-03-13T16:46:00', kategorie: 'Claude API' },

  // === ERTRÄGE (Einzahlungen & Premium-Zahlungen) ===
  { typ: 'ertrag', beschreibung: 'Premium-Zahlung',     betrag: 55.00, datum: '2026-03-29T14:44:00', kategorie: 'Premium' },
  { typ: 'ertrag', beschreibung: 'Premium-Zahlung',     betrag: 18.50, datum: '2026-03-27T15:21:00', kategorie: 'Premium' },
  { typ: 'ertrag', beschreibung: 'Kartenguthaben',      betrag: 7.00,  datum: '2026-03-25T00:00:00', kategorie: 'Einzahlung' },
  { typ: 'ertrag', beschreibung: 'Kartenguthaben',      betrag: 5.00,  datum: '2026-03-24T00:00:00', kategorie: 'Einzahlung' },
  { typ: 'ertrag', beschreibung: 'Kartenguthaben',      betrag: 3.57,  datum: '2026-03-24T00:00:00', kategorie: 'Einzahlung' },
  { typ: 'ertrag', beschreibung: 'Kartenguthaben',      betrag: 2.42,  datum: '2026-03-23T00:00:00', kategorie: 'Einzahlung' },
]

for (const e of entries) {
  await client.query(
    `INSERT INTO "AccountingEntry" (id, typ, beschreibung, betrag, datum, kategorie, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [randomUUID(), e.typ, e.beschreibung, e.betrag, new Date(e.datum), e.kategorie]
  )
  console.log(`✓ ${e.typ === 'ertrag' ? '+' : '−'} ${e.betrag.toFixed(2)} CHF — ${e.beschreibung}`)
}

console.log(`\n✅ ${entries.length} Einträge eingefügt.`)
await client.end()
