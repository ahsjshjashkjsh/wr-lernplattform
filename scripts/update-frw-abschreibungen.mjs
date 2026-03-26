import pg from 'pg'
import { randomUUID } from 'crypto'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

async function getChapterId(slug) {
  const { rows } = await client.query(`SELECT id FROM "Chapter" WHERE slug = $1`, [slug])
  return rows[0]?.id ?? null
}

async function clearChapter(id) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId" = $1`, [id])
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId" = $1`, [id])
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId" = $1`, [id])
  await client.query(`DELETE FROM "Formula" WHERE "chapterId" = $1`, [id])
  await client.query(`DELETE FROM "BookingEntry" WHERE "chapterId" = $1`, [id])
  await client.query(`UPDATE "Chapter" SET summary = NULL WHERE id = $1`, [id])
}

async function setSummary(id, text) {
  await client.query(`UPDATE "Chapter" SET summary = $1 WHERE id = $2`, [text, id])
}

async function addGoals(id, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [randomUUID(), goals[i], id, i])
}

async function addTerms(id, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`,
      [randomUUID(), terms[i].term, terms[i].def, id, i])
}

async function addCorePoints(id, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [randomUUID(), points[i], id, i])
}

async function addFormulas(id, formulas) {
  for (let i = 0; i < formulas.length; i++)
    await client.query(`INSERT INTO "Formula" (id, name, formel, erklaerung, "chapterId", "order") VALUES ($1,$2,$3,$4,$5,$6)`,
      [randomUUID(), formulas[i].name, formulas[i].formel, formulas[i].erklaerung, id, i])
}

async function addEntries(id, entries) {
  for (let i = 0; i < entries.length; i++)
    await client.query(`INSERT INTO "BookingEntry" (id, situation, "sollKonto", "habenKonto", "betragHint", erklaerung, "chapterId", "order") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [randomUUID(), entries[i].situation, entries[i].soll, entries[i].haben, entries[i].betrag ?? null, entries[i].erklaerung, id, i])
}

// ══════════════════════════════════════════════════════════════════════════════
// abschreibungen-methoden — Grundlagen, Berechnung, Methoden
// ══════════════════════════════════════════════════════════════════════════════
{
  const id = await getChapterId('abschreibungen-methoden')
  await clearChapter(id)

  await setSummary(id,
    `Eine Abschreibung ist die planmässige buchhalterische Erfassung der Wertverminderung einer Sachanlage über ihre Nutzungsdauer. Anlagen verlieren an Wert wegen Abnützung durch Gebrauch, Alterung und technischer Überholung. Aktivierungskriterien: Ein Gegenstand wird nur dann als Anlagevermögen aktiviert, wenn er längerfristig genutzt wird und die Anschaffungskosten CHF 1'000 übersteigen. Kleinere Beträge werden direkt als Aufwand verbucht. Anschaffungswert = Kaufpreis brutto − Rabatt/Skonto − vorsteuerfähige MWST + Transport + Installation. Lineare Abschreibung: Jedes Jahr wird derselbe Betrag abgeschrieben (AW ÷ Nutzungsdauer). Buchwert sinkt gleichmässig, am Ende CHF 0 oder CHF 1 (Pro-Memoria-Posten). Degressive Abschreibung: Jedes Jahr wird ein Prozentsatz vom aktuellen Buchwert abgeschrieben. Beträge sinken jährlich — am Anfang am höchsten. Im letzten Jahr muss der verbleibende Rest vollständig abgeschrieben werden. Steuerliche Höchstsätze degressiv: Mobiliar max. 25%, Fahrzeuge max. 40%.`
  )

  await addGoals(id, [
    'Aktivierungskriterien beurteilen: Wann wird ein Gut als Anlagevermögen aktiviert (CHF 1\'000-Grenze)?',
    'Anschaffungswert korrekt berechnen: Kaufpreis brutto − Rabatt/Skonto − MWST + Transport + Installation',
    'Lineare Abschreibung berechnen: AW ÷ Nutzungsdauer = gleicher Betrag pro Jahr',
    'Degressiven Abschreibungssatz auf Buchwert anwenden und Abschreibungsplan erstellen',
    'Lineare und degressive Methode vergleichen: Unterschiede bei Rechenbasis und Betragsverlauf',
  ])

  await addTerms(id, [
    { term: 'Abschreibung', def: 'Planmässige buchhalterische Erfassung der Wertverminderung einer Sachanlage als Aufwand. Aufwand ja — Ausgabe nein (Geldabfluss war beim Kauf).' },
    { term: 'Aktivierungskriterien', def: 'Zwei Bedingungen: (1) längerfristige Nutzung, (2) Anschaffungskosten über CHF 1\'000. Nur dann als Anlage aktivieren — sonst direkt als Aufwand verbuchen.' },
    { term: 'Anschaffungswert (AW)', def: 'Kaufpreis brutto − Rabatt − Skonto − vorsteuerfähige MWST + Transport + Installation. Basis für alle Abschreibungsberechnungen.' },
    { term: 'Lineare Abschreibung', def: 'Jedes Jahr derselbe CHF-Betrag: AW ÷ Nutzungsdauer. Buchwert sinkt gleichmässig (gerade Linie). Am Ende: CHF 0 oder CHF 1 (Pro-Memoria).' },
    { term: 'Degressive Abschreibung', def: 'Gleicher Prozentsatz auf den Buchwert des Vorjahres. Beträge sinken jährlich — am Anfang am grössten. Erreicht nie exakt CHF 0.' },
    { term: 'Buchwert (Restwert)', def: 'Anschaffungswert − Totalabschreibungen. Bei degressiver Methode: Rechenbasis für die nächste Jahres-Abschreibung.' },
    { term: 'Totalabschreibungen', def: 'Summe aller bisher verbuchten Abschreibungen seit dem Kauf der Anlage.' },
    { term: 'Pro-Memoria-Franken', def: 'CHF 1.− Restwert bei linearer Methode, wenn das Gut nach Ablauf der Nutzungsdauer weiterhin im Betrieb bleibt.' },
    { term: 'Nutzungsdauer', def: 'Voraussichtliche Jahre der betrieblichen Nutzung — bestimmt den linearen Abschreibungssatz (100% ÷ Jahre).' },
  ])

  await addCorePoints(id, [
    'Abschreibungen sind Aufwand (erfolgswirksam), aber KEINE Ausgabe (nicht liquiditätswirksam) — der Geldabfluss war beim Kauf.',
    'Aktivierungsgrenze CHF 1\'000: darunter direkt als Aufwand buchen, nicht aktivieren.',
    'Linear: AW ÷ Nutzungsdauer = gleicher Betrag → gleichmässige Gerade → Buchwert CHF 0 am Ende.',
    'Degressiv: Buchwert × Satz% → hohe Abschreibung am Anfang, sinkend → im letzten Jahr Rest vollständig abschreiben.',
    'Steuerliche Höchstsätze degressiv: Mobiliar max. 25%, Fahrzeuge max. 40%. Lineare Sätze sind halb so hoch.',
    'Degressiver Satz ist meist doppelt so hoch wie der lineare (Beispiel: 12.5% linear → 25% degressiv).',
  ])

  await addFormulas(id, [
    { name: 'Anschaffungswert', formel: 'Kaufpreis brutto − Rabatt − Skonto − vorsteuerfähige MWST + Transport + Installation', erklaerung: 'Beispiel: Rechnung CHF 25\'800 − 10% Rabatt (2\'580) + Transport (780) = CHF 24\'000 Anschaffungswert.' },
    { name: 'Lineare Abschreibung pro Jahr', formel: 'AW ÷ Nutzungsdauer', erklaerung: 'Beispiel: CHF 24\'000 ÷ 8 Jahre = CHF 3\'000 pro Jahr. Gleicher Betrag jedes Jahr.' },
    { name: 'Linearer Abschreibungssatz', formel: '100 % ÷ Nutzungsdauer', erklaerung: 'Beispiel: 100% ÷ 8 Jahre = 12.5% pro Jahr.' },
    { name: 'Buchwert', formel: 'Anschaffungswert − Totalabschreibungen', erklaerung: 'Totalabschreibungen = Summe aller bisherigen jährlichen Abschreibungen seit Kauf.' },
    { name: 'Degressive Abschreibung pro Jahr', formel: 'Buchwert des Vorjahres × Abschreibungssatz %', erklaerung: 'Beispiel: Buchwert CHF 18\'000 × 25% = CHF 4\'500. Basis ist immer der aktuelle Buchwert, nicht der AW.' },
    { name: 'Aktivierungsgrenze', formel: 'Anschaffungskosten ≥ CHF 1\'000 UND längerfristige Nutzung', erklaerung: 'Unter CHF 1\'000: direkt als Aufwand buchen (z.B. Büroaufwand / Kasse). Kein Aktivieren.' },
  ])

  console.log('✓ abschreibungen-methoden')
}

// ══════════════════════════════════════════════════════════════════════════════
// abschreibungen — Verbuchung, Verkauf, Selbstfinanzierung
// ══════════════════════════════════════════════════════════════════════════════
{
  const id = await getChapterId('abschreibungen')
  await clearChapter(id)

  await setSummary(id,
    `Direkte Abschreibung: Der Abschreibungsbetrag wird direkt im Haben des Anlagekontos gebucht (Abschreibungen / Mobiliar). Das Anlagekonto wird kleiner, der Buchwert ist direkt sichtbar — der ursprüngliche Anschaffungswert aber nicht mehr erkennbar. Indirekte Abschreibung: Es wird ein separates Wertberichtigungskonto (WB) geführt (Abschreibungen / WB Mobiliar). Das Anlagekonto bleibt immer auf dem Anschaffungswert stehen. Das WB-Konto sammelt alle Abschreibungen. In der Bilanz: AW − WB = Buchwert. Das WB-Konto ist ein Minus-Aktivkonto, folgt aber Buchungsregeln eines Passivkontos (Zunahme im Haben). Beim Verkauf (indirekte Methode): Schritt 1 — Erlös buchen (Kasse / Mobiliar). Schritt 2 — WB auflösen (WB Mobiliar / Mobiliar). Schritt 3 — Gewinn (Mobiliar / A.o. Ertrag) oder Verlust (A.o. Aufwand / Mobiliar). Abschreibungen fördern die Selbstfinanzierung: kein Geldabfluss, aber Gewinnminderung → liquide Mittel verbleiben für Ersatzinvestitionen im Unternehmen.`
  )

  await addGoals(id, [
    'Direkte Abschreibung buchen: Abschreibungen / Anlagekonto',
    'Indirekte Abschreibung buchen: Abschreibungen / WB-Konto, Bilanzausweis erklären',
    'Beim Anlagenverkauf (direkte Methode): Erlös + Gewinn/Verlust in zwei Schritten buchen',
    'Beim Anlagenverkauf (indirekte Methode): Erlös, WB auflösen, Gewinn/Verlust in drei Schritten buchen',
    'Selbstfinanzierungseffekt von Abschreibungen erklären (Aufwand ohne Ausgabe)',
  ])

  await addTerms(id, [
    { term: 'Direkte Abschreibung', def: 'Buchung: Abschreibungen / Anlagekonto. Buchwert direkt im Anlagekonto sichtbar. Anschaffungswert nicht mehr erkennbar.' },
    { term: 'Indirekte Abschreibung', def: 'Buchung: Abschreibungen / WB-Konto. Anlagekonto bleibt auf AW. WB-Konto sammelt Totalabschreibungen. In Bilanz: AW − WB = Buchwert.' },
    { term: 'Wertberichtigungskonto (WB)', def: 'Minus-Aktivkonto — steht auf der Aktivseite, folgt aber Passiv-Buchungsregeln: Zunahme im Haben. Kumuliert alle bisherigen Abschreibungen.' },
    { term: 'Liquiditätsunwirksamkeit', def: 'Abschreibungen sind Aufwand in der Erfolgsrechnung, führen aber zu keinem neuen Geldabfluss. Der Geldabfluss war beim Kauf.' },
    { term: 'Selbstfinanzierungseffekt', def: 'Abschreibungen mindern den Gewinn → weniger Steuern/Dividenden → liquide Mittel verbleiben im Unternehmen für spätere Ersatzinvestitionen.' },
    { term: 'Veräusserungsgewinn', def: 'Verkaufserlös > Buchwert → ausserordentlicher Ertrag. Buchung: Anlagekonto / A.o. Ertrag.' },
    { term: 'Veräusserungsverlust', def: 'Buchwert > Verkaufserlös → ausserordentlicher Aufwand. Buchung: A.o. Aufwand / Anlagekonto.' },
    { term: 'A.o. Ertrag / A.o. Aufwand', def: 'Ausserordentlicher Ertrag oder Aufwand beim Verkauf von Anlagen. Bei wesentlichen Beträgen: Anhang zur Jahresrechnung.' },
  ])

  await addCorePoints(id, [
    'Direkt: Abschreibungen / Mobiliar → Anlagekonto sinkt → Buchwert direkt sichtbar, AW verloren.',
    'Indirekt: Abschreibungen / WB Mobiliar → Anlagekonto bleibt auf AW, WB wächst → mehr Transparenz.',
    'Vergleich Bilanz direkt: nur Buchwert sichtbar. Bilanz indirekt: AW − WB − Buchwert alle sichtbar.',
    'Verkauf direkte Methode: (1) Erlös buchen (Kasse / Mobiliar), (2) Gewinn (Mobiliar / A.o. Ertrag) oder Verlust (A.o. Aufwand / Mobiliar).',
    'Verkauf indirekte Methode: (1) Erlös buchen, (2) WB auflösen (WB Mobiliar / Mobiliar), (3) Gewinn oder Verlust buchen.',
    'Schnellregel: Erlös > Buchwert = Gewinn. Buchwert > Erlös = Verlust. Erlös = Buchwert = kein Erfolg.',
    'Abschreibungen: erfolgswirksam JA, liquiditätswirksam NEIN.',
  ])

  await addEntries(id, [
    {
      situation: 'Jährliche Abschreibung buchen — direkte Methode (Anlagekonto direkt reduzieren)',
      soll: 'Abschreibungen',
      haben: 'Mobiliar (oder Fahrzeuge / Maschinen)',
      betrag: 'AW ÷ Nutzungsdauer (linear) oder Buchwert × Satz% (degressiv)',
      erklaerung: 'Das Anlagekonto wird direkt kleiner. Buchwert ist der neue Saldo des Anlagekontos. Anschaffungswert nicht mehr sichtbar.',
    },
    {
      situation: 'Jährliche Abschreibung buchen — indirekte Methode (Wertberichtigungskonto)',
      soll: 'Abschreibungen',
      haben: 'WB Mobiliar (oder WB Fahrzeuge / WB Maschinen)',
      betrag: 'AW ÷ Nutzungsdauer (linear) oder Buchwert × Satz% (degressiv)',
      erklaerung: 'Anlagekonto bleibt auf Anschaffungswert. WB-Konto sammelt alle bisherigen Abschreibungen. Bilanz zeigt: Mobiliar − WB Mobiliar = Buchwert.',
    },
    {
      situation: 'Anschaffung einer Anlage inkl. Bezugskosten (z.B. Büroeinrichtung + Transport)',
      soll: 'Mobiliar',
      haben: 'Verb. L+L / Kasse / Bank',
      betrag: 'AW = Kaufpreis − Rabatt/Skonto + Transport + Installation',
      erklaerung: 'Beispiel: Rechnung CHF 25\'800, Rabatt 10% (−2\'580), Transport CHF 780 bar → AW = CHF 24\'000. Buchungen: Mobiliar/Verb. L+L 25\'800; Mobiliar/Kasse 780; Verb. L+L/Mobiliar 2\'580; Verb. L+L/Bank 23\'220.',
    },
    {
      situation: 'Verkauf Anlage (direkte Methode) — Erlös unter Buchwert → Verlust',
      soll: 'Kasse / Bank / Ford. L+L / A.o. Aufwand',
      haben: 'Mobiliar',
      betrag: 'Schritt 1: Erlös; Schritt 2: Verlust (Buchwert − Erlös)',
      erklaerung: 'Beispiel: AW 24\'000, 3 Jahre à 3\'000 linear → BW 15\'000. Erlös bar CHF 8\'800 → Verlust CHF 6\'200. Buchung 1: Kasse/Mobiliar 8\'800. Buchung 2: A.o. Aufwand/Mobiliar 6\'200.',
    },
    {
      situation: 'Verkauf Anlage (indirekte Methode) — Erlös über Buchwert → Gewinn',
      soll: 'Kasse / Bank / Ford. L+L / WB Mobiliar',
      haben: 'Mobiliar / A.o. Ertrag',
      betrag: 'Schritt 1: Erlös; Schritt 2: WB auflösen; Schritt 3: Gewinn (Erlös − Buchwert)',
      erklaerung: 'Beispiel: AW 24\'000, 5 Jahre à 3\'000 → Total-WB 15\'000, BW 9\'000. Erlös bar CHF 10\'500 → Gewinn CHF 1\'500. Buchung 1: Kasse/Mobiliar 10\'500. Buchung 2: WB Mobiliar/Mobiliar 15\'000. Buchung 3: Mobiliar/A.o. Ertrag 1\'500.',
    },
  ])

  console.log('✓ abschreibungen')
}

await client.end()
console.log('\n✅ Abschreibungen vollständig aktualisiert (Inhalt aus Lehrbuch)')
