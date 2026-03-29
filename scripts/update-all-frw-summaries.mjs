import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { join } from 'path'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const BASE = "C:/ÜBUNGSTOOL ABSCHLUSSPRÜFUNG WR/wr-lernplattform/FRW"

// Map: KB file path -> chapter IDs to update
const UPDATES = [
  {
    file: join(BASE, "Band 1/Bilanz, Erfolgsrechnung, Buchungssatz, Hauptbuch, Jahresabschluss (Band 1, Kapitel 1-8)/wissensbasis_buchhaltung_schweiz.md"),
    ids: ['c1fc9611-23ff-4f27-bef3-5229e0793699'],
    name: 'frw-bilanz-erfolgsrechnung'
  },
  {
    file: join(BASE, "Band 1/Warenkonto (Band 1, Kapitel 9)/warenkonten_wissensextraktion.md"),
    ids: ['8e97beb2-6529-4c71-a1cc-3a8227c7acc8', '68cba68b-88cf-4f9e-8658-468d666da8c4'],
    name: 'frw-warenkonten'
  },
  {
    file: join(BASE, "Band 1/MWST (Band 1, Kapitel 11)/mehrwertsteuer_wissensextrakt.md"),
    ids: ['63b15e64-7b19-483d-9d71-2f2d6fbcade0', '22c82046-2633-46bc-ac39-0489bccd6cbf'],
    name: 'frw-mehrwertsteuer'
  },
  {
    file: join(BASE, "Band 1/VST (Band 1, Kapitel 12.4)/verrechnungssteuer_wissensmodul.md"),
    ids: ['c17edd2c-23f6-412d-9afa-67de2f1d91c9', '9a92cc88-b280-4968-ba0b-043146ab5e56'],
    name: 'frw-verrechnungssteuer'
  },
  {
    file: join(BASE, "Band 2/Fremde Währung (Band 2, Kapitel 2)/fremde_waehrungen_wissensbasis (1).md"),
    ids: ['e04f51a1-a1e2-441c-b0d7-f08c73535de7', '1cff2f4a-e6a8-49bc-ba16-5e79bdbe68cb', '3467c6de-fb52-4517-9a57-c504fef13b67'],
    name: 'frw-fremde-waehrungen'
  },
  {
    file: join(BASE, "Band 2/Bewertungsvorschriften, Stille Reserven, Bilanzbereinigung (Band 2, Kapitel 9)/bewertungen_und_stille_reserven_kapitel9_wissensextraktion.md"),
    ids: ['d8391498-16ad-4191-9d67-f931c0b0aa1d', '686e7828-7a6f-44c5-ae9f-ad28b2b86668', 'efefdb24-9559-4437-8b9a-6e60f1b56342'],
    name: 'frw-bewertungsvorschriften'
  },
  {
    file: join(BASE, "Band 2/Einzelunternehung (Band 2, Kapitel 7)/einzelunternehmen_kapitel7_wissensextraktion.md"),
    ids: ['8d2a1b28-ba8f-4fef-8072-a3c1582e3e2c'],
    name: 'frw-rechtsformen (Einzelunternehmen)'
  },
  {
    file: join(BASE, "Band 2/AG (inkl. Gewinnverteilung) (Band 2, Kapitel 8)/aktiengesellschaft_kapitel8_wissensextraktion.md"),
    ids: ['94403bc5-bbd8-4d00-af37-f8ee9eaff079'],
    name: 'frw-rechtsformen (AG)'
  },
  {
    file: join(BASE, "Band 2/Analyse der Bilanz und Erfolgsrechnung (Band 2, Kapitel 11)/bilanz_und_erfolgsanalyse_kapitel11_wissensextraktion.md"),
    ids: ['068d03b4-c30e-4cf2-97b9-e417048d5469'],
    name: 'frw-kennzahlenanalyse'
  },
  {
    file: join(BASE, "Band 3/Immobilien (Band 3, Kapitel 4)/immobilien_wissensextraktion.md"),
    ids: ['c79d84e7-0fb3-468f-b9a6-8bf78d55575d', 'd062d0db-2ab8-4ecc-aa7c-47940d23b8cb', '432128e8-3d54-4b8b-b04d-598c08e63639', '268c0b2e-24f5-4b8b-a1f7-e2c70ded14c2'],
    name: 'frw-immobilien'
  },
  {
    file: join(BASE, "Band 3/Wertschriften (Band 3, Kapitel 5)/wertschriften_kapitel5_wissensextraktion.md"),
    ids: ['da9a5adf-6183-46a7-a7c0-981614d986ea', '3b92006d-2831-4953-92a1-5e85ea8ba299', 'd231a2b1-b6a6-4a41-8e93-c0b4124cace0'],
    name: 'frw-wertschriften'
  },
  {
    file: join(BASE, "Band 3/Geldflussrechnung (Band 3, Kapitel 9)/die_geldflussrechnung_wissensextraktion.md"),
    ids: ['e7154f93-4d94-453c-83ac-1d4eaa6be48b', '3eaed969-3269-4b7c-b0f3-441e453ec796'],
    name: 'frw-geldflussrechnung'
  },
  {
    file: join(BASE, "Band 3/Mehrwertsteuer (Band 3, Kapitel 1)/mehrwertsteuer_vertiefung_wissensextraktion.md"),
    ids: ['841e0a7e-840f-4d99-bacc-2ca5c9b24e2f', '62433cc6-d3cc-4883-bce0-047cbbc14949'],
    name: 'frw-mwst-vertiefung'
  },
  {
    file: join(BASE, "Band 3/Bewertungsvorschriten, Stille Reserven, Bilanzbereinigung (Band 3, Kapitel 3)/stille_reserven_wissensextraktion.md"),
    ids: ['b6aef95f-505c-4942-b90f-6b2b1d5e07e7'],
    name: 'frw-stille-reserven-vertiefung'
  },
  {
    file: join(BASE, "Band 3/Kostenrechnung, Nutzschwelleanalyse (Band 3, Kapitel 11 und 12)/betriebsabrechnung_deckungsbeitrag_wissensbasis.md"),
    ids: ['f5c28c8f-f820-4dbf-a37e-38d0f815be76', '55da8759-ee41-4f9e-9b5d-e32f8b7c44b1'],
    name: 'frw-kostenrechnung'
  },
  // Band 3 Fremde Währung (separate advanced content)
  {
    file: join(BASE, "Band 3/Fremde Währung (Band 3, Kapitel 2)/wissen_fremdwaehrung_buchhaltung.md"),
    ids: ['3467c6de-fb52-4517-9a57-c504fef13b67'],
    name: 'frw-fremde-waehrungen Band3 chapter'
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
