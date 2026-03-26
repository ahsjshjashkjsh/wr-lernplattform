import pg from 'pg'
import { randomUUID } from 'crypto'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

async function insertTopic({ slug, title, description, band, order }) {
  const id = randomUUID()
  await client.query(`
    INSERT INTO "Topic" (id, slug, title, description, icon, color, "examType", category, band, "order", published, "createdAt", "updatedAt")
    VALUES ($1,$2,$3,$4,'Calculator','amber','both','frw',$5,$6,true,NOW(),NOW())
  `, [id, slug, title, description, band, order])
  return id
}

async function insertChapter({ topicId, slug, title, subtitle, order }) {
  const id = randomUUID()
  await client.query(`
    INSERT INTO "Chapter" (id, slug, title, subtitle, "topicId", "order", "contentStatus", "createdAt", "updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,'complete',NOW(),NOW())
  `, [id, slug, title, subtitle, topicId, order])
  return id
}

async function insertFormulas(chapterId, formulas) {
  for (let i = 0; i < formulas.length; i++) {
    const f = formulas[i]
    await client.query(
      `INSERT INTO "Formula" (id, name, formel, erklaerung, "chapterId", "order") VALUES ($1,$2,$3,$4,$5,$6)`,
      [randomUUID(), f.name, f.formel, f.erklaerung, chapterId, i]
    )
  }
}

async function insertEntries(chapterId, entries) {
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    await client.query(
      `INSERT INTO "BookingEntry" (id, situation, "sollKonto", "habenKonto", "betragHint", erklaerung, "chapterId", "order") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [randomUUID(), e.situation, e.sollKonto, e.habenKonto, e.betragHint ?? null, e.erklaerung, chapterId, i]
    )
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 2 — FREMDE WÄHRUNGEN
// ══════════════════════════════════════════════════════════════════════════════
{
  const topicId = await insertTopic({
    slug: 'frw-fremde-waehrungen', title: 'Fremde Währungen',
    description: 'Wechselkurse, Kursumrechnung und Kursdifferenzen beim Warenhandel in Fremdwährung.',
    band: '2', order: 20
  })
  const ch1 = await insertChapter({ topicId, slug: 'waehrungsumrechnung', title: 'Währungsumrechnung', subtitle: 'Ankauf, Verkauf, Devisen und Kursberechnung', order: 1 })
  const ch2 = await insertChapter({ topicId, slug: 'fremde-waehrung', title: 'Fremdwährungsbuchungen', subtitle: 'Kursgewinne und Kursverluste verbuchen', order: 2 })

  await insertFormulas(ch1, [
    { name: 'CHF-Betrag berechnen', formel: 'Fremdwährungs-Betrag × Wechselkurs', erklaerung: 'Umrechnung von Fremdwährung in CHF. Kurs = CHF pro 1 Einheit Fremdwährung (oder pro 100 bei kleinwertigen Währungen).' },
    { name: 'Fremdwährungs-Betrag berechnen', formel: 'CHF-Betrag ÷ Wechselkurs', erklaerung: 'Umrechnung von CHF in Fremdwährung.' },
    { name: 'Wechselkurs bestimmen', formel: 'CHF-Betrag ÷ Fremdwährungs-Betrag × 100', erklaerung: 'Bestimmung des Wechselkurses (CHF per 100 Einheiten) wenn CHF-Betrag und Fremdwährungsbetrag bekannt sind.' },
    { name: 'Kursdifferenz (Verlust)', formel: 'Bezahlter CHF-Betrag − Ursprünglich gebuchter CHF-Betrag', erklaerung: 'Positives Ergebnis = Kursverlust (Fremdwährung ist teurer geworden).' },
    { name: 'Kursdifferenz (Gewinn)', formel: 'Ursprünglich gebuchter CHF-Betrag − Bezahlter CHF-Betrag', erklaerung: 'Positives Ergebnis = Kursgewinn (Fremdwährung ist billiger geworden).' },
  ])

  await insertEntries(ch2, [
    { situation: 'Wareneinkauf in Fremdwährung (Lieferant sendet Rechnung in EUR)', sollKonto: 'Warenaufwand', habenKonto: 'Verbindl. aus LuL', betragHint: 'EUR-Betrag × CHF-Kurs am Rechnungsdatum', erklaerung: 'Die Verbindlichkeit wird zum Tageskurs in CHF umgerechnet und gebucht.' },
    { situation: 'Zahlung der EUR-Rechnung — Kurs ist gestiegen (EUR teurer → Kursverlust)', sollKonto: 'Verbindl. aus LuL / Kursverlust Fremdwährung', habenKonto: 'Bank', betragHint: 'Verbindl. zum Buchkurs + Kursverlust = Bankbetrag', erklaerung: 'Da der EUR-Kurs gestiegen ist, muss mehr CHF bezahlt werden. Die Differenz zum gebuchten Betrag ist ein Kursverlust.' },
    { situation: 'Zahlung der EUR-Rechnung — Kurs ist gesunken (EUR billiger → Kursgewinn)', sollKonto: 'Verbindl. aus LuL', habenKonto: 'Bank / Kursgewinn Fremdwährung', betragHint: 'Bankbetrag < gebuchte Verbindlichkeit', erklaerung: 'Da der EUR-Kurs gesunken ist, wird weniger CHF bezahlt. Die Differenz ist ein Kursgewinn.' },
    { situation: 'Warenverkauf in Fremdwährung (Kunde erhält Rechnung in EUR)', sollKonto: 'Forderungen aus LuL', habenKonto: 'Warenertrag', betragHint: 'EUR-Betrag × CHF-Kurs am Rechnungsdatum', erklaerung: 'Die Forderung wird zum Tageskurs in CHF umgerechnet und gebucht.' },
    { situation: 'Eingang der EUR-Zahlung — Kurs ist gestiegen (Kursgewinn)', sollKonto: 'Bank', habenKonto: 'Forderungen aus LuL / Kursgewinn Fremdwährung', betragHint: 'Bankeingang > gebuchte Forderung', erklaerung: 'Der Kunde überweist EUR, die nun mehr CHF wert sind als bei Rechnungsstellung. Die Differenz ist ein Kursgewinn.' },
    { situation: 'Eingang der EUR-Zahlung — Kurs ist gesunken (Kursverlust)', sollKonto: 'Bank / Kursverlust Fremdwährung', habenKonto: 'Forderungen aus LuL', betragHint: 'Bankeingang < gebuchte Forderung', erklaerung: 'Der Kunde überweist EUR, die nun weniger CHF wert sind. Die Differenz ist ein Kursverlust.' },
  ])
  console.log('Kap 2 Fremde Währungen ✓')
}

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 3 — VERLUSTE AUS FORDERUNGEN
// ══════════════════════════════════════════════════════════════════════════════
{
  const topicId = await insertTopic({
    slug: 'frw-verluste-forderungen', title: 'Verluste aus Forderungen',
    description: 'Debitorenverluste, Delkredere und Wertberichtigung auf Forderungen.',
    band: '2', order: 30
  })
  const ch1 = await insertChapter({ topicId, slug: 'debitorenverluste', title: 'Debitorenverluste & Delkredere', subtitle: 'Direktabschreibung und Delkredere-Methode', order: 1 })
  const ch2 = await insertChapter({ topicId, slug: 'verluste-forderungen', title: 'Wertberichtigung Forderungen', subtitle: 'Pauschal- und Einzelwertberichtigung', order: 2 })

  await insertFormulas(ch1, [
    { name: 'Delkredere-Bestand (Zielgrösse)', formel: 'Debitorenbestand × Delkredere-Satz %', erklaerung: 'Der Soll-Bestand des Delkredere basiert auf dem Erfahrungssatz für voraussichtliche Ausfälle.' },
    { name: 'Delkredere-Buchungsbetrag (Erhöhung)', formel: 'Soll-Bestand − Ist-Bestand (wenn Soll > Ist)', erklaerung: 'Muss das Delkredere erhöht werden, wird die Differenz als Aufwand gebucht.' },
    { name: 'Delkredere-Buchungsbetrag (Auflösung)', formel: 'Ist-Bestand − Soll-Bestand (wenn Ist > Soll)', erklaerung: 'Ist das Delkredere zu hoch, wird die Differenz als Ertrag aufgelöst.' },
  ])

  await insertEntries(ch1, [
    { situation: 'Forderung direkt abschreiben (Debitor zahlt nicht, kein Delkredere)', sollKonto: 'Debitorenverlust', habenKonto: 'Debitoren', betragHint: 'Ausfallbetrag', erklaerung: 'Direktabschreibung: Der Verlust wird sofort als Debitorenverlust erfasst, die Forderung ausgebucht.' },
    { situation: 'Teilzahlung nach bereits abgeschriebenem Verlust erhalten', sollKonto: 'Bank', habenKonto: 'Debitorenverlust', betragHint: 'Eingegangener Teilbetrag', erklaerung: 'Kommt nach einer Direktabschreibung doch noch Geld, wird der Debitorenverlust entsprechend reduziert.' },
    { situation: 'Delkredere erhöhen (Risiko gestiegen, Soll > Ist)', sollKonto: 'Delkredereaufwand', habenKonto: 'Delkredere', betragHint: 'Soll-Bestand − aktueller Delkredere-Bestand', erklaerung: 'Das Delkredere wird erhöht, um künftige Ausfälle abzudecken. Buchung über Delkredereaufwand.' },
    { situation: 'Delkredere auflösen (Risiko gesunken, Soll < Ist)', sollKonto: 'Delkredere', habenKonto: 'Delkredereertrag', betragHint: 'Aktueller Delkredere-Bestand − Soll-Bestand', erklaerung: 'Das zu hohe Delkredere wird aufgelöst. Der Überschuss gilt als Ertrag.' },
    { situation: 'Forderungsausfall über Delkredere abschreiben', sollKonto: 'Delkredere', habenKonto: 'Debitoren', betragHint: 'Ausfallbetrag (max. Delkredere-Bestand)', erklaerung: 'Ist ein Delkredere vorhanden, wird der Verlust zuerst damit verrechnet — kein separater Verlustausweis.' },
    { situation: 'Forderungsausfall über Delkredere — Betrag grösser als Delkredere', sollKonto: 'Delkredere / Debitorenverlust', habenKonto: 'Debitoren', betragHint: 'Delkredere vollständig + Differenz als Debitorenverlust', erklaerung: 'Übersteigt der Ausfall das Delkredere, wird der Rest direkt als Debitorenverlust ausgewiesen.' },
  ])
  console.log('Kap 3 Verluste aus Forderungen ✓')
}

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 4 — ABSCHREIBUNGEN
// ══════════════════════════════════════════════════════════════════════════════
{
  const topicId = await insertTopic({
    slug: 'frw-abschreibungen', title: 'Abschreibungen',
    description: 'Lineare und degressive Abschreibung auf Sachanlagen — direkte und indirekte Methode.',
    band: '2', order: 40
  })
  const ch1 = await insertChapter({ topicId, slug: 'abschreibungen-methoden', title: 'Abschreibungsmethoden', subtitle: 'Linear, degressiv, direkt und indirekt', order: 1 })
  const ch2 = await insertChapter({ topicId, slug: 'abschreibungen', title: 'Abschreibungen buchen', subtitle: 'Buchung beim Kauf, Abschreibung und Verkauf', order: 2 })

  await insertFormulas(ch1, [
    { name: 'Linearer Abschreibungsbetrag', formel: 'Anschaffungswert ÷ Nutzungsdauer (Jahre)', erklaerung: 'Gleich hohe Abschreibung jedes Jahr. AW wird gleichmässig über die Nutzungsdauer verteilt.' },
    { name: 'Linearer Abschreibungssatz', formel: '100% ÷ Nutzungsdauer', erklaerung: 'z.B. Nutzungsdauer 5 Jahre → 20% pro Jahr.' },
    { name: 'Degressiver Abschreibungsbetrag', formel: 'Restbuchwert × Abschreibungssatz %', erklaerung: 'Abschreibung auf dem aktuellen Buchwert — nimmt jedes Jahr ab. Höhere Abschreibung in frühen Jahren.' },
    { name: 'Restbuchwert (nach Abschreibung)', formel: 'Vorjahres-Buchwert − Jahresabschreibung', erklaerung: 'Buchwert nach Abzug der Jahresabschreibung.' },
    { name: 'Buchgewinn / Buchverlust beim Verkauf', formel: 'Verkaufspreis − Restbuchwert', erklaerung: 'Positiv = Buchgewinn. Negativ = Buchverlust. Basis für Buchungssatz beim Anlageverkauf.' },
  ])

  await insertEntries(ch2, [
    { situation: 'Anlage (Maschine, Fahrzeug, etc.) kaufen', sollKonto: 'Maschinen / Fahrzeuge / Mobilien', habenKonto: 'Bank / Kreditoren', betragHint: 'Anschaffungswert inkl. Nebenkosten', erklaerung: 'Anlage wird zum Anschaffungswert aktiviert (inkl. Transport, Montage, etc.).' },
    { situation: 'Jährliche Abschreibung — direkte Methode', sollKonto: 'Abschreibungen', habenKonto: 'Maschinen / Fahrzeuge', betragHint: 'AW ÷ Nutzungsdauer (linear) oder Buchwert × Satz% (degressiv)', erklaerung: 'Direkte Methode: Der Buchwert der Anlage wird direkt reduziert. Anlage steht in der Bilanz zum Restbuchwert.' },
    { situation: 'Jährliche Abschreibung — indirekte Methode', sollKonto: 'Abschreibungen', habenKonto: 'WBA Maschinen / WBA Fahrzeuge', betragHint: 'Gleicher Betrag wie direkte Methode', erklaerung: 'Indirekte Methode: WBA (Wertberichtigungskonto) wird erhöht. Anlage steht in Bilanz zum Anschaffungswert minus WBA.' },
    { situation: 'Anlage verkaufen mit Buchgewinn (Verkaufspreis > Restbuchwert)', sollKonto: 'Bank', habenKonto: 'Maschinen / Buchgewinn auf Anlagen', betragHint: 'Soll Bank: Verkaufspreis. Haben: Restbuchwert + Buchgewinn', erklaerung: 'Anlage wird ausgebucht (Restbuchwert), Verkaufserlös eingebucht, Buchgewinn als Ertrag erfasst.' },
    { situation: 'Anlage verkaufen mit Buchverlust (Verkaufspreis < Restbuchwert)', sollKonto: 'Bank / Buchverlust auf Anlagen', habenKonto: 'Maschinen', betragHint: 'Soll: Verkaufspreis + Buchverlust. Haben: Restbuchwert', erklaerung: 'Anlage wird ausgebucht, Buchverlust als Aufwand erfasst.' },
    { situation: 'Anlage verkaufen (indirekte Methode) — WBA auflösen', sollKonto: 'WBA Maschinen / Bank', habenKonto: 'Maschinen / Buchgewinn (oder + Buchverlust Soll)', betragHint: 'WBA und Anlagekonto beide ausbuchen, Differenz = Buchgewinn/verlust', erklaerung: 'Bei indirekter Methode muss beim Verkauf zuerst das WBA-Konto mit ausgebucht werden.' },
  ])
  console.log('Kap 4 Abschreibungen ✓')
}

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 5 — ZEITLICHE ABGRENZUNGEN & RÜCKSTELLUNGEN
// ══════════════════════════════════════════════════════════════════════════════
{
  const topicId = await insertTopic({
    slug: 'frw-zeitliche-abgrenzungen', title: 'Zeitliche Abgrenzungen',
    description: 'Transitorische Posten (aktiv/passiv) und Rückstellungen periodengerecht abgrenzen.',
    band: '2', order: 50
  })
  const ch1 = await insertChapter({ topicId, slug: 'transitorische-posten', title: 'Transitorische Posten', subtitle: 'Aktive und passive Rechnungsabgrenzung', order: 1 })
  const ch2 = await insertChapter({ topicId, slug: 'zeitliche-abgrenzungen', title: 'Rückstellungen', subtitle: 'Bildung, Verwendung und Auflösung von Rückstellungen', order: 2 })

  await insertFormulas(ch1, [
    { name: 'Aktiver transitorischer Posten', formel: 'Bezahlter Aufwand − genutzter Aufwand (nächste Periode)', erklaerung: 'Aufwand wurde im laufenden Jahr bezahlt, Leistung wird erst im nächsten Jahr erbracht → Aktivierung als Abgrenzung.' },
    { name: 'Passiver transitorischer Posten', formel: 'Erhaltener Ertrag − verdienter Ertrag (laufendes Jahr)', erklaerung: 'Ertrag wurde im laufenden Jahr kassiert, Leistung wird erst im nächsten Jahr erbracht → Passivierung als Abgrenzung.' },
  ])

  await insertEntries(ch1, [
    { situation: 'Vorauszahlung Versicherungsprämie (Aufwand im Voraus bezahlt → Aktiver TP)', sollKonto: 'Versicherungsaufwand', habenKonto: 'Bank', betragHint: 'Ganzer Jahresbetrag', erklaerung: 'Schritt 1: Prämie bezahlen — der gesamte Betrag gilt als Aufwand.' },
    { situation: 'Jahresabschluss: Abgrenzung des noch nicht verbrauchten Aufwands (Aktiver TP)', sollKonto: 'Aktive Rechnungsabgrenzung (ARA)', habenKonto: 'Versicherungsaufwand', betragHint: 'Anteil nächste Periode (z.B. 4/12 bei 4 Monaten Überhang)', erklaerung: 'Der Anteil, der zum nächsten Jahr gehört, wird auf das Abgrenzungskonto umgebucht. Aufwand dieser Periode sinkt.' },
    { situation: 'Nächste Periode: ARA auflösen (Aufwand wird der richtigen Periode zugeordnet)', sollKonto: 'Versicherungsaufwand', habenKonto: 'Aktive Rechnungsabgrenzung (ARA)', betragHint: 'Gleicher Betrag wie Abgrenzung', erklaerung: 'Zu Beginn der neuen Periode wird die Abgrenzung zurückgebucht — der Aufwand erscheint jetzt in der richtigen Periode.' },
    { situation: 'Vorauszahlung Miete erhalten (Ertrag im Voraus kassiert → Passiver TP)', sollKonto: 'Bank', habenKonto: 'Mietertrag', betragHint: 'Ganzer Betrag', erklaerung: 'Schritt 1: Miete kassieren — der gesamte Betrag gilt zunächst als Ertrag.' },
    { situation: 'Jahresabschluss: Abgrenzung des noch nicht verdienten Ertrags (Passiver TP)', sollKonto: 'Mietertrag', habenKonto: 'Passive Rechnungsabgrenzung (PRA)', betragHint: 'Anteil nächste Periode', erklaerung: 'Der Anteil, der zum nächsten Jahr gehört, wird passiviert. Ertrag dieser Periode sinkt.' },
    { situation: 'Nächste Periode: PRA auflösen', sollKonto: 'Passive Rechnungsabgrenzung (PRA)', habenKonto: 'Mietertrag', betragHint: 'Gleicher Betrag wie Abgrenzung', erklaerung: 'Zu Beginn der neuen Periode wird die Abgrenzung aufgelöst — der Ertrag erscheint in der richtigen Periode.' },
  ])

  await insertEntries(ch2, [
    { situation: 'Rückstellung bilden (z.B. für Garantieleistungen, Prozessrisiken)', sollKonto: 'Garantieaufwand / Rückstellungsaufwand', habenKonto: 'Rückstellungen', betragHint: 'Geschätzter Betrag der Verpflichtung', erklaerung: 'Rückstellungen werden gebildet wenn eine Verbindlichkeit wahrscheinlich ist, aber Betrag oder Zeitpunkt noch unsicher. Aufwand wird in der Periode erfasst, in der das Ereignis eingetreten ist.' },
    { situation: 'Rückstellung verwenden (Garantiefall tritt ein, Kosten entstehen)', sollKonto: 'Rückstellungen', habenKonto: 'Bank / Kreditoren', betragHint: 'Tatsächlich angefallene Kosten', erklaerung: 'Die gebildete Rückstellung wird mit den tatsächlichen Kosten verrechnet. Kein neuer Aufwand entsteht (bereits in Vorperiode gebucht).' },
    { situation: 'Rückstellung auflösen (Risiko hat sich nicht realisiert)', sollKonto: 'Rückstellungen', habenKonto: 'Auflösung Rückstellungen (Ertrag)', betragHint: 'Nicht verwendeter Betrag', erklaerung: 'Wenn das Ereignis nicht eintritt oder geringer ausfällt, wird die überschüssige Rückstellung als Ertrag aufgelöst.' },
  ])
  console.log('Kap 5 Zeitliche Abgrenzungen ✓')
}

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 7 — EINZELUNTERNEHMUNG
// ══════════════════════════════════════════════════════════════════════════════
{
  const topicId = await insertTopic({
    slug: 'frw-rechtsformen', title: 'Rechtsformen',
    description: 'Einzelunternehmung und AG — Gründung, Eigenkapital und Gewinnverteilung.',
    band: '2', order: 70
  })
  const ch1 = await insertChapter({ topicId, slug: 'einzelunternehmung', title: 'Einzelunternehmung', subtitle: 'Eigenkapital, Privatkonto und Jahresabschluss', order: 1 })

  await insertFormulas(ch1, [
    { name: 'Eigenkapital Einzelunternehmung', formel: 'Eigenkapital + Privatkonto (Saldo)', erklaerung: 'Das Eigenkapital einer Einzelunternehmung besteht aus dem eigentlichen EK und dem Saldo des Privatkontos.' },
    { name: 'Eigenkapitalveränderung', formel: 'EK Anfang + Gewinn − Privatbezüge + Privateinlagen = EK Ende', erklaerung: 'Zeigt wie sich das Eigenkapital im Geschäftsjahr verändert hat.' },
  ])

  await insertEntries(ch1, [
    { situation: 'Privatbezug: Inhaber entnimmt Geld für private Zwecke', sollKonto: 'Privat (Privatkonto)', habenKonto: 'Bank / Kasse', betragHint: 'Entnommener Betrag', erklaerung: 'Privatbezüge sind keine Geschäftsausgaben. Sie werden auf dem Privatkonto erfasst und mindern das Eigenkapital.' },
    { situation: 'Privateinlage: Inhaber legt privates Geld in die Firma ein', sollKonto: 'Bank / Kasse', habenKonto: 'Privat (Privatkonto)', betragHint: 'Eingelegter Betrag', erklaerung: 'Privateinlagen erhöhen das Eigenkapital. Werden auf dem Privatkonto auf der Habenseite erfasst.' },
    { situation: 'Warenbezug für privaten Gebrauch (Eigenverbrauch)', sollKonto: 'Privat (Privatkonto)', habenKonto: 'Warenaufwand', betragHint: 'Einkaufspreis der Ware', erklaerung: 'Nimmt der Inhaber Waren für sich selbst, gilt das als Privatbezug. Der Warenaufwand wird reduziert.' },
    { situation: 'Jahresabschluss: Jahresgewinn dem Eigenkapital gutschreiben', sollKonto: 'Jahresgewinn (Erfolgsrechnung)', habenKonto: 'Eigenkapital', betragHint: 'Jahresgewinn laut Erfolgsrechnung', erklaerung: 'Der Gewinn des Jahres wird dem Eigenkapital zugeführt.' },
    { situation: 'Jahresabschluss: Jahresverlust vom Eigenkapital abziehen', sollKonto: 'Eigenkapital', habenKonto: 'Jahresverlust (Erfolgsrechnung)', betragHint: 'Jahresverlust laut Erfolgsrechnung', erklaerung: 'Ein Verlust mindert das Eigenkapital.' },
    { situation: 'Jahresabschluss: Privatkonto abschliessen (Nettobezüge → EK)', sollKonto: 'Eigenkapital', habenKonto: 'Privat (Privatkonto)', betragHint: 'Saldo Privatkonto (bei Soll-Saldo = Nettobezüge)', erklaerung: 'Am Jahresende wird das Privatkonto auf Eigenkapital abgeschlossen. Nettobezüge reduzieren das EK.' },
  ])
  console.log('Kap 7 Einzelunternehmung ✓')
}

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 8 — AKTIENGESELLSCHAFT & GEWINNVERTEILUNG
// ══════════════════════════════════════════════════════════════════════════════
{
  const ch2 = await insertChapter({
    topicId: (await client.query(`SELECT id FROM "Topic" WHERE slug='frw-rechtsformen'`)).rows[0].id,
    slug: 'aktiengesellschaft', title: 'Aktiengesellschaft (AG)', subtitle: 'Gründung, Kapitalstruktur und Gewinnverteilung', order: 2
  })

  await insertFormulas(ch2, [
    { name: 'Aktienkapital', formel: 'Anzahl Aktien × Nennwert pro Aktie', erklaerung: 'Das gezeichnete Aktienkapital ergibt sich aus Anzahl Aktien mal Nominalwert.' },
    { name: 'Dividende pro Aktie', formel: 'Ausgeschütteter Betrag ÷ Anzahl Aktien', erklaerung: 'Betrag der pro Aktie an die Aktionäre ausgeschüttet wird.' },
    { name: 'Gesetzliche Gewinnreserve (Minimum)', formel: '5% des Jahresgewinns (bis max. 20% des Aktienkapitals)', erklaerung: 'Die AG muss mindestens 5% des Jahresgewinns in die gesetzliche Gewinnreserve einlegen, bis diese 20% des Aktienkapitals erreicht.' },
  ])

  await insertEntries(ch2, [
    { situation: 'AG gründen: Aktien werden zu Nennwert ausgegeben', sollKonto: 'Bank', habenKonto: 'Aktienkapital', betragHint: 'Anzahl Aktien × Nennwert', erklaerung: 'Bei Gründung fliesst das Kapital der Aktionäre in die Gesellschaft. Aktienkapital wird im Eigenkapital erfasst.' },
    { situation: 'AG gründen: Aktien über Nennwert ausgegeben (mit Agio)', sollKonto: 'Bank', habenKonto: 'Aktienkapital / Reserven aus Kapitaleinlagen (Agio)', betragHint: 'Bank = Ausgabepreis. Aktienkapital = Nennwert. Agio = Differenz.', erklaerung: 'Das Agio (Aufgeld) ist der Betrag über dem Nennwert. Es fliesst in die Reserven aus Kapitaleinlagen.' },
    { situation: 'Jahresgewinn dem Bilanzgewinn zuweisen', sollKonto: 'Jahresgewinn', habenKonto: 'Bilanzgewinn', betragHint: 'Jahresgewinn laut ER', erklaerung: 'Der Jahresgewinn wird zunächst dem Bilanzgewinn gutgeschrieben, bevor die Generalversammlung über die Verwendung entscheidet.' },
    { situation: 'Gesetzliche Gewinnreserve bilden (5% des Jahresgewinns)', sollKonto: 'Bilanzgewinn', habenKonto: 'Gesetzliche Gewinnreserven', betragHint: 'Min. 5% des Jahresgewinns (bis GR = 20% AK)', erklaerung: 'Pflichtreserve gemäss OR Art. 671. Muss gebildet werden bis die gesetzliche Reserve 20% des Aktienkapitals erreicht.' },
    { situation: 'Freiwillige Reserven bilden', sollKonto: 'Bilanzgewinn', habenKonto: 'Freiwillige Gewinnreserven', betragHint: 'Beschlossener Betrag (GV-Entscheid)', erklaerung: 'Die GV kann beschliessen, einen Teil des Gewinns in freiwillige Reserven einzulegen.' },
    { situation: 'Dividende beschliessen (GV-Entscheid)', sollKonto: 'Bilanzgewinn', habenKonto: 'Dividendenverbindlichkeiten', betragHint: 'Dividende pro Aktie × Anzahl Aktien', erklaerung: 'Die Generalversammlung beschliesst die Dividende. Sie wird zur Verbindlichkeit gegenüber den Aktionären.' },
    { situation: 'Dividende auszahlen', sollKonto: 'Dividendenverbindlichkeiten', habenKonto: 'Bank', betragHint: 'Gleicher Betrag wie beschlossene Dividende', erklaerung: 'Die Dividende wird an die Aktionäre überwiesen. Die Verbindlichkeit wird beglichen.' },
  ])
  console.log('Kap 8 AG & Gewinnverteilung ✓')
}

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 9 — BEWERTUNGSVORSCHRIFTEN & STILLE RESERVEN
// ══════════════════════════════════════════════════════════════════════════════
{
  const topicId = await insertTopic({
    slug: 'frw-bewertungsvorschriften', title: 'Bewertungsvorschriften & Stille Reserven',
    description: 'Gesetzliche Bewertungsvorschriften, Bildung und Auflösung stiller Reserven, Bilanzbereinigung.',
    band: '2', order: 90
  })
  const ch1 = await insertChapter({ topicId, slug: 'stille-reserven', title: 'Stille Reserven', subtitle: 'Bildung, Auflösung und Bilanzbereinigung', order: 1 })
  const ch2 = await insertChapter({ topicId, slug: 'bewertungsvorschriften-vertieft', title: 'Bewertungsvorschriften', subtitle: 'OR-Vorschriften, Unterbewertung und Überbewertung', order: 2 })

  await insertFormulas(ch1, [
    { name: 'Stille Reserven (Betrag)', formel: 'Tatsächlicher Wert − Bilanzieller Wert', erklaerung: 'Stille Reserven entstehen wenn der wahre Wert einer Position höher ist als der Buchwert (Aktiven unterbewertert oder Passiven überbewertet).' },
    { name: 'Bilanzbereinigung (Eigenkapital bereinigt)', formel: 'Ausgewiesenes EK + Stille Reserven (Aktiven) − Stille Lasten', erklaerung: 'Das bereinigte Eigenkapital zeigt den tatsächlichen Wert des Unternehmens.' },
  ])

  await insertEntries(ch1, [
    { situation: 'Stille Reserve bilden: Anlage zu stark abschreiben (Unterbewertung Aktiven)', sollKonto: 'Abschreibungen', habenKonto: 'Maschinen / Fahrzeuge', betragHint: 'Mehr abschreiben als betriebswirtschaftlich nötig', erklaerung: 'Durch überhöhte Abschreibung sinkt der Buchwert unter den tatsächlichen Wert. Die Differenz ist eine stille Reserve.' },
    { situation: 'Stille Reserve bilden: Delkredere zu hoch ansetzen (Überbewertung Passiven)', sollKonto: 'Delkredereaufwand', habenKonto: 'Delkredere', betragHint: 'Höherer Satz als notwendig', erklaerung: 'Ein zu hohes Delkredere (überhöhte Wertberichtigung) stellt eine stille Reserve dar — das Fremdkapital ist zu hoch ausgewiesen.' },
    { situation: 'Stille Reserve auflösen: Anlage wird weniger oder gar nicht abgeschrieben', sollKonto: '— (keine Buchung)', habenKonto: '— (keine Abschreibung)', betragHint: 'Tiefere oder keine Abschreibung im laufenden Jahr', erklaerung: 'Werden stille Reserven aufgelöst, steigt der Gewinn (weniger Aufwand). Keine eigene Buchung — nur tiefere Abschreibung.' },
    { situation: 'Stille Reserve auflösen: Anlagenverkauf über Buchwert (Buchgewinn = Auflösung)', sollKonto: 'Bank', habenKonto: 'Anlage / Buchgewinn', betragHint: 'Buchgewinn = stille Reserve die sich realisiert', erklaerung: 'Wird eine unterbewertete Anlage verkauft, realisiert sich die stille Reserve als Buchgewinn.' },
    { situation: 'Stille Reserve auflösen: Delkredere reduzieren (Ertrag sichtbar)', sollKonto: 'Delkredere', habenKonto: 'Delkredereertrag', betragHint: 'Reduzierter Betrag', erklaerung: 'Ein überhöhtes Delkredere wird auf den notwendigen Betrag gesenkt — der Unterschied erscheint als Ertrag.' },
  ])
  console.log('Kap 9 Bewertungsvorschriften & Stille Reserven ✓')
}

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 11 — BILANZANALYSE & KENNZAHLEN
// ══════════════════════════════════════════════════════════════════════════════
{
  const topicId = await insertTopic({
    slug: 'frw-kennzahlenanalyse', title: 'Kennzahlenanalyse',
    description: 'Analyse von Bilanz und Erfolgsrechnung mit Liquiditäts-, Finanzierungs- und Rentabilitätskennzahlen.',
    band: '2', order: 110
  })
  const ch1 = await insertChapter({ topicId, slug: 'liquiditaet-rentabilitaet', title: 'Liquidität & Rentabilität', subtitle: 'Kennzahlen berechnen und interpretieren', order: 1 })
  const ch2 = await insertChapter({ topicId, slug: 'bilanzanalyse', title: 'Bilanz- und ER-Analyse', subtitle: 'Finanzierungskennzahlen und Jahresvergleich', order: 2 })

  await insertFormulas(ch1, [
    { name: 'Liquidität 1. Grades (Barliquidität)', formel: 'Flüssige Mittel ÷ Kurzfristiges Fremdkapital × 100', erklaerung: 'Zeigt ob kurzfristige Schulden sofort mit Bargeld/Bankguthaben gedeckt werden können. Richtwert: > 20%.' },
    { name: 'Liquidität 2. Grades (Quick Ratio)', formel: '(Flüssige Mittel + Forderungen) ÷ Kurzfristiges FK × 100', erklaerung: 'Richtwert: ca. 100% — kurzfristige Schulden sollten durch flüssige Mittel + Forderungen gedeckt sein.' },
    { name: 'Liquidität 3. Grades (Current Ratio)', formel: 'Umlaufvermögen ÷ Kurzfristiges FK × 100', erklaerung: 'Richtwert: > 150–200%. Umlaufvermögen sollte kurzfristige Schulden deutlich übersteigen.' },
    { name: 'Eigenkapitalquote', formel: 'Eigenkapital ÷ Gesamtkapital (Bilanzsumme) × 100', erklaerung: 'Zeigt wie viel % der Aktiven durch Eigenkapital finanziert sind. Richtwert: > 30–40%.' },
    { name: 'Fremdkapitalquote', formel: 'Fremdkapital ÷ Gesamtkapital × 100', erklaerung: 'Anteil des Fremdkapitals an der Finanzierung. EK-Quote + FK-Quote = 100%.' },
    { name: 'Anlagedeckungsgrad 1', formel: 'Eigenkapital ÷ Anlagevermögen × 100', erklaerung: 'Zeigt ob das Anlagevermögen durch Eigenkapital gedeckt ist. Goldene Bilanzregel: mind. 100% (EK ≥ AV).' },
    { name: 'Anlagedeckungsgrad 2', formel: '(Eigenkapital + Langfristiges FK) ÷ Anlagevermögen × 100', erklaerung: 'Erweiterter Anlagedeckungsgrad inkl. langfristigem Fremdkapital. Sollte > 100% sein.' },
    { name: 'Eigenkapitalrentabilität (ROE)', formel: 'Reingewinn ÷ Eigenkapital × 100', erklaerung: 'Wie viel % Rendite erzielt das Eigenkapital. Vergleich mit Alternativanlagen wichtig.' },
    { name: 'Gesamtkapitalrentabilität (ROA)', formel: '(Reingewinn + Fremdkapitalzinsen) ÷ Gesamtkapital × 100', erklaerung: 'Rendite auf das gesamte eingesetzte Kapital unabhängig von der Finanzierungsstruktur.' },
    { name: 'Umsatzrendite', formel: 'Reingewinn ÷ Umsatz × 100', erklaerung: 'Wie viel % des Umsatzes als Gewinn verbleiben.' },
  ])

  // Keine klassischen Buchungssätze für Kennzahlenanalyse — nur Formeln
  console.log('Kap 11 Kennzahlenanalyse ✓')
}

await client.end()
console.log('\n✅ ALLE 8 KAPITEL KOMPLETT GESEEDET')
