/**
 * seed-frw-theorie.mjs
 * Adds summaries, learning goals, key terms and core points to all FRW chapters.
 * Safe to re-run: checks chapter by slug before inserting.
 */
import pg from 'pg'
import { randomUUID } from 'crypto'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

async function getChapterId(slug) {
  const { rows } = await client.query(`SELECT id FROM "Chapter" WHERE slug = $1`, [slug])
  return rows[0]?.id ?? null
}

async function setSummary(chapterId, summary) {
  await client.query(`UPDATE "Chapter" SET summary = $1 WHERE id = $2`, [summary, chapterId])
}

async function addGoals(chapterId, goals) {
  for (let i = 0; i < goals.length; i++) {
    await client.query(
      `INSERT INTO "LearningGoal" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [randomUUID(), goals[i], chapterId, i]
    )
  }
}

async function addTerms(chapterId, terms) {
  for (let i = 0; i < terms.length; i++) {
    const t = terms[i]
    await client.query(
      `INSERT INTO "KeyTerm" (id, term, definition, "chapterId", "order") VALUES ($1,$2,$3,$4,$5)`,
      [randomUUID(), t.term, t.def, chapterId, i]
    )
  }
}

async function addCorePoints(chapterId, points) {
  for (let i = 0; i < points.length; i++) {
    await client.query(
      `INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES ($1,$2,$3,$4)`,
      [randomUUID(), points[i], chapterId, i]
    )
  }
}

async function seed(slug, { summary, goals = [], terms = [], corePoints = [] }) {
  const id = await getChapterId(slug)
  if (!id) { console.warn(`  ⚠ Kapitel nicht gefunden: ${slug}`); return }
  await setSummary(id, summary)
  if (goals.length) await addGoals(id, goals)
  if (terms.length) await addTerms(id, terms)
  if (corePoints.length) await addCorePoints(id, corePoints)
  console.log(`  ✓ ${slug}`)
}

// ══════════════════════════════════════════════════════════════════════════════
// KAP 1 — LÖHNE & GEHÄLTER
// ══════════════════════════════════════════════════════════════════════════════
console.log('Kap 1: Löhne & Gehälter')

await seed('lohnbuchhaltung', {
  summary: `Der Bruttolohn ist der vertraglich vereinbarte Lohn vor allen Abzügen. Davon werden die Arbeitnehmer-Beiträge (AN-Beiträge) abgezogen — der Rest ist der Nettolohn, der ausbezahlt wird. Zusätzlich trägt der Arbeitgeber eigene AG-Beiträge, die seine gesamten Lohnkosten erhöhen. AHV/IV/EO: je 5,3% für AN und AG. ALV: je 1,1% für AN und AG (nur auf Lohn bis CHF 148'200 pro Jahr). NBU (Nichtberufsunfall): wird ausschliesslich vom Arbeitnehmer getragen, Satz je nach Branche. BVG (Pensionskasse): mindestens 50% zahlt der AG, Rest der AN.`,
  goals: [
    'Eine vollständige Lohnabrechnung mit allen AN-Abzügen erstellen können',
    'AN- und AG-Beiträge für AHV/IV/EO, ALV, NBU und BVG korrekt berechnen',
    'Die Buchungen für Lohnabrechnung, Nettolohnzahlung und Sozialversicherungsbeiträge durchführen',
    'Den Unterschied zwischen Bruttolohn, Nettolohn und Gesamtlohnkosten erklären',
  ],
  terms: [
    { term: 'Bruttolohn', def: 'Vertraglich vereinbarter Lohn vor allen Abzügen.' },
    { term: 'Nettolohn', def: 'Bruttolohn minus alle AN-Abzüge — der effektiv ausbezahlte Betrag.' },
    { term: 'AHV / IV / EO', def: 'Sozialversicherungen: je 5,3% Anteil AN und AG. Zusammen 10,6% auf den Bruttolohn.' },
    { term: 'ALV', def: 'Arbeitslosenversicherung: je 1,1% AN und AG, max. auf CHF 148\'200 Jahreslohn.' },
    { term: 'NBU', def: 'Nichtberufsunfallversicherung — trägt allein der Arbeitnehmer. Satz je nach Branche.' },
    { term: 'BVG', def: 'Berufliche Vorsorge (Pensionskasse). AG zahlt mindestens 50%, Rest der AN.' },
    { term: 'Ausgleichskasse', def: 'Einzugsstelle für AHV / IV / EO und ALV-Beiträge (AN + AG zusammen).' },
    { term: 'Gesamtlohnkosten', def: 'Bruttolohn plus alle AG-Beiträge — die effektiven Kosten für den Arbeitgeber.' },
  ],
  corePoints: [
    'AHV/IV/EO: 5,3% AN + 5,3% AG = 10,6% total auf Bruttolohn.',
    'ALV: 1,1% AN + 1,1% AG — nur auf Lohn bis CHF 148\'200 (Solidaritätsprozent über dieser Grenze).',
    'NBU: trägt nur der Arbeitnehmer (z.B. 0,504% je nach Branche).',
    'BVG: Pensionskasse — AG zahlt mindestens 50% des Beitrags.',
    'Die Verbindlichkeit gegenüber der Ausgleichskasse umfasst AN- UND AG-Beiträge zusammen.',
  ],
})

await seed('loehne-gehaelter', {
  summary: `Spesen sind Auslagen, die der Arbeitnehmer im Auftrag des Arbeitgebers macht. Pauschalspesen bis zu den ESTV-Ansätzen sind kein Lohnbestandteil — sie sind nicht AHV-pflichtig und werden direkt als Spesenaufwand gebucht. Effektive Spesen werden gegen Originalbeleg 1:1 erstattet. Naturallohn (z.B. Gratisverpflegung, Dienstwohnung, Privatanteil Geschäftsauto) ist ein geldwerter Vorteil und gilt als Lohnbestandteil — er ist AHV-pflichtig und muss auf dem Lohnausweis deklariert werden. Kinderzulagen werden vom Arbeitgeber vorgestreckt und von der Ausgleichskasse vollständig zurückerstattet.`,
  goals: [
    'Pauschalspesen und effektive Spesen korrekt buchen',
    'Naturallohn als Lohnbestandteil erkennen und verbuchen',
    'Kinderzulagen: Auszahlung und Rückerstattung durch die Ausgleichskasse buchen',
    'AHV-Pflichtigkeit von verschiedenen Entschädigungen beurteilen',
  ],
  terms: [
    { term: 'Pauschalspesen', def: 'Pauschalbetrag für Auslagen — bis ESTV-Ansätze nicht AHV-pflichtig und kein Lohnbestandteil.' },
    { term: 'Naturallohn', def: 'Geldwerter Vorteil (Essen, Wohnung, Fahrzeug) — gilt als Lohn und ist AHV-pflichtig.' },
    { term: 'Lohnausweis', def: 'Jährliches Dokument an den Arbeitnehmer mit allen Lohnbestandteilen inkl. Naturallohn.' },
    { term: 'Kinderzulagen', def: 'Kantonale Zulagen (mind. CHF 200/Kind/Monat): AG zahlt vor, AK erstattet zurück.' },
    { term: 'ESTV-Ansätze', def: 'Vom Bund festgelegte Pauschalen für Spesen — bis dahin steuerfrei und nicht AHV-pflichtig.' },
  ],
  corePoints: [
    'Pauschalspesen = Spesenaufwand / Bank — kein AHV-Beitrag.',
    'Naturallohn = Lohnaufwand / Warenaufwand (oder Mietaufwand) — AHV-pflichtig.',
    'Kinderzulagen-Auszahlung: Lohnaufwand / Bank; Rückerstattung: Bank / Lohnaufwand.',
  ],
})

// ══════════════════════════════════════════════════════════════════════════════
// KAP 2 — FREMDE WÄHRUNGEN
// ══════════════════════════════════════════════════════════════════════════════
console.log('Kap 2: Fremde Währungen')

await seed('waehrungsumrechnung', {
  summary: `Bei Geschäften in Fremdwährung verwendet man zwei verschiedene Kurse: den Buchkurs und den Tageskurs. Der Buchkurs ist der Wechselkurs am Tag der Rechnungsstellung — er wird für die erste Buchung (Forderung oder Verbindlichkeit) verwendet. Der Tageskurs ist der Wechselkurs am tatsächlichen Zahlungstag — er weicht vom Buchkurs ab, wenn sich der Kurs zwischenzeitlich verändert hat. Die Differenz zwischen den beiden Kursen ergibt entweder einen Kursverlust (Aufwand) oder einen Kursgewinn (Ertrag). Kurs = CHF pro 1 Einheit Fremdwährung (oder per 100 bei kleinen Währungen).`,
  goals: [
    'Buchkurs und Tageskurs voneinander unterscheiden und richtig anwenden',
    'Fremdwährungsbeträge in CHF umrechnen',
    'Kursdifferenzen als Kursverlust oder Kursgewinn erkennen und berechnen',
  ],
  terms: [
    { term: 'Buchkurs', def: 'Wechselkurs am Tag der Rechnungsstellung — Basis für die erste Buchung.' },
    { term: 'Tageskurs', def: 'Wechselkurs am tatsächlichen Zahlungstag — kann höher oder tiefer als Buchkurs sein.' },
    { term: 'Kursverlust', def: 'Entsteht, wenn die Zahlung in CHF mehr kostet als ursprünglich gebucht (Aufwand).' },
    { term: 'Kursgewinn', def: 'Entsteht, wenn die Zahlung in CHF weniger kostet als ursprünglich gebucht (Ertrag).' },
    { term: 'Devisen', def: 'Ausländische Währungen (EUR, USD, GBP...) die im Zahlungsverkehr eingesetzt werden.' },
    { term: 'Kursdifferenz', def: 'Differenz zwischen dem gebuchten CHF-Betrag (Buchkurs) und dem bezahlten CHF-Betrag (Tageskurs).' },
  ],
  corePoints: [
    'Buchkurs = Kurs am Rechnungsdatum → für die Verbindlichkeit / Forderung.',
    'Tageskurs = Kurs am Zahlungstag → für die Bankbuchung.',
    'Kursverlust: Fremdwährung wurde teurer → mehr CHF bezahlt als gebucht.',
    'Kursgewinn: Fremdwährung wurde günstiger → weniger CHF bezahlt als gebucht.',
  ],
})

await seed('fremde-waehrung', {
  summary: `Beim Wareneinkauf in Fremdwährung (z.B. EUR) wird die Verbindlichkeit mit dem Buchkurs (= Kurs am Rechnungsdatum) in CHF bewertet und gebucht. Wenn der Kunde später zahlt, wird der aktuelle Tageskurs verwendet. Ist der EUR-Kurs gestiegen (EUR teurer): Es müssen mehr CHF bezahlt werden → Kursverlust. Ist der EUR-Kurs gesunken (EUR günstiger): Es werden weniger CHF bezahlt → Kursgewinn. Beim Verkauf auf Rechnung ist es umgekehrt: Kursgewinn wenn die Fremdwährung teurer wurde (mehr CHF eingeht), Kursverlust wenn sie günstiger wurde.`,
  goals: [
    'Einkauf und Verkauf in Fremdwährung mit Buchkurs korrekt verbuchen',
    'Bei Zahlung die Kursdifferenz berechnen und als Kursverlust oder Kursgewinn buchen',
    'Die Wirkung von Kursschwankungen auf Aufwand und Ertrag erklären',
  ],
  terms: [
    { term: 'Einkauf auf Rechnung (FW)', def: 'Verbindlichkeit aus LuL wird zum Buchkurs in CHF bewertet.' },
    { term: 'Kursverlust Einkauf', def: 'Fremdwährung bei Zahlung teurer → Mehr CHF nötig → Aufwand.' },
    { term: 'Kursgewinn Einkauf', def: 'Fremdwährung bei Zahlung günstiger → Weniger CHF nötig → Ertrag.' },
    { term: 'Kursverlust Verkauf', def: 'Fremdwährung bei Eingang günstiger → Weniger CHF erhalten → Aufwand.' },
    { term: 'Kursgewinn Verkauf', def: 'Fremdwährung bei Eingang teurer → Mehr CHF erhalten → Ertrag.' },
  ],
  corePoints: [
    'Einkauf Rechnung: Warenaufwand / Verbindl. aus LuL (zum Buchkurs).',
    'Zahlung Einkauf (Kurs gestiegen): Verbindl. + Kursverlust / Bank (zum Tageskurs).',
    'Zahlung Einkauf (Kurs gesunken): Verbindl. / Bank + Kursgewinn (zum Tageskurs).',
    'Verkauf Rechnung: Forderungen aus LuL / Warenertrag (zum Buchkurs).',
    'Eingang Zahlung (Kurs gestiegen): Bank / Forderungen + Kursgewinn.',
    'Eingang Zahlung (Kurs gesunken): Bank + Kursverlust / Forderungen.',
  ],
})

// ══════════════════════════════════════════════════════════════════════════════
// KAP 3 — VERLUSTE AUS FORDERUNGEN
// ══════════════════════════════════════════════════════════════════════════════
console.log('Kap 3: Verluste aus Forderungen')

await seed('debitorenverluste', {
  summary: `Wenn ein Kunde nicht zahlt, entsteht ein Debitorenverlust. Es gibt zwei Methoden: Die direkte Abschreibung bucht die Forderung sofort aus (Debitorenverlust / Debitoren). Die indirekte Methode bildet im Voraus eine pauschale Wertberichtigung auf dem gesamten Debitorenbestand — das Delkredere. Das Delkredere ist ein Gegenkonto zu den Debitoren und mindert deren Buchwert. Typischer Satz: 5% auf alle inländischen Debitoren. Das Delkredere folgt dem Vorsichtsprinzip: Verluste werden antizipiert, bevor sie tatsächlich eintreten.`,
  goals: [
    'Direktabschreibung einer Forderung buchen',
    'Delkredere berechnen (% auf Debitorenbestand) und in der Bilanz einordnen',
    'Erhöhung und Senkung des Delkredere sowie den konkreten Debitorenverlust buchen',
    'Direktabschreibung von indirekter Abschreibung unterscheiden',
  ],
  terms: [
    { term: 'Debitorenverlust', def: 'Konkret eingetretener Forderungsausfall eines bestimmten Kunden.' },
    { term: 'Delkredere', def: 'Pauschale Wertberichtigung auf den gesamten Debitorenbestand (z.B. 5%).' },
    { term: 'Direktabschreibung', def: 'Forderung wird beim konkreten Ausfall sofort ausgebucht.' },
    { term: 'Wertberichtigung', def: 'Gegenkonto zu Debitoren — kumuliert die geschätzten Verluste.' },
    { term: 'Vorsichtsprinzip', def: 'Erwartete Verluste werden bereits vor ihrem Eintreten berücksichtigt.' },
  ],
  corePoints: [
    'Direktabschreibung: Debitorenverlust / Debitoren.',
    'Delkredere erhöhen: Delkredereaufwand / Delkredere.',
    'Delkredere senken: Delkredere / Delkredereertrag.',
    'Konkreter Verlust bei bestehendem Delkredere: Delkredere / Debitoren (kein Aufwand nötig).',
    'Delkredere erscheint auf der Aktivseite der Bilanz als Minus zu den Debitoren.',
  ],
})

await seed('verluste-forderungen', {
  summary: `Das Delkredere ist eine Schätzung der voraussichtlichen Verluste auf dem Debitorenbestand. Es wird regelmässig dem aktuellen Bestand angepasst. Ist der Soll-Betrag höher als der Ist-Betrag: Delkredereaufwand / Delkredere (Erhöhung). Ist der Soll-Betrag tiefer: Delkredere / Delkredereertrag (Senkung). Bei einem konkreten Verlust: Falls das Delkredere ausreicht → Delkredere / Debitoren. Falls kein Delkredere oder zu klein → Debitorenverlust / Debitoren.`,
  goals: [
    'Delkredere-Anpassungsbuchungen (Erhöhung und Senkung) durchführen',
    'Konkreten Debitorenverlust mit und ohne bestehendes Delkredere buchen',
    'Mehrwertsteuerkorrekturen bei Debitorenverlusten erklären',
  ],
  terms: [
    { term: 'Soll-Delkredere', def: 'Berechneter Ziel-Betrag (% des aktuellen Debitorenbestands).' },
    { term: 'Ist-Delkredere', def: 'Aktueller Saldo des Delkredere-Kontos (bisherige Buchungen).' },
    { term: 'Delkredereaufwand', def: 'Aufwand bei Erhöhung des Delkredere.' },
    { term: 'Delkredereertrag', def: 'Ertrag bei Senkung des Delkredere.' },
    { term: 'MWST-Korrektur', def: 'Bei Debitorenverlusten kann die bereits abgeführte MWST zurückgefordert werden.' },
  ],
})

// ══════════════════════════════════════════════════════════════════════════════
// KAP 4 — ABSCHREIBUNGEN
// ══════════════════════════════════════════════════════════════════════════════
console.log('Kap 4: Abschreibungen')

await seed('abschreibungen-methoden', {
  summary: `Anlagen verlieren über die Zeit an Wert — dieser Wertverlust wird als Abschreibung erfasst. Lineare Abschreibung: Jedes Jahr wird der gleiche CHF-Betrag abgeschrieben (Anschaffungswert geteilt durch Nutzungsdauer). Der Buchwert sinkt gleichmässig auf null (oder Restwert). Degressive Abschreibung: Jedes Jahr wird der gleiche Prozentsatz auf den aktuellen Buchwert angewendet. Der Abschreibungsbetrag sinkt jedes Jahr, der Buchwert nähert sich asymptotisch null an (niemals genau null). Die degressive Methode belastet frühe Jahre stärker.`,
  goals: [
    'Lineare Abschreibung berechnen (Betrag pro Jahr)',
    'Degressive Abschreibung berechnen (Satz auf Buchwert)',
    'Abschreibungsplan für mehrere Jahre erstellen (AW, Abschreibung, Buchwert)',
    'Linear und degressiv vergleichen: Vorteile und Unterschiede',
  ],
  terms: [
    { term: 'Lineare Abschreibung', def: 'Gleicher CHF-Betrag jedes Jahr: Anschaffungswert ÷ Nutzungsdauer.' },
    { term: 'Degressive Abschreibung', def: 'Gleicher Prozentsatz auf den Buchwert — sinkende CHF-Beträge jedes Jahr.' },
    { term: 'Anschaffungswert (AW)', def: 'Kaufpreis plus Anschaffungsnebenkosten (Transport, Installation).' },
    { term: 'Buchwert (BW)', def: 'Anschaffungswert minus alle bisherigen Abschreibungen = aktueller Bilanzwert.' },
    { term: 'Nutzungsdauer', def: 'Voraussichtliche Jahre der betrieblichen Nutzung der Anlage.' },
    { term: 'Abschreibungsplan', def: 'Tabelle mit AW, jährlicher Abschreibung und Buchwert pro Jahr.' },
    { term: 'Restwert', def: 'Buchwert am Ende der Nutzungsdauer (bei linearer Methode oft CHF 1 oder 0).' },
  ],
  corePoints: [
    'Linear: Abschreibung = AW ÷ Nutzungsdauer (gleicher Betrag jedes Jahr).',
    'Degressiv: Abschreibung = aktueller Buchwert × Satz% (sinkender Betrag jedes Jahr).',
    'Degressiv belastet die frühen Jahre stärker — passend für Anlagen mit schnell sinkendem Nutzen.',
    'Buchwert bei linear: sinkt geradlinig. Bei degressiv: sinkt kurvenförmig (exponentiell).',
  ],
})

await seed('abschreibungen', {
  summary: `Direkte Abschreibung: Das Anlagekonto wird direkt auf der Habenseite reduziert (Abschreibungsaufwand / Anlagekonto). Vorteil: einfach. Nachteil: der ursprüngliche Anschaffungswert ist in der Bilanz nicht mehr sichtbar. Indirekte Abschreibung: Es wird ein separates Wertberichtigungskonto (WB) geführt (Abschreibungsaufwand / WB Anlagen). Das Anlagekonto bleibt immer zum Anschaffungswert stehen. Die Wertberichtigungen werden kumuliert. In der Bilanz erscheinen Anlagekonto minus WB = Buchwert. Vorteil: Anschaffungswert und Abschreibungsstand sind jederzeit sichtbar.`,
  goals: [
    'Direkte und indirekte Abschreibung buchen und unterscheiden',
    'Wertberichtigungskonto führen und Buchwert berechnen',
    'Verkauf einer Anlage (Gewinn oder Verlust) buchen',
  ],
  terms: [
    { term: 'Direkte Abschreibung', def: 'Anlagekonto direkt auf Haben reduzieren — AW nicht mehr in Bilanz sichtbar.' },
    { term: 'Indirekte Abschreibung', def: 'WB-Konto erhöhen, Anlagekonto bleibt bei AW — kumulierte Abschreibungen sichtbar.' },
    { term: 'Wertberichtigungskonto (WB)', def: 'Gegenkonto zur Anlage — kumuliert alle bisherigen Abschreibungen.' },
    { term: 'Buchwert', def: 'Anschaffungswert minus Wertberichtigungskonto = Bilanzwert der Anlage.' },
    { term: 'Anlagenverkauf mit Gewinn', def: 'Buchgewinn wenn Verkaufspreis > Buchwert: Buchgewinn auf Haben.' },
    { term: 'Anlagenverkauf mit Verlust', def: 'Buchverlust wenn Verkaufspreis < Buchwert: Buchverlust auf Soll.' },
  ],
})

// ══════════════════════════════════════════════════════════════════════════════
// KAP 5 — ZEITLICHE ABGRENZUNGEN
// ══════════════════════════════════════════════════════════════════════════════
console.log('Kap 5: Zeitliche Abgrenzungen')

await seed('transitorische-posten', {
  summary: `Transitorische Posten dienen der periodengerechten Abgrenzung — Aufwand und Ertrag müssen dem richtigen Geschäftsjahr zugeordnet werden. Transitorische Aktiven (TA): Bereits gezahlter Betrag, dessen Leistung erst im nächsten Jahr anfällt. Beispiel: Versicherungsprämie für Januar nächstes Jahr, bereits im Dezember bezahlt. TA ist ein aktiver Abgrenzungsposten. Transitorische Passiven (TP): Leistung wurde bereits erhalten oder Aufwand entstanden, aber noch nicht bezahlt. Beispiel: Dezember-Miete, die erst im Januar bezahlt wird. TP ist ein passiver Abgrenzungsposten (Verbindlichkeit).`,
  goals: [
    'Transitorische Aktiven und Transitorische Passiven unterscheiden und erklären',
    'Abgrenzungsbuchungen am Jahresende korrekt durchführen',
    'Auflösungsbuchungen im Folgejahr buchen',
  ],
  terms: [
    { term: 'Transitorische Aktiven (TA)', def: 'Vorauszahlung — bezahlt, aber Leistung kommt erst im nächsten Jahr. Aktive Rechnungsabgrenzung.' },
    { term: 'Transitorische Passiven (TP)', def: 'Aufwand entstanden, aber noch nicht bezahlt. Passive Rechnungsabgrenzung (kurzfristige Verbindlichkeit).' },
    { term: 'Periodenabgrenzung', def: 'Aufwand und Ertrag dem richtigen Geschäftsjahr zuordnen (Matching Principle).' },
    { term: 'Aktive Rechnungsabgrenzung', def: 'Vorausgezahlter Aufwand → als Aktiv-Posten bilanzieren.' },
    { term: 'Passive Rechnungsabgrenzung', def: 'Noch nicht bezahlter Aufwand → als Passiv-Posten bilanzieren.' },
  ],
  corePoints: [
    'TA Bildung am JE: Transitorische Aktiven / Aufwandkonto (Aufwand ins nächste Jahr verschieben).',
    'TP Bildung am JE: Aufwandkonto / Transitorische Passiven (Aufwand jetzt, Zahlung später).',
    'TA Auflösung im Folgejahr: Aufwandkonto / Transitorische Aktiven.',
    'TP Auflösung im Folgejahr: Transitorische Passiven / Bank (Zahlung erfolgt).',
    'Vorauszahlungen von Kunden = TP (Ertrag im nächsten Jahr).',
  ],
})

await seed('zeitliche-abgrenzungen', {
  summary: `Neben Transitorischen Posten gibt es Rückstellungen für ungewisse Verbindlichkeiten. Rückstellungen entstehen, wenn ein Aufwand wahrscheinlich anfallen wird, der genaue Betrag aber noch nicht feststeht. Beispiele: Garantierückstellungen, Ferienlohn-Rückstellungen, Steuerrückstellungen. Erhöhung: Rückstellungsaufwand / Rückstellungen. Auflösung (Rückstellung nicht mehr nötig): Rückstellungen / Rückstellungsertrag. Verwendung (Kosten treten tatsächlich ein): Rückstellungen / Bank oder Lieferanten.`,
  goals: [
    'Unterschied zwischen Transitorischen Passiven und Rückstellungen erklären',
    'Rückstellungen bilden, auflösen und verwenden buchen',
    'Typische Rückstellungsarten nennen (Garantie, Ferien, Steuern)',
  ],
  terms: [
    { term: 'Rückstellung', def: 'Vorsorge für wahrscheinliche aber betraglich ungewisse zukünftige Verpflichtungen.' },
    { term: 'Rückstellungsaufwand', def: 'Aufwand bei Bildung einer Rückstellung.' },
    { term: 'Rückstellungsertrag', def: 'Ertrag bei Auflösung einer nicht mehr benötigten Rückstellung.' },
    { term: 'Garantierückstellung', def: 'Rückstellung für erwartete Garantieleistungen auf verkaufte Produkte.' },
    { term: 'Ferienlohn-Rückstellung', def: 'Rückstellung für bereits erarbeitete, aber noch nicht bezogene Ferientage.' },
  ],
})

// ══════════════════════════════════════════════════════════════════════════════
// KAP 7 — EINZELUNTERNEHMUNG
// ══════════════════════════════════════════════════════════════════════════════
console.log('Kap 7: Einzelunternehmung')

await seed('einzelunternehmung', {
  summary: `Bei der Einzelunternehmung gehört das Unternehmen einer natürlichen Person. Das Eigenkapital ist das Reinvermögen (Aktiven minus Fremdkapital). Das Privatkonto sammelt alle unterjährigen Geldflüsse zwischen Inhaber und Unternehmen: Privatentnahmen (Geld für private Zwecke) auf der Sollseite, Privateinlagen (privates Geld eingebracht) auf der Habenseite. Am Jahresende wird das Privatkonto mit dem Eigenkapital saldiert. Der Jahresgewinn erhöht das Eigenkapital direkt. Privatentnahmen übersteigen in der Regel den Gewinn nicht — sonst sinkt das EK.`,
  goals: [
    'Privatentnahmen und Privateinlagen korrekt buchen',
    'Jahresabschluss einer Einzelunternehmung durchführen (Saldierung Privatkonto)',
    'Eigenkapitalveränderungen durch Gewinn, Verlust, Entnahmen und Einlagen berechnen',
  ],
  terms: [
    { term: 'Eigenkapital', def: 'Reinvermögen = Aktiven minus Fremdkapital.' },
    { term: 'Privatkonto', def: 'Sammelt Privatentnahmen (Soll) und Privateinlagen (Haben) während des Jahres.' },
    { term: 'Privatentnahme', def: 'Betrag den der Inhaber für private Zwecke aus dem Unternehmen entnimmt (senkt EK).' },
    { term: 'Privateinlage', def: 'Betrag den der Inhaber aus dem Privatvermögen ins Unternehmen einbringt (erhöht EK).' },
    { term: 'Saldierung Privatkonto', def: 'Jahresende: Privatkonto wird gegen Eigenkapital aufgelöst.' },
  ],
  corePoints: [
    'Privatentnahme: Privatkonto / Bank (oder Kasse).',
    'Privateinlage: Bank / Privatkonto.',
    'JE — Privatentnahmen überwiegen: Eigenkapital (Soll) / Privatkonto (Haben).',
    'JE — Privateinlagen überwiegen: Privatkonto (Soll) / Eigenkapital (Haben).',
    'Jahresgewinn: GuV / Eigenkapital. Verlust: Eigenkapital / GuV.',
  ],
})

// ══════════════════════════════════════════════════════════════════════════════
// KAP 8 — AKTIENGESELLSCHAFT
// ══════════════════════════════════════════════════════════════════════════════
console.log('Kap 8: AG')

await seed('aktiengesellschaft', {
  summary: `Die Aktiengesellschaft (AG) hat ein in Aktien aufgeteiltes Kapital. Jede Aktie hat einen Nennwert. Der Jahresgewinn wird gemäss OR und Statuten verteilt: Zuerst mindestens 5% in die gesetzliche Gewinnreserve (bis diese 20% des Aktienkapitals erreicht). Dann Dividenden an die Aktionäre (in % des Nennwerts). Ein allfälliger Rest wird als Gewinnvortrag ins nächste Jahr übertragen. Verluste werden zuerst aus dem Gewinnvortrag gedeckt, dann aus den Reserven. Kapitalerhöhung: neue Aktien werden ausgegeben — bei Emission über Nennwert entsteht ein Agio (= Reserven).`,
  goals: [
    'Gewinnverteilung einer AG berechnen (Gewinnreserve, Dividenden, Vortrag)',
    'Dividendenausschüttung verbuchen',
    'Kapitalerhöhung (Emission neuer Aktien) mit und ohne Agio buchen',
    'Verlustverrechnung einer AG durchführen',
  ],
  terms: [
    { term: 'Aktienkapital', def: 'Gezeichnetes Kapital = Anzahl Aktien × Nennwert.' },
    { term: 'Nennwert', def: 'Nominaler Wert einer Aktie (z.B. CHF 100).' },
    { term: 'Dividende', def: 'Gewinnausschüttung an Aktionäre (Prozent des Nennwerts).' },
    { term: 'Gesetzliche Gewinnreserve', def: 'Pflichtreserve: min. 5% des Jahresgewinns bis 20% des AK erreicht.' },
    { term: 'Bilanzgewinn', def: 'Jahresgewinn plus Gewinnvortrag aus dem Vorjahr.' },
    { term: 'Gewinnvortrag', def: 'Nicht ausgeschütteter Gewinnanteil — wird ins Folgejahr übertragen.' },
    { term: 'Agio (Emissionsagio)', def: 'Mehrbetrag über Nennwert bei Aktienausgabe — fliesst in die gesetzlichen Reserven.' },
  ],
  corePoints: [
    'Gewinnverteilung: Jahresgewinn → gesetzl. Gewinnreserve (5%) → Dividenden → Gewinnvortrag.',
    'Dividende: Gewinnvortrag / Verbindl. Dividenden; Zahlung: Verbindl. Dividenden / Bank.',
    'Kapitalerhöhung zum Nennwert: Bank / Aktienkapital.',
    'Kapitalerhöhung mit Agio: Bank / Aktienkapital + gesetzl. Kapitalreserve (Agio).',
    'Verlustverrechnung: Gewinnvortrag (bis aufgebraucht) → gesetzl. Reserven → Verlustvortrag.',
  ],
})

// ══════════════════════════════════════════════════════════════════════════════
// KAP 9 — BEWERTUNGSVORSCHRIFTEN & STILLE RESERVEN
// ══════════════════════════════════════════════════════════════════════════════
console.log('Kap 9: Bewertungsvorschriften')

await seed('stille-reserven', {
  summary: `Stille Reserven sind unsichtbare Reserven, die in der Bilanz nicht ausgewiesen werden. Sie entstehen durch Unterbewertung von Aktiven (Aktiv zu tief angesetzt) oder Überbewertung von Passiven (z.B. zu hohe Rückstellungen). Bildung einer stillen Reserve: Das Aktiv wird unter dem tatsächlichen Wert (Marktwert) bilanziert — es entsteht ein Aufwand. Auflösung: Das Aktiv wird höher bewertet — es entsteht ein Ertrag. Stille Reserven dienen als stiller Puffer für schlechte Jahre. Nach OR sind stille Reserven in gewissem Rahmen erlaubt.`,
  goals: [
    'Entstehung stiller Reserven durch Unter- oder Überbewertung erklären',
    'Bildung und Auflösung stiller Reserven buchen',
    'Stille Reserven auf Aktiv- und Passivseite erkennen',
  ],
  terms: [
    { term: 'Stille Reserve', def: 'Nicht ausgewiesene Reserve — Differenz zwischen Buchwert und effektivem Wert.' },
    { term: 'Unterbewertung Aktiven', def: 'Aktiv wird zu tief bilanziert → stille Reserve auf Aktivseite.' },
    { term: 'Überbewertung Passiven', def: 'Passiv (z.B. Rückstellung) zu hoch angesetzt → stille Reserve auf Passivseite.' },
    { term: 'Bildung stille Reserve', def: 'Aktiv herabsetzen → Aufwand entsteht (z.B. Warenabschreibung).' },
    { term: 'Auflösung stille Reserve', def: 'Aktiv höher bewerten → Ertrag entsteht (z.B. Warenwertzuschreibung).' },
    { term: 'Niederstwertprinzip', def: 'Aktiven werden zum tieferen von Anschaffungskosten oder Marktwert bewertet.' },
  ],
})

await seed('bewertungsvorschriften-vertieft', {
  summary: `Das OR regelt, wie Aktiven und Passiven bewertet werden dürfen. Anlagevermögen: maximal zu Anschaffungskosten abzüglich Abschreibungen. Umlaufvermögen — Debitoren: nach Niederstwertprinzip, abzüglich Delkredere. Warenvorräte: max. zu Anschaffungskosten; OR erlaubt Bewertung bis zu 2/3 des Marktwerts (= erlaubte stille Reserve). Wertschriften (kotiert): zum Börsenkurs am Bilanzstichtag. Fremdwährungsaktiven: zum Tageskurs am Bilanzstichtag umrechnen. Das Vorsichtsprinzip schützt Gläubiger — zu hohe Bewertung von Aktiven ist verboten.`,
  goals: [
    'OR-Bewertungsgrundsätze für verschiedene Aktivpositionen nennen',
    'Erlaubte stille Reserven bei Warenvorräten (2/3-Regel) erkennen',
    'Wertschriften und Fremdwährungspositionen korrekt bewerten',
  ],
  terms: [
    { term: 'Anschaffungskosten', def: 'Kaufpreis + Nebenkosten — Obergrenze für die Bewertung von Aktiven.' },
    { term: 'Niederstwertprinzip', def: 'Aktiven werden zum tieferen von AK und Marktwert bewertet.' },
    { term: '2/3-Regel Warenvorräte', def: 'Warenvorräte dürfen bis auf 2/3 des Marktwerts abgewertet werden (erlaubte stille Reserve).' },
    { term: 'Vorsichtsprinzip', def: 'Lieber zu niedrig als zu hoch bewerten — schützt Gläubiger.' },
    { term: 'Börsenkurs', def: 'Marktpreis von kotierten Wertschriften am Bilanzstichtag.' },
  ],
})

// ══════════════════════════════════════════════════════════════════════════════
// KAP 11 — KENNZAHLENANALYSE
// ══════════════════════════════════════════════════════════════════════════════
console.log('Kap 11: Kennzahlen')

await seed('liquiditaet-rentabilitaet', {
  summary: `Kennzahlen ermöglichen die objektive Beurteilung der Finanz- und Ertragslage. Liquiditätsgrade messen die kurzfristige Zahlungsfähigkeit: Grad 1 (Cash Ratio): Flüssige Mittel / kurzfristiges FK. Grad 2 (Quick Ratio): (FM + Forderungen) / kurzfristiges FK. Grad 3 (Current Ratio): Umlaufvermögen / kurzfristiges FK. Rentabilitätskennzahlen: Eigenkapitalrentabilität = Reingewinn / EK. Gesamtkapitalrentabilität = (Reingewinn + FK-Zinsen) / GK. Umsatzrendite = Reingewinn / Umsatz. Cashflow = Reingewinn + Abschreibungen + Rückstellungserhöhungen — zeigt die selbst finanzierten liquiden Mittel.`,
  goals: [
    'Liquiditätsgrade 1, 2 und 3 berechnen und beurteilen',
    'Eigenkapital-, Gesamtkapitalrentabilität und Umsatzrendite berechnen',
    'Cashflow berechnen und erklären (direkte Methode)',
    'Richtwerte kennen und Kennzahlen interpretieren',
  ],
  terms: [
    { term: 'Liquiditätsgrad 1 (Cash Ratio)', def: 'Flüssige Mittel / kurzfristiges FK. Richtwert: mind. 20%.' },
    { term: 'Liquiditätsgrad 2 (Quick Ratio)', def: '(FM + Forderungen) / kurzfristiges FK. Richtwert: mind. 100%.' },
    { term: 'Liquiditätsgrad 3 (Current Ratio)', def: 'Umlaufvermögen / kurzfristiges FK. Richtwert: mind. 150%.' },
    { term: 'Eigenkapitalrentabilität (EKR)', def: 'Reingewinn / EK — Rendite der Eigentümer.' },
    { term: 'Gesamtkapitalrentabilität (GKR)', def: '(Reingewinn + FK-Zinsen) / GK — Rendite des gesamten eingesetzten Kapitals.' },
    { term: 'Umsatzrendite (UR)', def: 'Reingewinn / Umsatz — Gewinnmarge pro CHF Umsatz.' },
    { term: 'Cashflow', def: 'Reingewinn + Abschreibungen + Rückstellungserhöhungen — interne Mittelgenerierung.' },
  ],
  corePoints: [
    'Liquiditätsgrad 1 < 20%: Gefahr der Zahlungsunfähigkeit.',
    'Liquiditätsgrad 2 < 100%: Umlaufvermögen ohne Vorräte deckt kurzfristiges FK nicht.',
    'Liquiditätsgrad 3 < 150%: Umlaufvermögen deckt kurzfristiges FK kaum.',
    'Cashflow: kein Aufwand, kein Mittelabfluss → Abschreibungen addieren.',
    'GKR > Fremdkapitalzins = Unternehmen erzielt Mehrwert (positiver Leverage-Effekt).',
  ],
})

await seed('bilanzanalyse', {
  summary: `Die Bilanzstrukturanalyse beurteilt, wie das Unternehmen finanziert ist und wie seine Vermögenswerte aufgeteilt sind. Eigenfinanzierungsgrad = EK / GK (Richtwert mind. 30–40%). Verschuldungsgrad = FK / EK (max. 2–3). Anlageintensität = AV / GK. Die Goldene Bilanzregel verlangt, dass das Anlagevermögen langfristig finanziert ist: durch Eigenkapital und langfristiges Fremdkapital. Deckungsgrad 2 = (EK + langfristiges FK) / AV — dieser sollte mindestens 100% betragen.`,
  goals: [
    'Eigenfinanzierungsgrad und Verschuldungsgrad berechnen und beurteilen',
    'Anlageintensität berechnen',
    'Goldene Bilanzregel und Deckungsgrad 2 prüfen',
    'Kapital- und Vermögensstruktur einer Bilanz analysieren',
  ],
  terms: [
    { term: 'Eigenfinanzierungsgrad', def: 'EK / GK — Anteil des Eigenkapitals am Gesamtkapital. Richtwert mind. 30–40%.' },
    { term: 'Verschuldungsgrad', def: 'FK / EK — Verhältnis Fremd- zu Eigenkapital. Richtwert max. 2–3.' },
    { term: 'Anlageintensität', def: 'AV / GK — Anteil des Anlagevermögens am Gesamtkapital.' },
    { term: 'Goldene Bilanzregel', def: 'Anlagevermögen durch langfristiges Kapital (EK + langfristiges FK) finanzieren.' },
    { term: 'Deckungsgrad 2', def: '(EK + langfristiges FK) / AV — Richtwert mind. 100%.' },
  ],
  corePoints: [
    'Eigenfinanzierungsgrad < 30%: hohe Abhängigkeit von Fremdkapital.',
    'Deckungsgrad 2 < 100%: AV teilweise kurzfristig finanziert — risikohaft.',
    'Hohe Anlageintensität → gebundenes Kapital, wenig Flexibilität.',
    'Eigenfinanzierungsgrad + Fremdfinanzierungsgrad = 100%.',
  ],
})

await client.end()
console.log('\n✅ Alle FRW Theoriedaten erfolgreich geseedet!')
