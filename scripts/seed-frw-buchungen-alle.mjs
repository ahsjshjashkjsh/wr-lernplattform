import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const DB = "postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
const client = new Client({ connectionString: DB })
await client.connect()
const id = () => randomUUID()

async function getFirstChapterId(topicSlug) {
  const r = await client.query(
    `SELECT c.id FROM "Chapter" c
     JOIN "Topic" t ON t.id = c."topicId"
     WHERE t.slug = $1 ORDER BY c."order" ASC LIMIT 1`,
    [topicSlug]
  )
  return r.rows[0]?.id
}

async function addBookings(chId, entries) {
  await client.query(`DELETE FROM "BookingEntry" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    await client.query(
      `INSERT INTO "BookingEntry" (id,situation,"sollKonto","habenKonto","betragHint",erklaerung,"chapterId","order")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id(), e.s, e.soll, e.haben, e.betrag ?? null, e.erk, chId, i + 1]
    )
  }
  console.log(`  ✓ ${entries.length} Buchungssätze eingefügt`)
}

// ══════════════════════════════════════════════════════
// BILANZ, ERFOLGSRECHNUNG, GRUNDLAGEN (Band 1)
// ══════════════════════════════════════════════════════
for (const slug of ['frw-bilanz-erfolgsrechnung', 'frw-band1-grundlagen', 'frw-grundlagen']) {
  const chId = await getFirstChapterId(slug)
  if (!chId) { console.log(`SKIP ${slug}: kein Kapitel`); continue }
  console.log(`\n${slug}`)
  await addBookings(chId, [
    { s: 'Kapitaleinlage der Inhaberin',          soll: 'Bank',              haben: 'Eigenkapital',          erk: 'Eigentümerin legt privates Kapital ins Unternehmen ein → Bank (Aktiv ↑), Eigenkapital (Passiv ↑).' },
    { s: 'Kauf Mobiliar auf Rechnung',            soll: 'Mobiliar',          haben: 'Verbindlichkeiten L+L',  erk: 'Anlagegut zugegangen (Aktiv ↑), Zahlungsverpflichtung entstanden (Passiv ↑).' },
    { s: 'Bezahlung der Lieferantenrechnung',     soll: 'Verbindlichkeiten L+L', haben: 'Bank',               erk: 'Schuld gegenüber Lieferant beglichen (Passiv ↓), Bank nimmt ab (Aktiv ↓).' },
    { s: 'Rechnung an Kunden (Dienstleistung)',   soll: 'Forderungen L+L',   haben: 'Honorarertrag',          erk: 'Ertrag sofort erfasst (Haben), Guthaben gegenüber Kunde entsteht (Aktiv ↑).' },
    { s: 'Zahlungseingang vom Kunden',            soll: 'Bank',              haben: 'Forderungen L+L',        erk: 'Forderung erlischt (Aktiv ↓), Bank erhöht sich (Aktiv ↑). Erfolgsunwirksam.' },
    { s: 'Lohnzahlung per Bank',                  soll: 'Lohnaufwand',       haben: 'Bank',                   erk: 'Aufwand erfolgswirksam (Soll), Bank nimmt ab. Lohnaufwand mindert den Gewinn.' },
    { s: 'Privatentnahme der Inhaberin',          soll: 'Eigenkapital',      haben: 'Bank',                   erk: 'Inhaberin entnimmt privat → Eigenkapital sinkt, Bank sinkt. Erfolgsunwirksam.' },
    { s: 'Kauf Büromaterial bar (Aufwand)',       soll: 'Verwaltungsaufwand', haben: 'Kasse',                 erk: 'Sofortiger Aufwand (kein Aktivum, da Verbrauch direkt). Kasse nimmt ab.' },
    { s: 'Gewinnverbuchung Jahresabschluss',      soll: 'Jahresgewinn',      haben: 'Eigenkapital',           erk: 'Reingewinn wird dem Eigenkapital gutgeschrieben → EK steigt (Schlussbilanz II).' },
    { s: 'Verlustverbuchung Jahresabschluss',     soll: 'Eigenkapital',      haben: 'Jahresverlust',          erk: 'Reinverlust wird vom Eigenkapital abgezogen → EK sinkt.' },
  ])
}

// ══════════════════════════════════════════════════════
// WARENKONTEN (alle Slugs mit 0 Buchungen)
// ══════════════════════════════════════════════════════
for (const slug of ['frw-warenkonten', 'frw-band1-warenkonten']) {
  const chId = await getFirstChapterId(slug)
  if (!chId) { console.log(`SKIP ${slug}`); continue }
  console.log(`\n${slug}`)
  await addBookings(chId, [
    { s: 'Wareneinkauf auf Rechnung',             soll: 'Warenaufwand',      haben: 'Verbindlichkeiten L+L',  erk: 'Einstandspreis der Ware direkt als Aufwand erfasst (Aufwandsmethode). Schuld gegenüber Lieferant entsteht.' },
    { s: 'Skonto beim Einkauf (2%)',              soll: 'Verbindlichkeiten L+L', haben: 'Warenaufwand',        erk: 'Skonto reduziert den Warenaufwand (Haben) und die Verbindlichkeit (Soll). Keine separaten Skonto-Konten.' },
    { s: 'Bezugskosten bar (Transportspesen)',    soll: 'Warenaufwand',      haben: 'Kasse',                  erk: 'Bezugskosten sind Teil des Einstandspreises → direkt zu Warenaufwand.' },
    { s: 'Warenrücksendung an Lieferant',         soll: 'Verbindlichkeiten L+L', haben: 'Warenaufwand',        erk: 'Zurückgesendete Ware: Aufwand sinkt (Haben), Schuld sinkt (Soll).' },
    { s: 'Bezahlung Lieferant per Bank',          soll: 'Verbindlichkeiten L+L', haben: 'Bank',                erk: 'Überweisung an Lieferant. Schuld erlischt, Bank nimmt ab.' },
    { s: 'Warenverkauf auf Rechnung',             soll: 'Forderungen L+L',   haben: 'Warenerlöse',            erk: 'Ertrag beim Verkauf sofort erfasst. Forderung gegenüber Kunden entsteht.' },
    { s: 'Skonto beim Verkauf (2%)',              soll: 'Warenerlöse',       haben: 'Forderungen L+L',         erk: 'Skonto des Kunden mindert Umsatz (Soll auf Ertragskonto) und die Forderung.' },
    { s: 'Retoure vom Kunden',                    soll: 'Warenerlöse',       haben: 'Forderungen L+L',         erk: 'Zurückgenommene Ware: Erlös sinkt (Soll), Forderung sinkt (Haben).' },
    { s: 'Zahlungseingang vom Kunden',            soll: 'Bank',              haben: 'Forderungen L+L',         erk: 'Bankgutschrift aus Kundenzahlung. Forderung erlischt.' },
    { s: 'Inventur: Lagerzunahme',                soll: 'Warenvorrat',       haben: 'Warenaufwand',            erk: 'Schlussbestand > Anfangsbestand → Korrektur: Aufwand wird reduziert, Lager aktiviert.' },
    { s: 'Inventur: Lagerabnahme',                soll: 'Warenaufwand',      haben: 'Warenvorrat',             erk: 'Schlussbestand < Anfangsbestand → Lager nimmt ab (Haben), Aufwand steigt (Soll).' },
  ])
}

// ══════════════════════════════════════════════════════
// MWST GRUNDLAGEN
// ══════════════════════════════════════════════════════
for (const slug of ['frw-mehrwertsteuer', 'frw-band1-mwst']) {
  const chId = await getFirstChapterId(slug)
  if (!chId) { console.log(`SKIP ${slug}`); continue }
  console.log(`\n${slug}`)
  await addBookings(chId, [
    { s: 'Wareneinkauf (Nettomethode, inkl. Vorsteuer)', soll: 'Warenaufwand', haben: 'Verbindlichkeiten L+L', betrag: 'CHF 100\'000 netto', erk: 'Nettobetrag als Aufwand. Vorsteuer separat auf Konto 1170 Vorsteuer.' },
    { s: 'Vorsteuer 8.1% auf Einkauf',             soll: 'Vorsteuer (1170)',  haben: 'Verbindlichkeiten L+L', betrag: 'CHF 8\'100',         erk: 'Vorsteuer = bezahlte MWST auf Einkäufe. Guthaben gegenüber Bund → Aktivkonto.' },
    { s: 'Bezahlung Lieferant (netto + MWST)',      soll: 'Verbindlichkeiten L+L', haben: 'Bank',               betrag: 'CHF 108\'100',       erk: 'Gesamte Verbindlichkeit (netto + Vorsteuer) wird überwiesen.' },
    { s: 'Warenverkauf (Nettomethode, inkl. MWST)', soll: 'Forderungen L+L',  haben: 'Warenerlöse',            betrag: 'CHF 200\'000 netto', erk: 'Nettoerlös als Ertrag gebucht. MWST-Schuld separat auf Konto 2200.' },
    { s: 'MWST-Schuld 8.1% auf Verkauf',           soll: 'Forderungen L+L',  haben: 'MWST-Verbindlichkeit (2200)', betrag: 'CHF 16\'200',   erk: 'Geschuldete MWST auf Umsätze → Passivkonto 2200 MWST-Verbindlichkeit.' },
    { s: 'Zahlungseingang Kunde',                   soll: 'Bank',             haben: 'Forderungen L+L',         betrag: 'CHF 216\'200',       erk: 'Kunde bezahlt Bruttobetrag (netto + MWST). Forderung erlischt.' },
    { s: 'MWST-Abrechnung: Vorsteuer verrechnen',  soll: 'MWST-Verbindlichkeit (2200)', haben: 'Vorsteuer (1170)', betrag: 'CHF 8\'100',     erk: 'Vorsteuer (Guthaben) wird gegen MWST-Schuld verrechnet.' },
    { s: 'Restzahlung MWST an Bund',               soll: 'MWST-Verbindlichkeit (2200)', haben: 'Bank',            betrag: 'CHF 8\'100',       erk: 'Verbleibende MWST-Schuld (16\'200 − 8\'100) wird an Bund überwiesen.' },
  ])
}

// ══════════════════════════════════════════════════════
// MWST VERTIEFUNG
// ══════════════════════════════════════════════════════
{
  const chId = await getFirstChapterId('frw-mwst-vertiefung')
  if (chId) {
    console.log('\nfrw-mwst-vertiefung')
    await addBookings(chId, [
      { s: 'Einkauf netto (8.1%)',                 soll: 'Warenaufwand',      haben: 'Verbindlichkeiten L+L', betrag: 'CHF 180\'000',  erk: 'Nettoaufwand ohne MWST. Vorsteuer wird separat aktiviert.' },
      { s: 'Vorsteuer auf Einkauf',                soll: 'Vorsteuer (1170)',  haben: 'Verbindlichkeiten L+L', betrag: 'CHF 14\'580',   erk: 'Vorsteuer 8.1% = Guthaben gegenüber Bund auf Konto 1170.' },
      { s: 'Skonto beim Einkauf (2%)',             soll: 'Verbindlichkeiten L+L', haben: 'Warenaufwand',       betrag: 'CHF 3\'600',    erk: 'Skonto reduziert Warenaufwand. Vorsteuer auf Skonto muss korrigiert werden.' },
      { s: 'Vorsteuerkorrektur auf Skonto',        soll: 'Verbindlichkeiten L+L', haben: 'Vorsteuer (1170)',   betrag: 'CHF 291.60',    erk: '8.1% auf CHF 3\'600 Skonto → Vorsteuer-Guthaben wird reduziert.' },
      { s: 'Bezahlung Lieferant',                  soll: 'Verbindlichkeiten L+L', haben: 'Bank',               betrag: 'CHF 190\'688.40', erk: 'Bruttobetrag abzüglich Skonto.' },
      { s: 'Verkauf netto (8.1%)',                 soll: 'Forderungen L+L',   haben: 'Warenerlöse',            betrag: 'CHF 400\'000',  erk: 'Nettoerlös ohne MWST. MWST-Schuld separat.' },
      { s: 'MWST auf Verkauf',                     soll: 'Forderungen L+L',   haben: 'MWST-Verbindlichkeit (2200)', betrag: 'CHF 32\'400', erk: '8.1% auf CHF 400\'000 Umsatz = geschuldete MWST.' },
      { s: 'Rabatt beim Verkauf (10%)',            soll: 'Warenerlöse',       haben: 'Forderungen L+L',         betrag: 'CHF 40\'000',   erk: 'Rabatt vermindert Erlös (Soll auf Ertragskonto) und Forderung.' },
      { s: 'MWST-Korrektur auf Rabatt',           soll: 'MWST-Verbindlichkeit (2200)', haben: 'Forderungen L+L', betrag: 'CHF 3\'240',  erk: '8.1% auf CHF 40\'000 Rabatt → MWST-Schuld sinkt.' },
      { s: 'Zahlungseingang Kunde',                soll: 'Bank',              haben: 'Forderungen L+L',         betrag: 'CHF 389\'160',  erk: 'Nach Rabatt und MWST-Korrektur erhaltener Betrag.' },
      { s: 'MWST-Abrechnung (Verrechnung)',        soll: 'MWST-Verbindlichkeit (2200)', haben: 'Vorsteuer (1170)', betrag: 'CHF 14\'288.40', erk: 'Vorsteuer-Guthaben wird mit MWST-Schuld verrechnet.' },
      { s: 'Restzahlung MWST an Bund',             soll: 'MWST-Verbindlichkeit (2200)', haben: 'Bank',             betrag: 'CHF 14\'871.60', erk: 'Verbleibende MWST-Schuld nach Vorsteuer-Verrechnung.' },
      { s: 'Forderungsverlust (MWST-bereinigt)',   soll: 'Verluste aus Forderungen', haben: 'Forderungen L+L', betrag: 'Nettobetrag',   erk: 'Verlust ohne MWST: Nettobetrag als Aufwand.' },
      { s: 'MWST-Rückforderung bei Verlust',       soll: 'MWST-Verbindlichkeit (2200)', haben: 'Forderungen L+L', betrag: '8.1% des Netto', erk: 'MWST auf uneinbringliche Forderung kann zurückgefordert werden.' },
    ])
  }
}

// ══════════════════════════════════════════════════════
// VERRECHNUNGSSTEUER (VST)
// ══════════════════════════════════════════════════════
for (const slug of ['frw-verrechnungssteuer', 'frw-band1-vst']) {
  const chId = await getFirstChapterId(slug)
  if (!chId) { console.log(`SKIP ${slug}`); continue }
  console.log(`\n${slug}`)
  await addBookings(chId, [
    { s: 'Zinsgutschrift Bank (netto, 65%)',       soll: 'Bank',              haben: 'Finanzertrag',           betrag: 'CHF 650',       erk: 'Bank schreibt Nettozins gut (100% − 35% VST = 65%). Ertrag sofort erfasst.' },
    { s: 'VST-Guthaben auf Zinsen (35%)',          soll: 'Forderung VST',     haben: 'Finanzertrag',           betrag: 'CHF 350',       erk: 'Die 35% VST, die die Bank abgeliefert hat, stehen dem Unternehmen als Guthaben zu.' },
    { s: 'Dividende erhalten (netto, 65%)',        soll: 'Bank',              haben: 'Finanzertrag',           betrag: 'CHF 6\'500',    erk: 'Nettodividende nach Abzug von 35% VST. Ertrag wird brutto erfasst (Guthaben separat).' },
    { s: 'VST-Guthaben auf Dividende (35%)',       soll: 'Forderung VST',     haben: 'Finanzertrag',           betrag: 'CHF 3\'500',    erk: '35% VST auf Bruttodividende → Guthaben gegenüber Eidgenossenschaft.' },
    { s: 'VST-Rückerstattung durch Bund',          soll: 'Bank',              haben: 'Forderung VST',          betrag: 'CHF 3\'850',    erk: 'Der Bund erstattet die gesamte VST (Zinsen + Dividenden). Forderung erlischt.' },
    { s: 'VST nicht rückforderbar (Aufwand)',      soll: 'Finanzaufwand',     haben: 'Forderung VST',          erk: 'Falls VST nicht rückgefordert werden kann (z.B. Privatperson), wird sie als Aufwand gebucht.' },
  ])
}

// ══════════════════════════════════════════════════════
// FREMDE WÄHRUNGEN
// ══════════════════════════════════════════════════════
{
  const chId = await getFirstChapterId('frw-fremde-waehrungen')
  if (chId) {
    console.log('\nfrw-fremde-waehrungen')
    await addBookings(chId, [
      { s: 'Wareneinkauf in USD (Buchungskurs)',    soll: 'Warenaufwand',      haben: 'Verbindlichkeiten L+L', betrag: 'USD→CHF Kurs',   erk: 'Verbindlichkeit wird zum Tageskurs in CHF umgerechnet und gebucht.' },
      { s: 'Zahlung Lieferant: Kursgewinn',        soll: 'Verbindlichkeiten L+L', haben: 'Bank',               erk: 'CHF-Betrag bei Zahlung < CHF bei Buchung → Kursgewinn: Differenz auf Verbindlichkeiten L+L.' },
      { s: 'Kursgewinn (gesondert buchen)',         soll: 'Verbindlichkeiten L+L', haben: 'Kursdifferenzen (Ertrag)', erk: 'Kursgewinn = Fremdwährung ist günstiger geworden (Verbindlichkeit sinkt in CHF).' },
      { s: 'Zahlung Lieferant: Kursverlust',       soll: 'Verbindlichkeiten L+L', haben: 'Bank',               erk: 'CHF-Betrag bei Zahlung > CHF bei Buchung → Kursverlust entsteht.' },
      { s: 'Kursverlust (gesondert buchen)',        soll: 'Kursdifferenzen (Aufwand)', haben: 'Verbindlichkeiten L+L', erk: 'Fremdwährung ist teurer geworden → Mehraufwand als Kursverlust erfasst.' },
      { s: 'Warenverkauf in EUR (Buchungskurs)',    soll: 'Forderungen L+L',   haben: 'Warenerlöse',            betrag: 'EUR→CHF Kurs',   erk: 'Forderung in Fremdwährung zum Tageskurs in CHF bewertet.' },
      { s: 'Zahlungseingang EUR: Kursgewinn',      soll: 'Bank',              haben: 'Forderungen L+L',         erk: 'EUR stärker als bei Buchung → Kursgewinn auf Forderung.' },
      { s: 'Kursgewinn auf Forderung',             soll: 'Forderungen L+L',   haben: 'Kursdifferenzen (Ertrag)', erk: 'Fremdwährungsforderung gestiegen in CHF → Kursgewinn (Ertrag).' },
      { s: 'Zahlungseingang EUR: Kursverlust',     soll: 'Bank',              haben: 'Forderungen L+L',         erk: 'EUR schwächer als bei Buchung → Kursverlust auf Forderung.' },
      { s: 'Kursverlust auf Forderung',            soll: 'Kursdifferenzen (Aufwand)', haben: 'Forderungen L+L', erk: 'Fremdwährungsforderung in CHF gesunken → Kursverlust (Aufwand).' },
      { s: 'Jahresabschluss: Verbindlichkeit höher bewertet', soll: 'Kursdifferenzen (Aufwand)', haben: 'Verbindlichkeiten L+L', erk: 'Bilanzierungskurs > Buchungskurs → Verbindlichkeit steigt → vorsichtsprinzip (Mehraufwand).' },
      { s: 'Jahresabschluss: Forderung tiefer bewertet', soll: 'Kursdifferenzen (Aufwand)', haben: 'Forderungen L+L', erk: 'Bilanzierungskurs < Buchungskurs → Forderung sinkt → Vorsichtsprinzip (Wertberichtigung).' },
    ])
  }
}

// ══════════════════════════════════════════════════════
// WERTSCHRIFTEN
// ══════════════════════════════════════════════════════
{
  const chId = await getFirstChapterId('frw-wertschriften')
  if (chId) {
    console.log('\nfrw-wertschriften')
    await addBookings(chId, [
      { s: 'Aktienkauf (inkl. Kaufspesen)',         soll: 'Wertschriften',     haben: 'Bank',                   betrag: 'CHF 30\'350',   erk: 'Aktien aktiviert zu Anschaffungskosten (Kurs + Provision + Stempel).' },
      { s: 'Aktienverkauf mit Kursgewinn',          soll: 'Bank',              haben: 'Wertschriften',           betrag: 'Verkaufserlös', erk: 'Erlös > Buchwert → Differenz = Finanzertrag (Kursgewinn). Bank steigt, Wertschrift sinkt.' },
      { s: 'Kursgewinn aus Aktienverkauf',          soll: 'Bank',              haben: 'Finanzertrag',            erk: 'Realisierter Kursgewinn: Differenz Verkaufserlös minus Buchwert wird als Finanzertrag erfasst.' },
      { s: 'Aktienverkauf mit Kursverlust',         soll: 'Bank',              haben: 'Wertschriften',           betrag: 'Verkaufserlös', erk: 'Erlös < Buchwert → Differenz = Finanzaufwand (Kursverlust).' },
      { s: 'Kursverlust aus Aktienverkauf',         soll: 'Finanzaufwand',     haben: 'Wertschriften',           erk: 'Differenz (Buchwert − Erlös) wird als Finanzaufwand gebucht.' },
      { s: 'Dividende netto erhalten (65%)',        soll: 'Bank',              haben: 'Finanzertrag',            betrag: 'CHF 650',       erk: 'Nettodividende = 65% der Bruttodividende. Ertrag brutto erfassen mit separatem VST-Guthaben.' },
      { s: 'VST auf Dividende (35%)',               soll: 'Forderung VST',     haben: 'Finanzertrag',            betrag: 'CHF 350',       erk: '35% VST wird vom Emittenten abgeliefert. Rückforderungsanspruch auf Konto Forderung VST.' },
      { s: 'Obligationenzins netto (65%)',          soll: 'Bank',              haben: 'Finanzertrag',            betrag: 'CHF 1\'300',    erk: 'Nettocoupon nach 35% VST-Abzug. Bruttoertrag wird über VST-Konto vollständig erfasst.' },
      { s: 'VST auf Obligationenzins (35%)',        soll: 'Forderung VST',     haben: 'Finanzertrag',            betrag: 'CHF 700',       erk: 'VST auf Zins → Forderung gegenüber Bund.' },
      { s: 'Depotgebühren Bank',                    soll: 'Finanzaufwand',     haben: 'Bank',                    betrag: 'CHF 120',       erk: 'Verwahrungsgebühren für Depot → Finanzaufwand (nicht aktivierbar).' },
      { s: 'Jahresabschluss: Höherbewertung',       soll: 'Wertschriften',     haben: 'Finanzertrag',            erk: 'Börsenkurs > Buchwert → Aufwertung zulässig (Höchstwertprinzip nach OR). Unrealisierter Gewinn.' },
      { s: 'Jahresabschluss: Tieferbewertung',      soll: 'Finanzaufwand',     haben: 'Wertschriften',           erk: 'Börsenkurs < Buchwert → Pflicht zur Abwertung (Niederstwertprinzip). Unrealisierter Verlust.' },
    ])
  }
}

// ══════════════════════════════════════════════════════
// IMMOBILIEN / LIEGENSCHAFTEN
// ══════════════════════════════════════════════════════
{
  const chId = await getFirstChapterId('frw-immobilien')
  if (chId) {
    console.log('\nfrw-immobilien')
    await addBookings(chId, [
      { s: 'Kauf Liegenschaft: Hypothekenübernahme', soll: 'Immobilien',      haben: 'Hypotheken',              betrag: 'CHF 600\'000',  erk: 'Liegenschaft wird aktiviert. Übernommene Hypothek als langfristige Schuld passiviert.' },
      { s: 'Kauf Liegenschaft: Restbetrag Bank',    soll: 'Immobilien',        haben: 'Bank',                    betrag: 'CHF 200\'000',  erk: 'Restlicher Kaufpreis (über Hypothek hinaus) wird bar bezahlt.' },
      { s: 'Hypothekarzins',                        soll: 'Liegenschaftsaufwand', haben: 'Bank',                 betrag: 'CHF 9\'000',    erk: 'Jährlicher Zinsdienst auf Hypothek → Liegenschaftsaufwand (Aufwand).' },
      { s: 'Unterhaltskosten Liegenschaft',         soll: 'Liegenschaftsaufwand', haben: 'Bank',                 erk: 'Reparaturen und laufende Wartung → Sofortaufwand (nicht aktivierbar).' },
      { s: 'Mieteinnahmen von Dritten',             soll: 'Bank',              haben: 'Liegenschaftsertrag',     erk: 'Vermietet an Dritte → Mietertrag. Bank erhöht sich.' },
      { s: 'Eigengebrauch: Mietwertverrechnung',    soll: 'Raumaufwand',       haben: 'Liegenschaftsertrag',     erk: 'Selbst genutzter Teil: kalkulatorischer Mietwert als Raumaufwand und Liegenschaftsertrag gegengebucht.' },
      { s: 'Abschreibung Gebäude (linear)',         soll: 'Abschreibungen',    haben: 'Immobilien',              betrag: 'CHF 8\'000',    erk: 'Gebäude (nicht Boden) wird abgeschrieben. Buchwert sinkt planmässig.' },
      { s: 'Verkauf Liegenschaft: Buchgewinn',      soll: 'Bank',              haben: 'Immobilien',              betrag: 'Verkaufspreis',  erk: 'Erlös > Buchwert → Differenz = Buchgewinn (Finanzertrag oder ausserordentlicher Ertrag).' },
      { s: 'Buchgewinn aus Liegenschaftsverkauf',   soll: 'Bank',              haben: 'Finanzertrag',            erk: 'Realisierter Buchgewinn: Verkaufspreis minus Buchwert.' },
      { s: 'Verkauf Liegenschaft: Buchverlust',     soll: 'Finanzaufwand',     haben: 'Immobilien',              erk: 'Erlös < Buchwert → Buchverlust als Finanzaufwand.' },
    ])
  }
}

// ══════════════════════════════════════════════════════
// STILLE RESERVEN & BEWERTUNGSVORSCHRIFTEN (Vertiefung)
// ══════════════════════════════════════════════════════
{
  const chId = await getFirstChapterId('frw-stille-reserven-vertiefung')
  if (chId) {
    console.log('\nfrw-stille-reserven-vertiefung')
    await addBookings(chId, [
      { s: 'Bildung stille Reserve (Mehr-Abschreibung)', soll: 'Abschreibungen', haben: 'Maschinen',            betrag: 'CHF 10\'000 extra', erk: 'Planmässige + extra Abschreibung → Buchwert sinkt unter wirtschaftlichen Wert. Stille Reserve entsteht.' },
      { s: 'Auflösung stille Reserve (Weniger-Abschreibung)', soll: 'Abschreibungen', haben: 'Maschinen',       betrag: 'CHF 5\'000 weniger', erk: 'Tiefere Abschreibung als normal → Buchwert steigt implizit. Stille Reserve teilweise aufgelöst.' },
      { s: 'Bildung stille Reserve im Lager (Unterbewertung)', soll: 'Warenaufwand', haben: 'Warenvorrat',      erk: 'Lagerbestand unter echtem Wert bilanziert → Aufwand erhöht, stille Reserve im Umlaufvermögen.' },
      { s: 'Auflösung Lagerreserve (Höherbewertung)', soll: 'Warenvorrat',    haben: 'Warenaufwand',            erk: 'Lager wird höher bewertet → Aufwand sinkt, stille Reserve wird sichtbar.' },
      { s: 'Bildung Rückstellung (Prozessrisiko)',   soll: 'Rückstellungsaufwand', haben: 'Rückstellungen',     betrag: 'CHF 15\'000',   erk: 'Ungewisse Schuld (Prozess, Garantien) → Aufwand erfassen, Rückstellung (Passivum) bilden.' },
      { s: 'Auflösung Rückstellung (nicht benötigt)', soll: 'Rückstellungen', haben: 'Rückstellungsaufwand',    erk: 'Prozess gewonnen → Rückstellung nicht mehr nötig. Ertrag (Haben auf Aufwandskonto).' },
      { s: 'Inanspruchnahme Rückstellung',          soll: 'Rückstellungen',    haben: 'Bank',                   erk: 'Rückgestellter Betrag wird effektiv benötigt (z.B. Urteil). Rückstellung aufgelöst, Bank sinkt.' },
      { s: 'Bilanzbereinigung (Neubewertung aufwärts)', soll: 'Maschinen',    haben: 'Aufwertungsreserve',      erk: 'Bei Neubewertung: Differenz zwischen neuem Wert und Buchwert → Aufwertungsreserve im EK.' },
    ])
  }
}

// ══════════════════════════════════════════════════════
// RECHTSFORMEN (Einzelunternehmung + AG)
// ══════════════════════════════════════════════════════
{
  const chId = await getFirstChapterId('frw-rechtsformen')
  if (chId) {
    console.log('\nfrw-rechtsformen')
    await addBookings(chId, [
      { s: 'Privateinlage (Einzelunternehmung)',    soll: 'Bank',              haben: 'Eigenkapital',            erk: 'Inhaberin legt privates Geld ins Unternehmen. Bank steigt, EK steigt.' },
      { s: 'Privatentnahme bar',                    soll: 'Eigenkapital',      haben: 'Kasse',                   erk: 'Inhaberin entnimmt Bargeld für privaten Bedarf. EK sinkt, Kasse sinkt.' },
      { s: 'Gewinnzuweisung ans EK',                soll: 'Jahresgewinn',      haben: 'Eigenkapital',            erk: 'Jahresgewinn der Einzelunternehmung erhöht das Eigenkapital der Inhaberin.' },
      { s: 'AG-Gründung: Kapitaleinzahlung',        soll: 'Bank',              haben: 'Aktienkapital',           betrag: 'CHF 100\'000',  erk: 'Aktionäre zahlen das Aktienkapital ein → Bank steigt, Aktienkapital (Passiv) entsteht.' },
      { s: 'Gewinnverteilung AG: Dividende',        soll: 'Jahresgewinn',      haben: 'Dividenden',              betrag: 'CHF 20\'000',   erk: 'GV beschliesst Dividende. Jahresgewinn wird zur Verbindlichkeit gegenüber Aktionären.' },
      { s: 'Dividendenausschüttung',                soll: 'Dividenden',        haben: 'Bank',                    betrag: 'CHF 20\'000',   erk: 'Auszahlung der Dividende an Aktionäre. Verbindlichkeit erlischt.' },
      { s: 'Zuweisung zu gesetzlicher Reserve (AG)', soll: 'Jahresgewinn',    haben: 'Gesetzliche Reserve',      betrag: '5% des Gewinns', erk: 'OR verlangt Zuweisung von 5% des Gewinns bis die Reserve 20% des AK erreicht.' },
      { s: 'GmbH-Gründung: Stammkapitaleinzahlung', soll: 'Bank',             haben: 'Stammkapital',             betrag: 'CHF 20\'000',   erk: 'Gesellschafter zahlen Stammkapital ein (Mindestkapital CHF 20\'000).' },
    ])
  }
}

// ══════════════════════════════════════════════════════
// GELDFLUSSRECHNUNG (Grundbuchungen)
// ══════════════════════════════════════════════════════
{
  const chId = await getFirstChapterId('frw-geldflussrechnung')
  if (chId) {
    console.log('\nfrw-geldflussrechnung')
    await addBookings(chId, [
      { s: 'Barverkauf (betrieblicher Cashflow)',   soll: 'Kasse / Bank',      haben: 'Warenerlöse',             erk: 'Sofortige Zahlung → flüssige Mittel steigen direkt. Betrieblicher Geldfluss (+).' },
      { s: 'Lohnzahlung (betrieblicher Cashflow)',  soll: 'Lohnaufwand',       haben: 'Bank',                    erk: 'Barlohnzahlung → flüssige Mittel sinken direkt. Betrieblicher Geldfluss (−).' },
      { s: 'Maschinenkauf bar (Investition)',       soll: 'Maschinen',         haben: 'Bank',                    betrag: 'CHF 80\'000',   erk: 'Investition in Anlagevermögen → Geldfluss aus Investitionstätigkeit (−).' },
      { s: 'Verkauf Anlage bar (Investition)',      soll: 'Bank',              haben: 'Maschinen',               betrag: 'Buchwert',      erk: 'Desinvestition → Geldfluss aus Investitionstätigkeit (+).' },
      { s: 'Langfristiges Bankdarlehen aufnehmen', soll: 'Bank',               haben: 'Bankdarlehen',            betrag: 'CHF 100\'000',  erk: 'Finanzierungstätigkeit → Mittelzufluss (+). Darlehen steigt (Passiv).' },
      { s: 'Darlehensrückzahlung',                 soll: 'Bankdarlehen',       haben: 'Bank',                    betrag: 'CHF 20\'000',   erk: 'Tilgung → Finanzierungstätigkeit (−). Schuld sinkt.' },
      { s: 'Abschreibung (nicht zahlungswirksam)', soll: 'Abschreibungen',     haben: 'Maschinen',               erk: 'Aufwand ohne Geldfluss → beim indirekten Verfahren zum Reingewinn zurückaddieren.' },
      { s: 'Forderungszunahme (kein Geldfluss)',   soll: 'Forderungen L+L',    haben: 'Warenerlöse',             erk: 'Verkauf auf Rechnung → Ertrag, aber kein Geldeingang. Beim indirekten Verfahren: Forderungszunahme abziehen.' },
    ])
  }
}

// ══════════════════════════════════════════════════════
// ABSCHREIBUNGEN (fehlende chapter)
// ══════════════════════════════════════════════════════
{
  const chId = await getFirstChapterId('frw-abschreibungen')
  if (chId) {
    console.log('\nfrw-abschreibungen (ersten Kapitel)')
    // Prüfe ob dieses Kapitel bereits Buchungen hat
    const r = await client.query(`SELECT COUNT(*) as c FROM "BookingEntry" WHERE "chapterId"=$1`, [chId])
    if (parseInt(r.rows[0].c) === 0) {
      await addBookings(chId, [
        { s: 'Lineare Abschreibung (Fahrzeug)',      soll: 'Abschreibungen',    haben: 'Fahrzeuge',               betrag: 'CHF 10\'000',   erk: 'Gleichmässige Abschreibung über Nutzungsdauer. Buchwert sinkt jährlich um denselben Betrag.' },
        { s: 'Degressive Abschreibung (% vom Buchwert)', soll: 'Abschreibungen', haben: 'Fahrzeuge',              betrag: '25% vom BW',    erk: 'Prozentualer Abzug vom Restbuchwert → höhere Abschreibung in Anfangsjahren.' },
        { s: 'Kauf Maschine auf Rechnung',           soll: 'Maschinen',         haben: 'Verbindlichkeiten L+L',   betrag: 'CHF 50\'000',   erk: 'Anlagegut aktiviert zu Anschaffungskosten. Abschreibung beginnt bei Inbetriebnahme.' },
        { s: 'Abschreibung Maschine (linear 10 J.)', soll: 'Abschreibungen',    haben: 'Maschinen',               betrag: 'CHF 5\'000',    erk: 'CHF 50\'000 / 10 Jahre = CHF 5\'000 p.a. Buchwert nach 10 Jahren = 0.' },
        { s: 'Abschreibung EDV (linear 3 Jahre)',    soll: 'Abschreibungen',    haben: 'EDV / Software',          betrag: 'CHF 3\'000',    erk: 'EDV hat kurze Nutzungsdauer (3 Jahre). CHF 9\'000 / 3 = CHF 3\'000 p.a.' },
        { s: 'Abschreibung Mobiliar',                soll: 'Abschreibungen',    haben: 'Mobiliar',                erk: 'Mobiliar wird planmässig über die Nutzungsdauer abgeschrieben.' },
        { s: 'Ausserplanmässige Abschreibung (Unfall)', soll: 'Abschreibungen', haben: 'Fahrzeuge',               erk: 'Wertminderung durch Schadenereignis → sofortige ausserplanmässige Abschreibung.' },
      ])
    } else {
      console.log('  → hat bereits Buchungen, skip')
    }
  }
}

// ══════════════════════════════════════════════════════
// BEWERTUNGSVORSCHRIFTEN (fehlende chapters)
// ══════════════════════════════════════════════════════
{
  const chId = await getFirstChapterId('frw-bewertungsvorschriften')
  if (chId) {
    const r = await client.query(`SELECT COUNT(*) as c FROM "BookingEntry" WHERE "chapterId"=$1`, [chId])
    if (parseInt(r.rows[0].c) === 0) {
      console.log('\nfrw-bewertungsvorschriften (fehlende chapter)')
      await addBookings(chId, [
        { s: 'Niederstwertprinzip: Lagerabwertung',  soll: 'Warenaufwand',      haben: 'Warenvorrat',             erk: 'Marktpreis < Einstandspreis → Abwertung auf Marktpreis (Niederstwertprinzip, OR 960a).' },
        { s: 'Werterhöhung Lager (in Vorjahren abgewert.)', soll: 'Warenvorrat', haben: 'Warenaufwand',            erk: 'Wenn Marktpreis wieder steigt, darf max. bis Anschaffungskosten zugewertet werden.' },
        { s: 'Pauschalwertberichtigung Forderungen', soll: 'Verluste aus Forderungen', haben: 'WB Forderungen',   erk: 'Generelles Ausfallrisiko auf Debitoren → PWB (Prozentsatz auf Bestand).' },
        { s: 'Ausserplanmässige Abwertung Anlagen',  soll: 'Abschreibungen',    haben: 'Maschinen',               erk: 'Dauerhafte Wertminderung (technisch veraltet) → sofortige Abschreibung.' },
        { s: 'Bildung Rückstellung Prozessrisiko',   soll: 'Rückstellungsaufwand', haben: 'Rückstellungen',       erk: 'Ungewisse aber wahrscheinliche Verpflichtung → Rückstellung (Passivum) bilden.' },
      ])
    }
  }
}

// ══════════════════════════════════════════════════════
// LOEHNE & GEHÄLTER (fehlende 2. chapter)
// ══════════════════════════════════════════════════════
{
  const r = await client.query(`
    SELECT c.id FROM "Chapter" c
    JOIN "Topic" t ON t.id = c."topicId"
    WHERE t.slug = 'frw-loehne-gehaelter'
    ORDER BY c."order" ASC
  `)
  for (const row of r.rows) {
    const cnt = await client.query(`SELECT COUNT(*) as c FROM "BookingEntry" WHERE "chapterId"=$1`, [row.id])
    if (parseInt(cnt.rows[0].c) === 0) {
      console.log('\nfrw-loehne-gehaelter (fehlende chapter)')
      await addBookings(row.id, [
        { s: 'Lohnzahlung an Mitarbeiter',           soll: 'Lohnaufwand',       haben: 'Bank',                    betrag: 'CHF 5\'000',    erk: 'Bruttolohn als Aufwand. Bank nimmt ab.' },
        { s: 'AHV/IV/EO Arbeitgeberanteil',          soll: 'Sozialversicherungsaufwand', haben: 'Bank',            betrag: 'CHF 525',       erk: 'AG-Anteil AHV/IV/EO (ca. 10.5%) → Sozialversicherungsaufwand.' },
        { s: 'AHV/IV/EO Arbeitnehmeranteil (Abzug)', soll: 'Lohnaufwand',       haben: 'Bank',                    betrag: 'CHF −525',      erk: 'AN-Anteil wird vom Lohn abgezogen und gleichzeitig als Gegenbuchung verbucht.' },
        { s: 'Quellensteuer einbehalten',            soll: 'Lohnaufwand',       haben: 'Verbindlichkeiten (Quellensteuern)', erk: 'Arbeitgeber behält Quellensteuer vom Lohn ein und schuldet sie dem Kanton.' },
        { s: 'Quellensteuerablieferung an Kanton',   soll: 'Verbindlichkeiten (Quellensteuern)', haben: 'Bank',    erk: 'Einbehaltene Quellensteuer wird an den Kanton abgeliefert.' },
      ])
      break
    }
  }
}

console.log('\n✅ Alle Buchungssätze erfolgreich eingespeist.')
await client.end()
