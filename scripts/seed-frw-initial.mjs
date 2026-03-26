import pg from 'pg'
import { randomUUID } from 'crypto'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// ─── TOPIC: Löhne und Gehälter (Band 2) ──────────────────────────────────────
const topicId = randomUUID()
await client.query(`
  INSERT INTO "Topic" (id, slug, title, description, icon, color, "examType", category, band, "order", published, "createdAt", "updatedAt")
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,NOW(),NOW())
`, [topicId, 'frw-loehne-gehaelter', 'Löhne und Gehälter',
   'Lohnabrechnung, Sozialversicherungen und Spesen korrekt verbuchen.',
   'Calculator', 'amber', 'both', 'frw', '2', 10])

// ─── CHAPTER 1: Grundlagen Lohnbuchhaltung ───────────────────────────────────
const ch1Id = randomUUID()
await client.query(`
  INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", "createdAt", "updatedAt")
  VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
`, [ch1Id, 'lohnbuchhaltung', 'Lohnbuchhaltung', 'Brutto, Abzüge, Netto', topicId, 1, 'complete'])

// ─── CHAPTER 2: Löhne & Gehälter vertieft ────────────────────────────────────
const ch2Id = randomUUID()
await client.query(`
  INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", "createdAt", "updatedAt")
  VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
`, [ch2Id, 'loehne-gehaelter', 'Löhne und Gehälter',
   'Sozialversicherungen, Spesen, Naturallohn und Teilzeitarbeit', topicId, 2, 'complete'])

console.log('Topics + Chapters created')

// ─── FORMULAS Chapter 1 ───────────────────────────────────────────────────────
const formulas1 = [
  { name: 'Nettolohn', formel: 'Bruttolohn − AN-Beiträge', erklaerung: 'Der ausbezahlte Betrag nach Abzug aller Arbeitnehmer-Beiträge.' },
  { name: 'Gesamtlohnkosten (AG)', formel: 'Bruttolohn + AG-Beiträge', erklaerung: 'Totale Kosten für den Arbeitgeber inkl. aller Arbeitgeber-Beiträge.' },
  { name: 'AHV/IV/EO Beitrag AN', formel: 'Bruttolohn × 5.3%', erklaerung: 'AHV 4.35% + IV 0.7% + EO 0.25% = 5.3% Arbeitnehmer-Anteil.' },
  { name: 'ALV Beitrag (AN)', formel: 'Bruttolohn × 1.1% (bis CHF 148\'200)', erklaerung: 'Auf Löhne über CHF 148\'200 fällt kein ALV-Beitrag mehr an.' },
]
for (let i = 0; i < formulas1.length; i++) {
  await client.query(
    `INSERT INTO "Formula" (id, name, formel, erklaerung, "chapterId", "order") VALUES ($1,$2,$3,$4,$5,$6)`,
    [randomUUID(), formulas1[i].name, formulas1[i].formel, formulas1[i].erklaerung, ch1Id, i]
  )
}

// ─── BOOKING ENTRIES Chapter 1 ────────────────────────────────────────────────
const entries1 = [
  {
    situation: 'Lohn abrechnen: Gesamtaufwand (Bruttolohn + AG-Beiträge) erfassen',
    sollKonto: 'Lohnaufwand',
    habenKonto: 'Verbindl. Sozialvers.A',
    betragHint: 'Bruttolohn + AG-Beiträge AHV/IV/EO/ALV/BVG',
    erklaerung: 'Der gesamte Lohnaufwand = Bruttolohn + alle AG-Beiträge wird dem Lohnaufwand belastet. Die Verbindlichkeit gegenüber der Ausgleichskasse (AN + AG Beiträge) wird auf Haben gebucht.',
  },
  {
    situation: 'Nettolohn an Mitarbeiter überweisen',
    sollKonto: 'Lohnaufwand',
    habenKonto: 'Bank',
    betragHint: 'Bruttolohn − alle AN-Abzüge',
    erklaerung: 'Der Nettolohn (Bruttolohn minus AN-Beiträge AHV/IV/EO/ALV/NBU/BVG) wird vom Bankkonto überwiesen.',
  },
  {
    situation: 'Rechnung der Ausgleichskasse (AHV/IV/EO/ALV) bezahlen',
    sollKonto: 'Verbindl. Sozialvers.A',
    habenKonto: 'Bank',
    betragHint: 'AN-Beiträge + AG-Beiträge (total)',
    erklaerung: 'Die Ausgleichskasse verrechnet AN- und AG-Beiträge zusammen. Die Verbindlichkeit wird durch Banküberweisung beglichen.',
  },
  {
    situation: 'NBU-Prämie (Nichtberufsunfall) bezahlen',
    sollKonto: 'Verbindl. Sozialvers.A',
    habenKonto: 'Bank',
    betragHint: 'Satz je nach Branche (z.B. 0.504%)',
    erklaerung: 'Die NBU-Prämie trägt allein der Arbeitnehmer. Sie wurde im Nettolohn bereits abgezogen und liegt in der Verbindlichkeit Sozialvers.',
  },
  {
    situation: 'BVG-Beiträge (Pensionskasse) an PK überweisen',
    sollKonto: 'Verbindl. Sozialvers.A',
    habenKonto: 'Bank',
    betragHint: 'AN- + AG-Anteil gemäss BVG-Reglement',
    erklaerung: 'AN und AG tragen je mindestens die Hälfte der Pensionskassen-Prämie. Der AG-Anteil ist im Gesamtlohnaufwand bereits enthalten.',
  },
]
for (let i = 0; i < entries1.length; i++) {
  const e = entries1[i]
  await client.query(
    `INSERT INTO "BookingEntry" (id, situation, "sollKonto", "habenKonto", "betragHint", erklaerung, "chapterId", "order") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [randomUUID(), e.situation, e.sollKonto, e.habenKonto, e.betragHint ?? null, e.erklaerung, ch1Id, i]
  )
}

// ─── FORMULAS Chapter 2 ───────────────────────────────────────────────────────
const formulas2 = [
  { name: 'Spesen (Pauschale)', formel: 'Betrag gemäss Spesenreglement', erklaerung: 'Pauschalspesen bis ESTV-Ansätze sind nicht AHV-pflichtig.' },
  { name: 'Naturallohn', formel: 'Marktwert der geldwerten Leistung', erklaerung: 'Geldwerte Vorteile (Gratisessen, Wohnung) gelten als Lohn — AHV-pflichtig, auf Lohnausweis deklarieren.' },
  { name: 'Teilzeitlohn', formel: 'Vollzeitlohn × Stellenprozent ÷ 100', erklaerung: 'Der Bruttolohn wird proportional zum Beschäftigungsgrad berechnet.' },
]
for (let i = 0; i < formulas2.length; i++) {
  await client.query(
    `INSERT INTO "Formula" (id, name, formel, erklaerung, "chapterId", "order") VALUES ($1,$2,$3,$4,$5,$6)`,
    [randomUUID(), formulas2[i].name, formulas2[i].formel, formulas2[i].erklaerung, ch2Id, i]
  )
}

// ─── BOOKING ENTRIES Chapter 2 ────────────────────────────────────────────────
const entries2 = [
  {
    situation: 'Pauschalspesen vergüten (nicht sozialversicherungspflichtig)',
    sollKonto: 'Spesenaufwand',
    habenKonto: 'Bank',
    betragHint: 'Pauschalbetrag gemäss Spesenreglement',
    erklaerung: 'Pauschalspesen innerhalb ESTV-Ansätze sind kein Lohnbestandteil — direkt als Spesenaufwand buchen, kein AHV-Beitrag.',
  },
  {
    situation: 'Effektive Spesen erstatten (gegen Beleg)',
    sollKonto: 'Spesenaufwand',
    habenKonto: 'Bank',
    betragHint: 'Betrag laut Originalbeleg',
    erklaerung: 'Belegbasierte Spesen werden 1:1 erstattet. Kein Lohnbestandteil, kein Sozialversicherungsbeitrag.',
  },
  {
    situation: 'Naturallohn verbuchen (z.B. Gratisverpflegung, Dienstwohnung)',
    sollKonto: 'Lohnaufwand',
    habenKonto: 'Warenaufwand / Mietaufwand',
    betragHint: 'Marktwert der geldwerten Leistung',
    erklaerung: 'Naturallohn gilt als Lohnbestandteil. Muss auf Lohnausweis deklariert werden, ist AHV-pflichtig.',
  },
  {
    situation: 'Kinderzulagen (Familienzulagen) an Mitarbeiter auszahlen',
    sollKonto: 'Lohnaufwand',
    habenKonto: 'Bank',
    betragHint: 'Kantonaler Ansatz (mind. CHF 200/Kind)',
    erklaerung: 'AG zahlt Kinderzulagen vor. Die Ausgleichskasse erstattet den Betrag später zurück.',
  },
  {
    situation: 'Kinderzulagen von Ausgleichskasse zurückerhalten',
    sollKonto: 'Bank',
    habenKonto: 'Lohnaufwand',
    betragHint: 'Gleicher Betrag wie Auszahlung',
    erklaerung: 'Gegenbuchung: Die AK erstattet dem AG die vorgeschossenen Kinderzulagen. Lohnaufwand wird entsprechend reduziert.',
  },
]
for (let i = 0; i < entries2.length; i++) {
  const e = entries2[i]
  await client.query(
    `INSERT INTO "BookingEntry" (id, situation, "sollKonto", "habenKonto", "betragHint", erklaerung, "chapterId", "order") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [randomUUID(), e.situation, e.sollKonto, e.habenKonto, e.betragHint ?? null, e.erklaerung, ch2Id, i]
  )
}

console.log('Formulas + Booking Entries seeded')
await client.end()
console.log('DONE — Löhne & Gehälter komplett')
