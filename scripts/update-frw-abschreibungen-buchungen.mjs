import pg from 'pg'
import { randomUUID } from 'crypto'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

async function getChapterId(slug) {
  const { rows } = await client.query(`SELECT id FROM "Chapter" WHERE slug = $1`, [slug])
  return rows[0]?.id ?? null
}

async function clearEntries(id) {
  await client.query(`DELETE FROM "BookingEntry" WHERE "chapterId" = $1`, [id])
}

async function addEntries(id, entries) {
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    await client.query(
      `INSERT INTO "BookingEntry" (id, situation, "sollKonto", "habenKonto", "betragHint", erklaerung, "chapterId", "order") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [randomUUID(), e.situation, e.soll, e.haben, e.betrag ?? null, e.erklaerung, id, i]
    )
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// abschreibungen-methoden — Anschaffungsbuchungen
// ══════════════════════════════════════════════════════════════════════════════
{
  const id = await getChapterId('abschreibungen-methoden')
  await clearEntries(id)

  await addEntries(id, [
    {
      situation: 'Kauf einer Anlage — Rechnung des Lieferanten buchen',
      soll: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      haben: 'Verb. L+L',
      betrag: 'Kaufpreis brutto laut Rechnung (z.B. CHF 25\'800)',
      erklaerung: 'Die Anlage wird zum Bruttopreis als Aktivum erfasst. Gleichzeitig entsteht eine Verbindlichkeit gegenüber dem Lieferanten. Bsp.: Mobiliar / Verb. L+L 25\'800',
    },
    {
      situation: 'Bezugskosten bezahlen (Transport, Installation) — gehören zum Anschaffungswert',
      soll: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      haben: 'Kasse / Bank',
      betrag: 'Transportkosten + Installationskosten (z.B. CHF 780)',
      erklaerung: 'Transport, Zoll und Installation sind direkt zurechenbare Beschaffungskosten und erhöhen den Anschaffungswert. Bsp.: Mobiliar / Kasse 780',
    },
    {
      situation: 'Rabatt vom Lieferanten erhalten — mindert den Anschaffungswert',
      soll: 'Verb. L+L',
      haben: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      betrag: 'Rabattbetrag (z.B. 10% von CHF 25\'800 = CHF 2\'580)',
      erklaerung: 'Rabatte und Skonti mindern den Anschaffungswert. Buchung reduziert sowohl die Verbindlichkeit als auch das Anlagekonto. Bsp.: Verb. L+L / Mobiliar 2\'580. Ergebnis AW: 25\'800 − 2\'580 + 780 = CHF 24\'000',
    },
    {
      situation: 'Rechnung des Lieferanten bezahlen (nach Rabattabzug)',
      soll: 'Verb. L+L',
      haben: 'Bank',
      betrag: 'Rechnungsbetrag minus Rabatt (z.B. 25\'800 − 2\'580 = CHF 23\'220)',
      erklaerung: 'Die verbleibende Verbindlichkeit wird durch Banküberweisung beglichen. Bsp.: Verb. L+L / Bank 23\'220',
    },
    {
      situation: 'Kleiner Betrag unter CHF 1\'000 — direkt als Aufwand buchen (nicht aktivieren)',
      soll: 'Büroaufwand / Unterhalt (o.ä.)',
      haben: 'Kasse / Bank',
      betrag: 'Betrag unter CHF 1\'000',
      erklaerung: 'Gegenstände unter der Aktivierungsgrenze von CHF 1\'000 werden nicht als Anlage aktiviert, sondern sofort vollständig als Aufwand verbucht.',
    },
  ])

  console.log('✓ abschreibungen-methoden: Anschaffungsbuchungen gesetzt')
}

// ══════════════════════════════════════════════════════════════════════════════
// abschreibungen — Abschreibungs- und Verkaufsbuchungen
// ══════════════════════════════════════════════════════════════════════════════
{
  const id = await getChapterId('abschreibungen')
  await clearEntries(id)

  await addEntries(id, [
    // ── Direkte Methode ──────────────────────────────────────────────────────
    {
      situation: 'Jährliche Abschreibung buchen — direkte Methode',
      soll: 'Abschreibungen',
      haben: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      betrag: 'Linear: AW ÷ Nutzungsdauer | Degressiv: Buchwert × Satz %',
      erklaerung: 'Das Anlagekonto wird direkt reduziert. Buchwert = neuer Saldo des Anlagekontos. Der ursprüngliche Anschaffungswert ist danach nicht mehr sichtbar. Bsp. linear: Abschreibungen / Mobiliar 3\'000',
    },
    {
      situation: 'Verkauf einer Anlage (direkte Methode) — Erlös buchen',
      soll: 'Kasse / Bank / Ford. L+L',
      haben: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      betrag: 'Tatsächlicher Verkaufserlös',
      erklaerung: 'Schritt 1 bei direkter Methode: Der Erlös wird gebucht und reduziert gleichzeitig das Anlagekonto auf den Restbetrag (Buchwert − Erlös). Danach folgt Schritt 2.',
    },
    {
      situation: 'Verkauf (direkte Methode) — Verlust buchen wenn Erlös < Buchwert',
      soll: 'A.o. Aufwand',
      haben: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      betrag: 'Buchwert − Verkaufserlös = Verlust (z.B. CHF 15\'000 − 8\'800 = CHF 6\'200)',
      erklaerung: 'Bsp. aus Buch: AW 24\'000, 3 Jahre linear à 3\'000 → BW 15\'000. Barverkauf CHF 8\'800 → Verlust CHF 6\'200. Buchungen: (1) Kasse / Mobiliar 8\'800 | (2) A.o. Aufwand / Mobiliar 6\'200',
    },
    {
      situation: 'Verkauf (direkte Methode) — Gewinn buchen wenn Erlös > Buchwert',
      soll: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      haben: 'A.o. Ertrag',
      betrag: 'Verkaufserlös − Buchwert = Gewinn',
      erklaerung: 'Wenn der Erlös über dem Buchwert liegt, wurde zu viel abgeschrieben. Die Differenz ist ein ausserordentlicher Ertrag. Buchungen: (1) Kasse / Mobiliar [Erlös] | (2) Mobiliar / A.o. Ertrag [Gewinn]',
    },

    // ── Indirekte Methode ────────────────────────────────────────────────────
    {
      situation: 'Jährliche Abschreibung buchen — indirekte Methode',
      soll: 'Abschreibungen',
      haben: 'WB Mobiliar (oder WB Fahrzeuge / WB Maschinen)',
      betrag: 'Linear: AW ÷ Nutzungsdauer | Degressiv: Buchwert × Satz %',
      erklaerung: 'Das Anlagekonto bleibt auf dem Anschaffungswert. Das WB-Konto sammelt alle Abschreibungen. In der Bilanz: Mobiliar − WB Mobiliar = Buchwert. Bsp.: Abschreibungen / WB Mobiliar 3\'000',
    },
    {
      situation: 'Verkauf (indirekte Methode) — Schritt 1: Erlös buchen',
      soll: 'Kasse / Bank / Ford. L+L',
      haben: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      betrag: 'Tatsächlicher Verkaufserlös (z.B. CHF 10\'500)',
      erklaerung: 'Bsp. aus Buch: AW 24\'000, 5 Jahre linear à 3\'000 → Total-WB 15\'000, BW 9\'000. Erlös CHF 10\'500 → Gewinn CHF 1\'500. Schritt 1: Kasse / Mobiliar 10\'500',
    },
    {
      situation: 'Verkauf (indirekte Methode) — Schritt 2: Wertberichtigung auflösen',
      soll: 'WB Mobiliar (oder WB Fahrzeuge / WB Maschinen)',
      haben: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      betrag: 'Totalabschreibungen (kumulierter WB-Saldo, z.B. CHF 15\'000)',
      erklaerung: 'Die bisher kumulierten Abschreibungen werden vom WB-Konto auf das Anlagekonto übertragen, damit das Anlagekonto auf den Buchwert gebracht wird. Schritt 2: WB Mobiliar / Mobiliar 15\'000',
    },
    {
      situation: 'Verkauf (indirekte Methode) — Schritt 3: Gewinn buchen wenn Erlös > Buchwert',
      soll: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      haben: 'A.o. Ertrag',
      betrag: 'Verkaufserlös − Buchwert = Gewinn (z.B. CHF 10\'500 − 9\'000 = CHF 1\'500)',
      erklaerung: 'Schritt 3: Mobiliar / A.o. Ertrag 1\'500. Danach sind sowohl Mobiliar als auch WB Mobiliar vollständig bereinigt (Saldo = 0).',
    },
    {
      situation: 'Verkauf (indirekte Methode) — Schritt 3: Verlust buchen wenn Erlös < Buchwert',
      soll: 'A.o. Aufwand',
      haben: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      betrag: 'Buchwert − Verkaufserlös = Verlust',
      erklaerung: 'Wenn der Erlös unter dem Buchwert liegt, wurde zu wenig abgeschrieben. Der Differenzbetrag ist ein ausserordentlicher Aufwand. Schritt 3: A.o. Aufwand / Mobiliar [Verlust]',
    },
  ])

  console.log('✓ abschreibungen: Abschreibungs- und Verkaufsbuchungen gesetzt')
}

await client.end()
console.log('\n✅ Alle Buchungssätze Abschreibungen aktualisiert')
