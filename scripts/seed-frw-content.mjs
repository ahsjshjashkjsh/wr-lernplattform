import pg from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'FRW', 'Band 2')

async function clearChapter(chapterId) {
  await client.query(`DELETE FROM "BookingEntry" WHERE "chapterId" = $1`, [chapterId])
  await client.query(`DELETE FROM "Formula" WHERE "chapterId" = $1`, [chapterId])
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId" = $1`, [chapterId])
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId" = $1`, [chapterId])
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId" = $1`, [chapterId])
}

async function insertTerms(chapterId, terms) {
  for (let i = 0; i < terms.length; i++) {
    await client.query(
      `INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
      [terms[i].term, terms[i].definition, chapterId, i]
    )
  }
}

async function insertCorePoints(chapterId, points) {
  for (let i = 0; i < points.length; i++) {
    await client.query(
      `INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES (gen_random_uuid(), $1, $2, $3)`,
      [points[i], chapterId, i]
    )
  }
}

async function insertFormulas(chapterId, formulas) {
  for (let i = 0; i < formulas.length; i++) {
    await client.query(
      `INSERT INTO "Formula" (id, name, formel, erklaerung, "chapterId", "order") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
      [formulas[i].name, formulas[i].formel, formulas[i].erklaerung, chapterId, i]
    )
  }
}

async function insertBookings(chapterId, bookings) {
  for (let i = 0; i < bookings.length; i++) {
    await client.query(
      `INSERT INTO "BookingEntry" (id, situation, "sollKonto", "habenKonto", "betragHint", erklaerung, "chapterId", "order") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)`,
      [bookings[i].situation, bookings[i].soll, bookings[i].haben, bookings[i].betrag ?? null, bookings[i].erklaerung, chapterId, i]
    )
  }
}

async function setSummary(chapterId, mdPath) {
  try {
    const md = readFileSync(mdPath, 'utf8')
    await client.query(`UPDATE "Chapter" SET summary = $1 WHERE id = $2`, [md, chapterId])
  } catch (e) {
    console.warn(`  ⚠ MD-Datei nicht gefunden: ${mdPath}`)
  }
}

async function getChapter(topicSlug) {
  const r = await client.query(
    `SELECT c.id FROM "Chapter" c JOIN "Topic" t ON c."topicId" = t.id WHERE t.slug = $1 LIMIT 1`,
    [topicSlug]
  )
  if (!r.rows[0]) throw new Error(`Chapter nicht gefunden: ${topicSlug}`)
  return r.rows[0].id
}

// ─────────────────────────────────────────────────────────────────────────────
// KAPITEL 3: Verluste aus Forderungen
// ─────────────────────────────────────────────────────────────────────────────
{
  const id = await getChapter('frw-verluste-forderungen')
  await clearChapter(id)
  await setSummary(id, join(ROOT, 'Verluste aus Forderung inkl. WB Ford. (Band 2, Kapitel 3)', 'knowledge_kreditverkehr_verluste_aus_forderungen.md'))

  await insertTerms(id, [
    { term: 'Forderungen aus L+L', definition: 'Guthaben gegenüber Kunden aus Warenverkäufen oder Dienstleistungen auf Kredit. Jede Rechnungsstellung erhöht dieses Aktivkonto.' },
    { term: 'Verluste aus Forderungen', definition: 'Konto zur Erfassung definitiver oder mutmaßlicher Verluste auf Kundenforderungen. Dient sowohl als Aufwand bei konkreten Ausfällen als auch als Gegenkonto der Wertberichtigung.' },
    { term: 'Mahnung', definition: 'Zahlungserinnerung an den Schuldner nach Ablauf der Zahlungsfrist. Erste Eskalationsstufe; löst im Grundmodell keine Buchung aus.' },
    { term: 'Betreibung', definition: 'Staatlich geregeltes Verfahren zur zwangsweisen Durchsetzung einer Forderung. Folgt auf erfolglose Mahnungen und kann zu Pfändung oder Konkurs führen.' },
    { term: 'Konkurs', definition: 'Verfahren zur Verwertung des Vermögens eines zahlungsunfähigen Unternehmens. Führt meist nur zu teilweiser Befriedigung des Gläubigers.' },
    { term: 'Konkursdividende', definition: 'Anteil der Forderung, der aus der Konkursmasse effektiv bezahlt wird. Gegenstück zum definitiven Verlustrest.' },
    { term: 'Verlustschein', definition: 'Bescheinigung über den nicht gedeckten Teil einer Forderung nach Zwangsvollstreckung. Bei natürlichen Personen kann später erneut eingefordert werden.' },
    { term: 'Verzugszins', definition: 'Zins auf verspätet bezahlte Forderungen. Wird als Finanzertrag gebucht und erhöht die Gesamtforderung.' },
    { term: 'Wertberichtigung auf Forderungen (Delkredere)', definition: 'Minus-Aktivkonto zur Erfassung mutmaßlicher zukünftiger Ausfälle auf offenen Forderungen. Instrument der vorsichtigen Bilanzbewertung.' },
    { term: 'Minus-Aktivkonto', definition: 'Aktivkonto mit negativer Wirkung; vermindert den zugehörigen Aktivposten in der Bilanz (z.B. WB Forderungen von Forderungen L+L abgezogen).' },
    { term: 'Ruhendes Konto', definition: 'Konto das nur periodisch (typischerweise am Jahresende) angepasst wird; im Tagesgeschäft nicht laufend verändert. Charakteristikum von WB Forderungen.' },
    { term: 'A.o. Ertrag (periodenfremder Ertrag)', definition: 'Ertrag aus einer anderen Periode. Behandlung später Zahlungseingänge auf bereits in früheren Jahren abgeschriebene Forderungen.' },
  ])

  await insertCorePoints(id, [
    'Eine Kundenrechnung erzeugt sofort eine Forderung und gleichzeitig einen Ertrag, obwohl noch kein Geld geflossen ist.',
    'Mahnungen sind organisatorische Schritte und lösen im Grundmodell keine Buchungen aus.',
    'Kosten der Rechtsdurchsetzung, die dem Schuldner weiterbelastet werden, erhöhen die Forderung.',
    'Der nicht einbringliche Rest einer Forderung wird über das Konto "Verluste aus Forderungen" ausgebucht.',
    'Forderungsverluste korrigieren wirtschaftlich den ursprünglich zu hoch erfassten Umsatz.',
    'Nachträgliche Zahlungen im gleichen Jahr korrigieren den früheren Aufwand; in späteren Jahren führen sie zu periodenfremdem Ertrag.',
    'Die Wertberichtigung erfasst nicht konkrete Einzelverluste, sondern das allgemeine Ausfallrisiko des gesamten Forderungsbestands.',
    'Die Wertberichtigung wird nicht vollständig neu gebildet, sondern nur auf den erforderlichen Endsaldo angepasst.',
  ])

  await insertFormulas(id, [
    { name: 'Anpassung WB Forderungen', formel: 'Notwendige WB neu – vorhandene WB alt', erklaerung: 'Positives Ergebnis = Erhöhung der WB; negatives Ergebnis = Verminderung der WB.' },
  ])

  await insertBookings(id, [
    { situation: 'Kostenvorschuss Betreibungsamt', soll: 'Forderungen L+L', haben: 'Bank / Post', betrag: null, erklaerung: 'Vorschuss wird als Teil der Forderung aktiviert, da er dem Schuldner weiterbelastet wird.' },
    { situation: 'Verzugszinsen auf Forderung', soll: 'Forderungen L+L', haben: 'Finanzertrag', betrag: null, erklaerung: 'Verzugszinsen sind Finanzerträge und erhöhen den Forderungsbetrag.' },
    { situation: 'Definitiver Forderungsausfall (Verlust)', soll: 'Verluste aus Forderungen', haben: 'Forderungen L+L', betrag: null, erklaerung: 'Der uneinbringliche Betrag wird aufwandswirksam ausgebucht.' },
    { situation: 'Konkursdividende erhalten', soll: 'Bank / Post', haben: 'Forderungen L+L', betrag: null, erklaerung: 'Nur der tatsächlich erhaltene Teil der Forderung wird als Eingang verbucht.' },
    { situation: 'Nachträgliche Zahlung (gleiches Jahr)', soll: 'Bank / Post', haben: 'Verluste aus Forderungen', betrag: null, erklaerung: 'Korrigiert den früheren Aufwand im selben Geschäftsjahr.' },
    { situation: 'Nachträgliche Zahlung (spätere Jahre)', soll: 'Bank / Post', haben: 'A.o. Ertrag', betrag: null, erklaerung: 'In einem späteren Jahr wird der Eingang als periodenfremder Ertrag verbucht.' },
    { situation: 'WB Forderungen erhöhen', soll: 'Verluste aus Forderungen', haben: 'WB Forderungen', betrag: null, erklaerung: 'Jahresabschlussbuchung: Forderungsbestand gestiegen oder Ausfallrisiko höher.' },
    { situation: 'WB Forderungen vermindern', soll: 'WB Forderungen', haben: 'Verluste aus Forderungen', betrag: null, erklaerung: 'Jahresabschlussbuchung: Forderungsbestand gesunken oder Ausfallrisiko tiefer.' },
  ])
  console.log('✓ Kapitel 3: Verluste aus Forderungen')
}

// ─────────────────────────────────────────────────────────────────────────────
// KAPITEL 4: Abschreibungen
// ─────────────────────────────────────────────────────────────────────────────
{
  const id = await getChapter('frw-abschreibungen')
  await clearChapter(id)
  await setSummary(id, join(ROOT, 'Abschreibung (Band 2, Kapitel 4)', 'abschreibungen_kapitel4_wissensextraktion.md'))

  await insertTerms(id, [
    { term: 'Abschreibung', definition: 'Buchhalterische Erfassung der Wertverminderung einer Anlage über die Nutzungsdauer. Zentrales Instrument zur periodengerechten Erfolgsermittlung.' },
    { term: 'Sachanlage', definition: 'Materieller Vermögenswert, der dem Unternehmen längerfristig dient (z.B. Fahrzeuge, Mobiliar, Büroeinrichtung). Objekt der Abschreibung.' },
    { term: 'Anschaffungswert', definition: 'Kaufpreis minus Preisnachlässe und abziehbare Vorsteuer, plus direkt zurechenbare Nebenkosten. Ausgangsbasis für die Abschreibungsberechnung.' },
    { term: 'Nutzungsdauer', definition: 'Geplante Zeitspanne, über die eine Anlage wirtschaftlich genutzt wird. Bestimmt bei linearer Abschreibung den jährlichen Betrag.' },
    { term: 'Buchwert / Restwert', definition: 'Wert einer Anlage in der Buchhaltung nach Abzug der bisherigen Abschreibungen. Relevanter Vergleichswert bei Bilanzierung und Verkauf.' },
    { term: 'Wertberichtigungskonto (WB)', definition: 'Separates Konto zur indirekten Erfassung kumulierter Abschreibungen. Ermöglicht Trennung von Anschaffungswert und Wertminderung.' },
    { term: 'Direkte Abschreibung', definition: 'Abschreibungsmethode, bei der das Anlagekonto selbst vermindert wird. Buchung: Abschreibungen / Anlagekonto.' },
    { term: 'Indirekte Abschreibung', definition: 'Abschreibungsmethode über ein separates Wertberichtigungskonto. Buchung: Abschreibungen / WB Anlage. Informationsreicher.' },
    { term: 'Lineare Abschreibung', definition: 'Gleichbleibende Abschreibung in jedem Jahr. Betrag = Anschaffungswert / Nutzungsdauer. Beispiel: 12,5 % von CHF 24\'000 = CHF 3\'000 pro Jahr.' },
    { term: 'Degressive Abschreibung', definition: 'Abschreibung mit konstantem Prozentsatz vom jeweiligen Buchwert. Bildet stärkere Wertverluste zu Beginn ab. Beispiel: 25 % von CHF 24\'000 = CHF 6\'000 im ersten Jahr.' },
    { term: 'Selbstfinanzierung', definition: 'Finanzierung künftiger Investitionen aus im Unternehmen zurückbehaltenen Mitteln. Abschreibungen fördern sie, weil sie Gewinn mindern ohne Liquidität zu verbrauchen.' },
    { term: 'Pro-Memoria-Posten', definition: 'Symbolischer Restwert von CHF 1 für vollständig abgeschriebene, aber noch vorhandene Anlagen.' },
  ])

  await insertCorePoints(id, [
    'Sachanlagen verlieren durch Nutzung, Alterung und technische Entwicklung an Wert — dieser Verlust muss als Abschreibung erfasst werden.',
    'Abschreibungen sind nicht liquiditätswirksam: Bei der Buchung fließt kein Geld ab. Der Geldabfluss fand beim Kauf statt.',
    'Gerade deshalb fördern Abschreibungen die Selbstfinanzierung: Sie mindern den Gewinn ohne Liquidität zu verbrauchen.',
    'Abschreibungsbasis ist der korrekt berechnete Anschaffungswert, nicht einfach der Rechnungsbetrag.',
    'Lineare Abschreibung verteilt den Wertverzehr gleichmäßig; degressive Abschreibung belastet frühe Jahre stärker.',
    'Direkte und indirekte Verbuchung führen zum gleichen Buchwert, unterscheiden sich aber in der Bilanz-Transparenz.',
    'Beim Verkauf: Erlös über Buchwert = außerordentlicher Ertrag; Erlös unter Buchwert = außerordentlicher Aufwand.',
    'Vollständig abgeschriebene Anlagen werden in der Praxis oft mit CHF 1 als Pro-Memoria-Posten weitergeführt.',
  ])

  await insertFormulas(id, [
    { name: 'Lineare Abschreibung (Betrag)', formel: 'Anschaffungskosten / Nutzungsdauer', erklaerung: 'Gleichbleibender Jahresbetrag. Beispiel: CHF 24\'000 / 8 Jahre = CHF 3\'000 pro Jahr.' },
    { name: 'Lineare Abschreibung (Satz)', formel: '100 % / Nutzungsdauer', erklaerung: 'Beispiel: 100 % / 8 = 12,5 % pro Jahr.' },
    { name: 'Degressive Abschreibung', formel: 'Prozentsatz × aktueller Buchwert', erklaerung: 'Sinkende absolute Beträge, da der Buchwert jedes Jahr kleiner wird. Beispiel: 25 % × CHF 24\'000 = CHF 6\'000 im ersten Jahr.' },
    { name: 'Anschaffungswert', formel: 'Kaufpreis brutto – Rabatt/Skonto – Vorsteuer + Nebenkosten', erklaerung: 'Beispiel: CHF 25\'800 – CHF 2\'580 (Rabatt 10%) + CHF 780 (Transport) = CHF 24\'000.' },
  ])

  await insertBookings(id, [
    { situation: 'Kauf Anlage auf Rechnung', soll: 'Mobiliar / Maschinen', haben: 'Verbindlichkeiten L+L', betrag: null, erklaerung: 'Anlage wird zum Anschaffungswert aktiviert.' },
    { situation: 'Direkte jährliche Abschreibung', soll: 'Abschreibungen', haben: 'Mobiliar / Anlagekonto', betrag: 'z.B. CHF 3\'000', erklaerung: 'Das Anlagekonto wird direkt vermindert. Buchwert ist sofort sichtbar.' },
    { situation: 'Indirekte jährliche Abschreibung', soll: 'Abschreibungen', haben: 'WB Mobiliar', betrag: 'z.B. CHF 3\'000', erklaerung: 'Das Anlagekonto bleibt zum Anschaffungswert. WB-Konto nimmt zu.' },
    { situation: 'Verkauf Anlage (Barverkauf)', soll: 'Kasse / Bank', haben: 'Mobiliar', betrag: 'Verkaufserlös', erklaerung: 'Erster Schritt beim Verkauf: Erlös erfassen.' },
    { situation: 'WB Anlage auflösen (bei indirekter Abschreibung)', soll: 'WB Mobiliar', haben: 'Mobiliar', betrag: 'Kumulierte WB', erklaerung: 'Zweiter Schritt: Wertberichtigungskonto gegen Anlagekonto auflösen.' },
    { situation: 'Verkaufsgewinn (Erlös > Buchwert)', soll: 'Mobiliar', haben: 'A.o. Ertrag', betrag: 'Differenz', erklaerung: 'Dritter Schritt: Verbleibender Habensaldo auf Anlagekonto = Gewinn.' },
    { situation: 'Verkaufsverlust (Erlös < Buchwert)', soll: 'A.o. Aufwand', haben: 'Mobiliar', betrag: 'Differenz', erklaerung: 'Dritter Schritt: Verbleibender Sollsaldo auf Anlagekonto = Verlust.' },
  ])
  console.log('✓ Kapitel 4: Abschreibungen')
}

// ─────────────────────────────────────────────────────────────────────────────
// KAPITEL 5: Zeitliche Abgrenzungen & Rückstellungen
// ─────────────────────────────────────────────────────────────────────────────
{
  const id = await getChapter('frw-zeitliche-abgrenzungen')
  await clearChapter(id)
  await setSummary(id, join(ROOT, 'Zeitliche Abgrenzungen (inkl Rückstellungen) (Band 2, Kapitel 5)', 'abgrenzungen_und_rueckstellungen_wissensbasis.md'))

  await insertTerms(id, [
    { term: 'Periodengerechte Rechnungslegung', definition: 'Zuordnung von Aufwänden und Erträgen zu dem Geschäftsjahr, in dem sie wirtschaftlich verursacht wurden. Grundprinzip für Abgrenzungen und Rückstellungen.' },
    { term: 'Aktive Rechnungsabgrenzung (Aktive RA)', definition: 'Bilanzposten für Guthaben am Abschlussstichtag aus noch nicht erhaltenen Erträgen oder im Voraus bezahlten Aufwänden. Aktivseite der Bilanz.' },
    { term: 'Passive Rechnungsabgrenzung (Passive RA)', definition: 'Bilanzposten für Schulden am Abschlussstichtag aus noch nicht bezahlten Aufwänden oder im Voraus erhaltenen Erträgen. Passivseite der Bilanz.' },
    { term: 'Noch nicht erhaltene Erträge', definition: 'Wirtschaftlich verdiente Erträge, deren Zahlung am Abschlussstichtag noch aussteht. Erfordern Bildung einer Aktiven RA.' },
    { term: 'Im Voraus bezahlte Aufwände', definition: 'Bereits bezahlte Beträge, deren Aufwand wirtschaftlich erst in einer späteren Periode entsteht. Werden als Aktive RA bilanziert.' },
    { term: 'Noch nicht bezahlte Aufwände', definition: 'Wirtschaftlich bereits entstandene Aufwände, deren Zahlung noch aussteht. Werden als Aufwand des alten Jahres und als Passive RA erfasst.' },
    { term: 'Im Voraus erhaltene Erträge', definition: 'Bereits vereinnahmte Beträge, für die die Leistung noch nicht erbracht wurde. Werden als Passive RA (Schuld) ausgewiesen.' },
    { term: 'Rückstellung', definition: 'Passivposten für wahrscheinliche zukünftige Verpflichtungen aus vergangenen Ereignissen, deren Betrag und/oder Fälligkeit noch ungewiss sind.' },
    { term: 'Bildung einer Rückstellung', definition: 'Erstmalige Erfassung der voraussichtlichen Verpflichtung im Jahr der wirtschaftlichen Verursachung. Sichert periodengerechten Ausweis.' },
    { term: 'Verwendung einer Rückstellung', definition: 'Verrechnung tatsächlicher Ausgaben mit der gebildeten Rückstellung. Die reale Zahlung belastet nicht nochmals den Aufwand.' },
    { term: 'Auflösung einer Rückstellung', definition: 'Rückführung eines nicht mehr benötigten Restbetrags in den Erfolg. Verhindert dauerhaft überhöhte Passiven.' },
  ])

  await insertCorePoints(id, [
    'Der wirtschaftlich richtige Erfolg eines Geschäftsjahres entsteht erst nach Abgrenzungen und gegebenenfalls Rückstellungen.',
    'Aktive RA wird verwendet, wenn per Abschluss ein Guthaben besteht; Passive RA wenn eine Schuld besteht.',
    'Es gibt vier Standardfälle: noch nicht erhaltene Erträge, im Voraus bezahlte Aufwände, noch nicht bezahlte Aufwände, im Voraus erhaltene Erträge.',
    'Rechnungsabgrenzungen werden im neuen Jahr wieder eröffnet und zurückgebucht.',
    'Rückstellungen betreffen wahrscheinliche, aber unsichere Verpflichtungen — nicht einfach Zahlungsverschiebungen.',
    'Rückstellungen werden nicht automatisch rückgebucht, sondern fortgeführt, angepasst, verwendet oder aufgelöst.',
    'Für reine Zukunftsinvestitionen dürfen keine Rückstellungen gebildet werden — es fehlt an einer bestehenden Verpflichtung.',
  ])

  await insertBookings(id, [
    { situation: 'Noch nicht erhaltener Ertrag abgrenzen', soll: 'Aktive RA', haben: 'Ertragskonto (z.B. Zinsertrag)', betrag: null, erklaerung: 'Wirtschaftlich verdient, Zahlung steht noch aus. Aktive RA = Guthaben.' },
    { situation: 'Im Voraus bezahlten Aufwand abgrenzen', soll: 'Aktive RA', haben: 'Aufwandkonto (z.B. Versicherungsaufwand)', betrag: null, erklaerung: 'Bereits bezahlter Aufwand gehört ins nächste Jahr. Anteil als Aktive RA aktivieren.' },
    { situation: 'Noch nicht bezahlten Aufwand abgrenzen', soll: 'Aufwandkonto (z.B. Energieaufwand)', haben: 'Passive RA', betrag: null, erklaerung: 'Aufwand gehört ins alte Jahr, Rechnung kommt erst später. Passive RA = Schuld.' },
    { situation: 'Im Voraus erhaltenen Ertrag abgrenzen', soll: 'Ertragskonto (z.B. Mietzinsertrag)', haben: 'Passive RA', betrag: null, erklaerung: 'Geld bereits erhalten, Leistung noch nicht erbracht. Passive RA = Schuld.' },
    { situation: 'Rückstellung bilden (betriebsfremder Aufwand)', soll: 'A.o. Aufwand', haben: 'Rückstellungen', betrag: null, erklaerung: 'Wahrscheinliche, aber unsichere Verpflichtung (z.B. Prozessrisiko) im Verursachungsjahr erfassen.' },
    { situation: 'Rückstellung bilden (betrieblicher Aufwand)', soll: 'Aufwandkonto', haben: 'Rückstellungen', betrag: null, erklaerung: 'Rückstellung für betriebliche Verpflichtung (z.B. Garantien, Reparaturen).' },
    { situation: 'Rückstellung verwenden', soll: 'Rückstellungen', haben: 'Bank / Kasse', betrag: null, erklaerung: 'Tatsächliche Zahlung gegen die Rückstellung verrechnen — kein neuer Aufwand.' },
    { situation: 'Rückstellung auflösen (nicht mehr nötig)', soll: 'Rückstellungen', haben: 'A.o. Ertrag', betrag: null, erklaerung: 'Restbetrag wird erfolgswirksam aufgelöst, da Verpflichtung weggefallen ist.' },
  ])
  console.log('✓ Kapitel 5: Zeitliche Abgrenzungen & Rückstellungen')
}

// ─────────────────────────────────────────────────────────────────────────────
// KAPITEL 6: Löhne und Gehälter
// ─────────────────────────────────────────────────────────────────────────────
{
  const id = await getChapter('frw-loehne-gehaelter')
  await clearChapter(id)
  await setSummary(id, join(ROOT, 'Löhne und Gehälter (Band 2, Kapitel 6)', 'loehne_und_gehaelter_wissensextrakt.md'))

  await insertTerms(id, [
    { term: 'Bruttolohn', definition: 'Vertraglich geschuldeter Lohn vor Abzug der Arbeitnehmerbeiträge. Ausgangspunkt jeder Lohnabrechnung und Bemessungsgrundlage für Sozialversicherungen.' },
    { term: 'Nettolohn', definition: 'Auszahlungsbetrag nach Abzug der Arbeitnehmerbeiträge vom Bruttolohn. Tatsächlich ausbezahlter Betrag.' },
    { term: 'Arbeitnehmerbeiträge', definition: 'Vom Arbeitnehmer getragene Beiträge an Sozialversicherungen (AHV/IV/EO, ALV, PK, NBU), die vom Bruttolohn abgezogen werden.' },
    { term: 'Arbeitgeberbeiträge', definition: 'Vom Arbeitgeber zusätzlich zum Bruttolohn zu tragende Beiträge (AHV/IV/EO, ALV, PK, BU, VKB). Lohnzusatzkosten.' },
    { term: 'AHV / IV / EO', definition: 'Alters- und Hinterlassenenversicherung / Invalidenversicherung / Erwerbsersatzordnung. Staatliche Sozialversicherung, total 10,6 %, hälftig geteilt.' },
    { term: 'ALV', definition: 'Arbeitslosenversicherung. Absicherung gegen Arbeitslosigkeit, 2,2 % total, hälftig geteilt zwischen Arbeitgeber und Arbeitnehmer.' },
    { term: 'Pensionskasse (PK / BVG)', definition: 'Berufliche Vorsorge (2. Säule). Ab Mindestlohnhöhe obligatorisch; Arbeitgeber muss mindestens die Hälfte tragen.' },
    { term: 'BU / NBU', definition: 'Berufsunfallversicherung (trägt Arbeitgeber) / Nichtberufsunfallversicherung (trägt grundsätzlich Arbeitnehmer).' },
    { term: 'Lohnaufwand', definition: 'Aufwand für den Bruttolohn. Zentrales Erfolgsrechnungskonto für die lohnbezogene Gegenleistung des Unternehmens.' },
    { term: 'Sozialversicherungsaufwand', definition: 'Aufwand für die vom Arbeitgeber getragenen Sozialversicherungsbeiträge. Zusätzliche Personalkosten neben dem eigentlichen Lohn.' },
    { term: 'Verbindlichkeiten Sozialversicherungen', definition: 'Passivkonto für noch geschuldete Beiträge an Sozialversicherungsträger. Entsteht durch die Lohnbuchung und wird bei Abrechnung aufgelöst.' },
    { term: 'Naturallohn', definition: 'Lohnbestandteil in Form von Sachleistungen (z.B. Unterkunft, Verpflegung). Wird mit dem Nettolohn verrechnet.' },
    { term: 'Spesen', definition: 'Ersatz von Auslagen für das Unternehmen. Kein eigentlicher Lohn und nicht sozialversicherungspflichtig; Konto "Übriger Personalaufwand".' },
  ])

  await insertCorePoints(id, [
    'Der Bruttolohn ist nicht der Auszahlungsbetrag — der Nettolohn ergibt sich erst nach Abzug der Arbeitnehmerbeiträge.',
    'Arbeitnehmerbeiträge mindern den Nettolohn; Arbeitgeberbeiträge sind zusätzliche Kosten des Arbeitgebers.',
    'Buchhalterisch werden Lohnaufwand (Bruttolohn) und Sozialversicherungsaufwand (Arbeitgeberbeiträge) getrennt erfasst.',
    'Die geschuldeten Sozialversicherungsbeiträge werden als Verbindlichkeiten passiviert und später abgerechnet.',
    'Personalkosten = Bruttolohn + Arbeitgeberbeiträge + weitere personalbezogene Kosten.',
    'Spesen sind nicht sozialversicherungspflichtig und sollen nicht mit dem Nettolohn vermischt werden.',
    'Naturallohn und Warenbezüge müssen separat sichtbar gemacht werden.',
  ])

  await insertFormulas(id, [
    { name: 'Nettolohn', formel: 'Bruttolohn – Arbeitnehmerbeiträge', erklaerung: 'Tatsächlicher Auszahlungsbetrag an den Arbeitnehmer.' },
    { name: 'Personalkosten (Arbeitgeber)', formel: 'Bruttolohn + Arbeitgeberbeiträge', erklaerung: 'Gesamtkosten des Arbeitgebers für eine Arbeitsleistung.' },
  ])

  await insertBookings(id, [
    { situation: 'Lohnzahlung (Bruttolohn buchen)', soll: 'Lohnaufwand', haben: 'Bank (Nettolohn) + Verbindlichkeiten SV (AN-Beiträge)', betrag: 'Bruttolohn', erklaerung: 'Bruttolohn wird belastet; Nettolohn fließt an Mitarbeiter, AN-Beiträge bleiben als Schuld.' },
    { situation: 'Arbeitgeberbeiträge buchen', soll: 'Sozialversicherungsaufwand', haben: 'Verbindlichkeiten SV', betrag: 'AG-Beiträge', erklaerung: 'Arbeitgeberbeiträge als separater Aufwand und Verbindlichkeit gegenüber SV-Trägern.' },
    { situation: 'Abrechnung Sozialversicherungen', soll: 'Verbindlichkeiten SV', haben: 'Bank', betrag: 'AN + AG Beiträge', erklaerung: 'Beide Beitragsanteile werden gemeinsam an die Ausgleichskasse / Versicherung abgeführt.' },
    { situation: 'Naturallohn (Kost und Logis)', soll: 'Lohnaufwand', haben: 'Aufwandkonto (z.B. Lebensmittelaufwand)', betrag: null, erklaerung: 'Naturallohn wird auf Lohnaufwand belastet; Gegenkonto ist der entsprechende Sachaufwand.' },
    { situation: 'Spesenabrechnung', soll: 'Übriger Personalaufwand', haben: 'Bank / Spesenvorschuss', betrag: null, erklaerung: 'Spesen werden nicht über Lohnaufwand gebucht und sind nicht SV-pflichtig.' },
  ])
  console.log('✓ Kapitel 6: Löhne und Gehälter')
}

// ─────────────────────────────────────────────────────────────────────────────
// KAPITEL 7: Einzelunternehmen
// ─────────────────────────────────────────────────────────────────────────────
{
  const id = await getChapter('frw-einzelunternehmen')
  await clearChapter(id)
  await setSummary(id, join(ROOT, 'Einzelunternehung (Band 2, Kapitel 7)', 'einzelunternehmen_kapitel7_wissensextraktion.md'))

  await insertTerms(id, [
    { term: 'Einzelunternehmen', definition: 'Unternehmensform, die von einer natürlichen Person getragen und geführt wird. Keine Kapitalgesellschaft; Inhaber haftet unbeschränkt.' },
    { term: 'Eigenkapital', definition: 'Aus Sicht des Unternehmens Schuld gegenüber der Eigentümerin. Zentrales Passivkonto; wird durch Gewinne erhöht und Verluste vermindert.' },
    { term: 'Privatkonto', definition: 'Unterkonto des Eigenkapitals zur Erfassung privater Bezüge und Gutschriften während des Jahres. Wird am Jahresende auf EK abgeschlossen.' },
    { term: 'Kapitaleinlage', definition: 'Zuführung von Vermögen der Inhaberin an das Unternehmen. Erhöht das Eigenkapital.' },
    { term: 'Passivdarlehen', definition: 'Fremdkapital, das dem Unternehmen von Dritten zur Verfügung gestellt wird. Ergänzt fehlende Eigenmittel.' },
    { term: 'Eigenlohn', definition: 'Kalkulatorische Entschädigung für die persönliche Arbeitsleistung der Inhaberin. Bestandteil des Unternehmereinkommens.' },
    { term: 'Eigenzins', definition: 'Kalkulatorische Verzinsung des von der Inhaberin eingesetzten Eigenkapitals. Bestandteil des Unternehmereinkommens.' },
    { term: 'Unternehmereinkommen', definition: 'Wirtschaftlicher Ertrag aus dem Einzelunternehmen: Eigenlohn + Eigenzins + Reingewinn.' },
    { term: 'Warenbezug', definition: 'Private Entnahme von Waren aus dem Unternehmen. Muss über Privatkonto verbucht werden, damit Warenaufwand korrekt ausgewiesen ist.' },
    { term: 'Privatanteil', definition: 'Privater Nutzungsanteil an gemischt verwendeten betrieblichen Aufwendungen. Korrekte Abgrenzung zwischen Geschäft und Privat.' },
  ])

  await insertCorePoints(id, [
    'Im Einzelunternehmen gibt es kein gesetzliches Mindestkapital; ab CHF 100\'000 Jahresumsatz ist ein HR-Eintrag erforderlich.',
    'Die Inhaberin haftet unbeschränkt mit Geschäfts- und Privatvermögen.',
    'Das Privatkonto trennt private und geschäftliche Vorgänge während des Jahres; am Jahresende wird es auf EK abgeschlossen.',
    'Das Unternehmereinkommen besteht wirtschaftlich aus Eigenlohn, Eigenzins und Reingewinn.',
    'Warenbezüge und Privatanteile müssen verbucht werden, damit Aufwand, Gewinn und Steuern korrekt ausgewiesen sind.',
  ])

  await insertBookings(id, [
    { situation: 'Kapitaleinlage bei Gründung', soll: 'Bank / Kasse / Anlagevermögen', haben: 'Eigenkapital', betrag: null, erklaerung: 'Privates Vermögen der Inhaberin wird ins Unternehmen eingebracht.' },
    { situation: 'Darlehen aufnehmen', soll: 'Bank', haben: 'Passivdarlehen', betrag: null, erklaerung: 'Fremdmittel zur Ergänzung der Eigenfinanzierung.' },
    { situation: 'Privatbezug (Bargeld)', soll: 'Privat', haben: 'Kasse / Bank', betrag: null, erklaerung: 'Private Entnahme durch die Inhaberin; über Privatkonto erfassen.' },
    { situation: 'Warenbezug (privat)', soll: 'Privat', haben: 'Warenvorrat / Warenaufwand', betrag: 'Einstandspreis', erklaerung: 'Waren zum Einstandspreis aus dem Unternehmen entnommen. Warenaufwand wird korrigiert.' },
    { situation: 'Eigenlohn gutschreiben', soll: 'Lohnaufwand', haben: 'Privat', betrag: null, erklaerung: 'Kalkulatorischer Eigenlohn: Aufwand beim Unternehmen, Gutschrift ans Privatkonto.' },
    { situation: 'Privatanteil buchen (z.B. Fahrzeug)', soll: 'Privat', haben: 'Fahrzeugaufwand / Vorsteuer', betrag: null, erklaerung: 'Privater Nutzungsanteil korrigiert den Aufwand und die Vorsteuer.' },
    { situation: 'Abschluss Privatkonto auf Eigenkapital (Soll > Haben)', soll: 'Eigenkapital', haben: 'Privat', betrag: null, erklaerung: 'Bezüge überwiegen Gutschriften: EK wird vermindert.' },
    { situation: 'Abschluss Privatkonto auf Eigenkapital (Haben > Soll)', soll: 'Privat', haben: 'Eigenkapital', betrag: null, erklaerung: 'Gutschriften überwiegen Bezüge: EK wird erhöht.' },
  ])
  console.log('✓ Kapitel 7: Einzelunternehmen')
}

// ─────────────────────────────────────────────────────────────────────────────
// KAPITEL 8: Aktiengesellschaft & Gewinnverteilung
// ─────────────────────────────────────────────────────────────────────────────
{
  const id = await getChapter('frw-aktiengesellschaft')
  await clearChapter(id)
  await setSummary(id, join(ROOT, 'AG (inkl. Gewinnverteilung) (Band 2, Kapitel 8)', 'aktiengesellschaft_kapitel8_wissensextraktion.md'))

  await insertTerms(id, [
    { term: 'Aktiengesellschaft (AG)', definition: 'Kapitalgesellschaft und juristische Person mit in Aktien zerlegtem Eigenkapital. Haftet nur mit dem Gesellschaftsvermögen.' },
    { term: 'Aktienkapital', definition: 'Statutarisch festgelegtes Grundkapital zum Nennwert der ausgegebenen Aktien. Mindestkapital CHF 100\'000.' },
    { term: 'Kapitalverpflichtung / Zeichnung', definition: 'Rechtliche Verpflichtung der Aktionäre, gezeichnete Aktien zu liberieren. Buchung: Ford. Aktionäre / Aktienkapital.' },
    { term: 'Forderungen gg. Aktionäre', definition: 'Verrechnungskonto der Gründung für offene Ansprüche aus gezeichnetem, aber noch nicht einbezahltem Kapital. Muss nach der Gründung Saldo 0 haben.' },
    { term: 'Sacheinlage', definition: 'Einbringung von Vermögenswerten statt Barzahlung. Erfordert besondere Prüfungsbestätigung der Revisionsstelle.' },
    { term: 'Gewinnvortrag', definition: 'Nicht verteilter Gewinnrest aus Vorjahren. Verbindet vergangene Gewinnverwendung mit aktueller Gewinnverteilung.' },
    { term: 'Gesetzliche Gewinnreserve', definition: 'Aus Gewinnen gebildete, gesetzlich gebundene Eigenkapitalreserve. Wird durch Gewinnverwendung gebildet.' },
    { term: 'Dividende', definition: 'Beschlossener Gewinnanteil, der an Aktionäre ausgeschüttet wird. Bei Auszahlung sind 35 % Verrechnungssteuer abzuziehen.' },
    { term: 'Verrechnungssteuer (VST)', definition: 'Quellensteuer von 35 % auf Dividenden und andere Erträge. Wird von der AG einbehalten und an die Steuerverwaltung abgeliefert.' },
    { term: 'Agio', definition: 'Mehrerlös bei Ausgabe neuer Aktien über dem Nennwert. Erhöht die gesetzliche Kapitalreserve, nicht den Periodengewinn.' },
    { term: 'Kapitalerhöhung', definition: 'Erhöhung des Aktienkapitals durch Ausgabe neuer Aktien. Instrument der Aussenfinanzierung.' },
    { term: 'Verlustvortrag', definition: 'Nicht gedeckter Verlust, der in die nächste Bilanz als Minus-Passivkonto übernommen wird.' },
  ])

  await insertCorePoints(id, [
    'Die AG ist eine juristische Person und haftet nur mit dem Gesellschaftsvermögen — nicht mit den Aktionären.',
    'Die AG entsteht rechtlich erst mit dem Handelsregistereintrag.',
    'Die Gründung wird buchhalterisch über das Konto "Forderungen gegenüber Aktionären" abgewickelt.',
    'Die Gewinnverwendung ist ein gesonderter Schritt nach Abschluss, Revision und Generalversammlung.',
    'Bei Dividendenauszahlungen sind 35 % Verrechnungssteuer abzuziehen und an die Steuerverwaltung abzuführen.',
    'Ein Jahresverlust wird auf Verlustvortrag übertragen und soweit möglich durch Gewinnvorträge und Reserven gedeckt.',
    'Bei Kapitalerhöhungen gehört ein Aufpreis über dem Nennwert als Agio in die gesetzliche Kapitalreserve.',
  ])

  await insertBookings(id, [
    { situation: 'Kapitalzeichnung (Gründung)', soll: 'Ford. gegenüber Aktionären', haben: 'Aktienkapital', betrag: null, erklaerung: 'Aktionäre verpflichten sich zur Einzahlung. Ford. Aktionäre als Verrechnungskonto.' },
    { situation: 'Bareinlage Aktionäre', soll: 'Bank', haben: 'Ford. gegenüber Aktionären', betrag: null, erklaerung: 'Einzahlung erfüllt die Kapitalverpflichtung.' },
    { situation: 'Sacheinlage (Aktiven übernehmen)', soll: 'Anlagevermögen / Umlaufvermögen', haben: 'Ford. gegenüber Aktionären', betrag: null, erklaerung: 'Einbringung von Vermögenswerten statt Bargeld.' },
    { situation: 'Dividende deklarieren (GV-Beschluss)', soll: 'Gewinnvortrag', haben: 'Dividendenverbindlichkeit', betrag: 'Brutto-Dividende', erklaerung: 'GV beschliesst Ausschüttung. Schuld gegenüber Aktionären entsteht.' },
    { situation: 'Dividende auszahlen (nach VST-Abzug)', soll: 'Dividendenverbindlichkeit', haben: 'Bank (65%) + Verbindlichkeit VST (35%)', betrag: null, erklaerung: 'Netto-Dividende an Aktionäre; 35 % VST wird zurückbehalten.' },
    { situation: 'Verrechnungssteuer abliefern', soll: 'Verbindlichkeit VST', haben: 'Bank', betrag: '35 % der Dividende', erklaerung: 'Einbehaltene Verrechnungssteuer wird an die Steuerverwaltung überwiesen.' },
    { situation: 'Jahresverlust auf Verlustvortrag', soll: 'Verlustvortrag', haben: 'Jahresverlust', betrag: null, erklaerung: 'Nicht gedeckter Verlust wird vorgetragen und mindert das Eigenkapital.' },
    { situation: 'Kapitalerhöhung — Zeichnung', soll: 'Ford. gegenüber Aktionären', haben: 'Aktienkapital (Nennwert) + Gesetzl. Kapitalreserve (Agio)', betrag: null, erklaerung: 'Agio (Aufpreis über Nennwert) fliesst in die gesetzliche Kapitalreserve.' },
  ])
  console.log('✓ Kapitel 8: Aktiengesellschaft')
}

// ─────────────────────────────────────────────────────────────────────────────
// KAPITEL 9: Bewertungsvorschriften & Stille Reserven
// ─────────────────────────────────────────────────────────────────────────────
{
  const id = await getChapter('frw-bewertungsvorschriften')
  await clearChapter(id)
  await setSummary(id, join(ROOT, 'Bewertungsvorschriften, Stille Reserven, Bilanzbereinigung (Band 2, Kapitel 9)', 'bewertungen_und_stille_reserven_kapitel9_wissensextraktion.md'))

  await insertTerms(id, [
    { term: 'Bewertung', definition: 'Wertmässige Festlegung einer Bilanzposition in Franken. Bestimmt Höhe von Vermögen, Schulden, Aufwand und Ertrag.' },
    { term: 'Anschaffungswert', definition: 'Bezahlter Kaufpreis inklusive sachlich zurechenbarer Anschaffungsnebenkosten. Ausgangspunkt der Aktivierung.' },
    { term: 'Niederstwertprinzip', definition: 'Bilanzierung zum tieferen Wert, wenn der realisierbare Wert unter dem bisherigen Bilanzwert liegt. Zentrales Vorsichtsprinzip für Vorräte.' },
    { term: 'Fortführungswert', definition: 'Wert eines Vermögensgegenstands bei weiterer Nutzung im Unternehmen. Gegenbegriff zum Liquidationswert.' },
    { term: 'Liquidationswert', definition: 'Verkaufserlös eines Gegenstands bei Veräusserung. Massgeblich für Niederstwertentscheidungen.' },
    { term: 'Stille Reserve', definition: 'Verdeckte Differenz zwischen intern realistischem Wert und extern vorsichtig ausgewiesenem Wert. Entsteht durch Unterbewertung von Aktiven oder Überbewertung von Fremdkapital.' },
    { term: 'Interne Bilanz', definition: 'Interne, realistische Darstellung von Vermögen und Schulden. Grundlage für Unternehmenssteuerung.' },
    { term: 'Externe Bilanz', definition: 'Veröffentlichungsfähiger Abschluss nach OR mit zulässiger Vorsicht. Kann durch stille Reserven vom internen Bild abweichen.' },
    { term: 'Höchstwertprinzip (Aktiven)', definition: 'Aktiven dürfen nicht zu hoch ausgewiesen werden. Obergrenze sind grundsätzlich Anschaffungs-/Herstellungskosten.' },
    { term: 'Tiefstwertprinzip (Passiven)', definition: 'Schulden und Rückstellungen dürfen nicht zu tief ausgewiesen werden. Verhindert zu günstige Darstellung der Lage.' },
  ])

  await insertCorePoints(id, [
    'Bewertungen bestimmen die Höhe aller Bilanzpositionen und beeinflussen direkt Aufwand, Ertrag und Reingewinn.',
    'Nach OR gilt für Vermögen ein Höchstwert- und für Schulden ein Tiefstwertansatz.',
    'Waren- und Materialvorräte unterliegen dem Niederstwertprinzip.',
    'Stille Reserven entstehen durch Unterbewertung von Aktiven oder Überbewertung von Fremdkapital.',
    'Bildung stiller Reserven senkt den externen Gewinn; Auflösung erhöht ihn.',
    'Grössere Auflösungen stiller Reserven müssen im Anhang erläutert werden.',
    'Interne Abschlüsse sollen realistisch, externe Abschlüsse vorsichtig sein.',
  ])

  await insertBookings(id, [
    { situation: 'Warenvorrat abwerten (Niederstwert)', soll: 'Warenaufwand', haben: 'Warenvorrat', betrag: 'Differenz', erklaerung: 'Realisierbarer Wert liegt unter Einstandspreis. Pflichtabwertung nach Niederstwertprinzip.' },
    { situation: 'Stille Reserve bilden (Abschreibung)', soll: 'Abschreibungen', haben: 'Anlagekonto / WB Anlage', betrag: 'Höher als nötig', erklaerung: 'Bewusst überhöhte Abschreibung bildet stille Reserve. Externer Buchwert tiefer als intern.' },
    { situation: 'Stille Reserve bilden (Rückstellung)', soll: 'A.o. Aufwand / Aufwandkonto', haben: 'Rückstellungen', betrag: 'Überhöht', erklaerung: 'Zu hoch dotierte Rückstellung erzeugt stille Reserve auf Passivseite.' },
    { situation: 'Stille Reserve auflösen (Anlage)', soll: 'WB Anlage', haben: 'A.o. Ertrag', betrag: 'Auflösungsbetrag', erklaerung: 'Frühere Überbewertung der WB wird rückgängig gemacht. Gewinn steigt.' },
    { situation: 'Stille Reserve auflösen (Warenvorrat)', soll: 'Warenvorrat', haben: 'Warenaufwand', betrag: 'Auflösungsbetrag', erklaerung: 'Frühere Unterbewertung des Vorrats aufgehoben. Aufwand sinkt, Gewinn steigt.' },
  ])
  console.log('✓ Kapitel 9: Bewertungsvorschriften & Stille Reserven')
}

// ─────────────────────────────────────────────────────────────────────────────
// KAPITEL 11: Analyse der Bilanz und Erfolgsrechnung
// ─────────────────────────────────────────────────────────────────────────────
{
  const id = await getChapter('frw-bilanzanalyse')
  await clearChapter(id)
  await setSummary(id, join(ROOT, 'Analyse der Bilanz und Erfolgsrechnung (Band 2, Kapitel 11)', 'bilanz_und_erfolgsanalyse_kapitel11_wissensextraktion.md'))

  await insertTerms(id, [
    { term: 'Eigenfinanzierungsgrad', definition: 'Eigenkapital / Gesamtkapital × 100. Misst finanzielle Stabilität. Zielgrösse: mindestens 30 %.' },
    { term: 'Fremdfinanzierungsgrad', definition: 'Fremdkapital / Gesamtkapital × 100. Misst Verschuldung. Zielgrösse: nicht mehr als 70 %.' },
    { term: 'Selbstfinanzierungsgrad', definition: 'Zuwachskapital / Grundkapital × 100. Zeigt, wie stark Gewinne zurückbehalten und EK aufgebaut wurden.' },
    { term: 'Liquiditätsgrad 1 (Cash Ratio)', definition: 'Flüssige Mittel / kurzfristiges FK × 100. Strenge Messung der sofortigen Zahlungsfähigkeit. Zielgrösse: mindestens 20 %.' },
    { term: 'Liquiditätsgrad 2 (Quick Ratio)', definition: '(Flüssige Mittel + Forderungen) / kurzfristiges FK × 100. Zielgrösse: mindestens 100 %.' },
    { term: 'Liquiditätsgrad 3 (Current Ratio)', definition: 'Umlaufvermögen / kurzfristiges FK × 100. Zielgrösse: mindestens 150 %.' },
    { term: 'Anlagedeckungsgrad 2', definition: '(Eigenkapital + langfristiges FK) / Anlagevermögen × 100. Prüft goldene Bilanzregel. Zielgrösse: mindestens 100 %.' },
    { term: 'Goldene Bilanzregel', definition: 'Langfristig gebundenes Vermögen soll mit langfristigem Kapital finanziert werden. Erfüllt wenn Anlagedeckungsgrad 2 ≥ 100 %.' },
    { term: 'Eigenkapitalrendite', definition: 'Reingewinn / Eigenkapital × 100. Misst die Verzinsung des eingesetzten Eigenkapitals.' },
    { term: 'Gesamtkapitalrendite', definition: '(Reingewinn + FK-Zinsen) / Gesamtkapital × 100. Ertragskraft unabhängig von Finanzierungsstruktur.' },
    { term: 'Umsatzrendite', definition: 'Reingewinn / Betriebsertrag × 100. Gewinnanteil pro Umsatzfranken.' },
    { term: 'Cashflow', definition: 'Reingewinn + Abschreibungen. Vereinfachte Kennzahl des Mittelzuflusses aus der Geschäftstätigkeit.' },
    { term: 'Verschuldungsfaktor', definition: 'Effektivverschuldung / Jahrescashflow. Zeigt nach wie vielen Jahren die Nettoschulden aus dem Cashflow abgebaut werden könnten.' },
  ])

  await insertCorePoints(id, [
    'Die Rohzahlen des Jahresabschlusses müssen vor der Analyse strukturiert und bereinigt werden.',
    'Kapitalstruktur zeigt den Zielkonflikt zwischen Sicherheit (hoher EK-Anteil) und Rentabilität (Leverage-Effekt).',
    'Liquidität misst Zahlungsbereitschaft; zu hohe Liquidität kann Rentabilität kosten.',
    'Die goldene Bilanzregel fordert langfristige Finanzierung des Anlagevermögens (AD2 ≥ 100 %).',
    'Cashflow ist oft aussagekräftiger als der reine Gewinn, weil Abschreibungen keine Geldabflüsse sind.',
    'Rentabilität darf nie isoliert interpretiert werden, sondern nur zusammen mit Verschuldung und Finanzierungsstruktur.',
    'Erst die Gesamtschau aller Kennzahlen erlaubt ein belastbares Urteil über die wirtschaftliche Lage.',
  ])

  await insertFormulas(id, [
    { name: 'Eigenfinanzierungsgrad', formel: 'Eigenkapital / Gesamtkapital × 100', erklaerung: 'Zielgrösse: ≥ 30 %' },
    { name: 'Fremdfinanzierungsgrad', formel: 'Fremdkapital / Gesamtkapital × 100', erklaerung: 'Zielgrösse: ≤ 70 %' },
    { name: 'Liquiditätsgrad 1', formel: 'Flüssige Mittel / kfr. Fremdkapital × 100', erklaerung: 'Zielgrösse: ≥ 20 %' },
    { name: 'Liquiditätsgrad 2', formel: '(Flüssige Mittel + Forderungen) / kfr. Fremdkapital × 100', erklaerung: 'Zielgrösse: ≥ 100 %' },
    { name: 'Liquiditätsgrad 3', formel: 'Umlaufvermögen / kfr. Fremdkapital × 100', erklaerung: 'Zielgrösse: ≥ 150 %' },
    { name: 'Anlagedeckungsgrad 1', formel: 'Eigenkapital / Anlagevermögen × 100', erklaerung: 'Strenge Form der Anlagedeckung.' },
    { name: 'Anlagedeckungsgrad 2', formel: '(Eigenkapital + lfr. Fremdkapital) / Anlagevermögen × 100', erklaerung: 'Zielgrösse: ≥ 100 % (goldene Bilanzregel)' },
    { name: 'Eigenkapitalrendite', formel: 'Reingewinn / Eigenkapital × 100', erklaerung: 'Verzinsung des eingesetzten Eigenkapitals.' },
    { name: 'Gesamtkapitalrendite', formel: '(Reingewinn + FK-Zinsen) / Gesamtkapital × 100', erklaerung: 'Ertragskraft unabhängig von Finanzierungsstruktur.' },
    { name: 'Umsatzrendite', formel: 'Reingewinn / Betriebsertrag × 100', erklaerung: 'Gewinn pro Umsatzfranken.' },
    { name: 'Cashflow (vereinfacht)', formel: 'Reingewinn + Abschreibungen', erklaerung: 'Innenfinanzierungskraft; Grundlage für Cashflow-Marge und Verschuldungsfaktor.' },
    { name: 'Verschuldungsfaktor', formel: 'Effektivverschuldung / Cashflow', erklaerung: 'Effektivverschuldung = Fremdkapital – (Flüssige Mittel + Forderungen).' },
    { name: 'Debitorenumschlag', formel: 'Kreditverkäufe / Debitorenbestand', erklaerung: 'Zielgrösse: ≥ 8× pro Jahr.' },
    { name: 'Durchschn. Kundenfrist', formel: '360 Tage / Debitorenumschlag', erklaerung: 'Zielgrösse: < 45 Tage.' },
  ])
  // Bilanzanalyse hat keine Buchungssätze
  console.log('✓ Kapitel 11: Analyse Bilanz und Erfolgsrechnung')
}

await client.end()
console.log('\n✅ Alle 8 Kapitel erfolgreich befüllt!')
